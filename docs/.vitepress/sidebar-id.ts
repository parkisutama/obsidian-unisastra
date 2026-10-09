export const idSidebar = [
	{
		text: "Untuk Pengguna Plugin",
		items: [
			{ text: "Pasang Unisastra", link: "/untuk-pengguna/install-unisastra" },
			{ text: "Gunakan Fitur", link: "/untuk-pengguna/gunakan-fitur-unisastra" },
			{ text: "Troubleshooting", link: "/untuk-pengguna/troubleshooting" },
		],
	},
	{
		text: "Fitur",
		items: [
			{ text: "Pengaturan Umum", link: "/untuk-pengguna/fitur/pengaturan-umum" },
			{
				text: "Mode Preset",
				collapsed: true,
				items: [
					{ text: "Ringkasan", link: "/untuk-pengguna/fitur/preset-modes/preset-modes-overview" },
					{ text: "Mode Ide", link: "/untuk-pengguna/fitur/preset-modes/preset-idea" },
					{ text: "Mode Menulis", link: "/untuk-pengguna/fitur/preset-modes/preset-writing" },
					{ text: "Mode Edit", link: "/untuk-pengguna/fitur/preset-modes/preset-editing" },
					{ text: "Mode Normal", link: "/untuk-pengguna/fitur/preset-modes/preset-normal" },
				],
			},
			{ text: "Toolbar Mengambang", link: "/untuk-pengguna/fitur/toolbar" },
			{ text: "Callout", link: "/untuk-pengguna/fitur/callouts" },
		],
	},
	{
		text: "Untuk Developer",
		items: [{ text: "Setup Pengembangan Lokal", link: "/untuk-developer/setup-local-development" }],
	},
	{
		text: "Referensi",
		items: [
			{ text: "Status Pengembangan", link: "/en/development-status" },
			{ text: "Rebranding Unisastra", link: "/specs/unisastra-rebrand/spec" },
			{ text: "Pengakuan", link: "/en/reference/ATTRIBUTION" },
		],
	},
];
