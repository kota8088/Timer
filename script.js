// 画面のHTMLがすべて読み込まれてから安全に実行する
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 共通：通知機能 (Notification)
    // ==========================================
    const notifyCheckbox = document.getElementById('notification-checkbox');

    if (notifyCheckbox) {
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
    }

    function sendNotification(title, body) {
        if (notifyCheckbox && notifyCheckbox.checked && Notification.permission === 'granted') {
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
            if (clockDisplay) {
                clockDisplay.textContent = formatter.format(now);
            }
        } catch (e) {
            currentZone = "Asia/Tokyo"; // エラー時はデフォルトに戻す
        }
    }

    // 1秒ごとに時計を更新
    setInterval(updateClock, 1000);
    updateClock();

    // 簡易タイムゾーン都市検索辞書
    const tzDictionary = {
        "tokyo": "Asia/Tokyo", "東京": "Asia/Tokyo",
        "london": "Europe/London", "ロンドン": "Europe/London",
        "new york": "America/New_York", "ニューヨーク": "America/New_York",
        "los angeles": "America/Los_Angeles", "ロサンゼルス": "America/Los_Angeles",
        "paris": "Europe/Paris", "パリ": "Europe/Paris",
        "singapore": "Asia/Singapore", "シンガポール": "Asia/Singapore",
        "sydney": "Australia/Sydney", "シドニー": "Australia/Sydney"
    };

    if (searchBtn && timezoneInput && timezoneLabel) {
        searchBtn.addEventListener('click', () => {
            const query = timezoneInput.value.trim().toLowerCase();
            if (!query) return;

            if (tzDictionary[query]) {
                currentZone = tzDictionary[query];
                timezoneLabel.textContent = `現在の場所: ${currentZone}`;
            } else {
                try {
                    new Intl.DateTimeFormat('ja-JP', { timeZone: query });
                    currentZone = query;
                    timezoneLabel.textContent = `現在の場所: ${currentZone}`;
                } catch (e) {
                    alert("都市が見つかりません。対応ワード: Tokyo, London, New York, Paris など");
                }
            }
            updateClock();
        });
    }

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
        if (!tMinInput || !tSecInput) return 0;
        const m = parseInt(tMinInput.value) || 0;
        const s = parseInt(tSecInput.value) || 0;
        return (m * 60) + s;
    }

    function updateTimerDisplay(seconds) {
        if (!tDisplay) return;
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        tDisplay.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    if (tStartBtn && tStopBtn) {
        tStartBtn.addEventListener('click', () => {
            if (timerId !== null) return;
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
                    timerLeft = getSelectedTimerSeconds();
                    updateTimerDisplay(timerLeft);
                }
            }, 1000);
        });

        tStopBtn.addEventListener('click', () => {
            clearInterval(timerId);
            timerId = null;
            timerLeft = getSelectedTimerSeconds();
            updateTimerDisplay(timerLeft);
        });
    }

    if (tMinInput && tSecInput) {
        [tMinInput, tSecInput].forEach(input => {
            input.addEventListener('input', () => {
                if (timerId === null) {
                    timerLeft = getSelectedTimerSeconds();
                    updateTimerDisplay(timerLeft);
                }
            });
        });
    }

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
        if (!swDisplay) return "";
        const totalMs = swElapsed + (swId ? Date.now() - swStartTime : 0);
        const min = Math.floor(totalMs / 60000);
        const sec = Math.floor((totalMs % 60000) / 1000);
        const ms = Math.floor((totalMs % 1000) / 10);
        swDisplay.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
        return swDisplay.textContent;
    }

    if (swToggleBtn && swLapBtn && swResetBtn && lapList) {
        swToggleBtn.addEventListener('click', () => {
            if (swId === null) {
                swStartTime = Date.now();
                swId = setInterval(updateSwDisplay, 10);
                swToggleBtn.textContent = "ストップ";
                swToggleBtn.style.borderColor = "#ff3333";
                swLapBtn.disabled = false;
            } else {
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
            lapList.insertBefore(li, lapList.firstChild);
        });

        swResetBtn.addEventListener('click', () => {
            clearInterval(swId);
            swId = null;
            swElapsed = 0;
            lapCount = 0;
            swToggleBtn.textContent = "スタート";
            swToggleBtn.style.borderColor = "#ff007f";
            swLapBtn.disabled = true;
            if (swDisplay) swDisplay.textContent = "00:00.00";
            lapList.innerHTML = "";
        });
    }

    // ==========================================
    // 4. アラーム
    // ==========================================
    let alarmTimeValue = null;
    const alarmInput = document.getElementById('alarm-time');
    const alarmStatus = document.getElementById('alarm-status');
    const alarmSetBtn = document.getElementById('alarm-set');
    const alarmClearBtn = document.getElementById('alarm-clear');

    if (alarmSetBtn && alarmClearBtn && alarmInput && alarmStatus) {
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
    }

    setInterval(() => {
        if (!alarmTimeValue || !alarmStatus) return;
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
    let isWorkPhase = true;
    let currentRound = 1;

    const pWorkInput = document.getElementById('pomo-work');
