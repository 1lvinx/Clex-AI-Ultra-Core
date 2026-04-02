/**
 * Clex-AI-Ultra Core - Node.js SDK - Manifest
 * Skill manifest loader
 */

const fs = require('fs');
const path = require('path');

class SkillManifest {
  constructor(data) {
    this.name = data.name;
    this.version = data.version;
    this.description = data.description;
    this.capabilityGroup = data.capabilityGroup;
    this.commands = data.commands || [];
  }
  
  static load(skillName) {
    const skillPath = path.join(__dirname, '..', '..', '..', 'skills', skillName);
    const skillMd = path.join(skillPath, 'SKILL.md');
    
    if (!fs.existsSync(skillMd)) {
      throw new Error(`Skill '${skillName}' not found`);
    }
    
    const content = fs.readFileSync(skillMd, 'utf-8');
    
    // Extract metadata from comments
    const metadata = {};
    const commandLines = [];
    let inCommands = false;
    
    for (const line of content.split('\n')) {
      if (line.startsWith('# ')) {
        const match = line.match(/^#\s*(\w+):\s*(.*)/);
        if (match) {
          metadata[match[1]] = match[2];
        }
      }
      
      if (line.includes('## 命令') || line.includes('## Commands')) {
        inCommands = true;
        continue;
      }
      
      if (inCommands && line.startsWith('## ')) {
        inCommands = false;
      }
      
      if (inCommands && line.trim().startsWith('/')) {
        const parts = line.trim().split(null, 1);
        if (parts.length > 0) {
          commandLines.push({ name: parts[0], description: parts[1] || '' });
        }
      }
    }
    
    return new SkillManifest({
      name: skillName,
      version: metadata.version || '1.0.0',
      description: { en: metadata.description || '', zh: metadata.描述 || '' },
      capabilityGroup: metadata.group || 'G1',
      commands: commandLines
    });
  }
}

module.exports = { SkillManifest };
