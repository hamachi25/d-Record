import { Accessor } from "solid-js";
import { query, queryWithAnnictId } from "../../api/query";
import { fetchDataFromAnnict } from "../../api/fetch";

type Status = ["idle" | "loading" | "fetched" | "error", string];

type Work = {
	annictId: number;
	title: string;
	media: string;
	seasonYear: number;
	image: {
		facebookOgImageUrl: string;
	};
};

type WebsitePageMappings = {
	danime: {
		[key: string]: number; // key: dアニメストアWorkId, value: annictId
	};
};

function LoadingSkeleton() {
	return (
		<div class="card bg-base-100 w-full rounded-lg flex flex-row p-2 min-h-24 border border-gray-200">
			<figure class="flex-[2] mr-2">
				<div class="skeleton w-[102px] h-[53px] rounded"></div>
			</figure>
			<div class="card-body flex-[3] p-0 justify-center">
				<h2 class="skeleton card-title text-sm overflow-y-auto w-36 h-4"></h2>
				<div class="card-actions justify-end">
					<div class="skeleton badge w-8"></div>
					<div class="skeleton badge w-8"></div>
				</div>
			</div>
		</div>
	);
}

function ErrorMessage(props: { message: string }) {
	return (
		<div class="flex items-center w-full h-full border rounded-lg">
			<p class="text-sm p-1">{props.message}</p>
		</div>
	);
}

export function AnnictSearch(props: { activeTabUrl: Accessor<string> }) {
	const [status, setStatus] = createSignal<Status>(["idle", ""]);
	const [data, setData] = createStore<Work[]>([]);
	const [selectedIndex, setSelectedIndex] = createSignal<number | undefined>(undefined);

	async function handleClick(index: number) {
		const websitePageMappings: WebsitePageMappings | null = await storage.getItem(
			"local:websitePageMappings",
		);

		/**
		 * ストレージからデータを削除
		 */
		function deleteWebsitePageMappings() {
			setSelectedIndex(undefined);

			if (websitePageMappings) {
				delete websitePageMappings.danime[props.activeTabUrl()];
				storage.setItem("local:websitePageMappings", websitePageMappings);
			}
		}

		/**
		 * ストレージにデータを保存
		 */
		function saveWebsitePageMappings() {
			setSelectedIndex(index);
			storage.setItem("local:websitePageMappings", {
				danime: {
					...websitePageMappings?.danime,
					[props.activeTabUrl()]: data[index].annictId,
				},
			});
		}

		if (selectedIndex() === index) {
			deleteWebsitePageMappings();
		} else {
			saveWebsitePageMappings();
		}
	}

	let textInput!: HTMLInputElement;
	function updateSearchTitle() {
		setStatus(["loading", ""]);
		setSelectedIndex(undefined);

		return textInput.value.trim();
	}

	async function getAnnictIdFromStorage() {
		const websitePageMappings: WebsitePageMappings | null = await storage.getItem(
			"local:websitePageMappings",
		);
		if (!websitePageMappings) return;

		const annictId = websitePageMappings.danime[props.activeTabUrl()];
		return annictId;
	}

	async function fetchAnnict() {
		if (props.activeTabUrl() === "") return; // URLがdアニメストアでない場合

		const searchTitle = updateSearchTitle();
		if (!searchTitle || searchTitle === "") {
			setStatus(["idle", ""]);
			return;
		}

		const variables = { titles: searchTitle };

		const response = await fetchDataFromAnnict(
			JSON.stringify({ query: query, variables: variables }),
		);

		if (response === "token") {
			setStatus([
				"error",
				"Annictのトークンが設定されていません。設定タブからトークンを設定してください。",
			]);
			return;
		}
		if (!response) {
			setStatus([
				"error",
				"Annictのサーバーエラーにより失敗しました。再度検索してください。",
			]);
			return;
		}

		const json = await response.json();
		const allWorks: Work[] = json.data.searchWorks.nodes;
		if (allWorks.length === 0) {
			setStatus(["error", "該当するアニメがありません。"]);
			return;
		}

		setStatus(["fetched", ""]);
		setData(allWorks);

		// 紐づけ済みの作品がある場合、その作品を選択
		const annictId = await getAnnictIdFromStorage();
		if (!annictId) return;

		const index = allWorks.findIndex((work) => work.annictId === annictId);
		if (index) setSelectedIndex(index);
	}

	// 紐づけ済みの作品の場合、その作品を取得
	onMount(async () => {
		const annictId = await getAnnictIdFromStorage();
		if (!annictId) return;

		const variables = { annictIds: annictId };

		const response = await fetchDataFromAnnict(
			JSON.stringify({ query: queryWithAnnictId, variables: variables }),
		);

		if (response === "token") {
			setStatus([
				"error",
				"Annictのトークンが設定されていません。設定タブからトークンを設定してください。",
			]);
			return;
		}
		if (!response) {
			setStatus([
				"error",
				"Annictのサーバーエラーにより失敗しました。再度検索してください。",
			]);
			return;
		}

		const json = await response.json();
		const allWorks = json.data.searchWorks.nodes;

		setStatus(["fetched", ""]);
		setData(allWorks);
		setSelectedIndex(0);
	});

	return (
		<>
			<div class="flex justify-between">
				<label class="input input-bordered flex items-center gap-2">
					<input
						type="text"
						class="grow max-w-40"
						placeholder="Annictで検索"
						ref={textInput}
						onKeyDown={(e) => e.key === "Enter" && fetchAnnict()}
						autofocus
						disabled={props.activeTabUrl() === ""}
					/>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="h-4 w-4 opacity-70"
					>
						<path
							fill-rule="evenodd"
							d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
							clip-rule="evenodd"
						/>
					</svg>
				</label>
				<button
					class="btn"
					classList={{ "btn-disabled": props.activeTabUrl() === "" }}
					onClick={fetchAnnict}
				>
					検索
				</button>
			</div>
			<div
				class="w-full h-56 mt-2 overflow-y-scroll [&>.card]:mb-2"
				style={{ "scrollbar-width": "thin" }}
			>
				<Switch
					fallback={<div class="flex items-center w-full h-full border rounded-lg"></div>}
				>
					<Match when={status()[0] === "fetched"}>
						<For each={data}>
							{(item, index) => (
								<div
									class="card bg-base-100 w-full rounded-lg flex flex-row p-2 min-h-24 border border-gray-200
                                        transition-colors cursor-pointer hover:bg-gray-200 active:bg-gray-300
                                        [&.check]:border-2 [&.check]:border-gray-500 [&.check]:bg-orange-400 [&.check]:hover:bg-orange-500 [&.check]:active:bg-orange-600
                                        dark:border-gray-600 dark:hover:bg-gray-600 dark:active:bg-gray-500 dark:[&.check]:border-gray-400
                                        dark:[&.check]:bg-orange-700 dark:[&.check]:hover:bg-orange-600 dark:[&.check]:active:bg-orange-500"
									classList={{ check: selectedIndex() === index() }}
									onClick={() => handleClick(index())}
								>
									<figure class="relative flex-[2] mr-2">
										<Show
											when={
												item.image?.facebookOgImageUrl &&
												item.image.facebookOgImageUrl.startsWith("http")
											}
											fallback={
												<>
													<div class="w-[102px] h-[53px] bg-gray-300 rounded"></div>
													<div class="absolute flex items-center">
														<svg
															class="w-8 h-8 text-gray-500"
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 24 24"
															fill="currentColor"
														>
															<path
																d="M5 11.1005L7 9.1005L12.5 14.6005L16 11.1005L19 14.1005V5H5V11.1005ZM4 3H20C20.5523 3 21 3.44772 
                                                                21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM15.5 10C14.6716 
                                                                10 14 9.32843 14 8.5C14 7.67157 14.6716 7 15.5 7C16.3284 7 17 7.67157 17 8.5C17 9.32843 16.3284 10 15.5 10Z"
															></path>
														</svg>
													</div>
												</>
											}
										>
											<div class="w-[102px] h-[53px] bg-gray-300 rounded"></div>
											<img
												src={item.image.facebookOgImageUrl}
												class="rounded absolute"
											/>
										</Show>
									</figure>
									<div class="card-body flex-[3] p-0 justify-center">
										<h2
											class="card-title text-sm h-10 overflow-y-auto dark:text-gray-100"
											style={{
												display: "-webkit-box",
												"scrollbar-width": "thin",
											}}
										>
											{item.title}
										</h2>
										<div class="card-actions justify-end">
											<div
												class="badge"
												classList={{
													"badge-neutral": item.media === "TV",
													"badge-primary": item.media === "MOVIE",
													"badge-secondary": item.media === "OVA",
													"badge-accent": item.media === "WEB",
												}}
											>
												{item.media}
											</div>
											<Show when={item.seasonYear}>
												<div class="badge badge-outline">
													{item.seasonYear}
												</div>
											</Show>
										</div>
									</div>
								</div>
							)}
						</For>
					</Match>

					<Match when={props.activeTabUrl() === ""}>
						<div class="flex items-center w-full h-full border rounded-lg">
							<p class="text-sm p-2">
								このページには対応していません。dアニメストアの作品ページで使用できます。
							</p>
						</div>
					</Match>

					<Match when={status()[0] === "loading"}>
						<LoadingSkeleton />
					</Match>

					<Match when={status()[0] === "error"}>
						<ErrorMessage message={status()[1]} />
					</Match>
				</Switch>
			</div>
		</>
	);
}
