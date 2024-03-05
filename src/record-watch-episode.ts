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
const uploadIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB4UlEQVRYhd3XPWgUQRjG8d9pkoOgouF6C0FJZbBLI1YWFlaWWqm12Nvai4WCxtJUkkKrIGIQYmERFExhYcBWEASNcMmdZ7FzMJns3n7EeOoDy+w8OzPvH953htnWYDAwTh0Ya/S/AWAiz+x2u1Xnn8E1LGCtyoR2u72j38qrgYoAs3iDQ/iOebyvC9A0BSexGoIL7SpO1V2oCcBsCHYs8Y/gdfi+rwD30cEXbARvI/RncG+/ARawhHNYD9566C/hUZ3F9lKE8Ban8Q5zVSakRZi7DSOdwFkcRkz6FJ/QD/1hexwXo3EtfMMrfMwLMArgOu5gOudbT1YLqS7gbo7/Azdk6duhohqYw4OC4GT7vo4/jYeydFUCuFzgDzVV0x/qSmoUpWAmev+KS9iKvA8F857JaiYGeoKjoZ+eHYUA/eh9Ey8KxqX6HJ5YmxFAP/lWmIK44g9isiJAqskwP2/dkQBVNZW0tbVXgF5ot8cFcBOLoW2kspOwTCvhaayxX8mqAAw0z/G2nMqvAhBvnVbD4Hnzd6W8qAZi6o7sprOVgJWpL9uencj7WRXgJa5GY+ZrBB6lldQoSsEinv+moEMt43Fqlt2IbuG87ELS2zWwXBOyC8kyblPxv+BP6p84B/5vgF8Yx2Xf3VYj3QAAAABJRU5ErkJggg==";
const notUploadIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAACzUlEQVRYhc2XTWsUMRjHf5nuTLq+oCe/QPUmWkFBpQfFShXfbaHqSajgR1C/gPQglCK9KQgiYq2sUhXfLoKC4KWCQrGevAjWi5RiZ7ObeJhsm01n2tnt4vpAmH2eTPL7J3mSzQhjDO20oK30/0FAIS0Yx3He9nuAIeA28DFPAyllnb+WGdgJvAUu2+euDGBRSlmSUh5Oq29WwA7gPVC0ftH6dSKklJ1ACTgNTEopj7dCwG4LW+/Fi8A7W1+DPwb6anqAc60QMApsAL4D0zY2bf11wIgz8j6n3QRwsRUCrgNjQA8wY2Mz1h8TQtyw8CMe/HwcxxW/M5F2EDWwC6ZIkvET0C2TFC8BRz34hTiOFSzfBanb0LEDQC/JlNeUCuAW8BmojagipYyANyQzAYDW+ptSagbYT7JTltlKAoaBKxl1X62AmgmShHPhKKW2AtdsGbbPOsvKgd4V4AB/XCcMwy6cabdwv81V4FBeAf2ePw/MOWXexkUYhgRBsMmBV5RS/ntZ/WYugZspP4HtwIITW5BSRlrrriCoG8OTarU6BJSt30myVFscP5cA5f2erVOXJNwjd+QkOTCotS47sbmUvuoszzkQAJEHnwAWj1Wt9W9gMI7jstc2Wo2x2jasMwt/CJxw4CilZlma9oYs90lo4ePASQf+w2b7VDPw3AIKhUIEPABOOeHJarXaDQwCl5oVkGcJREdHxz2ckQNPgQGbcOPNwiHHDIRhuNmDPwP6UxKupQKEhRMEgbt3nwNnG4CXgarfr2uZB5GFLwaMMR+UUqPGmJ6MNr5VSO4H7sUlzCMgjKJonxBLYu1W2wu8zAnPsl9+wF+CELgvhNjmwdfIXbQ7qwm4i/OHobUutwg+CwwAX/wKfwnGgTMkR+iLSqVyEzgIbCRZ00a+44Ttfw54BbxOfcsY45djxpiSMaYzpa7lJfVO+C+t7d+GbRfwF5thQx4tOp75AAAAAElFTkSuQmCC"
const completeUploadIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAADKElEQVRYhe2XT4gURxTGf9XTNQ/XP6isiYgQ1iyRPYgigeAlmAVDEAwhp4TESxINOQiBgAfxKnhQlBwUgkJAspvTHowkeFEhWSEe3ATjwRxEwUPIsgfR3aSmarpy6B6sqene6XEgm0MeDM37ql5/X897r/q18t6zkpasKPt/QUBaBhpj6sbvBj4BLgC36wSISJevymqgpoAJ4BawBngK7AF+G1TA86bgFWC2IKe4zgLblyEeF5HrwJZhBUwUZBsifB1ws1iPyTcBPwB7gZ+AsWEEnAdGgQXgfoHdL/yNwLmIfAT4DhgvoDHg62EEXABmyJ/mboHdLfwZ4GJA3gCmgdeC+Hng444zTBEC/ALsBH4FdsWLInIO+CyAloBJ4OcOUNqGgb0MvA6sBUKll4GHQLvwO9eXgLcBtNb7gANBTBt4PyTvJ+AQcBYYKVlz5LUQ237gyyRJSJLu7Lbb7W+dc5frtOG4iMwppb6qIIe870vxJEnQWsfkOOc+IE/XsgI2k7fLLq01SqkKHpplYJIk22LyLMtwznXcg3FMnIJpinZRStFsNrHWPs2y7B2gFey7F99IRLYCh0PMez9nrR0D1hdQfHb0/AOfAg9CQGu9WkQ2Az8Gvz+juAbwPd2n3B2l1BvAYoC1iSwW8Duwx3u/EGAKuCQiX8TBgchtwI4AegTsN8YsFeI61tPzZUX4h7X2SpZlIaaAUyJyRkTCwmhqrUmSZG2APS7IH1UJ7icA733LWkskAuBzYEpEmgBpmm6K2q0FvGuMuVOHHPocRNZa0jRdbDQaqwP4PeAFEbkCvBjqBj4yxlyrSw413gXOuSfAUbrzNwmcjrYeM8Z8Mwh5LQEAxpizwId0t2JYC+eNMScHJa8rwAPWGDNFfjzHlTwPHKmItSX7awkIWyd80oOR/zfwqjGmp78r4ntqrqoIQ9Wj5JNOq9VqjWit/1JKrQIya+29LMuq8t4mP7JHA6ynraoEXOfZ0JCSD5x47zudgXMu8d73vFz62I0YqBpIFHAV2DcgwXJ2FXhr0LH8OPAm+UDiejb2txR4UpCfgJrfBf+mrfin2f8C/gH53/xXKAeTEgAAAABJRU5ErkJggg==";

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
        const sameNumber = notRecordArray.includes(Number(url[0]));

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


        if (!sameNumber) {
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
            if (!sameNumber) {
                // 記録オンの場合は、opacityを下げクリックできなくするだけ
                buttonState = false;
                uploadIconElement.style.opacity = "0.3";
            } else {
                // オフの場合はアイコンも変更
                switchNotUploadIcon(uploadIconContainer, uploadIconElement);
            }
            return;
        }


        buttonState = true; // 前の話数がfalseだと、そのままfalseになってしまうのでtrueを代入
        // 記録オフにしている場合は実行しない
        if (!sameNumber) {
            sendInterval(uploadIconContainer, uploadIconElement);
        } else {
            uploadIconContainer.dataset.upload = "false";
            uploadIconElement.setAttribute("src", notUploadIcon);
        }
    });
}