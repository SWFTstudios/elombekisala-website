// /garden/: a zen garden with one bonsai per project. Every limb is a real git
// branch. Click a tree to walk up to it; hover a limb to read its branch.
import { buildTree, buildSurroundings, sandMaterial, makeRenderer, rockGeometry, rng, THREE } from './bonsai.js';

const root = document.querySelector('[data-garden]');
const data = JSON.parse(document.getElementById('garden-data').textContent);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const cards = [...document.querySelectorAll('[data-tree]')];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const html = document.documentElement;
const themeName = () => (html.getAttribute('data-theme') === 'dark' ? 'night' : 'day');
const STATE = { merged: 'merged', open: 'open', stale: 'gone quiet' };

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
if (root && webglOK()) start().catch(err => { console.warn('[garden]', err); root.classList.add('is-static'); });
else if (root) root.classList.add('is-static');

// Sunflower layout, stretched to the bed's proportions; featured trees near the middle.
function layout(n, W, D, seed) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const rad = 2.9 * Math.sqrt(i + 0.35), a = i * 2.39996 + 0.6;
    out.push(new THREE.Vector3(Math.cos(a) * rad * 1.5 + r.range(-0.4, 0.4), 0, Math.sin(a) * rad * 0.95 + r.range(-0.3, 0.3) - 0.6));
  }
  return out;
}

async function start() {
  const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
  const canvas = $('[data-garden-canvas]', root);
  const small = matchMedia('(max-width: 720px)').matches;
  const R = makeRenderer(canvas, { shadows: true });
  R.renderer.shadowMap.autoUpdate = false; // redrawn only while something changes
  const W = 46, D = 30;

  // --- ground, surroundings
  const sand = sandMaterial();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, D, 1, 1), sand.material);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  R.scene.add(ground);
  // lanterns go where they are furthest from any tree, one on each side
  const spots = layout(data.length, W, D, 11);
  const clearest = xs => {
    let best = null, bd = -1;
    for (const x of xs) for (let z = -D / 2 + 2.5; z <= D / 2 - 4.5; z += 0.5) {
      const d = Math.min(...spots.map(s => Math.hypot(s.x - x, s.z - z)));
      if (d > bd) { bd = d; best = [x, z]; }
    }
    return best;
  };
  const sur = buildSurroundings({ W, D, lanterns: [clearest([-9, -7.5, -6]), clearest([6, 7.5, 9])] });
  R.scene.add(sur.group); R.lamps = sur.lamps;
  R.setTheme(themeName());
  new MutationObserver(() => { R.setTheme(themeName()); kick(); }).observe(html, { attributes: true, attributeFilter: ['data-theme'] });

  // --- controls
  const controls = new OrbitControls(R.camera, canvas);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.07, rotateSpeed: 0.55, zoomSpeed: 0.7, panSpeed: 0.6, screenSpacePanning: false, minDistance: 2.5, maxDistance: 52, maxPolarAngle: 1.36, minPolarAngle: 0.2 });
  const zoom = on => { controls.enableZoom = on; canvas.toggleAttribute('data-lenis-prevent', on); };
  zoom(false);
  canvas.addEventListener('pointerdown', () => zoom(true));
  canvas.addEventListener('pointerleave', () => zoom(false));
  const overview = { target: new THREE.Vector3(0, 0.6, -2.5), pos: new THREE.Vector3(small ? 0 : 1.5, small ? 22 : 11.5, D / 2 + (small ? 20 : 12)) };
  controls.target.copy(overview.target); R.camera.position.copy(overview.pos);

  const resize = () => {
    const r = canvas.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    R.setSize(w, h, Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
    if (w > 900) R.camera.setViewOffset(w, h, -w * 0.1, 0, w, h); else R.camera.clearViewOffset();
  };
  new ResizeObserver(() => { resize(); kick(); }).observe(canvas);
  resize();

  // --- plant the garden, one tree per frame
  const trees = new Array(data.length);
  const clock = new THREE.Clock();
  const islands = [];
  const rocks = new THREE.Group(); R.scene.add(rocks);
  // standalone stones where no tree stands, like the stones of a karesansui
  {
    const r = rng(99);
    let placed = 0;
    for (let tries = 0; tries < 400 && placed < 7; tries++) {
      const p = new THREE.Vector3(r.range(-W / 2 + 2.5, W / 2 - 2.5), 0, r.range(-D / 2 + 2, D / 2 - 2));
      if (spots.some(s => s.distanceTo(p) < 4.4) || sur.lamps.some(l => l.box.parent.position.distanceTo(p) < 2.5) || islands.some(s => Math.hypot(s.x - p.x, s.z - p.z) < 3.5)) continue;
      const s = r.range(0.45, 0.95);
      const m = new THREE.Mesh(rockGeometry(1000 + placed, 3), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }));
      m.scale.set(s * r.range(1.1, 1.7), s * r.range(0.8, 1.3), s); m.rotation.y = r() * Math.PI * 2;
      m.position.copy(p); m.castShadow = m.receiveShadow = true; rocks.add(m);
      islands.push({ x: p.x, z: p.z, r: s * 1.15 }); placed++;
    }
    for (const l of sur.lamps) islands.push({ x: l.box.parent.position.x, z: l.box.parent.position.z, r: 0.6 });
  }
  sand.setIslands(islands);

  let planted = 0;
  function plantNext() {
    if (planted >= data.length) return false;
    const i = planted++;
    const tr = buildTree(data[i].t, { detail: small ? 0.6 : 0.9 });
    tr.group.position.copy(spots[i]);
    tr.group.rotation.y = rng(data[i].t.seed)() * Math.PI * 2;
    tr.hit.userData.index = i;
    tr.born = clock.getElapsedTime() + (reduce ? -99 : 0);
    R.scene.add(tr.group);
    trees[i] = tr;
    islands.push({ x: spots[i].x, z: spots[i].z, r: tr.island.R * 1.02 });
    sand.setIslands(islands);
    if (i === focusIndex) frameTree(i, true);
    return true;
  }

  // --- camera moves
  let focusIndex = -1, fly = null;
  const ease = x => 1 - Math.pow(1 - x, 3);
  function flyTo(target, pos, dur = 1.6) {
    fly = { t: 0, dur: reduce ? 0.001 : dur, from: { target: controls.target.clone(), pos: R.camera.position.clone() }, to: { target, pos } };
    kick();
  }
  function frameTree(i, instant = false) {
    const tr = trees[i]; if (!tr) return;
    const center = tr.box.getCenter(new THREE.Vector3()).applyEuler(tr.group.rotation).add(tr.group.position);
    const size = tr.box.getSize(new THREE.Vector3());
    const rad = Math.max(size.x, size.y, size.z) * 0.5 + 0.6;
    const dist = rad / Math.sin(THREE.MathUtils.degToRad(17)) * (R.camera.aspect < 1 ? 1.9 : 1.45);
    const dir = R.camera.position.clone().sub(controls.target).setY(0).normalize();
    if (!isFinite(dir.x)) dir.set(0, 0, 1);
    const pos = center.clone().addScaledVector(dir, dist * 0.93).add(new THREE.Vector3(0, dist * 0.36, 0));
    R.fitShadow(tr.group.position.x, tr.group.position.z, 6);
    if (instant) { controls.target.copy(center); R.camera.position.copy(pos); kick(); } else flyTo(center, pos);
  }
  function showOverview(push = true) {
    focusIndex = -1;
    trees.forEach(t => t && t.highlight(null));
    R.fitShadow(0, -1, 27);
    flyTo(overview.target.clone(), overview.pos.clone(), 1.8);
    root.classList.remove('is-focused');
    cards.forEach(c => { c.classList.remove('is-on'); c.setAttribute('aria-pressed', 'false'); });
    if (push) history.replaceState(null, '', location.pathname);
  }
  function focus(i, { push = true } = {}) {
    i = (i + data.length) % data.length;
    if (focusIndex >= 0 && trees[focusIndex]) trees[focusIndex].highlight(null);
    focusIndex = i;
    root.classList.add('is-focused');
    hud(i);
    frameTree(i);
    controls.autoRotate = false;
    cards.forEach((c, k) => { c.classList.toggle('is-on', k === i); c.setAttribute('aria-pressed', String(k === i)); });
    if (push) history.replaceState(null, '', '#' + data[i].slug);
  }

  // --- HUD
  const H = {
    n: $('[data-hud-n]', root), style: $('[data-hud-style]', root), title: $('[data-hud-title]', root), kind: $('[data-hud-summary]', root),
    stats: $('[data-hud-stats]', root), link: $('[data-hud-link]', root), list: $('[data-hud-branches]', root), note: $('[data-hud-note]', root),
    tip: $('[data-tip]', root)
  };
  function hud(i) {
    const d = data[i], t = d.t, b = t.branches;
    root.style.setProperty('--tree', d.accent);
    H.n.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(data.length).padStart(2, '0');
    H.style.textContent = `${t.styleName.toLowerCase()} · ${t.styleJp}`;
    H.title.textContent = d.title;
    H.kind.textContent = d.kind;
    H.stats.innerHTML = (b.source === 'git'
      ? [[b.total + 1, 'branches'], [t.counts.open, 'open'], [t.counts.merged, 'merged'], [t.counts.stale, 'gone quiet']]
      : [[t.stack.length, 'tools in the stack']]).map(([v, l]) => `<div><dt>${esc(v)}</dt><dd class="mono">${esc(l)}</dd></div>`).join('');
    const trunk = b.source === 'git' ? `<li class="br is-trunk" data-br="-1"><span class="br-dot"></span><span class="br-name">${esc(b.trunk.name)}</span><span class="br-meta">trunk · ${b.trunk.commits}</span></li>` : '';
    H.list.innerHTML = trunk + b.limbs.map((l, k) => `<li class="br is-${l.state}${l.tool ? ' is-tool' : ''}" data-br="${k}" tabindex="0"><span class="br-dot"></span><span class="br-name">${esc(l.name)}</span><span class="br-meta">${l.tool ? 'tool' : `${STATE[l.state]} · ${l.commits}`}</span></li>`).join('');
    H.note.textContent = b.source === 'git'
      ? `${b.private ? 'private repo, branch names hidden' : t.repo} · read ${b.fetched}${b.hidden ? ` · ${b.hidden} smaller branches not drawn` : ''}`
      : 'No public repository: one limb per tool in the stack.';
    H.link.href = '/work/' + d.slug + '/';
    $('[data-hud]', root).classList.remove('is-in'); void root.offsetWidth; $('[data-hud]', root).classList.add('is-in');
  }
  const setHi = (k, from) => {
    const tr = trees[focusIndex]; if (!tr) return;
    const color = R.theme === 'night' ? 0x4f7fb0 : 0x8a5a12;
    tr.highlight(k == null || k < 0 ? null : k, color);
    H.list.querySelectorAll('.br').forEach(li => li.classList.toggle('is-hi', +li.dataset.br === k));
    if (from === 'tree' && k != null && k >= 0) { const li = H.list.querySelector(`[data-br="${k}"]`); if (li) li.scrollIntoView({ block: 'nearest' }); }
    kick();
  };
  H.list.addEventListener('pointerover', e => { const li = e.target.closest('.br'); if (li) setHi(+li.dataset.br); });
  H.list.addEventListener('pointerleave', () => setHi(null));
  H.list.addEventListener('focusin', e => { const li = e.target.closest('.br'); if (li) setHi(+li.dataset.br); });

  // --- picking
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let pending = null, downAt = null;
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, R.camera);
    const ft = trees[focusIndex];
    if (ft) {
      const hit = ray.intersectObjects([ft.bark, ft.leaves], false)[0];
      if (hit) return { tree: focusIndex, branch: ft.branchAt(hit), x: e.clientX - r.left, y: e.clientY - r.top };
    }
    const proxies = trees.filter(Boolean).map(t => t.hit);
    const hit = ray.intersectObjects(proxies, false)[0];
    return hit ? { tree: hit.object.userData.index, branch: null, x: e.clientX - r.left, y: e.clientY - r.top } : null;
  }
  function tip(text, x, y) {
    if (!text) { H.tip.hidden = true; return; }
    H.tip.innerHTML = text; H.tip.hidden = false;
    H.tip.style.transform = `translate(${Math.round(x + 14)}px, ${Math.round(y + 14)}px)`;
  }
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    if (pending) { pending = e; return; }
    pending = e;
    requestAnimationFrame(() => {
      const ev = pending; pending = null;
      const p = pick(ev);
      canvas.style.cursor = p ? 'pointer' : '';
      if (p && p.tree === focusIndex && p.branch != null) {
        const t = data[focusIndex].t, l = p.branch >= 0 ? t.branches.limbs[p.branch] : null;
        setHi(p.branch >= 0 ? p.branch : -1, 'tree');
        tip(l ? `<b>${esc(l.name)}</b><span>${l.tool ? 'tool in the stack' : `${STATE[l.state]} · ${l.commits} commit${l.commits === 1 ? '' : 's'} · ${esc(l.last)}`}</span>`
          : `<b>${esc(t.branches.trunk.name)}</b><span>trunk · default branch</span>`, p.x, p.y);
      } else if (p && p.tree !== focusIndex) {
        if (focusIndex >= 0) setHi(null);
        tip(`<b>${esc(data[p.tree].title)}</b><span>${esc(data[p.tree].kind)}</span>`, p.x, p.y);
      } else { if (focusIndex >= 0) setHi(null); tip(null); }
    });
  });
  canvas.addEventListener('pointerleave', () => { tip(null); if (focusIndex >= 0) setHi(null); });
  canvas.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', e => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
    const p = pick(e);
    if (p && p.tree !== focusIndex) focus(p.tree);
  });
  controls.addEventListener('start', () => { fly = null; tip(null); });

  // --- buttons, keys, cards
  $('[data-prev]', root).addEventListener('click', () => focus(focusIndex < 0 ? data.length - 1 : focusIndex - 1));
  $('[data-next]', root).addEventListener('click', () => focus(focusIndex + 1));
  $('[data-overview]', root).addEventListener('click', () => showOverview());
  root.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); focus(focusIndex < 0 ? data.length - 1 : focusIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); focus(focusIndex + 1); }
    if (e.key === 'Escape' && focusIndex >= 0) showOverview();
  });
  cards.forEach((c, k) => c.addEventListener('click', () => {
    focus(k);
    const top = root.getBoundingClientRect().top + scrollY - 76;
    if (Math.abs(scrollY - top) > 40) scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }));

  // --- loop
  let visible = true, raf = 0, last = 0;
  const GROW = 3.2;
  function tick() {
    raf = 0;
    const now = clock.getElapsedTime(), dt = Math.min(0.05, now - last); last = now;
    if (planted < data.length) { plantNext(); if (!reduce) plantNext(); }
    if (fly) {
      fly.t = Math.min(1, fly.t + dt / fly.dur);
      const k = ease(fly.t);
      controls.target.lerpVectors(fly.from.target, fly.to.target, k);
      R.camera.position.lerpVectors(fly.from.pos, fly.to.pos, k);
      if (fly.t >= 1) fly = null;
    }
    controls.update(dt);
    let growing = false;
    for (const tr of trees) if (tr) {
      const g = reduce ? 1 : Math.min(1, (now - tr.born) / GROW);
      if (g < 1) growing = true;
      tr.update(reduce ? 0 : now, g < 1 ? ease(g) : 1);
    }
    if (growing || planted < data.length || fly) R.renderer.shadowMap.needsUpdate = true;
    R.render();
    if (visible && (!reduce || fly || growing || planted < data.length)) raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf && visible) raf = requestAnimationFrame(tick); }
  controls.addEventListener('change', kick);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; kick(); }, { rootMargin: '60px' }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; kick(); });

  root.classList.add('is-live');
  const fromHash = data.findIndex(d => '#' + d.slug === location.hash);
  R.fitShadow(0, -1, 27);
  if (fromHash >= 0) { focusIndex = fromHash; root.classList.add('is-focused'); hud(fromHash); cards[fromHash] && cards[fromHash].classList.add('is-on'); }
  kick();

  thumbs().catch(err => console.warn('[garden] thumbnails', err));
}

// One small scene per card: the tree on its island in a patch of raked sand.
async function thumbs() {
  const idle = window.requestIdleCallback || (fn => setTimeout(() => fn(), 150));
  const wait = () => new Promise(r => idle(r, { timeout: 2000 }));
  await new Promise(r => setTimeout(r, 2500));
  const c = document.createElement('canvas'), S = 360;
  const R = makeRenderer(c, { shadows: true });
  R.setSize(S, S, 1);
  const sand = sandMaterial(4);
  const patch = new THREE.Mesh(new THREE.CircleGeometry(9, 64), sand.material);
  patch.rotation.x = -Math.PI / 2; patch.receiveShadow = true; R.scene.add(patch);
  R.scene.fog.near = 12; R.scene.fog.far = 24;
  for (let i = 0; i < data.length; i++) {
    await wait();
    const img = cards[i] && $('img', cards[i]);
    if (!img) continue;
    const tr = buildTree(data[i].t, { detail: 0.8 });
    R.scene.add(tr.group);
    sand.setIslands([{ x: 0, z: 0, r: tr.island.R * 1.02 }]);
    const center = tr.box.getCenter(new THREE.Vector3()), size = tr.box.getSize(new THREE.Vector3());
    const rad = Math.max(size.x, size.y, size.z) * 0.5 + 0.5, dist = rad / Math.sin(THREE.MathUtils.degToRad(17)) * 1.08;
    R.camera.position.copy(center).add(new THREE.Vector3(Math.sin(0.5) * dist * 0.92, dist * 0.34, Math.cos(0.5) * dist * 0.92));
    R.camera.lookAt(center);
    R.fitShadow(0, 0, 4);
    tr.update(0, 1);
    R.render();
    const blob = await new Promise(r => c.toBlob(r, 'image/webp', 0.86));
    R.scene.remove(tr.group); tr.dispose();
    if (blob) { img.src = URL.createObjectURL(blob); img.onload = () => img.closest('[data-tree]').classList.add('has-thumb'); }
  }
  R.renderer.dispose(); R.renderer.forceContextLoss();
}
