# Release gates

Dokumen ini mendefinisikan syarat minimum sebelum perubahan boleh dirilis.

## Gate 1: source tree siap

- branch release berasal dari `main` yang mutakhir,
- tidak ada perubahan lokal yang tidak disengaja,
- dan perubahan yang akan dirilis sudah selesai.

## Gate 2: QA otomatis lolos

```bash
pnpm run check:ci
```

Tidak boleh ada error dari:

- TypeScript,
- Biome,
- Stylelint,
- Markdown lint,
- Vitest,
- build,
- verifikasi artefak.

Gate ini read-only untuk lint. Gunakan `pnpm run fix` secara lokal jika butuh
autofix sebelum menjalankan ulang gate.

## Gate 3: QA manual selesai

- skenario utama yang terpengaruh sudah diuji di Obsidian,
- tidak ada regresi yang diketahui,
- dan hasil uji cukup untuk percaya diri melakukan release.

## Gate 4: metadata release sinkron

Harus benar:

- `package.json.version`
- `manifest.json.version`
- `package.json.obsidianMinAppVersion`
- `manifest.json.minAppVersion`
- `versions.json[version]`
- heading changelog untuk versi tersebut

## Gate 5: tag release valid

Tag release harus:

- format `x.y.z`,
- sama persis dengan versi di `package.json`,
- dan sama persis dengan versi di `manifest.json`.

## Gate 6: GitHub Actions release berhasil

Release dianggap selesai hanya jika workflow GitHub:

- memvalidasi metadata,
- build artefak,
- memverifikasi artefak,
- dan membuat GitHub release dengan aset yang lengkap.

## Artefak release yang diharapkan

- `dist/main.js`
- `dist/manifest.json`
- `dist/styles.css`
- zip bundle plugin

## Perintah referensi

```bash
pnpm run check:ci
pnpm run verify:artifacts
pnpm run release
git push origin main --follow-tags
```
