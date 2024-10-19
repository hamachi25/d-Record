import "./App.css";
import { Settings } from "./type";
import { SendTimingOptions } from "./components/SendTimingOptions";
import { SelectWebsite } from "./components/SelectWebsite";
import { TokenInput } from "./components/TokenInput";
import { UIAndOtherOptions } from "./components/UIAndOtherOptions";

// 初期値
const defaultSettings: Settings = {
	Token: "",
	sendTiming: "after-end",
	nextEpisodeLine: false,
	recordButton: false,
	animeTitle: false,
	autoChangeStatus: true,
	applyWebsite: {
		danime: true,
		abema: true,
	},
};

function App() {
	const [settings, setSettings] = createSignal<Settings>(defaultSettings);

	onMount(async () => {
		const data = await browser.storage.local.get([
			"Token",
			"sendTiming",
			"nextEpisodeLine",
			"recordButton",
			"animeTitle",
			"autoChangeStatus",
			"applyWebsite",
		]);
		setSettings(data);
	});

	return (
		<div
			class="w-[340px] px-4 [&_h2]:mb-3
			[&:not(:last-child)]:[&>div]:border-b-2 [&>div]:border-b-[#d5d6d8] dark:[&>div]:border-b-[gray]"
		>
			<TokenInput />
			<SelectWebsite settings={settings} />
			<SendTimingOptions sendTiming={settings().sendTiming} />
			<UIAndOtherOptions
				title="UIの変更"
				options={[
					{ value: "nextEpisodeLine", label: "次エピソードの枠線を非表示" },
					{ value: "recordButton", label: "記録ボタンを非表示" },
					{ value: "animeTitle", label: "アニメタイトルを非表示" },
				]}
				settings={{
					nextEpisodeLine: settings().nextEpisodeLine ?? defaultSettings.nextEpisodeLine,
					recordButton: settings().recordButton ?? defaultSettings.recordButton,
					animeTitle: settings().animeTitle ?? defaultSettings.animeTitle,
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
					autoChangeStatus:
						settings().autoChangeStatus ?? defaultSettings.autoChangeStatus,
				}}
			/>
		</div>
	);
}

export default App;
