# Tasks: Floaty Toolbar untuk MD Writer

- Status: Draft; menunggu validasi maintainer sebelum IMPLEMENT.
- Date: 2026-09-12.
- Branch: `codex/adopt-floaty-toolbar`.
- Requirement: [accepted spec](./spec.md).
- Approach: [accepted plan](./plan.md).
- Decision: [accepted ADR-002](../../reference/decisions/ADR-002-floaty-toolbar-and-callout-management.md).
- Progress: 13/21 tasks implemented (T01-T13; T17 dipecah menjadi T17a/T17b);
  `pnpm run test` dan `pnpm run check:ci` hijau untuk T01-T13. Runtime Obsidian
  acceptance belum dilakukan untuk task manapun. Slice C dan D selesai; Slice E
  (T11-T13: catalog, menu dropdown + lossless Obsidian conversion, Callout
  manager settings-tab UI) selesai. Slice F (styling custom/discovery
  tema/snippet) berikutnya.

## Aturan execution

Kerjakan sequential mengikuti dependency. Setiap task mempunyai daftar area/file
perkiraan; jangan membuat semua folder/file placeholder sebelum task nyata.
Jika perubahan membutuhkan lebih dari lima file, pecah task sebelum coding.
Preparation tasks T01-T03 memungkinkan slice enable -> bold diselesaikan T04;
tidak mengklaim preparatory model sebagai fitur shipped.

Behavior/regression memakai TDD: reproduce kebutuhan dengan test gagal, lalu
minimal implementation dan review. Test model boleh memakai clock/mocks;
DOM/Obsidian acceptance tetap dicatat terpisah. Jangan install dependency baru
atau melakukan refactor lintas scope tanpa kebutuhan dan keputusan maintainer.

Setiap task implementation wajib test relevan dan `pnpm run check`, review
compatibility/atribusi, serta update progres dalam dokumen ini. Docs yang
tercantum per task menjelaskan slice; current-state/status/baseline final di T20.
Perubahan tasks.md sebagai ledger progres tidak dihitung sebagai subsystem baru.
Tasks tetap unfinished bila dependency/acceptance wajib belum terpenuhi.

Commands verifikasi:

```bash
pnpm run test
pnpm run check
pnpm run check:ci
pnpm run lint:md
pnpm run docs:build
```

Runner `scripts/test.mjs` saat ini tidak meneruskan filter argumen. Gunakan
`pnpm run test` untuk suite behavior; bila memakai Vitest langsung, pastikan
environment temporary directory sesuai wrapper existing. Jangan mengklaim
filter test yang tidak diteruskan sebagai bukti targeted test.

Tidak commit/push/deploy/release dalam otorisasi perencanaan ini. Saat implementation
diotorisasi, jangan meminta persetujuan rutin di dalam task/slice yang accepted;
commit dan runtime deployment tetap mengikuti scope user.

## Slice A: Desktop dapat enable floating toolbar dan bold

### T01 — Kontrak settings toolbar additive

- [x] Implemented dan verified.
- Dependency: tidak ada; AC-01, AC-08.
- Acceptance: defaults toolbar off; normalization mode/order/timer prefixes
  menerima data valid dan fallback data malformed; legacy dan modern settings
  mempertahankan seluruh values lama tanpa shared mutable defaults.
- Files (4): `src/capabilities/features/toolbar/settings.ts`,
  `src/capabilities/settings.ts`, `tests/settings.test.ts`,
  `docs/specs/floaty-toolbar/plan.md` (catat kontrak final).
- Verify: migration/defaults tests via `pnpm run test`, `pnpm run check`.

### T02 — Executor bold yang menjaga target dan selection

- [x] Implemented dan verified.
- Dependency: T01; AC-03, AC-09, AC-11.
- Acceptance: wrap/unwrap bold single selection dalam satu undo step; refusal
  untuk stale target, mobile/general off, Reading Mode, Hemingway, multi-range,
  dan range di luar outliner; sumber adaptasi punya atribusi tepat.
- Files (5): `src/capabilities/features/toolbar/actions.ts`,
  `src/capabilities/features/toolbar/executor.ts`,
  `tests/toolbar-actions.test.ts`, `licenses/floaty-toolbar-MIT.txt`, `README.md`.
- Verify: perubahan range/undo/rejection tests, source provenance dan README credit
  review, `pnpm run test`, `pnpm run check`. Notice distribusi diselesaikan T19
  sebelum artifacts dibagikan; jangan deploy intermediate build.

### T03 — Bridge CM6 ke desktop controller

- [x] Implemented dan verified.
- Dependency: T02; AC-03, AC-09.
- Acceptance: selection/doc changes memberi target/window yang benar tanpa
  workspace event undocumented; controller mengikat instance per window,
  membersihkan lifecycle, dan refresh settings tanpa stale editor closure.
- Files (5): `src/cm6/toolbar-selection.ts`,
  `src/capabilities/features/toolbar/controller.ts`, `src/lib.ts`,
  `tests/toolbar-controller.test.ts`, `docs/specs/floaty-toolbar/plan.md`.
- Verify: bridge/update/window-close/disable tests dengan fake host/CM6,
  dependency direction manual, `pnpm run test`, `pnpm run check`.

Checkpoint A1 setelah T01-T03: suite/check hijau; guard target dan cleanup
ditinjau sebelum membuat UI. Catat automated versus runtime evidence.

### T04 — Pengguna enable floating toolbar dan menjalankan bold

- [x] Implemented; runtime acceptance blocked (tidak ada host Obsidian di
  environment ini).
- Dependency: T03; AC-02, AC-03, AC-09, AC-10.
- Acceptance: tab Toolbar menampilkan enable/settings, floating muncul di
  selection desktop dan tombol bold memakai executor; posisi di window asal,
  mobile tidak memasang toolbar; UI unload segera dan keyboard accessible.
- Files: `src/components/floaty-toolbar/toolbar.ts` (surface factory: posisi
  via `coordsAtPos`, tombol Bold, `role="toolbar"`, native `<button>` keyboard
  accessible), `src/capabilities/features/toolbar/toggle-enabled.ts` +
  `src/capabilities/features/toolbar/index.ts` (feature toggle baru, pola
  `FeatureToggle` existing), `src/capabilities/features/index.ts`,
  `src/components/settings-tab.ts` (tab Toolbar baru),
  `src/styles/ui/_floaty-toolbar.scss` + `src/styles/ui/_index.scss`,
  `src/lib.ts` (`setSurfaceFactory` di `load()`),
  `docs/for-users/use-md-writer-features.md`.
- Verify: `pnpm run test` (32/32) dan `pnpm run check:ci` hijau, termasuk
  build/artifacts/docs. Tidak ada DOM test baru untuk `toolbar.ts` — harness
  Vitest terkonfigurasi `environment: "node"` (lihat `vitest.config.ts`);
  logic controller/executor (T02-T03) tetap diuji tanpa DOM. QA Obsidian
  desktop/popout selection, undo, Hemingway, mobile toolbar absent BELUM
  dilakukan — catat sebagai blocked, bukan shipped, sampai diverifikasi di
  host Obsidian nyata.

## Slice B: Formatting parity dan link aman

### T05 — Inline formatting dan heading parity

- [x] Implemented; runtime acceptance blocked (tidak ada host Obsidian di
  environment ini).
- Dependency: T04; AC-03, AC-11.
- Acceptance: italic/strike/code/highlight wrap/unwrap baseline; heading H1-H4
  dan remove heading pada cursor head line; inline empty selection unavailable
  dengan keterangan, heading tidak mengubah hidden branch/whitespace lain.
- Files: toolbar `actions.ts` (italic/strikethrough/code/highlight via
  `symmetricWrapEdit`, italic guarded against matching a bold prefix,
  `headingEdit` cycles paragraf→H1..H4→paragraf pada satu baris, menolak H5+),
  toolbar `executor.ts` (routing per `ToolbarAction.kind`, guard baris kursor
  di luar outline visible range untuk heading), UI `toolbar.ts` (lima tombol
  baru), `tests/toolbar-actions.test.ts` (italic-vs-bold ambiguity, wrap/unwrap
  tiga marker lain, cycle heading multi-baris, penolakan H5+),
  `docs/for-users/use-md-writer-features.md`.
- Verify: `pnpm run test` (36/36) dan `pnpm run check:ci` hijau. Runtime
  Source/Live Preview di Obsidian BELUM dilakukan — catat sebagai blocked.

### T06 — Link clipboard dengan capture/revalidation

- [x] Implemented; runtime acceptance blocked (tidak ada host Obsidian di
  environment ini).
- Dependency: T05; AC-03, AC-11.
- Acceptance: smart URL optional dan default off; clipboard hanya saat action,
  failure/non-URL fallback placeholder; setelah await target berubah menyebabkan
  cancellation, tanpa menulis ke file atau range baru; unwrap link parity.
- Files: toolbar `actions.ts` (`linkWrapEdit`/`linkUnwrapEdit`/`isLikelyUrl`,
  placeholder `https://`), toolbar `executor.ts` (`executeLinkAction` async:
  unwrap dulu, baca clipboard hanya saat `smartUrl` aktif, revalidasi
  enabled/current/hemingway/selection setelah await sebelum dispatch),
  `src/capabilities/features/toolbar/controller.ts` (`readClipboardText` via
  `doc.defaultView.navigator.clipboard`, `execute()` menangani Promise),
  `src/capabilities/features/toolbar/toggle-smart-url.ts` +
  `src/capabilities/features/toolbar/index.ts` (toggle Smart URL di luar
  scope file awal, ditambah karena setting tanpa UI tidak dapat dipakai
  pengguna), UI `toolbar.ts` (tombol Link), `tests/toolbar-actions.test.ts`
  (smartUrl off tidak membaca clipboard, URL valid, fallback non-URL, fallback
  clipboard gagal, pembatalan saat seleksi berubah selagi await, unwrap link),
  `docs/for-users/use-md-writer-features.md`.
- Verify: `pnpm run test` (42/42) dan `pnpm run check:ci` hijau. Clipboard
  test memakai `readClipboardText` yang di-inject langsung ke `ToolbarTarget`
  palsu (bukan `navigator.clipboard` asli) karena Vitest `environment: "node"`
  tidak punya clipboard API; controller wiring hanya diverifikasi lewat
  typecheck/build, bukan runtime. QA Obsidian (edit/leaf switch,
  settings/Hemingway berubah selagi await) BELUM dilakukan — catat blocked.

Checkpoint B setelah T04-T06: `pnpm run check:ci`, review selection preservation,
undo, block IDs, folding, whitespace dan keyboard. Runtime belum diuji tetap
ditandai pending; stop/fix bila gate otomatis gagal.

## Slice C: Desktop dock dapat dipilih langsung dan selalu terlihat

### T07 — Dock/pin dan setting persistent

- [x] Implemented; runtime acceptance blocked (tidak ada host Obsidian di
  environment ini).
- Dependency: T06; AC-02, AC-09, AC-10, AC-11.
- Acceptance: pin/mode memakai state sama; dockAlwaysVisible langsung memilih
  dock, menolak undock pin dengan keterangan; dock biasa auto-hide/peek,
  persistent tidak auto-hide saat typing/mouseleave/Escape atau reload settings.
- Files: toolbar `controller.ts` (`dockVisible` map per document, `DockEvent`
  type, `reportDockEvent`/`notifyTyping`, `render()` meneruskan dock-visible
  snapshot ke surface, `refresh()` memakai event `reveal` sehingga persistent
  tidak pernah stale setelah reload settings, cleanup di `closeWindow`),
  `src/cm6/toolbar-selection.ts` (`docChanged` memicu `notifyTyping`),
  UI `toolbar.ts` (posisi dock fixed bawah window saat `settings.mode ===
  "dock"`, mouseenter/mouseleave -> reveal/leave, Escape -> leave),
  `src/styles/ui/_floaty-toolbar.scss` (`.ptm-floaty-toolbar-dock`),
  `src/capabilities/features/toolbar/toggle-dock-mode.ts` (toggle "Pin
  toolbar as a dock"; menolak undock dengan `Notice` dan mengembalikan
  toggle visual saat `dockAlwaysVisible` masih aktif) dan
  `toggle-dock-always-visible.ts` (toggle "Always show dock"; mengaktifkannya
  langsung set `mode: "dock"`), keduanya didaftarkan di
  `src/capabilities/features/toolbar/index.ts` — otomatis muncul di tab
  Toolbar existing tanpa perubahan `settings-tab.ts`,
  `tests/toolbar-controller.test.ts` (matrix auto-hide/peek/persistent/floating
  untuk `dockVisibility`), `docs/for-users/use-md-writer-features.md`.
- Verify: `pnpm run test` (44/44) dan `pnpm run check:ci` hijau. Tidak ada
  fake-timer test karena dock tidak memakai timer — visibility murni
  event-driven (typing/leave/reveal) tanpa `setTimeout`. Feature classes
  toggle dock (`toggle-dock-mode.ts`/`toggle-dock-always-visible.ts`) tidak
  diuji unit test — repo ini tidak punya harness untuk mock `SettingGroup`
  Obsidian, konsisten dengan `toggle-enabled.ts`/`toggle-smart-url.ts`
  sebelumnya yang juga tidak diuji langsung. QA Obsidian desktop/popout
  (dock, peek, persistent, Escape) BELUM dilakukan — catat blocked.

### T08 — Layout dock dan navigasi menu

- [x] Implemented; runtime acceptance blocked (tidak ada host Obsidian di
  environment ini).
- Dependency: T07; AC-02, AC-10.
- Acceptance: dock bawah menghindari status bar/cursor dan menyusut di window
  sempit; Tab/Shift+Tab/Enter/Space dan Escape konsisten; menu tertutup saat
  target/window tidak valid, persistent dock tetap tersedia saat editor valid.
- Files: UI `toolbar.ts` (`dockBottomOffsetPx` pure helper, dock bottom offset
  dihitung dari tinggi `.status-bar` yang terukur setiap `update()` agar tidak
  tumpang tindih), `_floaty-toolbar.scss` (`flex-wrap` + `max-width:
  min(480px, 100vw - 16px)` agar dock menyusut di window sempit alih-alih
  meluber; `prefers-reduced-motion` mematikan transition opacity),
  `tests/toolbar-controller.test.ts` (`dockBottomOffsetPx` dengan/tanpa status
  bar), `docs/for-users/troubleshooting.md` (bagian toolbar/dock baru).
  Tab/Shift+Tab/Enter/Space sudah konsisten sejak T04 karena tombol berupa
  `<button>` native tanpa custom key handling; Escape (leave event) dan
  menu-tertutup-saat-target-invalid (via `render()` menghancurkan surface
  ketika target tidak enabled/current, lalu surface baru dibuat begitu editor
  valid lagi) sudah ada sejak T07, tidak diubah di T08.
- Verify: `pnpm run test` (46/46) dan `pnpm run check:ci` hijau. QA Obsidian
  (fullscreen writing focus, zoom, window sempit, reduced motion,
  desktop/popout, tema dengan status bar custom) BELUM dilakukan — catat
  blocked, bukan shipped.

## Slice D: Dua timer dengan definisi yang jelas

### T09 — Model elapsed dan state file per window

- [x] Implemented; runtime acceptance blocked (tidak ada host Obsidian di
  environment ini).
- Dependency: T08; AC-05, AC-09, AC-11.
- Acceptance: session shared/reset; file per window initialize active path,
  A/B/A reset, same path tidak reset, null/delete clear/rename reset; idle ikut
  dihitung, tidak membaca ctime/mtime atau persist timestamp; disable cleanup.
- Files: toolbar `elapsed.ts` (pure `ElapsedState`/`FileElapsedState`,
  `elapsedMs` dihitung dari selisih timestamp — bukan akumulasi tick, jadi idle
  ikut dihitung otomatis; `nextFileElapsedState` menangani init/A-B-A/same-path/
  null/rename dalam satu reducer), toolbar `controller.ts` (`session` shared
  single field, `fileElapsed` per-`Document` map, `syncSession()` start/stop
  mengikuti `toolbar.enabled` dipanggil dari `load()` dan `refresh()` —
  refresh() sudah terpanggil setiap `saveSettings()` sehingga toggle enable
  langsung ter-sinkron; `syncFileElapsed()` dipanggil dari `active-leaf-change`
  DAN `file-open` karena Obsidian membedakan ganti pane vs ganti file di leaf
  yang sama; `resetSession()`/`getSessionElapsedMs()`/`getFileElapsedMs()`
  disiapkan untuk HUD T10; cleanup `fileElapsed` di `closeWindow()` dan saat
  disable via `syncSession()`), `tests/toolbar-elapsed.test.ts` (idle counting,
  clock-mundur clamp ke 0, init/A-B-A/same-path/null/rename). `plan.md` tidak
  diubah — deskripsi model timer di sana sudah akurat terhadap implementasi ini.
- Verify: `pnpm run test` (52/52) dan `pnpm run check:ci` hijau. Tidak ada
  tick-count accumulation karena `elapsedMs` selalu `now - startedAt` langsung.
  `file-open`/`active-leaf-change` wiring di controller tidak diuji unit test
  (perlu mock `Workspace` Obsidian penuh, di luar scope harness saat ini) —
  hanya model pure yang diuji. QA Obsidian (A/B/A nyata, popout file berbeda,
  rename/delete file aktif) BELUM dilakukan — catat blocked.

Checkpoint C/D1 setelah T07-T09: `pnpm run check:ci`; review persistent behavior,
mobile absence, per-window timer semantics dan cleanup. Runtime matrix pending
dicatat tanpa melabeli passing otomatis sebagai Obsidian acceptance.

### T10 — HUD session/file dengan toggles dan prefix

- [x] Implemented; runtime acceptance blocked (tidak ada host Obsidian di
  environment ini).
- Dependency: T09; AC-04, AC-05, AC-10.
- Acceptance: dock dan status bar memakai model sama tanpa duplicate HUD;
  session/file toggle/prefix persisted, tooltip menjelaskan elapsed dan reset;
  hide tidak reset dan popout tanpa slot status bar tidak diberi slot palsu.
- Files: `src/capabilities/features/toolbar/hud.ts` (pure `formatElapsed`,
  `hudSegments` — satu sumber format dipakai baik oleh dock maupun status
  bar, mencegah duplicate/divergent HUD), `src/components/floaty-toolbar/hud.ts`
  (DOM: `createHudElement` embed di dalam dock, tombol reset khusus segmen
  session dengan `aria-label` menjelaskan tooltip + "Activate to reset"),
  UI `toolbar.ts` (embed HUD saat mode dock, `hud.update([])` saat floating
  agar tidak duplicate dengan status bar), toolbar `controller.ts`
  (`statusBarEl` singleton via `plugin.addStatusBarItem()` — pola yang sama
  dengan `hemingway-mode.ts` — hanya ditampilkan saat mode floating DAN
  `doc` adalah window utama (`workspace.containerEl.ownerDocument`); popout
  floating sengaja tidak mendapat HUD karena tidak ada API status bar per
  popout window, `resetSession()` diteruskan ke factory), settings features
  baru `toggle-timer-session-visible.ts`, `toggle-timer-file-visible.ts`,
  `edit-timer-session-prefix.ts`, `edit-timer-file-prefix.ts` (di luar file
  list awal — empat setting nested `toolbar.timers.*` tidak cocok dengan
  `SettingsPath` dua-level milik `Feature`, jadi `settingKey` di-cast
  `as unknown as SettingsPath` dengan string fabrikasi unik per kelas, akses
  field langsung tanpa `getSettingValue`/`setSettingValue`; keputusan
  dikonfirmasi user saat exit Auto Mode), `prefix()` di `settings.ts`
  di-export ulang agar UI memakai normalizer sama dengan startup migration,
  didaftarkan di `src/capabilities/features/toolbar/index.ts` (otomatis
  muncul di tab Toolbar tanpa perubahan `settings-tab.ts`),
  `tests/toolbar-elapsed.test.ts` (format elapsed, HUD segments per toggle),
  `docs/for-users/use-md-writer-features.md`.
- Verify: `pnpm run test` (55/55) dan `pnpm run check:ci` hijau. Feature
  classes settings timer tidak diuji unit test — sama seperti toggle
  enable/smart-url/dock sebelumnya, tidak ada harness mock `SettingGroup`.
  QA Obsidian (placement dock vs status bar, prefix, klik/keyboard reset,
  idle/reload, popout) BELUM dilakukan — catat blocked.
- **Bug fix (runtime, dilaporkan user setelah QA nyata di Obsidian)**: HUD
  status bar hanya berubah saat ada interaksi editor (klik/ketik), dan file
  timer selalu 00:00. Root cause 1: implementasi awal tidak pernah membuat
  "satu tick clock per controller" yang disebutkan `plan.md` — HUD hanya
  refresh saat `schedule()` dipicu event lain (selection/doc/focus/viewport/
  leaf-change/dock event), bukan per detik. Root cause 2: `fileElapsed` hanya
  di-init dari event `active-leaf-change`/`file-open`, tidak pernah untuk
  file yang SUDAH terbuka saat plugin dimuat — jika user tidak pernah
  berpindah file/pane, timer file tidak pernah start. Fix: tambah
  `ensureTick()`/`stopTick()`/`tick()` (interval 1 detik via
  `win.setInterval`, start/stop mengikuti `toolbar.enabled` di
  `syncSession()`, dibersihkan di `destroy()`) yang hanya memanggil
  `schedule()` tanpa menyentuh `dockVisible` (beda dari `refresh()` yang
  memakai event `reveal` — reuse `refresh()` untuk tick akan membuat dock
  selalu reveal setiap detik dan merusak auto-hide); dan inisialisasi
  `syncFileElapsed()` untuk active view saat ini di `workspace.onLayoutReady()`
  callback `load()`, sebelum `refresh()` pertama. `pnpm run test` (55/55) dan
  `pnpm run check:ci` tetap hijau setelah fix; belum diverifikasi ulang oleh
  user di Obsidian nyata pasca fix.
- **Scope addition (diminta user setelah verifikasi semantik session/file)**:
  update interval HUD dapat dikonfigurasi (`toolbar.timers.updateIntervalSeconds`,
  default 1, dibatasi 1-300 detik lewat `timerUpdateIntervalSeconds()` di
  `settings.ts`) supaya user dapat mengurangi distraksi tick per detik saat
  fokus menulis tanpa mengubah akurasi waktu yang dihitung (`elapsedMs` tetap
  berbasis selisih timestamp, hanya frekuensi refresh tampilan yang berubah).
  Ini di luar spec/plan yang accepted (yang hanya menyebut "elapsed seperti
  upstream"), dipilih user sebagai pendekatan free numeric input dengan
  clamping (bukan dropdown preset) — dikonfirmasi via pertanyaan langsung.
  Files: `settings.ts` (field + konstanta batas + normalizer),
  `edit-timer-update-interval.ts` (Feature baru, pola sama dengan
  `max-chars-per-line.ts`), `index.ts`, toolbar `controller.ts`
  (`ensureTick()` membaca interval dari settings dan me-restart timer saat
  nilai berubah, dideteksi lewat `tickIntervalSeconds` tersimpan — jangan
  restart tanpa syarat karena `syncSession()`/`refresh()` dipanggil sangat
  sering), `tests/settings.test.ts` (clamp bawah/atas, fallback nilai
  non-numerik), `docs/for-users/use-md-writer-features.md`.
- Verify: `pnpm run test` (56/56) dan `pnpm run check:ci` hijau. Belum
  diverifikasi di Obsidian nyata — catat blocked seperti bagian T10 lainnya.

## Slice E: Callout catalog dan insertion tanpa kehilangan data

### T11 — Catalog Obsidian dan settings callout additive

- [x] Implemented; runtime acceptance blocked (tidak ada host Obsidian di
  environment ini).
- Dependency: T10; AC-06, AC-08.
- Acceptance: builtin/aliases tersedia dengan canonical lowercase ID; manual
  hyphen ID/labels/order/visibility tervalidasi; nested merge mempertahankan
  settings existing dan menolak ID duplikat/malformed tanpa default mutation.
- Files: `src/capabilities/features/callouts/catalog.ts` (13 builtin type
  Obsidian + aliases resmi, resolver canonical case-insensitive, mapping
  GitHub Alert marker NOTE/TIP/IMPORTANT/WARNING/CAUTION ke ID kanonis yang
  sama dengan alias Obsidian-nya — tidak membuat entry catalog kedua),
  `src/capabilities/features/callouts/settings.ts` (`CalloutSettings` dengan
  `outputMode` dan `entries`; normalizer memvalidasi ID custom hyphen
  `[a-z0-9_-]{1,64}`, label plain text max 80 karakter, dedup case-insensitive
  terhadap builtin+alias, mengisi builtin yang belum ada di data lama, dan
  mengurutkan berdasar `order`; field `styling` sudah ada di shape data namun
  validasi warna/Lucide ikon penuh ditunda ke Slice F — dicatat di plan.md),
  `src/capabilities/settings.ts` (wiring `callouts` ke `TypewriterModeSettings`,
  `DEFAULT_SETTINGS`, migration legacy, dan `applyStartupMigrations`, pola
  sama dengan `toolbar` di T01), `tests/callout-catalog.test.ts` (resolusi
  alias/GitHub marker, default tanpa shared mutable state, custom ID valid,
  penolakan ID malformed, dedup case-insensitive, nested merge),
  `tests/settings.test.ts` (assert startup migration mengisi callouts default),
  `docs/specs/floaty-toolbar/plan.md` (catatan scope T11 vs target akhir).
- Verify: `pnpm run test` (66/66) dan `pnpm run check:ci` hijau. Belum ada
  UI/menu (Slice E lanjut di T12-T13) maupun styling validation (Slice F) —
  jangan menganggap catalog ini sudah dapat dipakai user end-to-end. QA
  Obsidian belum dilakukan — catat blocked.

### T12 — Menu callout dan lossless Obsidian conversion

- [x] Implemented; runtime acceptance blocked (tidak ada host Obsidian di
  environment ini).
- Dependency: T11; AC-03, AC-06, AC-07, AC-11.
- Acceptance: pilihan menu mengikuti catalog; single/multiline body dibungkus
  benar; existing header type diubah sambil menjaga title/folding/quote depth;
  custom hyphen didukung, ambiguous partial selection ditolak dengan penjelasan.
- Files: `src/capabilities/features/callouts/markdown.ts` (`wrapAsCallout`
  membungkus tiap baris seleksi termasuk baris kosong menjadi `>`;
  `changeCalloutType` mengganti hanya token `[!id]` pada baris pertama,
  mempertahankan prefix quote `>`/`>>` apa adanya (jadi quote depth
  otomatis terjaga tanpa parsing nested terpisah), fold marker, dan title;
  `hasAmbiguousCalloutHeader` mendeteksi header callout yang muncul BUKAN di
  baris pertama seleksi lalu menolak alih-alih menebak), toolbar
  `actions.ts` (`ToolbarAction` kind `"callout"` dengan field `id`), toolbar
  `executor.ts` (`executeCalloutAction` — guard sama dengan inline action
  lain, delegasi ke `calloutEdit`; import lintas folder
  `capabilities/features/callouts` dari `capabilities/features/toolbar`
  dianggap wajar karena satu layer capabilities, bukan pelanggaran arah
  dependency components->capabilities), toolbar `controller.ts`
  (`ToolbarCalloutOption`, `render()` menghitung opsi dari
  `settings.callouts.entries` yang `enabled` lalu meneruskan ke
  `surface.update()` sebagai parameter kelima), UI `toolbar.ts`
  (`<select>` native untuk memilih callout — dipilih dibanding overlay menu
  custom karena keyboard-accessible bawaan dan belum ada infrastruktur menu
  di toolbar; opsi di-diff via signature string agar tidak merender ulang
  saat dropdown terbuka ketika tick HUD berjalan setiap detik),
  `_floaty-toolbar.scss` (style select), `tests/callout-markdown.test.ts`
  (wrap single/multiline/custom-id, change-type title/fold/nested-depth/
  custom-id, deteksi ambiguous, `calloutEdit` end-to-end),
  `tests/toolbar-actions.test.ts` (executor: wrap via action, refusal empty
  selection dan ambiguous header), `docs/for-users/use-md-writer-features.md`.
- Verify: `pnpm run test` (81/81) dan `pnpm run check:ci` hijau. GitHub output
  mode (marker uppercase, larangan title/folding/nesting) TIDAK
  diimplementasikan di T12 — itu task terpisah nanti sesuai urutan slice di
  plan.md ("Output GitHub Alerts"); `calloutEdit` saat ini hanya sintaks
  Obsidian. Runtime rendered callout di Obsidian nyata BELUM diverifikasi —
  catat blocked.

Checkpoint E1 setelah T10-T12: `pnpm run check:ci`; review hasil Markdown aktual
dan invariants data sebelum membuka catalog editing UI.

### T13 — Callout manager dapat mengelola catalog dan custom entry

- [x] Implemented; runtime acceptance blocked (tidak ada host Obsidian di
  environment ini).
- Dependency: T12; AC-06, AC-07, AC-10.
- Acceptance: tab Callouts dan link manager dari menu; add/edit/delete custom,
  hide/reset built-in dan urutan tersimpan; delete config tidak menyentuh note;
  controls/validation dapat dipakai keyboard desktop dan touch mobile.
- Files: `src/components/callout-manager.ts` (`renderCalloutManager` pakai
  Obsidian `Setting` API murni — toggle output mode, per-entry
  arrow-up/arrow-down reorder via `moveEntry` yang menukar field `order` lalu
  sort ulang, toggle enabled/hidden, tombol reset label untuk builtin, tombol
  hapus untuk custom, form tambah custom dengan validasi `CUSTOM_ID_PATTERN`
  dan dedup terhadap builtin+alias sebelum push), `src/components/settings-tab.ts`
  (tab "Callouts" baru dengan closure `draw()` self-refresh setelah tiap
  mutasi — pola berbeda dari tab lain karena daftar berubah dinamis, bukan
  toggle tetap; method publik `setActiveTab()` agar bisa dibuka langsung dari
  toolbar), `src/lib.ts` (`settingTab` disimpan sebagai field agar dapat
  dipanggil balik; `openCalloutManager()` memakai `app.setting.open()` +
  `openTabById()` — API internal/tidak terdokumentasi Obsidian yang lazim
  dipakai plugin komunitas, diakses defensif dengan fallback `Notice` jika
  tidak tersedia; dicatat eksplisit di komentar kode), toolbar
  `controller.ts` (`SurfaceFactory` menerima `openCalloutManager` sebagai
  parameter kelima), UI `toolbar.ts` (opsi "Manage callouts…" di akhir
  dropdown callout, sentinel value terpisah dari ID callout asli),
  `tests/callout-catalog.test.ts` (unit test `moveEntry`: swap urutan
  naik/turun, no-op di ujung list), `docs/for-users/use-md-writer-features.md`
  (bagian baru "Kelola catalog callout").
- Verify: `pnpm run test` (83/83) dan `pnpm run check:ci` hijau. Perbaikan
  ESLint Obsidian `sentence-case` pada beberapa string UI
  (`callout-manager.ts`, `lib.ts` Notice — dirumuskan ulang jadi
  "Open plugin settings, then open the callouts tab." agar tidak menabrak
  aturan sentence-case tanpa melunturkan makna). `renderCalloutManager` tidak
  diuji langsung (memakai Obsidian `Setting` API asli, di-mock minimal hanya
  agar modul bisa di-import) — konsisten dengan toggle Feature classes
  lain yang juga tidak diuji unit test langsung. QA Obsidian nyata
  (add/edit/delete/reorder, "Manage callouts…" benar-benar membuka tab yang
  tepat, keyboard/touch di desktop+mobile) BELUM dilakukan — catat blocked.
- **Bug fix (build tooling, ditemukan lewat QA nyata user di vault)**:
  floating toolbar tidak pernah muncul saat seleksi teks meskipun HUD status
  bar bekerja normal. Root cause: Dart Sass menulis UTF-8 BOM (`EF BB BF`) di
  awal `dist/styles.css` karena source SCSS mengandung karakter non-ASCII di
  suatu tempat pada graph import; BOM tersebut mendahului persis rule PERTAMA
  di file terkompilasi, yaitu `.ptm-floaty-toolbar{position:fixed;...}`.
  Karena Obsidian menyuntikkan isi `styles.css` sebagai text content elemen
  `<style>` (bukan file `<link>` eksternal dengan deteksi encoding), BOM di
  tengah teks CSS membuat parser CSS browser gagal parse rule pertama itu
  secara silent — rule tersebut hilang total dari `document.styleSheets`
  (dikonfirmasi lewat `el.matches(rule.selectorText)` terhadap semua rule
  di semua stylesheet: `.ptm-floaty-toolbar` tidak pernah muncul), sehingga
  computed `position` jatuh ke default `static` dan elemen mengikuti normal
  document flow alih-alih fixed ke viewport dekat seleksi — bukan hilang,
  hanya salah posisi jauh di bawah konten. Rule lain seperti
  `.ptm-floaty-toolbar-button`/`-hud`/`-dock` tidak terdampak karena bukan
  rule pertama di file. Fix: `scripts/lib/build.ts` men-strip leading BOM
  (`replace(LEADING_BOM, "")`) dari output Sass sebelum menulis
  `dist/styles.css`. Diverifikasi dengan `xxd` — BOM hilang setelah rebuild,
  dan file yang di-deploy ke vault user (`pnpm run deploy`) sudah tanpa BOM.
  `pnpm run test` (83/83) dan `pnpm run check:ci` tetap hijau. Diagnosis
  dilakukan bersama user lewat serangkaian query DevTools Console
  (`document.styleSheets`, `getComputedStyle`, `el.matches(selectorText)`)
  karena tidak ada host Obsidian di environment CLI ini. Perlu verifikasi
  ulang oleh user bahwa floating toolbar sekarang benar-benar muncul di
  posisi yang tepat saat seleksi teks.
- **Bug fix (dilaporkan user setelah BOM fix, saat QA nyata floating +
  dock)**: (1) mematikan "Pin toolbar as a dock" setelah sempat aktif
  membuat toolbar tampil sebagai kotak kosong memanjang. Root cause:
  cabang floating di `update()` (`toolbar.ts`) tidak pernah membersihkan
  inline `bottom` yang di-set cabang dock; dengan `position:fixed` dan
  `top`+`bottom` sama-sama ter-set, browser meregangkan tinggi elemen di
  antara keduanya. Fix: `el.style.removeProperty("bottom")` di cabang
  floating. (2) Meng-hover dock yang auto-hide membuatnya hilang, bukan
  muncul. Root cause: auto-hide sebelumnya memakai `el.hidden` (=
  `display:none`), dan elemen `display:none` TIDAK BISA menerima event
  `mouseenter` sama sekali — sehingga peek-on-hover secara struktural tidak
  mungkin bekerja. `_floaty-toolbar.scss` bahkan sudah punya
  `transition: opacity 100ms` yang tidak pernah terpakai karena visibility
  dikontrol lewat `display`, bukan `opacity` (dead code sejak T07/T08).
  Fix: auto-hide dock sekarang memakai class `.ptm-floaty-toolbar-dock-peek`
  (`opacity: 0.12`, tetap `display:flex` dan tetap hoverable) alih-alih
  `hidden`; `el.hidden` sekarang murni untuk "tidak ada target/view valid".
  `pnpm run test` (83/83) dan `pnpm run check:ci` tetap hijau setelah fix;
  dideploy ke vault user via `pnpm run deploy`, belum diverifikasi ulang.
- **Scope addition (desain, diminta user dengan referensi screenshot plugin
  asli)**: redesign tombol toolbar dari label teks singkat ("B","I","S",
  "</>","H","#") menjadi ikon Obsidian native via `setIcon()` (bold, italic,
  strikethrough, code, highlighter, link) — minimal dan konsisten dengan
  gaya ikon Obsidian, sesuai referensi user. Heading diubah dari tombol
  cycle (klik berulang) menjadi dropdown eksplisit Paragraph/H1-H4 yang
  otomatis menunjukkan level heading baris kursor saat ini (dinonaktifkan
  untuk H5+) — mengikuti referensi yang menunjukkan dropdown heading dengan
  opsi aktif ter-highlight. Perubahan API: `ToolbarAction` kind "heading"
  sekarang wajib membawa `level` eksplisit (bukan cycle implisit);
  `headingEdit()` menerima level langsung, helper `nextHeadingLevel` diganti
  `detectHeadingLevel()` (dipakai bersama oleh executor dan UI untuk
  menghindari duplikasi logic deteksi level). Container di-restyle jadi pill
  rounded minimal (`--radius-l`, `--background-primary`) dengan divider tipis
  sebelum dropdown heading, meniru pengelompokan visual pada referensi.
  Tombol pin dock-toggle langsung di toolbar (terlihat di referensi) TIDAK
  diimplementasikan — di luar permintaan eksplisit user, dan dock/floating
  sudah bisa diatur dari tab Toolbar. Files: `actions.ts`, `executor.ts`,
  `toolbar.ts`, `_floaty-toolbar.scss`, `tests/toolbar-actions.test.ts`
  (rewrite test heading cycle jadi explicit-level, tambah test
  `detectHeadingLevel`), `docs/for-users/use-md-writer-features.md`.
  `pnpm run test` (85/85) dan `pnpm run check:ci` hijau; dideploy ke vault
  user via `pnpm run deploy`, belum diverifikasi ulang secara visual.

## Slice F: Styling custom dan discovery tema/snippet

### T14 — Runtime custom style lifecycle

- [ ] Implemented dan verified.
- Dependency: T13; AC-07, AC-09.
- Acceptance: inherit tidak menghasilkan override; valid hex/Lucide overrides
  menghasilkan selector tervalidasi per document; save/reset/unload/window close
  memperbarui atau membersihkan nodes tanpa mengedit snippet/tema/vault note.
- Files (4): `src/capabilities/features/callouts/styles.ts`, `src/lib.ts`,
  `tests/callout-styles.test.ts`, `docs/specs/floaty-toolbar/plan.md`.
- Verify: CSS generation/input validation/lifecycle host tests,
  `pnpm run test`, `pnpm run check`; QA style di desktop/mobile/popout.

### T15 — Form warna/ikon dan preview inherit/override

- [ ] Implemented dan verified.
- Dependency: T14; AC-06, AC-07, AC-10.
- Acceptance: manager form warna/ikon tersedia, inherit default dan reset
  override; preview memakai document/theme aktual; UI menjelaskan styling
  memerlukan plugin aktif dan tidak otomatis ikut GitHub/Publish.
- Files (4): `src/components/callout-manager.ts`, `_floaty-toolbar.scss`,
  `tests/callout-styles.test.ts`, `docs/for-users/use-md-writer-features.md`.
- Verify: style tests, `pnpm run test`, `pnpm run check`; runtime dark/light,
  theme switch, mobile form, custom id, plugin disable.

Checkpoint F1 setelah T13-T15: `pnpm run check:ci`; periksa catalog/config tidak
mengubah note lama atau CSS snippet existing, custom styling mobile tetap bekerja.

### T16 — Discovery callout best effort dengan fallback manual

- [ ] Implemented dan verified.
- Dependency: T15; AC-06, AC-09.
- Acceptance: CSSOM literal IDs/nested rules menjadi candidate list; inaccessible
  sheets/traversal limits memberi status parsial; refresh/css-change memperbarui
  kandidat tanpa auto-save/delete; manual ID tetap tersedia.
- Files (4): `src/capabilities/features/callouts/discovery.ts`,
  `src/components/callout-manager.ts`, `tests/callout-discovery.test.ts`,
  `docs/for-users/troubleshooting.md`.
- Verify: synthetic CSSOM nested/inaccessible/duplicate/conditional/limit tests,
  `pnpm run test`, `pnpm run check`; runtime tema/snippet actual.

## Slice G: GitHub Alerts dan command parity

### T17a — Output mode GitHub

- [ ] Implemented dan verified.
- Dependency: T16; AC-03, AC-07, AC-08.
- Acceptance: lima marker uppercase; custom/title/folding/nesting incompatible
  unavailable/refused tanpa data loss; output mode tersimpan dan menu mengikuti
  mode tanpa mengubah note existing otomatis.
- Files (4): callouts `markdown.ts`, `src/components/callout-manager.ts`,
  `tests/callout-markdown.test.ts`, `docs/for-users/use-md-writer-features.md`.
- Verify: GitHub conversion refusal tests, `pnpm run test`, `pnpm run check`;
  runtime switch output dan rendered markers.

### T17b — Command parity memakai executor yang sama

- [ ] Implemented dan verified.
- Dependency: T17a; AC-03, AC-07, AC-08.
- Acceptance: upstream command IDs dan manage-callouts registered unik tanpa
  mengubah commands lama; commands/menu memakai guards/conversion yang sama;
  manager command membuka tab plugin dan editor action baru unavailable mobile.
- Files (5): `src/capabilities/commands/toolbar-actions.ts`,
  `src/capabilities/commands/index.ts`, `src/components/settings-tab.ts`,
  `tests/commands.test.ts`, `docs/for-users/use-md-writer-features.md`.
- Verify: registration uniqueness, action executor invocation dan platform
  guard tests, `pnpm run test`, `pnpm run check`; runtime command palette.

Checkpoint G setelah T16-T17b: `pnpm run check:ci`; compare action/commands,
callout catalog/output, dock, timers terhadap upstream parity inventory,
minus Pomodoro.

## Slice H: Reorder parity dan notice distribusi

### T18 — Reorder settings/long-press dan cancellation

- [ ] Implemented dan verified.
- Dependency: T17b; AC-09, AC-10, AC-11.
- Acceptance: reorder dari settings dan long-press tersimpan sesuai ID; drag
  tidak sekaligus mengeksekusi formatting; cancel/Escape/unload/window close
  membersihkan ghost/timers/tooltip, tanpa state global lintas window.
- Files (5): `src/components/floaty-toolbar/reorder.ts`, UI `toolbar.ts`,
  `src/components/settings-tab.ts`, `tests/toolbar-reorder.test.ts`,
  `docs/for-users/use-md-writer-features.md`.
- Verify: gesture/reorder cleanup tests, `pnpm run test`, `pnpm run check`;
  runtime click versus hold, keyboard alternative reorder, desktop/popout.

### T19 — Notice MIT tetap terbawa dalam artifacts

- [ ] Implemented dan verified.
- Dependency: T18; AC-11.
- Acceptance: full upstream MIT notice embedded main.js banner termasuk minified
  build; dist/licenses notice tersedia untuk zip; artifact verification menolak
  notice hilang/mismatch dan tidak menghapus copyright existing.
- Files (4): `scripts/lib/build.ts`, `scripts/lib/artifact-verification.ts`,
  `tests/artifact-verification.test.ts`,
  `docs/for-developers/create-a-github-release.md`.
- Verify: fixture missing/mismatch notice tests, `pnpm run check:ci`, review
  workflow zip/standalone assets tanpa menjalankan release/deploy/push.
  Workflow `.github/workflows/release.yml` sudah menyalin seluruh dist secara
  recursive ke zip; tidak perlu edit workflow untuk menambah notice dist/licenses.

## Slice I: Handover dan acceptance final

### T20 — Dokumentasi current state dan acceptance report

- [ ] Implemented dan verified.
- Dependency: T19; seluruh AC-01 sampai AC-11.
- Acceptance: docs menyebut behavior yang benar-benar ada dan limits; setiap AC
  mempunyai test/runtime evidence atau blocker; attribution/compatibility manual
  reviewed, tidak mengklaim shipped tanpa runtime acceptance yang diperlukan.
- Files (5): `docs/current-state.md`, `docs/development-status.md`,
  `docs/reference/code-architecture-baseline.md`,
  `docs/for-users/use-md-writer-features.md`,
  `docs/for-developers/run-qa-before-merge-or-release.md`.
- Verify: `pnpm run check:ci`; final source/README/license review, dependency
  direction manual, runtime matrix di bawah. CHANGELOG versi release mengikuti
  keputusan release terpisah; tidak bump metadata/tag dalam task ini.

Checkpoint final T18-T20: QA otomatis hijau, review code quality/compatibility,
dan status runtime akurat. Task source yang verified dapat dilaporkan selesai
meskipun readiness keseluruhan masih blocked oleh QA Obsidian; jangan menyatakan
seluruh objective complete jika required acceptance masih pending.

## Runtime acceptance ledger

Belum ada skenario di bawah yang diuji. Runtime memakai test environment yang
diotorisasi; jangan menjalankan dev/deploy ke vault operasional implisit.

| Scenario | Acceptance mapping | Status/evidence |
| --- | --- | --- |
| Desktop Source/Live Preview, empty/multiline selection, undo | AC-02, AC-03 | Pending |
| Outliner zoom, folding, block IDs, whitespace, typewriter | AC-03 | Pending |
| Hemingway action unavailable, general/platform off | AC-03, AC-09 | Pending |
| Dock/pin/persistent, narrow window, status bar, writing focus | AC-02, AC-10 | Pending |
| Async clipboard denied/non-URL/target switched | AC-03 | Pending |
| Session reset, file switch A/B/A, idle, active-file startup/reload | AC-04, AC-05 | Pending |
| Multiple leaves/popout independent file timer, close/unload | AC-05, AC-09 | Pending |
| Built-ins/aliases/custom ID, title/folding/nesting preservation | AC-06, AC-07 | Pending |
| Theme/snippet discovery partial/manual fallback, dark/light preview | AC-06, AC-07 | Pending |
| GitHub markers dan conversion refusal tanpa kehilangan data | AC-07 | Pending |
| Mobile toolbar absent, touch settings/manager/custom styling | AC-02, AC-07, AC-10 | Pending |
| Keyboard menu/reset/reorder, long-press cancellation | AC-09, AC-10 | Pending |
| Source/README attribution, standalone/minified/zip notice | AC-11 | Pending |

## Status validation fase

SPECIFY dan PLAN accepted oleh maintainer. TASKS draft ini perlu divalidasi
sebelum implementation menurut AGENTS.md. Setelah accepted, gunakan skill
incremental-implementation, test-driven-development, frontend-ui-engineering
untuk task relevan; baca masing-masing SKILL.md saat mulai digunakan.
Tidak ada implementation atau runtime validation yang dilakukan pada fase ini.
