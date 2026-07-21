import { state, loadState, saveState, resetToDefault, addToCart, updateCartQty, clearCart, onCartChange, cancelTransaction } from './state.js';
import { translations, SMART_BARCODE_DATABASE } from './constants.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderPOS, renderPOSCategoryDropdowns, renderPOSProducts, renderPOSCustomerDropdown, renderCart, updateCartSummary, handleCheckout, viewReceipt } from './modules/pos.js';
import { renderInventory, renderInventoryTable, handleProductFormSubmit, editProduct, deleteProduct } from './modules/inventory.js';
import { handleCategoryFormSubmit, renderCategoriesList, deleteCategory } from './modules/categories.js';
import { renderReports, renderReportsData } from './modules/reports.js';
import { renderCustomers, handleCustomerFormSubmit, editCustomer, deleteCustomer } from './modules/customers.js';
import { renderSuppliers, renderSuppliersTable, handleSupplierFormSubmit, editSupplier, deleteSupplier, handlePurchaseFormSubmit, openSettleModal, handleSettleFormSubmit } from './modules/suppliers.js';
import { renderSettings } from './modules/settings.js';
import { initAuth, renderUsers, handleUserFormSubmit, editUser, deleteUser } from './modules/users.js';

// Expose user functions globally so inline onclick events work
window.editUser = editUser;
window.deleteUser = deleteUser;

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

// Toast Notification Helper
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
        <i data-lucide="${icon}" style="width: 18px; height: 18px;"></i>
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
    switchView(state.currentView || "pos-view");
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
            switchView("pos-view");
            showToast(state.language === "ar" ? "تم الانتقال إلى الكاشير" : "Switched to POS", "info");
        }
        // F2 -> Refresh current view
        if (e.key === "F2") {
            e.preventDefault();
            switchView(state.currentView);
        }
        // F3 -> Switch to Dashboard/Reports
        if (e.key === "F3") {
            e.preventDefault();
            switchView("reports-view");
            showToast(state.language === "ar" ? "تم الانتقال إلى التقارير" : "Switched to Reports", "info");
        }
        // F4 -> Clear cart if in POS
        if (e.key === "F4") {
            if (state.currentView === "pos-view") {
                e.preventDefault();
                clearCart();
                showToast(state.language === "ar" ? "تم تفريغ السلة" : "Cart cleared", "warning");
            }
        }
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

    // Update nav buttons text if available in translations
    document.querySelectorAll(".nav-links .nav-btn").forEach(item => {
        const view = item.getAttribute("data-view");
        const key = view ? view.replace("-view", "") : "";
        if (translations[state.language] && translations[state.language][key]) {
            const icon = item.querySelector("i") ? item.querySelector("i").outerHTML : "";
            item.innerHTML = `${icon} ${translations[state.language][key]}`;
        }
    });

    // Update search inputs placeholders
    const posSearch = document.getElementById("barcode-input");
    if (posSearch && translations[state.language]) {
        posSearch.placeholder = translations[state.language].searchPlaceholder || "امسح الباركود أو ابحث باسم المنتج...";
    }
}

// Navigation Setup
function setupNavigation() {
    document.querySelectorAll(".nav-links .nav-btn").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const view = item.getAttribute("data-view");
            switchView(view);
        });
    });

    document.querySelectorAll("[data-go-to]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            const targetView = el.getAttribute("data-go-to");
            switchView(targetView);
        });
    });
}

function switchView(viewName) {
    state.currentView = viewName;
    saveState();

    // Update active nav button
    document.querySelectorAll(".nav-links .nav-btn").forEach(item => {
        if (item.getAttribute("data-view") === viewName) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Update active view section
    document.querySelectorAll(".view-section").forEach(sec => {
        sec.classList.remove("active");
    });

    // Normalize view container ID lookup
    const targetId = viewName.endsWith("-view") ? viewName : `${viewName}-view`;
    const targetSec = document.getElementById(targetId);
    if (targetSec) targetSec.classList.add("active");

    // Render corresponding view
    if (viewName === "pos-view" || viewName === "pos") {
        renderPOS();
    } else if (viewName === "inventory-view" || viewName === "inventory") {
        renderInventory();
    } else if (viewName === "reports-view" || viewName === "reports") {
        renderReports();
    } else if (viewName === "customers-view" || viewName === "customers") {
        renderCustomers();
    } else if (viewName === "suppliers-view" || viewName === "suppliers") {
        renderSuppliers();
    } else if (viewName === "settings-view" || viewName === "settings") {
        renderSettings();
    } else if (viewName === "users-view" || viewName === "users") {
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
    });

    addListenerSafe("lang-toggle-btn", "click", () => {
        state.language = state.language === "ar" ? "en" : "ar";
        saveState();
        applyLanguage();
        switchView(state.currentView);
    });

    // Modals Setup Helper
    const setupModal = (modalId, openBtnId, closeBtnId, cancelBtnId) => {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = document.getElementById(closeBtnId);
        const cancelBtn = document.getElementById(cancelBtnId);

        if (openBtn && modal) openBtn.addEventListener("click", () => modal.classList.add("active"));
        if (closeBtn && modal) closeBtn.addEventListener("click", () => modal.classList.remove("active"));
        if (cancelBtn && modal) cancelBtn.addEventListener("click", () => modal.classList.remove("active"));
    };

    setupModal("product-modal", "add-product-btn", "close-product-modal", "cancel-product-modal");
    setupModal("purchase-modal", "add-purchase-btn", "close-purchase-modal", "cancel-purchase-modal");
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

    // Prevent random form submit via scanner ENTER keypress glitch
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && !e.target.classList.contains("btn-primary")) {
            if (e.target.id === "barcode-input") return;
            e.preventDefault();
        }
    });

    // Handle barcode scanner input event inside POS search input
    const posSearch = document.getElementById("barcode-input");
    if (posSearch) {
        posSearch.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const barcode = posSearch.value.trim();
                if (!barcode) return;
                const prod = state.products ? state.products.find(p => p.barcode === barcode) : null;
                if (prod) {
                    addToCart(prod.id);
                    posSearch.value = "";
                    showToast(state.language === "ar" ? `تمت إضافة ${prod.name}` : `Added ${prod.name}`, "success");
                } else {
                    showToast(state.language === "ar" ? "المنتج غير مسجل في المخازن!" : "Product not found!", "danger");
                }
            }
        });
        posSearch.addEventListener("input", renderPOSProducts);
    }

    // Forms Submits
    addListenerSafe("product-form", "submit", handleProductFormSubmit);
    addListenerSafe("customer-form", "submit", handleCustomerFormSubmit);
    addListenerSafe("supplier-form", "submit", handleSupplierFormSubmit);
    addListenerSafe("purchase-form", "submit", handlePurchaseFormSubmit);
    addListenerSafe("user-form", "submit", handleUserFormSubmit);

    // POS Cart Actions
    addListenerSafe("clear-cart-btn", "click", () => {
        clearCart();
        showToast(state.language === "ar" ? "تم تفريغ السلة" : "Cart cleared", "warning");
    });
    addListenerSafe("cart-discount", "input", updateCartSummary);
    addListenerSafe("checkout-btn", "click", handleCheckout);

    // Smart Barcode auto-fill listener
    addListenerSafe("prod-barcode", "input", checkSmartBarcode);
}

// Smart Barcode Autofill Checker
function checkSmartBarcode() {
    const barcodeInput = document.getElementById("prod-barcode");
    if (!barcodeInput) return;
    const barcode = barcodeInput.value.trim();
    if (!SMART_BARCODE_DATABASE) return;

    const match = SMART_BARCODE_DATABASE[barcode];
    if (match) {
        const nameField = document.getElementById("prod-name");
        const buyPriceField = document.getElementById("prod-buy-price");
        const sellPriceField = document.getElementById("prod-sell-price");

        if (nameField) nameField.value = match.name;
        if (buyPriceField) buyPriceField.value = match.cost;
        if (sellPriceField) sellPriceField.value = match.price;

        barcodeInput.style.borderColor = 'var(--success)';
    } else {
        barcodeInput.style.borderColor = '';
    }
}