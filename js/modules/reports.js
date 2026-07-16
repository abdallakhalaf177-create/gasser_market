import { state } from '../state.js';
import { translations } from '../constants.js';

export function renderReports() {
    const rangeBtn = document.querySelector(".reports-toolbar .btn-outline.active");
    const range = rangeBtn ? rangeBtn.getAttribute("data-range") : "today";
    renderReportsData(range);
}

export function renderReportsData(range) {
    const now = new Date();
    let filteredTxns = [...state.transactions];

    if (range === "today") {
        const todayStr = now.toISOString().split('T')[0];
        filteredTxns = state.transactions.filter(t => t.date.startsWith(todayStr));
    } else if (range === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTxns = state.transactions.filter(t => new Date(t.date) >= oneWeekAgo);
    } else if (range === "month") {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredTxns = state.transactions.filter(t => new Date(t.date) >= oneMonthAgo);
    }

    // Calculate stats (excluding cancelled transactions)
    const validTxns = filteredTxns.filter(t => t.status !== "cancelled");
    const totalSales = validTxns.reduce((sum, t) => sum + t.total, 0);
    const totalProfit = validTxns.reduce((sum, t) => sum + t.profit, 0);
    const totalOrders = validTxns.length;
    const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

    document.getElementById("report-total-sales").textContent = `${totalSales.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("report-total-profit").textContent = `${totalProfit.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("report-total-orders").textContent = totalOrders;
    document.getElementById("report-avg-order").textContent = `${avgOrder.toFixed(2)} ${state.settings.currency}`;

    // Render Table
    const tbody = document.getElementById("reports-sales-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (filteredTxns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted);">${state.language === "ar" ? "لا توجد مبيعات في هذه الفترة" : "No sales in this period"}</td></tr>`;
        return;
    }

    // Copy and reverse to keep the logs newest-first in display
    [...filteredTxns].reverse().forEach(t => {
        const row = document.createElement("tr");
        const customerName = t.customerId === "walkin" ? (state.language === "ar" ? "عميل سفري" : "Walk-in") : (state.customers.find(c => c.id === t.customerId)?.name || t.customerId);
        
        const isCancelled = t.status === "cancelled";
        const rowStyle = isCancelled ? `style="opacity: 0.65;"` : "";
        const totalStyle = isCancelled 
            ? `style="text-decoration: line-through; opacity: 0.6;"` 
            : `class="text-success"`;
        const profitStyle = isCancelled 
            ? `style="text-decoration: line-through; opacity: 0.6;"` 
            : `class="text-success"`;
            
        const statusBadge = isCancelled
            ? `<span class="badge badge-danger">${state.language === "ar" ? "ملغاة" : "Cancelled"}</span>`
            : `<span class="badge badge-info">${state.language === "ar" ? (t.paymentMethod === "cash" ? "نقدي" : t.paymentMethod === "card" ? "بطاقة" : "محفظة") : t.paymentMethod}</span>`;

        const cancelBtn = isCancelled
            ? ""
            : `<button class="btn btn-danger btn-sm" onclick="cancelTransaction('${t.id}')" title="${state.language === "ar" ? "إلغاء المعاملة / مرتجع" : "Cancel/Refund"}">
                  <i data-lucide="x" style="width: 14px; height: 14px;"></i>
               </button>`;

        row.innerHTML = `
            <td ${rowStyle}><strong>#${t.id}</strong></td>
            <td ${rowStyle}>${t.date.replace('T', ' ').substring(0, 16)}</td>
            <td ${rowStyle}>${customerName}</td>
            <td>${statusBadge}</td>
            <td ${rowStyle}>${t.subtotal.toFixed(2)} ${state.settings.currency}</td>
            <td ${rowStyle}>${t.discount.toFixed(2)} ${state.settings.currency}</td>
            <td ${rowStyle}>${t.tax.toFixed(2)} ${state.settings.currency}</td>
            <td><strong ${totalStyle}>${t.total.toFixed(2)} ${state.settings.currency}</strong></td>
            <td><strong ${profitStyle}>+${t.profit.toFixed(2)} ${state.settings.currency}</strong></td>
            <td>
                <div style="display: flex; gap: 4px;">
                    <button class="btn btn-secondary btn-sm" onclick="viewReceipt('${t.id}')" title="${state.language === "ar" ? "عرض الفاتورة" : "View"}">
                        <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                    </button>
                    ${cancelBtn}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    lucide.createIcons();
}
