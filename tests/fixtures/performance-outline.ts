import { EditorState } from "@codemirror/state";
import { DEFAULT_SETTINGS } from "@/capabilities/settings";
import { OutlineView } from "@/components/outline-view";
import { createLivePreviewPlugin } from "@/gfm-anchor/live-preview";
import { deferRendering, pending, renderCount } from "./performance-obsidian";

interface ElementOptions {
	attr?: Record<string, string>;
	cls?: string;
	text?: string;
}
function create(this: HTMLElement, tag: string, options: ElementOptions = {}) {
	const element = this.ownerDocument.createElement(tag);
	element.className = options.cls ?? "";
	element.textContent = options.text ?? "";
	for (const [name, value] of Object.entries(options.attr ?? {})) {
		element.setAttribute(name, value);
	}
	this.appendChild(element);
	return element;
}
Object.defineProperties(HTMLElement.prototype, {
	createEl: { value: create },
	createDiv: {
		value(this: HTMLElement, options: ElementOptions = {}) {
			return create.call(this, "div", options);
		},
	},
	empty: {
		value(this: HTMLElement) {
			this.replaceChildren();
		},
	},
	setText: {
		value(this: HTMLElement, value: string) {
			this.textContent = value;
		},
	},
	addClass: {
		value(this: HTMLElement, value: string) {
			this.classList.add(value);
		},
	},
	removeClass: {
		value(this: HTMLElement, value: string) {
			this.classList.remove(value);
		},
	},
});

async function runPerformanceRegression() {
	const failures: string[] = [];
	let checks = 0;
	function check(condition: boolean, label: string) {
		checks += 1;
		if (!condition) {
			failures.push(label);
		}
	}
	const events = new Map<string, (...args: unknown[]) => void>();
	const source = { file: { path: "fixture.md" } };
	const app = {
		workspace: {
			on: (event: string, callback: (...args: unknown[]) => void) => events.set(event, callback),
			getActiveViewOfType: () => source,
		},
		metadataCache: {
			on: (event: string, callback: (...args: unknown[]) => void) => events.set(event, callback),
		},
	};
	const outline = new OutlineView(
		{ app } as never,
		{
			settings: structuredClone(DEFAULT_SETTINGS),
			saveSettings: async () => {
				/* No disk persistence in browser fixture. */
			},
		} as never,
	);
	document.body.appendChild(outline.contentEl);
	const view = {
		state: EditorState.create({ doc: "# First\ntext\n# Second" }),
	};
	const internal = outline as unknown as {
		getActiveEditorContext: () => unknown;
		buildOutline: () => Promise<void>;
		updateTimeout: number | null;
		children: Set<unknown>;
	};
	internal.getActiveEditorContext = () => ({
		cm: view,
		sourcePath: source.file.path,
	});
	await internal.buildOutline();
	check(renderCount === 2, "initial Markdown render");
	const count = renderCount;
	view.state = view.state.update({ selection: { anchor: 15 } }).state;
	await internal.buildOutline();
	check(renderCount === count, "active row does not rerender Markdown");
	check(outline.contentEl.querySelectorAll(".is-active").length === 1, "one active row");

	deferRendering(true);
	view.state = EditorState.create({ doc: "# Stale" });
	const stale = internal.buildOutline();
	deferRendering(false);
	view.state = EditorState.create({ doc: "# Latest" });
	await internal.buildOutline();
	pending.shift()?.();
	await stale;
	check(outline.contentEl.textContent?.includes("Latest") === true, "latest render retained");
	check(!outline.contentEl.textContent?.includes("Stale"), "stale render never published");
	for (let index = 0; index < 50; index++) {
		view.state = EditorState.create({ doc: `# Row ${index}` });
		await internal.buildOutline();
	}
	check(internal.children.size === 1, "50 rebuilds retain one render component");
	await outline.onOpen();
	const timer = internal.updateTimeout;
	events.get("changed")?.({ path: "unrelated.md" });
	check(internal.updateTimeout === timer, "unrelated metadata does not schedule rebuild");
	deferRendering(true);
	view.state = EditorState.create({ doc: "# Closed" });
	const closing = internal.buildOutline();
	await outline.onClose();
	pending.shift()?.();
	await closing;
	check(internal.children.size === 0, "close releases render components");
	check(!outline.contentEl.textContent?.includes("Closed"), "close rejects pending output");
	const contentDOM = document.createElement("div");
	document.body.appendChild(contentDOM);
	let enabled = true;
	const gfmApp = {
		metadataCache: {
			on: () => ({}),
			offref: () => undefined,
			getFileCache: () => ({
				headings: [
					{ heading: "First Heading", position: { start: { line: 0 } } },
					{ heading: "Other Heading", position: { start: { line: 1 } } },
				],
			}),
		},
		workspace: { on: () => ({}), offref: () => undefined },
		vault: { getFileByPath: () => ({ path: "fixture.md" }) },
	};
	const extension = createLivePreviewPlugin(gfmApp as never, () => enabled);
	const gfm = (
		extension as unknown as {
			create: (view: unknown) => {
				destroy: () => void;
				update: (update: unknown) => void;
			};
		}
	).create({
		dom: contentDOM,
		contentDOM,
		state: {
			field: (key: string) => (key === "info" ? { file: { path: "fixture.md" } } : true),
		},
	});
	const frame = () =>
		new Promise<void>((resolve) =>
			requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
		);
	await frame();
	const anchor = contentDOM.createEl("a");
	anchor.setAttribute("href", "#first-heading");
	await frame();
	check(anchor.getAttribute("href") === "#First Heading", "new anchor rewritten from DOM mutation");
	anchor.setAttribute("href", "#other-heading");
	await frame();
	check(anchor.getAttribute("href") === "#Other Heading", "reused anchor gets new target");
	enabled = false;
	gfm.update({ transactions: [], docChanged: false, viewportChanged: false });
	anchor.setAttribute("href", "#first-heading");
	await frame();
	check(
		anchor.getAttribute("href") === "#first-heading",
		"disabled GFM does not rewrite mutations",
	);
	enabled = true;
	gfm.update({ transactions: [], docChanged: false, viewportChanged: false });
	await frame();
	check(
		anchor.getAttribute("href") === "#First Heading",
		"re-enable preserves a target changed while disabled",
	);
	gfm.destroy();
	return { failures, checks };
}
Object.assign(window, { runPerformanceRegression });
