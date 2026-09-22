# PLAN: License & attribution audit

## Pendekatan

Generalisasi pola Floaty Toolbar (header sumber + file lisensi + build
banner terverifikasi) ke `writing-focus.ts` (MPL-2.0) dan `mononote.ts`
(MIT), lalu tambahkan catatan "inspired by" ringan ke enam file lain yang
terbukti bukan adaptasi kode. Tidak ada perubahan behavior; semua perubahan
komentar, file teks baru, dan dokumentasi.

## Modul yang terdampak

| Area | File | Perubahan |
| --- | --- | --- |
| Root license | `LICENSE` | Tambah EXCEPTION clause untuk MPL-2.0 |
| License texts | `licenses/writing-focus-MPL2.0.txt` (baru), `licenses/mononote-MIT.txt` (baru) | Teks lisensi lengkap upstream |
| Source headers | `src/capabilities/commands/writing-focus/writing-focus.ts`, `index.ts` | Upgrade header ke pola penuh (MPL) |
| Source headers | `src/capabilities/features/general/mononote.ts` | Upgrade header ke pola penuh (MIT) |
| Source headers (ringan) | `hemingway-mode.ts`, `src/cm6/show-whitespace.ts`, `show-whitespace/show-whitespace.ts` (cek nama file pasti), `typewriter-offset-calculator.ts`, `typewriter-scroll.ts`, `outliner-focus.ts`, `outliner-unfocus.ts`, `click-on-bullet.ts` | Tambah 1-2 baris "inspired by", bukan "adapted from" |
| Build tooling | `scripts/lib/license-banner.ts` | Generalisasi fungsi banner (parametrize per-notice) atau tambah fungsi baru untuk writing-focus + mononote |
| Build tooling | `scripts/lib/build.ts` | Panggil banner baru, salin `licenses/writing-focus-MPL2.0.txt` dan `licenses/mononote-MIT.txt` ke `dist/licenses/` |
| Build tooling | `scripts/lib/artifact-verification.ts` | Verifikasi banner baru ada di `dist/main.js` dan file lisensi tersalin ke `dist/licenses/` |
| Docs | `README.md` | Tambah 1 kalimat catatan MPL-2.0 di baris Writing Focus (Acknowledgements yang sudah ada) |
| Docs baru | `docs/reference/plugin-attribution-audit.md` | Tabel status akhir semua 10 plugin, menggantikan file scratchpad sesi lain |

## Pendekatan teknis per bagian

### 1. `license-banner.ts` generalization

Fungsi `floatyToolbarLicenseBanner` saat ini hardcode nama "Floaty Toolbar".
Opsi yang dipilih: tambah fungsi generik
`buildLicenseBanner(pluginName, repoUrl, copyrightLine, notice)` yang dipakai
ulang oleh Floaty Toolbar (refactor non-breaking, banner text tetap identik
byte-for-byte agar tidak melanggar acceptance "tidak ada regresi") dan dua
pemanggilan baru untuk writing-focus (MPL) dan mononote (MIT). Alasan: hindari
tiga fungsi nyaris duplikat; ikuti prinsip "tidak menambah abstraksi di luar
kebutuhan" — refactor ini dijustifikasi karena pola dipakai 3x setelah
perubahan ini.

### 2. Header source code

Format mengikuti `reorder.ts` persis:

```text
// [Ringkasan satu baris: apa yang diadaptasi, dari siapa, lisensi apa.]
// https://github.com/<author>/<repo>, <path file upstream>.
// Revision <commit hash lengkap yang dipin>.
// Copyright (c) <year> <author>. Full notice: licenses/<file>.txt.
//
// Differences from upstream, deliberate:
// - [daftar setiap perbedaan signifikan]
```

Commit hash yang dipin (diverifikasi via GitHub API commit history per file):

- `writing-focus.ts` ← `ryanpcmcquen/obsidian-focus-mode` `main.ts` @
  `cd68eda3c035e0340ff7da730e1f2a5acd3465e4`
- `mononote.ts` ← `czottmann/obsidian-mononote` `src/main.ts` @
  `0e3ebc79f7a9c9ba70c07c22444c5bb70a73956e`

### 3. Header "inspired by" ringan

Format singkat, tanpa commit pin (karena bukan kutipan kode, tidak ada yang
perlu dilacak drift-nya):

```text
// Concept inspired by [Plugin Name] (https://github.com/author/repo).
// No code ported; implementation and architecture here are original.
```

### 4. `LICENSE` EXCEPTION clause

Tambahkan di akhir file MIT yang sudah ada (jangan hapus copyright existing
Davis Riedel + Parkis Utama):

```text
EXCEPTION:

Files in src/capabilities/commands/writing-focus/ include code adapted from
Obsidian Focus Mode (https://github.com/ryanpcmcquen/obsidian-focus-mode),
which is licensed under the Mozilla Public License 2.0.

Those files are subject to the terms of the Mozilla Public License Version 2.0.
See licenses/writing-focus-MPL2.0.txt for full license text.

Copyright (c) 2024-2026 ryanpcmcquen.
```

`mononote.ts` tidak perlu EXCEPTION clause (MIT ke MIT, tidak ada konflik
lisensi) — cukup file lisensi terpisah untuk kelengkapan atribusi, sama
seperti pola Floaty Toolbar yang juga MIT tapi tetap dapat file lisensi
sendiri karena genuine code reuse.

### 5. `docs/reference/plugin-attribution-audit.md`

Tabel final per plugin: nama, author, license, tipe (adapted/inspired/
original), lokasi file, status atribusi (source header/license file/build
banner/README). Sumber data: hasil verifikasi di percakapan ini, bukan file
scratchpad. Tautkan dari `AGENTS.md` "Read first" TIDAK perlu (dokumen ini
referensi, bukan kontrak wajib baca); cukup ditautkan dari README jika ada
bagian "further reading", atau berdiri sendiri di `docs/reference/`.

## Alternatif yang dipertimbangkan dan ditolak

- **Rewrite writing-focus.ts agar full MIT** — ditolak pengguna secara
  eksplisit; dual-license dipilih.
- **AUTHORS.md terpisah** — README Acknowledgements sudah cukup dan sudah
  jadi kebiasaan repo ini; menambah file kedua berisiko drift antara dua
  sumber kebenaran.
- **Header "adapted from" penuh untuk 6 file inspirasi** — ditolak karena
  tidak akurat secara faktual (tidak ada kode yang dikutip); melebih-lebihkan
  atribusi sama bermasalahnya dengan kurang atribusi.

## Risiko regresi

- Build tooling (`build.ts`, `artifact-verification.ts`) disentuh — risiko:
  banner Floaty Toolbar yang sudah ada rusak saat generalisasi. Mitigasi:
  jalankan `pnpm run build` + `pnpm run verify:artifacts` setelah setiap
  perubahan tooling, bandingkan banner Floaty Toolbar byte-for-byte sebelum/
  sesudah refactor.
- `lint:md` bisa gagal pada dokumen baru (riwayat: audit report lama pernah
  gagal `lint:md`). Mitigasi: jalankan `pnpm run fix:md` sebelum commit akhir.

## QA yang diperlukan

- `pnpm run check` setelah setiap slice.
- `pnpm run build && pnpm run verify:artifacts` setelah perubahan tooling
  (slice MPL dan slice mononote).
- Review manual `dist/main.js` untuk memastikan kedua banner baru muncul dan
  banner Floaty Toolbar lama tidak berubah.
- Tidak perlu QA runtime Obsidian (desktop/mobile/popout) — tidak ada
  perubahan behavior.
