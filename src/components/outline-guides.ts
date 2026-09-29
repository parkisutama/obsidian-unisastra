interface GuideEntry {
  ancestorIndices: number[];
  index: number;
}

export interface OutlineGuideRow extends GuideEntry {
  continuingDepths: number[];
  hasChildren: boolean;
  isLastSibling: boolean;
}

/** Layout belongs to the visible tree; hidden parents must not leave orphan rails. */
export function buildOutlineGuides(entries: GuideEntry[]): OutlineGuideRow[] {
  const visible = new Set(entries.map((entry) => entry.index));
  const rows = entries.map((entry) => ({
    ancestorIndices: entry.ancestorIndices.filter((index) =>
      visible.has(index)
    ),
    continuingDepths: [] as number[],
    hasChildren: false,
    index: entry.index,
    isLastSibling: true,
  }));
  const byIndex = new Map(rows.map((row) => [row.index, row]));
  const lastChild = new Map<number | null, OutlineGuideRow>();
  for (const row of rows) {
    const parentIndex = row.ancestorIndices.at(-1) ?? null;
    const previous = lastChild.get(parentIndex);
    if (previous) {
      previous.isLastSibling = false;
    }
    lastChild.set(parentIndex, row);
    const parent = parentIndex === null ? undefined : byIndex.get(parentIndex);
    if (parent) {
      parent.hasChildren = true;
    }
  }
  for (const row of rows) {
    row.continuingDepths = row.ancestorIndices.flatMap((index, depth) =>
      depth > 0 && !byIndex.get(index)?.isLastSibling ? [depth] : []
    );
  }
  return rows;
}

/** Each edge uses the parent's stem, intervening verticals, and the child's elbow. */
export function getOutlineTrail(
  rows: OutlineGuideRow[],
  targetIndex: number
): Set<string> {
  const target = rows.find((row) => row.index === targetIndex);
  const result = new Set<string>();
  if (!target) {
    return result;
  }
  const positions = new Map(rows.map((row, index) => [row.index, index]));
  const path = [...target.ancestorIndices, targetIndex];
  for (let depth = 1; depth < path.length; depth++) {
    const parent = path[depth - 1];
    const child = path[depth];
    result.add(`${parent}:stem`);
    const start = positions.get(parent) ?? 0;
    const end = positions.get(child) ?? 0;
    for (let index = start + 1; index < end; index++) {
      result.add(`${rows[index].index}:column:${depth}`);
    }
    result.add(`${child}:elbow`);
  }
  return result;
}

export function renderOutlineGuides(
  lead: HTMLElement,
  row: OutlineGuideRow,
  hasDisclosure = row.hasChildren
): void {
  const guides = lead.createDiv({ cls: "unisastra-outline-guides" });
  guides.setAttribute("aria-hidden", "true");
  for (const [depth] of row.ancestorIndices.entries()) {
    const column = guides.createDiv({ cls: "unisastra-outline-guide-column" });
    if (row.continuingDepths.includes(depth)) {
      column.addClass("is-continuing");
      column.dataset.outlineConnector = `${row.index}:column:${depth}`;
    }
  }
  const junction = guides.createDiv({ cls: "unisastra-outline-junction" });
  junction.classList.toggle("is-root", row.ancestorIndices.length === 0);
  junction.classList.toggle("is-last-sibling", row.isLastSibling);
  junction.classList.toggle("is-leaf", !hasDisclosure);
  if (row.ancestorIndices.length > 0) {
    junction.dataset.outlineConnector = `${row.index}:column:${row.ancestorIndices.length}`;
  }
  const elbow = junction.createDiv({ cls: "unisastra-outline-junction-elbow" });
  if (row.ancestorIndices.length > 0) {
    elbow.dataset.outlineConnector = `${row.index}:elbow`;
  }
  if (row.hasChildren) {
    const stem = guides.createDiv({ cls: "unisastra-outline-child-stem" });
    stem.dataset.outlineConnector = `${row.index}:stem`;
  }
}

export function applyOutlineTrail(
  container: HTMLElement,
  trail: Set<string>,
  className: string
): void {
  for (const connector of Array.from(
    container.querySelectorAll<HTMLElement>("[data-outline-connector]")
  )) {
    connector.classList.toggle(
      className,
      trail.has(connector.dataset.outlineConnector ?? "")
    );
  }
}
