import { Settings } from "./types";

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

export let settingData: Settings;
export async function getSettings() {
	try {
		const result = await browser.storage.local.get([
			"sendTiming",
			"nextEpisodeLine",
			"recordButton",
			"animeTitle",
			"autoChangeStatus",
			"applyWebsite",
		]);

		settingData = { ...defaultSettings, ...result };

		// 非表示にするかのbool値が入っているので、反転させる
		settingData.nextEpisodeLine = !settingData.nextEpisodeLine;
		settingData.recordButton = !settingData.recordButton;
		settingData.animeTitle = !settingData.animeTitle;

		return true;
	} catch {
		return false;
	}
}

// 自動送信を行わない作品リストを取得
export async function getNotRecordWork() {
	try {
		const result = await browser.storage.local.get("notRecordWork");
		return result.notRecordWork || [];
	} catch {
		return false;
	}
}
