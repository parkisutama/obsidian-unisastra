# Audit kualitas dan keamanan Unisastra — pass terfokus, 16 November 2026

## Status dan ringkasan

**Pass terfokus selesai; ini bukan audit penuh enam fase.** Tidak ada kerentanan
keamanan yang terkonfirmasi. Satu bug kebenaran data terkonfirmasi dan direproduksi
(QH-01). Empat observasi kualitas lain tidak mengubah perilaku saat ini.
Hasil ini bukan pernyataan bahwa plugin bebas cacat.

| Metadata | Nilai |
| --- | --- |
| Repo | `obsidian-unisastra` |
| Commit sumber | `f2ae9af1705777edde86015dbf2c0f3ac4a16c39` |
| Versi package/manifest | `0.0.1` |
| Worktree sebelum audit | Bersih |
| Skill | `security-audit`, `ponytail-audit`, `security-and-hardening`, `code-review-and-quality` |
| Cakupan | Jalur input dan sink (`innerHTML`, `eval`, jaringan, filesystem), normalisasi settings, skrip deploy dan test vault, workflow CI/release, audit dependency |
| Kerentanan terkonfirmasi | 0 |
| Bug terkonfirmasi | 1 (QH-01) |
| Observasi kualitas | 4 (QH-02 sampai QH-05) |

Prioritas di bawah adalah urutan tindak lanjut, **bukan severity**.

## Daftar temuan

| ID | Prioritas | Temuan | Rekomendasi singkat |
| --- | --- | --- | --- |
| QH-01 | P1 | `applyStartupMigrations` menulis ke `DEFAULT_SETTINGS` global | Salin dalam setiap grup default sebelum digabung; tambah test regresi |
| QH-02 | P2 | Coverage 32,36% statements dan 35,66% branches; folding, outliner, dan operasi list mengubah teks catatan | Tambah test yang gagal saat logika itu rusak; naikkan ambang coverage |
| QH-03 | P3 | `src/components/outline-view.ts` 1486 baris dengan beberapa tugas | Pecah per tugas tanpa mengubah perilaku, setelah QH-02 |
| QH-04 | P3 | Override `minimatch` di `pnpm-workspace.yaml` tidak punya tanggal tinjau | Catat tanggal tinjau dan kondisi pencabutan |
| QH-05 | P3 | `scripts/lib/setup-test-vault.ts:22` menyusun JSON dengan template string | Pakai `JSON.stringify([pluginName])` |

## QH-01: default settings ikut berubah

**Sumber:** `src/capabilities/settings.ts`, fungsi `applyStartupMigrations`
(sekitar baris 697 sampai 705).

**Mekanisme:** `merged` dibuat dengan `{ ...DEFAULT_SETTINGS }`, salinan dangkal.
Bila `data.json` tidak memuat sebuah grup, misalnya `foldPersist`, `merged.foldPersist`
tetap objek yang sama dengan `DEFAULT_SETTINGS.foldPersist`. Baris
`merged.foldPersist.foldState = normalizeFoldState(...)` lalu menulis ke default global.
Penulisan berikutnya pada grup yang sama juga mengenai default.

**Bukti:** test sementara memanggil `applyStartupMigrations({ general: {} })`, mengisi
`foldPersist.foldState`, lalu membaca `DEFAULT_SETTINGS.foldPersist.foldState`.
Hasilnya `{ "n.md": { "b": true } }`, bukan `{}`. Hasil sama pada dua run: satu tanpa
sandbox, satu di dalam bubblewrap (lihat catatan eksekusi). Pada run bubblewrap, 305
test lama lulus dan hanya test baru itu gagal.

**Dampak yang dapat dinyatakan:** nilai satu pemuatan dapat bocor ke pemuatan atau
reset berikutnya dalam proses yang sama, termasuk fold state satu catatan terbaca
sebagai default untuk catatan lain. Ini bukan pelanggaran batas keamanan. Seberapa
sering jalur ini kena di Obsidian belum diverifikasi.

**Perbaikan terkecil:** buat objek baru untuk setiap grup default, misalnya
`structuredClone(DEFAULT_SETTINGS)`, lalu pertahankan merge per grup. Tambah test
regresi yang menyatakan `DEFAULT_SETTINGS` tidak berubah.

## QH-02 sampai QH-05

- **QH-02.** Coverage diukur 1800 dari 5572 baris. Angka agregat tidak menunjukkan
  file mana yang kosong; pengukuran per file masih harus dilakukan. Ambang saat ini di
  `vitest.config.ts` adalah 30/33/30/30.
- **QH-03.** `outline-view.ts` menggabungkan render entri, aksi item, dan navigasi.
  Memecahnya adalah refactor tanpa perubahan perilaku dan memerlukan keputusan maintainer.
- **QH-04.** Override `minimatch@>=7 <11.0.1` ke `11.0.8` mengacu ke GHSA-g3hv-75wg-m249
  (hanya dev). Tanpa tanggal tinjau, override bisa bertahan setelah tidak diperlukan.
- **QH-05.** Nilai berasal dari manifest repo sendiri, jadi risikonya hampir nol.

## Yang diperiksa dan bersih

- Tidak ada `eval`, `new Function`, `innerHTML`, `fetch`, atau akses jaringan di `src/`.
- CSS callout dibangun dari ID `^[a-z0-9_-]{1,64}$`, warna hex, dan ikon `lucide-*`
  yang diperiksa lewat `getIcon`. Injeksi CSS lewat `data.json` tertutup.
- Isi catatan di outline dirender lewat `MarkdownRenderer.render`.
- `normalizeFoldState` menolak kunci prototype dan nilai non-boolean.
- `scripts/lib/deploy-plugin.ts` menolak symlink, hardlink, dan target di luar
  `<vault>/<config>/plugins/<id>`. `readActiveVault` memakai `execFileSync` dengan
  argumen tetap.
- CI: action di-pin ke SHA, `permissions: contents read`, input PR lewat `env`,
  provenance attestation pada release, `allowBuilds` membatasi skrip install.
- `pnpm audit --audit-level high`: tidak ada advisory yang diketahui.
- `pnpm run typecheck` dan `biome check`: bersih. 305 test lulus.

## Batas validasi dan catatan eksekusi

- **Sandbox.** Run pertama (typecheck, lint, test dengan coverage, probe, `pnpm audit`)
  berjalan langsung di host tanpa bubblewrap. `pnpm run` saat itu juga memasang
  dependency ke `node_modules` dan `pnpm audit` memakai jaringan. Ini menyimpang dari
  kebijakan eksekusi `security-audit`. Konfirmasi QH-01 dan satu run test penuh
  diulang di dalam bubblewrap: semua namespace dipisah (termasuk jaringan), capability
  dibuang, environment dikosongkan, source dan toolchain read-only, scratch di tmpfs.
  Angka coverage dan hasil `pnpm audit` belum diulang di sandbox.
- Tidak ada pengujian runtime di Obsidian desktop, mobile, atau popout.
- Hanya dibaca per baris: `settings.ts`, `callouts/*`, `fold-persist/settings.ts`,
  `scripts/lib/*`, workflow CI/release. `list-service.ts`, `keyboard-ops.ts`,
  `toolbar/controller.ts`, dan `outline-view.ts` hanya dipindai lewat pencarian pola.
- Belum diperiksa: pertumbuhan `foldState` per path saat catatan di-rename atau dihapus;
  `docs/` dan `conformance/`.
- Proteksi branch `main` dan secret `RELEASE_TOKEN` berada di pengaturan GitHub dan
  tidak dapat diverifikasi dari repo.

## Tindak lanjut

[Rencana QH-01 sampai QH-05 dan jalur release](../../specs/quality-hardening/plan.md).
Laporan ini tetap snapshot sebelum perbaikan.
