# Tasks sinkronisasi lebar sidebar

- Status: Accepted oleh maintainer pada 2026-09-27 melalui "lanjutkan implementasi".
- Tanggal: 2026-09-27.
- Branch: `codex/sidebar-equal-resize`.
- Requirement: [spec Accepted](./spec.md).
- Approach: [plan Accepted](./plan.md).
- Keputusan: [ADR-003 Accepted](../../en/reference/decisions/ADR-003-sidebar-equal-resize.md).

## Aturan eksekusi

### BUG-01 — ukuran sidebar membesar tanpa batas

- Trigger: laporan maintainer 2026-09-27; live snapshot kedua sidebar
  21.474.836,8 px, root 0 px, viewport 962 px; sync sudah nonaktif.
- Recovery authorized: reset ke 280/280 px dan requestSaveLayout.
  Verifikasi live: render 280/280, viewport/workspace 1536, root 976 px.
- Reproduksi: fixture workspace 26.843.546 px dengan saved width ekstrem gagal
  pada adapter lama; test sebelumnya hanya memverifikasi clamp tiap sisi secara terpisah.
- Fix: shared pair budget 80% dari min(workspace, viewport); minimum native tidak
  dipaksakan ke budget mustahil. Observe window resize dan recheck viewport pada write.
- Regression: startup rusak, workspace overflow, drag ekstrem lalu mengecil,
  jendela sempit feasible/tidak feasible, closed width, dan operation budgets.
- Perbaikan source/build belum dideploy; sinkronisasi pengguna tetap mati.
  `pnpm run check:ci` lulus: 33 files / 212 tests, typecheck/lint, build,
  artifacts 1.1.0 dan VitePress. Fixture sidebar lulus 29 checks;
  60 updates/600 pointer events tetap 120 reads, 60 writes, idle reads 0.

### Prosedur task

Kerjakan satu slice sampai test relevan, dokumentasi, dan review selesai.
Tulis regression test yang gagal sebelum implementasi behavior terkait.
Status task membedakan Pending, In progress, Blocked, Automated verified,
dan Accepted; Automated verified bukan acceptance runtime.

Simpan hasil aktual, versi host/toolchain, dan keterbatasan di ledger ini.
Jalankan `pnpm run check` per slice kode, lalu `pnpm run check:ci` pada T05.
Checkpoint setelah T02 dan T04; checkpoint adalah laporan hasil, bukan
permintaan persetujuan rutin di dalam scope yang telah disetujui.

Jangan mengintegrasikan adapter sebelum gate T01 terbukti. Jika host tidak
tersedia, pekerjaan model/test yang independen dapat dilanjutkan dan adapter
tetap Blocked. Jangan mengklaim fixture sebagai bukti kontrak native.
Instruksi lanjutan "oke commit kalau begitu" mengotorisasi commit lokal pada 2026-09-27.
Merge, push, release, dan deployment tetap tidak diotorisasi oleh breakdown ini.

## Dependency dan hasil pengguna

| Task | Hasil | Dependency | Status |
| --- | --- | --- | --- |
| T01 | Kontrak native resize terverifikasi sebelum kode integrasi bergantung padanya | Spec, plan, ADR Accepted | Verified: native methods 1.14.2 pada elemen terlepas; lihat ledger |
| T02 | Toggle default off dan resize langsung kedua sidebar terbuka | T01 untuk integrasi; model/settings tests dapat dimulai mandiri | Automated verified; native acceptance pending |
| T03 | Buka/tutup sidebar mempertahankan ukuran tersimpan dan memilih acuan yang benar | T02 | Automated verified; native acceptance pending |
| T04 | Batas native, startup, dan perubahan layout ditangani tanpa loop atau listener tertinggal | T03 | Automated verified; native acceptance pending |
| T05 | Bukti QA, dokumentasi pengguna, dan acceptance ledger lengkap | T04 | QA/docs selesai; H01–H08 masih terbuka |

## T01 — Buktikan kontrak adapter

- Area: inspeksi tipe lokal dan host/test environment Obsidian; bila dibutuhkan,
  helper diagnostik terbatas di `scripts/`, bukan runtime plugin.
- Verifikasi identitas sidebar utama/container/handle, logical expanded width,
  state collapsed, setter dan pemilik clamp, persistence layout, serta urutan
  pointer/resize/layout/transition end dan cancel.
- Acceptance: setiap operasi adapter yang direncanakan mempunyai bukti versi
  host, cara observasi, hasil aktual, dan batas kompatibilitas. Nilai minimum
  dan maksimum berasal dari kontrak native; bukan angka perkiraan.
- Test/QA: amati drag kedua sisi, buka/tutup, jendela sempit, serta logical vs
  rendered width. Pemeriksaan yang mengubah layout memakai lingkungan uji yang
  sesuai scope; tidak deploy atau menulis vault operasional secara implisit.
- Dokumen: isi ledger adapter di bawah. Jika kontrak berbeda material dari
  plan/ADR, catat temuan untuk keputusan maintainer sebelum pendekatan diubah.
- Gate: jangan tandai selesai hanya karena nama field ditemukan pada tipe atau
  sumber historis. Jika tidak ada host yang bisa diverifikasi, catat Blocked
  dengan bukti yang masih diperlukan.

## T02 — Toggle dan resize langsung

- Area: `src/capabilities/settings.ts`, General registry, toggle baru,
  `sidebar-resize/model.ts`, `controller.ts`, `adapter.ts`, serta hook settings
  di `src/lib.ts` sesuai plan.
- Dependency: T01 lulus sebelum wiring adapter; model/settings tests tidak
  membutuhkan akses host.
- Acceptance: AC01, AC02, AC06, dan dasar AC09. Toggle bernama tepat,
  default false, migrasi mempertahankan nilai lama/eksplisit; aktivasi dua sisi
  memakai rata-rata. Drag kiri/kanan memperbarui sisi lain sebelum pointer up.
- Lifecycle awal: enable idempotent, disable/unload membatalkan listeners dan
  frame; controller hanya berjalan pada desktop utama dengan activation dan
  platform settings yang mengizinkan. Tidak merebut pointer handling native.
- Test: tambah `tests/sidebar-resize-model.test.ts` dan
  `tests/sidebar-resize-controller.test.ts`; perluas `tests/settings.test.ts`
  dan `tests/settings-navigation.test.ts`. Uji default/migrasi, rata-rata,
  sumber drag, coalescing frame, no-op tolerance, serta disable sebelum flush.
- Dokumen: catat implementasi parsial dan test aktual dalam ledger ini;
  current state hanya menyebut behavior yang telah diverifikasi.
- Gate: targeted tests, `pnpm run check`, review identifier/dependency/lifecycle.
  Checkpoint 1 melaporkan bukti T01 dan hasil slice dasar T02.

## T03 — Transisi visibility dan ukuran tersimpan

- Area: model/controller/adapter dan tests T02; fixture browser di
  `tests/fixtures/sidebar-resize.ts` dan runner di
  `scripts/sidebar-resize-regression.cjs` menggunakan controller produksi.
- Dependency: T02.
- Acceptance: AC03–AC05 dan AC07. Sidebar kedua menjadi acuan; animasi tidak
  menjadi drag. Satu/tanpa sidebar tidak menulis ukuran sisi tertutup.
  Collapse saat drag/frame tertunda langsung mencegah write berikutnya.
- Test: urutan kiri-kanan dan kanan-kiri; contoh 320 → 380 → 340; close/reopen;
  transition cancel/event hilang; observer akibat write sendiri; repeated
  layout-change; tidak ada perubahan tersimpan pada sisi tertutup.
- Fixture: ukuran fractional dan border-box, perubahan animasi, handle tetap
  menerima event. Jangan menyamakan hasil fixture dengan native acceptance.
- Dokumen: perbarui ledger R02–R05 dan AC03–AC07 dengan evidence aktual.
- Gate: targeted tests, fixture browser, `pnpm run check`, review tidak ada
  polling/retry tanpa batas atau write saat visibility berubah.

## T04 — Batas native dan lifecycle lengkap

- Area: adapter/model/controller, hook refresh settings, serta tests dan fixture.
- Dependency: T03; batas native berasal dari bukti T01.
- Acceptance: AC07–AC10. Clamp ke irisan valid, toleransi maksimal 0,5 CSS px,
  rekonsiliasi terbatas; rentang mustahil/adapter unsupported/CSS konflik
  menangguhkan sinkronisasi tanpa memaksa sidebar buka. Notice sekali per episode.
- Startup aktif dua sisi menggunakan rata-rata; satu/tanpa sisi tidak menulis.
  Pembukaan bersamaan mengikuti aturan plan. Resize jendela memakai target
  bersama yang dibatasi ulang; pergantian pasangan sidebar mereset state.
- Test: asymmetric bounds, irisan kosong, render tidak konvergen, stale callback,
  pointercancel/blur, late layout-ready, activation off/on, platform switch,
  enable berulang, layout replacement, mobile/popout no-op. Verifikasi debounce
  persistence tanpa saveSettings tiap frame dan tanpa JSON workspace langsung.
- Dokumen: ledger fallback, kompatibilitas versi, dan cleanup; update baseline
  hanya setelah implementasi diverifikasi.
- Gate: targeted tests, fixture, `pnpm run check`, review side effects.
  Checkpoint 2 merangkum T03–T04 dan acceptance native yang masih terbuka.

## T05 — QA, dokumentasi, dan acceptance

- Area: current state/development status, architecture baseline, General user
  docs Indonesia/English, CHANGELOG format versi existing, index docs dan ledger.
- Dependency: T04.
- Perbaiki 30 target tautan lama `docs/README.md` yang telah berpindah ke
  `docs/en/` setelah memverifikasi target; pertahankan link artefak baru di
  `docs/specs/sidebar-equal-resize/`. Ini cleanup yang tercakup plan Accepted.
- Test/QA: `pnpm run check:ci`, fixture browser, review semua perubahan terhadap
  R01–R08/AC01–AC10, dependency direction manual, dan matrix native di bawah.
- Dokumentasi pengguna menjelaskan default off, acuan sidebar baru, hubungan
  panel tengah, CSS konflik, dan fallback. Jangan menyebut fitur shipped bila
  acceptance native belum selesai.
- Acceptance: gate otomatis lulus dengan hasil tercatat; setiap skenario native
  berstatus Pass/Fail/Not tested disertai versi dan bukti. Task tetap terbuka
  bila acceptance wajib belum dilakukan; laporkan blocker secara spesifik.
- Handover: daftar implementasi, hasil otomatis, risiko/acceptance tersisa;
  review diff sebelum staging, tanpa commit/deploy otomatis.

## Ledger adapter

Inspeksi CLI dan metode native pada 2026-09-27, Windows, Obsidian 1.14.2.
Probe berada di `scripts/sidebar-native-probe.js`; menjalankan metode native
dengan workspace palsu dan elemen terlepas, bukan memodifikasi sidebar aktif.
Source bundle lokal mengonfirmasi batas drag; sidebar kiri/kanan host memakai
fungsi handler yang sama. Tidak ada pembacaan note atau penulisan JSON vault.

| Bukti | Versi/lingkungan | Hasil dan rujukan |
| --- | --- | --- |
| Container, handle, logical/rendered width | Host 1.14.2, CLI read-only | Kedua container connected; handle `workspace-leaf-resize-handle tappable`; border-box. Logical/rendered kiri 374.3000183px; kanan 374.2999268/374.2875061px. |
| Setter dan clamp native | Metode host 1.14.2, elemen terlepas | Setter tanpa clamp. Workspace 1000px: drag x100 → 200px, x350 → 350px, x900 → 800px. Source handler: min 200px; max max(200px, 0.8 × workspace width). |
| Visibility dan urutan animasi/event | Metode host 1.14.2, elemen terlepas | Collapse/expand mengganti collapsed di awal, size tetap 800px, overflow hidden selama animasi lalu kosong. Pointercancel menghentikan drag pada 350px; move berikutnya ke x500 diabaikan. Collapse langsung expand selesai dengan size350, collapsed false, overflow kosong. |
| Layout persistence dan batas jendela | Source dan metode host 1.14.2 | Native callback requestSaveLayout/requestResize teramati; 6 save requests dan 5 resize requests pada probe lengkap. Tidak menguji persistence disk vault pengguna. |
| Kompatibilitas minimum manifest | Belum diperiksa | Tidak diklaim dari host versi terbaru saja |

## Ledger validasi otomatis

| Check | Hasil | Batas bukti |
| --- | --- | --- |
| Lint artefak planning | Pass; explicit lint setelah update ledger | Tidak membuktikan behavior; 30 link README telah diperbaiki dan target diverifikasi |
| Settings/model/controller/feature tests | Pass; termasuk default/migrasi, drag, visibility, clamp, stale callback, activation/mobile, final pointerup, pair replacement, tolerance | Node environment, bukan renderer native |
| Browser fixture | Pass: 17 checks, `node scripts/sidebar-resize-regression.cjs` | Adapter/controller produksi dengan host palsu, real DOM/observers/Electron; bukan full host Obsidian |
| `pnpm run check` | Pass pada Node 24.21.0 / pnpm 11.21.0 | TypeScript, Biome, Obsidian ESLint, SCSS, Markdown |
| `pnpm run check:ci` | Pass: 29 files / 191 tests, QA, build, artifacts 1.1.0, VitePress build | Acceptance native terpisah; bukan deployment |

## Matrix acceptance native

Maintainer melaporkan "oke sudah berhasil" pada 2026-09-27 dan meminta evaluasi
performa/kerapian. Ini menerima perilaku yang telah dicobanya; bukan konfirmasi
setiap skenario H01–H08. Optimasi setelah laporan itu belum diuji ulang oleh
maintainer pada host. Tidak ada deployment dari agen pada evaluasi ini.

Catat versi Obsidian/installer, OS, tema, ukuran jendela, dan hasil aktual
ketika menjalankan skenario. Baris di bawah belum mempunyai bukti individual.

| ID | Skenario | Requirement | Status |
| --- | --- | --- | --- |
| H01 | Default off, toggle on dengan 320/380 menjadi 350, restart aktif | AC01, AC06 | Not tested |
| H02 | Drag kiri dan kanan terus-menerus; handle tidak terganggu | AC02, AC07 | Not tested |
| H03 | Resize satu sisi; buka sisi kedua; close/reopen pada kedua urutan | AC03–AC05 | Not tested |
| H04 | Collapse saat drag, animasi cancel, kedua sisi tertutup/dibuka bersamaan | AC03–AC05, AC09 | Not tested |
| H05 | Minimum/maksimum native, jendela sempit/resize, tema dan CSS konflik | AC07, AC08 | Not tested |
| H06 | Disable/re-enable toggle, General activation, unload/reload plugin | AC09 | Not tested |
| H07 | Markdown/selection/folding/readable width, popout dan mobile tidak berubah | AC10 | Not tested |
| H08 | Ganti layout workspace; lebar sisi tertutup dan persistence tetap benar | AC04, AC09 | Not tested |

## Keputusan dan progres

- 2026-09-27: spec disetujui melalui "Spec disetujui".
- 2026-09-27: plan dan ADR disetujui melalui "oke lanjutkan".
- 2026-09-27: task breakdown disetujui melalui "lanjutkan implementasi".
- Inspeksi bundle lokal Obsidian 1.14.2 menunjukkan setter `setSize` menulis
  logical size dan CSS width tanpa clamp. Handler drag menerapkan clamp.
  CLI awalnya belum aktif; setelah pengguna mengaktifkannya, probe native
  berhasil. Detail dan batas bukti tersedia di ledger adapter.
- Checkpoint T01–T02: model/controller tests gagal sebelum implementasi,
  kemudian lolos. Registry General dan settings lifecycle tersambung; label
  toggle diuji melalui feature harness, bukan duplikasi mock navigation.
- Checkpoint T03–T04: fixture browser lolos 17 checks setelah memperbaiki
  fixture konflik CSS agar memakai stylesheet seperti snippet. Review
  menemukan toleransi individual dapat menghasilkan selisih pasangan 0,8px;
  regression test mereproduksi lalu perbaikan memeriksa selisih antarsisi.
- Tidak ada dependency runtime baru, Node API runtime, prototype patch,
  perubahan command IDs/Markdown/CM6, atau persistent CSS override. Adapter
  dibatasi ke 1.14.2 yang dibuktikan; versi lain ditangguhkan dengan Notice.
- Observer/listener/frame cleanup dan guard generation direview. Pointermove
  di luar drag tidak memicu pembacaan geometri; retry dibatasi dua write rounds.
- Pada handover awal, H01–H08 belum diuji dan agen belum melakukan deployment.
  Maintainer kemudian melaporkan fitur berhasil; laporan itu dicatat di bagian
  matrix tanpa mengasumsikan seluruh skenario telah diuji satu per satu.

## Evaluasi performa dan kerapian — 2026-09-27

Scope diotorisasi melalui "tinggal evaluasi peforma dan kerapian kode" setelah
maintainer menyatakan fitur berhasil. Perilaku dan kontrak settings dipertahankan.

Temuan: jalur drag membaca snapshot geometri sekali di flush, lalu membaca
ulang sebelum setiap write di controller dan adapter. Saat kedua sisi tidak
sama, sisi sumber yang sudah benar juga ditulis ulang. Snapshot ini mencakup
dua getComputedStyle dan dua getBoundingClientRect, sehingga pembacaan ulang
sesudah write dapat memaksa layout tambahan.

Perbaikan: satu snapshot per flush, guard native ringan sebelum setiap write
(identity, connected, collapsed, animation), serta batas dari snapshot frame
yang sama. Native setter 1.14.2 hanya mengubah size/width, bukan batas ukuran.
Adapter mengembalikan hasil write, sehingga controller hanya menyimpan layout
setelah perubahan berhasil. Sisi yang sudah tepat tidak ditulis; koreksi kedua
sisi tetap berlaku bila selisih antarsisi melampaui toleransi. Akses feature pada
composition memakai satu helper agar cast/key tidak diulang.

Pengukuran memakai fixture adapter/controller produksi dengan real DOM dan
observers Electron, 60 perubahan ukuran dan 600 pointer events. Angka adalah
jumlah operasi, bukan frame time/FPS atau CPU dari vault pengguna.

| Operasi | Sebelum | Sesudah |
| --- | --- | --- |
| Pembacaan snapshot geometri, termasuk verifikasi hasil | 360 | 120 |
| Write ukuran melalui adapter | 120 | 60 |
| Pembacaan saat idle dengan 100 pointermove | 0 | 0 |

Regression test biaya burst gagal sebelum perbaikan, lalu lolos. Browser
fixture lolos 24 checks termasuk guard closed tanpa pengukuran ulang dan
50 start/stop cycles tanpa callback/event reference tertinggal. Guard stale
snapshot dan cleanup tetap menjadi tanggung jawab adapter, diuji dengan DOM
nyata; controller tests memakai kontrak host yang sama.

Gate lengkap setelah optimasi: `pnpm run check:ci` Pass, 29 test files /
193 tests, seluruh lint/typecheck, build plugin, artifacts 1.1.0, dan
VitePress build. Tidak ada commit atau deployment hasil optimasi dari agen.
