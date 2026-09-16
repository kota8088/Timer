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
            if (navButtons[key]) navButtons[key].classList.add('active');
            if (panels[key]) panels[key].classList.add('active');
        } else {
            if (navButtons[key]) navButtons[key].classList.remove('active');
            if (panels[key]) panels[key].classList.remove('active');
        }
    });
}
if (navButtons.clock) navButtons.clock.addEventListener('click', () => switchMode('clock'));
if (navButtons.alarm) navButtons.alarm.addEventListener('click', () => switchMode('alarm'));
if (navButtons.sw) navButtons.sw.addEventListener('click', () => switchMode('sw'));
if (navButtons.pomodoro) navButtons.pomodoro.addEventListener('click', () => switchMode('pomodoro'));

// ==========================================
// デスクトップ通知制御システム（自動復元対応）
// ==========================================
let isNotificationEnabled = false;

function sendSystemNotification(title, message) {
    if (isNotificationEnabled && Notification.permission === "granted") {
        try {
            new Notification(title, {
                body: message,
                icon: "https://flaticon.com"
            });
        } catch (e) {}
    }
}

function updateNotificationButtonUI() {
    if (!navButtons.notification) return;
    if (isNotificationEnabled && Notification.permission === "granted") {
        navButtons.notification.textContent = "🔔 ON";
        navButtons.notification.classList.remove('disabled');
        navButtons.notification.classList.add('enabled');
    } else {
        isNotificationEnabled = false;
        navButtons.notification.textContent = "🔕 OFF";
        navButtons.notification.classList.remove('enabled');
        navButtons.notification.classList.add('disabled');
    }
}

if (navButtons.notification) {
    navButtons.notification.addEventListener('click', () => {
        if (!("Notification" in window)) {
            alert("このブラウザはシステム通知に対応していません。");
            return;
        }

        if (isNotificationEnabled) {
            isNotificationEnabled = false;
            localStorage.setItem('timer_notify_enabled', 'false');
            updateNotificationButtonUI();
        } else {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    isNotificationEnabled = true;
                    localStorage.setItem('timer_notify_enabled', 'true');
                    updateNotificationButtonUI();
                    sendSystemNotification("通知システム起動", "タイマー終了時のシステム通知が有効化されました。");
                } else {
                    alert("ブラウザの通知設定が拒否されています。設定から許可してください。");
                }
            });
        }
    });
}

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
    if (!timezoneList) return;
    try {
        Intl.supportedValuesOf('timeZone').forEach(zone => {
            const option = document.createElement('option');
            option.value = zone;
            timezoneList.appendChild(option);
        });
    } catch (e) {}
}
function updateClock() {
    if (!clockDisplay) return;
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('ja-JP', {
            timeZone: currentTimeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        clockDisplay.textContent = formatter.format(now);
        checkAlarm(now);
    } catch (e) {}
}
if (citySearch) {
    citySearch.addEventListener('change', () => {
        const selectedZone = citySearch.value.trim();
        if (Intl.supportedValuesOf('timeZone').includes(selectedZone)) {
            currentTimeZone = selectedZone;
            if (clockLocation) clockLocation.textContent = (selectedZone === getLocalTimeZone()) ? `${selectedZone} (現在地)` : selectedZone;
            updateClock();
            citySearch.value = ""; citySearch.blur();
        }
    });
}
if (currentLocationBtn) {
    currentLocationBtn.addEventListener('click', () => {
        currentTimeZone = getLocalTimeZone();
        if (clockLocation) clockLocation.textContent = `${currentTimeZone} (現在地)`;
        updateClock();
    });
}
setInterval(updateClock, 1000);
initClockSearch(); updateClock();

// ==========================================
// 2. タイマーシステム（記憶機能付き）
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
    if (!input) return;
    let r = input.value; if (r === '') return;
    let v = parseInt(r, 10); if (isNaN(v) || v < 0) v = 0; if (v > max) v = max;
    input.value = v;
    saveTimerInputs();
}
function handleBlur(input, max) {
    if (!input) return;
    let v = parseInt(input.value, 10); if (isNaN(v) || v < 0) v = 0; if (v > max) v = max;
    input.value = String(v).padStart(2, '0');
    saveTimerInputs();
}

function saveTimerInputs() {
    if (!inputHours || !inputMinutes || !inputSeconds) return;
    localStorage.setItem('timer_saved_hours', inputHours.value);
    localStorage.setItem('timer_saved_minutes', inputMinutes.value);
    localStorage.setItem('timer_saved_seconds', inputSeconds.value);
}

if (inputHours) {
    inputHours.addEventListener('input', () => handleInput(inputHours, 23));
    inputHours.addEventListener('blur', () => handleBlur(inputHours, 23));
}
if (inputMinutes) {
    inputMinutes.addEventListener('input', () => handleInput(inputMinutes, 59));
    inputMinutes.addEventListener('blur', () => handleBlur(inputMinutes, 59));
}
if (inputSeconds) {
    inputSeconds.addEventListener('input', () => handleInput(inputSeconds, 59));
    inputSeconds.addEventListener('blur', () => handleBlur(inputSeconds, 59));
}

function updateDisplayFromSeconds(totalSeconds) {
    if (!inputHours || !inputMinutes || !inputSeconds) return;
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    inputHours.value = String(hrs).padStart(2, '0');
    inputMinutes.value = String(mins).padStart(2, '0');
    inputSeconds.value = String(secs).padStart(2, '0');
}

function startTimer() {
    if (isRunning) return;
    if (timeLeft <= 0 && inputHours && inputMinutes && inputSeconds) {
        const hrs = parseInt(inputHours.value, 10) || 0;
        const mins = parseInt(inputMinutes.value, 10) || 0;
        const secs = parseInt(inputSeconds.value, 10) || 0;
        timeLeft = (hrs * 3600) + (mins * 60) + secs;
        savedTime = timeLeft;
    }
    if (timeLeft <= 0) return;

    isRunning = true; 
    if (startButton) startButton.disabled = true; 
    if (stopButton) stopButton.disabled = false;
    if (inputHours) inputHours.disabled = true;
    if (inputMinutes) inputMinutes.disabled = true;
    if (inputSeconds) inputSeconds.disabled = true;
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
    clearInterval(countdown); isRunning = false; 
    if (startButton) startButton.disabled = false; 
    if (stopButton) stopButton.disabled = true; 
    if (inputHours) inputHours.disabled = false;
    if (inputMinutes) inputMinutes.disabled = false;
    if (inputSeconds) inputSeconds.disabled = false;
    saveTimerInputs();
}
function endTimerAndRestore() {
    isRunning = false; timeLeft = 0; updateDisplayFromSeconds(savedTime);
    if (startButton) startButton.disabled = false; 
    if (stopButton) stopButton.disabled = true;
    if (inputHours) inputHours.disabled = false;
    if (inputMinutes) inputMinutes.disabled = false;
    if (inputSeconds) inputSeconds.disabled = false;
    saveTimerInputs();
}
function resetTimer() { 
    clearInterval(countdown); isRunning = false; timeLeft = 0; savedTime = 0;
    updateDisplayFromSeconds(timeLeft); 
    if (startButton) startButton.disabled = false; 
    if (stopButton) stopButton.disabled = true; 
    if (inputHours) inputHours.disabled = false;
    if (inputMinutes) inputMinutes.disabled = false;
