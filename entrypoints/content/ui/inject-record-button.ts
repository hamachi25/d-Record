import { ContentScriptContext } from "wxt/client";
import RecordButton from "../components/danime/DanimeRecordButton";
import { animeData } from "../core/anime-data-scraper";
import { settingData } from "../utils/storage";
import { episodeNumberExtractor, checkNextEpisodeRegistered } from "../utils/episode";

/**
 * 次に視聴するエピソードに赤枠をつける
 */
function createNextEpisodeBorder(i: number) {
	if (settingData.nextEpisodeLine && !document.querySelector(".next-episode-border")) {
		const targetElements = document.querySelectorAll(".episodeContainer>div>.itemModule.list");
		if (targetElements[i]) targetElements[i].classList.add("next-episode-border");
	}
}

/******************************************************************************/

/**
 * @description 取得したデータにnextEpisodeがない・1話しかない場合はindexを0にする
 */
function getNextEpisodeIndex(): number {
	return animeData.nextEpisode !== undefined && animeData.episodes.length !== 1
		? animeData.nextEpisode
		: 0;
}

/******************************************************************************/

function isEpisodeExist(targets: NodeListOf<HTMLElement>, i: number) {
	// dアニメストアのエピソード番号を取得
	const episodeText = targets[i].querySelector(".textContainer>span>.number")?.textContent;
	const normalizedEpisode = episodeText ? episodeNumberExtractor(episodeText) : undefined;
	if (!normalizedEpisode) return false;

	const nextEpisodeIndex = animeData.nextEpisode ? animeData.nextEpisode : 0;
	const sortedEpisodes = animeData.sortedEpisodes;

	for (let j = 0; j < sortedEpisodes.length; j++) {
		// Annictのデータと一致するエピソードがあるか
		if (sortedEpisodes[j].numberTextNormalized === normalizedEpisode) {
			if (j === nextEpisodeIndex) createNextEpisodeBorder(i); // 次のエピソードに赤枠をつける
			return true;
		}
	}
	return false;
}

function isWatchedEpisode(i: number, nextEpisodeIndex: number) {
	return i < nextEpisodeIndex && animeData.sortedEpisodes[i].viewerRecordsCount !== 0;
}

/******************************************************************************/

/**
 * 作品ページの記録ボタンを作成
 * @description 今のところdアニメストアにのみ記録ボタンを表示する
 */
export async function injectRecordButton(ctx: ContentScriptContext) {
	// 次のエピソードがAnnictに登録されていない場合は、最新話まで見たと判断
	const isNextEpisodeRegistered = checkNextEpisodeRegistered(document);
	if (!isNextEpisodeRegistered) return;

	const nextEpisodeIndex = getNextEpisodeIndex();

	const insertTargets: NodeListOf<HTMLElement> = document.querySelectorAll("a[id].clearfix");
	let insertedCount = 0;

	for (const [i, insertTarget] of insertTargets.entries()) {
		if (isWatchedEpisode(i, nextEpisodeIndex)) continue; // 視聴済みのエピソードはスキップ
		if (!isEpisodeExist(insertTargets, i)) continue; // エピソードが存在していなかったらスキップ

		const ui = await createShadowRootUi(ctx, {
			name: "dr-record-button",
			position: "inline",
			anchor: insertTarget,
			append: "after",
			onMount: (container) => {
				return render(() => RecordButton(i, insertedCount, insertTargets), container);
			},
		});
		if (!settingData || settingData.recordButton) ui.mount();

		insertedCount++;
	}
}
