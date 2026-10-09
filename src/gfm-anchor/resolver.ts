import type { App, HeadingCache, TFile } from "obsidian";
import { isGFMSlug, toGFMSlug } from "./slug";

export interface ResolvedSlugTarget {
	heading: string;
	headingOccurrence: number;
	line: number;
}

export interface ParsedAnchor {
	filePart: string;
	fragment: string;
}

export function resolveSlug(slug: string, file: TFile, app: App): string | null {
	return resolveSlugTarget(slug, file, app)?.heading ?? null;
}

export function resolveSlugTarget(slug: string, file: TFile, app: App): ResolvedSlugTarget | null {
	if (!isGFMSlug(slug)) {
		return null;
	}

	const cache = app.metadataCache.getFileCache(file);
	if (!cache?.headings?.length) {
		return null;
	}

	const target = resolveHeadingCache(slug, cache.headings);
	if (!target) {
		return null;
	}

	return {
		heading: target.heading.heading,
		headingOccurrence: target.headingOccurrence,
		line: target.heading.position.start.line,
	};
}

export function parseAnchor(raw: string): ParsedAnchor | null {
	const hashIndex = raw.indexOf("#");
	const filePart = hashIndex >= 0 ? raw.slice(0, hashIndex) : "";
	const rawFragment = hashIndex >= 0 ? raw.slice(hashIndex + 1) : raw;

	if (!rawFragment) {
		return null;
	}

	return {
		filePart,
		fragment: decodeFragment(rawFragment),
	};
}

export function formatAnchor(filePart: string, fragment: string): string {
	return filePart ? `${filePart}#${fragment}` : `#${fragment}`;
}

export function getTargetFile(app: App, filePart: string, sourcePath: string): TFile | null {
	if (!filePart) {
		return app.vault.getFileByPath(sourcePath);
	}

	return app.metadataCache.getFirstLinkpathDest(filePart, sourcePath);
}

function resolveHeadingCache(
	slug: string,
	headings: HeadingCache[],
): { heading: HeadingCache; headingOccurrence: number } | null {
	const slugCounter = new Map<string, number>();
	const headingCounter = new Map<string, number>();

	for (const heading of headings) {
		const base = toGFMSlug(heading.heading);
		const slugCount = slugCounter.get(base) ?? 0;
		const candidate = slugCount === 0 ? base : `${base}-${slugCount}`;
		const headingOccurrence = headingCounter.get(heading.heading) ?? 0;

		slugCounter.set(base, slugCount + 1);
		headingCounter.set(heading.heading, headingOccurrence + 1);

		if (candidate === slug) {
			return { heading, headingOccurrence };
		}
	}

	return null;
}

function decodeFragment(rawFragment: string): string {
	try {
		return decodeURIComponent(rawFragment);
	} catch {
		return rawFragment;
	}
}
