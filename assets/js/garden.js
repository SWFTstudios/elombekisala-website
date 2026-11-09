// /garden/: one procedural bonsai per project. The stage grows the selected tree;
// the grove below gets thumbnails rendered one at a time while the browser is idle.
import { buildBonsai, makeRenderer, frame, THREE } from './bonsai.js';

const root = document.querySelector('[data-garden]');
const data = JSON.parse(document.getElementById('garden-data').textContent);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const cards = [...document.querySelectorAll('[data-tree]')];

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

if (!root || !webglOK()) {
  if (root) root.classList.add('is-static');
} else {
  start().catch(err => { console.warn('[garden]', err); root.classList.add('is-static'); });
}

async function start() {
  const [{ OrbitControls }] = await Promise.all([import('three/addons/controls/OrbitControls.js')]);
  const canvas = $('[data-garden-canvas]', root);
  const R = await makeRenderer(canvas);
  const controls = new OrbitControls(R.camera, canvas);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.06, enablePan: false, rotateSpeed: 0.6, zoomSpeed: 0.6, minPolarAngle: 0.35, maxPolarAngle: 1.52, autoRotate: !reduce, autoRotateSpeed: 0.55 });
  // the wheel scrolls the page until someone grabs the tree; then it zooms
  controls.enableZoom = false;
  const zoom = on => { controls.enableZoom = on; canvas.toggleAttribute('data-lenis-prevent', on); };
  canvas.addEventListener('pointerdown', () => zoom(true));
  canvas.addEventListener('pointerleave', () => zoom(false));
  root.classList.add('is-live');

  // --- sizing
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    R.setSize(w, h, Math.min(devicePixelRatio || 1, 1.75));
    // on wide stages, shift the tree right so it clears the text on the left
    if (w > 900) R.camera.setViewOffset(w, h, -w * 0.11, 0, w, h); else R.camera.clearViewOffset();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  // --- tree lifecycle
  let tree = null, index = -1, born = 0, camFrom = null, camTo = null, camT = 1;
  const GROW = reduce ? 0 : 3.4;
  const clock = new THREE.Clock();

  function show(i, { push = true } = {}) {
    i = (i + data.length) % data.length;
    if (i === index) return;
    index = i;
    const d = data[i];
    if (tree) { R.scene.remove(tree.group); tree.dispose(); }
    tree = buildBonsai(d.t);
    R.scene.add(tree.group);
    born = clock.getElapsedTime();
    const f = frame(tree, R.camera.aspect > 1.4 ? R.camera.aspect * 0.72 : R.camera.aspect);
    const dir = R.camera.position.clone().sub(controls.target);
    if (dir.lengthSq() < 1e-6) dir.set(Math.sin(0.5), 0.3, Math.cos(0.5));
    dir.y = Math.max(dir.y, 0.15 * dir.length());
    dir.normalize();
    camFrom = { target: controls.target.clone(), pos: R.camera.position.clone() };
    camTo = { target: f.target, pos: f.target.clone().addScaledVector(dir, f.dist) };
    controls.minDistance = f.dist * 0.45; controls.maxDistance = f.dist * 1.8;
    camT = index === 0 && !camFrom.pos.lengthSq() ? 1 : 0;
    if (!camFrom.pos.lengthSq() || reduce) { controls.target.copy(camTo.target); R.camera.position.copy(camTo.pos); camT = 1; }
    hud(d, i);
    cards.forEach((c, k) => { c.classList.toggle('is-on', k === i); c.setAttribute('aria-pressed', k === i); });
    if (push) history.replaceState(null, '', '#' + d.slug);
    kick();
  }

  // --- HUD
  const H = {
    n: $('[data-hud-n]', root), style: $('[data-hud-style]', root), title: $('[data-hud-title]', root), summary: $('[data-hud-summary]', root),
    stats: $('[data-hud-stats]', root), link: $('[data-hud-link]', root), stack: $('[data-hud-stack]', root)
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function hud(d, i) {
    root.style.setProperty('--tree', d.accent);
    H.n.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(data.length).padStart(2, '0');
    H.style.textContent = `${d.t.styleName.toLowerCase()} · ${d.t.styleJp}`;
    H.title.textContent = d.title;
    H.summary.textContent = d.kind;
    H.stats.innerHTML = [
      [d.t.commits != null ? d.t.commits : '—', d.t.commits != null ? 'commits → ' + d.t.pads + ' pads' : 'no public log → ' + d.t.pads + ' pads'],
      [d.t.stack.length, 'tools → ' + d.t.limbs + ' limbs'],
      [d.t.days > 360 ? Math.round(d.t.days / 365 * 10) / 10 + 'y' : d.t.days + 'd', 'in build → trunk']
    ].map(([v, l]) => `<div><dt>${esc(v)}</dt><dd class="mono">${esc(l)}</dd></div>`).join('');
    H.stack.innerHTML = d.t.stack.map(s => `<li>${esc(s)}</li>`).join('');
    H.link.href = '/work/' + d.slug + '/';
    $('[data-hud]', root).classList.remove('is-in'); void root.offsetWidth; $('[data-hud]', root).classList.add('is-in');
  }

  // --- loop (only while visible)
  let visible = true, raf = 0, last = 0;
  const ease = x => 1 - Math.pow(1 - x, 3);
  function tick() {
    raf = 0;
    const now = clock.getElapsedTime(), dt = Math.min(0.05, now - last); last = now;
    if (camT < 1) {
      camT = Math.min(1, camT + dt / 1.4);
      const k = ease(camT);
      controls.target.lerpVectors(camFrom.target, camTo.target, k);
      R.camera.position.lerpVectors(camFrom.pos, camTo.pos, k);
    }
    controls.update(dt);
    const g = GROW ? Math.min(1, (now - born) / GROW) : 1;
    tree.update(reduce ? 2 : now, g < 1 ? ease(g) : 1);
    R.render();
    if (visible && !reduce) raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }
  controls.addEventListener('change', () => { if (reduce) kick(); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; if (visible) kick(); }, { rootMargin: '80px' }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) { clock.getDelta(); kick(); } });
  // stop auto-rotation once someone takes the controls
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  // --- controls
  $('[data-prev]', root).addEventListener('click', () => show(index - 1));
  $('[data-next]', root).addEventListener('click', () => show(index + 1));
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });
  cards.forEach((c, k) => c.addEventListener('click', () => {
    show(k);
    const top = root.getBoundingClientRect().top + scrollY - 90;
    if (Math.abs(scrollY - top) > 40) scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }));

  const fromHash = data.findIndex(d => '#' + d.slug === location.hash);
  show(fromHash >= 0 ? fromHash : 0, { push: false });

  // --- thumbnails for the grove, one per idle slot
  thumbs().catch(err => console.warn('[garden] thumbnails', err));
}

async function thumbs() {
  const idle = window.requestIdleCallback || (fn => setTimeout(() => fn({ timeRemaining: () => 16 }), 120));
  const wait = () => new Promise(r => idle(r, { timeout: 1500 }));
  const c = document.createElement('canvas');
  const S = 360;
  const R = await makeRenderer(c, { bloom: 0.75 });
  R.setSize(S, S, 1);
  for (let i = 0; i < data.length; i++) {
    await wait();
    const img = cards[i] && $('img', cards[i]);
    if (!img) continue;
    const b = buildBonsai(data[i].t, { detail: 0.6 });
    R.scene.add(b.group);
    const f = frame(b), dir = new THREE.Vector3(Math.sin(0.55), 0.3, Math.cos(0.55)).normalize();
    R.camera.position.copy(f.target).addScaledVector(dir, f.dist * 0.95);
    R.camera.lookAt(f.target);
    b.update(4, 1);
    R.render();
    const blob = await new Promise(r => c.toBlob(r, 'image/webp', 0.85));
    R.scene.remove(b.group); b.dispose();
    if (blob) { img.src = URL.createObjectURL(blob); img.onload = () => img.closest('[data-tree]').classList.add('has-thumb'); }
  }
  R.composer.dispose(); R.renderer.dispose(); R.renderer.forceContextLoss();
}
