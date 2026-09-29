# Usulan rebranding MD Writer menjadi Unisastra

Status: **Keputusan diterima; implementasi lokal berlangsung**. Plugin belum diajukan ke Obsidian Community Plugins dan hanya dipakai maintainer. Lihat [spec](./spec.md), [plan](./plan.md), [tasks](./tasks.md), dan [ADR-005](../../en/reference/decisions/ADR-005-unisastra-identity.md). Repositori GitHub, vault operasional, dan rilis belum diubah.

## Tujuan dan batasan

Unisastra mempertahankan positioning MD Writer yang sekarang: drafting presisi, editing yang peka whitespace, dan navigasi outliner di Obsidian. Perumusan identitas produk baru ditunda; teks yang ada cukup diganti namanya tanpa merancang janji atau fitur baru. Nama, fungsi, dan instruksi instalasi harus konsisten.

Perubahan perilaku editor, penambahan fitur, serta migrasi instalasi dan data vault lama tidak termasuk dalam rebranding ini. Maintainer menerima bahwa konfigurasi, hotkey, dan panel tersimpan dengan identifier lama tidak perlu dipertahankan. Rebranding tetap tidak mengubah isi Markdown vault secara otomatis.

## Peta identitas saat ini

| Area | Nilai atau lokasi saat ini | Dampak jika diubah |
| --- | --- | --- |
| Nama tampilan | `manifest.json`: `MD Writer` | Nama yang terlihat di daftar plugin; kandidat utama untuk `Unisastra`. |
| Identitas Obsidian | `manifest.json`: `md-writer` | Diganti menjadi `unisastra`; tidak disertai migrasi instalasi lama. |
| Paket dan arsip | `package.json`: `md-writer`; installer menyebut `md-writer.zip` | Script build, release, dokumentasi instalasi, dan konsumen artefak perlu diaudit. |
| Repositori | `manifest.json` dan `package.json` semula menunjuk `parkisutama/obsidian-md-writer` | Nama tujuan disepakati: `parkisutama/obsidian-unisastra`. Rename GitHub dilakukan kemudian oleh maintainer. |
| Identifier kode dan vault | Command ID, tipe panel `md-writer-outline`, frontmatter `md-writer: false`, block ID, dan kelas `ptm-*` | Audit masing-masing; identifier bernama lama ikut diselaraskan tanpa janji kompatibilitas vault lama. |
| Konten publik | README, VitePress, panduan pengguna/developer, gambar, deskripsi, changelog | Nama dan pesan produk perlu konsisten; atribusi historis tetap akurat. |

Inventaris ini titik awal. Sebelum implementasi, lakukan pencarian menyeluruh pada source, tests, docs, workflow CI, script build/deploy/release, manifest keluaran, dan dokumentasi eksternal yang dikendalikan maintainer.

## Keputusan maintainer

1. **Identitas produk.** Pakai positioning, audiens, dan uraian fitur MD Writer yang sekarang. Pembahasan identitas produk yang lebih luas ditunda.
2. **Identitas teknis.** Ganti nama tampilan dan ID plugin menjadi `Unisastra` dan `unisastra`. Selaraskan command ID, tipe panel outline, kelas CSS, nama paket, script, dan arsip dengan nama baru agar tidak membingungkan di kemudian hari. Tidak ada persyaratan kompatibilitas dengan identifier lama.
3. **Repositori.** Nama tujuan repo GitHub adalah `parkisutama/obsidian-unisastra`. Metadata dan docs lokal mengarah ke tujuan tersebut; rename GitHub dilakukan kemudian oleh maintainer.
4. **Dokumentasi.** Belum ada URL situs dokumentasi yang diterbitkan untuk dimigrasikan. Namun source VitePress memiliki `base: "/obsidian-md-writer/"` dan route berisi `md-writer`; selaraskan konfigurasi dan path sumber jika situs nantinya dipakai. Jangan membuat pekerjaan redirect situs yang belum ada.
5. **Instalasi pribadi.** Tidak ada migrasi vault, `data.json`, hotkey, workspace, atau snippet lama dalam cakupan. Instalasi `unisastra` diperlakukan sebagai identitas plugin baru.
6. **Nama dan aset.** Pemeriksaan nama dibatasi pada Obsidian Community dan GitHub. Tinjau lisensi aset visual hanya jika aset konkret dipilih; jaga notice dan atribusi kode yang ada.

## Rincian implementasi untuk spec

| Topik | Temuan di checkout | Arah yang disepakati atau pekerjaan spec |
| --- | --- | --- |
| Identitas produk | README dan `manifest.json` menekankan drafting presisi, whitespace, dan outliner. | Ganti nama produk pada teks aktif; pertahankan substansi deskripsi. Tidak perlu merancang tagline, janji, atau hubungan merek `Uni-` sekarang. |
| ID plugin dan perintah | `manifest.json` memakai `md-writer`; command ID terdaftar lewat kelas command. | Ubah ID plugin dan inventaris command ID yang memuat nama lama. Tetapkan peta lama → baru yang konsisten; perbarui tes dan dokumentasi command. |
| Tipe panel | Outline memakai `md-writer-outline`. | Ganti tipe panel ke identitas Unisastra dan uji registrasi, pembukaan, penutupan, serta pemulihan workspace baru. Panel tersimpan dengan tipe lama tidak dimigrasikan. |
| CSS dan konten Markdown | Kode memakai kelas `ptm-*` dan `md-writer-setting`; frontmatter `md-writer: false` dan block ID memengaruhi Markdown. | Selaraskan nama kelas dan key yang mengandung identitas lama, lalu perbarui seluruh referensi source, style, tests, dan docs. Spec perlu menyatakan nilai baru dan dampaknya pada Markdown lama; tidak ada perubahan otomatis pada file vault. |
| Nama internal kode | Kelas dan variabel seperti `TypewriterModeLib` masih mencerminkan riwayat implementasi. | Audit nama internal yang berhubungan dengan identitas plugin. Rename hanya yang membantu konsistensi; jaga pekerjaan refactor terpisah dari perubahan perilaku editor. |
| Artefak dan distribusi | `package.json`, `scripts/dev.ts`, dan workflow release masih memakai `md-writer`; workflow membuat `md-writer.zip`. | Ubah nama paket, folder/zip, script, panduan instalasi, dan pemeriksaan artefak. Tetapkan versi pertama Unisastra sebelum menjalankan proses rilis. |
| Repositori dan dokumentasi | URL repo ada di metadata dan docs; VitePress punya base dan route bernama lama, tetapi tidak ada URL situs docs yang diterbitkan. | Ganti nama repo serta seluruh URL repo aktif. Sesuaikan konfigurasi/path docs sumber untuk nama baru; tidak perlu redirect situs. |
| Aset dan atribusi | Belum ada aset visual kandidat; banner lisensi dan notice kode pihak ketiga masih menyebut MD Writer. | Aset visual boleh ditunda. Perbarui nama produk pada teks aktif tanpa menghapus kredit, lisensi, atau riwayat rilis. |
| Penerimaan runtime | `check:ci` memeriksa kode, build, artefak, dan docs, tetapi bukan perilaku Obsidian native. | Verifikasi plugin baru memuat command, outline, dan CSS di desktop; catat QA mobile/popout sesuai cakupan platform. Tidak ada acceptance migrasi vault lama. |

Peta identifier ditetapkan dalam spec. Versi lokal pertama Unisastra disiapkan sebagai `1.2.0`. Rename repo remote dan rilis tetap langkah terpisah.

## Pemeriksaan nama di Obsidian Community dan GitHub — 2026-09-29

| Calon nama dan produk | Obsidian Community | GitHub |
| --- | --- | --- |
| **Unisastra** untuk MD Writer | [Pencarian Unisastra](https://community.obsidian.md/search?q=Unisastra): 0 hasil. | [Pencarian repository](https://github.com/search?q=Unisastra&type=repositories): 1 kecocokan substring pada `UniSAStratisBlockChainApp`, tidak ada repository bernama persis Unisastra. [Pencarian akun](https://github.com/search?q=Unisastra&type=users): 0 hasil. |
| **Unimian** untuk pengganti Wise View | [Pencarian Unimian](https://community.obsidian.md/search?q=Unimian): 0 hasil. | [Pencarian repository](https://github.com/search?q=Unimian&type=repositories): 0 hasil. [Pencarian akun](https://github.com/search?q=Unimian&type=users): 0 hasil. |
| **Unimoment** untuk plugin Moment yang sedang dikembangkan | [Pencarian Unimoment](https://community.obsidian.md/search?q=Unimoment): 0 hasil. | [Pencarian repository](https://github.com/search?q=Unimoment&type=repositories): 1 kecocokan pada nama jamak `Unimoments---A-secure-college-Exclusive-Photo-Sharing-`, bukan `Unimoment`. [Pencarian akun](https://github.com/search?q=Unimoment&type=users): 0 hasil. |

Ketiganya **kandidat kuat** dalam dua tempat yang ditetapkan maintainer. Hasil pencarian adalah snapshot dan dapat berubah; nama repository atau akun belum dicadangkan dengan membuatnya. Unimian dan Unimoment dicatat sebagai kandidat untuk proyek terpisah, bukan sebagai bagian implementasi rebranding MD Writer. Nama **Unimotion** pada penelusuran sebelumnya adalah salah tangkap dan tidak dipakai sebagai kandidat.

Belum ada logo, ikon, font, ilustrasi, atau aset visual kandidat untuk diaudit dalam rebranding MD Writer. Checkout lokal `D:\repos\obsidian-unimoment` juga belum berisi file gambar, logo, ikon, atau font. `NOTICE.md` di proyek tersebut mencatat rencana adaptasi kode Focus Notes dan status atribusinya; kode yang kelak disalin perlu mempertahankan notice yang diwajibkan. Pemeriksaan lisensi aset visual dilakukan setelah aset dipilih.

## Urutan kerja yang diusulkan setelah keputusan

1. Tulis spec berisi matriks identifier lama → baru, perilaku yang tidak berubah, dan acceptance plugin baru. Validasi dengan maintainer sebelum plan implementasi dan task breakdown.
2. Tulis ADR berstatus Proposed untuk perubahan ID plugin, command ID, tipe panel, key frontmatter, dan kelas CSS; jelaskan secara eksplisit bahwa tidak ada migrasi identifier lama.
3. Inventaris teks dan referensi aktif pada manifest, README, docs, settings UI, source, styles, tests, package, script, workflow CI, serta artefak rilis.
4. Kerjakan perubahan identitas sebagai slice kecil: metadata dan identifier kode, CSS, dokumentasi, lalu pipeline paket dan rilis. Uji tiap slice terhadap fungsi yang relevan.
5. Tetapkan nama repo tujuan; sesuaikan URL repo di source dan dokumentasi. Ubah repo GitHub setelah artefak lokal siap direview, lalu verifikasi remote, tautan, dan alur rilis.
6. Jalankan `pnpm run check:ci`; uji plugin `unisastra` sebagai instalasi baru pada lingkungan uji Obsidian desktop, mobile, dan popout sesuai cakupan yang dipakai. Catat hasil native terpisah dari hasil otomatis.
7. Review changelog, atribusi, dan artefak build. Rilis dan pemasangan ke vault operasional mengikuti otorisasi terpisah.

## Acceptance minimum

- Nama Unisastra dan positioning yang sekarang konsisten pada manifest, UI, README, docs pengguna, dan paket rilis.
- ID plugin, command ID yang relevan, tipe panel, key bernama lama, kelas CSS, nama paket/zip, script, dan referensi repo mengikuti matriks identifier yang disetujui.
- Tidak ada migrasi settings, hotkey, workspace, CSS snippet, atau Markdown lama; diff tidak mengubah isi vault secara otomatis.
- Build dan verifikasi artefak lulus; plugin baru dapat dimuat dan fungsi utama berjalan pada QA native yang dilakukan. Hasil desktop, mobile, dan popout dilaporkan apa adanya.

SPECIFY → PLAN → TASKS sudah dicatat. Implementasi berlangsung di checkout lokal; dokumen ini tidak mengubah repositori GitHub, memasang plugin ke vault, atau menerbitkan Unisastra.
