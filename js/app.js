import { state, loadState, saveState, resetToDefault, addToCart, updateCartQty, clearCart, onCartChange, cancelTransaction } from './state.js';
import { translations, SMART_BARCODE_DATABASE } from './constants.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderPOS, renderPOSCategoryDropdowns, renderPOSProducts, renderPOSCustomerDropdown, renderCart, updateCartSummary, handleCheckout, openCheckoutModal, confirmCheckout, updateCheckoutChangeDisplay, viewReceipt, closeReceiptModal, printReceipt } from './modules/pos.js';
import { renderInventory, renderInventoryTable, handleProductFormSubmit, editProduct, deleteProduct, openPriceHistoryModal } from './modules/inventory.js';
import { handleCategoryFormSubmit, renderCategoriesList, deleteCategory } from './modules/categories.js';
import { renderReports, renderReportsData, openLowStockReport, closeLowStockModal, printLowStockReport, exportLowStockCSV, setReportRange, openExpiryReport, closeExpiryModal } from './modules/reports.js';
import { renderCustomers, handleCustomerFormSubmit, editCustomer, deleteCustomer, openCustomerModal, openCustomerSettleModal, handleCustomerSettleFormSubmit } from './modules/customers.js';
import { renderSuppliers, renderSuppliersTable, handleSupplierFormSubmit, editSupplier, deleteSupplier, handlePurchaseFormSubmit, openSettleModal, handleSettleFormSubmit, renderPurchases, openSupplierModal, openPurchaseModal, openSupplierHistoryModal, previewImageModal, switchBaleMode, filterPurchaseProductsBySupplier, addBatchItem, removeBatchItem, editBatchItem } from './modules/suppliers.js';
import { renderExpenses, openExpenseModal, handleExpenseFormSubmit, deleteExpense } from './modules/expenses.js';
import { renderWaste, openWasteModal, handleWasteFormSubmit } from './modules/waste.js';
import { openShiftModal, handleShiftClosingSubmit } from './modules/shifts.js';
import { renderSettings } from './modules/settings.js';
import { initAuth, renderUsers, handleUserFormSubmit, editUser, deleteUser } from './modules/users.js';

// ==========================================================================
// FALLBACK GUARD SYSTEM — Protects script execution from breaking UI
// ==========================================================================
const REQUIRED_GLOBAL_FUNCTIONS = [
    'dynamicCalculatedExpiry', 'applyDynamicExpiry', 'setQuickExpiry', 'playBeep', 'showToast',
    'openPriceHistoryModal', 'filterPurchaseProductsBySupplier', 'addBatchItem', 'removeBatchItem', 'editBatchItem',
    'updateCartQty', 'handleCheckout', 'openCheckoutModal', 'confirmCheckout', 'updateCheckoutChangeDisplay', 'viewReceipt',
    'editProduct', 'deleteProduct', 'deleteCategory', 'editCustomer', 'deleteCustomer',
    'editSupplier', 'openSettleModal', 'handleSettleFormSubmit', 'deleteSupplier', 'cancelTransaction', 'refreshCurrentView',
    'openCustomerModal', 'openSupplierModal', 'openSupplierHistoryModal', 'previewImageModal', 'switchBaleMode',
    'openPurchaseModal', 'openExpenseModal', 'openWasteModal', 'openShiftModal', 'handleShiftClosingSubmit',
    'handleExpenseFormSubmit', 'handleWasteFormSubmit', 'openCustomerSettleModal', 'handleCustomerSettleFormSubmit',
    'closeReceiptModal', 'printReceipt', 'openLowStockReport', 'closeLowStockModal', 'openExpiryReport',
    'closeExpiryModal', 'printLowStockReport', 'exportLowStockCSV', 'setReportRange', 'deleteExpense',
    'editUser', 'deleteUser', 'renderCustomers', 'renderSuppliers', 'renderPurchases', 'renderInventory',
    'renderExpenses', 'renderWaste', 'renderReports', 'renderDashboard', 'renderSettings', 'renderUsers'
];

REQUIRED_GLOBAL_FUNCTIONS.forEach(fnName => {
    if (!window[fnName]) {
        window[fnName] = function (...args) {
            console.warn(`[Fallback Guard] Function "${fnName}" called before full module initialization or fallback triggered.`, args);
        };
    }
});

// ==========================================================================
// UTILITY FUNCTIONS & TOASTS
// ==========================================================================
export function dynamicCalculatedExpiry(amount, unit, targetInputId) {
    const targetInput = document.getElementById(targetInputId);
    if (!targetInput) return;

    const num = parseInt(amount) || 0;
    if (num <= 0) return;

    const d = new Date();
    if (unit === 'days') {
        d.setDate(d.getDate() + num);
    } else if (unit === 'months') {
        d.setMonth(d.getMonth() + num);
    } else if (unit === 'years') {
        d.setFullYear(d.getFullYear() + num);
    }

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    targetInput.value = `${yyyy}-${mm}-${dd}`;
    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    targetInput.dispatchEvent(new Event('change', { bubbles: true }));
}

export function applyDynamicExpiry(amountInputId, unitSelectId, targetInputId) {
    const amountVal = document.getElementById(amountInputId)?.value || 1;
    const unitVal = document.getElementById(unitSelectId)?.value || 'months';
    dynamicCalculatedExpiry(amountVal, unitVal, targetInputId);
}

export function setQuickExpiry(inputId, months) {
    dynamicCalculatedExpiry(months, 'months', inputId);
}

export function playBeep(frequency = 440, duration = 0.1) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("Audio Context playback warning:", e);
    }
}

export function showToast(message, type = 'info') {
    try {
        const container = document.getElementById("toast-container");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        let icon = 'info';
        if (type === 'success') icon = 'check-circle';
        else if (type === 'warning') icon = 'alert-triangle';
        else if (type === 'danger') icon = 'alert-circle';
        toast.innerHTML = `<i data-lucide="${icon}" style="width:18px;height:18px;"></i><span>${message}</span>`;
        container.appendChild(toast);
        if (window.lucide) lucide.createIcons();
        if (type === 'success') playBeep(523.25, 0.08);
        else if (type === 'danger' || type === 'warning') playBeep(220, 0.22);
        setTimeout(() => { toast.style.animation = 'toastOut 0.3s forwards'; setTimeout(() => toast.remove(), 300); }, 3500);
    } catch (e) {
        console.error("Toast render error:", e);
    }
}

// Bind all module functions to window scope for HTML inline handlers & global availability
window.dynamicCalculatedExpiry = dynamicCalculatedExpiry;
window.applyDynamicExpiry = applyDynamicExpiry;
window.setQuickExpiry = setQuickExpiry;
window.openPriceHistoryModal = openPriceHistoryModal;
window.filterPurchaseProductsBySupplier = filterPurchaseProductsBySupplier;
window.addBatchItem = addBatchItem;
window.removeBatchItem = removeBatchItem;
window.editBatchItem = editBatchItem;

window.updateCartQty = updateCartQty;
window.handleCheckout = handleCheckout;
window.openCheckoutModal = openCheckoutModal;
window.confirmCheckout = confirmCheckout;
window.updateCheckoutChangeDisplay = updateCheckoutChangeDisplay;
window.viewReceipt = viewReceipt;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.deleteCategory = deleteCategory;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.editSupplier = editSupplier;
window.openSettleModal = openSettleModal;
window.handleSettleFormSubmit = handleSettleFormSubmit;
window.deleteSupplier = deleteSupplier;
window.cancelTransaction = cancelTransaction;
window.showToast = showToast;
window.playBeep = playBeep;
window.refreshCurrentView = () => { try { switchView(state.currentView); } catch (e) { console.error(e); } };

window.openCustomerModal = openCustomerModal;
window.openSupplierModal = openSupplierModal;
window.openSupplierHistoryModal = openSupplierHistoryModal;
window.previewImageModal = previewImageModal;
window.switchBaleMode = switchBaleMode;
window.openPurchaseModal = openPurchaseModal;
window.openExpenseModal = openExpenseModal;
window.openWasteModal = openWasteModal;
window.openShiftModal = openShiftModal;
window.handleShiftClosingSubmit = handleShiftClosingSubmit;
window.handleExpenseFormSubmit = handleExpenseFormSubmit;
window.handleWasteFormSubmit = handleWasteFormSubmit;
window.openCustomerSettleModal = openCustomerSettleModal;
window.handleCustomerSettleFormSubmit = handleCustomerSettleFormSubmit;
window.closeReceiptModal = closeReceiptModal;
window.printReceipt = printReceipt;
window.openLowStockReport = openLowStockReport;
window.closeLowStockModal = closeLowStockModal;
window.openExpiryReport = openExpiryReport;
window.closeExpiryModal = closeExpiryModal;
window.printLowStockReport = printLowStockReport;
window.exportLowStockCSV = exportLowStockCSV;
window.setReportRange = setReportRange;
window.deleteExpense = deleteExpense;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.renderCustomers = renderCustomers;
window.renderSuppliers = renderSuppliers;
window.renderPurchases = renderPurchases;
window.renderInventory = renderInventory;
window.renderExpenses = renderExpenses;
window.renderWaste = renderWaste;
window.renderReports = renderReports;
window.renderDashboard = renderDashboard;
window.renderSettings = renderSettings;
window.renderUsers = renderUsers;

// ==========================================================================
// APPLICATION INITIALIZATION & EVENT LISTENERS
// ==========================================================================
const initApp = async () => {
    try {
        await loadState();
        try { initAuth(); } catch (e) { console.error("initAuth error:", e); }
        try { applyTheme(); } catch (e) { console.error("applyTheme error:", e); }
        try { applyLanguage(); } catch (e) { console.error("applyLanguage error:", e); }
        try { setupNavigation(); } catch (e) { console.error("setupNavigation error:", e); }
        try { setupEventListeners(); } catch (e) { console.error("setupEventListeners error:", e); }
        try { setupLiveTime(); } catch (e) { console.error("setupLiveTime error:", e); }
        try { setupKeyboardShortcuts(); } catch (e) { console.error("setupKeyboardShortcuts error:", e); }

        onCartChange(() => {
            try { renderCart(); } catch (e) { console.error("renderCart error:", e); }
        });

        try { switchView(state.currentView || "pos"); } catch (e) { console.error("switchView error:", e); }
        if (window.lucide) {
            try { lucide.createIcons(); } catch (e) { }
        }
    } catch (globalErr) {
        console.error("Critical Application Startup Error:", globalErr);
        if (window.showToast) window.showToast("حدث خطأ أثناء تحميل التطبيق، يرجى تحديث الصفحة", "danger");
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

// Idempotent event listener attaching helper (Hot Reload & Exception Guard)
const boundListenersRegistry = [];

const addListenerSafe = (id, event, callback) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (!el._boundListeners) el._boundListeners = {};
    if (el._boundListeners[event]) {
        el.removeEventListener(event, el._boundListeners[event]);
    }

    const safeCallback = (e) => {
        try {
            callback(e);
        } catch (err) {
            console.error(`[Listener Failure] Target #${id} Event "${event}":`, err);
        }
    };

    el._boundListeners[event] = safeCallback;
    el.addEventListener(event, safeCallback);
    boundListenersRegistry.push({ el, event, callback: safeCallback });
};

window.__cleanupEventListeners = () => {
    boundListenersRegistry.forEach(({ el, event, callback }) => {
        if (el && el.removeEventListener) {
            el.removeEventListener(event, callback);
        }
    });
    boundListenersRegistry.length = 0;
};

// Keyboard Shortcuts Integration (F1, F2, F3, F4)
function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        try {
            if (e.key === "F1") {
                e.preventDefault();
                switchView("pos");
                showToast(state.language === "ar" ? "تم الانتقال إلى الكاشير" : "Switched to POS", "info");
            }
            if (e.key === "F2") {
                e.preventDefault();
                switchView(state.currentView);
            }
            if (e.key === "F3") {
                e.preventDefault();
                switchView("dashboard");
                showToast(state.language === "ar" ? "تم الانتقال إلى لوحة التحكم" : "Switched to Dashboard", "info");
            }
            if (e.key === "F4") {
                if (state.currentView === "pos") {
                    e.preventDefault();
                    clearCart();
                    showToast(state.language === "ar" ? "تم تفريغ السلة" : "Cart cleared", "warning");
                }
            }
            if (e.key === "Escape") {
                document.querySelectorAll(".modal-overlay.active, .modal-backdrop.active").forEach(m => {
                    m.classList.remove("active", "show");
                });
            }
        } catch (err) {
            console.error("Keyboard shortcut error:", err);
        }
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("active", "show");
            }
        });
    });
}

// Live Time Clock
function setupLiveTime() {
    const timeEl = document.getElementById("live-time");
    const updateTime = () => {
        try {
            const now = new Date();
            const timeStr = now.toLocaleTimeString(state.language === "ar" ? "ar-EG" : "en-US", {
                hour: "2-digit", minute: "2-digit", second: "2-digit"
            });
            if (timeEl && timeEl.querySelector("span")) {
                timeEl.querySelector("span").textContent = timeStr;
            }
        } catch (e) { }
    };
    updateTime();
    setInterval(updateTime, 1000);
}

// Theme Application
function applyTheme() {
    document.body.className = state.theme === "dark" ? "dark-mode" : "light-mode";
}

// Language Application
function applyLanguage() {
    const isRtl = state.language === "ar";
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = state.language;

    document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => {
        const view = item.getAttribute("data-view");
        const textSpan = item.querySelector(".menu-text");
        if (textSpan && translations[state.language] && translations[state.language][view]) {
            textSpan.textContent = translations[state.language][view];
        }
    });

    document.querySelectorAll("[data-en]").forEach(el => {
        if (state.language === "en") {
            el.setAttribute("data-ar", el.textContent);
            el.textContent = el.getAttribute("data-en");
        } else if (el.getAttribute("data-ar")) {
            el.textContent = el.getAttribute("data-ar");
        }
    });

    const posSearch = document.getElementById("pos-search-input") || document.getElementById("barcode-input");
    if (posSearch && translations[state.language]) {
        posSearch.placeholder = translations[state.language].searchPlaceholder || "امسح الباركود أو ابحث باسم المنتج...";
    }

    const invSearch = document.getElementById("inventory-search-input");
    if (invSearch) invSearch.placeholder = state.language === "ar" ? "ابحث باسم المنتج، الباركود، الفئة..." : "Search by name, barcode, category...";
}

// Navigation Setup
function setupNavigation() {
    document.querySelectorAll(".nav-btn, .sidebar-menu .menu-item, .mobile-nav-item[data-view], .mobile-drawer-btn[data-view]").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const view = item.getAttribute("data-view");
            if (view) {
                switchView(view);
                const drawer = document.getElementById("mobile-drawer");
                if (drawer) drawer.classList.remove("active");
            }
        });
    });

    addListenerSafe("sidebar-toggle-btn", "click", () => {
        const sidebar = document.getElementById("app-sidebar");
        if (sidebar) sidebar.classList.toggle("collapsed");
    });

    const sidebarSearch = document.getElementById("sidebar-menu-search");
    if (sidebarSearch) {
        sidebarSearch.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            document.querySelectorAll("#sidebar-nav-menu .nav-btn").forEach(btn => {
                const text = btn.textContent.toLowerCase();
                btn.style.display = text.includes(query) ? "flex" : "none";
            });
        });
    }

    const drawer = document.getElementById("mobile-drawer");
    const drawerToggle = document.getElementById("mobile-drawer-toggle");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const closeDrawerBtn = document.getElementById("close-mobile-drawer");

    if (drawerToggle) drawerToggle.addEventListener("click", () => drawer && drawer.classList.add("active"));
    if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", () => drawer && drawer.classList.add("active"));
    if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", () => drawer && drawer.classList.remove("active"));
    if (drawer) {
        drawer.addEventListener("click", (e) => {
            if (e.target === drawer) drawer.classList.remove("active");
        });
    }

    document.querySelectorAll("[data-go-to]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            const targetView = el.getAttribute("data-go-to");
            if (targetView) switchView(targetView);
            if (targetView === "inventory" && el.closest(".alerts-card")) {
                const filter = document.getElementById("inventory-stock-filter");
                if (filter) {
                    filter.value = "lowstock";
                    filter.dispatchEvent(new Event("change"));
                }
            }
        });
    });

    addListenerSafe("quick-pos-btn", "click", () => switchView("pos"));

    const statCards = document.querySelectorAll("#dashboard-view .stats-grid .stat-card");
    if (statCards.length >= 4) {
        statCards[0].addEventListener("click", () => switchView("reports"));
        statCards[1].addEventListener("click", () => switchView("reports"));
        statCards[2].addEventListener("click", () => {
            switchView("inventory");
            const filter = document.getElementById("inventory-stock-filter");
            if (filter) {
                filter.value = "lowstock";
                filter.dispatchEvent(new Event("change"));
            }
        });
        statCards[3].addEventListener("click", () => {
            switchView("inventory");
            const filter = document.getElementById("inventory-stock-filter");
            if (filter) {
                filter.value = "all";
                filter.dispatchEvent(new Event("change"));
            }
        });
    }
}

function switchView(viewName) {
    if (!viewName) return;

    try {
        document.querySelectorAll(".modal-overlay.active, .modal-backdrop.active, .modal-overlay.show, .modal-backdrop.show").forEach(m => {
            m.classList.remove("active", "show");
        });

        const cleanViewName = viewName.replace("-view", "");
        state.currentView = cleanViewName;
        saveState();

        document.querySelectorAll(".nav-btn, .menu-item, .mobile-nav-item, .mobile-drawer-btn").forEach(item => {
            const itemTarget = (item.getAttribute("data-view") || "").replace("-view", "");
            if (itemTarget === cleanViewName) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        document.querySelectorAll(".view-section").forEach(sec => {
            sec.classList.remove("active");
        });

        const targetSec = document.getElementById(`${cleanViewName}-view`) || document.getElementById(`view-${cleanViewName}`);
        if (targetSec) targetSec.classList.add("active");

        const titleEl = document.getElementById("current-view-title");
        const subtitleEl = document.getElementById("current-view-subtitle");

        if (titleEl && translations[state.language] && translations[state.language][cleanViewName]) {
            titleEl.textContent = translations[state.language][cleanViewName];
        }

        if (cleanViewName === "dashboard") {
            if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "مرحباً بك مجدداً، إليك نظرة عامة على أداء اليوم." : "Welcome back, here is today's overview.";
            renderDashboard();
        } else if (cleanViewName === "pos") {
            if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "شاشة الكاشير السريعة لإتمام عمليات البيع." : "Quick cashier screen to complete sales.";
            renderPOS();
        } else if (cleanViewName === "inventory") {
            if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "إدارة وتحديث المنتجات والأسعار والكميات المتاحة." : "Manage and update products, prices, and stock levels.";
            renderInventory();
        } else if (cleanViewName === "purchases") {
            if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "سجل فواتير الشراء والتوريد ودخول المنتجات للمخازن." : "Purchase invoice logs and stock entries.";
            renderPurchases();
        } else if (cleanViewName === "expenses") {
            if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "إدارة وتسجيل المصروفات التشغيلية اليومية والشهرية." : "Operational expenses management.";
            renderExpenses();
        } else if (cleanViewName === "waste") {
            if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "إسقاط وتجميع المنتجات التالفة ومتابعة الخسائر." : "Waste and damage management.";
            renderWaste();
        } else if (cleanViewName === "reports") {
            if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "تقارير المبيعات والأرباح التفصيلية للفترات المختلفة." : "Detailed sales and profit reports for different periods.";
            renderReports();
        } else if (cleanViewName === "customers") {
            if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "إدارة قاعدة بيانات العملاء ونقاط الولاء." : "Manage customer database and loyalty points.";
            renderCustomers();
        } else if (cleanViewName === "suppliers") {
            if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "إدارة الموردين وحسابات التوريد والآجل." : "Manage suppliers, restock purchases, and credit balances.";
            renderSuppliers();
        } else if (cleanViewName === "settings") {
            if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "تخصيص إعدادات النظام والنسخ الاحتياطي." : "Customize system settings and backups.";
            renderSettings();
        } else if (cleanViewName === "users") {
            renderUsers();
        }

        if (window.lucide) lucide.createIcons();
    } catch (err) {
        console.error(`Error rendering view ${viewName}:`, err);
    }
}
window.switchView = switchView;

function setupEventListeners() {
    addListenerSafe("theme-toggle-btn", "click", () => {
        state.theme = state.theme === "dark" ? "light" : "dark";
        saveState();
        applyTheme();
        if (state.currentView === "dashboard") renderDashboard();
    });

    addListenerSafe("lang-toggle-btn", "click", () => {
        state.language = state.language === "ar" ? "en" : "ar";
        const langBtn = document.getElementById("lang-toggle-btn");
        if (langBtn) langBtn.textContent = state.language === "ar" ? "EN" : "AR";

        updateCartSummary();
        renderCategoriesList();

        saveState();
        applyLanguage();
        switchView(state.currentView);
    });

    const closeModalBtns = [
        ["close-product-modal", "product-modal"],
        ["cancel-product-modal", "product-modal"],
        ["close-customer-modal", "customer-modal"],
        ["cancel-customer-modal", "customer-modal"],
        ["close-supplier-modal", "supplier-modal"],
        ["cancel-supplier-modal", "supplier-modal"],
        ["close-purchase-modal", "purchase-modal"],
        ["cancel-purchase-modal", "purchase-modal"],
        ["close-settle-modal", "settle-modal"],
        ["cancel-settle-modal", "settle-modal"],
        ["close-user-modal", "user-modal"],
        ["cancel-user-modal", "user-modal"],
        ["close-barcode-modal", "barcode-modal"],
        ["cancel-barcode-modal", "barcode-modal"],
        ["close-category-modal", "category-modal"],
        ["close-camera-modal", "camera-modal"],
    ];
    closeModalBtns.forEach(([btnId, modalId]) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        if (btn && modal) btn.addEventListener("click", () => modal.classList.remove("active"));
    });

    addListenerSafe("add-product-btn", "click", () => {
        const form = document.getElementById("product-form");
        if (form) form.reset();
        const idField = document.getElementById("product-id");
        if (idField) idField.value = "";
        const titleEl = document.getElementById("product-modal-title");
        if (titleEl) titleEl.textContent = state.language === "ar" ? "إضافة منتج جديد" : "Add New Product";
        const modal = document.getElementById("product-modal");
        if (modal) modal.classList.add("active");
    });

    addListenerSafe("add-customer-btn", "click", () => openCustomerModal());
    addListenerSafe("add-supplier-trigger-btn", "click", () => openSupplierModal());
    addListenerSafe("add-purchase-btn", "click", () => openPurchaseModal());

    addListenerSafe("manage-categories-btn", "click", () => {
        renderCategoriesList();
        const modal = document.getElementById("category-modal");
        if (modal) modal.classList.add("active");
    });

    addListenerSafe("barcode-sim-btn", "click", () => {
        const modal = document.getElementById("barcode-modal");
        if (modal) modal.classList.add("active");
    });

    addListenerSafe("add-user-btn", "click", () => {
        const form = document.getElementById("user-form");
        if (form) form.reset();
        const idField = document.getElementById("user-id");
        if (idField) idField.value = "";
        const titleEl = document.getElementById("user-modal-title");
        if (titleEl) titleEl.textContent = state.language === "ar" ? "إضافة مستخدم جديد" : "Add New User";
        const modal = document.getElementById("user-modal");
        if (modal) modal.classList.add("active");
    });

    addListenerSafe("close-receipt-modal", "click", () => {
        const receiptModal = document.getElementById("receipt-modal");
        if (receiptModal) receiptModal.classList.remove("active");
    });

    addListenerSafe("new-sale-btn", "click", () => {
        const receiptModal = document.getElementById("receipt-modal");
        if (receiptModal) receiptModal.classList.remove("active");
        clearCart();
    });

    addListenerSafe("print-receipt-btn", "click", () => {
        window.print();
    });

    addListenerSafe("add-batch-item-btn", "click", (e) => {
        e.preventDefault();
        addBatchItem();
    });

    ["pur-qty", "pur-cost", "pur-sell-price"].forEach(id => {
        addListenerSafe(id, "keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addBatchItem();
            }
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && !e.target.classList.contains("btn-primary")) {
            if (e.target.id === "pos-search-input" || e.target.id === "barcode-input") return;
            e.preventDefault();
        }
    });

    addListenerSafe("product-form", "submit", handleProductFormSubmit);
    addListenerSafe("customer-form", "submit", handleCustomerFormSubmit);
    addListenerSafe("supplier-form", "submit", handleSupplierFormSubmit);
    addListenerSafe("purchase-form", "submit", handlePurchaseFormSubmit);
    addListenerSafe("add-category-form", "submit", handleCategoryFormSubmit);
    addListenerSafe("expense-form", "submit", handleExpenseFormSubmit);
    addListenerSafe("waste-form", "submit", handleWasteFormSubmit);
    addListenerSafe("shift-form", "submit", handleShiftClosingSubmit);
    addListenerSafe("customer-settle-form", "submit", handleCustomerSettleFormSubmit);
    addListenerSafe("settle-form", "submit", handleSettleFormSubmit);
    addListenerSafe("user-form", "submit", handleUserFormSubmit);

    addListenerSafe("gen-barcode-btn", "click", () => {
        const barcodeInput = document.getElementById("prod-barcode");
        if (barcodeInput) {
            barcodeInput.value = "622" + Math.floor(100000 + Math.random() * 900000);
            checkSmartBarcode();
        }
    });

    addListenerSafe("prod-barcode", "input", checkSmartBarcode);

    addListenerSafe("clear-cart-btn", "click", () => {
        clearCart();
        showToast(state.language === "ar" ? "تم تفريغ السلة" : "Cart cleared", "warning");
    });
    addListenerSafe("cart-discount-input", "input", updateCartSummary);
    addListenerSafe("cart-discount", "input", updateCartSummary);
    addListenerSafe("checkout-btn", "click", openCheckoutModal);
    addListenerSafe("confirm-checkout-btn", "click", confirmCheckout);

    // Paid amount live calculation for checkout modal
    const paidInputEl = document.getElementById("paid-amount-input");
    if (paidInputEl) {
        paidInputEl.addEventListener("input", () => updateCheckoutChangeDisplay());
    }

    // Quick cash preset chips in checkout modal
    document.querySelectorAll(".btn-quick-cash").forEach(btn => {
        btn.addEventListener("click", () => {
            const amountType = btn.getAttribute("data-amount");
            const paidInput = document.getElementById("paid-amount-input");
            if (!paidInput) return;
            if (amountType === "exact") {
                let subtotal = 0;
                (state.cart || []).forEach(item => {
                    const prod = (state.products || []).find(p => p.id === item.productId);
                    if (prod) subtotal += prod.price * item.qty;
                });
                const discountInput = document.getElementById("cart-discount-input");
                const discountPercent = discountInput ? (parseFloat(discountInput.value) || 0) : 0;
                const discountAmount = subtotal * (discountPercent / 100);
                const taxableAmount = subtotal - discountAmount;
                const taxAmount = taxableAmount * ((state.settings.taxRate || 0) / 100);
                const finalTotal = taxableAmount + taxAmount;
                paidInput.value = finalTotal.toFixed(2);
            } else {
                paidInput.value = amountType;
            }
            updateCheckoutChangeDisplay();
        });
    });

    // Checkout payment method card selector
    document.querySelectorAll(".checkout-payment-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".checkout-payment-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;

            const method = card.getAttribute("data-method");
            const cashDetails = document.getElementById("cash-payment-details");
            if (cashDetails) {
                cashDetails.style.display = (method === "cash") ? "block" : "none";
            }
        });
    });

    // Bale / Carton pricing calculator
    const updateCostFromBale = () => {
        const p = parseFloat(document.getElementById("pur-bale-price")?.value) || 0;
        const q = parseInt(document.getElementById("pur-bale-qty")?.value) || 1;
        if (p > 0 && q > 0) {
            const costInp = document.getElementById("pur-cost");
            if (costInp) costInp.value = (p / q).toFixed(2);
        }
    };
    addListenerSafe("pur-bale-price", "input", updateCostFromBale);
    addListenerSafe("pur-bale-qty", "input", updateCostFromBale);

    // Paper Invoice Image FileReader
    const fileInp = document.getElementById("pur-invoice-file");
    if (fileInp) {
        fileInp.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target.result;
                const imgDataField = document.getElementById("pur-invoice-image-data");
                const previewWrapper = document.getElementById("pur-image-preview-wrapper");
                const previewImg = document.getElementById("pur-image-preview");
                if (imgDataField) imgDataField.value = dataUrl;
                if (previewImg) previewImg.src = dataUrl;
                if (previewWrapper) previewWrapper.style.display = "block";
            };
            reader.readAsDataURL(file);
        });
    }

    addListenerSafe("pur-payment", "change", () => {
        const paymentSel = document.getElementById("pur-payment");
        const wrapper = document.getElementById("pur-paid-amount-wrapper");
        if (!paymentSel || !wrapper) return;
        if (paymentSel.value === "partial") {
            wrapper.style.display = "block";
            const qty = parseInt(document.getElementById("pur-qty")?.value) || 1;
            const cost = parseFloat(document.getElementById("pur-cost")?.value) || 0;
            const totalCost = qty * cost;
            const paidInput = document.getElementById("pur-paid-amount");
            if (paidInput) paidInput.max = totalCost;
        } else {
            wrapper.style.display = "none";
        }
    });

    ["pur-qty", "pur-cost"].forEach(id => {
        addListenerSafe(id, "input", () => {
            const paymentSel = document.getElementById("pur-payment");
            if (paymentSel && paymentSel.value === "partial") {
                const qty = parseInt(document.getElementById("pur-qty")?.value) || 1;
                const cost = parseFloat(document.getElementById("pur-cost")?.value) || 0;
                const paidInput = document.getElementById("pur-paid-amount");
                if (paidInput) paidInput.max = qty * cost;
            }
        });
    });

    addListenerSafe("supplier-search-input", "input", renderSuppliersTable);
    addListenerSafe("settle-form", "submit", handleSettleFormSubmit);
    addListenerSafe("customer-search-input", "input", renderCustomers);

    addListenerSafe("inventory-search-input", "input", renderInventoryTable);
    addListenerSafe("inventory-category-filter", "change", renderInventoryTable);
    addListenerSafe("inventory-stock-filter", "change", renderInventoryTable);

    addListenerSafe('users-search', 'input', renderUsers);

    const settingsForm = document.getElementById("settings-form");
    if (settingsForm) {
        settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            state.settings.storeName = document.getElementById("settings-store-name").value;
            state.settings.currency = document.getElementById("settings-currency").value;
            state.settings.taxRate = parseFloat(document.getElementById("settings-tax-rate").value) || 0;
            state.settings.lowStockLimit = parseInt(document.getElementById("settings-low-stock").value) || 10;
            saveState();
            showToast(state.language === "ar" ? "تم حفظ الإعدادات بنجاح!" : "Settings saved successfully!", "success");
        });
    }

    addListenerSafe("backup-data-btn", "click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `supermarket_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast(state.language === "ar" ? "تم تصدير النسخة الاحتياطية" : "Backup exported successfully", "success");
    });

    addListenerSafe("restore-data-trigger", "click", () => {
        const restoreInput = document.getElementById("restore-data-file");
        if (restoreInput) restoreInput.click();
    });

    const restoreInput = document.getElementById("restore-data-file");
    if (restoreInput) {
        restoreInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (parsed.products && parsed.categories) {
                        Object.assign(state, parsed);
                        saveState();
                        showToast(state.language === "ar" ? "تم استيراد البيانات بنجاح!" : "Data imported successfully!", "success");
                        setTimeout(() => window.location.reload(), 1000);
                    } else {
                        showToast(state.language === "ar" ? "ملف غير صالح!" : "Invalid file format!", "danger");
                    }
                } catch (err) {
                    showToast(state.language === "ar" ? "خطأ في قراءة الملف!" : "Error reading file!", "danger");
                }
            };
            reader.readAsText(file);
        });
    }

    addListenerSafe("reset-data-btn", "click", () => {
        if (confirm(state.language === "ar" ? "هل أنت متأكد من مسح كافة البيانات وإعادة تهيئة النظام؟" : "Are you sure you want to reset all data?")) {
            resetToDefault();
            showToast(state.language === "ar" ? "تمت تهيئة النظام بالكامل" : "System reset complete", "danger");
            setTimeout(() => window.location.reload(), 1000);
        }
    });

    document.querySelectorAll(".payment-method").forEach(method => {
        method.addEventListener("click", () => {
            document.querySelectorAll(".payment-method").forEach(m => m.classList.remove("active"));
            method.classList.add("active");
            const input = method.querySelector("input");
            if (input) input.checked = true;
        });
    });

    addListenerSafe("manage-categories-btn", "click", () => {
        renderCategoriesList();
    });
}

function checkSmartBarcode() {
    const barcodeInput = document.getElementById("prod-barcode");
    if (!barcodeInput) return;
    const barcode = barcodeInput.value.trim();
    if (!SMART_BARCODE_DATABASE) return;

    const match = SMART_BARCODE_DATABASE[barcode];
    if (match) {
        const nameEl = document.getElementById("prod-name");
        const catEl = document.getElementById("prod-category");
        const buyEl = document.getElementById("prod-buy-price") || document.getElementById("prod-cost");
        const sellEl = document.getElementById("prod-sell-price") || document.getElementById("prod-price");

        if (nameEl) nameEl.value = match.name;
        if (catEl) catEl.value = match.category;
        if (buyEl) buyEl.value = match.cost;
        if (sellEl) sellEl.value = match.price;

        barcodeInput.style.borderColor = 'var(--success)';
        barcodeInput.style.boxShadow = '0 0 8px rgba(6, 182, 212, 0.3)';
    } else {
        barcodeInput.style.borderColor = '';
        barcodeInput.style.boxShadow = '';
    }
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('PWA Service Worker registered:', reg.scope))
            .catch(err => console.warn('Service Worker registration failed:', err));
    });
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById("pwa-install-banner");
    if (banner) banner.style.display = "flex";
});

document.addEventListener("DOMContentLoaded", () => {
    const installBtn = document.getElementById("pwa-install-btn");
    const closeBtn = document.getElementById("pwa-close-btn");
    const banner = document.getElementById("pwa-install-banner");

    if (installBtn) {
        installBtn.addEventListener("click", async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User installed Gaser Market PWA app');
                }
                deferredPrompt = null;
                if (banner) banner.style.display = "none";
            } else {
                alert(state.language === "ar" ? "لتثبيت التطبيق على جهازك: من خيارات المتصفح (⋮ أو 📤) اختر 'إضافة إلى الشاشة الرئيسية' أو 'تثبيت التطبيق'." : "To install app: Open browser menu (⋮) and select 'Add to Home screen' or 'Install App'.");
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            if (banner) banner.style.display = "none";
        });
    }
});

// Global exception safety handler
window.addEventListener('error', (e) => {
    console.error('System Notice:', e.message, e.filename, e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});