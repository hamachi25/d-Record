import { ContentScriptContext } from "wxt/client";
import { setUploadIcon } from "./components/UploadToggleButton";
import { animeData, getAnimeDataFromAnnict, getAnimeDataFromDanime } from "./anime-data-scraper";
import { createDropMenu } from "./create-drop-menu";
import { createRecordButton } from "./create-record-button";
import { createUploadButton } from "./create-upload-button";
import { queryWithEpisodes } from "./query";
import { handleRecordEpisode } from "./record-watch-episode";
import { getSettings } from "./storage";

async function main(ctx: ContentScriptContext) {
	await getSettings();
	const path = window.location.pathname.replace("/animestore/", "");

	if (path == "ci_pc") {
		createDropMenu(ctx);

		// 作品ページ
		const animeTitle = document.querySelector(".titleWrap > h1")?.firstChild?.textContent;
		if (!animeTitle) return;

		await getAnimeDataFromAnnict(animeTitle, document, queryWithEpisodes);

		if (animeData.id) createRecordButton(ctx);
	} else if (path == "sc_d_pc") {
		// 再生画面
		let currentLocation: string;
		let isFirstRun = true;

		const handleMutation = async () => {
			if (currentLocation !== location.href) {
				currentLocation = location.href;
				setUploadIcon("loading");

				if (isFirstRun) {
					isFirstRun = false;
					createUploadButton(ctx);

					const animeTitle = document.querySelector(".backInfoTxt1")?.textContent;
					const danimeDocument = await getAnimeDataFromDanime();
					if (!danimeDocument || !animeTitle) return;

					await getAnimeDataFromAnnict(animeTitle, danimeDocument, queryWithEpisodes);

					if (!animeData.id) {
						mainObserver.disconnect();
						return;
					}
				}

				handleRecordEpisode();
			}
		};

		const mainObserver = new MutationObserver(handleMutation);
		const waitObserver = new MutationObserver(() => {
			const targetElement = document.getElementById("video");
			if (targetElement) {
				waitObserver.disconnect();
				handleMutation(); // 初回実行
				mainObserver.observe(targetElement, { attributes: true });
			}
		});

		const videoWrapper = document.querySelector(".videoWrapper");
		if (videoWrapper) waitObserver.observe(videoWrapper, { attributes: true });
	}
}

export default defineContentScript({
	matches: [
		"https://animestore.docomo.ne.jp/animestore/ci_pc*",
		"https://animestore.docomo.ne.jp/animestore/sc_d_pc*",
	],
	main(ctx) {
		main(ctx);
	},
});
