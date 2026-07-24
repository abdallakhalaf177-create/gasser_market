import { state, saveState, clearCart, addToCart, updateCartQty } from '../state.js';
import { translations } from '../constants.js';

// ============================================================
// POS MODULE — Cashier screen, cart, checkout, receipts
// ============================================================

export function renderPOS() {
    renderPOSCustomerDropdown();
    renderCart();

    // Show shift status indicator badge in POS header
    const shiftBadge = document.getElementById("pos-shift-status");
    if (shiftBadge) {
        const isActive = state.currentShift && state.currentShift.status === "active";
        if (isActive) {
            shiftBadge.innerHTML = `<i class="ri-time-line"></i> وردية مفتوحة — الكاشير: ${state.currentShift.cashierName || 'الكاشير'}`;
            shiftBadge.className = "shift-badge shift-open";
        } else {
            shiftBadge.innerHTML = `<i class="ri-lock-line"></i> وردية مغلقة — اضغط لفتح وردية جديدة`;
            shiftBadge.className = "shift-badge shift-closed";
        }
        shiftBadge.onclick = () => { if (window.openShiftModal) window.openShiftModal(); };
    }

    // Setup barcode/search input listener (once)
    const posSearch = document.getElementById("barcode-input");
    if (posSearch && !posSearch.dataset.listenerAttached) {
        posSearch.dataset.listenerAttached = "true";

        posSearch.addEventListener("input", (e) => {
            showSearchSuggestions(e.target.value);
        });

        posSearch.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const val = posSearch.value.trim();
                if (!val) return;

                // Try exact barcode match
                const byBarcode = (state.products || []).find(p => p.barcode === val);
                if (byBarcode) {
                    addToCart(byBarcode.id);
                    posSearch.value = "";
                    const sug = document.getElementById("search-suggestions");
                    if (sug) sug.style.display = "none";
                    renderCart();
                    if (window.showToast) window.showToast(`تم إضافة "${byBarcode.name}" للسلة`, "success");
                } else {
                    // Show suggestions if not exact match
                    showSearchSuggestions(val);
                }
            }
        });
    }
}

function showSearchSuggestions(query) {
    const container = document.getElementById("search-suggestions");
    if (!container) return;

    if (!query || query.length < 1) {
        container.style.display = "none";
        return;
    }

    const q = query.toLowerCase();
    const matches = (state.products || []).filter(p =>
        p.stock > 0 && (
            (p.name || "").toLowerCase().includes(q) ||
            (p.barcode || "").includes(q) ||
            (p.category || "").toLowerCase().includes(q)
        )
    ).slice(0, 8);

    if (matches.length === 0) {
        container.innerHTML = `<div style="padding:12px;color:var(--text-muted);text-align:center;">لا توجد منتجات مطابقة</div>`;
        container.style.display = "block";
        return;
    }

    container.innerHTML = "";
    matches.forEach(p => {
        const itemEl = document.createElement("div");
        itemEl.className = "suggestion-item";
        itemEl.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border-color);transition:background 0.15s;";
        itemEl.innerHTML = `
            <div>
                <strong>${p.name}</strong>
                <span style="font-size:12px;color:var(--text-muted);margin-right:8px;">${p.barcode}</span>
            </div>
            <div style="text-align:left;">
                <strong style="color:var(--success);">${p.price.toFixed(2)} ${state.settings.currency}</strong>
                <span style="font-size:11px;color:var(--text-muted);display:block;">متاح: ${p.stock}</span>
            </div>
        `;
        itemEl.addEventListener("mouseenter", () => itemEl.style.background = "var(--bg-hover)");
        itemEl.addEventListener("mouseleave", () => itemEl.style.background = "");
        itemEl.addEventListener("click", () => {
            addToCart(p.id);
            const input = document.getElementById("barcode-input");
            if (input) input.value = "";
            container.style.display = "none";
            renderCart();
            if (window.playBeep) window.playBeep(880, 0.08);
        });
        container.appendChild(itemEl);
    });

    container.style.display = "block";
}

export function renderPOSCategoryDropdowns() {
    const prodCatSelect = document.getElementById("prod-category");
    if (prodCatSelect) {
        prodCatSelect.innerHTML = (state.categories || []).map(c => `<option value="${c}">${c}</option>`).join('');
    }
    const invCatFilter = document.getElementById("inventory-category-filter");
    if (invCatFilter) {
        const currentVal = invCatFilter.value;
        invCatFilter.innerHTML = `<option value="all">${state.language === "ar" ? "كل الفئات" : "All Categories"}</option>` +
            (state.categories || []).map(c => `<option value="${c}">${c}</option>`).join('');
        invCatFilter.value = currentVal;
    }
}

export function renderPOSProducts() {
    // No-op — products are shown via search suggestions
}

export function renderPOSCustomerDropdown() {
    const select = document.getElementById("cart-customer-select");
    if (!select) return;
    const currentVal = select.value || "walkin";
    select.innerHTML =
        `<option value="walkin">${state.language === "ar" ? "عميل سفري (نقدي)" : "Walk-in Customer (Cash)"}</option>` +
        (state.customers || []).map(c =>
            `<option value="${c.id}">${c.name} (${c.phone || 'بدون هاتف'})${c.balance > 0 ? ` — دين: ${c.balance.toFixed(2)}` : ''}</option>`
        ).join('');
    // Restore selection if still valid
    if ([...select.options].some(o => o.value === currentVal)) {
        select.value = currentVal;
    }
}

export function renderCart() {
    const container = document.getElementById("cart-items-container");
    if (!container) return;
    container.innerHTML = "";

    if (!state.cart || state.cart.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">
                    <i class="ri-shopping-cart-2-line" style="font-size:3rem;display:block;margin-bottom:10px;opacity:0.4;"></i>
                    <span>${state.language === "ar" ? "السلة فارغة — ابحث عن المنتجات لإضافتها" : "Cart is empty. Search products to add."}</span>
                </td>
            </tr>`;
        updateCartSummary();
        return;
    }

    state.cart.forEach(item => {
        const prod = (state.products || []).find(p => p.id === item.productId);
        if (!prod) return;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div style="display:flex;flex-direction:column;gap:2px;">
                    <span style="font-weight:700;">${prod.name}</span>
                    <span style="font-size:11px;color:var(--text-muted);">${prod.barcode}</span>
                </div>
            </td>
            <td>${prod.price.toFixed(2)} ${state.settings.currency}</td>
            <td style="text-align:center;">
                <div style="display:flex;align-items:center;gap:6px;justify-content:center;">
                    <button class="qty-btn" onclick="window.updateCartQty('${prod.id}', -1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-hover);cursor:pointer;font-weight:bold;">−</button>
                    <span style="font-weight:700;min-width:24px;text-align:center;">${item.qty}</span>
                    <button class="qty-btn" onclick="window.updateCartQty('${prod.id}', 1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-hover);cursor:pointer;font-weight:bold;">+</button>
                </div>
            </td>
            <td style="font-weight:700;">${(prod.price * item.qty).toFixed(2)} ${state.settings.currency}</td>
            <td style="text-align:center;">
                <button onclick="window.updateCartQty('${prod.id}', -${item.qty})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:18px;" title="إزالة من السلة">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </td>
        `;
        container.appendChild(tr);
    });

    updateCartSummary();
    if (window.lucide) window.lucide.createIcons();
}

export function updateCartSummary() {
    let subtotal = 0;
    (state.cart || []).forEach(item => {
        const prod = (state.products || []).find(p => p.id === item.productId);
        if (prod) subtotal += prod.price * item.qty;
    });

    const discountInput = document.getElementById("cart-discount-input");
    const discountPercent = discountInput ? (parseFloat(discountInput.value) || 0) : 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((state.settings.taxRate || 0) / 100);
    const total = taxableAmount + taxAmount;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("cart-subtotal", `${subtotal.toFixed(2)} ${state.settings.currency}`);
    set("cart-tax", `${taxAmount.toFixed(2)} ${state.settings.currency} (${state.settings.taxRate || 0}%)`);
    set("cart-total", `${total.toFixed(2)} ${state.settings.currency}`);
}

export function handleCheckout() {
    // ---- SHIFT CHECK: Block sales if shift is closed ----
    if (!state.currentShift || state.currentShift.status !== "active") {
        if (window.showToast) {
            window.showToast(
                state.language === "ar"
                    ? "🔒 الوردية مغلقة حالياً! يرجى فتح وردية جديدة للبدء في عمليات البيع."
                    : "Shift is closed! Please open a new shift to process sales.",
                "danger"
            );
        }
        if (window.openShiftModal) window.openShiftModal();
        return;
    }

    if (!state.cart || state.cart.length === 0) {
        if (window.showToast) window.showToast(state.language === "ar" ? "السلة فارغة!" : "Cart is empty!", "warning");
        return;
    }

    const customerSelect = document.getElementById("cart-customer-select");
    const customerId = customerSelect ? (customerSelect.value || "walkin") : "walkin";

    const discountInput = document.getElementById("cart-discount-input");
    const discountPercent = discountInput ? (parseFloat(discountInput.value) || 0) : 0;

    const checkedPaymentEl = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = checkedPaymentEl ? checkedPaymentEl.value : "cash";

    // ---- CREDIT PAYMENT: Must have a registered customer ----
    if (paymentMethod === "credit" && customerId === "walkin") {
        if (window.showToast) {
            window.showToast(
                state.language === "ar"
                    ? "⚠ البيع الآجل (الدين) يتطلب اختيار عميل مسجل بالنظام!"
                    : "Credit sales require selecting a registered customer!",
                "warning"
            );
        }
        return;
    }

    // ---- Compute totals & snapshot costs ----
    let subtotal = 0;
    let totalCost = 0;
    const itemsSnapshot = (state.cart || []).map(item => {
        const prod = (state.products || []).find(p => p.id === item.productId);
        const itemPrice = prod ? prod.price : (item.price || 0);
        const itemCost = item.cost !== undefined ? item.cost : (prod ? (prod.cost || 0) : 0);
        subtotal += itemPrice * item.qty;
        totalCost += itemCost * item.qty;
        return { ...item, price: itemPrice, cost: itemCost };
    });

    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((state.settings.taxRate || 0) / 100);
    const finalTotal = taxableAmount + taxAmount;
    const profit = finalTotal - totalCost;

    // ---- Deduct stock ----
    (state.cart || []).forEach(item => {
        const prod = (state.products || []).find(p => p.id === item.productId);
        if (prod) prod.stock = Math.max(0, prod.stock - item.qty);
    });

    // ---- Award loyalty points & update customer debt ----
    if (customerId !== "walkin") {
        const customer = (state.customers || []).find(c => c.id === customerId);
        if (customer) {
            customer.points = (customer.points || 0) + Math.floor(finalTotal / 10);
            customer.totalSpent = (customer.totalSpent || 0) + finalTotal;
            customer.visits = (customer.visits || 0) + 1;
            if (paymentMethod === "credit") {
                customer.balance = (customer.balance || 0) + finalTotal;
            }
        }
    }

    // ---- Create Transaction ----
    if (!state.transactions) state.transactions = [];
    const transactionId = String(1000 + state.transactions.length + 1);
    const transaction = {
        id: transactionId,
        date: new Date().toISOString(),
        customerId,
        items: itemsSnapshot,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: finalTotal,
        totalCost,
        profit,
        paymentMethod,
        cashierName: state.currentUser?.name || "الكاشير",
        shiftId: state.currentShift?.id || null,
        status: "completed"
    };

    state.transactions.push(transaction);

    // ---- Clear cart & save ----
    clearCart();
    saveState();

    // ---- Show Receipt ----
    showReceipt(transaction);

    const methodLabel = paymentMethod === "credit" ? "(بيع آجل 💳)" : paymentMethod === "card" ? "(فيزا/شبكة 💳)" : "(كاش 💵)";
    if (window.showToast) {
        window.showToast(`✅ تمت العملية بنجاح! ${methodLabel}`, "success");
    }

    if (window.refreshCurrentView) window.refreshCurrentView();
}


export function showReceipt(t) {
    const modal = document.getElementById("receipt-modal");
    if (!modal) return;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("receipt-store-name", state.settings.storeName || "Gaser Market");
    set("receipt-id", `#${t.id}`);
    set("receipt-date", t.date ? t.date.replace('T', ' ').substring(0, 16) : "—");

    const customerName = t.customerId === "walkin"
        ? (state.language === "ar" ? "عميل سفري" : "Walk-in")
        : ((state.customers || []).find(c => c.id === t.customerId)?.name || t.customerId);
    set("receipt-customer", customerName);

    const itemsBody = document.getElementById("receipt-items-body");
    if (itemsBody) {
        itemsBody.innerHTML = "";
        (t.items || []).forEach(item => {
            const prod = (state.products || []).find(p => p.id === item.productId);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${prod ? prod.name : (item.name || "منتج")}</td>
                <td>${item.qty}</td>
                <td>${(item.price || 0).toFixed(2)}</td>
                <td>${((item.price || 0) * item.qty).toFixed(2)}</td>
            `;
            itemsBody.appendChild(row);
        });
    }

    set("receipt-subtotal", `${(t.subtotal || 0).toFixed(2)} ${state.settings.currency}`);
    set("receipt-discount", `${(t.discount || 0).toFixed(2)} ${state.settings.currency}`);
    set("receipt-tax", `${(t.tax || 0).toFixed(2)} ${state.settings.currency}`);
    set("receipt-total", `${(t.total || 0).toFixed(2)} ${state.settings.currency}`);
    set("receipt-barcode-text", `TXN-${t.id}`);

    modal.classList.add("active");
    if (window.lucide) window.lucide.createIcons();
}

export function viewReceipt(txnId) {
    const t = (state.transactions || []).find(x => x.id === txnId);
    if (t) showReceipt(t);
}

export function closeReceiptModal() {
    const modal = document.getElementById("receipt-modal");
    if (modal) modal.classList.remove("active");
}

export function printReceipt() {
    window.print();
}
