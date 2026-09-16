// 世界時計の要素
const clockDisplay = document.getElementById('clock-display');
const clockLocation = document.getElementById('clock-location');
const citySearch = document.getElementById('city-search');
const timezoneList = document.getElementById('timezone-list');

// タイマーの要素
const inputHours = document.getElementById('input-hours');
const inputMinutes = document.getElementById('input-minutes');
const inputSeconds = document.getElementById('input-seconds');
const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const resetButton = document.getElementById('reset-btn');

let countdown;
let timeLeft = 0;
let isRunning = false;
let currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // 初期値はユーザーの現在地

// ==========================================
// 1. 世界時計システム
// ==========================================

function initClockSearch() {
    const timeZones = Intl.supportedValuesOf('timeZone');
    timeZones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone;
        timezoneList.appendChild(option);
    });
}

function updateClock() {
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('ja-JP', {
            timeZone: currentTimeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        clockDisplay.textContent = formatter.format(now);
    } catch (e) {
        clockLocation.textContent = "INVALID ZONE - SELECT FROM LIST";
    }
}

citySearch.addEventListener('change', () => {
    const selectedZone = citySearch.value.trim();
    if (Intl.supportedValuesOf('timeZone').includes(selectedZone)) {
        currentTimeZone = selectedZone;
        clockLocation.textContent = selectedZone;
        updateClock();
        citySearch.value = "";
        citySearch.blur();
    }
});

setInterval(updateClock, 1000);
initClockSearch();
updateClock();


// ==========================================
// 2. タイマーシステム
// ==========================================

function handleInput(input, max) {
    let rawValue = input.value;
    if (rawValue === '') return;

    let value = parseInt(rawValue, 10);
    if (isNaN(value) || value < 0) value = 0;
    if (value > max) value = max;
    input.value = value;
}

function handleBlur(input, max) {
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    if (value > max) value = max;
    input.value = String(value).padStart(2, '0');
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

    isRunning = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    setInputDisabled(true);
    updateDisplayFromSeconds(timeLeft);

    countdown = setInterval(() => {
        timeLeft--;
        updateDisplayFromSeconds(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(countdown);
            
            // アラートのテキストを「時間になりました。」に変更
            alert('時間になりました。');
            
            resetTimer();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(countdown);
    isRunning = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    setInputDisabled(false);
}

function resetTimer() {
    clearInterval(countdown);
    isRunning = false;
    timeLeft = 0;
    updateDisplayFromSeconds(timeLeft);
    startButton.disabled = false;
    stopButton.disabled = true;
    setInputDisabled(false);
}

function setInputDisabled(disabled) {
    inputHours.disabled = disabled;
    inputMinutes.disabled = disabled;
    inputSeconds.disabled = disabled;
}

startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', stopTimer);
resetButton.addEventListener('click', resetTimer);
