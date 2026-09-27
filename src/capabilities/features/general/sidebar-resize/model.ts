export type SidebarSide = "left" | "right";

export interface SidebarWidth {
  open: boolean;
  width: number;
}

export interface SidebarPair {
  left: SidebarWidth;
  right: SidebarWidth;
}

export interface SidebarBounds {
  max: number;
  min: number;
}

export const SIDEBAR_WIDTH_TOLERANCE = 0.5;

/** Reserve the native 20% remainder for the workspace, once for the whole pair. */
export function sidebarPairMaximum(
  workspaceWidth: number,
  viewportWidth: number
): number | null {
  if (
    ![workspaceWidth, viewportWidth].every(
      (width) => Number.isFinite(width) && width > 0
    )
  ) {
    return null;
  }
  return (Math.min(workspaceWidth, viewportWidth) * 0.8) / 2;
}

export function sidebarWidthMatches(actual: number, expected: number): boolean {
  return Math.abs(actual - expected) <= SIDEBAR_WIDTH_TOLERANCE;
}

export function constrainSidebarTarget(
  target: number,
  left: SidebarBounds,
  right: SidebarBounds
): number | null {
  if (
    ![target, left.min, left.max, right.min, right.max].every(
      Number.isFinite
    ) ||
    left.min <= 0 ||
    right.min <= 0 ||
    left.min > left.max ||
    right.min > right.max
  ) {
    return null;
  }
  const min = Math.max(left.min, right.min);
  const max = Math.min(left.max, right.max);
  return min <= max ? Math.min(max, Math.max(min, target)) : null;
}

export function chooseSidebarTarget(
  current: SidebarPair,
  previous: SidebarPair | null,
  dragging: SidebarSide | null,
  sharedTarget: number | null
): number | null {
  if (!(current.left.open && current.right.open)) {
    return null;
  }
  const leftOpened = previous !== null && !previous.left.open;
  const rightOpened = previous !== null && !previous.right.open;
  if (leftOpened !== rightOpened) {
    return leftOpened ? current.left.width : current.right.width;
  }
  if (previous === null || (leftOpened && rightOpened)) {
    return (current.left.width + current.right.width) / 2;
  }
  if (dragging) {
    return current[dragging].width;
  }
  return sharedTarget ?? (current.left.width + current.right.width) / 2;
}
