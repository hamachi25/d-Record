import { Settings } from "./types";

// d-Recordの設定を取得
export let settingData: Settings;
export async function getSettings() {
	try {
		const result = await browser.storage.local.get([
			"Token",
			"sendTiming",
			"nextEpisodeLine",
			"recordButton",
			"animeTitle",
			"autoChangeStatus",
		]);

		if (browser.runtime.lastError) throw new Error(browser.runtime.lastError.message);

		// 非表示にするかのbool値が入っているので、反転させる
		result.nextEpisodeLine = !result.nextEpisodeLine;
		result.recordButton = !result.recordButton;
		result.animeTitle = !result.animeTitle;

		settingData = result;
		return true;
	} catch {
		return false;
	}
}

// 自動送信を行わない作品リストを取得
export async function getNotRecordWork(): Promise<number[] | false> {
	try {
		const result = await browser.storage.local.get("notRecordWork");

		if (browser.runtime.lastError) throw new Error(browser.runtime.lastError.message);

		return result.notRecordWork || [];
	} catch {
		return false;
	}
}
