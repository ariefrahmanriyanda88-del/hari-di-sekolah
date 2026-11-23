// =====================================================================
//  KOPERASI SEKOLAH: rak makanan, rak minuman, kulkas, kasir. Murid & guru bisa berbelanja.
// =====================================================================
const KOP = new THREE.Vector3(1020, 0, 120);
const kop = makeHall(KOP, 22, 16, 0xf6ead6, '#f1e6d2', '#e4d6bd');
const KOP_SPOT = {};
// [nama, harga, sehat(1)/kurang sehat(0), warna]
const KOP_ITEMS = {
  makan: { t: '🍞 Rak Makanan', it: [['🍞 Roti isi', 4000, 1, 0xe8c27a], ['🍙 Lemper', 3000, 1, 0xf3efe2], ['🥟 Risoles', 2500, 1, 0xd9a25b], ['🍪 Biskuit gandum', 3000, 1, 0xc98a5a], ['🥜 Kacang rebus', 3000, 1, 0xb08a5a], ['🍱 Nasi kotak', 10000, 1, 0xffffff], ['🍟 Keripik pedas', 3000, 0, 0xe0623e], ['🍫 Cokelat', 5000, 0, 0x5a3a2a]] },
  minum: { t: '🥤 Rak Minuman', it: [['💧 Air mineral', 3000, 1, 0x7fc4ea], ['🍵 Teh kotak', 4000, 1, 0x9a6b3a], ['🧃 Jus buah', 6000, 1, 0xf2a33a], ['🥤 Minuman soda', 6000, 0, 0xd33]] },
  kulkas: { t: '🧊 Kulkas', it: [['🥛 Susu dingin', 5000, 1, 0xffffff], ['🍶 Yogurt', 7000, 1, 0xf6dde4], ['🍮 Puding', 4000, 1, 0xf5c542], ['🍦 Es krim', 5000, 0, 0xd9577a]] },
};
{
  const { add } = kop, g = kop.g, tag = (t, x, y, z, sz = 0.42) => { const l = label(t, 0, 0, 0, sz); scene.remove(l); l.position.set(x, y, z); g.add(l); };
  const goods = (x0, y, z, n, cols, dx = 0.42, d = 0.3) => { for (let i = 0; i < n; i++) add(x0 + i * dx, y, z, 0.32, 0.36, d, cols[i % cols.length]); };
  const cols = (k) => KOP_ITEMS[k].it.map((x) => x[3]);
  // rak makanan di dinding belakang (3 susun)
  add(-3.5, 1.1, -7.3, 11, 2.2, 0.8, 0x8a5a2b, true);
  [0.45, 1.05, 1.65].forEach((y, r) => { add(-3.5, y - 0.2, -6.95, 10.8, 0.05, 0.6, 0x6b4a2b); goods(-8.6, y, -6.95, 24, cols('makan').slice(r * 2).concat(cols('makan'))); });
  tag('🍞 Makanan', -3.5, 2.9, -7.0);
  // rak tengah dua sisi (makanan ringan)
  add(-3.5, 0.75, -2.2, 6, 1.5, 1.0, 0x8a5a2b, true);
  [0.55, 1.15].forEach((y) => { goods(-6.2, y, -2.75, 13, cols('makan')); goods(-6.2, y, -1.65, 13, cols('makan').reverse()); });
  // rak minuman di dinding kiri: botol-botol
  add(-10.4, 1.1, -0.5, 0.8, 2.2, 6, 0x8a5a2b, true);
  [0.45, 1.05, 1.65].forEach((y) => { for (let i = 0; i < 12; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.42, 8), mat(cols('minum')[i % 4])); b.position.set(-10.05, y + 0.02, -3.2 + i * 0.46); g.add(b); } });
  tag('🥤 Minuman', -9.9, 2.9, -0.5);
  // kulkas kaca di dinding kanan
  add(10.3, 1.2, -4, 0.9, 2.4, 3.2, 0xdfe6ea, true);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.0, 2.9), new THREE.MeshLambertMaterial({ color: 0xbfe3f5, transparent: true, opacity: 0.45 })); glass.position.set(9.82, 1.2, -4); g.add(glass);
  [0.5, 1.1, 1.7].forEach((y) => { for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.4, 8), mat(cols('kulkas')[i % 4])); b.position.set(10.1, y, -5.25 + i * 0.4); g.add(b); } });
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 2.9), new THREE.MeshBasicMaterial({ color: 0xffffff })); lamp.position.set(9.85, 2.25, -4); g.add(lamp);
  tag('🧊 Kulkas', 10, 2.9, -4);
  // kasir
  add(6.5, 0.55, 1.4, 4, 1.1, 0.9, 0xb98652, true); add(5.6, 1.25, 1.3, 0.6, 0.35, 0.4, 0x333a40); add(7.6, 1.15, 1.3, 0.5, 0.15, 0.4, 0x58ad4e);
  chairAt(g, 6.5, 0.1, 0); tag('💳 Kasir', 6.5, 2.6, 1.4);
  // poster
  add(3.5, 2.2, -7.86, 3.4, 1.0, 0.05, 0xffffff); tag('Jajan sehat, hemat, dan jujur', 3.5, 2.2, -7.75, 0.3);
  KOP_SPOT.makan = spot(KOP, -3.5, -5.4, g); KOP_SPOT.minum = spot(KOP, -8.6, -0.5, g); KOP_SPOT.kulkas = spot(KOP, 8.4, -4, g); KOP_SPOT.kasir = spot(KOP, 6.5, 2.9, g);
}
let kopPeople = [], kopPetugas = null, keranjang = [];
const rpK = (n) => 'Rp' + n.toLocaleString('id-ID');
const KOP_SAKU = 20000;
function enterKoperasi() {
  kopPeople.forEach((p) => { scene.remove(p); const i = npcs.indexOf(p); if (i >= 0) npcs.splice(i, 1); }); kopPeople = []; keranjang = [];
  kopPetugas = makePerson({ putri: true, shirt: 0x2f7a6a, bottom: 0x3a3a3a, hijab: 0x2f6b4a, face: { eye: 2 } });
  Object.assign(kopPetugas, { fixed: true, kind: 'kantin', putri: true, name: 'Petugas Koperasi', greetDay: 0 });
  seatPerson(kopPetugas, KOP.x + 6.5, KOP.z + 0.1, 0); nameTag(kopPetugas, 'Petugas Koperasi', 0.42, 2.4);
  scene.add(kopPetugas); npcs.push(kopPetugas); kopPeople.push(kopPetugas);
  const putri = meP();
  [[-1.5, -5.4, Math.PI], [-6.2, -0.6, Math.PI], [-9.0, 1.6, -Math.PI / 2]].forEach(([x, z, r], i) => {   // murid lain sedang memilih
    const m = makePerson(studentModel(putri, i + 6)); m.position.set(KOP.x + x, 0, KOP.z + z); m.rotation.y = r; if (m.bag) m.bag.visible = false;
    Object.assign(m, { fixed: true, kind: 'siswa', putri, name: (putri ? NAMES_PI : NAMES_PA)[(i + 5) % 8], homeRot: r });
    scene.add(m); npcs.push(m); kopPeople.push(m);
  });
  const d = doorsOut.find((q) => q.id === 'koperasi');
  enterHall('Koperasi Sekolah', KOP, 16, { x: d.x, z: d.z + 1.5, rot: 0 }, () => {
    roomSpots = [{ ...KOP_SPOT.makan, id: 'kop-makan' }, { ...KOP_SPOT.minum, id: 'kop-minum' }, { ...KOP_SPOT.kulkas, id: 'kop-kulkas' }, { ...KOP_SPOT.kasir, id: 'kop-kasir' }];
    say([{ p: player, t: "Assalamu'alaikum." }, { p: kopPetugas, t: `Wa'alaikumussalam, ${state.nama}. Silakan pilih di rak makanan, rak minuman, atau kulkas. Bayarnya di kasir, ya.`, e: 'senang' }]);
  }, 'room');
}
const kopTotal = () => keranjang.reduce((a, x) => a + x[1], 0);
function kopRak(k) {
  const R = KOP_ITEMS[k], pick = new Set();
  const draw = () => modal(`<div class="tag">${R.t}</div><div class="big">Pilih barang</div>
    <div class="mbg">${R.it.map((m, i) => `<button type="button" data-i="${i}" class="${pick.has(i) ? 'on' : ''}">${m[0]}<br><small>${rpK(m[1])}</small></button>`).join('')}</div>
    <p class="muted">Di keranjang: ${keranjang.length} barang · ${rpK(kopTotal())}${GURU ? '' : ` · uang saku ${rpK(KOP_SAKU)}`}</p>`,
    [['🧺 Masukkan ke keranjang', () => {
      if (!pick.size) return toast('Pilih barang dulu');
      [...pick].forEach((i) => keranjang.push(R.it[i])); Audio.sfx('greet'); closeModal();
      toast(`🧺 ${pick.size} barang masuk keranjang · total ${rpK(kopTotal())}. Bayar di kasir`);
    }, 'main'], ['Kembali', closeModal, 'small']]);
  draw();
  const bind = () => document.querySelectorAll('.mbg button').forEach((b) => (b.onclick = () => { const i = +b.dataset.i; pick.has(i) ? pick.delete(i) : pick.add(i); draw(); bind(); }));
  bind();
}
function kopKasir() {
  if (!keranjang.length) { bubble(kopPetugas, 'Keranjangnya masih kosong. Silakan pilih dulu, ya.', 2200); return; }
  const tot = kopTotal(), list = keranjang.map((x) => `<li>${x[0]} <b>${rpK(x[1])}</b></li>`).join('');
  bubble(kopPetugas, `Totalnya ${rpK(tot)}.`, 2000);
  modal(`<div class="tag">💳 Kasir Koperasi</div><div class="big">Total ${rpK(tot)}</div><ul style="text-align:left;margin:6px 0 4px 18px">${list}</ul>${GURU ? '' : `<p class="muted">Uang saku: ${rpK(KOP_SAKU)}</p>`}<div id="fb"></div>`,
    [['💵 Bayar', () => {
      if (!GURU && tot > KOP_SAKU) { $('fb').textContent = 'Uang sakumu tidak cukup. Kembalikan sebagian barang ke rak.'; Audio.sfx('no'); return; }
      const sehat = keranjang.every((x) => x[2]), bayar = GURU ? Math.ceil(tot / 5000) * 5000 : KOP_SAKU;
      Audio.sfx('ok'); closeModal();
      bubble(kopPetugas, `Kembaliannya ${rpK(bayar - tot)}. Terima kasih, semoga berkah!`, 2400);
      if (!GURU) { if (sehat) { addPts(4); setTimeout(() => toast('+4 ⭐ Belanja sehat & hemat'), 900); } else setTimeout(() => toast('Makanan manis, soda, dan pedas jangan terlalu sering, ya'), 900); }
      const nota = keranjang.map((x) => x[0]).join(', ');
      keranjang = [];
      setTimeout(() => modal(`<div class="tag">🧾 Struk Koperasi</div><p>${esc(nota)}</p><p>Total <b>${rpK(tot)}</b> · dibayar ${rpK(bayar)} · kembali ${rpK(bayar - tot)}</p>`,
        [['🍽️ Makan / minum sekarang', () => { closeModal(); playAnim(player, 'suap', 1.4); bubble(player, 'Bismillah…', 1500); setTimeout(() => bubble(player, 'Alhamdulillah.', 1400), 1700); }, 'main'], ['Simpan untuk nanti', closeModal, 'small']]), 1200);
    }, 'main'],
    ['🗑️ Kosongkan keranjang', () => { keranjang = []; closeModal(); toast('Barang dikembalikan ke rak'); }],
    ['Kembali', closeModal, 'small']]);
}
function kopAction(id) {
  if (id === 'kop-kasir') return kopKasir();
  return kopRak(id.slice(4));
}

// ---------- penanda pintu masuk: lingkaran kuning berdenyut + panah memantul di setiap pintu gedung ----------
const DOOR_MARKS = [];
function buildDoorMarks() {
  const skip = ['voli', 'basket', 'bola'];
  doorsOut.forEach((d) => {
    if (skip.includes(d.id)) return;
    const g = new THREE.Group(); g.position.set(d.x, 0, d.z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 1.0, 32), new THREE.MeshBasicMaterial({ color: 0xffc83d, transparent: true, opacity: 0.9 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.08; g.add(ring);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.6, 4), new THREE.MeshBasicMaterial({ color: 0xffc83d }));
    arrow.rotation.x = Math.PI; arrow.position.y = 2.2; g.add(arrow);
    scene.add(g); DOOR_MARKS.push({ g, ring, arrow, d });
  });
}
function updateDoorMarks(t) {
  if (zone !== 'luar') return;
  for (const m of DOOR_MARKS) {
    const near = Math.hypot(player.position.x - m.d.x, player.position.z - m.d.z) < 26;
    m.g.visible = near; if (!near) continue;
    const k = 1 + Math.sin(t * 3 + m.d.x) * 0.12; m.ring.scale.set(k, k, 1);
    m.arrow.position.y = 2.1 + Math.sin(t * 3.4 + m.d.z) * 0.25; m.arrow.rotation.y = t * 1.5;
  }
}
