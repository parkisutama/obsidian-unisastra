export interface CalloutTypeDefinition {
  readonly aliases: readonly string[];
  readonly id: string;
  readonly label: string;
}

// Obsidian's built-in callout types and aliases: https://obsidian.md/help/callouts
export const BUILTIN_CALLOUT_TYPES: readonly CalloutTypeDefinition[] = [
  { id: "note", aliases: [], label: "Note" },
  { id: "abstract", aliases: ["summary", "tldr"], label: "Abstract" },
  { id: "info", aliases: [], label: "Info" },
  { id: "todo", aliases: [], label: "Todo" },
  { id: "tip", aliases: ["hint", "important"], label: "Tip" },
  { id: "success", aliases: ["check", "done"], label: "Success" },
  { id: "question", aliases: ["help", "faq"], label: "Question" },
  { id: "warning", aliases: ["caution", "attention"], label: "Warning" },
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
// IMPORTANT and CAUTION reuse tip/warning's canonical ID (they are Obsidian aliases of those
// types already) instead of creating a second catalog entry for the same underlying callout.
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
    IMPORTANT: "tip",
    WARNING: "warning",
    CAUTION: "warning",
  };

export function isGithubAlertMarker(value: string): value is GithubAlertMarker {
  return (GITHUB_ALERT_MARKERS as readonly string[]).includes(value);
}

export function githubMarkerCanonicalId(marker: GithubAlertMarker): string {
  return GITHUB_MARKER_CANONICAL_ID[marker];
}
