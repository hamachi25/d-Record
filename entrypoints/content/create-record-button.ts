import { ContentScriptContext } from "wxt/client";
import { RecordButton } from "./components/RecordButton";
import { animeData, viewData } from "./anime-data-scraper";
import { settingData } from "./storage";
import { Episode } from "./types";
import { handleUnregisteredNextEpisode, getNextEpisodeIndex } from "./utils";

// 記録ボタンを作成
export async function createRecordButton(ctx: ContentScriptContext) {
	// エピソード数が61以上の場合は、取得に時間がかかるため記録ボタンを作成しない
	const episodeElement = document.querySelectorAll(".episodeContainer>.swiper-slide");
	if (episodeElement && episodeElement.length >= 5) return;

	/*
    動画の要素と取得したエピソード数の差が、4以上だったら実行しない
    Annict側で1期2期が別れている可能性がある 例：水星の魔女
    */
	const insertTargets: NodeListOf<HTMLElement> = document.querySelectorAll("a[id].clearfix");
	const diff = Math.abs(insertTargets.length - animeData.episodesCount);

	const episodeData: Episode[] = animeData.episodes.nodes;
	if (episodeData.length === 0 || diff > 4) return;

	let nextEpisodeIndex = getNextEpisodeIndex(viewData, episodeData);

	const isNextEpisodeUnregistered = handleUnregisteredNextEpisode(
		document,
		nextEpisodeIndex,
		episodeData,
	);
	if (isNextEpisodeUnregistered) return;

	// nextEpisodeがない・1話しかない場合はindexを0にする
	if (nextEpisodeIndex === undefined || episodeData.length === 1) nextEpisodeIndex = 0;

	if (!settingData || !settingData.recordButton) {
		let j = 0;
		for (const [i, insertTarget] of insertTargets.entries()) {
			if (
				nextEpisodeIndex === undefined ||
				(i < nextEpisodeIndex && episodeData[i].viewerRecordsCount !== 0)
			) {
				continue;
			}

			const ui = createIntegratedUi(ctx, {
				position: "inline",
				anchor: insertTarget,
				append: "after",
				onMount: (container) => {
					container.classList.add("record-container");

					return render(() => RecordButton(i, j, insertTargets), container);
				},
				onRemove: (unmount) => {
					if (unmount) unmount();
				},
			});
			ui.mount();

			j++;
		}
	}

	if (!settingData || !settingData.nextEpisodeLine) {
		// 視聴した次のエピソードに赤枠をつける
		const insertTarget = insertTargets[nextEpisodeIndex];
		if (nextEpisodeIndex !== undefined && insertTarget) {
			const itemModule = insertTarget.closest(".itemModule.list");
			if (itemModule) itemModule.classList.add("next-episode-border");
		}
	}
}
