/**
 * Background Tasks - 后台任务系统
 * 
 * 支持后台运行长时间任务，自动进度追踪
 */

const EventEmitter = require('events');

// 任务状态
const TaskStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// 自动转后台的阈值（毫秒）
const AUTO_BACKGROUND_THRESHOLD = 2000;

/**
 * 任务类
 */
class Task {
  constructor({
    id = null,
    name,
    description = '',
    agent = null,
    prompt = '',
    autoBackground = true
  }) {
    this.id = id || this.generateId();
    this.name = name;
    this.description = description;
    this.status = TaskStatus.PENDING;
    this.progress = 0;
    this.message = '';
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.startedAt = null;
    this.completedAt = null;
    this.agent = agent;
    this.prompt = prompt;
    this.result = null;
    this.error = null;
    this.autoBackground = autoBackground;
    this.isBackground = false;
  }

  generateId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  start() {
    this.status = TaskStatus.RUNNING;
    this.startedAt = Date.now();
    this.updatedAt = Date.now();
  }

  updateProgress(progress, message = '') {
    this.progress = Math.min(100, Math.max(0, progress));
    this.message = message;
    this.updatedAt = Date.now();

    // 检查是否应该自动转后台
    if (this.autoBackground && !this.isBackground) {
      const elapsed = Date.now() - this.startedAt;
      if (elapsed > AUTO_BACKGROUND_THRESHOLD) {
        this.isBackground = true;
      }
    }
  }

  complete(result) {
    this.status = TaskStatus.COMPLETED;
    this.result = result;
    this.progress = 100;
    this.completedAt = Date.now();
    this.updatedAt = Date.now();
  }

  fail(error) {
    this.status = TaskStatus.FAILED;
    this.error = error instanceof Error ? error.message : String(error);
    this.completedAt = Date.now();
    this.updatedAt = Date.now();
  }

  cancel() {
    this.status = TaskStatus.CANCELLED;
    this.completedAt = Date.now();
    this.updatedAt = Date.now();
  }

  getElapsed() {
    const start = this.startedAt || this.createdAt;
    const end = this.completedAt || Date.now();
    return end - start;
  }

  getElapsedFormatted() {
    const elapsed = this.getElapsed();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}分${seconds % 60}秒`;
    }
    return `${seconds}秒`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      progress: this.progress,
      message: this.message,
      createdAt: new Date(this.createdAt).toISOString(),
      updatedAt: new Date(this.updatedAt).toISOString(),
      startedAt: this.startedAt ? new Date(this.startedAt).toISOString() : null,
      completedAt: this.completedAt ? new Date(this.completedAt).toISOString() : null,
      agent: this.agent,
      prompt: this.prompt,
      result: this.result,
      error: this.error,
      isBackground: this.isBackground,
      elapsed: this.getElapsedFormatted()
    };
  }
}

/**
 * 后台任务管理器
 */
class BackgroundTaskManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.tasks = new Map();
    this.storagePath = options.storagePath || this.getDefaultStoragePath();
    this.autoBackgroundThreshold = options.autoBackgroundThreshold || AUTO_BACKGROUND_THRESHOLD;
    this.maxCompletedTasks = options.maxCompletedTasks || 100;
    
    // 加载持久化的任务
    this.load();
    
    // 定期清理已完成的任务
    this.startCleanupTimer();
  }

  getDefaultStoragePath() {
    const workspace = process.env.OPENCLAW_WORKSPACE || process.cwd();
    return require('path').join(workspace, '.background-tasks.json');
  }

  /**
   * 创建任务
   */
  createTask({
    name,
    description = '',
    agent = null,
    prompt = '',
    autoBackground = true
  }) {
    const task = new Task({
      name,
      description,
      agent,
      prompt,
      autoBackground
    });

    this.tasks.set(task.id, task);
    this.save();

    this.emit('task:created', task);
    
    return task;
  }

  /**
   * 获取任务
   */
  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  /**
   * 开始任务
   */
  startTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.start();
    this.save();
    this.emit('task:started', task);

    return task;
  }

  /**
   * 更新进度
   */
  updateProgress(taskId, progress, message = '') {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.updateProgress(progress, message);
    this.save();
    this.emit('task:progress', task);

    return task;
  }

  /**
   * 完成任务
   */
  completeTask(taskId, result) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.complete(result);
    this.save();
    this.emit('task:completed', task);

    return task;
  }

  /**
   * 失败任务
   */
  failTask(taskId, error) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.fail(error);
    this.save();
    this.emit('task:failed', task);

    return task;
  }

  /**
   * 取消任务
   */
  cancelTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (task.status === TaskStatus.COMPLETED || 
        task.status === TaskStatus.FAILED ||
        task.status === TaskStatus.CANCELLED) {
      throw new Error(`Task ${taskId} already finished`);
    }

    task.cancel();
    this.save();
    this.emit('task:cancelled', task);

    return task;
  }

  /**
   * 列出任务
   */
  listTasks({ status = null, limit = 20, agent = null } = {}) {
    let tasks = Array.from(this.tasks.values());

    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }

    if (agent) {
      tasks = tasks.filter(t => t.agent === agent);
    }

    // 按创建时间降序排序
    tasks.sort((a, b) => b.createdAt - a.createdAt);

    return tasks.slice(0, limit).map(t => t.toJSON());
  }

  /**
   * 获取任务统计
   */
  getStats() {
    const tasks = Array.from(this.tasks.values());
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
      running: tasks.filter(t => t.status === TaskStatus.RUNNING).length,
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      failed: tasks.filter(t => t.status === TaskStatus.FAILED).length,
      cancelled: tasks.filter(t => t.status === TaskStatus.CANCELLED).length,
      background: tasks.filter(t => t.isBackground).length
    };
  }

  /**
   * 清理已完成的任务
   */
  clearCompleted(statuses = [TaskStatus.COMPLETED, TaskStatus.CANCELLED]) {
    let cleared = 0;

    for (const [id, task] of this.tasks.entries()) {
      if (statuses.includes(task.status)) {
        this.tasks.delete(id);
        cleared++;
      }
    }

    if (cleared > 0) {
      this.save();
      this.emit('tasks:cleared', cleared);
    }

    return cleared;
  }

  /**
   * 保存任务到文件
   */
  save() {
    const fs = require('fs');
    const path = require('path');

    // 只保存最近的任务
    const tasks = Array.from(this.tasks.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, this.maxCompletedTasks * 2)
      .map(t => t.toJSON());

    const data = {
      version: 1,
      updatedAt: new Date().toISOString(),
      tasks
    };

    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
  }

  /**
   * 从文件加载任务
   */
  load() {
    const fs = require('fs');
    
    if (!fs.existsSync(this.storagePath)) {
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
      
      this.tasks.clear();
      
      for (const taskJson of data.tasks || []) {
        const task = new Task({
          id: taskJson.id,
          name: taskJson.name,
          description: taskJson.description,
          agent: taskJson.agent,
          prompt: taskJson.prompt
        });

        // 恢复状态
        task.status = taskJson.status;
        task.progress = taskJson.progress;
        task.message = taskJson.message;
        task.createdAt = new Date(taskJson.createdAt).getTime();
        task.updatedAt = new Date(taskJson.updatedAt).getTime();
        task.startedAt = taskJson.startedAt ? new Date(taskJson.startedAt).getTime() : null;
        task.completedAt = taskJson.completedAt ? new Date(taskJson.completedAt).getTime() : null;
        task.result = taskJson.result;
        task.error = taskJson.error;
        task.isBackground = taskJson.isBackground;

        this.tasks.set(task.id, task);
      }

      console.log(`Loaded ${this.tasks.size} background tasks`);
    } catch (error) {
      console.error(`Failed to load tasks: ${error.message}`);
    }
  }

  /**
   * 启动清理定时器
   */
  startCleanupTimer() {
    // 每 5 分钟清理一次
    setInterval(() => {
      const stats = this.getStats();
      
      // 如果已完成的任务太多，清理一部分
      if (stats.completed > this.maxCompletedTasks) {
        this.clearCompleted();
      }
    }, 5 * 60 * 1000);
  }
}

// 导出
module.exports = {
  TaskStatus,
  Task,
  BackgroundTaskManager,
  AUTO_BACKGROUND_THRESHOLD
};
