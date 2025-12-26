// Intervall Trainer - Schritt 1: Basis-Funktionalität

// Konfiguration (in Sekunden)
const config = {
    warmup: 10 * 60,      // 10 Minuten
    work: 3 * 60,         // 3 Minuten
    rest: 2 * 60,         // 2 Minuten
    intervals: 8,         // 8 Wiederholungen
    cooldown: 10 * 60     // 10 Minuten
};

// Status-Variablen
let currentPhase = 'warmup';
let currentInterval = 0;
let timeRemaining = config.warmup;
let totalTime = 0;
let isRunning = false;
let timerInterval = null;

// DOM-Elemente
const elements = {
    phaseName: document.getElementById('phaseName'),
    timer: document.getElementById('timer'),
    progressFill: document.getElementById('progressFill'),
    workoutInfo: document.getElementById('workoutInfo'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn')
};

/**
 * Gesamtzeit berechnen
 */
function calculateTotalTime() {
    totalTime = config.warmup + 
                (config.work + config.rest) * config.intervals + 
                config.cooldown;
    return totalTime;
}

/**
 * Zeit formatieren (MM:SS)
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Display aktualisieren
 */
function updateDisplay() {
    // Timer
    elements.timer.textContent = formatTime(timeRemaining);
    
    // Phase Name
    const phaseNames = {
        warmup: 'WARM-UP',
        work: 'WORK',
        rest: 'REST',
        cooldown: 'COOL-DOWN',
        finished: 'FERTIG!'
    };
    elements.phaseName.textContent = phaseNames[currentPhase];
    
    // Workout Info
    if (currentPhase === 'work' || currentPhase === 'rest') {
        elements.workoutInfo.textContent = `Intervall ${currentInterval} von ${config.intervals}`;
    } else if (currentPhase === 'warmup') {
        elements.workoutInfo.textContent = 'Aufwärmen';
    } else if (currentPhase === 'cooldown') {
        elements.workoutInfo.textContent = 'Ausfahren';
    } else if (currentPhase === 'finished') {
        elements.workoutInfo.textContent = 'Workout abgeschlossen! 🎉';
    }
    
    // Body-Klasse für Farbwechsel
    document.body.className = currentPhase;
    
    // Progress Bar
    updateProgressBar();
}

/**
 * Progress Bar aktualisieren
 */
function updateProgressBar() {
    const elapsed = totalTime - timeRemaining;
    const progress = (elapsed / totalTime) * 100;
    elements.progressFill.style.width = `${progress}%`;
}

/**
 * Nächste Phase
 */
function nextPhase() {
    // Sound abspielen
    playBeep();
    
    switch(currentPhase) {
        case 'warmup':
            currentPhase = 'work';
            currentInterval = 1;
            timeRemaining = config.work;
            break;
            
        case 'work':
            currentPhase = 'rest';
            timeRemaining = config.rest;
            break;
            
        case 'rest':
            if (currentInterval < config.intervals) {
                currentPhase = 'work';
                currentInterval++;
                timeRemaining = config.work;
            } else {
                currentPhase = 'cooldown';
                timeRemaining = config.cooldown;
            }
            break;
            
        case 'cooldown':
            currentPhase = 'finished';
            timeRemaining = 0;
            stop();
            break;
    }
    
    updateDisplay();
}

/**
 * Timer Tick (jede Sekunde)
 */
function tick() {
    if (timeRemaining > 0) {
        timeRemaining--;
        updateDisplay();
    } else {
        nextPhase();
    }
}

/**
 * Start
 */
function start() {
    if (!isRunning) {
        isRunning = true;
        timerInterval = setInterval(tick, 1000);
        elements.startBtn.style.display = 'none';
        elements.pauseBtn.style.display = 'inline-block';
    }
}

/**
 * Pause
 */
function pause() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        elements.startBtn.style.display = 'inline-block';
        elements.pauseBtn.style.display = 'none';
    }
}

/**
 * Stop (bei Finished)
 */
function stop() {
    isRunning = false;
    clearInterval(timerInterval);
    elements.startBtn.style.display = 'inline-block';
    elements.pauseBtn.style.display = 'none';
}

/**
 * Reset
 */
function reset() {
    // Stoppe Timer
    isRunning = false;
    clearInterval(timerInterval);
    
    // Zurücksetzen
    currentPhase = 'warmup';
    currentInterval = 0;
    timeRemaining = config.warmup;
    
    // Display aktualisieren
    updateDisplay();
    
    // Buttons
    elements.startBtn.style.display = 'inline-block';
    elements.pauseBtn.style.display = 'none';
}

/**
 * Beep Sound (Phasenwechsel)
 */
function playBeep() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

/**
 * Event Listeners
 */
elements.startBtn.addEventListener('click', start);
elements.pauseBtn.addEventListener('click', pause);
elements.resetBtn.addEventListener('click', reset);

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
            pause();
        } else {
            start();
        }
    } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
    }
});

// Initialisierung
calculateTotalTime();
updateDisplay();

console.log('✅ Intervall Trainer geladen');
console.log('⌨️  Shortcuts: Space = Start/Pause, R = Reset');