import { animeData, viewData, danimeDocument } from "./anime-data-scraper";
import { changeStatusToWatching, changeStatusToWatched, isAiring, handleUnregisteredNextEpisode, getNextEpisodeIndex } from "./utils";
import { settingData } from "./get-local-storage";
import { Episode } from "./types";
import { fetchData } from "./fetch";

let notRecordArray: number[];
let episodeData: Episode[];
let episodeNumberFromDanime: number | undefined = undefined; // 現在のエピソード(dアニのDOMから取得する)
let episodeIndex: number | undefined = undefined;; // 取得したエピソードの中で何番目か(indexから取得するので、3.5話のような話数が入るとずれる)
let sendInterval: number;
let buttonState = true;

const uploadIcon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAWJAAAFiQFtaJ36AAABJ0lEQVRYhe2XsW3DMBBFn4IM4FGUCaz0LjKC07pKNuAIHkEj2Bs4G2iEuEtpd+kuDQMTMo/WUbYIB/kAIepE3j3pTiRYiQgl9VA0+hUAFr7lS0Ry20pOWuX6yQ2+lHMtpwKIBc+GsAavg2DfCkRt8Wktwpm/HoE2sG+D/sHi0ArQAc9ADXz17E/+2afF4aMR4ADsEnBmaV/AARJp7QCfrTLXRUcrxZHS2o9xgc152/rC3NFF2C++2NsfLQ6H1MAHp7xvSOe6Axrgxd83wHwswA4tfzrEL6S7BHD3u2FRgE7pm2RdiEJtgNegPzkADFuYkrrrGvgbAENqoMG2EPXnJlVJ/Fxwq8NC1TdoKTBtKGOkAbwB+yvG2QPvsQdaCiZT8b/gH6A4wA9MTTwvPMgvWAAAAABJRU5ErkJggg==";
const notUploadIcon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAWJAAAFiQFtaJ36AAABv0lEQVRYhdWXMU7DMBSGvyIOkBvAyEZgYS0MiAEJNiQWMneh3CDcoNygDDCHka2cgHZjLBuIpRULTI/Btmocp42TlIpfsho9P/v/+/L7WWmJCKvE2krZGxBwrEd1iEjV0ZEZOlX3qUqeSB7JXwnwkZcVEdcVEFtkXwUiciQiEolIZuWkZi7UhJH+nQJ9K/5gPU+cNTEwBE58G4YKGAL7etM3J76j58ZWPAEGwIazz8A8rAcKmNiLPeJs9IBLJza1RAHFFUgB8Yx+CZH3OtclfwfaQPYrWmC2eejpnNRjqrsFa3NcoR5wzWejC5wH7lfKA0/M3llG/l0DnALbTuwbePHEgwUMUJ6YB5dkhHrf3UUC6lxGWwXxG9QxdfuBF6HH0CAFzpzYFPWP+yEbhQqINIHb1T6AQ/z+aExAjDKh29WegQNKltxFWQ8k+FvqNbBblRzKVeAI2HNipqVmuewlCHDJR6hzP65LDuHH8BZ1vhshB38FugW5j5q4aN6H9qKElsy+CyLUFXoRQBCKlhswFYhQLp/bNpcB44HYQ/7ZIM8rcOWbMBXYtGKVWmpVGA9s6tGm+MpdqoCV4d9/nNbGD5zxXDUg8eVTAAAAAElFTkSuQmCC";
const completeUploadIcon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAcZJREFUeNpiYBgFo2AkAWUJUQV0MWY6WSygLCd73NvPv0OQh7vh7/evjO+/fDtAL18LmGipn7925fJ/GMhIiPsPFDcAyTPRwQ37F61aY6CprQMX0NQBswXo4fv5a1cs/48MPn788N/fzeU9KGRwagSqm/8fNwjAoy8ApqgsP/c/uuUwcaDlCXhd/h8/2I9H336Qgok9XWBMluVEOKABj75+kK9BFqGD5tpqkOUFRMUduo9Bli6cM/t+Z3PjeWx5GSnOE7BZDnMU0YkH3cegbDR/1sz/u7ZvgyUgAyyWO/g4O+K0HATIcsC2TRv3g4IPSypOQLLcACQGkkMGIAdHBcHTJfkOQE9QIItAvgU5ApfloIIHZDmyOFkOeP70ab+xptp95JIM5ghQiWakrvoeXQ7EB0UbSC+yONlpAFtxCgNPHj3CcBjIUaDECtJLFQfgKtPRAVL6MICaQz0HEHIEuuU0cQA+R0BruAQ0c6jvAGRHgMqGE0ePYrWcWAcw4nIAEhfUcDiIrubFs2f8wHwe8OHDewVVNfUDnr5+B7EYZQ/EDnDLgIAcB1ANYHMAPRokeAEuBxQC8Qcq2gMya8Jos3wUDEoAEGAAfIZhhifLZSgAAAAASUVORK5CYII=";

// アップロードボタンのクリックイベント
function uploadButtonEvent(
    uploadIconContainer: HTMLElement | null,
    uploadIconElement: HTMLElement | null,
    workId: RegExpMatchArray
) {
    uploadIconContainer?.addEventListener("click", () => {
        if (uploadIconContainer && uploadIconElement && buttonState) {
            if (uploadIconContainer.dataset.upload == "true") {
                // アップロードしないに切り替え
                uploadIconElement.setAttribute("src", notUploadIcon);
                uploadIconContainer.dataset.upload = "false";

                // タイマーもしくはイベントを削除
                if (settingData.sendTiming == "after-start") {
                    sendInterval && clearInterval(sendInterval);
                } else if (!settingData.sendTiming || settingData.sendTiming == "after-end") {
                    document.querySelector("video")?.removeEventListener("ended", sendRecord);
                }

                // ストレージにセット
                notRecordArray.push(Number(workId[0]));
                chrome.storage.local.set({ notRecordWork: notRecordArray });
            } else {
                // アップロードするに切り替え
                uploadIconElement.setAttribute("src", uploadIcon);
                uploadIconContainer.dataset.upload = "true";
                createIntervalOrEvent();

                // ストレージから削除
                chrome.storage.local.get("notRecordWork", (result) => {
                    notRecordArray = result.notRecordWork || [];
                    notRecordArray = notRecordArray.filter((item) => item != Number(workId[0]));
                    chrome.storage.local.set({ notRecordWork: notRecordArray });
                });
            }
        }
    });
}

// アップロードしないボタンに切り替え
export function switchNotUploadIcon() {
    buttonState = false; // クリックイベントを無効化
    const uploadIconContainer = document.getElementById("upload-icon-container");
    const uploadIconElement = document.getElementById("upload-icon");
    if (uploadIconContainer && uploadIconElement) {
        uploadIconContainer.dataset.upload = "false";
        uploadIconElement.setAttribute("src", notUploadIcon);
        uploadIconElement.style.opacity = "0.3";
    }
}

// データ送信
function sendRecord() {
    if (!danimeDocument || episodeIndex === undefined) return;

    let mutation = "mutation{";

    // 視聴ステータスが"見てる"以外だった場合、"見てる"に変更
    if (
        !(
            !isAiring &&
            episodeNumberFromDanime === episodeData[episodeData.length - 1].number
        ) //最終回だった場合はステータスを変更しない
    ) {
        mutation = changeStatusToWatching(mutation);
    }

    mutation += `
        createRecord (
            input: { episodeId:"${episodeData[episodeIndex].id}"}
        ) { clientMutationId }
    `;

    // 最終話だった場合、"見た"に変更
    if (
        !isAiring && // アニメが放送終了
        episodeNumberFromDanime === episodeData[episodeData.length - 1].number && // 最終話
        (settingData.autoChangeStatus === undefined || settingData.autoChangeStatus) // 設定
    ) {
        mutation = changeStatusToWatched(mutation);
    }

    mutation += "}";

    try {
        fetchData(JSON.stringify({ query: mutation }));
    } catch (error) {
        switchNotUploadIcon();
        return;
    }

    document.getElementById("upload-icon")?.setAttribute("src", completeUploadIcon);
    document.querySelector("video")?.removeEventListener("ended", sendRecord);
    buttonState = false;
}

// インターバルかイベントを作成
function createIntervalOrEvent() {
    if (!buttonState) {
        sendInterval && clearInterval(sendInterval);
        return;
    }

    const video = document.querySelector("video");
    if (!video) {
        switchNotUploadIcon();
        return;
    }

    if (settingData.sendTiming == "after-start") {
        let startTime = Date.now();
        const startVideoTime = video.currentTime;
        sendInterval = setInterval(() => {
            // 視聴開始からの時間・動作再生時間の両方が5分以上の場合に送信
            if (
                video &&
                Date.now() - startTime > 5 * 60 * 1000 &&
                video.currentTime - startVideoTime > 5 * 60
            ) {
                sendRecord();
                sendInterval && clearInterval(sendInterval);
            }
        }, 30 * 1000);
    } else if (!settingData.sendTiming || settingData.sendTiming == "after-end") {
        video.addEventListener("ended", sendRecord);
    }
}

// "第5話"のような話数から数字を取得する
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

    // 全角数字を半角数字に変換して数値を取り出す
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

        const splitEpisode = episode.split(/ | |　/);
        const episodeWord = splitEpisode[splitEpisode.length - 1];

        return specialWords[episodeWord] || undefined;
    }

    const number = arabicNumberExtractor();
    if (number !== null) return number;

    const kanjiNumber = kanjiNumberExtractor();
    if (kanjiNumber !== null) return kanjiNumber;

    return specialEpisodeIdentifier();
}

// 前の話数のボタンが残っていたら削除
function cleanUpPreviousEpisode() {
    document.getElementById("upload-icon-container")?.remove();
    document.getElementById("upload-anime-title")?.remove();
    document.querySelector("video")?.removeEventListener("ended", sendRecord);
}

// 右下に取得したアニメタイトルを表示
function handleAnimeTitleDisplay(
    notRecordEpisode: boolean,
    isAnimeTitleDisplayed: boolean,
    uploadIconContainer: HTMLElement
) {
    if (!notRecordEpisode && !settingData.animeTitle && isAnimeTitleDisplayed) {
        // 右下に取得したアニメタイトルを表示
        const titleElement = document.querySelector("#upload-anime-title > span");
        if (titleElement) {
            titleElement.textContent = animeData.title;
        }

        // 4秒後にタイトルを非表示
        const titleContainerElement = document.getElementById("upload-anime-title");
        const titleTextElement = titleContainerElement?.querySelector("span");
        if (titleContainerElement && titleTextElement) {
            titleContainerElement.classList.add("show");
            titleTextElement.classList.add("show");
            setTimeout(() => {
                titleContainerElement?.classList.remove("show");
                titleTextElement?.classList.remove("show");
            }, 4000);
        }
    }

    // ボタンにタイトル属性を追加
    uploadIconContainer.setAttribute("title", animeData.title);
}

// エピソードのindexを取得
function getEpisodeIndex(episodeNumberFromDanime: number | undefined) {
    episodeData = animeData.episodes.nodes;
    if (!episodeData[0]) return;

    if (episodeData[0].numberText) {
        // numberTextから取得
        episodeData.forEach((episode: Episode, i: number) => {
            const num: number | undefined = episodeNumberExtractor(episode.numberText);
            if (num === episodeNumberFromDanime) {
                episodeIndex = i; // データ送信用のindex（総集編が含まれるとずれる）
            }
        });
    } else if (episodeData[0].number) {
        // numberから取得
        episodeData.forEach((episode: { number: number }, i: number) => {
            if (episode.number === episodeNumberFromDanime) {
                episodeIndex = i;
            }
        });
    } else if (episodeData.length === 1) {
        episodeIndex = 0;
    }
}

export function handleRecordEpisode(isAnimeTitleDisplayed: boolean) {
    if (!animeData || animeData.episodesCount === 0) return;
    if (settingData.sendTiming && settingData.sendTiming == "not-send") return; // 自動送信しない設定の場合

    // 前の話数のボタンが残っていたら削除
    cleanUpPreviousEpisode();

    const uploadButtonElement = `
        <div id="upload-anime-title" data-upload="true">
            <span></span>
        </div>
        <div id="upload-icon-container" class="mainButton" title="" data-upload="true">
            <img id="upload-icon" src="${uploadIcon}">
        </div>
    `;
    document.querySelector(".buttonArea > .time")?.insertAdjacentHTML("afterend", uploadButtonElement);

    const uploadIconContainer = document.getElementById("upload-icon-container");
    const uploadIconElement = document.getElementById("upload-icon");
    const workId = location.href.match(/(?<=partId=)\d+/); // URLからworkIdを取得
    if (!workId || !uploadIconContainer || !uploadIconElement) return;

    uploadButtonEvent(uploadIconContainer, uploadIconElement, workId);

    // 送信しない作品かどうか
    chrome.storage.local.get("notRecordWork", async (result) => {
        notRecordArray = result.notRecordWork || [];
        const notRecordEpisode = notRecordArray.includes(Number(workId[0]));

        const episode = document.querySelector(".backInfoTxt2")?.textContent;
        if (!episode) {
            switchNotUploadIcon();
            return;
        }

        // エピソードから数字を取り出す
        episodeNumberFromDanime = episodeNumberExtractor(episode);
        if (episodeNumberFromDanime === undefined || episodeNumberFromDanime < 0) {
            switchNotUploadIcon();
            return;
        }

        // 右下に取得したアニメタイトルを表示
        handleAnimeTitleDisplay(notRecordEpisode, isAnimeTitleDisplayed, uploadIconContainer);

        // エピソードの話数とindexを取得
        getEpisodeIndex(episodeNumberFromDanime);
        if (episodeIndex === undefined) return;

        let nextEpisodeIndex: number | undefined = getNextEpisodeIndex(viewData, episodeData);

        // 次のエピソードがAnnictに登録されていない時の処理
        const isNextEpisodeUnregistered = handleUnregisteredNextEpisode(danimeDocument, nextEpisodeIndex, episodeData);
        if (isNextEpisodeUnregistered) {
            uploadIconElement.setAttribute("src", completeUploadIcon);
            buttonState = false;
            uploadIconElement.style.opacity = "0.3";
            return;
        }

        // nextEpisodeがない・1話しかない場合はindexを0にする
        if (nextEpisodeIndex === undefined || episodeData.length === 1) {
            nextEpisodeIndex = 0;
        }

        // 現在のエピソードが記録済みの場合
        if (nextEpisodeIndex > episodeIndex) {
            if (!notRecordEpisode) {
                // 記録する
                uploadIconElement.setAttribute("src", completeUploadIcon);
                buttonState = false;
                uploadIconElement.style.opacity = "0.3";
            } else {
                // 記録しない
                switchNotUploadIcon();
            }
            return;
        }

        buttonState = true; // 前の話数がfalseだと、そのままfalseになってしまうのでtrueを代入

        if (!notRecordEpisode) {
            // 記録する
            createIntervalOrEvent();
        } else {
            // 記録しない
            uploadIconContainer.dataset.upload = "false";
            uploadIconElement.setAttribute("src", notUploadIcon);
        }
    });
}
