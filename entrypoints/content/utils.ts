import { animeData, setAnimeData } from "./anime-data-scraper";

// annictメニューのsvg
const noStateD =
	"M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z";
const noStateViewBox = "0 0 460 512";
const wannaWatchD = "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z";
const wannaWatchViewBox = "0 0 512 512";
const watchingD =
	"M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z";
const watchingViewBox = "0 0 448 512";
const watchedD =
	"M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z";
const watchedViewBox = "0 0 512 512";
const holdD =
	"M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z";
const holdViewBox = "0 0 448 512";
const stopWatchingD =
	"M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48z";
const stopWatchingViewBox = "0 0 448 512";

// annictメニューのsvgパスとviewBoxのオブジェクト
export const svgPaths = {
	noState: [noStateD, noStateViewBox],
	wannaWatch: [wannaWatchD, wannaWatchViewBox],
	watching: [watchingD, watchingViewBox],
	watched: [watchedD, watchedViewBox],
	hold: [holdD, holdViewBox],
	stopWatching: [stopWatchingD, stopWatchingViewBox],
};

/**
 * ステータスを日本語に変換し、svgパスとviewBoxを返す
 */
export function convertStatusToJapanese(status: string) {
	switch (status) {
		case "WANNA_WATCH":
			return ["見たい", wannaWatchD, wannaWatchViewBox];
		case "WATCHING":
			return ["見てる", watchingD, watchingViewBox];
		case "WATCHED":
			return ["見た", watchedD, watchedViewBox];
		case "ON_HOLD":
			return ["一時中断", holdD, holdViewBox];
		case "STOP_WATCHING":
			return ["視聴中止", stopWatchingD, stopWatchingViewBox];
		default:
			return ["未選択", noStateD, noStateViewBox];
	}
}

/**
 * 視聴ステータスのテキストを更新する
 */
export function changeStatusText(
	status: string,
	setStatusAndSvg: (status: { svgPathD: string; svgViewBox: string; statusText: string }) => void,
) {
	const [statusText, svgPathD, svgViewBox] = convertStatusToJapanese(status);

	setStatusAndSvg({
		svgPathD: svgPathD,
		svgViewBox: svgViewBox,
		statusText: statusText,
	});
}

/******************************************************************************/

/**
 * ステータスを"見てる"に変更
 */
export function changeStatusToWatching(mutation: string): string {
	if (animeData.viewerStatusState !== "WATCHING") {
		// AnimeDataのステータスを変更することで、連続で記録ボタンを押した時に再度送らないようにする
		updateViewerStatus("WATCHING");

		return (mutation += `
            updateStatus(
                input:{
                    state: WATCHING,
                    workId: "${animeData.id}"
                }
            ) { clientMutationId }
        `);
	} else {
		return mutation;
	}
}

/**
 * ステータスを"見た"に変更
 */
export function changeStatusToWatched(mutation: string): string {
	updateViewerStatus("WATCHED");

	return (mutation += `
        updateStatus(
            input:{
                state: WATCHED,
                workId: "${animeData.id}"
            }
        ) { clientMutationId }
    `);
}

/******************************************************************************/

/**
 * 現在放送中かどうかを判定
 */
export function isCurrentlyAiring(doc: Document | undefined): boolean {
	if (!doc) return false;

	const titleElement = doc.querySelector(".titleWrap > h1");
	const regex = new RegExp("（全\\d+話）");
	return !regex.test(titleElement?.textContent || "");
}

/******************************************************************************/

/**
 * 次のエピソードがAnnictに登録されているかどうかを判定
 */
export function handleUnregisteredNextEpisode(doc: Document | undefined): boolean {
	if (
		animeData.nextEpisode === undefined && // nextEpisodeがない
		isCurrentlyAiring(doc) && // アニメが放送中
		animeData.viewerStatusState === "WATCHING" && // ステータスが「見てる」
		animeData.sortedEpisodes[0].viewerRecordsCount === 1 //１話を１回しか見ていない
	) {
		return true;
	}

	return false;
}

/******************************************************************************/

/**
 * アニメデータの視聴ステータスを更新
 */
export function updateViewerStatus(status: string) {
	setAnimeData("viewerStatusState", status);
}

/**
 * 現在視聴しているエピソードを更新
 */
export function updateCurrentEpisode(
	normalized: number | string,
	raw: number | string | undefined,
) {
	batch(() => {
		setAnimeData("currentEpisode", "normalized", normalized);
		setAnimeData("currentEpisode", "raw", raw);
	});
}

/******************************************************************************/

/**
 * エピソード番号を取り出す
 * @description "第5話"のような話数から数字を取得
 */
export function episodeNumberExtractor(episode: string): number | string {
	// 全角数字を半角数字に変換
	function arabicNumberExtractor(): number | undefined {
		const numbers = episode
			.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248))
			.match(/\d+/g);

		return numbers?.length === 1 ? Number(numbers[0]) : undefined;
	}

	// 漢数字をアラビア数字に変換
	function kanjiNumberExtractor(): number | undefined {
		// prettier-ignore
		const kanjiNums: Record<string, number> = {
			〇: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
			零: 0, 壱: 1, 弐: 2, 参: 3, 伍: 5,
			壹: 1, 貳: 2, 參: 3, 肆: 4, 陸: 6, 漆: 7, 捌: 8, 玖: 9, // サクラ大戦
		};

		// prettier-ignore
		const kanjiPlace: Record<string, number> = {
			十: 10, 拾: 10, 百: 100,
		};

		let result = 0;
		let temp = 0;

		for (let i = 0; i < episode.length; i++) {
			const char = episode[i];

			if (Object.prototype.hasOwnProperty.call(kanjiNums, char)) {
				temp = kanjiNums[char];
			} else if (Object.prototype.hasOwnProperty.call(kanjiPlace, char)) {
				if (temp === 0) temp = 1;
				temp *= kanjiPlace[char];
				result += temp;
				temp = 0;
			}
		}
		result += temp;

		if (result === 0) return undefined;

		return result;
	}

	// 話数が文字列の場合の場合は、半角英数字に変換
	function specialEpisodeIdentifier(): string {
		return episode
			.replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248))
			.toLowerCase()
			.replace(/\s/g, "");
	}

	const number = arabicNumberExtractor();
	if (number !== undefined) return number;

	const kanjiNumber = kanjiNumberExtractor();
	if (kanjiNumber !== undefined) return kanjiNumber;

	return specialEpisodeIdentifier();
}

/******************************************************************************/
