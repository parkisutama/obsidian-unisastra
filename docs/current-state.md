# Current state

Snapshot source MD Writer pada 2026-09-12. Ini peta implementasi, bukan klaim
seluruh fitur sudah lolos acceptance di Obsidian.

## Implemented in source

- `src/main.ts` memuat `TypewriterModeLib` di `src/lib.ts` untuk lifecycle plugin.
- `src/capabilities/features/` memuat typewriter, dimming, current line,
  whitespace, writing modes, writing focus, Hemingway mode, max character,
  cursor restore, outliner, block ID, fold persistence, compatibility, dan updates.
- `src/capabilities/commands/` mendaftarkan operasi editor dan navigasi outline.
- `src/cm6/` mengimplementasikan extension editor, termasuk fokus outliner,
  batas selection, keyboard operations, block IDs, dan fold persistence.
- `src/components/` berisi settings tab, outline view, dan update modal.
- `src/gfm-anchor/` menangani navigasi anchor, hover, reading mode, dan Live Preview.

## Compatibility contracts

Plugin ID adalah `md-writer`; manifest menyatakan dukungan mobile
(`isDesktopOnly: false`) dan minimum Obsidian 1.11.0. Nama internal
`TypewriterModeLib` dan prefix CSS `ptm-` masih digunakan. Jangan mengganti
identifier hanya untuk menyamakan penamaan dengan repo lain.

Settings disimpan melalui Obsidian `loadData` / `saveData`. Perubahan settings,
command ID, frontmatter, block ID, atau format Markdown memerlukan analisis
kompatibilitas dan ADR bila mengubah kontrak.

## Validation scope

Test saat ini mencakup commands, settings, GFM anchors, kalkulasi offset
typewriter, artefak build, dan validasi release. Coverage ini tidak membuktikan
semua perilaku editor, mobile, atau popout. Lihat
[development status](./development-status.md) untuk hasil validasi terbaru dan
[QA guide](./for-developers/run-qa-before-merge-or-release.md) untuk acceptance.

Spesifikasi [outliner](./reference/outliner-urd-prd.md) memuat kebutuhan dan rencana;
periksa source dan tests sebelum menyatakan suatu bagian sudah selesai.
