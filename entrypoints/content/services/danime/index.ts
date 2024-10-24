import styleText from "./danime.css?inline";
import { ContentScriptContext } from "wxt/client";
import { fetchAnimeDataFromAnnict, getAnimeDataFromDanime } from "../../core/anime-data-scraper";
import { appendDropMenu } from "../../ui/append-drop-menu";
import { injectRecordButton } from "../../ui/inject-record-button";
import { appendUploadButton } from "../../ui/append-upload-button";
import { handleRecordEpisode } from "../../core/record-watch-episode";
import { settingData } from "../../utils/storage";
import { getInfoFromDanime } from "./web-scraper";
import { websiteInfo } from "../../core/anime-data-scraper";

/**
 * スタイルをheaderに追加
 */
function injectStyle() {
	const style = document.createElement("style");
	style.textContent = styleText;
	document.head.append(style);
}

/******************************************************************************/

/**
 * dアニメストアの処理
 */
export async function handleDAnime(ctx: ContentScriptContext) {
	const danimePath = window.location.pathname.replace("/animestore/", "");

	if (danimePath === "ci_pc") {
		/* 作品ページ */
		injectStyle();

		appendDropMenu(ctx, {
			site: "danime",
			anchor: ".btnArea>.btnConcerned.favo",
			append: "before",
		});

		const isWebsiteInfo = getInfoFromDanime(document);
		if (!isWebsiteInfo) return;

		const isFetchedAnimeData = await fetchAnimeDataFromAnnict();

		if (isFetchedAnimeData) injectRecordButton(ctx);
	}

	if (danimePath === "sc_d_pc") {
		/* 再生ページ */
		let currentLocation: string;
		let danimeDocument: Document | undefined;
		let isFirstRun = true;

		const handleMutation = async () => {
			if (currentLocation !== location.href) {
				currentLocation = location.href;

				injectStyle();

				/*
				 * データ取得と要素の追加
				 * 初回アクセス時に実行
				 */
				if (isFirstRun) {
					appendUploadButton(ctx, {
						site: "danime",
						anchor: ".buttonArea>.time",
						append: "after",
					});

					danimeDocument = await getAnimeDataFromDanime();

					const isWebsiteInfo = getInfoFromDanime(danimeDocument);
					if (!isWebsiteInfo) {
						mainObserver.disconnect();
						return;
					}

					const isFetchedAnimeData = await fetchAnimeDataFromAnnict();

					if (!isFetchedAnimeData) {
						mainObserver.disconnect();
						return;
					}
				}

				/*
				 * 視聴中のエピソード情報を変更
				 * エピソードが変わった時に実行
				 */
				if (!isFirstRun) {
					const currentEpisode =
						document.querySelector(".backInfoTxt2")?.textContent ?? "";
					websiteInfo.currentEpisode = currentEpisode;
				}

				isFirstRun = false;

				handleRecordEpisode();
			}
		};

		/*
		 * ページ遷移を検知
		 * URLがHistoryAPIで変更されるので、要素を監視
		 */
		const mainObserver = new MutationObserver(handleMutation);
		const waitObserver = new MutationObserver(() => {
			const targetElement = document.getElementById("video");
			if (targetElement) {
				waitObserver.disconnect();
				handleMutation(); // 初回実行
				mainObserver.observe(targetElement, { attributes: true });
			}
		});

		if (settingData.sendTiming && settingData.sendTiming === "not-send") return;

		const videoWrapper = document.querySelector(".videoWrapper");
		if (videoWrapper) waitObserver.observe(videoWrapper, { attributes: true });
	}
}
