// ===== STATE =====
let isRunning = false;
let startTime = 0;
let elapsedTime = 0;
let animationFrame;
let tapCount = 0;
let tapTimeout;
let stopCount = 0;
let targetDigits = [];
let birthDates = [];
let currentSlot = 0;
let magicMode = false; // false = sum logic, true = birthday logic
let leftBtnTapCount = 0;
let leftBtnTapTimeout;
let targetSum = 0;

// ===== ELEMENTS =====
const timerDisplay = document.getElementById('timerDisplay');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const secretZone = document.getElementById('secretZone');
const slotZone = document.getElementById('slotZone');
const timerZone = document.getElementById('timerZone');
const secretMenu = document.getElementById('secretMenu');
const dot1 = document.getElementById('dot1');
const slotsContainer = document.getElementById('slotsContainer');
const addSlotBtn = document.getElementById('addSlotBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

// ===== TIMER FUNCTIONS =====
function formatTime(ms) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const c = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(c).padStart(2, '0')}`;
}

function formatTimeMagic(ms, pair) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${pair}`;
}

function updateTimer() {
    if (isRunning) {
        elapsedTime = Date.now() - startTime;
        timerDisplay.textContent = formatTime(elapsedTime);
        animationFrame = requestAnimationFrame(updateTimer);
    }
}

function toggleTimer() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        rightBtn.textContent = 'Interrompi';
        rightBtn.classList.add('running');
        leftBtn.textContent = 'Giro';
        leftBtn.classList.remove('active');
        updateTimer();
    } else {
        isRunning = false;
        cancelAnimationFrame(animationFrame);
        rightBtn.textContent = 'Avvia';
        rightBtn.classList.remove('running');
        leftBtn.textContent = 'Azzera';
        leftBtn.classList.add('active');

        // Choose logic based on magic mode
        if (magicMode) {
            // BIRTHDAY LOGIC - show target digits
            if (stopCount < 3 && targetDigits.length > 0) {
                timerDisplay.textContent = formatTimeMagic(elapsedTime, targetDigits[stopCount]);
                stopCount++;
            }
        } else {
            // SUM LOGIC - adjust time so digits sum to target
            checkSum();
        }
    }
}

function resetTimer() {
    if (!isRunning) {
        if (elapsedTime > 0) {
            elapsedTime = 0;
            stopCount = 0;
            timerDisplay.textContent = '00:00,00';
            leftBtn.textContent = 'Giro';
            leftBtn.classList.remove('active');
            prepareMagicDigits();
        }
    }
}

// ===== MAGIC FUNCTIONS =====
function prepareMagicDigits() {
    if (birthDates.length === 0 || currentSlot >= birthDates.length) return;
    
    const b = birthDates[currentSlot];
    targetDigits = [
        String(b.day).padStart(2, '0'),
        String(b.month).padStart(2, '0'),
        String(b.year).padStart(2, '0')
    ];
    stopCount = 0;
}

function flashDotNTimes(n) {
    let count = 0;
    function flash() {
        if (count >= n) {
            dot1.classList.add('left');
            return;
        }
        dot1.classList.remove('left');
        setTimeout(() => {
            dot1.classList.add('left');
            count++;
            if (count < n) setTimeout(flash, 100);
        }, 100);
    }
    flash();
}

function toggleMagicMode() {
    magicMode = !magicMode;
    flashDotNTimes(magicMode ? 1 : 2);
    saveToStorage();
}

// ===== SUM LOGIC (when magic mode is OFF) =====
function getRandomTargetSum() {
    // Values: 5, 8, 11, 14, 17, 20, 23, 26, 29, 32
    // Starting from 5, incrementing by 3
    const values = [];
    for (let i = 5; i <= 32; i += 3) {
        values.push(i);
    }
    return values[Math.floor(Math.random() * values.length)];
}

function checkSum() {
    targetSum = getRandomTargetSum();
    
    const timeString = formatTime(elapsedTime);
    const digits = timeString.replace(/[,:]/g, '').split('').map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    
    if (sum !== targetSum) {
        const difference = targetSum - sum;
        elapsedTime += difference * 10;
        timerDisplay.textContent = formatTime(elapsedTime);
    }
    
    console.log(`Sum logic: current=${sum}, target=${targetSum}, adjusted time`);
}

// ===== STORAGE =====
function saveToStorage() {
    localStorage.setItem('cronometroMagico', JSON.stringify({
        birthDates,
        currentSlot,
        magicMode
    }));
}

function loadFromStorage() {
    const saved = localStorage.getItem('cronometroMagico');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.birthDates && Array.isArray(data.birthDates)) {
                birthDates = data.birthDates;
            }
            if (typeof data.currentSlot === 'number' && data.currentSlot >= 0) {
                currentSlot = data.currentSlot;
            }
            if (typeof data.magicMode === 'boolean') {
                magicMode = data.magicMode;
            }
            prepareMagicDigits();
        } catch (e) {
            console.error('Error loading:', e);
        }
    }
}

// ===== SLOTS MANAGEMENT =====
function renderSlots() {
    slotsContainer.innerHTML = '';
    
    birthDates.forEach((slot, index) => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'slot-section';
        slotDiv.innerHTML = `
            <div class="slot-header">
                <span>Slot ${index + 1}</span>
                ${birthDates.length > 1 ? `<button class="delete-slot" onclick="deleteSlot(${index})">Elimina</button>` : ''}
            </div>
            <input type="text" class="name-input" data-slot="${index}" data-field="name" 
                   placeholder="Nome..." maxlength="20" value="${slot.name || ''}">
            <div class="date-inputs">
                <div class="date-group">
                    <div class="date-label">Cifra 1</div>
                    <input type="number" class="date-input" data-slot="${index}" data-field="day" 
                           placeholder="00" value="${slot.day || ''}">
                </div>
                <div class="date-group">
                    <div class="date-label">Cifra 2</div>
                    <input type="number" class="date-input" data-slot="${index}" data-field="month" 
                           placeholder="00" value="${slot.month || ''}">
                </div>
                <div class="date-group">
                    <div class="date-label">Cifra 3</div>
                    <input type="number" class="date-input" data-slot="${index}" data-field="year" 
                           placeholder="00" value="${slot.year || ''}">
                </div>
            </div>
        `;
        slotsContainer.appendChild(slotDiv);
    });

    // Add input listeners
    document.querySelectorAll('.date-input').forEach(input => {
        input.addEventListener('input', e => {
            if (e.target.value.length > 2) {
                e.target.value = e.target.value.slice(0, 2);
            }
        });
    });
}

function addSlot() {
    birthDates.push({ day: '', month: '', year: '', name: '' });
    renderSlots();
}

function deleteSlot(index) {
    if (confirm(`Eliminare Slot ${index + 1}?`)) {
        birthDates.splice(index, 1);
        if (currentSlot >= birthDates.length) {
            currentSlot = Math.max(0, birthDates.length - 1);
        }
        renderSlots();
    }
}

// ===== SECRET ZONE (triple tap) =====
secretZone.addEventListener('click', () => {
    tapCount++;
    clearTimeout(tapTimeout);
    
    if (tapCount === 3) {
        renderSlots();
        secretMenu.classList.add('show');
        tapCount = 0;
    } else {
        tapTimeout = setTimeout(() => tapCount = 0, 1000);
    }
});

// ===== SLOT SELECTION (cyclic tap) =====
slotZone.addEventListener('click', () => {
    if (birthDates.length === 0) return;
    
    currentSlot = (currentSlot + 1) % birthDates.length;
    flashDotNTimes(currentSlot + 1);
    prepareMagicDigits();
    saveToStorage();
});

// ===== MAGIC MODE TOGGLE (Timer icon - single tap) =====
timerZone.addEventListener('click', () => {
    toggleMagicMode();
});

// ===== SAVE =====
saveBtn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('[data-slot]');
    const tempData = birthDates.map(slot => ({ ...slot }));
    
    inputs.forEach(input => {
        const slotIndex = parseInt(input.dataset.slot);
        const field = input.dataset.field;
        
        if (field === 'name') {
            tempData[slotIndex].name = input.value.trim();
        } else {
            const val = parseInt(input.value);
            if (!isNaN(val)) {
                tempData[slotIndex][field] = val;
            }
        }
    });

    // Validate - only check if fields are filled and are 2 digits
    for (let i = 0; i < tempData.length; i++) {
        const d = tempData[i];
        if (d.day === undefined || d.day === '' || d.month === undefined || d.month === '' || d.year === undefined || d.year === '') {
            alert(`Slot ${i + 1}: Compila tutti i campi`);
            return;
        }
        // Accept any number 0-99
        if (d.day < 0 || d.day > 99 || d.month < 0 || d.month > 99 || d.year < 0 || d.year > 99) {
            alert(`Slot ${i + 1}: Usa numeri da 00 a 99`);
            return;
        }
    }

    birthDates = tempData;
    prepareMagicDigits();
    saveToStorage();
    secretMenu.classList.remove('show');
});

// ===== CANCEL =====
cancelBtn.addEventListener('click', () => {
    secretMenu.classList.remove('show');
});

// ===== ADD SLOT =====
addSlotBtn.addEventListener('click', addSlot);

// ===== BUTTON EVENTS =====
rightBtn.addEventListener('click', toggleTimer);
leftBtn.addEventListener('click', resetTimer);

// ===== INITIALIZE =====
loadFromStorage();
if (birthDates.length === 0) {
    birthDates.push({ day: 15, month: 8, year: 95, name: '' });
}
prepareMagicDigits();