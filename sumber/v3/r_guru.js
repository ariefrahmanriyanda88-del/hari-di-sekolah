// =====================================================================
//  MODE GURU: guru masuk dari Panel Guru, tampil sebagai ustadz/ustadzah dengan namanya,
//  bebas berkeliling, mencoba tugas tiap pelajaran (nilai TIDAK masuk rekap), dan ke Yayasan.
// =====================================================================
function guruSapaan() { return GURU.jk === 'P' ? 'Ustadzah' : 'Ustadz'; }
function guruNama(n) { n = String(n || '').trim(); if (!n) return guruSapaan(); return /^ustadz(ah)?\b/i.test(n) ? n : `${guruSapaan()} ${n}`; }
function startGuruDay() {
  today = DATA.sched[state.cls][dayIdx()].blocks;
  dayDone.clear(); phase = 'guru'; minutes = 7 * 60 + 30; dayScore = 0;
  if (crowd.length) afterMasjid(); else walkers.forEach((n) => { n.visible = true; n.goingIn = false; n.path = null; });
  objective = null; hasWudhu = false; savedObj = null; upacaraDone = true; lateDone = true; setGate(false);
  homeView && homeView(false);
  goOutside(0, 50, Math.PI);
  nameTag(player, state.nama, 0.5);
  setObjective('Mode Guru: silakan berkeliling. Buka <b>📋 Menu Guru</b> untuk mencoba tugas, pindah cepat, atau keperluan ke Yayasan', null, null);
  setTimeout(() => say([{ p: player, t: `Bismillah. Hari ini saya, ${state.nama}, berkeliling memeriksa sekolah.`, e: 'senang' }]), 900);
  $('gurubtn').style.display = '';
}
const GURU_PLACES = [
  ['🚪 Gerbang sekolah', () => goOutside(0, 50, Math.PI)],
  ['🧑‍🏫 Ruang Ustadz', () => doorTo('ruangPA', 2.5, 0)],
  ['🧕 Ruang Ustadzah', () => doorTo('ruangPI', 2.5, 0)],
  ['🏫 Kantor Kepala Sekolah', () => doorTo('kepsek', 2.5, 0)],
  ['💳 TU & Bendahara', () => doorTo('tu', 2.5, 0)],
  ['📚 Perpustakaan', () => doorTo('perpus', 2.5, 0)],
  ['🖥️ Lab Komputer', () => doorTo('lab', 2.5, 0)],
  ['🩺 UKS', () => doorTo('uks', 2.5, 0)],
  ['🕌 Masjid', () => doorTo(meP() ? 'masjidPI' : 'masjidPA', 2.5, 0)],
  ['💧 Tempat wudhu', () => doorTo(meP() ? 'wudhuPI' : 'wudhuPA', 0, 0)],
  ['⚽ Lapangan', () => goOutside(-30, -80, Math.PI)],
  ['🛒 Koperasi Sekolah', () => doorTo('koperasi', 2.5, 0)],
  [`🏢 Gedung ${YYS_NAMA}`, () => { const d = YYS_DOOR(); goOutside(d.x, d.z - 3, 0); }],
];
function doorTo(id, dz, rot) { const d = doorsOut.find((q) => q.id === id); if (d) goOutside(d.x, d.z + dz, rot); }
function guruMenu() {
  if (paused && !$('modal').classList.contains('show')) return;
  modal(`<div class="tag">📋 Menu Guru · ${esc(state.nama)}</div><p class="muted">Kelas uji: <b>${esc(state.cls)}</b> · nilai percobaan tidak masuk rekap</p>`, [
    ['🔍 Cek game tugas', () => guruTugas(), 'main'],
    ['🏫 Ke kelas (amati / mengajar)', () => { closeModal(); guruGo(() => setObjective(`Ke kelas <b>${state.cls}</b>: amati kegiatan belajar atau masuk mengajar`, classDoors[state.cls], knockClass)); toast(`Ikuti panah ke kelas ${state.cls}`); }],
    ['🗺️ Pindah cepat', () => guruPindah()],
    [`🏢 Keperluan ke ${YYS_NAMA}`, () => guruYayasan()],
    ['🔄 Ganti kelas uji', () => guruKelas()],
    ['Tutup', closeModal, 'small'],
  ]);
}
function guruGo(fn) { if (['kantin', 'ruang', 'perpus', 'room', 'masjidin'].includes(zone)) { leaveInterior(); setTimeout(fn, 650); } else fn(); }
function guruTugas() {
  const seen = new Set(), list = [];
  DATA.sched[state.cls].forEach((d) => d.blocks.forEach((b) => { if (b.s && !seen.has(b.s)) { seen.add(b.s); list.push(b); } }));
  modal(`<div class="tag">🔍 Cek game tugas · ${esc(state.cls)}</div><p class="muted">Pilih pelajaran untuk melihat game tugas yang akan dimainkan murid. Guru hanya mengecek, tidak mengerjakan; tidak ada nilai.</p>`,
    list.map((b) => [`${esc(SUBJ[b.s] || b.s)}${QBANK[b.s] ? ' · ' + MODES[modeFor(b)].split(' ')[0] : ''}`, () => {
      if (!QBANK[b.s]) { toast('Belum ada soal untuk pelajaran ini'); return; }
      guruPlay(b);
    }, 'left']).concat([['Kembali', guruMenu, 'small']]));
}
function guruPlay(b) {
  const bank = pickQs(QBANK[b.s], 6), back = () => { closeModal(); toast('Selesai mengecek game tugas · tidak ada nilai'); };
  const nSoal = QBANK[b.s].length;
  modal(`<div class="tag">🔍 Cek game · ${esc(SUBJ[b.s] || b.s)}</div><div class="big">${nSoal} soal tersedia</div><p class="muted">Pilih jenis game untuk melihat tampilannya seperti yang dimainkan murid. Ini hanya pengecekan, bukan pengerjaan tugas.</p>`, [
    ['🗺️ Arena petualangan', () => { closeModal(); paused = true; guruGo(() => startQuiz(b, bank, back)); }, 'main'],
    ['⚔️ Battle', () => { closeModal(); paused = true; guruGo(() => startBattle(b, bank, back)); }, 'main'],
    ['🏎️ Balap', () => { closeModal(); paused = true; guruGo(() => startRace(b, bank, back)); }, 'main'],
    ['🌳 Petualangan', () => { closeModal(); paused = true; guruGo(() => startAdventure(b, bank, back)); }, 'main'],
    ['Kembali', guruTugas, 'small'],
  ]);
}
function guruPindah() {
  modal(`<div class="tag">🗺️ Pindah cepat</div>`, GURU_PLACES.map(([t, f]) => [t, () => { closeModal(); paused = true; fade(t.replace(/^\S+\s/, ''), 500, () => { f(); paused = false; }); }, 'left']).concat([['Kembali', guruMenu, 'small']]));
}
function guruYayasan() {
  modal(`<div class="tag">🏢 Keperluan ke ${YYS_NAMA}</div><p class="muted">Gedung yayasan ada di seberang jalan, berhadapan dengan sekolah.</p>`,
    KEPERLUAN.map((k) => [k.t, () => { closeModal(); startKeperluan(k); }, 'left']).concat([['Kembali', guruMenu, 'small']]));
}
function guruKelas() {
  modal(`<div class="tag">🔄 Ganti kelas uji</div>`, DATA.classes.map((c) => [c + (c === state.cls ? ' ✓' : ''), async () => {
    closeModal(); state.cls = c; today = DATA.sched[c][dayIdx()].blocks; hud();
    if (window.HDS && window.HDS.masukGuru && !SCHOOL.demo) { try { const r = await window.HDS.masukGuru(c); Object.assign(QBANK, r.bank); ONLINE_MODE = r.mode; addOnlineBooks(r.books); } catch (e) {} }
    toast(`Kelas uji: ${c}`);
  }, 'left']).concat([['Kembali', guruMenu, 'small']]));
}

// ---------- guru di kelas: mengamati kegiatan belajar atau masuk mengajar (tidak duduk di kursi siswa) ----------
let guruInClass = null;
function guruKnock() {
  const first = lessons().find((b) => b.s) || today.find((b) => b.s);
  const g = first ? teacherInfo(first.g[0]).p : '';
  modal(`<div class="tag">Pintu kelas ${esc(state.cls)}</div><p>${g ? `Sedang pelajaran <b>${esc(SUBJ[first.s] || first.s)}</b> bersama <b>${esc(g)}</b>.` : 'Kelas sedang belajar.'}</p>`, [
    ['👀 Amati kegiatan belajar', () => { closeModal(); paused = true; guruEnterClass('amati', first); }, 'main'],
    ['🧑‍🏫 Masuk mengajar', () => { closeModal(); paused = true; guruEnterClass('ajar', first); }, 'main'],
    ['↩️ Tidak jadi', () => { closeModal(); stepBackFromDoor(); }, 'small'],
  ]);
}
function guruEnterClass(mode, first) {
  buildClassmates(); setClassCam();
  setRoomTeacher(first ? first.g[0] : '');
  guruInClass = { mode, first };
  Audio.sfx('knock'); bubble(player, "Assalamu'alaikum… permisi.", 1600);
  fade('Masuk kelas…', 750, () => {
    zone = 'kelas'; $('modal').classList.add('low'); hud();
    sitPose(player, false);
    player.position.set(5.6, 0, 6.3).add(ROOM); player.rotation.y = Math.PI;
    camera.position.copy(classCam); camera.lookAt(classLook);
    if (mode === 'amati') {
      bubble(roomTeacher, `Wa'alaikumussalam. Silakan, ${state.nama}.`, 2200);
      later(500, () => walkTo([[6.3, 4.6], [6.3, -2], [6.0, -5.9]], () => {     // berdiri di belakang kelas, mengamati
        player.rotation.y = 0;
        guruTeachLoop(); later(800, guruClassMenu);
      }));
    } else {
      if (roomTeacher) { bubble(roomTeacher, `Wa'alaikumussalam. Silakan, ${state.nama}, kelasnya saya serahkan.`, 2200); later(2300, () => { room.remove(roomTeacher); roomTeacher = null; }); }
      later(600, () => walkTo([[4.6, 5.6], [-2.2, 5.6]], () => {                   // berdiri di depan kelas
        player.rotation.y = Math.PI;
        later(300, () => bubble(ketua(), 'Berdiri… beri salam!', 1700));
        later(1100, () => classmates.forEach((m) => sitPose(m, false)));
        later(1900, () => classmates.slice(1, 5).forEach((m) => bubble(m, `Assalamu'alaikum, ${guruSapaan()}!`, 1700)));
        later(3600, () => bubble(player, "Wa'alaikumussalam warahmatullahi wabarakatuh. Silakan duduk.", 2200));
        later(4800, () => { classmates.forEach((m) => sitPose(m, true)); guruClassMenu(); });
      }));
    }
  });
}
const AJAR_GURU = ['Coba perhatikan papan tulis.', 'Siapa yang bisa menjawab?', 'Bagus! Jazakallahu khairan.', 'Catat poin pentingnya, ya.', 'Ada yang belum paham?'];
function guruTeachLoop() {
  const tick = () => {
    if (zone !== 'kelas' || !guruInClass || guruInClass.mode !== 'amati') return;
    if (roomTeacher) bubble(roomTeacher, pick(AJAR_GURU), 2000);
    const m = pick(classmates); if (m && Math.random() < 0.6) later(1200, () => { playAnim(m, 'lambai', 1.2); bubble(m, pick(['Saya, Ustadz!', 'Saya mau jawab.', 'Sudah paham, Ustadz.']), 1500); });
    later(4200, tick);
  };
  later(1500, tick);
}
function guruClassMenu() {
  const g = guruInClass || { mode: 'amati' }, b = g.first;
  const lesson = b ? (SUBJ[b.s] || b.s) : 'pelajaran';
  const common = [
    ['🔍 Cek game tugas pelajaran ini', () => { if (!b || !QBANK[b.s]) { toast('Belum ada soal untuk pelajaran ini'); return; } closeModal(); guruExitClass(() => guruPlay(b)); }],
    ['🚪 Keluar kelas', () => { closeModal(); g.mode === 'ajar' ? guruTutup() : guruExitClass(); }, 'small'],
  ];
  if (g.mode === 'amati') return modal(`<div class="tag">👀 Mengamati · ${esc(state.cls)}</div><p><b>${esc(lesson)}</b>${roomTeacher ? ' bersama ' + esc(roomTeacher.info.p) : ''}. Anda berdiri di belakang kelas.</p>`, [
    ['🗒️ Catat pengamatan', () => { closeModal(); toast(`🗒️ Catatan: ${pick(['siswa aktif bertanya', 'kelas tertib dan fokus', 'beberapa siswa perlu bimbingan', 'guru menjelaskan dengan jelas'])}`); later(600, guruClassMenu); }],
    ...common]);
  modal(`<div class="tag">🧑‍🏫 Mengajar · ${esc(state.cls)}</div><p>Anda mengajar <b>${esc(lesson)}</b> di depan kelas.</p>`, [
    ['📖 Jelaskan materi', () => { closeModal(); bubble(player, `Hari ini kita belajar ${lesson}. Perhatikan baik-baik, ya.`, 2400); later(2600, () => { const m = pick(classmates); bubble(m, 'Baik, Ustadz!', 1500); }); later(3400, guruClassMenu); }],
    ['🙋 Tanya jawab', () => { closeModal(); const m = pick(classmates); playAnim(m, 'lambai', 1.3); bubble(m, 'Ustadz, saya mau bertanya…', 1800); later(2000, () => bubble(player, 'Silakan, pertanyaan yang bagus!', 1800)); later(3200, guruClassMenu); }],
    ['💬 Beri nasihat', () => { closeModal(); bubble(player, pick(['Jangan lupa murajaah hafalan di rumah.', 'Hormati orang tua dan guru, ya.', 'Jaga sholat lima waktu tepat waktu.']), 2600); later(2800, () => classmates.slice(0, 3).forEach((m) => bubble(m, 'InsyaAllah, Ustadz!', 1500))); later(3600, guruClassMenu); }],
    ...common]);
}
function guruTutup() {
  bubble(player, 'Kita tutup dengan doa kafaratul majelis. Subhanakallahumma wa bihamdika…', 2600);
  later(2800, () => { classmates.slice(1, 5).forEach((m) => bubble(m, "Wa'alaikumussalam, Ustadz!", 1600)); });
  later(3600, () => guruExitClass());
}
function guruExitClass(done) { guruInClass = null; exitClass(() => { stepBackFromDoor(); done && done(); }); }

// ---------- meja guru sendiri di ruang ustadz/ustadzah ----------
let guruPrevObj = null;
function guruDesk(h) {
  const t = Object.keys(h.desks).find((k) => teacherInfo(k).p.toLowerCase() === String(state.nama).toLowerCase());
  return t ? h.desks[t] : null;
}
function guruDeskObj(h) {
  const d = guruDesk(h); if (!d) return;
  if (!guruPrevObj && objective && !/mejamu/.test(objective.text)) guruPrevObj = { ...objective };
  setObjective('Duduk di <b>mejamu</b> (bernama ' + esc(state.nama) + ')', { x: d.x, z: d.z }, () => guruSit(h, d), 'ruang');
}
function guruSit(h, d) {
  player.position.set(d.x, 0, d.z); player.rotation.y = 0; sitPose(player, true);
  if (objective) objective.has = false;
  const stand = () => { closeModal(); sitPose(player, false); player.position.z += 1.6; player.rotation.y = Math.PI; paused = false; setTimeout(() => guruDeskObj(h), 1200); };
  modal(`<div class="tag">🪑 Meja ${esc(state.nama)}</div><p>Anda duduk di meja kerja sendiri.</p>`, [
    ['🔍 Cek game tugas', () => { stand(); setTimeout(guruTugas, 300); }, 'main'],
    ['📋 Menu Guru', () => { stand(); setTimeout(guruMenu, 300); }],
    ['☕ Istirahat sejenak', () => { closeModal(); bubble(player, 'Alhamdulillah, istirahat sebentar.', 2000); setTimeout(() => guruSit(h, d), 2600); }],
    ['Berdiri', stand, 'small'],
  ]);
  $('modal').classList.add('low');
}

// ---------- percakapan guru (berbeda dengan murid): sesama guru, satpam, murid, petugas kantin ----------
const gAntum = () => (meP() ? 'anti' : 'antum');
function guruGreetOpen(n) {
  const nm = state.nama, sp = guruSapaan();
  if (n.role === 'yys') { n.q = Math.floor(Math.random() * YYS_Q.length); return YYS_Q[n.q].t(nm); }   // pengurus yayasan bertanya kepada guru
  if (n.role === 'kepsek') return pick([`Silakan masuk, ${nm}.`, `${nm}, ahlan. Ada yang ingin dikoordinasikan?`]);
  if (n.role === 'tu') return pick([`Silakan, ${nm}. Ada keperluan administrasi?`, `Ahlan, ${nm}. Mau mengambil atau menyerahkan berkas?`]);
  if (n.kind === 'guru') return pick([`Eh, ${nm}. Ahlan wa sahlan.`, `${nm}! Apa kabar, ${gAntum()}?`, `Mari, ${nm}. Sudah selesai mengajar?`]);
  if (n.kind === 'satpam') return pick([`Pagi, ${sp}. Silakan.`, `${nm}, Ustadz-Ustadzah sudah banyak yang datang.`]);
  if (n.kind === 'kantin') return `Silakan, ${nm}. Mau pesan apa?`;
  return pick([`Assalamu'alaikum, ${sp}!`, `Selamat pagi, ${sp}.`, `${sp}… mau ke kelas kami?`]);
}
function guruGreetOptions(n) {
  const sama = !!n.putri === meP();
  const salam = sama ? [`🤝 Bersalaman: "Assalamu'alaikum, ${n.name}. Apa kabar?"`, 'gKabar'] : [`✋ Salam, tangan di dada: "Assalamu'alaikum, ${n.name}"`, 'gDada'];
  if (n.role === 'yys') return [...YYS_Q[n.q || 0].a.map((t, i) => [`💬 "${t}"`, 'yJawab' + i]), salam, ['🤲 "Mohon nasihat untuk kami para guru, Ustadz."', 'yNasihat']];
  if (n.role === 'kepsek') return [salam, ['📋 "Izin melaporkan kegiatan hari ini."', 'kLapor'], ['🗓️ "Kapan jadwal rapat dewan guru berikutnya?"', 'kRapat']];
  if (n.role === 'tu') return [salam, ['🗂️ "Apakah ada berkas yang perlu saya lengkapi?"', 'tBerkas'], ['🧾 "Izin menanyakan jadwal pencairan honor kegiatan."', 'tHonor']];
  if (n.kind === 'guru') return [
    sama ? [`🤝 Bersalaman: "Assalamu'alaikum, ${n.name}. Apa kabar?"`, 'gKabar'] : [`✋ Salam, tangan di dada: "Assalamu'alaikum, ${n.name}"`, 'gDada'],
    ['☕ "Sudah istirahat, ' + (n.putri ? 'Ustadzah' : 'Ustadz') + '? Mari ngopi sebentar."', 'gNgopi'],
    ['🧑‍🏫 "Bagaimana pengalaman antum menangani kelas yang ramai?"', 'gBerbagi'],
    ['🕌 "Nanti Zuhur kita berjamaah, ya."', 'gZuhur'],
    ['📋 "Sudah siapkan laporan untuk yayasan?"', 'gLapor'],
  ];
  if (n.kind === 'satpam') return [[`👋 "Assalamu'alaikum, ${n.name}. Bagaimana, aman?"`, 'gAman'], ['🙏 "Terima kasih sudah menjaga sekolah."', 'gTerima']];
  if (n.kind === 'kantin') return [['👋 "Assalamu\'alaikum, Bu. Ramai hari ini?"', 'gKantin']];
  return [['👋 "Wa\'alaikumussalam, Nak. Sudah sarapan?"', 'mSarapan'], ['📚 "Tugasnya sudah dikerjakan?"', 'mTugas'], ['💬 "Jangan lupa murajaah hafalan, ya."', 'mNasihat']];
}
function guruDoGreet(n, act) {
  if (!sameSex(n, player)) {
    const dx = player.position.x - n.position.x, dz = player.position.z - n.position.z, d = Math.hypot(dx, dz) || 1;
    if (d < 2.4) { const nx = n.position.x + dx / d * 2.4, nz = n.position.z + dz / d * 2.4; if (!blocked(nx, nz)) player.position.set(nx, player.position.y, nz); }
  }
  faceTo(player, n); faceTo(n, player); n.talk = 3.5; player.busy = 3.2;
  if (n.fixed && n.homeRot !== undefined) setTimeout(() => { n.rotation.y = n.homeRot; }, 3600);
  const nm = state.nama, sp = guruSapaan(), an = gAntum();
  const mine = {
    gKabar: `Assalamu'alaikum, ${n.name}. Apa kabar?`, gDada: `Assalamu'alaikum, ${n.name}.`, gKelas: `${n.name}, bagaimana kelas hari ini?`,
    gZuhur: 'Nanti Zuhur kita berjamaah, ya.', gNgopi: `Sudah istirahat, ${n.sapaan}? Mari ngopi sebentar.`, gBerbagi: `${n.name}, bagaimana pengalaman ${an} menangani kelas yang ramai?`,
    yNasihat: 'Mohon nasihat untuk kami para guru, Ustadz.', yJawab0: (YYS_Q[n.q || 0] || YYS_Q[0]).a[0], yJawab1: (YYS_Q[n.q || 0] || YYS_Q[0]).a[1],
    kLapor: 'Izin melaporkan kegiatan hari ini.', kRapat: 'Kapan jadwal rapat dewan guru berikutnya?', tBerkas: 'Apakah ada berkas yang perlu saya lengkapi?', tHonor: 'Izin menanyakan jadwal pencairan honor kegiatan.', gLapor: 'Sudah siapkan laporan untuk yayasan?', gAman: `Assalamu'alaikum, ${n.name}. Bagaimana, aman?`,
    gTerima: 'Terima kasih sudah menjaga sekolah.', gKantin: "Assalamu'alaikum, Bu. Ramai hari ini?",
    mSarapan: "Wa'alaikumussalam, Nak. Sudah sarapan?", mTugas: 'Tugasnya sudah dikerjakan?', mNasihat: 'Jangan lupa murajaah hafalan, ya.',
  }[act];
  const reply = {
    gKabar: [`Wa'alaikumussalam warahmatullah. Alhamdulillah, khair. ${an[0].toUpperCase() + an.slice(1)} bagaimana, ${nm}?`, `Wa'alaikumussalam. Alhamdulillah sehat, ${nm}. Semoga dimudahkan hari ini.`],
    gDada: [`Wa'alaikumussalam warahmatullah, ${nm}.`],
    gKelas: ['Alhamdulillah, anak-anak semangat. Ada beberapa yang masih perlu dibimbing.', 'Lancar. Tadi materi baru, anak-anak aktif bertanya.', 'Agak ramai, tapi alhamdulillah tugasnya selesai semua.'],
    gZuhur: ['InsyaAllah. Sekalian kita pantau anak-anak berwudhu.', 'Siap, nanti kita bertemu di masjid.'],
    gNgopi: ['Boleh, sebentar saja. Setelah ini saya masuk kelas lagi.', 'Jazakallahu khairan, nanti saja setelah Zuhur, ya.'],
    gBerbagi: ['Saya biasanya mulai dengan murajaah singkat dan tanya jawab, anak-anak jadi lebih fokus.', 'Kuncinya sabar dan konsisten. Beri pujian untuk yang tertib, itu ampuh.'],
    yNasihat: ['Luruskan niat. Mengajar adalah ibadah; setiap ilmu yang antum ajarkan menjadi amal jariyah.', 'Jadilah teladan sebelum menasihati. Anak-anak lebih banyak meniru daripada mendengar.', 'Sabar dan kasih sayang kepada murid, serta jaga kekompakan sesama guru. Itu kunci keberkahan sekolah.', 'Terus belajar dan perbaiki cara mengajar. Guru yang berhenti belajar, berhenti pula mengajar dengan baik.'],
    yJawab0: [(YYS_Q[n.q || 0] || YYS_Q[0]).r[0]], yJawab1: [(YYS_Q[n.q || 0] || YYS_Q[0]).r[1]],
    kLapor: ['Baik, silakan. Terima kasih atas laporannya, nanti kita bahas di rapat.', 'Jazakallahu khairan. Laporannya dikirim juga ke Waka Kurikulum, ya.'],
    kRapat: ['InsyaAllah hari Kamis setelah Ashar.', 'Nanti diumumkan di grup dewan guru.'],
    tBerkas: ['Tinggal fotokopi ijazah terbaru untuk arsip kepegawaian.', 'Sudah lengkap, jazakallahu khairan.'],
    tHonor: ['InsyaAllah akhir pekan ini, setelah laporan kegiatannya diverifikasi.', 'Masih menunggu tanda tangan Kepala Sekolah, insyaAllah segera.'],
    gLapor: ['Sedang saya rapikan, insyaAllah besok saya bawa ke yayasan.', 'Sudah, kemarin saya serahkan ke Bidang Pendidikan.'],
    gAman: [`Alhamdulillah aman, ${sp}. Tadi pagi jalan ramai, tapi tertib.`],
    gTerima: [`Sama-sama, ${sp}. Sudah tugas kami.`],
    gKantin: [`Alhamdulillah ramai, ${sp}. Mau dibungkuskan sesuatu?`],
    mSarapan: [`Sudah, ${sp}. Alhamdulillah!`, `Belum, ${sp}… hehe.`],
    mTugas: [`Sudah, ${sp}!`, `Sedikit lagi, ${sp}.`],
    mNasihat: [`InsyaAllah, ${sp}!`, `Baik, ${sp}. Terima kasih.`],
  }[act];
  if (act === 'gKabar' && n.role === 'yys') reply.splice(0, reply.length, `Wa'alaikumussalam warahmatullah. Alhamdulillah baik, ${nm}. Bagaimana kabar ${an} dan keluarga?`);
  if (act === 'gKabar') { playAnim(player, 'beritangan', 1.4); playAnim(n, 'beritangan', 1.4); }
  else if (act === 'gDada') { playAnim(player, 'dada', 1.4); setTimeout(() => playAnim(n, 'dada', 1.4), 400); }
  else { playAnim(player, 'lambai', 1.1); setTimeout(() => playAnim(n, n.kind === 'siswa' ? 'dada' : 'lambai', 1.1), 450); }
  Audio.sfx('greet');
  say([{ p: player, t: mine }, { p: n, t: pick(reply), e: 'senang' }], () => { if (n.fixed && n.homeRot !== undefined) n.rotation.y = n.homeRot; });
}

// pertanyaan dari pengurus yayasan kepada guru: [pertanyaan, 2 jawaban guru, 2 tanggapan pengurus]
const YYS_Q = [
  { t: (nm) => `Ahlan, ${nm}. Bagaimana mengajar di sekolah? Lancar?`, a: ['Alhamdulillah lancar, Ustadz. Anak-anak semangat belajar.', 'Ada tantangan, Ustadz, tapi insyaAllah bisa kami atasi bersama.'],
    r: ['Alhamdulillah. Pertahankan, dan terus berinovasi dalam mengajar.', 'Wajar ada tantangan. Sampaikan ke Bidang Pendidikan, kami siap membantu.'] },
  { t: (nm) => `${nm}, bagaimana hafalan Al-Qur'an anak-anak sekarang?`, a: ['Alhamdulillah meningkat, Ustadz. Murajaah pagi sangat membantu.', 'Sebagian masih perlu dorongan, Ustadz.'],
    r: ['MasyaAllah, baarakallahu fiikum. Itu program unggulan kita.', 'Dampingi dengan sabar. Libatkan juga orang tua di rumah.'] },
  { t: (nm) => `Apa yang perlu yayasan bantu untuk sekolah, ${nm}?`, a: ['Pelatihan guru tentang media pembelajaran, Ustadz.', 'Perbaikan beberapa sarana kelas, Ustadz.'],
    r: ['Usulan yang baik. InsyaAllah kami jadwalkan bersama Bidang Pendidikan.', 'Baik, nanti Biro Sarpras kami minta meninjau ke sekolah.'] },
  { t: (nm) => `${nm}, bagaimana adab dan akhlak anak-anak di sekolah?`, a: ['Alhamdulillah, makin baik, Ustadz. Mereka terbiasa salam dan antre.', 'Masih ada yang perlu dibina, Ustadz.'],
    r: ['Alhamdulillah. Adab sebelum ilmu, itu yang kita tanamkan.', 'Teruskan pembinaan dengan lembut. Biro Konseling siap membantu.'] },
  { t: (nm) => `Bagaimana kabar ${nm} dan keluarga? Sehat semua?`, a: ['Alhamdulillah sehat semua, Ustadz.', 'Alhamdulillah, mohon doanya, Ustadz.'],
    r: ['Alhamdulillah. Semoga Allah senantiasa menjaga antum sekeluarga.', 'Kami doakan, semoga Allah beri kesehatan dan keberkahan.'] },
];
