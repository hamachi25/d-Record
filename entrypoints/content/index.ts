import { animeData, getAnimeDataFromAnnict, getAnimeDataFromDanime } from "./anime-data-scraper";
import { createRecordButton } from "./create-record-button";
import { handleRecordEpisode } from "./record-watch-episode";
import { getSettings } from "./storage";
import { queryWithEpisodes, queryWithoutEpisodes } from "./query";

import { StatusDropMenu } from "./components/StatusDropMenu";
import { setUploadIcon, UploadToggleButton } from "./components/UploadToggleButton";

const path = window.location.pathname.replace("/animestore/", "");
async function main() {
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

		if (animeData) createRecordButton();

		const targetElement = document.querySelector(".btnArea>.btnAddMyList.addMyList");
		if (!targetElement) return;

		const newElement = document.createElement("div");
		newElement.id = "annict";
		newElement.classList.add("btnAddMyList", "addMyList", "add", "listen");

		targetElement.insertAdjacentElement("afterend", newElement);
		render(StatusDropMenu, newElement);
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
					const targetElement = document.querySelector(".buttonArea>.time");
					if (!targetElement) return;

					const newElement = document.createElement("div");
					newElement.id = "d-record-container";
					newElement.classList.add("mainButton");

					targetElement.insertAdjacentElement("afterend", newElement);
					render(UploadToggleButton, newElement);

					isFirstRun = false;
				}
			}
		});

		const videoWrapper = document.querySelector(".videoWrapper");
		if (videoWrapper) {
			observer.observe(videoWrapper, { childList: true, subtree: true });
		}
	}
}

export default defineContentScript({
	matches: ["https://animestore.docomo.ne.jp/*"],
	main() {
		main();
	},
});
