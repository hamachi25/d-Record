import { ContentScriptContext } from "wxt/client";
import StatusDropMenu from "./components/StatusDropMenu";

export function createDropMenu(ctx: ContentScriptContext) {
	const ui = createIntegratedUi(ctx, {
		position: "inline",
		anchor: ".btnArea>.btnAddMyList.addMyList",
		append: "after",
		onMount: (container) => {
			container.id = "annict";

			return render(StatusDropMenu, container);
		},
		onRemove: (unmount) => {
			if (unmount) unmount();
		},
	});
	ui.mount();
}
