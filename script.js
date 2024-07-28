let timer;
let isRunning = false;
let startTime;
let elapsedTime = 0;
let laps = [];
let lapCount = 0;
let targetSum = 0;

const display = document.getElementById('display');
const startStopBtn = document.getElementById('startStopBtn');
const lapResetBtn = document.getElementById('lapResetBtn');
const lapsContainer = document.getElementById('laps');

function formatTime(time) {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const centiseconds = Math.floor((time % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${centiseconds.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    display.textContent = formatTime(elapsedTime);
}

function startStop() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startStopBtn.textContent = 'Avvia';
        startStopBtn.classList.remove('stop');
        lapResetBtn.textContent = 'Azzera';
        checkSum();
        console.log(`Timer fermato. Somma target attuale: ${targetSum}`);
    } else {
        startTime = Date.now() - elapsedTime;
        timer = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 10);
        isRunning = true;
        startStopBtn.textContent = 'Stop';
        startStopBtn.classList.add('stop');
        lapResetBtn.textContent = 'Giro';
    }
}

function lapReset() {
    if (isRunning) {
        const lapTime = elapsedTime;
        laps.push(lapTime);
        lapCount++;
        const lapElement = document.createElement('div');
        lapElement.classList.add('lap');
        lapElement.innerHTML = `<span>Giro ${lapCount}</span><span>${formatTime(lapTime)}</span>`;
        lapsContainer.insertBefore(lapElement, lapsContainer.firstChild);
    } else {
        elapsedTime = 0;
        laps = [];
        lapCount = 0;
        updateDisplay();
        lapsContainer.innerHTML = '';
    }
}

function getRandomTargetSum() {
    const values = [11, 14, 17, 20];
    return values[Math.floor(Math.random() * values.length)];
}

function checkSum() {
    targetSum = getRandomTargetSum();
    console.log(`Nuovo valore target selezionato: ${targetSum}`);

    const timeString = formatTime(elapsedTime);
    const digits = timeString.replace(/[:.,]/g, '').split('').map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    
    if (sum !== targetSum) {
        const difference = targetSum - sum;
        elapsedTime += difference * 10;
        updateDisplay();
    }

    console.log(`Somma corrente: ${sum}, Somma target: ${targetSum}`);
}

startStopBtn.addEventListener('click', startStop);
lapResetBtn.addEventListener('click', lapReset);

updateDisplay();
