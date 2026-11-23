
// =====================================================================
//  MASJID DI LUAR WAKTU SHOLAT WAJIB: sholat Dhuha & mengaji (tilawah)
// =====================================================================
let hasWudhu = false, savedObj = null, sideJamaah = [];
// sholat Dhuha hanya sampai ± pukul 11.30; setelah itu (dan setelah Zuhur) cukup "sholat sunnah"
const dhuhaTime = () => minutes < 11 * 60 + 30 && !['santai', 'pulang'].includes(phase);
const sunnahName = () => (dhuhaTime() ? 'sholat Dhuha' : 'sholat sunnah');
function masjidMenu() {
  modal(`<div class="tag">🕌 Masjid · Pintu ${side()}</div><div class="big">Mau beribadah apa?</div><p class="muted">${dhuhaTime() ? 'Masjid terbuka sejak pagi untuk sholat Dhuha dan mengaji.' : 'Silakan sholat sunnah (misalnya tahiyatul masjid atau sholat taubat) atau mengaji.'}</p>`, [
    [dhuhaTime() ? '🤲 Sholat Dhuha (2 rakaat)' : '🤲 Sholat sunnah (2 rakaat)', () => { closeModal(); hasWudhu ? dhuhaScene() : goWudhuFor('Dhuha'); }, 'main'],
    ['📖 Mengaji (tilawah)', () => { closeModal(); hasWudhu ? mengajiScene() : goWudhuFor('mengaji'); }, 'main'],
    ['Nanti saja', closeModal, 'small'],
  ]);
}
function goWudhuFor(what) {
  savedObj = savedObj || objective;
  toast('Berwudhu dulu, ya');
  const wd = doorsOut.find((d) => d.id === (meP() ? 'wudhuPI' : 'wudhuPA'));
  setObjective(`Berwudhu di <b>Wudhu ${side()}</b> sebelum ${what === 'Dhuha' ? sunnahName() : 'mengaji'}`, wd, () => doWudhu(what === 'Dhuha' ? (dhuhaTime() ? 'Dhuha' : 'sunnah') : 'mengaji', null, what === 'Dhuha' ? dhuhaScene : mengajiScene));
}
function restoreObjective() {
  const o = savedObj; savedObj = null;
  if (o) setObjective(o.text, o.has ? { x: o.x, z: o.z } : null, o.run, o.zone);
}
function leaveMasjidVisit(msg, pts) {
  caption('');
  sideJamaah.forEach((p) => ms.remove(p)); sideJamaah = [];
  fade('Keluar masjid…', 700, () => {
    const md = doorsOut.find((d) => d.id === (meP() ? 'masjidPI' : 'masjidPA'));
    goOutside(md.x, md.z + 2.5, 0); player.base = null; player.position.y = 0;
    addPts(pts); toast(msg); restoreObjective();
  });
}
function enterQuietMasjid(cb) {
  jamaah.forEach((p) => ms.remove(p)); jamaah = []; if (imam) { ms.remove(imam); imam = null; }
  sideJamaah.forEach((p) => ms.remove(p)); sideJamaah = [];
  setMsCam(); savedObj = savedObj || objective;
  fade('Masuk masjid…', 800, () => {
    zone = 'masjid'; hud(); $('modal').classList.add('low');
    const me = meP(), z0 = me ? 5.6 : -6.4;
    // beberapa teman sedang beribadah masing-masing
    [[-6, 0], [-3, 1.6], [4, 0.8], [6.5, 1.8]].forEach(([x, dz], i) => {
      const m = makePerson(me ? { putri: true, shirt: 0xffffff, bottom: 0xffffff, hijab: 0xffffff, skin: SKINS[i % 4] } : { shirt: 0xffffff, bottom: 0x6d6f73, peci: 0xffffff, tie: false, skin: SKINS[i % 4] });
      m.position.set(x, 0, z0 + dz); m.rotation.y = Math.PI; m.base = m.position.clone(); m.baseRot = Math.PI; m.cyc = i * 1.7; ms.add(m); sideJamaah.push(m);
    });
    const pt = innerWidth < innerHeight; msCam.set(4, pt ? 10 : 7, z0 + (pt ? 14 : 10)).add(MSJ); msLook.set(0, pt ? -1.5 : 0.5, z0 - 1).add(MSJ);
    player.base = new THREE.Vector3(0, 0, z0).add(MSJ); player.baseRot = Math.PI; player.rotation.y = Math.PI;
    sitPose(player, false); pose(player, 'berdiri');
    camera.position.copy(msCam); camera.lookAt(msLook);
    cb(z0);
  });
}
// gerakan teman-teman yang sholat sendiri-sendiri (agar suasana hidup)
const SOLO = ['takbir', 'sedekap', 'sedekap', 'rukuk', 'berdiri', 'sujud', 'duduk', 'sujud', 'duduk'];
function updateSideJamaah(t) {
  if (zone !== 'masjid' || !sideJamaah.length) return;
  sideJamaah.forEach((m) => { if (m.reading) return; const k = Math.floor((t + m.cyc) / 1.6) % SOLO.length; if (m.lastK !== k) { m.lastK = k; pose(m, SOLO[k]); } });
}
function dhuhaScene() {
  hasWudhu = true;
  enterQuietMasjid(() => {
    if (!dhuhaTime()) return modal(`<div class="tag">Sholat sunnah · niat</div><div class="doa"><b>Niat sholat sunnah (dalam hati)</b><span class="ar">أُصَلِّيْ سُنَّةً رَكْعَتَيْنِ لِلّٰهِ تَعَالَى</span><i>Ushalli sunnatan rak‘ataini lillaahi ta‘aalaa</i><small>Artinya: Aku niat sholat sunnah dua rakaat karena Allah Ta‘ala. Boleh diniatkan tahiyatul masjid, sholat taubat, atau sholat sunnah lainnya.</small></div>`,
      [['Allahu Akbar, mulai sholat', () => { $('modal').classList.remove('show'); paused = true; runDhuha(); }, 'main']]);
    modal(`<div class="tag">Sholat Dhuha · niat</div><div class="doa"><b>Niat sholat Dhuha</b><span class="ar">أُصَلِّيْ سُنَّةَ الضُّحٰى رَكْعَتَيْنِ لِلّٰهِ تَعَالَى</span><i>Ushalli sunnatadh dhuhaa rak‘ataini lillaahi ta‘aalaa</i><small>Artinya: Aku niat sholat sunnah Dhuha dua rakaat karena Allah Ta‘ala.</small></div>`,
      [['Allahu Akbar, mulai sholat', () => { $('modal').classList.remove('show'); paused = true; runDhuha(); }, 'main']]);
  });
}
function runDhuha() {
  const R = [['Takbiratul ihram', 'takbir', 1500], ['Membaca Al-Fatihah & surah', 'sedekap', 2600], ['Rukuk', 'rukuk', 1600], ["I'tidal", 'berdiri', 1300], ['Sujud', 'sujud', 1600], ['Duduk di antara dua sujud', 'duduk', 1300], ['Sujud kedua', 'sujud', 1600]];
  const seq = [];
  R.forEach(([c, p, ms_]) => seq.push(['Rakaat 1 · ' + c, p, ms_]));
  R.slice(1).forEach(([c, p, ms_]) => seq.push(['Rakaat 2 · ' + c, p, ms_]));
  seq.push(['Tasyahud akhir', 'duduk', 2400], ['Salam ke kanan', 'salamKanan', 1300], ['Salam ke kiri', 'salamKiri', 1300]);
  let t = 0;
  seq.forEach(([c, p, d]) => { setTimeout(() => { caption(c); pose(player, p); }, t); t += d; });
  setTimeout(() => {
    caption(''); pose(player, 'duduk');
    if (!dhuhaTime()) return modal(`<div class="tag">Dzikir setelah sholat sunnah</div><div class="doa"><span class="ar">أَسْتَغْفِرُ اللّٰهَ الْعَظِيْمَ</span><i>Astaghfirullaahal ‘azhiim</i><small>Artinya: Aku memohon ampun kepada Allah Yang Maha Agung.</small></div>`,
      [['🤲 Aamiin', () => { closeModal(); $('modal').classList.remove('low'); pose(player, 'berdiri'); leaveMasjidVisit('+8 ⭐ Sholat sunnah', 8); }, 'main']]);
    modal(`<div class="tag">Doa setelah sholat Dhuha</div><div class="doa"><span class="ar">اَللّٰهُمَّ إِنَّ الضُّحَاءَ ضُحَاؤُكَ، وَالْبَهَاءَ بَهَاؤُكَ، وَالْجَمَالَ جَمَالُكَ، وَالْقُوَّةَ قُوَّتُكَ، وَالْقُدْرَةَ قُدْرَتُكَ، وَالْعِصْمَةَ عِصْمَتُكَ</span><i>Allaahumma innadh dhuhaa-a dhuhaa-uka, wal bahaa-a bahaa-uka, wal jamaala jamaaluka, wal quwwata quwwatuka, wal qudrata qudratuka, wal ‘ishmata ‘ishmatuka.</i><small>(Bagian awal doa Dhuha) Artinya: Ya Allah, sesungguhnya waktu dhuha adalah waktu dhuha-Mu, keagungan adalah keagungan-Mu, keindahan adalah keindahan-Mu, kekuatan adalah kekuatan-Mu, kekuasaan adalah kekuasaan-Mu, dan penjagaan adalah penjagaan-Mu.</small></div>`,
      [['🤲 Aamiin', () => { closeModal(); $('modal').classList.remove('low'); pose(player, 'berdiri'); leaveMasjidVisit('+8 ⭐ Sholat Dhuha', 8); }, 'main']]);
  }, t + 300);
}
const SURAH = {
  ikhlas: { n: 'Al-Ikhlas', a: [['قُلْ هُوَ اللّٰهُ أَحَدٌ', 'Qul huwallaahu ahad'], ['اَللّٰهُ الصَّمَدُ', 'Allaahush shamad'], ['لَمْ يَلِدْ وَلَمْ يُوْلَدْ', 'Lam yalid wa lam yuulad'], ['وَلَمْ يَكُنْ لَّهٗ كُفُوًا أَحَدٌ', 'Wa lam yakul lahuu kufuwan ahad']] },
  ashr: { n: "Al-'Ashr", a: [['وَالْعَصْرِ', "Wal 'ashr"], ['إِنَّ الْإِنْسَانَ لَفِيْ خُسْرٍ', 'Innal insaana lafii khusr'], ['إِلَّا الَّذِيْنَ اٰمَنُوْا وَعَمِلُوا الصّٰلِحٰتِ وَتَوَاصَوْا بِالْحَقِّ ەۙ وَتَوَاصَوْا بِالصَّبْرِ', "Illalladziina aamanuu wa 'amilush shaalihaati wa tawaashau bil haqqi wa tawaashau bish shabr"]] },
};
let rehal = null;
function mengajiScene() {
  hasWudhu = true;
  enterQuietMasjid((z0) => {
    pose(player, 'duduk'); player.armL.rotation.x = player.armR.rotation.x = -1.1;
    rehal = new THREE.Group();
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.45), mat(0x8a5a2b)); a.rotation.x = -0.5; a.position.y = 0.45; rehal.add(a);
    const q = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.4), mat(0x2f6b4a)); q.rotation.x = -0.5; q.position.set(0, 0.5, 0.02); rehal.add(q);
    rehal.position.set(0, 0, z0 - 0.9); ms.add(rehal);
    sideJamaah.forEach((m) => { m.reading = true; pose(m, 'duduk'); m.armL.rotation.x = m.armR.rotation.x = -1.1; });
    modal(`<div class="tag">📖 Mengaji</div><div class="big">Pilih surah untuk dibaca</div>
      <div class="doa"><span class="ar">أَعُوْذُ بِاللّٰهِ مِنَ الشَّيْطٰنِ الرَّجِيْمِ</span><i>A‘uudzu billaahi minasy syaithaanir rajiim</i></div>`,
      Object.entries(SURAH).map(([k, s]) => [`📖 Surah ${s.n}`, () => readSurah(k, 0), 'opt']));
  });
}
function readSurah(k, i) {
  const s = SURAH[k];
  if (i >= s.a.length) {
    return modal(`<div class="tag">Selesai membaca Surah ${s.n}</div><div class="doa"><span class="ar">صَدَقَ اللّٰهُ الْعَظِيْمُ</span><i>Shadaqallaahul ‘azhiim</i></div>`,
      [['📖 Baca surah lain', () => mengajiPick(), 'small'], ['Selesai mengaji', () => { closeModal(); $('modal').classList.remove('low'); if (rehal) { ms.remove(rehal); rehal = null; } pose(player, 'berdiri'); leaveMasjidVisit('+5 ⭐ Rajin mengaji', 5); }, 'main']]);
  }
  bubble(player, s.a[i][1], 2400);
  modal(`<div class="tag">📖 Surah ${s.n} · ayat ${i + 1}/${s.a.length}</div>${i === 0 ? '<div class="doa"><span class="ar">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</span></div>' : ''}<div class="doa"><span class="ar">${s.a[i][0]}</span><i>${s.a[i][1]}</i></div>`,
    [[i < s.a.length - 1 ? 'Ayat berikutnya ▶' : 'Selesai ✓', () => readSurah(k, i + 1), 'main']]);
}
function mengajiPick() { modal(`<div class="tag">📖 Mengaji</div><div class="big">Pilih surah</div>`, Object.entries(SURAH).map(([k, s]) => [`📖 Surah ${s.n}`, () => readSurah(k, 0), 'opt'])); }
