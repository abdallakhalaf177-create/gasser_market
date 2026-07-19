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

        // Match by username OR email
        const user = state.users.find(u => (u.username === username || u.email === username) && u.password === password);
        
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

    const isSuperAdmin = user.email === 'abdallakhalaf177@gmail.com';
    document.body.setAttribute('data-superadmin', isSuperAdmin ? 'true' : 'false');

    // Update profile UI
    const nameEl = document.getElementById('current-user-name');
    const roleEl = document.getElementById('current-user-role');
    const avatarEl = document.getElementById('current-user-avatar');
    
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = isSuperAdmin ? 'المدير الرئيسي' : (user.role === 'admin' ? 'مدير' : 'كاشير');
    if (avatarEl) avatarEl.textContent = user.name.substring(0, 4);

    // Routing Logic:
    if (user.role === 'cashier') {
        if (window.switchView) window.switchView('pos');
    } else {
        // Admin
        if (window.switchView) window.switchView('dashboard');
    }

    // Intercept switchView if they try to view users without being super admin
    if (window.switchView) {
        const originalSwitch = window.switchView;
        window.switchView = function(viewName) {
            if (viewName === 'users' && state.currentUser?.email !== 'abdallakhalaf177@gmail.com') {
                if (window.showToast) window.showToast("عذراً، هذه الصفحة للمدير الرئيسي فقط!", "danger");
                originalSwitch('pos'); // Force redirect to cashier
                return;
            }
            originalSwitch(viewName);
        };
    }
}

// User Management Logic
export function renderUsers() {
    // Only allow Super Admin to render this
    if (state.currentUser?.email !== 'abdallakhalaf177@gmail.com') return;

    const gridContainer = document.getElementById('users-grid-container');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    const searchTerm = (document.getElementById('users-search')?.value || '').toLowerCase();
    
    const filtered = state.users.filter(u => 
        u.name.toLowerCase().includes(searchTerm) || 
        u.username.toLowerCase().includes(searchTerm) ||
        (u.email && u.email.toLowerCase().includes(searchTerm))
    );
    
    filtered.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card-item';
        card.innerHTML = `
            <div class="user-card-header">
                <div class="user-avatar">${user.name.substring(0,2)}</div>
                <div class="user-main-info">
                    <h4>${user.name}</h4>
                    <span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'}">${user.role === 'admin' ? 'مدير' : 'كاشير'}</span>
                </div>
            </div>
            <div class="user-card-body">
                <p><strong>الإيميل:</strong> ${user.email || '—'}</p>
                <p><strong>اسم المستخدم:</strong> ${user.username}</p>
                <p><strong>الباسورد:</strong> <span class="password-mask">••••••••</span></p>
            </div>
            <div class="user-card-actions">
                <button class="btn btn-secondary btn-full" onclick="window.editUser('${user.id}')">
                    <i data-lucide="edit-2"></i> تعديل
                </button>
                <button class="btn btn-danger btn-full" onclick="window.deleteUser('${user.id}')" ${user.email === 'abdallakhalaf177@gmail.com' ? 'disabled' : ''}>
                    <i data-lucide="trash-2"></i> حذف
                </button>
            </div>
        `;
        gridContainer.appendChild(card);
    });
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

export function handleUserFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const username = document.getElementById('user-username').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    
    if (id) {
        // Edit
        const user = state.users.find(u => u.id === id);
        if (user) {
            user.name = name;
            user.email = email;
            user.username = username;
            user.password = password;
            user.role = role;
            if (window.showToast) window.showToast("تم تحديث بيانات المستخدم", "success");
        }
    } else {
        // Check if username or email exists
        if (state.users.some(u => u.username === username)) {
            if (window.showToast) window.showToast("اسم المستخدم موجود بالفعل!", "danger");
            return;
        }
        if (state.users.some(u => u.email === email)) {
            if (window.showToast) window.showToast("هذا الإيميل مسجل بالفعل!", "danger");
            return;
        }
        
        // Add
        const newUser = {
            id: 'u_' + Date.now(),
            name,
            email,
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
    document.getElementById('user-email').value = user.email || '';
    document.getElementById('user-username').value = user.username;
    document.getElementById('user-password').value = user.password;
    document.getElementById('user-role').value = user.role;
    
    document.getElementById('user-modal').classList.add('active');
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
