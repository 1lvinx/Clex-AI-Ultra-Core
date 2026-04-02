/**
 * MCP Integration - 服务层
 * 
 * 封装 MCP 工具调用、资源读取、提示词等功能
 */

const { MCPConnectionManager, TransportType, ConnectionState } = require('./index');

/**
 * MCP 工具服务
 */
class MCPToolService {
  constructor(connectionManager) {
    this.manager = connectionManager;
    this.toolCache = new Map();
    this.callHistory = [];
    this.maxHistoryLength = 100;
  }

  /**
   * 刷新工具缓存
   */
  refreshToolCache() {
    this.toolCache.clear();
    
    for (const [name, client] of this.manager.clients.entries()) {
      for (const [toolName, tool] of client.tools.entries()) {
        this.toolCache.set(`${name}:${toolName}`, {
          server: name,
          ...tool
        });
      }
    }
  }

  /**
   * 列出所有工具
   */
  listTools(serverFilter = null) {
    if (serverFilter) {
      const client = this.manager.getConnection(serverFilter);
      if (!client) {
        throw new Error(`服务器 ${serverFilter} 不存在`);
      }
      return Array.from(client.tools.values());
    }

    return this.manager.getAllTools();
  }

  /**
   * 搜索工具
   */
  searchTools(query, options = {}) {
    const {
      limit = 20,
      serverFilter = null
    } = options;

    const tools = this.listTools(serverFilter);
    const queryLower = query.toLowerCase();

    const matched = tools.filter(tool => {
      const searchText = `${tool.name} ${tool.description || ''}`.toLowerCase();
      return searchText.includes(queryLower);
    });

    return matched.slice(0, limit);
  }

  /**
   * 调用工具
   */
  async callTool(server, toolName, args, options = {}) {
    const {
      timeout = 30000,
      retries = 0
    } = options;

    const startTime = Date.now();
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.manager.callTool(server, toolName, args);
        
        const callRecord = {
          server,
          tool: toolName,
          args,
          result,
          duration: Date.now() - startTime,
          timestamp: Date.now(),
          success: true
        };

        this.recordCall(callRecord);
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt < retries) {
          await this.delay(1000 * (attempt + 1));
        }
      }
    }

    const callRecord = {
      server,
      tool: toolName,
      args,
      error: lastError.message,
      duration: Date.now() - startTime,
      timestamp: Date.now(),
      success: false
    };

    this.recordCall(callRecord);
    throw lastError;
  }

  /**
   * 批量调用工具
   */
  async batchCallTool(calls, options = {}) {
    const {
      parallel = false,
      stopOnError = true
    } = options;

    const results = [];

    if (parallel) {
      // 并行调用
      const promises = calls.map(async (call) => {
        try {
          const result = await this.callTool(call.server, call.tool, call.args);
          return { success: true, ...call, result };
        } catch (error) {
          return { success: false, ...call, error: error.message };
        }
      });

      return await Promise.all(promises);
    } else {
      // 串行调用
      for (const call of calls) {
        try {
          const result = await this.callTool(call.server, call.tool, call.args);
          results.push({ success: true, ...call, result });
        } catch (error) {
          results.push({ success: false, ...call, error: error.message });
          
          if (stopOnError) {
            break;
          }
        }
      }

      return results;
    }
  }

  /**
   * 记录调用历史
   */
  recordCall(record) {
    this.callHistory.push(record);
    
    if (this.callHistory.length > this.maxHistoryLength) {
      this.callHistory.shift();
    }
  }

  /**
   * 获取调用历史
   */
  getHistory(options = {}) {
    const {
      serverFilter = null,
      toolFilter = null,
      successFilter = null,
      limit = 50
    } = options;

    let history = this.callHistory;

    if (serverFilter) {
      history = history.filter(r => r.server === serverFilter);
    }

    if (toolFilter) {
      history = history.filter(r => r.tool === toolFilter);
    }

    if (successFilter !== null) {
      history = history.filter(r => r.success === successFilter);
    }

    return history.slice(-limit).reverse();
  }

  /**
   * 获取统计
   */
  getStats() {
    const history = this.callHistory;
    
    const total = history.length;
    const successful = history.filter(r => r.success).length;
    const failed = total - successful;
    const avgDuration = total > 0
      ? history.reduce((sum, r) => sum + r.duration, 0) / total
      : 0;

    const byServer = {};
    const byTool = {};

    for (const record of history) {
      byServer[record.server] = (byServer[record.server] || 0) + 1;
      byTool[record.tool] = (byTool[record.tool] || 0) + 1;
    }

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgDuration,
      byServer,
      byTool
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * MCP 资源服务
 */
class MCPResourceService {
  constructor(connectionManager) {
    this.manager = connectionManager;
    this.resourceCache = new Map();
    this.readHistory = [];
  }

  /**
   * 列出所有资源
   */
  listResources(serverFilter = null) {
    if (serverFilter) {
      const client = this.manager.getConnection(serverFilter);
      if (!client) {
        throw new Error(`服务器 ${serverFilter} 不存在`);
      }
      return Array.from(client.resources.values());
    }

    const allResources = [];
    
    for (const [name, client] of this.manager.clients.entries()) {
      for (const resource of client.resources.values()) {
        allResources.push({
          server: name,
          ...resource
        });
      }
    }
    
    return allResources;
  }

  /**
   * 搜索资源
   */
  searchResources(query, options = {}) {
    const {
      limit = 20,
      serverFilter = null
    } = options;

    const resources = this.listResources(serverFilter);
    const queryLower = query.toLowerCase();

    const matched = resources.filter(resource => {
      const searchText = `${resource.name} ${resource.description || ''} ${resource.uri}`.toLowerCase();
      return searchText.includes(queryLower);
    });

    return matched.slice(0, limit);
  }

  /**
   * 读取资源
   */
  async readResource(server, uri, options = {}) {
    const result = await this.manager.readResource(server, uri);
    
    const readRecord = {
      server,
      uri,
      result,
      timestamp: Date.now()
    };

    this.readHistory.push(readRecord);
    
    // 缓存资源
    this.resourceCache.set(`${server}:${uri}`, {
      ...readRecord,
      cachedAt: Date.now()
    });

    return result;
  }

  /**
   * 从缓存读取资源
   */
  readCached(server, uri, maxAge = 60000) {
    const cached = this.resourceCache.get(`${server}:${uri}`);
    
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.cachedAt > maxAge) {
      this.resourceCache.delete(`${server}:${uri}`);
      return null;
    }

    return cached.result;
  }

  /**
   * 获取读取历史
   */
  getHistory(limit = 50) {
    return this.readHistory.slice(-limit).reverse();
  }

  /**
   * 清除缓存
   */
  clearCache(server = null, uri = null) {
    if (server && uri) {
      this.resourceCache.delete(`${server}:${uri}`);
    } else if (server) {
      for (const key of this.resourceCache.keys()) {
        if (key.startsWith(`${server}:`)) {
          this.resourceCache.delete(key);
        }
      }
    } else {
      this.resourceCache.clear();
    }
  }
}

/**
 * MCP 提示词服务
 */
class MCPPromptService {
  constructor(connectionManager) {
    this.manager = connectionManager;
  }

  /**
   * 列出所有提示词
   */
  listPrompts(serverFilter = null) {
    if (serverFilter) {
      const client = this.manager.getConnection(serverFilter);
      if (!client) {
        throw new Error(`服务器 ${serverFilter} 不存在`);
      }
      return Array.from(client.prompts.values());
    }

    const allPrompts = [];
    
    for (const [name, client] of this.manager.clients.entries()) {
      for (const prompt of client.prompts.values()) {
        allPrompts.push({
          server: name,
          ...prompt
        });
      }
    }
    
    return allPrompts;
  }

  /**
   * 搜索提示词
   */
  searchPrompts(query, options = {}) {
    const {
      limit = 20,
      serverFilter = null
    } = options;

    const prompts = this.listPrompts(serverFilter);
    const queryLower = query.toLowerCase();

    const matched = prompts.filter(prompt => {
      const searchText = `${prompt.name} ${prompt.description || ''}`.toLowerCase();
      return searchText.includes(queryLower);
    });

    return matched.slice(0, limit);
  }

  /**
   * 获取提示词
   */
  async getPrompt(server, name, args = {}) {
    const client = this.manager.getConnection(server);
    
    if (!client) {
      throw new Error(`服务器 ${server} 不存在`);
    }

    return await client.getPrompt(name, args);
  }

  /**
   * 渲染提示词
   */
  async renderPrompt(server, name, args = {}) {
    const result = await this.getPrompt(server, name, args);
    
    // 处理提示词消息
    const messages = result.messages || [];
    
    return messages.map(msg => ({
      role: msg.role,
      content: this.formatContent(msg.content)
    }));
  }

  /**
   * 格式化内容
   */
  formatContent(content) {
    if (typeof content === 'string') {
      return content;
    }

    if (content.type === 'text') {
      return content.text;
    }

    if (content.type === 'image') {
      return `[Image: ${content.mimeType}]`;
    }

    return JSON.stringify(content);
  }
}

/**
 * MCP 统一服务层
 */
class MCPService {
  constructor(options = {}) {
    this.manager = new MCPConnectionManager(options);
    this.tools = new MCPToolService(this.manager);
    this.resources = new MCPResourceService(this.manager);
    this.prompts = new MCPPromptService(this.manager);
  }

  /**
   * 连接服务器
   */
  async connect(name, type, config, options = {}) {
    const client = this.manager.createConnection(name, type, config, options);
    await client.connect();
    
    return client.getStatus();
  }

  /**
   * 断开连接
   */
  async disconnect(name) {
    await this.manager.disconnect(name);
  }

  /**
   * 获取所有连接状态
   */
  getConnections() {
    return this.manager.listConnections();
  }

  /**
   * 获取完整统计
   */
  getStats() {
    return {
      connections: this.manager.getStats(),
      tools: this.tools.getStats(),
      resources: {
        cached: this.resources.resourceCache.size,
        historyLength: this.resources.readHistory.length
      },
      prompts: {
        total: this.prompts.listPrompts().length
      }
    };
  }
}

// 导出
module.exports = {
  MCPToolService,
  MCPResourceService,
  MCPPromptService,
  MCPService
};
