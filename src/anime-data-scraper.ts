import { fetchData } from "./fetch";
import { Work, NextEpisode } from "./types";

let animeData: Work; // 取得したアニメデータ
let viewData: NextEpisode[]; // 視聴データ

const titleText = document.querySelector(".titleWrap > h1")?.firstChild?.textContent ?? "";

// リクエストに送る季節を取得
export function getProductionYear(doc: Document, retry: boolean) {
    const yearPattern = /^(\d{4})年([春夏秋冬])$/; // 2024年春
    const yearPattern2 = /^製作年：(\d{4})年$/; // 製作年：2024年

    const tagElements = Array.from(doc.querySelectorAll(".tagArea > ul.tagWrapper > li > a"));
    const yearText = tagElements.find((elem) => elem.textContent?.match(yearPattern))?.textContent;
    const yearText2 = tagElements.find((elem) =>
        elem.textContent?.match(yearPattern2)
    )?.textContent;
    const matchText = yearText?.match(yearPattern);
    const matchText2 = yearText2?.match(yearPattern2);

    let returnSeason: string[] = [];
    function createReturnSeason(year: string) {
        returnSeason = [
            `${year}-winter`,
            `${year}-spring`,
            `${year}-summer`,
            `${year}-autumn`,
            `${Number(year) + 1}-winter`,
        ];
    }

    if (yearText && matchText) {
        // 2024年春の場合
        const seasonTranslation = {
            春: "spring",
            夏: "summer",
            秋: "autumn",
            冬: "winter",
        };

        if (matchText2) {
            const year2 = matchText2[1];
            if (retry) {
                // 再検索
                // 年がズレてる場合があるので冬は前後1年足す
                createReturnSeason(matchText[1]);
                returnSeason.push(`${Number(matchText[1]) - 1}-winter`);
                return returnSeason;
            } else if (
                matchText[1] > year2 ||
                document.querySelectorAll("a[id].clearfix").length > 20
            ) {
                // "2024年春"と"製作年：2023年"の年が違う場合
                // 2クール以上ある場合、放送時期が異なっていることがある
                createReturnSeason(year2);
                return returnSeason;
            }
        }

        const season = matchText[2] as keyof typeof seasonTranslation;
        return `${matchText[1]}-${seasonTranslation[season]}`;
    } else if (yearText2 && matchText2) {
        // 製作年：2024年の場合
        const year2 = matchText2[1];
        if (retry) {
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
        } else {
            createReturnSeason(year2);
            return returnSeason;
        }
    } else {
        // 2つともない場合、キャスト欄から年を取得
        const yearText = document
            .querySelector(".castContainer > p:nth-of-type(3)")
            ?.lastChild?.textContent?.replace(/\n|年/g, "");
        if (yearText && !isNaN(Number(yearText))) {
            createReturnSeason(yearText);
            return returnSeason;
        }
    }
}

/*
タイトルを検索用に整える
danime-save-annict-2
https://github.com/TomoTom0/danime-save-annict-2/blob/105851c64900b4994eb095f0f1bd83e755cb5f1d/src/scripts/index.js#L447-L463
*/
function remakeString(title: string | null | undefined, retry: boolean) {
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
        const separateWord = /\s+|;|:|・|‐|―|－|&|#|＃|＊|!|！|\?|？|…|『|』|「|」|｢|｣|［|］|[|]/g;
        return title
            .replace(/OVA/, "")
            .split(separateWord)
            .find((title) => title.length >= 3);
    }
}

const query = `
    query SearchWorks($titles: [String!], $seasons: [String!]) {
        searchWorks(
            titles: $titles,
            seasons: $seasons,
            orderBy: { field: CREATED_AT, direction: ASC }
        ) {
            nodes {
                id
                annictId
                viewerStatusState
                title
                episodesCount
                episodes (
                    orderBy: { field: SORT_NUMBER, direction: ASC }
                ) {
                    nodes {
                        number
                        numberText
                        id
                        annictId
                        viewerRecordsCount
                    }
                }
            }
        }
        viewer {
            libraryEntries (
                seasons: $seasons
            ) {
                nodes {
                    nextEpisode {
                        annictId
                    }
                }
            }
        }
    }
`;

// 取得したアニメからタイトルが一致するものを探す
// dアニとannictで異なりそうな箇所を徐々に消していく
function findCorrectAnime(titleText: string, data: Work[]) {
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

// アニメデータを取得
async function getAnimeData() {
    const yearValue = getProductionYear(document, false);
    const remakeTitle = remakeString(titleText, false);

    const variables = {
        titles: remakeTitle,
        seasons: yearValue,
    };
    const response = await fetchData(JSON.stringify({ query: query, variables: variables }));
    const json = await response.json();

    const allAnimeData: Work[] = json.data.searchWorks.nodes;
    viewData = json.data.viewer.libraryEntries.nodes;
    if (allAnimeData.length == 1) {
        // 成功
        animeData = allAnimeData[0];
    } else if (allAnimeData.length >= 2) {
        // 成功
        animeData = allAnimeData[findCorrectAnime(titleText, allAnimeData)];
    } else {
        // 失敗したら再度実行
        const variables = {
            titles: remakeString(remakeTitle, true),
            seasons: getProductionYear(document, true),
        };
        const response = await fetchData(JSON.stringify({ query: query, variables: variables }));
        const json = await response.json();
        const allAnimeData: Work[] = json.data.searchWorks.nodes;

        // 30以上の場合は、ありふれた単語である可能性が高いため諦める
        if (allAnimeData.length > 30) {
            return;
        } else if (allAnimeData.length > 0) {
            animeData = allAnimeData[findCorrectAnime(titleText, allAnimeData)];
        }
    }
}

export { query, animeData, viewData, findCorrectAnime, remakeString, getAnimeData };
