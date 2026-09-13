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
  dividerAfter?: boolean;
  icon: string;
  title: string;
}> = [
  { action: { kind: "bold" }, icon: "bold", title: "Bold" },
  {
    action: { kind: "italic" },
    icon: "italic",
    title: "Italic",
    dividerAfter: true,
  },
  {
    action: { kind: "strikethrough" },
    icon: "strikethrough",
    title: "Strikethrough",
  },
  {
    action: { kind: "code" },
    icon: "code",
    title: "Code",
    dividerAfter: true,
  },
  { action: { kind: "highlight" }, icon: "highlighter", title: "Highlight" },
  { action: { kind: "link" }, icon: "link", title: "Insert or remove link" },
];

const HEADING_OPTIONS: ReadonlyArray<{
  full: string;
  level: 0 | 1 | 2 | 3 | 4;
  short: string;
}> = [
  { level: 0, short: "P", full: "Paragraph" },
  { level: 1, short: "H1", full: "Heading 1" },
  { level: 2, short: "H2", full: "Heading 2" },
  { level: 3, short: "H3", full: "Heading 3" },
  { level: 4, short: "H4", full: "Heading 4" },
];

const MARGIN_PX = 8;

const DOCK_CLASS = "ptm-floaty-toolbar-dock";

export function dockBottomOffsetPx(statusBarHeight: number): number {
  return statusBarHeight > 0 ? statusBarHeight + MARGIN_PX : MARGIN_PX;
}

function createDivider(doc: Document): HTMLElement {
  const divider = doc.createElement("div");
  divider.className = "ptm-floaty-toolbar-divider";
  return divider;
}

interface DropdownItem {
  label: string;
  onSelect: () => void;
}

function attachDropdown(
  doc: Document,
  trigger: HTMLElement,
  getItems: () => DropdownItem[],
  getMode: () => "dock" | "floating",
  isDisabled: () => boolean
): { close: () => void } {
  let panel: HTMLElement | null = null;

  function close(): void {
    panel?.remove();
    panel = null;
    trigger.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  }

  function open(): void {
    close();
    const items = getItems();
    if (items.length === 0) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    panel = doc.createElement("div");
    panel.className = "ptm-floaty-toolbar-dropdown-panel";
    panel.setAttribute("role", "listbox");
    for (const item of items) {
      const row = doc.createElement("div");
      row.className = "ptm-floaty-toolbar-dropdown-item";
      row.setAttribute("role", "option");
      row.tabIndex = 0;
      row.textContent = item.label;
      const activate = () => {
        item.onSelect();
        close();
      };
      row.addEventListener("click", activate);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
      panel.appendChild(row);
    }
    doc.body.appendChild(panel);
    const win = doc.defaultView;
    const panelRect = panel.getBoundingClientRect();
    const maxLeft =
      (win?.innerWidth ?? panelRect.right) - panelRect.width - MARGIN_PX;
    const left = Math.max(MARGIN_PX, Math.min(rect.left, maxLeft));
    panel.style.left = `${left}px`;
    panel.style.top =
      getMode() === "dock"
        ? `${Math.max(MARGIN_PX, rect.top - panelRect.height - 4)}px`
        : `${rect.bottom + 4}px`;
    trigger.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    const onOutside = (event: MouseEvent) => {
      if (
        panel &&
        !panel.contains(event.target as Node) &&
        event.target !== trigger
      ) {
        close();
        doc.removeEventListener("mousedown", onOutside, true);
      }
    };
    doc.addEventListener("mousedown", onOutside, true);
  }

  trigger.setAttribute("role", "button");
  trigger.tabIndex = 0;
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    if (isDisabled()) {
      return;
    }
    if (panel) {
      close();
    } else {
      open();
    }
  });
  trigger.addEventListener("keydown", (event) => {
    if (isDisabled()) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (panel) {
        close();
      } else {
        open();
      }
    } else if (event.key === "Escape") {
      close();
    }
  });

  return { close };
}

export const createFloatyToolbarSurface: SurfaceFactory = (
  doc,
  execute,
  reportDockEvent,
  resetSession,
  openCalloutManager,
  togglePin
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

  let currentMode: "dock" | "floating" = "floating";

  for (const { action, icon, title, dividerAfter } of TOOLBAR_BUTTONS) {
    const button = doc.createElement("div");
    button.className = "ptm-floaty-toolbar-button";
    button.setAttribute("role", "button");
    button.tabIndex = 0;
    setIcon(button, icon);
    button.title = title;
    button.setAttribute("aria-label", title);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      execute(action);
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        execute(action);
      }
    });
    el.appendChild(button);
    if (dividerAfter) {
      el.appendChild(createDivider(doc));
    }
  }

  const headingTrigger = doc.createElement("div");
  headingTrigger.className = "ptm-floaty-toolbar-dropdown-trigger";
  headingTrigger.setAttribute("aria-label", "Heading level");
  const headingLabel = doc.createElement("span");
  headingLabel.textContent = "P";
  headingTrigger.appendChild(headingLabel);
  const headingChevron = doc.createElement("span");
  headingChevron.className = "ptm-floaty-toolbar-chevron";
  setIcon(headingChevron, "chevron-down");
  headingTrigger.appendChild(headingChevron);
  let headingDisabled = false;
  const headingDropdown = attachDropdown(
    doc,
    headingTrigger,
    () =>
      HEADING_OPTIONS.map((option) => ({
        label: option.full,
        onSelect: () => execute({ kind: "heading", level: option.level }),
      })),
    () => currentMode,
    () => headingDisabled
  );
  el.appendChild(headingTrigger);

  const calloutTrigger = doc.createElement("div");
  calloutTrigger.className =
    "ptm-floaty-toolbar-dropdown-trigger ptm-floaty-toolbar-callout-trigger";
  calloutTrigger.setAttribute("aria-label", "Insert callout");
  calloutTrigger.title = "Insert callout";
  const calloutIcon = doc.createElement("span");
  setIcon(calloutIcon, "quote");
  calloutTrigger.appendChild(calloutIcon);
  const calloutChevron = doc.createElement("span");
  calloutChevron.className = "ptm-floaty-toolbar-chevron";
  setIcon(calloutChevron, "chevron-down");
  calloutTrigger.appendChild(calloutChevron);
  let latestCalloutOptions: readonly ToolbarCalloutOption[] = [];
  const calloutDropdown = attachDropdown(
    doc,
    calloutTrigger,
    () => [
      ...latestCalloutOptions.map((option) => ({
        label: option.label,
        onSelect: () => execute({ kind: "callout", id: option.id }),
      })),
      { label: "Manage callouts…", onSelect: () => openCalloutManager() },
    ],
    () => currentMode,
    () => false
  );
  el.appendChild(calloutTrigger);
  el.appendChild(createDivider(doc));

  const pinButton = doc.createElement("div");
  pinButton.className = "ptm-floaty-toolbar-pin-btn";
  pinButton.setAttribute("role", "button");
  pinButton.tabIndex = 0;
  pinButton.title = "Pin toolbar as a dock";
  pinButton.setAttribute("aria-label", "Pin toolbar as a dock");
  setIcon(pinButton, "pin");
  pinButton.addEventListener("click", (event) => {
    event.preventDefault();
    togglePin();
  });
  pinButton.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePin();
    }
  });
  el.appendChild(pinButton);

  const hud = createHudElement(doc, resetSession);
  el.appendChild(hud.element);

  doc.body.appendChild(el);

  return {
    destroy() {
      headingDropdown.close();
      calloutDropdown.close();
      el.remove();
    },
    update(view, settings, dockVisible, elapsed, calloutOptions) {
      currentMode = settings.mode;
      latestCalloutOptions = calloutOptions;
      pinButton.classList.toggle("is-pinned", settings.mode === "dock");
      if (view) {
        const line = view.state.doc.lineAt(view.state.selection.main.head);
        const level = detectHeadingLevel(line.text);
        headingDisabled = level === -1;
        headingTrigger.classList.toggle("is-disabled", headingDisabled);
        if (!headingDisabled) {
          const option = HEADING_OPTIONS.find((entry) => entry.level === level);
          headingLabel.textContent = option?.short ?? "P";
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
        if (!view) {
          headingDropdown.close();
          calloutDropdown.close();
        }
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
        headingDropdown.close();
        calloutDropdown.close();
        el.hidden = true;
        return;
      }
      el.hidden = false;
      el.style.top = `${Math.max(coords.top - el.offsetHeight - MARGIN_PX, MARGIN_PX)}px`;
      el.style.left = `${Math.max(coords.left - el.offsetWidth / 2, MARGIN_PX)}px`;
    },
  };
};
