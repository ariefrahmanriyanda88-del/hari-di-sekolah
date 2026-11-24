// =====================================================================
//  ADEGAN PERINGATAN (ala festival Harvest Moon): dimainkan di sekolah pada tanggalnya.
// =====================================================================
const EVENT_INFO = {
  israMiraj: "Peringatan Isra Mi'raj di masjid sekolah: ceramah tentang perjalanan Nabi ﷺ dan perintah sholat lima waktu, lalu kuis.",
  ramadan: 'Hari pertama puasa. Pesantren Ramadan: tadarus, kultum, sholat Zuhur berjamaah, lalu buka puasa bersama di halaman sekolah.',
  idulfitri: 'Sholat Idulfitri berjamaah di lapangan, khutbah, lalu halal bihalal: saling memaafkan dengan guru dan teman.',
  iduladha: 'Sholat Iduladha di lapangan, khutbah kisah Nabi Ibrahim, lalu membantu panitia kurban membungkus dan membagikan daging.',
  maulid: 'Peringatan Maulid Nabi ﷺ di masjid: ceramah sirah Nabi, sholawat bersama, lalu kuis.',
  muharam: 'Tahun Baru Islam: ceramah hijrah Nabi ﷺ di masjid, lalu pawai ta\'aruf keliling sekolah.',
  agustus: 'Upacara HUT Kemerdekaan RI, lalu lomba 17-an: makan kerupuk, balap karung, dan panjat pinang!',
  pancasila: 'Upacara peringatan Hari Lahir Pancasila.',
  hardiknas: 'Upacara peringatan Hari Pendidikan Nasional.',
  sumpahPemuda: 'Upacara peringatan Hari Sumpah Pemuda.',
  pahlawan: 'Upacara peringatan Hari Pahlawan.',
  hariGuru: 'Peringatan Hari Guru: sambutan kepala sekolah, ucapan perwakilan murid, pemberian bunga dan kartu untuk para guru, doa, lalu foto bersama.',
  hariIbu: 'Peringatan Hari Ibu: nasihat berbakti kepada ibu, menulis surat untuk ibu, dan doa untuk kedua orang tua.',
};
// ---------- panggung adegan ----------
let acaraPeople = [], acaraEv = null;
const acCam = new THREE.Vector3(), acLook = new THREE.Vector3();
const portraitV = () => innerWidth < innerHeight;
function acaraClear() { acaraPeople.forEach((p) => { scene.remove(p); const i = npcs.indexOf(p); if (i >= 0) npcs.splice(i, 1); }); acaraPeople = []; Object.values(PROPS).forEach((g) => (g.visible = false)); lombaUI(false); }
function acAdd(model, x, z, rot, tag) {
  const p = makePerson(model); p.position.set(x, 0, z); p.rotation.y = rot; p.base = p.position.clone(); p.baseRot = rot;
  if (p.bag) p.bag.visible = false; if (tag) nameTag(p, tag, 0.45);
  scene.add(p); acaraPeople.push(p); return p;
}
function acCamSet(px, py, pz, lx, ly, lz) { const k = portraitV() ? 1.5 : 1; acCam.set(lx + (px - lx) * k, ly + (py - ly) * k, lz + (pz - lz) * k); acLook.set(lx, ly, lz); }
function updateAcara(dt) { LBL_UPC.visible = zone !== 'acara' && zone !== 'upacara'; if (zone !== 'acara') return; camera.position.lerp(acCam, 1 - Math.pow(0.01, dt)); camera.lookAt(acLook); updateLomba(dt); }
const run = (list) => list.forEach(([t, fn]) => later(t, fn));
function placePlayer(x, z, rot) { player.position.set(x, 0, z); player.rotation.y = rot; player.base = player.position.clone(); player.baseRot = rot; sitPose(player, false); }
const pemimpinAgama = () => { const s = KEPS_STAFF.find((k) => /syar/i.test(k.j)) || KEPS_STAFF[0]; return s.p; };

// ---------- mulai & akhiri hari peringatan ----------
function startEventDay(ev) {
  acaraEv = ev; acaraClear();
  today = DATA.sched[state.cls][0].blocks; dayDone.clear(); phase = 'acara'; minutes = 7 * 60; dayScore = 0;
  if (crowd.length) afterMasjid();
  walkers.forEach((n) => { n.visible = false; n.path = null; });
  objective = null; hasWudhu = false; savedObj = null; upacaraDone = true; lateDone = true; setGate(false);
  if (typeof homeView === 'function') homeView(false);
  goOutside(0, 46, Math.PI); hud(); paused = true;
  if (GURU) $('gurubtn').style.display = '';
  setTimeout(() => modal(`<div class="tag">📅 ${tglLabel(state.tgl, true)}</div><div class="big">${esc(ev.t)}</div><p>${EVENT_INFO[ev.scene] || ''}</p>${ev.k === 'libur' ? '<p class="muted">Hari ini tanggal merah. Sekolah mengadakan kegiatan peringatan khusus.</p>' : ''}`,
    [['▶ Mulai kegiatan', () => { closeModal(); paused = false; SCENES[ev.scene](ev); }, 'main']]), 700);
}
function endEvent(msg) {
  if (player.tagEl) player.tagEl.style.visibility = '';
  acaraClear(); caption(''); player.base = null; sitPose(player, false); pose && 0;
  walkers.forEach((n) => (n.visible = true));
  zone = 'luar'; goOutside(0, 46, Math.PI); minutes = 15 * 60; hud();
  const ev = acaraEv || { t: 'Peringatan' };
  paused = true;
  modal(`<div class="tag">📅 ${tglLabel(state.tgl, true)}</div><div class="big">${esc(ev.t)} ✓</div><p>${msg}</p>${GURU ? '' : `<p>+${dayScore} ⭐ hari ini</p>`}`,
    GURU ? [['Lanjut berkeliling', () => { closeModal(); paused = false; startGuruDay(); }, 'main'], ['📅 Buka kalender', () => { closeModal(); openCalendar(); }]]
      : [['🌙 Pulang & tidur', () => { closeModal(); sleep(); }, 'main'], ['🚶 Jalan-jalan dulu', () => { closeModal(); paused = false; setObjective('Pulang lewat <b>Gerbang Utama</b>', { x: 0, z: 50 }, goHome); }]]);
}
function evQuiz(qs, done, i = 0, ok = 0) {
  if (i >= qs.length) { const p = ok * 3; if (p && !GURU) { addPts(p); toast(`+${p} ⭐ Kuis peringatan: ${ok}/${qs.length} benar`); } return done(ok); }
  const [q, opts, k, why] = qs[i];
  modal(`<div class="tag">🧠 Kuis ${i + 1}/${qs.length}</div><div class="big" style="font-size:18px">${esc(q)}</div><div id="fb"></div>`,
    opts.map((o, j) => [o, () => {
      const benar = j === k; Audio.sfx(benar ? 'ok' : 'no');
      modal(`<div class="tag">${benar ? '✅ Benar!' : '❌ Kurang tepat'}</div><p>${esc(why)}</p>`, [['Lanjut', () => evQuiz(qs, done, i + 1, ok + (benar ? 1 : 0)), 'main']]);
    }, 'left']));
}

// ---------- 1) Ceramah di masjid: Isra Mi'raj, Maulid, 1 Muharam ----------
const CERAMAH = {
  israMiraj: { judul: "Peringatan Isra Mi'raj", lines: [
    "Bismillah. Isra Mi'raj adalah perjalanan Nabi Muhammad ﷺ dalam satu malam: dari Masjidil Haram ke Masjidil Aqsa, lalu naik ke Sidratul Muntaha.",
    'Peristiwa ini terjadi di masa sulit, setelah wafatnya Khadijah dan Abu Thalib. Allah menghibur Nabi dengan perjalanan yang agung ini.',
    'Oleh-oleh terbesar dari Isra Mi\'raj adalah perintah sholat lima waktu. Maka sholat adalah hadiah langsung dari Allah untuk kita.',
    'Anak-anakku, jagalah sholat tepat waktu. Sholat adalah tiang agama dan amal pertama yang dihisab.'],
    qs: [["Isra adalah perjalanan Nabi ﷺ dari Masjidil Haram ke…", ['Masjidil Aqsa', 'Masjid Nabawi', 'Masjid Quba'], 0, 'Isra: dari Masjidil Haram (Makkah) ke Masjidil Aqsa (Palestina).'],
      ["Perintah apa yang diterima Nabi ﷺ saat Mi'raj?", ['Puasa Ramadan', 'Sholat lima waktu', 'Zakat'], 1, "Sholat lima waktu diterima langsung dalam peristiwa Mi'raj."],
      ['Amal pertama yang dihisab pada hari kiamat adalah…', ['Sholat', 'Sedekah', 'Puasa'], 0, 'Sholat adalah amal pertama yang dihisab.']] },
  maulid: { judul: 'Peringatan Maulid Nabi ﷺ', lines: [
    'Alhamdulillah, hari ini kita memperingati kelahiran Nabi Muhammad ﷺ, yang lahir di Makkah pada Tahun Gajah.',
    'Sejak kecil beliau dikenal jujur, sampai digelari Al-Amin, artinya orang yang terpercaya.',
    'Akhlak beliau adalah Al-Qur\'an. Beliau lembut kepada anak-anak, menghormati orang tua, dan tidak pernah berdusta.',
    'Cara terbaik mencintai Nabi ﷺ adalah meneladani akhlaknya dan memperbanyak sholawat.'],
    qs: [['Nabi Muhammad ﷺ lahir di kota…', ['Madinah', 'Makkah', 'Thaif'], 1, 'Beliau lahir di Makkah pada Tahun Gajah.'],
      ['Gelar Nabi ﷺ yang berarti "terpercaya" adalah…', ['Al-Amin', 'Al-Faruq', 'Ash-Shiddiq'], 0, 'Al-Amin artinya orang yang terpercaya.'],
      ['Cara terbaik mencintai Nabi ﷺ adalah…', ['Meneladani akhlak beliau', 'Hanya merayakan Maulid', 'Menghafal nama-nama sahabat saja'], 0, 'Cinta kepada Nabi ﷺ dibuktikan dengan meneladani akhlak dan sunnahnya.']] },
  muharam: { judul: 'Peringatan Tahun Baru Islam 1449 H', lines: [
    'Selamat Tahun Baru Islam 1449 Hijriah. Penanggalan Hijriah dimulai dari peristiwa hijrah Nabi ﷺ dari Makkah ke Madinah.',
    'Hijrah membutuhkan pengorbanan dan keberanian. Nabi ﷺ ditemani Abu Bakar Ash-Shiddiq dan bersembunyi di Gua Tsur.',
    'Bagi kita, hijrah berarti berpindah dari yang buruk menjadi lebih baik: dari malas menjadi rajin, dari lalai menjadi taat.',
    'Mari buat resolusi di tahun baru ini: sholat tepat waktu, rajin belajar, dan berbakti kepada orang tua.'],
    qs: [['Penanggalan Hijriah dimulai dari peristiwa…', ['Hijrah Nabi ﷺ ke Madinah', 'Kelahiran Nabi ﷺ', 'Perang Badar'], 0, 'Kalender Hijriah dihitung sejak hijrah Nabi ﷺ.'],
      ['Sahabat yang menemani Nabi ﷺ saat hijrah adalah…', ['Umar bin Khattab', 'Abu Bakar Ash-Shiddiq', 'Ali bin Abi Thalib'], 1, 'Abu Bakar menemani Nabi ﷺ dan bersembunyi di Gua Tsur.'],
      ['Bulan pertama dalam kalender Hijriah adalah…', ['Ramadan', 'Syawal', 'Muharam'], 2, 'Muharam adalah bulan pertama tahun Hijriah.']] },
};
function ceramahScene(ev) {
  const c = CERAMAH[ev.scene], nm = pemimpinAgama();
  buildJamaah(); setMsCam();
  fade(c.judul, 800, () => {
    zone = 'masjid'; hud(); minutes = 8 * 60;
    const me = meP();
    player.base = new THREE.Vector3(-7.5 + 6 * 1.5, 0, me ? 5.4 : -6.6).add(MSJ); player.baseRot = Math.PI; player.rotation.y = Math.PI;
    [...jamaah, player].forEach((p) => { if (p !== player) p.baseRot = Math.PI; pose(p, 'duduk'); });
    imam.baseRot = 0; pose(imam, 'berdiri'); imam.tagEl.textContent = `🎙️ Penceramah: ${nm}`;
    caption(c.judul);
    later(900, () => say(c.lines.map((t, i) => ({ p: imam, t, e: i === 0 ? 'senang' : undefined })), () => {
      caption('');
      const after = () => {
        if (ev.scene === 'maulid') {
          caption('Sholawat bersama'); bubble(imam, 'Allahumma sholli \'ala Sayyidina Muhammad…', 3000);
          later(1400, () => jamaah.slice(0, 8).forEach((p) => bubble(p, 'Allahumma sholli \'alaih…', 2200)));
          later(3800, () => { caption(''); endEvent('Semoga kita semakin mencintai dan meneladani Rasulullah ﷺ.'); });
        } else if (ev.scene === 'muharam') pawaiScene();
        else endEvent('Jagalah sholat lima waktu, hadiah dari peristiwa Isra Mi\'raj.');
      };
      evQuiz(c.qs, () => { closeModal(); after(); });
    }));
  });
}
// pawai ta'aruf keliling halaman sekolah (1 Muharam)
function pawaiScene() {
  fade("Pawai Ta'aruf 1 Muharam", 800, () => {
    zone = 'acara'; minutes = 9 * 60; hud();
    const me = meP(), path = [[-11, 33], [11, 33], [11, 15], [-11, 15]];
    const walkersP = [];
    for (let i = 0; i < 16; i++) {
      const p = acAdd(studentModel(me, i), -11 + (i % 8) * 1.4, 33 + Math.floor(i / 8) * 1.2, Math.PI / 2);
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 0.06), mat(0x6b4a2b)); pole.position.set(0.35, 1.6, 0.1); p.add(pole);
      const fl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.45, 0.7), mat(i % 2 ? 0x2f8a5c : 0xffffff)); fl.position.set(0.35, 2.2, 0.45); p.add(fl);
      p.pi = 0; p.off = i * 1.6; walkersP.push(p);
    }
    placePlayer(-13, 33, Math.PI / 2); player.base = null;
    caption("🕌 Pawai Ta'aruf: Marhaban ya Muharam!");
    acCamSet(0, 20, 46, 0, 0, 24);
    const t0 = performance.now();
    pawaiTick = (dt) => {
      [...walkersP, player].forEach((p, i) => {
        const tgt = path[(p.pi || 0) % 4];
        if (moveTo(p, tgt[0], tgt[1], 3.2, dt) < 0.6) p.pi = (p.pi || 0) + 1;
      });
      const h = walkersP[4].position; acCamSet(h.x, 11, h.z + 13, h.x, 0.8, h.z);   // kamera mengikuti rombongan pawai
      if (performance.now() - t0 > 16000 && pawaiTick) { pawaiTick = null; caption(''); endEvent('Selamat Tahun Baru Islam 1449 H. Mari berhijrah menjadi pribadi yang lebih baik.'); }
    };
    later(800, () => bubble(walkersP[0], 'Marhaban ya Muharam!', 2200));
    later(3000, () => bubble(player, 'Allahu Akbar! Selamat Tahun Baru Islam!', 2200));
  });
}
let pawaiTick = null;

// ---------- 2) Upacara nasional ----------
const AMANAT = {
  agustus: ['Hari ini kita memperingati 82 tahun Kemerdekaan Republik Indonesia. Alhamdulillah, kemerdekaan adalah nikmat dari Allah.', 'Kemerdekaan diperjuangkan para pahlawan dan ulama dengan pengorbanan. Doakan mereka, dan isi kemerdekaan dengan belajar sungguh-sungguh.', 'Setelah upacara, kita adakan lomba. Bertandinglah dengan sportif, jujur, dan tetap menjaga adab. Merdeka!'],
  pancasila: ['Hari ini kita memperingati Hari Lahir Pancasila, dasar negara kita.', 'Sila pertama, Ketuhanan Yang Maha Esa, mengingatkan kita untuk taat kepada Allah dalam setiap langkah.', 'Mari amalkan nilai Pancasila: rukun, adil, dan saling menolong.'],
  hardiknas: ['Hari ini kita memperingati Hari Pendidikan Nasional, mengenang jasa Ki Hajar Dewantara.', 'Menuntut ilmu adalah kewajiban setiap muslim. Belajarlah dengan niat ikhlas karena Allah.', 'Hormati guru, karena dari merekalah ilmu yang bermanfaat sampai kepada kalian.'],
  sumpahPemuda: ['Hari ini kita memperingati Hari Sumpah Pemuda, 28 Oktober 1928.', 'Para pemuda bersatu: satu nusa, satu bangsa, satu bahasa, Indonesia.', 'Kalian adalah pemuda harapan bangsa. Jadilah pemuda yang beriman, berilmu, dan berakhlak.'],
  pahlawan: ['Hari ini kita memperingati Hari Pahlawan, mengenang pertempuran 10 November 1945 di Surabaya.', 'Banyak ulama dan santri ikut berjuang mempertahankan kemerdekaan.', 'Menjadi pahlawan masa kini: belajar sungguh-sungguh, jujur, dan menolong sesama.'],
};
const UPACARA_JUDUL = { agustus: 'Upacara HUT ke-82 Kemerdekaan RI', pancasila: 'Upacara Hari Lahir Pancasila', hardiknas: 'Upacara Hari Pendidikan Nasional', sumpahPemuda: 'Upacara Hari Sumpah Pemuda', pahlawan: 'Upacara Hari Pahlawan' };
function upacaraNasional(ev) {
  upacaraScene({ title: UPACARA_JUDUL[ev.scene], amanat: AMANAT[ev.scene], after: () => (ev.scene === 'agustus' ? lombaMenu() : endEvent('Terima kasih telah mengikuti upacara dengan khidmat.')) });
}

// ---------- 3) Lomba 17-an ----------
const PROPS = {};
{
  const F = { x: 0, z: -53 };
  // makan kerupuk: dua tiang + tali, 5 kerupuk tergantung
  const k = new THREE.Group(); k.visible = false; scene.add(k); PROPS.kerupuk = k;
  [-6.5, 6.5].forEach((x) => { const t = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.8, 0.15), mat(0xc0392b)); t.position.set(x, 1.4, -47); k.add(t); });
  const rope = new THREE.Mesh(new THREE.BoxGeometry(13, 0.05, 0.05), mat(0xeeeeee)); rope.position.set(0, 2.75, -47); k.add(rope);
  k.kr = [-4, -2, 0, 2, 4].map((x) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.6, 0.02), mat(0xdddddd)); s.position.set(x, 2.45, -47); k.add(s);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 14), mat(0xf5deb0)); c.rotation.x = Math.PI / 2; c.position.set(x, 2.15, -47); k.add(c); return c;
  });
  // balap karung: garis start & finish, 5 lintasan
  const b = new THREE.Group(); b.visible = false; scene.add(b); PROPS.karung = b;
  [-44.5, -61.5].forEach((z) => { const l = new THREE.Mesh(new THREE.BoxGeometry(14, 0.04, 0.3), mat(0xffffff)); l.position.set(0, 0.07, z); b.add(l); });
  [-4.5, -1.5, 1.5, 4.5].forEach((x) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 17), mat(0xffffff)); l.position.set(x, 0.07, -53); b.add(l); });
  // panjat pinang: batang licin + gantungan hadiah
  const p = new THREE.Group(); p.visible = false; scene.add(p); PROPS.pinang = p;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 10, 12), mat(0x4a3424)); pole.position.set(F.x, 5, F.z); p.add(pole);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.07, 6, 20), mat(0x8a5a2b)); ring.rotation.x = Math.PI / 2; ring.position.set(F.x, 9.6, F.z); p.add(ring);
  [0xd33, 0xfff, 0x2f8a5c, 0xf2a33a, 0x3b5e9e, 0xd9577a].forEach((c, i) => { const a = i / 6 * Math.PI * 2, h = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.35), mat(c)); h.position.set(F.x + Math.cos(a) * 1.1, 9.1, F.z + Math.sin(a) * 1.1); p.add(h); });
  const fl = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.03), mat(0xd33)); fl.position.set(F.x + 0.45, 10.6, F.z); p.add(fl);
  const fl2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.035), mat(0xffffff)); fl2.position.set(F.x + 0.45, 10.45, F.z); p.add(fl2);
}
let lombaDone = new Set(), lomba = null;
function lombaMenu() {
  zone = 'acara'; paused = true; acaraClear(); player.base = null; caption('');
  goOutsideSilent(0, -40, Math.PI); acCamSet(0, 24, -26, 0, 0, -52); minutes = Math.max(minutes, 9 * 60); hud();
  const L = [['kerupuk', '🍘 Lomba makan kerupuk'], ['karung', '🛍️ Balap karung'], ['pinang', '🌴 Panjat pinang']];
  modal(`<div class="tag">🇮🇩 Lomba 17-an di lapangan</div><div class="big">Pilih lomba</div><p class="muted">Tekan tombol <b>TEKAN!</b> (atau Spasi) secepat mungkin. Bertandinglah dengan sportif!</p>`,
    L.map(([k, t]) => [t + (lombaDone.has(k) ? ' ✓' : ''), () => { closeModal(); startLomba(k); }, 'left']).concat([['🏆 Pembagian hadiah & selesai', () => { closeModal(); lombaDone.clear(); endEvent('Dirgahayu Republik Indonesia ke-82! Merdeka!'); }, 'main']]));
}
function goOutsideSilent(x, z, rot) { zone = 'acara'; interior = null; player.position.set(x, 0, z); player.rotation.y = rot; }
function startLomba(kind) {
  acaraClear(); PROPS[kind].visible = true; zone = 'acara';
  const me = meP(), rivals = [], N = kind === 'pinang' ? 0 : 4;
  const names = (me ? NAMES_PI : NAMES_PA).slice(0, 4);
  // penonton
  for (let i = 0; i < 10; i++) {                                     // penonton tidak menghalangi kamera
    if (kind === 'kerupuk') acAdd(studentModel(me, i + 20), -9 + i * 2, -50.5, 0);
    else if (kind === 'karung') acAdd(studentModel(me, i + 20), -9.5, -45 - i * 1.6, Math.PI / 2);
    else { const a = Math.PI * (0.15 + i * 0.07); acAdd(studentModel(me, i + 20), Math.cos(a) * 5, -53 - Math.sin(a) * 5, -a - Math.PI / 2); }
  }
  acAdd(teacherModel(me ? 'P' : 'L', 2), kind === 'karung' ? 8.5 : 7.5, kind === 'karung' ? -61 : -49.5, -Math.PI / 2, 'Juri');
  if (kind === 'kerupuk') {
    const xs = [-4, -2, 0, 2, 4];
    xs.forEach((x, i) => { if (i === 2) placePlayer(x, -47, 0); else rivals.push(acAdd(studentModel(me, i + 3), x, -47, 0)); });
    PROPS.kerupuk.kr.forEach((c) => c.scale.set(1, 1, 1));
    acCamSet(0, 5.5, -37.5, 0, 1.6, -47.5);
  } else if (kind === 'karung') {
    [-6, -3, 0, 3, 6].forEach((x, i) => { if (i === 2) placePlayer(x, -44, Math.PI); else rivals.push(acAdd(studentModel(me, i + 7), x, -44, Math.PI)); });
    [player, ...rivals].forEach((p) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.6), mat(0xb08a5a)); s.position.set(0, 0.45, 0); s.name = 'karung'; p.add(s); });
    acCamSet(14, 13, -38, 0, 0, -53);
  } else {
    placePlayer(0, -52.4, Math.PI);
    acCamSet(7, 6, -44, 0, 4.5, -53);
  }
  const all = [player, ...rivals];
  const lbl = kind === 'pinang' ? ['Kamu'] : ['Kamu', ...names];
  lomba = { kind, all, prog: all.map(() => 0), rate: all.map((_, i) => (i ? 0.075 + Math.random() * 0.06 : 0)), t: 0, max: kind === 'pinang' ? 30 : 25, done: false, go: false, slip: 0, lbl };
  lombaUI(true);
  caption(kind === 'kerupuk' ? '🍘 Makan kerupuk tanpa tangan!' : kind === 'karung' ? '🛍️ Lompat dalam karung sampai garis finis!' : '🌴 Panjat batang pinang yang licin dan ambil hadiahnya!');
  const cnt = $('lombaCount'); let n = 3; cnt.textContent = n;
  const iv = setInterval(() => { n--; cnt.textContent = n > 0 ? n : 'MULAI!'; Audio.sfx('tick'); if (n <= 0) { clearInterval(iv); lomba.go = true; setTimeout(() => (cnt.textContent = ''), 700); } }, 800);
}
function lombaTap() {
  if (!lomba || !lomba.go || lomba.done) return;
  const k = lomba.kind;
  if (k === 'tunggal') { lomba.prog[0] = Math.min(1, lomba.prog[0] + 0.05); if (lomba.prog[0] >= 1) tunggalDone(); return; }
  lomba.prog[0] = Math.min(1, lomba.prog[0] + (k === 'kerupuk' ? 0.022 : k === 'karung' ? 0.02 : 0.017));   // ±45–60 ketukan
  lomba.hop = 0.25;
}
function updateLomba(dt) {
  if (pawaiTick) pawaiTick(dt);
  if (!lomba) return;
  const L = lomba; if (!L.go || L.done) return renderLomba(dt);
  L.t += dt;
  if (L.kind === 'tunggal') { renderLomba(dt); if (L.t >= L.max) tunggalDone(); return; }
  for (let i = 1; i < L.all.length; i++) L.prog[i] = Math.min(1, L.prog[i] + L.rate[i] * dt * (0.6 + Math.random() * 0.8));
  if (L.kind === 'pinang') {                                         // batang licin: sesekali melorot
    L.slip -= dt; if (L.slip <= 0) { L.slip = 2.2 + Math.random() * 2; if (L.prog[0] > 0.12 && L.prog[0] < 1) { L.prog[0] = Math.max(0, L.prog[0] - 0.12); toast('😅 Licin! Melorot…'); } }
  }
  renderLomba(dt);
  const winner = L.prog.findIndex((p) => p >= 1);
  if (winner >= 0 || L.t >= L.max) finishLomba();
}
function renderLomba(dt) {
  const L = lomba; if (!L) return;
  L.hop = Math.max(0, (L.hop || 0) - dt);
  L.all.forEach((p, i) => {
    const g = L.prog[i];
    if (L.kind === 'tunggal') { p.armL.rotation.x = p.armR.rotation.x = -0.8 - Math.sin(L.t * 12) * 0.3 * (L.hop > 0 ? 1 : 0); return; }
    if (L.kind === 'kerupuk') { PROPS.kerupuk.kr[[2, 0, 1, 3, 4][i]].scale.setScalar(Math.max(0.05, 1 - g)); p.position.y = (i ? Math.abs(Math.sin(L.t * 9 + i)) * 0.12 : L.hop * 0.5); p.armL.rotation.x = p.armR.rotation.x = 0.6; }
    else if (L.kind === 'karung') { p.position.z = -44 - g * 17; p.position.y = Math.abs(Math.sin((L.t + i) * 7)) * (L.go && g < 1 ? 0.45 : 0); }
    else { p.position.y = g * 8.4; p.armL.rotation.x = p.armR.rotation.x = -2.8; p.legL.rotation.x = Math.sin(L.t * 10) * 0.4 * (L.hop > 0 ? 1 : 0.2); }
  });
  const bars = $('lombaBars');
  if (bars) bars.innerHTML = L.lbl.map((n, i) => `<div class="lb"><span>${esc(n)}</span><i style="width:${Math.round(L.prog[i] * 100)}%"></i></div>`).join('') + `<div class="lt">⏱️ ${Math.max(0, Math.ceil(L.max - L.t))} detik</div>`;
}
function finishLomba() {
  const L = lomba; L.done = true;
  const order = L.prog.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
  const rank = order.indexOf(0) + 1, kind = L.kind;
  let msg, pts;
  if (kind === 'pinang') { const ok = L.prog[0] >= 1; msg = ok ? '🏆 Berhasil sampai puncak dan mengambil hadiah!' : 'Belum sampai puncak. Batangnya memang licin, tetap semangat!'; pts = ok ? 12 : 4; if (ok) { Audio.sfx('ok'); bubble(player, 'Alhamdulillah, dapat hadiah!', 2000); } }
  else { msg = rank === 1 ? '🥇 Juara 1!' : rank === 2 ? '🥈 Juara 2!' : rank === 3 ? '🥉 Juara 3!' : `Peringkat ${rank}. Tidak apa-apa, yang penting sportif!`; pts = [12, 8, 5][rank - 1] || 3; }
  if (!GURU) addPts(pts);
  lombaDone.add(kind);
  setTimeout(() => {
    lombaUI(false); caption('');
    player.children.filter((c) => c.name === 'karung').forEach((c) => player.remove(c));
    player.position.y = 0; player.armL.rotation.x = player.armR.rotation.x = 0;
    modal(`<div class="tag">🇮🇩 ${kind === 'kerupuk' ? 'Lomba makan kerupuk' : kind === 'karung' ? 'Balap karung' : 'Panjat pinang'}</div><div class="big">${msg}</div>${GURU ? '' : `<p>+${pts} ⭐</p>`}`,
      [['Lanjut', () => { closeModal(); lomba = null; lombaMenu(); }, 'main']]);
  }, 900);
}
function lombaUI(on) {
  let el = $('lombaUI');
  if (!on) { if (el) el.style.display = 'none'; return; }
  if (!el) {
    el = document.createElement('div'); el.id = 'lombaUI';
    el.innerHTML = '<div id="lombaCount"></div><div id="lombaBars"></div><button type="button" id="lombaBtn">👆 TEKAN!</button>';
    document.body.appendChild(el);
    const b = el.querySelector('#lombaBtn');
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); lombaTap(); b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 80); });
    addEventListener('keydown', (e) => { if (lomba && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); if (!e.repeat) lombaTap(); } });
  }
  el.style.display = '';
}

// ---------- 4) Ramadan, Idulfitri, Iduladha, Hari Guru ----------
function crowdPlaza(facing, withTeachers = true) {
  // putra di kiri, putri di kanan (terpisah); pemain ikut di barisannya
  const me = meP(), slot = [me ? 3.2 + 2 * 1.6 : -3.2 - 2 * 1.6, 24.8];
  for (let s = 0; s < 2; s++) for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const putri = s === 1, x = (putri ? 3.2 : -3.2) + (putri ? 1 : -1) * c * 1.6, z = 23 + r * 1.8;
    if (putri === me && r === 1 && c === 2) continue;
    acAdd(studentModel(putri, s * 18 + r * 6 + c), x, z, facing);
  }
  if (withTeachers) { [-1.6, -3.2, -4.8].forEach((x, i) => acAdd(teacherModel('L', i + 1), x, 21.2, facing)); [1.6, 3.2, 4.8].forEach((x, i) => acAdd(teacherModel('P', i + 1), x, 21.2, facing)); }
  placePlayer(slot[0], slot[1], facing);
}
function sholatId(judul, khutbah, done) {
  fade(judul, 900, () => {
    zone = 'acara'; minutes = 7 * 60; hud(); acaraClear();
    crowdPlaza(Math.PI);
    const im = acAdd(teacherModel('L', 0), 0, 19.4, Math.PI, `🕌 Imam: ${pemimpinAgama()}`); im.tagEl && im.tagEl.classList.add('imam');
    acCamSet(0, 9, 12.5, 0, 0.5, 23.5);
    const all = () => [im, player, ...acaraPeople.filter((p) => p !== im)];
    const P = (n) => all().forEach((p) => pose(p, n));
    caption('Takbir: Allahu Akbar, Allahu Akbar, Allahu Akbar, laa ilaaha illallah… walillahil hamd');
    run([
      [3500, () => { caption(`${judul}: 2 rakaat, takbir 7 kali di rakaat pertama`); bubble(im, 'Allahu Akbar', 1500); P('takbir'); }],
      [5200, () => P('sedekap')], [7600, () => { caption('Rukuk'); P('rukuk'); }], [9200, () => { caption('Sujud'); P('sujud'); }],
      [10800, () => { caption('Rakaat kedua (gerakan diringkas)'); P('sedekap'); }], [13200, () => { caption('Tasyahud akhir & salam'); P('duduk'); }],
      [15200, () => { bubble(im, "Assalamu'alaikum warahmatullah", 1500); P('salamKanan'); }], [16400, () => P('salamKiri')],
      [17600, () => { caption('Khutbah'); P('duduk'); im.rotation.y = 0; im.baseRot = 0; pose(im, 'berdiri');
        say(khutbah.map((t) => ({ p: im, t })), () => { caption(''); done(im); }); }],
    ]);
  });
}
const SCENES = {
  israMiraj: ceramahScene, maulid: ceramahScene, muharam: ceramahScene,
  agustus: upacaraNasional, pancasila: upacaraNasional, hardiknas: upacaraNasional, sumpahPemuda: upacaraNasional, pahlawan: upacaraNasional,
  ramadan() {
    // tadarus & kultum di masjid → sholat Zuhur → buka puasa bersama
    const nm = pemimpinAgama();
    buildJamaah(); setMsCam();
    fade('Pesantren Ramadan · Tadarus', 800, () => {
      zone = 'masjid'; hud(); minutes = 8 * 60;
      const me = meP();
      player.base = new THREE.Vector3(-7.5 + 6 * 1.5, 0, me ? 5.4 : -6.6).add(MSJ); player.baseRot = Math.PI; player.rotation.y = Math.PI;
      [...jamaah, player].forEach((p) => { if (p !== player) p.baseRot = Math.PI; pose(p, 'duduk'); });
      imam.baseRot = 0; pose(imam, 'berdiri'); imam.tagEl.textContent = `📖 Pembimbing: ${nm}`;
      caption('🌙 Marhaban ya Ramadan · tadarus bersama');
      later(900, () => modal(`<div class="tag">📖 Tadarus · QS Al-Baqarah: 183</div><div class="doa"><span class="ar">يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ</span><small>Artinya: Wahai orang-orang yang beriman, diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang-orang sebelum kamu, agar kamu bertakwa.</small></div>`,
        [['📖 Baca bersama', () => {
          closeModal(); if (!GURU) { addPts(5); toast('+5 ⭐ Tadarus Al-Qur\'an'); }
          jamaah.slice(0, 10).forEach((p, i) => later(i * 150, () => bubble(p, 'Yaa ayyuhalladziina aamanuu…', 1800)));
          later(2400, () => say([
            { p: imam, t: 'Alhamdulillah, hari ini hari pertama puasa Ramadan 1448 H. Puasa bukan hanya menahan lapar dan haus.', e: 'senang' },
            { p: imam, t: 'Puasa juga menahan lisan dari berkata buruk, menahan marah, dan memperbanyak amal saleh.' },
            { p: imam, t: 'Rasulullah ﷺ bersabda: siapa berpuasa Ramadan karena iman dan mengharap pahala, diampuni dosa-dosanya yang telah lalu.' },
          ], () => evQuiz([
            ['Tujuan puasa menurut QS Al-Baqarah: 183 adalah agar kita…', ['Kenyang di malam hari', 'Bertakwa', 'Kurus'], 1, 'La\'allakum tattaquun: agar kalian bertakwa.'],
            ['Saat berpuasa, kita juga harus menahan…', ['Lisan dan amarah', 'Senyum', 'Sholat sunnah'], 0, 'Puasa juga menjaga lisan dan menahan marah.'],
          ], () => { closeModal(); masjidScene(() => bukaBersama()); }))); }, 'main']]));
    });
  },
  idulfitri() {
    sholatId('Sholat Idulfitri 1448 H', [
      'Alhamdulillah, setelah sebulan berpuasa, hari ini kita kembali kepada fitrah. Taqabbalallahu minna wa minkum.',
      'Idulfitri adalah hari kemenangan: menang melawan hawa nafsu. Jaga semangat ibadah Ramadan di bulan-bulan berikutnya.',
      'Mari saling memaafkan, sambung silaturahmi, dan bayarlah zakat fitrah bagi yang belum.'],
    (im) => {
      caption('🤝 Halal bihalal');
      const me = meP(), gs = [acAdd(teacherModel(me ? 'P' : 'L', 3), player.position.x + 1.6, player.position.z - 1.2, -Math.PI / 2, me ? 'Ustadzah wali kelas' : 'Ustadz wali kelas'),
        acAdd(studentModel(me, 30), player.position.x - 1.6, player.position.z - 1.2, Math.PI / 2, 'Teman sekelas')];
      say([{ p: gs[0], t: 'Selamat Hari Raya Idulfitri. Taqabbalallahu minna wa minkum.', e: 'senang', ch: [
        ['🤝 "Mohon maaf lahir dan batin, Ustadz/Ustadzah."', () => { playAnim(player, GURU ? 'beritangan' : 'salim', 1.4); playAnim(gs[0], 'beritangan', 1.4); if (!GURU) { addPts(4); toast('+4 ⭐ Saling memaafkan'); }
          say([{ p: gs[0], t: 'Sama-sama, Nak. Semoga Allah menerima amal kita semua.', e: 'senang' }, { p: gs[1], t: 'Mohon maaf lahir dan batin, ya. Selama ini aku sering bercanda kelewatan.' },
            { p: player, t: 'Sama-sama. Aku juga minta maaf. Taqabbalallahu minna wa minkum.', e: 'senang' }], () => endEvent('Selamat Hari Raya Idulfitri 1448 H. Mohon maaf lahir dan batin.')); }]] }]);
    });
  },
  iduladha() {
    sholatId('Sholat Iduladha 1448 H', [
      'Hari ini kita mengenang ketaatan Nabi Ibrahim dan Nabi Ismail alaihimassalam kepada perintah Allah.',
      'Kurban mengajarkan keikhlasan dan kepedulian: daging kurban dibagikan kepada tetangga dan yang membutuhkan.',
      'Yang sampai kepada Allah bukan daging dan darahnya, melainkan ketakwaan kita.'],
    () => {
      fade('Panitia kurban sekolah', 700, () => {
        acaraClear(); zone = 'acara';
        const me = meP();
        // tempat pembagian daging: meja panjang & kantong-kantong
        const tbl = acAdd({ shirt: 0x3a6e4a, bottom: 0x333333, peci: 0x222222 }, -6, 30, 0, 'Panitia Kurban');
        for (let i = 0; i < 6; i++) acAdd(studentModel(me, i + 40), -10 + i * 2.2, 33, Math.PI);
        placePlayer(-2, 32.5, Math.PI);
        acCamSet(-4, 12, 44, -4, 0, 30);
        caption('🐄 Hewan kurban telah disembelih panitia sesuai syariat. Ayo bantu membungkus daging!');
        say([{ p: tbl, t: `${state.nama}, tolong bantu bungkus daging ke dalam kantong, ya. Tekan secepatnya!`, e: 'senang' }], () => {
          singleTap('📦 Bungkus daging kurban', 14, () => {
            if (!GURU) { addPts(8); toast('+8 ⭐ Membantu panitia kurban'); }
            const warga = acAdd({ putri: true, shirt: 0x7a4a6a, bottom: 0x3a3a3a, hijab: 0x3b5e9e }, 2, 34, -Math.PI / 2, 'Warga sekitar');
            say([{ p: player, t: "Assalamu'alaikum, Bu. Ini daging kurban dari sekolah." }, { p: warga, t: "Wa'alaikumussalam. MasyaAllah, terima kasih, Nak. Semoga berkah.", e: 'senang' }],
              () => endEvent('Selamat Hari Raya Iduladha 1448 H. Semoga kurban kita diterima Allah.'));
          });
        });
      });
    });
  },
  hariGuru() {
    fade('Upacara Hari Guru Nasional', 900, () => {
      zone = 'acara'; minutes = 7 * 60 + 30; hud(); acaraClear();
      walkers.forEach((n) => { n.visible = false; n.path = null; });
      const me = meP(), meName = String(state.nama).toLowerCase();
      // podium kepala sekolah di atas mimbar, di depan tiang bendera
      const pod = new THREE.Group(); pod.name = 'podium';
      [[0, 0.62 + 0.55, 18.05, 0.9, 1.1, 0.6, 0x6b4a2b], [0, 1.78, 18.0, 1.0, 0.08, 0.7, 0x8a5a2b], [0, 1.45, 18.37, 0.6, 0.35, 0.02, 0x2f6b4a]].forEach(([x, y, z, w, h, d, c]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); pod.add(m); });
      scene.add(pod); acaraPeople.push(pod);
      const kep = acAdd(teacherModel(KEPS_STAFF[0].g || 'L', 0), 0, 17.3, 0, `${KEPS_STAFF[0].p} · Kepala Sekolah`); kep.position.y = 0.62; kep.base.y = 0.62;
      // semua guru berbaris: ustadz di sisi putra (kiri lapangan), ustadzah di sisi putri (kanan), diberi jarak
      const L = Object.keys(TEACH).filter((t) => TEACH[t].g === 'L').map((t) => TEACH[t].p), P = Object.keys(TEACH).filter((t) => TEACH[t].g === 'P').map((t) => TEACH[t].p);
      let placed = false;
      const row = (list, sign) => list.slice(0, 14).forEach((nm, i) => {
        const x = sign * (4.6 + (i % 7) * 1.9), z = 17.4 + Math.floor(i / 7) * 1.6;
        if (GURU && nm.toLowerCase() === meName) { placePlayer(x, z, 0); placed = true; return; }
        acAdd(teacherModel(sign < 0 ? 'L' : 'P', i), x, z, 0, null).name = nm;   // tanpa nama di atas kepala; hanya kepala sekolah yang bernama
      });
      row(L, -1); row(P, 1);
      if (player.tagEl) player.tagEl.style.visibility = 'hidden';           // nama guru (pemain) juga disembunyikan saat upacara
      if (GURU && !placed) placePlayer(me ? 4.6 + 7 * 1.9 : -4.6 - 7 * 1.9, 17.4, 0);
      // murid: putra di depan barisan ustadz, putri di depan barisan ustadzah; tengah dikosongkan beberapa langkah
      const murid = [];
      for (let s = 0; s < 2; s++) for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
        const putri = s === 1, x = (putri ? 1 : -1) * (5 + c * 2), z = 22.6 + r * 1.9;
        if (!GURU && putri === me && r === 0 && c === 2) continue;
        murid.push(acAdd(studentModel(putri, s * 18 + r * 6 + c), x, z, Math.PI));
      }
      if (!GURU) placePlayer((me ? 1 : -1) * (5 + 2 * 2), 22.6, Math.PI);
      const ketua = murid.find((m, i) => i === (me ? 18 : 0)) || murid[0];
      acCamSet(0, 11, 37, 0, 1, 19.5);
      caption('🌹 Upacara Hari Guru Nasional · 25 November');
      const wali = acaraPeople.find((p) => p.name && p !== kep) || kep;
      later(900, () => say([
        { p: kep, t: 'Bismillah. Hari ini kita memperingati Hari Guru Nasional. Guru adalah orang tua kedua kalian di sekolah.', e: 'senang' },
        { p: kep, t: 'Kepada seluruh ustadz dan ustadzah, terima kasih atas kesabaran dan keikhlasan dalam mendidik. Semoga menjadi amal jariyah.' },
        { p: ketua, t: 'Mewakili teman-teman, kami mengucapkan terima kasih kepada semua ustadz dan ustadzah. Mohon maaf bila kami sering membuat repot.', e: 'senang' },
      ], () => himneGuru(() => {
        caption('💐 Murid memberikan bunga dan ucapan kepada para guru');
        const gurusSama = acaraPeople.filter((p) => p.armR && p !== kep && p.rotation.y === 0 && (p.position.x < 0) === !me);
        murid.filter((m) => (m.position.x > 0) === me).slice(0, 5).forEach((m, i) => later(i * 450, () => { const g = gurusSama[i]; if (!g) return; playAnim(m, 'salim', 1.3); bubble(m, 'Selamat Hari Guru!', 1700); later(800, () => bubble(g, 'Terima kasih, Nak.', 1500)); }));
        later(3000, () => {
          if (GURU) {
            const m = murid.find((q) => (q.position.x > 0) === me);
            return say([{ p: m, t: `Selamat Hari Guru, ${state.nama}! Terima kasih sudah sabar mengajar kami. Ini kartu ucapan dari kelas kami.`, e: 'senang', ch: [
              ['😊 "MasyaAllah, terima kasih, anak-anak. Semoga ilmunya berkah."', () => guruTutupHG(kep)],
              ['🤲 "Jazakumullahu khairan. Kami doakan kalian sukses dunia akhirat."', () => guruTutupHG(kep)]] }]);
          }
          const g = gurusSama[0] || wali;
          say([{ p: g, t: 'Terima kasih, anak-anak. Kalian mengingat jasa guru; itu tanda adab yang baik.', e: 'senang', ch: [
            ['💌 Beri kartu ucapan', () => giftGuru(g, 'kartu ucapan', kep)], ['🌹 Beri bunga', () => giftGuru(g, 'bunga', kep)], ['🤲 Doakan guru', () => giftGuru(g, 'doa', kep)]] }]);
        });
      })));
    });
  },
  hariIbu() {
    fade('Peringatan Hari Ibu · 22 Desember', 900, () => {
      zone = 'acara'; minutes = 7 * 60 + 30; hud(); acaraClear();
      const me = meP();
      const us = acAdd(teacherModel('P', 2), 0, 17.5, 0, (KEPS_STAFF.find((k) => k.g === 'P') || { p: 'Ustadzah' }).p + ' · Pembina');
      for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) { if (!GURU && r === 0 && c === 2) continue; acAdd(studentModel(me, r * 6 + 30 + c), -7.5 + c * 3, 22.5 + r * 2.2, Math.PI); }
      if (GURU) placePlayer(4, 17.5, 0); else placePlayer(-1.5, 22.5, Math.PI);
      acCamSet(0, 9, 33, 0, 1, 19.5);
      caption('💐 Selamat Hari Ibu');
      later(900, () => say([
        { p: us, t: 'Anak-anakku, hari ini kita memperingati Hari Ibu. Ibu mengandung, melahirkan, dan merawat kita dengan penuh kasih sayang.', e: 'senang' },
        { p: us, t: 'Rasulullah ﷺ menyebut "ibumu" tiga kali ketika ditanya siapa yang paling berhak kita perlakukan dengan baik, baru kemudian ayahmu.' },
        { p: us, t: 'Hari ini, tulislah surat untuk ibu kalian. Sampaikan terima kasih, maaf, dan doa. Nanti berikan kepada ibu di rumah.' },
      ], () => {
        if (GURU) return endEvent('Selamat Hari Ibu. Semoga Allah merahmati para ibu kita.');
        modal(`<div class="tag">✉️ Surat untuk Ibu</div><div class="big">Apa yang ingin kamu tulis?</div>`, [
          ['💗 "Terima kasih, Ibu, sudah merawatku dengan sabar setiap hari."', () => suratIbu()],
          ['🙏 "Maafkan aku, Bu, kalau sering membantah dan membuat Ibu sedih."', () => suratIbu()],
          ['🤲 "Ya Allah, sayangilah Ibu sebagaimana Ibu menyayangiku di waktu kecil."', () => suratIbu()],
        ]);
      }));
    });
  },

};
function giftGuru(g, what, kep) {
  playAnim(player, 'salim', 1.4);
  const nm = g.name || (g.tagEl ? g.tagEl.textContent : 'Ustadz');
  const line = what === 'doa' ? `Semoga Allah membalas kebaikan ${nm} dengan surga. Jazakumullahu khairan.` : `Ini ${what} untuk ${nm}. Terima kasih sudah mengajar kami dengan sabar.`;
  if (!GURU) { addPts(6); toast('+6 ⭐ Menghormati guru'); }
  say([{ p: player, t: line }, { p: g, t: 'MasyaAllah, terima kasih, Nak. Doa kalian sangat berarti. Belajarlah dengan sungguh-sungguh, ya.', e: 'senang' }], () => guruTutupHG(kep));
}
function guruTutupHG(kep) {
  say([{ p: kep, t: 'Mari kita tutup dengan doa, lalu foto bersama. Semoga guru dan murid sama-sama diberkahi Allah.', e: 'senang' }], () => {
    caption('📸 Foto bersama guru dan murid'); const f = $('fade'); f.querySelector('span').textContent = '📸 Cekrek!'; f.style.background = '#fff';
    f.classList.add('show'); setTimeout(() => { f.classList.remove('show'); f.style.background = ''; }, 350);
    later(1600, () => { caption(''); endEvent('Selamat Hari Guru Nasional. Guru adalah pewaris ilmu; hormati dan doakan mereka.'); });
  });
}
function suratIbu() {
  closeModal();
  modal(`<div class="tag">🤲 Doa untuk kedua orang tua</div><div class="doa"><span class="ar">رَبِّ اغْفِرْ لِيْ وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِيْ صَغِيْرًا</span><i>Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa</i><small>Artinya: Ya Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah keduanya sebagaimana mereka menyayangiku di waktu kecil.</small></div>`,
    [['🤲 Aamiin', () => { closeModal(); addPts(6); toast('+6 ⭐ Berbakti kepada orang tua'); bubble(player, 'Nanti suratnya kuberikan ke Ibu.', 2000); later(2200, () => endEvent('Selamat Hari Ibu. Jangan lupa berikan suratmu dan peluk ibumu hari ini.')); }, 'main']]);
}
function bukaBersama() {
  fade('Menjelang berbuka · halaman sekolah', 900, () => {
    zone = 'acara'; acaraClear(); minutes = 17 * 60 + 50; hud();
    const me = meP();
    // tikar & takjil
    for (let s = 0; s < 2; s++) {
      const x0 = s ? 12 : -12, putri = s === 1;
        for (let c = 0; c < 6; c++) {
        const x = x0 + (putri ? 1 : -1) * c * 2.2;
        const mat1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 3.4), mat(putri ? 0xd9577a : 0x3b7dd8)); mat1.position.set(x, 0.05, 25); scene.add(mat1); acaraPeople.push(mat1);
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 12), mat(0xffffff)); plate.position.set(x, 0.1, 25); scene.add(plate); acaraPeople.push(plate);
        for (let d = 0; d < 3; d++) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), mat(0x5a2e1a)); k.position.set(x - 0.1 + d * 0.1, 0.16, 25); scene.add(k); acaraPeople.push(k); }
        const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.2, 8), mat(0xbfe3f5)); gl.position.set(x + 0.3, 0.2, 25.2); scene.add(gl); acaraPeople.push(gl);
        [24, 26].forEach((z, j) => { if (putri === me && c === 2 && j === 1) return; const p = acAdd(studentModel(putri, s * 12 + c * 2 + j), x, z, j ? Math.PI : 0); pose(p, 'duduk'); });
      }
    }
    placePlayer((me ? 12 + 2 * 2.2 : -12 - 2 * 2.2), 26, Math.PI); pose(player, 'duduk');
    acCamSet(0, 15, 42, 0, 0, 25);
    caption('🌇 Menunggu azan Maghrib… perbanyak doa, waktu yang mustajab');
    later(4200, () => { minutes = 18 * 60 + 5; hud(); playAzan(); caption('Azan Maghrib berkumandang · waktunya berbuka'); });
    later(7500, () => modal(`<div class="tag">🤲 Doa berbuka puasa</div><div class="doa"><span class="ar">ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللّٰهُ</span><i>Dzahabazh zhoma'u wabtallatil 'uruuqu wa tsabatal ajru in syaa Allah</i><small>Artinya: Telah hilang rasa haus, urat-urat telah basah, dan pahala telah tetap, insya Allah. (HR. Abu Dawud)</small></div>`,
      [['🌴 Berbuka dengan kurma & air', () => {
        closeModal(); if (!GURU) { addPts(6); toast('+6 ⭐ Puasa hari pertama tuntas'); }
        [player, ...acaraPeople.filter((p) => p.armR)].forEach((p, i) => later(i * 40, () => playAnim(p, 'suap', 1.4)));
        bubble(player, 'Alhamdulillah… segarnya.', 1800);
        later(2600, () => { caption('Lanjut sholat Maghrib berjamaah, lalu makan bersama'); });
        later(5200, () => { caption(''); endEvent('Selamat menunaikan ibadah puasa Ramadan 1448 H. Semoga Allah menerima puasa kita.'); });
      }, 'main']]));
  });
}
// tombol tekan tunggal dengan batas waktu (dipakai untuk membungkus daging kurban)
function singleTap(title, max, done) {
  lomba = { kind: 'tunggal', all: [player], prog: [0], rate: [0], t: 0, max, done: false, go: true, lbl: [title], single: done };
  lombaUI(true); $('lombaCount').textContent = '';
}
function tunggalDone() { if (!lomba || lomba.done) return; lomba.done = true; lombaUI(false); player.armL.rotation.x = player.armR.rotation.x = 0; const d = lomba.single; lomba = null; d(); }

// ---------- Himne Guru: diputar dari berkas himne-guru.mp3 (diunggah sekolah) bila tersedia ----------
let himneAudio = null;
// pilihan: bernyanyi bersama (±2 menit, bisa dilewati kapan saja) atau langsung lewati
function himneGuru(done) {
  caption('🎵 Menyanyikan Himne Guru');
  modal('<div class="tag">🎵 Himne Guru</div><div class="big">Menyanyikan Himne Guru</div><p class="muted">Lagunya sekitar 2 menit. Mau bernyanyi bersama atau lewati?</p>',
    [['🎤 Bernyanyi bersama', () => { closeModal(); nyanyiHimne(done); }, 'main'], ['⏭ Lewati lagu', () => { closeModal(); caption(''); done(); }]]);
}
function nyanyiHimne(done) {
  caption('🎵 Semua peserta berdiri tegap dan menyanyikan Himne Guru bersama-sama');
  let selesai = false;
  const fin = () => {
    if (selesai) return; selesai = true;
    try { himneAudio && himneAudio.pause(); } catch (e) { /* abaikan */ }
    Audio.duck(false); clearInterval(nada); closeModal(); caption(''); done();
  };
  const orang = acaraPeople.filter((p) => p.armR);
  const nada = setInterval(() => { const p = pick(orang); if (p) bubble(p, '🎵', 1400); }, 900);   // tanda sedang bernyanyi
  try {
    himneAudio = new window.Audio('himne-guru.mp3'); himneAudio.volume = 0.95;
    Audio.duck(true);
    himneAudio.onended = fin;
    himneAudio.onerror = () => later(6000, fin);
    himneAudio.play().catch(() => later(6000, fin));
  } catch (e) { later(6000, fin); }
  if (!GURU) { addPts(4); toast('+4 ⭐ Menyanyikan Himne Guru dengan khidmat'); }
  later(600, () => { if (!selesai) { modal('<div class="tag">🎵 Himne Guru</div><p class="muted">Sedang bernyanyi bersama…</p>', [['⏭ Lewati / lanjutkan acara', fin, 'small']]); $('modal').classList.add('low'); } });
}
