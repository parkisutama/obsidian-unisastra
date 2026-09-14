export interface CalloutTypeDefinition {
  readonly aliases: readonly string[];
  readonly id: string;
  readonly label: string;
}

// Obsidian's built-in callout types and aliases: https://obsidian.md/help/callouts
// "important" and "caution" are promoted to full entries (not merely aliases
// collapsed into tip/warning): Obsidian renders an alias's literal type token
// as its default title ("Important", not "Tip"), even though it shares tip's
// icon/color via Obsidian's own core CSS — so they read differently to a
// reader despite matching by default appearance. Exposing them as their own
// catalog entries lets users select/insert either independently; no styling
// code is needed to make them look like tip/warning, since Obsidian already
// does that natively for these known alias tokens.
export const BUILTIN_CALLOUT_TYPES: readonly CalloutTypeDefinition[] = [
  { id: "note", aliases: [], label: "Note" },
  { id: "abstract", aliases: ["summary", "tldr"], label: "Abstract" },
  { id: "info", aliases: [], label: "Info" },
  { id: "todo", aliases: [], label: "Todo" },
  { id: "tip", aliases: ["hint"], label: "Tip" },
  { id: "important", aliases: [], label: "Important" },
  { id: "success", aliases: ["check", "done"], label: "Success" },
  { id: "question", aliases: ["help", "faq"], label: "Question" },
  { id: "warning", aliases: ["attention"], label: "Warning" },
  { id: "caution", aliases: [], label: "Caution" },
  { id: "failure", aliases: ["fail", "missing"], label: "Failure" },
  { id: "danger", aliases: ["error"], label: "Danger" },
  { id: "bug", aliases: [], label: "Bug" },
  { id: "example", aliases: [], label: "Example" },
  { id: "quote", aliases: ["cite"], label: "Quote" },
];

const CANONICAL_ID_BY_ALIAS: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const type of BUILTIN_CALLOUT_TYPES) {
    map.set(type.id, type.id);
    for (const alias of type.aliases) {
      map.set(alias, type.id);
    }
  }
  return map;
})();

export const BUILTIN_LABEL_BY_ID: ReadonlyMap<string, string> = new Map(
  BUILTIN_CALLOUT_TYPES.map((type) => [type.id, type.label])
);

/** Resolves a builtin type or alias (case-insensitive) to its canonical lowercase ID, or null if unknown. */
export function canonicalBuiltinCalloutId(id: string): string | null {
  return CANONICAL_ID_BY_ALIAS.get(id.trim().toLowerCase()) ?? null;
}

export function isBuiltinCalloutId(id: string): boolean {
  return canonicalBuiltinCalloutId(id) !== null;
}

// GitHub Alerts: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts
// Each marker maps 1:1 to its own catalog entry now that "important"/"caution"
// are full entries rather than aliases collapsed into tip/warning.
export const GITHUB_ALERT_MARKERS = [
  "NOTE",
  "TIP",
  "IMPORTANT",
  "WARNING",
  "CAUTION",
] as const;
export type GithubAlertMarker = (typeof GITHUB_ALERT_MARKERS)[number];

const GITHUB_MARKER_CANONICAL_ID: Readonly<Record<GithubAlertMarker, string>> =
  {
    NOTE: "note",
    TIP: "tip",
    IMPORTANT: "important",
    WARNING: "warning",
    CAUTION: "caution",
  };

export function isGithubAlertMarker(value: string): value is GithubAlertMarker {
  return (GITHUB_ALERT_MARKERS as readonly string[]).includes(value);
}

export function githubMarkerCanonicalId(marker: GithubAlertMarker): string {
  return GITHUB_MARKER_CANONICAL_ID[marker];
}

const GITHUB_MARKERS_BY_CANONICAL_ID: ReadonlyMap<
  string,
  readonly GithubAlertMarker[]
> = (() => {
  const map = new Map<string, GithubAlertMarker[]>();
  for (const marker of GITHUB_ALERT_MARKERS) {
    const id = githubMarkerCanonicalId(marker);
    const markers = map.get(id) ?? [];
    markers.push(marker);
    map.set(id, markers);
  }
  return map;
})();

/**
 * The GitHub Alert marker a builtin ID is also recognized as (e.g. "tip" ->
 * TIP), or an empty array for custom IDs and builtins with no GitHub-compatible
 * form. Informational only — settings UI uses this to describe compatibility,
 * it does not gate what the toolbar can insert.
 */
export function githubAlertMarkersForCanonicalId(
  id: string
): readonly GithubAlertMarker[] {
  return GITHUB_MARKERS_BY_CANONICAL_ID.get(id) ?? [];
}

/**
 * Compact compatibility label for a catalog entry's ID, shown in the
 * Callouts settings tab only (never on the toolbar itself). Shared by
 * callout-manager.ts (header description) and callout-style-editor.ts
 * (preview sample body) so both stay in sync with the same wording.
 */
export function compatibilityLabel(
  id: string
): "Obsidian and GitHub" | "Obsidian only" {
  return githubAlertMarkersForCanonicalId(id).length === 0
    ? "Obsidian only"
    : "Obsidian and GitHub";
}
