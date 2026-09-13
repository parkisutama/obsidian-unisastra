import { canonicalBuiltinCalloutId, isGithubAlertMarker } from "./catalog";
import type { CalloutOutputMode } from "./settings";

const CALLOUT_HEADER_PATTERN =
  /^(?<quote>>+)[ \t]?\[!(?<id>[a-zA-Z][a-zA-Z0-9_-]*)\](?<fold>[+-]?)(?<title>.*)$/;
const QUOTED_LINE = /^\s*>/;
const QUOTE_PREFIX = /^>[ \t]?/;
const BODY_HEADER = /^\s*\[!/;

export function isCalloutHeaderLine(line: string): boolean {
  return CALLOUT_HEADER_PATTERN.test(line);
}

/** Wraps plain text as a new callout body, preserving every line (including blanks). */
export function wrapAsCallout(text: string, id: string): string {
  const body = text
    .split("\n")
    .map((line) => (line.length > 0 ? `> ${line}` : ">"))
    .join("\n");
  return `> [!${id}]\n${body}`;
}

/**
 * Changes an existing callout's type, keeping its quote depth, fold marker,
 * title, and every other line untouched. Returns null if the first line is
 * not a callout header (the selection is not an existing callout at all).
 */
export function changeCalloutType(text: string, id: string): string | null {
  const lines = text.split("\n");
  const match = CALLOUT_HEADER_PATTERN.exec(lines[0]);
  if (!match?.groups) {
    return null;
  }
  const { quote, fold, title } = match.groups;
  const newFirstLine = `${quote} [!${id}]${fold}${title}`;
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

function githubCalloutEdit(text: string, id: string): CalloutEditResult {
  const marker = id.toUpperCase();
  const refusal = {
    refusal:
      "GitHub alerts require a built-in type without title, folding, or nesting. Use Obsidian output for this selection.",
  };
  if (!isGithubAlertMarker(marker)) {
    return refusal;
  }
  const lines = text.split("\n");
  const header = CALLOUT_HEADER_PATTERN.exec(lines[0])?.groups;
  if (!header) {
    return lines.some((line) => QUOTED_LINE.test(line))
      ? refusal
      : { insert: wrapAsCallout(text, marker) };
  }
  if (
    header.quote !== ">" ||
    header.fold ||
    header.title.trim() ||
    !canonicalBuiltinCalloutId(header.id)
  ) {
    return refusal;
  }
  const incompatible = lines.slice(1).some((line) => {
    if (!line.trim()) {
      return false;
    }
    if (!QUOTE_PREFIX.test(line)) {
      return true;
    }
    const body = line.replace(QUOTE_PREFIX, "");
    return QUOTED_LINE.test(body) || BODY_HEADER.test(body);
  });
  return incompatible
    ? refusal
    : { insert: changeCalloutType(text, marker) ?? text };
}

export function calloutEdit(
  text: string,
  id: string,
  mode: CalloutOutputMode = "obsidian"
): CalloutEditResult {
  if (mode === "github") {
    return githubCalloutEdit(text, id);
  }
  if (hasAmbiguousCalloutHeader(text)) {
    return {
      refusal:
        "Selection cuts through an existing callout header. Select the whole callout block.",
    };
  }
  return { insert: changeCalloutType(text, id) ?? wrapAsCallout(text, id) };
}
