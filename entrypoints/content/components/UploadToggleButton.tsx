/* 再生ページのアップロードボタン */

import "~/assets/UploadToggleButton.css";
import AnimeTitle from "./AnimeTitle";
import { animeData, loading } from "../anime-data-scraper";
import { cleanupIntervalOrEvent, createIntervalOrEvent } from "../record-watch-episode";
import { getNotRecordWork, settingData } from "../storage";

const [uploadIcon, setUploadIcon] = createSignal("loading");
export { setUploadIcon };

const loadingAnimationSVGIcon =
	"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2248%22%20height%3D%2248%22%20fill%3D%22%23fff%22%20viewBox%3D%220%200%2024%2024%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%222%22%20r%3D%222%22%20opacity%3D%22.1%22%3E%3Canimate%20attributeName%3D%22opacity%22%20begin%3D%220%22%20dur%3D%221s%22%20from%3D%221%22%20repeatCount%3D%22indefinite%22%20to%3D%22.1%22%2F%3E%3C%2Fcircle%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%222%22%20r%3D%222%22%20opacity%3D%22.1%22%20transform%3D%22rotate(45%2012%2012)%22%3E%3Canimate%20attributeName%3D%22opacity%22%20begin%3D%22.125s%22%20dur%3D%221s%22%20from%3D%221%22%20repeatCount%3D%22indefinite%22%20to%3D%22.1%22%2F%3E%3C%2Fcircle%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%222%22%20r%3D%222%22%20opacity%3D%22.1%22%20transform%3D%22rotate(90%2012%2012)%22%3E%3Canimate%20attributeName%3D%22opacity%22%20begin%3D%22.25s%22%20dur%3D%221s%22%20from%3D%221%22%20repeatCount%3D%22indefinite%22%20to%3D%22.1%22%2F%3E%3C%2Fcircle%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%222%22%20r%3D%222%22%20opacity%3D%22.1%22%20transform%3D%22rotate(135%2012%2012)%22%3E%3Canimate%20attributeName%3D%22opacity%22%20begin%3D%22.375s%22%20dur%3D%221s%22%20from%3D%221%22%20repeatCount%3D%22indefinite%22%20to%3D%22.1%22%2F%3E%3C%2Fcircle%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%222%22%20r%3D%222%22%20opacity%3D%22.1%22%20transform%3D%22rotate(180%2012%2012)%22%3E%3Canimate%20attributeName%3D%22opacity%22%20begin%3D%22.5s%22%20dur%3D%221s%22%20from%3D%221%22%20repeatCount%3D%22indefinite%22%20to%3D%22.1%22%2F%3E%3C%2Fcircle%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%222%22%20r%3D%222%22%20opacity%3D%22.1%22%20transform%3D%22rotate(225%2012%2012)%22%3E%3Canimate%20attributeName%3D%22opacity%22%20begin%3D%22.625s%22%20dur%3D%221s%22%20from%3D%221%22%20repeatCount%3D%22indefinite%22%20to%3D%22.1%22%2F%3E%3C%2Fcircle%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%222%22%20r%3D%222%22%20opacity%3D%22.1%22%20transform%3D%22rotate(270%2012%2012)%22%3E%3Canimate%20attributeName%3D%22opacity%22%20begin%3D%22.75s%22%20dur%3D%221s%22%20from%3D%221%22%20repeatCount%3D%22indefinite%22%20to%3D%22.1%22%2F%3E%3C%2Fcircle%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%222%22%20r%3D%222%22%20opacity%3D%22.1%22%20transform%3D%22rotate(315%2012%2012)%22%3E%3Canimate%20attributeName%3D%22opacity%22%20begin%3D%22.875s%22%20dur%3D%221s%22%20from%3D%221%22%20repeatCount%3D%22indefinite%22%20to%3D%22.1%22%2F%3E%3C%2Fcircle%3E%3C%2Fsvg%3E";
const uploadSVGIcon =
	"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xml%3Aspace%3D%22preserve%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M1%2015.5c0-2.3%201.2-4.4%203.1-5.5.5-4%203.8-7%207.9-7%204.1%200%207.4%203%207.9%207%201.8%201.1%203.1%203.2%203.1%205.5%200%203.4-2.6%206.2-6%206.5H7c-3.4-.3-6-3.1-6-6.5zM16.8%2020c2.3-.2%204.2-2.1%204.2-4.5%200-1.6-.8-3-2.1-3.8l-.8-.5-.1-1C17.6%207.3%2015%205%2012%205s-5.6%202.3-6%205.2l-.1.9-.8.5c-1.3.9-2.1%202.3-2.1%203.9%200%202.4%201.8%204.3%204.2%204.5h9.6z%22%2F%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M13%2013v4h-2v-4H8l4-5%204%205z%22%2F%3E%3C%2Fsvg%3E";
const notUploadSVGIcon =
	"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xml%3Aspace%3D%22preserve%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M1%2015.5c0-2.3%201.2-4.4%203.1-5.5.5-4%203.8-7%207.9-7s7.4%203%207.9%207c1.8%201.1%203.1%203.2%203.1%205.5%200%203.4-2.6%206.2-6%206.5H7c-3.4-.3-6-3.1-6-6.5zM16.8%2020c2.3-.2%204.2-2.1%204.2-4.5%200-1.6-.8-3-2.1-3.8l-.8-.5-.1-1C17.6%207.3%2015%205%2012%205s-5.6%202.3-6%205.2l-.1.9-.8.5c-1.3.9-2.1%202.3-2.1%203.9%200%202.4%201.8%204.3%204.2%204.5h9.6z%22%2F%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22m12%2014.9-3.2%203.2-1.5-1.5%203.2-3.2-3.2-3.3%201.5-1.5%203.2%203.2%203.2-3.2%201.5%201.5-3.2%203.3%203.2%203.2-1.5%201.5z%22%2F%3E%3C%2Fsvg%3E";
const completeUploadSVGIcon =
	"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xml%3Aspace%3D%22preserve%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M1%2015.5c0-2.3%201.2-4.4%203.1-5.5.5-4%203.8-7%207.9-7%204.1%200%207.4%203%207.9%207%201.8%201.1%203.1%203.2%203.1%205.5%200%203.4-2.6%206.2-6%206.5H7c-3.4-.3-6-3.1-6-6.5zM16.8%2020c2.3-.2%204.2-2.1%204.2-4.5%200-1.6-.8-3-2.1-3.8l-.8-.5-.1-1C17.6%207.3%2015%205%2012%205s-5.6%202.3-6%205.2l-.1.9-.8.5c-1.3.9-2.1%202.3-2.1%203.9%200%202.4%201.8%204.3%204.2%204.5h9.6z%22%2F%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22m5.4%2013.8%201.5-1.5%203.2%203.2%205.9-6%201.5%201.5-7.4%207.5z%22%2F%3E%3C%2Fsvg%3E";

export default function UploadToggleButton() {
	const [shadow, setShadow] = createSignal(false);

	const partId = location.href.match(/(?<=partId=)\d+/);
	const workId = partId && partId[0].substring(0, 5);

	async function changeUploadToggle() {
		setShadow(true);
		setTimeout(() => setShadow(false), 210);

		if (
			uploadIcon() === "loading" ||
			uploadIcon() === "immutableNotUpload" ||
			uploadIcon() === "completeUpload"
		) {
			return;
		}

		const notRecordWork = await getNotRecordWork();
		if (!notRecordWork) return;

		if (uploadIcon() === "upload") {
			setUploadIcon("notUpload");

			cleanupIntervalOrEvent();

			if (!notRecordWork.includes(Number(workId))) {
				notRecordWork.push(Number(workId));
				browser.storage.local.set({ notRecordWork: notRecordWork });
			}
		} else if (uploadIcon() === "notUpload") {
			setUploadIcon("upload");

			createIntervalOrEvent();

			const newNotRecordWork = notRecordWork.filter(
				(item: number) => item !== Number(workId),
			);
			browser.storage.local.set({ notRecordWork: newNotRecordWork });
		}
	}

	function updateIcon() {
		switch (uploadIcon()) {
			case "loading":
				return loadingAnimationSVGIcon;
			case "upload":
				return uploadSVGIcon;
			case "notUpload":
				return notUploadSVGIcon;
			case "immutableNotUpload":
				return notUploadSVGIcon;
			case "completeUpload":
				return completeUploadSVGIcon;
		}
	}

	// 話数を追加
	const addEpisode = (episode: {
		normalized: string | number | undefined;
		raw: string | number | undefined;
	}) => {
		if (episode.raw) return `  ${episode.raw}`; // 文字列の場合はそのまま返す
		if (episode.normalized !== undefined) return `  第${episode.normalized}話`;
		return "";
	};

	return (
		<>
			<Show when={settingData.animeTitle}>
				<AnimeTitle />
			</Show>
			<div id="upload-icon-container" onClick={changeUploadToggle}>
				<img
					id="upload-icon"
					src={updateIcon()}
					width={28}
					height={28}
					classList={{
						"drop-shadow": shadow(),
						"not-upload-icon":
							uploadIcon() === "immutableNotUpload" ||
							uploadIcon() === "completeUpload",
					}}
				/>
				<div id="drecord-popup">
					<div id="drecord-popupIn">
						<span>
							{loading().message
								? loading().message
								: animeData.title + addEpisode(animeData.currentEpisode)}
						</span>
					</div>
				</div>
			</div>
		</>
	);
}
