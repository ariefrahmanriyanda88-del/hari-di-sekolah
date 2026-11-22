
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
// ---------- Kantor Kepala Sekolah & Wakil Kepala Sekolah ----------
//  depan tengah: ruang tamu · kiri belakang: ruang kepala sekolah (tertutup, berpintu)
//  kanan: ruang waka (ustadz & ustadzah dipisah sekat)
const KEPS_STAFF = [
  { n: 'Rusli Supriatna, S.Pd.', p: 'Ustadz Rusli', j: 'Kepala Sekolah', g: 'L', x: -8.5, z: -6.2, look: 1 },
  { n: 'Mudiar Efendi, S.Pd.I.', p: 'Ustadz Mudiar', j: "Waka Ulumus Syar'i", g: 'L', x: 7.0, z: -6.4, look: 2 },
  { n: 'Rahmat Doni, M.Sos., Gr.', p: 'Ustadz Rahmat', j: 'Waka Humas', g: 'L', x: 7.0, z: -2.6, look: 3 },
  { n: 'Hendri Dunan, S.Pd', p: 'Ustadz Hendri', j: 'Waka Sarpras', g: 'L', x: 7.0, z: 1.2, look: 4 },
  { n: 'Rustiyani', p: 'Ustadzah Rustiyani', j: 'Waka Kurikulum', g: 'P', x: 11.4, z: -6.4, look: 1 },
  { n: 'Retmi Hartati, S.Sos', p: 'Ustadzah Retmi', j: 'Waka Kesiswaan', g: 'P', x: 11.4, z: -2.6, look: 3 },
];
const keps = makeHall(KEPS, 26, 16, 0xf3e6cf, '#e8dcc4', '#dccfb4');
{
  const { add } = keps, H = 2.8, wl = 0xe9dcc2, tag = (t, x, y, z, sz = 0.5) => { const l = label(t, 0, 0, 0, sz); scene.remove(l); l.position.set(x, y, z); keps.g.add(l); };
  // --- sekat ruang kepala sekolah (x -13..-4, z -8..-1), pintu di sisi depan ---
  add(-11, H / 2, -1, 4.2, H, 0.2, wl, true); add(-4.9, H / 2, -1, 1.8, H, 0.2, wl, true);   // dinding depan + celah pintu (x -8.9..-5.8)
  add(-4, H / 2, -4.5, 0.2, H, 7.2, wl, true);                                               // dinding kanan
  add(-7.35, 1.05, -1, 1.5, 2.1, 0.08, 0x9b6b3c);                                            // daun pintu terbuka
  keps.g.children[keps.g.children.length - 1].position.x = -8.7; keps.g.children[keps.g.children.length - 1].rotation.y = Math.PI / 2.4;
  add(-8.5, 0.45, -4.8, 3.4, 0.9, 1.4, 0x6b4a2b, true); add(-8.5, 0.93, -4.8, 3.5, 0.07, 1.5, 0x8a5a2b);   // meja kepala sekolah
  add(-8.5, 0.98, -4.3, 1.2, 0.06, 0.3, 0xf5f0e0); add(-8.5, 1.15, -4.3, 1.1, 0.25, 0.04, 0x2f6b4a);       // papan nama meja
  add(-8.5, 0.9, -7.3, 0.9, 1.6, 0.15, 0x2b2b2b);                                                         // kursi
  add(-12.2, 1.2, -5.2, 0.6, 2.4, 2.8, 0x8a5a2b, true); [0, 1, 2].forEach((r) => [0, 1, 2].forEach((c) => add(-11.85, 0.6 + r * 0.7, -6.2 + c * 0.9, 0.2, 0.45, 0.25, 0xf5c542)));   // lemari piala
  add(-6, 2.1, -7.85, 1.4, 0.45, 0.04, 0xe53935); add(-6, 1.65, -7.85, 1.4, 0.45, 0.04, 0xffffff);       // bendera
  add(-10.5, 2.0, -7.85, 1.4, 1.0, 0.04, 0xf3efe2);                                                       // bingkai
  add(-10.2, 0.35, -2.4, 2.2, 0.7, 0.9, 0x3b5e9e, true);                                                  // kursi tamu kecil di dalam
  tag('Ruang Kepala Sekolah', -8.5, 3.3, -1.1);
  // --- ruang tamu (depan, terpisah dari ruang kepala sekolah) ---
  add(-10.5, 0.4, 4.6, 1.1, 0.8, 3.4, 0x2f6b4a, true); add(-7, 0.4, 2.2, 3.4, 0.8, 1.1, 0x2f6b4a, true);   // sofa L
  add(-7, 0.25, 4.6, 2.4, 0.5, 1.3, 0x9b6b3c, true); add(-7, 0.53, 4.6, 2.5, 0.05, 1.4, 0xc9a26b);       // meja tamu
  add(-7.6, 0.62, 4.4, 0.3, 0.12, 0.3, 0xffffff); add(-6.5, 0.62, 4.8, 0.3, 0.12, 0.3, 0xffffff);       // gelas
  add(-12.2, 0.6, 7.2, 0.7, 1.2, 0.7, 0x7a4a2a); add(-12.2, 1.6, 7.2, 1.1, 1.0, 1.1, 0x3f8f44);         // tanaman
  add(-3.2, 0.55, 6.6, 2.2, 1.1, 0.8, 0xb98652, true);                                                    // meja penerima tamu
  tag('Ruang Tamu', -8.5, 2.6, 7.2);
  // --- ruang wakil kepala sekolah (x 3..13), pintu di depan ---
  add(3, H / 2, -2.5, 0.2, H, 11, wl, true); add(3, H / 2, 7.2, 0.2, H, 1.6, wl, true);                  // sekat kiri, celah pintu z 3..6.4
  add(8, 0.8, -2.2, 0.12, 1.6, 11.6, 0xd9cdb3, true);                                                     // sekat (tabir) ustadz | ustadzah
  KEPS_STAFF.slice(1).forEach((w) => {
    const dx = -1, mx = w.x + dx * 1.2;
    add(mx, 0.4, w.z, 1.0, 0.8, 1.8, 0x8a5a2b, true); add(mx, 0.83, w.z, 1.1, 0.06, 1.9, 0xa8774a);       // meja
    add(mx, 0.95, w.z, 0.3, 0.2, 0.9, 0xf5f0e0);                                                          // papan nama
    tag(w.j, mx, 1.45, w.z, 0.3);
    add(mx + dx * 0.2, 1.1, w.z - 0.55, 0.06, 0.35, 0.5, 0x333a40);                                       // monitor
  });
  add(12.8, 1.3, 5.5, 0.3, 2.6, 2.4, 0x8a5a2b, true);                                                     // lemari arsip
  add(5.5, 2.2, -7.85, 3.6, 1.4, 0.05, 0xffffff);                                                         // papan struktur
  tag('Ruang Wakil Kepala Sekolah', 8.5, 3.3, 7.4, 0.48);
  tag('Struktur Sekolah', 5.5, 3.2, -7.7, 0.4);
}
let kepsPeople = [];
function enterKepsek() {
  kepsPeople.forEach((p) => { scene.remove(p); const i = npcs.indexOf(p); if (i >= 0) npcs.splice(i, 1); }); kepsPeople = [];
  KEPS_STAFF.forEach((w, i) => {
    const p = makePerson(teacherModel(w.g, w.look)); p.position.set(KEPS.x + w.x, 0, KEPS.z + w.z);
    const rot = i === 0 ? 0 : -Math.PI / 2;
    p.rotation.y = rot;
    Object.assign(p, { fixed: true, kind: 'guru', putri: w.g === 'P', sapaan: w.g === 'P' ? 'Ustadzah' : 'Ustadz', name: w.p, greetDay: 0, homeRot: rot });
    nameTag(p, i === 0 ? `${w.p} · ${w.j}` : w.p, 0.4);
    scene.add(p); npcs.push(p); kepsPeople.push(p);
  });
  // penerima tamu di ruang tamu
  const r = makePerson(teacherModel('L', 5)); r.position.set(KEPS.x - 3.2, 0, KEPS.z + 5.6); r.rotation.y = Math.PI;
  Object.assign(r, { fixed: true, kind: 'guru', putri: false, sapaan: 'Ustadz', name: 'Penerima Tamu', greetDay: 0, homeRot: Math.PI });
  nameTag(r, 'Penerima Tamu', 0.42); scene.add(r); npcs.push(r); kepsPeople.push(r);
  const dd = doorsOut.find((d) => d.id === 'kepsek');
  enterHall('Kantor Kepala Sekolah', KEPS, 16, { x: dd.x, z: dd.z + 1.5, rot: 0 }, () => {
    roomSpots = [{ ...KEPS_SPOTS.tamu, id: 'keps-tamu' }];
    bubble(player, "Assalamu'alaikum… permisi.", 1600);
    setTimeout(() => bubble(r, `Wa'alaikumussalam, ${state.nama}. Silakan duduk dulu di ruang tamu.`, 3000), 900);
    toast('Ruang tamu di kiri · Kepala Sekolah di belakang · Ruang Waka di kanan');
  }, 'room');
}
const KEPS_SPOTS = { tamu: spot(KEPS, -7, 3.4, keps.g) };
function kepsTamu() {
  paused = true;
  fade('Duduk di ruang tamu…', 900, () => {
    player.position.set(KEPS.x - 7, 0, KEPS.z + 3.0); player.rotation.y = Math.PI; paused = false;
    const k = kepsPeople[0];
    setTimeout(() => bubble(k, `${state.nama}, silakan masuk ke ruangan saya.`, 2600), 600);
    toast('Kepala Sekolah memanggil — masuk lewat pintu ruangannya lalu ketuk 💬 Sapa');
  });
}
// ---------- Gedung Tata Usaha, Bendahara (SPP) & LMS ----------
const TUR = new THREE.Vector3(720, 0, 120);
const tur = makeHall(TUR, 20, 12, 0xe6eef3, '#dde6ec', '#cfdbe3');
const TU_SPOTS = {};
{
  const { add } = tur, tag = (t, x, y, z, sz = 0.46) => { const l = label(t, 0, 0, 0, sz); scene.remove(l); l.position.set(x, y, z); tur.g.add(l); };
  add(0, 0.55, -2.2, 18, 1.1, 0.8, 0xb98652, true);                                   // meja loket panjang
  [-6, 0, 6].forEach((x) => add(x, 1.75, -2.2, 5.4, 1.3, 0.05, 0xbfe3f5));             // kaca loket
  [-3, 3].forEach((x) => add(x, 1.5, -2.2, 0.12, 2.0, 0.9, 0x8a9aa6));                 // sekat antarloket
  [-6, 0, 6].forEach((x) => add(x, 1.35, -3.4, 0.6, 0.4, 0.06, 0x333a40));             // monitor
  add(-8.4, 1.1, -5.6, 2.4, 2.2, 0.6, 0x8a5a2b, true); add(8.4, 1.1, -5.6, 2.4, 2.2, 0.6, 0x8a5a2b, true);   // lemari arsip
  for (let i = 0; i < 4; i++) { add(-8 + i * 1.1, 0.25, 4.4, 0.9, 0.5, 0.9, 0x3b5e9e); add(5 + i * 1.1, 0.25, 4.4, 0.9, 0.5, 0.9, 0x8a3b5c); }   // kursi tunggu putra | putri
  for (let i = 0; i < 3; i++) { add(-6, 0.04, -0.6 + i * 1.0, 1.0, 0.03, 0.08, 0xffd84d); add(6, 0.04, -0.6 + i * 1.0, 1.0, 0.03, 0.08, 0xffd84d); }
  tag('Tata Usaha', -6, 3.0, -2.3); tag('Bendahara · SPP', 0, 3.0, -2.3); tag('Admin LMS', 6, 3.0, -2.3);
  tag('Tunggu Putra', -6.4, 1.6, 4.4, 0.36); tag('Tunggu Putri', 6.6, 1.6, 4.4, 0.36);
  TU_SPOTS.tu = spot(TUR, -6, -1.0, tur.g); TU_SPOTS.spp = spot(TUR, 0, -1.0, tur.g); TU_SPOTS.lms = spot(TUR, 6, -1.0, tur.g);
}
let tuPeople = [];
const TU_STAFF = [['Petugas TU', 'P', 2, -6], ['Bendahara', 'P', 4, 0], ['Admin LMS', 'L', 1, 6]];
function enterTU() {
  tuPeople.forEach((p) => { scene.remove(p); const i = npcs.indexOf(p); if (i >= 0) npcs.splice(i, 1); }); tuPeople = [];
  TU_STAFF.forEach(([nm, g, look, x]) => {
    const p = makePerson(teacherModel(g, look)); p.position.set(TUR.x + x, 0, TUR.z - 3.4); p.rotation.y = 0;
    Object.assign(p, { fixed: true, kind: 'guru', putri: g === 'P', sapaan: g === 'P' ? 'Ustadzah' : 'Ustadz', name: nm, greetDay: 0, homeRot: 0 });
    nameTag(p, nm, 0.42); scene.add(p); npcs.push(p); tuPeople.push(p);
  });
  const dd = doorsOut.find((d) => d.id === 'tu');
  enterHall('Tata Usaha & Bendahara', TUR, 12, { x: dd.x, z: dd.z + 1.5, rot: 0 }, () => {
    roomSpots = [{ ...TU_SPOTS.tu, id: 'tu-tu' }, { ...TU_SPOTS.spp, id: 'tu-spp' }, { ...TU_SPOTS.lms, id: 'tu-lms' }];
    bubble(player, "Assalamu'alaikum…", 1500);
    setTimeout(() => bubble(tuPeople[0], `Wa'alaikumussalam. Silakan antre di loket, ${state.nama}.`, 2800), 900);
    toast('Loket: Tata Usaha · Bendahara (SPP) · Admin LMS');
  }, 'room');
}
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
function tuAction(id) {
  if (id === 'tu-tu') {
    bubble(tuPeople[0], 'Ada keperluan apa?', 1500);
    return modal(`<div class="tag">🗂️ Tata Usaha</div><div class="big">Layanan administrasi</div><p class="muted">Pilih keperluanmu (simulasi)</p>`,
      [['📄 Minta surat keterangan siswa', () => { modal(`<div class="tag">🗂️ Tata Usaha</div><p>Surat keterangan siswa atas nama <b>${esc(state.nama)}</b> (kelas ${esc(state.cls)}) akan selesai besok. Jangan lupa mengucapkan terima kasih 😊</p>`, [['Jazakumullah khairan', closeModal, 'main']]); }, 'opt'],
        ['🪪 Kartu pelajar hilang', () => { modal(`<div class="tag">🗂️ Tata Usaha</div><p>Isi formulir kehilangan dan bawa pas foto. Kartu baru dicetak dalam 3 hari.</p>`, [['Baik, terima kasih', closeModal, 'main']]); }, 'opt'],
        ['Tidak jadi', closeModal, 'small']]);
  }
  if (id === 'tu-spp') {
    state.spp = state.spp || {};
    const bl = BULAN[new Date().getMonth()], key = new Date().getFullYear() + '-' + bl, lunas = state.spp[key];
    bubble(tuPeople[1], lunas ? 'SPP bulan ini sudah lunas.' : 'Mau bayar SPP?', 1600);
    return modal(`<div class="tag">💳 Bendahara · Pembayaran bulanan</div><div class="big">SPP ${bl}</div>
      <p>${lunas ? '✅ Sudah <b>LUNAS</b>. Terima kasih.' : 'Status: <b>belum dibayar</b>.<br><span class="muted">Ini simulasi; tidak ada uang sungguhan.</span>'}</p>`,
      lunas ? [['Tutup', closeModal, 'main']] : [['💵 Bayar SPP bulan ini', () => {
        state.spp[key] = true; addPts(3); save(); Audio.sfx('ok');
        bubble(tuPeople[1], 'Barakallahu fiik. Ini kuitansinya.', 2200);
        modal(`<div class="tag">🧾 Kuitansi</div><div class="big">LUNAS</div><p>Telah diterima pembayaran SPP bulan <b>${bl}</b> dari <b>${esc(state.nama)}</b> (${esc(state.cls)}).</p><p class="muted">Simpan kuitansi dengan baik. +3 ⭐ karena tertib administrasi.</p>`, [['Jazakumullah khairan', closeModal, 'main']]);
      }, 'main'], ['Nanti saja', closeModal, 'small']]);
  }
  if (id === 'tu-lms') {
    bubble(tuPeople[2], 'Ada kendala dengan akun belajar?', 1600);
    return modal(`<div class="tag">💻 Admin LMS</div><div class="big">Akun belajar daring</div><p>Tugas dari guru di game ini masuk otomatis. Jika lupa <b>kode kelas</b>, tanyakan kepada wali kelas atau guru mapel.</p>`,
      [['🎮 Latihan di Lab Komputer', () => { closeModal(); toast('Lab Komputer ada di deretan gedung yang sama'); }, 'opt'], ['Terima kasih', closeModal, 'small']]);
  }
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
