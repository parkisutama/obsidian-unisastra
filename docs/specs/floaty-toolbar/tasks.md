# Tasks: Floaty Toolbar untuk MD Writer

- Status: Implementation in progress; maintainer mengotorisasi kelanjutan.
- Date: 2026-09-12.
- Branch: `codex/adopt-floaty-toolbar`.
- Requirement: [accepted spec](./spec.md).
- Approach: [accepted plan](./plan.md).
- Decision: [accepted ADR-002](../../reference/decisions/ADR-002-floaty-toolbar-and-callout-management.md).
- Progress: 17/21 tasks implemented (T01-T16 dan T17a; T17 dipecah menjadi T17a/T17b);
  `pnpm run check:ci` hijau: 18 files / 106 tests untuk checkpoint T17a. Runtime Obsidian
  acceptance settings/preview terakhir dikonfirmasi maintainer; matrix runtime
  lainnya tetap pending. Slice C dan D selesai; Slice E
  (T11-T13: catalog, menu dropdown + lossless Obsidian conversion, Callout
  manager settings-tab UI) selesai. Slice F dimulai dengan T14 runtime styles;
  T15 form/preview dan T16 discovery best effort diimplementasikan.

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
- **Follow-up desain (feedback user setelah screenshot pertama)**: warna
  ikon tombol diredupkan (`var(--text-faint)`, `--text-normal` saat hover)
  supaya tidak menyaingi warna teks konten dan terasa distraktif. Label
  dropdown heading dipendekkan dari "Paragraph"/"Heading 1..4" menjadi
  "P"/"H1..H4" (nama lengkap tetap ada via `title` per `<option>` untuk
  tooltip), lebar select diperkecil menyesuaikan. Placeholder dropdown
  callout diganti dari kata "Callout" menjadi glyph kutip "❝" (native
  `<select>` tidak mendukung ikon SVG/img di dalam elemen `<option>` di
  semua platform, jadi glyph teks dipilih sebagai kompromi paling dekat
  dengan "ikon" tanpa membangun ulang widget dropdown custom). Opsi native
  `<select>` tetap menampilkan teks penuh berwarna normal di popup OS
  (`color: var(--text-normal)` khusus untuk `option`) meski trigger yang
  tertutup memakai warna pudar. `pnpm run test` (85/85) dan
  `pnpm run check:ci` hijau; dideploy ulang ke vault user.
- **Follow-up desain (user membagikan markup+CSS asli plugin Floaty
  Toolbar)**: rebuild UI toolbar dari native `<select>` menjadi custom
  dropdown trigger+panel (`attachDropdown()` di `toolbar.ts`) meniru
  struktur asli (`.floaty-dropdown-trigger` + chevron + `.floaty-dropdown`
  panel) karena native select tidak bisa menampilkan chevron kustom atau
  label pendek dengan gaya sendiri. Tambah divider (`.ptm-floaty-toolbar-
  divider`) mengelompokkan tombol persis seperti referensi: [bold,italic] |
  [strikethrough,code] | [highlight,link] | [heading,callout] | [pin].
  Tambah tombol **pin** yang di-toggle langsung dari toolbar (bukan hanya
  dari Settings) — logic guard dockAlwaysVisible diekstrak jadi
  `setDockMode()` di `settings.ts` supaya dipakai bersama oleh
  `toggle-dock-mode.ts` (Settings) dan `controller.togglePin()` (toolbar),
  menghindari duplikasi. Warna/ukuran disesuaikan persis dengan CSS asli:
  tombol 32x32 `color: var(--text-muted)` (bukan `--text-faint` seperti
  follow-up sebelumnya — referensi asli pakai `--text-muted` untuk action
  item), pin 28x28 `--text-faint` dengan `--interactive-accent` saat
  `is-pinned`, dropdown trigger `--text-muted` font-weight 600, dropdown
  item `--text-muted`/`--text-normal` hover. Dropdown panel muncul di atas
  trigger saat mode dock, di bawah saat floating (heuristik berbasis
  `settings.mode`, bukan deteksi ruang viewport penuh). Files:
  `toolbar.ts` (rewrite besar), `_floaty-toolbar.scss` (rewrite),
  `controller.ts` (`togglePin()`, `SurfaceFactory` param keenam),
  `settings.ts` (`setDockMode()` diekstrak), `toggle-dock-mode.ts`
  (reuse `setDockMode()`), `docs/for-users/use-md-writer-features.md`.
  `pnpm run test` (85/85) dan `pnpm run check:ci` hijau; dideploy ulang ke
  vault user. Tidak ada test baru untuk dropdown panel (DOM-heavy,
  konsisten dengan batasan harness `environment: "node"` yang sudah dicatat
  berulang kali di ledger ini) — hanya `detectHeadingLevel`/`setDockMode`
  yang murni logic tetap diuji.
- **Bug fix (dilaporkan user setelah dropdown rebuild)**: tombol Bold/Italic
  yang baru saja diklik menampilkan kotak/shadow yang tidak hilang, berbeda
  dari tombol lain. Root cause: `<button>` native browser menampilkan
  outline/shadow fokus bawaan pada state `:focus` (bukan hanya
  `:focus-visible`) yang belum di-reset; hanya elemen yang pernah diklik
  (menerima fokus) menunjukkan gejala ini, bukan seluruh tombol. Fix:
  tambah `outline: none; box-shadow: none;` eksplisit pada `:focus` di
  `.ptm-floaty-toolbar-button`, `-dropdown-trigger`, `-dropdown-item`, dan
  `-pin-btn`, mempertahankan indikator `:focus-visible` untuk aksesibilitas
  keyboard. `pnpm run test` (87/87) dan `pnpm run check:ci` hijau; dideploy
  ulang ke vault user.
- **Bug fix (diagnosis lanjutan — `:focus` bukan akar masalah sebenarnya)**:
  user melaporkan tombol Bold/Italic masih tampak berbeda dari dropdown P/
  Callout setelah fix di atas. Diagnosis via `getComputedStyle` di Console
  membandingkan dua tombol AKSI (Bold vs Strikethrough, sama-sama
  `<button>`) menunjukkan computed style IDENTIK di keduanya — bukti bahwa
  perbedaan visual sebenarnya bukan Bold vs tombol lain, melainkan SEMUA
  tombol aksi (`<button>`) vs dropdown trigger (`<div>`). Root cause
  sebenarnya: elemen `<button>` native mendapat box-shadow inset default
  dari base CSS Obsidian (`rgb(40,39,38) 0 0 0 1px inset` + tint
  background `rgba(254,252,240,0.15)`) yang TIDAK ter-override oleh
  `box-shadow: none` kita (spesifisitas/urutan cascade Obsidian menang),
  sedangkan dropdown trigger/pin yang sudah berupa `<div role="button">`
  tidak kena reset tersebut sama sekali — persis kenapa referensi plugin
  asli memakai `<div class="floaty-action-item" role="button"
  tabindex="0">` untuk SEMUA item, bukan `<button>`. Fix: ganti elemen
  tombol aksi (Bold/Italic/Strikethrough/Code/Highlight/Link) dari
  `<button type="button">` menjadi `<div role="button" tabindex="0">`
  dengan keydown handler Enter/Space manual (pola sama dengan dropdown
  trigger/pin), sehingga seluruh kontrol toolbar konsisten menghindari
  native button chrome. `pnpm run test` (87/87) dan `pnpm run check:ci`
  hijau; dideploy ulang ke vault user.
- **Scope addition (diminta user)**: HUD session/file tidak lagi ditampilkan
  di dalam dock — sekarang SELALU lewat status bar window utama Obsidian
  saja, terlepas dari mode toolbar floating/dock, sehingga tampilan
  konsisten dan dock tidak melebar oleh teks timer. `updateStatusBarHud()`
  di `controller.ts` tidak lagi digate oleh `toolbar.mode === "floating"`
  (sekarang selalu `true`, masih digate `isMainWindowDocument()` dan
  `segments.length`). Status bar item dibangun dari `<span>` per segmen
  (bukan `setText()` satu string) supaya segmen session yang resettable
  punya `role="button"`+tabindex+click/keydown sendiri untuk reset — sebelumnya
  fungsi klik-untuk-reset hanya ada di HUD dalam dock yang sekarang dihapus.
  `src/components/floaty-toolbar/hud.ts` (DOM wrapper dock) dihapus karena
  tidak lagi dipakai; `src/capabilities/features/toolbar/hud.ts` (pure
  `formatElapsed`/`hudSegments`) tetap dipakai controller untuk status bar.
  Toggle **Show session timer**/**Show file timer** yang sudah ada sejak T10
  sudah menyediakan kontrol enable/disable yang diminta user ("tidak semua
  orang perlu ini") — tidak menambah setting baru yang redundan. Files:
  `toolbar.ts` (hapus semua penggunaan HUD), `controller.ts`
  (`updateStatusBarHud` rewrite per-segmen), `_floaty-toolbar.scss` (hapus
  rule dock-hud, tambah `.ptm-floaty-toolbar-status-bar-hud-reset`).
  `pnpm run test` (87/87) dan `pnpm run check:ci` hijau; dideploy ulang ke
  vault user.

## Slice F: Styling custom dan discovery tema/snippet

### T14 — Runtime custom style lifecycle

- [x] Implemented; runtime acceptance pending.
- Dependency: T13; AC-07, AC-09.
- Acceptance: inherit tidak menghasilkan override; valid hex/Lucide overrides
  menghasilkan selector tervalidasi per document; save/reset/unload/window close
  memperbarui atau membersihkan nodes tanpa mengedit snippet/tema/vault note.
- Files (4): `src/capabilities/features/callouts/styles.ts`, `src/lib.ts`,
  `tests/callout-styles.test.ts`, `docs/specs/floaty-toolbar/plan.md`.
- Verify: CSS generation/input validation/lifecycle host tests,
  `pnpm run test`, `pnpm run check`; QA style di desktop/mobile/popout.
- Evidence 2026-09-13: 90 tests passed (12 files). Hex 3/6 digit diubah ke
  RGB; ikon `lucide-*` harus tersedia melalui Obsidian `getIcon`, SVG
  di-encode sebagai data URL. Test host memastikan satu node per document,
  update/reset/close/unload dan refusal setelah destroy. Wiring Workspace
  ditinjau melalui source/typecheck; runtime desktop/mobile/popout belum diuji.
  Form warna/ikon dan preview tetap T15.
- Gate final: `pnpm run check:ci` lolos (QA, 90 tests, build, artifacts 1.1.0,
  docs build); runtime acceptance tetap pending.

### T15 — Form warna/ikon dan preview inherit/override

- [x] Implemented; runtime acceptance pending.
- Dependency: T14; AC-06, AC-07, AC-10.
- Acceptance: manager form warna/ikon tersedia, inherit default dan reset
  override; preview memakai document/theme aktual; UI menjelaskan styling
  memerlukan plugin aktif dan tidak otomatis ikut GitHub/Publish.
- Files (4): `src/components/callout-manager.ts`, `_floaty-toolbar.scss`,
  `tests/callout-styles.test.ts`, `docs/for-users/use-md-writer-features.md`.
- Verify: style tests, `pnpm run test`, `pnpm run check`; runtime dark/light,
  theme switch, mobile form, custom id, plugin disable.
- Execution split: T15a shared form validation (`styles.ts` + style tests);
  T15b UI/preview (`callout-style-editor.ts`, manager, settings-tab lifecycle,
  SCSS, user guide). Tidak melakukan refactor catalog atau mengubah format note.
- Evidence: validator test gagal sebelum implementasi, lalu 91 tests passed.
  Form memiliki explicit save/reset, status validasi/save failure, label input,
  native details dan kontrol Obsidian. Preview memakai `MarkdownRenderer.render`
  pada document settings aktual; Component di-unload saat rerender/tab change/
  hide/plugin unload, hasil async lama ditolak. Preview dirender ulang saat
  dibuka atau setelah save. Form/DOM/renderer Obsidian belum diuji runtime.
- Gate: `pnpm run check:ci` lolos (QA, 12 files / 91 tests, build, artifacts,
  docs build). Runtime desktop/mobile/popout tetap pending.
- Koreksi acceptance dari screenshot maintainer: catalog controls dan editor
  style/preview harus berada dalam satu panel per entry. Implementasi awal dua
  daftar terpisah diperbaiki; regression host test gagal sebelum fix. Test ini
  memeriksa grouping controls/editor, bukan tampilan DOM Obsidian nyata.
- Gate setelah koreksi grouping: `pnpm run check:ci` lolos, 13 files / 92 tests,
  QA/build/artifacts/docs; runtime acceptance tetap pending.
- Koreksi kedua dari runtime screenshot: satu summary nama/ID/source dengan
  kontrol membuka body form/preview, tanpa heading duplikat. Edit warna/ikon
  otomatis memilih override karena implementasi sebelumnya mengabaikan field
  saat mode inherit. Preview valid memakai custom properties lokal dari
  generator tervalidasi bersama runtime CSS; note tidak berubah sebelum save.
  Preview dibersihkan saat unload. Test builtin note memeriksa properti override
  yang sama untuk preview/runtime; form/DOM tetap membutuhkan QA Obsidian.
- Gate koreksi kedua: `pnpm run check:ci` lolos, 13 files / 93 tests,
  QA/build/artifacts/docs; visual dan interaksi Obsidian masih pending.

Checkpoint F1 setelah T13-T15: `pnpm run check:ci`; periksa catalog/config tidak
mengubah note lama atau CSS snippet existing, custom styling mobile tetap bekerja.

Layout T15 diperbarui sesuai screenshot Outliner: native `SettingGroup` per
callout, header dan form langsung di satu list, tanpa accordion/nested cards,
preview langsung dirender. Test host grouping menyesuaikan kontrak grup native.
Koreksi berikutnya: preview sebelum identitas/controls; reset header tunggal
untuk style+label builtin; color picker native dan searchable icon picker dari
registry Obsidian. Picker catalog helper diuji untuk normalisasi, dedup, sort,
dan refusal ikon yang tidak tersedia. Runtime picker/modal/touch tetap pending.

### T16 — Discovery callout best effort dengan fallback manual

Maintainer mengonfirmasi acceptance perbaikan settings/preview terakhir selesai
dan mengotorisasi kelanjutan T16 serta atomic Conventional Commit setelah tiap
task. QA mobile/popout dan discovery tetap dicatat terpisah.

Checkpoint bug T15: format icon URL diganti ID Lucide sesuai kontrak Obsidian;
dua regression assertions gagal pada generator lama dan lolos setelah fix.
Preview setIcon, css-change pada perubahan CSS tersimpan, icon-only picker,
serta computed defaults tanpa persist override ditambahkan. `check:ci` lolos
15 files / 95 tests; DOM dan runtime Obsidian masih pending.

- [x] Implemented dan verified (automated; runtime pending).
- Execution: T16a model + tests committed as `232080e`; T16b settings integration
  adds explicit candidate save, CSS refresh cleanup, and save-failure rollback.
  Automated suite: 18 files / 101 tests; runtime theme/snippet remains pending.
- Dependency: T15; AC-06, AC-09.
- Acceptance: CSSOM literal IDs/nested rules menjadi candidate list; inaccessible
  sheets/traversal limits memberi status parsial; refresh/css-change memperbarui
  kandidat tanpa auto-save/delete; manual ID tetap tersedia.
- Files: discovery model, manager and lifecycle-owned discovery UI, model/UI
  tests, troubleshooting, current state, development status, and this ledger.
- Verify: synthetic CSSOM nested/inaccessible/duplicate/conditional/limit tests,
  `pnpm run test`, `pnpm run check`; runtime tema/snippet actual.

## Known issues / deferred feedback — 2026-09-14

Maintainer reported items while reviewing C1/C2/T17b-T20 in a real vault.

1. **Bug (still deferred, not addressed): rendered callouts do not dim under
   Dim Unfocused (paragraphs/sentences mode).** A callout block should
   visually dim like any other inactive paragraph/sentence when it is not the
   active one, but it stays at full opacity. Preliminary analysis
   (source-only, no Obsidian host available to confirm in DevTools): the dim
   mechanism in `src/styles/editor/dim/_dim-unfocused.scss` works by setting
   `opacity` on `.cm-line` elements based on `.cm-active`/`.active-sentence`
   class membership (see `_dimmed.scss`, `apply-dim-sentence`). Obsidian's own
   callout live-preview rendering wraps the affected `.cm-line`s inside a
   `.callout` decoration; it is not yet confirmed whether that wrapping (a)
   strips/does not propagate the per-line active/inactive class Hemingway/
   Typewriter mode relies on, or (b) the callout's own background/border
   makes an applied `opacity` change visually imperceptible against
   `--dimmed-opacity`. This dim-unfocused feature predates the floaty-toolbar
   work and is not part of ADR-002 — likely a pre-existing gap in callout
   interaction, only now surfaced because callouts are used more. Needs
   runtime DevTools inspection (`getComputedStyle`/class list on `.callout`
   vs `.cm-line` while a callout is present and unfocused) before deciding a
   fix.
2. **Bug (new, still deferred, not addressed): conflict with the Advanced
   Canvas community plugin.** Reported by maintainer: adding a card in
   Obsidian Canvas and typing anything behaves as if a newline were inserted,
   even though the user did not press Enter. Not yet analyzed — this repo has
   no source-level integration point with Canvas or Advanced Canvas at all
   (grep confirms no `Canvas`/canvas-view references in `src/`), so this is
   most likely a runtime interaction between MD Writer's global CM6
   extensions (typewriter/dimming/etc., which register via
   `registerEditorExtension` and therefore apply to every CM6 editor instance
   Obsidian creates, including ones Advanced Canvas embeds per card) and
   Advanced Canvas's own editor handling — not something this branch's
   floaty-toolbar/callout work touches. Needs reproduction in a real vault
   with both plugins enabled, then bisection (disable MD Writer features one
   at a time) to find which extension is responsible, before a fix can be
   scoped. Out of scope for this branch's task plan.
3. **UI request (done, see C3 below): collapsed catalog entry preview and
   Save style button.** Originally recorded here as deferred pending a
   design decision on IMPORTANT/CAUTION; maintainer clarified the intent
   (below) and it was implemented as C3.

## Maintainer-requested follow-up: distinct Important/Caution, compact compatibility label, icon Save button — 2026-09-14

Maintainer clarified deferred item 3 above: even though IMPORTANT/CAUTION
share Tip/Warning's default icon/color (Obsidian renders these aliases with
the canonical type's appearance), Obsidian still renders the literal typed
token as the callout's default title text — so `[!IMPORTANT]` reads
"Important", not "Tip", despite matching color/icon. The maintainer wants
this real distinction exposed as independently selectable/insertable catalog
entries, not merged away, while still getting the shared appearance "for
free" (no plugin styling code needed, since Obsidian's own core CSS already
maps these known alias tokens to the same icon/color as their canonical
type).

- [x] C3: Promote "important"/"caution" to full catalog entries; compact
  compatibility label; icon-only Save button. Confirmed via fetching
  Obsidian's own callout alias documentation understanding already recorded
  in catalog.ts (these are real Obsidian aliases, not something we invented).
  - `src/capabilities/features/callouts/catalog.ts`: `BUILTIN_CALLOUT_TYPES`
    gains `important` (after `tip`) and `caution` (after `warning`) as their
    own entries with no aliases of their own; removed from `tip`/`warning`'s
    alias arrays. `canonicalBuiltinCalloutId("important")` now returns
    `"important"` (previously `"tip"`) — this is what makes them
    independently selectable in the menu/catalog rather than collapsed.
    `GITHUB_MARKER_CANONICAL_ID` updated to a clean 1:1 mapping (`IMPORTANT`
    -> `"important"`, `CAUTION` -> `"caution"`, previously both pointed at
    tip/warning), which simplifies `githubAlertMarkersForCanonicalId` to
    always return zero-or-one marker instead of needing an "or" join. New
    `compatibilityLabel(id)` returns exactly `"Obsidian only"` or `"Obsidian
    and GitHub"` — shared by `callout-manager.ts` (header description) and
    `callout-style-editor.ts` (preview sample body), so both stay in sync
    without a circular import between those two component files.
  - `src/components/callout-manager.ts`: header `setDesc` now uses the
    compact `compatibilityLabel(entry.id)` instead of the old "Built-in ·
    Also GitHub alerts compatible (TIP or IMPORTANT)" wording. The "Save
    style" Setting/text-button that used to sit at the bottom of the expanded
    form is gone; `renderCalloutStyleEditor` now returns `{ save }` and
    `renderCalloutManager` wires it to a new icon-only `save` extra-button in
    the header row, positioned right after the existing reset (`rotate-ccw`)
    button.
  - `src/components/callout-style-editor.ts`: `renderCalloutStyleEditor`
    return type changed from `void` to `CalloutStyleEditor { save: () =>
    Promise<boolean> }` — the validate-then-save logic that used to live
    inside the removed button's `onClick` is now the body of that returned
    function, unchanged otherwise. The preview's sample body markdown no
    longer renders the generic English sentence "Callout appearance in the
    current theme." — it renders `compatibilityLabel(entry.id)` instead, so
    expanding any entry's preview shows real, useful info instead of filler,
    rendered at the actual size/color it will appear at in notes.
  - `tests/callout-catalog.test.ts`: updated alias-resolution and GitHub
    marker-mapping assertions for the promoted entries (`canonicalBuiltinCalloutId("Important")`
    is now `"important"`; `githubMarkerCanonicalId("IMPORTANT")` is now
    `"important"`; `githubAlertMarkersForCanonicalId` returns a single-marker
    array per canonical ID now, not "or"-joined pairs).
  - `tests/callout-manager.test.ts`: `renderCalloutStyleEditor` mock updated
    to return `{ save: vi.fn() }` (previously returned the created element
    directly), matching the new return contract.
  - No default styling override was added for the new entries — deliberately
    relies on Obsidian's own core CSS already rendering `important`/`caution`
    like `tip`/`warning`, exactly matching what the maintainer described.
  - Verify: `pnpm run check:ci` green — 19 files / 130 tests (test count
    unchanged; existing assertions were updated in place, not added to/from).
    Runtime confirmation that Obsidian still renders `important`/`caution`
    with tip/warning's appearance, and that the new header Save icon and
    compact preview body look right in a real theme, remains pending.

## Maintainer-requested follow-up: preview always shows ID/compatibility, single source of truth — 2026-09-14

Maintainer clarified C3's preview further: the ID + compatibility info should
always be visible (collapsed or expanded), not only after expanding, and
should be the *only* place that text appears — moving it into the preview
entirely instead of duplicating it in a separate header `Setting` name/desc.

- [x] C4: Always-visible preview body carries ID + compatibility; header
  `Setting` no longer duplicates it.
  - `src/components/callout-style-editor.ts`: preview sample body changed
    from `${compatibilityLabel(entry.id)}` alone to `ID: ${entry.id} ·
    ${compatibilityLabel(entry.id)}`, so both pieces of info live in one
    place — the preview itself, rendered at the callout's real size/color.
  - `src/styles/ui/_floaty-toolbar.scss`: removed the
    `&:not(.is-expanded) .callout-content { display: none; }` rule — the
    preview body (now carrying identity info, not filler) is always visible;
    only the style configuration form below it stays expand-gated via the
    existing `configuration` div / `bindCalloutExpansion`.
  - `src/components/callout-manager.ts`: removed `.setName(\`ID:
    ${entry.id}\`)`/`.setDesc(compatibilityLabel(entry.id))` from the header
    `Setting` — it is now buttons-only (reorder/enable/reset/save/delete),
    since that text would otherwise duplicate what the preview now always
    shows. Added `panel.setAttribute("data-callout-id", entry.id)` on each
    entry's outer panel — a harmless, generally useful hook (e.g. for a CSS
    snippet targeting one entry), and also how the regression test verifies
    per-entry identity/order now that the header carries no name text.
  - `tests/callout-manager.test.ts`: order-verification assertion switched
    from reading the (now-removed) header Setting name to reading
    `panel.attributes.get("data-callout-id")`.
  - `docs/for-users/use-md-writer-features.md`: "Atur tampilan callout"
    rewritten to describe the preview as always carrying ID/compatibility,
    with no separate ID text elsewhere, and the Save button description
    trimmed of the now-removed "expand to see compatibility" behavior.
  - Verify: `pnpm run check:ci` green — 19 files / 130 tests (assertions
    updated in place). Visual confirmation in real Obsidian that the preview
    reads as compact/organized as intended remains pending.

## Slice G: GitHub Alerts dan command parity

### T17a — Output mode GitHub

- [x] Implemented dan verified (automated; runtime pending).
- Execution split: conversion/menu model and tests; controller/executor/settings
  integration with selection guards and user guide; checkpoint documentation.
  Suite: 18 files / 106 tests. Regression tests first reproduced lossy conversion
  and selection omitting title/nesting outside its boundaries before fixes.
- Dependency: T16; AC-03, AC-07, AC-08.
- Acceptance: lima marker uppercase; custom/title/folding/nesting incompatible
  unavailable/refused tanpa data loss; output mode tersimpan dan menu mengikuti
  mode tanpa mengubah note existing otomatis.
- Files: callouts markdown/settings and model tests; toolbar controller/executor
  and executor tests; manager description, user guide, and checkpoint docs.
- Verify: GitHub conversion refusal tests, `pnpm run test`, `pnpm run check`;
  runtime switch output dan rendered markers.

### T17b — Command parity memakai executor yang sama

- [x] Implemented dan verified (automated; runtime pending).
- Dependency: T17a; AC-03, AC-07, AC-08.
- Acceptance: upstream command IDs dan manage-callouts registered unik tanpa
  mengubah commands lama; commands/menu memakai guards/conversion yang sama;
  manager command membuka tab plugin dan editor action baru unavailable mobile.
- Files: `src/capabilities/commands/toolbar-actions.ts` (new —
  `registerToolbarActionCommand` registers each command with
  `editorCheckCallback`: returns `false` (hidden from palette) on
  `Platform.isMobile` or when the active editor has no live CM6 view
  (`(editor as unknown as {cm?: EditorView}).cm`); on invocation it builds a
  `ToolbarTarget` via `tm.toolbar.target(cm)` — the same `ToolbarController`
  method the toolbar UI itself uses — and calls the same
  `executeToolbarAction`, so refusal messages/guards are identical, not
  reimplemented; sixteen commands cover bold/italic/strikethrough/code/
  highlight/link, heading 1-4 and remove-heading, and the five callout types,
  with IDs copied verbatim from upstream Floaty Toolbar's own command IDs
  (`floaty-bold`, `floaty-heading-1`, `floaty-callout-important`, etc. —
  confirmed by fetching `src/main.ts` at the pinned upstream revision) for
  command-palette parity; `ManageCalloutsCommand` (`manage-callouts`, no
  upstream equivalent) is a plain non-editor `Command` calling
  `tm.openCalloutManager()`, available on mobile since the Callouts settings
  tab itself is), `src/capabilities/commands/index.ts` (wires
  `toolbarActionCommands(tm)` and `new ManageCalloutsCommand(tm)` into
  `getCommands()` alongside existing commands, unchanged otherwise),
  `tests/commands.test.ts` (new "toolbar action commands" describe block:
  mobile hides the command from the palette, no live CM6 view hides it too,
  invoking `floaty-bold` through the command wiring dispatches through the
  real `executeToolbarAction` and mutates a fake `EditorState` exactly like
  the toolbar-actions executor tests do, all sixteen upstream-parity IDs
  register uniquely, and `manage-callouts` calls `tm.openCalloutManager()`),
  `docs/for-users/use-md-writer-features.md` (new paragraph documenting the
  command palette parity, the ID list, and the mobile/manage-callouts
  distinction). `src/components/settings-tab.ts` was not changed — command
  registration needed no settings-tab UI, and callout-manager discoverability
  was already covered by T13's "Manage callouts…" menu entry.
- Verify: `pnpm run check:ci` green — 18 files / 111 tests, typecheck, lint,
  styles, `lint:md`, build, artifacts, docs build. Runtime command palette
  behavior in actual Obsidian (ID visibility, guard messages, mobile
  hiding) remains acceptance-pending — recorded in the ledger below.

Checkpoint G setelah T16-T17b: `pnpm run check:ci`; compare action/commands,
callout catalog/output, dock, timers terhadap upstream parity inventory,
minus Pomodoro.

## Slice H: Reorder parity dan notice distribusi

### T18 — Reorder settings/long-press dan cancellation

- [x] Implemented dan verified (automated; runtime pending).
- Dependency: T17b; AC-09, AC-10, AC-11.
- Acceptance: reorder dari settings dan long-press tersimpan sesuai ID; drag
  tidak sekaligus mengeksekusi formatting; cancel/Escape/unload/window close
  membersihkan ghost/timers/tooltip, tanpa state global lintas window.
- Scope: delapan item reorderable — bold, italic, strikethrough, code,
  highlight, link, heading, callout — sesuai `ToolbarItemId`/upstream
  `DEFAULT_BUTTON_ORDER` (confirmed by fetching upstream `toolbar-types.ts`
  at the pinned revision). Pin tidak reorderable (bukan item upstream, tetap
  di ujung kanan). `settings.toolbar.buttonOrder` sudah punya normalisasi
  penuh sejak T01 (dedup, drop unknown ID, append builtin yang hilang) tapi
  belum pernah dipakai oleh rendering — T18 adalah task yang benar-benar
  mengonsumsinya.
- Files: `src/components/floaty-toolbar/reorder.ts` (new — adapted from
  upstream `drag.ts`/`toolbar.ts`'s `attachLongPressDrag`/`LONG_PRESS_MS`
  (500ms, confirmed from upstream `toolbar-types.ts`). `reorderIds(ids,
  fromId, toId)` is pure array logic that recomputes the target's index in
  the POST-removal array (`next.indexOf(toId)`) instead of reusing the
  pre-removal index like upstream does — upstream's naive
  `splice(fromIdx,1); splice(toIdx,0,itemId)` drifts one slot when
  `fromIdx < toIdx`, since removal shifts every later index down by one
  before the second splice runs. `LongPressReorder<T>` is a pure state
  machine (`idle -> pending -> dragging -> idle`) taking injected
  `setTimeout`/`clearTimeout` (fake-timer friendly) and DOM-free callbacks;
  reaching "dragging" always marks the gesture's trailing click suppressed
  via `consumeSuppressClick()`, whether or not the drop lands on a valid
  target — this is the actual fix for "drag tidak sekaligus mengeksekusi
  formatting": upstream executes the action on `mousedown` before the
  long-press timer even starts, so holding past the threshold to drag has
  already fired the button's formatting action in the original plugin.
  `cancel()` (Escape, or surface destroy for unload/window close) is new —
  upstream's `drag.ts` has no cancellation path at all, only a completed
  drop via `mouseup`), `src/components/floaty-toolbar/toolbar.ts` (rewrite:
  `TOOLBAR_BUTTONS` entries now carry a `ToolbarItemId`; one
  `LongPressReorder` instance per surface — i.e. per window, so multi-window
  never shares drag state, unlike upstream's module-level `activeDrag`
  singleton; `itemEls: Map<ToolbarItemId, HTMLElement>` holds every
  reorderable element; `applyOrder(order)` re-appends elements in the given
  sequence — `appendChild` on an already-attached node moves it, so this is
  the entire re-render, diffed against a joined-ID signature to skip
  no-op reflows; ghost creation/highlight/cleanup adapted from upstream
  `drag.ts`'s `startDrag`/`onDragMove`/`onDragEnd`/`findDropTarget`, but
  scoped to this surface's own `doc`/`itemEls` instead of `document`/a
  global query selector; `attachDropdown` gained an optional
  `shouldSuppressClick` parameter so the heading/callout dropdown triggers
  also skip opening right after a long-press-drag; `destroy()` calls
  `reorder.cancel()` and removes any leftover ghost/listeners),
  `src/capabilities/features/toolbar/controller.ts` (`SurfaceFactory` gained
  a seventh `reorderButtons` parameter; new `reorderButtons(newOrder)`
  method mutates `settings.toolbar.buttonOrder`, saves, and reschedules
  every active window so a reorder in one window's toolbar is reflected in
  others), `src/components/toolbar-button-order.ts` (new — settings-tab
  counterpart: `moveToolbarItem(order, index, delta)` pure array swap, same
  pattern as callout-manager's `moveEntry`; `renderToolbarButtonOrder` lists
  the eight items with up/down `Setting` extra-buttons, saving into the same
  `buttonOrder` array the long-press gesture mutates — either surface
  reflects the other's change), `src/components/settings-tab.ts` (Toolbar
  tab converted to a self-redrawing `draw()` closure, matching the Callouts
  tab's pattern, since the button-order list needs to re-render after a
  move), `src/styles/ui/_floaty-toolbar.scss` (`.ptm-floaty-toolbar-drag-
  source` dims the original while dragging, `.ptm-floaty-toolbar-drag-ghost`
  is the fixed-position cursor-following copy, `.ptm-floaty-toolbar-drop-
  target` outlines the hovered item), `tests/toolbar-reorder.test.ts` (new —
  `reorderIds` pure-logic cases including the off-by-one fix; `LongPressReorder`
  state machine: pending-only quick release never suppresses the click,
  drop() on a valid/null target always suppresses it, `cancel()` from both
  dragging and pending clears timers without reordering, a second
  `pressStart` mid-gesture is ignored, `LONG_PRESS_MS` is 500; plus
  `moveToolbarItem` swap/no-op-at-ends cases), `docs/for-users/use-md-writer-
  features.md` (new paragraph documenting both reorder paths, the Escape/
  destroy cleanup guarantee, and per-window drag isolation).
- Verify: `pnpm run check:ci` green — 19 files / 126 tests, typecheck, lint,
  styles, `lint:md`, build, artifacts, docs build. Not runtime-tested: actual
  click-vs-hold timing feel, the ghost element's visual tracking, and
  keyboard-only reorder (there is no keyboard alternative to long-press drag
  — Settings up/down arrows are the keyboard-accessible path, consistent
  with callout-manager's existing reorder pattern) in real Obsidian
  desktop/popout — recorded in the ledger below.

### T19 — Notice MIT tetap terbawa dalam artifacts

- [x] Implemented dan verified.
- Dependency: T18; AC-11.
- Acceptance: full upstream MIT notice embedded main.js banner termasuk minified
  build; dist/licenses notice tersedia untuk zip; artifact verification menolak
  notice hilang/mismatch dan tidak menghapus copyright existing.
- Files: `scripts/lib/license-banner.ts` (new — single source of truth for the
  exact banner text both build and verification use, so they can never drift
  apart from each other; `floatyToolbarLicenseBanner(notice)` wraps the full
  `licenses/floaty-toolbar-MIT.txt` contents as a `/*! ... */` comment),
  `scripts/lib/build.ts` (copies `licenses/floaty-toolbar-MIT.txt` to
  `dist/licenses/floaty-toolbar-MIT.txt`; passes `banner: { js:
  floatyToolbarLicenseBanner(...) }` to esbuild — esbuild prepends banner text
  to the output raw, after minification runs, so it survives `minify: true`
  and `stripDebug: true`, unlike an ordinary source comment which
  `minifySyntax` would strip), `scripts/lib/artifact-verification.ts`
  (`assertFloatyToolbarNoticePreserved()`: reads the current source notice,
  rebuilds the expected banner from it via the same `license-banner.ts`
  helper, and requires `dist/main.js` to contain that exact banner — this
  catches both a missing banner AND a stale one left over from a build made
  before the source notice last changed, since the freshly-recomputed
  expected banner won't match an old embedded one; separately requires
  `dist/licenses/floaty-toolbar-MIT.txt` to exist and be byte-identical to
  the source file. Purely additive/read-only — never deletes or rewrites
  `README.md`'s existing Acknowledgements section or any other copyright
  notice), `tests/artifact-verification.test.ts` (fixture helper now writes
  `licenses/floaty-toolbar-MIT.txt` plus a matching `dist/main.js` banner and
  `dist/licenses/` copy; new cases: missing banner, banner stale relative to
  a changed source notice, missing dist notice copy, dist notice copy
  mismatching the source), `docs/for-developers/create-a-github-release.md`
  (documents the notice check as part of `verify:artifacts`/`check:ci`/the
  release workflow, and that the zip picks up `dist/licenses/` automatically
  since the workflow already copies all of `dist/` recursively — confirmed
  by reading `.github/workflows/release.yml`, no workflow edit needed).
- Verify: `pnpm run check:ci` green — 19 files / 130 tests, typecheck, lint,
  styles, build, artifacts, docs build; confirmed against the REAL build
  output (not just the test fixture): `dist/main.js` starts with the full
  banner and `diff dist/licenses/floaty-toolbar-MIT.txt
  licenses/floaty-toolbar-MIT.txt` is empty. No release/deploy/push was run.

## Slice I: Handover dan acceptance final

### T20 — Dokumentasi current state dan acceptance report

- [x] Implemented dan verified.
- Dependency: T19; seluruh AC-01 sampai AC-11.
- Acceptance: docs menyebut behavior yang benar-benar ada dan limits; setiap AC
  mempunyai test/runtime evidence atau blocker; attribution/compatibility manual
  reviewed, tidak mengklaim shipped tanpa runtime acceptance yang diperlukan.
- Files: `docs/current-state.md` (rewrite bagian floaty toolbar: ringkasan per
  area — formatting, catalog unified, dock/pin/timer, reorder, distribusi —
  plus tabel status AC-01..AC-11 baru dengan evidence otomatis dan status
  "Automated; runtime pending" eksplisit per baris, dan sub-bagian "Known
  issues not yet addressed" mendaftar dua item deferred maintainer feedback
  secara eksplisit supaya tidak hilang dari radar), `docs/development-status.md`
  (checkpoint baru untuk C1/C2, T17b, T18, T19, dan deferred feedback — pola
  sama dengan checkpoint sebelumnya di file ini, bukan menulis ulang histori
  lama), `docs/reference/code-architecture-baseline.md` (tambah baris
  `src/capabilities/features/toolbar/`, `src/capabilities/features/callouts/`,
  `src/components/floaty-toolbar/`, `src/components/callout-*.ts` ke tabel
  Responsibilities — sebelumnya modul-modul ini besar tapi tidak tercatat sama
  sekali di baseline), `docs/for-developers/run-qa-before-merge-or-release.md`
  (checklist baru "Floaty Toolbar dan Callouts" dengan skenario manual
  konkret — toolbar muncul, tiap aksi, command palette, long-press reorder,
  settings reorder, compact preview expand/collapse, marker uppercase/label
  kompatibilitas, dock/pin/HUD/popout — dan link balik ke tabel AC dan ledger
  runtime), `docs/for-users/use-md-writer-features.md` sudah diperbarui
  incremental selama T17b/T18/C1/C2 (command palette, reorder, catalog
  unified); direview ulang di T20, tidak ada referensi stale ke "Output
  format"/`calloutOutputMode` yang tersisa (dicek dengan grep).
- Verify: `pnpm run check:ci` hijau — 19 files / 130 tests, typecheck, lint,
  styles, `lint:md`, build, artifacts, docs build. Review manual: grep
  `pomodoro` (AC-01, kosong), grep `from "@/components` di `src/capabilities/`
  (satu hit pre-existing di `outliner-sidebar.ts`, tidak terkait pekerjaan
  floaty-toolbar — tidak ada capabilities->components baru diperkenalkan oleh
  toolbar/callout work), grep header atribusi upstream masih utuh di file
  yang memang mengadaptasi kode upstream (`actions.ts`, `reorder.ts`,
  `toolbar-actions.ts` — path+revision+copyright); `markdown.ts` (callout
  wrap/convert) tidak pernah punya header upstream karena logic-nya original
  MD Writer, bukan adaptasi Floaty Toolbar (Floaty Toolbar upstream tidak
  punya fitur callout-wrapping). README Acknowledgements masih menyebut
  Floaty Toolbar/0png tanpa perubahan. CHANGELOG version bump tidak dilakukan
  — keputusan release terpisah.

Checkpoint final T18-T20: QA otomatis hijau (19 files / 130 tests), review
code quality/compatibility selesai, dan status runtime dicatat akurat di
current-state.md + ledger di bawah. Task source T01-T20 semuanya verified
secara otomatis, tetapi readiness keseluruhan tetap blocked oleh QA Obsidian
runtime yang belum dilakukan sama sekali di environment ini — jangan
menyatakan seluruh objective complete. Dua item feedback maintainer (bug
dim-unfocused, redesign preview/save-button) sengaja dicatat sebagai deferred,
bukan bagian T01-T20.

## Runtime acceptance ledger

Matrix penuh di bawah tetap pending; acceptance perbaikan settings/preview
terakhir dikonfirmasi maintainer dalam sesi 2026-09-13. Runtime memakai test environment yang
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

SPECIFY, PLAN, dan kelanjutan implementation telah diotorisasi maintainer dalam
sesi. T01-T20 (termasuk follow-up compact catalog C1/C2) diimplementasikan dan
diverifikasi otomatis; acceptance runtime dicatat terpisah di ledger. Atomic
Conventional Commits setelah slice selesai dikonfirmasi maintainer pada
2026-09-13. Seluruh task berencana (T01-T20) sudah source-verified per
2026-09-14; tidak ada task tersisa di rencana selain dua item deferred
maintainer feedback (bug dim-unfocused, redesign preview/save-button) dan
runtime acceptance matrix penuh di Obsidian, yang keduanya menunggu prioritas/
keputusan terpisah dari maintainer sebelum dikerjakan.

## Maintainer-requested follow-up: compact unified catalog — 2026-09-13

Confirmed interaction: preview header always visible; expansion reveals sample
body and configuration. This revises T15/T17a; original remaining tasks stay T17b-T20.
C1 and C2 both implemented and verified (`pnpm run check:ci` green, 18 files /
106 tests) as of 2026-09-14; runtime acceptance remains pending per the ledger
below. T17b is next.

- [x] C1: Compact preview header and right-side catalog controls. Area: manager,
  style editor, SCSS and settings interaction tests. Acceptance: label/icon/color
  visible while closed; keyboard/click expand without recreating draft controls;
  right-side controls do not toggle expansion. Verify tests + check:ci; runtime
  narrow/mobile/popout remains separate. Atomic Conventional Commit on completion.
  - Files: `src/components/callout-expansion.ts` (new — pure toggle binder,
    click/keydown Enter/Space, `aria-expanded`, cleans up via `component.register`;
    ignores clicks inside `.callout-content` so links/text inside the rendered
    preview body don't also toggle collapse), `src/components/callout-manager.ts`
    (header now holds preview + a right-side `Setting` for ID/source, reorder,
    enabled toggle, reset; `configuration` div starts `hidden`, bound to the
    preview via `bindCalloutExpansion`, and is the same node passed into
    `renderCalloutStyleEditor` so draft state is never recreated on
    collapse/expand), `src/components/callout-style-editor.ts` (preview markdown
    drops the generic "Preview" title and sets `.callout-title-inner` text to
    `entry.label` after render, so the header shows the callout's real
    icon/color/label instead of a placeholder), `_floaty-toolbar.scss`
    (`.ptm-callout-manager-header` flex-wraps preview+setting for narrow
    windows; `.callout-content` hidden unless `.is-expanded`; chevron rotates on
    expand; `:focus-visible` outline for keyboard use), `tests/callout-manager.test.ts`
    (asserts configuration starts hidden, keyboard Enter and click both toggle,
    the draft child node identity is preserved across collapse/expand, and the
    right-side control panel carries no click listener of its own).
  - Verify: `pnpm run check:ci` green — 18 files / 106 tests, typecheck, lint,
    styles, build, artifacts, docs build. Runtime narrow/mobile/popout layout
    still requires Obsidian acceptance, recorded separately.
- [x] C2: Unified catalog, uppercase future edits, compatibility descriptions.
  Area: callout settings/markdown, toolbar executor/controller, model/CM6 tests,
  user/current-state/status/changelog. Acceptance: legacy outputMode retained but
  ignored at runtime, custom remains selectable, five GitHub aliases available,
  order/visibility preserved, title/fold/body/depth unchanged, no automatic note
  migration. Verify tests + check:ci; actual theme normalization remains pending.
  Atomic Conventional Commits on completion.
  - Maintainer clarification (2026-09-14): toolbar always emits uppercase —
    there is no separate GitHub-mode menu item or per-entry output toggle; the
    Obsidian/GitHub compatibility label for each type is shown only in the
    Callouts settings tab, never on the toolbar.
  - Files: `src/capabilities/features/callouts/catalog.ts`
    (`githubAlertMarkersForCanonicalId` — informational reverse lookup from a
    builtin canonical ID to the GitHub Alert markers it's also recognized as,
    e.g. tip -> TIP/IMPORTANT; used only by settings UI, never gates toolbar
    output), `src/capabilities/features/callouts/settings.ts`
    (`calloutMenuOptions` no longer branches on `outputMode` — always returns
    every enabled entry, builtin or custom, in catalog order; `outputMode`
    field/type/normalization untouched so persisted data round-trips, it is
    simply never read for menu/executor decisions anymore),
    `src/capabilities/features/callouts/markdown.ts` (`wrapAsCallout`/
    `changeCalloutType` now emit `id.toUpperCase()` unconditionally; removed
    `githubCalloutEdit` and its restrictive refusal checks entirely —
    `calloutEdit(text, id)` dropped its `mode` parameter and always takes the
    lossless Obsidian branch, since one uppercase marker is simultaneously
    valid Obsidian syntax, case-insensitively, and valid GitHub Alert syntax
    for the five compatible base forms), `src/capabilities/features/toolbar/
    executor.ts` (removed `calloutOutputMode` from `ToolbarTarget["policy"]`
    and the now-dead `githubSelectionIssue` whole-line/quote-boundary check;
    `executeCalloutAction` calls `calloutEdit(text, id)` with no mode),
    `src/capabilities/features/toolbar/controller.ts` (removed
    `calloutOutputMode: this.tm.settings.callouts.outputMode` from the policy
    object built per view), `src/components/callout-manager.ts` (removed the
    global "Output format" Obsidian/GitHub `Setting` dropdown entirely; added
    `compatibilityDescription(entry)` shown as each entry's header `setDesc`,
    e.g. "Built-in · Also GitHub alerts compatible (TIP or IMPORTANT)" or
    "Custom · Obsidian only"; top intro paragraph rewritten to explain the
    single uppercase marker instead of a mode switch),
    `tests/callout-catalog.test.ts` (replaced the five-preset-switching test
    with: menu identical regardless of legacy `outputMode` value, custom
    entries always included, disabled entries still hidden, and direct
    coverage of `githubAlertMarkersForCanonicalId` for tip/warning/note/danger/
    custom), `tests/callout-markdown.test.ts` (wrap/change now assert
    uppercase output; removed the GitHub-mode preset/refusal describe block;
    added regression coverage proving folding, title, nesting, and custom IDs
    — previously refused under GitHub mode — now succeed, since there is no
    restrictive mode left), `tests/toolbar-actions.test.ts` (removed
    `calloutOutputMode` from the test policy fixture and the two GitHub-mode
    executor tests; updated the callout-wrap test to expect an uppercase
    marker), `docs/for-users/use-md-writer-features.md` (removed the
    Output-format bullet and rewrote "Output GitHub alerts" into "Output
    callout dan kompatibilitas GitHub alerts", describing the single catalog,
    always-uppercase insertion, and where the compatibility label lives).
  - Verify: `pnpm run check:ci` green — 18 files / 106 tests, typecheck, lint
    (including `obsidianmd/ui/sentence-case`), styles, `lint:md`, build,
    artifacts, docs build. Actual Obsidian rendering of uppercase markers in
    both themes, and GitHub's own rendering of existing/converted notes,
    remain runtime acceptance — recorded in the ledger below, not claimed here.
