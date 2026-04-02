#!/usr/bin/env node

/**
 * Clex-AI-Ultra Core - Rust Validator CLI
 * clex-check: manifest/workflow/permission validation
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: clex-check <manifest|workflow|permission> <file>');
    process.exit(1);
  }
  
  const type = args[0];
  const file = args[1];
  
  // Call Rust validator (binary path)
  const rustBinary = path.join(__dirname, '..', '..', '..', 'runtimes', 'rust', 'clex-check');
  
  if (!fs.existsSync(rustBinary)) {
    console.log(`Warning: Rust validator not found at ${rustBinary}`);
    console.log('Using fallback validation...');
    // Fallback: basic JSON parsing
    try {
      const content = fs.readFileSync(file, 'utf-8');
      JSON.parse(content);
      console.log(`✅ ${file} is valid JSON`);
    } catch (e) {
      console.log(`❌ ${file} is not valid JSON: ${e.message}`);
    }
    return;
  }
  
  const result = spawnSync(rustBinary, [type, file], { stdio: 'inherit' });
  process.exit(result.status || 0);
}

main();
