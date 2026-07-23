import { state, saveState } from '../state.js';
import { renderPOS } from './pos.js';

export function renderCustomers() {
    const tbody = document.getElementById("customers-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const searchQuery = document.getElementById("customer-search-input").value.toLowerCase();
    const filtered = state.customers.filter(c => c.name.toLowerCase().includes(searchQuery) || c.phone.includes(searchQuery));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">${state.language === "ar" ? "لا يوجد عملاء مطابقين" : "No matching customers"}</td></tr>`;
        return;
    }

    filtered.forEach(c => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${c.name}</strong></td>
            <td><code>${c.phone}</code></td>
            <td><span class="badge badge-success">${c.points} ${state.language === "ar" ? "نقطة" : "pts"}</span></td>
            <td>${c.totalSpent.toFixed(2)} ${state.settings.currency}</td>
            <td>${c.visits}</td>
            <td>${c.registered}</td>
            <td>
                <div style="display: flex; gap: 4px;">
                    <button class="btn btn-secondary btn-sm" onclick="editCustomer('${c.id}')" title="تعديل">
                        <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCustomer('${c.id}')" title="حذف">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    lucide.createIcons();
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
    const id = document.getElementById("customer-id").value;
    const name = document.getElementById("cust-name").value;
    const phone = document.getElementById("cust-phone").value;
    const points = parseInt(document.getElementById("cust-points").value) || 0;

    if (id) {
        // Edit existing
        const index = state.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            state.customers[index] = { ...state.customers[index], name, phone, points };
        }
    } else {
        // Add new
        const newId = "c" + (state.customers.length + 1).toString();
        state.customers.push({
            id: newId, name, phone, points, totalSpent: 0, visits: 0,
            registered: new Date().toISOString().split('T')[0]
        });
    }

    saveState();
    const modal = document.getElementById("customer-modal");
    if (modal) modal.classList.remove("active");
    const form = document.getElementById("customer-form");
    if (form) form.reset();
    document.getElementById("customer-id").value = "";

    if (state.currentView === "customers") {
        renderCustomers();
    } else if (state.currentView === "pos") {
        renderPOS();
    }
}

export function editCustomer(id) {
    const c = state.customers.find(x => x.id === id);
    if (!c) return;

    document.getElementById("customer-id").value = c.id;
    document.getElementById("cust-name").value = c.name;
    document.getElementById("cust-phone").value = c.phone;
    document.getElementById("cust-points").value = c.points;

    document.getElementById("customer-modal-title").textContent = state.language === "ar" ? "تعديل بيانات العميل" : "Edit Customer";
    document.getElementById("customer-modal").classList.add("active");
}

export function deleteCustomer(id) {
    if (confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا العميل؟" : "Are you sure you want to delete this customer?")) {
        state.customers = state.customers.filter(c => c.id !== id);
        saveState();
        renderCustomers();
    }
}
