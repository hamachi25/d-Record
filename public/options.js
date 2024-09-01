const tokenElement = document.querySelector(".token-container > input");
const sendTimingElements = document.querySelectorAll(".send-timing-container input");
const nextEpisodeLineElement = document.getElementById("next-episode-line");
const recordButtonElement = document.getElementById("record-button");
const animeTitleElement = document.getElementById("anime-title");
const AutoChangeStatusElement = document.getElementById("auto-change-status");

// ローカルストレージから設定を取得
function loadSettings() {
    chrome.storage.local.get(
        ["Token", "sendTiming", "nextEpisodeLine", "recordButton", "animeTitle", "autoChangeStatus"],
        (items) => {
            items.Token && (tokenElement.value = items.Token);

            if (items.sendTiming) {
                Array.from(sendTimingElements).forEach((element) => {
                    if (element.value == items.sendTiming) {
                        element.checked = true;
                    }
                });
            } else {
                sendTimingElements[2].checked = true;
            }

            items.nextEpisodeLine && (nextEpisodeLineElement.checked = items.nextEpisodeLine);
            items.recordButton && (recordButtonElement.checked = items.recordButton);
            items.animeTitle && (animeTitleElement.checked = items.animeTitle);
            if (items.autoChangeStatus !== undefined) {
                AutoChangeStatusElement.checked = items.autoChangeStatus;
            } else {
                AutoChangeStatusElement.checked = true;
            }
        }
    );
}
document.addEventListener("DOMContentLoaded", loadSettings);

// ローカルストレージに保存するイベント
tokenElement.addEventListener("change", () => {
    const message = tokenElement.value.trim();
    chrome.storage.local.set({ Token: message });
    document.querySelector(".token-container > div > span").textContent = "保存しました";
});
Array.from(sendTimingElements).forEach((element) => {
    element.addEventListener("change", (e) => {
        chrome.storage.local.set({ sendTiming: e.target.value });
    });
});
nextEpisodeLineElement.addEventListener("change", (e) => {
    chrome.storage.local.set({ nextEpisodeLine: e.target.checked });
});
recordButtonElement.addEventListener("change", (e) => {
    chrome.storage.local.set({ recordButton: e.target.checked });
});
animeTitleElement.addEventListener("change", (e) => {
    chrome.storage.local.set({ animeTitle: e.target.checked });
});
AutoChangeStatusElement.addEventListener("change", (e) => {
    chrome.storage.local.set({ autoChangeStatus: e.target.checked });
});

// 「トークンの取得方法」を新規タブで開く
document.querySelector(".token-container > div > a").addEventListener("click", () => {
    chrome.tabs.create({
        url: "https://developers.annict.com/docs/authentication/personal-access-token",
    });
});
