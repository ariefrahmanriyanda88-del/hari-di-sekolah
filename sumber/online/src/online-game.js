// Penghubung game murid <-> server (dimuat sebelum game)
import { makeBackend, pesanError } from './backend.js';

const B = makeBackend();
const escH = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// teks guru -> HTML aman; huruf Arab otomatis memakai font Arab
const fmt = (s) => escH(s).replace(/[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿][؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿\s؟،]*/g, (m) => `<span class="ar">${m.trim()}</span>${/\s$/.test(m) ? ' ' : ''}`);

// halaman materi: teks guru -> HTML aman (# judul, - daftar, baris baru)
function pageHtml(txt) {
  let out = '', list = false;
  txt.split('\n').forEach((ln) => {
    const l = ln.trim();
    if (/^[-•*]\s+/.test(l)) { if (!list) { out += '<ul>'; list = true; } out += `<li>${fmt(l.replace(/^[-•*]\s+/, ''))}</li>`; return; }
    if (list) { out += '</ul>'; list = false; }
    if (!l) return;
    if (/^#+\s*/.test(l)) out += `<h4>${fmt(l.replace(/^#+\s*/, ''))}</h4>`;
    else out += `<p>${fmt(l)}</p>`;
  });
  return out + (list ? '</ul>' : '');
}
function toBank(items) {
  return items.map((it) => {
    if (it.t === 'bs') return { t: 'ox', q: fmt(it.q), a: !!it.a };
    const salah = (it.s || []).filter((x) => String(x).trim());
    return { t: 'pg', q: fmt(it.q), o: [fmt(it.b)].concat(salah.map(fmt)) };
  }).filter((x) => x.q && (x.t === 'ox' || x.o.length >= 2));
}

const HDS = {
  aktif: false, demo: B.demo, murid: null,
  async masukMurid(nama, kelas, kode) {
    try {
      await B.anon();
      const k = await B.get('kodekelas', kode);
      if (!k) throw new Error('Kode kelas tidak ditemukan. Tanyakan kode kepada guru.');
      if (k.kelas !== kelas) throw new Error(`Kode ini untuk kelas ${k.kelas}. Periksa pilihan kelasmu.`);
      const docs = (await B.q('soal', [['kelas', 'array-contains-any', [kelas, 'semua']]])).filter((d) => d.aktif !== false);
      const bank = {}, mode = {}, books = [];
      docs.filter((d) => d.jenis === 'materi').forEach((d) => {
        const pages = String(d.isi || '').split(/\n\s*---+\s*\n/).map((x) => x.trim()).filter(Boolean).map(pageHtml);
        if (pages.length) books.push({ id: 'G_' + d.id, mapel: d.mapel, t: d.judul || 'Materi', oleh: d.guruNama || '', p: pages });
      });
      docs.sort((a, b) => (a.diubahMs || 0) - (b.diubahMs || 0)).forEach((d) => {
        const qs = toBank(d.items || []); if (!qs.length) return;
        bank[d.mapel] = (bank[d.mapel] || []).concat(qs);
        if (d.mode && d.mode !== 'auto') mode[d.mapel] = d.mode;
      });
      this.murid = { nama, kelas, kode }; this.aktif = true;
      return { bank, mode, books, n: docs.length, mapel: Object.keys(bank) };
    } catch (e) {
      if (e.code) throw new Error(pesanError(e));
      throw e;
    }
  },
  kirimNilai(o) {
    if (!this.aktif) return Promise.resolve(false);
    const m = this.murid, u = B.user();
    return B.add('nilai', { ...o, nama: m.nama, namaKecil: m.nama.toLowerCase(), kelas: m.kelas, kode: m.kode, uid: u ? u.uid : '', waktu: B.now(), ms: Date.now() });
  },
};
window.HDS = HDS;
