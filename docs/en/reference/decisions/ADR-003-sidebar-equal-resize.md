# ADR-003: Sinkronisasi lebar sidebar desktop

- Status: Accepted oleh maintainer pada 2026-09-27 melalui "oke lanjutkan".
- Tanggal: 2026-09-27.
- Decider: maintainer MD Writer.
- Requirement: [spec accepted](../../../specs/sidebar-equal-resize/spec.md).
- Approach: [plan](../../../specs/sidebar-equal-resize/plan.md).

## Context

Dua sidebar harus mengikuti resize langsung dan menghormati ukuran tersimpan
sisi tertutup. API lokal mengekspos state collapsed, tetapi bukan setter lebar
publik. CSS width saja tidak membuktikan persistence atau clamp native.
Plugin sudah memiliki FeatureToggle, General registry, settings migration,
dan lifecycle composition; struktur ini tetap dipakai.

## Decision

1. Tambah boolean `general.isSidebarEqualResizeEnabled`, default false, melalui
   default dan migrasi additive existing. Tidak simpan duplikat lebar layout.
2. Pisahkan model murni, controller, dan adapter native dalam fitur General.
   Controller menggunakan App eksplisit dan window utama; mobile/popout no-op.
3. Verifikasi kontrak internal resize sebelum integrasi. Adapter memakai runtime
   guards dan suspend jika unsupported; tidak mengklaim setter internal stabil.
4. Sumber drag ditentukan dari interaksi handle native, bukan observer ukuran.
   Observer hanya menjadwalkan pemeriksaan. Visibility dan animasi ditangani
   terpisah dari drag. Native pointer handlers tidak diganti.
5. Gunakan target bersama dalam irisan batas native yang terverifikasi,
   toleransi 0,5 CSS px, serta rekonsiliasi terbatas. Jika tidak feasible,
   native tetap mengendalikan ukuran dan sinkronisasi ditangguhkan.
6. Startup aktif memakai aturan aktivasi rata-rata. Pembukaan bersamaan tanpa
   urutan teramati memakai rata-rata; pembukaan berurutan memakai sisi terbaru.
7. Cleanup idempotent menghentikan semua callback; disable mempertahankan lebar
   terakhir. General activation/platform ikut dihormati tanpa refactor fitur lain.

## Alternatif dan trade-off

| Opsi | Manfaat | Kekurangan dan keputusan |
| --- | --- | --- |
| CSS menyamakan width | Sedikit kode | Tidak cukup untuk sumber drag, state tersimpan, dan batas native; ditolak. |
| Mirror semua ResizeObserver events | Implementasi sederhana | Animasi dan write sendiri dapat dianggap input; ditolak. |
| Patch handler native/prototype | Menangkap jalur resize internal | Cleanup dan konflik plugin lebih berisiko; tidak dipilih. |
| Adapter terjaga + controller event | Pemisahan state dan test jelas, akses internal terlokalisasi | Perlu pembuktian host dan maintenance versi; dipilih dengan gate. |

## Consequences

Tidak ada perubahan identifier lama, Markdown vault, CM6, manifest mobile,
command, atau dependency runtime. Perubahan settings additive membutuhkan
regression test untuk legacy dan nilai eksplisit. Resize internal dan DOM masih
berisiko berubah antarversi; dukungan minimum manifest tidak dianggap terbukti
tanpa pemeriksaan kompatibilitas.

Jika host tidak menyediakan kontrak yang diperlukan, integrasi terblokir;
test model saja tidak menjadikan fitur siap dirilis. Bila rentang kedua sidebar
tidak beririsan, kesamaan ukuran tidak dijanjikan dan batas native diprioritaskan.
Fallback ini disetujui maintainer bersama plan.

## Tindak lanjut

Koreksi bug 2026-09-27: maintainer melaporkan sidebar menghabiskan layar dan tidak
dapat dikembalikan. Layout menunjukkan kedua logical width 21.474.836,8 px,
panel tengah 0 px, viewport 962 px. Batas native per sisi 80% ternyata tidak
menjamin pasangan aman. Implementasi membatasi pasangan pada 80% dari
`min(workspace width, viewport width)`; tiap sisi maksimal setengah budget itu.
Ini guard terhadap overflow berulang, bukan kontrak maksimum native yang baru.
Minimum native tetap berlaku; kombinasi mustahil ditangguhkan, tanpa membuka/menutup sidebar secara paksa.
Reset layout pengguna ke 280 px per sisi diotorisasi terpisah; sinkronisasi tetap mati.
Deploy perbaikan dan acceptance native tetap tindakan terpisah.

- [Task breakdown](../../../specs/sidebar-equal-resize/tasks.md) telah disetujui
  dan menghubungkan implementasi, regression tests, serta acceptance native.
- Kontrak 1.14.2 diverifikasi dengan CLI dan native methods pada elemen terlepas:
  setter tanpa clamp, drag min200/max80% workspace, state animasi, pointercancel.
  Adapter menerapkan guard versi tepat 1.14.2; perlu bukti baru sebelum versi
  lain diaktifkan. Manifest minimum plugin tidak berubah.
- Full acceptance sidebar pengguna, restart/persistence, mobile/popout tetap
  pending. Probe detached dan fixture browser tidak menggantikan acceptance itu.
