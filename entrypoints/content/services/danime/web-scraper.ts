import { WebsiteInfo } from "../../utils/types";
import { setLoading, setWebsiteInfo } from "../../core/anime-data-scraper";

/**
 * dアニメストアのDOMからアニメの情報を取得
 */
export function getInfoFromDanime(doc: Document | undefined): WebsiteInfo | boolean {
	if (!doc) return false;

	const animeTitle = doc.querySelector(".titleWrap > h1")?.firstChild?.textContent;
	const yearTagElements = Array.from(doc.querySelectorAll(".tagArea>ul.tagWrapper > li > a"));
	const anotherYearElement =
		doc.querySelector(".castContainer>p:nth-of-type(3)")?.lastChild?.textContent ?? undefined;
	const episodeElements = Array.from(doc.querySelectorAll(".textContainer>span>.number")).map(
		(element) => element?.textContent ?? undefined,
	);
	const episodeCount = doc.querySelectorAll("a[id].clearfix").length;
	const currentEpisode = document.querySelector(".backInfoTxt2")?.textContent ?? "";
	const lastEpisode = episodeElements[episodeElements.length - 1];
	const workId = location.search.replace("?partId=", "").substring(0, 5);

	if (!animeTitle) {
		setLoading({
			status: "error",
			message: "現時点ではこのアニメに対応していません",
			icon: "immutableNotUpload",
		});
		return false;
	}

	setWebsiteInfo({
		site: "danime",
		title: animeTitle,
		year: yearTagElements.map((element) => element.textContent),
		anotherYear: anotherYearElement,
		episode: episodeElements,
		episodesCount: episodeCount,
		currentEpisode: currentEpisode,
		lastEpisode: lastEpisode,
		workId: workId,
	});

	return true;
}
