import { Accessor, Setter } from "solid-js";
import { animeData, loading } from "../../core/anime-data-scraper";

export function DanimeStatusDropMenu(props: {
	show: Accessor<boolean>;
	setShow: Setter<boolean>;
	statusArray: { state: string; icon: string[]; label: string }[];
	updateStatus: (status: string) => Promise<void>;
	statusAndSvg: Accessor<{ svgPathD: string; svgViewBox: string; statusText: string }>;
}) {
	function openDropMenu() {
		if (loading.status === "success") {
			props.setShow((prev) => !prev);
		}
	}

	function closeDropMenu() {
		if (props.show() && loading.status === "success") {
			props.setShow(false);
		}
	}

	return (
		<div class="font-danime relative w-full min-[960px]:w-[133px] h-[50px] min-[960px]:h-[44px] mr-[5px]">
			<button
				class="peer flex relative w-full h-full justify-center items-center bg-[#f75f76] hover:bg-[#ff8799]
                select-none z-50 transition-transform duration-200 shadow-sm border-0 cursor-pointer active:scale-95"
				onClick={openDropMenu}
			>
				<Switch>
					{/* ローディング */}
					<Match when={loading.status === "loading"}>
						<span class="loading loading-spinner text-black w-[2rem] mr-[4px]"></span>
						<span class="ml-[4px] text-[1.4rem] text-black font-bold">読み込み中</span>
					</Match>

					{/* 取得成功 */}
					<Match when={loading.status === "success"}>
						<svg
							class="w-[16px] h-[16px]"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="20 0 448 512"
							style="width: 14px; height: 14px;"
						>
							<path d={props.statusAndSvg().svgPathD}></path>
						</svg>
						<span class="ml-[8px] text-[1.4rem] text-black font-bold">
							{props.statusAndSvg().statusText}
						</span>
					</Match>

					{/* 取得失敗 */}
					<Match when={loading.status === "error"}>
						<span class="ml-[4px] text-[1.4rem] text-black font-bold">取得失敗</span>
					</Match>
				</Switch>
			</button>
			<span
				class="absolute opacity-0 peer-hover:opacity-100 -top-[26px] z-50 bg-white whitespace-nowrap w-auto h-auto p-[2px_5px] rounded-[2px]
                left-0 text-[12px] text-[#606060] shadow-md cursor-default transition duration-200 select-none"
			>
				{animeData.title ? animeData.title : loading.message}
			</span>
			<ul
				class="absolute block w-full box-border top-[52px] min-[960px]:top-[46px] z-10 py-[5px] m-0 text-[1rem] text-[#212529] text-left
                    list-none bg-white border border-solid border-[rgba(0,_0,_0,_0.15)] rounded-[2px]
                    transition-[transform,opacity,visibility] duration-[150ms,100ms,100ms] ease-[cubic-bezier(0,0,0.2,1)]
                    -translate-y-[20px] [&.show]:translate-y-0 opacity-0 [&.show]:opacity-100 invisible [&.show]:visible
                    [&>li]:block [&>li]:w-full [&>li]:text-[#212529] [&>li]:text-[16px] [&>li]:font-normal [&>li]:whitespace-nowrap [&>li]:p-[5px_15px]
                    [&>li]:bg-transparent [&>li]:border-0 [&>li]:cursor-pointer [&>li]:select-none [&>li]:text-center"
				classList={{ show: props.show() }}
			>
				<Index each={props.statusArray}>
					{(status) => (
						<li class="hover:bg-[#e1e3e6]">
							<button
								class="flex items-center"
								onClick={() => {
									props.updateStatus(status().state);
									closeDropMenu();
								}}
							>
								<svg
									class="w-[16px] h-[16px] mr-[20px] min-[960px]:mr-[13px]"
									xmlns="http://www.w3.org/2000/svg"
									viewBox={status().icon[1]}
								>
									<path d={status().icon[0]}></path>
								</svg>
								<span class="translate-y-[6%]">{status().label}</span>
							</button>
						</li>
					)}
				</Index>
				<li class="py-[9px]">
					<a
						href={`https://annict.com/works/${animeData.annictId}`}
						target="_blank"
						rel="noopener noreferrer"
						class="text-[15px] font-bold leading-none text-center underline underline-offset-2 hover:decoration-2"
						title={animeData.title}
						onClick={closeDropMenu}
					>
						Annictを開く
					</a>
				</li>
			</ul>
		</div>
	);
}
