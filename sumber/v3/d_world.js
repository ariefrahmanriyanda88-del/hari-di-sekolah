
// =====================================================================
//  DENAH BARU (lebih luas): area tengah bersama + sayap PUTRA (barat) & sayap PUTRI (timur)
// =====================================================================
const WING = 44;                 // batas sayap: x < -44 area putra, x > 44 area putri
plane(-200, -160, 200, 160, 0x86c86f, 0);                 // rumput (hanya di sekitar sekolah agar tidak bertumpuk dengan lantai ruangan)
plane(-98, -70, 98, 54, 0xdcd6cc, 0.02);                  // halaman berpaving
// jalan raya
plane(-200, 60, 200, 72, 0x55585c, 0.03);
for (let x = -195; x < 195; x += 11) plane(x, 65.6, x + 6, 66.4, 0xffffff, 0.06);
for (let i = 0; i < 6; i++) plane(-6 + i * 2.2, 61, -4.6 + i * 2.2, 71, 0xf2f2f2, 0.07);
plane(-200, 56.5, 200, 60, 0xa9a9a9, 0.035);
// jalur utama
plane(-4, 14, 4, 56, 0xe9dcc0, 0.05);                    // jalan masuk dari gerbang
plane(-98, 8, 98, 14, 0xe9dcc0, 0.06);                   // koridor utama timur–barat
plane(-52, -40, -46, 8, 0xe9dcc0, 0.05); plane(-52, 14, -46, 34, 0xe9dcc0, 0.05); plane(46, -40, 52, 8, 0xe9dcc0, 0.05); plane(46, 14, 52, 34, 0xe9dcc0, 0.05);  // koridor sayap
// taman & tempat santai
[[-40, -20, -32, -4], [32, -20, 40, -4], [8, 44, 30, 54], [-42, -66, -28, -40], [28, -66, 42, -40]]
  .forEach(([a, b, c, d]) => plane(Math.min(a, c), b, Math.max(a, c), d, 0x78bf5e, 0.04));

// lapangan sepak bola
const doorOutLater = [];
const FIELD = { ax: -24, az: -66, bx: 24, bz: -40 };
FIELD.cx = (FIELD.ax + FIELD.bx) / 2; FIELD.cz = (FIELD.az + FIELD.bz) / 2;
{
  plane(FIELD.ax - 2, FIELD.az - 2, FIELD.bx + 2, FIELD.bz + 2, 0x58ad4e, 0.05);
  const { ax, az, bx, bz, cx, cz } = FIELD, W = bx - ax, D = bz - az;
  const line = (x, z, w, d) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat(0xffffff)); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.08, z); scene.add(m); };
  line(cx, az, W, 0.25); line(cx, bz, W, 0.25); line(ax, cz, 0.25, D); line(bx, cz, 0.25, D); line(cx, cz, 0.25, D);
  const ring = new THREE.Mesh(new THREE.RingGeometry(3, 3.25, 40), mat(0xffffff)); ring.rotation.x = -Math.PI / 2; ring.position.set(cx, 0.08, cz); scene.add(ring);
  [ax, bx].forEach((gx, i) => { const s = i ? 1 : -1; box(gx + s * 0.6, 1.1, cz - 2.4, 0.2, 2.2, 0.2, 0xffffff); box(gx + s * 0.6, 1.1, cz + 2.4, 0.2, 2.2, 0.2, 0xffffff); box(gx + s * 0.6, 2.2, cz, 0.2, 0.2, 5, 0xffffff); });
  label('Lapangan Sepak Bola', cx, 4, cz, 1.8);
  doorOutLater.push(['bola', 0, -37.2, 2.4]);
}

// pagar keliling
const fence = (x1, z1, x2, z2) => building(x1, z1, x2, z2, 1.4, 0x3b5e9e, 0x2e4b80);
fence(-100, 55.5, -6.5, 56.5); fence(6.5, 55.5, 100, 56.5); fence(-101, -72, -100, 56.5); fence(100, -72, 101, 56.5); fence(-101, -73, 101, -72);

// pagar tanaman pembatas area putra / putri (ada celah di koridor utama)
const hedge = (x, z1, z2) => { const b = building(x - 0.6, z1, x + 0.6, z2, 1.3, 0x3f8f44, 0x4fa654); return b; };
hedge(-WING, -71, 7); hedge(-WING, 15, 55); hedge(WING, -71, 7); hedge(WING, 15, 55);
label('AREA PUTRA', -WING - 4, 4.2, 11, 1.6, true);
label('AREA PUTRI', WING + 4, 4.2, 11, 1.6, true);
box(-WING, 3.4, 7.2, 0.5, 6.8, 0.5, 0x2e4b80); box(-WING, 3.4, 14.8, 0.5, 6.8, 0.5, 0x2e4b80); box(-WING, 6.8, 11, 0.6, 0.6, 8.2, 0x2e4b80);
box(WING, 3.4, 7.2, 0.5, 6.8, 0.5, 0x8a3b5c); box(WING, 3.4, 14.8, 0.5, 6.8, 0.5, 0x8a3b5c); box(WING, 6.8, 11, 0.6, 0.6, 8.2, 0x8a3b5c);

const PEACH = 0xf6dcc4, RED = 0xe0623e, PINKWALL = 0xf6dde4, PLUM = 0xb04a6e;
const doorsOut = [];   // pintu yang bisa dimasuki: {id, x, z (titik picu), r, label}
function doorOut(id, x, z, r = 1.8) { doorsOut.push({ id, x, z, r }); }
doorOutLater.forEach((a) => doorOut(...a));

// ---------- gedung kelas per tingkat, per jenis ----------
const classDoors = {};     // nama kelas -> {x, z} titik picu di depan pintu
function classBlock(sign, zTop, grade, list, wall, roof) {
  const x1 = sign < 0 ? -95 : 55, x2 = sign < 0 ? -55 : 95;
  const b = building(x1, zTop, x2, zTop + 10, 7, wall, roof);
  windowBand(b, 'S', 2); windowBand(b, 'N', 2);
  label(`Gedung Kelas ${grade} ${sign < 0 ? 'Putra' : 'Putri'}`, b.cx, 10.2, b.cz, 1.6);
  list.forEach((c, i) => {
    const x = sign * (59 + i * 8), z = b.bz;
    door(x, z + 0.05, 'S');
    label(c, x, 3.4, z + 0.6, 0.9, true);
    classDoors[c] = { x, z: z + 2.2 };
  });
  plane(x1, zTop + 10, x2, zTop + 14, 0xe9d3a6, 0.05);   // selasar
  return b;
}
const byGrade = (g, side) => DATA.classes.filter((c) => c.startsWith(g + ' ' + side + ' '));
classBlock(-1, -46, 'X', byGrade('X', 'PA'), PEACH, RED);
classBlock(-1, -24, 'XI', byGrade('XI', 'PA'), PEACH, RED);
classBlock(-1, 18, 'XII', byGrade('XII', 'PA'), PEACH, RED);
classBlock(1, -46, 'X', byGrade('X', 'PI'), PINKWALL, PLUM);
classBlock(1, -24, 'XI', byGrade('XI', 'PI'), PINKWALL, PLUM);
classBlock(1, 18, 'XII', byGrade('XII', 'PI'), PINKWALL, PLUM);

// ---------- kantin & toilet terpisah ----------
function kantinBlock(sign, wall, roof) {
  const b = building(sign < 0 ? -95 : 75, 38, sign < 0 ? -75 : 95, 50, 4, wall, roof);
  door(b.cx, b.az - 0.05, 'N'); windowBand(b, 'N');
  label(sign < 0 ? 'Kantin Putra' : 'Kantin Putri', b.cx, 6.4, b.cz, 1.5);
  doorOut(sign < 0 ? 'kantinPA' : 'kantinPI', b.cx, b.az - 2);
}
kantinBlock(-1, 0xf3dcc0, 0xe8714a); kantinBlock(1, 0xf6dde4, 0xd9577a);
function toiletBlock(sign, color) {
  const b = building(sign < 0 ? -70 : 58, 40, sign < 0 ? -58 : 70, 50, 3.5, 0xeef0f5, 0x6b7079);
  door(b.cx, b.az - 0.05, 'N', color);
  label(sign < 0 ? 'Toilet Putra' : 'Toilet Putri', b.cx, 5.4, b.cz, 1.1);
}
toiletBlock(-1, 0x3b7dd8); toiletBlock(1, 0xe06aa0);

// ---------- masjid & tempat wudhu (putra di barat, putri di timur) ----------
const masjid = building(-14, -14, 14, 4, 5.5, 0xf3e3c3, 0x3a9a6a);
{
  windowBand(masjid, 'S'); windowBand(masjid, 'E'); windowBand(masjid, 'W');
  door(-6, 4.05, 'S', 0x6b4a2b); door(6, 4.05, 'S', 0x6b4a2b);
  label('Pintu Putra', -6, 3.6, 4.7, 0.75); label('Pintu Putri', 6, 3.6, 4.7, 0.75);
  doorOut('masjidPA', -6, 6.4); doorOut('masjidPI', 6, 6.4);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(6.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x2f8a5c));
  dome.position.set(0, 6.1, -5); dome.castShadow = true; scene.add(dome);
  const moon = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.16, 8, 20, Math.PI * 1.3), mat(0xf5c542));
  moon.position.set(0, 13.9, -5); moon.rotation.z = Math.PI * 0.35; scene.add(moon);
  box(0, 13.1, -5, 0.16, 1, 0.16, 0xf5c542);
  // menara
  const mn = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 16, 12), mat(0xf3e3c3)); mn.position.set(12, 8, -12); mn.castShadow = true; scene.add(mn);
  const mt = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 12), mat(0x2f8a5c)); mt.position.set(12, 17.5, -12); scene.add(mt);
  colliders.push({ cx: 12, cz: -12, r: 1.4 });
  label('Masjid', 0, 16.5, -5, 2.2);
  const wa = building(-28, -12, -18, 0, 3.5, 0xf8f8f8, 0x3b7dd8); windowBand(wa, 'E'); door(-18 + 0.05, -6, 'E'); label('Wudhu Putra', wa.cx, 5.6, wa.cz, 1.0);
  const wi = building(18, -12, 28, 0, 3.5, 0xf8f8f8, 0xd9577a); windowBand(wi, 'W'); door(18 - 0.05, -6, 'W'); label('Wudhu Putri', wi.cx, 5.6, wi.cz, 1.0);
  doorOut('wudhuPA', -15.8, -6); doorOut('wudhuPI', 15.8, -6);
}

// ---------- ruang Ustadz & ruang Ustadzah ----------
{
  const a = building(-34, 30, -12, 42, 4, 0xf3e0c8, 0x3b5e9e); windowBand(a, 'N'); door(a.cx, a.az - 0.05, 'N');
  label('Ruang Ustadz', a.cx, 6.4, a.cz, 1.4); doorOut('ruangPA', a.cx, a.az - 2);
  const b = building(12, 30, 34, 42, 4, 0xf3e0c8, 0x8a3b5c); windowBand(b, 'N'); door(b.cx, b.az - 0.05, 'N');
  label('Ruang Ustadzah', b.cx, 6.4, b.cz, 1.4); doorOut('ruangPI', b.cx, b.az - 2);
}
// ---------- perpustakaan, lab, UKS, kepala sekolah ----------
[[-38, -26, 'Kepala Sekolah & TU', 0xf3e0c8, 0xc98a5a], [-22, -2, 'Perpustakaan', 0xdde8f3, 0x6b7079], [2, 22, 'Lab Komputer', 0xdde8f3, 0x6b7079], [26, 36, 'UKS', 0xffffff, 0xc0392b]]
  .forEach(([x1, x2, n, w, r]) => { const b = building(x1, -30, x2, -22, 4, w, r); windowBand(b, 'S'); door(b.cx, b.bz + 0.05, 'S', 0x9b6b3c); label(n, b.cx, 6.2, b.cz, n.length > 14 ? 1.0 : 1.3); if (n === 'Lab Komputer') { doorOut('lab', b.cx, b.bz + 2); label('🎮 Arcade', b.cx, 4.2, b.bz + 0.8, 0.8, true); }
    if (n === 'Perpustakaan') { doorOut('perpus', b.cx, b.bz + 2); label('📚 Baca', b.cx, 4.2, b.bz + 0.8, 0.8, true); }
    if (n === 'UKS') { doorOut('uks', b.cx, b.bz + 2); label('🩺 Berobat', b.cx, 4.2, b.bz + 0.8, 0.8, true); }
    if (n.startsWith('Kepala')) doorOut('kepsek', b.cx, b.bz + 2); });

// ---------- gerbang & pos satpam ----------
{
  box(-6.6, 2.4, 56, 1.3, 4.8, 1.3, 0xf1e2c2); box(6.6, 2.4, 56, 1.3, 4.8, 1.3, 0xf1e2c2);
  colliders.push({ x1: -7.3, z1: 55.3, x2: -5.9, z2: 56.7 }, { x1: 5.9, z1: 55.3, x2: 7.3, z2: 56.7 });
  box(0, 5, 56, 15, 0.7, 1.8, 0x3b7dd8);
  label("Gerbang Utama SMAIT IQRA'", 0, 6.9, 56, 1.2);
  const s = building(10, 45, 16, 52, 3, 0xffffff, 0x3b7dd8); windowBand(s, 'W'); label('Pos Satpam', s.cx, 5, s.cz, 0.9);
}
// ---------- lapangan upacara (lapangan utama) ----------
const UPC = { ax: -40, az: 15.5, bx: 40, bz: 29 };
plane(UPC.ax, UPC.az, UPC.bx, UPC.bz, 0xcfd8c4, 0.045);
[[UPC.ax, UPC.az, UPC.bx, UPC.az + 0.2], [UPC.ax, UPC.bz - 0.2, UPC.bx, UPC.bz], [UPC.ax, UPC.az, UPC.ax + 0.2, UPC.bz], [UPC.bx - 0.2, UPC.az, UPC.bx, UPC.bz]].forEach(([a, b, c, e]) => plane(a, b, c, e, 0xffffff, 0.07));
box(0, 0.3, 17.2, 6, 0.6, 2.2, 0x9b6b3c); box(0, 0.62, 17.2, 5.6, 0.06, 1.8, 0xb98652);          // mimbar pembina
const flagPole = box(-9, 5, 16.6, 0.2, 10, 0.2, 0xdddddd);
box(-9, 0.2, 16.6, 1.4, 0.4, 1.4, 0xcfd6dc);
const flag = new THREE.Group(); { const r = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.03), mat(0xe53935)); r.position.set(0.95, 0.3, 0); flag.add(r); const w = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.03), mat(0xffffff)); w.position.set(0.95, -0.3, 0); flag.add(w); }
flag.position.set(-9, 9.3, 16.6); scene.add(flag);
label('Lapangan Upacara', 0, 3.6, 22, 1.4);
// pepohonan
const treeGeoT = new THREE.CylinderGeometry(0.25, 0.35, 1.6, 6);
const treeGeoL = new THREE.IcosahedronGeometry(1.5, 0);
function tree(x, z, collide = true) {
  const t = new THREE.Mesh(treeGeoT, mat(0x7a5230)); t.position.set(x, 0.8, z); t.castShadow = true; scene.add(t);
  const l = new THREE.Mesh(treeGeoL, mat(0x3f9a47)); l.position.set(x, 2.5, z); l.castShadow = true; scene.add(l);
  l.scale.setScalar(0.85 + ((Math.abs(x * 7 + z * 13) | 0) % 10) / 20);
  if (collide) colliders.push({ cx: x, cz: z, r: 0.8 });
}
for (let z = -66; z < 54; z += 8) { tree(-97, z); tree(97, z); }
for (let x = -92; x < 95; x += 9) { tree(x, -69); if (Math.abs(x) > 10) tree(x, 58.5, false); }
[[-42, 22], [42, 22], [-37, -16], [37, -16], [-37, -8], [37, -8], [-28, -36], [28, -36], [10, 48], [26, 50]]
  .forEach(([x, z]) => tree(x, z));

// ---------- tempat-tempat (info lokasi) ----------
const places = [
  ['Gerbang Utama', 0, 50, 8], ['Pos Satpam', 13, 48, 5], ['Ruang Ustadz', -23, 28, 7], ['Ruang Ustadzah', 23, 28, 7],
  ['Masjid', 0, 6, 9], ['Wudhu Putra', -16, -6, 5], ['Wudhu Putri', 16, -6, 5], ['Lapangan Upacara', 0, 22, 30], ['Taman', -35, -50, 8], ['Taman', 35, -50, 8],
  ['Lapangan Sepak Bola', 0, -50, 22], ['Perpustakaan', -12, -20, 5], ['Lab Komputer', 12, -20, 5], ['UKS', 31, -20, 5], ['Kepala Sekolah & TU', -32, -20, 5],
  ['Kantin Putra', -85, 35, 8], ['Kantin Putri', 85, 35, 8], ['Toilet Putra', -64, 37, 6], ['Toilet Putri', 64, 37, 6],
  ['Gedung Kelas X Putra', -75, -32, 18], ['Gedung Kelas XI Putra', -75, -10, 18], ['Gedung Kelas XII Putra', -75, 31, 18],
  ['Gedung Kelas X Putri', 75, -32, 18], ['Gedung Kelas XI Putri', 75, -10, 18], ['Gedung Kelas XII Putri', 75, 31, 18],
  ['Area Putra', -70, 11, 26], ['Area Putri', 70, 11, 26],
].map(([n, x, z, r]) => ({ n, x, z, r }));
