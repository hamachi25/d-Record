/* 作品ページのドロップメニュー */

import { AbemaStatusDropMenu } from "./abema/AbemaStatusDropMenu";
import { DanimeStatusDropMenu } from "./danime/DanimeStatusDropMenu";
import { animeData } from "../anime-data-scraper";
import { fetchDataFromAnnict } from "../fetch";
import { convertStatusToJapanese, svgPaths, updateViewerStatus } from "../utils";

const [statusAndSvg, setStatusAndSvg] = createSignal({
	svgPathD: svgPaths.noState[0],
	svgViewBox: svgPaths.noState[1],
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
	const [statusArray] = createSignal([
		{ state: "NO_STATE", icon: svgPaths.noState, label: "未選択" },
		{ state: "WANNA_WATCH", icon: svgPaths.wannaWatch, label: "見たい" },
		{ state: "WATCHING", icon: svgPaths.watching, label: "見てる" },
		{ state: "WATCHED", icon: svgPaths.watched, label: "見た" },
		{ state: "ON_HOLD", icon: svgPaths.stopWatching, label: "一時中断" },
		{ state: "STOP_WATCHING", icon: svgPaths.hold, label: "視聴中止" },
	]);
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
	const [annictButtonElement, setAnnictButtonElement] = createSignal<HTMLButtonElement>();
	function handleClickOutside(e: MouseEvent) {
		if (annictButtonElement() && !annictButtonElement()!.contains(e.target as Node))
			setShow(false);
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
					setAnnictButtonElement={setAnnictButtonElement}
				/>
			</Match>

			<Match when={webSite === "danime"}>
				<DanimeStatusDropMenu
					show={show}
					setShow={setShow}
					statusArray={statusArray}
					updateStatus={updateStatus}
					statusAndSvg={statusAndSvg}
					setAnnictButtonElement={setAnnictButtonElement}
				/>
			</Match>
		</Switch>
	);
}

/******************************************************************************/
