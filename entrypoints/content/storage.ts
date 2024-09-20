import { Settings } from "./types";

// d-Recordの設定を取得
export let settingData: Settings;

export async function getSettings(): Promise<void> {
	const result = await browser.storage.local.get([
		"Token",
		"sendTiming",
		"nextEpisodeLine",
		"recordButton",
		"animeTitle",
		"autoChangeStatus",
	]);

	if (browser.runtime.lastError) {
		throw new Error(browser.runtime.lastError.message);
	}

	settingData = result;
}

// 自動送信を行わない作品リストを取得
export async function getNotRecordWork(): Promise<number[]> {
	const result = await browser.storage.local.get("notRecordWork");

	if (browser.runtime.lastError) {
		throw new Error(browser.runtime.lastError.message);
	}

	return result.notRecordWork || [];
}
