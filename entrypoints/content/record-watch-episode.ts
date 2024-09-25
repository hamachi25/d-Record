import { setUploadIcon } from "./components/UploadToggleButton";
import { currentAnimeData, setCurrentAnimeData, danimeDocument } from "./anime-data-scraper";
import { fetchData } from "./fetch";
import { settingData, getNotRecordWork } from "./storage";
import {
	changeStatusToWatching,
	changeStatusToWatched,
	isCurrentlyAiring,
	handleUnregisteredNextEpisode,
} from "./utils";

let episodeNumberFromDanime: number | undefined = undefined; // 現在のエピソード(dアニのDOMから取得する)
let episodeIndex: number | undefined = undefined; // 取得したエピソードの中で何番目か(indexから取得するので、3.5話のような話数が入るとずれる)

let sendInterval: NodeJS.Timeout | null = null;
let sendEvent: EventListener | null = null;

export function cleanupIntervalOrEvent() {
	if (sendInterval) clearInterval(sendInterval);
	if (sendEvent) document.querySelector("video")?.removeEventListener("ended", sendEvent);
}

// データ送信
function sendRecord() {
	if (!danimeDocument || episodeIndex === undefined) return;
	const isAiring = isCurrentlyAiring(danimeDocument);

	let mutation = "mutation{";

	// 視聴ステータスが"見てる"以外だった場合、"見てる"に変更(最終回を除く)
	if (
		isAiring === true ||
		episodeNumberFromDanime !==
			currentAnimeData.episodes[currentAnimeData.episodesCount - 1].number
	) {
		mutation = changeStatusToWatching(mutation);
	}

	mutation += `
        createRecord (
            input: { episodeId:"${currentAnimeData.episodes[episodeIndex].id}"}
        ) { clientMutationId }
    `;

	// 最終話だった場合、"見た"に変更
	if (
		isAiring === false && // アニメが放送終了
		episodeNumberFromDanime ===
			currentAnimeData.episodes[currentAnimeData.episodesCount - 1].number && // 最終話
		(settingData.autoChangeStatus === undefined || settingData.autoChangeStatus) // 設定
	) {
		mutation = changeStatusToWatched(mutation);
	}

	mutation += "}";

	fetchData(JSON.stringify({ query: mutation }));

	// 連続再生の場合、nextEpisodeを変更
	if (currentAnimeData.nextEpisode) {
		setCurrentAnimeData("nextEpisode", currentAnimeData.nextEpisode + 1);
	} else {
		setCurrentAnimeData("nextEpisode", 1);
	}

	setUploadIcon("completeUpload");
	cleanupIntervalOrEvent();
}

// インターバルかイベントを作成
export function createIntervalOrEvent() {
	cleanupIntervalOrEvent();

	const video = document.querySelector("video");
	if (!video) {
		setUploadIcon("immutableNotUpload");
		return;
	}

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
		}, 1000);
	} else if (!settingData.sendTiming || settingData.sendTiming == "after-end") {
		sendEvent = () => sendRecord();
		video.addEventListener("ended", sendEvent);
	}
}

// "第5話"のような話数から数字を取得
function episodeNumberExtractor(episode: string): number | undefined {
	const remakeWords: Record<string, number> = {
		〇: 0,
		一: 1,
		二: 2,
		三: 3,
		四: 4,
		五: 5,
		六: 6,
		七: 7,
		八: 8,
		九: 9,
		十: 10,
	};

	// 全角数字を半角数字に変換
	function arabicNumberExtractor(): number | null {
		const numbers = episode
			.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248))
			.match(/\d+/g);

		return numbers ? Number(numbers[0]) : null;
	}

	// 漢数字をアラビア数字に変換する
	function kanjiNumberExtractor(): number | null {
		const arrayKansuuji = [...episode]
			.flatMap((s) => s.match(new RegExp(Object.keys(remakeWords).join("|"))))
			.filter(Boolean);

		if (arrayKansuuji.length >= 1) {
			let num: number = 0;
			arrayKansuuji.forEach((kan) => {
				if (kan) {
					num += remakeWords[kan];
				}
			});
			return num;
		}

		return null;
	}

	// 前編、後編などを識別する
	function specialEpisodeIdentifier(): number | undefined {
		const specialWords: Record<string, number> = {
			本編: 1,
			前編: 1,
			前篇: 1,
			後編: 2,
			後篇: 2,
		};

		// 半角スペース、ノーブレークスペース、全角スペース
		const splitEpisode = episode.split(/\s|\u00A0|\u3000/);
		const episodeWord = splitEpisode[splitEpisode.length - 1];

		return specialWords[episodeWord] || undefined;
	}

	const number = arabicNumberExtractor();
	if (number !== null) return number;

	const kanjiNumber = kanjiNumberExtractor();
	if (kanjiNumber !== null) return kanjiNumber;

	return specialEpisodeIdentifier();
}

// エピソードのindexを取得
function getEpisodeIndex(episodeNumberFromDanime: number | undefined) {
	const episodeData = currentAnimeData.episodes;
	if (!episodeData[0]) return;

	if (episodeData[0].numberText) {
		// numberTextから取得
		episodeData.forEach((episode, i) => {
			const num = episodeNumberExtractor(episode.numberText);
			if (num === episodeNumberFromDanime) {
				episodeIndex = i; // データ送信用のindex（総集編が含まれるとずれる）
			}
		});
	} else if (episodeData[0].number) {
		// numberから取得
		episodeData.forEach((episode: { number: number }, i) => {
			if (episode.number === episodeNumberFromDanime) {
				episodeIndex = i;
			}
		});
	} else if (episodeData.length === 1) {
		episodeIndex = 0;
	}
}

export async function handleRecordEpisode() {
	if (settingData.sendTiming && settingData.sendTiming == "not-send") return;
	if (!currentAnimeData.id || currentAnimeData.episodesCount === 0) return;

	const episode = document.querySelector(".backInfoTxt2")?.textContent;
	if (!episode) {
		setUploadIcon("immutableNotUpload");
		return;
	}

	// エピソードから数字を取り出す
	episodeNumberFromDanime = episodeNumberExtractor(episode);
	if (episodeNumberFromDanime === undefined || episodeNumberFromDanime < 0) {
		setUploadIcon("immutableNotUpload");
		return;
	}

	// エピソードの話数とindexを取得
	getEpisodeIndex(episodeNumberFromDanime);
	if (episodeIndex === undefined) return;

	// 次のエピソードがAnnictに登録されていない場合
	const isNextEpisodeUnregistered = handleUnregisteredNextEpisode(
		danimeDocument,
		currentAnimeData.nextEpisode,
		currentAnimeData.episodes,
	);
	if (isNextEpisodeUnregistered) {
		setUploadIcon("completeUpload");
		return;
	}

	console.log(currentAnimeData.nextEpisode);
	// nextEpisodeがない・1話しかない場合はindexを0にする
	let nextEpisodeIndex: number = 0;
	if (currentAnimeData.nextEpisode !== undefined && currentAnimeData.episodesCount !== 1) {
		nextEpisodeIndex = currentAnimeData.nextEpisode;
	}

	// 現在のエピソードが記録済みの場合は送信しない
	if (nextEpisodeIndex > episodeIndex) {
		setUploadIcon("completeUpload");
		return;
	}

	// 送信しない作品の場合
	const partId = location.href.match(/(?<=partId=)\d+/);
	const workId = partId && partId[0].substring(0, 5);

	const notRecordWork = await getNotRecordWork();
	if (notRecordWork.includes(Number(workId))) {
		setUploadIcon("notUpload");
		return;
	}

	setUploadIcon("upload");
	createIntervalOrEvent();
}
