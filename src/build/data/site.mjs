export const site = {
  name: 'Elombe Kisala',
  url: 'https://elombekisala.com',
  email: 'elombekisala@gmail.com',
  location: 'Jersey City, NJ · New York',
  linkedin: 'https://www.linkedin.com/in/nsonsa-kisala/',
  github: 'https://github.com/elombekisala',
  title: 'Elombe Kisala · Designer & Developer',
  description: 'Elombe Kisala designs and builds websites, Shopify stores, web apps and iOS apps for brands in NYC and North Jersey. See case studies on how each was made.'
};

export const nav = [
  { href: '/work/', label: 'Work' },
  { href: '/about/', label: 'About' },
  { href: '/services/', label: 'Services' },
  { href: '/contact/', label: 'Contact' }
];

// The toolkit: what I use and what it means for a client.
export const toolkit = [
  { name: 'Figma', cat: 'Design', mono: 'Fi', benefit: 'You see and approve the site before a line of code is written, so there are no surprises at launch.', used: [] },
  { name: 'Webflow', cat: 'Build', mono: 'Wf', benefit: 'A custom design your team can edit like a document, without calling a developer for every change.', used: ['core-home', 'blurred-lines', 'alpha-ministries-international'] },
  { name: 'Shopify', cat: 'Commerce', mono: 'Sh', benefit: 'Checkout, inventory and payments you can trust, with a storefront that looks like your brand, not a template.', used: ['brooklyn-steel-co', 'manna-hydration', 'tal-hydration', 'thyme-and-table', 'fizz'] },
  { name: 'Cloudflare Workers', cat: 'Build', mono: 'Cf', benefit: 'Pages load fast everywhere and hosting costs stay close to zero, even with real back-end features.', used: ['built-by-me-ez', 'only-at-the-kiosk', 'learn-lingala', 'swft-studios'] },
  { name: 'D1 · KV · R2', cat: 'Build', mono: 'D1', benefit: 'Accounts, orders and media storage built into the same platform, with no extra servers to rent or patch.', used: ['only-at-the-kiosk', 'learn-lingala', 'blurred-lines'] },
  { name: 'Swift / SwiftUI', cat: 'Build', mono: 'Sw', benefit: 'Native iPhone apps that feel at home on iOS and can use location, notifications and subscriptions.', used: ['snooze-lane'] },
  { name: 'GSAP · Lenis', cat: 'Motion', mono: 'Gs', benefit: 'Smooth, considered motion that guides the eye to what matters and makes a brand feel premium.', used: ['fizz', 'people-of-spice', 'roller-reels', 'winslow-pantry'] },
  { name: 'Three.js', cat: 'Motion', mono: '3D', benefit: 'Products and ideas people can rotate and explore in the browser, no app required.', used: ['finish-library', 'only-at-the-kiosk'] },
  { name: 'Lottie', cat: 'Motion', mono: 'Lo', benefit: 'Designer-made animation that stays sharp on every screen and weighs a fraction of a video.', used: ['fizz'] },
  { name: 'Stripe', cat: 'Commerce', mono: 'St', benefit: 'Take payments, deposits and subscriptions online the day you launch.', used: ['built-by-me-ez', 'only-at-the-kiosk', 'swft-studios'] },
  { name: 'Airtable', cat: 'Automation', mono: 'At', benefit: 'Every lead, client and order lands in one table you can sort, filter and share.', used: ['built-by-me-ez', 'people-of-spice', 'swft-studios'] },
  { name: 'Cal.com', cat: 'Automation', mono: 'Ca', benefit: 'Clients book themselves into your calendar, so you stop going back and forth.', used: ['built-by-me-ez'] },
  { name: 'Firebase', cat: 'Build', mono: 'Fb', benefit: 'Sign-in, sync and cloud functions for apps, ready to scale with your users.', used: ['snooze-lane'] },
  { name: 'Twilio', cat: 'Automation', mono: 'Tw', benefit: 'Texts and calls that reach customers when an email will not.', used: ['snooze-lane', 'learn-lingala'] },
  { name: 'Claude API', cat: 'AI', mono: 'Ai', benefit: 'AI features that do real work, like drafting, tutoring and summarising, with guardrails on cost and accuracy.', used: ['learn-lingala', 'swft-studios'] },
  { name: 'Make · Zapier', cat: 'Automation', mono: 'Mk', benefit: 'Repetitive admin connected and automated, from form to CRM to follow-up.', used: [] },
  { name: 'GA4 · GTM · PostHog', cat: 'Growth', mono: 'An', benefit: 'Know which pages and campaigns bring customers, and decide with data instead of guesses.', used: ['fizz', 'swft-studios', 'blurred-lines'] },
  { name: 'SEO · Schema', cat: 'Growth', mono: 'Se', benefit: 'Structured pages that rank in Google and get cited in AI answers.', used: ['roller-reels', 'winslow-pantry', 'people-of-spice'] },
  { name: 'Playwright · CI', cat: 'Quality', mono: 'Pw', benefit: 'Automated checks catch broken pages and forms before your customers do.', used: ['only-at-the-kiosk', 'snooze-lane'] },
  { name: 'Premiere · After Effects', cat: 'Content', mono: 'Pr', benefit: 'Video and motion content made by the same person who builds the site, so it all fits.', used: [] },
  { name: 'Matterport · 3DVista', cat: 'Content', mono: 'Vr', benefit: 'Virtual tours that let people walk a space before they visit.', used: [] }
];

export const capabilities = [
  { n: '01', title: 'Design', text: 'Brand-led art direction, UI and design systems, prototyped in Figma before build.', items: ['Art direction', 'UI / UX', 'Design systems', 'Prototyping'] },
  { n: '02', title: 'Build', text: 'Websites, Shopify stores, web apps and native iOS apps, engineered to be fast and easy to run.', items: ['Webflow', 'Shopify', 'Cloudflare', 'SwiftUI'] },
  { n: '03', title: 'Automate', text: 'Payments, booking, CRM and follow-up connected so the business runs while you work.', items: ['Stripe', 'Airtable', 'Cal.com', 'AI workflows'] },
  { n: '04', title: 'Grow', text: 'SEO, analytics and content that bring people back and show what is working.', items: ['SEO + GEO', 'GA4 / GTM', 'Content', 'CRO'] }
];

// From LinkedIn (linkedin.com/in/nsonsa-kisala), most recent first.
export const experience = [
  { role: 'Web Developer', org: 'Core Home', when: 'Aug 2023 – Present', where: 'Full-time · New York, NY · Hybrid', text: 'Lead web development across Core Home’s brand portfolio: Shopify storefronts (Brooklyn Steel Co., Manna, TAL, Thyme & Table), new brand sites on Cloudflare (Winslow Pantry, Alder Meadow, People of Spice, FIZZ), corehome.com and its compliance CMS, and internal tools like the Finish Library and Project Reports.' },
  { role: 'Founder & Creative Director', org: 'SWFT Studios', when: 'Present', where: 'Jersey City, NJ', text: 'Design, content and technology studio for local businesses in NYC and North Jersey. Run discovery, design direction and delivery, and built the studio’s own payments, client portal and outreach platform. Also where I ship my own products: Snooze Lane (iOS) and Learn Lingala.' },
  { role: 'Video Technician', org: 'Elegant Music Group (EMG)', when: 'Mar 2021 – Feb 2024', where: 'Part-time · Montclair, NJ · On-site', text: 'Set up and operated audio and video equipment for live-streamed events, delivering high-quality production and seamless streams. Video editing and live video streaming.' },
  { role: 'Freelance Web Developer', org: 'EK Web Development', when: 'Sep 2019 – Oct 2023', where: 'New Jersey', text: 'Gave local businesses bespoke websites, virtual tours and video content to present themselves professionally online. Webflow, OpenAI API integrations and VR tours (Matterport, 3DVista).' },
  { role: 'Intern', org: 'Hekemian & Co., Inc.', when: 'Feb 2019 – Sep 2019', where: 'Internship · Hackensack, NJ · On-site', text: 'Gathered and analyzed information on economic, financial and market trends to support business development initiatives.' },
  { role: 'Literature Research Assistant', org: 'Global Management Research Center', when: 'Jul 2013 – Aug 2015', where: 'Waterbury, CT', text: 'Conducted literature research and reviewed books specific to current research topics.' }
];

export const education = [
  { school: 'Full Sail University', degree: 'Bachelor’s degree, Mobile Development', when: '2017 – 2020', note: 'Grade: A' }
];

export const testimonials = [
  { text: 'His work is like no other. He captured the vision I have for my brand perfectly and created a website that helped me pack venues and book more gigs.', name: 'Yanko Hernando', role: 'Owner, Blurred Lines Entertainment' },
  { text: 'I now have a sleek and modern platform to show my Instagram and TikTok videos to potential clients. And with the added ability to sell courses online, I feel like I’ve taken my personal training business to the next level!', name: 'Omar Ndiaye', role: 'Owner, Built By Me EZ' },
  { text: 'I’ve always wanted my own website. Especially something professionally done… and then I got lucky. I found you.', name: 'Victor Garcia', role: 'Owner, Victor Boxing and Fitness' },
  { text: 'I am extremely impressed with the redesign of my website’s home page! The updated layout and security features have made my clients feel much more confident in trusting my business.', name: 'Richard Morrow', role: 'Owner, AHA Consulting Services' }
];

export const process = [
  { n: '01', title: 'Discover', text: 'A call to understand the business, the customer and what success looks like. You get a written scope and plan.' },
  { n: '02', title: 'Design', text: 'Direction, then screens in Figma. You review real layouts with real copy, and we refine together.' },
  { n: '03', title: 'Build', text: 'Development with weekly previews. Everything tested on phones, tablets and desktops, and checked for speed and accessibility.' },
  { n: '04', title: 'Launch & grow', text: 'Go live, connect analytics, hand over docs and training, then keep improving from the data.' }
];
