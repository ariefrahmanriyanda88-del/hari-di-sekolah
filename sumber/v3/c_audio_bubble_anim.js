// ---------- musik latar & efek suara (dibuat oleh kode: karya asli, bebas hak cipta) ----------
const Audio = (() => {
  let ac = null, master = null, music = null, on = true, timer = null, nextT = 0, step16 = 0;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function tone(freq, t, dur, type, vol, dest, attack = 0.01) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  // progresi akor ceria: C – G – Am – F – C – Em – F – G
  const CH = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60], [60, 64, 67], [52, 55, 59], [53, 57, 60], [55, 59, 62]];
  const MEL = [76, -1, 74, 72, 74, -1, 67, -1, 74, -1, 72, 71, 72, -1, -1, -1, 72, -1, 69, 72, 76, -1, 74, -1, 72, -1, 69, -1, 67, -1, -1, -1];
  const BEAT = 60 / 96;
  // ---- lagu kedua & ketiga (dunia game): lebih cepat & menantang ----
  let track = 'sekolah', noiseBuf = null;
  const ARENA = { bpm: 128, ch: [[62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62]], mel: [74, -1, 76, 78, -1, 76, 74, -1, 73, -1, 74, 76, -1, -1, 69, -1, 71, -1, 73, 74, -1, 73, 71, -1, 69, -1, 66, 69, -1, -1, -1, -1] };
  const AKSI = { bpm: 150, ch: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], mel: [69, -1, 72, -1, 76, 74, 72, -1, 71, -1, 72, 74, -1, 72, 71, 67, 69, -1, 72, -1, 77, 76, 74, -1, 76, -1, 74, 72, 71, -1, 69, -1] };
  function noise(t, dur, vol, hp) {
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(music); s.start(t); s.stop(t + dur + 0.02);
  }
  function kick(t, vol) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g); g.connect(music); o.start(t); o.stop(t + 0.25);
  }
  function schedule() {
    while (nextT < ac.currentTime + 0.25) {
      const t = nextT;
      if (track === 'sekolah') {
        const st = styleNow();
        if (st === 'diam') { nextT += 0.5; continue; }
        nextT += STYLE_FN[st](t); step16++;
      } else {
        const T = track === 'aksi' ? AKSI : ARENA, b16 = 60 / T.bpm / 4;
        const bar = Math.floor(step16 / 16) % 4, s = step16 % 16, ch = T.ch[bar];
        if (s % 4 === 0) kick(t, 0.5);
        if (s % 8 === 4) noise(t, 0.14, 0.22, 1200);                       // snare
        if (s % 2 === 1 || track === 'aksi') noise(t, 0.04, track === 'aksi' ? 0.07 : 0.09, 7000);   // hi-hat
        const bassN = track === 'aksi' ? (s % 2 ? ch[0] - 12 : ch[0] - 24) : (s % 4 === 2 ? ch[0] - 12 : ch[0] - 24);
        if (track === 'aksi' || s % 2 === 0) tone(mtof(bassN), t, b16 * 1.6, 'square', 0.07, music);
        tone(mtof(ch[s % 3] + 12 + (s >= 8 && track === 'aksi' ? 12 : 0)), t, b16 * 0.9, track === 'aksi' ? 'square' : 'triangle', 0.035, music);
        const mn = T.mel[(Math.floor(step16 / 2) + bar * 8) % 32];
        if (s % 2 === 0 && mn > 0 && Math.floor(step16 / 64) % 2 === 1) tone(mtof(mn), t, b16 * 1.8, 'sawtooth', 0.035, music);
        if (s % 2 === 0 && mn > 0 && Math.floor(step16 / 64) % 2 === 0 && track === 'aksi') tone(mtof(mn - 12), t, b16 * 1.8, 'square', 0.03, music);
        nextT += b16; step16++;
      }
    }
  }
  // ---------- pilihan gaya musik latar sekolah (semua dibuat oleh kode) ----------
  const STYLES = [['ceria', '☀️ Ceria pagi'], ['akustik', '🎸 Santai akustik'], ['rebana', '🥁 Nasyid rebana'], ['lofi', '🎧 Lo-fi belajar'], ['auto', '🔀 Berganti tiap hari'], ['diam', '🔇 Tanpa musik (efek saja)']];
  let styleI = 0; try { styleI = Math.max(0, STYLES.findIndex((x) => x[0] === localStorage.getItem('hds-musik'))); } catch (e) { /* abaikan */ }
  const styleNow = () => { const s = STYLES[styleI][0]; if (s !== 'auto') return s; let d = 1; try { d = state.day || 1; } catch (e) { /* abaikan */ } return ['ceria', 'akustik', 'rebana', 'lofi'][(d - 1) % 4]; };
  const STYLE_FN = {
    ceria(t) {
      const bar = Math.floor(step16 / 8) % 8, s = step16 % 8, ch = CH[bar];
      if (s === 0) { ch.forEach((n) => tone(mtof(n), t, BEAT * 4, 'triangle', 0.045, music, 0.4)); tone(mtof(ch[0] - 24), t, BEAT * 1.8, 'sine', 0.22, music); }
      if (s === 4) tone(mtof(ch[0] - 24 + 7), t, BEAT * 1.5, 'sine', 0.16, music);
      tone(mtof(ch[s % 3] + 12), t, BEAT * 0.45, 'triangle', 0.05, music);
      const mi = (step16 % 64) >> 1;
      if (step16 % 2 === 0 && Math.floor(step16 / 64) % 2 === 1 && MEL[mi % 32] > 0) tone(mtof(MEL[mi % 32]), t, BEAT * 0.9, 'sine', 0.09, music);
      if (Math.random() < 0.012) bird(t);
      return BEAT / 2;
    },
    akustik(t) {   // petikan gitar lembut, G – D – Em – C
      const B = 60 / 84, ch = [[55, 59, 62], [50, 54, 57], [52, 55, 59], [48, 52, 55]][Math.floor(step16 / 8) % 4], s = step16 % 8;
      const pat = [0, 1, 2, 1, 2, 1, 2, 1], up = s === 4 ? 12 : 0;
      tone(mtof(ch[pat[s]] + 12 + up), t, B * 1.1, 'triangle', 0.07, music, 0.004);
      if (s === 0 || s === 4) tone(mtof(ch[0] - 12 + (s === 4 ? 7 : 0)), t, B * 1.6, 'sine', 0.2, music, 0.01);
      const M = [71, -1, 74, -1, 76, 74, 71, -1, 69, -1, 71, -1, 67, -1, -1, -1, 64, -1, 67, 69, 71, -1, 69, 67, 64, -1, 62, -1, 67, -1, -1, -1];
      const mn = M[step16 % 32]; if (Math.floor(step16 / 32) % 2 === 1 && mn > 0) tone(mtof(mn), t, B * 0.9, 'sine', 0.07, music, 0.02);
      if (Math.random() < 0.008) bird(t);
      return B / 2;
    },
    rebana(t) {    // irama rebana (dum–tak) dengan nada maqam hijaz
      const B = 60 / 100, s = step16 % 8;
      if (s === 0 || s === 3) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.15); g.gain.setValueAtTime(0.42, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); o.connect(g); g.connect(music); o.start(t); o.stop(t + 0.3); }
      if (s === 2 || s === 5 || s === 6) noise(t, 0.07, 0.16, 2200);
      if (s % 2 === 1) noise(t, 0.05, 0.05, 8000);
      if (step16 % 32 === 0) [50, 57].forEach((n) => tone(mtof(n), t, B * 16, 'sine', 0.05, music, 1.2));   // dengung D
      const H = [74, -1, 75, 74, 78, -1, 79, -1, 81, -1, 79, 78, 75, -1, 74, -1, 72, -1, 70, -1, 69, -1, 70, 72, 74, -1, -1, -1, 74, -1, -1, -1];
      const mn = H[step16 % 32]; if (Math.floor(step16 / 32) % 2 === 1 && mn > 0) tone(mtof(mn - 12), t, B * 0.6, 'triangle', 0.08, music, 0.01);
      return B / 2;
    },
    lofi(t) {      // akor lembut & ketukan pelan untuk belajar
      const B = 60 / 72, s = step16 % 8, ch = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]][Math.floor(step16 / 8) % 4];
      if (s === 0) { ch.forEach((n) => tone(mtof(n), t, B * 4.2, 'sine', 0.035, music, 0.25)); tone(mtof(ch[0] - 24), t, B * 2, 'sine', 0.2, music, 0.02); }
      if (s === 0 || s === 5) kick(t, 0.3);
      if (s === 4) noise(t, 0.12, 0.07, 1500);
      if (s % 2 === 1) noise(t, 0.03, 0.03, 9000);
      const L = [72, -1, -1, 74, -1, 76, -1, -1, 74, -1, 72, -1, -1, -1, 69, -1];
      const mn = L[step16 % 16]; if (Math.floor(step16 / 16) % 2 === 1 && mn > 0) tone(mtof(mn), t, B * 0.8, 'triangle', 0.04, music, 0.03);
      return B / 2;
    },
  };
  function bird(t) {
    for (let k = 0; k < 3; k++) {
      const o = ac.createOscillator(), g = ac.createGain(), s = t + k * 0.13;
      o.type = 'sine'; o.frequency.setValueAtTime(2600, s); o.frequency.exponentialRampToValueAtTime(4200, s + 0.08);
      g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.03, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.1);
      o.connect(g); g.connect(master); o.start(s); o.stop(s + 0.15);
    }
  }
  return {
    start() {
      try {
        if (!ac) {
          ac = new (window.AudioContext || window.webkitAudioContext)();
          const comp = ac.createDynamicsCompressor(); comp.connect(ac.destination);
          master = ac.createGain(); master.gain.value = on ? 1.0 : 0; master.connect(comp);
          music = ac.createGain(); music.gain.value = 1.6; music.connect(master);
          nextT = ac.currentTime + 0.1; timer = setInterval(schedule, 60);
        }
        ac.resume();
      } catch (e) {}
    },
    styleName() { return STYLES[styleI][1]; },
    nextStyle() { styleI = (styleI + 1) % STYLES.length; try { localStorage.setItem('hds-musik', STYLES[styleI][0]); } catch (e) { /* abaikan */ } step16 = 0; return STYLES[styleI][1]; },
    setTrack(name) { if (track === name) return; track = name; step16 = 0; if (ac) nextT = Math.max(nextT, ac.currentTime + 0.05); },
    duck(on) { if (music) music.gain.setTargetAtTime(on ? 0.04 : 1.6, ac.currentTime, 0.4); },
    loadUrl(url) {
      if (this._azan || !ac) return;
      try { fetch(url).then((r) => r.arrayBuffer()).then((b) => ac.decodeAudioData(b, (ab) => { this._azan = ab; })).catch(() => {}); } catch (e) {}
    },
    playBuffer() {
      if (!ac || !this._azan || !on) return false;
      const s = ac.createBufferSource(); s.buffer = this._azan; const g = ac.createGain(); g.gain.value = 1.3; s.connect(g); g.connect(master); s.start(); return true;
    },
    playB64(b64) {
      if (!ac) return;
      try {
        const bin = atob(b64.split(',').pop()), buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        ac.decodeAudioData(buf.buffer, (ab) => { const s = ac.createBufferSource(); s.buffer = ab; s.connect(master); s.start(); });
      } catch (e) {}
    },
    toggle() { on = !on; if (master) master.gain.setTargetAtTime(on ? 1.0 : 0, ac.currentTime, 0.05); return on; },
    sfx(kind) {
      if (!ac || !on) return;
      const t = ac.currentTime;
      if (kind === 'ok') { tone(mtof(79), t, 0.25, 'triangle', 0.2, master); tone(mtof(84), t + 0.1, 0.35, 'triangle', 0.2, master); }
      if (kind === 'no') { tone(mtof(57), t, 0.3, 'square', 0.06, master); tone(mtof(53), t + 0.12, 0.35, 'square', 0.06, master); }
      if (kind === 'greet') { tone(mtof(72), t, 0.3, 'sine', 0.18, master); tone(mtof(79), t + 0.12, 0.45, 'sine', 0.18, master); }
      if (kind === 'bell') [0, 0.35, 0.7].forEach((d, i) => tone(mtof([84, 79, 84][i]), t + d, 0.9, 'sine', 0.16, master));
      if (kind === 'tick') tone(mtof(88 + Math.floor(Math.random() * 3)), t, 0.04, 'square', 0.035, master);
      if (kind === 'knock') [0, 0.16].forEach((d) => tone(180, t + d, 0.08, 'square', 0.12, master));
    },
  };
})();

// ---------- balon percakapan (HTML di atas layar: selalu tajam & terbaca) ----------
const bubLayer = document.createElement('div'); bubLayer.id = 'bubbles';
document.getElementById('app').after(bubLayer);
const activeBubs = new Set();
function dropBubble(el) { el.remove(); activeBubs.delete(el); if (el.person.bubEl === el) { el.person.bubEl = null; el.person.bub = null; } }
function bubble(person, text, ms = 2800) {
  if (person.bubEl) dropBubble(person.bubEl);
  const el = document.createElement('div'); el.className = 'bub'; el.textContent = text; el.person = person;
  bubLayer.appendChild(el); activeBubs.add(el); person.bubEl = el; person.bub = el;
  clearTimeout(person.bubT); person.bubT = setTimeout(() => { if (person.bubEl === el) dropBubble(el); }, ms);
}
const _bv = new THREE.Vector3();
function updateBubbles() {
  for (const el of activeBubs) {
    const p = el.person; let vis = true, o = p;
    while (o) { if (!o.visible) { vis = false; break; } if (!o.parent) { vis = o === scene; break; } o = o.parent; }
    if (vis) { p.getWorldPosition(_bv); _bv.y += p.sitting ? 2.6 : 2.95; _bv.project(camera); vis = _bv.z < 1 && Math.abs(_bv.x) < 1.1 && Math.abs(_bv.y) < 1.1; }
    if (!vis) { el.style.display = 'none'; continue; }
    el.style.display = '';
    const hw = (el.offsetWidth || 120) / 2 + 4, px = Math.min(innerWidth - hw, Math.max(hw, (_bv.x * 0.5 + 0.5) * innerWidth));
    el.style.transform = `translate(${px.toFixed(1)}px,${Math.max(el.offsetHeight + 8, (-_bv.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px) translate(-50%,-100%)`;
  }
}

// ---------- percakapan ala Harvest Moon: potret berekspresi + teks mengetik + pilihan ----------
const POR = { cache: new Map() };
function portrait(person, expr = '') {
  const model = person.model || {}, key = JSON.stringify(model) + '|' + expr;
  if (POR.cache.has(key)) return POR.cache.get(key);
  if (!POR.r) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    POR.r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); POR.r.setSize(256, 256, false);
    POR.s = new THREE.Scene(); POR.s.add(new THREE.HemisphereLight(0xffffff, 0x9aa89a, 2.4)); const d = new THREE.DirectionalLight(0xffffff, 1.5); d.position.set(1.5, 3, 4); POR.s.add(d);
    POR.c = new THREE.PerspectiveCamera(24, 1, 0.1, 20);
  }
  const face = { ...(model.face || {}), expr };
  const m = makePerson({ ...model, face, bag: null }); POR.s.add(m);
  POR.c.position.set(0, 1.95, model.putri ? 3.0 : 2.85); POR.c.lookAt(0, 1.78, 0);
  POR.r.render(POR.s, POR.c); POR.s.remove(m);
  const url = POR.r.domElement.toDataURL(); POR.cache.set(key, url); return url;
}
const DLG = { el: null, q: [], typing: false, full: '', i: 0, timer: 0, done: null, speed: 1 };
try { DLG.speed = +(localStorage.getItem('hds-dlg-speed') || 1); } catch (e) { /* abaikan */ }
const DLG_SPEEDS = [[1, '▶'], [2, '⏩'], [3, '⏭']];
function dlgEl() {
  if (DLG.el) return DLG.el;
  const el = document.createElement('div'); el.id = 'dlg';
  el.innerHTML = '<div class="dpor"><img alt=""></div><div class="dbox"><div class="dname"></div><div class="dtext"></div><div class="dch"></div><span class="dnext">▼</span><button type="button" class="dspd" aria-label="Kecepatan teks"></button></div>';
  document.getElementById('app').after(el);
  el.querySelector('.dbox').addEventListener('pointerdown', (e) => { if (e.target.closest('.dch button') || e.target.closest('.dspd')) return; e.preventDefault(); dlgTap(); });
  el.querySelector('.dspd').onclick = (e) => { e.stopPropagation(); DLG.speed = DLG.speed % 3 + 1; try { localStorage.setItem('hds-dlg-speed', DLG.speed); } catch (er) { /* abaikan */ } dlgSpd(); };
  addEventListener('keydown', (e) => { if (DLG.el && DLG.el.classList.contains('show') && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); dlgTap(); } });
  DLG.el = el; dlgSpd(); return el;
}
function dlgSpd() { const sp = DLG_SPEEDS.find((x) => x[0] === DLG.speed) || DLG_SPEEDS[0]; DLG.el.querySelector('.dspd').textContent = sp[1] + ' ' + ['Normal', 'Cepat', 'Langsung'][sp[0] - 1]; }
// say([{ p: orang, t: 'teks', e: 'senang'|'kaget'|'sedih'|'marah', name, ch: [['pilihan', fn], ...] }], selesai)
function say(lines, done) {
  const el = dlgEl(); DLG.q = lines.slice(); DLG.done = done || null;
  DLG.wasPaused = DLG.wasPaused ?? paused; paused = true;
  el.classList.add('show'); dlgNext();
}
function dlgNext() {
  const el = DLG.el, L = DLG.q.shift();
  if (!L) { el.classList.remove('show'); const d = DLG.done; DLG.done = null; paused = !!DLG.wasPaused; DLG.wasPaused = undefined; if (d) d(); return; }
  DLG.cur = L;
  const p = L.p || player;
  el.querySelector('.dname').textContent = L.name || (p === player ? state.nama : p.name || '');
  el.classList.toggle('me', p === player);
  el.querySelector('.dpor img').src = portrait(p, L.e || '');
  el.querySelector('.dch').innerHTML = ''; el.querySelector('.dnext').style.visibility = 'hidden';
  DLG.full = L.t; DLG.i = 0; DLG.typing = true; clearInterval(DLG.timer);
  const tx = el.querySelector('.dtext'); tx.textContent = '';
  if (DLG.speed === 3) return dlgFinish();
  DLG.timer = setInterval(() => {
    DLG.i += DLG.speed === 2 ? 3 : 1; tx.textContent = DLG.full.slice(0, DLG.i);
    if (DLG.i % 3 === 0) Audio.sfx('tick');
    if (DLG.i >= DLG.full.length) dlgFinish();
  }, 32);
}
function dlgFinish() {
  clearInterval(DLG.timer); DLG.typing = false;
  const el = DLG.el; el.querySelector('.dtext').textContent = DLG.full;
  const ch = DLG.cur.ch;
  if (ch && ch.length) {
    el.querySelector('.dch').innerHTML = ch.map(([t], i) => `<button type="button" data-i="${i}">${t}</button>`).join('');
    el.querySelectorAll('.dch button').forEach((b) => (b.onclick = () => { const f = ch[+b.dataset.i][1]; DLG.q = []; DLG.cur.ch = null; dlgClose(); if (f) f(); }));
  } else el.querySelector('.dnext').style.visibility = 'visible';
}
function dlgTap() { if (DLG.typing) return dlgFinish(); if (DLG.cur && DLG.cur.ch && DLG.cur.ch.length) return; dlgNext(); }
function dlgClose() { clearInterval(DLG.timer); DLG.el.classList.remove('show'); paused = !!DLG.wasPaused; DLG.wasPaused = undefined; DLG.done = null; }
const dlgOpen = () => DLG.el && DLG.el.classList.contains('show');

// ---------- gerakan: salim, salam di dada, melambai ----------
function playAnim(p, type, dur) { p.anim = { type, t: 0, dur }; }
function updateAnim(p, dt) {
  const a = p.anim; if (!a) return false;
  a.t += dt;
  const k = Math.sin(Math.min(1, a.t / a.dur) * Math.PI); // 0 → 1 → 0
  if (a.type === 'salim') { p.rotation.x = 0.45 * k; p.armR.rotation.x = -1.35 * k; }
  if (a.type === 'beritangan') { p.armR.rotation.x = -1.1 * k; p.rotation.x = 0.08 * k; }
  if (a.type === 'dada') { p.armR.rotation.x = -1.0 * k; p.armR.rotation.z = 0.9 * k; }   // tangan kanan di dada
  if (a.type === 'lambai') { p.armR.rotation.z = -(2.6 * k + Math.sin(a.t * 14) * 0.3 * k); }
  if (a.type === 'suap') { const c2 = Math.max(0, Math.sin(a.t / a.dur * Math.PI * 4 - Math.PI / 2) * 0.5 + 0.5); p.armR.rotation.x = -0.8 - 1.5 * c2; p.armR.rotation.z = 0.35 * c2; p.rotation.x = 0.1 * c2; }
  if (a.t >= a.dur) { p.anim = null; p.rotation.x = 0; p.armR.rotation.set(p.sitting ? -0.8 : 0, 0, 0); }
  return true;
}
function faceTo(a, b) { a.rotation.y = Math.atan2(b.position.x - a.position.x, b.position.z - a.position.z); }

