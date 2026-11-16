# Spec: callout dimming dan kompatibilitas Advanced Canvas

- Date: 2026-09-14.
- Branch: `bug-fixing` (nama eksplisit dari maintainer).
- Status: Accepted oleh maintainer pada 2026-09-14 setelah revisi diagnosis
  Canvas. Plan/tasks juga Accepted pada 2026-09-14; implementasi diotorisasi.
- Companion: [accepted plan](./plan.md), [tasks dan evidence ledger](./tasks.md).
- Origin: [known issues Floaty Toolbar](../floaty-toolbar/tasks.md#known-issues--deferred-feedback--2026-09-14).

## Closure decision — 2026-09-14

Maintainer mengonfirmasi callout dimming dan Canvas card growth sembuh, lalu
meminta pekerjaan ditutup untuk saat ini. Implementasi selesai untuk kedua
gejala yang dilaporkan pada Obsidian 1.14.1 / installer 1.13.7 dan Advanced
Canvas 7.0.0. Ini acceptance terbatas pada kasus pengguna, bukan bukti seluruh
matrix platform/settings atau release/integrasi Git.

Keputusan closure ini menerima sisa matrix sebagai follow-up non-blocking,
bukan Pass: nested/folding/pause combinations, mobile/popout/embed, lifecycle,
multiline/reopen dan klik area kosong note yang belum dilaporkan hasilnya.
Perubahan scope clickable-sizer dapat memengaruhi embedded editor lain atau
editor tanpa ancestor source view; rule dimming bisa berinteraksi dengan theme
atau struktur nested yang berbeda. Jika regresi muncul, buka kembali kasus
terkait dengan metadata/DOM dan regression fixture; jangan memperluas fix sekarang.
Artefak tetap di lokasi aktif karena belum ada keputusan release/shipping.

## Objective dan scope

Pengguna dapat menulis dengan fokus di note Markdown dan mengedit card Canvas
tanpa kehilangan perilaku editor/data. Satu pekerjaan gabungan menutup dua defect:
callout Live Preview yang tidak ikut Dim Unfocused dan konflik mengetik pada
card saat MD Writer serta Advanced Canvas aktif. Keduanya berbagi area editor
CM6, tetapi belum ada bukti bahwa penyebabnya sama.

Scope meliputi diagnosis, fix terbatas, regression checks, QA Obsidian, serta
update dokumentasi. Kerjakan callout sebagai slice pertama; pemicu CSS Canvas
sudah diisolasi lewat uji host, desain fix tetap menunggu review. Dependency development
yang sudah diperbarui pada branch ini adalah checkpoint tooling terpisah.

Non-goals: redesign toolbar/catalog, fitur baru Canvas, migrasi arsitektur,
perubahan settings/command ID/Markdown, patch langsung plugin pihak ketiga,
pengecualian seluruh Canvas tanpa analisis, deployment atau release implisit.

## Evidence dan batas kesimpulan

Callout: maintainer mengirim computed-style report dengan editor fokus dan
cursor di paragraf luar. Sembilan callout dirender melalui
`.cm-embed-block.cm-callout` dengan child `.callout`; tidak ada `.cm-line`
di dalam callout tersebut. Wrapper dan callout mempunyai opacity/effective
opacity 1, sementara `--dimmed-opacity` bernilai 0.25, tanpa class aktif.

Ketika cursor masuk teks callout, report menjadi delapan callout dan screenshot
memperlihatkan callout yang diedit menjadi Markdown mentah. Baris aktif terang,
baris lain dan tabel redup, sedangkan widget callout lain tetap terang.
Source `_dim-unfocused.scss` menargetkan `.cm-line` dan tabel, belum wrapper
callout. Bukti ini mendukung celah selector pada rendering yang diamati;
belum membuktikan semua tema, nested callout, mobile, atau popout.
Mode dan seluruh kombinasi setting belum dicatat lengkap pada report tersebut.

Canvas: maintainer memperjelas lewat pengujian host bahwa huruf tidak pindah
baris dan cursor tidak meloncat; card bertambah tinggi ke bawah dan muncul scroll.
Typing, Backspace dan Delete menambah tinggi; arrow kiri/kanan tidak. Mematikan
Typewriter dan Keep Lines tidak menghentikan gejala. Menonaktifkan MD Writer,
membuka ulang Canvas dan membuat card baru menghentikan pertumbuhan.
Ini bukti keterlibatan MD Writer pada konflik layout, bukan bukti extension
tertentu atau perubahan data. Baseline MD Writer tanpa Advanced Canvas dan
metadata versi masih belum tersedia.

Source dan runtime: `_clickable-sizer.scss` memberi `.cm-sizer::before` tinggi
`100vh` pada leaf aktif/iframe tanpa guard tipe view atau toggle Typewriter.
Computed style dari elemen card yang dipilih melalui `$0` menunjukkan clientHeight
86 px, scrollHeight 118 px, pseudo-element dengan content kosong, position
absolute dan height 118.308 px, serta viewport dokumen card 118 px.
Pencarian melalui Console `document` sebelumnya kosong; pemeriksaan yang berhasil
memakai `ownerDocument/defaultView` dari elemen card. Dokumen/frame editor perlu
dipakai saat pengukuran, bukan diasumsikan sama dengan dokumen Console.

Maintainer menguji override sementara `content: none !important` hanya pada
`.cm-sizer::before` card terpilih, dengan kedua plugin tetap aktif, lalu
mengonfirmasi pertumbuhan berhenti. Pemicu pseudo-element terbukti pada konfigurasi
ini. Siklus viewport → area scroll → pengukuran tinggi card adalah inferensi
mekanisme, bukan hasil tracing internal Advanced Canvas. Uji ini bukan patch repo
atau acceptance fix final; cleanup override dan pengujian build final tetap perlu.

Desain yang diajukan: batasi clickable-sizer ke editor note Markdown yang
membutuhkan area klik kosong; aturan tidak boleh mengenai card Canvas termasuk
editor dalam dokumen/frame tersendiri. Pertahankan fungsi note normal, embed
Markdown yang didukung, mobile dan popout melalui QA. Jangan menonaktifkan seluruh
extension Canvas; tidak ada perubahan CM6 yang dibutuhkan dari bukti saat ini.

## Behavior dan acceptance criteria

| ID | Requirement yang dapat diuji |
| --- | --- |
| AC-C01 | Pada Live Preview dengan Dim Unfocused aktif, rendered callout tidak aktif ikut opacity konfigurasi dalam mode paragraphs dan sentences. |
| AC-C02 | Saat callout diedit sebagai source lines, baris/paragraf/kalimat aktif mempertahankan semantik mode existing; widget lain tetap dimmed. Tidak menganggap semua isi callout aktif harus terang dalam mode sentences. |
| AC-C03 | Dimming callout mengikuti enabled/disabled, first-open, pause scroll/selection, dan editors behavior `dim`, `dim-none`, `dim-all` sesuai kontrak existing yang diverifikasi. |
| AC-C04 | Opacity tidak diterapkan berulang pada wrapper/child/nested callout. Fold/unfold, klik edit, tabel dan list tidak mengalami regresi. |
| AC-A01 | Dengan kedua plugin aktif, typing, Backspace dan Delete pada card baru/existing tidak memicu pertumbuhan tinggi berulang atau scroll berlebih akibat pseudo-element MD Writer. Isi dan cursor tetap mengikuti input. |
| AC-A02 | Enter tetap menghasilkan newline yang disengaja; undo/redo, selection dan edit card existing tetap benar. Isi card tersimpan/reopen sama dengan input yang dimaksud. |
| AC-A03 | Fix membatasi CSS clickable-sizer berdasarkan pemicu yang diisolasi (E-A02–E-A05), sehingga pseudo-element MD Writer tidak berlaku pada editor card/frame Canvas tanpa mengecualikan seluruh extension. Baseline plugin/platform yang belum diuji dicatat. |
| AC-A04 | Card tetap bertambah tinggi secara wajar ketika isi membutuhkan ruang, termasuk multiline/Enter; tidak mengunci tinggi atau menyembunyikan overflow sebagai workaround. |
| AC-A05 | Klik pada area kosong editor note Markdown tetap berfungsi seperti baseline, termasuk note pendek/kosong dan konteks embed/mobile/popout yang didukung. |
| AC-X01 | Identifiers/settings/frontmatter/block IDs/CSS compatibility hooks tetap utuh; tidak ada write Markdown untuk fix presentasi callout. |
| AC-X02 | Enable/disable/unload serta window/popout tidak meninggalkan observer/listener/decorations/DOM milik plugin. Dua fix diuji bersama pada baseline yang sama. |
| AC-X03 | Gate otomatis dan acceptance Obsidian dicatat terpisah. Pekerjaan gabungan tidak ditutup jika salah satu bug masih unresolved atau runtime belum diterima. |

## Compatibility dan boundaries

Selalu pertahankan plugin ID `md-writer`, command IDs, settings keys, pinned
CM6 instances, frontmatter, Markdown dan folding. Gunakan App dan document/window
editor yang tepat; cleanup lifecycle wajib. Ikuti format CHANGELOG MD Writer.

Review manusia diperlukan untuk spec/plan/tasks dan keputusan fix Canvas setelah
diagnosis; persetujuan arah callout tidak otomatis menerima desain Canvas.
Jika diagnosis membutuhkan perubahan kontrak/arah dependency, tulis ADR sebelum
implementasi dan validasi perubahan scope. Jangan mengulang persetujuan rutin
di dalam slice yang nanti sudah diotorisasi.

Jangan membaca credentials, deploy ke vault operasional, bypass gate, menghapus
test gagal, atau menyatakan kompatibilitas semua versi Advanced Canvas.

## Project structure dan style

Area relevan: `src/styles/editor/dim/` untuk CSS; `src/cm6/plugin.ts`,
`src/cm6/highlight-sentence.ts` dan `src/cm6/selectors.ts` untuk editor;
`src/lib.ts` untuk composition/registrasi; `tests/` untuk Vitest;
`scripts/` untuk build tooling. Area fix Canvas yang diajukan adalah
`src/styles/editor/_clickable-sizer.scss`; selector final diverifikasi dalam plan.
Dokumen kontrak/readiness tetap di current state/development status.

TypeScript, SCSS dan conventions existing tetap dipakai. Contoh source existing:

```scss
.cm-line:not(.cm-active)#{$line-condition} {
  @include dimmed.dimmed(true);
}
```

Ini contoh style, bukan patch yang telah diimplementasikan.

## Verification dan commands

Node 24 dan pnpm sesuai `package.json`. Jalankan `pnpm run check`,
`pnpm run test`, lalu `pnpm run check:ci` pada fix final. Untuk dokumen:
`pnpm run lint:md` dan `pnpm run docs:build`. Build biasa tidak deploy.

Vitest saat ini memakai environment Node; test model atau compiled-CSS assertions
tidak membuktikan computed opacity browser. Pilih regression test bermakna yang
gagal sebelum fix dan lolos setelahnya; jangan membuat snapshot selector saja
sebagai bukti behavior. Bila fixture browser diperlukan, putuskan harness dalam
plan tanpa menambahkan dependency secara spekulatif.

QA nyata mencakup desktop, mobile dan popout sesuai dukungan yang tersedia.
Catat versi Obsidian, MD Writer/build, Advanced Canvas, platform, theme/snippets,
setting dan steps. Mobile Advanced Canvas yang tidak didukung dicatat N/A dengan
alasan, bukan Pass. Gunakan note/card sintetis dalam vault uji yang diotorisasi.

## Open questions

- Versi host/plugin serta mode/settings tepat saat laporan callout perlu dicatat.
- Apakah nested callout/editor tetap dirender saat cursor aktif di dalamnya?
- Metadata host/Advanced Canvas, baseline MD Writer saja, dan cleanup override
  sementara masih perlu dicatat; data card tersimpan/reopen belum diverifikasi.
- Selector scope Markdown apa yang tepat pada note/embed/frame/mobile/popout?
- Runtime/harness apa yang tersedia untuk regression checks tanpa klaim palsu?
