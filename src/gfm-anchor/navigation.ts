import type { App, OpenViewState, PaneType, TFile, WorkspaceLeaf } from "obsidian";
import { MarkdownView } from "obsidian";
import { getTargetFile, parseAnchor, type ResolvedSlugTarget, resolveSlugTarget } from "./resolver";

function nextFrame(): Promise<void> {
	return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
}

export function registerNavigationHandlers(app: App, isEnabled: () => boolean): () => void {
	let suppressNextClick = false;

	const handleLivePreviewMousedown = (event: MouseEvent): void => {
		if (!isEnabled() || event.button !== 0) {
			return;
		}

		const target = event.target;
		if (!(target instanceof HTMLElement && target.closest(".cm-editor"))) {
			return;
		}

		const anchor = target.closest<HTMLAnchorElement>("a");
		if (!anchor) {
			return;
		}

		suppressNextClick = handleAnchorNavigation(app, event, anchor);
	};

	const handleClick = (event: MouseEvent): void => {
		if (!isEnabled()) {
			return;
		}

		const target = event.target;
		if (!(target instanceof HTMLElement)) {
			return;
		}

		const anchor = target.closest<HTMLAnchorElement>("a");
		if (!anchor) {
			return;
		}

		if (suppressNextClick) {
			suppressNextClick = false;
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			return;
		}

		handleAnchorNavigation(app, event, anchor);
	};

	const documents = getNavigationDocuments(app);
	for (const doc of documents) {
		doc.addEventListener("mousedown", handleLivePreviewMousedown, true);
		doc.addEventListener("click", handleClick, true);
	}

	return () => {
		for (const doc of documents) {
			doc.removeEventListener("mousedown", handleLivePreviewMousedown, true);
			doc.removeEventListener("click", handleClick, true);
		}
	};
}

export function registerOpenLinkTextPatch(app: App, isEnabled: () => boolean): () => void {
	const originalOpenLinkText = app.workspace.openLinkText.bind(app.workspace);

	app.workspace.openLinkText = async (
		linktext: string,
		sourcePath: string,
		newLeaf?: PaneType | boolean,
		openViewState?: OpenViewState,
	): Promise<void> => {
		if (isEnabled()) {
			const target = resolveNavigationTarget(app, linktext, sourcePath);
			if (target) {
				await navigateWithoutHighlight(
					app,
					target.file,
					target.slugTarget,
					newLeaf ?? false,
					openViewState,
				);
				return;
			}
		}

		await originalOpenLinkText(linktext, sourcePath, newLeaf, openViewState);
	};

	return () => {
		app.workspace.openLinkText = originalOpenLinkText;
	};
}

async function navigateWithoutHighlight(
	app: App,
	file: TFile,
	target: ResolvedSlugTarget,
	newLeaf: PaneType | boolean,
	openViewState?: OpenViewState,
): Promise<void> {
	const fallbackLeaf = app.workspace.getLeaf(false);
	const activeLeaf = app.workspace.getMostRecentLeaf() ?? fallbackLeaf;
	const targetLeaf: WorkspaceLeaf = newLeaf ? app.workspace.getLeaf(true) : activeLeaf;

	await targetLeaf.openFile(file, openViewState);
	await nextFrame();

	if (targetLeaf.view instanceof MarkdownView) {
		scrollMarkdownViewToTarget(targetLeaf.view, target);
	}
}

function handleAnchorNavigation(app: App, event: MouseEvent, anchor: HTMLAnchorElement): boolean {
	const raw =
		anchor.dataset.gfmOriginalHref ??
		anchor.getAttribute("data-href") ??
		anchor.getAttribute("href");
	if (!raw) {
		return false;
	}

	const sourceFile = app.workspace.getActiveFile();
	if (!sourceFile) {
		return false;
	}

	const target = resolveNavigationTarget(app, raw, sourceFile.path);
	if (!target) {
		return false;
	}

	event.preventDefault();
	event.stopPropagation();
	event.stopImmediatePropagation();

	navigateWithoutHighlight(
		app,
		target.file,
		target.slugTarget,
		event.ctrlKey || event.metaKey,
	).catch((error: unknown) => {
		console.error("Failed to navigate to GFM anchor:", error);
	});

	return true;
}

function resolveNavigationTarget(
	app: App,
	raw: string,
	sourcePath: string,
): { file: TFile; slugTarget: ResolvedSlugTarget } | null {
	const parsed = parseAnchor(raw);
	if (!parsed) {
		return null;
	}

	const file = getTargetFile(app, parsed.filePart, sourcePath);
	if (!file) {
		return null;
	}

	const slugTarget = resolveSlugTarget(parsed.fragment, file, app);
	if (!slugTarget) {
		return null;
	}

	return { file, slugTarget };
}

function getNavigationDocuments(app: App): Document[] {
	return Array.from(new Set([window.activeDocument, app.workspace.containerEl.ownerDocument]));
}

function scrollMarkdownViewToTarget(view: MarkdownView, target: ResolvedSlugTarget): void {
	if (view.getMode() === "preview" && scrollPreviewToHeading(view, target)) {
		return;
	}

	const targetPosition = { ch: 0, line: target.line };
	view.editor.setCursor(targetPosition);
	view.editor.scrollIntoView(
		{
			from: targetPosition,
			to: targetPosition,
		},
		true,
	);
}

function scrollPreviewToHeading(view: MarkdownView, target: ResolvedSlugTarget): boolean {
	const headings = Array.from(
		view.previewMode.containerEl.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6"),
	).filter((heading) => heading.textContent?.trim() === target.heading);

	const heading = headings[target.headingOccurrence];
	if (!heading) {
		return false;
	}

	heading.scrollIntoView({ block: "start" });
	return true;
}
