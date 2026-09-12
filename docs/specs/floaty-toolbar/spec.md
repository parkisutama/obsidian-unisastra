# Spec: Floaty Toolbar untuk MD Writer

- Status: Accepted oleh maintainer pada 2026-09-12; siap untuk PLAN.
- Date: 2026-09-12.
- Branch: `codex/adopt-floaty-toolbar`.
- Reference: [Floaty Toolbar](https://github.com/0png/Floaty-Toolbar).

## Objective dan masalah pengguna

Pengguna MD Writer ingin memformat draft, menyisipkan callout yang sesuai vault,
dan memahami durasi sesi serta file tanpa meninggalkan konteks editor.
Permintaan maintainer menunjukkan kebutuhan akses toolbar yang tetap tersedia,
label waktu yang jelas, dan callout yang tidak terbatas pada daftar preset.
Belum ada riset pengguna tambahan; narasi ini berasal dari permintaan maintainer
dan positioning drafting presisi di README, bukan hasil observasi runtime.

Outcome: formatting dapat dilakukan dari toolbar dengan selection tetap benar;
timer dapat dipahami dan dikonfigurasi; callout pilihan pengguna dapat disisipkan
sebagai Markdown Obsidian; toolbar bisa tersedia tanpa tindakan pin.

## Bukti current state

- Source MD Writer belum menyediakan floating formatting toolbar, session/file
  timer, atau pengelola callout. Toolbar outline yang ada bukan fitur ini.
- Composition berada di `src/lib.ts`; settings memakai model dan startup
  migration di `src/capabilities/settings.ts`.
- `tests/settings.test.ts` menguji defaults, legacy migration, dan deep merge.
  Belum ada regression tests untuk fitur yang diusulkan.
- README upstream memuat selection toolbar, dock, timer, reorder, formatting
  toggle, clipboard URL detection, keyboard accessibility, dan preset callout.
- Source upstream ditinjau pada commit
  `b2113d06e1870851963053cd0bab0a0a971bb920`: `src/main.ts`, `src/hud.ts`,
  `src/toolbar-types.ts`, `src/utils.ts`, serta bagian dock `src/toolbar.ts`.
  LICENSE adalah MIT, copyright 2026 0png; notice wajib dipertahankan saat
  mengadaptasi substantial portions. Belum ada runtime test upstream.
- Gate otomatis yang tersedia: `check:ci`. Gate ini belum membuktikan runtime
  toolbar, mobile, popout, maupun compatibility dengan tema.

## Scope yang dikonfirmasi

1. Adopsi seluruh fitur Floaty Toolbar ke MD Writer, tanpa Pomodoro, dengan
   modifikasi timer, callout manager, dan dock yang dijelaskan di bawah.
2. Session timer dan file timer dapat dikonfigurasi dan memiliki keterangan
   serta prefix agar mudah dibedakan.
3. Konfigurasi callout bawaan Obsidian, tema, dan tambahan pengguna terintegrasi
   dengan pilihan callout toolbar.
4. Setting dock bawah selalu tampil tanpa perlu memakai pin, khusus desktop.
   Tidak menambah toolbar mobile yang menduplikasi toolbar bawaan Obsidian.

Tidak ada Pomodoro, work/break countdown, notifikasi siklus, atau setting
Pomodoro. Tidak ada migrasi struktur repo, pergantian plugin ID, deployment,
commit, push, maupun release dalam tahap SPECIFY ini.

## Aturan atribusi dan lisensi

Aturan wajib dari maintainer, berlaku sebelum integrasi kode upstream:

- Setiap file yang memuat kode diambil atau diadaptasi dari Floaty Toolbar
  harus memiliki komentar atribusi yang menyebut **Floaty Toolbar**, penulis
  **0png**, URL repository asli, path source asal, commit referensi, serta
  keterangan bahwa kode telah diadaptasi untuk MD Writer.
- Bila hanya sebagian kode dalam file yang berasal dari upstream, tandai bagian
  tersebut melalui komentar dekat fungsi/blok yang diadaptasi agar batas asalnya
  dapat direview. Jangan mengklaim seluruh file sebagai karya upstream.
- Pertahankan copyright `Copyright (c) 2026 0png` dan teks notice MIT lengkap
  untuk copies atau substantial portions. Komentar kredit dan link README
  tidak menggantikan kewajiban menyertakan notice lisensi.
- PLAN menentukan penempatan notice pihak ketiga dan bagaimana notice itu ikut
  dalam source/distribusi plugin; verifikasi packaging sebelum release.
  Jangan menimpa atau menghapus atribusi penulis/plugin yang sudah ada.
- README utama harus menambahkan kredit di Acknowledgements: nama plugin,
  penulis dengan link profil, link repository, MIT License, dan ringkasan fitur
  yang diadopsi serta dimodifikasi. Kredit ditambahkan ketika kode diintegrasikan
  agar README tidak menyatakan adopsi yang belum diimplementasikan.
- Review sebelum staging harus memeriksa atribusi source, README, serta notice
  distribusi terhadap commit upstream yang dipakai. Update provenance bila
  mengambil kode tambahan dari revision atau penulis lain.

Contoh komentar atribusi; sesuaikan path dengan kode yang benar-benar diambil:

```ts
// Adapted for MD Writer from Floaty Toolbar by 0png (MIT).
// Source: https://github.com/0png/Floaty-Toolbar
// Original file: src/hud.ts
// Revision: b2113d06e1870851963053cd0bab0a0a971bb920
// Copyright (c) 2026 0png. See the bundled third-party MIT notice.
```

## Usulan behavior untuk divalidasi

### Toolbar dan formatting

- Feature dapat diaktifkan/dinonaktifkan lewat settings MD Writer.
- Dua pilihan visibility: saat ada selection dan selalu tampil di editor
  Markdown aktif sebagai dock bawah. Selalu tampil tidak membutuhkan state pin
  sebelumnya, tidak auto-hide saat mengetik atau pointer menjauh, dan berlaku
  khusus desktop. Source upstream dock justru memiliki auto-hide.
- Pertahankan floating selection toolbar dan toggle pin/dock sebagai parity;
  setting desktop selalu tampil menjadi pilihan langsung untuk dock persistent.
  Hubungan pin dengan setting persistent harus dijelaskan dalam PLAN.
- Parity dikonfirmasi: bold, italic, strikethrough, inline code, highlight, link,
  heading H1-H4/remove heading, callout, reorder, dan optional clipboard URL.
- Formatting bekerja pada selection editor asal meskipun tombol mengambil fokus.
  Upstream inline formatting, link, dan callout tidak melakukan apa pun tanpa
  selection; heading bekerja pada baris cursor head, termasuk tanpa selection.
  Jadikan aturan itu baseline parity; tombol yang memerlukan selection harus
  menjelaskan keadaan unavailable ketika dock tampil tanpa selection.
- Tidak menulis saat Reading Mode atau tidak ada target editor yang valid.
- Keyboard: Tab/Shift+Tab, Enter/Space, dan Escape. Pada mode persistent,
  Escape menutup menu/tooltip sementara dan tidak menyembunyikan dock.
- Clipboard dibaca hanya pada tindakan link yang diotorisasi pengguna;
  kegagalan clipboard tetap menyediakan input URL manual.

### Timer

#### Perilaku source upstream yang terverifikasi

- `src/hud.ts:59`: `sessionStart = Date.now()` saat instance HUD dibuat oleh
  `onload`. Tampilan memakai selisih `Date.now() - sessionStart`.
- `src/hud.ts:215-219`: event `file-open` membandingkan path dengan currentFile;
  path berbeda mengganti fileStart dengan waktu sekarang. File null mengosongkan
  waktu. Tidak membaca `TFile.stat.ctime`, `mtime`, atau frontmatter created.
- A -> B -> A mengulang file timer dari nol, bukan melanjutkan total waktu A.
  Event dengan path sama tidak reset; rename ditangani sebagai path baru bila
  ada event tersebut, bukan lewat riwayat identitas file.
- Tidak ada idle tracking, pause/background handling, atau penyimpanan timer
  ke `saveData`. Selisih wall clock termasuk idle/background; reload plugin
  membuat sesi baru. Interval 1 detik hanya memperbarui tampilan.
- Klik session di status bar atau mousedown di dock reset sesi. File timer tidak
  punya tombol reset manual. Format `mm:ss`, atau `h:mm:ss` setelah satu jam.
- Status bar dan dock memakai sessionStart/fileStart yang sama. Ketika dock
  mounted, item status bar disembunyikan dan nilai dirender di dock; undock
  menampilkan status bar lagi. Ini dua lokasi UI, bukan dua metode perhitungan.
- fileStart awal null; mount tidak mengambil file aktif yang sudah terbuka.
  Akibatnya file dapat menampilkan `--:--` sampai event file-open berikutnya.
  MD Writer harus initialize dari file aktif saat load, bukan menyalin gap ini.

#### Modifikasi MD Writer

- Session dan file timer memiliki toggle tampilan terpisah, prefix yang dapat
  diedit, serta penjelasan lingkup pengukuran di settings dan tooltip.
- Usulan prefix default: `Sesi:` dan `File:`; angka memakai format konsisten.
- Prefix kosong/invalid harus memiliki fallback yang jelas; batas input akan
  ditentukan di PLAN.
- Baseline adopsi tetap elapsed upstream: sesi sejak feature dimuat/reset dan
  file sejak path aktif dibuka/berganti. Tidak menambahkan active-writing tracker,
  pause, atau riwayat lintas restart tanpa keputusan scope terpisah.
- Tooltip sesi menjelaskan idle ikut dihitung dan klik reset; tooltip file
  menjelaskan waktu sejak file aktif dibuka, bukan usia file atau total menulis.
- Toggle terpisah mengatur tampilan, bukan mengubah definisi timer. Prefix dan
  toggle disimpan; timestamp sesi/file tetap runtime seperti upstream.
- Dock/status bar berbagi nilai yang sama; lokasi mengikuti mode toolbar.
  Lifecycle multiwindow dan file null/rename/delete dirinci dalam PLAN.
- UI dan docs harus menyebut definisi yang disetujui, tidak menyebut elapsed
  sebagai waktu aktif bila idle ikut dihitung.
- Timer tidak mengubah frontmatter atau isi note tanpa requirement terpisah.

### Callout

#### Sumber dan konfigurasi yang didukung

- [Obsidian callouts](https://obsidian.md/help/callouts) menyediakan tipe dan
  aliases; tipe case-insensitive, tipe tidak dikenal fallback ke note.
- Custom styling berasal dari tema, CSS snippets, atau community plugin lewat
  selector `.callout[data-callout="id"]`, `--callout-color`, dan
  `--callout-icon`. Obsidian tidak mendeskripsikan form built-in custom callout
  registry pada dokumentasi tersebut.
- [CSS snippets](https://obsidian.md/help/snippets) dikelola lewat Settings ->
  Appearance -> CSS snippets. File berada dalam folder snippets di konfigurasi
  vault, tidak selalu `.obsidian` bila pengguna mengganti configuration folder.
- [GitHub Alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)
  menggunakan lima marker NOTE, TIP, IMPORTANT, WARNING, CAUTION. Marker uppercase
  juga dapat dibaca Obsidian, tetapi GitHub tidak menyediakan title/folding/nesting
  seperti callout Obsidian. Styling important/caution Obsidian adalah aliases,
  sehingga tampilan lintas platform tidak dijanjikan identik.

#### Menu MD Writer yang diusulkan

- Menu khusus Callout manager di settings MD Writer, terhubung dari dropdown
  toolbar. Mengelola catalog existing dan custom dari satu tempat.
- Preset bawaan Obsidian beserta aliases dan preset GitHub Alerts disediakan;
  pilihan output Obsidian atau GitHub menentukan marker dan fitur yang tersedia.
- Untuk mode GitHub, gunakan uppercase lima tipe tersebut, tanpa custom title,
  folding marker, atau nested alerts; jangan mengonversi seluruh vault otomatis.
- Custom entry dapat memakai tampilan yang sudah disediakan tema/snippet, atau
  memiliki override warna/ikon yang dikelola MD Writer melalui form dan preview.
  Default existing entry mewarisi tampilan; override hanya bila pengguna memilihnya.
- Settings menyimpan konfigurasi plugin; cara menerapkan styling serta kebutuhan
  export CSS snippet akan dibandingkan di PLAN, tanpa mengedit CSS tema pengguna.
  Pengguna harus diberi tahu styling plugin tidak otomatis ikut ke GitHub/Publish.
- Pilihan toolbar menampilkan nama yang mudah dipahami dan callout ID yang
  digunakan pada Markdown, misalnya `Catatan (note)`.
- Pengguna bisa enable/disable dan mengurutkan pilihan; menambah, mengedit,
  dan menghapus entry custom, dengan ID dan nama tampilan.
- Built-in Obsidian menjadi sumber preset; entry tema memakai ID callout tema.
  UI membedakan entry yang mewarisi styling dengan custom override MD Writer.
- Markdown tetap menggunakan sintaks Obsidian, misalnya `> [!note]`.
- Validasi mencegah ID merusak sintaks Markdown dan duplikasi pilihan.
- Menghapus entry konfigurasi tidak mengubah callout yang sudah ada di note.
- Discovery callout tema/snippet akan dikaji untuk melengkapi catalog existing;
  manual ID/nama tetap tersedia. Jangan menjanjikan registry lengkap dari CSS
  dinamis atau API resmi yang belum diverifikasi.
- Upstream hanya memiliki lima tipe lowercase dan regex existing-callout `\w+`;
  header existing dibuang saat konversi selection. MD Writer harus mendukung ID
  custom bertanda hubung dan menjaga title/folding/nesting yang tidak diubah
  pengguna; aturan detail dirumuskan dalam PLAN dan regression tests.

## Acceptance criteria

| ID | Skenario dan hasil yang harus dibuktikan |
| --- | --- |
| AC-01 | Tidak ada UI, settings, command, atau runtime Pomodoro yang diadopsi. |
| AC-02 | Desktop dock bawah selalu terlihat tanpa selection/pin dan tidak auto-hide saat mengetik; mobile tidak mendapat dock tambahan; setting berlaku tanpa reload. |
| AC-03 | Formatting mengubah target yang benar dan mendukung undo tanpa merusak selection, folding, block ID, atau whitespace di luar target. |
| AC-04 | Session/file toggle serta prefix bertahan setelah settings dimuat ulang; tooltip menjelaskan definisi waktu yang disetujui. |
| AC-05 | Timer menghitung elapsed, bukan created/modified; reset sesi, pergantian path, load dengan file aktif, reload, dan nilai dock/status bar diuji. |
| AC-06 | Built-in, tema, dan entry custom yang diaktifkan tersedia di menu; entry invalid/duplikat ditolak dengan penjelasan. |
| AC-07 | Manager mengatur catalog dan custom warna/ikon; insert Obsidian/GitHub menghasilkan sintaks sesuai mode; menghapus konfigurasi tidak mengubah note lama. |
| AC-08 | Settings lama dimuat dengan defaults additive tanpa kehilangan command IDs atau konfigurasi lama. |
| AC-09 | Disable/unload membersihkan DOM, listener, dan timer; popout memakai document/window target. |
| AC-10 | Keyboard dan touch dapat memakai toolbar/menu; desktop/mobile/popout diuji di Obsidian dan hasil dicatat terpisah dari QA otomatis. |
| AC-11 | Kode upstream memiliki atribusi plugin/penulis/path/revision; README memuat kredit Floaty Toolbar dan 0png; copyright serta notice MIT lengkap disertakan dalam source/distribusi tanpa menghapus kredit existing. |

## Tech stack, structure, dan style

Tetap Node.js 24, pnpm 11.21.0, TypeScript, Obsidian API, CodeMirror 6,
SCSS, Vitest, dan VitePress. Tidak memilih dependency baru pada tahap ini.

Area integrasi yang akan dikaji di PLAN: `src/capabilities/features/`,
`src/capabilities/settings.ts`, `src/components/`, `src/cm6/`, `src/lib.ts`,
`src/styles/`, dan `tests/`. Ini peta area existing, bukan keputusan modul baru.
Runtime tidak memakai Node-only tooling; tooling tetap di `scripts/`.

Ikuti typed settings dan pola source existing, contohnya:

```ts
const settings = structuredClone(DEFAULT_SETTINGS);
setSettingByPath(settings, "typewriter.typewriterOffset", 0.42);
```

Plugin ID `md-writer`, command IDs lama, settings lama, frontmatter, Markdown
block IDs, dan CSS compatibility hooks dipertahankan. Kontrak settings/command
baru serta keputusan arsitektur dicatat dalam ADR sebelum implementation.

## Testing strategy dan commands

- Vitest: formatting/undo boundaries, timer dengan clock terkontrol, validasi
  callout, migration additive, dan lifecycle sesuai pendekatan PLAN.
- QA Obsidian: Source/Live Preview, selection kosong/multiline, outliner zoom,
  fold persistence, Hemingway mode, typewriter, writing focus, tema, touch,
  keyboard, beberapa leaf, mobile, dan popout.
- Konflik dengan Hemingway mode harus diputuskan sebelum coding; toolbar tidak
  boleh membuka jalur edit yang melanggar kontrak mode tersebut.

```bash
pnpm run test
pnpm run check
pnpm run check:ci
pnpm run docs:build
```

Tahap ini hanya memerlukan Markdown lint dan docs build. Test runtime belum
dibuat atau dijalankan sebagai bukti fitur karena implementasi belum dimulai.

## Boundaries dan fase berikutnya

- Always: preserve pekerjaan lokal, gunakan App eksplisit dan lifecycle cleanup,
  baca source/tests sebelum mengubah behavior, catat validation limits.
- Ask first: validasi spec ini sebelum PLAN, plan sebelum TASKS, tasks sebelum
  IMPLEMENT; perubahan scope produk dan dependency baru.
- Never: baca credentials, deploy implisit, ganti format vault diam-diam,
  salin kode upstream tanpa verifikasi lisensi, klaim runtime dari docs build.

Spec disetujui maintainer termasuk baseline timer elapsed dan seluruh toolbar
tambahan desktop-only; callout manager/settings tetap tersedia mobile.
PLAN menyelesaikan kajian upstream, ADR, pendekatan
integrasi, alternatif, risiko, dan QA. [Plan](./plan.md) dan
[ADR-002](../../reference/decisions/ADR-002-floaty-toolbar-and-callout-management.md)
Accepted oleh maintainer. [Tasks](./tasks.md) berstatus Draft, menunggu
validasi maintainer sebelum IMPLEMENT.

## Keputusan maintainer dan detail untuk PLAN

1. Disetujui menu callout: catalog Obsidian/tema/custom, form warna/ikon dengan
   inherit sebagai default, serta pilihan output preset GitHub Alerts.
2. Disetujui baseline timer elapsed upstream dengan toggle/prefix/keterangan,
   tanpa perluasan menjadi pelacakan waktu aktif atau riwayat per file.
3. Disetujui seluruh toolbar desktop-only untuk menghindari duplikasi mobile;
   manager/settings tetap tersedia mobile.
4. Default: usulan feature toolbar off pada upgrade existing settings agar workflow
   lama terjaga; saat enabled pengguna memilih floating atau persistent dock.
5. Atribusi source, README, dan notice MIT distribusi wajib menjadi bagian PLAN,
   TASKS, implementation, serta review acceptance AC-11.
