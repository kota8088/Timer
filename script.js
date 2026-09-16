const inputHours = document.getElementById('input-hours');
const inputMinutes = document.getElementById('input-minutes');
const inputSeconds = document.getElementById('input-seconds');
const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const resetButton = document.getElementById('reset-btn');

let countdown;
let timeLeft = 0;
let isRunning = false;

// キー入力時のリアルタイムチェック（空欄を許可する）
function handleInput(input, max) {
    // 入力された文字をチェック
    let rawValue = input.value;

    // もし完全に空っぽなら、そのまま消せるように何も処理しない
    if (rawValue === '') {
        return;
    }

    let value = parseInt(rawValue, 10);
    
    // マイナス値や数値以外が入ったら0にする
    if (isNaN(value) || value < 0) {
        value = 0;
    }
    
    // 限界値を超えたら最大値に固定する
    if (value > max) {
        value = max;
    }
    
    // ユーザーが打ち込んでいる最中なのでパディング（桁揃え）はせず、純粋な数値を入れる
    input.value = value;
}

// 入力欄からフォーカスが外れた（決定された）ときの最終チェック
function handleBlur(input, max) {
    let value = parseInt(input.value, 10);
    
    // 空欄のまま確定されたら「00」に戻す
    if (isNaN(value) || value < 0) {
        value = 0;
    }
    
    if (value > max) {
        value = max;
    }
    
    // 最終的に2桁の美しいネオン表示（00形式）に整形する
    input.value = String(value).padStart(2, '0');
}

// キー入力されたら即座にチェックをかけるイベント
inputHours.addEventListener('input', () => handleInput(inputHours, 23));
inputMinutes.addEventListener('input', () => handleInput(inputMinutes, 59));
inputSeconds.addEventListener('input', () => handleInput(inputSeconds, 59));

// フォーカスが外れたとき（またはEnterを押したときなど）に「00」形式に補正
inputHours.addEventListener('blur', () => handleBlur(inputHours, 23));
inputMinutes.addEventListener('blur', () => handleBlur(inputMinutes, 59));
inputSeconds.addEventListener('blur', () => handleBlur(inputSeconds, 59));

// 残り秒数から画面の入力欄を更新する関数
function updateDisplayFromSeconds(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    inputHours.value = String(hrs).padStart(2, '0');
    inputMinutes.value = String(mins).padStart(2, '0');
    inputSeconds.value = String(secs).padStart(2, '0');
}

// カウントダウンを開始する関数
function startTimer() {
    if (isRunning) return;

    // 現在入力されている時間を秒に換算（空欄なら0秒として扱う）
    const hrs = parseInt(inputHours.value, 10) || 0;
    const mins = parseInt(inputMinutes.value, 10) || 0;
    const secs = parseInt(inputSeconds.value, 10) || 0;
    
    timeLeft = (hrs * 3600) + (mins * 60) + secs;

    // 0秒ならスタートしない
    if (timeLeft <= 0) return;

    isRunning = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    
    // カウントダウン中は数字を入力できなくする
    setInputDisabled(true);

    // 開始時点で桁が揃っていない入力フィールドを「00」の形に綺麗に整える
    updateDisplayFromSeconds(timeLeft);

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

// カウントダウンを一時停止する関数
function stopTimer() {
    clearInterval(countdown);
    isRunning = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    setInputDisabled(false); // 入力を再開できるようにする
}

// カウントダウンをリセットする関数
function resetTimer() {
    clearInterval(countdown);
    isRunning = false;
    timeLeft = 0; // 初期値（00:00:00）に戻す
    updateDisplayFromSeconds(timeLeft);
    startButton.disabled = false;
    stopButton.disabled = true;
    setInputDisabled(false);
}

// 入力可否を切り替えるヘルパー関数
function setInputDisabled(disabled) {
    inputHours.disabled = disabled;
    inputMinutes.disabled = disabled;
    inputSeconds.disabled = disabled;
}

startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', stopTimer);
resetButton.addEventListener('click', resetTimer);
