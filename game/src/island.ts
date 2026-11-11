// The island hub: a small low-poly island with one workshop per subject. Roofs gain
// colour as the player makes progress there, so the island itself is the progress bar.
import * as THREE from 'three';
import type { Subject } from './labs';

export type ZoneId = 'studio' | 'kitchen' | 'yard' | 'garden' | 'pond';
export interface ZoneState { id: ZoneId; label: string; progress: number; locked: boolean; badge?: string }

const ZONES: { id: ZoneId; subject: Subject; colour: number; pos: [number, number]; rot: number }[] = [
  { id: 'studio', subject: 'colour', colour: 0xd64f9a, pos: [0, 3.0], rot: 0 },
  { id: 'kitchen', subject: 'chem', colour: 0xe2553f, pos: [-3.3, 0.9], rot: 0.5 },
  { id: 'yard', subject: 'phy', colour: 0x3f6dff, pos: [-1.9, -2.6], rot: 0.2 },
  { id: 'garden', subject: 'math', colour: 0xffb423, pos: [1.9, -2.6], rot: -0.2 },
  { id: 'pond', subject: 'bio', colour: 0x1f9d74, pos: [3.3, 0.9], rot: -0.5 },
];
export const ZONE_OF: Record<Subject, ZoneId> = { colour: 'studio', chem: 'kitchen', phy: 'yard', math: 'garden', bio: 'pond' };

const mat = (color: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.75, flatShading: true }, o));
const GREY = new THREE.Color(0x9a9aa6);

function label(text: string, sub: string, h: number): THREE.Sprite {
  const c = document.createElement('canvas'), g = c.getContext('2d')!, fs = 56, pad = 22;
  g.font = `800 ${fs}px "Bricolage Grotesque", Lexend, system-ui, sans-serif`;
  const w1 = g.measureText(text).width; g.font = `700 34px Lexend, system-ui, sans-serif`; const w2 = sub ? g.measureText(sub).width : 0;
  c.width = Math.ceil(Math.max(w1, w2)) + pad * 2; c.height = fs + (sub ? 46 : 0) + pad * 2;
  g.fillStyle = '#fbf8f1'; g.strokeStyle = '#121528'; g.lineWidth = 6;
  const r = 26; g.beginPath(); g.moveTo(r, 3); g.arcTo(c.width - 3, 3, c.width - 3, c.height - 3, r); g.arcTo(c.width - 3, c.height - 3, 3, c.height - 3, r); g.arcTo(3, c.height - 3, 3, 3, r); g.arcTo(3, 3, c.width - 3, 3, r); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#121528'; g.textAlign = 'center'; g.textBaseline = 'top';
  g.font = `800 ${fs}px "Bricolage Grotesque", Lexend, system-ui, sans-serif`; g.fillText(text, c.width / 2, pad);
  if (sub) { g.font = `700 34px Lexend, system-ui, sans-serif`; g.fillStyle = '#5d6079'; g.fillText(sub, c.width / 2, pad + fs + 6); }
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  s.scale.set(h * c.width / c.height, h, 1); s.renderOrder = 10; return s;
}

function prop(id: ZoneId, colour: number): THREE.Object3D {
  const g = new THREE.Group();
  if (id === 'studio') { [0xe2553f, 0xffd23f, 0x3f6dff].forEach((c, i) => { const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.22, 10), mat(0xc4683f)); pot.position.set(-0.35 + i * 0.35, 0.11, 0); g.add(pot); const paint = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 10), mat(c)); paint.position.set(pot.position.x, 0.23, 0); g.add(paint); }); }
  if (id === 'kitchen') { const f = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), mat(0x8fe3ff, { transparent: true, opacity: 0.8 })); f.position.y = 0.26; g.add(f); const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.28, 8), mat(0x8fe3ff, { transparent: true, opacity: 0.8 })); neck.position.y = 0.6; g.add(neck); const liquid = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(colour)); liquid.position.y = 0.26; g.add(liquid); }
  if (id === 'yard') { const gear = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.09, 6, 10), mat(0x7a7f95, { metalness: 0.3 })); gear.position.y = 0.38; gear.name = 'spin'; g.add(gear); const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), mat(0x5d6079)); post.position.y = 0.15; g.add(post); }
  if (id === 'garden') { [[0, 0, 0], [0.3, 0, 0], [0.15, 0.26, 0]].forEach(([x, y]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), mat(colour)); b.position.set(x - 0.15, 0.12 + y, 0); g.add(b); }); }
  if (id === 'pond') { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 16), mat(0x4fb6e8, { roughness: 0.2 })); w.position.y = 0.03; g.add(w); const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 10), mat(0x3f9f3f)); pad.position.set(0.12, 0.06, 0.05); g.add(pad); }
  return g;
}

/** Things that appear on the island as the player finishes labs, in order. */
export const GROWTH = ['flowers', 'boat', 'lighthouse', 'rainbow', 'balloon', 'windmill', 'butterflies', 'star'] as const;

export interface Island { setGrowth(stage: number, popNew: boolean): void; setZones(z: ZoneState[]): void; fit(w: number, h: number, top: number, bottom: number): void; pause(p: boolean): void; dispose(): void }

export function createIsland(host: HTMLElement, onTap: (id: ZoneId) => void, reduceMotion: boolean): Island {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x8fd3f0); scene.fog = new THREE.Fog(0x8fd3f0, 26, 48);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a8a6a, 0.75));
  const sun = new THREE.DirectionalLight(0xfff1d6, 0.75); sun.position.set(-6, 12, 8); scene.add(sun);

  // sea, sand, grass
  const seaGeo = new THREE.CircleGeometry(40, 48); seaGeo.rotateX(-Math.PI / 2);
  const sea = new THREE.Mesh(seaGeo, mat(0x3aa7d9, { roughness: 0.35 })); sea.position.y = -0.15; scene.add(sea);
  const sand = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 7.2, 0.5, 28), mat(0xf2d79b)); sand.position.y = -0.1; scene.add(sand);
  const grassGeo = new THREE.CylinderGeometry(5.9, 6.2, 0.3, 28);
  const gp = grassGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i), r = Math.hypot(x, z); if (r > 1) { const k = 1 + Math.sin(Math.atan2(z, x) * 5) * 0.04; gp.setX(i, x * k); gp.setZ(i, z * k); } }
  grassGeo.computeVertexNormals();
  const grass = new THREE.Mesh(grassGeo, mat(0x7cc35a)); grass.position.y = 0.2; scene.add(grass);
  // paths from the centre to each workshop
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.06, 20), mat(0xe8d3a8)); plaza.position.y = 0.38; scene.add(plaza);
  ZONES.forEach(z => { const len = Math.hypot(z.pos[0], z.pos[1]); const p = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, len), mat(0xe8d3a8)); p.position.set(z.pos[0] / 2, 0.37, z.pos[1] / 2); p.rotation.y = Math.atan2(z.pos[0], z.pos[1]); scene.add(p); });
  // a big tree in the middle and palms on the shore
  const tree = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.3, 7), mat(0x8a5a3a)); trunk.position.y = 1.0; tree.add(trunk);
  [[0, 1.9, 0, 0.8], [0.45, 1.6, 0.2, 0.55], [-0.4, 1.65, -0.15, 0.6]].forEach(([x, y, z, r]) => { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat(0x4f9a3a)); c.position.set(x, y, z); tree.add(c); });
  scene.add(tree);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3, r = 5.5 + (i % 2) * 0.3; if (Math.abs(Math.sin(a)) > 0.98) continue;
    const palm = new THREE.Group(); palm.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.1, 6), mat(0x9a6a3a)); tr.position.y = 0.55; tr.rotation.z = 0.15; palm.add(tr);
    for (let k = 0; k < 5; k++) { const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.8, 4), mat(0x3f9a4a)); leaf.position.set(0.08, 1.1, 0); leaf.rotation.set(0, k * 1.25, Math.PI / 2.6); palm.add(leaf); }
    scene.add(palm);
  }

  // workshops
  type ZoneObj = { id: ZoneId; group: THREE.Group; roof: THREE.MeshStandardMaterial; colour: THREE.Color; sign: THREE.Sprite | null; hit: THREE.Mesh; bump: number };
  const zones: ZoneObj[] = ZONES.map(z => {
    const group = new THREE.Group(); group.position.set(z.pos[0], 0.35, z.pos[1]); group.rotation.y = z.rot; scene.add(group);
    const walls = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 1.2), mat(0xfbf3e2)); walls.position.y = 0.45; group.add(walls);
    const roofM = mat(z.colour);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 4), roofM); roof.position.y = 1.3; roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.85); group.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.55, 0.04), mat(0x5a3a2a)); door.position.set(0, 0.28, 0.61); group.add(door);
    [-0.45, 0.45].forEach(x => { const win = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.04), mat(0x8fd3f0, { emissive: 0x2a5a7a })); win.position.set(x, 0.55, 0.61); group.add(win); });
    const pr = prop(z.id, z.colour); pr.position.set(0.95, 0, 0.55); group.add(pr);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.2), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.9; hit.userData.zone = z.id; group.add(hit);
    return { id: z.id, group, roof: roofM, colour: new THREE.Color(z.colour), sign: null, hit, bump: 0 };
  });

  // decorations that arrive as labs are finished (see GROWTH)
  const m = (geo: THREE.BufferGeometry, color: number, x = 0, y = 0, z = 0, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => { const k = new THREE.Mesh(geo, mat(color, o)); k.position.set(x, y, z); return k; };
  const deco: THREE.Group[] = GROWTH.map(() => { const g = new THREE.Group(); g.visible = false; g.userData.pop = 0; scene.add(g); return g; });
  { // 0 flowers round the plaza
    const cols = [0xff5fa2, 0xffd23f, 0xffffff, 0xff7a3d, 0xc084fc];
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + 0.2, r = 1.55 + (i % 3) * 0.28; const f = new THREE.Group(); f.position.set(Math.cos(a) * r, 0.36, Math.sin(a) * r + 0.2);
      f.add(m(new THREE.CylinderGeometry(0.03, 0.03, 0.24, 5), 0x3f9a4a, 0, 0.12, 0), m(new THREE.IcosahedronGeometry(0.15, 0), cols[i % cols.length], 0, 0.32, 0), m(new THREE.IcosahedronGeometry(0.06, 0), 0xfff3a0, 0, 0.44, 0)); deco[0].add(f); }
  }
  { // 1 sailing boat behind the island
    const b = deco[1]; b.position.set(-3.4, -0.05, -6.6); b.name = 'boat';
    const hull = m(new THREE.BoxGeometry(1.5, 0.3, 0.55), 0xb5562b, 0, 0.12, 0); const mast = m(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 6), 0x6b4a2a, 0, 0.95, 0);
    const sail = m(new THREE.ConeGeometry(0.62, 1.15, 3), 0xffffff, 0.02, 1.0, 0); sail.scale.z = 0.12; const flag = m(new THREE.BoxGeometry(0.26, 0.14, 0.02), 0xe2553f, 0.13, 1.66, 0);
    b.add(hull, mast, sail, flag);
  }
  { // 2 lighthouse on the far shore
    const l = deco[2]; l.position.set(4.3, 0.15, -4.4);
    l.add(m(new THREE.CylinderGeometry(0.42, 0.5, 0.25, 10), 0x8b8fa3, 0, 0.12, 0));
    [0xffffff, 0xe2553f, 0xffffff, 0xe2553f].forEach((c, i) => l.add(m(new THREE.CylinderGeometry(0.3 - i * 0.03, 0.33 - i * 0.03, 0.42, 10), c, 0, 0.45 + i * 0.42, 0)));
    l.add(m(new THREE.CylinderGeometry(0.2, 0.2, 0.26, 8), 0xfff3a0, 0, 2.05, 0, { emissive: 0xffd23f, emissiveIntensity: 0.9 }), m(new THREE.ConeGeometry(0.3, 0.3, 8), 0xe2553f, 0, 2.33, 0));
  }
  { // 3 rainbow over the back of the island
    const r = deco[3]; r.position.set(0, 0.1, -5.6);
    [0xe2553f, 0xff9a3d, 0xffd23f, 0x4fbf5a, 0x3f8dff, 0x8a5cf6].forEach((c, i) => { const arc = new THREE.Mesh(new THREE.TorusGeometry(3.0 - i * 0.15, 0.075, 6, 28, Math.PI), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85 })); r.add(arc); });
  }
  { // 4 hot-air balloon
    const b = deco[4]; b.position.set(-3.9, 2.3, 2.9); b.name = 'balloon';
    b.add(m(new THREE.SphereGeometry(0.62, 10, 8), 0xff5fa2, 0, 0.5, 0)); const band = m(new THREE.CylinderGeometry(0.63, 0.63, 0.22, 10), 0xffd23f, 0, 0.5, 0); b.add(band);
    b.add(m(new THREE.BoxGeometry(0.26, 0.2, 0.26), 0x8a5a3a, 0, -0.42, 0)); [-0.11, 0.11].forEach(x => b.add(m(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 4), 0x5a3a2a, x, -0.12, 0)));
  }
  { // 5 windmill between the two back workshops
    const w = deco[5]; w.position.set(0, 0.35, -3.6);
    w.add(m(new THREE.CylinderGeometry(0.2, 0.34, 1.3, 8), 0xfbf3e2, 0, 0.65, 0), m(new THREE.ConeGeometry(0.3, 0.34, 8), 0xa8552b, 0, 1.47, 0));
    const hub = new THREE.Group(); hub.position.set(0, 1.2, 0.3); hub.name = 'blades';
    for (let i = 0; i < 4; i++) { const bl = m(new THREE.BoxGeometry(0.14, 0.78, 0.03), 0xffffff, 0, 0.4, 0); const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; arm.add(bl); hub.add(arm); }
    w.add(hub);
  }
  { // 6 butterflies round the big tree
    const cols = [0xff5fa2, 0x3fd6ff, 0xffd23f, 0xc084fc, 0xff7a3d];
    cols.forEach((c, i) => { const b = new THREE.Group(); b.userData = { a: i * 1.3, r: 1.0 + (i % 3) * 0.35, h: 1.5 + (i % 2) * 0.6, s: 0.5 + i * 0.12 };
      const l = m(new THREE.CircleGeometry(0.09, 5), c, -0.07, 0, 0, { side: THREE.DoubleSide }), r = m(new THREE.CircleGeometry(0.09, 5), c, 0.07, 0, 0, { side: THREE.DoubleSide }); l.name = 'wl'; r.name = 'wr'; b.add(l, r); deco[6].add(b); });
  }
  { // 7 a golden star on top of the big tree
    const s = deco[7]; s.position.set(0, 2.95, 0); s.name = 'star';
    const star = m(new THREE.OctahedronGeometry(0.3, 0), 0xffd23f, 0, 0, 0, { emissive: 0xffb423, emissiveIntensity: 0.8, metalness: 0.4, roughness: 0.3 }); star.scale.set(1, 1.5, 0.5); s.add(star);
  }
  function setGrowth(stage: number, popNew: boolean) {
    deco.forEach((g, i) => { const on = i < stage; if (on && !g.visible && popNew && !reduceMotion) { g.userData.pop = 1; g.scale.setScalar(0.01); } else if (on && !g.userData.pop) g.scale.setScalar(1); g.visible = on; });
  }

  // clouds
  const clouds: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) { const c = new THREE.Group(); [0, 0.5, -0.5].forEach((x, k) => { const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 - k * 0.1, 0), mat(0xffffff, { roughness: 1 })); p.position.set(x, 0, 0); c.add(p); }); c.position.set(-12 + i * 7, 5 + (i % 2), -6 - i); scene.add(c); clouds.push(c); }

  // fitting the camera between the top bar and the bottom card
  const view = { w: 1, h: 1, top: 0, bottom: 0 };
  function fit(w: number, h: number, top: number, bottom: number) {
    Object.assign(view, { w, h, top, bottom });
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.setViewOffset(w, h, 0, (bottom - top) / 2, w, h); camera.updateProjectionMatrix();
    const portrait = w / Math.max(1, h - top - bottom) < 1.05;
    const c = new THREE.Vector3(0, 0.6, 0.2), dir = new THREE.Vector3(0, portrait ? 1.35 : 0.85, 1).normalize();
    const pts: THREE.Vector3[] = []; const R = portrait ? 5.2 : 6.4;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R), new THREE.Vector3(Math.cos(a) * 3.3, 2.6, Math.sin(a) * 3.3)); }
    const yTop = 1 - 2 * top / h - 0.02, yBot = -1 + 2 * bottom / h + 0.02, v = new THREE.Vector3(); let lo = 1, hi = 100;
    for (let i = 0; i < 28; i++) { const mid = (lo + hi) / 2; camera.position.copy(c).addScaledVector(dir, mid); camera.lookAt(c); camera.updateMatrixWorld(); const ok = pts.every(p => { v.copy(p).project(camera); return Math.abs(v.x) <= 0.96 && v.y <= yTop && v.y >= yBot; }); if (ok) hi = mid; else lo = mid; }
    camera.position.copy(c).addScaledVector(dir, hi); camera.lookAt(c); camera.updateMatrixWorld();
    base.copy(camera.position);
    // keep the haze behind the island whatever the camera distance
    (scene.fog as THREE.Fog).near = hi + 8; (scene.fog as THREE.Fog).far = hi + 40;
    // bigger signs when the island is drawn small (phones in portrait)
    signScale = portrait ? 1.6 : 1; refDist = hi; scaleSigns();
  }
  // Signs keep the same size on screen whether the workshop is at the front or the back of the island.
  let refDist = 10; const sp = new THREE.Vector3();
  function scaleSigns() {
    zones.forEach(z => { if (!z.sign) return; z.sign.getWorldPosition(sp); z.sign.scale.copy(z.sign.userData.base).multiplyScalar(signScale * camera.position.distanceTo(sp) / refDist); });
  }
  const base = new THREE.Vector3();
  let signScale = 1;

  function setZones(states: ZoneState[]) {
    states.forEach(s => {
      const z = zones.find(o => o.id === s.id); if (!z) return;
      // a locked workshop stays grey; an open one starts pale and gains full colour with progress
      const k = s.locked ? 0 : 0.45 + 0.55 * Math.min(1, s.progress);
      z.roof.color.copy(GREY).lerp(z.colour, k);
      if (z.sign) { z.group.remove(z.sign); z.sign.material.map?.dispose(); z.sign.material.dispose(); }
      z.sign = label(s.label, s.badge || '', s.badge ? 0.62 : 0.42); z.sign.userData.base = z.sign.scale.clone(); z.sign.scale.multiplyScalar(signScale); z.sign.position.set(0, 2.25, 0); z.group.add(z.sign);
    });
  }

  // tapping a workshop
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down: { x: number; y: number; t: number } | null = null;
  const el = renderer.domElement;
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  el.addEventListener('pointerup', e => {
    if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null; if (moved > 16) return;
    const r = el.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    // Forgiving taps: a direct hit on a house or its sign, otherwise the closest workshop within a thumb's width.
    const hits = ray.intersectObjects([...zones.map(z => z.hit), ...zones.flatMap(z => z.sign ? [z.sign] : [])], false)[0];
    let zone = hits ? zones.find(o => o.hit === hits.object || o.sign === hits.object) : undefined;
    if (!zone) {
      let best = 56; const v = new THREE.Vector3();
      zones.forEach(o => { [o.hit, o.sign].forEach(m => { if (!m) return; m.getWorldPosition(v).project(camera); const d = Math.hypot((v.x + 1) / 2 * r.width - (e.clientX - r.left), (1 - v.y) / 2 * r.height - (e.clientY - r.top)); if (d < best) { best = d; zone = o; } }); });
    }
    if (zone) { zone.bump = 1; onTap(zone.id); }
  });

  let paused = false, raf = 0, last = performance.now(), time = 0;
  function frame(now: number) {
    raf = requestAnimationFrame(frame); if (paused) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
    if (!reduceMotion) {
      camera.position.set(base.x + Math.sin(time * 0.25) * 0.25, base.y + Math.sin(time * 0.4) * 0.08, base.z); camera.lookAt(0, 0.6, 0.2);
      clouds.forEach((c, i) => { c.position.x += dt * (0.25 + i * 0.05); if (c.position.x > 16) c.position.x = -16; });
      sea.position.y = -0.15 + Math.sin(time * 0.8) * 0.03;
      zones.forEach(z => { const sp = z.group.getObjectByName('spin'); if (sp) sp.rotation.z += dt; });
      if (deco[1].visible) { deco[1].position.x = -3.4 + Math.sin(time * 0.12) * 0.9; deco[1].position.y = -0.05 + Math.sin(time * 1.1) * 0.04; deco[1].rotation.z = Math.sin(time * 0.9) * 0.05; }
      if (deco[4].visible) { deco[4].position.y = 2.3 + Math.sin(time * 0.5) * 0.2; deco[4].position.x = -3.9 + Math.sin(time * 0.17) * 0.3; }
      if (deco[5].visible) deco[5].getObjectByName('blades')!.rotation.z -= dt * 1.2;
      if (deco[6].visible) deco[6].children.forEach(b => { const u = b.userData; u.a += dt * u.s; b.position.set(Math.cos(u.a) * u.r, u.h + Math.sin(u.a * 2.3) * 0.2, Math.sin(u.a) * u.r); b.rotation.y = -u.a; const f = Math.sin(time * 14 + u.r * 9) * 0.9; b.getObjectByName('wl')!.rotation.y = f; b.getObjectByName('wr')!.rotation.y = -f; });
      if (deco[7].visible) deco[7].rotation.y += dt * 1.5;
    }
    scaleSigns();
    deco.forEach(g => { if (g.userData.pop > 0) { g.userData.pop = Math.max(0, g.userData.pop - dt * 1.1); const k = 1 - g.userData.pop; g.scale.setScalar(Math.max(0.01, k < 0.7 ? k / 0.7 * 1.25 : 1.25 - (k - 0.7) / 0.3 * 0.25)); } });
    zones.forEach(z => { if (z.bump > 0) { z.bump = Math.max(0, z.bump - dt * 3); const s = 1 + Math.sin(z.bump * Math.PI) * 0.08; z.group.scale.set(s, s, s); } });
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return {
    setZones, setGrowth, fit,
    pause(p: boolean) { paused = p; last = performance.now(); },
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse(o => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); const mm = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined; if (mm) [mm].flat().forEach(x => { const sm = x as THREE.SpriteMaterial; sm.map?.dispose(); x.dispose(); }); });
      renderer.forceContextLoss(); renderer.dispose(); el.remove();
    },
  };
}
