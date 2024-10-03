import { setUploadIcon } from "./components/UploadToggleButton";
import { fetchData, fetchDataFromDanime } from "./fetch";
import { AnimeData, NextEpisode, Work } from "./types";

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

// 2024年春の場合
function handleSeasonalYear(
	seasonalYearMatch: RegExpMatchArray,
	nonSeasonalYearMatch: RegExpMatchArray | undefined,
	retry: boolean,
) {
	const year = nonSeasonalYearMatch ? nonSeasonalYearMatch[1] : undefined;

	// "2024年春"と"製作年：2023年"の年が違う場合
	// 2クール以上ある場合、放送時期が異なっていることがある
	if (year && retry) {
		let returnSeason: string[] = [];
		returnSeason = createRequestSeason(seasonalYearMatch[1]);
		returnSeason.push(`${Number(seasonalYearMatch[1]) - 1}-winter`);
		return returnSeason;
	}

	// 再検索
	// 年がズレてる場合があるので冬は前後1年足す
	if (
		year &&
		!retry &&
		(seasonalYearMatch[1] > year || document.querySelectorAll("a[id].clearfix").length > 20)
	) {
		return createRequestSeason(year);
	}

	const seasonTranslation = {
		春: "spring",
		夏: "summer",
		秋: "autumn",
		冬: "winter",
	};
	const season = seasonalYearMatch[2] as keyof typeof seasonTranslation;
	return `${seasonalYearMatch[1]}-${seasonTranslation[season]}`;
}

// 製作年：2024年の場合
function handleNonSeasonalYear(nonSeasonalYearMatch: RegExpMatchArray, retry: boolean) {
	const year2 = nonSeasonalYearMatch[1];

	if (!retry) {
		return createRequestSeason(year2);
	}

	// 再検索
	// 前後3年で検索
	const seasons = ["winter", "spring", "summer", "autumn"];
	const result: string[] = [];
	const startYear = Number(year2) - 1;
	[...Array(3)].forEach((_, i) => {
		seasons.forEach((season) => {
			result.push(`${startYear + i}-${season}`);
		});
	});
	return result;
}

// 制作年が記載されていない場合、キャスト欄から年を取得
function handleNoYearInfo(doc: Document) {
	const seasonalYearText = doc
		.querySelector(".castContainer>p:nth-of-type(3)")
		?.lastChild?.textContent?.replace(/\n|年/g, "");
	if (seasonalYearText && !isNaN(Number(seasonalYearText))) {
		return createRequestSeason(seasonalYearText);
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
		const remakeWords = { "\u3000": " ", "\u00A0": " " };

		const titleRegex = /^(TV|テレビ|劇場|オリジナル)?\s?(アニメーション|アニメ)\s?[｢「『]/;
		const match = title.match(titleRegex);
		let trimmedTitle = title;
		if (match && match.index != undefined) {
			const index = match.index + match[0].length;
			trimmedTitle = trimmedTitle.substring(index).replace(/[」｣』]/, " ");
		}

		return trimmedTitle
			.replace(/[Ａ-Ｚａ-ｚ０-９：＆]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248))
			.replace(new RegExp(deleteArray.join("|"), "g"), "")
			.replace(
				new RegExp(Object.keys(remakeWords).join("|"), "g"),
				(match) => remakeWords[match as keyof typeof remakeWords],
			)
			.trim();
	} else {
		// 単語をわけて、3文字以上の単語で再検索
		const separateWord =
			/\s+|;|:|・|‐|―|－|〜|&|#|＃|＊|!|！|\?|？|…|『|』|「|」|｢|｣|［|］|[|]/g;
		return title
			.replace(/OVA/, "")
			.split(separateWord)
			.find((title) => title.length >= 3);
	}
}

/******************************************************************************/

// 取得したアニメからタイトルが一致するものを探す
function findCorrectAnime(titleText: string, data: Work[], doc: Document) {
	// removeWords()を行った回数が最もすくないアニメのindexを返す
	const index = [];
	const findTime = [];
	for (let i = 0; i < data.length; i++) {
		const count = 8; // removeWords()の回数
		let annictTitle = data[i].title;
		let dTitle = titleText;
		let added = false;

		for (let j = 1; j <= count; j++) {
			const [removedAnnictTitle, num] = removeWords(annictTitle, j);
			const [removedDTitle] = removeWords(dTitle, j);

			// 4回目の場合、渡すタイトル置き換えない。
			if (num !== 4) {
				annictTitle = removedAnnictTitle;
				dTitle = removedDTitle;
			}

			if (removedAnnictTitle === removedDTitle && !added) {
				added = true;
				index.push(i);
				findTime.push(j);
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

    switch (count) {
        case 1:
            return [text.replace(/\s|\u00A0|\u3000/g, "").replace("OriginalVideoAnimation", "OVA"), count];
        case 2:
            return [text.replace(/[Ａ-Ｚａ-ｚ０-９：＆]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248)), count];
        case 3:
            return [text.replace(/「([^」]*?)（([^）]*?)）([^」]*)」/g, "「$1$3」"), count];
        case 4:
            return [text.replace(/[[［《【＜〈（(｢「『～－―\-』」｣)）〉＞】》］\]]/g, ""), count];
        case 5:
            return [text.replace(/[[［《【＜〈].+?[〉＞】》］\]]|[（(｢「『」｣』)）]/g, ""), count];
        case 6:
            return [text.replace(/第?\d{1,2}期|Season\d{1}|映画|劇場版|(TV|テレビ|劇場)(アニメーション|アニメ)|^アニメ|OVA/g, ""), count];
        case 7:
            return [text.replace(/[～－―-].+?[-―－～]/g, ""), count];
        case 8:
            return [text.replace(new RegExp(Object.keys(replacements).join("|"), "g"), match => replacements[match as keyof typeof replacements]), count];
        default:
            return [text, 0];
    }
}

/******************************************************************************/

// 次のエピソードを取得
function getNextEpisodeIndex(viewData: NextEpisode[] | undefined, animeData: Work) {
	if (!viewData) return undefined;

	let viewIndex: number | undefined; // viewer > libraryEntries内のindex
	for (const [i, libraryEntry] of viewData.entries()) {
		if (libraryEntry.work.annictId == animeData.annictId) {
			viewIndex = i;
			break;
		}
	}
	if (viewIndex === undefined) return undefined;

	// nextEpisodeのindex
	let nextEpisodeIndex: number;
	if (viewIndex !== undefined && viewData[viewIndex].nextEpisode) {
		for (const [i, episode] of animeData.episodes.nodes.entries()) {
			if (episode.annictId === viewData[viewIndex].nextEpisode.annictId) {
				nextEpisodeIndex = i;
				return nextEpisodeIndex;
			}
		}
	}

	return undefined;
}

/******************************************************************************/

// dアニメストアから作品ページのhtmlを取得
export let danimeDocument: Document;
export async function getAnimeDataFromDanime(): Promise<Document | undefined> {
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
	const json = await response.json();

	let allAnimeData: Work[] = json.data.searchWorks.nodes;
	let selectedAnimeData: Work;
	if (allAnimeData.length === 1) {
		// 成功
		selectedAnimeData = allAnimeData[0];
	} else if (allAnimeData.length >= 2) {
		// 成功
		selectedAnimeData = allAnimeData[findCorrectAnime(animeTitle, allAnimeData, doc)];
	} else {
		// 再度実行
		const variables = {
			titles: remakeString(remakeTitle, true),
			seasons: getBroadcastYear(doc, true),
		};

		const response = await fetchData(JSON.stringify({ query: query, variables: variables }));
		const json = await response.json();

		allAnimeData = json.data.searchWorks.nodes;

		if (allAnimeData.length === 1) {
			// 成功
			selectedAnimeData = allAnimeData[0];
		} else if (allAnimeData.length >= 2 && allAnimeData.length <= 30) {
			// 成功
			selectedAnimeData = allAnimeData[findCorrectAnime(animeTitle, allAnimeData, doc)];
		} else {
			// 30以上の場合はありふれた単語と判断
			setLoading({
				status: "error",
				message: "現時点ではこのアニメに対応していません",
			});
			setUploadIcon("immutableNotUpload");
			return;
		}
	}

	setAnimeData({
		id: selectedAnimeData.id,
		annictId: selectedAnimeData.annictId,
		title: selectedAnimeData.title,
		viewerStatusState: selectedAnimeData.viewerStatusState,
		episodes: selectedAnimeData.episodes?.nodes ?? [],
		nextEpisode: getNextEpisodeIndex(json.data.viewer?.libraryEntries.nodes, selectedAnimeData),
	});
	setLoading({ status: "success", message: "" });
}
