/**
 * AI Code Assistant - AI 代码助手
 * 
 * 基于 AI 的代码生成、解释、Bug 修复、重构建议
 */

const fs = require('fs');
const path = require('path');

/**
 * 代码生成器
 */
class CodeGenerator {
  constructor(options = {}) {
    this.model = options.model || 'default';
    this.temperature = options.temperature || 0.7;
    this.maxTokens = options.maxTokens || 2000;
  }

  /**
   * 根据提示生成代码
   */
  async generate(prompt, options = {}) {
    const {
      language = 'javascript',
      style = 'modern',
      includeTests = false,
      includeComments = true,
      outputFile = null
    } = options;

    const systemPrompt = this.buildSystemPrompt(language, style);
    const userPrompt = this.buildUserPrompt(prompt, { includeTests, includeComments });

    // 调用 AI 模型生成代码
    const result = await this.callAI(systemPrompt, userPrompt);

    if (result.success && outputFile) {
      await this.writeToFile(outputFile, result.code);
    }

    return result;
  }

  /**
   * 生成函数实现
   */
  async generateFunction(signature, description, options = {}) {
    const prompt = `请实现以下函数：

函数签名：${signature}
功能描述：${description}

要求：
- 完整的错误处理
- 清晰的变量命名
- 必要的注释`;

    return await this.generate(prompt, options);
  }

  /**
   * 生成类
   */
  async generateClass(name, description, methods = [], options = {}) {
    const prompt = `请创建以下类：

类名：${name}
功能描述：${description}
需要的方法：${methods.join(', ')}

要求：
- 完整的构造函数
- 类型注解（如适用）
- 方法注释
- 错误处理`;

    return await this.generate(prompt, options);
  }

  /**
   * 生成单元测试
   */
  async generateTests(sourceCode, options = {}) {
    const {
      framework = 'jest',
      coverage = true
    } = options;

    const prompt = `请为以下代码生成单元测试：

${sourceCode}

要求：
- 使用 ${framework} 测试框架
- 覆盖所有边界情况
- 包含错误处理测试
- 清晰的测试描述`;

    return await this.generate(prompt, { ...options, includeTests: false });
  }

  /**
   * 生成样板代码
   */
  async generateBoilerplate(type, options = {}) {
    const templates = {
      'express-server': this.expressServerTemplate(),
      'react-component': this.reactComponentTemplate(),
      'python-class': this.pythonClassTemplate(),
      'go-handler': this.goHandlerTemplate(),
      'rust-struct': this.rustStructTemplate()
    };

    const template = templates[type];
    if (!template) {
      return {
        success: false,
        error: `未知的模板类型：${type}`
      };
    }

    return {
      success: true,
      code: template(options),
      type
    };
  }

  /**
   * Express 服务器模板
   */
  expressServerTemplate() {
    return (options = {}) => `const express = require('express');
const app = express();
const PORT = process.env.PORT || ${options.port || 3000};

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`;
  }

  /**
   * React 组件模板
   */
  reactComponentTemplate() {
    return (options = {}) => `import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ${options.name || 'Component'} = ({ ${options.props || 'title' } }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // 组件挂载时的逻辑
    return () => {
      // 清理逻辑
    };
  }, []);

  const handleClick = () => {
    // 点击处理
  };

  return (
    <div className="${options.name?.toLowerCase() || 'component'}">
      <h1>{${options.props || 'title'}}</h1>
    </div>
  );
};

${options.name || 'Component'}.propTypes = {
  ${options.props || 'title'}: PropTypes.string.isRequired
};

export default ${options.name || 'Component'};`;
  }

  /**
   * Python 类模板
   */
  pythonClassTemplate() {
    return (options = {}) => `class ${options.name || 'ClassName'}:
    """${options.description || '类描述'}"""
    
    def __init__(self, ${options.params || 'arg1, arg2'}):
        """初始化方法
        
        Args:
            ${options.params || 'arg1'}: 参数 1 描述
            ${options.params || 'arg2'}: 参数 2 描述
        """
        self.${options.params?.split(',')[0]?.trim() || 'arg1'} = ${options.params?.split(',')[0]?.trim() || 'arg1'}
        self.${options.params?.split(',')[1]?.trim() || 'arg2'} = ${options.params?.split(',')[1]?.trim() || 'arg2'}
    
    def ${options.method || 'method_name'}(self):
        """方法描述
        
        Returns:
            返回值描述
        """
        pass
    
    def __str__(self):
        return f"${options.name || 'ClassName'}(${self.${options.params?.split(',')[0]?.trim() || 'arg1'}})"`;
  }

  /**
   * Go Handler 模板
   */
  goHandlerTemplate() {
    return (options = {}) => `package ${options.package || 'main'}

import (
\t"encoding/json"
\t"net/http"
)

// ${options.name || 'HandlerName'}Handler 处理 HTTP 请求
func ${options.name || 'HandlerName'}Handler(w http.ResponseWriter, r *http.Request) {
\tif r.Method != http.Method${options.method || 'Get'} {
\t\thttp.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
\t\treturn
\t}

\t// 解析请求体
\tvar req ${options.requestType || 'Request'}
\tif err := json.NewDecoder(r.Body).Decode(&req); err != nil {
\t\thttp.Error(w, err.Error(), http.StatusBadRequest)
\t\treturn
\t}

\t// 处理逻辑
\tresp, err := handle${options.name || 'Request'}(req)
\tif err != nil {
\t\thttp.Error(w, err.Error(), http.StatusInternalServerError)
\t\treturn
\t}

\t// 返回响应
\tw.Header().Set("Content-Type", "application/json")
\tjson.NewEncoder(w).Encode(resp)
}

// ${options.requestType || 'Request'} 请求结构
type ${options.requestType || 'Request'} struct {
\t${options.field || 'Field'} string \`json:"${options.field?.toLowerCase() || 'field'}"\`
}

// ${options.responseType || 'Response'} 响应结构
type ${options.responseType || 'Response'} struct {
\tSuccess bool        \`json:"success"\`
\tData    interface{} \`json:"data,omitempty"\`
\tError   string      \`json:"error,omitempty"\`
}`;
  }

  /**
   * Rust Struct 模板
   */
  rustStructTemplate() {
    return (options = {}) => `/// ${options.description || '结构体描述'}
#[derive(Debug, Clone, ${options.derives || 'Serialize, Deserialize'})]
pub struct ${options.name || 'StructName'} {
    /// ${options.field1Desc || '字段 1 描述'}
    pub ${options.field1 || 'field1'}: ${options.type1 || 'String'},
    /// ${options.field2Desc || '字段 2 描述'}
    pub ${options.field2 || 'field2'}: ${options.type2 || 'i32'},
}

impl ${options.name || 'StructName'} {
    /// 创建新实例
    /// 
    /// # Arguments
    /// 
    /// * \`${options.field1 || 'field1'}\` - ${options.field1Desc || '字段 1 描述'}
    /// * \`${options.field2 || 'field2'}\` - ${options.field2Desc || '字段 2 描述'}
    /// 
    /// # Returns
    /// 
    /// 新的 ${options.name || 'StructName'} 实例
    pub fn new(${options.field1 || 'field1'}: ${options.type1 || 'String'}, ${options.field2 || 'field2'}: ${options.type2 || 'i32'}) -> Self {
        Self {
            ${options.field1 || 'field1'},
            ${options.field2 || 'field2'},
        }
    }

    /// ${options.methodDesc || '方法描述'}
    pub fn ${options.method || 'method_name'}(&self) -> ${options.returnType || 'Result<(), Error>'} {
        // 实现逻辑
        Ok(())
    }
}`;
  }

  /**
   * 构建系统提示
   */
  buildSystemPrompt(language, style) {
    const prompts = {
      javascript: `你是一个专业的 JavaScript 开发者。请生成${style}风格的代码。
要求：
- 使用 ES6+ 语法
- 清晰的变量命名
- 完整的错误处理
- 适当的注释
- 遵循最佳实践`,
      typescript: `你是一个专业的 TypeScript 开发者。请生成${style}风格的代码。
要求：
- 完整的类型定义
- 使用接口和类型别名
- 泛型当适用
- 清晰的错误处理
- 遵循 TypeScript 最佳实践`,
      python: `你是一个专业的 Python 开发者。请生成${style}风格的代码。
要求：
- 遵循 PEP 8
- 使用类型提示
- 完整的 docstring
- 适当的错误处理
- Pythonic 的代码风格`,
      go: `你是一个专业的 Go 开发者。请生成${style}风格的代码。
要求：
- 遵循 Go 代码规范
- 适当的错误处理
- 清晰的命名
- 必要的注释
- 遵循 Go 最佳实践`,
      rust: `你是一个专业的 Rust 开发者。请生成${style}风格的代码。
要求：
- 遵循 Rust 规范
- 适当的错误处理（Result/Option）
- 内存安全
- 清晰的命名
- 必要的文档注释`
    };

    return prompts[language] || prompts.javascript;
  }

  /**
   * 构建用户提示
   */
  buildUserPrompt(prompt, options = {}) {
    let userPrompt = `请生成代码：${prompt}`;

    if (options.includeTests) {
      userPrompt += '\n\n请同时生成对应的单元测试。';
    }

    if (options.includeComments) {
      userPrompt += '\n\n请添加必要的注释。';
    }

    return userPrompt;
  }

  /**
   * 调用 AI 模型
   */
  async callAI(systemPrompt, userPrompt) {
    // 这里应该调用实际的 AI 模型
    // 由于是模拟实现，返回一个示例响应
    return {
      success: true,
      code: `// 生成的代码示例\nconsole.log('Hello World');`,
      model: this.model,
      tokens: 100
    };
  }

  /**
   * 写入文件
   */
  async writeToFile(filePath, code) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, code, 'utf-8');
  }
}

/**
 * 代码解释器
 */
class CodeExplainer {
  constructor(options = {}) {
    this.detailLevel = options.detailLevel || 'medium'; // basic, medium, detailed
    this.includeExamples = options.includeExamples !== false;
  }

  /**
   * 解释代码
   */
  async explain(code, options = {}) {
    const {
      language = 'javascript',
      focus = null
    } = options;

    const analysis = this.analyzeCode(code, language);
    
    const explanation = {
      summary: this.generateSummary(analysis),
      functions: this.explainFunctions(analysis.functions, focus),
      classes: this.explainClasses(analysis.classes, focus),
      complexity: this.explainComplexity(analysis.complexity),
      dependencies: analysis.dependencies,
      examples: this.includeExamples ? this.generateExamples(analysis) : null
    };

    return {
      success: true,
      code,
      language,
      explanation
    };
  }

  /**
   * 解释文件
   */
  async explainFile(filePath, options = {}) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const language = this.detectLanguage(filePath);
    
    return await this.explain(code, { ...options, language });
  }

  /**
   * 分析代码
   */
  analyzeCode(code, language) {
    const analysis = {
      lines: code.split('\n').length,
      functions: [],
      classes: [],
      complexity: {
        cyclomatic: 0,
        cognitive: 0
      },
      dependencies: []
    };

    // 提取函数
    const funcPatterns = [
      /function\s+(\w+)\s*\([^)]*\)/g,
      /const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
      /(\w+)\s*\([^)]*\)\s*\{/g
    ];

    for (const pattern of funcPatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const name = match[1];
        if (!['if', 'for', 'while', 'switch', 'catch'].includes(name)) {
          analysis.functions.push({
            name,
            position: match.index
          });
        }
      }
    }

    // 提取类
    const classPattern = /class\s+(\w+)/g;
    let match;
    while ((match = classPattern.exec(code)) !== null) {
      analysis.classes.push({
        name: match[1],
        position: match.index
      });
    }

    // 计算复杂度
    analysis.complexity.cyclomatic = this.calculateComplexity(code);

    // 提取依赖
    analysis.dependencies = this.extractDependencies(code, language);

    return analysis;
  }

  /**
   * 计算复杂度
   */
  calculateComplexity(code) {
    let complexity = 1;
    
    const decisionPoints = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /case\s+/g,
      /\?\s*/g,
      /&&/g,
      /\|\|/g,
      /catch\s*\(/g
    ];

    for (const pattern of decisionPoints) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * 提取依赖
   */
  extractDependencies(code, language) {
    const deps = [];

    if (language === 'javascript' || language === 'typescript') {
      const importPattern = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
      let match;
      while ((match = importPattern.exec(code)) !== null) {
        deps.push({
          path: match[1],
          type: match[1].startsWith('.') ? 'relative' : 'module'
        });
      }

      const requirePattern = /require\s*\(\s*['"](.+?)['"]\s*\)/g;
      while ((match = requirePattern.exec(code)) !== null) {
        deps.push({
          path: match[1],
          type: 'module'
        });
      }
    }

    return deps;
  }

  /**
   * 检测语言
   */
  detectLanguage(filePath) {
    const ext = path.extname(filePath);
    const map = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rs': 'rust'
    };
    return map[ext] || 'javascript';
  }

  /**
   * 生成摘要
   */
  generateSummary(analysis) {
    return `这段代码共 ${analysis.lines} 行，包含 ${analysis.functions.length} 个函数和 ${analysis.classes.length} 个类。
圈复杂度为 ${analysis.complexity.cyclomatic}，${this.getComplexityLevel(analysis.complexity.cyclomatic)}`;
  }

  /**
   * 获取复杂度等级
   */
  getComplexityLevel(complexity) {
    if (complexity <= 5) return '低复杂度，易于理解和维护';
    if (complexity <= 10) return '中等复杂度';
    if (complexity <= 20) return '高复杂度，建议重构';
    return '非常高复杂度，强烈建议重构';
  }

  /**
   * 解释函数
   */
  explainFunctions(functions, focus = null) {
    return functions
      .filter(f => !focus || f.name.toLowerCase().includes(focus.toLowerCase()))
      .map(f => ({
        name: f.name,
        purpose: `函数 \`${f.name}\` 的具体功能需要查看实现细节`,
        suggestions: [
          '查看函数的输入参数',
          '查看函数的返回值',
          '查看函数的副作用'
        ]
      }));
  }

  /**
   * 解释类
   */
  explainClasses(classes, focus = null) {
    return classes
      .filter(f => !focus || f.name.toLowerCase().includes(focus.toLowerCase()))
      .map(c => ({
        name: c.name,
        purpose: `类 \`${c.name}\` 的具体功能需要查看实现细节`,
        suggestions: [
          '查看类的属性和方法',
          '查看类的继承关系',
          '查看类的使用场景'
        ]
      }));
  }

  /**
   * 解释复杂度
   */
  explainComplexity(complexity) {
    const level = this.getComplexityLevel(complexity.cyclomatic);
    
    return {
      cyclomatic: complexity.cyclomatic,
      level,
      recommendations: complexity.cyclomatic > 10
        ? [
            '考虑将大函数拆分成小函数',
            '减少条件判断的嵌套',
            '使用策略模式或状态模式',
            '提取公共逻辑到独立函数'
          ]
        : ['代码复杂度合理，保持当前结构']
    };
  }

  /**
   * 生成示例
   */
  generateExamples(analysis) {
    return {
      usage: `// 使用示例
// 具体用法需要查看代码实现`,
      test: `// 测试示例
// 具体测试需要查看代码实现`
    };
  }
}

/**
 * Bug 修复助手
 */
class BugFixAssistant {
  constructor(options = {}) {
    this.maxAttempts = options.maxAttempts || 3;
  }

  /**
   * 分析错误
   */
  async analyzeError(error, context = {}) {
    const {
      code = null,
      stackTrace = null,
      environment = null
    } = context;

    const analysis = {
      errorType: this.extractErrorType(error),
      errorMessage: error.message || error,
      location: this.extractLocation(stackTrace),
      possibleCauses: this.identifyCauses(error, code),
      suggestions: this.generateSuggestions(error, code)
    };

    return analysis;
  }

  /**
   * 提取错误类型
   */
  extractErrorType(error) {
    const errorStr = error.toString();
    const match = errorStr.match(/^(\w+Error):/);
    return match ? match[1] : 'UnknownError';
  }

  /**
   * 提取位置
   */
  extractLocation(stackTrace) {
    if (!stackTrace) return null;

    const lines = stackTrace.split('\n');
    for (const line of lines) {
      const match = line.match(/at\s+.+\s+\((.+):(\d+):(\d+)\)/);
      if (match) {
        return {
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3])
        };
      }
    }

    return null;
  }

  /**
   * 识别原因
   */
  identifyCauses(error, code) {
    const causes = [];
    const errorType = this.extractErrorType(error);

    switch (errorType) {
      case 'TypeError':
        causes.push('变量可能是 undefined 或 null');
        causes.push('类型不匹配');
        causes.push('方法调用对象不存在');
        break;
      case 'ReferenceError':
        causes.push('变量未定义');
        causes.push('变量作用域问题');
        causes.push('拼写错误');
        break;
      case 'SyntaxError':
        causes.push('语法错误');
        causes.push('缺少括号或引号');
        causes.push('关键字拼写错误');
        break;
      case 'RangeError':
        causes.push('数组索引越界');
        causes.push('递归过深');
        causes.push('数值超出范围');
        break;
      default:
        causes.push('需要查看具体错误信息');
    }

    return causes;
  }

  /**
   * 生成修复建议
   */
  generateSuggestions(error, code) {
    const suggestions = [];
    const errorType = this.extractErrorType(error);

    switch (errorType) {
      case 'TypeError':
        suggestions.push('添加类型检查');
        suggestions.push('使用可选链操作符（?.）');
        suggestions.push('添加默认值');
        break;
      case 'ReferenceError':
        suggestions.push('检查变量是否已声明');
        suggestions.push('检查变量作用域');
        suggestions.push('检查拼写');
        break;
      case 'SyntaxError':
        suggestions.push('检查括号是否匹配');
        suggestions.push('检查引号是否成对');
        suggestions.push('检查关键字拼写');
        break;
    }

    return suggestions;
  }

  /**
   * 生成修复代码
   */
  async generateFix(error, code, options = {}) {
    const analysis = await this.analyzeError(error, { code, ...options });
    
    // 这里应该调用 AI 生成修复代码
    return {
      success: true,
      analysis,
      fixedCode: code, // 实际应该返回修复后的代码
      changes: []
    };
  }
}

/**
 * 代码重构助手
 */
class RefactoringAssistant {
  constructor(options = {}) {
    this.smellThresholds = {
      longFunction: 50,
      longParameterList: 5,
      complexFunction: 10
    };
  }

  /**
   * 检测代码异味
   */
  detectSmells(code) {
    const smells = [];

    // 长函数检测
    const longFunctions = this.detectLongFunctions(code);
    if (longFunctions.length > 0) {
      smells.push({
        type: 'long_function',
        severity: 'medium',
        locations: longFunctions,
        suggestion: '将长函数拆分成多个小函数'
      });
    }

    // 复杂函数检测
    const complexFunctions = this.detectComplexFunctions(code);
    if (complexFunctions.length > 0) {
      smells.push({
        type: 'complex_function',
        severity: 'high',
        locations: complexFunctions,
        suggestion: '降低函数复杂度，使用设计模式'
      });
    }

    // 重复代码检测
    const duplicates = this.detectDuplicates(code);
    if (duplicates.length > 0) {
      smells.push({
        type: 'duplicate_code',
        severity: 'medium',
        locations: duplicates,
        suggestion: '提取公共逻辑到独立函数'
      });
    }

    return smells;
  }

  /**
   * 检测长函数
   */
  detectLongFunctions(code) {
    const functions = [];
    const pattern = /function\s+\w+\s*\([^)]*\)\s*\{([\s\S]*?)\}/g;
    let match;

    while ((match = pattern.exec(code)) !== null) {
      const body = match[1];
      const lines = body.split('\n').length;
      
      if (lines > this.smellThresholds.longFunction) {
        functions.push({
          position: match.index,
          lines
        });
      }
    }

    return functions;
  }

  /**
   * 检测复杂函数
   */
  detectComplexFunctions(code) {
    const functions = [];
    const pattern = /function\s+(\w+)\s*\([^)]*\)\s*\{([\s\S]*?)\}/g;
    let match;

    while ((match = pattern.exec(code)) !== null) {
      const name = match[1];
      const body = match[2];
      
      // 计算复杂度
      let complexity = 1;
      const decisions = body.match(/if|else|for|while|case|\?|&&|\|\|/g);
      if (decisions) {
        complexity += decisions.length;
      }

      if (complexity > this.smellThresholds.complexFunction) {
        functions.push({
          name,
          position: match.index,
          complexity
        });
      }
    }

    return functions;
  }

  /**
   * 检测重复代码
   */
  detectDuplicates(code) {
    // 简化的重复检测
    const lines = code.split('\n');
    const duplicates = [];
    const seen = new Map();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length < 20 || line.startsWith('//')) continue;

      if (seen.has(line)) {
        duplicates.push({
          line: i + 1,
          previousLine: seen.get(line) + 1,
          content: line
        });
      } else {
        seen.set(line, i);
      }
    }

    return duplicates;
  }

  /**
   * 生成重构建议
   */
  async suggestRefactoring(code, options = {}) {
    const smells = this.detectSmells(code);
    
    const suggestions = smells.map(smell => ({
      type: smell.type,
      severity: smell.severity,
      description: this.getSmellDescription(smell.type),
      refactoring: this.getRefactoringTechnique(smell.type),
      locations: smell.locations,
      suggestion: smell.suggestion
    }));

    return {
      success: true,
      smells: smells.length,
      suggestions
    };
  }

  /**
   * 获取异味描述
   */
  getSmellDescription(type) {
    const descriptions = {
      long_function: '函数过长，难以理解和维护',
      complex_function: '函数复杂度过高，逻辑复杂',
      duplicate_code: '存在重复代码，违反 DRY 原则',
      long_parameter_list: '参数列表过长，建议封装',
      large_class: '类过大，职责过多'
    };
    return descriptions[type] || '代码异味';
  }

  /**
   * 获取重构技巧
   */
  getRefactoringTechnique(type) {
    const techniques = {
      long_function: 'Extract Method（提取函数）',
      complex_function: 'Strategy Pattern（策略模式）',
      duplicate_code: 'Pull Up Method（上移方法）',
      long_parameter_list: 'Introduce Parameter Object（引入参数对象）',
      large_class: 'Extract Class（提取类）'
    };
    return techniques[type] || '需要手动分析';
  }
}

/**
 * 文档生成器
 */
class DocumentationGenerator {
  constructor(options = {}) {
    this.style = options.style || 'jsdoc'; // jsdoc, typedoc, pydoc
    this.includeExamples = options.includeExamples !== false;
  }

  /**
   * 生成文档注释
   */
  async generateDocComments(code, options = {}) {
    const {
      language = 'javascript',
      style = this.style
    } = options;

    // 提取函数和类
    const items = this.extractDocumentableItems(code, language);
    
    const documented = [];
    for (const item of items) {
      const docComment = this.generateDocComment(item, { language, style });
      documented.push({
        ...item,
        docComment
      });
    }

    return {
      success: true,
      items: documented
    };
  }

  /**
   * 提取可文档化项
   */
  extractDocumentableItems(code, language) {
    const items = [];

    // 提取函数
    const funcPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
    let match;
    while ((match = funcPattern.exec(code)) !== null) {
      items.push({
        type: 'function',
        name: match[1],
        params: match[2].split(',').filter(p => p.trim()).map(p => p.trim()),
        position: match.index
      });
    }

    // 提取类
    const classPattern = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
    while ((match = classPattern.exec(code)) !== null) {
      items.push({
        type: 'class',
        name: match[1],
        extends: match[2] || null,
        position: match.index
      });
    }

    return items;
  }

  /**
   * 生成文档注释
   */
  generateDocComment(item, options = {}) {
    const { style } = options;

    if (style === 'jsdoc' || style === 'typedoc') {
      return this.generateJSDoc(item);
    } else if (style === 'pydoc') {
      return this.generatePyDoc(item);
    }

    return this.generateJSDoc(item);
  }

  /**
   * 生成 JSDoc
   */
  generateJSDoc(item) {
    if (item.type === 'function') {
      let doc = `/**\n * ${item.name} 函数\n`;
      
      if (item.params && item.params.length > 0) {
        doc += ' *\n';
        for (const param of item.params) {
          doc += ` * @param {any} ${param} - ${param} 参数\n`;
        }
      }
      
      doc += ' * @returns {any} 返回值\n';
      doc += ' */\n';
      
      return doc;
    } else if (item.type === 'class') {
      let doc = `/**\n * ${item.name} 类\n`;
      
      if (item.extends) {
        doc += ` * @extends {${item.extends}}\n`;
      }
      
      doc += ' */\n';
      
      return doc;
    }

    return '';
  }

  /**
   * 生成 PyDoc
   */
  generatePyDoc(item) {
    if (item.type === 'function') {
      let doc = `    """\n    ${item.name} 函数\n`;
      
      if (item.params && item.params.length > 0) {
        doc += '\n    Args:\n';
        for (const param of item.params) {
          doc += `        ${param}: ${param} 参数\n`;
        }
      }
      
      doc += '\n    Returns:\n        返回值\n';
      doc += '    """\n';
      
      return doc;
    }

    return '';
  }

  /**
   * 生成 README
   */
  async generateREADME(projectInfo) {
    const {
      name,
      description,
      installation,
      usage,
      api,
      examples
    } = projectInfo;

    let readme = `# ${name}\n\n`;
    
    if (description) {
      readme += `${description}\n\n`;
    }

    readme += `## 安装\n\n\`\`\`bash\n${installation || 'npm install'}\n\`\`\`\n\n`;

    readme += `## 使用\n\n\`\`\`javascript\n${usage || '// 使用示例'}\n\`\`\`\n\n`;

    if (api) {
      readme += `## API\n\n${api}\n\n`;
    }

    if (examples) {
      readme += `## 示例\n\n${examples}\n\n`;
    }

    readme += `## License\n\nMIT\n`;

    return readme;
  }
}

/**
 * AI 代码助手服务（统一入口）
 */
class AICodeAssistantService {
  constructor(options = {}) {
    this.generator = new CodeGenerator(options);
    this.explainer = new CodeExplainer(options);
    this.bugFixer = new BugFixAssistant(options);
    this.refactorer = new RefactoringAssistant(options);
    this.docGenerator = new DocumentationGenerator(options);
  }

  /**
   * 生成代码
   */
  async generate(prompt, options = {}) {
    return await this.generator.generate(prompt, options);
  }

  /**
   * 解释代码
   */
  async explain(codeOrFile, options = {}) {
    if (fs.existsSync(codeOrFile)) {
      return await this.explainer.explainFile(codeOrFile, options);
    }
    return await this.explainer.explain(codeOrFile, options);
  }

  /**
   * 修复 Bug
   */
  async fix(error, code, options = {}) {
    return await this.bugFixer.generateFix(error, code, options);
  }

  /**
   * 重构建议
   */
  async suggestRefactoring(code, options = {}) {
    return await this.refactorer.suggestRefactoring(code, options);
  }

  /**
   * 生成文档
   */
  async generateDocs(code, options = {}) {
    return await this.docGenerator.generateDocComments(code, options);
  }

  /**
   * 代码审查