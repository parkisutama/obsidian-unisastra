# Sinkronisasi lebar sidebar

- Tanggal: 2026-09-27.
- Branch: `codex/sidebar-equal-resize`.
- Status: Accepted oleh maintainer pada 2026-09-27; implementasi dan bukti
  validasi dilacak di [tasks](./tasks.md), acceptance native masih terbuka.
- Sumber kebutuhan: deskripsi dan kriteria penerimaan maintainer dalam chat.

## Masalah dan tujuan

Pengguna Obsidian desktop perlu menyesuaikan dua sidebar secara terpisah
untuk mendapatkan ruang navigasi dan membaca yang seimbang. Fitur ini membuat
satu tindakan resize cukup untuk mengatur kedua sidebar utama ketika keduanya
terbuka, tanpa mengunci ruang menulis di tengah.

Sebagai pengguna MD Writer, saya ingin menyeret sidebar kiri atau kanan dan
melihat sisi lainnya langsung mengikuti, sehingga kenyamanan membaca dapat
disesuaikan melalui pengamatan langsung.

Keberhasilan diukur melalui skenario acceptance di bawah, bukan telemetry:
resize langsung selama drag, kesamaan lebar render dalam toleransi subpiksel,
serta tidak adanya perubahan pada sidebar tertutup.

## Konteks implementasi saat ini

Inspeksi checkout menemukan registry General di
`src/capabilities/features/general/index.ts`, pola toggle pada
`src/capabilities/base/feature-toggle.ts`, model/default/migrasi settings di
`src/capabilities/settings.ts`, serta komposisi General pada
`src/components/settings-tab.ts`. Test settings dan navigasi berada di
`tests/settings.test.ts` dan `tests/settings-navigation.test.ts`.

Sinkronisasi lebar sidebar belum terdaftar pada registry tersebut.
Penambahan harus mengikuti struktur capabilities dan lifecycle existing.
Inspeksi ini bukan bukti tersedianya API resize atau acceptance host.

## Scope dan pengaturan

Semua requirement dalam spec ini wajib untuk cakupan awal.

- Pengaturan bernama **Sinkronkan lebar sidebar**, default nonaktif.
- Ditempatkan pada General di pengaturan MD Writer yang sudah ada.
- Nilai toggle disimpan melalui mekanisme settings plugin existing.
- Berlaku pada sidebar utama kiri dan kanan di jendela utama Obsidian desktop.
- Saat nonaktif, kendali resize mengikuti perilaku bawaan Obsidian.
- Antarmuka mobile dan panel yang dibagi di area tengah tidak termasuk scope.
- Tidak menambahkan sinkronisasi panel popout atau antarjendela.
- Tidak mengunci lebar panel tengah, mengubah readable line length, atau
  mencegah teks membungkus ulang.
- Snippet CSS yang memaksa lebar sidebar perlu dinonaktifkan pengguna bila
  bertentangan; plugin tidak mengedit snippet secara otomatis.

## Perilaku wajib

| ID | Kondisi | Hasil |
| --- | --- | --- |
| R01 | Kedua sidebar terbuka; salah satunya diseret | Sisi lain mengikuti lebar sisi yang diseret secara langsung, sebelum drag dilepas. |
| R02 | Hanya satu sidebar terbuka | Resize bebas; lebar tersimpan sidebar tertutup tidak berubah. |
| R03 | Sidebar kedua dibuka | Sidebar yang sebelumnya terbuka mengikuti lebar sidebar yang baru dibuka; sinkronisasi kemudian aktif kembali. |
| R04 | Salah satu sidebar ditutup | Sinkronisasi berhenti sementara; sidebar yang masih terbuka mempertahankan lebarnya. |
| R05 | Kedua sidebar tertutup | Tidak ada penyesuaian lebar. |
| R06 | Toggle diaktifkan ketika keduanya terbuka | Gunakan rata-rata lebar kedua sidebar saat itu sebagai target bersama, dengan tetap menghormati batas Obsidian. |
| R07 | Toggle dinonaktifkan | Sinkronisasi berhenti tanpa mengembalikan ukuran sebelumnya. |
| R08 | Plugin dinonaktifkan | Semua kendali resize kembali kepada Obsidian; tidak ada sinkronisasi tertinggal. |

Contoh: kiri terbuka 320px, kanan dibuka dengan lebar tersimpan 380px.
Kiri mengikuti menjadi 380px. Drag kiri ke 340px membuat keduanya 340px.
Contoh aktivasi: kiri 320px dan kanan 380px menghasilkan target 350px.

Panel tengah memakai ruang tersisa. Bila teks terlalu banyak membungkus,
pengguna dapat memperkecil salah satu sidebar dan sisi lainnya mengikuti.

### Koreksi bug batas gabungan — 2026-09-27

Laporan sidebar membesar hingga tidak bisa diperkecil menunjukkan bahwa batas
native per sisi tidak cukup untuk operasi yang menulis kedua sisi sekaligus.
Target bersama dibatasi ke 40% dari lebar terkecil antara workspace dan viewport,
sehingga kedua sidebar bersama tidak melebihi 80% area yang tersedia.
Ini batas keselamatan proporsional, bukan lebar tetap atau pengaturan readable line length panel tengah.
Minimum native dan batas CSS tetap dihormati; jika tidak ada target yang feasible,
sinkronisasi ditangguhkan dan pengguna dapat memperbesar jendela atau menutup satu sisi.
Ukuran tersimpan ekstrem harus ter-clamp saat aktivasi dan drag harus tetap bisa mengecil.

## Kriteria penerimaan

| ID | Skenario dan bukti yang dibutuhkan |
| --- | --- |
| AC01 | Instalasi/settings lama tanpa key baru menghasilkan toggle nonaktif; settings lama tetap utuh. |
| AC02 | Dengan kedua sisi terbuka, drag kiri dan drag kanan masing-masing menghasilkan pembaruan sisi lain selama gerakan, tanpa menunggu pelepasan pointer. |
| AC03 | Membuka sidebar kedua menjadikan lebar sidebar baru sebagai acuan. Animasi buka/tutup tidak ditafsirkan sebagai drag atau menimbulkan lonjakan ukuran. |
| AC04 | Resize satu sisi ketika sisi lain tertutup tidak mengubah lebar tersimpan sisi tertutup dan tidak membukanya. |
| AC05 | Menutup salah satu sisi mempertahankan lebar sisi yang tersisa; kedua sisi tertutup tidak memicu penyesuaian. |
| AC06 | Aktivasi dengan kedua sisi terbuka memakai rata-rata; nilai render akhir sama dalam toleransi pembulatan subpiksel. |
| AC07 | Tidak ada umpan balik berulang, kedipan, atau gangguan pegangan resize; kedua sisi tetap sama lebar dalam rentang ukuran yang diizinkan Obsidian. |
| AC08 | Batas ukuran native tetap dihormati, termasuk saat ruang jendela terbatas. |
| AC09 | Mematikan toggle atau plugin menghentikan sinkronisasi dan callback tertunda, tanpa memulihkan ukuran lama. |
| AC10 | Area tengah, Markdown, selection, folding, readable line length, mobile, dan popout tidak mendapat perubahan perilaku dari fitur ini. |

Test otomatis harus mencakup keputusan sinkronisasi, transisi visibility,
pencegahan feedback, default/settings, dan cleanup. Pengujian Obsidian nyata
tetap diperlukan untuk animasi, drag, batas native, tema, dan ukuran render.
Gate otomatis yang lolos tidak menggantikan acceptance runtime tersebut.

## Kontrak kompatibilitas

Pertahankan plugin ID `md-writer`, command IDs, settings lama, frontmatter,
Markdown block IDs, dan CSS compatibility classes. Tidak ada perubahan file
vault atau deployment tersirat. Setting baru bersifat additive dan default off;
nama key serta pendekatan lifecycle ditetapkan pada plan dan ADR sebelum kode.
Manifest dukungan mobile tetap dipertahankan meskipun fitur ini desktop-only.

## Hal yang perlu diselesaikan pada plan

- Engineering: verifikasi cara membaca/menyetel ukuran dan batas sidebar
  native serta membedakan drag dari animasi buka/tutup.
- Engineering: tetapkan toleransi numerik subpiksel untuk pemeriksaan render.
- Engineering: jelaskan startup dengan toggle tersimpan aktif, pembukaan kedua
  sidebar bersamaan, dan perubahan ukuran jendela.
- Engineering/maintainer: bila batas native membuat lebar bersama mustahil,
  paparkan fallback untuk divalidasi; jangan mengabaikan batas Obsidian.

Tidak ada deadline yang ditentukan. Spec disetujui melalui pesan
"Spec disetujui". Tahap berikutnya adalah validasi [plan](./plan.md) beserta
ADR, TASKS, dan implementasi sesuai
[workflow aktif](https://github.com/parkisutama/obsidian-univeritas/blob/main/docs/unisastra/en/for-developers/ai-assisted-development.md).
