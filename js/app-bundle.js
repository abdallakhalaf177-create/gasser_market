// ============================================================
// GASSER MARKET SYSTEM - BUNDLED (No ES Modules)
// Works with file:// and any simple HTTP server
// ============================================================

// ======================== CONSTANTS ========================
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
    { id: "c1", name: "أحمد محمد", phone: "01012345678", points: 150, totalSpent: 1250.00, visits: 8, registered: "2026-05-10" },
    { id: "c2", name: "سارة أحمد", phone: "01234567890", points: 45, totalSpent: 420.00, visits: 3, registered: "2026-06-18" }
];

const DEFAULT_SUPPLIERS = [
    { id: "s1", company: "شركة جهينة للصناعات الغذائية", name: "م. عصام رأفت", phone: "0238204222", balance: 12500.00, totalPurchases: 45000.00, lastUpdated: "2026-07-10" },
    { id: "s2", company: "الشركة المصرية للأغذية (بسكو مصر)", name: "أ. محمد سليم", phone: "19234", balance: 0.00, totalPurchases: 18400.00, lastUpdated: "2026-07-08" }
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
        dashboard: "لوحة التحكم", pos: "نقطة البيع (الكاشير)", inventory: "إدارة المخزون",
        reports: "المبيعات والتقارير", customers: "العملاء والولاء", suppliers: "الموردون والحسابات", settings: "الإعدادات العامة",
        searchPlaceholder: "ابحث باسم المنتج أو الباركود..."
    },
    en: {
        dashboard: "Dashboard", pos: "POS / Cashier", inventory: "Inventory",
        reports: "Sales & Reports", customers: "Customers & Loyalty", suppliers: "Suppliers & Accounts", settings: "General Settings",
        searchPlaceholder: "Search by product name or barcode..."
    }
};

// ======================== STATE ========================
let state = {
    products: [],
    categories: [],
    customers: [],
    suppliers: [],
    purchaseInvoices: [],
    transactions: [],
    cart: [],
    settings: { storeName: "جاسر ماركت", currency: "ج.م", taxRate: 14, lowStockLimit: 10 },
    currentView: "dashboard",
    language: "ar",
    theme: "dark"
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
        } catch (e) {
            resetToDefault();
        }
    } else {
        resetToDefault();
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
    state.customers = JSON.parse(JSON.stringify(DEFAULT_CUSTOMERS));
    state.suppliers = JSON.parse(JSON.stringify(DEFAULT_SUPPLIERS));
    state.purchaseInvoices = [];
    state.transactions = [];
    state.cart = [];
    state.settings = { storeName: "جاسر ماركت", currency: "ج.م", taxRate: 14, lowStockLimit: 10 };
    state.currentView = "dashboard";
    state.language = "ar";
    state.theme = "dark";
    saveState();
}

function addToCart(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;
    if (prod.stock <= 0) { showToast(state.language === "ar" ? "عذراً، هذا المنتج غير متوفر في المخزن حالياً!" : "Sorry, this product is out of stock!", "danger"); return; }
    const cartItem = state.cart.find(item => item.productId === productId);
    if (cartItem) {
        if (cartItem.qty < prod.stock) { cartItem.qty++; }
        else { showToast(state.language === "ar" ? "لا يمكن تجاوز الكمية المتاحة في المخزن!" : "Cannot exceed available stock!", "warning"); }
    } else {
        state.cart.push({ productId, qty: 1, price: prod.price });
    }
    saveState();
    notifyCartChange();
}

function updateCartQty(productId, delta) {
    const cartItem = state.cart.find(item => item.productId === productId);
    if (!cartItem) return;
    const prod = state.products.find(p => p.id === productId);
    if (delta > 0 && cartItem.qty >= prod.stock) { showToast(state.language === "ar" ? "لا يمكن تجاوز الكمية المتاحة في المخزن!" : "Cannot exceed available stock!", "warning"); return; }
    cartItem.qty += delta;
    if (cartItem.qty <= 0) state.cart = state.cart.filter(item => item.productId !== productId);
    saveState();
    notifyCartChange();
}

function clearCart() { state.cart = []; saveState(); notifyCartChange(); }

function cancelTransaction(transactionId) {
    const t = state.transactions.find(x => x.id === transactionId);
    if (!t) return;
    if (t.status === "cancelled") { showToast(state.language === "ar" ? "هذه المعاملة ملغاة بالفعل!" : "Transaction already cancelled!", "warning"); return; }
    const msg = state.language === "ar" ? `هل أنت متأكد من إلغاء الفاتورة #${transactionId}؟ سيتم إرجاع المنتجات للمخزن.` : `Cancel sale #${transactionId}? Stock will be restored.`;
    if (!confirm(msg)) return;
    t.status = "cancelled";
    t.items.forEach(item => { const prod = state.products.find(p => p.id === item.productId); if (prod) prod.stock += item.qty; });
    if (t.customerId !== "walkin") {
        const customer = state.customers.find(c => c.id === t.customerId);
        if (customer) {
            customer.points = Math.max(0, customer.points - Math.floor(t.total / 10));
            customer.totalSpent = Math.max(0, customer.totalSpent - t.total);
            customer.visits = Math.max(0, customer.visits - 1);
        }
    }
    saveState();
    showToast(state.language === "ar" ? `تم إلغاء الفاتورة #${transactionId} بنجاح` : `Invoice #${transactionId} cancelled`, "success");
    switchView(state.currentView);
}

// ======================== UI HELPERS ========================
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
    } catch (e) { }
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
    lucide.createIcons();
    if (type === 'success') playBeep(523.25, 0.08);
    else if (type === 'danger' || type === 'warning') playBeep(220, 0.22);
    setTimeout(() => { toast.style.animation = 'toastOut 0.3s forwards'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ======================== DASHBOARD ========================
let salesChartInstance = null;
let categoriesChartInstance = null;

function renderDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = state.transactions.filter(t => t.date.startsWith(today) && t.status !== "cancelled").reduce((s, t) => s + t.total, 0);
    const todayOrders = state.transactions.filter(t => t.date.startsWith(today) && t.status !== "cancelled").length;
    const lowStockCount = state.products.filter(p => p.stock <= state.settings.lowStockLimit).length;
    document.getElementById("stat-today-sales").textContent = `${todaySales.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("stat-today-orders").textContent = todayOrders;
    document.getElementById("stat-low-stock").textContent = lowStockCount;
    document.getElementById("stat-total-products").textContent = state.products.length;

    const lowStockList = document.getElementById("dashboard-low-stock-list");
    if (lowStockList) {
        lowStockList.innerHTML = "";
        const lowProds = state.products.filter(p => p.stock <= state.settings.lowStockLimit);
        if (lowProds.length === 0) {
            lowStockList.innerHTML = `<div class="empty-state"><i data-lucide="check-circle" style="color:var(--success)"></i><p>${state.language === "ar" ? "جميع المنتجات متوفرة بمخزون جيد!" : "All products are well stocked!"}</p></div>`;
        } else {
            lowProds.slice(0, 5).forEach(p => {
                const item = document.createElement("div");
                item.className = "alert-item";
                item.innerHTML = `<div class="alert-item-info"><span class="alert-item-title">${p.name}</span><span class="alert-item-desc">${state.language === "ar" ? "الكمية المتبقية:" : "Stock left:"} ${p.stock} | ${p.barcode}</span></div><span class="badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}">${p.stock === 0 ? (state.language === "ar" ? "نفذ" : "Out") : (state.language === "ar" ? "منخفض" : "Low")}</span>`;
                item.addEventListener("click", () => {
                    const purchaseModal = document.getElementById("purchase-modal");
                    if (purchaseModal) {
                        const productSelect = document.getElementById("pur-product");
                        if (productSelect) { productSelect.value = p.id; productSelect.dispatchEvent(new Event("change")); }
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
        const recentSales = state.transactions.slice(-5).reverse();
        if (recentSales.length === 0) {
            recentSalesBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">${state.language === "ar" ? "لا توجد عمليات بيع" : "No sales transactions"}</td></tr>`;
        } else {
            recentSales.forEach(t => {
                const row = document.createElement("tr");
                const custName = t.customerId === "walkin" ? (state.language === "ar" ? "عميل سفري" : "Walk-in") : (state.customers.find(c => c.id === t.customerId)?.name || t.customerId);
                const isCancelled = t.status === "cancelled";
                row.innerHTML = `
                    <td><strong>#${t.id}</strong></td>
                    <td>${t.date.replace('T', ' ').substring(0, 16)}</td>
                    <td>${custName}</td>
                    <td>${t.items.reduce((s, i) => s + i.qty, 0)}</td>
                    <td><strong ${isCancelled ? 'style="text-decoration:line-through;opacity:0.6"' : 'class="text-success"'}>${t.total.toFixed(2)} ${state.settings.currency}</strong></td>
                    <td><span class="badge badge-info">${state.language === "ar" ? (t.paymentMethod === "cash" ? "نقدي" : t.paymentMethod === "card" ? "بطاقة" : "محفظة") : t.paymentMethod}</span></td>
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
    lucide.createIcons();
}

function renderDashboardCharts() {
    if (salesChartInstance) salesChartInstance.destroy();
    if (categoriesChartInstance) categoriesChartInstance.destroy();
    const ctxSales = document.getElementById('salesChart');
    const ctxCats = document.getElementById('categoriesChart');
    if (!ctxSales || !ctxCats) return;
    const days = state.language === "ar" ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesData = [0, 0, 0, 0, 0, 0, 0];
    state.transactions.forEach(t => { if (t.status !== "cancelled") { const idx = new Date(t.date).getDay(); salesData[idx] += t.total; } });
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
    state.categories.forEach(c => catSales[c] = 0);
    state.transactions.forEach(t => { if (t.status !== "cancelled") { t.items.forEach(item => { const prod = state.products.find(p => p.id === item.productId); if (prod && catSales[prod.category] !== undefined) catSales[prod.category] += item.price * item.qty; }); } });
    const catLabels = Object.keys(catSales).map(c => c.split(' ')[0]);
    const catData = Object.values(catSales);
    categoriesChartInstance = new Chart(ctxCats, {
        type: 'doughnut',
        data: { labels: catLabels, datasets: [{ data: catData.every(v => v === 0) ? catData.map(() => 1) : catData, backgroundColor: ['#6366f1', '#06b6d4', '#8b5cf6', '#f43f5e', '#f59e0b', '#3b82f6', '#10b981'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: textColor, boxWidth: 12, font: { size: 10 } } } } }
    });
}

// ======================== POS ========================
function renderPOS() {
    renderPOSCategoryTabs();
    renderPOSProducts();
    renderPOSCustomerDropdown();
    renderCart();
    const barcodeSelect = document.getElementById("barcode-select-product");
    if (barcodeSelect) barcodeSelect.innerHTML = state.products.map(p => `<option value="${p.id}">${p.name} (${p.barcode})</option>`).join('');
    // Auto-focus the barcode scanner field for immediate scanning without mouse
    setTimeout(() => {
        const barcodeField = document.getElementById("barcode-scanner-input");
        if (barcodeField) barcodeField.focus();
    }, 150);
}

function renderPOSCategoryDropdowns() {
    // Update product category select in product modal
    const prodCatSelect = document.getElementById("prod-category");
    if (prodCatSelect) prodCatSelect.innerHTML = state.categories.map(c => `<option value="${c}">${c}</option>`).join('');

    // Update supplier datalist in product modal
    const supplierDatalist = document.getElementById("prod-supplier-list");
    if (supplierDatalist) {
        supplierDatalist.innerHTML = state.suppliers.map(s => `<option value="${s.company}">`).join('');
    }

    // Update inventory category filter dropdown
    const invCatFilter = document.getElementById("inventory-category-filter");
    if (invCatFilter) {
        const currentVal = invCatFilter.value;
        invCatFilter.innerHTML = `<option value="all">${state.language === "ar" ? "كل الفئات" : "All Categories"}</option>` + state.categories.map(c => `<option value="${c}">${c}</option>`).join('');
        invCatFilter.value = currentVal;
    }
}

function renderPOSCategoryTabs() {
    const tabsContainer = document.getElementById("pos-category-tabs");
    if (!tabsContainer) return;
    const activeTab = tabsContainer.querySelector(".category-tab.active");
    const activeCategory = activeTab ? activeTab.getAttribute("data-category") : "all";
    tabsContainer.innerHTML = `<button class="category-tab ${activeCategory === 'all' ? 'active' : ''}" data-category="all">${state.language === "ar" ? "الكل" : "All"}</button>`;
    state.categories.forEach(c => {
        const cleanName = state.language === "ar" ? c.split(' ')[0] : (c.includes('(') ? c.split('(')[1].replace(')', '') : c);
        const tab = document.createElement("button");
        tab.className = `category-tab ${activeCategory === c ? 'active' : ''}`;
        tab.setAttribute("data-category", c);
        tab.textContent = cleanName;
        tab.addEventListener("click", () => { tabsContainer.querySelectorAll(".category-tab").forEach(t => t.classList.remove("active")); tab.classList.add("active"); renderPOSProducts(); });
        tabsContainer.appendChild(tab);
    });
}

function renderPOSProducts() {
    const grid = document.getElementById("pos-products-grid");
    if (!grid) return;
    grid.innerHTML = "";
    const searchQuery = (document.getElementById("pos-search-input")?.value || "").toLowerCase();
    const activeTab = document.querySelector("#pos-category-tabs .category-tab.active");
    const activeCategory = activeTab ? activeTab.getAttribute("data-category") : "all";
    const filtered = state.products.filter(p => (p.name.toLowerCase().includes(searchQuery) || p.barcode.includes(searchQuery)) && (activeCategory === "all" || p.category === activeCategory));
    if (filtered.length === 0) { grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i data-lucide="package-x"></i><p>${state.language === "ar" ? "لا توجد منتجات مطابقة" : "No matching products"}</p></div>`; lucide.createIcons(); return; }
    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        if (p.stock === 0) card.style.opacity = "0.6";
        let badgeHtml = "";
        if (p.stock === 0) badgeHtml = `<span class="badge badge-danger product-card-badge">${state.language === "ar" ? "نفذ" : "Out"}</span>`;
        else if (p.stock <= state.settings.lowStockLimit) badgeHtml = `<span class="badge badge-warning product-card-badge">${state.language === "ar" ? "منخفض" : "Low"}</span>`;
        card.innerHTML = `${badgeHtml}<div class="product-card-image">${p.image ? `<img src="${p.image}" alt="${p.name}">` : `<i data-lucide="package"></i>`}</div><span class="product-card-name">${p.name}</span><span class="product-card-price">${p.price.toFixed(2)} ${state.settings.currency}</span><span class="product-card-stock">${state.language === "ar" ? "المخزون:" : "Stock:"} ${p.stock}</span>`;
        card.addEventListener("click", () => { if (p.stock > 0) addToCart(p.id); else showToast(state.language === "ar" ? "هذا المنتج غير متوفر حالياً!" : "Out of stock!", "danger"); });
        grid.appendChild(card);
    });
    lucide.createIcons();
}

function renderPOSCustomerDropdown() {
    const select = document.getElementById("cart-customer-select");
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = `<option value="walkin">${state.language === "ar" ? "عميل سفري (نقدي)" : "Walk-in Customer"}</option>` + state.customers.map(c => `<option value="${c.id}">${c.name} (${c.phone})</option>`).join('');
    select.value = currentVal;
}

function renderCart() {
    const container = document.getElementById("cart-items-container");
    if (!container) return;
    container.innerHTML = "";
    if (state.cart.length === 0) {
        container.innerHTML = `<div class="empty-cart-state"><i data-lucide="shopping-cart"></i><p>${state.language === "ar" ? "السلة فارغة. اضغط على المنتجات لإضافتها." : "Cart is empty. Click products to add them."}</p></div>`;
        updateCartSummary(); lucide.createIcons(); return;
    }
    state.cart.forEach(item => {
        const prod = state.products.find(p => p.id === item.productId);
        if (!prod) return;
        const el = document.createElement("div");
        el.className = "cart-item";
        el.innerHTML = `<div class="cart-item-details"><div class="cart-item-name">${prod.name}</div><div class="cart-item-price">${prod.price.toFixed(2)} ${state.settings.currency}</div></div><div class="cart-item-qty"><button class="qty-btn" onclick="updateCartQty('${prod.id}',-1)">-</button><span class="qty-val">${item.qty}</span><button class="qty-btn" onclick="updateCartQty('${prod.id}',1)">+</button></div><div class="cart-item-total">${(prod.price * item.qty).toFixed(2)} ${state.settings.currency}</div>`;
        container.appendChild(el);
    });
    updateCartSummary(); lucide.createIcons();
}

function updateCartSummary() {
    let subtotal = 0;
    state.cart.forEach(item => { subtotal += item.price * item.qty; });
    const discountPercent = parseFloat(document.getElementById("cart-discount-input")?.value) || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (state.settings.taxRate / 100);
    const total = taxableAmount + taxAmount;
    const st = document.getElementById("cart-subtotal"); if (st) st.textContent = `${subtotal.toFixed(2)} ${state.settings.currency}`;
    const tx = document.getElementById("cart-tax"); if (tx) tx.textContent = `${taxAmount.toFixed(2)} ${state.settings.currency}`;
    const tt = document.getElementById("cart-total"); if (tt) tt.textContent = `${total.toFixed(2)} ${state.settings.currency}`;
}

function handleCheckout() {
    if (state.cart.length === 0) { showToast(state.language === "ar" ? "السلة فارغة!" : "Cart is empty!", "danger"); return; }
    const customerId = document.getElementById("cart-customer-select").value;
    const discountPercent = parseFloat(document.getElementById("cart-discount-input").value) || 0;
    const paymentMethodEl = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : "cash";
    let subtotal = 0, totalCost = 0;
    state.cart.forEach(item => {
        subtotal += item.price * item.qty;
        const prod = state.products.find(p => p.id === item.productId);
        if (prod) totalCost += prod.cost * item.qty;
    });
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (state.settings.taxRate / 100);
    const finalTotal = taxableAmount + taxAmount;
    const profit = finalTotal - totalCost;
    const transactionId = (1000 + state.transactions.length + 1).toString();
    const transaction = { id: transactionId, date: new Date().toISOString(), customerId, items: [...state.cart], subtotal, discount: discountAmount, tax: taxAmount, total: finalTotal, profit, paymentMethod };
    state.cart.forEach(item => { const prod = state.products.find(p => p.id === item.productId); if (prod) prod.stock -= item.qty; });
    if (customerId !== "walkin") {
        const customer = state.customers.find(c => c.id === customerId);
        if (customer) { customer.points += Math.floor(finalTotal / 10); customer.totalSpent += finalTotal; customer.visits++; }
    }
    state.transactions.push(transaction);
    saveState();
    clearCart();
    showReceipt(transaction);
}

function showReceipt(t) {
    const modal = document.getElementById("receipt-modal");
    if (!modal) return;
    document.getElementById("receipt-store-name").textContent = state.settings.storeName;
    document.getElementById("receipt-id").textContent = `#${t.id}`;
    document.getElementById("receipt-date").textContent = t.date.replace('T', ' ').substring(0, 16);
    const custName = t.customerId === "walkin" ? (state.language === "ar" ? "عميل سفري" : "Walk-in") : (state.customers.find(c => c.id === t.customerId)?.name || t.customerId);
    document.getElementById("receipt-customer").textContent = custName;
    const itemsBody = document.getElementById("receipt-items-body");
    itemsBody.innerHTML = "";
    t.items.forEach(item => {
        const prod = state.products.find(p => p.id === item.productId);
        const row = document.createElement("tr");
        row.innerHTML = `<td>${prod ? prod.name : "منتج غير معروف"}</td><td>${item.qty}</td><td>${item.price.toFixed(2)}</td><td>${(item.price * item.qty).toFixed(2)}</td>`;
        itemsBody.appendChild(row);
    });
    document.getElementById("receipt-subtotal").textContent = `${t.subtotal.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("receipt-discount").textContent = `${t.discount.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("receipt-tax").textContent = `${t.tax.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("receipt-total").textContent = `${t.total.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("receipt-barcode-text").textContent = `TXN-${t.id}`;
    modal.classList.add("active");
    lucide.createIcons();
}

function viewReceipt(txnId) { const t = state.transactions.find(x => x.id === txnId); if (t) showReceipt(t); }

// ======================== INVENTORY ========================
function renderInventory() { renderPOSCategoryDropdowns(); renderInventoryTable(); }

function isExpired(dateStr) { if (!dateStr) return false; return new Date(dateStr) < new Date(); }

function renderInventoryTable() {
    const tbody = document.getElementById("inventory-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    const searchQuery = (document.getElementById("inventory-search-input")?.value || "").toLowerCase();
    const catFilter = document.getElementById("inventory-category-filter")?.value || "all";
    const stockFilter = document.getElementById("inventory-stock-filter")?.value || "all";
    const filtered = state.products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.barcode.includes(searchQuery) || p.category.toLowerCase().includes(searchQuery);
        const matchesCat = catFilter === "all" || p.category === catFilter;
        let matchesStock = true;
        if (stockFilter === "instock") matchesStock = p.stock > state.settings.lowStockLimit;
        else if (stockFilter === "lowstock") matchesStock = p.stock > 0 && p.stock <= state.settings.lowStockLimit;
        else if (stockFilter === "outstock") matchesStock = p.stock === 0;
        return matchesSearch && matchesCat && matchesStock;
    });
    if (filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--text-muted)">${state.language === "ar" ? "لا توجد منتجات مطابقة" : "No matching products"}</td></tr>`; return; }
    // Critical stock threshold - مستوى المخزون الحرج
    const CRITICAL_THRESHOLD = 5;

    filtered.forEach(p => {
        const row = document.createElement("tr");

        // --- Determine stock level and apply row class + badge class ---
        let stockBadge = `<span class="badge badge-success">${state.language === "ar" ? "متوفر" : "In Stock"}</span>`;
        let stockQtyClass = 'qty-good'; // CSS badge class

        if (p.stock === 0) {
            // No stock at all
            stockBadge = `<span class="badge badge-danger">${state.language === "ar" ? "نفذ" : "Out of Stock"}</span>`;
            stockQtyClass = 'qty-out';
            row.classList.add('stock-out');
        } else if (p.stock <= CRITICAL_THRESHOLD) {
            // Critical: 1–5 items — Red, blinking
            stockBadge = `<span class="badge badge-danger">${state.language === "ar" ? "حرج!" : "Critical!"}</span>`;
            stockQtyClass = 'qty-critical';
            row.classList.add('stock-critical');
        } else if (p.stock <= state.settings.lowStockLimit) {
            // Warning: 6–lowStockLimit items — Yellow
            stockBadge = `<span class="badge badge-warning">${state.language === "ar" ? "منخفض" : "Low Stock"}</span>`;
            stockQtyClass = 'qty-warning';
            row.classList.add('stock-warning');
        }

        const profit = p.price - p.cost;
        // Stock quantity with visual badge; show warning emoji for critical
        const stockQtyDisplay = `<span class="stock-qty-badge ${stockQtyClass}">${p.stock === 0 ? '⛔ 0' : p.stock <= CRITICAL_THRESHOLD ? '⚠️ ' + p.stock : p.stock}</span>`;
        // Supplier display
        const supplierDisplay = p.supplier ? `<span style="font-size:0.82rem;color:var(--text-secondary)">${p.supplier}</span>` : `<span style="color:var(--text-muted);font-size:0.78rem">—</span>`;

        row.innerHTML = `<td><code>${p.barcode}</code></td><td><strong>${p.name}</strong></td><td><span class="badge badge-info">${p.category.split(' ')[0]}</span></td><td>${p.cost.toFixed(2)} ${state.settings.currency}</td><td>${p.price.toFixed(2)} ${state.settings.currency}</td><td class="text-success">+${profit.toFixed(2)} ${state.settings.currency}</td><td class="stock-qty-cell">${stockQtyDisplay}</td><td>${supplierDisplay}</td><td><span class="${isExpired(p.expiry) ? 'text-danger' : ''}">${p.expiry || '-'}</span></td><td>${stockBadge}</td><td><div style="display:flex;gap:4px"><button class="btn btn-secondary btn-sm" onclick="editProduct('${p.id}')"><i data-lucide="edit-3" style="width:14px;height:14px"></i></button><button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button></div></td>`;
        tbody.appendChild(row);
    });
    // Also render mobile card view (shown on ≤768px via CSS, hidden on desktop)
    renderMobileInventoryCards(filteredProducts);
    lucide.createIcons();
}

function handleProductFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("product-id").value;
    const barcode = document.getElementById("prod-barcode").value;
    const name = document.getElementById("prod-name").value;
    const category = document.getElementById("prod-category").value;
    const supplier = (document.getElementById("prod-supplier")?.value || "").trim();
    const cost = parseFloat(document.getElementById("prod-cost").value);
    const price = parseFloat(document.getElementById("prod-price").value);
    const stock = parseInt(document.getElementById("prod-stock").value);
    const expiry = document.getElementById("prod-expiry").value;
    const image = document.getElementById("prod-image").value;
    if (id) { const idx = state.products.findIndex(p => p.id === id); if (idx !== -1) state.products[idx] = { id, barcode, name, category, supplier, cost, price, stock, expiry, image }; }
    else { const newId = (Math.max(0, ...state.products.map(p => parseInt(p.id) || 0)) + 1).toString(); state.products.push({ id: newId, barcode, name, category, supplier, cost, price, stock, expiry, image }); }
    saveState();
    document.getElementById("product-modal").classList.remove("active");
    document.getElementById("product-form").reset();
    document.getElementById("product-id").value = "";
    renderInventory();
    updateSidebarShortagesBadge();
    showToast(state.language === "ar" ? "تم حفظ المنتج بنجاح!" : "Product saved!", "success");
}

function editProduct(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    document.getElementById("product-id").value = p.id;
    document.getElementById("prod-barcode").value = p.barcode;
    document.getElementById("prod-name").value = p.name;
    document.getElementById("prod-category").value = p.category;
    const supplierField = document.getElementById("prod-supplier");
    if (supplierField) supplierField.value = p.supplier || '';
    document.getElementById("prod-cost").value = p.cost;
    document.getElementById("prod-price").value = p.price;
    document.getElementById("prod-stock").value = p.stock;
    document.getElementById("prod-expiry").value = p.expiry;
    document.getElementById("prod-image").value = p.image;
    document.getElementById("product-modal-title").textContent = state.language === "ar" ? "تعديل المنتج" : "Edit Product";
    document.getElementById("product-modal").classList.add("active");
}

function deleteProduct(id) {
    if (confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا المنتج؟" : "Delete this product?")) {
        state.products = state.products.filter(p => p.id !== id);
        saveState(); renderInventory();
        showToast(state.language === "ar" ? "تم حذف المنتج" : "Product deleted", "warning");
    }
}

// ======================== SHORTAGES ========================
// نظام قائمة النواقص التلقائي مصنفاً حسب التاجر

/** Updates the sidebar badge showing number of shortage products */
function updateSidebarShortagesBadge() {
    const badge = document.getElementById("sidebar-shortage-badge");
    if (!badge) return;
    const count = state.products.filter(p => p.stock <= state.settings.lowStockLimit).length;
    if (count > 0) {
        badge.textContent = count > 99 ? "99+" : count;
        badge.classList.add("visible");
    } else {
        badge.textContent = "";
        badge.classList.remove("visible");
    }
}

/** Main render function for the shortages view */
function renderShortages() {
    const THRESHOLD = state.settings.lowStockLimit;   // products at or below this are "shortage"
    const TARGET_STOCK = Math.max(50, THRESHOLD * 5); // suggested restock target
    const UNKNOWN_LABEL = state.language === "ar" ? "غير محدد (بدون تاجر)" : "Unassigned Supplier";

    // Filter shortage products
    const shortageProducts = state.products.filter(p => p.stock <= THRESHOLD);
    const zeroProducts    = shortageProducts.filter(p => p.stock === 0);

    // Update stat cards
    const statCount = document.getElementById("shortage-stat-count");
    const statSups  = document.getElementById("shortage-stat-suppliers");
    const statZero  = document.getElementById("shortage-stat-zero");
    if (statCount) statCount.textContent = shortageProducts.length;
    if (statZero)  statZero.textContent  = zeroProducts.length;

    // Group by supplier name
    const bySupplier = {};
    shortageProducts.forEach(p => {
        const key = (p.supplier && p.supplier.trim()) ? p.supplier.trim() : UNKNOWN_LABEL;
        if (!bySupplier[key]) bySupplier[key] = [];
        bySupplier[key].push(p);
    });

    if (statSups) statSups.textContent = Object.keys(bySupplier).length;

    const content = document.getElementById("shortages-content");
    if (!content) return;
    content.innerHTML = "";

    // Empty state
    if (shortageProducts.length === 0) {
        content.innerHTML = `
            <div class="empty-state" style="padding:48px">
                <i data-lucide="check-circle" style="color:var(--success);width:48px;height:48px"></i>
                <p style="font-size:1.1rem;margin-top:12px">${state.language === "ar" ? "جميع المنتجات متوفرة بمخزون كافٍ!" : "All products are well stocked!"}</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    // Render one card per supplier
    Object.entries(bySupplier).forEach(([supplierName, products]) => {
        const isUnknown = supplierName === UNKNOWN_LABEL;
        // Match supplier in state for the settle button
        const sup = state.suppliers.find(s => s.company === supplierName);

        // Build table rows
        const rowsHtml = products.map(p => {
            const suggested = Math.max(10, TARGET_STOCK - p.stock);
            const qtyClass  = p.stock === 0 ? 'qty-out' : p.stock <= 5 ? 'qty-critical' : 'qty-warning';
            const emoji     = p.stock === 0 ? '⛔' : p.stock <= 5 ? '⚠️' : '📦';
            return `
                <tr>
                    <td><strong>${p.name}</strong><br><code style="font-size:0.75rem;color:var(--text-muted)">${p.barcode}</code></td>
                    <td><span class="stock-qty-badge ${qtyClass}">${emoji} ${p.stock}</span></td>
                    <td><span class="badge badge-info">${THRESHOLD}</span></td>
                    <td><span class="suggested-qty">${suggested}</span></td>
                    <td style="font-size:0.85rem;color:var(--text-muted)">${p.price.toFixed(2)} ${state.settings.currency}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="editProduct('${p.id}')">
                            <i data-lucide="edit-3" style="width:13px;height:13px"></i>
                        </button>
                    </td>
                </tr>`;
        }).join('');

        const section = document.createElement("div");
        section.className = `shortage-supplier-section${isUnknown ? ' unknown-supplier' : ''}`;
        section.innerHTML = `
            <div class="shortage-supplier-header">
                <div class="shortage-supplier-info">
                    <div class="shortage-supplier-icon">
                        <i data-lucide="${isUnknown ? 'help-circle' : 'building-2'}"></i>
                    </div>
                    <div>
                        <span class="shortage-supplier-name">${supplierName}</span>
                        <span class="shortage-supplier-meta">
                            ${products.length} ${state.language === "ar" ? "منتج ناقص" : "shortage item(s)"} &nbsp;•&nbsp;
                            ${products.filter(p => p.stock === 0).length} ${state.language === "ar" ? "نفذ تماماً" : "out of stock"}
                        </span>
                    </div>
                </div>
                <div class="shortage-supplier-actions">
                    ${sup ? `<button class="btn btn-secondary btn-sm" onclick="openSettleModal('${sup.id}')" title="حسابات"><i data-lucide="wallet" style="width:14px;height:14px"></i></button>` : ''}
                    <button class="btn-export-shortage" onclick="exportSupplierShortages('${supplierName.replace(/'/g, "\\'")}')"
                        title="${state.language === "ar" ? "تصدير قائمة النواقص" : "Export shortage list"}">
                        <i data-lucide="share-2"></i>
                        ${state.language === "ar" ? "تصدير القائمة" : "Export List"}
                    </button>
                </div>
            </div>
            <div class="shortage-table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            <th>${state.language === "ar" ? "المنتج" : "Product"}</th>
                            <th>${state.language === "ar" ? "المتاح حالياً" : "Current Stock"}</th>
                            <th>${state.language === "ar" ? "حد التحذير" : "Threshold"}</th>
                            <th>${state.language === "ar" ? "الكمية المقترحة" : "Suggested Qty"}</th>
                            <th>${state.language === "ar" ? "سعر البيع" : "Price"}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>`;
        content.appendChild(section);
    });

    lucide.createIcons();
}

/** Export a single supplier's shortage list as a downloadable text file */
function exportSupplierShortages(supplierName) {
    const THRESHOLD  = state.settings.lowStockLimit;
    const TARGET     = Math.max(50, THRESHOLD * 5);
    const UNKNOWN    = state.language === "ar" ? "غير محدد" : "Unassigned";
    const products   = state.products.filter(p =>
        p.stock <= THRESHOLD &&
        ((p.supplier && p.supplier.trim() === supplierName) ||
         (!p.supplier && supplierName === UNKNOWN) ||
         (supplierName === UNKNOWN && !p.supplier?.trim()))
    );
    if (products.length === 0) { showToast(state.language === "ar" ? "لا توجد نواقص لهذا التاجر!" : "No shortages for this supplier!", "warning"); return; }

    const date = new Date().toLocaleDateString(state.language === "ar" ? "ar-EG" : "en-US");
    let txt = `╔${"═".repeat(50)}╗\n`;
    txt += `║  ${state.language === "ar" ? "قائمة نواقص المخزون" : "SHORTAGE ORDER LIST"}  \n`;
    txt += `║  ${state.settings.storeName}\n`;
    txt += `║  ${state.language === "ar" ? "التاريخ" : "Date"}: ${date}\n`;
    txt += `║  ${state.language === "ar" ? "التاجر / المورد" : "Supplier"}: ${supplierName}\n`;
    txt += `╚${"═".repeat(50)}╝\n\n`;
    products.forEach((p, i) => {
        const suggested = Math.max(10, TARGET - p.stock);
        txt += `${i + 1}. ${p.name}\n`;
        txt += `   ${state.language === "ar" ? "باركود" : "Barcode"}: ${p.barcode}\n`;
        txt += `   ${state.language === "ar" ? "المتاح حالياً" : "In stock"}: ${p.stock} ${state.language === "ar" ? "قطعة" : "pcs"}\n`;
        txt += `   ${state.language === "ar" ? "الكمية المطلوبة" : "Order qty"}: ${suggested} ${state.language === "ar" ? "قطعة" : "pcs"}\n\n`;
    });
    txt += `${"─".repeat(50)}\n${state.language === "ar" ? "إجمالي الأصناف" : "Total items"}: ${products.length}\n`;

    // Copy to clipboard
    if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(() => {});

    // Download as .txt file
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `نواقص_${supplierName}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showToast(state.language === "ar" ? `تم تصدير قائمة ${supplierName}` : `Exported list for ${supplierName}`, "success");
}

/** Export all suppliers' shortage lists at once */
function exportAllShortages() {
    const THRESHOLD = state.settings.lowStockLimit;
    const shortages = state.products.filter(p => p.stock <= THRESHOLD);
    if (shortages.length === 0) { showToast(state.language === "ar" ? "لا توجد نواقص!" : "No shortages!", "success"); return; }
    // Collect unique supplier names
    const names = [...new Set(shortages.map(p => (p.supplier?.trim() || (state.language === "ar" ? "غير محدد" : "Unassigned"))))];
    names.forEach((name, i) => setTimeout(() => exportSupplierShortages(name), i * 300));
    showToast(state.language === "ar" ? `جاري تصدير ${names.length} قائمة...` : `Exporting ${names.length} list(s)...`, "info");
}

// ======================== CATEGORIES ========================
function handleCategoryFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("new-cat-name").value.trim();
    if (name && !state.categories.includes(name)) {
        state.categories.push(name);
        saveState();
        document.getElementById("new-cat-name").value = "";
        renderCategoriesList();
        renderPOSCategoryDropdowns();
        showToast(state.language === "ar" ? "تمت إضافة الفئة بنجاح!" : "Category added!", "success");
    }
}

function renderCategoriesList() {
    const ul = document.getElementById("categories-list-ul");
    if (!ul) return;
    ul.innerHTML = "";
    state.categories.forEach(c => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${c}</span><button class="btn btn-icon text-danger btn-sm" onclick="deleteCategory('${c.replace(/'/g, "\\'")}')"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>`;
        ul.appendChild(li);
    });
    lucide.createIcons();
}

function deleteCategory(catName) {
    if (confirm(state.language === "ar" ? `هل أنت متأكد من حذف فئة "${catName}"؟` : `Delete category "${catName}"?`)) {
        state.categories = state.categories.filter(c => c !== catName);
        saveState(); renderCategoriesList(); renderPOSCategoryDropdowns();
    }
}

// ======================== REPORTS ========================
function renderReports() {
    const rangeBtn = document.querySelector(".reports-toolbar .btn-outline.active");
    const range = rangeBtn ? rangeBtn.getAttribute("data-range") : "today";
    renderReportsData(range);
}

function renderReportsData(range) {
    const now = new Date();
    let filteredTxns = [...state.transactions];
    if (range === "today") { const todayStr = now.toISOString().split('T')[0]; filteredTxns = state.transactions.filter(t => t.date.startsWith(todayStr)); }
    else if (range === "week") { const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); filteredTxns = state.transactions.filter(t => new Date(t.date) >= oneWeekAgo); }
    else if (range === "month") { const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); filteredTxns = state.transactions.filter(t => new Date(t.date) >= oneMonthAgo); }
    const validTxns = filteredTxns.filter(t => t.status !== "cancelled");
    const totalSales = validTxns.reduce((s, t) => s + t.total, 0);
    const totalProfit = validTxns.reduce((s, t) => s + t.profit, 0);
    const totalOrders = validTxns.length;
    const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
    document.getElementById("report-total-sales").textContent = `${totalSales.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("report-total-profit").textContent = `${totalProfit.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("report-total-orders").textContent = totalOrders;
    document.getElementById("report-avg-order").textContent = `${avgOrder.toFixed(2)} ${state.settings.currency}`;
    const tbody = document.getElementById("reports-sales-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (filteredTxns.length === 0) { tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--text-muted)">${state.language === "ar" ? "لا توجد مبيعات في هذه الفترة" : "No sales in this period"}</td></tr>`; return; }
    [...filteredTxns].reverse().forEach(t => {
        const row = document.createElement("tr");
        const custName = t.customerId === "walkin" ? (state.language === "ar" ? "عميل سفري" : "Walk-in") : (state.customers.find(c => c.id === t.customerId)?.name || t.customerId);
        const isCancelled = t.status === "cancelled";
        row.innerHTML = `<td ${isCancelled ? 'style="opacity:0.65"' : ''}><strong>#${t.id}</strong></td><td ${isCancelled ? 'style="opacity:0.65"' : ''}>${t.date.replace('T', ' ').substring(0, 16)}</td><td ${isCancelled ? 'style="opacity:0.65"' : ''}>${custName}</td><td>${isCancelled ? `<span class="badge badge-danger">${state.language === "ar" ? "ملغاة" : "Cancelled"}</span>` : `<span class="badge badge-info">${state.language === "ar" ? (t.paymentMethod === "cash" ? "نقدي" : t.paymentMethod === "card" ? "بطاقة" : "محفظة") : t.paymentMethod}</span>`}</td><td ${isCancelled ? 'style="opacity:0.65"' : ''}>${t.subtotal.toFixed(2)} ${state.settings.currency}</td><td ${isCancelled ? 'style="opacity:0.65"' : ''}>${t.discount.toFixed(2)} ${state.settings.currency}</td><td ${isCancelled ? 'style="opacity:0.65"' : ''}>${t.tax.toFixed(2)} ${state.settings.currency}</td><td><strong ${isCancelled ? 'style="text-decoration:line-through;opacity:0.6"' : 'class="text-success"'}>${t.total.toFixed(2)} ${state.settings.currency}</strong></td><td><strong ${isCancelled ? 'style="text-decoration:line-through;opacity:0.6"' : 'class="text-success"'}>+${t.profit.toFixed(2)} ${state.settings.currency}</strong></td><td><div style="display:flex;gap:4px"><button class="btn btn-secondary btn-sm" onclick="viewReceipt('${t.id}')"><i data-lucide="eye" style="width:14px;height:14px"></i></button>${!isCancelled ? `<button class="btn btn-danger btn-sm" onclick="cancelTransaction('${t.id}')"><i data-lucide="x" style="width:14px;height:14px"></i></button>` : ""}</div></td>`;
        tbody.appendChild(row);
    });
    lucide.createIcons();
}

// ======================== CUSTOMERS ========================
function renderCustomers() {
    const tbody = document.getElementById("customers-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    const searchQuery = (document.getElementById("customer-search-input")?.value || "").toLowerCase();
    const filtered = state.customers.filter(c => c.name.toLowerCase().includes(searchQuery) || c.phone.includes(searchQuery));
    if (filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">${state.language === "ar" ? "لا يوجد عملاء مطابقين" : "No matching customers"}</td></tr>`; return; }
    filtered.forEach(c => {
        const row = document.createElement("tr");
        row.innerHTML = `<td><strong>${c.name}</strong></td><td><code>${c.phone}</code></td><td><span class="badge badge-success">${c.points} ${state.language === "ar" ? "نقطة" : "pts"}</span></td><td>${c.totalSpent.toFixed(2)} ${state.settings.currency}</td><td>${c.visits}</td><td>${c.registered}</td><td><div style="display:flex;gap:4px"><button class="btn btn-secondary btn-sm" onclick="editCustomer('${c.id}')"><i data-lucide="edit-3" style="width:14px;height:14px"></i></button><button class="btn btn-danger btn-sm" onclick="deleteCustomer('${c.id}')"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button></div></td>`;
        tbody.appendChild(row);
    });
    lucide.createIcons();
}

function handleCustomerFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("customer-id").value;
    const name = document.getElementById("cust-name").value;
    const phone = document.getElementById("cust-phone").value;
    const points = parseInt(document.getElementById("cust-points").value) || 0;
    if (id) { const idx = state.customers.findIndex(c => c.id === id); if (idx !== -1) state.customers[idx] = { ...state.customers[idx], name, phone, points }; }
    else { const newId = "c" + (Math.max(0, ...state.customers.map(c => parseInt(c.id.substring(1)) || 0)) + 1); state.customers.push({ id: newId, name, phone, points, totalSpent: 0, visits: 0, registered: new Date().toISOString().split('T')[0] }); }
    saveState();
    document.getElementById("customer-modal").classList.remove("active");
    document.getElementById("customer-form").reset();
    document.getElementById("customer-id").value = "";
    if (state.currentView === "customers") renderCustomers();
    else if (state.currentView === "pos") renderPOS();
    showToast(state.language === "ar" ? "تم حفظ بيانات العميل بنجاح!" : "Customer saved!", "success");
}

function editCustomer(id) {
    const c = state.customers.find(x => x.id === id);
    if (!c) return;
    document.getElementById("customer-id").value = c.id;
    document.getElementById("cust-name").value = c.name;
    document.getElementById("cust-phone").value = c.phone;
    document.getElementById("cust-points").value = c.points;
    document.getElementById("customer-modal-title").textContent = state.language === "ar" ? "تعديل بيانات العميل" : "Edit Customer";
    document.getElementById("customer-modal").classList.add("active");
}

function deleteCustomer(id) {
    if (confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا العميل؟" : "Delete this customer?")) {
        state.customers = state.customers.filter(c => c.id !== id);
        saveState(); renderCustomers();
        showToast(state.language === "ar" ? "تم حذف العميل" : "Customer deleted", "warning");
    }
}

// ======================== SUPPLIERS ========================
function renderSuppliers() {
    const purSupplierSelect = document.getElementById("pur-supplier");
    const purProductSelect = document.getElementById("pur-product");
    if (purSupplierSelect) purSupplierSelect.innerHTML = state.suppliers.map(s => `<option value="${s.id}">${s.company}</option>`).join('');
    if (purProductSelect) {
        purProductSelect.innerHTML = state.products.map(p => `<option value="${p.id}">${p.name} (${p.barcode})</option>`).join('');
        const newProductSelect = purProductSelect.cloneNode(true);
        purProductSelect.parentNode.replaceChild(newProductSelect, purProductSelect);
        newProductSelect.addEventListener("change", () => { const p = state.products.find(x => x.id === newProductSelect.value); if (p) document.getElementById("pur-cost").value = p.cost; });
        const p = state.products.find(x => x.id === newProductSelect.value);
        if (p) document.getElementById("pur-cost").value = p.cost;
    }
    const totalBalance = state.suppliers.reduce((s, sup) => s + sup.balance, 0);
    document.getElementById("sup-stat-total").textContent = state.suppliers.length;
    document.getElementById("sup-stat-balance").textContent = `${totalBalance.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("sup-stat-purchases").textContent = (state.purchaseInvoices || []).length;
    renderSuppliersTable();
}

function renderSuppliersTable() {
    const tbody = document.getElementById("suppliers-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    const searchQuery = (document.getElementById("supplier-search-input")?.value || "").toLowerCase();
    const filtered = state.suppliers.filter(s => s.company.toLowerCase().includes(searchQuery) || s.phone.includes(searchQuery) || (s.name && s.name.toLowerCase().includes(searchQuery)));
    if (filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">${state.language === "ar" ? "لا يوجد موردين مطابقين" : "No matching suppliers"}</td></tr>`; return; }
    filtered.forEach(s => {
        const row = document.createElement("tr");
        row.innerHTML = `<td><strong>${s.company}</strong></td><td>${s.name || '-'}</td><td><code>${s.phone}</code></td><td><strong class="${s.balance > 0 ? 'text-danger' : 'text-success'}">${s.balance.toFixed(2)} ${state.settings.currency}</strong></td><td>${s.totalPurchases.toFixed(2)} ${state.settings.currency}</td><td>${s.lastUpdated || '-'}</td><td><div style="display:flex;gap:4px"><button class="btn btn-secondary btn-sm" onclick="editSupplier('${s.id}')"><i data-lucide="edit-3" style="width:14px;height:14px"></i></button><button class="btn btn-success btn-sm" onclick="openSettleModal('${s.id}')" ${s.balance <= 0 ? 'disabled' : ''}><i data-lucide="wallet" style="width:14px;height:14px"></i></button><button class="btn btn-danger btn-sm" onclick="deleteSupplier('${s.id}')"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button></div></td>`;
        tbody.appendChild(row);
    });
    lucide.createIcons();
}

function handleSupplierFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("supplier-id").value;
    const company = document.getElementById("sup-company").value;
    const name = document.getElementById("sup-name").value;
    const phone = document.getElementById("sup-phone").value;
    const balance = parseFloat(document.getElementById("sup-balance").value) || 0;
    if (id) { const idx = state.suppliers.findIndex(s => s.id === id); if (idx !== -1) { state.suppliers[idx].company = company; state.suppliers[idx].name = name; state.suppliers[idx].phone = phone; state.suppliers[idx].balance = balance; state.suppliers[idx].lastUpdated = new Date().toISOString().split('T')[0]; } }
    else { const newId = "s" + (Math.max(0, ...state.suppliers.map(s => parseInt(s.id.substring(1)) || 0)) + 1); state.suppliers.push({ id: newId, company, name, phone, balance, totalPurchases: 0, lastUpdated: new Date().toISOString().split('T')[0] }); }
    saveState();
    document.getElementById("supplier-modal").classList.remove("active");
    document.getElementById("supplier-form").reset();
    document.getElementById("supplier-id").value = "";
    renderSuppliers();
    showToast(state.language === "ar" ? "تم حفظ بيانات المورد بنجاح!" : "Supplier saved!", "success");
}

function editSupplier(id) {
    const s = state.suppliers.find(x => x.id === id);
    if (!s) return;
    document.getElementById("supplier-id").value = s.id;
    document.getElementById("sup-company").value = s.company;
    document.getElementById("sup-name").value = s.name || '';
    document.getElementById("sup-phone").value = s.phone;
    document.getElementById("sup-balance").value = s.balance;
    document.getElementById("supplier-modal-title").textContent = state.language === "ar" ? "تعديل بيانات المورد" : "Edit Supplier";
    document.getElementById("supplier-modal").classList.add("active");
}

function deleteSupplier(id) {
    if (confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا المورد؟" : "Delete this supplier?")) {
        state.suppliers = state.suppliers.filter(s => s.id !== id);
        saveState(); renderSuppliers();
        showToast(state.language === "ar" ? "تم حذف المورد" : "Supplier deleted", "warning");
    }
}

function handlePurchaseFormSubmit(e) {
    e.preventDefault();
    const supplierId = document.getElementById("pur-supplier").value;
    const productId = document.getElementById("pur-product").value;
    const cost = parseFloat(document.getElementById("pur-cost").value);
    const qty = parseInt(document.getElementById("pur-qty").value);
    const paymentStatusEl = document.querySelector('input[name="pur-payment"]:checked');
    const paymentStatus = paymentStatusEl ? paymentStatusEl.value : "paid";
    const totalCost = cost * qty;
    const prod = state.products.find(p => p.id === productId);
    if (prod) { prod.stock += qty; prod.cost = cost; }
    const sup = state.suppliers.find(s => s.id === supplierId);
    if (sup) { sup.totalPurchases += totalCost; if (paymentStatus === 'credit') sup.balance += totalCost; sup.lastUpdated = new Date().toISOString().split('T')[0]; }
    if (!state.purchaseInvoices) state.purchaseInvoices = [];
    state.purchaseInvoices.push({ id: (2000 + state.purchaseInvoices.length + 1).toString(), date: new Date().toISOString(), supplierId, productId, qty, cost, totalCost, paymentStatus });
    saveState();
    document.getElementById("purchase-modal").classList.remove("active");
    document.getElementById("purchase-form").reset();
    showToast(state.language === "ar" ? "تم تسجيل فاتورة التوريد وتحديث المخزن بنجاح!" : "Restock invoice created and stock updated!", "success");
    renderSuppliers();
}

function openSettleModal(id) {
    const s = state.suppliers.find(x => x.id === id);
    if (!s) return;
    document.getElementById("settle-supplier-id").value = s.id;
    document.getElementById("settle-supplier-name").textContent = s.company;
    document.getElementById("settle-current-balance").textContent = `${s.balance.toFixed(2)} ${state.settings.currency}`;
    document.getElementById("settle-amount").value = "";
    document.getElementById("settle-amount").max = s.balance;
    document.getElementById("settle-modal").classList.add("active");
}

function handleSettleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("settle-supplier-id").value;
    const amount = parseFloat(document.getElementById("settle-amount").value);
    const s = state.suppliers.find(x => x.id === id);
    if (s) {
        if (amount > s.balance) { showToast(state.language === "ar" ? "لا يمكن دفع مبلغ أكبر من مديونية المورد الحالية!" : "Payment cannot exceed outstanding balance!", "danger"); return; }
        s.balance -= amount;
        s.lastUpdated = new Date().toISOString().split('T')[0];
    }
    saveState();
    document.getElementById("settle-modal").classList.remove("active");
    document.getElementById("settle-form").reset();
    showToast(state.language === "ar" ? "تم تسجيل الدفعة بنجاح!" : "Payment recorded!", "success");
    renderSuppliers();
}

// ======================== SETTINGS ========================
function renderSettings() {
    document.getElementById("settings-store-name").value = state.settings.storeName;
    document.getElementById("settings-currency").value = state.settings.currency;
    document.getElementById("settings-tax-rate").value = state.settings.taxRate;
    document.getElementById("settings-low-stock").value = state.settings.lowStockLimit;
}

// ======================== APP CORE ========================
const addListenerSafe = (id, event, cb) => { const el = document.getElementById(id); if (el) el.addEventListener(event, cb); };

function applyTheme() { document.body.className = state.theme === "dark" ? "dark-mode" : "light-mode"; }

function applyLanguage() {
    const isRtl = state.language === "ar";
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = state.language;
    document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => {
        const view = item.getAttribute("data-view");
        const textSpan = item.querySelector(".menu-text");
        if (textSpan && translations[state.language][view]) textSpan.textContent = translations[state.language][view];
    });
    document.querySelectorAll("[data-en]").forEach(el => {
        if (state.language === "en") { el.setAttribute("data-ar", el.textContent); el.textContent = el.getAttribute("data-en"); }
        else if (el.getAttribute("data-ar")) el.textContent = el.getAttribute("data-ar");
    });
    const posSearch = document.getElementById("pos-search-input");
    if (posSearch) posSearch.placeholder = translations[state.language].searchPlaceholder;
    const invSearch = document.getElementById("inventory-search-input");
    if (invSearch) invSearch.placeholder = state.language === "ar" ? "ابحث باسم المنتج، الباركود، الفئة..." : "Search by name, barcode, category...";
}

function setupNavigation() {
    document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => { item.addEventListener("click", (e) => { e.preventDefault(); switchView(item.getAttribute("data-view")); }); });
    document.querySelectorAll("[data-go-to]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            const targetView = el.getAttribute("data-go-to");
            switchView(targetView);
            if (targetView === "inventory" && el.closest(".alerts-card")) { const filter = document.getElementById("inventory-stock-filter"); if (filter) { filter.value = "lowstock"; filter.dispatchEvent(new Event("change")); } }
        });
    });
    addListenerSafe("quick-pos-btn", "click", () => switchView("pos"));
    const statCards = document.querySelectorAll("#view-dashboard .stats-grid .stat-card");
    if (statCards.length >= 4) {
        statCards[0].addEventListener("click", () => switchView("reports"));
        statCards[1].addEventListener("click", () => switchView("reports"));
        statCards[2].addEventListener("click", () => { switchView("inventory"); const f = document.getElementById("inventory-stock-filter"); if (f) { f.value = "lowstock"; f.dispatchEvent(new Event("change")); } });
        statCards[3].addEventListener("click", () => { switchView("inventory"); const f = document.getElementById("inventory-stock-filter"); if (f) { f.value = "all"; f.dispatchEvent(new Event("change")); } });
    }
}

function switchView(viewName) {
    state.currentView = viewName;
    saveState();
    document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => item.classList.toggle("active", item.getAttribute("data-view") === viewName));
    document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));
    const targetSec = document.getElementById(`view-${viewName}`);
    if (targetSec) targetSec.classList.add("active");
    const titleEl = document.getElementById("current-view-title");
    const subtitleEl = document.getElementById("current-view-subtitle");
    if (titleEl) titleEl.textContent = translations[state.language][viewName] || viewName;
    const subtitles = {
        dashboard: { ar: "مرحباً بك مجدداً، إليك نظرة عامة على أداء اليوم.", en: "Welcome back, here is today's overview." },
        pos: { ar: "شاشة الكاشير السريعة لإتمام عمليات البيع.", en: "Quick cashier screen to complete sales." },
        inventory: { ar: "إدارة وتحديث المنتجات والأسعار والكميات المتاحة.", en: "Manage and update products, prices, and stock levels." },
        reports: { ar: "تقارير المبيعات والأرباح التفصيلية للفترات المختلفة.", en: "Detailed sales and profit reports for different periods." },
        customers: { ar: "إدارة قاعدة بيانات العملاء ونقاط الولاء.", en: "Manage customer database and loyalty points." },
        suppliers: { ar: "إدارة الموردين وحسابات التوريد والآجل.", en: "Manage suppliers, restock purchases, and credit balances." },
        shortages: { ar: "تتبع المنتجات الناقصة تلقائياً وصدّر طلبياتك للتجار بسهولة.", en: "Automatically track shortage products and export orders to suppliers." },
        settings: { ar: "تخصيص إعدادات النظام والنسخ الاحتياطي.", en: "Customize system settings and backups." }
    };
    if (subtitleEl && subtitles[viewName]) subtitleEl.textContent = subtitles[viewName][state.language];
    if (viewName === "dashboard") renderDashboard();
    else if (viewName === "pos") renderPOS();
    else if (viewName === "inventory") renderInventory();
    else if (viewName === "reports") renderReports();
    else if (viewName === "customers") renderCustomers();
    else if (viewName === "suppliers") renderSuppliers();
    else if (viewName === "shortages") renderShortages();
    else if (viewName === "settings") renderSettings();
    lucide.createIcons();
}

function setupLiveTime() {
    const timeEl = document.getElementById("live-time");
    const update = () => { const now = new Date(); const timeStr = now.toLocaleTimeString(state.language === "ar" ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); if (timeEl?.querySelector("span")) timeEl.querySelector("span").textContent = timeStr; };
    update();
    setInterval(update, 1000);
}

function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        if (e.key === "F1") { e.preventDefault(); switchView("pos"); showToast(state.language === "ar" ? "تم الانتقال إلى الكاشير" : "Switched to POS", "info"); }
        if (e.key === "F2" && state.currentView === "pos") { e.preventDefault(); handleCheckout(); }
        if (e.key === "F3") { e.preventDefault(); switchView("dashboard"); showToast(state.language === "ar" ? "تم الانتقال إلى لوحة التحكم" : "Switched to Dashboard", "info"); }
        if (e.key === "F4" && state.currentView === "pos") { e.preventDefault(); clearCart(); showToast(state.language === "ar" ? "تم تفريغ السلة" : "Cart cleared", "warning"); }
    });
}

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
        barcodeInput.style.boxShadow = '0 0 8px rgba(6,182,212,0.3)';
    } else {
        barcodeInput.style.borderColor = '';
        barcodeInput.style.boxShadow = '';
    }
}

function setupEventListeners() {
    addListenerSafe("theme-toggle-btn", "click", () => { state.theme = state.theme === "dark" ? "light" : "dark"; saveState(); applyTheme(); if (state.currentView === "dashboard") renderDashboard(); });
    addListenerSafe("lang-toggle-btn", "click", () => { state.language = state.language === "ar" ? "en" : "ar"; const btn = document.getElementById("lang-toggle-btn"); if (btn) btn.textContent = state.language === "ar" ? "EN" : "AR"; saveState(); applyLanguage(); switchView(state.currentView); });

    const setupModal = (modalId, openBtnId, closeBtnId, cancelBtnId) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
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

    addListenerSafe("add-product-btn", "click", () => { const form = document.getElementById("product-form"); if (form) form.reset(); const idField = document.getElementById("product-id"); if (idField) idField.value = ""; const mt = document.getElementById("product-modal-title"); if (mt) mt.textContent = state.language === "ar" ? "إضافة منتج جديد" : "Add New Product"; });
    addListenerSafe("add-customer-btn", "click", () => { const form = document.getElementById("customer-form"); if (form) form.reset(); const idField = document.getElementById("customer-id"); if (idField) idField.value = ""; const mt = document.getElementById("customer-modal-title"); if (mt) mt.textContent = state.language === "ar" ? "إضافة عميل جديد" : "Add New Customer"; });
    addListenerSafe("add-supplier-trigger-btn", "click", () => { const form = document.getElementById("supplier-form"); if (form) form.reset(); const idField = document.getElementById("supplier-id"); if (idField) idField.value = ""; const mt = document.getElementById("supplier-modal-title"); if (mt) mt.textContent = state.language === "ar" ? "إضافة مورد جديد" : "Add New Supplier"; });
    addListenerSafe("add-customer-quick-btn", "click", () => { const form = document.getElementById("customer-form"); if (form) form.reset(); const idField = document.getElementById("customer-id"); if (idField) idField.value = ""; const mt = document.getElementById("customer-modal-title"); if (mt) mt.textContent = state.language === "ar" ? "إضافة عميل جديد" : "Add New Customer"; const custModal = document.getElementById("customer-modal"); if (custModal) custModal.classList.add("active"); });
    addListenerSafe("close-receipt-modal", "click", () => { const m = document.getElementById("receipt-modal"); if (m) m.classList.remove("active"); });
    addListenerSafe("new-sale-btn", "click", () => {
        const m = document.getElementById("receipt-modal");
        if (m) m.classList.remove("active");
        clearCart();
        // Re-focus barcode scanner for the next sale — no mouse needed
        setTimeout(() => {
            const barcodeField = document.getElementById("barcode-scanner-input");
            if (barcodeField) barcodeField.focus();
        }, 120);
    });
    addListenerSafe("print-receipt-btn", "click", () => window.print());

    document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && !e.target.classList.contains("btn-primary")) { if (e.target.id === "pos-search-input") return; e.preventDefault(); } });

    // --- Search bar: manual text search (Enter for barcode lookup) ---
    const posSearch = document.getElementById("pos-search-input");
    if (posSearch) {
        posSearch.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const barcode = posSearch.value.trim();
                if (!barcode) return;
                const prod = state.products.find(p => p.barcode === barcode);
                if (prod) { addToCart(prod.id); posSearch.value = ""; showToast(state.language === "ar" ? `تمت إضافة ${prod.name}` : `Added ${prod.name}`, "success"); }
                else showToast(state.language === "ar" ? "المنتج غير مسجل في المخازن!" : "Product not found!", "danger");
            }
        });
    }

    // === Dedicated Barcode Scanner Input Handler (v2.0) ===
    // يعالج مسح الباركود من جهاز الاسكانر أو الكتابة اليدوية
    const barcodeScannerField = document.getElementById("barcode-scanner-input");
    if (barcodeScannerField) {
        barcodeScannerField.addEventListener("keydown", (e) => {
            if (e.key !== "Enter") return; // Only act on Enter (scanner sends Enter automatically)
            e.preventDefault();

            const barcode = barcodeScannerField.value.trim();
            if (!barcode) return;

            const prod = state.products.find(p => p.barcode === barcode);
            const scannerRow = document.getElementById("barcode-scanner-row");

            if (prod) {
                // ✅ Found: add to cart
                addToCart(prod.id);
                showToast(
                    state.language === "ar" ? `✅ تمت إضافة: ${prod.name}` : `✅ Added: ${prod.name}`,
                    "success"
                );
                // Green flash animation
                if (scannerRow) {
                    scannerRow.classList.remove('scan-error');
                    scannerRow.classList.add('scan-success');
                    setTimeout(() => scannerRow.classList.remove('scan-success'), 600);
                }
            } else {
                // ❌ Not found: alert cashier
                showToast(
                    state.language === "ar"
                        ? `❌ الباركود "${barcode}" غير مسجل في المخزن!`
                        : `❌ Barcode "${barcode}" not found in inventory!`,
                    "danger"
                );
                playBeep(220, 0.28); // Error beep
                // Red flash animation
                if (scannerRow) {
                    scannerRow.classList.remove('scan-success');
                    scannerRow.classList.add('scan-error');
                    setTimeout(() => scannerRow.classList.remove('scan-error'), 600);
                }
            }

            // Clear field and refocus immediately for the next scan
            barcodeScannerField.value = "";
            barcodeScannerField.focus();
        });
    }

    addListenerSafe("product-form", "submit", handleProductFormSubmit);
    addListenerSafe("customer-form", "submit", handleCustomerFormSubmit);
    addListenerSafe("supplier-form", "submit", handleSupplierFormSubmit);
    addListenerSafe("purchase-form", "submit", handlePurchaseFormSubmit);
    addListenerSafe("settle-form", "submit", handleSettleFormSubmit);
    addListenerSafe("add-category-form", "submit", handleCategoryFormSubmit);
    addListenerSafe("gen-barcode-btn", "click", () => { const inp = document.getElementById("prod-barcode"); if (inp) { inp.value = "622" + Math.floor(100000 + Math.random() * 900000); checkSmartBarcode(); } });
    addListenerSafe("prod-barcode", "input", checkSmartBarcode);
    addListenerSafe("pos-search-input", "input", renderPOSProducts);
    addListenerSafe("submit-barcode-sim", "click", () => { const sel = document.getElementById("barcode-select-product"); if (sel) { const prod = state.products.find(p => p.id === sel.value); if (prod) { addToCart(prod.id); const m = document.getElementById("barcode-modal"); if (m) m.classList.remove("active"); showToast(state.language === "ar" ? `تمت إضافة ${prod.name}` : `Added ${prod.name}`, "success"); } } });
    addListenerSafe("clear-cart-btn", "click", () => { clearCart(); showToast(state.language === "ar" ? "تم تفريغ السلة" : "Cart cleared", "warning"); });
    addListenerSafe("cart-discount-input", "input", updateCartSummary);
    addListenerSafe("checkout-btn", "click", handleCheckout);
    addListenerSafe("supplier-search-input", "input", renderSuppliersTable);
    addListenerSafe("pur-pay-cash", "click", () => { const c = document.getElementById("pur-pay-cash"), cr = document.getElementById("pur-pay-credit"); if (c && cr) { c.classList.add("active"); cr.classList.remove("active"); } const inp = document.querySelector('input[name="pur-payment"][value="paid"]'); if (inp) inp.checked = true; });
    addListenerSafe("pur-pay-credit", "click", () => { const c = document.getElementById("pur-pay-cash"), cr = document.getElementById("pur-pay-credit"); if (c && cr) { cr.classList.add("active"); c.classList.remove("active"); } const inp = document.querySelector('input[name="pur-payment"][value="credit"]'); if (inp) inp.checked = true; });
    addListenerSafe("inventory-search-input", "input", renderInventoryTable);
    addListenerSafe("inventory-category-filter", "change", renderInventoryTable);
    addListenerSafe("inventory-stock-filter", "change", renderInventoryTable);

    const settingsForm = document.getElementById("settings-form");
    if (settingsForm) {
        settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            state.settings.storeName = document.getElementById("settings-store-name").value;
            state.settings.currency = document.getElementById("settings-currency").value;
            state.settings.taxRate = parseFloat(document.getElementById("settings-tax-rate").value) || 0;
            state.settings.lowStockLimit = parseInt(document.getElementById("settings-low-stock").value) || 10;
            saveState();
            showToast(state.language === "ar" ? "تم حفظ الإعدادات بنجاح!" : "Settings saved!", "success");
        });
    }

    addListenerSafe("backup-data-btn", "click", () => { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state)); const a = document.createElement('a'); a.setAttribute("href", dataStr); a.setAttribute("download", `supermarket_backup_${new Date().toISOString().split('T')[0]}.json`); document.body.appendChild(a); a.click(); a.remove(); showToast(state.language === "ar" ? "تم تصدير النسخة الاحتياطية" : "Backup exported", "success"); });
    addListenerSafe("restore-data-trigger", "click", () => { const inp = document.getElementById("restore-data-file"); if (inp) inp.click(); });
    const restoreInput = document.getElementById("restore-data-file");
    if (restoreInput) { restoreInput.addEventListener("change", (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { try { const parsed = JSON.parse(ev.target.result); if (parsed.products && parsed.categories) { Object.assign(state, parsed); saveState(); showToast(state.language === "ar" ? "تم استيراد البيانات بنجاح!" : "Data imported!", "success"); setTimeout(() => window.location.reload(), 1000); } else showToast(state.language === "ar" ? "ملف غير صالح!" : "Invalid file format!", "danger"); } catch (err) { showToast(state.language === "ar" ? "خطأ في قراءة الملف!" : "Error reading file!", "danger"); } }; reader.readAsText(file); }); }
    addListenerSafe("reset-data-btn", "click", () => { if (confirm(state.language === "ar" ? "هل أنت متأكد من مسح كافة البيانات وإعادة تهيئة النظام؟" : "Reset all data?")) { resetToDefault(); showToast(state.language === "ar" ? "تمت تهيئة النظام بالكامل" : "System reset complete", "danger"); setTimeout(() => window.location.reload(), 1000); } });

    document.querySelectorAll(".payment-method").forEach(method => { method.addEventListener("click", () => { document.querySelectorAll(".payment-method").forEach(m => m.classList.remove("active")); method.classList.add("active"); const input = method.querySelector("input"); if (input) input.checked = true; }); });
    document.querySelectorAll(".reports-toolbar .btn-outline").forEach(btn => { btn.addEventListener("click", () => { document.querySelectorAll(".reports-toolbar .btn-outline").forEach(b => b.classList.remove("active")); btn.classList.add("active"); renderReports(); }); });
    addListenerSafe("manage-categories-btn", "click", () => renderCategoriesList());
    addListenerSafe("export-excel-btn", "click", () => { showToast(state.language === "ar" ? "جاري تصدير البيانات..." : "Exporting data...", "info"); setTimeout(() => { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ transactions: state.transactions, products: state.products }, null, 2)); const a = document.createElement('a'); a.setAttribute("href", dataStr); a.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.json`); document.body.appendChild(a); a.click(); a.remove(); showToast(state.language === "ar" ? "تم التصدير بنجاح!" : "Export successful!", "success"); }, 500); });
}

// ======================== INIT ========================
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
window.refreshCurrentView = () => switchView(state.currentView);

// ================================================================
// PWA - SERVICE WORKER REGISTRATION
// ================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => {
                console.log('[PWA] Service Worker registered:', reg.scope);
                // Check for updates
                reg.addEventListener('updatefound', () => {
                    const newSW = reg.installing;
                    newSW.addEventListener('statechange', () => {
                        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                            showToast('تحديث جديد متاح! أعد تحميل الصفحة للتطبيق.', 'info');
                        }
                    });
                });
            })
            .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
    });
}

// ================================================================
// MOBILE: CART BOTTOM SHEET
// ================================================================
let mobileCartOpen = false;

/** Toggle the mobile cart bottom sheet */
function toggleMobileCart() {
    mobileCartOpen ? closeMobileCart() : openMobileCart();
}

function openMobileCart() {
    mobileCartOpen = true;
    const panel    = document.getElementById('pos-cart-panel');
    const backdrop = document.getElementById('mobile-cart-backdrop');
    if (panel)    panel.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closeMobileCart() {
    mobileCartOpen = false;
    const panel    = document.getElementById('pos-cart-panel');
    const backdrop = document.getElementById('mobile-cart-backdrop');
    if (panel)    panel.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('visible');
    document.body.style.overflow = '';
}

/**
 * Update the floating cart FAB on mobile
 * Called every time the cart changes
 */
function updateMobileFAB() {
    const fab      = document.getElementById('mobile-cart-fab');
    const fabCount = document.getElementById('fab-cart-count');
    const fabTotal = document.getElementById('fab-cart-total');
    if (!fab) return;

    const itemCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const total     = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (fabCount) fabCount.textContent = itemCount > 99 ? '99+' : itemCount;
    if (fabTotal) fabTotal.textContent = `${total.toFixed(2)} ${state.settings.currency}`;

    // Only show FAB on mobile (CSS handles display:none on desktop, JS handles empty cart)
    if (itemCount > 0) {
        fab.style.display = '';      // let CSS control based on screen size
        fab.style.removeProperty('display');
    } else {
        fab.style.display = 'none'; // hide when cart is empty
        closeMobileCart();          // also close sheet if cart emptied
    }
}

// ================================================================
// MOBILE: CAMERA BARCODE SCANNER (html5-qrcode)
// ================================================================
let html5QrCodeInstance = null;

/** Open the camera scanner modal and start scanning */
function openCameraScanner() {
    const modal = document.getElementById('camera-scanner-modal');
    if (modal) modal.classList.add('active');

    // Small delay to let modal animation complete before starting camera
    setTimeout(startCameraScanner, 400);
}

/** Initialize and start the html5-qrcode scanner */
function startCameraScanner() {
    if (typeof Html5Qrcode === 'undefined') {
        const statusEl = document.getElementById('camera-scanner-status');
        if (statusEl) statusEl.textContent = '⚠️ مكتبة الكاميرا غير متاحة. تحقق من الاتصال بالإنترنت.';
        return;
    }

    const statusEl = document.getElementById('camera-scanner-status');
    if (statusEl) statusEl.textContent = state.language === 'ar'
        ? 'جاري تشغيل الكاميرا... وجّه العدسة نحو الباركود'
        : 'Starting camera... aim at the barcode';

    html5QrCodeInstance = new Html5Qrcode('camera-scanner-region');

    html5QrCodeInstance.start(
        { facingMode: 'environment' }, // use back (environment) camera
        {
            fps: 15,                           // frames per second for scanning
            qrbox: { width: 260, height: 130 },// scanning box size
            aspectRatio: 1.5,
            disableFlip: false                 // allow mirrored barcodes
        },
        /** SUCCESS: barcode detected */
        (decodedText) => {
            const barcode = decodedText.trim();
            const prod = state.products.find(p => p.barcode === barcode);

            if (prod) {
                // Product found — add to cart
                addToCart(prod.id);
                showToast(
                    state.language === 'ar'
                        ? `✅ تمت الإضافة: ${prod.name}`
                        : `✅ Added: ${prod.name}`,
                    'success'
                );
                if (typeof playBeep === 'function') playBeep(523.25, 0.08);
            } else {
                // Product NOT found in inventory
                showToast(
                    state.language === 'ar'
                        ? `❌ الباركود "${barcode}" غير موجود في المخزون!`
                        : `❌ Barcode "${barcode}" not found in inventory!`,
                    'danger'
                );
                if (typeof playBeep === 'function') playBeep(220, 0.25);
            }

            // Always close scanner after a successful read
            closeCameraScanner();
        },
        /** ERROR: scanning frame errors — ignore (happen constantly while searching) */
        () => {}
    ).then(() => {
        if (statusEl) statusEl.textContent = state.language === 'ar'
            ? '📷 وجّه الكاميرا نحو الباركود الخاص بالمنتج'
            : '📷 Aim camera at the product barcode';
    }).catch(err => {
        console.error('[Camera] Start error:', err);
        if (statusEl) statusEl.textContent = state.language === 'ar'
            ? '❌ فشل تشغيل الكاميرا. تأكد من منح إذن الوصول للكاميرا.'
            : '❌ Camera access denied. Please allow camera permission.';
    });
}

/** Stop the camera and close the modal */
function closeCameraScanner() {
    if (html5QrCodeInstance) {
        html5QrCodeInstance.stop()
            .then(() => { html5QrCodeInstance = null; })
            .catch(() => { html5QrCodeInstance = null; });
    }
    const modal = document.getElementById('camera-scanner-modal');
    if (modal) modal.classList.remove('active');
    // Return focus to barcode input field
    setTimeout(() => {
        const barcodeInput = document.getElementById('barcode-scanner-input');
        if (barcodeInput) barcodeInput.focus();
    }, 200);
}

// ================================================================
// MOBILE: INVENTORY CARDS (shown instead of table on small screens)
// ================================================================
function renderMobileInventoryCards(products) {
    const container = document.getElementById('mobile-inventory-cards-container');
    if (!container) return;

    const CRITICAL = 5;
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding:32px">
            <i data-lucide="inbox" style="width:40px;height:40px;color:var(--text-muted)"></i>
            <p>${state.language === 'ar' ? 'لا توجد منتجات مطابقة' : 'No matching products'}</p>
        </div>`;
        lucide.createIcons();
        return;
    }

    products.forEach(p => {
        const qtyClass  = p.stock === 0 ? 'qty-out' : p.stock <= CRITICAL ? 'qty-critical' : p.stock <= state.settings.lowStockLimit ? 'qty-warning' : 'qty-good';
        const qtyEmoji  = p.stock === 0 ? '⛔' : p.stock <= CRITICAL ? '⚠️' : '';
        const card = document.createElement('div');
        card.className = 'inv-mobile-card';

        card.innerHTML = `
            <div class="inv-mobile-card-header">
                <div class="inv-mobile-card-name">${p.name}</div>
                <span class="stock-qty-badge ${qtyClass}">${qtyEmoji} ${p.stock}</span>
            </div>
            <code style="font-size:0.72rem;color:var(--text-muted);letter-spacing:0.03em">${p.barcode}</code>
            <div class="inv-mobile-card-body">
                <div class="inv-mobile-card-field">
                    <label>${state.language === 'ar' ? 'سعر التكلفة' : 'Cost'}</label>
                    <span>${p.cost.toFixed(2)} ${state.settings.currency}</span>
                </div>
                <div class="inv-mobile-card-field">
                    <label>${state.language === 'ar' ? 'سعر البيع' : 'Price'}</label>
                    <span style="color:var(--success)">${p.price.toFixed(2)} ${state.settings.currency}</span>
                </div>
                <div class="inv-mobile-card-field">
                    <label>${state.language === 'ar' ? 'المورد' : 'Supplier'}</label>
                    <span style="font-size:0.8rem">${p.supplier || '—'}</span>
                </div>
                <div class="inv-mobile-card-field">
                    <label>${state.language === 'ar' ? 'الصلاحية' : 'Expiry'}</label>
                    <span class="${isExpired(p.expiry) ? 'text-danger' : ''}" style="font-size:0.82rem">${p.expiry || '—'}</span>
                </div>
            </div>
            <div class="inv-mobile-card-actions">
                <button class="btn btn-secondary btn-sm" style="flex:1" onclick="editProduct('${p.id}')">
                    <i data-lucide="edit-3" style="width:14px;height:14px"></i>
                    ${state.language === 'ar' ? 'تعديل' : 'Edit'}
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">
                    <i data-lucide="trash-2" style="width:14px;height:14px"></i>
                </button>
            </div>`;
        container.appendChild(card);
    });

    lucide.createIcons();
}

// ================================================================
// MOBILE: WHATSAPP SHARING FOR SHORTAGE LISTS
// ================================================================
/**
 * Share a supplier's shortage order list via WhatsApp
 * Works on mobile (opens WhatsApp app) and desktop (opens WhatsApp Web)
 */
function shareViaWhatsApp(supplierName) {
    const THRESHOLD = state.settings.lowStockLimit;
    const TARGET    = Math.max(50, THRESHOLD * 5);
    const UNKNOWN   = state.language === 'ar' ? 'غير محدد' : 'Unassigned';

    const products = state.products.filter(p =>
        p.stock <= THRESHOLD &&
        ((p.supplier && p.supplier.trim() === supplierName) ||
         (!p.supplier?.trim() && supplierName === UNKNOWN))
    );

    if (products.length === 0) {
        showToast(state.language === 'ar' ? 'لا توجد نواقص لهذا التاجر!' : 'No shortages!', 'warning');
        return;
    }

    const date = new Date().toLocaleDateString(state.language === 'ar' ? 'ar-EG' : 'en-US');

    let msg = `*🛒 ${state.settings.storeName}*\n`;
    msg    += `📋 *قائمة المشتريات المطلوبة*\n`;
    msg    += `📅 التاريخ: ${date}\n`;
    msg    += `🏭 المورد: *${supplierName}*\n`;
    msg    += `${'─'.repeat(28)}\n\n`;

    products.forEach((p, i) => {
        const suggested = Math.max(10, TARGET - p.stock);
        const emoji     = p.stock === 0 ? '⛔' : '⚠️';
        msg += `${emoji} *${i + 1}. ${p.name}*\n`;
        msg += `   📦 المتاح: ${p.stock} | 🔢 المطلوب: *${suggested} قطعة*\n\n`;
    });

    msg += `${'─'.repeat(28)}\n`;
    msg += `✅ إجمالي الأصناف: *${products.length} صنف*`;

    // Open WhatsApp (mobile: opens app, desktop: opens WhatsApp Web)
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener');
}

// ================================================================
// EXPOSE MOBILE FUNCTIONS GLOBALLY
// ================================================================
window.openCameraScanner   = openCameraScanner;
window.closeCameraScanner  = closeCameraScanner;
window.toggleMobileCart    = toggleMobileCart;
window.closeMobileCart     = closeMobileCart;
window.shareViaWhatsApp    = shareViaWhatsApp;
window.exportSupplierShortages = exportSupplierShortages;
window.exportAllShortages  = exportAllShortages;

// ================================================================
// APP INITIALIZATION
// ================================================================
document.addEventListener("DOMContentLoaded", () => {
    loadState();
    applyTheme();
    applyLanguage();
    setupNavigation();
    setupEventListeners();
    setupLiveTime();
    setupKeyboardShortcuts();

    // Mobile FAB: update whenever cart changes
    onCartChange(() => {
        renderCart();
        updateMobileFAB();       // keep FAB in sync with cart
        updateSidebarShortagesBadge(); // keep sidebar badge fresh
    });

    switchView(state.currentView);
    updateSidebarShortagesBadge(); // initial badge count
    updateMobileFAB();             // initial FAB state
    lucide.createIcons();
});

