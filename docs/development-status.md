# Development status

Snapshot: 2026-09-12. Status ini memisahkan implementasi tooling dari bukti validasi.

## Standardization implemented

- Husky menggantikan Lefthook; pre-commit memakai QA read-only.
- Conventional Commits memakai commitlint lokal dan workflow pull request.
- AGENTS.md menjadi instruksi AI canonical; CLAUDE.md merujuk ke sana.
- Arahan agen mencakup strategi produk, pemilihan skill berdasarkan kondisi,
  SPECIFY/PLAN/TASKS/IMPLEMENT, validasi manusia, vertical slices, dan handover.
- Dokumentasi aktif menyediakan current state, architecture baseline, ADR,
  dan workflow AI Assisted Development dengan navigasi VitePress.
- `check:ci` mencakup build dokumentasi dan verifikasi artefak plugin.
- Script release memakai Conventional Commit dan tidak melewati hook.

## Validation

Validasi lokal pada Node.js 24.19.0 dan pnpm 11.21.0:

- `pnpm install` berhasil; Husky 9.1.7 dan commitlint 21.2.2 terpasang.
  Instalasi melaporkan warning peer dependencies.
- `core.hooksPath` adalah `.husky/_`.
- Hook `commit-msg` diuji melalui `git hook run`: pesan valid diterima,
  pesan invalid ditolak, tanpa membuat commit.
- `pnpm run check:ci` lolos: typecheck, Biome, ESLint Obsidian, Stylelint,
  Markdown lint, 6 file test / 25 tests, build, verifikasi artefak versi 1.1.0,
  dan build VitePress.
- Runner test lama gagal dengan `spawnSync pnpm ENOENT` di Windows. Runner
  diperbaiki untuk memanggil Vitest melalui Node; temporary directory pada
  wrapper test/build memakai direktori native Windows.
- Perubahan dependency dan `.node-version` yang sudah ada dipertahankan.
  Perubahan disimpan sebagai atomic Conventional Commits pada branch
  `codex/standardize-ai-development`; belum dipush.

## Floaty Toolbar planning

- Branch `codex/adopt-floaty-toolbar`: [spec](./specs/floaty-toolbar/spec.md)
  accepted oleh maintainer; [plan](./specs/floaty-toolbar/plan.md) dan
  [ADR-002](./reference/decisions/ADR-002-floaty-toolbar-and-callout-management.md)
  Accepted. [Task breakdown](./specs/floaty-toolbar/tasks.md): T01-T08 (Slice A
  — settings contract, bold executor, CM6/controller bridge, floating toolbar
  UI/settings tab; Slice B — italic/strikethrough/code/highlight, cycling
  heading, and link insert/unwrap with clipboard capture/revalidation; Slice C
  — dock/pin with persistent-always-visible override, status-bar clearance,
  and narrow-window shrink) implemented dan wired ke `src/lib.ts`;
  8/21 task implemented.
- `pnpm run test` (8 file, 44 test) dan `pnpm run check:ci` lolos untuk state
  saat ini, termasuk build, verify-artifacts, dan docs build. Perbaikan gate
  selama T01-T04: satu type error (`EditorView.editable` value import) dan
  tiga Biome lint error. Selama T05: dua Biome `useTopLevelRegex` dan satu
  `noNestedTernary`. Selama T06: `useSimplifiedLogicExpression` dan
  `useAwait` (executor.ts) diperbaiki oleh `pnpm run fix` + menghapus
  `async` dari `executeToolbarAction` karena badan fungsinya sendiri tidak
  await (kedua path async tetap mengembalikan Promise dari callee). Selama
  T07: ESLint Obsidian `sentence-case` pada teks Notice, dan Stylelint
  `selector-class-pattern` menolak BEM `--modifier` (diganti kebab-case
  `ptm-floaty-toolbar-dock`). Selama T08: satu Biome format fix (line-length
  pada `statusBarHeight`).
- T09 dan seterusnya (timer/HUD, callout catalog) belum diimplementasikan.
  Runtime Obsidian desktop/mobile/popout belum diuji untuk task manapun —
  environment ini tidak punya host Obsidian, dan Vitest terkonfigurasi
  `environment: "node"` sehingga UI toolbar
  (`src/components/floaty-toolbar/toolbar.ts`), clipboard controller wiring,
  dock mouseenter/mouseleave/Escape wiring, dan status-bar clearance hanya
  diverifikasi lewat typecheck/lint/build plus satu pure helper
  (`dockBottomOffsetPx`) yang diuji unit test, bukan DOM/QA runtime. Feature
  classes toggle dock tidak punya unit test — repo ini tidak punya harness
  untuk mock `SettingGroup` Obsidian. Hasil QA standardization sebelumnya
  bukan bukti fitur Floaty Toolbar.

## Remaining runtime and integration acceptance

- Runtime Obsidian desktop, mobile, dan popout belum diuji pada perubahan ini.
- Workflow GitHub Actions belum dijalankan dari perubahan lokal ini.
- Branch protection GitHub belum diverifikasi atau dikonfigurasi.
- Dependency direction dan cycles belum ditegakkan dengan architecture tests.
- Akurasi docs dan ukuran atomic commit tetap memerlukan review manusia.

Lihat [AI Assisted Development](./for-developers/ai-assisted-development.md)
dan [QA guide](./for-developers/run-qa-before-merge-or-release.md).
