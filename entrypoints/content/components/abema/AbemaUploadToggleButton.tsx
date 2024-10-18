import { animeData, loading, websiteInfo } from "../../anime-data-scraper";

export function AbemaUploadToggleButton(props: {
	updateIcon: () => string;
	changeUploadToggle: (workId: string | null) => Promise<void>;
	addEpisode: (episode: {
		normalized: string | number | undefined;
		raw: string | number | undefined;
	}) => string;
}) {
	return (
		<div
			class="group font-abema relative flex items-center justify-center h-[44px] w-[44px] cursor-pointer hover:bg-[rgba(0,0,0,.1)]"
			onClick={() => props.changeUploadToggle(websiteInfo.workId)}
		>
			<Show
				when={loading.icon === "loading"}
				fallback={<img src={props.updateIcon()} width={28} height={28} />}
			>
				<span class="loading loading-spinner loading-md text-white"></span>
			</Show>
			<div
				class="absolute bottom-[46px] -translate-x-1/2 left-1/2 opacity-0 pointer-events-none
				transition-opacity duration-300 z-10 group-hover:opacity-100"
			>
				<span
					class="relative inline-block bg-[#212121] text-[14px] text-white whitespace-nowrap px-[8px] py-[4px] border border-[#333] rounded-[4px]
					before:block before:absolute before:border-[7px] before:border-transparent before:border-t-[#333]
					before:bottom-0 before:h-0 before:w-0 before:left-0 before:right-0 before:mx-auto before:translate-y-full
					after:block after:absolute after:border-[7px] after:border-transparent after:border-t-[#212121]
					after:bottom-[2px] after:h-0 after:w-0 after:left-0 after:right-0 after:mx-auto after:translate-y-full"
				>
					{loading.message
						? loading.message
						: animeData.title + props.addEpisode(animeData.currentEpisode)}
				</span>
			</div>
		</div>
	);
}
