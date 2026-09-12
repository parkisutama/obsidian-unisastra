import type { EditorView } from "@codemirror/view";
import type { ToolbarAction } from "@/capabilities/features/toolbar/actions";
import type {
  SurfaceFactory,
  ToolbarSurface,
} from "@/capabilities/features/toolbar/controller";

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
];

const MARGIN_PX = 8;

export const createFloatyToolbarSurface: SurfaceFactory = (
  doc,
  execute
): ToolbarSurface => {
  const el = doc.createElement("div");
  el.className = "ptm-floaty-toolbar";
  el.setAttribute("role", "toolbar");
  el.setAttribute("aria-label", "Formatting toolbar");
  el.hidden = true;

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

  doc.body.appendChild(el);

  return {
    destroy() {
      el.remove();
    },
    update(view: EditorView | null) {
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
