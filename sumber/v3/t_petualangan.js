// =====================================================================
//  🌳 MODE PETUALANGAN: jelajah ke samping (cocok untuk layar mendatar)
//  Soal dijawab lewat permainan: injak batu jawaban, naik rakit ke gapura
//  jawaban, atau panah papan Benar/Salah. Nyawa 3 ❤️, ada checkpoint.
// =====================================================================
const ADV = new THREE.Vector3(-660, 0, -700);
const advG = new THREE.Group(); advG.position.copy(ADV); scene.add(advG);
let adv = null, advParts = [];
const ZB = 3.2;                                   // batas kiri-kanan (kedalaman) jalur
const LZ = [-2.4, 0, 2.4];                        // tiga jalur pilihan: atas, tengah, bawah
const OPT_COL = [0x3b7dd8, 0x8f5fb0, 0x2f8a5c], OPT_CSS = ['#3b7dd8', '#8f5fb0', '#2f8a5c'];
const ADV_THEME = {
  hutan: { n: 'Hutan Ilmu', sky: 0x9fd8f0, ground: 0x6fb35a, soil: 0x7a5a3a, water: 0x3f8fd0 },
  pantai: { n: 'Pantai Ilmu', sky: 0xbfe8ff, ground: 0xf0d9a0, soil: 0xc9a86a, water: 0x2fa6c9 },
  gua: { n: 'Gua Ilmu', sky: 0x2b2a3a, ground: 0x8a8278, soil: 0x4e4842, water: 0x2f6f9a },
};
function aadd(m) { advG.add(m); advParts.push(m); return m; }
function abox(w, h, d, c, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); m.castShadow = true; return aadd(m); }
function alabel(t, x, y, z, s = 0.7, acc = false) { const l = label(t, 0, 0, 0, s, acc); scene.remove(l); l.position.set(x, y, z); return aadd(l); }

function advDeco(theme, x) {
  const side = (Math.random() < 0.5 ? -1 : 1), z = side < 0 ? -6 - Math.random() * 5 : -5 - Math.random() * 3;
  if (theme === 'hutan') {
    const tr = abox(0.5, 2.4, 0.5, 0x7a5233, x, 1.2, z);
    const t = new THREE.Mesh(treeGeoL, mat([0x3f9a47, 0x4caf50, 0x2f8a3c][Math.floor(Math.random() * 3)])); t.position.set(x, 3.2, z); t.scale.setScalar(1 + Math.random() * 0.5); aadd(t); tr.castShadow = true;
  } else if (theme === 'pantai') {
    abox(0.35, 3.4, 0.35, 0x9a7a4a, x, 1.7, z).rotation.z = 0.15;
    for (let k = 0; k < 5; k++) { const f = abox(1.8, 0.1, 0.5, 0x3f9a47, x + 0.25, 3.5, z); f.rotation.y = k / 5 * Math.PI * 2; f.rotation.z = -0.35; f.geometry.translate(0.9, 0, 0); }
  } else {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1 + Math.random() * 1.2, 0), mat(0x5a544e)); r.position.set(x, 0.6, z); aadd(r);
    if (Math.random() < 0.4) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), new THREE.MeshBasicMaterial({ color: 0x7fe3ff })); c.position.set(x + 0.8, 1.4, z + 0.4); aadd(c); }
  }
}
function makeCrate(x, z, kind) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const col = kind === 'bom' ? 0x8a3b2e : 0xb9874a;
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), mat(col)); b.position.y = 0.6; b.castShadow = true; g.add(b);
  [0.05, 1.15].forEach((y) => { const s = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.14, 1.26), mat(kind === 'bom' ? 0x3a2a22 : 0x7a5233)); s.position.y = y; g.add(s); });
  if (kind === 'bom') {
    const bomb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), mat(0x222222)); bomb.position.y = 1.5; g.add(bomb);
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6), mat(0xd9c38a)); fuse.position.set(0.1, 1.9, 0); fuse.rotation.z = -0.4; g.add(fuse);
    const sp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb02e })); sp.position.set(0.18, 2.05, 0); g.add(sp); g.spark = sp;
  }
  aadd(g); return { g, x, z, kind, alive: true };
}
function makeBeetle(x, z, x0, x1) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), mat(0x6a3fa0)); b.scale.set(1.2, 0.7, 1); b.position.y = 0.45; b.castShadow = true; g.add(b);
  [-0.18, 0.18].forEach((zz) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); e.position.set(0.55, 0.62, zz); g.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), new THREE.MeshBasicMaterial({ color: 0x111111 })); p.position.set(0.64, 0.62, zz); g.add(p); });
  aadd(g); return { g, x, z, x0, x1, dir: 1, alive: true, die: 0 };
}

function startAdventure(lesson, bank, done) {
  advParts.forEach((m) => advG.remove(m)); advParts = [];
  const h = [...lesson.s].reduce((a, c) => a + c.charCodeAt(0), 0);
  const theme = ['hutan', 'pantai', 'gua'][(h + (state.day || 1)) % 3], TH = ADV_THEME[theme];
  const qs = pickQs(bank, Math.min(5, bank.length));
  const A = adv = { lesson, done, theme, qs, hearts: 3, score: 0, correct: 0, over: false, go: false,
    p: { x: 0, y: 0, z: 0, vy: 0, face: 1, inv: 0, atk: 0, walk: 0 }, cp: { x: 0, z: 0 },
    ground: [], crates: [], beetles: [], thorns: [], fruits: [], stations: [], arrows: [], fx: [], flags: [], finX: 0,
    prevBg: scene.background.getHex(), prevFog: scene.fog.color.getHex() };
  // ---- susun lintasan ----
  let x = 0, segStart = -14;
  const seg = (a, b) => { A.ground.push([a, b]); const m = abox(b - a, 2, ZB * 2 + 1.6, TH.ground, (a + b) / 2, -1, 0); m.receiveShadow = true; abox(b - a, 1.6, 0.3, TH.soil, (a + b) / 2, -0.9, ZB + 0.95); };
  const pit = (a, b) => { seg(segStart, a); segStart = b; };
  const fruit = (fx, fz, fy = 1.1) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), mat([0xe0453e, 0xf2a33a, 0xffd84d][A.fruits.length % 3])); m.position.set(fx, fy, fz); aadd(m); A.fruits.push({ m, x: fx, y: fy, z: fz, alive: true }); };
  // pemandu di awal
  const ti = lesson.lab || !lesson.g || !lesson.g[0] ? { g: 'L', p: SCHOOL.demo ? 'Ustadz Pemandu' : 'Ustadz Syabirin' } : teacherInfo(lesson.g[0]);
  const guide = makePerson(teacherModel(ti.g, 2)); guide.position.set(4, 0, -2.6); guide.rotation.y = 0.3; guide.name = ti.p; nameTag(guide, ti.p + ' · Pemandu', 0.5); aadd(guide); A.guide = guide;
  alabel(TH.n, 7, 4.4, -4, 1.1, true);
  let pgCount = 0, bombDone = false;
  qs.forEach((q, i) => {
    // perjalanan: buah, peti, duri, kumbang, lubang kecil
    for (let k = 0; k < 4; k++) fruit(x + 6 + k * 1.4, LZ[(i + k) % 3] * 0.5);
    A.crates.push(makeCrate(x + 12, -1.6, 'biasa'), makeCrate(x + 12, 1.6, (!bombDone && i === 1) ? 'bom' : i === 2 ? 'nyawa' : 'biasa'));
    if (i === 1) bombDone = true;
    if (A.crates[A.crates.length - 1].kind === 'nyawa') A.crates[A.crates.length - 1].g.children[0].material = mat(0xd9a0b8);
    const tx = x + 17; A.thorns.push({ x: tx });
    for (let zz = -ZB; zz <= ZB; zz += 0.8) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 6), mat(theme === 'gua' ? 0x9aa0a8 : 0x2e6b34)); c.position.set(tx + (Math.random() - 0.5) * 0.3, 0.35, zz); aadd(c); }
    A.beetles.push(makeBeetle(x + 22, LZ[i % 3] * 0.6, x + 20, x + 26));
    pit(x + 28, x + 31); fruit(x + 29.5, 0, 2.2);
    // checkpoint
    const cpx = x + 34; const pole = abox(0.12, 2.6, 0.12, 0xdddddd, cpx, 1.3, -2.9); const fl = abox(0.9, 0.55, 0.05, 0xe0623e, cpx + 0.48, 2.3, -2.9); A.flags.push({ x: cpx, fl, on: false }); pole.castShadow = false;
    // pos soal
    const st = { i, q, kind: q.t === 'ox' ? 'panah' : (pgCount++ % 2 === 0 ? 'batu' : 'rakit'), done: false, wrong: false, x0: cpx + 2 };
    const opts = q.t === 'ox' ? [{ t: 'Benar', ok: q.a === true }, { t: 'Salah', ok: q.a === false }] : shuffle(q.o.slice(0, 3).map((t, k) => ({ t: plainText(t), ok: k === 0 })));
    st.opts = opts;
    if (st.kind === 'batu') {
      const a = cpx + 3, b = a + 7; pit(a, b); st.pit = [a, b]; st.sx = a + 3.2;
      st.stones = opts.map((o, k) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 1.2, 16), mat(OPT_COL[k])); m.position.set(st.sx, -0.6, LZ[k]); m.receiveShadow = true; aadd(m); alabel(o.t, st.sx, 1.5 + k * 0.05, LZ[k], 0.62); return { m, z: LZ[k], ok: o.ok, sunk: false }; });
      st.bridge = abox(7, 0.3, ZB * 2 + 1.6, 0xa87a4a, (a + b) / 2, -0.15, 0); st.bridge.visible = false;
      st.end = b; x = b;
    } else if (st.kind === 'rakit') {
      const a = cpx + 3, b = a + 30; pit(a, b); st.pit = [a, b]; st.gx = a + 21;
      const w = new THREE.Mesh(new THREE.PlaneGeometry(b - a, ZB * 2 + 1.6), mat(TH.water)); w.rotation.x = -Math.PI / 2; w.position.set((a + b) / 2, -0.45, 0); aadd(w);
      const raft = new THREE.Group(); for (let k = -2; k <= 2; k++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 2.8, 8), mat(0xc8a060)); l.rotation.x = Math.PI / 2; l.position.set(k * 0.5, -0.1, 0); raft.add(l); }
      raft.position.set(a + 1.6, 0, 0); aadd(raft); st.raft = { g: raft, x: a + 1.6, z: 0, wait: 0, home: a + 1.6 };
      st.gates = opts.map((o, k) => { const z = LZ[k]; const gg = new THREE.Group(); gg.position.set(st.gx, 0, z);
        [-0.95, 0.95].forEach((dz) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.2, 8), mat(0x8a5a33)); p.position.set(0, 1.2, dz); gg.add(p); });
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 2.3), mat(OPT_COL[k])); top.position.set(0, 2.9, 0); gg.add(top);
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.6, 1.8), mat(0xc0392b)); bar.position.set(0, 0.6, 0); bar.visible = false; gg.add(bar); aadd(gg); alabel(o.t, st.gx, 3.35, z, 0.6);
        return { g: gg, bar, z, ok: o.ok, closed: false }; });
      st.end = b; x = b;
    } else {
      st.gx = cpx + 12;
      st.gate = new THREE.Group(); st.gate.position.set(st.gx, 0, 0);
      for (let zz = -ZB; zz <= ZB + 0.01; zz += 0.5) { const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.6, 8), mat(0x9bbf5a)); bb.position.set(0, 1.3, zz); st.gate.add(bb); }
      aadd(st.gate);
      st.targets = opts.map((o, k) => { const z = k ? 1.9 : -1.9, tx2 = cpx + 10;
        abox(0.16, 1.2, 0.16, 0x7a5233, tx2, 0.6, z);
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.16, 20), mat(k ? 0xd65a4a : 0x3fa35a)); disc.rotation.z = Math.PI / 2; disc.position.set(tx2, 1.55, z); aadd(disc);
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.18, 16), mat(0xffffff)); ring.rotation.z = Math.PI / 2; ring.position.set(tx2, 1.55, z); aadd(ring);
        alabel(o.t, tx2, 2.75, z, 0.75, true);
        return { disc, ring, x: tx2, z, ok: o.ok, hit: false }; });
      st.end = st.gx + 2; x = st.gx + 2;
    }
    A.stations.push(st);
  });
  // garis finish
  A.finX = x + 10; seg(segStart, A.finX + 20);
  [-ZB - 0.2, ZB + 0.2].forEach((zz) => abox(0.4, 4.2, 0.4, 0x8a5a33, A.finX, 2.1, zz));
  abox(0.5, 0.6, ZB * 2 + 1.4, 0xffc83d, A.finX, 4.3, 0); alabel('FINISH', A.finX, 5.3, 0, 1.4, true);
  for (let dx = -14; dx < A.finX + 18; dx += 4.5) advDeco(theme, dx + Math.random() * 2);
  // pemain
  A.me = makePlayer(meP()); A.me.position.set(0, 0, 0); A.me.rotation.y = Math.PI / 2; nameTag(A.me, state.nama, 0.5); aadd(A.me);

  fade(`Menuju ${TH.n}…`, 700, () => {
    zone = 'tualang'; hud(); Audio.setTrack('aksi'); player.visible = false; document.body.classList.add('tualang');
    scene.background.set(TH.sky); scene.fog.color.set(TH.sky);
    $('top').style.display = 'none'; $('qhud').classList.add('show'); advHud();
    ctl([['⤴️ Lompat', advJump], ['👊 Serang', advAtk], ['🏹 Panah', advShoot]]);
    const intro = () => say([
      { p: guide, t: `Assalamu'alaikum, ${state.nama}! Selamat datang di ${TH.n}. Di sini kamu menjawab soal ${SUBJ[lesson.s] || ''} sambil bertualang.` },
      { p: guide, t: 'Geser jempol kiri (atau tombol panah/WASD) untuk berjalan. Lompat ⤴️ untuk melewati duri dan lubang. Serang 👊 untuk memecahkan peti dan mengalahkan kumbang.' },
      { p: guide, t: 'Hati-hati: peti merah berisi bom! Jangan dipukul dari dekat — panah saja dari jauh atau lewati.' },
      { p: guide, t: 'Di pos soal: injak batu jawaban yang benar, kemudikan rakit ke gapura yang benar, atau panah 🏹 papan Benar/Salah. Kamu punya 3 nyawa ❤️. Bismillah!' },
    ], () => { A.go = true; Audio.sfx('bell'); toast('🌳 Petualangan dimulai!'); });
    modal(`<div class="tag">${lesson.lab ? 'Latihan Lab Komputer' : 'Tugas dari ' + esc(teacherInfo(lesson.g[0]).p)}</div><div class="big">🌳 Petualangan ${esc(SUBJ[lesson.s] || lesson.s)}</div>
      <p>${qs.length} pos soal menunggumu di ${TH.n}. Jawab dengan <b>bermain</b>: injak batu, naik rakit, dan memanah!</p><p class="muted">Paling seru dimainkan dengan HP mendatar (landscape) 📱↔️</p>`,
      [['▶️ Mulai petualangan', () => { closeModal(); if (matchMedia('(pointer:coarse)').matches && innerHeight > innerWidth && !document.fullscreenElement) { document.body.classList.add('rotok'); goLandscape(); } intro(); }, 'main']]);
  });
}
function advHud() { const A = adv; if (!A) return; $('qhud').innerHTML = `${'❤️'.repeat(Math.max(0, A.hearts))}${'🤍'.repeat(Math.max(0, 3 - A.hearts))} · ⭐ ${A.score} · Pos ${Math.min(A.stations.filter((s) => s.done).length + 1, A.stations.length)}/${A.stations.length}`; }
function advJump() { const A = adv; if (!A || !A.go || A.over || paused) return; if (A.p.y <= 0.001 && A.p.y > -0.3 && advSolid(A.p.x, A.p.z)) { A.p.vy = 8.4; } }
function advAtk() {
  const A = adv; if (!A || !A.go || A.over || paused || A.p.atk > 0) return; A.p.atk = 0.3;
  const P = A.p, reach = (o) => { const dx = (o.x - P.x) * P.face; return dx > -0.4 && dx < 2.1 && Math.abs(o.z - P.z) < 1.4; };
  A.crates.forEach((c) => { if (c.alive && reach(c)) breakCrate(c, true); });
  A.beetles.forEach((b) => { if (b.alive && reach(b) && P.y < 1) killBeetle(b); });
}
function advShoot() {
  const A = adv; if (!A || !A.go || A.over || paused || A.p.atk > 0) return; A.p.atk = 0.25;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6), mat(0x8a5a33)); m.rotation.z = Math.PI / 2;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 6), mat(0x9aa0a8)); tip.rotation.z = -Math.PI / 2 * A.p.face; tip.position.x = 0.65 * A.p.face; m.add(tip);
  m.position.set(A.p.x + 0.6 * A.p.face, A.p.y + 1.45, A.p.z); aadd(m);
  A.arrows.push({ m, x: m.position.x, y: m.position.y, z: A.p.z, dir: A.p.face, life: 0.9 });
}
function advBoom(x, y, z, col = 0xffb02e) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })); s.position.set(x, y, z); aadd(s); adv.fx.push({ m: s, t: 0 }); }
function breakCrate(c, melee) {
  const A = adv; c.alive = false; c.g.visible = false; advBoom(c.x, 0.8, c.z, c.kind === 'bom' ? 0xff5a1f : 0xd9b27a);
  if (c.kind === 'bom') {
    advBoom(c.x, 1, c.z, 0xffd84d); toast('💥 Bom meledak!');
    if (Math.hypot(A.p.x - c.x, A.p.z - c.z) < 2.8) advHurt('Kena ledakan bom!', false);
  } else if (c.kind === 'nyawa' && A.hearts < 3) { A.hearts++; Audio.sfx('ok'); toast('❤️ Nyawa bertambah!'); }
  else { A.score += 20; Audio.sfx('tick'); toast('+20 🍎'); }
  advHud();
}
function killBeetle(b) { const A = adv; b.alive = false; b.die = 0.4; A.score += 50; Audio.sfx('ok'); toast('Kumbang Lupa kalah! +50'); advHud(); }
function advSolid(x, z) {
  const A = adv;
  for (const [a, b] of A.ground) if (x >= a - 0.2 && x <= b + 0.2) return true;
  for (const st of A.stations) {
    if (st.kind === 'batu') { if (st.bridge.visible && x >= st.pit[0] && x <= st.pit[1]) return true; for (const s of st.stones) if (!s.sunk && Math.hypot(x - st.sx, z - s.z) < 1.2) return true; }
    if (st.kind === 'rakit' && st.raft && Math.abs(x - st.raft.x) < 1.5 && Math.abs(z - st.raft.z) < 1.5) return true;
  }
  return false;
}
function advHurt(msg, respawn) {
  const A = adv; if (A.over) return;
  const hurt = A.p.inv <= 0; if (!hurt && !respawn) return;
  if (hurt) { A.hearts--; A.p.inv = 1.6; Audio.sfx('no'); toast('💔 ' + msg); advHud(); if (A.hearts <= 0) return advEnd(false); }
  if (respawn) {
    A.go = false;
    fade('🚩 Kembali ke checkpoint…', 450, () => {
      A.p.x = A.cp.x; A.p.z = A.cp.z; A.p.y = 0; A.p.vy = 0; A.p.inv = Math.max(A.p.inv, 1);
      A.stations.forEach((st) => { if (st.kind === 'rakit' && A.cp.x < st.pit[0]) { st.raft.x = st.raft.home; st.raft.z = 0; st.raft.wait = 0; } });
      A.go = true;
    });
  } else A.p.x -= 1.6 * A.p.face;
}
function curStation() { const A = adv; return A.stations.find((s) => !s.done && A.p.x > s.x0 - 6 && A.p.x < s.end + 2); }
function stationAnswer(st, ok, opt) {
  const A = adv;
  if (ok) {
    st.done = true; if (!st.wrong) { A.correct++; A.score += 200; toast('✅ Benar! +200'); } else { A.score += 50; toast('✅ Benar! (+50)'); }
    Audio.sfx('ok'); advBoom(A.p.x, 2, A.p.z, 0x7fe37f); bubble(A.me, 'Alhamdulillah!', 1500);
    $('qbanner').classList.remove('show');
  } else { st.wrong = true; Audio.sfx('no'); }
  advHud();
}
function updateAdv(dt) {
  if (zone !== 'tualang' || !adv) return;
  const A = adv, P = A.p, t = clock.elapsedTime;
  if (A.go && !A.over && !paused) {
    // ---- gerak ----
    let vx = 0, vz = 0;
    if (keys.has('a') || keys.has('arrowleft')) vx -= 1;
    if (keys.has('d') || keys.has('arrowright')) vx += 1;
    if (keys.has('w') || keys.has('arrowup')) vz -= 1;
    if (keys.has('s') || keys.has('arrowdown')) vz += 1;
    if (joy.active) { vx += joy.dx; vz += joy.dy; }
    const L = Math.hypot(vx, vz), sp = 7.5 * Math.min(1, L) / (L || 1);
    let onRaft = null;
    for (const st of A.stations) if (st.kind === 'rakit' && P.y <= 0.05 && P.y > -0.3 && Math.abs(P.x - st.raft.x) < 1.5 && Math.abs(P.z - st.raft.z) < 1.5) onRaft = st;
    let nx = P.x + vx * sp * dt, nz = THREE.MathUtils.clamp(P.z + vz * sp * dt, -ZB, ZB);
    if (nx < -12) nx = -12;
    // benda padat: peti & gerbang bambu
    for (const c of A.crates) if (c.alive && Math.abs(nx - c.x) < 0.95 && Math.abs(nz - c.z) < 0.95 && P.y < 1.15) { if (Math.abs(P.x - c.x) >= 0.95) nx = P.x; else nz = P.z; }
    for (const st of A.stations) if (st.kind === 'panah' && !st.done && nx > st.gx - 0.6 && P.x <= st.gx - 0.6) nx = st.gx - 0.6;
    if (onRaft) {      // di atas rakit: rakit melaju sendiri, pemain mengemudikan kiri-kanan
      const R = onRaft.raft; nx = THREE.MathUtils.clamp(nx, R.x - 1.1, R.x + 1.1);
      R.z += THREE.MathUtils.clamp(nz - R.z, -4 * dt, 4 * dt); R.z = THREE.MathUtils.clamp(R.z, -2.6, 2.6);
      if (R.wait > 0) R.wait -= dt;
      else if (R.x < onRaft.pit[1] - 1.6) { const before = R.x; R.x += 5.2 * dt; nx += R.x - before;
        if (!onRaft.done && before < onRaft.gx && R.x >= onRaft.gx) {
          let k = 0; LZ.forEach((z, j) => { if (Math.abs(R.z - z) < Math.abs(R.z - LZ[k])) k = j; });
          const g = onRaft.gates[k];
          if (g && g.ok && !g.closed) { stationAnswer(onRaft, true); }
          else { if (g) { g.closed = true; g.bar.visible = true; } stationAnswer(onRaft, false); advHurt('Gapura jawaban salah! Coba gapura lain.', false); if (A.hearts > 0) { R.x = R.home + 0.5; R.wait = 1.2; nx = R.x; } }
        }
      }
    }
    P.x = nx; P.z = nz;
    if (L > 0.1) { if (Math.abs(vx) > 0.2) P.face = Math.sign(vx); P.walk += dt * 11; } else P.walk *= 0.85;
    // ---- lompat & jatuh ----
    const grounded = P.y <= 0.001 && P.y > -0.3 && (advSolid(P.x, P.z) || onRaft);
    if (P.vy !== 0 || !grounded) {
      const wasAir = P.y > 0.001;
      P.vy -= 24 * dt; P.y += P.vy * dt;
      if (P.y <= 0 && P.vy < 0 && P.y > -0.4 && advSolid(P.x, P.z)) {
        P.y = 0; P.vy = 0;
        if (wasAir) for (const st of A.stations) if (st.kind === 'batu' && !st.done) for (const s of st.stones) if (!s.sunk && Math.hypot(P.x - st.sx, P.z - s.z) < 1.2) {
          if (s.ok) { stationAnswer(st, true); st.bridge.visible = true; s.m.material = mat(0x7fe37f); }
          else { s.sunk = true; stationAnswer(st, false); advHurt('Batu jawaban salah, tenggelam!', true); }
        }
      }
      if (P.y < -3) advHurt('Jatuh ke lubang!', true);
    }
    // batu jawaban juga dipicu saat berjalan masuk tanpa lompat
    for (const st of A.stations) if (st.kind === 'batu' && !st.done && P.y === 0) for (const s of st.stones) if (!s.sunk && Math.hypot(P.x - st.sx, P.z - s.z) < 1.0) {
      if (s.ok) { stationAnswer(st, true); st.bridge.visible = true; s.m.material = mat(0x7fe37f); } else { s.sunk = true; stationAnswer(st, false); advHurt('Batu jawaban salah, tenggelam!', true); }
    }
    if (P.inv > 0) P.inv -= dt; if (P.atk > 0) P.atk -= dt;
    // ---- duri ----
    for (const th of A.thorns) if (Math.abs(P.x - th.x) < 0.55 && P.y < 0.55 && P.inv <= 0) { advHurt('Kena duri! Lompati ya.', false); }
    // ---- kumbang ----
    for (const b of A.beetles) {
      if (!b.alive) { if (b.die > 0) { b.die -= dt; b.g.scale.y = Math.max(0.05, b.die * 2.5); if (b.die <= 0) b.g.visible = false; } continue; }
      b.x += b.dir * 2.2 * dt; if (b.x > b.x1) b.dir = -1; if (b.x < b.x0) b.dir = 1;
      b.g.position.x = b.x; b.g.rotation.y = b.dir > 0 ? 0 : Math.PI; b.g.position.y = Math.abs(Math.sin(t * 10)) * 0.08;
      const d = Math.hypot(P.x - b.x, P.z - b.z);
      if (d < 1.0 && P.y > 0.2 && P.vy < 0) { killBeetle(b); P.vy = 7; }
      else if (d < 0.85 && P.y < 0.6) advHurt('Disengat Kumbang Lupa!', false);
    }
    // ---- buah ----
    for (const f of A.fruits) if (f.alive) { f.m.rotation.y += dt * 2; if (Math.hypot(P.x - f.x, P.y + 1 - f.y, P.z - f.z) < 0.95) { f.alive = false; f.m.visible = false; A.score += 10; Audio.sfx('tick'); advHud(); } }
    // ---- checkpoint ----
    for (const f of A.flags) if (!f.on && P.x > f.x) { f.on = true; f.fl.material = mat(0x3fa35a); A.cp = { x: f.x + 0.5, z: 0 }; toast('🚩 Checkpoint'); }
    // ---- panah ----
    for (const ar of A.arrows) {
      if (ar.life <= 0) continue;
      ar.life -= dt; ar.x += ar.dir * 26 * dt; ar.m.position.x = ar.x;
      for (const c of A.crates) if (c.alive && Math.abs(ar.x - c.x) < 0.7 && Math.abs(ar.z - c.z) < 0.8 && ar.y < 1.9) { breakCrate(c, false); ar.life = 0; }
      for (const b of A.beetles) if (b.alive && Math.abs(ar.x - b.x) < 0.7 && Math.abs(ar.z - b.z) < 0.8) { killBeetle(b); ar.life = 0; }
      for (const st of A.stations) if (st.kind === 'panah' && !st.done) {
        for (const tg of st.targets) if (!tg.hit && Math.abs(ar.x - tg.x) < 0.5 && Math.abs(ar.z - tg.z) < 0.85) {
          ar.life = 0; tg.hit = true; tg.disc.rotation.x = 1.2; tg.ring.visible = false;
          if (tg.ok) { stationAnswer(st, true); } else { stationAnswer(st, false); advHurt('Papan jawaban salah!', false); }
        }
        if (ar.dir > 0 && ar.x > st.gx && P.x < st.gx) ar.life = 0;
      }
      if (ar.life <= 0) ar.m.visible = false;
    }
    A.arrows = A.arrows.filter((a) => a.life > 0 || (advG.remove(a.m), false));
    // gerbang bambu turun setelah dijawab
    A.stations.forEach((st) => { if (st.kind === 'panah' && st.done && st.gate.position.y > -2.8) st.gate.position.y -= dt * 4; });
    // ---- soal di layar ----
    const st = curStation(), bn = $('qbanner');
    if (st && P.x > st.x0 - 5) {
      const hint = { batu: 'Lompat ke <b>batu</b> jawaban yang benar', rakit: 'Naik rakit, kemudikan ke <b>gapura</b> yang benar', panah: 'Hadap ke papan lalu tekan <b>🏹 Panah</b>' }[st.kind];
      const key = st.i + ':' + st.opts.map((o, k) => (st.gates && st.gates[k].closed) || (st.stones && st.stones[k].sunk) || (st.targets && st.targets[k].hit) ? 0 : 1).join('');
      if (bn.dataset.k !== key || !bn.classList.contains('show')) {
        bn.dataset.k = key;
        const gone = (k) => (st.gates && st.gates[k].closed) || (st.stones && st.stones[k].sunk) || (st.targets && st.targets[k].hit);
        bn.innerHTML = `❓ ${st.q.q}<div class="lanes"${st.opts.length === 2 ? ' style="grid-template-columns:1fr 1fr"' : ''}>${st.opts.map((o, k) => `<span style="background:${st.kind === 'panah' ? (k ? '#d65a4a' : '#3fa35a') : OPT_CSS[k]};${gone(k) ? 'opacity:.35;text-decoration:line-through' : ''}">${st.kind === 'panah' ? (k ? '⬇ ' : '⬆ ') : ['⬆ ', '• ', '⬇ '][k]}${esc(o.t)}</span>`).join('')}</div><div class="hint">${hint}</div>`;
        bn.classList.add('show');
      }
    } else if (bn.classList.contains('show')) { bn.classList.remove('show'); bn.dataset.k = ''; }
    if (P.x > A.finX) advEnd(true);
  }
  // ---- tampilan ----
  for (const st of A.stations) {
    if (st.kind === 'rakit') { st.raft.g.position.set(st.raft.x, Math.sin(t * 2) * 0.05, st.raft.z); }
    if (st.kind === 'batu') st.stones.forEach((s) => { if (s.sunk && s.m.position.y > -3) s.m.position.y -= dt * 2.5; });
  }
  for (const f of A.fx) { f.t += dt; f.m.scale.setScalar(1 + f.t * 6); f.m.material.opacity = Math.max(0, 0.85 - f.t * 2); if (f.t > 0.45) f.m.visible = false; }
  A.crates.forEach((c) => { if (c.g.spark) c.g.spark.visible = Math.sin(t * 18) > 0; });
  const me = A.me; me.position.set(P.x, P.y, P.z); me.rotation.y = P.face > 0 ? Math.PI / 2 : -Math.PI / 2;
  me.visible = !(P.inv > 0 && Math.sin(t * 30) > 0.3);
  const sw = Math.sin(P.walk) * 0.6;
  if (P.y > 0.05) { me.legL.rotation.x = -0.7; me.legR.rotation.x = 0.35; me.armL.rotation.x = -2.2; me.armR.rotation.x = -2.2; }
  else { me.legL.rotation.x = sw; me.legR.rotation.x = -sw; me.armL.rotation.x = -sw; me.armR.rotation.x = P.atk > 0 ? -1.6 - Math.sin(P.atk / 0.3 * Math.PI) * 0.8 : sw; }
  // kamera samping (landscape lebih dekat, portrait mundur agar jalur terlihat)
  const por = innerWidth < innerHeight;
  camera.position.lerp(tmp.set(P.x + (por ? 1.2 : 2.5), (por ? 12 : 7.4) + Math.max(0, P.y) * 0.4, por ? 17 : 12).add(ADV), 1 - Math.pow(0.002, dt));
  camera.lookAt(ADV.x + P.x + (por ? 1.6 : 3.5), por ? 3.4 : 0.6, ADV.z);
}
function advEnd(win) {
  const A = adv; if (A.over) return; A.over = true; A.go = false; ctl([]); $('qbanner').classList.remove('show');
  if (win) { A.score += A.hearts * 100; Audio.sfx('bell'); bubble(A.me, 'Alhamdulillah, sampai!', 1800); }
  const back = [[labReturn ? 'Kembali ke lab' : 'Kembali ke kelas', () => { advCleanup(); returnToClass(A.done); }, 'main']];
  if (!win) back.unshift(['🔁 Coba lagi', () => { closeModal(); advCleanup(); startAdventure(A.lesson, QBANK[A.lesson.s] || A.qs, A.done); }, 'main']);
  setTimeout(() => gameResult(win ? '🌳 Petualangan selesai!' : '💔 Nyawa habis', A.lesson, A.correct, A.qs.length, A.score, null, back, 'petualangan'), 1100);
}
function advCleanup() {
  const A = adv; if (!A) return;
  scene.background.set(A.prevBg); scene.fog.color.set(A.prevFog); document.body.classList.remove('tualang');
}
addEventListener('keydown', (e) => {
  if (zone !== 'tualang' || e.target.tagName === 'INPUT') return;
  const k = e.key.toLowerCase();
  if (k === ' ') { e.preventDefault(); advJump(); }
  else if (k === 'f' || k === 'j') advAtk();
  else if (k === 'k' || k === 'g') advShoot();
});
