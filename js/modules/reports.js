import { state } from '../state.js';

export function renderReports() {
    const rangeBtn = document.querySelector(".reports-toolbar .btn-outline.active");
    const range = rangeBtn ? rangeBtn.getAttribute("data-range") : "today";
    renderReportsData(range);
}

export function setReportRange(range, btn) {
    document.querySelectorAll(".reports-toolbar .btn-outline").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderReportsData(range);
}

export function renderReportsData(range = "today") {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Filter transactions based on range
    let filteredTxns = [...state.transactions];
    if (range === "today") {
        filteredTxns = state.transactions.filter(t => t.date && t.date.startsWith(todayStr));
    } else if (range === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTxns = state.transactions.filter(t => new Date(t.date) >= oneWeekAgo);
    } else if (range === "month") {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredTxns = state.transactions.filter(t => new Date(t.date) >= oneMonthAgo);
    }

    const validTxns = filteredTxns.filter(t => t.status !== "cancelled");
    const totalSales = validTxns.reduce((sum, t) => sum + (t.total || 0), 0);
    const totalProfit = validTxns.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalCogs = Math.max(0, totalSales - totalProfit);
    const totalOrders = validTxns.length;

    // Low stock count calculation using product minStock or default 5
    const lowStockItems = state.products.filter(p => Number(p.stock) <= (Number(p.minStock) || 5));
    const lowStockCount = lowStockItems.length;

    // Update Overview Stats Cards
    const todaySalesEl = document.getElementById("stat-today-sales");
    const todayCogsEl = document.getElementById("stat-today-cogs");
    const reportProfitEl = document.getElementById("report-total-profit");
    const todayOrdersEl = document.getElementById("stat-today-orders");
    const lowStockBadgeEl = document.getElementById("low-stock-count-badge");
    const statLowStockEl = document.getElementById("stat-low-stock");

    if (todaySalesEl) todaySalesEl.textContent = `${totalSales.toFixed(2)} ${state.settings.currency}`;
    if (todayCogsEl) todayCogsEl.textContent = `${totalCogs.toFixed(2)} ${state.settings.currency}`;
    if (reportProfitEl) reportProfitEl.textContent = `${totalProfit.toFixed(2)} ${state.settings.currency}`;
    if (todayOrdersEl) todayOrdersEl.textContent = totalOrders;
    if (lowStockBadgeEl) lowStockBadgeEl.textContent = lowStockCount;
    if (statLowStockEl) statLowStockEl.textContent = lowStockCount;

    // 1. Render Category Profit Breakdown Table
    renderCategoryProfitsTable(validTxns);

    // 2. Render Sales Transaction Log Table
    renderSalesHistoryTable(filteredTxns);
}

function renderCategoryProfitsTable(validTxns) {
    const tbody = document.getElementById("category-profit-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    // Aggregate sales and profits by category
    const categoriesMap = {};

    validTxns.forEach(txn => {
        if (!txn.items || !Array.isArray(txn.items)) return;
        txn.items.forEach(item => {
            const product = state.products.find(p => p.id === item.id || p.id === item.productId || p.barcode === item.barcode || (p.name && item.name && p.name.trim() === item.name.trim()));
            const cat = (product && product.category) ? product.category : (item.category || "غير تصنيف");
            const qty = Number(item.quantity || item.qty) || 1;
            const itemPrice = Number(item.price) || 0;
            const itemCost = product ? Number(product.cost) : (itemPrice * 0.75);

            const revenue = itemPrice * qty;
            const cost = itemCost * qty;
            const profit = revenue - cost;

            if (!categoriesMap[cat]) {
                categoriesMap[cat] = {
                    name: cat,
                    itemsSold: 0,
                    revenue: 0,
                    cost: 0,
                    profit: 0
                };
            }
            categoriesMap[cat].itemsSold += qty;
            categoriesMap[cat].revenue += revenue;
            categoriesMap[cat].cost += cost;
            categoriesMap[cat].profit += profit;
        });
    });

    const categoryList = Object.values(categoriesMap);

    if (categoryList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">لا توجد مبيعات مسجلة في هذه الفترة للحساب حسب الفئات</td></tr>`;
        return;
    }

    categoryList.forEach(cat => {
        const marginPct = cat.revenue > 0 ? ((cat.profit / cat.revenue) * 100) : 0;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong><span class="badge badge-info">${cat.name}</span></strong></td>
            <td><strong>${cat.itemsSold} قطعة</strong></td>
            <td>${cat.revenue.toFixed(2)} ${state.settings.currency}</td>
            <td class="text-muted">${cat.cost.toFixed(2)} ${state.settings.currency}</td>
            <td class="text-success"><strong>+${cat.profit.toFixed(2)} ${state.settings.currency}</strong></td>
            <td>
                <span class="badge ${marginPct >= 20 ? 'badge-success' : 'badge-warning'}">
                    ${marginPct.toFixed(1)}%
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderSalesHistoryTable(filteredTxns) {
    const tbody = document.getElementById("reports-sales-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (filteredTxns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted);">${state.language === "ar" ? "لا توجد مبيعات في هذه الفترة" : "No sales in this period"}</td></tr>`;
        return;
    }

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
            <td ${rowStyle}>${t.date ? t.date.replace('T', ' ').substring(0, 16) : '-'}</td>
            <td ${rowStyle}>${customerName}</td>
            <td>${statusBadge}</td>
            <td ${rowStyle}>${(t.subtotal || 0).toFixed(2)} ${state.settings.currency}</td>
            <td ${rowStyle}>${(t.discount || 0).toFixed(2)} ${state.settings.currency}</td>
            <td ${rowStyle}>${(t.tax || 0).toFixed(2)} ${state.settings.currency}</td>
            <td><strong ${totalStyle}>${(t.total || 0).toFixed(2)} ${state.settings.currency}</strong></td>
            <td><strong ${profitStyle}>+${(t.profit || 0).toFixed(2)} ${state.settings.currency}</strong></td>
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
    if (window.lucide) window.lucide.createIcons();
}

/* ==========================================================================
   DAILY LOW-STOCK REPORT MODAL FUNCTIONS
   ========================================================================== */
export function openLowStockReport() {
    const modal = document.getElementById("low-stock-modal");
    const tbody = document.getElementById("low-stock-table-body");
    const summaryText = document.getElementById("low-stock-summary-text");
    if (!modal || !tbody) return;

    tbody.innerHTML = "";
    const lowStockItems = state.products.filter(p => Number(p.stock) <= (Number(p.minStock) || 5));

    if (lowStockItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-success); font-weight:700;">ممتاز! جميع المنتجات متوفرة ولا توجد نواقص بالمخزون حالياً.</td></tr>`;
        if (summaryText) summaryText.textContent = "إجمالي النواقص: 0 منتج";
    } else {
        lowStockItems.forEach(p => {
            const minThreshold = Number(p.minStock) || 5;
            const isZero = Number(p.stock) === 0;
            const statusBadge = isZero 
                ? `<span class="badge badge-danger">نفذ بالكامل</span>`
                : `<span class="badge badge-warning">وشك النفاد (حد الأمان)</span>`;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><code>${p.barcode}</code></td>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge badge-info">${p.category}</span></td>
                <td><strong class="${isZero ? 'text-danger' : 'text-warning'}">${p.stock}</strong></td>
                <td>${minThreshold}</td>
                <td>${(p.cost || 0).toFixed(2)} ${state.settings.currency}</td>
                <td>${(p.price || 0).toFixed(2)} ${state.settings.currency}</td>
                <td>${statusBadge}</td>
            `;
            tbody.appendChild(row);
        });
        if (summaryText) summaryText.textContent = `إجمالي المنتجات المطلوبة للتوريد: ${lowStockItems.length} منتج`;
    }

    modal.classList.add("active");
    if (window.lucide) window.lucide.createIcons();
}

export function closeLowStockModal() {
    const modal = document.getElementById("low-stock-modal");
    if (modal) modal.classList.remove("active");
}

export function printLowStockReport() {
    window.print();
}

export function exportLowStockCSV() {
    const lowStockItems = state.products.filter(p => Number(p.stock) <= (Number(p.minStock) || 5));
    if (lowStockItems.length === 0) {
        alert("لا توجد نواقص لتصديرها.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "البارلود,اسم المنتج,التصنيف,الكمية الحالية,حد الأمان,سعر الشراء,سعر البيع\n";

    lowStockItems.forEach(p => {
        csvContent += `"${p.barcode}","${p.name}","${p.category}","${p.stock}","${p.minStock || 5}","${p.cost}","${p.price}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_النواقص_اليومي_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
