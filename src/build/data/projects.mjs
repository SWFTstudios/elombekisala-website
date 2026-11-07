// Case study data. Every page under /work/ is generated from this file by
// src/build/build.mjs. Facts come from each project's repository: README,
// code and commit history. Keep it that way: no invented numbers.
//
// Fields
//   slug, title, client, year, kind (short label), tags (filter chips)
//   summary   one line for cards and meta descriptions
//   intro     the case study's opening paragraph
//   role, timeline, platform, live { url, label }
//   accent    hex used as the case study's highlight color
//   cover     image path; gallery [{ src, alt, frame: 'desktop'|'phone'|'plain' }]
//   metrics   [{ value, label }]
//   challenge paragraphs[]; approach paragraphs[]
//   built     [{ title, text }]  (what was created)
//   flow      [{ label, note }]  (how the pieces connect)
//   improved  [{ before, after }]
//   stack     [{ name, why }]
//   log       { commits, span, repo, entries: [{ date, text }] }  (real commit messages)
//   quote     { text, name, role }  (only real testimonials)

export const projects = [
  {
    slug: 'built-by-me-ez',
    result: 'Sales by text message → 6 packages sold and booked online',
    file: 'workers/package-booking/index.js',
    title: 'Built By Me EZ',
    client: 'Omar Ndiaye, personal trainer',
    year: '2025–26',
    kind: 'Web platform',
    tags: ['Web app', 'Automation', 'E-commerce'],
    featured: 1,
    accent: '#e5372d',
    summary: 'A trainer’s brochure site turned into a revenue and operations platform: packages, booking, merch and a CRM, with no traditional server.',
    intro: 'Omar runs a personal training business in Teaneck, NJ. His website looked good but did nothing on its own: every sale, booking and follow-up was a text message. I rebuilt it into a platform that sells training packages, lets clients book their own sessions, sells merch and keeps every customer in a CRM.',
    role: 'Design, front end, back end, integrations',
    timeline: 'Nov 2025 – Oct 2026',
    platform: 'Webflow export on Cloudflare Pages, one Cloudflare Worker',
    live: { url: 'https://builtbymeez.com', label: 'builtbymeez.com' },
    cover: '/assets/work/built-by-me-ez/cover.webp',
    gallery: [
      { src: '/assets/work/built-by-me-ez/desk2.webp', alt: 'Built By Me EZ classes and reviews section', frame: 'desktop' },
      { src: '/assets/work/built-by-me-ez/mob.webp', alt: 'Built By Me EZ homepage on a phone', frame: 'phone' },
      { src: '/assets/work/built-by-me-ez/desk3.webp', alt: 'Training package tabs on Built By Me EZ', frame: 'desktop' }
    ],
    metrics: [
      { value: '6', label: 'training packages sold online, $400–$950' },
      { value: '15', label: 'Stripe Payment Links for merch variants' },
      { value: '5', label: 'Airtable CRM tables kept in sync' },
      { value: '0', label: 'servers to maintain' }
    ],
    challenge: [
      'The site was a Webflow marketing page. Packages were described but could not be bought. Booking happened by text. Leads who were not ready to pay were lost, and there was no single record of who had paid for what.',
      'Omar needed the site to take money, hand out sessions and remember every customer, without a monthly bill for a booking platform or a server someone has to look after.'
    ],
    approach: [
      'Keep the Webflow design he already liked and move it to Cloudflare Pages as a static export. Put every piece of server logic in one Cloudflare Worker: Stripe and Cal.com webhooks, session credits in KV, CRM writes to Airtable and email notifications.',
      'Use a pay-first model. A client pays through Stripe, receives a private booking link, and books sessions on Cal.com until their credits run out. Clients who are not ready can save their ideal training dates instead, which lands them in the CRM as a lead.'
    ],
    built: [
      { title: 'Six package pages with checkout', text: '1:1 and semi-private packages of 8, 12 and 16 sessions, each with its own Stripe Payment Link and Cal.com event.' },
      { title: 'Token-gated booking portal', text: 'After payment the Worker issues a token and stores the session count in KV. The portal embeds Cal.com and every booking webhook decrements the balance.' },
      { title: 'Two-tier lead funnel', text: '“Pay now” or “Save my ideal dates”. Both paths upsert the same Clients record so nothing falls through.' },
      { title: 'Merch storefront', text: 'One product page for the logo tee: 3 colorways × 5 sizes at $35, Stripe checkout with shipping to 28 countries and webhook fulfillment.' },
      { title: 'Airtable CRM', text: 'Leads, Clients, Package Purchases, Session Bookings and Merch Orders, written automatically by the Worker.' },
      { title: 'A 10-chapter project book', text: 'Architecture, operations runbook and roadmap written for both developers and the owner.' }
    ],
    flow: [
      { label: 'Package page', note: 'Webflow + custom JS' },
      { label: 'Stripe', note: 'Payment Link checkout' },
      { label: 'Worker', note: 'Webhook → credits in KV' },
      { label: 'Cal.com', note: 'Client books a session' },
      { label: 'Airtable', note: 'CRM row + email to Omar' }
    ],
    improved: [
      { before: 'Packages described, paid for by text or cash', after: 'Packages bought online in one step' },
      { before: 'Every session scheduled by hand', after: 'Clients book themselves until their credits run out' },
      { before: 'Unready leads forgotten', after: 'Ideal dates saved as CRM leads for follow-up' },
      { before: 'No merch sales', after: 'A storefront with automated order emails' }
    ],
    stack: [
      { name: 'Webflow', why: 'The owner keeps a design he can recognise and request changes to.' },
      { name: 'Cloudflare Pages + Workers + KV', why: 'Static speed with real server logic, near-zero hosting cost.' },
      { name: 'Stripe Payment Links', why: 'Secure checkout without building a cart.' },
      { name: 'Cal.com', why: 'Scheduling that clients already understand, embedded on-brand.' },
      { name: 'Airtable', why: 'A CRM the owner can open and edit like a spreadsheet.' },
      { name: 'Google Stitch', why: 'Fast visual exploration for the merch page, rebuilt as hand-written CSS.' }
    ],
    log: {
      commits: 32, span: 'Nov 2025 – Oct 2026', repo: 'SWFTstudios/built_by_me_ez',
      entries: []
    },
    quote: {
      text: 'I now have a sleek and modern platform to show my Instagram and TikTok videos to potential clients. And with the added ability to sell courses online, I feel like I’ve taken my personal training business to the next level!',
      name: 'Omar Ndiaye', role: 'Fitness coach, owner of Built By Me EZ'
    }
  },

  {
    slug: 'snooze-lane',
    result: 'Wake-ups that still fire underground, across 3 transit agencies',
    file: 'Managers/LocationManager.swift',
    title: 'Snooze Lane',
    client: 'Own product',
    year: '2025–26',
    kind: 'iOS app',
    tags: ['iOS app', 'Web app'],
    featured: 2,
    accent: '#ff7a1a',
    summary: 'A native iOS alarm that wakes commuters before their stop, using geofencing, live NYC/NJ transit data and a phone-call backup.',
    intro: 'Snooze Lane lets you fall asleep on the train or bus and still wake up on time. You pick a destination, and the app wakes you when you get close, by distance, not by guessing a time. I designed and built the whole product: the SwiftUI app, the Firebase backend and a Cloudflare Worker that serves live transit data.',
    role: 'Product, design, iOS and backend development',
    timeline: 'Oct 2025 – present',
    platform: 'SwiftUI, Firebase, Cloudflare Workers, RevenueCat, Twilio',
    live: { url: 'https://snoozelane.webflow.io', label: 'snoozelane.webflow.io' },
    cover: '/assets/work/snooze-lane/cover.webp',
    video: { src: '/assets/work/snooze-lane/motion.mp4', poster: '/assets/work/snooze-lane/poster.webp' },
    gallery: [
      { src: '/assets/work/snooze-lane/desk2.webp', alt: 'Snooze Lane marketing site', frame: 'desktop' }
    ],
    metrics: [
      { value: '115', label: 'Swift files, ~28,600 lines' },
      { value: '3', label: 'transit agencies in one feed: MTA, NJ Transit, PATH' },
      { value: '88', label: 'commits from prototype to App Store hardening' },
      { value: '4.0 mi', label: 'adjustable live transit search radius' }
    ],
    challenge: [
      'Time-based alarms fail commuters. Delays, express trains and traffic make “wake me in 40 minutes” useless. A location alarm has its own problems: iOS limits background location, trains go underground, and an alarm that never fires is worse than none.',
      'It also had to pass App Store review with subscriptions, ads consent, account deletion and a privacy manifest.'
    ],
    approach: [
      'Build the alarm around geofences and location triggers that iOS honors in the background, then layer backups on top: on-device alarms, a timed fallback, and a Twilio wake-up call that retries offline.',
      'Keep transit APIs off the phone. A Cloudflare Worker normalizes MTA subway and bus, NJ Transit rail and bus, and PATH feeds into one JSON contract, checks the user’s Pro entitlement and caches realtime data briefly.'
    ],
    built: [
      { title: 'Trip-based wake-up alarms', text: 'Pick a destination and alarm range; a progress ring shows how close you are. Geofences fire even with the app closed.' },
      { title: 'Underground-proof backups', text: 'On-device alarms, a timed backup and a phone call that starts speaking when you answer.' },
      { title: 'Live Transit Nearby', text: 'Stops by route or by station within 0.10–4.00 miles, official line colors and minutes until departure.' },
      { title: 'Rest-time estimates', text: 'Apple MapKit routing ETAs with a crow-flies fallback, plus a sleep dashboard built around the commute.' },
      { title: 'Subscriptions and wallet', text: 'RevenueCat in-app purchases, Basic and Premium tiers, promo codes with an admin view.' },
      { title: 'Store readiness', text: 'In-app account deletion, UMP + ATT consent, privacy manifest, CI for iOS tests, worker typecheck and functions lint.' }
    ],
    flow: [
      { label: 'SwiftUI app', note: 'Geofence + trip state' },
      { label: 'Firebase', note: 'Auth, Firestore, Functions' },
      { label: 'Worker', note: 'Pro check + transit API' },
      { label: 'GTFS-RT feeds', note: 'MTA · NJT · PATH' },
      { label: 'Twilio', note: 'Wake-up call backup' }
    ],
    improved: [
      { before: 'Alarms set by guessing a time', after: 'Alarms triggered by distance to the stop' },
      { before: 'Location lost underground', after: 'On-device and timed backups, offline call retry' },
      { before: 'Three agencies, three formats', after: 'One normalized Worker API the app trusts' },
      { before: 'Rejected for an unused background mode', after: 'Permissions trimmed to exactly what the app uses' }
    ],
    stack: [
      { name: 'Swift 6 / SwiftUI / MapKit', why: 'Native background location and the smoothest map experience on iPhone.' },
      { name: 'Firebase', why: 'Phone auth, cloud-synced trips and preferences, server functions.' },
      { name: 'Cloudflare Workers', why: 'One fast, cached API in front of messy transit feeds.' },
      { name: 'RevenueCat', why: 'Subscriptions and entitlements without hand-rolled receipt checks.' },
      { name: 'Twilio', why: 'A real phone call when a push notification is not enough.' },
      { name: 'GitHub Actions', why: 'Tests and lint on every pull request.' }
    ],
    log: { commits: 88, span: 'Oct 2025 – Oct 2026', repo: 'elombekisala/Snooze-Lane', entries: [] }
  },

  {
    slug: 'only-at-the-kiosk',
    result: 'Magazine, radio, shop and member accounts, shipped in 14 days',
    file: 'js/kiosk-dotearth.js',
    title: 'Only at the Kiosk',
    client: 'Only at the Kiosk',
    year: '2026',
    kind: 'Editorial commerce',
    tags: ['E-commerce', 'Web app', 'Brand site'],
    featured: 3,
    accent: '#7aa7ff',
    summary: 'A magazine, radio station, film archive and shop in one: a dark lifestyle club with a live 3D globe, member accounts and Stripe checkout.',
    intro: 'KIOSK sells exclusive apparel drops wrapped in culture: films, photo stories, phonk radio and car spec sheets. The brief was to make the shop feel like a world you visit, not a catalog. I built it as an issue-based magazine on a custom design system called KIOSK Glass, with its own accounts, checkout and back office.',
    role: 'Art direction, design system, full-stack build',
    timeline: 'Oct 2026 (113 commits in two weeks)',
    platform: 'Static front end + Cloudflare Worker, D1, Email Service, Stripe',
    live: { url: 'https://onlyatthekiosk.com', label: 'onlyatthekiosk.com' },
    cover: '/assets/work/only-at-the-kiosk/cover.webp',
    gallery: [
      { src: '/assets/work/only-at-the-kiosk/desk2.webp', alt: 'KIOSK dotted globe hero', frame: 'desktop' },
      { src: '/assets/work/only-at-the-kiosk/mob.webp', alt: 'KIOSK on a phone with the glass tab bar', frame: 'phone' },
      { src: '/assets/work/only-at-the-kiosk/desk3.webp', alt: 'KIOSK globe dives to black', frame: 'desktop' }
    ],
    metrics: [
      { value: '113', label: 'commits in 14 days' },
      { value: '5', label: 'sections: Issue, Atlas, Story, Radio, Vault' },
      { value: '7', label: 'automated test suites (accounts, commerce, Spotify…)' },
      { value: 'D1', label: 'orders, stock and members in one database' }
    ],
    challenge: [
      'Drops sell on hype, and hype needs a reason to come back between drops. The brand had product and content but no place that tied them together, and the planned Shopify store was not ready.',
      'It had to work beautifully on phones, where most of the audience is, without the 3D and video turning it into a slow page.'
    ],
    approach: [
      'Treat the site like a magazine issue. A dotted 3D globe pins visitors on their real town with live traveler beacons, then dives to black and opens a featured stream of films, stories and products.',
      'Sell through Stripe Checkout until Shopify launches, with a cart, orders and stock in D1, order emails and a USPS back office, so the brand could sell from day one.'
    ],
    built: [
      { title: 'KIOSK Glass design system', text: 'Frosted header groups, a Liquid Glass tab bar with real backdrop blur, editorial serif layer, page curtains and Lenis smooth scrolling.' },
      { title: 'Live globe hero', text: 'A zoomable wireframe globe with real coastlines, the visitor’s beacon and glowing pins for live travelers.' },
      { title: 'KIOSK Radio', text: 'Phonk playlists from Spotify in a site-wide player with a live waveform and a 3D song wheel.' },
      { title: 'The Vault shop', text: '3D hero carousel, clothing-rack rail with on-hanger cutouts, drop alerts by size and colour.' },
      { title: 'Member accounts', text: 'Email sign-in codes via Cloudflare Email Service, member cards and saved sizes.' },
      { title: 'Checkout and back office', text: 'Stripe Checkout, orders and inventory in D1, Airtable copy, admin page with USPS shipping.' }
    ],
    flow: [
      { label: 'Story & shop pages', note: 'KIOSK Glass front end' },
      { label: 'Worker API', note: 'Accounts, cart, alerts' },
      { label: 'Stripe Checkout', note: 'Payment' },
      { label: 'D1', note: 'Orders, stock, members' },
      { label: 'Back office', note: 'Emails, Airtable, USPS' }
    ],
    improved: [
      { before: 'Products and content in separate places', after: 'One issue where films, stories and drops sell each other' },
      { before: 'No store until Shopify was ready', after: 'Selling from day one with Stripe and a D1 back office' },
      { before: 'Heavy 3D on phones', after: 'Lighter globe, deferred scripts, hashed asset URLs' },
      { before: 'Generic email capture', after: 'Drop alerts by size and colour, member accounts' }
    ],
    stack: [
      { name: 'Cloudflare Workers + D1', why: 'Accounts, orders and stock without a separate backend host.' },
      { name: 'Stripe Checkout', why: 'Start selling immediately, swap to Shopify later.' },
      { name: 'Lenis + custom 3D', why: 'Smooth, cinematic scrolling that still respects reduced motion.' },
      { name: 'Spotify embeds', why: 'Radio that keeps playing as you browse.' },
      { name: 'Playwright', why: 'Mobile screenshot and controls audits before each release.' },
      { name: 'sharp', why: 'Generated, optimized product imagery from one pipeline.' }
    ],
    log: { commits: 113, span: 'Oct 15 – Oct 28, 2026', repo: 'SWFTstudios/onlyatthekiosk-website', entries: [] }
  },

  {
    slug: 'learn-lingala',
    result: 'Zero to conversational: 227 phrases, offline, with AI speakers',
    file: 'src/chat.js',
    title: 'Learn Lingala',
    client: 'Own product',
    year: '2026',
    kind: 'Learning app',
    tags: ['Web app', 'AI'],
    featured: 4,
    accent: '#c8ff3d',
    summary: 'A free, offline-ready app that takes learners from zero to conversational Lingala, with spaced repetition and live chat with Claude-powered speakers.',
    intro: 'Lingala is spoken by tens of millions of people across the Congo basin, yet good learning tools barely exist. I built Learn Lingala as an installable web app: a five-level course, science-backed review, and AI chat partners that text back in real Lingala, in English or French.',
    role: 'Product, curriculum structure, design, full-stack build',
    timeline: 'Jul – Oct 2026',
    platform: 'Cloudflare Workers, D1, Claude API, PWA',
    live: { url: 'https://learn-lingala.elombe.workers.dev', label: 'learn-lingala.elombe.workers.dev' },
    cover: '/assets/work/learn-lingala/cover.webp',
    gallery: [
      { src: '/assets/work/learn-lingala/mob.webp', alt: 'Learn Lingala landing page on a phone', frame: 'phone' },
      { src: '/assets/work/learn-lingala/desk2.webp', alt: 'Who Learn Lingala is for', frame: 'desktop' },
      { src: '/assets/work/learn-lingala/desk3.webp', alt: 'Live sentence builder', frame: 'desktop' }
    ],
    metrics: [
      { value: '227', label: 'phrases across 18 units' },
      { value: '5', label: 'levels mapped to CEFR A0 → B1' },
      { value: '11', label: 'real-life dialogues' },
      { value: '2', label: 'interface languages: English, French' }
    ],
    challenge: [
      'Most Lingala resources are word lists. Learners heading to Kinshasa need to hold real conversations, sound local and keep practicing on a phone with patchy data.',
      'AI could fill the conversation gap, but AI translation alone is not trustworthy for a language with little training data.'
    ],
    approach: [
      'Write the course first and make it the source of truth: verified phrases, a hand-written lexicon that breaks every word into its parts, and a test that fails if a course phrase uses an unknown word.',
      'Use Claude where it shines, live chat practice and memory hooks, rate-limited per user and clearly marked as AI. Everything else works offline.'
    ],
    built: [
      { title: 'Five-level path', text: 'Arrive, Get around, Daily life, Conversations, Mwana mboka. Checkpoints let learners test out of what they know.' },
      { title: 'Study cards that teach', text: 'Commit-before-you-flip, sure-but-wrong boosts, calibration and “don’t confuse with” look-alikes, each tied to learning research.' },
      { title: 'Live chat practice', text: 'Text in real time with Claude-powered Lingala speakers who correct you in your language.' },
      { title: 'Translate & dictionary', text: 'Instant verified course matches offline, plus an AI breakdown with word-by-word glosses.' },
      { title: 'Offline PWA', text: 'A service worker caches the whole course; progress syncs when the connection returns.' },
      { title: 'Accounts and reminders', text: 'Email auth, streaks, word of the day, and email or text reminders on a 15-minute cron.' }
    ],
    flow: [
      { label: 'PWA', note: 'Course cached offline' },
      { label: 'Worker API', note: 'Auth + rate limits' },
      { label: 'D1', note: 'Progress and streaks' },
      { label: 'Claude API', note: 'Chat + memory hooks' },
      { label: 'Cron', note: 'Email and SMS reminders' }
    ],
    improved: [
      { before: 'Word lists with no context', after: 'Dialogues, drills and phrases marked “Sounds local”' },
      { before: 'Unverified machine translation', after: 'Verified course matches first, AI as a labelled extra' },
      { before: 'Lessons that need data', after: 'Lessons, reviews and checkpoints that work offline' }
    ],
    stack: [
      { name: 'Cloudflare Workers + D1', why: 'Global, cheap, and fast enough to feel native.' },
      { name: 'Claude API', why: 'Natural conversation partners and mnemonic hooks.' },
      { name: 'Service worker', why: 'Installable and offline, which matters on iOS especially.' },
      { name: 'Rate limiting + Turnstile', why: 'Keeps AI costs predictable and bots out.' },
      { name: 'Node test runner', why: 'Guards the lexicon and course data on every change.' }
    ],
    log: { commits: 24, span: 'Jul – Oct 2026', repo: 'SWFTstudios/learn-lingala', entries: [] }
  },

  {
    slug: 'finish-library',
    result: 'Excel and slide specs → one 3D source of truth for 108 finishes',
    file: 'js/configurator-preview-3d.js',
    title: 'Core Home Finish Library',
    client: 'Core Home',
    year: '2026',
    kind: 'Internal tool',
    tags: ['Web app', 'Core Home', '3D'],
    featured: 5,
    accent: '#4f8cff',
    summary: 'A 3D configurator that replaced Excel and PowerPoint render specs for Core Home’s product development and design teams.',
    intro: 'Core Home designs kitchen and home products for dozens of brands. Render requests used to travel as spreadsheets and slide decks, and every team pictured a different finish. I built a shared web app where anyone can pick a material, scroll through finishes, choose a graphic treatment and see it live in 3D.',
    role: 'Product design, front end, 3D, data import, CI/CD',
    timeline: 'May 21 – Jun 3, 2026 (Phase 1)',
    platform: 'Cloudflare Pages + Workers, D1, Three.js, GitHub Actions',
    cover: '/assets/work/finish-library/cover.webp',
    gallery: [
      { src: '/assets/work/finish-library/desk2.webp', alt: 'Render Portal dashboard', frame: 'desktop' },
      { src: '/assets/work/finish-library/mob.webp', alt: 'Finish Library on a phone', frame: 'phone' }
    ],
    metrics: [
      { value: '108', label: 'finishes imported from the factory catalog' },
      { value: '4', label: 'materials: ceramic, glass, steel, plastic' },
      { value: '13', label: 'chapter project book for non-technical readers' },
      { value: '2 wks', label: 'from scaffold to live Phase 1' }
    ],
    challenge: [
      'Specs lived in Excel and PowerPoint. Product Development and Industrial Design worked from different files, finishes were described in words, and renders came back wrong.',
      'The tool had to be simple enough for anyone at the company and accurate to the factory’s own catalog.'
    ],
    approach: [
      'Import the factory’s v3 spreadsheet straight into the catalog with a script, so the source of truth stays the factory’s data.',
      'Design around one screen: material tabs, a finish wheel with search and filters, a graphic application shelf, a specs card and a real-time 3D preview.'
    ],
    built: [
      { title: 'Material tabs and finish wheel', text: 'Ceramic, Glass, Stainless Steel and Plastic, with search, sort and filters by color, style and process.' },
      { title: 'Live 3D preview', text: 'Three.js with orbit controls and a light/dark theme so finishes read correctly.' },
      { title: 'Graphic application shelf', text: 'Water decal, gloss 3D print, silkscreen, heat transfer, laser etch.' },
      { title: 'Specs card', text: 'Durability, cost and property notes for every finish, plus “Add to folder”.' },
      { title: 'Spreadsheet importer', text: 'Node + xlsx turns the factory workbook into the catalog JSON and D1 seed.' },
      { title: 'Project book', text: '13 chapters, from “why we built this” for the C-suite to deployment for developers.' }
    ],
    flow: [
      { label: 'Factory .xlsx', note: 'Source of truth' },
      { label: 'Import script', note: 'Node + xlsx' },
      { label: 'Catalog JSON / D1', note: '108 finishes' },
      { label: 'Configurator', note: 'Three.js preview' },
      { label: 'Render request', note: 'Phase 2: Worker + R2' }
    ],
    improved: [
      { before: 'Specs scattered across Excel and slides', after: 'One shared visual source of truth' },
      { before: 'Finishes described in words', after: 'Finishes previewed in 3D before a render is ordered' },
      { before: 'Manual catalog updates', after: 'Scripted import from the factory workbook' }
    ],
    stack: [
      { name: 'Three.js', why: 'Real-time 3D in any browser, no plugins.' },
      { name: 'Cloudflare Pages + D1', why: 'Fast internal tool with a real database ready for Phase 2.' },
      { name: 'GitHub Actions', why: 'Push to main deploys automatically.' },
      { name: 'Google Stitch', why: 'Rapid UI exploration before hand-building the HUD.' }
    ],
    log: { commits: 16, span: 'May 21 – Jun 3, 2026', repo: 'SWFTstudios/core-home-finish-library', entries: [] }
  },

  {
    slug: 'fizz',
    result: 'A Webflow prototype → 16 motion modules and a matching Shopify theme',
    file: 'js/fizz-bottle-scroll.js',
    title: 'FIZZ',
    client: 'Core Home',
    year: '2026',
    kind: 'Brand site + Shopify theme',
    tags: ['Brand site', 'Shopify', 'Core Home', 'Motion'],
    featured: 6,
    accent: '#8fd3ff',
    summary: 'A cinematic launch site for a portable sparkling-water bottle: scroll-scrubbed Lottie, 3D z-scroll, Barba page transitions and a matching Shopify theme.',
    intro: 'FIZZ makes a bottle that carbonates water anywhere. No cans, no countertop machine. The site had to make a hardware product feel like a lifestyle. I took the Webflow prototype, rebuilt it as a fast static site with a full motion system, and built a Shopify theme to match.',
    role: 'Motion design, front-end engineering, Shopify theme',
    timeline: 'May – Nov 2026',
    platform: 'Static site on Cloudflare Workers, Shopify (Liquid), GSAP, Lottie, Barba',
    live: { url: 'https://fizz-final.elombe.workers.dev', label: 'fizz-final.elombe.workers.dev' },
    cover: '/assets/work/fizz/cover.webp',
    gallery: [
      { src: '/assets/work/fizz/desk3.webp', alt: 'FIZZ bottle anatomy section', frame: 'desktop' },
      { src: '/assets/work/fizz/mob.webp', alt: 'FIZZ homepage on a phone', frame: 'phone' },
      { src: '/assets/work/fizz/desk2.webp', alt: 'FIZZ “No cans” section', frame: 'desktop' }
    ],
    metrics: [
      { value: '121', label: 'commits' },
      { value: '16', label: 'motion and page modules' },
      { value: '6', label: 'colorway product pages' },
      { value: '500vh', label: 'scroll-scrubbed Lottie track' }
    ],
    challenge: [
      'The Webflow prototype relied on IX2 interactions that were hard to maintain and slow on phones. Page changes cut the motion short, and the product story was buried below a long intro.',
      'The brand also needed a Shopify storefront that felt like the same site.'
    ],
    approach: [
      'Rebuild each Webflow interaction as its own small module: GSAP ScrollTrigger scrubs, Lottie frame math, Barba transitions that wait for the animation to finish, and Splide carousels.',
      'Then retell the homepage as a three-chapter bottle story and lock it down with ESLint, Stylelint, TypeScript checks and a guard against deprecated CSS classes.'
    ],
    built: [
      { title: 'Scroll-scrubbed Lottie', text: 'A 500vh track scrubs the animation frame by frame while the layer stays pinned.' },
      { title: '3D z-scroll Explore page', text: 'A camera that flies through product facts with a loader, HUD and modal details.' },
      { title: 'Barba + Lottie transitions', text: 'Prefetched pages, and a transition that resolves on the Lottie “complete” event.' },
      { title: 'Shop and six PDPs', text: 'A category carousel, a colorway grid and product pages with specs, how-it-works and care.' },
      { title: 'Kinetic Spark Shopify theme', text: 'Editable hero copy, glass card controls and a flavor collection with Webflow-parity scroll.' },
      { title: 'Analytics', text: 'Google Tag Manager on every page.' }
    ],
    flow: [
      { label: 'Webflow prototype', note: 'Design reference' },
      { label: 'Motion modules', note: 'GSAP · Lottie · Barba' },
      { label: 'Static build', note: 'Cloudflare Worker' },
      { label: 'Shopify theme', note: 'Kinetic Spark' }
    ],
    improved: [
      { before: 'Webflow IX2 interactions, hard to change', after: 'Small, linted motion modules' },
      { before: 'Transitions cut off mid-animation', after: 'Transitions that wait for the animation' },
      { before: 'Product story buried', after: 'A three-chapter bottle story on the homepage' }
    ],
    stack: [
      { name: 'GSAP + ScrollTrigger', why: 'Precise scroll-linked motion.' },
      { name: 'Lottie', why: 'Designer-made animation that stays crisp at any size.' },
      { name: 'Barba.js', why: 'App-like page changes on a static site.' },
      { name: 'Shopify (Liquid)', why: 'A checkout the business already trusts.' },
      { name: 'ESLint · Stylelint · TypeScript', why: 'Keeps a large motion codebase maintainable.' }
    ],
    log: { commits: 121, span: 'May – Nov 2026', repo: 'SWFTstudios/fizz_website', entries: [] }
  },

  {
    slug: 'swft-studios',
    result: 'Quotes by email → 25 packages payable online, deposits included',
    title: 'SWFT Studios',
    client: 'My studio',
    year: '2026',
    kind: 'Agency platform',
    tags: ['Web app', 'Automation', 'AI'],
    accent: '#ff5a1f',
    summary: 'The website, client portal, payments and outreach engine for the design and growth studio I founded in Jersey City.',
    intro: 'SWFT Studios gets local businesses in NYC and North Jersey seen, chosen and booked: websites, photo and video, ads and follow-up. The site is also the business’s operating system: services with live pricing, online payments, a client portal and an AI-assisted outreach pipeline.',
    role: 'Founder & creative director, design and build',
    timeline: 'Sep – Nov 2026 (163 commits)',
    platform: 'Cloudflare Workers, D1, Workers AI, Stripe, PostHog',
    live: { url: 'https://www.swftstudios.com', label: 'swftstudios.com' },
    cover: '/assets/work/swft-studios/cover.webp',
    gallery: [
      { src: '/assets/work/swft-studios/desk3.webp', alt: 'SWFT Studios services', frame: 'desktop' },
      { src: '/assets/work/swft-studios/mob.webp', alt: 'SWFT Studios on a phone', frame: 'phone' },
      { src: '/assets/work/swft-studios/desk2.webp', alt: 'SWFT Studios selected work', frame: 'desktop' }
    ],
    metrics: [
      { value: '163', label: 'commits in five weeks' },
      { value: '25', label: 'packages with live Stripe payment links' },
      { value: '3', label: 'ways to pay: in full, 50% deposit, monthly' },
      { value: '8', label: 'automated test suites' }
    ],
    challenge: [
      'A studio selling growth systems has to run on one. Quotes, deposits, project updates and new-client outreach were manual.'
    ],
    approach: [
      'Build services as data and generate pages, pricing and Stripe links from it. Add a role-aware portal for clients and an admin dashboard for us, and automate outreach without losing the human approval step.'
    ],
    built: [
      { title: 'Build / Grow / Automate services', text: 'Service pages and a mega-menu generated from one catalog, with one-time and monthly pricing.' },
      { title: 'Shop and checkout', text: 'Cart, 50% deposit or monthly payments for every package, $0 orders for 100%-off codes.' },
      { title: 'Client portal', text: 'Installable PWA with a role-aware tab bar, project progress and a desktop sidebar workspace.' },
      { title: 'Outreach engine', text: 'Places data pull, dedupe, email discovery, scoring, throttling, unsubscribe and Claude-drafted emails with an approval page.' },
      { title: 'The SWFT Method', text: 'An animated, per-industry walkthrough of how customers find, choose and return to a business.' },
      { title: 'Growth Guide', text: 'A free customer-journey check on the web with a printable PDF.' }
    ],
    flow: [
      { label: 'Services catalog', note: 'Generated pages + prices' },
      { label: 'Stripe', note: 'Deposits and plans' },
      { label: 'Worker + D1', note: 'Portal, admin, leads' },
      { label: 'Outreach', note: 'Score → draft → approve' },
      { label: 'PostHog + GA4', note: 'Measure every step' }
    ],
    improved: [
      { before: 'Quotes and invoices by email', after: 'Every package payable online, including deposits' },
      { before: 'Project updates over text', after: 'A client portal with live progress' },
      { before: 'Cold outreach by hand', after: 'Scored leads and AI drafts, sent only after approval' }
    ],
    stack: [
      { name: 'Cloudflare Workers + D1', why: 'One deploy for the site, portal and APIs.' },
      { name: 'Stripe', why: 'Deposits, plans and discount codes.' },
      { name: 'Workers AI / Claude', why: 'Drafting help that stays behind human approval.' },
      { name: 'PostHog + GA4', why: 'Product analytics and marketing analytics side by side.' },
      { name: 'Airtable', why: 'A CRM the whole team can read.' }
    ],
    log: { commits: 163, span: 'Sep 30 – Nov 5, 2026', repo: 'SWFTstudios/swftstudios', entries: [] }
  },

  {
    slug: 'people-of-spice',
    result: '44 blends from 22 kitchens, explorable from one globe',
    title: 'People of Spice',
    client: 'Core Home',
    year: '2025–26',
    kind: 'Brand site',
    tags: ['Brand site', 'Core Home', 'Motion'],
    accent: '#d6a24c',
    summary: 'A spice brand that sells a world of flavor: a spice-and-salt globe intro, a swipeable spice dial and a recipe CMS for 44 blends from 22 kitchens.',
    intro: 'People of Spice blends spices from kitchens around the world. I launched the first site in 2025 with Airtable-connected forms, then led its 2026 redesign: darker art direction, a first-visit intro where spice and salt form a globe, and a structured spice and recipe CMS.',
    role: 'Art direction, design, development',
    timeline: 'Sep 2025 launch · Oct 2026 redesign',
    platform: 'Cloudflare Pages + Functions, GSAP, Airtable',
    live: { url: 'https://peopleofspice.com', label: 'peopleofspice.com' },
    cover: '/assets/work/people-of-spice/cover.webp',
    gallery: [
      { src: '/assets/work/people-of-spice/desk2.webp', alt: 'Meet the blends spice dial', frame: 'desktop' },
      { src: '/assets/work/people-of-spice/mob.webp', alt: 'People of Spice on a phone', frame: 'phone' },
      { src: '/assets/work/people-of-spice/desk3.webp', alt: 'Grow, Source, Create story', frame: 'desktop' }
    ],
    metrics: [
      { value: '44', label: 'blends, each with its own page' },
      { value: '22', label: 'kitchens on the World of Spice globe' },
      { value: '61', label: 'commits across launch and redesign' },
      { value: '0→100', label: 'loading counter in the intro' }
    ],
    challenge: [
      'Spice jars look alike on a shelf. The brand’s difference is where each blend comes from and what to cook with it, and the first site could not tell that story at scale.'
    ],
    approach: [
      'Make origin the navigation. A World of Spice globe, a Spice Rack and a recipe CMS generate every page from data, and every jar links to recipes that use it.'
    ],
    built: [
      { title: 'First-visit intro', text: 'Spice and salt pour into a globe, a 0–100 counter, then fly into the hero.' },
      { title: 'Meet the blends', text: 'A swipeable spice dial for 12 featured blends; open a jar to see its origin and recipes.' },
      { title: 'Soil to table', text: 'GSAP scroll text reveals and a pinned Grow, Source, Create section.' },
      { title: 'Spice + recipe CMS', text: 'Generated pages, Our Story timeline and SEO for every page, with Open Graph images.' },
      { title: 'Airtable forms', text: 'Every form posts through Cloudflare Pages Functions into Airtable.' }
    ],
    flow: [
      { label: 'Spice + recipe data', note: 'JSON CMS' },
      { label: 'Build script', note: 'Pages + OG images' },
      { label: 'Cloudflare Pages', note: 'Static + Functions' },
      { label: 'Airtable', note: 'Leads and requests' }
    ],
    improved: [
      { before: 'Products and recipes disconnected', after: 'Every jar links to recipes that use it' },
      { before: 'Generic hero', after: 'An intro that tells the brand story in seconds' },
      { before: 'Forms emailed to an inbox', after: 'Forms saved to Airtable' }
    ],
    stack: [
      { name: 'GSAP', why: 'Intro and scroll storytelling.' },
      { name: 'Node build + OG script', why: 'Dozens of pages with unique share images.' },
      { name: 'Cloudflare Pages Functions', why: 'Secure form handling without a server.' },
      { name: 'Airtable', why: 'A database the brand team can use.' }
    ],
    log: { commits: 61, span: 'Sep 2025 – Oct 2026', repo: 'core-home-web/people_of_spice', entries: [] }
  },

  {
    slug: 'roller-reels',
    result: 'Quotes in DMs → a 7-step booking flow in under 3 minutes',
    title: 'Roller Reels',
    client: 'Roller Reels',
    year: '2026',
    kind: 'Booking site',
    tags: ['Brand site', 'Automation'],
    accent: '#ff8a00',
    summary: 'Motorcycle and car videography in NJ and NYC, with a 7-step mobile booking flow, transparent pricing and a $100 deposit.',
    intro: 'Roller Reels shoots rolling and static video of cars and motorcycles. Riders were asking for quotes in DMs. I built a site that shows the work, prices it clearly and lets riders build and book a shoot in under three minutes.',
    role: 'Design, development, booking UX, SEO',
    timeline: 'Mar – Oct 2026',
    platform: 'Static site on a Cloudflare Worker, GSAP, Lenis',
    live: { url: 'https://rollerreels.com', label: 'rollerreels.com' },
    cover: '/assets/work/roller-reels/cover.webp',
    gallery: [
      { src: '/assets/work/roller-reels/desk2.webp', alt: 'Roller Reels transparent pricing', frame: 'desktop' }
    ],
    metrics: [
      { value: '7', label: 'step booking flow' },
      { value: '<3 min', label: 'to build and book a shoot' },
      { value: '$100', label: 'deposit holds the date' },
      { value: '82', label: 'commits' }
    ],
    challenge: [
      'Quotes happened in DMs, prices changed per conversation, and riders did not know what they were booking or where to meet.'
    ],
    approach: [
      'Publish real prices, then turn the quote into a guided booking flow built for thumbs: one decision per step, auto-advance, swipe navigation and a progress bar styled like a race.'
    ],
    built: [
      { title: 'Mobile booking flow', text: 'Seven steps with compact cards, upgrade tiles revealed after a format is chosen and a running “mission build” bar.' },
      { title: 'Transparent pricing', text: 'Static from $200, Rollers from $300, Full Cinematic at $999, plus add-ons.' },
      { title: 'Midnight Ember design system', text: 'Applied across homepage, bookings, calendar and team pages.' },
      { title: 'Gallery', text: 'A carousel with fixed Vimeo lightboxes and locked page scroll.' },
      { title: 'Meetup details', text: 'The Jersey City meetup spot documented on the FAQ and in the booking flow.' },
      { title: 'SEO + AI search', text: 'Meta titles, schema, sitemap and robots rules that welcome AI crawlers.' }
    ],
    flow: [
      { label: 'Reels + pricing', note: 'Show the work' },
      { label: 'Booking flow', note: '7 steps, GSAP' },
      { label: '$100 deposit', note: 'Holds the date' },
      { label: 'Shoot day', note: 'Balance due' }
    ],
    improved: [
      { before: 'Quotes in DMs', after: 'Prices published, packages built by the rider' },
      { before: 'Long desktop form', after: 'Swipeable, auto-advancing mobile flow' },
      { before: 'Unclear meetup', after: 'Exact meetup and fuel stop in the flow and FAQ' }
    ],
    stack: [
      { name: 'GSAP + Lenis', why: 'Slide transitions and smooth scroll on phones.' },
      { name: 'Cloudflare Worker', why: 'Fast static hosting with room for logic.' },
      { name: 'Schema.org + sitemap', why: 'Findable in search and AI answers.' }
    ],
    log: { commits: 82, span: 'Mar – Oct 2026', repo: 'SWFTstudios/roller-reels', entries: [] }
  },

  {
    slug: 'winslow-pantry',
    result: 'Three languages, WCAG 2.2 AA, live in one day',
    title: 'Winslow Pantry',
    client: 'Core Home',
    year: '2026',
    kind: 'Brand site',
    tags: ['Brand site', 'Core Home'],
    accent: '#6f97b6',
    summary: 'A trilingual brochure site built from the brand guidelines, with WCAG 2.2 AA accessibility, generated SEO and a password-protected style guide.',
    intro: 'Winslow Pantry brings the easy spirit of a Saturday farmer’s market into the kitchen. I built the site from the brand guidelines in English, Spanish and French, with every word in translation files, so the team can grow it without touching templates.',
    role: 'Design, development, i18n, accessibility',
    timeline: 'Oct 2026',
    platform: 'Node build, Cloudflare Worker, GSAP',
    live: { url: 'https://winslowpantry.shop', label: 'winslowpantry.shop' },
    cover: '/assets/work/winslow-pantry/cover.webp',
    gallery: [
      { src: '/assets/work/winslow-pantry/desk2.webp', alt: 'Winslow Pantry collection', frame: 'desktop' },
      { src: '/assets/work/winslow-pantry/mob.webp', alt: 'Winslow Pantry on a phone', frame: 'phone' },
      { src: '/assets/work/winslow-pantry/desk3.webp', alt: 'Winslow Pantry values', frame: 'desktop' }
    ],
    metrics: [
      { value: '3', label: 'languages: EN, ES, FR' },
      { value: 'AA', label: 'WCAG 2.2, automated axe audit' },
      { value: '160', label: 'char limit enforced on every meta description' },
      { value: '1 day', label: 'from guidelines to live site' }
    ],
    challenge: ['Launch a brand in three languages with consistent copy, strong SEO and real accessibility, quickly.'],
    approach: ['Keep all copy in i18n JSON and generate every page, sitemap, hreflang tag and share image from it. Make the build fail on house-style violations.'],
    built: [
      { title: 'Trilingual site', text: 'Home, Collection, Our Story and Contact in three languages, with hreflang and localized share images.' },
      { title: 'Build checks', text: 'Fails on em dashes, titles over 60 characters or descriptions over 160; lists missing translations.' },
      { title: 'Brand motion', text: 'A plaid page curtain, a hero that writes itself in, and ambient sway that settles within five seconds.' },
      { title: 'Accessibility', text: 'Color never carries meaning alone, visible focus, forced-colors and reduced-motion support.' },
      { title: 'Gated style guide', text: 'Basic Auth on /styleguide with a color-vision preview.' },
      { title: 'Launch-lineup switch', text: 'Flip the whole site between the full collection and launch products.' }
    ],
    flow: [
      { label: 'i18n JSON', note: 'Every word' },
      { label: 'Build script', note: 'Pages × languages' },
      { label: 'OG script', note: '1200×630 per page' },
      { label: 'Worker', note: 'Assets + auth' }
    ],
    improved: [
      { before: 'Copy hard-coded in templates', after: 'Copy in translation files, templates have no text' },
      { before: 'SEO checked by hand', after: 'SEO rules enforced by the build' }
    ],
    stack: [
      { name: 'Node build scripts', why: 'Pages, sitemap and share images from one source.' },
      { name: 'GSAP', why: 'Brand-matched motion with accessibility guards.' },
      { name: 'Cloudflare Worker', why: 'Static speed plus auth and email redirects.' }
    ],
    log: { commits: 18, span: 'Oct 22, 2026', repo: 'core-home-web/winslow-pantry', entries: [] }
  },

  {
    slug: 'alder-meadow',
    result: 'One JSON catalog → every product page and a store finder',
    title: 'Alder Meadow',
    client: 'Core Home',
    year: '2026',
    kind: 'Brand site',
    tags: ['Brand site', 'Core Home'],
    accent: '#9aa77a',
    summary: 'A kitchenware brand site with generated product pages, category filters and a store finder ready for retail partners.',
    intro: 'Alder Meadow makes kitchen tools for the quiet rituals of home. Built from the 2026 branding guide, the site tells that story and routes shoppers to a store near them, with online buying ready to switch on per product.',
    role: 'Design, development',
    timeline: 'Oct 2026',
    platform: 'Node build, Cloudflare Worker',
    cover: '/assets/work/alder-meadow/cover.webp',
    gallery: [
      { src: '/assets/work/alder-meadow/desk3.webp', alt: 'Alder Meadow product ritual', frame: 'desktop' },
      { src: '/assets/work/alder-meadow/mob.webp', alt: 'Alder Meadow on a phone', frame: 'phone' }
    ],
    metrics: [
      { value: '4', label: 'shop categories with URL filters' },
      { value: '1', label: 'JSON catalog drives every product page' },
      { value: '3', label: 'commits: brand, pages, polish' }
    ],
    challenge: ['The products sell through retail partners first, so the site had to send people to stores, not a cart, without closing the door on e-commerce.'],
    approach: ['Generate product pages from one catalog file. Each product gets “Find in a store near you”, and setting a shopUrl adds a Buy online button.'],
    built: [
      { title: 'Generated product pages', text: 'Copy, features, specs, care, imagery and related products from products.json.' },
      { title: 'Store finder', text: 'Search by place, product or “near me”, with a graceful coming-soon state.' },
      { title: 'Licensed-font fallbacks', text: 'Brand fonts first in the stack, open-source stand-ins until the kit is added.' },
      { title: 'Private style guide', text: 'Basic Auth in front of /styleguide, noindex and disallowed.' }
    ],
    flow: [
      { label: 'products.json', note: 'Catalog' },
      { label: 'Build script', note: 'Shop + PDPs' },
      { label: 'stores.json', note: 'Store finder' },
      { label: 'Worker', note: 'Assets + auth' }
    ],
    improved: [{ before: 'Brand guide as a PDF', after: 'A live site and style guide built from it' }],
    stack: [
      { name: 'Node build', why: 'Every product page stays consistent.' },
      { name: 'Cloudflare Worker', why: 'Static hosting with a protected route.' }
    ],
    log: { commits: 3, span: 'Oct 21, 2026', repo: 'core-home-web/alder_meadow', entries: [] }
  },

  {
    slug: 'brooklyn-steel-co',
    result: 'A product launch, a parts range and a help center in one store',
    title: 'Brooklyn Steel Co.',
    client: 'Core Home',
    year: '2025–26',
    kind: 'Shopify store',
    tags: ['Shopify', 'Core Home', 'E-commerce'],
    accent: '#c79a5b',
    summary: 'Espresso machines, coffee and accessories. A theme relaunch for the Auto Pour Over, a replacement-parts range and a full help center.',
    intro: 'Brooklyn Steel Co. sells espresso machines, coffee and mugs under a New York identity. I run the Shopify store: the theme, catalog, collections and support content, including the launch of the PrecisionPour auto pour-over.',
    role: 'Shopify theme, catalog, content and launches',
    timeline: 'Nov 2025 – present',
    platform: 'Shopify (Inova Dark theme)',
    live: { url: 'https://brooklynsteelco.com', label: 'brooklynsteelco.com' },
    cover: '/assets/work/brooklyn-steel-co/cover.webp',
    gallery: [],
    metrics: [
      { value: '53', label: 'products live' },
      { value: '11', label: 'replacement parts in their own collection' },
      { value: '12', label: 'help articles across five blogs' },
      { value: '18', label: 'legacy products archived in one cleanup' }
    ],
    challenge: ['A 2022 cookware lineup still cluttered the store, owners had nowhere to buy parts or register a machine, and a new product needed a launch.'],
    approach: ['Clean the catalog, build the support side of owning a machine, then launch PrecisionPour on a dedicated theme.'],
    built: [
      { title: 'Auto Pour Over launch theme', text: 'Inova Dark, created Sep 25 and live for the PrecisionPour launch on Oct 7, 2026.' },
      { title: 'Replacement parts', text: 'Portafilter, tamper, dosing ring, water tank, filters, frothing jug and more.' },
      { title: 'Help center', text: 'Brew Guides, Maintenance & Care, Beginner and Intermediate espresso guides, how-to videos.' },
      { title: 'Registration and warranty', text: 'Product registration and warranty policy pages, refreshed FAQs.' },
      { title: 'New lines', text: 'Talos 20, four coffee blends, flower mugs and Pisa glass mugs.' }
    ],
    flow: [
      { label: 'Catalog cleanup', note: 'Archive legacy' },
      { label: 'Support content', note: 'Guides + parts' },
      { label: 'Launch theme', note: 'PrecisionPour' }
    ],
    improved: [
      { before: 'Discontinued cookware mixed in', after: 'A focused coffee catalog' },
      { before: 'No parts or registration', after: 'Parts collection, registration and warranty pages' }
    ],
    stack: [
      { name: 'Shopify', why: 'Reliable checkout and catalog tools the team can run.' },
      { name: 'Shopify Admin API', why: 'Dated change log pulled straight from the store.' }
    ],
    log: null
  },

  {
    slug: 'manna-hydration',
    result: 'Lifestyle-first storefront with guided bottle discovery',
    title: 'Manna Hydration',
    client: 'Core Home',
    year: '2023–26',
    kind: 'Shopify store',
    tags: ['Shopify', 'Core Home', 'E-commerce'],
    accent: '#9fb59c',
    summary: 'A drinkware store with a cinematic video hero, “find your match” bottle discovery and email capture with a first-order offer.',
    intro: 'Manna makes stainless drinkware for everyday carry. The storefront leads with lifestyle video, helps shoppers find their bottle and turns visitors into subscribers.',
    role: 'Shopify design, development and merchandising',
    timeline: 'Aug 2023 – present',
    platform: 'Shopify',
    live: { url: 'https://mannahydration.com', label: 'mannahydration.com' },
    cover: '/assets/work/manna-hydration/cover.webp',
    gallery: [],
    metrics: [],
    challenge: ['Bottles look similar online; shoppers need help choosing and a reason to come back.'],
    approach: ['Lead with people using the product, guide discovery with a “find your match” path, and merchandise Best Sellers and New Arrivals side by side.'],
    built: [
      { title: 'Video hero', text: 'Full-bleed lifestyle video with seasonal campaigns like “New Year, New You”.' },
      { title: 'Find your match', text: 'A guided path to the right bottle.' },
      { title: 'Merchandising tabs', text: 'Best Sellers and New Arrivals in one section.' },
      { title: 'Email capture', text: 'A sign-up offer for $10 off the first order.' }
    ],
    flow: [],
    improved: [],
    stack: [{ name: 'Shopify', why: 'Catalog, checkout and marketing apps in one place.' }],
    log: null
  },

  {
    slug: 'tal-hydration',
    result: 'Shop by use, or hand off to Walmart in one tap',
    title: 'TAL Hydration',
    client: 'Core Home',
    year: '2023–26',
    kind: 'Shopify store',
    tags: ['Shopify', 'Core Home', 'E-commerce'],
    accent: '#c9b45a',
    summary: 'Water bottles and tumblers for the whole family, with category navigation by use and a retail path to Walmart.',
    intro: 'TAL sells water bottles, tumblers and coffee and travel drinkware, including a children and tweens range. The store is organised by how people use the product and links straight to Walmart, where much of the line is sold.',
    role: 'Shopify design, development and merchandising',
    timeline: 'Aug 2023 – present',
    platform: 'Shopify (Broadcast theme)',
    live: { url: 'https://talhydration.com', label: 'talhydration.com' },
    cover: '/assets/work/tal-hydration/cover.webp',
    gallery: [],
    metrics: [],
    challenge: ['A broad line, from kids’ bottles to coffee tumblers, sold both direct and through a major retailer.'],
    approach: ['Navigate by use: water bottles, tumblers, coffee & travel, children & tweens. Lead with lifestyle imagery and a clear “Shop at Walmart” path.'],
    built: [
      { title: 'Use-based navigation', text: 'Shop, Water Bottles, Tumblers, Coffee & Travel, Children & Tweens.' },
      { title: 'Retail hand-off', text: 'Hero calls to action that send shoppers to Walmart.' },
      { title: 'Free-shipping bar', text: 'An announcement bar for orders over $50.' }
    ],
    flow: [],
    improved: [],
    stack: [{ name: 'Shopify', why: 'Fast merchandising for a large catalog.' }],
    log: null
  },

  {
    slug: 'thyme-and-table',
    result: 'Hundreds of products, organized the way people cook',
    title: 'Thyme & Table',
    client: 'Core Home',
    year: '2023–26',
    kind: 'Shopify store',
    tags: ['Shopify', 'Core Home', 'E-commerce'],
    accent: '#c8a45d',
    summary: 'A dark, premium kitchen and home store spanning prep, cook, serve, drinkware and appliances.',
    intro: 'Thyme & Table brings bold, colorful design to everyday kitchen tools and appliances. The storefront uses a dark lifestyle theme so products like the espresso machine read as premium.',
    role: 'Shopify design, development and merchandising',
    timeline: 'Aug 2023 – present',
    platform: 'Shopify (Dark Lifestyle theme)',
    live: { url: 'https://shopthymeandtable.com', label: 'shopthymeandtable.com' },
    cover: '/assets/work/thyme-and-table/cover.webp',
    gallery: [],
    metrics: [],
    challenge: ['Hundreds of kitchen products across very different categories, sold under one brand.'],
    approach: ['Organize by the kitchen journey with mega menus: Prep, Cook, Serve, Drinkware, Kitchen Appliances, Lifestyle, Support.'],
    built: [
      { title: 'Journey-based mega menu', text: 'Seven top-level menus that mirror how people cook.' },
      { title: 'Dark lifestyle theme', text: 'Moody product photography with gold accents.' },
      { title: 'Support hub', text: 'A dedicated support menu for owners.' }
    ],
    flow: [],
    improved: [],
    stack: [{ name: 'Shopify', why: 'Scales to a large, varied catalog.' }],
    log: null
  },

  {
    slug: 'core-home',
    result: '898 compliance records, findable from one modal',
    title: 'corehome.com',
    client: 'Core Home',
    year: '2023–26',
    kind: 'Corporate site + CMS',
    tags: ['Webflow', 'Core Home'],
    accent: '#d4b26a',
    summary: 'The parent company’s Webflow site: a 27-brand CMS and a rebuilt AB1200 / PFAS compliance experience with 898 records.',
    intro: 'Core Home designs and sources products for a portfolio of consumer brands. Its Webflow site has to introduce the company to retail buyers and publish chemical-compliance data for every product. I maintain the site and rebuilt the compliance experience.',
    role: 'Webflow development, CMS architecture',
    timeline: 'Aug 2023 – present',
    platform: 'Webflow + CMS',
    live: { url: 'https://corehome.com', label: 'corehome.com' },
    cover: '/assets/work/core-home/cover.webp',
    gallery: [],
    metrics: [
      { value: '27', label: 'brands in the Brands CMS' },
      { value: '898', label: 'compliance records across four collections' },
      { value: '378', label: 'product colorways documented' },
      { value: '36', label: 'chemicals with their own detail pages' }
    ],
    challenge: ['California AB1200 requires disclosure of chemicals in cookware. The data covered hundreds of products and colorways, and the first version could not scale.'],
    approach: ['Reorganize the CMS into purpose-built collections: AB1200 Version 2, Colorways, Chemicals and Products, then build a new /ab1200 page and modal on top, keeping the old version as a draft.'],
    built: [
      { title: 'AB1200 / PFAS experience', text: 'A new page and modal for finding compliance data by product.' },
      { title: 'Compliance CMS', text: 'V2 (209), Colorways (378), Chemicals (36) and Products (275).' },
      { title: 'Brands CMS', text: '27 brand entries kept current.' },
      { title: 'Company pages', text: 'Home refresh, New Ventures, Collaborate and Innovation pages, a homescreen marquee.' }
    ],
    flow: [],
    improved: [{ before: 'Compliance data in one overloaded collection', after: 'Four related collections and a searchable modal' }],
    stack: [{ name: 'Webflow CMS', why: 'Non-developers can update hundreds of records safely.' }],
    log: null
  },

  {
    slug: 'core-home-reports',
    result: 'Commit logs → plain-language reports for leadership',
    title: 'Core Home Project Reports',
    client: 'Core Home',
    year: '2025–26',
    kind: 'Internal dashboard',
    tags: ['Web app', 'Core Home'],
    accent: '#00ff41',
    summary: 'A dashboard that turns weekly GitHub activity across every brand repo into plain-language reports for leadership.',
    intro: 'Leadership wanted to know what the web team shipped without reading commit logs. I built a reports site, backed by a Worker that aggregates GitHub activity across all brand repositories, with brand cards, a year in review and a Shopify change log.',
    role: 'Design and development',
    timeline: 'Dec 2025 – Nov 2026',
    platform: 'Cloudflare Worker + KV, GitHub API, Shopify Admin API',
    cover: '/assets/work/core-home-reports/cover.webp',
    gallery: [
      { src: '/assets/work/core-home-reports/desk2.webp', alt: 'Brand cards on the reports dashboard', frame: 'desktop' },
      { src: '/assets/work/core-home-reports/mob.webp', alt: 'Reports dashboard on a phone', frame: 'phone' }
    ],
    metrics: [
      { value: '27', label: 'brands tracked' },
      { value: '30', label: 'Workers / Pages deployments in the account' },
      { value: '56', label: 'commits' }
    ],
    challenge: ['Work across dozens of brand repos was invisible to non-technical stakeholders.'],
    approach: ['Cache GitHub activity in KV, summarise it per brand in plain language, and add a print-ready year in review.'],
    built: [
      { title: 'Weekly activity log', text: 'Filter by brand, repo and date range.' },
      { title: 'Plain-language brand cards', text: 'What changed and why it matters, with screenshots.' },
      { title: 'Year in review', text: 'A printable summary of the year’s work.' },
      { title: 'Shopify change log', text: 'Dated changes pulled from the Shopify Admin API.' }
    ],
    flow: [
      { label: 'GitHub API', note: 'All brand repos' },
      { label: 'Worker + KV', note: 'Cached aggregation' },
      { label: 'Dashboard', note: 'Cards + reports' }
    ],
    improved: [{ before: 'Status updates by meeting', after: 'A self-serve dashboard anyone can read' }],
    stack: [
      { name: 'Cloudflare Worker + KV', why: 'Fast, cached, and within API rate limits.' },
      { name: 'Lenis', why: 'Smooth reading on long reports.' }
    ],
    log: { commits: 56, span: 'Dec 2025 – Nov 2026', repo: 'SWFTstudios/ch_project_reports', entries: [] }
  },

  {
    slug: 'blurred-lines',
    result: 'Video moved to R2, the whole site served from the edge',
    title: 'Blurred Lines Entertainment',
    client: 'Yanko Hernando',
    year: '2023–26',
    kind: 'Brand site',
    tags: ['Brand site', 'Webflow'],
    accent: '#ff2d6f',
    summary: 'A premier wedding entertainment brand: bold editorial design, video-led storytelling and a site later migrated to Cloudflare with R2 video hosting.',
    intro: 'Blurred Lines Entertainment has hosted hundreds of high-end weddings. Yanko wanted a site that felt like his events: bold, modern and full of moments. I designed and built it in Webflow, then moved it to Cloudflare Workers with videos on R2 for speed and lower cost.',
    role: 'Design, development, analytics, migration',
    timeline: 'Original build, Feb 2026 GA4, Sep 2026 migration',
    platform: 'Webflow → Cloudflare Workers + R2',
    live: { url: 'https://blurredlinesentertainment.com', label: 'blurredlinesentertainment.com' },
    cover: '/assets/work/blurred-lines/cover.webp',
    gallery: [],
    metrics: [
      { value: 'R2', label: 'video hosting, served from /videos' },
      { value: 'GA4', label: 'analytics added at client request' },
      { value: 'Auto', label: 'deploys on every push' }
    ],
    challenge: ['Wedding couples book on feeling. The brand needed video and photos front and center without a slow site.'],
    approach: ['Lead with services, testimonials and the founder’s story; host videos on R2 and serve the site from Cloudflare’s edge.'],
    built: [
      { title: 'Editorial design', text: 'Strong typography and imagery-led layouts.' },
      { title: 'Services', text: 'Photo booth, sparklers, dance-floor lighting and packages.' },
      { title: 'Side contact form', text: 'Always-available inquiry form with text, email and call shortcuts.' },
      { title: 'Cloudflare migration', text: 'Workers static assets plus an R2 media bucket.' }
    ],
    flow: [],
    improved: [{ before: 'Large videos on page hosting', after: 'Videos streamed from R2' }],
    stack: [
      { name: 'Webflow', why: 'Rapid, high-polish design.' },
      { name: 'Cloudflare Workers + R2', why: 'Edge speed and cheap video storage.' }
    ],
    log: { commits: 6, span: 'Feb – Sep 2026', repo: 'SWFTstudios/blurred-lines-entertainment', entries: [] },
    quote: {
      text: 'His work is like no other. He captured the vision I have for my brand perfectly and created a website that helped me pack venues and book more gigs.',
      name: 'Yanko Hernando', role: 'Owner, Blurred Lines Entertainment'
    }
  },

  {
    slug: 'alpha-ministries-international',
    result: 'Ministries, events and giving, one click from home',
    title: 'Alpha Ministries International',
    client: 'Alpha Ministries International',
    year: '2025',
    kind: 'Webflow site',
    tags: ['Webflow'],
    accent: '#d9b25b',
    summary: 'A Webflow site for a Christ-centered ministry: ministries, events, leadership and donation pathways.',
    intro: 'Alpha Ministries International needed a home online for its ministries, events and leadership, and a clear way for supporters to give.',
    role: 'Design and Webflow development',
    timeline: '2025',
    platform: 'Webflow',
    live: { url: 'https://alphaministriesinternational.org', label: 'alphaministriesinternational.org' },
    cover: '/assets/work/alpha-ministries-international/cover.webp',
    gallery: [],
    metrics: [],
    challenge: ['Information about ministries and events was scattered, and giving was hard to find.'],
    approach: ['Structure the site around what visitors come for: ministries, events, leadership and giving, each one click from the homepage.'],
    built: [
      { title: 'Ministries and events', text: 'CMS-driven sections the team can update.' },
      { title: 'Leadership', text: 'Profiles that put faces to the ministry.' },
      { title: 'Donation pathways', text: 'Clear calls to give throughout the site.' }
    ],
    flow: [],
    improved: [],
    stack: [{ name: 'Webflow CMS', why: 'Easy updates for a volunteer team.' }],
    log: null
  }
];

// More work from the original portfolio: live sites, VR tours and 3D animation.
// Shown as cards with outbound links on /work/ and the homepage.
export const more = [
  { title: 'Hawthorne Global Ministries', kind: 'Website · Email automation', type: 'Website', url: 'https://www.hawthorneglobalministries.org/', cta: 'Visit site', img: '/assets/work/more/hawthorne.webp' },
  { title: 'Scribble & Scribe', kind: 'Brand website', type: 'Website', url: 'https://scribbleandscribe.webflow.io/', cta: 'Visit site', img: '/assets/work/more/scribble-and-scribe.webp' },
  { title: 'Apex Fitness', kind: 'Branding · Website · Google Analytics', type: 'Website', url: 'https://www.apexfitcoaching.com/', cta: 'Visit site', img: '/assets/work/more/apex-fitness.webp' },
  { title: 'Hamper', kind: 'iOS app landing page', type: 'Website', url: 'https://hamperapp.webflow.io', cta: 'Visit site', img: '/assets/work/more/hamper.webp' },
  { title: 'WDYM Virtual Showroom', kind: 'VR tour · with Company5', type: 'VR tour', url: 'https://mantisvisuals.com/wdym-demo-3/', cta: 'Take the tour', img: '/assets/work/more/wdym.webp' },
  { title: 'Pico Ski Resort', kind: 'VR tour demo', type: 'VR tour', url: 'https://mantisvisuals.com/pico-resort-tour/', cta: 'Take the tour', img: '/assets/work/more/pico.webp' },
  { title: 'Broadway Supercars', kind: 'VR showroom', type: 'VR tour', url: 'https://mantisvisuals.com/broadway-supercars-tour/', cta: 'Take the tour', img: '/assets/work/more/broadway-supercars.webp' },
  { title: 'Eevee Cube Over Water', kind: '3D design & animation', type: '3D animation', url: 'https://vimeo.com/839084087/1eaaa40b22', cta: 'Watch', img: '/assets/work/more/eevee-cube.webp' },
  { title: 'Animated Möbius Strip', kind: '3D design & animation', type: '3D animation', url: 'https://vimeo.com/839085191/314f95cd21', cta: 'Watch', img: '/assets/work/more/mobius-strip.webp' }
];
