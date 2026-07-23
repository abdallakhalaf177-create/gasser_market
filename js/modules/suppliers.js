import { state, saveState } from '../state.js';

export function renderSuppliers() {
    renderPurchaseModalDropdowns();

    // Render Stats safely
    const totalSuppliers = state.suppliers.length;
    const totalBalance = state.suppliers.reduce((sum, s) => sum + s.balance, 0);
    const totalPurchasesCount = state.purchaseInvoices ? state.purchaseInvoices.length : 0;

    const elTotal = document.getElementById("sup-stat-total");
    const elBalance = document.getElementById("sup-stat-balance");
    const elPurchases = document.getElementById("sup-stat-purchases");

    if (elTotal) elTotal.textContent = totalSuppliers;
    if (elBalance) elBalance.textContent = `${totalBalance.toFixed(2)} ${state.settings.currency}`;
    if (elPurchases) elPurchases.textContent = totalPurchasesCount;

    renderSuppliersTable();
}

export function renderPurchaseModalDropdowns() {
    const purSupplierSelect = document.getElementById("pur-supplier");
    const purProductSelect = document.getElementById("pur-product");

    if (purSupplierSelect) {
        if (state.suppliers && state.suppliers.length > 0) {
            purSupplierSelect.innerHTML = state.suppliers.map(s => `<option value="${s.id}">${s.company || s.name}</option>`).join('');
        } else {
            purSupplierSelect.innerHTML = `<option value="">لا يوجد موردين (أضف مورد أولاً)</option>`;
        }
    }

    if (purProductSelect) {
        if (state.products && state.products.length > 0) {
            purProductSelect.innerHTML = state.products.map(p => `<option value="${p.id}">${p.name} (${p.barcode}) - تكلفة: ${p.cost} ج.م</option>`).join('');
        } else {
            purProductSelect.innerHTML = `<option value="">لا يوجد منتجات بالمخزن</option>`;
        }

        purProductSelect.onchange = () => {
            const p = state.products.find(x => x.id === purProductSelect.value);
            const costInput = document.getElementById("pur-cost");
            if (p && costInput) costInput.value = p.cost;
        };

        const p = state.products.find(x => x.id === purProductSelect.value);
        const costInput = document.getElementById("pur-cost");
        if (p && costInput) costInput.value = p.cost;
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
    renderPurchaseModalDropdowns();
    const form = document.getElementById("purchase-form");
    if (form) form.reset();
    const modal = document.getElementById("purchase-modal");
    if (modal) modal.classList.add("active");
}

export function renderSuppliersTable() {
    const tbody = document.getElementById("suppliers-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const searchInput = document.getElementById("supplier-search-input");
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";
    const filtered = state.suppliers.filter(s => (s.company && s.company.toLowerCase().includes(searchQuery)) || (s.phone && s.phone.includes(searchQuery)) || (s.name && s.name.toLowerCase().includes(searchQuery)));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">${state.language === "ar" ? "لا يوجد موردين مطابقين" : "No matching suppliers"}</td></tr>`;
        return;
    }

    filtered.forEach(s => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${s.company}</strong></td>
            <td>${s.name || '-'}</td>
            <td><code>${s.phone}</code></td>
            <td><strong class="${s.balance > 0 ? 'text-danger' : 'text-success'}">${(s.balance || 0).toFixed(2)} ${state.settings.currency}</strong></td>
            <td>${(s.totalPurchases || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${s.lastUpdated || '-'}</td>
            <td>
                <div style="display: flex; gap: 4px;">
                    <button class="btn btn-secondary btn-sm" onclick="editSupplier('${s.id}')" title="تعديل">
                        <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="openSettleModal('${s.id}')" title="سداد دفعة" ${s.balance <= 0 ? 'disabled' : ''}>
                        <i data-lucide="wallet" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSupplier('${s.id}')" title="حذف">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
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
    const id = document.getElementById("supplier-id").value;
    const company = document.getElementById("sup-company").value;
    const name = document.getElementById("sup-name").value;
    const phone = document.getElementById("sup-phone").value;
    const balance = parseFloat(document.getElementById("sup-balance").value) || 0;

    if (id) {
        // Edit existing
        const index = state.suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            state.suppliers[index].company = company;
            state.suppliers[index].name = name;
            state.suppliers[index].phone = phone;
            state.suppliers[index].balance = balance;
            state.suppliers[index].lastUpdated = new Date().toISOString().split('T')[0];
        }
    } else {
        // Add new
        const newId = "s" + (state.suppliers.length + 1).toString();
        state.suppliers.push({
            id: newId, company, name, phone, balance, totalPurchases: 0,
            lastUpdated: new Date().toISOString().split('T')[0]
        });
    }

    saveState();
    const modal = document.getElementById("supplier-modal");
    if (modal) modal.classList.remove("active");
    const form = document.getElementById("supplier-form");
    if (form) form.reset();
    document.getElementById("supplier-id").value = "";

    renderSuppliers();
    if (window.showToast) {
        window.showToast(state.language === "ar" ? "تم حفظ بيانات المورد بنجاح!" : "Supplier saved successfully!", "success");
    }
}

export function editSupplier(id) {
    const s = state.suppliers.find(x => x.id === id);
    if (!s) return;

    document.getElementById("supplier-id").value = s.id;
    document.getElementById("sup-company").value = s.company;
    document.getElementById("sup-name").value = s.name || '';
    document.getElementById("sup-phone").value = s.phone;
    document.getElementById("sup-balance").value = s.balance;

    document.getElementById("supplier-modal-title").textContent = state.language === "ar" ? "تعديل بيانات المورد" : "Edit Supplier";
    document.getElementById("supplier-modal").classList.add("active");
}

export function deleteSupplier(id) {
    if (confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا المورد؟" : "Are you sure you want to delete this supplier?")) {
        state.suppliers = state.suppliers.filter(s => s.id !== id);
        saveState();
        renderSuppliers();
    }
}

export function handlePurchaseFormSubmit(e) {
    e.preventDefault();
    const supplierId = document.getElementById("pur-supplier").value;
    const productId = document.getElementById("pur-product").value;
    const costInput = document.getElementById("pur-cost");
    const cost = costInput ? (parseFloat(costInput.value) || 0) : 0;
    const qty = parseInt(document.getElementById("pur-qty").value) || 1;
    const paymentSelect = document.getElementById("pur-payment");
    const paymentStatus = paymentSelect ? paymentSelect.value : "paid";

    const totalCost = cost * qty;

    // Update Product Stock Level
    const prod = state.products.find(p => p.id === productId);
    if (prod) {
        prod.stock += qty;
        if (cost > 0) prod.cost = cost;
    }

    // Update Supplier Balance & purchases
    const sup = state.suppliers.find(s => s.id === supplierId);
    if (sup) {
        sup.totalPurchases = (sup.totalPurchases || 0) + totalCost;
        if (paymentStatus === 'credit') {
            sup.balance = (sup.balance || 0) + totalCost;
        }
        sup.lastUpdated = new Date().toISOString().split('T')[0];
    }

    // Log purchase invoice
    if (!state.purchaseInvoices) state.purchaseInvoices = [];
    state.purchaseInvoices.push({
        id: (2000 + state.purchaseInvoices.length + 1).toString(),
        date: new Date().toISOString(),
        supplierId,
        productId,
        qty,
        cost,
        totalCost,
        paymentStatus
    });

    saveState();
    const modal = document.getElementById("purchase-modal");
    if (modal) modal.classList.remove("active");
    const form = document.getElementById("purchase-form");
    if (form) form.reset();

    if (window.showToast) {
        window.showToast(state.language === "ar" ? "تم تسجيل فاتورة التوريد وتحديث المخزون بنجاح!" : "Restock invoice created and stock updated!", "success");
    }
    
    renderSuppliers();
}

export function openSettleModal(id) {
    const s = state.suppliers.find(x => x.id === id);
    if (!s) return;

    document.getElementById("settle-supplier-id").value = s.id;
    document.getElementById("settle-supplier-name").textContent = s.company;
    document.getElementById("settle-current-balance").textContent = `${s.balance.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("settle-amount").value = "";
    document.getElementById("settle-amount").max = s.balance;

    document.getElementById("settle-modal").classList.add("active");
}

export function handleSettleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("settle-supplier-id").value;
    const amount = parseFloat(document.getElementById("settle-amount").value) || 0;

    const sup = state.suppliers.find(s => s.id === id);
    if (sup && amount > 0) {
        sup.balance = Math.max(0, sup.balance - amount);
        sup.lastUpdated = new Date().toISOString().split('T')[0];
        saveState();
        const modal = document.getElementById("settle-modal");
        if (modal) modal.classList.remove("active");
        renderSuppliers();
        if (window.showToast) {
            window.showToast(state.language === "ar" ? "تم تسجيل سداد الدفعة بنجاح!" : "Payment recorded successfully!", "success");
        }
    }
}

export function renderPurchases() {
    const tbody = document.getElementById("purchases-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!state.purchaseInvoices || state.purchaseInvoices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">${state.language === "ar" ? "لا توجد فواتير مشتريات مسجلة" : "No purchase invoices recorded"}</td></tr>`;
        return;
    }

    [...state.purchaseInvoices].reverse().forEach(inv => {
        const sup = state.suppliers.find(s => s.id === inv.supplierId);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>#${inv.id}</strong></td>
            <td>${sup ? sup.company : '-'}</td>
            <td>${inv.date.replace('T', ' ').substring(0, 16)}</td>
            <td><strong>${inv.totalCost.toFixed(2)} ${state.settings.currency}</strong></td>
            <td><span class="badge ${inv.paymentStatus === 'credit' ? 'badge-danger' : 'badge-success'}">${inv.paymentStatus === 'credit' ? 'آجل' : 'مدفوع'}</span></td>
        `;
        tbody.appendChild(row);
    });
}
