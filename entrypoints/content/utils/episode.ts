import { animeData, setAnimeData } from "../core/anime-data-scraper";

/**
 * 現在放送中かどうかを判定
 */
export function isCurrentlyAiring(doc: Document | undefined): boolean {
	if (!doc) return false;

	const titleElement = doc.querySelector(".titleWrap > h1");
	const regex = new RegExp("（全\\d+話）");
	return !regex.test(titleElement?.textContent || "");
}

/******************************************************************************/

/**
 * 次のエピソードがAnnictに登録されているかどうかを判定
 */
export function checkNextEpisodeRegistered(doc: Document | undefined): boolean {
	if (
		animeData.nextEpisode === undefined && // nextEpisodeがない
		isCurrentlyAiring(doc) && // アニメが放送中
		animeData.viewerStatusState === "WATCHING" && // ステータスが「見てる」
		animeData.sortedEpisodes[0].viewerRecordsCount === 1 //１話を１回しか見ていない
	) {
		return false;
	}

	return true;
}

/******************************************************************************/

/**
 * 現在視聴しているエピソードを更新
 */
export function updateCurrentEpisode(
	normalized: number | string,
	raw: number | string | undefined,
) {
	batch(() => {
		setAnimeData("currentEpisode", "normalized", normalized);
		setAnimeData("currentEpisode", "raw", raw);
	});
}

/******************************************************************************/

/**
 * エピソード番号を取り出す
 * @description "第5話"のような話数から数字を取得
 */
export function episodeNumberExtractor(episode: string): number | string {
	// 全角数字を半角数字に変換
	function arabicNumberExtractor(): number | undefined {
		const numbers = episode
			.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248))
			.match(/\d+/g);

		return numbers?.length === 1 ? Number(numbers[0]) : undefined;
	}

	// 漢数字をアラビア数字に変換
	function kanjiNumberExtractor(): number | undefined {
		// prettier-ignore
		const kanjiNums: Record<string, number> = {
			〇: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
			零: 0, 壱: 1, 弐: 2, 参: 3, 伍: 5,
			壹: 1, 貳: 2, 參: 3, 肆: 4, 陸: 6, 漆: 7, 捌: 8, 玖: 9, // サクラ大戦
		};

		// prettier-ignore
		const kanjiPlace: Record<string, number> = {
			十: 10, 拾: 10, 百: 100,
		};

		let result = 0;
		let temp = 0;

		for (let i = 0; i < episode.length; i++) {
			const char = episode[i];

			if (Object.prototype.hasOwnProperty.call(kanjiNums, char)) {
				temp = kanjiNums[char];
			} else if (Object.prototype.hasOwnProperty.call(kanjiPlace, char)) {
				if (temp === 0) temp = 1;
				temp *= kanjiPlace[char];
				result += temp;
				temp = 0;
			}
		}
		result += temp;

		if (result === 0) return undefined;

		return result;
	}

	// 話数が文字列の場合の場合は、半角英数字に変換
	function specialEpisodeIdentifier(): string {
		return episode
			.replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 65248))
			.toLowerCase()
			.replace(/\s/g, "");
	}

	const number = arabicNumberExtractor();
	if (number !== undefined) return number;

	const kanjiNumber = kanjiNumberExtractor();
	if (kanjiNumber !== undefined) return kanjiNumber;

	return specialEpisodeIdentifier();
}
