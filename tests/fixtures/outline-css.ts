import {
  applyOutlineTrail,
  buildOutlineGuides,
  getOutlineTrail,
  renderOutlineGuides,
} from "../../src/components/outline-guides";

// Minimal Obsidian DOM helpers, with real browser layout and production renderer.
HTMLElement.prototype.createDiv = function (
  options?: string | { cls?: string }
) {
  const child = this.ownerDocument.createElement("div");
  child.className =
    typeof options === "string" ? options : (options?.cls ?? "");
  this.append(child);
  return child;
};
HTMLElement.prototype.addClass = function (...classes: string[]) {
  this.classList.add(...classes);
};

const entries = [
  { index: 0, ancestorIndices: [], title: "Assessment and presentation" },
  {
    index: 1,
    ancestorIndices: [0],
    title: "Organization and responsibility across several operational teams",
  },
  {
    index: 2,
    ancestorIndices: [0, 1],
    title: "First leaf with a following sibling",
  },
  { index: 3, ancestorIndices: [0, 1], title: "Last leaf" },
  {
    index: 4,
    ancestorIndices: [0],
    title: "Last parent with an expanded child",
  },
  { index: 5, ancestorIndices: [0, 4], title: "Impact on position and roster" },
  { index: 6, ancestorIndices: [], title: "Next section" },
];

function runOutlineRegression() {
  const list = document.querySelector<HTMLElement>(".unisastra-outline-list");
  if (!list) {
    throw new Error("Missing fixture list");
  }
  const failures: string[] = [];
  let checks = 0;
  function check(condition: boolean, label: string) {
    checks++;
    if (!condition) {
      failures.push(label);
    }
  }
  const near = (a: number, b: number) => Math.abs(a - b) < 1;
  function checkRow(
    items: HTMLElement[],
    rows: ReturnType<typeof buildOutlineGuides>,
    index: number
  ) {
    const item = items[index];
    const row = rows[index];
    const bounds = item.getBoundingClientRect();
    const junction = item.querySelector<HTMLElement>(
      ".unisastra-outline-junction"
    );
    const elbow = item.querySelector<HTMLElement>(
      ".unisastra-outline-junction-elbow"
    );
    if (!(junction && elbow)) {
      throw new Error("Missing production connector");
    }
    const junctionBounds = junction.getBoundingClientRect();
    const spine = getComputedStyle(junction, "::before");
    if (row.ancestorIndices.length === 0) {
      check(
        getComputedStyle(elbow).display === "none",
        "root has no incoming elbow"
      );
    } else {
      const elbowBounds = elbow.getBoundingClientRect();
      check(near(elbowBounds.top, bounds.top), "elbow begins at row boundary");
      check(
        near(elbowBounds.bottom, (bounds.top + bounds.bottom) / 2 + 0.5),
        "elbow ends at row midpoint"
      );
      check(
        getComputedStyle(elbow).borderBottomLeftRadius === "5px",
        "elbow is rounded"
      );
      if (row.isLastSibling) {
        check(
          spine.display === "none",
          "last sibling has no dangling trunk even with children"
        );
      } else {
        check(spine.display !== "none", "nonlast leaf retains trunk");
        check(
          near(junctionBounds.top + Number.parseFloat(spine.top), bounds.top),
          "trunk starts at row boundary"
        );
        check(
          near(
            junctionBounds.bottom - Number.parseFloat(spine.bottom),
            bounds.bottom
          ),
          "trunk ends at row boundary"
        );
      }
    }
    const stem = item.querySelector<HTMLElement>(
      ".unisastra-outline-child-stem"
    );
    check(Boolean(stem) === row.hasChildren, "stem only for visible children");
    if (stem) {
      const nextElbow = items[index + 1].querySelector<HTMLElement>(
        ".unisastra-outline-junction-elbow"
      );
      if (!nextElbow) {
        throw new Error("Missing child elbow");
      }
      const stemBounds = stem.getBoundingClientRect();
      const stemStyle = getComputedStyle(stem, "::before");
      check(
        near(
          stemBounds.left + Number.parseFloat(stemStyle.left),
          nextElbow.getBoundingClientRect().left
        ),
        "parent stem and child elbow share x"
      );
      check(
        near(
          stemBounds.bottom - Number.parseFloat(stemStyle.bottom),
          nextElbow.getBoundingClientRect().top
        ),
        "parent stem meets child elbow vertically"
      );
    }
    for (const column of Array.from(
      item.querySelectorAll<HTMLElement>(
        ".unisastra-outline-guide-column:not(.is-continuing)"
      )
    )) {
      check(
        getComputedStyle(column, "::before").content === "none",
        "empty ancestor column draws no line"
      );
    }
  }
  function checkTrail(
    list: HTMLElement,
    rows: ReturnType<typeof buildOutlineGuides>
  ) {
    const trail = getOutlineTrail(rows, 5);
    for (const className of [
      "is-hover-connector",
      "is-active-connector",
      "is-focus-connector",
    ]) {
      applyOutlineTrail(list, trail, className);
      check(
        list.querySelectorAll(`.${className}`).length === trail.size,
        "only the actual path is emphasized"
      );
      for (const element of Array.from(
        list.querySelectorAll<HTMLElement>(`.${className}`)
      )) {
        const style = getComputedStyle(
          element,
          element.classList.contains("unisastra-outline-junction-elbow")
            ? null
            : "::before"
        );
        check(style.opacity === "1", "path segment is emphasized");
      }
      applyOutlineTrail(list, new Set(), className);
      check(
        list.querySelectorAll(`.${className}`).length === 0,
        "path emphasis clears"
      );
    }
  }
  const scenarios = [
    entries,
    [entries[0], entries[1], entries[4], entries[6]],
    [entries[2], entries[3], entries[5]],
  ];
  for (const width of [240, 440]) {
    for (const font of [14, 20]) {
      for (const visible of scenarios) {
        list.replaceChildren();
        list.style.width = `${width}px`;
        list.style.fontSize = `${font}px`;
        const rows = buildOutlineGuides(visible);
        const items = rows.map((row, index) => {
          const item = list.createDiv({ cls: "unisastra-outline-item" });
          item.tabIndex = 0;
          const link = item.createDiv({ cls: "unisastra-outline-link" });
          const lead = link.createDiv({ cls: "unisastra-outline-lead" });
          const hasDisclosure = entries.some(
            (entry) => entry.ancestorIndices.at(-1) === row.index
          );
          renderOutlineGuides(lead, row, hasDisclosure);
          const node = lead.createDiv({ cls: "unisastra-outline-node" });
          node.createDiv({
            cls: hasDisclosure
              ? "unisastra-outline-disclosure"
              : "unisastra-outline-disclosure-spacer",
          });
          node.createDiv({ cls: "unisastra-outline-marker" });
          const text = link.createDiv({
            cls: "unisastra-outline-content markdown-rendered",
          });
          text.textContent = visible[index].title;
          return item;
        });
        items.forEach((_item, index) => {
          checkRow(items, rows, index);
        });
        checkTrail(list, rows);
      }
    }
  }
  // Leave a full tree visible in the captured preview.
  list.replaceChildren();
  const rows = buildOutlineGuides(entries);
  for (const [index, row] of rows.entries()) {
    const item = list.createDiv({ cls: "unisastra-outline-item" });
    const link = item.createDiv({ cls: "unisastra-outline-link" });
    const lead = link.createDiv({ cls: "unisastra-outline-lead" });
    renderOutlineGuides(lead, row);
    const node = lead.createDiv({ cls: "unisastra-outline-node" });
    node.createDiv({
      cls: row.hasChildren
        ? "unisastra-outline-disclosure"
        : "unisastra-outline-disclosure-spacer",
    });
    node.createDiv({ cls: "unisastra-outline-marker" });
    link.createDiv({ cls: "unisastra-outline-content" }).textContent =
      entries[index].title;
  }
  applyOutlineTrail(list, getOutlineTrail(rows, 5), "is-hover-connector");
  return { checks, failures };
}

Object.assign(window, { runOutlineRegression });
