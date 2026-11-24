
// =====================================================================
//  UPACARA BENDERA HARI SENIN & ADEGAN TERLAMBAT
// =====================================================================
let upacaraDone = false, lateDone = false, gateClosed = false, cerePeople = [];
// daun gerbang (tertutup saat terlambat)
const gateDoors = new THREE.Group();
[-3.1, 3.1].forEach((x) => { const d = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, 0.15), mat(0x2e4b80)); d.position.set(x, 1.1, 56); gateDoors.add(d);
  for (let i = 0; i < 8; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.2), mat(0x1f3560)); b.position.set(x - 2.6 + i * 0.75, 1.1, 56); gateDoors.add(b); } });
gateDoors.visible = false; scene.add(gateDoors);
const gateCol = { x1: -6, z1: 55.6, x2: 6, z2: 56.4 };
function setGate(closed) { gateClosed = closed; gateDoors.visible = closed; const i = colliders.indexOf(gateCol); if (closed && i < 0) colliders.push(gateCol); if (!closed && i >= 0) colliders.splice(i, 1); }
const LATE_AT = 7 * 60 + 15;
function updateLate(dt) {
  if (phase !== 'datang' || zone !== 'luar' || lateDone) return;
  const outside = player.position.z > 56.5;
  if (outside && !paused) minutes += dt * 0.5;                 // di luar gerbang waktu berjalan lebih cepat
  if (minutes >= LATE_AT && !gateClosed && outside && !GURU) { setGate(true); toast('⏰ Pukul 07.15: gerbang sekolah sudah ditutup!'); }
  if (gateClosed && outside && Math.abs(player.position.x) < 8 && player.position.z < 60.5 && !paused) lateScene();
}
function lateScene() {
  paused = true; lateDone = true;
  const sat = npcs.find((n) => n.kind === 'satpam');
  faceTo(player, sat); bubble(sat, `Gerbang sudah ditutup, ${state.nama}. Kamu terlambat.`, 2600);
  player.position.set(9, 0, 58.5); player.rotation.y = 0;
  setTimeout(() => modal(`<div class="tag">⏰ Terlambat</div><div class="big">Hukuman sebelum masuk</div><p>Siswa yang terlambat membaca <b>dzikir pagi</b> dan <b>Al-Qur'an</b> sambil berdiri di depan gerbang.</p>`,
    [['Baik, Pak', () => lateIstighfar(0), 'main']]), 1800);
}
function lateIstighfar(n) {
  if (n >= 3) return lateDzikir();
  bubble(player, 'Astaghfirullaahal ‘azhiim', 1400);
  modal(`<div class="tag">Dzikir pagi · sambil berdiri</div><div class="doa"><span class="ar">أَسْتَغْفِرُ اللّٰهَ الْعَظِيْمَ</span><i>Astaghfirullaahal ‘azhiim</i></div><p class="muted">Dibaca 3 kali (${n}/3)</p>`,
    [[`Baca (${n + 1})`, () => lateIstighfar(n + 1), 'main']]);
}
function lateDzikir() {
  modal(`<div class="tag">Dzikir pagi · sambil berdiri</div><div class="doa"><span class="ar">أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ</span><i>Ashbahnaa wa ashbahal mulku lillaah, walhamdu lillaah, laa ilaaha illallaahu wahdahuu laa syariika lah</i><small>Artinya: Kami memasuki waktu pagi dan kerajaan hanyalah milik Allah, segala puji bagi Allah, tiada Tuhan selain Allah Yang Maha Esa, tiada sekutu bagi-Nya.</small></div>`,
    [['Lanjut: membaca Al-Qur\'an', () => lateQuran(0), 'main']]);
}
function lateQuran(i) {
  const s = SURAH.ashr;
  if (i >= s.a.length) {
    const sat = npcs.find((n) => n.kind === 'satpam');
    bubble(sat, 'Baik. Besok datang lebih pagi, ya. Silakan masuk.', 2600);
    setGate(false);
    return modal(`<div class="tag">Hukuman selesai</div><div class="big">Gerbang dibuka</div><p class="muted">Besok berangkat lebih pagi, ya. ${dayName() === 'Senin' && !upacaraDone ? 'Upacara sudah dimulai tanpa kamu.' : ''}</p>`,
      [['Masuk sekolah', () => { closeModal(); upacaraDone = true; minutes = Math.max(minutes, 7 * 60 + 40); setObjective(`Masuk ke kelas <b>${state.cls}</b> (Gedung ${side()})`, classDoors[state.cls], knockClass); }, 'main']]);
  }
  bubble(player, s.a[i][1], 2200);
  modal(`<div class="tag">Membaca Al-Qur'an sambil berdiri · Surah ${s.n}</div>${i === 0 ? '<div class="doa"><span class="ar">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</span></div>' : ''}<div class="doa"><span class="ar">${s.a[i][0]}</span><i>${s.a[i][1]}</i></div>`,
    [[i < s.a.length - 1 ? 'Ayat berikutnya ▶' : 'Selesai ✓', () => lateQuran(i + 1), 'main']]);
}
// ---------- upacara ----------
function upacaraObjective() { setObjective('📣 Hari Senin: berbaris di <b>Lapangan Upacara</b> pukul 07.20', { x: -20, z: 21 }, upacaraScene); }
const upCam = new THREE.Vector3(), upLook = new THREE.Vector3();
function upacaraScene(opt) {
  opt = opt && opt.title ? opt : {};                                  // opt: { title, amanat[3], after } untuk upacara hari nasional
  const judul = opt.title || 'Upacara Bendera Hari Senin', AM = opt.amanat || ['Anak-anakku sekalian, jagalah sholat lima waktu tepat pada waktunya, berjamaah di masjid.', 'Hormati guru dan orang tua. Datanglah tepat waktu, karena disiplin adalah awal keberhasilan.', "Jaga adab: putra dan putri saling menjaga batas, jujur, dan rajin membaca Al-Qur'an. Barakallahu fiikum."];
  paused = true;
  fade(judul, 900, () => {
    zone = 'upacara'; hud(); minutes = 7 * 60 + 20;
    walkers.forEach((n) => { n.visible = false; n.path = null; });   // semua warga sekolah ikut upacara: tidak ada yang berkeliaran
    cerePeople.forEach((p) => scene.remove(p)); cerePeople = [];
    const add = (m, x, z, r) => { const g = makePerson(m); g.position.set(x, 0, z); g.rotation.y = r; scene.add(g); cerePeople.push(g); return g; };
    const me = meP();
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      if (!me && r === 1 && c === 3) continue;
      add(studentModel(false, r * 7 + c), -30 + c * 3, 21 + r * 2, Math.PI);
    }
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      if (me && r === 1 && c === 3) continue;
      add(studentModel(true, r * 7 + c), 12 + c * 3, 21 + r * 2, Math.PI);
    }
    for (let i = 0; i < 6; i++) add(teacherModel(i % 2 ? 'P' : 'L', i), 36, 18 + i * 1.6, -Math.PI / 2);
    const pembina = add(teacherModel('L', 0), 0, 17.2, 0); pembina.position.y = 0.62; nameTag(pembina, `${KEPS_STAFF[0].p} · Pembina Upacara`, 0.5);
    const pemimpin = add(studentModel(false, 3), 0, 19.6, Math.PI);
    const pas = [-1.2, 0, 1.2].map((dx) => add({ shirt: 0xffffff, bottom: 0xffffff, tie: false }, -9 + dx, 18.4, Math.PI));
    player.position.set(me ? 21 : -21, 0, 23); player.rotation.y = Math.PI;
    const pt = innerWidth < innerHeight; upCam.set(0, pt ? 72 : 30, pt ? 44 : 46); upLook.set(0, 0, pt ? 22 : 21);
    camera.position.copy(upCam); camera.lookAt(upLook);
    flag.position.y = 1.2;
    const amanat = (t) => { caption(`Amanat ${KEPS_STAFF[0].p} (Pembina): "${t}"`); bubble(pembina, t, 4200); };
    cerePeople.forEach((p) => p.bag && (p.bag.visible = false));
    if (player.bag && player.bag.visible) { room.userData.bag.material = player.bag.material; room.userData.bag.visible = true; setBags(false); }   // tas sudah ditaruh di kelas sebelum upacara
    const hormat = (on) => [player, ...cerePeople.filter((p) => p !== pembina)].forEach((p) => { p.armR.rotation.x = on ? -2.5 : 0; p.armR.rotation.z = on ? 0.9 : 0; });
    const steps = [
      [0, () => caption(`${judul} · barisan disiapkan`)],
      [2500, () => { caption('Pemimpin upacara: "Kepada Pembina Upacara, hormat… grak!"'); bubble(pemimpin, 'Hormat… grak!', 1800); hormat(true); }],
      [4500, () => hormat(false)],
      [5500, () => { caption('Pengibaran bendera Merah Putih diiringi lagu Indonesia Raya'); hormat(true); flagRise = 0.001; }],
      [15500, () => { hormat(false); caption('Mengheningkan cipta'); cerePeople.forEach((p) => (p.rotation.x = 0.15)); player.rotation.x = 0.15; }],
      [18500, () => { cerePeople.forEach((p) => (p.rotation.x = 0)); player.rotation.x = 0; caption('Pembacaan teks Pancasila, diikuti seluruh peserta'); bubble(pembina, 'Pancasila… Satu: Ketuhanan Yang Maha Esa…', 2600); }],
      [21500, () => amanat(AM[0])],
      [26000, () => amanat(AM[1])],
      [30500, () => amanat(AM[2])],
      [35500, () => { caption('Doa'); bubble(pembina, 'Mari berdoa menurut agama Islam… Aamiin.', 2200); }],
      [38500, () => { caption('Upacara selesai. Barisan dibubarkan.'); bubble(pemimpin, 'Bubar… jalan!', 1600); }],
      [41000, () => {
        if (opt.after) { caption(''); cerePeople.forEach((p) => scene.remove(p)); cerePeople = []; flagRise = 0; flag.position.y = 9.3; if (!GURU) { addPts(8); toast('+8 ⭐ Mengikuti upacara dengan tertib'); } zone = 'acara'; return opt.after(); }
        walkers.forEach((n) => { n.visible = true; });
        caption(''); cerePeople.forEach((p) => scene.remove(p)); cerePeople = []; upacaraDone = true; flagRise = 0; flag.position.y = 9.3;
        addPts(8); toast('+8 ⭐ Mengikuti upacara dengan tertib');
        zone = 'luar'; paused = false; minutes = 8 * 60; camera.position.copy(CAM_OFF).add(player.position);
        setObjective(`Masuk ke kelas <b>${state.cls}</b> (Gedung ${side()})`, classDoors[state.cls], knockClass);
      }],
    ];
    steps.forEach(([t, fn]) => setTimeout(fn, t + 500));
  });
}
let flagRise = 0;
function updateUpacara(dt) {
  if (zone !== 'upacara') return;
  if (flagRise > 0 && flag.position.y < 9.3) flag.position.y = Math.min(9.3, flag.position.y + dt * 0.85);
  camera.position.lerp(upCam, 1 - Math.pow(0.01, dt)); camera.lookAt(upLook);
}
