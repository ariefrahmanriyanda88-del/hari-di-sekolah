
// =====================================================================
//  ORANG-ORANG: pemain, guru (nama asli), teman sekelas, satpam, pemain bola
// =====================================================================
const SKINS = [0xf0c8a0, 0xe2b48c, 0xd6a77a, 0xf3d1b0];
const HAIRC = [0x222222, 0x3b2a1e, 0x4a3426];
const faceOf = (i) => ({ eye: i % 3, brow: (i >> 1) % 2, mouth: i % 4 === 3 ? 2 : i % 2, glasses: i % 7 === 3 ? 0x333333 : null });
const TSHIRT = [0x2e4b80, 0x3a6e4a, 0x5b4a8a, 0x2b6f7a, 0x6b4a2b];
const HIJAB = [0xe9dfc9, 0xf2e6f0, 0xd7e6f2, 0xe6d3b3, 0xf5f0e6];
const teacherModel = (g, i = 0) => g === 'P'
  ? { putri: true, shirt: [0x8a3b5c, 0x3b6fa8, 0x6b4a8a, 0x2f7a6a, 0x9a5b3a][i % 5], bottom: 0x3a3a3a, hijab: HIJAB[i % 5], hijabStyle: i % 2, skin: SKINS[i % 4], face: faceOf(i + 2) }
  : { shirt: TSHIRT[i % 5], bottom: 0x2b2b2b, peci: 0x1a1a1a, tie: false, skin: SKINS[(i + 1) % 4], face: { ...faceOf(i + 1), brow: 1, glasses: i % 3 === 2 ? 0x5a4632 : null } };
const studentModel = (putri, i = 0) => putri ? { putri: true, bag: [0x8f5fb0, 0xe07a3e, 0x3b9ab0, 0xd9577a, 0x58ad4e][i % 5], skin: SKINS[i % 4], face: faceOf(i), hijabStyle: (i >> 1) % 2 } : { bag: [0x2f4f8f, 0x2f8a5c, 0xc0392b, 0x3b7dd8, 0x7a4fb0][i % 5], skin: SKINS[i % 4], face: faceOf(i), hair: i % 4, hairC: HAIRC[i % 3] };
const NAMES_PA = ['Fikri', 'Rizki', 'Hafidz', 'Umar', 'Bilal', 'Zaid', 'Hamzah', 'Usman', 'Salman', 'Faiz', 'Rafi', 'Ilham', 'Daffa', 'Naufal', 'Farhan', 'Aqil', 'Yusuf', 'Ihsan', 'Fadhil', 'Akbar'];
const NAMES_PI = ['Aisyah', 'Nabila', 'Zahra', 'Khadijah', 'Fatimah', 'Salsabila', 'Hana', 'Nadia', 'Syifa', 'Alya', 'Najwa', 'Kayla', 'Azizah', 'Mutiara', 'Hilya', 'Tsabita', 'Qonita', 'Afifah', 'Zulfa', 'Rahma'];

// ---------- avatar pemain (diatur di layar awal) ----------
const AV = {
  skin: [0xf6d5b8, 0xf0c8a0, 0xe2b48c, 0xd6a77a, 0xb98a5e, 0x8d6240],
  hairC: [0x1c1c1c, 0x3b2a1e, 0x5a3d26],
  hijabC: [0xf4f4f4, 0x1f2b38, 0x2f5d8a, 0x2f8a5c, 0xe6d3b3, 0x7a7d82, 0x8a3b5c],
  bag: [0x3b7dd8, 0x2f8a5c, 0xc0392b, 0x7a4fb0, 0xe07a3e, 0xd9577a, 0x2b2b2b],
  glasses: [null, 0x222222, 0x6b4a2b, 0x9aa1a8],
  peci: [null, 0x1a1a1a, 0xf4f4f4],
};
const defaultAvatar = (putri) => ({ skin: 1, hair: 0, hairC: 0, eye: 0, brow: 0, mouth: 0, glasses: 0, peci: 0, hijab: 0, hijabC: 0, bag: putri ? 5 : 0 });
function avatarModel(putri, a) {
  a = { ...defaultAvatar(putri), ...(a || {}) };
  const face = { eye: a.eye, brow: a.brow, mouth: a.mouth, glasses: AV.glasses[a.glasses], browC: putri ? 0x2a1d14 : AV.hairC[a.hairC] };
  return putri ? { putri: true, skin: AV.skin[a.skin], hijab: AV.hijabC[a.hijabC], hijabStyle: a.hijab, bag: AV.bag[a.bag], face }
    : { skin: AV.skin[a.skin], hair: a.hair, hairC: AV.hairC[a.hairC], peci: AV.peci[a.peci], bag: AV.bag[a.bag], face };
}
const avatarOf = (putri) => { try { return (state.avatar && state.avatar[putri ? 'P' : 'L']) || null; } catch (e) { return null; } };   // state belum ada saat awal dimuat
const makePlayer = (putri) => makePerson(avatarModel(putri, avatarOf(putri)));
let player = makePlayer(false);
scene.add(player);
function setPlayer(putri) {
  const old = player; scene.remove(old);
  player = makePlayer(putri);
  player.position.copy(old.position); player.rotation.y = old.rotation.y;
  scene.add(player); window.__p = player;
}
// nama di atas kepala: teks HTML (selalu tajam di layar HD)
const tagLayer = document.createElement('div'); tagLayer.id = 'tags';
document.getElementById('app').after(tagLayer);
const tagged = new Set();
function nameTag(g, text, size = 0.55, y = 2.75) {
  if (g.tagEl) g.tagEl.remove();
  const el = document.createElement('div'); el.className = 'ntag'; el.textContent = text;
  el.style.fontSize = Math.max(9, Math.min(11, size * 21)).toFixed(1) + 'px';
  g.tagEl = el; g.tagY = y; g.tagGone = 0; tagLayer.appendChild(el); tagged.add(g);
}
const _tv = new THREE.Vector3();
function updateTags() {
  for (const g of tagged) {
    const el = g.tagEl; let vis = true, o = g;
    while (o) { if (!o.visible) { vis = false; break; } if (!o.parent) { vis = o === scene; break; } o = o.parent; }
    if (!vis && !g.parent) { if (++g.tagGone > 300) { el.remove(); tagged.delete(g); } el.style.display = 'none'; continue; }
    g.tagGone = 0;
    if (vis) {
      g.getWorldPosition(_tv); _tv.y += (g.sitting ? g.tagY - 0.3 : g.tagY) + 0.1;
      vis = camera.position.distanceTo(_tv) < 60 && !g.bubEl;
      if (vis) { _tv.project(camera); vis = _tv.z < 1 && Math.abs(_tv.x) < 1.05 && Math.abs(_tv.y) < 1.05; }
    }
    if (!vis) { el.style.display = 'none'; continue; }
    if (!el.parentNode) tagLayer.appendChild(el);
    el.style.display = '';
    el.style.transform = `translate(${((_tv.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px,${((-_tv.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px) translate(-50%,-100%)`;
  }
}

// ---------- jaringan jalan untuk tokoh yang berjalan ----------
const NODES = [[0, 50], [0, 22], [0, 11], [-22, 11], [22, 11], [-49, 11], [49, 11], [-16, -6], [16, -6], [-6, 7], [6, 7], [-16, -18], [16, -18], [0, -34],
  [-12, -20], [12, -20], [-23, 28], [23, 28],
  [-49, -34], [-49, -12], [-49, 30], [-75, -34], [-75, -12], [-75, 30], [-85, 35], [-64, 37],
  [49, -34], [49, -12], [49, 30], [75, -34], [75, -12], [75, 30], [85, 35], [64, 37],
  [-16, 8], [16, 8], [0, -20]];
const EDGES = [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 6], [2, 9], [2, 10], [3, 34], [34, 7], [4, 35], [35, 8], [7, 11], [8, 12],
  [11, 14], [14, 36], [36, 15], [15, 12], [36, 13], [3, 16], [4, 17],
  [5, 19], [19, 18], [5, 20], [18, 21], [19, 22], [20, 23], [23, 24], [23, 25],
  [6, 27], [27, 26], [6, 28], [26, 29], [27, 30], [28, 31], [31, 32], [31, 33]];
const NB = NODES.map(() => []); EDGES.forEach(([a, b]) => { NB[a].push(b); NB[b].push(a); });
const nodeSide = (i) => (NODES[i][0] < -WING ? 'PA' : NODES[i][0] > WING ? 'PI' : 'C');
function allowedNode(n, i) { if (i === 0 || i === 1) return false; if ((i === 9 || i === 10) && !n.goingIn) return false; const s = nodeSide(i); return s === 'C' || n.kind === 'guru' || s === (n.putri ? 'PI' : 'PA'); }
function route(from, to, n) {
  const prev = new Map([[from, -1]]), q = [from];
  while (q.length) { const c = q.shift(); if (c === to) break; for (const k of NB[c]) if (!prev.has(k) && allowedNode(n, k)) { prev.set(k, c); q.push(k); } }
  if (!prev.has(to)) return [];
  const r = []; for (let c = to; c !== from; c = prev.get(c)) r.unshift(c); return r;
}
const nearestNode = (x, z) => NODES.reduce((b, p, i) => (Math.hypot(p[0] - x, p[1] - z) < Math.hypot(NODES[b][0] - x, NODES[b][1] - z) ? i : b), 0);

const npcs = [];
window.__npcs = npcs;
function addWalker(opts, model, node) {
  const g = makePerson(model);
  g.position.set(NODES[node][0], 0, NODES[node][1]);
  Object.assign(g, opts, { node, target: node, wait: Math.random() * 3, greetDay: 0, walker: true });
  if (opts.tag) nameTag(g, opts.tag);
  scene.add(g); npcs.push(g); return g;
}
function fixedNPC(x, z, rotY, model, opts) {
  const s = makePerson(model);
  s.position.set(x, 0, z); s.rotation.y = rotY; s.homeRot = rotY;
  Object.assign(s, { fixed: true, greetDay: 0 }, opts);
  nameTag(s, opts.tag || opts.name);
  scene.add(s); npcs.push(s); return s;
}
fixedNPC(18, 54, Math.PI, { shirt: 0x37474f, bottom: 0x263238, peci: 0x263238, tie: false }, { kind: 'satpam', name: 'Pak Satpam' });

// ---------- isi orang sesuai kelas yang dipilih (rombel sendiri) ----------
let welcomers = [], walkers = [], classmateNames = [];
const teacherInfo = (full) => TEACH[full] || { g: 'L', p: 'Ustadz' };
function classTeachers(cls) {
  const set = new Set(); DATA.sched[cls].forEach((d) => d.blocks.forEach((b) => (b.g || []).forEach((g) => set.add(g))));
  return [...set];
}
function populate() {
  [...welcomers, ...walkers].forEach((n) => { scene.remove(n); npcs.splice(npcs.indexOf(n), 1); });
  welcomers = []; walkers = [];
  const putri = isPutri(state.cls);
  const pool = (putri ? NAMES_PI : NAMES_PA).filter((n) => n.toLowerCase() !== (state.nama || '').toLowerCase());
  classmateNames = pool.slice();
  const ts = classTeachers(state.cls);
  const L = ts.filter((t) => teacherInfo(t).g === 'L'), Pp = ts.filter((t) => teacherInfo(t).g === 'P');
  const allL = Object.keys(TEACH).filter((t) => TEACH[t].g === 'L' && !L.includes(t)), allP = Object.keys(TEACH).filter((t) => TEACH[t].g === 'P' && !Pp.includes(t));
  const pickT = (arr, k) => arr.slice(0, k);
  // penyambut di gerbang: 2 Ustadz (kiri), 2 Ustadzah (kanan)
  const wl = pickT(allL.concat(L), 2), wp = pickT(allP.concat(Pp), 2);
  wl.forEach((t, i) => welcomers.push(fixedNPC(-3.3, 45 - i * 3.4, Math.PI / 2, teacherModel('L', i), { kind: 'guru', sapaan: 'Ustadz', name: teacherInfo(t).p, tag: teacherInfo(t).p, welcome: true })));
  wp.forEach((t, i) => welcomers.push(fixedNPC(3.3, 45 - i * 3.4, -Math.PI / 2, teacherModel('P', i), { kind: 'guru', putri: true, sapaan: 'Ustadzah', name: teacherInfo(t).p, tag: teacherInfo(t).p, welcome: true })));
  // guru-guru kelas ini yang sedang lewat
  const walkT = pickT(L, 2).concat(pickT(Pp, 2));
  walkT.forEach((t, i) => {
    const info = teacherInfo(t), p = info.g === 'P';
    walkers.push(addWalker({ kind: 'guru', putri: p, sapaan: p ? 'Ustadzah' : 'Ustadz', name: info.p, full: t, tag: info.p, speed: 2.4 }, teacherModel(info.g, i + 2), [2, 3, 4, 13][i % 4]));
  });
  // teman sekelas (satu rombel) berjalan di sayapnya & area tengah
  const home = putri ? [27, 28, 31, 6, 4, 36] : [19, 20, 23, 5, 3, 36];
  for (let i = 0; i < 6; i++) walkers.push(addWalker({ kind: 'siswa', putri, name: pool[i], tag: pool[i], speed: 3 }, studentModel(putri, i), home[i]));
  buildBallers(); buildSports();
}

// ---------- aturan berpapasan ----------
const isMale = (c) => (c === player ? !isPutri(state.cls) : !c.putri);
const isStudent = (c) => c === player || c.kind === 'siswa' || c.kind === 'bola';
const sameSex = (a, b) => isMale(a) === isMale(b);
const canTalk = (n) => !(isStudent(n) && !sameSex(n, player));

// ---------- sepak bola saat istirahat ----------
const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }));
ball.castShadow = true; ball.position.set(FIELD.cx, 0.32, FIELD.cz); ball.vel = new THREE.Vector3(); scene.add(ball);
let ballers = [], goals = [0, 0];
function buildBallers() {
  ballers.forEach((b) => scene.remove(b)); ballers = [];
  const putri = isPutri(state.cls);
  for (let i = 0; i < 6; i++) {
    const team = i % 2;
    const m = putri ? { putri: true, shirt: team ? 0xf57c00 : 0x1e88e5, bottom: 0x3a3a3a, hijab: 0xffffff, skin: SKINS[i % 4] } : { shirt: team ? 0xf57c00 : 0x1e88e5, bottom: 0x1a1a1a, tie: false, skin: SKINS[i % 4] };
    const g = makePerson(m);
    g.team = team; g.slot = Math.floor(i / 2); g.kind = 'bola'; g.putri = putri; g.name = classmateNames[6 + i] || 'Teman'; g.cool = 0;
    g.position.set(FIELD.cx + (team ? 4 : -4), 0, FIELD.cz - 5 + g.slot * 5);
    nameTag(g, g.name, 0.5);
    scene.add(g); ballers.push(g);
  }
}
function updateFootball(dt, active) {
  if (!active && playingBall) leaveBall();
  ball.visible = active; ballers.forEach((b) => (b.visible = active));
  if (!active) return;
  const B = ball.position;
  [0, 1].forEach((team) => {
    const mine = ballers.filter((b) => b.team === team);
    const chaser = mine.reduce((a, b) => (a.position.distanceTo(B) < b.position.distanceTo(B) ? a : b));
    const dir = team ? -1 : 1, goalX = team ? FIELD.ax : FIELD.bx;
    mine.forEach((b) => {
      b.cool -= dt;
      let tx, tz;
      if (b === chaser) { tx = B.x - dir * 0.5; tz = B.z; }
      else { tx = THREE.MathUtils.clamp(B.x - dir * (3 + b.slot * 2), FIELD.ax + 1, FIELD.bx - 1); tz = FIELD.cz - 7 + b.slot * 7; }
      const dx = tx - b.position.x, dz = tz - b.position.z, L = Math.hypot(dx, dz);
      if (L > 0.2) { const sp = Math.min(L, (b === chaser ? 5 : 3.5) * dt); b.position.x += dx / L * sp; b.position.z += dz / L * sp; b.rotation.y = Math.atan2(dx, dz); b.walkT += dt * 13; }
      const sw = L > 0.2 ? Math.sin(b.walkT) * 0.8 : 0;
      b.legL.rotation.x = sw; b.legR.rotation.x = -sw; b.armL.rotation.x = -sw; b.armR.rotation.x = sw;
      if (b === chaser && b.position.distanceTo(B) < 1.0 && b.cool <= 0) {
        const gx = goalX - B.x, gz = FIELD.cz + (Math.random() - 0.5) * 6 - B.z, gl = Math.hypot(gx, gz), pw = 8 + Math.random() * 6;
        ball.vel.set(gx / gl * pw, 0, gz / gl * pw); b.cool = 0.8; ball.last = b;
      }
    });
  });
  if (playingBall && zone === 'luar' && player.position.distanceTo(B) < 0.9 && !paused) { const a = player.rotation.y; ball.vel.set(Math.sin(a) * 11, 0, Math.cos(a) * 11); ball.last = player; }   // hanya menggiring bila ikut bertanding
  B.addScaledVector(ball.vel, dt); ball.vel.multiplyScalar(Math.pow(0.4, dt));
  ball.rotation.x += ball.vel.z * dt * 2; ball.rotation.z -= ball.vel.x * dt * 2;
  if (B.x < FIELD.ax || B.x > FIELD.bx) {
    if (Math.abs(B.z - FIELD.cz) < 2.4) {
      const team = B.x > FIELD.bx ? 0 : 1; goals[team]++;
      if (ball.last === player) { bubble(player, `GOOOL! ${goals[0]} – ${goals[1]}`, 2200); addPts(5); toast('⚽ Gol! +5 ⭐'); Audio.sfx('ok'); }
      else bubble(ballers.filter((b) => b.team === team)[Math.floor(Math.random() * 3)], `GOOOL! ${goals[0]} – ${goals[1]}`, 2200);
      B.set(FIELD.cx, 0.32, FIELD.cz); ball.vel.set(0, 0, 0);
    } else { ball.vel.x *= -0.7; B.x = THREE.MathUtils.clamp(B.x, FIELD.ax, FIELD.bx); }
  }
  if (B.z < FIELD.az || B.z > FIELD.bz) { ball.vel.z *= -0.7; B.z = THREE.MathUtils.clamp(B.z, FIELD.az, FIELD.bz); }
}

const bodies = () => npcs.filter((n) => n.visible).concat(ballers.filter((b) => b.visible));
let frameBodies = [];
function bodyBlocked(c, x, z) {
  const list = c === player ? bodies() : frameBodies;
  for (const o of list) {
    if (o === c) continue;
    const dn = Math.hypot(o.position.x - x, o.position.z - z), d0 = Math.hypot(o.position.x - c.position.x, o.position.z - c.position.z);
    if (dn < 0.85 && dn < d0) return true;
  }
  return false;
}

function updateNPCs(dt) {
  frameBodies = bodies(); frameBodies.push(player);
  welcomers.forEach((w) => (w.visible = phase === 'datang' && zone === 'luar'));
  for (const n of npcs) {
    if (!n.visible) continue;
    const busy = updateAnim(n, dt);
    if (n.passT > 0) n.passT -= dt;
    if (n.seated) continue;
    if (n.fixed || busy || n.talk > 0) { if (n.talk > 0) n.talk -= dt; n.legL.rotation.x = n.legR.rotation.x = 0; if (!busy) n.armL.rotation.x = n.armR.rotation.x = 0; continue; }
    if (n.wait > 0) { n.wait -= dt; n.legL.rotation.x = n.legR.rotation.x = n.armL.rotation.x = n.armR.rotation.x = 0; continue; }
    const [tx, tz] = NODES[n.target];
    const dx = tx - n.position.x, dz = tz - n.position.z, L = Math.hypot(dx, dz);
    if (n.goingIn && (!n.path || !n.path.length) && (n.target === 9 || n.target === 10) && L < 2.2) { n.visible = false; n.goingIn = false; continue; }
    if (L < 0.3) {
      const prev = n.node; n.node = n.target;
      if (n.path && n.path.length) { n.target = n.path.shift(); continue; }
      if (n.goingIn) { n.visible = false; n.goingIn = false; continue; }      // masuk ke masjid
      const opts = NB[n.node].filter((k) => k !== prev && allowedNode(n, k));
      const all = NB[n.node].filter((k) => allowedNode(n, k));
      n.target = (opts.length ? opts : all)[Math.floor(Math.random() * (opts.length || all.length))];
      if (Math.random() < 0.35) n.wait = 1 + Math.random() * 3;
      continue;
    }
    let vx = dx / L, vz = dz / L, meet = null;
    const others = frameBodies;
    for (const o of others) {
      if (o === n || o.kind === 'bola') continue;
      if (n.goingIn && o !== player) continue;            // rombongan ke masjid: saling memberi jalan, tidak bergerombol
      const ox = o.position.x - n.position.x, oz = o.position.z - n.position.z, d = Math.hypot(ox, oz);
      if (d < 0.001 || d > 2.6) continue;
      if (!sameSex(n, o)) { const k = ((2.6 - d) / 2.6) * 1.8; vx -= (ox / d) * k; vz -= (oz / d) * k; }      // lawan jenis: jaga jarak, terus lewat
      else if (d < 1.4 && ox * vx + oz * vz > 0 && !(n.passT > 0) && !n.goingIn) meet = o;                // sejenis: berhenti
      else if (d < 1.1) { vx -= (ox / d) * 0.9; vz -= (oz / d) * 0.9; }
    }
    if (meet) {
      n.wait = 1.4; n.passT = 3; faceTo(n, meet);
      if (meet !== player && isStudent(n) && isStudent(meet) && Math.random() < 0.6) { bubble(n, "Assalamu'alaikum!", 1500); setTimeout(() => bubble(meet, "Wa'alaikumussalam!", 1500), 700); }
      if (meet !== player && meet.kind === 'guru' && isStudent(n) && !meet.fixed) playAnim(n, 'salim', 1.3);
      continue;
    }
    const vl = Math.hypot(vx, vz) || 1; vx /= vl; vz /= vl;
    let nx = n.position.x + vx * n.speed * dt, nz = n.position.z + vz * n.speed * dt;
    if (blocked(nx, nz)) { nx = n.position.x + (dx / L) * n.speed * dt; nz = n.position.z + (dz / L) * n.speed * dt; vx = dx / L; vz = dz / L; }
    if (!n.goingIn && bodyBlocked(n, nx, nz)) { n.legL.rotation.x = n.legR.rotation.x = 0; n.stuck = (n.stuck || 0) + dt; if (n.stuck > 2) { n.passT = 2; n.stuck = 0; } continue; }
    n.stuck = 0;
    n.position.x = nx; n.position.z = nz;
    let d = Math.atan2(vx, vz) - n.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
    n.rotation.y += d * Math.min(1, dt * 8);
    n.walkT += dt * 9;
    const sw = Math.sin(n.walkT) * 0.5;
    n.legL.rotation.x = sw; n.legR.rotation.x = -sw; n.armL.rotation.x = -sw; n.armR.rotation.x = sw;
  }
}
// semua berbondong-bondong ke masjid saat azan
const crowd = [];
function crowdToMasjid() {
  const putri = isPutri(state.cls);
  for (const n of walkers) {
    n.visible = true; n.wait = Math.random() * 4; n.passT = 0;
    const goal = n.putri ? 10 : 9;
    n.goingIn = true; n.node = nearestNode(n.position.x, n.position.z); n.path = route(n.node, goal, n); n.target = n.path.shift() ?? goal;
  }
  // teman-teman sekelas keluar dari kelas bersama-sama
  const d = classDoors[state.cls];
  for (let i = 0; i < 8; i++) {
    const g = makePerson(studentModel(putri, i + 3));
    g.position.set(d.x + (i % 4 - 1.5) * 1.3, 0, d.z + 0.5 + Math.floor(i / 4) * 1.3);
    const start = nearestNode(g.position.x, g.position.z);
    Object.assign(g, { kind: 'siswa', putri, name: classmateNames[8 + (i % 10)] || 'Teman', speed: 2.8 + Math.random() * 0.8, node: start, wait: 0.4 + i * 0.9, greetDay: 0, walker: true, goingIn: true });
    g.path = route(start, putri ? 10 : 9, g); g.target = g.path.shift() ?? start;
    scene.add(g); npcs.push(g); crowd.push(g);
  }
}
function afterMasjid() {
  crowd.forEach((g) => { scene.remove(g); npcs.splice(npcs.indexOf(g), 1); }); crowd.length = 0;
  walkers.forEach((n, i) => { n.visible = true; n.goingIn = false; n.path = null; const k = n.putri ? 10 : 9; n.node = k; n.target = NB[k][0]; n.position.set(NODES[k][0] + (Math.random() - 0.5) * 7, 0, NODES[k][1] + 0.5 + Math.random() * 3); n.wait = 1 + i * 1.2 + Math.random() * 2; n.passT = 4; });
}

// ---------- menyapa ----------
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function greetOptions(n) {
  const sama = !!n.putri === isPutri(state.cls);
  if (n.kind === 'guru') {
    const o = [];
    if (sama) o.push([`🤝 Salim (cium tangan): "Assalamu'alaikum, ${n.name}"`, n.welcome ? 'salimPagi' : 'salim']);
    o.push([`✋ Salam, tangan di dada: "Assalamu'alaikum, ${n.name}"`, n.welcome ? 'dadaPagi' : 'dada']);
    if (!n.welcome) o.push([`🙂 "${n.sapaan}, tugas hari ini apa saja?"`, 'tanya']);
    return o;
  }
  if (n.kind === 'satpam') return [['👋 "Assalamu\'alaikum, Pak!"', 'salamPak'], ['🙂 "Selamat pagi, Pak Satpam!"', 'pagi']];
  if (n.kind === 'kantin') return [['👋 "Assalamu\'alaikum, Bu. Terima kasih makanannya!"', 'kantin']];
  return [['👋 "Assalamu\'alaikum!"', 'salamTeman'], ['🕌 "Nanti Zuhur bareng ke masjid, yuk!"', 'masjid'], ['📚 "Sudah kerjakan tugas belum?"', 'tugas']];
}
function doGreet(n, act) {
  closeModal();
  if (!sameSex(n, player)) {      // lawan jenis: cukup berdiri berjarak, tidak mendekat
    const dx = player.position.x - n.position.x, dz = player.position.z - n.position.z, d = Math.hypot(dx, dz) || 1;
    if (d < 2.4) { const nx = n.position.x + dx / d * 2.4, nz = n.position.z + dz / d * 2.4; if (!blocked(nx, nz)) player.position.set(nx, player.position.y, nz); }
  }
  faceTo(player, n); faceTo(n, player); n.talk = 3.5;
  if (n.fixed && n.homeRot !== undefined) setTimeout(() => { n.rotation.y = n.homeRot; }, 3600);
  player.busy = 3.2;
  const nm = state.nama, fi = isPutri(state.cls) ? 'fiiki' : 'fiik';
  const reply = {
    salim: [`Wa'alaikumussalam warahmatullah. Barakallahu ${fi}, ${nm}.`],
    salimPagi: [`Wa'alaikumussalam, selamat datang ${nm}! Semangat belajar hari ini.`],
    dadaPagi: [`Wa'alaikumussalam, selamat pagi ${nm}. Semangat, ya!`],
    dada: [`Wa'alaikumussalam warahmatullah, ${nm}.`, 'Wa\'alaikumussalam. Semangat belajarnya, ya!'],
    tanya: ['Cek di kelas, tugasnya sudah saya siapkan.', 'Jangan lupa murajaah hafalan juga!'],
    salamPak: [`Wa'alaikumussalam! Hati-hati di jalan, ${nm}.`],
    pagi: ['Pagi! Jangan lupa senyum hari ini!', 'Pagi! Sudah sarapan belum?'],
    kantin: [`Wa'alaikumussalam. Sama-sama, ${nm}. Dihabiskan, ya!`],
    salamTeman: ['Wa\'alaikumussalam! Semangat ya hari ini!', 'Wa\'alaikumussalam! Duduk dekat aku nanti!'],
    masjid: ['Ayo! Nanti kita ketemu di masjid.', 'Siap! Aku tunggu di tempat wudhu.'],
    tugas: ['Sudah dong, tadi malam!', 'Belum… nanti bantu aku, ya!', 'Hampir selesai, tinggal satu soal.'],
  }[act];
  const mine = { salimPagi: `Assalamu'alaikum, ${n.name}. Selamat pagi.`, dadaPagi: `Assalamu'alaikum, ${n.name}.`, salim: `Assalamu'alaikum, ${n.name}.`, dada: `Assalamu'alaikum, ${n.name}.`,
    tanya: `${n.sapaan}, tugas hari ini apa saja?`, salamPak: "Assalamu'alaikum, Pak!", pagi: 'Selamat pagi, Pak Satpam!', kantin: "Assalamu'alaikum, Bu. Terima kasih!",
    salamTeman: "Assalamu'alaikum!", masjid: 'Nanti Zuhur bareng, yuk!', tugas: 'Sudah kerjakan tugas?' }[act];
  if (act.startsWith('salim')) { playAnim(player, 'salim', 1.5); playAnim(n, 'beritangan', 1.5); }
  else if (act.startsWith('dada')) { playAnim(player, 'dada', 1.4); setTimeout(() => playAnim(n, 'dada', 1.4), 400); }
  else { playAnim(player, 'lambai', 1.2); setTimeout(() => playAnim(n, 'lambai', 1.2), 500); }
  Audio.sfx('greet');
  const ex = { salim: 'senang', salimPagi: 'senang', tugas: pick(['senang', 'sedih', '']), masjid: 'senang', salamTeman: 'senang', pagi: 'senang' }[act] || '';
  say([{ p: player, t: mine, e: act.startsWith('salim') || act.startsWith('dada') ? '' : 'senang' }, { p: n, t: pick(reply), e: ex }],
    () => { if (n.fixed && n.homeRot !== undefined) n.rotation.y = n.homeRot; });
  if (n.greetDay !== state.day && act !== 'tanya' && act !== 'tugas') {
    n.greetDay = state.day; addPts(2);
    setTimeout(() => toast(n.kind === 'guru' ? '+2 ⭐ Adab menyapa guru' : '+2 ⭐ Adab menyapa'), 900);
  }
}
let nearNPC = null;
// sapaan pembuka (baku) dari NPC saat didekati
function greetOpen(n) {
  const nm = state.nama;
  if (n.kind === 'guru') return n.welcome ? pick([`Selamat pagi, ${nm}! Ayo masuk, sebentar lagi bel.`, `Pagi, ${nm}. Sudah sarapan?`]) : pick([`Eh, ${nm}. Ada yang bisa dibantu?`, `${nm}, sudah siap belajar hari ini?`, `Hm? Ada apa, ${nm}?`]);
  if (n.kind === 'satpam') return pick([`Pagi, Dik ${nm}! Rapi sekali hari ini.`, 'Hati-hati, jangan lari-lari di dekat gerbang, ya.']);
  if (n.kind === 'kantin') return `Mau ambil makan, ${nm}?`;
  return pick([`Hai, ${nm}!`, `${nm}! Dari mana saja?`, `Eh, ${nm}. Sudah dengar tugas hari ini?`]);
}
function openGreet() {
  const n = nearNPC; if (!n || paused) return;
  faceTo(n, player); faceTo(player, n); n.talk = 4;
  say([{ p: n, t: greetOpen(n), e: n.kind === 'guru' ? '' : 'senang',
    ch: greetOptions(n).map(([t, act]) => [t, () => doGreet(n, act)]).concat([['Tidak jadi', () => { if (n.fixed && n.homeRot !== undefined) n.rotation.y = n.homeRot; }]]) }]);
}

// ---------- ikut main bola ----------
let playingBall = false;
function joinBall() {
  if (riding) return toast('🏍️ Parkir motor dulu');
  modal(`<div class="tag">⚽ Lapangan</div><div class="big">Ikut bertanding?</div><p>Kamu masuk tim <b>biru</b>, menyerang ke gawang kanan (timur).</p><p class="muted">Pertandingan 3 menit. Lari menyentuh bola untuk menggiring. <b>⚽ Tendang</b> = tendang ke arah hadapmu, <b>🔁 Oper</b> = ke teman terdekat.</p>`,
    [['Ayo main!', () => {
      closeModal(); if (playingSport) leaveSport(); playingBall = true;
      startMatch('bola', () => { player.position.set(FIELD.cx - 6, 0, FIELD.cz + 3); player.rotation.y = Math.PI / 2; ball.position.set(FIELD.cx, 0.32, FIELD.cz); ball.vel.set(0, 0, 0); },
        [['⚽ Tendang', kickBall], ['🔁 Oper', passBall], ['🚪 Selesai', () => { stopMatchQuiet(); leaveBall(); }]],
        'Giring bola ke gawang kanan, arahkan badan lalu ⚽ Tendang!');
      bubble(player, 'Aku ikut, ya!', 1500);
    }, 'main'], ['Nanti saja', closeModal, 'small']]);
}
function kickBall() {
  const B = ball.position; if (player.position.distanceTo(B) > 2.4) { toast('Dekati bola dulu'); return; }
  let a = player.rotation.y;
  const ga = Math.atan2(FIELD.bx + 1 - B.x, FIELD.cz - B.z);                    // bantuan bidik kecil ke arah gawang
  let d = Math.atan2(Math.sin(ga - a), Math.cos(ga - a)); if (Math.abs(d) < 0.45) a += d * 0.6;
  const pw = player.position.y > 0.2 ? 22 : 19;                                   // tendangan sambil melompat lebih keras
  ball.vel.set(Math.sin(a) * pw, 0, Math.cos(a) * pw); ball.last = player; playAnim(player, 'lambai', 0.4); Audio.sfx('knock');
}
function passBall() {
  const B = ball.position; if (player.position.distanceTo(B) > 2.4) { toast('Dekati bola dulu'); return; }
  const mates = ballers.filter((b) => b.team === 0);
  const m = mates.reduce((x, y) => (x.position.distanceTo(B) + (x.position.x < B.x ? 6 : 0) < y.position.distanceTo(B) + (y.position.x < B.x ? 6 : 0) ? x : y));
  const dx = m.position.x - B.x, dz = m.position.z - B.z, L = Math.hypot(dx, dz) || 1, pw = Math.min(16, 6 + L * 0.9);
  ball.vel.set(dx / L * pw, 0, dz / L * pw); ball.last = player; m.cool = 0.6; bubble(m, 'Oke!', 700); playAnim(player, 'lambai', 0.35);
}
function leaveBall() {
  if (!playingBall) return;
  match = null;
  playingBall = false; ctl([]);
  if (zone === 'luar') { player.position.set(0, 0, -32.5); player.rotation.y = 0; }
}
