# QA Automation Framework

A Playwright QA automation **Framework** for testing a website: a template you
create a repo from for each client Engagement, then fill in for that site.

What an Engagement gets:

- **Playwright suites** (smoke, regression, error handling, and a link
  checker), run on a desktop browser and an emulated phone.
- **CI** that runs them on every push and PR, and publishes a **QA metrics
  dashboard** from each run on `main`.
- **Test management in GitHub:** user stories and Test Case issues on a
  project board, each test case automated by one test, and a **coverage map**
  that traces story → test case → test.
- **Claude Code skills** that set up an Engagement step by step, and import a
  client's existing manual test cases.
- **Atlas guardrails** that keep agent-driven work safe: no force-pushes, no
  secrets in the repo, and changes that land through reviewed PRs.

## Starting an Engagement

**With Claude Code (recommended).** From a clone of this template, run
**`/new-engagement <site URL>`**. It creates the Engagement's repo and works
through the kickoff, one logged, reviewed PR per step, and hands you the steps
only you can do. If the client already has manual test cases, it runs
**`/import-test-cases <file>`** as part of the kickoff. See
[`.claude/skills/new-engagement/`](./.claude/skills/new-engagement/SKILL.md).

**By hand.** Click **"Use this template"** on GitHub to create a repo with a
clean history. Copy
[`docs/engagement-brief-template.md`](./docs/engagement-brief-template.md) to
`docs/engagement-brief.md` and fill it in with the client: it's the only
per-Engagement document to write, and its kickoff checklist covers the rest of
the setup. The process itself is in the [QA Handbook](./docs/qa-handbook.md).

## What's in the repo

| Path | What it is |
|---|---|
| `tests/` | The Playwright specs, and `tests/unit/` for the Framework's own unit tests |
| `playwright.config.js`, `config-helper.js`, `selectors.js` | The **Site config**: base URLs, test data, and element hooks for the site under test |
| `test-helpers.js`, `utils.js` | Shared helpers: page loads, phone menus, polite requests, evidence screenshots, link-check verdicts |
| `docs/` | The QA Handbook, the brief template, test management, and the coverage map |
| `dashboards/` | The dashboard generator, and the dashboard CI publishes |
| `scripts/` | Label and board setup, the coverage map, and the `template-check` structural check |
| `test-results/` | Committed proof of work, one folder per test. Playwright's own run output goes to `playwright-output/`, which isn't committed |
| `.claude/skills/` | The `/new-engagement` and `/import-test-cases` skills |
| `examples/` | Sample test case spreadsheets from a past Engagement, for trying `/import-test-cases` |

## Quick start

```bash
npm install
npx playwright install chromium

npm run test:smoke           # tests tagged @smoke, desktop and phone (staging projects)
npm run test:regression      # tests tagged @regression (error handling, forms, accessibility, logged-in pages), desktop and phone
npm run test:a11y            # tests tagged @a11y, desktop and phone
npx playwright test --grep @api --project=staging  # the API tests (siteConfig.api)
npx playwright test --grep @perf --project=staging   # the performance budgets (siteConfig.perf)
npx playwright test --grep @forms --project=staging   # any tag
QA_BROWSERS=all npx playwright test --project=staging-firefox --project=staging-webkit --project=staging-iphone  # other browsers, opt-in
npm run test:skeleton        # the skeleton specs, the login, and the API tests against the committed fixture site
npm run test:links           # link checker
npm run test:unit            # unit tests for the Site config, helpers, scripts, and dashboard
npm run test:template-check  # structural check: the config imports, the specs are found, and every spec CI names exists
npm run lint                 # ESLint, with the Playwright plugin for the specs
npm run coverage             # regenerate docs/coverage-map.md from the specs' test_case annotations
npm run labels:setup -- owner/repo  # create the labels the issue forms and triage need
npm run board:setup -- owner/repo   # create the project board, with Status from docs/agents/issue-tracker.md
```

## Configuring a new site

A new Engagement edits the Site config across a few files, all marked with
`TODO(Engagement)` comments:

- [`config-helper.js`](./config-helper.js) and
  [`playwright.config.js`](./playwright.config.js): base URLs, test data, and
  other placeholder values.
- [`selectors.js`](./selectors.js): the element hooks. Add one site-named block
  (`selectors.<site>.*`), hooked by role and accessible name.
- The skeleton specs under `tests/`: keep what fits the site, rewrite it, or
  remove it. Each has `TODO(Engagement)` markers at the assertions that need
  real content.
- A site with a login: `siteConfig.auth` in `config-helper.js`, and the test
  account as `QA_USERNAME` and `QA_PASSWORD` (environment variables locally,
  repo secrets in CI, never in the repo). The tests log in once per run and
  run the logged-in specs from the saved session; the rest run logged out.

How to probe the site and fill these in so the tests hold up (phones, live
sites, logins, proving each test can fail) is in
[`site-config.md`](./.claude/skills/new-engagement/site-config.md).

## CI

- `unit-tests` and `template-check` run on every push and PR to
  `main`/`develop`, with no configuration needed.
- `skeleton-self-test` runs the skeleton specs, the API tests, and the login with the
  logged-in spec, against the committed fixture site (`tests/fixtures/site/`)
  on every push and PR, so a change that
  breaks a spec is caught before an Engagement meets it.
- The browser e2e jobs (`smoke-tests`, and `functional-tests` for error
  handling, forms, accessibility, and the logged-in pages) run the desktop and phone projects, but only via manual `workflow_dispatch` until the Site config is
  real. The workflow's comments give the conditions an Engagement switches on
  to run them on every push and PR (`/new-engagement` step 5).
- The `link-check` job runs only on manual dispatch, with `links` or `all`.
- The e2e jobs select tests by suite tag (`@smoke`, `@regression`), so a new
  spec runs in CI with no workflow edit; `template-check` fails a test with
  no suite tag, or one that doesn't fit its file.
- A nightly scheduled run is ready in the workflow, commented out, for
  monitoring a live site; `/new-engagement` step 5 turns it on.
- `lint` runs ESLint on every push and PR and fails on any error or warning:
  a missing `await` on an assertion, a stray `test.only`, unused or undefined
  names (`eslint.config.js`). In CI a `test.only` also fails the test run
  (`forbidOnly`).
- Dependabot ([`.github/dependabot.yml`](./.github/dependabot.yml)) opens a
  weekly PR for npm updates (minor and patch grouped, each major on its own)
  and one for GitHub Actions, a week after each release. They run the same
  checks and are never merged automatically. Before merging a Playwright
  upgrade, re-run the logged-in no-leak check (the file's comments say how).

## Learn more

- [QA Handbook](./docs/qa-handbook.md): the QA process, testing strategy,
  bugs and severity, and writing and maintaining automated tests.
- [Test management](./docs/github_test_management.md): stories, Test Case
  issues, labels, and the board.
- [Running an Engagement with Jira](./docs/jira.md): for a client who tracks
  work in Jira instead of GitHub Issues.
- [`QA-jahnelgroup`](https://github.com/karimarie67/QA-jahnelgroup): a
  finished Engagement built with `/new-engagement`, to see the end result.

<!-- atlas-v3:readme:start -->
## Atlas

This repo uses Atlas, a Claude Code plugin that acts as a shared path for AI-assisted development — generated, customizable policies, guidelines, and guardrails that keep agent-driven work safe and consistent without locking teams into one rigid workflow. Read [`docs/atlas-operators-guide.md`](./docs/atlas-operators-guide.md) for how to work in this repo, in plain language, and the **Atlas** section in [`CLAUDE.md`](./CLAUDE.md) for the policy the agents follow.

**Before working in this repo:**

1. **Activate git hooks** (one-time, per clone):

   ```bash

   git config core.hooksPath .githooks

   ```

   These block a handful of destructive git operations before they run.

2. **Claude Code hooks** are already configured in `.claude/settings.json` — they guard against risky file, shell, and MCP actions during agent sessions. See `docs/agents/guardrails.md` if you need to change them.

Everything Atlas generated here — hooks, the `CLAUDE.md` section, `docs/agents/` — is a **base recommendation**, not fixed policy. Adapt it to this project's actual needs and processes.
<!-- atlas-v3:readme:end -->
