#!/usr/bin/env node

/**
 * Clex-AI-Ultra Core - Node.js CLI
 * CLI entrypoint for Polyglot Core Edition
 */

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

// Version
program.version('0.1.0');

// List skills
program
  .command('list-skills')
  .description('List all available skills')
  .action(() => {
    const skillsDir = path.join(__dirname, '..', '..', 'skills');
    const skills = fs.readdirSync(skillsDir).filter(d => fs.statSync(path.join(skillsDir, d)).isDirectory());
    
    console.log('Available Skills:');
    skills.forEach(skill => {
      console.log(`  - ${skill}`);
    });
  });

// Inspect skill
program
  .command('inspect <skill>')
  .description('Inspect a specific skill')
  .action((skill) => {
    const skillPath = path.join(__dirname, '..', '..', 'skills', skill);
    if (!fs.existsSync(skillPath)) {
      console.log(`Error: Skill '${skill}' not found`);
      process.exit(1);
    }
    
    const skillMd = path.join(skillPath, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      const content = fs.readFileSync(skillMd, 'utf-8');
      console.log(`Skill: ${skill}`);
      console.log(content.substring(0, 200) + '...');
    }
  });

// Validate
program
  .command('validate')
  .description('Validate project structure')
  .action(() => {
    console.log('Validating Clex-AI-Ultra Core...');
    
    // Check specs
    const specs = ['skill-manifest', 'task-payload', 'workflow', 'permission'];
    specs.forEach(spec => {
      const file = path.join(__dirname, '..', 'specs', `${spec}.schema.json`);
      if (fs.existsSync(file)) {
        console.log(`  ✅ ${spec}.schema.json`);
      } else {
        console.log(`  ❌ ${spec}.schema.json (missing)`);
      }
    });
    
    console.log('Validation complete!');
  });

// Run workflow
program
  .command('run <workflow>')
  .description('Run a workflow')
  .action((workflow) => {
    const workflowPath = path.resolve(workflow);
    if (!fs.existsSync(workflowPath)) {
      console.log(`Error: Workflow file '${workflow}' not found`);
      process.exit(1);
    }
    
    console.log(`Running workflow: ${workflow}`);
    console.log('Work in progress - Python orchestrator integration soon');
  });

// Export
module.exports = program;
program.parse();
