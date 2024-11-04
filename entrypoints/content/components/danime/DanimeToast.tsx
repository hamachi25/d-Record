import { showToast } from "../../core/anime-data-scraper";

export function DanimeToast() {
	return (
		<div
			class="toast toast-top toast-end z-[300] translate-x-72 transition-transform duration-200"
			classList={{ "!translate-x-0": showToast.state }}
		>
			<div class="alert bg-black border-gray-700 text-gray-200 rounded-md gap-1">
				<Show
					when={showToast.success}
					fallback={
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="w-7 h-7 fill-error"
						>
							<path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
						</svg>
					}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="w-7 h-7 fill-success"
					>
						<path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path>
					</svg>
				</Show>
				<span>{showToast.message}</span>
			</div>
		</div>
	);
}
