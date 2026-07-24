import { state, saveState } from '../state.js';

export function renderWaste() {
    renderWasteTable();
    renderWasteProductDropdown();

    const totalLoss = (state.wastes || []).reduce((sum, w) => sum + w.totalLoss, 0);
    const wasteCount = (state.wastes || []).length;

    const elLoss = document.getElementById("waste-stat-loss");
    const elCount = document.getElementById("waste-stat-count");

    if (elLoss) elLoss.textContent = `${totalLoss.toFixed(2)} ${state.settings.currency}`;
    if (elCount) elCount.textContent = wasteCount;
}

export function renderWasteProductDropdown() {
    const wasteProductSelect = document.getElementById("waste-product-select");
    if (!wasteProductSelect) return;

    if (state.products && state.products.length > 0) {
        wasteProductSelect.innerHTML = `<option value="">اختر المنتج...</option>` +
            state.products.map(p => `<option value="${p.id}">${p.name} (${p.barcode}) - الكمية بالمخزن: ${p.stock}</option>`).join('');
    } else {
        wasteProductSelect.innerHTML = `<option value="">لا يوجد منتجات بالمخزن</option>`;
    }
}

export function openWasteModal() {
    renderWasteProductDropdown();
    const modal = document.getElementById("waste-modal");
    const form = document.getElementById("waste-form");
    if (form) form.reset();
    if (modal) modal.classList.add("active");
}

export function handleWasteFormSubmit(e) {
    e.preventDefault();
    const productId = document.getElementById("waste-product-select").value;
    const qty = parseInt(document.getElementById("waste-qty").value) || 0;
    const reason = document.getElementById("waste-reason").value;

    const prod = state.products.find(p => p.id === productId);
    if (!prod) {
        if (window.showToast) window.showToast("يرجى اختيار منتج مسجل بالمخزن!", "danger");
        return;
    }

    if (qty <= 0 || qty > prod.stock) {
        if (window.showToast) window.showToast("عذراً، الكمية المراد إسقاطها تتجاوز الرصيد المتاح في المخزن!", "danger");
        return;
    }

    const unitCost = prod.cost || 0;
    const totalLoss = unitCost * qty;

    // Deduct stock from product
    prod.stock -= qty;

    const newWaste = {
        id: "w_" + Date.now(),
        productId: prod.id,
        productName: prod.name,
        barcode: prod.barcode,
        qty: qty,
        unitCost: unitCost,
        totalLoss: totalLoss,
        reason: reason,
        date: new Date().toISOString(),
        user: state.currentUser ? state.currentUser.name : "مدير"
    };

    if (!state.wastes) state.wastes = [];
    state.wastes.push(newWaste);
    saveState();

    const modal = document.getElementById("waste-modal");
    if (modal) modal.classList.remove("active");

    if (window.showToast) {
        window.showToast(state.language === "ar" ? `تم إسقاط ${qty} من ${prod.name} وتسجيل الخسارة بقيمة ${totalLoss.toFixed(2)} ${state.settings.currency}` : `Recorded waste of ${qty} items!`, "warning");
    }

    renderWaste();
    if (window.refreshCurrentView) window.refreshCurrentView();
}

export function renderWasteTable() {
    const tbody = document.getElementById("waste-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!state.wastes || state.wastes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">${state.language === "ar" ? "لا توجد سجلات هالك/تالف مسجلة" : "No waste logs recorded"}</td></tr>`;
        return;
    }

    [...state.wastes].reverse().forEach(w => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><code>${w.barcode}</code></td>
            <td><strong>${w.productName}</strong></td>
            <td><span class="badge badge-warning">${w.qty} قطعة</span></td>
            <td>${w.unitCost.toFixed(2)} ${state.settings.currency}</td>
            <td><strong class="text-danger">-${w.totalLoss.toFixed(2)} ${state.settings.currency}</strong></td>
            <td><span class="badge badge-danger">${w.reason}</span></td>
            <td>${w.date ? w.date.replace('T', ' ').substring(0, 16) : '-'}</td>
        `;
        tbody.appendChild(row);
    });
}
