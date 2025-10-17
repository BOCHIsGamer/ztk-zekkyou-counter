const counters = document.querySelectorAll('.count');
const allClearBtn = document.getElementById('all-clear-btn');
const undoBtn = document.getElementById('undo-btn');
const resultText = document.getElementById('result-text');
const logDisplay = document.getElementById('log-display');
const showImageLink = document.getElementById('show-image');
const popup = document.getElementById('popup');
const closeBtn = document.querySelector('.close-btn');
const clipboardCheckboxes = document.querySelectorAll('.clipboard-checkbox');
const logAndCountClearBtn = document.getElementById('log-and-count-clear-btn');
const startStreamBtn = document.getElementById('start-stream-btn');
const setStartTimeBtn = document.getElementById('set-start-time-btn');
const startHourInput = document.getElementById('start-hour');
const startMinuteInput = document.getElementById('start-minute');
const startSecondInput = document.getElementById('start-second');
const timeInputs = document.querySelectorAll('.time-input');
const startDateDisplay = document.getElementById('start-date-display');
const popupMessage = document.getElementById('popup-message');

let history = [];
let logHistory = [];
const MAX_HISTORY = 20;
let startTime = null;

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

function updateLogDisplay() {
    logDisplay.value = logHistory.join('\n');
    logDisplay.scrollTop = logDisplay.scrollHeight;
}

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

function showPopupMessage(message) {
    popupMessage.querySelector('p').textContent = message;
    popupMessage.classList.add('show');
    setTimeout(() => {
        popupMessage.classList.remove('show');
    }, 3000);
}

function applyStartTime() {
    const hour = parseInt(startHourInput.value) || 0;
    const minute = parseInt(startMinuteInput.value) || 0;
    const second = parseInt(startSecondInput.value) || 0;

    const newStartTimeDate = new Date();
    newStartTimeDate.setHours(hour, minute, second, 0);
    const newStartTime = newStartTimeDate.getTime();

    if (logHistory.length === 0) {
        startTime = newStartTime;
        logAction(null, 'start-stream');
        showPopupMessage('配信時間を基準にログを更新しました');
        return;
    }

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
        
        return `${parts[0]},${elapsedStr},${parts.slice(2).join(',')}`;
    });

    logHistory = updatedLogHistory;
    startTime = newStartTime;
    updateLogDisplay();
    showPopupMessage('配信時間を基準にログを更新しました');
}

function initialize() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let initialHour = currentHour;
    if (currentMinute > 30) {
        initialHour = (currentHour + 1) % 24;
    }
    startHourInput.value = String(initialHour).padStart(2, '0');
    startMinuteInput.value = '00';
    startSecondInput.value = '00';

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    startDateDisplay.textContent = `${year}-${month}-${day}T`;

    saveState();
    updateResultDisplay();
}

const keyMap = {
    'j': { action: 'plus', counterId: 'counter1' },
    'f': { action: 'plus', counterId: 'counter1' },
    'm': { action: 'minus', counterId: 'counter1' },
    'v': { action: 'minus', counterId: 'counter1' },
    'u': { action: 'clear', counterId: 'counter1' },
    'r': { action: 'clear', counterId: 'counter1' },

    'k': { action: 'plus', counterId: 'counter2' },
    'd': { action: 'plus', counterId: 'counter2' },
    ',': { action: 'minus', counterId: 'counter2' },
    'c': { action: 'minus', counterId: 'counter2' },
    'i': { action: 'clear', counterId: 'counter2' },
    'e': { action: 'clear', counterId: 'counter2' },

    'l': { action: 'plus', counterId: 'counter3' },
    's': { action: 'plus', counterId: 'counter3' },
    '.': { action: 'minus', counterId: 'counter3' },
    'x': { action: 'minus', counterId: 'counter3' },
    'o': { action: 'clear', counterId: 'counter3' },
    'w': { action: 'clear', counterId: 'counter3' },

    ';': { action: 'plus', counterId: 'counter4' },
    'a': { action: 'plus', counterId: 'counter4' },
    '/': { action: 'minus', counterId: 'counter4' },
    'z': { action: 'minus', counterId: 'counter4' },
    'p': { action: 'clear', counterId: 'counter4' },
    'q': { action: 'clear', counterId: 'counter4' },

    'h': { action: 'all-clear' },
    'g': { action: 'all-clear' },
    'b': { action: 'undo-action' },
    'n': { action: 'undo-action' },
    
    '4': { action: 'toggle-checkbox', checkboxId: '1' },
    '3': { action: 'toggle-checkbox', checkboxId: '2' },
    '2': { action: 'toggle-checkbox', checkboxId: '3' },
    '1': { action: 'toggle-checkbox', checkboxId: '4' },
    '7': { action: 'toggle-checkbox', checkboxId: '1' },
    '8': { action: 'toggle-checkbox', checkboxId: '2' },
    '9': { action: 'toggle-checkbox', checkboxId: '3' },
    '0': { action: 'toggle-checkbox', checkboxId: '4' }
};

initialize();

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

clipboardCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateResultDisplay);
});

undoBtn.addEventListener('click', undo);

logAndCountClearBtn.addEventListener('click', () => {
    logHistory = [];
    startTime = null;
    updateLogDisplay();
    
    counters.forEach(counter => {
        counter.textContent = 0;
    });
    updateResultDisplay();
});

startStreamBtn.addEventListener('click', () => {
    logHistory = [];
    startTime = null;
    updateLogDisplay();
    
    counters.forEach(counter => {
        counter.textContent = 0;
    });
    updateResultDisplay();
    
    logAction(null, 'start-stream');
});

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

showImageLink.addEventListener('click', (e) => {
    e.preventDefault();
    popup.classList.add('show');
});

closeBtn.addEventListener('click', () => {
    popup.classList.remove('show');
});

popup.addEventListener('click', (e) => {
    if (e.target === popup) {
        popup.classList.remove('show');
    }
});

timeInputs.forEach(input => {
    input.addEventListener('wheel', (event) => {
        event.preventDefault();
        let value = parseInt(input.value) || 0;
        if (event.deltaY < 0) {
            value++;
        } else {
            value--;
        }

        const unit = input.id.replace('start-', '');
        if (unit === 'hour') {
            value = (value + 24) % 24;
        } else {
            value = (value + 60) % 60;
        }
        input.value = String(value).padStart(2, '0');
    });

    let touchStartY = 0;
    input.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0].clientY;
    });

    input.addEventListener('touchend', (event) => {
        const touchEndY = event.changedTouches[0].clientY;
        const deltaY = touchEndY - touchStartY;
        let value = parseInt(input.value) || 0;

        if (deltaY < -20) {
            value++;
        } else if (deltaY > 20) {
            value--;
        }

        const unit = input.id.replace('start-', '');
        if (unit === 'hour') {
            value = (value + 24) % 24;
        } else {
            value = (value + 60) % 60;
        }
        input.value = String(value).padStart(2, '0');
    });
});
