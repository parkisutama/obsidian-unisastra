import { afterEach, expect, it, vi } from "vitest";
import Mononote from "@/capabilities/features/general/mononote";
import HemingwayMode from "@/capabilities/features/hemingway-mode/hemingway-mode";
import { DEFAULT_SETTINGS } from "@/capabilities/settings";

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

it.each([0, 100])("cancels MonoNote work after disable at %i ms", async (delay) => {
	vi.useFakeTimers();
	vi.stubGlobal("window", globalThis);
	const parent = {};
	const target = {
		id: "target",
		parent,
		activeTime: 1,
		view: { getState: () => ({ file: "a.md" }) },
		setEphemeralState: vi.fn(),
	};
	const leaf = {
		id: "source",
		parent,
		view: {
			getState: () => ({ file: "a.md" }),
			getViewType: () => "markdown",
		},
		getEphemeralState: () => ({}),
		detach: vi.fn(),
	};
	const workspace = {
		getLeavesOfType: () => [target],
		setActiveLeaf: vi.fn(),
		off: vi.fn(),
	};
	const feature = new Mononote({ plugin: { app: { workspace } } } as never);
	const work = (
		feature as unknown as {
			processActiveLeaf: (leaf: unknown) => Promise<void>;
		}
	).processActiveLeaf(leaf);
	await vi.advanceTimersByTimeAsync(delay);
	const before = leaf.detach.mock.calls.length;
	feature.disable();
	await vi.runAllTimersAsync();
	await work;
	expect(leaf.detach).toHaveBeenCalledTimes(before);
	expect(workspace.setActiveLeaf).not.toHaveBeenCalled();
	expect(vi.getTimerCount()).toBe(0);
});

it("removes Hemingway listener from the original document", () => {
	const original = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
	const next = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
	const host = { activeDocument: original };
	vi.stubGlobal("window", host);
	const feature = new HemingwayMode({
		settings: structuredClone(DEFAULT_SETTINGS),
	} as never);
	const lifecycle = feature as unknown as {
		registerKeyboardHandler: () => void;
		unregisterKeyboardHandler: () => void;
	};
	lifecycle.registerKeyboardHandler();
	lifecycle.registerKeyboardHandler();
	host.activeDocument = next;
	lifecycle.unregisterKeyboardHandler();
	expect(original.addEventListener).toHaveBeenCalledTimes(1);
	expect(original.removeEventListener).toHaveBeenCalledTimes(1);
	expect(next.removeEventListener).not.toHaveBeenCalled();
});
