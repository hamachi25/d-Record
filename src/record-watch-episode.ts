import { query, remakeString, findCorrectAnime } from './anime-data-scraper';
import { fetchData } from "./fetch";
import { settingData } from './get-local-storage';

interface EpisodeData {
    id: number;
    number: number;
    numberText: string;
    annictId: number;
}

interface AnimeData {
    id: number;
    title: string;
    viewerStatusState: string;
    episodes: {
        nodes: EpisodeData[];
    };
}

let notRecordArray: number[];
let data: AnimeData[];
let dataEpisodes: EpisodeData[];
let episodeIndex = -1;
let timerId: number;
let buttonState = true;
const uploadIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAWJAAAFiQFtaJ36AAABJ0lEQVRYhe2XsW3DMBBFn4IM4FGUCaz0LjKC07pKNuAIHkEj2Bs4G2iEuEtpd+kuDQMTMo/WUbYIB/kAIepE3j3pTiRYiQgl9VA0+hUAFr7lS0Ry20pOWuX6yQ2+lHMtpwKIBc+GsAavg2DfCkRt8Wktwpm/HoE2sG+D/sHi0ArQAc9ADXz17E/+2afF4aMR4ADsEnBmaV/AARJp7QCfrTLXRUcrxZHS2o9xgc152/rC3NFF2C++2NsfLQ6H1MAHp7xvSOe6Axrgxd83wHwswA4tfzrEL6S7BHD3u2FRgE7pm2RdiEJtgNegPzkADFuYkrrrGvgbAENqoMG2EPXnJlVJ/Fxwq8NC1TdoKTBtKGOkAbwB+yvG2QPvsQdaCiZT8b/gH6A4wA9MTTwvPMgvWAAAAABJRU5ErkJggg==";
const notUploadIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAWJAAAFiQFtaJ36AAABv0lEQVRYhdWXMU7DMBSGvyIOkBvAyEZgYS0MiAEJNiQWMneh3CDcoNygDDCHka2cgHZjLBuIpRULTI/Btmocp42TlIpfsho9P/v/+/L7WWmJCKvE2krZGxBwrEd1iEjV0ZEZOlX3qUqeSB7JXwnwkZcVEdcVEFtkXwUiciQiEolIZuWkZi7UhJH+nQJ9K/5gPU+cNTEwBE58G4YKGAL7etM3J76j58ZWPAEGwIazz8A8rAcKmNiLPeJs9IBLJza1RAHFFUgB8Yx+CZH3OtclfwfaQPYrWmC2eejpnNRjqrsFa3NcoR5wzWejC5wH7lfKA0/M3llG/l0DnALbTuwbePHEgwUMUJ6YB5dkhHrf3UUC6lxGWwXxG9QxdfuBF6HH0CAFzpzYFPWP+yEbhQqINIHb1T6AQ/z+aExAjDKh29WegQNKltxFWQ8k+FvqNbBblRzKVeAI2HNipqVmuewlCHDJR6hzP65LDuHH8BZ1vhshB38FugW5j5q4aN6H9qKElsy+CyLUFXoRQBCKlhswFYhQLp/bNpcB44HYQ/7ZIM8rcOWbMBXYtGKVWmpVGA9s6tGm+MpdqoCV4d9/nNbGD5zxXDUg8eVTAAAAAElFTkSuQmCC";
const completeUploadIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAWJAAAFiQFtaJ36AAABuElEQVRYhe2XMVLCQBSGPxx7OYJjY0k8AdjryBFSU+EJjDfAG0Bnp94AbgClHXR2ko7uWWQzLC+7ySZkcJzxn9kJ83bz/i9vHxvoiAi/qbNfdW8B4M6M5hKRpmMke42a5mlqHktR8akAXOZVEJGIbM2a+TEAkWW280BEJeYiIkt7vm4Tds01BaZW/MP6vFXr58CFL2FdgCVwC0TAl4rfmLl1ifkKGNgJz2sCbE1SH1yu3LxnxVIg5rBC3gokgDjGNAByCnwrc4BXBZnJ0TCDki4XEZmYtYkVS0xsUnFvobH1FkyAfsnT6ebTuqoqj1ZIDyzY7/s7rjJmGgP3KvYJXNcBWFKsQJesJ8oUAQ8q9myuT2U36iYcAy8q1iOrQBe/tPmMamgnQA6h1Q+AsM3jEHMfgE+6EqljzaKOOeB9F5RpKSJDdb7n8a7Kk6g1Ba+QCszU0/aAN9xH7MEpF6IQgLVJ7io5Jj5sYh4KANnX0wWRmvi6iXkdABtipcx9B1OQOuL+WW4H7ZMw1yXZ63hXkX/A4cHWaQLQpgoAvi3wNVzr8gGMgU2LPhvg0TXh24KT6c//NfsHOFo/yRXSAr05KLUAAAAASUVORK5CYII=";

const uploadButtonElement = `
    <div id="upload-anime-title" data-upload="true">
        <span></span>
    </div>
    <div id="upload-icon-container" class="mainButton" title="" data-upload="true">
        <img id="upload-icon" src="${uploadIcon}">
    </div>
`;


// アップロードボタンのクリックイベント
function uploadButtonEvent(uploadIconContainer: HTMLElement | null, uploadIconElement: HTMLElement | null, url: any[]) {
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
                    document.querySelector("video")?.removeEventListener("ended", sendRecord)
                }

                // ストレージにセット
                notRecordArray.push(Number(url[0]))
                chrome.storage.local.set({ "notRecordWork": notRecordArray });
            } else {
                // するに切り替え
                uploadIconElement.setAttribute("src", uploadIcon);
                uploadIconContainer.dataset.upload = "true";
                sendInterval(uploadIconContainer, uploadIconElement);

                // ストレージから削除
                chrome.storage.local.get("notRecordWork", result => {
                    notRecordArray = result.notRecordWork || [];
                    notRecordArray = notRecordArray.filter(item => item != Number(url[0]));
                    chrome.storage.local.set({ "notRecordWork": notRecordArray });
                })
            }
        }
    })
}


// アップロードしないボタンに切り替え
function switchNotUploadIcon(uploadIconContainer: HTMLElement | null, uploadIconElement: HTMLElement | null) {
    buttonState = false; // クリックイベントを無効化
    if (uploadIconContainer && uploadIconElement) {
        uploadIconContainer.dataset.upload = "false";
        uploadIconElement.setAttribute("src", notUploadIcon);
        uploadIconElement.style.opacity = "0.3";
    }
}


function sendRecord() {
    const uploadIconElement = document.getElementById("upload-icon");
    let mutation = `
        mutation CreateRecord($episodeId: ID!) {
            createRecord (
                input: { episodeId: $episodeId }
            ) { clientMutationId }
    `;
    // 視聴ステータスが"見てる"以外だった場合、"見てる"に変更
    if (data[0]?.viewerStatusState != "WATCHING") {
        mutation += `
            updateStatus(
                input:{
                    state: WATCHING,
                    workId: "${data[0].id}"
                }
            ) { clientMutationId }
        `;
    }
    const variables2 = { episodeId: dataEpisodes[episodeIndex].id };
    mutation += "}";
    fetchData(JSON.stringify({ query: mutation, variables: variables2 }));
    uploadIconElement?.setAttribute("src", completeUploadIcon);
    buttonState = false;
}

// データ送信
function sendInterval(uploadIconContainer: HTMLElement | null, uploadIconElement: HTMLElement | null) {
    if (!buttonState) { timerId && clearInterval(timerId); return; }
    const video = document.querySelector("video")
    if (!video) {
        switchNotUploadIcon(uploadIconContainer, uploadIconElement);
        return;
    }

    if (!settingData.sendTiming || settingData.sendTiming == "after-start") {
        let startTime = Date.now();
        const startVideoTime = video.currentTime
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
        video.addEventListener("ended", sendRecord)
    }
}


// "第5話"のような話数から数字を取得する
function remakeEpisode(episode: string) {
    const numbers = episode.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248)).match(/\d+/g); // 全角を半角にして数値を取り出す

    if (numbers) {
        return Number(numbers[0]);
    } else {
        const remakeWords = {
            "〇": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10
        };
        // flatMapで漢数字をアラビア数字に変換して、filterでundefinedを削除
        const arrayKansuuji = [...episode].flatMap(s => s.match(new RegExp(Object.keys(remakeWords).join("|")))).filter(Boolean);
        let temp: number = -1;
        if (arrayKansuuji.length >= 1) {
            arrayKansuuji.forEach(kan => {
                temp += remakeWords[kan as keyof typeof remakeWords];
            });
            return temp
        } else {
            // 前編、後編
            const splitEpisode = episode.split(/ | |　/);
            const episodeWord = splitEpisode[splitEpisode.length - 1];
            if (episodeWord == "前編" || episodeWord == "前篇") {
                return 1;
            } else if (episodeWord == "後編" || episodeWord == "後篇") {
                return 2;
            }
        }
    }
    return -1;
}


// Annictからデータを取得
async function getAnimedata(year: string | number, title: string | null | undefined) {
    let season: string[] = [];
    if (year) {
        season = [year + "-winter", year + "-spring", year + "-summer", year + "-autumn"];
    }
    const remakeTitle = remakeString(title, false);
    const variables = {
        titles: remakeTitle,
        seasons: season
    };

    const response2 = await fetchData(JSON.stringify({ query: query, variables: variables }));
    const json2 = await response2.json();
    data = json2.data.searchWorks.nodes;

    // 失敗したら再度実行
    if (data.length <= 0) {
        if (year) {
            season?.push((Number(year) - 1) + "-winter");
            season?.push((Number(year) + 1) + "-winter");
        }
        const variables = {
            titles: remakeString(remakeTitle, true),
            seasons: season
        };
        const response = await fetchData(JSON.stringify({ query: query, variables: variables }));
        const json3 = await response.json();
        data = json3.data.searchWorks.nodes;
    }
    return json2;
}


export function sendWathingAnime() {
    if (settingData.sendTiming && settingData.sendTiming == "not-send") { return } //自動送信しない設定

    // 前の話数のボタンが残っていたら削除
    document.getElementById("upload-icon-container")?.remove();
    document.getElementById("upload-anime-title")?.remove();
    document.querySelector("video")?.removeEventListener("ended", sendRecord); // 前のイベントを削除

    document.querySelector(".buttonArea > .time")?.insertAdjacentHTML("afterend", uploadButtonElement);

    const uploadIconContainer = document.getElementById("upload-icon-container");
    const uploadIconElement = document.getElementById("upload-icon");
    const url = location.href.match(/(?<=partId=)\d{5}/); // URLからworkIdを取得
    if (!url || !uploadIconContainer || !uploadIconElement) { return }
    uploadButtonEvent(uploadIconContainer, uploadIconElement, url);

    // ストレージから配列を取得し、該当しているか確認
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
        let episodeNumber = remakeEpisode(episode)
        if (episodeNumber < 0) {
            switchNotUploadIcon(uploadIconContainer, uploadIconElement);
            return;
        }

        // dアニメストアから放送時期を取得
        const requestURL = "https://animestore.docomo.ne.jp/animestore/rest/v1/works?work_id=" + url[0];
        const response = await fetch(requestURL);
        const json = await response.json();
        const year = Number(json[0].details.production_year);


        // Annictからデータを取得
        const json2 = await getAnimedata(year, title)
        if (data.length <= 0) {
            switchNotUploadIcon(uploadIconContainer, uploadIconElement);
            return;
        }


        // 取得したアニメからタイトルが一致するものを探す
        let animeIndex: number = 0;
        if (data.length >= 2) {
            animeIndex = findCorrectAnime(title, data)
            // 見つからなかった場合
            if (animeIndex == -1) {
                switchNotUploadIcon(uploadIconContainer, uploadIconElement);
                return;
            }
        }


        if (!notRecordEpisode) {
            // 右下に取得したアニメタイトルを表示
            const titleElement = document.querySelector("#upload-anime-title > span");
            titleElement && (titleElement.textContent = data[animeIndex].title);

            // 7秒後にタイトルを非表示
            const titleContainerElement = document.getElementById("upload-anime-title");
            titleContainerElement && setTimeout(() => { titleContainerElement.style.display = "none"; }, 7000);
        }
        uploadIconContainer.setAttribute("title", data[animeIndex].title); // ボタンにタイトル属性を追加


        // 現在のエピソードに一致するindexを取得
        dataEpisodes = data[animeIndex].episodes.nodes;
        if (dataEpisodes[0].number) {
            episodeIndex = dataEpisodes.findIndex((dataEpisode) => dataEpisode.number == episodeNumber);
        } else {
            // numberがnullの時は、numberTextを使う
            dataEpisodes.forEach((dataEpisode, i) => {
                if (remakeEpisode(dataEpisode.numberText) == episodeNumber) {
                    episodeIndex = i;
                }
            });
        }


        // 視聴済みのエピソードの場合スキップ
        const viewData = json2.data.viewer.libraryEntries.nodes;
        let index = -1;
        for (const [i, dataEpisode] of dataEpisodes.entries()) {
            for (const libraryEntry of viewData) {
                if (libraryEntry.nextEpisode && dataEpisode.annictId == libraryEntry.nextEpisode.annictId) {
                    index = i;
                    break;
                }
            }
            if (index > 0) { break }
        }

        if (episodeIndex < 0 || index > episodeIndex) {
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
        // 記録オフにしている場合は実行しない
        if (!notRecordEpisode) {
            sendInterval(uploadIconContainer, uploadIconElement);
        } else {
            uploadIconContainer.dataset.upload = "false";
            uploadIconElement.setAttribute("src", notUploadIcon);
        }
    });
}