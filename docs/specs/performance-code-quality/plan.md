# Plan: performa dan kerapian kode lintas fitur

Status: Accepted bersama [spec](./spec.md) dan [tasks](./tasks.md) melalui
instruksi maintainer "oke implementasikan", 2026-09-27. R8 tetap membutuhkan
pilihan maintainer; native QA dicatat terpisah dari implementasi.

## Baseline dan batas perubahan

Lanjutkan checkout aktif `codex/sidebar-equal-resize`; pertahankan diff sidebar.
Sebelum implementasi, rekam HEAD, working-tree diff, runtime yang tersedia, dan
baseline tests agar perubahan lama tidak tercampur dalam klaim hasil baru.
Tidak membuat commit atau deployment tanpa otorisasi yang sesuai.

Tetap gunakan composition di `src/lib.ts`, feature lifecycle di capabilities,
CM6 lifecycle di `src/cm6`, dan UI di components. Proposal ini tidak mengubah
dependency direction atau persisted contract sehingga belum membutuhkan ADR baru.
Jika implementasi memerlukan perubahan tersebut, tulis ADR Proposed dan minta
keputusan sebelum slice terkait; ADR-002/003 tetap berlaku.

## Pendekatan per slice

| Slice | Area dan pendekatan | Alternatif / risiko | Sizing |
| --- | --- | --- | --- |
| S1 / R1 | `src/cm6/plugin.ts`: simpan observer/RAF handles dan owner window; disposed guard untuk callback yang sudah terantre; cancel sebelum melepas DOM. Periksa cursor restore RAF juga. | Mulai dari ownership per editor; shared observer per document hanya bila profil membuktikan perlu. Shared registry sekarang menambah risiko props lintas editor. | M |
| S2 / R2–R3 | `general/mononote.ts`: timer handles, generation dan settlement promise; Hemingway: simpan document registrasi, lifecycle window dengan cleanup idempotent. | Jangan memakai activeDocument saat cleanup. Hindari global timer registry lintas fitur yang memperluas coupling. | M |
| S3 / R4 | `feature-toggle.ts`, `writing-modes/active-mode.ts`, command preset dan `lib.ts`: pisahkan apply state dari persist; coordinator preset melakukan satu save/refresh setelah batch. | Audit override toggle dan efek enable/disable dahulu. Jangan debounce semua save secara global karena quit/cursor dan action lain punya kebutuhan berbeda. Jika perlu antrean save, pertahankan ordering dan error propagation. | M |
| S4 / R5 | Toolbar controller/selection bridge/HUD/surface: guard disabled sebelum target scan/schedule; tick hanya untuk output waktu terlihat; pertahankan timestamp; cache hasil label/signature untuk update DOM. | Jangan mengikat command availability ke UI toolbar. Jangan menyimpan target editor melewati async boundary tanpa revalidation. | M |
| S5 / R6 | GFM Live Preview: invalidasi doc/viewport/config dan DOM anchor yang relevan; coalescing per view; owner window; cleanup. Jika observer dibutuhkan, batasi contentDOM dan abaikan mutation sendiri. | Selection bisa mengubah DOM Live Preview; guard selection-only mentah tidak cukup. Perubahan metadata target/source path juga menginvalidasi. Hindari cache slug global tanpa invalidasi. | M |
| S6 / R7 | Outline: pisahkan snapshot model/content dari active-row decoration; filter sumber metadata; generation token untuk async render; render child Component milik satu generasi, unload saat superseded/close. | Simpan hasil/guideRows lokal sampai commit generasi terbaru. Debounce saja tidak menyelesaikan interleaving. Virtualisasi ditunda sampai pengukuran menunjukkan kebutuhan. | L |
| S7 / R8 | Audit consumer settings/helper, tulis opsi mempertahankan dengan penjelasan status atau menyusun spec implementasi fold/block-ID tersendiri. | Jangan mengaktifkan helper sekarang: capture fold state, restore selection, dan write Markdown belum memenuhi kontrak. | S untuk keputusan; implementasi belum diestimasi |
| S8 / R9 | Sweep semua fitur, operation-budget regression, native profiling, docs dan handover. | Runtime host dapat belum tersedia; laporkan gate terbuka, jangan ganti bukti native dengan mock. | M |

## Urutan dan checkpoint

1. Bekukan baseline dan test seams minimal, lalu S1 dan S2.
2. Checkpoint lifecycle: targeted tests + `pnpm run check`, review cleanup desktop/popout.
3. S3 kemudian S4, karena refresh toolbar dipanggil oleh persistence.
4. Checkpoint persistence/render: targeted tests + `pnpm run check`.
5. S5 kemudian S6; S7 dapat dipersiapkan tanpa mengubah behavior kapan pun sesudah baseline.
6. Checkpoint terakhir dan S8: `pnpm run check:ci`, fixtures browser, native QA,
   review dependency direction manual, dokumentasi hasil dan gate tersisa.

Semua tahap berurutan dalam checkout bersama. Independent slice tidak berarti
izin menjalankan agen paralel atau mencampur commit.

## Test dan instrumentasi

- Tulis regression yang gagal pada behavior lama sebelum memperbaiki tiap slice.
- Fake timers/RAF/observer menghitung handle aktif, effect setelah disposal dan
  save/refresh; gunakan real feature/controller methods, bukan duplikasi model.
- Browser fixture menguji DOM mutation, lifecycle child component, anchor yang
  muncul sesudah selection change, dan outline dengan deferred Markdown render.
- Sisipkan instrumentation melalui test seam kecil; penghitung debug tidak
  menjadi polling/logging runtime permanen. File Node/fixture runner di scripts/tests.
- Ukur sebelum/sesudah dengan fixture sama. Gunakan counters untuk assertion CI;
  durasi dan heap native dicatat bersama lingkungan, bukan threshold arbitrer.
- Tests malformed data, save rejection, rapid preset changes, callback queued
  ketika disable, repeated enable, serta window close wajib ada pada slice terkait.

## Regression sweep dan compatibility

| Area | Skenario minimum |
| --- | --- |
| General/cursor/platform | Active vs inactive pane, saved cursor clamp, disable frontmatter, embed, unload |
| Writing modes/focus/Hemingway | Preset berulang, none, fullscreen exit, key blocking dan popout |
| Typewriter/current line/dimming/keep lines | Scroll/selection, panjang paragraf, focused pane, disabled dan mobile |
| Whitespace/max chars | Source/Live Preview, visible ranges, strict break, per-mode settings |
| Outliner/block IDs | Focus boundary, move/indent/select, task/collapse/filter/guide, command manual IDs |
| Toolbar/callouts | Floating/dock, hidden timer/show elapsed, reorder, clipboard stale guard, catalog/style/discovery |
| GFM | Live Preview, Reading Mode, hover/navigation, duplicate heading slug, target metadata change |
| Sidebar | Drag kedua sisi, buka/tutup, disabled/unload, idle budget dan versi adapter existing |

Tidak mengubah perilaku fitur yang belum memiliki temuan terkonfirmasi hanya
untuk menyamakan style. Kode yang disederhanakan harus tetap bisa ditelusuri
ke requirement dan test. Attribution/license notices tetap dipertahankan.

## Dokumentasi dan pemulihan

Tiap slice memperbarui tasks dan development status dengan bukti konkret.
Current state/baseline diperbarui setelah implementasi diverifikasi; panduan
pengguna dan CHANGELOG mengikuti format existing bila perbaikan user-facing.
Tidak mengklaim seluruh fitur shipped ketika R8 atau native acceptance masih terbuka.

Perubahan dibagi per concern untuk review/atomic commit bila diotorisasi.
Jika slice gagal gate, perbaiki sebelum lanjut; jika harus ditunda, isolasi diff
slice tersebut dan pertahankan pekerjaan pengguna/sidebar. Jangan reset working tree.
