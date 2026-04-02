/**
 * Task Dispatcher - 任务分配系统
 * 
 * 智能分配任务给合适的 Agent
 */

const EventEmitter = require('events');

// 任务类型
const TaskType = {
  CODING: 'coding',
  DEBUGGING: 'debugging',
  REVIEW: 'review',
  RESEARCH: 'research',
  TESTING: 'testing',
  DOCUMENTATION: 'documentation',
  GENERAL: 'general'
};

// 复杂度等级
const ComplexityLevel = {
  SIMPLE: 'simple',
  MEDIUM: 'medium',
  COMPLEX: 'complex',
  EXPERT: 'expert'
};

/**
 * 任务分析器
 */
class TaskAnalyzer {
  constructor() {
    this.typeKeywords = {
      [TaskType.CODING]: ['编写', '创建', '实现', '开发', 'function', 'class', 'component', 'feature'],
      [TaskType.DEBUGGING]: ['修复', 'debug', 'bug', '错误', '问题', 'fail', 'error', 'exception'],
      [TaskType.REVIEW]: ['审查', 'review', 'check', 'audit', '优化', '改进', 'refactor'],
      [TaskType.RESEARCH]: ['研究', '调研', '调查', 'research', 'investigate', 'learn', 'explore'],
      [TaskType.TESTING]: ['测试', 'test', 'unit test', 'integration test', 'e2e', 'spec'],
      [TaskType.DOCUMENTATION]: ['文档', 'document', 'readme', 'comment', 'annotation', 'wiki']
    };

    this.complexityKeywords = {
      [ComplexityLevel.SIMPLE]: ['简单', 'small', 'quick', 'easy', 'minor'],
      [ComplexityLevel.MEDIUM]: ['中等', 'medium', 'normal', 'regular'],
      [ComplexityLevel.COMPLEX]: ['复杂', 'complex', 'difficult', 'hard', 'major'],
      [ComplexityLevel.EXPERT]: ['专家', 'expert', 'critical', 'urgent', 'architecture']
    };

    this.skillPatterns = [
      { pattern: /javascript|js|es6/i, skill: 'javascript' },
      { pattern: /typescript|ts/i, skill: 'typescript' },
      { pattern: /python|py/i, skill: 'python' },
      { pattern: /java/i, skill: 'java' },
      { pattern: /react/i, skill: 'react' },
      { pattern: /vue/i, skill: 'vue' },
      { pattern: /angular/i, skill: 'angular' },
      { pattern: /node\.?js|nodejs/i, skill: 'nodejs' },
      { pattern: /database|sql|mongodb|mysql|postgres/i, skill: 'database' },
      { pattern: /api|rest|graphql/i, skill: 'api' },
      { pattern: /test|jest|mocha|pytest/i, skill: 'testing' },
      { pattern: /docker|kubernetes|k8s|container/i, skill: 'devops' },
      { pattern: /git|version control/i, skill: 'git' },
      { pattern: /css|html|style/i, skill: 'frontend' },
      { pattern: /security|auth|oauth/i, skill: 'security' }
    ];
  }

  /**
   * 分析任务
   */
  analyze(taskDescription) {
    const text = taskDescription.toLowerCase();
    
    return {
      type: this.detectType(text),
      complexity: this.detectComplexity(text),
      requiredSkills: this.extractSkills(text),
      estimatedTime: this.estimateTime(text),
      canParallelize: this.canParallelize(text),
      priority: this.detectPriority(text)
    };
  }

  /**
   * 检测任务类型
   */
  detectType(text) {
    const scores = {};
    
    for (const [type, keywords] of Object.entries(this.typeKeywords)) {
      scores[type] = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          scores[type]++;
        }
      }
    }

    // 返回得分最高的类型
    const bestMatch = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];

    return bestMatch && bestMatch[1] > 0 ? bestMatch[0] : TaskType.GENERAL;
  }

  /**
   * 检测复杂度
   */
  detectComplexity(text) {
    for (const [level, keywords] of Object.entries(this.complexityKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return level;
        }
      }
    }

    // 默认根据描述长度判断
    if (text.length < 20) return ComplexityLevel.SIMPLE;
    if (text.length < 50) return ComplexityLevel.MEDIUM;
    if (text.length < 100) return ComplexityLevel.COMPLEX;
    return ComplexityLevel.EXPERT;
  }

  /**
   * 提取需要的技能
   */
  extractSkills(text) {
    const skills = new Set();
    
    for (const { pattern, skill } of this.skillPatterns) {
      if (pattern.test(text)) {
        skills.add(skill);
      }
    }

    return Array.from(skills);
  }

  /**
   * 估计时间（分钟）
   */
  estimateTime(text) {
    // 检测时间关键词
    const timePatterns = [
      { pattern: /5 分钟 |5 min|quick/i, time: 5 },
      { pattern: /10 分钟 |10 min/i, time: 10 },
      { pattern: /15 分钟 |15 min/i, time: 15 },
      { pattern: /30 分钟 |30 min|half hour/i, time: 30 },
      { pattern: /1 小时|1 hour|1h/i, time: 60 },
      { pattern: /2 小时|2 hour|2h/i, time: 120 },
      { pattern: /4 小时|4 hour|4h/i, time: 240 },
      { pattern: /1 天|1 day|today/i, time: 480 }
    ];

    for (const { pattern, time } of timePatterns) {
      if (pattern.test(text)) {
        return time;
      }
    }

    // 根据复杂度估算
    const complexity = this.detectComplexity(text);
    switch (complexity) {
      case ComplexityLevel.SIMPLE: return 15;
      case ComplexityLevel.MEDIUM: return 45;
      case ComplexityLevel.COMPLEX: return 120;
      case ComplexityLevel.EXPERT: return 300;
      default: return 30;
    }
  }

  /**
   * 检测优先级
   */
  detectPriority(text) {
    if (/urgent|紧急 |critical|critical|p0/i.test(text)) return 'p0';
    if (/high|高 |important|p1/i.test(text)) return 'p1';
    if (/medium|中 |normal|p2/i.test(text)) return 'p2';
    if (/low|低 |later|p3/i.test(text)) return 'p3';
    return 'p2';
  }

  /**
   * 判断是否可以并行
   */
  canParallelize(text) {
    // 如果包含多个任务描述，可能可以并行
    const taskSeparators = ['并且', '然后', '接着', '同时', 'also', 'then', 'and'];
    return taskSeparators.some(sep => text.includes(sep));
  }
}

/**
 * Agent 匹配器
 */
class AgentMatcher {
  constructor() {
    // 权重配置
    this.weights = {
      skillMatch: 0.4,      // 技能匹配 40%
      workload: 0.2,        // 负载情况 20%
      historicalPerformance: 0.2,  // 历史表现 20%
      modelCapability: 0.2  // 模型能力 20%
    };
  }

  /**
   * 计算匹配分数
   */
  calculateMatchScore(agent, taskAnalysis) {
    const skillScore = this.calculateSkillScore(agent, taskAnalysis.requiredSkills);
    const workloadScore = this.calculateWorkloadScore(agent);
    const performanceScore = this.calculatePerformanceScore(agent);
    const modelScore = this.calculateModelScore(agent, taskAnalysis.type);

    const totalScore = 
      skillScore * this.weights.skillMatch +
      workloadScore * this.weights.workload +
      performanceScore * this.weights.historicalPerformance +
      modelScore * this.weights.modelCapability;

    return {
      total: Math.round(totalScore * 100),
      breakdown: {
        skill: Math.round(skillScore * 100),
        workload: Math.round(workloadScore * 100),
        performance: Math.round(performanceScore * 100),
        model: Math.round(modelScore * 100)
      }
    };
  }

  /**
   * 技能匹配分数
   */
  calculateSkillScore(agent, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) {
      return 0.8; // 没有特定技能要求，给基础分
    }

    const agentSkills = agent.skills || [];
    const matchedSkills = requiredSkills.filter(skill => 
      agentSkills.includes(skill)
    );

    return matchedSkills.length / requiredSkills.length;
  }

  /**
   * 负载分数
   */
  calculateWorkloadScore(agent) {
    // 当前任务数越少，分数越高
    const currentTasks = agent.currentTasks || 0;
    const maxTasks = agent.maxTasks || 5;

    return 1 - (currentTasks / maxTasks);
  }

  /**
   * 历史表现分数
   */
  calculatePerformanceScore(agent) {
    const stats = agent.stats || {};
    const completed = stats.tasksCompleted || 0;
    const failed = stats.tasksFailed || 0;
    const total = completed + failed;

    if (total === 0) return 0.5; // 没有历史记录，给平均分

    const successRate = completed / total;
    
    // 考虑任务数量（完成任务越多越可靠）
    const volumeFactor = Math.min(1, total / 20); // 20 个任务为满分
    
    return successRate * 0.7 + volumeFactor * 0.3;
  }

  /**
   * 模型能力分数
   */
  calculateModelScore(agent, taskType) {
    const model = agent.model || 'sonnet';
    
    // 不同模型对不同任务类型的适配度
    const modelCapabilities = {
      'opus': { [TaskType.CODING]: 1.0, [TaskType.DEBUGGING]: 1.0, [TaskType.REVIEW]: 1.0 },
      'sonnet': { [TaskType.CODING]: 0.9, [TaskType.DEBUGGING]: 0.9, [TaskType.REVIEW]: 0.9 },
      'haiku': { [TaskType.RESEARCH]: 0.9, [TaskType.DOCUMENTATION]: 0.9 }
    };

    const capabilities = modelCapabilities[model] || {};
    return capabilities[taskType] || 0.8;
  }

  /**
   * 查找最佳 Agent
   */
  findBestAgent(agents, taskAnalysis, options = {}) {
    const {
      minScore = 50,
      limit = 3,
      exclude = []
    } = options;

    const scored = agents
      .filter(agent => !exclude.includes(agent.id))
      .map(agent => ({
        agent,
        score: this.calculateMatchScore(agent, taskAnalysis)
      }))
      .filter(result => result.score.total >= minScore)
      .sort((a, b) => b.score.total - a.score.total);

    return scored.slice(0, limit);
  }
}

/**
 * 负载均衡器
 */
class LoadBalancer {
  constructor() {
    this.agentWorkloads = new Map();
  }

  /**
   * 更新 Agent 负载
   */
  updateWorkload(agentId, taskCount) {
    this.agentWorkloads.set(agentId, {
      taskCount,
      updatedAt: Date.now()
    });
  }

  /**
   * 获取最空闲的 Agent
   */
  getIdlestAgent(agentIds) {
    let idlestAgent = null;
    let minWorkload = Infinity;

    for (const agentId of agentIds) {
      const workload = this.agentWorkloads.get(agentId);
      const taskCount = workload ? workload.taskCount : 0;

      if (taskCount < minWorkload) {
        minWorkload = taskCount;
        idlestAgent = agentId;
      }
    }

    return idlestAgent;
  }

  /**
   * 获取负载统计
   */
  getStats() {
    const workloads = Array.from(this.agentWorkloads.values());
    
    if (workloads.length === 0) {
      return {
        totalAgents: 0,
        avgWorkload: 0,
        maxWorkload: 0,
        minWorkload: 0
      };
    }

    const taskCounts = workloads.map(w => w.taskCount);
    const total = taskCounts.reduce((a, b) => a + b, 0);

    return {
      totalAgents: workloads.length,
      avgWorkload: total / workloads.length,
      maxWorkload: Math.max(...taskCounts),
      minWorkload: Math.min(...taskCounts),
      totalTasks: total
    };
  }
}

/**
 * 任务分发器
 */
class Dispatcher extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.analyzer = new TaskAnalyzer();
    this.matcher = new AgentMatcher();
    this.loadBalancer = new LoadBalancer();
    
    this.agents = new Map();
    this.tasks = new Map();
    this.dispatchHistory = [];
    this.maxHistoryLength = options.maxHistoryLength || 100;
  }

  /**
   * 注册 Agent
   */
  registerAgent(agentConfig) {
    const agent = {
      id: agentConfig.id,
      name: agentConfig.name,
      model: agentConfig.model,
      skills: agentConfig.skills || [],
      currentTasks: 0,
      maxTasks: agentConfig.maxTasks || 5,
      stats: agentConfig.stats || {},
      status: 'available'
    };

    this.agents.set(agent.id, agent);
    this.loadBalancer.updateWorkload(agent.id, 0);
    
    this.emit('agent:registered', agent);
    
    return agent;
  }

  /**
   * 注销 Agent
   */
  unregisterAgent(agentId) {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent ${agentId} 不存在`);
    }

    if (agent.currentTasks > 0) {
      throw new Error(`Agent ${agentId} 还有 ${agent.currentTasks} 个进行中的任务`);
    }

    this.agents.delete(agentId);
    this.emit('agent:unregistered', agent);
    
    return agent;
  }

  /**
   * 分析任务
   */
  analyzeTask(taskDescription) {
    return this.analyzer.analyze(taskDescription);
  }

  /**
   * 查找最佳 Agent
   */
  findBestAgent(taskDescription, options = {}) {
    const analysis = this.analyzeTask(taskDescription);
    const agents = Array.from(this.agents.values());
    
    return this.matcher.findBestAgent(agents, analysis, options);
  }

  /**
   * 分发任务
   */
  dispatch(task) {
    const {
      description,
      assignedTo = null,
      priority = 'p2',
      metadata = {}
    } = task;

    // 分析任务
    const analysis = this.analyzeTask(description);

    // 如果未指定 Agent，自动匹配
    let targetAgent = assignedTo;
    
    if (!targetAgent) {
      const candidates = this.findBestAgent(description, { limit: 1 });
      
      if (candidates.length === 0) {
        throw new Error('找不到合适的 Agent');
      }
      
      targetAgent = candidates[0].agent.id;
    }

    // 验证 Agent 存在
    const agent = this.agents.get(targetAgent);
    if (!agent) {
      throw new Error(`Agent ${targetAgent} 不存在`);
    }

    // 创建任务
    const taskObj = {
      id: this.generateTaskId(),
      description,
      analysis,
      assignedTo: targetAgent,
      priority,
      metadata,
      status: 'pending',
      createdAt: Date.now()
    };

    this.tasks.set(taskObj.id, taskObj);

    // 更新 Agent 负载
    agent.currentTasks++;
    this.loadBalancer.updateWorkload(agent.id, agent.currentTasks);

    // 记录分发历史
    this.recordDispatch({
      taskId: taskObj.id,
      agentId: targetAgent,
      analysis,
      timestamp: Date.now()
    });

    this.emit('task:dispatched', taskObj);

    return taskObj;
  }

  /**
   * 标记任务完成
   */
  completeTask(taskId, result) {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      throw new Error(`任务 ${taskId} 不存在`);
    }

    task.status = 'completed';
    task.completedAt = Date.now();
    task.result = result;

    // 更新 Agent 负载
    const agent = this.agents.get(task.assignedTo);
    if (agent) {
      agent.currentTasks = Math.max(0, agent.currentTasks - 1);
      this.loadBalancer.updateWorkload(agent.id, agent.currentTasks);
      
      // 更新 Agent 统计
      agent.stats.tasksCompleted = (agent.stats.tasksCompleted || 0) + 1;
    }

    this.emit('task:completed', { task, result });

    return task;
  }

  /**
   * 记录分发历史
   */
  recordDispatch(record) {
    this.dispatchHistory.push(record);
    
    if (this.dispatchHistory.length > this.maxHistoryLength) {
      this.dispatchHistory.shift();
    }
  }

  /**
   * 获取分发统计
   */
  getStats() {
    const tasks = Array.from(this.tasks.values());
    
    return {
      totalTasks: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      byType: this.countByType(tasks),
      byPriority: this.countByPriority(tasks),
      agents: {
        total: this.agents.size,
        available: Array.from(this.agents.values()).filter(a => a.status === 'available').length,
        busy: Array.from(this.agents.values()).filter(a => a.status === 'busy').length
      },
      loadBalance: this.loadBalancer.getStats()
    };
  }

  countByType(tasks) {
    const counts = {};
    for (const task of tasks) {
      const type = task.analysis?.type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }

  countByPriority(tasks) {
    const counts = {};
    for (const task of tasks) {
      const priority = task.priority || 'p2';
      counts[priority] = (counts[priority] || 0) + 1;
    }
    return counts;
  }

  generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出
module.exports = {
  TaskType,
  ComplexityLevel,
  TaskAnalyzer,
  AgentMatcher,
  LoadBalancer,
  Dispatcher
};
