
// =====================================================================
//  MASJID: sholat berjamaah (shaf putra di depan, shaf putri di belakang tabir)
// =====================================================================
const MSJ = new THREE.Vector3(-320, 0, 120);
const ms = new THREE.Group(); ms.position.copy(MSJ); scene.add(ms);
const mbox = (x, y, z, w, h, d, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; ms.add(m); return m; };
{
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#2f7d4f'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#3a9460'; x.fillRect(0, 0, 64, 40); x.fillStyle = '#e8d38a'; x.fillRect(0, 60, 64, 4);
  const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(14, 13); tx.colorSpace = THREE.SRGBColorSpace;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(28, 24), new THREE.MeshLambertMaterial({ map: tx })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; fl.receiveShadow = true; ms.add(fl);
  const W = 0xf6ecd6;
  mbox(0, 2.5, -12, 28.3, 5, 0.3, W); mbox(-14, 2.5, 0, 0.3, 5, 24, W); mbox(14, 2.5, 0, 0.3, 5, 24, W);
  for (let i = 0; i < 5; i++) mbox(13.8, 2.6, -9 + i * 4.4, 0.06, 2.2, 2, 0x8fd3f0);
  mbox(0, 2.2, -11.75, 3.2, 4.4, 0.3, 0xd8c08a); mbox(0, 2.0, -11.6, 2.2, 3.6, 0.2, 0x2f6b4a);        // mihrab
  mbox(3.2, 0.9, -10.6, 1.4, 1.8, 1.4, 0x8a5a2b); mbox(3.2, 2.0, -11.0, 1.4, 0.6, 0.6, 0x8a5a2b);     // mimbar
  for (let i = 0; i < 5; i++) mbox(-13.8, 2.6, -9 + i * 4.4, 0.06, 2.2, 2, 0x8fd3f0);                // jendela
  // tabir (pembatas) antara shaf putra dan shaf putri
  for (let i = 0; i < 13; i++) { mbox(-12 + i * 2, 0.95, 2.2, 1.8, 1.9, 0.12, 0x9b6b3c); mbox(-12 + i * 2, 1.0, 2.15, 1.4, 1.4, 0.05, 0xd8c08a); }

  const s1 = label('Shaf Putra', 0, 0, 0, 0.6); scene.remove(s1); s1.position.set(-10.5, 0.6, -5.7); ms.add(s1);
  const s2 = label('Shaf Putri (di balik tabir)', 0, 0, 0, 0.6); scene.remove(s2); s2.position.set(-9.5, 0.6, 9.2); ms.add(s2);
}
let jamaah = [], imam = null;
function buildJamaah() {
  jamaah.forEach((p) => ms.remove(p)); jamaah = [];
  if (imam) ms.remove(imam);
  // imam bergiliran: setiap sholat berjamaah dipimpin ustadz yang berbeda
  const pool = Object.keys(TEACH).filter((t) => TEACH[t].g === 'L').sort((a, b) => TEACH[a].p.localeCompare(TEACH[b].p, 'id'));
  let turn = 0; try { turn = +(localStorage.getItem('hds-imam') || 0); localStorage.setItem('hds-imam', turn + 1); } catch (e) { turn = Math.floor(Math.random() * 99); }
  const imamName = pool[turn % pool.length];
  imam = makePerson(teacherModel('L', turn % 4)); imam.position.set(0, 0, -9.3); imam.rotation.y = Math.PI; ms.add(imam);
  nameTag(imam, '🕌 Imam: ' + teacherInfo(imamName).p, 0.55); imam.tagEl.classList.add('imam'); imam.base = imam.position.clone();
  setTimeout(() => toast(`Imam sholat kali ini: ${teacherInfo(imamName).p}`), 1200);
  const rows = [[false, -6.6], [false, -4.8], [true, 5.4], [true, 7.2]];
  const me = meP();
  rows.forEach(([putri, z], r) => {
    for (let i = 0; i < 11; i++) {
      const x = -7.5 + i * 1.5;
      if (putri === me && r % 2 === 0 && i === 6) continue;                   // tempat pemain
      const m = makePerson(putri ? { putri: true, shirt: 0xffffff, bottom: 0xffffff, hijab: 0xffffff, skin: SKINS[i % 4] } : { shirt: 0xffffff, bottom: 0x6d6f73, peci: 0xffffff, tie: false, skin: SKINS[i % 4] });
      m.position.set(x, 0, z); m.rotation.y = Math.PI; m.base = m.position.clone(); ms.add(m); jamaah.push(m);
    }
  });
}
function pose(p, name) {
  const b = p.base || p.position; p.position.copy(b);
  p.rotation.x = 0; p.legL.rotation.x = p.legR.rotation.x = 0;
  p.armL.rotation.set(0, 0, 0); p.armR.rotation.set(0, 0, 0);
  const fwd = (d) => { p.position.x += Math.sin(p.rotation.y) * d; p.position.z += Math.cos(p.rotation.y) * d; };
  if (name === 'takbir') { p.armL.rotation.x = p.armR.rotation.x = -2.7; p.armL.rotation.z = -0.25; p.armR.rotation.z = 0.25; }
  if (name === 'sedekap') { p.armL.rotation.x = p.armR.rotation.x = -1.0; p.armR.rotation.z = 0.75; p.armL.rotation.z = -0.75; }
  if (name === 'rukuk') { const a = 1.3; p.rotation.x = a; p.legL.rotation.x = p.legR.rotation.x = -a; p.position.y = 0.8 * (1 - Math.cos(a)); fwd(-0.8 * Math.sin(a)); p.armL.rotation.x = p.armR.rotation.x = -0.35; }
  if (name === 'sujud') { const a = 1.75; p.rotation.x = a; p.legL.rotation.x = p.legR.rotation.x = -a - 1.4; p.position.y = 0.15; fwd(-0.9); p.armL.rotation.x = p.armR.rotation.x = -1.2; }
  if (name === 'duduk' || name === 'salamKanan' || name === 'salamKiri') {
    p.position.y = -0.42; p.legL.rotation.x = p.legR.rotation.x = 1.45; p.armL.rotation.x = p.armR.rotation.x = -0.7;
  }
  if (name === 'salamKanan') p.rotation.z = 0, p.rotation.y = (p.baseRot ?? Math.PI) - 0.6;
  else if (name === 'salamKiri') p.rotation.y = (p.baseRot ?? Math.PI) + 0.6;
  else p.rotation.y = p.baseRot ?? Math.PI;
}
const msCam = new THREE.Vector3(), msLook = new THREE.Vector3();
function setMsCam() {
  const portrait = innerWidth < innerHeight;
  msCam.set(0, portrait ? 20 : 13, portrait ? 25 : 17).add(MSJ);
  msLook.set(0, 0, -2.5).add(MSJ);
}
function masjidScene(done) {
  buildJamaah(); setMsCam();
  fade('Masuk masjid…', 800, () => {
    zone = 'masjid'; hud();
    const me = meP();
    player.base = new THREE.Vector3(-7.5 + 6 * 1.5, 0, me ? 5.4 : -6.6).add(MSJ);
    player.baseRot = Math.PI; player.rotation.y = Math.PI;
    sitPose(player, false); pose(player, 'berdiri');
    camera.position.copy(msCam); camera.lookAt(msLook);
    const all = () => [imam, ...jamaah, player];
    all().forEach((p) => { if (p !== player) p.baseRot = Math.PI; pose(p, 'berdiri'); });
    const steps = [
      [0, () => { caption('Iqamah… luruskan dan rapatkan shaf'); bubble(imam, 'Sawwuu shufuufakum…', 2400); }],
      [2600, () => { caption('Takbiratul ihram'); bubble(imam, 'Allahu Akbar', 1500); all().forEach((p) => pose(p, 'takbir')); }],
      [4000, () => { caption('Berdiri: membaca Al-Fatihah'); all().forEach((p) => pose(p, 'sedekap')); }],
      [6600, () => { caption('Rukuk'); bubble(imam, 'Allahu Akbar', 1200); all().forEach((p) => pose(p, 'rukuk')); }],
      [8200, () => { caption("I'tidal"); bubble(imam, "Sami'allahu liman hamidah", 1400); all().forEach((p) => pose(p, 'berdiri')); }],
      [9800, () => { caption('Sujud'); bubble(imam, 'Allahu Akbar', 1200); all().forEach((p) => pose(p, 'sujud')); }],
      [11400, () => { caption('Duduk di antara dua sujud'); all().forEach((p) => pose(p, 'duduk')); }],
      [12800, () => { caption('Sujud kedua'); all().forEach((p) => pose(p, 'sujud')); }],
      [14300, () => { caption('Tasyahud akhir (gerakan diringkas)'); all().forEach((p) => pose(p, 'duduk')); }],
      [16300, () => { caption('Salam'); bubble(imam, "Assalamu'alaikum warahmatullah", 1400); all().forEach((p) => pose(p, 'salamKanan')); }],
      [17700, () => { all().forEach((p) => pose(p, 'salamKiri')); }],
      [19000, () => { caption('Berdzikir & berdoa'); all().forEach((p) => pose(p, 'duduk')); }],
      [21000, () => { caption(''); all().forEach((p) => pose(p, 'berdiri')); player.base = null; player.position.y = 0; done(); }],
    ];
    steps.forEach(([t, fn]) => later(t + 600, fn));
  });
}
function caption(t) { const el = $('qbanner'); el.innerHTML = t ? `🕌 ${esc(t)}` : ''; el.classList.toggle('show', !!t); el.classList.toggle('cap', !!t); document.body.classList.toggle('sholat', !!t && zone === 'masjid'); }

// =====================================================================
//  ARENA TUGAS ala ZEP QUIZ: pos soal berurutan, gerbang terbuka bila benar, pos O/X
// =====================================================================
const QZ = new THREE.Vector3(-320, 0, -140);
const qz = new THREE.Group(); qz.position.copy(QZ); scene.add(qz);
const STATION_Z = [6, -10, -26, -42, -58];
let qzParts = [], quiz = null;
function qadd(m) { qz.add(m); qzParts.push(m); return m; }
function qbox(x, y, z, w, h, d, c, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), opts.basic ? new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: opts.opacity ?? 1 }) : mat(c));
  m.position.set(x, y, z); m.castShadow = !opts.basic; m.receiveShadow = true; return qadd(m);
}
{
  const water = new THREE.Mesh(new THREE.PlaneGeometry(120, 160), mat(0x4fb3e0)); water.rotation.x = -Math.PI / 2; water.position.set(0, -0.6, -25); qz.add(water);
  const path = new THREE.Mesh(new THREE.BoxGeometry(14, 1, 92), mat(0x9fd77a)); path.position.set(0, -0.5, -25); path.receiveShadow = true; qz.add(path);
  for (let z = 18; z > -70; z -= 4) { const t = new THREE.Mesh(new THREE.PlaneGeometry(4, 3.6), mat(((z / 4) & 1) ? 0xf6e7c8 : 0xffe3a3)); t.rotation.x = -Math.PI / 2; t.position.set(0, 0.02, z); qz.add(t); }
  for (let z = 16; z > -68; z -= 7) [-6.4, 6.4].forEach((x) => {
    const l = new THREE.Mesh(treeGeoL, mat(0x3f9a47)); l.position.set(x, 1.7, z); l.scale.setScalar(0.7); qz.add(l);
    const t = new THREE.Mesh(treeGeoT, mat(0x7a5230)); t.position.set(x, 0.6, z); qz.add(t);
  });
  [[-7, -25, 92], [7, -25, 92]].forEach(([x, z, d]) => colliders.push({ x1: QZ.x + x - 0.5, z1: QZ.z + z - d / 2, x2: QZ.x + x + 0.5, z2: QZ.z + z + d / 2 }));
  colliders.push({ x1: QZ.x - 7, z1: QZ.z + 21, x2: QZ.x + 7, z2: QZ.z + 22 }, { x1: QZ.x - 7, z1: QZ.z - 72, x2: QZ.x + 7, z2: QZ.z - 71 });
  // gapura start & finish
  [[16, 'MULAI', 0x3b7dd8], [-66, 'FINISH', 0xe0623e]].forEach(([z, t, c]) => {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5, 0.6), mat(c)); a.position.set(-6, 2.5, z); qz.add(a);
    const b = a.clone(); b.position.x = 6; qz.add(b);
    const top = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.8, 0.8), mat(c)); top.position.set(0, 5, z); qz.add(top);
    const s = label(t, 0, 0, 0, 1.4, true); scene.remove(s); s.position.set(0, 6.2, z); qz.add(s);
  });
}
const quizCam = () => { const p = innerWidth < innerHeight; return new THREE.Vector3(0, p ? 17 : 12, p ? 15 : 10); };
let qCols = [];
function buildArena(qs, mapel) {
  qzParts.forEach((m) => { qz.remove(m); }); qzParts = [];
  qCols.forEach((c) => { const k = colliders.indexOf(c); if (k >= 0) colliders.splice(k, 1); }); qCols = [];
  quiz.barriers = []; quiz.stations = [];
  const title = label(mapel, 0, 0, 0, 1.3); scene.remove(title); title.position.set(0, 8.2, 16); qadd(title);
  qs.forEach((q, i) => {
    const z = STATION_Z[i];
    const st = { q, z, i, solved: false };
    if (q.t === 'ox') {
      const o = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.3, 32), mat(0x58ad4e)); o.position.set(-3.3, 0.15, z); qadd(o);
      const x = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.3, 32), mat(0xe0623e)); x.position.set(3.3, 0.15, z); qadd(x);
      const so = label('O  (Benar)', 0, 0, 0, 0.9); scene.remove(so); so.position.set(-3.3, 1.6, z); qadd(so);
      const sx = label('X  (Salah)', 0, 0, 0, 0.9); scene.remove(sx); sx.position.set(3.3, 1.6, z); qadd(sx);
    } else {
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 1.0, 16), mat(0x7a5aa8)); ped.position.set(0, 0.5, z); qadd(ped);
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.0, 32), new THREE.MeshBasicMaterial({ color: 0xffc83d })); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.05, z); qadd(ring);
      const qm = label('?', 0, 0, 0, 1.4, true); scene.remove(qm); qm.position.set(0, 2.6, z); qadd(qm); st.qm = qm;
    }
    const s = label(`Pos ${i + 1}`, 0, 0, 0, 0.7); scene.remove(s); s.position.set(-5, 2.2, z + 3); qadd(s);
    const bar = qbox(0, 1.6, z - 6, 12, 3.2, 0.4, 0xff5a5a, { basic: true, opacity: 0.45 });
    const col = { x1: QZ.x - 6, z1: QZ.z + z - 6.3, x2: QZ.x + 6, z2: QZ.z + z - 5.7 }; colliders.push(col); qCols.push(col);
    quiz.barriers.push({ mesh: bar, col }); quiz.stations.push(st);
  });
  // teman sekelas yang ikut berlomba (seperti melihat progres teman di ZEP)
  quiz.rivals = [];
  const putri = isPutri(state.cls);
  for (let i = 0; i < 3; i++) {
    const r = makePerson(studentModel(putri, i + 2)); r.position.set(-4 + i * 4 + (i === 1 ? 2 : 0), 0, 14); r.rotation.y = Math.PI; qadd(r);
    r.nm = classmateNames[i + 1]; nameTag(r, r.nm, 0.5); r.st = 0; r.wait = 0; r.done = false; r.time = 0;
    quiz.rivals.push(r);
  }
}
function openBarrier(i) {
  const b = quiz.barriers[i]; if (!b || b.open) return;
  b.open = true; const k = colliders.indexOf(b.col); if (k >= 0) colliders.splice(k, 1);
  b.mesh.visible = false;
}
function startQuiz(lesson, bank, done) {
  const n = Math.min(5, bank.length);
  const start = ((state.day - 1) * 2) % bank.length;
  const qs = []; for (let i = 0; i < n; i++) qs.push(bank[(start + i) % bank.length]);
  quiz = { lesson, qs, i: 0, score: 0, combo: 0, t: 0, done, ox: null, finished: false, correct: 0 };
  buildArena(qs, SUBJ[lesson.s] || lesson.s);
  fade('Membuka tugas…', 700, () => {
    zone = 'kuis'; $('modal').classList.remove('low'); Audio.setTrack('arena');
    sitPose(player, false);
    player.position.set(0, 0, 18).add(QZ); player.rotation.y = Math.PI;
    camera.position.copy(player.position).add(quizCam());
    $('qhud').classList.add('show'); $('top').style.display = 'none'; quizHud();
    modal(`<div class="tag">${lesson.lab ? 'Latihan Lab Komputer' : 'Tugas dari ' + esc(teacherInfo(lesson.g[0]).p)}</div><div class="big">🎮 ${esc(SUBJ[lesson.s] || lesson.s)}</div>
      <p>Lewati <b>${n} pos soal</b> sampai garis FINISH. Jawab benar untuk membuka gerbang merah.</p>
      <p class="muted">Pos ungu = pilihan ganda (injak tanda tanya)<br>Pos hijau/merah = O/X: berdiri di <b>O</b> jika benar, di <b>X</b> jika salah sebelum waktu habis.</p>`,
      [['Mulai!', () => { closeModal(); Audio.sfx('bell'); quiz.t0 = performance.now(); }, 'main']]);
  });
}
function quizHud() {
  if (!quiz) return;
  clearTimeout(quizHud.t); quizHud.t = setTimeout(quizHud, 500);
  $('qhud').innerHTML = `⏱ ${Math.floor(quiz.t)}d · ⭐ ${quiz.score} · Pos ${Math.min(quiz.i + 1, quiz.qs.length)}/${quiz.qs.length}${quiz.combo > 1 ? ` · 🔥 Combo x${quiz.combo}` : ''}`;
}
function solveStation(st, ok, sec) {
  if (ok) {
    quiz.combo++; quiz.correct++;
    const pts = 100 + Math.max(0, Math.round(sec)) * 5 + (quiz.combo - 1) * 20;
    quiz.score += pts; st.solved = true; openBarrier(st.i); quiz.i = st.i + 1;
    if (st.qm) st.qm.visible = false;
    Audio.sfx('ok'); toast(`Benar! +${pts}${quiz.combo > 1 ? ` (combo x${quiz.combo})` : ''}`);
    bubble(player, pick(['Yes!', 'Alhamdulillah!', 'Mantap!']), 1200);
  } else {
    quiz.combo = 0; quiz.score = Math.max(0, quiz.score - 20);
    Audio.sfx('no'); toast('Belum tepat, coba lagi! −20');
  }
  quizHud();
}
function askPG(st) {
  paused = true;
  const q = st.q, opts = shuffle(q.o.map((t, k) => ({ t, ok: k === 0 })));
  let left = 20; const t0 = performance.now();
  modal(`<div class="tag">Pos ${st.i + 1} · Pilihan ganda</div><div class="tbar"><i id="tfill"></i></div><div class="q">${q.q}</div><div id="fb"></div>`,
    opts.map((o) => [o.t, (ev) => {
      clearInterval(timer);
      document.querySelectorAll('#mbtns button').forEach((x) => (x.disabled = true));
      ev.currentTarget.classList.add(o.ok ? 'ok' : 'no');
      solveStation(st, o.ok, left);
      setTimeout(() => { closeModal(); if (!o.ok) player.position.z += 2.5; }, 700);
    }, 'opt']));
  const timer = setInterval(() => {
    left = 20 - (performance.now() - t0) / 1000;
    const f = $('tfill'); if (f) f.style.width = Math.max(0, left / 20 * 100) + '%';
    if (left <= 0) { clearInterval(timer); solveStation(st, false, 0); closeModal(); player.position.z += 2.5; }
  }, 100);
}
function startOX(st) {
  quiz.ox = { st, end: performance.now() + 10000 };
  const el = $('qbanner'); el.classList.add('show');
  Audio.sfx('greet');
}
function updateQuiz(dt) {
  if (zone !== 'kuis' || !quiz || quiz.finished) return;
  if (quiz.t0) quiz.t = (performance.now() - quiz.t0) / 1000;
  const lz = player.position.z - QZ.z, lx = player.position.x - QZ.x;
  const st = quiz.stations[quiz.i];
  if (st && !paused) {
    if (st.q.t === 'ox') {
      if (!quiz.ox && lz < st.z + 4.5) startOX(st);
      if (quiz.ox) {
        const left = (quiz.ox.end - performance.now()) / 1000;
        $('qbanner').innerHTML = `<b>O / X</b> · ${st.q.q} <span class="cd">${Math.ceil(Math.max(0, left))}</span>`;
        if (left <= 0) {
          const onO = Math.hypot(lx + 3.3, lz - st.z) < 2.5, onX = Math.hypot(lx - 3.3, lz - st.z) < 2.5;
          const ok = (onO && st.q.a === true) || (onX && st.q.a === false);
          $('qbanner').classList.remove('show');
          if (!onO && !onX) toast('Waktu habis! Berdirilah di O atau X');
          solveStation(st, ok, 4); quiz.ox = null;
          if (!ok) player.position.z = QZ.z + st.z + 5.5;
        }
      }
    } else if (Math.hypot(lx, lz - st.z) < 1.8) askPG(st);
  }
  if (!st && lz < -64) finishQuiz();
  // pergerakan teman pesaing
  for (const r of quiz.rivals) {
    if (r.done) continue;
    r.time += dt;
    const target = r.st < STATION_Z.length && r.st < quiz.qs.length ? STATION_Z[r.st] : -67;
    const dz = target - r.position.z;
    if (Math.abs(dz) > 0.2) { r.position.z += Math.sign(dz) * Math.min(Math.abs(dz), 3.6 * dt); r.walkT += dt * 10; const sw = Math.sin(r.walkT) * 0.6; r.legL.rotation.x = sw; r.legR.rotation.x = -sw; r.armL.rotation.x = -sw; r.armR.rotation.x = sw; }
    else if (target === -67) { r.done = true; bubble(r, 'Selesai!', 1500); }
    else { r.legL.rotation.x = r.legR.rotation.x = 0; r.wait += dt; if (!r.need) r.need = 4 + Math.random() * 9; if (r.wait > r.need) { r.wait = 0; r.need = 0; r.st++; if (Math.random() < 0.5) bubble(r, pick(['✓', 'Bisa!', 'Hmm…']), 900); } }
  }
}
function finishQuiz() {
  quiz.finished = true; $('qbanner').classList.remove('show');
  const mine = quiz.t, rank = 1 + quiz.rivals.filter((r) => r.done && r.time < mine).length;
  const list = [{ n: state.nama + ' (kamu)', t: mine }].concat(quiz.rivals.map((r) => ({ n: r.nm, t: r.done ? r.time : mine + 5 + Math.random() * 20 }))).sort((a, b) => a.t - b.t);
  const stars = quiz.correct === quiz.qs.length ? '⭐⭐⭐' : quiz.correct >= quiz.qs.length - 1 ? '⭐⭐' : '⭐';
  const pts = Math.round(quiz.score / 10); addPts(pts);
  lapor(quiz.lesson, 'arena', quiz.correct, quiz.qs.length, quiz.score);
  if (!quiz.lesson.lab) state.rapor = state.rapor || {}; if (!quiz.lesson.lab) state.rapor[quiz.lesson.s] = Math.max(state.rapor[quiz.lesson.s] || 0, Math.round(quiz.correct / quiz.qs.length * 100));
  Audio.sfx('bell');
  modal(`<div class="tag">Tugas selesai · ${esc(SUBJ[quiz.lesson.s])}</div><div class="big">${stars}</div>
    <p><b>${quiz.correct}/${quiz.qs.length}</b> benar · skor <b>${quiz.score}</b> · waktu ${Math.floor(mine)} detik</p>
    <div class="rank">${list.map((r, i) => `<div class="${r.n.includes('(kamu)') ? 'me' : ''}"><span>${i + 1}</span>${esc(r.n)}<em>${Math.floor(r.t)}d</em></div>`).join('')}</div>
    <p>+${pts} ⭐ masuk ke poin harian</p>`,
    [[labReturn ? 'Kembali ke lab' : 'Kembali ke kelas', () => {
      closeModal(); paused = true; $('qhud').classList.remove('show'); $('top').style.display = '';
      if (labReturn) { quiz = null; return fade('Kembali ke Lab Komputer…', 600, backToLab); }
      fade('Kembali ke kelas…', 600, () => { Audio.setTrack('sekolah'); const d = quiz.done; quiz = null; backToClass(d); });
    }, 'main']]);
}
