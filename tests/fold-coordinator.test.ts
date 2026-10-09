import { afterEach, describe, expect, it, vi } from "vitest";
import { FoldPersistenceCoordinator } from "@/capabilities/features/fold-persist/coordinator";
import { SettingsWriter } from "@/settings-writer";

describe("fold write ownership", () => {
	it("rejects an older pane capture that finishes after the latest action", () => {
		const f = fixture();
		const older = f.coordinator.claim("a.md");
		const newer = f.coordinator.claim("a.md");
		f.coordinator.capture("a.md", { a: false }, {}, f.win, newer);
		f.coordinator.capture("a.md", { a: true }, {}, f.win, older);
		expect(f.state["a.md"]).toEqual({ a: false });
		f.coordinator.destroy();
	});
	afterEach(() => vi.useRealTimers());
	function fixture() {
		vi.useFakeTimers();
		const state: Record<string, Record<string, boolean>> = {};
		const writes: unknown[] = [];
		let enabled = true;
		const writer = new SettingsWriter((snapshot) => {
			writes.push(snapshot);
			return Promise.resolve();
		});
		const coordinator = new FoldPersistenceCoordinator({
			state: () => state,
			enabled: () => enabled,
			persist: (allowed) => writer.save(state, allowed),
		});
		return {
			coordinator,
			state,
			writes,
			disable: () => {
				enabled = false;
				coordinator.refresh();
			},
			win: globalThis as unknown as Window,
		};
	}
	it("coalesces panes by file and keeps the latest action without active-file lookup", async () => {
		const f = fixture();
		f.coordinator.capture("a.md", { a: true }, {}, f.win);
		f.coordinator.capture("b.md", { b: true }, {}, f.win);
		f.coordinator.capture("a.md", { a: false }, {}, f.win);
		await vi.runAllTimersAsync();
		expect(f.state).toEqual({ "a.md": { a: false }, "b.md": { b: true } });
		const count = f.writes.length;
		f.coordinator.capture("a.md", { a: false }, {}, f.win);
		await vi.runAllTimersAsync();
		expect(f.writes).toHaveLength(count);
	});
	it("cancels close and disable, retains memory, and allows a later retry", async () => {
		const f = fixture();
		const owner = {};
		f.coordinator.capture("a.md", { a: true }, owner, f.win);
		f.coordinator.cancelOwner(owner);
		await vi.runAllTimersAsync();
		expect(f.writes).toHaveLength(0);
		f.coordinator.capture("a.md", { a: true }, {}, f.win);
		await vi.runAllTimersAsync();
		expect(f.writes).toHaveLength(1);
		f.coordinator.capture("a.md", { a: false }, {}, f.win);
		f.disable();
		await vi.runAllTimersAsync();
		expect(f.writes).toHaveLength(1);
		expect(f.state["a.md"]).toEqual({ a: false });
	});
	it("renames folders, deletes pending state, and supports reuse of a path", async () => {
		const f = fixture();
		f.coordinator.capture("dir/a.md", { a: true }, {}, f.win);
		f.coordinator.rename("dir", "new");
		f.coordinator.delete("new/a.md");
		f.coordinator.capture("new/a.md", { fresh: false }, {}, f.win);
		await vi.runAllTimersAsync();
		expect(f.state).toEqual({ "new/a.md": { fresh: false } });
		expect(f.writes.at(-1)).toEqual(f.state);
		f.coordinator.destroy();
		expect(vi.getTimerCount()).toBe(0);
	});
	it("retries an identical snapshot after a rejected save", async () => {
		vi.useFakeTimers();
		const state = {};
		const error = vi.spyOn(console, "error").mockImplementation(() => {
			/* Expected disk failure. */
		});
		const persist = vi.fn().mockRejectedValueOnce(new Error("disk")).mockResolvedValue(undefined);
		const c = new FoldPersistenceCoordinator({
			enabled: () => true,
			state: () => state,
			persist,
		});
		c.capture("a", { a: true }, {}, globalThis as unknown as Window);
		await vi.runAllTimersAsync();
		c.capture("a", { a: true }, {}, globalThis as unknown as Window);
		await vi.runAllTimersAsync();
		expect(persist).toHaveBeenCalledTimes(2);
		error.mockRestore();
	});
});

describe("settings write serialization", () => {
	it("freezes snapshots and prevents reverse completion across callers", async () => {
		const writes: number[] = [];
		let release = () => {
			/* Assigned by the first queued write. */
		};
		const writer = new SettingsWriter<{ value: number }>(async (snapshot) => {
			if (snapshot.value === 1) {
				await new Promise<void>((resolve) => {
					release = resolve;
				});
			}
			writes.push(snapshot.value);
		});
		const data = { value: 1 };
		const first = writer.save(data);
		await Promise.resolve();
		data.value = 2;
		const second = writer.save(data);
		data.value = 3;
		expect(writes).toEqual([]);
		release();
		await Promise.all([first, second]);
		expect(writes).toEqual([1, 2]);
	});
	it("skips invalidated queued writes and continues after rejection", async () => {
		const write = vi.fn().mockRejectedValueOnce(new Error("disk")).mockResolvedValue(undefined);
		const writer = new SettingsWriter(write);
		await expect(writer.save(1)).rejects.toThrow("disk");
		await writer.save(2, () => false);
		await writer.save(3);
		expect(write.mock.calls).toEqual([[1], [3]]);
	});
});
