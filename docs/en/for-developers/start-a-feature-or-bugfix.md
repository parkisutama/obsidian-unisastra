# Start a feature or bugfix

Dokumen ini menjelaskan cara memulai pekerjaan baru di repo ini tanpa langsung menyentuh branch utama.

## Kapan memakai guide ini

Pakai guide ini saat Anda ingin:

- menambah feature baru,
- memperbaiki bug,
- atau melakukan refactor yang berpotensi mengubah perilaku plugin.

## 1. Sinkronkan branch utama

```bash
git switch main
git pull --ff-only
```

## 2. Buat branch kerja

Feature:

```bash
git switch -c feature/<slug-singkat>
```

Bugfix:

```bash
git switch -c fix/<slug-singkat>
```

Contoh:

```bash
git switch -c feature/block-id-auto-generate
git switch -c fix/restore-cursor-selection-clamp
```

## 3. Tentukan ruang lingkup sebelum coding

Sebelum implementasi, tulis secara ringkas:

- masalah atau tujuan,
- file utama yang kemungkinan berubah,
- risiko regresi,
- dan cara QA nanti.

Jika perubahan cukup besar, simpan catatan ini di issue, PR description, atau dokumen kerja sementara.

## 4. Mulai mode pengembangan

```bash
pnpm run dev
```

Ini build plugin dan menyiapkan `test-vault` untuk pengujian manual.

## 5. Jaga perubahan tetap fokus

Dalam satu branch, usahakan hanya ada satu tema perubahan:

- satu feature,
- satu bugfix,
- atau satu refactor yang kohesif.

Jangan campur perubahan release metadata dengan pekerjaan fitur biasa.

## 6. Jalankan QA minimum sebelum commit

```bash
pnpm run check:ci
```

Lalu lakukan uji manual yang relevan di Obsidian.

## Hasil yang diharapkan

Sebelum branch siap direview, Anda seharusnya sudah punya:

- branch dengan nama jelas,
- perubahan yang fokus,
- check lokal yang lolos,
- dan catatan QA yang cukup untuk mempermudah review.
