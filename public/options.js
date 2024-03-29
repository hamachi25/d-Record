const sendTimingElements = document.getElementsByName("send-timing");
const nextEpisodeLineElement = document.getElementById("next-episode-line");
const recordButtonElement = document.getElementById("record-button");
const animeTitleElement = document.getElementById("anime-title");
function loadSettings() {
    chrome.storage.local.get(
        ["Token", "sendTiming", "nextEpisodeLine", "recordButton", "animeTitle"],
        (items) => {
            const token = items.Token;
            token && (document.getElementById("input_token").value = token);

            const sendTiming = items.sendTiming;
            if (sendTiming) {
                Array.from(sendTimingElements).forEach((element) => {
                    if (element.value == sendTiming) {
                        element.checked = true;
                    }
                });
            } else {
                sendTimingElements[1].checked = true;
            }

            const nextEpisodeLine = items.nextEpisodeLine;
            nextEpisodeLine && (nextEpisodeLineElement.checked = nextEpisodeLine);
            const recordButton = items.recordButton;
            recordButton && (recordButtonElement.checked = recordButton);
            const animeTitle = items.animeTitle;
            animeTitle && (animeTitleElement.checked = animeTitle);
        }
    );
}
document.addEventListener("DOMContentLoaded", loadSettings);

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

function saveToken() {
    const message = document.getElementById("input_token").value.trim();
    chrome.storage.local.set({ Token: message });
}
function saveMsg() {
    if (!document.getElementById("save-msg")) {
        const insertElement = '<p id="save-msg">保存しました！</p>';
        document.getElementById("button-container").insertAdjacentHTML("afterend", insertElement);
    }
}

document.getElementById("save_button").addEventListener("click", saveToken);
document.getElementById("save_button").addEventListener("click", saveMsg);
