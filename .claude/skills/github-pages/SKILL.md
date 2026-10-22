---
name: github-pages
description: Rules, limits and capabilities of GitHub Pages hosting for this site (rohan2010.github.io). Use before adding any feature, file, build step, form, backend-like behavior, redirect, custom domain, large asset, or deploy change to this repo — it says what GitHub Pages can and cannot do and the workaround for each "cannot".
---

# GitHub Pages: what this site can and can't do

This repo is a **user site** (`rohan2010.github.io`), served at `https://rohan2010.github.io/`.
GitHub Pages is a **static file host**: it serves files and nothing else. No code runs on the server when a page is requested.

Before building a feature, check it against this file. If something needs a server, use one of the workarounds below; don't build it as if a server exists.

## Current setup (checked 2026-10-22 with `gh api repos/rohan2010/rohan2010.github.io/pages`)

| Setting | Value |
|---|---|
| Build type | `legacy`: deploys from a branch, and GitHub runs Jekyll on it |
| Source | branch `main`, folder `/` (root) |
| Repo visibility | public (needed: on a Free account, Pages only works from public repos) |
| HTTPS | enforced |
| Custom domain | none |
| Custom 404 | none yet |

To re-check, run `gh api repos/rohan2010/rohan2010.github.io/pages`.

**Consequence:** every push to `main` triggers a Jekyll build unless a `.nojekyll` file exists at the root. See "Jekyll gotchas" below.

### Next.js frontend (added 2026-10-22)
The site is a **Next.js 16 App Router static export**. `.github/workflows/deploy.yml` runs `npm ci && npm run build` and deploys `out/`. That needs Settings → Pages → Source set to **GitHub Actions** (`build_type: workflow`). While the source is still "Deploy from a branch", the raw repo is published instead, so check which one is active before debugging.
- `next.config.ts` must keep `output: "export"` and `images: { unoptimized: true }`.
- **Don't enable `cacheComponents` or `partialPrefetching`.** They turn on PPR, and the build fails with "PPR cannot be enabled in export mode".
- These don't work in a static export: Server Actions, Route Handlers that read the request (a plain GET needs `export const dynamic = 'force-static'`), `cookies()`/`headers()`, `redirects`/`rewrites`/`headers` in the config, proxy (middleware), ISR, draft mode, intercepting routes, and dynamic routes without `generateStaticParams()` or with `dynamicParams: true`.
- Use browser APIs (`window`, `localStorage`) only inside `useEffect` in client components, because pages are prerendered at build time.
- This is a user site, so it needs no `basePath`.
- Next 16 differs from older versions. Read `node_modules/next/dist/docs/` before using an API (see `AGENTS.md`).

---

## ✅ CAN do

### Content and front end
- Serve any static files: HTML, CSS, JS, images, fonts, video, audio, PDFs, JSON, WASM, and so on. More than 750 MIME types are served, based on `mime-db`.
- Run any client-side JavaScript framework: React, Vue, Svelte, vanilla JS, Three.js, WebGL, and similar. The browser runs it, not the server.
- Use static site generators: Jekyll natively, or Hugo, Astro, Next.js (`output: 'export'`), Vite, Eleventy and others through a GitHub Actions build.
- Use extensionless URLs: `about.html` is also served at `/about`. `folder/index.html` is served at `/folder/`.
- Add a custom 404 page with `404.html` at the publishing root, or `404.md` with front matter `permalink: /404.html`.
- Load third-party CDNs and scripts, embeds (YouTube, maps), and fonts.
- Fetch from external APIs in the browser. The API must allow CORS from this origin.
- Let other sites fetch your files: Pages responds with `Access-Control-Allow-Origin: *`.
- Use PWA features: service workers and a web manifest. Service workers need HTTPS, which you already have.

### Workarounds for things that usually need a server
| Need | Do this on Pages |
|---|---|
| Contact form | Third-party form endpoint (Formspree, Getform, Web3Forms, Google Forms) or a `mailto:` link |
| Comments | Giscus or utterances (stored in GitHub Discussions or Issues), or another hosted widget |
| Analytics | Client-side script (GoatCounter, Plausible, Google Analytics, and similar) |
| Search | Client-side index (Lunr, Pagefind, Fuse.js) built at deploy time |
| Database or dynamic data | External BaaS (Firebase, Supabase) called from the browser, or JSON files committed to the repo |
| Server logic / secrets | Separate serverless host (Cloudflare Workers, Vercel/Netlify functions) that the page calls |
| Redirects | `jekyll-redirect-from` plugin, or a stub page with `<meta http-equiv="refresh" content="0; url=/new/">` plus a `<link rel="canonical">` |
| SPA deep links (`/app/route`) | Hash routing (`/#/route`), or copy `index.html` to `404.html`. The 404 trick returns HTTP 404, which is bad for SEO |
| Security headers (CSP and others) | `<meta http-equiv="Content-Security-Policy" ...>`. Only some headers work as meta tags |
| Scheduled content updates | GitHub Actions cron workflow that rebuilds or commits data |

### Hosting features
- Custom domain: apex, `www`, or another subdomain, with a free Let's Encrypt certificate and Enforce HTTPS. See `reference.md`.
- Deploy from a branch (current setup) or from a custom GitHub Actions workflow, which allows any build tool, Jekyll 4, or any plugin.
- Unpublish the site from repo Settings → Pages, then re-enable it later.

---

## ❌ CAN'T do

### No server
- **No server-side code.** PHP, Python, Node/Express, Ruby and similar do not run at request time. A `.php` file is downloaded as text, not executed.
- **No database** on the host, and no sessions or server-side login.
- **No secrets.** Every file in the published site is public, and so is everything in a public repo. An API key placed in client JS is visible to anyone. Only use keys built to be public, such as Firebase web config or restricted Maps keys.
- **No handling of POST or other request methods.** Forms need an external endpoint.
- **No custom HTTP response headers.** `_headers`, `.htaccess`, `nginx.conf` and `web.config` are ignored. `Cache-Control` is fixed at `max-age=600` (10 minutes).
- **No server-side redirects or rewrites,** and no real 301s you configure yourself. Use the workarounds above.
- **No custom MIME types** per file or per repo.
- **No password protection or private site** on a Free or Pro personal account. Access-controlled sites need an organization on **GitHub Enterprise Cloud**, and only for project sites. A user site like this one is always public.

### Policy (GitHub Terms and Pages limits)
- Don't run an **online business, e-commerce store, or commercial SaaS** whose main purpose is commercial transactions. Linking out to a store or payment page is fine.
- Don't handle **sensitive transactions** such as passwords or credit card numbers on the site.
- No content that breaks GitHub's Terms or Acceptable Use policies: get-rich-quick schemes, sexually obscene content, violent or threatening content.
- Copying an existing site **is allowed only as a learning exercise**, with these conditions: write the code yourself, collect no user data, and show a prominent disclaimer that it isn't affiliated with the original.
- Visitor IP addresses are logged by GitHub for security. Mention this in a privacy note if you collect anything.

### Hard and soft limits
| Limit | Value |
|---|---|
| User/org sites per account | 1 (this repo) |
| Pages sites per repo | 1 (project sites live at `rohan2010.github.io/<repo>`) |
| Source repo size | 1 GB recommended |
| Published site size | 1 GB max |
| Deploy timeout | 10 minutes |
| Bandwidth | 100 GB per month (soft) |
| Branch builds | 10 per hour (soft; doesn't apply to custom Actions workflows) |
| Actions artifact | gzip tar, under 10 GB, **no symlinks or hard links** |
| Custom domain name length | under 64 characters, or no TLS certificate is issued |
| Single file pushed to GitHub | 100 MB hard block (git); warning at 50 MB |
| Over limits | Rate-limited requests return `429`; the site may stop being served |

For large media, host video on YouTube or Vimeo, or put large files in GitHub Releases or on a CDN or object storage. Don't commit big binaries. Git LFS files deploy as pointer stubs unless a custom workflow checks them out with `lfs: true`, which also uses LFS bandwidth quota.

---

## Jekyll gotchas (because this repo uses the branch/legacy build)

GitHub builds the branch with **Jekyll 3.10.0** (Ruby 3.3.4, `github-pages` gem v232, kramdown 2.4.0, Liquid 4.0.4, Rouge 3.30.0) in **safe mode**.

- **Files and folders starting with `_`, `.` or `#`, or ending with `~`, are NOT published.** `node_modules/` and `vendor/` are also excluded. To publish them, add them to `include:` in `_config.yml`, or add an empty **`.nojekyll`** at the root to skip Jekyll entirely.
- **Recommended for a hand-written HTML/CSS/JS site:** add `.nojekyll`. Without it, Jekyll also processes `{{ }}` and `{% %}` inside files that have front matter. Files without front matter are copied as-is, but stay excluded if their names start with `_`.
- **Only whitelisted plugins work.** See `reference.md`. Custom `_plugins/` code is ignored in safe mode. Any other plugin needs a custom GitHub Actions workflow, or a local build with the output pushed.
- These plugins are always on and can't be disabled: jekyll-coffeescript, jekyll-default-layout, jekyll-gist, jekyll-github-metadata, jekyll-optional-front-matter, jekyll-paginate, jekyll-readme-index, jekyll-titles-from-headings, jekyll-relative-links. One side effect: with no `index.html`, `README.md` becomes the home page.
- Locked config: `safe: true`, `lsi: false`, `incremental: false`, `highlighter: rouge`. Pages overrides any `source:` you set.
- Syntax highlighting supports Rouge only. Language names in fenced code blocks must be lowercase.
- `relative_permalinks` is not supported.
- A colon (`:`) in a published filename breaks the build.
- Symlinks in the repo need an Actions workflow; branch deploys can't publish them.
- Supported themes (`theme:`): minima, jekyll-theme-primer, architect, cayman, dinky, hacker, leap-day, merlot, midnight, minimal, modernist, slate, tactile, time-machine, jekyll-swiss. Any theme hosted on GitHub works through `remote_theme: owner/repo`.

## Deploy gotchas
- `index.html` must be at the **root of the publishing source**, with a **lowercase** name. `Index.html` gives a 404.
- Changes can take a few minutes to go live, and caches hold content for up to 10 minutes. Hard-refresh before deciding a deploy failed.
- Commits pushed by a workflow using `GITHUB_TOKEN` **do not trigger** a branch Pages build.
- The pusher must have admin rights and a verified email, or the branch may not publish.
- Even branch deploys run as a GitHub Actions run named "pages build and deployment". Check build errors in the repo's **Actions** tab, or with `gh run list`.
- Switching to an Actions workflow: set Settings → Pages → Source to "GitHub Actions" and use `configure-pages@v5`, `upload-pages-artifact@v4`, `deploy-pages@v4`, with permissions `pages: write` and `id-token: write`. The full YAML is in `reference.md`.

## Before calling a change done
1. No secrets, private data or passwords anywhere in the repo.
2. All asset URLs use `https://` (no mixed content), and paths resolve from the site root.
3. If Jekyll is active, no needed files are named `_something`. If not, `.nojekyll` exists.
4. No file over 50 MB, and total size is well under 1 GB.
5. After pushing, check the Actions run passed and the live URL returns 200: `curl -sI https://rohan2010.github.io/<path>`.

For DNS records, the workflow YAML, the plugin whitelist and the Jekyll error table, see [reference.md](reference.md).
