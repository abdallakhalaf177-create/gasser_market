import { state, saveState } from '../state.js';

export function initAuth() {
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Google Login button & overlay elements
    const googleLoginBtn = document.getElementById('google-login-btn');
    const googleMockOverlay = document.getElementById('google-mock-overlay');
    const closeGoogleMockBtn = document.getElementById('close-google-mock-btn');
    const googleOptSuperadmin = document.getElementById('google-opt-superadmin');
    const googleOptCashier = document.getElementById('google-opt-cashier');

    // Force default super admin password in active state
    const superAdmin = state.users.find(u => u.email === 'abdallakhalaf177@gmail.com');
    if (superAdmin && superAdmin.password !== '100000') {
        superAdmin.password = '100000';
        saveState();
    }

    // Check if already logged in
    const savedUser = localStorage.getItem('supermarket_current_user');
    const appContainer = document.querySelector('.app-container');

    if (savedUser) {
        const user = JSON.parse(savedUser);
        // Verify user still exists in state and check updated password for super admin
        if (user.email === 'abdallakhalaf177@gmail.com') {
            user.password = '100000';
            localStorage.setItem('supermarket_current_user', JSON.stringify(user));
        }
        const exists = state.users.find(u => u.username === user.username && u.password === user.password);
        if (exists) {
            login(exists);
        } else {
            loginOverlay.classList.add('active');
            document.body.classList.remove('authenticated');
            if (appContainer) appContainer.style.setProperty('display', 'none', 'important');
        }
    } else {
        loginOverlay.classList.add('active');
        document.body.classList.remove('authenticated');
        if (appContainer) appContainer.style.setProperty('display', 'none', 'important');
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

    if (googleLoginBtn && googleMockOverlay) {
        googleLoginBtn.addEventListener('click', () => {
            googleMockOverlay.style.display = 'flex';
        });
    }

    if (closeGoogleMockBtn && googleMockOverlay) {
        closeGoogleMockBtn.addEventListener('click', () => {
            googleMockOverlay.style.display = 'none';
        });
    }

    if (googleOptSuperadmin) {
        googleOptSuperadmin.addEventListener('click', () => {
            googleMockOverlay.style.display = 'none';
            const superAdminUser = state.users.find(u => u.email === 'abdallakhalaf177@gmail.com');
            if (superAdminUser) {
                login(superAdminUser);
                if (window.showToast) window.showToast("تم تسجيل الدخول بواسطة Google بنجاح!", "success");
            }
        });
    }

    if (googleOptCashier) {
        googleOptCashier.addEventListener('click', () => {
            googleMockOverlay.style.display = 'none';
            const cashierUser = state.users.find(u => u.username === 'cashier');
            if (cashierUser) {
                login(cashierUser);
                if (window.showToast) window.showToast("تم تسجيل الدخول بواسطة Google بنجاح!", "success");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('supermarket_current_user');
            state.currentUser = null;
            document.body.classList.remove('authenticated');
            if (appContainer) appContainer.style.setProperty('display', 'none', 'important');
            window.location.reload();
        });
    }
}

function login(user) {
    state.currentUser = user;
    localStorage.setItem('supermarket_current_user', JSON.stringify(user));
    
    document.getElementById('login-overlay').classList.remove('active');
    document.body.classList.add('authenticated');
    document.body.setAttribute('data-role', user.role);

    const appContainer = document.querySelector('.app-container');
    if (appContainer) appContainer.style.setProperty('display', 'flex', 'important');

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
    
    gridContainer.innerHTML = `
        <table class="users-responsive-table">
            <thead>
                <tr>
                    <th>الاسم</th>
                    <th>الإيميل</th>
                    <th>اسم المستخدم</th>
                    <th>الصلاحية</th>
                    <th>العمليات</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;
    
    const tbody = gridContainer.querySelector('tbody');
    
    const searchTerm = (document.getElementById('users-search')?.value || '').toLowerCase();
    
    const filtered = state.users.filter(u => 
        u.name.toLowerCase().includes(searchTerm) || 
        u.username.toLowerCase().includes(searchTerm) ||
        (u.email && u.email.toLowerCase().includes(searchTerm))
    );
    
    filtered.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="الاسم">
                <div class="user-info-cell">
                    <div class="user-avatar">${user.name.substring(0,2)}</div>
                    <div><strong>${user.name}</strong></div>
                </div>
            </td>
            <td data-label="الإيميل">${user.email || '—'}</td>
            <td data-label="اسم المستخدم"><span class="badge badge-outline">${user.username}</span></td>
            <td data-label="الصلاحية"><span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'}">${user.role === 'admin' ? 'مدير' : 'كاشير'}</span></td>
            <td data-label="العمليات">
                <div class="action-buttons-cell">
                    <button class="btn btn-secondary btn-sm" onclick="window.editUser('${user.id}')">
                        <i data-lucide="edit-2"></i> تعديل
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.deleteUser('${user.id}')" ${user.email === 'abdallakhalaf177@gmail.com' ? 'disabled' : ''}>
                        <i data-lucide="trash-2"></i> حذف
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
