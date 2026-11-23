// ---------- ruang kelas 3D (sesuai denah kelas) ----------
const ROOM = new THREE.Vector3(320, 0, 0);
const room = new THREE.Group(); room.position.copy(ROOM); scene.add(room);
const rbox = (x, y, z, w, h, d, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; room.add(m); return m; };
{
  // lantai keramik
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#efe7d8'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#d8ccb6'; x.lineWidth = 3; x.strokeRect(0, 0, 128, 128);
  const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(15, 14); tx.colorSpace = THREE.SRGBColorSpace;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(15, 14), new THREE.MeshLambertMaterial({ map: tx }));
  fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; fl.receiveShadow = true; room.add(fl);
  const WALL = 0xf6e7c8;
  rbox(0, 1.6, -7, 15.2, 3.2, 0.3, WALL);                 // dinding belakang
  rbox(-7.5, 1.6, 0, 0.3, 3.2, 14.3, WALL);               // dinding kiri (jendela)
  rbox(-1.5, 1.6, 7, 12.3, 3.2, 0.3, WALL);               // dinding depan
  rbox(7.1, 1.6, 7, 0.8, 3.2, 0.3, WALL);
  rbox(5.6, 2.95, 7, 2.2, 0.5, 0.3, WALL);
  for (let i = 0; i < 4; i++) rbox(-7.33, 1.8, -5 + i * 3.3, 0.06, 1.5, 2.2, 0x7cc3ea);   // jendela
  addDoor(room, 4.65, 7, 2.05, 2.7, 1);                     // pintu kelas: tertutup setelah masuk
  const classBag = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.25), mat(0x3b7dd8)); classBag.visible = false; room.add(classBag); room.userData.bag = classBag;
  rbox(-0.5, 1.75, 6.8, 6.4, 1.9, 0.12, 0x9aa1a8); rbox(-0.5, 1.75, 6.73, 6.1, 1.65, 0.05, 0xffffff);   // papan tulis
  rbox(-0.5, 0.82, 6.68, 6.2, 0.06, 0.18, 0x9aa1a8);
  rbox(-0.5, 2.95, 6.55, 0.6, 0.25, 0.5, 0x555b63);       // proyektor
  rbox(-4.9, 0.4, 5.1, 2.2, 0.8, 1.0, 0x9b6b3c); rbox(-4.9, 0.84, 5.1, 2.3, 0.08, 1.1, 0xb98652);   // meja guru
  rbox(-4.9, 0.95, 5.0, 0.6, 0.06, 0.4, 0x3b4048);         // laptop
  rbox(-5.6, 1.0, 5.2, 0.35, 0.25, 0.45, 0x7a4fb0);        // tumpukan buku
  rbox(0, 1.9, -6.8, 7, 1.3, 0.08, 0x3a7a4a);              // mading
  [0x8fd3f0, 0xffc07a, 0xfff2a0, 0x9fe0a0, 0xd1b3ff].forEach((cc, i) => rbox(-2.8 + i * 1.4, 1.9, -6.74, 0.9, 0.9, 0.04, cc));
  rbox(6.5, 1.1, -6.3, 1.3, 2.2, 0.7, 0x9b6b3c);           // lemari buku
  [0.5, 1.1, 1.7].forEach((y) => rbox(6.5, y, -5.93, 1.1, 0.4, 0.05, [0xd9577a, 0x3b7dd8, 0x58ad4e][Math.round(y * 2) % 3]));
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.6, 12), mat(0x2f9a4a)); bin.position.set(6.8, 0.3, 5.3); room.add(bin);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.5, 12), mat(0xffffff)); pot.position.set(-6.8, 0.25, -6.4); room.add(pot);
  const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), mat(0x3f9a47)); leaf.position.set(-6.8, 0.95, -6.4); room.add(leaf);
}
// 36 meja & kursi (6 × 6), menghadap papan tulis
const SEATS = [];
for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
  const x = -4.5 + c * 1.8, z = -4.4 + r * 1.55;
  rbox(x, 0.74, z, 1.0, 0.07, 0.6, 0xd59a5c); rbox(x - 0.42, 0.37, z, 0.06, 0.74, 0.5, 0x6d6f73); rbox(x + 0.42, 0.37, z, 0.06, 0.74, 0.5, 0x6d6f73);
  rbox(x, 0.45, z - 0.62, 0.5, 0.06, 0.45, 0x6d6f73); rbox(x, 0.78, z - 0.85, 0.5, 0.6, 0.05, 0x6d6f73);
  SEATS.push({ x, z: z - 0.62, r, c });
}
const MY_SEAT = SEATS.find((s) => s.r === 3 && s.c === 5);
room.userData.bag.position.set(MY_SEAT.x, 0.6, MY_SEAT.z - 0.62);
let classmates = [], roomTeacher = null, builtFor = '';
function sitPose(p, on) {
  p.position.y = on ? -0.32 : 0;
  p.legL.rotation.x = p.legR.rotation.x = on ? -1.5 : 0;
  p.armL.rotation.x = p.armR.rotation.x = on ? -0.8 : 0;
  p.sitting = on;
}
function buildClassmates() {
  if (builtFor === state.cls) return;
  classmates.forEach((m) => room.remove(m)); classmates = [];
  const putri = isPutri(state.cls);
  SEATS.forEach((s, i) => {
    if (s === MY_SEAT) return;
    const m = makePerson({ putri, skin: SKINS[i % 4] });
    m.position.set(s.x, 0, s.z); sitPose(m, true);
    m.phase = Math.random() * 6; room.add(m); classmates.push(m);
  });
  builtFor = state.cls;
}
function setRoomTeacher(full) {
  if (roomTeacher) room.remove(roomTeacher);
  const info = teacherInfo(full);
  roomTeacher = makePerson(teacherModel(info.g, full.length));
  roomTeacher.position.set(-2.2, 0, 5.4); roomTeacher.rotation.y = Math.PI; room.add(roomTeacher);
  nameTag(roomTeacher, info.p, 0.5);
  roomTeacher.info = info;
}
const ketua = () => classmates[0];
const classCam = new THREE.Vector3(), classLook = new THREE.Vector3();
function setClassCam() {
  const portrait = innerWidth < innerHeight;
  classCam.set(portrait ? 21 : 12.5, portrait ? 17 : 10.5, portrait ? 0.8 : 0.6).add(ROOM);
  classLook.set(-0.6, 0.2, 0.6).add(ROOM);
}
function walkTo(pts, done, origin = ROOM) { player.auto = { pts: pts.map(([x, z]) => new THREE.Vector3(x, 0, z).add(origin)), i: 0, done }; }
function updateAuto(dt) {
  const a = player.auto; if (!a) return;
  const p = a.pts[a.i], dx = p.x - player.position.x, dz = p.z - player.position.z, L = Math.hypot(dx, dz);
  if (L < 0.08) { a.i++; if (a.i >= a.pts.length) { player.auto = null; a.done && a.done(); } return; }
  const sp = Math.min(L, 3.2 * dt);
  player.position.x += dx / L * sp; player.position.z += dz / L * sp;
  player.rotation.y = Math.atan2(dx, dz);
  player.walkT += dt * 10; const sw = Math.sin(player.walkT) * 0.6;
  player.legL.rotation.x = sw; player.legR.rotation.x = -sw; player.armL.rotation.x = -sw; player.armR.rotation.x = sw;
}
function fade(text, ms, mid) {
  const f = $('fade'); f.querySelector('span').textContent = text; f.classList.add('show');
  setTimeout(() => { mid(); setTimeout(() => f.classList.remove('show'), 150); }, ms);
}
const later = (ms, fn) => setTimeout(fn, ms);
// masuk kelas: berjalan ke kursi, salam bersama, lalu memilih pelajaran
function enterClass(msg) {
  buildClassmates(); setClassCam();
  const first = today.find((b) => b.s && !dayDone.has(b.a)) || today.find((b) => b.s);
  setRoomTeacher(first ? first.g[0] : '');
  fade('Masuk kelas…', 750, () => {
    zone = 'kelas'; $('modal').classList.add('low');
    sitPose(player, false);
    player.position.set(5.6, 0, 6.3).add(ROOM); player.rotation.y = Math.PI;
    camera.position.copy(classCam); camera.lookAt(classLook);
    bubble(roomTeacher, msg, 2800);
    later(600, () => walkTo([[6.1, 5.4], [6.1, MY_SEAT.z], [MY_SEAT.x, MY_SEAT.z]], () => {
      player.rotation.y = 0; sitPose(player, true); storeBag();
      later(500, () => {
        Audio.sfx('bell');
        bubble(ketua(), 'Berdiri… beri salam!', 1800);
        later(1000, () => { classmates.forEach((m) => sitPose(m, false)); sitPose(player, false); });
        later(1900, () => { bubble(player, "Assalamu'alaikum warahmatullahi wabarakatuh!", 2200); classmates.slice(1, 4).forEach((m) => bubble(m, "Assalamu'alaikum…", 1800)); });
        later(3700, () => bubble(roomTeacher, "Wa'alaikumussalam warahmatullahi wabarakatuh. Silakan duduk.", 2400));
        later(5000, () => { classmates.forEach((m) => sitPose(m, true)); sitPose(player, true); });
        later(5600, classHub);
      });
    }));
  });
}
// tas: diletakkan di kursi kelas saat tiba, dibawa lagi saat pulang
function setBags(on) {
  if (player.bag) player.bag.visible = on;
  npcs.forEach((n) => { if (n.bag && n.kind === 'siswa') n.bag.visible = on; });
}
function storeBag() {
  if (!player.bag || !player.bag.visible) return;
  room.userData.bag.material = player.bag.material; room.userData.bag.visible = true;
  setBags(false); toast('🎒 Tas diletakkan di kursi kelas');
}
function takeBag() { room.userData.bag.visible = false; setBags(true); }
function backToClass(then) {   // kembali dari arena tugas langsung ke kursi
  setClassCam();
  zone = 'kelas'; $('modal').classList.add('low');
  player.position.set(MY_SEAT.x, 0, MY_SEAT.z).add(ROOM); player.rotation.y = 0; sitPose(player, true);
  camera.position.copy(classCam); camera.lookAt(classLook);
  then();
}
function exitClass(done) {
  fade('Keluar kelas…', 700, () => {
    $('modal').classList.remove('low');
    sitPose(player, false);
    const d = classDoors[state.cls];
    goOutside(d.x, d.z + 1.8, 0);
    done && done();
  });
}
function updateRoom(t) {
  if (zone !== 'kelas') return;
  for (const m of classmates) if (m.sitting && !m.bub) m.rotation.z = Math.sin(t * 1.3 + m.phase) * 0.04;
}

// =====================================================================
//  RUANGAN YANG BISA DIJELAJAHI: kantin, ruang Ustadz, ruang Ustadzah
// =====================================================================
function makeHall(origin, W, D, wall, floorA, floorB) {
  const g = new THREE.Group(); g.position.copy(origin); scene.add(g);
  const add = (x, y, z, w, h, d, c, col = false) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m);
    if (col) colliders.push({ x1: origin.x + x - w / 2, z1: origin.z + z - d / 2, x2: origin.x + x + w / 2, z2: origin.z + z + d / 2 });
    return m;
  };
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = floorA; x.fillRect(0, 0, 64, 64); x.fillStyle = floorB; x.fillRect(0, 0, 32, 32); x.fillRect(32, 32, 32, 32);
  const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(W / 2, D / 2); tx.colorSpace = THREE.SRGBColorSpace;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ map: tx })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; fl.receiveShadow = true; g.add(fl);
  add(0, 1.7, -D / 2, W + 0.3, 3.4, 0.3, wall, true);
  add(-W / 2, 1.7, 0, 0.3, 3.4, D, wall, true); add(W / 2, 1.7, 0, 0.3, 3.4, D, wall, true);
  add(-W / 4 - 0.9, 0.5, D / 2, W / 2 - 1.8, 1.0, 0.3, wall, true); add(W / 4 + 0.9, 0.5, D / 2, W / 2 - 1.8, 1.0, 0.3, wall, true);   // dinding depan (bawah)
  [-1, 1].forEach((s) => { const m = new THREE.Mesh(new THREE.BoxGeometry(W / 2 - 1.8, 2.4, 0.3), glassMat); m.position.set(s * (W / 4 + 0.9), 2.2, D / 2); g.add(m); });   // dinding depan atas (tembus pandang agar isi ruangan terlihat)
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 0.3), glassMat); top.position.set(0, 3.0, D / 2); g.add(top);
  addDoor(g, -1.8, D / 2, 1.8, 2.6, 1); addDoor(g, 1.8, D / 2, 1.8, 2.6, -1);   // pintu ganda: terbuka saat didekati, tertutup setelah masuk
  return { g, add, origin, W, D };
}
const KANTIN = new THREE.Vector3(320, 0, 120), RUANG_L = new THREE.Vector3(320, 0, -120), RUANG_P = new THREE.Vector3(420, 0, -120);
// ---------- kantin (dipakai bergantian: kantin putra / kantin putri) ----------
const kt = makeHall(KANTIN, 22, 16, 0xf6e1c4, '#f3ead9', '#e7dcc6');
{
  const { add } = kt;
  add(0, 0.55, -6.4, 14, 1.1, 1.4, 0xb98652, true);                          // meja saji
  [[-5.5, 0xfff4d6], [-3, 0xd4883a], [-0.5, 0x58ad4e], [2, 0xf2a33a], [4.5, 0xffffff]].forEach(([x, c]) => { add(x, 1.25, -6.4, 1.8, 0.3, 1.0, 0xbfc5cc); add(x, 1.42, -6.4, 1.5, 0.08, 0.8, c); });
  add(0, 2.4, -7.6, 9, 1.3, 0.1, 0x2f8a5c);                                    // poster 4 sehat 5 sempurna
  for (let i = 0; i < 6; i++) add(-6 + i * 2.4, 0.05, -4.4, 1.6, 0.04, 0.6, 0xffd84d);   // garis antre
  [-6.5, 0, 6.5].forEach((x) => [-0.5, 4.5].forEach((z) => {
    add(x, 0.75, z, 4.2, 0.1, 1.3, 0xd59a5c, true); add(x, 0.37, z, 0.3, 0.74, 0.8, 0x6d6f73);
    add(x, 0.45, z - 1.15, 4.2, 0.08, 0.45, 0x9b6b3c); add(x, 0.45, z + 1.15, 4.2, 0.08, 0.45, 0x9b6b3c);
  }));
  [-6.5, 0, 6.5].forEach((x) => [-0.5, 4.5].forEach((z) => {               // teko air & tempat sendok di tengah meja
    add(x, 0.92, z, 0.22, 0.26, 0.22, 0x9fd3f0); add(x + 0.45, 0.88, z, 0.16, 0.18, 0.16, 0x8a5a2b);
  }));
  const s = label('4 Sehat 5 Sempurna', 0, 0, 0, 0.8); scene.remove(s); s.position.set(0, 3.5, -7.4); kt.g.add(s);
}
const KT_SEAT = { x: 6.5 + 1.2, z: 4.5 - 1.15 };      // kursi kosong untuk pemain (menghadap meja)
const ktMarker = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.6, 24), new THREE.MeshBasicMaterial({ color: 0xffc83d })); ktMarker.rotation.x = -Math.PI / 2; ktMarker.position.set(KT_SEAT.x, 0.06, KT_SEAT.z); kt.g.add(ktMarker);
let ktPeople = [];
// ---------- makanan 3D (dipakai nampan pemain & teman) ----------
const FOOD = {
  nasi: (c) => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), mat(0xfffdf5)); o.scale.set(1.2, 0.55, 1); o.position.y = 0.03; c.add(o); },
  jagung: (c) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.24, 10), mat(0xf2c632)); o.rotation.z = Math.PI / 2; o.position.y = 0.05; c.add(o); const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.1), mat(0x7cb342)); l.position.set(0.12, 0.03, 0); c.add(l); },
  ayam: (c) => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), mat(0xb5651d)); o.scale.set(1.3, 0.9, 1); o.position.set(-0.02, 0.05, 0); c.add(o); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.09, 6), mat(0xf5ecd8)); t.rotation.z = Math.PI / 2; t.position.set(0.09, 0.05, 0); c.add(t); },
  ikan: (c) => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), mat(0x9a6a3a)); o.scale.set(2.2, 0.7, 0.9); o.position.y = 0.04; c.add(o); const t = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.08, 6), mat(0x7a4f28)); t.rotation.z = Math.PI / 2; t.position.set(0.17, 0.04, 0); c.add(t); },
  telur: (c) => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), mat(0xfffaf0)); o.scale.set(1, 1.25, 1); o.position.y = 0.07; c.add(o); const h = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), mat(0xfffaf0)); h.scale.set(1, 0.6, 1); h.position.set(0.12, 0.035, 0); c.add(h); const y = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), mat(0xf6b51e)); y.scale.set(1, 0.6, 1); y.position.set(0.12, 0.06, 0); c.add(y); },
  tempe: (c) => { const o = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.1), mat(0xe8c26a)); o.position.y = 0.03; c.add(o); const o2 = o.clone(); o2.position.set(0.02, 0.07, 0.01); o2.rotation.y = 0.4; c.add(o2); },
  bayam: (c) => [[0, 0], [0.05, 0.03], [-0.05, 0.02], [0.02, -0.04], [-0.03, -0.03]].forEach(([x, z]) => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mat(0x2e7d32)); o.scale.set(1.2, 0.45, 1); o.position.set(x, 0.035, z); c.add(o); }),
  brokoli: (c) => [[0, 0], [0.06, 0.02], [-0.05, 0.03], [0.01, -0.05]].forEach(([x, z]) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.05, 6), mat(0x9ccc65)); s.position.set(x, 0.04, z); c.add(s); const h = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), mat(0x388e3c)); h.position.set(x, 0.08, z); c.add(h); }),
  pisang: (c) => { const o = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 6, 12, Math.PI * 0.8), mat(0xf7d33b)); o.rotation.x = -Math.PI / 2; o.position.y = 0.03; c.add(o); },
  jeruk: (c) => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), mat(0xff9a1f)); o.position.y = 0.06; c.add(o); const d = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.02), mat(0x4caf50)); d.position.y = 0.12; c.add(d); },
  susu: (c) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.15, 12), mat(0xffffff)); o.position.y = 0.08; c.add(o); },
};
// letak di nampan per kelompok
const MEAL_SLOT = { pokok: [-0.17, 0.02], lauk: [0.06, -0.1], sayur: [0.2, 0.09], buah: [0.25, -0.12], susu: [-0.3, -0.15] };
function makeMeal(menu = { pokok: 'nasi', lauk: 'ayam', sayur: 'bayam', buah: 'jeruk', susu: 'susu' }) {
  const g = new THREE.Group(); g.userData.parts = {};
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.46), mat(0xc9ced4)));
  for (const cat in menu) { if (!FOOD[menu[cat]]) continue; const c = new THREE.Group(); c.position.set(MEAL_SLOT[cat][0], 0.02, MEAL_SLOT[cat][1]); FOOD[menu[cat]](c); g.add(c); g.userData.parts[cat] = c; }
  return g;
}
const NPC_MENUS = [['nasi', 'ayam', 'bayam', 'jeruk'], ['nasi', 'telur', 'brokoli', 'pisang'], ['nasi', 'ikan', 'bayam', 'pisang'], ['jagung', 'tempe', 'brokoli', 'jeruk']];
const npcMeal = (i) => { const m = NPC_MENUS[i % NPC_MENUS.length]; return makeMeal({ pokok: m[0], lauk: m[1], sayur: m[2], buah: m[3], susu: 'susu' }); }
function populateKantin() {
  ktPeople.forEach((p) => { scene.remove(p); const i = npcs.indexOf(p); if (i >= 0) npcs.splice(i, 1); }); ktPeople = [];
  const putri = meP();
  const ibu = makePerson({ putri: true, shirt: 0xffffff, bottom: 0x3a3a3a, hijab: 0x2f8a5c });
  ibu.position.set(KANTIN.x, 0, KANTIN.z - 7.4); ibu.rotation.y = 0; scene.add(ibu);
  Object.assign(ibu, { fixed: true, kind: 'kantin', putri: true, name: 'Ibu Kantin', greetDay: 0, homeRot: 0 });
  nameTag(ibu, 'Ibu Kantin'); npcs.push(ibu); ktPeople.push(ibu);
  let k = 0;
  [-6.5, 0, 6.5].forEach((x) => [-0.5, 4.5].forEach((z) => [-1.15, 1.15].forEach((side) => {
    [-1.3, 0, 1.3].forEach((dx) => {
            if (Math.abs(x + dx - KT_SEAT.x) < 0.8 && Math.abs(z + side - KT_SEAT.z) < 0.5) return;
      if ((k++ % 3) === 2) return;
      const m = makePerson(studentModel(putri, k));
      m.position.set(KANTIN.x + x + dx, 0, KANTIN.z + z + side); m.rotation.y = side < 0 ? 0 : Math.PI; sitPose(m, true); m.seated = true; m.position.y = -0.32;
      addSpoon(m); m.eater = true; m.phase = Math.random() * 6; m.rate = 0.8 + Math.random() * 0.6;
      scene.add(m); ktPeople.push(m);
      const tray = npcMeal(k); tray.position.set(KANTIN.x + x + dx, 0.81, KANTIN.z + z + side * 0.45); tray.rotation.y = side < 0 ? 0 : Math.PI; scene.add(tray); ktPeople.push(tray);
    });
  })));
}
// ---------- ruang Ustadz / ruang Ustadzah ----------
// ruang guru: SETIAP guru punya meja sendiri dengan papan nama
function buildRuang(origin, putri) {
  const list = Object.keys(TEACH).filter((t) => TEACH[t].g === (putri ? 'P' : 'L'))
    .sort((a, b) => TEACH[a].p.localeCompare(TEACH[b].p, 'id'));
  const cols = putri ? 8 : 6, rows = Math.ceil(list.length / cols), DX = 3.2, DZ = 3.6;
  const W = cols * DX + 5, D = rows * DZ + 8;
  const h = makeHall(origin, W, D, 0xf3e0c8, '#ece4d4', '#e2d8c4');
  const { add } = h;
  h.D = D; h.desks = {};
  const z0 = -D / 2 + 2.6;
  list.forEach((t, i) => {
    const r = Math.floor(i / cols), c = i % cols, x = (c - (cols - 1) / 2) * DX, z = z0 + r * DZ;
    add(x, 0.4, z + 0.9, 2.3, 0.8, 1.0, 0x9b6b3c, true); add(x, 0.84, z + 0.9, 2.4, 0.07, 1.1, 0xb98652);          // meja
    add(x + 0.55, 1.12, z + 0.7, 0.75, 0.5, 0.05, 0x2b2f36); add(x + 0.55, 0.92, z + 0.72, 0.16, 0.12, 0.12, 0x2b2f36);   // komputer
    add(x - 0.75, 0.95, z + 0.8, 0.35, 0.2, 0.45, [0xd9577a, 0x3b7dd8, 0x58ad4e, 0xf2a33a][i % 4]);                   // buku
    add(x - 0.15, 0.95, z + 1.42, 1.0, 0.2, 0.06, 0xf5f0e0);                                                              // papan nama
    const nm = label(TEACH[t].p, 0, 0, 0, 0.26); scene.remove(nm); nm.position.set(x - 0.15, 1.33, z + 1.5); h.g.add(nm);
    // kursi
    add(x, 0.45, z - 0.05, 0.62, 0.08, 0.58, 0x2b2f36); add(x, 0.82, z - 0.36, 0.62, 0.62, 0.06, 0x2b2f36);
    h.desks[t] = { x: origin.x + x, z: origin.z + z };
  });
  add(0, 2.2, -D / 2 + 0.3, 6, 1.5, 0.1, 0xffffff);
  add(W / 2 - 1, 0.6, D / 2 - 3, 0.6, 1.2, 0.6, 0x58b8e8); add(-W / 2 + 1.2, 0.4, D / 2 - 3.5, 1.2, 0.8, 3, putri ? 0xb04a6e : 0x3b5e9e, true);   // dispenser & sofa
  const s = label(putri ? 'Ruang Ustadzah' : 'Ruang Ustadz', 0, 0, 0, 0.9); scene.remove(s); s.position.set(0, 3.7, -D / 2 + 0.4); h.g.add(s);
  const s2 = label('Jadwal Piket Guru', 0, 0, 0, 0.45); scene.remove(s2); s2.position.set(0, 2.3, -D / 2 + 0.45); h.g.add(s2);
  h.people = []; h.byName = {};
  return h;
}
const ruangL = buildRuang(RUANG_L, false), ruangP = buildRuang(RUANG_P, true);
const ESA = 'Esa Anugerah Putra, M.Pd., Gr.';
function populateRuang() {
  [ruangL, ruangP].forEach((h, k) => {
    h.people.forEach((p) => { scene.remove(p); const i = npcs.indexOf(p); if (i >= 0) npcs.splice(i, 1); }); h.people = []; h.byName = {};
    const g = k ? 'P' : 'L';
    const mine = classTeachers(state.cls);
    Object.keys(h.desks).forEach((t, i) => {
      // sebagian guru sedang mengajar di kelas (mejanya kosong); guru kelasmu & Ustadz Esa selalu ada
      const hadir = mine.includes(t) || t === ESA || ((i * 7 + (state.day || 1) * 3) % 10) < 6;
      if (!hadir) return;
      const d = h.desks[t], info = teacherInfo(t), m = makePerson(teacherModel(g, i));
      m.position.set(d.x, 0, d.z); m.rotation.y = 0; sitPose(m, true);
      Object.assign(m, { fixed: true, seated: true, kind: 'guru', putri: g === 'P', sapaan: g === 'P' ? 'Ustadzah' : 'Ustadz', name: info.p, greetDay: 0, homeRot: 0, full: t });
      scene.add(m); h.people.push(m); npcs.push(m); h.byName[t] = m;
    });
  });
}
// sendok di tangan kanan
function addSpoon(p) {
  if (p.spoon) return p.spoon;
  const s = new THREE.Group();
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.38), mat(0xd9dde2)); h.position.z = 0.15; s.add(h);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), mat(0xd9dde2)); b.scale.set(1, 0.4, 1.3); b.position.z = 0.36; s.add(b);
  s.position.set(0, -0.82, 0.05); p.armR.add(s); p.spoon = s; return s;
}
// teman-teman di kantin menyuap makanan bergantian
function updateKantin(t) {
  if (zone !== 'kantin') return;
  for (const m of ktPeople) {
    if (!m.eater || m.anim) continue;
    const c = Math.max(0, Math.sin(t * m.rate * 2.2 + m.phase));
    m.armR.rotation.x = -0.8 - 1.45 * c; m.armR.rotation.z = 0.3 * c; m.rotation.x = 0.06 * c;
    m.armL.rotation.x = -0.8;
  }
}
