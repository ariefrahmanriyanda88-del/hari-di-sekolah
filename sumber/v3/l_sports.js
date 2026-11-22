
// =====================================================================
//  OLAHRAGA SAAT ISTIRAHAT: lapangan voli & lapangan basket (bisa ikut main)
// =====================================================================
// lapangan voli & basket ada di masing-masing area: putra (barat) dan putri (timur)
const COURTS = { PA: { voli: { ax: -78, bx: -66, az: -70, bz: -50, net: -60 }, bask: { ax: -95, bx: -81, az: -70, bz: -48 } } };
COURTS.PI = { voli: { ax: 66, bx: 78, az: -70, bz: -50, net: -60 }, bask: { ax: 81, bx: 95, az: -70, bz: -48 } };
let VOLI, BASK;
function prepCourt(V, B) { V.cx = (V.ax + V.bx) / 2; B.cx = (B.ax + B.bx) / 2; B.hN = B.az + 1.6; B.hS = B.bz - 1.6; }
['PA', 'PI'].forEach((sd) => {
  const V = COURTS[sd].voli, B = COURTS[sd].bask; prepCourt(V, B);
  const nm = sd === 'PA' ? 'Putra' : 'Putri', east = sd === 'PA' ? 1 : -1;
  plane(V.ax - 1, V.az - 1, V.bx + 1, V.bz + 1, 0x3f8fbf, 0.05);
  plane(V.ax, V.az, V.bx, V.bz, 0xd98a4a, 0.06);
  [[V.ax, V.az, V.bx, V.az + 0.15], [V.ax, V.bz - 0.15, V.bx, V.bz], [V.ax, V.az, V.ax + 0.15, V.bz], [V.bx - 0.15, V.az, V.bx, V.bz], [V.ax, V.net - 0.08, V.bx, V.net + 0.08]]
    .forEach(([a, b, c, d]) => plane(a, b, c, d, 0xffffff, 0.08));
  box(V.ax - 0.6, 1.25, V.net, 0.15, 2.5, 0.15, 0xdddddd); box(V.bx + 0.6, 1.25, V.net, 0.15, 2.5, 0.15, 0xdddddd);
  const net = new THREE.Mesh(new THREE.BoxGeometry(V.bx - V.ax + 1.2, 0.9, 0.04), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })); net.position.set(V.cx, 2.0, V.net); scene.add(net);
  label('Lapangan Voli ' + nm, V.cx, 4.6, V.net, 1.1);
  plane(B.ax - 1, B.az - 1, B.bx + 1, B.bz + 1, 0x2f6b8f, 0.05);
  plane(B.ax, B.az, B.bx, B.bz, 0xc9773f, 0.06);
  const bz = (B.az + B.bz) / 2;
  [[B.ax, B.az, B.bx, B.az + 0.15], [B.ax, B.bz - 0.15, B.bx, B.bz], [B.ax, B.az, B.ax + 0.15, B.bz], [B.bx - 0.15, B.az, B.bx, B.bz], [B.ax, bz - 0.08, B.bx, bz + 0.08]]
    .forEach(([a, b, c, d]) => plane(a, b, c, d, 0xffffff, 0.08));
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.8, 1.95, 36), mat(0xffffff)); ring.rotation.x = -Math.PI / 2; ring.position.set(B.cx, 0.09, bz); scene.add(ring);
  [[B.hN, -1], [B.hS, 1]].forEach(([hz, s]) => {
    box(B.cx, 1.8, hz + s * 1.1, 0.2, 3.6, 0.2, 0x555b63);                 // tiang di belakang papan (luar lapangan)
    box(B.cx, 3.6, hz + s * 0.55, 1.8, 1.1, 0.08, 0xffffff);                // papan pantul di belakang ring
    box(B.cx, 3.15, hz + s * 0.35, 0.12, 0.08, 0.4, 0xe0623e);             // penyangga ring ke papan
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 8, 20), mat(0xe0623e)); hoop.rotation.x = Math.PI / 2; hoop.position.set(B.cx, 3.05, hz); scene.add(hoop);
  });
  label('Lapangan Basket ' + nm, B.cx, 5.6, bz, 1.1);
  doorOut('voli', east > 0 ? V.bx + 1.8 : V.ax - 1.8, V.net, 2.2);
  doorOut('basket', east > 0 ? B.bx + 1.4 : B.ax - 1.4, bz, 2.0);
  places.push({ n: 'Lapangan Voli ' + nm, x: V.cx, z: V.net, r: 10 }, { n: 'Lapangan Basket ' + nm, x: B.cx, z: bz, r: 11 });
});
VOLI = COURTS.PA.voli; BASK = COURTS.PA.bask;
const sportBall = (c) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), mat(c)); m.castShadow = true; scene.add(m); return m; };
const vBall = sportBall(0xfff2a0), bBall = sportBall(0xe8762c);
let voli = null, basket = null, playingSport = null;
function sportPerson(putri, color, i, name) {
  const m = putri ? { putri: true, shirt: color, bottom: 0x3a3a3a, hijab: 0xffffff, skin: SKINS[i % 4] } : { shirt: color, bottom: 0x1a1a1a, tie: false, skin: SKINS[i % 4] };
  const g = makePerson(m); g.nm = name; nameTag(g, name, 0.45, 2.5); scene.add(g); return g;
}
function moveTo(p, x, z, sp, dt) {
  const dx = x - p.position.x, dz = z - p.position.z, L = Math.hypot(dx, dz);
  if (L > 0.15) { const s = Math.min(L, sp * dt); p.position.x += dx / L * s; p.position.z += dz / L * s; p.rotation.y = Math.atan2(dx, dz); p.walkT += dt * 11; }
  const sw = L > 0.15 ? Math.sin(p.walkT) * 0.7 : 0;
  if (!p.anim) { p.legL.rotation.x = sw; p.legR.rotation.x = -sw; p.armL.rotation.x = -sw; p.armR.rotation.x = sw; }
  return L;
}
function flight(from, to, apex, dur) { return { from: from.clone(), to: to.clone(), apex, dur, t: 0 }; }
function flyPos(f, out) { const k = Math.min(1, f.t / f.dur); out.lerpVectors(f.from, f.to, k); out.y += Math.sin(k * Math.PI) * f.apex; return k; }
function buildSports() {
  [voli, basket].forEach((s) => s && s.ps.forEach((p) => scene.remove(p)));
  VOLI = COURTS[isPutri(state.cls) ? 'PI' : 'PA'].voli; BASK = COURTS[isPutri(state.cls) ? 'PI' : 'PA'].bask;
  const putri = isPutri(state.cls), nm = (i) => classmateNames[(12 + i) % classmateNames.length] || 'Teman';
  voli = { ps: [
    Object.assign(sportPerson(putri, 0x2f8a5c, 0, nm(0)), { team: 0, home: [VOLI.ax + 3, VOLI.net + 4.5] }),
    Object.assign(sportPerson(putri, 0x2f8a5c, 1, nm(1)), { team: 0, home: [VOLI.bx - 3, VOLI.net + 4.5] }),
    Object.assign(sportPerson(putri, 0xd9577a, 2, nm(2)), { team: 1, home: [VOLI.ax + 3, VOLI.net - 4.5] }),
    Object.assign(sportPerson(putri, 0xd9577a, 3, nm(3)), { team: 1, home: [VOLI.bx - 3, VOLI.net - 4.5] }),
  ], f: null, score: [0, 0], wait: 1, server: 0, recv: null };
  voli.ps.forEach((p) => p.position.set(p.home[0], 0, p.home[1]));
  basket = { ps: [
    Object.assign(sportPerson(putri, 0x1e88e5, 4, nm(4)), { team: 0 }), Object.assign(sportPerson(putri, 0x1e88e5, 5, nm(5)), { team: 0 }),
    Object.assign(sportPerson(putri, 0xf57c00, 6, nm(6)), { team: 1 }), Object.assign(sportPerson(putri, 0xf57c00, 7, nm(7)), { team: 1 }),
  ], holder: null, f: null, loose: null, score: [0, 0], hold: 0 };
  basket.ps.forEach((p, i) => p.position.set(BASK.cx - 3 + (i % 2) * 6, 0, (BASK.az + BASK.bz) / 2 + (p.team ? -3 : 3)));
  basket.holder = basket.ps[0];
}
// ---------- voli ----------
function voliSide(z) { return z > VOLI.net ? 0 : 1; }
function voliTarget(team) {   // titik jatuh di sisi tim lawan dari `team`
  const zs = team === 0 ? [VOLI.az + 1.5, VOLI.net - 1.5] : [VOLI.net + 1.5, VOLI.bz - 1.5];
  return new THREE.Vector3(VOLI.ax + 1.2 + Math.random() * (VOLI.bx - VOLI.ax - 2.4), 0.3, zs[0] + Math.random() * (zs[1] - zs[0]));
}
function voliHit(hitter, team) {
  const to = voliTarget(team), from = hitter.position.clone(); from.y = 2.3;
  voli.f = flight(from, to, 4.2, 1.35 + Math.random() * 0.3); voli.f.team = team;
  playAnim(hitter, 'lambai', 0.5);
  const recvTeam = 1 - team, cands = voli.ps.filter((p) => p.team === recvTeam).concat(playingSport === 'voli' && recvTeam === 0 ? [player] : []);
  voli.recv = cands.reduce((a, b) => (a.position.distanceTo(to) < b.position.distanceTo(to) ? a : b));
}
function updateVoli(dt, active) {
  vBall.visible = active; voli.ps.forEach((p) => (p.visible = active));
  if (!active) return;
  const V = voli;
  if (!V.f) {
    V.wait -= dt;
    const srv = V.ps.find((p) => p.team === V.server);
    if (V.wait <= 0) voliHit(srv, V.server);
    else { vBall.position.copy(srv.position); vBall.position.y = 2.2; }
  } else {
    V.f.t += dt; const k = flyPos(V.f, vBall.position);
    const r = V.recv;
    if (r && r !== player) moveTo(r, V.f.to.x, V.f.to.z + (r.team ? -0.4 : 0.4), 5.2, dt);
    if (k >= 0.86 && r && Math.hypot(r.position.x - V.f.to.x, r.position.z - V.f.to.z) < (r === player ? 1.8 : 1.1)) {
      if (r === player) { Audio.sfx('knock'); bubble(player, pick(['Hap!', 'Oper!', 'Smash!']), 800); addPts(1); }
      voliHit(r, r === player ? 0 : r.team);
    } else if (k >= 1) {
      const win = V.f.team; V.score[win]++; V.server = win; V.wait = 1.4; V.f = null;
      bubble(V.ps.find((p) => p.team === win), `Poin! ${V.score[0]}–${V.score[1]}`, 1400);
      if (playingSport === 'voli' && win === 0) addPts(2);
    }
  }
  V.ps.forEach((p) => { if (p !== V.recv || !V.f) moveTo(p, p.home[0], p.home[1], 3, dt); });
}
// ---------- basket ----------
const hoopOf = (team) => new THREE.Vector3(BASK.cx, 3.05, team === 0 ? BASK.hN : BASK.hS);
function shootBasket(shooter, team) {
  const H = hoopOf(team), d = Math.hypot(shooter.position.x - H.x, shooter.position.z - H.z);
  const from = shooter.position.clone(); from.y = 2.3;
  basket.f = flight(from, H, 2.4 + d * 0.12, 1.0 + d * 0.05);
  basket.f.make = Math.random() < (d < 4 ? 0.72 : d < 7 ? 0.5 : 0.3); basket.f.team = team; basket.f.by = shooter;
  basket.holder = null; playAnim(shooter, 'lambai', 0.6);
}
function updateBasket(dt, active) {
  bBall.visible = active; basket.ps.forEach((p) => (p.visible = active));
  if (!active) return;
  const B = basket, all = B.ps.concat(playingSport === 'basket' ? [player] : []), teamOf = (p) => (p === player ? 0 : p.team);
  if (B.holder) {
    const h = B.holder, t = teamOf(h), H = hoopOf(t);
    bBall.position.set(h.position.x + 0.45, 0.35 + Math.abs(Math.sin(performance.now() / 160)) * 0.8, h.position.z);
    if (h !== player) {
      const d = moveTo(h, H.x + (Math.random() - 0.5) * 0.2, H.z + (t === 0 ? 4.5 : -4.5), 3.6, dt);
      if (d < 0.4) { B.hold += dt; if (B.hold > 0.6) { B.hold = 0;
        if (playingSport === 'basket' && t === 0 && Math.random() < 0.45) { const from = h.position.clone(); from.y = 1.6; B.f = flight(from, player.position.clone().setY(1.4), 1.2, 0.7); B.f.pass = true; B.holder = null; bubble(h, `Tangkap, ${state.nama}!`, 1000); }
        else shootBasket(h, t); } }
    }
  } else if (B.f) {
    B.f.t += dt; const k = flyPos(B.f, bBall.position);
    if (k >= 1) {
      if (B.f.pass) { B.holder = player; toast('Kamu pegang bola! Tekan 🏀 Tembak'); }
      else if (B.f.make) {
        B.score[B.f.team] += 2; bubble(B.f.by, `Masuk! ${B.score[0]}–${B.score[1]}`, 1400);
        if (B.f.by === player) { addPts(3); toast('🏀 Masuk! +3 ⭐'); Audio.sfx('ok'); }
        const opp = B.ps.filter((p) => p.team !== B.f.team); B.holder = opp[Math.floor(Math.random() * opp.length)];
      } else { const H = B.f.to; B.loose = new THREE.Vector3(H.x + (Math.random() - 0.5) * 5, 0.3, H.z + (B.f.team === 0 ? 1 : -1) * (1 + Math.random() * 3)); if (B.f.by === player) toast('Meleset! Ambil lagi bolanya'); }
      B.f = null;
    }
  } else if (B.loose) {
    bBall.position.copy(B.loose);
    const near = all.reduce((a, b) => (a.position.distanceTo(B.loose) < b.position.distanceTo(B.loose) ? a : b));
    all.forEach((p) => { if (p !== player && p === near) moveTo(p, B.loose.x, B.loose.z, 4.5, dt); });
    if (near.position.distanceTo(B.loose) < 0.9 || player.position.distanceTo(B.loose) < 0.9) {
      B.holder = player.position.distanceTo(B.loose) < 0.9 && playingSport === 'basket' ? player : near; B.loose = null;
      if (B.holder === player) toast('Kamu pegang bola! Tekan 🏀 Tembak');
    }
  }
  // pemain lain mengatur posisi
  B.ps.forEach((p) => {
    if (p === B.holder || (B.loose && p.position.distanceTo(B.loose) < 6)) return;
    const atk = B.holder ? teamOf(B.holder) : 0, H = hoopOf(atk), side = p.team === atk ? 1 : -0.5;
    moveTo(p, BASK.cx + (B.ps.indexOf(p) % 2 ? 2.5 : -2.5), H.z + (atk === 0 ? 1 : -1) * (5 + side * 2), 3, dt);
  });
}
function joinSport(kind) {
  if (riding) return toast('🏍️ Parkir motor dulu');
  const info = kind === 'voli' ? ['🏐 Lapangan Voli', 'Kamu masuk tim hijau (sisi selatan net). Berlarilah ke arah jatuhnya bola untuk memukulnya kembali.'] : ['🏀 Lapangan Basket', 'Kamu masuk tim biru, menyerang ke ring utara. Ambil bola atau tunggu operan teman, lalu tekan 🏀 Tembak. Makin dekat ring, makin mudah masuk.'];
  modal(`<div class="tag">${info[0]}</div><div class="big">Ikut main?</div><p>${info[1]}</p>`, [['Ayo main!', () => {
    closeModal(); if (playingBall) leaveBall(); playingSport = kind;
    if (kind === 'voli') { player.position.set(VOLI.cx, 0, VOLI.net + 4); player.rotation.y = Math.PI; ctl([['🚪 Selesai', leaveSport]]); }
    else { player.position.set(BASK.cx, 0, (BASK.az + BASK.bz) / 2 + 2); player.rotation.y = Math.PI; ctl([['🏀 Tembak', () => { if (basket.holder === player) shootBasket(player, 0); else toast('Ambil bolanya dulu'); }], ['🚪 Selesai', leaveSport]]); }
    bubble(player, 'Aku ikut, ya!', 1400);
  }, 'main'], ['Nanti saja', closeModal, 'small']]);
}
function leaveSport() {
  if (!playingSport) return;
  if (basket && basket.holder === player) basket.holder = basket.ps[0];
  const k = playingSport; playingSport = null; ctl([]);
  if (zone === 'luar') { const e = isPutri(state.cls) ? -1 : 1; if (k === 'voli') player.position.set(e > 0 ? VOLI.bx + 4.5 : VOLI.ax - 4.5, 0, VOLI.net); else player.position.set(e > 0 ? BASK.bx + 4 : BASK.ax - 4, 0, (BASK.az + BASK.bz) / 2); player.rotation.y = 0; }
}
function updateSports(dt) {
  if (!voli) return;
  const active = ['istirahat1', 'santai', 'pulang'].includes(phase) && zone === 'luar';
  if (!active && playingSport) leaveSport();
  updateVoli(dt, active); updateBasket(dt, active);
}
