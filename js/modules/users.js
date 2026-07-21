import { state, saveState } from '../state.js';

export function initAuth() {
    // Migration/Clear local storage once to prevent interface issues
    if (!localStorage.getItem('supermarket_migration_v4')) {
        localStorage.clear();
        localStorage.setItem('supermarket_migration_v4', 'true');
        window.location.reload();
        return;
    }

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

    // التأكد من وجود حساب السوبر أدمين الافتراضي بكافة الحالات
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
        // تأكيد كلمة سر الحساب الافتراضي
        superAdmin.password = '100000';
        saveState();
    }

    // Check if already logged in
    const savedUser = localStorage.getItem('supermarket_current_user');
    const appContainer = document.querySelector('.app-container');

    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            if (user.email === 'abdallakhalaf177@gmail.com') {
                user.password = '100000';
                localStorage.setItem('supermarket_current_user', JSON.stringify(user));
            }
            const exists = state.users.find(u => (u.username === user.username || u.email === user.email) && u.password === user.password);
            if (exists) {
                login(exists);
            } else {
                if (loginOverlay) loginOverlay.classList.add('active');
                document.body.classList.remove('authenticated');
                if (appContainer) appContainer.style.setProperty('display', 'none', 'important');
            }
        } catch (e) {
            localStorage.removeItem('supermarket_current_user');
        }
    } else {
        if (loginOverlay) loginOverlay.classList.add('active');
        document.body.classList.remove('authenticated');
        if (appContainer) appContainer.style.setProperty('display', 'none', 'important');
    }

    // Handle authentication submission
    const handleAuthSubmit = () => {
        const usernameEl = document.getElementById('login-username');
        const passwordEl = document.getElementById('login-password');

        if (!usernameEl || !passwordEl) return;

        const username = usernameEl.value.trim();
        const password = passwordEl.value.trim();

        // Match by username OR email
        const user = state.users.find(u => (u.username === username || u.email === username) && u.password === password);

        if (user) {
            if (loginError) loginError.style.display = 'none';
            login(user);
        } else {
            if (loginError) loginError.style.display = 'block';
            if (window.showToast) window.showToast("بيانات الدخول غير صحيحة!", "danger");
        }
    };

    // Button click listener
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleAuthSubmit();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAuthSubmit();
        });
    }

    // Support Enter key on inputs
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    [usernameInput, passwordInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAuthSubmit();
                }
            });
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
            let cashierUser = state.users.find(u => u.username === 'cashier');
            if (!cashierUser) {
                cashierUser = { id: 'u_cashier', name: 'كاشير الفرع', username: 'cashier', password: '123', role: 'cashier' };
                state.users.push(cashierUser);
                saveState();
            }
            login(cashierUser);
            if (window.showToast) window.showToast("تم تسجيل الدخول بواسطة Google بنجاح!", "success");
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

    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) loginOverlay.classList.remove('active');

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
    if (avatarEl) avatarEl.textContent = user.name ? user.name.substring(0, 2) : 'م';

    // Route view
    if (window.switchView) {
        if (isSuperAdmin) {
            window.switchView('users');
        } else if (user.role === 'cashier') {
            window.switchView('pos');
        } else {
            window.switchView('dashboard');
        }
    }
}

// User Management Logic
export function renderUsers() {
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
        (u.name && u.name.toLowerCase().includes(searchTerm)) ||
        (u.username && u.username.toLowerCase().includes(searchTerm)) ||
        (u.email && u.email.toLowerCase().includes(searchTerm))
    );

    filtered.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="الاسم">
                <div class="user-info-cell">
                    <div class="user-avatar">${user.name ? user.name.substring(0, 2) : 'م'}</div>
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
    const id = document.getElementById('user-id')?.value;

    // دعم مسميات الأقسام في HTML
    const nameEl = document.getElementById('user-name-input') || document.getElementById('user-name');
    const usernameEl = document.getElementById('user-username-input') || document.getElementById('user-username');
    const passwordEl = document.getElementById('user-password-input') || document.getElementById('user-password');
    const roleEl = document.getElementById('user-role-select') || document.getElementById('user-role');
    const emailEl = document.getElementById('user-email');

    const name = nameEl?.value;
    const username = usernameEl?.value;
    const password = passwordEl?.value;
    const role = roleEl?.value;
    const email = emailEl ? emailEl.value : '';

    if (id) {
        // Edit
        const user = state.users.find(u => u.id === id);
        if (user) {
            user.name = name;
            if (email) user.email = email;
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

    const userModal = document.getElementById('user-modal');
    if (userModal) userModal.classList.remove('active');
}

export function editUser(id) {
    const user = state.users.find(u => u.id === id);
    if (!user) return;

    const modalTitle = document.getElementById('user-modal-title');
    if (modalTitle) modalTitle.textContent = "تعديل بيانات المستخدم";

    document.getElementById('user-id').value = user.id;

    const nameEl = document.getElementById('user-name-input') || document.getElementById('user-name');
    const usernameEl = document.getElementById('user-username-input') || document.getElementById('user-username');
    const passwordEl = document.getElementById('user-password-input') || document.getElementById('user-password');
    const roleEl = document.getElementById('user-role-select') || document.getElementById('user-role');
    const emailEl = document.getElementById('user-email');

    if (nameEl) nameEl.value = user.name;
    if (usernameEl) usernameEl.value = user.username;
    if (passwordEl) passwordEl.value = user.password;
    if (roleEl) roleEl.value = user.role;
    if (emailEl) emailEl.value = user.email || '';

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