# GitHub Pages reference details

Sources: docs.github.com/en/pages (limits, publishing sources, custom domains, HTTPS, Jekyll, custom workflows, 404 troubleshooting), pages.github.com/versions.json, and response headers checked on 2026-10-22.

## Custom domain

Add the domain in **repo Settings → Pages** *before* creating DNS records, to prevent subdomain takeover. Verify the domain first in **profile Settings → Pages → Add a domain**. That creates a TXT record named `_github-pages-challenge-rohan2010.<domain>`; keep it in place permanently.

**Apex domain (`example.com`)**: A records on `@`:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```
Optional AAAA records on `@`:
```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```
Instead of A records, you can use an ALIAS or ANAME on `@` pointing to `rohan2010.github.io`.

**Subdomain (`www.example.com`)**: CNAME pointing to `rohan2010.github.io`. Don't include the repo name, and don't point it at the `*.pages.github.io` address.

- If both the apex and `www` are configured, GitHub redirects between them automatically.
- Never use wildcard DNS (`*.example.com`); it allows takeovers.
- With a branch deploy, saving the domain commits a `CNAME` file to the branch. **Pull it before your next push.** With an Actions deploy, the `CNAME` file is ignored, so set the domain in Settings or through the API.
- A `CNAME` file alone does not set the domain.
- DNS changes and the Enforce HTTPS option can each take up to 24 hours. If the certificate is stuck, remove the domain and add it again.
- Other A, AAAA or CNAME records on the same names block the certificate. Full domain name must be under 64 characters.
- If you disable Pages while a custom domain is still configured, remove the DNS records, or someone could take the domain over.
- Internationalized domain names must be entered in Punycode.

## Custom Actions workflow (`.github/workflows/pages.yml`)

Use this only when you need a build step (npm, Hugo, Jekyll 4, unsupported plugins). First set Settings → Pages → Source to **GitHub Actions**.

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/configure-pages@v5
      # - run: npm ci && npm run build   # your build; output dir below
      - uses: actions/upload-pages-artifact@v4
        with:
          path: ./dist   # or ./ for a plain static site
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
The artifact must be a gzip tar under 10 GB, with no symlinks or hard links, and must contain `index.html` at its top level. The deploy job must list the build job in `needs`.

## Jekyll whitelisted plugins (github-pages gem v232)

You can enable these with `plugins:` in `_config.yml`:
jekyll-feed 0.17.0, jekyll-sitemap 1.4.0, jekyll-seo-tag 2.8.0, jekyll-redirect-from 0.16.0, jekyll-avatar 0.8.0, jemoji 0.13.0, jekyll-mentions 1.6.0, jekyll-remote-theme 0.4.3, jekyll-include-cache 0.2.1, jekyll-commonmark-ghpages 0.5.1, jekyll-sass-converter 1.5.2 (Sass 3.7.4, an old Ruby Sass with no modern `@use` support).

These are always on: jekyll-coffeescript, jekyll-default-layout, jekyll-gist, jekyll-github-metadata, jekyll-optional-front-matter, jekyll-paginate, jekyll-readme-index, jekyll-titles-from-headings, jekyll-relative-links.

## Jekyll build errors and fixes

| Error | Fix |
|---|---|
| Config file error | Fix the YAML in `_config.yml`: spaces not tabs, a space after each `:`, quote special characters |
| Date is not a valid datetime | A variable passed to a date filter is empty |
| File does not exist in includes directory | Add the missing file to `_includes/` |
| Not properly UTF-8 encoded | Add `encoding: UTF-8` |
| Invalid highlighter language | Use Rouge |
| Invalid post date | Use `YYYY-MM-DD` in the filename or front matter |
| Invalid Sass/SCSS | Fix the syntax. Remember the compiler is old Ruby Sass 3.7 |
| Invalid or missing submodule | Remove it, or use a public `https://` submodule |
| Invalid YAML in data file | Fix the file in `_data/` |
| Missing docs folder | The `/docs` publishing source was deleted |
| Relative permalinks configured | Remove `relative_permalinks` |
| Liquid: for-loop, tag not closed or terminated, unknown tag | Fix the Liquid syntax, or check whether the plugin is unsupported |
| Generic error | Unsupported plugin, repo too big, `source:` changed, or a `:` in a filename |

## Response behavior (observed)
- `cache-control: max-age=600`, `access-control-allow-origin: *`, served through Fastly.
- Missing paths return HTTP 404 with the custom `404.html` if one exists, or GitHub's default 404 page otherwise.

## 404 checklist
Lowercase `index.html` at the publishing root; the right branch and folder selected; DNS and CNAME correct; a commit pushed by the admin; wait a few minutes or hard-refresh; changing repo visibility changes the URL; check githubstatus.com.
