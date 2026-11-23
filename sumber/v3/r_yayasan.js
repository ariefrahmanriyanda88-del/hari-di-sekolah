// =====================================================================
//  GEDUNG YAYASAN (di seberang jalan, di luar kawasan sekolah)
//  Lantai 1: lobi · ruang Pembina & Pengawas · ruang Ketua Yayasan (meja rapat)
//            · ruang Sekretaris & Bendahara · ruang Bidang & Biro (ustadz) · ruang Biro (ustadzah)
//  Lantai 2: Balai Pertemuan
// =====================================================================
const YYS_NAMA = SCHOOL.demo ? 'Yayasan Nusantara' : 'Yayasan Alfida';
// [panggilan, jabatan, L/P, model, ruang, x, z(kursi), arah: 1 = menghadap +z, -1 = menghadap -z]
const YYS_STAFF = [
  ['Ustadz Hamdani', 'Ketua Pembina Yayasan', 'L', 1, 'A', -14.2, -7.9, 1],
  ['Ustadz Adrizal', 'Pembina Yayasan', 'L', 2, 'A', -12.0, -7.9, 1],
  ['Ustadz Tusman', 'Ketua Pengawas Yayasan', 'L', 3, 'A', -9.8, -7.9, 1],
  ['Ustadz Sutrisno', 'Ketua ' + YYS_NAMA, 'L', 4, 'B', -0.4, -8.4, 1],
  ['Ustadz Muhyiddin', 'Sekretaris Yayasan', 'L', 5, 'C', 3.9, -7.9, 1],
  ['Ustadz Zainal', 'Bendahara Yayasan', 'L', 1, 'C', 7.1, -7.9, 1],
  ['Ustadz Winarko', 'Kabid Kepegawaian', 'L', 2, 'E', -14.3, 8.6, -1],
  ['Ustadz Ngationo', 'Kabid Pendidikan', 'L', 3, 'E', -11.8, 8.6, -1],
  ['Ustadz Hamzah', 'Biro PAI & BPI', 'L', 4, 'E', -9.3, 8.6, -1],
  ['Ustadz Gunirman', 'Biro Mutu', 'L', 5, 'E', -13.1, 5.2, -1],
  ['Ustadz Herizal', 'Biro Sarpras', 'L', 1, 'E', -10.3, 5.2, -1],
  ['Ustadzah Meriana', 'Biro Mutu', 'P', 2, 'F', 10.4, 7.8, -1],
  ['Ustadzah Desi', 'Biro Konseling', 'P', 3, 'F', 13.6, 7.8, -1],
];
if (SCHOOL.demo) ['Ustadz Hasan', 'Ustadz Faisal', 'Ustadz Usman', 'Ustadz Rasyid', 'Ustadz Ilyas', 'Ustadz Arifin', 'Ustadz Darwis', 'Ustadz Malik', 'Ustadz Yahya', 'Ustadz Soleh', 'Ustadz Anwar', 'Ustadzah Maryam', 'Ustadzah Halimah']
  .forEach((p, i) => (YYS_STAFF[i][0] = p));
const YYS_BY = (p) => YYS_STAFF.find((s) => s[0] === p);

// ---------- bangunan luar: seberang jalan, berhadapan dengan sekolah ----------
const YYS_OUT = { x1: 6, z1: 79, x2: 40, z2: 96 };
{
  const { x1, z1, x2, z2 } = YYS_OUT, cx = (x1 + x2) / 2;
  plane(x1 - 2, 75, x2 + 2, z1, 0xcfc8bb, 0.045);                                   // halaman berpaving
  const b = building(x1, z1, x2, z2, 7.4, 0xf4efe4, 0x2f6b4a);
  windowBand(b, 'N', 2); windowBand(b, 'E', 2); windowBand(b, 'W', 2);
  box(cx, 3.55, z1 - 0.2, x2 - x1 + 0.4, 0.25, 0.5, 0xe5dccb, false);              // garis lantai 2
  box(cx, 1.45, z1 - 0.08, 4.4, 2.9, 0.3, 0x2f6b4a, false);                         // kusen pintu utama
  door(cx - 1, z1 - 0.12, 'N', 0x6b4a2b); door(cx + 1, z1 - 0.12, 'N', 0x6b4a2b);
  box(cx, 3.1, z1 - 1.6, 6, 0.25, 3.2, 0x2f6b4a);                                   // kanopi
  [-2.8, 2.8].forEach((dx) => box(cx + dx, 1.5, z1 - 3, 0.25, 3, 0.25, 0xe5dccb));
  box(cx, 6.3, z1 - 0.1, 15, 1.2, 0.2, 0x2f6b4a, false);                            // papan nama
  label(`🏢 Gedung ${YYS_NAMA}`, cx, 9.6, z1 + 2, 1.25);
  box(x1 + 1.5, 4, z1 - 3, 0.12, 8, 0.12, 0xdddddd); box(x1 + 2.3, 7.4, z1 - 3, 1.5, 0.9, 0.04, 0xd32f2f, false); box(x1 + 2.3, 6.5, z1 - 3, 1.5, 0.9, 0.04, 0xffffff, false);   // tiang bendera
  [[x2 - 1.5, z1 - 2.2], [x1 + 4.5, z1 - 2.2]].forEach(([x, z]) => tree(x, z));
  doorOut('yayasan', cx, z1 - 1.6, 1.8);
  places.push({ n: 'Gedung ' + YYS_NAMA, x: cx, z: z1 - 2, r: 9 });
}
const YYS_DOOR = () => doorsOut.find((d) => d.id === 'yayasan');

// ---------- interior lantai 1 ----------
const YY = new THREE.Vector3(920, 0, 120), YY2 = new THREE.Vector3(920, 0, -120);
const yy = makeHall(YY, 32, 20, 0xf1ebde, '#ebe3d2', '#ddd3bf');
const YY_SPOT = {};
{
  const { add } = yy, H = 3.0, wl = 0xe6dcc8, g = yy.g;
  const tag = (t, x, y, z, sz = 0.4) => { const l = label(t, 0, 0, 0, sz); scene.remove(l); l.position.set(x, y, z); g.add(l); };
  const wallX = (z, x1, x2, g1, g2) => {                     // dinding sejajar sumbu x dengan pintu di g1..g2
    add((x1 + g1) / 2, H / 2, z, g1 - x1, H, 0.25, wl, true); add((g2 + x2) / 2, H / 2, z, x2 - g2, H, 0.25, wl, true);
    add((g1 + g2) / 2, 2.85, z, g2 - g1, 0.3, 0.25, wl); addDoor(g, g1, z, g2 - g1, 2.6, 1, 0x7a5434);
  };
  // deret belakang (z -10 .. -1.5): A | B | C | tangga
  [-8, 2, 9].forEach((x) => add(x, H / 2, -5.75, 0.25, H, 8.5, wl, true));
  wallX(-1.5, -16, -8, -13.0, -11.2); wallX(-1.5, -8, 2, -2.9, -1.1); wallX(-1.5, 2, 9, 4.6, 6.4);
  tag('Ruang Pembina & Pengawas', -12, 3.45, -1.4); tag('Ruang Ketua Yayasan', -3, 3.45, -1.4); tag('Sekretaris & Bendahara', 5.5, 3.45, -1.4);
  // ruang depan (z 1 .. 10): E (ustadz) | lobi | F (ustadzah)
  add(-7.5, H / 2, 5.5, 0.25, H, 9, wl, true); add(7.5, H / 2, 5.5, 0.25, H, 9, wl, true);
  wallX(1, -16, -7.5, -9.7, -7.9); wallX(1, 7.5, 16, 7.9, 9.7);
  tag('Ruang Bidang & Biro · Ustadz', -11.8, 3.45, 0.9); tag('Ruang Biro · Ustadzah', 11.8, 3.45, 0.9);
  // meja kerja + papan nama jabatan
  YYS_STAFF.forEach(([p, j, , , r, x, z, f]) => {
    if (r === 'B') return;
    chairAt(g, x, z, f > 0 ? 0 : Math.PI);
    const dz = z + f * 1.15;
    add(x, 0.4, dz, 1.9, 0.8, 0.9, 0x8a5a2b, true); add(x, 0.83, dz, 2.0, 0.06, 1.0, 0xa8774a);
    add(x + 0.55, 1.08, dz - f * 0.2, 0.5, 0.35, 0.05, 0x333a40);
    add(x - 0.35, 0.95, dz + f * 0.3, 0.8, 0.16, 0.05, 0xf5f0e0); tag(j, x - 0.35, 1.38, dz + f * 0.4, 0.22);
  });
  // ruang Ketua Yayasan: meja kerja + MEJA RAPAT
  // meja kerja ketua di kanan belakang; MEJA RAPAT di sisi kiri belakang, jauh dari pintu (pintu di x -2.9..-1.1)
  chairAt(g, -0.4, -8.4, 0, 0x5a2e1a); add(-0.4, 0.45, -7.1, 2.6, 0.9, 1.1, 0x5e3b22, true); add(-0.4, 0.93, -7.1, 2.7, 0.07, 1.2, 0x7a4f2b);
  add(-0.4, 1.02, -6.75, 0.9, 0.12, 0.05, 0xf5f0e0); tag('Ketua ' + YYS_NAMA, -0.4, 1.45, -6.6, 0.24);
  add(-5.6, 0.42, -7.0, 3.6, 0.84, 1.6, 0x6b4a2b, true); add(-5.6, 0.86, -7.0, 3.7, 0.07, 1.7, 0x8a5a2b);   // meja rapat
  [-6.8, -5.6, -4.4].forEach((x) => { chairAt(g, x, -8.3, 0, 0x3b5e9e); chairAt(g, x, -5.7, Math.PI, 0x3b5e9e); });
  chairAt(g, -7.6, -7.0, Math.PI / 2, 0x3b5e9e); tag('Meja Rapat', -5.6, 1.4, -7.0, 0.3);
  add(-4.5, 2.1, -9.8, 3.4, 1.2, 0.05, 0xffffff); tag('Visi & Misi Yayasan', -4.5, 2.9, -9.7, 0.28);
  add(1.5, 1.1, -4.2, 0.7, 2.2, 1.6, 0x6b4a2b, true);                                 // lemari arsip
  // ruang pembina: rak & kaligrafi
  add(-15.4, 1.1, -5, 0.6, 2.2, 3, 0x8a5a2b, true); add(-12, 2.2, -9.85, 3, 0.8, 0.05, 0x2f6b4a);
  // ruang sekretaris: lemari arsip
  add(8.4, 1.1, -9.2, 0.8, 2.2, 1.2, 0x8a5a2b, true); add(2.6, 1.1, -9.2, 0.8, 2.2, 1.2, 0x8a5a2b, true);
  // tangga ke lantai 2 (x 9..16)
  for (let i = 0; i < 8; i++) add(12.5, 0.15 + i * 0.3, -2.6 - i * 0.9, 5.6, 0.3 + i * 0.6, 0.9, 0xcfc6b5, true);
  add(9.9, 1.6, -6, 0.1, 0.1, 7.5, 0x6b4a2b); tag('⬆ Tangga ke Lantai 2 · Balai Pertemuan', 12.5, 3.4, -1.2, 0.36);
  YY_SPOT.naik = spot(YY, 12.5, -0.6, g);
  // lobi: meja penerima tamu, sofa, tanaman
  add(3.6, 0.55, 4.6, 3, 1.1, 0.9, 0xb98652, true); chairAt(g, 3.6, 3.5, 0);
  add(-5.6, 0.4, 6.8, 1.2, 0.8, 3.4, 0x2f6b4a, true); add(-3.6, 0.25, 6.8, 1.6, 0.5, 1.4, 0x9b6b3c, true);
  add(6.4, 0.6, 9.2, 0.7, 1.2, 0.7, 0x7a4a2a); add(6.4, 1.6, 9.2, 1.1, 1.0, 1.1, 0x3f8f44);
  add(0, 2.4, 1.15, 5, 1.1, 0.05, 0x2f6b4a); tag(`Selamat datang di ${YYS_NAMA}`, 0, 2.45, 1.25, 0.34);
  YY_SPOT.tamu = spot(YY, 3.6, 6.2, g);
}
// ---------- lantai 2: Balai Pertemuan ----------
const yy2 = makeHall(YY2, 30, 20, 0xeef1f4, '#e2e6ea', '#d4dae0');
const BALAI = [];
{
  const { add } = yy2, g = yy2.g, tag = (t, x, y, z, sz = 0.45) => { const l = label(t, 0, 0, 0, sz); scene.remove(l); l.position.set(x, y, z); g.add(l); };
  add(0, 1.7, 9.6, 30, 3.4, 0.3, 0xeef1f4, true);                                    // lantai 2: depan tertutup (bukan pintu keluar)
  add(0, 0.25, -7.8, 16, 0.5, 4, 0x8a5a2b, true);                                     // panggung
  add(0, 2.6, -9.75, 12, 1.6, 0.06, 0x2f6b4a); tag(`Balai Pertemuan ${YYS_NAMA}`, 0, 2.7, -9.6, 0.5);
  add(0, 0.95, -7.2, 7, 0.08, 1.2, 0xffffff, true); add(0, 0.7, -7.2, 7, 0.5, 1.1, 0x2f6b4a);   // meja pimpinan
  [-2.4, 0, 2.4].forEach((x) => chairAt(g, x, -8.4, 0, 0x5a2e1a));
  add(5.8, 1.0, -6.6, 0.7, 1.0, 0.5, 0x6b4a2b); tag('Podium', 5.8, 1.8, -6.6, 0.3);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) {
    const x = -8.4 + c * 2.4 + (c >= 4 ? 1.2 : 0), z = -2.6 + r * 2.1;
    chairAt(g, x, z, Math.PI, r < 2 ? 0x7a4f2b : 0x3b5e9e); BALAI.push({ x, z });
  }
  for (let i = 0; i < 6; i++) add(-13.3, 0.15 + i * 0.3, 6.6 - i * 0.7, 2.6, 0.3 + i * 0.6, 0.7, 0xcfc6b5, true);
  tag('⬇ Tangga turun', -13.3, 3.2, 3.5, 0.4);
  YY_SPOT.turun = spot(YY2, -11.2, 7.6, g);
  YY_SPOT.kursiL = spot(YY2, BALAI[3].x, BALAI[3].z + 0.9, g); YY_SPOT.kursiP = spot(YY2, BALAI[4].x, BALAI[4].z + 0.9, g);
}
let yysPeople = [], yysTask = null;
function yysClear() { yysPeople.forEach((p) => { scene.remove(p); const i = npcs.indexOf(p); if (i >= 0) npcs.splice(i, 1); }); yysPeople = []; }
function yysPerson(model, name, tag, wx, wz, rot, sit = true) {
  const p = makePerson(model);
  Object.assign(p, { fixed: true, kind: 'guru', putri: model.putri, sapaan: model.putri ? 'Ustadzah' : 'Ustadz', name, greetDay: 0 });
  if (sit) seatPerson(p, wx, wz, rot); else { p.position.set(wx, 0, wz); p.rotation.y = rot; }
  if (tag) nameTag(p, tag, 0.42, 2.4);
  scene.add(p); npcs.push(p); yysPeople.push(p); return p;
}
const yysOut = () => { const d = YYS_DOOR(); return { x: d.x, z: d.z - 0.8, rot: Math.PI }; };
let yysRecep = null;
function enterYayasan(fromUp) {
  yysClear();
  YYS_STAFF.forEach(([p, j, gd, look, r, x, z, f]) => {
    const m = yysPerson(teacherModel(gd, look), p, `${p} · ${j}`, YY.x + x, YY.z + z, f > 0 ? 0 : Math.PI);
    m.jab = j;
  });
  yysRecep = yysPerson(teacherModel('L', 5), 'Penerima Tamu', 'Penerima Tamu', YY.x + 3.6, YY.z + 3.5, 0);
  enterHall(`${YYS_NAMA} · Lantai 1`, YY, 20, yysOut(), () => {
    roomSpots = [{ ...YY_SPOT.tamu, id: 'yys-tamu' }, { ...YY_SPOT.naik, id: 'yys-naik' }];
    if (fromUp) { player.position.set(YY.x + 9.6, 0, YY.z - 0.2); player.rotation.y = -Math.PI / 2; }   // agak jauh dari lingkaran tangga
    else {
      say([{ p: player, t: "Assalamu'alaikum… permisi." }, { p: yysRecep, t: `Wa'alaikumussalam, ${state.nama}. Selamat datang di ${YYS_NAMA}. Ada keperluan apa?`, e: 'senang' }]);
      toast('Lantai 1: ruang pengurus · tangga ke Balai Pertemuan (lantai 2) di kanan belakang');
    }
    lastTrig = computeHit();
    if (yysTask) yysTask.inside();
  }, 'room');
}
function enterBalai(rapat) {
  yysClear();
  if (rapat) {                                                     // rapat: pimpinan di depan, peserta duduk
    [0, 3, 4].map((k) => YYS_STAFF[k][0]).forEach((n, i) => { const s = YYS_BY(n); yysPerson(teacherModel('L', s[3]), n, `${n} · ${s[1]}`, YY2.x + (i - 1) * 2.4, YY2.z - 8.4, 0); });
    const guru = Object.keys(TEACH).map((t) => TEACH[t]).sort(() => Math.random() - 0.5).slice(0, 22);
    let k = 0;
    BALAI.forEach((c, i) => {
      if (i === 3 || i === 4 || k >= guru.length) return;
      const t = guru[k++], putri = t.g === 'P';
      if ((c.x > 0) !== putri) return;                              // ustadz di kiri, ustadzah di kanan
      yysPerson(teacherModel(t.g, i % 5), t.p, null, YY2.x + c.x, YY2.z + c.z, Math.PI);
    });
  } else {
    yysPerson(teacherModel('L', 2), 'Petugas Balai', 'Petugas Balai', YY2.x + 7, YY2.z + 4, -Math.PI / 2, false);
  }
  enterHall('Balai Pertemuan · Lantai 2', YY2, 20, yysOut(), () => {
    roomSpots = [{ ...YY_SPOT.turun, id: 'yys-turun' }];
    player.position.set(YY2.x - 8.6, 0, YY2.z + 5.6); player.rotation.y = Math.PI;      // tiba di lantai 2, agak jauh dari tangga turun
    lastTrig = computeHit();
    if (!rapat) toast('Balai Pertemuan lantai 2 · tempat rapat & pertemuan yayasan');
    if (yysTask) yysTask.inside2 && yysTask.inside2();
  }, 'room');
}
function yysAction(id) {
  if (id === 'yys-tamu') return say([{ p: yysRecep, t: `Ruang pengurus ada di belakang: Pembina & Pengawas, Ketua Yayasan, Sekretaris & Bendahara. Bidang & Biro di sebelah kiri, Biro ustadzah di sebelah kanan.`, e: 'senang' }, { p: yysRecep, t: 'Balai Pertemuan ada di lantai 2, naik lewat tangga di kanan belakang.' }]);
  if (id === 'yys-naik') { paused = true; return fade('Naik ke lantai 2…', 500, () => enterBalai(yysTask && yysTask.rapat)); }
  if (id === 'yys-turun') { paused = true; return fade('Turun ke lantai 1…', 500, () => enterYayasan(true)); }
}
// ---------- keperluan ke yayasan (untuk guru) ----------
const KEPERLUAN = [
  { to: 'Ustadz Winarko', t: 'Menyerahkan berkas kepegawaian (SK & rekap kehadiran)', a: 'Ustadz, ini berkas kepegawaian dan rekap kehadiran bulan ini.', b: 'Jazakallahu khairan. Berkasnya lengkap, nanti saya proses. Jangan lupa perbarui data diri di sistem, ya.' },
  { to: 'Ustadz Ngationo', t: 'Melaporkan program pembelajaran semester', a: 'Ustadz, saya ingin melaporkan program pembelajaran dan capaian kelas semester ini.', b: 'Baarakallahu fiik. Programnya bagus. Tolong kirimkan juga rencana tindak lanjut untuk siswa yang perlu bimbingan.' },
  { to: 'Ustadz Zainal', t: 'Menyerahkan laporan dana kegiatan', a: 'Ustadz, ini laporan pertanggungjawaban dana kegiatan beserta nota-notanya.', b: 'Terima kasih, rapi sekali. Saya cek dulu, insyaAllah pekan ini selesai diverifikasi.' },
  { to: 'Ustadz Sutrisno', t: 'Menghadap Ketua Yayasan', a: "Assalamu'alaikum, Ustadz. Saya diminta menghadap.", b: "Wa'alaikumussalam. Silakan duduk di meja rapat. Saya ingin mendengar perkembangan sekolah dan usulan antum untuk program tahfizh." },
  { to: 'Ustadz Hamzah', t: 'Melaporkan kegiatan mentoring (BPI)', a: 'Ustadz, ini laporan kegiatan mentoring dan halaqah pekan ini.', b: 'MasyaAllah. Terus jaga semangat adik-adik, ya. Pekan depan kita evaluasi bersama.' },
  { to: 'Ustadz Herizal', t: 'Mengajukan perbaikan sarana kelas', a: 'Ustadz, kipas angin dan lampu di kelas perlu diperbaiki. Ini formulir pengajuannya.', b: 'Baik, saya catat. InsyaAllah tim sarpras datang memeriksa besok pagi.' },
  { to: 'Ustadz Gunirman', t: 'Menyerahkan dokumen mutu (akreditasi)', a: 'Ustadz, ini dokumen mutu untuk persiapan akreditasi.', b: `Jazakallahu khairan. Nanti saya cocokkan dengan instrumen akreditasi bersama ${YYS_STAFF[11][0]}.` },
  { to: 'Ustadzah Desi', t: 'Konsultasi penanganan siswa (Biro Konseling)', a: 'Ustadzah, saya ingin berkonsultasi tentang siswa yang akhir-akhir ini kurang semangat belajar.', b: 'Terima kasih sudah peduli. Ajak siswanya bicara dengan lembut dulu, lalu jadwalkan sesi konseling bersama saya, ya.' },
  { rapat: true, t: 'Mengikuti rapat di Balai Pertemuan (lantai 2)' },
];
const KEP_IDX = { 'Ustadz Winarko': 6, 'Ustadz Ngationo': 7, 'Ustadz Zainal': 5, 'Ustadz Sutrisno': 3, 'Ustadz Hamzah': 8, 'Ustadz Herizal': 10, 'Ustadz Gunirman': 9, 'Ustadzah Desi': 12 };
KEPERLUAN.forEach((k) => { if (k.to) k.to = YYS_STAFF[KEP_IDX[k.to]][0]; });
function startKeperluan(k) {
  const d = YYS_DOOR();
  if (k.rapat) {
    yysTask = {
      rapat: true,
      inside() { setObjective('Naik ke <b>Balai Pertemuan</b> lewat tangga (kanan belakang)', YY_SPOT.naik, () => { yysAction('yys-naik'); }, 'room'); },
      inside2() { setObjective(`Duduk di <b>kursi kosong</b> barisan ${player.putri || (GURU && GURU.jk === 'P') ? 'ustadzah (kanan)' : 'ustadz (kiri)'} untuk mengikuti rapat`, GURU && GURU.jk === 'P' ? YY_SPOT.kursiP : YY_SPOT.kursiL, rapatScene, 'room'); },
    };
  } else {
    const s = YYS_BY(k.to);
    if (!s) return;
    const [, j, , , , x, z, f] = s, tx = YY.x + x, tz = YY.z + z + f * 2.4;
    yysTask = {
      inside() { setObjective(`Temui <b>${k.to}</b> (${j}): ${k.t.toLowerCase()}`, { x: tx, z: tz }, () => { paused = false; const p = yysPeople.find((q) => q.name === k.to);
        say([{ p: player, t: k.a }, { p, t: k.b, e: 'senang', ch: [['"Jazakallahu khairan, Ustadz."', () => doneKeperluan(k)], ['"Baik, insyaAllah segera saya tindak lanjuti."', () => doneKeperluan(k)]] }]); }, 'room'); },
    };
  }
  setObjective(`🏢 Keperluan: ${k.t}. Pergi ke <b>Gedung ${YYS_NAMA}</b> di seberang jalan`, d, () => enterYayasan());
  toast(`📋 ${k.t}`);
}
function doneKeperluan(k) {
  yysTask = null; Audio.sfx('ok');
  toast(`✅ Keperluan selesai: ${k.t}`);
  setObjective('Keperluan selesai. Silakan lanjut berkeliling, atau buka <b>📋 Menu Guru</b>', null, null);
}
function rapatScene() {
  paused = true;
  const seat = BALAI[GURU && GURU.jk === 'P' ? 4 : 3]; player.position.set(YY2.x + seat.x, 0, YY2.z + seat.z); player.rotation.y = Math.PI; sitPose(player, true);
  const ket = yysPeople.find((p) => p.name === YYS_STAFF[3][0]), mod = yysPeople.find((p) => p.name === YYS_STAFF[4][0]), pem = yysPeople.find((p) => p.name === YYS_STAFF[0][0]);
  paused = false;
  say([
    { p: mod, t: "Bismillahirrahmanirrahim. Rapat kita buka dengan membaca Al-Fatihah bersama-sama." },
    { p: ket, t: `Alhamdulillah. Terima kasih kepada seluruh ustadz dan ustadzah. Hari ini kita membahas program semester depan ${YYS_NAMA}.`, e: 'senang' },
    { p: ket, t: 'Pertama: penguatan tahfizh dan adab siswa. Kedua: peningkatan mutu pembelajaran. Ketiga: kesejahteraan guru dan sarana sekolah.' },
    { p: pem, t: 'Saya titip agar kita semua menjaga keikhlasan. Mendidik adalah amanah dan ladang pahala.', e: 'senang' },
    { p: ket, t: `${state.nama}, ada usulan dari sekolah?`, ch: [
      ['"Usul ada program mengaji bersama setiap pagi, Ustadz."', () => rapatTutup('Usulan yang bagus. Kita masukkan ke program tahfizh.')],
      ['"Usul pelatihan media pembelajaran digital untuk guru."', () => rapatTutup('Setuju. Bidang Pendidikan akan menjadwalkan pelatihannya.')],
      ['"Belum ada, Ustadz. Saya ikut keputusan rapat."', () => rapatTutup('Baik, jazakallahu khairan.')]] },
  ]);
}
function rapatTutup(r) {
  const ket = yysPeople.find((p) => p.name === YYS_STAFF[3][0]), mod = yysPeople.find((p) => p.name === YYS_STAFF[4][0]);
  say([{ p: ket, t: r, e: 'senang' }, { p: mod, t: 'Rapat kita tutup dengan doa kafaratul majelis. Subhanakallahumma wa bihamdika, asyhadu allaa ilaaha illaa anta, astaghfiruka wa atuubu ilaik.' }], () => {
    sitPose(player, false); doneKeperluan({ t: 'Rapat di Balai Pertemuan' }); setTimeout(() => { paused = false; }, 60);
  });
}
