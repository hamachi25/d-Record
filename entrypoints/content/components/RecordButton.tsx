import "~/assets/RecordButton.css";
import { animeData } from "../anime-data-scraper";
import { fetchData } from "../fetch";
import { settingData } from "../storage";
import {
	changeStatusText,
	changeStatusToWatched,
	changeStatusToWatching,
	isCurrentlyAiring,
	updateNextEpisode,
} from "../utils";
import { setStatusAndSvg } from "./StatusDropMenu";

export function RecordButton(i: number, j: number, insertTargets: NodeListOf<HTMLElement>) {
	const isAiring = isCurrentlyAiring(document);

	function updateStatusToWatching(mutation: string): string {
		if (isAiring === true || i !== insertTargets.length - 1) {
			mutation = changeStatusToWatching(mutation);
			changeStatusText("WATCHING", setStatusAndSvg);
		}
		return mutation;
	}

	function updateStatusToWatched(mutation: string): string {
		if (
			isAiring === false &&
			i === insertTargets.length - 1 &&
			(settingData.autoChangeStatus === undefined || settingData.autoChangeStatus === true)
		) {
			mutation = changeStatusToWatched(mutation);
			changeStatusText("WATCHED", setStatusAndSvg);
		}
		return mutation;
	}

	function deleteAndCreateNextEpisodeBorder() {
		if (settingData.nextEpisodeLine) {
			document.querySelector(".next-episode-border")?.classList.remove("next-episode-border");
			const elements = document.querySelectorAll(".episodeContainer>div>.itemModule.list")[
				i + 1
			];
			elements.classList.add("next-episode-border");
		}
	}

	function clickSingleRecordButton() {
		if (animeData.episodes.length === 0) return;

		let mutation = "mutation{";

		// ステータスを"見てる"に変更
		mutation = updateStatusToWatching(mutation);

		mutation += `
	        createRecord (
	            input: { episodeId:"${animeData.episodes[i].id}"}
	        ) { clientMutationId }
	    `;

		// ステータスを"見た"に変更
		mutation = updateStatusToWatched(mutation);

		mutation += "}";
		fetchData(JSON.stringify({ query: mutation }));

		const recordContainers: NodeListOf<HTMLElement> = document.querySelectorAll(
			".drecord-record-button-container",
		);
		recordContainers[j].style.display = "none";

		const nextEpisodeIndex = animeData.nextEpisode ? animeData.nextEpisode : 0;
		if (i === nextEpisodeIndex) {
			updateNextEpisode(nextEpisodeIndex + 1);

			deleteAndCreateNextEpisodeBorder();
		}
	}

	function clickMultiRecordButton() {
		if (animeData.episodes.length === 0) return;

		let mutation = "mutation{";

		mutation = updateStatusToWatching(mutation);

		const recordContainers: NodeListOf<HTMLElement> = document.querySelectorAll(
			".drecord-record-button-container",
		);
		for (let k = 0; k <= j; k++) {
			mutation += `
                e${k}:createRecord(
                    input:{ episodeId:"${animeData.episodes[i - j + k].id}" }
                ) { clientMutationId }
            `;

			recordContainers[k].style.display = "none";
		}

		mutation = updateStatusToWatched(mutation);

		mutation += "}";
		fetchData(JSON.stringify({ query: mutation }));

		deleteAndCreateNextEpisodeBorder();
	}

	const [showButton, setShowButton] = createSignal(false);

	return (
		<div class="drecord-record-button-container" onMouseLeave={() => setShowButton(false)}>
			<div classList={{ "drecord-record-button-list": true, show: showButton() }}>
				<button class="drecord-record-button" onClick={clickSingleRecordButton}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path>
					</svg>
					<span>記録</span>
				</button>
				<button class="drecord-record-button" onClick={clickMultiRecordButton}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path d="M11.602 13.7599L13.014 15.1719L21.4795 6.7063L22.8938 8.12051L13.014 18.0003L6.65 11.6363L8.06421 10.2221L10.189 12.3469L11.6025 13.7594L11.602 13.7599ZM11.6037 10.9322L16.5563 5.97949L17.9666 7.38977L13.014 12.3424L11.6037 10.9322ZM8.77698 16.5873L7.36396 18.0003L1 11.6363L2.41421 10.2221L3.82723 11.6352L3.82604 11.6363L8.77698 16.5873Z"></path>
					</svg>
					<span>ここまで記録</span>
				</button>
			</div>
			<div class="drecord-record-svg-container" onMouseEnter={() => setShowButton(true)}>
				<svg
					class="drecord-record-svg"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path
						classList={{ show: !showButton() }}
						d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5H5ZM11 11V7H13V11H17V13H13V17H11V13H7V11H11Z"
					></path>
					<path
						classList={{ show: showButton() }}
						d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM11 11H7V13H11V17H13V13H17V11H13V7H11V11Z"
					></path>
				</svg>
			</div>
		</div>
	);
}
