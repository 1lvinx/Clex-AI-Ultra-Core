/**
 * Agent Communication - Agent 通信机制
 * 
 * 实现 Agent 之间的高效通信和协作
 */

const EventEmitter = require('events');

// 消息类型
const MessageType = {
  DIRECT: 'direct',
  BROADCAST: 'broadcast',
  REQUEST: 'request',
  RESPONSE: 'response',
  NOTIFICATION: 'notification',
  URGENT: 'urgent'
};

// 消息优先级
const MessagePriority = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  URGENT: 3
};

// 消息状态
const MessageStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

/**
 * 消息类
 */
class Message {
  constructor({
    id = null,
    type = MessageType.DIRECT,
    from,
    to = null,
    topic = null,
    content,
    priority = MessagePriority.NORMAL,
    metadata = {}
  }) {
    this.id = id || this.generateId();
    this.type = type;
    this.from = from;
    this.to = to;
    this.topic = topic;
    this.content = content;
    this.priority = priority;
    this.metadata = metadata;
    this.status = MessageStatus.PENDING;
    this.createdAt = Date.now();
    this.sentAt = null;
    this.deliveredAt = null;
    this.readAt = null;
    this.responseTo = null; // 如果是响应消息，指向原消息 ID
  }

  generateId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  markSent() {
    this.status = MessageStatus.SENT;
    this.sentAt = Date.now();
  }

  markDelivered() {
    this.status = MessageStatus.DELIVERED;
    this.deliveredAt = Date.now();
  }

  markRead() {
    this.status = MessageStatus.READ;
    this.readAt = Date.now();
  }

  markFailed(reason) {
    this.status = MessageStatus.FAILED;
    this.metadata.failureReason = reason;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      from: this.from,
      to: this.to,
      topic: this.topic,
      content: this.content,
      priority: this.priority,
      status: this.status,
      metadata: this.metadata,
      timestamps: {
        createdAt: new Date(this.createdAt).toISOString(),
        sentAt: this.sentAt ? new Date(this.sentAt).toISOString() : null,
        deliveredAt: this.deliveredAt ? new Date(this.deliveredAt).toISOString() : null,
        readAt: this.readAt ? new Date(this.readAt).toISOString() : null
      }
    };
  }
}

/**
 * 消息队列
 */
class MessageQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.messages = [];
    this.maxSize = options.maxSize || 1000;
    this.processingDelay = options.processingDelay || 0;
  }

  /**
   * 入队消息
   */
  enqueue(message) {
    if (this.messages.length >= this.maxSize) {
      // 移除最低优先级的消息
      this.removeLowestPriority();
    }

    this.messages.push(message);
    this.messages.sort((a, b) => {
      // 按优先级降序，同优先级按时间升序
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt - b.createdAt;
    });

    this.emit('message:queued', message);
    
    return message;
  }

  /**
   * 出队消息
   */
  dequeue() {
    const message = this.messages.shift();
    
    if (message) {
      this.emit('message:dequeued', message);
    }
    
    return message;
  }

  /**
   * 查看队首消息
   */
  peek() {
    return this.messages[0];
  }

  /**
   * 移除最低优先级的消息
   */
  removeLowestPriority() {
    if (this.messages.length === 0) return null;

    // 找到优先级最低的消息（数组末尾）
    const removed = this.messages.pop();
    this.emit('message:dropped', removed);
    
    return removed;
  }

  /**
   * 获取队列长度
   */
  size() {
    return this.messages.length;
  }

  /**
   * 清空队列
   */
  clear() {
    const count = this.messages.length;
    this.messages = [];
    this.emit('queue:cleared', count);
    
    return count;
  }

  /**
   * 获取队列统计
   */
  getStats() {
    const byPriority = {
      [MessagePriority.URGENT]: 0,
      [MessagePriority.HIGH]: 0,
      [MessagePriority.NORMAL]: 0,
      [MessagePriority.LOW]: 0
    };

    for (const msg of this.messages) {
      byPriority[msg.priority]++;
    }

    return {
      size: this.messages.length,
      maxSize: this.maxSize,
      byPriority
    };
  }
}

/**
 * 发布/订阅管理器
 */
class PubSubManager extends EventEmitter {
  constructor() {
    super();
    
    this.subscriptions = new Map(); // topic -> Set<agentId>
  }

  /**
   * 订阅主题
   */
  subscribe(agentId, topic) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }

    this.subscriptions.get(topic).add(agentId);
    
    this.emit('subscription:added', { agentId, topic });
    
    return this.subscriptions.get(topic).size;
  }

  /**
   * 取消订阅
   */
  unsubscribe(agentId, topic) {
    const subscribers = this.subscriptions.get(topic);
    
    if (subscribers) {
      subscribers.delete(agentId);
      
      if (subscribers.size === 0) {
        this.subscriptions.delete(topic);
      }
      
      this.emit('subscription:removed', { agentId, topic });
    }
    
    return subscribers?.size || 0;
  }

  /**
   * 获取主题的订阅者
   */
  getSubscribers(topic) {
    return Array.from(this.subscriptions.get(topic) || []);
  }

  /**
   * 获取 Agent 订阅的所有主题
   */
  getAgentSubscriptions(agentId) {
    const topics = [];
    
    for (const [topic, subscribers] of this.subscriptions.entries()) {
      if (subscribers.has(agentId)) {
        topics.push(topic);
      }
    }
    
    return topics;
  }

  /**
   * 发布消息到主题
   */
  publish(topic, message) {
    const subscribers = this.getSubscribers(topic);
    
    this.emit('message:published', {
      topic,
      message,
      subscriberCount: subscribers.length
    });
    
    return {
      topic,
      message,
      deliveredTo: subscribers
    };
  }

  /**
   * 获取所有主题
   */
  getTopics() {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * 获取统计
   */
  getStats() {
    return {
      totalTopics: this.subscriptions.size,
      topics: Array.from(this.subscriptions.entries()).map(([topic, subs]) => ({
        topic,
        subscriberCount: subs.size
      }))
    };
  }
}

/**
 * 请求/响应管理器
 */
class RequestResponseManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.pendingRequests = new Map();
    this.defaultTimeout = options.defaultTimeout || 30000;
  }

  /**
   * 创建请求
   */
  createRequest(message, callback) {
    const requestId = message.id;
    
    this.pendingRequests.set(requestId, {
      message,
      callback,
      createdAt: Date.now(),
      timeoutId: null
    });

    // 设置超时
    const timeoutId = setTimeout(() => {
      this.handleTimeout(requestId);
    }, this.defaultTimeout);

    const request = this.pendingRequests.get(requestId);
    request.timeoutId = timeoutId;

    this.emit('request:created', { requestId, message });

    return requestId;
  }

  /**
   * 处理响应
   */
  handleResponse(responseMessage) {
    const requestId = responseMessage.responseTo;
    const request = this.pendingRequests.get(requestId);

    if (!request) {
      console.warn(`Request ${requestId} not found`);
      return false;
    }

    // 清除超时
    if (request.timeoutId) {
      clearTimeout(request.timeoutId);
    }

    this.pendingRequests.delete(requestId);
    
    // 调用回调
    if (request.callback) {
      request.callback(null, responseMessage);
    }

    this.emit('response:received', { requestId, response: responseMessage });

    return true;
  }

  /**
   * 处理超时
   */
  handleTimeout(requestId) {
    const request = this.pendingRequests.get(requestId);

    if (request) {
      this.pendingRequests.delete(requestId);
      
      if (request.callback) {
        request.callback(new Error('Request timeout'));
      }

      this.emit('request:timeout', { requestId });
    }
  }

  /**
   * 获取待处理的请求
   */
  getPendingRequests() {
    return Array.from(this.pendingRequests.values()).map(r => ({
      id: r.message.id,
      message: r.message,
      age: Date.now() - r.createdAt
    }));
  }

  /**
   * 取消请求
   */
  cancelRequest(requestId) {
    const request = this.pendingRequests.get(requestId);

    if (request) {
      if (request.timeoutId) {
        clearTimeout(request.timeoutId);
      }

      this.pendingRequests.delete(requestId);
      this.emit('request:cancelled', { requestId });
      
      return true;
    }

    return false;
  }

  /**
   * 获取统计
   */
  getStats() {
    const pending = this.getPendingRequests();
    const avgAge = pending.length > 0
      ? pending.reduce((sum, r) => sum + r.age, 0) / pending.length
      : 0;

    return {
      pendingCount: pending.length,
      avgAge,
      defaultTimeout: this.defaultTimeout
    };
  }
}

/**
 * 通信管理器
 */
class CommunicationManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.messageQueue = new MessageQueue(options.queue);
    this.pubSub = new PubSubManager();
    this.requestResponse = new RequestResponseManager(options.requestResponse);
    
    this.messageHistory = [];
    this.maxHistoryLength = options.maxHistoryLength || 1000;
    
    this.agents = new Map(); // agentId -> { status, lastSeen }
    
    this.storagePath = options.storagePath || this.getDefaultStoragePath();
    
    this.load();
  }

  getDefaultStoragePath() {
    const path = require('path');
    const workspace = process.env.OPENCLAW_WORKSPACE || process.cwd();
    return path.join(workspace, '.agent-communication.json');
  }

  /**
   * 注册 Agent
   */
  registerAgent(agentId, metadata = {}) {
    this.agents.set(agentId, {
      id: agentId,
      status: 'online',
      lastSeen: Date.now(),
      metadata
    });

    this.emit('agent:registered', { agentId, metadata });
    
    return this.agents.get(agentId);
  }

  /**
   * 注销 Agent
   */
  unregisterAgent(agentId) {
    this.agents.delete(agentId);
    this.emit('agent:unregistered', { agentId });
  }

  /**
   * 发送直接消息
   */
  sendDirectMessage(from, to, content, options = {}) {
    const message = new Message({
      type: MessageType.DIRECT,
      from,
      to,
      content,
      priority: options.priority || MessagePriority.NORMAL,
      metadata: options.metadata
    });

    return this.sendMessage(message);
  }

  /**
   * 广播消息
   */
  broadcast(from, content, options = {}) {
    const message = new Message({
      type: MessageType.BROADCAST,
      from,
      content,
      priority: options.priority || MessagePriority.NORMAL,
      metadata: options.metadata
    });

    return this.sendMessage(message);
  }

  /**
   * 发布到主题
   */
  publish(from, topic, content, options = {}) {
    const message = new Message({
      type: MessageType.NOTIFICATION,
      from,
      topic,
      content,
      priority: options.priority || MessagePriority.NORMAL,
      metadata: options.metadata
    });

    const result = this.pubSub.publish(topic, message);
    
    // 将消息发送给所有订阅者
    for (const subscriber of result.deliveredTo) {
      const subscriberMessage = new Message({
        ...message,
        to: subscriber
      });
      this.sendMessage(subscriberMessage);
    }

    return result;
  }

  /**
   * 发送请求
   */
  sendRequest(from, to, content, callback, options = {}) {
    const message = new Message({
      type: MessageType.REQUEST,
      from,
      to,
      content,
      priority: options.priority || MessagePriority.HIGH,
      metadata: options.metadata
    });

    const requestId = this.requestResponse.createRequest(message, callback);
    
    return this.sendMessage(message);
  }

  /**
   * 发送响应
   */
  sendResponse(from, originalMessageId, content, options = {}) {
    const message = new Message({
      type: MessageType.RESPONSE,
      from,
      responseTo: originalMessageId,
      content,
      priority: options.priority || MessagePriority.NORMAL,
      metadata: options.metadata
    });

    this.requestResponse.handleResponse(message);
    
    return this.sendMessage(message);
  }

  /**
   * 发送消息（内部方法）
   */
  sendMessage(message) {
    // 检查接收者是否存在
    if (message.to && !this.agents.has(message.to)) {
      message.markFailed('Recipient not found');
      return message;
    }

    // 标记为已发送
    message.markSent();
    
    // 添加到队列
    this.messageQueue.enqueue(message);
    
    // 添加到历史
    this.addToHistory(message);
    
    // 触发事件
    this.emit('message:sent', message);

    // 模拟投递（实际应用中需要真实的投递机制）
    setTimeout(() => {
      message.markDelivered();
      this.emit('message:delivered', message);
    }, 100);

    return message;
  }

  /**
   * 订阅主题
   */
  subscribe(agentId, topic) {
    return this.pubSub.subscribe(agentId, topic);
  }

  /**
   * 取消订阅
   */
  unsubscribe(agentId, topic) {
    return this.pubSub.unsubscribe(agentId, topic);
  }

  /**
   * 标记消息已读
   */
  markAsRead(messageId) {
    const message = this.findMessage(messageId);
    
    if (message) {
      message.markRead();
      this.emit('message:read', message);
      return true;
    }
    
    return false;
  }

  /**
   * 添加到历史
   */
  addToHistory(message) {
    this.messageHistory.push(message);
    
    if (this.messageHistory.length > this.maxHistoryLength) {
      this.messageHistory.shift();
    }
  }

  /**
   * 查找消息
   */
  findMessage(messageId) {
    return this.messageHistory.find(m => m.id === messageId);
  }

  /**
   * 获取消息历史
   */
  getMessageHistory(agentId = null, limit = 50) {
    let messages = this.messageHistory;

    if (agentId) {
      messages = messages.filter(m => 
        m.from === agentId || m.to === agentId
      );
    }

    return messages
      .slice(-limit)
      .reverse()
      .map(m => m.toJSON());
  }

  /**
   * 处理队列中的消息
   */
  processQueue() {
    const processed = [];
    
    while (this.messageQueue.size() > 0) {
      const message = this.messageQueue.dequeue();
      
      if (message) {
        // 实际应用中这里需要真实的投递逻辑
        processed.push(message);
        this.emit('message:processed', message);
      }
    }
    
    return processed;
  }

  /**
   * 获取统计
   */
  getStats() {
    return {
      agents: {
        total: this.agents.size,
        online: Array.from(this.agents.values()).filter(a => a.status === 'online').length
      },
      queue: this.messageQueue.getStats(),
      pubSub: this.pubSub.getStats(),
      requests: this.requestResponse.getStats(),
      history: {
        total: this.messageHistory.length,
        max: this.maxHistoryLength
      }
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
      history: this.messageHistory.slice(-100).map(m => m.toJSON())
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
      
      // 恢复最近的消息历史
      for (const msgJson of data.history || []) {
        const message = new Message(msgJson);
        this.messageHistory.push(message);
      }
      
      console.log(`Loaded ${this.messageHistory.length} messages from history`);
    } catch (error) {
      console.error(`Failed to load communication data: ${error.message}`);
    }
  }
}

// 导出
module.exports = {
  MessageType,
  MessagePriority,
  MessageStatus,
  Message,
  MessageQueue,
  PubSubManager,
  RequestResponseManager,
  CommunicationManager
};
