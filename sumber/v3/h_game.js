
// =====================================================================
//  ALUR PERMAINAN SEHARI
// =====================================================================
const SUBJ = DATA.subjects;
const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at"];
const toMin = (t) => { const [h, m] = t.split('.').map(Number); return h * 60 + m; };
const isPutri = (c) => / PI /.test(c + ' ');
const SAVE_KEY = 'hari-di-sekolah-v3';
let state = { day: 1, points: 0, cls: 'X PA 1', nama: '', start: 0 };
try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.day && DATA.sched[s.cls]) state = s; } catch (e) {}
const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {} };

let breakEnd = 0;
let zone = 'luar', phase = 'datang', paused = true, minutes = 410, dayScore = 0, today = [], objective = null, interior = null;
const dayDone = new Set();
const dayIdx = () => ((state.start || 0) + state.day - 1) % 5;
const dayName = () => HARI[dayIdx()];
const lessons = () => today.filter((b) => b.s);
const zuhurAt = () => Math.min(lessons().length, Math.max(2, Math.ceil(lessons().length / 2)));
const side = () => (isPutri(state.cls) ? 'Putri' : 'Putra');
const $ = (id) => document.getElementById(id);

function hud() {
  const h = Math.floor(minutes / 60), m = Math.floor(minutes % 60);
  $('day').textContent = `Hari ke-${state.day} · ${dayName()}`;
  $('cls').textContent = `${state.nama || 'Siswa'} · ${state.cls}`;
  $('clock').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  $('pts').textContent = `⭐ ${state.points}`;
  $('obj').innerHTML = objective ? objective.text : '';
  $('obj').style.display = objective && !['kuis', 'kelas', 'masjid', 'pesawat', 'battle', 'balap', 'rumah', 'upacara'].includes(zone) ? '' : 'none';
}
function setObjective(text, target, run, z = 'luar') { objective = { text, x: target ? target.x : 0, z: target ? target.z : 0, run, zone: z, has: !!target }; lastTrig = computeHit(); hud(); }

// ---------- jendela dialog ----------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function modal(html, buttons) {
  paused = true;
  $('mbody').innerHTML = html;
  const bar = $('mbtns'); bar.innerHTML = '';
  buttons.forEach(([t, fn, cls]) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = t; if (cls) b.className = cls; b.onclick = fn; bar.appendChild(b); });
  $('modal').classList.add('show');
}
function closeModal() { $('modal').classList.remove('show'); paused = false; keys.clear(); joy.active = false; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const addPts = (p) => { state.points += p; dayScore += p; hud(); };
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(el.t); el.t = setTimeout(() => el.classList.remove('show'), 1900); }

function goOutside(x, z, rotY = 0) {
  zone = 'luar'; interior = null;
  if (player.sitting) sitPose(player, false);
  player.position.set(x, 0, z); player.rotation.y = rotY; player.rotation.x = 0;
  camera.position.copy(CAM_OFF).add(player.position);
  roomSpots = []; lastTrig = computeHit(); paused = false; leaving = false; hud();
}
function enterHall(name, origin, D, out, onEnter, zn) {
  fade(name, 700, () => {
    zone = zn || (name === 'Kantin' ? 'kantin' : 'ruang');
    interior = { origin, D, out };
    if (player.sitting) sitPose(player, false);
    player.position.set(origin.x, 0, origin.z + D / 2 - 1); player.rotation.y = Math.PI;
    camera.position.copy(intOff()).add(player.position);
    lastTrig = computeHit(); paused = false; leaving = false; hud(); onEnter && onEnter();
  });
}
let eatingCam = false;
const intOff = () => { const v = innerWidth < innerHeight ? new THREE.Vector3(0, 17, 14) : new THREE.Vector3(0, 12, 10); if (eatingCam) v.set(2.6, 3.4, 3.2); return v; };

// ---------- mulai hari ----------
function startDay() {
  takeBag();
  today = DATA.sched[state.cls][dayIdx()].blocks;
  dayDone.clear(); phase = 'datang'; minutes = 6 * 60 + 50; dayScore = 0;
  if (crowd.length) afterMasjid(); else walkers.forEach((n) => { n.visible = true; n.goingIn = false; n.path = null; });
  objective = null; hasWudhu = false; savedObj = null; upacaraDone = false; lateDone = false; setGate(false); homeMorning();
}
function knockClass() {
  const first = lessons().find((b) => !dayDone.has(b.a));
  const guru = first ? teacherInfo(first.g[0]).p : '';
  modal(`<div class="tag">Pintu kelas ${esc(state.cls)}</div><p>${guru ? `<b>${esc(guru)}</b> sudah ada di dalam kelas.` : 'Kelas sudah dimulai.'}</p>`, [
    ['🚪 Ketuk pintu & ucapkan salam', () => {
      closeModal(); paused = true; Audio.sfx('knock'); bubble(player, "Assalamu'alaikum… permisi.", 1800);
      addPts(3); toast('+3 ⭐ Adab masuk kelas');
      setTimeout(() => enterClass(`Wa'alaikumussalam warahmatullah. Silakan masuk, ${state.nama}.`), 1500);
    }, 'main'],
    ['Langsung masuk', () => { closeModal(); paused = true; enterClass(`Lain kali ketuk pintu dan ucapkan salam dulu, ya, ${state.nama}.`); }],
    ['↩️ Tidak jadi, kembali', () => { closeModal(); stepBackFromDoor(); }, 'small'],
  ]);
}
// mundur sedikit dari pintu supaya tidak langsung ditawari masuk lagi
function stepBackFromDoor() {
  const d = classDoors[state.cls]; if (!d) return;
  let dx = player.position.x - d.x, dz = player.position.z - d.z; const L = Math.hypot(dx, dz) || 1;
  if (L < 0.01) dz = 1;
  const nx = d.x + dx / L * 3.4, nz = d.z + dz / L * 3.4;
  if (!blocked(nx, nz)) { player.position.x = nx; player.position.z = nz; }
  player.rotation.y = Math.atan2(dx, dz);
}
// ---------- kelas: pilih pelajaran bebas ----------
function classHub() {
  const rows = today.map((b) => {
    if (!b.s) return `<div class="les act"><span>${b.a}–${b.b}</span>${esc(b.act)}</div>`;
    const done = dayDone.has(b.a), hasTask = !!QBANK[b.s];
    return `<button type="button" class="les${done ? ' done' : ''}" data-a="${b.a}"><span>${b.a}–${b.b}</span><b>${esc(SUBJ[b.s] || b.s)}</b><i>${esc(b.g.map((g) => teacherInfo(g).p).join(' & '))}</i><em>${done ? '✓ selesai' : hasTask ? MODES[modeFor(b)].split(' ')[0] + ' tugas' : '🙋 hadir'}</em></button>`;
  }).join('');
  modal(`<div class="tag">Kelas ${esc(state.cls)} · ${dayName()}</div><p class="muted">Pilih pelajaran untuk mengerjakan tugasnya (bebas urutannya)</p><div class="sched">${rows}</div>`,
    [['🚪 Keluar kelas', () => { closeModal(); paused = true; exitClass(); }, 'small']]);
  document.querySelectorAll('.les[data-a]').forEach((el) => (el.onclick = () => selectLesson(today.find((b) => b.a === el.dataset.a))));
}
function selectLesson(b) {
  if (dayDone.has(b.a)) { toast('Tugas ini sudah selesai ✓'); return; }
  setRoomTeacher(b.g[0]);
  minutes = toMin(b.a); hud();
  const g = teacherInfo(b.g[0]).p, bank = QBANK[b.s];
  bubble(roomTeacher, bank ? `Hari ini ada tugas ${SUBJ[b.s]}. Semangat!` : `Perhatikan penjelasan ${SUBJ[b.s]} hari ini, ya.`, 2800);
  const head = `<div class="tag">${b.a}–${b.b} · ${esc(state.cls)}</div><div class="big">${esc(SUBJ[b.s] || b.s)}</div><p class="guru">👤 ${esc(b.g.map((x) => teacherInfo(x).p).join(' & '))}</p>`;
  if (bank) {
    const m = modeFor(b), desc = { arena: `jelajahi ${Math.min(5, bank.length)} pos soal sampai garis FINISH`, battle: 'kalahkan Raksasa Lupa dengan jawaban yang benar', balap: 'menangkan balapan dengan memilih jalur jawaban yang benar' }[m];
    modal(head + `<p>${esc(g)} memberi tugas: <b>${MODES[m]}</b><br><span class="muted">${desc}</span></p>`,
      [[`${MODES[m].split(' ')[0]} Kerjakan tugas`, () => { closeModal(); paused = true; const fin = () => lessonDone(b); if (m === 'battle') startBattle(b, bank, fin); else if (m === 'balap') startRace(b, bank, fin); else startQuiz(b, bank, fin); }, 'main'], ['⏭ Lewati tugas (tetap tercatat hadir)', () => { closeModal(); toast('✓ Tercatat hadir. Tugasnya bisa dilatih lagi di 🎮 Lab Komputer'); lessonDone(b); }], ['Kembali', classHub, 'small']]);
  }
  else modal(head + `<p class="muted">Belum ada tugas dari guru untuk pelajaran ini.<br>Ikuti penjelasan guru di kelas.</p>`,
    [['🙋 Hadir ✓ (+5)', () => { addPts(5); lessonDone(b); }, 'main'], ['Kembali', classHub, 'small']]);
}
function lessonDone(b) {
  dayDone.add(b.a);
  const n = lessons().length, d = dayDone.size;
  if (phase === 'datang' && n >= 2 && d === 1) return istirahat1();
  if ((phase === 'datang' || phase === 'kelas2') && d >= zuhurAt() && d < n) return zuhur();
  if (d >= n) return pulangPhase();
  classHub();
}
// ---------- istirahat pertama: kantin & MBG ----------
function istirahat1() {
  phase = 'istirahat1'; minutes = 10 * 60; Audio.sfx('bell');
  modal(`<div class="tag">🔔 Bel istirahat pertama</div><div class="big">Waktunya makan!</div><p>Ayo ke <b>Kantin ${side()}</b> untuk makan MBG bersama teman-teman.</p>`,
    [['🍽️ Makan MBG di kantin', () => { closeModal(); paused = true; exitClass(() => setObjective(`Istirahat: makan MBG di <b>Kantin ${side()}</b>`, kantinDoor(), enterKantin)); }, 'main'],
     ['🙅 Tidak makan MBG', () => { closeModal(); paused = true; exitClass(() => { toast('Tidak apa-apa. Jangan lupa makan bekalmu dan minum yang cukup, ya'); freeBreak(); }); }]]);
}
// istirahat bebas (setelah makan, atau bila tidak makan MBG)
function freeBreak() {
  breakEnd = performance.now() + 4 * 60 * 1000;
  setObjective(`Istirahat bebas! Jelajahi sekolah, lalu kembali ke kelas <b>${state.cls}</b>`, classDoors[state.cls], () => { breakEnd = 0; phase = 'kelas2'; Audio.sfx('bell'); knockClass(); });
}
const kantinDoor = () => doorsOut.find((d) => d.id === (isPutri(state.cls) ? 'kantinPI' : 'kantinPA'));
let tray = null;
function enterKantin() {
  populateKantin();
  const dd = kantinDoor();
  enterHall('Kantin', KANTIN, 16, { x: dd.x, z: dd.z - 1.5, rot: Math.PI }, () => {
    toast(`Kantin ${side()}`);
    setObjective('Ambil MBG di <b>meja saji</b>', { x: KANTIN.x, z: KANTIN.z - 4.6 }, mbgGame, 'kantin');
  });
}
const MBG = [
  ['pokok', '🍚 Nasi', 'nasi'], ['pokok', '🌽 Jagung rebus', 'jagung'], ['lauk', '🍗 Ayam goreng', 'ayam'], ['lauk', '🐟 Ikan bakar', 'ikan'], ['lauk', '🥚 Telur', 'telur'], ['lauk', '🟫 Tempe', 'tempe'],
  ['sayur', '🥬 Sayur bayam', 'bayam'], ['sayur', '🥦 Tumis brokoli', 'brokoli'], ['buah', '🍌 Pisang', 'pisang'], ['buah', '🍊 Jeruk', 'jeruk'], ['susu', '🥛 Susu', 'susu'],
  ['x', '🍟 Keripik'], ['x', '🥤 Minuman soda'], ['x', '🍬 Permen'],
];
function mbgGame() {
  const picked = new Set();
  modal(`<div class="tag">Makan Bergizi Gratis</div><div class="big">Susun nampan 4 Sehat 5 Sempurna</div>
    <p class="muted">Pilih satu dari setiap kelompok: makanan pokok, lauk, sayur, buah, dan susu.</p><div class="mbg">${MBG.map((m, i) => `<button type="button" data-i="${i}">${m[1]}</button>`).join('')}</div><div id="fb"></div>`,
    [['🍽️ Ambil nampan', () => {
      const cats = new Set([...picked].map((i) => MBG[i][0]));
      const miss = ['pokok', 'lauk', 'sayur', 'buah', 'susu'].filter((c) => !cats.has(c));
      if (cats.has('x')) { $('fb').textContent = 'Keripik, soda, dan permen bukan bagian dari menu bergizi, ya.'; Audio.sfx('no'); return; }
      if (miss.length) { $('fb').textContent = 'Masih kurang: ' + miss.map((c) => ({ pokok: 'makanan pokok', lauk: 'lauk', sayur: 'sayur', buah: 'buah', susu: 'susu' }[c])).join(', '); Audio.sfx('no'); return; }
      Audio.sfx('ok'); addPts(10); toast('+10 ⭐ 4 Sehat 5 Sempurna!');
      myMenu = {}; [...picked].sort((a, b) => a - b).forEach((i) => { const [cat, lbl, key] = MBG[i]; if (!myMenu[cat]) myMenu[cat] = { key, lbl }; });
      closeModal(); holdTray(true);
      bubble(npcs.find((n) => n.kind === 'kantin'), `Selamat makan, ${state.nama}!`, 2200);
      setObjective('Duduk di <b>kursi kosong</b> (lingkaran kuning)', { x: KANTIN.x + KT_SEAT.x, z: KANTIN.z + KT_SEAT.z }, eatScene, 'kantin');
    }, 'main']]);
  document.querySelectorAll('.mbg button').forEach((b) => (b.onclick = () => { const i = +b.dataset.i; picked.has(i) ? picked.delete(i) : picked.add(i); b.classList.toggle('on'); }));
}
let myMenu = {};
function holdTray(on) {
  if (tray) { tray.parent && tray.parent.remove(tray); tray = null; }
  if (!on) return;
  const menu = {}; for (const c in myMenu) menu[c] = myMenu[c].key;
  tray = makeMeal(menu); tray.scale.setScalar(1.1);   // bentuk makanan sama dengan nampan teman-teman
  tray.position.set(0, 1.15, 0.55); player.add(tray);
}
function eatScene() {
  paused = true;
  player.position.set(KANTIN.x + KT_SEAT.x, 0, KANTIN.z + KT_SEAT.z); player.rotation.y = 0; sitPose(player, true);
  if (tray) { player.remove(tray); tray.position.set(KANTIN.x + KT_SEAT.x, 0.85, KANTIN.z + KT_SEAT.z + 0.55); scene.add(tray); }
  ktMarker.visible = false; eatingCam = true; if (objective) objective.has = false; $('modal').classList.add('low'); addSpoon(player);
  modal(`<div class="tag">Sebelum makan</div><p>Teman-teman di meja mulai makan.</p>`, [
    ['🤲 Baca doa sebelum makan', () => {
      addPts(3); toast('+3 ⭐ Adab makan');
      modal(`<div class="tag">Doa sebelum makan</div><div class="doa"><span class="ar">اَللّٰهُمَّ بَارِكْ لَنَا فِيْمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ</span><i>Allahumma baarik lanaa fiimaa razaqtanaa wa qinaa ‘adzaaban naar</i></div>`, [['Bismillah, makan', eat, 'main']]);
    }, 'main'],
    ['Langsung makan', () => { bubble(player, 'Eh, lupa…', 1500); toast('Temanmu mengingatkan: baca doa dulu, ya!'); setTimeout(eat, 600); }],
  ]);
  function eat() {
    const cats = ['pokok', 'lauk', 'sayur', 'buah', 'susu'].filter((c) => myMenu[c]), left = new Set(cats);
    const draw = () => modal(`<div class="tag">Makan MBG</div><p>Ketuk untuk menghabiskan setiap makanan. Jangan bersisa!</p>`,
      [...left].map((it) => [`🥄 Suap ${myMenu[it].lbl}`, () => {
        document.querySelectorAll('#mbtns button').forEach((x) => (x.disabled = true));
        playAnim(player, 'suap', 1.6);
        setTimeout(() => { if (Math.random() < 0.5) bubble(player, pick(['Nyam… enak!', 'Alhamdulillah, lezat', 'Mmm…']), 1200); }, 500);
        setTimeout(() => { left.delete(it); Audio.sfx('greet'); const c = tray && tray.userData.parts[it]; if (c) c.visible = false; left.size ? draw() : after(); }, 1650);
      }, 'opt']));
    draw();
  }
  function after() {
    minutes = 10 * 60 + 12; hud();
    modal(`<div class="tag">Doa sesudah makan</div><div class="doa"><span class="ar">اَلْحَمْدُ لِلّٰهِ الَّذِيْ أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِيْنَ</span><i>Alhamdulillahilladzii ath‘amanaa wa saqaanaa wa ja‘alanaa muslimiin</i></div>`,
      [['🤲 Aamiin, kembalikan nampan', () => {
        addPts(5); toast('+5 ⭐ Makanan habis & nampan dikembalikan');
        holdTray(false); sitPose(player, false); ktMarker.visible = true; eatingCam = false; $('modal').classList.remove('low');
        if (player.spoon) { player.armR.remove(player.spoon); player.spoon = null; }
        breakEnd = performance.now() + 4 * 60 * 1000;
        modal(`<div class="tag">Istirahat masih berlanjut</div><div class="big">Waktunya bebas! 🎉</div>
          <p>Silakan berkeliling sekolah: ikut main <b>⚽ bola</b>, <b>🏐 voli</b>, atau <b>🏀 basket</b>, mampir ke <b>🎮 Lab Komputer</b>, perpustakaan, atau menyapa guru di <b>Ruang Ustadz/Ustadzah</b>.</p>
          <p class="muted">Bel masuk berbunyi sekitar 4 menit lagi. Boleh juga langsung kembali ke kelas kapan saja.</p>`,
          [['Keluar kantin', () => { closeModal(); leaveInterior(); setObjective(`Istirahat bebas! Jelajahi sekolah, lalu kembali ke kelas <b>${state.cls}</b>`, classDoors[state.cls], () => { breakEnd = 0; phase = 'kelas2'; Audio.sfx('bell'); knockClass(); }); }, 'main']]);
      }, 'main']]);
  }
}
function leaveInterior() {
  const o = interior && interior.out; if (!o) return;
  fade('Keluar…', 500, () => goOutside(o.x, o.z, o.rot ?? Math.PI));
}
// ---------- istirahat kedua: azan Zuhur, berbondong-bondong ke masjid ----------
function zuhur() {
  phase = 'zuhur'; minutes = 12 * 60 + 15; Audio.sfx('bell');
  modal(`<div class="tag">🔔 ISHOMA</div><div class="big">Azan Zuhur berkumandang</div><p>Semua bersiap ke masjid: berwudhu dulu di <b>Wudhu ${side()}</b>.</p>`,
    [['Keluar kelas', () => {
      closeModal(); paused = true;
      exitClass(() => { playAzan(); crowdToMasjid(); setObjective(`Azan! Berwudhu di <b>Wudhu ${side()}</b>`, doorsOut.find((d) => d.id === (isPutri(state.cls) ? 'wudhuPI' : 'wudhuPA')), doWudhu); });
    }, 'main']]);
}
// azan: rekaman yang dikirim Ustadz, dipotong sampai takbir keempat — file azan.mp3 di samping halaman
function playAzan() {
  Audio.duck(true);
  const el = $('qbanner');
  const show = () => { el.innerHTML = `🕌 <span class="ar">اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ</span><br>Allahu Akbar, Allahu Akbar`; el.classList.add('show'); };
  const real = Audio.playBuffer();
  (real ? [300, 21300] : [0, 4000]).forEach((ms) => setTimeout(show, ms));
  setTimeout(() => { el.classList.remove('show'); Audio.duck(false); }, real ? 38500 : 8500);
}
const DOA = {
  basmalah: ['بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ', 'Bismillaahir rahmaanir rahiim'],
  niat: ['نَوَيْتُ الْوُضُوْءَ لِرَفْعِ الْحَدَثِ الْأَصْغَرِ فَرْضًا لِلّٰهِ تَعَالَى', "Nawaitul wudhuu-a liraf'il hadatsil ashghari fardhan lillaahi ta'aalaa", 'Aku berniat berwudhu untuk menghilangkan hadas kecil, fardu karena Allah Ta‘ala.'],
  setelah: ['أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُوْلُهُ، اَللّٰهُمَّ اجْعَلْنِيْ مِنَ التَّوَّابِيْنَ وَاجْعَلْنِيْ مِنَ الْمُتَطَهِّرِيْنَ',
    "Asyhadu allaa ilaaha illallaahu wahdahuu laa syariika lah, wa asyhadu anna Muhammadan ‘abduhuu wa rasuuluh. Allaahummaj‘alnii minat tawwaabiina waj‘alnii minal mutathahhiriin.",
    'Aku bersaksi tiada Tuhan selain Allah Yang Maha Esa, tiada sekutu bagi-Nya, dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya. Ya Allah, jadikanlah aku termasuk orang-orang yang bertaubat dan orang-orang yang menyucikan diri.'],
};
const doaBox = (d, title) => `<div class="doa"><b>${title}</b><span class="ar">${d[0]}</span><i>${d[1]}</i>${d[2] ? `<small>Artinya: ${d[2]}</small>` : ''}</div>`;
function doWudhu(sholat = 'Zuhur', after = afterZuhur, enter = null) {
  paused = true;
  fade('Menuju tempat wudhu…', 700, () => {
    modal(`<div class="tag">Wudhu ${side()} · sebelum berwudhu</div>${doaBox(DOA.basmalah, 'Membaca basmalah')}${doaBox(DOA.niat, 'Niat wudhu (dalam hati)')}`,
      [['🤲 Aamiin, mulai berwudhu', () => {
        const steps = ['Membasuh kedua telapak tangan', 'Berkumur-kumur', 'Membersihkan hidung', 'Membasuh wajah', 'Membasuh tangan sampai siku', 'Mengusap sebagian kepala', 'Membasuh kedua telinga', 'Membasuh kaki sampai mata kaki'];
        let i = 0;
        const step = () => {
          modal(`<div class="tag">Wudhu ${side()} · urutan wudhu</div><ol class="wudhu">${steps.map((s, k) => `<li class="${k < i ? 'ok' : k === i ? 'now' : ''}">${k < i ? '✓ ' : ''}${s}</li>`).join('')}</ol>`,
            i < steps.length ? [[`💧 ${steps[i]}`, () => { Audio.sfx('greet'); i++; step(); }, 'main']]
              : [['Lanjut: doa sesudah wudhu', () => {
                modal(`<div class="tag">Wudhu ${side()} · sesudah berwudhu</div>${doaBox(DOA.setelah, 'Doa sesudah wudhu')}`,
                  [['🤲 Aamiin (+5)', () => {
                    addPts(5); toast('+5 ⭐ Wudhu sempurna'); closeModal(); hasWudhu = true;
                    const md = doorsOut.find((d) => d.id === (isPutri(state.cls) ? 'masjidPI' : 'masjidPA'));
                    setObjective(`Masuk masjid lewat <b>Pintu ${side()}</b> untuk ${sholat === 'mengaji' ? 'mengaji' : 'sholat ' + sholat}`, md, () => { paused = true; (enter || masjidScene)(after); });
                  }, 'main']]);
              }, 'main']]);
        };
        step();
      }, 'main']]);
  });
}
function afterZuhur() {
  caption('');
  fade('Keluar masjid…', 700, () => {
    afterMasjid();
    const md = doorsOut.find((d) => d.id === (isPutri(state.cls) ? 'masjidPI' : 'masjidPA'));
    goOutside(md.x, md.z + 2.5, 0);
    addPts(10); toast('+10 ⭐ Sholat Zuhur berjamaah');
    phase = 'santai'; minutes = 12 * 60 + 50;
    if (dayDone.size >= lessons().length) return pulangPhase(true);
    setObjective(`Waktu santai (main bola, ke taman, perpustakaan…). Lalu kembali ke kelas <b>${state.cls}</b>`, classDoors[state.cls], knockClass);
  });
}
// ---------- pulang ----------
function pulangPhase(outside) {
  takeBag();
  phase = 'pulang'; minutes = 15 * 60 + 30; Audio.sfx('bell');
  const ashar = today.some((b) => /Ashar/.test(b.act || ''));
  const go = () => ashar
    ? setObjective(`Waktu Ashar: berwudhu di <b>Wudhu ${side()}</b>`, doorsOut.find((d) => d.id === (isPutri(state.cls) ? 'wudhuPI' : 'wudhuPA')), () => doWudhu('Ashar', afterAshar))
    : setObjective('Sekolah selesai: pulang lewat <b>Gerbang Utama</b>', { x: 0, z: 50 }, goHome);
  if (outside) return go();
  if (ashar) setTimeout(() => { playAzan(); crowdToMasjid(); }, 2500);
  modal(`<div class="tag">🔔 Pelajaran hari ini selesai</div><div class="big">Alhamdulillah!</div><p>${ashar ? "Sebelum pulang, sholat Ashar & Al-Ma'tsurat di masjid." : 'Saatnya pulang.'}</p>`,
    [['Keluar kelas', () => { closeModal(); paused = true; exitClass(go); }, 'main']]);
}
function afterAshar() {
  caption("Al-Ma'tsurat bersama, lalu closing class");
  setTimeout(() => {
    caption('');
    fade('Keluar masjid…', 700, () => {
      afterMasjid();
      const md = doorsOut.find((d) => d.id === (isPutri(state.cls) ? 'masjidPI' : 'masjidPA'));
      goOutside(md.x, md.z + 2.5, 0);
      addPts(10); toast("+10 ⭐ Sholat Ashar & Al-Ma'tsurat"); minutes = 16 * 60;
      setObjective('Sekolah selesai: pulang lewat <b>Gerbang Utama</b>', { x: 0, z: 50 }, goHome);
    });
  }, 2500);
}
function asharQuick() {
  addPts(10);
  modal(`<div class="tag">Masjid · 15.30</div><div class="big">Sholat Ashar & Al-Ma'tsurat ✓</div><p>+10 ⭐</p>`,
    [['Lanjut', () => { closeModal(); setObjective('Sekolah selesai: pulang lewat <b>Gerbang Utama</b>', { x: 0, z: 50 }, goHome); }, 'main']]);
}
function goHome() {
  minutes = 16 * 60;
  modal(`<div class="tag">Hari ke-${state.day} · ${dayName()} selesai</div><div class="big">+${dayScore} ⭐ hari ini</div>
    <p>Pulang ke rumah, istirahat, lalu tidur. Permainan disimpan.</p>`, [['🌙 Tidur & Simpan', sleep, 'main']]);
}
function sleep() {
  $('modal').classList.remove('show');
  state.day += 1; save();
  const f = $('fade'); f.querySelector('span').textContent = `Zzz… Hari ke-${state.day} · ${dayName()}`;
  f.classList.add('show');
  setTimeout(startDay, 900);
  setTimeout(() => { f.classList.remove('show'); paused = false; }, 2200);
}

// ---------- pintu ruangan yang bisa dijelajahi ----------
function enterRuang(putri) {
  const h = putri ? ruangP : ruangL, dd = doorsOut.find((d) => d.id === (putri ? 'ruangPI' : 'ruangPA'));
  enterHall(putri ? 'Ruang Ustadzah' : 'Ruang Ustadz', h.origin, 16, { x: dd.x, z: dd.z - 1.5, rot: Math.PI }, () => {
    bubble(player, "Assalamu'alaikum… permisi.", 1800);
    const t = h.people[0]; if (t) setTimeout(() => bubble(t, `Wa'alaikumussalam. Ada perlu apa, ${state.nama}?`, 2600), 1200);
    toast(`${putri ? 'Ruang Ustadzah' : 'Ruang Ustadz'} · dekati guru untuk menyapa`);
  });
}
let lastTrig = null, leaving = false;
function computeHit() {
  const px = player.position.x, pz = player.position.z;
  if (objective && objective.has && objective.zone === zone && Math.hypot(px - objective.x, pz - objective.z) < 2.2) return 'obj';
  if (zone === 'room' || zone === 'masjidin') { for (const s of roomSpots) if (Math.hypot(px - s.x, pz - s.z) < 1.3) return 'spot:' + s.id; return null; }
  if (zone === 'perpus') { for (let i = 0; i < SHELVES.length; i++) { const s = SHELVES[i]; if (Math.hypot(px - (LIB.x + s.x), pz - (LIB.z + s.z)) < 1.7) return 'shelf:' + i; } return null; }
  if (zone !== 'luar') return null;
  for (const d of doorsOut) if (Math.hypot(px - d.x, pz - d.z) < d.r) return d.id;
  for (const c in classDoors) if (c !== state.cls && Math.hypot(px - classDoors[c].x, pz - classDoors[c].z) < 1.4) return 'cls:' + c;
  return null;
}
function checkTriggers() {
  const hit = computeHit();
  if (hit === lastTrig) return;
  lastTrig = hit;
  if (!hit) return;
  if (hit === 'obj') { paused = true; return objective.run(); }
  if (riding) return toast('🏍️ Parkir motor dulu di Parkir Motor (dalam gerbang, kiri)');
  if (hit === 'rumah') return toast(`🏠 Rumah ${state.nama}`);
  if (hit === 'ruangPA' || hit === 'ruangPI') { paused = true; return enterRuang(hit === 'ruangPI'); }
  if (hit === 'lab') { paused = true; return enterLabRoom(); }
  if (hit === 'perpus') { paused = true; return enterLibrary(); }
  if (hit.startsWith('spot:')) return roomAction(hit.slice(5));
  if (hit === 'uks') { paused = true; return enterUKS(); }
  if (hit === 'kepsek') { paused = true; return enterKepsek(); }
  if (hit === 'tu') { paused = true; return enterTU(); }
  if (hit.startsWith('shelf:')) return openShelf(+hit.slice(6));
  if (hit === 'voli' || hit === 'basket') return ['istirahat1', 'santai', 'pulang'].includes(phase) ? (playingSport === hit ? null : joinSport(hit)) : toast(`Lapangan ${hit === 'voli' ? 'voli' : 'basket'}: bisa ikut main saat jam istirahat / waktu santai`);
  if (hit === 'bola') return ['istirahat1', 'santai', 'pulang'].includes(phase) ? (playingBall ? null : joinBall()) : toast('Lapangan: bisa ikut main bola saat jam istirahat / waktu santai');
  if (hit.startsWith('kantin')) return toast('Kantin dibuka saat jam istirahat pertama');
  if (hit.startsWith('masjid')) { if (phase === 'zuhur' || (phase === 'pulang' && objective && /Ashar/.test(objective.text))) return toast('Berwudhu dulu sebelum masuk masjid'); if (hit !== (isPutri(state.cls) ? 'masjidPI' : 'masjidPA')) return toast(`Gunakan Pintu ${side()}`); paused = true; return enterMasjidWalk(); }
  if (hit.startsWith('wudhu')) return toast('Tempat wudhu');
  if (hit.startsWith('cls:')) return toast(`Ini kelas ${hit.slice(4)}. Kelasmu ${state.cls}`);
}

// bel masuk otomatis setelah istirahat bebas
let breakWarned = false;
function checkBreakBell() {
  if (!breakEnd || phase !== 'istirahat1' || performance.now() < breakEnd || paused || zone === 'pesawat') return;
  if (match) { if (!breakWarned) { breakWarned = true; toast('🔔 Istirahat hampir selesai — bel berbunyi setelah pertandinganmu'); } return; }   // tunggu pertandingan selesai
  breakEnd = 0; phase = 'kelas2'; minutes = 10 * 60 + 15; Audio.sfx('bell');
  if (playingSport) leaveSport(); if (playingBall) leaveBall();
  const go = () => setObjective(`🔔 Bel masuk! Kembali ke kelas <b>${state.cls}</b>`, classDoors[state.cls], knockClass);
  modal(`<div class="tag">🔔 Bel masuk</div><div class="big">Istirahat selesai</div><p>Kembali ke kelas ${esc(state.cls)} untuk pelajaran berikutnya.</p>`,
    [['Ayo ke kelas', () => { closeModal(); if (['kantin', 'ruang', 'perpus', 'room', 'masjidin'].includes(zone)) leaveInterior(); go(); }, 'main']]);
}
