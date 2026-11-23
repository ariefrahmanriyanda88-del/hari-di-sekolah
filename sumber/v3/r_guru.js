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
  [`🏢 Gedung ${YYS_NAMA}`, () => { const d = YYS_DOOR(); goOutside(d.x, d.z - 3, 0); }],
];
function doorTo(id, dz, rot) { const d = doorsOut.find((q) => q.id === id); if (d) goOutside(d.x, d.z + dz, rot); }
function guruMenu() {
  if (paused && !$('modal').classList.contains('show')) return;
  modal(`<div class="tag">📋 Menu Guru · ${esc(state.nama)}</div><p class="muted">Kelas uji: <b>${esc(state.cls)}</b> · nilai percobaan tidak masuk rekap</p>`, [
    ['📝 Coba tugas pelajaran', () => guruTugas(), 'main'],
    ['🏫 Masuk kelas uji', () => { closeModal(); guruGo(() => setObjective(`Masuk kelas <b>${state.cls}</b>`, classDoors[state.cls], knockClass)); toast(`Ikuti panah ke kelas ${state.cls}`); }],
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
  modal(`<div class="tag">📝 Coba tugas · ${esc(state.cls)}</div><p class="muted">Pilih pelajaran. Tugas memakai soal dari guru bila sudah diisi di Panel Guru.</p>`,
    list.map((b) => [`${esc(SUBJ[b.s] || b.s)}${QBANK[b.s] ? ' · ' + MODES[modeFor(b)].split(' ')[0] : ''}`, () => {
      if (!QBANK[b.s]) { toast('Belum ada soal untuk pelajaran ini'); return; }
      guruPlay(b);
    }, 'left']).concat([['Kembali', guruMenu, 'small']]));
}
function guruPlay(b) {
  const bank = pickQs(QBANK[b.s], 6), back = () => { closeModal(); toast('Selesai mencoba · nilai tidak dikirim ke rekap'); };
  modal(`<div class="tag">${esc(SUBJ[b.s] || b.s)}</div><div class="big">Pilih jenis permainan</div><p class="muted">Untuk mencoba tampilan tugas seperti yang dilihat murid.</p>`, [
    ['🗺️ Arena petualangan', () => { closeModal(); paused = true; guruGo(() => startQuiz(b, bank, back)); }, 'main'],
    ['⚔️ Battle', () => { closeModal(); paused = true; guruGo(() => startBattle(b, bank, back)); }, 'main'],
    ['🏎️ Balap', () => { closeModal(); paused = true; guruGo(() => startRace(b, bank, back)); }, 'main'],
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
