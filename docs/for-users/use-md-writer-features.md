# Use MD Writer features

Dokumen ini menjelaskan aksi umum pengguna saat memakai MD Writer di Obsidian.

## Buka pengaturan plugin

1. Buka **Settings** di Obsidian.
2. Pilih **Community plugins**.
3. Cari **MD Writer**.
4. Buka pengaturan plugin.

## Pakai typewriter scrolling

Gunakan typewriter scrolling saat Anda ingin baris aktif tetap berada di posisi
yang stabil saat menulis.

Aktivitas umum:

- enable typewriter scrolling,
- atur posisi baris aktif,
- atau gunakan keep lines above and below untuk menjaga konteks di sekitar
  kursor.

## Tampilkan whitespace

Gunakan show whitespace saat Anda ingin melihat spasi, tab, trailing spaces, dan
line break Markdown yang sensitif terhadap format.

Fitur ini berguna untuk:

- membersihkan trailing spaces,
- mengecek strict line break dua spasi,
- menjaga file Markdown tetap rapi untuk Git.

## Fokus pada heading atau list item

Gunakan outliner zoom saat Anda ingin fokus pada satu heading atau list item
beserta child content-nya.

Aktivitas umum:

- zoom ke heading aktif,
- zoom ke list item aktif,
- kembali ke dokumen penuh,
- atau klik bullet jika zoom-on-bullet-click diaktifkan.

## Kurangi distraksi saat menulis

Gunakan fitur berikut sesuai kebutuhan:

- focus dimming untuk meredupkan paragraf atau kalimat lain,
- current line highlighting untuk menonjolkan baris aktif,
- line width untuk menjaga lebar editor,
- writing focus untuk mode menulis fullscreen,
- Hemingway mode untuk menulis maju tanpa mengedit bagian sebelumnya.

## Pakai floating toolbar

Aktifkan **Enable floating toolbar** di tab **Toolbar** untuk menampilkan
toolbar formatting kecil saat Anda menyeleksi teks di Source mode.

Catatan:

- toolbar hanya muncul di desktop; tidak dipasang di mobile,
- aksi **Bold**, **Italic**, **Strikethrough**, **Code**, dan **Highlight**
  membungkus/melepas seleksi dalam satu langkah undo; masing-masing
  membutuhkan seleksi non-kosong,
- aksi **Heading** menyiklus baris tempat kursor berada antara paragraf,
  H1-H4, lalu kembali ke paragraf; heading H5 ke atas tidak diubah,
- aksi **Link** membungkus seleksi menjadi `[teks](url)` atau melepas link
  yang sudah menjadi seluruh seleksi. Placeholder URL `https://` dipakai
  secara default; aktifkan **Smart URL** di tab Toolbar agar Link membaca
  clipboard saat diklik dan memakai isinya jika berupa URL http(s) yang valid
  — clipboard tidak pernah dibaca saat Smart URL nonaktif, dan jika seleksi
  berubah selagi menunggu clipboard, aksi dibatalkan tanpa menulis apa pun,
- dropdown **Callout** membungkus seleksi sebagai callout Obsidian
  (`> [!id]` diikuti isi berprefix `>` per baris, termasuk baris kosong).
  Jika seleksi sudah berupa callout (baris pertama adalah header
  `> [!type]`), memilih tipe baru hanya mengganti tipe tersebut — title,
  fold marker (`+`/`-`), dan kedalaman quote (`>`/`>>`) tetap dipertahankan.
  Seleksi yang memotong header callout di tengah (bukan di baris pertama)
  ditolak dengan penjelasan, bukan diperbaiki diam-diam. Pilihan dropdown
  mengikuti catalog callout yang enabled di tab Callouts (Slice E berikutnya
  akan menambah UI manajemennya; saat ini semua tipe bawaan Obsidian aktif
  secara default),
- toolbar tidak aktif di Reading Mode, saat Hemingway mode menyala, untuk
  multi-selection, atau saat seleksi/baris kursor berada di luar outline
  yang sedang fokus.

Toolbar dapat dipin sebagai dock:

- **Pin toolbar as a dock** memindahkan toolbar dari floating (mengikuti
  seleksi) ke dock tetap di bawah window. Dock biasa auto-hide saat Anda
  mengetik dan muncul kembali (peek) saat pointer masuk ke area dock; Escape
  juga menyembunyikannya,
- **Always show dock** membuat dock selalu terlihat, mengabaikan auto-hide
  saat mengetik, mouse leave, Escape, atau reload settings. Mengaktifkannya
  langsung memilih mode dock; menonaktifkan pin dock saat opsi ini masih
  menyala akan ditolak dengan keterangan — matikan **Always show dock**
  terlebih dahulu.

Timer session dan file tampil sebagai HUD:

- saat toolbar dalam mode dock, HUD tampil di dalam dock itu sendiri; saat
  floating, HUD tampil di status bar Obsidian window utama saja (tidak
  duplikat). Popout window dalam mode floating tidak mendapat HUD karena
  Obsidian tidak menyediakan status bar per popout window untuk plugin,
- **Show session timer** dan **Show file timer** mengatur visibility
  masing-masing; **Session timer prefix** dan **File timer prefix**
  mengatur label yang ditampilkan sebelum waktu,
- timer session dibagikan oleh semua window dan mulai berjalan sejak
  toolbar diaktifkan; klik/aktifkan label session (tombol dengan tooltip)
  untuk mereset session tanpa mereset timer file,
- timer file dihitung per window mengikuti file aktif window itu — berpindah
  file mereset timer, kembali ke file sebelumnya juga mereset (bukan
  melanjutkan), menutup file mengosongkan timer. Waktu idle ikut terhitung
  karena timer berbasis selisih waktu, bukan hitungan detik aktif,
- menyembunyikan HUD (toggle off) tidak mereset timer yang sedang berjalan,
- **Timer update interval (seconds)** mengatur seberapa sering tampilan HUD
  diperbarui, default 1 detik (live). Naikkan nilainya (misalnya 60) untuk
  mengurangi distraksi saat fokus menulis — timer tetap menghitung waktu
  sebenarnya berbasis selisih waktu, hanya tampilan yang diperbarui lebih
  jarang. Nilai dibatasi 1-300 detik; input tidak valid kembali ke 1 detik.

## Pakai GitHub-style heading anchors

MD Writer dapat membuka link heading bergaya GitHub seperti:

```markdown
[Install](#install-md-writer)
```

Fitur ini bekerja saat membaca atau menulis catatan yang juga akan dipakai di
GitHub. MD Writer hanya mengubah perilaku navigasi saat runtime dan tidak
mengubah isi file Markdown.

## Data yang disimpan

MD Writer menyimpan:

- pengaturan plugin,
- riwayat posisi kursor per file.

Vault content dan isi note tidak dikirim keluar oleh fitur ini.
