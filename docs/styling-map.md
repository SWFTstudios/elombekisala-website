# Styling map — index.html and Webflow export

## CSS files loaded by index.html

| File | Role |
|------|------|
| `css/normalize.css` | Resets / normalizes default browser styles. |
| `css/components.css` | Webflow layout and UI primitives: `w-*` classes (w-container, w-layout-grid, w-button, w-nav, w-form, w-input, webflow-icons, etc.). Generic body/font (Arial) and form/button base styles. |
| `css/elombekisala.css` | **Site-specific design**: Satoshi font, `:root` variables, typography (h1–h6, p, a), section/container/button/card/navbar styles. This file controls the look and feel of the homepage. |

There is **no** separate `webflow.css` or `webflow.js` in the export; Webflow patterns live in `components.css` and site design in `elombekisala.css`.

## JS files loaded by index.html

| File | Role |
|------|------|
| `webfont.js` (CDN) | Loads Google Fonts (Oswald, Inter, Plus Jakarta Sans, Poppins). |
| Inline | WebFlow class toggles (`w-mod-js`, `w-mod-touch`). |
| `jquery-3.5.1.min` (CDN) | jQuery for nav, lightbox, forms, etc. |
| `js/elombekisala.js` | Site-specific behavior (nav, forms, interactions). |
| GSAP + CustomEase (CDN) | Animations (preloader, marquee). |
| `js/webmcp.js` | WebMCP widget and MCP registration. |

## Key reusable Webflow / site classes (layout and components)

- **Layout**: `.container` (max-width 1440px, padding 120px L/R), `.page-section` (padding 260px top/bottom), `.w-layout-grid`, `.w-row`, `.w-col-*`, `.w-container`.
- **Section spacing**: `.page-section`; variants `.no-padding`, `.hero-section`, `.footer`, etc.
- **Buttons**: `.button` (primary: green, pill, 14px 28px), `.button.secondary` (outline), `.button.bigger-padding`, `.nav-button`; Webflow `.w-button`.
- **Cards / blocks**: `.card`, `.testimonial-item`, `.process-item`, `.portfolio-list`; project tags `.project-tag`.
- **Nav**: `.navbar`, `.navbar-container`, `.brand`, `.nav-menu`, `.navigation-link`, `.nav-button`, `.menu-button`, `.w-nav`, `.w-nav-link`.
- **Footer**: `.footer`, `.utility-footer`, footer text and link classes.
- **Forms**: `.w-form`, `.w-input`, `.form-text-field`, `.form-text-area`, `.w-form-done` / `.w-form-fail`.

## URL and hosting

- **Cloudflare Pages**: Directory-style URLs are supported; e.g. `/about/` serves `/about/index.html` when the repo is deployed with the project root as the build output (no build command).
