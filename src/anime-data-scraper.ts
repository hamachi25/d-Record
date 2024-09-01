import { fetchData, fetchDataFromDanime } from "./fetch";
import { Work, NextEpisode } from "./types";

export let animeData: Work; // 取得したアニメデータ
export let viewData: NextEpisode[]; // 視聴中のアニメデータ

/******************************************************************************/

/* リクエストに送る季節を取得 */

export function getBroadcastYear(doc: Document, retry: boolean) {
    const seasonalYearRegex = /^(\d{4})年([春夏秋冬])$/; // 2024年春
    const nonSeasonalYearRegex = /^製作年：(\d{4})年$/; // 製作年：2024年

    const seasonTranslation = {
        春: "spring",
        夏: "summer",
        秋: "autumn",
        冬: "winter",
    };

    function createReturnSeason(year: string) {
        return [
            `${year}-winter`,
            `${year}-spring`,
            `${year}-summer`,
            `${year}-autumn`,
            `${Number(year) + 1}-winter`,
        ];
    }

    const tagElements = Array.from(doc.querySelectorAll(".tagArea > ul.tagWrapper > li > a"));
    const seasonalYearText = tagElements.find((elem) => elem.textContent?.match(seasonalYearRegex))?.textContent;
    const nonSeasonalYearText = tagElements.find((elem) => elem.textContent?.match(nonSeasonalYearRegex))?.textContent;
    const seasonalYearMatch = seasonalYearText?.match(seasonalYearRegex);
    const nonSeasonalYearMatch = nonSeasonalYearText?.match(nonSeasonalYearRegex);

    if (seasonalYearText && seasonalYearMatch) {
        // 2024年春の場合
        if (nonSeasonalYearMatch) {
            // 2024年春と製作年～ 2つともある場合
            const year = nonSeasonalYearMatch[1];
            if (!retry) {
                if (
                    seasonalYearMatch[1] > year ||
                    document.querySelectorAll("a[id].clearfix").length > 20
                ) {
                    // "2024年春"と"製作年：2023年"の年が違う場合
                    // 2クール以上ある場合、放送時期が異なっていることがある
                    return createReturnSeason(year);
                }
            } else {
                // 再検索
                // 年がズレてる場合があるので冬は前後1年足す
                let returnSeason: string[] = [];
                returnSeason = createReturnSeason(seasonalYearMatch[1]);
                returnSeason.push(`${Number(seasonalYearMatch[1]) - 1}-winter`);
                return returnSeason;
            }
        }

        const season = seasonalYearMatch[2] as keyof typeof seasonTranslation;
        return `${seasonalYearMatch[1]}-${seasonTranslation[season]}`;
    } else if (nonSeasonalYearText && nonSeasonalYearMatch) {
        // 製作年：2024年の場合
        const year2 = nonSeasonalYearMatch[1];
        if (!retry) {
            return createReturnSeason(year2);
        } else {
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
    } else {
        // 制作年が記載されていない場合、キャスト欄から年を取得
        const seasonalYearText = document
            .querySelector(".castContainer > p:nth-of-type(3)")?.lastChild?.textContent
            ?.replace(/\n|年/g, "");
        if (seasonalYearText && !isNaN(Number(seasonalYearText))) {
            return createReturnSeason(seasonalYearText);
        }
    }
}

/******************************************************************************/

/*
タイトルを検索用に整える
danime-save-annict-2
https://github.com/TomoTom0/danime-save-annict-2/blob/105851c64900b4994eb095f0f1bd83e755cb5f1d/src/scripts/index.js#L447-L463
*/
export function remakeString(title: string | null | undefined, retry: boolean) {
    if (!title) return "";

    if (!retry) {
        const deleteArray = [
            "[\\[《（(【＜〈～-].+[-～〉＞】)）》\\]]$",
            "第?\\d{1,2}期$",
            "^映画",
            "^劇場版",
            "(TV|テレビ|劇場)(アニメーション|アニメ)",
            "^アニメ",
            "Ⅰ",
            "Ⅱ",
            "II",
            "Ⅲ",
            "III",
            "Ⅳ",
            "IV",
            "Ⅴ",
            "Ⅵ",
            "Ⅶ",
            "VII",
            "Ⅷ",
            "VIII",
            "Ⅸ",
            "IX",
            "Ⅹ",
        ];
        // ノーブレークスペースをスペースに置き換える
        const remakeWords = { "　": " ", "\u00A0": " " };

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
                (match) => remakeWords[match as keyof typeof remakeWords]
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
export function findCorrectAnime(titleText: string, data: Work[]) {
    // removeWords()を行った回数が最もすくないアニメのindexを返す
    let index = [];
    let findTime = [];
    for (let i = 0; i < data.length; i++) {
        let annictTitle = data[i].title;
        let dTitle = titleText;
        let added = false;
        for (let j = 1; j <= 5; j++) {
            annictTitle = removeWords(annictTitle, j);
            dTitle = removeWords(dTitle, j);
            if (annictTitle === dTitle && !added) {
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
    const episodeCounts = document.querySelectorAll("a[id].clearfix").length;
    const arrayDiff = data.map((eachAnimeData: Work) =>
        Math.abs(episodeCounts - eachAnimeData.episodesCount)
    );
    return arrayDiff.indexOf(Math.min(...arrayDiff));
}

// dアニとannictで異なりそうな箇所を徐々に消していく
function removeWords(text: string, count: number) {
    const remakeWords = {
        Ⅰ: "I",
        Ⅱ: "II",
        Ⅲ: "III",
        Ⅳ: "IV",
        Ⅴ: "V",
        Ⅵ: "VI",
        Ⅶ: "VII",
        Ⅷ: "VIII",
        Ⅸ: "IX",
        Ⅹ: "X",
    };
    switch (count) {
        case 1:
            return text.replace(/　| |\u00A0/g, "").replace("OriginalVideoAnimation", "OVA");
        case 2:
            return text.replace(/[Ａ-Ｚａ-ｚ０-９：＆]/g, (s) =>
                String.fromCharCode(s.charCodeAt(0) - 65248)
            );
        case 3:
            return text.replace(
                /[\[［《【＜〈～－―-].+[-―－～〉＞】》］\]]|[（(｢「『」｣』)）]/g,
                ""
            );
        case 4:
            return text.replace(
                /第?\d{1,2}期|Season\d{1}|映画|劇場版|(TV|テレビ|劇場)(アニメーション|アニメ)|^アニメ|OVA/g,
                ""
            );
        case 5:
            return text.replace(
                new RegExp(Object.keys(remakeWords).join("|"), "g"),
                (match) => remakeWords[match as keyof typeof remakeWords]
            );
        default:
            return text;
    }
}

/******************************************************************************/

// dアニメストアから作品ページのhtmlを取得
export let danimeDocument: Document;
export async function getAnimeDataFromDanime(): Promise<Document | undefined> {
    const partIdMatch = location.href.match(/(?<=partId=)\d+/); // URLからworkIdを取得
    if (!partIdMatch) return;

    let html: string | undefined;
    try {
        html = await fetchDataFromDanime(Number(partIdMatch[0].substring(0, 5)));
    } catch (error) {
        return;
    }
    if (!html) return;

    danimeDocument = new DOMParser().parseFromString(html, "text/html");
    return danimeDocument;
}

// アニメデータを取得
export async function getAnimeDataFromAnnict(animeTitle: string, doc: Document, query: string) {
    const remakeTitle = remakeString(animeTitle, false);
    const variables = {
        titles: remakeTitle,
        seasons: getBroadcastYear(doc, false),
    };

    let json;
    try {
        const response = await fetchData(JSON.stringify({ query: query, variables: variables }));
        json = await response.json();
    } catch (error) {
        return;
    }

    if (json.data.viewer) {
        viewData = json.data.viewer.libraryEntries.nodes;
    }

    const allAnimeData: Work[] = json.data.searchWorks.nodes;
    if (allAnimeData.length == 1) {
        // 成功
        animeData = allAnimeData[0];
    } else if (allAnimeData.length >= 2) {
        // 成功
        animeData = allAnimeData[findCorrectAnime(animeTitle, allAnimeData)];
    } else {
        // 失敗なので再度実行
        const variables = {
            titles: remakeString(remakeTitle, true),
            seasons: getBroadcastYear(doc, true),
        };

        let json;

        try {
            const response = await fetchData(
                JSON.stringify({ query: query, variables: variables })
            );
            json = await response.json();
        } catch (error) {
            return;
        }
        const allAnimeData: Work[] = json.data.searchWorks.nodes;

        if (allAnimeData.length > 30) {
            // 30以上の場合は、ありふれた単語である可能性が高いため諦める
            return;
        } else if (allAnimeData.length == 1) {
            // 成功
            animeData = allAnimeData[0];
        } else if (allAnimeData.length >= 2) {
            // 成功
            animeData = allAnimeData[findCorrectAnime(animeTitle, allAnimeData)];
        }
    }
}
