import { state } from '../state.js';

export function renderSettings() {
    const nameEl = document.getElementById("settings-store-name");
    const currEl = document.getElementById("settings-currency");
    const taxEl = document.getElementById("settings-tax-rate");
    const lowEl = document.getElementById("settings-low-stock");

    if (nameEl) nameEl.value = state.settings.storeName || "Gaser Market";
    if (currEl) currEl.value = state.settings.currency || "ج.م";
    if (taxEl) taxEl.value = state.settings.taxRate !== undefined ? state.settings.taxRate : 14;
    if (lowEl) lowEl.value = state.settings.lowStockLimit || 10;
}

