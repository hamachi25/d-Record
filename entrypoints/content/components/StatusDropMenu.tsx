import "~/assets/StatusDropMenu.css";
import { animeDataSignal, loading } from "../anime-data-scraper";
import { fetchData } from "../fetch";
import { convertStatusToJapanese, statusText, svgPaths, svgPathD } from "../utils";

const [statusAndSvg, setStatusAndSvg] = createSignal({
	svgPathD: svgPathD,
	statusText: statusText,
});
export { setStatusAndSvg };

// annictのドロップメニューを追加
export function StatusDropMenu() {
	const [statusArray] = createSignal([
		["NO_STATE", svgPaths[0], "未選択"],
		["WANNA_WATCH", svgPaths[1], "見たい"],
		["WATCHING", svgPaths[2], "見てる"],
		["WATCHED", svgPaths[3], "見た"],
		["ON_HOLD", svgPaths[4], "一時中断"],
		["STOP_WATCHING", svgPaths[5], "視聴中止"],
	]);
	const [show, setShow] = createSignal(false);

	createEffect(() => {
		const currentStatus = animeDataSignal()?.viewerStatusState;
		if (currentStatus) {
			convertStatusToJapanese(currentStatus);
		} else {
			convertStatusToJapanese("NO_STATE");
		}

		setStatusAndSvg({ svgPathD: svgPathD, statusText: statusText });
	});

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

	let annictButtonElement: HTMLDivElement | undefined;
	function handleClickOutside(e: MouseEvent) {
		if (annictButtonElement && !annictButtonElement.contains(e.target as Node)) setShow(false);
	}

	async function updateStatus(status: string) {
		const mutation = `
		    mutation UpdateStatus($state: StatusState!, $workId: ID!) {
		        updateStatus (
		            input : { state: $state, workId: $workId }
		        ) { clientMutationId }
		    }
		`;
		const variables = {
			state: status,
			workId: animeDataSignal()?.id,
		};

		await fetchData(JSON.stringify({ query: mutation, variables: variables }));

		convertStatusToJapanese(status);
		setStatusAndSvg({ svgPathD: svgPathD, statusText: statusText });
	}

	return (
		<>
			<Switch>
				<Match when={loading().status === "loading"}>
					<div id="annict-button">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="20"
							height="20"
							fill="#000"
						>
							<circle cx="12" cy="2" r="2" opacity=".1">
								<animate
									attributeName="opacity"
									from="1"
									to=".1"
									dur="1s"
									repeatCount="indefinite"
									begin="0"
								/>
							</circle>
							<circle transform="rotate(45 12 12)" cx="12" cy="2" r="2" opacity=".1">
								<animate
									attributeName="opacity"
									from="1"
									to=".1"
									dur="1s"
									repeatCount="indefinite"
									begin=".125s"
								/>
							</circle>
							<circle transform="rotate(90 12 12)" cx="12" cy="2" r="2" opacity=".1">
								<animate
									attributeName="opacity"
									from="1"
									to=".1"
									dur="1s"
									repeatCount="indefinite"
									begin=".25s"
								/>
							</circle>
							<circle transform="rotate(135 12 12)" cx="12" cy="2" r="2" opacity=".1">
								<animate
									attributeName="opacity"
									from="1"
									to=".1"
									dur="1s"
									repeatCount="indefinite"
									begin=".375s"
								/>
							</circle>
							<circle transform="rotate(180 12 12)" cx="12" cy="2" r="2" opacity=".1">
								<animate
									attributeName="opacity"
									from="1"
									to=".1"
									dur="1s"
									repeatCount="indefinite"
									begin=".5s"
								/>
							</circle>
							<circle transform="rotate(225 12 12)" cx="12" cy="2" r="2" opacity=".1">
								<animate
									attributeName="opacity"
									from="1"
									to=".1"
									dur="1s"
									repeatCount="indefinite"
									begin=".625s"
								/>
							</circle>
							<circle transform="rotate(270 12 12)" cx="12" cy="2" r="2" opacity=".1">
								<animate
									attributeName="opacity"
									from="1"
									to=".1"
									dur="1s"
									repeatCount="indefinite"
									begin=".75s"
								/>
							</circle>
							<circle transform="rotate(315 12 12)" cx="12" cy="2" r="2" opacity=".1">
								<animate
									attributeName="opacity"
									from="1"
									to=".1"
									dur="1s"
									repeatCount="indefinite"
									begin=".875s"
								/>
							</circle>
						</svg>
						<span>読み込み中</span>
					</div>
					<span id="hover-message">{loading().message}</span>
				</Match>
				<Match when={loading().status === "success"}>
					<div
						id="annict-button"
						onClick={() => setShow((prev) => !prev)}
						ref={annictButtonElement}
					>
						<svg
							class="dropdown-svg"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="20 0 448 512"
							style="width: 14px; height: 14px;"
						>
							<path d={statusAndSvg().svgPathD}></path>
						</svg>
						<span>{statusAndSvg().statusText}</span>
					</div>
					<span id="hover-message">{animeDataSignal()?.title}</span>
				</Match>
				<Match when={loading().status === "error"}>
					<div id="annict-button">
						<span>取得失敗</span>
					</div>
					<span id="hover-message">{loading().message}</span>
				</Match>
			</Switch>
			<ul class="dropdown-menu" classList={{ show: show() }}>
				<Index each={statusArray()}>
					{(status) => (
						<li>
							<button class="dropdown-item status-state" onClick={() => updateStatus(status()[0])}>
								<svg class="dropdown-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
									<path d={status()[1]}></path>
								</svg>
								<span>{status()[2]}</span>
							</button>
						</li>
					)}
				</Index>
				<li>
					<a
						href={`https://annict.com/works/${animeDataSignal()?.annictId}`}
						target="_blank"
						rel="noopener noreferrer"
						class="dropdown-item"
						title={animeDataSignal()?.title}
					>
						Annictを開く
					</a>
				</li>
			</ul>
		</>
	);
}
