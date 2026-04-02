/**
 * Agent Teams - Agent 团队管理
 * 
 * 创建和管理 Agent 团队，实现团队协作
 */

const EventEmitter = require('events');

// 成员角色
const AgentRole = {
  LEADER: 'leader',
  WORKER: 'worker',
  OBSERVER: 'observer'
};

// 团队状态
const TeamStatus = {
  ACTIVE: 'active',
  IDLE: 'idle',
  BUSY: 'busy',
  PAUSED: 'paused',
  DISSOLVED: 'dissolved'
};

/**
 * Agent 成员类
 */
class AgentMember {
  constructor({
    id,
    role = AgentRole.WORKER,
    model = 'sonnet',
    tools = [],
    capabilities = {},
    metadata = {}
  }) {
    this.id = id;
    this.role = role;
    this.model = model;
    this.tools = tools;
    this.capabilities = capabilities;
    this.metadata = metadata;
    this.status = 'available'; // available | busy | offline
    this.joinedAt = Date.now();
    this.stats = {
      tasksCompleted: 0,
      tasksFailed: 0,
      avgCompletionTime: 0
    };
  }

  /**
   * 设置为忙碌
   */
  setBusy(taskId) {
    this.status = 'busy';
    this.currentTaskId = taskId;
  }

  /**
   * 设置为可用
   */
  setAvailable() {
    this.status = 'available';
    this.currentTaskId = null;
    this.stats.tasksCompleted++;
  }

  /**
   * 设置为离线
   */
  setOffline() {
    this.status = 'offline';
  }

  toJSON() {
    return {
      id: this.id,
      role: this.role,
      model: this.model,
      tools: this.tools,
      capabilities: this.capabilities,
      status: this.status,
      joinedAt: this.joinedAt,
      stats: this.stats
    };
  }
}

/**
 * Agent 团队类
 */
class AgentTeam extends EventEmitter {
  constructor({
    id = null,
    name,
    leader = null,
    members = [],
    sharedMemory = true,
    communication = 'broadcast',
    maxMembers = 10,
    metadata = {}
  }) {
    super();
    
    this.id = id || this.generateId();
    this.name = name;
    this.status = TeamStatus.IDLE;
    this.leader = leader;
    this.members = new Map();
    this.sharedMemory = sharedMemory;
    this.communication = communication;
    this.maxMembers = maxMembers;
    this.metadata = metadata;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    
    this.context = {
      sharedData: new Map(),
      messages: [],
      tasks: []
    };

    // 添加初始成员
    for (const memberConfig of members) {
      this.addMember(memberConfig);
    }

    // 如果指定了 leader，确保其角色正确
    if (leader && this.members.has(leader)) {
      this.members.get(leader).role = AgentRole.LEADER;
    }
  }

  generateId() {
    return `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 添加成员
   */
  addMember(memberConfig) {
    if (this.members.size >= this.maxMembers) {
      throw new Error(`团队已满（最大 ${this.maxMembers} 人）`);
    }

    const member = new AgentMember(memberConfig);
    this.members.set(member.id, member);
    
    this.updatedAt = Date.now();
    this.emit('member:added', member);
    
    return member;
  }

  /**
   * 移除成员
   */
  removeMember(memberId) {
    const member = this.members.get(memberId);
    
    if (!member) {
      throw new Error(`成员 ${memberId} 不存在`);
    }

    if (member.role === AgentRole.LEADER && this.members.size > 1) {
      throw new Error('不能移除队长，请先指定新队长');
    }

    this.members.delete(memberId);
    this.updatedAt = Date.now();
    this.emit('member:removed', member);
    
    return member;
  }

  /**
   * 设置队长
   */
  setLeader(memberId) {
    const member = this.members.get(memberId);
    
    if (!member) {
      throw new Error(`成员 ${memberId} 不存在`);
    }

    // 将当前队长降级为 worker
    if (this.leader && this.members.has(this.leader)) {
      this.members.get(this.leader).role = AgentRole.WORKER;
    }

    // 设置新队长
    member.role = AgentRole.LEADER;
    this.leader = memberId;
    this.updatedAt = Date.now();
    
    this.emit('leader:changed', { oldLeader: this.leader, newLeader: memberId });
    
    return member;
  }

  /**
   * 更新成员角色
   */
  updateMemberRole(memberId, role) {
    const member = this.members.get(memberId);
    
    if (!member) {
      throw new Error(`成员 ${memberId} 不存在`);
    }

    const oldRole = member.role;
    member.role = role;
    this.updatedAt = Date.now();
    
    this.emit('member:roleChanged', { memberId, oldRole, newRole: role });
    
    return member;
  }

  /**
   * 获取成员
   */
  getMember(memberId) {
    return this.members.get(memberId);
  }

  /**
   * 获取所有工作者
   */
  getWorkers() {
    return Array.from(this.members.values())
      .filter(m => m.role === AgentRole.WORKER && m.status === 'available');
  }

  /**
   * 获取所有观察者
   */
  getObservers() {
    return Array.from(this.members.values())
      .filter(m => m.role === AgentRole.OBSERVER);
  }

  /**
   * 获取可用成员
   */
  getAvailableMembers() {
    return Array.from(this.members.values())
      .filter(m => m.status === 'available');
  }

  /**
   * 分配任务给成员
   */
  assignTask(memberId, task) {
    const member = this.members.get(memberId);
    
    if (!member) {
      throw new Error(`成员 ${memberId} 不存在`);
    }

    if (member.status !== 'available') {
      throw new Error(`成员 ${memberId} 当前不可用（状态：${member.status}）`);
    }

    member.setBusy(task.id);
    this.status = TeamStatus.BUSY;
    
    this.context.tasks.push({
      id: task.id,
      assignedTo: memberId,
      task,
      assignedAt: Date.now()
    });
    
    this.emit('task:assigned', { memberId, task });
    
    return member;
  }

  /**
   * 标记任务完成
   */
  completeTask(memberId, taskId, result) {
    const member = this.members.get(memberId);
    
    if (!member) {
      throw new Error(`成员 ${memberId} 不存在`);
    }

    member.setAvailable();
    
    // 更新任务状态
    const teamTask = this.context.tasks.find(t => t.id === taskId && t.assignedTo === memberId);
    if (teamTask) {
      teamTask.completedAt = Date.now();
      teamTask.result = result;
    }

    // 检查是否所有任务都完成了
    const activeTasks = this.context.tasks.filter(t => !t.completedAt);
    if (activeTasks.length === 0) {
      this.status = TeamStatus.IDLE;
    }
    
    this.emit('task:completed', { memberId, task: teamTask, result });
    
    return member;
  }

  /**
   * 广播消息给所有成员
   */
  broadcast(message, options = {}) {
    const {
      exclude = [],
      onlyRole = null,
      priority = 'normal' // normal | urgent | system
    } = options;

    const messageObj = {
      id: `msg-${Date.now()}`,
      from: 'system',
      content: message,
      timestamp: Date.now(),
      priority,
      readBy: []
    };

    this.context.messages.push(messageObj);

    // 发送给所有成员
    for (const member of this.members.values()) {
      if (exclude.includes(member.id)) continue;
      if (onlyRole && member.role !== onlyRole) continue;

      this.emit('message:broadcast', {
        memberId: member.id,
        message: messageObj
      });
    }

    return messageObj;
  }

  /**
   * 发送直接消息
   */
  sendDirectMessage(toMemberId, message, fromMemberId = 'system') {
    const member = this.members.get(toMemberId);
    
    if (!member) {
      throw new Error(`成员 ${toMemberId} 不存在`);
    }

    const messageObj = {
      id: `msg-${Date.now()}`,
      from: fromMemberId,
      to: toMemberId,
      content: message,
      timestamp: Date.now(),
      type: 'direct'
    };

    this.context.messages.push(messageObj);

    this.emit('message:direct', {
      memberId: toMemberId,
      message: messageObj
    });

    return messageObj;
  }

  /**
   * 设置共享数据
   */
  setSharedData(key, value) {
    this.context.sharedData.set(key, value);
    this.emit('data:changed', { key, value });
  }

  /**
   * 获取共享数据
   */
  getSharedData(key) {
    return this.context.sharedData.get(key);
  }

  /**
   * 获取团队统计
   */
  getStats() {
    const members = Array.from(this.members.values());
    
    return {
      totalMembers: members.length,
      available: members.filter(m => m.status === 'available').length,
      busy: members.filter(m => m.status === 'busy').length,
      offline: members.filter(m => m.status === 'offline').length,
      byRole: {
        leader: members.filter(m => m.role === AgentRole.LEADER).length,
        worker: members.filter(m => m.role === AgentRole.WORKER).length,
        observer: members.filter(m => m.role === AgentRole.OBSERVER).length
      },
      tasks: {
        total: this.context.tasks.length,
        completed: this.context.tasks.filter(t => t.completedAt).length,
        active: this.context.tasks.filter(t => !t.completedAt).length
      }
    };
  }

  /**
   * 暂停团队
   */
  pause() {
    this.status = TeamStatus.PAUSED;
    this.broadcast('团队已暂停', { priority: 'system' });
    this.emit('team:paused');
  }

  /**
   * 恢复团队
   */
  resume() {
    this.status = TeamStatus.IDLE;
    this.broadcast('团队已恢复', { priority: 'system' });
    this.emit('team:resumed');
  }

  /**
   * 解散团队
   */
  dissolve() {
    this.status = TeamStatus.DISSOLVED;
    
    // 通知所有成员
    for (const member of this.members.values()) {
      this.emit('team:dissolved', { memberId: member.id });
    }
    
    this.emit('team:dissolved');
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      leader: this.leader,
      memberCount: this.members.size,
      members: Array.from(this.members.values()).map(m => m.toJSON()),
      sharedMemory: this.sharedMemory,
      communication: this.communication,
      stats: this.getStats(),
      createdAt: new Date(this.createdAt).toISOString(),
      updatedAt: new Date(this.updatedAt).toISOString()
    };
  }
}

/**
 * 团队管理器
 */
class TeamManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.teams = new Map();
    this.storagePath = options.storagePath || this.getDefaultStoragePath();
    this.maxTeams = options.maxTeams || 50;
    
    // 加载持久化的团队
    this.load();
  }

  getDefaultStoragePath() {
    const workspace = process.env.OPENCLAW_WORKSPACE || process.cwd();
    const path = require('path');
    return path.join(workspace, '.agent-teams.json');
  }

  /**
   * 创建团队
   */
  createTeam(config) {
    if (this.teams.size >= this.maxTeams) {
      throw new Error(`已达到最大团队数限制（${this.maxTeams}）`);
    }

    const team = new AgentTeam(config);
    this.teams.set(team.id, team);
    
    // 监听团队事件
    team.on('member:added', (member) => {
      this.emit('team:member:added', { teamId: team.id, member });
    });
    
    team.on('task:completed', (data) => {
      this.emit('team:task:completed', { teamId: team.id, ...data });
    });

    this.save();
    this.emit('team:created', team);
    
    return team;
  }

  /**
   * 获取团队
   */
  getTeam(teamId) {
    return this.teams.get(teamId);
  }

  /**
   * 列出团队
   */
  listTeams({ status = null, limit = 20 } = {}) {
    let teams = Array.from(this.teams.values());

    if (status) {
      teams = teams.filter(t => t.status === status);
    }

    // 按创建时间降序排序
    teams.sort((a, b) => b.createdAt - a.createdAt);

    return teams.slice(0, limit).map(t => t.toJSON());
  }

  /**
   * 删除团队
   */
  removeTeam(teamId) {
    const team = this.teams.get(teamId);
    
    if (!team) {
      throw new Error(`团队 ${teamId} 不存在`);
    }

    team.dissolve();
    this.teams.delete(teamId);
    this.save();
    
    this.emit('team:removed', team);
    
    return team;
  }

  /**
   * 查找成员的团队
   */
  findTeamsByMember(memberId) {
    const result = [];
    
    for (const team of this.teams.values()) {
      if (team.members.has(memberId)) {
        result.push({
          team: team.toJSON(),
          member: team.getMember(memberId).toJSON()
        });
      }
    }
    
    return result;
  }

  /**
   * 保存团队到文件
   */
  save() {
    const fs = require('fs');
    const path = require('path');

    const data = {
      version: 1,
      updatedAt: new Date().toISOString(),
      teams: Array.from(this.teams.values())
        .map(t => t.toJSON())
    };

    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
  }

  /**
   * 从文件加载团队
   */
  load() {
    const fs = require('fs');
    
    if (!fs.existsSync(this.storagePath)) {
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
      
      for (const teamJson of data.teams || []) {
        const team = new AgentTeam({
          id: teamJson.id,
          name: teamJson.name,
          leader: teamJson.leader,
          sharedMemory: teamJson.sharedMemory,
          communication: teamJson.communication
        });

        // 恢复成员
        for (const memberJson of teamJson.members || []) {
          team.members.set(memberJson.id, new AgentMember(memberJson));
        }

        this.teams.set(team.id, team);
      }

      console.log(`Loaded ${this.teams.size} agent teams`);
    } catch (error) {
      console.error(`Failed to load teams: ${error.message}`);
    }
  }

  /**
   * 获取所有团队的统计
   */
  getOverallStats() {
    const teams = Array.from(this.teams.values());
    
    return {
      totalTeams: teams.length,
      byStatus: {
        active: teams.filter(t => t.status === TeamStatus.ACTIVE).length,
        idle: teams.filter(t => t.status === TeamStatus.IDLE).length,
        busy: teams.filter(t => t.status === TeamStatus.BUSY).length,
        paused: teams.filter(t => t.status === TeamStatus.PAUSED).length
      },
      totalMembers: teams.reduce((sum, t) => sum + t.members.size, 0),
      totalTasks: teams.reduce((sum, t) => sum + t.context.tasks.length, 0)
    };
  }
}

// 导出
module.exports = {
  AgentRole,
  TeamStatus,
  AgentMember,
  AgentTeam,
  TeamManager
};
