/**
 * Command Classifier - 命令安全分类器
 * 
 * 自动判断命令的危险性，支持自动批准
 */

// 危险模式库
const DangerousPatterns = {
  // 🔴 高危命令（永远需要批准）
  CRITICAL: [
    { pattern: /^rm\s+-rf\s+\/(\s|$)/i, reason: '删除根目录' },
    { pattern: /^dd\s+if=/i, reason: '直接磁盘写入' },
    { pattern: /^mkfs/i, reason: '格式化文件系统' },
    { pattern: />\s*\/dev\/sd[a-z]/i, reason: '直接写入设备' },
    { pattern: /:\(\)\s*\{\s*:|:&\s*\}\s*;/, reason: 'Fork bomb' },
    { pattern: /^chmod\s+-R\s+777\s+\//i, reason: '根目录权限设置' },
    { pattern: /^chown\s+-R/i, reason: '递归修改所有者' },
  ],
  
  // 🟠 危险命令（需要批准）
  DANGEROUS: [
    { pattern: /^rm\s+-rf/i, reason: '递归删除' },
    { pattern: /^del\s+\/s\s+\/q/i, reason: '强制删除' },
    { pattern: /^format/i, reason: '格式化' },
    { pattern: /^shutdown/i, reason: '关机/重启' },
    { pattern: /^kill\s+-9/i, reason: '强制终止进程' },
    { pattern: /^pkill/i, reason: '终止进程' },
    { pattern: /^iptables/i, reason: '防火墙配置' },
    { pattern: /^wget\s+.*\|\s*(ba)?sh/i, reason: '下载并执行' },
    { pattern: /^curl\s+.*\|\s*(ba)?sh/i, reason: '下载并执行' },
    { pattern: /^sudo\s+rm/i, reason: 'sudo 删除' },
    { pattern: /^sudo\s+chmod/i, reason: 'sudo 修改权限' },
  ],
  
  // 🟡 中等风险（根据上下文）
  MODERATE: [
    { pattern: /^git\s+push/i, reason: '推送代码' },
    { pattern: /^git\s+reset\s+--hard/i, reason: '硬重置' },
    { pattern: /^npm\s+publish/i, reason: '发布包' },
    { pattern: /^docker\s+rm/i, reason: '删除容器' },
    { pattern: /^kubectl\s+delete/i, reason: '删除 K8s 资源' },
    { pattern: /^terraform\s+destroy/i, reason: '销毁基础设施' },
    { pattern: /^ansible-playbook/i, reason: '执行 Ansible' },
  ],
};

// 安全命令（只读操作）
const SAFE_COMMANDS = new Set([
  'ls', 'dir', 'll', 'la',
  'cat', 'type', 'head', 'tail',
  'grep', 'findstr', 'awk', 'sed',
  'pwd', 'cd', 'pushd', 'popd', 'dirs',
  'echo', 'printf', 'print',
  'git', 'status', 'diff', 'log', 'branch', 'show', 'rev-parse',
  'npm', 'list', 'ls', 'view', 'info',
  'yarn', 'list', 'info',
  'node', 'python', 'java', '-version', '--version',
  'which', 'where', 'whereis',
  'man', 'help', '--help', '-h',
  'ps', 'top', 'htop', 'tasklist',
  'df', 'du', 'free',
  'uname', 'hostname', 'whoami',
  'date', 'time', 'cal',
  'wc', 'sort', 'uniq',
  'find', 'locate',
  'tree',
]);

/**
 * Bash 命令分类器
 */
class BashClassifier {
  constructor() {
    this.safeCommands = SAFE_COMMANDS;
    this.dangerousPatterns = DangerousPatterns;
  }

  /**
   * 解析命令
   */
  parse(command) {
    // 简化的命令解析
    const parts = command.trim().split(/\s+/);
    const baseCommand = parts[0];
    
    return {
      command: baseCommand,
      args: parts.slice(1),
      full: command.trim(),
      isPipe: command.includes('|'),
      isRedirect: command.includes('>') || command.includes('<'),
      isBackground: command.endsWith('&'),
      hasSudo: command.startsWith('sudo '),
    };
  }

  /**
   * 分类命令
   */
  classify(command) {
    const parsed = this.parse(command);
    const risk = this.assessRisk(parsed);
    
    return {
      command,
      level: risk.level,
      score: risk.score,
      reasons: risk.reasons,
      isReadonly: this.isReadonly(parsed),
      needsApproval: risk.level !== 'safe',
      suggestion: this.getSuggestion(risk),
      parsed
    };
  }

  /**
   * 评估风险
   */
  assessRisk(parsed) {
    const reasons = [];
    let score = 0;

    // 检查高危模式
    for (const { pattern, reason } of this.dangerousPatterns.CRITICAL) {
      if (pattern.test(parsed.full)) {
        score = Math.max(score, 95);
        reasons.push(`🔴 CRITICAL: ${reason}`);
      }
    }

    // 检查危险模式
    for (const { pattern, reason } of this.dangerousPatterns.DANGEROUS) {
      if (pattern.test(parsed.full)) {
        score = Math.max(score, 75);
        reasons.push(`🟠 DANGEROUS: ${reason}`);
      }
    }

    // 检查中等风险模式
    for (const { pattern, reason } of this.dangerousPatterns.MODERATE) {
      if (pattern.test(parsed.full)) {
        score = Math.max(score, 45);
        reasons.push(`🟡 MODERATE: ${reason}`);
      }
    }

    // 管道和重定向增加风险
    if (parsed.isPipe) {
      score += 10;
      reasons.push('⚠️ 包含管道');
    }
    if (parsed.isRedirect) {
      score += 15;
      reasons.push('⚠️ 包含重定向');
    }
    if (parsed.hasSudo) {
      score += 20;
      reasons.push('⚠️ 使用 sudo');
    }
    if (parsed.isBackground) {
      score += 5;
      reasons.push('⚠️ 后台执行');
    }

    // 安全命令降低风险
    if (this.safeCommands.has(parsed.command.toLowerCase())) {
      score = Math.min(score, 20);
      if (reasons.length === 0) {
        reasons.push('✅ 已知安全命令');
      }
    }

    // 确定风险等级
    let level;
    if (score >= 90) level = 'critical';
    else if (score >= 60) level = 'dangerous';
    else if (score >= 30) level = 'moderate';
    else level = 'safe';

    return { level, score, reasons };
  }

  /**
   * 检查是否为只读命令
   */
  isReadonly(parsed) {
    const readonlyCommands = new Set([
      'ls', 'cat', 'grep', 'pwd', 'cd', 'echo',
      'git', 'status', 'diff', 'log', 'branch', 'show',
      'npm', 'list', 'ls', 'view', 'info',
      'ps', 'top', 'htop', 'df', 'du', 'free',
      'uname', 'hostname', 'whoami', 'date', 'time'
    ]);

    return readonlyCommands.has(parsed.command.toLowerCase()) &&
           !parsed.hasSudo &&
           !parsed.isRedirect;
  }

  /**
   * 获取建议
   */
  getSuggestion(risk) {
    switch (risk.level) {
      case 'critical':
        return '⛔ 强烈建议不要执行此命令';
      case 'dangerous':
        return '⚠️ 请仔细检查命令参数';
      case 'moderate':
        return 'ℹ️ 注意确认操作目标';
      case 'safe':
        return '✅ 可以安全执行';
      default:
        return '';
    }
  }
}

/**
 * PowerShell 命令分类器
 */
class PowerShellClassifier {
  constructor() {
    this.dangerousCmdlets = new Set([
      'Remove-Item', 'rm', 'del',
      'Stop-Process', 'kill',
      'Format-Volume',
      'Clear-Content',
      'Set-Acl',
      'Remove-Variable',
      'Unregister-Event',
      'Stop-Service',
      'Disable-Service',
    ]);

    this.safeCmdlets = new Set([
      'Get-ChildItem', 'ls', 'dir',
      'Get-Content', 'cat', 'type',
      'Get-Process', 'ps',
      'Get-Service',
      'Get-Command', 'gcm',
      'Get-Help', 'help',
      'Select-String', 'sls',
      'Where-Object', 'where',
      'Select-Object', 'select',
    ]);
  }

  classify(command) {
    const parsed = this.parse(command);
    const risk = this.assessRisk(parsed);
    
    return {
      command,
      level: risk.level,
      score: risk.score,
      reasons: risk.reasons,
      isReadonly: this.isReadonly(parsed),
      needsApproval: risk.level !== 'safe',
      suggestion: this.getSuggestion(risk),
      parsed
    };
  }

  parse(command) {
    const parts = command.trim().split(/\s+/);
    const cmdlet = parts[0];
    
    return {
      cmdlet,
      command: cmdlet,
      args: parts.slice(1),
      full: command.trim(),
      isPipeline: command.includes('|'),
      isRedirect: command.includes('>') || command.includes('<'),
    };
  }

  assessRisk(parsed) {
    const reasons = [];
    let score = 0;

    // 检查危险 Cmdlet
    if (this.dangerousCmdlets.has(parsed.cmdlet)) {
      score = 75;
      reasons.push('🟠 危险 Cmdlet');
    }

    // 检查参数
    if (parsed.args.some(arg => arg === '-Recurse' || arg === '-Force')) {
      score += 15;
      reasons.push('⚠️ 递归/强制操作');
    }

    // 管道和重定向
    if (parsed.isPipeline) {
      score += 10;
    }
    if (parsed.isRedirect) {
      score += 15;
    }

    // 安全 Cmdlet
    if (this.safeCmdlets.has(parsed.cmdlet)) {
      score = Math.min(score, 20);
      if (reasons.length === 0) {
        reasons.push('✅ 已知安全 Cmdlet');
      }
    }

    // 确定等级
    let level;
    if (score >= 90) level = 'critical';
    else if (score >= 60) level = 'dangerous';
    else if (score >= 30) level = 'moderate';
    else level = 'safe';

    return { level, score, reasons };
  }

  isReadonly(parsed) {
    const readonlyCmdlets = new Set([
      'Get-ChildItem', 'Get-Content', 'Get-Process',
      'Get-Service', 'Get-Command', 'Get-Help',
      'Select-String', 'Where-Object', 'Select-Object'
    ]);

    return readonlyCmdlets.has(parsed.cmdlet) && !parsed.isRedirect;
  }

  getSuggestion(risk) {
    switch (risk.level) {
      case 'critical':
        return '⛔ 强烈建议不要执行此命令';
      case 'dangerous':
        return '⚠️ 请仔细检查命令参数';
      case 'moderate':
        return 'ℹ️ 注意确认操作目标';
      case 'safe':
        return '✅ 可以安全执行';
      default:
        return '';
    }
  }
}

/**
 * 主分类器
 */
class CommandClassifier {
  constructor() {
    this.bashClassifier = new BashClassifier();
    this.powershellClassifier = new PowerShellClassifier();
  }

  /**
   * 分类命令
   */
  classify(command, shell = 'bash') {
    if (shell === 'powershell') {
      return this.powershellClassifier.classify(command);
    }
    return this.bashClassifier.classify(command);
  }

  /**
   * 批量分类
   */
  batchClassify(commands, shell = 'bash') {
    return commands.map(cmd => this.classify(cmd, shell));
  }

  /**
   * 快速检查（仅返回是否需要批准）
   */
  needsApproval(command, shell = 'bash') {
    const result = this.classify(command, shell);
    return result.needsApproval;
  }
}

// 导出
module.exports = {
  BashClassifier,
  PowerShellClassifier,
  CommandClassifier,
  DangerousPatterns,
  SAFE_COMMANDS
};
