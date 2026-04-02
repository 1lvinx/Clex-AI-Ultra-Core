/**
 * CLI Integration - CLI 命令统一集成
 * 
 * 将所有技能注册为 OpenClaw CLI 命令
 */

const fs = require('fs');
const path = require('path');

/**
 * 命令注册表
 */
class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
  }

  /**
   * 注册命令
   */
  register(command, handler, options = {}) {
    const {
      aliases = [],
      description = '',
      usage = '',
      examples = []
    } = options;

    this.commands.set(command, {
      handler,
      description,
      usage,
      examples,
      aliases
    });

    // 注册别名
    for (const alias of aliases) {
      this.aliases.set(alias, command);
    }

    return this;
  }

  /**
   * 获取命令
   */
  get(command) {
    // 检查别名
    const realCommand = this.aliases.get(command) || command;
    return this.commands.get(realCommand);
  }

  /**
   * 列出所有命令
   */
  list(category = null) {
    const result = [];

    for (const [command, info] of this.commands) {
      if (!category || command.startsWith(category)) {
        result.push({
          command,
          ...info
        });
      }
    }

    return result;
  }

  /**
   * 执行命令
   */
  async execute(command, args, context = {}) {
    const cmd = this.get(command);
    
    if (!cmd) {
      throw new Error(`未知命令：${command}`);
    }

    try {
      const result = await cmd.handler(args, context);
      
      return {
        success: true,
        command,
        result
      };
    } catch (error) {
      return {
        success: false,
        command,
        error: error.message
      };
    }
  }
}

/**
 * CLI 帮助生成器
 */
class HelpGenerator {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * 生成帮助信息
   */
  generate(command = null) {
    if (command) {
      return this.generateCommandHelp(command);
    }
    
    return this.generateGeneralHelp();
  }

  /**
   * 生成总体帮助
   */
  generateGeneralHelp() {
    const commands = this.registry.list();
    
    // 按类别分组
    const grouped = {};
    
    for (const cmd of commands) {
      const category = cmd.command.split(' ')[0];
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(cmd);
    }

    let help = `# OpenClaw CLI 命令帮助\n\n`;
    help += `使用格式：/命令 [参数]\n\n`;
    help += `输入 \`/help <命令>\` 查看具体命令的详细说明\n\n`;
    help += `---\n\n`;

    for (const [category, cmds] of Object.entries(grouped)) {
      help += `## ${this.formatCategory(category)}\n\n`;
      
      for (const cmd of cmds) {
        help += `### ${cmd.command}\n\n`;
        if (cmd.description) {
          help += `${cmd.description}\n\n`;
        }
        if (cmd.usage) {
          help += `**用法**: \`${cmd.usage}\`\n\n`;
        }
        if (cmd.examples.length > 0) {
          help += `**示例**:\n`;
          for (const ex of cmd.examples) {
            help += `- \`${ex}\`\n`;
          }
          help += `\n`;
        }
      }

      help += `---\n\n`;
    }

    return help;
  }

  /**
   * 生成命令帮助
   */
  generateCommandHelp(command) {
    const cmd = this.registry.get(command);
    
    if (!cmd) {
      return `未知命令：${command}`;
    }

    let help = `## ${command}\n\n`;
    
    if (cmd.description) {
      help += `${cmd.description}\n\n`;
    }

    if (cmd.usage) {
      help += `**用法**: \`${cmd.usage}\`\n\n`;
    }

    if (cmd.aliases.length > 0) {
      help += `**别名**: ${cmd.aliases.join(', ')}\n\n`;
    }

    if (cmd.examples.length > 0) {
      help += `**示例**:\n\n`;
      for (const ex of cmd.examples) {
        help += `\`\`\`bash\n${ex}\n\`\`\`\n`;
      }
    }

    return help;
  }

  /**
   * 格式化类别名
   */
  formatCategory(category) {
    const names = {
      'permission': '权限与安全',
      'classify': '命令分类',
      'tasks': '任务管理',
      'agents': '多 Agent 协作',
      'progress': '进度追踪',
      'mcp': 'MCP 集成',
      'git': 'Git 操作',
      'analyze': '代码分析',
      'test': '测试运行',
      'format': '代码格式化',
      'deps': '依赖管理',
      'ai': 'AI 增强',
      'workflow': '工作流',
      'help': '帮助'
    };

    return names[category] || category;
  }
}

/**
 * 命令执行器
 */
class CommandExecutor {
  constructor(registry, options = {}) {
    this.registry = registry;
    this.history = [];
    this.maxHistory = options.maxHistory || 100;
  }

  /**
   * 执行命令
   */
  async execute(command, args, context = {}) {
    const startTime = Date.now();
    
    const result = await this.registry.execute(command, args, context);
    
    // 记录历史
    this.history.push({
      command,
      args,
      result,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });

    // 限制历史记录长度
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    return result;
  }

  /**
   * 获取执行历史
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  /**
   * 清除历史
   */
  clearHistory() {
    this.history = [];
  }
}

/**
 * 权限命令集成
 */
class PermissionCommands {
  constructor(permissionService) {
    this.service = permissionService;
  }

  register(registry) {
    registry
      .register('permission check', async (args) => {
        const command = args.join(' ');
        const result = await this.service.checkCommand(command);
        return {
          command,
          ...result
        };
      }, {
        description: '检查命令的权限',
        usage: '/permission check <command>',
        examples: [
          '/permission check "rm -rf /tmp"',
          '/permission check "npm install"'
        ]
      })
      .register('permission list', async () => {
        const rules = await this.service.listRules();
        return { rules };
      }, {
        description: '列出所有权限规则',
        usage: '/permission list',
        examples: ['/permission list']
      })
      .register('permission add', async (args) => {
        const rule = args.join(' ');
        const result = await this.service.addRule(rule);
        return result;
      }, {
        description: '添加权限规则',
        usage: '/permission add <rule>',
        examples: ['/permission add "allow: npm install *"']
      })
      .register('permission remove', async (args) => {
        const id = args[0];
        const result = await this.service.removeRule(id);
        return result;
      }, {
        description: '移除权限规则',
        usage: '/permission remove <id>',
        examples: ['/permission remove 123']
      })
      .register('classify', async (args) => {
        const command = args.join(' ');
        const result = await this.service.classifyCommand(command);
        return {
          command,
          ...result
        };
      }, {
        description: '分类命令风险等级',
        usage: '/classify <command>',
        examples: [
          '/classify "rm -rf /"',
          '/classify "ls -la"'
        ]
      });

    return this;
  }
}

/**
 * 任务命令集成
 */
class TaskCommands {
  constructor(taskService) {
    this.service = taskService;
  }

  register(registry) {
    registry
      .register('tasks list', async () => {
        const tasks = await this.service.listTasks();
        return { tasks };
      }, {
        description: '列出所有后台任务',
        usage: '/tasks list',
        examples: ['/tasks list']
      })
      .register('tasks stop', async (args) => {
        const taskId = args[0];
        const result = await this.service.stopTask(taskId);
        return result;
      }, {
        description: '停止后台任务',
        usage: '/tasks stop <id>',
        examples: ['/tasks stop 123']
      })
      .register('tasks logs', async (args) => {
        const taskId = args[0];
        const logs = await this.service.getTaskLogs(taskId);
        return { logs };
      }, {
        description: '查看任务日志',
        usage: '/tasks logs <id>',
        examples: ['/tasks logs 123']
      });

    return this;
  }
}

/**
 * Agent 命令集成
 */
class AgentCommands {
  constructor(agentService) {
    this.service = agentService;
  }

  register(registry) {
    registry
      .register('agents list', async () => {
        const teams = await this.service.listTeams();
        return { teams };
      }, {
        description: '列出所有 Agent 团队',
        usage: '/agents list',
        examples: ['/agents list']
      })
      .register('agents create', async (args) => {
        const name = args.join(' ');
        const team = await this.service.createTeam(name);
        return { team };
      }, {
        description: '创建 Agent 团队',
        usage: '/agents create <name>',
        examples: ['/agents create frontend-team']
      })
      .register('agents assign', async (args) => {
        const task = args.join(' ');
        const result = await this.service.assignTask(task);
        return result;
      }, {
        description: '分配任务给 Agent',
        usage: '/agents assign <task>',
        examples: ['/agents assign "实现用户登录功能"']
      });

    return this;
  }
}

/**
 * 进度命令集成
 */
class ProgressCommands {
  constructor(progressService) {
    this.service = progressService;
  }

  register(registry) {
    registry
      .register('progress show', async () => {
        const progress = await this.service.showProgress();
        return { progress };
      }, {
        description: '显示当前进度',
        usage: '/progress show',
        examples: ['/progress show']
      })
      .register('progress update', async (args) => {
        const [taskId, value] = args;
        const result = await this.service.updateProgress(taskId, parseInt(value));
        return result;
      }, {
        description: '更新进度',
        usage: '/progress update <task> <value>',
        examples: ['/progress update task-1 50']
      });

    return this;
  }
}

/**
 * MCP 命令集成
 */
class MCPCommands {
  constructor(mcpService) {
    this.service = mcpService;
  }

  register(registry) {
    registry
      .register('mcp connect', async (args) => {
        const server = args.join(' ');
        const result = await this.service.connect(server);
        return result;
      }, {
        description: '连接 MCP 服务器',
        usage: '/mcp connect <server>',
        examples: ['/mcp connect ws://localhost:8080']
      })
      .register('mcp tools', async () => {
        const tools = await this.service.listTools();
        return { tools };
      }, {
        description: '列出可用 MCP 工具',
        usage: '/mcp tools',
        examples: ['/mcp tools']
      })
      .register('mcp call', async (args) => {
        const [tool, ...params] = args;
        const result = await this.service.callTool(tool, params);
        return result;
      }, {
        description: '调用 MCP 工具',
        usage: '/mcp call <tool> [args]',
        examples: ['/mcp call file_read /path/to/file']
      });

    return this;
  }
}

/**
 * Git 命令集成
 */
class GitCommands {
  constructor(gitService) {
    this.service = gitService;
  }

  register(registry) {
    registry
      .register('git clone', async (args) => {
        const [url, dir] = args;
        const result = await this.service.clone(url, dir);
        return result;
      }, {
        description: '克隆 Git 仓库',
        usage: '/git clone <url> [dir]',
        examples: [
          '/git clone https://github.com/user/repo.git',
          '/git clone https://github.com/user/repo.git my-project'
        ]
      })
      .register('git status', async () => {
        const repo = this.service.getRepository(process.cwd());
        const status = await repo.status();
        return status;
      }, {
        description: '查看 Git 状态',
        usage: '/git status',
        examples: ['/git status']
      })
      .register('git commit', async (args) => {
        const message = args.join(' ');
        const repo = this.service.getRepository(process.cwd());
        await repo.add('.');
        const result = await repo.commit(message);
        return result;
      }, {
        description: '提交更改',
        usage: '/git commit <message>',
        examples: ['/git commit "feat: add new feature"']
      })
      .register('git log', async (args) => {
        const [maxCount = 10] = args.map(Number);
        const repo = this.service.getRepository(process.cwd());
        const log = await repo.log({ maxCount });
        return log;
      }, {
        description: '查看提交历史',
        usage: '/git log [count]',
        examples: [
          '/git log',
          '/git log 5'
        ]
      });

    return this;
  }
}

/**
 * 代码分析命令集成
 */
class AnalyzeCommands {
  constructor(analysisService) {
    this.service = analysisService;
  }

  register(registry) {
    registry
      .register('analyze', async (args) => {
        const filePath = args[0];
        const result = this.service.analyze(filePath);
        return result;
      }, {
        description: '分析代码文件',
        usage: '/analyze <file>',
        examples: [
          '/analyze src/index.js',
          '/analyze src/utils.ts'
        ]
      })
      .register('analyze dir', async (args) => {
        const dirPath = args.join(' ') || '.';
        const result = this.service.analyzeDirectory(dirPath);
        return result;
      }, {
        description: '分析目录',
        usage: '/analyze dir [path]',
        examples: [
          '/analyze dir',
          '/analyze dir ./src'
        ]
      });

    return this;
  }
}

/**
 * 测试命令集成
 */
class TestCommands {
  constructor(testService) {
    this.service = testService;
  }

  register(registry) {
    registry
      .register('test', async (args) => {
        const options = this.parseArgs(args);
        const result = await this.service.runTests(options);
        return result;
      }, {
        description: '运行测试',
        usage: '/test [options]',
        examples: [
          '/test',
          '/test --coverage',
          '/test --pattern utils'
        ]
      })
      .register('test watch', async () => {
        const result = await this.service.runTests({ watch: true });
        return result;
      }, {
        description: '监听模式运行测试',
        usage: '/test watch',
        examples: ['/test watch']
      });

    return this;
  }

  parseArgs(args) {
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--coverage') {
        options.coverage = true;
      } else if (arg === '--watch') {
        options.watch = true;
      } else if (arg === '--pattern' && args[i + 1]) {
        options.pattern = args[++i];
      } else if (arg === '--verbose') {
        options.verbose = true;
      }
    }

    return options;
  }
}

/**
 * 格式化命令集成
 */
class FormatCommands {
  constructor(formatService) {
    this.service = formatService;
  }

  register(registry) {
    registry
      .register('format', async (args) => {
        const file = args[0];
        if (file) {
          const result = await this.service.format(file);
          return result;
        }
        
        const result = await this.service.formatAll();
        return result;
      }, {
        description: '格式化代码',
        usage: '/format [file]',
        examples: [
          '/format',
          '/format src/index.js'
        ]
      })
      .register('format check', async (args) => {
        const file = args[0];
        const result = await this.service.format(file, { check: true });
        return result;
      }, {
        description: '检查代码格式',
        usage: '/format check [file]',
        examples: [
          '/format check',
          '/format check src/index.js'
        ]
      });

    return this;
  }
}

/**
 * 依赖命令集成
 */
class DepsCommands {
  constructor(depsService) {
    this.service = depsService;
  }

  register(registry) {
    registry
      .register('deps install', async (args) => {
        const packages = args;
        const result = await this.service.install(packages);
        return result;
      }, {
        description: '安装依赖',
        usage: '/deps install [packages]',
        examples: [
          '/deps install',
          '/deps install lodash axios'
        ]
      })
      .register('deps update', async (args) => {
        const packages = args;
        const result = await this.service.update(packages);
        return result;
      }, {
        description: '更新依赖',
        usage: '/deps update [packages]',
        examples: [
          '/deps update',
          '/deps update lodash'
        ]
      })
      .register('deps audit', async () => {
        const result = await this.service.audit();
        return result;
      }, {
        description: '安全审计',
        usage: '/deps audit',
        examples: ['/deps audit']
      })
      .register('deps outdated', async () => {
        const result = await this.service.outdated();
        return result;
      }, {
        description: '检查过时依赖',
        usage: '/deps outdated',
        examples: ['/deps outdated']
      });

    return this;
  }
}

/**
 * AI 命令集成
 */
class AICommands {
  constructor(aiService) {
    this.service = aiService;
  }

  register(registry) {
    registry
      .register('ai generate', async (args) => {
        const prompt = args.join(' ');
        const result = await this.service.generate(prompt);
        return result;
      }, {
        description: 'AI 生成代码',
        usage: '/ai generate <prompt>',
        examples: [
          '/ai generate "创建一个快速排序函数"',
          '/ai generate "添加用户验证中间件"'
        ]
      })
      .register('ai explain', async (args) => {
        const file = args[0];
        const result = await this.service.explain(file);
        return result;
      }, {
        description: 'AI 解释代码',
        usage: '/ai explain <file>',
        examples: ['/ai explain src/complex.js']
      })
      .register('ai fix', async (args) => {
        const file = args[0];
        const code = fs.readFileSync(file, 'utf-8');
        // 模拟错误
        const error = new Error('Simulated error');
        const result = await this.service.fix(error, code);
        return result;
      }, {
        description: 'AI Bug 修复',
        usage: '/ai fix <file>',
        examples: ['/ai fix src/buggy.js']
      })
      .register('ai refactor', async (args) => {
        const file = args[0];
        const code = fs.readFileSync(file, 'utf-8');
        const result = await this.service.suggestRefactoring(code);
        return result;
      }, {
        description: 'AI 重构建议',
        usage: '/ai refactor <file>',
        examples: ['/ai refactor src/legacy.js']
      })
      .register('ai docs', async (args) => {
        const file = args[0];
        const code = fs.readFileSync(file, 'utf-8');
        const result = await this.service.generateDocs(code);
        return result;
      }, {
        description: 'AI 生成文档',
        usage: '/ai docs <file>',
        examples: ['/ai docs src/api.js']
      });

    return this;
  }
}

/**
 * 工作流命令集成
 */
class WorkflowCommands {
  constructor(workflowService) {
    this.service = workflowService;
  }

  register(registry) {
    registry
      .register('workflow review', async (args) => {
        const file = args[0];
        const code = fs.readFileSync(file, 'utf-8');
        const result = await this.service.reviewCode(code);
        return result;
      }, {
        description: '代码审查工作流',
        usage: '/workflow review <file>',
        examples: ['/workflow review src/index.js']
      })
      .register('workflow pr', async (args) => {
        const prNumber = parseInt(args[0]);
        const result = await this.service.reviewPR(prNumber);
        return result;
      }, {
        description: 'PR 审查工作流',
        usage: '/workflow pr <number>',
        examples: ['/workflow pr 123']
      })
      .register('workflow fix', async (args) => {
        const file = args[0];
        const code = fs.readFileSync(file, 'utf-8');
        const result = await this.service.fixCode(code);
        return result;
      }, {
        description: '自动修复工作流',
        usage: '/workflow fix <file>',
        examples: ['/workflow fix src/buggy.js']
      })
      .register('workflow docs', async (args) => {
        const [dir, output = './docs'] = args;
        const result = await this.service.generateDocs(dir, output);
        return result;
      }, {
        description: '文档生成工作流',
        usage: '/workflow docs <dir> [output]',
        examples: [
          '/workflow docs ./src',
          '/workflow docs ./src ./docs'
        ]
      });

    return this;
  }
}

/**
 * 帮助命令集成
 */
class HelpCommands {
  constructor(helpGenerator) {
    this.generator = helpGenerator;
  }

  register(registry) {
    registry
      .register('help', (args) => {
        const command = args.join(' ');
        return this.generator.generate(command || null);
      }, {
        description: '显示帮助信息',
        usage: '/help [command]',
        examples: [
          '/help',
          '/help git clone'
        ],
        aliases: ['h', '?']
      });

    return this;
  }
}

/**
 * CLI 集成服务（统一入口）
 */
class CLIIntegrationService {
  constructor(options = {}) {
    this.registry = new CommandRegistry();
    this.executor = new CommandExecutor(this.registry, options);
    this.helpGenerator = new HelpGenerator(this.registry);

    // 注册所有命令处理器
    this.setupCommands();
  }

  /**
   * 设置命令
   */
  setupCommands() {
    // 帮助命令（最先注册）
    new HelpCommands(this.helpGenerator).register(this.registry);

    // 注意：实际使用时需要传入各服务的实例
    // 这里使用占位对象
    const placeholderService = {
      checkCommand: async () => ({ allowed: true }),
      listRules: async () => ([]),
      addRule: async () => ({ success: true }),
      removeRule: async () => ({ success: true }),
      classifyCommand: async () => ({ risk: 'low' }),
      listTasks: async () => ([]),
      stopTask: async () => ({ success: true }),
      getTaskLogs: async () => ([]),
      listTeams: async () => ([]),
      createTeam: async () => ({}),
      assignTask: async () => ({ success: true }),
      showProgress: async () => ({}),
      updateProgress: async () => ({ success: true }),
      connect: async () => ({ success: true }),
      listTools: async () => ([]),
      callTool: async () => ({}),
      clone: async () => ({ success: true }),
      getRepository: () => ({
        status: async () => ({}),
        commit: async () => ({ success: true }),
        log: async () => ([])
      }),
      analyze: () => ({}),
      analyzeDirectory: () => ({}),
      runTests: async () => ({ success: true }),
      format: async () => ({ success: true }),
      formatAll: async () => ({ success: true }),
      install: async () => ({ success: true }),
      update: async () => ({ success: true }),
      audit: async () => ({ success: true }),
      outdated: async () => ({ success: true }),
      generate: async () => ({ success: true, code: '' }),
      explain: async () => ({ success: true }),
      fix: async () => ({ success: true }),
      suggestRefactoring: async () => ({ success: true }),
      generateDocs: async () => ({ success: true }),
      reviewCode: async () => ({ success: true }),
      reviewPR: async () => ({ success: true }),
      fixCode: async () => ({ success: true })
    };

    // 注册各模块命令
    new PermissionCommands(placeholderService).register(this.registry);
    new TaskCommands(placeholderService).register(this.registry);
    new AgentCommands(placeholderService).register(this.registry);
    new ProgressCommands(placeholderService).register(this.registry);
    new MCPCommands(placeholderService).register(this.registry);
    new GitCommands(placeholderService).register(this.registry);
    new AnalyzeCommands(placeholderService).register(this.registry);
    new TestCommands(placeholderService).register(this.registry);
    new FormatCommands(placeholderService).register(this.registry);
    new DepsCommands(placeholderService).register(this.registry);
    new AICommands(placeholderService).register(this.registry);
    new WorkflowCommands(placeholderService).register(this.registry);
  }

  /**
   * 执行命令
   */
  async execute(commandLine, context = {}) {
    const [command, ...args] = commandLine.trim().split(/\s+/);
    return await this.executor.execute(command, args, context);
  }

  /**
   * 获取帮助
   */
  getHelp(command = null) {
    return this.helpGenerator.generate(command);
  }

  /**
   * 列出命令
   */
  listCommands(category = null) {
    return this.registry.list(category);
  }

  /**
   * 获取执行历史
   */
  getHistory(limit = 10) {
    return this.executor.getHistory(limit);
  }
}

// 导出
module.exports = {
  CommandRegistry,
  HelpGenerator,
  CommandExecutor,
  PermissionCommands,
  TaskCommands,
  AgentCommands,
  ProgressCommands,
  MCPCommands,
  GitCommands,
  AnalyzeCommands,
  TestCommands,
  FormatCommands,
  DepsCommands,
  AICommands,
  WorkflowCommands,
  HelpCommands,
  CLIIntegrationService
};
