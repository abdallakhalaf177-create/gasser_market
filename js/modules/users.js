import { state, saveState } from '../state.js';

export function initAuth() {
    // Migration v5 — clear once if schema outdated to ensure fresh start
    if (!localStorage.getItem('supermarket_migration_v5')) {
        localStorage.clear();
        localStorage.setItem('supermarket_migration_v5', 'true');
        window.location.reload();
        return;
    }

    if (!state.users || !Array.isArray(state.users)) {
        state.users = [];
    }

    let superAdmin = state.users.find(u => u.email === 'abdallakhalaf177@gmail.com');
    if (!superAdmin) {
        superAdmin = {
            id: 'u_superadmin',
            name: 'عبد الله محمد',
            email: 'abdallakhalaf177@gmail.com',
            username: 'abdallah',
            password: '100000',
            role: 'admin'
        };
        state.users.push(superAdmin);
        saveState();
    } else {
        superAdmin.password = '100000';
        saveState();
    }

    // Auto login
    login(superAdmin);

    // Hide logout button since we have no Auth now
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }
}

function login(user) {
    state.currentUser = user;
    localStorage.setItem('supermarket_current_user', JSON.stringify(user));

    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) loginOverlay.style.display = 'none';

    document.body.classList.add('authenticated');
    document.body.setAttribute('data-role', user.role);

    const appContainer = document.querySelector('.app-container');
    if (appContainer) appContainer.style.display = 'block';

    const isSuperAdmin = user.email === 'abdallakhalaf177@gmail.com';
    document.body.setAttribute('data-superadmin', isSuperAdmin ? 'true' : 'false');

    // Update profile UI
    const nameEl = document.getElementById('current-user-display') || document.getElementById('current-user-name');
    if (nameEl) {
        nameEl.innerHTML = `<i class="ri-user-line"></i> ${user.name}`;
    }

    // Always route to POS view on startup
    if (window.switchView) {
        window.switchView('pos');
    }
}

// User Management Logic
export function renderUsers() {
    const gridContainer = document.getElementById('users-table-body');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    const searchTerm = (document.getElementById('users-search')?.value || '').toLowerCase();
    const filtered = (state.users || []).filter(u =>
        (u.name && u.name.toLowerCase().includes(searchTerm)) ||
        (u.username && u.username.toLowerCase().includes(searchTerm)) ||
        (u.email && u.email.toLowerCase().includes(searchTerm))
    );

    filtered.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td>${user.role === 'admin' ? 'مدير' : 'كاشير'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="window.editUser('${user.id}')">تعديل</button>
                <button class="btn btn-sm btn-danger" onclick="window.deleteUser('${user.id}')" ${user.email === 'abdallakhalaf177@gmail.com' ? 'disabled' : ''}>حذف</button>
            </td>
        `;
        gridContainer.appendChild(tr);
    });
}

export function handleUserFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('user-id')?.value;

    const nameEl = document.getElementById('user-name-input');
    const usernameEl = document.getElementById('user-username-input');
    const passwordEl = document.getElementById('user-password-input');
    const roleEl = document.getElementById('user-role-select');

    const name = nameEl?.value;
    const username = usernameEl?.value;
    const password = passwordEl?.value;
    const role = roleEl?.value;

    if (id) {
        const user = state.users.find(u => u.id === id);
        if (user) {
            user.name = name;
            user.username = username;
            if (password) user.password = password;
            user.role = role;
            if (window.showToast) window.showToast("تم تحديث بيانات المستخدم", "success");
        }
    } else {
        if (state.users.some(u => u.username === username)) {
            if (window.showToast) window.showToast("اسم المستخدم موجود بالفعل!", "danger");
            return;
        }

        const newUser = {
            id: 'u_' + Date.now(),
            name,
            username,
            password,
            role
        };
        state.users.push(newUser);
        if (window.showToast) window.showToast("تمت إضافة المستخدم بنجاح", "success");
    }

    saveState();
    renderUsers();

    const userModal = document.getElementById('user-modal');
    if (userModal) userModal.classList.remove('active');
}

export function editUser(id) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;

    const modalTitle = document.getElementById('user-modal-title');
    if (modalTitle) modalTitle.textContent = "تعديل بيانات المستخدم";

    document.getElementById('user-id').value = user.id;

    const nameEl = document.getElementById('user-name-input');
    const usernameEl = document.getElementById('user-username-input');
    const passwordEl = document.getElementById('user-password-input');
    const roleEl = document.getElementById('user-role-select');

    if (nameEl) nameEl.value = user.name;
    if (usernameEl) usernameEl.value = user.username;
    if (passwordEl) passwordEl.value = user.password;
    if (roleEl) roleEl.value = user.role;

    const userModal = document.getElementById('user-modal');
    if (userModal) userModal.classList.add('active');
}

export function deleteUser(id) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;

    if (user.email === 'abdallakhalaf177@gmail.com') {
        if (window.showToast) window.showToast("لا يمكن حذف حساب المدير الرئيسي!", "danger");
        return;
    }
    if (state.currentUser && state.currentUser.id === id) {
        if (window.showToast) window.showToast("لا يمكنك حذف حسابك أثناء تسجيل الدخول!", "danger");
        return;
    }
    if (confirm("هل أنت متأكد من حذف هذا المستخدم نهائياً؟")) {
        state.users = state.users.filter(u => u.id !== id);
        saveState();
        renderUsers();
        if (window.showToast) window.showToast("تم حذف المستخدم", "success");
    }
}