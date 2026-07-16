export const DEFAULT_CATEGORIES = [
    "ألبان (Dairy)", 
    "مخبوزات (Bakery)", 
    "مشروبات (Beverages)", 
    "معلبات (Canned)", 
    "تسالي (Snacks)", 
    "منظفات (Household)", 
    "خضار وفاكهة (Produce)", 
    "التدخين ومستلزماته (Smoking)", 
    "لحوم ودواجن (Meat)", 
    "بقوليات وعطارة (Grains)"
];

export const DEFAULT_PRODUCTS = [
    { id: "1", barcode: "62210001", name: "حليب جهينة كامل الدسم 1 لتر", category: "ألبان (Dairy)", cost: 32.00, price: 38.00, stock: 45, expiry: "2026-09-15", image: "" },
    { id: "2", barcode: "62210002", name: "جبنة عبور لاند فيتا 500ج", category: "ألبان (Dairy)", cost: 28.00, price: 34.00, stock: 8, expiry: "2026-12-01", image: "" },
    { id: "3", barcode: "62210003", name: "خبز توست ريتش بيك", category: "مخبوزات (Bakery)", cost: 25.00, price: 30.00, stock: 15, expiry: "2026-07-20", image: "" },
    { id: "4", barcode: "62210004", name: "بيبسي كانز 330 مل", category: "مشروبات (Beverages)", cost: 9.50, price: 12.00, stock: 120, expiry: "2027-01-10", image: "" },
    { id: "5", barcode: "62210005", name: "مياه معدنية نستله 1.5 لتر", category: "مشروبات (Beverages)", cost: 6.00, price: 8.00, stock: 200, expiry: "2027-06-01", image: "" },
    { id: "6", barcode: "62210006", name: "تونة صن شاين قطع 185ج", category: "معلبات (Canned)", cost: 45.00, price: 55.00, stock: 30, expiry: "2028-03-15", image: "" },
    { id: "7", barcode: "62210007", name: "شيبسي عائلي ملح 100ج", category: "تسالي (Snacks)", cost: 8.00, price: 10.00, stock: 4, expiry: "2026-11-30", image: "" },
    { id: "8", barcode: "62210008", name: "مسحوق غسيل أريال 2.5 كجم", category: "منظفات (Household)", cost: 180.00, price: 210.00, stock: 12, expiry: "", image: "" },
    { id: "9", barcode: "62210009", name: "ولاعة دولفين معدنية قابلة للشحن", category: "التدخين ومستلزماته (Smoking)", cost: 15.00, price: 25.00, stock: 50, expiry: "", image: "" },
    { id: "10", barcode: "62210010", name: "علبة كبريت سوبر 10 علب", category: "التدخين ومستلزماته (Smoking)", cost: 4.00, price: 6.00, stock: 150, expiry: "", image: "" },
    { id: "11", barcode: "62210081", name: "موز بلدي طازج 1 كجم", category: "خضار وفاكهة (Produce)", cost: 18.00, price: 22.00, stock: 40, expiry: "2026-07-16", image: "" },
    { id: "12", barcode: "62210082", name: "طماطم بلدي طازجة 1 كجم", category: "خضار وفاكهة (Produce)", cost: 10.00, price: 14.00, stock: 65, expiry: "2026-07-18", image: "" },
    { id: "13", barcode: "62210092", name: "بانيه دجاج كوكي عادي 1 كجم", category: "لحوم ودواجن (Meat)", cost: 195.00, price: 230.00, stock: 20, expiry: "2026-10-05", image: "" },
    { id: "14", barcode: "62210101", name: "أرز فاخر الضحى 1 كجم", category: "بقوليات وعطارة (Grains)", cost: 29.00, price: 35.00, stock: 80, expiry: "2027-04-12", image: "" },
    { id: "15", barcode: "62210102", name: "مكرونة ريجينا بنة 400 جرام", category: "بقوليات وعطارة (Grains)", cost: 18.00, price: 22.00, stock: 100, expiry: "2027-08-20", image: "" }
];

export const DEFAULT_CUSTOMERS = [
    { id: "c1", name: "أحمد محمد", phone: "01012345678", points: 150, totalSpent: 1250.00, visits: 8, registered: "2026-05-10" },
    { id: "c2", name: "سارة أحمد", phone: "01234567890", points: 45, totalSpent: 420.00, visits: 3, registered: "2026-06-18" }
];

export const DEFAULT_SUPPLIERS = [
    { id: "s1", company: "شركة جهينة للصناعات الغذائية", name: "م. عصام رأفت", phone: "0238204222", balance: 12500.00, totalPurchases: 45000.00, lastUpdated: "2026-07-10" },
    { id: "s2", company: "الشركة المصرية للأغذية (بسكو مصر)", name: "أ. محمد سليم", phone: "19234", balance: 0.00, totalPurchases: 18400.00, lastUpdated: "2026-07-08" }
];

// Smart Barcode Auto-Fill Database
export const SMART_BARCODE_DATABASE = {
    // Dairy (ألبان)
    "62210001": { name: "حليب جهينة كامل الدسم 1 لتر", category: "ألبان (Dairy)", cost: 32.00, price: 38.00 },
    "62210002": { name: "جبنة عبور لاند فيتا 500ج", category: "ألبان (Dairy)", cost: 28.00, price: 34.00 },
    "62210021": { name: "زبادي جهينة 105 جرام", category: "ألبان (Dairy)", cost: 6.00, price: 8.00 },
    "62210022": { name: "جبنة بريزيدن مثلثات 8 قطع", category: "ألبان (Dairy)", cost: 35.00, price: 42.00 },
    "62210023": { name: "سمن كريستال أصفر 700ج", category: "ألبان (Dairy)", cost: 70.00, price: 85.00 },
    
    // Bakery (مخبوزات)
    "62210003": { name: "خبز توست ريتش بيك", category: "مخبوزات (Bakery)", cost: 25.00, price: 30.00 },
    "62210031": { name: "خبز فينو ريتش بيك 5 قطع", category: "مخبوزات (Bakery)", cost: 12.00, price: 15.00 },
    "62210032": { name: "مولتو كرواسون شوكولاتة عائلي", category: "مخبوزات (Bakery)", cost: 8.00, price: 10.00 },
    
    // Beverages (مشروبات)
    "62210004": { name: "بيبسي كانز 330 مل", category: "مشروبات (Beverages)", cost: 9.50, price: 12.00 },
    "62210005": { name: "مياه معدنية نستله 1.5 لتر", category: "مشروبات (Beverages)", cost: 6.00, price: 8.00 },
    "62230014": { name: "كوكاكولا 1 لتر بلاستيك", category: "مشروبات (Beverages)", cost: 16.00, price: 20.00 },
    "62230015": { name: "شويبس خوخ جولد كانز", category: "مشروبات (Beverages)", cost: 13.00, price: 16.00 },
    "62240011": { name: "شاي ليبتون 100 فتلة عبوة", category: "مشروبات (Beverages)", cost: 60.00, price: 75.00 },
    "62240012": { name: "نسكافيه كلاسيك 100 جرام", category: "مشروبات (Beverages)", cost: 110.00, price: 130.00 },
    
    // Canned (معلبات)
    "62210006": { name: "تونة صن شاين قطع 185ج", category: "معلبات (Canned)", cost: 45.00, price: 55.00 },
    "62210051": { name: "كاتشب هاينز عبوة 340 جرام", category: "معلبات (Canned)", cost: 28.00, price: 35.00 },
    "62210052": { name: "فول مدمس أمريكانا 400 جرام", category: "معلبات (Canned)", cost: 12.00, price: 16.00 },
    "62210053": { name: "صلصة طماطم هاينز 360 جرام", category: "معلبات (Canned)", cost: 24.00, price: 30.00 },
    
    // Snacks (تسالي)
    "62210007": { name: "شيبسي عائلي ملح 100ج", category: "تسالي (Snacks)", cost: 8.00, price: 10.00 },
    "62210041": { name: "شوكولاتة كادبوري ديري ميلك", category: "تسالي (Snacks)", cost: 22.00, price: 28.00 },
    "62210042": { name: "بسكويت أوريو الأصلي 6 قطع", category: "تسالي (Snacks)", cost: 6.50, price: 8.00 },
    "62210043": { name: "دوريتوس فلفل حلو جامبو", category: "تسالي (Snacks)", cost: 8.00, price: 10.00 },
    
    // Household (منظفات)
    "62210008": { name: "مسحوق غسيل أريال 2.5 كجم", category: "منظفات (Household)", cost: 180.00, price: 210.00 },
    "62210061": { name: "صابون سائل فيري 1 لتر", category: "منظفات (Household)", cost: 48.00, price: 58.00 },
    "62210062": { name: "مطهر ديتول الأصلي 500 مل", category: "منظفات (Household)", cost: 120.00, price: 145.00 },
    "62210063": { name: "صابون لوكس وردي 120 جرام", category: "منظفات (Household)", cost: 12.00, price: 16.00 },
    
    // Smoking (التدخين)
    "62210009": { name: "ولاعة دولفين معدنية قابلة للشحن", category: "التدخين ومستلزماته (Smoking)", cost: 15.00, price: 25.00 },
    "62210010": { name: "علبة كبريت سوبر 10 علب", category: "التدخين ومستلزماته (Smoking)", cost: 4.00, price: 6.00 },
    "62210071": { name: "سجائر مارلبورو أحمر عبوة", category: "التدخين ومستلزماته (Smoking)", cost: 72.00, price: 85.00 },
    "62210072": { name: "سجائر إل إم أزرق عبوة", category: "التدخين ومستلزماته (Smoking)", cost: 54.00, price: 62.00 },
    "62210073": { name: "سجائر كليوباترا بوكس عبوة", category: "التدخين ومستلزماته (Smoking)", cost: 30.00, price: 35.00 },
    
    // Produce (خضار وفاكهة)
    "62210081": { name: "موز بلدي طازج 1 كجم", category: "خضار وفاكهة (Produce)", cost: 18.00, price: 22.00 },
    "62210082": { name: "طماطم بلدي طازجة 1 كجم", category: "خضار وفاكهة (Produce)", cost: 10.00, price: 14.00 },
    "62210083": { name: "تفاح أصفر مستورد 1 كجم", category: "خضار وفاكهة (Produce)", cost: 60.00, price: 75.00 },
    
    // Meat & Poultry (لحوم ودواجن)
    "62210091": { name: "فرانك بقري حلواني 400 جرام", category: "لحوم ودواجن (Meat)", cost: 85.00, price: 105.00 },
    "62210092": { name: "بانيه دجاج كوكي عادي 1 كجم", category: "لحوم ودواجن (Meat)", cost: 195.00, price: 230.00 },
    "62210093": { name: "برجر بقري أمريكانا 8 قطع", category: "لحوم ودواجن (Meat)", cost: 90.00, price: 115.00 },
    
    // Spices & Grains (عطارة وبقوليات)
    "62210101": { name: "أرز فاخر الضحى 1 كجم", category: "بقوليات وعطارة (Grains)", cost: 29.00, price: 35.00 },
    "62210102": { name: "مكرونة ريجينا بنة 400 جرام", category: "بقوليات وعطارة (Grains)", cost: 18.00, price: 22.00 },
    "62210103": { name: "عدس أصفر الضحى 500 جرام", category: "بقوليات وعطارة (Grains)", cost: 35.00, price: 42.00 }
};

// Translations Dictionary
export const translations = {
    ar: {
        dashboard: "لوحة التحكم", pos: "نقطة البيع (الكاشير)", inventory: "إدارة المخزون",
        reports: "المبيعات والتقارير", customers: "العملاء والولاء", suppliers: "الموردون والحسابات", settings: "الإعدادات العامة",
        todaySales: "مبيعات اليوم", salesOps: "عمليات البيع", lowStock: "نواقص المخزون",
        totalProds: "إجمالي المنتجات", newSale: "عملية بيع جديدة", save: "حفظ", cancel: "إلغاء",
        barcode: "الباركود", name: "اسم المنتج", category: "الفئة", cost: "سعر التكلفة",
        price: "سعر البيع", stock: "الكمية المتاحة", expiry: "تاريخ الصلاحية", status: "حالة المخزون",
        actions: "العمليات", addProd: "إضافة منتج جديد", editProd: "تعديل المنتج",
        searchPlaceholder: "ابحث باسم المنتج أو الباركود...", checkout: "دفع وتأكيد البيع",
        clearCart: "تفريغ السلة", subtotal: "المجموع الفرعي", discount: "الخصم", tax: "الضريبة",
        total: "الإجمالي النهائي", paymentMethod: "طريقة الدفع", cash: "نقدي", card: "بطاقة",
        wallet: "محفظة", walkin: "عميل سفري (نقدي)", points: "نقاط الولاء", totalSpent: "إجمالي المشتريات",
        visits: "عدد الزيارات", registered: "تاريخ التسجيل", phone: "رقم الهاتف", addCust: "إضافة عميل جديد"
    },
    en: {
        dashboard: "Dashboard", pos: "POS / Cashier", inventory: "Inventory",
        reports: "Sales & Reports", customers: "Customers & Loyalty", suppliers: "Suppliers & Accounts", settings: "General Settings",
        todaySales: "Today's Sales", salesOps: "Sales Operations", lowStock: "Low Stock Alerts",
        totalProds: "Total Products", newSale: "New Sale", save: "Save", cancel: "Cancel",
        barcode: "Barcode", name: "Product Name", category: "Category", cost: "Cost Price",
        price: "Selling Price", stock: "Stock Level", expiry: "Expiry Date", status: "Stock Status",
        actions: "Actions", addProd: "Add New Product", editProd: "Edit Product",
        searchPlaceholder: "Search by product name or barcode...", checkout: "Pay & Checkout",
        clearCart: "Clear Cart", subtotal: "Subtotal", discount: "Discount", tax: "Tax",
        total: "Final Total", paymentMethod: "Payment Method", cash: "Cash", card: "Card",
        wallet: "E-Wallet", walkin: "Walk-in Customer", points: "Loyalty Points", totalSpent: "Total Spent",
        visits: "Visits", registered: "Date Registered", phone: "Phone Number", addCust: "Add New Customer"
    }
};
