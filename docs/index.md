---
layout: home

hero:
  name: Unisastra
  text: Dokumentasi
  tagline: Pengalaman Markdown Kreatif & Penuh Perhatian yang Terpadu
  actions:
    - theme: brand
      text: Pasang Plugin
      link: /untuk-pengguna/install-unisastra
    - theme: alt
      text: Pelajari Fitur
      link: /untuk-pengguna/gunakan-fitur-unisastra

features:
  - title: Mode Preset Menulis
    details: Pilih tahap menulis Anda (Ide, Menulis, Edit, Normal) dan aktifkan perangkat yang tepat secara instan.
  - title: Integrasi Kaya & Fleksibel
    details: Set lengkap fitur — typewriter, dimming, toolbar, timer, anchor heading GitHub — semua bekerja bersama dengan mulus.
  - title: Sepenuhnya Dapat Disesuaikan
    details: Toggle fitur apa pun on/off secara independen. Sesuaikan pengaturan per tool. Buat callout khusus. Workflow Anda, cara Anda.
---

# Unisastra

[Lihat keputusan identitas Unisastra](./specs/unisastra-rebrand/spec.md) dan status implementasi lokalnya.

## Mengapa Preset?

Menulis adalah perjalanan, bukan keadaan tunggal. Brainstorming membutuhkan tools berbeda dari menulis fokus panjang, yang membutuhkan tools berbeda dari editing.

Preset Unisastra menggabungkan fitur yang tepat untuk setiap tahap — dibangun dari workflow penulis markdown berpengalaman. Satu klik mengaktifkan seluruh lingkungan menulis Anda.

**Tetapi Anda tidak terkunci.** Setiap fitur bekerja secara independen. Mix, match, dan bangun workflow sempurna Anda. Preset hanya titik awal.

## Mode Menulis Sekilas

| Mode | Gunakan Untuk | Fitur | Default? |
| --- | --- | --- | --- |
| **Ide** | Brainstorming, capture cepat | Writing Focus + Hemingway + Sentence Focus | — |
| **Menulis** | Long-form, distraction-free | Dimming + Typewriter + Show Whitespace | — |
| **Edit** | Penyempurnaan detail | Current Line + Whitespace + Line Width | — |
| **Normal** | Penggunaan umum, seimbang | Typewriter + Outliner | ✅ |

Ini adalah Kemampuan Default untuk setiap mode preset, Anda dapat mengubahnya sesuai selera Anda

| Kemampuan              | Normal | Ide | Menulis    | Edit |
| :---------------------- | :----- | :--- | :--------- | :------ |
| Writing Focus           | Off    | On   | On         | Off     |
| Outliner                | On     | On   | Off        | Off     |
| Hemingway               | Off    | On   | Off        | Off     |
| Dimming                 | Off    | Off  | On         | Off     |
| Current Line            | Off    | Off  | Off        | On      |
| Typewriter / Keep Lines | Off    | Off  | Typewriter | Off     |
| Whitespace              | Off    | Off  | Off        | On      |
| Line Width              | Off    | Off  | Off        | On      |

**Cara menggunakan:**

1. Buka Settings → Unisastra → Active Writing Mode
2. Pilih preset (atau None untuk mengelola fitur secara manual)
3. Semua fitur di preset itu aktif secara instan
4. Pengaturan Anda per mode selalu disimpan
5. Beralih anytime

[Pelajari lebih lanjut tentang setiap fitur →](./untuk-pengguna/gunakan-fitur-unisastra.md)

## Mulai dalam 3 Langkah

### Langkah 1: Pasang

Unduh Unisastra dari Obsidian Community Plugins atau BRAT.

[Panduan Instalasi →](./untuk-pengguna/install-unisastra.md)

### Langkah 2: Pilih Mode

Buka Settings, pilih preset yang sesuai tahap menulis Anda.

[Preset & Pengaturan →](./untuk-pengguna/gunakan-fitur-unisastra.md)

### Langkah 3: Mulai Menulis

Mulai dengan default seimbang, sesuaikan saat berjalan.

[Troubleshooting →](./untuk-pengguna/troubleshooting.md)

## Sumber Daya Lainnya

### Pelajari

- [Panduan Fitur](./untuk-pengguna/gunakan-fitur-unisastra.md) — Pelajaran mendalam tentang setiap fitur
- [Troubleshooting](./untuk-pengguna/troubleshooting.md) — Masalah umum & solusi

### Jelajahi

- [Status Pengembangan](/en/development-status) — Apa yang sedang dikerjakan
- [Pengakuan](/en/reference/ATTRIBUTION) — Penulis & lisensi

### Berkontribusi

- [Spec block ID dan fold persistence](./specs/block-id-fold-persistence/spec.md)
- [Plan block ID dan fold persistence](./specs/block-id-fold-persistence/plan.md)
- [Implementasi block ID dan fold persistence](./specs/block-id-fold-persistence/tasks.md)
- [ADR-004: efek fold native](./en/reference/decisions/ADR-004-fold-native-effects.md)
- [Spec performa dan kerapian kode](./specs/performance-code-quality/spec.md)
- [Plan performa dan kerapian kode](./specs/performance-code-quality/plan.md)
- [Tasks performa dan kerapian kode](./specs/performance-code-quality/tasks.md)
- [Spesifikasi sinkronisasi lebar sidebar](./specs/sidebar-equal-resize/spec.md)
- [Plan sinkronisasi lebar sidebar](./specs/sidebar-equal-resize/plan.md)
- [Progres dan acceptance sinkronisasi lebar sidebar](./specs/sidebar-equal-resize/tasks.md)
- [Setup Developer](./untuk-developer/setup-local-development.md) — Setup lingkungan lokal

### Dibangun dari 10+ plugin open-source

Lihat [Pengakuan](/en/reference/ATTRIBUTION) untuk atribusi lengkap.
