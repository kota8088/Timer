// ==========================================
// 0. モードパネル切り替え制御システム
// ==========================================
const navButtons = {
    clock: document.getElementById('nav-clock'),
    alarm: document.getElementById('nav-alarm'),
    sw: document.getElementById('nav-sw'),
    pomodoro: document.getElementById('nav-pomodoro')
};
const panels = {
    clock: document.getElementById('panel-clock'),
    alarm: document.getElementById('panel-alarm'),
    sw: document.getElementById('panel-sw'),
    pomodoro: document.getElementById('panel-pomodoro')
};

function switchMode(modeName) {
    Object.keys(navButtons).forEach(key => {
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
    const hrs = parseInt(inputHours.value, 10) || 0;
    const mins = parseInt(inputMinutes.value, 10) || 0;
    const secs = parseInt(inputSeconds.value, 10) || 0;
    timeLeft = (hrs * 3600) + (mins * 60) + secs;
    if (timeLeft <= 0) return;
    isRunning = true; startButton.disabled = true; stopButton.disabled = false;
    inputHours.disabled = inputMinutes.disabled = inputSeconds.disabled = true;
    updateDisplayFromSeconds(timeLeft);
    countdown = setInterval(() => {
        timeLeft--; updateDisplayFromSeconds(timeLeft);
        if (timeLeft <= 0) { clearInterval(countdown); alert('時間になりました。'); resetTimer(); }
    }, 1000);
}
function stopTimer() { clearInterval(countdown); isRunning = false; startButton.disabled = false; stopButton.disabled = true; inputHours.disabled = inputMinutes.disabled = inputSeconds.disabled = false; }
function resetTimer() { clearInterval(countdown); isRunning = false; timeLeft = 0; updateDisplayFromSeconds(timeLeft); startButton.disabled = false; stopButton.disabled = true; inputHours.disabled = inputMinutes.disabled = inputSeconds.disabled = false; }
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
    const curTimeStr = nowObj.toTimeString().split(' ')[0];
    if (curTimeStr === targetAlarmTime || curTimeStr.startsWith(targetAlarmTime)) {
        stopAlarm();
        alert('時間になりました。 (アラーム)');
    }
}
alarmStartBtn.addEventListener('click', startAlarm); alarmStopBtn.addEventListener('click', stopAlarm);

// ==========================================
// 4. ストップウォッチ システム
// ==========================================
const swDisplay = document.getElementById('sw-display');
const swStartBtn = document.getElementById('sw-start-btn');
const swStopBtn = document.getElementById('sw-stop-btn');
const swResetBtn = document.getElementById('sw-reset-btn');
let swInterval, swStartTime = 0, swElapsedTime = 0;

function updateSWDisplay() {
    const totalMs = swElapsedTime + (swStartTime ? Date.now() - swStartTime : 0);
    const hrs = Math.floor(totalMs / 3600000);
    const mins = Math.floor((totalMs % 3600000) / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);
    swDisplay.innerHTML = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}<span class="sw-ms">.${String(ms).padStart(2,'0')}</span>`;
}
swStartBtn.addEventListener('click', () => {
    swStartTime = Date.now(); swInterval = setInterval(updateSWDisplay, 10);
    swStartBtn.disabled = true; swStopBtn.disabled = false; swResetBtn.disabled = true;
});
swStopBtn.addEventListener('click', () => {
    clearInterval(swInterval); swElapsedTime += Date.now() - swStartTime; swStartTime = 0;
    swStartBtn.disabled = false; swStopBtn.disabled = true; swResetBtn.disabled = false;
});
swResetBtn.addEventListener('click', () => {
    clearInterval(swInterval); swStartTime = 0; swElapsedTime = 0;
    swDisplay.innerHTML = `00:00:00<span class="sw-ms">.00</span>`;
    swStartBtn.disabled = false; swStopBtn.disabled = true; swResetBtn.disabled = true;
});

// ==========================================
// 5. 自動連動ポモドーロシステム（可変セット数対応）
// ==========================================
const pomoWorkInput = document.getElementById('pomo-work-input');
const pomoBreakInput = document.getElementById('pomo-break-input');
const pomoMaxInput = document.getElementById('pomo-max-input'); // 【追加】
const pomoPhase = document.getElementById('pomo-phase');
const pomoDisplay = document.getElementById('pomo-display');
const pomoRound = document.getElementById('pomo-round');
const pomoStartBtn = document.getElementById('pomo-start-btn');
const pomoStopBtn = document.getElementById('pomo-stop-btn');
const pomoResetBtn = document.getElementById('pomo-reset-btn');

let pomoInterval, pomoTimeLeft = 0, pomoIsRunning = false;
let pomoCurrentRound = 1, pomoState = "WORK";

function getPomoMaxRounds() {
    let val = parseInt(pomoMaxInput.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    return val;
}

