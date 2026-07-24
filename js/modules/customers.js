import { state, saveState } from '../state.js';

// ============================================================
// CUSTOMERS MODULE — Full CRUD + Debt tracking + Settlements
// ============================================================

export function renderCustomers() {
    const tbody = document.getElementById("customers-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const searchEl = document.getElementById("customer-search-input");
    const searchQuery = searchEl ? searchEl.value.toLowerCase().trim() : "";

    const customers = state.customers || [];
    const filtered = customers.filter(c =>
        (c.name || "").toLowerCase().includes(searchQuery) ||
        (c.phone || "").includes(searchQuery)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">
            <i class="ri-user-search-line" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
            ${state.language === "ar" ? "لا يوجد عملاء مطابقون للبحث" : "No matching customers"}
        </td></tr>`;
        return;
    }

    filtered.forEach(c => {
        const balance = c.balance || 0;
        const balanceBadge = balance > 0
            ? `<strong class="text-danger">⚠ ${balance.toFixed(2)} ${state.settings.currency}</strong>`
            : `<span class="text-success">✓ لا يوجد دين</span>`;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${c.name}</strong></td>
            <td><code>${c.phone || '—'}</code></td>
            <td>${balanceBadge}</td>
            <td><span class="badge badge-success">${c.points || 0} نقطة</span></td>
            <td>${(c.totalSpent || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${c.visits || 0}</td>
            <td>${c.registered || '—'}</td>
            <td>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="window.editCustomer('${c.id}')" title="تعديل">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="window.openCustomerSettleModal('${c.id}')"
                        title="سداد دين" ${balance <= 0 ? 'disabled style="opacity:0.4;"' : ''}>
                        <i class="ri-wallet-line"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.deleteCustomer('${c.id}')" title="حذف">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (window.lucide) window.lucide.createIcons();
}

export function openCustomerModal() {
    const modal = document.getElementById("customer-modal");
    const form = document.getElementById("customer-form");
    if (form) form.reset();
    const idField = document.getElementById("customer-id");
    if (idField) idField.value = "";
    const titleEl = document.getElementById("customer-modal-title");
    if (titleEl) titleEl.textContent = state.language === "ar" ? "إضافة عميل جديد" : "Add New Customer";
    if (modal) modal.classList.add("active");
}

export function handleCustomerFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("customer-id")?.value;
    const name = document.getElementById("cust-name")?.value?.trim();
    const phone = document.getElementById("cust-phone")?.value?.trim();
    const points = parseInt(document.getElementById("cust-points")?.value) || 0;

    if (!name) {
        if (window.showToast) window.showToast("يرجى إدخال اسم العميل!", "danger");
        return;
    }

    if (id) {
        // Edit existing
        const idx = (state.customers || []).findIndex(c => c.id === id);
        if (idx !== -1) {
            state.customers[idx] = { ...state.customers[idx], name, phone, points };
        }
    } else {
        // Add new
        const newId = "c_" + Date.now();
        if (!state.customers) state.customers = [];
        state.customers.push({
            id: newId, name, phone, points,
            balance: 0, totalSpent: 0, visits: 0,
            registered: new Date().toISOString().split('T')[0]
        });
    }

    saveState();

    const modal = document.getElementById("customer-modal");
    if (modal) modal.classList.remove("active");
    const form = document.getElementById("customer-form");
    if (form) form.reset();
    const idEl = document.getElementById("customer-id");
    if (idEl) idEl.value = "";

    if (window.showToast) window.showToast(id ? "تم تحديث بيانات العميل بنجاح!" : "تم إضافة العميل الجديد بنجاح!", "success");

    if (state.currentView === "customers") renderCustomers();
    if (window.refreshCurrentView && state.currentView === "pos") window.refreshCurrentView();
}

export function editCustomer(id) {
    const c = (state.customers || []).find(x => x.id === id);
    if (!c) return;

    const idEl = document.getElementById("customer-id");
    const nameEl = document.getElementById("cust-name");
    const phoneEl = document.getElementById("cust-phone");
    const pointsEl = document.getElementById("cust-points");
    const titleEl = document.getElementById("customer-modal-title");
    const modal = document.getElementById("customer-modal");

    if (idEl) idEl.value = c.id;
    if (nameEl) nameEl.value = c.name;
    if (phoneEl) phoneEl.value = c.phone || "";
    if (pointsEl) pointsEl.value = c.points || 0;
    if (titleEl) titleEl.textContent = "تعديل بيانات العميل";
    if (modal) modal.classList.add("active");
}

export function deleteCustomer(id) {
    if (!confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا العميل وجميع سجلاته؟" : "Delete this customer?")) return;
    state.customers = (state.customers || []).filter(c => c.id !== id);
    saveState();
    renderCustomers();
    if (window.showToast) window.showToast("تم حذف العميل بنجاح.", "warning");
}

export function openCustomerSettleModal(id) {
    const c = (state.customers || []).find(x => x.id === id);
    if (!c) return;

    const modal = document.getElementById("customer-settle-modal");
    if (!modal) return;

    const idEl = document.getElementById("cust-settle-id");
    const nameEl = document.getElementById("cust-settle-name");
    const balanceEl = document.getElementById("cust-settle-balance");
    const amountEl = document.getElementById("cust-settle-amount");

    if (idEl) idEl.value = c.id;
    if (nameEl) nameEl.textContent = c.name;
    if (balanceEl) {
        balanceEl.textContent = `${(c.balance || 0).toFixed(2)} ${state.settings.currency}`;
        balanceEl.className = "text-danger font-bold";
    }
    if (amountEl) {
        amountEl.value = "";
        amountEl.max = c.balance || 0;
        amountEl.placeholder = `الحد الأقصى: ${(c.balance || 0).toFixed(2)}`;
    }

    modal.classList.add("active");
}

export function handleCustomerSettleFormSubmit(e) {
    e.preventDefault();

    const idEl = document.getElementById("cust-settle-id");
    const amountEl = document.getElementById("cust-settle-amount");

    const id = idEl ? idEl.value : "";
    const amount = parseFloat(amountEl?.value) || 0;

    if (!id) {
        if (window.showToast) window.showToast("خطأ: لم يتم تحديد العميل!", "danger");
        return;
    }
    if (amount <= 0) {
        if (window.showToast) window.showToast("يرجى إدخال مبلغ السداد!", "danger");
        return;
    }

    const c = (state.customers || []).find(x => x.id === id);
    if (!c) {
        if (window.showToast) window.showToast("العميل غير موجود!", "danger");
        return;
    }

    if (amount > (c.balance || 0)) {
        if (window.showToast) window.showToast(`المبلغ المدخل (${amount.toFixed(2)}) يتجاوز الدين المستحق (${(c.balance||0).toFixed(2)})!`, "warning");
        return;
    }

    // Deduct from balance
    c.balance = Math.max(0, (c.balance || 0) - amount);

    // Log payment
    if (!state.customerPayments) state.customerPayments = [];
    state.customerPayments.push({
        id: "cpay_" + Date.now(),
        customerId: c.id,
        customerName: c.name,
        amount,
        date: new Date().toISOString(),
        paymentMethod: "cash"
    });

    saveState();

    const modal = document.getElementById("customer-settle-modal");
    if (modal) modal.classList.remove("active");

    if (window.showToast) {
        window.showToast(
            `✅ تم تسجيل دفعة ${amount.toFixed(2)} ${state.settings.currency} من العميل "${c.name}". الدين المتبقي: ${c.balance.toFixed(2)} ${state.settings.currency}`,
            "success"
        );
    }

    renderCustomers();
}
