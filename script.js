const inputHours = document.getElementById('input-hours');
const inputMinutes = document.getElementById('input-minutes');
const inputSeconds = document.getElementById('input-seconds');
const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const resetButton = document.getElementById('reset-btn');

let countdown;
let timeLeft = 0;
let isRunning = false;

// 入力値を制限・補正する関数
function validateInput(input, max) {
    let value = parseInt(input.value, 10);
    
    if (isNaN(value) || value < 0) {
        value = 0;
    }
    
    if (value > max) {
        value = max;
    }
    
    input.value = String(value).padStart(2, '0');
}

inputHours.addEventListener('input', () => validateInput(inputHours, 23));
inputMinutes.addEventListener('input', () => validateInput(inputMinutes, 59));
inputSeconds.addEventListener('input', () => validateInput(inputSeconds, 59));

inputHours.addEventListener('blur', () => validateInput(inputHours, 23));
inputMinutes.addEventListener('blur', () => validateInput(inputMinutes, 59));
inputSeconds.addEventListener('blur', () => validateInput(inputSeconds, 59));

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

    countdown = setInterval(() => {
        timeLeft--;
        updateDisplayFromSeconds(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(countdown);
            alert('［SYSTEM WARNING］\n作戦時間が終了しました。これより帰還します。');
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

// リセット時の初期値を 0 秒（00:00:00）に変更
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
