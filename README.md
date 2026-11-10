# elombekisala.com

Portfolio and résumé site for Elombe Kisala. Plain static HTML, generated from data and committed, so any static host (Cloudflare Pages, root as output, no build command) can serve it.

## Edit content

| What | Where |
| --- | --- |
| Case studies (all of `/work/`) | `src/build/data/projects.mjs` |
| Build-log commit highlights | `src/build/data/commits.json` |
| Toolkit, experience, testimonials, process, contact links | `src/build/data/site.mjs` |
| Services (12 services in 4 groups, incl. Payload CMS) | `src/build/data/services.mjs` |
| Line-art illustrations and animated work previews (SVG) | `src/build/data/art.mjs` |
| Service detail pages, blog posts, privacy, terms | `src/content/pages/*.html` (blog list: `content/posts.json`) |
| Styles | `assets/css/site.css` |
| Interactions and motion | `assets/js/site.js` |
| Project garden (`/garden/`): how a project becomes a bonsai | `assets/js/bonsai-traits.mjs` (rules), `assets/js/bonsai.js` (trees, sand, surroundings), `assets/js/garden.js` (page) |
| Git branches the bonsai limbs are grown from | `src/build/data/branches.json` (refresh with `npm run branches`) |
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

- **Themes:** light and dark, following the system setting until the visitor uses the header toggle (saved in localStorage, circular reveal via the View Transitions API).
- **Type:** Satoshi at a light display weight with bold-italic emphasis, and JetBrains Mono for `// labels`, self-hosted in `fonts/`.
- **Selected work:** a code-editor section with one tab ("file") per project. On desktop it pins and scrolling opens the next file; on phones the tabs are tappable.
- **Line art:** each service has an SVG drawing that draws itself in on scroll (`[data-draw]`).
- **Motion:** GSAP 3.13 with ScrollTrigger and SplitText, plus Lenis smooth scroll, self-hosted in `assets/vendor/` (GSAP standard license). Line-by-line text reveals, a first-visit preloader, page-transition curtain, stacked project cards, a cursor-following project preview, magnetic buttons and a velocity-reactive marquee.
- **Theme:** a Japanese zen garden. Light is raked sand, sumi ink and moss; dark is a moonlit garden. Page heads carry raked-sand ripples around a stone.
- **Garden:** `/garden/` is a 3D karesansui built with three.js: raked sand that ripples around moss islands and stones, a deck, a slatted fence, bamboo, and stone lanterns that light up in dark mode. Every project is a bonsai. Its trunk is the default branch and every limb is a real git branch, attached where it forked: merged branches carry mature foliage, open ones fresh growth, and branches quiet for 45+ days become deadwood (jin). Click a tree to walk up to it and hover a limb to read its branch. Projects without a public repo grow one limb per tool. three.js r180 is self-hosted in `assets/vendor/three/` (MIT).
- **Refreshing branches:** `npm run branches` makes a blob-less bare clone of each repo in `.cache/repos` (commit graph only) and rewrites `src/build/data/branches.json`. Then `npm run build` and commit both.
- **Accessibility:** everything is visible without JavaScript. Motion is skipped for `prefers-reduced-motion`, focus states are visible, and there's a skip link.
- **Contact form:** posts to FormSubmit (`formsubmit.co`) for elombekisala@gmail.com. The first submission sends an activation email to that inbox, which must be confirmed once.
- **Résumé:** `/about/` has a print stylesheet, and its "Save résumé as PDF" button opens the print dialog.

Legacy Webflow pages (`admin/`, `styleguide/`, `401.html`, `core-home-contact.html`) still use the old `css/` and `js/` files and were left as they were.
