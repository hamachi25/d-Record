import styleText from "./abema.css?inline";
import { ContentScriptContext } from "wxt/client";
import { fetchAnimeDataFromAnnict, setAnimeData } from "../../core/anime-data-scraper";
import { appendDropMenu } from "../../ui/append-drop-menu";
import { appendUploadButton } from "../../ui/append-upload-button";
import { handleRecordEpisode } from "../../core/record-watch-episode";
import { settingData } from "../../utils/storage";
import { getInfoFromAbemaWorkPage, getInfoFromAbemaPlayerPage } from "./web-scraper";
import { setWebsiteInfo } from "../../core/anime-data-scraper";

let currentWorkId: string | undefined = undefined;

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
			appendDropMenu(ctx, {
				site: "abema",
				anchor: ".com-m-media-SNSShare__container",
				append: "after",
			});
		}

		setTimeout(() => {
			waitButtonObserver.disconnect();
		}, 5000);
	});

	waitButtonObserver.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
	});
}

/**
 * アップロードボタンを追加するobserverを作成
 */
function createWaitPlayerObserver(ctx: ContentScriptContext) {
	let isMainPlayerObserver = false;

	/**
	 * 初回読み込み時にアップロードボタンの追加と、mainPlayerObserverの監視を開始
	 */
	const waitPlayerObserver = new MutationObserver(() => {
		const targetElement = document.querySelector(".com-vod-VideoControlBar__playback-rate");
		if (targetElement && !document.querySelector("dr-upload-button")) {
			waitPlayerObserver.disconnect();

			appendUploadButton(ctx, {
				site: "abema",
				anchor: ".com-vod-VideoControlBar__playback-rate",
				append: "before",
			});

			const target = document.querySelector(".c-vod-EpisodePlayerContainer-wrapper");
			if (target && !isMainPlayerObserver)
				mainPlayerObserver.observe(target, { childList: true });
			isMainPlayerObserver = true;
		}
	});

	/**
	 * アップロードボタンの追加
	 * @description ページをスクロールしてPiPになるとアップロードボタンが消えてしまうため、要素を監視してその度にアップロードボタンを追加する
	 */
	const mainPlayerObserver = new MutationObserver(() => {
		const targetElement = document.querySelector(".com-vod-VideoControlBar__playback-rate");
		if (targetElement && !document.querySelector("dr-upload-button")) {
			appendUploadButton(ctx, {
				site: "abema",
				anchor: ".com-vod-VideoControlBar__playback-rate",
				append: "before",
			});
		}
	});

	if (settingData.sendTiming && settingData.sendTiming !== "not-send") {
		waitPlayerObserver.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
		});
	}
}

/******************************************************************************/

/**
 * プレミアムかどうかをチェック
 * @description プレミアムの場合createWaitPlayerObserverが溜まって、アップロードボタンが複数追加されてしまう
 */
async function checkPremium() {
	await new Promise((resolve) => setTimeout(resolve, 100));

	const premium = document.querySelector(".c-vod-EpisodePlayerContainer__appeal-plan-overlay");
	if (premium) return true;
	return false;
}

/******************************************************************************/

/**
 * URLから作品IDを取得
 */
function extractWorkId(path: string) {
	const workId = path.replace(/(episode|title)\//, "").split("_");
	return `${workId[0]}+${workId[1]}`;
}

/******************************************************************************/

/**
 * アニメデータをリセット
 */
function resetAnimeData() {
	setAnimeData({
		id: "",
		annictId: "",
		title: "",
		viewerStatusState: "",
		episodes: [],
		sortedEpisodes: [],
		nextEpisode: undefined,
		currentEpisode: {
			normalized: undefined,
			raw: undefined,
		},
	});
}

/******************************************************************************/

/**
 * Abemaの処理
 */
export async function handleAbema(ctx: ContentScriptContext) {
	const abemaPath = window.location.pathname.replace("/video/", "");

	injectStyle();

	/* 再生ページ */
	if (abemaPath.startsWith("episode")) {
		const newWorkId = extractWorkId(abemaPath);

		/*
		 * データ取得と要素の追加
		 * 初回アクセスと作品ページから再生ページに移動した時に実行
		 */
		if (!currentWorkId && currentWorkId !== newWorkId) {
			resetAnimeData();

			const isWebsiteInfo = await getInfoFromAbemaPlayerPage(document);
			if (!isWebsiteInfo) return;

			createWaitButtonObserver(ctx);

			const isPremium = await checkPremium();
			if (!isPremium) createWaitPlayerObserver(ctx);

			const isFetchedAnimeData = await fetchAnimeDataFromAnnict();
			if (!isFetchedAnimeData) return;
		}

		/*
		 * データ取得
		 * 再生ページから別作品の再生ページに直接移動した時に実行
		 */
		if (currentWorkId !== undefined && newWorkId !== currentWorkId) {
			resetAnimeData();

			const isWebsiteInfo = await getInfoFromAbemaPlayerPage(document);
			if (!isWebsiteInfo) return;

			const isFetchedAnimeData = await fetchAnimeDataFromAnnict();
			if (!isFetchedAnimeData) return;
		}

		/*
		 * 視聴中のエピソード情報を変更
		 * エピソードが変わった時に実行
		 */
		if (newWorkId === currentWorkId) {
			await new Promise((resolve) => setTimeout(resolve, 200)); // ページ遷移時にレンダリングが遅れるため待機
			const currentEpisode = document
				.querySelector(".com-video-EpisodeTitle__episode-title")
				?.textContent?.split(" ")[0];
			if (currentEpisode) setWebsiteInfo("currentEpisode", currentEpisode);
		}

		currentWorkId = newWorkId;

		handleRecordEpisode();
		return;
	}

	/* 作品ページ */
	if (abemaPath.startsWith("title")) {
		const isWebsiteInfo = await getInfoFromAbemaWorkPage(document);
		if (!isWebsiteInfo) return;

		if (!document.querySelector("dr-drop-menu")) {
			appendDropMenu(ctx, {
				site: "abema",
				anchor: ".com-m-media-SNSShare__container",
				append: "after",
			});
		}

		await fetchAnimeDataFromAnnict();
	}

	currentWorkId = undefined; // 再生ページ以外では、currentWorkIdをリセット
}
