import { animeData, getAnimeDataFromAnnict, getAnimeDataFromDanime } from "./anime-data-scraper";
import { createDropMenu } from "./create-drop-menu";
import { createRecordButton } from "./create-record-button";
import { handleRecordEpisode } from "./record-watch-episode";
import { getSettings } from "./get-local-storage";
import { queryWithEpisodes, queryWithoutEpisodes } from "./query";
import { switchNotUploadIcon } from "./record-watch-episode";

const path = window.location.pathname.replace("/animestore/", "");
async function main() {
    await getSettings();

    if (path == "ci_pc") {
        // 作品ページ
        const animeTitle = document.querySelector(".titleWrap > h1")?.firstChild?.textContent;
        if (!animeTitle) return;

        // エピソード数が多いと取得に時間がかかるため、61以上の場合ステータスボタンのみ表示
        let query;
        const episodeElement = document.querySelectorAll(".episodeContainer>.swiper-slide");
        if (episodeElement && episodeElement.length < 5) {
            query = queryWithEpisodes;
        } else {
            query = queryWithoutEpisodes;
        }

        try {
            await getAnimeDataFromAnnict(animeTitle, document, query);
        } catch (e) { return; }

        if (animeData) {
            createDropMenu();
            createRecordButton();
        }
    } else if (path == "sc_d_pc") {
        // 再生画面
        let currentLocation: string;

        const observer = new MutationObserver(async () => {
            if (currentLocation !== location.href) {
                const isAnimeTitleDisplayed: boolean = currentLocation === undefined; // 初回のみタイトルを表示する

                currentLocation = location.href;

                const animeTitle = document.querySelector(".backInfoTxt1")?.textContent;
                if (!animeTitle) return;

                try {
                    const danimeDocument = await getAnimeDataFromDanime();
                    if (!danimeDocument) return;

                    await getAnimeDataFromAnnict(animeTitle, danimeDocument, queryWithEpisodes);
                } catch (e) {
                    switchNotUploadIcon();
                    return;
                }

                handleRecordEpisode(isAnimeTitleDisplayed);
            }
        });

        const videoWrapper = document.querySelector(".videoWrapper");
        if (videoWrapper) {
            observer.observe(videoWrapper, { childList: true, subtree: true, });
        }
    }
}
main();
