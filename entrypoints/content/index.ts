import { ContentScriptContext } from "wxt/client";
import { setUploadIcon } from "./components/UploadToggleButton";
import { animeData, getAnimeDataFromAnnict, getAnimeDataFromDanime } from "./anime-data-scraper";
import { createDropMenu } from "./create-drop-menu";
import { createRecordButton } from "./create-record-button";
import { createUploadButton } from "./create-upload-button";
import { queryWithEpisodes, queryWithoutEpisodes } from "./query";
import { handleRecordEpisode } from "./record-watch-episode";
import { getSettings } from "./storage";

const path = window.location.pathname.replace("/animestore/", "");
async function main(ctx: ContentScriptContext) {
	await getSettings();

	if (path == "ci_pc") {
		// 作品ページ
		const animeTitle = document.querySelector(".titleWrap > h1")?.firstChild?.textContent;
		if (!animeTitle) return;

		// エピソード数が多いと取得に時間がかかるため、61以上の場合ステータスボタンのみ表示
		let query;
		const episodeElement = document.querySelectorAll(".episodeContainer>.swiper-slide");
		if (episodeElement && episodeElement.length < 5) {
			query = queryWithEpisodes;
		} else {
			query = queryWithoutEpisodes;
		}

		try {
			await getAnimeDataFromAnnict(animeTitle, document, query);
		} catch {
			return;
		}

		if (animeData) {
			createDropMenu(ctx);
			createRecordButton(ctx);
		}
	} else if (path == "sc_d_pc") {
		// 再生画面
		let currentLocation: string;
		let isFirstRun = true;

		const observer = new MutationObserver(async () => {
			if (currentLocation !== location.href) {
				currentLocation = location.href;
				setUploadIcon("upload");

				if (isFirstRun) {
					const animeTitle = document.querySelector(".backInfoTxt1")?.textContent;
					if (!animeTitle) return;

					try {
						const danimeDocument = await getAnimeDataFromDanime();
						if (!danimeDocument) return;

						await getAnimeDataFromAnnict(animeTitle, danimeDocument, queryWithEpisodes);
					} catch {
						setUploadIcon("immutableNotUpload");
						return;
					}
				}

				if (!animeData || animeData.episodesCount === 0) observer.disconnect();

				handleRecordEpisode();

				if (isFirstRun) {
					createUploadButton(ctx);
					isFirstRun = false;
				}
			}
		});

		const videoWrapper = document.querySelector(".videoWrapper");
		if (videoWrapper) observer.observe(videoWrapper, { childList: true, subtree: true });
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
