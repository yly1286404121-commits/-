const dishes = [
  {
    id: "beef",
    name: "黑椒牛肉粒",
    category: "hot",
    tags: ["protein", "balanced"],
    label: "下饭热菜",
    desc: "牛肉煎到焦香，配彩椒和洋葱，适合米饭党。",
    price: 58,
    minutes: 18,
    photo: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "fish",
    name: "番茄酸汤鱼",
    category: "hot",
    tags: ["spicy", "balanced"],
    label: "酸香暖胃",
    desc: "酸甜汤底配嫩鱼片，天气微凉时很会哄人。",
    price: 66,
    minutes: 22,
    photo: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "salad",
    name: "青柠虾仁沙拉",
    category: "fresh",
    tags: ["light", "protein"],
    label: "清爽",
    desc: "虾仁、牛油果、青柠汁，给晚餐留一点轻盈。",
    price: 42,
    minutes: 12,
    photo: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "noodle",
    name: "葱油拌面",
    category: "main",
    tags: ["balanced"],
    label: "主食",
    desc: "葱香酱汁裹住细面，简单但很难不加第二份。",
    price: 24,
    minutes: 10,
    photo: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "tofu",
    name: "家常豆腐煲",
    category: "hot",
    tags: ["light", "balanced"],
    label: "素也满足",
    desc: "外焦里嫩的豆腐吸满酱汁，和米饭很合拍。",
    price: 36,
    minutes: 15,
    photo: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "rice",
    name: "菌菇鸡肉焖饭",
    category: "main",
    tags: ["protein", "balanced"],
    label: "一锅香",
    desc: "米粒吸进鸡肉和菌菇的香气，适合凑一份主食。",
    price: 32,
    minutes: 20,
    photo: "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?auto=format&fit=crop&w=900&q=80"
  }
];

const cart = new Map();
let currentFilter = "all";

const dishGrid = document.querySelector("#dishGrid");
const cartList = document.querySelector("#cartList");
const dishCount = document.querySelector("#dishCount");
const cookTime = document.querySelector("#cookTime");
const perPerson = document.querySelector("#perPerson");
const totalPrice = document.querySelector("#totalPrice");
const peopleInput = document.querySelector("#peopleInput");
const timeInput = document.querySelector("#timeInput");
const tasteInput = document.querySelector("#tasteInput");
const cartMeta = document.querySelector("#cartMeta");
const notice = document.querySelector("#notice");

function money(value) {
  return `￥${Math.round(value)}`;
}

function getVisibleDishes() {
  return currentFilter === "all"
    ? dishes
    : dishes.filter((dish) => dish.category === currentFilter);
}

function renderDishes() {
  dishGrid.innerHTML = getVisibleDishes().map((dish) => `
    <article class="dish-card">
      <div class="dish-photo" style="--photo: url('${dish.photo}')">
        <span class="dish-tag">${dish.label}</span>
      </div>
      <div class="dish-body">
        <div class="dish-title">
          <h3>${dish.name}</h3>
          <span class="price">${money(dish.price)}</span>
        </div>
        <p>${dish.desc}</p>
        <div class="dish-footer">
          <span class="dish-time">${dish.minutes} 分钟</span>
          <button class="dish-add" type="button" data-add="${dish.id}" aria-label="添加 ${dish.name}" title="添加 ${dish.name}">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const items = [...cart.values()];
  const people = Math.max(Number(peopleInput.value) || 1, 1);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const longestCook = items.reduce((max, item) => Math.max(max, item.minutes), 0);
  const tasteText = tasteInput.options[tasteInput.selectedIndex].text;

  dishCount.textContent = count;
  cookTime.textContent = `${longestCook} 分钟`;
  perPerson.textContent = money(total / people);
  totalPrice.textContent = money(total);
  cartMeta.textContent = `${people} 人 · ${timeInput.value || "19:00"} 开饭 · ${tasteText}`;

  cartList.innerHTML = items.length
    ? items.map((item) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <small>${money(item.price)} · ${item.minutes} 分钟</small>
        </div>
        <div class="qty">
          <button class="qty-button" type="button" data-minus="${item.id}" aria-label="减少 ${item.name}">-</button>
          <span>${item.qty}</span>
          <button class="qty-button" type="button" data-add="${item.id}" aria-label="增加 ${item.name}">+</button>
        </div>
      </div>
    `).join("")
    : `<div class="empty-cart">饭桌还是空的</div>`;
}

function addDish(id) {
  const dish = dishes.find((item) => item.id === id);
  if (!dish) return;

  const current = cart.get(id);
  cart.set(id, { ...dish, qty: current ? current.qty + 1 : 1 });
  notice.textContent = `${dish.name} 已加入饭桌`;
  renderCart();
}

function removeDish(id) {
  const current = cart.get(id);
  if (!current) return;

  if (current.qty === 1) {
    cart.delete(id);
  } else {
    cart.set(id, { ...current, qty: current.qty - 1 });
  }

  notice.textContent = "";
  renderCart();
}

function setRandomMeal() {
  cart.clear();
  const taste = tasteInput.value;
  const matched = dishes.filter((dish) => dish.tags.includes(taste));
  const pool = matched.length >= 3 ? matched : dishes;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  shuffled.slice(0, 3).forEach((dish) => {
    cart.set(dish.id, { ...dish, qty: 1 });
  });

  notice.textContent = "已经配好一桌";
  renderCart();
}

document.querySelector(".filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  currentFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach((item) => {
    item.classList.toggle("is-active", item === button);
  });
  renderDishes();
});

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const minusButton = event.target.closest("[data-minus]");

  if (addButton) addDish(addButton.dataset.add);
  if (minusButton) removeDish(minusButton.dataset.minus);
});

document.querySelector("#randomButton").addEventListener("click", setRandomMeal);

document.querySelector("#checkoutButton").addEventListener("click", () => {
  notice.textContent = cart.size ? "好，开饭。" : "先选一道菜。";
});

[peopleInput, timeInput, tasteInput].forEach((input) => {
  input.addEventListener("input", renderCart);
  input.addEventListener("change", renderCart);
});

renderDishes();
renderCart();
