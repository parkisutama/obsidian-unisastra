# Current state

Snapshot source MD Writer pada 2026-09-13. Ini peta implementasi, bukan klaim
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

## Floaty toolbar work in progress

Branch `codex/adopt-floaty-toolbar` mengimplementasikan T01-T16 dan T17a: formatting,
heading/link/callout actions, floating/dock UI, timer status bar window utama,
catalog manager, serta lifecycle custom style per document. HUD hanya di status
bar, termasuk ketika toolbar dock. Runtime style menerima warna hex 3/6 digit
dan ikon Lucide yang tersedia; inherit tidak membuat override. Form styling dan
preview (T15) tersedia di panel per callout bersama toggle visibility dan
kontrol catalog, dengan explicit save/reset. Discovery CSSOM best effort membaca
literal ID/nested rules, melaporkan scan parsial, dan hanya menyimpan kandidat
melalui Add; refresh/css-change mempertahankan konfigurasi dan draft styling.
Input manual tetap tersedia. Task lanjutan belum selesai. Test host styling tidak membuktikan tampilan
Obsidian desktop/mobile/popout.

T17a menghubungkan output mode tersimpan ke menu dan executor. Mode GitHub
menawarkan lima uppercase markers dengan visibility kanonis bersama untuk
TIP/IMPORTANT dan WARNING/CAUTION. Conversion custom/title/folding/nesting,
selection sebagian baris, atau blok quote yang tidak lengkap ditolak tanpa
dispatch/undo entry. Body kompatibel tetap utuh; output switch tidak mengubah
note existing otomatis. Command parity T17b belum diimplementasikan.

Setiap callout memakai satu native SettingGroup seperti settings Outliner;
header, preview, dan form langsung terlihat tanpa accordion/nested cards.
Preview ditempatkan sebelum header identitas/controls. Reset header tunggal
mengembalikan style/label builtin; color picker native dan searchable icon picker
mengisi warna/ID. Ikon berasal dari registry host Obsidian, tanpa paket Lucide
terpisah atau pin versi Lucide plugin.
CSS memakai ID ikon Lucide, bukan data URL. Preview memperbarui SVG melalui
setIcon; perubahan CSS tersimpan memicu css-change. Field inherit menampilkan
nilai computed theme yang dikenali tanpa mempersistnya sebagai override.
Pembacaan warna mendukung tuple/hex/rgb/rgba dan fallback computed warna ikon.
Sinkronisasi picker default tidak memicu onChange user, override, atau unsaved.
Mengedit warna/ikon otomatis memilih override; nilai valid mengubah
custom properties preview lokal sebelum save. Style note mengikuti settings
yang berhasil disimpan; inherit diterapkan ke preview setelah save/reset.

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
