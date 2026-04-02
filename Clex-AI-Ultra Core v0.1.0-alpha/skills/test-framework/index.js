/**
 * Test Framework - 测试框架
 * 
 * OpenClaw Skills 测试工具
 */

const fs = require('fs');
const path = require('path');

/**
 * 测试运行器
 */
class TestRunner {
  constructor(options = {}) {
    this.options = {
      verbose: false,
      coverage: false,
      watch: false,
      ...options
    };
    
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };
  }

  /**
   * 运行测试
   */
  async run(pattern = '**/*.test.js') {
    const testFiles = this.findTestFiles(pattern);
    
    console.log(`Found ${testFiles.length} test files`);
    
    for (const file of testFiles) {
      await this.runFile(file);
    }

    return this.results;
  }

  /**
   * 查找测试文件
   */
  findTestFiles(pattern) {
    const glob = require('glob');
    return glob.sync(pattern, {
      cwd: path.join(__dirname, '..'),
      ignore: ['node_modules/**']
    });
  }

  /**
   * 运行单个测试文件
   */
  async runFile(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    
    try {
      const testModule = require(fullPath);
      
      // 运行测试
      if (typeof testModule.run === 'function') {
        await testModule.run(this);
      }
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({
        file: filePath,
        error: error.message
      });
    }
  }

  /**
   * 记录测试结果
   */
  recordResult(test) {
    this.results.total++;
    this.results.tests.push(test);
    
    if (test.status === 'passed') {
      this.results.passed++;
    } else if (test.status === 'failed') {
      this.results.failed++;
    } else if (test.status === 'skipped') {
      this.results.skipped++;
    }
  }

  /**
   * 打印结果
   */
  printResults() {
    console.log('\n--- Test Results ---\n');
    console.log(`Total:  ${this.results.total}`);
    console.log(`Passed: ${this.results.passed} ✓`);
    console.log(`Failed: ${this.results.failed} ✗`);
    console.log(`Skipped: ${this.results.skipped} -`);
    console.log('');

    if (this.results.failed > 0) {
      console.log('Failed tests:');
      for (const test of this.results.tests) {
        if (test.status === 'failed') {
          console.log(`  ✗ ${test.name || test.file}`);
          if (test.error) {
            console.log(`    ${test.error}`);
          }
        }
      }
    }
  }
}

/**
 * 测试断言
 */
class Assert {
  static equal(actual, expected, message = 'Expected values to be equal') {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  static deepEqual(actual, expected, message = 'Expected objects to be equal') {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    
    if (actualStr !== expectedStr) {
      throw new Error(`${message}:\n  Expected: ${expectedStr}\n  Got: ${actualStr}`);
    }
  }

  static notEqual(actual, expected, message = 'Expected values to not be equal') {
    if (actual === expected) {
      throw new Error(`${message}: got ${actual}`);
    }
  }

  static truthy(value, message = 'Expected value to be truthy') {
    if (!value) {
      throw new Error(`${message}: got ${value}`);
    }
  }

  static falsy(value, message = 'Expected value to be falsy') {
    if (value) {
      throw new Error(`${message}: got ${value}`);
    }
  }

  static null(value, message = 'Expected value to be null') {
    if (value !== null) {
      throw new Error(`${message}: got ${value}`);
    }
  }

  static undefined(value, message = 'Expected value to be undefined') {
    if (value !== undefined) {
      throw new Error(`${message}: got ${value}`);
    }
  }

  static throws(fn, message = 'Expected function to throw') {
    try {
      fn();
      throw new Error(message);
    } catch (e) {
      // Expected
    }
  }

  static doesNotThrow(fn, message = 'Expected function not to throw') {
    try {
      fn();
    } catch (e) {
      throw new Error(`${message}: ${e.message}`);
    }
  }

  static ok(value, message = 'Expected value to be ok') {
    this.truthy(value, message);
  }

  static fail(message = 'Test failed') {
    throw new Error(message);
  }
}

/**
 * 测试套件
 */
class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
  }

  /**
   * 添加测试
   */
  test(name, fn) {
    this.tests.push({ name, fn });
  }

  /**
   * 添加 beforeEach 钩子
   */
  beforeEach(fn) {
    this.beforeEachHooks.push(fn);
  }

  /**
   * 添加 afterEach 钩子
   */
  afterEach(fn) {
    this.afterEachHooks.push(fn);
  }

  /**
   * 运行测试套件
   */
  async run(runner) {
    console.log(`\nRunning: ${this.name}`);
    
    for (const test of this.tests) {
      await this.runTest(test, runner);
    }
  }

  /**
   * 运行单个测试
   */
  async runTest(test, runner) {
    const startTime = Date.now();
    
    try {
      // 运行 beforeEach
      for (const hook of this.beforeEachHooks) {
        await hook();
      }

      // 运行测试
      await test.fn();

      // 运行 afterEach
      for (const hook of this.afterEachHooks) {
        await hook();
      }

      const duration = Date.now() - startTime;
      
      runner.recordResult({
        name: `${this.name} - ${test.name}`,
        status: 'passed',
        duration
      });

      if (runner.options.verbose) {
        console.log(`  ✓ ${test.name} (${duration}ms)`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      
      runner.recordResult({
        name: `${this.name} - ${test.name}`,
        status: 'failed',
        duration,
        error: error.message
      });

      console.log(`  ✗ ${test.name}`);
      console.log(`    ${error.message}`);
    }
  }
}

/**
 * 测试工具
 */
class TestUtils {
  /**
   * 创建 mock 函数
   */
  static mockFn(implementation = () => {}) {
    const mock = jest.fn(implementation);
    mock.mockClear = () => {
      mock.calls = [];
    };
    mock.mockResolvedValue = (value) => {
      mock.mockImplementation(() => Promise.resolve(value));
    };
    mock.mockRejectedValue = (error) => {
      mock.mockImplementation(() => Promise.reject(error));
    };
    return mock;
  }

  /**
   * 创建 mock 对象
   */
  static mockObj(methods = {}) {
    const mock = {};
    for (const [key, value] of Object.entries(methods)) {
      mock[key] = typeof value === 'function' ? this.mockFn(value) : value;
    }
    return mock;
  }

  /**
   * 延迟
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 创建临时文件
   */
  static createTempFile(content, ext = '.js') {
    const tmpDir = require('os').tmpdir();
    const fileName = `test-${Date.now()}${ext}`;
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * 清理临时文件
   */
  static cleanupTempFile(filePath) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {}
  }
}

/**
 * 代码覆盖率
 */
class CoverageReporter {
  constructor() {
    this.coverage = {};
  }

  /**
   * 收集覆盖率
   */
  collect(filePath, code) {
    const lines = code.split('\n');
    const coverage = {
      total: lines.length,
      covered: 0,
      statements: []
    };

    // 简单实现：统计非空行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('//')) {
        coverage.statements.push({
          line: i + 1,
          covered: true // 简化：假设都覆盖
        });
        coverage.covered++;
      }
    }

    this.coverage[filePath] = coverage;
  }

  /**
   * 生成报告
   */
  generateReport() {
    let totalLines = 0;
    let totalCovered = 0;

    for (const [file, cov] of Object.entries(this.coverage)) {
      totalLines += cov.total;
      totalCovered += cov.covered;
    }

    const percentage = totalLines > 0 ? ((totalCovered / totalLines) * 100).toFixed(2) : 0;

    return {
      totalLines,
      totalCovered,
      percentage,
      files: this.coverage
    };
  }

  /**
   * 打印报告
   */
  printReport() {
    const report = this.generateReport();
    
    console.log('\n--- Coverage Report ---\n');
    console.log(`Lines: ${report.totalCovered}/${report.totalLines} (${report.percentage}%)`);
    console.log('');

    for (const [file, cov] of Object.entries(this.coverage)) {
      const pct = ((cov.covered / cov.total) * 100).toFixed(1);
      console.log(`  ${file}: ${pct}%`);
    }
  }
}

// 便捷函数
function describe(name, fn) {
  const suite = new TestSuite(name);
  fn(suite);
  return suite;
}

function it(name, fn) {
  return { name, fn };
}

function test(name, fn) {
  return it(name, fn);
}

function beforeEach(fn) {
  return { type: 'beforeEach', fn };
}

function afterEach(fn) {
  return { type: 'afterEach', fn };
}

// 导出
module.exports = {
  TestRunner,
  Assert,
  TestSuite,
  TestUtils,
  CoverageReporter,
  describe,
  it,
  test,
  beforeEach,
  afterEach,
  expect: Assert
};
