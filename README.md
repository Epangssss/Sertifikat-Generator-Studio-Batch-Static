# CetakSertifikat: Studio Batch Static

Aplikasi web statis berbasis HTML5, CSS3, dan Vanilla JavaScript untuk merancang, mengelola data peserta multi-batch, serta mencetak sertifikat dalam resolusi tinggi langsung dari peramban tanpa memerlukan backend atau koneksi server.

---

## Alur Kerja 6 Tahap

Aplikasi ini dirancang dengan antarmuka bertahap (stepper) yang terstruktur dan mudah diikuti:

1. **Upload Template & Pilih Desain**
   - Mendukung unggah template gambar sertifikat mandiri dalam format PNG, JPG, atau JPEG (hingga 10 MB) dengan fitur *drag & drop*.
   - Menyediakan 4 template bawaan siap pakai:
     - *Klasik Bingkai Emas*
     - *Minimalis Modern Navy*
     - *Akademik Formal*
     - *Workshop Kreatif*

2. **Pilih Template & Konfigurasi Kertas**
   - Pengaturan template aktif.
   - Pilihan jenis sertifikat: Penghargaan, Pelatihan, Kelulusan, Kehadiran, dan Kompetisi.
   - Standar ukuran kertas: A4 (297 x 210 mm), Letter (279 x 216 mm), F4/Folio (330 x 215 mm), dan A5 (210 x 148 mm).
   - Orientasi kertas fleksibel: Landscape dan Portrait dengan resolusi render kanvas siap cetak (150 DPI).

3. **Input Data Peserta Berbasis Batch (Batch 1, 2, 3+)**
   - Manajemen peserta terpisah per gelombang atau kelompok (Batch 1, Batch 2, Batch 3, dan tombol tambah batch baru).
   - Tiga metode input data:
     - **Input Manual**: Form cepat nama lengkap dan peran/predikat.
     - **Tabel Data Inline**: Nilai nama dan peran dapat disunting langsung di dalam sel tabel.
     - **Impor CSV**: Unggah file `.csv` atau tempel teks berformat `Nama,Peran`.
   - Disertai data dummy bawaan (3 peserta per batch) untuk mempermudah uji coba awal.

4. **Atur Detail Sertifikat & Fitur Pengaman**
   - Penyesuaian nama lembaga, judul sertifikat, subjudul, keterangan program/kegiatan, dan tanggal terbit.
   - Penomoran otomatis dinamis dengan pola token: `{BATCH}`, `{YYYY}`, dan `{NNN}` (contoh: `CERT/B1/2026/001`).
   - Tanda tangan digital: gambar langsung melalui *signature pad* kanvas atau unggah gambar stempel/tanda tangan PNG transparan.
   - Tipografi nama peserta: pilihan font Serif, Sans-serif, atau Italic, dilengkapi slider ukuran dan posisi vertikal.
   - **Stempel & Kode Verifikasi**: Stempel sudut dengan identitas nomor registrasi peserta.
   - **Watermark Pengaman**: Melindungi sertifikat dari penyalahgunaan dengan teks diagonal yang dapat disesuaikan (contoh: *CONTOH / SALINAN RESMI*) serta pengatur transparansi (*opacity*).

5. **Preview & Validasi Interaktif**
   - Panel pratinjau kanvas *live* di sisi kanan layar yang langsung memperbarui tampilan setiap kali ada perubahan data.
   - Checklist validasi sistem untuk memastikan kelengkapan data (template aktif, peserta tersedia, tanggal, dan nama penandatangan) sebelum proses generate.
   - Navigasi pratinjau per batch dan per peserta (*Sebelumnya* / *Berikutnya*).

6. **Generate & Unduh (Satuan atau ZIP Sekaligus)**
   - Pilihan cakupan ekspor: semua batch sekaligus atau hanya batch yang sedang aktif.
   - Pilihan format berkas: PNG (kualitas tajam) atau JPG (ukuran lebih ringkas).
   - Indikator progres render dengan persentase real-time.
   - Unduh sertifikat satuan per peserta atau unduh seluruh berkas sekaligus dalam satu arsip ZIP.

---

## Keunggulan Teknis

- **100% Client-Side & Privat**: Seluruh proses render kanvas dan pembuatan arsip ZIP diproses langsung di peramban pengguna. Tidak ada data nama peserta atau dokumen yang dikirim ke server luar.
- **Zero External Dependencies**: Kompresor ZIP dibangun menggunakan implementasi murni JavaScript (*ArrayBuffer & DataView*), sehingga aplikasi dapat berjalan secara offline tanpa pustaka eksternal pihak ketiga.
- **Responsif & Aksesibel**: Tata letak fleksibel untuk desktop, tablet, dan ponsel dengan kontras warna memenuhi standar WCAG AA dan dukungan navigasi keyboard.

---

## Struktur Berkas

```text
generate-sertifikat/
|-- index.html     # Halaman utama aplikasi (struktur 6 tahap alur & panel kanvas)
|-- styles.css     # Sistem desain antarmuka (tema kertas & tinta, variabel warna, responsivitas)
|-- app.js         # Logika aplikasi (kanvas renderer, batch state, ZIP builder, event listeners)
`-- README.md      # Panduan dokumentasi proyek
```

---

## Cara Menjalankan

1. Cukup buka berkas `index.html` langsung menggunakan peramban web modern (Google Chrome, Mozilla Firefox, Microsoft Edge, atau Safari).
2. Atau jalankan melalui server lokal sederhana:
   ```bash
   # Menggunakan Python
   python -m http.server 8000
   ```
   Lalu buka tautan `http://localhost:8000` pada peramban Anda.
