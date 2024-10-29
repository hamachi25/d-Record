/* 作品ページの記録ボタン */

import { animeData } from "../../core/anime-data-scraper";
import { fetchDataFromAnnict } from "../../utils/api/fetch";
import { settingData } from "../../utils/storage";
import { isCurrentlyAiring } from "../../utils/episode";
import {
	changeStatusToWatched,
	changeStatusToWatching,
	convertStatusToJapanese,
} from "../../utils/status";
import { setStatusAndSvg } from "../common/StatusDropMenu";

/**
 * 視聴ステータスのテキストを更新する
 */
function changeStatusText(status: string) {
	const [statusText, svgPathD, svgViewBox] = convertStatusToJapanese(status);

	setStatusAndSvg({
		svgPathD: svgPathD,
		svgViewBox: svgViewBox,
		statusText: statusText,
	});
}

/**
 * 視聴ステータスを"見てる"に変更するgraphqlのmutationを返す
 */
function updateStatusToWatching(
	mutation: string,
	isAiring: boolean,
	i: number,
	insertTargets: NodeListOf<HTMLElement>,
): string {
	if (isAiring === true || i !== insertTargets.length - 1) {
		mutation = changeStatusToWatching(mutation);
		changeStatusText("WATCHING");
	}
	return mutation;
}

/**
 * 視聴ステータスを"見た"に変更するgraphqlのmutationを返す
 */
function updateStatusToWatched(
	mutation: string,
	isAiring: boolean,
	i: number,
	insertTargets: NodeListOf<HTMLElement>,
): string {
	if (
		isAiring === false &&
		i === insertTargets.length - 1 &&
		(settingData.autoChangeStatus === undefined || settingData.autoChangeStatus === true)
	) {
		mutation = changeStatusToWatched(mutation);
		changeStatusText("WATCHED");
	}
	return mutation;
}

/**
 * 次に視聴するエピソードの赤枠を削除する
 */
function deleteNextEpisodeBorder() {
	if (settingData.nextEpisodeLine) {
		document.querySelector(".next-episode-border")?.classList.remove("next-episode-border");
	}
}

/**
 * "記録"ボタンをクリックしたときのイベント
 */
function clickSingleRecordButton(
	i: number,
	j: number,
	insertTargets: NodeListOf<HTMLElement>,
	isAiring: boolean,
) {
	let mutation = "mutation{";

	mutation = updateStatusToWatching(mutation, isAiring, i, insertTargets);

	mutation += `
        createRecord (
            input: { episodeId:"${animeData.sortedEpisodes[i].id}"}
        ) { clientMutationId }
    `;

	mutation = updateStatusToWatched(mutation, isAiring, i, insertTargets);

	mutation += "}";

	const result = fetchDataFromAnnict(JSON.stringify({ query: mutation }));
	if (!result) return;

	// クリックしたボタンを非表示
	const recordContainers: NodeListOf<HTMLElement> = document.querySelectorAll("dr-record-button");
	if (recordContainers[j]) recordContainers[j].style.display = "none";

	// クリックしたエピソードが次に視聴するエピソードだった場合、赤枠を削除
	const nextEpisodeIndex = animeData.nextEpisode ? animeData.nextEpisode : 0;
	if (i === nextEpisodeIndex) deleteNextEpisodeBorder();
}

// "ここまで記録"ボタンをクリックしたときのイベント
function clickMultiRecordButton(
	i: number,
	j: number,
	insertTargets: NodeListOf<HTMLElement>,
	isAiring: boolean,
) {
	let mutation = "mutation{";

	mutation = updateStatusToWatching(mutation, isAiring, i, insertTargets);

	const recordContainers: NodeListOf<HTMLElement> = document.querySelectorAll("dr-record-button");
	for (let k = 0; k <= j; k++) {
		mutation += `
            e${k}:createRecord(
                input:{ episodeId:"${animeData.sortedEpisodes[i - j + k].id}" }
            ) { clientMutationId }
        `;

		if (recordContainers[k]) recordContainers[k].style.display = "none"; // ボタンを非表示
	}

	mutation = updateStatusToWatched(mutation, isAiring, i, insertTargets);

	mutation += "}";

	const result = fetchDataFromAnnict(JSON.stringify({ query: mutation }));
	if (!result) return;

	deleteNextEpisodeBorder();
}

/******************************************************************************/

export default function RecordButton(i: number, j: number, insertTargets: NodeListOf<HTMLElement>) {
	const isAiring = isCurrentlyAiring(document); // 現在放送中かどうか

	const [showButton, setShowButton] = createSignal(false);

	return (
		<div
			class="font-danime absolute flex bottom-0 right-0 pointer-events-none"
			onMouseLeave={() => setShowButton(false)}
		>
			<div
				class="flex my-[3px] opacity-0 invisible translate-x-[15px] duration-150 ease-in-out pointer-events-auto [&.show]:opacity-100 [&.show]:visible [&.show]:translate-x-0
                    [&>button]:flex [&>button]:items-center [&>button]:border [&>button]:border-[rgba(0,_0,_0,_0.2)] [&>button]:rounded-[2px] [&>button]:whitespace-nowrap [&>button]:mr-[4px]
                    [&>button]:p-[1px_4px] [&>button]:text-[#5b5b5b] [&>button]:cursor-pointer [&>button]:duration-150 [&>button]:ease-in-out [&>button]:bg-white [&>button]:select-none"
				classList={{ "drecord-record-button-list": true, show: showButton() }}
			>
				<button
					class="hover:bg-[rgb(225,_227,_231)] active:bg-[rgb(179,180,184)]"
					onClick={() => clickSingleRecordButton(i, j, insertTargets, isAiring)}
				>
					<svg
						class="w-[17px] h-[17px] mr-[1px]"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path>
					</svg>
					<span class="text-[14px] min-[960px]:text-[12px]">記録</span>
				</button>
				<button
					class="mr-[2px] hover:bg-[rgb(225,_227,_231)] active:bg-[rgb(179,180,184)]"
					onClick={() => clickMultiRecordButton(i, j, insertTargets, isAiring)}
				>
					<svg
						class="w-[17px] h-[17px] mr-[1px]"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d="M11.602 13.7599L13.014 15.1719L21.4795 6.7063L22.8938 8.12051L13.014 18.0003L6.65 11.6363L8.06421 10.2221L10.189 12.3469L11.6025 13.7594L11.602 13.7599ZM11.6037 10.9322L16.5563 5.97949L17.9666 7.38977L13.014 12.3424L11.6037 10.9322ZM8.77698 16.5873L7.36396 18.0003L1 11.6363L2.41421 10.2221L3.82723 11.6352L3.82604 11.6363L8.77698 16.5873Z"></path>
					</svg>
					<span class="text-[14px] min-[960px]:text-[12px]">ここまで記録</span>
				</button>
			</div>

			<div
				class="p-[4px_4px_4px_0] cursor-pointer duration-200 pointer-events-auto active:scale-90"
				onMouseEnter={() => setShowButton(true)}
			>
				<svg
					class="relative w-[30px] min-[960px]:w-[25px] h-[30px] min-[960px]:h-[25px] z-[100] text-black [&>path]:duration-[250] [&>path]:ease-in-out"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path
						class="opacity-0 [&.show]:opacity-100"
						classList={{ show: !showButton() }}
						d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5H5ZM11 11V7H13V11H17V13H13V17H11V13H7V11H11Z"
					></path>
					<path
						class="opacity-0 [&.show]:opacity-100"
						classList={{ show: showButton() }}
						d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM11 11H7V13H11V17H13V13H17V11H13V7H11V11Z"
					></path>
				</svg>
			</div>
		</div>
	);
}

/******************************************************************************/
