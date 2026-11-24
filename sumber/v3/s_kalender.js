// =====================================================================
//  KALENDER 2027: tanggal nyata menggantikan "Hari ke-N".
//  Sumber libur nasional & cuti bersama: SKB 3 Menteri No. 1205/3/2 Tahun 2026.
//  1 Ramadan, Idulfitri, dan Iduladha mengikuti Keputusan Menteri Agama (tanggal di sini perkiraan).
//  scene: adegan peringatan yang dimainkan di sekolah. Tanpa scene = hari libur (dilewati).
// =====================================================================
const CAL_START = '2026-11-24', CAL_END = '2027-12-31';
const CAL_EVENTS = [
  // sisa 2026 (SKB 3 Menteri No. 1497/2/5 Tahun 2025) + peringatan sekolah
  ['2026-11-25', 'Hari Guru Nasional', 'sekolah', 'hariGuru'],
  ['2026-12-22', 'Hari Ibu', 'sekolah', 'hariIbu'],
  ['2026-12-24', 'Cuti bersama Natal', 'cuti'],
  ['2026-12-25', 'Hari Raya Natal', 'libur'],
  ['2027-01-01', 'Tahun Baru 2027 Masehi', 'libur'],
  ['2027-01-05', "Isra Mi'raj Nabi Muhammad ﷺ 1448 H", 'libur', 'israMiraj'],
  ['2027-02-05', 'Cuti bersama Tahun Baru Imlek', 'cuti'],
  ['2027-02-06', 'Tahun Baru Imlek 2578 Kongzili', 'libur'],
  ['2027-02-08', '1 Ramadan 1448 H · awal puasa', 'libur', 'ramadan'],
  ['2027-03-08', 'Hari Suci Nyepi (Tahun Baru Saka 1949)', 'libur'],
  ['2027-03-09', 'Cuti bersama Idulfitri', 'cuti'],
  ['2027-03-10', 'Hari Raya Idulfitri 1448 H', 'libur', 'idulfitri'],
  ['2027-03-11', 'Hari Raya Idulfitri 1448 H (hari ke-2)', 'libur'],
  ['2027-03-12', 'Cuti bersama Idulfitri', 'cuti'],
  ['2027-03-15', 'Cuti bersama Idulfitri', 'cuti'],
  ['2027-03-25', 'Cuti bersama Wafat Yesus Kristus', 'cuti'],
  ['2027-03-26', 'Wafat Yesus Kristus', 'libur'],
  ['2027-03-28', 'Kebangkitan Yesus Kristus (Paskah)', 'libur'],
  ['2027-05-01', 'Hari Buruh Internasional', 'libur'],
  ['2027-05-03', 'Peringatan Hari Pendidikan Nasional (2 Mei)', 'sekolah', 'hardiknas'],
  ['2027-05-06', 'Kenaikan Yesus Kristus', 'libur'],
  ['2027-05-17', 'Hari Raya Iduladha 1448 H', 'libur', 'iduladha'],
  ['2027-05-18', 'Cuti bersama Iduladha', 'cuti'],
  ['2027-05-19', 'Cuti bersama Waisak', 'cuti'],
  ['2027-05-20', 'Hari Raya Waisak 2571 BE', 'libur'],
  ['2027-06-01', 'Hari Lahir Pancasila', 'libur', 'pancasila'],
  ['2027-06-06', 'Tahun Baru Islam 1449 H (1 Muharam)', 'libur', 'muharam'],
  ['2027-08-15', 'Maulid Nabi Muhammad ﷺ', 'libur', 'maulid'],
  ['2027-08-17', 'HUT ke-82 Kemerdekaan Republik Indonesia', 'libur', 'agustus'],
  ['2027-10-28', 'Hari Sumpah Pemuda', 'sekolah', 'sumpahPemuda'],
  ['2027-11-10', 'Hari Pahlawan', 'sekolah', 'pahlawan'],
  ['2027-11-25', 'Hari Guru Nasional', 'sekolah', 'hariGuru'],
  ['2027-12-22', 'Hari Ibu', 'sekolah', 'hariIbu'],
  ['2027-12-24', 'Cuti bersama Natal', 'cuti'],
  ['2027-12-25', 'Hari Raya Natal', 'libur'],
  ['2027-12-26', "Isra Mi'raj Nabi Muhammad ﷺ 1449 H", 'libur', 'israMiraj'],
].map(([d, t, k, scene]) => ({ d, t, k, scene }));
const RAMADAN = ['2027-02-08', '2027-03-09'];
const BLN27 = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI7 = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const toD = (s) => new Date(s + 'T00:00:00');
const fromD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => { const d = toD(s); d.setDate(d.getDate() + n); return fromD(d); };
const calEvent = (s) => CAL_EVENTS.find((e) => e.d === s);
const isWeekend = (s) => [0, 6].includes(toD(s).getDay());
const isRamadan = (s = state.tgl) => !!s && s >= RAMADAN[0] && s <= RAMADAN[1];
const tglLabel = (s = state.tgl, long) => { const d = toD(s); return long ? `${HARI7[d.getDay()]}, ${d.getDate()} ${BLN27[d.getMonth()]} ${d.getFullYear()}` : `${HARI7[d.getDay()].slice(0, 3)}, ${d.getDate()} ${BLN27[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; };
// hari yang dimainkan: hari sekolah biasa, atau hari peringatan yang punya adegan
const playable = (s) => { const e = calEvent(s); if (e && e.scene) return true; if (e) return false; return !isWeekend(s); };
function nextPlayDate(s) {
  const lewat = [];
  let n = addDays(s, 1);
  for (let i = 0; i < 400 && !playable(n); i++) { const e = calEvent(n); if (e) lewat.push(`${tglLabel(n)}: ${e.t}`); n = addDays(n, 1); }
  if (n > CAL_END) n = '2026-11-25';
  return { tgl: n, lewat };
}
// tanggal hari ini (WIB) sebagai bawaan; dibatasi rentang kalender
function todayWIB() { const d = new Date(Date.now() + 7 * 3600e3); const s = d.toISOString().slice(0, 10); return s < CAL_START ? CAL_START : s > CAL_END ? CAL_START : s; }
function ensurePlayable() { if (!state.tgl || state.tgl < CAL_START || state.tgl > CAL_END) state.tgl = todayWIB(); if (!playable(state.tgl)) state.tgl = nextPlayDate(state.tgl).tgl; }

// ---------- tampilan kalender (bulan) ----------
let calMonth = 0;
function openCalendar() {
  if (paused && !$('modal').classList.contains('show') && zone !== 'luar') return;
  const d0 = toD(state.tgl || todayWIB()); calMonth = d0.getFullYear() * 12 + d0.getMonth();
  drawCalendar();
}
function drawCalendar() {
  const y = Math.floor(calMonth / 12), m = calMonth % 12, first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;                                   // Senin di kolom pertama
  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<div class="cd e"></div>';
  for (let d = 1; d <= days; d++) {
    const s = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, e = calEvent(s), wd = new Date(y, m, d).getDay();
    const cls = ['cd', s < CAL_START ? 'e' : '', e ? (e.scene ? 'ev' : 'lb') : (wd === 0 ? 'lb' : ''), s === state.tgl ? 'now' : '', isRamadan(s) ? 'rm' : ''].join(' ');
    cells += `<button type="button" class="${cls}" data-d="${s}">${d}${e && e.scene ? '<i>★</i>' : ''}</button>`;
  }
  const list = CAL_EVENTS.filter((e) => toD(e.d).getMonth() === m && toD(e.d).getFullYear() === y).map((e) => `<div class="cl ${e.scene ? 'ev' : 'lb'}" data-d="${e.d}"><b>${toD(e.d).getDate()}</b> ${esc(e.t)}${e.scene ? ' <span>▶ ada adegan</span>' : e.k === 'cuti' ? ' <small>(cuti bersama)</small>' : ''}</div>`).join('')
    || '<p class="muted">Tidak ada hari libur di bulan ini.</p>';
  modal(`<div class="tag">📅 Kalender · ${tglLabel(state.tgl, true)}</div>
    <div class="calhead"><button type="button" id="calp">‹</button><b>${BLN27[m]} ${y}</b><button type="button" id="caln">›</button></div>
    <div class="calgrid">${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((h) => `<div class="ch">${h}</div>`).join('')}${cells}</div>
    <div class="callist">${list}</div>
    <p class="muted" style="font-size:11px">★ hari peringatan dengan adegan · merah: libur · hijau muda: bulan Ramadan. Libur nasional sesuai SKB 3 Menteri 2026 & 2027; awal Ramadan, Idulfitri, dan Iduladha menunggu penetapan Kementerian Agama.</p>`,
    [['Tutup', closeModal, 'small']]);
  const lo = 2026 * 12 + 10, hi = 2027 * 12 + 11;                 // November 2026 – Desember 2027
  $('calp').onclick = () => { calMonth = calMonth <= lo ? hi : calMonth - 1; drawCalendar(); };
  $('caln').onclick = () => { calMonth = calMonth >= hi ? lo : calMonth + 1; drawCalendar(); };
  document.querySelectorAll('.calgrid button.cd, .callist .cl').forEach((b) => (b.onclick = () => calDay(b.dataset.d)));
}
function calDay(s) {
  const e = calEvent(s), canPlay = playable(s) && s >= CAL_START;
  modal(`<div class="tag">📅 ${tglLabel(s, true)}</div><div class="big">${e ? esc(e.t) : isWeekend(s) ? 'Akhir pekan' : 'Hari sekolah biasa'}</div>
    <p>${e && e.scene ? EVENT_INFO[e.scene] || 'Ada kegiatan peringatan di sekolah.' : e ? 'Hari libur: sekolah tidak ada kegiatan.' : isWeekend(s) ? 'Sekolah libur.' : isRamadan(s) ? 'Sekolah seperti biasa di bulan Ramadan (berpuasa, tidak ada MBG).' : 'Jadwal pelajaran seperti biasa.'}</p>`,
    (canPlay ? [[e && e.scene ? '▶ Mainkan adegan peringatan ini' : '▶ Lompat ke tanggal ini', () => { closeModal(); jumpToDate(s); }, 'main']] : []).concat([['‹ Kembali ke kalender', drawCalendar], ['Tutup', closeModal, 'small']]));
}
function jumpToDate(s) {
  state.tgl = s; save();
  cerePeople.forEach((p) => scene.remove(p)); cerePeople = []; acaraClear();
  const f = $('fade'); f.querySelector('span').textContent = `📅 ${tglLabel(s, true)}`; f.classList.add('show'); paused = true;
  setTimeout(() => { if (GURU) { const e = calEvent(s); if (e && e.scene) startEventDay(e); else startGuruDay(); } else startDay(); }, 800);
  setTimeout(() => { f.classList.remove('show'); paused = false; }, 1900);
}
