import { setUploadIcon } from "./components/UploadToggleButton";
import { animeData, danimeDocument, setLoading } from "./anime-data-scraper";
import { fetchData } from "./fetch";
import { settingData, getNotRecordWork } from "./storage";
import {
	changeStatusToWatching,
	changeStatusToWatched,
	episodeNumberExtractor,
	isCurrentlyAiring,
	handleUnregisteredNextEpisode,
	updateCurrentEpisode,
} from "./utils";

/******************************************************************************/

let episodeNumberFromDanime: number | string | undefined = undefined; // 現在のエピソード(dアニのDOMから取得する)
let episodeIndex: number | undefined = undefined; // 取得したエピソードの中で何番目か(indexから取得するので、3.5話のような話数が入るとずれる)

// データ送信
function sendRecord() {
	if (!danimeDocument) return;
	const isAiring = isCurrentlyAiring(danimeDocument);

	let mutation = "mutation{";

	// 視聴ステータスが"見てる"以外だった場合、"見てる"に変更(最終回を除く)
	if (
		isAiring === true ||
		(animeData.sortedEpisodes.length !== 0 &&
			episodeNumberFromDanime !==
				animeData.sortedEpisodes[animeData.sortedEpisodes.length - 1].number)
	) {
		mutation = changeStatusToWatching(mutation);
	}

	if (episodeIndex !== undefined) {
		mutation += `
    	    createRecord (
    	        input: { episodeId:"${animeData.sortedEpisodes[episodeIndex].id}"}
    	    ) { clientMutationId }
    	`;
	}

	// 最終話だった場合、"見た"に変更
	if (
		isAiring === false && // アニメが放送終了
		animeData.sortedEpisodes.length !== 0 &&
		episodeNumberFromDanime ===
			animeData.sortedEpisodes[animeData.sortedEpisodes.length - 1].number && // 最終話
		(settingData.autoChangeStatus === undefined || settingData.autoChangeStatus) // 設定
	) {
		mutation = changeStatusToWatched(mutation);
	}

	// 映画などエピソードがない場合、ステータスのみ変更
	if (episodeIndex === undefined) mutation = changeStatusToWatched(mutation);

	mutation += "}";

	fetchData(JSON.stringify({ query: mutation }));

	setUploadIcon("completeUpload");
	cleanupIntervalOrEvent();
}

// インターバルかイベントを作成
let sendInterval: NodeJS.Timeout | undefined = undefined;
let sendEvent: EventListener | undefined = undefined;
export function createIntervalOrEvent() {
	const video = document.querySelector("video");
	if (!video) return;

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

export function cleanupIntervalOrEvent() {
	if (sendInterval) clearInterval(sendInterval);
	if (sendEvent) document.querySelector("video")?.removeEventListener("ended", sendEvent);
}

/******************************************************************************/

// エピソードのindexを取得
function getEpisodeIndex(episodeNumberFromDanime: number | string) {
	episodeIndex = undefined; // 初期化
	const episodeData = animeData.sortedEpisodes;

	console.log(episodeData);
	if (episodeData[0].numberText) {
		// numberTextから取得
		for (let i = 0; i < episodeData.length; i++) {
			const episode = episodeData[i];
			const num = episodeNumberExtractor(episode.numberText);
			if (num === episodeNumberFromDanime) {
				episodeIndex = i; // データ送信用のindex（総集編が含まれるとずれる）
				break;
			}
		}
		return;
	} else if (episodeData[0].number) {
		// numberから取得
		for (let i = 0; i < episodeData.length; i++) {
			const episode = episodeData[i];
			if (episode.number === episodeNumberFromDanime) {
				episodeIndex = i;
				break;
			}
		}
		return;
	} else if (episodeData.length === 1) {
		episodeIndex = 0;
		return;
	}

	episodeIndex = undefined;
}

/******************************************************************************/

export async function handleRecordEpisode() {
	cleanupIntervalOrEvent(); // 前のイベントを削除

	const partId = location.href.match(/(?<=partId=)\d+/);
	const workId = partId && partId[0].substring(0, 5);
	const notRecordWork = await getNotRecordWork();

	// 設定
	if (settingData.sendTiming && settingData.sendTiming == "not-send") {
		setUploadIcon("immutableNotUpload");
		return;
	}

	if (!animeData.id) {
		setUploadIcon("immutableNotUpload");
		setLoading({
			status: "error",
			message: "現時点ではこのアニメに対応していません",
		});
		return;
	}

	const episodeElements: NodeListOf<HTMLElement> =
		danimeDocument.querySelectorAll("a[id].clearfix");

	// 映画などエピソードがない場合、ステータスのみ変更
	if (animeData.episodes.length === 0 && episodeElements.length === 1) {
		// 送信しない作品の場合
		if (notRecordWork.includes(Number(workId))) {
			setUploadIcon("notUpload");
			return;
		}

		if (settingData.autoChangeStatus === undefined || settingData.autoChangeStatus) {
			// ステータスの自動変更がオンの場合、イベントを作成
			createIntervalOrEvent();
			setUploadIcon("upload");
			return;
		} else {
			// ステータスの自動変更がオフの場合
			setUploadIcon("immutableNotUpload");
			return;
		}
	}

	// 複数のチャプターに分かれている映画
	if (animeData.episodes.length === 0) {
		setUploadIcon("immutableNotUpload");
		setLoading({
			status: "error",
			message: "現時点ではこのアニメに対応していません",
		});
		return;
	}

	const episode = document.querySelector(".backInfoTxt2")?.textContent;
	if (!episode) return;

	// エピソードから数字を取り出す
	episodeNumberFromDanime = episodeNumberExtractor(episode);

	// エピソードの話数とindexを取得
	getEpisodeIndex(episodeNumberFromDanime);
	if (episodeIndex === undefined) {
		setLoading({
			status: "error",
			message: "現時点ではこのアニメに対応していません",
		});
		setUploadIcon("immutableNotUpload");
		return;
	}

	// 次のエピソードがAnnictに登録されていない場合
	const isNextEpisodeUnregistered = handleUnregisteredNextEpisode(
		danimeDocument,
		animeData.nextEpisode,
		animeData.sortedEpisodes,
	);
	if (isNextEpisodeUnregistered) {
		setUploadIcon("completeUpload");
		return;
	}

	// nextEpisodeがない・1話しかない場合はindexを0にする
	let nextEpisodeIndex: number = 0;
	if (animeData.nextEpisode !== undefined && animeData.episodes.length !== 1) {
		nextEpisodeIndex = animeData.nextEpisode;
	}

	// 現在のエピソードが記録済みの場合は送信しない
	// 1話目が1話目でない場合は送信しない(長編アニメ)
	if (nextEpisodeIndex > episodeIndex && animeData.sortedEpisodes[0].number === 1) {
		setUploadIcon("completeUpload");
		return;
	}

	// 送信しない作品の場合
	if (notRecordWork.includes(Number(workId))) {
		setUploadIcon("notUpload");
		return;
	}

	setLoading({ status: "success", message: "" });
	setUploadIcon("upload");
	if (typeof episodeNumberFromDanime === "number") {
		updateCurrentEpisode(episodeNumberFromDanime, undefined);
	} else {
		updateCurrentEpisode(episodeNumberFromDanime, episode);
	}

	createIntervalOrEvent();
}
