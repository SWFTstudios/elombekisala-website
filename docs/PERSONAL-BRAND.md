# Personal brand site notes

## Architecture
Static HTML/CSS/JS on Cloudflare Pages. Homepage retains Webflow visual system; new pages use `/src/system/*` + partials.

## Primary funnels
- Audience: site → project/journal → `/join/` (FormSubmit) → thank-you
- Services: project/about → SWFT Studios with UTM params

## Key routes
- `/` homepage
- `/projects/` project index + detail pages
- `/journal/` (replaces `/blog/`)
- `/join/` + `/join/thank-you/`
- `/about/`, `/contact/`, `/uses/`
- `/services/` and `/start/` are SWFT gateways

## Forms
FormSubmit → `elombekisala@gmail.com`. Join form uses `_next` thank-you redirect, honeypot `_honey`, consent checkbox.

## Analytics
`/src/scripts/analytics.js` — `window.ekTrack(event, params)`. Optional: set `window.EK_GA_MEASUREMENT_ID` / load gtag separately. Never send PII.

## Redirects
See `/_redirects` for `/work` → `/projects` and `/blog` → `/journal`.
