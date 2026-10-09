# Install Unisastra

Dokumen ini untuk pengguna plugin yang ingin memasang Unisastra di Obsidian.

## Install dari GitHub release

1. Buka release terbaru di repository GitHub Unisastra.
2. Download `unisastra.zip`.
3. Extract folder plugin ke vault:

   ```text
   <vault>/.obsidian/plugins/unisastra/
   ```

4. Pastikan folder tersebut berisi:
   - `main.js`
   - `manifest.json`
   - `styles.css`
5. Buka Obsidian.
6. Buka **Settings → Community plugins**.
7. Reload Obsidian jika plugin belum muncul.
8. Enable **Unisastra**.

## Install manual dari aset terpisah

Jika release tidak memakai zip, download tiga file ini dari GitHub release:

- `main.js`
- `manifest.json`
- `styles.css`

Buat folder berikut di vault:

```text
<vault>/.obsidian/plugins/unisastra/
```

Lalu salin ketiga file tersebut ke folder itu.

## Install untuk beta testing dengan BRAT

Jika Anda memakai BRAT:

1. Install plugin BRAT di Obsidian.
2. Tambahkan repository Unisastra sebagai beta plugin.
3. Pilih release/tag yang ingin diuji.
4. Enable **Unisastra** dari Community plugins.

## Setelah install

Lanjut ke [Use Unisastra features](./gunakan-fitur-unisastra.md) untuk mulai
memakai fitur utama.
