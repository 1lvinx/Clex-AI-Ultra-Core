/**
 * Dev Tools - 开发工具集成
 * 
 * 测试运行器、代码格式化、依赖管理
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

/**
 * 命令执行器
 */
class CommandExecutor {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.timeout = options.timeout || 120000; // 2 分钟
    this.maxBuffer = options.maxBuffer || 1024 * 1024 * 50; // 50MB
  }

  async execute(command, options = {}) {
    const {
      cwd = this.cwd,
      timeout = this.timeout,
      env = {}
    } = options;

    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout,
        maxBuffer: this.maxBuffer,
        env: { ...process.env, ...env },
        shell: process.platform === 'win32'
      });

      return {
        success: true,
        command,
        output: stdout.trim(),
        error: stderr.trim() || null,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        command,
        output: error.stdout?.trim() || null,
        error: error.stderr || error.message,
        duration: Date.now() - startTime,
        exitCode: error.code,
        signal: error.signal
      };
    }
  }
}

/**
 * 测试框架检测
 */
class TestFrameworkDetector {
  static detect(cwd) {
    const frameworks = [];

    // 检查 package.json
    const packageJsonPath = path.join(cwd, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        
        const deps = {
          ...pkg.dependencies,
          ...pkg.devDependencies
        };

        if (deps.jest) frameworks.push({ name: 'jest', type: 'javascript' });
        if (deps.vitest) frameworks.push({ name: 'vitest', type: 'javascript' });
        if (deps.mocha) frameworks.push({ name: 'mocha', type: 'javascript' });
        if (deps['@vue/test-utils']) frameworks.push({ name: 'vue-test', type: 'javascript' });

        // 检查 scripts
        if (pkg.scripts) {
          if (pkg.scripts.test?.includes('jest')) frameworks.push({ name: 'jest', type: 'javascript' });
          if (pkg.scripts.test?.includes('vitest')) frameworks.push({ name: 'vitest', type: 'javascript' });
          if (pkg.scripts.test?.includes('mocha')) frameworks.push({ name: 'mocha', type: 'javascript' });
        }
      } catch (e) {}
    }

    // 检查 Python 项目
    if (fs.existsSync(path.join(cwd, 'requirements.txt')) ||
        fs.existsSync(path.join(cwd, 'setup.py')) ||
        fs.existsSync(path.join(cwd, 'pyproject.toml'))) {
      
      if (this.hasPythonPackage('pytest', cwd)) {
        frameworks.push({ name: 'pytest', type: 'python' });
      }
      frameworks.push({ name: 'unittest', type: 'python' });
    }

    // 检查 Go 项目
    if (fs.existsSync(path.join(cwd, 'go.mod'))) {
      frameworks.push({ name: 'go-test', type: 'go' });
    }

    // 检查 Rust 项目
    if (fs.existsSync(path.join(cwd, 'Cargo.toml'))) {
      frameworks.push({ name: 'cargo-test', type: 'rust' });
    }

    // 去重
    const unique = new Map();
    for (const fw of frameworks) {
      unique.set(fw.name, fw);
    }

    return Array.from(unique.values());
  }

  static hasPythonPackage(packageName, cwd) {
    try {
      const result = execSync(`pip show ${packageName}`, {
        cwd,
        stdio: 'pipe',
        timeout: 5000
      });
      return result.status === 0;
    } catch {
      return false;
    }
  }
}

/**
 * 测试运行器
 */
class TestRunner {
  constructor(cwd, options = {}) {
    this.cwd = cwd;
    this.executor = new CommandExecutor({ cwd, ...options });
    this.framework = null;
  }

  /**
   * 检测测试框架
   */
  detectFramework() {
    const frameworks = TestFrameworkDetector.detect(this.cwd);
    this.framework = frameworks[0] || null;
    return frameworks;
  }

  /**
   * 运行测试
   */
  async run(options = {}) {
    const {
      pattern = null,
      file = null,
      coverage = false,
      watch = false,
      verbose = false,
      timeout = null
    } = options;

    if (!this.framework) {
      this.detectFramework();
    }

    if (!this.framework) {
      return {
        success: false,
        error: '未检测到测试框架',
        command: null
      };
    }

    const command = this.buildCommand(this.framework.name, {
      pattern,
      file,
      coverage,
      watch,
      verbose,
      timeout
    });

    return await this.executor.execute(command, {
      timeout: coverage ? 300000 : 120000 // 覆盖率测试给更长时间
    });
  }

  /**
   * 构建命令
   */
  buildCommand(framework, options) {
    switch (framework) {
      case 'jest':
        let cmd = 'npx jest';
        if (options.pattern) cmd += ` ${options.pattern}`;
        if (options.file) cmd += ` ${options.file}`;
        if (options.coverage) cmd += ' --coverage';
        if (options.watch) cmd += ' --watch';
        if (options.verbose) cmd += ' --verbose';
        if (options.timeout) cmd += ` --testTimeout=${options.timeout}`;
        return cmd;

      case 'vitest':
        cmd = 'npx vitest run';
        if (options.pattern) cmd += ` ${options.pattern}`;
        if (options.file) cmd += ` ${options.file}`;
        if (options.coverage) cmd += ' --coverage';
        if (options.watch) cmd = 'npx vitest watch';
        return cmd;

      case 'mocha':
        cmd = 'npx mocha';
        if (options.pattern) cmd += ` ${options.pattern}`;
        if (options.file) cmd += ` ${options.file}`;
        if (options.coverage) cmd = `npx nyc ${cmd}`;
        return cmd;

      case 'pytest':
        cmd = 'pytest';
        if (options.pattern) cmd += ` -k "${options.pattern}"`;
        if (options.file) cmd += ` ${options.file}`;
        if (options.coverage) cmd = `pytest-cov ${cmd}`;
        if (options.verbose) cmd += ' -v';
        return cmd;

      case 'go-test':
        cmd = 'go test';
        if (options.verbose) cmd += ' -v';
        if (options.coverage) cmd += ' -cover';
        if (options.pattern) cmd += ` -run "${options.pattern}"`;
        return cmd;

      case 'cargo-test':
        cmd = 'cargo test';
        if (options.verbose) cmd += ' -- --nocapture';
        return cmd;

      default:
        return 'npm test';
    }
  }

  /**
   * 生成测试报告
   */
  async generateReport(outputPath = 'test-report.json') {
    const frameworks = this.detectFramework();
    
    if (frameworks.some(f => f.name === 'jest')) {
      const command = `npx jest --json --outputFile=${outputPath}`;
      return await this.executor.execute(command);
    }

    return {
      success: false,
      error: '当前框架不支持生成 JSON 报告'
    };
  }
}

/**
 * 代码格式化器
 */
class CodeFormatter {
  constructor(cwd, options = {}) {
    this.cwd = cwd;
    this.executor = new CommandExecutor({ cwd, ...options });
  }

  /**
   * 检测格式化工具
   */
  detectTools() {
    const tools = {
      javascript: [],
      python: [],
      go: [],
      rust: []
    };

    // 检查 package.json
    const packageJsonPath = path.join(this.cwd, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps.prettier) tools.javascript.push('prettier');
        if (deps.eslint) tools.javascript.push('eslint');
        if (deps['eslint-config-prettier']) tools.javascript.push('eslint-prettier');
      } catch (e) {}
    }

    // Python
    if (fs.existsSync(path.join(this.cwd, 'requirements.txt'))) {
      const content = fs.readFileSync(path.join(this.cwd, 'requirements.txt'), 'utf-8');
      if (content.includes('black')) tools.python.push('black');
      if (content.includes('flake8')) tools.python.push('flake8');
      if (content.includes('isort')) tools.python.push('isort');
    }

    // Go
    try {
      execSync('gofmt --version', { stdio: 'pipe' });
      tools.go.push('gofmt');
    } catch (e) {}

    // Rust
    try {
      execSync('rustfmt --version', { stdio: 'pipe' });
      tools.rust.push('rustfmt');
    } catch (e) {}

    return tools;
  }

  /**
   * 格式化文件
   */
  async format(file, options = {}) {
    const {
      fix = false,
      check = false
    } = options;

    const ext = path.extname(file);
    const relativePath = path.relative(this.cwd, file);

    switch (ext) {
      case '.js':
      case '.ts':
      case '.tsx':
      case '.jsx':
      case '.vue':
        return await this.formatJavaScript(relativePath, { fix, check });

      case '.py':
        return await this.formatPython(relativePath, { fix, check });

      case '.go':
        return await this.formatGo(relativePath, { check });

      case '.rs':
        return await this.formatRust(relativePath, { check });

      default:
        return {
          success: false,
          error: `不支持的文件类型：${ext}`
        };
    }
  }

  /**
   * 格式化 JavaScript/TypeScript
   */
  async formatJavaScript(file, options = {}) {
    const { fix = false, check = false } = options;

    // 优先使用 Prettier
    let command = `npx prettier --write "${file}"`;
    
    if (check) {
      command = `npx prettier --check "${file}"`;
    }

    if (fix) {
      // 同时运行 ESLint
      command += ` && npx eslint --fix "${file}"`;
    }

    return await this.executor.execute(command);
  }

  /**
   * 格式化 Python
   */
  async formatPython(file, options = {}) {
    const { fix = false, check = false } = options;

    let command = `black "${file}"`;
    
    if (check) {
      command = `black --check "${file}"`;
    }

    if (fix) {
      // 同时运行 isort 和 flake8
      command = `isort "${file}" && ${command} && flake8 "${file}"`;
    }

    return await this.executor.execute(command);
  }

  /**
   * 格式化 Go
   */
  async formatGo(file, options = {}) {
    const { check = false } = options;

    let command = `gofmt -w "${file}"`;
    
    if (check) {
      command = `gofmt -l "${file}"`;
    }

    return await this.executor.execute(command);
  }

  /**
   * 格式化 Rust
   */
  async formatRust(file, options = {}) {
    const { check = false } = options;

    let command = `rustfmt "${file}"`;
    
    if (check) {
      command = `rustfmt --check "${file}"`;
    }

    return await this.executor.execute(command);
  }

  /**
   * 批量格式化
   */
  async formatAll(pattern = '**/*.{js,ts,tsx,jsx,vue,py,go,rs}', options = {}) {
    const {
      fix = false,
      check = false
    } = options;

    const results = {
      total: 0,
      success: 0,
      failed: 0,
      files: []
    };

    // 使用 glob 查找文件
    const glob = require('glob');
    const files = glob.sync(pattern, { cwd: this.cwd, ignore: ['node_modules/**', 'dist/**', 'build/**'] });

    results.total = files.length;

    for (const file of files) {
      const result = await this.format(file, { fix, check });
      
      results.files.push({
        file,
        ...result
      });

      if (result.success) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    return results;
  }
}

/**
 * 依赖管理器
 */
class DependencyManager {
  constructor(cwd, options = {}) {
    this.cwd = cwd;
    this.executor = new CommandExecutor({ cwd, ...options });
    this.packageManager = this.detectPackageManager();
  }

  /**
   * 检测包管理器
   */
  detectPackageManager() {
    // 检查 lock 文件
    if (fs.existsSync(path.join(this.cwd, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    if (fs.existsSync(path.join(this.cwd, 'yarn.lock'))) {
      return 'yarn';
    }
    if (fs.existsSync(path.join(this.cwd, 'package-lock.json'))) {
      return 'npm';
    }
    if (fs.existsSync(path.join(this.cwd, 'requirements.txt'))) {
      return 'pip';
    }
    if (fs.existsSync(path.join(this.cwd, 'go.mod'))) {
      return 'go';
    }
    if (fs.existsSync(path.join(this.cwd, 'Cargo.toml'))) {
      return 'cargo';
    }

    return 'npm'; // 默认
  }

  /**
   * 安装依赖
   */
  async install(packages = [], options = {}) {
    const {
      dev = false,
      save = true
    } = options;

    let command;
    const pkgList = packages.join(' ');

    switch (this.packageManager) {
      case 'npm':
        command = `npm install ${pkgList}`;
        if (dev) command += ' --save-dev';
        break;
      case 'yarn':
        command = `yarn add ${pkgList}`;
        if (dev) command += ' --dev';
        break;
      case 'pnpm':
        command = `pnpm add ${pkgList}`;
        if (dev) command += ' --save-dev';
        break;
      case 'pip':
        command = `pip install ${pkgList}`;
        break;
      case 'go':
        command = `go get ${pkgList}`;
        break;
      case 'cargo':
        command = `cargo add ${pkgList}`;
        break;
      default:
        command = `npm install ${pkgList}`;
    }

    return await this.executor.execute(command);
  }

  /**
   * 更新依赖
   */
  async update(packages = []) {
    let command;

    switch (this.packageManager) {
      case 'npm':
        command = packages.length > 0
          ? `npm update ${packages.join(' ')}`
          : 'npm update';
        break;
      case 'yarn':
        command = packages.length > 0
          ? `yarn upgrade ${packages.join(' ')}`
          : 'yarn upgrade';
        break;
      case 'pnpm':
        command = packages.length > 0
          ? `pnpm update ${packages.join(' ')}`
          : 'pnpm update';
        break;
      case 'pip':
        command = 'pip list --outdated --format=json';
        break;
      case 'go':
        command = 'go get -u ./...';
        break;
      case 'cargo':
        command = 'cargo update';
        break;
      default:
        command = 'npm update';
    }

    return await this.executor.execute(command);
  }

  /**
   * 删除依赖
   */
  async remove(packages) {
    let command;
    const pkgList = packages.join(' ');

    switch (this.packageManager) {
      case 'npm':
        command = `npm uninstall ${pkgList}`;
        break;
      case 'yarn':
        command = `yarn remove ${pkgList}`;
        break;
      case 'pnpm':
        command = `pnpm remove ${pkgList}`;
        break;
      case 'pip':
        command = `pip uninstall -y ${pkgList}`;
        break;
      case 'go':
        command = `go mod edit -droprequire=${pkgList}`;
        break;
      case 'cargo':
        command = `cargo remove ${pkgList}`;
        break;
      default:
        command = `npm uninstall ${pkgList}`;
    }

    return await this.executor.execute(command);
  }

  /**
   * 安全审计
   */
  async audit() {
    let command;

    switch (this.packageManager) {
      case 'npm':
        command = 'npm audit';
        break;
      case 'yarn':
        command = 'yarn audit';
        break;
      case 'pnpm':
        command = 'pnpm audit';
        break;
      case 'pip':
        command = 'pip-audit';
        break;
      case 'go':
        command = 'govulncheck ./...';
        break;
      case 'cargo':
        command = 'cargo audit';
        break;
      default:
        command = 'npm audit';
    }

    return await this.executor.execute(command);
  }

  /**
   * 检查过时依赖
   */
  async outdated() {
    let command;

    switch (this.packageManager) {
      case 'npm':
        command = 'npm outdated';
        break;
      case 'yarn':
        command = 'yarn outdated';
        break;
      case 'pnpm':
        command = 'pnpm outdated';
        break;
      case 'pip':
        command = 'pip list --outdated';
        break;
      case 'go':
        command = 'go list -u -m all';
        break;
      case 'cargo':
        command = 'cargo outdated';
        break;
      default:
        command = 'npm outdated';
    }

    return await this.executor.execute(command);
  }

  /**
   * 列出依赖
   */
  async list() {
    let command;

    switch (this.packageManager) {
      case 'npm':
        command = 'npm list --depth=0 --json';
        break;
      case 'yarn':
        command = 'yarn list --depth=1';
        break;
      case 'pnpm':
        command = 'pnpm list --depth=0';
        break;
      case 'pip':
        command = 'pip list --format=json';
        break;
      case 'go':
        command = 'go list -m all';
        break;
      case 'cargo':
        command = 'cargo tree --depth=1';
        break;
      default:
        command = 'npm list --depth=0';
    }

    return await this.executor.execute(command);
  }

  /**
   * 生成依赖报告
   */
  async generateReport() {
    const [listResult, outdatedResult, auditResult] = await Promise.all([
      this.list(),
      this.outdated(),
      this.audit().catch(e => ({ success: false, error: e.message }))
    ]);

    return {
      packageManager: this.packageManager,
      dependencies: listResult,
      outdated: outdatedResult,
      audit: auditResult,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 开发工具服务（统一入口）
 */
class DevToolsService {
  constructor(cwd, options = {}) {
    this.cwd = cwd;
    this.testRunner = new TestRunner(cwd, options);
    this.formatter = new CodeFormatter(cwd, options);
    this.deps = new DependencyManager(cwd, options);
  }

  /**
   * 运行测试
   */
  async runTests(options = {}) {
    return await this.testRunner.run(options);
  }

  /**
   * 格式化代码
   */
  async formatCode(file, options = {}) {
    return await this.formatter.format(file, options);
  }

  /**
   * 格式化全部
   */
  async formatAll(pattern, options = {}) {
    return await this.formatter.formatAll(pattern, options);
  }

  /**
   * 安装依赖
   */
  async installDeps(packages, options = {}) {
    return await this.deps.install(packages, options);
  }

  /**
   * 审计依赖
   */
  async auditDeps() {
    return await this.deps.audit();
  }
}

// 导出
module.exports = {
  CommandExecutor,
  TestFrameworkDetector,
  TestRunner,
  CodeFormatter,
  DependencyManager,
  DevToolsService
};
