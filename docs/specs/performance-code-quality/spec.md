# Spec: performa dan kerapian kode lintas fitur

Status: Accepted untuk R1–R7/R9 melalui instruksi "oke implementasikan",
2026-09-27. Keputusan produk R8 tetap terbuka. Hasil implementasi dan batas
verifikasi berada di tasks; acceptance spec tidak berarti native QA sudah selesai.

- Bukti: [audit 2026-09-27](../../development-status.md).
- Pendekatan: [plan](./plan.md).
- Pelaksanaan dan acceptance: [tasks](./tasks.md).
- Kontrak existing: [current state](../../current-state.md) dan
  [architecture baseline](../../en/reference/code-architecture-baseline.md).

## Masalah dan pengguna

Pengguna MD Writer membutuhkan drafting, whitespace-aware editing, dan navigasi
outliner yang tetap responsif setelah berulang kali membuka editor, berpindah
pane, dan mengganti preset. Audit menemukan observer yang bertahan setelah
editor ditutup serta pekerjaan persistence/render yang berulang tanpa perubahan
hasil. Masalah tersebut menambah biaya sesi panjang dan menyulitkan pemeliharaan.

Probe source terisolasi menunjukkan 50 observer aktif setelah 50 siklus
create/destroy. Baseline otomatis lulus 29 files / 193 tests; ini bukan bukti
bahwa CPU, FPS, dan heap native sudah baik. Temuan lain bersumber dari source
dan masih membutuhkan regression test atau profil host, sesuai ledger audit.

## Tujuan dan cerita pengguna

- Sebagai penulis, saya dapat membuka/menutup editor dan mematikan fitur tanpa
  callback lama mengubah editor atau tab sesudahnya.
- Sebagai pengguna preset, saya mendapat seluruh state preset secara konsisten
  dengan satu penyimpanan akhir, tanpa refresh berulang untuk setiap toggle.
- Sebagai pengguna toolbar/outline, saya mendapat tampilan terkini tanpa rebuild
  untuk event yang tidak relevan dan tanpa hasil render lama menimpa konteks baru.
- Sebagai maintainer, saya dapat menelusuri pemilik observer, timer, listener,
  dan render child component serta membuktikan cleanup melalui tests.

## Cakupan dan prioritas

Must-have: R1–R7 dan regression sweep R9. R8 adalah keputusan terpisah yang
harus dicatat; mengaktifkan behavior block ID/fold yang belum tersambung bukan
refactor mekanis. Nomor R berikut adalah requirement, bukan tingkat severity.

| ID | Kebutuhan dan acceptance |
| --- | --- |
| R1 | Editor memiliki ownership observer/listener/RAF yang eksplisit. Setelah 50 siklus create/destroy, resource aktif kembali ke baseline; drain callback tidak menulis DOM, dispatch, atau persist untuk editor yang sudah dihancurkan. Embedded Markdown tetap menerima props dan popout memakai owner document/window. |
| R2 | Disable/unload MonoNote membatalkan kedua fase delay; tidak ada detach, history navigation, focus, atau ephemeral-state write sesudahnya. Disable/re-enable tidak menghidupkan callback generasi lama; promise selesai dan Set in-flight bersih. |
| R3 | Hemingway melepas listener dari document tempat listener dipasang. Toggle berulang tidak menduplikasi listener; pindah/popout-close/unload tidak meninggalkan listener atau memperluas cakupan key blocking yang sudah ada. |
| R4 | Satu aktivasi preset melalui settings maupun command menghasilkan satu saveData dan satu refresh akhir setelah seluruh nilai diterapkan. Toggle tunggal tetap menyimpan. Preset none tetap hanya melepas pilihan preset tanpa membatalkan state fitur. Kegagalan save dilaporkan dan tidak dianggap tersimpan; perubahan berikutnya tetap dapat disimpan. |
| R5 | Toolbar disabled tidak menjadwalkan render atau tick dari perubahan editor. Jika tidak ada display waktu yang terlihat, tidak ada tick berkala khusus display; elapsed time tetap dihitung dari timestamp dan hide/show tidak reset timer. Unchanged HUD tidak dibuat ulang. Burst event dalam satu document menghasilkan paling banyak satu pending render frame. Command palette tetap mengikuti guard/action existing meski toolbar UI mati. |
| R6 | GFM disabled tidak menjadwalkan RAF rewrite dari update editor. Selection-only tanpa perubahan DOM anchor tidak memicu scan penuh. Anchor baru/berubah, viewport, source path, metadata target dan enable kembali tetap menghasilkan link benar. Cleanup membatalkan pekerjaan pada owner window; navigation/hover/Reading Mode tetap kompatibel. |
| R7 | Metadata file yang tidak relevan tidak membangun ulang outline. Perubahan active row saja tidak merender ulang seluruh Markdown. Saat source berubah atau view ditutup, render lama tidak mempublikasikan hasil, mengubah state shared, atau menahan child component. Navigasi, task toggle, collapse, filter, focus, guide dan keyboard behavior tetap sama. |
| R8 | Tiga gap dicatat eksplisit: hide block IDs, auto-generate on fold, fold persistence. Maintainer memilih implementasi terpisah atau penjelasan status UI/docs. Tidak menghapus settings keys atau menghubungkan helper fold yang tidak membaca fold state aktual. |
| R9 | Seluruh kelompok fitur pada matriks audit tetap tercakup dalam regression sweep; identifier/data lama dan perilaku sidebar yang disetujui tetap dipertahankan. Gate otomatis dan native acceptance dilaporkan terpisah. |

## Non-goals dan kompatibilitas

- Tidak menambah mode menulis, mengubah aturan teks/selection/folding, mengubah
  semantik elapsed timer, atau menjanjikan angka FPS tanpa baseline host.
- Tidak memigrasikan arsitektur capabilities/cm6/composition, mengganti framework,
  menambah runtime dependency, atau membuat cleanup kosmetik di seluruh source.
- Tidak menghapus helper/settings legacy hanya karena referensinya sedikit;
  analisis consumer dan keputusan R8 mendahului perubahan.
- Tidak mengubah ID `md-writer`, command IDs, view type, settings keys/defaults,
  frontmatter, block IDs, CSS compatibility hooks, ataupun format Markdown.
- Mobile tetap didukung sesuai kontrak existing. Toolbar dan sidebar desktop-only
  tetap tidak diaktifkan di mobile. Tidak deploy, commit, push, atau release implisit.

Kerapian dinilai dari ownership resource yang terlihat, guard yang konsisten,
pemisahan mutasi state/persist, dan hilangnya duplikasi kerja. Ukuran file atau
jumlah baris berkurang bukan acceptance tersendiri.

## Ukuran keberhasilan dan verifikasi

Gate deterministik utama: resource aktif kembali ke baseline; nol side effect
setelah disposal; satu save/refresh per preset; nol idle tick saat output timer
tersembunyi; nol render toolbar/GFM akibat editor update ketika disabled;
nol rebuild outline untuk metadata yang tidak relevan. Hitung operasi produksi
melalui seam minimal atau browser fixture, jangan menyalin algoritma ke test.

Native profiling mencatat versi Obsidian/OS, plugin lain, theme, ukuran fixture,
jumlah pane, skenario, dan sebelum/sesudah pada konfigurasi yang sama. Gunakan
catatan sintetis untuk 1.000/10.000 baris, outline 100/1.000 node, serta 1/4 pane.
Catat median/p95 waktu update dan long tasks pada sedikitnya tiga pengulangan,
serta retained resource/heap setelah sesi buka-tutup. Angka waktu bersifat
diagnostik sampai baseline disepakati; jangan membuat threshold CI wall-clock
yang bergantung mesin. Peningkatan operation count menjadi gate otomatis.

QA native mencakup desktop utama, dua popout, close window saat callback pending,
mobile untuk fitur yang didukung, dokumen panjang, serta enable/disable plugin.
Belum diuji harus tetap ditulis belum diuji; test fixture tidak menutup gate native.

## Keputusan terbuka dan persetujuan

- D1 — accepted: scope/acceptance R1–R7 dan R9 disetujui melalui "oke implementasikan".
- D2 — resolved: maintainer meminta [spec implementasi R8 terpisah](../block-id-fold-persistence/spec.md).
- D3 — engineering bersama maintainer: memilih versi/perangkat host acceptance
  yang tersedia dan mencatat coverage yang belum tersedia sebelum handover.
- Tidak ada deadline atau estimasi kalender yang ditetapkan. Urutan dependency
  berada di plan; sizing relatif membantu memilih checkpoint, bukan janji durasi.

Validasi spec, plan, dan task dicatat terpisah di tasks. Revisi persetujuan harus
menyebut dokumen atau requirement yang berubah.
