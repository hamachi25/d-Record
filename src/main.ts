import { animeData, getAnimeData } from './anime-data-scraper';
import { addStyle } from './style';
import { addDropMenu } from './create-drop-menu';
import { createRecordButton } from './create-record-button';
import { sendWathingAnime } from './record-watch-episode';

const path = window.location.pathname.replace('/animestore/', '');
async function main() {
    if (path == "ci_pc") {
        await getAnimeData();
        if (animeData) {
            addStyle();
            addDropMenu();
            createRecordButton();
        }
    } else if (path == "sc_d_pc") {
        let currentLocation: string;

        addStyle();

        // ページ読み込みされないのでDOMの変更を検知
        const observer = new MutationObserver(() => {
            if (currentLocation != location.href) {
                sendWathingAnime();
                currentLocation = location.href;
            }
        });

        const videoWrapper = document.querySelector(".videoWrapper");
        if (videoWrapper) {
            observer.observe(videoWrapper, {
                subtree: true,
                childList: true,
            });
        }
    }
}
main();