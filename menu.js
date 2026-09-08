const modeLabels = {
  locations: "Locations",
  "level-0": "Level-0 Locations"
};

const selectedMode = new URLSearchParams(window.location.search).get("mode") || "locations";
const leaderboardMode = modeLabels[selectedMode] ? selectedMode : "locations";
const leaderboardTitle = document.querySelector("#leaderboard-title");
const leaderboardList = document.querySelector("#leaderboard-list");
const leaderboardModeLabel = document.querySelector("#leaderboard-mode");
const modeOptions = document.querySelectorAll(".mode-option:not(.mode-option--disabled)");

function renderLeaderboard(mode) {
  if (!leaderboardTitle || !leaderboardList) return;
  leaderboardModeLabel.textContent = modeLabels[mode];
  const entries = JSON.parse(localStorage.getItem(`adyguessr-leaderboard-${mode}`) || "[]");
  const rows = entries.length ? entries : [{ name: "No scores yet", score: "--" }];
  leaderboardList.innerHTML = rows.slice(0, 10).map((entry, index) => `
    <div class="leaderboard-row ${index === 0 ? "leaderboard-row--highlight" : ""}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${entry.name}</strong>
      <b>${typeof entry.score === "number" ? entry.score.toLocaleString() : entry.score}</b>
    </div>
  `).join("");
}

modeOptions.forEach((option) => {
  const optionMode = option.href.includes("level-0") ? "level-0" : "locations";
  option.classList.toggle("selected", optionMode === leaderboardMode);
  option.addEventListener("click", (event) => {
    const alreadySelected = option.classList.contains("selected");
    if (!alreadySelected) {
      event.preventDefault();
      modeOptions.forEach((item) => item.classList.remove("selected"));
      option.classList.add("selected");
      renderLeaderboard(optionMode);
    }
  });
});

renderLeaderboard(leaderboardMode);
