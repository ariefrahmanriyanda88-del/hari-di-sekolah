// Panel Guru · Hari di Sekolah
import * as XLSX from 'xlsx';
import { makeBackend, pesanError } from './backend.js';
import DATA from './data.json';

const B = makeBackend();
const C = window.HDS_CONFIG || {};
const ADMIN = (C.admin || '').toLowerCase();
const SUBJ = DATA.subjects, KELAS = DATA.classes, GURUS = DATA.gurus;
const MODE = { auto: '🔄 Otomatis (bergantian)', arena: '🗺️ Arena petualangan', battle: '⚔️ Battle', balap: '🏎️ Balap' };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');
const S = { user: null, guru: null, tab: 'soal', soal: [], edit: null, kode: {}, nilai: null, filt: {}, gurus: [] };
const isAdmin = () => S.user && S.user.email && S.user.email.toLowerCase() === ADMIN;
const myMapel = () => (isAdmin() ? Object.keys(SUBJ) : S.guru.mapel || []);
const myKelas = () => (isAdmin() ? KELAS : S.guru.kelas || []);
const gameUrl = () => location.href.split('#')[0].replace(/[^/]*$/, '') + 'main.html';   // langsung ke game

function toast(t, bad) {
  const el = $('#toast'); el.textContent = t; el.className = 'show' + (bad ? ' bad' : '');
  clearTimeout(toast.t); toast.t = setTimeout(() => (el.className = ''), 3200);
}
async function busy(btn, fn) {
  const old = btn && btn.innerHTML; if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Memproses…'; }
  try { return await fn(); } catch (e) { console.error(e); toast(pesanError(e), true); } finally { if (btn) { btn.disabled = false; btn.innerHTML = old; } }
}
const checks = (name, items, sel, label = (x) => x) => items.map((x) => `<label class="chk"><input type="checkbox" name="${name}" value="${esc(x)}" ${sel.includes(x) ? 'checked' : ''}><span>${esc(label(x))}</span></label>`).join('');
const vals = (name, root = document) => $$(`input[name="${name}"]:checked`, root).map((i) => i.value);
const kelasGroup = (name, sel, list = KELAS) => ['X ', 'XI ', 'XII '].map((g) => {
  const ks = list.filter((k) => k.startsWith(g)); if (!ks.length) return '';
  return `<div class="kg"><b>Kelas ${g.trim()}</b><div class="chks">${checks(name, ks, sel)}</div></div>`;
}).join('');

// =============================== PEMBACA FILE WORD (.docx) ===============================
// hasil: daftar blok { t: 'p'|'h'|'li'|'pb'|'title', x: teks } dan tabel (array baris → array sel)
async function readDocx(file) {
  const cfb = XLSX.CFB.read(new Uint8Array(await file.arrayBuffer()), { type: 'array' });
  const ix = cfb.FullPaths.findIndex((p) => /word\/document\.xml$/i.test(p)), ent = ix >= 0 ? cfb.FileIndex[ix] : null;
  if (!ent || !ent.content) throw new Error('Bukan file Word (.docx) yang valid');
  const xml = new DOMParser().parseFromString(new TextDecoder().decode(ent.content), 'application/xml');
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const kids = (el, n) => [...el.childNodes].filter((c) => c.namespaceURI === W && c.localName === n);
  const textOf = (el) => { let t = ''; el.querySelectorAll('*').forEach((n) => { if (n.namespaceURI !== W) return; if (n.localName === 't') t += n.textContent; else if (n.localName === 'tab') t += ' '; else if (n.localName === 'br' && n.getAttributeNS(W, 'type') !== 'page') t += ' '; }); return t.replace(/\s+/g, ' ').trim(); };
  const body = xml.getElementsByTagNameNS(W, 'body')[0], blocks = [], tables = [];
  [...body.childNodes].forEach((n) => {
    if (n.namespaceURI !== W) return;
    if (n.localName === 'tbl') { tables.push(kids(n, 'tr').map((tr) => kids(tr, 'tc').map(textOf))); return; }
    if (n.localName !== 'p') return;
    const pPr = kids(n, 'pPr')[0], st = pPr && kids(pPr, 'pStyle')[0] ? kids(pPr, 'pStyle')[0].getAttributeNS(W, 'val') || '' : '';
    const before = pPr && kids(pPr, 'pageBreakBefore').length, after = [...n.getElementsByTagNameNS(W, 'br')].some((b) => b.getAttributeNS(W, 'type') === 'page');
    if (before) blocks.push({ t: 'pb' });
    const x = textOf(n);
    if (x) blocks.push({ t: /^Title$/i.test(st) ? 'title' : /^(Heading|Judul)\d|^heading/i.test(st) ? 'h' : pPr && kids(pPr, 'numPr').length ? 'li' : /List/i.test(st) ? 'li' : 'p', x });
    if (after) blocks.push({ t: 'pb' });
  });
  return { blocks, tables };
}

// =============================== LOGIN ===============================
function viewAuth(mode = 'masuk') {
  const names = Object.keys(GURUS);
  app.innerHTML = `
  <div class="auth">
    <div class="brand"><div class="logo">🏫</div><h1>Panel Guru</h1><p>Hari di Sekolah · SMAIT IQRA' · <a href="./">buka game</a></p></div>
    ${B.demo ? '<div class="demo">Mode demo: data hanya tersimpan di perangkat ini.</div>' : ''}
    <div class="seg"><button data-m="masuk" class="${mode === 'masuk' ? 'on' : ''}">Masuk</button><button data-m="daftar" class="${mode === 'daftar' ? 'on' : ''}">Daftar guru baru</button></div>
    ${mode === 'masuk' ? `
    <form id="fmasuk" class="card">
      <label>Email<input name="e" type="email" required autocomplete="email"></label>
      <label>Kata sandi<input name="p" type="password" required autocomplete="current-password"></label>
      <button class="btn main">Masuk</button>
      <button type="button" class="link" id="lupa">Lupa kata sandi?</button>
    </form>` : `
    <form id="fdaftar" class="card">
      <label>Nama Anda (sesuai jadwal)
        <select name="pick"><option value="">— pilih nama —</option>${names.map((n) => `<option>${esc(n)}</option>`).join('')}<option value="_lain">Nama lain…</option></select></label>
      <label id="lainw" hidden>Nama lengkap<input name="nama" maxlength="80"></label>
      <label>Email<input name="e" type="email" required autocomplete="email"></label>
      <label>Kata sandi (min. 6 karakter)<input name="p" type="password" minlength="6" required autocomplete="new-password"></label>
      <div class="sub">Mata pelajaran yang diampu</div><div class="chks" id="mp">${checks('mapel', Object.keys(SUBJ), [], (k) => SUBJ[k])}</div>
      <div class="sub">Kelas yang diajar</div><div id="kl">${kelasGroup('kelas', [])}</div>
      <p class="muted">Mapel & kelas terisi otomatis dari jadwal saat nama dipilih. Admin akan menyetujui pendaftaran Anda.</p>
      <button class="btn main">Daftar</button>
    </form>`}
  </div>`;
  $$('.seg button').forEach((b) => (b.onclick = () => viewAuth(b.dataset.m)));
  if (mode === 'masuk') {
    $('#fmasuk').onsubmit = (ev) => { ev.preventDefault(); const f = ev.target; busy(f.querySelector('.btn'), () => B.login(f.e.value.trim(), f.p.value)); };
    $('#lupa').onclick = () => { const e = $('#fmasuk').e.value.trim(); if (!e) return toast('Isi email dulu', true); busy(null, async () => { await B.reset(e); toast('Tautan atur ulang kata sandi dikirim ke email'); }); };
  } else {
    const f = $('#fdaftar');
    f.pick.onchange = () => {
      const v = f.pick.value; $('#lainw').hidden = v !== '_lain';
      const g = GURUS[v]; if (!g) return;
      $$('input[name=mapel]', f).forEach((i) => (i.checked = g.m.includes(i.value)));
      $$('input[name=kelas]', f).forEach((i) => (i.checked = g.k.includes(i.value)));
    };
    f.onsubmit = (ev) => {
      ev.preventDefault();
      const nama = f.pick.value === '_lain' ? f.nama.value.trim() : f.pick.value;
      if (!nama) return toast('Pilih atau tulis nama Anda', true);
      const mapel = vals('mapel', f), kelas = vals('kelas', f), email = f.e.value.trim();
      if (!isAdminEmail(email) && (!mapel.length || !kelas.length)) return toast('Pilih minimal satu mapel dan satu kelas', true);
      busy(f.querySelector('.btn.main'), async () => {
        S.pendingReg = { nama, mapel, kelas };
        const u = await B.daftar(email, f.p.value);
        await createGuruDoc(u);
      });
    };
  }
}
const isAdminEmail = (e) => e && e.toLowerCase() === ADMIN;
async function createGuruDoc(u) {
  const r = S.pendingReg; if (!r) return; S.pendingReg = null;
  const p = GURUS[r.nama] ? GURUS[r.nama].p : r.nama;
  await B.set('guru', u.uid, { nama: r.nama, panggilan: p, email: u.email, mapel: r.mapel, kelas: r.kelas, status: 'menunggu', dibuat: B.now(), dibuatMs: Date.now() });
  S.guru = await B.get('guru', u.uid); route();
}

// =============================== MENUNGGU ===============================
function viewWait(msg) {
  app.innerHTML = `<div class="auth"><div class="brand"><div class="logo">⏳</div><h1>${msg.t}</h1></div>
    <div class="card"><p>${msg.p}</p>
    <button class="btn main" id="cek">🔄 Periksa lagi</button>
    ${msg.v ? '<button class="btn" id="kirimv">✉️ Kirim ulang email verifikasi</button>' : ''}
    <button class="btn" id="out">Keluar</button></div></div>`;
  $('#cek').onclick = (e) => busy(e.target, async () => { S.user = await B.reload(); S.guru = await B.get('guru', S.user.uid); route(); });
  if (msg.v) $('#kirimv').onclick = (e) => busy(e.target, async () => { await B.verifikasi(); toast('Email verifikasi terkirim'); });
  $('#out').onclick = () => B.logout();
}

// =============================== RANGKA UTAMA ===============================
async function route() {
  if (!S.user || S.user.anon) return viewAuth();
  if (isAdmin() && !S.user.emailVerified) return viewWait({ t: 'Verifikasi email admin', p: `Buka email <b>${esc(S.user.email)}</b>, ketuk tautan verifikasi dari Firebase (cek juga folder Spam), lalu tekan <b>Periksa lagi</b>.`, v: true });
  if (!S.guru && isAdmin()) {
    await B.set('guru', S.user.uid, { nama: 'Admin', panggilan: 'Admin', email: S.user.email, mapel: Object.keys(SUBJ), kelas: KELAS, status: 'aktif', admin: true, dibuat: B.now(), dibuatMs: Date.now() });
    S.guru = await B.get('guru', S.user.uid);
  }
  if (!S.guru && S.pendingReg) return createGuruDoc(S.user);
  if (S.guru && isAdmin() && S.guru.status !== 'aktif') { await B.upd('guru', S.user.uid, { status: 'aktif' }); S.guru.status = 'aktif'; }
  if (!S.guru) return viewWait({ t: 'Data guru belum ada', p: 'Akun ini belum terdaftar sebagai guru. Keluar lalu pilih <b>Daftar guru baru</b>.' });
  if (S.guru.status !== 'aktif' && !isAdmin()) return viewWait({ t: 'Menunggu persetujuan', p: `Terima kasih, <b>${esc(S.guru.panggilan || S.guru.nama)}</b>. Pendaftaran Anda sedang menunggu persetujuan admin sekolah. Tekan <b>Periksa lagi</b> setelah disetujui.` });
  shell();
}
function shell() {
  const tabs = [['soal', '📝', 'Soal'], ['materi', '📚', 'Materi'], ['nilai', '📊', 'Nilai'], ['kode', '🔑', 'Kode kelas']];
  if (isAdmin()) tabs.push(['guru', '👥', 'Guru']);
  app.innerHTML = `
  <header><div><b>${esc(S.guru.panggilan || S.guru.nama)}</b><span>${isAdmin() ? 'Admin sekolah' : 'Guru'}${B.demo ? ' · demo' : ''}</span></div><span class="hb"><a class="btn small" href="./">🎮 Game</a><button class="btn small" id="out">Keluar</button></span></header>
  <nav>${tabs.map(([k, i, t]) => `<button data-t="${k}" class="${S.tab === k ? 'on' : ''}"><i>${i}</i>${t}<em id="badge-${k}"></em></button>`).join('')}</nav>
  <main id="view"></main>`;
  $('#out').onclick = () => { S.guru = null; B.logout(); };
  $$('nav button').forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.edit = null; S.editM = null; shell(); }));
  ({ soal: tabSoal, materi: tabMateri, nilai: tabNilai, kode: tabKode, guru: tabGuru })[S.tab]();
  if (isAdmin()) B.q('guru', [['status', '==', 'menunggu']]).then((g) => { const el = $('#badge-guru'); g = g.filter((x) => (x.email || '').toLowerCase() !== ADMIN); if (el) el.textContent = g.length || ''; }).catch(() => {});
}
const view = () => $('#view');

// =============================== SOAL ===============================
async function tabSoal() {
  if (S.edit) return editor();
  view().innerHTML = '<p class="muted pad">Memuat paket soal…</p>';
  try { S.soal = await B.q('soal', isAdmin() ? [] : [['guruUid', '==', S.user.uid]]); } catch (e) { view().innerHTML = `<p class="err pad">${esc(pesanError(e))}</p>`; return; }
  S.soal = S.soal.filter((d) => d.jenis !== 'materi').sort((a, b) => (b.diubahMs || 0) - (a.diubahMs || 0));
  view().innerHTML = `
    <div class="bar"><h2>Paket soal ${isAdmin() ? 'semua guru' : 'saya'}</h2><button class="btn main" id="baru">＋ Paket baru</button></div>
    <p class="muted">Soal yang <b>aktif</b> langsung muncul di game murid pada pelajaran yang sama (dan di Lab Komputer).</p>
    ${S.soal.length ? S.soal.map((d) => `
      <div class="card item">
        <div class="ihead"><b>${esc(d.judul || SUBJ[d.mapel] || d.mapel)}</b>
          <label class="sw"><input type="checkbox" data-aktif="${d.id}" ${d.aktif !== false ? 'checked' : ''}><span></span></label></div>
        <div class="meta"><span class="chip">${esc(SUBJ[d.mapel] || d.mapel)}</span><span class="chip">${esc(MODE[d.mode] || d.mode)}</span><span class="chip">${(d.items || []).length} soal</span>${isAdmin() ? `<span class="chip">👤 ${esc(d.guruNama || '')}</span>` : ''}</div>
        <div class="meta small">${(d.kelas || []).map((k) => (k === 'semua' ? 'Semua kelas' : esc(k))).join(', ')}</div>
        <div class="acts"><button class="btn small" data-ed="${d.id}">✏️ Ubah</button><button class="btn small" data-cp="${d.id}">📄 Salin</button><button class="btn small danger" data-del="${d.id}">🗑 Hapus</button></div>
      </div>`).join('') : `<div class="empty">Belum ada paket soal.<br>Ketuk <b>＋ Paket baru</b> untuk membuat tugas pertama.</div>`}`;
  $('#baru').onclick = () => { S.edit = { mapel: myMapel()[0], kelas: [], mode: 'auto', aktif: true, judul: '', items: [blank('pg')] }; editor(); };
  $$('[data-ed]').forEach((b) => (b.onclick = () => { S.edit = JSON.parse(JSON.stringify(S.soal.find((d) => d.id === b.dataset.ed))); editor(); }));
  $$('[data-cp]').forEach((b) => (b.onclick = () => { const d = JSON.parse(JSON.stringify(S.soal.find((x) => x.id === b.dataset.cp))); delete d.id; d.judul = (d.judul || '') + ' (salinan)'; S.edit = d; editor(); }));
  $$('[data-del]').forEach((b) => (b.onclick = () => { if (!confirm('Hapus paket soal ini?')) return; busy(b, async () => { await B.del('soal', b.dataset.del); toast('Paket dihapus'); tabSoal(); }); }));
  $$('[data-aktif]').forEach((i) => (i.onchange = () => busy(null, async () => { const d = S.soal.find((x) => x.id === i.dataset.aktif); d.aktif = i.checked; await saveDoc(d, true); toast(i.checked ? 'Diaktifkan ✓' : 'Dinonaktifkan'); })));
}
const blank = (t) => (t === 'bs' ? { t: 'bs', q: '', a: true } : { t: 'pg', q: '', o: ['', '', '', ''], k: 0 });
// pilihan ganda: o = pilihan A–D sesuai urutan guru, k = indeks jawaban benar.
// b/s tetap disimpan (b = benar, s = salah) agar game versi lama tetap bisa membaca.
const optsOf = (it) => { if (it.o) return { o: it.o.concat(['', '', '', '']).slice(0, 4), k: it.k || 0 }; return { o: [it.b || ''].concat(it.s || []).concat(['', '', '', '']).slice(0, 4), k: 0 }; };
const fixPG = (it) => { const o = it.o.map((x) => x.trim()); it.o = o; it.b = o[it.k] || ''; it.s = o.filter((x, i) => i !== it.k && x); return it; };
async function saveDoc(d, quiet) {
  const data = { judul: d.judul || '', mapel: d.mapel, kelas: d.kelas, mode: d.mode || 'auto', aktif: d.aktif !== false, items: d.items || [],
    ...(d.jenis === 'materi' ? { jenis: 'materi', isi: d.isi || '' } : {}),
    guruUid: d.guruUid || S.user.uid, guruNama: d.guruNama || S.guru.panggilan || S.guru.nama, diubah: B.now(), diubahMs: Date.now() };
  if (d.id) await B.set('soal', d.id, data); else d.id = await B.add('soal', data);
}
function editor() {
  const d = S.edit, mp = myMapel(), mk = myKelas();
  if (!mp.includes(d.mapel)) mp.unshift(d.mapel);
  view().innerHTML = `
    <div class="bar"><button class="btn small" id="batal">← Kembali</button><h2>${d.id ? 'Ubah' : 'Buat'} paket soal</h2></div>
    <div class="card">
      <label>Judul tugas (boleh kosong)<input id="judul" maxlength="80" value="${esc(d.judul)}" placeholder="mis. Mufradat Bab 3"></label>
      <label>Mata pelajaran<select id="mapel">${mp.map((k) => `<option value="${k}" ${k === d.mapel ? 'selected' : ''}>${esc(SUBJ[k] || k)}</option>`).join('')}</select></label>
      <label>Jenis game<select id="mode">${Object.entries(MODE).map(([k, v]) => `<option value="${k}" ${k === d.mode ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <div class="sub">Untuk kelas</div>
      <label class="chk wide"><input type="checkbox" name="kls" value="semua" ${d.kelas.includes('semua') ? 'checked' : ''}><span>Semua kelas</span></label>
      ${kelasGroup('kls', d.kelas, mk)}
      <label class="chk wide"><input type="checkbox" id="aktif" ${d.aktif !== false ? 'checked' : ''}><span>Aktif (tampil di game murid)</span></label>
    </div>
    <div class="bar"><h2>Daftar soal <span class="muted" id="cnt"></span></h2></div>
    <div class="tools"><button class="btn small" id="tempel">📋 Tempel dari Excel</button><button class="btn small" id="impor">⬆️ Impor Excel / Word</button><a class="btn small" href="templat/Templat_Soal_Hari_di_Sekolah.xlsx" download>⬇️ Templat Excel</a><a class="btn small" href="templat/Templat_Soal_Hari_di_Sekolah.docx" download>⬇️ Templat Word</a><input type="file" id="file" accept=".xlsx,.xls,.csv,.docx" hidden></div>
    <div id="qs"></div>
    <div class="tools"><button class="btn" id="addpg">＋ Pilihan ganda</button><button class="btn" id="addbs">＋ Benar / Salah</button></div>
    <div class="savebar"><button class="btn main" id="simpan">💾 Simpan paket soal</button></div>`;
  const pull = () => {
    d.judul = $('#judul').value.trim(); d.mapel = $('#mapel').value; d.mode = $('#mode').value; d.aktif = $('#aktif').checked;
    d.kelas = vals('kls'); if (d.kelas.includes('semua')) d.kelas = ['semua'];
    $$('.q', view()).forEach((el, i) => {
      const it = d.items[i]; it.q = $('.qq', el).value.trim();
      if (it.t === 'pg') { it.o = $$('.qo', el).map((x) => x.value); const c = $('input.qk:checked', el); it.k = c ? +c.value : 0; fixPG(it); }
      else it.a = $('.qa', el).value === 'b';
    });
  };
  const drawQs = () => {
    $('#cnt').textContent = `(${d.items.length})`;
    $('#qs').innerHTML = d.items.map((it, i) => `
      <div class="card q" data-i="${i}">
        <div class="ihead"><b>Soal ${i + 1}</b><span class="chip">${it.t === 'pg' ? 'Pilihan ganda' : 'Benar / Salah'}</span>
          <span class="qbtns"><button data-up="${i}" title="Naik">↑</button><button data-dn="${i}" title="Turun">↓</button><button data-rm="${i}" title="Hapus">✕</button></span></div>
        <textarea class="qq" rows="2" placeholder="Tulis pertanyaan… (huruf Arab boleh)">${esc(it.q)}</textarea>
        ${it.t === 'pg' ? `
          <div class="muted small">Isi pilihan A–D, lalu ketuk ⭕ pada jawaban yang <b>benar</b>. Urutan pilihan diacak otomatis di game.</div>
          ${optsOf(it).o.map((v, j) => `<label class="opt ${optsOf(it).k === j ? 'right' : ''}"><input type="radio" class="qk" name="k${i}" value="${j}" ${optsOf(it).k === j ? 'checked' : ''}><b>${'ABCD'[j]}</b><input class="qo" placeholder="Pilihan ${'ABCD'[j]}${j > 1 ? ' (boleh kosong)' : ''}" value="${esc(v)}"></label>`).join('')}` : `
          <label>Jawaban<select class="qa"><option value="b" ${it.a ? 'selected' : ''}>✓ Benar</option><option value="s" ${!it.a ? 'selected' : ''}>✗ Salah</option></select></label>`}
      </div>`).join('');
    $$('input.qk').forEach((rb) => (rb.onchange = () => { $$('label.opt', rb.closest('.q')).forEach((l) => l.classList.toggle('right', l.contains(rb))); }));
    $$('[data-up]').forEach((b) => (b.onclick = () => { pull(); const i = +b.dataset.up; if (i) [d.items[i - 1], d.items[i]] = [d.items[i], d.items[i - 1]]; drawQs(); }));
    $$('[data-dn]').forEach((b) => (b.onclick = () => { pull(); const i = +b.dataset.dn; if (i < d.items.length - 1) [d.items[i + 1], d.items[i]] = [d.items[i], d.items[i + 1]]; drawQs(); }));
    $$('[data-rm]').forEach((b) => (b.onclick = () => { pull(); d.items.splice(+b.dataset.rm, 1); drawQs(); }));
  };
  drawQs();
  $('#batal').onclick = () => { if (confirm('Kembali tanpa menyimpan?')) { S.edit = null; tabSoal(); } };
  $('#addpg').onclick = () => { pull(); d.items.push(blank('pg')); drawQs(); $$('.qq').pop().focus(); };
  $('#addbs').onclick = () => { pull(); d.items.push(blank('bs')); drawQs(); $$('.qq').pop().focus(); };
  const addRows = (rows) => {
    pull(); const n0 = d.items.length; d.items = d.items.filter((x) => x.q || x.b);
    rows.forEach((r) => {
      r = r.map((c) => String(c ?? '').trim()); if (!r[0] || /^soal$/i.test(r[0])) return;
      if (r.length < 3 || !r.slice(2).some(Boolean)) {
        const a = (r[1] || '').toLowerCase();
        if (['b', 'benar', 'true', 'ya', 's', 'salah', 'false'].includes(a)) { d.items.push({ t: 'bs', q: r[0], a: ['b', 'benar', 'true', 'ya'].includes(a) }); return; }
      }
      const last = r.slice(1).filter(Boolean), key = (last[last.length - 1] || '').toUpperCase();
      if (/^[A-D]$/.test(key) && last.length >= 3) {                       // format: Soal · A · B · C · D · Kunci
        const o = r.slice(1, 5).map((x) => (/^[A-D]$/i.test(x) && x === last[last.length - 1] ? '' : x));
        const k = 'ABCD'.indexOf(key); if (o[k]) { d.items.push(fixPG({ t: 'pg', q: r[0], o, k })); return; }
      }
      if (r[1]) d.items.push(fixPG({ t: 'pg', q: r[0], o: [r[1], r[2] || '', r[3] || '', r[4] || ''], k: 0 }));   // format lama: kolom 2 = jawaban benar
    });
    drawQs(); toast(`${d.items.length - Math.min(n0, d.items.length)} soal ditambahkan`);
  };
  $('#tempel').onclick = () => {
    const box = document.createElement('div'); box.className = 'sheet';
    box.innerHTML = `<div class="card"><b>Tempel dari Excel / Google Sheets</b>
      <p class="muted">Salin baris dari Excel lalu tempel di sini. Urutan kolom:<br><b>Soal · A · B · C · D · Kunci (A/B/C/D)</b><br>Untuk Benar/Salah: <b>Soal · B</b> atau <b>Soal · S</b></p>
      <textarea rows="8" id="tsv" placeholder="Apa arti كتاب?	Pena	Buku	Meja	Pintu	B"></textarea>
      <div class="tools"><button class="btn main" id="ok">Tambahkan</button><button class="btn" id="tutup">Batal</button></div></div>`;
    document.body.appendChild(box);
    $('#tutup', box).onclick = () => box.remove();
    $('#ok', box).onclick = () => { const t = $('#tsv', box).value; addRows(t.split(/\r?\n/).map((l) => l.split(l.includes('\t') ? '\t' : ';'))); box.remove(); };
  };
  $('#impor').onclick = () => $('#file').click();
  $('#file').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      if (/\.docx$/i.test(f.name)) {                     // Word: baca semua tabel soal (Soal · A · B · C · D · Kunci, atau Soal · B/S)
        const { tables } = await readDocx(f);
        const rows = tables.flat().filter((r) => r.length >= 2 && !/^(no\.?|nomor)$/i.test(r[0] || ''));
        if (!rows.length) toast('Tidak ditemukan tabel soal di file Word ini', true); else addRows(rows.map((r) => (/^\d+\.?$/.test(r[0]) ? r.slice(1) : r)));
      } else { const wb = XLSX.read(await f.arrayBuffer()); addRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 })); }
    } catch (er) { toast('File tidak bisa dibaca: ' + er.message, true); }
    e.target.value = '';
  };
  $('#simpan').onclick = (ev) => {
    pull();
    d.items = d.items.filter((x) => x.q || x.b || (x.s || []).some(Boolean));
    if (!d.kelas.length) return toast('Pilih minimal satu kelas', true);
    if (!d.items.length) return toast('Tambahkan minimal satu soal', true);
    const bad = d.items.findIndex((x) => !x.q || (x.t === 'pg' && (!x.b || !x.s.some(Boolean))));
    if (bad >= 0) { drawQs(); toast(`Soal ${bad + 1} belum lengkap: isi pertanyaan, minimal 2 pilihan, dan tandai ⭕ jawaban yang benar (pilihannya tidak boleh kosong)`, true); $$('.q')[bad].scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    busy(ev.target, async () => { await saveDoc(d); toast('Paket soal tersimpan ✓'); S.edit = null; tabSoal(); });
  };
}

// =============================== MATERI PERPUSTAKAAN ===============================
// disimpan di koleksi yang sama dengan soal (jenis: 'materi'), sehingga aturan keamanan tidak perlu diubah
const halaman = (isi) => String(isi || '').split(/\n\s*---+\s*\n/).map((x) => x.trim()).filter(Boolean);
async function tabMateri() {
  if (S.editM) return editorMateri();
  view().innerHTML = '<p class="muted pad">Memuat materi…</p>';
  let docs; try { docs = await B.q('soal', isAdmin() ? [] : [['guruUid', '==', S.user.uid]]); } catch (e) { view().innerHTML = `<p class="err pad">${esc(pesanError(e))}</p>`; return; }
  S.materi = docs.filter((d) => d.jenis === 'materi').sort((a, b) => (b.diubahMs || 0) - (a.diubahMs || 0));
  view().innerHTML = `
    <div class="bar"><h2>Materi perpustakaan</h2><button class="btn main" id="baruM">＋ Materi baru</button></div>
    <p class="muted">Materi yang <b>aktif</b> muncul sebagai buku di rak <b>Perpustakaan</b> game, sesuai mapelnya. Murid yang membaca sampai selesai mendapat ⭐.</p>
    ${S.materi.length ? S.materi.map((d) => `
      <div class="card item">
        <div class="ihead"><b>📖 ${esc(d.judul || 'Tanpa judul')}</b><label class="sw"><input type="checkbox" data-aktifm="${d.id}" ${d.aktif !== false ? 'checked' : ''}><span></span></label></div>
        <div class="meta"><span class="chip">${esc(SUBJ[d.mapel] || d.mapel)}</span><span class="chip">${halaman(d.isi).length} halaman</span>${isAdmin() ? `<span class="chip">👤 ${esc(d.guruNama || '')}</span>` : ''}</div>
        <div class="meta small">${(d.kelas || []).map((k) => (k === 'semua' ? 'Semua kelas' : esc(k))).join(', ')}</div>
        <div class="acts"><button class="btn small" data-edm="${d.id}">✏️ Ubah</button><button class="btn small danger" data-delm="${d.id}">🗑 Hapus</button></div>
      </div>`).join('') : '<div class="empty">Belum ada materi.<br>Ketuk <b>＋ Materi baru</b> untuk menambah buku di perpustakaan.</div>'}`;
  $('#baruM').onclick = () => { S.editM = { jenis: 'materi', mapel: myMapel()[0], kelas: ['semua'], aktif: true, judul: '', isi: '', items: [] }; editorMateri(); };
  $$('[data-edm]').forEach((b) => (b.onclick = () => { S.editM = JSON.parse(JSON.stringify(S.materi.find((d) => d.id === b.dataset.edm))); editorMateri(); }));
  $$('[data-delm]').forEach((b) => (b.onclick = () => { if (!confirm('Hapus materi ini?')) return; busy(b, async () => { await B.del('soal', b.dataset.delm); toast('Materi dihapus'); tabMateri(); }); }));
  $$('[data-aktifm]').forEach((i) => (i.onchange = () => busy(null, async () => { const d = S.materi.find((x) => x.id === i.dataset.aktifm); d.aktif = i.checked; await saveDoc(d); toast(i.checked ? 'Diaktifkan ✓' : 'Dinonaktifkan'); })));
}
function editorMateri() {
  const d = S.editM, mp = myMapel(), mk = myKelas();
  if (!mp.includes(d.mapel)) mp.unshift(d.mapel);
  view().innerHTML = `
    <div class="bar"><button class="btn small" id="batalM">← Kembali</button><h2>${d.id ? 'Ubah' : 'Tulis'} materi</h2></div>
    <div class="card">
      <label>Judul buku<input id="judulM" maxlength="80" value="${esc(d.judul)}" placeholder="mis. Mufradat Bab 3: Di Rumah"></label>
      <label>Mata pelajaran (menentukan raknya)<select id="mapelM">${mp.map((k) => `<option value="${k}" ${k === d.mapel ? 'selected' : ''}>${esc(SUBJ[k] || k)}</option>`).join('')}</select></label>
      <div class="sub">Untuk kelas</div>
      <label class="chk wide"><input type="checkbox" name="klsM" value="semua" ${d.kelas.includes('semua') ? 'checked' : ''}><span>Semua kelas</span></label>
      ${kelasGroup('klsM', d.kelas, mk)}
      <label class="chk wide"><input type="checkbox" id="aktifM" ${d.aktif !== false ? 'checked' : ''}><span>Aktif (tampil di perpustakaan)</span></label>
    </div>
    <div class="card">
      <div class="tools"><button class="btn small" id="imporM">⬆️ Impor dari Word (.docx)</button><a class="btn small" href="templat/Templat_Materi_Perpustakaan.docx" download>⬇️ Templat Word</a><input type="file" id="fileM" accept=".docx" hidden></div>
      <label>Isi materi<textarea id="isiM" rows="14" placeholder="Tulis materi di sini. Huruf Arab boleh.&#10;&#10;Pisahkan halaman dengan baris berisi --- &#10;---&#10;Halaman berikutnya…">${esc(d.isi)}</textarea></label>
      <p class="muted small">Tips: setiap baris baru tetap tampil sebagai baris baru. Tulis <b>---</b> di baris sendiri untuk pindah halaman. Awali baris dengan <b>#</b> untuk judul kecil, dan <b>-</b> untuk butir daftar.</p>
      <div class="muted small" id="infoM"></div>
    </div>
    <div class="savebar"><button class="btn main" id="simpanM">💾 Simpan materi</button></div>`;
  const info = () => ($('#infoM').textContent = `${halaman($('#isiM').value).length} halaman · ${$('#isiM').value.length} karakter`);
  $('#isiM').oninput = info; info();
  $('#imporM').onclick = () => $('#fileM').click();
  $('#fileM').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const { blocks } = await readDocx(f); let judul = '', out = [];
      blocks.forEach((b) => {
        if (b.t === 'title' && !judul) judul = b.x;
        else if (b.t === 'pb') { if (out.length && out[out.length - 1] !== '---') out.push('---'); }
        else if (b.t === 'h') out.push('# ' + b.x);
        else if (b.t === 'li') out.push('- ' + b.x);
        else out.push(b.x);
      });
      while (out[out.length - 1] === '---') out.pop();
      if (!out.length) return toast('File Word ini kosong', true);
      if (judul && !$('#judulM').value.trim()) $('#judulM').value = judul;
      $('#isiM').value = out.join('\n'); info(); toast('Materi dari Word dimasukkan ✓ Periksa lalu simpan');
    } catch (er) { toast('File tidak bisa dibaca: ' + er.message, true); }
    e.target.value = '';
  };
  $('#batalM').onclick = () => { if (confirm('Kembali tanpa menyimpan?')) { S.editM = null; tabMateri(); } };
  $('#simpanM').onclick = (ev) => {
    d.judul = $('#judulM').value.trim(); d.mapel = $('#mapelM').value; d.aktif = $('#aktifM').checked; d.isi = $('#isiM').value;
    d.kelas = vals('klsM'); if (d.kelas.includes('semua')) d.kelas = ['semua'];
    if (!d.judul) return toast('Isi judul buku', true);
    if (!d.kelas.length) return toast('Pilih minimal satu kelas', true);
    if (!d.isi.trim()) return toast('Isi materi masih kosong', true);
    if (d.isi.length > 60000) return toast('Materi terlalu panjang (maks. 60.000 karakter). Bagi menjadi beberapa buku.', true);
    busy(ev.target, async () => { await saveDoc(d); toast('Materi tersimpan ✓'); S.editM = null; tabMateri(); });
  };
}

// =============================== NILAI ===============================
const fmtTgl = (ms) => (ms ? new Date(ms).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-');
const GAME = { arena: '🗺️ Arena', battle: '⚔️ Battle', naga: '🐉 Naga', balap: '🏎️ Balap', pesawat: '✈️ Pesawat' };
function tabNilai() {
  const F = S.filt; const ks = myKelas();
  F.kelas = F.kelas && ks.includes(F.kelas) ? F.kelas : ks[0]; F.mapel = F.mapel || ''; F.jenis = F.jenis || 'tugas'; F.hari = F.hari ?? 30;
  view().innerHTML = `
    <div class="bar"><h2>Rekap nilai</h2></div>
    <div class="card filt">
      <label>Kelas<select id="fk">${ks.map((k) => `<option ${k === F.kelas ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></label>
      <label>Mapel<select id="fm"><option value="">Semua mapel${isAdmin() ? '' : ' saya'}</option>${myMapel().map((k) => `<option value="${k}" ${k === F.mapel ? 'selected' : ''}>${esc(SUBJ[k])}</option>`).join('')}</select></label>
      <label>Jenis<select id="fj"><option value="tugas" ${F.jenis === 'tugas' ? 'selected' : ''}>Tugas di kelas</option><option value="latihan" ${F.jenis === 'latihan' ? 'selected' : ''}>Latihan Lab Komputer</option><option value="" ${!F.jenis ? 'selected' : ''}>Semua</option></select></label>
      <label>Periode<select id="fh">${[[1, 'Hari ini'], [7, '7 hari'], [30, '30 hari'], [0, 'Semua']].map(([v, t]) => `<option value="${v}" ${+F.hari === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <button class="btn main" id="tampil">Tampilkan</button>
    </div>
    <div id="hasil"></div>`;
  const read = () => { F.kelas = $('#fk').value; F.mapel = $('#fm').value; F.jenis = $('#fj').value; F.hari = +$('#fh').value; };
  ['#fm', '#fj', '#fh'].forEach((s) => ($(s).onchange = () => { read(); drawNilai(); }));
  $('#fk').onchange = () => { read(); loadNilai(); };
  $('#tampil').onclick = (e) => { read(); loadNilai(e.target); };
  if (S.nilai && S.nilai.kelas === F.kelas) drawNilai(); else loadNilai();
}
async function loadNilai(btn) {
  $('#hasil').innerHTML = '<p class="muted pad">Memuat nilai…</p>';
  await busy(btn, async () => { const rows = await B.q('nilai', [['kelas', '==', S.filt.kelas]]); S.nilai = { kelas: S.filt.kelas, rows }; drawNilai(); });
}
function filtered() {
  const F = S.filt, my = myMapel(), t0 = F.hari ? (F.hari === 1 ? new Date().setHours(0, 0, 0, 0) : Date.now() - F.hari * 864e5) : 0;
  return S.nilai.rows.filter((r) => (F.mapel ? r.mapel === F.mapel : my.includes(r.mapel)) && (!F.jenis || r.jenis === F.jenis) && (r.ms || 0) >= t0)
    .sort((a, b) => (b.ms || 0) - (a.ms || 0));
}
function rekap(rows) {
  const by = {}, mp = [...new Set(rows.map((r) => r.mapel))].sort();
  rows.forEach((r) => { const k = (r.namaKecil || r.nama || '').trim(); const o = (by[k] = by[k] || { nama: r.nama, m: {}, n: 0 }); o.n++; (o.m[r.mapel] = o.m[r.mapel] || []).push(r.nilai); });
  const list = Object.values(by).map((o) => { const best = mp.map((m) => (o.m[m] ? Math.max(...o.m[m]) : null)); const v = best.filter((x) => x != null); return { ...o, best, rata: v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0 }; })
    .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
  return { mp, list };
}
function drawNilai() {
  const el = $('#hasil'); if (!el || !S.nilai) return;
  const rows = filtered(), R = rekap(rows), cls = (v) => (v == null ? '' : v >= 80 ? 'g' : v >= 60 ? 'y' : 'r');
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.nilai, 0) / rows.length) : 0;
  if (!rows.length) { el.innerHTML = `<div class="empty">Belum ada nilai untuk pilihan ini.<br><span class="muted">Nilai masuk otomatis saat murid menyelesaikan tugas di game dengan kode kelas ${esc(S.filt.kelas)}.</span></div>`; return; }
  el.innerHTML = `
    <div class="stats"><div><b>${R.list.length}</b>murid</div><div><b>${rows.length}</b>pengerjaan</div><div><b>${avg}</b>rata-rata</div></div>
    <div class="bar"><h2>Per murid <span class="muted">(nilai tertinggi)</span></h2><button class="btn small main" id="xls">⬇️ Unduh Excel</button></div>
    <div class="tbl"><table><thead><tr><th>No</th><th>Nama</th>${R.mp.map((m) => `<th>${esc(m)}</th>`).join('')}<th>Rata²</th><th>×</th></tr></thead>
      <tbody>${R.list.map((o, i) => `<tr><td>${i + 1}</td><td class="nm">${esc(o.nama)}</td>${o.best.map((v) => `<td class="${cls(v)}">${v ?? '–'}</td>`).join('')}<td><b>${o.rata}</b></td><td class="muted">${o.n}</td></tr>`).join('')}</tbody></table></div>
    <p class="muted small">Kolom = kode mapel. × = jumlah pengerjaan.</p>
    <div class="bar"><h2>Riwayat terbaru</h2></div>
    <div class="tbl"><table><thead><tr><th>Waktu</th><th>Nama</th><th>Mapel</th><th>Game</th><th>Benar</th><th>Nilai</th></tr></thead>
      <tbody>${rows.slice(0, 150).map((r) => `<tr><td class="muted">${fmtTgl(r.ms)}</td><td class="nm">${esc(r.nama)}</td><td>${esc(r.mapel)}</td><td>${GAME[r.mode] || esc(r.mode)}</td><td>${r.benar}/${r.total}</td><td class="${cls(r.nilai)}"><b>${r.nilai}</b></td></tr>`).join('')}</tbody></table></div>`;
  $('#xls').onclick = () => {
    const wb = XLSX.utils.book_new();
    const a = [['No', 'Nama', ...R.mp.map((m) => SUBJ[m] || m), 'Rata-rata', 'Jumlah pengerjaan']].concat(R.list.map((o, i) => [i + 1, o.nama, ...o.best.map((v) => v ?? ''), o.rata, o.n]));
    const ws1 = XLSX.utils.aoa_to_sheet(a); ws1['!cols'] = [{ wch: 4 }, { wch: 24 }];
    const b = [['Waktu', 'Nama', 'Kelas', 'Mapel', 'Jenis', 'Game', 'Benar', 'Jumlah soal', 'Nilai', 'Skor game']].concat(rows.map((r) => [r.ms ? new Date(r.ms).toLocaleString('id-ID') : '', r.nama, r.kelas, SUBJ[r.mapel] || r.mapel, r.jenis, r.mode, r.benar, r.total, r.nilai, r.skor]));
    const ws2 = XLSX.utils.aoa_to_sheet(b); ws2['!cols'] = [{ wch: 18 }, { wch: 24 }, { wch: 10 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Rekap'); XLSX.utils.book_append_sheet(wb, ws2, 'Riwayat');
    XLSX.writeFile(wb, `Nilai_${S.filt.kelas.replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
}

// =============================== KODE KELAS ===============================
const genKode = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
async function tabKode() {
  view().innerHTML = '<p class="muted pad">Memuat kode kelas…</p>';
  let docs; try { docs = await B.q('kodekelas'); } catch (e) { view().innerHTML = `<p class="err pad">${esc(pesanError(e))}</p>`; return; }
  S.kode = {}; docs.forEach((d) => (S.kode[d.kelas] = d.id));
  const ks = myKelas(), url = gameUrl();
  view().innerHTML = `
    <div class="bar"><h2>Kode kelas</h2>${isAdmin() ? '<button class="btn main" id="semua">✨ Buat kode yang belum ada</button>' : ''}</div>
    <p class="muted">Murid membuka game, mengisi nama dan kelas, lalu memasukkan <b>kode kelas</b> ini. Hanya murid yang tahu kodenya yang nilainya masuk ke kelas tersebut.</p>
    <div class="card"><div class="sub">Tautan game untuk murid</div><div class="url">${esc(url)}</div><button class="btn small" data-copy="${esc(url)}">📋 Salin tautan</button></div>
    <div class="kodes">${ks.map((k) => `
      <div class="card kd"><div><span class="muted">${esc(k)}</span><b class="kode">${S.kode[k] || '—'}</b></div>
      <div class="acts">${S.kode[k] ? `<a class="btn small wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Assalamu'alaikum. Game "Hari di Sekolah" untuk kelas ${k}:\n${url}\n\nIsi nama, pilih kelas ${k}, lalu masukkan kode kelas: *${S.kode[k]}*`)}">WhatsApp</a><button class="btn small" data-copy="${S.kode[k]}">Salin</button>` : ''}
      ${isAdmin() ? `<button class="btn small" data-gen="${esc(k)}">${S.kode[k] ? '🔄 Ganti' : '＋ Buat'}</button>` : ''}</div></div>`).join('')}</div>`;
  $$('[data-copy]').forEach((b) => (b.onclick = () => navigator.clipboard.writeText(b.dataset.copy).then(() => toast('Disalin ✓'), () => prompt('Salin teks ini:', b.dataset.copy))));
  const gen = async (k) => { if (S.kode[k]) await B.del('kodekelas', S.kode[k]); const c = genKode(); await B.set('kodekelas', c, { kelas: k, dibuatMs: Date.now() }); };
  $$('[data-gen]').forEach((b) => (b.onclick = () => { const k = b.dataset.gen; if (S.kode[k] && !confirm(`Ganti kode ${k}? Murid harus memakai kode baru.`)) return; busy(b, async () => { await gen(k); tabKode(); }); }));
  if ($('#semua')) $('#semua').onclick = (e) => busy(e.target, async () => { const miss = KELAS.filter((k) => !S.kode[k]); for (const k of miss) await gen(k); toast(`${miss.length} kode dibuat`); tabKode(); });
}

// =============================== GURU (ADMIN) ===============================
async function tabGuru() {
  view().innerHTML = '<p class="muted pad">Memuat data guru…</p>';
  try { S.gurus = await B.q('guru'); } catch (e) { view().innerHTML = `<p class="err pad">${esc(pesanError(e))}</p>`; return; }
  const others = S.gurus.filter((g) => !g.admin && (g.email || '').toLowerCase() !== ADMIN);
  const wait = others.filter((g) => g.status === 'menunggu'), act = others.filter((g) => g.status !== 'menunggu');
  const card = (g) => `
    <div class="card item"><div class="ihead"><b>${esc(g.panggilan || g.nama)}</b><span class="chip ${g.status === 'aktif' ? 'ok' : g.status === 'menunggu' ? 'wait' : ''}">${g.status}</span></div>
      <div class="meta small">${esc(g.nama)} · ${esc(g.email)}</div>
      <div class="meta small">📚 ${(g.mapel || []).map((m) => esc(SUBJ[m] || m)).join(', ') || '—'}</div>
      <div class="meta small">🏫 ${(g.kelas || []).join(', ') || '—'}</div>
      <div class="acts">${g.status !== 'aktif' ? `<button class="btn small main" data-ok="${g.id}">✓ Setujui</button>` : `<button class="btn small" data-off="${g.id}">Nonaktifkan</button>`}
        <button class="btn small" data-edit="${g.id}">✏️ Mapel & kelas</button><button class="btn small danger" data-hapus="${g.id}">Hapus</button></div></div>`;
  view().innerHTML = `
    <div class="bar"><h2>Menunggu persetujuan (${wait.length})</h2></div>
    ${wait.length ? wait.map(card).join('') : '<div class="empty small">Tidak ada pendaftar baru.</div>'}
    <div class="card"><div class="sub">Tautan pendaftaran guru</div><div class="url">${esc(location.href.split('#')[0])}</div><button class="btn small" data-copy="${esc(location.href.split('#')[0])}">📋 Salin tautan Panel Guru</button></div>
    <div class="bar"><h2>Guru terdaftar (${act.length})</h2></div>${act.map(card).join('')}`;
  const upd = (id, d, b, msg) => busy(b, async () => { await B.upd('guru', id, d); toast(msg); tabGuru(); });
  $$('[data-copy]').forEach((b) => (b.onclick = () => navigator.clipboard.writeText(b.dataset.copy).then(() => toast('Disalin ✓'), () => prompt('Salin:', b.dataset.copy))));
  $$('[data-ok]').forEach((b) => (b.onclick = () => upd(b.dataset.ok, { status: 'aktif' }, b, 'Guru disetujui ✓')));
  $$('[data-off]').forEach((b) => (b.onclick = () => upd(b.dataset.off, { status: 'nonaktif' }, b, 'Guru dinonaktifkan')));
  $$('[data-hapus]').forEach((b) => (b.onclick = () => { if (confirm('Hapus data guru ini? (akun login tetap ada, tetapi tidak bisa memakai panel)')) busy(b, async () => { await B.del('guru', b.dataset.hapus); tabGuru(); }); }));
  $$('[data-edit]').forEach((b) => (b.onclick = () => {
    const g = S.gurus.find((x) => x.id === b.dataset.edit), box = document.createElement('div'); box.className = 'sheet';
    box.innerHTML = `<div class="card"><b>${esc(g.panggilan || g.nama)}</b><div class="sub">Mata pelajaran</div><div class="chks">${checks('em', Object.keys(SUBJ), g.mapel || [], (k) => SUBJ[k])}</div>
      <div class="sub">Kelas</div>${kelasGroup('ek', g.kelas || [])}<div class="tools"><button class="btn main" id="ok">Simpan</button><button class="btn" id="tutup">Batal</button></div></div>`;
    document.body.appendChild(box); $('#tutup', box).onclick = () => box.remove();
    $('#ok', box).onclick = (e) => busy(e.target, async () => { await B.upd('guru', g.id, { mapel: vals('em', box), kelas: vals('ek', box) }); box.remove(); toast('Tersimpan ✓'); tabGuru(); });
  }));
}

// =============================== MULAI ===============================
B.onUser(async (u) => {
  S.user = u; S.guru = null;
  if (u && !u.anon) { try { S.guru = await B.get('guru', u.uid); } catch (e) { S.guru = null; } }
  route();
});
window.__panel = { S, B };
