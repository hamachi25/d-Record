import { animeData, setAnimeData } from "../core/anime-data-scraper";
import { stateIcons } from "./svg";

const { noState, wannaWatch, watching, watched, hold, stopWatching } = stateIcons;

/**
 * ステータスを日本語に変換し、svgパスとviewBoxを返す
 */
export function convertStatusToJapanese(status: string) {
	switch (status) {
		case "WANNA_WATCH":
			return ["見たい", wannaWatch[0], wannaWatch[1]];
		case "WATCHING":
			return ["見てる", watching[0], watching[1]];
		case "WATCHED":
			return ["見た", watched[0], watched[1]];
		case "ON_HOLD":
			return ["一時中断", hold[0], hold[1]];
		case "STOP_WATCHING":
			return ["視聴中止", stopWatching[0], stopWatching[1]];
		default:
			return ["未選択", noState[0], noState[1]];
	}
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
 * アニメデータの視聴ステータスを更新
 */
export function updateViewerStatus(status: string) {
	setAnimeData("viewerStatusState", status);
}
