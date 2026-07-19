import { state, saveState } from '../state.js';

export function initAuth() {
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Check if already logged in
    const savedUser = localStorage.getItem('supermarket_current_user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        // Verify user still exists in state
        const exists = state.users.find(u => u.username === user.username && u.password === user.password);
        if (exists) {
            login(exists);
        } else {
            loginOverlay.classList.add('active');
        }
    } else {
        loginOverlay.classList.add('active');
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        const user = state.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            loginError.style.display = 'none';
            login(user);
        } else {
            loginError.style.display = 'block';
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('supermarket_current_user');
            state.currentUser = null;
            window.location.reload();
        });
    }
}

function login(user) {
    state.currentUser = user;
    localStorage.setItem('supermarket_current_user', JSON.stringify(user));
    
    document.getElementById('login-overlay').classList.remove('active');
    document.body.setAttribute('data-role', user.role);

    // Update profile UI
    const nameEl = document.getElementById('current-user-name');
    const roleEl = document.getElementById('current-user-role');
    const avatarEl = document.getElementById('current-user-avatar');
    
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role === 'admin' ? 'المدير العام' : 'كاشير';
    if (avatarEl) avatarEl.textContent = user.name.substring(0, 4);

    // Routing
    if (user.role === 'cashier') {
        if (window.switchView) {
            window.switchView('pos');
        }
    } else {
        if (window.switchView) {
            window.switchView('dashboard');
        }
    }
}

// User Management Logic
export function renderUsers() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const searchTerm = (document.getElementById('users-search')?.value || '').toLowerCase();
    
    const filtered = state.users.filter(u => 
        u.name.toLowerCase().includes(searchTerm) || 
        u.username.toLowerCase().includes(searchTerm)
    );
    
    filtered.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${user.name.substring(0,2)}</div>
                    <div>${user.name}</div>
                </div>
            </td>
            <td><span class="badge badge-outline">${user.username}</span></td>
            <td><span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'}">${user.role === 'admin' ? 'مدير' : 'كاشير'}</span></td>
            <td><span class="password-mask" style="letter-spacing: 2px;">••••••••</span></td>
            <td>
                <div class="action-buttons-cell" style="display: flex; gap: 5px;">
                    <button class="btn btn-icon btn-secondary" onclick="window.editUser('${user.id}')" title="تعديل">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn btn-icon btn-danger" onclick="window.deleteUser('${user.id}')" title="حذف" ${user.id === 'u1' ? 'disabled' : ''}>
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

export function handleUserFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;
    const username = document.getElementById('user-username').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    
    if (id) {
        // Edit
        const user = state.users.find(u => u.id === id);
        if (user) {
            user.name = name;
            user.username = username;
            user.password = password;
            user.role = role;
            if (window.showToast) window.showToast("تم تحديث بيانات المستخدم", "success");
        }
    } else {
        // Check if username exists
        if (state.users.some(u => u.username === username)) {
            if (window.showToast) window.showToast("اسم المستخدم موجود بالفعل!", "danger");
            return;
        }
        
        // Add
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
    document.getElementById('user-modal').classList.remove('active');
}

export function editUser(id) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById('user-modal-title').textContent = "تعديل بيانات المستخدم";
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-username').value = user.username;
    document.getElementById('user-password').value = user.password;
    document.getElementById('user-role').value = user.role;
    
    document.getElementById('user-modal').classList.add('active');
}

export function deleteUser(id) {
    if (id === 'u1') {
        if (window.showToast) window.showToast("لا يمكن حذف المدير الرئيسي!", "danger");
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
