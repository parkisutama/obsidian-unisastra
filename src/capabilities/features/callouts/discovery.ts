interface DiscoveryRule {
  readonly cssRules?: ArrayLike<DiscoveryRule>;
  readonly selectorText?: string;
}

interface DiscoverySheet {
  readonly cssRules: ArrayLike<DiscoveryRule>;
  readonly href?: string | null;
}

export function discoverCallouts(
  sheets: ArrayLike<DiscoverySheet>,
  options: { maxRules?: number; maxDepth?: number } = {}
): { candidates: { id: string; sources: string[] }[]; partial: boolean } {
  const limit = (value: number | undefined, fallback: number): number =>
    value !== undefined && Number.isFinite(value)
      ? Math.max(0, Math.min(fallback, Math.floor(value)))
      : fallback;
  const maxRules = limit(options.maxRules, 2000);
  const maxDepth = limit(options.maxDepth, 8);
  const candidates = new Map<string, Set<string>>();
  let partial = sheets.length > 64;
  let visited = 0;
  const walk = (
    rules: ArrayLike<DiscoveryRule>,
    source: string,
    depth: number
  ): void => {
    // CSSRuleList is array-like; avoid copying an unbounded list before enforcing the budget.
    for (let index = 0; index < rules.length; index++) {
      if (visited >= maxRules) {
        partial = true;
        return;
      }
      visited++;
      const rule = rules[index];
      if (!rule) {
        continue;
      }
      const collect = (selector: string): void => {
        const pattern =
          /\[data-callout\s*=\s*(?:"([a-z0-9_-]{1,64})"|'([a-z0-9_-]{1,64})'|([a-z0-9_-]{1,64}))\s*\]/gi;
        for (const match of selector.matchAll(pattern)) {
          const id = (match[1] ?? match[2] ?? match[3] ?? "").toLowerCase();
          const sources = candidates.get(id) ?? new Set<string>();
          sources.add(source);
          candidates.set(id, sources);
        }
      };
      collect(rule.selectorText ?? "");
      try {
        if (rule.cssRules?.length) {
          if (depth >= maxDepth) {
            partial = true;
          } else {
            walk(rule.cssRules, source, depth + 1);
          }
        }
      } catch {
        partial = true;
      }
    }
  };
  for (let index = 0; index < Math.min(sheets.length, 64); index++) {
    try {
      const sheet = sheets[index];
      if (sheet) {
        walk(sheet.cssRules, sheet.href || `CSS source ${index + 1}`, 0);
      }
    } catch {
      partial = true;
    }
  }
  return {
    candidates: [...candidates].map(([id, sources]) => ({
      id,
      sources: [...sources],
    })),
    partial,
  };
}
