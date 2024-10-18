import { ContentScriptContext } from "wxt/client";
import RecordButton from "./components/RecordButton";
import { animeData } from "./anime-data-scraper";
import { settingData } from "./storage";
import { episodeNumberExtractor, handleUnregisteredNextEpisode } from "./utils";

/**
 * 次に視聴するエピソードに赤枠をつける
 */
function createNextEpisodeBorder(i: number) {
	if (settingData.nextEpisodeLine && !document.querySelector(".next-episode-border")) {
		const targetElements = document.querySelectorAll(".episodeContainer>div>.itemModule.list");
		if (targetElements[i]) targetElements[i].classList.add("next-episode-border");
	}
}

/**
 * エピソードが存在しているか判定
 */
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

/******************************************************************************/

/**
 * 作品ページの記録ボタンを作成
 * @description 今のところdアニメストアのみ記録ボタンを表示する
 */
export async function createRecordButton(ctx: ContentScriptContext) {
	// 次のエピソードがAnnictに登録されていない場合は、最新話まで見たと判断
	const isNextEpisodeUnregistered = handleUnregisteredNextEpisode(document);
	if (isNextEpisodeUnregistered) return;

	// nextEpisodeがない・1話しかない場合はindexを0にする
	let nextEpisodeIndex: number = 0;
	if (animeData.nextEpisode !== undefined && animeData.episodes.length !== 1) {
		nextEpisodeIndex = animeData.nextEpisode;
	}

	const insertTargets: NodeListOf<HTMLElement> = document.querySelectorAll("a[id].clearfix");
	let j = 0;
	for (const [i, insertTarget] of insertTargets.entries()) {
		// 視聴済みのエピソードはスキップ
		if (i < nextEpisodeIndex && animeData.sortedEpisodes[i].viewerRecordsCount !== 0) {
			continue;
		}

		// エピソードが存在していなかったらスキップ
		if (!isEpisodeExist(insertTargets, i)) continue;

		const ui = await createShadowRootUi(ctx, {
			name: "dr-record-button",
			position: "inline",
			anchor: insertTarget,
			append: "after",
			onMount: (container) => {
				return render(() => RecordButton(i, j, insertTargets), container);
			},
			onRemove: (unmount) => {
				if (unmount) unmount();
			},
		});
		if (!settingData || settingData.recordButton) ui.mount();

		j++;
	}
}

/******************************************************************************/
