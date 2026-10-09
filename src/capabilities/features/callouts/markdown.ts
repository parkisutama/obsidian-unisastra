const CALLOUT_HEADER_PATTERN =
	/^(?<quote>>+)[ \t]?\[!(?<id>[a-zA-Z][a-zA-Z0-9_-]*)\](?<fold>[+-]?)(?<title>.*)$/;

export function isCalloutHeaderLine(line: string): boolean {
	return CALLOUT_HEADER_PATTERN.test(line);
}

/**
 * Wraps plain text as a new callout body, preserving every line (including
 * blanks). The marker is emitted uppercase: Obsidian matches callout types
 * case-insensitively, and uppercase is also what GitHub Alerts require, so
 * one emitted form works everywhere without a separate output mode.
 */
export function wrapAsCallout(text: string, id: string): string {
	const body = text
		.split("\n")
		.map((line) => (line.length > 0 ? `> ${line}` : ">"))
		.join("\n");
	return `> [!${id.toUpperCase()}]\n${body}`;
}

/**
 * Changes an existing callout's type, keeping its quote depth, fold marker,
 * title, and every other line untouched. Returns null if the first line is
 * not a callout header (the selection is not an existing callout at all).
 * The new marker is emitted uppercase, same rationale as `wrapAsCallout`.
 */
export function changeCalloutType(text: string, id: string): string | null {
	const lines = text.split("\n");
	const match = CALLOUT_HEADER_PATTERN.exec(lines[0]);
	if (!match?.groups) {
		return null;
	}
	const { quote, fold, title } = match.groups;
	const newFirstLine = `${quote} [!${id.toUpperCase()}]${fold}${title}`;
	return [newFirstLine, ...lines.slice(1)].join("\n");
}

/**
 * True when a callout header appears inside the selection but not as its
 * first line — the selection cuts through an existing callout rather than
 * capturing it whole, so converting it would silently drop the header.
 */
export function hasAmbiguousCalloutHeader(text: string): boolean {
	const lines = text.split("\n");
	if (isCalloutHeaderLine(lines[0])) {
		return false;
	}
	return lines.some((line) => isCalloutHeaderLine(line));
}

export type CalloutEditResult = { insert: string } | { refusal: string };

export function calloutEdit(text: string, id: string): CalloutEditResult {
	if (hasAmbiguousCalloutHeader(text)) {
		return {
			refusal: "Selection cuts through an existing callout header. Select the whole callout block.",
		};
	}
	return { insert: changeCalloutType(text, id) ?? wrapAsCallout(text, id) };
}
