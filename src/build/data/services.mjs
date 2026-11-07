// Services, grouped the way clients ask for help. Every service lists the
// projects that prove it (slugs from projects.mjs). Payload CMS is new in the
// toolkit for 2026: it is offered, but no shipped project is claimed for it.

export const groups = [
  { id: 'build', label: 'Build it', note: 'From a blank page to launch' },
  { id: 'connect', label: 'Connect it', note: 'Payments, booking, CRM' },
  { id: 'improve', label: 'Improve it', note: 'Edit, migrate, speed up' },
  { id: 'partner', label: 'Join your team', note: 'Alongside your team' }
];

export const services = [
  {
    slug: 'marketing-sites', group: 'build', art: 'browser', fig: 'wireframe',
    title: 'Marketing & brand sites',
    short: 'Webflow or hand-built on Cloudflare, whichever suits how you’ll run it.',
    intro: 'A site that looks like your brand, loads fast and is easy to keep current. I design it, build it in Webflow or as a static site on Cloudflare, and hand it over with the editing set up for your team.',
    deliverables: ['Art direction and design in Figma', 'Responsive build in Webflow or code', 'Motion that guides, not distracts (GSAP)', 'SEO, schema and share images on every page', 'Accessibility checked to WCAG 2.2 AA', 'Analytics (GA4 / GTM) and a handover guide'],
    proof: ['winslow-pantry', 'people-of-spice', 'alder-meadow', 'roller-reels', 'blurred-lines'],
    tools: ['Figma', 'Webflow', 'Cloudflare Workers', 'GSAP · Lenis', 'SEO · Schema']
  },
  {
    slug: 'shopify', group: 'build', art: 'storefront', fig: 'storefront',
    title: 'Shopify stores',
    short: 'Themes, catalogs and launches for stores that need to sell, not just exist.',
    intro: 'I run Shopify stores for a family of consumer brands: themes, catalog structure, collections, launches and the help content owners need. I can start a store, clean one up, or launch a product on it.',
    deliverables: ['Theme design and development (Liquid)', 'Catalog, collection and navigation structure', 'Product launches and landing pages', 'Help centers: guides, parts, registration, warranty', 'Email capture and merchandising', 'Store clean-up and archiving'],
    proof: ['brooklyn-steel-co', 'thyme-and-table', 'manna-hydration', 'tal-hydration', 'fizz'],
    tools: ['Shopify', 'Figma', 'GA4 · GTM · PostHog']
  },
  {
    slug: 'web-apps', group: 'build', art: 'stack', fig: 'stack',
    title: 'Web apps',
    short: 'Accounts, data, payments and AI, from the first screen to production.',
    intro: 'Products people sign in to and use every day. I build on Cloudflare Workers with D1 databases, so apps are fast everywhere and cheap to run, with AI features where they genuinely help.',
    deliverables: ['Product and UX design', 'Accounts, email sign-in and roles', 'Database, API and rate limiting', 'Installable PWA with offline support', 'AI features with cost guardrails (Claude API)', 'Tests and CI on every change'],
    proof: ['learn-lingala', 'only-at-the-kiosk', 'swft-studios'],
    tools: ['Cloudflare Workers', 'D1 · KV · R2', 'Claude API', 'Stripe', 'Playwright · CI']
  },
  {
    slug: 'ios-apps', group: 'build', art: 'phone', fig: 'geofence',
    title: 'iOS apps',
    short: 'Native SwiftUI apps with location, subscriptions and a real backend.',
    intro: 'Native iPhone apps built in SwiftUI, with the backend to support them. I take an app from idea to App Store review: background location, notifications, subscriptions, privacy and account deletion included.',
    deliverables: ['SwiftUI app design and build', 'Location, geofencing and MapKit', 'Subscriptions and paywalls (RevenueCat)', 'Firebase or Cloudflare backend', 'App Store compliance: privacy manifest, ATT, account deletion', 'CI for tests'],
    proof: ['snooze-lane'],
    tools: ['Swift / SwiftUI', 'Firebase', 'Cloudflare Workers', 'Twilio']
  },
  {
    slug: 'portals-and-tools', group: 'build', art: 'dashboard', fig: 'dashboard',
    title: 'Client portals & internal tools',
    short: 'One product, two sides: what your clients see and what your team runs.',
    intro: 'Portals where clients track their project and pay, and tools that replace the spreadsheets your team passes around. Built around how people actually work, with roles and permissions.',
    deliverables: ['Role-aware dashboards for clients and staff', 'Project progress and payments', 'Replacing spreadsheet and slide workflows', 'Reports leadership can read', 'Spreadsheet imports and data clean-up', 'Docs written for non-technical teams'],
    proof: ['finish-library', 'swft-studios', 'core-home-reports'],
    tools: ['Cloudflare Workers', 'D1 · KV · R2', 'Three.js', 'Stripe']
  },
  {
    slug: 'learning-platforms', group: 'build', art: 'cards', fig: 'flashcards',
    title: 'Learning platforms',
    short: 'Courses, progress and practice in one place, online or off.',
    intro: 'Learning products that keep people coming back: structured levels, spaced repetition, checkpoints, streaks and reminders, with AI practice where it adds something a textbook can’t.',
    deliverables: ['Course structure and levels', 'Spaced-repetition review', 'Progress sync across devices', 'Reminders by email or text', 'AI conversation practice', 'Offline support'],
    proof: ['learn-lingala'],
    tools: ['Cloudflare Workers', 'D1 · KV · R2', 'Claude API', 'Twilio']
  },
  {
    slug: 'payments-and-booking', group: 'connect', art: 'calendar', fig: 'checkout',
    title: 'Payments & booking',
    short: 'Take money, deposits and bookings online the day you launch.',
    intro: 'Let customers pay and book without a phone call. Packages, deposits, subscriptions and self-scheduling, wired into your site and your calendar.',
    deliverables: ['Stripe checkout, deposits and plans', 'Self-serve booking (Cal.com)', 'Session credits and booking portals', 'Order emails and fulfillment', 'Discount codes and free orders', 'Guided booking flows for phones'],
    proof: ['built-by-me-ez', 'roller-reels', 'swft-studios', 'only-at-the-kiosk'],
    tools: ['Stripe', 'Cal.com', 'Cloudflare Workers', 'Airtable']
  },
  {
    slug: 'automation', group: 'connect', art: 'flow', fig: 'pipeline',
    title: 'CRM & automation',
    short: 'Leads, follow-up and admin connected, so nothing falls through.',
    intro: 'Every form, sale and booking lands in one place and triggers the right follow-up. I connect your site to a CRM, emails and texts, and use AI to draft where a human still approves.',
    deliverables: ['Forms to CRM (Airtable)', 'Email and SMS follow-up', 'Lead scoring and outreach with approval', 'Webhooks between tools', 'Reports and weekly summaries', 'Make or Zapier when it fits'],
    proof: ['built-by-me-ez', 'swft-studios', 'people-of-spice', 'core-home-reports'],
    tools: ['Airtable', 'Make · Zapier', 'Twilio', 'Claude API']
  },
  {
    slug: 'payload-cms', group: 'improve', art: 'cms', fig: 'blocks', isNew: true,
    title: 'A CMS anyone can edit',
    short: 'Payload CMS or Webflow CMS: editing that doesn’t need a developer on call.',
    intro: 'Your team should be able to change a headline, add a page or publish a product without a ticket. I set up Webflow CMS for marketing teams, and now Payload CMS for sites and apps that need more: a free, open-source CMS that lives in your own codebase.',
    deliverables: ['Content modelled around your team', 'Page builder blocks with live preview', 'Drafts, versions and scheduled publishing', 'Roles and permissions down to the field', 'Multi-language content', 'Training and a written guide'],
    proof: ['core-home', 'people-of-spice', 'alder-meadow'],
    tools: ['Payload CMS', 'Webflow', 'Cloudflare Workers', 'D1 · KV · R2'],
    payload: {
      note: 'New in my toolkit for 2026 projects. Payload is free and open source, so you own the CMS and its data outright.',
      features: [
        { title: 'Admin panel from code', text: 'The editing dashboard is generated from a TypeScript config, so it matches your content exactly.' },
        { title: 'Live preview', text: 'Editors see the real page update as they type, right inside the admin.' },
        { title: 'Drafts & versions', text: 'Save drafts, autosave, restore old versions and schedule publishing.' },
        { title: 'Blocks & rich text', text: 'Reusable page-builder blocks and a Lexical rich-text editor.' },
        { title: 'Access control', text: 'Permissions as functions, per collection and per field, for teams and clients.' },
        { title: 'Localization', text: 'Translate content field by field, with fallback languages.' },
        { title: 'Auth & uploads', text: 'Built-in sign-in, plus media uploads with resized images and focal points.' },
        { title: 'APIs & hooks', text: 'REST, GraphQL and a direct Local API, with hooks to run logic on any change.' },
        { title: 'Plugins', text: 'Official SEO, form builder, redirects, nested docs, search and Stripe plugins.' },
        { title: 'Runs on Cloudflare', text: 'An official template deploys Payload to Workers with D1 and R2, the stack I already use.' }
      ]
    }
  },
  {
    slug: 'migrations', group: 'improve', art: 'migrate', fig: 'migration',
    title: 'Migrations',
    short: 'Move platforms without losing what works.',
    intro: 'Outgrown Webflow hosting, stuck with a slow theme, or paying too much for video? I move sites to a better home and keep the design, content and SEO you already have.',
    deliverables: ['Audit of what to keep and what to drop', 'Webflow exports to Cloudflare', 'Video and media moved to R2', 'Webflow interactions rebuilt as code', 'Redirects and SEO preserved', 'Automatic deploys on push'],
    proof: ['blurred-lines', 'fizz', 'built-by-me-ez'],
    tools: ['Webflow', 'Cloudflare Workers', 'D1 · KV · R2', 'GSAP · Lenis']
  },
  {
    slug: 'speed-and-seo', group: 'improve', art: 'gauge', fig: 'gauge',
    title: 'Speed, SEO & hosting costs',
    short: 'Faster pages, better rankings and smaller bills.',
    intro: 'Speed and search are built, not bolted on. I trim what slows pages down, structure content for Google and AI answers, and move hosting to the edge where it costs less.',
    deliverables: ['Performance audit and fixes', 'Lighter 3D, video and scripts on phones', 'Schema, sitemaps and AI-crawler rules', 'Titles and descriptions enforced by the build', 'Cache-busted assets for instant updates', 'Edge hosting on Cloudflare'],
    proof: ['winslow-pantry', 'roller-reels', 'only-at-the-kiosk'],
    tools: ['SEO · Schema', 'Cloudflare Workers', 'GA4 · GTM · PostHog', 'Playwright · CI']
  },
  {
    slug: 'team-partner', group: 'partner', art: 'orbit', fig: 'orbit',
    title: 'Embedded developer & agency partner',
    short: 'Join your team for a launch, a season or ongoing work.',
    intro: 'I’ve spent three years as the web developer for a multi-brand company, shipping across many sites at once. I can join your team, or work white-label for your agency, per project or ongoing.',
    deliverables: ['Work in your repos, tools and process', 'Multi-brand and multi-site delivery', 'White-label builds for agencies', 'Clear weekly updates and reports', 'Documentation your team can keep', 'Per project or ongoing'],
    proof: ['core-home', 'core-home-reports', 'swft-studios'],
    tools: ['Shopify', 'Webflow', 'Cloudflare Workers', 'Figma']
  }
];
