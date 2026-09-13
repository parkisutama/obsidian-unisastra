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
  Accepted. [Task breakdown](./specs/floaty-toolbar/tasks.md): T01-T10 (Slice A
  — settings contract, bold executor, CM6/controller bridge, floating toolbar
  UI/settings tab; Slice B — italic/strikethrough/code/highlight, cycling
  heading, and link insert/unwrap with clipboard capture/revalidation; Slice C
  — dock/pin with persistent-always-visible override, status-bar clearance,
  and narrow-window shrink; Slice D — shared session and per-window file
  elapsed model, plus a HUD shown in the dock or the main window's status bar
  with visibility toggles, prefixes, and an explicit session reset; Slice E
  — T11 callout catalog and additive settings, T12 callout dropdown menu with
  lossless Obsidian conversion, and T13 a Callout manager settings tab for
  add/edit/delete/reorder/hide) implemented dan wired ke `src/lib.ts`;
  13/21 task implemented.
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
  pada `statusBarHeight`). Selama T09: Biome `useNumericSeparators` pada
  literal test di bawah 5 digit. Selama T10: Biome
  `useSortedInterfaceMembers`, format fix pada dua file settings timer, dan
  `useNumericSeparators` lagi di test HUD — semuanya diperbaiki oleh
  `pnpm run fix`.
- Empat setting timer (`sessionVisible`/`fileVisible`/`sessionPrefix`/
  `filePrefix`) berada tiga level nested (`toolbar.timers.*`), tidak cocok
  dengan `SettingsPath` dua-level milik `Feature`/`FeatureToggle`. Diselesaikan
  dengan meng-cast `settingKey` (`as unknown as SettingsPath`) memakai string
  fabrikasi unik per kelas dan mengakses field settings langsung — pola yang
  sama dipakai T07 untuk `toolbar.mode`/`toolbar.dockAlwaysVisible`, namun T07
  masih memakai member `SettingsPath` asli yang valid; T10 memerlukan
  fabrikasi karena tidak ada member dua-level yang valid untuk field nested.
  Keputusan pendekatan (vs memperluas `SettingsPath` ke 3 level, atau
  menggabungkan 4 setting jadi satu Feature) dikonfirmasi user secara eksplisit
  setelah exit Auto Mode.
- T11 dan seterusnya (callout catalog dan seterusnya) belum diimplementasikan.
  Runtime Obsidian desktop/mobile/popout belum diuji untuk task manapun —
  environment ini tidak punya host Obsidian, dan Vitest terkonfigurasi
  `environment: "node"` sehingga UI toolbar
  (`src/components/floaty-toolbar/toolbar.ts` dan `hud.ts`), clipboard
  controller wiring, dock mouseenter/mouseleave/Escape wiring, status-bar
  clearance, `active-leaf-change`/`file-open` elapsed wiring, dan status bar
  HUD placement hanya diverifikasi lewat typecheck/lint/build plus pure
  model/helper functions (`dockBottomOffsetPx`, `elapsed.ts`, `hud.ts` pure
  bagian) yang diuji unit test, bukan DOM/mock `Workspace` penuh atau QA
  runtime. Feature classes toggle dock/timer tidak punya unit test — repo ini
  tidak punya harness untuk mock `SettingGroup` Obsidian. Hasil QA
  standardization sebelumnya bukan bukti fitur Floaty Toolbar.
- Bug runtime dilaporkan user setelah QA nyata di T10: HUD status bar tidak
  ticking (hanya update saat interaksi editor) dan file timer tetap 00:00.
  Root cause: tidak ada tick clock periodik (hanya reactive ke event lain)
  dan `fileElapsed` tidak pernah di-init untuk file yang sudah terbuka saat
  plugin load. Diperbaiki dengan `setInterval` 1 detik per controller
  (start/stop mengikuti `toolbar.enabled`) dan init `syncFileElapsed()` di
  `onLayoutReady()`. `pnpm run test`/`pnpm run check:ci` tetap hijau; belum
  diverifikasi ulang oleh user di Obsidian.
- Scope addition: timer update interval dapat dikonfigurasi 1-300 detik
  (`toolbar.timers.updateIntervalSeconds`, default 1) supaya tick per detik
  bisa dikurangi agar tidak distraksi saat fokus menulis, tanpa mengubah
  akurasi elapsed (tetap berbasis selisih timestamp). Free numeric input
  dengan clamping dipilih user dibanding dropdown preset. `pnpm run test`
  (56/56) dan `pnpm run check:ci` hijau; belum diverifikasi di Obsidian.
- T11 (Slice E start): catalog 13 builtin Obsidian callout type + alias resmi
  dan `CalloutSettings` additive (`outputMode`, `entries` dengan ID/label/
  order/enabled/source/styling tervalidasi). Styling `override` baru
  divalidasi tipenya (string/null), belum divalidasi format warna/Lucide
  icon — ditunda ke Slice F, dicatat di plan.md. Tidak ada UI/menu/markdown
  insertion di T11; itu T12-T13. `pnpm run test` (66/66) dan
  `pnpm run check:ci` hijau.
- T12: callout dropdown (`<select>` native) di toolbar, `changeCalloutType`
  hanya mengganti token `[!id]` pada baris pertama seleksi sehingga quote
  depth/fold/title existing terjaga tanpa parsing nested terpisah, dan
  seleksi yang memotong header callout di tengah ditolak
  (`hasAmbiguousCalloutHeader`). GitHub Alerts output mode belum
  diimplementasikan (task terpisah). `pnpm run test` (81/81) dan
  `pnpm run check:ci` hijau.
- T13: tab "Callouts" settings dengan Obsidian `Setting` API murni — reorder
  arrow-up/down, toggle enabled/hidden, reset label builtin, tambah/hapus
  custom dengan validasi ID. `TypewriterModeSettingTab.setActiveTab()` +
  `lib.ts` `openCalloutManager()` (memakai `app.setting`/`openTabById`, API
  internal Obsidian yang tidak terdokumentasi tapi lazim dipakai plugin
  komunitas, dengan fallback `Notice`) menghubungkan opsi "Manage callouts…"
  di dropdown toolbar ke tab tersebut. Slice E (T11-T13) selesai. `pnpm run
  test` (83/83) dan `pnpm run check:ci` hijau.
- **Bug tooling penting**: floating toolbar tidak pernah tampak saat seleksi
  teks di vault user meskipun HUD status bar bekerja, dan tidak ada error
  console. Root cause dikonfirmasi lewat DevTools bersama user: Dart Sass
  menyisipkan UTF-8 BOM di awal `dist/styles.css`, tepat sebelum rule
  PERTAMA hasil kompilasi (`.ptm-floaty-toolbar{position:fixed;...}`).
  Karena Obsidian menyuntikkan file ini sebagai text content `<style>`
  (bukan `<link>` dengan deteksi encoding), BOM tersebut membuat browser
  gagal parse rule pertama secara silent — rule itu hilang total dari
  `document.styleSheets`, sehingga elemen jatuh ke `position:static` bawaan
  dan mengikuti document flow biasa alih-alih fixed dekat seleksi. Rule lain
  (`-button`/`-hud`/`-dock`, dst.) tidak terdampak karena posisinya bukan di
  awal file. Fix: `scripts/lib/build.ts` men-strip leading BOM dari output
  Sass sebelum menulis `styles.css`. Diverifikasi lewat `xxd` (BOM hilang)
  dan `pnpm run deploy` ke vault user. Ini bug tooling lama yang baru
  terdeteksi sekarang karena baru di T04 elemen `.ptm-floaty-toolbar` jadi
  rule PERTAMA di file terkompilasi (urutan `@use` di `_index.scss`
  menempatkannya di awal) — kemungkinan sudah ada sejak awal tapi tidak
  pernah termanifestasi sebagai bug yang terlihat.

## Remaining runtime and integration acceptance

- Runtime Obsidian desktop, mobile, dan popout belum diuji pada perubahan ini.
- Workflow GitHub Actions belum dijalankan dari perubahan lokal ini.
- Branch protection GitHub belum diverifikasi atau dikonfigurasi.
- Dependency direction dan cycles belum ditegakkan dengan architecture tests.
- Akurasi docs dan ukuran atomic commit tetap memerlukan review manusia.

Lihat [AI Assisted Development](./for-developers/ai-assisted-development.md)
dan [QA guide](./for-developers/run-qa-before-merge-or-release.md).
