import type { ToolbarAction } from "@/capabilities/features/toolbar/actions";
import type {
  SurfaceFactory,
  ToolbarSurface,
} from "@/capabilities/features/toolbar/controller";
import { hudSegments } from "@/capabilities/features/toolbar/hud";
import { createHudElement } from "./hud";

const TOOLBAR_BUTTONS: ReadonlyArray<{
  action: ToolbarAction;
  label: string;
  title: string;
}> = [
  { action: { kind: "bold" }, label: "B", title: "Bold" },
  { action: { kind: "italic" }, label: "I", title: "Italic" },
  { action: { kind: "strikethrough" }, label: "S", title: "Strikethrough" },
  { action: { kind: "code" }, label: "</>", title: "Code" },
  { action: { kind: "highlight" }, label: "H", title: "Highlight" },
  { action: { kind: "heading" }, label: "#", title: "Cycle heading level" },
  { action: { kind: "link" }, label: "Link", title: "Insert or remove link" },
];

const MARGIN_PX = 8;

const DOCK_CLASS = "ptm-floaty-toolbar-dock";

export function dockBottomOffsetPx(statusBarHeight: number): number {
  return statusBarHeight > 0 ? statusBarHeight + MARGIN_PX : MARGIN_PX;
}

export const createFloatyToolbarSurface: SurfaceFactory = (
  doc,
  execute,
  reportDockEvent,
  resetSession
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

  for (const { action, label, title } of TOOLBAR_BUTTONS) {
    const button = doc.createElement("button");
    button.type = "button";
    button.className = "ptm-floaty-toolbar-button";
    button.textContent = label;
    button.title = title;
    button.setAttribute("aria-label", title);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      execute(action);
    });
    el.appendChild(button);
  }

  const hud = createHudElement(doc, resetSession);
  el.appendChild(hud.element);

  doc.body.appendChild(el);

  return {
    destroy() {
      el.remove();
    },
    update(view, settings, dockVisible, elapsed) {
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
        el.hidden = !(view && dockVisible);
        return;
      }
      el.classList.remove(DOCK_CLASS);
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
