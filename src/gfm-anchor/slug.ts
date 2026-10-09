import type { HeadingCache } from "obsidian";

const URL_ENCODED_BYTE_PATTERN = /%[0-9A-Fa-f]{2}/u;
const UPPERCASE_ASCII_PATTERN = /[A-Z]/u;

/**
 * Converts a heading string to a GitHub-flavored Markdown heading slug.
 * Unicode letters are preserved so headings such as "Café dan Niño" work.
 */
export function toGFMSlug(heading: string): string {
	return heading
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s-]/gu, "")
		.trim()
		.replace(/\s/gu, "-");
}

/**
 * Detects GFM-style fragments without treating Obsidian heading fragments as GFM.
 * OFM fragments commonly contain uppercase characters or URL-encoded bytes.
 */
export function isGFMSlug(fragment: string): boolean {
	if (fragment.length === 0) {
		return false;
	}
	if (URL_ENCODED_BYTE_PATTERN.test(fragment)) {
		return false;
	}
	return !UPPERCASE_ASCII_PATTERN.test(fragment);
}

export function buildSlugMap(headings: HeadingCache[]): Map<string, string> {
	const map = new Map<string, string>();
	const counter = new Map<string, number>();

	for (const heading of headings) {
		const base = toGFMSlug(heading.heading);
		const count = counter.get(base) ?? 0;
		const slug = count === 0 ? base : `${base}-${count}`;

		counter.set(base, count + 1);

		if (!map.has(slug)) {
			map.set(slug, heading.heading);
		}
	}

	return map;
}
