#!/usr/bin/env node

/**
 * Clex-AI-Ultra Core - Rust Validator CLI (scan)
 * clex-scan: scan skills directory for structure validation
 */

const fs = require('fs');
const path = require('path');

function main() {
  const skillsDir = path.join(__dirname, '..', '..', '..', 'skills');
  
  if (!fs.existsSync(skillsDir)) {
    console.log('Error: skills directory not found');
    process.exit(1);
  }
  
  const skills = fs.readdirSync(skillsDir).filter(d => fs.statSync(path.join(skillsDir, d)).isDirectory());
  
  console.log('Scanning skills...');
  
  skills.forEach(skill => {
    const skillPath = path.join(skillsDir, skill);
    const skillMd = path.join(skillPath, 'SKILL.md');
    
    if (fs.existsSync(skillMd)) {
      console.log(`  ✅ ${skill}`);
    } else {
      console.log(`  ⚠️  ${skill} (SKILL.md missing)`);
    }
  });
  
  console.log(`\nTotal: ${skills.length} skills scanned`);
}

main();
