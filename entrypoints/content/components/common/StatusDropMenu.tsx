/* 作品ページのドロップメニュー */
import { AbemaStatusDropMenu } from "../abema/AbemaStatusDropMenu";
import { DanimeStatusDropMenu } from "../danime/DanimeStatusDropMenu";
import { animeData } from "../../core/anime-data-scraper";
import { fetchDataFromAnnict } from "../../utils/api/fetch";
import { convertStatusToJapanese, updateViewerStatus } from "../../utils/status";
import { stateIcons } from "../../utils/svg";

const { noState, wannaWatch, watching, watched, hold, stopWatching } = stateIcons;

const [statusAndSvg, setStatusAndSvg] = createSignal({
	svgPathD: noState[0],
	svgViewBox: noState[1],
	statusText: "未選択",
});
export { setStatusAndSvg };

/**
 * ステータスを更新
 */
async function updateStatus(status: string) {
	if (status === animeData.viewerStatusState) return; // 既に同じステータスの場合は何もしない

	const mutation = `
		mutation UpdateStatus($state: StatusState!, $workId: ID!) {
			updateStatus (
				input : { state: $state, workId: $workId }
			) { clientMutationId }
		}
	`;
	const variables = {
		state: status,
		workId: animeData.id,
	};

	const result = await fetchDataFromAnnict(
		JSON.stringify({ query: mutation, variables: variables }),
	);
	if (!result) return;

	const [statusText, svgPathD, svgViewBox] = convertStatusToJapanese(status);
	setStatusAndSvg({ svgPathD: svgPathD, svgViewBox: svgViewBox, statusText: statusText });
	updateViewerStatus(status); // アニメデータのステータスを更新
}

/******************************************************************************/

export default function StatusDropMenu(webSite: string) {
	// メニューを作成するためのsignal
	const statusArray = [
		{ state: "NO_STATE", icon: noState, label: "未選択" },
		{ state: "WANNA_WATCH", icon: wannaWatch, label: "見たい" },
		{ state: "WATCHING", icon: watching, label: "見てる" },
		{ state: "WATCHED", icon: watched, label: "見た" },
		{ state: "ON_HOLD", icon: stopWatching, label: "一時中断" },
		{ state: "STOP_WATCHING", icon: hold, label: "視聴中止" },
	];
	const [show, setShow] = createSignal(false); // ドロップメニューの表示・非表示の状態

	// 遅延して取得したステータスを反映
	createEffect(() => {
		const currentStatus = animeData.viewerStatusState;
		const [statusText, svgPathD, svgViewBox] = currentStatus
			? convertStatusToJapanese(currentStatus)
			: convertStatusToJapanese("NO_STATE");

		setStatusAndSvg({ svgPathD: svgPathD, svgViewBox: svgViewBox, statusText: statusText });
	});

	// ドロップメニュー以外をクリックした時に、ドロップメニューを非表示
	function handleClickOutside(e: MouseEvent) {
		const buttonElement = document.querySelector("dr-drop-menu");
		if (buttonElement && !buttonElement.contains(e.target as Node)) {
			setShow(false);
		}
	}

	// windowにクリックイベントを追加し、ドロップメニューを非表示にする
	createEffect(() => {
		if (show()) {
			window.addEventListener("click", handleClickOutside);
		} else {
			window.removeEventListener("click", handleClickOutside);
		}

		onCleanup(() => {
			window.removeEventListener("click", handleClickOutside);
		});
	});

	return (
		<Switch>
			<Match when={webSite === "abema"}>
				<AbemaStatusDropMenu
					show={show}
					setShow={setShow}
					statusArray={statusArray}
					updateStatus={updateStatus}
					statusAndSvg={statusAndSvg}
				/>
			</Match>

			<Match when={webSite === "danime"}>
				<DanimeStatusDropMenu
					show={show}
					setShow={setShow}
					statusArray={statusArray}
					updateStatus={updateStatus}
					statusAndSvg={statusAndSvg}
				/>
			</Match>
		</Switch>
	);
}

/******************************************************************************/
