
// =====================================================================
//  GAME DI DALAM GAME: "Pesawat Ilmu" (3D) di Lab Komputer
//  Terbang lurus ke depan, kumpulkan koin, hindari balon, lewati cincin jawaban yang benar.
// =====================================================================
const PG = new THREE.Vector3(0, 0, -900);
const pg = new THREE.Group(); pg.position.copy(PG); scene.add(pg);
let fly = null;
const pgGround = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#7cc46a'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#6ab35a'; x.fillRect(0, 0, 64, 64); x.fillRect(64, 64, 64, 64);
  x.fillStyle = '#4fa3d8'; x.fillRect(56, 0, 16, 128);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 24); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(400, 800), new THREE.MeshLambertMaterial({ map: t })); m.rotation.x = -Math.PI / 2; m.position.y = -6; pg.add(m); return m;
})();
function makePlane() {
  const g = new THREE.Group();
  const b = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); g.add(m); return m; };
  b(0.9, 0.9, 3.4, 0xe0623e, 0, 0, 0);            // badan
  b(5.2, 0.12, 1.1, 0xffffff, 0, 0.05, -0.2);     // sayap
  b(1.9, 0.1, 0.7, 0xffffff, 0, 0.2, 1.5);        // sayap ekor
  b(0.12, 0.9, 0.7, 0xe0623e, 0, 0.6, 1.5);       // sirip
  b(0.7, 0.45, 0.9, 0x8fd3f0, 0, 0.55, -0.5);     // kaca kokpit
  const prop = b(1.8, 0.15, 0.06, 0x2b2b2b, 0, 0, -1.75); g.prop = prop;
  return g;
}
const flyer = makePlane(); flyer.visible = false; pg.add(flyer);
let labReturn = false;
const LAB_GAMES = [
  ['pesawat', '✈️ Pesawat Ilmu', 'Terbang melewati cincin jawaban yang benar'],
  ['battle', '⚔️ Battle Raksasa Lupa', 'Serang monster dengan jawaban yang benar'],
  ['naga', '🐉 Petualangan Naga (fantasi)', 'Duel sihir melawan Naga Penjaga Ilmu'],
  ['balap', '🏎️ Balap Ilmu', 'Pilih jalur jawaban yang benar untuk turbo'],
  ['arena', '🗺️ Arena Petualangan', 'Jelajahi pos soal sampai garis finish'],
];
function openLab() {
  modal(`<div class="tag">Lab Komputer</div><div class="big">🎮 Arcade Edukasi</div><p class="muted">Pilih permainan, lalu pilih mapel yang ingin dilatih.</p>`,
    LAB_GAMES.map(([id, t, d]) => [`${t}<br><small>${d}</small>`, () => labMapel(id), 'opt left']).concat([['Keluar', closeModal, 'small']]));
}
function labMapel(game) {
  const codes = Object.keys(QBANK).filter((k) => QBANK[k].length >= 3);
  modal(`<div class="tag">Lab Komputer · ${LAB_GAMES.find((g) => g[0] === game)[1]}</div><p class="muted">Pilih mapel (soal latihan dari bank soal mapel; nanti guru bisa menambahkannya sendiri)</p><div class="mbg">${codes.map((k) => `<button type="button" data-k="${k}">${esc(SUBJ[k] || k)}</button>`).join('')}</div>`,
    [['◀ Ganti permainan', openLab, 'small']]);
  document.querySelectorAll('.mbg button[data-k]').forEach((b) => (b.onclick = () => startLabGame(game, b.dataset.k)));
}
function startLabGame(game, code) {
  closeModal(); paused = true; labReturn = true;
  const lesson = { s: code, a: 'lab', b: '', g: [''], lab: true }, bank = QBANK[code], done = () => {};
  if (game === 'pesawat') startFly(code);
  else if (game === 'battle') startBattle(lesson, bank, done);
  else if (game === 'naga') startBattle(lesson, bank, done, 'naga');
  else if (game === 'balap') startRace(lesson, bank, done);
  else startQuiz(lesson, bank, done);
}
function backToLab() {
  labReturn = false; Audio.setTrack('sekolah'); player.visible = true;
  scene.background.set(0xbfe3f5); scene.fog.color.set(0xbfe3f5);
  const d = doorsOut.find((x) => x.id === 'lab'); goOutside(d.x, d.z + 1.5, 0);
}
function plainText(h) { const d = document.createElement('div'); d.innerHTML = h; return d.textContent; }
function flyQuestions(code) {
  const all = [];
  (code ? [code] : Object.keys(QBANK)).forEach((k) => QBANK[k].forEach((q) => all.push(q.t === 'pg' ? { q: q.q, o: q.o.slice(0, 3), s: k } : { q: q.q, o: q.a ? ['Benar', 'Salah'] : ['Salah', 'Benar'], s: k })));
  return shuffle(all).slice(0, 8);
}
function startFly(code) {
  const back = { x: player.position.x, z: player.position.z };
  fade('Memulai Pesawat Ilmu…', 700, () => {
    zone = 'pesawat'; hud(); Audio.setTrack('aksi');
    fly = { z: 0, x: 0, y: 6, vx: 0, vy: 0, speed: 12, want: 12, score: 0, lives: 3, objs: [], nextSpawn: -40, qs: flyQuestions(code), code, qi: 0, nextGate: -180, gate: null, back, over: false, inv: 0 };
    flyer.visible = true; flyer.position.set(0, 6, 0); flyer.rotation.set(0, 0, 0);
    player.visible = false;
    $('top').style.display = 'none'; $('qhud').classList.add('show'); flyHud();
    ctl([['🐢 Pelan', () => (fly.brake = true), () => (fly.brake = false)], ['🚀 Cepat', () => (fly.gas = true), () => (fly.gas = false)]]);
    modal(`<div class="tag">Pesawat Ilmu</div><div class="big">✈️ Siap terbang!</div>
      <p>Geser layar (atau W A S D) untuk naik, turun, kiri, kanan.<br>Tahan <b>🐢 Pelan</b> untuk melambat (hampir berhenti) dan <b>🚀 Cepat</b> untuk mempercepat. Saat soal muncul, pesawat otomatis melambat agar soal sempat dibaca.</p>
      <p class="muted">🪙 Koin +10 · 🎈 Balon merah = nyawa berkurang<br>Saat soal muncul, terbanglah melewati <b>cincin jawaban yang benar</b>.</p>`,
      [['Terbang!', () => { closeModal(); Audio.sfx('bell'); }, 'main']]);
  });
}
function flyHud() { if (fly) $('qhud').innerHTML = `✈️ ⭐ ${fly.score} · ${'❤️'.repeat(Math.max(0, fly.lives))} · Soal ${Math.min(fly.qi + 1, fly.qs.length)}/${fly.qs.length}`; }
setInterval(() => { if (zone === 'pesawat' && fly && !fly.over) $('qhud').innerHTML = `✈️ ${Math.round(fly.speed * 10)} km/j · ⭐ ${fly.score} · ${'❤️'.repeat(Math.max(0, fly.lives))} · Soal ${Math.min(fly.qi + 1, fly.qs.length)}/${fly.qs.length}`; }, 250);
function spawnFly(z) {
  const r = Math.random();
  if (r < 0.68) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.2, 8, 16), new THREE.MeshLambertMaterial({ color: 0xffc83d, emissive: 0x553300 }));
    m.position.set((Math.random() - 0.5) * 22, 2 + Math.random() * 11, z); m.kind = 'coin'; pg.add(m); fly.objs.push(m);
  } else {
    const m = new THREE.Group();
    const s = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 10), mat(0xe53935)); m.add(s);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2), mat(0x444444)); st.position.y = -2; m.add(st);
    m.position.set((Math.random() - 0.5) * 22, 2 + Math.random() * 11, z); m.kind = 'balloon'; pg.add(m); fly.objs.push(m);
  }
  if (Math.random() < 0.4) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + Math.random() * 3, 0), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })); c.position.set((Math.random() - 0.5) * 80, 18 + Math.random() * 10, z - 20); c.kind = 'cloud'; pg.add(c); fly.objs.push(c); }
}
function spawnGate(z) {
  const q = fly.qs[fly.qi]; if (!q) return;
  const opts = shuffle(q.o.map((t, k) => ({ t: plainText(t), ok: k === 0 })));
  const xs = opts.length === 2 ? [-5, 5] : [-8, 0, 8], cols = [0x3b7dd8, 0x8f5fb0, 0x2f8a5c];
  fly.gate = { z, rings: [], q };
  opts.forEach((o, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3, 0.35, 10, 28), mat(cols[i]));
    ring.position.set(xs[i], 7, z); pg.add(ring);
    const s = label(o.t, 0, 0, 0, 1.7); scene.remove(s); s.position.set(xs[i], 11.6, z); s.userData.t = o.t; pg.add(s);
    fly.gate.rings.push({ ring, s, ok: o.ok, x: xs[i] });
  });
  $('qbanner').innerHTML = `❓ ${q.q}<div class="lanes">${opts.map((o, i) => `<span style="background:${['#3b7dd8', '#8f5fb0', '#2f8a5c'][i]}">${['◀ ', '', ''][i]}${esc(o.t)}${['', '', ' ▶'][i]}</span>`).join('')}</div>`; $('qbanner').classList.add('show');
}
function updateFly(dt) {
  if (zone !== 'pesawat' || !fly) return;
  const F = fly;
  if (!paused && !F.over) {
    let ix = 0, iy = 0;
    if (keys.has('a') || keys.has('arrowleft')) ix -= 1;
    if (keys.has('d') || keys.has('arrowright')) ix += 1;
    if (keys.has('w') || keys.has('arrowup')) iy += 1;
    if (keys.has('s') || keys.has('arrowdown')) iy -= 1;
    if (joy.active) { ix += joy.dx; iy -= joy.dy; }
    F.vx += (ix * 16 - F.vx) * Math.min(1, dt * 5); F.vy += (iy * 10 - F.vy) * Math.min(1, dt * 5);
    F.x = THREE.MathUtils.clamp(F.x + F.vx * dt, -13, 13); F.y = THREE.MathUtils.clamp(F.y + F.vy * dt, 1.5, 15);
    const slowKey = keys.has('q') || F.brake, fastKey = keys.has('e') || F.gas;
    let target = fastKey ? 22 : slowKey ? 2.5 : 12;
    if (F.gate && !fastKey) target = Math.min(target, 6);          // melambat saat ada soal
    F.speed += (target - F.speed) * Math.min(1, dt * 2.5);
    F.z -= F.speed * dt;
    if (F.inv > 0) F.inv -= dt;
    while (F.nextSpawn > F.z - 160) { spawnFly(F.nextSpawn); F.nextSpawn -= 11 + Math.random() * 8; }
    if (!F.gate && F.z - 110 < F.nextGate && F.qi < F.qs.length) { spawnGate(F.nextGate); }
    // tabrakan
    for (const o of F.objs) {
      if (o.done) continue;
      const d = Math.hypot(o.position.x - F.x, o.position.y - F.y, o.position.z - F.z);
      if (o.kind === 'coin') { o.rotation.y += dt * 4; if (d < 1.6) { o.done = true; o.visible = false; F.score += 10; Audio.sfx('greet'); flyHud(); } }
      if (o.kind === 'balloon' && d < 1.9 && F.inv <= 0) { o.done = true; o.visible = false; F.lives--; F.inv = 1.2; Audio.sfx('no'); toast('Aduh! Menabrak balon'); flyHud(); }
    }
    if (F.gate && F.z < F.gate.z) {
      const g = F.gate; let hit = null;
      g.rings.forEach((r) => { if (Math.hypot(r.x - F.x, 7 - F.y) < 3.2) hit = r; });
      if (hit && hit.ok) { F.ok = (F.ok || 0) + 1; F.score += 100; Audio.sfx('ok'); toast('Benar! +100'); }
      else { F.lives--; Audio.sfx('no'); toast(hit ? 'Jawaban salah! Benar: ' + g.rings.find((r) => r.ok).s.userData.t : 'Terlewat! Pilih salah satu cincin'); }
      g.rings.forEach((r) => { pg.remove(r.ring); pg.remove(r.s); });
      F.gate = null; F.qi++; F.nextGate = F.z - 170; $('qbanner').classList.remove('show'); flyHud();
    }
    F.objs = F.objs.filter((o) => { if (o.position.z > F.z + 15) { pg.remove(o); return false; } return true; });
    if (F.lives <= 0 || (F.qi >= F.qs.length && !F.gate)) endFly();
  }
  flyer.position.set(F.x, F.y, F.z);
  flyer.rotation.z = -F.vx * 0.04; flyer.rotation.x = F.vy * 0.03;
  flyer.prop.rotation.z += dt * 40;
  flyer.visible = F.inv <= 0 || Math.floor(F.inv * 10) % 2 === 0;
  pgGround.position.z = F.z - 300; pgGround.material.map.offset.y = -F.z / 33.3;
  const cam = new THREE.Vector3(F.x * 0.6, F.y + 4.5, F.z + 13).add(PG);
  camera.position.lerp(cam, 1 - Math.pow(0.0005, dt));
  camera.lookAt(PG.x + F.x * 0.8, PG.y + F.y + 1, PG.z + F.z - 12);
}
function endFly() {
  const F = fly; F.over = true; $('qbanner').classList.remove('show'); ctl([]);
  const pts = Math.round(F.score / 20); addPts(pts);
  if (F.code && F.qi) lapor({ s: F.code, lab: true }, 'pesawat', F.ok || 0, F.qi, F.score);
  state.best = Math.max(state.best || 0, F.score); save();
  modal(`<div class="tag">Pesawat Ilmu</div><div class="big">${F.lives > 0 ? '🏆 Misi selesai!' : '💥 Pesawat jatuh'}</div>
    <p>Skor <b>${F.score}</b> · Rekor kamu <b>${state.best}</b></p><p>+${pts} ⭐ ke poin harian</p>`,
    [['🔁 Main lagi', () => { closeModal(); paused = true; const c = fly.code; cleanupFly(); startFly(c); }, 'main'], ['Keluar dari lab', () => { closeModal(); paused = true; cleanupFly(); fade('Kembali…', 500, backToLab); }, 'small']]);
}
function cleanupFly() {
  if (!fly) return;
  fly.objs.forEach((o) => pg.remove(o));
  if (fly.gate) fly.gate.rings.forEach((r) => { pg.remove(r.ring); pg.remove(r.s); });
  flyer.visible = false; player.visible = true; Audio.setTrack('sekolah');
  $('qhud').classList.remove('show'); $('top').style.display = ''; $('qbanner').classList.remove('show'); ctl([]);
}
