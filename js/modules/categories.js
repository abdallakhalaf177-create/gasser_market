import { state, saveState } from '../state.js';
import { renderPOSCategoryDropdowns } from './pos.js';

export function handleCategoryFormSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("new-cat-name");
    if (!input) return;
    const name = input.value.trim();
    if (name && !state.categories.includes(name)) {
        state.categories.push(name);
        saveState();
        input.value = "";
        renderCategoriesList();
        renderPOSCategoryDropdowns();
    }
}

export function renderCategoriesList() {
    const ul = document.getElementById("categories-list-ul");
    if (!ul) return;
    ul.innerHTML = "";
    (state.categories || []).forEach(c => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = c;

        const btn = document.createElement("button");
        btn.className = "btn btn-icon text-danger btn-sm";
        btn.innerHTML = `<i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>`;
        btn.onclick = () => deleteCategory(c);

        li.appendChild(span);
        li.appendChild(btn);
        ul.appendChild(li);
    });
    if (window.lucide) window.lucide.createIcons();
}

export async function deleteCategory(catName) {
    const msg = state.language === "ar" ? `هل أنت متأكد من حذف فئة "${catName}"؟` : `Are you sure you want to delete category "${catName}"?`;
    const confirmed = window.customConfirm ? await window.customConfirm(msg) : confirm(msg);
    if (confirmed) {
        state.categories = (state.categories || []).filter(c => c !== catName);
        saveState();
        renderCategoriesList();
        renderPOSCategoryDropdowns();
        if (window.refreshCurrentView) window.refreshCurrentView();
    }
}
