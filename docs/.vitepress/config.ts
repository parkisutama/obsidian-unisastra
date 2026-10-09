import { defineConfig } from "vitepress";
import { enSidebar } from "./sidebar-en";
import { idSidebar } from "./sidebar-id";

export default defineConfig({
	base: "/obsidian-unisastra/",
	lang: "id",
	ignoreDeadLinks: true,

	locales: {
		root: {
			label: "Bahasa Indonesia",
			lang: "id",
			title: "Dokumentasi Unisastra",
			description: "Pengalaman Markdown Kreatif & Penuh Perhatian yang Terpadu",
			link: "/",
		},
		en: {
			label: "English",
			lang: "en",
			title: "Unisastra Documentation",
			description: "Unified Markdown Creative & Attentive Experience",
			link: "/en/",
		},
	},

	themeConfig: {
		localeLinks: {
			text: "Bahasa",
			items: [
				{ text: "Bahasa Indonesia", link: "/" },
				{ text: "English", link: "/en/" },
			],
		},

		sidebar: {
			"/": idSidebar,
			"/en/": enSidebar,
		},
		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/parkisutama/obsidian-unisastra",
			},
		],
	},
});
