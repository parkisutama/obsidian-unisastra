# Create a GitHub release for BRAT and Obsidian

Dokumen ini menjelaskan cara merilis plugin sehingga aset GitHub release dapat dipakai oleh BRAT, dan tetap mengikuti format rilis yang aman untuk Obsidian.

## Aturan versi

Repo ini memakai aturan berikut:

- versi release harus format `x.y.z`,
- nama git tag harus sama persis dengan versi itu,
- `package.json.version` dan `manifest.json.version` harus sama,
- dan `versions.json` harus memetakan versi tersebut ke `minAppVersion` yang aktif.

Contoh valid:

- `1.0.0`
- `1.2.3`

Contoh tidak valid:

- `v1.0.0`
- `1.0`
- `1.0.0-beta.1`

## 1. Siapkan metadata release

Edit:

- `package.json`
- `CHANGELOG.md`

Pastikan:

- `version` dinaikkan,
- `obsidianMinAppVersion` benar,
- changelog memiliki heading versi yang sama.

## 2. Jalankan release script

```bash
pnpm run release
```

Script ini akan:

- mengubah `manifest.json`,
- memperbarui `versions.json`,
- memvalidasi metadata release,
- menjalankan `pnpm run verify`,
- membuat commit release,
- dan membuat tag git.

## 3. Push ke GitHub

```bash
git push origin main --follow-tags
```

## 4. Biarkan CI membuat GitHub release

Workflow release akan otomatis:

- memvalidasi tag release,
- menjalankan check CI read-only,
- build plugin ulang,
- memverifikasi artefak ulang,
- dan membuat GitHub release.

## 5. Verifikasi aset release

Aset minimum yang harus ada:

- `main.js`
- `manifest.json`
- `styles.css`

Repo ini juga mengunggah zip plugin untuk kemudahan distribusi manual.

`pnpm run verify:artifacts` (bagian dari `verify` dan workflow release) juga
menolak build bila notice MIT Floaty Toolbar hilang atau tidak sinkron:
`dist/main.js` harus memuat banner notice penuh (`licenses/floaty-
toolbar-MIT.txt`, tertanam lewat opsi `banner` esbuild sehingga tetap ada
meski build diminifikasi), dan `dist/licenses/floaty-toolbar-MIT.txt` harus
identik dengan sumbernya. `unisastra.zip` otomatis ikut membawa
`dist/licenses/` karena workflow menyalin seluruh isi `dist/` secara
recursive — tidak perlu langkah manual tambahan.

## 6. Verifikasi kompatibilitas BRAT

Untuk BRAT, yang penting adalah:

- repo GitHub bisa diakses,
- release tersedia,
- aset plugin terunggah,
- dan metadata manifest valid.

Jika BRAT gagal mengambil plugin, cek dulu apakah tag dan `manifest.json.version` benar-benar sama.

## Checklist release final

- `package.json.version` dan heading `CHANGELOG.md` sudah dinaikkan.
- `pnpm run release` lolos sampai commit dan tag lokal dibuat.
- `git push origin main --follow-tags` sudah dijalankan.
- GitHub Actions `Release Obsidian plugin` selesai hijau.
- GitHub release berisi `unisastra.zip`, `dist/main.js`,
  `dist/manifest.json`, dan `dist/styles.css`.
