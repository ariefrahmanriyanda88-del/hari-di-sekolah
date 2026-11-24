// ---------- tokoh (siswa, guru, satpam) ----------
// wajah & rambut: geometri dipakai bersama agar ringan
const FG = {
  eyeW: new THREE.SphereGeometry(0.062, 10, 8), pupil: new THREE.SphereGeometry(0.036, 8, 6),
  brow: new THREE.BoxGeometry(0.12, 0.024, 0.03), mouth: new THREE.BoxGeometry(0.11, 0.022, 0.03),
  smile: new THREE.TorusGeometry(0.06, 0.013, 6, 12, Math.PI), nose: new THREE.SphereGeometry(0.035, 8, 6),
  ring: new THREE.TorusGeometry(0.075, 0.012, 6, 16), bar: new THREE.BoxGeometry(0.08, 0.014, 0.014),
  cheek: new THREE.SphereGeometry(0.035, 8, 6), curl: new THREE.SphereGeometry(0.1, 8, 6),
};
const darker = (c, k = 0.82) => { const o = new THREE.Color(c); o.multiplyScalar(k); return o.getHex(); };
// f: { eye: 0 bulat|1 sipit|2 besar, brow: 0 tipis|1 tebal, mouth: 0 senyum|1 datar|2 lebar, glasses: warna|null }
function addFace(g, head, cz, r, skin, f = {}, s = 1) {
  const fz = (x, y) => cz + Math.sqrt(Math.max(0, r * r - x * x - y * y)) - 0.012;
  const m = (geo, c, x, y, z, sx = 1, sy = 1, sz = 1, rz = 0) => { const o = new THREE.Mesh(geo, mat(c)); o.position.set(x, head + y, z); o.scale.set(sx * s, sy * s, sz * s); o.rotation.z = rz; g.add(o); return o; };
  const ex = 0.13 * s, ey = 0.04 * s, X = f.expr || '', eyS = (f.eye === 1 ? 0.55 : f.eye === 2 ? 1.2 : 1) * (X === 'kaget' ? 1.35 : 1);
  [-1, 1].forEach((k) => {
    if (X === 'senang') { const o = m(FG.smile, 0x2a1d14, k * ex, ey + 0.01 * s, fz(ex, ey) + 0.01, 0.8, 0.8, 1); o.rotation.z = 0; }   // mata tersenyum ^ ^
    else {
      m(FG.eyeW, 0xffffff, k * ex, ey, fz(ex, ey), 1, eyS, 0.6);
      m(FG.pupil, 0x2a1d14, k * ex, ey - 0.005, fz(ex, ey) + 0.025, X === 'kaget' ? 0.8 : 1, eyS * (f.eye === 1 ? 1.1 : 1) * (X === 'kaget' ? 0.8 : 1), 0.6);
    }
    const bt = X === 'sedih' ? k * 0.35 : X === 'marah' ? k * -0.4 : k * -0.12, by = X === 'kaget' ? 0.13 : 0.1;
    m(FG.brow, f.browC ?? 0x2a1d14, k * ex, ey + by * s, fz(ex, ey + by * s), 1, f.brow ? 1.6 : 1, 1, bt);
  });
  m(FG.nose, darker(skin, 0.9), 0, -0.03 * s, fz(0, -0.03 * s) + 0.015);
  const my = -0.13 * s;
  if (X === 'kaget') m(FG.ring, 0x8a3b3b, 0, my, fz(0, my), 0.55, 0.7, 1);
  else if (X === 'sedih') m(FG.smile, 0x8a3b3b, 0, my - 0.02 * s, fz(0, my), 0.9, 0.8, 1);
  else if (f.mouth === 1 && X !== 'senang') m(FG.mouth, 0x8a3b3b, 0, my, fz(0, my));
  else { const o = m(FG.smile, 0x8a3b3b, 0, my + 0.03 * s, fz(0, my), f.mouth === 2 || X === 'senang' ? 1.35 : 1, X === 'senang' ? 1.3 : 1, 1); o.rotation.z = Math.PI; }
  if (f.glasses) { [-1, 1].forEach((k) => m(FG.ring, f.glasses, k * ex, ey, fz(ex, ey) + 0.04)); m(FG.bar, f.glasses, 0, ey + 0.01, fz(0, ey) + 0.03); }
}
// rambut putra: 0 pendek rapi · 1 cepak · 2 belah samping · 3 ikal pendek
function addHair(g, style = 0, c = 0x222222) {
  const m = (geo, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, mat(c)); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; g.add(o); return o; };
  if (style === 1) { m(new THREE.SphereGeometry(0.395, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.6), 0, 2.03, -0.02, 1, 0.85, 1); return; }
  m(new THREE.SphereGeometry(0.405, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), 0, 2.0, -0.03);
  if (style === 2) { const o = m(new THREE.BoxGeometry(0.42, 0.1, 0.16), 0.08, 2.29, 0.27); o.rotation.z = -0.25; }
  if (style === 3) [[-0.22, 2.25, 0.18], [0, 2.33, 0.22], [0.22, 2.25, 0.18], [-0.3, 2.15, -0.1], [0.3, 2.15, -0.1], [0, 2.36, -0.05]].forEach(([x, y, z]) => m(FG.curl, x, y, z));
  if (style === 0) m(new THREE.BoxGeometry(0.5, 0.08, 0.12), 0, 2.24, 0.3).rotation.x = 0.4;
}
function makePerson(o = {}) {
  const g = new THREE.Group(); g.model = o;
  g.rotation.order = 'YXZ';
  const add = (geo, c, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat(c)); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const shirt = o.shirt ?? 0xffffff, bottom = o.bottom ?? 0x6d6f73, skin = o.skin ?? 0xf0c8a0;
  if (o.putri) {
    add(new THREE.CylinderGeometry(0.36, 0.5, 0.95, 14), bottom, 0, 0.48, 0);
    g.legL = new THREE.Object3D(); g.legR = new THREE.Object3D();
    add(new THREE.BoxGeometry(0.8, 0.8, 0.48), shirt, 0, 1.3, 0);
    if (o.hijabStyle === 1) add(new THREE.ConeGeometry(0.7, 1.05, 18), o.hijab ?? 0xf4f4f4, 0, 1.42, 0);   // jilbab syar'i panjang
    else add(new THREE.ConeGeometry(0.62, 0.75, 18), o.hijab ?? 0xf4f4f4, 0, 1.55, 0);
    add(new THREE.SphereGeometry(0.42, 18, 14), o.hijab ?? 0xf4f4f4, 0, 1.97, -0.02);
    add(new THREE.SphereGeometry(0.27, 14, 10), skin, 0, 1.95, 0.2);
    if (o.face !== false) addFace(g, 1.95, 0.2, 0.27, skin, o.face, 0.72);
  } else {
    g.legL = new THREE.Group(); g.legL.position.set(-0.2, 0.8, 0); g.add(g.legL);
    g.legR = new THREE.Group(); g.legR.position.set(0.2, 0.8, 0); g.add(g.legR);
    add(new THREE.BoxGeometry(0.32, 0.8, 0.32), bottom, 0, -0.4, 0, g.legL);
    add(new THREE.BoxGeometry(0.32, 0.8, 0.32), bottom, 0, -0.4, 0, g.legR);
    add(new THREE.BoxGeometry(0.85, 0.85, 0.5), shirt, 0, 1.22, 0);
    if (o.tie !== false) add(new THREE.BoxGeometry(0.12, 0.5, 0.05), o.tie ?? 0x7a7d82, 0, 1.3, 0.27);
    add(new THREE.SphereGeometry(0.38, 16, 12), skin, 0, 1.95, 0);
    if (o.face !== false) addFace(g, 1.95, 0, 0.38, skin, o.face);
    if (o.peci) { addHair(g, 1, o.hairC ?? 0x222222); add(new THREE.CylinderGeometry(0.34, 0.36, 0.3, 16), o.peci, 0, 2.25, 0); }
    else addHair(g, o.hair ?? 0, o.hairC ?? 0x222222);
  }
  if (o.bag) g.bag = add(new THREE.BoxGeometry(0.62, 0.68, 0.28), o.bag, 0, 1.25, -0.4);
  const sleeve = o.sleeve ?? shirt;
  // tokoh menghadap +z, jadi tangan KANAN berada di sisi -x (salim, hormat, makan, salam memakai tangan kanan)
  g.armL = new THREE.Group(); g.armL.position.set(0.52, 1.6, 0); g.add(g.armL);
  g.armR = new THREE.Group(); g.armR.position.set(-0.52, 1.6, 0); g.add(g.armR);
  add(new THREE.BoxGeometry(0.22, 0.78, 0.22), sleeve, 0, -0.38, 0, g.armL);
  add(new THREE.BoxGeometry(0.22, 0.78, 0.22), sleeve, 0, -0.38, 0, g.armR);
  add(new THREE.SphereGeometry(0.12, 8, 6), skin, 0, -0.8, 0, g.armR);
  add(new THREE.SphereGeometry(0.12, 8, 6), skin, 0, -0.8, 0, g.armL);
  g.anim = null; g.walkT = 0;
  return g;
}
