import { type Component, Notice, Setting } from "obsidian";
import { canonicalBuiltinCalloutId } from "@/capabilities/features/callouts/catalog";
import { discoverCallouts } from "@/capabilities/features/callouts/discovery";
import type TypewriterModeLib from "@/lib";

async function saveCandidate(
  tm: TypewriterModeLib,
  id: string
): Promise<boolean> {
  const entries = tm.settings.callouts.entries;
  const entry = {
    id,
    label: id,
    enabled: true,
    order: entries.reduce((max, item) => Math.max(max, item.order), -1) + 1,
    source: "custom" as const,
    styling: { mode: "inherit" as const },
  };
  entries.push(entry);
  try {
    await tm.saveSettings();
    return true;
  } catch (error) {
    const index = entries.indexOf(entry);
    if (index >= 0) {
      entries.splice(index, 1);
    }
    console.error("Failed to save discovered callout:", error);
    new Notice("Could not save the callout. Please try again.");
    return false;
  }
}

export function renderCalloutDiscovery(
  container: HTMLElement,
  tm: TypewriterModeLib,
  component: Component,
  rerender: () => void
): void {
  let disposed = false;
  let saving = false;
  const results = container.createDiv();
  const refresh = (): void => {
    if (disposed || saving) {
      return;
    }
    results.empty();
    const scan = discoverCallouts(
      container.ownerDocument.styleSheets as unknown as Parameters<
        typeof discoverCallouts
      >[0]
    );
    const entries = tm.settings.callouts.entries;
    const candidates = scan.candidates.filter(
      ({ id }) =>
        !(
          canonicalBuiltinCalloutId(id) ||
          entries.some((entry) => entry.id === id)
        )
    );
    results.createEl("p", {
      text: `${scan.partial ? "Partial scan: some CSS rules could not be read." : "CSS scan complete."} ${candidates.length} new candidates. Conditional selectors may not apply in the current theme. Use a manual ID if missing.`,
    });
    for (const candidate of candidates) {
      new Setting(results)
        .setName(candidate.id)
        .setDesc(candidate.sources.join(", "))
        .addButton((button) =>
          button.setButtonText("Add").onClick(async () => {
            if (saving || disposed) {
              return;
            }
            const current = tm.settings.callouts.entries;
            if (current.some((entry) => entry.id === candidate.id)) {
              refresh();
              return;
            }
            saving = true;
            button.setDisabled(true);
            const saved = await saveCandidate(tm, candidate.id);
            saving = false;
            if (saved && !disposed) {
              rerender();
            }
            refresh();
          })
        );
    }
  };
  new Setting(container)
    .setName("Discover callouts from CSS")
    .setDesc("Best effort discovery. Choose add to save a candidate.")
    .addExtraButton((button) =>
      button
        .setIcon("refresh-cw")
        .setTooltip("Refresh callout candidates")
        .onClick(refresh)
    );
  component.register(() => {
    disposed = true;
  });
  component.registerEvent(tm.plugin.app.workspace.on("css-change", refresh));
  refresh();
}
