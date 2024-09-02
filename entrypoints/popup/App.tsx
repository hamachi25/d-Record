import { createSignal, onMount } from "solid-js";
import { TokenInput } from "./components/TokenInput";
import { SendTimingOptions } from "./components/SendTimingOptions";
import { UIAndOtherOptions } from "./components/UIAndOtherOptions";

type Settings = {
	Token?: string;
	sendTiming?: string;
	nextEpisodeLine?: boolean;
	recordButton?: boolean;
	animeTitle?: boolean;
	autoChangeStatus?: boolean;
};

const defaultSettings: Settings = {
	Token: "",
	sendTiming: "after-end",
	nextEpisodeLine: false,
	recordButton: false,
	animeTitle: false,
	autoChangeStatus: true,
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
		]);
		setSettings(data);
	});

	return (
		<>
			<TokenInput token={settings().Token} />
			<SendTimingOptions sendTiming={settings().sendTiming} />
			<UIAndOtherOptions
				title="UIの変更"
				options={[
					{ value: "nextEpisodeLine", label: "作品ページの赤い枠線を非表示" },
					{ value: "recordButton", label: "作品ページの記録ボタンを非表示" },
					{ value: "animeTitle", label: "再生ページ右下のタイトルを非表示" },
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
						label: "最終話視聴後にステータスを「見た」に自動変更",
					},
				]}
				settings={{
					autoChangeStatus: settings().autoChangeStatus ?? defaultSettings.autoChangeStatus,
				}}
			/>
		</>
	);
}

export default App;
