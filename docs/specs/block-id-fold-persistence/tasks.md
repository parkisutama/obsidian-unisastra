# Tasks: block ID dan fold persistence

Status: Accepted melalui "Task Breakdown accepted lanjut implementasi", 2026-09-27.
Sumber: [spec accepted](./spec.md) dan [plan accepted](./plan.md).
Instruksi sebelumnya menyetujui plan dan penyusunan tasks; persetujuan terbaru
mengotorisasi implementasi. Source T02–T06 terhubung; ledger di bawah memisahkan checks otomatis dan native QA.

## Gate dan baseline

| Gate | Status | Bukti |
| --- | --- | --- |
| Spec, D1–D6, scope | Accepted | "Setujui paket rekomendasi dan scope" |
| Plan F01–F06 dan matriks aktivasi | Accepted | "lanjut ke task breakdown" setelah permintaan validasi plan |
| Menulis task breakdown | Authorized | Instruksi yang sama |
| Task breakdown / IMPLEMENT | Accepted | "Task Breakdown accepted lanjut implementasi" |
| Kontrak native fold | Partially verified | Obsidian 1.14.2 detached editor: foldMore/foldLess, range, teks/selection; gutter/fold-all tetap T08 |
| Commit lokal | Authorized | "oke commit kalau begitu", 2026-09-27 |
| Deploy, push, release | Not authorized by this task | Tidak dijalankan secara implisit |

Checkout saat perencanaan: `codex/sidebar-equal-resize`, HEAD `60d81d9`.
Diff sidebar/performa belum di-commit dan harus dipertahankan. Saat mulai T01,
rekam ulang HEAD/status/diff untuk membedakan baseline dari perubahan baru.
Gate sebelumnya 31 files / 200 tests dan checks browser performa/sidebar bukan
bukti implementasi atau acceptance fold persistence.

Nama test/helper baru di bawah adalah area yang diusulkan, bukan klaim file sudah
ada. Status: todo, in-progress, blocked, done. Progres aktual ada pada tabel implementasi.
Done mensyaratkan acceptance task, tests, docs dan bukti; native not-run tetap terbuka.

## Urutan dan checkpoint

T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09.

- Checkpoint A setelah T02–T03: targeted tests, `pnpm run check`, review kontrak ID/capture.
- Checkpoint B setelah T04–T05: targeted tests, `pnpm run check`, review restore/lifecycle/write ordering.
- Checkpoint C setelah T06–T07: `pnpm run check:ci`, browser fixtures, review undo dan compatibility.
- T08 memverifikasi host; T09 merangkum hasil tanpa menutup gate yang belum lulus.

Jangan mengaktifkan capture yang belum mempunyai pasangan restore/lifecycle yang
teruji. T03 dapat diuji melalui fixture sebelum composition produksi di T05.
Native contract T01 memblokir integrasi yang bergantung padanya.
Probe tidak membedakan asal pengguna/plugin lain; maintainer kemudian menyetujui
auto-ID pada semua fold native, kecuali restore internal dan undo/redo (ADR-004).

## T01 — kontrak native dan baseline (F01; B02–B07)

- Dependency: task breakdown disetujui; lingkungan test native yang diotorisasi.
- Area: `scripts/` probe, `tests/fixtures/`, typings/runtime CM6/Obsidian,
  kontrak `src/cm6/list-service.ts` dan `editorInfoField`.
- Kerja: rekam versi host/CM6, gunakan list sintetis root/nested/ber-ID/tanpa ID,
  verifikasi effects dan foldedRanges, foldable, file identity, parser readiness,
  serta asal gutter/command/fold-all/restore/edit/undo transactions.
- Acceptance: effect identity dan range mapping terbukti; teks/selection tidak
  berubah pada pure fold/unfold; ada aturan jelas untuk menolak asal fold ambigu.
  Batas retry kesiapan parser dan gate unsupported ditentukan dari bukti.
- Tests: replay actual effect shapes memakai CM6, negative effect from/to,
  partial parse dan editor tanpa file; probe package lokal dipisahkan dari host.
- Docs: evidence kontrak dan platform/version matrix di development status.
  Jika API privat/schema/API publik/dependency direction diperlukan, tulis ADR
  Proposed dan selesaikan keputusan sebelum slice terkait, bukan setelah wiring.
- Batas: tanpa membaca catatan pribadi atau deploy ke vault operasional. Jika
  lingkungan native tidak tersedia, catat kebutuhan konkret, jangan mengklaim pass.

## T02 — ID stabil dan hide Live Preview (F02; B01, B06)

- Dependency: T01 untuk mode/parser/gate yang dipakai.
- Area: `src/cm6/outliner/block-id.ts`, block-ID feature settings, composition
  extension; tests ID dan decoration/browser fixture.
- Kerja: collision check saat insertion, retry terbatas, preserve existing ID,
  hide decoration visible-range dengan gate Live Preview dan list valid.
- Acceptance: manual generate/copy link/embed tetap tersedia saat master mati;
  hide mengikuti master + hide + plugin/platform/frontmatter; Source/Reading Mode
  tidak berubah. Selection/caret pada suffix tetap dapat diedit; disable membersihkan
  decoration. Tidak ada write Markdown dari hide.
- Tests: collision terkontrol, existing/duplicate IDs, fenced code/non-list,
  Source/Live Preview toggle, viewport/selection/edit/undo, gate platform/frontmatter.
  Generator collision exhaustion tidak loop tak terbatas atau menulis ID duplikat.
- Docs: user behavior/gates yang terverifikasi, bukti B01/B06, attribution existing.

## T03 — capture fold aktual dan coordinator per file (F03; B03, B07)

- Dependency: T01, T02.
- Area: ganti helper capture di `fold-persist.ts`, pure snapshot helper bila perlu,
  coordinator feature fold-persist dan tests capture/revision.
- Kerja: baca foldedRanges/effects aktual, map ke unique IDs, simpan true/false,
  preserve intent nested child. Tangkap identity/epoch saat event; revision per
  file pada waktu aksi, bukan waktu timeout. Coalesce dan skip snapshot identik.
- Acceptance: fold/unfold menjadi snapshot benar; item tanpa ID dilewati;
  selection-only, effect non-fold dan restore internal tidak memicu capture.
  Dua pane file sama memakai aksi pengguna terbaru tanpa menyinkronkan pane.
  Switch active file saat debounce tidak mengubah target write.
- Tests: parent/child folded/unfolded, hidden child, duplicate/missing ID,
  malformed map, A/B/A, pane A timeout selesai setelah pane B, snapshot sama,
  burst fold dan idle zero polling.
- Docs/checkpoint A: aturan snapshot/revision dan evidence di status; targeted
  tests + `pnpm run check`. Belum mengaktifkan capture sendiri di produksi.

## T04 — restore tanpa menggeser cursor (F04; B04, B05)

- Dependency: T03.
- Area: ViewPlugin fold-persist, internal annotation, bounded readiness scheduler,
  tests real CM6 restore/selection dan browser lifecycle.
- Kerja: baca file milik editor; tunggu parser dengan bounded retry yang dapat
  dibatalkan; resolve range terkini dan batch fold/unfold effects sesuai state.
  Restore tidak memanggil command lewat pemindahan selection.
- Acceptance: reopen memulihkan unique IDs yang masih ada; state false juga
  dihormati. ID hilang/ambigu diabaikan. Tidak ada perubahan teks/selection atau
  recenter buatan. Epoch berubah atau user fold yang lebih baru membatalkan restore
  lama; restore sendiri tidak capture/auto-generate kembali.
- Tests: reopening, relocated item, nested state, partial parser/retry exhaustion,
  edit/switch file sebelum dispatch, user fold mendahului deferred restore,
  unchanged text/selection, destroy dengan RAF/timeout queued.
- Docs: restore contract dan limitation readiness; scroll native tetap gate T08.

## T05 — persistence, rename/delete dan lifecycle terpadu (F03/F04; B03–B07)

- Dependency: T04.
- Area: coordinator, fold feature enable/disable, `src/lib.ts` composition dan
  jalur persist-only yang tidak melakukan refresh editor global.
- Kerja: serialisasi save agar completion lama tidak menimpa state baru; error
  reporting/retry; mapping rename dan pembatalan delete. Register capture/restore
  bersama setelah tests pasangan lulus. Retain schema `foldState` existing.
- Acceptance: save fold tidak memicu updateOptions/restore loop; rename memindahkan
  pending/latest state; delete mencegah delayed write dan reuse path menerima data
  baru. Disable/unload mempertahankan fold/ID yang terlihat, membatalkan callback
  dan tidak memulai dispatch/save baru. Write yang sudah in-flight tidak diklaim
  dapat dibatalkan; hasil/errornya tidak boleh menghidupkan kembali coordinator.
- Tests: rejection lalu save berikutnya, reverse completion, settings save
  bersamaan dengan fold save, pending rename/delete/reuse path, close/popout,
  50 enable/disable cycles dengan resource kembali baseline.
- Docs/checkpoint B: ownership dan persist-only responsibility di baseline,
  compatibility/current state sesuai bukti; targeted tests + `pnpm run check`.
  ADR didahulukan bila pemisahan API mengubah kontrak sesuai temuan T01/T03.

## T06 — auto-ID dan undo yang aman (F05; B02, B05–B07)

- Dependency: T01 membuktikan effect identity dan keputusan asal fold; T02–T05 lulus.
- Area: fold bridge, generator, ChangeDesc mapping, internal annotations,
  editor guards, tests undo/redo dan native fixture.
- Kerja: fold native eligible meminta ID baru, revalidate gate/file/
  revision sebelum write; map range setelah insertion; jangan dispatch rekursif
  saat CM6 update. Restore, open, edit mapping dan undo bukan trigger insertion.
- Acceptance: auto-generation opt-in; existing/duplicate ID tidak diganti;
  Hemingway/read-only/unsupported editor tidak ditulis. Satu insertion dapat
  di-undo, tidak langsung dibuat ulang; redo dan fold pengguna berikutnya konsisten.
  Persist enabled saja tidak menghasilkan ID. Disabled mempertahankan ID lama.
- Tests: gutter/command/fold-all, multiline/nested/numbered/tasks list, collision,
  edited range sebelum deferred insertion, selection mapping, undo/redo, pending
  disable dan programmatic restore. Dokumen selain target tidak berubah.
- Docs: user opt-in/write behavior, undo contract dan evidence B02/D6.
  Asal pengguna/plugin lain tidak dibedakan sesuai keputusan ADR-004.

## T07 — regression lengkap dan operation budgets (F06; B01–B07)

- Dependency: T02–T06.
- Area: tests existing/new, browser fixture/runner, settings normalization dan
  command compatibility; tanpa framework/dependency runtime baru.
- Acceptance otomatis: zero text write saat hide/restore; zero callback setelah
  disposal; zero polling idle; unchanged snapshot tidak save; capture/restore
  tidak loop; seluruh activation matrix plan teruji.
- Regression: generate/copy link/embed, outliner focus/selection/keyboard,
  collapse sidebar tetap terpisah, cursor restore, Hemingway, whitespace,
  performance regression dan sidebar equal resize.
- Docs/checkpoint C: `pnpm run check:ci`, browser checks terkait, manual review
  dependency direction, record counts/commands. Jangan mengganti checks native
  dengan pure model test atau assertion yang menyalin implementasi.

## T08 — native acceptance desktop/popout/mobile (F06; B01–B07)

- Dependency: T07; build/artifact teridentifikasi dan lingkungan QA diotorisasi.
- Area: matriks H01–H08 di bawah; fixture sintetis, bukan catatan pribadi.
- Acceptance: H01–H08 pada platform yang tersedia; bandingkan teks/cursor/scroll,
  save/reopen dan fold nested. Catat versi, build hash, plugin lain, fixture dan
  pass/fail/not-run untuk setiap kombinasi.
- Tests/docs: hasil host di ledger, failure → regression reproduksi → fix → rerun
  checks relevan. Platform yang belum diuji tetap gate terbuka, bukan klaim dukungan
  universal. Tidak deploy ke vault operasional tanpa otorisasi eksplisit.

## T09 — handover dan readiness (F06; B06)

- Dependency: T07/T08 dan disposition seluruh failure dicatat.
- Area: current state, development status, architecture baseline, user docs,
  CHANGELOG format existing, index/link specs, ADR jika ada.
- Acceptance: requirement → task → test/QA → keputusan dapat ditelusuri;
  compatibility identifiers/defaults tidak berubah; attribution dipertahankan;
  dokumen membedakan implemented, automated-verified dan native-accepted.
- Jika gate native terbuka, laporkan implementasi beserta batasnya dan sisakan
  task terkait terbuka. Jangan mengarsipkan spec atau menyatakan siap shipped.
- Review setiap diff sebelum staging; atomic commit hanya jika diotorisasi.
  Push/deploy/release bukan bagian otomatis task breakdown ini.

## Native acceptance ledger

### Implementasi dan bukti otomatis — 2026-09-27

| Task | Status | Evidence dan sisa acceptance |
| --- | --- | --- |
| T01 | in-progress | `scripts/fold-native-probe.js`: host 1.14.2 memakai efek CM6; range parent 18–55, child 38–55; teks/selection tetap. Gutter/fold-all, file reopen dan perangkat tetap T08. ADR-004 menyelesaikan keputusan asal fold. |
| T02 | in-progress | Hider terhubung, collision bounded, command manual kompatibel. Browser: Live Preview/Source, caret, master, collision. Fenced code dan viewport HyperMD native belum diterima. |
| T03 | in-progress | Actual ranges true/false, nested model, per-file action revision, debounce 250 ms, identical snapshot skip; unit tests termasuk late pane capture. Native nested/multi-pane tetap terbuka. |
| T04 | in-progress | Restore batch effects, internal annotation, tiga retry parser maksimal 20 ms/attempt, text/selection unchanged pada fixture. Native scroll/parser readiness tetap terbuka. |
| T05 | in-progress | Serialized immutable settings saves, owner cancellation, retry pada aksi berikut setelah failure, folder rename/delete/reuse; unit tests lulus. Browser: 50 create/destroy tanpa insertion/capture pending. Close popout dan native cycles belum dijalankan. |
| T06 | in-progress | Native-effect opt-in, bounded unique IDs, isolated undo history, guards, deferred revalidation. Browser membuktikan undo tanpa reinsert dan redo ID sama; native fold-all/undo tetap terbuka. |
| T07 | in-progress | 33 files / 211 tests; 28 browser checks fold; 13 checks performa dan 24 sidebar lulus. `check:ci` lulus typecheck, lint, tests, build, artifacts 1.1.0 dan docs. Fixture memakai parser/Obsidian boundary sintetis, bukan bukti HyperMD native. |
| T08 | todo | Tidak deploy. H01–H08 di bawah belum diterima sebagai fitur lengkap pada desktop/popout/mobile. |
| T09 | in-progress | Spec/plan/ADR-004, current state, baseline, user docs dan changelog diperbarui. Handover source dan QA otomatis tersedia; penutupan menunggu native acceptance. |

Jalankan `node scripts/fold-regression.cjs` untuk fixture Electron dengan editor CM6 asli.
Build lokal final `dist/main.js` (1.1.0), SHA-256:
`36297f8757c59a93ba8c9a5f2756a90519158db90dd9b1bff4989fed658aa157`.
Build ini belum dipasang pada vault; gunakan identitas ini saat memulai T08.
Tidak ada polling idle; scan penuh terbatas pada fold/restore/insertion, bukan setiap ketikan.
Failure persistence dilaporkan ke console; snapshot tetap di memori dan dapat dicoba pada aksi berikutnya.
Save yang sudah in-flight tidak dapat dibatalkan; queued save memeriksa invalidation sebelum dimulai.

### Acceptance host fitur lengkap

| ID | Skenario | Traceability | Status |
| --- | --- | --- | --- |
| H01 | Gutter, command, fold-all/unfold-all; root/nested list; efek non-fold | T01/T03; B03/B07 | Not run |
| H02 | Hide ID Live Preview; caret/selection; Source/Reading Mode; viewport | T02; B01/B06 | Not run |
| H03 | Reopen file/app; true/false; nested child; teks/cursor/scroll tetap | T04; B04 | Not run |
| H04 | Dua pane file sama; aksi terbaru; switch file selama debounce | T03/T05; B03/D3 | Not run |
| H05 | Rename/delete/reuse path; missing/duplicate ID; malformed state | T05; B05/B06/D5 | Not run |
| H06 | Auto-ID opt-in; undo/redo; restore tidak generate; Hemingway/write guards | T06; B02/D6 | Not run |
| H07 | Disable/unload saat pending; popout close; enable ulang | T04/T05/T06; B05 | Not run |
| H08 | Mobile yang terverifikasi dan regression outliner/cursor/toolbar/sidebar | T07/T08; B01–B07 | Not run |

Evidence tiap baris: tanggal, versi Obsidian/installer/CM6, OS/perangkat, build
hash, fixture, tindakan, actual vs expected, evidence path dan follow-up.
Budget operasi disimpan bersama tests; profiling waktu/heap selalu menyertakan
lingkungan dan tidak diklaim dari tests sintetis.
