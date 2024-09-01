import {
    statusText,
    svgPaths,
    svgPathD,
    convertStatusToJapanese,
    changeStatusText,
} from "./utils";
import { animeData } from "./anime-data-scraper";
import { fetchData } from "./fetch";

const statusArray = [
    ["NO_STATE", svgPaths[0], "未選択"],
    ["WANNA_WATCH", svgPaths[3], "見たい"],
    ["WATCHING", svgPaths[2], "見てる"],
    ["WATCHED", svgPaths[1], "見た"],
    ["ON_HOLD", svgPaths[4], "一時中断"],
    ["STOP_WATCHING", svgPaths[5], "視聴中止"],
];

// annictのドロップメニューを追加
export function createDropMenu() {
    const currentStatus = animeData.viewerStatusState;
    currentStatus ? convertStatusToJapanese(currentStatus) : convertStatusToJapanese("NO_STATE");

    let annictElement = `
        <div id="annict" class="btnAddMyList addMyList add listen" data-click="false">
            <div id="annict-button">
                <svg class="dropdown-svg" xmlns="http://www.w3.org/2000/svg" viewBox="20 0 448 512" style ="width: 14px; height: 14px;">
                    <path d="${svgPathD}"></path>
                </svg>
                <span>${statusText}</span>
            </div>
            <span id="hover-title">${animeData.title}</span>
            <ul class="dropdown-menu">
    `;

    statusArray.forEach((status) => {
        annictElement += `
            <li>
                <button class="dropdown-item status-state" data-status-kind="${status[0]}">
                    <svg class="dropdown-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="${status[1]}"></path>
                    </svg>${status[2]}
                </button>
            </li>
        `;
    });
    annictElement += `
            <li>
                <a href="https://annict.com/works/${animeData.annictId}" target="_blank" rel="noopener noreferrer" class="dropdown-item" title="${animeData.title}">
                    Annictを開く
                </a>
            </li>
        </ul>
        </div>
    `;
    document
        .querySelector(".btnArea > .btnConcerned[data-workid]")
        ?.insertAdjacentHTML("beforebegin", annictElement);

    const dropdownMenu: HTMLElement | null = document.querySelector(".dropdown-menu");
    const annict = document.getElementById("annict");
    if (dropdownMenu && annict) {
        // メニューを表示
        annict.addEventListener("click", () => {
            dropdownMenu.classList.toggle("show");
        });
        // メニューを非表示
        document.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (!target.closest("#annict-button")) {
                dropdownMenu.classList.remove("show");
            }
        });

        // ステータスを変更するクリックイベント
        const statusElements: NodeListOf<HTMLElement> = document.querySelectorAll(".status-state");
        statusElements.forEach((statusElement) => {
            statusElement.addEventListener("click", async () => {
                const mutation = `
                    mutation UpdateStatus($state: StatusState!, $workId: ID!) {
                        updateStatus (
                            input : { state: $state, workId: $workId }
                        ) { clientMutationId }
                    }
                `;
                const variables = {
                    state: statusElement.dataset.statusKind,
                    workId: animeData.id,
                };

                fetchData(JSON.stringify({ query: mutation, variables: variables }));

                dropdownMenu.classList.remove("show");
                changeStatusText(statusElement.dataset.statusKind);
            });
        });
    }
}
