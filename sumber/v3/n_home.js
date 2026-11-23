
// =====================================================================
//  LINGKUNGAN DI LUAR SEKOLAH: rumah warga di seberang jalan, rumah pemain,
//  adegan pagi (sarapan, pamit), berangkat jalan kaki atau naik motor
// =====================================================================
plane(-200, 72, 200, 75, 0xa9a9a9, 0.035);                       // trotoar seberang
const HOME = { x: -30, z: 84 };
function house(x, z, wall, roof, name, w = 10, d = 8) {
  const b = building(x - w / 2, z - d / 2, x + w / 2, z + d / 2, 3.6, wall, roof);
  const r = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.6, 3, 4), mat(roof)); r.rotation.y = Math.PI / 4; r.scale.set(w / Math.hypot(w, d) * 1.42, 1, d / Math.hypot(w, d) * 1.42); r.position.set(x, 5.4, z); r.castShadow = true; scene.add(r);
  door(x, z - d / 2 - 0.05, 'N', 0x7a4f2b); windowBand(b, 'N');
  plane(x - w / 2 - 1, z - d / 2 - 3, x + w / 2 + 1, z - d / 2, 0x8fcf7a, 0.04);   // halaman
  for (let i = 0; i <= w + 2; i += 1.2) box(x - w / 2 - 1 + i, 0.45, z - d / 2 - 3, 0.12, 0.9, 0.12, 0xffffff, false);
  if (name) label(name, x, 7.6, z, 1.0);
  return b;
}
[[-62, 0xf3e0c8, 0xb0503a], [-46, 0xdde8f3, 0x3b5e9e], [-14, 0xf6dde4, 0x8a3b5c], [14, 0xe8f0d8, 0x3a6e4a], [30, 0xf3e3c3, 0xc98a5a], [46, 0xdde8f3, 0x6b7079], [62, 0xf6dcc4, 0xb0503a]]
  .forEach(([x, w, r]) => house(x, 84, w, r, 'Rumah warga'));
const myHouse = house(HOME.x, HOME.z, 0xfff1d6, 0x2f8a5c, '');
const homeLabel = label('Rumah', HOME.x, 7.6, HOME.z, 1.1, true);
{
  const w = building(76, 78, 84, 86, 3.2, 0xffe3a3, 0xe0623e); door(80, 77.95, 'N'); label('Warung', 80, 6, 82, 1.0);
  for (let x = -90; x < 95; x += 16) { box(x, 2.5, 74, 0.18, 5, 0.18, 0x555b63); const l = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1b8 })); l.position.set(x, 5.1, 74); scene.add(l); }
  [[-54, 92], [-22, 94], [6, 93], [38, 94], [70, 92], [-80, 86], [92, 88]].forEach(([x, z]) => tree(x, z));
  doorOut('rumah', HOME.x, HOME.z - 6, 1.8);
  places.push({ n: 'Rumah', x: HOME.x, z: HOME.z - 6, r: 7 }, { n: 'Jalan raya', x: 0, z: 66, r: 8 }, { n: 'Warung', x: 80, z: 76, r: 6 });
}
// ---------- parkir motor di dalam gerbang (kiri) ----------
const PARKIR = { x1: -40, z1: 44, x2: -12, z2: 54 };
plane(PARKIR.x1, PARKIR.z1, PARKIR.x2, PARKIR.z2, 0x9a9da1, 0.045);
label('Parkir Motor', (PARKIR.x1 + PARKIR.x2) / 2, 3.2, 49, 1.1);
function makeMotor(color = 0x2f4f8f) {
  const g = new THREE.Group();
  const b = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  [[0, 0.38, 0.85], [0, 0.38, -0.85]].forEach(([x, y, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.18, 16), mat(0x1a1a1a)); w.rotation.z = Math.PI / 2; w.position.set(x, y, z); g.add(w); });
  b(0.42, 0.45, 1.5, color, 0, 0.75, 0); b(0.4, 0.14, 0.75, 0x222222, 0, 1.05, -0.25); b(0.9, 0.08, 0.08, 0x333333, 0, 1.25, 0.75); b(0.12, 0.5, 0.12, 0x555555, 0, 1.0, 0.75);
  b(0.28, 0.2, 0.12, 0xfff1b8, 0, 1.0, 0.92);
  return g;
}
for (let i = 0; i < 9; i++) { const m = makeMotor([0x2f4f8f, 0x222222, 0xc0392b, 0x444444, 0x2f8a5c][i % 5]); m.position.set(-37 + i * 3, 0, 52); m.rotation.y = Math.PI; scene.add(m); }
const PARK_SLOT = { x: -37 + 9 * 3, z: 51 };
// ---------- motor & helm pemain ----------
let riding = false, myMotor = null, helmet = null;
function startRiding() {
  myMotor = makeMotor(isPutri(state.cls) ? 0xd9577a : 0x3b7dd8); myMotor.position.y = -0.55; player.add(myMotor);
  helmet = new THREE.Mesh(new THREE.SphereGeometry(0.47, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.7), mat(0xffffff)); helmet.position.set(0, 1.98, -0.02); player.add(helmet);
  riding = true; ridePose(true);
}
function ridePose(on) {
  player.position.y = on ? 0.55 : 0;
  player.legL.rotation.x = player.legR.rotation.x = on ? -1.2 : 0;
  player.armL.rotation.x = player.armR.rotation.x = on ? -1.1 : 0;
}
function parkMotor() {
  if (!riding) return;
  player.remove(myMotor); player.remove(helmet);
  myMotor.position.set(PARK_SLOT.x, 0, PARK_SLOT.z); myMotor.rotation.y = Math.PI; scene.add(myMotor);
  helmet.position.set(PARK_SLOT.x, 1.25, PARK_SLOT.z - 0.2); scene.add(helmet);
  riding = false; ridePose(false); player.position.set(PARK_SLOT.x, 0, PARK_SLOT.z - 2.2); player.rotation.y = 0;
  Audio.sfx('knock'); toast('🏍️ Motor diparkir rapi, helm disimpan');
}
function clearParkedMotor() { if (myMotor && myMotor.parent === scene) scene.remove(myMotor); if (helmet && helmet.parent === scene) scene.remove(helmet); myMotor = helmet = null; riding = false; }

// ---------- ruang makan di rumah ----------
const RUMAH = new THREE.Vector3(520, 0, 120);
const rm = makeHall(RUMAH, 16, 12, 0xf6ead2, '#e9dcc2', '#ded0b2');
{
  const { add } = rm;
  add(0, 0.75, 0, 4.4, 0.1, 2, 0xb98652, true); add(0, 0.37, 0, 0.3, 0.74, 1.2, 0x6d6f73);                                   // meja makan
  [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].forEach(([x, z]) => { add(x, 0.45, z, 0.6, 0.08, 0.6, 0x8a5a2b); add(x, 0.8, z + Math.sign(z) * 0.3, 0.6, 0.6, 0.06, 0x8a5a2b); });
  [[-1.3, -0.5], [1.3, -0.5], [-1.3, 0.5], [0, 0], [1.3, 0.5]].forEach(([x, z], i) => add(x, 0.84, z, 0.55, 0.06, 0.4, [0xfff4d6, 0xd4883a, 0xfff4d6, 0x58ad4e, 0xfff4d6][i]));
  add(-6.2, 0.5, -5, 3, 1, 1.2, 0xdde8f3, true); add(-6.2, 1.9, -5.5, 3, 1.5, 0.3, 0xbfc5cc);                                   // dapur
  add(5.8, 0.45, -4.6, 3.4, 0.9, 1.4, 0x3b7dd8, true);                                                                      // sofa
  add(0, 2.2, -5.85, 2.2, 1.3, 0.08, 0x8a5a2b); add(0, 2.2, -5.8, 1.9, 1.05, 0.05, 0x8fd3f0);                               // foto keluarga
  add(4, 2.4, -5.85, 1.2, 0.5, 0.06, 0x2f6b4a);                                                                               // kaligrafi
  const s = label('Ruang Makan', 0, 0, 0, 0.7); scene.remove(s); s.position.set(-4, 3.6, -5.7); rm.g.add(s);
}
let ayah = null, ibu = null, ibuLuar = null;
function setupFamily() {
  [ayah, ibu].forEach((p) => p && scene.remove(p));
  ayah = makePerson({ shirt: 0x6b4a2b, bottom: 0x2b2b2b, peci: 0x1a1a1a, tie: false, skin: 0xe2b48c });
  ayah.position.set(RUMAH.x - 1.3, 0, RUMAH.z - 1.3); ayah.rotation.y = 0; sitPose(ayah, true); nameTag(ayah, 'Ayah', 0.5, 2.4); scene.add(ayah);
  ibu = makePerson({ putri: true, shirt: 0x8a3b5c, bottom: 0x3a3a3a, hijab: 0xe9c9d4 });
  ibu.position.set(RUMAH.x + 1.3, 0, RUMAH.z - 1.3); ibu.rotation.y = 0; sitPose(ibu, true); nameTag(ibu, 'Ibu', 0.5, 2.4); scene.add(ibu);
  [ayah, ibu].forEach((p) => { addSpoon(p); p.eater = true; p.phase = Math.random() * 6; p.rate = 0.9; });
}
const homeCam = new THREE.Vector3(), homeLook = new THREE.Vector3();
// adegan rumah: geser gambar agar wajah Ayah & Ibu tidak tertutup jendela percakapan
function homeView(on) {
  document.body.classList.toggle('homescene', on);
  if (!on) { camera.clearViewOffset(); return; }
  const w = innerWidth, h = innerHeight;
  if (w > h) camera.setViewOffset(w, h, w * 0.24, 0, w, h);     // mendatar: keluarga di kiri, jendela di kanan
  else camera.setViewOffset(w, h, 0, h * 0.17, w, h);           // tegak: keluarga di atas, jendela di bawah
}
function setHomeCam() { const p = innerWidth < innerHeight; homeCam.set(p ? 6 : 5, p ? 9 : 6.5, p ? 12 : 8).add(RUMAH); homeLook.set(0, p ? -0.6 : 0.6, 0).add(RUMAH); }
function updateHome(t) {
  if (zone !== 'rumah') return;
  [ayah, ibu].forEach((m) => { if (!m || m.anim || !m.sitting) return; const c = Math.max(0, Math.sin(t * 2 + m.phase)); m.armR.rotation.x = -0.8 - 1.4 * c; });
}
function homeMorning() {
  setupFamily(); setHomeCam(); clearParkedMotor();
  zone = 'rumah'; paused = true; hud();
  player.visible = true; sitPose(player, false);
  player.position.set(RUMAH.x - 1.3, 0, RUMAH.z + 1.3); player.rotation.y = Math.PI; sitPose(player, true); addSpoon(player);
  camera.position.copy(homeCam); camera.lookAt(homeLook);
  $('modal').classList.add('low'); homeView(true);
  bubble(ibu, `Ayo sarapan dulu, ${state.nama}, sebelum berangkat.`, 2800);
  const meal = () => {
    modal(`<div class="tag">🏠 Pagi di rumah · 06.10</div><div class="big">Sarapan bersama keluarga</div><p class="muted">Ayah dan Ibu sudah menunggu di meja makan.</p>`, [
      ['🤲 Baca doa sebelum makan', () => modal(`<div class="tag">Doa sebelum makan</div><div class="doa"><span class="ar">اَللّٰهُمَّ بَارِكْ لَنَا فِيْمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ</span><i>Allahumma baarik lanaa fiimaa razaqtanaa wa qinaa ‘adzaaban naar</i></div>`, [['Bismillah, makan', eat, 'main']]), 'main'],
      ['⏩ Lewati adegan pagi', () => leaveHome('jalan'), 'small'],
    ]);
  };
  const eat = () => {
    let n = 0;
    const one = () => {
      modal(`<div class="tag">Sarapan</div><p>Nasi goreng telur dan segelas susu buatan Ibu.</p>`, [[`🥄 Suap (${n}/3)`, () => {
        document.querySelectorAll('#mbtns button').forEach((x) => (x.disabled = true));
        playAnim(player, 'suap', 1.6);
        setTimeout(() => { n++; if (n === 2) bubble(ayah, 'Habiskan, biar kuat belajarnya.', 2200); n < 3 ? one() : done(); }, 1650);
      }, 'opt']]);
    };
    one();
  };
  const done = () => modal(`<div class="tag">Doa sesudah makan</div><div class="doa"><span class="ar">اَلْحَمْدُ لِلّٰهِ الَّذِيْ أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِيْنَ</span><i>Alhamdulillahilladzii ath‘amanaa wa saqaanaa wa ja‘alanaa muslimiin</i></div>`, [['🤲 Aamiin', pamit, 'main']]);
  const pamit = () => {
    addPts(3); toast('+3 ⭐ Sarapan & berdoa bersama keluarga');
    sitPose(player, false); sitPose(ayah, false); sitPose(ibu, false);
    player.position.set(RUMAH.x, 0, RUMAH.z + 2.6); player.rotation.y = Math.PI;
    ayah.position.set(RUMAH.x - 1, 0, RUMAH.z + 1.2); ayah.rotation.y = 0;
    ibu.position.set(RUMAH.x + 1, 0, RUMAH.z + 1.2); ibu.rotation.y = 0;
    modal(`<div class="tag">Berpamitan</div><div class="big">Salim kepada Ayah & Ibu</div>`, [['🤝 Salim kepada Ayah', () => {
      faceTo(player, ayah); playAnim(player, 'salim', 1.5); playAnim(ayah, 'beritangan', 1.5);
      bubble(player, "Ayah, aku berangkat. Assalamu'alaikum.", 1800);
      setTimeout(() => bubble(ayah, `Wa'alaikumussalam. Belajar yang sungguh-sungguh, ${state.nama}.`, 2600), 900);
      setTimeout(() => modal(`<div class="tag">Berpamitan</div><div class="big">Salim kepada Ibu</div>`, [['🤝 Salim kepada Ibu', () => {
        faceTo(player, ibu); playAnim(player, 'salim', 1.5); playAnim(ibu, 'beritangan', 1.5);
        bubble(player, "Bu, aku berangkat. Assalamu'alaikum.", 1800);
        setTimeout(() => bubble(ibu, "Wa'alaikumussalam. Hati-hati, jangan lupa sholat, ya.", 2600), 900);
        setTimeout(() => {
          addPts(3); toast('+3 ⭐ Berbakti: pamit kepada orang tua');
          modal(`<div class="tag">Berangkat sekolah</div><div class="big">Naik apa hari ini?</div>`, [
            ['🚶 Jalan kaki', () => leaveHome('jalan'), 'main'],
            ['🏍️ Naik motor (pakai helm)', () => leaveHome('motor'), 'main'],
          ]);
        }, 2600);
      }, 'main']]), 2600);
    }, 'main']]);
  };
  meal();
}
function leaveHome(how) {
  closeModal(); paused = true; $('modal').classList.remove('low'); homeView(false);
  if (player.spoon) { player.armR.remove(player.spoon); player.spoon = null; }
  fade(how === 'motor' ? 'Memakai helm & menyalakan motor…' : 'Berangkat ke sekolah…', 800, () => {
    sitPose(player, false);
    goOutside(HOME.x, HOME.z - 7, Math.PI);
    if (ibuLuar) scene.remove(ibuLuar);
    ibuLuar = makePerson({ putri: true, shirt: 0x8a3b5c, bottom: 0x3a3a3a, hijab: 0xe9c9d4 }); ibuLuar.position.set(HOME.x + 2, 0, HOME.z - 5); ibuLuar.rotation.y = Math.PI; nameTag(ibuLuar, 'Ibu', 0.5); scene.add(ibuLuar);
    playAnim(ibuLuar, 'lambai', 2.5); bubble(ibuLuar, 'Hati-hati di jalan!', 2500);
    setTimeout(() => { if (ibuLuar) { scene.remove(ibuLuar); ibuLuar = null; } }, 30000);
    minutes = 6 * 60 + 40;
    if (how === 'motor') { startRiding(); setObjective('Naik motor ke sekolah, lalu <b>parkir di Parkir Motor</b> (dalam gerbang, sebelah kiri)', PARK_SLOT, () => { parkMotor(); paused = false; classObjective(); }); }
    else if (dayName() === 'Senin' && !upacaraDone) setObjective('Jalan kaki ke sekolah (sebelum 07.15), lalu berbaris di <b>Lapangan Upacara</b>', { x: -20, z: 21 }, upacaraScene);
    else setObjective(`Jalan kaki ke sekolah (sebelum 07.15): menyeberang lewat zebra cross, lalu masuk kelas <b>${state.cls}</b>`, classDoors[state.cls], knockClass);
  });
}
function classObjective() { if (dayName() === 'Senin' && !upacaraDone && !lateDone) return upacaraObjective(); setObjective(`Masuk ke kelas <b>${state.cls}</b> (Gedung ${side()})`, classDoors[state.cls], knockClass); }
