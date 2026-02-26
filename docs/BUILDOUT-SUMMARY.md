# ElombeKisala.com — Buildout Summary

This document describes the static site buildout: where files live, how to add content, and how the system layer and partials work.

---

## File tree (summary)

```
/
├── index.html                    # Homepage (unchanged; no system CSS)
├── css/                          # Webflow export (normalize, components, elombekisala)
├── js/
├── images/
├── src/
│   ├── system/
│   │   ├── tokens.css            # Design tokens (--ek-* variables)
│   │   ├── util.css              # Layout utilities (.ek-container, .ek-section, etc.)
│   │   └── components.css        # Components (.ek-btn, .ek-card, .ek-form, etc.)
│   ├── partials/
│   │   ├── header.html
│   │   ├── footer.html
│   │   └── cta.html
│   └── scripts/
│       └── injectPartials.js     # Injects partials into [data-include]
├── content/
│   ├── case-studies.json         # Data for /work/ grid
│   └── posts.json                # Data for /blog/ grid
├── work/
│   ├── index.html                # Work index (loads case-studies.json via work/index.js)
│   ├── index.js                  # Renders project cards + filter chips
│   └── [slug]/
│       └── index.html            # Case study pages (e.g. core-home, blurred-lines, built-by-me-ez)
├── services/
│   ├── index.html
│   ├── webflow/index.html
│   ├── shopify-webflow/index.html
│   └── automation/index.html
├── about/index.html
├── contact/
│   ├── index.html
│   └── index.js                  # Form submit → Formspree
├── start/
│   ├── index.html
│   └── index.js                  # Form submit → Formspree
├── blog/
│   ├── index.html
│   ├── index.js                  # Fetches posts.json, renders cards
│   └── [slug]/index.html         # Blog post pages
├── privacy/index.html
├── terms/index.html
├── styleguide/index.html         # Design system QA (noindex)
├── llms.txt
├── robots.txt
├── sitemap.xml
└── docs/
    ├── styling-map.md            # CSS/JS loaded by index; key Webflow classes
    └── BUILDOUT-SUMMARY.md       # This file
```

---

## How to add a new case study

1. **Add an entry to `/content/case-studies.json`**  
   Example:
   ```json
   {
     "title": "Project Name",
     "slug": "project-name",
     "excerpt": "Short description.",
     "image": "/images/your-image.jpg",
     "tags": ["Webflow"],
     "url": "/work/project-name/"
   }
   ```
   Use `tags` like `"Webflow"`, `"Shopify"`, `"Automation"` so the filter chips on `/work/` work.

2. **Create the case study page**  
   Add `/work/project-name/index.html` using the same structure as existing case studies (hero, problem, approach, build, results, testimonial, CTA, related projects). Copy from `/work/core-home/index.html` and edit.

3. **Update the sitemap**  
   Add a line to `/sitemap.xml`:
   ```xml
   <url><loc>https://elombekisala.com/work/project-name/</loc></url>
   ```

---

## How to add a new blog post

1. **Add an entry to `/content/posts.json`**  
   Example:
   ```json
   {
     "title": "Post Title",
     "slug": "post-slug",
     "date": "2025-03-01",
     "summary": "Short summary for the card.",
     "category": "Webflow",
     "url": "/blog/post-slug/"
   }
   ```

2. **Create the post page**  
   Add `/blog/post-slug/index.html`. Copy from an existing post (e.g. `/blog/webflow-cost/index.html`), update title, description, canonical, OG tags, and the article body. Add JSON-LD `Article` (and optional `FAQPage` if you have FAQ content).

3. **Update the sitemap**  
   Add to `/sitemap.xml`:
   ```xml
   <url><loc>https://elombekisala.com/blog/post-slug/</loc></url>
   ```

---

## Design tokens

- **Location:** `/src/system/tokens.css`
- **Naming:** All variables use the `--ek-*` prefix (e.g. `--ek-color-accent`, `--ek-section-padding`, `--ek-font-family`).
- **Usage:** New pages load, in order: Webflow CSS → `tokens.css` → `util.css` → `components.css`. Only **new** pages use the system layer; **index.html does not** load system CSS.
- **To change the look of new pages:** Edit the variable values in `tokens.css`. Responsive overrides use the same breakpoints as the site (e.g. 991px, 767px, 479px).

---

## Partial injection

- **How it works:** Any element with `data-include="header"`, `data-include="footer"`, or `data-include="cta"` is replaced with the contents of the corresponding file in `/src/partials/`. The script `/src/scripts/injectPartials.js` runs on `DOMContentLoaded` and fetches partials with **absolute paths** (`/src/partials/header.html`, etc.) so it works from any nested route.
- **Adding a new partial:**  
  1. Add the HTML file under `/src/partials/` (e.g. `newsletter.html`).  
  2. In `injectPartials.js`, add an entry to the `PARTIALS` object, e.g. `newsletter: '/src/partials/newsletter.html'`.  
  3. In `run()`, call `inject('newsletter')`.  
  4. On any page, add `<div data-include="newsletter"></div>` where the block should appear.  
  5. Load the script on that page: `<script src="/src/scripts/injectPartials.js"></script>` (already on all new pages).
- **Errors:** If a fetch fails, the script logs a `console.warn` and does not change the page; the placeholder div remains.

---

## Forms (Contact & Start)

- **Implementation:** Contact and Start forms submit via **Formspree**. The scripts `/contact/index.js` and `/start/index.js` prevent default submit, send the form data to Formspree with `fetch`, and show success or error messages on the same page.
- **Setup:**  
  1. Create two forms at [formspree.io](https://formspree.io) (one for Contact, one for Start).  
  2. Replace the placeholder endpoints in the scripts:  
     - In `/contact/index.js`, set `endpoint` to your Contact form URL (e.g. `https://formspree.io/f/yourcontactid`).  
     - In `/start/index.js`, set `endpoint` to your Start/intake form URL (e.g. `https://formspree.io/f/yourstartid`).  
  3. Form field names (name, email, message for contact; name, email, company, website, need, budget, timeline, notes for start) are sent as-is; you can map them in Formspree or in your notification email.
- **Static deploy:** No server or build step is required. Forms work when the site is deployed as static files (e.g. Cloudflare Pages).

---

## Deployment (Cloudflare Pages)

- **Build settings:** No build command; output directory = project root (or where the static files live). All of `/src/`, `/content/`, and the new HTML/JS are served as static assets.
- **URLs:** Directory-style URLs are used (e.g. `/work/core-home/` serves `/work/core-home/index.html`). Internal links use root-relative paths (e.g. `/work/`, `/blog/`).

---

## QA checklist

- **Internal links:** All nav links (header/footer) point to `/work/`, `/services/`, `/about/`, `/blog/`, `/contact/`, `/start/`. Case study and blog post pages link back to index and related items.
- **Mobile:** All new pages use the same viewport meta and responsive tokens; verify on small viewports.
- **Homepage:** `index.html` is unchanged; it does **not** load `/src/system/*.css` or the partial-injection script.
