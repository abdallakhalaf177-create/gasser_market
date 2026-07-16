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

    const searchQuery = document.getElementById("inventory-search-input").value.toLowerCase();
    const catFilter = document.getElementById("inventory-category-filter").value;
    const stockFilter = document.getElementById("inventory-stock-filter").value;

    const filtered = state.products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.barcode.includes(searchQuery) || p.category.toLowerCase().includes(searchQuery);
        const matchesCat = catFilter === "all" || p.category === catFilter;

        let matchesStock = true;
        if (stockFilter === "instock") matchesStock = p.stock > state.settings.lowStockLimit;
        else if (stockFilter === "lowstock") matchesStock = p.stock > 0 && p.stock <= state.settings.lowStockLimit;
        else if (stockFilter === "outstock") matchesStock = p.stock === 0;

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
            <td><span class="badge badge-info">${p.category.split(' ')[0]}</span></td>
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
    lucide.createIcons();
}

export function isExpired(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
}

export function handleProductFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("product-id").value;
    const barcode = document.getElementById("prod-barcode").value;
    const name = document.getElementById("prod-name").value;
    const category = document.getElementById("prod-category").value;
    const cost = parseFloat(document.getElementById("prod-cost").value);
    const price = parseFloat(document.getElementById("prod-price").value);
    const stock = parseInt(document.getElementById("prod-stock").value);
    const expiry = document.getElementById("prod-expiry").value;
    const image = document.getElementById("prod-image").value;

    if (id) {
        // Edit existing
        const index = state.products.findIndex(p => p.id === id);
        if (index !== -1) {
            state.products[index] = { id, barcode, name, category, cost, price, stock, expiry, image };
        }
    } else {
        // Add new
        const newId = (state.products.length + 1).toString();
        state.products.push({ id: newId, barcode, name, category, cost, price, stock, expiry, image });
    }

    saveState();
    document.getElementById("product-modal").classList.remove("active");
    document.getElementById("product-form").reset();
    document.getElementById("product-id").value = "";
    renderInventory();
}

export function editProduct(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;

    document.getElementById("product-id").value = p.id;
    document.getElementById("prod-barcode").value = p.barcode;
    document.getElementById("prod-name").value = p.name;
    document.getElementById("prod-category").value = p.category;
    document.getElementById("prod-cost").value = p.cost;
    document.getElementById("prod-price").value = p.price;
    document.getElementById("prod-stock").value = p.stock;
    document.getElementById("prod-expiry").value = p.expiry;
    document.getElementById("prod-image").value = p.image;

    document.getElementById("product-modal-title").textContent = state.language === "ar" ? "تعديل المنتج" : "Edit Product";
    document.getElementById("product-modal").classList.add("active");
}

export function deleteProduct(id) {
    if (confirm(state.language === "ar" ? "هل أنت متأكد من حذف هذا المنتج؟" : "Are you sure you want to delete this product?")) {
        state.products = state.products.filter(p => p.id !== id);
        saveState();
        renderInventory();
    }
}
