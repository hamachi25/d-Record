function Save() {
    const message = document.getElementById('input_token').value.trim();
    chrome.storage.local.set({ 'Token': message }, function () {
    });
}

function Load() {
    chrome.storage.local.get('Token', function (items) {
        if (items.Token != null) {
            document.getElementById('input_token').value = items.Token;
        }
    });
}

function SaveMsg() {
    if (document.querySelector('p') == null) {
        const button = document.getElementById('button-container');
        const saveMsg = document.createElement('p');
        saveMsg.textContent = '保存しました！';
        button.after(saveMsg);
    }
}

document.addEventListener('DOMContentLoaded', Load);

document.getElementById('save_button').addEventListener('click', Save);
document.getElementById('save_button').addEventListener('click', SaveMsg);