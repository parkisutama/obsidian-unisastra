# Plan: Floaty Toolbar untuk MD Writer

- Status: Accepted oleh maintainer pada 2026-09-12.
- Date: 2026-09-12.
- Branch: `codex/adopt-floaty-toolbar`.
- Requirement: [accepted spec](./spec.md).
- Decision: [ADR-002](../../reference/decisions/ADR-002-floaty-toolbar-and-callout-management.md)
  (Accepted sebagai keputusan; implementation belum dimulai).

## Pendekatan dan outcome

Adaptasi action dan ergonomi Floaty Toolbar ke composition MD Writer existing,
tanpa memuat plugin kedua. Toolbar hanya desktop; settings, callout catalog,
dan custom styling tetap kompatibel mobile. Tidak mengadopsi Pomodoro.
Timer tetap elapsed seperti upstream, dengan prefix dan keterangan.

Perubahan dikerjakan berurutan dalam slice yang mencakup UI, behavior, test,
dan docs. Dokumen ini menentukan pendekatan dan urutan, bukan task checklist
implementation. [Tasks](./tasks.md) berstatus Draft, menunggu validasi
maintainer sebelum IMPLEMENT.

## Evidence dan integrasi existing

- `src/lib.ts` sudah mengoordinasikan load settings, feature, command, extension,
  dan unload. Controller baru dimuat setelah settings tersedia, bukan saat
  constructor memakai defaults.
- `src/capabilities/features/index.ts` dan `src/components/settings-tab.ts`
  mendukung category/settings tab; tambah tab Toolbar dan Callouts di sini.
- Settings modern merge per category, bukan nested arrays/objects mendalam.
  Catalog/timer membutuhkan normalizer khusus seperti pola writingMode.
- `tests/settings.test.ts`: additive defaults dan legacy flat migration.
  `tests/commands.test.ts`: duplicate command IDs dan registration.
- Hemingway memakai keydown handler, bukan guard semua editor transactions.
  Jangan mengasumsikan `replaceSelection` tunduk pada aturan keyboard ini.
- Outliner selection filters membatasi user selection, bukan otomatis semua
  perubahan range. Guard toolbar harus memeriksa visible range sebelum menulis.
- Installed `obsidian.d.ts` menyediakan active-leaf-change, file-open,
  window-open/window-close, css-change, dan editor-change. Event upstream
  editor-selection-change tidak menjadi ketergantungan API baru.
- Build sekarang menulis main.js/styles.css/manifest.json. Verifikasi artifacts
  belum menguji license notice. Distribusi notice perlu ditambahkan.
- Upstream revision `b2113d06e1870851963053cd0bab0a0a971bb920` menjadi baseline
  provenance; action, HUD, toolbar, drag, tooltip sudah ditinjau sebagai acuan.
  Parity behavior diperbaiki bila upstream berisiko menghilangkan data.

## Responsibilities dan dependency direction

| Area usulan | Responsibility |
| --- | --- |
| `src/capabilities/features/toolbar/` | Feature activation/settings, controller desktop, action registry, elapsed model |
| `src/capabilities/features/callouts/` | Catalog/defaults/validation, discovery, runtime style lifecycle |
| `src/capabilities/commands/toolbar-actions.ts` | Command registration dengan action executor yang sama dengan toolbar |
| `src/components/floaty-toolbar/` | Toolbar/menu/HUD/drag UI per window, tanpa storage atau Node API |
| `src/components/callout-manager.ts` | Form catalog, inherit/override, preview, order/visibility |
| `src/cm6/toolbar-selection.ts` | Selection/document update bridge, positions, visible-range guards |
| `src/capabilities/settings.ts` | Persisted additive contracts dan startup normalization |
| `src/lib.ts` | Composition, settings refresh, unload coordination |
| `src/styles/ui/_floaty-toolbar.scss` | Toolbar/HUD/menu/manager styles memakai Obsidian variables |
| `scripts/lib/` | Notice build/distribution checks; runtime tidak mengimpor tooling |

Registry/validation/elapsed functions harus dapat diuji tanpa DOM. UI menerima
callbacks dan snapshot settings; hanya controller/executor yang mengakses App
dan editor. Composition boleh mengimpor components/features/CM6; modules baru
tidak mengimpor `src/main.ts`. Hindari dependency cycle controller <-> UI.
Type-only referensi TypewriterModeLib mengikuti convention existing.
Dependency direction ditinjau manual; jangan mengklaim architecture test tersedia.

## Kontrak additive yang diusulkan

### Settings

Category baru `toolbar`:

- `enabled`: default false, termasuk upgrade, agar workflow lama terjaga.
- `mode`: `floating` atau `dock`, default floating; pin mengganti field yang sama.
- `dockAlwaysVisible`: default false; mengaktifkannya memilih dock langsung.
  Saat true, pin untuk undock disabled dengan keterangan; mematikan setting
  mengembalikan dock biasa, bukan mengganti mode diam-diam.
- `smartUrl`: default false seperti upstream.
- `buttonOrder`: delapan action IDs upstream; unknown/duplicate dibuang,
  action baru/missing ditambahkan tanpa merusak urutan valid pengguna.
- `timers`: sessionVisible/fileVisible default true ketika toolbar enabled,
  sessionPrefix `Sesi:`, filePrefix `File:`. Prefix trim, maksimal 40 karakter,
  kosong fallback ke default; tidak menerima multiline/control characters.

Category baru `callouts`:

- `outputMode`: `obsidian` default atau `github`.
- `entries`: ID lowercase kanonis, label, source metadata, enabled/order,
  styling `inherit` default atau `override` dengan warna/ikon tervalidasi.
- Built-ins plus aliases tidak menjadi duplicate case-insensitive ID.
  Alias tetap dapat dipilih; IMPORTANT/CAUTION preset GitHub memakai ID kanonis
  yang sama, uppercase hanya saat output. Jangan membuat catalog kedua yang
  menyimpan override berbeda untuk marker dengan ID sama.
- Custom ID memakai huruf/angka/underscore/hyphen, maksimal 64 karakter;
  label plain text maksimal 80 karakter. Warna lewat color picker/hex yang
  dinormalisasi; ikon memakai Lucide ID tersedia, tanpa arbitrary SVG/CSS input.
- Normalizer baru memvalidasi nested values, clone defaults/arrays, menjaga
  built-in override/order valid saat upgrade dan tidak menyimpan objek CSSOM.
- Settings lama tidak diganti nama; tidak membaca data plugin Floaty terpisah
  atau memigrasikannya tanpa request tambahan.

### Commands dan CSS

Gunakan action IDs upstream `floaty-bold`, `floaty-italic`,
`floaty-strikethrough`, `floaty-inline-code`, `floaty-highlight`,
`floaty-insert-link`, `floaty-heading-1` sampai `floaty-heading-4`,
`floaty-heading-plain`, dan lima `floaty-callout-*` upstream. Obsidian menambahkan
namespace plugin `md-writer`; command MD Writer lama tetap utuh.
Tambahkan `manage-callouts` untuk membuka tab Callouts milik settings plugin.
Entry custom dipilih dari menu, tidak membuat command ID dinamis dari label.
Runtime command guard sama dengan action toolbar; editor commands tambahan
tidak diaktifkan mobile dalam scope desktop toolbar ini.

CSS baru memakai prefix `ptm-floaty-`/`ptm-callout-manager-`; hooks lama tidak
diganti. Identifier data callout tetap ID pengguna, bukan prefix CSS plugin.

## Selection dan executor

CM6 bridge mendeteksi selection/doc changes per editor tanpa polling selection
atau cast event workspace undocumented. Untuk posisi floating gunakan koordinat
selection CM6 dan viewport editor/window asal; fallback pointer hanya bila valid.

Action executor menerima target editor, leaf, document snapshot/range, lalu
memvalidasi active editable Markdown, platform/general activation, mode, dan
outliner visible range. Tolak multi-selection yang belum didukung; jangan
diam-diam menerapkan hanya pada range utama. Satu action menjadi satu undo step.

Inline/link/callout memerlukan selection sesuai baseline upstream; heading
berlaku pada cursor head line dan tidak menulis di luar branch outliner.
Hemingway aktif menonaktifkan seluruh action perubahan note tambahan dengan
keterangan. Settings/callout configuration dan timer tetap dapat digunakan.
Ini guard konservatif yang menjaga forward-only contract tanpa refactor mode.

Link capture selection sebelum await clipboard, lalu revalidasi file/document,
selection, activation, dan mode setelah await. Jika target berubah, batalkan
dengan penjelasan; jangan menulis ke selection/file terbaru dengan teks lama.
Clipboard fallback memakai placeholder URL yang dapat diedit seperti upstream.
Tidak ada pembacaan clipboard saat load atau render.

## Dock, timer, dan lifecycle window

Satu toolbar controller per plugin dengan UI/state drag/tooltip per ownerDocument.
Pasang instance per desktop window yang memiliki editor Markdown; leaf aktif
dalam window menentukan target. Focus change memperbarui editor reference,
tidak mempertahankan closure editor asal upstream.

Mode dock biasa mempertahankan auto-hide/peek/reveal upstream; mode selalu tampil
melewati seluruh auto-hide timers. Dock ditempatkan bawah viewport window dengan
offset status bar dan layout yang dapat menyusut; tidak menutupi teks cursor.
Escape menutup transient menu/tooltip; dock persistent tetap terlihat.

SessionStart satu nilai plugin runtime dimulai saat toolbar feature pertama
enabled; disable menghentikan model/UI, re-enable mulai sesi baru. Semua window
menampilkan sesi sama. Klik reset memakai action accessible yang eksplisit.
FileStart per window mengikuti path editor aktif window itu; A -> B -> A reset.
Load initialize dari file aktif; file null/delete mengosongkan timer, rename
path aktif reset; window close menghapus file state. Tidak memakai ctime/mtime.
Perbedaan per-window ini disengaja agar popout menunjukkan file yang tepat.

Satu tick clock per controller memperbarui semua UI; nilai elapsed dihitung
langsung dari timestamp, bukan menambah detik tick. Hide HUD tidak reset model.
Status bar utama menampilkan timer ketika window utama floating; dock tiap window
menampilkan timer window itu tanpa duplicate HUD. Popout floating menggunakan
host status bar bila tersedia; bila host tidak menyediakan slot, tidak membuat
status bar palsu atau memindahkan HUD ke window lain. Catat batas QA host.

UI components memakai Component cleanup scopes per window. Cancel drag, ghost,
long-press, animations, tooltip, menu listeners, RAF, tick, CSS nodes, dan pending
clipboard action pada disable/unload/window close. General activation/platform
settings juga memperbarui availability segera. Runtime baru memakai ownerDocument
dan defaultView, bukan global window/document untuk operasi editor DOM.

## Callout manager dan styling

Catalog awal mengikuti tipe/aliases resmi Obsidian. Discovery berjalan saat
manager dibuka/refresh dan css-change, menelusuri CSSOM yang dapat diakses untuk
selector data-callout literal. Traversal nested rules terukur; rulesheets yang
tidak terbaca dilewati dengan status discovery parsial. Tidak mengklaim semua
callout ditemukan. CSS conditional/pseudo selectors tidak otomatis menjadi
konfigurasi override; computed preview menjadi bukti tampilan aktual.

Discovery memberi kandidat untuk ditambahkan pengguna, tidak menyimpan otomatis
atau menghapus entry ketika tema berubah. ID manual selalu tersedia. Metadata
menyebut sumber tema/snippet bila dapat diidentifikasi, otherwise CSS source.

Form mendukung add/edit/remove custom, visibility/order, inherit/override warna
dan ikon, reset override built-in, preview hasil Markdown, dan switch output.
Built-in tidak dihapus permanen, hanya hidden/reset; custom delete tidak mengubah
note lama. Override menghasilkan style node milik plugin per document, juga
mobile, menggunakan selector ID/values tervalidasi. Tidak menulis snippet/CSS
tema pengguna. Dark/light mengikuti inherit atau override pilihan pengguna.
Export CSS snippet ditunda sebagai fitur terpisah; UI menjelaskan styling
memerlukan plugin dan tidak otomatis ikut Publish/GitHub.

Obsidian output tetap mempertahankan body, title, folding marker dan quote depth
pada perubahan tipe existing. Identifikasi header custom hyphen case-insensitive,
tanpa membuang baris pertama/data seperti regex upstream. Selection ambigu atau
partial header ditolak dengan keterangan, bukan diperbaiki diam-diam.

GitHub output hanya lima marker uppercase dengan header tanpa title/folding.
Existing selection dengan title/folding/nesting tidak dikonversi secara lossy:
tolak dan jelaskan batas mode, atau pengguna berpindah ke mode Obsidian.
Custom entry tetap dapat dikelola tetapi unavailable saat output GitHub.
Tidak mengubah renderer Obsidian untuk menyerupai warna GitHub; presets menjaga
sintaks yang kompatibel, bukan menjanjikan tampilan identik.

## Provenance dan notice distribusi

Komentar atribusi per file/blok mengikuti [aturan spec](./spec.md#aturan-atribusi-dan-lisensi).
Tambahkan `licenses/floaty-toolbar-MIT.txt` dengan notice lengkap asli dan
README Acknowledgements Floaty Toolbar/0png saat kode pertama diadaptasi.
Pertahankan seluruh copyright existing; jangan menyatakan adopsi sudah shipped.

Embed teks MIT lengkap sebagai esbuild legal banner pada main.js sehingga aset
standalone BRAT tetap membawa notice. Copy notice ke dist/licenses untuk zip
distribusi; artifact verification menguji banner dan file notice, termasuk
minified build. Script deploy tetap tiga aset utama; embedded notice melindungi
distribusi tersebut tanpa perlu deployment dalam pekerjaan ini.

## Urutan slice dan dependencies

1. Desktop dapat enable toolbar dan menjalankan bold dari floating selection,
   mencakup settings additive, lifecycle minimal, executor guard, atribusi awal,
   test, dan user docs. Ini slice risiko selection/popout/Hemingway pertama.
2. Lengkapi formatting/link/heading, commands parity, dan target revalidation.
3. Dock/pin desktop serta setting dockAlwaysVisible; keyboard dan viewport.
4. HUD elapsed/session reset/file switches dengan toggles/prefix/keterangan.
5. Menu Callouts dengan catalog Obsidian, conversion yang menjaga data, dan
   Callout manager visibility/order/custom ID.
6. Custom styling inherit/override dengan preview, discovery best effort,
   serta lifecycle desktop/mobile/popout.
7. Output GitHub Alerts dengan batas konversi yang jelas.
8. Reorder via settings/long-press, cancel gesture, tooltip dan parity polish.
9. Notice distribution/artifact verification, compatibility review, final docs,
   dan acceptance QA.

Slice luas dipecah menjadi task berukuran 3-5 file pada fase TASKS, termasuk
docs/test terkait; jangan menjadikan nomor di atas task implementasi tunggal
bila menyentuh terlalu banyak modul. Kode/test/edit shared composition dilakukan
sequential. Checkpoint QA setelah 2-3 task; tidak memerlukan subagent.

## Risiko, alternatif, dan effort

| Risiko/alternatif | Dampak dan pendekatan |
| --- | --- |
| Menyalin plugin upstream utuh | Cepat tetapi Pomodoro/global DOM/stale target bertentangan dengan kontrak; adaptasi modular dipilih. |
| Formatting saat Hemingway/outliner | Risiko note berubah di area terlarang; shared executor guard dan tests early. |
| Clipboard async | Risiko menulis ke target berubah; capture/revalidate/cancel. |
| Callout conversion | Risiko title/body/nesting hilang; lossless preservation atau explicit refusal. |
| Mengedit snippet/tema | Menambah filesystem effects/conflict; runtime styles plugin dipilih, export ditunda. |
| Discovery CSS lengkap | Tidak andal pada CSS dinamis/inaccessible; candidates best effort plus manual. |
| Multiwindow/mobile | Lifecycle dan UI cukup besar; isolated per-document UI, timer model diuji terpisah, runtime acceptance wajib. |
| Attribution hilang saat bundle | Notice tidak cukup hanya di source; embed banner plus dist notice diuji. |

Effort relatif: formatting dasar medium; dock/timer medium; callout manager,
conversion dan discovery high; multiwindow acceptance high. Total pekerjaan
melampaui satu slice. Tidak memberi estimasi waktu tanpa bukti runtime awal.
Dependency baru tidak direncanakan; Vitest/Obsidian mocks dan CM6 existing cukup
untuk model/executor. Kebutuhan DOM test harness dinilai di TASKS, tanpa install
dependency diam-diam.

## Verification dan dokumentasi

| Acceptance | Bukti yang direncanakan |
| --- | --- |
| AC-01, AC-08 | Default/migration/registration tests; review tidak ada Pomodoro atau identifier lama berubah. |
| AC-02, AC-09 | Controller state/lifecycle tests; runtime persistent dock, disable, popout close. |
| AC-03 | Formatting range/undo/async target tests dengan CM6; runtime outliner/Hemingway/whitespace/folding. |
| AC-04, AC-05 | Controlled-clock tests, reset/switch/init/toggle/reload/multiwindow; runtime tooltip/HUD placement. |
| AC-06, AC-07 | Catalog normalization, discovery partial, style validation, lossless conversion/GitHub constraints; runtime theme preview. |
| AC-10 | Keyboard/touch manager mobile, toolbar absent mobile, desktop/popout accessibility acceptance. |
| AC-11 | Source provenance review, README credit, banner/notice artifact tests, zip assets review. |

Setiap task behavior memakai TDD bila membutuhkan regression test. Jalankan
tests relevan lalu `pnpm run check`; checkpoint dan final memakai
`pnpm run check:ci`. Planning saat ini hanya Markdown lint/docs build.
Tidak deploy vault atau release untuk memperoleh bukti otomatis.

Update user docs setelah behavior terverifikasi, current-state hanya untuk
implementasi, status untuk readiness/runtime gaps, baseline setelah modul hadir,
ADR status setelah keputusan disetujui. CHANGELOG mengikuti versi `## x.y.z`
repo saat penetapan release, bukan mengarang versi baru dalam PLAN.

## Validasi fase

Maintainer telah menyetujui ADR-002 dan pendekatan: settings default off, pin/dock persistent,
guard Hemingway, timer per-window file, styling runtime tanpa export snippet,
discovery candidates best effort, serta GitHub conversion tanpa kehilangan data.
[Tasks](./tasks.md) memuat file/acceptance/test/docs/dependencies dan checkpoint;
validasi TASKS terpisah sebelum implementation.
