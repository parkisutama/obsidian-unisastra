import {
  type App,
  FuzzySuggestModal,
  getIcon,
  getIconIds,
  setIcon,
} from "obsidian";

export function availableLucideIds(
  ids: readonly string[],
  available: (id: string) => boolean
): string[] {
  return [
    ...new Set(
      ids.map((id) => (id.startsWith("lucide-") ? id : `lucide-${id}`))
    ),
  ]
    .filter(available)
    .sort();
}

export class CalloutIconPicker extends FuzzySuggestModal<string> {
  private readonly ids: string[];
  private readonly choose: (id: string) => void;
  constructor(app: App, choose: (id: string) => void) {
    super(app);
    this.choose = choose;
    this.ids = availableLucideIds(getIconIds(), (id) => getIcon(id) !== null);
    this.setPlaceholder("Search available icons");
  }
  getItems(): string[] {
    return this.ids;
  }
  getItemText(id: string): string {
    return id;
  }
  override renderSuggestion(item: { item: string }, el: HTMLElement): void {
    const icon = el.createSpan({ cls: "ptm-callout-picker-icon" });
    setIcon(icon, item.item);
    el.createSpan({ text: item.item });
  }
  onChooseItem(id: string): void {
    this.choose(id);
  }
}
