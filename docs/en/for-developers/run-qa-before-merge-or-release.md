# Run QA before merge or release

> **Release steps changed on 2026-10-09.** Releases now come from a Release PR; the
> `pnpm run release`, `pnpm run ci`, and `validate:release-tag` commands no longer exist.
> Where this page mentions them, follow [CONTRIBUTING.md](../../../CONTRIBUTING.md) instead.

Dokumen ini adalah prosedur QA praktis sebelum perubahan di-merge atau dirilis.

## QA otomatis

Jalankan:

```bash
pnpm run verify
```

Perintah ini mencakup:

- typecheck,
- lint TypeScript read-only,
- lint SCSS read-only,
- lint Markdown read-only,
- test otomatis,
- build,
- verifikasi artefak `dist`,
- dan build dokumentasi VitePress.

Jika perintah ini gagal, jangan lanjut ke merge atau release.

Untuk memperbaiki formatting dan lint yang bisa diautofix secara lokal,
jalankan:

```bash
pnpm run fix
```

CI tidak menjalankan autofix dan tidak boleh memodifikasi source file.

## QA manual minimum

Lakukan pengujian di Obsidian menggunakan `test-vault`.

## Checklist feature utama

Uji area yang relevan dengan perubahan Anda:

- typewriter scroll,
- keep lines above and below,
- dimming,
- current line highlight,
- show whitespace,
- outliner focus,
- writing focus,
- restore cursor position,
- block ID atau fold persistence jika perubahan menyentuh area itu.

## Checklist Floaty Toolbar dan Callouts

Runtime Obsidian untuk area ini belum diverifikasi di environment
pengembangan manapun sejauh ini (lihat
[current state](../current-state.md#floaty-toolbar-acceptance-criteria-status)
untuk status AC per area, dan
[tasks.md](../specs/floaty-toolbar/tasks.md#runtime-acceptance-ledger) untuk
skenario detail). Sebelum menandai perubahan di area ini selesai secara
runtime, uji minimal:

- toolbar floating muncul dekat seleksi di Source/Live Preview desktop; tidak
  terpasang di mobile,
- setiap tombol/dropdown (bold/italic/strikethrough/code/highlight/link/
  heading/callout) menghasilkan hasil yang benar dan undo dalam satu langkah,
- command palette menampilkan 16 command `floaty-*` plus `manage-callouts`;
  command `floaty-*` tidak muncul di mobile,
- long-press item toolbar (~0.5 detik) memulai drag; melepas di atas item
  lain menukar posisi dan tersimpan; Escape membatalkan tanpa error console,
- reorder dari tab Toolbar Settings (panah atas/bawah) tercermin di toolbar,
- tab Callouts: header preview compact menampilkan ikon/warna/label asli;
  expand/collapse tidak mengulang form atau kehilangan draft,
- menyisipkan/mengubah callout selalu memakai marker uppercase; label
  kompatibilitas GitHub hanya terlihat di tab Callouts, bukan di toolbar,
- dock/pin, HUD timer, dan popout window tetap berperilaku seperti checkpoint
  sebelumnya (tidak regresi dari perubahan reorder/command).

## Checklist regresi umum

- plugin berhasil load tanpa error notice yang tidak diharapkan,
- settings tab tetap bisa dibuka,
- command palette masih menampilkan command plugin,
- perubahan SCSS tidak merusak layout editor,
- perubahan command tidak menyebabkan konflik perilaku dasar editor,
- dan perilaku mobile/desktop tetap konsisten dengan `isDesktopOnly`.

## QA khusus sebelum release

Tambahan sebelum release:

- `package.json.version` sudah benar,
- `CHANGELOG.md` sudah punya entri versi tersebut,
- `manifest.json` dan `versions.json` sudah sinkron,
- `pnpm run validate:release-tag -- <versi>` lolos bila ingin dites manual,
- `pnpm run build` berhasil,
- dan `pnpm run verify:artifacts` memastikan artefak build lengkap.

Contoh:

```bash
pnpm run validate:release-tag -- 1.0.0
pnpm run verify
```

`pnpm run release` juga menjalankan gate release lokal setelah memperbarui
`manifest.json` dan `versions.json`, sebelum commit dan tag dibuat.

## Troubleshooting local vault deploy

`pnpm run dev` melakukan build, menyiapkan `test-vault`, lalu mencoba deploy ke
vault Obsidian lokal jika workflow deploy dikonfigurasi.

Jika vault lokal tidak menerima build terbaru:

- jalankan `pnpm run build` lalu `pnpm run verify:artifacts` untuk memastikan
  `dist/main.js`, `dist/manifest.json`, dan `dist/styles.css` valid,
- jalankan `pnpm run dev` ulang untuk menyalin artefak ke `test-vault`,
- cek `test-vault/.obsidian/plugins/unisastra` berisi tiga artefak tersebut,
- pastikan community plugin `unisastra` aktif di
  `test-vault/.obsidian/community-plugins.json`,
- jika memakai deploy tambahan di luar `test-vault`, jalankan `pnpm run deploy`
  dan ikuti error path yang ditampilkan script.

## Kapan QA dianggap cukup

QA dianggap cukup jika:

- check otomatis lolos,
- skenario yang disentuh perubahan sudah diuji manual,
- dan tidak ada blocker yang diketahui untuk pengguna akhir.
