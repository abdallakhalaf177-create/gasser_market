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
    lucide.createIcons();

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
    lucide.createIcons();
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
        // F2 -> Checkout if in POS
        if (e.key === "F2") {
                renderSuppliersTable();
                break;
            case "settings":
                renderSettings();
                break;
            case "users":
                renderUsers();
                break;
        }// F3 -> Switch to Dashboard
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
        if (textSpan) {
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
    const posSearch = document.getElementById("pos-search-input");
    if (posSearch) posSearch.placeholder = translations[state.language].searchPlaceholder;

    const invSearch = document.getElementById("inventory-search-input");
    if (invSearch) invSearch.placeholder = state.language === "ar" ? "ابحث باسم المنتج، الباركود، الفئة..." : "Search by name, barcode, category...";
}

// Navigation Setup
function setupNavigation() {
    document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => {
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
        // Today's Sales Card
        statCards[0].addEventListener("click", () => switchView("reports"));
        
        // Sales Operations Card
        statCards[1].addEventListener("click", () => switchView("reports"));
        
        // Low Stock alerts Card -> Inventory view filtered
        statCards[2].addEventListener("click", () => {
            switchView("inventory");
            const filter = document.getElementById("inventory-stock-filter");
            if (filter) {
                filter.value = "lowstock";
                filter.dispatchEvent(new Event("change"));
            }
        });
        
        // Total Products Card -> Inventory view unfiltered
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
    state.currentView = viewName;
    saveState();

    // Update active menu item
    document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => {
        if (item.getAttribute("data-view") === viewName) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Update active section
    document.querySelectorAll(".view-section").forEach(sec => {
        sec.classList.remove("active");
    });
    const targetSec = document.getElementById(`view-${viewName}`);
    if (targetSec) targetSec.classList.add("active");

    // Update header title
    const titleEl = document.getElementById("current-view-title");
    const subtitleEl = document.getElementById("current-view-subtitle");

    if (titleEl) titleEl.textContent = translations[state.language][viewName];

    if (viewName === "dashboard") {
        if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "مرحباً بك مجدداً، إليك نظرة عامة على أداء اليوم." : "Welcome back, here is today's overview.";
        renderDashboard();
    } else if (viewName === "pos") {
        if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "شاشة الكاشير السريعة لإتمام عمليات البيع." : "Quick cashier screen to complete sales.";
        renderPOS();
    } else if (viewName === "inventory") {
        if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "إدارة وتحديث المنتجات والأسعار والكميات المتاحة." : "Manage and update products, prices, and stock levels.";
        renderInventory();
    } else if (viewName === "reports") {
        if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "تقارير المبيعات والأرباح التفصيلية للفترات المختلفة." : "Detailed sales and profit reports for different periods.";
        renderReports();
    } else if (viewName === "customers") {
        if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "إدارة قاعدة بيانات العملاء ونقاط الولاء." : "Manage customer database and loyalty points.";
        renderCustomers();
    } else if (viewName === "suppliers") {
        if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "إدارة الموردين وحسابات التوريد والآجل." : "Manage suppliers, restock purchases, and credit balances.";
        renderSuppliers();
    } else if (viewName === "settings") {
        if (subtitleEl) subtitleEl.textContent = state.language === "ar" ? "تخصيص إعدادات النظام والنسخ الاحتياطي." : "Customize system settings and backups.";
        renderSettings();
    } else if (viewName === "users") {
        renderUsers();
    }

    lucide.createIcons();
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
        // Global setup
        updateCartSummary();
        renderCategoriesList(); // Initial render for lists
        
        // Final UI Updates
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

        if (openBtn) openBtn.addEventListener("click", () => modal.classList.add("active"));
        if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("active"));
        if (cancelBtn) cancelBtn.addEventListener("click", () => modal.classList.remove("active"));
    };

    setupModal("product-modal", "add-product-btn", "close-product-modal", "cancel-product-modal");
    setupModal("customer-modal", "add-customer-btn", "close-customer-modal", "cancel-customer-modal");
    setupModal("barcode-modal", "barcode-sim-btn", "close-barcode-modal", "cancel-barcode-modal");
    setupModal("category-modal", "manage-categories-btn", "close-category-modal", null);
    setupModal("supplier-modal", "add-supplier-trigger-btn", "close-supplier-modal", "cancel-supplier-modal");
    setupModal("purchase-modal", "add-purchase-invoice-btn", "close-purchase-modal", "cancel-purchase-modal");
    setupModal("settle-modal", null, "close-settle-modal", "cancel-settle-modal");
    setupModal("user-modal", null, "close-user-modal", "cancel-user-modal");

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

    // Quick customer add in POS
    addListenerSafe("add-customer-quick-btn", "click", () => {
        const form = document.getElementById("customer-form");
        if (form) form.reset();
        const idField = document.getElementById("customer-id");
        if (idField) idField.value = "";
        const modalTitle = document.getElementById("customer-modal-title");
        if (modalTitle) modalTitle.textContent = state.language === "ar" ? "إضافة عميل جديد" : "Add New Customer";
        const custModal = document.getElementById("customer-modal");
        if (custModal) custModal.classList.add("active");
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
            if (e.target.id === "pos-search-input") return; // Allow POS scan input enter handler to capture it
            e.preventDefault();
        }
    });

    // Handle barcode scanner input event inside POS search input
    const posSearch = document.getElementById("pos-search-input");
    if (posSearch) {
        posSearch.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const barcode = posSearch.value.trim();
                if (!barcode) return;
                const prod = state.products.find(p => p.barcode === barcode);
                if (prod) {
                    addToCart(prod.id);
                    posSearch.value = ""; // Clear input immediately
                    showToast(state.language === "ar" ? `تمت إضافة ${prod.name}` : `Added ${prod.name}`, "success");
                } else {
                    showToast(state.language === "ar" ? "المنتج غير مسجل في المخازن!" : "Product not found!", "danger");
                }
            }
        });
    }

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

    // POS Search & Filter auto filter
    addListenerSafe("pos-search-input", "input", renderPOSProducts);

    // POS Barcode Simulator Submit
    addListenerSafe("submit-barcode-sim", "click", () => {
        const productSelect = document.getElementById("barcode-select-product");
        if (productSelect) {
            const prodId = productSelect.value;
            const prod = state.products.find(p => p.id === prodId);
            if (prod) {
                addToCart(prod.id);
                const barcodeModal = document.getElementById("barcode-modal");
                if (barcodeModal) barcodeModal.classList.remove("active");
                showToast(state.language === "ar" ? `تمت إضافة ${prod.name}` : `Added ${prod.name}`, "success");
            }
        }
    });

    // POS Cart Actions
    addListenerSafe("clear-cart-btn", "click", () => {
        clearCart();
        showToast(state.language === "ar" ? "تم تفريغ السلة" : "Cart cleared", "warning");
    });
    addListenerSafe("cart-discount-input", "input", updateCartSummary);
    addListenerSafe("checkout-btn", "click", handleCheckout);

    // Supplier search
    addListenerSafe("supplier-search-input", "input", renderSuppliersTable);

    // Purchase Invoice Payment Method Selection
    addListenerSafe("pur-pay-cash", "click", () => {
        const cashEl = document.getElementById("pur-pay-cash");
        const creditEl = document.getElementById("pur-pay-credit");
        if (cashEl && creditEl) {
            cashEl.classList.add("active");
            creditEl.classList.remove("active");
        }
        const input = document.querySelector('input[name="pur-payment"][value="paid"]');
        if (input) input.checked = true;
    });
    addListenerSafe("pur-pay-credit", "click", () => {
        const cashEl = document.getElementById("pur-pay-cash");
        const creditEl = document.getElementById("pur-pay-credit");
        if (cashEl && creditEl) {
            creditEl.classList.add("active");
            cashEl.classList.remove("active");
        }
        const input = document.querySelector('input[name="pur-payment"][value="credit"]');
        if (input) input.checked = true;
    });

    // Inventory Search & Filters
    addListenerSafe("inventory-search-input", "input", renderInventoryTable);
    addListenerSafe("inventory-category-filter", "change", renderInventoryTable);
    addListenerSafe("inventory-stock-filter", "change", renderInventoryTable);

    // Settings Form Submit
    const settingsForm = document.getElementById("settings-form");
    if (settingsForm) {
        if (document.getElementById('settle-form')) {
            document.getElementById('settle-form').addEventListener('submit', handleSettleFormSubmit);
        }

        // --- User Management Events ---
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                document.getElementById('user-modal-title').textContent = "إضافة مستخدم جديد";
                document.getElementById('user-id').value = "";
                document.getElementById('user-form').reset();
                document.getElementById('user-modal').classList.add('active');
            });
        }
        
        if (document.getElementById('user-form')) {
            document.getElementById('user-form').addEventListener('submit', handleUserFormSubmit);
        }
        
        const usersSearch = document.getElementById('users-search');
        if (usersSearch) {
            usersSearch.addEventListener('input', renderUsers);
        }

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

    // Reports Toolbar button setup
    document.querySelectorAll(".reports-toolbar .btn-outline").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".reports-toolbar .btn-outline").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderReports();
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
    const match = SMART_BARCODE_DATABASE[barcode];
    if (match) {
        document.getElementById("prod-name").value = match.name;
        document.getElementById("prod-category").value = match.category;
        document.getElementById("prod-cost").value = match.cost;
        document.getElementById("prod-price").value = match.price;
        
        barcodeInput.style.borderColor = 'var(--success)';
        barcodeInput.style.boxShadow = '0 0 8px rgba(6, 182, 212, 0.3)';
    } else {
        barcodeInput.style.borderColor = '';
        barcodeInput.style.boxShadow = '';
    }
}
