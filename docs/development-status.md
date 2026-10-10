# Development status

## Rebranding Unisastra — 2026-09-29

Implementasi lokal mengganti plugin ID dan nama tampilan menjadi `unisastra` /
Unisastra, command toggle, tipe panel outline, key frontmatter, CSS prefix,
package, arsip rilis, URL repo tujuan, dan dokumentasi aktif. Versi disiapkan
sebagai `1.2.0`. Guard deploy menolak folder plugin yang namanya tidak sesuai
dengan ID manifest hasil build. Tidak ada migrasi data vault lama.

`pnpm run check:ci` lulus: 34 file tes, 216 tes, typecheck, lint, build,
verifikasi artefak, dan build docs. Fixture Electron outline lulus 440 checks,
fixture editor lulus 155 checks. `dist/manifest.json` memuat ID `unisastra`,
nama Unisastra, versi `1.2.0`, dan repo tujuan
`parkisutama/obsidian-unisastra`. Lihat
[ledger rebrand](./specs/unisastra-rebrand/tasks.md) dan
[ADR-005](./en/reference/decisions/ADR-005-unisastra-identity.md).

Repositori GitHub belum diubah; Git remote lokal masih menunjuk repo lama.
Push, tag, release, deployment vault operasional, dan acceptance native Obsidian
belum dilakukan pada checkpoint ini.

## Update announcements — 2026-09-28

Toggle dan modal release notes dihapus; key settings lama tetap inert untuk kompatibilitas data. `pnpm run check:ci` lulus (33 file test, 213 test, build dan docs). Acceptance native Obsidian belum dilakukan.

Snapshot: 2026-09-12. Status ini memisahkan implementasi tooling dari bukti validasi.

## Commit lokal — 2026-09-27

Maintainer mengotorisasi commit melalui "oke commit kalau begitu".
Source dipisahkan menjadi `e7085b3` (sidebar dan guard viewport),
`f3f2d49` (performa/lifecycle), dan `e1007e6` (block ID/fold persistence).
Hooks check dan commitlint lulus; gate penuh terakhir lulus 212 tests dan build/docs.
Catatan "belum commit" pada checkpoint sebelumnya adalah status saat checkpoint tersebut.
Push, deployment dan release belum dilakukan. Sinkronisasi pada host tetap nonaktif
setelah pemulihan ukuran ke 280 px; acceptance native perbaikan tetap terbuka.

## Pemulihan bug sidebar memenuhi layar — 2026-09-27

Diagnostik live read-only menemukan kedua sidebar 21.474.836,8 px, root tengah 0 px,
viewport 962 px dan toggle sync sudah mati. Dengan izin eksplisit maintainer,
keduanya direset ke 280 px dan requestSaveLayout dipanggil; verifikasi berikutnya
menunjukkan render 280/280, workspace/viewport 1536 px dan root tengah 976 px.
Tidak ada catatan dibaca/diubah dan toggle tetap nonaktif.

Fixture mereproduksi kegagalan: batas 80% workspace per sisi dapat digandakan,
dan workspace yang overflow menaikkan batasnya sendiri. Guard baru memakai
80% dari `min(workspace, viewport)` sebagai budget pasangan; minimum native
yang tidak feasible membuat sync suspend. Bukti terbaru ada di
[ledger sidebar](./specs/sidebar-equal-resize/tasks.md).
Perbaikan source ini belum dideploy ke vault; acceptance native tetap terbuka.
`check:ci` lulus 33 files / 212 tests, lint, build, artifacts dan docs.
Fixture sidebar: 29 checks lulus, 120 reads / 60 writes untuk 60 drag updates,
idle reads 0. Test ekstrem gagal sebelum guard dan lulus setelah perbaikan.

## Implementasi perbaikan performa — 2026-09-27

Maintainer menyetujui spec/plan/tasks dengan "oke implementasikan". R1–R7
memiliki perubahan source: ownership observer/RAF editor dan cursor restore;
cancellation MonoNote; listener Hemingway melekat pada document asal;
apply preset tanpa persist per-toggle; guard/tick/HUD toolbar; invalidasi anchor
GFM; serta generasi render outline dan child Component yang dibersihkan.

Regression awal MonoNote/Hemingway gagal sebelum fix dan lulus sesudahnya.
Probe produksi editor: 50 create/destroy menghasilkan nol observer/RAF tertahan.
Toolbar: 100 disabled updates tanpa RAF; timer display tersembunyi tanpa interval.
Outline browser: selection-only tanpa Markdown rebuild, stale generation tidak
dipublikasikan, 50 rebuild hanya satu render component, close membuang pekerjaan pending.

Gate final: `pnpm run check:ci` lulus 31 files / 200 tests, lint tanpa warning
kompleksitas, build, artifacts 1.1.0 dan VitePress. Fixture browser lulus 13 checks
performa dan 24 checks sidebar; sidebar tetap 120 reads / 60 writes dan idle nol.
Ini belum profil CPU/FPS/heap native. P01–P10
tidak ditutup menyeluruh karena native acceptance dan beberapa skenario matriks
masih terbuka; lihat [ledger](./specs/performance-code-quality/tasks.md).
Tidak ada deployment/commit. Maintainer memilih R8 menjadi
[spec block ID/fold terpisah](./specs/block-id-fold-persistence/spec.md);
spec D1–D6 dan scope kemudian disetujui; [plan](./specs/block-id-fold-persistence/plan.md)
disetujui melalui "lanjut ke task breakdown". [Tasks](./specs/block-id-fold-persistence/tasks.md)
accepted melalui "Task Breakdown accepted lanjut implementasi".
Implementasi hide/auto-ID/capture/restore kini terhubung, dengan coordinator per file,
save settings serial, rename/delete dan cancellation lifecycle.
Probe Obsidian 1.14.2 menggunakan editor detached sintetis tanpa file dan callbacks save dimatikan.
foldMore/foldLess memakai efek CM6 host; teks dan selection tetap sama.
Range parent 18–55 dan child 38–55 membuktikan range native dimulai setelah newline.
Annotation tidak membedakan asal pengguna/plugin; maintainer mengizinkan keduanya untuk opt-in auto-ID (ADR-004).
Tests dan native acceptance terbaru dicatat di [ledger fold](./specs/block-id-fold-persistence/tasks.md).
Probe ini bukan bukti acceptance fitur lengkap di vault, popout, atau mobile.
Gate otomatis implementasi fold: 33 files / 211 tests; 28 browser checks fold,
13 checks performa, 24 sidebar; typecheck/lint/build/artifacts/docs lulus.
Browser fold mencakup dua pane dan 50 editor create/destroy dengan parser sintetis;
native H01–H08 tetap terbuka. Tidak ada commit atau deployment.

## Audit performa dan kerapian seluruh kelompok fitur — 2026-09-27

Tindak lanjut perencanaan tersedia sebagai [spec](./specs/performance-code-quality/spec.md),
[plan](./specs/performance-code-quality/plan.md), dan
[tasks](./specs/performance-code-quality/tasks.md), kemudian disetujui untuk
implementasi R1–R7/R9. Keputusan R8 tetap terpisah. Temuan di bawah adalah
baseline sebelum perbaikan; status terbaru berada pada checkpoint di atas.

Audit atas working tree `codex/sidebar-equal-resize`, termasuk perubahan sidebar
yang belum di-commit. Cakupan: registrasi fitur, jalur editor/render, lifecycle,
penyimpanan settings, dan tests yang tersedia. Ini audit source dan probe
terisolasi, bukan profil FPS, CPU, atau heap Obsidian pada vault pengguna.
Tidak ada perubahan runtime, deployment, atau commit dalam audit ini.

### Temuan yang perlu ditindaklanjuti

1. **P1 — observer embed tidak dilepas.** `src/cm6/plugin.ts:236` membuat
   `MutationObserver` lokal untuk seluruh owner document setiap editor dibuat;
   `destroy()` pada baris 63 tidak menyimpannya atau memanggil `disconnect()`.
   Callback menangkap instance editor. Probe terisolasi memakai metode asli
   `watchEmbeddedMarkdown` dan `destroy`, dengan observer/window tiruan:
   50 siklus create/destroy meninggalkan 50 observer aktif; satu penambahan node
   yang tidak terkait menyebabkan 50 pemeriksaan. Perbaikan: kepemilikan observer
   yang eksplisit dan disconnect saat destroy; pertimbangkan satu observer per
   document. Tambahkan regression test lifecycle. RAF startup dan RAF pengukuran
   pada baris 82/404 juga perlu dibatalkan atau diberi guard saat destroy.
2. **P2 — satu preset memicu penyimpanan berulang.** Delapan entri
   `MANAGED_FEATURES` di `src/capabilities/features/writing-modes/active-mode.ts`
   memanggil `FeatureToggle.toggle()`, masing-masing memanggil `saveSettings()`
   (`src/capabilities/base/feature-toggle.ts:58`), bahkan untuk nilai yang sama.
   Jalur UI menyimpan sekali lagi. Setiap save memperbarui workspace options dan
   toolbar (`src/lib.ts:254`). Pisahkan penerapan state dari persist dan simpan
   sekali setelah seluruh preset diterapkan. Uji jumlah write dan refresh.
3. **P2 — toolbar melakukan pekerjaan tanpa perubahan tampilan.**
   `src/capabilities/features/toolbar/controller.ts:148` mengaktifkan interval
   selama toolbar enabled meski kedua timer disembunyikan. Render menghitung
   target/policy sebelum guard enabled (baris 368), sedangkan selection extension
   tetap menjadwalkan perubahan ketika toolbar mati. HUD memakai
   `replaceChildren()` setiap render (baris 431). Guard lebih awal, hentikan tick
   jika tidak ada output waktu yang terlihat, dan update label hanya bila berubah.
   Besarnya biaya layout/FPS masih perlu profil native.
4. **P2 — outline membangun ulang seluruh daftar untuk event yang terlalu luas.**
   `src/components/outline-view.ts:418` menerima perubahan metadata semua file;
   `buildOutline()` mengosongkan container (baris 1193) lalu merender Markdown
   setiap baris secara async (baris 1095). Debounce 200 ms tidak membatalkan
   render yang sudah berjalan. Filter event berdasarkan sumber outline, tambahkan
   revision/disposal guard, dan pisahkan update active row dari rebuild konten.
   Risiko interleaving perlu regression test dengan renderer yang ditunda.
5. **P2 — callback MonoNote tetap berjalan setelah disable.**
   `src/capabilities/features/general/mononote.ts:126` dan 144 menjadwalkan timeout
   tanpa menyimpan handle; disable hanya melepas event dan membersihkan Set.
   Callback tertunda masih dapat detach/navigate/focus tab setelah fitur dimatikan.
   Batalkan timeout atau gunakan generation guard; selesaikan promise yang dibatalkan.
6. **P2 — Hemingway melepas listener dari document yang bisa berbeda.**
   `src/capabilities/features/hemingway-mode/hemingway-mode.ts:92` memasang listener
   pada `window.activeDocument`; disable membaca active document kembali.
   Berpindah ke popout sebelum disable dapat meninggalkan listener pada document
   awal. Simpan target registrasi dan cleanup target yang sama; uji pergantian
   document, toggle berulang, dan unload.
7. **P2 — sebagian pengaturan block ID/fold belum tersambung.**
   Registrasi di `src/lib.ts` tidak memakai `blockIdHiderPlugin`,
   `createFoldPersistExtension`, atau `restoreFoldState`; pencarian referensi source
   hanya menemukan deklarasinya. Toggle hide IDs, auto-generate on fold, dan fold
   persistence tersedia tetapi tidak memasang behavior tersebut. Ini gap wiring,
   bukan biaya runtime aktif. Jangan langsung menghubungkan helper fold yang ada:
   implementasinya menandai item beranak sebagai folded tanpa membaca fold state,
   dan restore hanya mengubah selection. Perlu kontrak/test native sebelum integrasi.
8. **P3 — GFM Live Preview menjadwalkan scan pada setiap update.**
   `src/gfm-anchor/live-preview.ts:19` selalu menjadwalkan RAF; guard enabled baru
   dijalankan di callback. Ketika aktif, seluruh anchor pada contentDOM dipindai
   kembali termasuk saat perubahan selection saja. Guard sebelum schedule dan
   invalidasi berdasarkan perubahan DOM/doc/viewport perlu diuji agar anchor yang
   muncul belakangan tetap ditangani. Gunakan owner window untuk RAF popout.

### Cakupan dan bagian yang sudah memiliki pembatasan biaya

| Kelompok | Hasil audit source |
| --- | --- |
| General, platform, frontmatter, cursor restore | Observer/RAF perlu cleanup; cursor disimpan berdasarkan view, tetapi persist memakai refresh global. |
| Writing modes | Delapan toggle dalam satu preset belum dibatch. |
| Writing focus | Operasi event-driven dan enable idempotent; cleanup fullscreen/window dan unload masih perlu QA native. |
| Typewriter, keep above/below | Pembacaan geometri memakai CM6 requestMeasure; RAF lanjutan belum memiliki cleanup. |
| Current line, fade, dimming | CSS/dekorasi lokal; sentence scan dibatasi baris aktif. Tetap berbagi lifecycle plugin editor yang bermasalah. |
| Whitespace, strict break, max chars | Dekorasi memakai visibleRanges; selalu terpasang merupakan keputusan kompatibilitas yang disengaja. |
| Outliner focus dan keyboard | Extension memakai compartment; operasi list berdasarkan syntax tree. Outline sidebar memiliki rebuild penuh. |
| Block ID, fold persistence | Command manual tersedia; helper hide/fold belum diregistrasikan. |
| Hemingway, MonoNote | Cleanup lintas document dan callback tertunda perlu diperbaiki. |
| Toolbar, timer, reorder, command parity | RAF dikoalesensikan per document dan destroy tersedia; tick/render yang tidak perlu masih ada. |
| Callout catalog, style, discovery | Style memiliki equality guard dan cleanup per document; discovery berjalan saat UI/refresh/CSS change, bukan polling vault. |
| GFM compatibility | Resolver memakai metadata cache; Live Preview masih menjadwalkan pekerjaan pada setiap update. |
| Update announcement | Toggle berbasis class, tidak ditemukan polling background pada feature tersebut. |
| Sidebar equal resize | Budget operasi dan cleanup sudah diuji; angka fixture dicatat pada checkpoint di bawah. |

### Validasi dan urutan tindak lanjut

`pnpm run check:ci` kembali lulus: 29 files / 193 tests, typecheck, seluruh lint,
build plugin, verifikasi artifacts 1.1.0, dan VitePress. Gate ini tidak mengukur
kebocoran heap atau menjamin performa semua fitur di Obsidian.

Urutan yang disarankan: cleanup observer/RAF; cleanup MonoNote/Hemingway;
batch preset persistence; kurangi pekerjaan toolbar/GFM; invalidasi/render outline.
Gap block ID/fold memerlukan keputusan implementasi terpisah, bukan cleanup mekanis.
Setiap perbaikan perlu regression test dan penerimaan desktop/popout/mobile yang
relevan. Pengukuran native berikutnya sebaiknya mencakup banyak siklus buka/tutup
editor, idle dengan fitur mati, dokumen panjang, banyak pane, serta outline besar.

## Sidebar equal resize — 2026-09-27

Maintainer mengonfirmasi fitur berhasil dan meminta evaluasi performa/kerapian.
Optimasi mempertahankan perilaku: satu pembacaan geometri per flush, guard write
tanpa layout read tambahan, dan hanya menulis sisi yang perlu berubah.
Pada fixture 60 pembaruan/600 pointer events, reads turun 360 → 120 dan writes
120 → 60; idle reads tetap nol. Browser fixture lolos 24 checks. Ini bukan
pengukuran FPS/CPU vault pengguna. Optimasi belum dideploy oleh agen; acceptance
laporan maintainer berlaku pada behavior sebelumnya, matrix detail belum dikonfirmasi.

Gate sesudah optimasi: `pnpm run check:ci` Pass, 29 test files / 193 tests,
QA, build plugin, artifacts 1.1.0, dan build VitePress. Pengujian budget operasi
dan cleanup ditambahkan agar biaya drag tidak kembali meningkat tanpa terdeteksi.

Spec, plan, ADR-003, dan task breakdown disetujui maintainer pada branch
`codex/sidebar-equal-resize`. Toggle General, additive settings, model,
controller, dan adapter native sudah diimplementasikan. Adapter dibatasi ke
Obsidian 1.14.2; manifest minimum tidak dinaikkan dan versi lain tidak menulis
lebar. Verifikasi versi lain masih terbuka.

Probe CLI menjalankan metode native pada elemen terlepas tanpa mengubah sidebar
aktif atau menyimpan layout vault. Setter tidak melakukan clamp; handler drag
membatasi 200px hingga max(200px, 80% lebar workspace). Collapse/expand
mempertahankan logical size dan menandai animasi dengan overflow hidden.
Probe ini bukan acceptance visual penuh pada sidebar operasional.

`pnpm run check` dan `pnpm run check:ci` lolos pada Node 24.21.0 / pnpm 11.21.0:
29 test files / 191 tests, QA, build, artifacts 1.1.0, dan VitePress build.
Fixture adapter/controller produksi lolos 17 browser checks. Review memperbaiki
regresi toleransi antarsisi melalui test gagal sebelum perbaikan.
[Ledger](./specs/sidebar-equal-resize/tasks.md) memisahkan hasil ini dari
acceptance native H01–H08 yang belum dijalankan pada plugin terpasang.
Tidak ada commit, merge, push, release, atau deployment.

## Outline connectors — 2026-09-26

Scope dan implementasi diotorisasi maintainer melalui laporan screenshot:
garis parent-child tersambung pada baris multiline, ujung cabang melengkung,
dan hover/aktif hanya mempertegas jalur terkait. Branch: `codex/outline-connectors`.

Plan: hitung konektor dari hierarchy yang terlihat setelah collapse/filter;
gunakan tinggi baris untuk garis dan pisahkan stem anak dari ujung sibling.
Pertahankan operasi editor, identifier, settings, dan Markdown vault.
Perubahan lokal awal pada renderer dan SCSS diperiksa dan menjadi dasar koreksi.

Model konektor, renderer, SCSS, dan regression tests selesai. Empat unit tests
lolos; `node scripts/outline-css-regression.cjs` lolos 440 browser checks pada
dua lebar sidebar dan dua ukuran font, termasuk collapse/filter dan path
hover/aktif/fokus. Fixture memakai renderer konektor produksi dan Sass asli;
tidak memuat MarkdownRenderer atau seluruh host Obsidian. Preview diperiksa.

`pnpm run check` lolos pada Node 24.21.0 / pnpm 11.21.0. Gate menemukan 20
tautan lama di dua dokumen status ini; target diperbaiki ke lokasi `docs/en/`
yang sudah ada. `pnpm run check:ci` lolos: seluruh QA, 26 test files / 161 tests,
build plugin, verifikasi artefak 1.1.0, dan build VitePress.

Maintainer menerima perbaikan yang dilaporkan, meminta penutupan, dan
mengotorisasi commit serta merge lokal ke main pada 2026-09-27. Issue ditutup
untuk scope laporan ini. Matrix lengkap desktop/mobile/popout, tema, dan semua
interaksi belum dikonfirmasi satu per satu; dicatat sebagai deferred, bukan
Pass. Review source menjaga identifier, Markdown, dan operasi editor existing.
Push, release, dan deployment tidak termasuk integrasi lokal ini.

## Mononote (single tab per note) — 2026-09-14

Pada `feature/mononote-single-tab`: toggle "Keep one tab per note" ditambahkan
ke General settings (`general.isMononoteEnabled`, default off) dan
diimplementasikan di `src/capabilities/features/general/mononote.ts`, diadaptasi
dari [MonoNote](https://github.com/czottmann/obsidian-mononote) oleh
[czottmann](https://github.com/czottmann) (MIT). Saat aktif, membuka file yang
sudah terbuka di tab lain pada grup tab yang sama akan memfokuskan tab lama
alih-alih membuka tab duplikat. `pnpm run check` dan `pnpm run test` (141
tests) lolos. Belum ada Vitest khusus untuk fitur ini, sejalan dengan fitur
event-workspace sejenis (mis. restore cursor position) yang juga tidak
memiliki unit test karena bergantung pada internal `WorkspaceLeaf` yang tidak
dipublikasikan Obsidian. Acceptance runtime desktop/mobile/popout di Obsidian
belum diuji.

## Compact settings checkpoint — 2026-09-14

Pada `codex/compact-settings-layout`, spec, plan, dan tasks sudah disetujui
maintainer. Overview/detail navigation, grouping General/GitHub dan
Typewriter/Keep Lines, per-mode recipe editing, serta default matrix telah
diimplementasikan. Targeted Vitest lolos 5 files / 28 tests; `pnpm run check`
lolos typecheck, Biome, Obsidian ESLint, Stylelint, dan Markdown lint.
Review menjaga stored recipes, command IDs, feature side effects, dan
dependency direction existing. `pnpm run check:ci` lolos QA, 22 files / 140
tests, build plugin, artifacts 1.1.0, dan build VitePress. Node 24.19.0;
pnpm memakai versi pinned 11.21.0.

Host desktop/mobile/popout belum diuji untuk layout baru; H01–H06 tetap Pending
di [ledger](./en/specs/compact-settings-layout/tasks.md). Tidak ada commit, push,
release, atau deployment ke vault pada scope ini. Heading General mengikuti
permintaan eksplisit maintainer dengan pengecualian lint terlokalisasi; aturan
QA lainnya tetap dijalankan.

Koreksi visual berdasarkan screenshot maintainer: General/GitHub memakai satu
SettingGroup; preset dan Capabilities memakai panel bersama; Toolbar memiliki
deskripsi dan header detail sejajar dengan chevron Back yang aksesibel.
`pnpm run check:ci` setelah koreksi lolos QA, 22 files / 141 tests, build,
artifacts 1.1.0, dan docs build. Tampilan hasil koreksi di host belum diterima.

Maintainer mengonfirmasi layout final, termasuk Toolbar/Callouts dalam kartu
General, dan mengotorisasi integrasi lokal ke main pada 2026-09-14. Acceptance
visual yang dilaporkan diterima; full matrix keyboard/mobile/popout/scrolling
H01–H06 belum dikonfirmasi satu per satu. Tidak ada push/release/deployment.

## Development dependency security checkpoint — 2026-09-14

- Branch `bug-fixing`: Electron diperbarui dari 40.10.6 ke 41.10.7 untuk
  menangani Dependabot #48/#49; advisory tidak menyediakan patch seri 40.
- Override transitive `js-yaml@^4` ke 4.3.2 menangani #73. Override khusus
  `vitepress>vite` ke 6.4.3 menangani #19/#20/#21 dan menghapus esbuild
  0.21.5 yang rentan (#18). VitePress tetap 1.6.4; plugin Vue 5.2.4 mendukung
  Vite 6. Settings dan dependency CM6 yang dipin tetap dipertahankan.
- Instalasi, termasuk binary Electron dan Husky prepare, selesai. Pada Node
  24.19.0 / pnpm 11.21.0, `pnpm audit --json` melaporkan 0 vulnerability;
  `pnpm run check:ci` lolos seluruh QA, 19 files / 130 tests, build plugin,
  artifacts 1.1.0, dan build dokumentasi dengan Vite 6.
- `pnpm peers check` masih melaporkan mismatch yang sudah ada sebelum perubahan:
  Obsidian dengan eslint-plugin-obsidianmd; ESLint 10 dengan plugin SDL,
  React, dan import; serta esbuild 0.25.12 dengan Vite 8 milik Vitest.
  Gate otomatis di atas lolos; warning peer ini belum diselesaikan.
- Hasil audit adalah bukti lokal. Penutupan alert GitHub menunggu perubahan
  tersedia di default branch dan pemindaian ulang. Tidak ada commit, push,
  deploy, atau perubahan runtime untuk dua bug editor dalam checkpoint ini.

## Editor bug-fixing closure — 2026-09-14

Current closure: maintainer confirmed both reported bugs resolved and requested
closure for now on 2026-09-14. Callout and Canvas fixes are implemented and
accepted for the reported host cases (Obsidian 1.14.1, installer 1.13.7,
Advanced Canvas 7.0.0). Additional host/platform/settings coverage is deferred,
not marked Pass. CSS scope may affect other embedded editors, empty-area clicking
or nested/theme interactions; reopen on concrete regression evidence.
No further implementation is planned now. [Accepted spec](./en/specs/editor-bug-fixing/spec.md),
[plan](./en/specs/editor-bug-fixing/plan.md) and
[completion/evidence ledger](./en/specs/editor-bug-fixing/tasks.md) preserve scope,
diagnosis, acceptance and deferred QA F01–F05.

Callout CSS dims rendered widget subtrees once while preserving active source
and existing focus/pause branches. Canvas clickable-sizer now requires a
Markdown source-view ancestor in existing active-leaf/iframe contexts; note/card
DOM evidence confirmed that distinction. The pseudo-element height-growth trigger
was isolated in the host; the internal auto-sizing feedback remains an inference.

Standalone browser regression using existing Electron/Sass passes 155 checks
against actual compiled SCSS. It reproduced 40 callout failures before its fix
and 8 Canvas failures before the scope fix. No added dependencies or CM6 changes
were needed for the editor fixes. This browser runner is separate from CI and
does not simulate the entire Obsidian/Advanced Canvas host.

`pnpm run check:ci` passed all QA, 19 files / 130 tests, plugin build,
artifacts 1.1.0 and docs build. Local main integration and pruning merged branches
are authorized; push/release/deployment are outside this integration scope.

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

- Branch `codex/adopt-floaty-toolbar`: [spec](./en/specs/floaty-toolbar/spec.md)
  accepted oleh maintainer; [plan](./en/specs/floaty-toolbar/plan.md) dan
  [ADR-002](./en/reference/decisions/ADR-002-floaty-toolbar-and-callout-management.md)
  Accepted. [Task breakdown](./en/specs/floaty-toolbar/tasks.md): T01-T10 (Slice A
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

## Continuation 2026-09-13

- Working tree awal bersih pada `codex/adopt-floaty-toolbar`. Source/ledger
  T01-T13 ditinjau; perubahan HUD terbaru hanya memakai status bar utama dalam
  mode floating maupun dock. Angka dan uraian snapshot sebelumnya di atas
  merupakan bukti historis, bukan status source terbaru.
- T14 runtime styling diimplementasikan: hex/Lucide validation, owned style node
  per document, save/reset/window-open/window-close/unload lifecycle. Test suite
  lolos 12 files / 90 tests, termasuk tiga test baru generator dan fake Document.
  Pada checkpoint T14, form/preview T15 belum diimplementasikan. QA Obsidian
  tetap pending.
- `pnpm run check:ci` lolos pada Node 24.19.0: typecheck, Biome, Obsidian
  ESLint, Stylelint, Markdown lint, 90 tests, plugin build, artifacts 1.1.0,
  dan VitePress build. Satu error Markdown pada catatan status diperbaiki sebelum
  gate ulang. Tidak ada commit/push/deploy/release dalam kelanjutan ini.

## Remaining runtime and integration acceptance

Maintainer telah mengonfirmasi alur settings callout dan perbaikan preview
terakhir selesai melalui QA langsung (2026-09-13). Ini menutup follow-up
layout/default/picker/preview yang dilaporkan dalam sesi, bukan seluruh matrix
mobile/popout atau discovery. Implementasi T14-T15 disimpan dalam atomic
Conventional Commits dengan pre-commit QA dan commitlint aktif.

### T15 continuation

Form inherit/override, warna/ikon, explicit save/reset, dan preview callout
ditambahkan pada settings desktop/mobile. Renderer memakai Component yang
dibersihkan saat rerender, tab change, hide, dan unload. Suite model lolos
91 tests; DOM/settings/MarkdownRenderer dan dark/light/mobile/theme-switch
acceptance belum diuji di Obsidian. T16 discovery belum dimulai.

`pnpm run check:ci` lolos: QA, 12 files / 91 tests, build plugin, artifacts
1.1.0, dan docs build. Empat error sentence-case UI pada checkpoint awal
diperbaiki sebelum gate lengkap. Perubahan belum di-commit atau di-deploy.

Koreksi layout dari screenshot maintainer: kontrol catalog, konfigurasi, dan
preview sekarang berada dalam satu panel per callout. Test host grouping gagal
sebelum fix dan lolos setelahnya; `pnpm run check:ci` lolos 13 files / 92 tests,
seluruh QA/build/artifacts/docs. Test memakai fake Setting/editor untuk memeriksa
grouping; tampilan hasil koreksi di Obsidian belum diverifikasi runtime.

Koreksi kedua menyatukan nama/ID/source dan controls dalam summary pembuka
konfigurasi/preview, tanpa heading duplikat. Source menunjukkan input warna/ikon
sebelumnya diabaikan saat mode inherit; sekarang edit memilih override otomatis.
Properti preview lokal memakai generator yang sama dengan runtime CSS dan
note hanya berubah style setelah save. `pnpm run check:ci` lolos 13 files /
93 tests, QA/build/artifacts/docs. Builtin Note property parity diuji; interaksi
form dan hasil visual belum diuji ulang di Obsidian. Lint melarang preview style
element, sehingga implementasi memakai custom properties pada callout preview.

Layout terbaru mengikuti screenshot settings Outliner: satu native SettingGroup
per callout, header/preview/form langsung dalam list grup, tanpa accordion atau
kartu bertumpuk. Preview diinisialisasi saat settings tampil. `pnpm run check:ci`
lolos 13 files / 93 tests, seluruh QA/build/artifacts/docs. Satu format SCSS
diperbaiki sebelum gate final. Runtime visual tetap belum diverifikasi; tidak
commit/deploy pada revisi ini.

Revisi urutan/picker: preview paling atas, header identitas/on-off/sort/reset,
lalu konfigurasi. Reset header mengembalikan style dan label builtin; tombol
reset override terpisah dihapus. Searchable icon picker memakai registry host
Obsidian (`getIconIds`/`getIcon`), tanpa dependency Lucide tersendiri; picker
warna memakai ColorComponent native. `pnpm run check:ci` lolos 14 files /
94 tests, QA/build/artifacts/docs. Registry helper diuji dengan data host palsu;
ketersediaan ikon serta interaksi picker pada Obsidian nyata belum diverifikasi.

Bug ikon T15: generator sebelumnya memberi data URL pada --callout-icon,
sedangkan kontrak Obsidian mengharapkan ID/SVG. Dua test regresi gagal sebelum
fix; sekarang ID tervalidasi dipakai, preview SVG diperbarui dengan setIcon,
dan save memicu css-change bila CSS berubah. Picker menjadi icon-only button.
Field inherit memperlihatkan computed defaults yang dikenali tanpa mengubah
settings null/inherit. `check:ci` lolos 15 files / 95 tests, seluruh gates.
Parser default diuji; wiring renderer/CSS event dan tampilan Obsidian belum
diverifikasi runtime. Tidak deploy/commit pada revisi ini.

Follow-up warna inherit: parser RGB tuple saja gagal membaca hex/rgb tema.
Regression test gagal sebelum fix; parser kini menerima hex/rgb/rgba dan
fallback warna computed ikon yang dirender. Field/picker tetap hanya nilai
tampilan inherit. `check:ci` lolos 15 files / 96 tests, QA/build/artifacts/docs;
runtime pengisian warna pada tema user belum diverifikasi ulang.

Regresi preview setelah default terisi: setValue programatis pada color picker
dapat memicu onChange dan memilih override/unsaved tanpa edit user. Binding
sinkronisasi membungkam callback default/input-hex, tetapi menerima edit picker
user. Test dengan emitting fake picker gagal sebelum guard dan lolos setelah
fix. `check:ci` lolos 16 files / 97 tests, QA/build/artifacts/docs; visual tema
Obsidian belum diverifikasi ulang. Override lama yang sudah tersimpan tidak
diubah otomatis; reset header mengembalikannya ke inherit.

- Runtime Obsidian desktop, mobile, dan popout belum diuji pada perubahan ini.
- Workflow GitHub Actions belum dijalankan dari perubahan lokal ini.
- Branch protection GitHub belum diverifikasi atau dikonfigurasi.
- Dependency direction dan cycles belum ditegakkan dengan architecture tests.
- Akurasi docs dan ukuran atomic commit tetap memerlukan review manusia.

Lihat [AI Assisted Development](https://github.com/parkisutama/obsidian-univeritas/blob/main/docs/unisastra/en/for-developers/ai-assisted-development.md)
dan [QA guide](https://github.com/parkisutama/obsidian-univeritas/blob/main/docs/unisastra/en/for-developers/run-qa-before-merge-or-release.md).

## T16 discovery checkpoint — 2026-09-13

CSSOM discovery dan settings integration diimplementasikan: nested literal IDs,
deduplication, bounded traversal, partial scan, explicit Add, manual fallback,
dan lifecycle cleanup untuk refresh/css-change. Refresh tidak merender ulang
draft style atau menyimpan kandidat otomatis. Save failure mengembalikan entry.
Suite otomatis lolos 18 files / 101 tests; `check:ci` mencakup QA, build,
artifact verification, dan docs build. Model dicommit sebagai `232080e`;
integrasi disimpan sebagai atomic Conventional Commit terpisah.
Acceptance theme/snippet actual, mobile, dan popout tetap pending.

## T17a GitHub output checkpoint — 2026-09-13

Output mode tersimpan kini dipakai menu dan shared executor: lima uppercase
markers, shared canonical visibility, custom unavailable, dan refusal untuk
title/folding/nesting atau selection yang mengabaikan batas baris/blok quote.
Refusal tidak dispatch atau menambah undo entry; note existing tidak diubah
oleh output switch. Suite lolos 18 files / 106 tests. `check:ci` mencakup QA,
build, artifact verification, dan docs build. Runtime output switch/rendered
markers belum diuji di Obsidian. T17b command parity belum dimulai.

## Compact catalog follow-up (C1/C2) checkpoint — 2026-09-14

Maintainer meminta redesign compact untuk Callout manager dan penyatuan
catalog output sebelum melanjutkan T17b. C1: header preview compact
(ikon/warna/label asli, bukan placeholder "Preview") dengan expand/collapse
keyboard-accessible yang tidak mengulang draft form; kontrol catalog
(ID/source/reorder/enable/reset) pindah ke `Setting` terpisah di sisi kanan
header. C2: dihapus toggle global "Output format" Obsidian/GitHub; toolbar
sekarang satu catalog unified yang selalu menyisipkan marker uppercase
(`wrapAsCallout`/`changeCalloutType` di-uppercase-kan, `calloutEdit` kehilangan
parameter `mode`), sehingga custom types dan title/folding/nesting selalu
didukung tanpa restriksi mode. Label kompatibilitas GitHub
(`githubAlertMarkersForCanonicalId`) hanya tampil di tab Callouts. `outputMode`
tetap ada di settings untuk kompatibilitas data lama, tidak lagi dibaca saat
runtime. `pnpm run check:ci` hijau 18 files / 106 tests setelah C2. Runtime
Obsidian belum diuji.

## T17b command palette parity checkpoint — 2026-09-14

16 command baru (`floaty-bold`, `floaty-italic`, ..., lima command callout,
ID sama persis dengan upstream Floaty Toolbar) plus `manage-callouts` (baru).
Setiap command memakai `ToolbarController.target()` dan `executeToolbarAction`
yang sama dengan toolbar UI — guard/refusal identik, bukan diimplementasikan
ulang. Command disembunyikan dari palette di mobile atau saat tidak ada CM6
view aktif. `pnpm run check:ci` hijau 18 files / 111 tests. Runtime command
palette belum diuji di Obsidian.

## T18 reorder checkpoint — 2026-09-14

Delapan item toolbar (enam tombol aksi plus dropdown heading/callout) dapat
diurutkan lewat long-press (~500ms, mengikuti `LONG_PRESS_MS` upstream) atau
panah atas/bawah di tab Toolbar Settings, keduanya menulis
`settings.toolbar.buttonOrder` yang sama (field ini sudah ada sejak T01 tapi
baru sekarang benar-benar dipakai rendering). State drag per-surface (per
window), bukan singleton modul seperti upstream, sehingga popout tidak saling
berbagi state. Long-press yang mencapai fase dragging selalu menekan klik
trailing-nya — memperbaiki perilaku upstream yang mengeksekusi aksi pada
`mousedown` sebelum timer long-press sempat berjalan. Escape dan
`destroy()` surface (unload/window close) membatalkan drag secara bersih.
`pnpm run check:ci` hijau 19 files / 126 tests. Runtime click-vs-hold,
ghost tracking, dan popout belum diuji di Obsidian.

## T19 license notice checkpoint — 2026-09-14

Notice MIT Floaty Toolbar ditanam sebagai banner `/*! ... */` di
`dist/main.js` lewat opsi `banner` esbuild (bertahan meski build
diminifikasi/`stripDebug`, karena banner ditambahkan setelah minifikasi,
bukan diparse olehnya), dan disalin ke `dist/licenses/floaty-toolbar-MIT.txt`
untuk zip release (workflow sudah menyalin seluruh `dist/` secara recursive).
`verify:artifacts` menolak build bila banner hilang/stale atau salinan dist
tidak sinkron dengan sumber. Diverifikasi terhadap build asli, bukan hanya
fixture test: `dist/main.js` memuat banner penuh dan
`diff dist/licenses/floaty-toolbar-MIT.txt licenses/floaty-toolbar-MIT.txt`
kosong. `pnpm run check:ci` hijau 19 files / 130 tests.

## Deferred maintainer feedback — 2026-09-14

Dicatat sebagai known issue/backlog di tasks.md, sengaja tidak dikerjakan agar
T17b-T19 selesai lebih dulu:

- Bug: callout yang dirender tidak ikut dimmed di bawah mode Dim Unfocused
  (paragraphs/sentences). Analisis awal (tanpa host Obsidian untuk konfirmasi
  DevTools) ada di tasks.md; kemungkinan terkait bagaimana rendering callout
  Obsidian membungkus `.cm-line` di dalam `.callout`, memengaruhi bagaimana
  class active/inactive per-line diterapkan. Fitur dim-unfocused sendiri
  mendahului pekerjaan floaty-toolbar dan bukan bagian ADR-002.
- Redesign UI: preview collapsed Callout manager diminta menampilkan info
  compact (ID + label kompatibilitas singkat "Obsidian only"/"Obsidian and
  GitHub") menggantikan kalimat sample body generik; IMPORTANT/CAUTION
  diusulkan sebagai contoh custom-entry bersumber dari GitHub Alerts (masih
  konflik dengan aturan dedup alias saat ini, perlu keputusan desain); dan
  tombol "Save style"/"Apply style" diganti ikon floppy-disk sejajar tombol
  reset. Belum diimplementasikan.
