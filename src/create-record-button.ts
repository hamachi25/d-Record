import { animeData, viewData } from "./anime-data-scraper";
import { changeStatusToWatching } from "./update-watch-status";
import { fetchData } from "./fetch";
import { settingData } from "./get-local-storage";

const insertTargets: NodeListOf<HTMLElement> = document.querySelectorAll("a[id].clearfix");

const recordButtonElement = `
    <div class="record-container">
        <button class="record-button">
            <svg class="record-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
                d="M435.848 83.466L172.804 346.51l-96.652-96.652c-4.686-4.686-12.284-4.686-16.971 0l-28.284 28.284c-4.686 4.686-4.686 12.284 0 16.971l133.421 133.421c4.686 4.686 12.284 4.686 16.971 0l299.813-299.813c4.686-4.686 4.686-12.284 0-16.971l-28.284-28.284c-4.686-4.686-12.284-4.686-16.97 0z">
            </path>
          </svg>記録
        </button>
        <button class="record-button">
            <svg class="record-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
                d="M35.5 183.9l148-148.4c4.7-4.7 12.3-4.7 17 0l148 148.4c4.7 4.7 4.7 12.3 0 17l-19.6 19.6c-4.8 4.8-12.5 4.7-17.1-.2L218 123.2V372c0 6.6-5.4 12-12 12h-28c-6.6 0-12-5.4-12-12V123.2l-93.7 97.1c-4.7 4.8-12.4 4.9-17.1.2l-19.6-19.6c-4.8-4.7-4.8-12.3-.1-17zM372 428H12c-6.6 0-12 5.4-12 12v28c0 6.6 5.4 12 12 12h360c6.6 0 12-5.4 12-12v-28c0-6.6-5.4-12-12-12z">
            </path>
            </svg>ここまで記録
        </button>
        <svg class="record-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="min-width: 20px !important;">
            <g>
            	<path d="M454.485,0H165.87c-13.647,0-32.707,7.895-42.357,17.544L50.247,90.81c-9.65,9.65-17.544,28.71-17.544,42.357
            		v354.021c0,13.647,11.165,24.812,24.812,24.812h288.616c13.647,0,35.978,0,49.625,0h58.73c13.647,0,24.812-11.165,24.812-24.812
            		v-58.731c0-13.647,0-35.978,0-49.624V24.812C479.297,11.165,468.132,0,454.485,0z M317.277,399.201c0,2.098-1.7,3.798-3.798,3.798
            		h-180.19c-2.097,0-3.798-1.701-3.798-3.798v-16.709c0-2.098,1.701-3.798,3.798-3.798h180.19c2.098,0,3.798,1.7,3.798,3.798V399.201
            		z M382.509,322.834c0,2.435-1.974,4.41-4.409,4.41H133.9c-2.435,0-4.409-1.974-4.409-4.41v-15.486c0-2.435,1.974-4.408,4.409-4.408
            		h244.201c2.435,0,4.409,1.974,4.409,4.408V322.834z M382.509,247.08c0,2.435-1.974,4.408-4.409,4.408H133.9
            		c-2.435,0-4.409-1.974-4.409-4.408v-15.486c0-2.435,1.974-4.409,4.409-4.409h244.201c2.435,0,4.409,1.974,4.409,4.409V247.08z
            		 M382.509,171.326c0,2.435-1.974,4.408-4.409,4.408H133.9c-2.435,0-4.409-1.974-4.409-4.408v-15.487
            		c0-2.435,1.974-4.409,4.409-4.409h244.201c2.435,0,4.409,1.974,4.409,4.409V171.326z" style="fill: rgb(75, 75, 75);"></path>
            </g>
        </svg>
    </div>
`;

// 記録ボタンを作成
export async function createRecordButton() {
    const dataEpisodes: any[] = animeData.episodes.nodes;

    // "記録"クリックイベント
    function singleRecordButton(i: number, j: number) {
        const button = document.querySelectorAll(".record-button:first-of-type")[j];
        button.addEventListener("click", async () => {
            let mutation = `
                mutation CreateRecord($episodeId: ID!) {
                    createRecord (
                        input: { episodeId: $episodeId }
                    ) { clientMutationId }
            `;
            const variables = { episodeId: dataEpisodes[i].id };

            changeStatusToWatching(mutation);
            mutation += "}";
            fetchData(JSON.stringify({ query: mutation, variables: variables }));

            recordContainers[j].style.display = "none"; // ボタンを非表示
        });
    }

    // "ここまで記録"クリックイベント
    function multiRecordButton(i: number, j: number) {
        const button = document.querySelectorAll(".record-button:last-of-type")[j];
        button.addEventListener("click", async () => {
            // その話数までのcreateRecordを作成してマージ
            let mutation = "mutation{";
            const count = i - j;

            [...Array(j + 1)].forEach((_, k) => {
                mutation += `
                    e${k}:createRecord(
                        input:{ episodeId:"${dataEpisodes[count + k].id}" }
                    ) { clientMutationId }
                `;
                recordContainers[k].style.display = "none";
            });

            changeStatusToWatching(mutation);
            mutation += "}";
            fetchData(JSON.stringify({ query: mutation }));
        });
    }

    /*
    動画の要素と取得したエピソード数の差が、4以上だったら実行しない
    Annict側で1期2期が別れている可能性などがある　例：水星の魔女
    */
    const diff = Math.abs(insertTargets.length - animeData.episodesCount);
    if (dataEpisodes.length == 0 || diff > 4) return;

    let index;
    for (const [i, dataEpisode] of dataEpisodes.entries()) {
        for (const libraryEntry of viewData) {
            if (!libraryEntry.nextEpisode) continue;
            if (dataEpisode.annictId == libraryEntry.nextEpisode.annictId) {
                index = i;
                break;
            }
        }
        if (index != undefined) break;
    }

    const recordContainers: NodeListOf<HTMLElement> =
        document.querySelectorAll(".record-container");
    if (!settingData || !settingData.recordButton) {
        // ボタン挿入
        for (const [i, insertTarget] of insertTargets.entries()) {
            if (index != undefined && i < index) continue;
            insertTarget.insertAdjacentHTML("afterend", recordButtonElement);
        }

        // イベント追加
        let j = 0;
        for (const [i, _] of insertTargets.entries()) {
            if (index != undefined && i < index) continue;
            singleRecordButton(i, j);
            multiRecordButton(i, j);
            j++;
        }
    }

    if (!settingData || !settingData.nextEpisodeLine) {
        // 視聴した次のエピソードに赤枠をつける
        if (index != undefined && insertTargets[index]) {
            const itemModule = insertTargets[index].closest<HTMLElement>(".itemModule.list");
            itemModule?.classList.add("next-episode-border");
        }
    }
}
