/**
 * MCP Integration - MCP 集成
 * 
 * 实现 Model Context Protocol (MCP) 客户端
 */

const EventEmitter = require('events');
const { spawn } = require('child_process');

// MCP 协议版本
const MCP_VERSIONS = [
  '2024-11-05',
  '2024-10-07',
  '1.0'
];

// 传输类型
const TransportType = {
  STDIO: 'stdio',
  WEBSOCKET: 'websocket',
  SSE: 'sse'
};

// 连接状态
const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
};

/**
 * MCP 消息类
 */
class MCPMessage {
  constructor({
    jsonrpc = '2.0',
    id = null,
    method,
    params = {},
    result = null,
    error = null
  }) {
    this.jsonrpc = jsonrpc;
    this.id = id || this.generateId();
    this.method = method;
    this.params = params;
    this.result = result;
    this.error = error;
  }

  generateId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建请求
   */
  static createRequest(method, params, id = null) {
    return new MCPMessage({
      id,
      method,
      params
    });
  }

  /**
   * 创建响应
   */
  static createResponse(id, result) {
    return new MCPMessage({
      id,
      result
    });
  }

  /**
   * 创建错误响应
   */
  static createError(id, code, message, data = null) {
    const msg = new MCPMessage({
      id,
      error: {
        code,
        message,
        data
      }
    });
    return msg;
  }

  toJSON() {
    return {
      jsonrpc: this.jsonrpc,
      id: this.id,
      method: this.method,
      params: this.params,
      result: this.result,
      error: this.error
    };
  }

  static fromJSON(json) {
    return new MCPMessage(json);
  }
}

/**
 * Stdio 传输层
 */
class StdioTransport extends EventEmitter {
  constructor(command, args = [], options = {}) {
    super();
    
    this.command = command;
    this.args = args;
    this.options = options;
    this.process = null;
    this.state = ConnectionState.DISCONNECTED;
    this.buffer = '';
  }

  /**
   * 连接
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.state = ConnectionState.CONNECTING;
        
        this.process = spawn(this.command, this.args, {
          stdio: ['pipe', 'pipe', 'pipe'],
          ...this.options
        });

        this.process.stdout.on('data', (data) => {
          this.handleData(data.toString());
        });

        this.process.stderr.on('data', (data) => {
          this.emit('stderr', data.toString());
        });

        this.process.on('error', (error) => {
          this.state = ConnectionState.ERROR;
          this.emit('error', error);
          reject(error);
        });

        this.process.on('close', (code) => {
          this.state = ConnectionState.DISCONNECTED;
          this.emit('close', code);
        });

        this.process.on('spawn', () => {
          this.state = ConnectionState.CONNECTED;
          resolve();
        });

      } catch (error) {
        this.state = ConnectionState.ERROR;
        reject(error);
      }
    });
  }

  /**
   * 处理接收到的数据
   */
  handleData(data) {
    this.buffer += data;
    
    // 按行分割 JSON-RPC 消息
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || ''; // 保留最后不完整的一行

    for (const line of lines) {
      if (line.trim()) {
        try {
          const message = JSON.parse(line);
          this.emit('message', message);
        } catch (error) {
          this.emit('parseError', { line, error });
        }
      }
    }
  }

  /**
   * 发送消息
   */
  send(message) {
    if (!this.process || this.state !== ConnectionState.CONNECTED) {
      throw new Error('Not connected');
    }

    const json = JSON.stringify(message) + '\n';
    this.process.stdin.write(json);
  }

  /**
   * 断开连接
   */
  async disconnect() {
    return new Promise((resolve) => {
      if (this.process) {
        this.process.on('close', resolve);
        this.process.kill();
        this.process = null;
      } else {
        resolve();
      }
      this.state = ConnectionState.DISCONNECTED;
    });
  }
}

/**
 * WebSocket 传输层
 */
class WebSocketTransport extends EventEmitter {
  constructor(url, options = {}) {
    super();
    
    this.url = url;
    this.options = options;
    this.ws = null;
    this.state = ConnectionState.DISCONNECTED;
  }

  /**
   * 连接
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.state = ConnectionState.CONNECTING;
        
        // 动态导入 WebSocket
        const WebSocket = require('ws');
        this.ws = new WebSocket(this.url, this.options.protocols, this.options);

        this.ws.on('open', () => {
          this.state = ConnectionState.CONNECTED;
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.emit('message', message);
          } catch (error) {
            this.emit('parseError', { data, error });
          }
        });

        this.ws.on('error', (error) => {
          this.state = ConnectionState.ERROR;
          this.emit('error', error);
          reject(error);
        });

        this.ws.on('close', (code, reason) => {
          this.state = ConnectionState.DISCONNECTED;
          this.emit('close', { code, reason });
        });

      } catch (error) {
        this.state = ConnectionState.ERROR;
        reject(error);
      }
    });
  }

  /**
   * 发送消息
   */
  send(message) {
    if (!this.ws || this.state !== ConnectionState.CONNECTED) {
      throw new Error('Not connected');
    }

    const json = JSON.stringify(message);
    this.ws.send(json);
  }

  /**
   * 断开连接
   */
  async disconnect() {
    return new Promise((resolve) => {
      if (this.ws) {
        this.ws.on('close', resolve);
        this.ws.close();
        this.ws = null;
      } else {
        resolve();
      }
      this.state = ConnectionState.DISCONNECTED;
    });
  }
}

/**
 * MCP 客户端
 */
class MCPClient extends EventEmitter {
  constructor(name, transport, options = {}) {
    super();
    
    this.name = name;
    this.transport = transport;
    this.options = options;
    this.state = ConnectionState.DISCONNECTED;
    
    this.serverInfo = null;
    this.capabilities = {};
    this.tools = new Map();
    this.resources = new Map();
    this.prompts = new Map();
    
    this.pendingRequests = new Map();
    this.requestTimeout = options.requestTimeout || 30000;
    
    this.autoReconnect = options.autoReconnect !== false;
    this.reconnectDelay = options.reconnectDelay || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectAttempts = 0;
    
    this.setupTransportListeners();
  }

  /**
   * 设置传输层监听器
   */
  setupTransportListeners() {
    this.transport.on('message', (message) => {
      this.handleMessage(message);
    });

    this.transport.on('error', (error) => {
      this.state = ConnectionState.ERROR;
      this.emit('error', { client: this.name, error });
      
      if (this.autoReconnect) {
        this.attemptReconnect();
      }
    });

    this.transport.on('close', () => {
      this.state = ConnectionState.DISCONNECTED;
      this.emit('disconnected', { client: this.name });
      
      if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    });
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(message) {
    // 响应消息
    if (message.id) {
      const pending = this.pendingRequests.get(message.id);
      
      if (pending) {
        this.pendingRequests.delete(message.id);
        clearTimeout(pending.timeoutId);
        
        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result);
        }
      }
    }
    
    // 通知消息
    if (message.method) {
      this.emit('notification', {
        method: message.method,
        params: message.params
      });
    }
  }

  /**
   * 尝试重连
   */
  async attemptReconnect() {
    this.reconnectAttempts++;
    this.state = ConnectionState.RECONNECTING;
    
    this.emit('reconnecting', {
      client: this.name,
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts
    });

    setTimeout(async () => {
      try {
        await this.connect();
        this.reconnectAttempts = 0;
      } catch (error) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.emit('error', {
            client: this.name,
            error: new Error('Max reconnect attempts reached')
          });
        }
      }
    }, this.reconnectDelay);
  }

  /**
   * 连接
   */
  async connect() {
    try {
      await this.transport.connect();
      this.state = ConnectionState.CONNECTED;
      this.reconnectAttempts = 0;
      
      // 初始化握手
      await this.initialize();
      
      this.emit('connected', { client: this.name, serverInfo: this.serverInfo });
      
      return this.serverInfo;
    } catch (error) {
      this.state = ConnectionState.ERROR;
      throw error;
    }
  }

  /**
   * 初始化握手
   */
  async initialize() {
    const result = await this.sendRequest('initialize', {
      protocolVersion: MCP_VERSIONS[0],
      capabilities: {
        roots: { listChanged: true },
        sampling: {}
      },
      clientInfo: {
        name: 'OpenClaw',
        version: '1.0.0'
      }
    });

    this.serverInfo = result.serverInfo;
    this.capabilities = result.capabilities || {};

    // 发送 initialized 通知
    this.transport.send({
      jsonrpc: '2.0',
      method: 'notifications/initialized'
    });

    // 获取工具、资源、提示词
    await this.discoverCapabilities();

    return result;
  }

  /**
   * 发现服务器能力
   */
  async discoverCapabilities() {
    // 获取工具列表
    if (this.capabilities.tools) {
      try {
        const toolsResult = await this.sendRequest('tools/list', {});
        for (const tool of toolsResult.tools || []) {
          this.tools.set(tool.name, tool);
        }
        this.emit('tools:discovered', Array.from(this.tools.values()));
      } catch (error) {
        console.error(`Failed to list tools for ${this.name}:`, error);
      }
    }

    // 获取资源列表
    if (this.capabilities.resources) {
      try {
        const resourcesResult = await this.sendRequest('resources/list', {});
        for (const resource of resourcesResult.resources || []) {
          this.resources.set(resource.uri, resource);
        }
        this.emit('resources:discovered', Array.from(this.resources.values()));
      } catch (error) {
        console.error(`Failed to list resources for ${this.name}:`, error);
      }
    }

    // 获取提示词列表
    if (this.capabilities.prompts) {
      try {
        const promptsResult = await this.sendRequest('prompts/list', {});
        for (const prompt of promptsResult.prompts || []) {
          this.prompts.set(prompt.name, prompt);
        }
        this.emit('prompts:discovered', Array.from(this.prompts.values()));
      } catch (error) {
        console.error(`Failed to list prompts for ${this.name}:`, error);
      }
    }
  }

  /**
   * 发送请求
   */
  async sendRequest(method, params = {}) {
    const message = MCPMessage.createRequest(method, params);
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(message.id);
        reject(new Error(`Request timeout: ${method}`));
      }, this.requestTimeout);

      this.pendingRequests.set(message.id, {
        resolve,
        reject,
        timeoutId,
        method
      });

      try {
        this.transport.send(message);
      } catch (error) {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(message.id);
        reject(error);
      }
    });
  }

  /**
   * 发送通知
   */
  sendNotification(method, params = {}) {
    this.transport.send({
      jsonrpc: '2.0',
      method,
      params
    });
  }

  /**
   * 调用工具
   */
  async callTool(name, args = {}) {
    const tool = this.tools.get(name);
    
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    const result = await this.sendRequest('tools/call', {
      name,
      arguments: args
    });

    this.emit('tool:called', { name, args, result });
    
    return result;
  }

  /**
   * 读取资源
   */
  async readResource(uri) {
    const result = await this.sendRequest('resources/read', {
      uri
    });

    this.emit('resource:read', { uri, result });
    
    return result;
  }

  /**
   * 获取提示词
   */
  async getPrompt(name, args = {}) {
    const result = await this.sendRequest('prompts/get', {
      name,
      arguments: args
    });

    return result;
  }

  /**
   * 断开连接
   */
  async disconnect() {
    this.autoReconnect = false;
    await this.transport.disconnect();
    this.emit('disconnected', { client: this.name });
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      serverInfo: this.serverInfo,
      capabilities: this.capabilities,
      tools: { count: this.tools.size, items: Array.from(this.tools.keys()) },
      resources: { count: this.resources.size, items: Array.from(this.resources.keys()) },
      prompts: { count: this.prompts.size, items: Array.from(this.prompts.keys()) },
      pendingRequests: this.pendingRequests.size
    };
  }
}

/**
 * MCP 连接管理器
 */
class MCPConnectionManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.clients = new Map();
    this.storagePath = options.storagePath || this.getDefaultStoragePath();
    this.maxConnections = options.maxConnections || 20;
    
    this.load();
  }

  getDefaultStoragePath() {
    const path = require('path');
    const workspace = process.env.OPENCLAW_WORKSPACE || process.cwd();
    return path.join(workspace, '.mcp-connections.json');
  }

  /**
   * 创建连接
   */
  createConnection(name, type, config, options = {}) {
    if (this.clients.size >= this.maxConnections) {
      throw new Error(`已达到最大连接数限制（${this.maxConnections}）`);
    }

    if (this.clients.has(name)) {
      throw new Error(`连接 ${name} 已存在`);
    }

    let transport;
    
    switch (type) {
      case TransportType.STDIO:
        transport = new StdioTransport(config.command, config.args || [], config.options);
        break;
      
      case TransportType.WEBSOCKET:
        transport = new WebSocketTransport(config.url, config.options);
        break;
      
      default:
        throw new Error(`不支持的传输类型：${type}`);
    }

    const client = new MCPClient(name, transport, options);
    
    // 转发事件
    client.on('connected', (data) => {
      this.emit('client:connected', { name, ...data });
    });
    
    client.on('disconnected', (data) => {
      this.emit('client:disconnected', { name, ...data });
    });
    
    client.on('error', (data) => {
      this.emit('client:error', { name, ...data });
    });
    
    client.on('tools:discovered', (tools) => {
      this.emit('tools:discovered', { name, tools });
    });

    this.clients.set(name, client);
    this.save();
    
    return client;
  }

  /**
   * 获取连接
   */
  getConnection(name) {
    return this.clients.get(name);
  }

  /**
   * 断开连接
   */
  async disconnect(name) {
    const client = this.clients.get(name);
    
    if (!client) {
      throw new Error(`连接 ${name} 不存在`);
    }

    await client.disconnect();
    this.clients.delete(name);
    this.save();
    
    this.emit('client:removed', { name });
    
    return client;
  }

  /**
   * 列出连接
   */
  listConnections() {
    return Array.from(this.clients.values()).map(c => c.getStatus());
  }

  /**
   * 调用工具（快捷方法）
   */
  async callTool(connectionName, toolName, args = {}) {
    const client = this.clients.get(connectionName);
    
    if (!client) {
      throw new Error(`连接 ${connectionName} 不存在`);
    }

    return await client.callTool(toolName, args);
  }

  /**
   * 读取资源（快捷方法）
   */
  async readResource(connectionName, uri) {
    const client = this.clients.get(connectionName);
    
    if (!client) {
      throw new Error(`连接 ${connectionName} 不存在`);
    }

    return await client.readResource(uri);
  }

  /**
   * 获取所有工具
   */
  getAllTools() {
    const allTools = [];
    
    for (const [name, client] of this.clients.entries()) {
      for (const tool of client.tools.values()) {
        allTools.push({
          server: name,
          ...tool
        });
      }
    }
    
    return allTools;
  }

  /**
   * 获取统计
   */
  getStats() {
    const clients = Array.from(this.clients.values());
    
    return {
      totalConnections: clients.length,
      byState: {
        connected: clients.filter(c => c.state === ConnectionState.CONNECTED).length,
        connecting: clients.filter(c => c.state === ConnectionState.CONNECTING).length,
        reconnecting: clients.filter(c => c.state === ConnectionState.RECONNECTING).length,
        error: clients.filter(c => c.state === ConnectionState.ERROR).length,
        disconnected: clients.filter(c => c.state === ConnectionState.DISCONNECTED).length
      },
      totalTools: clients.reduce((sum, c) => sum + c.tools.size, 0),
      totalResources: clients.reduce((sum, c) => sum + c.resources.size, 0),
      totalPrompts: clients.reduce((sum, c) => sum + c.prompts.size, 0)
    };
  }

  /**
   * 保存
   */
  save() {
    const fs = require('fs');
    const path = require('path');

    const data = {
      version: 1,
      updatedAt: new Date().toISOString(),
      connections: Array.from(this.clients.entries()).map(([name, client]) => ({
        name,
        config: client.options,
        state: client.state
      }))
    };

    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
  }

  /**
   * 加载
   */
  load() {
    const fs = require('fs');
    
    if (!fs.existsSync(this.storagePath)) {
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
      console.log(`Loaded ${data.connections?.length || 0} MCP connection configs`);
    } catch (error) {
      console.error(`Failed to load MCP connections: ${error.message}`);
    }
  }
}

// 导出
module.exports = {
  MCP_VERSIONS,
  TransportType,
  ConnectionState,
  MCPMessage,
  StdioTransport,
  WebSocketTransport,
  MCPClient,
  MCPConnectionManager
};
