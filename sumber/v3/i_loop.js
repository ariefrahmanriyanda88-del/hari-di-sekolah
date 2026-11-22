
// ---------- kontrol ----------
const keys = new Set();
addEventListener('keydown', (e) => { if (e.target.tagName === 'INPUT') return; keys.add(e.key.toLowerCase()); if (e.key === ' ') { e.preventDefault(); doJump(); } if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') openGreet(); });
addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
$('talk').addEventListener('click', () => openGreet());
$('cam').addEventListener('click', (e) => { camIdx = (camIdx + 1) % CAMS.length; setCam(); e.currentTarget.textContent = '🎥 ' + CAMS[camIdx][0]; });
$('mute').addEventListener('click', (e) => { Audio.start(); e.currentTarget.textContent = Audio.toggle() ? '🔊' : '🔇'; });
const joy = { active: false, id: null, sx: 0, sy: 0, dx: 0, dy: 0 };
const jb = $('joy'), jk = $('knob'), cv = renderer.domElement;
cv.addEventListener('pointerdown', (e) => {
  if (paused) return;
  joy.active = true; joy.id = e.pointerId; joy.sx = e.clientX; joy.sy = e.clientY; joy.dx = joy.dy = 0;
  jb.style.left = e.clientX + 'px'; jb.style.top = e.clientY + 'px'; jb.classList.add('show'); jk.style.transform = 'translate(-50%,-50%)';
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', (e) => {
  if (!joy.active || e.pointerId !== joy.id) return;
  let dx = e.clientX - joy.sx, dy = e.clientY - joy.sy; const L = Math.hypot(dx, dy), M = 55;
  if (L > M) { dx = (dx / L) * M; dy = (dy / L) * M; }
  joy.dx = dx / M; joy.dy = dy / M; jk.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
});
const endJoy = (e) => { if (e.pointerId === joy.id) { joy.active = false; jb.classList.remove('show'); } };
cv.addEventListener('pointerup', endJoy); cv.addEventListener('pointercancel', endJoy);

function blocked(x, z) {
  const r = 0.55;
  if (zone === 'luar' && (x < -110 || x > 110 || z < -71 || z > 100)) return true;
  for (const c of colliders) {
    if (c.r !== undefined) { if (Math.hypot(x - c.cx, z - c.cz) < c.r + r) return true; }
    else if (x > c.x1 - r && x < c.x2 + r && z > c.z1 - r && z < c.z2 + r) return true;
  }
  return false;
}
let wingWarn = 0;
function wingBlocked(x) {
  if (zone !== 'luar') return false;
  const bad = isPutri(state.cls) ? x < -WING + 0.6 : x > WING - 0.6;
  if (bad && performance.now() - wingWarn > 2500) { wingWarn = performance.now(); toast(isPutri(state.cls) ? 'Ini Area Putra — siswi putri tidak masuk ke sini' : 'Ini Area Putri — siswa putra tidak masuk ke sini'); }
  return bad;
}

// ---------- putaran utama ----------
const clock = new THREE.Clock();
const tmp = new THREE.Vector3();
let walkT = 0, lastPlace = '';
const marker = new THREE.Group();
{
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 4), new THREE.MeshBasicMaterial({ color: 0xffc83d }));
  cone.rotation.x = Math.PI; cone.position.y = 4; marker.add(cone); marker.cone = cone;
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.1, 32), new THREE.MeshBasicMaterial({ color: 0xffc83d, transparent: true, opacity: 0.8 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.08; marker.add(ring);
}
scene.add(marker);
// ---------- lari & lompat ----------
let running = false, jumpV = 0, mvShown = false;
const canMoveFree = () => zone === 'luar' && !riding && !player.sitting && !paused;
function doJump() { if (!canMoveFree() || player.position.y > 0.01 || player.busy > 0) return; jumpV = 7.2; }
$('runbtn').addEventListener('pointerdown', (e) => { e.preventDefault(); running = !running; $('runbtn').classList.toggle('on', running); toast(running ? '🏃 Mode lari' : '🚶 Mode jalan'); });
$('jumpbtn').addEventListener('pointerdown', (e) => { e.preventDefault(); doJump(); });
function updateJump(dt) {
  if (jumpV === 0 && player.position.y <= 0) return false;
  jumpV -= 22 * dt; player.position.y = Math.max(0, player.position.y + jumpV * dt);
  if (player.position.y === 0) { jumpV = 0; return false; }
  player.legL.rotation.x = -0.7; player.legR.rotation.x = 0.35; player.armL.rotation.x = player.armR.rotation.x = -2.4;
  return true;
}
// ---------- performa adaptif: resolusi turun otomatis bila HP berat ----------
let frameN = 0, perfT0 = 0, perfFrames = 0;
function tunePerf(now) {
  if (!perfT0) { perfT0 = now; return; }
  perfFrames++;
  const el = now - perfT0; if (el < 1500) return;
  const fps = perfFrames * 1000 / el; perfT0 = now; perfFrames = 0;
  if (document.hidden) return;
  let pr = pixelRatio;
  if (fps < 45 && pr > 1) pr = Math.max(1, pr - 0.25);
  else if (fps > 56 && pr < PR_MAX) pr = Math.min(PR_MAX, pr + 0.25);
  if (fps < 34 && pr <= 1 && sun.castShadow) { sun.castShadow = false; renderer.shadowMap.needsUpdate = true; }
  if (pr !== pixelRatio) { pixelRatio = pr; renderer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight); }
}
function loop() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  updateNPCs(dt); updateAuto(dt); updateRoom(t); updateQuiz(dt); updateFly(dt); updateKantin(t); updateBattle(dt, t); updateRace(dt); updateSports(dt); checkBreakBell(); updateHome(t); updateSideJamaah(t); updateLate(dt); updateUpacara(dt);
  updateFootball(dt, ['istirahat1', 'santai', 'pulang'].includes(phase) && zone === 'luar');
  const animating = updateAnim(player, dt);
  if (player.busy > 0) player.busy -= dt;
  const walkable = ['luar', 'kantin', 'ruang', 'kuis', 'perpus', 'room', 'masjidin'].includes(zone);
  if (!paused && walkable && !player.sitting) {
    let vx = 0, vz = 0;
    if (keys.has('w') || keys.has('arrowup')) vz -= 1;
    if (keys.has('s') || keys.has('arrowdown')) vz += 1;
    if (keys.has('a') || keys.has('arrowleft')) vx -= 1;
    if (keys.has('d') || keys.has('arrowright')) vx += 1;
    if (joy.active) { vx += joy.dx; vz += joy.dy; }
    let L = Math.hypot(vx, vz);
    if (player.busy > 0) L = 0;
    if (L > 0.1) {
      const sprint = zone === 'luar' && !riding && (running || keys.has('shift'));
      const sp = (riding ? 17 : zone === 'luar' ? (sprint ? 18 : 10) : 6.5) * Math.min(1, L) / L;
      const nx = player.position.x + vx * sp * dt, nz = player.position.z + vz * sp * dt;
      const stuck = blocked(player.position.x, player.position.z);   // bila terjepit, tetap boleh bergerak keluar
      if ((stuck || !blocked(nx, player.position.z)) && !bodyBlocked(player, nx, player.position.z) && !wingBlocked(nx)) player.position.x = nx;
      if ((stuck || !blocked(player.position.x, nz)) && !bodyBlocked(player, player.position.x, nz)) player.position.z = nz;
      let d = Math.atan2(vx, vz) - player.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
      player.rotation.y += d * Math.min(1, dt * 12);
      walkT += dt * (sprint ? 17 : 11); minutes += dt * 0.4;
    } else walkT *= 0.85;
    const runK = zone === 'luar' && (running || keys.has('shift')) ? 1.55 : 1;
    const sw = Math.sin(walkT) * 0.6 * runK * (L > 0.1 ? 1 : 0);
    const airborne = updateJump(dt);
    if (!riding && !airborne) { player.legL.rotation.x = sw; player.legR.rotation.x = -sw; }
    if (!animating && !riding && !airborne) { player.armL.rotation.x = -sw; player.armR.rotation.x = sw; }

    let best = null, bd = 3.3;
    if (zone !== 'kuis') for (const n of npcs) { if (!n.visible || !canTalk(n)) continue; const dd = Math.hypot(n.position.x - player.position.x, n.position.z - player.position.z); if (dd < bd) { bd = dd; best = n; } }
    if (best !== nearNPC) { nearNPC = best; const tb = $('talk'); if (best) { tb.textContent = `💬 Sapa ${best.name}`; tb.classList.add('show'); } else tb.classList.remove('show'); }

    checkTriggers();
    if (['kantin', 'ruang', 'perpus', 'room'].includes(zone) && interior && !leaving && player.position.z - interior.origin.z > interior.D / 2 + 0.2) { leaving = true; paused = true; leaveInterior(); }

    let near = '';
    if (zone === 'luar') for (const p of places) if (Math.hypot(player.position.x - p.x, player.position.z - p.z) < p.r) { near = p.n; break; }
    if (near !== lastPlace) { lastPlace = near; $('loc').textContent = near ? '📍 ' + near : ''; $('loc').style.opacity = near ? 1 : 0; }
    if (Math.floor(t * 4) % 2 === 0) hud();
  }
  if (paused && nearNPC) { nearNPC = null; $('talk').classList.remove('show'); }
  if (zone !== 'luar' && lastPlace) { lastPlace = ''; $('loc').style.opacity = 0; }
  // penanda tujuan
  marker.visible = !!(objective && objective.has && objective.zone === zone);
  if (marker.visible) { marker.position.set(objective.x, 0, objective.z); marker.cone.position.y = 4 + Math.sin(t * 3) * 0.4; marker.cone.rotation.y = t * 2; }
  // kamera
  if (zone === 'kelas') { camera.position.lerp(classCam, 1 - Math.pow(0.01, dt)); camera.lookAt(classLook); }
  else if (zone === 'rumah') { camera.position.lerp(homeCam, 1 - Math.pow(0.01, dt)); camera.lookAt(homeLook); }
  else if (zone === 'masjid') { camera.position.lerp(msCam, 1 - Math.pow(0.01, dt)); camera.lookAt(msLook); }
  else if (['pesawat', 'battle', 'balap', 'upacara'].includes(zone)) { /* kamera diatur oleh mode game masing-masing */ }
  else {
    const off = zone === 'luar' ? tmp.copy(CAM_OFF).multiplyScalar(player.busy > 0 ? 0.42 : 1) : zone === 'kuis' ? tmp.copy(quizCam()) : tmp.copy(intOff());
    off.add(player.position);
    camera.position.lerp(off, 1 - Math.pow(0.001, dt));
    camera.lookAt(player.position.x, player.position.y + (eatingCam ? -0.6 : 1.2), player.position.z);
  }
  for (const l of sceneLabels) { if (l.parent !== scene) continue; const d = camera.position.distanceTo(l.position); l.material.opacity = THREE.MathUtils.clamp((d - 16) / 10, 0, 1); }
  updateDoors(dt, player); updateBubbles(); updateTags(); updateMatch(dt);
  const mvWant = zone === 'luar' && !paused && !riding && !player.sitting;
  if (mvWant !== mvShown) { mvShown = mvWant; $('mv').classList.toggle('show', mvWant); if (!mvWant && player.position.y > 0) { player.position.y = 0; jumpV = 0; } }
  frameN++; if (frameN % 2 === 0) renderer.shadowMap.needsUpdate = true;
  tunePerf(clock.getElapsedTime ? performance.now() : 0);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
addEventListener('resize', () => { setCam(); setClassCam(); setMsCam(); setHomeCam(); renderer.setSize(innerWidth, innerHeight); });

// ---------- layar awal ----------
const sel = $('clssel');
sel.innerHTML = DATA.classes.map((c) => `<option ${c === state.cls ? 'selected' : ''}>${c}</option>`).join('');
const dsel = $('daysel');
dsel.innerHTML = HARI.map((h, i) => `<option value="${i}">${h}</option>`).join('');
dsel.value = String(dayIdx());
$('nama').value = state.nama || '';
$('nama').oninput = () => $('nama').classList.remove('err');
function startLabel() {
  const same = sel.value === state.cls && state.day > 1 && $('nama').value.trim() === state.nama;
  $('startbtn').textContent = same ? `Lanjutkan Hari ke-${state.day}` : 'Mulai Hari Pertama';
  $('resetbtn').style.display = same ? '' : 'none';
}
sel.onchange = startLabel; $('nama').addEventListener('input', startLabel); startLabel();
if (window.HDS) { $('kodewrap').style.display = ''; $('gurulink').style.display = 'block'; $('kode').value = state.kode || ''; $('kode').oninput = () => { $('kodeerr').textContent = ''; }; }
let onlineDone = '';
$('startbtn').onclick = async () => {
  const nm = $('nama').value.trim();
  if (!nm) { $('nama').classList.add('err'); $('nama').focus(); return; }
  if (window.HDS) {
    const kode = $('kode').value.trim().toUpperCase().replace(/\s/g, ''), key = kode + '|' + sel.value + '|' + nm;
    if (kode && onlineDone !== key) {
      const btn = $('startbtn'); btn.disabled = true; btn.textContent = '⏳ Menghubungkan ke sekolah…';
      try {
        const r = await window.HDS.masukMurid(nm, sel.value, kode);
        Object.assign(QBANK, r.bank); ONLINE_MODE = r.mode; onlineDone = key;
        setTimeout(() => toast(r.mapel.length ? `✅ Terhubung · soal dari guru: ${r.mapel.join(', ')}` : '✅ Terhubung ke kelas · nilai akan terkirim ke guru'), 1500);
      } catch (e) { btn.disabled = false; startLabel(); $('kodeerr').textContent = e.message || String(e); return; }
      btn.disabled = false;
    } else if (!kode) toast('Main tanpa kode kelas: nilai tidak terkirim ke guru');
    state.kode = kode;
  }
  if (sel.value !== state.cls || nm !== state.nama) state = { day: 1, points: 0, cls: sel.value, kode: state.kode };
  state.nama = nm;
  state.start = ((+dsel.value - (state.day - 1)) % 5 + 5) % 5;
  Audio.start(); Audio.loadUrl('azan.mp3'); save(); setPlayer(isPutri(state.cls));
  builtFor = ''; populate(); populateRuang(); startDay();
  $('start').classList.add('hide'); paused = false;
};
$('resetbtn').onclick = () => { state = { day: 1, points: 0, cls: sel.value, nama: state.nama }; save(); startLabel(); };
setPlayer(isPutri(state.cls));
setClassCam(); setMsCam();
populate(); populateRuang();
today = DATA.sched[state.cls][dayIdx()].blocks;
goOutside(0, 63, Math.PI); paused = true;
hud();
window.__audio = Audio;
window.__dbg = { joinBall: () => joinBall(), joinSport: (k) => joinSport(k), match: () => match, jump: () => doJump(), setPhase2: (p) => (phase = p), upacara: () => upacaraScene(), walkersVis: () => walkers.filter((n) => n.visible).length, enterRuang: (p) => enterRuang(p), enterClass: () => enterClass('Silakan masuk'), roomAction: (id) => roomAction(id), enterKepsek: () => enterKepsek(), enterTU: () => enterTU(), goOutside: (x, z, r) => goOutside(x, z, r), camera, setZone: (z) => (zone = z),  get paused() { return paused; }, blocked: (x, z) => blocked(x, z), bb: (x, z) => bodyBlocked(player, x, z), get fly() { return fly; }, get race() { return race; }, get battle() { return battle; }, sb: (s) => startBattle(today.find((b) => b.s === s), QBANK[s], () => {}), sr: (s) => startRace(today.find((b) => b.s === s), QBANK[s], () => {}), openLab: () => openLab(), get quiz() { return quiz; }, get state() { return state; }, get zone() { return zone; }, get phase() { return phase; }, get objective() { return objective; }, lessonDone: (a) => lessonDone(today.find((b) => b.a === a)), today: () => today, setPhase: (p) => (phase = p), classDoors, doorsOut, KANTIN, KT_SEAT, QZ };
loop();
