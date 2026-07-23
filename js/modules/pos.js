import { state, saveState, clearCart, addToCart, updateCartQty } from '../state.js';
import { translations } from '../constants.js';

export function renderPOS() {
    renderPOSCustomerDropdown();
    renderCart();

    const posSearch = document.getElementById("barcode-input");
    if (posSearch && !posSearch.dataset.listenerAttached) {
        posSearch.dataset.listenerAttached = "true";

        // Listen for input to show suggestions
        posSearch.addEventListener("input", (e) => {
            showSearchSuggestions(e.target.value);
        });

        // Listen for Enter key to add matching item
        posSearch.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const value = posSearch.value.trim();
                if (!value) return;

                // 1. Try to find exact barcode match
                let prod = state.products.find(p => p.barcode === value);
                
                // 2. If no exact barcode, check if there is a suggestion and pick the first one
                if (!prod) {
                    const filtered = state.products.filter(p => 
                        p.name.toLowerCase().includes(value.toLowerCase()) || 
                        p.barcode.includes(value)
                    );
                    if (filtered.length > 0) {
                        prod = filtered[0];
                    }
                }

                if (prod) {
                    if (prod.stock > 0) {
                        addToCart(prod.id);
                        posSearch.value = "";
                        const suggestionsContainer = document.getElementById("search-suggestions");
                        if (suggestionsContainer) {
                            suggestionsContainer.style.display = "none";
                            suggestionsContainer.innerHTML = "";
                        }
                        if (window.showToast) {
                            window.showToast(state.language === "ar" ? `تمت إضافة ${prod.name}` : `Added ${prod.name}`, "success");
                        }
                    } else {
                        if (window.showToast) {
                            window.showToast(state.language === "ar" ? "المنتج منتهي من المخزن!" : "Product is out of stock!", "danger");
                        }
                    }
                } else {
                    if (window.showToast) {
                        window.showToast(state.language === "ar" ? "المنتج غير مسجل في المخازن!" : "Product not found!", "danger");
                    }
                }
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".search-autocomplete-wrapper")) {
                const suggestionsContainer = document.getElementById("search-suggestions");
                if (suggestionsContainer) {
                    suggestionsContainer.style.display = "none";
                }
            }
        });
    }
}

export function showSearchSuggestions(query) {
    const suggestionsContainer = document.getElementById("search-suggestions");
    if (!suggestionsContainer) return;

    const cleanedQuery = (query || "").toLowerCase().trim();
    if (!cleanedQuery) {
        suggestionsContainer.style.display = "none";
        suggestionsContainer.innerHTML = "";
        return;
    }

    // Filter products
    const filtered = state.products.filter(p => 
        p.name.toLowerCase().includes(cleanedQuery) || 
        p.barcode.includes(cleanedQuery)
    );

    if (filtered.length === 0) {
        suggestionsContainer.innerHTML = `<div class="suggestion-item empty">${state.language === "ar" ? "لا توجد نتائج مطابقة" : "No results found"}</div>`;
        suggestionsContainer.style.display = "block";
        return;
    }

    suggestionsContainer.innerHTML = "";
    filtered.slice(0, 10).forEach(prod => {
        const itemEl = document.createElement("div");
        itemEl.className = "suggestion-item";
        if (prod.stock <= 0) itemEl.classList.add("out-of-stock");
        
        itemEl.innerHTML = `
            <div class="suggestion-info">
                <span class="suggestion-name">${prod.name}</span>
                <span class="suggestion-barcode">${prod.barcode}</span>
            </div>
            <div class="suggestion-meta">
                <span class="suggestion-price">${prod.price.toFixed(2)} ${state.settings.currency}</span>
                <span class="suggestion-stock ${prod.stock <= state.settings.lowStockLimit ? 'low' : ''}">
                    ${state.language === "ar" ? "المخزون:" : "Stock:"} ${prod.stock}
                </span>
            </div>
        `;

        itemEl.addEventListener("click", () => {
            if (prod.stock > 0) {
                addToCart(prod.id);
                const input = document.getElementById("barcode-input");
                if (input) input.value = "";
                suggestionsContainer.style.display = "none";
                suggestionsContainer.innerHTML = "";
                if (window.showToast) {
                    window.showToast(state.language === "ar" ? `تمت إضافة ${prod.name}` : `Added ${prod.name}`, "success");
                }
            } else {
                if (window.showToast) {
                    window.showToast(state.language === "ar" ? "المنتج غير متوفر في المخزن!" : "Product is out of stock!", "danger");
                }
            }
        });

        suggestionsContainer.appendChild(itemEl);
    });

    suggestionsContainer.style.display = "block";
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

export function renderPOSProducts() {
    // Left as a dummy function to prevent import issues in app.js
}

export function renderPOSCustomerDropdown() {
    const select = document.getElementById("cart-customer-select");
    if (!select) return;
    const currentVal = select.value || "walkin";
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
            <tr>
                <td colspan="5" class="empty-cart-state" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="ri-shopping-cart-2-line" style="font-size: 3rem; display: block; margin-bottom: 10px;"></i>
                    <span>${state.language === "ar" ? "السلة فارغة. ابحث عن المنتجات لإضافتها." : "Cart is empty. Search products to add."}</span>
                </td>
            </tr>
        `;
        updateCartSummary();
        if (window.lucide) lucide.createIcons();
        return;
    }

    state.cart.forEach(item => {
        const prod = state.products.find(p => p.id === item.productId);
        if (!prod) return;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="cart-item-info">
                    <span class="cart-item-name">${prod.name}</span>
                    <span class="cart-item-barcode">${prod.barcode}</span>
                </div>
            </td>
            <td>${prod.price.toFixed(2)} ${state.settings.currency}</td>
            <td style="text-align: center;">
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="window.updateCartQty('${prod.id}', -1)">-</button>
                    <span class="qty-val">${item.qty}</span>
                    <button class="qty-btn" onclick="window.updateCartQty('${prod.id}', 1)">+</button>
                </div>
            </td>
            <td>${(prod.price * item.qty).toFixed(2)} ${state.settings.currency}</td>
            <td style="text-align: center;">
                <button class="btn btn-sm btn-danger-outline" onclick="window.updateCartQty('${prod.id}', -${item.qty})">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </td>
        `;
        container.appendChild(tr);
    });

    updateCartSummary();
    if (window.lucide) lucide.createIcons();
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
    if (taxEl) taxEl.textContent = `${taxAmount.toFixed(2)} ${state.settings.currency} (${state.settings.taxRate}%)`;
    if (totalEl) totalEl.textContent = `${total.toFixed(2)} ${state.settings.currency}`;
}

export function handleCheckout() {
    if (state.cart.length === 0) {
        if (window.showToast) {
            window.showToast(state.language === "ar" ? "السلة فارغة!" : "Cart is empty!", "danger");
        }
        return;
    }

    const customerSelect = document.getElementById("cart-customer-select");
    const customerId = customerSelect ? customerSelect.value : "walkin";

    const discountInput = document.getElementById("cart-discount-input");
    const discountPercent = discountInput ? (parseFloat(discountInput.value) || 0) : 0;

    const checkedPaymentEl = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = checkedPaymentEl ? checkedPaymentEl.value : "cash";

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
        paymentMethod: paymentMethod,
        status: "completed"
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
            customer.points += Math.floor(finalTotal / 10);
            customer.totalSpent += finalTotal;
            customer.visits++;
        }
    }

    state.transactions.push(transaction);
    saveState();

    // Show Receipt Modal
    showReceipt(transaction);
    
    if (window.showToast) {
        window.showToast(state.language === "ar" ? "تمت العملية بنجاح!" : "Transaction completed successfully!", "success");
    }
}

export function showReceipt(t) {
    const modal = document.getElementById("receipt-modal");
    if (!modal) return;

    const storeNameEl = document.getElementById("receipt-store-name");
    const idEl = document.getElementById("receipt-id");
    const dateEl = document.getElementById("receipt-date");
    const customerEl = document.getElementById("receipt-customer");
    const itemsBody = document.getElementById("receipt-items-body");

    if (storeNameEl) storeNameEl.textContent = state.settings.storeName;
    if (idEl) idEl.textContent = `#${t.id}`;
    if (dateEl) dateEl.textContent = t.date.replace('T', ' ').substring(0, 16);

    const customerName = t.customerId === "walkin" ? (state.language === "ar" ? "عميل سفري" : "Walk-in") : (state.customers.find(c => c.id === t.customerId)?.name || t.customerId);
    if (customerEl) customerEl.textContent = customerName;

    if (itemsBody) {
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
    }

    const subtotalEl = document.getElementById("receipt-subtotal");
    const discountEl = document.getElementById("receipt-discount");
    const taxEl = document.getElementById("receipt-tax");
    const totalEl = document.getElementById("receipt-total");
    const barcodeEl = document.getElementById("receipt-barcode-text");

    if (subtotalEl) subtotalEl.textContent = `${t.subtotal.toFixed(2)} ${state.settings.currency}`;
    if (discountEl) discountEl.textContent = `${t.discount.toFixed(2)} ${state.settings.currency}`;
    if (taxEl) taxEl.textContent = `${t.tax.toFixed(2)} ${state.settings.currency}`;
    if (totalEl) totalEl.textContent = `${t.total.toFixed(2)} ${state.settings.currency}`;
    if (barcodeEl) barcodeEl.textContent = `TXN-${t.id}`;

    modal.classList.add("active");
    if (window.lucide) lucide.createIcons();
}

export function viewReceipt(txnId) {
    const t = state.transactions.find(x => x.id === txnId);
    if (t) showReceipt(t);
}

export function closeReceiptModal() {
    const modal = document.getElementById("receipt-modal");
    if (modal) modal.classList.remove("active");
}

export function printReceipt() {
    window.print();
}
