import { Accessor } from "solid-js";
import { animeData, loading, websiteInfo } from "../../core/anime-data-scraper";

export function DanimeUploadToggleButton(props: {
	updateIcon: () => string;
	shadow: Accessor<boolean>;
	changeUploadToggle: (workId: string | null) => Promise<void>;
	addEpisode: (episode: {
		normalized: string | number | undefined;
		raw: string | number | undefined;
	}) => string;
}) {
	return (
		<div
			class="group font-danime relative flex w-[44px] justify-center items-center cursor-pointer"
			onClick={() => props.changeUploadToggle(websiteInfo.workId)}
		>
			<Show
				when={loading.icon === "loading"}
				fallback={
					<img
						class="opacity-60 group-hover:opacity-100 [&.not-upload-icon]:opacity-30 [&.drop-shadow]:drop-shadow-[0_0_9px_#fff]"
						src={props.updateIcon()}
						width={28}
						height={28}
						classList={{
							"drop-shadow": props.shadow(),
							"not-upload-icon":
								loading.icon === "immutableNotUpload" ||
								loading.icon === "completeUpload",
						}}
					/>
				}
			>
				<span class="loading loading-spinner loading-md text-white opacity-60"></span>
			</Show>

			<div
				class="absolute top-0 -right-[8px] pointer-events-none translate-y-[10px] opacity-0 z-[90] box-border
                    transition-[transform,opacity] duration-[200ms] ease-[cubic-bezier(0,0,0.2,1)]
                    group-hover:translate-y-0 group-hover:opacity-100"
			>
				<div
					class="relative -translate-y-full p-0 bg-[#000000CC] rounded-[4px] bottom-[22px] shadow-[0_0_6px_4px_#40404059]
                        after:absolute after:block after:z-[90] after:-bottom-[7px] after:-ml-[6px] after:w-0 after:h-0 after:border-solid after:border-t-[7px]
                        after:border-x-[6px] after:border-b-0 after:border-t-[rgba(0,0,0,0.8)] after:border-x-transparent after:right-[24px]"
				>
					<span class="inline-block text-[#a0a09f] text-[12px] font-bold whitespace-nowrap p-[0.5em_0.7em]">
						{loading.message
							? loading.message
							: animeData.title + props.addEpisode(animeData.currentEpisode)}
					</span>
				</div>
			</div>
		</div>
	);
}
