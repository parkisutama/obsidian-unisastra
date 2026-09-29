# Troubleshoot Unisastra

Dokumen ini membantu pengguna plugin mengecek masalah umum di Obsidian.

## Plugin tidak muncul setelah install

Cek hal berikut:

- folder plugin berada di `<vault>/.obsidian/plugins/unisastra/`,
- folder berisi `main.js`, `manifest.json`, dan `styles.css`,
- Community plugins sudah diaktifkan di Obsidian,
- Obsidian sudah direload setelah file plugin disalin.

## Plugin muncul tetapi tidak bisa diaktifkan

Cek:

- versi Obsidian memenuhi `minAppVersion` di `manifest.json`,
- semua aset release berasal dari versi yang sama,
- tidak ada file lama dari versi sebelumnya yang tertinggal di folder plugin.

Jika perlu, hapus folder `unisastra`, install ulang dari release terbaru, lalu
reload Obsidian.

## Perubahan visual tidak terlihat

Coba langkah berikut:

1. Pastikan fitur terkait sudah di-enable di pengaturan Unisastra.
2. Reload Obsidian.
3. Nonaktifkan sementara snippet CSS atau theme yang mungkin menimpa style
   editor.
4. Coba di vault kecil atau vault test untuk memastikan konflik berasal dari
   konfigurasi vault.

## GitHub-style anchor tidak menuju heading

Cek:

- link memakai format heading anchor yang benar,
- heading target ada di file yang sama atau file tujuan,
- duplicate heading memakai suffix seperti `-1` sesuai gaya GitHub,
- link tidak berada di format yang diproses plugin lain sebelum Unisastra.

## Floating toolbar tidak muncul atau dock menutupi status bar

Cek:

- **Enable floating toolbar** aktif di tab Toolbar, dan platform saat ini
  bukan mobile,
- file aktif dalam Source mode (bukan Reading Mode/Live Preview rendered),
  bukan popout tanpa editor aktif, dan bukan file dengan frontmatter
  `unisastra: false`,
- Hemingway mode nonaktif — toolbar disembunyikan selama Hemingway aktif,
- untuk mode dock: dock auto-hide saat Anda mengetik dan muncul kembali saat
  pointer masuk ke area dock (peek); aktifkan **Always show dock** bila Anda
  ingin dock selalu terlihat,
- di window sempit, dock menyusut (wrap) alih-alih meluber ke luar viewport;
  jika theme/snippet memindahkan status bar, dock tetap mengukur tinggi
  `.status-bar` saat ini untuk menghindari tumpang tindih — laporkan bug bila
  masih tertutupi pada theme tertentu.

## Callout dari theme atau snippet tidak ditemukan

Di tab Callouts, gunakan **Discover callouts from CSS** untuk melihat kandidat,
kemudian **Add** untuk menyimpan ID yang dipilih. Refresh dan perubahan CSS hanya
memperbarui daftar kandidat; konfigurasi yang sudah tersimpan tetap dipertahankan.
Scan hanya membaca selector literal `data-callout`, termasuk nested rules, dengan
batas 64 stylesheet, 2000 rules, dan kedalaman 8. Stylesheet yang tidak dapat
dibaca atau batas traversal menghasilkan status parsial. Selector conditional
bisa ditemukan walaupun tampilannya tidak aktif pada theme saat ini.
Nama sumber memakai URL stylesheet bila tersedia; label `CSS source` tidak
menjamin identitas theme/snippet. Jika ID tidak ditemukan, gunakan **Add custom
callout** secara manual. Discovery tidak menyalin warna atau ikon dari CSS.

## Laporkan bug

Saat melaporkan bug, sertakan:

- versi Unisastra,
- versi Obsidian,
- sistem operasi,
- langkah reproduksi,
- expected behavior,
- actual behavior,
- screenshot atau sample Markdown jika relevan.
