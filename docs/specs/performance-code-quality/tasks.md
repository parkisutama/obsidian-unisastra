# Tasks: performa dan kerapian kode lintas fitur

Status: Implementasi R1–R7 tersedia; automated verification lulus dan native
acceptance masih terbuka. Commit lokal diotorisasi melalui "oke commit kalau begitu"
pada 2026-09-27; deployment/push tidak diotorisasi.
Sumber kebutuhan: [spec](./spec.md). Dependency/pendekatan: [plan](./plan.md).

## Gate persetujuan

| Gate | Status | Bukti |
| --- | --- | --- |
| Menulis spec, plan, tasks | Authorized | Permintaan maintainer 2026-09-27 |
| Spec R1–R7/R9 | Accepted | "oke implementasikan", 2026-09-27 |
| Plan | Accepted | Instruksi implementasi atas ketiga artefak |
| Task breakdown / implementasi | Accepted | Instruksi implementasi atas ketiga artefak |
| R8: gap block ID/fold | Separate spec authorized | "Buat spesifikasi implementasi terpisah", 2026-09-27 |

Setiap task selesai hanya setelah acceptance, targeted test, dan docs diperbarui.
Status yang dipakai: todo, in-progress, blocked, done.
Jangan mencentang native QA yang hanya dijalankan dalam fixture.

## Checkpoint implementasi — 2026-09-27

Baseline HEAD: `60d81d9`; diff sidebar existing dipertahankan. Gate final:
31 files / 200 tests, seluruh lint tanpa warning kompleksitas, build/artifacts/docs
lulus; 13 checks browser performa dan 24 checks sidebar lulus. Sidebar tetap
120 reads / 60 writes untuk 60 updates / 600 pointer events, idle reads nol.

| Task | Status | Evidence dan sisa acceptance |
| --- | --- | --- |
| P01 | in-progress | Baseline audit 193 tests dan 50 observer tertahan; harness produksi sekarang menguji resource/render. Profil wall-clock/heap native belum diambil. |
| P02 | in-progress | 50 siklus editor melepas seluruh observer/RAF; cursor callback dibatalkan. Embed/two-window/mobile native masih perlu QA. |
| P03 | in-progress | Regression MonoNote kedua fase dan Hemingway document asal gagal sebelum fix, lulus sesudah fix. Native popout dan repeated enable QA belum lengkap. |
| P04 | in-progress | Preset memakai applyValue tanpa persist per toggle; UI/command menyimpan sekali di coordinator existing. Test command/preset dan toggle terpisah lulus; save rejection/rapid-switch host belum diuji. |
| P05 | in-progress | 100 disabled updates tanpa RAF; hidden timer tanpa interval; timestamp tetap berjalan; HUD signature guard. HUD DOM/popout native belum diuji. |
| P06 | in-progress | Disabled/selection-only budget dan cleanup tests; browser anchor baru, berubah, disabled dan re-enable. Metadata/native navigation sweep masih terbuka. |
| P07 | in-progress | Browser membuktikan active row tanpa Markdown rebuild, stale render dibuang, 50 rebuild hanya satu child component, close membersihkan render. Full keyboard/task/filter native masih terbuka. |
| P08 | done | Maintainer memilih spec terpisah; [draft block ID/fold](../block-id-fold-persistence/spec.md) tersedia. Behavior baru belum diotorisasi; settings/helper legacy tetap utuh. |
| P09 | in-progress | Suite otomatis lulus 200 tests pada checkpoint pertama; hasil final dicatat di development status. H01–H06 belum dijalankan. |
| P10 | in-progress | Docs/baseline/changelog diperbarui; handover membedakan kode dan acceptance native yang belum selesai. |

Reproduksi: `pnpm run check:ci`, `node scripts/performance-regression.cjs`,
dan `node scripts/sidebar-resize-regression.cjs`.
Node test memakai factory runtime CM6 dengan DOM/observer terkontrol; fixture
Electron memakai DOM/MutationObserver nyata dan shim Obsidian, bukan host Obsidian.
Tidak ada klaim penurunan FPS/CPU atau batas heap dari checks tersebut.

## P01 — baseline dan harness operasi

- Dependency: seluruh gate perencanaan untuk R1–R7/R9 accepted.
- Area: tests/fixtures, scripts runner relevan, ledger audit di development status.
- Kerja: rekam HEAD/diff dan gate baseline; tambah counter/seam hanya untuk
  resource/save/render yang dipakai regression berikutnya; siapkan fixture sintetis.
- Acceptance: reproduksi observer leak dengan metode produksi; baseline operasi
  preset, toolbar, GFM, outline tercatat; tidak membaca catatan vault pribadi.
- Test/docs: harness deterministik dan command reproduksi dicatat di ledger,
  lengkap dengan batas mock/browser/native. Jangan menjadikan bug yang belum
  diperbaiki sebagai assertion sukses permanen dalam CI.

## P02 — lifecycle editor dan cursor callback (R1)

- Dependency: P01.
- Area: `src/cm6/plugin.ts`, cursor restore feature, tests lifecycle editor.
- Kerja: ownership observer/RAF, cancellation dan disposed guard, owner window.
- Acceptance/test: 50 create/destroy kembali ke baseline; drain queued callback
  tidak dispatch/persist/write; embed masih menerima props; dua document terisolasi.
- Docs: catat resource ownership pada architecture baseline dan bukti R1 di status.

## P03 — lifecycle MonoNote dan Hemingway (R2, R3)

- Dependency: P01; dikerjakan setelah P02 untuk checkpoint pertama.
- Area: kedua feature, tests event/timer/window lifecycle.
- Acceptance/test: disable sebelum delay pertama maupun kedua menghasilkan nol
  navigasi/detach/focus; promise settle; re-enable tidak memulihkan pekerjaan lama.
  Listener Hemingway tidak duplikat dan hilang dari document asal saat disable,
  window close atau unload. Key policy existing tetap sama.
- Docs: status/QA desktop dan popout; checklist mobile untuk behavior yang didukung.
- Checkpoint: targeted tests + `pnpm run check`; review semua cleanup path.

## P04 — satu persistence per preset (R4)

- Dependency: P01, checkpoint P03 lulus.
- Area: base feature toggle, writing modes feature/command, composition save path.
- Acceptance/test: settings dan command masing-masing satu save/refresh per
  aktivasi preset; snapshot berisi seluruh nilai akhir; standalone toggle tetap
  menyimpan; none, preset berulang, rapid switches, rejection lalu retry teruji.
  Timer/focus/Hemingway tidak reset karena enable ulang yang tidak diperlukan.
- Docs: baseline tanggung jawab state/persist; status hasil; tidak ada schema migration.

## P05 — kerja toolbar sesuai output yang terlihat (R5)

- Dependency: P04.
- Area: toolbar controller/HUD/surface, `src/cm6/toolbar-selection.ts`, tests.
- Acceptance/test: disabled menerima 100 editor updates tanpa render/tick; kedua
  timer tersembunyi tidak membuat display interval; hide/show tetap menunjukkan
  elapsed yang benar; unchanged HUD tidak mengganti node; burst terkoalesensi
  per document. Commands masih bekerja menurut policy saat UI toolbar disabled.
- Test tambahan: popout close, dock/floating, reset timer, reorder/selection,
  stale clipboard target, plugin/platform guard.
- Docs/checkpoint: status dan timer contract; targeted tests + `pnpm run check`.

## P06 — invalidasi GFM yang relevan (R6)

- Dependency: P02, checkpoint P05 lulus.
- Area: `src/gfm-anchor/live-preview.ts` dan integrasi metadata/config bila perlu.
- Acceptance/test: disabled updates tidak schedule; selection tanpa perubahan
  anchor tidak scan ulang; DOM anchor baru saat Live Preview berubah tetap
  diproses. Doc/viewport/metadata/source path/re-enable menginvalidasi dengan benar.
  Tidak ada observer feedback loop atau RAF sesudah destroy/popout close.
- Docs: catat trigger invalidasi dan batas native acceptance di status/baseline.

## P07 — outline render terbaru dan update lokal (R7)

- Dependency: P01, P06 untuk urutan kerja/checkpoint.
- Area: `src/components/outline-view.ts`, helper model bila dibutuhkan, tests/browser fixture.
- Acceptance/test: metadata unrelated menghasilkan nol rebuild; active-row-only
  tidak memanggil Markdown renderer; deferred render A yang selesai setelah B
  tidak mempublikasikan hasil A atau menimpa guide/state B. Close saat await
  membuang component generasi tersebut; 50 rebuild tidak menumpuk render children.
- Regression: task toggle, collapse persistence, branch/tasks filters, reveal,
  keyboard focus, guide geometry dan Markdown links tetap berfungsi.
- Docs/checkpoint: ledger operation counts dan ownership render; `pnpm run check`.

## P08 — keputusan gap block ID/fold (R8)

- Dependency: P01; keputusan maintainer diperlukan untuk aksi behavior.
- Area: block ID/fold settings, helper CM6, consumer search, current state/user docs.
- Kerja: dokumentasikan masing-masing gap dan opsi beserta dampak compatibility;
  rekomendasi awal memisahkan implementasi fitur dari perbaikan performa.
- Acceptance: keputusan per gap tercatat. Jika implementasi dipilih, siapkan
  spec/plan/tasks tersendiri dan ADR bila kontrak berubah sebelum wiring source.
  Jika penjelasan status dipilih, perubahan UI/docs harus disetujui dan keys tetap ada.
- Test: bukti pencarian consumer dan tests kontrak sesuai opsi; helper fold lama
  tidak dianggap siap hanya karena file ada. Status unresolved tetap pending.

## P09 — regression lintas fitur dan native profiling (R9)

- Dependency: P02–P07; catat status P08, tidak mengaktifkan scope belum disetujui.
- Area: seluruh matriks plan, scripts/fixtures, tests, status validation ledger.
- Acceptance otomatis: `pnpm run check:ci`, browser fixtures terkait, operation
  budgets R1–R7 lulus; sidebar fixture tidak regresi; review dependency direction.
- Acceptance native: gunakan matriks H01–H06 di bawah; simpan environment,
  tiga pengulangan, before/after, median/p95/long tasks dan batas pengukuran.
  Jika perangkat/host belum tersedia, task native tetap terbuka, bukan done.

## P10 — review dan handover

- Dependency: hasil P09 dan disposition P08 tercatat; gate belum lulus tetap terbuka.
- Area: current state, development status, architecture baseline, user docs,
  CHANGELOG untuk bug user-facing, dan ledger ini.
- Acceptance: setiap diff memiliki requirement/test; tidak ada perubahan legacy
  ID/schema atau attribution; bedakan implemented, automated-verified dan
  native-accepted. Catat backlog eksplisit dan limitation tanpa klaim siap release.
- Tidak termasuk commit/push/deploy/release tanpa otorisasi tersendiri.

## Native acceptance ledger

| ID | Skenario | Requirement | Status |
| --- | --- | --- | --- |
| H01 | 50 buka/tutup editor; embed; plugin unload saat callback pending | R1 | Not run |
| H02 | MonoNote disable di kedua fase; Hemingway pindah/tutup popout | R2, R3 | Not run |
| H03 | Preset via settings/command; none; fullscreen; rapid switch | R4 | Not run |
| H04 | Toolbar idle/hidden timer/show kembali; dock/floating; dua popout | R5 | Not run |
| H05 | GFM doc/selection/viewport/metadata; outline besar dan switch source cepat | R6, R7 | Not run |
| H06 | Mobile supported features dan seluruh regression sweep termasuk sidebar | R9 | Not run |

Untuk setiap hasil, catat tanggal, versi app/plugin/build hash, OS/perangkat,
fixture, pass/fail, evidence path, dan follow-up. Penerimaan sidebar sebelumnya
tidak otomatis menjadi penerimaan seluruh perubahan lintas fitur.
