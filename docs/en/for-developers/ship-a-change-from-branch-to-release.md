# Ship a change from branch to GitHub release

Tutorial ini menunjukkan satu alur lengkap: mulai dari branch kerja, implementasi, QA, sampai plugin dipublikasikan sebagai GitHub release yang bisa dipakai lewat BRAT.

## Hasil akhir

Di akhir tutorial ini Anda akan:

- punya branch kerja yang terpisah,
- punya perubahan yang lolos QA lokal,
- merge ke branch utama,
- membuat tag release yang valid,
- dan menghasilkan GitHub release lewat CI.

## Prasyarat

- `pnpm` sudah terpasang.
- Dependensi repo sudah ter-install.
- Anda sudah berada di root repo `obsidian-unisastra`.

## 1. Buat branch kerja

Untuk feature:

```bash
git switch -c feature/outliner-keyboard-shortcuts
```

Untuk bugfix:

```bash
git switch -c fix/typewriter-scroll-jump
```

Nama branch tidak dipakai langsung oleh CI, tetapi nama yang jelas membuat riwayat kerja lebih mudah ditinjau.

## 2. Jalankan mode pengembangan

```bash
pnpm run dev
```

Gunakan `test-vault/` untuk mencoba perilaku plugin di Obsidian sambil mengembangkan perubahan.

## 3. Implementasikan perubahan

Selama implementasi:

- update TypeScript dan SCSS yang relevan,
- cek ulang `manifest.json` hanya jika metadata plugin memang berubah,
- dan hindari mengubah versi rilis selama pekerjaan belum siap dirilis.

## 4. Jalankan QA lokal

Sebelum membuka PR atau merge:

```bash
pnpm run check:ci
```

Lalu lakukan QA manual di Obsidian:

- aktifkan plugin di `test-vault`,
- uji skenario normal,
- uji skenario edge case,
- dan pastikan tidak ada regresi pada feature utama seperti typewriter, whitespace, outliner, dan writing focus.

## 5. Commit perubahan

```bash
git add .
git commit -m "feat(outliner): add keyboard shortcuts"
```

Gunakan pesan commit yang mendeskripsikan perubahan, bukan aktivitas.

## 6. Merge ke branch utama

Setelah review selesai dan QA memadai:

```bash
git switch main
git merge --ff-only feature/outliner-keyboard-shortcuts
```

Jika merge membutuhkan commit merge biasa, itu tetap boleh, tetapi `--ff-only` membantu menjaga riwayat lebih lurus bila branch belum divergen.

## 7. Siapkan release

Sebelum release:

- update `CHANGELOG.md`,
- update `package.json.version`,
- update `package.json.obsidianMinAppVersion` bila memang perlu,
- dan pastikan perubahan tersebut memang siap dipublikasikan.

Lalu jalankan:

```bash
pnpm run release
```

Script ini akan:

- memvalidasi versi rilis harus format `x.y.z`,
- menyamakan `manifest.json` dengan metadata di `package.json`,
- memperbarui `versions.json`,
- memvalidasi metadata release,
- membuat commit release,
- dan membuat git tag dengan nama versi yang sama.

## 8. Push commit dan tag

```bash
git push origin main --follow-tags
```

Push tag ini akan memicu GitHub Actions release workflow.

## 9. Tunggu GitHub Actions membuat release

Workflow release akan:

- menjalankan check CI,
- memvalidasi bahwa tag sama dengan versi di `package.json` dan `manifest.json`,
- build artefak plugin,
- dan membuat GitHub release dengan aset:
  - `main.js`
  - `manifest.json`
  - `styles.css`
  - zip bundle plugin

## 10. Verifikasi hasil release

Di GitHub Releases, cek bahwa:

- nama tag adalah versi `x.y.z`,
- aset release terunggah lengkap,
- changelog atau release notes sesuai,
- dan BRAT dapat menarik release tersebut.

## Ringkasan

Alur dasarnya adalah:

1. buat branch,
2. implementasi,
3. QA lokal,
4. merge,
5. jalankan release script,
6. push tag,
7. biarkan GitHub Actions membuat release.

Untuk detail keputusan di balik workflow ini, lanjutkan ke [SDLC for this plugin](./sdlc-for-this-plugin.md).
