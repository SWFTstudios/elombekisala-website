// Generates the site's HTML from the data in src/build/data and the page
// fragments in src/content/pages. Run: npm run build
// Output is plain static HTML committed to the repo (no build step on deploy).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { projects, more } from './data/projects.mjs';
import { site, nav, toolkit, capabilities, experience, education, testimonials, process as steps } from './data/site.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const commits = JSON.parse(readFileSync(join(ROOT, 'src/build/data/commits.json'), 'utf8'));
const posts = JSON.parse(readFileSync(join(ROOT, 'content/posts.json'), 'utf8'));

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const bySlug = Object.fromEntries(projects.map(p => [p.slug, p]));
const ordered = [...projects.filter(p => p.featured).sort((a, b) => a.featured - b.featured), ...projects.filter(p => !p.featured)];
const fmtDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function write(path, html) {
  const file = join(ROOT, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// Cache-busting: ?v= hash of the file's contents.
const ver = p => createHash('sha1').update(readFileSync(join(ROOT, p))).digest('hex').slice(0, 8);

// Read width/height from a WebP header so images never shift the layout.
const dimCache = {};
function dims(src) {
  if (dimCache[src]) return dimCache[src];
  const file = join(ROOT, src);
  if (!existsSync(file)) return (dimCache[src] = [1600, 1000]);
  const b = readFileSync(file);
  let w = 1600, h = 1000;
  const fmt = b.toString('ascii', 12, 16);
  if (fmt === 'VP8 ') { w = b.readUInt16LE(26) & 0x3fff; h = b.readUInt16LE(28) & 0x3fff; }
  else if (fmt === 'VP8L') { const n = b.readUInt32LE(21); w = (n & 0x3fff) + 1; h = ((n >> 14) & 0x3fff) + 1; }
  else if (fmt === 'VP8X') { w = 1 + b.readUIntLE(24, 3); h = 1 + b.readUIntLE(27, 3); }
  return (dimCache[src] = [w, h]);
}
const img = (src, alt, { cls = '', eager = false, sizes = '100vw', attrs = '' } = {}) => {
  const [w, h] = dims(src);
  return `<img src="${src}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" sizes="${sizes}"${cls ? ` class="${cls}"` : ''}${attrs ? ' ' + attrs : ''}>`;
};
const small = p => (p.cover.replace('/cover.webp', '/cover-sm.webp'));

const arrow = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
const arrowRight = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
// Text that rolls up on hover.
const roll = t => `<span class="roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;

// ---------- layout ----------
function head({ title, description, path, image = '/assets/og.jpg', jsonld = [], preload = [] }) {
  const url = site.url + path;
  const ld = jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n  ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site.url}${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#0b0b0a">
  <link rel="icon" href="/assets/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="preload" href="/fonts/Satoshi-Variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/instrument-serif-latin-400-italic.woff2" as="font" type="font/woff2" crossorigin>
  ${preload.map(p => `<link rel="preload" href="${p}" as="image" fetchpriority="high">`).join('\n  ')}
  <link rel="stylesheet" href="/assets/css/site.css?v=${ver('assets/css/site.css')}">
  <script>
    (function(d){var h=d.documentElement;h.classList.add('js');
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)h.classList.add('motion');
    try{if(!sessionStorage.getItem('ek-visited'))h.classList.add('first-visit');if(sessionStorage.getItem('ek-transition'))h.classList.add('is-arriving')}catch(e){}
    setTimeout(function(){if(!h.classList.contains('ready'))h.classList.remove('motion','is-arriving')},3500);})(document);
  </script>
  ${ld}
</head>`;
}

function header(path) {
  const link = n => `<a href="${n.href}" class="nav-link${path.startsWith(n.href) ? ' is-active' : ''}"${path.startsWith(n.href) ? ' aria-current="page"' : ''}>${roll(n.label)}</a>`;
  return `
<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <a href="/" class="brand" aria-label="${site.name}, home">
    <img class="brand-logo" src="/assets/brand/ek-logo-96.webp" alt="" width="52" height="48" aria-hidden="true">
    <span class="brand-name">${roll('Elombe Kisala')}</span>
  </a>
  <nav class="nav" aria-label="Main">${nav.map(link).join('')}</nav>
  <div class="header-end">
    <span class="status"><span class="pulse" aria-hidden="true"></span><span class="status-text">Open to projects &amp; roles</span></span>
    <span class="clock mono" data-clock aria-label="Local time in New York">NYC --:--</span>
    <a href="/contact/" class="btn btn-sm" data-magnetic>${roll('Let’s talk')}</a>
    <button class="menu-btn" data-menu-btn aria-expanded="false" aria-controls="menu"><span></span><span></span><span class="sr-only">Menu</span></button>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav aria-label="Mobile">
    <a href="/" class="menu-link"><span class="mono">00</span>Home</a>
    ${nav.map((n, i) => `<a href="${n.href}" class="menu-link"><span class="mono">0${i + 1}</span>${n.label}</a>`).join('\n    ')}
  </nav>
  <div class="menu-foot">
    <a href="mailto:${site.email}">${site.email}</a>
    <div class="menu-social"><a href="${site.linkedin}" target="_blank" rel="noopener">LinkedIn</a><a href="${site.github}" target="_blank" rel="noopener">GitHub</a></div>
  </div>
</div>`;
}

function cta() {
  return `
<section class="cta" data-cta>
  <div class="wrap">
    <p class="eyebrow"><span class="dot"></span> Have a project or a role in mind?</p>
    <a href="/contact/" class="cta-title" data-cursor="Say hi">
      <span class="cta-line" data-split>Let’s build</span>
      <span class="cta-line" data-split><em class="serif">something</em> good.</span>
    </a>
    <div class="cta-row">
      <button class="copy" data-copy="${site.email}" type="button"><span class="mono">Email</span><span class="copy-text">${site.email}</span><span class="copy-hint mono" aria-live="polite">Copy</span></button>
      <a href="/contact/" class="btn btn-lg" data-magnetic>${roll('Start a project')} ${arrowRight}</a>
    </div>
  </div>
</section>`;
}

function footer() {
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <p class="mono muted">Based in</p>
        <p>${site.location}<br>Working worldwide</p>
      </div>
      <div>
        <p class="mono muted">Pages</p>
        <ul class="footer-links">
          <li><a href="/work/">Work</a></li><li><a href="/about/">About &amp; résumé</a></li><li><a href="/services/">Services</a></li><li><a href="/blog/">Writing</a></li><li><a href="/contact/">Contact</a></li>
        </ul>
      </div>
      <div>
        <p class="mono muted">Elsewhere</p>
        <ul class="footer-links">
          <li><a href="${site.linkedin}" target="_blank" rel="noopener">LinkedIn ${arrow}</a></li>
          <li><a href="${site.github}" target="_blank" rel="noopener">GitHub ${arrow}</a></li>
          <li><a href="mailto:${site.email}">Email ${arrow}</a></li>
        </ul>
      </div>
      <div class="footer-top">
        <button class="to-top mono" data-top type="button">Back to top ↑</button>
      </div>
    </div>
    <div class="footer-word" aria-hidden="true">Elombe Kisala</div>
    <div class="footer-base mono">
      <span>© ${new Date().getFullYear()} Elombe Kisala</span>
      <span>Designed &amp; built by hand. No templates.</span>
      <span><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></span>
    </div>
  </div>
</footer>`;
}

function page({ title, description, path, body, bodyClass = '', image, jsonld, preload, accent, showCta = true, preloader = false }) {
  const style = accent ? ` style="--cs:${accent}"` : '';
  return `${head({ title, description, path, image, jsonld, preload })}
<body class="${bodyClass}"${style}>
${preloader ? `<div class="preloader" data-preloader aria-hidden="true">
  <img class="preloader-logo" src="/assets/brand/ek-logo-192.webp" alt="" width="104" height="96">
  <iframe class="preloader-scene" data-src="https://my.spline.design/untitled-e42e33bdae89919f1af0a26b028a02f0/" title="Elombe Kisala 3D logo intro" tabindex="-1" loading="eager"></iframe>
</div>` : ''}
<div class="curtain" data-curtain aria-hidden="true"><img src="/assets/brand/ek-logo-192.webp" alt="" width="104" height="96"></div>
<div class="cursor" data-cursor-el aria-hidden="true"><span class="cursor-label" data-cursor-label></span></div>
${header(path)}
<main id="main">
${body}
${showCta ? cta() : ''}
</main>
${footer()}
<script src="/assets/vendor/gsap.min.js" defer></script>
<script src="/assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/vendor/SplitText.min.js" defer></script>
<script src="/assets/vendor/lenis.min.js" defer></script>
<script src="/assets/js/site.js?v=${ver('assets/js/site.js')}" defer></script>
</body>
</html>
`;
}

// ---------- shared pieces ----------
const tagList = tags => `<ul class="tags">${tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;

function workCard(p, i, { big = false } = {}) {
  return `<a href="/work/${p.slug}/" class="card${big ? ' card-big' : ''}" data-cursor="View" data-tags="${esc(p.tags.join('|'))}" style="--cs:${p.accent}" data-reveal>
  <div class="card-media">${img(big ? p.cover : small(p), `${p.title} website`, { sizes: big ? '(max-width: 900px) 100vw, 60vw' : '(max-width: 900px) 100vw, 50vw' })}</div>
  <div class="card-info">
    <span class="mono card-num">${String(i + 1).padStart(2, '0')}</span>
    <h3 class="card-title">${esc(p.title)}</h3>
    <span class="mono card-kind">${esc(p.kind)} · ${esc(p.year)}</span>
  </div>
  <p class="card-sum">${esc(p.summary)}</p>
</a>`;
}


const moreCard = m => `<a href="${m.url}" target="_blank" rel="noopener" class="more-card" data-cursor="${esc(m.cta)}" data-reveal>
  <div class="more-media">${img(m.img, `${m.title}`, { sizes: '(max-width: 680px) 100vw, (max-width: 980px) 50vw, 33vw' })}<span class="more-type mono">${esc(m.type)}</span></div>
  <div class="more-info"><h3>${esc(m.title)}</h3><span class="more-cta">${esc(m.cta)} ${arrow}<span class="sr-only"> (opens in a new tab)</span></span></div>
  <p class="mono more-kind">${esc(m.kind)}</p>
</a>`;

// ---------- home ----------
function home() {
  const featured = projects.filter(p => p.featured).sort((a, b) => a.featured - b.featured);
  const rest = projects.filter(p => !p.featured);
  const reelA = ['learn-lingala', 'people-of-spice', 'brooklyn-steel-co', 'winslow-pantry', 'thyme-and-table', 'built-by-me-ez'].map(s => bySlug[s]);
  const reelB = ['only-at-the-kiosk', 'fizz', 'manna-hydration', 'snooze-lane', 'swft-studios', 'tal-hydration'].map(s => bySlug[s]);
  const reelCol = (list, cls) => `<div class="reel-col ${cls}"><div class="reel-track">${[...list, ...list].map((p, i) => `<a href="/work/${p.slug}/" class="reel-item" tabindex="${i < list.length ? 0 : -1}"${i >= list.length ? ' aria-hidden="true"' : ''}>${img(small(p), i < list.length ? p.title : '', { sizes: '22vw', eager: i < 2 })}<span class="mono">${esc(p.title)}</span></a>`).join('')}</div></div>`;
  const brands = ['Core Home', 'Brooklyn Steel Co.', 'Manna', 'TAL', 'Thyme & Table', 'People of Spice', 'FIZZ', 'Winslow Pantry', 'Alder Meadow', 'Built By Me EZ', 'Blurred Lines', 'Roller Reels', 'KIOSK', 'SWFT Studios'];
  const totalCommits = Object.values(commits).length && 799;

  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow" data-hero-in><span class="dot"></span> Designer &amp; developer · Jersey City / NYC</p>
      <h1 class="display hero-title">
        <span class="line" data-split-hero>I design and build</span>
        <span class="line" data-split-hero>websites, <em class="serif">stores</em> &amp;</span>
        <span class="line" data-split-hero>apps that <em class="serif accent-text">earn</em></span>
        <span class="line" data-split-hero>their keep.</span>
      </h1>
      <p class="lead hero-lead" data-hero-in>I’m Elombe Kisala. I lead web development for Core Home’s family of consumer brands and run SWFT Studios. From Shopify storefronts to Cloudflare web apps and a native iOS app, I design the experience and engineer what’s behind it.</p>
      <div class="hero-actions" data-hero-in>
        <a href="/work/" class="btn btn-lg" data-magnetic>${roll('See the work')} ${arrowRight}</a>
        <a href="/contact/" class="btn btn-lg btn-ghost" data-magnetic>${roll('Start a project')}</a>
      </div>
    </div>
    <div class="hero-reel" aria-label="Recent projects">
      ${reelCol(reelA, 'up')}
      ${reelCol(reelB, 'down')}
    </div>
  </div>
  <div class="wrap hero-stats" data-hero-in>
    <div><span class="stat-num" data-count="${projects.length}">${projects.length}</span><span class="mono">case studies</span></div>
    <div><span class="stat-num" data-count="${totalCommits}">${totalCommits}</span><span class="mono">commits across 13 repos this year</span></div>
    <div><span class="stat-num" data-count="2019">2019</span><span class="mono">building for the web since</span></div>
    <div><span class="stat-num">Web · iOS</span><span class="mono">Shopify · Webflow · Cloudflare · Swift</span></div>
  </div>
</section>

<section class="marquee-band" aria-label="Brands I’ve worked with">
  <div class="marquee" data-marquee>
    <div class="marquee-track">${[...brands, ...brands].map((b, i) => `<span class="marquee-item${i % 2 ? ' outline' : ''}"${i >= brands.length ? ' aria-hidden="true"' : ''}>${esc(b)}</span><span class="marquee-star" aria-hidden="true">✦</span>`).join('')}</div>
  </div>
</section>

<section class="section work-feature" id="work">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow"><span class="dot"></span> Selected work · 2025–26</p>
      <h2 class="h2" data-split>Six projects, <em class="serif">from brief to build log.</em></h2>
      <p class="lead muted section-lead" data-reveal>Each case study covers the problem, what I built, how the pieces connect, what improved, and the real commit history behind it.</p>
    </div>
    <div class="stack">
      ${featured.map((p, i) => `
      <article class="stack-card" style="--cs:${p.accent}" data-stack>
        <a href="/work/${p.slug}/" class="stack-inner" data-cursor="Case study">
          <div class="stack-media">${p.video ? `<video src="${p.video.src}" poster="${p.video.poster}" muted loop playsinline preload="none" data-autoplay></video>` : img(p.cover, `${p.title} project`, { sizes: '(max-width: 900px) 100vw, 62vw' })}</div>
          <div class="stack-info">
            <div class="stack-top"><span class="mono">${String(i + 1).padStart(2, '0')} / ${String(featured.length).padStart(2, '0')}</span><span class="mono">${esc(p.kind)}</span></div>
            <h3 class="stack-title">${esc(p.title)}</h3>
            <p class="stack-sum">${esc(p.summary)}</p>
            ${p.metrics.length ? `<dl class="stack-metrics">${p.metrics.slice(0, 2).map(m => `<div><dt>${esc(m.value)}</dt><dd>${esc(m.label)}</dd></div>`).join('')}</dl>` : ''}
            <span class="stack-link">${roll('Read the case study')} ${arrowRight}</span>
          </div>
        </a>
      </article>`).join('')}
    </div>
  </div>
</section>

<section class="section index-section">
  <div class="wrap">
    <div class="section-head split-head">
      <p class="eyebrow"><span class="dot"></span> More projects</p>
      <h2 class="h2" data-split>Brands, stores <em class="serif">&amp; tools.</em></h2>
    </div>
    <ul class="index-list" data-index-list>
      ${rest.map((p, i) => `<li><a href="/work/${p.slug}/" class="index-row" data-preview="${small(p)}" data-reveal>
        <span class="mono index-num">${String(i + 7).padStart(2, '0')}</span>
        <span class="index-title">${esc(p.title)}</span>
        <span class="index-kind">${esc(p.kind)}</span>
        <span class="mono index-year">${esc(p.year)}</span>
        <span class="index-arrow">${arrow}</span>
      </a></li>`).join('')}
    </ul>
    <div class="index-preview" data-index-preview aria-hidden="true"><img alt="" src="${small(rest[0])}"></div>
  </div>
</section>

<section class="section more-section">
  <div class="wrap">
    <div class="section-head split-head">
      <div>
        <p class="eyebrow"><span class="dot"></span> Also live</p>
        <h2 class="h2" data-split>Sites, VR tours <em class="serif">&amp; 3D.</em></h2>
      </div>
      <a href="/work/#more" class="btn btn-ghost" data-magnetic>${roll('See all work')} ${arrowRight}</a>
    </div>
    <div class="more-grid">${more.slice(0, 6).map(moreCard).join('')}</div>
  </div>
</section>

<section class="section caps">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow"><span class="dot"></span> What I do</p>
      <h2 class="h2" data-split>One person from <em class="serif">first sketch</em> to <em class="serif">last commit.</em></h2>
    </div>
    <div class="caps-grid">
      ${capabilities.map(c => `<div class="cap" data-reveal>
        <span class="mono cap-n">${c.n}</span>
        <h3 class="cap-title">${c.title}</h3>
        <p>${c.text}</p>
        <ul class="cap-items">${c.items.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>`).join('')}
    </div>
  </div>
</section>

${toolkitSection()}

<section class="section process">
  <div class="wrap process-grid">
    <div class="process-head">
      <p class="eyebrow"><span class="dot"></span> How we’d work together</p>
      <h2 class="h2" data-split>A clear process, <em class="serif">no black box.</em></h2>
      <p class="lead muted" data-reveal>You see progress every week, and you own everything at the end: code, accounts, docs.</p>
    </div>
    <ol class="process-list">
      ${steps.map(s => `<li class="process-step" data-reveal><span class="mono">${s.n}</span><div><h3>${s.title}</h3><p>${s.text}</p></div></li>`).join('')}
    </ol>
  </div>
</section>

<section class="section voices">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow"><span class="dot"></span> Kind words</p>
      <h2 class="h2" data-split>From the people <em class="serif">I’ve built for.</em></h2>
    </div>
    <div class="quotes" data-quotes>
      ${testimonials.map(t => `<figure class="quote-card" data-reveal>
        <blockquote>“${esc(t.text)}”</blockquote>
        <figcaption><strong>${esc(t.name)}</strong><span class="mono">${esc(t.role)}</span></figcaption>
      </figure>`).join('')}
    </div>
  </div>
</section>`;

  return page({
    title: site.title,
    description: site.description,
    path: '/',
    body,
    bodyClass: 'is-home',
    preloader: true,
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'Person', name: site.name, url: site.url, email: site.email,
      jobTitle: 'Designer & Developer', address: { '@type': 'PostalAddress', addressLocality: 'Jersey City', addressRegion: 'NJ' },
      sameAs: [site.linkedin, site.github], knowsAbout: ['Web design', 'Shopify', 'Webflow', 'Cloudflare Workers', 'SwiftUI', 'Automation']
    }]
  });
}

function toolkitSection({ compact = false } = {}) {
  const cats = ['All', ...new Set(toolkit.map(t => t.cat))];
  return `
<section class="section paper toolkit" id="toolkit">
  <div class="wrap">
    <div class="section-head toolkit-head">
      <div>
        <p class="eyebrow"><span class="dot"></span> The toolkit</p>
        <h2 class="h2" data-split>The tools I use, <em class="serif">and what they do for you.</em></h2>
      </div>
      <p class="lead section-lead" data-reveal>I pick tools for the business, not the résumé. Here’s each one in plain terms, with the projects where it earned its place.</p>
    </div>
    <div class="filters" role="toolbar" aria-label="Filter tools" data-tool-filters>
      ${cats.map((c, i) => `<button type="button" class="filter${i === 0 ? ' is-on' : ''}" data-filter="${c}" aria-pressed="${i === 0}">${c}</button>`).join('')}
    </div>
    <div class="tools" data-tools>
      ${toolkit.map(t => `<article class="tool" data-cat="${t.cat}" data-reveal>
        <div class="tool-top"><span class="tool-mono" aria-hidden="true">${t.mono}</span><span class="mono tool-cat">${t.cat}</span></div>
        <h3 class="tool-name">${esc(t.name)}</h3>
        <p class="tool-benefit">${esc(t.benefit)}</p>
        ${t.used.length ? `<p class="tool-used"><span class="mono">Used in</span> ${t.used.map(s => `<a href="/work/${s}/">${esc(bySlug[s].title)}</a>`).join(', ')}</p>` : ''}
      </article>`).join('')}
    </div>
  </div>
</section>`;
}

// ---------- work index ----------
function workIndex() {
  const filters = ['All', 'Web app', 'Shopify', 'Brand site', 'iOS app', 'Automation', 'Core Home'];
  const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow" data-hero-in><span class="dot"></span> Work · ${projects.length} case studies</p>
    <h1 class="display" data-split-hero>Selected <em class="serif">work</em></h1>
    <p class="lead muted page-lead" data-hero-in>Web apps, Shopify stores, brand sites, internal tools and a native iOS app. Every case study is written from the project’s code and commit history.</p>
  </div>
</section>
<section class="section-sm">
  <div class="wrap">
    <div class="filters" role="toolbar" aria-label="Filter projects" data-work-filters>
      ${filters.map((f, i) => `<button type="button" class="filter${i === 0 ? ' is-on' : ''}" data-filter="${f}" aria-pressed="${i === 0}">${f} <span class="mono">${f === 'All' ? projects.length : projects.filter(p => p.tags.includes(f)).length}</span></button>`).join('')}
    </div>
    <div class="grid-work" data-work-grid>
      ${ordered.map((p, i) => workCard(p, i)).join('\n')}
    </div>
  </div>
</section>
<section class="section more-section" id="more">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow"><span class="dot"></span> More work · ${more.length} live links</p>
      <h2 class="h2" data-split>Websites, VR tours <em class="serif">&amp; 3D animation.</em></h2>
      <p class="lead muted section-lead" data-reveal>Earlier client sites, virtual tours built with Matterport and 3DVista, and 3D animation. Each opens the live project.</p>
    </div>
    <div class="more-grid">${more.map(moreCard).join('')}</div>
  </div>
</section>`;
  return page({ title: 'Work · Elombe Kisala', description: `Case studies from Elombe Kisala: ${projects.slice(0, 6).map(p => p.title).join(', ')} and more.`, path: '/work/', body, bodyClass: 'is-work' });
}

// ---------- case study ----------
function caseStudy(p, i) {
  const next = ordered[(ordered.indexOf(p) + 1) % ordered.length];
  const entries = commits[p.slug] || [];
  const meta = [
    ['Client', p.client], ['Role', p.role], ['Timeline', p.timeline], ['Platform', p.platform],
    ...(p.live ? [['Live', `<a href="${p.live.url}" target="_blank" rel="noopener" class="ulink">${esc(p.live.label)} ${arrow}</a>`]] : [['Access', 'Internal tool']])
  ];
  let n = 0;
  const label = t => `<div class="cs-label"><span class="mono">${String(++n).padStart(2, '0')}</span><h2>${t}</h2></div>`;

  const blocks = [];
  blocks.push(`<section class="cs-block">${label('The challenge')}<div class="cs-body prose-lg">${p.challenge.map(t => `<p data-reveal>${esc(t)}</p>`).join('')}</div></section>`);
  blocks.push(`<section class="cs-block">${label('The approach')}<div class="cs-body prose-lg">${p.approach.map(t => `<p data-reveal>${esc(t)}</p>`).join('')}</div></section>`);

  if (p.built?.length) blocks.push(`<section class="cs-block cs-wide">${label('What I built')}<div class="features">${p.built.map((b, k) => `<div class="feature" data-reveal><span class="mono">${String(k + 1).padStart(2, '0')}</span><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></div>`).join('')}</div></section>`);

  if (p.flow?.length) blocks.push(`<section class="cs-block cs-wide">${label('How it fits together')}<ol class="flow" data-flow>${p.flow.map((f, k) => `<li class="flow-node"><span class="mono flow-k">${String(k + 1).padStart(2, '0')}</span><strong>${esc(f.label)}</strong><span>${esc(f.note)}</span></li>`).join('')}</ol></section>`);

  const gallery = p.gallery?.length ? `<section class="cs-gallery wrap">${p.gallery.map(g => g.frame === 'phone'
    ? `<figure class="frame-phone" data-reveal><div class="phone">${img(g.src, g.alt, { sizes: '(max-width: 900px) 70vw, 360px' })}</div><figcaption class="mono">${esc(g.alt)}</figcaption></figure>`
    : `<figure class="frame-desktop" data-reveal><div class="browser"><div class="browser-bar"><i></i><i></i><i></i><span class="mono">${esc(p.live?.label || p.title)}</span></div>${img(g.src, g.alt, { sizes: '(max-width: 900px) 100vw, 80vw' })}</div><figcaption class="mono">${esc(g.alt)}</figcaption></figure>`).join('')}</section>` : '';

  if (p.improved?.length) blocks.push(`<section class="cs-block cs-wide">${label('What improved')}<div class="compare"><div class="compare-head mono"><span>Before</span><span>After</span></div>${p.improved.map(c => `<div class="compare-row" data-reveal><span class="before">${esc(c.before)}</span><span class="after">${esc(c.after)}</span></div>`).join('')}</div></section>`);

  if (p.stack?.length) blocks.push(`<section class="cs-block">${label('Stack &amp; why')}<ul class="stack-why">${p.stack.map(s => `<li data-reveal><strong>${esc(s.name)}</strong><span>${esc(s.why)}</span></li>`).join('')}</ul></section>`);

  if (p.log && entries.length) blocks.push(`<section class="cs-block">${label('Build log')}<div class="log">
    <p class="log-sum" data-reveal><span class="mono">${p.log.commits} commits · ${esc(p.log.span)}</span><span class="muted">Highlights from the repository’s commit history, in the original words.</span></p>
    <ol class="log-list">${entries.map(e => `<li data-reveal><time class="mono" datetime="${e.date}">${fmtDate(e.date)}</time><code>${esc(e.text)}</code></li>`).join('')}</ol>
  </div></section>`);

  const metrics = p.metrics?.length ? `<section class="cs-metrics wrap"><dl class="metrics">${p.metrics.map(m => `<div data-reveal><dt>${esc(m.value)}</dt><dd>${esc(m.label)}</dd></div>`).join('')}</dl></section>` : '';
  const quote = p.quote ? `<section class="cs-quote wrap"><figure data-reveal><blockquote class="serif">“${esc(p.quote.text)}”</blockquote><figcaption><strong>${esc(p.quote.name)}</strong><span class="mono">${esc(p.quote.role)}</span></figcaption></figure></section>` : '';
  const coverMedia = p.video
    ? `<video src="${p.video.src}" poster="${p.cover}" muted loop playsinline autoplay preload="metadata" aria-label="${esc(p.title)} motion preview"></video>`
    : img(p.cover, `${p.title}: homepage`, { eager: true, sizes: '100vw' });

  // Split blocks so the gallery sits after the build section.
  const firstHalf = blocks.slice(0, 4).join('');
  const secondHalf = blocks.slice(4).join('');

  const body = `
<article class="cs">
  <header class="cs-hero">
    <div class="wrap">
      <a href="/work/" class="back mono" data-hero-in>← All work</a>
      <p class="eyebrow" data-hero-in><span class="dot cs-dot"></span> ${esc(p.kind)} · ${esc(p.year)}</p>
      <h1 class="display cs-title" data-split-hero>${esc(p.title)}</h1>
      <p class="cs-summary" data-hero-in>${esc(p.intro)}</p>
      ${tagList(p.tags)}
      <dl class="cs-meta" data-hero-in>${meta.map(([k, v]) => `<div><dt class="mono">${k}</dt><dd>${k === 'Live' ? v : esc(v)}</dd></div>`).join('')}</dl>
    </div>
  </header>
  <figure class="cs-cover" data-cover>
    <div class="cs-cover-inner" data-parallax>${coverMedia}</div>
  </figure>
  ${metrics}
  <div class="wrap cs-content">${firstHalf}</div>
  ${gallery}
  <div class="wrap cs-content">${secondHalf}</div>
  ${quote}
  <nav class="next" aria-label="Next project">
    <a href="/work/${next.slug}/" class="next-link" style="--cs:${next.accent}" data-cursor="Next">
      <span class="mono">Next project</span>
      <span class="next-title">${esc(next.title)}</span>
      <span class="next-media">${img(small(next), '', { sizes: '40vw' })}</span>
    </a>
  </nav>
</article>`;

  return page({
    title: `${p.title}: case study · Elombe Kisala`,
    description: p.summary,
    path: `/work/${p.slug}/`,
    image: small(p),
    preload: p.video ? [] : [p.cover],
    accent: p.accent,
    bodyClass: 'is-case',
    body,
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'CreativeWork', name: `${p.title} case study`, about: p.summary,
      author: { '@type': 'Person', name: site.name, url: site.url }, image: site.url + p.cover, url: `${site.url}/work/${p.slug}/`,
      ...(p.live ? { sameAs: p.live.url } : {})
    }]
  });
}

// ---------- about ----------
function about() {
  const skills = [
    ['Design', 'Figma, art direction, UI/UX, design systems, prototyping, Google Stitch'],
    ['Front end', 'HTML, CSS, JavaScript, TypeScript, GSAP, Lenis, Three.js, Lottie, Barba, Vite'],
    ['Platforms', 'Webflow, Shopify (Liquid, themes, Admin API), WordPress'],
    ['Back end', 'Cloudflare Workers, Pages, D1, KV, R2, Email; Firebase; Node'],
    ['Mobile', 'Swift 6, SwiftUI, MapKit, HealthKit, RevenueCat'],
    ['Integrations', 'Stripe, Airtable, Cal.com, Twilio, Spotify, Claude API, Make, Zapier'],
    ['Growth', 'SEO & schema, GA4, Google Tag Manager, PostHog, email & SMS marketing'],
    ['Content', 'Premiere Pro, After Effects, Lightroom, Matterport, 3DVista']
  ];
  const body = `
<section class="page-hero about-hero">
  <div class="wrap about-grid">
    <div>
      <p class="eyebrow" data-hero-in><span class="dot"></span> About · Résumé</p>
      <h1 class="display" data-split-hero>Hi, I’m <em class="serif">Elombe.</em></h1>
      <div class="prose-lg about-intro" data-hero-in>
        <p>I’m a designer and developer in Jersey City with a bachelor’s in Mobile Development from Full Sail University. I started building websites in 2019 for family and friends, and I haven’t stopped since.</p>
        <p>Today I lead web development for <a class="ulink" href="/work/core-home/">Core Home</a>, where I run Shopify storefronts, launch brand sites and build internal tools for a portfolio of consumer brands. I also founded <a class="ulink" href="/work/swft-studios/">SWFT Studios</a>, and ship products of my own, like the iOS app <a class="ulink" href="/work/snooze-lane/">Snooze Lane</a> and <a class="ulink" href="/work/learn-lingala/">Learn Lingala</a>.</p>
        <p>What sets my work apart is range: I can direct the look, write the code, wire up payments and automation, and shoot the video. One person, one vision, no hand-offs.</p>
      </div>
      <div class="hero-actions" data-hero-in>
        <a href="/contact/" class="btn btn-lg" data-magnetic>${roll('Get in touch')} ${arrowRight}</a>
        <button type="button" class="btn btn-lg btn-ghost" data-print>${roll('Save résumé as PDF')}</button>
      </div>
    </div>
    <figure class="about-photo" data-reveal>${img('/assets/work/about/portrait.webp', 'Portrait of Elombe Kisala', { eager: true, sizes: '(max-width: 900px) 100vw, 40vw' })}</figure>
  </div>
</section>

<section class="section-sm">
  <div class="wrap">
    <dl class="metrics about-metrics">
      <div data-reveal><dt>2019</dt><dd>building for the web since</dd></div>
      <div data-reveal><dt>${projects.length}+</dt><dd>case studies on this site</dd></div>
      <div data-reveal><dt>799</dt><dd>commits across 13 repos this year</dd></div>
      <div data-reveal><dt>Web + iOS</dt><dd>shipped on both</dd></div>
    </dl>
  </div>
</section>

<section class="section">
  <div class="wrap cs-content">
    <section class="cs-block">
      <div class="cs-label"><span class="mono">01</span><h2>Experience</h2></div>
      <ol class="timeline">
        ${experience.map(e => `<li data-reveal><div class="tl-head"><h3>${e.role}, <span class="muted">${e.org}</span></h3><span class="mono">${e.when}</span></div>${e.where ? `<p class="mono tl-where">${e.where}</p>` : ''}<p>${e.text}</p></li>`).join('')}
      </ol>
    </section>
    <section class="cs-block">
      <div class="cs-label"><span class="mono">02</span><h2>Education</h2></div>
      <ol class="timeline">
        ${education.map(e => `<li data-reveal><div class="tl-head"><h3>${e.school}</h3><span class="mono">${e.when}</span></div><p>${e.degree}${e.note ? ` · ${e.note}` : ''}</p></li>`).join('')}
      </ol>
    </section>
    <section class="cs-block">
      <div class="cs-label"><span class="mono">03</span><h2>Skills</h2></div>
      <dl class="skills">${skills.map(([k, v]) => `<div data-reveal><dt class="mono">${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    </section>
    <section class="cs-block">
      <div class="cs-label"><span class="mono">04</span><h2>Roles I’m a fit for</h2></div>
      <div class="cs-body prose-lg"><p data-reveal>Front-end or full-stack web developer, Shopify developer, design engineer, creative technologist, and product-minded developer roles on web or iOS teams. Freelance and contract projects welcome.</p></div>
    </section>
    <section class="cs-block">
      <div class="cs-label"><span class="mono">05</span><h2>Selected projects</h2></div>
      <ul class="mini-list">${ordered.slice(0, 10).map(p => `<li data-reveal><a href="/work/${p.slug}/"><strong>${esc(p.title)}</strong><span>${esc(p.summary)}</span></a></li>`).join('')}</ul>
    </section>
  </div>
</section>
${toolkitSection()}`;
  return page({
    title: 'About & résumé · Elombe Kisala', description: 'Elombe Kisala: designer and developer in Jersey City. Experience at Core Home and SWFT Studios, skills, tools and selected projects.',
    path: '/about/', body, bodyClass: 'is-about',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'ProfilePage', mainEntity: { '@type': 'Person', name: site.name, url: site.url, email: site.email, sameAs: [site.linkedin, site.github], jobTitle: 'Web Developer', worksFor: { '@type': 'Organization', name: 'Core Home' }, alumniOf: { '@type': 'CollegeOrUniversity', name: 'Full Sail University' } } }]
  });
}

// ---------- contact ----------
function contact(path = '/contact/') {
  const types = ['Website', 'Shopify store', 'Web app', 'iOS app', 'Automation', 'Hiring / full-time role', 'Something else'];
  const body = `
<section class="page-hero contact-hero">
  <div class="wrap contact-grid">
    <div>
      <p class="eyebrow" data-hero-in><span class="dot"></span> Contact</p>
      <h1 class="display" data-split-hero>Tell me what <em class="serif">you’re building.</em></h1>
      <p class="lead muted" data-hero-in>Projects, roles or a quick question. I reply within one business day.</p>
      <div class="contact-direct" data-hero-in>
        <button class="copy" data-copy="${site.email}" type="button"><span class="mono">Email</span><span class="copy-text">${site.email}</span><span class="copy-hint mono" aria-live="polite">Copy</span></button>
        <a class="direct-link" href="${site.linkedin}" target="_blank" rel="noopener"><span class="mono">LinkedIn</span>Connect ${arrow}</a>
        <a class="direct-link" href="${site.github}" target="_blank" rel="noopener"><span class="mono">GitHub</span>See the code ${arrow}</a>
      </div>
      <ol class="next-steps" data-reveal>
        <li><span class="mono">01</span>You send a few details.</li>
        <li><span class="mono">02</span>I reply within a business day with questions or a time to talk.</li>
        <li><span class="mono">03</span>You get a written scope, timeline and price.</li>
      </ol>
    </div>
    <form class="form" data-contact-form action="https://formsubmit.co/${site.email}" method="POST" data-hero-in>
      <input type="hidden" name="_subject" value="New inquiry from elombekisala.com">
      <input type="hidden" name="_template" value="table">
      <input type="hidden" name="_captcha" value="false">
      <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <fieldset class="field">
        <legend class="mono">What can I help with?</legend>
        <div class="chips">${types.map((t, k) => `<label class="chip"><input type="checkbox" name="interest" value="${t}"${k === 0 ? '' : ''}><span>${t}</span></label>`).join('')}</div>
      </fieldset>
      <div class="field-row">
        <label class="field"><span class="mono">Your name</span><input name="name" autocomplete="name" required></label>
        <label class="field"><span class="mono">Email</span><input name="email" type="email" autocomplete="email" required></label>
      </div>
      <div class="field-row">
        <label class="field"><span class="mono">Company or website <i>(optional)</i></span><input name="company" autocomplete="organization"></label>
        <label class="field"><span class="mono">Budget <i>(optional)</i></span>
          <select name="budget"><option value="">Select a range</option><option>Under $2,500</option><option>$2,500 – $7,500</option><option>$7,500 – $15,000</option><option>$15,000+</option><option>Not sure yet</option><option>It’s a job opening</option></select>
        </label>
      </div>
      <label class="field"><span class="mono">Tell me about it</span><textarea name="message" rows="5" required placeholder="What you’re building, who it’s for, and when you’d like to launch."></textarea></label>
      <div class="form-foot">
        <button class="btn btn-lg" type="submit" data-magnetic>${roll('Send message')} ${arrowRight}</button>
        <p class="form-status" role="status" data-form-status></p>
      </div>
    </form>
  </div>
</section>`;
  return page({ title: 'Contact · Elombe Kisala', description: 'Start a project or talk about a role with Elombe Kisala, designer and developer in Jersey City / NYC. Replies within one business day.', path, body, bodyClass: 'is-contact', showCta: false });
}

// ---------- services ----------
function services() {
  const offers = [
    { title: 'Websites', slug: '/services/webflow/', text: 'Custom-designed sites in Webflow or hand-coded on Cloudflare. Fast, accessible, easy to update, built to convert.', proof: ['built-by-me-ez', 'winslow-pantry', 'people-of-spice'] },
    { title: 'Shopify stores', slug: '/services/shopify-webflow/', text: 'Theme design and development, catalog structure, launches and the support content owners need.', proof: ['brooklyn-steel-co', 'thyme-and-table', 'fizz'] },
    { title: 'Web & iOS apps', slug: '/contact/', text: 'Products with accounts, payments, data and AI, from an MVP to App Store-ready.', proof: ['learn-lingala', 'snooze-lane', 'finish-library'] },
    { title: 'Automation', slug: '/services/automation/', text: 'Payments, booking, CRM and follow-up connected, so leads never fall through the cracks.', proof: ['built-by-me-ez', 'swft-studios', 'core-home-reports'] }
  ];
  const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow" data-hero-in><span class="dot"></span> Services</p>
    <h1 class="display" data-split-hero>Design, build, <em class="serif">automate.</em></h1>
    <p class="lead muted page-lead" data-hero-in>For founders, brands and teams who want one capable person from first idea to launch, and after.</p>
  </div>
</section>
<section class="section-sm">
  <div class="wrap">
    <div class="offers">
      ${offers.map((o, k) => `<article class="offer" data-reveal>
        <span class="mono">${String(k + 1).padStart(2, '0')}</span>
        <h2>${o.title}</h2>
        <p>${o.text}</p>
        <p class="offer-proof"><span class="mono">See it in</span> ${o.proof.map(s => `<a href="/work/${s}/">${esc(bySlug[s].title)}</a>`).join(', ')}</p>
        <a href="${o.slug}" class="ulink">${o.slug === '/contact/' ? 'Talk about an app' : 'Details'} ${arrowRight}</a>
      </article>`).join('')}
    </div>
  </div>
</section>
<section class="section process">
  <div class="wrap process-grid">
    <div class="process-head">
      <p class="eyebrow"><span class="dot"></span> Process</p>
      <h2 class="h2" data-split>How a project <em class="serif">runs.</em></h2>
    </div>
    <ol class="process-list">${steps.map(s => `<li class="process-step" data-reveal><span class="mono">${s.n}</span><div><h3>${s.title}</h3><p>${s.text}</p></div></li>`).join('')}</ol>
  </div>
</section>
${toolkitSection()}`;
  return page({ title: 'Services · Elombe Kisala', description: 'Websites, Shopify stores, web and iOS apps, and automation by Elombe Kisala, with links to the case studies that prove each one.', path: '/services/', body, bodyClass: 'is-services' });
}

// ---------- blog ----------
function blogIndex() {
  const list = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow" data-hero-in><span class="dot"></span> Writing</p>
    <h1 class="display" data-split-hero>Notes on <em class="serif">the craft.</em></h1>
    <p class="lead muted page-lead" data-hero-in>Short, practical guides on platforms, SEO and automation.</p>
  </div>
</section>
<section class="section-sm">
  <div class="wrap">
    <ul class="index-list posts">
      ${list.map(p => `<li><a href="${p.url}" class="index-row post-row" data-reveal>
        <span class="mono index-num">${fmtDate(p.date)}</span>
        <span class="index-title">${esc(p.title)}</span>
        <span class="index-kind">${esc(p.summary)}</span>
        <span class="mono index-year">${esc(p.category)}</span>
        <span class="index-arrow">${arrow}</span>
      </a></li>`).join('')}
    </ul>
  </div>
</section>`;
  return page({ title: 'Writing · Elombe Kisala', description: 'Practical guides on Webflow, Shopify, SEO and automation by Elombe Kisala.', path: '/blog/', body });
}

// Legacy content pages (services detail, blog posts, legal) re-wrapped in the new layout.
function legacyPages() {
  const dir = join(ROOT, 'src/content/pages');
  for (const f of readdirSync(dir)) {
    const raw = readFileSync(join(dir, f), 'utf8');
    const meta = JSON.parse(raw.match(/<!--META (.*?) -->/)[1]);
    let html = raw.replace(/<!--META .*? -->\n/, '');
    const isPost = meta.path.startsWith('/blog/');
    const title = meta.title.replace(/ — Blog \| Elombe Kisala$| — Elombe Kisala( \| Designer & Developer)?$/, '');
    // Keep the content, swap the outer wrappers for the article layout.
    html = html.replace(/<(section|article) class="ek-section">\s*<div class="ek-container[^"]*">/g, '').replace(/<\/div>\s*<\/(section|article)>/g, '');
    html = html.replace(/<p><a href="\/blog\/">Blog<\/a><\/p>/, '').replace(/<h1>[\s\S]*?<\/h1>/, '');
    const dateMatch = html.match(/<p class="ek-blog-meta">([\s\S]*?)<\/p>/);
    html = html.replace(/<p class="ek-blog-meta">[\s\S]*?<\/p>/, '');
    html = html.replace(/<a href="[^"]*" class="ek-btn[^"]*">[\s\S]*?<\/a>/g, '');
    html = html.replace(/ class="ek-prose"/g, '');
    const body = `
<article class="article">
  <header class="page-hero article-hero">
    <div class="wrap narrow">
      <a href="${isPost ? '/blog/' : meta.path.startsWith('/services/') ? '/services/' : '/'}" class="back mono" data-hero-in>← ${isPost ? 'All writing' : meta.path.startsWith('/services/') ? 'All services' : 'Home'}</a>
      ${dateMatch ? `<p class="eyebrow" data-hero-in><span class="dot"></span> ${dateMatch[1].trim()}</p>` : ''}
      <h1 class="h1" data-split-hero>${esc(title)}</h1>
    </div>
  </header>
  <div class="wrap narrow prose" data-reveal>
    ${html.trim()}
  </div>
</article>`;
    write(meta.path.slice(1) + 'index.html', page({ title: `${title} · Elombe Kisala`, description: meta.description, path: meta.path, body, jsonld: meta.jsonld || [] }));
  }
}

function notFound() {
  const body = `
<section class="page-hero notfound">
  <div class="wrap">
    <p class="eyebrow" data-hero-in><span class="dot"></span> Error 404</p>
    <h1 class="display" data-split-hero>This page <em class="serif">took a wrong turn.</em></h1>
    <p class="lead muted page-lead" data-hero-in>The link may be old, or the page may have moved. The work is still here.</p>
    <div class="hero-actions" data-hero-in><a href="/" class="btn btn-lg">${roll('Go home')}</a><a href="/work/" class="btn btn-lg btn-ghost">${roll('See the work')}</a></div>
  </div>
</section>`;
  return page({ title: 'Page not found · Elombe Kisala', description: 'This page could not be found.', path: '/404', body, showCta: false });
}

function sitemap() {
  const urls = ['/', '/work/', ...projects.map(p => `/work/${p.slug}/`), '/about/', '/services/', '/services/webflow/', '/services/shopify-webflow/', '/services/automation/', '/contact/', '/blog/', ...posts.map(p => p.url), '/privacy/', '/terms/'];
  const today = new Date().toISOString().slice(0, 10);
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${site.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  write('llms.txt', `# ${site.name}, Designer & Developer

> Designer and full-stack developer in Jersey City / NYC. Leads web development for Core Home's consumer brands and founded SWFT Studios. Builds websites (Webflow, Cloudflare), Shopify stores, web apps (Cloudflare Workers, D1, Claude API) and native iOS apps (SwiftUI).

## Case studies
${ordered.map(p => `- [${p.title}](${site.url}/work/${p.slug}/): ${p.summary}`).join('\n')}

## Pages
- [About & résumé](${site.url}/about/)
- [Services](${site.url}/services/)
- [Contact](${site.url}/contact/)
- [Writing](${site.url}/blog/)

## Contact
- Email: ${site.email}
- LinkedIn: ${site.linkedin}
- GitHub: ${site.github}
`);
}

// ---------- run ----------
write('index.html', home());
write('work/index.html', workIndex());
projects.forEach((p, i) => write(`work/${p.slug}/index.html`, caseStudy(p, i)));
write('about/index.html', about());
write('contact/index.html', contact());
write('start/index.html', contact('/start/').replace(`<link rel="canonical" href="${site.url}/start/">`, `<link rel="canonical" href="${site.url}/contact/">`));
write('services/index.html', services());
write('blog/index.html', blogIndex());
legacyPages();
write('404.html', notFound());
sitemap();
console.log(`Built ${projects.length} case studies and ${7 + readdirSync(join(ROOT, 'src/content/pages')).length} other pages.`);
