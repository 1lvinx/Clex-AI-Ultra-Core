/**
 * CLI Commands - 命令行集成
 * 
 * 将权限、分类器、后台任务、工具执行器集成到 OpenClaw 命令系统
 */

const path = require('path');

// 导入已创建的技能
const { RuleEngine, PermissionMode, RuleType, RuleAction } = require('../permission-engine');
const { CommandClassifier } = require('../command-classifier');
const { BackgroundTaskManager, TaskStatus } = require('../background-tasks');
const { StreamingToolExecutor, ErrorType } = require('../tool-executor');

// 单例实例
let ruleEngine = null;
let classifier = null;
let taskManager = null;
let toolExecutor = null;

/**
 * 初始化所有服务
 */
function initializeServices(workspace) {
  if (!ruleEngine) {
    ruleEngine = new RuleEngine(path.join(workspace, '.permission-rules.json'));
  }
  
  if (!classifier) {
    classifier = new CommandClassifier();
  }
  
  if (!taskManager) {
    taskManager = new BackgroundTaskManager({
      storagePath: path.join(workspace, '.background-tasks.json')
    });
  }
  
  if (!toolExecutor) {
    toolExecutor = new StreamingToolExecutor({
      storagePath: path.join(workspace, '.tool-execution.json')
    });
  }
  
  return { ruleEngine, classifier, taskManager, toolExecutor };
}

/**
 * 格式化权限评估结果
 */
function formatPermissionResult(result) {
  const icon = result.allowed ? '✅' : '❌';
  const status = result.allowed ? '允许' : '拒绝';
  
  let output = `${icon} ${status}\n`;
  output += `原因：${result.reason}\n`;
  output += `模式：${result.mode}\n`;
  
  if (result.matches) {
    output += `匹配规则数：${result.matches}\n`;
  }
  
  if (result.ruleId) {
    output += `规则 ID: ${result.ruleId}\n`;
  }
  
  return output;
}

/**
 * 格式化命令分类结果
 */
function formatClassificationResult(result) {
  const icons = {
    critical: '🔴',
    dangerous: '🟠',
    moderate: '🟡',
    safe: '🟢'
  };
  
  const labels = {
    critical: 'CRITICAL',
    dangerous: 'DANGEROUS',
    moderate: 'MODERATE',
    safe: 'SAFE'
  };
  
  let output = `${icons[result.level]} ${labels[result.level]} (${result.score}分)\n`;
  output += `命令：${result.command}\n`;
  
  if (result.reasons && result.reasons.length > 0) {
    output += `原因:\n`;
    for (const reason of result.reasons) {
      output += `  - ${reason}\n`;
    }
  }
  
  output += `只读：${result.isReadonly ? '是' : '否'}\n`;
  output += `需要批准：${result.needsApproval ? '是' : '否'}\n`;
  
  if (result.suggestion) {
    output += `建议：${result.suggestion}\n`;
  }
  
  return output;
}

/**
 * 格式化任务状态
 */
function formatTaskStatus(task) {
  const statusIcons = {
    [TaskStatus.PENDING]: '⏳',
    [TaskStatus.RUNNING]: '🔄',
    [TaskStatus.COMPLETED]: '✅',
    [TaskStatus.FAILED]: '❌',
    [TaskStatus.CANCELLED]: '🚫'
  };
  
  let output = `📋 任务：${task.id}\n`;
  output += `名称：${task.name}\n`;
  output += `状态：${statusIcons[task.status]} ${task.status}\n`;
  
  if (task.status === TaskStatus.RUNNING || task.status === TaskStatus.COMPLETED) {
    const progress = '█'.repeat(Math.floor(task.progress / 10)) + 
                     '░'.repeat(10 - Math.floor(task.progress / 10));
    output += `进度：${progress} ${task.progress}%\n`;
  }
  
  output += `已运行：${task.elapsed}\n`;
  
  if (task.message) {
    output += `消息：${task.message}\n`;
  }
  
  if (task.error) {
    output += `错误：${task.error}\n`;
  }
  
  return output;
}

/**
 * 注册所有 CLI 命令
 */
function registerCommands(openclaw) {
  const workspace = openclaw.workspace || process.cwd();
  const services = initializeServices(workspace);
  
  // ========== 权限管理命令 ==========
  
  openclaw.addCommand('permission', {
    description: '权限规则管理',
    subcommands: {
      add: {
        description: '添加权限规则',
        usage: '/permission add <type> <pattern> <action> [description]',
        handler: async (args) => {
          const [type, pattern, action, ...descParts] = args;
          const description = descParts.join(' ');
          
          if (!type || !pattern || !action) {
            return '用法：/permission add <type> <pattern> <action> [description]\n类型：bash, powershell, file, network, agent\n动作：allow, deny, ask';
          }
          
          const rule = services.ruleEngine.addRule({
            type,
            pattern,
            action,
            description
          });
          
          return `✅ 已添加规则\nID: ${rule.id}\n类型：${type}\n模式：${pattern}\n动作：${action}\n描述：${description || '无'}`;
        }
      },
      
      list: {
        description: '列出权限规则',
        usage: '/permission list [type] [--enabled] [--disabled]',
        handler: async (args) => {
          const type = args.find(a => !a.startsWith('--')) || null;
          const enabled = args.includes('--enabled') ? true : args.includes('--disabled') ? false : null;
          
          const rules = services.ruleEngine.listRules({ type, enabled });
          
          if (rules.length === 0) {
            return '暂无规则';
          }
          
          let output = `权限规则（共 ${rules.length} 条）:\n\n`;
          
          for (const rule of rules.slice(0, 20)) {
            const icon = rule.enabled ? '✅' : '🚫';
            const actionIcon = rule.action === 'allow' ? '✓' : rule.action === 'deny' ? '✗' : '?';
            output += `${icon} #${rule.id.substr(-6)} [${actionIcon}] ${rule.type}: ${rule.pattern}\n`;
            if (rule.description) {
              output += `   ${rule.description}\n`;
            }
          }
          
          if (rules.length > 20) {
            output += `\n... 还有 ${rules.length - 20} 条规则`;
          }
          
          return output;
        }
      },
      
      remove: {
        description: '删除权限规则',
        usage: '/permission remove <id>',
        handler: async (args) => {
          const ruleId = args[0];
          
          if (!ruleId) {
            return '请提供规则 ID';
          }
          
          const removed = services.ruleEngine.removeRule(ruleId);
          
          if (removed) {
            return `✅ 已删除规则 ${ruleId}`;
          }
          
          return `❌ 规则 ${ruleId} 不存在`;
        }
      },
      
      enable: {
        description: '启用规则',
        usage: '/permission enable <id>',
        handler: async (args) => {
          const ruleId = args[0];
          
          if (!ruleId) {
            return '请提供规则 ID';
          }
          
          const success = services.ruleEngine.setRuleEnabled(ruleId, true);
          
          return success ? `✅ 已启用规则 ${ruleId}` : `❌ 规则 ${ruleId} 不存在`;
        }
      },
      
      disable: {
        description: '禁用规则',
        usage: '/permission disable <id>',
        handler: async (args) => {
          const ruleId = args[0];
          
          if (!ruleId) {
            return '请提供规则 ID';
          }
          
          const success = services.ruleEngine.setRuleEnabled(ruleId, false);
          
          return success ? `✅ 已禁用规则 ${ruleId}` : `❌ 规则 ${ruleId} 不存在`;
        }
      },
      
      evaluate: {
        description: '评估命令权限',
        usage: '/permission evaluate <command>',
        handler: async (args) => {
          const command = args.join(' ');
          
          if (!command) {
            return '请提供要评估的命令';
          }
          
          const result = services.ruleEngine.evaluate(command);
          return formatPermissionResult(result);
        }
      },
      
      export: {
        description: '导出规则',
        usage: '/permission export [file]',
        handler: async (args) => {
          const file = args[0] || 'permission-rules.json';
          const count = services.ruleEngine.exportToFile(file);
          
          return `✅ 已导出 ${count} 条规则到 ${file}`;
        }
      },
      
      import: {
        description: '导入规则',
        usage: '/permission import <file>',
        handler: async (args) => {
          const file = args[0];
          
          if (!file) {
            return '请提供文件路径';
          }
          
          const count = services.ruleEngine.importFromFile(file);
          
          return `✅ 已导入 ${count} 条规则`;
        }
      },
      
      conflicts: {
        description: '检测规则冲突',
        usage: '/permission conflicts',
        handler: async () => {
          const conflicts = services.ruleEngine.detectConflicts();
          
          if (conflicts.length === 0) {
            return '✅ 未检测到规则冲突';
          }
          
          let output = `⚠️ 检测到 ${conflicts.length} 处冲突:\n\n`;
          
          for (const conflict of conflicts) {
            output += `冲突：规则 #${conflict.rule1.id.substr(-6)} vs #${conflict.rule2.id.substr(-6)}\n`;
            output += `  ${conflict.rule1.pattern} (${conflict.rule1.action})\n`;
            output += `  ${conflict.rule2.pattern} (${conflict.rule2.action})\n`;
            output += `  ${conflict.issue}\n\n`;
          }
          
          return output;
        }
      }
    }
  });
  
  // ========== 命令分类命令 ==========
  
  openclaw.addCommand('classify', {
    description: '命令安全分类',
    subcommands: {
      'default': {
        description: '分类命令',
        usage: '/classify <command> [--shell=bash|powershell]',
        handler: async (args) => {
          let shell = 'bash';
          const commandParts = args.filter(arg => {
            if (arg.startsWith('--shell=')) {
              shell = arg.split('=')[1];
              return false;
            }
            return true;
          });
          
          const command = commandParts.join(' ');
          
          if (!command) {
            return '请提供要分类的命令';
          }
          
          const result = services.classifier.classify(command, shell);
          return formatClassificationResult(result);
        }
      },
      
      batch: {
        description: '批量分类命令',
        usage: '/classify batch <command1> <command2> ...',
        handler: async (args) => {
          const results = services.classifier.batchClassify(args);
          
          let output = `批量分类（共 ${results.length} 个命令）:\n\n`;
          
          for (const result of results) {
            const icon = {
              critical: '🔴',
              dangerous: '🟠',
              moderate: '🟡',
              safe: '🟢'
            }[result.level];
            
            output += `${icon} ${result.level.toUpperCase()} - ${result.command}\n`;
          }
          
          return output;
        }
      },
      
      test: {
        description: '测试命令（详细输出）',
        usage: '/classify test <command> [--details]',
        handler: async (args) => {
          const showDetails = args.includes('--details');
          const commandParts = args.filter(arg => arg !== '--details');
          const command = commandParts.join(' ');
          
          if (!command) {
            return '请提供要测试的命令';
          }
          
          const result = services.classifier.classify(command);
          let output = formatClassificationResult(result);
          
          if (showDetails && result.parsed) {
            output += `\n详细解析:\n`;
            output += `  基础命令：${result.parsed.command}\n`;
            output += `  参数：${result.parsed.args.join(' ')}\n`;
            output += `  包含管道：${result.parsed.isPipe ? '是' : '否'}\n`;
            output += `  包含重定向：${result.parsed.isRedirect ? '是' : '否'}\n`;
            output += `  使用 sudo: ${result.parsed.hasSudo ? '是' : '否'}\n`;
            output += `  后台执行：${result.parsed.isBackground ? '是' : '否'}\n`;
          }
          
          return output;
        }
      }
    }
  });
  
  // ========== 后台任务命令 ==========
  
  openclaw.addCommand('tasks', {
    description: '后台任务管理',
    subcommands: {
      list: {
        description: '列出任务',
        usage: '/tasks list [status] [--limit=20]',
        handler: async (args) => {
          let status = null;
          let limit = 20;
          
          for (const arg of args) {
            if (Object.values(TaskStatus).includes(arg)) {
              status = arg;
            } else if (arg.startsWith('--limit=')) {
              limit = parseInt(arg.split('=')[1]);
            }
          }
          
          const tasks = services.taskManager.listTasks({ status, limit });
          
          if (tasks.length === 0) {
            return status ? `暂无"${status}"状态的任务` : '暂无任务';
          }
          
          const statusIcons = {
            [TaskStatus.PENDING]: '⏳',
            [TaskStatus.RUNNING]: '🔄',
            [TaskStatus.COMPLETED]: '✅',
            [TaskStatus.FAILED]: '❌',
            [TaskStatus.CANCELLED]: '🚫'
          };
          
          let output = `任务列表（共 ${tasks.length} 个）:\n\n`;
          
          for (const task of tasks) {
            output += `${statusIcons[task.status]} ${task.id.substr(-8)} - ${task.name}\n`;
            output += `   ${task.status} ${task.progress}% ${task.elapsed}\n`;
          }
          
          return output;
        }
      },
      
      status: {
        description: '查看任务状态',
        usage: '/tasks status <id>',
        handler: async (args) => {
          const taskId = args[0];
          
          if (!taskId) {
            return '请提供任务 ID';
          }
          
          const task = services.taskManager.getTask(taskId);
          
          if (!task) {
            return `❌ 任务 ${taskId} 不存在`;
          }
          
          return formatTaskStatus(task.toJSON());
        }
      },
      
      cancel: {
        description: '取消任务',
        usage: '/tasks cancel <id>',
        handler: async (args) => {
          const taskId = args[0];
          
          if (!taskId) {
            return '请提供任务 ID';
          }
          
          try {
            services.taskManager.cancelTask(taskId);
            return `✅ 已取消任务 ${taskId}`;
          } catch (error) {
            return `❌ ${error.message}`;
          }
        }
      },
      
      result: {
        description: '获取任务结果',
        usage: '/tasks result <id>',
        handler: async (args) => {
          const taskId = args[0];
          
          if (!taskId) {
            return '请提供任务 ID';
          }
          
          const task = services.taskManager.getTask(taskId);
          
          if (!task) {
            return `❌ 任务 ${taskId} 不存在`;
          }
          
          if (task.status !== TaskStatus.COMPLETED) {
            return `任务尚未完成（当前状态：${task.status}）`;
          }
          
          return `任务结果:\n${JSON.stringify(task.result, null, 2)}`;
        }
      },
      
      clear: {
        description: '清理任务',
        usage: '/tasks clear [status]',
        handler: async (args) => {
          const statuses = args.length > 0 ? args : [TaskStatus.COMPLETED, TaskStatus.CANCELLED];
          const cleared = services.taskManager.clearCompleted(statuses);
          
          return `✅ 已清理 ${cleared} 个任务`;
        }
      },
      
      stats: {
        description: '查看任务统计',
        usage: '/tasks stats',
        handler: async () => {
          const stats = services.taskManager.getStats();
          
          let output = '📊 任务统计:\n\n';
          output += `总计：${stats.total}\n`;
          output += `⏳ 等待中：${stats.pending}\n`;
          output += `🔄 运行中：${stats.running}\n`;
          output += `✅ 已完成：${stats.completed}\n`;
          output += `❌ 失败：${stats.failed}\n`;
          output += `🚫 已取消：${stats.cancelled}\n`;
          output += `💡 后台：${stats.background}`;
          
          return output;
        }
      }
    }
  });
  
  // ========== 工具执行命令 ==========
  
  openclaw.addCommand('tool', {
    description: '工具执行',
    subcommands: {
      exec: {
        description: '执行工具',
        usage: '/tool exec <name> [params...] [--timeout=30000] [--summarize]',
        handler: async (args) => {
          const toolName = args[0];
          const params = [];
          let timeout = 30000;
          let summarize = false;
          
          for (let i = 1; i < args.length; i++) {
            if (args[i].startsWith('--timeout=')) {
              timeout = parseInt(args[i].split('=')[1]);
            } else if (args[i] === '--summarize') {
              summarize = true;
            } else {
              params.push(args[i]);
            }
          }
          
          if (!toolName) {
            return '请提供工具名称';
          }
          
          try {
            const result = await services.toolExecutor.execute(toolName, params, {
              timeout,
              summarizeResult: summarize
            });
            
            let output = `✅ 工具执行完成\n\n`;
            output += `工具：${toolName}\n`;
            output += `输出：\n${result.output || '无'}\n`;
            
            if (result.summary) {
              output += `\n📊 摘要：${result.summary}\n`;
            }
            
            return output;
          } catch (error) {
            return `❌ 工具执行失败：${error.message}`;
          }
        }
      },
      
      list: {
        description: '列出可用工具',
        usage: '/tool list',
        handler: async () => {
          // TODO: 列出 OpenClaw 中可用的工具
          return '可用工具列表（待实现）:\n- bash\n- FileReadTool\n- FileWriteTool\n- GrepTool\n- GlobTool\n- ...';
        }
      },
      
      history: {
        description: '查看执行历史',
        usage: '/tool history [limit]',
        handler: async (args) => {
          const limit = parseInt(args[0]) || 10;
          const history = services.toolExecutor.getHistory(limit);
          
          if (history.length === 0) {
            return '暂无执行历史';
          }
          
          let output = `执行历史（最近 ${history.length} 条）:\n\n`;
          
          for (const exec of history) {
            const icon = exec.status === 'success' ? '✅' : '❌';
            const time = new Date(exec.timestamp).toLocaleTimeString();
            output += `${icon} ${time} - ${exec.toolName} (${exec.duration}ms)\n`;
          }
          
          return output;
        }
      },
      
      retry: {
        description: '重试执行',
        usage: '/tool retry <id>',
        handler: async (args) => {
          const executionId = args[0];
          
          if (!executionId) {
            return '请提供执行 ID';
          }
          
          try {
            const result = await services.toolExecutor.retry(executionId);
            return `✅ 重试成功\n\n${result.output || ''}`;
          } catch (error) {
            return `❌ 重试失败：${error.message}`;
          }
        }
      }
    }
  });
  
  return {
    ruleEngine: services.ruleEngine,
    classifier: services.classifier,
    taskManager: services.taskManager,
    toolExecutor: services.toolExecutor
  };
}

// 导出
module.exports = {
  registerCommands,
  initializeServices,
  formatPermissionResult,
  formatClassificationResult,
  formatTaskStatus
};
