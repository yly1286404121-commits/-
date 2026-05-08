const places = [
  {
    id: "market",
    name: "Morning Market Crawl",
    category: "food",
    cost: 46,
    walk: 28,
    tag: "Breakfast to lunch",
    description: "Start with pastries, wander produce stalls, then end with a counter-seat lunch nearby.",
    photo: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "gallery",
    name: "Warehouse Gallery Loop",
    category: "art",
    cost: 34,
    walk: 42,
    tag: "Design district",
    description: "Three small galleries, a bookshop, and a late-afternoon cafe with room to sketch or read.",
    photo: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "garden",
    name: "Botanical Glasshouse",
    category: "nature",
    cost: 28,
    walk: 35,
    tag: "Slow reset",
    description: "A quiet green stop with shaded paths, humid rooms, and a good bench-to-view ratio.",
    photo: "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "noodle",
    name: "Tiny Noodle Bar",
    category: "food",
    cost: 38,
    walk: 16,
    tag: "Dinner anchor",
    description: "A compact dinner plan that leaves enough budget for dessert and a second neighborhood walk.",
    photo: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "museum",
    name: "Modern Museum Morning",
    category: "art",
    cost: 52,
    walk: 24,
    tag: "Big ticket",
    description: "Reserve the first entry slot, then keep the afternoon open for a slower nearby lunch.",
    photo: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "ridge",
    name: "Sunset Ridge Walk",
    category: "nature",
    cost: 22,
    walk: 58,
    tag: "Golden hour",
    description: "Pack a light snack, reach the overlook before sunset, and take the gentler route down.",
    photo: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80"
  }
];

const saved = new Map();
let currentFilter = "all";

const placeGrid = document.querySelector("#placeGrid");
const savedList = document.querySelector("#savedList");
const savedCount = document.querySelector("#savedCount");
const dailyEstimate = document.querySelector("#dailyEstimate");
const walkTime = document.querySelector("#walkTime");
const budgetInput = document.querySelector("#budgetInput");
const budgetLabel = document.querySelector("#budgetLabel");
const moodInput = document.querySelector("#moodInput");
const planMeta = document.querySelector("#planMeta");
const statusMessage = document.querySelector("#statusMessage");

function formatMoney(value) {
  return `$${Math.round(value)}`;
}

function visiblePlaces() {
  return currentFilter === "all"
    ? places
    : places.filter((place) => place.category === currentFilter);
}

function renderPlaces() {
  placeGrid.innerHTML = visiblePlaces().map((place) => {
    const isSaved = saved.has(place.id);

    return `
      <article class="place-card">
        <div class="place-photo" style="--photo: url('${place.photo}')"></div>
        <div class="place-body">
          <div class="place-title">
            <h3>${place.name}</h3>
            <span class="price">${formatMoney(place.cost)}</span>
          </div>
          <span class="place-meta">${place.tag} / ${place.walk} min walk</span>
          <p>${place.description}</p>
          <div class="place-footer">
            <span class="place-meta">${place.category}</span>
            <button class="save-button ${isSaved ? "is-saved" : ""}" type="button" data-save="${place.id}">
              ${isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderPlan() {
  const items = [...saved.values()];
  const totalCost = items.reduce((sum, place) => sum + place.cost, 0);
  const totalWalk = items.reduce((sum, place) => sum + place.walk, 0);
  const budget = Number(budgetInput.value);
  const moodLabel = moodInput.options[moodInput.selectedIndex].text;
  const remaining = budget - totalCost;

  budgetLabel.textContent = formatMoney(budget);
  savedCount.textContent = items.length;
  dailyEstimate.textContent = formatMoney(totalCost);
  walkTime.textContent = `${totalWalk} min`;
  planMeta.textContent = `${moodLabel} / ${formatMoney(Math.max(remaining, 0))} budget room`;

  savedList.innerHTML = items.length
    ? items.map((place) => `
      <div class="saved-item">
        <div>
          <strong>${place.name}</strong>
          <small>${formatMoney(place.cost)} / ${place.walk} min walk</small>
        </div>
        <button class="remove-button" type="button" data-remove="${place.id}" aria-label="Remove ${place.name}">x</button>
      </div>
    `).join("")
    : `<div class="empty-state">Save a few stops to shape the weekend.</div>`;

  if (!items.length) {
    statusMessage.textContent = "";
  } else if (totalCost > budget) {
    statusMessage.textContent = "This route is over budget. Trim one stop or lift the target.";
  } else {
    statusMessage.textContent = "Nice fit. This route stays inside your target.";
  }
}

function toggleSaved(id) {
  const place = places.find((item) => item.id === id);
  if (!place) return;

  if (saved.has(id)) {
    saved.delete(id);
  } else {
    saved.set(id, place);
  }

  renderPlaces();
  renderPlan();
}

function suggestRoute() {
  const mood = moodInput.value;
  const budget = Number(budgetInput.value);
  const pool = mood === "all" ? places : places.filter((place) => place.category === mood);

  saved.clear();
  pool
    .slice()
    .sort((a, b) => a.cost - b.cost)
    .some((place) => {
      const currentTotal = [...saved.values()].reduce((sum, item) => sum + item.cost, 0);
      if (currentTotal + place.cost <= budget || saved.size < 2) {
        saved.set(place.id, place);
      }
      return saved.size >= 3;
    });

  statusMessage.textContent = "Suggested a compact route from your current settings.";
  renderPlaces();
  renderPlan();
}

document.querySelector(".filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  currentFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach((item) => {
    item.classList.toggle("is-active", item === button);
  });
  renderPlaces();
});

document.addEventListener("click", (event) => {
  const saveButton = event.target.closest("[data-save]");
  const removeButton = event.target.closest("[data-remove]");

  if (saveButton) toggleSaved(saveButton.dataset.save);
  if (removeButton) toggleSaved(removeButton.dataset.remove);
});

budgetInput.addEventListener("input", renderPlan);
moodInput.addEventListener("change", renderPlan);

document.querySelector("#suggestButton").addEventListener("click", suggestRoute);
document.querySelector("#clearButton").addEventListener("click", () => {
  saved.clear();
  renderPlaces();
  renderPlan();
});

renderPlaces();
renderPlan();
