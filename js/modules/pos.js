import { state, saveState, clearCart, addToCart, updateCartQty } from '../state.js';
import { translations } from '../constants.js';

export function renderPOS() {
    renderPOSCategoryTabs();
    renderPOSProducts();
    renderPOSCustomerDropdown();
    renderCart();

    // Populate Barcode Simulator select
    const barcodeSelect = document.getElementById("barcode-select-product");
    if (barcodeSelect) {
        barcodeSelect.innerHTML = state.products.map(p => `<option value="${p.id}">${p.name} (${p.barcode})</option>`).join('');
    }
}

export function renderPOSCategoryDropdowns() {
    const prodCatSelect = document.getElementById("prod-category");
    if (prodCatSelect) {
        prodCatSelect.innerHTML = state.categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    const invCatFilter = document.getElementById("inventory-category-filter");
    if (invCatFilter) {
        const currentVal = invCatFilter.value;
        invCatFilter.innerHTML = `<option value="all">${state.language === "ar" ? "كل الفئات" : "All Categories"}</option>` +
            state.categories.map(c => `<option value="${c}">${c}</option>`).join('');
        invCatFilter.value = currentVal;
    }
}

export function renderPOSCategoryTabs() {
    const tabsContainer = document.getElementById("pos-category-tabs");
    const activeTab = tabsContainer.querySelector(".category-tab.active");
    const activeCategory = activeTab ? activeTab.getAttribute("data-category") : "all";

    tabsContainer.innerHTML = `<button class="category-tab ${activeCategory === 'all' ? 'active' : ''}" data-category="all">${state.language === "ar" ? "الكل" : "All"}</button>`;

    state.categories.forEach(c => {
        const cleanName = state.language === "ar" ? c.split(' ')[0] : c.includes('(') ? c.split('(')[1].replace(')', '') : c;
        const tab = document.createElement("button");
        tab.className = `category-tab ${activeCategory === c ? 'active' : ''}`;
        tab.setAttribute("data-category", c);
        tab.textContent = cleanName;
        tab.addEventListener("click", () => {
            tabsContainer.querySelectorAll(".category-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            renderPOSProducts();
        });
        tabsContainer.appendChild(tab);
    });
}

export function renderPOSProducts() {
    const grid = document.getElementById("pos-products-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const searchQueryInput = document.getElementById("pos-search-input");
    const searchQuery = searchQueryInput ? searchQueryInput.value.toLowerCase() : "";
    const activeTab = document.querySelector("#pos-category-tabs .category-tab.active");
    const activeCategory = activeTab ? activeTab.getAttribute("data-category") : "all";

    const filtered = state.products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.barcode.includes(searchQuery);
        const matchesCategory = activeCategory === "all" || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><i data-lucide="package-x"></i><p>${state.language === "ar" ? "لا توجد منتجات مطابقة" : "No matching products"}</p></div>`;
        lucide.createIcons();
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        if (p.stock === 0) card.style.opacity = "0.6";

        let badgeHtml = "";
        if (p.stock === 0) {
            badgeHtml = `<span class="badge badge-danger product-card-badge">${state.language === "ar" ? "نفذ" : "Out"}</span>`;
        } else if (p.stock <= state.settings.lowStockLimit) {
            badgeHtml = `<span class="badge badge-warning product-card-badge">${state.language === "ar" ? "منخفض" : "Low"}</span>`;
        }

        card.innerHTML = `
            ${badgeHtml}
            <div class="product-card-image">
                ${p.image ? `<img src="${p.image}" alt="${p.name}">` : `<i data-lucide="package"></i>`}
            </div>
            <span class="product-card-name">${p.name}</span>
            <span class="product-card-price">${p.price.toFixed(2)} ${state.settings.currency}</span>
            <span class="product-card-stock">${state.language === "ar" ? "المخزون:" : "Stock:"} ${p.stock}</span>
        `;

        card.addEventListener("click", () => {
            if (p.stock > 0) {
                addToCart(p.id);
            } else {
                if (window.showToast) {
                    window.showToast(state.language === "ar" ? "هذا المنتج غير متوفر في المخزن حالياً!" : "This product is currently out of stock!", "danger");
                }
            }
        });

        grid.appendChild(card);
    });
    lucide.createIcons();
}

export function renderPOSCustomerDropdown() {
    const select = document.getElementById("cart-customer-select");
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = `<option value="walkin">${state.language === "ar" ? "عميل سفري (نقدي)" : "Walk-in Customer (Cash)"}</option>` +
        state.customers.map(c => `<option value="${c.id}">${c.name} (${c.phone})</option>`).join('');
    select.value = currentVal;
}

export function renderCart() {
    const container = document.getElementById("cart-items-container");
    if (!container) return;
    container.innerHTML = "";

    if (state.cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-state">
                <i data-lucide="shopping-cart"></i>
                <p>${state.language === "ar" ? "السلة فارغة. اضغط على المنتجات لإضافتها." : "Cart is empty. Click products to add them."}</p>
            </div>
        `;
        updateCartSummary();
        lucide.createIcons();
        return;
    }

    state.cart.forEach(item => {
        const prod = state.products.find(p => p.id === item.productId);
        if (!prod) return;

        const cartItemEl = document.createElement("div");
        cartItemEl.className = "cart-item";
        cartItemEl.innerHTML = `
            <div class="cart-item-details">
                <div class="cart-item-name">${prod.name}</div>
                <div class="cart-item-price">${prod.price.toFixed(2)} ${state.settings.currency}</div>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="updateCartQty('${prod.id}', -1)">-</button>
                <span class="qty-val">${item.qty}</span>
                <button class="qty-btn" onclick="updateCartQty('${prod.id}', 1)">+</button>
            </div>
            <div class="cart-item-total">${(prod.price * item.qty).toFixed(2)} ${state.settings.currency}</div>
        `;
        container.appendChild(cartItemEl);
    });

    updateCartSummary();
    lucide.createIcons();
}

export function updateCartSummary() {
    let subtotal = 0;
    state.cart.forEach(item => {
        subtotal += item.price * item.qty;
    });

    const discountInput = document.getElementById("cart-discount-input");
    const discountPercent = discountInput ? (parseFloat(discountInput.value) || 0) : 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (state.settings.taxRate / 100);
    const total = taxableAmount + taxAmount;

    const subtotalEl = document.getElementById("cart-subtotal");
    const taxEl = document.getElementById("cart-tax");
    const totalEl = document.getElementById("cart-total");

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} ${state.settings.currency}`;
    if (taxEl) taxEl.textContent = `${taxAmount.toFixed(2)} ${state.settings.currency}`;
    if (totalEl) totalEl.textContent = `${total.toFixed(2)} ${state.settings.currency}`;
}

export function handleCheckout() {
    if (state.cart.length === 0) {
        if (window.showToast) {
            window.showToast(state.language === "ar" ? "السلة فارغة!" : "Cart is empty!", "danger");
        }
        return;
    }

    const customerId = document.getElementById("cart-customer-select").value;
    const discountPercent = parseFloat(document.getElementById("cart-discount-input").value) || 0;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

    let subtotal = 0;
    let totalCost = 0;
    state.cart.forEach(item => {
        subtotal += item.price * item.qty;
        const prod = state.products.find(p => p.id === item.productId);
        if (prod) totalCost += prod.cost * item.qty;
    });

    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (state.settings.taxRate / 100);
    const finalTotal = taxableAmount + taxAmount;
    const profit = finalTotal - totalCost;

    // Create transaction
    const transactionId = (1000 + state.transactions.length + 1).toString();
    const transaction = {
        id: transactionId,
        date: new Date().toISOString(),
        customerId: customerId,
        items: [...state.cart],
        subtotal: subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: finalTotal,
        profit: profit,
        paymentMethod: paymentMethod
    };

    // Deduct stock
    state.cart.forEach(item => {
        const prod = state.products.find(p => p.id === item.productId);
        if (prod) prod.stock -= item.qty;
    });

    // Award loyalty points to customer
    if (customerId !== "walkin") {
        const customer = state.customers.find(c => c.id === customerId);
        if (customer) {
            customer.points += Math.floor(finalTotal / 10); // 1 point for every 10 currency units
            customer.totalSpent += finalTotal;
            customer.visits++;
        }
    }

    state.transactions.push(transaction);
    saveState();

    // Show Receipt Modal
    showReceipt(transaction);
}

export function showReceipt(t) {
    const modal = document.getElementById("receipt-modal");
    if (!modal) return;

    document.getElementById("receipt-store-name").textContent = state.settings.storeName;
    document.getElementById("receipt-id").textContent = `#${t.id}`;
    document.getElementById("receipt-date").textContent = t.date.replace('T', ' ').substring(0, 16);

    const customerName = t.customerId === "walkin" ? (state.language === "ar" ? "عميل سفري" : "Walk-in") : (state.customers.find(c => c.id === t.customerId)?.name || t.customerId);
    document.getElementById("receipt-customer").textContent = customerName;

    const itemsBody = document.getElementById("receipt-items-body");
    itemsBody.innerHTML = "";
    t.items.forEach(item => {
        const prod = state.products.find(p => p.id === item.productId);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${prod ? prod.name : "منتج غير معروف"}</td>
            <td>${item.qty}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>${(item.price * item.qty).toFixed(2)}</td>
        `;
        itemsBody.appendChild(row);
    });

    document.getElementById("receipt-subtotal").textContent = `${t.subtotal.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("receipt-discount").textContent = `${t.discount.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("receipt-tax").textContent = `${t.tax.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("receipt-total").textContent = `${t.total.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("receipt-barcode-text").textContent = `TXN-${t.id}`;

    modal.classList.add("active");
    lucide.createIcons();
}

export function viewReceipt(txnId) {
    const t = state.transactions.find(x => x.id === txnId);
    if (t) showReceipt(t);
}
