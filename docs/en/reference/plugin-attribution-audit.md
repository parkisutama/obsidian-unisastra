# Plugin attribution audit

Sumber kebenaran untuk status atribusi dan lisensi dari sepuluh plugin
Obsidian pihak ketiga yang diintegrasikan ke MD Writer. Dihasilkan dari
verifikasi langsung terhadap source code MD Writer dan repository upstream
(bukan asumsi), lihat
[docs/specs/license-attribution-audit/spec.md](../specs/license-attribution-audit/spec.md)
untuk detail proses audit.

## Status akhir per plugin

| # | Fitur | Author | Repository | License | Tipe | Lokasi file | Atribusi |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Writing Focus | ryanpcmcquen | [obsidian-focus-mode](https://github.com/ryanpcmcquen/obsidian-focus-mode) | MPL-2.0 | Adapted (code port) | `src/capabilities/commands/writing-focus/` | Header lengkap + `licenses/writing-focus-MPL2.0.txt` + `LICENSE` EXCEPTION clause + build banner |
| 2 | Keep one tab per note (MonoNote) | Carlo Zottmann | [obsidian-mononote](https://github.com/czottmann/obsidian-mononote) | MIT | Adapted (code port) | `src/capabilities/features/general/mononote.ts` | Header lengkap + `licenses/mononote-MIT.txt` + build banner |
| 3 | Floating toolbar | 0png | [Floaty-Toolbar](https://github.com/0png/Floaty-Toolbar) | MIT | Adapted (code port) | `src/components/floaty-toolbar/`, `src/capabilities/features/toolbar/`, `src/capabilities/commands/toolbar-actions.ts` | Header lengkap + `licenses/floaty-toolbar-MIT.txt` + build banner |
| 4 | Sentence highlighting | artisticat1 | [focus-active-sentence](https://github.com/artisticat1/focus-active-sentence) | MIT | Adapted (code port) | `src/cm6/highlight-sentence.ts` | Header sumber (`ADAPTED FROM`) |
| 5 | Restore cursor position | dy-sh | [obsidian-remember-cursor-position](https://github.com/dy-sh/obsidian-remember-cursor-position) | MIT | Adapted (code port) | `src/capabilities/features/restore-cursor-position/restore-cursor-position.ts` | Header sumber (`ADAPTED FROM`) |
| 6 | Hemingway mode | jobedom | [obsidian-hemingway-mode](https://github.com/jobedom/obsidian-hemingway-mode) | MIT | Inspired (arsitektur beda: keydown-block vs. upstream `StateField`/`ViewPlugin`) | `src/capabilities/features/hemingway-mode/hemingway-mode.ts` | Header "inspired by" ringan |
| 7 | Show whitespace | deathau | [cm-show-whitespace-obsidian](https://github.com/deathau/cm-show-whitespace-obsidian) | MIT | Inspired (native CM6 API vs. upstream CM5 `showInvisibles`) | `src/cm6/show-whitespace.ts` | Header "inspired by" ringan |
| 8 | Typewriter scroll (foundation) | deathau | [cm-typewriter-scroll-obsidian](https://github.com/deathau/cm-typewriter-scroll-obsidian) | MIT | Inspired (README: "completely restructured" fork lineage) | `src/capabilities/features/typewriter/typewriter-scroll.ts`, `src/cm6/typewriter-offset-calculator.ts` | Header "inspired by" ringan |
| 9 | Outliner zoom | vslinko | [obsidian-zoom](https://github.com/vslinko/obsidian-zoom) | MIT | Inspired (konsep zoom-on-bullet; data model dan implementasi orisinal) | `src/capabilities/commands/outliner-focus.ts`, `outliner-unfocus.ts`, `src/cm6/outliner/click-on-bullet.ts` | Header "inspired by" ringan |
| 10 | Outliner (outline view) | vslinko | [obsidian-outliner](https://github.com/vslinko/obsidian-outliner) | MIT | Inspired (sidebar-based, bukan in-markdown seperti upstream) | `src/capabilities/features/outliner/`, `src/cm6/outliner/` (selain click-on-bullet.ts) | Disebut di README Acknowledgements; tidak ada kode yang dikutip |

## Fitur foundation dan original

| Fitur | Sumber | Catatan |
| --- | --- | --- |
| Build infrastructure (esbuild/pnpm) | [davisriedel/obsidian-typewriter-mode](https://github.com/davisriedel/obsidian-typewriter-mode), [bun-obsidian-plugin-build-scripts](https://github.com/davisriedel/bun-obsidian-plugin-build-scripts) | MIT. Disebut di README dan `LICENSE` root. Toolchain sejak itu dimigrasi ke pnpm + esbuild. |
| GFM Anchor Compatibility, Current Line Highlighting, Focus Dimming, Line Width | Parkis Utama | Original, tidak ada atribusi upstream yang perlu. |

## Definisi tipe atribusi

- **Adapted (code port)**: struktur/logika/nama method di-porting dari
  upstream, diverifikasi dengan diff manual terhadap source upstream.
  Perlu header lengkap (ringkasan, path upstream, commit hash yang dipin,
  copyright, pointer ke file lisensi, daftar perbedaan deliberate) —
  ditambah file lisensi terpisah dan build banner untuk kasus MPL/code-heavy.
- **Inspired**: konsep atau nama fitur terinspirasi upstream, tapi
  implementasi diverifikasi berbeda arsitektur/API — tidak ada kode yang
  dikutip. Cukup komentar 1-2 baris tanpa klaim "adapted from".

## Perubahan dari draft audit sebelumnya

Draft audit dari sesi terpisah (tidak pernah masuk ke repo ini) memuat
beberapa klaim yang setelah diverifikasi ternyata salah atau basi:

- README sudah punya section Acknowledgements lengkap sejak sebelum audit
  ini, termasuk entri MonoNote — bukan hilang seperti yang diklaim draft.
- `mononote.ts` sudah punya header atribusi dasar sebelum audit ini —
  bukan "missing" seperti yang diklaim draft.
- `hemingway-mode.ts`, `show-whitespace.ts`, `typewriter-offset-calculator.ts`,
  dan file zoom outliner terbukti **bukan** adaptasi kode setelah dibandingkan
  langsung dengan source upstream — draft yang merekomendasikan header
  "adapted from" penuh untuk file-file ini tidak akurat.
- Klaim MPL-2.0 pada Obsidian Focus Mode **terbukti benar** dan merupakan
  temuan paling signifikan dari audit ini — ditangani dengan dual-license
  `EXCEPTION` clause di `LICENSE` root.
