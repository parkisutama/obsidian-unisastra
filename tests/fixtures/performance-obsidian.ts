export class Component {
  children = new Set<Component>();
  addChild<T extends Component>(child: T): T {
    this.children.add(child);
    return child;
  }
  removeChild<T extends Component>(child: T): T {
    this.children.delete(child);
    child.unload();
    return child;
  }
  unload() {
    for (const child of this.children) {
      child.unload();
    }
    this.children.clear();
  }
  registerEvent() {
    /* Event ownership is supplied by the fixture. */
  }
}
export class ItemView extends Component {
  contentEl = document.createElement("div");
  app;
  constructor(leaf: { app: unknown }) {
    super();
    this.app = leaf.app;
  }
}
export class MarkdownView {}
export const Platform = { isMobile: false };
export class Notice {}
export function setIcon() {
  /* Icons do not affect render lifecycle. */
}
export const editorInfoField = "info";
export const editorLivePreviewField = "preview";
export let renderCount = 0;
export let deferred = false;
export const pending: (() => void)[] = [];
export function deferRendering(value: boolean) {
  deferred = value;
}
export const MarkdownRenderer = {
  async render(_app: unknown, markdown: string, element: HTMLElement) {
    renderCount += 1;
    if (deferred) {
      await new Promise<void>((resolve) => pending.push(resolve));
    }
    element.textContent = markdown;
  },
};
