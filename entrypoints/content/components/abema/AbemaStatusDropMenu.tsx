import styleText from "./assets/abema.css?inline";
import { Accessor, Setter } from "solid-js";
import { animeData, loading } from "../../anime-data-scraper";

export function AbemaStatusDropMenu(props: {
	show: Accessor<boolean>;
	setShow: Setter<boolean>;
	statusArray: Accessor<{ state: string; icon: string[]; label: string }[]>;
	updateStatus: (status: string) => Promise<void>;
	statusAndSvg: Accessor<{ svgPathD: string; svgViewBox: string; statusText: string }>;
	setAnnictButtonElement: Setter<HTMLButtonElement | undefined>;
}) {
	function openDropMenu() {
		if (animeData.id) {
			props.setShow((prev) => !prev);
		}
	}

	// スタイルをheaderに追加
	const style = document.createElement("style");
	style.textContent = styleText;
	document.head.append(style);

	return (
		<div class="font-abema relative flex flex-col w-[80px] items-center">
			<button
				class="peer relative flex h-[44px] w-[44px] rounded-full items-center justify-center bg-[#f85b73] 
					cursor-pointer mb-[4px] transition-transform duration-100 ease-linear hover:scale-110 hover:bg-[#f7687d]"
				onClick={openDropMenu}
				ref={props.setAnnictButtonElement}
			>
				<Switch
					fallback={
						<span
							class="absolute -translate-x-1/2 -translate-y-1/2 
							top-1/2 left-1/2 h-[17px] w-[17px]"
						>
							<svg
								class="w-full h-full fill-white"
								xmlns="http://www.w3.org/2000/svg"
								viewBox={props.statusAndSvg().svgViewBox}
							>
								<path d={props.statusAndSvg().svgPathD}></path>
							</svg>
						</span>
					}
				>
					<Match when={loading.status === "loading"}>
						<span class="loading loading-spinner loading-md text-white"></span>
					</Match>

					{/* アップロードボタンのsetLoading()が影響するので、データがあるかどうかも確認 */}
					<Match when={loading.status === "error" && !animeData.id}>
						<span
							class="absolute -translate-x-1/2 -translate-y-1/2 
							top-1/2 left-1/2 h-[30px] w-[30px]"
						>
							<svg
								class="w-full h-full fill-white"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 
										13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"
								></path>
							</svg>
						</span>
					</Match>
				</Switch>
			</button>
			<span
				class="opacity-0 invisible absolute bottom-[calc(105%+11px)] left-[calc(50%-22px)] pointer-events-none
				transition-opacity duration-200 z-10 peer-hover:visible peer-hover:opacity-100"
			>
				<span
					class="inline-block bg-[#212121] text-white text-sm whitespace-nowrap py-[4px] px-[8px] border divide-solid border-[#ffffff1f] rounded-[4px]
						before:block before:absolute before:border-[7px] before:border-transparent before:border-t-[#333]
						before:bottom-0 before:h-0 before:w-0 before:left-[14px] before:translate-y-full 
						after:block after:absolute after:border-[7px] after:border-transparent after:border-t-[#212121]
						after:bottom-[2px] after:h-0 after:w-0 after:left-[14px] after:translate-y-full"
				>
					{animeData.title ? animeData.title : loading.message}
				</span>
			</span>
			<div class="text-[10px] font-bold text-[#e6e6e6] text-center">Annict</div>
			<ul
				class="opacity-0 invisible absolute block w-[150px] bottom-[calc(4px+100%)] p-[8px] bg-[#212121]
					text-left list-none  border divide-solid border-[hsla(0,0%,100%,.12)] rounded z-20 translate-y-[10px] transition-all
					[&.show]:opacity-100 [&.show]:visible [&.show]:translate-y-0"
				classList={{ show: props.show() }}
			>
				<Index each={props.statusArray()}>
					{(status) => (
						<li>
							<button
								class="flex items-center w-full py-[8px] px-[15px] cursor-pointer
									rounded hover:bg-[#ffffff30]"
								onClick={() => props.updateStatus(status().state)}
							>
								<svg
									class="h-[17px] w-[17px] fill-white mr-[15px]"
									xmlns="http://www.w3.org/2000/svg"
									viewBox={status().icon[1]}
								>
									<path d={status().icon[0]}></path>
								</svg>
								<span class="text-[#e6e6e6] text-base">{status().label}</span>
							</button>
						</li>
					)}
				</Index>
				<li>
					<a
						href={`https://annict.com/works/${animeData.annictId}`}
						target="_blank"
						rel="noopener noreferrer"
						class="block w-full pt-[4px] px-[15px] text-[#e6e6e6] text-[0.95rem] font-bold text-center hover:underline"
						title={animeData.title}
					>
						Annictを開く
					</a>
				</li>
			</ul>
		</div>
	);
}
