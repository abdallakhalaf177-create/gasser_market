import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_CUSTOMERS, DEFAULT_SUPPLIERS, DEFAULT_USERS } from './constants.js';

export let state = {
    products: [],
    categories: [],
    customers: [],
    suppliers: [],
    purchaseInvoices: [],
    transactions: [],
    cart: [],
    users: [],
    currentUser: null,
    settings: {
        storeName: "جاسر ماركت",
        currency: "ج.م",
        taxRate: 14,
        lowStockLimit: 10
    },
    currentView: "dashboard",
    language: "ar",
    theme: "dark"
};

let cartChangeListener = null;

export function onCartChange(callback) {
    cartChangeListener = callback;
}

function notifyCartChange() {
    if (cartChangeListener) {
        cartChangeListener();
    }
}

// ✅ تم التعديل: يعتمد الآن على الـ LocalStorage فقط بدون طلبات سيرفر معطلة
export async function loadState() {
    console.log("Loading state locally via LocalStorage...");
    const savedState = localStorage.getItem("supermarket_pro_state");
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            Object.assign(state, parsed);
        } catch (e) {
            console.error("Error parsing saved state, resetting...", e);
            resetToDefault();
        }
    } else {
        resetToDefault();
    }
}

// ✅ تم التعديل: إزالة الـ POST Request الذي يسبب خطأ 405 على GitHub Pages
export async function saveState() {
    localStorage.setItem("supermarket_pro_state", JSON.stringify(state));

    const syncStatus = document.getElementById("sync-status");
    if (syncStatus) {
        syncStatus.classList.add("saving");
        syncStatus.classList.remove("error");
        const syncText = syncStatus.querySelector(".sync-text");
        if (syncText) {
            syncText.textContent = state.language === "ar" ? "جاري الحفظ..." : "Saving...";
        }
    }

    // محاكاة سريعة للنجاح المحلي بدون استدعاء سيرفر
    setTimeout(() => {
        if (syncStatus) {
            syncStatus.classList.remove("saving");
            syncStatus.classList.remove("error");
            const syncText = syncStatus.querySelector(".sync-text");
            if (syncText) {
                syncText.textContent = state.language === "ar" ? "محفوظ محلياً" : "Saved Locally";
            }
        }
    }, 200);
}

export function resetToDefault() {
    state.products = [...DEFAULT_PRODUCTS];
    state.categories = [...DEFAULT_CATEGORIES];
    state.customers = [...DEFAULT_CUSTOMERS];
    state.suppliers = [...DEFAULT_SUPPLIERS];
    state.purchaseInvoices = [];
    state.transactions = [];
    state.cart = [];
    state.users = [...DEFAULT_USERS];
    state.currentUser = null;
    state.settings = {
        storeName: "جاسر ماركت",
        currency: "ج.م",
        taxRate: 14,
        lowStockLimit: 10
    };
    state.currentView = "dashboard";
    state.language = "ar";
    state.theme = "dark";
    saveState();
}

export function addToCart(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    if (prod.stock <= 0) {
        if (window.showToast) {
            window.showToast(state.language === "ar" ? "عذراً، هذا المنتج غير متوفر في المخزن حالياً!" : "Sorry, this product is currently out of stock!", "danger");
        }
        return;
    }

    const cartItem = state.cart.find(item => item.productId === productId);
    if (cartItem) {
        if (cartItem.qty < prod.stock) {
            cartItem.qty++;
        } else {
            if (window.showToast) {
                window.showToast(state.language === "ar" ? "لا يمكن تجاوز الكمية المتاحة في المخزن!" : "Cannot exceed available stock level!", "warning");
            }
        }
    } else {
        state.cart.push({ productId, qty: 1, price: prod.price });
    }
    saveState();
    notifyCartChange();
}

export function updateCartQty(productId, delta) {
    const cartItem = state.cart.find(item => item.productId === productId);
    if (!cartItem) return;

    const prod = state.products.find(p => p.id === productId);
    if (delta > 0 && cartItem.qty >= prod.stock) {
        if (window.showToast) {
            window.showToast(state.language === "ar" ? "لا يمكن تجاوز الكمية المتاحة في المخزن!" : "Cannot exceed available stock level!", "warning");
        }
        return;
    }

    cartItem.qty += delta;
    if (cartItem.qty <= 0) {
        state.cart = state.cart.filter(item => item.productId !== productId);
    }
    saveState();
    notifyCartChange();
}

export function clearCart() {
    state.cart = [];
    saveState();
    notifyCartChange();
}

export function cancelTransaction(transactionId) {
    const t = state.transactions.find(x => x.id === transactionId);
    if (!t) return;

    if (t.status === "cancelled") {
        if (window.showToast) {
            window.showToast(state.language === "ar" ? "هذه المعاملة ملغاة بالفعل!" : "This transaction is already cancelled!", "warning");
        }
        return;
    }

    const confirmMsg = state.language === "ar"
        ? `هل أنت متأكد من إلغاء عملية البيع #${transactionId}؟ سيتم إرجاع المنتجات إلى المخزن وخصم النقاط.`
        : `Are you sure you want to cancel sale #${transactionId}? Items will be returned to stock and loyalty points deducted.`;

    if (!confirm(confirmMsg)) return;

    t.status = "cancelled";

    t.items.forEach(item => {
        const prod = state.products.find(p => p.id === item.productId);
        if (prod) {
            prod.stock += item.qty;
        }
    });

    if (t.customerId !== "walkin") {
        const customer = state.customers.find(c => c.id === t.customerId);
        if (customer) {
            const pointsToDeduct = Math.floor(t.total / 10);
            customer.points = Math.max(0, customer.points - pointsToDeduct);
            customer.totalSpent = Math.max(0, customer.totalSpent - t.total);
            customer.visits = Math.max(0, customer.visits - 1);
        }
    }

    saveState();

    if (window.showToast) {
        window.showToast(state.language === "ar" ? `تم إلغاء الفاتورة #${transactionId} بنجاح` : `Invoice #${transactionId} cancelled successfully`, "success");
    }

    if (window.refreshCurrentView) {
        window.refreshCurrentView();
    }
}