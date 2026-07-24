import { state, saveState } from '../state.js';

export function renderExpenses() {
    renderExpensesTable();

    // Render Stats
    const totalExp = (state.expenses || []).reduce((sum, e) => sum + e.amount, 0);
    const expCount = (state.expenses || []).length;

    const elTotal = document.getElementById("exp-stat-total");
    const elCount = document.getElementById("exp-stat-count");

    if (elTotal) elTotal.textContent = `${totalExp.toFixed(2)} ${state.settings.currency}`;
    if (elCount) elCount.textContent = expCount;
}

export function openExpenseModal() {
    const modal = document.getElementById("expense-modal");
    const form = document.getElementById("expense-form");
    if (form) form.reset();
    if (modal) modal.classList.add("active");
}

export function handleExpenseFormSubmit(e) {
    e.preventDefault();
    const category = document.getElementById("exp-category").value;
    const amount = parseFloat(document.getElementById("exp-amount").value) || 0;
    const notes = document.getElementById("exp-notes").value;

    if (amount <= 0) {
        if (window.showToast) window.showToast("يرجى إدخال مبلغ صحيح للمصروف!", "danger");
        return;
    }

    const newExpense = {
        id: "exp_" + Date.now(),
        category,
        amount,
        notes,
        date: new Date().toISOString(),
        user: state.currentUser ? state.currentUser.name : "مدير"
    };

    if (!state.expenses) state.expenses = [];
    state.expenses.push(newExpense);
    saveState();

    const modal = document.getElementById("expense-modal");
    if (modal) modal.classList.remove("active");

    if (window.showToast) {
        window.showToast(state.language === "ar" ? "تم تسجيل المصروف بنجاح وخصمه من مجمل الربح!" : "Expense recorded successfully!", "success");
    }

    renderExpenses();
    if (window.refreshCurrentView) window.refreshCurrentView();
}

export function renderExpensesTable() {
    const tbody = document.getElementById("expenses-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!state.expenses || state.expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">${state.language === "ar" ? "لا توجد مصروفات مسجلة" : "No expenses recorded"}</td></tr>`;
        return;
    }

    [...state.expenses].reverse().forEach(exp => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>#${exp.id.substring(4, 10)}</strong></td>
            <td><span class="badge badge-info">${exp.category}</span></td>
            <td><strong class="text-danger">${exp.amount.toFixed(2)} ${state.settings.currency}</strong></td>
            <td>${exp.notes || '-'}</td>
            <td>${exp.date ? exp.date.replace('T', ' ').substring(0, 16) : '-'}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="window.deleteExpense('${exp.id}')" title="حذف">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    if (window.lucide) window.lucide.createIcons();
}

export function deleteExpense(id) {
    if (confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا المصروف؟" : "Are you sure you want to delete this expense?")) {
        state.expenses = state.expenses.filter(e => e.id !== id);
        saveState();
        renderExpenses();
        if (window.refreshCurrentView) window.refreshCurrentView();
    }
}
