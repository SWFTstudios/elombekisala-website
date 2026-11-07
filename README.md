# elombekisala.com

Portfolio and résumé site for Elombe Kisala. Plain static HTML, generated from data and committed, so any static host (Cloudflare Pages, root as output, no build command) can serve it.

## Edit content

| What | Where |
| --- | --- |
| Case studies (all of `/work/`) | `src/build/data/projects.mjs` |
| Build-log commit highlights | `src/build/data/commits.json` |
| Toolkit, experience, testimonials, process, contact links | `src/build/data/site.mjs` |
| Service detail pages, blog posts, privacy, terms | `src/content/pages/*.html` (blog list: `content/posts.json`) |
| Styles | `assets/css/site.css` |
| Interactions and motion | `assets/js/site.js` |
| Project images | `assets/work/<slug>/` (`cover.webp`, `cover-sm.webp`, gallery shots) |

Then run:

```sh
npm run build   # regenerates every page, sitemap.xml and llms.txt
npm run dev     # build + serve at http://localhost:8080
```

### Add a case study

1. Add images to `assets/work/<slug>/`: `cover.webp` (about 2000px wide), `cover-sm.webp` (960px) and any gallery shots.
2. Add an entry to `projects` in `src/build/data/projects.mjs` (the field list is at the top of the file). Give it `featured: n` to show it in the homepage stack.
3. Optional: add highlights for the build log to `commits.json` under the same slug.
4. `npm run build` and commit the generated HTML.

## How it's built

- **Type:** Satoshi (sans), Instrument Serif italic (accent words), JetBrains Mono (labels), all self-hosted in `fonts/`.
- **Motion:** GSAP 3.13 with ScrollTrigger and SplitText, plus Lenis smooth scroll, self-hosted in `assets/vendor/` (GSAP standard license). Line-by-line text reveals, a first-visit preloader, page-transition curtain, stacked project cards, a cursor-following project preview, magnetic buttons and a velocity-reactive marquee.
- **Accessibility:** everything is visible without JavaScript. Motion is skipped for `prefers-reduced-motion`, focus states are visible, and there's a skip link.
- **Contact form:** posts to FormSubmit (`formsubmit.co`) for elombekisala@gmail.com. The first submission sends an activation email to that inbox, which must be confirmed once.
- **Résumé:** `/about/` has a print stylesheet, and its "Save résumé as PDF" button opens the print dialog.

Legacy Webflow pages (`admin/`, `styleguide/`, `401.html`, `core-home-contact.html`) still use the old `css/` and `js/` files and were left as they were.
