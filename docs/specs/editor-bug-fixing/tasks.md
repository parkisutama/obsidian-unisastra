# Tasks: callout dan Advanced Canvas

- Date: 2026-09-14. Branch: `bug-fixing`.
- Status: Closed for now oleh maintainer pada 2026-09-14. Kedua gejala utama
  diterima host setelah implementasi; matrix tambahan menjadi deferred follow-up,
  bukan Pass. Integrasi lokal ke main dan prune branch merged diotorisasi;
  push/release tidak termasuk scope ini.
- Contract: [accepted spec](./spec.md). Approach: [accepted plan](./plan.md).

## Gates

- [x] Arah fix callout disetujui; pembuatan artefak gabungan diotorisasi.
- [x] Spec gabungan direview dan Accepted oleh maintainer pada 2026-09-14.
- [x] Plan direview dan Accepted oleh maintainer pada 2026-09-14.
- [x] Tasks direview dan Accepted pada 2026-09-14.
- [x] Implementasi slice diotorisasi secara eksplisit pada 2026-09-14.

Checkbox selesai menyatakan scope bug yang diterima, bukan seluruh matrix QA.
QA tambahan dipindahkan ke deferred follow-up; dependency security checkpoint
bukan bukti acceptance editor.

## Completion summary

| Task | Status dalam scope closure maintainer |
| --- | --- |
| B01 | Selesai: evidence/fixture dan metadata yang tersedia dicatat; gap ke F01/F02. |
| B02 | Selesai: regression dan fix callout. |
| B03 | Selesai: gejala callout diterima host; matrix tambahan ke F03. |
| B04 | Selesai: pemicu Canvas diisolasi dan evidence dicatat; gap ke F01/F04. |
| B05 | Selesai: desain dan scope DOM CSS diterima. |
| B06 | Selesai: regression dan fix Canvas. |
| B07 | Selesai: gate gabungan dan kedua gejala host diterima; matrix tambahan ke F05. |
| B08 | Selesai: dokumentasi/acceptance/closure; main integration diotorisasi. |

## Deferred follow-up (non-blocking)

Keputusan maintainer menutup kedua bug untuk saat ini; item ini bukan Pass dan
tidak dijalankan sebagai syarat merge. Reopen bila ada gejala regresi.

- [ ] F01: lengkapi theme/snippets/settings dan seluruh baseline kombinasi plugin.
- [ ] F02: QA DOM/klik area kosong pada embed Markdown, mobile dan popout nyata.
- [ ] F03: QA callout mode/fokus/pause/first-open/nested/folding/list/table lengkap.
- [ ] F04: QA Canvas Enter/undo/redo/data tersimpan/reopen/multiline/shrink lengkap.
- [ ] F05: QA gabungan note/card, selection/folding/Hemingway/outliner/typewriter,
  enable/disable/unload dan lifecycle mobile/popout.

## Urutan eksekusi dan aturan evidence

Setelah tasks/slice diotorisasi: B01 → B02 → B03, kemudian pelengkapan B04 →
B05 → B06 → B07 → B08. Diagnosis awal B04 dan update dokumen B05 sudah
dikerjakan lewat uji/diskusi, bukan implementasi. Pemeriksaan scope DOM Canvas
boleh dikumpulkan di B01 untuk mengurangi permintaan DevTools berulang.

B01 cukup memakai evidence yang sudah tersedia dan mencatat gap; metadata yang
belum tersedia tidak menghalangi regression fixture lokal. Namun selector final
Canvas bergantung DOM konteks yang benar dan acceptance host tidak boleh Pass
tanpa pengujian build final. Jika akses host tidak tersedia, lanjutkan pekerjaan
lokal yang independen dan biarkan task runtime Pending.

Regressions CSS menggunakan actual Sass yang dikompilasi, fixture sintetis,
dan computed style browser. Manual browser checks dilabeli Manual, bukan
otomatis Vitest/CI. Jangan menambah dependency browser atau mengganti runner.
Jika tidak ada browser, catat failure reproduction dari host dan gap fixture;
jangan menggantinya dengan snapshot selector sebagai proof behavior.

Jalankan satu slice beserta check/docs sebelum slice selanjutnya. QA gagal
menghasilkan koreksi kecil dalam slice, tanpa membuka scope produk baru.
Commit, push dan deploy tetap memerlukan otorisasi sesuai scope sesi.

## B01 — Baseline dan fixture reproducible

- [x] Catat host/plugin/build yang tersedia, evidence reproduksi dan fixture
  note/card sintetis; gap settings/theme/full mode matrix dipindahkan ke F01/F03.
- [x] Bandingkan scope DOM note/card host dengan ownerDocument dan fixture
  frame; gap embed/mobile/popout host dipindahkan ke F02.
- Acceptance: metadata tersedia; report yang sudah dikirim ditautkan ke ledger;
  kondisi yang belum diuji tetap Pending (AC-C01/C02, AC-A03).
- Area: tasks.md; fixture sintetis dan hasil host bila tersedia, tanpa isi vault
  pribadi atau credentials. Scope kecil, 1–2 artefak.
- Dependency: gate perencanaan yang relevan diterima; akses vault uji diotorisasi.
- Verify/docs: pemeriksaan DevTools read-only, langkah ulang manual; update ledger.

## B02 — Slice callout: regression dan fix terbatas

- [x] Kompilasi SCSS actual ke fixture browser: inactive wrapper, source aktif,
  active descendant, nested widget, mode/fokus/pause/first-open dan list/table.
- [x] Rekam computed/effective opacity yang gagal sebelum fix; tambahkan mixin
  rendered-callout melalui cabang existing termasuk unfocused `dim-all`.
  Verifikasi sesudah fix dan jalankan check relevan.
- Acceptance: AC-C01–C04 yang dapat diuji di fixture terpenuhi; source active
  semantics terjaga; nested wrapper tidak dim berulang. Bukan test selector saja.
- Area: `_dim-unfocused.scss`, satu fixture HTML di `tests/fixtures/`, satu
  compiler/check helper di `scripts/` bila diperlukan, tasks.md dan
  current-state.md (maksimal 5 file). Reuse `_dimmed.scss` tanpa perubahan.
- Dependency: B01; plan/task/slice callout Accepted dan implementasi diotorisasi.
- Verify/docs: regression browser sebelum/sesudah (Manual bila dijalankan manual),
  `pnpm run test`, `pnpm run check`;
  current state hanya menyatakan bukti yang sudah diperoleh.

## B03 — Acceptance callout di host

- [x] Maintainer mengonfirmasi pada 2026-09-14 bahwa callout sekarang dimmed
  dan gejala utama selesai. Ini acceptance kasus yang dilaporkan, bukan seluruh
  matrix nested/pause/mobile/popout yang belum dilaporkan hasilnya.
- Scope tambahan mode/focus/pause/nested/table/list/mobile/popout dipindahkan
  ke F03/F05, tidak diklaim selesai oleh acceptance gejala utama.
- Acceptance: AC-C01–C04 dan X01/X02 tercatat Pass/Fail/Pending/N/A dengan evidence.
- Area: tasks.md, development-status.md; revisi bug bila QA gagal menjadi task
  tambahan kecil sebelum lanjut. Scope 2 dokumen.
- Dependency: B02.
- Verify/docs: computed/effective opacity dan QA visual; metadata B01 dipakai.

Checkpoint B01–B03: review hasil callout; gate gagal diperbaiki sebelum lanjut.
Callout accepted tidak menutup pekerjaan gabungan.

## B04 — Diagnosis Canvas dan pelengkapan baseline

- [x] Maintainer mengisolasi pemicu `.cm-sizer::before` lewat computed style dan
  override CSS sementara: pertumbuhan berhenti dengan kedua plugin tetap aktif.
- [x] Catat versi host/plugin, computed style, isolasi CSS dan scope DOM note/card;
  gap baseline/settings/cleanup detail/saved data/full embed matrix ke F01/F02/F04.
- Acceptance: E-A02–E-A05 dipertahankan; pemicu CSS terlokalisasi, gap baseline
  tetap eksplisit (AC-A03). Tidak mengulang bisection extension tanpa gejala baru.
- Area: tasks.md dan fixture/reproduction note; source `_clickable-sizer.scss`
  dibaca, bukan otomatis diubah. Tidak melakukan extension bisection tambahan
  jika pemicu CSS sudah cukup menjelaskan dan mengisolasi kasus.
- Dependency: diagnosis awal sudah dilakukan melalui diskusi/uji maintainer
  sebelum implementasi callout; pelengkapan baseline bergantung B01 dan host.
- Verify/docs: typed text, Enter, undo/redo dan saved data baseline; ledger.
  Bila tidak reproduce, rekam kondisi dan gap; jangan membuat fix spekulatif.

## B05 — Review desain fix Canvas

- [x] Update spec/plan dengan pemicu CSS, evidence isolasi, dan desain scope
  clickable-sizer ke note Markdown (permintaan revisi maintainer).
- [x] Verifikasi selector final dari DOM note/card yang diberikan maintainer;
  `.markdown-source-view.mod-cm6` ada pada note, tidak ada pada card. Gabungkan
  dengan konteks leaf aktif/iframe existing; full embed/popout matrix masih QA.
  Catat kecocokan scope
  positif dan regression cases sebelum patch. Plan CSS yang sudah Accepted tidak
  dimintakan persetujuan ulang untuk pemilihan selector rutin yang sesuai bukti.
- Acceptance: AC-A01–A05 terpetakan ke desain/test dalam scope plan Accepted.
  Bila CSS tidak mampu membedakan frame note/card, tandai blocker dan review
  perubahan pendekatan terlebih dahulu; ADR bila kontrak/arsitektur berubah.
- Area: plan.md, tasks.md, spec.md bila perlu, satu ADR kondisional (maks. 4 file).
- Dependency: B04 dengan diagnosis cukup.
- Verify/docs: source/test review dan review manusia; tidak ada patch runtime.

Checkpoint B04–B05: cek bukti scope sebelum patch; persetujuan plan CSS sudah
tersedia. Perluasan ke penanda JavaScript/lifecycle memerlukan review perubahan.

## B06 — Slice Canvas: regression dan fix

- [x] Gunakan actual compiled SCSS pada fixture note dan frame card; rekam
  pseudo style/scrollHeight dan pertumbuhan sebelum fix.
- [x] Scope seluruh clickable-sizer rule ke note positif yang diverifikasi B05;
  hilangkan broad leaf/iframe fallback. Verifikasi ukuran input tetap/berkurang,
  multiline dan area klik note, lalu check relevan.
- Acceptance: AC-A01–A05; typing/Backspace/Delete tidak menambah tinggi berulang,
  multiline tetap tumbuh wajar; klik area kosong note dan isi data terjaga.
- Area: `src/styles/editor/_clickable-sizer.scss`, shared fixture dan helper B02,
  tasks.md, current-state.md (maksimal 5 file). Tidak mengubah CM6 extensions.
- Dependency: B05 Accepted dan slice implementasi diotorisasi.
- Verify/docs: regression browser sebelum/sesudah, `pnpm run test`, `pnpm run check`; source
  scope serta keterbatasan host dicatat.

## B07 — QA gabungan dan lifecycle

- [x] Gejala utama callout dan Canvas diterima maintainer; gate gabungan lolos.
  Maintainer meminta closure sekarang dengan kemungkinan dampak lain dicatat.
- Full host matrix card existing/Enter/undo/redo/reopen dan lifecycle dipindahkan
  ke F04/F05; acceptance kedua gejala tidak diklaim menguji semua skenario.
- Acceptance: seluruh AC dicatat; fix Canvas tidak membatalkan fix callout;
  fitur editor utama (selection/folding/Hemingway/outliner/typewriter) tidak regresi.
- Area: tasks.md, development-status.md. Scope 2 dokumen.
- Dependency: B03 dan B06.
- Verify/docs: `pnpm run check:ci` plus QA host; unsupported platform N/A beralasan.
  Full matrix di bawah tetap deferred oleh keputusan closure, tidak diklaim tested.

## B08 — Dokumentasi dan handover

- [x] Update kontrak/readiness dan changelog bug fixes; cocokkan setiap AC dengan
  task/test/QA dan minta acceptance final maintainer.
- Acceptance: tidak ada unresolved bug atau Pending yang diklaim selesai;
  scope versi/platform yang diterima jelas (AC-X03).
- Area: current-state.md, development-status.md, CHANGELOG.md, tasks.md,
  user troubleshooting bila relevan (maks. 5 file). Baseline/ADR perubahan bila
  diperlukan menjadi task kecil tersendiri.
- Dependency: B07; diagnosis/fix/QA keduanya tersedia.
- Verify/docs: lint/build docs, diff review; commit/push/deploy tetap sesuai izin.

Checkpoint B06–B08: gate dan host acceptance harus dibedakan; blocker salah satu
bug mempertahankan spec gabungan aktif, tidak diarsipkan sebagai selesai.

## Evidence ledger awal

Metadata host dari maintainer: Obsidian 1.14.1, installer 1.13.7,
Advanced Canvas 7.0.0. Theme/snippets dan matrix mobile/popout belum dicatat.
Regression lokal memakai Electron 41.10.7 tersembunyi dengan actual compiled Sass;
ini browser fixture otomatis standalone, bukan host Obsidian atau tambahan CI.
Command: `node scripts/editor-css-regression.cjs` dari root repo.

| Evidence | Observasi | Batas/status |
| --- | --- | --- |
| E-C01: report callout luar, 2026-09-14 | 9 callout, editorFocused true; wrapper/child opacity 1, dimmed variable 0.25; tanpa active marker atau child cm-line | Host evidence pengguna; mode/settings/version perlu metadata B01. |
| E-C02: report + screenshot edit callout, 2026-09-14 | 8 rendered callout; callout edited menjadi source; active line terang, tabel/baris lain redup; rendered callout lain terang | Mendukung gap selector; bukan bukti seluruh matrix platform/nested. |
| E-A01: laporan Canvas di known issues | Card baru/typing terasa seperti newline tanpa Enter | Report saja, root cause/data mutation belum dibuktikan. |
| E-A02: klarifikasi dan uji host maintainer | Typing/Backspace/Delete menambah tinggi card dan scroll; arrow kiri/kanan tidak. Typewriter/Keep Lines off tidak membantu. MD Writer disabled + Canvas/editor dibuat ulang menghentikan gejala | Konflik layout dengan keterlibatan MD Writer terkonfirmasi pada konfigurasi pengguna; extension/CSS penyebab belum diisolasi. |
| E-A03: source inspection | `_clickable-sizer.scss` memakai pseudo-element cm-sizer tinggi 100vh pada leaf aktif/iframe tanpa scope Markdown. Typewriter plugin punya guard Markdown, selectors mengambil DOM leaf aktif global | Kandidat CSS/scroll measurement; menunggu computed style dan uji isolasi di card. |
| E-A04: computed style elemen card melalui ownerDocument/defaultView | clientHeight 86, scrollHeight 118, before content kosong, absolute, height 118.308px; viewport card 118 | Mengonfirmasi pseudo-element aktif dan area scroll lebih tinggi daripada konten; mekanisme internal auto-sizing masih inferensi. |
| E-A05: isolasi runtime maintainer | Override sementara content none hanya pada pseudo-element sizer card; kedua plugin tetap aktif; maintainer mengonfirmasi pertumbuhan berhenti | Pemicu CSS terbukti pada konfigurasi uji; belum patch repo, cleanup/reversal dan acceptance build final belum dicatat. |
| E-Q01: dependency checkpoint branch ini | Audit 0 vulnerability dan check:ci 130 tests lolos sebelum editor fixes | Baseline tooling saja; bukan acceptance callout/Canvas. |
| E-C03: regression browser standalone | 141 computed/effective-opacity checks; 40 kegagalan callout sebelum patch, 0 setelah patch | Kedua mode, 3 focus behaviors, nested/source aktif, pause/first-open/disabled; host final Pending. |
| E-Q02: slice callout check:ci | Typecheck/lint/styles/Markdown, 19 files / 130 tests, plugin build/artifacts 1.1.0 dan docs build lolos | Browser regression 141 checks dijalankan terpisah; belum deployment atau acceptance Obsidian. |
| E-C04: acceptance maintainer | Callout sekarang dimmed; maintainer mengonfirmasi gejala utama selesai | Kasus utama host diterima; mode/settings dan seluruh matrix tambahan belum dikonfirmasi. |
| E-A06: DOM note versus card dari maintainer | Note memiliki ancestor markdown-source-view mod-cm6; card tidak. leafType null dan sameDocument true pada kedua report | Scope berbasis source ancestor, bukan data-type pada leaf. Full embed/popout matrix belum diuji. |
| E-A07: regression browser gabungan | Actual compiled CSS, note/card dalam dokumen terpisah dengan konteks leaf/iframe: 155 checks, 8 failures Canvas sebelum scope fix, 0 setelah | Checks pseudo/position scope, repeated viewport growth, multiline dan shrink; tidak mensimulasikan seluruh Advanced Canvas. |
| E-Q03: gate gabungan setelah Canvas fix | check:ci lolos seluruh QA, 19 files / 130 tests, build, artifacts 1.1.0 dan docs build; diff check bersih | Host Canvas/combined acceptance masih Pending; browser regression standalone 155 checks terpisah dari CI. |
| E-A08: acceptance dan closure maintainer | Canvas terkonfirmasi sembuh; sebelumnya callout juga diterima. Maintainer meminta catat kemungkinan pengaruh lain dan tutup untuk saat ini | Kedua gejala utama accepted pada host yang dilaporkan; full matrix deferred, tanpa klaim universal compatibility. |

## Runtime acceptance ledger

| Area | Metadata/evidence | Status |
| --- | --- | --- |
| Callout gejala utama rendered widget tidak dimmed | E-C04, konfirmasi maintainer setelah fix | Pass pada kasus dilaporkan |
| Callout matrix paragraphs/sentences, focus luar/dalam lengkap | E-C01/E-C02/E-C04; kombinasi lengkap belum dikonfirmasi | Deferred, belum diuji lengkap |
| Focus behaviors, pause, first-open | B03 | Deferred, host matrix belum lengkap |
| Nested/folded, list/table, source/Reading Mode isolation | B03 | Deferred, host matrix belum lengkap |
| Canvas gejala pertumbuhan tinggi berulang | E-A04/E-A05 diagnosis; E-A08 acceptance setelah fix | Pass pada kasus dilaporkan |
| Canvas baseline plugin/version/settings lengkap | B01/B04; belum semua kombinasi diuji | Deferred |
| Canvas Enter/undo/redo/saved/reopen lengkap | B04/B07; detail tiap skenario belum dikonfirmasi | Deferred |
| Tinggi card wajar pada multiline dan klik area kosong note | AC-A04/A05, fixture lolos; host detail belum dilaporkan | Deferred untuk host |
| Gabungan note/card dan cleanup lifecycle | Gate gabungan lolos; host cleanup belum dilaporkan | Deferred untuk host |
| Desktop/mobile/popout scope versi | Host versi dicatat; mobile/popout belum dilaporkan | Deferred |
| Maintainer final acceptance kedua bug | E-C04/E-A08; closure untuk saat ini | Accepted dengan batas scope |
