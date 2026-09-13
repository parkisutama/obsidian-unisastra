import { type Component, Notice, Setting, SettingGroup } from "obsidian";
import {
  BUILTIN_LABEL_BY_ID,
  canonicalBuiltinCalloutId,
  githubAlertMarkersForCanonicalId,
} from "@/capabilities/features/callouts/catalog";
import {
  type CalloutEntrySettings,
  CUSTOM_ID_PATTERN,
} from "@/capabilities/features/callouts/settings";
import type TypewriterModeLib from "@/lib";
import { renderCalloutDiscovery } from "./callout-discovery";
import { bindCalloutExpansion } from "./callout-expansion";
import { renderCalloutStyleEditor } from "./callout-style-editor";

/**
 * Describes what a callout entry is compatible with, for the settings UI
 * only — the toolbar itself has no output-mode choice, it always emits an
 * uppercase marker (see markdown.ts). Custom IDs are never GitHub-compatible
 * since GitHub Alerts only recognize five fixed keywords.
 */
function compatibilityDescription(entry: CalloutEntrySettings): string {
  const base = entry.source === "builtin" ? "Built-in" : "Custom";
  const markers = githubAlertMarkersForCanonicalId(entry.id);
  if (markers.length === 0) {
    return `${base} · Obsidian only`;
  }
  return `${base} · Also GitHub alerts compatible (${markers.join(" or ")})`;
}

function saveAndRerender(tm: TypewriterModeLib, rerender: () => void): void {
  tm.saveSettings()
    .catch((error) => {
      console.error("Failed to save settings:", error);
    })
    .finally(rerender);
}

export function moveEntry(
  entries: CalloutEntrySettings[],
  index: number,
  delta: number
): void {
  const targetIndex = index + delta;
  if (targetIndex < 0 || targetIndex >= entries.length) {
    return;
  }
  const current = entries[index] as { order: number };
  const target = entries[targetIndex] as { order: number };
  const swap = current.order;
  current.order = target.order;
  target.order = swap;
  entries.sort((a, b) => a.order - b.order);
}

export function renderCalloutManager(
  container: HTMLElement,
  tm: TypewriterModeLib,
  rerender: () => void,
  component: Component
): void {
  const entries = tm.settings.callouts.entries;
  container.createEl("p", {
    text: "Custom styles require this plugin to remain enabled. They do not automatically travel to GitHub or published sites. Preview uses Obsidian callouts in the current theme. The toolbar always inserts an uppercase marker, which Obsidian reads case-insensitively and GitHub alerts require; compatibility for each type is noted below.",
  });

  renderCalloutDiscovery(container, tm, component, rerender);

  for (const [index, entry] of entries.entries()) {
    const panel = container.createDiv({
      cls: "ptm-callout-manager-entry",
    });
    const group = new SettingGroup(panel);
    const header = group.listEl.createDiv({
      cls: "ptm-callout-manager-header",
    });
    const preview = header.createDiv({
      cls: "ptm-callout-style-preview markdown-rendered",
    });
    const setting = new Setting(header)
      .setName(`ID: ${entry.id}`)
      .setDesc(compatibilityDescription(entry));

    setting.addExtraButton((button) =>
      button
        .setIcon("arrow-up")
        .setTooltip("Move up")
        .setDisabled(index === 0)
        .onClick(() => {
          moveEntry(entries, index, -1);
          saveAndRerender(tm, rerender);
        })
    );
    setting.addExtraButton((button) =>
      button
        .setIcon("arrow-down")
        .setTooltip("Move down")
        .setDisabled(index === entries.length - 1)
        .onClick(() => {
          moveEntry(entries, index, 1);
          saveAndRerender(tm, rerender);
        })
    );
    setting.addToggle((toggle) =>
      toggle
        .setTooltip(
          entry.enabled
            ? "Hide from the callout menu"
            : "Show in the callout menu"
        )
        .setValue(entry.enabled)
        .onChange((value) => {
          (entry as { enabled: boolean }).enabled = value;
          saveAndRerender(tm, rerender);
        })
    );
    setting.addExtraButton((button) =>
      button
        .setIcon("rotate-ccw")
        .setTooltip("Reset callout style and built-in label")
        .onClick(() => {
          (entry as { styling: CalloutEntrySettings["styling"] }).styling = {
            mode: "inherit",
          };
          if (entry.source === "builtin") {
            (entry as { label: string }).label =
              BUILTIN_LABEL_BY_ID.get(entry.id) ?? entry.label;
          }
          saveAndRerender(tm, rerender);
        })
    );
    if (entry.source === "custom") {
      setting.addExtraButton((button) =>
        button
          .setIcon("trash")
          .setTooltip("Delete custom callout")
          .onClick(() => {
            const deleteIndex = entries.indexOf(entry);
            if (deleteIndex >= 0) {
              entries.splice(deleteIndex, 1);
            }
            saveAndRerender(tm, rerender);
          })
      );
    }
    const configuration = group.listEl.createDiv({
      cls: "ptm-callout-configuration",
    });
    bindCalloutExpansion(preview, configuration, entry.label, component);
    renderCalloutStyleEditor(configuration, entry, tm, component, preview);
  }

  let newId = "";
  let newLabel = "";
  new Setting(container)
    .setName("Add custom callout")
    .setDesc(
      "ID: lowercase letters, numbers, underscore, or hyphen (max 64 characters)."
    )
    .addText((text) => {
      text.setPlaceholder("Custom-id").onChange((value) => {
        newId = value;
      });
    })
    .addText((text) => {
      text.setPlaceholder("Label").onChange((value) => {
        newLabel = value;
      });
    })
    .addButton((button) =>
      button.setButtonText("Add").onClick(() => {
        const id = newId.trim().toLowerCase();
        if (!CUSTOM_ID_PATTERN.test(id)) {
          new Notice(
            "Invalid callout ID. Use lowercase letters, numbers, underscore, or hyphen."
          );
          return;
        }
        if (canonicalBuiltinCalloutId(id) || entries.some((e) => e.id === id)) {
          new Notice("That callout ID is already used.");
          return;
        }
        entries.push({
          id,
          label: newLabel.trim() || id,
          enabled: true,
          order: entries.length,
          source: "custom",
          styling: { mode: "inherit" },
        });
        saveAndRerender(tm, rerender);
      })
    );
}
