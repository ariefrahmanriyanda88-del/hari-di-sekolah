
// =====================================================================
//  JENIS GAME TUGAS GURU: Arena (ala ZEP), Battle, Balap
// =====================================================================
const MODES = { arena: '🗺️ Arena petualangan', battle: '⚔️ Battle', balap: '🏎️ Balap' };
let ONLINE_MODE = {};
function lapor(lesson, mode, benar, total, skor) {
  if (GURU || !window.HDS || !window.HDS.aktif || !total) return;      // mode guru: nilai percobaan tidak masuk rekap
  const o = { mapel: lesson.s, mode, benar: Math.round(benar), total: Math.round(total), nilai: Math.round(benar / total * 100), skor: Math.round(skor || 0), jenis: lesson.lab ? 'latihan' : 'tugas', jam: lesson.lab ? '' : (lesson.a || ''), hariGame: state.day || 1, hari: dayName() };
  window.HDS.kirimNilai(o).then(() => toast('📤 Nilai terkirim ke guru'), () => toast('⚠️ Nilai belum terkirim (cek internet)'));
}
function modeFor(b) {
  if (ONLINE_MODE[b.s]) return ONLINE_MODE[b.s]; const h = [...b.s].reduce((a, c) => a + c.charCodeAt(0), 0); return ['arena', 'battle', 'balap'][(h + dayIdx() + toMin(b.a)) % 3]; }
function pickQs(bank, n) { const start = ((state.day - 1) * 2) % bank.length; const r = []; for (let i = 0; i < n; i++) r.push(bank[(start + i) % bank.length]); return r; }
function ctl(buttons) {
  const el = $('ctl'); el.innerHTML = ''; el.classList.toggle('show', !!buttons.length);
  buttons.forEach(([t, down, up]) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = t;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); down(); b.classList.add('on'); });
    const off = () => { b.classList.remove('on'); up && up(); };
    b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    el.appendChild(b);
  });
}
function gameResult(title, lesson, correct, total, score, list, back, mode) {
  lapor(lesson, mode || 'battle', correct, total, score);
  const stars = correct === total ? '⭐⭐⭐' : correct >= total - 1 ? '⭐⭐' : '⭐';
  const pts = Math.round(score / 10); addPts(pts);
  if (!lesson.lab) state.rapor = state.rapor || {};
  if (!lesson.lab) state.rapor[lesson.s] = Math.max(state.rapor[lesson.s] || 0, Math.round(correct / total * 100));
  Audio.sfx('bell');
  modal(`<div class="tag">${title} · ${esc(SUBJ[lesson.s])}</div><div class="big">${stars}</div>
    <p><b>${correct}/${total}</b> benar · skor <b>${score}</b></p>
    ${list ? `<div class="rank">${list.map((r, i) => `<div class="${r.me ? 'me' : ''}"><span>${i + 1}</span>${esc(r.n)}<em>${r.v}</em></div>`).join('')}</div>` : ''}
    <p>+${pts} ⭐ masuk ke poin harian</p>`, back);
}
function returnToClass(done) {
  closeModal(); paused = true; ctl([]); $('qhud').classList.remove('show'); $('qbanner').classList.remove('show'); $('top').style.display = '';
  if (labReturn) return fade('Kembali ke Lab Komputer…', 600, backToLab);
  fade('Kembali ke kelas…', 600, () => { Audio.setTrack('sekolah'); player.visible = true; backToClass(done); });
}

// ---------------------------------------------------------------------
//  ⚔️ BATTLE: jawab benar = menyerang "Raksasa Lupa"; salah = diserang
// ---------------------------------------------------------------------
const BT = new THREE.Vector3(-320, 0, -420);
const bt = new THREE.Group(); bt.position.copy(BT); scene.add(bt);
{
  const base = new THREE.Mesh(new THREE.CylinderGeometry(10, 11, 1.2, 40), mat(0x6b5a8a)); base.position.y = -0.6; bt.add(base);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(9.4, 9.4, 0.1, 40), mat(0x8f7ab8)); top.position.y = 0.02; bt.add(top);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; if (Math.sin(a) > 0.1) continue; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 4, 8), mat(0xe9dfc9)); p.position.set(Math.cos(a) * 9.6, 2, Math.sin(a) * 9.6 - 1); bt.add(p);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffc83d })); f.position.set(Math.cos(a) * 9.6, 4.3, Math.sin(a) * 9.6 - 1); bt.add(f); }
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat(0x2b3f74)); sea.rotation.x = -Math.PI / 2; sea.position.y = -1.5; bt.add(sea);
}
const monster = new THREE.Group();
{
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.7, 20, 16), mat(0x7a4fb0)); body.position.y = 1.9; body.scale.y = 1.15; monster.add(body); monster.body = body;
  [[-0.55, 1], [0.55, 1]].forEach(([x]) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); e.position.set(x, 2.4, 1.45); monster.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), new THREE.MeshBasicMaterial({ color: 0x1a1a1a })); p.position.set(x, 2.4, 1.78); monster.add(p); });
  [[-0.9, 0.35], [0.9, -0.35]].forEach(([x, r]) => { const h = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 10), mat(0xffc83d)); h.position.set(x, 3.8, 0); h.rotation.z = r; monster.add(h); });
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0x2b1b3a })); mouth.position.set(0, 1.6, 1.62); monster.add(mouth);
  [-0.8, 0.8].forEach((x) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.9), mat(0x5b3a8a)); f.position.set(x, 0.25, 0.2); monster.add(f); });
  monster.position.set(4.5, 0, -1); monster.rotation.y = -Math.PI / 2; bt.add(monster);
  const s = label('Raksasa Lupa', 0, 0, 0, 0.8); scene.remove(s); s.position.set(0, 4.9, 0); monster.add(s);
}
let battle = null, bPlayer = null, foe = monster;
// naga untuk mode fantasi
const dragon = new THREE.Group();
{
  const G = 0x2f9a6a, D = 0x1f6b4a;
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.4, 18, 14), mat(G)); body.scale.set(1, 0.9, 1.5); body.position.y = 1.9; dragon.add(body);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 1.8, 12), mat(G)); neck.position.set(0, 3.1, 1.2); neck.rotation.x = 0.6; dragon.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.5), mat(G)); head.position.set(0, 3.9, 2.0); dragon.add(head);
  [[-0.35], [0.35]].forEach(([x]) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe14d })); e.position.set(x, 4.15, 2.7); dragon.add(e);
    const h = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.7, 8), mat(0xf5e6c8)); h.position.set(x, 4.6, 1.7); h.rotation.x = -0.5; dragon.add(h); });
  [-1, 1].forEach((s) => { const w = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.6), new THREE.MeshLambertMaterial({ color: D, side: THREE.DoubleSide })); w.position.set(s * 1.9, 2.8, -0.2); w.rotation.z = s * 0.45; dragon.add(w); dragon['w' + s] = w; });
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.4, 10), mat(G)); tail.position.set(0, 1.4, -2.3); tail.rotation.x = -1.9; dragon.add(tail);
  [-0.6, 0.6].forEach((x) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.5), mat(D)); l.position.set(x, 0.45, 0.4); dragon.add(l); });
  dragon.position.set(4.5, 0, -1); dragon.rotation.y = -Math.PI / 2; dragon.visible = false; bt.add(dragon);
  const s = label('Naga Penjaga Ilmu', 0, 0, 0, 0.8); scene.remove(s); s.position.set(0, 5.6, 0); dragon.add(s);
}
const orb = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffd84d })); orb.visible = false; bt.add(orb);
function startBattle(lesson, bank, done, theme) {
  foe = theme === 'naga' ? dragon : monster; monster.visible = foe === monster; dragon.visible = foe === dragon;
  battle = { theme, lesson, done, qs: shuffle(bank), qi: 0, hp: 100, mhp: 100, correct: 0, asked: 0, score: 0, shot: null, over: false };
  fade('Memasuki arena battle…', 700, () => {
    zone = 'battle'; hud(); Audio.setTrack('aksi'); $('modal').classList.add('low');
    if (theme === 'naga') { scene.background.set(0x1b1440); scene.fog.color.set(0x1b1440); }
    player.visible = false;
    if (bPlayer) bt.remove(bPlayer);
    bPlayer = makePlayer(isPutri(state.cls)); bPlayer.position.set(-4.5, 0, -1); bPlayer.rotation.y = Math.PI / 2; bt.add(bPlayer);
    nameTag(bPlayer, state.nama, 0.6);
    $('top').style.display = 'none'; $('qhud').classList.add('show'); battleHud();
    modal(`<div class="tag">${lesson.lab ? 'Latihan Lab Komputer' : 'Tugas dari ' + esc(teacherInfo(lesson.g[0]).p)}</div><div class="big">${theme === 'naga' ? '🐉 Duel Naga' : '⚔️ Battle'} ${esc(SUBJ[lesson.s])}</div>
      <p>Kalahkan <b>${theme === 'naga' ? 'Naga Penjaga Ilmu' : 'Raksasa Lupa'}</b>! Jawab benar untuk menyerang. Jawab salah atau terlambat, kamu yang diserang.</p>`,
      [['Mulai battle!', () => { Audio.sfx('bell'); battleTurn(); }, 'main']]);
  });
}
function battleHud() { if (battle) $('qhud').innerHTML = `❤️ ${state.nama} ${Math.max(0, battle.hp)} &nbsp;|&nbsp; 👾 ${Math.max(0, battle.mhp)}`; }
function battleTurn() {
  const B = battle; if (!B || B.over) return;
  if (B.qi >= B.qs.length) { B.qs = shuffle(B.qs); B.qi = 0; }
  const q = B.qs[B.qi++]; B.asked++;
  const opts = q.t === 'ox' ? [{ t: '⭕ Benar', ok: q.a === true }, { t: '❌ Salah', ok: q.a === false }] : shuffle(q.o.map((t, k) => ({ t, ok: k === 0 })));
  const t0 = performance.now(), LIM = 15;
  modal(`<div class="tag">Giliran ${B.asked}</div><div class="tbar"><i id="tfill"></i></div><div class="q">${q.q}</div>`,
    opts.map((o) => [o.t, (ev) => { clearInterval(timer); document.querySelectorAll('#mbtns button').forEach((x) => (x.disabled = true)); ev.currentTarget.classList.add(o.ok ? 'ok' : 'no'); setTimeout(() => resolveTurn(o.ok, LIM - (performance.now() - t0) / 1000), 500); }, 'opt']));
  const timer = setInterval(() => {
    const left = LIM - (performance.now() - t0) / 1000; const f = $('tfill'); if (f) f.style.width = Math.max(0, left / LIM * 100) + '%';
    if (left <= 0) { clearInterval(timer); resolveTurn(false, 0); }
  }, 100);
}
function resolveTurn(ok, left) {
  const B = battle; $('modal').classList.remove('show');
  if (ok) {
    const dmg = 20 + Math.round(Math.max(0, left)); B.correct++; B.score += 100 + Math.round(left) * 5;
    Audio.sfx('ok'); shoot(bPlayer, foe, () => { B.mhp -= dmg; foe.hit = 0.5; bubble(foe, `−${dmg}`, 900); battleHud(); after(); });
    playAnim(bPlayer, 'lambai', 0.6);
  } else {
    Audio.sfx('no'); shoot(foe, bPlayer, () => { B.hp -= 25; bPlayer.hit = 0.5; bubble(bPlayer, 'Aduh!', 900); battleHud(); after(); });
  }
  function after() {
    setTimeout(() => {
      if (B.mhp <= 0 || B.hp <= 0) return endBattle(B.mhp <= 0);
      battleTurn();
    }, 900);
  }
}
function shoot(from, to, done) { battle.shot = { from: from.position.clone().setY(1.8), to: to.position.clone().setY(1.8), t: 0, done }; orb.visible = true; orb.material.color.set(from === foe ? 0xb04aff : 0xffd84d); }
function updateBattle(dt, t) {
  if (zone !== 'battle' || !battle) return;
  foe.position.y = Math.abs(Math.sin(t * 2)) * 0.25;
  if (foe === dragon) { dragon['w-1'].rotation.z = -0.45 + Math.sin(t * 6) * 0.35; dragon['w1'].rotation.z = 0.45 - Math.sin(t * 6) * 0.35; }
  foe.scale.setScalar(battle.mhp <= 0 ? Math.max(0.01, foe.scale.x - dt) : 1);
  [foe, bPlayer].forEach((m) => { if (m && m.hit > 0) { m.hit -= dt; m.position.z = -1 + Math.sin(m.hit * 60) * 0.15; } else if (m) m.position.z = -1; });
  const S = battle.shot;
  if (S) { S.t += dt / 0.5; orb.position.lerpVectors(S.from, S.to, Math.min(1, S.t)); orb.position.y += Math.sin(Math.min(1, S.t) * Math.PI) * 1.5; if (S.t >= 1) { orb.visible = false; battle.shot = null; S.done(); } }
  const p = innerWidth < innerHeight;
  camera.position.lerp(tmp.set(0, p ? 6 : 5.5, p ? 25 : 13).add(BT), 1 - Math.pow(0.01, dt));
  camera.lookAt(BT.x, BT.y + (p ? -2.6 : 0.6), BT.z - 1);
}
function endBattle(win) {
  const B = battle; B.over = true;
  if (win) { bubble(bPlayer, 'Alhamdulillah, menang!', 2000); }
  setTimeout(() => {
    $('modal').classList.remove('low');
    const back = [[labReturn ? 'Kembali ke lab' : 'Kembali ke kelas', () => { foe.scale.setScalar(1); scene.background.set(0xbfe3f5); scene.fog.color.set(0xbfe3f5); returnToClass(B.done); }, 'main']];
    if (!win) back.unshift(['🔁 Coba lagi', () => { closeModal(); foe.scale.setScalar(1); startBattle(B.lesson, QBANK[B.lesson.s], B.done, B.theme); }, 'main']);
    gameResult(win ? '⚔️ Menang!' : '⚔️ Kalah', B.lesson, B.correct, B.asked, B.score, null, back, B.theme === 'naga' ? 'naga' : 'battle');
  }, 1500);
}

// ---------------------------------------------------------------------
//  🏎️ BALAP: masuk ke jalur jawaban yang benar untuk dapat turbo
// ---------------------------------------------------------------------
const RC = new THREE.Vector3(-320, 0, -700);
const rc = new THREE.Group(); rc.position.copy(RC); scene.add(rc);
const LANES = [-3.6, 0, 3.6];
let race = null, raceParts = [];
function makeCar(color) {
  const g = new THREE.Group();
  const b = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  b(1.8, 0.6, 3.2, color, 0, 0.6, 0); b(1.4, 0.55, 1.5, 0x8fd3f0, 0, 1.15, 0.2); b(1.9, 0.12, 0.5, 0x222222, 0, 0.95, 1.65);
  [[-0.95, -1.05], [0.95, -1.05], [-0.95, 1.05], [0.95, 1.05]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 14), mat(0x1a1a1a)); w.rotation.z = Math.PI / 2; w.position.set(x, 0.38, z); g.add(w); });
  return g;
}
function radd(m) { rc.add(m); raceParts.push(m); return m; }
function startRace(lesson, bank, done) {
  raceParts.forEach((m) => rc.remove(m)); raceParts = [];
  const qs = pickQs(bank, Math.min(5, bank.length)), GAP = 140, LEN = qs.length * GAP + 120;
  race = { lesson, done, qs, ci: 0, z: 0, lane: 1, x: 0, speed: 0, base: 13, boost: 0, slow: 0, correct: 0, score: 0, LEN, over: false, t: 0, cps: [], finishT: null };
  // jalan
  const road = new THREE.Mesh(new THREE.PlaneGeometry(12, LEN + 80), mat(0x4a4e54)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, -LEN / 2 + 30); radd(road);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(120, LEN + 120), mat(0x7cc46a)); grass.rotation.x = -Math.PI / 2; grass.position.set(0, 0, -LEN / 2 + 30); radd(grass);
  for (let z = 20; z > -LEN - 40; z -= 6) [-1.8, 1.8].forEach((x) => { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 2.6), mat(0xffffff)); d.rotation.x = -Math.PI / 2; d.position.set(x, 0.04, z); radd(d); });
  for (let z = 10; z > -LEN - 40; z -= 12) [-8, 8].forEach((x, k) => { const t = new THREE.Mesh(treeGeoL, mat(0x3f9a47)); t.position.set(x + (k ? 1 : -1) * Math.random() * 6, 2, z); radd(t); });
  [[-0.2, 0xe0623e, -6.6], [-0.2, 0xffffff, 6.6]].forEach(([y, c, x]) => { const k = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, LEN + 80), mat(0xe0623e)); k.position.set(x, 0.3, -LEN / 2 + 30); radd(k); });
  qs.forEach((q, i) => {
    const z = -(i + 1) * GAP, cp = { z, q, lanes: [] };
    const opts = q.t === 'ox' ? [{ t: 'O (Benar)', ok: q.a === true }, { t: '—', ok: false }, { t: 'X (Salah)', ok: q.a === false }] : shuffle(q.o.slice(0, 3).map((t, k) => ({ t: plainText(t), ok: k === 0 })));
    opts.forEach((o, k) => {
      const tile = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 6), mat([0x3b7dd8, 0x8f5fb0, 0x2f8a5c][k])); tile.rotation.x = -Math.PI / 2; tile.position.set(LANES[k], 0.05, z); radd(tile);
      const s = label(o.t, 0, 0, 0, 0.75); scene.remove(s); s.position.set(LANES[k], 2.0 + k * 1.1, z - 1); radd(s);
      cp.lanes.push(o.ok); (cp.txt = cp.txt || []).push(o.t);
    });
    const arch = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.5, 0.5), mat(0xffc83d)); arch.position.set(0, 5.2, z - 1); radd(arch);
    race.cps.push(cp);
  });
  const fin = new THREE.Mesh(new THREE.PlaneGeometry(12, 2), mat(0xffffff)); fin.rotation.x = -Math.PI / 2; fin.position.set(0, 0.06, -LEN); radd(fin);
  const fs = label('FINISH', 0, 0, 0, 1.6, true); scene.remove(fs); fs.position.set(0, 5, -LEN); radd(fs);
  race.car = radd(makeCar(isPutri(state.cls) ? 0xd9577a : 0x3b7dd8));
  race.rivals = [0xe0623e, 0x2f8a5c, 0xf2a33a].map((c, i) => { const car = radd(makeCar(c)); car.position.set(LANES[[0, 2, 1][i]], 0, 4 + i * 3); car.nm = classmateNames[i + 1]; car.sp = 12 + Math.random() * 2.5; car.done = null; nameTag(car, car.nm, 0.6, 2.4); return car; });
  fade('Menuju sirkuit…', 700, () => {
    zone = 'balap'; hud(); Audio.setTrack('aksi'); player.visible = false;
    $('top').style.display = 'none'; $('qhud').classList.add('show');
    ctl([['◀', () => steer(-1)], ['▶', () => steer(1)]]);
    modal(`<div class="tag">${lesson.lab ? 'Latihan Lab Komputer' : 'Tugas dari ' + esc(teacherInfo(lesson.g[0]).p)}</div><div class="big">🏎️ Balap ${esc(SUBJ[lesson.s])}</div>
      <p>Soal muncul sebelum setiap gerbang kuning. Pindah ke <b>jalur jawaban yang benar</b> dengan tombol ◀ ▶ (atau A / D).</p><p class="muted">Benar = turbo 🔥 · Salah = melambat 🐢</p>`,
      [['Gas!', () => { closeModal(); Audio.sfx('bell'); race.go = true; }, 'main']]);
  });
}
function steer(d) { if (!race || race.over) return; race.lane = THREE.MathUtils.clamp(race.lane + d, 0, 2); }
let steerCool = 0;
function updateRace(dt) {
  if (zone !== 'balap' || !race) return;
  const R = race;
  if (R.go && !R.over && !paused) {
    R.t += dt;
    if (keys.has('a') || keys.has('arrowleft')) { if (steerCool <= 0) { steer(-1); steerCool = 0.25; } }
    else if (keys.has('d') || keys.has('arrowright')) { if (steerCool <= 0) { steer(1); steerCool = 0.25; } }
    else if (joy.active && Math.abs(joy.dx) > 0.6) { if (steerCool <= 0) { steer(Math.sign(joy.dx)); steerCool = 0.35; } }
    else steerCool = 0;
    steerCool -= dt;
    const target = R.boost > 0 ? R.base + 12 : R.slow > 0 ? 6 : R.base;
    R.speed += (target - R.speed) * Math.min(1, dt * 2); R.boost -= dt; R.slow -= dt;
    R.z -= R.speed * dt; R.x += (LANES[R.lane] - R.x) * Math.min(1, dt * 8);
    const cp = R.cps[R.ci];
    if (cp) {
      const dist = R.z - cp.z;
      if (dist < 95) { $('qbanner').innerHTML = `❓ ${cp.q.q} <span class="cd">${Math.max(0, Math.ceil(dist))}m</span><div class="lanes">${cp.txt.map((t, i) => `<span class="${i === R.lane ? 'me' : ''}" style="background:${['#3b7dd8', '#8f5fb0', '#2f8a5c'][i]}">${esc(t)}</span>`).join('')}</div>`; $('qbanner').classList.add('show'); }
      if (R.z < cp.z) {
        const ok = cp.lanes[R.lane];
        if (ok) { R.correct++; R.boost = 2.5; R.score += 150; Audio.sfx('ok'); toast('Benar! Turbo 🔥 +150'); }
        else { R.slow = 2; Audio.sfx('no'); toast('Jalur salah… melambat'); }
        R.ci++; $('qbanner').classList.remove('show');
      }
    }
    R.rivals.forEach((c) => {
      if (c.done) return;
      const ci = Math.floor(-c.position.z / 140) - 1;
      if (ci !== c.lastCp && c.position.z < -140) { c.lastCp = ci; c.turbo = Math.random() < 0.6 ? 2.2 : 0; c.slowt = c.turbo ? 0 : 1.8; }
      c.turbo -= dt; c.slowt -= dt;
      c.position.z -= (c.turbo > 0 ? c.sp + 10 : c.slowt > 0 ? 6 : c.sp) * dt;
      if (c.position.z < -R.LEN) c.done = R.t;
    });
    if (R.z < -R.LEN && !R.finishT) { R.finishT = R.t; endRace(); }
    $('qhud').innerHTML = `🏎️ ${Math.round(R.speed * 7)} km/j · ⭐ ${R.score} · Gerbang ${Math.min(R.ci + 1, R.cps.length)}/${R.cps.length}`;
  }
  R.car.position.set(R.x, 0, R.z); R.car.rotation.y = (R.x - LANES[R.lane]) * 0.08;
  const p = innerWidth < innerHeight;
  camera.position.lerp(tmp.set(R.x * 0.5, p ? 7 : 5, R.z + (p ? 13 : 10)).add(RC), 1 - Math.pow(0.0005, dt));
  camera.lookAt(RC.x + R.x * 0.7, 1.2, RC.z + R.z - 12);
}
function endRace() {
  const R = race; R.over = true; ctl([]); $('qbanner').classList.remove('show');
  const list = [{ n: state.nama + ' (kamu)', t: R.finishT, me: true }].concat(R.rivals.map((c) => ({ n: c.nm, t: c.done ?? R.finishT + 2 + Math.random() * 8 })))
    .sort((a, b) => a.t - b.t).map((r) => ({ ...r, v: r.t.toFixed(1) + 'd' }));
  const rank = list.findIndex((r) => r.me) + 1;
  R.score += [300, 200, 100, 50][rank - 1];
  setTimeout(() => gameResult(rank === 1 ? '🏁 Juara 1!' : `🏁 Posisi ${rank}`, R.lesson, R.correct, R.cps.length, R.score, list, [[labReturn ? 'Kembali ke lab' : 'Kembali ke kelas', () => returnToClass(R.done), 'main']], 'balap'), 900);
}
