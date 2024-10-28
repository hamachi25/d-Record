import { Setter } from "solid-js";
import { fetchDataFromDanime } from "../../api/fetch";

export function AnimeInfoFromWebsite(props: { setActiveTabUrl: Setter<string> }) {
	const [status, setStatus] = createSignal<["loading" | "fetched" | "error", string]>([
		"loading",
		"",
	]);
	const [webSiteInfo, setWebSiteInfo] = createSignal<{
		title: string;
		year: number;
		img: string;
	}>({ title: "", year: 0, img: "" });

	/**
	 * アクティブなタブのURLを取得
	 */
	async function getActiveTabUrl() {
		try {
			const tabs = await browser.tabs.query({ active: true, currentWindow: true });

			if (tabs[0].url) {
				return tabs[0].url;
			}
			return false;
		} catch {
			return false;
		}
	}

	async function fetchFromDanime(name: string) {
		const data = await fetchDataFromDanime(name);
		if (!data) {
			setStatus(["error", "dアニメ"]);
			return;
		}

		const titile = data[0].title;
		const year = data[0].details.production_year;
		const img = data[0].key_visual[0].href;

		setStatus(["fetched", ""]);
		setWebSiteInfo({ title: titile, year: year, img: img });
	}

	onMount(async () => {
		const tabUrl = await getActiveTabUrl();
		if (!tabUrl) {
			setStatus(["error", "タブの取得"]);
			return;
		}

		const url = new URL(tabUrl);

		if (
			url.hostname !== "animestore.docomo.ne.jp" ||
			(url.pathname !== "/animestore/ci_pc" && url.pathname !== "/animestore/sc_d_pc")
		) {
			setStatus(["error", "未対応"]);
			return;
		}

		const params = new URLSearchParams(url.search);
		const partId = params.get("partId");
		let workId = params.get("workId");

		if (partId) {
			workId = partId.substring(0, 5);
		}

		if (!workId || workId === "") return;

		props.setActiveTabUrl(workId);
		fetchFromDanime(workId);
	});

	return (
		<div class="card bg-base-100 w-full shadow-xl rounded-lg flex flex-row p-2 min-h-24 border border-gray-400">
			<Switch>
				<Match when={status()[0] === "loading"}>
					<figure class="flex-[2] mr-2">
						<div class="skeleton w-[102px] h-[53px] rounded"></div>
					</figure>
					<div class="card-body gap-4 flex-[3] p-0 justify-center">
						<h2 class="skeleton card-title text-sm overflow-y-auto w-40 h-4"></h2>
						<div class="card-actions justify-end">
							<div class="skeleton badge w-8"></div>
						</div>
					</div>
				</Match>

				<Match when={status()[0] === "fetched"}>
					<figure class="flex-[2] mr-2">
						<img
							src={webSiteInfo().img}
							class="rounded select-none"
							style={{ "-webkit-user-drag": "none" }}
						/>
					</figure>
					<div class="card-body gap-[0.2rem] flex-[3] p-0 justify-center">
						<h2
							class="card-title text-sm h-10 overflow-y-auto dark:text-gray-100"
							style={{
								display: "-webkit-box",
								"scrollbar-width": "thin",
							}}
						>
							{webSiteInfo().title}
						</h2>
						<div class="card-actions justify-end">
							<div class="badge badge-outline">{webSiteInfo().year}</div>
						</div>
					</div>
				</Match>

				<Match when={status()[0] === "error"}>
					<Switch>
						<Match when={status()[1] === "dアニメ"}>
							<p class="flex items-center text-sm">
								dアニメストアのサーバーエラーです。検索タブを開き直してください。
							</p>
						</Match>
						<Match when={status()[1] === "タブの取得"}>
							<p class="flex items-center text-sm">
								タブの取得に失敗しました。d-Recordの権限の確認をしてください。
							</p>
						</Match>
						<Match when={status()[1] === "未対応"}>
							<div class="flex w-full items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="w-9 h-9"
								>
									<path
										d="M6 8V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V8H20C20.5523 8 21 8.44772 21 
                                            9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V9C3 8.44772 3.44772 8 4 8H6ZM19 
                                            10H5V20H19V10ZM11 15.7324C10.4022 15.3866 10 14.7403 10 14C10 12.8954 10.8954 12 12 12C13.1046 12 
                                            14 12.8954 14 14C14 14.7403 13.5978 15.3866 13 15.7324V18H11V15.7324ZM8 8H16V7C16 4.79086 14.2091 
                                            3 12 3C9.79086 3 8 4.79086 8 7V8Z"
									></path>
								</svg>
							</div>
						</Match>
					</Switch>
				</Match>
			</Switch>
		</div>
	);
}
