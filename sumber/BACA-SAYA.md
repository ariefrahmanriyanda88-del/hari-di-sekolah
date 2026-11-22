# Kode sumber "Hari di Sekolah"

Folder ini berisi kode sumber game dan Panel Guru (tidak memengaruhi situs).
File situs yang dipakai murid dan guru ada di folder utama:
index.html (game), guru.html + guru.js (Panel Guru), online.js, config.js, azan.mp3.

- `v3/` + `head3.html`: game 3D (Three.js), digabung oleh `build3.sh`
- `online/src/`: Panel Guru, sambungan Firebase, data jadwal
- `online/firestore.rules`: aturan keamanan (alamat admin diisi saat dipasang)
