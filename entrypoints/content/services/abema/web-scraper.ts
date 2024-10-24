import { WebsiteInfo } from "../../utils/types";
import { setLoading, setWebsiteInfo } from "../../core/anime-data-scraper";

/**
 * Abema再生ページのDOMからアニメの情報を取得
 */
export async function getInfoFromAbemaPlayerPage(
	doc: Document | undefined,
): Promise<WebsiteInfo | boolean> {
	return new Promise((resolve) => {
		if (!doc) return resolve(false);

		/*
		 * レンダリングが遅延するので、MutationObserverで監視
		 */
		const observer = new MutationObserver(() => {
			const episodeElements = Array.from(
				doc.querySelectorAll(
					".com-content-list-ContentListEpisodeItem-BroadcastDateOrReleasedYear",
				),
			);
			if (episodeElements && episodeElements.length !== 0) {
				observer.disconnect();

				const isAnime = doc.querySelector(
					'.com-m-BreadcrumbList__item>[href="/video/genre/animation"]',
				);
				if (!isAnime) return resolve(false);

				const animeTitle = doc.querySelector(
					".com-video-EpisodeTitle__series-info",
				)?.textContent;

				const boradcastYear = doc.querySelectorAll(
					".com-video-EpisodeTitleBlock__supplement-item",
				)[1]?.textContent;

				const episodeElements = Array.from(
					doc.querySelectorAll(
						".com-content-list-ContentListEpisodeItem__title>.com-a-CollapsedText__container",
					),
				);
				const episodeText = episodeElements.map(
					(element) => element?.textContent?.split(" ")[0],
				);
				const episodeCount = doc.querySelectorAll(
					".com-content-list-ContentListItem",
				).length;
				const currentEpisode = doc
					.querySelector(".com-video-EpisodeTitle__episode-title")
					?.textContent?.split(" ")[0];
				const lastEpisode = episodeText[episodeText.length - 1];

				const path = location.pathname.replace("/video/episode/", "").split("_");

				if (
					!animeTitle ||
					!boradcastYear ||
					!episodeText ||
					!episodeCount ||
					!currentEpisode ||
					!lastEpisode
				) {
					setLoading({
						status: "error",
						message: "現時点ではこのアニメに対応していません",
						icon: "immutableNotUpload",
					});
					return resolve(false);
				}

				setWebsiteInfo({
					site: "abema",
					title: animeTitle.split("|")[0].trim(),
					year: boradcastYear,
					episode: episodeText,
					episodesCount: episodeCount,
					currentEpisode: currentEpisode,
					lastEpisode: lastEpisode,
					workId: `${path[0]}+${path[1]}`,
				});

				return resolve(true);
			}
		});

		observer.observe(doc.body, { childList: true, subtree: true, attributes: true });

		setTimeout(() => {
			observer.disconnect();
			resolve(false);
		}, 5000);
	});
}

/**
 * Abema作品ページのDOMからアニメの情報を取得
 */
export async function getInfoFromAbemaWorkPage(
	doc: Document | undefined,
): Promise<WebsiteInfo | boolean> {
	return new Promise((resolve) => {
		if (!doc) return resolve(false);

		/*
		 * レンダリングが遅延するので、MutationObserverで監視
		 */
		const observer = new MutationObserver(() => {
			const episodeElements = Array.from(
				doc.querySelectorAll(
					".com-content-list-ContentListEpisodeItem-BroadcastDateOrReleasedYear",
				),
			);
			if (episodeElements && episodeElements.length !== 0) {
				observer.disconnect();

				const isAnime = doc.querySelector(
					'.com-m-BreadcrumbList__item>[href="/video/genre/animation"]',
				);
				if (!isAnime) return resolve(false);

				const animeTitle = doc.querySelector(".com-video-TitleSection__title")?.textContent;
				const boradcastYear = episodeElements[0]?.textContent;
				const episodeCount = episodeElements.length;

				if (!animeTitle || !boradcastYear) {
					setLoading({
						status: "error",
						message: "現時点ではこのアニメに対応していません",
						icon: "immutableNotUpload",
					});
					return resolve(false);
				}

				setWebsiteInfo({
					site: "abema",
					title: animeTitle.trim(),
					year: boradcastYear,
					episode: [],
					episodesCount: episodeCount,
					currentEpisode: "",
					lastEpisode: "",
					workId: "",
				});

				return resolve(true);
			}
		});

		observer.observe(doc.body, { childList: true, subtree: true, attributes: true });

		setTimeout(() => {
			observer.disconnect();
			resolve(false);
		}, 5000);
	});
}
