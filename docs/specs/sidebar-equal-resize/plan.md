# Plan sinkronisasi lebar sidebar

- Status: Accepted oleh maintainer pada 2026-09-27 melalui "oke lanjutkan".
- Tanggal: 2026-09-27.
- Requirement: [spec accepted](./spec.md).
- Keputusan: [ADR-003](../../en/reference/decisions/ADR-003-sidebar-equal-resize.md).

## Bukti dan batas pengetahuan

Tipe lokal `node_modules/obsidian/obsidian.d.ts` mengekspos
`workspace.leftSplit/rightSplit`, `WorkspaceSidedock.collapsed`,
`layout-change`, dan `requestSaveLayout`. Tipe sidebar tidak mengekspos
setter ukuran publik. Referensi upstream adalah
[deklarasi API resmi](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts).
Tidak ada bukti dari inspeksi ini bahwa setter internal menerapkan batas native.

`FeatureToggle` menyediakan persistence dan enable/disable; `src/lib.ts`
memuat features serta memanggil disable pada unload. General activation
existing memakai body class, sehingga controller baru harus memeriksa state
settings secara eksplisit. Vitest berjalan dalam environment Node, bukan host
Obsidian. Pada saat plan disusun belum ada inspeksi runtime; hasil probe
implementasi kini dicatat pada [ledger adapter](./tasks.md#ledger-adapter).

## Pendekatan dan modul

| Area | Perubahan yang direncanakan |
| --- | --- |
| `src/capabilities/settings.ts` | Tambah `general.isSidebarEqualResizeEnabled`, default false pada settings baru dan migrasi legacy; pertahankan nilai tersimpan eksplisit. |
| `src/capabilities/features/general/index.ts` | Registrasi toggle General melalui pola existing. |
| `src/capabilities/features/general/sidebar-equal-resize.ts` | Toggle berlabel "Sinkronkan lebar sidebar"; delegasi lifecycle dan penjelasan desktop-only. |
| `src/capabilities/features/general/sidebar-resize/model.ts` | Model murni untuk visibility, sumber resize, target bersama, tolerance, dan keputusan no-op. |
| `src/capabilities/features/general/sidebar-resize/controller.ts` | Koordinasi event, frame, transisi, verifikasi render, dan cleanup. |
| `src/capabilities/features/general/sidebar-resize/adapter.ts` | Isolasi akses sisi native, handle, logical width, batas ukuran, dan write; runtime capability guards. |
| `src/lib.ts` | Hook refresh setelah settings berubah untuk menghormati activation/platform; tanpa refactor feature lain. |
| `tests/` dan `scripts/` | Unit/controller tests dan fixture browser menggunakan controller produksi; tooling tetap di scripts. |

Tidak menambah dependency runtime, command, preset field, CSS width override,
atau penyimpanan lebar kedua sidebar dalam data plugin. Layout Obsidian tetap
memiliki lebar sidebar; toggle saja yang disimpan plugin.

## Gate investigasi adapter

Sebelum integrasi, verifikasi pada host/test environment Obsidian yang tersedia:

1. Identitas container dan handle kedua sidebar utama, logical expanded width,
   serta perubahan `collapsed` selama animasi.
2. Jalur setter native dan persistence layout, termasuk apakah setter melakukan
   clamp atau clamp justru ada pada handler drag.
3. Batas minimum/maksimum kedua sisi dan pengaruh ukuran workspace terhadapnya.
4. Urutan event pointer, resize, layout-change, serta transition cancellation.

Catat bukti dan versi host di ledger tasks nanti. Jangan menganggap nama field
internal atau nilai batas piksel tertentu sebagai API stabil. Jika kontrak tidak
dapat dibuktikan, hentikan integrasi adapter dan laporkan blocker. Model dan
tests tetap dapat dikerjakan. Tidak deploy ke vault operasional untuk investigasi
tanpa otorisasi. Perubahan pendekatan besar kembali ke validasi maintainer.

## Alur sinkronisasi

- Mulai setelah layout siap. Controller aktif hanya pada desktop, toggle on,
  General activation on, dan platform settings mengizinkan desktop.
- State membedakan disabled, satu/tanpa sidebar, opening/closing, idle bersama,
  dan dragging kiri/kanan. Baca `collapsed` sebagai state logis; lebar render
  sementara selama animasi tidak menjadi sumber ukuran tersimpan.
- Pointer down pada handle native menetapkan sumber drag. Jangan mengambil
  pointer capture, mencegah default, atau menghentikan event native. Pointer
  up/cancel, blur, collapse, disable, dan unload mengakhiri drag.
- ResizeObserver memberi sinyal perubahan geometri; perubahan ukuran sendiri
  bukan bukti drag. Gabungkan pembaruan ke satu requestAnimationFrame, baca
  dahulu lalu tulis. Selama drag, sumber tetap sisi yang dipegang pengguna.
- Saat sidebar kedua membuka, gunakan logical expanded width sisi tersebut
  sebagai target. Bila nilainya tidak dapat dibaca secara aman, tunggu animasi
  selesai sebelum mengukur; jangan menyalin lebar animasi per-frame.
- Transition end/cancel dan pemeriksaan animasi aktual menentukan selesai;
  gunakan fallback terbatas bila event hilang. Jika tetap tidak stabil,
  suspend tanpa loop polling terus-menerus.
- Aktivasi dan startup dengan toggle tersimpan aktif serta dua sisi terbuka
  memakai rata-rata setelah layout stabil. Startup satu/tanpa sisi tidak menulis.
- Jika kedua sisi membuka bersamaan dan urutan tidak teramati, gunakan rata-rata
  logical width; jika urutan jelas, sisi terakhir dibuka menjadi acuan.
- Menutup satu sisi segera membatalkan write tertunda. Setiap write mengecek
  ulang kedua sisi masih terbuka dan generation controller masih sama.
- Resize jendela atau perubahan layout tanpa drag memakai target bersama
  terakhir yang di-clamp ulang pada batas native, setelah geometri stabil.
  Penggantian pasangan sidebar mereset state dan memakai aturan startup.

## Batas, kesamaan render, dan feedback

Hitung irisan rentang valid kedua sisi dari kontrak native yang telah diverifikasi.
Koreksi bug 2026-09-27: maksimum native 80% berlaku pada satu sisi dan tidak aman
bila digandakan. Tambahkan batas bersama `0.8 × min(workspace, viewport) / 2`
per sisi, tanpa membulatkan batas yang terlalu kecil naik ke minimum native.
Viewport menjadi batas independen agar workspace yang membesar karena overflow
tidak menaikkan batas lagi. Window resize turut memicu rekonsiliasi; write memeriksa batas viewport sekali lagi.
Clamp target bersama ke irisan tersebut; jika sisi yang diseret harus dibatasi
lagi untuk kesamaan, terapkan target valid yang sama pada kedua sisi. Jangan
hardcode lebar minimum panel tengah atau mengubah readable line length.

Ukur border-box sidebar yang sepadan dalam CSS pixels. Toleransi usulan adalah
selisih absolut maksimal 0,5 CSS px; logical size dan rendered size harus dibedakan
agar border/padding tidak membuat koreksi terus-menerus. Write di bawah tolerance
menjadi no-op. Simpan expected write dan generation untuk mengenali callback
observer akibat write sendiri; jangan menjadikannya sumber drag baru.

Maksimal satu write per sisi per frame dan satu rekonsiliasi terukur sesudahnya
untuk satu perubahan target. Jika tidak konvergen, hentikan retry hingga input
atau perubahan layout berikutnya; jangan membuat osilasi tanpa batas.

Fallback yang diusulkan: bila irisan kosong, adapter tidak cocok, atau CSS
memaksa hasil berbeda, hentikan sinkronisasi pada kondisi tersebut dan biarkan
native mengendalikan ukuran. Jangan melanggar batas atau memaksa sidebar buka.
Kesamaan lebar tidak diklaim terpenuhi pada keadaan ini; dokumentasikan
keterbatasannya dan beri pemberitahuan singkat sekali per episode incompatibility.

## Lifecycle dan persistence

Enable/disable idempotent. Gunakan document/window milik workspace utama.
Cleanup mencabut listener, EventRef, observers, timeout, dan animation frame;
generation guard menolak callback lama termasuk onLayoutReady yang terlambat.
Tidak memasang listeners atau menulis ukuran pada mobile/popout.

Simpan layout melalui jalur native yang terverifikasi setelah perubahan efektif,
dengan debounce existing; tidak menulis JSON workspace langsung. Jangan memanggil
saveSettings setiap frame. Disable tidak memulihkan ukuran lama dan tidak
meninggalkan CSS constraint atau patch metode native.

## Verifikasi dan risiko

| Bukti | Cakupan |
| --- | --- |
| Unit settings/model | AC01, R01–R08, startup/simultaneous-open, rounding, clamp, impossible-range, no-op. |
| Controller dengan adapter/event/frame palsu | AC02–AC09, callback tertunda, collapse saat drag, observer feedback, re-enable, unsupported adapter, layout replacement. |
| Fixture browser dengan controller produksi | Render border-box, fractional widths, transisi/cancel, resize handle; bukan bukti host native. |
| Obsidian desktop | Semua AC pada drag kiri/kanan, animasi, restart, native bounds, jendela sempit, default theme dan tema pengguna. |
| Mobile/popout | AC10: tidak ada listener/write sidebar baru dan workflow existing tidak berubah. |

Gunakan regression test gagal sebelum behavior implementation. Jalankan targeted
tests dan `pnpm run check` per slice; akhir `pnpm run check:ci` plus review
dependency direction manual. Acceptance native dicatat terpisah, bukan dianggap
lolos dari fixture. Risiko terbesar adalah internal API, clamp di luar setter,
dan urutan event saat animasi; gate adapter mendahului integrasi untuk alasan ini.

Lint awal menemukan 30 link lama rusak pada `docs/README.md`. Perbaikan target
link yang telah dipindah ke `docs/en/` termasuk cleanup dokumentasi yang
diusulkan agar file yang disentuh dapat divalidasi; bukan restrukturisasi docs.

## Dokumentasi dan tahap berikutnya

Setelah implementasi terbukti, update current state, development status,
architecture baseline, user General settings docs, dan CHANGELOG sesuai format
versi existing. Index menautkan spec/plan/ADR; tidak menyebut fitur shipped
sebelum acceptance. Tidak ada commit, merge, push, release, atau deployment
dalam plan ini tanpa otorisasi berikutnya.

Plan dan ADR telah diterima. [Task breakdown](./tasks.md) disusun untuk
validasi sebelum implementasi, dimulai dari pembuktian adapter hingga
QA/docs/acceptance. Persetujuan plan tidak merupakan bukti implementasi.
