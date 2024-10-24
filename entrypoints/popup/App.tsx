import "./App.css";
import { Settings } from "./type";
import { SendTimingOptions } from "./components/SendTimingOptions";
import { SelectWebsite } from "./components/SelectWebsite";
import { TokenInput } from "./components/TokenInput";
import { UIAndOtherOptions } from "./components/UIAndOtherOptions";

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
};

function App() {
	const [settings, setSettings] = createStore<Settings>(defaultSettings);
	console.log(settings.applyWebsite);

	onMount(async () => {
		const data = await browser.storage.local.get([
			"sendTiming",
			"nextEpisodeLine",
			"recordButton",
			"animeTitle",
			"autoChangeStatus",
			"applyWebsite",
		]);
		const newSettings = { ...settings, ...data }; // 初期値を上書き
		setSettings(newSettings);
	});

	return (
		<div class="w-[340px] px-4 [&_h2]:mb-3 [&:not(:last-child)]:[&>div]:border-b-2 [&>div]:border-b-[#d5d6d8] dark:[&>div]:border-b-[gray]">
			<TokenInput />
			<SelectWebsite
				title="使用するウェブサイト"
				options={[
					{ value: "danime", label: "dアニメストア" },
					{ value: "abema", label: "ABEMA" },
				]}
				applyWebsite={settings.applyWebsite}
			/>
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
	);
}

export default App;
