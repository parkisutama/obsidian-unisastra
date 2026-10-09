export function createColorPickerBinding(edit: (value: string) => void) {
	let synchronizing = false;
	return {
		onChange(value: string): void {
			if (!synchronizing) {
				edit(value);
			}
		},
		setValue(control: { setValue: (value: string) => unknown }, value: string): void {
			const previous = synchronizing;
			synchronizing = true;
			try {
				control.setValue(value);
			} finally {
				synchronizing = previous;
			}
		},
	};
}
