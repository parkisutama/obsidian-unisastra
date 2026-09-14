import {
  type ColorComponent,
  Component,
  MarkdownRenderer,
  Setting,
  setIcon,
} from "obsidian";
import { effectiveCalloutValues } from "@/capabilities/features/callouts/appearance";
import { compatibilityLabel } from "@/capabilities/features/callouts/catalog";
import type {
  CalloutEntrySettings,
  CalloutStyling,
} from "@/capabilities/features/callouts/settings";
import {
  calloutStyleProperties,
  validateCalloutOverride,
} from "@/capabilities/features/callouts/styles";
import type TypewriterModeLib from "@/lib";
import { createColorPickerBinding } from "./callout-color-binding";
import { CalloutIconPicker } from "./callout-icon-picker";

export interface CalloutStyleEditor {
  /** Validates the current draft and saves it, same as clicking Save style. */
  save: () => Promise<boolean>;
}

export function renderCalloutStyleEditor(
  container: HTMLElement,
  entry: CalloutEntrySettings,
  tm: TypewriterModeLib,
  component: Component,
  preview: HTMLElement
): CalloutStyleEditor {
  const details = container;
  const status = details.createDiv({ cls: "ptm-callout-style-status" });
  status.setAttribute("role", "status");
  let color =
    entry.styling.mode === "override" ? (entry.styling.color ?? "") : "";
  let icon =
    entry.styling.mode === "override" ? (entry.styling.icon ?? "") : "";
  let mode = entry.styling.mode;
  let modeSelect: HTMLSelectElement;
  let colorInput: HTMLInputElement;
  let iconInput: HTMLInputElement;
  let colorPicker: ColorComponent;
  let picker: CalloutIconPicker | null = null;
  const syncEffectiveAppearance = (callout: HTMLElement) => {
    const computed =
      callout.ownerDocument.defaultView?.getComputedStyle(callout);
    if (!computed) {
      return;
    }
    const iconEl = callout.querySelector<HTMLElement>(".callout-icon");
    const renderedColor = iconEl
      ? (callout.ownerDocument.defaultView?.getComputedStyle(iconEl).color ??
        "")
      : "";
    const effective = effectiveCalloutValues(
      computed.getPropertyValue("--callout-color"),
      computed.getPropertyValue("--callout-icon"),
      renderedColor
    );
    if (iconEl && effective.icon) {
      setIcon(iconEl, effective.icon);
    }
    if (!color && effective.color) {
      colorInput.value = effective.color;
      colorBinding.setValue(colorPicker, effective.color);
    }
    if (!icon && effective.icon) {
      iconInput.value = effective.icon;
    }
  };
  const updateDraft = () => {
    const styling =
      mode === "inherit"
        ? ({ mode: "inherit" } as const)
        : validateCalloutOverride(color, icon);
    if (!styling) {
      status.setText(
        "Invalid style. Use a valid hex color and an available lucide icon ID."
      );
      return;
    }
    const callout = preview.querySelector<HTMLElement>(".callout");
    if (callout) {
      callout.style.removeProperty("--callout-color");
      callout.style.removeProperty("--callout-icon");
      for (const [key, value] of Object.entries(
        calloutStyleProperties(styling)
      )) {
        callout.style.setProperty(key, value);
      }
      syncEffectiveAppearance(callout);
    }
  };
  let renderVersion = 0;
  let disposed = false;
  let previewComponent: Component | null = null;
  component.register(() => {
    disposed = true;
    renderVersion++;
    preview.replaceChildren();
    picker?.close();
  });
  const renderPreview = async () => {
    if (disposed) {
      return;
    }
    const version = ++renderVersion;
    if (previewComponent) {
      component.removeChild(previewComponent);
    }
    previewComponent = component.addChild(new Component());
    const result = details.ownerDocument.createElement("div");
    try {
      await MarkdownRenderer.render(
        tm.plugin.app,
        `> [!${entry.id}]\n> ${compatibilityLabel(entry.id)}`,
        result,
        "",
        previewComponent
      );
      if (version === renderVersion && details.isConnected) {
        const title = result.querySelector<HTMLElement>(".callout-title-inner");
        if (title) {
          title.setText(entry.label);
        }
        preview.replaceChildren(result);
        updateDraft();
      }
    } catch (error) {
      console.error("Failed to render callout preview:", error);
      if (version === renderVersion && details.isConnected) {
        status.setText("Unable to render preview.");
      }
    }
  };
  let saving = false;
  const save = async (styling: CalloutStyling) => {
    if (saving || disposed) {
      return false;
    }
    saving = true;
    const previous = entry.styling;
    (entry as { styling: CalloutStyling }).styling = styling;
    status.setText("Saving style…");
    try {
      await tm.saveSettings();
      if (!disposed) {
        status.setText("Style saved.");
        await renderPreview();
      }
      return true;
    } catch (error) {
      (entry as { styling: CalloutStyling }).styling = previous;
      console.error("Failed to save callout style:", error);
      if (!disposed) {
        status.setText("Unable to save style. Try again.");
      }
      return false;
    } finally {
      saving = false;
    }
  };
  const colorBinding = createColorPickerBinding((value) => {
    color = value;
    colorInput.value = value;
    mode = "override";
    modeSelect.value = mode;
    updateDraft();
    status.setText("Unsaved changes. Choose save style to apply.");
  });
  new Setting(details)
    .setName("Style mode")
    .setDesc("Inherit the theme, or override selected values.")
    .addDropdown((dropdown) => {
      modeSelect = dropdown.selectEl;
      dropdown
        .addOption("inherit", "Inherit")
        .addOption("override", "Override")
        .setValue(mode)
        .onChange((value) => {
          mode = value === "override" ? "override" : "inherit";
          updateDraft();
          status.setText("Unsaved changes. Choose save style to apply.");
        });
      dropdown.selectEl.setAttribute(
        "aria-label",
        `Style mode for ${entry.label}`
      );
    });
  const colorSetting = new Setting(details)
    .setName("Color")
    .setDesc("Hex color with 3 or 6 digits. Leave blank to inherit.")
    .addText((text) => {
      colorInput = text.inputEl;
      text
        .setPlaceholder("#Aabbcc")
        .setValue(color)
        .onChange((value) => {
          color = value;
          if (validateCalloutOverride(color, "") && color) {
            colorBinding.setValue(colorPicker, color);
          }
          mode = "override";
          modeSelect.value = mode;
          updateDraft();
          status.setText("Unsaved changes. Choose save style to apply.");
        });
      text.inputEl.setAttribute("aria-label", `Color for ${entry.label}`);
    });
  colorSetting.addColorPicker((control) => {
    colorPicker = control;
    colorBinding.setValue(control, color || "#000000");
    control.onChange(colorBinding.onChange);
  });
  new Setting(details)
    .setName("Icon")
    .setDesc(
      "Use an available lucide icon ID, such as lucide-pencil. Leave blank to inherit."
    )
    .addText((text) => {
      iconInput = text.inputEl;
      text
        .setPlaceholder("Icon ID")
        .setValue(icon)
        .onChange((value) => {
          icon = value;
          mode = "override";
          modeSelect.value = mode;
          updateDraft();
          status.setText("Unsaved changes. Choose save style to apply.");
        });
      text.inputEl.setAttribute("aria-label", `Icon for ${entry.label}`);
    })
    .addExtraButton((button) =>
      button
        .setIcon("image-plus")
        .setTooltip("Choose icon")
        .onClick(() => {
          picker?.close();
          picker = new CalloutIconPicker(tm.plugin.app, (id) => {
            if (disposed) {
              return;
            }
            icon = id;
            iconInput.value = id;
            mode = "override";
            modeSelect.value = mode;
            updateDraft();
            status.setText("Unsaved changes. Choose save style to apply.");
          });
          picker.open();
        })
    );
  renderPreview().catch((error: unknown) => {
    console.error("Failed to initialize callout preview:", error);
  });

  return {
    save: () => {
      const styling =
        mode === "inherit"
          ? ({ mode: "inherit" } as const)
          : validateCalloutOverride(color, icon);
      if (!styling) {
        status.setText(
          "Invalid style. Use a 3 or 6 digit hex color and an available lucide icon ID."
        );
        return Promise.resolve(false);
      }
      return save(styling);
    },
  };
}
