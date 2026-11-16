# Release plan: active document warning cleanup

## Target

Rilis patch untuk membersihkan warning Obsidian popout-window compatibility dan warning konfigurasi pnpm sebelum release berikutnya.

Versi yang disarankan: `1.0.1`.

## Perubahan yang masuk

- Writing Focus memakai `window.activeDocument` untuk body dan query workspace split.
- Hemingway Mode memasang keyboard listener ke `window.activeDocument`.
- Current-line CM6 elements dibuat lewat `editorDom.ownerDocument`.
- Konfigurasi `onlyBuiltDependencies` dipindahkan dari `package.json` ke `pnpm-workspace.yaml`.
- Dokumentasi commit, push, dan release ditambahkan.

## Risiko

- Writing Focus perlu QA manual di main window dan popout window.
- Hemingway Mode perlu QA manual untuk key blocking setelah editor dipindah ke popout.
- Current-line highlight dan fade perlu dicek tetap muncul setelah file dibuka ulang.

## Gate sebelum merge

```bash
pnpm run check:ci
```

Manual QA minimum:

- aktifkan Writing Focus di main window,
- aktifkan Writing Focus di popout window,
- aktifkan Hemingway Mode dan pastikan key yang diblokir tetap diblokir,
- aktifkan Current Line Highlighting dan Fade Lines.

## Langkah release

1. Merge branch fix ke `main` setelah QA lulus.
2. Update `package.json.version` dari `1.0.0` ke `1.0.1`.
3. Tambahkan entry `## 1.0.1` di `CHANGELOG.md`.
4. Jalankan `pnpm run release`.
5. Push commit release dan tag:

```bash
git push origin main --follow-tags
```

6. Verifikasi GitHub release dan aset BRAT.
