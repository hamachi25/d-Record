import { ContentScriptAppendMode, ContentScriptContext } from "wxt/client";
import UploadToggleButton from "../components/common/UploadToggleButton";

/**
 * 再生ページのアップロードボタンを作成
 */
export async function appendUploadButton(
	ctx: ContentScriptContext,
	injectInfo: { site: string; anchor: string; append: string },
) {
	const ui = await createShadowRootUi(ctx, {
		name: "dr-upload-button",
		position: "inline",
		anchor: injectInfo.anchor,
		append: injectInfo.append as ContentScriptAppendMode,
		onMount: (container) => {
			return render(() => UploadToggleButton(injectInfo.site), container);
		},
	});
	ui.mount();
}
