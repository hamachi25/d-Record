import { animeData } from "../anime-data-scraper";
import { fetchData } from "../fetch";
import { convertStatusToJapanese, statusText, svgPaths, svgPathD } from "../utils";

// annictのドロップメニューを追加
export function StatusDropMenu() {
	const currentStatus = animeData.viewerStatusState;
	if (currentStatus) {
		convertStatusToJapanese(currentStatus);
	} else {
		convertStatusToJapanese("NO_STATE");
	}

	const [statusArray] = createSignal([
		["NO_STATE", svgPaths[0], "未選択"],
		["WANNA_WATCH", svgPaths[3], "見たい"],
		["WATCHING", svgPaths[2], "見てる"],
		["WATCHED", svgPaths[1], "見た"],
		["ON_HOLD", svgPaths[4], "一時中断"],
		["STOP_WATCHING", svgPaths[5], "視聴中止"],
	]);
	const [statusAndSvg, setStatusAndSvg] = createSignal({
		svgPathD: svgPathD,
		statusText: statusText,
	});
	const [show, setShow] = createSignal(false);

	function handleClickOutside(event: MouseEvent) {
		const menuElement = document.getElementById("annict-button");
		if (menuElement && !menuElement.contains(event.target as Node)) setShow(false);
	}

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
			workId: animeData.id,
		};

		try {
			await fetchData(JSON.stringify({ query: mutation, variables: variables }));
		} catch {
			throw new Error();
		}

		convertStatusToJapanese(status);
		setStatusAndSvg({ svgPathD: svgPathD, statusText: statusText });
	}

	return (
		<>
			<div id="annict-button" onClick={() => setShow((prev) => !prev)}>
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
			<span id="hover-title">{animeData.title}</span>
			<Show when={show()}>
				<ul class="dropdown-menu">
					<Index each={statusArray()}>
						{(status) => (
							<li>
								<button
									class="dropdown-item status-state"
									data-status-kind={status()[0]}
									onClick={() => updateStatus(status()[0])}
								>
									<svg
										class="dropdown-svg"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 512 512"
									>
										<path d={status()[1]}></path>
									</svg>
									<span>{status()[2]}</span>
								</button>
							</li>
						)}
					</Index>
					<li>
						<a
							href={`https://annict.com/works/${animeData.annictId}`}
							target="_blank"
							rel="noopener noreferrer"
							class="dropdown-item"
							title={animeData.title}
						>
							Annictを開く
						</a>
					</li>
				</ul>
			</Show>
		</>
	);
}
