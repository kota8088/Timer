// ==========================================
// 共通：通知機能 (Notification)
// ==========================================
const notifyCheckbox = document.getElementById('notification-checkbox');

notifyCheckbox.addEventListener('change', () => {
    if (notifyCheckbox.checked) {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission !== 'granted') {
                    notifyCheckbox.checked = false;
                    alert('通知が拒否されました。ブラウザの設定を変更してください。');
                }
            });
        }
    }
});

function sendNotification(title, body) {
    if (notifyCheckbox.checked && Notification.permission === 'granted') {
        new Notification(title, { body: body });
    }
}

// ==========================================
// 1. リアルタイム時計 (場所検索つき)
// ==========================================
let currentZone = "Asia/Tokyo";
const clockDisplay = document.getElementById('clock-display');
const timezoneInput = document.getElementById('timezone-search');
const searchBtn = document.getElementById('search-btn');
const timezoneLabel = document.getElementById('timezone-label');

function updateClock() {
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('ja-JP', {
            timeZone: currentZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        clockDisplay.textContent = formatter.format(now);
    } catch (e) {
        currentZone = "Asia/Tokyo"; // エラー時はデフォルトに戻す
    }
}
setInterval(updateClock, 1000);
updateClock();

// 簡易タイムゾーン都市検索辞書 (一般的な主要都市)
const tzDictionary = {
    "tokyo": "Asia/Tokyo", "東京": "Asia/Tokyo",
    "london": "Europe/London", "ロンドン": "Europe/London",
    "new york": "America/New_York", "ニューヨーク": "America/New_York",
    "los angeles": "America/Los_Angeles", "ロサンゼルス": "America/Los_Angeles",
    "paris": "Europe/Paris", "パリ": "Europe/Paris",
    "singapore": "Asia/Singapore", "シンガポール": "Asia/Singapore",
    "sydney": "Australia/Sydney", "シドニー": "Australia/Sydney"
};

searchBtn.addEventListener('click', () => {
    const query = timezoneInput.value.trim().toLowerCase();
    if (!query) return;

    if (tzDictionary[query]) {
        currentZone = tzDictionary[query];
        timezoneLabel.textContent = `現在の場所: ${currentZone}`;
    } else {
        // 直接IANAタイムゾーン形式で入力された場合を考慮 (例: America/Chicago)
        try {
            new Intl.DateTimeFormat('ja-JP', { timeZone: query });
            currentZone = query;
            timezoneLabel.textContent = `現在の場所: ${currentZone}`;
        } catch (e) {
            alert("都市が見つかりません。対応ワード: Tokyo, London, New York, Paris など、または 'Europe/Berlin' 形式");
        }
    }
    updateClock();
});

// ==========================================
// 2. タイマー (停止で設定時に戻る)
// ==========================================
let timerId = null;
let timerLeft = 0;
const tMinInput = document.getElementById('timer-min');
const tSecInput = document.getElementById('timer-sec');
const tDisplay = document.getElementById('timer-display');
const tStartBtn = document.getElementById('timer-start');
const tStopBtn = document.getElementById('timer-stop');

function getSelectedTimerSeconds() {
    const m = parseInt(tMinInput.value) || 0;
    const s = parseInt(tSecInput.value) || 0;
    return (m * 60) + s;
}

function updateTimerDisplay(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    tDisplay.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

tStartBtn.addEventListener('click', () => {
    if (timerId !== null) return;
    
    // 開始時に、現在フォームに入力されている値で残り時間を決定
    if (timerLeft === 0) {
        timerLeft = getSelectedTimerSeconds();
    }
    if (timerLeft <= 0) return;

    timerId = setInterval(() => {
        timerLeft--;
        updateTimerDisplay(timerLeft);

        if (timerLeft <= 0) {
            clearInterval(timerId);
            timerId = null;
            sendNotification("TIMER", "設定した時間になりました！");
            alert("タイマー終了！");
            // 終了後も設定値に戻す
            timerLeft = getSelectedTimerSeconds();
            updateTimerDisplay(timerLeft);
        }
    }, 1000);
});

tStopBtn.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    // 停止/キャンセルを押したら入力された元の設定時間に戻す
    timerLeft = getSelectedTimerSeconds();
    updateTimerDisplay(timerLeft);
});

// 入力が変更されたら表示も同期
[tMinInput, tSecInput].forEach(input => {
    input.addEventListener('input', () => {
        if (timerId === null) {
            timerLeft = getSelectedTimerSeconds();
            updateTimerDisplay(timerLeft);
        }
    });
});

// ==========================================
// 3. ストップウォッチ (1ボタン切替、リセットでラップ全削除)
// ==========================================
let swId = null;
let swStartTime = 0;
let swElapsed = 0;
let lapCount = 0;

const swDisplay = document.getElementById('sw-display');
const swToggleBtn = document.getElementById('sw-toggle');
const swLapBtn = document.getElementById('sw-lap');
const swResetBtn = document.getElementById('sw-reset');
const lapList = document.getElementById('lap-list');

function updateSwDisplay() {
    const totalMs = swElapsed + (swId ? Date.now() - swStartTime : 0);
    const min = Math.floor(totalMs / 60000);
    const sec = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);
    swDisplay.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    return swDisplay.textContent;
}

swToggleBtn.addEventListener('click', () => {
    if (swId === null) {
        // スタート処理
        swStartTime = Date.now();
        swId = setInterval(updateSwDisplay, 10);
        swToggleBtn.textContent = "ストップ";
        swToggleBtn.style.borderColor = "#ff3333"; // ストップ時は赤寄りに
        swLapBtn.disabled = false;
    } else {
        // ストップ処理
        swElapsed += Date.now() - swStartTime;
        clearInterval(swId);
        swId = null;
        swToggleBtn.textContent = "スタート";
        swToggleBtn.style.borderColor = "#ff007f";
        swLapBtn.disabled = true;
    }
});

swLapBtn.addEventListener('click', () => {
    if (swId === null) return;
    lapCount++;
    const currentTimeStr = updateSwDisplay();
    const li = document.createElement('li');
    li.innerHTML = `<span>Lap ${lapCount}</span> <span>${currentTimeStr}</span>`;
    lapList.insertBefore(li, lapList.firstChild); // 新しいラップを上に
});

swResetBtn.addEventListener('click', () => {
    clearInterval(swId);
    swId = null;
    swElapsed = 0;
    lapCount = 0;
    swToggleBtn.textContent = "スタート";
    swToggleBtn.style.borderColor = "#ff007f";
    swLapBtn.disabled = true;
    swDisplay.textContent = "00:00.00";
    lapList.innerHTML = ""; // ラップ保存の消去
});

// ==========================================
// 4. アラーム
// ==========================================
let alarmTimeValue = null;
const alarmInput = document.getElementById('alarm-time');
const alarmStatus = document.getElementById('alarm-status');
const alarmSetBtn = document.getElementById('alarm-set');
const alarmClearBtn = document.getElementById('alarm-clear');

alarmSetBtn.addEventListener('click', () => {
    alarmTimeValue = alarmInput.value;
    if (alarmTimeValue) {
        alarmStatus.textContent = `設定中: ${alarmTimeValue}`;
    }
});

alarmClearBtn.addEventListener('click', () => {
    alarmTimeValue = null;
    alarmStatus.textContent = "アラーム未設定";
});

// アラームの監視 (1秒ごとにチェック)
setInterval(() => {
    if (!alarmTimeValue) return;
    const now = new Date();
    const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (currentStr === alarmTimeValue && now.getSeconds() === 0) {
        sendNotification("ALARM", "アラームの時間になりました！");
        alert(`アラーム時間です! (${alarmTimeValue})`);
        alarmTimeValue = null;
        alarmStatus.textContent = "アラーム未設定";
    }
}, 1000);

// ==========================================
// 5. ポモドーロ (停止で設定時に戻る)
// ==========================================
let pomoId = null;
let pomoLeft = 0;
let isWorkPhase = true; // true: 作業, false: 休憩
let currentRound = 1;

const pWorkInput = document.getElementById('pomo-work');
const pBreakInput = document.getElementById('pomo-break');
const pRoundsInput = document.getElementById('pomo-rounds');
const pPhaseText = document.getElementById('pomo-phase');
const pDisplay = document.getElementById('pomo-display');
const pRoundDisplay = document.getElementById('pomo-round-display');
const pStartBtn = document.getElementById('pomo-start');
const pStopBtn = document.getElementById('pomo-stop');

function updatePomoDisplay() {
    const min = Math.floor(pomoLeft / 60);
    const sec = pomoLeft % 60;
    pDisplay.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    pRoundDisplay.textContent = `ラウンド: ${currentRound} / ${pRoundsInput.value}`;
}

function resetPomoToConfig() {
    isWorkPhase = true;
    currentRound = 1;
    pomoLeft = (parseInt(pWorkInput.value) || 25) * 60;
    pPhaseText.textContent = "集中時間";
    pPhaseText.style.color = "#fff";
    updatePomoDisplay();
}

pStartBtn.addEventListener('click', () => {
    if (pomoId !== null) return;

    if (pomoLeft === 0) {
        pomoLeft = (isWorkPhase ? pWorkInput.value : pBreakInput.value) * 60;
    }

    pomoId = setInterval(() => {
        pomoLeft--;
        updatePomoDisplay();

        if (pomoLeft <= 0) {
            clearInterval(pomoId);
            pomoId = null;

            const maxRounds = parseInt(pRoundsInput.value) || 4;

            if (isWorkPhase) {
                sendNotification("POMODORO", "作業終了！休憩してください。");
                alert("作業終了！休憩に入りましょう。");
                if (currentRound >= maxRounds) {
                    alert("すべてのラウンドが完了しました！お疲れ様でした。");
                    resetPomoToConfig();
