# Validasi yang masih diperlukan

## Tidak ada kandidat kerentanan tertahan

`findings.json` berisi array kosong. Tidak ada hipotesis eksploitasi spesifik
yang lolos candidate gate untuk diberi verdict `needs_validation`.
Daftar di bawah adalah batas cakupan dan langkah acceptance, bukan daftar
kerentanan atau severity terselubung.

## GAP-HOST — Renderer Markdown Obsidian

- Jalur sumber: `src/components/outline-view.ts:112` menyimpan Markdown judul;
  `:1071` menyerahkannya kepada `MarkdownRenderer.render` milik host.
- Fixture `tests/fixtures/performance-obsidian.ts:53` menggunakan textContent,
  sehingga tidak membuktikan sanitization, post-processor, atau embed policy
  pada renderer Obsidian nyata.
- Tidak ditemukan bypass sanitizer atau sink evaluasi script langsung dari
  jalur plugin ini. Tidak ada XSS yang dikonfirmasi.
- Blocker: implementasi dan konfigurasi host tidak termasuk repo; sandbox
  eksekusi yang disyaratkan skill belum tersedia.
- Langkah lokal: gunakan salinan plugin dan vault disposable tanpa data privat,
  dalam isolasi OS tanpa jaringan eksternal dan dengan batas sumber daya.
  Periksa inert HTML, link biasa, local embed dan markup remote image dengan
  resource attempt yang diblokir/diamati. Bandingkan outline dengan rendering
  native note, serta uji desktop/mobile/popout yang relevan. Jangan mengirim
  request ke host eksternal atau mengaktifkan plugin tambahan yang tidak perlu.
- Acceptance: catat versi Obsidian, konfigurasi post-processor, expected output,
  hasil observasi, dan apakah outline menambahkan perilaku di luar renderer
  native. Jangan menyimpulkan aman dari mock textContent.

## GAP-DEPENDENCY — Advisory dan isi bundle

Manifest, lockfile, konfigurasi install dan daftar external build ditelaah.
Tidak dilakukan pemindaian advisory terbaru, audit source internal seluruh
paket, atau pemeriksaan bundle hasil build. Tidak ada klaim jumlah CVE aktif.

Pemilik dapat menjalankan pemindaian terotorisasi atas graph lengkap melalui
jalur CI normal, kemudian menilai keterjangkauan tiap advisory dan inventaris
bundle. Pengambilan advisory adalah aktivitas jaringan terpisah dari audit
sumber ini. Temuan historis bukan bukti bahwa versi sekarang masih rentan
atau sudah bersih. Lihat SEC-H01 dalam laporan utama.

## GAP-HOSTED — Kontrol repository dan release

Workflow menunjukkan izin yang dideklarasikan dan pemisahan job, tetapi tidak
membuktikan branch protection, required reviews/checks, runner isolation,
scope/expiry RELEASE_TOKEN, atau identitas artifact release yang sudah terbit.

Langkah aman adalah inspeksi konfigurasi oleh maintainer dan perbandingan
bukti CI/provenance yang sudah ada. Jangan membuat tag, mengubah permission,
memicu publikasi, atau mengunggah artifact untuk menyelesaikan audit ini.
Ketiadaan bukti konfigurasi bukan bukti bahwa kontrol tersebut tidak aktif.

## GAP-EXECUTION — Pengujian dan gate audit

Tidak ada test/build/fixture repo yang dieksekusi. Lingkungan belum menjamin
seluruh syarat sandbox: environment kosong dengan allowlist, target dan
toolchain read-only, scratch-only writes, network isolation, serta limit CPU,
memori, process count, file size, disk dan waktu. Tidak ada artifact dari proses
target yang dipromosikan sebagai bukti.

CLI `validate-findings.cjs` dan `validate-coverage-ledger.cjs` menolak pembacaan
file karena proteksi OS no-follow/nonblocking tidak tersedia. API struktural
validator yang sama menghasilkan nol error untuk objek parent di memori;
itu hanya pemeriksaan struktur, bukan pengganti gate pembacaan file aman.
Jalankan ulang kedua CLI pada lingkungan yang mendukung proteksi tersebut
sebelum menutup status formal `incomplete`.

Regression/acceptance untuk lima rekomendasi ada pada REPORT.md. Perbaikan
source, perubahan CI, commit, push dan deployment belum dilakukan.
