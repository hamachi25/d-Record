import "./App.css";
import { Settings } from "./type";
import { SendTimingOptions } from "./components/settings/SendTimingOptions";
import { SelectWebsite } from "./components/settings/SelectWebsite";
import { TokenInput } from "./components/settings/TokenInput";
import { UIAndOtherOptions } from "./components/settings/UIAndOtherOptions";
import { AnimeInfoFromWebsite } from "./components/search/AnimeInfoFromWebsite";
import { AnnictSearch } from "./components/search/AnnictSearch";

// 初期値
const defaultSettings: Settings = {
	sendTiming: "after-end",
	nextEpisodeLine: false,
	recordButton: false,
	animeTitle: false,
	autoChangeStatus: true,
	applyWebsite: {
		danime: true,
		abema: true,
	},
	activeTab: undefined,
};

function App() {
	const [settings, setSettings] = createStore<Settings>(defaultSettings);
	const [activeTabUrl, setActiveTabUrl] = createSignal<string>(""); // 開いてるウェブサイトのworkId

	const updateActiveTab = (tabIndex: number) => {
		setSettings({ ...settings, activeTab: tabIndex });
		storage.setItem("local:activeTab", tabIndex);
	};

	onMount(async () => {
		const data = await browser.storage.local.get([
			"sendTiming",
			"nextEpisodeLine",
			"recordButton",
			"animeTitle",
			"autoChangeStatus",
			"applyWebsite",
			"activeTab",
		]);
		const newSettings = { ...settings, ...data }; // 初期値を上書き
		setSettings(newSettings);
	});

	return (
		<div class="w-[340px] px-4">
			<div role="tablist" class="relative tabs tabs-boxed mt-3 [&>a]:font-bold [&>a]:gap-1">
				<Show when={settings.activeTab}>
					<div class="absolute w-full h-full p-1">
						<div
							class="h-full w-1/2 top-0 bottom-0 my-auto transition-transform ease-in-out"
							classList={{
								"translate-x-0": settings.activeTab === 1,
								"translate-x-full": settings.activeTab === 2,
							}}
						>
							<div class="bg-primary rounded-lg w-full h-full"></div>
						</div>
					</div>
				</Show>
				<a
					role="tab"
					class="tab [&.active]:text-gray-200 transition-colors"
					classList={{ active: settings.activeTab === 1 }}
					onClick={() => updateActiveTab(1)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="w-4 h-4"
					>
						<path
							d="M12 1L21.5 6.5V17.5L12 23L2.5 17.5V6.5L12 1ZM12 3.311L4.5 7.65311V16.3469L12 
                        20.689L19.5 16.3469V7.65311L12 3.311ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 
                        8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16ZM12 14C13.1046 14 14 13.1046 
                        14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
						></path>
					</svg>
					設定
				</a>
				<a
					role="tab"
					class="tab [&.active]:text-gray-200 transition-colors"
					classList={{ active: settings.activeTab === 2 }}
					onClick={() => updateActiveTab(2)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="w-4 h-4"
					>
						<path
							d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 
                        13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 
                        13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 
                        7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 
                        17.2475 15.8748 16.0247L16.0247 15.8748Z"
						></path>
					</svg>
					検索
				</a>
			</div>

			<Switch>
				<Match when={settings.activeTab === 1}>
					<div
						class="overflow-y-scroll my-4 h-[32rem] [&_h2]:mb-3 [&:not(:last-child)]:[&>div]:border-b-2 [&>div]:border-b-[#d5d6d8] dark:[&>div]:border-b-[gray]"
						style={{ "scrollbar-width": "thin" }}
					>
						<TokenInput />
						<SelectWebsite applyWebsite={settings.applyWebsite} />
						<SendTimingOptions sendTiming={settings.sendTiming} />
						<UIAndOtherOptions
							title="UIの変更"
							options={[
								{ value: "nextEpisodeLine", label: "次エピソードの枠線を非表示" },
								{ value: "recordButton", label: "記録ボタンを非表示" },
								{ value: "animeTitle", label: "アニメタイトルを非表示" },
							]}
							settings={{
								nextEpisodeLine: settings.nextEpisodeLine,
								recordButton: settings.recordButton,
								animeTitle: settings.animeTitle,
							}}
						/>
						<UIAndOtherOptions
							title="その他"
							options={[
								{
									value: "autoChangeStatus",
									label: "最終話にステータスを「見た」に自動変更",
								},
							]}
							settings={{
								autoChangeStatus: settings.autoChangeStatus,
							}}
						/>
					</div>
				</Match>

				<Match when={settings.activeTab === 2}>
					<div class="px-2 pt-4 pb-2">
						<h2 class="font-semibold text-lg mb-2">作品を検索</h2>
						<p class="mb-2 text-[15px]">
							作品が取得できない・間違った作品が取得されている場合に、作品を紐づけます。
						</p>
						<AnimeInfoFromWebsite setActiveTabUrl={setActiveTabUrl} />
						<div class="flex justify-center my-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="w-8 h-8 fill-gray-600"
							>
								<path
									d="M11.9498 7.94975L10.5356 9.36396L8.00079 6.828L8.00004 
                                    20H6.00004L6.00079 6.828L3.46451 9.36396L2.05029 7.94975L7.00004 
                                    3L11.9498 7.94975ZM21.9498 16.0503L17 21L12.0503 16.0503L13.4645 
                                    14.636L16.0008 17.172L16 4H18L18.0008 17.172L20.5356 14.636L21.9498 16.0503Z"
								></path>
							</svg>
						</div>
						<AnnictSearch activeTabUrl={activeTabUrl} />
					</div>
				</Match>
			</Switch>
		</div>
	);
}

export default App;
