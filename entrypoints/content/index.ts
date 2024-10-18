import "~/assets/tailwind.css";
import { ContentScriptContext } from "wxt/client";
import {
	getAnimeDataFromAnnict,
	getAnimeDataFromDanime,
	getInfoFromAbemaWorkPage,
	getInfoFromAbemaPlayerPage,
	getInfoFromDanime,
	resetAnimeData,
	websiteInfo,
} from "./anime-data-scraper";
import { createDropMenu } from "./create-drop-menu";
import { createRecordButton } from "./create-record-button";
import { createUploadButton } from "./create-upload-button";
import { handleRecordEpisode } from "./record-watch-episode";
import { getSettings, settingData } from "./storage";

/******************************************************************************/

let currentWorkId: string | undefined = undefined;
/**
 * Abemaの処理
 */
async function handleAbema(ctx: ContentScriptContext) {
	/**
	 * URLから作品IDを取得
	 */
	function extractWorkId(path: string) {
		if (!path) return "";
		const workId = path.replace(/\/video\/(episode|title)\//, "").split("_");
		return `${workId[0]}+${workId[1]}`;
	}

	/**
	 * ドロップメニューを追加するobserverを作成
	 */
	function createWaitButtonObserver(ctx: ContentScriptContext) {
		let renderCount = 0;
		const waitButtonObserver = new MutationObserver(() => {
			const targetElement = document.querySelector(".com-m-media-SNSShare__container");
			if (targetElement) {
				renderCount++;

				// なぜか2回レンダリングされるので、初回は無視する
				if (renderCount === 1) return;

				waitButtonObserver.disconnect();

				if (document.querySelector("dr-drop-menu")) return;
				createDropMenu(ctx, {
					site: "abema",
					anchor: ".com-m-media-SNSShare__container",
					append: "after",
				});
			}

			setTimeout(() => {
				waitButtonObserver.disconnect();
			}, 5000);
		});

		return waitButtonObserver;
	}

	if (window.location.pathname.startsWith("/video/episode/")) {
		/* 再生ページ */
		const newWorkId = extractWorkId(window.location.pathname);

		/*
		 * データ取得と要素の追加
		 * 初回アクセスと作品ページから再生ページに移動した時に実行
		 */
		if (!currentWorkId && newWorkId !== currentWorkId) {
			resetAnimeData();

			const infoPromise = getInfoFromAbemaPlayerPage(document);

			/*
			 * アップロードボタンの追加
			 * ページをスクロールしてPiPになると、アップロードボタンが消えてしまう
			 * そのため要素を監視して、その度にアップロードボタンを追加する
			 */
			const mainPlayerObserver = new MutationObserver(() => {
				const targetElement = document.querySelector(
					".com-vod-VideoControlBar__playback-rate",
				);
				if (targetElement && !document.querySelector("dr-upload-button")) {
					createUploadButton(ctx, {
						site: "abema",
						anchor: ".com-vod-VideoControlBar__playback-rate",
						append: "before",
					});
				}
			});
			const waitPlayerObserver = new MutationObserver(() => {
				const targetElement = document.querySelector(
					".com-vod-VideoControlBar__playback-rate",
				);
				if (targetElement && !document.querySelector("dr-upload-button")) {
					waitPlayerObserver.disconnect();

					createUploadButton(ctx, {
						site: "abema",
						anchor: ".com-vod-VideoControlBar__playback-rate",
						append: "before",
					});

					const target = document.querySelector(".c-vod-EpisodePlayerContainer-wrapper");
					if (target) mainPlayerObserver.observe(target, { childList: true });
				}
			});

			const waitButtonObserver = createWaitButtonObserver(ctx);
			waitButtonObserver.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});

			if (settingData.sendTiming && settingData.sendTiming !== "not-send") {
				waitPlayerObserver.observe(document.body, {
					childList: true,
					subtree: true,
					attributes: true,
				});
			}

			const isWebsiteInfo = await infoPromise;
			if (!isWebsiteInfo) return;

			const isAnimeDataAvailable = await getAnimeDataFromAnnict();
			if (!isAnimeDataAvailable) return;
		}

		/*
		 * データ取得
		 * 再生ページから別作品の再生ページに直接移動した時に実行
		 */
		if (currentWorkId !== undefined && newWorkId !== currentWorkId) {
			resetAnimeData();

			const isWebsiteInfo = await getInfoFromAbemaPlayerPage(document);
			if (!isWebsiteInfo) return;

			const result = await getAnimeDataFromAnnict();
			if (!result) return;
		}

		/*
		 * 視聴中のエピソード情報を変更
		 * エピソードが変わった時に実行
		 */
		if (newWorkId === currentWorkId) {
			const currentEpisode = document
				.querySelector(".com-video-EpisodeTitle__episode-title")
				?.textContent?.split(" ")[0];
			if (currentEpisode) websiteInfo.currentEpisode = currentEpisode;
		}

		currentWorkId = newWorkId;

		handleRecordEpisode();
	} else if (window.location.pathname.startsWith("/video/title/")) {
		/* 作品ページ */
		currentWorkId = undefined;

		const infoPromise = getInfoFromAbemaWorkPage(document);

		if (!document.querySelector("dr-drop-menu")) {
			createDropMenu(ctx, {
				site: "abema",
				anchor: ".com-m-media-SNSShare__container",
				append: "after",
			});
		}

		const waitButtonObserver = createWaitButtonObserver(ctx);
		waitButtonObserver.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
		});

		const isWebsiteInfo = await infoPromise;
		if (!isWebsiteInfo) return;

		const isAnimeDataAvailable = await getAnimeDataFromAnnict();
		if (!isAnimeDataAvailable) return;
	} else {
		currentWorkId = undefined;
	}
}

/******************************************************************************/

/**
 * dアニメストアの処理
 */
async function handleDAnime(ctx: ContentScriptContext) {
	const path = window.location.pathname.replace("/animestore/", "");
	if (path == "ci_pc") {
		/* 作品ページ */
		createDropMenu(ctx, {
			site: "danime",
			anchor: ".btnArea>.btnConcerned.favo",
			append: "before",
		});

		const isWebsiteInfo = getInfoFromDanime(document);
		if (!isWebsiteInfo) return;

		const result = await getAnimeDataFromAnnict();

		if (result) createRecordButton(ctx);
	} else if (path == "sc_d_pc") {
		/* 再生ページ */
		let currentLocation: string;
		let danimeDocument: Document | undefined;
		let isFirstRun = true;

		if (settingData.sendTiming && settingData.sendTiming === "not-send") return;

		const handleMutation = async () => {
			if (currentLocation !== location.href) {
				currentLocation = location.href;

				/*
				 * データ取得と要素の追加
				 * 初回アクセス時に実行
				 */
				if (isFirstRun) {
					createUploadButton(ctx, {
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

					const result = await getAnimeDataFromAnnict();

					if (!result) {
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

		const videoWrapper = document.querySelector(".videoWrapper");
		if (videoWrapper) waitObserver.observe(videoWrapper, { attributes: true });
	}
}

/******************************************************************************/

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

		// どのサイトに適用するかの設定を取得
		const applyAbema = settingData.applyWebsite?.abema ?? true;
		const applyDanime = settingData.applyWebsite?.danime ?? true;

		/* Abema */
		if (applyAbema && location.hostname === "abema.tv") {
			handleAbema(ctx); // 初回実行
			ctx.addEventListener(window, "wxt:locationchange", () => {
				handleAbema(ctx);
			});
		}

		/* dアニメストア */
		if (applyDanime && location.hostname === "animestore.docomo.ne.jp") {
			handleDAnime(ctx);
		}
	},
});

/******************************************************************************/
