import { ContentScriptContext } from "wxt/client";
import { DanimeToast } from "../components/danime/DanimeToast";

/**
 * 視聴ステータスを変更するドロップメニューを作成
 */
export async function injectToast(ctx: ContentScriptContext) {
	const ui = await createShadowRootUi(ctx, {
		name: "dr-toast",
		position: "inline",
		anchor: ".videoWrapper",
		append: "after",
		onMount: (container) => {
			return render(DanimeToast, container);
		},
	});
	ui.mount();
}
