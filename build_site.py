"""Builds the Red Docket one-page site: About, Events and Blog as scroll chapters on index.html.
events.html and blog.html remain as redirects to their chapters. Styles in site.css, behaviour in site.js."""
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "src"
part = lambda n: (SRC / f"{n}.html").read_text()

DESC = "A public speaker series at Northeastern University on AI governance. Thursdays, 4:00–5:15 pm ET, ISEC 102, free and open to all."

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Responsible AI, Governance &amp; Policy · Speaker Series</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&family=Pixelify+Sans:wght@400..700&family=Nanum+Pen+Script&family=Archivo:wght@400;600;700&family=IBM+Plex+Mono:wght@500&display=swap">
<link rel="stylesheet" href="site.css">
<script>document.documentElement.classList.add("js")</script>
</head>
<body>
<div class="stage" id="stage" aria-hidden="true"><canvas id="ascii-field"></canvas></div>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs id="rnd-defs"></defs></svg>
<header class="nav" id="nav">
  <div class="wrap">
    <a class="wordmark" href="#about" data-round aria-label="Responsible AI, Governance and Policy · back to top">RAI · Governance &amp; Policy</a>
    <nav aria-label="Sections"><ul>
      <li><a class="l" href="#about" data-to="about">About</a></li>
      <li><a class="l" href="#events" data-to="events">Events</a></li>
      <li><a class="l" href="#blog" data-to="blog">Blog</a></li>
    </ul></nav>
  </div>
</header>
"""

REDIRECT = """<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{t} · Responsible AI, Governance &amp; Policy</title>
<meta http-equiv="refresh" content="0; url=index.html#{a}"><link rel="canonical" href="index.html#{a}"></head>
<body><p><a href="index.html#{a}">{t}</a></p></body></html>
"""

html = (HEAD.replace("{desc}", DESC) + '<main id="top">\n' + part("about") + part("docket") + part("writing")
        + "</main>\n" + part("close") + '<script src="site.js"></script>\n</body>\n</html>\n')
(HERE / "index.html").write_text(html)
for f, t, a in (("events.html", "Events", "events"), ("blog.html", "Blog", "blog")):
    (HERE / f).write_text(REDIRECT.replace("{t}", t).replace("{a}", a))
print("built index.html (+ redirects events.html, blog.html)")
