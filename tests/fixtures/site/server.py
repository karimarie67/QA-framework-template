#!/usr/bin/env python3
"""A small website for testing the template's skeleton specs against.

Run by `npm run test:skeleton` (scripts/test-skeleton.js), which sets PORT and
points the specs at it with QA_BASE_URL and QA_SITE_CONFIG (site.json, next to
this file). Python standard library only; binds to 127.0.0.1 only.

It serves three pages (/, /about, /contact) with a header menu that sits behind
a "Menu" button on narrow screens, a footer, and a contact form; a not-found
page for anything else; and a 400 for a malformed path.

BREAK=<id> turns on one fault, to prove each skeleton test fails on what it
checks (see the plan, template issue #30):

  no-h1          /about has no <h1>                       TC_SMOKE_001
  nav-404        the About menu link goes to a missing page TC_SMOKE_002
  no-footer      no page has a footer                     TC_SMOKE_003
  soft-404       an unknown address answers 200           TC_ERROR_001
  malformed-500  a malformed path answers 500             TC_ERROR_002
  unlabelled     the Email field loses its label          TC_FORM_001
  form-post      /contact POSTs to its own origin on load TC_FORM_001
  img-no-alt     / has an image with no alt text          TC_A11Y_001
  page-404       /about answers 404                       TC_A11Y_001
  lang-mismatch  <html lang="en" xml:lang="fr">           TC_A11Y_001 still passes
"""

import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

BREAK = os.environ.get("BREAK", "")
PORT = int(os.environ.get("PORT", "8765"))
# Somewhere that isn't this site's origin, standing in for an analytics beacon.
THIRD_PARTY = f"http://127.0.0.1:{PORT + 1}/collect"

STYLE = """
body { font-family: sans-serif; margin: 0; color: #111; background: #fff; }
header, main, footer { padding: 1rem; }
.menu-toggle { display: none; }
.mobile-menu a { margin-right: 1rem; color: #0645ad; }
footer a { margin-right: 1rem; color: #0645ad; }
@media (max-width: 600px) {
  .menu-toggle { display: inline-block; }
  .mobile-menu { position: fixed; top: 0; left: 100vw; width: 80vw; height: 100vh;
                 background: #fff; padding: 1rem; transition: left 0.2s; }
  .mobile-menu.open { left: 20vw; }
  .mobile-menu a { display: block; margin: 0 0 1rem; }
}
"""

MENU_SCRIPT = """
<script>
  const button = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');
  button.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
</script>
"""


def page(title, h1, body, extra_head=""):
    lang = ' lang="en" xml:lang="fr"' if BREAK == "lang-mismatch" else ' lang="en"'
    about_href = "/missing" if BREAK == "nav-404" else "/about"
    heading = "" if (BREAK == "no-h1" and title == "About") else f"<h1>{h1}</h1>"
    footer = "" if BREAK == "no-footer" else (
        '<footer><a href="/privacy">Privacy</a><a href="/terms">Terms</a></footer>'
    )
    return f"""<!doctype html>
<html{lang}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | Fixture</title>
<style>{STYLE}</style>
{extra_head}
</head>
<body>
<header>
  <button class="menu-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="menu">&#9776;</button>
  <nav id="menu" class="mobile-menu" aria-label="Main">
    <a href="/">Home</a><a href="{about_href}">About</a><a href="/contact">Contact</a>
  </nav>
</header>
<main>
{heading}
{body}
</main>
{footer}
{MENU_SCRIPT}
</body>
</html>
"""


def home():
    img = '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" width="1" height="1">' if BREAK == "img-no-alt" else ""
    return page("Home", "Welcome", f"<p>The fixture site's home page.</p>{img}")


def about():
    return page("About", "About us", "<p>About the fixture site.</p>")


def contact():
    email_label = "" if BREAK == "unlabelled" else '<label for="email">Email</label>'
    own_post = (
        "<script>fetch('/contact', {method: 'POST', body: 'x'});</script>" if BREAK == "form-post" else ""
    )
    beacon = (
        f"<script>fetch('{THIRD_PARTY}', {{method: 'POST', mode: 'no-cors', body: 'x'}}).catch(() => {{}});</script>"
    )
    form = f"""
<p>Write to us.</p>
<form method="post" action="/contact">
  <p><label for="name">Name</label> <input id="name" name="name" type="text" required></p>
  <p>{email_label} <input id="email" name="email" type="email" required placeholder="you@example.com"></p>
  <div style="display: none"><label for="website">Name</label> <input id="website" name="website" type="text" tabindex="-1"></div>
  <p><button type="submit">Send</button></p>
</form>
{beacon}{own_post}
"""
    return page("Contact", "Contact us", form)


def not_found():
    return page("Not found", "Page not found", "<p>There's no page at this address.</p>")


ROUTES = {"/": home, "/about": about, "/contact": contact}


class Handler(BaseHTTPRequestHandler):
    def send_html(self, status, html):
        body = html.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if "%ZZ" in path:
            if BREAK == "malformed-500":
                return self.send_html(500, page("Error", "Server error", ""))
            return self.send_html(400, page("Bad request", "Bad request", ""))
        if path == "/about" and BREAK == "page-404":
            return self.send_html(404, not_found())
        route = ROUTES.get(path)
        if route:
            return self.send_html(200, route())
        return self.send_html(200 if BREAK == "soft-404" else 404, not_found())

    do_HEAD = do_GET

    def do_POST(self):
        length = int(self.headers.get("Content-Length") or 0)
        self.rfile.read(length)
        self.send_response(204)
        self.end_headers()

    def log_message(self, *args):
        pass  # quiet: the test run's output is what matters


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"fixture site on http://127.0.0.1:{PORT}" + (f" (BREAK={BREAK})" if BREAK else ""), flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
