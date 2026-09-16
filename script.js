// ==========================================
// 0. モードパネル切り替え制御システム
// ==========================================
const navButtons = {
    clock: document.getElementById('nav-clock'),
    alarm: document.getElementById('nav-alarm'),
    sw: document.getElementById('nav-sw'),
    pomodoro: document.getElementById('nav-pomodoro'),
    notification: document.getElementById('nav-notification')
};
const panels = {
    clock: document.getElementById('panel-clock'),
    alarm: document.getElementById('panel-alarm'),
    sw: document.getElementById('panel-sw'),
    pomodoro: document.getElementById('panel-pomodoro')
};

function switchMode(modeName) {
    Object.keys(navButtons).forEach(key => {
        if (key === 'notification') return;
        if (key === modeName) {
            navButtons[key].classList.add('active');
            panels[key].classList.add('active');
        } else {
            navButtons[key].classList.remove('active');
            panels[key].classList.remove('active');
        }
    });
}
navButtons.clock.addEventListener('click', () => switchMode('clock'));
navButtons.alarm.addEventListener('click', () => switchMode('alarm'));
navButtons.sw.addEventListener('click', () => switchMode('sw'));
navButtons.pomodoro.addEventListener('click', () => switchMode('pomodoro'));

// ==========================================
// デスクトップ通知制御システム
// ==========================================
let isNotificationEnabled = false;

function sendSystemNotification(title, message) {
    if (isNotificationEnabled && Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: "https://flaticon.com"
        });
    }
}

navButtons.notification.addEventListener('click', () => {
    if (!("Notification" in window)) {
        alert("このブラウザはシステム通知に対応していません。");
        return;
    }

    if (isNotificationEnabled) {
        isNotificationEnabled = false;
        navButtons.notification.textContent = "🔕 OFF";
        navButtons.notification.classList.remove('enabled');
        navButtons.notification.classList.add('disabled');
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                isNotificationEnabled = true;
                navButtons.notification.textContent = "🔔 ON";
                navButtons.notification.classList.remove('disabled');
                navButtons.notification.classList.add('enabled');
                sendSystemNotification("通知システム起動", "タイマー終了時のシステム通知が有効化されました。");
            } else {
                alert("ブラウザの通知設定が拒否されています。設定から許可してください。");
            }
        });
    }
});

// ==========================================
// 1. 世界時計システム
// ==========================================
const clockDisplay = document.getElementById('clock-display');
const clockLocation = document.getElementById('clock-location');
const citySearch = document.getElementById('city-search');
const timezoneList = document.getElementById('timezone-list');
const currentLocationBtn = document.getElementById('current-location-btn');

function getLocalTimeZone() { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
let currentTimeZone = getLocalTimeZone();

function initClockSearch() {
    Intl.supportedValuesOf('timeZone').forEach(zone => {
        const option = document.createElement('option');
        option.value = zone;
        timezoneList.appendChild(option);
    });
}
function updateClock() {
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('ja-JP', {
            timeZone: currentTimeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        clockDisplay.textContent = formatter.format(now);
        checkAlarm(now);
    } catch (e) {}
}
citySearch.addEventListener('change', () => {
    const selectedZone = citySearch.value.trim();
    if (Intl.supportedValuesOf('timeZone').includes(selectedZone)) {
        currentTimeZone = selectedZone;
        clockLocation.textContent = (selectedZone === getLocalTimeZone()) ? `${selectedZone} (現在地)` : selectedZone;
        updateClock();
        citySearch.value = ""; citySearch.blur();
    }
});
currentLocationBtn.addEventListener('click', () => {
    currentTimeZone = getLocalTimeZone();
    clockLocation.textContent = `${currentTimeZone} (現在地)`;
    updateClock();
});
setInterval(updateClock, 1000);
initClockSearch(); updateClock();

// ==========================================
// 2. タイマーシステム
// ==========================================
const inputHours = document.getElementById('input-hours');
const inputMinutes = document.getElementById('input-minutes');
const inputSeconds = document.getElementById('input-seconds');
const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const resetButton = document.getElementById('reset-btn');
let countdown, timeLeft = 0, isRunning = false;
let savedTime = 0;

function handleInput(input, max) {
    let r = input.value; if (r === '') return;
    let v = parseInt(r, 10); if (isNaN(v) || v < 0) v = 0; if (v > max) v = max;
    input.value = v;
}
function handleBlur(input, max) {
    let v = parseInt(input.value, 10); if (isNaN(v) || v < 0) v = 0; if (v > max) v = max;
    input.value = String(v).padStart(2, '0');
}
inputHours.addEventListener('input', () => handleInput(inputHours, 23));
inputMinutes.addEventListener('input', () => handleInput(inputMinutes, 59));
inputSeconds.addEventListener('input', () => handleInput(inputSeconds, 59));
inputHours.addEventListener('blur', () => handleBlur(inputHours, 23));
inputMinutes.addEventListener('blur', () => handleBlur(inputMinutes, 59));
inputSeconds.addEventListener('blur', () => handleBlur(inputSeconds, 59));

function updateDisplayFromSeconds(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    inputHours.value = String(hrs).padStart(2, '0');
    inputMinutes.value = String(mins).padStart(2, '0');
    inputSeconds.value = String(secs).padStart(2, '0');
}

function startTimer() {
    if (isRunning) return;
    if (timeLeft <= 0) {
        const hrs = parseInt(inputHours.value, 10) || 0;
        const mins = parseInt(inputMinutes.value, 10) || 0;
        const secs = parseInt(inputSeconds.value, 10) || 0;
        timeLeft = (hrs * 3600) + (mins * 60) + secs;
        savedTime = timeLeft;
    }
    if (timeLeft <= 0) return;

    isRunning = true; startButton.disabled = true; stopButton.disabled = false;
    inputHours.disabled = inputMinutes.disabled = inputSeconds.disabled = true;
    updateDisplayFromSeconds(timeLeft);
    
    countdown = setInterval(() => {
        timeLeft--; updateDisplayFromSeconds(timeLeft);
        if (timeLeft <= 0) { 
            clearInterval(countdown); 
            sendSystemNotification("タイマー完了", "設定された時間が経過しました。");
            alert('時間になりました。'); 
            endTimerAndRestore(); 
        }
    }, 1000);
}

function stopTimer() { 
    clearInterval(countdown); isRunning = false; startButton.disabled = false; stopButton.disabled = true; 
    inputHours.disabled = inputMinutes.disabled = inputSeconds.disabled = false; 
}
function endTimerAndRestore() {
    isRunning = false; timeLeft = 0; updateDisplayFromSeconds(savedTime);
    startButton.disabled = false; stopButton.disabled = true;
    inputHours.disabled = inputMinutes.disabled = inputSeconds.disabled = false;
}
function resetTimer() { 
    clearInterval(countdown); isRunning = false; timeLeft = 0; savedTime = 0;
    updateDisplayFromSeconds(timeLeft); startButton.disabled = false; stopButton.disabled = true; 
    inputHours.disabled = inputMinutes.disabled = inputSeconds.disabled = false; 
}
startButton.addEventListener('click', startTimer); stopButton.addEventListener('click', stopTimer); resetButton.addEventListener('click', resetTimer);

// ==========================================
// 3. アラーム システム
// ==========================================
const alarmTimeInput = document.getElementById('alarm-time');
const alarmStatus = document.getElementById('alarm-status');
const alarmStartBtn = document.getElementById('alarm-start-btn');
const alarmStopBtn = document.getElementById('alarm-stop-btn');
let targetAlarmTime = null;

const d = new Date();
alarmTimeInput.value = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`;

function startAlarm() {
    if (!alarmTimeInput.value) return;
    targetAlarmTime = alarmTimeInput.value;
    alarmStatus.textContent = `アラーム作動中... [${targetAlarmTime}]`;
    alarmStatus.style.color = "#ff9f00";
    alarmStartBtn.disabled = true; alarmStopBtn.disabled = false; alarmTimeInput.disabled = true;
}
function stopAlarm() {
    targetAlarmTime = null;
    alarmStatus.textContent = "アラーム停止中";
    alarmStatus.style.color = "#aaaaaa";
    alarmStartBtn.disabled = false; alarmStopBtn.disabled = true; alarmTimeInput.disabled = false;
}
function checkAlarm(nowObj) {
    if (!targetAlarmTime) return;
    const curTimeStr = nowObj.toTimeString().split(' ');
    if (curTimeStr[0] === targetAlarmTime || curTimeStr[0].startsWith(targetAlarmTime)) {
        stopAlarm();
        sendSystemNotification("アラーム警告", `設定時刻 [${targetAlarmTime}] になりました。`);
        alert('時間になりました。 (アラーム)');
    }
}
alarmStartBtn.addEventListener('click', startAlarm); alarmStopBtn.addEventListener('click', stopAlarm);

// ==========================================
// 4. ストップウォッチ システム (バグ完全修正)
// ==========================================
const swDisplay = document.getElementById('sw-display');
const swStartBtn = document.getElementById('sw-start-btn');
const swStopBtn = document.getElementById('sw-stop-btn');
const swResetBtn = document.getElementById('sw-reset-btn');
let swInterval, swStartTime = 0, swElapsedTime = 0;

