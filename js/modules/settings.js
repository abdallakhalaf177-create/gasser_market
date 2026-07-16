import { state } from '../state.js';

export function renderSettings() {
    document.getElementById("settings-store-name").value = state.settings.storeName;
    document.getElementById("settings-currency").value = state.settings.currency;
    document.getElementById("settings-tax-rate").value = state.settings.taxRate;
    document.getElementById("settings-low-stock").value = state.settings.lowStockLimit;
}
