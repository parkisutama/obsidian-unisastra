# TASKS: License & attribution audit

Urutan wajib: T1 → T2 → T3 → T4 → T5 → T6. Checkpoint QA (`pnpm run check`)
setelah T2 dan setelah T3 (build tooling paling berisiko). T4-T6 independen
satu sama lain, boleh dikerjakan berurutan tanpa checkpoint di antaranya.

## T1 — License texts dan LICENSE root

**Acceptance**: `licenses/writing-focus-MPL2.0.txt` dan
`licenses/mononote-MIT.txt` berisi teks lengkap upstream (identik, bukan
parafrase). `LICENSE` root punya EXCEPTION clause MPL-2.0 yang akurat, tanpa
menghapus copyright existing.

**File**:

- `licenses/writing-focus-MPL2.0.txt` (baru) — dari
  `https://raw.githubusercontent.com/ryanpcmcquen/obsidian-focus-mode/master/LICENSE`
- `licenses/mononote-MIT.txt` (baru) — dari
  `https://raw.githubusercontent.com/czottmann/obsidian-mononote/main/LICENSE.md`
- `LICENSE` (edit)

**Test**: tidak ada test otomatis untuk teks lisensi; verifikasi manual diff
terhadap raw upstream.

**Dependency**: tidak ada.

---

## T2 — Header source code lengkap (writing-focus, mononote)

**Acceptance**: header di kedua file mengikuti pola `reorder.ts` persis
(lihat plan.md §2), commit hash yang benar, pointer ke file lisensi dari T1.

**File**:

- `src/capabilities/commands/writing-focus/writing-focus.ts` (edit header)
- `src/capabilities/commands/writing-focus/index.ts` (edit header, cek apakah
  perlu — sudah ada "ADAPTED FROM" versi lama, upgrade)
- `src/capabilities/features/general/mononote.ts` (edit header, upgrade dari
  versi lama)

**Test**: `pnpm run check` (Biome/ESLint tidak memvalidasi isi komentar,
tapi memastikan tidak ada syntax error).

**Dependency**: T1 (path file lisensi harus sudah ada untuk direferensikan).

---

## T3 — Build tooling: banner + verifikasi untuk MPL dan mononote

**Acceptance**: `dist/main.js` memuat 3 banner (Floaty Toolbar existing +
writing-focus MPL + mononote MIT), byte-for-byte sama untuk banner Floaty
Toolbar yang sudah ada (tidak regresi). `dist/licenses/` memuat 3 file teks.
`verify:artifacts` gagal jika salah satu banner/file hilang atau tidak
sinkron dengan source notice.

**File**:

- `scripts/lib/license-banner.ts` (edit — generalisasi fungsi, tambah 2
  pemanggilan baru)
- `scripts/lib/build.ts` (edit — copy 2 file lisensi baru ke
  `dist/licenses/`, tambah 2 banner ke esbuild `banner.js`)
- `scripts/lib/artifact-verification.ts` (edit — tambah verifikasi 2 banner
  - 2 file lisensi baru)

**Test**:

```bash
pnpm run build
pnpm run verify:artifacts
```

Manual: `grep -c "0png\|ryanpcmcquen\|Carlo Zottmann" dist/main.js` harus
menunjukkan ketiga notice hadir.

**Dependency**: T1, T2.

---

## T4 — Header "inspired by" ringan (6 file)

**Acceptance**: setiap file punya 1-2 baris komentar "Concept inspired by...
No code ported" (format di plan.md §3). Tidak ada klaim "adapted from".

**File** (path harus diverifikasi ulang saat eksekusi karena mungkin ada
lebih dari satu file per fitur):

- `src/capabilities/features/hemingway-mode/hemingway-mode.ts`
- `src/cm6/show-whitespace.ts`
- `src/capabilities/features/show-whitespace/show-whitespace.ts` (verifikasi
  nama file aktual sebelum edit)
- `src/cm6/typewriter-offset-calculator.ts`
- `src/capabilities/features/typewriter/typewriter-scroll.ts`
- `src/capabilities/commands/outliner-focus.ts`
- `src/capabilities/commands/outliner-unfocus.ts`
- `src/cm6/outliner/click-on-bullet.ts`

**Test**: `pnpm run check`.

**Dependency**: tidak bergantung T1-T3, bisa paralel tapi dikerjakan setelah
checkpoint T3 sesuai urutan di atas untuk menjaga review tetap linear.

---

## T5 — README.md catatan MPL-2.0

**Acceptance**: baris Writing Focus di section Acknowledgements yang sudah
ada (`README.md` baris ~86) ditambah catatan lisensi MPL-2.0, tanpa
menduplikasi atau membuat section baru.

**File**: `README.md` (edit satu baris/kalimat)

**Test**: `pnpm run lint:md`.

**Dependency**: T1 (untuk memastikan istilah lisensi konsisten dengan file
teks yang sudah dibuat).

---

## T6 — Dokumentasi referensi baru

**Acceptance**: `docs/reference/plugin-attribution-audit.md` berisi tabel
final 10 plugin (nama, author, license, tipe adapted/inspired/original,
lokasi file, status atribusi per layer) yang akurat terhadap hasil T1-T5.
Tidak menyalin isi file scratchpad basi.

**File**: `docs/reference/plugin-attribution-audit.md` (baru)

**Test**: `pnpm run lint:md`, `pnpm run docs:build`.

**Dependency**: T1-T5 (dokumen ini merangkum hasil akhir semua task
sebelumnya).

---

## Checkpoint akhir

Setelah T6: `pnpm run check:ci` penuh. Review diff keseluruhan terhadap
acceptance criteria di `spec.md` satu per satu sebelum commit.
