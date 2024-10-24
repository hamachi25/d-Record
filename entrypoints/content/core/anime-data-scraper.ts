import { fetchDataFromAnnict, fetchDataFromDanime } from "../utils/api/fetch";
import { queryWithEpisodes } from "../utils/api/query";
import { AnimeData, Episode, NextEpisode, WebsiteInfo, Work } from "../utils/types";
import { episodeNumberExtractor } from "../utils/episode";

// webサイトから取得したアニメ情報
export const [websiteInfo, setWebsiteInfo] = createStore<WebsiteInfo>({
	site: "",
	title: "",
	year: [],
	anotherYear: undefined,
	episode: [],
	episodesCount: 0,
	currentEpisode: "",
	lastEpisode: undefined,
	workId: "",
});

// dアニメストアのDOM
export const [danimeDocument, setDanimeDocument] = createSignal<Document | undefined>(undefined);

// 現在のステータス
export const [loading, setLoading] = createStore({
	status: "loading",
	message: "Annictからデータを取得しています",
	icon: "loading",
});

export const [animeData, setAnimeData] = createStore<AnimeData>({
	id: "",
	annictId: "",
	title: "",
	viewerStatusState: "",
	media: "",
	episodes: [],
	sortedEpisodes: [],
	nextEpisode: undefined,
	currentEpisode: {
		normalized: undefined,
		raw: undefined,
	},
});

/******************************************************************************/

/**
 * リクエストに送る季節を取得
 */
function getBroadcastYear(retry: boolean) {
	const seasonalYearRegex = /^(\d{4})年([春夏秋冬])$/; // 2024年春
	const nonSeasonalYearRegex = /^製作年：(\d{4})年$/; // 製作年：2024年

	const targetElements = websiteInfo.year;

	/*
	 * AbemaTVの場合
	 * "xxxx年"と季節がないので、すべての季節を検索
	 */
	if (typeof targetElements === "string") {
		return createRequestSeason(targetElements.replace(/年/, ""));
	}

	const seasonalYearText = targetElements.find((elem) => elem?.match(seasonalYearRegex));
	const nonSeasonalYearText = targetElements.find((elem) => elem?.match(nonSeasonalYearRegex));

	const seasonalYearMatch = seasonalYearText?.match(seasonalYearRegex) ?? undefined;
	const nonSeasonalYearMatch = nonSeasonalYearText?.match(nonSeasonalYearRegex) ?? undefined;

	// xxxx年春の場合
	if (seasonalYearMatch) {
		return handleSeasonalYear(seasonalYearMatch, nonSeasonalYearMatch, retry);
	}

	// 製作年：xxxx年の場合
	if (nonSeasonalYearMatch) {
		return handleNonSeasonalYear(nonSeasonalYearMatch, retry);
	}

	// 制作年が記載されていない場合、キャスト欄から年を取得
	return handleNoYearInfo(websiteInfo.anotherYear);
}

/**
 * 春から冬まで1年分の配列を作成
 * dアニメストアだと、冬がズレていることがあるので翌年分も追加
 */
function createRequestSeason(year: string) {
	return [
		`${year}-winter`,
		`${year}-spring`,
		`${year}-summer`,
		`${year}-autumn`,
		`${Number(year) + 1}-winter`,
	];
}

/**
 * xxxx年春の処理
 */
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

/**
 * 製作年：xxxx年の処理
 */
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

/**
 * 制作年が記載されていない場合、キャスト欄から年を取得
 */
function handleNoYearInfo(anotherYear: string | undefined) {
	const seasonalYearText = anotherYear?.replace(/\n|年/g, "");

	if (seasonalYearText && !isNaN(Number(seasonalYearText))) {
		return createRequestSeason(seasonalYearText); // 1年分検索
	}
}

/******************************************************************************/

/**
 *タイトルを検索用に整える
 *danime-save-annict-2
 *https://github.com/TomoTom0/danime-save-annict-2/blob/105851c64900b4994eb095f0f1bd83e755cb5f1d/src/scripts/index.js#L447-L463
 */
function remakeString(title: string | undefined, retry: boolean) {
	if (!title) return "";

	if (!retry) {
		// prettier-ignore
		const deleteArray = [
			"(?!^)([\\[《（(【＜〈～-].+[-～〉＞】)）》\\]])$",
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
	}

	// 単語をわけて再検索
	if (retry) {
		const separateWord =
			/\s+|;|:|・|‐|─|―|－|〜|&|＋|#|＃|＊|!|！|\?|？|…|『|』|「|」|｢|｣|［|］|[|]|'|’/g;
		return title
			.replace(
				/OVA|劇場編集版|劇場版|総集編|映画|テレビ|(TV(アニメ|アニメーション))|オリジナル/g,
				"",
			)
			.split(separateWord)
			.find((title) => title.length >= 2); // 2文字以上
	}
}

/******************************************************************************/

/**
 * 取得したアニメからタイトルが一致するものを探す
 * @description removeWords()を行った回数が最もすくないアニメのindexを返す
 */
function findCorrectAnime(data: Work[]) {
	const index = [];
	const findTime = [];
	const cache = new Map<string, [string, number]>();

	/**
	 * キャッシュを作成
	 * @description webサイトのエピソード分の処理が減る
	 */
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
		let dTitle = websiteInfo.title;

		for (let j = 1; j <= 8; j++) {
			const [removedAnnictTitle, num] = cachedRemoveWords(annictTitle, j);
			const [removedDTitle] = cachedRemoveWords(dTitle, j);

			// 4回目の場合、渡すタイトルを置き換えない
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

	return false;
}

/**
 * サイトとannictのタイトルで、異なりそうな箇所を徐々に消していく
 */
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
        SEASON_INFO: /第?\d{1,2}期|Season\d{1}|総集編|映画|劇場版|(TV|テレビ|劇場)(アニメーション|アニメ)|^アニメ|OVA/g,
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

/**
 * 次に視聴するエピソードを取得
 */
function getNextEpisodeIndex(
	viewData: NextEpisode[] | undefined,
	animeData: Work,
	sortedEpisodes: Episode[],
) {
	if (!viewData || sortedEpisodes.length === 0) return undefined;

	// viewerの作品annictIDと一致するものを、animeData内で探す
	let viewIndex: number | undefined; // viewer > libraryEntries内のindex
	const viewDataLength = viewData.length;
	for (let i = 0; i < viewDataLength; i++) {
		if (viewData[i].work.annictId == animeData.annictId) {
			viewIndex = i;
			break;
		}
	}
	if (viewIndex === undefined) return undefined;

	// viewerのエピソードannictIDと一致するものを、sortedEpisodes内で探す
	if (viewData[viewIndex].nextEpisode) {
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

/**
 * 取得したエピソードの順番を、dアニメストアのエピソード順に変える
 */
function createSortedEpisodes(
	siteEpisodes: (string | undefined)[],
	annictEpisodes: Episode[] | undefined,
): Episode[] {
	if (!siteEpisodes[0] || annictEpisodes === undefined || annictEpisodes.length === 0) return [];

	// エピソード番号をキーとしたマップを作成
	const episodeMap = new Map(
		annictEpisodes.map((episode) => [
			episode.numberText ? episodeNumberExtractor(episode.numberText) : episode.number,
			episode,
		]),
	);

	const sortedEpisodeArray = [];

	for (let i = 0; i < siteEpisodes.length; i++) {
		const siteEpisode = siteEpisodes[i];
		if (!siteEpisode) return [];

		const danimeEpisodeNumber = episodeNumberExtractor(siteEpisode);
		const matchingEpisode = episodeMap.get(danimeEpisodeNumber);

		if (matchingEpisode) {
			matchingEpisode.numberTextNormalized = danimeEpisodeNumber;
			sortedEpisodeArray.push(matchingEpisode);
			episodeMap.delete(danimeEpisodeNumber); // 使用済みのエピソードを削除
		} else if (episodeMap.size === 1) {
			// 最終話のエピソード名が"最終話"になっていることがあるので、その場合はnumberを追加
			const remainingEpisode = episodeMap.values().next().value;

			if (remainingEpisode) {
				remainingEpisode.numberTextNormalized = remainingEpisode.number;
				sortedEpisodeArray.push(remainingEpisode);
				episodeMap.clear();
			}
		}
	}

	// 余りのエピソードを加える
	const remainingEpisodes = [...episodeMap.values()];
	sortedEpisodeArray.push(...remainingEpisodes);

	return sortedEpisodeArray;
}

/******************************************************************************/

/**
 * dアニメストアから作品ページのhtmlを取得
 */
export async function getAnimeDataFromDanime() {
	const partIdMatch = location.href.match(/(?<=partId=)\d+/); // URLからworkIdを取得
	if (!partIdMatch) return;

	const html = await fetchDataFromDanime(Number(partIdMatch[0].substring(0, 5)));
	if (!html) return;

	const doc = new DOMParser().parseFromString(html, "text/html");
	setDanimeDocument(doc);

	return doc;
}

/******************************************************************************/

/**
 * アニメデータのオブジェクトを作成
 */
function createAnimeDataObject(
	selectedAnimeData: Work,
	json: { data: { viewer: { libraryEntries: { nodes: NextEpisode[] } } } },
) {
	// エピソードの順番を、dアニメストアのエピソード順に変える
	const sortedEpisodes = createSortedEpisodes(
		websiteInfo.episode,
		selectedAnimeData.episodes?.nodes,
	);

	// prettier-ignore
	setAnimeData({
		id: selectedAnimeData.id,
		annictId: selectedAnimeData.annictId,
		title: selectedAnimeData.title,
		viewerStatusState: selectedAnimeData.viewerStatusState,
		media: selectedAnimeData.media,
		episodes: selectedAnimeData.episodes?.nodes ?? [],
		sortedEpisodes: sortedEpisodes,
		nextEpisode: getNextEpisodeIndex(json.data.viewer?.libraryEntries.nodes, selectedAnimeData, sortedEpisodes), //sortedEpisodesの中のindex
	});
	setLoading({
		status: "success",
		message: "現時点ではこのアニメに対応していません",
		icon: "upload",
	});
}

/******************************************************************************/

/**
 *  Annictからデータ取得し、正しいアニメを選択
 */
async function initialSearchAnimeData(remakeTitle: string) {
	const variables = {
		titles: remakeTitle,
		seasons: getBroadcastYear(false),
	};

	const response = await fetchDataFromAnnict(
		JSON.stringify({ query: queryWithEpisodes, variables: variables }),
	);
	if (!response) return;
	const json = await response.json();

	const allAnimeData: Work[] = json.data.searchWorks.nodes;
	if (allAnimeData.length === 1) {
		// 成功
		createAnimeDataObject(allAnimeData[0], json);
		return true;
	} else if (allAnimeData.length >= 2) {
		// 複数あるので正しいものを選択
		const index = findCorrectAnime(allAnimeData);
		if (index !== false) {
			createAnimeDataObject(allAnimeData[index], json);
			return true;
		}
	}
}

/**
 * 再度Annictからデータ取得し、正しいアニメを選択
 */
async function retrySearchAnimeData(prevTitle: string) {
	const remakeTitle = remakeString(prevTitle, true);
	if (!remakeTitle || remakeTitle === "") {
		setLoading({
			status: "error",
			message: "現時点ではこのアニメに対応していません",
			icon: "immutableNotUpload",
		});
		return false;
	}
	const variables = {
		titles: remakeTitle,
		seasons: getBroadcastYear(true),
	};

	const response = await fetchDataFromAnnict(
		JSON.stringify({ query: queryWithEpisodes, variables: variables }),
	);
	if (!response) return false;
	const json = await response.json();

	const allAnimeData = json.data.searchWorks.nodes;
	if (allAnimeData.length === 1) {
		// 成功
		createAnimeDataObject(allAnimeData[0], json);
		return true;
	} else if (allAnimeData.length >= 2 && allAnimeData.length <= 30) {
		// 複数あるので正しいものを選択
		const index = findCorrectAnime(allAnimeData);

		if (index !== false) {
			createAnimeDataObject(allAnimeData[index], json);
			return true;
		}

		// incluedsで検索
		for (let i = 0; i < allAnimeData.length; i++) {
			if (allAnimeData[i].title.includes(remakeTitle)) {
				createAnimeDataObject(allAnimeData[i], json);
				return true;
			}
		}

		// 見つからない場合は、エピソード数が一番近いものを選択
		const arrayDiff = allAnimeData.map((eachAnimeData: Work) =>
			Math.abs(websiteInfo.episodesCount - eachAnimeData.episodes.nodes.length),
		);
		const miniDiffIndex = arrayDiff.indexOf(Math.min(...arrayDiff));
		createAnimeDataObject(allAnimeData[miniDiffIndex], json);
		return true;
	} else {
		// 30以上の場合はありふれた単語と判断
		setLoading({
			status: "error",
			message: "現時点ではこのアニメに対応していません",
			icon: "immutableNotUpload",
		});
		return false;
	}
}

/**
 * アニメデータを取得
 */
export async function fetchAnimeDataFromAnnict() {
	setLoading({ status: "loading", message: "Annictからデータを取得しています", icon: "loading" });

	let remakeTitle = remakeString(websiteInfo.title, false);
	if (!remakeTitle || remakeTitle === "") remakeTitle = websiteInfo.title;

	/* 初回検索 */
	const isAnimeSearched = await initialSearchAnimeData(remakeTitle);
	if (isAnimeSearched) return isAnimeSearched;

	/* 再検索 */
	return await retrySearchAnimeData(remakeTitle);
}

/******************************************************************************/
