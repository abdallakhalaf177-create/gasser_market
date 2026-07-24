import { state, saveState } from '../state.js';

// ============================================================
// SUPPLIERS MODULE — Full CRUD + WAC + Credit Purchases + Settlements
// ============================================================

export function renderSuppliers() {
    _populatePurchaseDropdowns();

    const totalSuppliers = (state.suppliers || []).length;
    const totalBalance = (state.suppliers || []).reduce((sum, s) => sum + (s.balance || 0), 0);
    const totalPurchasesCount = (state.purchaseInvoices || []).length;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("sup-stat-total", totalSuppliers);
    set("sup-stat-balance", `${totalBalance.toFixed(2)} ${state.settings.currency}`);
    set("sup-stat-purchases", totalPurchasesCount);

    renderSuppliersTable();
}

function _populatePurchaseDropdowns() {
    const purSupplierSel = document.getElementById("pur-supplier");
    if (purSupplierSel) {
        const suppliers = state.suppliers || [];
        if (suppliers.length > 0) {
            purSupplierSel.innerHTML = suppliers.map(s =>
                `<option value="${s.id}">${s.company || s.name}</option>`
            ).join('');
        } else {
            purSupplierSel.innerHTML = `<option value="">لا يوجد موردين — أضف مورداً أولاً</option>`;
        }
    }

    const purProductSel = document.getElementById("pur-product");
    if (purProductSel) {
        const products = state.products || [];
        if (products.length > 0) {
            purProductSel.innerHTML = products.map(p =>
                `<option value="${p.id}">${p.name} (${p.barcode}) — تكلفة حالية: ${(p.cost || 0).toFixed(2)} ${state.settings.currency}</option>`
            ).join('');

            // Auto-fill cost when product changes
            const fillCost = () => {
                const prod = products.find(x => x.id === purProductSel.value);
                const costInput = document.getElementById("pur-cost");
                if (prod && costInput) costInput.value = (prod.cost || 0).toFixed(2);
            };
            purProductSel.onchange = fillCost;
            fillCost(); // fill on initial load
        } else {
            purProductSel.innerHTML = `<option value="">لا يوجد منتجات بالمخزن</option>`;
        }
    }
}

export function openSupplierModal() {
    const modal = document.getElementById("supplier-modal");
    const form = document.getElementById("supplier-form");
    if (form) form.reset();
    const idField = document.getElementById("supplier-id");
    if (idField) idField.value = "";
    const titleEl = document.getElementById("supplier-modal-title");
    if (titleEl) titleEl.textContent = state.language === "ar" ? "إضافة مورد جديد" : "Add New Supplier";
    if (modal) modal.classList.add("active");
}

export function openPurchaseModal() {
    _populatePurchaseDropdowns();
    const form = document.getElementById("purchase-form");
    if (form) form.reset();
    // Re-fill after reset
    _populatePurchaseDropdowns();
    // Reset partial wrapper
    const wrapper = document.getElementById("pur-paid-amount-wrapper");
    if (wrapper) wrapper.style.display = "none";
    const modal = document.getElementById("purchase-modal");
    if (modal) modal.classList.add("active");
}

export function renderSuppliersTable() {
    const tbody = document.getElementById("suppliers-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const searchEl = document.getElementById("supplier-search-input");
    const searchQuery = searchEl ? searchEl.value.toLowerCase().trim() : "";
    const suppliers = state.suppliers || [];
    const filtered = suppliers.filter(s =>
        (s.company || "").toLowerCase().includes(searchQuery) ||
        (s.name || "").toLowerCase().includes(searchQuery) ||
        (s.phone || "").includes(searchQuery)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">لا يوجد موردين مطابقون</td></tr>`;
        return;
    }

    filtered.forEach(s => {
        const balance = s.balance || 0;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${s.company || '—'}</strong></td>
            <td>${s.name || '—'}</td>
            <td><code>${s.phone || '—'}</code></td>
            <td><strong class="${balance > 0 ? 'text-danger' : 'text-success'}">${balance.toFixed(2)} ${state.settings.currency}</strong></td>
            <td>${(s.totalPurchases || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${s.lastUpdated || '—'}</td>
            <td>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="window.editSupplier('${s.id}')" title="تعديل">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="window.openSettleModal('${s.id}')"
                        title="سداد دفعة" ${balance <= 0 ? 'disabled style="opacity:0.4;"' : ''}>
                        <i class="ri-wallet-line"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.deleteSupplier('${s.id}')" title="حذف">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (window.lucide) window.lucide.createIcons();
}

export function handleSupplierFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("supplier-id")?.value;
    const company = document.getElementById("sup-company")?.value?.trim();
    const name = document.getElementById("sup-name")?.value?.trim();
    const phone = document.getElementById("sup-phone")?.value?.trim();
    const balance = parseFloat(document.getElementById("sup-balance")?.value) || 0;

    if (!company) {
        if (window.showToast) window.showToast("يرجى إدخال اسم الشركة / المورد!", "danger");
        return;
    }

    if (!state.suppliers) state.suppliers = [];

    if (id) {
        const idx = state.suppliers.findIndex(s => s.id === id);
        if (idx !== -1) {
            state.suppliers[idx] = { ...state.suppliers[idx], company, name, phone, balance, lastUpdated: new Date().toISOString().split('T')[0] };
        }
    } else {
        state.suppliers.push({
            id: "s_" + Date.now(), company, name, phone, balance,
            totalPurchases: 0, lastUpdated: new Date().toISOString().split('T')[0]
        });
    }

    saveState();
    const modal = document.getElementById("supplier-modal");
    if (modal) modal.classList.remove("active");
    const form = document.getElementById("supplier-form");
    if (form) form.reset();
    const idEl = document.getElementById("supplier-id");
    if (idEl) idEl.value = "";

    if (window.showToast) window.showToast(id ? "تم تحديث بيانات المورد بنجاح!" : "تم إضافة المورد الجديد بنجاح!", "success");
    renderSuppliers();
}

export function editSupplier(id) {
    const s = (state.suppliers || []).find(x => x.id === id);
    if (!s) return;

    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val; };
    set("supplier-id", s.id);
    set("sup-company", s.company || "");
    set("sup-name", s.name || "");
    set("sup-phone", s.phone || "");
    set("sup-balance", s.balance || 0);

    const titleEl = document.getElementById("supplier-modal-title");
    if (titleEl) titleEl.textContent = "تعديل بيانات المورد";
    const modal = document.getElementById("supplier-modal");
    if (modal) modal.classList.add("active");
}

export function deleteSupplier(id) {
    if (!confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا المورد؟" : "Delete this supplier?")) return;
    state.suppliers = (state.suppliers || []).filter(s => s.id !== id);
    saveState();
    renderSuppliers();
    if (window.showToast) window.showToast("تم حذف المورد بنجاح.", "warning");
}

export function handlePurchaseFormSubmit(e) {
    e.preventDefault();

    const supplierId  = document.getElementById("pur-supplier")?.value;
    const productId   = document.getElementById("pur-product")?.value;
    const newBatchCost = parseFloat(document.getElementById("pur-cost")?.value) || 0;
    const qty          = parseInt(document.getElementById("pur-qty")?.value) || 0;
    const paymentStatus = document.getElementById("pur-payment")?.value || "paid";

    if (!supplierId || !productId) {
        if (window.showToast) window.showToast("يرجى اختيار المورد والمنتج!", "danger");
        return;
    }
    if (qty <= 0) {
        if (window.showToast) window.showToast("يرجى إدخال كمية توريد صحيحة!", "danger");
        return;
    }
    if (newBatchCost <= 0) {
        if (window.showToast) window.showToast("يرجى إدخال سعر التكلفة الصحيح!", "danger");
        return;
    }

    const totalCost = newBatchCost * qty;

    // ---- WAC: Update Product Stock & Weighted Average Cost ----
    const prod = (state.products || []).find(p => p.id === productId);
    if (prod) {
        const currentStock = Math.max(0, prod.stock || 0);
        const currentCost = prod.cost || 0;
        const totalStockAfter = currentStock + qty;

        // WAC = ((currentStock × currentCost) + (newQty × newCost)) / totalStockAfter
        prod.cost = totalStockAfter > 0
            ? parseFloat(((currentStock * currentCost + qty * newBatchCost) / totalStockAfter).toFixed(4))
            : newBatchCost;

        prod.stock = totalStockAfter;
    }

    // ---- Update Supplier Balance & totals ----
    const sup = (state.suppliers || []).find(s => s.id === supplierId);
    if (sup) {
        sup.totalPurchases = (sup.totalPurchases || 0) + totalCost;

        if (paymentStatus === "credit") {
            // Full credit — entire invoice on account
            sup.balance = (sup.balance || 0) + totalCost;
        } else if (paymentStatus === "partial") {
            // Partial — remaining unpaid portion on account
            const paidNow = parseFloat(document.getElementById("pur-paid-amount")?.value) || 0;
            const remaining = Math.max(0, totalCost - paidNow);
            if (remaining > 0) sup.balance = (sup.balance || 0) + remaining;
        }
        // "paid" — fully paid, no change to balance

        sup.lastUpdated = new Date().toISOString().split('T')[0];
    }

    // ---- Log Purchase Invoice ----
    if (!state.purchaseInvoices) state.purchaseInvoices = [];
    state.purchaseInvoices.push({
        id: String(2000 + state.purchaseInvoices.length + 1),
        date: new Date().toISOString(),
        supplierId,
        supplierName: sup ? sup.company : "—",
        productId,
        productName: prod ? prod.name : "—",
        qty,
        cost: newBatchCost,
        totalCost,
        paymentStatus,
        newWAC: prod ? prod.cost : newBatchCost
    });

    saveState();

    const modal = document.getElementById("purchase-modal");
    if (modal) modal.classList.remove("active");
    const form = document.getElementById("purchase-form");
    if (form) form.reset();
    // Reset partial wrapper visibility
    const wrapper = document.getElementById("pur-paid-amount-wrapper");
    if (wrapper) wrapper.style.display = "none";

    if (window.showToast) {
        window.showToast(
            `✅ تم توريد ${qty} قطعة من "${prod?.name || '—'}" وتحديث متوسط التكلفة إلى ${prod ? prod.cost.toFixed(2) : newBatchCost} ${state.settings.currency}!`,
            "success"
        );
    }

    renderSuppliers();
}

export function openSettleModal(id) {
    const s = (state.suppliers || []).find(x => x.id === id);
    if (!s) return;

    const modal = document.getElementById("settle-modal");
    if (!modal) return;

    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };
    const setVal = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val; };

    setVal("settle-supplier-id", s.id);
    set("settle-supplier-name", s.company || s.name);
    set("settle-current-balance", `${(s.balance || 0).toFixed(2)} ${state.settings.currency}`);
    setVal("settle-amount", "");

    const amountEl = document.getElementById("settle-amount");
    if (amountEl) {
        amountEl.max = s.balance || 0;
        amountEl.placeholder = `الحد الأقصى: ${(s.balance || 0).toFixed(2)}`;
    }

    modal.classList.add("active");
}

export function handleSettleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("settle-supplier-id")?.value;
    const amount = parseFloat(document.getElementById("settle-amount")?.value) || 0;

    if (!id) {
        if (window.showToast) window.showToast("خطأ: لم يتم تحديد المورد!", "danger");
        return;
    }
    if (amount <= 0) {
        if (window.showToast) window.showToast("يرجى إدخال مبلغ السداد!", "danger");
        return;
    }

    const sup = (state.suppliers || []).find(s => s.id === id);
    if (!sup) {
        if (window.showToast) window.showToast("المورد غير موجود!", "danger");
        return;
    }

    if (amount > (sup.balance || 0)) {
        if (window.showToast) window.showToast(`المبلغ (${amount.toFixed(2)}) يتجاوز المديونية المستحقة (${(sup.balance||0).toFixed(2)})!`, "warning");
        return;
    }

    sup.balance = Math.max(0, (sup.balance || 0) - amount);
    sup.lastUpdated = new Date().toISOString().split('T')[0];

    if (!state.supplierPayments) state.supplierPayments = [];
    state.supplierPayments.push({
        id: "spay_" + Date.now(),
        supplierId: sup.id,
        supplierName: sup.company,
        amount,
        date: new Date().toISOString(),
        paymentMethod: "cash"
    });

    saveState();

    const modal = document.getElementById("settle-modal");
    if (modal) modal.classList.remove("active");

    if (window.showToast) {
        window.showToast(
            `✅ تم سداد ${amount.toFixed(2)} ${state.settings.currency} للمورد "${sup.company}". المديونية المتبقية: ${sup.balance.toFixed(2)} ${state.settings.currency}`,
            "success"
        );
    }

    renderSuppliers();
}

export function renderPurchases() {
    const tbody = document.getElementById("purchases-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const invoices = state.purchaseInvoices || [];
    if (invoices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-muted);">
            لا توجد فواتير مشتريات مسجلة
        </td></tr>`;
        return;
    }

    [...invoices].reverse().forEach(inv => {
        const row = document.createElement("tr");
        const payBadge = inv.paymentStatus === "credit"
            ? `<span class="badge badge-danger">آجل</span>`
            : inv.paymentStatus === "partial"
                ? `<span class="badge badge-warning">جزئي</span>`
                : `<span class="badge badge-success">مدفوع</span>`;

        row.innerHTML = `
            <td><strong style="font-family:monospace;">#${inv.id}</strong></td>
            <td>${inv.supplierName || '—'}</td>
            <td style="font-size:13px;">${inv.date ? new Date(inv.date).toLocaleString('ar-EG') : '—'}</td>
            <td><strong>${(inv.totalCost || 0).toFixed(2)} ${state.settings.currency}</strong></td>
            <td>${payBadge}</td>
        `;
        tbody.appendChild(row);
    });
}
