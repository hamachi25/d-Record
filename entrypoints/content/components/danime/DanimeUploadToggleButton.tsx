import styleText from "./assets/danime.css?inline";
import "~/assets/UploadToggleButton.css";
import { Accessor } from "solid-js";
import { animeData, loading, websiteInfo } from "../../anime-data-scraper";

export function DanimeUploadToggleButton(props: {
	updateIcon: () => string;
	shadow: Accessor<boolean>;
	changeUploadToggle: (workId: string | null) => Promise<void>;
	addEpisode: (episode: {
		normalized: string | number | undefined;
		raw: string | number | undefined;
	}) => string;
}) {
	// スタイルをheaderに追加
	const style = document.createElement("style");
	style.textContent = styleText;
	document.head.append(style);

	return (
		<div
			id="upload-icon-container"
			onClick={() => props.changeUploadToggle(websiteInfo.workId)}
		>
			<Show
				when={loading.icon === "loading"}
				fallback={
					<img
						id="upload-icon"
						src={props.updateIcon()}
						width={28}
						height={28}
						classList={{
							"drop-shadow": props.shadow(),
							"not-upload-icon":
								loading.icon === "immutableNotUpload" ||
								loading.icon === "completeUpload",
						}}
					/>
				}
			>
				<span class="loading loading-spinner loading-md text-white opacity-60"></span>
			</Show>

			<div id="drecord-popup">
				<div id="drecord-popupIn">
					<span>
						{loading.message
							? loading.message
							: animeData.title + props.addEpisode(animeData.currentEpisode)}
					</span>
				</div>
			</div>
		</div>
	);
}
