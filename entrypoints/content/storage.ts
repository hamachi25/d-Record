// 保存してあるd-Recordの設定を取得
export let settingData: LocalData;
type LocalData = {
	Token?: string;
	sendTiming?: string;
	nextEpisodeLine?: boolean;
	recordButton?: boolean;
	animeTitle?: boolean;
	autoChangeStatus?: boolean;
};

export async function getSettings(): Promise<void> {
	return new Promise((resolve, reject) => {
		browser.storage.local
			.get([
				"Token",
				"sendTiming",
				"nextEpisodeLine",
				"recordButton",
				"animeTitle",
				"autoChangeStatus",
			])
			.then((result) => {
				if (browser.runtime.lastError) {
					reject(browser.runtime.lastError);
				} else {
					settingData = result;
					resolve();
				}
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export async function getNotRecordSettings(): Promise<string[]> {
	return new Promise((resolve, reject) => {
		browser.storage.local
			.get("notRecordWork")
			.then((result) => {
				if (browser.runtime.lastError) {
					reject(browser.runtime.lastError);
				} else {
					const notRecordWork = result.notRecordWork;
					if (Array.isArray(notRecordWork)) {
						resolve(notRecordWork);
					}
				}
			})
			.catch((error) => {
				reject(error);
			});
	});
}
