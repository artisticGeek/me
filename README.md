# agampreetsingh.me

Personal portfolio — vanilla HTML, CSS, JS. Zero dependencies. Zero build step.

## Structure

```
agampreet-site/
├── index.html          # Entry point — SEO-optimised
├── css/
│   └── style.css       # All styles (~52 KB)
├── js/
│   └── script.js       # All behaviour (~23 KB)
├── resume.pdf          # Downloadable CV (add your file)
├── favicon.svg         # SVG favicon (AS initials mark)
├── favicon-32.png      # 32×32 PNG favicon (generate from SVG)
├── apple-touch-icon.png# 180×180 PNG for iOS (generate from SVG)
├── site.webmanifest    # PWA manifest
├── robots.txt          # Search crawler rules
├── sitemap.xml         # XML sitemap — update lastmod on each deploy
└── _headers            # Netlify/Cloudflare security + cache headers
```

## Deployment

**Netlify (recommended — zero config)**
1. Drag this folder into [app.netlify.com/drop](https://app.netlify.com/drop)
2. Point your custom domain in Site Settings → Domain management
3. Done. HTTPS is automatic.

**GitHub Pages**
1. Push to a repo, enable Pages from the `main` branch root
2. Add a `CNAME` file containing `agampreetsingh.me`

**Cloudflare Pages**
1. Connect your GitHub repo
2. Build command: *(leave blank)*
3. Output directory: `.` (root)

## Before deploying

- [ ] Add `resume.pdf` to the root (the FAB and welcome modal link to it)
- [ ] Generate `favicon-32.png` and `apple-touch-icon.png` from `favicon.svg`
      (use [realfavicongenerator.net](https://realfavicongenerator.net) or `svgexport`)
- [ ] Update `sitemap.xml` → `<lastmod>` date on each release
- [ ] Replace `https://agampreetsingh.me/` with your actual domain in:
      - `index.html` → `<link rel="canonical">` and all `og:url`
      - `sitemap.xml` → `<loc>`
      - `robots.txt` → `Sitemap:` directive

## SEO checklist (already done)

- ✅ Semantic HTML5 (`<header>`, `<main>`, `<article>`, `<section>`, `<footer>`, `<aside>`)
- ✅ Single `<h1>` (the name), logical heading hierarchy (h2 per role, h3 per section)
- ✅ `<title>` with full name + role keywords
- ✅ `meta description` (155 chars, keyword-rich)
- ✅ Open Graph tags (LinkedIn/Slack/WhatsApp previews)
- ✅ Twitter/X card
- ✅ Schema.org `Person` + `WebSite` JSON-LD structured data
- ✅ `<link rel="canonical">`
- ✅ `robots.txt` + `sitemap.xml`
- ✅ `lang="en"` on `<html>`
- ✅ `alt`-free images replaced with CSS/SVG (no image-only content)
- ✅ Skip-to-content link for accessibility (also helps crawlers)
- ✅ `preconnect` + `dns-prefetch` for Google Fonts
- ✅ `defer` on script — non-blocking parse
- ✅ Security headers via `_headers`

## Performance notes

- Fonts: Inter Tight + Fraunces loaded via Google Fonts with `display=swap`
- No framework, no runtime, no bundler — first byte is pure HTML
- CSS and JS are cache-immortal (`max-age=31536000`) — rename files on breaking changes
- `color-mix()` used for palette variants — supported in all modern browsers (Chrome 111+, Firefox 113+, Safari 16.2+)
