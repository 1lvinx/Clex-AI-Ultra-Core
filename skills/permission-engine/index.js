/**
 * Permission Engine - 权限规则引擎
 * 
 * 细粒度的权限控制，支持自动批准策略
 */

const fs = require('fs');
const path = require('path');

// 权限模式
const PermissionMode = {
  PLAN: 'plan',           // 需要计划批准
  AUTO: 'auto',           // 自动批准（安全命令）
  BYPASS: 'bypass'        // 绕过批准（YOLO 模式）
};

// 规则类型
const RuleType = {
  BASH: 'bash',
  POWERSHELL: 'powershell',
  FILE: 'file',
  NETWORK: 'network',
  AGENT: 'agent'
};

// 规则动作
const RuleAction = {
  ALLOW: 'allow',
  DENY: 'deny',
  ASK: 'ask'
};

/**
 * 权限规则类
 */
class PermissionRule {
  constructor({
    id = null,
    type,
    pattern,
    action,
    priority = 0,
    description = '',
    enabled = true,
    createdAt = null
  }) {
    this.id = id || this.generateId();
    this.type = type;
    this.pattern = pattern;
    this.action = action;
    this.priority = priority;
    this.description = description;
    this.enabled = enabled;
    this.createdAt = createdAt || new Date().toISOString();
  }

  generateId() {
    return `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 检查命令是否匹配规则
   */
  match(command) {
    if (!this.enabled) return false;
    
    try {
      const regex = new RegExp(this.pattern);
      return regex.test(command);
    } catch (error) {
      console.error(`Invalid pattern in rule ${this.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * 评估命令权限
   */
  evaluate(command) {
    if (!this.match(command)) {
      return null; // 不匹配
    }

    return {
      ruleId: this.id,
      action: this.action,
      priority: this.priority,
      description: this.description,
      allowed: this.action === RuleAction.ALLOW
    };
  }

  /**
   * 转换为 JSON
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      pattern: this.pattern,
      action: this.action,
      priority: this.priority,
      description: this.description,
      enabled: this.enabled,
      createdAt: this.createdAt
    };
  }

  /**
   * 从 JSON 创建规则
   */
  static fromJSON(json) {
    return new PermissionRule(json);
  }
}

/**
 * 规则引擎类
 */
class RuleEngine {
  constructor(storagePath = null) {
    this.rules = new Map();
    this.storagePath = storagePath || this.getDefaultStoragePath();
    this.load();
  }

  getDefaultStoragePath() {
    const workspace = process.env.OPENCLAW_WORKSPACE || process.cwd();
    return path.join(workspace, '.permission-rules.json');
  }

  /**
   * 添加规则
   */
  addRule(rule) {
    if (!(rule instanceof PermissionRule)) {
      rule = PermissionRule.fromJSON(rule);
    }
    
    this.rules.set(rule.id, rule);
    this.save();
    
    return rule;
  }

  /**
   * 删除规则
   */
  removeRule(ruleId) {
    const deleted = this.rules.delete(ruleId);
    if (deleted) {
      this.save();
    }
    return deleted;
  }

  /**
   * 启用/禁用规则
   */
  setRuleEnabled(ruleId, enabled) {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      this.save();
      return true;
    }
    return false;
  }

  /**
   * 评估命令权限
   */
  evaluate(command, mode = PermissionMode.AUTO) {
    if (mode === PermissionMode.BYPASS) {
      return {
        allowed: true,
        reason: 'Bypass 模式',
        mode: PermissionMode.BYPASS
      };
    }

    // 获取所有匹配的规则
    const matches = [];
    for (const rule of this.rules.values()) {
      const result = rule.evaluate(command);
      if (result) {
        matches.push(result);
      }
    }

    if (matches.length === 0) {
      // 没有匹配规则，根据模式决定
      return {
        allowed: mode === PermissionMode.AUTO,
        reason: '无匹配规则，使用默认策略',
        mode,
        default: true
      };
    }

    // 按优先级排序，返回最高优先级的结果
    matches.sort((a, b) => b.priority - a.priority);
    const bestMatch = matches[0];

    return {
      allowed: bestMatch.allowed,
      reason: bestMatch.description,
      ruleId: bestMatch.ruleId,
      mode,
      matches: matches.length
    };
  }

  /**
   * 批量评估命令
   */
  batchEvaluate(commands, mode = PermissionMode.AUTO) {
    return commands.map(command => ({
      command,
      ...this.evaluate(command, mode)
    }));
  }

  /**
   * 获取所有规则
   */
  listRules({ type = null, enabled = null } = {}) {
    let rules = Array.from(this.rules.values());

    if (type !== null) {
      rules = rules.filter(r => r.type === type);
    }

    if (enabled !== null) {
      rules = rules.filter(r => r.enabled === enabled);
    }

    // 按优先级降序排序
    rules.sort((a, b) => b.priority - a.priority);

    return rules.map(r => r.toJSON());
  }

  /**
   * 获取规则
   */
  getRule(ruleId) {
    const rule = this.rules.get(ruleId);
    return rule ? rule.toJSON() : null;
  }

  /**
   * 检测规则冲突
   */
  detectConflicts() {
    const conflicts = [];
    const rules = Array.from(this.rules.values());

    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = rules[i];
        const rule2 = rules[j];

        // 相同类型和动作的规则不会冲突
        if (rule1.type !== rule2.type) continue;
        if (rule1.action === rule2.action) continue;

        // 检查模式是否可能匹配相同命令
        if (this.patternsMayConflict(rule1.pattern, rule2.pattern)) {
          conflicts.push({
            rule1: rule1.toJSON(),
            rule2: rule2.toJSON(),
            issue: '规则可能匹配相同命令但动作不同'
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 检查两个模式是否可能冲突
   */
  patternsMayConflict(pattern1, pattern2) {
    // 简化的冲突检测
    // 如果两个模式完全相同，肯定冲突
    if (pattern1 === pattern2) return true;

    // 如果一个模式是另一个的子串，可能冲突
    if (pattern1.includes(pattern2) || pattern2.includes(pattern1)) return true;

    // 更复杂的冲突检测需要正则分析，这里简化处理
    return false;
  }

  /**
   * 保存规则到文件
   */
  save() {
    const data = {
      version: 1,
      updatedAt: new Date().toISOString(),
      rules: Array.from(this.rules.values()).map(r => r.toJSON())
    };

    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
  }

  /**
   * 从文件加载规则
   */
  load() {
    if (!fs.existsSync(this.storagePath)) {
      // 加载默认规则
      this.loadDefaultRules();
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
      
      for (const ruleJson of data.rules || []) {
        const rule = PermissionRule.fromJSON(ruleJson);
        this.rules.set(rule.id, rule);
      }

      console.log(`Loaded ${this.rules.size} permission rules`);
    } catch (error) {
      console.error(`Failed to load rules: ${error.message}`);
      this.loadDefaultRules();
    }
  }

  /**
   * 加载默认规则
   */
  loadDefaultRules() {
    const defaultRules = [
      // 安全的 Bash 命令
      new PermissionRule({
        type: RuleType.BASH,
        pattern: '^ls\\s',
        action: RuleAction.ALLOW,
        priority: 10,
        description: '允许 ls 命令'
      }),
      new PermissionRule({
        type: RuleType.BASH,
        pattern: '^pwd$',
        action: RuleAction.ALLOW,
        priority: 10,
        description: '允许 pwd 命令'
      }),
      new PermissionRule({
        type: RuleType.BASH,
        pattern: '^cd\\s',
        action: RuleAction.ALLOW,
        priority: 10,
        description: '允许 cd 命令'
      }),
      new PermissionRule({
        type: RuleType.BASH,
        pattern: '^cat\\s',
        action: RuleAction.ALLOW,
        priority: 10,
        description: '允许 cat 命令'
      }),
      new PermissionRule({
        type: RuleType.BASH,
        pattern: '^grep\\s',
        action: RuleAction.ALLOW,
        priority: 10,
        description: '允许 grep 命令'
      }),
      new PermissionRule({
        type: RuleType.BASH,
        pattern: '^echo\\s',
        action: RuleAction.ALLOW,
        priority: 10,
        description: '允许 echo 命令'
      }),
      new PermissionRule({
        type: RuleType.BASH,
        pattern: '^git\\s+(status|diff|log|branch)',
        action: RuleAction.ALLOW,
        priority: 10,
        description: '允许 git 只读命令'
      }),
      
      // 危险的 Bash 命令
      new PermissionRule({
        type: RuleType.BASH,
        pattern: '^rm\\s+-rf',
        action: RuleAction.DENY,
        priority: 100,
        description: '禁止 rm -rf 命令'
      }),
      new PermissionRule({
        type: RuleType.BASH,
        pattern: '^dd\\s+if=',
        action: RuleAction.DENY,
        priority: 100,
        description: '禁止 dd 写入命令'
      }),
      new PermissionRule({
        type: RuleType.BASH,
        pattern: '^mkfs',
        action: RuleAction.DENY,
        priority: 100,
        description: '禁止 mkfs 格式化命令'
      }),
      new PermissionRule({
        type: RuleType.BASH,
        pattern: 'chmod\\s+-R\\s+777',
        action: RuleAction.DENY,
        priority: 100,
        description: '禁止 chmod -R 777'
      }),
    ];

    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule);
    }

    this.save();
    console.log(`Loaded ${defaultRules.length} default permission rules`);
  }

  /**
   * 导出规则到文件
   */
  exportToFile(filePath) {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      rules: Array.from(this.rules.values()).map(r => r.toJSON())
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return data.rules.length;
  }

  /**
   * 从文件导入规则
   */
  importFromFile(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let imported = 0;

    for (const ruleJson of data.rules || []) {
      const rule = PermissionRule.fromJSON(ruleJson);
      // 生成新 ID 避免冲突
      rule.id = rule.generateId();
      this.rules.set(rule.id, rule);
      imported++;
    }

    this.save();
    return imported;
  }
}

// 导出
module.exports = {
  PermissionMode,
  RuleType,
  RuleAction,
  PermissionRule,
  RuleEngine
};
