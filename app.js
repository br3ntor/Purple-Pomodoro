// All caps const convention is kinda weird
const CLOCK = document.getElementById('clock');
const START_TIMER = document.getElementById('startTime');
const STOP_TIMER = document.getElementById('stopTime');
const RESET_TIMER = document.getElementById('resetTime');
const POM_SLIDER = document.getElementById('pom_range');
const SHORT_SLIDER = document.getElementById('short_range');
const LONG_SLIDER = document.getElementById('long_range');
const POM_LENGTH = document.getElementById('set_pom');
const SHORT_LENGTH = document.getElementById('set_short');
const LONG_LENGTH = document.getElementById('set_long');
const ICONS = document.querySelectorAll('.tomato');
const CIRCLE = document.getElementById('circle');
const ALARM_1 = new Audio('audio/end-break.mp3');
const ALARM_2 = new Audio('audio/start-break.mp3');
let pomsComplete = 0;
let timerLength = 0;
let percent = 0;
let timerRunning = false;
let onBreak = false;
let pomTimer;

function startTimer() {
  const START = Date.now();

  function updateClock() {
    const POM_TIME = timer();
    const ICON = document.querySelector(`.tomato:nth-child(${pomsComplete + 1})`);

    // This segment will tick down to 0 before logic below runs
    CLOCK.innerHTML = `${POM_TIME.minutes}:${POM_TIME.seconds}`;
    document.title = `${POM_TIME.minutes}:${POM_TIME.seconds}`;
    updateProgressBar(POM_TIME.total);

    // When timer hits zero
    // I think I can simplify this
    if (POM_TIME.total == 0) {

      if (pomsComplete < 4 && onBreak === false) {
        pomsComplete += 1;
        ALARM_2.play();
        ICON.setAttribute('src', 'img/tomato-allpurp.svg');
        CIRCLE.style.stroke = '#E7DFDD';
        onBreak = true;

      } else if (pomsComplete < 4 && onBreak === true) {
        ALARM_1.play();
        CIRCLE.style.removeProperty('stroke');
        onBreak = false;

      } else if (pomsComplete === 4) {
        pomsComplete += 1;
        ALARM_2.play();
        CIRCLE.style.removeProperty('stroke');
        onBreak = false;
        ICONS.forEach(el => {
          el.setAttribute('src', 'img/tomato-purp.svg');
        });
      }
    }

    // One second after timer hits 0
    if (POM_TIME.total < 0) {
      clearInterval(pomTimer);

      // Pom timer
      if (pomsComplete < 4 && onBreak === false) {
        timerLength = POM_SLIDER.value * 60;
        startTimer();
      }

      // Short break timer
      if (pomsComplete < 4 && onBreak === true) {
        timerLength = SHORT_SLIDER.value * 60;
        startTimer();
      }

      // Long break timer
      if (pomsComplete === 4) {
        timerLength = LONG_SLIDER.value * 60;
        startTimer();
      }

      // Reset after long break timer but not sliders
      if (pomsComplete === 5) {
        timerRunning = false;
        pomsComplete = 0;
        timerLength = 0;
        CLOCK.innerHTML = '00:00';
        document.title = '00:00';
        POM_SLIDER.disabled = false;
        SHORT_SLIDER.disabled = false;
        LONG_SLIDER.disabled = false;
        onBreak = false;
      }
    }
  }

  function timer() {
    // Gets seconds remaining by subtracting the time elapsed since start from the set duration.
    const TIME_LEFT = timerLength - Math.floor((Date.now() - START) / 1000);
    let minutes = Math.floor(TIME_LEFT / 60);
    let seconds = Math.floor(TIME_LEFT % 60);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return {
      'total': TIME_LEFT,
      'minutes': minutes,
      'seconds': seconds
    };
  }

  // Transition duration is 1sec so I need to factor that in somehow
  function updateProgressBar(timeLeft) {
    if (timeLeft > 0) {
      percent += (550 / timerLength);
      CIRCLE.style.strokeDasharray = `${percent} 550`;
    }
    if (timeLeft == 0) {
      percent = 0;
      CIRCLE.style.transition = 'all 0s linear';
      CIRCLE.style.strokeDasharray = '0 550';
    }
  }

  CIRCLE.style.removeProperty('transition');
  updateClock();
  pomTimer = setInterval(updateClock, 1000);
}


// Event listeners for buttons
START_TIMER.addEventListener('click', () => {
  if (timerRunning === false) {
    POM_SLIDER.disabled = true;
    SHORT_SLIDER.disabled = true;
    LONG_SLIDER.disabled = true;
    CIRCLE.style.strokeDasharray = '0 550';
    timerRunning = true;
    percent = 0;

    if (onBreak === false) {
      timerLength = POM_SLIDER.value * 60;
    } else if (onBreak === true) {
      timerLength = SHORT_SLIDER.value * 60;
    }

    startTimer();
  }
});
STOP_TIMER.addEventListener('click', () => {
  if (pomTimer) {
    clearInterval(pomTimer);
    timerRunning = false;
    POM_SLIDER.disabled = false;
    SHORT_SLIDER.disabled = false;
    LONG_SLIDER.disabled = false;
  }
});
RESET_TIMER.addEventListener('click', () => {
  clearInterval(pomTimer);
  timerRunning = false;
  onBreak = false;
  pomsComplete = 0;
  timerLength = 0;
  CIRCLE.style.strokeDasharray = '0 550';
  CIRCLE.style.removeProperty('stroke');
  POM_SLIDER.disabled = false;
  SHORT_SLIDER.disabled = false;
  LONG_SLIDER.disabled = false;
  POM_SLIDER.value = '25';
  SHORT_SLIDER.value = '5';
  LONG_SLIDER.value = '20';
  POM_LENGTH.innerHTML = '25';
  SHORT_LENGTH.innerHTML = '5';
  LONG_LENGTH.innerHTML = '20';
  CLOCK.innerHTML = `00:00`;
  ICONS.forEach(el => {
    el.setAttribute('src', 'img/tomato-purp.svg');
  });
});

// Event listeners on sliders to update the HTML
POM_SLIDER.addEventListener('input', () => {
  POM_LENGTH.innerHTML = POM_SLIDER.value;
});
SHORT_SLIDER.addEventListener('input', () => {
  SHORT_LENGTH.innerHTML = SHORT_SLIDER.value;
});
LONG_SLIDER.addEventListener('input', () => {
  LONG_LENGTH.innerHTML = LONG_SLIDER.value;
});
