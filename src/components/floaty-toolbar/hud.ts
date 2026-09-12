import type { HudSegment } from "@/capabilities/features/toolbar/hud";

export interface HudElement {
  readonly element: HTMLElement;
  update(segments: HudSegment[]): void;
}
export function createHudElement(
  doc: Document,
  onResetSession: () => void
): HudElement {
  const el = doc.createElement("span");
  el.className = "ptm-floaty-toolbar-hud";
  el.hidden = true;
  return {
    element: el,
    update(segments) {
      el.replaceChildren();
      if (segments.length === 0) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      for (const [index, segment] of segments.entries()) {
        if (index > 0) {
          el.appendChild(doc.createTextNode(" · "));
        }
        if (segment.resettable) {
          const button = doc.createElement("button");
          button.type = "button";
          button.className = "ptm-floaty-toolbar-hud-reset";
          button.textContent = segment.label;
          button.title = segment.tooltip;
          button.setAttribute(
            "aria-label",
            `${segment.tooltip} Activate to reset.`
          );
          button.addEventListener("click", (event) => {
            event.preventDefault();
            onResetSession();
          });
          el.appendChild(button);
        } else {
          const span = doc.createElement("span");
          span.className = "ptm-floaty-toolbar-hud-segment";
          span.textContent = segment.label;
          span.title = segment.tooltip;
          el.appendChild(span);
        }
      }
    },
  };
}
