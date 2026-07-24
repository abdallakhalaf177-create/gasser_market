import { state, saveState } from '../state.js';

/**
 * Calculates current active shift metrics
 */
export function calculateShiftMetrics() {
    const shift = state.currentShift;
    const startTime = shift ? shift.startTime : new Date().toISOString().split('T')[0] + "T00:00:00.000Z";

    // Filter transactions since shift start
    const shiftTxns = state.transactions.filter(t => 
        t.status !== "cancelled" && 
        new Date(t.date) >= new Date(startTime)
    );

    let cashSales = 0;
    let cardSales = 0;
    let debtSales = 0;

    shiftTxns.forEach(t => {
        if (t.paymentMethod === "cash") {
            cashSales += t.total;
        } else if (t.paymentMethod === "card") {
            cardSales += t.total;
        } else if (t.paymentMethod === "credit") {
            debtSales += t.total;
        } else {
            cashSales += t.total; // Default fallback to cash
        }
    });

    // Customer cash debt settlements since shift start
    const customerCashPayments = (state.customerPayments || [])
        .filter(p => new Date(p.date) >= new Date(startTime))
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Supplier cash settlements since shift start
    const supplierCashPayments = (state.supplierPayments || [])
        .filter(p => new Date(p.date) >= new Date(startTime))
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Expenses paid in cash since shift start
    const cashExpenses = (state.expenses || [])
        .filter(e => new Date(e.date) >= new Date(startTime))
        .reduce((sum, e) => sum + (e.amount || 0), 0);

    const openingBalance = shift ? (shift.openingBalance || 0) : 0;
    const expectedCash = openingBalance + cashSales + customerCashPayments - supplierCashPayments - cashExpenses;

    return {
        openingBalance,
        cashSales,
        cardSales,
        debtSales,
        customerCashPayments,
        supplierCashPayments,
        cashExpenses,
        expectedCash,
        txnsCount: shiftTxns.length
    };
}

export function openShiftModal() {
    const modal = document.getElementById("shift-modal");
    if (!modal) return;

    // Check if shift active, if not, open start shift
    if (!state.currentShift) {
        state.currentShift = {
            id: "shift_" + Date.now(),
            cashierId: state.currentUser ? state.currentUser.id : "c1",
            cashierName: state.currentUser ? state.currentUser.name : "الكاشير",
            startTime: new Date().toISOString(),
            openingBalance: 0,
            status: "active"
        };
        saveState();
    }

    const metrics = calculateShiftMetrics();

    // Populate Modal UI
    const cashierNameEl = document.getElementById("shift-cashier-name");
    const startTimeEl = document.getElementById("shift-start-time");
    const cashSalesEl = document.getElementById("shift-cash-sales");
    const cardSalesEl = document.getElementById("shift-card-sales");
    const debtSalesEl = document.getElementById("shift-debt-sales");
    const expectedCashEl = document.getElementById("shift-expected-cash");
    const actualCashInput = document.getElementById("shift-actual-cash");
    const diffEl = document.getElementById("shift-diff-amount");

    if (cashierNameEl) cashierNameEl.textContent = state.currentShift.cashierName;
    if (startTimeEl) startTimeEl.textContent = new Date(state.currentShift.startTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    if (cashSalesEl) cashSalesEl.textContent = `${metrics.cashSales.toFixed(2)} ${state.settings.currency}`;
    if (cardSalesEl) cardSalesEl.textContent = `${metrics.cardSales.toFixed(2)} ${state.settings.currency}`;
    if (debtSalesEl) debtSalesEl.textContent = `${metrics.debtSales.toFixed(2)} ${state.settings.currency}`;
    if (expectedCashEl) expectedCashEl.textContent = `${metrics.expectedCash.toFixed(2)} ${state.settings.currency}`;
    
    if (actualCashInput) {
        actualCashInput.value = metrics.expectedCash.toFixed(2);
        actualCashInput.oninput = () => {
            const actual = parseFloat(actualCashInput.value) || 0;
            const diff = actual - metrics.expectedCash;
            if (diffEl) {
                if (diff < 0) {
                    diffEl.className = "text-danger font-bold";
                    diffEl.textContent = `عجز: ${Math.abs(diff).toFixed(2)} ${state.settings.currency}`;
                } else if (diff > 0) {
                    diffEl.className = "text-success font-bold";
                    diffEl.textContent = `زيادة: +${diff.toFixed(2)} ${state.settings.currency}`;
                } else {
                    diffEl.className = "text-muted";
                    diffEl.textContent = `متطابق 0.00 ${state.settings.currency}`;
                }
            }
        };
        actualCashInput.dispatchEvent(new Event("input"));
    }

    modal.classList.add("active");
}

export function handleShiftClosingSubmit(e) {
    e.preventDefault();
    if (!state.currentShift) return;

    const actualCashInput = document.getElementById("shift-actual-cash");
    const actualCash = actualCashInput ? (parseFloat(actualCashInput.value) || 0) : 0;
    const metrics = calculateShiftMetrics();
    const difference = actualCash - metrics.expectedCash;

    const closedShift = {
        ...state.currentShift,
        endTime: new Date().toISOString(),
        cashSales: metrics.cashSales,
        cardSales: metrics.cardSales,
        debtSales: metrics.debtSales,
        expectedCash: metrics.expectedCash,
        actualCash: actualCash,
        difference: difference,
        status: "closed"
    };

    if (!state.shifts) state.shifts = [];
    state.shifts.push(closedShift);

    // Reset current shift
    state.currentShift = {
        id: "shift_" + Date.now(),
        cashierId: state.currentUser ? state.currentUser.id : "c1",
        cashierName: state.currentUser ? state.currentUser.name : "الكاشير",
        startTime: new Date().toISOString(),
        openingBalance: 0,
        status: "active"
    };

    saveState();

    const modal = document.getElementById("shift-modal");
    if (modal) modal.classList.remove("active");

    if (window.showToast) {
        const diffText = difference < 0 ? `(عجز ${Math.abs(difference).toFixed(2)})` : difference > 0 ? `(زيادة ${difference.toFixed(2)})` : `(مطابق 100%)`;
        window.showToast(state.language === "ar" ? `تم تقفيل الوردية وتسجيل الحساب بنجاح ${diffText}` : `Shift closed successfully ${diffText}`, "success");
    }

    if (window.refreshCurrentView) window.refreshCurrentView();
}

export function renderShiftsTable() {
    const tbody = document.getElementById("shifts-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!state.shifts || state.shifts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">${state.language === "ar" ? "لا توجد ورديات مغلقة مسجلة" : "No closed shifts recorded"}</td></tr>`;
        return;
    }

    [...state.shifts].reverse().forEach(s => {
        const row = document.createElement("tr");
        const diff = s.difference || 0;
        let diffBadge = `<span class="badge badge-success">مطابق (0.00)</span>`;
        if (diff < 0) {
            diffBadge = `<span class="badge badge-danger">عجز (${Math.abs(diff).toFixed(2)} ${state.settings.currency})</span>`;
        } else if (diff > 0) {
            diffBadge = `<span class="badge badge-warning">زيادة (+${diff.toFixed(2)} ${state.settings.currency})</span>`;
        }

        row.innerHTML = `
            <td><strong>#${s.id.substring(6, 12)}</strong></td>
            <td><strong>${s.cashierName || 'كاشير'}</strong></td>
            <td>${s.startTime ? s.startTime.replace('T', ' ').substring(0, 16) : '-'}</td>
            <td>${s.endTime ? s.endTime.replace('T', ' ').substring(0, 16) : '-'}</td>
            <td>${(s.cashSales || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${(s.expectedCash || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${(s.actualCash || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${diffBadge}</td>
        `;
        tbody.appendChild(row);
    });
}
