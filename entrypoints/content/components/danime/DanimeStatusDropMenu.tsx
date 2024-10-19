import styleText from "./assets/danime.css?inline";
import "~/assets/StatusDropMenu.css";
import { Accessor, Setter } from "solid-js";
import { animeData, loading } from "../../anime-data-scraper";

export function DanimeStatusDropMenu(props: {
	show: Accessor<boolean>;
	setShow: Setter<boolean>;
	statusArray: Accessor<{ state: string; icon: string[]; label: string }[]>;
	updateStatus: (status: string) => Promise<void>;
	statusAndSvg: Accessor<{ svgPathD: string; svgViewBox: string; statusText: string }>;
	setAnnictButtonElement: Setter<HTMLButtonElement | undefined>;
}) {
	function openDropMenu() {
		if (loading.status === "success") {
			props.setShow((prev) => !prev);
		}
	}

	// スタイルをheaderに追加
	const style = document.createElement("style");
	style.textContent = styleText;
	document.head.append(style);

	return (
		<>
			<button id="annict-button" onClick={openDropMenu} ref={props.setAnnictButtonElement}>
				<Switch>
					{/* ローディング */}
					<Match when={loading.status === "loading"}>
						<span class="loading loading-spinner text-black w-[2rem] mr-[4px]"></span>
						<span class="ml-[4px] text-[1.4rem] text-black font-bold">読み込み中</span>
					</Match>

					{/* 取得成功 */}
					<Match when={loading.status === "success"}>
						<svg
							class="dropdown-svg"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="20 0 448 512"
							style="width: 14px; height: 14px;"
						>
							<path d={props.statusAndSvg().svgPathD}></path>
						</svg>
						<span class="ml-[4px] text-[1.4rem] text-black font-bold">
							{props.statusAndSvg().statusText}
						</span>
					</Match>

					{/* 取得失敗 */}
					<Match when={loading.status === "error"}>
						<span class="ml-[4px] text-[1.4rem] text-black font-bold">取得失敗</span>
					</Match>
				</Switch>
			</button>
			<span id="hover-message">{animeData.title ? animeData.title : loading.message}</span>
			<ul class="dropdown-menu" classList={{ show: props.show() }}>
				<Index each={props.statusArray()}>
					{(status) => (
						<li>
							<button
								class="dropdown-item status-state"
								onClick={() => props.updateStatus(status().state)}
							>
								<svg
									class="dropdown-svg"
									xmlns="http://www.w3.org/2000/svg"
									viewBox={status().icon[1]}
								>
									<path d={status().icon[0]}></path>
								</svg>
								<span>{status().label}</span>
							</button>
						</li>
					)}
				</Index>
				<li>
					<a
						href={`https://annict.com/works/${animeData.annictId}`}
						target="_blank"
						rel="noopener noreferrer"
						class="dropdown-item underline underline-offset-2 hover:decoration-2"
						title={animeData.title}
					>
						Annictを開く
					</a>
				</li>
			</ul>
		</>
	);
}
