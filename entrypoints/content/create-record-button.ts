import { ContentScriptContext } from "wxt/client";
import { RecordButton } from "./components/RecordButton";
import { currentAnimeData } from "./anime-data-scraper";
import { settingData } from "./storage";
import { handleUnregisteredNextEpisode } from "./utils";

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
	const diff = Math.abs(insertTargets.length - currentAnimeData.episodesCount);

	if (currentAnimeData.episodesCount === 0 || diff > 4) return;

	const isNextEpisodeUnregistered = handleUnregisteredNextEpisode(
		document,
		currentAnimeData.nextEpisode,
		currentAnimeData.episodes,
	);
	if (isNextEpisodeUnregistered) return;

	if (!settingData || !settingData.recordButton) {
		// nextEpisodeがない・1話しかない場合はindexを0にする
		let nextEpisodeIndex: number = 0;
		if (currentAnimeData.nextEpisode !== undefined && currentAnimeData.episodesCount !== 1) {
			nextEpisodeIndex = currentAnimeData.nextEpisode;
		}

		let j = 0;
		for (const [i, insertTarget] of insertTargets.entries()) {
			if (i < nextEpisodeIndex && currentAnimeData.episodes[i].viewerRecordsCount !== 0) {
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

	// 次のエピソードに赤枠をつける
	const elements = document.querySelectorAll(".episodeContainer>div>.itemModule.list");
	const nextEpisodeElement = elements[currentAnimeData.nextEpisode ?? 0];
	if (nextEpisodeElement) nextEpisodeElement.classList.add("next-episode-border");
}
