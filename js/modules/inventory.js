import { state, saveState } from '../state.js';
import { renderPOSCategoryDropdowns } from './pos.js';

export function renderInventory() {
    renderPOSCategoryDropdowns();
    renderInventoryTable();
}

export function renderInventoryTable() {
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
            <td>${(p.cost || 0).toFixed(2)} ${state.settings.currency}</td>
            <td>${(p.price || 0).toFixed(2)} ${state.settings.currency}</td>
            <td class="text-success">+${profit.toFixed(2)} ${state.settings.currency}</td>
            <td><strong>${p.stock}</strong></td>
            <td><span class="${isExpired(p.expiry) ? 'text-danger font-bold' : ''}">${p.expiry || '-'}</span></td>
            <td>${stockBadge}</td>
            <td>
                <div style="display: flex; gap: 4px;">
                    <button class="btn btn-info btn-sm" onclick="window.openPriceHistoryModal('${p.id}')" title="سجل الأسعار (Price History)">
                        <i class="ri-history-line"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="window.editProduct('${p.id}')" title="تعديل">
                        <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.deleteProduct('${p.id}')" title="حذف">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    if (window.lucide) window.lucide.createIcons();
}

export function isExpired(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
}

export function getFormattedNow() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export function logPriceChange(product, newCost, newPrice, ref = "تعديل يدوي") {
    if (!product) return;
    if (!product.priceHistory) product.priceHistory = [];
    
    const nowStr = getFormattedNow();

    if (product.priceHistory.length === 0) {
        product.priceHistory.push({
            date: nowStr,
            cost: product.cost || 0,
            price: product.price || 0,
            ref: "سعر السجل التأسيسي"
        });
    }

    const last = product.priceHistory[product.priceHistory.length - 1];
    if (!last || last.cost !== newCost || last.price !== newPrice) {
        product.priceHistory.push({
            date: nowStr,
            cost: newCost,
            price: newPrice,
            ref: ref
        });
    }
}

export function handleProductFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("product-id").value;
    const barcode = document.getElementById("prod-barcode").value;
    const name = document.getElementById("prod-name").value;
    const category = document.getElementById("prod-category").value;
    const costEl = document.getElementById("prod-cost") || document.getElementById("prod-buy-price");
    const priceEl = document.getElementById("prod-price") || document.getElementById("prod-sell-price");
    const stockEl = document.getElementById("prod-stock");
    const minStockEl = document.getElementById("prod-min-stock");
    const expiryEl = document.getElementById("prod-expiry");
    const imageEl = document.getElementById("prod-image");

    const cost = costEl ? parseFloat(costEl.value) || 0 : 0;
    const price = priceEl ? parseFloat(priceEl.value) || 0 : 0;
    const stock = stockEl ? parseInt(stockEl.value) || 0 : 0;
    const minStock = minStockEl ? parseInt(minStockEl.value) || 5 : 5;
    const expiry = expiryEl ? expiryEl.value : "";
    const image = imageEl ? imageEl.value : "";

    if (id) {
        const index = state.products.findIndex(p => p.id === id);
        if (index !== -1) {
            logPriceChange(state.products[index], cost, price, "تعديل من المخزون");
            const history = state.products[index].priceHistory || [];
            state.products[index] = { id, barcode, name, category, cost, price, stock, minStock, expiry, image, priceHistory: history };
        }
    } else {
        const newId = (state.products.length + 1).toString();
        const newProd = { id: newId, barcode, name, category, cost, price, stock, minStock, expiry, image, priceHistory: [] };
        logPriceChange(newProd, cost, price, "سعر الإضافة الأولي");
        state.products.push(newProd);
    }

    saveState();
    const modal = document.getElementById("product-modal");
    if (modal) modal.classList.remove("active");
    const form = document.getElementById("product-form");
    if (form) form.reset();
    const idField = document.getElementById("product-id");
    if (idField) idField.value = "";
    renderInventory();
}

export function editProduct(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;

    const idEl = document.getElementById("product-id");
    const barcodeEl = document.getElementById("prod-barcode");
    const nameEl = document.getElementById("prod-name");
    const categoryEl = document.getElementById("prod-category");
    const stockEl = document.getElementById("prod-stock");
    const minStockEl = document.getElementById("prod-min-stock");
    const costEl = document.getElementById("prod-cost") || document.getElementById("prod-buy-price");
    const priceEl = document.getElementById("prod-price") || document.getElementById("prod-sell-price");
    const expiryEl = document.getElementById("prod-expiry");
    const imageEl = document.getElementById("prod-image");
    const titleEl = document.getElementById("product-modal-title");
    const modal = document.getElementById("product-modal");

    if (idEl) idEl.value = p.id;
    if (barcodeEl) barcodeEl.value = p.barcode;
    if (nameEl) nameEl.value = p.name;
    if (categoryEl) categoryEl.value = p.category;
    if (stockEl) stockEl.value = p.stock;
    if (minStockEl) minStockEl.value = p.minStock || 5;
    if (costEl) costEl.value = p.cost;
    if (priceEl) priceEl.value = p.price;
    if (expiryEl) expiryEl.value = p.expiry || "";
    if (imageEl) imageEl.value = p.image || "";

    if (titleEl) titleEl.textContent = state.language === "ar" ? "تعديل المنتج" : "Edit Product";
    if (modal) modal.classList.add("active");
}

export function deleteProduct(id) {
    if (confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا المنتج؟" : "Are you sure you want to delete this product?")) {
        state.products = state.products.filter(p => p.id !== id);
        saveState();
        renderInventory();
    }
}

export function openPriceHistoryModal(productId) {
    const prod = (state.products || []).find(p => p.id === productId);
    if (!prod) return;

    const nameEl = document.getElementById("ph-product-name");
    const barcodeEl = document.getElementById("ph-product-barcode");
    const costEl = document.getElementById("ph-current-cost");
    const priceEl = document.getElementById("ph-current-price");
    const tbody = document.getElementById("price-history-table-body");

    if (nameEl) nameEl.textContent = prod.name;
    if (barcodeEl) barcodeEl.textContent = `الباركود: ${prod.barcode}`;
    if (costEl) costEl.textContent = `سعر الشراء الحالي: ${prod.cost.toFixed(2)} ${state.settings.currency}`;
    if (priceEl) priceEl.textContent = `سعر البيع الحالي: ${prod.price.toFixed(2)} ${state.settings.currency}`;

    if (!tbody) return;
    tbody.innerHTML = "";

    const history = prod.priceHistory || [];
    if (history.length === 0) {
        const nowStr = getFormattedNow();
        tbody.innerHTML = `
            <tr>
                <td style="font-size:12px; font-family:monospace;">${nowStr}</td>
                <td><strong class="text-info">${prod.cost.toFixed(2)} ${state.settings.currency}</strong></td>
                <td><strong class="text-success">${prod.price.toFixed(2)} ${state.settings.currency}</strong></td>
                <td class="text-success">+${(prod.price - prod.cost).toFixed(2)} ${state.settings.currency}</td>
                <td><span class="badge badge-primary" style="font-size:11px;">السعر النشط الحالي</span></td>
            </tr>
        `;
    } else {
        const sortedHistory = [...history].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        sortedHistory.forEach(h => {
            const profit = (h.price || 0) - (h.cost || 0);
            const dateFormatted = h.date ? (h.date.includes('T') ? h.date.replace('T', ' ').substring(0, 19) : h.date) : '—';
            const row = document.createElement("tr");
            row.innerHTML = `
                <td style="font-size:12px; font-family:monospace; direction:ltr; text-align:right;">${dateFormatted}</td>
                <td><strong class="text-info">${(h.cost || 0).toFixed(2)} ${state.settings.currency}</strong></td>
                <td><strong class="text-success">${(h.price || 0).toFixed(2)} ${state.settings.currency}</strong></td>
                <td class="${profit >= 0 ? 'text-success' : 'text-danger'}">${profit >= 0 ? '+' : ''}${profit.toFixed(2)} ${state.settings.currency}</td>
                <td><span class="badge badge-secondary" style="font-size:11px;">${h.ref || 'تحديث تلقائي'}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    const modal = document.getElementById("price-history-modal");
    if (modal) modal.classList.add("active");
}
