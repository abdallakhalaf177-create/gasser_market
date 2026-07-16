import { state, saveState } from '../state.js';

export function renderSuppliers() {
    const purSupplierSelect = document.getElementById("pur-supplier");
    const purProductSelect = document.getElementById("pur-product");

    if (purSupplierSelect) {
        purSupplierSelect.innerHTML = state.suppliers.map(s => `<option value="${s.id}">${s.company}</option>`).join('');
    }
    if (purProductSelect) {
        purProductSelect.innerHTML = state.products.map(p => `<option value="${p.id}">${p.name} (${p.barcode})</option>`).join('');
    }

    // Auto cost price when selecting product in restock modal
    if (purProductSelect) {
        // Remove previous listener to avoid duplicates
        const newProductSelect = purProductSelect.cloneNode(true);
        purProductSelect.parentNode.replaceChild(newProductSelect, purProductSelect);
        
        newProductSelect.addEventListener("change", () => {
            const p = state.products.find(x => x.id === newProductSelect.value);
            if (p) document.getElementById("pur-cost").value = p.cost;
        });
        // trigger initial
        const p = state.products.find(x => x.id === newProductSelect.value);
        if (p) document.getElementById("pur-cost").value = p.cost;
    }

    // Render Stats
    const totalSuppliers = state.suppliers.length;
    const totalBalance = state.suppliers.reduce((sum, s) => sum + s.balance, 0);
    const totalPurchasesCount = state.purchaseInvoices ? state.purchaseInvoices.length : 0;

    document.getElementById("sup-stat-total").textContent = totalSuppliers;
    document.getElementById("sup-stat-balance").textContent = `${totalBalance.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("sup-stat-purchases").textContent = totalPurchasesCount;

    renderSuppliersTable();
}

export function renderSuppliersTable() {
    const tbody = document.getElementById("suppliers-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const searchQuery = document.getElementById("supplier-search-input").value.toLowerCase();
    const filtered = state.suppliers.filter(s => s.company.toLowerCase().includes(searchQuery) || s.phone.includes(searchQuery) || (s.name && s.name.toLowerCase().includes(searchQuery)));

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
            <td><strong class="${s.balance > 0 ? 'text-danger' : 'text-success'}">${s.balance.toFixed(2)} ${state.settings.currency}</strong></td>
            <td>${s.totalPurchases.toFixed(2)} ${state.settings.currency}</td>
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
    lucide.createIcons();
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
    document.getElementById("supplier-modal").classList.remove("active");
    document.getElementById("supplier-form").reset();
    document.getElementById("supplier-id").value = "";
    
    renderSuppliers();
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
    const cost = parseFloat(document.getElementById("pur-cost").value);
    const qty = parseInt(document.getElementById("pur-qty").value);
    const paymentStatus = document.querySelector('input[name="pur-payment"]:checked').value; // 'paid' or 'credit'

    const totalCost = cost * qty;

    // Update Product Stock Level
    const prod = state.products.find(p => p.id === productId);
    if (prod) {
        prod.stock += qty;
        prod.cost = cost; // Update average cost
    }

    // Update Supplier Balance & purchases
    const sup = state.suppliers.find(s => s.id === supplierId);
    if (sup) {
        sup.totalPurchases += totalCost;
        if (paymentStatus === 'credit') {
            sup.balance += totalCost;
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
    document.getElementById("purchase-modal").classList.remove("active");
    document.getElementById("purchase-form").reset();
    if (window.showToast) {
        window.showToast(state.language === "ar" ? "تم تسجيل فاتورة التوريد وتحديث كمية المخزن بنجاح!" : "Restock invoice created and stock level updated!", "success");
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
    document.getElementById("settle-amount").max = s.balance; // limit max payment to balance

    document.getElementById("settle-modal").classList.add("active");
}

export function handleSettleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("settle-supplier-id").value;
    const amount = parseFloat(document.getElementById("settle-amount").value);

    const s = state.suppliers.find(x => x.id === id);
    if (s) {
        if (amount > s.balance) {
            if (window.showToast) {
                window.showToast(state.language === "ar" ? "لا يمكن دفع مبلغ أكبر من مديونية المورد الحالية!" : "Payment cannot exceed outstanding balance!", "danger");
            }
            return;
        }
        s.balance -= amount;
        s.lastUpdated = new Date().toISOString().split('T')[0];
    }

    saveState();
    document.getElementById("settle-modal").classList.remove("active");
    document.getElementById("settle-form").reset();
    if (window.showToast) {
        window.showToast(state.language === "ar" ? "تم تسجيل الدفعة وتخفيض مديونية المورد بنجاح!" : "Payment recorded successfully!", "success");
    }
    
    renderSuppliers();
}
