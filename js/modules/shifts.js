import { state, saveState } from '../state.js';

// ============================================================
// SHIFTS MODULE — Shift opening, closing, metrics, cash control
// ============================================================

/**
 * Compute all shift financial metrics since shift start
 */
export function calculateShiftMetrics() {
    if (!state.currentShift) {
        return {
            openingBalance: 0, cashSales: 0, cardSales: 0, debtSales: 0,
            customerCashPayments: 0, supplierCashPayments: 0, cashExpenses: 0,
            expectedCash: 0, txnsCount: 0
        };
    }

    const startTime = new Date(state.currentShift.startTime);

    // Filter transactions since this shift started
    const shiftTxns = (state.transactions || []).filter(t =>
        t.status !== "cancelled" && new Date(t.date) >= startTime
    );

    let cashSales = 0, cardSales = 0, debtSales = 0;
    shiftTxns.forEach(t => {
        const pm = t.paymentMethod || "cash";
        if (pm === "cash") cashSales += (t.total || 0);
        else if (pm === "card") cardSales += (t.total || 0);
        else if (pm === "credit") debtSales += (t.total || 0);
        else cashSales += (t.total || 0); // fallback
    });

    // Cash received from customer debt settlements since shift start
    const customerCashPayments = (state.customerPayments || [])
        .filter(p => new Date(p.date) >= startTime)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Cash paid to suppliers since shift start
    const supplierCashPayments = (state.supplierPayments || [])
        .filter(p => new Date(p.date) >= startTime)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Expenses paid in cash since shift start
    const cashExpenses = (state.expenses || [])
        .filter(e => new Date(e.date) >= startTime)
        .reduce((sum, e) => sum + (e.amount || 0), 0);

    const openingBalance = state.currentShift.openingBalance || 0;

    // Expected cash = opening + cash sales + customer payments received - supplier payments - cash expenses
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

/**
 * Open shift modal — if no active shift, prompt to open a new one
 */
export function openShiftModal() {
    const modal = document.getElementById("shift-modal");
    if (!modal) return;

    // If no shift or shift is closed, open new shift first
    if (!state.currentShift || state.currentShift.status === "closed") {
        const openingRaw = prompt(
            state.language === "ar"
                ? "🔓 لا توجد وردية مفتوحة حالياً.\n\nأدخل مبلغ النقدية الافتتاحية في الدرج لفتح وردية جديدة (ج.م):"
                : "No active shift. Enter opening cash balance to start a new shift (EGP):",
            "0.00"
        );
        if (openingRaw === null) return; // user cancelled

        const openingBalance = parseFloat(openingRaw) || 0;
        state.currentShift = {
            id: "shift_" + Date.now(),
            cashierId: state.currentUser?.id || "c1",
            cashierName: state.currentUser?.name || "الكاشير",
            startTime: new Date().toISOString(),
            openingBalance,
            status: "active"
        };
        saveState();

        if (window.showToast) {
            window.showToast(`✅ تم فتح وردية جديدة برصيد افتتاحي ${openingBalance.toFixed(2)} ${state.settings.currency}`, "success");
        }
        // Refresh POS shift badge
        if (window.refreshCurrentView && state.currentView === "pos") window.refreshCurrentView();
    }

    // Populate modal with current metrics
    const metrics = calculateShiftMetrics();
    const cur = state.currentShift;
    const currency = state.settings.currency;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set("shift-cashier-name", cur.cashierName);
    set("shift-start-time",
        new Date(cur.startTime).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    );
    set("shift-cash-sales",   `${metrics.cashSales.toFixed(2)} ${currency}`);
    set("shift-card-sales",   `${metrics.cardSales.toFixed(2)} ${currency}`);
    set("shift-debt-sales",   `${metrics.debtSales.toFixed(2)} ${currency}`);
    set("shift-expected-cash", `${metrics.expectedCash.toFixed(2)} ${currency}`);

    // Wire actual cash input → live difference calculation
    const actualCashInput = document.getElementById("shift-actual-cash");
    const diffEl = document.getElementById("shift-diff-amount");
    if (actualCashInput) {
        actualCashInput.value = metrics.expectedCash.toFixed(2);

        const calcDiff = () => {
            const actual = parseFloat(actualCashInput.value) || 0;
            const diff = actual - metrics.expectedCash;
            if (!diffEl) return;
            if (diff < 0) {
                diffEl.className = "text-danger font-bold";
                diffEl.textContent = `⬇ عجز: ${Math.abs(diff).toFixed(2)} ${currency}`;
            } else if (diff > 0) {
                diffEl.className = "text-success font-bold";
                diffEl.textContent = `⬆ زيادة: +${diff.toFixed(2)} ${currency}`;
            } else {
                diffEl.className = "text-muted font-bold";
                diffEl.textContent = `✅ متطابق 0.00 ${currency}`;
            }
        };

        // Remove old listener if any, then add fresh
        const newInput = actualCashInput.cloneNode(true);
        actualCashInput.parentNode.replaceChild(newInput, actualCashInput);
        newInput.value = metrics.expectedCash.toFixed(2);
        newInput.addEventListener("input", calcDiff);
        calcDiff();
    }

    modal.classList.add("active");
}

/**
 * Submit shift closing form — block sales until new shift is opened
 */
export function handleShiftClosingSubmit(e) {
    e.preventDefault();

    if (!state.currentShift || state.currentShift.status !== "active") {
        if (window.showToast) window.showToast("لا توجد وردية مفتوحة لتقفيلها!", "danger");
        return;
    }

    const actualCashInput = document.getElementById("shift-actual-cash");
    const actualCash = parseFloat(actualCashInput?.value) || 0;
    const metrics = calculateShiftMetrics();
    const difference = actualCash - metrics.expectedCash;

    // Save closed shift record
    const closedShift = {
        ...state.currentShift,
        endTime: new Date().toISOString(),
        cashSales: metrics.cashSales,
        cardSales: metrics.cardSales,
        debtSales: metrics.debtSales,
        cashExpenses: metrics.cashExpenses,
        customerCashPayments: metrics.customerCashPayments,
        supplierCashPayments: metrics.supplierCashPayments,
        expectedCash: metrics.expectedCash,
        actualCash,
        difference,
        txnsCount: metrics.txnsCount,
        status: "closed"
    };

    if (!state.shifts) state.shifts = [];
    state.shifts.push(closedShift);

    // Mark current shift as closed (blocks sales in POS)
    state.currentShift = { ...closedShift };
    saveState();

    const modal = document.getElementById("shift-modal");
    if (modal) modal.classList.remove("active");

    const diffLabel = difference < 0
        ? `⬇ عجز ${Math.abs(difference).toFixed(2)} ${state.settings.currency}`
        : difference > 0
            ? `⬆ زيادة ${difference.toFixed(2)} ${state.settings.currency}`
            : `✅ مطابق 100%`;

    if (window.showToast) {
        window.showToast(
            `🔒 تم تقفيل الوردية بنجاح! ${diffLabel}\nعمليات البيع محظورة — افتح وردية جديدة للمتابعة.`,
            difference !== 0 ? "warning" : "success"
        );
    }

    if (window.refreshCurrentView) window.refreshCurrentView();
}

/**
 * Render shifts history table (in reports or settings view if present)
 */
export function renderShiftsTable() {
    const tbody = document.getElementById("shifts-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const shifts = state.shifts || [];
    if (shifts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);">لا توجد ورديات مغلقة مسجلة</td></tr>`;
        return;
    }

    [...shifts].reverse().forEach(s => {
        const diff = s.difference || 0;
        const diffBadge = diff < 0
            ? `<span class="badge badge-danger">عجز ${Math.abs(diff).toFixed(2)}</span>`
            : diff > 0
                ? `<span class="badge badge-warning">زيادة +${diff.toFixed(2)}</span>`
                : `<span class="badge badge-success">مطابق</span>`;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>#${s.id?.substring(6, 12) || '—'}</strong></td>
            <td><strong>${s.cashierName || 'كاشير'}</strong></td>
            <td>${s.startTime ? new Date(s.startTime).toLocaleString('ar-EG') : '—'}</td>
            <td>${s.endTime ? new Date(s.endTime).toLocaleString('ar-EG') : '—'}</td>
            <td>${(s.cashSales || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${(s.expectedCash || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${(s.actualCash || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${diffBadge}</td>
        `;
        tbody.appendChild(row);
    });
}
