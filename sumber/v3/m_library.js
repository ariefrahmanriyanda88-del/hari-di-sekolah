
// =====================================================================
//  PERPUSTAKAAN: rak buku per mapel → baca materi ringkas
//  (isi buku contoh; nanti bisa diganti/ditambah oleh guru mapel atau developer)
// =====================================================================
const B_ = (t) => `<span class="ar">${t}</span>`;
const BOOKS = {
  BA: { t: 'Bahasa Arab: Kosakata Sekolah', p: [
    `<h4>Benda di kelas</h4><ul><li>${B_('كِتَابٌ')} = buku</li><li>${B_('قَلَمٌ')} = pena</li><li>${B_('سَبُّورَةٌ')} = papan tulis</li><li>${B_('بَابٌ')} = pintu · ${B_('نَافِذَةٌ')} = jendela</li><li>${B_('كُرْسِيٌّ')} = kursi</li></ul>`,
    `<h4>Orang & tempat di sekolah</h4><ul><li>${B_('مُعَلِّمٌ')} = guru · ${B_('طَالِبٌ')} = siswa</li><li>${B_('مَدْرَسَةٌ')} = sekolah · ${B_('فَصْلٌ')} = kelas</li><li>${B_('مَكْتَبَةٌ')} = perpustakaan</li><li>${B_('مَقْصَفٌ')} = kantin · ${B_('مَلْعَبٌ')} = lapangan</li><li>${B_('مَسْجِدٌ')} = masjid · ${B_('بَيْتٌ')} = rumah</li></ul>`,
    `<h4>Kata tunjuk "ini"</h4><ul><li>${B_('هٰذَا')} untuk benda mudzakkar: ${B_('هٰذَا كِتَابٌ')} = Ini buku.</li><li>${B_('هٰذِهِ')} untuk benda muannats (umumnya berakhiran ة): ${B_('هٰذِهِ سَبُّورَةٌ')} = Ini papan tulis.</li></ul>`] },
  T2Q: { t: "Tahsin: Hukum Bacaan", p: [
    '<h4>Nun sukun / tanwin</h4><ul><li><b>Izhar halqi</b>: bertemu ء ه ع ح غ خ (6 huruf), dibaca jelas.</li><li><b>Idgham bighunnah</b>: bertemu ي ن م و, dilebur dengan dengung.</li><li><b>Idgham bilaghunnah</b>: bertemu ل ر, dilebur tanpa dengung.</li></ul>',
    '<h4>Iqlab & ikhfa</h4><ul><li><b>Iqlab</b>: bertemu ب, bunyi nun berubah menjadi mim dengan dengung.</li><li><b>Ikhfa haqiqi</b>: bertemu 15 huruf sisanya, dibaca samar dengan dengung.</li></ul>',
    '<h4>Qalqalah & mad</h4><ul><li><b>Qalqalah</b>: 5 huruf ق ط ب ج د, dibaca memantul saat sukun.</li><li><b>Mad thabi\'i</b>: dibaca panjang 2 harakat.</li></ul>'] },
  PAI: { t: 'PAI: Rukun Islam & Iman', p: [
    '<h4>Rukun Islam (5)</h4><ol><li>Syahadat</li><li>Mendirikan sholat</li><li>Menunaikan zakat</li><li>Puasa Ramadhan</li><li>Haji bagi yang mampu</li></ol>',
    '<h4>Rukun Iman (6)</h4><ol><li>Iman kepada Allah</li><li>Malaikat</li><li>Kitab-kitab</li><li>Rasul-rasul</li><li>Hari akhir</li><li>Qada dan qadar</li></ol><p>Malaikat Jibril bertugas menyampaikan wahyu.</p>',
    "<h4>Kitab & sholat fardhu</h4><ul><li>Taurat (Nabi Musa), Zabur (Nabi Dawud), Injil (Nabi Isa), Al-Qur'an (Nabi Muhammad ﷺ)</li><li>Rakaat: Subuh 2, Zuhur 4, Ashar 4, Maghrib 3, Isya 4</li></ul>"] },
  ADAB: { t: 'Adab Penuntut Ilmu', p: [
    '<h4>Sebelum belajar</h4><ul><li>Luruskan niat karena Allah.</li><li>Berdoa sebelum belajar:</li></ul>' + `<p class="ctr">${B_('رَبِّ زِدْنِيْ عِلْمًا وَارْزُقْنِيْ فَهْمًا')}<br><i>Rabbi zidnii ‘ilman warzuqnii fahman</i><br><small>"Ya Tuhanku, tambahkanlah ilmuku dan berilah aku pemahaman."</small></p>`,
    '<h4>Di kelas</h4><ul><li>Mengetuk pintu dan mengucap salam saat masuk.</li><li>Menghormati guru dan mendengarkan dengan baik.</li><li>Tidak memotong pembicaraan.</li></ul>',
    '<h4>Setelah belajar</h4><ul><li>Mengulang (muraja\'ah) pelajaran.</li><li>Mengamalkan ilmu yang didapat.</li><li>Berbagi ilmu kepada teman.</li></ul>'] },
  BI: { t: 'Bahasa Indonesia: Paragraf & Teks', p: [
    '<h4>Paragraf</h4><ul><li><b>Ide pokok</b> = gagasan utama paragraf.</li><li>Kalimat utama berisi ide pokok; kalimat penjelas mendukungnya.</li><li>Deduktif: kalimat utama di awal. Induktif: di akhir.</li></ul>',
    '<h4>Jenis teks</h4><ul><li><b>Narasi</b>: bercerita</li><li><b>Deskripsi</b>: menggambarkan</li><li><b>Eksposisi</b>: menjelaskan informasi</li><li><b>Persuasi</b>: membujuk / mengajak</li><li><b>Prosedur</b>: langkah-langkah</li></ul>',
    '<h4>Kata baku</h4><ul><li>apotek (bukan apotik)</li><li>praktik (bukan praktek)</li><li>aktivitas, kualitas, risiko, napas</li></ul>'] },
  Eng: { t: 'English: Basic Grammar', p: [
    '<h4>Simple Present</h4><ul><li>I/You/We/They + V1: <i>They play football.</i></li><li>He/She/It + V1 + s/es: <i>She goes to school every day.</i></li></ul>',
    '<h4>Simple Past</h4><ul><li>Regular: V + ed (play → played)</li><li>Irregular: go → went, eat → ate, write → wrote</li><li>To be: was / were</li></ul>',
    '<h4>Irregular plurals</h4><ul><li>child → children</li><li>man → men · woman → women</li><li>tooth → teeth · mouse → mice</li></ul>'] },
  MW: { t: 'Matematika: Eksponen & Persamaan', p: [
    '<h4>Sifat eksponen</h4><ul><li>aᵐ × aⁿ = aᵐ⁺ⁿ → 2³ × 2² = 2⁵ = 32</li><li>aᵐ ÷ aⁿ = aᵐ⁻ⁿ</li><li>(aᵐ)ⁿ = aᵐⁿ · a⁰ = 1</li></ul>',
    '<h4>Persamaan linear</h4><p>3x + 5 = 20 → 3x = 15 → <b>x = 5</b></p><p>Kerjakan operasi yang sama di kedua ruas.</p>',
    '<h4>Garis & sudut</h4><ul><li>y = mx + c → m = gradien, c = titik potong sumbu-y</li><li>Sudut siku-siku 90°, sudut lurus 180°, satu putaran 360°</li></ul>'] },
  MML: { t: 'Matematika Lanjutan', p: [
    '<h4>Turunan</h4><ul><li>f(x) = xⁿ → f\'(x) = n·xⁿ⁻¹</li><li>f(x) = x² → f\'(x) = 2x</li><li>Turunan konstanta = 0</li></ul>',
    '<h4>Logaritma</h4><ul><li>ᵃlog b = c artinya aᶜ = b</li><li>log 1000 = 3 karena 10³ = 1000</li></ul>',
    '<h4>Trigonometri & matriks</h4><ul><li>sin 30° = ½ · sin 90° = 1 · cos 0° = 1 · tan 45° = 1</li><li>A×B bisa dihitung jika banyak kolom A = banyak baris B</li></ul>'] },
  FIS: { t: 'Fisika: Besaran, Gerak & Gaya', p: [
    '<h4>Satuan SI</h4><ul><li>Panjang: meter · Massa: kilogram · Waktu: sekon</li><li>Gaya: newton · Energi: joule · Daya: watt · Tekanan: pascal</li></ul>',
    '<h4>Gerak & Hukum Newton</h4><ul><li>Kecepatan rata-rata v = jarak ÷ waktu</li><li>Hukum II Newton: F = m × a</li><li>Hukum III: aksi = −reaksi</li></ul>',
    '<h4>Fakta penting</h4><ul><li>Gravitasi bumi g ≈ 9,8 m/s²</li><li>Bunyi butuh medium, tidak merambat di ruang hampa</li><li>Amperemeter mengukur arus, voltmeter mengukur tegangan</li></ul>'] },
  KIM: { t: 'Kimia: Atom & Larutan', p: [
    '<h4>Partikel atom</h4><ul><li>Proton (+) dan neutron (netral) di inti atom</li><li>Elektron (−) mengelilingi inti</li></ul>',
    '<h4>Lambang & rumus</h4><ul><li>Na = natrium · K = kalium · Fe = besi · Cl = klorin</li><li>H₂O = air · CO₂ = karbon dioksida · NaCl = garam dapur</li></ul>',
    '<h4>Asam & basa</h4><ul><li>pH &lt; 7: asam</li><li>pH = 7: netral</li><li>pH &gt; 7: basa</li></ul>'] },
  BIO: { t: 'Biologi: Sel & Tubuh', p: [
    '<h4>Sel</h4><p>Sel adalah satuan struktural terkecil makhluk hidup.</p><ul><li>Nukleus: pengendali sel</li><li>Mitokondria: respirasi sel</li><li>Kloroplas: fotosintesis (tumbuhan)</li><li>Ribosom: sintesis protein</li></ul>',
    '<h4>Fotosintesis</h4><p>Karbon dioksida + air + cahaya matahari → glukosa + oksigen</p><p>Jamur tidak berklorofil, jadi tidak berfotosintesis.</p>',
    '<h4>Peredaran darah</h4><ul><li>Jantung memompa darah ke seluruh tubuh</li><li>Paru-paru: pertukaran oksigen dan karbon dioksida</li></ul>'] },
  SJ: { t: 'Sejarah: Menuju Kemerdekaan', p: [
    '<h4>Kebangkitan nasional</h4><ul><li>20 Mei 1908: Budi Utomo berdiri</li><li>28 Oktober 1928: Sumpah Pemuda</li></ul>',
    '<h4>Proklamasi</h4><ul><li>17 Agustus 1945, dibacakan Ir. Soekarno didampingi Mohammad Hatta</li></ul>',
    '<h4>Kerajaan Islam di Nusantara</h4><ul><li>Samudera Pasai (Aceh), sering disebut kerajaan Islam pertama</li><li>Demak, Mataram Islam, dan lainnya</li></ul>'] },
  GEO: { t: 'Geografi: Bumi & Peta', p: [
    '<h4>Garis lintang & bujur</h4><ul><li>Khatulistiwa (lintang 0°) membagi bumi utara dan selatan</li><li>Bujur 0° melewati Greenwich</li></ul>',
    '<h4>Lapisan atmosfer</h4><ol><li>Troposfer (terdekat, tempat cuaca)</li><li>Stratosfer (lapisan ozon)</li><li>Mesosfer</li><li>Termosfer</li></ol>',
    '<h4>Skala peta</h4><p>1 : 100.000 → 1 cm di peta = 100.000 cm = <b>1 km</b> di lapangan.</p>'] },
  EKO: { t: 'Ekonomi: Kebutuhan & Kegiatan', p: [
    '<h4>Kebutuhan</h4><ul><li>Primer: pangan, sandang, papan</li><li>Sekunder: pelengkap (mis. sepeda)</li><li>Tersier: kemewahan</li></ul>',
    '<h4>Kegiatan ekonomi</h4><ul><li>Produksi: menghasilkan barang/jasa</li><li>Distribusi: menyalurkan</li><li>Konsumsi: memakai</li></ul>',
    '<h4>Uang & negara</h4><ul><li>Bank Indonesia adalah bank sentral</li><li>Inflasi: kenaikan harga umum terus-menerus</li><li>Pajak: sumber pendapatan negara</li></ul>'] },
  SOS: { t: 'Sosiologi: Masyarakat', p: [
    '<h4>Sosialisasi</h4><p>Proses belajar menjadi anggota masyarakat. Agen: keluarga (pertama), sekolah, teman sebaya, media massa.</p>',
    '<h4>Interaksi sosial</h4><p>Syaratnya ada <b>kontak sosial</b> dan <b>komunikasi</b>.</p>',
    '<h4>Perubahan</h4><ul><li>Mobilitas sosial: perpindahan status</li><li>Akulturasi: budaya berpadu tanpa hilang unsur asli</li><li>Asimilasi: membentuk budaya baru</li></ul>'] },
  PP: { t: 'Pendidikan Pancasila', p: [
    '<h4>Lima sila Pancasila</h4><ol><li>Ketuhanan Yang Maha Esa</li><li>Kemanusiaan yang adil dan beradab</li><li>Persatuan Indonesia</li><li>Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan</li><li>Keadilan sosial bagi seluruh rakyat Indonesia</li></ol>',
    '<h4>Simbol negara</h4><ul><li>Lambang: Garuda Pancasila</li><li>Semboyan: Bhinneka Tunggal Ika (berbeda-beda tetapi tetap satu)</li></ul>',
    '<h4>Lembaga negara</h4><p>Undang-undang dibentuk oleh DPR bersama Presiden.</p>'] },
  TIK: { t: 'Informatika: Komputer', p: [
    '<h4>Perangkat keras</h4><ul><li>Masukan: keyboard, mouse</li><li>Keluaran: monitor, printer, speaker</li><li>Pemroses: CPU ("otak" komputer)</li></ul>',
    '<h4>Memori & data</h4><ul><li>RAM menyimpan data sementara (hilang saat listrik mati)</li><li>1 byte = 8 bit</li></ul>',
    '<h4>Algoritma</h4><p>Langkah-langkah logis dan berurutan untuk menyelesaikan masalah.</p>'] },
  KKA: { t: 'Koding & Kecerdasan Artifisial', p: [
    '<h4>Dasar pemrograman</h4><ul><li>Urutan (sequence)</li><li>Percabangan (if)</li><li>Perulangan (loop)</li></ul>',
    '<h4>Biner & AI</h4><ul><li>Bilangan biner hanya memakai 0 dan 1</li><li>AI belajar dari data, hasilnya bisa keliru, jadi tetap perlu diperiksa</li></ul>',
    '<h4>Aman di internet</h4><ul><li>Kata sandi kuat: huruf besar-kecil, angka, simbol</li><li>Jangan pakai tanggal lahir, jangan bagikan kata sandi</li></ul>'] },
  PJOK: { t: 'PJOK: Permainan Bola', p: [
    '<h4>Jumlah pemain</h4><ul><li>Sepak bola: 11 orang</li><li>Bola voli: 6 orang</li><li>Bola basket: 5 orang</li></ul>',
    '<h4>Organisasi</h4><ul><li>PSSI (sepak bola) · PBVSI (voli) · PERBASI (basket) · PBSI (bulu tangkis)</li></ul>',
    '<h4>Kesehatan</h4><ul><li>Pemanasan sebelum olahraga mengurangi risiko cedera</li><li>Lari jarak pendek memakai start jongkok</li></ul>'] },
  SB: { t: 'Seni Budaya Nusantara', p: [
    '<h4>Unsur seni rupa</h4><p>Titik, garis, bidang, bentuk, warna, dan tekstur.</p>',
    '<h4>Alat musik daerah</h4><ul><li>Angklung (Jawa Barat)</li><li>Sasando (NTT)</li><li>Dol (Bengkulu)</li></ul>',
    '<h4>Tari daerah</h4><ul><li>Tari Saman (Aceh)</li><li>Tari Kecak (Bali)</li><li>Tari Andun (Bengkulu)</li></ul>'] },
  PRK: { t: 'Prakarya: Kerajinan Limbah', p: [
    '<h4>Jenis limbah</h4><ul><li>Organik: sisa makanan, daun, kulit buah</li><li>Anorganik: plastik, kaleng, kaca</li></ul>',
    '<h4>Tahap membuat produk</h4><ol><li>Perencanaan</li><li>Persiapan alat & bahan</li><li>Pembuatan</li><li>Finishing</li><li>Evaluasi</li></ol>'] },
};
const LIB = new THREE.Vector3(420, 0, 120);
const SHELVES = [
  { x: -8.4, z: -5.6, n: 'Agama & Adab', b: ['PAI', 'T2Q', 'ADAB', 'BA'], c: 0x2f8a5c },
  { x: -2.8, z: -5.6, n: 'Bahasa', b: ['BI', 'Eng'], c: 0x3b7dd8 },
  { x: 2.8, z: -5.6, n: 'Matematika & Sains', b: ['MW', 'MML', 'FIS', 'KIM', 'BIO'], c: 0xe0623e },
  { x: 8.4, z: -5.6, n: 'IPS & Kewarganegaraan', b: ['SJ', 'GEO', 'EKO', 'SOS', 'PP'], c: 0x8f5fb0 },
  { x: -10.2, z: 2.5, n: 'Teknologi', b: ['TIK', 'KKA'], c: 0x2b6f7a, side: 'W' },
  { x: 10.2, z: 2.5, n: 'Seni, Olahraga & Prakarya', b: ['SB', 'PJOK', 'PRK'], c: 0xd9577a, side: 'E' },
];
const lib = makeHall(LIB, 24, 16, 0xf1e6cf, '#efe3c9', '#e4d6b8');
{
  const { add } = lib;
  const spine = [0xd9577a, 0x3b7dd8, 0x58ad4e, 0xf2a33a, 0x7a4fb0, 0x2b6f7a, 0xe0623e, 0xffffff];
  SHELVES.forEach((s, k) => {
    const rot = s.side === 'W' ? Math.PI / 2 : s.side === 'E' ? -Math.PI / 2 : 0;
    const g = new THREE.Group(); g.position.set(s.x, 0, s.side ? s.z : -7.3); g.rotation.y = rot; lib.g.add(g);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3, 0.8), mat(0x8a5a2b)); frame.position.y = 1.5; g.add(frame);
    for (let r = 0; r < 4; r++) for (let i = 0; i < 12; i++) { const bk = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5 + ((i * 7 + r) % 3) * 0.06, 0.5), mat(spine[(i + r + k) % spine.length])); bk.position.set(-1.9 + i * 0.34, 0.5 + r * 0.7, 0.2); g.add(bk); }
    const band = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.35, 0.05), mat(s.c)); band.position.set(0, 3.15, 0.42); g.add(band);
    const lb = label(s.n, 0, 0, 0, 0.55); scene.remove(lb); lb.position.set(0, 3.8, 0.4); g.add(lb);
    colliders.push(s.side ? { x1: LIB.x + s.x - 0.5, z1: LIB.z + s.z - 2.4, x2: LIB.x + s.x + 0.5, z2: LIB.z + s.z + 2.4 } : { x1: LIB.x + s.x - 2.3, z1: LIB.z - 7.8, x2: LIB.x + s.x + 2.3, z2: LIB.z - 6.8 });
    if (s.side) s.x += s.side === 'W' ? 1.4 : -1.4;
    const mk = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.6, 24), new THREE.MeshBasicMaterial({ color: 0xffc83d })); mk.rotation.x = -Math.PI / 2; mk.position.set(s.x, 0.05, s.z); lib.g.add(mk);
  });
  [[-4, 2], [4, 2]].forEach(([x, z]) => { add(x, 0.75, z, 4, 0.1, 1.6, 0xd59a5c, true); add(x, 0.37, z, 0.3, 0.74, 1, 0x6d6f73);
    for (let i = 0; i < 3; i++) { add(x - 1.3 + i * 1.3, 0.83, z - 0.3, 0.5, 0.05, 0.35, 0xfffaf0); } });
  add(8.5, 0.55, 6, 3, 1.1, 1, 0x9b6b3c, true);                  // meja pustakawan
  const s = label('Perpustakaan', 0, 0, 0, 0.9); scene.remove(s); s.position.set(0, 4.4, -7.4); lib.g.add(s);
}
let libPeople = [];
function enterLibrary() {
  libPeople.forEach((p) => scene.remove(p)); libPeople = [];
  const putri = isPutri(state.cls);
  [[-5.3, 1.2], [-2.7, 1.2], [2.7, 2.8], [5.3, 1.2]].forEach(([x, z], i) => {
    const m = makePerson(studentModel(putri, i + 4)); m.position.set(LIB.x + x, 0, LIB.z + z); m.rotation.y = z < 2 ? 0 : Math.PI; sitPose(m, true); m.armL.rotation.x = m.armR.rotation.x = -1.1; scene.add(m); libPeople.push(m);
  });
  const pus = makePerson(teacherModel(putri ? 'P' : 'L', 3)); pus.position.set(LIB.x + 8.5, 0, LIB.z + 7); pus.rotation.y = Math.PI; scene.add(pus); nameTag(pus, putri ? 'Ustadzah Pustakawan' : 'Ustadz Pustakawan', 0.5); libPeople.push(pus);
  const dd = doorsOut.find((d) => d.id === 'perpus');
  enterHall('Perpustakaan', LIB, 16, { x: dd.x, z: dd.z + 1.5, rot: 0 }, () => {
    bubble(player, "Assalamu'alaikum…", 1500);
    setTimeout(() => bubble(pus, `Wa'alaikumussalam. Silakan pilih buku di rak, ${state.nama}. Jangan berisik, ya.`, 3200), 1000);
    toast('📚 Dekati rak (lingkaran kuning) untuk memilih buku');
  }, 'perpus');
}
function openShelf(i) {
  const s = SHELVES[i];
  modal(`<div class="tag">📚 Rak ${esc(s.n)}</div><p class="muted">Pilih buku untuk dibaca</p>`,
    s.b.map((k) => [`📖 ${BOOKS[k].t}${(state.read || {})[k] === state.day ? ' ✓' : ''}`, () => readBook(k, 0), 'opt left']).concat([['Kembali', closeModal, 'small']]));
}
function readBook(k, pg) {
  const b = BOOKS[k], n = b.p.length;
  const btns = [];
  if (pg > 0) btns.push(['◀ Sebelumnya', () => readBook(k, pg - 1)]);
  if (pg < n - 1) btns.push(['Berikutnya ▶', () => readBook(k, pg + 1), 'main']);
  else btns.push(['✓ Selesai membaca', () => {
    state.read = state.read || {};
    if (state.read[k] !== state.day) { state.read[k] = state.day; addPts(2); toast('+2 ⭐ Rajin membaca'); }
    closeModal();
    if (QBANK[k]) setTimeout(() => toast('Materi ini juga ada latihannya di 🎮 Lab Komputer'), 2000);
  }, 'main']);
  modal(`<div class="tag">📖 ${esc(b.t)} · hal. ${pg + 1}/${n}</div><div class="book">${b.p[pg]}</div>`, btns);
}
