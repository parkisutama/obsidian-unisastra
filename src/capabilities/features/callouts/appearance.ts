// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

const ICON_ID = /^lucide-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR = /^#(?:[a-f\d]{3}|[a-f\d]{6})$/i;
const RGB_FUNCTION = /^rgba?\(([^)]+)\)$/i;
const CHANNEL_SEPARATOR = /[\s,]+/;

function colorHex(raw: string): string | null {
	const value = raw.trim();
	if (HEX_COLOR.test(value)) {
		return value.length === 4
			? `#${[...value.slice(1)].map((digit) => digit + digit).join("")}`.toLowerCase()
			: value.toLowerCase();
	}
	const rgb = RGB_FUNCTION.exec(value);
	const channels = rgb
		? rgb[1].split("/")[0].trim().split(CHANNEL_SEPARATOR).slice(0, 3)
		: value.split(",").map((channel) => channel.trim());
	const valid =
		channels.length === 3 &&
		channels.every(
			(channel) =>
				channel !== "" &&
				Number.isFinite(Number(channel)) &&
				Number(channel) >= 0 &&
				Number(channel) <= 255,
		);
	return valid
		? `#${channels.map((channel) => Math.round(Number(channel)).toString(16).padStart(2, "0")).join("")}`
		: null;
}

export function effectiveCalloutValues(
	color: string,
	icon: string,
	renderedColor = "",
): { color: string | null; icon: string | null } {
	const id = icon.trim().replace(/^['"]|['"]$/g, "");
	return {
		color: colorHex(color) ?? colorHex(renderedColor),
		icon: ICON_ID.test(id) ? id : null,
	};
}
