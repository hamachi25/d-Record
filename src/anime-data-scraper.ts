import { fetchData } from "./fetch";

let animeData: any; // 取得したアニメデータ
let viewData: any; // 視聴データ
let titleText = document.querySelector(".titleWrap > h1")?.firstChild?.textContent;

// リクエストに送る季節を取得
function getProductionYear(retry: boolean) {
    const yearPattern = /^(\d{4})年([春夏秋冬])$/; // 2024年春
    const yearPattern2 = /^製作年：(\d{4})年$/ // 製作年：2024年

    const tagElements = Array.from(document.querySelectorAll(".tagArea > ul.tagWrapper > li > a"));
    const yearText = tagElements.find((elem) => elem.textContent?.match(yearPattern))?.textContent;
    const yearText2 = tagElements.find((elem) => elem.textContent?.match(yearPattern2))?.textContent;
    const matchText = yearText?.match(yearPattern)
    const matchText2 = yearText2?.match(yearPattern2)

    if (yearText && matchText) {
        // 2024年春の場合
        const seasonTranslation = {
            "春": "spring",
            "夏": "summer",
            "秋": "autumn",
            "冬": "winter"
        }

        // "2024年春"と"製作年：2023年"の年が違う場合
        if (yearText2 && matchText2) {
            const year2 = matchText2[1];
            if (retry) {
                // 再検索
                // 年がズレてる場合があるので冬は前後1年足す
                return [Number(matchText[1]) - 1 + "-winter", matchText[1] + "-winter", matchText[1] + "-spring", matchText[1] + "-summer", matchText[1] + "-autumn", Number(matchText[1]) + 1 + "-winter"];
            } else if (matchText[1] > year2) {
                return [year2 + "-winter", year2 + "-spring", year2 + "-summer", year2 + "-autumn", Number(year2) + 1 + "-winter"];
            }
        }

        const season = matchText[2] as keyof typeof seasonTranslation;
        return `${matchText[1]}-${seasonTranslation[season]}`
    } else {
        // 製作年：2024年の場合
        if (yearText2 && matchText2) {
            const year2 = matchText2[1];
            if (retry) {
                // 再検索
                // 前後3年で検索
                // const seasons = ["winter", "spring", "summer", "autumn"];
                // const result: string[] = [];

                // const startYear = Number(year2) - 1;
                // [...Array(3)].forEach((_, i) => {
                //     seasons.forEach(season => {
                //         result.push(`${startYear + i}-${season}`);
                //     });
                // })
                return [Number(year2) - 1 + "-winter", year2 + "-winter", year2 + "-spring", year2 + "-summer", year2 + "-autumn", Number(year2) + 1 + "-winter"];
            }
            return [year2 + "-winter", year2 + "-spring", year2 + "-summer", year2 + "-autumn", Number(year2) + 1 + "-winter"];
        }
    }
}


/*
タイトルをいい感じに修正
danime-save-annict-2
https://github.com/TomoTom0/danime-save-annict-2/blob/105851c64900b4994eb095f0f1bd83e755cb5f1d/src/scripts/index.js#L447-L463
*/
function remakeString(titleText: string | null | undefined) {
    // "I"、"V"、"VI"を削除
    const deleteArray = ["[\\[《（(【＜～-].+[-～＞】)）》\\]]$", "第?\\d{1,2}期$", "^映画", "^劇場版", "(TV|テレビ|劇場)(アニメーション|アニメ)",
        "Ⅰ", "Ⅱ", "II", "Ⅲ", "III", "Ⅳ", "IV", "Ⅴ", "Ⅵ", "Ⅶ", "VII", "Ⅷ", "VIII", "Ⅸ", "IX", "Ⅹ", "X"];
    const remakeWords = {
        "　": " ",
        "〈": "＜", "〉": "＞"
    };

    if (titleText) {
        // テレビアニメ「」
        const match = titleText.match(/^(TV|テレビ|劇場|オリジナル)?\s?(アニメーション|アニメ)\s?[｢「『]/);
        if (match && match.index != undefined) {
            const index = match.index + match[0].length;
            titleText = titleText.substring(index).replace(/[」｣』]/, " ");
        }
        const remakeTitle = titleText
            .replace(/[Ａ-Ｚａ-ｚ０-９：＆]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248))
            .replace(new RegExp(deleteArray.join("|"), "g"), "")
            .replace(new RegExp(Object.keys(remakeWords).join("|"), "g"), match => remakeWords[match as keyof typeof remakeWords])
            .replace(/\u00A0/g, " ") // なぜかノーブレークスペースというスペースになってしまうことがあったので
            .trim();
        return remakeTitle;
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

function setAnimeData(json: any, allAnimeData: any) {
    // 取得したアニメでエピソード差が小さいもののインデックスを出力
    let arrayDiff: number[] = [];
    allAnimeData.forEach((EachAnimeData: any) => {
        const diff = Math.abs(document.querySelectorAll("a[id].clearfix").length - EachAnimeData.episodesCount);
        arrayDiff.push(diff);
    });
    const minIndex = arrayDiff.indexOf(Math.min(...arrayDiff));

    animeData = allAnimeData[minIndex];
    viewData = json.data.viewer.libraryEntries.nodes;
}

// アニメデータを取得
async function getAnimeData() {
    const yearValue = getProductionYear(false);
    const remakeTitle = remakeString(titleText);
    const variables = {
        titles: remakeTitle,
        seasons: yearValue
    };

    const response = await fetchData(JSON.stringify({ query: query, variables: variables }));
    const json = await response.json();

    const allAnimeData: any = json.data.searchWorks.nodes;
    if (allAnimeData.length > 0) {
        // 成功
        setAnimeData(json, allAnimeData);
    } else {
        // 失敗したら再度実行
        // 単語を空白毎にわけて、3文字以上の単語で再検索
        const separateWord = /\s+|;|:|・|‐|―|－|&|#|＃|!|！|\?|？|…|『|』|「|」|｢|｣|［|］|[|]/g;
        const firstWord = remakeTitle?.replace(/OVA/, "")
            .split(separateWord)
            .find(title => title.length >= 3);

        const variables = {
            titles: firstWord,
            seasons: getProductionYear(true)
        };
        const response = await fetchData(JSON.stringify({ query: query, variables: variables }));
        const json = await response.json();
        const allAnimeData: any = json.data.searchWorks.nodes;

        // 20以上の場合は、ありふれた単語である可能性が高いため諦める
        if (allAnimeData.length > 20) {
            return;
        } else if (allAnimeData.length > 0) {
            setAnimeData(json, allAnimeData);
        }
    }
}

export { query, animeData, viewData, remakeString, getAnimeData };