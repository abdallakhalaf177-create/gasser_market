import { state, saveState } from '../state.js';
import { logPriceChange } from './inventory.js';

// ============================================================
// SUPPLIERS MODULE — Batch Purchases + Supplier Product Mapping + 2-Way Price Sync
// ============================================================

let currentBatchItems = [];

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
            purSupplierSel.onchange = () => filterPurchaseProductsBySupplier();
        } else {
            purSupplierSel.innerHTML = `<option value="">لا يوجد موردين — أضف مورداً أولاً</option>`;
        }
    }

    const showAllCheckbox = document.getElementById("pur-show-all-products");
    if (showAllCheckbox) {
        showAllCheckbox.onchange = () => filterPurchaseProductsBySupplier();
    }

    filterPurchaseProductsBySupplier();
}

export function filterPurchaseProductsBySupplier() {
    const purSupplierSel = document.getElementById("pur-supplier");
    const purProductSel = document.getElementById("pur-product");
    const showAllCheckbox = document.getElementById("pur-show-all-products");

    if (!purProductSel) return;

    const supplierId = purSupplierSel ? purSupplierSel.value : "";
    const showAll = showAllCheckbox ? showAllCheckbox.checked : false;

    const supplier = (state.suppliers || []).find(s => s.id === supplierId);
    const products = state.products || [];

    let filtered = products;
    if (!showAll && supplier && supplier.productIds && supplier.productIds.length > 0) {
        filtered = products.filter(p => supplier.productIds.includes(p.id) || p.supplier === supplier.company);
    }

    if (filtered.length > 0) {
        purProductSel.innerHTML = filtered.map(p =>
            `<option value="${p.id}">${p.name} (${p.barcode}) — شراء: ${(p.cost || 0).toFixed(2)} / بيع: ${(p.price || 0).toFixed(2)} ${state.settings.currency}</option>`
        ).join('');

        // Auto-fill cost & selling price when selected product changes
        const fillPrices = () => {
            const prod = products.find(x => x.id === purProductSel.value);
            const costInput = document.getElementById("pur-cost");
            const priceInput = document.getElementById("pur-sell-price");
            const expiryInput = document.getElementById("pur-expiry");
            if (prod) {
                if (costInput) costInput.value = (prod.cost || 0).toFixed(2);
                if (priceInput) priceInput.value = (prod.price || 0).toFixed(2);
                if (expiryInput && prod.expiry) expiryInput.value = prod.expiry;
            }
        };
        purProductSel.onchange = fillPrices;
        fillPrices();
    } else {
        purProductSel.innerHTML = `<option value="">لا توجد منتجات مخصصة لهذا المورد (اختر إظهار الكل)</option>`;
        const costInput = document.getElementById("pur-cost");
        const priceInput = document.getElementById("pur-sell-price");
        if (costInput) costInput.value = "";
        if (priceInput) priceInput.value = "";
    }
}

export function addBatchItem() {
    const prodSel = document.getElementById("pur-product");
    const productId = prodSel ? prodSel.value : "";
    const prod = (state.products || []).find(p => p.id === productId);

    if (!prod) {
        if (window.showToast) window.showToast("يرجى اختيار صنف صحيح للبيان!", "warning");
        return;
    }

    const cost = parseFloat(document.getElementById("pur-cost")?.value) || 0;
    const price = parseFloat(document.getElementById("pur-sell-price")?.value) || 0;
    const qty = parseInt(document.getElementById("pur-qty")?.value) || 1;
    const expiry = document.getElementById("pur-expiry")?.value || "";

    if (qty <= 0) {
        if (window.showToast) window.showToast("يرجى اختيار كمية أكبر من صفر!", "danger");
        return;
    }
    if (cost < 0 || price < 0) {
        if (window.showToast) window.showToast("أسعار الشراء والبيع يجب أن تكون قيم موجبة!", "danger");
        return;
    }

    const total = cost * qty;
    currentBatchItems.push({
        productId: prod.id,
        barcode: prod.barcode,
        name: prod.name,
        cost,
        price,
        qty,
        expiry,
        total
    });

    renderBatchItemsTable();

    // Reset inputs for next item
    const qtyInput = document.getElementById("pur-qty");
    if (qtyInput) qtyInput.value = 1;
    const expiryInput = document.getElementById("pur-expiry");
    if (expiryInput) expiryInput.value = "";

    if (window.showToast) window.showToast(`تم تنزيل ${qty} × ${prod.name} بجدول الفاتورة!`, "info");
}

export function removeBatchItem(index) {
    if (index >= 0 && index < currentBatchItems.length) {
        currentBatchItems.splice(index, 1);
        renderBatchItemsTable();
    }
}

export function editBatchItem(index) {
    if (index >= 0 && index < currentBatchItems.length) {
        const item = currentBatchItems[index];
        const prodSel = document.getElementById("pur-product");
        const costInput = document.getElementById("pur-cost");
        const priceInput = document.getElementById("pur-sell-price");
        const qtyInput = document.getElementById("pur-qty");
        const expiryInput = document.getElementById("pur-expiry");

        if (prodSel) prodSel.value = item.productId;
        if (costInput) costInput.value = item.cost;
        if (priceInput) priceInput.value = item.price;
        if (qtyInput) qtyInput.value = item.qty;
        if (expiryInput) expiryInput.value = item.expiry || "";

        currentBatchItems.splice(index, 1);
        renderBatchItemsTable();
    }
}

export function renderBatchItemsTable() {
    const tbody = document.getElementById("pur-batch-items-body");
    const countBadge = document.getElementById("batch-items-count");
    const totalEl = document.getElementById("pur-batch-total");

    if (countBadge) countBadge.textContent = `${currentBatchItems.length} أصناف`;

    let totalSum = 0;
    if (!tbody) return;
    tbody.innerHTML = "";

    if (currentBatchItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">لم يتم إضافة أي أصناف بعد. اختر المنتج واضغط إضافة.</td></tr>`;
        if (totalEl) totalEl.textContent = `0.00 ${state.settings.currency}`;
        return;
    }

    currentBatchItems.forEach((item, idx) => {
        totalSum += item.total;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${idx + 1}</td>
            <td><strong>${item.name}</strong> <small class="text-muted">(${item.barcode})</small></td>
            <td><span class="text-info">${item.cost.toFixed(2)} ${state.settings.currency}</span></td>
            <td><span class="text-success">${item.price.toFixed(2)} ${state.settings.currency}</span></td>
            <td><strong>${item.qty}</strong></td>
            <td><span style="font-size:11px;">${item.expiry || '-'}</span></td>
            <td><strong class="text-primary">${item.total.toFixed(2)} ${state.settings.currency}</strong></td>
            <td>
                <div style="display:flex; gap:4px;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="window.editBatchItem(${idx})" title="تعديل">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="window.removeBatchItem(${idx})" title="حذف">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (totalEl) totalEl.textContent = `${totalSum.toFixed(2)} ${state.settings.currency}`;
}

export function openSupplierModal() {
    const modal = document.getElementById("supplier-modal");
    const form = document.getElementById("supplier-form");
    if (form) form.reset();
    const idField = document.getElementById("supplier-id");
    if (idField) idField.value = "";
    const titleEl = document.getElementById("supplier-modal-title");
    if (titleEl) titleEl.textContent = state.language === "ar" ? "إضافة مورد جديد" : "Add New Supplier";

    _populateSupplierProductsDropdown([]);

    if (modal) modal.classList.add("active");
}

function _populateSupplierProductsDropdown(selectedIds = []) {
    const supProductsSel = document.getElementById("sup-products");
    if (!supProductsSel) return;
    const products = state.products || [];
    supProductsSel.innerHTML = products.map(p =>
        `<option value="${p.id}" ${selectedIds.includes(p.id) ? 'selected' : ''}>${p.name} (${p.category.split(' ')[0]})</option>`
    ).join('');
}

export function openPurchaseModal() {
    currentBatchItems = [];
    _populatePurchaseDropdowns();
    renderBatchItemsTable();

    const form = document.getElementById("purchase-form");
    if (form) form.reset();
    _populatePurchaseDropdowns();

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
        const mappedCount = (s.productIds || []).length;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <strong>${s.company || '—'}</strong>
                ${mappedCount > 0 ? `<br><small class="text-muted"><i class="ri-links-line"></i> ${mappedCount} منتج مخصص</small>` : ''}
            </td>
            <td>${s.name || '—'}</td>
            <td><code>${s.phone || '—'}</code></td>
            <td><strong class="${balance > 0 ? 'text-danger' : 'text-success'}">${balance.toFixed(2)} ${state.settings.currency}</strong></td>
            <td>${(s.totalPurchases || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${s.lastUpdated || '—'}</td>
            <td>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    <button class="btn btn-info btn-sm" onclick="window.openSupplierHistoryModal('${s.id}')" title="كشف حساب وسجل التعاملات (Timeline)">
                        <i class="ri-history-line"></i>
                    </button>
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

    const supProductsSel = document.getElementById("sup-products");
    const productIds = supProductsSel ? Array.from(supProductsSel.selectedOptions).map(o => o.value) : [];

    if (!company) {
        if (window.showToast) window.showToast("يرجى إدخال اسم الشركة / المورد!", "danger");
        return;
    }

    if (!state.suppliers) state.suppliers = [];

    if (id) {
        const idx = state.suppliers.findIndex(s => s.id === id);
        if (idx !== -1) {
            state.suppliers[idx] = { ...state.suppliers[idx], company, name, phone, balance, productIds, lastUpdated: new Date().toISOString().split('T')[0] };
        }
    } else {
        state.suppliers.push({
            id: "s_" + Date.now(), company, name, phone, balance, productIds,
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

    _populateSupplierProductsDropdown(s.productIds || []);

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

    const supplierId = document.getElementById("pur-supplier")?.value;
    const paymentStatus = document.getElementById("pur-payment")?.value || "paid";

    if (!supplierId) {
        if (window.showToast) window.showToast("يرجى اختيار المورد!", "danger");
        return;
    }

    if (currentBatchItems.length === 0) {
        if (window.showToast) window.showToast("الفاتورة فارغة! يرجى إضافة صنف واحد على الأقل قبل الحفظ.", "danger");
        return;
    }

    const totalCost = currentBatchItems.reduce((sum, item) => sum + item.total, 0);
    const invoiceId = String(2000 + (state.purchaseInvoices || []).length + 1);
    const invoiceRef = `فاتورة مشتريات #${invoiceId}`;

    // ---- 1. Process Batch Items (Two-Way Price Sync, Stock & Price History) ----
    currentBatchItems.forEach(item => {
        const prod = (state.products || []).find(p => p.id === item.productId);
        if (prod) {
            // Log Price History if prices changed
            logPriceChange(prod, item.cost, item.price, invoiceRef);

            // Two-Way Price Sync (adopt new purchase cost & selling price in system)
            prod.cost = item.cost;
            prod.price = item.price;

            // Increment Stock
            prod.stock = Math.max(0, (prod.stock || 0) + item.qty);

            // Expiry update if provided
            if (item.expiry) prod.expiry = item.expiry;
        }
    });

    // ---- 2. Update Supplier Balance & totals ----
    const sup = (state.suppliers || []).find(s => s.id === supplierId);
    let paidAmount = totalCost;
    if (sup) {
        sup.totalPurchases = (sup.totalPurchases || 0) + totalCost;

        if (paymentStatus === "credit") {
            sup.balance = (sup.balance || 0) + totalCost;
            paidAmount = 0;
        } else if (paymentStatus === "partial") {
            const paidNow = parseFloat(document.getElementById("pur-paid-amount")?.value) || 0;
            paidAmount = paidNow;
            const remaining = Math.max(0, totalCost - paidNow);
            if (remaining > 0) sup.balance = (sup.balance || 0) + remaining;
        }

        sup.lastUpdated = new Date().toISOString().split('T')[0];
    }

    // ---- 3. Log Purchase Invoice ----
    if (!state.purchaseInvoices) state.purchaseInvoices = [];
    state.purchaseInvoices.push({
        id: invoiceId,
        date: new Date().toISOString(),
        supplierId,
        supplierName: sup ? sup.company : "—",
        items: [...currentBatchItems],
        totalCost,
        paymentStatus,
        paidAmount
    });

    saveState();

    currentBatchItems = [];
    renderBatchItemsTable();

    const modal = document.getElementById("purchase-modal");
    if (modal) modal.classList.remove("active");
    const form = document.getElementById("purchase-form");
    if (form) form.reset();

    const wrapper = document.getElementById("pur-paid-amount-wrapper");
    if (wrapper) wrapper.style.display = "none";

    if (window.showToast) {
        window.showToast(
            `✅ تم حفظ فاتورة التوريد #${invoiceId} بالكامل وتحديث الأسعار والمخزن بنجاح!`,
            "success"
        );
    }

    renderSuppliers();
    if (window.refreshCurrentView) window.refreshCurrentView();
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
    if (window.refreshCurrentView) window.refreshCurrentView();
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

export function openSupplierHistoryModal(supplierId) {
    const sup = (state.suppliers || []).find(s => s.id === supplierId);
    if (!sup) return;

    const setVal = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setVal("sup-details-name", sup.company || sup.name || "—");
    setVal("sup-details-total", `${(sup.totalPurchases || 0).toFixed(2)} ${state.settings.currency}`);
    setVal("sup-details-balance", `${(sup.balance || 0).toFixed(2)} ${state.settings.currency}`);

    const timelineContainer = document.getElementById("supplier-timeline-container");
    if (!timelineContainer) return;

    timelineContainer.innerHTML = "";

    const invoices = (state.purchaseInvoices || []).filter(i => i.supplierId === supplierId);
    const events = [];

    invoices.forEach(inv => {
        events.push({
            type: 'purchase',
            id: inv.id,
            date: inv.deliveryDate || inv.date,
            title: `فاتورة توريد #${inv.id}`,
            subtitle: `مجموع التوريد: ${(inv.totalCost || 0).toFixed(2)} ${state.settings.currency}`,
            amount: inv.totalCost || 0,
            paymentStatus: inv.paymentStatus,
            image: inv.invoiceImage || ''
        });
    });

    if (sup.settlements && Array.isArray(sup.settlements)) {
        sup.settlements.forEach(s => {
            events.push({
                type: 'settlement',
                id: s.id,
                date: s.date,
                title: `دفعة سداد مديونية`,
                subtitle: `تم سداد مبلغ ${s.amount.toFixed(2)} ${state.settings.currency} من رصيد المديونية`,
                amount: s.amount,
                paymentStatus: 'paid',
                image: ''
            });
        });
    }

    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (events.length === 0) {
        timelineContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:30px;">لا تتوفر تعاملات سابقة مسجلة لهذا المورد</div>`;
    } else {
        events.forEach(ev => {
            const dateStr = ev.date ? new Date(ev.date).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
            const isPurchase = ev.type === 'purchase';
            const itemEl = document.createElement("div");
            itemEl.className = "timeline-item";
            itemEl.innerHTML = `
                <div class="timeline-badge ${isPurchase ? 'badge-purchase' : 'badge-settlement'}"></div>
                <div class="timeline-card">
                    <div class="timeline-header">
                        <span class="timeline-title">${ev.title}</span>
                        <span class="timeline-date">${dateStr}</span>
                    </div>
                    <div style="font-size:13px; color:var(--text-secondary);">${ev.subtitle}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                        <span class="timeline-amount ${isPurchase ? 'text-primary' : 'text-success'}">
                            ${isPurchase ? '+' : '-'}${ev.amount.toFixed(2)} ${state.settings.currency}
                        </span>
                        ${ev.image ? `<button type="button" class="btn btn-sm btn-outline" onclick="window.previewImageModal('${ev.image}')"><i class="ri-image-line"></i> معاينة الفاتورة الورقية</button>` : ''}
                    </div>
                </div>
            `;
            timelineContainer.appendChild(itemEl);
        });
    }

    const modal = document.getElementById("supplier-details-modal");
    if (modal) modal.classList.add("active");
}

export function previewImageModal(imgSrc) {
    const w = window.open("");
    if (w) {
        w.document.write(`<title>معاينة الفاتورة الورقية</title><div style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:#111;"><img src="${imgSrc}" style="max-width:90vw; max-height:90vh; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.8);" /></div>`);
    }
}

export function switchBaleMode(mode) {
    const btnUnit = document.getElementById("btn-mode-unit");
    const btnBale = document.getElementById("btn-mode-bale");
    const baleRow = document.getElementById("bale-inputs-row");
    if (mode === "bale") {
        if (btnUnit) btnUnit.classList.remove("active");
        if (btnBale) btnBale.classList.add("active");
        if (baleRow) baleRow.style.display = "grid";
    } else {
        if (btnBale) btnBale.classList.remove("active");
        if (btnUnit) btnUnit.classList.add("active");
        if (baleRow) baleRow.style.display = "none";
    }
}
