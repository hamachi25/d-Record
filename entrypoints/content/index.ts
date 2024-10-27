import "~/assets/tailwind.css";
import { handleAbema } from "./services/abema";
import { handleDAnime } from "./services/danime";
import { getSettings, settingData } from "./utils/storage";

export default defineContentScript({
	matches: [
		"https://animestore.docomo.ne.jp/animestore/ci_pc*",
		"https://animestore.docomo.ne.jp/animestore/sc_d_pc*",
		"https://abema.tv/*",
	],
	cssInjectionMode: "ui",
	async main(ctx) {
		const settings = await getSettings();
		if (!settings) return;

		// 各サイトに適用するかどうかの設定デフォルト値
		const applyDanime = settingData.applyWebsite.danime;
		const applyAbema = settingData.applyWebsite.abema;

		/* dアニメストア */
		if (applyDanime && location.hostname === "animestore.docomo.ne.jp") {
			handleDAnime(ctx);
		}

		/* Abema */
		if (applyAbema && location.hostname === "abema.tv") {
			let location = window.location.href;

			handleAbema(ctx); // 初回実行

			const observer = new MutationObserver(() => {
				if (location !== window.location.href) {
					location = window.location.href;
					handleAbema(ctx);
				}
			});
			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}
	},
});
