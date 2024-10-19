import { ContentScriptAppendMode, ContentScriptContext } from "wxt/client";
import StatusDropMenu from "./components/StatusDropMenu";

/**
 * 視聴ステータスを変更するドロップメニューを作成
 */
export async function createDropMenu(
	ctx: ContentScriptContext,
	injectInfo: { site: string; anchor: string; append: string },
) {
	const ui = await createShadowRootUi(ctx, {
		name: "dr-drop-menu",
		position: "inline",
		anchor: injectInfo.anchor,
		append: injectInfo.append as ContentScriptAppendMode,
		onMount: (container) => {
			if (injectInfo.site === "danime") container.id = "annict";

			return render(() => StatusDropMenu(injectInfo.site), container);
		},
		onRemove: (unmount) => {
			if (unmount) unmount();
		},
	});
	ui.mount();
}
