import { setUploadIcon } from "./components/UploadToggleButton";
import { fetchData, fetchDataFromDanime } from "./fetch";
import { AnimeData, Episode, NextEpisode, Work } from "./types";
import { episodeNumberExtractor } from "./utils";

/******************************************************************************/

/* リクエストに送る季節を取得 */
function getBroadcastYear(doc: Document, retry: boolean) {
	const seasonalYearRegex = /^(\d{4})年([春夏秋冬])$/; // 2024年春
	const nonSeasonalYearRegex = /^製作年：(\d{4})年$/; // 製作年：2024年

	const tagElements = Array.from(doc.querySelectorAll(".tagArea>ul.tagWrapper > li > a"));

	const seasonalYearText = tagElements.find((elem) =>
		elem.textContent?.match(seasonalYearRegex),
	)?.textContent;
	const nonSeasonalYearText = tagElements.find((elem) =>
		elem.textContent?.match(nonSeasonalYearRegex),
	)?.textContent;

	const seasonalYearMatch = seasonalYearText?.match(seasonalYearRegex) ?? undefined;
	const nonSeasonalYearMatch = nonSeasonalYearText?.match(nonSeasonalYearRegex) ?? undefined;

	// 2024年春の場合
	if (seasonalYearMatch) {
		return handleSeasonalYear(seasonalYearMatch, nonSeasonalYearMatch, retry);
	}

	// 製作年：2024年の場合
	if (nonSeasonalYearMatch) {
		return handleNonSeasonalYear(nonSeasonalYearMatch, retry);
	}

	// 制作年が記載されていない場合、キャスト欄から年を取得
	return handleNoYearInfo(doc);
}

function createRequestSeason(year: string) {
	return [
		`${year}-winter`,
		`${year}-spring`,
		`${year}-summer`,
		`${year}-autumn`,
		`${Number(year) + 1}-winter`,
	];
}

// "2024年春"の場合
function handleSeasonalYear(
	seasonalYearMatch: RegExpMatchArray,
	nonSeasonalYearMatch: RegExpMatchArray | undefined,
	retry: boolean,
) {
	const nonSeasonalYear = nonSeasonalYearMatch ? nonSeasonalYearMatch[1] : undefined;
	const seasonalYear = seasonalYearMatch[1];

	// "2024年春"と"製作年：2023年"のように年が違う場合
	// "2024年春"の方が大きい場合は、小さい"製作年：2023年"を使用
	if (nonSeasonalYear && !retry && seasonalYear > nonSeasonalYear) {
		return createRequestSeason(nonSeasonalYear); // 1年分検索
	}

	// 再検索
	// 年がズレてる場合があるので冬は前後1年足す
	if (nonSeasonalYear && retry) {
		const returnSeason = createRequestSeason(seasonalYear);
		returnSeason.push(`${Number(seasonalYear) - 1}-winter`);
		return returnSeason;
	}

	const seasonTranslation = {
		春: "spring",
		夏: "summer",
		秋: "autumn",
		冬: "winter",
	};
	const season = seasonalYearMatch[2] as keyof typeof seasonTranslation;
	return `${seasonalYear}-${seasonTranslation[season]}`;
}

// "製作年：2024年"の場合
function handleNonSeasonalYear(nonSeasonalYearMatch: RegExpMatchArray, retry: boolean) {
	const nonSeasonalYear = nonSeasonalYearMatch[1];

	if (!retry) {
		return createRequestSeason(nonSeasonalYear); // 1年分検索
	}

	// 再検索
	// 前後3年で検索
	const seasons = ["winter", "spring", "summer", "autumn"];
	const result: string[] = [];
	const startYear = Number(nonSeasonalYear) - 1;
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < seasons.length; j++) {
			result.push(`${startYear + i}-${seasons[j]}`);
		}
	}
	return result;
}

// 制作年が記載されていない場合、キャスト欄から年を取得
function handleNoYearInfo(doc: Document) {
	const seasonalYearText = doc
		.querySelector(".castContainer>p:nth-of-type(3)")
		?.lastChild?.textContent?.replace(/\n|年/g, "");

	if (seasonalYearText && !isNaN(Number(seasonalYearText))) {
		return createRequestSeason(seasonalYearText); // 1年分検索
	}
}

/******************************************************************************/

/*
タイトルを検索用に整える
danime-save-annict-2
https://github.com/TomoTom0/danime-save-annict-2/blob/105851c64900b4994eb095f0f1bd83e755cb5f1d/src/scripts/index.js#L447-L463
*/
function remakeString(title: string | undefined, retry: boolean) {
	if (!title) return "";

	if (!retry) {
		// prettier-ignore
		const deleteArray = [
			"[\\[《（(【＜〈～-].+[-～〉＞】)）》\\]]$",
			"第?\\d{1,2}期$",
			"^映画", "^劇場版",
			"(TV|テレビ|劇場)(アニメーション|アニメ)", "^アニメ",
			"Ⅰ", "Ⅱ", "II", "Ⅲ", "III", "Ⅳ", "IV", "Ⅴ",
			"Ⅵ", "Ⅶ", "VII", "Ⅷ", "VIII", "Ⅸ", "IX", "Ⅹ",
		];
		// ノーブレークスペースと全角スペースを、半角スペースに置き換える
		const remakeWords = { "\u3000": " ", "\u00A0": " ", "!": "！" };

		const titleRegex = /^(TV|テレビ|劇場|オリジナル)?\s?(アニメーション|アニメ)\s?[｢「『]/;
		const match = title.match(titleRegex);
		let trimmedTitle = title;
		if (match && match.index !== undefined) {
			const index = match.index + match[0].length;
			trimmedTitle = trimmedTitle.substring(index).replace(/[」｣』]/, " ");
		}

		return trimmedTitle
			.replace(/[Ａ-Ｚａ-ｚ０-９：＆]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248)) // 全角を半角に
			.replace(new RegExp(deleteArray.join("|"), "g"), "")
			.replace(
				new RegExp(Object.keys(remakeWords).join("|"), "g"),
				(match) => remakeWords[match as keyof typeof remakeWords],
			)
			.trim();
	} else {
		// 単語をわけて再検索
		const separateWord =
			/\s+|;|:|・|‐|─|―|－|〜|&|#|＃|＊|!|！|\?|？|…|『|』|「|」|｢|｣|［|］|[|]|'|’/g;
		return title
			.replace(/OVA|劇場版|劇場|映画|テレビ|TV|アニメ|アニメーション|オリジナル/g, "")
			.split(separateWord)
			.find((title) => title.length >= 2); // 2文字以上
	}
}

/******************************************************************************/

// 取得したアニメからタイトルが一致するものを探す
function findCorrectAnime(titleText: string, data: Work[], doc: Document) {
	// removeWords関数を行った回数が最もすくないアニメのindexを返す
	const index = [];
	const findTime = [];
	const cache = new Map<string, [string, number]>();

	function cachedRemoveWords(text: string, count: number): [string, number] {
		const key = `${text}-${count}`;
		if (cache.has(key)) {
			return cache.get(key)!;
		}
		const result = removeWords(text, count);
		cache.set(key, result);
		return result;
	}

	for (let i = 0; i < data.length; i++) {
		let annictTitle = data[i].title;
		let dTitle = titleText;

		for (let j = 1; j <= 8; j++) {
			const [removedAnnictTitle, num] = cachedRemoveWords(annictTitle, j);
			const [removedDTitle] = cachedRemoveWords(dTitle, j);

			// 4回目の場合、渡すタイトル置き換えない。
			if (num !== 4) {
				annictTitle = removedAnnictTitle;
				dTitle = removedDTitle;
			}

			if (removedAnnictTitle === removedDTitle) {
				index.push(i);
				findTime.push(j);
				break;
			}
		}
	}
	if (index.length >= 1) {
		return index[findTime.indexOf(Math.min(...findTime))];
	}

	// 見つからなかった場合
	// 取得したアニメでエピソード差が小さいもののインデックスを出力
	const episodeCounts = doc.querySelectorAll("a[id].clearfix").length;
	const arrayDiff = data.map((eachAnimeData: Work) =>
		Math.abs(episodeCounts - eachAnimeData.episodes.nodes.length),
	);
	return arrayDiff.indexOf(Math.min(...arrayDiff));
}

// dアニとannictで異なりそうな箇所を徐々に消していく
// prettier-ignore
function removeWords(text: string, count: number): [string, number] {
    const replacements = {
        Ⅰ: "I", Ⅱ: "II", Ⅲ: "III", Ⅳ: "IV", Ⅴ: "V",
        Ⅵ: "VI", Ⅶ: "VII", Ⅷ: "VIII", Ⅸ: "IX", Ⅹ: "X"
    };

	const PATTERNS = {
        WHITESPACE: /\s|\u00A0|\u3000/g,
        FULLWIDTH: /[Ａ-Ｚａ-ｚ０-９：＆]/g,
        NESTED_QUOTES: /「([^」]*?)（([^）]*?)）([^」]*)」/g, // 「」に囲まれた()を削除
        BRACKETS: /[[［《【＜〈（(｢「『～－─―\-』」｣)）〉＞】》］\]]/g, // カッコなどのみを削除 次には引き継がれない
        BRACKETED_CONTENT: /[[［《【＜〈].+?[〉＞】》］\]]|[（(｢「『」｣』)）]/g, // カッコなどに囲まれた部分を削除
        SEASON_INFO: /第?\d{1,2}期|Season\d{1}|映画|劇場版|(TV|テレビ|劇場)(アニメーション|アニメ)|^アニメ|OVA/g,
        DASH_CONTENT: /[～－─―-].+?[-―─－～]/g,
        ROMAN_NUMERALS: new RegExp(Object.keys(replacements).join('|'), 'g')
    };

    switch (count) {
        case 1:
            return [text.replace(PATTERNS.WHITESPACE, "").replace("OriginalVideoAnimation", "OVA"), count];
        case 2:
            return [text.replace(PATTERNS.FULLWIDTH, s => String.fromCharCode(s.charCodeAt(0) - 65248)), count];
        case 3:
            return [text.replace(PATTERNS.NESTED_QUOTES, "「$1$3」"), count];
        case 4:
            return [text.replace(PATTERNS.BRACKETS, ""), count];
        case 5:
            return [text.replace(PATTERNS.BRACKETED_CONTENT, ""), count];
        case 6:
            return [text.replace(PATTERNS.SEASON_INFO, ""), count];
        case 7:
            return [text.replace(PATTERNS.DASH_CONTENT, ""), count];
        case 8:
            return [text.replace(PATTERNS.ROMAN_NUMERALS, match => replacements[match as keyof typeof replacements]), count];
        default:
            return [text, 0];
    }
}

/******************************************************************************/

// 次のエピソードを取得
function getNextEpisodeIndex(
	viewData: NextEpisode[] | undefined,
	animeData: Work,
	sortedEpisodes: Episode[],
) {
	if (!viewData || sortedEpisodes.length === 0) return undefined;

	// viewerのannictIDと一致するものを、animeData内で探す
	let viewIndex: number | undefined; // viewer > libraryEntries内のindex
	const viewDataLength = viewData.length;
	for (let i = 0; i < viewDataLength; i++) {
		if (viewData[i].work.annictId == animeData.annictId) {
			viewIndex = i;
			break;
		}
	}
	if (viewIndex === undefined) return undefined;

	// nextEpisodeのindex
	if (viewData[viewIndex].nextEpisode) {
		// viewerのエピソードのannictIDと一致するものを、sortedEpisodes内で探す
		const sortedEpisodesLength = sortedEpisodes.length;
		const nextEpisodeAnnictId = viewData[viewIndex].nextEpisode.annictId;
		for (let i = 0; i < sortedEpisodesLength; i++) {
			if (sortedEpisodes[i].annictId === nextEpisodeAnnictId) {
				return i;
			}
		}
	}

	return undefined;
}

/******************************************************************************/

// エピソードの順番を、dアニメストアのエピソードの順番に変える
function createSortedEpisodes(doc: Document, episodes: Episode[] | undefined) {
	if (episodes === undefined || episodes.length === 0) return [];

	const targets = Array.from(doc.querySelectorAll(".textContainer>span>.number"));

	// エピソード番号をキーとしたマップを作成
	const episodeMap = new Map(
		episodes.map((episode) => [
			episode.numberText ? episodeNumberExtractor(episode.numberText) : episode.number,
			episode,
		]),
	);

	const sortedEpisodeArray = [];

	for (const target of targets) {
		const danimeEpisodeText = target.textContent;
		if (!danimeEpisodeText) return [];

		const danimeEpisodeNumber = episodeNumberExtractor(danimeEpisodeText);
		const matchingEpisode = episodeMap.get(danimeEpisodeNumber);

		if (matchingEpisode) {
			matchingEpisode.numberTextNormalized = danimeEpisodeNumber;
			sortedEpisodeArray.push(matchingEpisode);
			episodeMap.delete(danimeEpisodeNumber); // 使用済みのエピソードを削除
		}
	}

	// マッチングが見つからなかった場合は元の配列を返す
	return sortedEpisodeArray.length === 0 ? episodes : sortedEpisodeArray;
}

/******************************************************************************/

// dアニメストアから作品ページのhtmlを取得
export let danimeDocument: Document;
export async function getAnimeDataFromDanime() {
	const partIdMatch = location.href.match(/(?<=partId=)\d+/); // URLからworkIdを取得
	if (!partIdMatch) return;

	const html = await fetchDataFromDanime(Number(partIdMatch[0].substring(0, 5)));
	if (!html) return;

	danimeDocument = new DOMParser().parseFromString(html, "text/html");
	return danimeDocument;
}

export const [loading, setLoading] = createSignal({
	status: "loading",
	message: "Annictからデータを取得しています",
});

export const [animeData, setAnimeData] = createStore<AnimeData>({
	id: "",
	annictId: "",
	title: "",
	viewerStatusState: "",
	episodes: [],
	sortedEpisodes: [],
	nextEpisode: undefined,
	currentEpisode: {
		normalized: undefined,
		raw: undefined,
	},
});

// アニメデータを取得
export async function getAnimeDataFromAnnict(animeTitle: string, doc: Document, query: string) {
	const remakeTitle = remakeString(animeTitle, false);
	const variables = {
		titles: remakeTitle,
		seasons: getBroadcastYear(doc, false),
	};

	const response = await fetchData(JSON.stringify({ query: query, variables: variables }));
	if (!response) return false;
	const json = await response.json();

	let allAnimeData: Work[] = json.data.searchWorks.nodes;
	let selectedAnimeData: Work;
	if (allAnimeData.length === 1) {
		// 成功
		selectedAnimeData = allAnimeData[0];
	} else if (allAnimeData.length >= 2) {
		// 複数あるので正しいものを選択
		selectedAnimeData = allAnimeData[findCorrectAnime(animeTitle, allAnimeData, doc)];
	} else {
		// 再取得
		const remakeTitle = remakeString(animeTitle, true);
		if (!remakeTitle) {
			setLoading({
				status: "error",
				message: "現時点ではこのアニメに対応していません",
			});
			setUploadIcon("immutableNotUpload");
			return false;
		}
		const variables = {
			titles: remakeTitle,
			seasons: getBroadcastYear(doc, true),
		};

		const response = await fetchData(JSON.stringify({ query: query, variables: variables }));
		if (!response) return false;
		const json = await response.json();

		allAnimeData = json.data.searchWorks.nodes;

		if (allAnimeData.length === 1) {
			// 成功
			selectedAnimeData = allAnimeData[0];
		} else if (allAnimeData.length >= 2 && allAnimeData.length <= 30) {
			// 複数あるので正しいものを選択
			selectedAnimeData = allAnimeData[findCorrectAnime(animeTitle, allAnimeData, doc)];
		} else {
			// 30以上の場合はありふれた単語と判断
			setLoading({
				status: "error",
				message: "現時点ではこのアニメに対応していません",
			});
			setUploadIcon("immutableNotUpload");
			return false;
		}
	}

	const sortedEpisodes = createSortedEpisodes(doc, selectedAnimeData.episodes?.nodes); // エピソードの順番を、dアニメストアの順番に変える

	// prettier-ignore
	setAnimeData({
		id: selectedAnimeData.id,
		annictId: selectedAnimeData.annictId,
		title: selectedAnimeData.title,
		viewerStatusState: selectedAnimeData.viewerStatusState,
		episodes: selectedAnimeData.episodes?.nodes ?? [],
		sortedEpisodes: sortedEpisodes,
		nextEpisode: getNextEpisodeIndex(json.data.viewer?.libraryEntries.nodes, selectedAnimeData, sortedEpisodes), //sortedEpisodesの中のindex
	});
	setLoading({ status: "success", message: "" });
	return true;
}
