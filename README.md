# RAI · Governance & Policy — Speaker Series site

One-page static site (About, Events, Blog chapters on `index.html`).

## Layout

| Path | What it is |
| --- | --- |
| `src/*.html` | Section partials — **edit these** |
| `build_site.py` | Stitches the partials into `index.html` and writes the `events.html` / `blog.html` redirects |
| `index.html`, `events.html`, `blog.html` | Generated pages (committed so the site also works without a build) |
| `site.css`, `site.js` | Styles and behaviour |
| `assets/` | Images |
| `.github/workflows/pages.yml` | Builds and deploys to GitHub Pages on every push to `main` |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

## Local preview

```bash
python3 build_site.py
python3 -m http.server 8766
```

Then open http://localhost:8766/.

## Publish on GitHub Pages

1. Create a repository on GitHub (e.g. `rai-web`) and push this folder to its `main` branch.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Each push to `main` rebuilds and deploys. The site appears at
   `https://<username>.github.io/rai-web/`.

All links in the site are relative, so it works both at a project URL (`/rai-web/`) and at a custom domain. For a custom domain, add a `CNAME` file containing the domain and copy it into `_site` in the workflow's "Collect public files" step.
