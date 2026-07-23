import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_CUSTOMERS, DEFAULT_SUPPLIERS, DEFAULT_USERS } from './constants.js';

export let state = {
    products: [],
    categories: [],
    customers: [],
    suppliers: [],
    purchaseInvoices: [],
    transactions: [],
    cart: [],
    settings: { storeName: "Gaser Market", currency: "ج.م", taxRate: 14, lowStockLimit: 10 },
    currentView: "pos",
    language: "ar",
    theme: "dark",
    users: [],
    currentUser: null
};

let cartChangeListener = null;
export function onCartChange(cb) { 
    cartChangeListener = cb; 
}

export function notifyCartChange() { 
    if (cartChangeListener) cartChangeListener(); 
}

export async function loadState() {
    const saved = localStorage.getItem("supermarket_pro_state");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
            if (!state.settings.storeName || state.settings.storeName === "جاسر ماركت" || state.settings.storeName === "سوپر ماركت") {
                state.settings.storeName = "Gaser Market";
            }
        } catch (e) {
            resetToDefault();
        }
    } else {
        resetToDefault();
    }
    
    // Ensure default users exist
    if (!state.users || state.users.length === 0) {
        state.users = [...DEFAULT_USERS];
    }
}

export function saveState() {
    localStorage.setItem("supermarket_pro_state", JSON.stringify(state));
    const syncStatus = document.getElementById("sync-status");
    if (syncStatus) {
        syncStatus.classList.remove("saving", "error");
        const syncText = syncStatus.querySelector(".sync-text");
        if (syncText) syncText.textContent = state.language === "ar" ? "محفوظ" : "Saved";
    }
}

export function resetToDefault() {
    state.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    state.categories = [...DEFAULT_CATEGORIES];
    state.customers = JSON.parse(JSON.stringify(DEFAULT_CUSTOMERS));
    state.suppliers = JSON.parse(JSON.stringify(DEFAULT_SUPPLIERS));
    state.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
    state.purchaseInvoices = [];
    state.transactions = [];
    state.cart = [];
    state.settings = { storeName: "Gaser Market", currency: "ج.م", taxRate: 14, lowStockLimit: 10 };
    state.currentView = "pos";
    state.language = "ar";
    state.theme = "dark";
    saveState();
}

export function addToCart(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;
    if (prod.stock <= 0) { 
        if (window.showToast) window.showToast(state.language === "ar" ? "عذراً، هذا المنتج غير متوفر في المخزن حالياً!" : "Sorry, this product is out of stock!", "danger"); 
        return; 
    }
    const cartItem = state.cart.find(item => item.productId === productId);
    if (cartItem) {
        if (cartItem.qty < prod.stock) { 
            cartItem.qty++; 
        } else { 
            if (window.showToast) window.showToast(state.language === "ar" ? "لا يمكن تجاوز الكمية المتاحة في المخزن!" : "Cannot exceed available stock!", "warning"); 
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
        if (window.showToast) window.showToast(state.language === "ar" ? "لا يمكن تجاوز الكمية المتاحة في المخزن!" : "Cannot exceed available stock!", "warning"); 
        return; 
    }
    cartItem.qty += delta;
    if (cartItem.qty <= 0) state.cart = state.cart.filter(item => item.productId !== productId);
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
        if (window.showToast) window.showToast(state.language === "ar" ? "هذه المعاملة ملغاة بالفعل!" : "Transaction already cancelled!", "warning"); 
        return; 
    }
    const msg = state.language === "ar" ? `هل أنت متأكد من إلغاء الفاتورة #${transactionId}؟ سيتم إرجاع المنتجات للمخزن.` : `Cancel sale #${transactionId}? Stock will be restored.`;
    if (!confirm(msg)) return;
    t.status = "cancelled";
    t.items.forEach(item => { 
        const prod = state.products.find(p => p.id === item.productId); 
        if (prod) prod.stock += item.qty; 
    });
    if (t.customerId !== "walkin") {
        const customer = state.customers.find(c => c.id === t.customerId);
        if (customer) {
            customer.points = Math.max(0, customer.points - Math.floor(t.total / 10));
            customer.totalSpent = Math.max(0, customer.totalSpent - t.total);
            customer.visits = Math.max(0, customer.visits - 1);
        }
    }
    saveState();
    if (window.showToast) window.showToast(state.language === "ar" ? `تم إلغاء الفاتورة #${transactionId} بنجاح` : `Invoice #${transactionId} cancelled`, "success");
    if (window.refreshCurrentView) window.refreshCurrentView();
}