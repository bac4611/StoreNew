/**
 * Module: auth.js
 * Purpose: Login/register/forgot password flows and auth page state toggles.
 * Main entry points: login(), register(), handleForgotPass(), logout().
 */
// Muc dich:
// Chuyen doi giua cac form xac thuc (dang nhap, dang ky, quen mat khau) tren cung mot trang.
// Ham se an tat ca form, hien form muc tieu, dong ket qua cu cua quen mat khau va hien thong diep huong dan mac dinh.
function toggleForm(targetFormId) {
    const allForms = document.querySelectorAll('.auth-form-container');
    allForms.forEach(form => {
        form.classList.add('hide-menu');
    });
    
    const targetForm = document.getElementById(targetFormId);
    if(targetForm) {
        targetForm.classList.remove('hide-menu');
    }

    const resultBox = document.getElementById('forgotResultBox');
    if(resultBox) resultBox.classList.add('hide-menu');

    showAuthMessage('Điền thông tin phù hợp để tiếp tục thao tác.', 'info');
}

// Muc dich:
// Hien thi thong bao phan hoi cho nguoi dung trong khu vuc auth (info/success/error).
// Neu khong tim thay vung hien thi, ham fallback bang alert de dam bao thong diep van duoc gui den nguoi dung.
function showAuthMessage(message, type = 'info') {
    const feedback = document.getElementById('authFeedback');
    if (!feedback) {
        alert(message);
        return;
    }

    feedback.innerText = message;
    feedback.className = 'auth-feedback';

    if (type === 'error') {
        feedback.classList.add('error');
    } else if (type === 'success') {
        feedback.classList.add('success');
    } else {
        feedback.classList.add('info');
    }
}

// Muc dich:
// Xu ly su kien dang nhap, xac thuc tai khoan va tao phien dang nhap bang localStorage.
// Ham ho tro:
// - Tai khoan admin hard-code de truy cap nhanh trang quan tri.
// - Dang nhap user thuong theo users trong localStorage.
// - Chan dang nhap neu tai khoan bi khoa.
// Sau khi thanh cong, chuyen huong sang index.html.
function login(event) {
    if(event) event.preventDefault();

    const accountInput = document.getElementById('email'); 
    const passInput = document.getElementById('password');

    if(!accountInput || !passInput) return false;

    const account = accountInput.value.trim();
    const password = passInput.value.trim();

    if ((account === 'admin' || account === 'admin123') && (password === 'admin' || password === 'admin123' || password === '1')) {
        const adminUser = { name: 'admin', email: 'admin@gunstore.com', role: 'admin', status: 'active' };
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        window.location.href = 'index.html'; 
        return false;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => (u.email === account || u.name === account || u.username === account) && u.password === password);

    if (user) {
        if (user.status === 'locked') {
            showAuthMessage('Tài khoản của bạn đang bị khóa bởi quản trị viên.', 'error');
            return false;
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'index.html';
    } else {
        showAuthMessage('Sai tên tài khoản, email hoặc mật khẩu.', 'error');
    }
    
    return false;
}

// Muc dich:
// Tao tai khoan moi cho khach hang va luu vao localStorage.
// Ham kiem tra du lieu bat buoc, tranh trung ten/email, khoi tao thong tin mac dinh
// (role, spent, status), sau do chuyen ve form dang nhap va bao ket qua thanh cong.
function register(event) {
    if(event) event.preventDefault();

    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passInput = document.getElementById('reg-password');

    if(!nameInput || !emailInput || !passInput) return false;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    if(!name || !email || !password) {
        showAuthMessage('Vui lòng điền đầy đủ thông tin đăng ký.', 'error');
        return false;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    // Kiem tra trung lap ten hien thi hoac email.
    const exist = users.find(u => u.email === email || u.name === name || u.username === name);
    if(exist) {
        showAuthMessage('Tên hiển thị hoặc Email này đã tồn tại trên hệ thống.', 'error');
        return false;
    }

    const newUser = {
        username: name,
        name: name,
        email: email,
        password: password,
        role: 'customer',
        spent: 0,
        status: 'active'
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    toggleForm('login-form'); 
    showAuthMessage('Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.', 'success');
    
    return false;
}

// Muc dich:
// Ho tro luong "quen mat khau" bang cach tim user theo email va hien mat khau da luu.
// Neu tim thay, mo hop ket qua de nguoi dung xem; neu khong tim thay thi an hop ket qua va bao loi.
function handleForgotPass(event) {
    if(event) event.preventDefault();
    
    const email = document.getElementById('forgot-email').value.trim();
    if(!email) {
        showAuthMessage('Vui lòng nhập email để hệ thống định vị tài khoản.', 'error');
        return false;
    }
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);

    const resultBox = document.getElementById('forgotResultBox');
    const recoveredPasswordEl = document.getElementById('recoveredPassword');

    if (user && user.password) {
        showAuthMessage('Đã tìm thấy dữ liệu khớp với Email.', 'success');
        recoveredPasswordEl.innerText = user.password;
        resultBox.classList.remove('hide-menu');
    } else {
        resultBox.classList.add('hide-menu');
        showAuthMessage('Email này chưa được đăng ký trong hệ thống.', 'error');
    }

    return false;
}

// Muc dich:
// Ket thuc phien dang nhap hien tai bang cach xoa currentUser khoi localStorage,
// sau do dieu huong nguoi dung ve trang home.html.
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'home.html';
}
