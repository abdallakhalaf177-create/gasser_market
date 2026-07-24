import { state, loadState, saveState, resetToDefault, addToCart, updateCartQty, clearCart, onCartChange, cancelTransaction } from './state.js';
import { translations, SMART_BARCODE_DATABASE } from './constants.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderPOS, renderPOSCategoryDropdowns, renderPOSProducts, renderPOSCustomerDropdown, renderCart, updateCartSummary, handleCheckout, viewReceipt, closeReceiptModal, printReceipt } from './modules/pos.js';
import { renderInventory, renderInventoryTable, handleProductFormSubmit, editProduct, deleteProduct } from './modules/inventory.js';
import { handleCategoryFormSubmit, renderCategoriesList, deleteCategory } from './modules/categories.js';
import { renderReports, renderReportsData, openLowStockReport, closeLowStockModal, printLowStockReport, exportLowStockCSV, setReportRange, openExpiryReport, closeExpiryModal } from './modules/reports.js';
import { renderCustomers, handleCustomerFormSubmit, editCustomer, deleteCustomer, openCustomerModal, openCustomerSettleModal, handleCustomerSettleFormSubmit } from './modules/customers.js';
import { renderSuppliers, renderSuppliersTable, handleSupplierFormSubmit, editSupplier, deleteSupplier, handlePurchaseFormSubmit, openSettleModal, handleSettleFormSubmit, renderPurchases, openSupplierModal, openPurchaseModal } from './modules/suppliers.js';
import { renderExpenses, openExpenseModal, handleExpenseFormSubmit, deleteExpense } from './modules/expenses.js';
import { renderWaste, openWasteModal, handleWasteFormSubmit } from './modules/waste.js';
import { openShiftModal, handleShiftClosingSubmit } from './modules/shifts.js';
import { renderSettings } from './modules/settings.js';
import { initAuth, renderUsers, handleUserFormSubmit, editUser, deleteUser } from './modules/users.js';

// Expose user functions globally so inline onclick events work
window.editUser = editUser;
window.deleteUser = deleteUser;
window.openLowStockReport = openLowStockReport;
window.closeLowStockModal = closeLowStockModal;
window.openExpiryReport = openExpiryReport;
window.closeExpiryModal = closeExpiryModal;
window.printLowStockReport = printLowStockReport;
window.exportLowStockCSV = exportLowStockCSV;
window.setReportRange = setReportRange;
window.openCustomerModal = openCustomerModal;
window.openCustomerSettleModal = openCustomerSettleModal;
window.handleCustomerSettleFormSubmit = handleCustomerSettleFormSubmit;
window.openSupplierModal = openSupplierModal;
window.openPurchaseModal = openPurchaseModal;
window.closeReceiptModal = closeReceiptModal;
window.printReceipt = printReceipt;

window.openExpenseModal = openExpenseModal;
window.handleExpenseFormSubmit = handleExpenseFormSubmit;
window.deleteExpense = deleteExpense;

window.openWasteModal = openWasteModal;
window.handleWasteFormSubmit = handleWasteFormSubmit;

window.openShiftModal = openShiftModal;
window.handleShiftClosingSubmit = handleShiftClosingSubmit;

// Audio Feedback Synthesizer using Web Audio API (works offline)
export function playBeep(frequency = 440, duration = 0.1) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime); // volume limit
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("AudioContext block by browser auto-play policy or not supported", e);
    }
}

// Gorgeous Toast Notification Helper
export function showToast(message, type = 'info') {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    else if (type === 'warning') icon = 'alert-triangle';
    else if (type === 'danger') icon = 'alert-circle';

    toast.innerHTML = `
        <i data-lucide="${icon}" style="width: 18px; height: 18px; color: var(--${type === 'danger' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'});"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    // Sound effect
    if (type === 'success') {
        playBeep(523.25, 0.08); // High pitch C5 beep for success
    } else if (type === 'danger' || type === 'warning') {
        playBeep(220, 0.22); // Low pitch error beep
    }

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Bind dynamically called template functions to the window object
window.updateCartQty = updateCartQty;
window.viewReceipt = viewReceipt;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.deleteCategory = deleteCategory;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.editSupplier = editSupplier;
window.openSettleModal = openSettleModal;
window.deleteSupplier = deleteSupplier;
window.cancelTransaction = cancelTransaction;
window.showToast = showToast;
window.playBeep = playBeep;
window.refreshCurrentView = () => {
    switchView(state.currentView);
};

document.addEventListener("DOMContentLoaded", async () => {
    await loadState();
    initAuth();
    applyTheme();
    applyLanguage();
    setupNavigation();
    setupEventListeners();
    setupLiveTime();
    setupKeyboardShortcuts();

    // Register cart change UI rendering hook
    onCartChange(() => {
        renderCart();
    });

    // Initial view rendering
    switchView(state.currentView);
    if (window.lucide) lucide.createIcons();
});

// Safe event listener attaching helper (DOM Check Guards)
const addListenerSafe = (id, event, callback) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, callback);
};

// Keyboard Shortcuts Integration (F1, F2, F3, F4)
function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        // F1 -> Switch to POS
        if (e.key === "F1") {
            e.preventDefault();
            switchView("pos");
            showToast(state.language === "ar" ? "تم الانتقال إلى الكاشير" : "Switched to POS", "info");
        }
        // F2 -> Refresh current view
        if (e.key === "F2") {
            e.preventDefault();
            switchView(state.currentView);
        }
        // F3 -> Switch to Dashboard
        if (e.key === "F3") {
            e.preventDefault();
            switchView("dashboard");
            showToast(state.language === "ar" ? "تم الانتقال إلى لوحة التحكم" : "Switched to Dashboard", "info");
        }
        // F4 -> Clear cart if in POS
        if (e.key === "F4") {
            if (state.currentView === "pos") {
                e.preventDefault();
                clearCart();
                showToast(state.language === "ar" ? "تم تفريغ السلة" : "Cart cleared", "warning");
            }
        }
        // Escape -> Close active modals
        if (e.key === "Escape") {
            document.querySelectorAll(".modal-overlay.active, .modal-backdrop.active").forEach(m => {
                m.classList.remove("active", "show");
            });
        }
    });

    // Close modal when clicking on dark overlay backdrop
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
        const now = new Date();
        const timeStr = now.toLocaleTimeString(state.language === "ar" ? "ar-EG" : "en-US", {
            hour: "2-digit", minute: "2-digit", second: "2-digit"
        });
        if (timeEl && timeEl.querySelector("span")) {
            timeEl.querySelector("span").textContent = timeStr;
        }
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

    // Update sidebar text
    document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => {
        const view = item.getAttribute("data-view");
        const textSpan = item.querySelector(".menu-text");
        if (textSpan && translations[state.language] && translations[state.language][view]) {
            textSpan.textContent = translations[state.language][view];
        }
    });

    // Update static labels with data-en
    document.querySelectorAll("[data-en]").forEach(el => {
        if (state.language === "en") {
            el.setAttribute("data-ar", el.textContent);
            el.textContent = el.getAttribute("data-en");
        } else if (el.getAttribute("data-ar")) {
            el.textContent = el.getAttribute("data-ar");
        }
    });

    // Update search inputs placeholders
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
            // Auto filter low stock if heading to inventory from low stock alerts card
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

    // Dynamic stats cards click handling
    const statCards = document.querySelectorAll("#view-dashboard .stats-grid .stat-card");
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

    // Auto-close any lingering modals when switching view tabs
    document.querySelectorAll(".modal-overlay.active, .modal-backdrop.active, .modal-overlay.show, .modal-backdrop.show").forEach(m => {
        m.classList.remove("active", "show");
    });

    // Normalize view name (handle pos vs pos-view)
    const cleanViewName = viewName.replace("-view", "");
    state.currentView = cleanViewName;
    saveState();

    // Update active nav button
    document.querySelectorAll(".nav-btn, .menu-item, .mobile-nav-item, .mobile-drawer-btn").forEach(item => {
        const itemTarget = (item.getAttribute("data-view") || "").replace("-view", "");
        if (itemTarget === cleanViewName) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Update active section
    document.querySelectorAll(".view-section").forEach(sec => {
        sec.classList.remove("active");
    });

    const targetSec = document.getElementById(`${cleanViewName}-view`) || document.getElementById(`view-${cleanViewName}`);
    if (targetSec) targetSec.classList.add("active");

    // Update header title
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
}
window.switchView = switchView;

// Global Event Listeners & Modals
function setupEventListeners() {
    // Theme & Language toggles
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

    // Modals Open/Close Setup Helper
    const setupModal = (modalId, openBtnId, closeBtnId, cancelBtnId) => {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = document.getElementById(closeBtnId);
        const cancelBtn = document.getElementById(cancelBtnId);

        if (modal) {
            if (openBtn) openBtn.addEventListener("click", () => modal.classList.add("active"));
            if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("active"));
            if (cancelBtn) cancelBtn.addEventListener("click", () => modal.classList.remove("active"));
        }
    };

    setupModal("product-modal", "add-product-btn", "close-product-modal", "cancel-product-modal");
    setupModal("customer-modal", "add-customer-btn", "close-customer-modal", "cancel-customer-modal");
    setupModal("barcode-modal", "barcode-sim-btn", "close-barcode-modal", "cancel-barcode-modal");
    setupModal("category-modal", "manage-categories-btn", "close-category-modal", null);
    setupModal("supplier-modal", "add-supplier-trigger-btn", "close-supplier-modal", "cancel-supplier-modal");
    setupModal("purchase-modal", "add-purchase-btn", "close-purchase-modal", "cancel-purchase-modal");
    setupModal("settle-modal", null, "close-settle-modal", "cancel-settle-modal");
    setupModal("user-modal", "add-user-btn", "close-user-modal", "cancel-user-modal");
    setupModal("camera-modal", "btn-camera-scan", "close-camera-modal", null);

    // Form resets when clicking "Add New" buttons
    addListenerSafe("add-product-btn", "click", () => {
        const form = document.getElementById("product-form");
        if (form) form.reset();
        const idField = document.getElementById("product-id");
        if (idField) idField.value = "";
        const modalTitle = document.getElementById("product-modal-title");
        if (modalTitle) modalTitle.textContent = state.language === "ar" ? "إضافة منتج جديد" : "Add New Product";
    });

    addListenerSafe("add-customer-btn", "click", () => {
        const form = document.getElementById("customer-form");
        if (form) form.reset();
        const idField = document.getElementById("customer-id");
        if (idField) idField.value = "";
        const modalTitle = document.getElementById("customer-modal-title");
        if (modalTitle) modalTitle.textContent = state.language === "ar" ? "إضافة عميل جديد" : "Add New Customer";
    });

    addListenerSafe("add-supplier-trigger-btn", "click", () => {
        const form = document.getElementById("supplier-form");
        if (form) form.reset();
        const idField = document.getElementById("supplier-id");
        if (idField) idField.value = "";
        const modalTitle = document.getElementById("supplier-modal-title");
        if (modalTitle) modalTitle.textContent = state.language === "ar" ? "إضافة مورد جديد" : "Add New Supplier";
    });

    // Close receipt modal
    addListenerSafe("close-receipt-modal", "click", () => {
        const receiptModal = document.getElementById("receipt-modal");
        if (receiptModal) receiptModal.classList.remove("active");
    });
    addListenerSafe("new-sale-btn", "click", () => {
        const receiptModal = document.getElementById("receipt-modal");
        if (receiptModal) receiptModal.classList.remove("active");
        clearCart();
    });

    // Print receipt
    addListenerSafe("print-receipt-btn", "click", () => {
        window.print();
    });

    // Prevent random form submit via scanner ENTER keypress glitch
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && !e.target.classList.contains("btn-primary")) {
            if (e.target.id === "pos-search-input" || e.target.id === "barcode-input") return;
            e.preventDefault();
        }
    });



    // Forms Form submits
    addListenerSafe("product-form", "submit", handleProductFormSubmit);
    addListenerSafe("customer-form", "submit", handleCustomerFormSubmit);
    addListenerSafe("supplier-form", "submit", handleSupplierFormSubmit);
    addListenerSafe("purchase-form", "submit", handlePurchaseFormSubmit);
    addListenerSafe("add-category-form", "submit", handleCategoryFormSubmit);

    // Generate Barcode Button
    addListenerSafe("gen-barcode-btn", "click", () => {
        const barcodeInput = document.getElementById("prod-barcode");
        if (barcodeInput) {
            barcodeInput.value = "622" + Math.floor(100000 + Math.random() * 900000);
            checkSmartBarcode();
        }
    });

    // Barcode auto-fill listener
    addListenerSafe("prod-barcode", "input", checkSmartBarcode);



    // POS Cart Actions
    addListenerSafe("clear-cart-btn", "click", () => {
        clearCart();
        showToast(state.language === "ar" ? "تم تفريغ السلة" : "Cart cleared", "warning");
    });
    addListenerSafe("cart-discount-input", "input", updateCartSummary);
    addListenerSafe("cart-discount", "input", updateCartSummary);
    addListenerSafe("checkout-btn", "click", handleCheckout);

    // Supplier search
    addListenerSafe("supplier-search-input", "input", renderSuppliersTable);

    // Inventory Search & Filters
    addListenerSafe("inventory-search-input", "input", renderInventoryTable);
    addListenerSafe("inventory-category-filter", "change", renderInventoryTable);
    addListenerSafe("inventory-stock-filter", "change", renderInventoryTable);

    // Settings & Users
    if (document.getElementById('settle-form')) {
        document.getElementById('settle-form').addEventListener('submit', handleSettleFormSubmit);
    }

    if (document.getElementById('user-form')) {
        document.getElementById('user-form').addEventListener('submit', handleUserFormSubmit);
    }

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

    // Backup & Restore
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

    // Payment method selection
    document.querySelectorAll(".payment-method").forEach(method => {
        method.addEventListener("click", () => {
            document.querySelectorAll(".payment-method").forEach(m => m.classList.remove("active"));
            method.classList.add("active");
            const input = method.querySelector("input");
            if (input) input.checked = true;
        });
    });

    // Category Manager Modal Trigger Setup
    addListenerSafe("manage-categories-btn", "click", () => {
        renderCategoriesList();
    });
}

// Smart Barcode Autofill Checker
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

// ==========================================================================
// PWA SERVICE WORKER REGISTRATION & INSTALLATION PROMPT
// ==========================================================================
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