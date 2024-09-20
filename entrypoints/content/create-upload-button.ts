import { ContentScriptContext } from "wxt/client";
import { UploadToggleButton } from "./components/UploadToggleButton";

export function createUploadButton(ctx: ContentScriptContext) {
	const ui = createIntegratedUi(ctx, {
		position: "inline",
		anchor: ".buttonArea>.time",
		append: "after",
		onMount: (container) => {
			container.id = "d-record-container";
			container.classList.add("mainButton");

			return render(UploadToggleButton, container);
		},
		onRemove: (unmount) => {
			if (unmount) unmount();
		},
	});
	ui.mount();
}
