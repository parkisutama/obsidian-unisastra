import { defineConfig } from "vitepress"
import { idSidebar } from "./sidebar-id"
import { enSidebar } from "./sidebar-en"

export default defineConfig({
  base: "/obsidian-md-writer/",
  lang: "id",

  locales: {
    root: {
      label: "Bahasa Indonesia",
      lang: "id",
      title: "Dokumentasi MD Writer",
      description: "Pengalaman Markdown Kreatif & Penuh Perhatian yang Terpadu",
      link: "/"
    },
    en: {
      label: "English",
      lang: "en",
      title: "MD Writer Documentation",
      description: "Unified Markdown Creative & Attentive Experience",
      link: "/en/"
    }
  },

  themeConfig: {
    localeLinks: {
      text: "Bahasa",
      items: [
        { text: "Bahasa Indonesia", link: "/" },
        { text: "English", link: "/en/" }
      ]
    },

    sidebar: {
      "/": idSidebar,
      "/en/": enSidebar
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/parkisutama/obsidian-md-writer",
      },
    ],
  },
});
