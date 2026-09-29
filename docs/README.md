# Unisastra documentation

Dokumentasi ini diatur berdasarkan aksi yang paling mungkin dilakukan oleh dua
persona utama:

- pengguna plugin yang ingin memasang, memakai, dan memperbaiki masalah
  Unisastra di Obsidian,
- developer atau maintainer yang ingin berkontribusi, menjalankan QA, dan
  merilis perubahan.

## Pengguna plugin

Mulai dari sini jika tujuan Anda adalah memakai Unisastra di vault Obsidian:

- [Install Unisastra](./en/for-users/install-unisastra.md)
- [Use Unisastra features](./en/for-users/use-unisastra-features.md)
- [Troubleshoot Unisastra](./en/for-users/troubleshooting.md)

Informasi singkat untuk pengguna juga tersedia di
[README utama](https://github.com/parkisutama/obsidian-unisastra/blob/main/README.md).

## Developer dan maintainer

Untuk bekerja dengan AI, mulai dari
[AI Assisted Development](./en/for-developers/ai-assisted-development.md),
[current state](./current-state.md), dan [development status](./development-status.md).

Mulai dari sini jika tujuan Anda adalah mengubah kode, dokumentasi, atau release:

- [Set up local development](./en/for-developers/setup-local-development.md)
- [Start a feature or bugfix](./en/for-developers/start-a-feature-or-bugfix.md)
- [Run QA before merge or release](./en/for-developers/run-qa-before-merge-or-release.md)
- [Commit, push, and release a change](./en/for-developers/commit-push-and-release.md)
- [Create a GitHub release for BRAT and Obsidian](./en/for-developers/create-a-github-release.md)
- [Ship a change from branch to GitHub release](./en/for-developers/ship-a-change-from-branch-to-release.md)
- [Documentation guidelines](./en/for-developers/documentation-guidelines.md)
- [SDLC for this plugin](./en/for-developers/sdlc-for-this-plugin.md)

Quickstart contributor tetap ada di
[DEVELOPMENT.md](https://github.com/parkisutama/obsidian-unisastra/blob/main/DEVELOPMENT.md).

## Reference

- [Architecture baseline](./en/reference/code-architecture-baseline.md)
- [ADR-001: AI context and gates](./en/reference/decisions/ADR-001-ai-development-context-and-gates.md)
- [ADR-002: toolbar and callout management (Accepted)](./en/reference/decisions/ADR-002-floaty-toolbar-and-callout-management.md)

Gunakan bagian ini untuk aturan stabil, checklist, dan spesifikasi panjang:

- [Branching conventions](./en/reference/branching-conventions.md)
- [Release gates](./en/reference/release-gates.md)
- [Outliner integration URD, PRD, and implementation plan](./en/reference/outliner-urd-prd.md)
- [Obsidian plugin audit prompts](./en/reference/obsidian-plugin-audit-prompts.md)

## Active specifications

- [Unisastra rebrand: spec](./specs/unisastra-rebrand/spec.md)
- [Unisastra rebrand: plan](./specs/unisastra-rebrand/plan.md)
- [Unisastra rebrand: tasks](./specs/unisastra-rebrand/tasks.md)
- [ADR-005: Unisastra identity](./en/reference/decisions/ADR-005-unisastra-identity.md)
- [Block ID and fold persistence: accepted spec](./specs/block-id-fold-persistence/spec.md)
- [Block ID and fold persistence: accepted plan](./specs/block-id-fold-persistence/plan.md)
- [Block ID and fold persistence: implementation ledger](./specs/block-id-fold-persistence/tasks.md)
- [ADR-004: native fold effects (Accepted)](./en/reference/decisions/ADR-004-fold-native-effects.md)
- [Performance and code quality: accepted spec](./specs/performance-code-quality/spec.md)
- [Performance and code quality: accepted plan](./specs/performance-code-quality/plan.md)
- [Performance and code quality: implementation ledger](./specs/performance-code-quality/tasks.md)
- [Sidebar equal resize: accepted spec](./specs/sidebar-equal-resize/spec.md)
- [Sidebar equal resize: accepted plan](./specs/sidebar-equal-resize/plan.md)
- [Sidebar equal resize: implementation and acceptance ledger](./specs/sidebar-equal-resize/tasks.md)
- [ADR-003: sidebar equal resize (Accepted)](./en/reference/decisions/ADR-003-sidebar-equal-resize.md)
- [Compact settings: accepted spec](./en/specs/compact-settings-layout/spec.md)
- [Compact settings: accepted plan](./en/specs/compact-settings-layout/plan.md)
- [Compact settings: implementation and acceptance ledger](./en/specs/compact-settings-layout/tasks.md)
- [Editor bug fixing: accepted spec](./en/specs/editor-bug-fixing/spec.md)
- [Editor bug fixing: accepted plan](./en/specs/editor-bug-fixing/plan.md)
- [Editor bug fixing: accepted tasks](./en/specs/editor-bug-fixing/tasks.md)
- [Floaty Toolbar adoption: accepted spec](./en/specs/floaty-toolbar/spec.md)
- [Floaty Toolbar: accepted implementation plan](./en/specs/floaty-toolbar/plan.md)
- [Floaty Toolbar: draft task breakdown](./en/specs/floaty-toolbar/tasks.md)

## Archive

Dokumen di archive disimpan untuk riwayat proyek. Jangan jadikan sumber utama
kecuali dokumen aktif menautkannya sebagai konteks.

- [Active document warning cleanup release plan](./en/archive/release-plan-active-document-warnings.md)
- [Obsidian plugin audit report, 2026-05-14](./en/archive/obsidian-plugin-audit-report-2026-05-14.md)

## Folder map

- `for-users/`: aktivitas pengguna plugin.
- `for-developers/`: aktivitas contributor dan maintainer.
- `reference/`: aturan, checklist, audit prompt, dan spesifikasi.
- `archive/`: catatan historis.
