// ============================================================
// GASSER MARKET SYSTEM - CONSOLIDATED SINGLE-FILE APPLICATION (app-bundle.js)
// Complete logic for POS, Inventory, Purchases, Expenses, Waste, Shifts, Customers, Suppliers, Reports & Auth
// ============================================================

// ======================== CONSTANTS & DEFAULT DATA ========================
const DEFAULT_CATEGORIES = [
    "ألبان (Dairy)", "مخبوزات (Bakery)", "مشروبات (Beverages)",
    "معلبات (Canned)", "تسالي (Snacks)", "منظفات (Household)",
    "خضار وفاكهة (Produce)", "التدخين ومستلزماته (Smoking)",
    "لحوم ودواجن (Meat)", "بقوليات وعطارة (Grains)"
];

const DEFAULT_PRODUCTS = [
    { id: "1",  barcode: "62210001", name: "حليب جهينة كامل الدسم 1 لتر",          category: "ألبان (Dairy)",    cost: 32.00,  price: 38.00,  stock: 45,  expiry: "2026-09-15", image: "", supplier: "شركة جهينة للصناعات الغذائية" },
    { id: "2",  barcode: "62210002", name: "جبنة عبور لاند فيتا 500ج",             category: "ألبان (Dairy)",    cost: 28.00,  price: 34.00,  stock: 8,   expiry: "2026-12-01", image: "", supplier: "شركة جهينة للصناعات الغذائية" },
    { id: "3",  barcode: "62210003", name: "خبز توست ريتش بيك",                  category: "مخبوزات (Bakery)",  cost: 25.00,  price: 30.00,  stock: 15,  expiry: "2026-07-20", image: "", supplier: "الشركة المصرية للأغذية (بسكو مصر)" },
    { id: "4",  barcode: "62210004", name: "بيبسي كانز 330 مل",                   category: "مشروبات (Beverages)", cost: 9.50,   price: 12.00,  stock: 120, expiry: "2027-01-10", image: "", supplier: "" },
    { id: "5",  barcode: "62210005", name: "مياه معدنية نستله 1.5 لتر",           category: "مشروبات (Beverages)", cost: 6.00,   price: 8.00,   stock: 200, expiry: "2027-06-01", image: "", supplier: "" },
    { id: "6",  barcode: "62210006", name: "تونة صن شاين قطع 185ج",               category: "معلبات (Canned)",   cost: 45.00,  price: 55.00,  stock: 30,  expiry: "2028-03-15", image: "", supplier: "" },
    { id: "7",  barcode: "62210007", name: "شيبسي عائلي ملح 100ج",                  category: "تسالي (Snacks)",    cost: 8.00,   price: 10.00,  stock: 4,   expiry: "2026-11-30", image: "", supplier: "" },
    { id: "8",  barcode: "62210008", name: "مسحوق غسيل أريال 2.5 كجم",              category: "منظفات (Household)",cost: 180.00, price: 210.00, stock: 12,  expiry: "",           image: "", supplier: "" },
    { id: "9",  barcode: "62210009", name: "ولاعة دولفين معدنية قابلة للشحن",    category: "التدخين ومستلزماته (Smoking)", cost: 15.00, price: 25.00, stock: 50, expiry: "", image: "", supplier: "" },
    { id: "10", barcode: "62210010", name: "علبة كبريت سوبر 10 علب",                category: "التدخين ومستلزماته (Smoking)", cost: 4.00, price: 6.00, stock: 150, expiry: "", image: "", supplier: "" },
    { id: "11", barcode: "62210081", name: "موز بلدي طازج 1 كجم",                  category: "خضار وفاكهة (Produce)", cost: 18.00, price: 22.00, stock: 40, expiry: "2026-07-16", image: "", supplier: "" },
    { id: "12", barcode: "62210082", name: "طماطم بلدي طازجة 1 كجم",                category: "خضار وفاكهة (Produce)", cost: 10.00, price: 14.00, stock: 65, expiry: "2026-07-18", image: "", supplier: "" },
    { id: "13", barcode: "62210092", name: "بانيه دجاج كوكي عادي 1 كجم",          category: "لحوم ودواجن (Meat)",   cost: 195.00, price: 230.00, stock: 20, expiry: "2026-10-05", image: "", supplier: "" },
    { id: "14", barcode: "62210101", name: "أرز فاخر الضحى 1 كجم",                  category: "بقوليات وعطارة (Grains)", cost: 29.00, price: 35.00, stock: 80, expiry: "2027-04-12", image: "", supplier: "" },
    { id: "15", barcode: "62210102", name: "مكرونة ريجينا بنة 400 جرام",            category: "بقوليات وعطارة (Grains)", cost: 18.00, price: 22.00, stock: 100, expiry: "2027-08-20", image: "", supplier: "" }
];

const DEFAULT_CUSTOMERS = [
    { id: "c1", name: "أحمد محمد", phone: "01012345678", points: 150, balance: 0, totalSpent: 1250.00, visits: 8, registered: "2026-05-10" },
    { id: "c2", name: "سارة أحمد", phone: "01234567890", points: 45, balance: 0, totalSpent: 420.00, visits: 3, registered: "2026-06-18" }
];

const DEFAULT_SUPPLIERS = [
    { id: "s1", company: "شركة جهينة للصناعات الغذائية", name: "م. عصام رأفت", phone: "0238204222", balance: 12500.00, totalPurchases: 45000.00, lastUpdated: "2026-07-10" },
    { id: "s2", company: "الشركة المصرية للأغذية (بسكو مصر)", name: "أ. محمد سليم", phone: "19234", balance: 0.00, totalPurchases: 18400.00, lastUpdated: "2026-07-08" }
];

const DEFAULT_USERS = [
    { id: "u1", name: "مدير النظام العام", username: "admin", role: "admin" },
    { id: "u2", name: "أحمد محمود (كاشير)", username: "cashier", role: "cashier" }
];

const SMART_BARCODE_DATABASE = {
    "62210001": { name: "حليب جهينة كامل الدسم 1 لتر", category: "ألبان (Dairy)", cost: 32.00, price: 38.00 },
    "62210002": { name: "جبنة عبور لاند فيتا 500ج", category: "ألبان (Dairy)", cost: 28.00, price: 34.00 },
    "62210021": { name: "زبادي جهينة 105 جرام", category: "ألبان (Dairy)", cost: 6.00, price: 8.00 },
    "62210022": { name: "جبنة بريزيدن مثلثات 8 قطع", category: "ألبان (Dairy)", cost: 35.00, price: 42.00 },
    "62210023": { name: "سمن كريستال أصفر 700ج", category: "ألبان (Dairy)", cost: 70.00, price: 85.00 },
    "62210003": { name: "خبز توست ريتش بيك", category: "مخبوزات (Bakery)", cost: 25.00, price: 30.00 },
    "62210031": { name: "خبز فينو ريتش بيك 5 قطع", category: "مخبوزات (Bakery)", cost: 12.00, price: 15.00 },
    "62210032": { name: "مولتو كرواسون شوكولاتة عائلي", category: "مخبوزات (Bakery)", cost: 8.00, price: 10.00 },
    "62210004": { name: "بيبسي كانز 330 مل", category: "مشروبات (Beverages)", cost: 9.50, price: 12.00 },
    "62210005": { name: "مياه معدنية نستله 1.5 لتر", category: "مشروبات (Beverages)", cost: 6.00, price: 8.00 },
    "62230014": { name: "كوكاكولا 1 لتر بلاستيك", category: "مشروبات (Beverages)", cost: 16.00, price: 20.00 },
    "62230015": { name: "شويبس خوخ جولد كانز", category: "مشروبات (Beverages)", cost: 13.00, price: 16.00 },
    "62240011": { name: "شاي ليبتون 100 فتلة عبوة", category: "مشروبات (Beverages)", cost: 60.00, price: 75.00 },
    "62240012": { name: "نسكافيه كلاسيك 100 جرام", category: "مشروبات (Beverages)", cost: 110.00, price: 130.00 },
    "62210006": { name: "تونة صن شاين قطع 185ج", category: "معلبات (Canned)", cost: 45.00, price: 55.00 },
    "62210051": { name: "كاتشب هاينز عبوة 340 جرام", category: "معلبات (Canned)", cost: 28.00, price: 35.00 },
    "62210052": { name: "فول مدمس أمريكانا 400 جرام", category: "معلبات (Canned)", cost: 12.00, price: 16.00 },
    "62210053": { name: "صلصة طماطم هاينز 360 جرام", category: "معلبات (Canned)", cost: 24.00, price: 30.00 },
    "62210007": { name: "شيبسي عائلي ملح 100ج", category: "تسالي (Snacks)", cost: 8.00, price: 10.00 },
    "62210041": { name: "شوكولاتة كادبوري ديري ميلك", category: "تسالي (Snacks)", cost: 22.00, price: 28.00 },
    "62210042": { name: "بسكويت أوريو الأصلي 6 قطع", category: "تسالي (Snacks)", cost: 6.50, price: 8.00 },
    "62210043": { name: "دوريتوس فلفل حلو جامبو", category: "تسالي (Snacks)", cost: 8.00, price: 10.00 },
    "62210008": { name: "مسحوق غسيل أريال 2.5 كجم", category: "منظفات (Household)", cost: 180.00, price: 210.00 },
    "62210061": { name: "صابون سائل فيري 1 لتر", category: "منظفات (Household)", cost: 48.00, price: 58.00 },
    "62210062": { name: "مطهر ديتول الأصلي 500 مل", category: "منظفات (Household)", cost: 120.00, price: 145.00 },
    "62210063": { name: "صابون لوكس وردي 120 جرام", category: "منظفات (Household)", cost: 12.00, price: 16.00 },
    "62210009": { name: "ولاعة دولفين معدنية قابلة للشحن", category: "التدخين ومستلزماته (Smoking)", cost: 15.00, price: 25.00 },
    "62210010": { name: "علبة كبريت سوبر 10 علب", category: "التدخين ومستلزماته (Smoking)", cost: 4.00, price: 6.00 },
    "62210071": { name: "سجائر مارلبورو أحمر عبوة", category: "التدخين ومستلزماته (Smoking)", cost: 72.00, price: 85.00 },
    "62210072": { name: "سجائر إل إم أزرق عبوة", category: "التدخين ومستلزماته (Smoking)", cost: 54.00, price: 62.00 },
    "62210073": { name: "سجائر كليوباترا بوكس عبوة", category: "التدخين ومستلزماته (Smoking)", cost: 30.00, price: 35.00 },
    "62210081": { name: "موز بلدي طازج 1 كجم", category: "خضار وفاكهة (Produce)", cost: 18.00, price: 22.00 },
    "62210082": { name: "طماطم بلدي طازجة 1 كجم", category: "خضار وفاكهة (Produce)", cost: 10.00, price: 14.00 },
    "62210083": { name: "تفاح أصفر مستورد 1 كجم", category: "خضار وفاكهة (Produce)", cost: 60.00, price: 75.00 },
    "62210091": { name: "فرانك بقري حلواني 400 جرام", category: "لحوم ودواجن (Meat)", cost: 85.00, price: 105.00 },
    "62210092": { name: "بانيه دجاج كوكي عادي 1 كجم", category: "لحوم ودواجن (Meat)", cost: 195.00, price: 230.00 },
    "62210093": { name: "برجر بقري أمريكانا 8 قطع", category: "لحوم ودواجن (Meat)", cost: 90.00, price: 115.00 },
    "62210101": { name: "أرز فاخر الضحى 1 كجم", category: "بقوليات وعطارة (Grains)", cost: 29.00, price: 35.00 },
    "62210102": { name: "مكرونة ريجينا بنة 400 جرام", category: "بقوليات وعطارة (Grains)", cost: 18.00, price: 22.00 },
    "62210103": { name: "عدس أصفر الضحى 500 جرام", category: "بقوليات وعطارة (Grains)", cost: 35.00, price: 42.00 }
};

const translations = {
    ar: {
        dashboard: "لوحة التحكم", pos: "الكاشير (POS)", inventory: "إدارة المخزن",
        purchases: "المشتريات والتوريد", expenses: "المصروفات التشغيلية", waste: "الهالك والتوالف",
        reports: "التقارير والربح", customers: "العملاء والديون", suppliers: "الموردين والشركات",
        settings: "الإعدادات العامة", users: "إدارة المستخدمين",
        searchPlaceholder: "ابحث باسم المنتج أو امسح الباركود للإضافة الفورية للمبيعات..."
    },
    en: {
        dashboard: "Dashboard", pos: "Cashier (POS)", inventory: "Inventory",
        purchases: "Purchases", expenses: "Expenses", waste: "Waste Management",
        reports: "Reports & Profit", customers: "Customers & Debt", suppliers: "Suppliers & Accounts",
        settings: "Settings", users: "User Management",
        searchPlaceholder: "Search product name or scan barcode..."
    }
};

// ======================== GLOBAL STATE ========================
let state = {
    products: [],
    categories: [],
    customers: [],
    suppliers: [],
    purchaseInvoices: [],
    transactions: [],
    cart: [],
    shifts: [],
    expenses: [],
    wastes: [],
    customerPayments: [],
    supplierPayments: [],
    currentShift: null,
    settings: { storeName: "Gaser Market", currency: "ج.م", taxRate: 14, lowStockLimit: 10 },
    currentView: "pos",
    language: "ar",
    theme: "dark",
    users: [],
    currentUser: null
};

let cartChangeListener = null;
function onCartChange(cb) { cartChangeListener = cb; }
function notifyCartChange() { if (cartChangeListener) cartChangeListener(); }

function loadState() {
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

    // Ensure default arrays and properties exist
    if (!state.users || state.users.length === 0) state.users = [...DEFAULT_USERS];
    if (!state.shifts) state.shifts = [];
    if (!state.expenses) state.expenses = [];
    if (!state.wastes) state.wastes = [];
    if (!state.customerPayments) state.customerPayments = [];
    if (!state.supplierPayments) state.supplierPayments = [];
    if (state.customers && Array.isArray(state.customers)) {
        state.customers.forEach(c => { if (c.balance === undefined) c.balance = 0; });
    }
}

function saveState() {
    localStorage.setItem("supermarket_pro_state", JSON.stringify(state));
    const syncStatus = document.getElementById("sync-status");
    if (syncStatus) {
        syncStatus.classList.remove("saving", "error");
        const syncText = syncStatus.querySelector(".sync-text");
        if (syncText) syncText.textContent = state.language === "ar" ? "محفوظ" : "Saved";
    }
}

function resetToDefault() {
    state.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    state.categories = [...DEFAULT_CATEGORIES];
    state.customers = JSON.parse(JSON.stringify(DEFAULT_CUSTOMERS)).map(c => ({ ...c, balance: 0 }));
    state.suppliers = JSON.parse(JSON.stringify(DEFAULT_SUPPLIERS));
    state.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
    state.purchaseInvoices = [];
    state.transactions = [];
    state.cart = [];
    state.shifts = [];
    state.expenses = [];
    state.wastes = [];
    state.customerPayments = [];
    state.supplierPayments = [];
    state.currentShift = null;
    state.settings = { storeName: "Gaser Market", currency: "ج.م", taxRate: 14, lowStockLimit: 10 };
    state.currentView = "pos";
    state.language = "ar";
    state.theme = "dark";
    saveState();
}

// ======================== CART & POS OPERATIONS ========================
function addToCart(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;
    if (prod.stock <= 0) {
        showToast(state.language === "ar" ? "عذراً، هذا المنتج غير متوفر في المخزن حالياً!" : "Sorry, this product is out of stock!", "danger");
        return;
    }
    const cartItem = state.cart.find(item => item.productId === productId);
    if (cartItem) {
        if (cartItem.qty < prod.stock) {
            cartItem.qty++;
        } else {
            showToast(state.language === "ar" ? "لا يمكن تجاوز الكمية المتاحة في المخزن!" : "Cannot exceed available stock!", "warning");
        }
    } else {
        state.cart.push({ productId, qty: 1, price: prod.price, cost: prod.cost || 0 });
    }
    saveState();
    notifyCartChange();
}

function updateCartQty(productId, delta) {
    const cartItem = state.cart.find(item => item.productId === productId);
    if (!cartItem) return;
    const prod = state.products.find(p => p.id === productId);
    if (delta > 0 && cartItem.qty >= prod.stock) {
        showToast(state.language === "ar" ? "لا يمكن تجاوز الكمية المتاحة في المخزن!" : "Cannot exceed available stock!", "warning");
        return;
    }
    cartItem.qty += delta;
    if (cartItem.qty <= 0) state.cart = state.cart.filter(item => item.productId !== productId);
    saveState();
    notifyCartChange();
}

function clearCart() {
    state.cart = [];
    saveState();
    notifyCartChange();
}

function cancelTransaction(transactionId) {
    const t = state.transactions.find(x => x.id === transactionId);
    if (!t) return;
    if (t.status === "cancelled") {
        showToast(state.language === "ar" ? "هذه المعاملة ملغاة بالفعل!" : "Transaction already cancelled!", "warning");
        return;
    }
    const msg = state.language === "ar"
        ? `هل أنت متأكد من إلغاء الفاتورة #${transactionId}؟ سيتم إرجاع المنتجات للمخزن.`
        : `Cancel sale #${transactionId}? Stock will be restored.`;
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
            if (t.paymentMethod === "credit") {
                customer.balance = Math.max(0, (customer.balance || 0) - t.total);
            }
        }
    }
    saveState();
    showToast(state.language === "ar" ? `تم إلغاء الفاتورة #${transactionId} بنجاح` : `Invoice #${transactionId} cancelled`, "success");
    refreshCurrentView();
}

// ======================== AUDIO & TOAST HELPERS ========================
function playBeep(frequency = 440, duration = 0.1) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
    } catch (e) {}
}

function showToast(message, type = 'info') {
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
}

// ======================== DASHBOARD MODULE ========================
let salesChartInstance = null;
let categoriesChartInstance = null;

function renderDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const transactions = state.transactions || [];
    const products = state.products || [];

    const todaySales = transactions.filter(t => t.date && t.date.startsWith(today) && t.status !== "cancelled").reduce((sum, t) => sum + (t.total || 0), 0);
    const todayOrders = transactions.filter(t => t.date && t.date.startsWith(today) && t.status !== "cancelled").length;
    const lowStockCount = products.filter(p => Number(p.stock) <= (state.settings.lowStockLimit || 10)).length;
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
        const lowProds = products.filter(p => Number(p.stock) <= (state.settings.lowStockLimit || 10));
        if (lowProds.length === 0) {
            lowStockList.innerHTML = `<div class="empty-state"><i data-lucide="check-circle" style="color:var(--success)"></i><p>${state.language === "ar" ? "جميع المنتجات متوفرة بمخزون جيد!" : "All products are well stocked!"}</p></div>`;
        } else {
            lowProds.slice(0, 5).forEach(p => {
                const item = document.createElement("div");
                item.className = "alert-item";
                item.innerHTML = `<div class="alert-item-info"><span class="alert-item-title">${p.name}</span><span class="alert-item-desc">${state.language === "ar" ? "الكمية المتبقية:" : "Stock left:"} ${p.stock} | ${p.barcode}</span></div><span class="badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}">${p.stock === 0 ? (state.language === "ar" ? "نفذ" : "Out") : (state.language === "ar" ? "منخفض" : "Low")}</span>`;
                item.addEventListener("click", () => openPurchaseModal());
                lowStockList.appendChild(item);
            });
        }
    }

    const recentSalesBody = document.getElementById("dashboard-recent-sales");
    if (recentSalesBody) {
        recentSalesBody.innerHTML = "";
        const recentSales = transactions.slice(-5).reverse();
        if (recentSales.length === 0) {
            recentSalesBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">${state.language === "ar" ? "لا توجد عمليات بيع اليوم" : "No sales transactions today"}</td></tr>`;
        } else {
            recentSales.forEach(t => {
                const row = document.createElement("tr");
                const custName = t.customerId === "walkin" ? (state.language === "ar" ? "عميل سفري" : "Walk-in") : ((state.customers || []).find(c => c.id === t.customerId)?.name || t.customerId);
                const isCancelled = t.status === "cancelled";
                row.innerHTML = `
                    <td><strong>#${t.id}</strong></td>
                    <td>${t.date ? t.date.replace('T', ' ').substring(0, 16) : '-'}</td>
                    <td>${custName}</td>
                    <td>${(t.items || []).reduce((s, i) => s + (i.qty || 0), 0)}</td>
                    <td><strong ${isCancelled ? 'style="text-decoration:line-through;opacity:0.6"' : 'class="text-success"'}>${(t.total || 0).toFixed(2)} ${state.settings.currency}</strong></td>
                    <td><span class="badge badge-info">${state.language === "ar" ? (t.paymentMethod === "cash" ? "نقدي" : t.paymentMethod === "card" ? "بطاقة" : "آجل") : t.paymentMethod}</span></td>
                    <td>${isCancelled ? `<span class="badge badge-danger">${state.language === "ar" ? "ملغاة" : "Cancelled"}</span>` : `<span class="badge badge-success">${state.language === "ar" ? "مكتملة" : "Completed"}</span>`}</td>
                    <td><div style="display:flex;gap:4px">
                        <button class="btn btn-secondary btn-sm" onclick="viewReceipt('${t.id}')" title="عرض"><i data-lucide="eye" style="width:14px;height:14px"></i></button>
                        ${!isCancelled ? `<button class="btn btn-danger btn-sm" onclick="cancelTransaction('${t.id}')" title="إلغاء"><i data-lucide="x" style="width:14px;height:14px"></i></button>` : ""}
                    </div></td>`;
                recentSalesBody.appendChild(row);
            });
        }
    }

    renderDashboardCharts();
    if (window.lucide) lucide.createIcons();
}

function renderDashboardCharts() {
    if (salesChartInstance) salesChartInstance.destroy();
    if (categoriesChartInstance) categoriesChartInstance.destroy();
    const ctxSales = document.getElementById('salesChart');
    const ctxCats = document.getElementById('categoriesChart');
    if (!ctxSales || !ctxCats || typeof Chart === 'undefined') return;

    const days = state.language === "ar" ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesData = [0, 0, 0, 0, 0, 0, 0];
    (state.transactions || []).forEach(t => { if (t.status !== "cancelled" && t.date) { const idx = new Date(t.date).getDay(); salesData[idx] += (t.total || 0); } });
    const todayIdx = new Date().getDay();
    const orderedDays = [], orderedSales = [];
    for (let i = 0; i < 7; i++) { const idx = (todayIdx + 1 + i) % 7; orderedDays.push(days[idx]); orderedSales.push(salesData[idx]); }
    const isDark = state.theme === "dark";
    const gridColor = isDark ? '#273150' : '#cbd5e1';
    const textColor = isDark ? '#64748b' : '#475569';

    salesChartInstance = new Chart(ctxSales, {
        type: 'line',
        data: { labels: orderedDays, datasets: [{ label: state.language === "ar" ? "المبيعات اليومية" : "Daily Sales", data: orderedSales, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', borderWidth: 3, fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: gridColor }, ticks: { color: textColor } }, y: { grid: { color: gridColor }, ticks: { color: textColor } } } }
    });

    const catSales = {};
    (state.categories || []).forEach(c => catSales[c] = 0);
    (state.transactions || []).forEach(t => {
        if (t.status !== "cancelled" && Array.isArray(t.items)) {
            t.items.forEach(item => {
                const prod = (state.products || []).find(p => p.id === item.productId);
                if (prod && catSales[prod.category] !== undefined) catSales[prod.category] += (item.price || 0) * (item.qty || 0);
            });
        }
    });
    const catLabels = Object.keys(catSales).map(c => c.split(' ')[0]);
    const catData = Object.values(catSales);
    categoriesChartInstance = new Chart(ctxCats, {
        type: 'doughnut',
        data: { labels: catLabels, datasets: [{ data: catData.every(v => v === 0) ? catData.map(() => 1) : catData, backgroundColor: ['#6366f1', '#06b6d4', '#8b5cf6', '#f43f5e', '#f59e0b', '#3b82f6', '#10b981'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: textColor, boxWidth: 12, font: { size: 10 } } } } }
    });
}

// ======================== POS & CASHIER MODULE ========================
function renderPOS() {
    renderPOSCustomerDropdown();
    renderCart();

    const shiftBadge = document.getElementById("pos-shift-status");
    const headerShiftCashier = document.getElementById("header-shift-cashier");
    const headerShiftBadge = document.getElementById("header-shift-badge");
    const isActive = state.currentShift && state.currentShift.status === "active";
    if (shiftBadge) {
        if (isActive) {
            shiftBadge.innerHTML = `<i class="ri-time-line"></i> وردية مفتوحة — الكاشير: ${state.currentShift.cashierName || 'الكاشير'}`;
            shiftBadge.className = "shift-badge shift-open";
        } else {
            shiftBadge.innerHTML = `<i class="ri-lock-line"></i> وردية مغلقة — اضغط لفتح وردية جديدة`;
            shiftBadge.className = "shift-badge shift-closed";
        }
        shiftBadge.onclick = () => openShiftModal();
    }
    if (headerShiftCashier) {
        const cashierName = state.currentUser ? (state.currentUser.name || state.currentUser.username) : (state.currentShift ? (state.currentShift.cashierName || 'أدمن') : 'أدمن');
        headerShiftCashier.textContent = `الكاشير: ${cashierName}`;
    }
    if (headerShiftBadge) {
        headerShiftBadge.style.borderColor = isActive ? "var(--success)" : "var(--warning)";
        headerShiftBadge.style.background = isActive ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)";
        headerShiftBadge.style.color = isActive ? "var(--success)" : "var(--warning)";
    }

    const posSearch = document.getElementById("barcode-input");
    if (posSearch && !posSearch.dataset.listenerAttached) {
        posSearch.dataset.listenerAttached = "true";
        posSearch.addEventListener("input", (e) => showSearchSuggestions(e.target.value));
        posSearch.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const val = posSearch.value.trim();
                if (!val) return;
                const byBarcode = (state.products || []).find(p => p.barcode === val);
                if (byBarcode) {
                    addToCart(byBarcode.id);
                    posSearch.value = "";
                    const sug = document.getElementById("search-suggestions");
                    if (sug) sug.style.display = "none";
                    renderCart();
                    showToast(`تم إضافة "${byBarcode.name}" للسلة`, "success");
                } else {
                    showSearchSuggestions(val);
                }
            }
        });
    }
}

function showSearchSuggestions(query) {
    const container = document.getElementById("search-suggestions");
    if (!container) return;
    if (!query || query.length < 1) { container.style.display = "none"; return; }

    const q = query.toLowerCase();
    const matches = (state.products || []).filter(p =>
        p.stock > 0 && (
            (p.name || "").toLowerCase().includes(q) ||
            (p.barcode || "").includes(q) ||
            (p.category || "").toLowerCase().includes(q)
        )
    ).slice(0, 8);

    if (matches.length === 0) {
        container.innerHTML = `<div style="padding:12px;color:var(--text-muted);text-align:center;">لا توجد منتجات مطابقة</div>`;
        container.style.display = "block";
        return;
    }

    container.innerHTML = "";
    matches.forEach(p => {
        const itemEl = document.createElement("div");
        itemEl.className = "suggestion-item";
        itemEl.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border-color);transition:background 0.15s;";
        itemEl.innerHTML = `
            <div>
                <strong>${p.name}</strong>
                <span style="font-size:12px;color:var(--text-muted);margin-right:8px;">${p.barcode}</span>
            </div>
            <div style="text-align:left;">
                <strong style="color:var(--success);">${p.price.toFixed(2)} ${state.settings.currency}</strong>
                <span style="font-size:11px;color:var(--text-muted);display:block;">متاح: ${p.stock}</span>
            </div>
        `;
        itemEl.addEventListener("mouseenter", () => itemEl.style.background = "var(--bg-hover)");
        itemEl.addEventListener("mouseleave", () => itemEl.style.background = "");
        itemEl.addEventListener("click", () => {
            addToCart(p.id);
            const input = document.getElementById("barcode-input");
            if (input) input.value = "";
            container.style.display = "none";
            renderCart();
            playBeep(880, 0.08);
        });
        container.appendChild(itemEl);
    });

    container.style.display = "block";
}

function renderPOSCategoryDropdowns() {
    const prodCatSelect = document.getElementById("prod-category");
    if (prodCatSelect) {
        prodCatSelect.innerHTML = (state.categories || []).map(c => `<option value="${c}">${c}</option>`).join('');
    }
    const invCatFilter = document.getElementById("inventory-category-filter");
    if (invCatFilter) {
        const currentVal = invCatFilter.value;
        invCatFilter.innerHTML = `<option value="all">${state.language === "ar" ? "كل الفئات" : "All Categories"}</option>` +
            (state.categories || []).map(c => `<option value="${c}">${c}</option>`).join('');
        invCatFilter.value = currentVal;
    }
}

function renderPOSCustomerDropdown() {
    const select = document.getElementById("cart-customer-select");
    const checkoutSelect = document.getElementById("checkout-customer-select");

    const optionsHtml =
        `<option value="walkin">${state.language === "ar" ? "عميل سفري (نقدي)" : "Walk-in Customer (Cash)"}</option>` +
        (state.customers || []).map(c =>
            `<option value="${c.id}">${c.name} (${c.phone || 'بدون هاتف'})${c.balance > 0 ? ` — دين: ${c.balance.toFixed(2)}` : ''}</option>`
        ).join('');

    if (select) {
        const currentVal = select.value || "walkin";
        select.innerHTML = optionsHtml;
        if ([...select.options].some(o => o.value === currentVal)) select.value = currentVal;
    }
    if (checkoutSelect) {
        const currentVal = checkoutSelect.value || "walkin";
        checkoutSelect.innerHTML = optionsHtml;
        if ([...checkoutSelect.options].some(o => o.value === currentVal)) checkoutSelect.value = currentVal;
    }
}

function openCheckoutModal() {
    if (!state.currentShift || state.currentShift.status !== "active") {
        showToast(
            state.language === "ar"
                ? "🔒 الوردية مغلقة حالياً! يرجى فتح وردية جديدة للبدء في عمليات البيع."
                : "Shift is closed! Please open a new shift to process sales.",
            "danger"
        );
        openShiftModal();
        return;
    }

    if (!state.cart || state.cart.length === 0) {
        showToast(state.language === "ar" ? "السلة فارغة!" : "Cart is empty!", "warning");
        return;
    }

    renderPOSCustomerDropdown();

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

    const totalEl = document.getElementById("checkout-total-display");
    if (totalEl) totalEl.textContent = `${finalTotal.toFixed(2)} ${state.settings.currency || 'ج.م'}`;

    const paidInput = document.getElementById("paid-amount-input");
    if (paidInput) paidInput.value = "";

    updateCheckoutChangeDisplay(finalTotal);

    const modal = document.getElementById("checkout-modal");
    if (modal) modal.classList.add("active");

    setTimeout(() => {
        const confirmBtn = document.getElementById("confirm-checkout-btn");
        if (confirmBtn) {
            confirmBtn.focus();
            confirmBtn.classList.add("auto-focused");
        }
    }, 150);
}

function updateCheckoutChangeDisplay(overrideTotal) {
    let finalTotal = overrideTotal;
    if (finalTotal === undefined) {
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
        finalTotal = taxableAmount + taxAmount;
    }

    const paidInput = document.getElementById("paid-amount-input");
    const changeDisplay = document.getElementById("change-amount-display");
    if (!paidInput || !changeDisplay) return;

    const paidVal = parseFloat(paidInput.value);
    if (isNaN(paidVal) || paidVal === 0) {
        changeDisplay.textContent = `0.00 ${state.settings.currency || 'ج.م'}`;
        changeDisplay.style.color = "var(--text-muted)";
        return;
    }

    const change = paidVal - finalTotal;
    changeDisplay.textContent = `${change.toFixed(2)} ${state.settings.currency || 'ج.م'}`;

    if (change >= 0) {
        changeDisplay.style.color = "var(--success)";
    } else {
        changeDisplay.style.color = "var(--danger)";
    }
}

function confirmCheckout() {
    const checkoutCustSelect = document.getElementById("checkout-customer-select");
    const cartCustSelect = document.getElementById("cart-customer-select");
    if (checkoutCustSelect && cartCustSelect) {
        cartCustSelect.value = checkoutCustSelect.value;
    }

    const activePaymentCard = document.querySelector(".checkout-payment-card.active");
    const selectedMethod = activePaymentCard ? activePaymentCard.getAttribute("data-method") : "cash";

    document.querySelectorAll('input[name="payment-method"]').forEach(r => {
        r.checked = (r.value === selectedMethod);
    });

    const modal = document.getElementById("checkout-modal");
    if (modal) modal.classList.remove("active");

    handleCheckout();
}

function renderCart() {
    const container = document.getElementById("cart-items-container");
    if (!container) return;
    container.innerHTML = "";

    if (!state.cart || state.cart.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">
                    <i class="ri-shopping-cart-2-line" style="font-size:3rem;display:block;margin-bottom:10px;opacity:0.4;"></i>
                    <span>${state.language === "ar" ? "السلة فارغة — ابحث عن المنتجات لإضافتها" : "Cart is empty. Search products to add."}</span>
                </td>
            </tr>`;
        updateCartSummary();
        return;
    }

    state.cart.forEach(item => {
        const prod = (state.products || []).find(p => p.id === item.productId);
        if (!prod) return;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div style="display:flex;flex-direction:column;gap:2px;">
                    <span style="font-weight:700;">${prod.name}</span>
                    <span style="font-size:11px;color:var(--text-muted);">${prod.barcode}</span>
                </div>
            </td>
            <td>${prod.price.toFixed(2)} ${state.settings.currency}</td>
            <td style="text-align:center;">
                <div style="display:flex;align-items:center;gap:6px;justify-content:center;">
                    <button class="qty-btn" onclick="updateCartQty('${prod.id}', -1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-hover);cursor:pointer;font-weight:bold;">−</button>
                    <span style="font-weight:700;min-width:24px;text-align:center;">${item.qty}</span>
                    <button class="qty-btn" onclick="updateCartQty('${prod.id}', 1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-hover);cursor:pointer;font-weight:bold;">+</button>
                </div>
            </td>
            <td style="font-weight:700;">${(prod.price * item.qty).toFixed(2)} ${state.settings.currency}</td>
            <td style="text-align:center;">
                <button onclick="updateCartQty('${prod.id}', -${item.qty})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:18px;" title="إزالة من السلة">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </td>
        `;
        container.appendChild(tr);
    });

    updateCartSummary();
    if (window.lucide) lucide.createIcons();
}

function updateCartSummary() {
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
    const total = taxableAmount + taxAmount;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("cart-subtotal", `${subtotal.toFixed(2)} ${state.settings.currency}`);
    set("cart-tax", `${taxAmount.toFixed(2)} ${state.settings.currency} (${state.settings.taxRate || 0}%)`);
    set("cart-total", `${total.toFixed(2)} ${state.settings.currency}`);
}

function handleCheckout() {
    // ---- Shift Enforcement ----
    if (!state.currentShift || state.currentShift.status !== "active") {
        showToast(
            state.language === "ar"
                ? "🔒 الوردية مغلقة حالياً! يرجى فتح وردية جديدة للبدء في عمليات البيع."
                : "Shift is closed! Please open a new shift to process sales.",
            "danger"
        );
        openShiftModal();
        return;
    }

    if (!state.cart || state.cart.length === 0) {
        showToast(state.language === "ar" ? "السلة فارغة!" : "Cart is empty!", "warning");
        return;
    }

    const customerSelect = document.getElementById("cart-customer-select");
    const customerId = customerSelect ? (customerSelect.value || "walkin") : "walkin";

    const discountInput = document.getElementById("cart-discount-input");
    const discountPercent = discountInput ? (parseFloat(discountInput.value) || 0) : 0;

    const checkedPaymentEl = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = checkedPaymentEl ? checkedPaymentEl.value : "cash";

    // ---- Credit Payment Guard ----
    if (paymentMethod === "credit" && customerId === "walkin") {
        showToast(
            state.language === "ar"
                ? "⚠ البيع الآجل (الدين) يتطلب اختيار عميل مسجل بالنظام!"
                : "Credit sales require selecting a registered customer!",
            "warning"
        );
        return;
    }

    // ---- Calculations & Cost Snapshot ----
    let subtotal = 0;
    let totalCost = 0;
    const itemsSnapshot = (state.cart || []).map(item => {
        const prod = (state.products || []).find(p => p.id === item.productId);
        const itemPrice = prod ? prod.price : (item.price || 0);
        const itemCost = item.cost !== undefined ? item.cost : (prod ? (prod.cost || 0) : 0);
        subtotal += itemPrice * item.qty;
        totalCost += itemCost * item.qty;
        return { ...item, price: itemPrice, cost: itemCost };
    });

    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((state.settings.taxRate || 0) / 100);
    const finalTotal = taxableAmount + taxAmount;
    const profit = finalTotal - totalCost;

    // ---- Stock Deduction ----
    (state.cart || []).forEach(item => {
        const prod = (state.products || []).find(p => p.id === item.productId);
        if (prod) prod.stock = Math.max(0, prod.stock - item.qty);
    });

    // ---- Loyalty & Customer Balance ----
    if (customerId !== "walkin") {
        const customer = (state.customers || []).find(c => c.id === customerId);
        if (customer) {
            customer.points = (customer.points || 0) + Math.floor(finalTotal / 10);
            customer.totalSpent = (customer.totalSpent || 0) + finalTotal;
            customer.visits = (customer.visits || 0) + 1;
            if (paymentMethod === "credit") {
                customer.balance = (customer.balance || 0) + finalTotal;
            }
        }
    }

    // ---- Save Transaction ----
    if (!state.transactions) state.transactions = [];
    const transactionId = String(1000 + state.transactions.length + 1);
    const transaction = {
        id: transactionId,
        date: new Date().toISOString(),
        customerId,
        items: itemsSnapshot,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: finalTotal,
        totalCost,
        profit,
        paymentMethod,
        cashierName: state.currentUser?.name || "الكاشير",
        shiftId: state.currentShift?.id || null,
        status: "completed"
    };

    state.transactions.push(transaction);

    clearCart();
    saveState();
    showReceipt(transaction);

    const methodLabel = paymentMethod === "credit" ? "(بيع آجل 💳)" : paymentMethod === "card" ? "(فيزا/شبكة 💳)" : "(كاش 💵)";
    showToast(`✅ تمت العملية بنجاح! ${methodLabel}`, "success");
    refreshCurrentView();
}

function showReceipt(t) {
    const modal = document.getElementById("receipt-modal");
    if (!modal) return;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("receipt-store-name", state.settings.storeName || "Gaser Market");
    set("receipt-id", `#${t.id}`);
    set("receipt-date", t.date ? t.date.replace('T', ' ').substring(0, 16) : "—");

    const customerName = t.customerId === "walkin"
        ? (state.language === "ar" ? "عميل سفري" : "Walk-in")
        : ((state.customers || []).find(c => c.id === t.customerId)?.name || t.customerId);
    set("receipt-customer", customerName);

    const itemsBody = document.getElementById("receipt-items-body");
    if (itemsBody) {
        itemsBody.innerHTML = "";
        (t.items || []).forEach(item => {
            const prod = (state.products || []).find(p => p.id === item.productId);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${prod ? prod.name : (item.name || "منتج")}</td>
                <td>${item.qty}</td>
                <td>${(item.price || 0).toFixed(2)}</td>
                <td>${((item.price || 0) * item.qty).toFixed(2)}</td>
            `;
            itemsBody.appendChild(row);
        });
    }

    set("receipt-subtotal", `${(t.subtotal || 0).toFixed(2)} ${state.settings.currency}`);
    set("receipt-discount", `${(t.discount || 0).toFixed(2)} ${state.settings.currency}`);
    set("receipt-tax", `${(t.tax || 0).toFixed(2)} ${state.settings.currency}`);
    set("receipt-total", `${(t.total || 0).toFixed(2)} ${state.settings.currency}`);
    set("receipt-barcode-text", `TXN-${t.id}`);

    modal.classList.add("active");
    if (window.lucide) lucide.createIcons();
}

function viewReceipt(txnId) {
    const t = (state.transactions || []).find(x => x.id === txnId);
    if (t) showReceipt(t);
}

function closeReceiptModal() {
    const modal = document.getElementById("receipt-modal");
    if (modal) modal.classList.remove("active");
}

function printReceipt() {
    window.print();
}

// ======================== EXPENSES MODULE ========================
function renderExpenses() {
    const totalExp = (state.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const expCount = (state.expenses || []).length;

    const elTotal = document.getElementById("exp-stat-total");
    const elCount = document.getElementById("exp-stat-count");
    if (elTotal) elTotal.textContent = `${totalExp.toFixed(2)} ${state.settings.currency}`;
    if (elCount) elCount.textContent = expCount;

    renderExpensesTable();
}

function openExpenseModal() {
    const modal = document.getElementById("expense-modal");
    const form = document.getElementById("expense-form");
    if (form) form.reset();
    if (modal) modal.classList.add("active");
}

function handleExpenseFormSubmit(e) {
    if (e) e.preventDefault();

    const categoryEl = document.getElementById("exp-category");
    const amountEl = document.getElementById("exp-amount");
    const notesEl = document.getElementById("exp-notes");

    const category = categoryEl ? categoryEl.value : "مصاريف أخرى";
    const amount = parseFloat(amountEl?.value) || 0;
    const notes = notesEl ? notesEl.value.trim() : "";

    if (amount <= 0) {
        showToast("يرجى إدخال مبلغ صحيح أكبر من صفر!", "danger");
        return;
    }

    if (!state.expenses) state.expenses = [];

    const newExpense = {
        id: "exp_" + Date.now(),
        category,
        amount,
        notes,
        date: new Date().toISOString(),
        shiftId: state.currentShift ? state.currentShift.id : null,
        user: state.currentUser ? state.currentUser.name : "مدير"
    };

    state.expenses.push(newExpense);
    saveState();

    const modal = document.getElementById("expense-modal");
    if (modal) modal.classList.remove("active");
    if (document.getElementById("expense-form")) document.getElementById("expense-form").reset();

    const shiftNotice = (state.currentShift && state.currentShift.status === "active")
        ? ` وخصمه من خزينة الوردية الحالية!`
        : `!`;

    showToast(`✅ تم تسجيل مصروف "${category}" بمبلغ ${amount.toFixed(2)} ${state.settings.currency}${shiftNotice}`, "success");
    renderExpenses();
    refreshCurrentView();
}

function renderExpensesTable() {
    const tbody = document.getElementById("expenses-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const expenses = state.expenses || [];

    if (expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
            <i class="ri-wallet-3-line" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
            ${state.language === "ar" ? "لا توجد مصروفات مسجلة" : "No expenses recorded"}
        </td></tr>`;
        return;
    }

    [...expenses].reverse().forEach(exp => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong style="font-family:monospace;">#${exp.id.substring(4, 10)}</strong></td>
            <td><span class="badge badge-info">${exp.category}</span></td>
            <td><strong class="text-danger">${(exp.amount || 0).toFixed(2)} ${state.settings.currency}</strong></td>
            <td style="color: var(--text-muted);">${exp.notes || '—'}</td>
            <td style="font-size:13px;">${exp.date ? new Date(exp.date).toLocaleString('ar-EG') : '—'}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteExpense('${exp.id}')" title="حذف المصروف">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (window.lucide) window.lucide.createIcons();
}

function deleteExpense(id) {
    if (!confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا المصروف؟" : "Delete this expense?")) return;
    state.expenses = (state.expenses || []).filter(e => e.id !== id);
    saveState();
    renderExpenses();
    showToast("تم حذف المصروف بنجاح وتحديث الحسابات.", "warning");
    refreshCurrentView();
}

// ======================== WASTE / DAMAGE MODULE ========================
function renderWaste() {
    const totalLoss = (state.wastes || []).reduce((sum, w) => sum + (w.totalLoss || 0), 0);
    const wasteCount = (state.wastes || []).length;

    const elLoss = document.getElementById("waste-stat-loss");
    const elCount = document.getElementById("waste-stat-count");
    if (elLoss) elLoss.textContent = `${totalLoss.toFixed(2)} ${state.settings.currency}`;
    if (elCount) elCount.textContent = wasteCount;

    _populateWasteProductSelect();
    renderWasteTable();
}

function _populateWasteProductSelect() {
    const sel = document.getElementById("waste-product-select");
    if (!sel) return;

    const products = (state.products || []).filter(p => p.stock > 0);

    if (products.length === 0) {
        sel.innerHTML = `<option value="">لا يوجد منتجات متاحة بالمخزن</option>`;
        return;
    }

    sel.innerHTML = `<option value="">— اختر المنتج المراد إسقاطه —</option>` +
        products.map(p =>
            `<option value="${p.id}">${p.name} (باركود: ${p.barcode}) — المتاح: ${p.stock} قطعة — التكلفة: ${(p.cost || 0).toFixed(2)} ${state.settings.currency}</option>`
        ).join('');
}

function openWasteModal() {
    _populateWasteProductSelect();
    const form = document.getElementById("waste-form");
    if (form) form.reset();
    _populateWasteProductSelect();
    const modal = document.getElementById("waste-modal");
    if (modal) modal.classList.add("active");
}

function handleWasteFormSubmit(e) {
    if (e) e.preventDefault();

    const productIdEl = document.getElementById("waste-product-select");
    const qtyEl = document.getElementById("waste-qty");
    const reasonEl = document.getElementById("waste-reason");

    const productId = productIdEl ? productIdEl.value : "";
    const qty = parseInt(qtyEl?.value) || 0;
    const reason = reasonEl ? reasonEl.value : "تالف / منتهي الصلاحية";

    if (!productId) { showToast("يرجى اختيار المنتج أولاً!", "danger"); return; }

    const prod = (state.products || []).find(p => p.id === productId);
    if (!prod) { showToast("المنتج المحدد غير موجود بالمخزن!", "danger"); return; }
    if (qty <= 0) { showToast("يرجى إدخال كمية صحيحة أكبر من صفر!", "danger"); return; }
    if (qty > prod.stock) { showToast(`عذراً! الكمية المطلوبة (${qty}) تتجاوز الرصيد المتاح (${prod.stock} قطعة)!`, "danger"); return; }

    const unitCost = prod.cost || 0;
    const totalLoss = unitCost * qty;

    prod.stock -= qty;

    if (!state.wastes) state.wastes = [];
    state.wastes.push({
        id: "w_" + Date.now(),
        productId: prod.id,
        productName: prod.name,
        barcode: prod.barcode,
        qty,
        unitCost,
        totalLoss,
        reason,
        date: new Date().toISOString(),
        user: state.currentUser ? state.currentUser.name : "مدير"
    });

    saveState();

    const modal = document.getElementById("waste-modal");
    if (modal) modal.classList.remove("active");

    showToast(`⚠️ تم إسقاط ${qty} قطعة من "${prod.name}" وتسجيل خسارة ${totalLoss.toFixed(2)} ${state.settings.currency} بسعر التكلفة!`, "warning");
    renderWaste();
    refreshCurrentView();
}

function renderWasteTable() {
    const tbody = document.getElementById("waste-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const wastes = state.wastes || [];
    if (wastes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">
            <i class="ri-delete-bin-3-line" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
            ${state.language === "ar" ? "لا توجد سجلات هالك أو توالف مسجلة" : "No waste logs recorded"}
        </td></tr>`;
        return;
    }

    [...wastes].reverse().forEach(w => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><code style="font-size:12px;">${w.barcode || '—'}</code></td>
            <td><strong>${w.productName || '—'}</strong></td>
            <td><span class="badge badge-warning">${w.qty} قطعة</span></td>
            <td>${(w.unitCost || 0).toFixed(2)} ${state.settings.currency}</td>
            <td><strong class="text-danger">-${(w.totalLoss || 0).toFixed(2)} ${state.settings.currency}</strong></td>
            <td><span class="badge badge-danger">${w.reason || '—'}</span></td>
            <td style="font-size:13px;">${w.date ? new Date(w.date).toLocaleString('ar-EG') : '—'}</td>
        `;
        tbody.appendChild(row);
    });
}

// ======================== SHIFTS MODULE ========================
function calculateShiftMetrics() {
    if (!state.currentShift) {
        return {
            openingBalance: 0, cashSales: 0, cardSales: 0, debtSales: 0,
            customerCashPayments: 0, supplierCashPayments: 0, cashExpenses: 0,
            expectedCash: 0, txnsCount: 0
        };
    }

    const startTime = new Date(state.currentShift.startTime);
    const shiftTxns = (state.transactions || []).filter(t =>
        t.status !== "cancelled" && new Date(t.date) >= startTime
    );

    let cashSales = 0, cardSales = 0, debtSales = 0;
    shiftTxns.forEach(t => {
        const pm = t.paymentMethod || "cash";
        if (pm === "cash") cashSales += (t.total || 0);
        else if (pm === "card") cardSales += (t.total || 0);
        else if (pm === "credit") debtSales += (t.total || 0);
        else cashSales += (t.total || 0);
    });

    const customerCashPayments = (state.customerPayments || [])
        .filter(p => new Date(p.date) >= startTime)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const supplierCashPayments = (state.supplierPayments || [])
        .filter(p => new Date(p.date) >= startTime)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const cashExpenses = (state.expenses || [])
        .filter(e => new Date(e.date) >= startTime)
        .reduce((sum, e) => sum + (e.amount || 0), 0);

    const openingBalance = state.currentShift.openingBalance || 0;
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

function openShiftModal() {
    const modal = document.getElementById("shift-modal");
    if (!modal) return;

    if (!state.currentShift || state.currentShift.status === "closed") {
        const openingRaw = prompt(
            state.language === "ar"
                ? "🔓 لا توجد وردية مفتوحة حالياً.\n\nأدخل مبلغ النقدية الافتتاحية في الدرج لفتح وردية جديدة (ج.م):"
                : "No active shift. Enter opening cash balance to start a new shift (EGP):",
            "0.00"
        );
        if (openingRaw === null) return;

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
        showToast(`✅ تم فتح وردية جديدة برصيد افتتاحي ${openingBalance.toFixed(2)} ${state.settings.currency}`, "success");
        if (state.currentView === "pos") renderPOS();
    }

    const metrics = calculateShiftMetrics();
    const cur = state.currentShift;
    const currency = state.settings.currency;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set("shift-cashier-name", cur.cashierName);
    set("shift-start-time", new Date(cur.startTime).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }));
    set("shift-cash-sales",   `${metrics.cashSales.toFixed(2)} ${currency}`);
    set("shift-card-sales",   `${metrics.cardSales.toFixed(2)} ${currency}`);
    set("shift-debt-sales",   `${metrics.debtSales.toFixed(2)} ${currency}`);
    set("shift-expected-cash", `${metrics.expectedCash.toFixed(2)} ${currency}`);

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

        const newInput = actualCashInput.cloneNode(true);
        actualCashInput.parentNode.replaceChild(newInput, actualCashInput);
        newInput.value = metrics.expectedCash.toFixed(2);
        newInput.addEventListener("input", calcDiff);
        calcDiff();
    }

    modal.classList.add("active");
}

function handleShiftClosingSubmit(e) {
    if (e) e.preventDefault();

    if (!state.currentShift || state.currentShift.status !== "active") {
        showToast("لا توجد وردية مفتوحة لتقفيلها!", "danger");
        return;
    }

    const actualCashInput = document.getElementById("shift-actual-cash");
    const actualCash = parseFloat(actualCashInput?.value) || 0;
    const metrics = calculateShiftMetrics();
    const difference = actualCash - metrics.expectedCash;

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
    state.currentShift = { ...closedShift };
    saveState();

    const modal = document.getElementById("shift-modal");
    if (modal) modal.classList.remove("active");

    const diffLabel = difference < 0
        ? `⬇ عجز ${Math.abs(difference).toFixed(2)} ${state.settings.currency}`
        : difference > 0
            ? `⬆ زيادة ${difference.toFixed(2)} ${state.settings.currency}`
            : `✅ مطابق 100%`;

    showToast(
        `🔒 تم تقفيل الوردية بنجاح! ${diffLabel}\nعمليات البيع محظورة — افتح وردية جديدة للمتابعة.`,
        difference !== 0 ? "warning" : "success"
    );

    refreshCurrentView();
}

// ======================== INVENTORY MODULE ========================
function renderInventory() {
    renderPOSCategoryDropdowns();
    renderInventoryTable();
}

function renderInventoryTable() {
    const tbody = document.getElementById("inventory-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const searchInput = document.getElementById("inventory-search-input");
    const catFilterEl = document.getElementById("inventory-category-filter");
    const stockFilterEl = document.getElementById("inventory-stock-filter");

    const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";
    const catFilter = catFilterEl ? catFilterEl.value : "all";
    const stockFilter = stockFilterEl ? stockFilterEl.value : "all";

    const products = state.products || [];
    const filtered = products.filter(p => {
        const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery) ||
            (p.barcode || "").includes(searchQuery) ||
            (p.category || "").toLowerCase().includes(searchQuery);
        const matchesCat = catFilter === "all" || p.category === catFilter;

        let matchesStock = true;
        if (stockFilter === "instock") matchesStock = p.stock > (state.settings.lowStockLimit || 10);
        else if (stockFilter === "lowstock") matchesStock = p.stock > 0 && p.stock <= (state.settings.lowStockLimit || 10);
        else if (stockFilter === "outstock" || stockFilter === "outofstock") matchesStock = p.stock === 0;

        return matchesSearch && matchesCat && matchesStock;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted);">${state.language === "ar" ? "لا توجد منتجات مطابقة" : "No matching products"}</td></tr>`;
        return;
    }

    filtered.forEach(p => {
        const row = document.createElement("tr");

        let stockBadge = `<span class="badge badge-success">${state.language === "ar" ? "متوفر" : "In Stock"}</span>`;
        if (p.stock === 0) {
            stockBadge = `<span class="badge badge-danger">${state.language === "ar" ? "نفذ" : "Out of Stock"}</span>`;
        } else if (p.stock <= state.settings.lowStockLimit) {
            stockBadge = `<span class="badge badge-warning">${state.language === "ar" ? "منخفض" : "Low Stock"}</span>`;
        }

        const profit = p.price - p.cost;

        row.innerHTML = `
            <td><code>${p.barcode}</code></td>
            <td><strong>${p.name}</strong></td>
            <td><span class="badge badge-info">${(p.category || '').split(' ')[0]}</span></td>
            <td>${p.cost.toFixed(2)} ${state.settings.currency}</td>
            <td>${p.price.toFixed(2)} ${state.settings.currency}</td>
            <td class="text-success">+${profit.toFixed(2)} ${state.settings.currency}</td>
            <td><strong>${p.stock}</strong></td>
            <td><span class="${isExpired(p.expiry) ? 'text-danger font-bold' : ''}">${p.expiry || '-'}</span></td>
            <td>${stockBadge}</td>
            <td>
                <div style="display: flex; gap: 4px;">
                    <button class="btn btn-secondary btn-sm" onclick="editProduct('${p.id}')" title="تعديل">
                        <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')" title="حذف">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    if (window.lucide) lucide.createIcons();
}

function isExpired(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
}

function handleProductFormSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById("product-id").value;
    const barcode = document.getElementById("prod-barcode").value;
    const name = document.getElementById("prod-name").value;
    const category = document.getElementById("prod-category").value;
    const costEl = document.getElementById("prod-cost") || document.getElementById("prod-buy-price");
    const priceEl = document.getElementById("prod-price") || document.getElementById("prod-sell-price");
    const stockEl = document.getElementById("prod-stock");
    const minStockEl = document.getElementById("prod-min-stock");
    const expiryEl = document.getElementById("prod-expiry");

    const cost = costEl ? parseFloat(costEl.value) || 0 : 0;
    const price = priceEl ? parseFloat(priceEl.value) || 0 : 0;
    const stock = stockEl ? parseInt(stockEl.value) || 0 : 0;
    const minStock = minStockEl ? parseInt(minStockEl.value) || 5 : 5;
    const expiry = expiryEl ? expiryEl.value : "";

    if (id) {
        const index = state.products.findIndex(p => p.id === id);
        if (index !== -1) {
            state.products[index] = { ...state.products[index], barcode, name, category, cost, price, stock, minStock, expiry };
        }
    } else {
        const newId = (state.products.length + 1).toString();
        state.products.push({ id: newId, barcode, name, category, cost, price, stock, minStock, expiry, image: "" });
    }

    saveState();
    document.getElementById("product-modal").classList.remove("active");
    document.getElementById("product-form").reset();
    document.getElementById("product-id").value = "";
    renderInventory();
    showToast(state.language === "ar" ? "تم حفظ المنتج بنجاح!" : "Product saved!", "success");
}

function editProduct(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;

    document.getElementById("product-id").value = p.id;
    document.getElementById("prod-barcode").value = p.barcode;
    document.getElementById("prod-name").value = p.name;
    document.getElementById("prod-category").value = p.category;
    document.getElementById("prod-stock").value = p.stock;

    const minStockEl = document.getElementById("prod-min-stock");
    if (minStockEl) minStockEl.value = p.minStock || 5;

    const costEl = document.getElementById("prod-cost") || document.getElementById("prod-buy-price");
    const priceEl = document.getElementById("prod-price") || document.getElementById("prod-sell-price");
    if (costEl) costEl.value = p.cost;
    if (priceEl) priceEl.value = p.price;

    document.getElementById("product-modal-title").textContent = state.language === "ar" ? "تعديل المنتج" : "Edit Product";
    document.getElementById("product-modal").classList.add("active");
}

function deleteProduct(id) {
    if (confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا المنتج؟" : "Are you sure you want to delete this product?")) {
        state.products = state.products.filter(p => p.id !== id);
        saveState();
        renderInventory();
        showToast(state.language === "ar" ? "تم حذف المنتج بنجاح." : "Product deleted.", "warning");
    }
}

// ======================== CATEGORIES MODULE ========================
function handleCategoryFormSubmit(e) {
    if (e) e.preventDefault();
    const input = document.getElementById("new-cat-name");
    const name = input ? input.value.trim() : "";
    if (name && !state.categories.includes(name)) {
        state.categories.push(name);
        saveState();
        if (input) input.value = "";
        renderCategoriesList();
        renderPOSCategoryDropdowns();
        showToast(state.language === "ar" ? "تمت إضافة الفئة بنجاح!" : "Category added!", "success");
    }
}

function renderCategoriesList() {
    const ul = document.getElementById("categories-list-ul");
    if (!ul) return;
    ul.innerHTML = "";
    (state.categories || []).forEach(c => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${c}</span><button class="btn btn-icon text-danger btn-sm" onclick="deleteCategory('${c.replace(/'/g, "\\'")}')"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>`;
        ul.appendChild(li);
    });
    if (window.lucide) lucide.createIcons();
}

function deleteCategory(catName) {
    if (confirm(state.language === "ar" ? `هل أنت متأكد من حذف فئة "${catName}"؟` : `Delete category "${catName}"?`)) {
        state.categories = (state.categories || []).filter(c => c !== catName);
        saveState();
        renderCategoriesList();
        renderPOSCategoryDropdowns();
    }
}

// ======================== REPORTS & P&L MODULE ========================
function renderReports() {
    const rangeBtn = document.querySelector(".reports-toolbar .btn-outline.active");
    const range = rangeBtn ? rangeBtn.getAttribute("data-range") : "today";
    renderReportsData(range);
}

function setReportRange(range, btn) {
    document.querySelectorAll(".reports-toolbar .btn-outline").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderReportsData(range);
}

function renderReportsData(range = "today") {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let filteredTxns = [...(state.transactions || [])];
    let filteredExpenses = [...(state.expenses || [])];
    let filteredWaste = [...(state.wastes || [])];

    if (range === "today") {
        filteredTxns = state.transactions.filter(t => t.date && t.date.startsWith(todayStr));
        filteredExpenses = (state.expenses || []).filter(e => e.date && e.date.startsWith(todayStr));
        filteredWaste = (state.wastes || []).filter(w => w.date && w.date.startsWith(todayStr));
    } else if (range === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTxns = state.transactions.filter(t => new Date(t.date) >= oneWeekAgo);
        filteredExpenses = (state.expenses || []).filter(e => new Date(e.date) >= oneWeekAgo);
        filteredWaste = (state.wastes || []).filter(w => new Date(w.date) >= oneWeekAgo);
    } else if (range === "month") {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredTxns = state.transactions.filter(t => new Date(t.date) >= oneMonthAgo);
        filteredExpenses = (state.expenses || []).filter(e => new Date(e.date) >= oneMonthAgo);
        filteredWaste = (state.wastes || []).filter(w => new Date(w.date) >= oneMonthAgo);
    }

    const validTxns = filteredTxns.filter(t => t.status !== "cancelled");
    const totalSales = validTxns.reduce((sum, t) => sum + (t.total || 0), 0);
    const totalCogs = validTxns.reduce((sum, t) => {
        if (t.totalCost !== undefined) return sum + t.totalCost;
        return sum + Math.max(0, (t.total || 0) - (t.profit || 0));
    }, 0);

    const grossProfit = totalSales - totalCogs;
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalWaste = filteredWaste.reduce((sum, w) => sum + (w.totalLoss || 0), 0);
    const netProfit = grossProfit - (totalExpenses + totalWaste);
    const totalOrders = validTxns.length;

    const lowStockItems = (state.products || []).filter(p => Number(p.stock) <= (Number(p.minStock) || 5));
    const nearExpiryItems = (state.products || []).filter(p => p.expiry && (new Date(p.expiry) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)));

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("stat-today-sales", `${totalSales.toFixed(2)} ${state.settings.currency}`);
    set("stat-today-cogs", `${totalCogs.toFixed(2)} ${state.settings.currency}`);
    set("report-gross-profit", `${grossProfit.toFixed(2)} ${state.settings.currency}`);
    set("report-total-expenses", `${totalExpenses.toFixed(2)} ${state.settings.currency}`);
    set("report-total-waste", `${totalWaste.toFixed(2)} ${state.settings.currency}`);

    const netProfitEl = document.getElementById("report-total-profit") || document.getElementById("report-net-profit");
    if (netProfitEl) {
        netProfitEl.textContent = `${netProfit.toFixed(2)} ${state.settings.currency}`;
        netProfitEl.className = netProfit >= 0 ? "text-success font-bold" : "text-danger font-bold";
    }

    set("stat-today-orders", totalOrders);
    set("low-stock-count-badge", lowStockItems.length);
    set("stat-low-stock", lowStockItems.length);
    set("expiry-count-badge", nearExpiryItems.length);

    renderCategoryProfitsTable(validTxns);
    renderSalesHistoryTable(filteredTxns);
}

function renderCategoryProfitsTable(validTxns) {
    const tbody = document.getElementById("category-profit-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const categoriesMap = {};
    validTxns.forEach(txn => {
        if (!txn.items || !Array.isArray(txn.items)) return;
        txn.items.forEach(item => {
            const product = (state.products || []).find(p => p.id === item.id || p.id === item.productId || p.barcode === item.barcode);
            const cat = (product && product.category) ? product.category : (item.category || "غير تصنيف");
            const qty = Number(item.quantity || item.qty) || 1;
            const itemPrice = Number(item.price) || 0;
            const itemCost = product ? Number(product.cost) : (itemPrice * 0.75);

            const revenue = itemPrice * qty;
            const cost = itemCost * qty;
            const profit = revenue - cost;

            if (!categoriesMap[cat]) {
                categoriesMap[cat] = { name: cat, itemsSold: 0, revenue: 0, cost: 0, profit: 0 };
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
            <td><span class="badge ${marginPct >= 20 ? 'badge-success' : 'badge-warning'}">${marginPct.toFixed(1)}%</span></td>
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
        const customerName = t.customerId === "walkin"
            ? (state.language === "ar" ? "عميل سفري" : "Walk-in")
            : ((state.customers || []).find(c => c.id === t.customerId)?.name || t.customerId);
        
        const isCancelled = t.status === "cancelled";
        const rowStyle = isCancelled ? `style="opacity: 0.65;"` : "";
        const totalStyle = isCancelled ? `style="text-decoration: line-through; opacity: 0.6;"` : `class="text-success"`;
        const profitStyle = isCancelled ? `style="text-decoration: line-through; opacity: 0.6;"` : `class="text-success"`;
            
        const statusBadge = isCancelled
            ? `<span class="badge badge-danger">${state.language === "ar" ? "ملغاة" : "Cancelled"}</span>`
            : `<span class="badge badge-info">${state.language === "ar" ? (t.paymentMethod === "cash" ? "نقدي" : t.paymentMethod === "card" ? "بطاقة" : "آجل") : t.paymentMethod}</span>`;

        const cancelBtn = isCancelled
            ? ""
            : `<button class="btn btn-danger btn-sm" onclick="cancelTransaction('${t.id}')" title="إلغاء والمعاملة">
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
                    <button class="btn btn-secondary btn-sm" onclick="viewReceipt('${t.id}')" title="عرض">
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

function openLowStockReport() {
    const modal = document.getElementById("low-stock-modal");
    const tbody = document.getElementById("low-stock-table-body");
    const summaryText = document.getElementById("low-stock-summary-text");
    if (!modal || !tbody) return;

    tbody.innerHTML = "";
    const lowStockItems = (state.products || []).filter(p => Number(p.stock) <= (Number(p.minStock) || 5));

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

function closeLowStockModal() {
    const modal = document.getElementById("low-stock-modal");
    if (modal) modal.classList.remove("active");
}

function openExpiryReport() {
    const modal = document.getElementById("expiry-modal");
    const tbody = document.getElementById("expiry-table-body");
    const summaryText = document.getElementById("expiry-summary-text");
    if (!modal || !tbody) return;

    tbody.innerHTML = "";
    const now = new Date();
    const expiryItems = (state.products || []).filter(p => p.expiry && (new Date(p.expiry) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)));

    if (expiryItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-success); font-weight:700;">ممتاز! لا توجد منتجات منتهية أو قريبة من انتهاء الصلاحية خلال الـ 30 يوماً القادمة.</td></tr>`;
        if (summaryText) summaryText.textContent = "إجمالي التنبيهات: 0 منتج";
    } else {
        expiryItems.forEach(p => {
            const isExp = new Date(p.expiry) < now;
            const statusBadge = isExp
                ? `<span class="badge badge-danger">منتهي الصلاحية</span>`
                : `<span class="badge badge-warning">قريب الانتهاء (أقل من 30 يوم)</span>`;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><code>${p.barcode}</code></td>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge badge-info">${p.category}</span></td>
                <td><strong>${p.stock}</strong></td>
                <td><strong class="${isExp ? 'text-danger' : 'text-warning'}">${p.expiry}</strong></td>
                <td>${(p.cost || 0).toFixed(2)} ${state.settings.currency}</td>
                <td>${statusBadge}</td>
            `;
            tbody.appendChild(row);
        });
        if (summaryText) summaryText.textContent = `إجمالي المنتجات الواجب مراجعتها: ${expiryItems.length} منتج`;
    }

    modal.classList.add("active");
    if (window.lucide) window.lucide.createIcons();
}

function closeExpiryModal() {
    const modal = document.getElementById("expiry-modal");
    if (modal) modal.classList.remove("active");
}

function printLowStockReport() { window.print(); }

function exportLowStockCSV() {
    const lowStockItems = (state.products || []).filter(p => Number(p.stock) <= (Number(p.minStock) || 5));
    if (lowStockItems.length === 0) { alert("لا توجد نواقص لتصديرها."); return; }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "الباركود,اسم المنتج,التصنيف,الكمية الحالية,حد الأمان,سعر الشراء,سعر البيع\n";
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

// ======================== CUSTOMERS MODULE ========================
function renderCustomers() {
    const tbody = document.getElementById("customers-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const searchEl = document.getElementById("customer-search-input");
    const searchQuery = searchEl ? searchEl.value.toLowerCase().trim() : "";

    const customers = state.customers || [];
    const filtered = customers.filter(c =>
        (c.name || "").toLowerCase().includes(searchQuery) ||
        (c.phone || "").includes(searchQuery)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">
            <i class="ri-user-search-line" style="font-size:2rem;display:block;margin-bottom:8px;"></i>
            ${state.language === "ar" ? "لا يوجد عملاء مطابقون للبحث" : "No matching customers"}
        </td></tr>`;
        return;
    }

    filtered.forEach(c => {
        const balance = c.balance || 0;
        const balanceBadge = balance > 0
            ? `<strong class="text-danger">⚠ ${balance.toFixed(2)} ${state.settings.currency}</strong>`
            : `<span class="text-success">✓ لا يوجد دين</span>`;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${c.name}</strong></td>
            <td><code>${c.phone || '—'}</code></td>
            <td>${balanceBadge}</td>
            <td><span class="badge badge-success">${c.points || 0} نقطة</span></td>
            <td>${(c.totalSpent || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${c.visits || 0}</td>
            <td>${c.registered || '—'}</td>
            <td>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="editCustomer('${c.id}')" title="تعديل">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="openCustomerSettleModal('${c.id}')"
                        title="سداد دين" ${balance <= 0 ? 'disabled style="opacity:0.4;"' : ''}>
                        <i class="ri-wallet-line"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCustomer('${c.id}')" title="حذف">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    if (window.lucide) window.lucide.createIcons();
}

function openCustomerModal() {
    const modal = document.getElementById("customer-modal");
    const form = document.getElementById("customer-form");
    if (form) form.reset();
    const idField = document.getElementById("customer-id");
    if (idField) idField.value = "";
    const titleEl = document.getElementById("customer-modal-title");
    if (titleEl) titleEl.textContent = state.language === "ar" ? "إضافة عميل جديد" : "Add New Customer";
    if (modal) modal.classList.add("active");
}

function handleCustomerFormSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById("customer-id")?.value;
    const name = document.getElementById("cust-name")?.value?.trim();
    const phone = document.getElementById("cust-phone")?.value?.trim();
    const points = parseInt(document.getElementById("cust-points")?.value) || 0;

    if (!name) { showToast("يرجى إدخال اسم العميل!", "danger"); return; }

    if (id) {
        const idx = (state.customers || []).findIndex(c => c.id === id);
        if (idx !== -1) {
            state.customers[idx] = { ...state.customers[idx], name, phone, points };
        }
    } else {
        const newId = "c_" + Date.now();
        if (!state.customers) state.customers = [];
        state.customers.push({
            id: newId, name, phone, points,
            balance: 0, totalSpent: 0, visits: 0,
            registered: new Date().toISOString().split('T')[0]
        });
    }

    saveState();
    const modal = document.getElementById("customer-modal");
    if (modal) modal.classList.remove("active");
    showToast(id ? "تم تحديث بيانات العميل بنجاح!" : "تم إضافة العميل الجديد بنجاح!", "success");

    renderCustomers();
    renderPOSCustomerDropdown();
}

function editCustomer(id) {
    const c = (state.customers || []).find(x => x.id === id);
    if (!c) return;

    const idEl = document.getElementById("customer-id");
    const nameEl = document.getElementById("cust-name");
    const phoneEl = document.getElementById("cust-phone");
    const pointsEl = document.getElementById("cust-points");
    const titleEl = document.getElementById("customer-modal-title");
    const modal = document.getElementById("customer-modal");

    if (idEl) idEl.value = c.id;
    if (nameEl) nameEl.value = c.name;
    if (phoneEl) phoneEl.value = c.phone || "";
    if (pointsEl) pointsEl.value = c.points || 0;
    if (titleEl) titleEl.textContent = "تعديل بيانات العميل";
    if (modal) modal.classList.add("active");
}

function deleteCustomer(id) {
    if (!confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا العميل؟" : "Delete this customer?")) return;
    state.customers = (state.customers || []).filter(c => c.id !== id);
    saveState();
    renderCustomers();
    renderPOSCustomerDropdown();
    showToast("تم حذف العميل بنجاح.", "warning");
}

function openCustomerSettleModal(id) {
    const c = (state.customers || []).find(x => x.id === id);
    if (!c) return;
    const modal = document.getElementById("customer-settle-modal");
    if (!modal) return;

    const idEl = document.getElementById("cust-settle-id");
    const nameEl = document.getElementById("cust-settle-name");
    const balanceEl = document.getElementById("cust-settle-balance");
    const amountEl = document.getElementById("cust-settle-amount");

    if (idEl) idEl.value = c.id;
    if (nameEl) nameEl.textContent = c.name;
    if (balanceEl) {
        balanceEl.textContent = `${(c.balance || 0).toFixed(2)} ${state.settings.currency}`;
        balanceEl.className = "text-danger font-bold";
    }
    if (amountEl) {
        amountEl.value = "";
        amountEl.max = c.balance || 0;
        amountEl.placeholder = `الحد الأقصى: ${(c.balance || 0).toFixed(2)}`;
    }

    modal.classList.add("active");
}

function handleCustomerSettleFormSubmit(e) {
    if (e) e.preventDefault();
    const idEl = document.getElementById("cust-settle-id");
    const amountEl = document.getElementById("cust-settle-amount");
    const id = idEl ? idEl.value : "";
    const amount = parseFloat(amountEl?.value) || 0;

    if (!id) { showToast("خطأ: لم يتم تحديد العميل!", "danger"); return; }
    if (amount <= 0) { showToast("يرجى إدخال مبلغ السداد!", "danger"); return; }

    const c = (state.customers || []).find(x => x.id === id);
    if (!c) { showToast("العميل غير موجود!", "danger"); return; }
    if (amount > (c.balance || 0)) {
        showToast(`المبلغ المدخل (${amount.toFixed(2)}) يتجاوز الدين المستحق (${(c.balance||0).toFixed(2)})!`, "warning");
        return;
    }

    c.balance = Math.max(0, (c.balance || 0) - amount);

    if (!state.customerPayments) state.customerPayments = [];
    state.customerPayments.push({
        id: "cpay_" + Date.now(),
        customerId: c.id,
        customerName: c.name,
        amount,
        date: new Date().toISOString(),
        paymentMethod: "cash"
    });

    saveState();
    const modal = document.getElementById("customer-settle-modal");
    if (modal) modal.classList.remove("active");

    showToast(`✅ تم تسجيل دفعة ${amount.toFixed(2)} ${state.settings.currency} من العميل "${c.name}". الدين المتبقي: ${c.balance.toFixed(2)} ${state.settings.currency}`, "success");
    renderCustomers();
    refreshCurrentView();
}

// ======================== SUPPLIERS & WAC PURCHASES MODULE ========================
function renderSuppliers() {
    _populatePurchaseDropdowns();

    const totalSuppliers = (state.suppliers || []).length;
    const totalBalance = (state.suppliers || []).reduce((sum, s) => sum + (s.balance || 0), 0);
    const totalPurchasesCount = (state.purchaseInvoices || []).length;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("sup-stat-total", totalSuppliers);
    set("sup-stat-balance", `${totalBalance.toFixed(2)} ${state.settings.currency}`);
    set("sup-stat-purchases", totalPurchasesCount);

    renderSuppliersTable();
}

function _populatePurchaseDropdowns() {
    const purSupplierSel = document.getElementById("pur-supplier");
    if (purSupplierSel) {
        const suppliers = state.suppliers || [];
        if (suppliers.length > 0) {
            purSupplierSel.innerHTML = suppliers.map(s => `<option value="${s.id}">${s.company || s.name}</option>`).join('');
        } else {
            purSupplierSel.innerHTML = `<option value="">لا يوجد موردين — أضف مورداً أولاً</option>`;
        }
    }

    const purProductSel = document.getElementById("pur-product");
    if (purProductSel) {
        const products = state.products || [];
        if (products.length > 0) {
            purProductSel.innerHTML = products.map(p =>
                `<option value="${p.id}">${p.name} (${p.barcode}) — تكلفة حالية: ${(p.cost || 0).toFixed(2)} ${state.settings.currency}</option>`
            ).join('');

            const fillCost = () => {
                const prod = products.find(x => x.id === purProductSel.value);
                const costInput = document.getElementById("pur-cost");
                if (prod && costInput) costInput.value = (prod.cost || 0).toFixed(2);
            };
            purProductSel.onchange = fillCost;
            fillCost();
        } else {
            purProductSel.innerHTML = `<option value="">لا يوجد منتجات بالمخزن</option>`;
        }
    }
}

function openSupplierModal() {
    const modal = document.getElementById("supplier-modal");
    const form = document.getElementById("supplier-form");
    if (form) form.reset();
    const idField = document.getElementById("supplier-id");
    if (idField) idField.value = "";
    const titleEl = document.getElementById("supplier-modal-title");
    if (titleEl) titleEl.textContent = state.language === "ar" ? "إضافة مورد جديد" : "Add New Supplier";
    if (modal) modal.classList.add("active");
}

function openPurchaseModal() {
    _populatePurchaseDropdowns();
    const form = document.getElementById("purchase-form");
    if (form) form.reset();
    _populatePurchaseDropdowns();
    
    const wrapper = document.getElementById("pur-paid-amount-wrapper");
    if (wrapper) wrapper.style.display = "none";

    const deliveryDateInp = document.getElementById("pur-delivery-date");
    if (deliveryDateInp) deliveryDateInp.value = new Date().toISOString().split('T')[0];

    const previewWrapper = document.getElementById("pur-image-preview-wrapper");
    if (previewWrapper) previewWrapper.style.display = "none";

    const imgDataField = document.getElementById("pur-invoice-image-data");
    if (imgDataField) imgDataField.value = "";

    switchBaleMode('unit');

    const modal = document.getElementById("purchase-modal");
    if (modal) modal.classList.add("active");
}

function switchBaleMode(mode) {
    const btnUnit = document.getElementById("btn-mode-unit");
    const btnBale = document.getElementById("btn-mode-bale");
    const baleRow = document.getElementById("bale-inputs-row");
    if (mode === "bale") {
        if (btnUnit) btnUnit.classList.remove("active");
        if (btnBale) btnBale.classList.add("active");
        if (baleRow) baleRow.style.display = "grid";
    } else {
        if (btnBale) btnBale.classList.remove("active");
        if (btnUnit) btnUnit.classList.add("active");
        if (baleRow) baleRow.style.display = "none";
    }
}
window.switchBaleMode = switchBaleMode;

function renderSuppliersTable() {
    const tbody = document.getElementById("suppliers-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const searchEl = document.getElementById("supplier-search-input");
    const searchQuery = searchEl ? searchEl.value.toLowerCase().trim() : "";
    const suppliers = state.suppliers || [];
    const filtered = suppliers.filter(s =>
        (s.company || "").toLowerCase().includes(searchQuery) ||
        (s.name || "").toLowerCase().includes(searchQuery) ||
        (s.phone || "").includes(searchQuery)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">لا يوجد موردين مطابقون</td></tr>`;
        return;
    }

    filtered.forEach(s => {
        const balance = s.balance || 0;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${s.company || '—'}</strong></td>
            <td>${s.name || '—'}</td>
            <td><code>${s.phone || '—'}</code></td>
            <td><strong class="${balance > 0 ? 'text-danger' : 'text-success'}">${balance.toFixed(2)} ${state.settings.currency}</strong></td>
            <td>${(s.totalPurchases || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${s.lastUpdated || '—'}</td>
            <td>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    <button class="btn btn-info btn-sm" onclick="openSupplierHistoryModal('${s.id}')" title="كشف حساب وسجل التعاملات (Timeline)">
                        <i class="ri-history-line"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editSupplier('${s.id}')" title="تعديل">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="openSettleModal('${s.id}')"
                        title="سداد دفعة" ${balance <= 0 ? 'disabled style="opacity:0.4;"' : ''}>
                        <i class="ri-wallet-line"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSupplier('${s.id}')" title="حذف">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    if (window.lucide) window.lucide.createIcons();
}

function handleSupplierFormSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById("supplier-id")?.value;
    const company = document.getElementById("sup-company")?.value?.trim();
    const name = document.getElementById("sup-name")?.value?.trim();
    const phone = document.getElementById("sup-phone")?.value?.trim();
    const balance = parseFloat(document.getElementById("sup-balance")?.value) || 0;

    if (!company) { showToast("يرجى إدخال اسم الشركة / المورد!", "danger"); return; }
    if (!state.suppliers) state.suppliers = [];

    if (id) {
        const idx = state.suppliers.findIndex(s => s.id === id);
        if (idx !== -1) {
            state.suppliers[idx] = { ...state.suppliers[idx], company, name, phone, balance, lastUpdated: new Date().toISOString().split('T')[0] };
        }
    } else {
        state.suppliers.push({
            id: "s_" + Date.now(), company, name, phone, balance,
            totalPurchases: 0, lastUpdated: new Date().toISOString().split('T')[0]
        });
    }

    saveState();
    const modal = document.getElementById("supplier-modal");
    if (modal) modal.classList.remove("active");
    showToast(id ? "تم تحديث بيانات المورد بنجاح!" : "تم إضافة المورد الجديد بنجاح!", "success");
    renderSuppliers();
}

function editSupplier(id) {
    const s = (state.suppliers || []).find(x => x.id === id);
    if (!s) return;

    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val; };
    set("supplier-id", s.id);
    set("sup-company", s.company || "");
    set("sup-name", s.name || "");
    set("sup-phone", s.phone || "");
    set("sup-balance", s.balance || 0);

    const titleEl = document.getElementById("supplier-modal-title");
    if (titleEl) titleEl.textContent = "تعديل بيانات المورد";
    const modal = document.getElementById("supplier-modal");
    if (modal) modal.classList.add("active");
}

function deleteSupplier(id) {
    if (!confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا المورد؟" : "Delete this supplier?")) return;
    state.suppliers = (state.suppliers || []).filter(s => s.id !== id);
    saveState();
    renderSuppliers();
    showToast("تم حذف المورد بنجاح.", "warning");
}

function handlePurchaseFormSubmit(e) {
    if (e) e.preventDefault();

    const supplierId  = document.getElementById("pur-supplier")?.value;
    const productId   = document.getElementById("pur-product")?.value;
    const newBatchCost = parseFloat(document.getElementById("pur-cost")?.value) || 0;
    const qty          = parseInt(document.getElementById("pur-qty")?.value) || 0;
    const paymentStatus = document.getElementById("pur-payment")?.value || "paid";
    const deliveryDate = document.getElementById("pur-delivery-date")?.value || new Date().toISOString().split('T')[0];
    const dueDate      = document.getElementById("pur-due-date")?.value || "";
    const invoiceImage = document.getElementById("pur-invoice-image-data")?.value || "";

    if (!supplierId || !productId) { showToast("يرجى اختيار المورد والمنتج!", "danger"); return; }
    if (qty <= 0) { showToast("يرجى إدخال كمية توريد صحيحة!", "danger"); return; }
    if (newBatchCost <= 0) { showToast("يرجى إدخال سعر التكلفة الصحيح!", "danger"); return; }

    const totalCost = newBatchCost * qty;

    // ---- WAC: Update Product Stock & Weighted Average Cost ----
    const prod = (state.products || []).find(p => p.id === productId);
    if (prod) {
        const currentStock = Math.max(0, prod.stock || 0);
        const currentCost = prod.cost || 0;
        const totalStockAfter = currentStock + qty;

        prod.cost = totalStockAfter > 0
            ? parseFloat(((currentStock * currentCost + qty * newBatchCost) / totalStockAfter).toFixed(4))
            : newBatchCost;

        prod.stock = totalStockAfter;
    }

    // ---- Update Supplier Balance & totals ----
    const sup = (state.suppliers || []).find(s => s.id === supplierId);
    if (sup) {
        sup.totalPurchases = (sup.totalPurchases || 0) + totalCost;
        if (paymentStatus === "credit") {
            sup.balance = (sup.balance || 0) + totalCost;
        } else if (paymentStatus === "partial") {
            const paidNow = parseFloat(document.getElementById("pur-paid-amount")?.value) || 0;
            const remaining = Math.max(0, totalCost - paidNow);
            if (remaining > 0) sup.balance = (sup.balance || 0) + remaining;
        }
        sup.lastUpdated = new Date().toISOString().split('T')[0];
    }

    if (!state.purchaseInvoices) state.purchaseInvoices = [];
    state.purchaseInvoices.push({
        id: String(2000 + state.purchaseInvoices.length + 1),
        date: new Date().toISOString(),
        deliveryDate,
        dueDate,
        invoiceImage,
        supplierId,
        supplierName: sup ? sup.company : "—",
        productId,
        productName: prod ? prod.name : "—",
        qty,
        cost: newBatchCost,
        totalCost,
        paymentStatus,
        newWAC: prod ? prod.cost : newBatchCost
    });

    saveState();

    const modal = document.getElementById("purchase-modal");
    if (modal) modal.classList.remove("active");
    const form = document.getElementById("purchase-form");
    if (form) form.reset();
    const wrapper = document.getElementById("pur-paid-amount-wrapper");
    if (wrapper) wrapper.style.display = "none";

    showToast(`✅ تم تسحيل فاتورة التوريد وتحديث المخزون بنجاح!`, "success");
    renderSuppliers();
    refreshCurrentView();
}

function openSettleModal(id) {
    const s = (state.suppliers || []).find(x => x.id === id);
    if (!s) return;

    const modal = document.getElementById("settle-modal");
    if (!modal) return;

    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };
    const setVal = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val; };

    setVal("settle-supplier-id", s.id);
    set("settle-supplier-name", s.company || s.name);
    set("settle-current-balance", `${(s.balance || 0).toFixed(2)} ${state.settings.currency}`);
    setVal("settle-amount", "");

    const amountEl = document.getElementById("settle-amount");
    if (amountEl) {
        amountEl.max = s.balance || 0;
        amountEl.placeholder = `الحد الأقصى: ${(s.balance || 0).toFixed(2)}`;
    }

    modal.classList.add("active");
}

function handleSettleFormSubmit(e) {
    if (e) e.preventDefault();

    const id = document.getElementById("settle-supplier-id")?.value;
    const amount = parseFloat(document.getElementById("settle-amount")?.value) || 0;

    if (!id) { showToast("خطأ: لم يتم تحديد المورد!", "danger"); return; }
    if (amount <= 0) { showToast("يرجى إدخال مبلغ السداد!", "danger"); return; }

    const sup = (state.suppliers || []).find(s => s.id === id);
    if (!sup) { showToast("المورد غير موجود!", "danger"); return; }

    if (amount > (sup.balance || 0)) {
        showToast(`المبلغ (${amount.toFixed(2)}) يتجاوز المديونية المستحقة (${(sup.balance||0).toFixed(2)})!`, "warning");
        return;
    }

    sup.balance = Math.max(0, (sup.balance || 0) - amount);
    sup.lastUpdated = new Date().toISOString().split('T')[0];

    if (!sup.settlements) sup.settlements = [];
    sup.settlements.push({
        id: "spay_" + Date.now(),
        amount,
        date: new Date().toISOString()
    });

    if (!state.supplierPayments) state.supplierPayments = [];
    state.supplierPayments.push({
        id: "spay_" + Date.now(),
        supplierId: sup.id,
        supplierName: sup.company,
        amount,
        date: new Date().toISOString()
    });

    saveState();
    const modal = document.getElementById("settle-modal");
    if (modal) modal.classList.remove("active");

    showToast(`✅ تم تسديد دفعة ${amount.toFixed(2)} ${state.settings.currency} للمورد "${sup.company}".`, "success");
    renderSuppliers();
    refreshCurrentView();
}

window.openSupplierHistoryModal = function(supplierId) {
    const sup = (state.suppliers || []).find(s => s.id === supplierId);
    if (!sup) return;

    const setVal = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setVal("sup-details-name", sup.company || sup.name || "—");
    setVal("sup-details-total", `${(sup.totalPurchases || 0).toFixed(2)} ${state.settings.currency}`);
    setVal("sup-details-balance", `${(sup.balance || 0).toFixed(2)} ${state.settings.currency}`);

    const timelineContainer = document.getElementById("supplier-timeline-container");
    if (!timelineContainer) return;

    timelineContainer.innerHTML = "";

    const invoices = (state.purchaseInvoices || []).filter(i => i.supplierId === supplierId);
    const events = [];

    invoices.forEach(inv => {
        events.push({
            type: 'purchase',
            id: inv.id,
            date: inv.deliveryDate || inv.date,
            title: `فاتورة توريد #${inv.id}`,
            subtitle: `المنتج: ${inv.productName || '—'} (عدد ${inv.qty} قطعة بسعر ${inv.cost} ج.م)`,
            amount: inv.totalCost || (inv.cost * inv.qty),
            paymentStatus: inv.paymentStatus,
            image: inv.invoiceImage || ''
        });
    });

    if (sup.settlements && Array.isArray(sup.settlements)) {
        sup.settlements.forEach(s => {
            events.push({
                type: 'settlement',
                id: s.id,
                date: s.date,
                title: `دفعة سداد مديونية`,
                subtitle: `تم سداد مبلغ ${s.amount.toFixed(2)} ${state.settings.currency} من رصيد المديونية`,
                amount: s.amount,
                paymentStatus: 'paid',
                image: ''
            });
        });
    }

    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (events.length === 0) {
        timelineContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:30px;">لا تتوفر تعاملات سابقة مسجلة لـ هذا المورد</div>`;
    } else {
        events.forEach(ev => {
            const dateStr = ev.date ? new Date(ev.date).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
            const isPurchase = ev.type === 'purchase';
            const itemEl = document.createElement("div");
            itemEl.className = "timeline-item";
            itemEl.innerHTML = `
                <div class="timeline-badge ${isPurchase ? 'badge-purchase' : 'badge-settlement'}"></div>
                <div class="timeline-card">
                    <div class="timeline-header">
                        <span class="timeline-title">${ev.title}</span>
                        <span class="timeline-date">${dateStr}</span>
                    </div>
                    <div style="font-size:13px; color:var(--text-secondary);">${ev.subtitle}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                        <span class="timeline-amount ${isPurchase ? 'text-primary' : 'text-success'}">
                            ${isPurchase ? '+' : '-'}${ev.amount.toFixed(2)} ${state.settings.currency}
                        </span>
                        ${ev.image ? `<button type="button" class="btn btn-sm btn-outline" onclick="window.previewImageModal('${ev.image}')"><i class="ri-image-line"></i> معاينة الفاتورة الورقية</button>` : ''}
                    </div>
                </div>
            `;
            timelineContainer.appendChild(itemEl);
        });
    }

    const modal = document.getElementById("supplier-details-modal");
    if (modal) modal.classList.add("active");
};

window.previewImageModal = function(imgSrc) {
    const w = window.open("");
    if (w) {
        w.document.write(`<title>معاينة الفاتورة الورقية</title><div style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:#111;"><img src="${imgSrc}" style="max-width:90vw; max-height:90vh; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.8);" /></div>`);
    }
};

function renderPurchases() {
    const tbody = document.getElementById("purchases-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const invoices = state.purchaseInvoices || [];
    if (invoices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-muted);">لا توجد فواتير مشتريات مسجلة</td></tr>`;
        return;
    }

    [...invoices].reverse().forEach(inv => {
        const row = document.createElement("tr");
        const payBadge = inv.paymentStatus === "credit"
            ? `<span class="badge badge-danger">آجل</span>`
            : inv.paymentStatus === "partial"
                ? `<span class="badge badge-warning">جزئي</span>`
                : `<span class="badge badge-success">مدفوع</span>`;

        row.innerHTML = `
            <td><strong style="font-family:monospace;">#${inv.id}</strong></td>
            <td>${inv.supplierName || '—'}</td>
            <td style="font-size:13px;">${inv.date ? new Date(inv.date).toLocaleString('ar-EG') : '—'}</td>
            <td><strong>${(inv.totalCost || 0).toFixed(2)} ${state.settings.currency}</strong></td>
            <td>${payBadge}</td>
        `;
        tbody.appendChild(row);
    });
}

// ======================== USER AUTH & USERS MODULE ========================
function initAuth() {
    if (!state.currentUser && state.users && state.users.length > 0) {
        state.currentUser = state.users[0];
    }
    const display = document.getElementById("current-user-display");
    if (display && state.currentUser) {
        display.innerHTML = `<i class="ri-user-line"></i> ${state.currentUser.name} (${state.currentUser.role === 'admin' ? 'مدير' : 'كاشير'})`;
    }
}

function renderUsers() {
    const tbody = document.getElementById("users-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const users = state.users || [];
    users.forEach(u => {
        const row = document.createElement("tr");
        const roleLabel = u.role === "admin" ? "مدير عام (Super Admin)" : u.role === "storekeeper" ? "أمين مخزن" : "كاشير";
        row.innerHTML = `
            <td><strong>${u.name}</strong></td>
            <td><code>${u.username}</code></td>
            <td><span class="badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}">${roleLabel}</span></td>
            <td>
                <div style="display:flex;gap:4px;">
                    <button class="btn btn-secondary btn-sm" onclick="editUser('${u.id}')" title="تعديل"><i class="ri-edit-line"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser('${u.id}')" title="حذف"><i class="ri-delete-bin-line"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function handleUserFormSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById("user-id")?.value;
    const name = document.getElementById("user-name-input")?.value?.trim();
    const username = document.getElementById("user-username-input")?.value?.trim();
    const role = document.getElementById("user-role-select")?.value || "cashier";

    if (!name || !username) { showToast("يرجى ملء جميع الحقول المطلوبة!", "danger"); return; }

    if (id) {
        const idx = (state.users || []).findIndex(u => u.id === id);
        if (idx !== -1) state.users[idx] = { ...state.users[idx], name, username, role };
    } else {
        const newId = "u_" + Date.now();
        if (!state.users) state.users = [];
        state.users.push({ id: newId, name, username, role });
    }

    saveState();
    const modal = document.getElementById("user-modal");
    if (modal) modal.classList.remove("active");
    showToast("تم حفظ بيانات المستخدم بنجاح!", "success");
    renderUsers();
}

function editUser(id) {
    const u = (state.users || []).find(x => x.id === id);
    if (!u) return;

    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val; };
    set("user-id", u.id);
    set("user-name-input", u.name);
    set("user-username-input", u.username);
    set("user-role-select", u.role);

    const modal = document.getElementById("user-modal");
    if (modal) modal.classList.add("active");
}

function deleteUser(id) {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    state.users = (state.users || []).filter(u => u.id !== id);
    saveState();
    renderUsers();
    showToast("تم حذف المستخدم بنجاح.", "warning");
}

// ======================== SETTINGS MODULE ========================
function renderSettings() {
    const nameEl = document.getElementById("settings-store-name");
    const currEl = document.getElementById("settings-currency");
    const taxEl = document.getElementById("settings-tax-rate");
    const lowEl = document.getElementById("settings-low-stock");

    if (nameEl) nameEl.value = state.settings.storeName || "Gaser Market";
    if (currEl) currEl.value = state.settings.currency || "ج.م";
    if (taxEl) taxEl.value = state.settings.taxRate !== undefined ? state.settings.taxRate : 14;
    if (lowEl) lowEl.value = state.settings.lowStockLimit || 10;
}

// ======================== APPLICATION CORE & NAVIGATION ========================
const addListenerSafe = (id, event, callback) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, callback);
};

function applyTheme() {
    document.body.className = state.theme === "dark" ? "dark-mode" : "light-mode";
}

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

    const posSearch = document.getElementById("barcode-input");
    if (posSearch && translations[state.language]) {
        posSearch.placeholder = translations[state.language].searchPlaceholder;
    }
}

function setupNavigation() {
    document.querySelectorAll(".nav-btn, .sidebar-menu .menu-item, .mobile-nav-item[data-view], .mobile-drawer-btn[data-view]").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const view = item.getAttribute("data-view");
            if (view) switchView(view);
        });
    });

    // Sidebar Collapse Toggle
    const sidebarToggle = document.getElementById("sidebar-toggle-btn");
    const sidebar = document.getElementById("app-sidebar");
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });
    }

    // Sidebar Menu Live Search Filter
    const sidebarSearch = document.getElementById("sidebar-menu-search");
    if (sidebarSearch) {
        sidebarSearch.addEventListener("input", (e) => {
            const q = (e.target.value || "").trim().toLowerCase();
            document.querySelectorAll("#sidebar-nav-menu .nav-btn").forEach(btn => {
                const text = (btn.textContent || "").toLowerCase();
                if (!q || text.includes(q)) {
                    btn.style.display = "flex";
                } else {
                    btn.style.display = "none";
                }
            });
        });
    }
}

function switchView(viewName) {
    if (!viewName) return;

    // Auto-close open modals on view switch
    document.querySelectorAll(".modal-overlay.active, .modal-backdrop.active").forEach(m => {
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
    if (titleEl && translations[state.language] && translations[state.language][cleanViewName]) {
        titleEl.textContent = translations[state.language][cleanViewName];
    }

    if (cleanViewName === "dashboard") renderDashboard();
    else if (cleanViewName === "pos") renderPOS();
    else if (cleanViewName === "inventory") renderInventory();
    else if (cleanViewName === "purchases") renderPurchases();
    else if (cleanViewName === "expenses") renderExpenses();
    else if (cleanViewName === "waste") renderWaste();
    else if (cleanViewName === "reports") renderReports();
    else if (cleanViewName === "customers") renderCustomers();
    else if (cleanViewName === "suppliers") renderSuppliers();
    else if (cleanViewName === "settings") renderSettings();
    else if (cleanViewName === "users") renderUsers();

    if (window.lucide) lucide.createIcons();
}

function refreshCurrentView() {
    switchView(state.currentView);
}

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

function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        // F1 -> Switch to POS
        if (e.key === "F1") { e.preventDefault(); switchView("pos"); showToast("تم الانتقال إلى الكاشير", "info"); }
        
        // F2 -> Open Checkout Modal in POS, or refresh view elsewhere
        if (e.key === "F2") {
            e.preventDefault();
            if (state.currentView === "pos") {
                openCheckoutModal();
            } else {
                refreshCurrentView();
            }
        }

        // Enter -> If checkout modal is open, trigger checkout confirmation
        if (e.key === "Enter") {
            const checkoutModal = document.getElementById("checkout-modal");
            if (checkoutModal && checkoutModal.classList.contains("active")) {
                e.preventDefault();
                confirmCheckout();
            }
        }

        // F3 -> Switch to Dashboard
        if (e.key === "F3") { e.preventDefault(); switchView("dashboard"); showToast("تم الانتقال إلى لوحة التحكم", "info"); }
        
        // F4 -> Clear cart if in POS
        if (e.key === "F4" && state.currentView === "pos") { e.preventDefault(); clearCart(); showToast("تم تفريغ السلة", "warning"); }
        
        // Escape -> Close active modals
        if (e.key === "Escape") {
            document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
        }
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.classList.remove("active");
        });
    });
}

function setupEventListeners() {
    // Toggles
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
        refreshCurrentView();
    });

    // Close Modal Buttons setup
    const closeModalBtns = [
        ["close-product-modal",  "product-modal"],
        ["cancel-product-modal", "product-modal"],
        ["close-customer-modal", "customer-modal"],
        ["cancel-customer-modal","customer-modal"],
        ["close-supplier-modal", "supplier-modal"],
        ["cancel-supplier-modal","supplier-modal"],
        ["close-purchase-modal", "purchase-modal"],
        ["cancel-purchase-modal","purchase-modal"],
        ["close-settle-modal",   "settle-modal"],
        ["cancel-settle-modal",  "settle-modal"],
        ["close-user-modal",     "user-modal"],
        ["cancel-user-modal",    "user-modal"],
        ["close-barcode-modal",  "barcode-modal"],
        ["cancel-barcode-modal", "barcode-modal"],
        ["close-category-modal", "category-modal"],
        ["close-camera-modal",   "camera-modal"],
    ];
    closeModalBtns.forEach(([btnId, modalId]) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        if (btn && modal) btn.addEventListener("click", () => modal.classList.remove("active"));
    });

    // Camera Barcode Scanner Trigger
    let html5QrcodeScanner = null;
    addListenerSafe("btn-camera-scan", "click", () => {
        const modal = document.getElementById("camera-modal");
        if (modal) modal.classList.add("active");
        if (typeof Html5Qrcode !== "undefined") {
            if (!html5QrcodeScanner) {
                html5QrcodeScanner = new Html5Qrcode("interactive");
            }
            html5QrcodeScanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 150 } },
                (decodedText) => {
                    const prod = (state.products || []).find(p => p.barcode === decodedText);
                    if (prod) {
                        addToCart(prod.id);
                        showToast(`تم مسح الباركود وإضافة "${prod.name}" للسلة`, "success");
                    } else {
                        const inp = document.getElementById("barcode-input");
                        if (inp) inp.value = decodedText;
                        showSearchSuggestions(decodedText);
                        showToast(`الباركود الممسوح: ${decodedText}`, "info");
                    }
                    if (html5QrcodeScanner) {
                        html5QrcodeScanner.stop().catch(() => {});
                    }
                    if (modal) modal.classList.remove("active");
                },
                () => {}
            ).catch(err => {
                console.warn("Camera start error:", err);
                showToast("تعذر الاتصال بـ الكاميرا، يرجى السماح بصلاحيات الكاميرا المتصفح.", "warning");
            });
        } else {
            showToast("جاري تحميل مكتبة القارئ...", "info");
        }
    });

    addListenerSafe("close-camera-modal", "click", () => {
        if (html5QrcodeScanner) {
            html5QrcodeScanner.stop().catch(() => {});
        }
    });

    // Open Modal Triggers
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
    addListenerSafe("open-shift-modal-btn", "click", () => openShiftModal());
    addListenerSafe("manage-categories-btn", "click", () => {
        renderCategoriesList();
        const modal = document.getElementById("category-modal");
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

    // Form Submits
    addListenerSafe("product-form",         "submit", handleProductFormSubmit);
    addListenerSafe("customer-form",        "submit", handleCustomerFormSubmit);
    addListenerSafe("supplier-form",        "submit", handleSupplierFormSubmit);
    addListenerSafe("purchase-form",        "submit", handlePurchaseFormSubmit);
    addListenerSafe("add-category-form",    "submit", handleCategoryFormSubmit);
    addListenerSafe("expense-form",         "submit", handleExpenseFormSubmit);
    addListenerSafe("waste-form",           "submit", handleWasteFormSubmit);
    addListenerSafe("shift-form",           "submit", handleShiftClosingSubmit);
    addListenerSafe("customer-settle-form", "submit", handleCustomerSettleFormSubmit);
    addListenerSafe("settle-form",          "submit", handleSettleFormSubmit);
    addListenerSafe("user-form",            "submit", handleUserFormSubmit);

    // POS Cart Controls
    addListenerSafe("clear-cart-btn", "click", () => { clearCart(); showToast("تم تفريغ السلة", "warning"); });
    addListenerSafe("cart-discount-input", "input", updateCartSummary);
    addListenerSafe("checkout-btn", "click", openCheckoutModal);

    // Purchase payment toggle & Bale calculator
    addListenerSafe("pur-payment", "change", () => {
        const paymentSel = document.getElementById("pur-payment");
        const wrapper = document.getElementById("pur-paid-amount-wrapper");
        if (!paymentSel || !wrapper) return;
        wrapper.style.display = paymentSel.value === "partial" ? "block" : "none";
    });

    const balePriceInp = document.getElementById("pur-bale-price");
    const baleQtyInp = document.getElementById("pur-bale-qty");
    const updateCostFromBale = () => {
        const p = parseFloat(balePriceInp?.value) || 0;
        const q = parseInt(baleQtyInp?.value) || 1;
        if (p > 0 && q > 0) {
            const costInp = document.getElementById("pur-cost");
            if (costInp) costInp.value = (p / q).toFixed(2);
        }
    };
    if (balePriceInp) balePriceInp.addEventListener("input", updateCostFromBale);
    if (baleQtyInp) baleQtyInp.addEventListener("input", updateCostFromBale);

    // Image File Reader for Paper Invoices
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

    // Filters & Searches
    addListenerSafe("supplier-search-input", "input", renderSuppliersTable);
    addListenerSafe("customer-search-input", "input", renderCustomers);
    addListenerSafe("inventory-search-input", "input", renderInventoryTable);
    addListenerSafe("inventory-category-filter", "change", renderInventoryTable);
    addListenerSafe("inventory-stock-filter", "change", renderInventoryTable);

    // Settings Submit
    const settingsForm = document.getElementById("settings-form");
    if (settingsForm) {
        settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            state.settings.storeName = document.getElementById("settings-store-name").value;
            state.settings.currency = document.getElementById("settings-currency").value;
            state.settings.taxRate = parseFloat(document.getElementById("settings-tax-rate").value) || 0;
            state.settings.lowStockLimit = parseInt(document.getElementById("settings-low-stock").value) || 10;
            saveState();
            showToast("تم حفظ الإعدادات بنجاح!", "success");
            refreshCurrentView();
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
        showToast("تم تصدير النسخة الاحتياطية", "success");
    });

    addListenerSafe("reset-data-btn", "click", () => {
        if (confirm("هل أنت متأكد من مسح كافة البيانات وإعادة تهيئة النظام؟")) {
            resetToDefault();
            showToast("تمت تهيئة النظام بالكامل", "danger");
            setTimeout(() => window.location.reload(), 1000);
        }
    });

    // Payment method radio visual selector
    document.querySelectorAll(".payment-method").forEach(method => {
        method.addEventListener("click", () => {
            document.querySelectorAll(".payment-method").forEach(m => m.classList.remove("active"));
            method.classList.add("active");
            const input = method.querySelector("input");
            if (input) input.checked = true;
        });
    });

    // Receipt modal buttons
    addListenerSafe("close-receipt-modal", "click", closeReceiptModal);
    addListenerSafe("print-receipt-btn",   "click", printReceipt);
    addListenerSafe("new-sale-btn", "click", () => {
        closeReceiptModal();
        clearCart();
        setTimeout(() => {
            const inp = document.getElementById("barcode-input");
            if (inp) inp.focus();
        }, 120);
    });

    // Barcode generator button
    addListenerSafe("gen-barcode-btn", "click", () => {
        const inp = document.getElementById("prod-barcode");
        if (inp) inp.value = "622" + Math.floor(100000 + Math.random() * 900000);
    });

    // Restore data from file
    addListenerSafe("restore-data-trigger", "click", () => {
        const inp = document.getElementById("restore-data-file");
        if (inp) inp.click();
    });
    const restoreInput = document.getElementById("restore-data-file");
    if (restoreInput) {
        restoreInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const parsed = JSON.parse(ev.target.result);
                    if (parsed.products && parsed.categories) {
                        Object.assign(state, parsed);
                        saveState();
                        showToast("تم استيراد البيانات بنجاح!", "success");
                        setTimeout(() => window.location.reload(), 1000);
                    } else {
                        showToast("ملف غير صالح! يرجى اختيار ملف نسخة احتياطية صحيح.", "danger");
                    }
                } catch (err) {
                    showToast("خطأ في قراءة الملف! تأكد من صحة التنسيق.", "danger");
                }
            };
            reader.readAsText(file);
        });
    }

    // Mobile Drawer Toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileDrawerToggle = document.getElementById("mobile-drawer-toggle");
    const closeMobileDrawerBtn = document.getElementById("close-mobile-drawer");
    const mobileDrawer = document.getElementById("mobile-drawer");

    const openMobileDrawer = () => {
        if (mobileDrawer) mobileDrawer.classList.add("active");
    };
    const closeMobileDrawerFn = () => {
        if (mobileDrawer) mobileDrawer.classList.remove("active");
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openMobileDrawer);
    if (mobileDrawerToggle) mobileDrawerToggle.addEventListener("click", openMobileDrawer);
    if (closeMobileDrawerBtn) closeMobileDrawerBtn.addEventListener("click", closeMobileDrawerFn);
    if (mobileDrawer) {
        mobileDrawer.addEventListener("click", (e) => {
            if (e.target === mobileDrawer) closeMobileDrawerFn();
        });
        // Close drawer when any link inside it is clicked
        mobileDrawer.querySelectorAll(".mobile-drawer-btn").forEach(btn => {
            btn.addEventListener("click", closeMobileDrawerFn);
        });
    }

    // Checkout Modal Event Listeners
    addListenerSafe("checkout-btn", "click", openCheckoutModal);
    addListenerSafe("confirm-checkout-btn", "click", confirmCheckout);

    const paidInputEl = document.getElementById("paid-amount-input");
    if (paidInputEl) {
        paidInputEl.addEventListener("input", () => updateCheckoutChangeDisplay());
    }

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

    // PWA Install Banner
    let deferredPrompt = null;
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const banner = document.getElementById("pwa-install-banner");
        if (banner) banner.style.display = "flex";
    });
    addListenerSafe("pwa-install-btn", "click", async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
        }
        const banner = document.getElementById("pwa-install-banner");
        if (banner) banner.style.display = "none";
    });
    addListenerSafe("pwa-close-btn", "click", () => {
        const banner = document.getElementById("pwa-install-banner");
        if (banner) banner.style.display = "none";
    });

    // Universal Close Buttons for All Modals & Backdrops
    document.querySelectorAll(".modal-overlay .btn-close, .modal-overlay .close-btn, .modal-overlay .modal-close-btn, .modal-overlay [data-close-modal]").forEach(btn => {
        btn.addEventListener("click", () => {
            const modal = btn.closest(".modal-overlay");
            if (modal) modal.classList.remove("active", "show");
        });
    });
}

// ======================== WINDOW EXPORTS & GLOBAL SCOPE BINDINGS ========================
window.state = state;
window.updateCartQty = updateCartQty;
window.addToCart = addToCart;
window.clearCart = clearCart;
window.handleCheckout = handleCheckout;
window.openCheckoutModal = openCheckoutModal;
window.confirmCheckout = confirmCheckout;
window.viewReceipt = viewReceipt;
window.closeReceiptModal = closeReceiptModal;
window.printReceipt = printReceipt;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.deleteCategory = deleteCategory;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.openCustomerModal = openCustomerModal;
window.openCustomerSettleModal = openCustomerSettleModal;
window.handleCustomerSettleFormSubmit = handleCustomerSettleFormSubmit;
window.editSupplier = editSupplier;
window.deleteSupplier = deleteSupplier;
window.openSupplierModal = openSupplierModal;
window.openSupplierHistoryModal = openSupplierHistoryModal;
window.previewImageModal = previewImageModal;
window.switchBaleMode = switchBaleMode;
window.openPurchaseModal = openPurchaseModal;
window.openSettleModal = openSettleModal;
window.handleSettleFormSubmit = handleSettleFormSubmit;
window.handlePurchaseFormSubmit = handlePurchaseFormSubmit;
window.handleExpenseFormSubmit = handleExpenseFormSubmit;
window.openExpenseModal = openExpenseModal;
window.deleteExpense = deleteExpense;
window.handleWasteFormSubmit = handleWasteFormSubmit;
window.openWasteModal = openWasteModal;
window.openShiftModal = openShiftModal;
window.handleShiftClosingSubmit = handleShiftClosingSubmit;
window.cancelTransaction = cancelTransaction;
window.showToast = showToast;
window.playBeep = playBeep;
window.switchView = switchView;
window.refreshCurrentView = refreshCurrentView;
window.openLowStockReport = openLowStockReport;
window.closeLowStockModal = closeLowStockModal;
window.openExpiryReport = openExpiryReport;
window.closeExpiryModal = closeExpiryModal;
window.printLowStockReport = printLowStockReport;
window.exportLowStockCSV = exportLowStockCSV;
window.setReportRange = setReportRange;
window.editUser = editUser;
window.deleteUser = deleteUser;

// ======================== INITIALIZATION ON DOM LOADED ========================
document.addEventListener("DOMContentLoaded", () => {
    loadState();
    initAuth();
    applyTheme();
    applyLanguage();
    setupNavigation();
    setupEventListeners();
    setupLiveTime();
    setupKeyboardShortcuts();

    onCartChange(() => {
        renderCart();
    });

    switchView(state.currentView || "dashboard");
    if (window.lucide) lucide.createIcons();
});
