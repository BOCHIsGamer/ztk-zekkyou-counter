// カウンターの要素を取得
const counters = document.querySelectorAll('.count');
const allClearBtn = document.getElementById('all-clear-btn');
const undoBtn = document.getElementById('undo-btn');
const resultText = document.getElementById('result-text');
const logDisplay = document.getElementById('log-display');
const showImageLink = document.getElementById('show-image');
const popup = document.getElementById('popup');
const closeBtn = document.querySelector('.close-btn');
const clipboardCheckboxes = document.querySelectorAll('.clipboard-checkbox');

// 新しい要素を取得
const logAndCountClearBtn = document.getElementById('log-and-count-clear-btn');
const startStreamBtn = document.getElementById('start-stream-btn');
const setStartTimeBtn = document.getElementById('set-start-time-btn');
const startHourInput = document.getElementById('start-hour');
const startMinuteInput = document.getElementById('start-minute');
const startSecondInput = document.getElementById('start-second');
const timeInputs = document.querySelectorAll('.time-input');
const startDateDisplay = document.getElementById('start-date-display');
const popupMessage = document.getElementById('popup-message');

// 履歴とログを保存する配列を定義
let history = [];
let logHistory = [];
const MAX_HISTORY = 20;
let startTime = null;

// 現在のカウンターの状態を保存する関数
function saveState() {
    const currentState = Array.from(counters).map(counter => ({
        id: counter.id,
        value: parseInt(counter.textContent)
    }));
    history.push(currentState);
    if (history.length > MAX_HISTORY) {
        history.shift();
    }
}

// ログを記録する関数
function logAction(counterId, action) {
    if (startTime === null) {
        startTime = Date.now();
    }
    
    const now = new Date();
    const elapsedTime = now.getTime() - startTime;
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const sign = totalSeconds >= 0 ? '+' : '-';
    const absSeconds = Math.abs(totalSeconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const seconds = absSeconds % 60;
    
    // 日付と時刻のフォーマットをyyyy-mm-ddThh:mm:ss形式に変更
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const dateTimeStr = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

    const elapsedStr = `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const emojiMap = {
        'counter1': '🥶',
        'counter2': '⚡️',
        'counter3': '🥵',
        'counter4': '🌿'
    };
    const emoji = counterId ? emojiMap[counterId] : '';
    
    let actionText = '';
    if (action === 'plus') {
        actionText = '+1';
    } else if (action === 'minus') {
        actionText = '-1';
    } else if (action === 'clear') {
        actionText = 'Clear';
    } else if (action === 'all-clear') {
        actionText = '👻Clear';
    } else if (action === 'start-stream') {
        actionText = '👻Start';
    }

    const logEntry = `${dateTimeStr},${elapsedStr},${emoji}${actionText}`;
    logHistory.push(logEntry);
    updateLogDisplay();
}

// ログ表示を更新する関数
function updateLogDisplay() {
    logDisplay.value = logHistory.join('\n');
    logDisplay.scrollTop = logDisplay.scrollHeight;
}

// 元に戻す処理を実行する関数
function undo() {
    if (history.length > 1) {
        history.pop();
        logHistory.pop();
        const previousState = history[history.length - 1];
        previousState.forEach(item => {
            const counter = document.getElementById(item.id);
            if (counter) {
                counter.textContent = item.value;
            }
        });
        updateResultDisplay();
        updateLogDisplay();
    } else if (history.length === 1) {
        history.pop();
        logHistory.pop();
        startTime = null;
        updateResultDisplay();
        updateLogDisplay();
    }
}

// 結果表示を更新する関数
function updateResultDisplay() {
    let result = [];
    const counterEmojis = {
        'counter1': '🥶',
        'counter2': '⚡️',
        'counter3': '🥵',
        'counter4': '🌿'
    };

    clipboardCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const id = `counter${checkbox.dataset.id}`;
            const count = document.getElementById(id).textContent;
            result.push(`${counterEmojis[id]}${count}`);
        }
    });

    resultText.value = result.join('／');
}

// 画面上部にメッセージを表示する関数
function showPopupMessage(message) {
    popupMessage.querySelector('p').textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => {
        popupMessage.classList.remove('show');
    }, 3000);
}

// 配信開始時刻を適用する関数
function applyStartTime() {
    const hour = parseInt(startHourInput.value) || 0;
    const minute = parseInt(startMinuteInput.value) || 0;
    const second = parseInt(startSecondInput.value) || 0;

    // 配信開始時刻として適用する時間を作成
    const newStartTimeDate = new Date();
    newStartTimeDate.setHours(hour, minute, second, 0);
    const newStartTime = newStartTimeDate.getTime();

    // ログが存在しない場合
    if (logHistory.length === 0) {
        startTime = newStartTime;
        logAction(null, 'start-stream');
        showPopupMessage('配信時間を基準にログを更新しました');
        return;
    }

    // ログが存在する場合、経過時間のみを更新する
    const updatedLogHistory = logHistory.map(entry => {
        const parts = entry.split(',');
        const originalTime = new Date(parts[0]);
        const elapsedTime = originalTime.getTime() - newStartTime;
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const sign = totalSeconds >= 0 ? '+' : '-';
        const absSeconds = Math.abs(totalSeconds);
        const hours = Math.floor(absSeconds / 3600);
        const minutes = Math.floor((absSeconds % 3600) / 60);
        const seconds = absSeconds % 60;
        const elapsedStr = `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // ログエントリの形式を維持して更新
        return `${parts[0]},${elapsedStr},${parts.slice(2).join(',')}`;
    });

    logHistory = updatedLogHistory;
    startTime = newStartTime;
    updateLogDisplay();
    showPopupMessage('配信時間を基準にログを更新しました');
}

// 初期化処理
function initialize() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 時刻の初期値を設定
    let initialHour = currentHour;
    if (currentMinute > 30) {
        initialHour = (currentHour + 1) % 24;
    }
    startHourInput.value = String(initialHour).padStart(2, '0');
    startMinuteInput.value = '00';
    startSecondInput.value = '00';

    // 日付の初期値を設定
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    startDateDisplay.textContent = `${year}-${month}-${day}T`;

    saveState();
    updateResultDisplay();
}

// キーとカウンターのマッピングを定義
const keyMap = {
    // Counter 1
    'j': { action: 'plus', counterId: 'counter1' },
    'f': { action: 'plus', counterId: 'counter1' },
    'm': { action: 'minus', counterId: 'counter1' },
    'v': { action: 'minus', counterId: 'counter1' },
    'u': { action: 'clear', counterId: 'counter1' },
    'r': { action: 'clear', counterId: 'counter1' },

    // Counter 2
    'k': { action: 'plus', counterId: 'counter2' },
    'd': { action: 'plus', counterId: 'counter2' },
    ',': { action: 'minus', counterId: 'counter2' },
    'c': { action: 'minus', counterId: 'counter2' },
    'i': { action: 'clear', counterId: 'counter2' },
    'e': { action: 'clear', counterId: 'counter2' },

    // Counter 3
    'l': { action: 'plus', counterId: 'counter3' },
    's': { action: 'plus', counterId: 'counter3' },
    '.': { action: 'minus', counterId: 'counter3' },
    'x': { action: 'minus', counterId: 'counter3' },
    'o': { action: 'clear', counterId: 'counter3' },
    'w': { action: 'clear', counterId: 'counter3' },

    // Counter 4
    ';': { action: 'plus', counterId: 'counter4' },
    'a': { action: 'plus', counterId: 'counter4' },
    '/': { action: 'minus', counterId: 'counter4' },
    'z': { action: 'minus', counterId: 'counter4' },
    'p': { action: 'clear', counterId: 'counter4' },
    'q': { action: 'clear', counterId: 'counter4' },

    // 全クリアと戻る
    'h': { action: 'all-clear' },
    'g': { action: 'all-clear' },
    'b': { action: 'undo-action' },
    'n': { action: 'undo-action' },
    
    // チェックボックスのショートカットキー
    '4': { action: 'toggle-checkbox', checkboxId: '1' },
    '3': { action: 'toggle-checkbox', checkboxId: '2' },
    '2': { action: 'toggle-checkbox', checkboxId: '3' },
    '1': { action: 'toggle-checkbox', checkboxId: '4' },
    '7': { action: 'toggle-checkbox', checkboxId: '1' },
    '8': { action: 'toggle-checkbox', checkboxId: '2' },
    '9': { action: 'toggle-checkbox', checkboxId: '3' },
    '0': { action: 'toggle-checkbox', checkboxId: '4' }
};

// 初期化処理を実行
initialize();

// キーボードイベントのリスナー
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (keyMap[key]) {
        event.preventDefault();
        const { action, counterId, checkboxId } = keyMap[key];
        
        if (action === 'plus' || action === 'minus' || action === 'clear') {
            saveState();
            logAction(counterId, action);
            if (action === 'plus') {
                const countElement = document.getElementById(counterId);
                let currentCount = parseInt(countElement.textContent);
                countElement.textContent = currentCount + 1;
            } else if (action === 'minus') {
                const countElement = document.getElementById(counterId);
                let currentCount = parseInt(countElement.textContent);
                countElement.textContent = Math.max(0, currentCount - 1);
            } else if (action === 'clear') {
                const countElement = document.getElementById(counterId);
                countElement.textContent = 0;
            }
        } else if (action === 'all-clear') {
            saveState();
            logAction(null, 'all-clear');
            counters.forEach(counter => {
                counter.textContent = 0;
            });
        } else if (action === 'undo-action') {
            undo();
        } else if (action === 'toggle-checkbox') {
            const checkbox = document.querySelector(`.clipboard-checkbox[data-id="${checkboxId}"]`);
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
            }
        }
        updateResultDisplay();
    }
});

// ボタンクリックイベントのリスナー
document.addEventListener('click', (event) => {
    const target = event.target;
    const action = target.dataset.action;
    const counterId = target.dataset.counter;

    if (action === 'plus' || action === 'minus') {
        saveState();
        logAction(`counter${counterId}`, action);
        const countElement = document.getElementById(`counter${counterId}`);
        let currentCount = parseInt(countElement.textContent);
        if (action === 'plus') {
            countElement.textContent = currentCount + 1;
        } else if (action === 'minus') {
            countElement.textContent = Math.max(0, currentCount - 1);
        }
    } else if (target.id === 'all-clear-btn') {
        saveState();
        counters.forEach(counter => {
            counter.textContent = 0;
            updateResultDisplay();
        });
    } else if (target.id === 'set-start-time-btn') {
        applyStartTime();
    }

    updateResultDisplay();
});

// 各チェックボックスのイベントリスナー
clipboardCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateResultDisplay);
});

// 元に戻すボタンのイベントリスナー
undoBtn.addEventListener('click', undo);

// ログと絶叫回数クリアボタンのイベントリスナー
logAndCountClearBtn.addEventListener('click', () => {
    logHistory = [];
    startTime = null; // 基準時間をリセット
    updateLogDisplay();
    
    // 絶叫回数も0にリセット
    counters.forEach(counter => {
        counter.textContent = 0;
    });
    updateResultDisplay();
});

// 新しく追加した「配信開始から記録」ボタンのイベントリスナー
startStreamBtn.addEventListener('click', () => {
    logHistory = [];
    startTime = null;
    updateLogDisplay();
    
    counters.forEach(counter => {
        counter.textContent = 0;
    });
    updateResultDisplay();
    
    // 動作完了後にログを記録
    logAction(null, 'start-stream');
});

// テキストボックスのクリックイベントでクリップボードにコピー
resultText.addEventListener('click', () => {
    navigator.clipboard.writeText(resultText.value)
        .then(() => {
            console.log("Copied to clipboard successfully!");
            const originalValue = resultText.value;
            resultText.value = "コピーしました！";
            setTimeout(() => {
                resultText.value = originalValue;
            }, 1000);
        })
        .catch(err => {
            console.error("Failed to copy text to clipboard: ", err);
        });
});

// ログテキストボックスのクリックイベントでコピー
logDisplay.addEventListener('click', () => {
    navigator.clipboard.writeText(logDisplay.value)
        .then(() => {
            console.log("Log copied to clipboard successfully!");
            const originalValue = logDisplay.value;
            logDisplay.value = "ログをコピーしました！";
            setTimeout(() => {
                logDisplay.value = originalValue;
            }, 1000);
        })
        .catch(err => {
            console.error("Failed to copy log to clipboard: ", err);
        });
});

// ポップアップ表示機能
showImageLink.addEventListener('click', (e) => {
    e.preventDefault();
    popup.classList.add('show');
});

// ポップアップ非表示機能
closeBtn.addEventListener('click', () => {
    popup.classList.remove('show');
});

// ポップアップの背景をクリックして非表示にする機能
popup.addEventListener('click', (e) => {
    if (e.target === popup) {
        popup.classList.remove('show');
    }
});


// 時刻設定UIの操作ロジック
// マウスホイールイベントのリスナー
timeInputs.forEach(input => {
    input.addEventListener('wheel', (event) => {
        event.preventDefault();
        let value = parseInt(input.value) || 0;
        if (event.deltaY < 0) { // 上向きホイールで増加
            value++;
        } else { // 下向きホイールで減少
            value--;
        }

        // 単位に応じて値を調整
        const unit = input.id.replace('start-', '');
        if (unit === 'hour') {
            value = (value + 24) % 24;
        } else { // minute or second
            value = (value + 60) % 60;
        }
        input.value = String(value).padStart(2, '0');
    });

    // タッチ操作（スワイプ）のリスナー
    let touchStartY = 0;
    input.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0].clientY;
    });

    input.addEventListener('touchend', (event) => {
        const touchEndY = event.changedTouches[0].clientY;
        const deltaY = touchEndY - touchStartY;
        let value = parseInt(input.value) || 0;

        if (deltaY < -20) { // 上向きスワイプ
            value++;
        } else if (deltaY > 20) { // 下向きスワイプ
            value--;
        }

        // 単位に応じて値を調整
        const unit = input.id.replace('start-', '');
        if (unit === 'hour') {
            value = (value + 24) % 24;
        } else { // minute or second
            value = (value + 60) % 60;
        }
        input.value = String(value).padStart(2, '0');
    });
});
