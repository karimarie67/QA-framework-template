# Site config (step 3)

The handbook's "Where things go" (section 4) says where the site-specific
values live. This is how to fill them in so the tests hold up.

## Probe before writing

Load each page in a real browser (a throwaway Playwright script in a scratch
directory), and read what's actually there: titles, the header menu, headings,
the footer, form fields and their `type`, `name`, `placeholder`, and
`required` attributes, image alt text, and the 404 page. Every expected value
in config comes from a probe, never from what the site "should" say. Probes
are read-only, like the tests.

Wait for the page to finish loading before interacting. A site builder (Wix,
Squarespace, and so on) wires up its controls after `load`, so an early click
or tap can do nothing and look like a defect. Before logging anything as a
defect, probe it again, with a screenshot.

## Selectors

Site builders generate class names and IDs that change on every publish. Hook
elements by role, accessible name, and placeholder (`getByRole`,
`getByPlaceholder`), and put them in one site-named block in `selectors.js`
(`selectors.<site>.*`), as the
[QA-example](https://github.com/karimarie67/QA-example) Engagement's
`selectors.shop.*` block does (a private repo). Rewrite `config-helper.js` for
the site's pages, titles, and test data, and update `tests/unit/` to match.

## Phones

The template's `*-mobile` projects use a phone emulation
(`...devices['Pixel 5']`), not a narrow viewport. Keep it, and change only the
`baseURL`. Many sites send phones a separate layout, often with a menu button
in place of the header menu, which a desktop browser never sees at any width.
If a project still sets `viewport: { width: 800, height: 600 }`, replace it with
the emulation. The brief's "Browsers and devices" names the device.

Tests that navigate need to open the phone menu first, and should retry the tap
until the menu is open, for the reason above. Click only while the menu is
still closed, so a retry can't close a menu that opened late:

```javascript
const menu = page.getByRole('navigation');
await expect(async () => {
  if (!(await menu.isVisible())) await page.getByRole('button', { name: /menu/i }).click();
  await expect(menu).toBeVisible({ timeout: 1000 });
}).toPass();
```

## Skeleton specs

The template's specs come from a documentation site (docs, downloads,
search). For each one, keep what fits the site, rewrite it with the site's
selectors, or remove it, and log which and why. Update
`scripts/template-check.js`'s spec list, the npm scripts, and the CI jobs to
match (step 5 finishes the CI side). `TC_ERROR_006` clicks submit on the first
form it finds: on a read-only site, remove it.

## Proving the tests

Run every spec against the site, on desktop and phone, twice. A test that
passes must be able to fail, and a test that fails must fail on a real defect,
which the log names. The procedure for the first is in
[`shared-rules.md`](shared-rules.md) ("Prove a test can fail"). Use
`expect.soft` where one test checks several things, so one defect doesn't hide
the others.
