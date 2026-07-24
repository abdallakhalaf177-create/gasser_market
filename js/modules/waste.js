import { state, saveState } from '../state.js';

// ============================================================
// WASTE MODULE — Full CRUD + Inventory deduction
// ============================================================

export function renderWaste() {
    const totalLoss = (state.wastes || []).reduce((sum, w) => sum + (w.totalLoss || 0), 0);
    const wasteCount = (state.wastes || []).length;

    const elLoss = document.getElementById("waste-stat-loss");
    const elCount = document.getElementById("waste-stat-count");
    if (elLoss) elLoss.textContent = `${totalLoss.toFixed(2)} ${state.settings.currency}`;
    if (elCount) elCount.textContent = wasteCount;

    _populateWasteProductSelect();
    renderWasteTable();
}

function _populateWasteProductSelect() {
    const sel = document.getElementById("waste-product-select");
    if (!sel) return;

    const products = (state.products || []).filter(p => p.stock > 0);

    if (products.length === 0) {
        sel.innerHTML = `<option value="">لا يوجد منتجات متاحة بالمخزن</option>`;
        return;
    }

    sel.innerHTML = `<option value="">— اختر المنتج المراد إسقاطه —</option>` +
        products.map(p =>
            `<option value="${p.id}">${p.name} (باركود: ${p.barcode}) — المتاح: ${p.stock} قطعة — التكلفة: ${(p.cost || 0).toFixed(2)} ${state.settings.currency}</option>`
        ).join('');
}

export function openWasteModal() {
    _populateWasteProductSelect();
    const form = document.getElementById("waste-form");
    if (form) form.reset();
    _populateWasteProductSelect(); // Re-populate after reset
    const modal = document.getElementById("waste-modal");
    if (modal) modal.classList.add("active");
}

export function handleWasteFormSubmit(e) {
    e.preventDefault();

    const productIdEl = document.getElementById("waste-product-select");
    const qtyEl = document.getElementById("waste-qty");
    const reasonEl = document.getElementById("waste-reason");

    const productId = productIdEl ? productIdEl.value : "";
    const qty = parseInt(qtyEl?.value) || 0;
    const reason = reasonEl ? reasonEl.value : "تالف / منتهي الصلاحية";

    if (!productId) {
        if (window.showToast) window.showToast("يرجى اختيار المنتج أولاً!", "danger");
        return;
    }

    const prod = (state.products || []).find(p => p.id === productId);
    if (!prod) {
        if (window.showToast) window.showToast("المنتج المحدد غير موجود بالمخزن!", "danger");
        return;
    }

    if (qty <= 0) {
        if (window.showToast) window.showToast("يرجى إدخال كمية صحيحة أكبر من صفر!", "danger");
        return;
    }

    if (qty > prod.stock) {
        if (window.showToast) window.showToast(`عذراً! الكمية المطلوبة (${qty}) تتجاوز الرصيد المتاح (${prod.stock} قطعة)!`, "danger");
        return;
    }

    const unitCost = prod.cost || 0;
    const totalLoss = unitCost * qty;

    // Deduct stock immediately
    prod.stock -= qty;

    if (!state.wastes) state.wastes = [];
    state.wastes.push({
        id: "w_" + Date.now(),
        productId: prod.id,
        productName: prod.name,
        barcode: prod.barcode,
        qty,
        unitCost,
        totalLoss,
        reason,
        date: new Date().toISOString(),
        user: state.currentUser ? state.currentUser.name : "مدير"
    });

    saveState();

    const modal = document.getElementById("waste-modal");
    if (modal) modal.classList.remove("active");

    if (window.showToast) {
        window.showToast(
            `⚠️ تم إسقاط ${qty} قطعة من "${prod.name}" وتسجيل خسارة ${totalLoss.toFixed(2)} ${state.settings.currency} بسعر التكلفة!`,
            "warning"
        );
    }

    renderWaste();

    if (state.currentView === "reports" && window.refreshCurrentView) {
        window.refreshCurrentView();
    }
}

export function renderWasteTable() {
    const tbody = document.getElementById("waste-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const wastes = state.wastes || [];

    if (wastes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">
            <i class="ri-delete-bin-3-line" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
            ${state.language === "ar" ? "لا توجد سجلات هالك أو توالف مسجلة" : "No waste logs recorded"}
        </td></tr>`;
        return;
    }

    [...wastes].reverse().forEach(w => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><code style="font-size:12px;">${w.barcode || '—'}</code></td>
            <td><strong>${w.productName || '—'}</strong></td>
            <td><span class="badge badge-warning">${w.qty} قطعة</span></td>
            <td>${(w.unitCost || 0).toFixed(2)} ${state.settings.currency}</td>
            <td><strong class="text-danger">-${(w.totalLoss || 0).toFixed(2)} ${state.settings.currency}</strong></td>
            <td><span class="badge badge-danger">${w.reason || '—'}</span></td>
            <td style="font-size:13px;">${w.date ? new Date(w.date).toLocaleString('ar-EG') : '—'}</td>
        `;
        tbody.appendChild(row);
    });
}
