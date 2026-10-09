// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

export let apiVersion = "1.14.2";
export const notices: string[] = [];
export class Notice {
	constructor(message: string) {
		notices.push(message);
	}
}
export function changeVersion(version: string): void {
	apiVersion = version;
}
