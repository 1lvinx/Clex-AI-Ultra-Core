/**
 * Permission Engine Tests
 */

const { PermissionEngine } = require('../index');
const { describe, it, beforeEach, expect, TestUtils } = require('../../test-framework');

describe('PermissionEngine', (suite) => {
  let engine;

  suite.beforeEach(() => {
    engine = new PermissionEngine();
  });

  suite.test('should initialize with default rules', async () => {
    expect.ok(engine.rules);
    expect.ok(engine.rules.length > 0);
  });

  suite.test('should allow safe commands', async () => {
    const result = await engine.checkCommand('ls -la');
    expect.equal(result.allowed, true);
  });

  suite.test('should block dangerous commands', async () => {
    const result = await engine.checkCommand('rm -rf /');
    expect.equal(result.allowed, false);
    expect.equal(result.reason.includes('dangerous'), true);
  });

  suite.test('should classify command risk levels', async () => {
    const lowRisk = await engine.classifyCommand('echo hello');
    expect.equal(lowRisk.risk, 'low');

    const mediumRisk = await engine.classifyCommand('npm install');
    expect.ok(['low', 'medium', 'high', 'critical'].includes(mediumRisk.risk));
  });

  suite.test('should add custom rules', async () => {
    const result = await engine.addRule({
      pattern: 'custom-cmd',
      action: 'allow',
      reason: 'Custom rule'
    });
    expect.equal(result.success, true);
  });

  suite.test('should remove rules', async () => {
    const initialCount = engine.rules.length;
    await engine.addRule({
      pattern: 'temp-rule',
      action: 'allow',
      reason: 'Temp'
    });
    
    const result = await engine.removeRule(engine.rules.length - 1);
    expect.equal(result.success, true);
    expect.equal(engine.rules.length, initialCount);
  });

  suite.test('should list all rules', async () => {
    const rules = await engine.listRules();
    expect.ok(Array.isArray(rules));
    expect.ok(rules.length > 0);
  });
});

// 运行测试
if (require.main === module) {
  const { TestRunner } = require('../../test-framework');
  const runner = new TestRunner({ verbose: true });
  
  const suite = new (require('node:module').createRequire(__dirname)('../index').PermissionEngine);
  
  // 手动运行测试
  (async () => {
    console.log('Running PermissionEngine tests...\n');
    
    const tests = [
      { name: 'initialize with default rules', fn: async () => {
        const eng = new PermissionEngine();
        if (!eng.rules || eng.rules.length === 0) throw new Error('No rules');
      }},
      { name: 'allow safe commands', fn: async () => {
        const eng = new PermissionEngine();
        const result = await eng.checkCommand('ls -la');
        if (!result.allowed) throw new Error('Should allow safe commands');
      }},
      { name: 'block dangerous commands', fn: async () => {
        const eng = new PermissionEngine();
        const result = await eng.checkCommand('rm -rf /');
        if (result.allowed) throw new Error('Should block dangerous commands');
      }},
      { name: 'classify command risk', fn: async () => {
        const eng = new PermissionEngine();
        const result = await eng.classifyCommand('echo hello');
        if (!['low', 'medium', 'high', 'critical'].includes(result.risk)) {
          throw new Error('Invalid risk level');
        }
      }}
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        await test.fn();
        console.log(`  ✓ ${test.name}`);
        passed++;
      } catch (error) {
        console.log(`  ✗ ${test.name}`);
        console.log(`    ${error.message}`);
        failed++;
      }
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  })();
}
