import test from 'node:test';
import assert from 'node:assert/strict';
import { playwrightArgs, exitCodeFor, fixtureLogin, DEFAULT_SPECS, DEFAULT_PROJECTS, FIXTURE_USERNAME } from '../../scripts/test-skeleton.js';

test('playwrightArgs', async t => {
  await t.test('no arguments: the skeleton, logged-in, and API specs on the production projects, no retries', () => {
    assert.deepEqual(playwrightArgs([]), [
      'test', ...DEFAULT_SPECS, ...DEFAULT_PROJECTS.map(p => `--project=${p}`), '--retries=0',
    ]);
    assert.equal(DEFAULT_SPECS.length, 6);
    assert.ok(DEFAULT_SPECS.includes('tests/api_tests.spec.js'));
    assert.ok(DEFAULT_SPECS.includes('tests/account.auth.spec.js'));
    assert.deepEqual(DEFAULT_PROJECTS, ['production', 'production-mobile', 'production-auth', 'production-auth-mobile']);
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

test('fixtureLogin', async t => {
  await t.test("the caller's FIXTURE_PASSWORD goes to the server and to Playwright", () => {
    const given = 'from-the-caller';
    const login = fixtureLogin({ FIXTURE_PASSWORD: given }, () => assert.fail('no random value needed'));
    assert.equal(login.server.FIXTURE_PASSWORD, given);
    assert.equal(login.playwright.QA_PASSWORD, given);
  });

  await t.test('without one, a random value for the run, the same on both sides', () => {
    const a = fixtureLogin({});
    const b = fixtureLogin({});
    assert.ok(a.server.FIXTURE_PASSWORD.length >= 20);
    assert.equal(a.playwright.QA_PASSWORD, a.server.FIXTURE_PASSWORD);
    assert.notEqual(a.server.FIXTURE_PASSWORD, b.server.FIXTURE_PASSWORD);
  });

  await t.test('the username is the fixed fixture name on both sides', () => {
    const login = fixtureLogin({});
    assert.equal(login.server.FIXTURE_USERNAME, FIXTURE_USERNAME);
    assert.equal(login.playwright.QA_USERNAME, FIXTURE_USERNAME);
  });
});
