# Set up local development

Dokumen ini untuk developer yang ingin menjalankan Unisastra secara lokal.

## Prerequisites

1. Install Node.js v24.x (lihat `.node-version`).
2. Enable pnpm melalui Corepack:

   ```bash
   corepack enable
   ```

3. Clone repository.
4. Install dependencies:

   ```bash
   pnpm install
   ```

## Development loop

Instalasi mengaktifkan hook Husky. Baca
[AI Assisted Development](../for-developers/ai-assisted-development.md) untuk urutan konteks,
Conventional Commits, dan batas validasi otomatis.

Gunakan perintah ini saat mengembangkan plugin:

```bash
pnpm run dev
```

Perintah ini build plugin, menyiapkan `test-vault`, dan mencoba deploy ke vault
Obsidian lokal jika konfigurasi deploy tersedia.
Jika `OBSIDIAN_VAULT_PLUGIN_PATH` di `.env` dipakai, arahkan ke folder
`.obsidian/plugins/unisastra`. Script deploy menolak folder dengan nama lain
sebelum menulis artefak.

## Build tanpa deploy

```bash
pnpm run build
```

Artefak build dibuat di `dist/`:

- `dist/main.js`
- `dist/manifest.json`
- `dist/styles.css`

## Debug build

```bash
pnpm run debug
```

Gunakan ini saat perlu mempertahankan `console.debug` untuk investigasi lokal.
Build normal menghapus debug statements.

## QA lokal

Jalankan gate penuh sebelum merge atau release:

```bash
pnpm run check:ci
```

Untuk memperbaiki format yang bisa diautofix:

```bash
pnpm run fix
```

## Documentation site

Jalankan VitePress secara lokal:

```bash
pnpm run docs:dev
```

Build site sebelum mengubah workflow GitHub Pages:

```bash
pnpm run docs:build
```

GitHub Pages memakai output dari `docs/.vitepress/dist`, tetapi folder build
itu tidak perlu di-commit.

## Next steps

- Mulai pekerjaan baru: [Start a feature or bugfix](../for-developers/start-a-feature-or-bugfix.md)
- Jalankan QA: [Run QA before merge or release](../for-developers/run-qa-before-merge-or-release.md)
