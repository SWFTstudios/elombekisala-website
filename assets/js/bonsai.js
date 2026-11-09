// Zen garden + procedural bonsai.
// One tree per project, grown from traits() in bonsai-traits.mjs: the default
// branch is the trunk and every real git branch is a limb, attached where it
// forked. Merged branches carry mature foliage, open ones fresh growth, quiet
// ones become deadwood (jin). Trees stand on moss islands in raked sand.
import * as THREE from 'three';

const TAU = Math.PI * 2;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = THREE.MathUtils.clamp, lerp = THREE.MathUtils.lerp;

export function rng(seed) {
  let a = seed >>> 0;
  const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.range = (a, b) => a + (b - a) * r();
  r.sign = () => (r() < 0.5 ? -1 : 1);
  return r;
}

// small value noise for rocks, moss and bark
function hash3(x, y, z) { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 2147483647); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const s = t => t * t * (3 - 2 * t), u = s(xf), v = s(yf), w = s(zf);
  const c = (a, b, d) => hash3(xi + a, yi + b, zi + d);
  return lerp(lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v), lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
const fbm = (x, y, z) => noise3(x, y, z) * 0.6 + noise3(x * 2.1, y * 2.1, z * 2.1) * 0.3 + noise3(x * 4.3, y * 4.3, z * 4.3) * 0.1;

// ---------------------------------------------------------------- material patching
// Adds wind sway, a growth front (discard past uGrow along the branch), and
// highlighting of one limb (uHi) to a standard material.
function patch(mat, u, { leaves = false, depth = false } = {}) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; uniform float uWind; uniform float uH; uniform float uGrow; uniform float uHi;
        attribute float aDist; attribute float aBranch;
        ${leaves ? 'attribute vec3 aCenter;' : ''}
        varying float vDist; varying float vHi;
        vec3 sway(vec3 p) {
          float k = clamp(p.y / uH, 0.0, 1.3); k *= k;
          float s = sin(uTime * 0.8 + p.x * 1.1 + p.z * 0.7) * 0.6 + sin(uTime * 1.9 + p.z * 2.3) * 0.25;
          return p + vec3(s * 0.03, 0.0, cos(uTime * 0.6 + p.x) * 0.018) * k * uWind;
        }`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vDist = aDist; vHi = 1.0 - step(0.5, abs(aBranch - uHi));
        ${leaves ? 'transformed *= smoothstep(aDist, aDist + 0.45, uGrow);' : ''}`)
      .replace('#include <project_vertex>', `
        vec4 mvPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif
        mvPosition.xyz = sway(mvPosition.xyz);
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform float uGrow; uniform vec3 uHiColor; varying float vDist; varying float vHi;`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        ${leaves ? '' : 'if (vDist > uGrow) discard;'}`);
    if (!depth) sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += uHiColor * vHi;`);
  };
  mat.customProgramCacheKey = () => (leaves ? 'leaf' : 'wood') + (depth ? '-d' : '');
  return mat;
}
function depthFor(u, opts) {
  return patch(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), u, { ...opts, depth: true });
}

// ---------------------------------------------------------------- tubes
class TubeBuilder {
  constructor(sides) { this.sides = sides; this.pos = []; this.nor = []; this.col = []; this.dist = []; this.br = []; this.idx = []; }
  add(pts, radii, dists, { branch = -1, color = [0.3, 0.24, 0.19], jin = false, seed = 0 } = {}) {
    const n = pts.length; if (n < 2) return;
    const S = this.sides, base = this.pos.length / 3;
    let T = pts[1].clone().sub(pts[0]).normalize();
    let N = Math.abs(T.y) < 0.9 ? V(0, 1, 0).cross(T).normalize() : V(1, 0, 0).cross(T).normalize();
    for (let i = 0; i < n; i++) {
      const nt = (i < n - 1 ? pts[i + 1].clone().sub(pts[i]) : pts[i].clone().sub(pts[i - 1])).normalize();
      const axis = T.clone().cross(nt);
      if (axis.lengthSq() > 1e-10) N.applyAxisAngle(axis.normalize(), Math.acos(clamp(T.dot(nt), -1, 1)));
      T = nt;
      const B = T.clone().cross(N).normalize();
      for (let s = 0; s <= S; s++) {
        const a = (s / S) * TAU, c = Math.cos(a), sn = Math.sin(a);
        const nx = N.x * c + B.x * sn, ny = N.y * c + B.y * sn, nz = N.z * c + B.z * sn;
        // bark ridges: a little radial noise running along the branch
        const ridge = 1 + (noise3(s * 0.9 + seed, dists[i] * 7, seed) - 0.5) * 0.22;
        const r = radii[i] * ridge;
        this.pos.push(pts[i].x + nx * r, pts[i].y + ny * r, pts[i].z + nz * r);
        this.nor.push(nx, ny, nz);
        const shade = 0.8 + 0.35 * noise3(s * 1.7 + seed, dists[i] * 11, 3.1) + (jin ? 0.1 * ny : 0);
        this.col.push(color[0] * shade, color[1] * shade, color[2] * shade);
        this.dist.push(dists[i]); this.br.push(branch);
      }
    }
    for (let i = 0; i < n - 1; i++) for (let s = 0; s < S; s++) {
      const a = base + i * (S + 1) + s, b = a + S + 1;
      this.idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('aDist', new THREE.Float32BufferAttribute(this.dist, 1));
    g.setAttribute('aBranch', new THREE.Float32BufferAttribute(this.br, 1));
    g.setIndex(this.idx);
    g.computeBoundingSphere();
    return g;
  }
}
function sample(ctrl, step = 0.05) {
  const c = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal');
  return c.getSpacedPoints(Math.max(4, Math.ceil(c.getLength() / step)));
}
function lengths(pts, start = 0) {
  const d = [start];
  for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + pts[i].distanceTo(pts[i - 1]));
  return d;
}

// ---------------------------------------------------------------- island
// A moss island: irregular outline, gentle dome. Height function is shared with the tree's roots.
export function islandShape(seed, R = 1.7, H = 0.34) {
  const ph = (seed % 1000) / 37;
  const edge = a => R * (1 + 0.13 * Math.sin(a * 2 + ph) + 0.08 * Math.sin(a * 3 - ph * 1.7) + 0.05 * Math.sin(a * 5 + ph * 0.3));
  const height = (x, z) => {
    const a = Math.atan2(z, x), r = Math.hypot(x, z) / edge(a);
    if (r >= 1) return 0;
    return H * Math.pow(1 - r * r, 0.75) * (0.92 + 0.08 * noise3(x * 2, z * 2, ph));
  };
  return { R, H, edge, height };
}

function islandMesh(shape, seed) {
  const rings = 22, segs = 96, pos = [], col = [], idx = [];
  const c = new THREE.Color();
  for (let i = 0; i <= rings; i++) for (let j = 0; j <= segs; j++) {
    const a = (j / segs) * TAU, f = i / rings, r = shape.edge(a) * f * 1.03;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const y = i === rings ? -0.02 : shape.height(x, z) + 0.004;
    pos.push(x, y, z);
    const n = fbm(x * 2.4, z * 2.4, seed % 97);
    c.setHSL(0.2 + 0.05 * n, 0.32 + 0.12 * n, (0.09 + 0.1 * n) * (1 - f * 0.3));
    col.push(c.r, c.g, c.b);
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < segs; j++) {
    const a = i * (segs + 1) + j, b = a + segs + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  m.receiveShadow = true;
  return m;
}

export function rockGeometry(seed, detail = 3) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position, col = [], c = new THREE.Color(), o = (seed % 997) * 0.13;
  for (let i = 0; i < p.count; i++) {
    const v = V(p.getX(i), p.getY(i), p.getZ(i));
    const k = 0.78 + 0.42 * fbm(v.x * 1.6 + o, v.y * 1.6, v.z * 1.6 - o);
    v.multiplyScalar(k);
    if (v.y < -0.2) v.y = -0.2 + (v.y + 0.2) * 0.3; // flat bottom, sits in the sand
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  const nrm = g.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const n = fbm(p.getX(i) * 3 + o, p.getY(i) * 3, p.getZ(i) * 3);
    const moss = clamp((nrm.getY(i) - 0.45) * 2.2, 0, 1) * clamp(n * 1.6 - 0.3, 0, 1);
    c.setHSL(0.09, 0.05, 0.13 + 0.12 * n);
    c.lerp(new THREE.Color().setHSL(0.21, 0.35, 0.12 + 0.06 * n), moss);
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
}
const ROCK_MAT = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: false });

// ---------------------------------------------------------------- tree skeleton
function trunkControls(t, r, base, which = 0) {
  const H = t.height, side = r.sign(), b = base.clone();
  switch (t.style) {
    case 'chokkan': return [b, V(0.03 * side, H * 0.35, 0), V(-0.02 * side, H * 0.7, 0.02), V(0.01, H, 0)];
    case 'bunjin': return [b, V(0.2 * side, H * 0.32, 0.06), V(-0.14 * side, H * 0.62, -0.06), V(0.18 * side, H * 0.88, 0.04), V(0.3 * side, H * 1.05, 0)];
    case 'fukinagashi': return [V(-0.3 * side, b.y, 0), V(-0.12 * side, H * 0.3, 0.05), V(0.3 * side, H * 0.6, -0.05), V(0.8 * side, H * 0.84, 0)];
    case 'kengai': { const k = 0.85 + 0.2 * t.age;
      return [V(-0.25 * side, b.y, 0), V(-0.22 * side, b.y + 0.45 * k, 0.04), V(0.1 * side, b.y + 0.8 * k, -0.03), V(0.6 * side, b.y + 0.65 * k, 0.05), V(1.0 * side, b.y + 0.25, 0.02), V(1.2 * side, 0.2, 0), V(1.32 * side, 0.02, 0)]; }
    case 'hokidachi': return [b, V(0.03 * side, H * 0.25, 0), V(0, H * 0.42, 0.01), V(0.01, H * 0.5, 0)];
    case 'sokan': {
      const o = which ? 0.16 : -0.12, s = which ? 0.74 : 1, d = which ? 1 : -1;
      return [V(o, b.y, 0.03 * which), V(o + 0.12 * d, H * 0.32 * s, 0.04), V(o + 0.2 * d, H * 0.64 * s, -0.04), V(o + 0.27 * d, H * s, 0)];
    }
    default: return [b, V(0.24 * side, H * 0.26, 0.06), V(-0.18 * side, H * 0.52, -0.08), V(0.14 * side, H * 0.78, 0.05), V(0.02 * side, H, 0)];
  }
}

const BARK = [0.27, 0.21, 0.17], JIN = [0.78, 0.75, 0.69];

function skeleton(t, island, r) {
  const bark = new TubeBuilder(10);
  const pads = []; // { p, dist, size, branch, state }
  const box = new THREE.Box3(V(-island.R, 0, -island.R), V(island.R, 0.4, island.R));
  let maxDist = 0;
  const ROOT = 0.6;

  const branch = (pts, r0, r1, d0, opts = {}) => {
    const d = lengths(pts, d0), L = (d[d.length - 1] - d0) || 1;
    const rad = d.map(x => lerp(r0, r1, Math.pow((x - d0) / L, opts.jin ? 1.3 : 0.75)));
    bark.add(pts, rad, d, { ...opts, color: opts.jin ? JIN : BARK, seed: r() * 50 });
    for (const p of pts) box.expandByPoint(p);
    maxDist = Math.max(maxDist, d[d.length - 1]);
    return { pts, rad, d };
  };
  const at = (b, u) => { const i = Math.min(b.pts.length - 1, Math.max(0, Math.round(u * (b.pts.length - 1)))); return { p: b.pts[i], r: b.rad[i], d: b.d[i], i, fwd: b.pts[Math.min(i + 1, b.pts.length - 1)].clone().sub(b.pts[Math.max(i - 1, 0)]).normalize() }; };

  const base = V(r.range(-0.1, 0.1), island.height(0, 0) - 0.03, r.range(-0.06, 0.06));
  const trunks = [];
  for (let k = 0; k < (t.style === 'sokan' ? 2 : 1); k++) {
    trunks.push(branch(sample(trunkControls(t, r, base, k)), t.trunk * (k ? 0.72 : 1), t.trunk * 0.22, ROOT));
  }
  const T0 = trunks[0];

  // nebari: surface roots flaring over the moss
  const nRoots = 5 + Math.floor(r() * 3);
  for (let k = 0; k < nRoots; k++) {
    const a = (k / nRoots) * TAU + r.range(-0.3, 0.3), len = r.range(0.35, 0.7), ctrl = [];
    for (let i = 0; i <= 4; i++) {
      const u = 1 - i / 4, x = T0.pts[0].x + Math.cos(a) * len * u, z = T0.pts[0].z + Math.sin(a) * len * u;
      ctrl.push(V(x, island.height(x, z) + (i === 4 ? 0.06 : 0.005), z));
    }
    const pts = sample(ctrl, 0.04), d = lengths(pts), L = d[d.length - 1];
    bark.add(pts, d.map(x => lerp(0.01, t.trunk * 0.65, Math.pow(x / L, 2.2))), d.map(x => ROOT - L + x), { color: BARK, seed: k });
  }

  // the default branch's own growth: short spurs with foliage on the upper trunk, plus the apex
  const trunkCommits = t.branches.trunk.commits || t.commits || 12;
  const spurs = clamp(Math.round(1 + 1.1 * Math.log2(1 + trunkCommits)), 2, 9);
  for (const tr of trunks) {
    const e = tr.pts[tr.pts.length - 1];
    pads.push({ p: e.clone().add(V(0, 0.04, 0)), dist: tr.d[tr.d.length - 1], size: 1.15, branch: -1, state: 'trunk' });
  }
  let az = r() * TAU;
  const golden = 2.39996;
  for (let k = 0; k < spurs; k++) {
    const host = trunks[k % trunks.length], j = at(host, r.range(0.55, 0.95));
    az += golden;
    const dir = V(Math.cos(az), r.range(0.15, 0.55), Math.sin(az)).normalize();
    const len = r.range(0.22, 0.42) * (0.8 + t.age * 0.4);
    const p2 = j.p.clone().addScaledVector(dir, len);
    const b = branch(sample([j.p.clone(), j.p.clone().addScaledVector(dir, len * 0.55).add(V(0, -0.03, 0)), p2], 0.045), Math.max(0.012, j.r * 0.45), 0.008, j.d);
    pads.push({ p: p2, dist: b.d[b.d.length - 1], size: r.range(0.62, 0.9), branch: -1, state: 'trunk' });
  }

  // one limb per git branch
  const limbs = t.branches.limbs;
  const H = t.height;
  const lean = t.style === 'fukinagashi' ? Math.sign(T0.pts[T0.pts.length - 1].x - T0.pts[0].x || 1) : 0;
  limbs.forEach((L, i) => {
    const c = L.commits || 0;
    if (L.root) {
      // unrelated history: a sucker from the roots
      const a = r() * TAU, rr = r.range(0.35, 0.6);
      const p0 = V(T0.pts[0].x + Math.cos(a) * rr, 0, T0.pts[0].z + Math.sin(a) * rr); p0.y = island.height(p0.x, p0.z) - 0.02;
      const h = 0.35 + 0.12 * Math.log2(1 + c);
      const pts = sample([p0, p0.clone().add(V(Math.cos(a) * 0.1, h * 0.5, Math.sin(a) * 0.1)), p0.clone().add(V(Math.cos(a) * 0.22, h, Math.sin(a) * 0.22))], 0.04);
      const b = branch(pts, 0.035, 0.008, ROOT - 0.2, { branch: i, jin: L.state === 'stale' });
      if (L.state !== 'stale') pads.push({ p: pts[pts.length - 1].clone(), dist: b.d[b.d.length - 1], size: 0.5 + 0.08 * Math.log2(1 + c), branch: i, state: L.state });
      return;
    }
    const host = trunks[i % trunks.length];
    let u = 0.2 + 0.74 * L.at;
    if (t.style === 'hokidachi') u = 0.62 + 0.38 * L.at;
    if (t.style === 'bunjin') u = 0.6 + 0.4 * L.at;
    if (t.style === 'kengai') u = 0.25 + 0.75 * L.at;
    u = clamp(u + r.range(-0.03, 0.03), 0.08, 0.98);
    const j = at(host, u);
    az += golden + r.range(-0.35, 0.35);
    let dir = V(Math.cos(az), 0, Math.sin(az));
    if (lean) dir.x = Math.abs(dir.x) * lean + 0.7 * lean;
    if (t.style === 'hokidachi') dir.y = r.range(0.6, 1.1);
    else if (t.style === 'kengai') dir.y = r.range(-0.35, 0.1);
    else dir.y = r.range(-0.08, 0.28);
    dir.normalize();
    const stale = L.state === 'stale';
    let len = H * (0.13 + 0.075 * Math.log2(1 + c)) * (1.15 - 0.5 * u);
    if (t.style === 'bunjin') len *= 0.65;
    len = clamp(len, 0.16, H * 0.6);
    const droop = stale ? -0.08 : t.style === 'kengai' ? 0.22 : 0.12;
    const p0 = j.p.clone();
    const p1 = p0.clone().addScaledVector(dir, len * 0.4).add(V(r.range(-0.04, 0.04), -droop * len, r.range(-0.04, 0.04)));
    const p2 = p0.clone().addScaledVector(dir, len * 0.78).add(V(0, -droop * len * 0.5, 0));
    const p3 = p0.clone().addScaledVector(dir, len).add(V(0, stale ? len * 0.25 : len * 0.1, 0));
    const r0 = Math.max(0.014, Math.min(j.r * 0.7, 0.025 + 0.012 * Math.log2(1 + c)));
    const b = branch(sample([p0, p1, p2, p3], 0.045), r0, stale ? 0.002 : Math.max(0.007, r0 * 0.3), j.d, { branch: i, jin: stale });
    if (stale) return;
    const size = clamp(0.5 + 0.13 * Math.log2(1 + c), 0.45, 1.25);
    pads.push({ p: p3, dist: b.d[b.d.length - 1], size, branch: i, state: L.state });
    // a branch with real work forks once more
    if (c >= 4) {
      const k = at(b, r.range(0.45, 0.7));
      const side = V(0, 1, 0).cross(k.fwd).normalize().multiplyScalar(r.sign());
      const d2 = k.fwd.clone().multiplyScalar(0.5).add(side).add(V(0, 0.25, 0)).normalize();
      const l2 = len * r.range(0.35, 0.5);
      const q2 = k.p.clone().addScaledVector(d2, l2);
      const b2 = branch(sample([k.p.clone(), k.p.clone().addScaledVector(d2, l2 * 0.5).add(V(0, -0.02, 0)), q2], 0.04), Math.max(0.008, k.r * 0.7), 0.006, k.d, { branch: i });
      pads.push({ p: q2, dist: b2.d[b2.d.length - 1], size: size * 0.72, branch: i, state: L.state });
    }
  });

  for (const pd of pads) box.expandByPoint(pd.p.clone().add(V(0, 0.2 * pd.size, 0)));
  return { bark: bark.geometry(), pads, maxDist, box };
}

// ---------------------------------------------------------------- foliage
// Each pad is a cloud of small rounded clumps over a flattened dome.
const LEAF = {
  trunk: [0.3, 0.38, 0.2], merged: [0.28, 0.42, 0.22], open: [0.21, 0.6, 0.4]
};
function foliage(pads, t, r, u, detail) {
  const per = pad => Math.round((14 + 18 * pad.size) * detail);
  const total = pads.reduce((a, p) => a + per(p), 0);
  const geo = new THREE.OctahedronGeometry(1, 1);
  const mat = patch(new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: false }), u, { leaves: true });
  const mesh = new THREE.InstancedMesh(geo, mat, total);
  mesh.customDepthMaterial = depthFor(u, { leaves: true });
  const aDist = new Float32Array(total), aBranch = new Float32Array(total), aCenter = new Float32Array(total * 3), owner = new Int16Array(total);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = V(), p = V(), c = new THREE.Color(), accent = new THREE.Color().setHSL(t.hue, 0.7, 0.55);
  let i = 0;
  for (const pad of pads) {
    const R = (0.27 + 0.1 * t.age) * pad.size, flat = 0.38, n = per(pad);
    const lobes = [];
    for (let l = 0; l < 2 + (pad.size > 0.8 ? 1 : 0); l++) lobes.push(pad.p.clone().add(V(r.range(-1, 1) * R * 0.5, r.range(-0.05, 0.2) * R, r.range(-1, 1) * R * 0.42)));
    const [h, sat, lig] = LEAF[pad.state] || LEAF.merged;
    for (let k = 0; k < n; k++, i++) {
      const lc = lobes[k % lobes.length];
      const th = r() * TAU, rr = Math.pow(r(), 0.7) * R, dome = Math.sqrt(Math.max(0, 1 - (rr / R) ** 2));
      p.set(lc.x + Math.cos(th) * rr, lc.y + dome * R * flat * r.range(0.4, 1) - R * 0.12, lc.z + Math.sin(th) * rr * 0.85);
      const sz = R * r.range(0.16, 0.26) * (0.7 + 0.5 * dome);
      s.set(sz * 1.25, sz * 0.62, sz * 1.15);
      q.setFromEuler(new THREE.Euler(r.range(-0.3, 0.3), r() * TAU, r.range(-0.3, 0.3)));
      mesh.setMatrixAt(i, m.compose(p, q, s));
      // lighter on top, darker underneath; fresh growth leans toward the project's accent
      c.setHSL(h + r.range(-0.02, 0.02), sat, lig * (0.65 + 0.5 * dome) * r.range(0.85, 1.12));
      if (pad.state === 'open') c.lerp(accent, 0.14);
      mesh.setColorAt(i, c);
      aDist[i] = pad.dist; aBranch[i] = pad.branch; owner[i] = pad.branch; aCenter.set([pad.p.x, pad.p.y, pad.p.z], i * 3);
    }
  }
  geo.setAttribute('aDist', new THREE.InstancedBufferAttribute(aDist, 1));
  geo.setAttribute('aBranch', new THREE.InstancedBufferAttribute(aBranch, 1));
  geo.setAttribute('aCenter', new THREE.InstancedBufferAttribute(aCenter, 3));
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.userData.owner = owner;
  mesh.computeBoundingSphere();
  return mesh;
}

// ---------------------------------------------------------------- one tree on its island
export function buildTree(t, { detail = 1 } = {}) {
  const r = rng(t.seed);
  const island = islandShape(t.seed, 1.45 + 0.3 * t.age, 0.3);
  const u = {
    uTime: { value: 0 }, uWind: { value: 1 }, uH: { value: t.height }, uGrow: { value: 1e3 },
    uHi: { value: -99 }, uHiColor: { value: new THREE.Color(0, 0, 0) }
  };
  const sk = skeleton(t, island, r);
  const group = new THREE.Group();
  const barkMat = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }), u);
  const bark = new THREE.Mesh(sk.bark, barkMat);
  bark.customDepthMaterial = depthFor(u);
  bark.castShadow = true; bark.receiveShadow = true;
  const leaves = foliage(sk.pads, t, r, u, detail);
  const ground = islandMesh(island, t.seed);
  group.add(ground, bark, leaves);

  // one or two stones on the island
  const nStones = 1 + (r() < 0.5 ? 1 : 0);
  for (let k = 0; k < nStones; k++) {
    const a = r() * TAU, d = island.edge(a) * r.range(0.55, 0.8);
    const s = r.range(0.22, 0.42);
    const rock = new THREE.Mesh(rockGeometry(t.seed + k, 2), ROCK_MAT());
    rock.scale.set(s * r.range(1, 1.5), s * r.range(0.7, 1.1), s);
    rock.rotation.y = r() * TAU;
    rock.position.set(Math.cos(a) * d, island.height(Math.cos(a) * d, Math.sin(a) * d) - 0.02, Math.sin(a) * d);
    rock.castShadow = true; rock.receiveShadow = true;
    group.add(rock);
  }

  const hit = new THREE.Mesh(new THREE.CylinderGeometry(island.R * 0.9, island.R * 0.9, sk.box.max.y + 0.2, 12), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = (sk.box.max.y + 0.2) / 2; hit.userData.proxy = true;
  group.add(hit);

  const maxDist = sk.maxDist + 0.5;
  let hiTarget = -99;
  return {
    t, group, bark, leaves, hit, island, box: sk.box, maxDist, uniforms: u,
    radius: Math.max(island.R, sk.box.max.x, -sk.box.min.x, sk.box.max.z, -sk.box.min.z),
    update(time, growth = 1) {
      u.uTime.value = time;
      u.uGrow.value = growth >= 1 ? 1e3 : growth * maxDist;
    },
    highlight(i, color) {
      hiTarget = i == null ? -99 : i;
      u.uHi.value = hiTarget;
      u.uHiColor.value.set(color || 0x000000);
    },
    branchAt(hitInfo) {
      if (!hitInfo) return null;
      if (hitInfo.object === leaves && hitInfo.instanceId != null) return leaves.userData.owner[hitInfo.instanceId];
      if (hitInfo.object === bark && hitInfo.face) return sk.bark.attributes.aBranch.getX(hitInfo.face.a);
      return null;
    },
    dispose() { group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); if (o.customDepthMaterial) o.customDepthMaterial.dispose(); }); }
  };
}

// ---------------------------------------------------------------- raked sand
// Straight rake lines everywhere, concentric ripples around every island and stone.
export function sandMaterial(maxIslands = 48) {
  const u = { uIslands: { value: Array.from({ length: maxIslands }, () => new THREE.Vector3(0, 0, -1)) }, uCount: { value: 0 } };
  const mat = new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 1 });
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vXZ;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvXZ = (modelMatrix * vec4(transformed, 1.0)).xz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec2 vXZ; uniform vec3 uIslands[${maxIslands}]; uniform int uCount;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      // returns groove phase and its gradient direction
      vec3 rake(vec2 p) {
        float best = 1e5; vec2 dir = vec2(0.0, 1.0);
        for (int i = 0; i < ${maxIslands}; i++) {
          if (i >= uCount) break;
          vec3 s = uIslands[i]; vec2 d = p - s.xy; float l = length(d);
          float e = l - s.z;
          if (e < best) { best = e; dir = d / max(l, 1e-4); }
        }
        float band = 1.35;
        float w = smoothstep(band, band - 0.35, best);
        float straight = p.y;
        float phase = mix(straight, best, w);
        vec2 g = normalize(mix(vec2(0.0, 1.0), dir, w));
        return vec3(phase, g);
      }`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
        vec3 rk = rake(vXZ);
        float freq = 9.0;
        float gr = sin(rk.x * freq * 6.2832);
        float dg = cos(rk.x * freq * 6.2832);
        vec3 nw = normalize(vec3(-dg * rk.y * 0.55, 1.0, -dg * rk.z * 0.55));
        normal = normalize((viewMatrix * vec4(nw, 0.0)).xyz);`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        { vec3 rk2 = rake(vXZ); float g2 = sin(rk2.x * 9.0 * 6.2832);
          float grain = h21(floor(vXZ * 220.0)) * 0.08 - 0.04;
          diffuseColor.rgb *= 0.93 + 0.06 * g2 + grain; }`);
  };
  mat.customProgramCacheKey = () => 'sand' + maxIslands;
  return {
    material: mat,
    setIslands(list) { list.slice(0, maxIslands).forEach((s, i) => u.uIslands.value[i].set(s.x, s.z, s.r)); u.uCount.value = Math.min(list.length, maxIslands); }
  };
}

// ---------------------------------------------------------------- surroundings
function woodColor(r, base = [0.08, 0.42, 0.42]) { return new THREE.Color().setHSL(base[0] + r.range(-0.01, 0.01), base[1], base[2] * r.range(0.82, 1.1)); }

export function buildSurroundings({ W, D, seed = 7, lanterns = [[-W / 2 + 1.6, -D / 2 + 1.8], [W / 2 - 1.4, D / 2 - 2.2]] }) {
  const r = rng(seed);
  const g = new THREE.Group();
  const shadowy = m => { m.castShadow = true; m.receiveShadow = true; return m; };

  // dark stone border
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.8 });
  for (const [w, d, x, z] of [[W + 0.6, 0.3, 0, D / 2 + 0.15], [W + 0.6, 0.3, 0, -D / 2 - 0.15], [0.3, D, W / 2 + 0.15, 0], [0.3, D, -W / 2 - 0.15, 0]]) {
    const m = shadowy(new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, d), edgeMat)); m.position.set(x, 0.03, z); g.add(m);
  }
  // pebble strip along the border
  const pebGeo = rockGeometry(3, 1), pebN = 900;
  const peb = new THREE.InstancedMesh(pebGeo, ROCK_MAT(), pebN);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  for (let i = 0; i < pebN; i++) {
    const side = i % 4, t = r();
    let x, z;
    if (side < 2) { x = (t - 0.5) * W; z = (side ? 1 : -1) * (D / 2 - r.range(0.15, 0.55)); } else { z = (t - 0.5) * D; x = (side === 2 ? 1 : -1) * (W / 2 - r.range(0.15, 0.55)); }
    const s = r.range(0.06, 0.13);
    q.setFromEuler(new THREE.Euler(0, r() * TAU, 0));
    peb.setMatrixAt(i, m4.compose(V(x, 0.01, z), q, V(s * 1.3, s * 0.6, s)));
    c.setHSL(0.08, 0.05, r.range(0.15, 0.4)); peb.setColorAt(i, c);
  }
  peb.receiveShadow = true; g.add(peb);

  // engawa: wooden deck along the front
  const deckD = 4.2;
  for (let i = 0; i < Math.ceil(deckD / 0.32); i++) {
    const m = shadowy(new THREE.Mesh(new THREE.BoxGeometry(W + 6, 0.12, 0.3), new THREE.MeshStandardMaterial({ color: woodColor(r, [0.075, 0.4, 0.5]), roughness: 0.7 })));
    m.position.set(0, 0.42, D / 2 + 0.55 + i * 0.32); g.add(m);
  }
  const beam = shadowy(new THREE.Mesh(new THREE.BoxGeometry(W + 6, 0.36, 0.22), new THREE.MeshStandardMaterial({ color: 0x3b2a1e, roughness: 0.8 })));
  beam.position.set(0, 0.2, D / 2 + 0.42); g.add(beam);

  // slatted fence behind
  const fenceH = 3.4, slatW = 0.13, gap = 0.05, n = Math.ceil((W + 8) / (slatW + gap));
  const slats = new THREE.InstancedMesh(new THREE.BoxGeometry(slatW, fenceH, 0.06), new THREE.MeshStandardMaterial({ roughness: 0.75 }), n);
  for (let i = 0; i < n; i++) {
    slats.setMatrixAt(i, m4.compose(V(-(W + 8) / 2 + i * (slatW + gap), fenceH / 2, -D / 2 - 1.2), new THREE.Quaternion(), V(1, 1, 1)));
    slats.setColorAt(i, woodColor(r, [0.07, 0.45, 0.42]));
  }
  slats.castShadow = true; slats.receiveShadow = true; g.add(slats);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(W + 8, fenceH, 0.1), new THREE.MeshStandardMaterial({ color: 0x1d1b19, roughness: 1 }));
  wall.position.set(0, fenceH / 2, -D / 2 - 1.3); g.add(wall);
  // gravel strip between sand and fence
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(W + 8, 1.2), new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 1 }));
  strip.rotation.x = -Math.PI / 2; strip.position.set(0, 0.005, -D / 2 - 0.6); strip.receiveShadow = true; g.add(strip);

  // bamboo grove above the fence
  const nb = 140;
  const stalk = new THREE.CylinderGeometry(0.055, 0.07, 1, 7, 1);
  stalk.translate(0, 0.5, 0);
  const bambooMat = new THREE.MeshStandardMaterial({ roughness: 0.55 });
  bambooMat.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vY;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvY = (instanceMatrix * vec4(transformed, 1.0)).y;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vY;').replace('#include <color_fragment>', '#include <color_fragment>\nfloat node = smoothstep(0.035, 0.0, abs(fract(vY / 0.62) - 0.5) - 0.465); diffuseColor.rgb *= 1.0 - node * 0.45;');
  };
  const bamboo = new THREE.InstancedMesh(stalk, bambooMat, nb);
  const tops = [];
  for (let i = 0; i < nb; i++) {
    const x = r.range(-(W + 8) / 2, (W + 8) / 2), z = -D / 2 - r.range(1.6, 4.8), h = r.range(6, 10.5);
    const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(-0.06, 0.06), 0, r.range(-0.07, 0.07)));
    bamboo.setMatrixAt(i, m4.compose(V(x, 0, z), tilt, V(r.range(0.8, 1.3), h, r.range(0.8, 1.3))));
    bamboo.setColorAt(i, new THREE.Color().setHSL(r.range(0.14, 0.22), r.range(0.35, 0.55), r.range(0.32, 0.5)));
    tops.push(V(x, h * r.range(0.6, 0.98), z));
  }
  bamboo.castShadow = true; g.add(bamboo);
  // bamboo leaves: thin blades in clusters
  const nl = nb * 26;
  const blade = new THREE.PlaneGeometry(0.06, 0.42); blade.translate(0, 0.21, 0);
  const leaves = new THREE.InstancedMesh(blade, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.7 }), nl);
  for (let i = 0; i < nl; i++) {
    const tp = tops[i % nb];
    const p = tp.clone().add(V(r.range(-1.1, 1.1), r.range(-1.8, 0.8), r.range(-0.7, 0.7)));
    const e = new THREE.Euler(r.range(0.6, 1.9), r() * TAU, r.range(-0.4, 0.4));
    leaves.setMatrixAt(i, m4.compose(p, new THREE.Quaternion().setFromEuler(e), V(1, r.range(0.7, 1.3), 1)));
    leaves.setColorAt(i, new THREE.Color().setHSL(r.range(0.18, 0.27), r.range(0.4, 0.6), r.range(0.25, 0.42)));
  }
  leaves.castShadow = true; g.add(leaves);

  // stone lanterns (toro); their lamps are lit at night
  const lamps = [];
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x77726a, roughness: 0.95 });
  for (const [x, z] of lanterns) {
    const lg = new THREE.Group();
    const part = (geo, y) => { const m = shadowy(new THREE.Mesh(geo, stoneMat)); m.position.y = y; lg.add(m); return m; };
    part(new THREE.CylinderGeometry(0.42, 0.5, 0.18, 6), 0.09);
    part(new THREE.CylinderGeometry(0.12, 0.16, 1.0, 10), 0.68);
    part(new THREE.CylinderGeometry(0.4, 0.34, 0.16, 6), 1.26);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.42), new THREE.MeshStandardMaterial({ color: 0x2b2722, emissive: 0xffb45c, emissiveIntensity: 0, roughness: 0.6 }));
    box.position.y = 1.52; lg.add(box);
    part(new THREE.ConeGeometry(0.62, 0.36, 6), 1.88);
    part(new THREE.SphereGeometry(0.1, 10, 8), 2.1);
    const light = new THREE.PointLight(0xffb45c, 0, 7, 1.8); light.position.y = 1.52; lg.add(light);
    lg.position.set(x, 0, z); g.add(lg);
    lamps.push({ box, light });
  }
  return { group: g, lamps, deckFront: D / 2 + 0.55 + deckD };
}

// ---------------------------------------------------------------- sky & light
export function skyDome() {
  const u = { uTop: { value: new THREE.Color() }, uBottom: { value: new THREE.Color() }, uSun: { value: new THREE.Color() }, uSunDir: { value: V(0.5, 0.4, -0.6).normalize() } };
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: u,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uSun; uniform vec3 uSunDir; varying vec3 vD;
      void main(){ float h = clamp(vD.y * 1.6 + 0.15, 0.0, 1.0); vec3 c = mix(uBottom, uTop, h);
        c += uSun * pow(max(dot(normalize(vD), uSunDir), 0.0), 12.0) * 0.6; gl_FragColor = vec4(c, 1.0); }`
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16), m);
  mesh.userData.u = u;
  return mesh;
}

export const THEMES = {
  day: { top: 0xbfd3e6, bottom: 0xf1e3c8, sun: 0xffd9a0, fog: 0xe9dfcc, key: 0xffe0b0, keyI: 2.6, hemiSky: 0xd9e6f2, hemiGround: 0xb59f80, hemiI: 1.15, exposure: 1.0, lamps: 0, hi: 0x6b4a10 },
  night: { top: 0x0b1424, bottom: 0x1f2430, sun: 0x8fa6d9, fog: 0x15181f, key: 0xc9d3ee, keyI: 0.7, hemiSky: 0x4a5266, hemiGround: 0x1a1612, hemiI: 0.45, exposure: 1.15, lamps: 1, hi: 0x3a5a7a }
};

export function makeRenderer(canvas, { shadows = true, alpha = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const sky = skyDome(); scene.add(sky);
  scene.fog = new THREE.Fog(0xe9dfcc, 30, 95);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 1); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.castShadow = shadows;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 300);
  const api = {
    renderer, scene, camera, key, hemi, sky, lamps: [], theme: 'day',
    // aim the sun and size its shadow box around a region of the garden
    fitShadow(cx, cz, half) {
      key.target.position.set(cx, 0, cz);
      key.position.set(cx + half * 0.9, half * 1.2 + 6, cz + half * 0.55);
      const s = key.shadow.camera; s.left = -half; s.right = half; s.top = half; s.bottom = -half; s.near = 0.5; s.far = half * 4 + 20; s.updateProjectionMatrix();
      sky.userData.u.uSunDir.value.copy(key.position).sub(key.target.position).normalize();
      renderer.shadowMap.needsUpdate = true;
    },
    setTheme(name) {
      const T = THEMES[name] || THEMES.day; api.theme = name;
      const su = sky.userData.u; su.uTop.value.set(T.top); su.uBottom.value.set(T.bottom); su.uSun.value.set(T.sun);
      scene.fog.color.set(T.fog);
      key.color.set(T.key); key.intensity = T.keyI;
      hemi.color.set(T.hemiSky); hemi.groundColor.set(T.hemiGround); hemi.intensity = T.hemiI;
      renderer.toneMappingExposure = T.exposure;
      for (const l of api.lamps) { l.box.material.emissiveIntensity = T.lamps * 2.2; l.light.intensity = T.lamps * 9; l.light.visible = T.lamps > 0; }
      renderer.shadowMap.needsUpdate = true;
    },
    setSize(w, h, dpr) { renderer.setPixelRatio(dpr); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); },
    render() { renderer.render(scene, camera); }
  };
  api.setTheme('day');
  return api;
}

export { THREE };
