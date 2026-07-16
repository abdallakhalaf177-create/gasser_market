import { state, saveState } from '../state.js';
import { renderPOSCategoryDropdowns } from './pos.js';

export function handleCategoryFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("new-cat-name").value.trim();
    if (name && !state.categories.includes(name)) {
        state.categories.push(name);
        saveState();
        document.getElementById("new-cat-name").value = "";
        renderCategoriesList();
        renderPOSCategoryDropdowns();
    }
}

export function renderCategoriesList() {
    const ul = document.getElementById("categories-list-ul");
    if (!ul) return;
    ul.innerHTML = "";
    state.categories.forEach(c => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${c}</span>
            <button class="btn btn-icon text-danger btn-sm" onclick="deleteCategory('${c}')">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
        `;
        ul.appendChild(li);
    });
    lucide.createIcons();
}

export function deleteCategory(catName) {
    if (confirm(state.language === "ar" ? `هل أنت متأكد من حذف فئة "${catName}"؟` : `Are you sure you want to delete category "${catName}"?`)) {
        state.categories = state.categories.filter(c => c !== catName);
        saveState();
        renderCategoriesList();
        renderPOSCategoryDropdowns();
    }
}
