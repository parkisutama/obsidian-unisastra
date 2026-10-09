# Current state

## Unisastra identity — 2026-09-29

Implementasi lokal memakai plugin ID `unisastra` dan nama tampilan Unisastra.
Command namespace mengikuti ID baru; command toggle plugin memakai
`unisastra-plugin`. Outline view memakai `unisastra-outline`, frontmatter
opt-out memakai `unisastra: false`, dan kelas/variabel CSS memakai prefix
`unisastra-`. Package dan arsip rilis bernama `unisastra`; metadata lokal
disiapkan untuk versi `1.2.0` dan URL repo tujuan
`parkisutama/obsidian-unisastra`. Nama repo GitHub belum diubah.

Tidak ada migrasi settings, hotkey, workspace, snippet, atau frontmatter lama.
Perubahan source dan gate otomatis dijelaskan di
[spec rebrand](./specs/unisastra-rebrand/spec.md) dan
[status pengembangan](./development-status.md). Acceptance Obsidian native
belum diklaim.

## Update announcements — 2026-09-28

Toggle Announce Updates dan modal release notes yang tidak terhubung ke runtime telah dihapus. `general.isAnnounceUpdatesEnabled` tetap disimpan sebagai key lama tanpa efek agar data settings pengguna tetap kompatibel. Plugin tidak lagi memiliki jalur request GitHub Releases untuk pengumuman pembaruan. Acceptance native untuk perubahan ini belum dicatat.

## Perbaikan performa lintas fitur — 2026-09-27

Editor menyimpan dan membatalkan observer/RAF; cursor restore membatalkan frame
pending saat disable. MonoNote membatalkan delay dan menyelesaikan promise;
Hemingway menyimpan document registrasi untuk cleanup. Preset menerapkan state
melalui `applyValue`, kemudian caller menyimpan sekali. Toolbar menghindari render
saat disabled, menghentikan display tick jika kedua timer tersembunyi, dan
mempertahankan HUD yang tidak berubah. GFM menginvalidasi berdasarkan perubahan
doc/viewport/config/metadata dan anchor DOM. Outline menggunakan render generation,
child Component per render, dan update active row tanpa render ulang Markdown.

Source dan regression terverifikasi otomatis; native acceptance lintas fitur
belum selesai. Gap wiring block ID/fold ditangani oleh implementasi terpisah di bawah.

## Block ID dan fold persistence — 2026-09-27

Composition mendaftarkan hider Live Preview dan bridge fold CM6.
Hider hanya mengganti tampilan suffix pada list valid; caret/selection membuka ID untuk diedit.
Capture membaca foldedRanges dan menyimpan true/false untuk ID unik per file editor.
Restore mengirim efek fold/unfold tanpa mengganti teks atau selection.
Coordinator memakai revision pada aksi, debounce 250 ms, pembatalan owner dan serialisasi save settings;
save fold tidak memanggil updateOptions. Rename memindahkan map, delete menghapusnya.
Parser diberi maksimal tiga percobaan 20 ms; dokumen yang belum siap dilewati tanpa polling idle.

Auto-ID tetap opt-in dan mengikuti efek fold native dari pengguna maupun plugin lain,
kecuali restore internal dan undo/redo sesuai ADR-004.
Insertion terpisah di history, memeriksa collision, read-only, Hemingway dan focused range.
Master mengendalikan hide/auto-ID; persist independen dan tidak membuat ID sendiri.
Command manual, default settings, key foldState dan format Markdown tetap kompatibel.
Unit dan browser fixture memverifikasi perilaku tersebut; browser memakai parser sintetis.
Probe host 1.14.2 memverifikasi efek fold native, tetapi acceptance reopen/popout/mobile belum ditutup.
Lihat [ledger implementasi](./specs/block-id-fold-persistence/tasks.md).

Snapshot source MD Writer pada 2026-09-14. Ini peta implementasi, bukan klaim
seluruh fitur sudah lolos acceptance di Obsidian.

## Implemented in source

Sidebar equal resize (2026-09-27) adds the opt-in General setting
`general.isSidebarEqualResizeEnabled`, default false. Model, controller, and
guarded native adapter preserve closed sidebar widths and synchronize drag,
activation averages, reopening, and bounded workspace resize. The adapter
accepts Obsidian 1.14.2 or newer (contract probed on 1.14.2, newer
versions rely on structural validation); older versions suspend synchronization without changing the plugin manifest.
The maintainer confirmed the feature works on 2026-09-27; the full scenario
matrix is not individually confirmed. A subsequent performance review reduced
repeated geometry reads and redundant source-side writes, retaining native
guards and subpixel equality. Optimized runtime acceptance remains unverified.
After a reported runaway width, the adapter now caps both widths together at 80%
of the smaller workspace/viewport width. It suspends if native minima cannot fit;
an overflowing workspace can no longer inflate the synchronization bound.
This correction is verified in an isolated browser fixture, not yet deployed.
See the [implementation ledger](./specs/sidebar-equal-resize/tasks.md).

Sidebar outline connectors (2026-09-26) use visible parent/sibling relationships,
with separate child stems and rounded elbows that span each row's actual height.
Hover, keyboard focus, and the active entry emphasize only their connector paths.
Unit tests and a standalone browser fixture cover layout and path selection;
maintainer accepted the reported fix and authorized local main integration on
2026-09-27. Full desktop/mobile/popout coverage remains unverified. See
[development status](./development-status.md#outline-connectors--2026-09-26).

Settings compact (2026-09-14) pada `codex/compact-settings-layout`: overview
menggantikan 14 tab, dengan General/GitHub compatibility inline, selector mode
aktif, dan baris chevron menuju Toolbar, Callouts, empat preset, serta delapan
capability. Detail preset hanya merender satu recipe. Typewriter dan Keep Lines
berada pada halaman yang sama; status disabled switch diperbarui langsung
melalui toggle fitur existing tanpa menggambar ulang form.

Default recipe Normal menyalakan Outliner; Writing mematikan Hemingway.
Deep merge mempertahankan recipe yang tersimpan dan mengisi nilai yang belum
ada. Mode awal tetap None; Keep Lines tidak ditambahkan sebagai field recipe.
Test navigation/mock DOM mencakup Back focus/scroll, direct Callouts, cleanup,
dan stale redraw; bukan bukti acceptance host. Lihat
[tasks dan acceptance ledger](./en/specs/compact-settings-layout/tasks.md).

Koreksi visual dari screenshot maintainer menyatukan General dan compatibility
dalam satu SettingGroup, mengelompokkan preset/Capabilities dalam panel dengan
background theme, serta menambahkan deskripsi Toolbar dan Capabilities.
Header detail menyandingkan judul yang jelas dengan chevron kiri berlabel
aksesibel. Toolbar/Callouts juga masuk kartu General. Maintainer mengonfirmasi
layout final dan mengotorisasi merge lokal ke main pada 2026-09-14; full
scenario matrix di ledger tetap belum dikonfirmasi satu per satu.

- `src/main.ts` memuat `TypewriterModeLib` di `src/lib.ts` untuk lifecycle plugin.
- `src/capabilities/features/` memuat typewriter, dimming, current line,
  whitespace, writing modes, writing focus, Hemingway mode, max character,
  cursor restore, outliner, block ID, fold persistence, compatibility, dan updates.
- `src/capabilities/commands/` mendaftarkan operasi editor dan navigasi outline.
- `src/cm6/` mengimplementasikan extension editor, termasuk fokus outliner,
  batas selection, keyboard operations, block IDs, dan fold persistence.
- `src/components/` berisi settings tab dan outline view.
- `src/gfm-anchor/` menangani navigasi anchor, hover, reading mode, dan Live Preview.

## Floaty toolbar work in progress

Callout dimming follow-up pada `bug-fixing`: wrapper rendered callout kini
ditargetkan di cabang Dim Unfocused existing, termasuk unfocused `dim-all`.
Nested subtree dimmed sekali; ancestor source aktif tidak diredupkan oleh rule
wrapper. Regression compiled-Sass browser standalone lolos 141 checks setelah
40 failures sebelum patch. Maintainer mengonfirmasi callout sekarang dimmed dan
gejala utama selesai pada host Obsidian (2026-09-14). Matrix tambahan menjadi
deferred follow-up sesuai keputusan closure maintainer;
lihat [ledger](./en/specs/editor-bug-fixing/tasks.md).

Canvas follow-up: clickable-sizer kini membutuhkan ancestor
`.markdown-source-view.mod-cm6` dalam konteks leaf aktif atau iframe existing.
Rule tidak lagi mengenai `.cm-sizer` card tanpa source view, sesuai DOM host
yang dilaporkan. Regression browser gabungan lolos 155 checks setelah 8 failures
Canvas sebelum scope fix. Maintainer mengonfirmasi gejala Canvas sembuh dan
menutup kedua bug untuk saat ini pada Obsidian 1.14.1 / installer 1.13.7,
Advanced Canvas 7.0.0. Full multiline/reopen/area klik/lifecycle/mobile/popout
matrix belum dikonfirmasi; dampak scope CSS pada embedded editor lain menjadi
follow-up bila regresi muncul. Tidak ada klaim compatibility universal.

Branch `codex/adopt-floaty-toolbar` mengimplementasikan T01-T19, seluruh task
sumber di [tasks.md](./en/specs/floaty-toolbar/tasks.md) kecuali T20 (dokumen ini)
sendiri. `pnpm run check:ci` hijau: 19 file test / 130 tests, typecheck, lint,
styles, build, verifikasi artefak, dan docs build. Runtime acceptance di
Obsidian nyata (desktop/mobile/popout) tetap belum diuji untuk task manapun —
lihat tabel ledger di bawah dan [tasks.md](./en/specs/floaty-toolbar/tasks.md#runtime-acceptance-ledger)
untuk skenario yang masih pending.

Ringkasan per area:

- **Toolbar formatting**: bold/italic/strikethrough/code/highlight/link,
  heading (dropdown eksplisit P/H1-H4), dan callout — semua lewat satu
  executor/guard yang sama, dipakai baik oleh klik toolbar maupun 16 command
  palette entries (`floaty-bold`, `floaty-heading-1..4`,
  `floaty-callout-note/tip/warning/important/caution`, dst., ID mengikuti
  upstream Floaty Toolbar) serta command `manage-callouts` (baru).
- **Callout catalog**: satu catalog unified — tidak ada lagi pilihan output
  mode Obsidian/GitHub. Toolbar selalu menyisipkan marker uppercase (valid
  untuk Obsidian secara case-insensitive, dan untuk lima marker GitHub Alert
  yang kompatibel); label kompatibilitas ("Obsidian only" / "Also GitHub
  alerts compatible (...)") hanya tampil di tab Callouts, tidak di toolbar.
  Custom types selalu tersedia terlepas dari kompatibilitas GitHub-nya.
  Manager per-entry memakai header preview compact (ikon/warna/label asli,
  bukan placeholder) yang expand/collapse untuk menampilkan form styling.
- **Dock/pin/timer**: dock persistent, HUD status bar window utama, dual
  timer (session/file) dengan interval dapat dikonfigurasi — tidak berubah
  sejak checkpoint sebelumnya.
- **Reorder**: kedelapan item toolbar (enam tombol aksi plus dropdown
  heading/callout) dapat diurutkan lewat long-press (~500ms) langsung di
  toolbar, atau panah atas/bawah di tab Toolbar Settings — keduanya menulis
  `settings.toolbar.buttonOrder` yang sama. Escape dan unload/window close
  membatalkan drag yang sedang berlangsung secara bersih; state drag per
  window, tidak dibagi lintas popout.
- **Distribusi**: notice MIT Floaty Toolbar tertanam sebagai banner
  `/*! ... */` di `dist/main.js` (bertahan meski build diminifikasi) dan
  disalin ke `dist/licenses/floaty-toolbar-MIT.txt`; `verify:artifacts`
  menolak build bila salah satu hilang atau tidak sinkron dengan sumber.

Discovery CSSOM (T16) best effort membaca literal ID/nested rules, melaporkan
scan parsial, dan hanya menyimpan kandidat melalui Add; refresh/css-change
mempertahankan konfigurasi dan draft styling. Input manual tetap tersedia.
Runtime styling menerima warna hex 3/6 digit dan ikon Lucide yang tersedia;
inherit tidak membuat override otomatis.

### Known issues dan follow-up

Catatan awal ada di [tasks.md](./en/specs/floaty-toolbar/tasks.md). Status terkini
dua bug editor ditrack di [bug-fixing ledger](./en/specs/editor-bug-fixing/tasks.md):

- Callout dimming: fix dan gejala utama diterima maintainer; closed for now,
  matrix mode/pause/nested/mobile/popout tambahan deferred.
- Canvas card growth: pemicu pseudo-element 100vh terisolasi dan CSS scope fix
  diimplementasikan dan diterima maintainer pada Advanced Canvas 7.0.0;
  closed for now dengan full matrix tambahan deferred.
- Redesign preview collapsed pada Callout manager (info compact ID/
  compatibility menggantikan kalimat sample body generik, opsi menjadikan
  IMPORTANT/CAUTION sebagai contoh custom-entry, dan tombol Save style
  menjadi ikon floppy-disk sejajar reset) — diminta maintainer, belum
  diimplementasikan.

## Floaty toolbar acceptance criteria status

Ringkasan status setiap AC dari [spec.md](./en/specs/floaty-toolbar/spec.md);
detail skenario dan evidence lengkap ada di
[tasks.md](./en/specs/floaty-toolbar/tasks.md).

| AC | Evidence otomatis | Status |
| --- | --- | --- |
| AC-01 (no Pomodoro) | Review source manual — tidak ada kata "pomodoro" di `src/` atau docs pengguna | Done |
| AC-02 (dock always-visible, mobile no dock) | `toolbar-controller.test.ts` (`dockVisibility` matrix) | Automated; runtime pending |
| AC-03 (formatting target/undo aman) | `toolbar-actions.test.ts`, `callout-markdown.test.ts` | Automated; runtime pending |
| AC-04 (timer toggle/prefix persist) | `settings.test.ts`, `toolbar-elapsed.test.ts` (HUD segments) | Automated; runtime pending (tooltip text) |
| AC-05 (elapsed bukan created/modified) | `toolbar-elapsed.test.ts` (idle counting, A/B/A, reset) | Automated; runtime pending |
| AC-06 (catalog entries di menu, invalid ditolak) | `callout-catalog.test.ts` (normalizeCalloutSettings, calloutMenuOptions unified) | Automated; runtime pending (theme discovery) |
| AC-07 (manager catalog/styling, insert benar) | `callout-styles.test.ts`, `callout-markdown.test.ts` | Automated; runtime pending (visual/tema) |
| AC-08 (migration additive, command IDs utuh) | `settings.test.ts` (migration), `commands.test.ts` (duplicate-ID check) | Done (automated only, tidak butuh runtime) |
| AC-09 (cleanup disable/unload, popout target benar) | `toolbar-controller.test.ts`, `toolbar-reorder.test.ts` (`cancel()`/timer cleanup) | Automated; runtime pending (popout nyata) |
| AC-10 (keyboard/touch, desktop/mobile/popout) | Command palette mobile-hidden test (`commands.test.ts`); tidak ada DOM test untuk toolbar UI (harness `environment: "node"`) | Mostly runtime pending |
| AC-11 (atribusi/notice MIT) | `artifact-verification.test.ts` (T19) + review source header/README manual; diverifikasi terhadap build asli (`dist/main.js`, `dist/licenses/`) | Done |

Baris "Automated; runtime pending" berarti test model/logic lolos tetapi
perilaku DOM/Obsidian nyata (desktop, mobile, popout) belum diverifikasi di
host Obsidian — environment ini tidak menyediakannya. Jangan menyatakan AC
tersebut selesai sepenuhnya sampai runtime acceptance dilakukan dan dicatat.

## Compatibility contracts

Plugin ID adalah `unisastra`; manifest menyatakan dukungan mobile
(`isDesktopOnly: false`) dan minimum Obsidian 1.14.4. Nama komposisi internal
`UnisastraCore` dan prefix CSS `unisastra-` digunakan. Perubahan identitas
dari MD Writer dicatat di [ADR-005](./en/reference/decisions/ADR-005-unisastra-identity.md).

Settings disimpan melalui Obsidian `loadData` / `saveData`. Perubahan settings,
command ID, frontmatter, block ID, atau format Markdown memerlukan analisis
kompatibilitas dan ADR bila mengubah kontrak.

## Validation scope

Test saat ini mencakup commands, settings, GFM anchors, kalkulasi offset
typewriter, artefak build, dan validasi release. Coverage ini tidak membuktikan
semua perilaku editor, mobile, atau popout. Lihat
[development status](./development-status.md) untuk hasil validasi terbaru dan
[QA guide](./en/for-developers/run-qa-before-merge-or-release.md) untuk acceptance.

Spesifikasi [outliner](./en/reference/outliner-urd-prd.md) memuat kebutuhan dan rencana;
periksa source dan tests sebelum menyatakan suatu bagian sudah selesai.
