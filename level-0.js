const state = { questions: [], currentRound: 0, score: 0, answered: false, guess: null, answers: [] };
const elements = {
  game: document.querySelector("#game-grid"), warning: document.querySelector("#load-warning"), roundLabel: document.querySelector("#round-label"), score: document.querySelector("#score"),
  questionTitle: document.querySelector("#question-title"), sceneNumber: document.querySelector("#scene-number"), guessLayer: document.querySelector(".guess-layer"), result: document.querySelector("#result-card"),
  resultTitle: document.querySelector("#result-title"), resultCopy: document.querySelector("#result-copy"), next: document.querySelector("#next-button"), review: document.querySelector("#review-screen"),
  reviewScore: document.querySelector("#review-score"), reviewCorrect: document.querySelector("#review-correct"), reviewList: document.querySelector("#review-list")
};

function showWarning(message) {
  elements.warning.textContent = message;
  elements.warning.hidden = false;
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function placeMarker(className, coordinates) {
  const position = window.MapEngine.worldToScreen(coordinates);
  const marker = document.createElement("div");
  marker.className = className;
  marker.style.left = `${position.x}px`;
  marker.style.top = `${position.y}px`;
  elements.guessLayer.appendChild(marker);
}

function redrawMarkers() {
  if (!state.guess) return;
  elements.guessLayer.textContent = "";
  placeMarker("guess-marker", state.guess);
  placeMarker("target-marker", state.questions[state.currentRound].target);
}

function renderRound() {
  const question = state.questions[state.currentRound];
  state.answered = false;
  state.guess = null;
  elements.guessLayer.textContent = "";
  elements.roundLabel.textContent = `Round ${state.currentRound + 1} of ${state.questions.length}`;
  elements.sceneNumber.textContent = String(state.currentRound + 1).padStart(2, "0");
  elements.questionTitle.textContent = question.question;
  elements.score.textContent = state.score.toLocaleString();
  elements.result.hidden = true;
}

function getMapScore(distance) {
  const maximumPoints = 5000;
  const scoringRange = 2000;
  const remainingRange = Math.max(0, scoringRange - distance);
  return Math.round(maximumPoints * (remainingRange / scoringRange));
}

function selectMapGuess(point) {
  if (state.answered) return;
  const question = state.questions[state.currentRound];
  const distance = Math.round(Math.hypot(point.x - question.target.x, point.z - question.target.z));
  const points = getMapScore(distance);
  const isCorrect = points > 0;
  state.answered = true;
  state.guess = point;
  state.answers[state.currentRound] = { isCorrect, points, distance };
  state.score += points;
  placeMarker("guess-marker", point);
  placeMarker("target-marker", question.target);
  elements.score.textContent = state.score.toLocaleString();
  elements.resultTitle.textContent = points === 5000 ? "Perfect guess." : points > 0 ? "Good guess." : "Too far away.";
  elements.resultCopy.textContent = `You were ${distance.toLocaleString()} studs away and earned ${points.toLocaleString()} points.`;
  elements.next.textContent = state.currentRound === state.questions.length - 1 ? "View review" : "Next location →";
  elements.result.hidden = false;
}

function showReview() {
  elements.game.hidden = true;
  elements.result.hidden = true;
  elements.reviewScore.textContent = state.score.toLocaleString();
  elements.reviewCorrect.textContent = `${state.answers.filter((answer) => answer?.isCorrect).length}/${state.questions.length}`;
  elements.reviewList.innerHTML = state.questions.map((question, index) => {
    const answer = state.answers[index] || { points: 0, distance: null };
    const distanceText = answer.distance === null ? "No guess" : `${answer.distance.toLocaleString()} studs away`;
    const pointsText = `${answer.points > 0 ? "+" : ""}${answer.points.toLocaleString()} points`;
    return `<div class="review-item"><span class="review-number">${String(index + 1).padStart(2, "0")}</span><div><strong>${question.question}</strong><span>${question.answer} · ${distanceText}</span></div><b>${pointsText}</b></div>`;
  }).join("");
  elements.review.hidden = false;
}

async function startGame() {
  try {
    const response = await fetch("config/level-0-questions.json");
    if (!response.ok) throw new Error("Level-0 questions could not be loaded");
    state.questions = shuffle(await response.json());
    if (!state.questions.length) throw new Error("No Level-0 questions configured");
    elements.game.hidden = false;
    renderRound();
  } catch (error) {
    showWarning("The Level-0 question config could not be loaded.");
  }
}

elements.next.addEventListener("click", () => {
  if (state.currentRound === state.questions.length - 1) showReview();
  else { state.currentRound += 1; renderRound(); }
});
window.MapEngine.onMapClick = selectMapGuess;
window.MapEngine.onMapRender = redrawMarkers;
startGame();
