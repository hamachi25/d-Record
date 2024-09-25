import { currentAnimeData, setCurrentAnimeData } from "./anime-data-scraper";
import { Episode } from "./types";

// annictメニューのsvg
const noStateD =
	"M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z";
const wannaWatchD = "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z";
const watchingD =
	"M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z";
const watchedD =
	"M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z";
const holdD =
	"M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z";
const stopWatchingD =
	"M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48z";
export const svgPaths = [noStateD, wannaWatchD, watchingD, watchedD, holdD, stopWatchingD];

// ステータスを日本語に変換
export function convertStatusToJapanese(status: string) {
	switch (status) {
		case "WANNA_WATCH":
			return ["見たい", wannaWatchD];
		case "WATCHING":
			return ["見てる", watchingD];
		case "WATCHED":
			return ["見た", watchedD];
		case "ON_HOLD":
			return ["一時中断", holdD];
		case "STOP_WATCHING":
			return ["視聴中止", stopWatchingD];
		default:
			return ["未選択", noStateD];
	}
}

// 視聴ステータスのテキストを変更する
export function changeStatusText(
	status: string,
	setStatusAndSvg: (status: { svgPathD: string; statusText: string }) => void,
) {
	const [statusText, svgPathD] = convertStatusToJapanese(status);

	setStatusAndSvg({
		svgPathD: svgPathD,
		statusText: statusText,
	});
}

// ステータスを"見てる"に変更
export function changeStatusToWatching(mutation: string): string {
	if (currentAnimeData.viewerStatusState !== "WATCHING") {
		// currentAnimeDataのステータスを変更することで、連続で記録ボタンを押した時に再度送らないようにする
		setCurrentAnimeData("viewerStatusState", "WATCHING");

		return (mutation += `
            updateStatus(
                input:{
                    state: WATCHING,
                    workId: "${currentAnimeData.id}"
                }
            ) { clientMutationId }
        `);
	} else {
		return mutation;
	}
}

// ステータスを"見た"に変更
export function changeStatusToWatched(mutation: string): string {
	setCurrentAnimeData("viewerStatusState", "WATCHED");

	return (mutation += `
        updateStatus(
            input:{
                state: WATCHED,
                workId: "${currentAnimeData.id}"
            }
        ) { clientMutationId }
    `);
}

// 現在放送中かどうか
export function isCurrentlyAiring(doc: Document): boolean {
	const titleElement = doc.querySelector(".titleWrap > h1");
	const regex = new RegExp("（全\\d+話）");
	return !regex.test(titleElement?.textContent || "");
}

// 次のエピソードがAnnictに登録されていない時の処理
export function handleUnregisteredNextEpisode(
	doc: Document,
	nextEpisodeIndex: number | undefined,
	episodeData: Episode[],
): boolean {
	if (
		nextEpisodeIndex === undefined && // nextEpisodeがない
		isCurrentlyAiring(doc) && // アニメが放送中
		currentAnimeData.viewerStatusState === "WATCHING" && // ステータスが「見てる」
		episodeData[0].viewerRecordsCount === 1 //１話を１回しか見ていない
	) {
		return true;
	}

	return false;
}
