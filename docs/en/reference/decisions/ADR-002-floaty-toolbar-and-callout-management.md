# ADR-002: Floaty Toolbar dan pengelolaan callout

- Date: 2026-09-12.
- Status: Accepted oleh maintainer pada 2026-09-12.
- Requirement: [accepted spec](../../specs/floaty-toolbar/spec.md).
- Approach: [implementation plan](../../specs/floaty-toolbar/plan.md).

## Context

Maintainer menyetujui adopsi seluruh fitur Floaty Toolbar kecuali Pomodoro,
timer elapsed dengan konfigurasi/prefix/keterangan, dock selalu tampil desktop,
toolbar tambahan desktop-only, dan Callout manager dengan preset GitHub Alerts.
Atribusi plugin/penulis upstream di source dan README serta notice MIT wajib.
Spec dan plan accepted tidak berarti pendekatan teknis berikut telah diimplementasikan.

MD Writer memiliki settings typed dengan legacy flat migration, command registry,
CM6/outliner, dan composition TypewriterModeLib. Tidak ada callout registry atau
architecture tests. Upstream mempunyai global DOM/drag/tooltip state dan dock
auto-hide; copy plugin utuh tidak memenuhi mobile/popout/lifecycle contract.
Hemingway existing membatasi keyboard, bukan setiap write editor API.

## Decision

1. Integrasi additive dalam capabilities/components/cm6 existing, controller
   dimuat setelah settings dan dikelola oleh `src/lib.ts`. Tidak mengganti plugin
   ID, manifest mobile support, view type, settings lama, atau command IDs lama.
2. Category `toolbar` dan `callouts` dengan normalizer nested terpisah.
   Toolbar default disabled; floating/dock memakai satu mode, persistent dock
   langsung melalui setting dockAlwaysVisible. Pin tidak dapat undock saat
   persistent aktif; pengguna mematikan setting terlebih dahulu.
3. Desktop toolbar dan commands action baru memakai shared target/selection
   executor. Upstream floaty-* IDs dipertahankan sebagai local IDs yang
   di-namespace Obsidian dengan md-writer; tambah manage-callouts. Existing
   commands tidak berubah dan custom entries tidak membuat command IDs dinamis.
4. CM6 bridge mendeteksi selection/doc updates tanpa editor-selection-change
   workspace event undocumented. UI per ownerDocument, scope cleanup untuk
   windows/leaves; App eksplisit. Tidak ada Node API pada runtime.
5. Guard menolak write pada Reading Mode, target stale, branch outliner di luar
   range, unsupported multi-selection, plugin/platform disabled, dan Hemingway
   aktif. Clipboard async wajib revalidate target sebelum write.
6. Session elapsed shared dalam satu plugin enable cycle; file elapsed per
   window mengikuti active path. Init load dari file aktif; A/B/A, rename path
   reset; delete/null kosong. Hide display tidak reset, disable/re-enable sesi
   baru; tidak persist timestamp atau membaca created/modified.
7. Callout manager mengelola catalog built-in/aliases, theme/snippet candidates,
   manual custom IDs, order/visibility, inherit/override warna/ikon dan preview.
   CSSOM discovery best effort hanya menghasilkan kandidat, tidak menyimpan
   otomatis atau menghapus catalog ketika tema berubah.
8. Styling override dikelola plugin melalui per-document style nodes dari input
   tervalidasi. Tidak menulis CSS snippets/tema, tidak menerima arbitrary CSS/SVG;
   export snippets tidak termasuk scope implementasi pertama. Mobile memakai
   custom styling/settings tanpa toolbar tambahan.
9. Obsidian conversion menjaga title/folding/body/quote depth; ambiguous selection
   ditolak. GitHub output lima marker uppercase, title/folding/nesting tidak
   dikonversi dengan membuang data; pengguna mendapat penjelasan batas mode.
10. Adapted source memuat Floaty Toolbar/0png/path/revision credit; README kredit
    saat integration. Notice MIT lengkap di licenses/floaty-toolbar-MIT.txt,
    embed banner main.js dan dist/licenses untuk distribusi standalone/zip.
    Copyright existing tetap dipertahankan dan artifacts memverifikasi notice.

## Alternatives considered

- Copy upstream plugin: lebih cepat tetapi plugin settings/UI/lifecycle terpisah,
  Pomodoro dan global state menambah regresi serta mengabaikan composition repo.
- Poll DOM selection/event undocumented: sederhana tetapi tidak terpercaya pada
  keyboard selection, Live Preview, atau beberapa editor/window.
- Menulis custom CSS ke snippets otomatis: portable tetapi menambah filesystem
  effect, conflict file, sync dan cleanup; runtime overrides dipilih terlebih dulu.
- Registry tema universal: CSS tidak menjamin daftar semua IDs; best effort plus
  manual entry menjaga manager tetap dapat digunakan.
- Active-writing tracker/persistent per-file history: berbeda dari baseline
  timer upstream dan membutuhkan definisi idle/data migration baru.
- Refactor Hemingway untuk semua editor writes: memperluas scope; conservative
  guard hanya pada executor action baru menjaga workflow existing.
- Notice file saja: dapat hilang pada aset BRAT tiga-file; embedded banner
  membawa notice lengkap bersama main.js.

## Consequences dan compatibility

Pengguna existing tidak mendapat UI baru sampai enabled; setting dan CSS lama
tetap valid. Per-window file timer menunjukkan file popout yang benar, berbeda
dari singleton file timer upstream. Runtime styling membutuhkan MD Writer aktif
dan tidak otomatis ikut Publish/GitHub; manager harus menjelaskan batas tersebut.
Discovery parsial tetap mempunyai jalur manual, bukan klaim registry lengkap.

Tests model/CM6/registration/artifacts tidak membuktikan UI Obsidian atau skin
tema; desktop/mobile/popout acceptance terpisah. Dependency direction manual.
ADR Accepted setelah maintainer memvalidasi plan; baseline/current state
baru diperbarui sebagai implemented setelah source serta validation tersedia.

## Accepted amendment — compact unified callout catalog (2026-09-13)

Maintainer confirms the revised compact settings and unified catalog. This
supersedes decision 9's global output-mode UX: runtime uses one enriched catalog,
with compatibility descriptions instead of restricting custom types. Keep the
legacy outputMode key/value for persisted-data compatibility, but do not use it
to hide entries or reject otherwise lossless Obsidian edits. Future markers are
uppercase; stored IDs, styles and existing notes stay intact. Preserve title,
folding, body and quote depth on explicit edits. GitHub compatibility describes
only its five uppercase base forms without title/folding/nesting.

Preview header remains visible with label/icon/color and right-side catalog
controls; toggling it reveals sample body and configuration without recreating
the form. Separate control actions from collapse and support keyboard/mobile.

## References

- [Floaty Toolbar source baseline](https://github.com/0png/Floaty-Toolbar/tree/b2113d06e1870851963053cd0bab0a0a971bb920/src)
- [Upstream MIT license](https://github.com/0png/Floaty-Toolbar/blob/b2113d06e1870851963053cd0bab0a0a971bb920/LICENSE)
- [Obsidian callouts](https://obsidian.md/help/callouts)
- [Obsidian CSS snippets](https://obsidian.md/help/snippets)
- [GitHub Alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)
