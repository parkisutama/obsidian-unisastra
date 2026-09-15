# Install MD Writer

Dokumen ini untuk pengguna plugin yang ingin memasang MD Writer di Obsidian.

## Install dari GitHub release

1. Buka release terbaru di repository GitHub MD Writer.
2. Download `md-writer.zip`.
3. Extract folder plugin ke vault:

   ```text
   <vault>/.obsidian/plugins/md-writer/
   ```

4. Pastikan folder tersebut berisi:
   - `main.js`
   - `manifest.json`
   - `styles.css`
5. Buka Obsidian.
6. Buka **Settings → Community plugins**.
7. Reload Obsidian jika plugin belum muncul.
8. Enable **MD Writer**.

## Install manual dari aset terpisah

Jika release tidak memakai zip, download tiga file ini dari GitHub release:

- `main.js`
- `manifest.json`
- `styles.css`

Buat folder berikut di vault:

```text
<vault>/.obsidian/plugins/md-writer/
```

Lalu salin ketiga file tersebut ke folder itu.

## Install untuk beta testing dengan BRAT

Jika Anda memakai BRAT:

1. Install plugin BRAT di Obsidian.
2. Tambahkan repository MD Writer sebagai beta plugin.
3. Pilih release/tag yang ingin diuji.
4. Enable **MD Writer** dari Community plugins.

## Setelah install

Lanjut ke [Use MD Writer features](./use-md-writer-features.md) untuk mulai
memakai fitur utama.
