// 保存してあるd-Recordの設定を取得
export let settingData: LocalData;
interface LocalData {
    Token?: string;
    sendTiming?: string;
    nextEpisodeLine?: boolean;
    recordButton?: boolean;
    animeTitle?: boolean;
    autoChangeStatus?: boolean;
}

export async function getSettings(): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(
            [
                "Token",
                "sendTiming",
                "nextEpisodeLine",
                "recordButton",
                "animeTitle",
                "autoChangeStatus",
            ],
            (result: LocalData) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    settingData = result;
                    resolve();
                }
            }
        );
    });
}
