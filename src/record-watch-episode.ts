import { query, remakeString, findCorrectAnime } from "./anime-data-scraper";
import { fetchData } from "./fetch";
import { settingData } from "./get-local-storage";
import { Work, Episode } from "./types";
import { getProductionYear } from "./anime-data-scraper";

let notRecordArray: number[];
let data: Work[];
let dataEpisodes: Episode[];
let animeIndex = 0;
let episodeIndex = -1; // 現在のエピソードの話数(numbertextから取得する)
let dataEpisodesIndex = -1; // 取得したエピソードの中で何番目か(indexから)
let timerId: number;
let buttonState = true;

const uploadIcon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAWJAAAFiQFtaJ36AAABJ0lEQVRYhe2XsW3DMBBFn4IM4FGUCaz0LjKC07pKNuAIHkEj2Bs4G2iEuEtpd+kuDQMTMo/WUbYIB/kAIepE3j3pTiRYiQgl9VA0+hUAFr7lS0Ry20pOWuX6yQ2+lHMtpwKIBc+GsAavg2DfCkRt8Wktwpm/HoE2sG+D/sHi0ArQAc9ADXz17E/+2afF4aMR4ADsEnBmaV/AARJp7QCfrTLXRUcrxZHS2o9xgc152/rC3NFF2C++2NsfLQ6H1MAHp7xvSOe6Axrgxd83wHwswA4tfzrEL6S7BHD3u2FRgE7pm2RdiEJtgNegPzkADFuYkrrrGvgbAENqoMG2EPXnJlVJ/Fxwq8NC1TdoKTBtKGOkAbwB+yvG2QPvsQdaCiZT8b/gH6A4wA9MTTwvPMgvWAAAAABJRU5ErkJggg==";
const notUploadIcon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAWJAAAFiQFtaJ36AAABv0lEQVRYhdWXMU7DMBSGvyIOkBvAyEZgYS0MiAEJNiQWMneh3CDcoNygDDCHka2cgHZjLBuIpRULTI/Btmocp42TlIpfsho9P/v/+/L7WWmJCKvE2krZGxBwrEd1iEjV0ZEZOlX3qUqeSB7JXwnwkZcVEdcVEFtkXwUiciQiEolIZuWkZi7UhJH+nQJ9K/5gPU+cNTEwBE58G4YKGAL7etM3J76j58ZWPAEGwIazz8A8rAcKmNiLPeJs9IBLJza1RAHFFUgB8Yx+CZH3OtclfwfaQPYrWmC2eejpnNRjqrsFa3NcoR5wzWejC5wH7lfKA0/M3llG/l0DnALbTuwbePHEgwUMUJ6YB5dkhHrf3UUC6lxGWwXxG9QxdfuBF6HH0CAFzpzYFPWP+yEbhQqINIHb1T6AQ/z+aExAjDKh29WegQNKltxFWQ8k+FvqNbBblRzKVeAI2HNipqVmuewlCHDJR6hzP65LDuHH8BZ1vhshB38FugW5j5q4aN6H9qKElsy+CyLUFXoRQBCKlhswFYhQLp/bNpcB44HYQ/7ZIM8rcOWbMBXYtGKVWmpVGA9s6tGm+MpdqoCV4d9/nNbGD5zxXDUg8eVTAAAAAElFTkSuQmCC";
const completeUploadIcon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAWJAAAFiQFtaJ36AAABuElEQVRYhe2XMVLCQBSGPxx7OYJjY0k8AdjryBFSU+EJjDfAG0Bnp94AbgClHXR2ko7uWWQzLC+7ySZkcJzxn9kJ83bz/i9vHxvoiAi/qbNfdW8B4M6M5hKRpmMke42a5mlqHktR8akAXOZVEJGIbM2a+TEAkWW280BEJeYiIkt7vm4Tds01BaZW/MP6vFXr58CFL2FdgCVwC0TAl4rfmLl1ifkKGNgJz2sCbE1SH1yu3LxnxVIg5rBC3gokgDjGNAByCnwrc4BXBZnJ0TCDki4XEZmYtYkVS0xsUnFvobH1FkyAfsnT6ebTuqoqj1ZIDyzY7/s7rjJmGgP3KvYJXNcBWFKsQJesJ8oUAQ8q9myuT2U36iYcAy8q1iOrQBe/tPmMamgnQA6h1Q+AsM3jEHMfgE+6EqljzaKOOeB9F5RpKSJDdb7n8a7Kk6g1Ba+QCszU0/aAN9xH7MEpF6IQgLVJ7io5Jj5sYh4KANnX0wWRmvi6iXkdABtipcx9B1OQOuL+WW4H7ZMw1yXZ63hXkX/A4cHWaQLQpgoAvi3wNVzr8gGMgU2LPhvg0TXh24KT6c//NfsHOFo/yRXSAr05KLUAAAAASUVORK5CYII=";

const uploadButtonElement = `
    <div id="upload-anime-title" data-upload="true">
        <span></span>
    </div>
    <div id="upload-icon-container" class="mainButton" title="" data-upload="true">
        <img id="upload-icon" src="${uploadIcon}">
    </div>
`;

// アップロードボタンのクリックイベント
function uploadButtonEvent(
    uploadIconContainer: HTMLElement | null,
    uploadIconElement: HTMLElement | null,
    url: any[]
) {
    uploadIconContainer?.addEventListener("click", () => {
        if (uploadIconContainer && uploadIconElement && buttonState) {
            if (uploadIconContainer.dataset.upload == "true") {
                // アップロードしないに切り替え
                uploadIconElement.setAttribute("src", notUploadIcon);
                uploadIconContainer.dataset.upload = "false";
                // タイマーもしくはイベントを削除
                if (!settingData.sendTiming || settingData.sendTiming == "after-start") {
                    timerId && clearInterval(timerId);
                } else if (settingData.sendTiming == "after-end") {
                    document.querySelector("video")?.removeEventListener("ended", sendRecord);
                }

                // ストレージにセット
                notRecordArray.push(Number(url[0]));
                chrome.storage.local.set({ notRecordWork: notRecordArray });
            } else {
                // するに切り替え
                uploadIconElement.setAttribute("src", uploadIcon);
                uploadIconContainer.dataset.upload = "true";
                sendInterval(uploadIconContainer, uploadIconElement);

                // ストレージから削除
                chrome.storage.local.get("notRecordWork", (result) => {
                    notRecordArray = result.notRecordWork || [];
                    notRecordArray = notRecordArray.filter((item) => item != Number(url[0]));
                    chrome.storage.local.set({ notRecordWork: notRecordArray });
                });
            }
        }
    });
}

// アップロードしないボタンに切り替え
function switchNotUploadIcon(
    uploadIconContainer: HTMLElement | null,
    uploadIconElement: HTMLElement | null
) {
    buttonState = false; // クリックイベントを無効化
    if (uploadIconContainer && uploadIconElement) {
        uploadIconContainer.dataset.upload = "false";
        uploadIconElement.setAttribute("src", notUploadIcon);
        uploadIconElement.style.opacity = "0.3";
    }
}

function sendRecord() {
    const titleElement = doc.querySelector(".titleWrap > h1");
    const regex = new RegExp("（全\\d+話）");

    let mutation = "mutation{";
    // 視聴ステータスが"見てる"以外だった場合、"見てる"に変更
    if (
        data[animeIndex]?.viewerStatusState !== "WATCHING" &&
        !(
            titleElement?.textContent &&
            regex.test(titleElement.textContent) &&
            episodeIndex + 1 === dataEpisodes[dataEpisodes.length - 1].number
        ) //最終回だった場合はステータスを変更しない
    ) {
        mutation += `
            updateStatus(
                input:{
                    state: WATCHING,
                    workId: "${data[animeIndex].id}"
                }
            ) { clientMutationId }
        `;
    }
    mutation += `
        createRecord (
            input: { episodeId:"${dataEpisodes[dataEpisodesIndex].id}"}
        ) { clientMutationId }
    `;
    // 最終話だった場合、"見た"に変更
    if (
        titleElement?.textContent &&
        regex.test(titleElement.textContent) && // アニメが放送終了
        episodeIndex + 1 === dataEpisodes[dataEpisodes.length - 1].number && // 最終話
        (settingData.autoChangeStatus == undefined || settingData.autoChangeStatus) // 設定
    ) {
        mutation += `
            updateStatus(
                input:{
                    state: WATCHED,
                    workId: "${data[animeIndex].id}"
                }
            ) { clientMutationId }
        `;
    }

    mutation += "}";
    fetchData(JSON.stringify({ query: mutation }));

    const uploadIconElement = document.getElementById("upload-icon");
    uploadIconElement?.setAttribute("src", completeUploadIcon);
    document.querySelector("video")?.removeEventListener("ended", sendRecord);
    buttonState = false;
}

// データ送信
function sendInterval(
    uploadIconContainer: HTMLElement | null,
    uploadIconElement: HTMLElement | null
) {
    if (!buttonState) {
        timerId && clearInterval(timerId);
        return;
    }
    const video = document.querySelector("video");
    if (!video) {
        switchNotUploadIcon(uploadIconContainer, uploadIconElement);
        return;
    }

    if (!settingData.sendTiming || settingData.sendTiming == "after-start") {
        let startTime = Date.now();
        const startVideoTime = video.currentTime;
        timerId = setInterval(() => {
            // 視聴開始からの時間・動作再生時間の両方が5分以上の場合に送信
            if (
                video &&
                Date.now() - startTime > 5 * 60 * 1000 &&
                video.currentTime - startVideoTime > 5 * 60
            ) {
                sendRecord();
                timerId && clearInterval(timerId);
            }
        }, 30 * 1000);
    } else if (settingData.sendTiming == "after-end") {
        video.addEventListener("ended", sendRecord);
    }
}

// "第5話"のような話数から数字を取得する
class EpisodeNumberExtractor {
    private remakeWords: Record<string, number> = {
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

    private episode: string;

    constructor(episode: string) {
        this.episode = episode;
    }

    // 全角数字を半角数字に変換して数値を取り出す
    private ArabicNumberExtractor(): number | null {
        const numbers = this.episode
            .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248))
            .match(/\d+/g);

        return numbers ? Number(numbers[0]) : null;
    }

    // 漢数字をアラビア数字に変換する
    private KanjiNumberExtractor(): number | null {
        const arrayKansuuji = [...this.episode]
            .flatMap((s) => s.match(new RegExp(Object.keys(this.remakeWords).join("|"))))
            .filter(Boolean);

        if (arrayKansuuji.length >= 1) {
            let num: number = 0;
            arrayKansuuji.forEach((kan) => {
                if (kan) {
                    num += this.remakeWords[kan];
                }
            });
            return num;
        }

        return null;
    }

    // 前編、後編などを識別する
    private SpecialEpisodeIdentifier(): number {
        const specialWords: Record<string, number> = {
            前編: 1,
            前篇: 1,
            本編: 1,
            後編: 2,
            後篇: 2,
        };

        const splitEpisode = this.episode.split(/ | |　/);
        const episodeWord = splitEpisode[splitEpisode.length - 1];

        return specialWords[episodeWord] || -1;
    }

    public extractNumber(): number {
        const number = this.ArabicNumberExtractor();
        if (number !== null) return number;

        const kanjiNumber = this.KanjiNumberExtractor();
        if (kanjiNumber !== null) return kanjiNumber;

        return this.SpecialEpisodeIdentifier();
    }
}

// 作品ページのhtmlから放送時期を取得
let doc: Document;
async function getAnimeYear(html: string, retry: boolean) {
    const parser = new DOMParser();
    doc = parser.parseFromString(html, "text/html");
    return getProductionYear(doc, retry);
}

async function getDataFromDanime(url: number) {
    const requestURL = "https://animestore.docomo.ne.jp/animestore/ci_pc?workId=" + url;
    try {
        const response = await fetch(requestURL);
        if (!response.ok) {
            throw new Error("ネットワークエラー");
        }
        return await response.text();
    } catch (error) {
        console.error(error);
    }
}

// Annictからデータを取得
async function getAnimedata(url: number, title: string) {
    // dアニメストアから作品ページのhtmlを取得
    const html = await getDataFromDanime(url);
    if (!html) return;

    const remakeTitle = remakeString(title, false);
    const variables = {
        titles: remakeTitle,
        seasons: await getAnimeYear(html, false),
    };

    const response = await fetchData(JSON.stringify({ query: query, variables: variables }));
    const json = await response.json();
    data = json.data.searchWorks.nodes;

    // 失敗したら再度実行
    if (data.length <= 0) {
        const variables = {
            titles: remakeString(remakeTitle, true),
            seasons: await getAnimeYear(html, true),
        };
        const response = await fetchData(JSON.stringify({ query: query, variables: variables }));
        const json = await response.json();
        data = json.data.searchWorks.nodes;
        return json.data.viewer.libraryEntries.nodes;
    }
    return json.data.viewer.libraryEntries.nodes;
}

export function sendWathingAnime() {
    if (settingData.sendTiming && settingData.sendTiming == "not-send") return; // 自動送信しない設定の場合

    // 前の話数のボタンが残っていたら削除
    document.getElementById("upload-icon-container")?.remove();
    document.getElementById("upload-anime-title")?.remove();
    document.querySelector("video")?.removeEventListener("ended", sendRecord); // 前のイベントを削除

    document
        .querySelector(".buttonArea > .time")
        ?.insertAdjacentHTML("afterend", uploadButtonElement);

    const uploadIconContainer = document.getElementById("upload-icon-container");
    const uploadIconElement = document.getElementById("upload-icon");
    const url = location.href.match(/(?<=partId=)\d+/); // URLからworkIdを取得
    if (!url || !uploadIconContainer || !uploadIconElement) return;
    uploadButtonEvent(uploadIconContainer, uploadIconElement, url);

    // ストレージから配列を取得し、notRecordWorkに該当しているか確認
    chrome.storage.local.get("notRecordWork", async (result) => {
        notRecordArray = result.notRecordWork || [];
        const notRecordEpisode = notRecordArray.includes(Number(url[0]));

        const title = document.querySelector(".backInfoTxt1")?.textContent;
        const episode = document.querySelector(".backInfoTxt2")?.textContent;
        if (!title || !episode) {
            switchNotUploadIcon(uploadIconContainer, uploadIconElement);
            return;
        }

        // エピソードから数字を取り出す
        const episodeNumberExtractor = new EpisodeNumberExtractor(episode);
        let episodeNumber = episodeNumberExtractor.extractNumber();
        if (episodeNumber < 0) {
            switchNotUploadIcon(uploadIconContainer, uploadIconElement);
            return;
        }

        // Annictからデータを取得
        const workId = Number(url[0].substring(0, 5));
        const viewData = await getAnimedata(workId, title);
        if (data.length <= 0) {
            switchNotUploadIcon(uploadIconContainer, uploadIconElement);
            return;
        }

        // 取得したアニメからタイトルが一致するものを探す
        if (data.length >= 2) {
            animeIndex = findCorrectAnime(title, data);
            // 見つからなかった場合
            if (animeIndex == -1) {
                switchNotUploadIcon(uploadIconContainer, uploadIconElement);
                return;
            }
        }

        // エピソード数が0の場合はスキップ
        if (data[animeIndex].episodesCount == 0) {
            switchNotUploadIcon(uploadIconContainer, uploadIconElement);
            return;
        }

        if (!notRecordEpisode && !settingData.animeTitle) {
            // 右下に取得したアニメタイトルを表示
            const titleElement = document.querySelector("#upload-anime-title > span");
            titleElement && (titleElement.textContent = data[animeIndex].title);

            // 7秒後にタイトルを非表示
            const titleContainerElement = document.getElementById("upload-anime-title");
            titleContainerElement &&
                setTimeout(() => {
                    titleContainerElement.style.display = "none";
                }, 7000);
        }
        uploadIconContainer.setAttribute("title", data[animeIndex].title); // ボタンにタイトル属性を追加

        // 現在のエピソードに一致するindexを取得
        dataEpisodes = data[animeIndex].episodes.nodes;
        if (dataEpisodes[0] && dataEpisodes[0].numberText) {
            // numberTextから取得
            dataEpisodes.forEach((dataEpisode, i) => {
                const episodeNumberExtractor = new EpisodeNumberExtractor(dataEpisode.numberText);
                const num = episodeNumberExtractor.extractNumber();
                if (num == episodeNumber) {
                    episodeIndex = num - 1; // numberTextから取得することで、総集編を省く
                    dataEpisodesIndex = i; // データ送信用（総集編含む）
                }
            });
        } else if (dataEpisodes.length === 1) {
            episodeIndex = 0;
            dataEpisodesIndex = 0;
        }

        // 視聴済みのエピソードの場合スキップ
        // viewer > libraryEntriesの中で何番目か取得
        let viewIndex;
        for (const [i, libraryEntry] of viewData.entries()) {
            if (libraryEntry.work.annictId == data[animeIndex].annictId) {
                viewIndex = i;
                break;
            }
        }
        // nextEpisodeが何話目か
        let index;
        if (viewIndex !== undefined && viewData[viewIndex].nextEpisode) {
            for (const [i, dataEpisode] of dataEpisodes.entries()) {
                if (dataEpisode.annictId == viewData[viewIndex].nextEpisode.annictId) {
                    index = i;
                    break;
                }
            }
        }

        // 放送中に次のエピソードが登録されていない時の処理
        // 視聴済みに設定する
        const titleElement = doc.querySelector(".titleWrap > h1");
        const regex = new RegExp("（全\\d+話）");
        if (
            index === undefined && // nextEpisodeがない
            titleElement &&
            titleElement.textContent &&
            !regex.test(titleElement.textContent) && // アニメが放送中
            data[animeIndex].viewerStatusState == "WATCHING" && // ステータスが「見てる」
            dataEpisodes[0].viewerRecordsCount == 1 //１話を１回しか見ていない
        ) {
            uploadIconElement.setAttribute("src", completeUploadIcon);
            buttonState = false;
            uploadIconElement.style.opacity = "0.3";
            return;
        }

        // nextEpisodeがない・1話しかない場合はindexを0にする
        if (index === undefined || dataEpisodes.length === 1) index = 0;

        // 現在のエピソードが記録済みの場合
        if (
            index !== undefined &&
            index > episodeIndex &&
            dataEpisodes[episodeIndex].viewerRecordsCount != 0
        ) {
            if (!notRecordEpisode) {
                // 記録する場合は、opacityを下げクリックできなくするだけ
                uploadIconElement.setAttribute("src", completeUploadIcon);
                buttonState = false;
                uploadIconElement.style.opacity = "0.3";
            } else {
                // 記録しない場合はアイコンも変更
                switchNotUploadIcon(uploadIconContainer, uploadIconElement);
            }
            return;
        }

        buttonState = true; // 前の話数がfalseだと、そのままfalseになってしまうのでtrueを代入

        if (!notRecordEpisode) {
            // 記録する
            sendInterval(uploadIconContainer, uploadIconElement);
        } else {
            // 記録しない場合
            uploadIconContainer.dataset.upload = "false";
            uploadIconElement.setAttribute("src", notUploadIcon);
        }
    });
}
