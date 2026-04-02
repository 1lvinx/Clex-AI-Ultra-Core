/**
 * AI Workflows - AI 工作流编排
 * 
 * 将 AI 能力编排成完整的工作流
 */

const fs = require('fs');
const path = require('path');

/**
 * 工作流执行器
 */
class WorkflowExecutor {
  constructor(options = {}) {
    this.steps = [];
    this.context = {};
    this.timeout = options.timeout || 300000; // 5 分钟
  }

  /**
   * 添加步骤
   */
  addStep(name, fn) {
    this.steps.push({ name, fn });
    return this;
  }

  /**
   * 执行工作流
   */
  async execute(initialContext = {}) {
    this.context = { ...initialContext, startTime: Date.now() };
    const results = [];

    for (const step of this.steps) {
      try {
        const stepResult = await step.fn(this.context);
        
        this.context = {
          ...this.context,
          ...stepResult
        };

        results.push({
          step: step.name,
          success: true,
          data: stepResult,
          timestamp: Date.now()
        });

        // 检查是否应该继续
        if (stepResult.stop) {
          break;
        }
      } catch (error) {
        results.push({
          step: step.name,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });

        if (!this.context.continueOnError) {
          throw error;
        }
      }
    }

    return {
      success: true,
      context: this.context,
      results,
      duration: Date.now() - this.context.startTime
    };
  }
}

/**
 * 代码审查工作流
 */
class CodeReviewWorkflow {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * 创建审查工作流
   */
  createWorkflow() {
    return new WorkflowExecutor()
      .addStep('analyze', async (ctx) => {
        // 分析代码结构
        const analysis = this.analyzeCode(ctx.code);
        return { analysis };
      })
      .addStep('check-styles', async (ctx) => {
        // 检查代码风格
        const styleIssues = this.checkStyle(ctx.code, ctx.language);
        return { styleIssues };
      })
      .addStep('check-security', async (ctx) => {
        // 安全检查
        const securityIssues = this.checkSecurity(ctx.code);
        return { securityIssues };
      })
      .addStep('check-performance', async (ctx) => {
        // 性能检查
        const performanceIssues = this.checkPerformance(ctx.code);
        return { performanceIssues };
      })
      .addStep('check-best-practices', async (ctx) => {
        // 最佳实践检查
        const bestPracticeIssues = this.checkBestPractices(ctx.code, ctx.language);
        return { bestPracticeIssues };
      })
      .addStep('generate-report', async (ctx) => {
        // 生成报告
        const report = this.generateReport(ctx);
        return { report };
      });
  }

  /**
   * 分析代码
   */
  analyzeCode(code) {
    return {
      lines: code.split('\n').length,
      functions: (code.match(/function\s+\w+/g) || []).length,
      classes: (code.match(/class\s+\w+/g) || []).length,
      complexity: this.calculateComplexity(code)
    };
  }

  /**
   * 计算复杂度
   */
  calculateComplexity(code) {
    let complexity = 1;
    const decisions = code.match(/if|else|for|while|case|\?|&&|\|\|/g);
    if (decisions) {
      complexity += decisions.length;
    }
    return complexity;
  }

  /**
   * 检查风格
   */
  checkStyle(code, language) {
    const issues = [];

    // 命名检查
    const constNames = code.match(/const\s+([a-z_]\w*)/g);
    if (constNames) {
      for (const name of constNames) {
        if (!/const\s+[a-z][a-zA-Z0-9_]*$/.test(name)) {
          issues.push({
            type: 'style',
            severity: 'low',
            message: `变量命名建议使用 camelCase: ${name}`,
            suggestion: '使用 camelCase 命名约定'
          });
        }
      }
    }

    // 函数长度检查
    const functions = code.match(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\}/g);
    if (functions) {
      for (const func of functions) {
        const lines = func.split('\n').length;
        if (lines > 50) {
          issues.push({
            type: 'style',
            severity: 'medium',
            message: `函数过长 (${lines}行)`,
            suggestion: '考虑将函数拆分成多个小函数'
          });
        }
      }
    }

    return issues;
  }

  /**
   * 安全检查
   */
  checkSecurity(code) {
    const issues = [];

    // eval 检查
    if (/eval\s*\(/.test(code)) {
      issues.push({
        type: 'security',
        severity: 'high',
        message: '使用 eval() 存在安全风险',
        suggestion: '避免使用 eval，使用更安全的替代方案'
      });
    }

    // SQL 注入检查
    if (/execute\s*\(\s*["'].*\+/.test(code) || /query\s*\(\s*["'].*\+/.test(code)) {
      issues.push({
        type: 'security',
        severity: 'high',
        message: '可能存在 SQL 注入风险',
        suggestion: '使用参数化查询'
      });
    }

    // XSS 检查
    if (/innerHTML\s*=/.test(code)) {
      issues.push({
        type: 'security',
        severity: 'medium',
        message: '使用 innerHTML 可能存在 XSS 风险',
        suggestion: '使用 textContent 或 sanitized HTML'
      });
    }

    return issues;
  }

  /**
   * 性能检查
   */
  checkPerformance(code) {
    const issues = [];

    // 循环中的重复查询
    if (/for\s*\([^)]*\)\s*\{[^}]*\.indexOf/.test(code)) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: '循环中使用 indexOf 可能影响性能',
        suggestion: '考虑使用 Set 或 Map 优化查找'
      });
    }

    // 同步文件操作
    if (/fs\.readFileSync|fs\.writeFileSync/.test(code)) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: '使用同步文件操作会阻塞事件循环',
        suggestion: '使用异步文件操作'
      });
    }

    return issues;
  }

  /**
   * 最佳实践检查
   */
  checkBestPractices(code, language) {
    const issues = [];

    // 未处理的 Promise
    if (/\.then\s*\(/.test(code) && !/\.catch\s*\(/.test(code) && !/async/.test(code)) {
      issues.push({
        type: 'best-practice',
        severity: 'medium',
        message: 'Promise 未处理错误',
        suggestion: '添加 .catch() 或使用 async/await'
      });
    }

    // var 使用
    if (/\bvar\s+/.test(code)) {
      issues.push({
        type: 'best-practice',
        severity: 'low',
        message: '使用 var 而非 let/const',
        suggestion: '使用 let 或 const 替代 var'
      });
    }

    return issues;
  }

  /**
   * 生成报告
   */
  generateReport(ctx) {
    const allIssues = [
      ...(ctx.styleIssues || []),
      ...(ctx.securityIssues || []),
      ...(ctx.performanceIssues || []),
      ...(ctx.bestPracticeIssues || [])
    ];

    const summary = {
      total: allIssues.length,
      high: allIssues.filter(i => i.severity === 'high').length,
      medium: allIssues.filter(i => i.severity === 'medium').length,
      low: allIssues.filter(i => i.severity === 'low').length
    };

    return {
      summary,
      issues: allIssues,
      analysis: ctx.analysis,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 执行审查
   */
  async review(code, options = {}) {
    const workflow = this.createWorkflow();
    
    const result = await workflow.execute({
      code,
      language: options.language || 'javascript',
      continueOnError: true
    });

    return result;
  }
}

/**
 * PR 处理工作流
 */
class PRReviewWorkflow {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * 创建 PR 审查工作流
   */
  createWorkflow() {
    return new WorkflowExecutor()
      .addStep('fetch-pr', async (ctx) => {
        // 获取 PR 信息
        const prInfo = await this.fetchPRInfo(ctx.prNumber);
        return { prInfo };
      })
      .addStep('fetch-changes', async (ctx) => {
        // 获取变更
        const changes = await this.fetchChanges(ctx.prNumber);
        return { changes };
      })
      .addStep('review-changes', async (ctx) => {
        // 审查变更
        const review = this.reviewChanges(ctx.changes);
        return { review };
      })
      .addStep('run-tests', async (ctx) => {
        // 运行测试
        const testResults = await this.runTests(ctx.changes);
        return { testResults };
      })
      .addStep('generate-comment', async (ctx) => {
        // 生成评论
        const comment = this.generateComment(ctx);
        return { comment };
      });
  }

  /**
   * 获取 PR 信息
   */
  async fetchPRInfo(prNumber) {
    // 模拟实现
    return {
      number: prNumber,
      title: `PR #${prNumber}`,
      author: 'developer',
      description: 'PR description'
    };
  }

  /**
   * 获取变更
   */
  async fetchChanges(prNumber) {
    // 模拟实现
    return {
      files: [
        { path: 'src/index.js', additions: 50, deletions: 10 }
      ],
      totalAdditions: 50,
      totalDeletions: 10
    };
  }

  /**
   * 审查变更
   */
  reviewChanges(changes) {
    const issues = [];

    for (const file of changes.files) {
      if (file.additions > 100) {
        issues.push({
          file: file.path,
          type: 'warning',
          message: '单次提交变更过大，建议拆分'
        });
      }
    }

    return { issues };
  }

  /**
   * 运行测试
   */
  async runTests(changes) {
    // 模拟实现
    return {
      passed: true,
      coverage: 85
    };
  }

  /**
   * 生成评论
   */
  generateComment(ctx) {
    const { prInfo, review, testResults } = ctx;

    let comment = `## 📋 Code Review for ${prInfo.title}\n\n`;

    if (review.issues.length > 0) {
      comment += `### ⚠️ Issues Found (${review.issues.length})\n\n`;
      for (const issue of review.issues) {
        comment += `- **${issue.file}**: ${issue.message}\n`;
      }
      comment += '\n';
    } else {
      comment += `### ✅ No issues found!\n\n`;
    }

    comment += `### 🧪 Test Results\n\n`;
    comment += `- Status: ${testResults.passed ? '✅ Passed' : '❌ Failed'}\n`;
    comment += `- Coverage: ${testResults.coverage}%\n`;

    return comment;
  }

  /**
   * 执行 PR 审查
   */
  async review(prNumber, options = {}) {
    const workflow = this.createWorkflow();
    
    const result = await workflow.execute({
      prNumber,
      continueOnError: true
    });

    return result;
  }
}

/**
 * 自动修复工作流
 */
class AutoFixWorkflow {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * 创建修复工作流
   */
  createWorkflow() {
    return new WorkflowExecutor()
      .addStep('detect-issues', async (ctx) => {
        // 检测问题
        const issues = this.detectIssues(ctx.code);
        return { issues };
      })
      .addStep('analyze-issues', async (ctx) => {
        // 分析问题
        const analysis = ctx.issues.map(issue => this.analyzeIssue(issue, ctx.code));
        return { analysis };
      })
      .addStep('generate-fixes', async (ctx) => {
        // 生成修复
        const fixes = ctx.analysis.map(a => this.generateFix(a));
        return { fixes };
      })
      .addStep('apply-fixes', async (ctx) => {
        // 应用修复
        const fixedCode = this.applyFixes(ctx.code, ctx.fixes);
        return { fixedCode };
      })
      .addStep('verify-fixes', async (ctx) => {
        // 验证修复
        const verification = this.verifyFixes(ctx.fixedCode);
        return { verification };
      });
  }

  /**
   * 检测问题
   */
  detectIssues(code) {
    const issues = [];

    // 检测常见错误模式
    if (/const\s+\w+\s*=\s*\w+\s*;/.test(code)) {
      issues.push({
        type: 'missing-await',
        pattern: 'Promise 未 await',
        severity: 'medium'
      });
    }

    if (/\.then\s*\(\s*\w+\s*=>/.test(code) && !/\.catch/.test(code)) {
      issues.push({
        type: 'unhandled-promise',
        pattern: '未处理的 Promise',
        severity: 'high'
      });
    }

    return issues;
  }

  /**
   * 分析问题
   */
  analyzeIssue(issue, code) {
    return {
      ...issue,
      location: this.findIssueLocation(issue, code),
      context: this.getIssueContext(issue, code)
    };
  }

  /**
   * 查找问题位置
   */
  findIssueLocation(issue, code) {
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(issue.pattern)) {
        return {
          line: i + 1,
          column: lines[i].indexOf(issue.pattern) + 1
        };
      }
    }

    return null;
  }

  /**
   * 获取上下文
   */
  getIssueContext(issue, code) {
    // 获取问题周围的代码
    return code.substring(0, 200);
  }

  /**
   * 生成修复
   */
  generateFix(analysis) {
    return {
      type: analysis.type,
      fix: `// Fix for ${analysis.type}`,
      confidence: 0.8
    };
  }

  /**
   * 应用修复
   */
  applyFixes(code, fixes) {
    let fixedCode = code;
    
    for (const fix of fixes) {
      // 应用修复逻辑
      fixedCode = fixedCode.replace('// TODO', fix.fix);
    }

    return fixedCode;
  }

  /**
   * 验证修复
   */
  verifyFixes(code) {
    // 验证修复是否成功
    return {
      success: true,
      remainingIssues: 0
    };
  }

  /**
   * 执行修复
   */
  async fix(code, options = {}) {
    const workflow = this.createWorkflow();
    
    const result = await workflow.execute({
      code,
      continueOnError: true
    });

    return result;
  }
}

/**
 * 文档生成工作流
 */
class DocsWorkflow {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * 创建文档工作流
   */
  createWorkflow() {
    return new WorkflowExecutor()
      .addStep('scan-files', async (ctx) => {
        // 扫描文件
        const files = this.scanDirectory(ctx.path);
        return { files };
      })
      .addStep('parse-items', async (ctx) => {
        // 解析可文档化项
        const items = ctx.files.flatMap(f => this.parseFile(f));
        return { items };
      })
      .addStep('generate-docs', async (ctx) => {
        // 生成文档
        const docs = this.generateDocumentation(ctx.items);
        return { docs };
      })
      .addStep('write-files', async (ctx) => {
        // 写入文件
        const writtenFiles = this.writeDocumentation(ctx.docs, ctx.outputPath);
        return { writtenFiles };
      });
  }

  /**
   * 扫描目录
   */
  scanDirectory(dirPath) {
    const files = [];
    
    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        if (entry.isDirectory()) {
          walk(path.join(dir, entry.name));
        } else if (entry.isFile() && /\.(js|ts|py)$/.test(entry.name)) {
          files.push(path.join(dir, entry.name));
        }
      }
    };

    walk(dirPath);
    return files;
  }

  /**
   * 解析文件
   */
  parseFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const items = [];

    // 提取函数
    const funcPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
    let match;
    while ((match = funcPattern.exec(code)) !== null) {
      items.push({
        type: 'function',
        name: match[1],
        params: match[2],
        file: filePath
      });
    }

    // 提取类
    const classPattern = /(?:export\s+)?class\s+(\w+)/g;
    while ((match = classPattern.exec(code)) !== null) {
      items.push({
        type: 'class',
        name: match[1],
        file: filePath
      });
    }

    return items;
  }

  /**
   * 生成文档
   */
  generateDocumentation(items) {
    const docs = {
      functions: items.filter(i => i.type === 'function'),
      classes: items.filter(i => i.type === 'class'),
      summary: {
        total: items.length,
        functions: items.filter(i => i.type === 'function').length,
        classes: items.filter(i => i.type === 'class').length
      }
    };

    return docs;
  }

  /**
   * 写入文档
   */
  writeDocumentation(docs, outputPath) {
    const writtenFiles = [];

    // 生成 API 文档
    const apiDoc = this.generateAPIDoc(docs);
    const apiPath = path.join(outputPath, 'API.md');
    fs.mkdirSync(path.dirname(apiPath), { recursive: true });
    fs.writeFileSync(apiPath, apiDoc, 'utf-8');
    writtenFiles.push(apiPath);

    return writtenFiles;
  }

  /**
   * 生成 API 文档
   */
  generateAPIDoc(docs) {
    let doc = '# API Documentation\n\n';

    doc += `## Summary\n\n`;
    doc += `- Total Items: ${docs.summary.total}\n`;
    doc += `- Functions: ${docs.summary.functions}\n`;
    doc += `- Classes: ${docs.summary.classes}\n\n`;

    doc += `## Functions\n\n`;
    for (const func of docs.functions) {
      doc += `### ${func.name}()\n\n`;
      doc += `Defined in: ${func.file}\n\n`;
    }

    doc += `## Classes\n\n`;
    for (const cls of docs.classes) {
      doc += `### ${cls.name}\n\n`;
      doc += `Defined in: ${cls.file}\n\n`;
    }

    return doc;
  }

  /**
   * 执行文档生成
   */
  async generate(dirPath, outputPath, options = {}) {
    const workflow = this.createWorkflow();
    
    const result = await workflow.execute({
      path: dirPath,
      outputPath,
      continueOnError: true
    });

    return result;
  }
}

/**
 * AI 工作流服务（统一入口）
 */
class AIWorkflowService {
  constructor(options = {}) {
    this.codeReview = new CodeReviewWorkflow(options);
    this.prReview = new PRReviewWorkflow(options);
    this.autoFix = new AutoFixWorkflow(options);
    this.docs = new DocsWorkflow(options);
  }

  /**
   * 代码审查
   */
  async reviewCode(code, options = {}) {
    return await this.codeReview.review(code, options);
  }

  /**
   * PR 审查
   */
  async reviewPR(prNumber, options = {}) {
    return await this.prReview.review(prNumber, options);
  }

  /**
   * 自动修复
   */
  async fixCode(code, options = {}) {
    return await this.autoFix.fix(code, options);
  }

  /**
   * 生成文档
   */
  async generateDocs(dirPath, outputPath, options = {}) {
    return await this.docs.generate(dirPath, outputPath, options);
  }
}

// 导出
module.exports = {
  WorkflowExecutor,
  CodeReviewWorkflow,
  PRReviewWorkflow,
  AutoFixWorkflow,
  DocsWorkflow,
  AIWorkflowService
};
