# Plan: block ID dan fold persistence

Status: Accepted melalui "lanjut ke task breakdown", 2026-09-27.
Kebutuhan: [spec accepted](./spec.md), termasuk D1–D6 dan scope awal.
[Task breakdown](./tasks.md) accepted dan implementasi berlangsung.
Revisi asal fold mengikuti keputusan maintainer dalam
[ADR-004](../../en/reference/decisions/ADR-004-fold-native-effects.md).

## Baseline dan bukti

- Checkout tetap `codex/sidebar-equal-resize`, HEAD `60d81d9`, dengan perubahan
  sidebar/performa yang belum di-commit. Pertahankan seluruh diff tersebut.
- `src/cm6/outliner/fold-persist.ts` belum terhubung dan tidak membaca fold state
  aktual. Implementasinya harus diganti, bukan langsung diregistrasikan.
- `src/cm6/outliner/block-id.ts` dipakai command manual; helper hide belum aktif.
  Jalur command existing harus tetap tersedia sesuai D1.
- Package CM6 terpasang menyediakan `foldEffect`, `unfoldEffect`, `foldedRanges`,
  `foldState`, dan `foldable`. Build meng-externalize `@codemirror/language/state/view`,
  sehingga produksi menggunakan modul host dan bukan salinan CM6 tersendiri.
- Probe state sintetis memakai `foldState`, foldEffect dan unfoldEffect pada list
  ber-ID: fold range muncul lalu hilang; teks dan selection tetap sama.
  Bukti ini hanya untuk package lokal. Native Obsidian dan HyperMD belum diverifikasi.
- `editorInfoField` tersedia di typings Obsidian untuk identitas file editor.
  List service existing mengenali node HyperMD; kesiapan parser harus diperiksa
  sebelum capture/restore, bukan diganti regex list yang mengabaikan fenced code.

## Aktivasi dan compatibility

Matriks wiring yang disetujui bersama plan:

| Behavior | Gate |
| --- | --- |
| Generate/copy link/embed manual | Command existing tetap tersedia; jangan tambah master-toggle restriction |
| Hide suffix ID | Plugin/platform/frontmatter enabled, master block ID + hide enabled, Live Preview, list item valid |
| Auto-generate on fold | Plugin/platform/frontmatter enabled, master block ID + auto-generate enabled, editor writable, Hemingway tidak melarang write |
| Capture/restore fold | Plugin/platform/frontmatter enabled dan persist enabled; hanya item dengan ID unik |

Persist tidak membuat ID dan tidak bergantung pada auto-generate. Master block ID
mengendalikan behavior block-ID otomatis; gate persist tersendiri menjaga manfaat
persist untuk pengguna yang membuat ID secara manual. Matriks ini accepted
sebagai rencana, belum diimplementasikan.

Pertahankan settings keys/defaults, command IDs, `^id`, map foldState existing,
dan CSS compatibility hooks. Default tetap opt-in. Jangan mengubah collapse state
sidebar. Tidak menambah dependency runtime atau mengaktifkan dukungan editor yang
belum dapat dipetakan ke file secara aman.

## Modul dan aliran data

| Area | Tanggung jawab |
| --- | --- |
| `src/cm6/outliner/block-id.ts` | Pure ID parsing/uniqueness helpers, insert command existing, decoration builder dengan gate mode/selection |
| `src/cm6/outliner/fold-persist.ts` | CM6 ViewPlugin: baca effects/state, owner-window scheduling, lifecycle dan dispatch restore |
| Helper di `src/cm6/outliner/` bila perlu | Mapping ID → item/range dan normalisasi snapshot; pure functions yang dapat diuji |
| Feature fold-persist / coordinator | Snapshot terbaru per file, revision, debounce persistence, rename/delete, error handling |
| `src/lib.ts` | Composition/register extension dan lifecycle coordinator; tidak berisi algoritma parsing/fold |
| Settings features | Mengubah state/gate dan reconfigure extension; tidak menulis Markdown langsung |
| `tests/`, `scripts/` | Real CM6 effects tests, browser fixtures dan native diagnostic probe yang tidak membaca catatan pribadi |

Editor event → identitas file + epoch view → fold snapshot murni → revision
per file → latest snapshot coordinator → persist jika berubah. Restore membaca
snapshot saat editor siap dan dispatch effects dalam satu transaction berlabel
internal, tanpa mengubah selection dan tanpa memicu auto-ID/capture rekursif.

## Tahapan implementasi

### F01 — verifikasi kontrak native dan test seams

Gunakan fixture sintetis dalam lingkungan test yang diotorisasi. Rekam versi
Obsidian/installer/CM6, Source/Live Preview, root/nested list, gutter fold,
command fold/unfold, reopen dan undo. Verifikasi field/effect identity host,
semantik foldable dan source editorInfoField, tanpa memodifikasi vault operasional.

Uji khusus asal fold: efek restore sendiri diberi annotation agar diabaikan.
Jangan menganggap setiap effect berbentuk from/to sebagai fold.
Probe native tidak membedakan pengguna dari plugin lain; maintainer menyetujui
semua fold native sebagai pemicu opt-in, kecuali restore internal dan undo/redo.
Mapping karena edit tanpa foldEffect bukan pemicu insertion.

Keluaran: kontrak adapter dan matriks versi yang benar-benar diverifikasi, fixture
efek host, serta daftar gate unsupported. Jika API privat diperlukan, buat ADR
Proposed dengan fallback sebelum implementasi terkait. Jangan menambah version
guard arbitrer hanya karena satu versi diuji.

### F02 — ID dan hide decoration (B01, B06)

Pertahankan command manual. Pastikan generator menghindari ID yang sudah ada
dalam file dan memiliki retry terbatas; suffix ID existing tidak diganti.
Build dekorasi hanya di visible ranges dan item list valid; Source/Reading Mode
tidak mendapat replacement. Selection yang menyentuh ID tetap bisa diedit dengan
perilaku yang konsisten, menggunakan test caret/undo/scroll/mode switch.

Reconfigure menghapus dekorasi saat gate mati. Hindari pemindaian seluruh file
untuk dekorasi atau pada setiap pengetikan; collision scan hanya ketika insertion
benar-benar diminta. Auto-generation mengabaikan existing duplicate ID.

### F03 — capture state per file (B03, B05, B07)

Gunakan foldEffect/unfoldEffect identity dan foldedRanges, ditambah perubahan
range yang relevan. Map ke item list HyperMD ber-ID unik. Track nested folds
sebagai state item yang independen; collapse parent tidak menghapus intent child.
Semantik nested nyata ditentukan F01 dan diuji sebelum persist diaktifkan.

Snapshot menangkap path/file identity saat event, bukan getActiveFile saat timeout.
Revision per file ditetapkan ketika aksi terjadi; debounce lama tidak bisa
menimpa aksi baru pane lain. Fold native terbaru menjadi acuan hanya untuk reopen;
tidak dispatch ke pane lain. Capture state false diperlukan agar unfold tersimpan.

Coalesce write per file, skip snapshot sama, dan serialisasi write settings agar
write lama tidak selesai setelah write baru. Jangan memanggil global updateOptions
untuk persist fold yang tidak mengubah setting UI. Evaluasi pemisahan persist-only
di composition; jika mengubah API publik/dependency direction, dokumentasikan ADR
lebih dulu. Kegagalan write dilaporkan; in-memory state jangan dianggap durable.

### F04 — restore dan lifecycle (B04, B05, B06)

Tunggu file identity dan parser siap melalui event yang relevan dengan retry
terbatas yang dapat dibatalkan. Hindari timer polling permanen. Resolve ID unik
dan foldable range pada document terkini, lalu batch fold/unfold effects untuk
item yang tersimpan. Missing/ambiguous ID dilewati, tidak diperbaiki lewat text write.

Gunakan epoch editor/file sebelum dispatch; jika pengguna sudah mengubah fold
setelah open, restore tertunda tidak boleh menimpa aksi tersebut. Simpan cursor
dan scroll, jangan memakai selection sebagai perantara fold. Native scroll akibat
range collapse perlu QA; jangan menambahkan recenter otomatis.

Rename memindahkan key serta pending revision; delete membatalkan pending write
dan menghapus state. Path lama yang segera dipakai file baru tidak boleh menerima
state stale. Disable/unload membatalkan pekerjaan dan mempertahankan fold/ID saat
itu sesuai D4; snapshot yang sudah tercatat di memori tetap ada, pending callback
tidak boleh persist sesudah disposal.

### F05 — auto-ID pada fold native dan undo (B02, D6)

Setelah F01/F02/F04, hubungkan fold native item tanpa ID ke insertion opt-in.
Jangan dispatch rekursif di CM6 update; jadwalkan transaction yang revalidate
file, range, gate dan content revision, atau gunakan transaction composition
yang didukung host. Map fold range setelah insertion dengan ChangeDesc sehingga
fold tetap menunjuk subtree yang benar.

ID insertion satu undoable action. Annotation internal memisahkan restore dan
auto-ID dari aksi pengguna. Undo yang menghapus ID tidak langsung memicu ID baru;
aksi fold pengguna berikutnya boleh membuat ID baru ketika opsi masih aktif.
Uji redo dan batch fold; jangan menggabungkan seluruh aktivitas pengguna menjadi
satu undo group atau memotong pending input editor.

### F06 — integrasi, QA dan dokumentasi

Checkpoint setelah F02/F03 dan F04/F05: targeted tests + `pnpm run check`.
Gate akhir `pnpm run check:ci`, browser fixture, dependency-direction review, dan
native QA desktop/popout/mobile yang tersedia. Update spec→tasks→test evidence,
current state, baseline, user docs, CHANGELOG existing. Deployment/commit/release
tetap memerlukan otorisasi sesuai scope.

## Dependency dan risiko

F01 → F02 → F03 → F04 → F05 → F06. F01 adalah gate compatibility sebelum
menulis Markdown otomatis; tidak dilewati oleh test package CM6 lokal.

Risiko terbesar: API native berbeda, parser parsial, nested fold state,
auto-ID + undo, settings write ordering, dan dua pane satu file. Mitigasi berupa
test efek nyata, epoch/revision, unique ID mapping, bounded retry, dan pemisahan
internal restore annotation. Hindari runtime fallback yang mengganti seluruh
fold state bawaan atau mengubah teks saat bukti tidak cukup.

Alternatif yang ditolak: simpan posisi offset mentah (mudah stale), nama file
aktif saat debounce (salah pane), capture semua effect from/to (false positive),
restore lewat pemindahan selection (mengganggu cursor), auto-ID seluruh vault
(di luar opt-in per aksi), dan aktivasi helper lama tanpa pengujian.

## Acceptance plan

| Lapisan | Bukti minimum |
| --- | --- |
| Unit/pure | Unique/missing/duplicate IDs, malformed legacy map, ID collision, latest revision, rename/delete, unchanged snapshot skip |
| CM6 | Actual fold/unfold effects, nested ranges, mapping edit, cursor tidak berubah, restore annotation, undo/redo, write guard |
| Browser | Live Preview vs Source, caret/selection ID suffix, virtual viewport, lifecycle observers/frames, disabled behavior |
| Native | Gutter/commands/fold-all, reopen, nested folds, multi-pane conflict, popout/mobile, plugin disable/unload |
| Regression | Manual generate/copy/embed, outliner focus/list editing, restore cursor, Hemingway, whitespace, performance budgets dan sidebar |

Target deterministik: nol Markdown write pada hide/restore, nol callback setelah
disposal, nol polling idle, dan persist hanya setelah state relevan berubah.
Wall-clock/heap dicatat sebagai evidence lingkungan, bukan angka rekaan untuk gate.

## Gate berikutnya

Maintainer menyetujui pendekatan F01–F06, matriks aktivasi, dan risiko di atas.
Review [task breakdown](./tasks.md) dengan acceptance/test/docs per slice
sebelum IMPLEMENT. Native fixture yang belum tersedia dicatat
sebagai kebutuhan lingkungan, bukan alasan untuk mengasumsikan API host bekerja.
