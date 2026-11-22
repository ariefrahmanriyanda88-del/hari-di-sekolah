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
        const bar = Math.floor(step16 / 8) % 8, s = step16 % 8, ch = CH[bar];
        if (s === 0) { ch.forEach((n) => tone(mtof(n), t, BEAT * 4, 'triangle', 0.045, music, 0.4)); tone(mtof(ch[0] - 24), t, BEAT * 1.8, 'sine', 0.22, music); }
        if (s === 4) tone(mtof(ch[0] - 24 + 7), t, BEAT * 1.5, 'sine', 0.16, music);
        tone(mtof(ch[s % 3] + 12), t, BEAT * 0.45, 'triangle', 0.05, music);
        const mi = (step16 % 64) >> 1;
        if (step16 % 2 === 0 && Math.floor(step16 / 64) % 2 === 1 && MEL[mi % 32] > 0) tone(mtof(MEL[mi % 32]), t, BEAT * 0.9, 'sine', 0.09, music);
        if (Math.random() < 0.012) bird(t);
        nextT += BEAT / 2; step16++;
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
    el.style.transform = `translate(${((_bv.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px,${((-_bv.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px) translate(-50%,-100%)`;
  }
}

// ---------- gerakan: salim, salam di dada, melambai ----------
function playAnim(p, type, dur) { p.anim = { type, t: 0, dur }; }
function updateAnim(p, dt) {
  const a = p.anim; if (!a) return false;
  a.t += dt;
  const k = Math.sin(Math.min(1, a.t / a.dur) * Math.PI); // 0 → 1 → 0
  if (a.type === 'salim') { p.rotation.x = 0.45 * k; p.armR.rotation.x = -1.35 * k; }
  if (a.type === 'beritangan') { p.armR.rotation.x = -1.1 * k; p.rotation.x = 0.08 * k; }
  if (a.type === 'dada') { p.armR.rotation.x = -1.0 * k; p.armR.rotation.z = 0.9 * k; }
  if (a.type === 'lambai') { p.armR.rotation.z = 2.6 * k + Math.sin(a.t * 14) * 0.3 * k; }
  if (a.type === 'suap') { const c2 = Math.max(0, Math.sin(a.t / a.dur * Math.PI * 4 - Math.PI / 2) * 0.5 + 0.5); p.armR.rotation.x = -0.8 - 1.5 * c2; p.armR.rotation.z = 0.35 * c2; p.rotation.x = 0.1 * c2; }
  if (a.t >= a.dur) { p.anim = null; p.rotation.x = 0; p.armR.rotation.set(p.sitting ? -0.8 : 0, 0, 0); }
  return true;
}
function faceTo(a, b) { a.rotation.y = Math.atan2(b.position.x - a.position.x, b.position.z - a.position.z); }

