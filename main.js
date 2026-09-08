const fallbackLocations = [
  { question: "Where was this picture taken?", image: "images/locations/Screenshot_1.png", answers: ["A random place in Level-0", "Infinitelands Staircase", "A removed landmark", "Level-0.35"], correctAnswer: "Infinitelands Staircase" }
];

const state = { locations: [], currentRound: 0, score: 0, answered: false, mode: null, roundLimit: 0 };
const elements = {
  modeScreen: document.querySelector("#mode-screen"),
  modeOptions: document.querySelectorAll(".mode-option"),
  start: document.querySelector("#start-button"),
  game: document.querySelector("#game-grid"),
  warning: document.querySelector("#load-warning"),
  roundStatus: document.querySelector("#round-status"),
  scorePanel: document.querySelector("#score-panel"),
  roundLabel: document.querySelector("#round-label"),
  score: document.querySelector("#score"),
  sceneImage: document.querySelector("#scene-image"),
  questionTitle: document.querySelector("#question-title"),
  sceneNumber: document.querySelector("#scene-number"),
  answerList: document.querySelector("#answer-list"),
  result: document.querySelector("#result-card"),
  resultTitle: document.querySelector("#result-title"),
  resultCopy: document.querySelector("#result-copy"),
  next: document.querySelector("#next-button"),
  back: document.querySelector("#back-button")
};

function showWarning(message) {
  elements.warning.textContent = message;
  elements.warning.hidden = false;
}

function validateLocations(locations) {
  if (!Array.isArray(locations) || locations.length === 0) {
    throw new Error("Location config is empty");
  }

  const isValid = locations.every((location) => (
    location &&
    typeof location.question === "string" &&
    Array.isArray(location.answers) &&
    location.answers.length > 0 &&
    typeof location.correctAnswer === "string" &&
    location.answers.includes(location.correctAnswer)
  ));

  if (!isValid) throw new Error("Location config has an invalid entry");
  return locations;
}

async function loadJsonFile(fileName) {
  const response = await fetch(`config/${fileName}`);
  if (!response.ok) throw new Error(`${fileName} could not be loaded`);
  return validateLocations(await response.json());
}

async function loadLocations(mode) {
  try {
    if (mode === "all") {
      const [entities, locations] = await Promise.all([
        loadJsonFile("entities.json"),
        loadJsonFile("locations.json")
      ]);
      state.locations = [...entities, ...locations].sort(() => Math.random() - 0.5);
    } else {
      state.locations = await loadJsonFile(`${mode}.json`);
    }
    if (state.locations.length === 0) throw new Error("No questions were loaded");
    return true;
  } catch (error) {
    state.locations = fallbackLocations;
    showWarning("The selected game mode could not be loaded. Using built-in sample questions instead.");
    return false;
  }
}

function renderRound() {
  const location = state.locations[state.currentRound];
  state.answered = false;
  elements.roundLabel.textContent = `Round ${state.currentRound + 1} of ${state.roundLimit}`;
  elements.score.textContent = state.score.toLocaleString();
  elements.questionTitle.textContent = location.question;
  elements.sceneNumber.textContent = String(state.currentRound + 1).padStart(2, "0");
  elements.sceneImage.style.backgroundImage = "none";
  if (location.image) {
    const image = new Image();
    image.onload = () => {
      elements.sceneImage.style.backgroundImage = `url("${location.image}")`;
    };
    image.onerror = () => {
      showWarning("The image for this question could not be loaded. Showing a placeholder instead.");
    };
    image.src = location.image;
  } else {
    showWarning("No image is configured for this question. Showing a placeholder instead.");
  }
  elements.answerList.innerHTML = "";
  location.answers.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.dataset.answer = choice;
    button.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + index)}</span><span>${choice}</span>`;
    button.addEventListener("click", () => selectAnswer(button, location));
    elements.answerList.appendChild(button);
  });
  elements.result.hidden = true;
}

function selectAnswer(button, location) {
  if (state.answered) return;
  state.answered = true;
  const isCorrect = button.dataset.answer === location.correctAnswer;
  const points = isCorrect ? 10 : -5;
  state.score += points;
  elements.answerList.querySelectorAll(".answer-button").forEach((option) => {
    option.disabled = true;
    if (option.dataset.answer === location.correctAnswer) option.classList.add("correct");
  });
  button.classList.add(isCorrect ? "selected-correct" : "selected-wrong");
  elements.score.textContent = state.score.toLocaleString();
  elements.resultTitle.textContent = isCorrect ? "Exactly right." : "Not quite this time.";
  elements.resultCopy.textContent = isCorrect
    ? "You earned 10 points."
    : `You lost 5 points. The correct answer was ${location.correctAnswer}.`;
  elements.result.hidden = false;
  elements.next.textContent = state.currentRound === state.roundLimit - 1 ? "Play again" : "Next location →";
  elements.result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function nextRound() {
  if (state.currentRound === state.roundLimit - 1) {
    state.currentRound = 0;
    state.score = 0;
  } else {
    state.currentRound += 1;
  }
  renderRound();
}

function chooseMode(button) {
  elements.modeOptions.forEach((option) => option.classList.remove("selected"));
  button.classList.add("selected");
  state.mode = button.dataset.mode;
  elements.start.disabled = false;
}

async function startGame() {
  elements.start.disabled = true;
  await loadLocations(state.mode);
  state.roundLimit = state.locations.length;
  state.currentRound = 0;
  state.score = 0;
  elements.modeScreen.hidden = true;
  elements.game.hidden = false;
  elements.roundStatus.hidden = false;
  elements.scorePanel.hidden = false;
  renderRound();
}

function returnToStart() {
  state.locations = [];
  state.currentRound = 0;
  state.score = 0;
  state.answered = false;
  state.mode = null;
  state.roundLimit = 0;
  elements.game.hidden = true;
  elements.result.hidden = true;
  elements.roundStatus.hidden = true;
  elements.scorePanel.hidden = true;
  elements.modeScreen.hidden = false;
  elements.modeOptions.forEach((option) => option.classList.remove("selected"));
  elements.start.disabled = true;
}

elements.modeOptions.forEach((option) => option.addEventListener("click", () => chooseMode(option)));
elements.start.addEventListener("click", startGame);
elements.next.addEventListener("click", nextRound);
elements.back.addEventListener("click", returnToStart);
