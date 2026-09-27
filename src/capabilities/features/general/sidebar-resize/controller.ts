import {
  chooseSidebarTarget,
  constrainSidebarTarget,
  type SidebarBounds,
  type SidebarPair,
  type SidebarSide,
  type SidebarWidth,
  sidebarWidthMatches,
} from "./model";

interface SidebarGeometry extends SidebarWidth, SidebarBounds {
  rendered: number;
}

export interface SidebarSnapshot extends SidebarPair {
  identity: object;
  left: SidebarGeometry;
  right: SidebarGeometry;
  stable: boolean;
}

export type SidebarSignal =
  | { type: "geometry" | "layout" | "drag-end" }
  | { side: SidebarSide; type: "drag-start" };

export interface SidebarHost {
  cancelFrame(id: number): void;
  frame(callback: () => void): number;
  read(): SidebarSnapshot | null;
  save(): void;
  subscribe(callback: (event: SidebarSignal) => void): () => void;
  warn(): void;
  // Revalidate identity/visibility without another layout measurement.
  // The bounds come from this frame's snapshot. Return false when invalidated.
  write(side: SidebarSide, width: number, snapshot: SidebarSnapshot): boolean;
}

const SIDES: readonly SidebarSide[] = ["left", "right"];
const MAX_SETTLE_FRAMES = 30;

/** No Obsidian/DOM dependency: the host owns native measurements and writes. */
export class SidebarResizeController {
  private active = false;
  private generation = 0;
  private unsubscribe: (() => void) | null = null;
  private frameId: number | null = null;
  private previous: SidebarSnapshot | null = null;
  private dragging: SidebarSide | null = null;
  private endingDrag = false;
  private target: number | null = null;
  private attempts = 0;
  private settling = 0;
  private warned = false;

  private readonly host: SidebarHost;

  constructor(host: SidebarHost) {
    this.host = host;
  }

  start(): void {
    if (this.active) {
      return;
    }
    this.active = true;
    this.generation++;
    this.unsubscribe = this.host.subscribe((signal) => this.signal(signal));
    this.schedule();
  }

  stop(): void {
    this.active = false;
    this.generation++;
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (this.frameId !== null) {
      this.host.cancelFrame(this.frameId);
    }
    this.frameId = null;
    this.previous = null;
    this.dragging = null;
    this.endingDrag = false;
    this.target = null;
    this.attempts = 0;
    this.settling = 0;
    this.warned = false;
  }

  private signal(signal: SidebarSignal): void {
    if (!this.active) {
      return;
    }
    if (signal.type === "drag-start") {
      this.dragging = signal.side;
      this.endingDrag = false;
      this.attempts = 0;
    } else if (signal.type === "drag-end") {
      // Flush the native handler's final size before forgetting the source.
      this.endingDrag = true;
    }
    if (signal.type !== "geometry") {
      this.settling = 0;
    }
    this.schedule();
  }

  private schedule(): void {
    if (!this.active || this.frameId !== null) {
      return;
    }
    const generation = this.generation;
    this.frameId = this.host.frame(() => {
      if (!this.active || this.generation !== generation) {
        return;
      }
      this.frameId = null;
      this.flush();
      if (this.endingDrag) {
        this.dragging = null;
        this.endingDrag = false;
      }
    });
  }

  private warn(): void {
    if (!this.warned) {
      this.host.warn();
      this.warned = true;
    }
  }

  private flush(): void {
    const current = this.host.read();
    if (!current) {
      this.warn();
      return;
    }
    if (this.previous?.identity !== current.identity) {
      this.previous = null;
      this.target = null;
      this.attempts = 0;
    }
    if (!(current.left.open && current.right.open)) {
      this.previous = current;
      this.dragging = null;
      this.target = null;
      this.attempts = 0;
      this.settling = 0;
      return;
    }
    if (!current.stable) {
      if (++this.settling <= MAX_SETTLE_FRAMES) {
        this.schedule();
      }
      return;
    }
    this.settling = 0;
    const requested = chooseSidebarTarget(
      current,
      this.previous,
      this.dragging,
      this.target
    );
    const next =
      requested === null
        ? null
        : constrainSidebarTarget(requested, current.left, current.right);
    const boundsChanged =
      this.previous !== null &&
      SIDES.some(
        (side) =>
          current[side].min !== this.previous?.[side].min ||
          current[side].max !== this.previous?.[side].max
      );
    this.previous = current;
    if (next === null) {
      this.warn();
      return;
    }
    if (next !== this.target || boundsChanged) {
      this.target = next;
      this.attempts = 0;
    }
    this.applyTarget(current, next);
  }

  private applyTarget(current: SidebarSnapshot, next: number): void {
    const unequal = !sidebarWidthMatches(
      current.left.rendered,
      current.right.rendered
    );
    const needsWrite = SIDES.filter(
      (side) =>
        !(
          sidebarWidthMatches(current[side].rendered, next) &&
          sidebarWidthMatches(current[side].width, next)
        )
    );
    // Each side may be within tolerance of the target but >0.5px apart.
    // Only that case requires writing both already-near-target sides.
    if (!needsWrite.length && unequal) {
      needsWrite.push(...SIDES);
    }
    if (!needsWrite.length) {
      this.warned = false;
      return;
    }
    if (this.attempts >= 2) {
      this.warn();
      return;
    }
    this.attempts++;
    let changed = false;
    for (const side of needsWrite) {
      if (!(this.active && this.host.write(side, next, current))) {
        break;
      }
      changed = true;
    }
    if (changed) {
      this.host.save();
      this.schedule();
    }
  }
}
