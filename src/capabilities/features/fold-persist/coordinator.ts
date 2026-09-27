import { equalFoldSnapshots } from "@/cm6/outliner/fold-model";

interface PendingSave {
  owner: object;
  timer: number;
  win: Window;
}

export interface FoldPersistenceHost {
  enabled(): boolean;
  persist(allowed: () => boolean): Promise<void>;
  state(): Record<string, Record<string, boolean>>;
}

/** One latest snapshot per file; never dispatches into sibling editors. */
export class FoldPersistenceCoordinator {
  private readonly pending = new Map<string, PendingSave>();
  private epoch = 0;
  private disposed = false;
  get isDisposed(): boolean {
    return this.disposed;
  }
  private revision = 0;
  private savedRevision = 0;
  private readonly owners = new WeakMap<object, number>();
  private action = 0;
  private readonly actions = new Map<string, number>();

  claim(path: string): number {
    const action = ++this.action;
    this.actions.set(path, action);
    return action;
  }

  private readonly host: FoldPersistenceHost;
  constructor(host: FoldPersistenceHost) {
    this.host = host;
  }

  read(path: string): unknown {
    const state = this.host.state();
    return Object.hasOwn(state, path) ? state[path] : undefined;
  }

  capture(
    path: string,
    snapshot: Record<string, boolean>,
    owner: object,
    win: Window,
    action?: number
  ): void {
    if (this.disposed || !this.host.enabled()) {
      return;
    }
    if (action !== undefined && this.actions.get(path) !== action) {
      return;
    }
    const state = this.host.state();
    if (
      equalFoldSnapshots(state[path], snapshot) &&
      this.revision === this.savedRevision
    ) {
      return;
    }
    Object.defineProperty(state, path, {
      value: snapshot,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    this.revision += 1;
    this.cancel(path);
    const epoch = this.epoch;
    const ownerEpoch = this.owners.get(owner) ?? 0;
    const timer = win.setTimeout(() => {
      this.pending.delete(path);
      this.save(
        epoch,
        () =>
          (this.owners.get(owner) ?? 0) === ownerEpoch && this.host.enabled()
      );
    }, 250);
    this.pending.set(path, { owner, win, timer });
  }

  private save(epoch: number, valid: () => boolean = () => true): void {
    const revision = this.revision;
    const allowed = () => !this.disposed && epoch === this.epoch && valid();
    if (allowed()) {
      this.host
        .persist(allowed)
        .then(() => {
          if (allowed()) {
            this.savedRevision = Math.max(this.savedRevision, revision);
          }
        })
        .catch((error: unknown) =>
          console.error("MD Writer: failed to persist folds", error)
        );
    }
  }

  cancelOwner(owner: object): void {
    this.owners.set(owner, (this.owners.get(owner) ?? 0) + 1);
    for (const [path, pending] of this.pending) {
      if (pending.owner === owner) {
        this.cancel(path);
      }
    }
  }

  private cancel(path: string): void {
    const pending = this.pending.get(path);
    pending?.win.clearTimeout(pending.timer);
    this.pending.delete(path);
  }

  refresh(): void {
    if (!this.host.enabled()) {
      this.epoch += 1;
      for (const path of this.pending.keys()) {
        this.cancel(path);
      }
    }
  }

  rename(oldPath: string, newPath: string): void {
    this.relocate(oldPath, newPath);
  }

  delete(path: string): void {
    this.relocate(path, null);
  }

  private relocate(oldPath: string, newPath: string | null): void {
    if (this.disposed) {
      return;
    }
    const state = this.host.state();
    let changed = false;
    for (const path of this.actions.keys()) {
      if (path === oldPath || path.startsWith(`${oldPath}/`)) {
        this.actions.delete(path);
      }
    }
    for (const path of Object.keys(state)) {
      if (path !== oldPath && !path.startsWith(`${oldPath}/`)) {
        continue;
      }
      this.cancel(path);
      this.actions.delete(path);
      if (newPath !== null) {
        Object.defineProperty(state, newPath + path.slice(oldPath.length), {
          value: state[path],
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      delete state[path];
      changed = true;
    }
    if (changed) {
      this.revision += 1;
      this.save(this.epoch);
    }
  }

  destroy(): void {
    this.disposed = true;
    this.actions.clear();
    this.epoch += 1;
    for (const path of this.pending.keys()) {
      this.cancel(path);
    }
  }
}
