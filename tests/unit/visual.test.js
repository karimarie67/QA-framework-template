import test from 'node:test';
import assert from 'node:assert/strict';
import { imageFor, forContainer, dockerArgs } from '../../scripts/visual.js';

test('imageFor', async t => {
  await t.test("Playwright's image for the installed version", () => {
    assert.equal(imageFor('1.63.0'), 'mcr.microsoft.com/playwright:v1.63.0-noble');
  });
});

test('forContainer', async t => {
  await t.test("this machine's localhost becomes host.docker.internal", () => {
    assert.equal(forContainer('http://127.0.0.1:8765'), 'http://host.docker.internal:8765');
    assert.equal(forContainer('http://localhost/'), 'http://host.docker.internal/');
  });

  await t.test('any other URL, or none, is unchanged', () => {
    assert.equal(forContainer('https://staging.example.com'), 'https://staging.example.com');
    assert.equal(forContainer('http://localhostess.example'), 'http://localhostess.example');
    assert.equal(forContainer(undefined), undefined);
  });
});

test('dockerArgs', async t => {
  const base = { version: '1.63.0', root: '/repo', env: {} };

  await t.test('runs @visual in the image, on the staging projects, with QA_VISUAL=1', () => {
    const a = dockerArgs({ ...base, args: [] });
    assert.deepEqual(a.slice(0, 8), ['run', '--rm', '--ipc=host', '--add-host=host.docker.internal:host-gateway', '-v', '/repo:/work', '-w', '/work']);
    assert.ok(a.includes('QA_VISUAL=1'));
    assert.ok(a.includes('mcr.microsoft.com/playwright:v1.63.0-noble'));
    assert.deepEqual(a.slice(a.indexOf('npx')), ['npx', 'playwright', 'test', '--grep', '@visual', '--project=staging', '--project=staging-mobile']);
  });

  await t.test('--update becomes --update-snapshots; given projects replace the defaults', () => {
    const a = dockerArgs({ ...base, args: ['--update', '--project=production'] });
    assert.deepEqual(a.slice(a.indexOf('npx')), ['npx', 'playwright', 'test', '--grep', '@visual', '--update-snapshots', '--project=production']);
  });

  await t.test('QA_BASE_URL and QA_SITE_CONFIG pass through, rewritten for the container', () => {
    const a = dockerArgs({ ...base, args: [], env: { QA_BASE_URL: 'http://127.0.0.1:8765', QA_SITE_CONFIG: 'tests/fixtures/site/site.json' } });
    assert.ok(a.includes('QA_BASE_URL=http://host.docker.internal:8765'));
    assert.ok(a.includes('QA_SITE_CONFIG=/work/tests/fixtures/site/site.json'));
  });
});
