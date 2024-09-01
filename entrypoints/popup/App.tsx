import { createSignal, onMount } from "solid-js";
import { TokenInput } from "./components/TokenInput";
import { SendTiming } from "./components/SendTiming";
import { UIBehavior } from "./components/UIBehavior";

type UISettings = {
	nextEpisodeLine?: boolean;
	recordButton?: boolean;
	animeTitle?: boolean;
};

type OtherSettings = {
	autoChangeStatus?: boolean;
};

interface Settings extends UISettings, OtherSettings {
	Token?: string;
	sendTiming?: string;
}

const defaultSettings: Settings = {
	Token: "",
	sendTiming: "after-end",
	nextEpisodeLine: false,
	recordButton: false,
	animeTitle: false,
	autoChangeStatus: false,
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
			<SendTiming sendTiming={settings().sendTiming} />
			<UIBehavior
				title="UIの変更"
				options={[
					{ value: "nextEpisodeLine", label: "作品ページの赤い枠線を非表示" },
					{ value: "recordButton", label: "作品ページの記録ボタンを非表示" },
					{ value: "animeTitle", label: "再生ページ右下のタイトルを非表示" },
				]}
				settings={{
					nextEpisodeLine: settings().nextEpisodeLine,
					recordButton: settings().recordButton,
					animeTitle: settings().animeTitle,
				}}
			/>
			<UIBehavior
				title="その他"
				options={[
					{
						value: "autoChangeStatus",
						label: "最終話視聴後にステータスを「見た」に自動変更",
					},
				]}
				settings={{
					autoChangeStatus: settings().autoChangeStatus,
				}}
			/>
		</>
	);
}

export default App;
