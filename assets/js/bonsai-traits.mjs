// How a project becomes a bonsai. Shared by the site build (Node) and the
// garden page (browser), so the numbers printed on a card are the numbers the
// tree is grown from. Pure data in, pure data out: no DOM, no three.js.

export const STYLES = {
  moyogi:     { name: 'Informal upright', jp: 'moyōgi',      rule: 'Web app' },
  sokan:      { name: 'Twin trunk',       jp: 'sōkan',       rule: 'Automation' },
  fukinagashi:{ name: 'Windswept',        jp: 'fukinagashi', rule: 'iOS app' },
  kengai:     { name: 'Cascade',          jp: 'kengai',      rule: 'Shopify / e-commerce first' },
  hokidachi:  { name: 'Broom',            jp: 'hōkidachi',   rule: 'Brand site' },
  bunjin:     { name: 'Literati',         jp: 'bunjin',      rule: 'AI' },
  chokkan:    { name: 'Formal upright',   jp: 'chokkan',     rule: 'Webflow' }
};

export function styleFor(tags = []) {
  const first = tags[0];
  if (tags.includes('iOS app')) return 'fukinagashi';
  if (tags.includes('Automation')) return 'sokan';
  if (tags.includes('AI')) return 'bunjin';
  if (first === 'Shopify' || first === 'E-commerce') return 'kengai';
  if (tags.includes('Web app')) return 'moyogi';
  if (tags.includes('Brand site')) return 'hokidachi';
  return 'chokkan';
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// "Nov 2025 – Oct 2026", "Oct 15 – Oct 28, 2026", "Oct 22, 2026", "Jul – Oct 2026" -> days
export function spanDays(span) {
  if (!span) return null;
  const parts = String(span).split(/\s*[–-]\s*/);
  const parse = s => {
    const m = s.toLowerCase().match(/([a-z]{3})[a-z]*\.?(?:\s+(\d{1,2})(?!\d))?(?:,)?(?:\s+(\d{4}))?/);
    if (!m) return null;
    return { mo: MONTHS.indexOf(m[1]), day: m[2] ? +m[2] : null, yr: m[3] ? +m[3] : null };
  };
  const a = parse(parts[0]), b = parse(parts[1] || parts[0]);
  if (!a || !b || a.mo < 0 || b.mo < 0) return null;
  const yb = b.yr || a.yr || 2026, ya = a.yr || (a.mo > b.mo ? yb - 1 : yb);
  const start = Date.UTC(ya, a.mo, a.day || 1);
  const end = Date.UTC(yb, b.mo, b.day || (parts[1] ? 28 : 1));
  return Math.max(1, Math.round((end - start) / 864e5) + 1);
}

// "2023–26" -> 1095, "2025" -> 365
function yearDays(year) {
  const m = String(year || '').match(/(\d{4})(?:\s*[–-]\s*(\d{2,4}))?/);
  if (!m) return 365;
  const a = +m[1], b = m[2] ? (m[2].length === 2 ? +(m[1].slice(0, 2) + m[2]) : +m[2]) : a;
  return Math.max(1, b - a) * 365;
}

export function hash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function hexToHsl(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return { h: 0.45, s: 0, l };
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h / 6, s, l };
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const MAX_LIMBS = 36;
const DAY = 864e5;

// One limb per real branch. Without a repo, one limb per tool in the stack.
export function limbsFor(p, repoBranches) {
  if (repoBranches && repoBranches.branches && repoBranches.branches.length) {
    const all = repoBranches.branches;
    const trunk = all.find(b => b.default) || all[0];
    const newest = Math.max(...all.map(b => Date.parse(b.last)));
    const limbs = all.filter(b => b !== trunk).map(b => {
      const quiet = (newest - Date.parse(b.last)) / DAY;
      const state = b.merged ? 'merged' : quiet <= 45 ? 'open' : 'stale';
      return { name: b.name, commits: b.commits, at: b.orphan ? 0 : clamp(b.forkedAt / Math.max(1, trunk.commits), 0, 1), state, last: b.last.slice(0, 10), root: !!b.orphan };
    });
    const rank = l => (l.state === 'open' ? 1000 : 0) + l.commits * 10 + (l.state === 'merged' ? 5 : 0);
    const shown = [...limbs].sort((a, b) => rank(b) - rank(a)).slice(0, MAX_LIMBS).sort((a, b) => a.at - b.at);
    return { source: 'git', trunk: { name: trunk.name, commits: trunk.commits, last: trunk.last.slice(0, 10) }, limbs: shown, hidden: limbs.length - shown.length, total: limbs.length, fetched: repoBranches.fetched, private: !!repoBranches.private };
  }
  const stack = (p.stack || []).map(s => s.name || s);
  const tools = (stack.length ? stack : ['site']).map((name, i, a) => ({ name, commits: 3, at: 0.35 + 0.55 * (i + 0.5) / a.length, state: 'merged', tool: true }));
  return { source: 'stack', trunk: { name: 'main' }, limbs: tools, hidden: 0, total: tools.length };
}

export function traits(p, branchData = {}) {
  const commits = p.log && p.log.commits ? p.log.commits : null;
  const spanFromLog = p.log && p.log.span ? spanDays(p.log.span) : null;
  const days = spanFromLog || yearDays(p.year);
  const age = clamp(Math.log10(days + 1) / Math.log10(1200), 0.15, 1);
  const stack = (p.stack || []).map(s => s.name || s);
  const { h, s } = hexToHsl(p.accent || '#35e07a');
  const style = styleFor(p.tags);
  const br = limbsFor(p, branchData[p.slug]);
  return {
    slug: p.slug,
    seed: hash(p.slug),
    style,
    styleName: STYLES[style].name,
    styleJp: STYLES[style].jp,
    commits,
    repo: p.log && p.log.repo ? p.log.repo : null,
    days,
    spanLabel: spanFromLog ? p.log.span : String(p.year || ''),
    age,
    stack,
    branches: br,
    counts: {
      merged: br.limbs.filter(l => l.state === 'merged').length,
      open: br.limbs.filter(l => l.state === 'open').length,
      stale: br.limbs.filter(l => l.state === 'stale').length
    },
    hue: s < 0.08 ? 0.42 : h,
    sat: clamp(s, 0.6, 1),
    height: 2.4 + 1.3 * age,
    trunk: 0.13 + 0.12 * age
  };
}
