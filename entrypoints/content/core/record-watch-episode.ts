import { animeData, danimeDocument, websiteInfo, setLoading } from "./anime-data-scraper";
import { fetchDataFromAnnict } from "../utils/api/fetch";
import { settingData, getNotRecordWork } from "../utils/storage";
import { changeStatusToWatching, changeStatusToWatched } from "../utils/status";
import {
	episodeNumberExtractor,
	isCurrentlyAiring,
	checkNextEpisodeRegistered,
	updateCurrentEpisode,
} from "../utils/episode";

/******************************************************************************/

/*
 * アップロードボタンでcreateIntervalOrEvent()を呼ぶので、グローバル変数にする
 */
let currentEpisodeFromWebSite: number | string | undefined = undefined; // 現在視聴しているのエピソード(websiteのDOMから取得する)
let sortedEpisodesIndex: number | number[] | undefined = undefined; // sortedEpisodesの中のindex(データ送信用)

/**
 * 視聴データを送信する
 */
function sendRecord() {
	const isAiring = isCurrentlyAiring(danimeDocument());

	// 作品ページの最終話のエピソード番号を取得
	const danimeLastEpisodeNumber = websiteInfo.lastEpisode
		? episodeNumberExtractor(websiteInfo.lastEpisode)
		: undefined;

	// annictの最終話のエピソード番号を取得
	const annictLastEpisodeNumber =
		animeData.sortedEpisodes[animeData.sortedEpisodes.length - 1]?.numberTextNormalized;

	let mutation = "mutation{";

	// 視聴ステータスが"見てる"以外だった場合、"見てる"に変更(最終回を除く)
	if (
		isAiring || // アニメが放送中
		(animeData.sortedEpisodes.length !== 0 &&
			danimeLastEpisodeNumber !== currentEpisodeFromWebSite) // 最終話以外
	) {
		mutation = changeStatusToWatching(mutation);
	}

	// エピソードを記録
	if (sortedEpisodesIndex !== undefined && typeof sortedEpisodesIndex === "object") {
		// 複数エピソードの場合
		let count = 0; // クエリのカウント用
		for (let i = sortedEpisodesIndex[0]; i <= sortedEpisodesIndex[1]; i++) {
			count++;
			mutation += `
				e${count}:createRecord (
					input: { episodeId:"${animeData.sortedEpisodes[i].id}"}
				) { clientMutationId }
			`;
		}
	} else if (sortedEpisodesIndex !== undefined) {
		mutation += `
    	    createRecord (
    	        input: { episodeId:"${animeData.sortedEpisodes[sortedEpisodesIndex].id}"}
    	    ) { clientMutationId }
    	`;
	}

	// 最終話だった場合、"見た"に変更
	if (
		!isAiring && // アニメが放送終了
		animeData.sortedEpisodes.length !== 0 &&
		danimeLastEpisodeNumber === currentEpisodeFromWebSite && // 最終話
		currentEpisodeFromWebSite === annictLastEpisodeNumber && // 最終話
		(settingData.autoChangeStatus === undefined || settingData.autoChangeStatus) // 設定
	) {
		mutation = changeStatusToWatched(mutation);
	}

	// 映画などエピソードがない場合、ステータスのみ変更
	if (sortedEpisodesIndex === undefined) mutation = changeStatusToWatched(mutation);

	mutation += "}";

	const result = fetchDataFromAnnict(JSON.stringify({ query: mutation }));
	if (!result) return;

	setLoading("icon", "completeUpload");
	cleanupIntervalOrEvent();
}

let sendInterval: NodeJS.Timeout | undefined = undefined;
let sendEvent: EventListener | undefined = undefined;
/**
 * 視聴データを送信するインターバル・イベントを作成
 */
export function createIntervalOrEvent() {
	function createIntervalOrEventMain() {
		const video = document.querySelector("video");
		if (!video) return false;

		if (settingData.sendTiming == "after-start") {
			const startTime = Date.now();
			const startVideoTime = video.currentTime;

			sendInterval = setInterval(() => {
				// 視聴開始からの時間・動作再生時間の両方が5分以上の場合に送信
				if (
					video &&
					Date.now() - startTime > 5 * 60 * 1000 &&
					video.currentTime - startVideoTime > 5 * 60
				) {
					sendRecord();
					cleanupIntervalOrEvent();
				}
			}, 10000);
		} else if (!settingData.sendTiming || settingData.sendTiming == "after-end") {
			sendEvent = () => sendRecord();
			video.addEventListener("ended", sendEvent);
		}
	}
	const result = createIntervalOrEventMain();
	if (result !== false) return;

	// abemaはvideoの読み込みを待つ必要がある。
	if (websiteInfo.site === "abema") {
		const observer = new MutationObserver(() => {
			const video = document.querySelector("video");
			if (!video) return;

			if (observer) observer.disconnect();
			createIntervalOrEventMain();
		});
		const observerTarget = document.querySelector(
			".com-vod-VODRecommendedContentsContainerView",
		);
		if (observerTarget) {
			observer.observe(observerTarget, {
				childList: true,
				subtree: true,
			});
		}
	}
}

/**
 * 視聴データを送信するインターバル・イベントを削除
 */
export function cleanupIntervalOrEvent() {
	if (sendInterval) clearInterval(sendInterval);
	if (sendEvent) document.querySelector("video")?.removeEventListener("ended", sendEvent);
}

/******************************************************************************/

/**
 * 現在視聴しているエピソードのindexを、sortedEpisodesから取得
 * @description indexはグローバル変数に入れる
 */
function getCurrentEpisodeIndex() {
	sortedEpisodesIndex = undefined; // 初期化
	const annictEpisodeData = animeData.sortedEpisodes;

	/* numberTextから取得 */
	if (annictEpisodeData[0].numberText) {
		for (let i = 0; i < annictEpisodeData.length; i++) {
			// abemaの場合は21話以降のエピソードが、エピソード一覧に表示されていないため、numberTextNormalizedを作成していない
			const normalizedEpisode =
				annictEpisodeData[i].numberTextNormalized ||
				episodeNumberExtractor(annictEpisodeData[i].numberText);

			if (normalizedEpisode === currentEpisodeFromWebSite) {
				sortedEpisodesIndex = i;
				return;
			}
		}
	}

	/* numberから取得 */
	if (annictEpisodeData[0].number) {
		for (let i = 0; i < annictEpisodeData.length; i++) {
			if (annictEpisodeData[i].number === currentEpisodeFromWebSite) {
				sortedEpisodesIndex = i;
				return;
			}
		}
	}

	/*
	 * 第1話～第4話のような複数エピソードの場合
	 */
	const splitMultiEpisodes = websiteInfo.currentEpisode.split("～");
	if (splitMultiEpisodes.length === 2) {
		// "～"で分け、それぞれのindexを取得
		const episodeIndex = splitMultiEpisodes.map((episode: string) => {
			return annictEpisodeData.findIndex(
				(episodeData: { numberText: string }) =>
					episodeNumberExtractor(episodeData.numberText) ===
					episodeNumberExtractor(episode),
			);
		});

		if (episodeIndex[1] > episodeIndex[0]) {
			sortedEpisodesIndex = [episodeIndex[0], episodeIndex[1]];
			return;
		}
	}

	// 精度が甘くなるため、一旦コメントアウト
	/*
	 * annictとウェブサイトで次シーズンのエピソードが、１話から始まるか途中から始まるかが異なる
	 * そのためここまでエピソードがない場合は異なっていると判断し、1話から始まるとして扱う
	 */
	// if (!annictEpisodeData[0].numberTextNormalized) {
	// 	sortedEpisodesIndex = websiteInfo.episode.findIndex((episode) => {
	// 		if (episode) {
	// 			return (
	// 				episodeNumberExtractor(episode) ===
	// 				episodeNumberExtractor(websiteInfo.currentEpisode)
	// 			);
	// 		}
	// 		return undefined;
	// 	});
	// 	if (sortedEpisodesIndex !== undefined && sortedEpisodesIndex !== -1) return;
	// }

	sortedEpisodesIndex = undefined;
}

/******************************************************************************/

/**
 * 視聴中のエピソードを記録するための関数
 */
export async function handleRecordEpisode() {
	cleanupIntervalOrEvent(); // 前のイベントを削除

	const notRecordWork = await getNotRecordWork();
	if (!notRecordWork) return;

	if (!animeData.id) {
		setLoading({
			status: "error",
			message: "現時点ではこのアニメに対応していません",
			icon: "immutableNotUpload",
		});
		return;
	}

	// 映画などエピソードがない場合、ステータスのみ変更
	if (
		animeData.episodes.length === 0 &&
		(websiteInfo.episodesCount === 1 || // 本編のみで分割されていない場合
			(animeData.media === "MOVIE" && websiteInfo.currentEpisode === websiteInfo.lastEpisode)) // 分割された映画の場合
	) {
		// ステータスの自動変更がオフの場合
		if (settingData.autoChangeStatus === false) {
			setLoading({
				status: "success",
				message: "ステータス変更がオフになっています",
				icon: "immutableNotUpload",
			});
			return;
		}

		// 送信しない作品の場合
		if (notRecordWork.includes(websiteInfo.workId)) {
			setLoading({
				status: "success",
				message: "",
				icon: "notUpload",
			});
			return;
		}

		// ステータスの自動変更がオンの場合、インターバル・イベントを作成
		createIntervalOrEvent();
		setLoading({ status: "success", message: "", icon: "upload" });
		return;
	}

	// 分割された映画で最終話以外の場合は、なにもしない
	if (animeData.episodes.length === 0) {
		// ステータスの自動変更がオフの場合
		if (settingData.autoChangeStatus === false) {
			setLoading({
				status: "success",
				message: "ステータス変更がオフになっています",
				icon: "immutableNotUpload",
			});
			return;
		}

		setLoading({ status: "success", message: "", icon: "upload" });
		return;
	}

	// ウェブサイトのエピソードから、現在視聴している話数を取り出す
	currentEpisodeFromWebSite = episodeNumberExtractor(websiteInfo.currentEpisode);

	// 現在視聴しているエピソードのindexを、sortedEpisodesから取得
	getCurrentEpisodeIndex();
	if (sortedEpisodesIndex === undefined) {
		setLoading({
			status: "error",
			message: "現時点ではこのアニメに対応していません",
			icon: "immutableNotUpload",
		});
		return;
	}

	// ホバー時の話数表示用のエピソード番号を更新
	if (typeof currentEpisodeFromWebSite === "number") {
		updateCurrentEpisode(currentEpisodeFromWebSite, undefined);
	} else {
		updateCurrentEpisode(currentEpisodeFromWebSite, websiteInfo.currentEpisode);
	}

	// 次のエピソードがAnnictに登録されていない場合は、最新話まで視聴済みと判断
	const isNextEpisodeRegistered = checkNextEpisodeRegistered(danimeDocument());
	if (!isNextEpisodeRegistered) {
		setLoading({
			status: "success",
			message: "",
			icon: "completeUpload",
		});
		return;
	}

	// nextEpisodeがない・1話しかない場合はindexを0にする
	let nextEpisodeIndex: number = 0;
	if (animeData.nextEpisode !== undefined && animeData.episodes.length !== 1) {
		nextEpisodeIndex = animeData.nextEpisode;
	}
	// 現在のエピソードが記録済みの場合は送信しない
	if (typeof sortedEpisodesIndex === "number" && nextEpisodeIndex > sortedEpisodesIndex) {
		setLoading({
			status: "success",
			message: "",
			icon: "completeUpload",
		});
		return;
	}

	// 設定で送信しない作品の場合
	if (notRecordWork.includes(websiteInfo.workId)) {
		setLoading({
			status: "success",
			message: "",
			icon: "notUpload",
		});
		return;
	}

	setLoading({ status: "success", message: "", icon: "upload" });
	createIntervalOrEvent();
}
