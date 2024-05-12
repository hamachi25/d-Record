import { animeData } from "./anime-data-scraper";

export let statusText = "";
export let svgPathD = "";

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

// ステータスを日本語に変換
export function convertStatusToJapanese(status: string | undefined) {
    switch (status) {
        case "NO_STATE":
            statusText = "未選択";
            svgPathD = noStateD;
            break;
        case "WATCHED":
            statusText = "見た";
            svgPathD = watchedD;
            break;
        case "WATCHING":
            statusText = "見てる";
            svgPathD = watchingD;
            break;
        case "WANNA_WATCH":
            statusText = "見たい";
            svgPathD = wannaWatchD;
            break;
        case "ON_HOLD":
            statusText = "一時中断";
            svgPathD = holdD;
            break;
        case "STOP_WATCHING":
            statusText = "視聴中止";
            svgPathD = stopWatchingD;
    }
}

// 視聴ステータスを変更する
export function changeStatusText(status: string | undefined) {
    convertStatusToJapanese(status);
    const label = document.querySelector("#annict > div > span");
    if (label) {
        label.textContent = statusText;
        document.querySelector("#annict > div > svg > path")?.setAttribute("d", svgPathD);
    }
}

// ステータスが"見てる"ではない場合は、見てるに変更
export function changeStatusToWatching(mutation: string) {
    if (animeData.viewerStatusState != "WATCHING") {
        changeStatusText("WATCHING");
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
