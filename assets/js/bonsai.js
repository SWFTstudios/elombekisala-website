// Procedural bonsai: grows one tree from a project's traits (see bonsai-traits.mjs).
// Look: glass bark with light-carrying "water veins" that climb from the root tips
// to the twigs, bioluminescent juniper pads, a moss mound and a dark glazed pot.
import * as THREE from 'three';

const TAU = Math.PI * 2;

function rng(seed) {
  let a = seed >>> 0;
  const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.range = (a, b) => a + (b - a) * r();
  r.sign = () => (r() < 0.5 ? -1 : 1);
  return r;
}
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- shaders
const WIND = /* glsl */`
uniform float uTime; uniform float uWind; uniform float uH;
vec3 wind(vec3 p) {
  float k = clamp(p.y / uH, 0.0, 1.4); k *= k;
  float s = sin(uTime * 0.9 + p.x * 1.3) * 0.6 + sin(uTime * 1.7 + p.z * 2.1) * 0.3;
  return p + vec3(s * 0.035, 0.0, cos(uTime * 0.7 + p.x) * 0.02) * k * uWind;
}`;
const HSV = /* glsl */`
vec3 hsv(float h, float s, float v) {
  vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return v * mix(vec3(1.0), k, s);
}`;

function common(t) {
  return {
    uTime: { value: 0 }, uWind: { value: 1 }, uH: { value: t.height },
    uGrow: { value: 1e3 }, uHue: { value: t.hue }, uSat: { value: t.sat }
  };
}

// Glass bark: tinted, mostly see-through, bright at grazing angles.
function barkMaterial(u) {
  return new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false,
    vertexShader: WIND + `
      attribute float aDist; varying float vDist; varying vec3 vN; varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); w.xyz = wind(w.xyz); vW = w.xyz; vDist = aDist;
        vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: HSV + `
      uniform float uGrow; uniform float uHue; uniform float uSat; uniform float uTime;
      varying float vDist; varying vec3 vN; varying vec3 vW;
      void main(){ if (vDist > uGrow) discard;
        vec3 n = normalize(vN); vec3 v = normalize(cameraPosition - vW);
        float f = pow(1.0 - abs(dot(n, v)), 2.2);
        vec3 L = normalize(vec3(0.5, 0.9, 0.35)); float d = max(dot(n, L), 0.0);
        vec3 h = normalize(L + v); float sp = pow(max(dot(n, h), 0.0), 60.0);
        vec3 tint = mix(vec3(0.08, 0.3, 0.75), hsv(uHue, uSat * 0.8, 0.8), 0.35);
        vec3 c = tint * (0.12 + 0.35 * d) + tint * f * 1.2 + vec3(sp) * 0.9;
        gl_FragColor = vec4(c, clamp(0.16 + f * 0.75 + sp, 0.0, 1.0)); }`
  });
}

// Water veins: emissive strands; light pulses travel up by distance from the root tips.
function veinMaterial(u) {
  return new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: WIND + `
      attribute float aDist; varying float vDist;
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); w.xyz = wind(w.xyz); vDist = aDist;
        gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: HSV + `
      uniform float uGrow; uniform float uHue; uniform float uSat; uniform float uTime;
      varying float vDist;
      void main(){ if (vDist > uGrow) discard;
        float d = vDist, t = uTime;
        float slow = 0.5 + 0.5 * sin(d * 3.6 - t * 1.6);
        float fast = 0.5 + 0.5 * sin(d * 12.0 - t * 4.0 + 1.3);
        float swell = 0.5 + 0.5 * sin(d * 1.3 - t * 0.8);
        float w = pow(slow, 3.0) * 0.8 + pow(fast, 7.0) * 0.5 + pow(swell, 2.0) * 0.25 + 0.28;
        float hue = uHue + 0.07 * sin(d * 0.9 - t * 0.35) + d * 0.025;
        float breathe = 0.95 + 0.12 * sin(t * 1.2);
        float front = exp(-max(uGrow - d, 0.0) * 6.0) * step(uGrow, 50.0);
        vec3 col = hsv(hue, uSat * 0.9, 1.0); col /= 0.45 + dot(col, vec3(0.2126, 0.7152, 0.0722));
        vec3 c = col * 0.6 * (w * 1.25 + 0.06) * breathe + hsv(hue, 0.4, 1.0) * front * 2.0;
        gl_FragColor = vec4(c, 1.0); }`
  });
}

// Juniper needles / grass: instanced blades; tips glow, a wave of light rises, needles twinkle.
function foliageMaterial(u, { glow = 1, hueShift = 0, base = 1 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...u, uGlow: { value: glow }, uShift: { value: hueShift }, uBase: { value: base } },
    side: THREE.DoubleSide,
    vertexShader: WIND + `
      attribute float aRand; attribute float aDist; attribute vec3 aCenter;
      uniform float uGrow; varying float vAlong; varying float vRand; varying float vY; varying vec3 vN;
      void main(){
        vec4 l = instanceMatrix * vec4(position, 1.0);
        float g = smoothstep(aDist, aDist + 0.35, uGrow);
        l.xyz = mix(aCenter, l.xyz, g);
        vec4 w = modelMatrix * l; w.xyz = wind(w.xyz);
        vAlong = uv.y; vRand = aRand; vY = w.y;
        vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: HSV + `
      uniform float uTime; uniform float uHue; uniform float uSat; uniform float uGlow; uniform float uShift; uniform float uBase;
      varying float vAlong; varying float vRand; varying float vY; varying vec3 vN;
      void main(){ float t = uTime;
        float wave = pow(0.5 + 0.5 * sin(vY * 1.6 - t * 1.5), 3.0);
        float twinkle = pow(0.5 + 0.5 * sin(t * 1.6 + vRand * 40.0), 3.0);
        float hue = uHue + uShift + (vRand - 0.5) * 0.12 + vY * 0.02 - t * 0.006;
        vec3 pal = hsv(hue, uSat * 0.8, 1.0); pal /= 0.45 + dot(pal, vec3(0.2126, 0.7152, 0.0722)); pal *= 0.75;
        float tip = pow(vAlong, 1.6);
        float lit = 0.55 + 0.45 * abs(dot(normalize(vN), normalize(vec3(0.5, 0.9, 0.35))));
        vec3 body = mix(vec3(0.01, 0.03, 0.05), hsv(hue + 0.02, uSat * 0.85, 0.16), vAlong) * lit * uBase;
        vec3 em = pal * (tip * (wave * 0.75 + 0.12) + pow(vAlong, 4.0) * twinkle * 0.55 + 0.015) * uGlow;
        gl_FragColor = vec4(body + em, 1.0); }`
  });
}

// ---------------------------------------------------------------- geometry
// Tapered tube along a polyline with per-point radius and distance-from-root.
class TubeBuilder {
  constructor(sides) { this.sides = sides; this.pos = []; this.nor = []; this.dist = []; this.idx = []; }
  add(pts, radii, dists) {
    const n = pts.length; if (n < 2) return;
    const S = this.sides, base = this.pos.length / 3;
    let T = pts[1].clone().sub(pts[0]).normalize();
    let N = Math.abs(T.y) < 0.9 ? V(0, 1, 0).cross(T).normalize() : V(1, 0, 0).cross(T).normalize();
    for (let i = 0; i < n; i++) {
      const nt = (i < n - 1 ? pts[i + 1].clone().sub(pts[i]) : pts[i].clone().sub(pts[i - 1])).normalize();
      const axis = T.clone().cross(nt);
      if (axis.lengthSq() > 1e-10) N.applyAxisAngle(axis.normalize(), Math.acos(THREE.MathUtils.clamp(T.dot(nt), -1, 1)));
      T = nt;
      const B = T.clone().cross(N).normalize();
      for (let s = 0; s <= S; s++) {
        const a = (s / S) * TAU, c = Math.cos(a), sn = Math.sin(a);
        const nx = N.x * c + B.x * sn, ny = N.y * c + B.y * sn, nz = N.z * c + B.z * sn;
        this.pos.push(pts[i].x + nx * radii[i], pts[i].y + ny * radii[i], pts[i].z + nz * radii[i]);
        this.nor.push(nx, ny, nz); this.dist.push(dists[i]);
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
    g.setAttribute('aDist', new THREE.Float32BufferAttribute(this.dist, 1));
    g.setIndex(this.idx);
    return g;
  }
}

// Smooth a few control points into an evenly sampled path.
function sample(ctrl, step = 0.045) {
  const c = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal');
  const n = Math.max(4, Math.ceil(c.getLength() / step));
  return c.getSpacedPoints(n);
}
function lengths(pts, start = 0) {
  const d = [start];
  for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + pts[i].distanceTo(pts[i - 1]));
  return d;
}

// Moss mound surface height above the pot rim (y = 0).
const MOUND = { rx: 1.02, rz: 0.7, h: 0.17 };
const moundY = (x, z) => MOUND.h * Math.sqrt(Math.max(0, 1 - (x / MOUND.rx) ** 2 - (z / MOUND.rz) ** 2));

// ---------------------------------------------------------------- skeleton
function trunkControls(t, r, which = 0) {
  const H = t.height, base = V(r.range(-0.08, 0.08), moundY(0, 0) - 0.02, r.range(-0.05, 0.05));
  const side = r.sign();
  switch (t.style) {
    case 'chokkan':
      return [base, V(0.02 * side, H * 0.3, 0), V(-0.02 * side, H * 0.65, 0.02), V(0.01, H, 0)];
    case 'bunjin':
      return [base, V(0.18 * side, H * 0.3, 0.05), V(-0.12 * side, H * 0.62, -0.06), V(0.2 * side, H * 0.9, 0.04), V(0.32 * side, H * 1.08, 0)];
    case 'fukinagashi':
      return [V(-0.25 * side, base.y, 0), V(-0.1 * side, H * 0.3, 0.05), V(0.3 * side, H * 0.62, -0.05), V(0.75 * side, H * 0.85, 0)];
    case 'kengai':
      { const k = 0.85 + 0.25 * t.age;
      return [V(-0.3 * side, base.y, 0), V(-0.28 * side, 0.42 * k, 0.04), V(0.05 * side, 0.78 * k, -0.03), V(0.55 * side, 0.7 * k, 0.05), V(1.0 * side, 0.3, 0.02), V(1.22 * side, -0.05, 0), V(1.32 * side, -0.32, 0)]; }
    case 'hokidachi':
      return [base, V(0.03 * side, H * 0.22, 0), V(0, H * 0.4, 0.01), V(0.01, H * 0.48, 0)];
    case 'sokan': {
      const o = which === 0 ? -0.1 : 0.12, s = which === 0 ? 1 : 0.72;
      return [V(o, base.y, 0.02 * which), V(o - 0.12 * (which ? -1 : 1), H * 0.3 * s, 0.04), V(o - 0.18 * (which ? -1 : 1), H * 0.62 * s, -0.04), V(o - 0.26 * (which ? -1 : 1), H * s, 0)];
    }
    default: // moyogi
      return [base, V(0.22 * side, H * 0.25, 0.06), V(-0.18 * side, H * 0.52, -0.08), V(0.14 * side, H * 0.78, 0.05), V(0.02 * side, H, 0)];
  }
}

function grow(t) {
  const r = rng(t.seed);
  const bark = new TubeBuilder(12), veins = new TubeBuilder(6);
  const tips = []; // { p, dist, size }
  let maxDist = 0;
  const box = new THREE.Box3(V(-1.2, -0.55, -0.85), V(1.2, 0.2, 0.85));

  const ROOT = 0.55; // distance budget used by the roots, so the trunk starts at d = ROOT
  const branch = (pts, r0, r1, d0, { strands = 1 } = {}) => {
    const d = lengths(pts, d0), L = d[d.length - 1] - d0;
    const rad = d.map(x => THREE.MathUtils.lerp(r0, r1, Math.pow((x - d0) / (L || 1), 0.8)));
    bark.add(pts, rad, d);
    // veins: helical strands inside the glass
    const n = Math.max(1, strands);
    for (let k = 0; k < n; k++) {
      const off = (k / n) * TAU + r() * 0.5, turns = r.range(1.5, 3);
      const vp = pts.map((p, i) => {
        if (n === 1) return p.clone();
        const q = pts[Math.min(i + 1, pts.length - 1)].clone().sub(pts[Math.max(i - 1, 0)]).normalize();
        const side = Math.abs(q.y) < 0.9 ? V(0, 1, 0).cross(q).normalize() : V(1, 0, 0).cross(q).normalize();
        const up = q.clone().cross(side);
        const a = off + (d[i] - d0) / (L || 1) * turns * TAU;
        return p.clone().addScaledVector(side, Math.cos(a) * rad[i] * 0.45).addScaledVector(up, Math.sin(a) * rad[i] * 0.45);
      });
      veins.add(vp, rad.map(x => Math.max(0.0045, x * (n === 1 ? 0.32 : 0.17))), d);
    }
    for (const p of pts) box.expandByPoint(p);
    maxDist = Math.max(maxDist, d[d.length - 1]);
    return { pts, rad, d };
  };
  const at = (b, u) => { const i = Math.min(b.pts.length - 1, Math.round(u * (b.pts.length - 1))); return { p: b.pts[i], r: b.rad[i], d: b.d[i], i }; };

  // Trunks
  const trunks = [];
  const nTrunks = t.style === 'sokan' ? 2 : 1;
  for (let k = 0; k < nTrunks; k++) {
    const pts = sample(trunkControls(t, r, k));
    trunks.push(branch(pts, t.trunk * (k ? 0.75 : 1), t.trunk * 0.24, ROOT, { strands: 3 }));
  }
  const T0 = trunks[0];

  // Roots: from the trunk base out over the moss; d runs 0 (tip) -> ROOT (trunk)
  const nRoots = 5 + Math.floor(r() * 3);
  for (let k = 0; k < nRoots; k++) {
    const a = (k / nRoots) * TAU + r.range(-0.3, 0.3), len = r.range(0.35, 0.62);
    const ctrl = [];
    for (let i = 0; i <= 4; i++) {
      const u = 1 - i / 4, x = T0.pts[0].x + Math.cos(a) * len * u, z = T0.pts[0].z + Math.sin(a) * len * u * 0.8;
      ctrl.push(V(x, moundY(x, z) + (i === 4 ? 0.05 : 0.004), z));
    }
    const pts = sample(ctrl, 0.035);
    const d = lengths(pts); const L = d[d.length - 1];
    const dd = d.map(x => ROOT - L + x);
    const rad = d.map(x => THREE.MathUtils.lerp(0.008, t.trunk * 0.62, Math.pow(x / L, 2.2)));
    bark.add(pts, rad, dd);
    veins.add(pts, rad.map(x => Math.max(0.004, x * 0.3)), dd);
  }

  // Limbs. Broom: everything fans from the top of a short trunk.
  const limbs = [];
  const H = t.height;
  const nL = t.limbs + (t.style === 'hokidachi' ? 2 : 0);
  const golden = 2.39996;
  let az = r() * TAU;
  for (let k = 0; k < nL; k++) {
    const host = trunks[k % trunks.length];
    let u, dir, len, droop;
    const lean = t.style === 'fukinagashi' ? Math.sign(host.pts[host.pts.length - 1].x || 1) : 0;
    if (t.style === 'hokidachi') {
      u = r.range(0.82, 1);
      az += golden;
      dir = V(Math.cos(az) * 0.75, r.range(0.65, 1.0), Math.sin(az) * 0.55).normalize();
      len = H * r.range(0.3, 0.44); droop = -0.12;
    } else if (t.style === 'kengai') {
      u = THREE.MathUtils.lerp(0.32, 0.95, (k + r() * 0.5) / nL);
      az += golden;
      dir = V(Math.cos(az), r.range(-0.15, 0.25), Math.sin(az) * 0.8).normalize();
      len = r.range(0.35, 0.6); droop = 0.12;
    } else {
      u = THREE.MathUtils.lerp(t.style === 'bunjin' ? 0.62 : 0.3, 0.9, (k + r() * 0.6) / nL);
      az += golden + r.range(-0.3, 0.3);
      dir = V(Math.cos(az), r.range(-0.05, 0.3), Math.sin(az) * 0.85);
      if (lean) dir.x = Math.abs(dir.x) * lean + 0.6 * lean;
      dir.normalize();
      len = H * r.range(0.3, 0.46) * (1.15 - u * 0.5) * (t.style === 'bunjin' ? 0.6 : 1);
      droop = t.style === 'chokkan' ? 0.16 : 0.1;
    }
    const j = at(host, u);
    const p0 = j.p.clone();
    const p1 = p0.clone().addScaledVector(dir, len * 0.4).add(V(r.range(-0.05, 0.05), -droop * len, r.range(-0.05, 0.05)));
    const p2 = p0.clone().addScaledVector(dir, len * 0.78).add(V(0, -droop * len * 0.6, 0));
    const p3 = p0.clone().addScaledVector(dir, len).add(V(0, len * 0.08, 0));
    const b = branch(sample([p0, p1, p2, p3], 0.04), j.r * (t.style === 'hokidachi' ? 0.8 : 0.62), Math.max(0.01, j.r * 0.16), j.d, { strands: j.r > 0.05 ? 2 : 1 });
    limbs.push(b);
    tips.push({ p: p3, dist: b.d[b.d.length - 1], size: 1 });
  }
  // Apex pad(s)
  for (const tr of trunks) if (t.style !== 'hokidachi') {
    const e = tr.pts[tr.pts.length - 1];
    tips.push({ p: e.clone(), dist: tr.d[tr.d.length - 1], size: 1.15 });
  }

  // Sub-branches until there is one pad per tip the traits ask for
  let guard = 0;
  while (tips.length < t.pads && guard++ < 200) {
    const host = limbs[Math.floor(r() * limbs.length)];
    const j = at(host, r.range(0.35, 0.8));
    const fwd = host.pts[Math.min(j.i + 1, host.pts.length - 1)].clone().sub(host.pts[Math.max(j.i - 1, 0)]).normalize();
    const side = V(0, 1, 0).cross(fwd).normalize().multiplyScalar(r.sign());
    const dir = fwd.clone().multiplyScalar(0.55).add(side).add(V(0, r.range(0.05, 0.45), 0)).normalize();
    const len = r.range(0.18, 0.34) * (0.7 + t.age * 0.4);
    const p1 = j.p.clone().addScaledVector(dir, len * 0.55).add(V(0, -0.02, 0));
    const p2 = j.p.clone().addScaledVector(dir, len).add(V(0, 0.05, 0));
    const b = branch(sample([j.p.clone(), p1, p2], 0.035), Math.max(0.008, j.r * 0.6), 0.006, j.d);
    tips.push({ p: p2, dist: b.d[b.d.length - 1], size: r.range(0.6, 0.85) });
  }
  for (const tp of tips) box.expandByPoint(tp.p.clone().add(V(0, 0.18, 0)));

  return { bark: bark.geometry(), veins: veins.geometry(), tips, maxDist, box, r };
}

// ---------------------------------------------------------------- foliage
function needleGeometry() {
  // two crossed tapered blades, uv.y = 0 at base, 1 at tip
  const h = 0.055, w = 0.009, g = new THREE.BufferGeometry();
  const P = [], U = [], N = [], I = [];
  for (let k = 0; k < 2; k++) {
    const a = k * Math.PI / 2, cx = Math.cos(a), cz = Math.sin(a), b = P.length / 3;
    P.push(-w * cx, 0, -w * cz, w * cx, 0, w * cz, -w * 0.3 * cx, h * 0.6, -w * 0.3 * cz, w * 0.3 * cx, h * 0.6, w * 0.3 * cz, 0, h, 0);
    U.push(0, 0, 1, 0, 0, 0.6, 1, 0.6, 0.5, 1);
    for (let i = 0; i < 5; i++) N.push(-cz, 0, cx);
    I.push(b, b + 1, b + 2, b + 1, b + 3, b + 2, b + 2, b + 3, b + 4);
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setIndex(I);
  return g;
}

function padLobes(tips, t, r) {
  return tips.map(tip => {
    const R = (0.17 + 0.07 * (t.age || 0.3)) * tip.size, n = 2 + Math.floor(r() * 2), lobes = [];
    for (let l = 0; l < n; l++) lobes.push({ c: tip.p.clone().add(V(r.range(-1, 1) * R * 0.55, r.range(-0.1, 0.22) * R, r.range(-1, 1) * R * 0.45)), R: R * r.range(0.75, 1) });
    return { tip, lobes };
  });
}

function instanced(geo, mat, count, fill) {
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const aRand = new Float32Array(count), aDist = new Float32Array(count), aCenter = new Float32Array(count * 3);
  const m = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    const { matrix, rand, dist, center } = fill(i, m);
    mesh.setMatrixAt(i, matrix); aRand[i] = rand; aDist[i] = dist; aCenter.set([center.x, center.y, center.z], i * 3);
  }
  geo.setAttribute('aRand', new THREE.InstancedBufferAttribute(aRand, 1));
  geo.setAttribute('aDist', new THREE.InstancedBufferAttribute(aDist, 1));
  geo.setAttribute('aCenter', new THREE.InstancedBufferAttribute(aCenter, 3));
  mesh.frustumCulled = false;
  return mesh;
}

// needles over a dome per lobe
function foliage(pads, r, perPad, mat, flat = 0.42) {
  const q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = V(0, 1, 0);
  const list = [];
  for (const pad of pads) for (let k = 0; k < perPad; k++) list.push([pad, k]);
  return instanced(needleGeometry(), mat, list.length, (i, m) => {
    const [pad, k] = list[i], lobe = pad.lobes[k % pad.lobes.length], R = lobe.R, c = lobe.c;
    const th = r() * TAU, rr = Math.pow(r(), 0.65) * R, dome = Math.sqrt(Math.max(0, 1 - (rr / R) ** 2));
    const y = dome * R * flat * r.range(0.75, 1.05);
    p.set(c.x + Math.cos(th) * rr, c.y + y - R * flat * 0.3, c.z + Math.sin(th) * rr * 0.85);
    const outward = V(Math.cos(th) * (rr / R) * 1.1, 0.6 + dome, Math.sin(th) * (rr / R) * 1.1).normalize().add(V(r.range(-0.3, 0.3), 0, r.range(-0.3, 0.3))).normalize();
    q.setFromUnitVectors(up, outward);
    const sc = r.range(0.75, 1.3) * (0.85 + 0.3 * pad.tip.size);
    s.set(sc, sc * r.range(0.8, 1.2), sc);
    return { matrix: m.compose(p, q, s), rand: r(), dist: pad.tip.dist, center: pad.tip.p };
  });
}

// dark, dense cores so pads read as solid clouds of foliage, not tufts
function cores(pads, r, mat) {
  const list = [];
  for (const pad of pads) for (const lobe of pad.lobes) list.push([pad, lobe]);
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const q = new THREE.Quaternion(), s = new THREE.Vector3();
  return instanced(geo, mat, list.length, (i, m) => {
    const [pad, lobe] = list[i];
    s.set(lobe.R * 0.78, lobe.R * 0.34, lobe.R * 0.66);
    q.setFromAxisAngle(V(0, 1, 0), r() * TAU);
    return { matrix: m.compose(lobe.c.clone().add(V(0, -lobe.R * 0.06, 0)), q, s), rand: r(), dist: pad.tip.dist, center: pad.tip.p };
  });
}

// ---------------------------------------------------------------- pot, moss, floor
function pot(t) {
  const g = new THREE.Group();
  const prof = [[0.78, -0.46], [0.86, -0.46], [0.9, -0.42], [1.02, -0.36], [1.12, -0.06], [1.17, -0.01], [1.17, 0.02], [1.1, 0.03], [1.06, -0.04]].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(prof, 72);
  geo.scale(1, 1, 0.68);
  const mat = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.32, metalness: 0.15 });
  g.add(new THREE.Mesh(geo, mat));
  // feet
  for (const [x, z] of [[-0.62, -0.33], [0.62, -0.33], [-0.62, 0.33], [0.62, 0.33]]) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.07, 16), mat);
    f.position.set(x, -0.49, z); g.add(f);
  }
  // glowing glaze line at the lip
  const lip = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.006, 6, 120), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(t.hue, t.sat, 0.6) }));
  lip.rotation.x = Math.PI / 2; lip.scale.set(1, 0.68, 1); lip.position.y = 0.025; g.add(lip);
  const lip2 = lip.clone(); lip2.scale.set(0.83 / 1.15 * 1.08, 0.68 * 0.83 / 1.15 * 1.08, 1); lip2.position.y = -0.4; g.add(lip2);
  return g;
}

function moss(t, r, u) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(1, 64, 20, 0, TAU, 0, Math.PI / 2);
  const pos = geo.attributes.position, col = [];
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) * MOUND.rx, z = pos.getZ(i) * MOUND.rz;
    const n = Math.sin(x * 9 + t.seed) * Math.cos(z * 11) * 0.012 + Math.sin(x * 23 + z * 17) * 0.006;
    pos.setXYZ(i, x, moundY(x, z) + n - 0.004, z);
    c.setHSL(0.36 + 0.06 * Math.sin(x * 7 + z * 5), 0.55, 0.07 + 0.05 * Math.max(0, Math.sin(x * 13) * Math.cos(z * 15)));
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })));
  // grass blades & moss sparks, reusing the foliage shader with a fixed green
  const tips = [];
  for (let k = 0; k < 18; k++) {
    const a = r() * TAU, rr = Math.sqrt(r()) * 0.9;
    const x = Math.cos(a) * rr * MOUND.rx, z = Math.sin(a) * rr * MOUND.rz;
    tips.push({ p: V(x, moundY(x, z) + 0.01, z), dist: -1, size: 0.25 });
  }
  const gu = { ...u, uGrow: { value: 1e3 }, uHue: { value: 0.36 }, uSat: { value: 0.75 } };
  const grass = foliage(tips.map(tip => ({ tip, lobes: [{ c: tip.p, R: 0.07 }] })), r, 22, foliageMaterial(gu, { glow: 0.25, base: 1.2 }), 0.2);
  grass.userData.uniforms = gu;
  g.add(grass);
  return g;
}

function floor(t) {
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color().setHSL(t.hue, t.sat, 0.5) } },
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 uColor; varying vec2 vP;
      void main(){ float r = length(vP * vec2(1.0, 1.35));
        float pool = exp(-r * r * 1.4) * 0.22;
        float ring = smoothstep(0.012, 0.0, abs(r - 2.2)) * 0.25 + smoothstep(0.01, 0.0, abs(r - 3.1)) * 0.12;
        vec3 c = uColor * (pool + ring);
        gl_FragColor = vec4(c, pool + ring); }`
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(4, 96), m);
  mesh.rotation.x = -Math.PI / 2; mesh.position.y = -0.525;
  const shade = new THREE.Mesh(new THREE.CircleGeometry(1.5, 64), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec2 vP; void main(){ float r = length(vP * vec2(0.9, 1.3)); gl_FragColor = vec4(0.0, 0.0, 0.0, smoothstep(1.3, 0.3, r) * 0.65); }`
  }));
  shade.rotation.x = -Math.PI / 2; shade.position.y = -0.52;
  const g = new THREE.Group(); g.add(mesh, shade);
  return g;
}

function spores(t, r, u, count = 70) {
  const pos = new Float32Array(count * 3), rnd = new Float32Array(count);
  for (let i = 0; i < count; i++) { pos[i * 3] = r.range(-1.8, 1.8); pos[i * 3 + 1] = r.range(-0.4, t.height * 1.2); pos[i * 3 + 2] = r.range(-1.2, 1.2); rnd[i] = r(); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uTime; uniform float uH; attribute float aRand; varying float vA;
      void main(){ vec3 p = position; float span = uH * 1.6;
        p.y = mod(p.y + uTime * (0.04 + aRand * 0.06) + 0.4, span) - 0.4;
        p.x += sin(uTime * 0.5 + aRand * 20.0) * 0.08;
        vA = smoothstep(-0.4, 0.2, p.y) * smoothstep(span - 0.4, span * 0.6, p.y) * (0.4 + 0.6 * pow(0.5 + 0.5 * sin(uTime * 2.0 + aRand * 30.0), 2.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = (2.0 + aRand * 3.0) * (6.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: HSV + `uniform float uHue; uniform float uSat; varying float vA;
      void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
        gl_FragColor = vec4(hsv(uHue + 0.05, uSat * 0.6, 1.0) * 1.5, smoothstep(0.5, 0.0, d) * vA); }`
  });
  return new THREE.Points(g, m);
}

// ---------------------------------------------------------------- public
export function buildBonsai(t, { detail = 1 } = {}) {
  const u = common(t);
  const sk = grow(t);
  const group = new THREE.Group();

  const veins = new THREE.Mesh(sk.veins, veinMaterial(u)); veins.renderOrder = 1;
  const bark = new THREE.Mesh(sk.bark, barkMaterial(u)); bark.renderOrder = 3;
  const per = Math.round((t.style === 'bunjin' ? 320 : 240) * detail);
  const pads = padLobes(sk.tips, t, sk.r);
  const leaves = foliage(pads, sk.r, per, foliageMaterial(u, { glow: 1.1 })); leaves.renderOrder = 2;
  const core = cores(pads, sk.r, foliageMaterial(u, { glow: 0.12, base: 0.55 }));
  const m = moss(t, sk.r, u);
  group.add(pot(t), m, veins, core, leaves, bark, floor(t), spores(t, sk.r, u, Math.round(70 * detail)));

  const glow = new THREE.PointLight(new THREE.Color().setHSL(t.hue, t.sat, 0.55), 2, 3.2, 1.6);
  glow.position.set(0, 0.35, 0.25); group.add(glow);

  const grass = m.children[1];
  const all = [u, grass.userData.uniforms];
  const maxDist = sk.maxDist + 0.4;
  return {
    group, maxDist,
    box: sk.box,
    // seconds since start; grow is 0..1 (1 = fully grown)
    update(time, growth = 1) {
      const g = growth >= 1 ? 1e3 : growth * maxDist;
      for (const x of all) { x.uTime.value = time; x.uGrow.value = g; }
      grass.userData.uniforms.uGrow.value = growth >= 1 ? 1e3 : growth * 3 - 1;
      glow.intensity = (0.6 + 0.9 * Math.pow(0.5 + 0.5 * Math.sin(time * 1.6), 2)) * Math.min(1, growth * 2);
    },
    dispose() {
      group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    }
  };
}

// Renderer + bloom, shared by the stage and thumbnails.
export async function makeRenderer(canvas, { alpha = false, bloom = 0.7 } = {}) {
  const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
    import('three/addons/postprocessing/EffectComposer.js'),
    import('three/addons/postprocessing/RenderPass.js'),
    import('three/addons/postprocessing/UnrealBloomPass.js'),
    import('three/addons/postprocessing/OutputPass.js')
  ]);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.setClearColor(0x06080c, alpha ? 0 : 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06080c, 0.06);
  scene.add(new THREE.HemisphereLight(0x8fb8ff, 0x0a0806, 0.5));
  const key = new THREE.DirectionalLight(0xdfe8ff, 1.3); key.position.set(3, 5, 2.5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x6f9bff, 1.1); rim.position.set(-3, 2, -4); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), bloom, 0.42, 0.5);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
  return {
    renderer, scene, camera, composer, bloomPass,
    setSize(w, h, dpr) { renderer.setPixelRatio(dpr); renderer.setSize(w, h, false); composer.setPixelRatio(dpr); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); },
    render() { composer.render(); }
  };
}

// Where the camera should look for a given tree.
export function frame(b, aspect = 1) {
  const target = b.box.getCenter(new THREE.Vector3());
  const size = b.box.getSize(new THREE.Vector3());
  const tan = Math.tan(THREE.MathUtils.degToRad(16));
  const halfY = size.y * 0.5 + 0.2, halfX = Math.max(size.x, size.z) * 0.5 + 0.2;
  return { target, dist: Math.max(halfY / tan, halfX / (tan * aspect)) * 1.3 };
}

export { THREE };
