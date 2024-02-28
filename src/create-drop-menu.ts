import { statusText, svgPath, svgPathD, statusToJp, changeStatusText } from './update-watch-status';
import { animeData } from './anime-data-scraper';
import { fetchData } from './fetch';


const statusArray = [
    ["NO_STATE", svgPath[0], "未選択"],
    ["WANNA_WATCH", svgPath[3], "見たい"],
    ["WATCHING", svgPath[2], "見てる"],
    ["WATCHED", svgPath[1], "見た"],
    ["ON_HOLD", svgPath[4], "一時中断"],
    ["STOP_WATCHING", svgPath[5], "視聴中止"]
];


// annictのドロップメニューを追加
export function addDropMenu() {
    const currentStatus = animeData.viewerStatusState;
    currentStatus ? statusToJp(currentStatus) : statusToJp("NO_STATE");

    let annictElement = `
        <div id="annict" class="btnAddMyList addMyList add listen" data-click="false">
            <div title="${animeData.title}">
                <svg class="dropdown-svg" xmlns="http://www.w3.org/2000/svg" viewBox="20 0 448 512" style ="width: 14px; height: 14px;">
                    <path d="${svgPathD}"></path>
                </svg>
                <span>${statusText}</span>
            </div>
            <ul class="dropdown-menu">
    `;

    statusArray.forEach(status => {
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
    document.querySelector(".btnArea > .btnAddMyList[data-workid]")?.insertAdjacentHTML('afterend', annictElement);

    const dropdownMenu: HTMLElement | null = document.querySelector(".dropdown-menu");
    const annict = document.getElementById("annict");
    if (dropdownMenu && annict) {
        // メニューを表示
        annict.addEventListener("click", () => {
            if (document.querySelector('#annict[data-click="false"]')) {
                dropdownMenu.classList.add("show");
                annict.dataset.click = "true"
            } else {
                dropdownMenu.classList.remove("show");
                annict.dataset.click = "false"
            }
        })
        // メニューを非表示
        document.addEventListener("click", e => {
            const target = e.target as HTMLElement
            if (!target.closest("#annict")) {
                dropdownMenu.classList.remove("show");
                annict.dataset.click = "false"
            }
        })

        // ステータスを変更するクリックイベント
        const statusElements: NodeListOf<HTMLElement> = document.querySelectorAll(".status-state");
        statusElements.forEach(statusElement => {
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
                    workId: animeData.id
                };

                fetchData(JSON.stringify({ query: mutation, variables: variables }));

                dropdownMenu.classList.remove("show");
                changeStatusText(statusElement.dataset.statusKind);
            });
        });
    }
}