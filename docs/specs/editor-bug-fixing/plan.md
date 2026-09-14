# Plan: callout dan Advanced Canvas

- Status: Accepted oleh maintainer pada 2026-09-14; tasks dan implementasi juga
  diotorisasi. Kedua fix selesai dan gejala utama diterima; closed for now
  dengan matrix tambahan deferred sesuai [closure decision](./spec.md#closure-decision--2026-09-14).
- Requirement: [spec](./spec.md). Execution ledger: [tasks](./tasks.md).
- Maintainer meminta artefak gabungan sekarang; draft plan menyertai task agar
  dependency/risiko jelas. Spec dan plan Accepted pada 2026-09-14.

## Rancangan teknis yang direview

### Callout: dim sekali pada widget

Tambahkan mixin khusus rendered callout di `_dim-unfocused.scss`, memakai
`dimmed.dimmed(true)` dan variabel opacity existing. Panggil dari cabang
`apply-dim` yang sudah menangani mode/fokus/pause/first-open dan dari cabang
editor tidak fokus `dim-all`; jangan membuat rule global terpisah yang melewati
kondisi tersebut. `dim-none` tidak meredupkan editor tanpa fokus.

Target adalah `.cm-embed-block.cm-callout` yang tidak menjadi bagian dari wrapper
callout lain yang sudah dimmed; child `.callout` tidak diberi opacity tambahan.
Jika wrapper memuat editor/source aktif, jangan redupkan ancestor aktif tersebut.
Source `.cm-line` tetap memakai rule paragraphs/sentences existing. Verifikasi
active-descendant dan nested DOM pada fixture/host sebelum menetapkan selector;
parent opacity tidak bisa dipulihkan dengan opacity 1 pada child.

Area implementasi utama satu SCSS, tanpa state/extension/settings baru. Reading
Mode dan preview settings tidak termasuk target. Jika DOM nested/embedded tidak
memenuhi asumsi, revisi selector/plan sebelum mengubah semantik active editor.

### Canvas: scope clickable-sizer berdasarkan konteks note

Persempit seluruh rule `_clickable-sizer.scss` (position/z-index serta pseudo)
ke editor note Markdown yang teridentifikasi positif. DOM maintainer E-A06
menunjukkan `.markdown-source-view.mod-cm6` ada pada note dan tidak ada pada card;
atribut `data-type` pada leaf null sehingga tidak dipakai. Scope final memakai
source view tersebut di bawah leaf aktif atau konteks iframe existing. Hindari
`.workspace-leaf.mod-active .cm-sizer` tanpa tipe note dan
`.mod-inside-iframe .cm-sizer` tanpa konteks note yang terbukti.

Frame card dapat menggunakan ownerDocument tersendiri. Selector main-window tidak
bisa membaca ancestor di luar frame; atribut bahasa `templater` tidak dipakai
sebagai pembeda. Bukti source view note/card diberikan sebelum patch; full
embed/popout matrix tetap QA. Saat memeriksa konteks tambahan,
bandingkan DOM note normal, note popout, embed Markdown dan card frame untuk
menentukan positive scope yang didukung. Broad iframe rule harus diganti,
bukan dipertahankan sebagai fallback. Bila note embed yang memerlukan area klik
tidak dapat dibedakan lewat CSS, catat blocker dan review pendekatan penanda
lifecycle; jangan langsung menambahkan JavaScript atau mengklaim embed parity.

Pertahankan 100vh pada konteks note yang valid agar fungsi klik ruang kosong
existing terjaga. Pada card, jangan mengganti dengan fixed height atau hidden
overflow. Tidak ada perubahan extension/CM6 dari diagnosis saat ini.

### Regression checks dan QA

Tidak menambah dependency atau mengganti environment Vitest hanya untuk dua
fix CSS. Gunakan Sass existing untuk mengompilasi actual SCSS dalam fixture
HTML sintetis, lalu jalankan checks dengan browser/host yang tersedia. Fixture
menyertakan note aktif/tidak aktif, wrappers nested, source aktif, list/table,
pause classes dan frame card. Checks menghitung computed/effective opacity
dan pseudo style/scrollHeight; bukan snapshot nama selector.

Untuk Canvas, fixture frame memiliki viewport yang mengikuti ukuran editor:
ulang content edit dan ukur tinggi pada input tetap serta input berkurang.
Fixture memeriksa pengaruh rule MD Writer; tidak dianggap simulasi lengkap
Advanced Canvas. Reproduksi dan acceptance nyata tetap dilakukan maintainer
dengan kedua plugin aktif, tanpa debug override. Jika browser automation tidak
tersedia, checks fixture dijalankan manual dan dicatat sebagai manual regression,
bukan test otomatis Vitest. Tidak ada klaim CI browser coverage tambahan.

Sebelum fix, fixture/host menunjukkan failure; setelah fix, computed opacity
sesuai setting dan pseudo MD Writer tidak berlaku pada card. Test runtime
typing/Backspace/Delete, Enter/multiline, undo/redo/reopen, note kosong/pendek
dan klik area kosong. QA gabungan meliputi desktop/mobile/popout yang tersedia;
unsupported environment diberi N/A beralasan dan gap diberi Pending.

File calon: kedua SCSS; satu fixture/check browser di `tests/fixtures/` atau
helper di `scripts/` sesuai sifatnya; ledger/status/current-state/changelog.
Implementasi tiap slice dipisah agar satu task tidak melewati 5 file.
Jalankan `pnpm run check` pada slice dan `pnpm run check:ci` pada hasil gabungan.

## Approach dan urutan

1. Rekam baseline host/settings dan evidence kedua bug secara reproducible.
2. Callout: reuse mixin/kondisi dimming existing untuk wrapper rendered callout,
   sekali per visual subtree. Source yang sedang diedit tetap memakai semantik
   `.cm-line` existing. Periksa nested wrappers dan active descendant sebelum
   memutuskan selector final; hindari selector `.callout` global yang menyentuh
   Reading Mode/settings preview. CSS adalah kandidat utama, bukan kewajiban
   jika bukti lanjutan menunjukkan kebutuhan state editor.
3. Canvas: E-A02–E-A05 mengisolasi CSS `.cm-sizer::before` pada dokumen card:
   scrollHeight mengikuti pseudo-element setinggi viewport; override sementara
   `content: none` menghentikan pertumbuhan dengan kedua plugin tetap aktif.
   Simpan hasil sebagai diagnosis, bukan acceptance build final. Lengkapi metadata,
   baseline yang belum diuji dan cleanup override sebelum regression QA.
4. Fix yang diajukan: scope `_clickable-sizer.scss` ke editor note Markdown yang
   membutuhkan area klik, dengan verifikasi DOM note/embed/frame/mobile/popout.
   Jangan memakai `.mod-inside-iframe` saja sebagai bukti konteks Markdown.
   Uji bahwa rule tidak mengenai card, tinggi tetap mengikuti kebutuhan isi,
   dan klik ruang kosong note tetap bekerja. Tidak ada blanket extension exclusion,
   height lock, overflow hiding, atau perubahan JavaScript dari bukti saat ini.
   Jika QA memperlihatkan pemicu tambahan, buka kembali diagnosis sebelum perluasan.
5. Implementasi nanti per slice dengan test/docs/runtime acceptance; kedua fix
   diverifikasi bersama sebelum handover final.

## Dependencies dan checkpoints

Baseline → callout regression/fix → callout acceptance.
Evidence Canvas terisolasi → lengkapi baseline/scope DOM → review desain → regression/fix.
Kedua jalur → integrated QA → documentation/maintainer acceptance.
Urutan kerja sesi tetap callout dahulu; tidak ada delegasi/parallel agent work.
Review checkpoint setelah setiap 2–3 task dan ketika diagnosis mengubah scope.

## Alternatives, risks dan mitigation

| Area | Risiko/alternatif | Mitigasi |
| --- | --- | --- |
| CSS callout | Dim child dan parent membuat opacity berlipat | Pilih satu wrapper; QA nested/folded dan effective opacity. |
| Focus/pause | Aturan baru melewati existing conditions | Reuse existing branches; matrix `dim`/`dim-none`/`dim-all`, pause dan first-open. |
| Canvas | Siklus pengukuran tinggi diduga tetapi internal plugin belum ditrace | Uji build tanpa override sementara; typing/delete, multiline, saved/reopen. |
| Scope editor | Selector note terlalu luas mengenai frame Canvas atau terlalu sempit merusak embed | Verifikasi DOM own-document; scope CSS sempit dan QA klik ruang kosong note/embed. |
| Lifecycle | Observer/scroll/selection merusak card atau popout | Uji enable/disable/unload dan instance window/editor. |
| QA | Node tests tidak menguji DOM host | Pisahkan regression logic/CSS checks dari acceptance Obsidian nyata. |

Tidak ada perubahan arsitektur/identifier yang diputuskan sekarang. Jika nanti
diperlukan, ADR Proposed dan review mendahului implementasi. Belum ada dependency
baru atau perubahan harness yang dipilih.
