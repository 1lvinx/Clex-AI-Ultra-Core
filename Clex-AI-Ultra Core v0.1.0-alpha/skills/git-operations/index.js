/**
 * Git Operations - Git 操作封装
 * 
 * 封装常用 Git 操作
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

/**
 * Git 命令执行器
 */
class GitExecutor {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.gitPath = options.gitPath || 'git';
    this.timeout = options.timeout || 30000;
    this.maxBuffer = options.maxBuffer || 1024 * 1024 * 10; // 10MB
  }

  /**
   * 执行 Git 命令
   */
  async execute(args, options = {}) {
    const {
      cwd = this.cwd,
      timeout = this.timeout,
      env = {}
    } = options;

    const command = `${this.gitPath} ${args.join(' ')}`;
    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout,
        maxBuffer: this.maxBuffer,
        env: { ...process.env, ...env }
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
        exitCode: error.code
      };
    }
  }

  /**
   * 检查 Git 是否可用
   */
  async checkGit() {
    try {
      const result = await this.execute(['--version']);
      return {
        available: result.success,
        version: result.output,
        path: this.gitPath
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
}

/**
 * Git 仓库管理器
 */
class GitRepository {
  constructor(repoPath, options = {}) {
    this.repoPath = path.resolve(repoPath);
    this.executor = new GitExecutor({ cwd: this.repoPath, ...options });
    this.remotes = new Map();
  }

  /**
   * 检查是否是 Git 仓库
   */
  async isRepository() {
    const result = await this.executor.execute(['rev-parse', '--git-dir']);
    return result.success;
  }

  /**
   * 初始化仓库
   */
  async init(options = {}) {
    const { bare = false, initialBranch = 'main' } = options;
    
    const args = ['init'];
    if (bare) args.push('--bare');
    if (initialBranch) args.push(`--initial-branch=${initialBranch}`);
    args.push(this.repoPath);

    const result = await this.executor.execute(args, { cwd: path.dirname(this.repoPath) });
    
    if (result.success) {
      // 确保目录存在
      if (!fs.existsSync(this.repoPath)) {
        fs.mkdirSync(this.repoPath, { recursive: true });
      }
    }

    return result;
  }

  /**
   * 克隆仓库
   */
  async clone(url, options = {}) {
    const {
      depth = null,
      branch = null,
      bare = false,
      mirror = false,
      singleBranch = false
    } = options;

    const args = ['clone', url];
    
    if (depth) args.push('--depth', depth.toString());
    if (branch) args.push('--branch', branch);
    if (bare) args.push('--bare');
    if (mirror) args.push('--mirror');
    if (singleBranch) args.push('--single-branch');
    
    args.push(this.repoPath);

    const result = await this.executor.execute(args, { cwd: path.dirname(this.repoPath) });

    if (result.success) {
      await this.loadRemotes();
    }

    return result;
  }

  /**
   * 获取状态
   */
  async status() {
    const result = await this.executor.execute(['status', '--porcelain', '--branch']);
    
    if (!result.success) {
      return result;
    }

    const lines = result.output.split('\n').filter(l => l.trim());
    const parsed = {
      branch: null,
      ahead: 0,
      behind: 0,
      files: []
    };

    for (const line of lines) {
      if (line.startsWith('## ')) {
        const branchMatch = line.match(/^## ([^.]+)(?:\.\.\.(.+?))?$/);
        if (branchMatch) {
          parsed.branch = branchMatch[1];
          
          if (branchMatch[2]) {
            const aheadBehind = branchMatch[2].match(/ahead (\d+)/);
            if (aheadBehind) parsed.ahead = parseInt(aheadBehind[1]);
            
            const behindMatch = branchMatch[2].match(/behind (\d+)/);
            if (behindMatch) parsed.behind = parseInt(behindMatch[1]);
          }
        }
      } else {
        const status = line.substring(0, 2);
        const file = line.substring(3).trim();
        
        let path = file;
        if (file.includes(' -> ')) {
          const parts = file.split(' -> ');
          path = { from: parts[0].trim(), to: parts[1].trim() };
        }

        parsed.files.push({
          status: {
            index: status[0] === ' ' ? null : status[0],
            workingTree: status[1] === ' ' ? null : status[1]
          },
          path
        });
      }
    }

    return {
      success: true,
      command: 'git status',
      data: parsed,
      duration: result.duration
    };
  }

  /**
   * 添加文件
   */
  async add(files) {
    const fileArray = Array.isArray(files) ? files : [files];
    return await this.executor.execute(['add', ...fileArray]);
  }

  /**
   * 提交
   */
  async commit(message, options = {}) {
    const {
      all = false,
      amend = false,
      noVerify = false,
      signoff = false
    } = options;

    const args = ['commit', '-m', message];
    
    if (all) args.unshift('-a');
    if (amend) args.push('--amend');
    if (noVerify) args.push('--no-verify');
    if (signoff) args.push('--signoff');

    return await this.executor.execute(args);
  }

  /**
   * 推送
   */
  async push(remote = 'origin', branch = null, options = {}) {
    const {
      force = false,
      setUpstream = false,
      tags = false
    } = options;

    const args = ['push'];
    
    if (force) args.push('--force');
    if (setUpstream) args.push('-u');
    if (tags) args.push('--tags');
    
    args.push(remote);
    
    if (branch) {
      args.push(branch);
    }

    return await this.executor.execute(args);
  }

  /**
   * 拉取
   */
  async pull(remote = 'origin', branch = null, options = {}) {
    const {
      rebase = false,
      noCommit = false
    } = options;

    const args = ['pull'];
    
    if (rebase) args.push('--rebase');
    if (noCommit) args.push('--no-commit');
    
    args.push(remote);
    
    if (branch) {
      args.push(branch);
    }

    return await this.executor.execute(args);
  }

  /**
   * 获取分支列表
   */
  async listBranches(options = {}) {
    const {
      remote = false,
      all = false
    } = options;

    const args = ['branch'];
    
    if (remote) args.push('-r');
    if (all) args.push('-a');

    const result = await this.executor.execute(args);
    
    if (!result.success) {
      return result;
    }

    const branches = result.output
      .split('\n')
      .filter(l => l.trim())
      .map(line => {
        const isCurrent = line.startsWith('*');
        const name = line.replace(/^\*\s*/, '').trim();
        return { name, current: isCurrent };
      });

    return {
      success: true,
      command: 'git branch',
      data: branches,
      duration: result.duration
    };
  }

  /**
   * 创建分支
   */
  async createBranch(name, startPoint = null) {
    const args = ['branch', name];
    
    if (startPoint) {
      args.push(startPoint);
    }

    return await this.executor.execute(args);
  }

  /**
   * 切换分支
   */
  async checkout(branch, options = {}) {
    const {
      create = false,
      force = false
    } = options;

    const args = ['checkout'];
    
    if (create) args.push('-b');
    if (force) args.push('--force');
    
    args.push(branch);

    return await this.executor.execute(args);
  }

  /**
   * 合并分支
   */
  async merge(branch, options = {}) {
    const {
      noCommit = false,
      noFastForward = false,
      squash = false,
      strategy = null
    } = options;

    const args = ['merge'];
    
    if (noCommit) args.push('--no-commit');
    if (noFastForward) args.push('--no-ff');
    if (squash) args.push('--squash');
    if (strategy) args.push('-s', strategy);
    
    args.push(branch);

    return await this.executor.execute(args);
  }

  /**
   * 删除分支
   */
  async deleteBranch(name, options = {}) {
    const {
      force = false,
      remote = false
    } = options;

    const args = ['branch'];
    
    if (force) args.push('--force');
    if (remote) args.push('-d');
    else args.push('-D');
    
    args.push(name);

    return await this.executor.execute(args);
  }

  /**
   * 获取提交历史
   */
  async log(options = {}) {
    const {
      maxCount = 20,
      since = null,
      until = null,
      author = null,
      grep = null,
      oneline = true,
      decorate = false,
      path = null
    } = options;

    const args = ['log'];
    
    if (oneline) args.push('--oneline');
    if (decorate) args.push('--decorate');
    if (maxCount) args.push(`-n ${maxCount}`);
    if (since) args.push('--since', since);
    if (until) args.push('--until', until);
    if (author) args.push('--author', author);
    if (grep) args.push('--grep', grep);
    if (path) args.push('--', path);

    const result = await this.executor.execute(args);
    
    if (!result.success) {
      return result;
    }

    const commits = result.output
      .split('\n')
      .filter(l => l.trim())
      .map(line => {
        if (oneline) {
          const match = line.match(/^([a-f0-9]+)\s+(.*)$/);
          if (match) {
            return { hash: match[1], message: match[2] };
          }
        }
        return { raw: line };
      });

    return {
      success: true,
      command: 'git log',
      data: commits,
      duration: result.duration
    };
  }

  /**
   * 查看差异
   */
  async diff(ref1 = null, ref2 = null, options = {}) {
    const {
      stat = false,
      nameOnly = false,
      patch = true,
      path = null
    } = options;

    const args = ['diff'];
    
    if (stat) args.push('--stat');
    if (nameOnly) args.push('--name-only');
    if (!patch && !stat && !nameOnly) args.push('--no-patch');
    
    if (ref1) args.push(ref1);
    if (ref2) args.push(ref2);
    
    if (path) args.push('--', path);

    return await this.executor.execute(args);
  }

  /**
   * 查看 blame
   */
  async blame(filePath, options = {}) {
    const {
      lineRange = null,
      incremental = false
    } = options;

    const args = ['blame'];
    
    if (incremental) args.push('--incremental');
    if (lineRange) args.push('-L', lineRange);
    
    args.push(filePath);

    return await this.executor.execute(args);
  }

  /**
   * 远程管理
   */
  async remote(action, name = null, url = null) {
    const args = ['remote'];
    
    switch (action) {
      case 'list':
        args.push('-v');
        break;
      case 'add':
        if (!name || !url) {
          throw new Error('add 操作需要提供 name 和 url');
        }
        args.push('add', name, url);
        break;
      case 'remove':
      case 'rm':
        if (!name) {
          throw new Error('remove 操作需要提供 name');
        }
        args.push('remove', name);
        break;
      case 'set-url':
        if (!name || !url) {
          throw new Error('set-url 操作需要提供 name 和 url');
        }
        args.push('set-url', name, url);
        break;
      default:
        throw new Error(`未知的远程操作：${action}`);
    }

    const result = await this.executor.execute(args);
    
    if (action === 'list' && result.success) {
      const remotes = result.output
        .split('\n')
        .filter(l => l.trim())
        .map(line => {
          const [name, url] = line.split(/\s+/);
          return { name, url };
        });
      
      return {
        success: true,
        command: 'git remote -v',
        data: remotes,
        duration: result.duration
      };
    }

    return result;
  }

  /**
   * 加载远程信息
   */
  async loadRemotes() {
    const result = await this.remote('list');
    
    if (result.success) {
      this.remotes.clear();
      for (const remote of result.data) {
        this.remotes.set(remote.name, remote);
      }
    }
    
    return result;
  }

  /**
   * Stash 操作
   */
  async stash(action = 'save', options = {}) {
    const {
      message = null,
      includeUntracked = false,
      all = false,
      index = null
    } = options;

    const args = ['stash'];
    
    switch (action) {
      case 'save':
      case 'push':
        args.push('push');
        if (includeUntracked) args.push('-u');
        if (all) args.push('-a');
        if (message) args.push('-m', message);
        break;
      
      case 'list':
        args.push('list');
        break;
      
      case 'pop':
        args.push('pop');
        if (index !== null) args.push(`stash@{${index}}`);
        break;
      
      case 'apply':
        args.push('apply');
        if (index !== null) args.push(`stash@{${index}}`);
        break;
      
      case 'drop':
        args.push('drop');
        if (index !== null) args.push(`stash@{${index}}`);
        break;
      
      case 'clear':
        args.push('clear');
        break;
      
      default:
        throw new Error(`未知的 stash 操作：${action}`);
    }

    const result = await this.executor.execute(args);
    
    if (action === 'list' && result.success) {
      const stashes = result.output
        .split('\n')
        .filter(l => l.trim())
        .map(line => {
          const match = line.match(/^stash@{(\d+)}:\s*(.*)$/);
          if (match) {
            return { index: parseInt(match[1]), message: match[2] };
          }
          return { raw: line };
        });
      
      return {
        success: true,
        command: 'git stash list',
        data: stashes,
        duration: result.duration
      };
    }

    return result;
  }

  /**
   * Tag 管理
   */
  async tag(action = 'list', name = null, options = {}) {
    const {
      message = null,
      sign = false,
      force = false,
      deleteTag = false
    } = options;

    const args = ['tag'];
    
    switch (action) {
      case 'list':
        if (name) args.push('-l', name);
        break;
      
      case 'create':
      case 'add':
        if (!name) {
          throw new Error('创建 tag 需要提供 name');
        }
        if (force) args.push('--force');
        if (sign) args.push('--sign');
        if (message) args.push('--message', message);
        args.push(name);
        break;
      
      case 'delete':
        if (!name) {
          throw new Error('删除 tag 需要提供 name');
        }
        args.push('--delete', name);
        break;
      
      default:
        throw new Error(`未知的 tag 操作：${action}`);
    }

    const result = await this.executor.execute(args);
    
    if (action === 'list' && result.success) {
      const tags = result.output
        .split('\n')
        .filter(l => l.trim());
      
      return {
        success: true,
        command: 'git tag',
        data: tags,
        duration: result.duration
      };
    }

    return result;
  }

  /**
   * 获取当前分支
   */
  async currentBranch() {
    const result = await this.executor.execute(['branch', '--show-current']);
    
    if (result.success) {
      return {
        success: true,
        data: result.output.trim(),
        duration: result.duration
      };
    }

    return result;
  }

  /**
   * 获取远程 URL
   */
  async getRemoteUrl(remote = 'origin') {
    const result = await this.executor.execute(['remote', 'get-url', remote]);
    
    if (result.success) {
      return {
        success: true,
        data: result.output.trim(),
        duration: result.duration
      };
    }

    return result;
  }
}

/**
 * Git 服务（多仓库管理）
 */
class GitService {
  constructor(options = {}) {
    this.repositories = new Map();
    this.defaultPath = options.defaultPath || process.cwd();
  }

  /**
   * 获取或创建仓库实例
   */
  getRepository(repoPath = null) {
    const path = repoPath || this.defaultPath;
    const resolvedPath = path.resolve(path);
    
    if (!this.repositories.has(resolvedPath)) {
      this.repositories.set(resolvedPath, new GitRepository(resolvedPath));
    }
    
    return this.repositories.get(resolvedPath);
  }

  /**
   * 初始化仓库
   */
  async init(repoPath, options = {}) {
    const repo = new GitRepository(repoPath, options);
    const result = await repo.init(options);
    
    if (result.success) {
      this.repositories.set(path.resolve(repoPath), repo);
    }
    
    return result;
  }

  /**
   * 克隆仓库
   */
  async clone(url, repoPath, options = {}) {
    const repo = new GitRepository(repoPath, options);
    const result = await repo.clone(url, options);
    
    if (result.success) {
      this.repositories.set(path.resolve(repoPath), repo);
    }
    
    return result;
  }

  /**
   * 检查 Git
   */
  async checkGit() {
    const executor = new GitExecutor();
    return await executor.checkGit();
  }

  /**
   * 获取所有管理的仓库
   */
  getRepositories() {
    return Array.from(this.repositories.keys());
  }
}

// 导出
module.exports = {
  GitExecutor,
  GitRepository,
  GitService
};
