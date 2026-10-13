/* ==================================
   BLISS BITES - SCRIPT
================================== */

const DELIVERY_FEE = 40;
const STORAGE_KEY = "blissCart";
const ADD_LABEL = "Add to Cart <span>+</span>";

/* ---------- 1. MENU DATA (add a new item = add one object) ---------- */

const img = (id) =>
    `https://images.unsplash.com/${id}?w=600&auto=format&fit=crop&q=85`;

const menu = [
    { name: "Classic Pizza", price: 199, category: "meals", tag: "FAVOURITE",
      desc: "Golden crust, rich cheese and delicious toppings.",
      img: img("photo-1513104890138-7c749659a591"), alt: "Fresh cheese pizza" },
    { name: "Creamy Pasta", price: 179, category: "meals", tag: "COMFORT FOOD",
      desc: "Comforting pasta with a rich, delicious flavour.",
      img: img("photo-1473093295043-cdd812d0e601"), alt: "Creamy pasta" },
    { name: "French Fries", price: 79, category: "meals", tag: "CRISPY FAVOURITE",
      desc: "Golden, crispy fries for your snack cravings.",
      img: img("photo-1573080496219-bb080dd4f877"), alt: "Golden french fries" },
    { name: "Cheese Sandwich", price: 109, category: "meals", tag: "FRESH PICK",
      desc: "A fresh, satisfying sandwich with cheesy goodness.",
      img: img("photo-1528735602780-2552fd46c7af"), alt: "Fresh cheese sandwich" },
    { name: "Chocolate Brownie", price: 89, category: "desserts", tag: "SWEET MOMENT",
      desc: "A rich chocolate treat for a little indulgence.",
      img: img("photo-1606313564200-e75d5e30476c"), alt: "Chocolate brownie" },
    { name: "Chocolate Shake", price: 119, category: "drinks", tag: "COOL & CREAMY",
      desc: "A chilled chocolate shake to brighten your day.",
      img: img("photo-1572490122747-3968b75cc699"), alt: "Chocolate milkshake" },
    { name: "Strawberry Cheesecake", price: 149, category: "desserts", tag: "DESSERT SPECIAL",
      desc: "Creamy cheesecake with a fruity finish.",
      img: img("photo-1533134242443-d4fd215305ad"), alt: "Strawberry cheesecake" },
    { name: "Classic Burger", price: 129, category: "meals", tag: "MUST TRY",
      desc: "A satisfying bite with fresh layers and flavour.",
      img: img("photo-1568901346375-23c9450c58cd"), alt: "Fresh burger with lettuce and tomato" },
    { name: "Chocolate Cake", price: 99, category: "desserts", tag: "SWEET TREAT",
      desc: "Rich chocolate goodness for your sweetest moments.",
      img: img("photo-1578985545062-69928b1d9587"), alt: "Rich chocolate celebration cake" }
];

/* ---------- 2. ELEMENTS ---------- */

const $ = (id) => document.getElementById(id);

const foodGrid = $("food-grid");
const cartCount = $("cart-count");
const cartToggle = $("cart-toggle");
const cartPanel = $("cart-panel");
const cartItems = $("cart-items");
const cartSubtotal = $("cart-subtotal");
const cartDelivery = $("cart-delivery");
const cartTotal = $("cart-total");
const closeCartBtn = $("close-cart");
const checkoutBtn = $("checkout-btn");
const checkoutSection = $("checkout-section");
const checkoutForm = $("checkout-form");
const backToCartBtn = $("back-to-cart");
const orderSuccess = $("order-success");
const orderMessage = $("order-message");
const continueBtn = $("continue-shopping");
const overlay = $("overlay");
const foodSearch = $("food-search");
const noResults = $("no-results");

/* ---------- 3. RENDER MENU ---------- */

function renderMenu() {
    foodGrid.innerHTML = menu.map((item) => `
        <article class="food-card" data-category="${item.category}">
            <div class="food-image-wrap">
                <img src="${item.img}" alt="${item.alt}" class="food-image" loading="lazy">
                <span class="food-tag">${item.tag}</span>
            </div>
            <div class="food-details">
                <div class="food-title-row">
                    <h3>${item.name}</h3>
                    <span class="food-price">₹${item.price}</span>
                </div>
                <p>${item.desc}</p>
                <button class="add-to-cart" data-name="${item.name}">${ADD_LABEL}</button>
            </div>
        </article>
    `).join("");
}

/* ---------- 4. CART DATA + localStorage ---------- */

let cart = loadCart();

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!Array.isArray(saved)) return [];

        // Rebuild from menu so names/prices can never be tampered with
        return saved
            .map((s) => {
                const food = menu.find((m) => m.name === s.name);
                const quantity = Math.floor(Number(s.quantity));
                if (!food || !(quantity > 0)) return null;
                return { name: food.name, price: food.price, quantity };
            })
            .filter(Boolean);
    } catch (error) {
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        /* storage blocked - cart still works for this visit */
    }
}

function getTotals() {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
    return { subtotal, delivery, total: subtotal + delivery };
}

function updateCart() {
    cartCount.textContent = cart.reduce((n, i) => n + i.quantity, 0);
    saveCart();
    renderCart();
}

/* ---------- 5. ADD TO CART ---------- */

foodGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".add-to-cart");
    if (!button || button.dataset.busy) return;

    const food = menu.find((m) => m.name === button.dataset.name);
    if (!food) return;

    const existing = cart.find((i) => i.name === food.name);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ name: food.name, price: food.price, quantity: 1 });
    }
    updateCart();

    button.dataset.busy = "true";
    button.innerHTML = "Added ✓";
    setTimeout(() => {
        button.innerHTML = ADD_LABEL;
        delete button.dataset.busy;
    }, 1000);
});

/* ---------- 6. RENDER CART ---------- */

function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Your cart is empty. Add something tasty! 🍕</p>';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <span>${item.name}</span>
                <div class="cart-controls">
                    <button class="cart-quantity-btn" data-action="decrease" data-index="${index}" aria-label="Decrease quantity">−</button>
                    <span>${item.quantity}</span>
                    <button class="cart-quantity-btn" data-action="increase" data-index="${index}" aria-label="Increase quantity">+</button>
                </div>
                <strong>₹${item.price * item.quantity}</strong>
                <button class="cart-remove-btn" data-action="remove" data-index="${index}">Remove</button>
            </div>
        `).join("");
    }

    const { subtotal, delivery, total } = getTotals();
    cartSubtotal.textContent = "₹" + subtotal;
    cartDelivery.textContent = "₹" + delivery;
    cartTotal.textContent = "₹" + total;

    checkoutBtn.disabled = cart.length === 0;
}

cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const index = Number(button.dataset.index);
    const item = cart[index];
    if (!item) return;

    if (button.dataset.action === "increase") item.quantity++;
    if (button.dataset.action === "decrease") {
        item.quantity--;
        if (item.quantity <= 0) cart.splice(index, 1);
    }
    if (button.dataset.action === "remove") cart.splice(index, 1);

    updateCart();
});

/* ---------- 7. OPEN / CLOSE CART + CHECKOUT ---------- */

function lockScroll(lock) {
    document.body.classList.toggle("no-scroll", lock);
}

function openCart() {
    checkoutSection.hidden = true;
    cartPanel.hidden = false;
    overlay.hidden = false;
    cartToggle.setAttribute("aria-expanded", "true");
    lockScroll(true);
    renderCart();
}

function closeAll() {
    cartPanel.hidden = true;
    checkoutSection.hidden = true;
    overlay.hidden = true;
    cartToggle.setAttribute("aria-expanded", "false");
    lockScroll(false);
}

function openCheckout() {
    if (cart.length === 0) return;
    cartPanel.hidden = true;
    checkoutSection.hidden = false;
    overlay.hidden = false;
}

cartToggle.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeAll);
overlay.addEventListener("click", closeAll);
checkoutBtn.addEventListener("click", openCheckout);
backToCartBtn.addEventListener("click", openCart);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAll();
});

/* ---------- 8. CHECKOUT FORM ---------- */

checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (cart.length === 0) return;

    const name = $("customer-name").value.trim();
    const { total } = getTotals();

    orderMessage.textContent =
        "Thank you, " + name + "! Your order total is ₹" + total + ".";

    // Clear the cart as soon as the order is placed
    cart = [];
    updateCart();

    checkoutForm.hidden = true;
    orderSuccess.hidden = false;
});

continueBtn.addEventListener("click", () => {
    checkoutForm.reset();
    checkoutForm.hidden = false;
    orderSuccess.hidden = true;
    closeAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- 9. SEARCH + CATEGORY FILTER ---------- */

const filterButtons = document.querySelectorAll(".filter-btn");
let selectedCategory = "all";

function filterFoods() {
    const text = foodSearch.value.trim().toLowerCase();
    let visible = 0;

    document.querySelectorAll(".food-card").forEach((card) => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        const desc = card.querySelector(".food-details > p").textContent.toLowerCase();

        const matchesSearch = title.includes(text) || desc.includes(text);
        const matchesCategory =
            selectedCategory === "all" || card.dataset.category === selectedCategory;

        card.hidden = !(matchesSearch && matchesCategory);
        if (!card.hidden) visible++;
    });

    noResults.hidden = visible > 0;
}

foodSearch.addEventListener("input", filterFoods);

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        selectedCategory = button.dataset.category;
        filterButtons.forEach((b) => b.classList.toggle("active", b === button));
        filterFoods();
    });
});

/* ---------- 10. NAV LINK HIGHLIGHT ON SCROLL ---------- */

const navLinks = document.querySelectorAll('.navigation a[href^="#"]');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
    });
}, { rootMargin: "-40% 0px -55% 0px" });

["home", "menu", "about"].forEach((id) => observer.observe($(id)));

/* ---------- START ---------- */

renderMenu();
updateCart();