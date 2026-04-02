/**
 * Code Analysis - 代码分析工具
 * 
 * 静态代码分析、复杂度计算、代码质量评估
 */

const fs = require('fs');
const path = require('path');

/**
 * 代码统计
 */
class CodeStats {
  /**
   * 统计代码行数
   */
  static countLines(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let code = 0;
    let blank = 0;
    let comment = 0;
    let inBlockComment = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // 空行
      if (trimmed === '') {
        blank++;
        continue;
      }
      
      // 块注释处理
      if (inBlockComment) {
        comment++;
        if (trimmed.includes('*/')) {
          inBlockComment = false;
        }
        continue;
      }
      
      // 块注释开始
      if (trimmed.startsWith('/*')) {
        comment++;
        if (!trimmed.includes('*/')) {
          inBlockComment = true;
        }
        continue;
      }
      
      // 单行注释
      if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
        comment++;
        continue;
      }
      
      // 代码行
      code++;
    }
    
    return {
      total: lines.length,
      code,
      blank,
      comment,
      commentRatio: lines.length > 0 ? (comment / lines.length) * 100 : 0
    };
  }

  /**
   * 统计目录
   */
  static countDirectory(dirPath, extensions = []) {
    const stats = {
      files: [],
      totals: {
        files: 0,
        lines: 0,
        code: 0,
        blank: 0,
        comment: 0
      },
      byExtension: {}
    };

    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        if (entry.isDirectory()) {
          walk(path.join(dir, entry.name));
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          
          if (extensions.length === 0 || extensions.includes(ext)) {
            const filePath = path.join(dir, entry.name);
            const fileStats = this.countLines(filePath);
            
            stats.files.push({
              path: filePath,
              ...fileStats
            });

            stats.totals.files++;
            stats.totals.lines += fileStats.total;
            stats.totals.code += fileStats.code;
            stats.totals.blank += fileStats.blank;
            stats.totals.comment += fileStats.comment;

            if (!stats.byExtension[ext]) {
              stats.byExtension[ext] = { files: 0, lines: 0 };
            }
            stats.byExtension[ext].files++;
            stats.byExtension[ext].lines += fileStats.total;
          }
        }
      }
    };

    walk(dirPath);
    
    return stats;
  }
}

/**
 * 复杂度分析
 */
class ComplexityAnalyzer {
  /**
   * 计算圈复杂度（Cyclomatic Complexity）
   */
  static cyclomatic(content, language = 'javascript') {
    let complexity = 1; // 基础复杂度
    
    // 决策点正则
    const patterns = {
      javascript: [
        /if\s*\(/g,
        /else\s+if\s*\(/g,
        /for\s*\(/g,
        /while\s*\(/g,
        /case\s+[^:]+:/g,
        /\?\s*/g,        // 三元运算符
        /&&/g,
        /\|\|/g,
        /catch\s*\(/g,
        /\?\./g         // 可选链
      ],
      python: [
        /if\s+.*:/g,
        /elif\s+.*:/g,
        /for\s+.*\s+in\s+/g,
        /while\s+.*:/g,
        /except/g,
        /and/g,
        /or/g
      ],
      java: [
        /if\s*\(/g,
        /else\s+if\s*\(/g,
        /for\s*\(/g,
        /while\s*\(/g,
        /case\s+[^:]+:/g,
        /\?\s*/g,
        /&&/g,
        /\|\|/g,
        /catch\s*\(/g
      ]
    };

    const langPatterns = patterns[language] || patterns.javascript;
    
    for (const pattern of langPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * 分析函数复杂度
   */
  static analyzeFunctions(content, language = 'javascript') {
    const functions = [];
    
    // JavaScript/TypeScript 函数匹配
    const funcPatterns = [
      /function\s+(\w+)\s*\([^)]*\)\s*\{/g,
      /(\w+)\s*=\s*(?:async\s+)?function\s*\([^)]*\)\s*\{/g,
      /(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
      /(\w+)\s*\([^)]*\)\s*\{/g,  // 方法
      /(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/g  // async 方法
    ];

    for (const pattern of funcPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1];
        
        // 跳过构造函数和关键字
        if (['if', 'for', 'while', 'switch', 'catch'].includes(name)) {
          continue;
        }

        // 找到函数体
        const startIndex = match.index + match[0].length - 1;
        const funcBody = this.extractBlock(content, startIndex);
        
        if (funcBody) {
          const complexity = this.cyclomatic(funcBody, language);
          const lines = funcBody.split('\n').length;
          
          functions.push({
            name,
            complexity,
            lines,
            position: match.index
          });
        }
      }
    }

    // 去重
    const unique = new Map();
    for (const func of functions) {
      if (!unique.has(func.name)) {
        unique.set(func.name, func);
      }
    }

    return Array.from(unique.values()).sort((a, b) => b.complexity - a.complexity);
  }

  /**
   * 提取代码块
   */
  static extractBlock(content, startIndex) {
    let braceCount = 0;
    let inString = false;
    let stringChar = null;
    let block = '';
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';
      
      // 字符串处理
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = null;
        }
      }
      
      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            block += char;
            break;
          }
        }
      }
      
      block += char;
    }
    
    return braceCount === 0 ? block : null;
  }

  /**
   * 获取复杂度等级
   */
  static getComplexityLevel(complexity) {
    if (complexity <= 5) {
      return { level: 'low', rating: 'A', color: '🟢' };
    } else if (complexity <= 10) {
      return { level: 'medium', rating: 'B', color: '🟡' };
    } else if (complexity <= 20) {
      return { level: 'high', rating: 'C', color: '🟠' };
    } else {
      return { level: 'very_high', rating: 'D', color: '🔴' };
    }
  }
}

/**
 * 依赖分析
 */
class DependencyAnalyzer {
  /**
   * 分析 JavaScript/TypeScript 依赖
   */
  static analyzeJS(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = [];
    const exports = [];

    // import 语句
    const importPatterns = [
      /import\s+.*?\s+from\s+['"](.+?)['"]/g,
      /import\s+['"](.+?)['"]/g,
      /require\s*\(\s*['"](.+?)['"]\s*\)/g
    ];

    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push({
          path: match[1],
          type: match[1].startsWith('.') ? 'relative' : 'module'
        });
      }
    }

    // export 语句
    const exportPatterns = [
      /export\s+(?:default\s+)?(?:const|let|var|function|class)\s+(\w+)/g,
      /export\s*\{\s*([^}]+)\s*\}/g
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          const names = match[1].split(',').map(n => n.trim());
          for (const name of names) {
            if (name && !name.includes(' ')) {
              exports.push(name);
            }
          }
        }
      }
    }

    return {
      filePath,
      imports: this.deduplicateImports(imports),
      exports: [...new Set(exports)]
    };
  }

  /**
   * 去重 import
   */
  static deduplicateImports(imports) {
    const map = new Map();
    for (const imp of imports) {
      if (!map.has(imp.path)) {
        map.set(imp.path, imp);
      }
    }
    return Array.from(map.values());
  }

  /**
   * 分析 Python 依赖
   */
  static analyzePython(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = [];

    const patterns = [
      /^import\s+(\w+)/gm,
      /^from\s+(\w+)\s+import/gm
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push({
          path: match[1],
          type: 'module'
        });
      }
    }

    return {
      filePath,
      imports: this.deduplicateImports(imports),
      exports: [] // Python 需要更复杂的分析
    };
  }
}

/**
 * 代码质量评估
 */
class QualityAnalyzer {
  /**
   * 评估代码质量
   */
  static evaluate(filePath, options = {}) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath);
    
    const stats = CodeStats.countLines(filePath);
    const functions = ComplexityAnalyzer.analyzeFunctions(content, this.getLanguage(ext));
    
    const avgComplexity = functions.length > 0
      ? functions.reduce((sum, f) => sum + f.complexity, 0) / functions.length
      : 1;
    
    const maxComplexity = functions.length > 0
      ? Math.max(...functions.map(f => f.complexity))
      : 1;

    // 计算各项得分
    const scores = {
      complexity: this.scoreComplexity(avgComplexity),
      commenting: this.scoreCommenting(stats.commentRatio),
      size: this.scoreSize(stats.code),
      functionLength: this.scoreFunctionLength(functions)
    };

    // 总体得分
    const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0) / Object.keys(scores).length;
    const rating = this.getRating(totalScore);

    return {
      filePath,
      stats,
      functions: {
        count: functions.length,
        avgComplexity: avgComplexity.toFixed(2),
        maxComplexity,
        complexFunctions: functions.filter(f => f.complexity > 10)
      },
      scores,
      totalScore: totalScore.toFixed(2),
      rating
    };
  }

  /**
   * 获取语言
   */
  static getLanguage(ext) {
    const map = {
      '.js': 'javascript',
      '.mjs': 'javascript',
      '.ts': 'javascript',
      '.tsx': 'javascript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rs': 'rust'
    };
    return map[ext] || 'javascript';
  }

  /**
   * 复杂度得分
   */
  static scoreComplexity(avgComplexity) {
    if (avgComplexity <= 5) return 100;
    if (avgComplexity <= 10) return 80;
    if (avgComplexity <= 15) return 60;
    if (avgComplexity <= 20) return 40;
    return 20;
  }

  /**
   * 注释得分
   */
  static scoreCommenting(ratio) {
    if (ratio >= 15 && ratio <= 30) return 100;
    if (ratio >= 10 && ratio <= 40) return 80;
    if (ratio >= 5 && ratio <= 50) return 60;
    return 40;
  }

  /**
   * 文件大小得分
   */
  static scoreSize(lines) {
    if (lines <= 300) return 100;
    if (lines <= 500) return 80;
    if (lines <= 1000) return 60;
    if (lines <= 2000) return 40;
    return 20;
  }

  /**
   * 函数长度得分
   */
  static scoreFunctionLength(functions) {
    if (functions.length === 0) return 100;
    
    const longFunctions = functions.filter(f => f.lines > 50).length;
    const ratio = longFunctions / functions.length;
    
    if (ratio === 0) return 100;
    if (ratio <= 0.1) return 80;
    if (ratio <= 0.2) return 60;
    if (ratio <= 0.3) return 40;
    return 20;
  }

  /**
   * 获取评级
   */
  static getRating(score) {
    if (score >= 90) return { grade: 'A', color: '🟢', text: '优秀' };
    if (score >= 80) return { grade: 'B', color: '🟡', text: '良好' };
    if (score >= 70) return { grade: 'C', color: '🟠', text: '一般' };
    if (score >= 60) return { grade: 'D', color: '🔴', text: '需改进' };
    return { grade: 'F', color: '🔴', text: '差' };
  }
}

/**
 * 重复代码检测
 */
class DuplicateDetector {
  /**
   * 检测目录中的重复代码
   */
  static detect(directory, options = {}) {
    const {
      minLines = 5,
      threshold = 0.8
    } = options;

    const files = this.collectFiles(directory);
    const chunks = new Map();
    const duplicates = [];

    // 提取代码块
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      
      for (let i = 0; i <= lines.length - minLines; i++) {
        const chunk = lines.slice(i, i + minLines)
          .map(l => l.trim())
          .filter(l => l.length > 0)
          .join('\n');
        
        if (chunk.length < 50) continue; // 跳过太短的块
        
        const hash = this.hash(chunk);
        
        if (!chunks.has(hash)) {
          chunks.set(hash, []);
        }
        
        chunks.get(hash).push({
          file,
          startLine: i + 1,
          endLine: i + minLines,
          content: chunk
        });
      }
    }

    // 找出重复
    for (const [hash, occurrences] of chunks.entries()) {
      if (occurrences.length > 1) {
        duplicates.push({
          hash,
          occurrences,
          count: occurrences.length
        });
      }
    }

    return duplicates.sort((a, b) => b.count - a.count);
  }

  /**
   * 收集文件
   */
  static collectFiles(dir, extensions = ['.js', '.ts', '.py', '.java']) {
    const files = [];
    
    const walk = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        if (entry.isDirectory()) {
          walk(path.join(currentDir, entry.name));
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(path.join(currentDir, entry.name));
          }
        }
      }
    };
    
    walk(dir);
    return files;
  }

  /**
   * 简单哈希
   */
  static hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

/**
 * 代码分析服务
 */
class CodeAnalysisService {
  constructor(options = {}) {
    this.cache = new Map();
    this.defaultExtensions = options.extensions || ['.js', '.ts', '.py', '.java', '.go', '.rs'];
  }

  /**
   * 分析文件
   */
  analyze(filePath, options = {}) {
    const {
      includeStats = true,
      includeComplexity = true,
      includeDependencies = true,
      includeQuality = true,
      force = false
    } = options;

    const cacheKey = `${filePath}:${JSON.stringify(options)}`;
    
    if (!force && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const ext = path.extname(filePath);
    const result = {
      filePath,
      language: QualityAnalyzer.getLanguage(ext),
      timestamp: new Date().toISOString()
    };

    if (includeStats) {
      result.stats = CodeStats.countLines(filePath);
    }

    if (includeComplexity) {
      const content = fs.readFileSync(filePath, 'utf-8');
      result.functions = ComplexityAnalyzer.analyzeFunctions(content, result.language);
      result.avgComplexity = result.functions.length > 0
        ? (result.functions.reduce((sum, f) => sum + f.complexity, 0) / result.functions.length).toFixed(2)
        : 0;
    }

    if (includeDependencies) {
      if (['.js', '.ts', '.tsx', '.mjs'].includes(ext)) {
        result.dependencies = DependencyAnalyzer.analyzeJS(filePath);
      } else if (ext === '.py') {
        result.dependencies = DependencyAnalyzer.analyzePython(filePath);
      }
    }

    if (includeQuality) {
      result.quality = QualityAnalyzer.evaluate(filePath);
    }

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * 分析目录
   */
  analyzeDirectory(dirPath, options = {}) {
    const {
      extensions = this.defaultExtensions,
      exclude = ['node_modules', '.git', 'dist', 'build']
    } = options;

    const files = this.collectFiles(dirPath, extensions, exclude);
    const results = [];
    const summary = {
      totalFiles: files.length,
      totalLines: 0,
      totalCode: 0,
      avgComplexity: 0,
      qualityDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 }
    };

    for (const file of files) {
      try {
        const result = this.analyze(file, options);
        results.push(result);
        
        summary.totalLines += result.stats?.total || 0;
        summary.totalCode += result.stats?.code || 0;
        
        if (result.quality?.rating?.grade) {
          summary.qualityDistribution[result.quality.rating.grade]++;
        }
      } catch (error) {
        results.push({
          filePath: file,
          error: error.message
        });
      }
    }

    summary.avgComplexity = results
      .filter(r => r.avgComplexity)
      .reduce((sum, r) => sum + parseFloat(r.avgComplexity), 0) / (results.filter(r => r.avgComplexity).length || 1);

    return {
      dirPath,
      results,
      summary
    };
  }

  /**
   * 收集文件
   */
  collectFiles(dir, extensions, exclude = []) {
    const files = [];
    
    const walk = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (exclude.includes(entry.name) || entry.name.startsWith('.')) {
          continue;
        }

        if (entry.isDirectory()) {
          walk(path.join(currentDir, entry.name));
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(path.join(currentDir, entry.name));
          }
        }
      }
    };
    
    walk(dir);
    return files;
  }

  /**
   * 清除缓存
   */
  clearCache(filePath = null) {
    if (filePath) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(filePath)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

// 导出
module.exports = {
  CodeStats,
  ComplexityAnalyzer,
  DependencyAnalyzer,
  QualityAnalyzer,
  DuplicateDetector,
  CodeAnalysisService
};
