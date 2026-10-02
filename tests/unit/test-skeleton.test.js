import test from 'node:test';
import assert from 'node:assert/strict';
import { playwrightArgs, exitCodeFor, DEFAULT_SPECS, DEFAULT_PROJECTS } from '../../scripts/test-skeleton.js';

test('playwrightArgs', async t => {
  await t.test('no arguments: the four skeleton specs on production and production-mobile, no retries', () => {
    assert.deepEqual(playwrightArgs([]), [
      'test', ...DEFAULT_SPECS, ...DEFAULT_PROJECTS.map(p => `--project=${p}`), '--retries=0',
    ]);
    assert.equal(DEFAULT_SPECS.length, 4);
  });

  await t.test('a spec replaces the default specs, and --project replaces the default projects', () => {
    assert.deepEqual(playwrightArgs(['tests/forms_tests.spec.js', '--project=production']), [
      'test', 'tests/forms_tests.spec.js', '--project=production', '--retries=0',
    ]);
    assert.deepEqual(playwrightArgs(['--project', 'production-mobile']), [
      'test', ...DEFAULT_SPECS, '--project=production-mobile', '--retries=0',
    ]);
  });

  await t.test('other arguments pass through', () => {
    const args = playwrightArgs(['--reporter=list,json,html']);
    assert.equal(args.at(-1), '--reporter=list,json,html');
  });

  await t.test('a --retries argument is dropped: retries stay 0', () => {
    for (const given of [['--retries=2'], ['--retries', '2']]) {
      const args = playwrightArgs(given);
      assert.equal(args.filter(a => a.startsWith('--retries')).join(), '--retries=0');
      assert.ok(!args.includes('2'));
    }
  });
});

test('exitCodeFor', async t => {
  await t.test("Playwright's own code is passed on", () => {
    assert.equal(exitCodeFor(0, null), 0);
    assert.equal(exitCodeFor(1, null), 1);
  });

  await t.test('killed by a signal (no code) is a failure', () => {
    assert.equal(exitCodeFor(null, 'SIGKILL'), 1);
    assert.equal(exitCodeFor(null, null), 1);
  });
});
