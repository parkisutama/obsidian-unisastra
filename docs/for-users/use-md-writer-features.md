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
- tombol Bold/Italic/Strikethrough/Code/Highlight/Link memakai ikon pudar
  (warna disamarkan dibanding teks normal, menyala saat hover) dengan
  tooltip nama aksi, mengikuti tampilan minimal Floaty Toolbar asli,
- Bold/Italic/Strikethrough/Code/Highlight membungkus/melepas seleksi dalam
  satu langkah undo; masing-masing membutuhkan seleksi non-kosong,
- dropdown heading (label "P"/"H1"-"H4", menu berisi nama penuh saat
  dibuka) otomatis menunjukkan level heading baris tempat kursor berada;
  memilih level menerapkannya langsung ke baris tersebut. Heading H5 ke
  atas menonaktifkan dropdown (tidak dikelola toolbar),
- aksi **Link** membungkus seleksi menjadi `[teks](url)` atau melepas link
  yang sudah menjadi seluruh seleksi. Placeholder URL `https://` dipakai
  secara default; aktifkan **Smart URL** di tab Toolbar agar Link membaca
  clipboard saat diklik dan memakai isinya jika berupa URL http(s) yang valid
  — clipboard tidak pernah dibaca saat Smart URL nonaktif, dan jika seleksi
  berubah selagi menunggu clipboard, aksi dibatalkan tanpa menulis apa pun,
- dropdown callout (ikon kutip, tooltip "Insert callout") membungkus
  seleksi sebagai callout Obsidian (`> [!id]` diikuti isi berprefix `>`
  per baris, termasuk baris kosong). Jika seleksi sudah berupa callout
  (baris pertama adalah header `> [!type]`), memilih tipe baru hanya
  mengganti tipe tersebut — title, fold marker (`+`/`-`), dan kedalaman
  quote (`>`/`>>`) tetap dipertahankan. Seleksi yang memotong header
  callout di tengah (bukan di baris pertama) ditolak dengan penjelasan,
  bukan diperbaiki diam-diam. Isi menu mengikuti catalog callout yang
  enabled dan urutan di tab **Callouts**; opsi terakhir menu, **Manage
  callouts…**, membuka Settings langsung ke tab tersebut,
- ikon pin di ujung kanan toolbar men-toggle mode dock langsung tanpa
  membuka Settings — sama seperti **Pin toolbar as a dock**, termasuk
  ditolak dengan keterangan bila **Always show dock** masih aktif,
- toolbar tidak aktif di Reading Mode, saat Hemingway mode menyala, untuk
  multi-selection, atau saat seleksi/baris kursor berada di luar outline
  yang sedang fokus.

Urutan tombol dan dropdown (Bold, Italic, Strikethrough, Code, Highlight,
Link, Heading, Callout — pin tidak termasuk, selalu di ujung kanan) dapat
diubah dengan dua cara:

- **long-press** langsung pada item di toolbar (tahan ~0.5 detik) memunculkan
  salinan mengambang yang mengikuti kursor; lepas di atas item lain untuk
  menukar posisi, atau tekan **Escape** untuk membatalkan tanpa mengubah apa
  pun. Menahan cukup lama untuk memulai drag tidak ikut menjalankan aksi
  formatting item tersebut — klik singkat (sebelum threshold) tetap berjalan
  normal,
- tombol panah atas/bawah di tab **Toolbar** pada Settings memindahkan item
  satu posisi setiap klik. Kedua cara memakai pengaturan yang sama, jadi
  reorder dari salah satu langsung terlihat di keduanya.

Menutup jendela atau menonaktifkan toolbar saat drag sedang berlangsung
membatalkan gesture tersebut secara bersih (salinan mengambang dan highlight
target ikut hilang, tanpa timer yang tertinggal); setiap window popout
mempunyai state drag sendiri, tidak saling memengaruhi window lain.

Setiap aksi toolbar juga tersedia lewat Command palette (`Ctrl/Cmd+P`), memakai
executor dan guard yang sama persis dengan tombol toolbar (Reading Mode,
Hemingway, seleksi kosong/multi-range, dan seterusnya menolak dengan pesan
yang sama). Command ID mengikuti Floaty Toolbar asli: `floaty-bold`,
`floaty-italic`, `floaty-strikethrough`, `floaty-inline-code`,
`floaty-highlight`, `floaty-insert-link`, `floaty-heading-1` s.d.
`floaty-heading-4`, `floaty-heading-plain`, serta lima command callout
(`floaty-callout-note`, `-tip`, `-warning`, `-important`, `-caution`) yang
masing-masing menyisipkan marker uppercase-nya sendiri. Command-command ini
tidak muncul di command palette pada mobile atau saat editor aktif bukan CM6
Live Preview/Source. Command **Manage callouts** (baru, bukan dari upstream)
membuka Settings langsung ke tab Callouts dari mana saja, termasuk mobile.

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

Timer session dan file tampil sebagai HUD di status bar Obsidian window
utama saja — tidak lagi ikut ditampilkan di dalam dock, jadi tampilannya
konsisten baik toolbar dalam mode floating maupun dock. Popout window tidak
mendapat HUD karena Obsidian tidak menyediakan status bar per popout window
untuk plugin.

- **Show session timer** dan **Show file timer** di tab Toolbar mengatur
  visibility masing-masing — matikan salah satu atau keduanya bila Anda
  tidak memerlukan timer ini sama sekali; **Session timer prefix** dan
  **File timer prefix** mengatur label yang ditampilkan sebelum waktu,
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

## Kelola catalog callout

Buka tab **Callouts** di pengaturan MD Writer (atau pilih **Manage callouts…**
di dropdown Callout pada toolbar) untuk:

- menyembunyikan/menampilkan tipe callout bawaan Obsidian dari dropdown
  toolbar tanpa menghapusnya secara permanen,
- mereset label tipe bawaan yang sudah Anda ubah kembali ke nama default,
- menambah callout custom dengan ID (huruf kecil, angka, underscore, atau
  hyphen, maksimal 64 karakter) dan label tampilan,
- menghapus callout custom — ini hanya mengubah pengaturan plugin, callout
  yang sudah ada di note lama tidak berubah,
- mengurutkan ulang daftar dengan tombol panah atas/bawah; urutan tersimpan
  dan menentukan urutan pilihan di dropdown toolbar.

Tab ini tersedia di desktop maupun mobile (berbeda dari toolbar yang
desktop-only), menggunakan kontrol standar Obsidian yang dapat dipakai
keyboard maupun sentuhan.

## Output callout dan kompatibilitas GitHub alerts

Tidak ada pilihan Output format terpisah lagi. Menu toolbar callout hanya satu
catalog: setiap tipe yang enabled (bawaan maupun custom) langsung tersedia,
dan memilihnya selalu menyisipkan marker uppercase, misalnya `[!NOTE]` atau
`[!TIP]`. Obsidian membaca tipe callout tanpa membedakan huruf besar/kecil,
jadi uppercase ini tetap tampil sama seperti sebelumnya di Obsidian — sekaligus
menjadi bentuk yang dikenali
[sintaks GitHub alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)
untuk lima tipe dasarnya (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`).
Title, folding, nesting, dan custom ID tetap didukung penuh seperti biasa —
tidak ada lagi mode restriktif yang menolaknya.

**Important** dan **Caution** tersedia sebagai entry catalog sendiri, terpisah
dari Tip dan Warning — bukan sekadar alias yang disembunyikan. Obsidian
menampilkan ikon dan warna yang sama dengan Tip/Warning untuk keduanya (ini
perilaku native Obsidian, bukan styling dari plugin ini), tetapi judul default
yang dirender tetap mengikuti kata yang sebenarnya dipilih — "Important" tetap
terbaca "Important", bukan "Tip" — sehingga keduanya bisa dipilih/disisipkan
secara independen dari toolbar maupun command palette.

Informasi kompatibilitas GitHub muncul di tab **Callouts**, bukan di toolbar:
setiap entry menampilkan keterangan compact "Obsidian only" atau "Obsidian and
GitHub" di bawah ID-nya. Label ini murni informatif — tidak membatasi apa yang
bisa dipilih di toolbar, dan tidak mengubah note lama secara otomatis.

## Atur tampilan callout

Di tab **Callouts**, setiap callout memiliki satu grup konfigurasi seperti
settings Outliner. Preview berada paling atas dan selalu menampilkan ikon,
warna, dan label asli callout tersebut, dengan badan preview berisi `ID: <id>
· Obsidian only` atau `ID: <id> · Obsidian and GitHub` — informasi ini selalu
terlihat, baik saat grup collapsed maupun expanded, jadi tidak ada teks ID
terpisah lagi di sebelahnya. Klik preview untuk expand/collapse form
konfigurasi warna/ikon di bawahnya. Toggle tampil di menu, urutan, dan tombol
reset/save berada di baris yang sama dengan preview. Klik ikon picker (tooltip
**Choose icon**) untuk mencari ikon yang tersedia pada versi
Obsidian saat ini; memilih ikon mengisi ID secara otomatis. Color picker
berdampingan dengan input hex sehingga warna bisa dipilih atau diketik.
Semua kontrol berada di grup callout yang sama. Toggle hanya menyembunyikan pilihan
dari menu toolbar; tampilan callout di note lama tetap berlaku.
Pilih **Inherit** untuk mengikuti tema/snippet, atau **Override** untuk
mengganti warna dan/atau ikon. Warna menerima hex 3 atau 6 digit, misalnya
`#abc` atau `#aabbcc`; ikon memakai ID Lucide yang tersedia di Obsidian,
misalnya `lucide-pencil`. Field kosong tetap mewarisi tampilan tema.
Saat inherit, field menampilkan warna dan ID ikon efektif dari callout yang
dirender bila nilainya dikenali. Nilai tampilan ini tidak otomatis menjadi
override tersimpan; mode tetap inherit sampai Anda mengeditnya. SVG custom tema
tidak ditebak menjadi ID Lucide.
Warna default dibaca dari variabel CSS tema atau warna ikon yang dirender bila
variabel tidak dikenali, sehingga input hex dan picker mengikuti tampilan aktual.
Pengisian default otomatis mempertahankan mode inherit dan tidak menandai
perubahan unsaved. Jika override tidak sengaja sudah tersimpan pada build lama,
gunakan reset di header untuk kembali ke inherit.

Klik ikon **save** (disk) di header entry, sejajar dengan tombol reset, untuk
menerapkan perubahan. Input tidak valid ditolak dan edit warna/ikon otomatis
memilih **Override**. Nilai valid tampil di preview sebelum save; note tetap
memakai style tersimpan. Pilihan **Inherit** mengikuti tema setelah save/reset.
Pengaturan sebelumnya tetap berlaku pada note sampai save berhasil. Tombol
reset (ikon panah putar) di header mengembalikan style ke inherit dan label
built-in ke default; toggle dan urutan tetap dipertahankan. Reset mengembalikan
tampilan ke inherit tanpa mengubah note, tema, atau file snippet. Preview
memakai renderer callout Obsidian dan tema document settings saat ini; buka
kembali tab Callouts untuk merender ulang setelah perubahan tema.

Styling ini membutuhkan MD Writer tetap aktif. Warna/ikon tidak otomatis ikut
ke GitHub atau Publish. Preview selalu memperlihatkan rendering Obsidian,
terlepas dari kompatibilitas GitHub alerts yang tertulis di badge entry.

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
