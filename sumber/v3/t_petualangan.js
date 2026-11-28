// =====================================================================
//  🌳 MODE PETUALANGAN: jelajah ke samping (cocok untuk layar mendatar)
//  Soal dijawab lewat permainan: injak batu jawaban, naik rakit ke gapura
//  jawaban, atau panah papan Benar/Salah. SETIAP SOAL HANYA SEKALI:
//  benar atau salah, langsung lanjut (tidak boleh mengulang).
//  Nyawa ❤️ hanya untuk rintangan (duri, lubang, musuh, bom, bos).
//  Tahap 2: Panah Api 🔥, musuh khas tiap tema, platform bergerak,
//  Bintang Ilmu 🌟, dan bos Raksasa Lupa sebelum garis finish.
// =====================================================================
const ADV = new THREE.Vector3(-660, 0, -700);
const advG = new THREE.Group(); advG.position.copy(ADV); scene.add(advG);
let adv = null, advParts = [];
const ZB = 3.2;                                   // batas kedalaman jalur
const LZ = [-2.4, 0, 2.4];                        // tiga jalur pilihan: atas, tengah, bawah
const OPT_COL = [0x3b7dd8, 0x8f5fb0, 0x2f8a5c], OPT_CSS = ['#3b7dd8', '#8f5fb0', '#2f8a5c'];
const ADV_THEME = {
  hutan: { n: 'Hutan Ilmu', sky: 0x9fd8f0, ground: 0x6fb35a, soil: 0x7a5a3a, water: 0x3f8fd0, darat: 'Kumbang Lupa', udara: 'Lebah Lalai', dc: 0x6a3fa0, uc: 0xf2b632 },
  pantai: { n: 'Pantai Ilmu', sky: 0xbfe8ff, ground: 0xf0d9a0, soil: 0xc9a86a, water: 0x2fa6c9, darat: 'Kepiting Malas', udara: 'Camar Usil', dc: 0xe0623e, uc: 0xf4f4f4 },
  gua: { n: 'Gua Ilmu', sky: 0x2b2a3a, ground: 0x8a8278, soil: 0x4e4842, water: 0x2f6f9a, darat: 'Kumbang Batu', udara: 'Kelelawar Kantuk', dc: 0x5a6070, uc: 0x5a3f6a },
};
function aadd(m) { advG.add(m); advParts.push(m); return m; }
function abox(w, h, d, c, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); m.castShadow = true; return aadd(m); }
function alabel(t, x, y, z, s = 0.7, acc = false) { const l = label(t, 0, 0, 0, s, acc); scene.remove(l); l.position.set(x, y, z); return aadd(l); }
const glow = (c) => new THREE.MeshBasicMaterial({ color: c });

function advDeco(theme, x) {
  const z = Math.random() < 0.6 ? -6 - Math.random() * 5 : -5 - Math.random() * 3;
  if (theme === 'hutan') {
    abox(0.5, 2.4, 0.5, 0x7a5233, x, 1.2, z);
    const t = new THREE.Mesh(treeGeoL, mat([0x3f9a47, 0x4caf50, 0x2f8a3c][Math.floor(Math.random() * 3)])); t.position.set(x, 3.2, z); t.scale.setScalar(1 + Math.random() * 0.5); aadd(t);
    if (Math.random() < 0.4) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), glow([0xff7aa8, 0xffe14d, 0xffffff][Math.floor(Math.random() * 3)])); f.position.set(x + 1.2, 0.2, -4.2); aadd(f); }
  } else if (theme === 'pantai') {
    abox(0.35, 3.4, 0.35, 0x9a7a4a, x, 1.7, z).rotation.z = 0.15;
    for (let k = 0; k < 5; k++) { const f = abox(1.8, 0.1, 0.5, 0x3f9a47, x + 0.25, 3.5, z); f.rotation.y = k / 5 * Math.PI * 2; f.rotation.z = -0.35; f.geometry.translate(0.9, 0, 0); }
    if (Math.random() < 0.35) { const sh = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.4, 7), mat(0xffb3a0)); sh.position.set(x + 1, 0.2, -4); aadd(sh); }
  } else {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1 + Math.random() * 1.2, 0), mat(0x5a544e)); r.position.set(x, 0.6, z); aadd(r);
    const st = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.2, 6), mat(0x4e4842)); st.rotation.x = Math.PI; st.position.set(x + 1.5, 7, z + 2); aadd(st);
    if (Math.random() < 0.5) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), glow([0x7fe3ff, 0xb48cff][Math.floor(Math.random() * 2)])); c.position.set(x + 0.8, 1.4, z + 0.4); aadd(c); }
  }
}
function makeCrate(x, z, kind) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const col = kind === 'bom' ? 0x8a3b2e : kind === 'nyawa' ? 0xd98aa8 : 0xb9874a;
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), mat(col)); b.position.y = 0.6; b.castShadow = true; g.add(b);
  [0.05, 1.15].forEach((y) => { const s = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.14, 1.26), mat(kind === 'bom' ? 0x3a2a22 : 0x7a5233)); s.position.y = y; g.add(s); });
  if (kind === 'bom') {
    const bomb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), mat(0x222222)); bomb.position.y = 1.5; g.add(bomb);
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6), mat(0xd9c38a)); fuse.position.set(0.1, 1.9, 0); fuse.rotation.z = -0.4; g.add(fuse);
    const sp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), glow(0xffb02e)); sp.position.set(0.18, 2.05, 0); g.add(sp); g.spark = sp;
  }
  if (kind === 'nyawa') { const h = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), glow(0xff4d6d)); h.position.y = 1.5; g.add(h); g.heart = h; }
  aadd(g); return { g, x, z, kind, alive: true };
}
// musuh: 'darat' berjalan maju-mundur, 'samping' bergeser ke dalam-luar, 'udara' terbang naik-turun
function makeFoe(type, TH, x, z, x0, x1) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const col = type === 'udara' ? TH.uc : TH.dc;
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), mat(col)); b.scale.set(1.2, 0.75, 1); b.position.y = 0.45; b.castShadow = true; g.add(b);
  [-0.18, 0.18].forEach((zz) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), glow(0xffffff)); e.position.set(0.55, 0.64, zz); g.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 5), glow(0x111111)); p.position.set(0.66, 0.64, zz); g.add(p); });
  if (type === 'udara') {
    g.wings = [-1, 1].map((s) => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.8), new THREE.MeshLambertMaterial({ color: TH.uc === 0xf4f4f4 ? 0xd0d8e0 : 0x9fd8f0, transparent: true, opacity: 0.85 })); w.position.set(0, 0.75, s * 0.55); g.add(w); return w; });
    if (TH.uc === 0xf2b632) [0.3, 0, -0.3].forEach((xx) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.62, 0.92), mat(0x2b2b2b)); s.position.set(xx - 0.1, 0.45, 0); g.add(s); });
  } else if (type === 'samping') [-1, 1].forEach((s) => { const c = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mat(col)); c.position.set(0.55, 0.4, s * 0.6); g.add(c); });
  aadd(g); return { g, type, x, z, x0, x1, dir: 1, alive: true, die: 0, y: type === 'udara' ? 1.4 : 0, ph: Math.random() * 6 };
}
function makeStar(x, y, z) {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), glow(0xffe14d)); m.position.set(x, y, z); aadd(m);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 6, 20), glow(0xfff3a0)); m.add(h);
  return { m, x, y, z, alive: true };
}
function makeBoss(x) {
  const g = new THREE.Group(); g.position.set(x, 0, 0);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.6, 20, 16), mat(0x7a4fb0)); body.position.y = 1.9; body.scale.y = 1.15; body.castShadow = true; g.add(body); g.body = body;
  [-0.55, 0.55].forEach((zz) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), glow(0xffffff)); e.position.set(-1.35, 2.4, zz); g.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), glow(0x1a1a1a)); p.position.set(-1.66, 2.4, zz); g.add(p); });
  [[-0.9, -0.35], [0.9, 0.35]].forEach(([zz, r]) => { const h = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1, 10), mat(0xffc83d)); h.position.set(0, 3.7, zz); h.rotation.x = r; g.add(h); });
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 1), glow(0x2b1b3a)); mouth.position.set(-1.5, 1.6, 0); g.add(mouth);
  [-0.8, 0.8].forEach((zz) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.9, 10), mat(0x5a3a88)); l.position.set(0, 0.45, zz); g.add(l); });
  aadd(g); return { g, x, z: 0, hp: 8, max: 8, alive: true, active: false, inv: 0, throwT: 2.5, rocks: [], die: 0 };
}

function startAdventure(lesson, bank, done) {
  advParts.forEach((m) => advG.remove(m)); advParts = [];
  const h = [...lesson.s].reduce((a, c) => a + c.charCodeAt(0), 0);
  const theme = ['hutan', 'pantai', 'gua'][(h + (state.day || 1)) % 3], TH = ADV_THEME[theme];
  const qs = pickQs(bank, Math.min(5, bank.length));
  const A = adv = { lesson, done, theme, TH, qs, hearts: 3, score: 0, correct: 0, answered: 0, over: false, go: false, fire: 0, stars: 0, faint: 0,
    p: { x: 0, y: 0, z: 0, vy: 0, face: 1, inv: 0, atk: 0, walk: 0 }, cp: { x: 0, z: 0 },
    ground: [], crates: [], foes: [], thorns: [], fruits: [], stations: [], arrows: [], fx: [], flags: [], plats: [], powers: [], starsL: [], finX: 0,
    prevBg: scene.background.getHex(), prevFog: scene.fog.color.getHex() };
  // ---- susun lintasan ----
  let x = 0, segStart = -14;
  const seg = (a, b) => { if (b - a < 0.1) return; A.ground.push([a, b]); const m = abox(b - a, 2, ZB * 2 + 1.6, TH.ground, (a + b) / 2, -1, 0); m.receiveShadow = true; abox(b - a, 1.6, 0.3, TH.soil, (a + b) / 2, -0.9, ZB + 0.95); };
  const pit = (a, b) => { seg(segStart, a); segStart = b; };
  const fruit = (fx, fz, fy = 1.1) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), mat([0xe0453e, 0xf2a33a, 0xffd84d][A.fruits.length % 3])); m.position.set(fx, fy, fz); aadd(m); A.fruits.push({ m, x: fx, y: fy, z: fz, alive: true }); };
  const power = (px) => { const g = new THREE.Group(); g.position.set(px, 0, 0); const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.5, 12), mat(0x9aa0a8)); ped.position.y = 0.25; g.add(ped);
    const f = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), glow(0xff7a1f)); f.position.y = 1.25; g.add(f); g.f = f; const r = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 6, 20), glow(0xffd84d)); r.position.y = 1.25; g.add(r); g.r = r; aadd(g);
    g.lbl = alabel('Panah Api', px, 2.3, 0, 0.5); A.powers.push({ g, x: px, alive: true }); };
  // pemandu di awal
  const ti = lesson.lab || !lesson.g || !lesson.g[0] ? { g: 'L', p: SCHOOL.demo ? 'Ustadz Pemandu' : 'Ustadz Syabirin' } : teacherInfo(lesson.g[0]);
  const guide = makePerson(teacherModel(ti.g, 2)); guide.position.set(4, 0, -2.6); guide.rotation.y = 0.3; guide.name = ti.p; nameTag(guide, ti.p + ' · Pemandu', 0.5); aadd(guide); A.guide = guide;
  alabel(TH.n, 7, 4.4, -4, 1.1, true);
  let pgCount = 0;
  qs.forEach((q, i) => {
    // ---- perjalanan: buah, peti, duri, musuh, lubang / platform ----
    for (let k = 0; k < 4; k++) fruit(x + 6 + k * 1.4, LZ[(i + k) % 3] * 0.5);
    A.crates.push(makeCrate(x + 12, -1.6, i === 3 ? 'nyawa' : 'biasa'), makeCrate(x + 12, 1.6, i === 1 || i === 4 ? 'bom' : i === 2 ? 'nyawa' : 'biasa'));
    if (i === 1) A.starsL.push(makeStar(x + 13.6, 0.9, 2.6));                       // tersembunyi di balik peti bom
    const tx = x + 17; A.thorns.push({ x: tx });
    for (let zz = -ZB; zz <= ZB; zz += 0.8) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 6), mat(theme === 'gua' ? 0x9aa0a8 : 0x2e6b34)); c.position.set(tx + (Math.random() - 0.5) * 0.3, 0.35, zz); aadd(c); }
    if (i === 4) A.starsL.push(makeStar(tx, 2.6, -2.6));
    const ft = i === 0 ? 'darat' : i === 3 ? 'samping' : (i % 2 ? 'udara' : 'darat');
    A.foes.push(makeFoe(ft, TH, x + 22, ft === 'samping' ? 0 : LZ[i % 3] * 0.6, x + 20, x + 25));
    if (i >= 2) A.foes.push(makeFoe(i === 2 ? 'udara' : 'darat', TH, x + 24, -LZ[i % 3] * 0.6, x + 21, x + 26));
    if (i === 1 || i === 3) power(x + 26);
    let cpx;
    if (i === 2) {        // lubang lebar dengan platform kayu bergerak
      pit(x + 28, x + 37);
      const pl = new THREE.Group(); const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.4, ZB * 2), mat(0xa87a4a)); top.position.y = -0.2; top.castShadow = true; pl.add(top);
      for (let k = -1; k <= 1; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.08, 0.12), mat(0x7a5233)); l.position.set(0, 0.02, k * 2); pl.add(l); }
      aadd(pl); A.plats.push({ g: pl, x: x + 29.6, a: x + 29.6, b: x + 35.4, w: 2.6, dir: 1, dx: 0 });
      A.starsL.push(makeStar(x + 32.5, 2.4, 0));
      cpx = x + 40;
    } else {
      pit(x + 28, x + 31); fruit(x + 29.5, 0, 2.2);
      if (i === 0) A.starsL.push(makeStar(x + 29.5, 3.1, -2.4));
      cpx = x + 34;
    }
    // ---- checkpoint ----
    abox(0.12, 2.6, 0.12, 0xdddddd, cpx, 1.3, -2.9); const fl = abox(0.9, 0.55, 0.05, 0xe0623e, cpx + 0.48, 2.3, -2.9); A.flags.push({ x: cpx, fl, on: false });
    // ---- pos soal ----
    const st = { i, q, kind: q.t === 'ox' ? 'panah' : (pgCount++ % 2 === 0 ? 'batu' : 'rakit'), done: false, x0: cpx + 2 };
    const opts = q.t === 'ox' ? [{ t: 'Benar', ok: q.a === true }, { t: 'Salah', ok: q.a === false }] : shuffle(q.o.slice(0, 3).map((t, k) => ({ t: plainText(t), ok: k === 0 })));
    st.opts = opts;
    if (st.kind === 'batu') {
      const a = cpx + 3, b = a + 7; pit(a, b); st.pit = [a, b]; st.sx = a + 3.2;
      st.stones = opts.map((o, k) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 1.2, 16), mat(OPT_COL[k])); m.position.set(st.sx, -0.6, LZ[k]); m.receiveShadow = true; aadd(m); alabel(o.t, st.sx, 1.5 + k * 0.05, LZ[k], 0.62); return { m, z: LZ[k], ok: o.ok }; });
      st.bridge = abox(7, 0.3, ZB * 2 + 1.6, 0xa87a4a, (a + b) / 2, -0.15, 0); st.bridge.visible = false;
      st.end = b; x = b;
    } else if (st.kind === 'rakit') {
      const a = cpx + 3, b = a + 30; pit(a, b); st.pit = [a, b]; st.gx = a + 21;
      const w = new THREE.Mesh(new THREE.PlaneGeometry(b - a, ZB * 2 + 1.6), mat(TH.water)); w.rotation.x = -Math.PI / 2; w.position.set((a + b) / 2, -0.45, 0); aadd(w);
      const raft = new THREE.Group(); for (let k = -2; k <= 2; k++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 2.8, 8), mat(0xc8a060)); l.rotation.x = Math.PI / 2; l.position.set(k * 0.5, -0.1, 0); raft.add(l); }
      raft.position.set(a + 1.6, 0, 0); aadd(raft); st.raft = { g: raft, x: a + 1.6, z: 0, home: a + 1.6 };
      st.gates = opts.map((o, k) => { const z = LZ[k]; const gg = new THREE.Group(); gg.position.set(st.gx, 0, z);
        [-0.95, 0.95].forEach((dz) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.2, 8), mat(0x8a5a33)); p.position.set(0, 1.2, dz); gg.add(p); });
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 2.3), mat(OPT_COL[k])); top.position.set(0, 2.9, 0); gg.add(top); gg.top = top; aadd(gg); alabel(o.t, st.gx, 3.35, z, 0.6);
        return { g: gg, top, z, ok: o.ok }; });
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
        return { disc, ring, x: tx2, z, ok: o.ok }; });
      st.end = st.gx + 2; x = st.gx + 2;
    }
    A.stations.push(st);
  });
  // ---- arena bos Raksasa Lupa ----
  const bx0 = x + 4, cpB = bx0 + 2;
  abox(0.12, 2.6, 0.12, 0xdddddd, cpB, 1.3, -2.9); A.flags.push({ x: cpB, fl: abox(0.9, 0.55, 0.05, 0xe0623e, cpB + 0.48, 2.3, -2.9), on: false });
  A.boss = makeBoss(bx0 + 20); A.boss.x0 = bx0 + 14; A.boss.x1 = bx0 + 24; A.bossStart = bx0 + 5;
  A.bossGate = new THREE.Group(); A.bossGate.position.set(bx0 + 28, 0, 0);
  for (let zz = -ZB; zz <= ZB + 0.01; zz += 0.55) { const bb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3, 0.35), mat(0x6a5a8a)); bb.position.set(0, 1.5, zz); A.bossGate.add(bb); }
  aadd(A.bossGate); A.bossGx = bx0 + 28;
  A.crates.push(makeCrate(bx0 + 8, -2.6, 'nyawa'));
  // ---- garis finish ----
  A.finX = bx0 + 36; seg(segStart, A.finX + 20);
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
      { p: guide, t: `Assalamu'alaikum, ${state.nama}! Selamat datang di ${TH.n}. Di sini kamu menjawab ${qs.length} soal ${SUBJ[lesson.s] || ''} sambil bertualang.` },
      { p: guide, t: 'Geser jempol kiri (atau WASD) untuk berjalan. ⤴️ Lompat melewati duri dan lubang. 👊 Serang untuk memecahkan peti dan mengalahkan musuh. 🏹 Panah untuk menembak dari jauh.' },
      { p: guide, t: `Hati-hati: peti merah berisi bom, panah saja dari jauh. Waspadai ${TH.darat} dan ${TH.udara}! Ambil 🔥 Panah Api supaya panahmu menembus musuh.` },
      { p: guide, t: 'Ingat: setiap soal hanya dijawab SATU KALI. Batu, gapura, atau papan yang kamu pilih itulah jawabanmu. Benar atau salah, kamu langsung lanjut. Pikirkan baik-baik sebelum memilih!' },
      { p: guide, t: 'Di ujung jalan, Raksasa Lupa menjaga garis finish. Kumpulkan juga 3 🌟 Bintang Ilmu yang tersembunyi. Bismillah!' },
    ], () => { A.go = true; Audio.sfx('bell'); toast('🌳 Petualangan dimulai!'); });
    modal(`<div class="tag">${lesson.lab ? 'Latihan Lab Komputer' : 'Tugas dari ' + esc(teacherInfo(lesson.g[0]).p)}</div><div class="big">🌳 Petualangan ${esc(SUBJ[lesson.s] || lesson.s)}</div>
      <p>${qs.length} pos soal menunggumu di ${TH.n}. Jawab dengan <b>bermain</b>: injak batu, naik rakit, dan memanah!</p>
      <p class="muted">Setiap soal hanya sekali: salah langsung lanjut, tidak bisa diulang.<br>Paling seru dimainkan dengan HP mendatar (landscape) 📱↔️</p>`,
      [['▶️ Mulai petualangan', () => { closeModal(); if (matchMedia('(pointer:coarse)').matches && innerHeight > innerWidth && !document.fullscreenElement) { document.body.classList.add('rotok'); goLandscape(); } intro(); }, 'main']]);
  });
}
function advHud() {
  const A = adv; if (!A) return;
  $('qhud').innerHTML = `${'❤️'.repeat(Math.max(0, A.hearts))}${'🤍'.repeat(Math.max(0, 3 - A.hearts))} · ⭐ ${A.score} · Soal ${Math.min(A.answered + 1, A.stations.length)}/${A.stations.length} · 🌟 ${A.stars}/3${A.fire > 0 ? ` · 🔥×${A.fire}` : ''}`;
}
function advJump() { const A = adv; if (!A || !A.go || A.over || paused) return; if (A.p.y <= 0.001 && A.p.y > -0.3 && advSolid(A.p.x, A.p.z)) { A.p.vy = 8.4; } }
function advAtk() {
  const A = adv; if (!A || !A.go || A.over || paused || A.p.atk > 0) return; A.p.atk = 0.3;
  const P = A.p, reach = (o, r = 2.1) => { const dx = (o.x - P.x) * P.face; return dx > -0.4 && dx < r && Math.abs(o.z - P.z) < 1.4; };
  A.crates.forEach((c) => { if (c.alive && reach(c)) breakCrate(c); });
  A.foes.forEach((b) => { if (b.alive && reach(b) && Math.abs(P.y + 1 - (b.y + 0.5)) < 1.5) killFoe(b); });
  const B = A.boss; if (B && B.alive && B.active && reach(B, 2.9)) hitBoss(1);
}
function advShoot() {
  const A = adv; if (!A || !A.go || A.over || paused || A.p.atk > 0) return; A.p.atk = 0.25;
  const fire = A.fire > 0; if (fire) { A.fire--; advHud(); }
  const m = new THREE.Mesh(new THREE.CylinderGeometry(fire ? 0.09 : 0.05, fire ? 0.09 : 0.05, 1.1, 6), fire ? glow(0xff7a1f) : mat(0x8a5a33)); m.rotation.z = Math.PI / 2;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(fire ? 0.2 : 0.11, 0.34, 6), fire ? glow(0xffd84d) : mat(0x9aa0a8)); tip.rotation.z = A.p.face > 0 ? Math.PI : 0; tip.position.y = -0.6 * A.p.face; m.add(tip);
  m.position.set(A.p.x + 0.6 * A.p.face, A.p.y + 1.45, A.p.z); aadd(m);
  A.arrows.push({ m, x: m.position.x, y: m.position.y, z: A.p.z, dir: A.p.face, life: 0.9, fire, hit: false });
}
function advBoom(x, y, z, col = 0xffb02e, sz = 0.4) { const s = new THREE.Mesh(new THREE.SphereGeometry(sz, 12, 8), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })); s.position.set(x, y, z); aadd(s); adv.fx.push({ m: s, t: 0, k: 'boom' }); }
function advConfetti(x, y, z, n = 26) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.04), glow([0xffd84d, 0x3fa35a, 0x3b7dd8, 0xe0623e, 0xff7aa8][i % 5])); m.position.set(x, y, z); aadd(m);
    adv.fx.push({ m, t: 0, k: 'conf', v: new THREE.Vector3((Math.random() - 0.5) * 6, 4 + Math.random() * 4, (Math.random() - 0.5) * 6) });
  }
}
function breakCrate(c) {
  const A = adv; c.alive = false; c.g.visible = false; advBoom(c.x, 0.8, c.z, c.kind === 'bom' ? 0xff5a1f : 0xd9b27a);
  if (c.kind === 'bom') {
    advBoom(c.x, 1, c.z, 0xffd84d, 0.7); toast('💥 Bom meledak!');
    if (Math.hypot(A.p.x - c.x, A.p.z - c.z) < 2.8) advHurt('Kena ledakan bom!', false);
  } else if (c.kind === 'nyawa') { if (A.hearts < 3) { A.hearts++; Audio.sfx('ok'); toast('❤️ Nyawa bertambah!'); } else { A.score += 50; toast('❤️ Nyawa penuh · +50'); } }
  else { A.score += 20; Audio.sfx('tick'); toast('+20 🍎'); }
  advHud();
}
function killFoe(b) { const A = adv; b.alive = false; b.die = 0.4; A.score += 50; Audio.sfx('ok'); advBoom(b.x, b.y + 0.5, b.z, 0xffffff, 0.3); toast(`${b.type === 'udara' ? A.TH.udara : A.TH.darat} kalah! +50`); advHud(); }
function hitBoss(dmg) {
  const A = adv, B = A.boss; if (!B.alive || B.inv > 0) return;
  B.hp -= dmg; B.inv = 0.35; Audio.sfx('knock'); advBoom(B.x - 1, 2, B.z, 0xffd84d, 0.5);
  if (B.hp <= 0) {
    B.alive = false; B.die = 1; A.score += 300; Audio.sfx('bell'); advConfetti(B.x, 3, B.z, 40);
    B.rocks.forEach((r) => { r.alive = false; r.m.visible = false; });
    toast('👹 Raksasa Lupa kalah! +300 · Gerbang finish terbuka'); bubble(A.me, 'Allahu Akbar!', 1600);
  }
  advHud();
}
function advSolid(x, z) {
  const A = adv;
  for (const [a, b] of A.ground) if (x >= a - 0.2 && x <= b + 0.2) return true;
  for (const pl of A.plats) if (Math.abs(x - pl.x) < pl.w / 2 + 0.1) return true;
  for (const st of A.stations) {
    if (st.kind === 'batu') { if (st.bridge.visible && x >= st.pit[0] && x <= st.pit[1]) return true; for (const s of st.stones) if (Math.hypot(x - st.sx, z - s.z) < 1.2) return true; }
    if (st.kind === 'rakit' && Math.abs(x - st.raft.x) < 1.5 && Math.abs(z - st.raft.z) < 1.5) return true;
  }
  return false;
}
function advHurt(msg, respawn) {
  const A = adv; if (A.over) return;
  const hurt = A.p.inv <= 0; if (!hurt && !respawn) return;
  if (hurt) { A.hearts--; A.p.inv = 1.6; Audio.sfx('no'); toast('💔 ' + msg); bubble(A.me, 'Aduh!', 900); advHud(); }
  if (A.hearts <= 0) {      // pingsan: kembali ke checkpoint, nyawa dipulihkan; soal yang sudah dijawab tetap terkunci
    A.faint++; A.hearts = 3; A.score = Math.max(0, A.score - 100); respawn = true;
    setTimeout(() => toast('😵 Pingsan! Kembali ke checkpoint · nyawa pulih · skor −100'), 500);
  }
  if (respawn) {
    A.go = false;
    fade('🚩 Kembali ke checkpoint…', 450, () => {
      A.p.x = A.cp.x; A.p.z = A.cp.z; A.p.y = 0; A.p.vy = 0; A.p.inv = Math.max(A.p.inv, 1.2);
      A.stations.forEach((st) => { if (st.kind === 'rakit' && A.cp.x < st.pit[0]) { st.raft.x = st.raft.home; st.raft.z = 0; } });
      if (A.boss) A.boss.rocks.forEach((r) => { r.alive = false; r.m.visible = false; });
      advHud(); A.go = true;
    });
  } else A.p.x -= 1.6 * A.p.face;
}
function curStation() { const A = adv; return A.stations.find((s) => !s.done && A.p.x > s.x0 - 6 && A.p.x < s.end + 2); }
// jawaban: hanya sekali. Benar = poin & konfeti; salah = langsung lewat (tidak bisa diulang)
function stationAnswer(st, ok) {
  const A = adv; if (st.done) return; st.done = true; st.ok = ok; A.answered++;
  if (ok) { A.correct++; A.score += 200; Audio.sfx('ok'); toast('✅ Benar! +200'); advConfetti(A.p.x, 2, A.p.z); bubble(A.me, 'Alhamdulillah!', 1400); }
  else { Audio.sfx('no'); toast('✗ Jawaban salah · lanjut ke pos berikutnya'); bubble(A.me, 'Yah, salah…', 1400); }
  $('qbanner').classList.remove('show'); $('qbanner').dataset.k = '';
  advHud();
}
function updateAdv(dt) {
  if (zone !== 'tualang' || !adv) return;
  const A = adv, P = A.p, t = clock.elapsedTime, B = A.boss;
  for (const pl of A.plats) { pl.dx = 0; if (paused) continue; const ox = pl.x; pl.x += pl.dir * 2.4 * dt; if (pl.x > pl.b) { pl.x = pl.b; pl.dir = -1; } if (pl.x < pl.a) { pl.x = pl.a; pl.dir = 1; } pl.dx = pl.x - ox; pl.g.position.set(pl.x, 0, 0); }
  if (A.go && !A.over && !paused) {
    // ---- gerak ----
    let vx = 0, vz = 0;
    if (keys.has('a') || keys.has('arrowleft')) vx -= 1;
    if (keys.has('d') || keys.has('arrowright')) vx += 1;
    if (keys.has('w') || keys.has('arrowup')) vz -= 1;
    if (keys.has('s') || keys.has('arrowdown')) vz += 1;
    if (joy.active) { vx += joy.dx; vz += joy.dy; }
    const L = Math.hypot(vx, vz), sp = 7.5 * Math.min(1, L) / (L || 1);
    const onGround = P.y <= 0.05 && P.y > -0.3;
    let onRaft = null, onPlat = null;
    if (onGround) {
      for (const st of A.stations) if (st.kind === 'rakit' && Math.abs(P.x - st.raft.x) < 1.5 && Math.abs(P.z - st.raft.z) < 1.5) onRaft = st;
      for (const pl of A.plats) if (Math.abs(P.x - pl.x) < pl.w / 2 + 0.1) { let g = false; for (const [a, b] of A.ground) if (P.x >= a - 0.2 && P.x <= b + 0.2) g = true; if (!g) onPlat = pl; }
    }
    let nx = P.x + vx * sp * dt, nz = THREE.MathUtils.clamp(P.z + vz * sp * dt, -ZB, ZB);
    if (onPlat) nx += onPlat.dx;
    if (nx < -12) nx = -12;
    // benda padat: peti, gerbang bambu, gerbang bos
    for (const c of A.crates) if (c.alive && Math.abs(nx - c.x) < 0.95 && Math.abs(nz - c.z) < 0.95 && P.y < 1.15) { if (Math.abs(P.x - c.x) >= 0.95) nx = P.x; else nz = P.z; }
    for (const st of A.stations) if (st.kind === 'panah' && !st.done && nx > st.gx - 0.6 && P.x <= st.gx - 0.6) nx = st.gx - 0.6;
    if (B && B.alive && nx > A.bossGx - 0.6) nx = Math.min(nx, A.bossGx - 0.6);
    if (onRaft) {      // di atas rakit: rakit melaju sendiri, pemain mengemudikan ke atas/bawah
      const R = onRaft.raft; nx = THREE.MathUtils.clamp(nx, R.x - 1.1, R.x + 1.1);
      R.z += THREE.MathUtils.clamp(nz - R.z, -4 * dt, 4 * dt); R.z = THREE.MathUtils.clamp(R.z, -2.6, 2.6);
      if (R.x < onRaft.pit[1] - 1.6) { const before = R.x; R.x += 5.2 * dt; nx += R.x - before;
        if (!onRaft.done && before < onRaft.gx && R.x >= onRaft.gx) {        // gapura yang dilewati = jawaban (sekali saja)
          let k = 0; LZ.forEach((z, j) => { if (Math.abs(R.z - z) < Math.abs(R.z - LZ[k])) k = j; });
          const g = onRaft.gates[Math.min(k, onRaft.gates.length - 1)];
          g.top.material = mat(g.ok ? 0x7fe37f : 0x9a9a9a); stationAnswer(onRaft, g.ok);
        }
      }
    }
    P.x = nx; P.z = nz;
    if (L > 0.1) { if (Math.abs(vx) > 0.2) P.face = Math.sign(vx); P.walk += dt * 11; } else P.walk *= 0.85;
    // ---- lompat & jatuh ----
    const grounded = onGround && advSolid(P.x, P.z);
    if (P.vy !== 0 || !grounded) {
      const wasAir = P.y > 0.001;
      P.vy -= 24 * dt; P.y += P.vy * dt;
      if (P.y <= 0 && P.vy < 0 && P.y > -0.4 && advSolid(P.x, P.z)) {
        P.y = 0; P.vy = 0;
        if (wasAir) { const d = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.45, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })); d.rotation.x = -Math.PI / 2; d.position.set(P.x, 0.06, P.z); aadd(d); A.fx.push({ m: d, t: 0, k: 'dust' }); }
      }
      if (P.y < -3) advHurt('Jatuh ke lubang!', true);
    }
    // batu jawaban: batu pertama yang diinjak = jawaban (sekali saja)
    for (const st of A.stations) if (st.kind === 'batu' && !st.done && P.y === 0) for (const s of st.stones) if (Math.hypot(P.x - st.sx, P.z - s.z) < 1.2) {
      s.m.material = mat(s.ok ? 0x7fe37f : 0x9a9a9a); stationAnswer(st, s.ok); st.bridge.visible = true; break;
    }
    if (P.inv > 0) P.inv -= dt; if (P.atk > 0) P.atk -= dt;
    // ---- duri ----
    for (const th of A.thorns) if (Math.abs(P.x - th.x) < 0.55 && P.y < 0.55 && P.inv <= 0) advHurt('Kena duri! Lompati ya.', false);
    // ---- musuh ----
    for (const b of A.foes) {
      if (!b.alive) { if (b.die > 0) { b.die -= dt; b.g.scale.setScalar(Math.max(0.05, b.die * 2.5)); if (b.die <= 0) b.g.visible = false; } continue; }
      b.ph += dt;
      if (b.type === 'samping') { b.z += b.dir * 1.8 * dt; if (b.z > 2.8) b.dir = -1; if (b.z < -2.8) b.dir = 1; b.g.rotation.y = b.dir > 0 ? -Math.PI / 2 : Math.PI / 2; }
      else { b.x += b.dir * (b.type === 'udara' ? 1.6 : 2.2) * dt; if (b.x > b.x1) b.dir = -1; if (b.x < b.x0) b.dir = 1; b.g.rotation.y = b.dir > 0 ? 0 : Math.PI; }
      if (b.type === 'udara') { b.y = 1.3 + Math.sin(b.ph * 2.6) * 0.55; b.g.wings.forEach((w, k) => (w.rotation.x = Math.sin(t * 30) * 0.6 * (k ? 1 : -1))); }
      else b.y = Math.abs(Math.sin(t * 10)) * 0.08;
      b.g.position.set(b.x, b.y, b.z);
      const d = Math.hypot(P.x - b.x, P.z - b.z), feet = P.y, top = b.y + 0.8;
      if (d < 1.0 && P.vy < 0 && feet > top - 0.5 && feet < top + 0.4) { killFoe(b); P.vy = 7.5; }
      else if (d < 0.9 && feet < top - 0.3 && feet + 1.7 > b.y) advHurt(`Diganggu ${b.type === 'udara' ? A.TH.udara : A.TH.darat}!`, false);
    }
    // ---- buah, bintang, panah api ----
    for (const f of A.fruits) if (f.alive) { f.m.rotation.y += dt * 2; if (Math.hypot(P.x - f.x, P.y + 1 - f.y, P.z - f.z) < 0.95) { f.alive = false; f.m.visible = false; A.score += 10; Audio.sfx('tick'); advHud(); } }
    for (const s of A.starsL) if (s.alive) { s.m.rotation.y += dt * 3; s.m.position.y = s.y + Math.sin(t * 3) * 0.15; if (Math.hypot(P.x - s.x, P.y + 1 - s.y, P.z - s.z) < 1.1) { s.alive = false; s.m.visible = false; A.stars++; A.score += 100; Audio.sfx('bell'); advConfetti(s.x, s.y, s.z, 14); toast(`🌟 Bintang Ilmu ${A.stars}/3 · +100`); advHud(); } }
    for (const pw of A.powers) if (pw.alive) { pw.g.f.rotation.y += dt * 3; pw.g.r.rotation.x = t * 2; if (Math.abs(P.x - pw.x) < 0.9 && Math.abs(P.z) < 1.2 && P.y < 1.5) { pw.alive = false; pw.g.visible = false; pw.g.lbl.visible = false; A.fire += 6; Audio.sfx('ok'); advConfetti(pw.x, 1.3, 0, 12); toast('🔥 Panah Api ×6! Menembus musuh & peti'); advHud(); } }
    // ---- checkpoint ----
    for (const f of A.flags) if (!f.on && P.x > f.x) { f.on = true; f.fl.material = mat(0x3fa35a); A.cp = { x: f.x + 0.5, z: 0 }; toast('🚩 Checkpoint'); }
    // ---- bos Raksasa Lupa ----
    if (B) {
      if (!B.active && B.alive && P.x > A.bossStart) { B.active = true; Audio.sfx('knock'); toast('👹 Raksasa Lupa menghadang! Serang atau panah, lompati batunya!'); }
      if (B.active && B.alive) {
        if (B.inv > 0) B.inv -= dt;
        B.z += THREE.MathUtils.clamp(P.z - B.z, -1.2 * dt, 1.2 * dt);
        B.x = (B.x0 + B.x1) / 2 + Math.sin(t * 0.7) * (B.x1 - B.x0) / 2;
        B.throwT -= dt;
        if (B.throwT <= 0) {
          B.throwT = B.hp > 4 ? 2.4 : 1.6;
          const rm = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), mat(0x7a6a5a)); rm.position.set(B.x - 1.6, 0.45, B.z); aadd(rm);
          B.rocks.push({ m: rm, x: B.x - 1.6, z: B.z, alive: true });
        }
        if (Math.hypot(P.x - B.x, P.z - B.z) < 1.9 && P.y < 2.5) advHurt('Ditabrak Raksasa Lupa!', false);
      }
      for (const r of B.rocks) if (r.alive) {
        r.x -= 7 * dt; r.m.position.x = r.x; r.m.rotation.z += dt * 8;
        if (Math.abs(r.x - P.x) < 0.7 && Math.abs(r.z - P.z) < 0.8 && P.y < 0.75) { r.alive = false; r.m.visible = false; advHurt('Kena batu bergulir!', false); }
        if (r.x < A.bossStart - 6) { r.alive = false; r.m.visible = false; }
      }
      if (!B.alive && A.bossGate.position.y > -3.2) A.bossGate.position.y -= dt * 3;
    }
    // ---- panah ----
    for (const ar of A.arrows) {
      if (ar.life <= 0) continue;
      ar.life -= dt; ar.x += ar.dir * 26 * dt; ar.m.position.x = ar.x;
      if (ar.fire && Math.random() < 0.6) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), new THREE.MeshBasicMaterial({ color: Math.random() < 0.5 ? 0xff7a1f : 0xffd84d, transparent: true, opacity: 0.9 })); s.position.set(ar.x - ar.dir * 0.4, ar.y, ar.z); aadd(s); A.fx.push({ m: s, t: 0, k: 'spark' }); }
      const stop = () => { if (!ar.fire) ar.life = 0; };
      for (const c of A.crates) if (c.alive && Math.abs(ar.x - c.x) < 0.7 && Math.abs(ar.z - c.z) < 0.8 && ar.y < 1.9) { breakCrate(c); stop(); }
      for (const b of A.foes) if (b.alive && Math.abs(ar.x - b.x) < 0.7 && Math.abs(ar.z - b.z) < (ar.fire ? 1.2 : 0.8) && Math.abs(ar.y - (b.y + 0.5)) < 1.3) { killFoe(b); stop(); }
      if (B && B.alive && B.active && !ar.hit && Math.abs(ar.x - B.x) < 1.6 && Math.abs(ar.z - B.z) < 1.6) { ar.hit = true; hitBoss(ar.fire ? 2 : 1); ar.life = 0; }
      if (B) for (const r of B.rocks) if (r.alive && Math.abs(ar.x - r.x) < 0.6 && Math.abs(ar.z - r.z) < 0.8) { r.alive = false; r.m.visible = false; advBoom(r.x, 0.5, r.z, 0xb0a090, 0.3); stop(); }
      for (const st of A.stations) if (st.kind === 'panah' && !st.done) {
        for (const tg of st.targets) if (Math.abs(ar.x - tg.x) < 0.5 && Math.abs(ar.z - tg.z) < 0.85) {       // papan pertama yang kena = jawaban
          ar.life = 0; tg.disc.rotation.x = 1.2; tg.ring.visible = false;
          st.targets.forEach((o) => { if (o !== tg) o.disc.material = mat(0x9a9a9a); });
          stationAnswer(st, tg.ok); break;
        }
        if (ar.dir > 0 && ar.x > st.gx && P.x < st.gx) ar.life = 0;
      }
      if (ar.life <= 0) ar.m.visible = false;
    }
    A.arrows = A.arrows.filter((a) => a.life > 0 || (advG.remove(a.m), false));
    A.stations.forEach((st) => { if (st.kind === 'panah' && st.done && st.gate.position.y > -2.8) st.gate.position.y -= dt * 4; });
    // ---- soal / bos di layar ----
    const st = curStation(), bn = $('qbanner');
    if (st && P.x > st.x0 - 5) {
      const key = 'q' + st.i;
      if (bn.dataset.k !== key || !bn.classList.contains('show')) {
        const hint = { batu: 'Lompat ke <b>batu</b> jawabanmu', rakit: 'Naik rakit, kemudikan ke <b>gapura</b> jawabanmu', panah: 'Sejajarkan dengan papan lalu tekan <b>🏹 Panah</b>' }[st.kind] + ' · <b>hanya sekali</b>';
        bn.dataset.k = key;
        bn.innerHTML = `❓ ${st.q.q}<div class="lanes"${st.opts.length === 2 ? ' style="grid-template-columns:1fr 1fr"' : ''}>${st.opts.map((o, k) => `<span style="background:${st.kind === 'panah' ? (k ? '#d65a4a' : '#3fa35a') : OPT_CSS[k]}">${st.kind === 'panah' ? (k ? '⬇ ' : '⬆ ') : ['⬆ ', '• ', '⬇ '][k]}${esc(o.t)}</span>`).join('')}</div><div class="hint">${hint}</div>`;
        bn.classList.add('show');
      }
    } else if (B && B.active && B.alive) {
      const key = 'boss' + B.hp;
      if (bn.dataset.k !== key) { bn.dataset.k = key; bn.innerHTML = `👹 Raksasa Lupa<div class="bossbar"><i style="width:${Math.max(0, B.hp / B.max * 100)}%"></i></div><div class="hint">👊 Serang dari dekat · 🏹 Panah dari jauh · ⤴️ Lompati batu</div>`; bn.classList.add('show'); }
    } else if (bn.classList.contains('show')) { bn.classList.remove('show'); bn.dataset.k = ''; }
    if (P.x > A.finX) advEnd();
  }
  // ---- tampilan ----
  for (const st of A.stations) if (st.kind === 'rakit') st.raft.g.position.set(st.raft.x, Math.sin(t * 2) * 0.05, st.raft.z);
  for (const f of A.fx) {
    if (!f.m.visible) continue; f.t += dt;
    if (f.k === 'conf') { f.v.y -= 12 * dt; f.m.position.addScaledVector(f.v, dt); f.m.rotation.x += dt * 9; f.m.rotation.y += dt * 7; if (f.t > 1.3) f.m.visible = false; }
    else if (f.k === 'spark') { f.m.position.y += dt; f.m.material.opacity = Math.max(0, 0.9 - f.t * 3); if (f.t > 0.3) f.m.visible = false; }
    else if (f.k === 'dust') { f.m.scale.setScalar(1 + f.t * 5); f.m.material.opacity = Math.max(0, 0.7 - f.t * 2.5); if (f.t > 0.3) f.m.visible = false; }
    else { f.m.scale.setScalar(1 + f.t * 6); f.m.material.opacity = Math.max(0, 0.85 - f.t * 2); if (f.t > 0.45) f.m.visible = false; }
  }
  if (A.fx.length > 120) A.fx = A.fx.filter((f) => f.m.visible || (advG.remove(f.m), false));
  A.crates.forEach((c) => { if (c.g.spark) c.g.spark.visible = Math.sin(t * 18) > 0; if (c.g.heart) c.g.heart.scale.setScalar(1 + Math.sin(t * 6) * 0.15); });
  if (B) {
    if (B.alive) { B.g.position.set(B.x, Math.abs(Math.sin(t * 3)) * 0.2, B.z); B.g.body.material.color.set(B.inv > 0 ? 0xff8080 : 0x7a4fb0); }
    else if (B.die > 0) { B.die -= dt; B.g.scale.setScalar(Math.max(0.01, B.die)); B.g.rotation.y += dt * 8; if (B.die <= 0) B.g.visible = false; }
  }
  if (A.guide) A.guide.rotation.y = Math.atan2(P.x - 4, P.z + 2.6);
  const me = A.me; me.position.set(P.x, P.y, P.z); me.rotation.y = P.face > 0 ? Math.PI / 2 : -Math.PI / 2;
  me.visible = !(P.inv > 0 && Math.sin(t * 30) > 0.3);
  const sw = Math.sin(P.walk) * 0.6;
  if (P.y > 0.05) { me.legL.rotation.x = -0.7; me.legR.rotation.x = 0.35; me.armL.rotation.x = -2.2; me.armR.rotation.x = -2.2; }
  else { me.legL.rotation.x = sw; me.legR.rotation.x = -sw; me.armL.rotation.x = -sw; me.armR.rotation.x = P.atk > 0 ? -1.6 - Math.sin(P.atk / 0.3 * Math.PI) * 0.8 : sw; }
  // kamera samping (landscape lebih dekat, portrait lebih tinggi agar jalur terlihat); saat bos, kamera mundur sedikit
  const por = innerWidth < innerHeight, bc = B && B.active && B.alive ? 2.5 : 0;
  camera.position.lerp(tmp.set(P.x + (por ? 1.2 : 2.5 + bc), (por ? 12 : 7.4 + bc * 0.4) + Math.max(0, P.y) * 0.4, por ? 17 : 12 + bc).add(ADV), 1 - Math.pow(0.002, dt));
  camera.lookAt(ADV.x + P.x + (por ? 1.6 : 3.5 + bc), por ? 3.4 : 0.6, ADV.z);
}
function advEnd() {
  const A = adv; if (A.over) return; A.over = true; A.go = false; ctl([]); $('qbanner').classList.remove('show');
  A.score += A.hearts * 50; Audio.sfx('bell'); bubble(A.me, 'Alhamdulillah, sampai!', 1800); advConfetti(A.p.x, 3, 0, 50);
  const back = [[labReturn ? 'Kembali ke lab' : 'Kembali ke kelas', () => { advCleanup(); returnToClass(A.done); }, 'main']];
  setTimeout(() => {
    gameResult('🌳 Petualangan selesai!', A.lesson, A.correct, A.qs.length, A.score, null, back, 'petualangan');
    const extra = document.createElement('p'); extra.className = 'muted';
    extra.textContent = `🌟 Bintang Ilmu ${A.stars}/3 · ❤️ sisa ${A.hearts}${A.faint ? ` · pingsan ${A.faint}×` : ''}${A.boss && !A.boss.alive ? ' · 👹 Raksasa Lupa dikalahkan' : ''}`;
    $('mbody').appendChild(extra);
  }, 1100);
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
