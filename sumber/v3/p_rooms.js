
// =====================================================================
//  RUANGAN YANG DIBUKA: UKS, Lab Komputer, Kepala Sekolah & TU, Masjid (bisa dijelajahi)
// =====================================================================
const UKS = new THREE.Vector3(520, 0, -120), LABR = new THREE.Vector3(620, 0, -120), KEPS = new THREE.Vector3(620, 0, 120);
let roomSpots = [];           // titik interaksi di dalam ruangan aktif: {x, z, id}
function spot(origin, x, z, g) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.62, 24), new THREE.MeshBasicMaterial({ color: 0xffc83d })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z); g.add(m);
  return { x: origin.x + x, z: origin.z + z };
}
// ---------- UKS ----------
const uks = makeHall(UKS, 18, 12, 0xf4f8fb, '#eef3f6', '#e3eaef');
const UKS_SPOTS = {};
{
  const { add } = uks;
  [-5, 0, 5].forEach((x) => { add(x, 0.45, -3.6, 2, 0.5, 3.6, 0xffffff, true); add(x, 0.75, -4.9, 1.6, 0.25, 0.7, 0xdfe9f5); add(x, 0.25, -3.6, 1.9, 0.5, 3.4, 0x9aa1a8);
    add(x + 1.4, 1.4, -3.6, 0.06, 2.8, 3.6, 0x9fd3c7); });                                                                        // ranjang + tirai
  add(7.6, 1.2, -5.2, 1.4, 2.4, 0.8, 0xffffff, true); add(7.6, 1.6, -4.79, 1.2, 0.9, 0.04, 0x8fd3f0); add(7.6, 2.1, -4.78, 0.5, 0.5, 0.03, 0xe53935);   // lemari obat
  add(-7.4, 0.5, 2.5, 1.2, 1, 2.2, 0xb98652, true);                                                                              // meja petugas
  add(5.5, 0.08, 3, 0.6, 0.12, 0.5, 0x555b63); add(5.5, 1.1, 2.8, 0.08, 2.2, 0.08, 0x9aa1a8);                                     // timbangan & pengukur tinggi
  add(0, 2.3, -5.85, 4, 1.1, 0.06, 0x2f8a5c);
  const s = label('UKS · Unit Kesehatan Sekolah', 0, 0, 0, 0.6); scene.remove(s); s.position.set(0, 3.5, -5.7); uks.g.add(s);
  UKS_SPOTS.petugas = spot(UKS, -5.6, 2.5, uks.g);
  UKS_SPOTS.ranjang = spot(UKS, 3.2, -1.2, uks.g);
}
let uksPeople = [];
function enterUKS() {
  uksPeople.forEach((p) => scene.remove(p)); uksPeople = [];
  const pt = makePerson({ putri: true, shirt: 0xffffff, bottom: 0x3a3a3a, hijab: 0x8fd3c7 }); pt.position.set(UKS.x - 8.4, 0, UKS.z + 2.5); pt.rotation.y = Math.PI / 2; nameTag(pt, 'Petugas UKS', 0.5); scene.add(pt); uksPeople.push(pt);
  const dd = doorsOut.find((d) => d.id === 'uks');
  enterHall('UKS', UKS, 12, { x: dd.x, z: dd.z + 1.5, rot: 0 }, () => {
    roomSpots = [{ ...UKS_SPOTS.petugas, id: 'uks-petugas' }, { ...UKS_SPOTS.ranjang, id: 'uks-ranjang' }];
    bubble(player, "Assalamu'alaikum…", 1500);
    setTimeout(() => bubble(pt, `Wa'alaikumussalam. Ada keluhan apa, ${state.nama}?`, 2800), 900);
    toast('🩺 Dekati meja petugas untuk berobat');
  }, 'room');
}
const KELUHAN = {
  pusing: ['🤕 Pusing', 'Duduk atau berbaring sebentar, minum air putih, dan jangan lupa sarapan, ya. Kalau pusingnya tidak hilang, kami hubungi orang tuamu.'],
  perut: ['🤢 Sakit perut', 'Istirahat dulu di ranjang dan minum air hangat. Kalau makin sakit atau muntah, kami hubungi orang tuamu untuk dibawa ke dokter.'],
  luka: ['🩹 Luka kecil / lecet', 'Lukanya kita bersihkan dengan air bersih, lalu ditutup plester. Hati-hati kalau main bola, ya.'],
  lemas: ['😴 Badan lemas', 'Berbaring sebentar dan minum air putih. Pastikan cukup tidur dan makan teratur.'],
};
function uksPetugas() {
  modal(`<div class="tag">🩺 UKS</div><div class="big">Keluhan apa?</div><p class="muted">Petugas UKS akan memberi pertolongan pertama.</p>`,
    Object.entries(KELUHAN).map(([k, v]) => [v[0], () => {
      bubble(uksPeople[0], 'Baik, sebentar ya.', 1500);
      modal(`<div class="tag">🩺 Petugas UKS</div><p>${v[1]}</p><p class="muted">Di game ini hanya simulasi. Kalau benar-benar sakit, segera beri tahu guru atau orang tua.</p>`,
        [['🛏️ Berbaring istirahat sebentar', () => { closeModal(); uksRest(); }, 'main'], ['Terima kasih, Bu', closeModal, 'small']]);
    }, 'opt']).concat([['Tidak jadi', closeModal, 'small']]));
}
function uksRest() {
  paused = true;
  fade('Beristirahat sebentar di ranjang UKS…', 1600, () => {
    player.position.set(UKS.x + 3.2, 0, UKS.z - 1.2); player.rotation.y = 0;
    toast('Alhamdulillah, badan terasa lebih baik'); bubble(player, 'Alhamdulillah, sudah enakan.', 2000);
    paused = false;
  });
}
// ---------- Lab Komputer ----------
const labr = makeHall(LABR, 22, 14, 0xe8eef5, '#e6ebf0', '#d8dfe6');
const LAB_PCS = [];
{
  const { add } = labr;
  for (let r = 0; r < 3; r++) {
    const z = -4 + r * 3.4;
    add(0, 0.4, z, 17, 0.8, 1.0, 0xb98652, true);
    for (let c = 0; c < 6; c++) {
      const x = -7 + c * 2.8;
      add(x, 1.15, z - 0.25, 1.1, 0.7, 0.06, 0x1f2a36); add(x, 1.15, z - 0.22, 1.0, 0.6, 0.02, [0x3b7dd8, 0x2f8a5c, 0x8f5fb0, 0xe0623e][(r + c) % 4]);
      add(x, 0.86, z + 0.15, 0.7, 0.03, 0.25, 0x2b2f36); add(x, 0.45, z + 1.0, 0.55, 0.08, 0.5, 0x2b2f36);
      LAB_PCS.push({ x, z: z + 1.0, r, c });
    }
  }
  add(0, 1.8, -6.85, 6, 2, 0.08, 0xffffff); add(-8.8, 0.45, -5.6, 2, 0.9, 1, 0x9b6b3c, true);
  const s = label('Lab Komputer · 🎮 Arcade Edukasi', 0, 0, 0, 0.6); scene.remove(s); s.position.set(0, 3.5, -6.7); labr.g.add(s);
}
const LAB_FREE = LAB_PCS.find((p) => p.r === 2 && p.c === 3);
const LAB_SPOT = spot(LABR, LAB_FREE.x, LAB_FREE.z + 0.9, labr.g);
let labPeople = [];
function enterLabRoom() {
  labPeople.forEach((p) => scene.remove(p)); labPeople = [];
  const putri = isPutri(state.cls);
  LAB_PCS.forEach((p, i) => { if (p === LAB_FREE || i % 3 === 1) return; const m = makePerson(studentModel(putri, i)); m.position.set(LABR.x + p.x, 0, LABR.z + p.z); m.rotation.y = Math.PI; sitPose(m, true); m.armL.rotation.x = m.armR.rotation.x = -1.2; scene.add(m); labPeople.push(m); });
  const g = makePerson(teacherModel(putri ? 'P' : 'L', 4)); g.position.set(LABR.x - 8.8, 0, LABR.z - 4.4); g.rotation.y = 0; nameTag(g, putri ? 'Ustadzah TIK' : 'Ustadz TIK', 0.5); scene.add(g); labPeople.push(g);
  const dd = doorsOut.find((d) => d.id === 'lab');
  enterHall('Lab Komputer', LABR, 14, { x: dd.x, z: dd.z + 1.5, rot: 0 }, () => {
    roomSpots = [{ ...LAB_SPOT, id: 'lab-pc' }];
    bubble(g, `Silakan pakai komputer yang kosong, ${state.nama}.`, 2600);
    toast('🎮 Duduk di komputer kosong (lingkaran kuning)');
  }, 'room');
}
// ---------- kursi untuk petugas/guru yang duduk ----------
function chairAt(g, x, z, rot, c = 0x2b2b2b) {
  const k = new THREE.Group(); k.position.set(x, 0, z); k.rotation.y = rot; g.add(k);
  const m = (w, h, d, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); o.position.set(px, py, pz); o.castShadow = true; k.add(o); };
  m(0.75, 0.1, 0.7, 0, 0.45, 0); m(0.75, 0.75, 0.08, 0, 0.85, -0.35); m(0.08, 0.45, 0.08, 0, 0.22, 0);
  return k;
}
function seatPerson(p, wx, wz, rot) { p.position.set(wx, 0, wz); p.rotation.y = rot; sitPose(p, true); p.seated = true; p.homeRot = rot; }
// ---------- Kantor Kepala Sekolah & Wakil Kepala Sekolah ----------
//  depan: ruang tamu · belakang: 3 ruangan tertutup berpintu:
//  ruang kepala sekolah | ruang waka ustadz | ruang waka ustadzah (terpisah)
const KEPS_STAFF = [
  { n: 'Rusli Supriatna, S.Pd.', p: 'Ustadz Rusli', j: 'Kepala Sekolah', g: 'L', x: -8.75, look: 1 },
  { n: 'Mudiar Efendi, S.Pd.I.', p: 'Ustadz Mudiar', j: "Waka Ulumus Syar'i", g: 'L', x: -2.9, look: 2 },
  { n: 'Rahmat Doni, M.Sos., Gr.', p: 'Ustadz Rahmat', j: 'Waka Humas', g: 'L', x: 0, look: 3 },
  { n: 'Hendri Dunan, S.Pd', p: 'Ustadz Hendri', j: 'Waka Sarpras', g: 'L', x: 2.9, look: 4 },
  { n: 'Rustiyani', p: 'Ustadzah Rustiyani', j: 'Waka Kurikulum', g: 'P', x: 7.0, look: 1 },
  { n: 'Retmi Hartati, S.Sos', p: 'Ustadzah Retmi', j: 'Waka Kesiswaan', g: 'P', x: 10.6, look: 3 },
];
if (SCHOOL.demo) [['Ustadz Hasyim', 'L'], ['Ustadz Mahmud', 'L'], ['Ustadz Ridwan', 'L'], ['Ustadz Syamsul', 'L'], ['Ustadzah Khadijah', 'P'], ['Ustadzah Rosidah', 'P']].forEach(([p], i) => { KEPS_STAFF[i].p = p; KEPS_STAFF[i].n = p; });
const KEPS_Z = -6.5;   // posisi duduk di belakang meja
const keps = makeHall(KEPS, 26, 16, 0xf3e6cf, '#e8dcc4', '#dccfb4');
{
  const { add } = keps, H = 3.0, wl = 0xe9dcc2, tag = (t, x, y, z, sz = 0.5) => { const l = label(t, 0, 0, 0, sz); scene.remove(l); l.position.set(x, y, z); keps.g.add(l); };
  // dinding pemisah tiga ruangan belakang (z -8..-0.5)
  add(-4.5, H / 2, -4.25, 0.25, H, 7.5, wl, true); add(4.5, H / 2, -4.25, 0.25, H, 7.5, wl, true);
  // dinding depan masing-masing ruangan + pintu
  const front = (x1, x2, g1, g2) => { add((x1 + g1) / 2, H / 2, -0.5, g1 - x1, H, 0.25, wl, true); add((g2 + x2) / 2, H / 2, -0.5, x2 - g2, H, 0.25, wl, true); add((g1 + g2) / 2, 2.85, -0.5, g2 - g1, 0.3, 0.25, wl); addDoor(keps.g, g1, -0.5, g2 - g1, 2.6, 1); };
  front(-13, -4.5, -9.75, -7.75); front(-4.5, 4.5, -1, 1); front(4.5, 13, 7.8, 9.8);
  // ruang kepala sekolah
  add(-8.75, 0.45, -5.1, 3.4, 0.9, 1.3, 0x6b4a2b, true); add(-8.75, 0.93, -5.1, 3.5, 0.07, 1.4, 0x8a5a2b);
  add(-8.75, 1.15, -4.6, 1.1, 0.25, 0.04, 0x2f6b4a);
  add(-12.5, 1.2, -5.0, 0.6, 2.4, 2.8, 0x8a5a2b, true); [0, 1, 2].forEach((r) => [0, 1, 2].forEach((c) => add(-12.15, 0.6 + r * 0.7, -6.0 + c * 0.9, 0.2, 0.45, 0.25, 0xf5c542)));
  add(-6.2, 2.1, -7.85, 1.4, 0.45, 0.04, 0xe53935); add(-6.2, 1.65, -7.85, 1.4, 0.45, 0.04, 0xffffff);
  add(-10.8, 2.0, -7.85, 1.4, 1.0, 0.04, 0xf3efe2);
  [-9.9, -7.6].forEach((x) => chairAt(keps.g, x, -3.4, Math.PI, 0x3b5e9e));   // kursi tamu di depan meja
  tag('Ruang Kepala Sekolah', -8.75, 3.5, -0.6, 0.42);
  tag('Ruang Waka · Ustadz', 0, 3.5, -0.6, 0.42);
  tag('Ruang Waka · Ustadzah', 8.8, 3.5, -0.6, 0.42);
  add(0, 2.1, -7.85, 3.6, 1.3, 0.05, 0xffffff); tag('Struktur Sekolah', 0, 3.0, -7.7, 0.32);
  add(12.6, 1.1, -5.5, 0.6, 2.2, 2.2, 0x8a5a2b, true);                     // lemari arsip ustadzah
  KEPS_STAFF.forEach((w, i) => {
    chairAt(keps.g, w.x, KEPS_Z, 0);
    if (i === 0) return;
    add(w.x, 0.4, -5.2, 2.0, 0.8, 1.0, 0x8a5a2b, true); add(w.x, 0.83, -5.2, 2.1, 0.06, 1.1, 0xa8774a);
    add(w.x + 0.6, 1.1, -5.4, 0.5, 0.35, 0.06, 0x333a40);
    add(w.x - 0.3, 0.95, -4.8, 0.9, 0.18, 0.06, 0xf5f0e0); tag(w.j, w.x - 0.3, 1.4, -4.7, 0.26);
  });
  // ruang tamu (depan kiri)
  add(-12.3, 0.4, 4.2, 1.1, 0.8, 3.6, 0x2f6b4a, true); add(-9.6, 0.4, 1.6, 3.4, 0.8, 1.1, 0x2f6b4a, true);
  add(-9.4, 0.25, 4.2, 2.4, 0.5, 1.3, 0x9b6b3c, true); add(-9.4, 0.53, 4.2, 2.5, 0.05, 1.4, 0xc9a26b);
  add(-9.9, 0.62, 4.0, 0.3, 0.12, 0.3, 0xffffff); add(-8.9, 0.62, 4.4, 0.3, 0.12, 0.3, 0xffffff);
  add(-12.3, 0.6, 7.2, 0.7, 1.2, 0.7, 0x7a4a2a); add(-12.3, 1.6, 7.2, 1.1, 1.0, 1.1, 0x3f8f44);
  tag('Ruang Tamu', -9.6, 2.5, 6.6, 0.45);
  // meja penerima tamu (depan kanan)
  add(5, 0.55, 5.4, 2.6, 1.1, 0.8, 0xb98652, true); chairAt(keps.g, 5, 4.4, 0);
}
let kepsPeople = [];
function enterKepsek() {
  kepsPeople.forEach((p) => { scene.remove(p); const i = npcs.indexOf(p); if (i >= 0) npcs.splice(i, 1); }); kepsPeople = [];
  KEPS_STAFF.forEach((w, i) => {
    const p = makePerson(teacherModel(w.g, w.look));
    Object.assign(p, { fixed: true, kind: 'guru', putri: w.g === 'P', sapaan: w.g === 'P' ? 'Ustadzah' : 'Ustadz', name: w.p, greetDay: 0 });
    seatPerson(p, KEPS.x + w.x, KEPS.z + KEPS_Z, 0);
    nameTag(p, i === 0 ? `${w.p} · ${w.j}` : w.p, 0.42, 2.4);
    scene.add(p); npcs.push(p); kepsPeople.push(p);
  });
  const r = makePerson(teacherModel('L', 5));
  Object.assign(r, { fixed: true, kind: 'guru', putri: false, sapaan: 'Ustadz', name: 'Penerima Tamu', greetDay: 0 });
  seatPerson(r, KEPS.x + 5, KEPS.z + 4.4, 0); nameTag(r, 'Penerima Tamu', 0.42, 2.4);
  scene.add(r); npcs.push(r); kepsPeople.push(r);
  const dd = doorsOut.find((d) => d.id === 'kepsek');
  enterHall('Kantor Kepala Sekolah', KEPS, 16, { x: dd.x, z: dd.z + 1.5, rot: 0 }, () => {
    roomSpots = [{ ...KEPS_SPOTS.tamu, id: 'keps-tamu' }];
    say([{ p: player, t: "Assalamu'alaikum… permisi." }, { p: r, t: `Wa'alaikumussalam, ${state.nama}. Silakan duduk dulu di ruang tamu, ya.`, e: 'senang' }]);
    toast('Ruang tamu di kiri · ruangan Kepala Sekolah & Waka di belakang');
  }, 'room');
}
const KEPS_SPOTS = { tamu: spot(KEPS, -6.6, 4.2, keps.g) };
function kepsTamu() {
  paused = true;
  fade('Duduk di ruang tamu…', 900, () => {
    player.position.set(KEPS.x - 6.6, 0, KEPS.z + 4.2); player.rotation.y = -Math.PI / 2; paused = false;
    setTimeout(() => say([{ p: kepsPeople[0], t: `${state.nama}, silakan masuk ke ruangan saya.`, e: 'senang',
      ch: [['"Baik, Ustadz. Terima kasih."', () => {}], ['"Afwan Ustadz, saya hanya mampir."', () => say([{ p: kepsPeople[0], t: 'Tidak apa-apa. Belajar yang rajin, ya!', e: 'senang' }])]] }]), 600);
    toast('Dipanggil Kepala Sekolah — masuk lewat pintu ruangannya, lalu ketuk 💬 Sapa');
  });
}
// ---------- Gedung Tata Usaha & Bendahara (LKMS) ----------
//  depan: lobi + ruang tamu TU · kiri: Kantor TU (berpintu) · kanan: Ruang Bendahara (berpintu, ada antrean)
const TUR = new THREE.Vector3(720, 0, 120);
// [nama, jabatan, L/P, model, x, z]  (duduk menghadap +z, meja di depannya)
const TU_STAFF = [
  ['Ustadz Dede', 'Kepala TU', 'L', 1, -3.6, -5.6],
  ['Ustadzah Ridanty', 'Staf TU', 'P', 2, -9.2, -2.2],
  ['Ustadz Rifzen', 'Staf TU', 'L', 3, -3.6, -2.2],
  ['Ustadzah Santi', 'Staf TU', 'P', 4, -9.2, -5.6],
  ['Ustadz Sakti', 'Bendahara Sekolah', 'L', 2, 3.6, -5.0],
  ['Ustadzah Sakinah', 'Bendahara LKMS', 'P', 1, 8.6, -5.0],
];
if (SCHOOL.demo) ['Ustadz Darmawan', 'Ustadzah Nurul', 'Ustadz Hanafi', 'Ustadzah Siti', 'Ustadz Bahar', 'Ustadzah Mutia'].forEach((p, i) => (TU_STAFF[i][0] = p));
const tur = makeHall(TUR, 24, 16, 0xe6eef3, '#dde6ec', '#cfdbe3');
const TU_SPOTS = {};
{
  const { add } = tur, H = 3.0, wl = 0xd5e0e8, tag = (t, x, y, z, sz = 0.42) => { const l = label(t, 0, 0, 0, sz); scene.remove(l); l.position.set(x, y, z); tur.g.add(l); };
  // sekat: kantor TU (x -12..-0.3) | ruang bendahara (x 0.3..12), keduanya z -8..1.5; lobi di depan
  add(0, H / 2, -3.25, 0.5, H, 9.5, wl, true);
  const front = (x1, x2, g1, g2) => { add((x1 + g1) / 2, H / 2, 1.5, g1 - x1, H, 0.25, wl, true); add((g2 + x2) / 2, H / 2, 1.5, x2 - g2, H, 0.25, wl, true); add((g1 + g2) / 2, 2.85, 1.5, g2 - g1, 0.3, 0.25, wl); addDoor(tur.g, g1, 1.5, g2 - g1, 2.6, 1); };
  front(-12, -0.25, -7.2, -5.0); front(0.25, 12, 5.0, 7.2);
  // --- kantor TU: meja & kursi tiap petugas, sekat rendah ustadz | ustadzah ---
  TU_STAFF.slice(0, 4).forEach(([, jab, , , x, z]) => { chairAt(tur.g, x, z, 0); add(x, 0.4, z + 1.05, 2.0, 0.8, 0.9, 0x8a5a2b, true); add(x + 0.55, 1.05, z + 0.95, 0.5, 0.35, 0.06, 0x333a40); add(x - 0.4, 0.95, z + 1.45, 0.9, 0.18, 0.06, 0xf5f0e0); tag(jab, x - 0.4, 1.35, z + 1.55, 0.24); });
  add(-6.4, 0.7, -3.6, 0.12, 1.4, 7.6, 0xb9c7d2, true);                 // sekat rendah
  add(-11.6, 1.1, -7.2, 0.6, 2.2, 1.6, 0x8a5a2b, true); add(-1.2, 1.1, -7.6, 1.6, 2.2, 0.6, 0x8a5a2b, true);   // lemari arsip
  tag('Kantor Tata Usaha', -6.1, 3.5, 1.4);
  // --- ruang bendahara: dua loket, kaca, antrean bertali ---
  add(6.1, 0.55, -3.6, 11, 1.1, 0.8, 0xb98652, true);                    // meja loket
  [3.6, 8.6].forEach((x) => add(x, 1.75, -3.6, 4.2, 1.3, 0.05, 0xbfe3f5)); add(6.1, 1.5, -3.6, 0.12, 2.0, 0.9, 0x8a9aa6, true);
  TU_STAFF.slice(4).forEach(([, , , , x, z]) => { chairAt(tur.g, x, z, 0); add(x, 1.35, -3.85, 0.55, 0.4, 0.06, 0x333a40); });
  [3.6, 8.6].forEach((x) => {                                            // jalur antrean: tiang + tali
    [-1.3, 1.3].forEach((dx) => { [-2.6, -0.6, 1.0].forEach((z) => add(x + dx, 0.5, z, 0.12, 1.0, 0.12, 0x9aa1a8, true)); add(x + dx, 0.85, -0.8, 0.05, 0.06, 3.6, 0xc0392b); });
    for (let i = 0; i < 3; i++) add(x, 0.04, -2.2 + i * 1.1, 1.0, 0.03, 0.08, 0xffd84d);
  });
  tag('Ruang Bendahara', 6.1, 3.5, 1.4); tag('Bendahara Sekolah · SPP', 3.6, 2.9, -3.7, 0.34); tag('Bendahara LKMS', 8.6, 2.9, -3.7, 0.34);
  // --- lobi & ruang tamu TU (depan kiri) ---
  add(-11.3, 0.4, 5.0, 1.1, 0.8, 3.4, 0x3b5e9e, true); add(-8.6, 0.4, 2.6, 3.4, 0.8, 1.1, 0x3b5e9e, true);
  add(-8.4, 0.25, 5.0, 2.2, 0.5, 1.2, 0x9b6b3c, true); add(-8.4, 0.53, 5.0, 2.3, 0.05, 1.3, 0xc9a26b);
  add(-11.3, 0.6, 7.3, 0.7, 1.2, 0.7, 0x7a4a2a); add(-11.3, 1.6, 7.3, 1.1, 1.0, 1.1, 0x3f8f44);
  tag('Ruang Tamu TU', -8.6, 2.4, 7.2, 0.4);
  for (let i = 0; i < 4; i++) add(5.2 + i * 1.1, 0.25, 6.2, 0.9, 0.5, 0.9, 0x8a3b5c, true);   // kursi tunggu bendahara
  tag('Kursi tunggu', 6.8, 1.5, 6.2, 0.3);
  TU_SPOTS.tu = spot(TUR, -3.6, 0.3, tur.g); TU_SPOTS.tamu = spot(TUR, -6.0, 5.0, tur.g);
  TU_SPOTS.spp = spot(TUR, 3.6, 0.4, tur.g); TU_SPOTS.lkms = spot(TUR, 8.6, 0.4, tur.g);
}
let tuPeople = [], tuQueue = [];
function enterTU() {
  tuPeople.concat(tuQueue).forEach((p) => { scene.remove(p); const i = npcs.indexOf(p); if (i >= 0) npcs.splice(i, 1); }); tuPeople = []; tuQueue = [];
  TU_STAFF.forEach(([nm, jab, g, look, x, z]) => {
    const p = makePerson(teacherModel(g, look));
    Object.assign(p, { fixed: true, kind: 'guru', putri: g === 'P', sapaan: g === 'P' ? 'Ustadzah' : 'Ustadz', name: nm, greetDay: 0 });
    seatPerson(p, TUR.x + x, TUR.z + z, 0); nameTag(p, nm, 0.38, 2.35);
    scene.add(p); npcs.push(p); tuPeople.push(p);
  });
  // murid yang sedang antre di depan loket (sesuai jenis kelamin pemain)
  const putri = isPutri(state.cls);
  [3.6, 8.6].forEach((x, i) => {
    const q = makePerson(studentModel(putri, i + 2)); q.position.set(TUR.x + x, 0, TUR.z - 2.4); q.rotation.y = Math.PI;
    if (q.bag) q.bag.visible = false;
    Object.assign(q, { fixed: true, kind: 'siswa', putri, name: (putri ? NAMES_PI : NAMES_PA)[i + 3], homeRot: Math.PI });
    scene.add(q); npcs.push(q); tuQueue.push(q);
  });
  const dd = doorsOut.find((d) => d.id === 'tu');
  enterHall('Tata Usaha & Bendahara', TUR, 16, { x: dd.x, z: dd.z + 1.5, rot: 0 }, () => {
    roomSpots = [{ ...TU_SPOTS.tu, id: 'tu-tu' }, { ...TU_SPOTS.tamu, id: 'tu-tamu' }, { ...TU_SPOTS.spp, id: 'tu-spp' }, { ...TU_SPOTS.lkms, id: 'tu-lkms' }];
    say([{ p: player, t: "Assalamu'alaikum…" }, { p: tuPeople[0], t: `Wa'alaikumussalam. Urusan surat ke kantor TU di kiri, bayar SPP atau LKMS di ruang bendahara sebelah kanan.`, e: '' }]);
  }, 'room');
}
// maju ke loket setelah murid di depan selesai
function tuServe(i, then) {
  const q = tuQueue[i], x = TUR.x + [3.6, 8.6][i];
  paused = true;
  if (q && q.visible) { bubble(q, 'Terima kasih, Ustadz/ah.', 1300); setTimeout(() => { q.visible = false; }, 1300); }
  setTimeout(() => { player.position.set(x, 0, TUR.z - 2.4); player.rotation.y = Math.PI; paused = false; then(); }, q && q.visible ? 1500 : 200);
}
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
function tuAction(id) {
  if (id === 'tu-tamu') { player.position.set(TUR.x - 6.0, 0, TUR.z + 5.0); player.rotation.y = -Math.PI / 2; bubble(tuPeople[2], 'Silakan tunggu sebentar di ruang tamu.', 2200); return; }
  if (id === 'tu-tu') {
    bubble(tuPeople[2], 'Ada keperluan apa?', 1500);
    return modal(`<div class="tag">🗂️ Tata Usaha · Kepala TU Ustadz Dede</div><div class="big">Layanan administrasi</div><p class="muted">Pilih keperluanmu (simulasi)</p>`,
      [['📄 Minta surat keterangan siswa', () => { modal(`<div class="tag">🗂️ Tata Usaha</div><p>Surat keterangan siswa atas nama <b>${esc(state.nama)}</b> (kelas ${esc(state.cls)}) akan selesai besok. Jangan lupa mengucapkan terima kasih 😊</p>`, [['Jazakumullah khairan', closeModal, 'main']]); }, 'opt'],
        ['🪪 Kartu pelajar hilang', () => { modal(`<div class="tag">🗂️ Tata Usaha</div><p>Isi formulir kehilangan dan bawa pas foto. Kartu baru dicetak dalam 3 hari.</p>`, [['Baik, terima kasih', closeModal, 'main']]); }, 'opt'],
        ['Tidak jadi', closeModal, 'small']]);
  }
  if (id === 'tu-spp') return tuServe(0, () => sppDialog());
  if (id === 'tu-lkms') return tuServe(1, () => lkmsDialog());
}
function sppDialog() {
  {
    state.spp = state.spp || {};
    const bl = BULAN[new Date().getMonth()], key = new Date().getFullYear() + '-' + bl, lunas = state.spp[key];
    bubble(tuPeople[4], lunas ? 'SPP bulan ini sudah lunas.' : 'Mau bayar SPP?', 1600);
    return modal(`<div class="tag">💳 Bendahara Sekolah · Ustadz Sakti</div><div class="big">SPP ${bl}</div>
      <p>${lunas ? '✅ Sudah <b>LUNAS</b>. Terima kasih.' : 'Status: <b>belum dibayar</b>.<br><span class="muted">Ini simulasi; tidak ada uang sungguhan.</span>'}</p>`,
      lunas ? [['Tutup', closeModal, 'main']] : [['💵 Bayar SPP bulan ini', () => {
        state.spp[key] = true; addPts(3); save(); Audio.sfx('ok');
        bubble(tuPeople[4], 'Barakallahu fiik. Ini kuitansinya.', 2200);
        modal(`<div class="tag">🧾 Kuitansi</div><div class="big">LUNAS</div><p>Telah diterima pembayaran SPP bulan <b>${bl}</b> dari <b>${esc(state.nama)}</b> (${esc(state.cls)}).</p><p class="muted">Simpan kuitansi dengan baik. +3 ⭐ karena tertib administrasi.</p>`, [['Jazakumullah khairan', closeModal, 'main']]);
      }, 'main'], ['Nanti saja', closeModal, 'small']]);
  }
}
function lkmsDialog() {
  bubble(tuPeople[5], 'Ada yang bisa dibantu?', 1600);
  modal(`<div class="tag">💰 Bendahara LKMS · Ustadzah Sakinah</div><div class="big">Layanan LKMS</div><p>Pembayaran dan tabungan melalui LKMS dilayani di loket ini. Simpan bukti transaksi dengan baik.</p><p class="muted">Simulasi, tidak ada uang sungguhan.</p>`,
    [['💵 Menabung (simulasi)', () => { addPts(2); save(); Audio.sfx('ok'); bubble(tuPeople[5], 'Barakallahu fiik, semoga berkah.', 2000); modal(`<div class="tag">🧾 Bukti setoran LKMS</div><p>Setoran tabungan atas nama <b>${esc(state.nama)}</b> (${esc(state.cls)}) diterima. +2 ⭐ karena rajin menabung.</p>`, [['Jazakillah khairan, Ustadzah', closeModal, 'main']]); }, 'main'], ['Jazakillah khairan, Ustadzah', closeModal, 'small']]);
}
// ---------- Masjid: masuk & jelajahi bagian dalam ----------
const MW = { spawnPA: [-11, -2], spawnPI: [-11, 8.5] };
{
  // dinding & tabir sebagai pembatas saat berjalan di dalam masjid
  [[-14.2, -12, -13.8, 12], [13.8, -12, 14.2, 12], [-14, -12.2, 14, -11.8], [-14, 11.8, 14, 12.2], [-14, 2.0, 14, 2.4], [-1.6, -12, 1.6, -11.3], [2.4, -11.4, 4, -9.8]]
    .forEach(([x1, z1, x2, z2]) => colliders.push({ x1: MSJ.x + x1, z1: MSJ.z + z1, x2: MSJ.x + x2, z2: MSJ.z + z2 }));
  [[11.5, -10.6], [11.5, 10.4]].forEach(([x, z]) => {             // rak mushaf
    mbox(x, 0.7, z, 2.4, 1.4, 0.6, 0x8a5a2b); for (let i = 0; i < 8; i++) mbox(x - 1 + i * 0.28, 0.95, z + 0.05, 0.2, 0.4, 0.4, [0x2f6b4a, 0x8a3b5c, 0x3b5e9e][i % 3]);
    colliders.push({ x1: MSJ.x + x - 1.3, z1: MSJ.z + z - 0.4, x2: MSJ.x + x + 1.3, z2: MSJ.z + z + 0.4 });
  });
}
const MW_SPOTS = {
  PA: { dhuha: spot(MSJ, 0, -5, ms), ngaji: spot(MSJ, 11.5, -9, ms), exit: spot(MSJ, -12.6, -2, ms) },
  PI: { dhuha: spot(MSJ, 0, 6.5, ms), ngaji: spot(MSJ, 11.5, 9, ms), exit: spot(MSJ, -12.6, 8.5, ms) },
};
function enterMasjidWalk() {
  jamaah.forEach((p) => ms.remove(p)); jamaah = []; if (imam) { ms.remove(imam); imam = null; }
  const me = isPutri(state.cls), sd = me ? 'PI' : 'PA', sp = me ? MW.spawnPI : MW.spawnPA;
  sideJamaah.forEach((p) => ms.remove(p)); sideJamaah = [];
  const z0 = me ? 5.6 : -6.4;
  [[-6, 0], [-3.5, 1.6], [5, 0.8], [7, 2.2]].forEach(([x, dz], i) => {
    const m = makePerson(me ? { putri: true, shirt: 0xffffff, bottom: 0xffffff, hijab: 0xffffff, skin: SKINS[i % 4] } : { shirt: 0xffffff, bottom: 0x6d6f73, peci: 0xffffff, tie: false, skin: SKINS[i % 4] });
    m.position.set(x, 0, z0 + dz); m.rotation.y = Math.PI; m.base = m.position.clone(); m.baseRot = Math.PI; m.cyc = i * 1.7; ms.add(m); sideJamaah.push(m);
  });
  savedObj = savedObj || objective;
  const md = doorsOut.find((d) => d.id === (me ? 'masjidPI' : 'masjidPA'));
  fade('Masuk masjid…', 700, () => {
    zone = 'masjidin'; interior = { origin: MSJ, D: 24, out: { x: md.x, z: md.z + 2, rot: 0 } };
    player.base = null; player.position.set(MSJ.x + sp[0], 0, MSJ.z + sp[1]); player.rotation.y = Math.PI / 2;
    camera.position.copy(intOff()).add(player.position);
    roomSpots = [{ ...MW_SPOTS[sd].dhuha, id: 'm-dhuha' }, { ...MW_SPOTS[sd].ngaji, id: 'm-ngaji' }, { ...MW_SPOTS[sd].exit, id: 'm-exit' }];
    lastTrig = computeHit(); paused = false; hud();
    toast('🕌 Lingkaran kuning: Dhuha · Mengaji · Keluar');
  });
}
function roomAction(id) {
  if (id === 'wudhu') return wudhuSteps(afterWudhuDone);
  if (id.startsWith('toilet-')) return toiletAction(id);
  if (id === 'keps-tamu') return kepsTamu();
  if (id.startsWith('tu-')) return tuAction(id);
  if (id === 'uks-petugas') return uksPetugas();
  if (id === 'uks-ranjang') return uksRest();
  if (id === 'lab-pc') { player.position.set(LABR.x + LAB_FREE.x, 0, LABR.z + LAB_FREE.z); player.rotation.y = Math.PI; return openLab(); }
  if (id === 'm-exit') { paused = true; sideJamaah.forEach((p) => ms.remove(p)); sideJamaah = []; fade('Keluar masjid…', 600, () => { goOutside(interior.out.x, interior.out.z, 0); restoreObjective(); }); return; }
  if (id === 'm-dhuha' || id === 'm-ngaji') {
    if (!hasWudhu) return modal(`<div class="tag">🕌 Masjid</div><div class="big">Berwudhu dulu, ya</div><p>Sebelum ${id === 'm-dhuha' ? 'sholat' : 'memegang mushaf'}, berwudhu di tempat wudhu.</p>`,
      [['Ke tempat wudhu', () => { closeModal(); paused = true; sideJamaah.forEach((p) => ms.remove(p)); sideJamaah = []; fade('Keluar masjid…', 600, () => { goOutside(interior.out.x, interior.out.z, 0); goWudhuFor(id === 'm-dhuha' ? 'Dhuha' : 'mengaji'); }); }, 'main'], ['Nanti', closeModal, 'small']]);
    paused = true; return id === 'm-dhuha' ? dhuhaScene() : mengajiScene();
  }
}

// ---------- Tempat wudhu & toilet (bisa dimasuki kapan saja) ----------
const WDR = new THREE.Vector3(820, 0, 120), TLR = new THREE.Vector3(820, 0, -120);
const wdr = makeHall(WDR, 18, 12, 0xdfeef6, '#d3e6f0', '#c4dbe8');
const WD_SPOTS = {};
{
  const { add } = wdr, tag = (t, x, y, z, sz = 0.45) => { const l = label(t, 0, 0, 0, sz); scene.remove(l); l.position.set(x, y, z); wdr.g.add(l); };
  add(0, 0.45, -5.2, 16, 0.9, 1.2, 0xbfcbd3, true);                         // bak/talang wudhu
  add(0, 0.92, -5.2, 16, 0.06, 1.0, 0x9ec7e0);                              // air
  for (let i = 0; i < 7; i++) {
    const x = -7.2 + i * 2.4;
    add(x, 1.75, -5.7, 0.12, 0.5, 0.12, 0xc0c6cc); add(x, 1.95, -5.45, 0.1, 0.1, 0.5, 0xc0c6cc);   // keran
    add(x, 1.4, -5.25, 0.05, 0.8, 0.05, 0x7fc4ea);                          // pancuran air
    add(x, 0.25, -3.9, 0.7, 0.5, 0.7, 0x8a9aa6, true);                      // bangku kecil
  }
  add(0, 2.9, -5.9, 8, 0.9, 0.05, 0xffffff); tag('Hemat air · Basuh 3 kali · Doa sesudah wudhu', 0, 2.95, -5.8, 0.3);
  add(-7.5, 0.04, 2, 2.6, 0.03, 4, 0x6b8f71); add(7.5, 0.04, 2, 2.6, 0.03, 4, 0x6b8f71);   // keset
  tag('Tempat Wudhu', 0, 3.4, 5.6, 0.5);
  WD_SPOTS.wudhu = spot(WDR, 0, -3.0, wdr.g);
}
function enterWudhuRoom() {
  const id = isPutri(state.cls) ? 'wudhuPI' : 'wudhuPA', dd = doorsOut.find((d) => d.id === id), s = id === 'wudhuPA' ? 1 : -1;
  enterHall(`Tempat Wudhu ${side()}`, WDR, 12, { x: dd.x + s * 1.2, z: dd.z, rot: s * Math.PI / 2 }, () => {
    roomSpots = [{ ...WD_SPOTS.wudhu, id: 'wudhu' }];
    toast(pendingWudhu ? `Berwudhu di keran (lingkaran kuning) sebelum ${pendingWudhu.sholat === 'mengaji' ? 'mengaji' : 'sholat ' + pendingWudhu.sholat}` : 'Tempat wudhu · berwudhu di keran (lingkaran kuning)');
  }, 'room');
}
const tlr = makeHall(TLR, 16, 12, 0xeef0f5, '#e6e9ef', '#d9dee6');
const TL_SPOTS = {};
{
  const { add } = tlr, H = 2.6, tag = (t, x, y, z, sz = 0.42) => { const l = label(t, 0, 0, 0, sz); scene.remove(l); l.position.set(x, y, z); tlr.g.add(l); };
  // tiga bilik di belakang, berpintu
  [-5, 0, 5].forEach((x, i) => {
    add(x - 2.4, H / 2, -3.7, 0.12, H, 4.6, 0x9aa7b4, true); if (i === 2) add(x + 2.4, H / 2, -3.7, 0.12, H, 4.6, 0x9aa7b4, true);
    add(x - 1.45, H / 2, -1.4, 1.8, H, 0.12, 0x9aa7b4, true); add(x + 1.45, H / 2, -1.4, 1.8, H, 0.12, 0x9aa7b4, true);
    addDoor(tlr.g, x - 0.55, -1.4, 1.1, 2.2, 1, 0x6f8fb0);
    add(x, 0.3, -5.0, 0.9, 0.6, 1.2, 0xffffff, true);                       // kloset jongkok/duduk
    add(x + 1.6, 0.5, -4.8, 0.8, 1.0, 0.8, 0x7fc4ea); add(x + 1.6, 0.1, -3.9, 0.35, 0.2, 0.35, 0x3b7dd8);   // bak air & gayung
    tag(`Bilik ${i + 1}`, x, 2.9, -1.3, 0.34);
  });
  add(-7.6, 0.85, 3, 0.8, 0.1, 3.6, 0xffffff, true); add(-7.6, 0.45, 3, 0.7, 0.8, 3.4, 0xcfd6dd, true);   // wastafel
  add(-7.95, 1.8, 3, 0.05, 1.0, 3.2, 0xbfe3f5);                             // cermin
  [2, 3, 4].forEach((z) => add(-7.6, 1.1, z, 0.08, 0.3, 0.08, 0xc0c6cc));
  tag('Masuk dengan kaki kiri · keluar dengan kaki kanan', 2, 3.3, 5.6, 0.36);
  TL_SPOTS.bilik = spot(TLR, 0, 0.2, tlr.g); TL_SPOTS.cuci = spot(TLR, -6.4, 3, tlr.g);
}
function enterToilet() {
  const id = isPutri(state.cls) ? 'toiletPI' : 'toiletPA', dd = doorsOut.find((d) => d.id === id);
  enterHall(`Toilet ${side()}`, TLR, 12, { x: dd.x, z: dd.z - 1.2, rot: Math.PI }, () => {
    roomSpots = [{ ...TL_SPOTS.bilik, id: 'toilet-bilik' }, { ...TL_SPOTS.cuci, id: 'toilet-cuci' }];
    toast('Bilik toilet di belakang · wastafel di kiri');
  }, 'room');
}
const DOA_WC = {
  masuk: ['اَللّٰهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', "Allaahumma innii a'uudzu bika minal khubutsi wal khabaa-its", 'Ya Allah, aku berlindung kepada-Mu dari setan laki-laki dan setan perempuan.'],
  keluar: ['غُفْرَانَكَ', 'Ghufraanaka', 'Aku memohon ampunan-Mu.'],
};
function toiletAction(id) {
  if (id === 'toilet-cuci') { Audio.sfx('greet'); playAnim(player, 'suap', 0.8); return toast('🧼 Mencuci tangan dengan sabun. Bersih itu sebagian dari iman'); }
  modal(`<div class="tag">🚻 Toilet · adab masuk</div>${doaBox(DOA_WC.masuk, 'Doa masuk toilet (dibaca sebelum masuk)')}<p class="muted">Masuk dengan <b>kaki kiri</b>. Jangan berbicara di dalam toilet.</p>`,
    [['🦶 Masuk dengan kaki kiri', () => {
      closeModal(); paused = true;
      fade('… (di dalam bilik)', 1600, () => {
        modal(`<div class="tag">🚻 Toilet · adab keluar</div><p>Siram hingga bersih dan bersuci dengan air.</p>${doaBox(DOA_WC.keluar, 'Doa keluar toilet')}<p class="muted">Keluar dengan <b>kaki kanan</b>, lalu cuci tangan.</p>`,
          [['🦶 Keluar dengan kaki kanan (+2)', () => { closeModal(); addPts(2); toast('+2 ⭐ Adab ke toilet'); hasWudhu = false; }, 'main']]);
      });
    }, 'main'], ['Tidak jadi', closeModal, 'small']]);
}

// ---------- Ustadz Esa: saat istirahat & waktu santai berkeliling di sekitar lapangan ----------
const esaOut = makePerson(teacherModel('L', 3));
Object.assign(esaOut, { fixed: true, kind: 'guru', putri: false, sapaan: 'Ustadz', name: teacherInfo(ESA).p, greetDay: 0, homeRot: 0, visible: false });
esaOut.position.set(-18, 0, -38); scene.add(esaOut); npcs.push(esaOut);
nameTag(esaOut, `${teacherInfo(ESA).p} · piket lapangan`, 0.46);
const ESA_PATH = [[-20, -38], [20, -38], [26, -50], [20, -68.5], [-20, -68.5], [-26, -50]];
let esaI = 0, esaWait = 0;
function updateEsa(dt) {
  const out = ['istirahat1', 'santai', 'pulang'].includes(phase) && zone === 'luar';
  if (esaOut.visible !== out) {
    esaOut.visible = out;
    const inRoom = ruangL.byName && ruangL.byName[ESA]; if (inRoom) inRoom.visible = !['istirahat1', 'santai', 'pulang'].includes(phase);
  }
  if (!out || paused || esaOut.anim) return;
  if (esaWait > 0) { esaWait -= dt; moveTo(esaOut, esaOut.position.x, esaOut.position.z, 0, dt); return; }
  const [x, z] = ESA_PATH[esaI];
  if (bodyBlocked(esaOut, esaOut.position.x + Math.sign(x - esaOut.position.x) * 0.3, esaOut.position.z + Math.sign(z - esaOut.position.z) * 0.3)) return;
  if (moveTo(esaOut, x, z, 2.4, dt) < 0.3) { esaI = (esaI + 1) % ESA_PATH.length; esaWait = 1.5 + Math.random() * 2; }
}
