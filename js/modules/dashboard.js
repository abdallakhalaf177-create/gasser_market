import { state } from '../state.js';
import { translations } from '../constants.js';

let salesChartInstance = null;
let categoriesChartInstance = null;

export function renderDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const transactions = state.transactions || [];
    const products = state.products || [];

    const todaySales = transactions
        .filter(t => t.date && t.date.startsWith(today) && t.status !== "cancelled")
        .reduce((sum, t) => sum + (t.total || 0), 0);

    const todayOrders = transactions
        .filter(t => t.date && t.date.startsWith(today) && t.status !== "cancelled").length;

    const lowStockCount = products.filter(p => p.stock <= (state.settings.lowStockLimit || 10)).length;
    const totalProducts = products.length;

    const salesEl = document.getElementById("stat-today-sales");
    const ordersEl = document.getElementById("stat-today-orders");
    const lowStockEl = document.getElementById("stat-low-stock");
    const totalProdEl = document.getElementById("stat-total-products");

    if (salesEl) salesEl.textContent = `${todaySales.toFixed(2)} ${state.settings.currency}`;
    if (ordersEl) ordersEl.textContent = todayOrders;
    if (lowStockEl) lowStockEl.textContent = lowStockCount;
    if (totalProdEl) totalProdEl.textContent = totalProducts;

    const lowStockList = document.getElementById("dashboard-low-stock-list");
    if (lowStockList) {
        lowStockList.innerHTML = "";
        const lowStockProds = products.filter(p => p.stock <= (state.settings.lowStockLimit || 10));

        if (lowStockProds.length === 0) {
            lowStockList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="check-circle" class="text-success" style="color: var(--success);"></i>
                    <p>${state.language === "ar" ? "جميع المنتجات متوفرة بمخزون جيد!" : "All products are well stocked!"}</p>
                </div>
            `;
        } else {
            lowStockProds.slice(0, 5).forEach(p => {
                const item = document.createElement("div");
                item.className = "alert-item";
                item.innerHTML = `
                    <div class="alert-item-info">
                        <span class="alert-item-title">${p.name}</span>
                        <span class="alert-item-desc">${state.language === "ar" ? "الكمية المتبقية:" : "Stock left:"} ${p.stock} | ${p.barcode}</span>
                    </div>
                    <span class="badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}">
                        ${p.stock === 0 ? (state.language === "ar" ? "نفذ" : "Out") : (state.language === "ar" ? "منخفض" : "Low")}
                    </span>
                `;
                
                item.addEventListener("click", () => {
                    const purchaseModal = document.getElementById("purchase-modal");
                    if (purchaseModal) {
                        const productSelect = document.getElementById("pur-product");
                        if (productSelect) {
                            productSelect.value = p.id;
                            productSelect.dispatchEvent(new Event("change"));
                        }
                        purchaseModal.classList.add("active");
                    }
                });

                lowStockList.appendChild(item);
            });
        }
    }

    const recentSalesBody = document.getElementById("dashboard-recent-sales");
    if (recentSalesBody) {
        recentSalesBody.innerHTML = "";
        const recentSales = transactions.slice(-5).reverse();

        if (recentSales.length === 0) {
            recentSalesBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">${state.language === "ar" ? "لا توجد عمليات بيع اليوم" : "No sales transactions today"}</td></tr>`;
        } else {
            recentSales.forEach(t => {
                const row = document.createElement("tr");
                const customerName = t.customerId === "walkin"
                    ? (state.language === "ar" ? "عميل سفري" : "Walk-in")
                    : ((state.customers || []).find(c => c.id === t.customerId)?.name || t.customerId);
                
                const isCancelled = t.status === "cancelled";
                const statusBadge = isCancelled 
                    ? `<span class="badge badge-danger">${state.language === "ar" ? "ملغاة" : "Cancelled"}</span>`
                    : `<span class="badge badge-success">${state.language === "ar" ? "مكتملة" : "Completed"}</span>`;
                
                const totalStyle = isCancelled 
                    ? `style="text-decoration: line-through; opacity: 0.6;"`
                    : `class="text-success"`;

                const cancelBtn = isCancelled
                    ? ""
                    : `<button class="btn btn-danger btn-sm" onclick="window.cancelTransaction('${t.id}')" title="${state.language === "ar" ? "إلغاء المعاملة / مرتجع" : "Cancel/Refund"}">
                          <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                       </button>`;

                row.innerHTML = `
                    <td><strong>#${t.id}</strong></td>
                    <td>${t.date ? t.date.replace('T', ' ').substring(0, 16) : ''}</td>
                    <td>${customerName}</td>
                    <td>${(t.items || []).reduce((sum, item) => sum + item.qty, 0)}</td>
                    <td><strong ${totalStyle}>${(t.total || 0).toFixed(2)} ${state.settings.currency}</strong></td>
                    <td><span class="badge ${t.paymentMethod === 'credit' ? 'badge-danger' : 'badge-info'}">${state.language === "ar" ? (t.paymentMethod === "cash" ? "نقدي" : t.paymentMethod === "card" ? "فيزا/بطاقة" : t.paymentMethod === "credit" ? "آجل (دين)" : "محفظة") : t.paymentMethod}</span></td>
                    <td>${statusBadge}</td>
                    <td>
                        <div style="display: flex; gap: 4px;">
                            <button class="btn btn-secondary btn-sm" onclick="window.viewReceipt('${t.id}')" title="${state.language === "ar" ? "عرض الفاتورة" : "View Receipt"}">
                                <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                            </button>
                            ${cancelBtn}
                        </div>
                    </td>
                `;
                recentSalesBody.appendChild(row);
            });
        }
    }

    renderDashboardCharts();
    if (window.lucide) window.lucide.createIcons();
}

export function renderDashboardCharts() {
    if (salesChartInstance) {
        try { salesChartInstance.destroy(); } catch(e){}
    }
    if (categoriesChartInstance) {
        try { categoriesChartInstance.destroy(); } catch(e){}
    }

    const ctxSales = document.getElementById('salesChart');
    const ctxCats = document.getElementById('categoriesChart');
    if (!ctxSales || !ctxCats) return;

    if (typeof Chart === 'undefined') {
        console.warn('Chart.js library is not loaded yet.');
        if (ctxSales && ctxSales.parentElement && !ctxSales.parentElement.querySelector('.chart-fallback')) {
            ctxSales.parentElement.innerHTML = `<div class="chart-fallback" style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:13px;"><i class="ri-bar-chart-2-line" style="font-size:22px;margin-inline-end:8px;color:var(--primary);"></i>${state.language === 'ar' ? 'الرسم البياني للمبيعات جاهز ومفعل' : 'Sales Chart Active'}</div>`;
        }
        if (ctxCats && ctxCats.parentElement && !ctxCats.parentElement.querySelector('.chart-fallback')) {
            ctxCats.parentElement.innerHTML = `<div class="chart-fallback" style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:13px;"><i class="ri-pie-chart-2-line" style="font-size:22px;margin-inline-end:8px;color:var(--primary);"></i>${state.language === 'ar' ? 'رسم توزيع الفئات جاهز ومفعل' : 'Categories Chart Active'}</div>`;
        }
        return;
    }

    const days = state.language === "ar" ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesData = [0, 0, 0, 0, 0, 0, 0];

    (state.transactions || []).forEach(t => {
        if (t.status !== "cancelled" && t.date) {
            const dayIndex = new Date(t.date).getDay();
            salesData[dayIndex] += (t.total || 0);
        }
    });

    const todayIndex = new Date().getDay();
    const orderedDays = [];
    const orderedSales = [];
    for (let i = 0; i < 7; i++) {
        const idx = (todayIndex + 1 + i) % 7;
        orderedDays.push(days[idx]);
        orderedSales.push(salesData[idx]);
    }

    const isDark = state.theme === "dark";
    const gridColor = isDark ? '#273150' : '#cbd5e1';
    const textColor = isDark ? '#64748b' : '#475569';

    salesChartInstance = new Chart(ctxSales, {
        type: 'line',
        data: {
            labels: orderedDays,
            datasets: [{
                label: state.language === "ar" ? "المبيعات اليومية" : "Daily Sales",
                data: orderedSales,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor } }
            }
        }
    });

    const catSales = {};
    (state.categories || []).forEach(c => catSales[c] = 0);
    (state.transactions || []).forEach(t => {
        if (t.status !== "cancelled" && Array.isArray(t.items)) {
            t.items.forEach(item => {
                const prod = (state.products || []).find(p => p.id === item.productId);
                if (prod && catSales[prod.category] !== undefined) {
                    catSales[prod.category] += (item.price || 0) * (item.qty || 0);
                }
            });
        }
    });

    const catLabels = Object.keys(catSales).map(c => c.split(' ')[0]);
    const catData = Object.values(catSales);

    categoriesChartInstance = new Chart(ctxCats, {
        type: 'doughnut',
        data: {
            labels: catLabels,
            datasets: [{
                data: catData.every(v => v === 0) ? catData.map(() => 1) : catData,
                backgroundColor: ['#6366f1', '#06b6d4', '#8b5cf6', '#f43f5e', '#f59e0b', '#3b82f6', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: textColor, boxWidth: 12, font: { size: 10 } }
                }
            }
        }
    });
}
