import { animeData } from "./anime-data-scraper";
import { Episode, NextEpisode } from "./types";

// annictメニューのsvg
const noStateD =
    "M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z";
const watchedD =
    "M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z";
const watchingD =
    "M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z";
const wannaWatchD = "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z";
const holdD =
    "M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z";
const stopWatchingD =
    "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48z";
export const svgPaths = [noStateD, watchedD, watchingD, wannaWatchD, holdD, stopWatchingD];

export let statusText = "";
export let svgPathD = "";

// ステータスを日本語に変換
export function convertStatusToJapanese(status: string | undefined) {
    switch (status) {
        case "NO_STATE":
            statusText = "未選択";
            svgPathD = svgPaths[0];
            break;
        case "WATCHED":
            statusText = "見た";
            svgPathD = svgPaths[1];
            break;
        case "WATCHING":
            statusText = "見てる";
            svgPathD = svgPaths[2];
            break;
        case "WANNA_WATCH":
            statusText = "見たい";
            svgPathD = svgPaths[3];
            break;
        case "ON_HOLD":
            statusText = "一時中断";
            svgPathD = svgPaths[4];
            break;
        case "STOP_WATCHING":
            statusText = "視聴中止";
            svgPathD = svgPaths[5];
    }
}

// 視聴ステータスのテキストを変更する
export function changeStatusText(status: string | undefined) {
    convertStatusToJapanese(status);
    const label = document.querySelector("#annict > div > span");
    if (label) {
        label.textContent = statusText;
        document.querySelector("#annict > div > svg > path")?.setAttribute("d", svgPathD);
    }
}

// ステータスが"見てる"ではない場合は、"見てる"に変更
export function changeStatusToWatching(mutation: string): string {
    if (animeData.viewerStatusState !== "WATCHING") {
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

// ステータスを"見た"に変更
export function changeStatusToWatched(mutation: string): string {
    return (
        mutation += `
            updateStatus(
                input:{
                    state: WATCHED,
                    workId: "${animeData.id}"
                }
            ) { clientMutationId }
        `
    );
}

export function getNextEpisodeIndex(viewData: NextEpisode[], episodeData: Episode[]): number | undefined {
    let viewIndex;// viewer > libraryEntries内のindex
    for (const [i, libraryEntry] of viewData.entries()) {
        if (libraryEntry.work.annictId == animeData.annictId) {
            viewIndex = i;
            break;
        }
    }
    // nextEpisodeのindex 
    let nextEpisodeIndex: number;
    if (viewIndex !== undefined && viewData[viewIndex].nextEpisode) {
        for (const [i, episode] of episodeData.entries()) {
            if (episode.annictId == viewData[viewIndex].nextEpisode.annictId) {
                nextEpisodeIndex = i;
                return nextEpisodeIndex;
            }
        }
    }
    return undefined;
}

// 次のエピソードがAnnictに登録されていない時の処理
export let isAiring: boolean;
export function handleUnregisteredNextEpisode(doc: Document, nextEpisodeIndex: number | undefined, episodeData: Episode[]): boolean {
    const titleElement = doc.querySelector(".titleWrap > h1");
    const regex = new RegExp("（全\\d+話）");
    isAiring = !regex.test(titleElement?.textContent || "");

    if (
        nextEpisodeIndex === undefined && // nextEpisodeがない
        isAiring && // アニメが放送中
        animeData.viewerStatusState == "WATCHING" && // ステータスが「見てる」
        episodeData[0].viewerRecordsCount == 1 //１話を１回しか見ていない
    ) {
        return true;
    }

    return false;
}

