import { state, saveState } from '../state.js';

// ============================================================
// EXPENSES MODULE — Full CRUD + localStorage integration
// ============================================================

export function renderExpenses() {
    // Render expense stats
    const totalExp = (state.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const expCount = (state.expenses || []).length;

    const elTotal = document.getElementById("exp-stat-total");
    const elCount = document.getElementById("exp-stat-count");
    if (elTotal) elTotal.textContent = `${totalExp.toFixed(2)} ${state.settings.currency}`;
    if (elCount) elCount.textContent = expCount;

    renderExpensesTable();
}

export function openExpenseModal() {
    const modal = document.getElementById("expense-modal");
    const form = document.getElementById("expense-form");
    if (form) form.reset();
    if (modal) modal.classList.add("active");
}

export function handleExpenseFormSubmit(e) {
    e.preventDefault();
    
    const categoryEl = document.getElementById("exp-category");
    const amountEl = document.getElementById("exp-amount");
    const notesEl = document.getElementById("exp-notes");

    const category = categoryEl ? categoryEl.value : "مصاريف أخرى";
    const amount = parseFloat(amountEl?.value) || 0;
    const notes = notesEl ? notesEl.value.trim() : "";

    if (amount <= 0) {
        if (window.showToast) window.showToast("يرجى إدخال مبلغ صحيح أكبر من صفر!", "danger");
        return;
    }

    if (!state.expenses) state.expenses = [];

    const newExpense = {
        id: "exp_" + Date.now(),
        category,
        amount,
        notes,
        date: new Date().toISOString(),
        shiftId: state.currentShift ? state.currentShift.id : null,
        user: state.currentUser ? state.currentUser.name : "مدير"
    };

    state.expenses.push(newExpense);
    saveState();

    const modal = document.getElementById("expense-modal");
    if (modal) modal.classList.remove("active");
    if (document.getElementById("expense-form")) document.getElementById("expense-form").reset();

    const shiftNotice = (state.currentShift && state.currentShift.status === "active")
        ? ` وخصمه من خزينة الوردية الحالية!`
        : `!`;

    if (window.showToast) {
        window.showToast(`✅ تم تسجيل مصروف "${category}" بمبلغ ${amount.toFixed(2)} ${state.settings.currency}${shiftNotice}`, "success");
    }

    renderExpenses();

    // Refresh active views (reports, shifts, dashboard)
    if (window.refreshCurrentView) {
        window.refreshCurrentView();
    }
}

export function renderExpensesTable() {
    const tbody = document.getElementById("expenses-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const expenses = state.expenses || [];

    if (expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
            <i class="ri-wallet-3-line" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
            ${state.language === "ar" ? "لا توجد مصروفات مسجلة" : "No expenses recorded"}
        </td></tr>`;
        return;
    }

    [...expenses].reverse().forEach(exp => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong style="font-family:monospace;">#${exp.id.substring(4, 10)}</strong></td>
            <td><span class="badge badge-info">${exp.category}</span></td>
            <td><strong class="text-danger">${(exp.amount || 0).toFixed(2)} ${state.settings.currency}</strong></td>
            <td style="color: var(--text-muted);">${exp.notes || '—'}</td>
            <td style="font-size:13px;">${exp.date ? new Date(exp.date).toLocaleString('ar-EG') : '—'}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="window.deleteExpense('${exp.id}')" title="حذف المصروف">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (window.lucide) window.lucide.createIcons();
}

export function deleteExpense(id) {
    if (!confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا المصروف؟" : "Delete this expense?")) return;
    state.expenses = (state.expenses || []).filter(e => e.id !== id);
    saveState();
    renderExpenses();
    if (window.showToast) window.showToast("تم حذف المصروف بنجاح وتحديث الحسابات.", "warning");
    if (window.refreshCurrentView) window.refreshCurrentView();
}

