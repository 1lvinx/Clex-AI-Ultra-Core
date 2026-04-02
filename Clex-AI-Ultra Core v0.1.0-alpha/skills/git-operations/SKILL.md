# Git Operations - Git 操作封装

> 封装常用 Git 操作，支持仓库管理、分支操作、提交历史等

## 功能

- ✅ 仓库初始化/克隆
- ✅ 分支管理（创建/切换/合并/删除）
- ✅ 提交操作（add/commit/push/pull）
- ✅ 历史查看（log/diff/blame）
- ✅ 远程管理
- ✅ 状态查询
- ✅ Stash 操作
- ✅ Tag 管理

## 命令

```bash
/git init [path]                    # 初始化仓库
/git clone <url> [path]             # 克隆仓库
/git status                         # 查看状态
/git branch [name]                  # 创建/列出分支
/git checkout <branch>              # 切换分支
/git merge <branch>                 # 合并分支
/git add <files>                    # 添加文件
/git commit -m "message"            # 提交
/git push [remote] [branch]         # 推送
/git pull [remote] [branch]         # 拉取
/git log [options]                  # 查看历史
/git diff [ref1] [ref2]             # 查看差异
/git stash [save|list|pop|apply]    # Stash 操作
/git tag [name]                     # Tag 管理
```

## 使用示例

```bash
# 克隆仓库
/git clone https://github.com/user/repo.git ./my-project

# 创建并切换分支
/git branch feature/new-feature
/git checkout feature/new-feature

# 添加并提交
/git add src/index.js
/git commit -m "feat: add new feature"

# 查看状态和历史
/git status
/git log --oneline -10

# 推送远程
/git push origin feature/new-feature

# 合并分支
/git checkout main
/git merge feature/new-feature
```

## 返回值

所有命令返回结构化数据：

```json
{
  "success": true,
  "command": "git status",
  "output": "...",
  "data": { ... },
  "duration": 234
}
```
