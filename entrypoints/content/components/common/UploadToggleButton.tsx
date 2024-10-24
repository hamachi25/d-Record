/* 再生ページのアップロードボタン */
import AnimeTitle from "./AnimeTitle";
import { AbemaUploadToggleButton } from "../abema/AbemaUploadToggleButton";
import { DanimeUploadToggleButton } from "../danime/DanimeUploadToggleButton";
import { loading, setLoading } from "../../core/anime-data-scraper";
import { cleanupIntervalOrEvent, createIntervalOrEvent } from "../../core/record-watch-episode";
import { getNotRecordWork, settingData } from "../../utils/storage";

const uploadSVGIcon =
	"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xml%3Aspace%3D%22preserve%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M1%2015.5c0-2.3%201.2-4.4%203.1-5.5.5-4%203.8-7%207.9-7%204.1%200%207.4%203%207.9%207%201.8%201.1%203.1%203.2%203.1%205.5%200%203.4-2.6%206.2-6%206.5H7c-3.4-.3-6-3.1-6-6.5zM16.8%2020c2.3-.2%204.2-2.1%204.2-4.5%200-1.6-.8-3-2.1-3.8l-.8-.5-.1-1C17.6%207.3%2015%205%2012%205s-5.6%202.3-6%205.2l-.1.9-.8.5c-1.3.9-2.1%202.3-2.1%203.9%200%202.4%201.8%204.3%204.2%204.5h9.6z%22%2F%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M13%2013v4h-2v-4H8l4-5%204%205z%22%2F%3E%3C%2Fsvg%3E";
const notUploadSVGIcon =
	"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xml%3Aspace%3D%22preserve%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M1%2015.5c0-2.3%201.2-4.4%203.1-5.5.5-4%203.8-7%207.9-7s7.4%203%207.9%207c1.8%201.1%203.1%203.2%203.1%205.5%200%203.4-2.6%206.2-6%206.5H7c-3.4-.3-6-3.1-6-6.5zM16.8%2020c2.3-.2%204.2-2.1%204.2-4.5%200-1.6-.8-3-2.1-3.8l-.8-.5-.1-1C17.6%207.3%2015%205%2012%205s-5.6%202.3-6%205.2l-.1.9-.8.5c-1.3.9-2.1%202.3-2.1%203.9%200%202.4%201.8%204.3%204.2%204.5h9.6z%22%2F%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22m12%2014.9-3.2%203.2-1.5-1.5%203.2-3.2-3.2-3.3%201.5-1.5%203.2%203.2%203.2-3.2%201.5%201.5-3.2%203.3%203.2%203.2-1.5%201.5z%22%2F%3E%3C%2Fsvg%3E";
const completeUploadSVGIcon =
	"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xml%3Aspace%3D%22preserve%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M1%2015.5c0-2.3%201.2-4.4%203.1-5.5.5-4%203.8-7%207.9-7%204.1%200%207.4%203%207.9%207%201.8%201.1%203.1%203.2%203.1%205.5%200%203.4-2.6%206.2-6%206.5H7c-3.4-.3-6-3.1-6-6.5zM16.8%2020c2.3-.2%204.2-2.1%204.2-4.5%200-1.6-.8-3-2.1-3.8l-.8-.5-.1-1C17.6%207.3%2015%205%2012%205s-5.6%202.3-6%205.2l-.1.9-.8.5c-1.3.9-2.1%202.3-2.1%203.9%200%202.4%201.8%204.3%204.2%204.5h9.6z%22%2F%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22m5.4%2013.8%201.5-1.5%203.2%203.2%205.9-6%201.5%201.5-7.4%207.5z%22%2F%3E%3C%2Fsvg%3E";

// dアニメストアで、ボタンクリック時の影を追加するためのstate
const [shadow, setShadow] = createSignal(false);
async function changeUploadToggle(workId: string | null) {
	// 210ミリ秒遅延して影を削除
	setShadow(true);
	setTimeout(() => setShadow(false), 210);

	// アイコンがuploadかnotUploadの場合のみ、トグルの切り替えを行う
	if (
		loading.icon === "loading" ||
		loading.icon === "immutableNotUpload" ||
		loading.icon === "completeUpload"
	) {
		return;
	}

	const notRecordWork = await getNotRecordWork();
	if (notRecordWork === false) return;

	if (loading.icon === "upload") {
		/* notUploadに切り替え */
		setLoading("icon", "notUpload");

		cleanupIntervalOrEvent(); // インターバル・イベントを"削除"

		// 既にストレージに追加されている場合は追加しない
		if (workId && !notRecordWork.includes(workId)) {
			notRecordWork.push(workId);
			browser.storage.local.set({ notRecordWork: notRecordWork });
		}
	} else if (loading.icon === "notUpload") {
		/* uploadに切り替え */
		setLoading("icon", "upload");

		createIntervalOrEvent(); // インターバル・イベントを"作成"

		// ストレージから削除
		const newNotRecordWork = notRecordWork.filter((item: number | string) => item !== workId);
		browser.storage.local.set({ notRecordWork: newNotRecordWork });
	}
}

/**
 * 現在のステータスごとに、アイコンを変更
 */
function updateIcon() {
	switch (loading.icon) {
		case "upload":
			return uploadSVGIcon;
		case "notUpload":
			return notUploadSVGIcon;
		case "immutableNotUpload":
			return notUploadSVGIcon;
		case "completeUpload":
			return completeUploadSVGIcon;
		default:
			return uploadSVGIcon;
	}
}

/**
 * アイコンホバーした時の表示に話数を追加
 */
function addEpisode(episode: {
	normalized: string | number | undefined;
	raw: string | number | undefined;
}) {
	if (episode.raw) return `  ${episode.raw}`; // 数字ではなく文字列の場合はそのまま返す
	if (episode.normalized !== undefined) return `  第${episode.normalized}話`;
	return "";
}

/******************************************************************************/

export default function UploadToggleButton(webSite: string) {
	return (
		<div class="flex items-center">
			<Show when={settingData.animeTitle}>
				<AnimeTitle webSite={webSite} />
			</Show>
			<Switch>
				<Match when={webSite === "abema"}>
					<AbemaUploadToggleButton
						updateIcon={updateIcon}
						changeUploadToggle={changeUploadToggle}
						addEpisode={addEpisode}
					/>
				</Match>

				<Match when={webSite === "danime"}>
					<DanimeUploadToggleButton
						updateIcon={updateIcon}
						shadow={shadow}
						changeUploadToggle={changeUploadToggle}
						addEpisode={addEpisode}
					/>
				</Match>
			</Switch>
		</div>
	);
}

/******************************************************************************/
