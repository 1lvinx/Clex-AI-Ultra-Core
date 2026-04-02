# FAQ / 常见问题

## Q: How do I update skills? / 如何更新技能？

**A:** Re-run the installation script or manually copy new files:
```bash
# 新文件会自动覆盖旧文件
cp -r clean_public_repo/skills/* ~/.openclaw/workspace/skills/
```

## Q: Can I use skills from other sources? / 能否使用其他来源的技能？

**A:** Yes! OpenClaw supports third-party skills. Just copy them to the `skills/` directory.

## Q: How do I contribute a new skill? / 如何贡献新技能？

**A:** 
1. Read `docs/skills-guide.md`
2. Create a new skill directory
3. Submit a PR with your skill

## Q: Are skills safe to use? / 技能安全吗？

**A:** All official skills are open-source and auditable. We follow security best practices and do not include credentials or sensitive data.

---

_Still have questions? Open an Issue!_
