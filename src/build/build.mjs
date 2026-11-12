// Generates the site's HTML from the data in src/build/data and the page
// fragments in src/content/pages. Run: npm run build
// Output is plain static HTML committed to the repo (no build step on deploy).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { projects, more } from './data/projects.mjs';
import { traits, STYLES } from '../../assets/js/bonsai-traits.mjs';
import { readFileSync as readJSON } from 'node:fs';
const branchData = JSON.parse(readJSON(new URL('./data/branches.json', import.meta.url), 'utf8'));
import { site, nav, toolkit, capabilities, experience, education, testimonials, process as steps } from './data/site.mjs';
import { groups, services } from './data/services.mjs';
import { art, preview } from './data/art.mjs';

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
  <meta name="theme-color" content="#121310" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#ebe5d8" media="(prefers-color-scheme: light)">
  <meta name="color-scheme" content="dark light">
  <link rel="icon" href="/assets/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="preload" href="/fonts/Satoshi-Variable.woff2" as="font" type="font/woff2" crossorigin>
  ${preload.map(p => `<link rel="preload" href="${p}" as="image" fetchpriority="high">`).join('\n  ')}
  <link rel="stylesheet" href="/assets/css/site.css?v=${ver('assets/css/site.css')}">
  <script>
    (function(d){var h=d.documentElement;h.classList.add('js');
    var t;try{t=localStorage.getItem('ek-theme')}catch(e){}if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';h.setAttribute('data-theme',t);
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)h.classList.add('motion');
    var arr=false;try{arr=!!sessionStorage.getItem('ek-transition')}catch(e){}if(arr)h.classList.add('is-arriving');
    if((location.pathname==='/'||location.pathname==='/index.html')&&!arr)h.classList.add('show-intro');
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
    <a href="/contact/" class="btn btn-sm btn-outline header-cta" data-magnetic>${roll('Start a project')}</a>
    <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch color theme">
      <span class="tt-knob" aria-hidden="true">
        <svg class="tt-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        <svg class="tt-moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
      </span>
    </button>
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
    <p class="eyebrow">Have a project or a role in mind?</p>
    <a href="/contact/" class="cta-title" data-cursor="Say hi">
      <span class="cta-line" data-split>Let’s build</span>
      <span class="cta-line" data-split><em class="em">something</em> good.</span>
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
    <div class="footer-top-row">
      <a href="/" class="footer-brand" aria-label="${site.name}, home"><img src="/assets/brand/ek-logo-192.webp" alt="" width="104" height="96"><span>Elombe Kisala</span></a>
      <div class="footer-pitch">
        <p>Design and engineering for brands, from first sketch to launch.</p>
        <a href="mailto:${site.email}" class="footer-email">${site.email}</a>
      </div>
    </div>
    <div class="footer-grid">
      <div>
        <p class="mono label">sitemap</p>
        <ul class="footer-links">
          <li><a href="/work/">Work</a></li><li><a href="/garden/">Garden</a></li><li><a href="/services/">Services</a></li><li><a href="/about/">About &amp; résumé</a></li><li><a href="/blog/">Writing</a></li><li><a href="/contact/">Start a project</a></li>
        </ul>
      </div>
      <div>
        <p class="mono label">elsewhere</p>
        <ul class="footer-links">
          <li><a href="${site.linkedin}" target="_blank" rel="noopener">LinkedIn ${arrow}</a></li>
          <li><a href="${site.github}" target="_blank" rel="noopener">GitHub ${arrow}</a></li>
          <li><a href="mailto:${site.email}">Email ${arrow}</a></li>
        </ul>
      </div>
      <div>
        <p class="mono label">based</p>
        <ul class="footer-links plain">
          <li><span class="pulse" aria-hidden="true"></span> Jersey City, NJ</li>
          <li class="muted" data-clock data-clock-suffix=" ET">--:--</li>
          <li class="muted">Working with teams anywhere</li>
        </ul>
      </div>
      <div>
        <p class="mono label">availability</p>
        <ul class="footer-links plain">
          <li>Open to freelance projects and full-time roles.</li>
          <li class="muted">Replies within one business day.</li>
        </ul>
      </div>
    </div>
    <div class="footer-base mono">
      <span>© ${new Date().getFullYear()} Elombe Kisala</span>
      <span>Designed &amp; built by hand</span>
      <span><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <button class="to-top" data-top type="button">Back to top ↑</button></span>
    </div>
  </div>
</footer>`;
}

function page({ title, description, path, body, bodyClass = '', image, jsonld, preload, accent, showCta = true, preloader = false }) {
  const style = accent ? ` style="--cs:${accent}"` : '';
  return `${head({ title, description, path, image, jsonld, preload })}
<body class="${bodyClass}"${style}>
${preloader ? `<div class="preloader" data-preloader>
  <img class="preloader-logo" src="/assets/brand/ek-logo-192.webp" alt="" width="104" height="96">
  <iframe class="preloader-scene" data-src="https://my.spline.design/untitled-e42e33bdae89919f1af0a26b028a02f0/" title="Elombe Kisala 3D logo intro" tabindex="-1" aria-hidden="true"></iframe>
  <button type="button" class="preloader-skip mono" data-intro-skip>skip intro</button>
</div>
<script>
/* 3D logo intro: runs on its own, before the page scripts load. The original
   site's timing: the scene plays ~4.4s after it loads, then fades over 0.6s. */
(function () {
  var h = document.documentElement, p = document.querySelector('[data-preloader]');
  if (!p) return;
  if (!h.classList.contains('show-intro')) { p.remove(); return; }
  var f = p.querySelector('iframe'), done = false, t;
  function end() {
    if (done) return; done = true; clearTimeout(t);
    p.classList.add('is-leaving');
    setTimeout(function () { p.remove(); h.classList.remove('show-intro'); document.dispatchEvent(new Event('ek:intro-done')); }, 600);
  }
  f.addEventListener('load', function () { p.classList.add('is-scene-ready'); clearTimeout(t); t = setTimeout(end, 4400); });
  f.src = f.getAttribute('data-src');
  t = setTimeout(end, 9000); // never hold the page if the scene can't load
  p.addEventListener('click', end);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') end(); });
})();
</script>` : ''}
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

const groupLabel = id => groups.find(g => g.id === id).label;
const svcCard = (sv, i) => `<a href="/services/${sv.slug}/" class="svc-card" data-group="${sv.group}" data-draw>
  <div class="svc-art">${art[sv.art]()}<span class="mono svc-fig">fig. ${String(i + 1).padStart(2, '0')} · ${esc(sv.fig)}</span>${sv.isNew ? '<span class="mono svc-new">new</span>' : ''}</div>
  <div class="svc-body">
    <div class="svc-meta mono"><span>${String(i + 1).padStart(2, '0')}</span><span>// ${esc(groupLabel(sv.group).toLowerCase())}</span></div>
    <h3 class="svc-title">${esc(sv.title)} <span class="svc-arrow">${arrowRight}</span></h3>
    <p>${esc(sv.short)}</p>
  </div>
</a>`;

const groupRow = (asButtons) => `<div class="group-row" ${asButtons ? 'role="toolbar" aria-label="Filter services" data-svc-filters' : ''}>
  ${asButtons ? `<button type="button" class="group-cell is-on" data-filter="All" aria-pressed="true"><span>All</span><span class="mono">${services.length} services</span></button>` : ''}
  ${groups.map(g => {
    const n = services.filter(x => x.group === g.id).length;
    return asButtons
      ? `<button type="button" class="group-cell" data-filter="${g.id}" aria-pressed="false"><span>${g.label} <span class="svc-arrow">${arrowRight}</span></span><span class="mono">${g.id === 'partner' ? 'alongside your team' : n + (n === 1 ? ' service' : ' services')}</span></button>`
      : `<a href="/services/#${g.id}" class="group-cell"><span>${g.label} <span class="svc-arrow">${arrowRight}</span></span><span class="mono">${g.id === 'partner' ? 'alongside your team' : n + (n === 1 ? ' service' : ' services')}</span></a>`;
  }).join('')}
</div>`;

function editorSection() {
  const featured = projects.filter(p => p.featured).sort((a, b) => a.featured - b.featured);
  const base = f => f.split('/').pop();
  return `
<section class="editor-section" id="work" data-editor style="--files:${featured.length}">
  <div class="editor-pin" data-editor-pin>
    <div class="wrap">
      <div class="editor-head">
        <div>
          <p class="eyebrow">selected work</p>
          <h2 class="h2">Selected <em class="em">work.</em></h2>
        </div>
        <p class="mono muted hide-sm">// one file per project</p>
      </div>
      <div class="editor">
        <div class="editor-tabs" role="tablist" aria-label="Selected projects">
          ${featured.map((p, i) => `<button type="button" role="tab" class="editor-tab" id="tab-${p.slug}" aria-controls="pane-${p.slug}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${i}" data-file="${esc(p.slug + '/' + p.file)}"><span class="tab-dot" aria-hidden="true"></span><span class="tab-title">${esc(p.title)}</span><span class="mono tab-file">${esc(base(p.file))}</span></button>`).join('')}
        </div>
        <div class="editor-panes">
          ${featured.map((p, i) => `<div class="editor-pane${i === 0 ? ' is-active' : ''}" role="tabpanel" id="pane-${p.slug}" aria-labelledby="tab-${p.slug}" data-pane="${i}" style="--cs:${p.accent}"${i === 0 ? '' : ' hidden'}>
            <div class="editor-code">
              <ol class="code-lines">
                <li><span class="mono muted">// result</span></li>
                <li><p class="code-result">${esc(p.result)}</p></li>
                <li><p class="code-sub"># ${esc(p.kind)} · <span class="muted">${esc(p.client)}</span></p></li>
                <li><p class="code-desc">${esc(p.summary)}</p></li>
                <li><dl class="code-kv mono"><div><dt>type</dt><dd>${esc(p.kind)}</dd></div><div><dt>stack</dt><dd>${esc(p.stack.slice(0, 3).map(x => x.name.split(' (')[0].split(' / ')[0]).join(', '))}</dd></div><div><dt>year</dt><dd>${esc(p.year)}</dd></div></dl></li>
                <li><a href="/work/${p.slug}/" class="btn btn-ghost" data-magnetic>${roll('Case study')} ${arrowRight}</a></li>
              </ol>
            </div>
            <div class="editor-preview">
              <p class="mono muted">// preview</p>
              <div class="preview-stage">
                <div class="preview-shot"><div class="browser-bar"><i></i><i></i><i></i></div>${img(small(p), `${p.title} screenshot`, { sizes: '(max-width: 980px) 60vw, 24vw' })}</div>
                <div class="preview-art" data-draw>${preview[p.slug]()}</div>
              </div>
            </div>
          </div>`).join('')}
        </div>
        <div class="editor-status mono">
          <span>main · <span data-editor-file>${esc(featured[0].slug + '/' + featured[0].file)}</span></span>
          <span class="status-right"><span data-editor-count>01 / ${String(featured.length).padStart(2, '0')}</span><span class="status-bar" aria-hidden="true"><i data-editor-bar></i></span><span class="hide-sm">scroll to open the next file ·</span> <a href="#after-work" class="skip-link" data-editor-skip>skip ↓</a></span>
        </div>
      </div>
    </div>
  </div>
</section>
<div id="after-work"></div>`;
}

function servicesTeaser() {
  return `
<section class="section services-teaser">
  <div class="wrap">
    <div class="section-head two-col">
      <div>
        <p class="eyebrow">services</p>
        <h2 class="h2" data-split>Four ways I help. <em class="em">Twelve things I build.</em></h2>
      </div>
      <p class="lead section-lead" data-reveal>Build it from scratch, connect the tools you already use, improve what’s live, or have me join your team for a while.</p>
    </div>
    ${groupRow(false)}
    <div class="svc-grid">${services.slice(0, 6).map(svcCard).join('')}</div>
    <div class="center-row"><a href="/services/" class="btn btn-ghost btn-lg" data-magnetic>${roll('All twelve services')} ${arrowRight}</a></div>
  </div>
</section>`;
}

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
      <p class="eyebrow" data-hero-in>Designer &amp; developer · Jersey City / NYC</p>
      <h1 class="display hero-title">
        <span class="line" data-split-hero>I design and build</span>
        <span class="line" data-split-hero>websites, <em class="em">stores</em> &amp;</span>
        <span class="line" data-split-hero>apps that <em class="em accent-text">earn</em></span>
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

${gardenTeaser()}

${editorSection()}

${servicesTeaser()}

<section class="section index-section">
  <div class="wrap">
    <div class="section-head split-head">
      <p class="eyebrow">More projects</p>
      <h2 class="h2" data-split>Brands, stores <em class="em">&amp; tools.</em></h2>
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
        <p class="eyebrow">Also live</p>
        <h2 class="h2" data-split>Sites, VR tours <em class="em">&amp; 3D.</em></h2>
      </div>
      <a href="/work/#more" class="btn btn-ghost" data-magnetic>${roll('See all work')} ${arrowRight}</a>
    </div>
    <div class="more-grid">${more.slice(0, 6).map(moreCard).join('')}</div>
  </div>
</section>



${toolkitSection()}

<section class="section process">
  <div class="wrap process-grid">
    <div class="process-head">
      <p class="eyebrow">How we’d work together</p>
      <h2 class="h2" data-split>A clear process, <em class="em">no black box.</em></h2>
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
      <p class="eyebrow">Kind words</p>
      <h2 class="h2" data-split>From the people <em class="em">I’ve built for.</em></h2>
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
        <p class="eyebrow">The toolkit</p>
        <h2 class="h2" data-split>The tools I use, <em class="em">and what they do for you.</em></h2>
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
    <p class="eyebrow" data-hero-in>Work · ${projects.length} case studies</p>
    <h1 class="display" data-split-hero>Selected <em class="em">work</em></h1>
    <p class="lead muted page-lead" data-hero-in>Web apps, Shopify stores, brand sites, internal tools and a native iOS app. Every case study is written from the project’s code and commit history. <a class="text-link" href="/garden/">See them grown as bonsai →</a></p>
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
      <p class="eyebrow">More work · ${more.length} live links</p>
      <h2 class="h2" data-split>Websites, VR tours <em class="em">&amp; 3D animation.</em></h2>
      <p class="lead muted section-lead" data-reveal>Earlier client sites, virtual tours built with Matterport and 3DVista, and 3D animation. Each opens the live project.</p>
    </div>
    <div class="more-grid">${more.map(moreCard).join('')}</div>
  </div>
</section>`;
  return page({ title: 'Work · Elombe Kisala', description: `Case studies from Elombe Kisala: ${projects.slice(0, 6).map(p => p.title).join(', ')} and more.`, path: '/work/', body, bodyClass: 'is-work' });
}


function gardenTeaser() {
  const trees = ordered.map(p => traits(p, branchData));
  const branches = trees.reduce((a, t) => a + (t.branches.source === 'git' ? t.branches.total + 1 : 0), 0);
  return `
<section class="garden-teaser">
  <div class="wrap garden-teaser-grid">
    <div class="garden-teaser-copy">
      <p class="eyebrow" data-reveal>The garden</p>
      <h2 class="h2" data-split>Every project, <em class="em">grown.</em></h2>
      <p class="lead muted" data-reveal>A zen garden with one bonsai per project. Each limb is a real git branch from the project’s repository: ${branches} branches across ${trees.length} trees, read straight from git.</p>
      <a href="/garden/" class="btn btn-lg" data-magnetic>${roll('Walk the garden')} ${arrowRight}</a>
    </div>
    <a class="garden-teaser-img" href="/garden/" aria-label="Walk the project garden" data-reveal>${img('/assets/garden/teaser.webp', 'A zen garden of raked sand and moss islands, each with a bonsai that stands for a project', { sizes: '(max-width: 980px) 100vw, 60vw' })}</a>
  </div>
</section>`;
}

// ---------- garden: a zen garden, one bonsai per project, one limb per git branch ----------
function garden() {
  const trees = ordered.map(p => ({ slug: p.slug, title: p.title, kind: p.kind, accent: p.accent, t: traits(p, branchData) }));
  const totalBranches = trees.reduce((a, x) => a + (x.t.branches.source === 'git' ? x.t.branches.total + 1 : 0), 0);
  const repos = trees.filter(x => x.t.branches.source === 'git').length;
  const stylesUsed = Object.entries(STYLES).filter(([k]) => trees.some(x => x.t.style === k));
  const body = `
<section class="garden-hero" aria-label="Project garden">
  <div class="garden-stage" data-garden tabindex="-1">
    <canvas class="garden-canvas" data-garden-canvas tabindex="0" role="img" aria-label="A 3D zen garden with one bonsai per project. Each limb is a git branch. Drag to look around, click a tree to walk up to it, arrow keys move between trees."></canvas>
    <div class="garden-intro">
      <p class="eyebrow">Garden · ${trees.length} trees · ${totalBranches} branches</p>
      <h1 class="garden-h1">Every project, <em class="em">grown.</em></h1>
      <p class="garden-lead">Each bonsai is a project. Its trunk is the default branch and every limb is a real git branch, attached where it forked. Click a tree to walk up to it.</p>
    </div>
    <div class="garden-hud" data-hud aria-live="polite">
      <button type="button" class="garden-back mono" data-overview>← whole garden</button>
      <p class="mono garden-n"><span data-hud-n></span> · <span data-hud-style></span></p>
      <h2 class="garden-title" data-hud-title></h2>
      <p class="garden-kind" data-hud-summary></p>
      <dl class="garden-stats" data-hud-stats></dl>
      <ul class="branch-list" data-hud-branches aria-label="Branches"></ul>
      <p class="mono garden-note" data-hud-note></p>
      <a class="btn btn-sm garden-link" data-hud-link href="/work/">${roll('Case study')} ${arrowRight}</a>
    </div>
    <div class="garden-tip" data-tip hidden></div>
    <div class="garden-nav">
      <button type="button" class="garden-btn" data-prev aria-label="Previous tree">←</button>
      <button type="button" class="garden-btn" data-next aria-label="Next tree">→</button>
    </div>
    <p class="mono garden-hint" aria-hidden="true">drag to look around · click a tree · hover a limb</p>
    <p class="garden-fallback">The 3D garden needs WebGL. Every tree is listed below with the branches it grows from.</p>
  </div>
</section>
<section class="section-sm garden-grove-section">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">The grove</p>
      <h2 class="h2" data-split>Pick a <em class="em">tree.</em></h2>
    </div>
    <div class="grove">
      ${trees.map((x, i) => { const b = x.t.branches; return `<button type="button" class="tree-card" data-tree="${x.slug}" aria-pressed="false" style="--cs:${x.accent}">
        <span class="tree-thumb"><img alt="" width="360" height="360" decoding="async"><span class="tree-dot" aria-hidden="true"></span></span>
        <span class="mono tree-n">${String(i + 1).padStart(2, '0')} · ${esc(x.t.styleName.toLowerCase())}</span>
        <span class="tree-title">${esc(x.title)}</span>
        <span class="mono tree-meta">${b.source === 'git' ? `${b.total + 1} branch${b.total ? 'es' : ''} · ${x.t.counts.open} open` : `${x.t.stack.length} tool${x.t.stack.length === 1 ? '' : 's'} · no public repo`}</span>
      </button>`; }).join('\n      ')}
    </div>
  </div>
</section>
<section class="section-sm garden-key">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">How to read a tree</p>
      <h2 class="h2" data-split>Real branches, <em class="em">nothing invented.</em></h2>
      <p class="lead muted section-lead" data-reveal>${repos} of the ${trees.length} projects have a public repository. Their trees are read straight from git: ${totalBranches} branches in all. The project name seeds the rest, so a tree looks the same on every visit.</p>
    </div>
    <dl class="key-list">
      <div><dt>Trunk</dt><dd>The default branch. Short spurs along its top carry its own foliage, more of them the more commits it holds.</dd></div>
      <div><dt>Limbs</dt><dd>One per branch, leaving the trunk at the height where the branch forked off. Longer and thicker for branches with more commits of their own.</dd></div>
      <div><dt><span class="key-dot is-merged"></span>Mature foliage</dt><dd>Merged branches: the work is part of the project now.</dd></div>
      <div><dt><span class="key-dot is-open"></span>Fresh growth</dt><dd>Open branches with recent commits, tinted toward the project’s color.</dd></div>
      <div><dt><span class="key-dot is-stale"></span>Deadwood (jin)</dt><dd>Open branches that went quiet for more than 45 days. Bonsai artists keep deadwood on purpose, too.</dd></div>
      <div><dt>Shape</dt><dd>${stylesUsed.map(([, v]) => `${v.name} (<em>${v.jp}</em>) for ${v.rule}`).join('; ')}. Projects without a public repo grow one limb per tool in their stack.</dd></div>
    </dl>
  </div>
</section>
<script type="application/json" id="garden-data">${JSON.stringify(trees).replace(/</g, '\\u003c')}</script>
<script type="importmap">{"imports":{"three":"/assets/vendor/three/three.module.min.js","three/addons/":"/assets/vendor/three/addons/"}}</script>
<script type="module" src="/assets/js/garden.js?v=${ver('assets/js/garden.js')}"></script>`;
  return page({ title: 'Garden · Elombe Kisala', description: `A zen garden of ${trees.length} projects: each bonsai is a project and each limb a real git branch, grown in 3D in your browser.`, path: '/garden/', body, bodyClass: 'is-garden', showCta: false });
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
  const quote = p.quote ? `<section class="cs-quote wrap"><figure data-reveal><blockquote class="quote-text">“${esc(p.quote.text)}”</blockquote><figcaption><strong>${esc(p.quote.name)}</strong><span class="mono">${esc(p.quote.role)}</span></figcaption></figure></section>` : '';
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
      <p class="eyebrow" data-hero-in>${esc(p.kind.toLowerCase())} · ${esc(p.year)}</p>
      <h1 class="display cs-title" data-split-hero>${esc(p.title)}</h1>
      <div class="cs-result" data-hero-in><span class="mono muted">// result</span><p>${esc(p.result)}</p></div>
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
    ['Platforms', 'Webflow, Shopify (Liquid, themes, Admin API), Payload CMS, WordPress'],
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
      <p class="eyebrow" data-hero-in>About · Résumé</p>
      <h1 class="display" data-split-hero>Hi, I’m <em class="em">Elombe.</em></h1>
      <div class="prose-lg about-intro" data-hero-in>
        <p>I’m a designer and developer in Jersey City who studied Mobile Development at Full Sail University. I started building websites in 2019 for family and friends, and I haven’t stopped since.</p>
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
      <p class="eyebrow" data-hero-in>Contact</p>
      <h1 class="display" data-split-hero>Tell me what <em class="em">you’re building.</em></h1>
      <p class="lead muted" data-hero-in>Projects, roles or a quick question. I reply within one business day.</p>
      <div class="contact-direct" data-hero-in>
        <button class="copy" data-copy="${site.email}" type="button"><span class="mono">Email</span><span class="copy-text">${site.email}</span><span class="copy-hint mono" aria-live="polite">Copy</span></button>
        <a class="direct-link" href="${site.linkedin}" target="_blank" rel="noopener"><span class="mono">LinkedIn</span>Connect ${arrow}</a>
        <a class="direct-link" href="${site.github}" target="_blank" rel="noopener"><span class="mono">GitHub</span>See the code ${arrow}</a>
      </div>
      <ol class="next-steps" data-reveal>
        <li><span class="mono">01</span><strong>I read every message</strong><span>No forms going to a void. It comes straight to me.</span></li>
        <li><span class="mono">02</span><strong>A reply within a day</strong><span>A few questions, or a time to talk.</span></li>
        <li><span class="mono">03</span><strong>A written scope</strong><span>What we’re building, by when, and the price, before anything starts.</span></li>
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
function servicesIndex() {
  const body = `
<section class="page-hero">
  <div class="wrap two-col hero-two">
    <div>
      <p class="eyebrow" data-hero-in>services</p>
      <h1 class="display" data-split-hero>Four ways I help. <em class="em">Twelve things I build.</em></h1>
    </div>
    <p class="lead" data-hero-in>Build it from scratch, connect the tools you already use, improve what’s live, or join your team for a while. Every service links to the projects that prove it.</p>
  </div>
</section>
<section class="section-sm">
  <div class="wrap">
    ${groupRow(true)}
    <div class="svc-grid" data-svc-grid>${services.map(svcCard).join('')}</div>
  </div>
</section>
<section class="section process">
  <div class="wrap process-grid">
    <div class="process-head">
      <p class="eyebrow">process</p>
      <h2 class="h2" data-split>How a project <em class="em">runs.</em></h2>
    </div>
    <ol class="process-list">${steps.map(x => `<li class="process-step" data-reveal><span class="mono">${x.n}</span><div><h3>${x.title}</h3><p>${x.text}</p></div></li>`).join('')}</ol>
  </div>
</section>
${toolkitSection()}`;
  return page({ title: 'Services · Elombe Kisala', description: 'Websites, Shopify stores, web and iOS apps, portals, payments, automation, Payload CMS, migrations and performance by Elombe Kisala, each backed by real projects.', path: '/services/', body, bodyClass: 'is-services' });
}

function serviceDetail(sv, i) {
  const next = services[(i + 1) % services.length];
  const proof = sv.proof.map(sl => bySlug[sl]).filter(Boolean);
  const body = `
<section class="page-hero svc-hero">
  <div class="wrap svc-hero-grid">
    <div>
      <a href="/services/" class="back mono" data-hero-in>← All services</a>
      <p class="eyebrow" data-hero-in>${esc(groupLabel(sv.group).toLowerCase())} · ${String(i + 1).padStart(2, '0')}${sv.isNew ? ' · new' : ''}</p>
      <h1 class="h1" data-split-hero>${esc(sv.title)}</h1>
      <p class="lead svc-intro" data-hero-in>${esc(sv.intro)}</p>
      <div class="hero-actions" data-hero-in><a href="/contact/" class="btn btn-lg" data-magnetic>${roll('Start a project')} ${arrowRight}</a></div>
    </div>
    <figure class="svc-hero-art" data-draw data-hero-in>${art[sv.art]()}<figcaption class="mono">fig. ${String(i + 1).padStart(2, '0')} · ${esc(sv.fig)}</figcaption></figure>
  </div>
</section>
<div class="wrap cs-content">
  <section class="cs-block">
    <div class="cs-label"><span class="mono">01</span><h2>What you get</h2></div>
    <ol class="code-list">${sv.deliverables.map((d, k) => `<li data-reveal><span class="mono">${String(k + 1).padStart(2, '0')}</span>${esc(d)}</li>`).join('')}</ol>
  </section>
  ${sv.payload ? `<section class="cs-block cs-wide">
    <div class="cs-label"><span class="mono">02</span><h2>Why Payload CMS</h2></div>
    <div>
      <p class="lead payload-note" data-reveal>${esc(sv.payload.note)} <a class="ulink" href="https://payloadcms.com/" target="_blank" rel="noopener">payloadcms.com ${arrow}</a></p>
      <div class="features">${sv.payload.features.map((f, k) => `<div class="feature" data-reveal><span class="mono">${String(k + 1).padStart(2, '0')}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>`).join('')}</div>
    </div>
  </section>` : ''}
  <section class="cs-block cs-wide">
    <div class="cs-label"><span class="mono">${sv.payload ? '03' : '02'}</span><h2>${sv.payload ? 'CMS work so far' : 'Proof'}</h2></div>
    <div class="proof-grid">${proof.map(p => `<a href="/work/${p.slug}/" class="proof" style="--cs:${p.accent}" data-reveal>
      <div class="proof-media">${img(small(p), `${p.title}`, { sizes: '(max-width: 980px) 100vw, 30vw' })}</div>
      <span class="mono muted">// result</span>
      <p class="proof-result">${esc(p.result)}</p>
      <span class="proof-title">${esc(p.title)} ${arrowRight}</span>
    </a>`).join('')}</div>
  </section>
  <section class="cs-block">
    <div class="cs-label"><span class="mono">${sv.payload ? '04' : '03'}</span><h2>Tools</h2></div>
    <ul class="stack-why">${sv.tools.map(n => toolkit.find(t => t.name === n)).filter(Boolean).map(t => `<li data-reveal><strong>${esc(t.name)}</strong><span>${esc(t.benefit)}</span></li>`).join('')}</ul>
  </section>
</div>
<nav class="next" aria-label="Next service">
  <a href="/services/${next.slug}/" class="next-link next-svc" data-cursor="Next">
    <span class="mono">Next service</span>
    <span class="next-title">${esc(next.title)}</span>
    <span class="next-art" data-draw>${art[next.art]()}</span>
  </a>
</nav>`;
  return page({ title: `${sv.title} · Services · Elombe Kisala`, description: `${sv.short} ${sv.intro}`.slice(0, 158), path: `/services/${sv.slug}/`, body, bodyClass: 'is-service',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Service', name: sv.title, description: sv.intro, provider: { '@type': 'Person', name: site.name, url: site.url }, areaServed: 'Worldwide' }] });
}

// Old service URLs now point to their closest new service.
function redirectPage(from, to) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Moved</title><link rel="canonical" href="${site.url}${to}"><meta http-equiv="refresh" content="0; url=${to}"><meta name="robots" content="noindex"></head><body><p>This page moved to <a href="${to}">${site.url}${to}</a>.</p></body></html>\n`;
}

// ---------- blog ----------
function blogIndex() {
  const list = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const body = `
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow" data-hero-in>Writing</p>
    <h1 class="display" data-split-hero>Notes on <em class="em">the craft.</em></h1>
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
      ${dateMatch ? `<p class="eyebrow" data-hero-in>${dateMatch[1].trim()}</p>` : ''}
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
    <p class="eyebrow" data-hero-in>Error 404</p>
    <h1 class="display" data-split-hero>This page <em class="em">took a wrong turn.</em></h1>
    <p class="lead muted page-lead" data-hero-in>The link may be old, or the page may have moved. The work is still here.</p>
    <div class="hero-actions" data-hero-in><a href="/" class="btn btn-lg">${roll('Go home')}</a><a href="/work/" class="btn btn-lg btn-ghost">${roll('See the work')}</a></div>
  </div>
</section>`;
  return page({ title: 'Page not found · Elombe Kisala', description: 'This page could not be found.', path: '/404', body, showCta: false });
}

function sitemap() {
  const urls = ['/', '/work/', ...projects.map(p => `/work/${p.slug}/`), '/garden/', '/about/', '/services/', ...services.map(x => `/services/${x.slug}/`), '/contact/', '/blog/', ...posts.map(p => p.url), '/privacy/', '/terms/'];
  const today = new Date().toISOString().slice(0, 10);
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${site.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  write('llms.txt', `# ${site.name}, Designer & Developer

> Designer and full-stack developer in Jersey City / NYC. Leads web development for Core Home's consumer brands and founded SWFT Studios. Builds websites (Webflow, Cloudflare), Shopify stores, web apps (Cloudflare Workers, D1, Claude API) and native iOS apps (SwiftUI).

## Case studies
${ordered.map(p => `- [${p.title}](${site.url}/work/${p.slug}/): ${p.summary}`).join('\n')}

## Pages
- [Project garden: each project a bonsai, each limb a git branch](${site.url}/garden/)
- [About & résumé](${site.url}/about/)
- [Services](${site.url}/services/)
${services.map(x => `  - [${x.title}](${site.url}/services/${x.slug}/): ${x.short}`).join('\n')}
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
write('garden/index.html', garden());
projects.forEach((p, i) => write(`work/${p.slug}/index.html`, caseStudy(p, i)));
write('about/index.html', about());
write('contact/index.html', contact());
write('start/index.html', contact('/start/').replace(`<link rel="canonical" href="${site.url}/start/">`, `<link rel="canonical" href="${site.url}/contact/">`));
write('services/index.html', servicesIndex());
services.forEach((sv, i) => write(`services/${sv.slug}/index.html`, serviceDetail(sv, i)));
write('services/webflow/index.html', redirectPage('/services/webflow/', '/services/marketing-sites/'));
write('services/shopify-webflow/index.html', redirectPage('/services/shopify-webflow/', '/services/shopify/'));
write('blog/index.html', blogIndex());
legacyPages();
write('404.html', notFound());
sitemap();
console.log(`Built ${projects.length} case studies and ${7 + readdirSync(join(ROOT, 'src/content/pages')).length} other pages.`);
