import type UnisastraCore from "@/lib";

export default abstract class Loadable {
	protected tm: UnisastraCore;

	constructor(tm: UnisastraCore) {
		this.tm = tm;
	}

	load() {
		// Hook for loading - override in subclass if needed
	}
}
