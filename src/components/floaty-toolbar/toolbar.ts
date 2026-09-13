import { setIcon } from "obsidian";
import type { ToolbarAction } from "@/capabilities/features/toolbar/actions";
import { detectHeadingLevel } from "@/capabilities/features/toolbar/actions";
import type {
  SurfaceFactory,
  ToolbarCalloutOption,
  ToolbarSurface,
} from "@/capabilities/features/toolbar/controller";
import { hudSegments } from "@/capabilities/features/toolbar/hud";
import { createHudElement } from "./hud";

const TOOLBAR_BUTTONS: ReadonlyArray<{
  action: ToolbarAction;
  icon: string;
  title: string;
}> = [
  { action: { kind: "bold" }, icon: "bold", title: "Bold" },
  { action: { kind: "italic" }, icon: "italic", title: "Italic" },
  {
    action: { kind: "strikethrough" },
    icon: "strikethrough",
    title: "Strikethrough",
  },
  { action: { kind: "code" }, icon: "code", title: "Code" },
  { action: { kind: "highlight" }, icon: "highlighter", title: "Highlight" },
  { action: { kind: "link" }, icon: "link", title: "Insert or remove link" },
];

const HEADING_OPTIONS: ReadonlyArray<{
  label: string;
  level: 0 | 1 | 2 | 3 | 4;
  title: string;
}> = [
  { level: 0, label: "P", title: "Paragraph" },
  { level: 1, label: "H1", title: "Heading 1" },
  { level: 2, label: "H2", title: "Heading 2" },
  { level: 3, label: "H3", title: "Heading 3" },
  { level: 4, label: "H4", title: "Heading 4" },
];

const MARGIN_PX = 8;

const DOCK_CLASS = "ptm-floaty-toolbar-dock";

export function dockBottomOffsetPx(statusBarHeight: number): number {
  return statusBarHeight > 0 ? statusBarHeight + MARGIN_PX : MARGIN_PX;
}

function calloutOptionsSignature(
  options: readonly ToolbarCalloutOption[]
): string {
  return options.map((option) => `${option.id}:${option.label}`).join("|");
}
const MANAGE_CALLOUTS_VALUE = "__manage-callouts__";

function renderCalloutOptions(
  doc: Document,
  select: HTMLSelectElement,
  options: readonly ToolbarCalloutOption[]
): void {
  select.replaceChildren();
  const placeholder = doc.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "❝";
  placeholder.title = "Insert callout";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);
  for (const option of options) {
    const entry = doc.createElement("option");
    entry.value = option.id;
    entry.textContent = option.label;
    select.appendChild(entry);
  }
  const manage = doc.createElement("option");
  manage.value = MANAGE_CALLOUTS_VALUE;
  manage.textContent = "Manage callouts…";
  select.appendChild(manage);
}

export const createFloatyToolbarSurface: SurfaceFactory = (
  doc,
  execute,
  reportDockEvent,
  resetSession,
  openCalloutManager
): ToolbarSurface => {
  const el = doc.createElement("div");
  el.className = "ptm-floaty-toolbar";
  el.setAttribute("role", "toolbar");
  el.setAttribute("aria-label", "Formatting toolbar");
  el.hidden = true;
  el.addEventListener("mouseenter", () => reportDockEvent("reveal"));
  el.addEventListener("mouseleave", () => reportDockEvent("leave"));
  el.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      reportDockEvent("leave");
    }
  });

  for (const { action, icon, title } of TOOLBAR_BUTTONS) {
    const button = doc.createElement("button");
    button.type = "button";
    button.className = "ptm-floaty-toolbar-button";
    setIcon(button, icon);
    button.title = title;
    button.setAttribute("aria-label", title);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      execute(action);
    });
    el.appendChild(button);
  }

  const headingSelect = doc.createElement("select");
  headingSelect.className = "ptm-floaty-toolbar-heading-select";
  headingSelect.setAttribute("aria-label", "Heading level");
  headingSelect.title = "Heading level";
  for (const option of HEADING_OPTIONS) {
    const entry = doc.createElement("option");
    entry.value = String(option.level);
    entry.textContent = option.label;
    entry.title = option.title;
    headingSelect.appendChild(entry);
  }
  headingSelect.addEventListener("change", () => {
    const level = Number(headingSelect.value) as 0 | 1 | 2 | 3 | 4;
    execute({ kind: "heading", level });
  });
  el.appendChild(headingSelect);

  const calloutSelect = doc.createElement("select");
  calloutSelect.className = "ptm-floaty-toolbar-callout-select";
  calloutSelect.setAttribute("aria-label", "Insert callout");
  calloutSelect.title = "Insert callout";
  calloutSelect.addEventListener("change", () => {
    const value = calloutSelect.value;
    calloutSelect.value = "";
    if (value === MANAGE_CALLOUTS_VALUE) {
      openCalloutManager();
    } else if (value) {
      execute({ kind: "callout", id: value });
    }
  });
  el.appendChild(calloutSelect);
  let calloutSignature = "";

  const hud = createHudElement(doc, resetSession);
  el.appendChild(hud.element);

  doc.body.appendChild(el);

  return {
    destroy() {
      el.remove();
    },
    update(view, settings, dockVisible, elapsed, calloutOptions) {
      const signature = calloutOptionsSignature(calloutOptions);
      if (signature !== calloutSignature) {
        calloutSignature = signature;
        renderCalloutOptions(doc, calloutSelect, calloutOptions);
      }
      if (view) {
        const line = view.state.doc.lineAt(view.state.selection.main.head);
        const level = detectHeadingLevel(line.text);
        headingSelect.disabled = level === -1;
        if (level !== -1) {
          headingSelect.value = String(level);
        }
      }
      if (settings.mode === "dock") {
        el.classList.add(DOCK_CLASS);
        el.style.removeProperty("top");
        el.style.removeProperty("left");
        const statusBarHeight =
          doc.querySelector(".status-bar")?.getBoundingClientRect().height ?? 0;
        el.style.bottom = `${dockBottomOffsetPx(statusBarHeight)}px`;
        hud.update(
          hudSegments(settings.timers, elapsed.sessionMs, elapsed.fileMs)
        );
        el.hidden = !view;
        el.classList.toggle("ptm-floaty-toolbar-dock-peek", !dockVisible);
        return;
      }
      el.classList.remove(DOCK_CLASS, "ptm-floaty-toolbar-dock-peek");
      el.style.removeProperty("bottom");
      hud.update([]);
      const range = view?.state.selection.main;
      const coords =
        range && !range.empty ? view?.coordsAtPos(range.head) : null;
      if (!coords) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      el.style.top = `${Math.max(coords.top - el.offsetHeight - MARGIN_PX, MARGIN_PX)}px`;
      el.style.left = `${Math.max(coords.left - el.offsetWidth / 2, MARGIN_PX)}px`;
    },
  };
};
