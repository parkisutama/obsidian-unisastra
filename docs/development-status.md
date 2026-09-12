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

## Remaining acceptance

- Runtime Obsidian desktop, mobile, dan popout belum diuji pada perubahan ini.
- Workflow GitHub Actions belum dijalankan dari perubahan lokal ini.
- Branch protection GitHub belum diverifikasi atau dikonfigurasi.
- Dependency direction dan cycles belum ditegakkan dengan architecture tests.
- Akurasi docs dan ukuran atomic commit tetap memerlukan review manusia.

Lihat [AI Assisted Development](./for-developers/ai-assisted-development.md)
dan [QA guide](./for-developers/run-qa-before-merge-or-release.md).
