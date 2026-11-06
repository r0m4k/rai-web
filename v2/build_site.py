"""Builds version_2 of the RAI · Governance & Policy site: one wall of talks and posts (src/docket.html) and a footer.
About (src/about.html) is kept but not built. events.html and blog.html redirect to the wall.
Styles in site.css, behaviour in site.js; both get a content hash in their URL."""
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "src"
part = lambda n: (SRC / f"{n}.html").read_text()

DESC = "A public speaker series at Northeastern University on AI governance. Thursdays, 4:00–5:15 pm ET, ISEC 102, free and open to all."

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#000000">
<title>Responsible AI, Governance &amp; Policy · Talks and posts</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:title" content="Responsible AI, Governance &amp; Policy">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/speaker-2.webp">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23C8102E'/%3E%3Ctext x='16' y='25' font-family='Baskerville,Georgia,serif' font-size='26' text-anchor='middle' fill='%23fff'%3EN%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baskervville:wght@500;600&family=Space+Grotesk:wght@500;600&family=Archivo:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap">
<link rel="stylesheet" href="site.css">
<script>document.documentElement.classList.add("js")</script>
</head>
<body>
<div class="stage" id="stage" aria-hidden="true"><canvas id="ascii-field"></canvas></div>
<a class="skip" href="#wall">Skip to talks and posts</a>
<header class="nav" id="nav">
  <div class="wrap">
    <a class="wordmark" href="#top" aria-label="Responsible AI, Governance and Policy · back to top">RAI · GOVER<span class="n-mark" aria-hidden="true">N</span>A<span class="n-mark" aria-hidden="true">N</span>CE &amp; POLICY</a>
  </div>
</header>
"""

REDIRECT = """<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{t} · Responsible AI, Governance &amp; Policy</title>
<meta http-equiv="refresh" content="0; url=index.html#{a}"><link rel="canonical" href="index.html#{a}"></head>
<body><p><a href="index.html#{a}">{t}</a></p></body></html>
"""

# cache busting: browsers (Safari above all) keep site.css and site.js; a content hash in the URL forces a fresh copy
import hashlib
ver = lambda f: hashlib.sha1((HERE / f).read_bytes()).hexdigest()[:8]
HEAD = HEAD.replace('href="site.css"', f'href="site.css?v={ver("site.css")}"')
# every card description stays within 300 characters, so every card on the wall can be the same size
import re as _re, html as _html
for _m in _re.finditer(r'<p class="(?:q|x)">(.*?)</p>', part("docket"), _re.S):
    _t = _html.unescape(_re.sub(r"<[^>]+>", "", _m.group(1)))
    if len(_t) > 300:
        raise SystemExit(f"card description is {len(_t)} characters (limit 300): {_t[:60]}…")
html = (HEAD.replace("{desc}", DESC) + '<main id="top">\n' + "<!-- the old About (src/about.html) is not built; version_2 opens with src/intro.html -->\n"
        # + part("about")
        + part("intro")
        + part("docket")
        + "</main>\n" + part("close") + f'<script src="site.js?v={ver("site.js")}"></script>\n</body>\n</html>\n')
(HERE / "index.html").write_text(html)
for f, t, a in (("events.html", "Events", "events"), ("blog.html", "Blog", "blog")):
    (HERE / f).write_text(REDIRECT.replace("{t}", t).replace("{a}", a))
print("built index.html (+ redirects events.html, blog.html)")
