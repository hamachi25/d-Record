import "~/assets/RecordButton.css";
import { animeData } from "../anime-data-scraper";
import { fetchData } from "../fetch";
import { settingData } from "../storage";
import { Episode } from "../types";
import {
	changeStatusText,
	changeStatusToWatched,
	changeStatusToWatching,
	isAiring,
} from "../utils";

export function RecordButton(i: number, j: number, insertTargets: NodeListOf<HTMLElement>) {
	const episodeData: Episode[] = animeData.episodes.nodes;

	function updateStatusToWatching(mutation: string): string {
		if (isAiring === true || i !== insertTargets.length - 1) {
			mutation = changeStatusToWatching(mutation);
			changeStatusText("WATCHING");
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
			changeStatusText("WATCHED");
		}
		return mutation;
	}

	function clickSingleRecordButton() {
		let mutation = "mutation{";

		// ステータスを"見てる"に変更
		mutation = updateStatusToWatching(mutation);

		mutation += `
	        createRecord (
	            input: { episodeId:"${episodeData[i].id}"}
	        ) { clientMutationId }
	    `;

		// ステータスを"見た"に変更
		mutation = updateStatusToWatched(mutation);

		mutation += "}";
		fetchData(JSON.stringify({ query: mutation }));

		const recordContainers: NodeListOf<HTMLElement> =
			document.querySelectorAll(".record-container");
		recordContainers[j].style.display = "none";
	}

	function clickMultiRecordButton() {
		let mutation = "mutation{";

		mutation = updateStatusToWatching(mutation);

		const recordContainers: NodeListOf<HTMLElement> =
			document.querySelectorAll(".record-container");
		for (let k = 0; k <= j; k++) {
			mutation += `
                e${k}:createRecord(
                    input:{ episodeId:"${episodeData[i - j + k].id}" }
                ) { clientMutationId }
            `;

			recordContainers[k].style.display = "none";
		}

		mutation = updateStatusToWatched(mutation);

		mutation += "}";
		fetchData(JSON.stringify({ query: mutation }));
	}

	return (
		<>
			<button class="record-button" onClick={clickSingleRecordButton}>
				<svg class="record-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
					<path d="M435.848 83.466L172.804 346.51l-96.652-96.652c-4.686-4.686-12.284-4.686-16.971 0l-28.284 28.284c-4.686 4.686-4.686 12.284 0 16.971l133.421 133.421c4.686 4.686 12.284 4.686 16.971 0l299.813-299.813c4.686-4.686 4.686-12.284 0-16.971l-28.284-28.284c-4.686-4.686-12.284-4.686-16.97 0z"></path>
				</svg>
				記録
			</button>
			<button class="record-button" onClick={clickMultiRecordButton}>
				<svg class="record-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
					<path d="M35.5 183.9l148-148.4c4.7-4.7 12.3-4.7 17 0l148 148.4c4.7 4.7 4.7 12.3 0 17l-19.6 19.6c-4.8 4.8-12.5 4.7-17.1-.2L218 123.2V372c0 6.6-5.4 12-12 12h-28c-6.6 0-12-5.4-12-12V123.2l-93.7 97.1c-4.7 4.8-12.4 4.9-17.1.2l-19.6-19.6c-4.8-4.7-4.8-12.3-.1-17zM372 428H12c-6.6 0-12 5.4-12 12v28c0 6.6 5.4 12 12 12h360c6.6 0 12-5.4 12-12v-28c0-6.6-5.4-12-12-12z"></path>
				</svg>
				ここまで記録
			</button>
			<svg
				class="record-svg"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 512 512"
				style="min-width: 20px !important;"
			>
				<g>
					<path
						d="M454.485,0H165.87c-13.647,0-32.707,7.895-42.357,17.544L50.247,90.81c-9.65,9.65-17.544,28.71-17.544,42.357
            		v354.021c0,13.647,11.165,24.812,24.812,24.812h288.616c13.647,0,35.978,0,49.625,0h58.73c13.647,0,24.812-11.165,24.812-24.812
            		v-58.731c0-13.647,0-35.978,0-49.624V24.812C479.297,11.165,468.132,0,454.485,0z M317.277,399.201c0,2.098-1.7,3.798-3.798,3.798
            		h-180.19c-2.097,0-3.798-1.701-3.798-3.798v-16.709c0-2.098,1.701-3.798,3.798-3.798h180.19c2.098,0,3.798,1.7,3.798,3.798V399.201
            		z M382.509,322.834c0,2.435-1.974,4.41-4.409,4.41H133.9c-2.435,0-4.409-1.974-4.409-4.41v-15.486c0-2.435,1.974-4.408,4.409-4.408
            		h244.201c2.435,0,4.409,1.974,4.409,4.408V322.834z M382.509,247.08c0,2.435-1.974,4.408-4.409,4.408H133.9
            		c-2.435,0-4.409-1.974-4.409-4.408v-15.486c0-2.435,1.974-4.409,4.409-4.409h244.201c2.435,0,4.409,1.974,4.409,4.409V247.08z
            		 M382.509,171.326c0,2.435-1.974,4.408-4.409,4.408H133.9c-2.435,0-4.409-1.974-4.409-4.408v-15.487
            		c0-2.435,1.974-4.409,4.409-4.409h244.201c2.435,0,4.409,1.974,4.409,4.409V171.326z"
						style="fill: rgb(75, 75, 75);"
					></path>
				</g>
			</svg>
		</>
	);
}
