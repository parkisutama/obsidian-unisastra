# ADR-004: fold persistence dan asal efek native

- Date: 2026-09-27.
- Status: Accepted untuk keputusan asal efek melalui jawaban maintainer
  "Izinkan auto-ID pada fold native apa pun".
- Contract: [spec](../../../specs/block-id-fold-persistence/spec.md).

## Context

Probe editor native Obsidian 1.14.2 dengan list sintetis menunjukkan foldMore dan
foldLess memakai foldEffect/unfoldEffect yang diekspor host CM6, dengan range
native dan annotation timestamp saja. Efek tersebut tidak membedakan aksi
pengguna dari pemanggilan oleh plugin lain. Parser harus diinisialisasi melalui
editMode.set; editor.setValue pada fixture belum terinisialisasi bukan bukti fold.

## Decision

Auto-generation tetap opt-in dan dapat merespons efek fold native dari pengguna
atau plugin lain. Transaksi restore MD Writer diberi annotation internal dan
dikecualikan, begitu juga undo/redo. Ini menggantikan pembatasan asal user fold
pada spec/plan awal; bukan izin bulk auto-ID atau write saat opsi dimatikan.
Guard file/editor/platform/frontmatter/Hemingway tetap berlaku. Revalidate
revision sebelum insertion dan gunakan transaction yang dapat di-undo.

Capture/restore menggunakan API CM6 publik yang di-externalize build, bukan nama
minified native. File diambil dari editorInfoField dan diverifikasi sebagai editor
Markdown utama. Snapshot per-file memakai schema existing; tidak ada perubahan
ID command atau format Markdown. Persistence di composition diserialisasi agar
save fold dan save settings tidak saling menimpa; save fold tidak refresh editor.

## Consequences

Plugin lain yang mengirim foldEffect dapat memicu insertion ID ketika opsi ini
aktif. Batas tersebut harus dinyatakan pada setting/user docs. Native version
dan platform acceptance tetap dicatat terpisah; tidak mengklaim semua versi
kompatibel hanya dari satu probe. Hider/restore tidak pernah menulis Markdown.
