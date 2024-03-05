import { animeData, getAnimeData } from './anime-data-scraper';
import { addDropMenu } from './create-drop-menu';
import { createRecordButton } from './create-record-button';
import { sendWathingAnime } from './record-watch-episode';
import { getSettings } from './get-local-storage';


const path = window.location.pathname.replace('/animestore/', '');
async function main() {
    await getSettings();
    if (path == "ci_pc") {
        // 作品ページ
        await getAnimeData();
        if (animeData) {
            addDropMenu();
            createRecordButton();
        }
    } else if (path == "sc_d_pc") {
        // 再生画面
        let currentLocation: string;
        // ページ読み込みされないのでDOMの変更を検知
        const observer = new MutationObserver(() => {
            if (currentLocation != location.href) {
                currentLocation = location.href;
                sendWathingAnime();
            }
        });

        const videoWrapper = document.querySelector(".videoWrapper");
        if (videoWrapper) {
            observer.observe(videoWrapper, {
                childList: true,
                subtree: true
            });
        }
    }
}
main();