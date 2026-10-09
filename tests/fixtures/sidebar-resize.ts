import type { App } from "obsidian";
import { ObsidianSidebarHost } from "../../src/capabilities/features/general/sidebar-resize/adapter";
import { SidebarResizeController } from "../../src/capabilities/features/general/sidebar-resize/controller";
import { changeVersion, notices } from "./sidebar-obsidian";

async function runSidebarRegression() {
	const failures: string[] = [];
	let checks = 0;
	const check = (condition: boolean, message: string) => {
		checks++;
		if (!condition) {
			failures.push(message);
		}
	};
	const frames = async (count = 4) => {
		for (let i = 0; i < count; i++) {
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		}
	};
	const workspaceEl = document.createElement("div");
	workspaceEl.style.cssText = "display:flex;width:1000px;height:200px";
	document.body.append(workspaceEl);
	const makeSide = (width: number) => {
		const el = document.createElement("div");
		el.style.cssText = "box-sizing:border-box;flex-shrink:0;height:100%;border:1px solid gray";
		const handle = document.createElement("hr");
		el.append(handle);
		workspaceEl.append(el);
		const side = {
			containerEl: el,
			resizeHandleEl: handle,
			collapsed: false,
			size: width,
			setSize(value: number) {
				this.size = value;
				el.style.width = `${value}px`;
			},
		};
		side.setSize(width);
		return side;
	};
	let left = makeSide(320.25);
	const right = makeSide(380.25);
	const callbacks = new Map<object, { name: string; callback: () => void }>();
	let saves = 0;
	const workspace = {
		containerEl: workspaceEl,
		leftSplit: left,
		rightSplit: right,
		requestSaveLayout() {
			saves++;
		},
		requestResize() {
			/* Host geometry is browser-owned. */
		},
		on(name: string, callback: () => void) {
			const ref = {};
			callbacks.set(ref, { name, callback });
			return ref;
		},
		offref(ref: object) {
			callbacks.delete(ref);
		},
	};
	const layout = () => {
		for (const cb of callbacks.values()) {
			if (cb.name === "layout-change") {
				cb.callback();
			}
		}
	};
	const host = new ObsidianSidebarHost({ workspace } as unknown as App);
	let reads = 0;
	let writes = 0;
	const read = host.read.bind(host);
	const write = host.write.bind(host);
	host.read = () => {
		reads++;
		return read();
	};
	host.write = (...args) => {
		writes++;
		return write(...args);
	};
	const performance = {
		updates: 60,
		pointerEvents: 600,
		reads: 0,
		writes: 0,
		idleReads: 0,
	};
	const controller = new SidebarResizeController(host);
	const equal = (width: number) =>
		[left, right].every(
			(side) => Math.abs(side.containerEl.getBoundingClientRect().width - width) <= 0.5,
		);
	const drag = async (side: typeof left, width: number) => {
		side.resizeHandleEl.dispatchEvent(
			new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
		);
		side.setSize(width);
		window.dispatchEvent(new PointerEvent("pointermove"));
		await frames();
		check(equal(width), `drag ${width} mirrors before release`);
		window.dispatchEvent(new PointerEvent("pointerup"));
		await frames();
	};
	try {
		workspaceEl.style.width = "26843546px";
		left.setSize(21_474_836.8);
		right.setSize(21_474_836.8);
		controller.start();
		await frames();
		const viewportMax = Math.min(window.innerWidth, document.documentElement.clientWidth) * 0.4;
		check(equal(viewportMax), "extreme stored widths recover within a shared viewport budget");
		check(
			left.size + right.size <= window.innerWidth * 0.8 + 0.5,
			"overflowing workspace cannot enlarge the shared budget",
		);
		right.resizeHandleEl.dispatchEvent(
			new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
		);
		right.setSize(21_474_836.8);
		window.dispatchEvent(new PointerEvent("pointermove"));
		await frames();
		check(equal(viewportMax), "oversized drag clamps both source and follower");
		window.dispatchEvent(new PointerEvent("pointerup"));
		await frames();
		await drag(left, 300);
		controller.stop();
		workspaceEl.style.width = "1000px";
		left.setSize(320.25);
		right.setSize(380.25);
		controller.start();
		await frames();
		check(equal(350.25), "activation average uses fractional rendered widths");
		const initialSaves = saves;
		await frames();
		check(saves === initialSaves, "observer writes converge");
		await drag(left, 340.25);
		await drag(right, 390.5);
		right.collapsed = true;
		right.containerEl.style.display = "none";
		await frames();
		left.setSize(300);
		await frames();
		check(right.size === 390.5, "closed sidebar retains logical width");
		check(left.size === 300, "single open sidebar resizes independently");
		right.collapsed = false;
		right.containerEl.style.display = "";
		right.containerEl.style.overflow = "hidden";
		right.containerEl.style.width = "20px";
		await frames();
		check(left.size === 300 && right.size === 390.5, "opening animation is not a drag");
		right.containerEl.style.overflow = "";
		right.setSize(right.size);
		await frames();
		check(equal(390.5), "newly opened sidebar is the reference");
		const narrowNotices = notices.length;
		workspaceEl.style.width = "400px";
		await frames();
		check(
			equal(390.5) && notices.length === narrowNotices + 1,
			"impossible shared bounds suspend without expanding either sidebar",
		);
		workspaceEl.style.width = "600px";
		await frames();
		check(equal(240), "feasible window shrink restores a bounded equal pair");
		workspaceEl.style.width = "1000px";
		await frames();
		const beforeConflict = notices.length;
		// Force width from a stylesheet, as a user snippet would.
		const css = document.createElement("style");
		right.containerEl.id = "forced-sidebar";
		css.textContent = "#forced-sidebar { width:280px !important }";
		document.head.append(css);
		await frames(10);
		check(
			notices.length === beforeConflict + 1,
			`CSS conflict warns once and stops retrying (${notices.length} notices)`,
		);
		const stalledSaves = saves;
		await frames(8);
		check(saves === stalledSaves, "CSS conflict does not oscillate");
		css.remove();
		right.containerEl.removeAttribute("id");
		await drag(left, 330);
		const old = left;
		old.containerEl.remove();
		left = makeSide(360);
		workspace.leftSplit = left;
		layout();
		await frames();
		check(equal(345), "new pair uses activation rule");
		controller.stop();
		const stoppedSaves = saves;
		left.setSize(440);
		await frames();
		check(
			right.size === 345 && saves === stoppedSaves,
			"disable removes observers and leaves last width",
		);
		check(callbacks.size === 0, "all workspace listeners removed");
		changeVersion("1.13.7");
		check(host.read() === null, "older native contract is refused");
		changeVersion("1.14.4");
		check(host.read() !== null, "latest stable is accepted");
		changeVersion("1.15.0");
		check(host.read() !== null, "newer versions are accepted");
		changeVersion("1.14.2");
		controller.start();
		await frames();
		check(equal(392.5), "re-enable averages current widths");
		const beforeReads = reads;
		const beforeWrites = writes;
		left.resizeHandleEl.dispatchEvent(
			new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
		);
		for (let i = 0; i < performance.updates; i++) {
			left.setSize(330 + i);
			for (let j = 0; j < 10; j++) {
				window.dispatchEvent(new PointerEvent("pointermove"));
			}
			await frames(2);
		}
		await frames();
		performance.reads = reads - beforeReads;
		performance.writes = writes - beforeWrites;
		check(
			performance.reads <= 2 * performance.updates + 2,
			"drag uses at most one measurement plus verification per update",
		);
		check(performance.writes === performance.updates, "drag writes the follower once per update");
		window.dispatchEvent(new PointerEvent("pointerup"));
		await frames();
		const beforeIdle = reads;
		for (let i = 0; i < 100; i++) {
			window.dispatchEvent(new PointerEvent("pointermove"));
		}
		await frames(10);
		performance.idleReads = reads - beforeIdle;
		check(equal(389), "bursty drag preserves the final target");
		check(performance.idleReads === 0, "idle pointer movement does not measure geometry");
		controller.stop();
		const snapshot = host.read();
		const beforeGuard = reads;
		right.collapsed = true;
		check(
			snapshot !== null && !host.write("left", 420, snapshot),
			"write guard refuses a newly closed sidebar",
		);
		check(reads === beforeGuard, "write guard does not remeasure geometry");
		right.collapsed = false;
		const beforeCycles = reads;
		for (let i = 0; i < 50; i++) {
			controller.start();
			controller.stop();
		}
		await frames();
		check(
			reads === beforeCycles && callbacks.size === 0,
			"50 start/stop cycles leave no callbacks or measurements",
		);
	} finally {
		controller.stop();
		workspaceEl.remove();
	}
	return { checks, failures, performance };
}
Object.assign(window, { runSidebarRegression });
