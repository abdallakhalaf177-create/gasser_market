const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(express.json());
app.use(express.static(__dirname));

// Default data helper
const DEFAULT_DATA = {
    categories: [
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
    ],
    products: [
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
    ],
    customers: [
        { id: "c1", name: "أحمد محمد", phone: "01012345678", points: 150, totalSpent: 1250.00, visits: 8, registered: "2026-05-10" },
        { id: "c2", name: "سارة أحمد", phone: "01234567890", points: 45, totalSpent: 420.00, visits: 3, registered: "2026-06-18" }
    ],
    suppliers: [
        { id: "s1", company: "شركة جهينة للصناعات الغذائية", name: "م. عصام رأفت", phone: "0238204222", balance: 12500.00, totalPurchases: 45000.00, lastUpdated: "2026-07-10" },
        { id: "s2", company: "الشركة المصرية للأغذية (بسكو مصر)", name: "أ. محمد سليم", phone: "19234", balance: 0.00, totalPurchases: 18400.00, lastUpdated: "2026-07-08" }
    ],
    purchaseInvoices: [],
    transactions: [],
    settings: {
        storeName: "جاسر ماركت",
        currency: "ج.م",
        taxRate: 14,
        lowStockLimit: 10
    }
};

// API: Get all data
app.get('/api/data', (req, res) => {
    fs.readFile(DB_FILE, 'utf8', (err, jsonString) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File does not exist, create it with default data
                fs.writeFile(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf8', (writeErr) => {
                    if (writeErr) {
                        return res.status(500).json({ error: "Failed to initialize database file" });
                    }
                    return res.json(DEFAULT_DATA);
                });
            } else {
                return res.status(500).json({ error: "Error reading database file" });
            }
        } else {
            try {
                const data = JSON.parse(jsonString);
                return res.json(data);
            } catch (parseErr) {
                return res.status(500).json({ error: "Database file contains invalid JSON" });
            }
        }
    });
});

// API: Save all data
app.post('/api/data', (req, res) => {
    const data = req.body;
    if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: "Invalid data format" });
    }
    
    fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to write database file" });
        }
        return res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Gasser Market System running at http://localhost:${PORT}`);
});
