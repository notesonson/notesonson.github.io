// To be cleaned up or rewritten

const semitone = Math.pow(2, 1 / 12);
const semitoneSquared = semitone * semitone;
const cent = Math.pow(semitone, 1 / 100);
const pitchInput = document.getElementById("pitch-input");
const transpositionInput = document.getElementById("transposition-input");
const scordaturaInputs = document.querySelectorAll(".scordatura-input");
const scordaturaLoaders = document.querySelectorAll(".scordatura-loader");
const centInputs = document.querySelectorAll(".cent-input");
const targetSection = document.getElementById("tone-generator");
const resetButton = document.getElementById("reset-button");
const stopButton = document.getElementById("stop-button");
const toneButtons = document.querySelectorAll(".tone-button");
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let currentOscillator = null;
let currentButton = null;
let pitch = 440;
let transposition = 0;
let wakeLock = null;

function getFrequencyFromInput(inputElement) {
  const baseFrequency =
    inputElement.id === "pitch-input"
      ? pitch
      : pitch / Math.pow(semitone, [2, 0, 5, 9, 14][parseInt(inputElement.id.replace("course", "").replace("-tone-button", "")) - 1]);
  const exponent = parseFloat(inputElement.value) + transposition;
  const centsInputElement = document.getElementById(inputElement.id.replace("-scordatura-input", "-cent-input"));
  const cents = parseFloat(centsInputElement.value);
  const centsMultiplier = Math.pow(cent, cents);
  return baseFrequency * Math.pow(semitone, exponent) * centsMultiplier;
}

function updateTone() {
  if (currentButton) {
    let frequency;
    if (currentButton.id === "pitch-tone-button") {
      frequency = pitch;
    } else {
      const inputElement = document.getElementById(currentButton.id.replace("-tone-button", "-scordatura-input"));
      frequency = getFrequencyFromInput(inputElement);
    }
    currentOscillator.frequency.value = frequency;
  }
}

function updatePitch() {
  pitch = parseFloat(pitchInput.value);
  updateTone();
}

function updateTransposition() {
  transposition = parseInt(transpositionInput.value);
  updateTone();
}

function updateCourse() {
  if (currentButton && currentButton.id === this.id.replace("-scordatura-input", "-tone-button")) {
    const frequency = getFrequencyFromInput(this);
    currentOscillator.frequency.value = frequency;
  }
  updateTone();
}

function requestWakeLock() {
  return navigator.wakeLock.request("screen");
}

function releaseWakeLock(wakeLock) {
  if (wakeLock) {
    wakeLock.release();
  }
}

function toggleButtonStyle() {
  toneButtons.forEach(function (buttonElement) {
    if (buttonElement !== currentButton) {
      buttonElement.style.color = "";
    } else {
      buttonElement.style.color = "var(--active-color)";
    }
  });
}

function stopTone() {
  if (currentOscillator !== null) {
    currentOscillator.stop();
    currentOscillator.disconnect();
    currentOscillator = null;
    currentButton = null;
    releaseWakeLock();
    toggleButtonStyle();
  }
}

function startTone(frequency, toneButton) {
  stopTone();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = frequency;
  gainNode.gain.value = 0.15;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  toneButton.dataset.playing = "true";
  currentOscillator = oscillator;
  currentButton = toneButton;
  requestWakeLock();
  toggleButtonStyle();
}

function initializeToneButtons() {
  toneButtons.forEach(function (toneButton) {
    toneButton.addEventListener("click", function (event) {
      event.preventDefault();
      if (currentOscillator !== null && toneButton === currentButton) {
        stopTone();
      } else {
        const inputElement = document.getElementById(toneButton.id.replace("-tone-button", "-scordatura-input"));
        let frequency;
        if (toneButton.id === "pitch-tone-button") {
          frequency = pitch;
        } else {
          frequency = getFrequencyFromInput(inputElement);
        }
        startTone(frequency, toneButton);
        toggleButtonStyle();
      }
    });
  });
}

function initializeScordaturaInputs() {
  scordaturaInputs.forEach(function (inputElement) {
    inputElement.addEventListener("input", updateCourse);
    inputElement.value = 0;
  });

  scordaturaLoaders.forEach(function (element) {
    element.addEventListener("click", function (event) {
      event.preventDefault();
      transpositionInput.value = 0;
      const scordaturaData = element.getAttribute("data-scordatura").split(",");
      scordaturaData.forEach(function (value, index) {
        const inputElement = document.getElementById(`course${5 - index}-scordatura-input`);
        inputElement.value = value;
      });
      centInputs.forEach(function (inputElement) {
        inputElement.value = 0;
      });
      targetSection.scrollIntoView();
      updateTransposition();
      updateTone();
    });
  });
}

function initializeCentInputs() {
  centInputs.forEach(function (inputElement) {
    inputElement.addEventListener("input", updateTone);
    inputElement.value = 0;
  });
}

resetButton.addEventListener("click", function (event) {
  event.preventDefault();
  pitchInput.value = 440;
  transpositionInput.value = 0;
  scordaturaInputs.forEach(function (inputElement) {
    inputElement.value = 0;
  });
  centInputs.forEach(function (inputElement) {
    inputElement.value = 0;
  });
  updatePitch();
  updateTransposition();
  toggleButtonStyle();
});

stopButton.addEventListener("click", function (event) {
  event.preventDefault();
  stopTone();
  toggleButtonStyle();
});

pitchInput.addEventListener("input", updatePitch);
transpositionInput.addEventListener("input", updateTransposition);
pitchInput.value = pitch;
transpositionInput.value = transposition;

updateTone();
initializeToneButtons();
initializeScordaturaInputs();
initializeCentInputs();