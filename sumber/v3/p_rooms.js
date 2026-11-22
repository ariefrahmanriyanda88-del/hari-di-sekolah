
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
// ---------- Kepala Sekolah & TU ----------
const keps = makeHall(KEPS, 20, 12, 0xf3e6cf, '#e8dcc4', '#dccfb4');
const KEPS_SPOTS = {};
{
  const { add } = keps;
  add(-4, 0.45, -3, 3.4, 0.9, 1.4, 0x6b4a2b, true); add(-4, 0.93, -3, 3.5, 0.07, 1.5, 0x8a5a2b);                          // meja kepala sekolah
  add(-4, 0.9, -4.3, 0.9, 1.6, 0.15, 0x2b2b2b);
  add(-8.2, 0.4, 1.5, 1.2, 0.8, 3, 0x3b5e9e, true); add(-6, 0.3, 1.5, 1.4, 0.5, 0.9, 0x9b6b3c, true);                     // sofa tamu
  add(-1.5, 1.2, -5.6, 2.6, 2.4, 0.6, 0x8a5a2b, true); [0, 1].forEach((r) => [0, 1, 2].forEach((c) => add(-2.3 + c * 0.8, 1.1 + r * 0.7, -5.25, 0.25, 0.45, 0.2, 0xf5c542)));   // lemari piala
  add(-7, 2.0, -5.9, 1.4, 0.9, 0.04, 0xe53935); add(-7, 1.55, -5.9, 1.4, 0.9, 0.04, 0xffffff);                              // bendera
  add(5.5, 0.55, -1, 6, 1.1, 1, 0xb98652, true);                                                                              // loket TU
  add(5.5, 2.3, -5.85, 4, 1, 0.06, 0x2f6b4a);
  const s = label('Ruang Kepala Sekolah', 0, 0, 0, 0.55); scene.remove(s); s.position.set(-4, 3.4, -5.7); keps.g.add(s);
  const s2 = label('Tata Usaha (TU)', 0, 0, 0, 0.55); scene.remove(s2); s2.position.set(5.5, 3.4, -5.7); keps.g.add(s2);
}
let kepsPeople = [];
function enterKepsek() {
  kepsPeople.forEach((p) => { scene.remove(p); const i = npcs.indexOf(p); if (i >= 0) npcs.splice(i, 1); }); kepsPeople = [];
  const k = makePerson(teacherModel('L', 0)); k.position.set(KEPS.x - 4, 0, KEPS.z - 4.4); k.rotation.y = 0;
  Object.assign(k, { fixed: true, kind: 'guru', putri: false, sapaan: 'Ustadz', name: 'Kepala Sekolah', greetDay: 0, homeRot: 0 }); nameTag(k, 'Kepala Sekolah', 0.5);
  const tu = makePerson(teacherModel('P', 2)); tu.position.set(KEPS.x + 5.5, 0, KEPS.z - 2.2); tu.rotation.y = 0;
  Object.assign(tu, { fixed: true, kind: 'guru', putri: true, sapaan: 'Ustadzah', name: 'Petugas TU', greetDay: 0, homeRot: 0 }); nameTag(tu, 'Petugas TU', 0.5);
  [k, tu].forEach((p) => { scene.add(p); npcs.push(p); kepsPeople.push(p); });
  const dd = doorsOut.find((d) => d.id === 'kepsek');
  enterHall('Kepala Sekolah & TU', KEPS, 12, { x: dd.x, z: dd.z + 1.5, rot: 0 }, () => {
    roomSpots = [];
    bubble(player, "Assalamu'alaikum… permisi.", 1600);
    setTimeout(() => bubble(k, `Wa'alaikumussalam. Masuk, ${state.nama}. Ada yang bisa dibantu?`, 2800), 900);
    toast('Dekati lalu ketuk 💬 Sapa');
  }, 'room');
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
