// TỰ ĐỘNG BƠM GIAO DIỆN VÀO HỆ THỐNG
/**
 * Module: personal-info.js
 * Purpose: Inject and manage personal profile view for current user.
 * Main entry points: injectPersonalInfoView(), renderPersonalInfo(), savePersonalInfo().
 */
function injectPersonalInfoView() {
    if(document.querySelector('[id="view-personal-info"]')) return;
    const mainContent = document.querySelector('.main-content');
    if(!mainContent) return;

    const view = document.createElement('div');
    view.id = 'view-personal-info';
    view.className = 'hide-menu';
    view.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <h2 class="section-title" style="margin-bottom: 0;">HỒ SƠ CÁ NHÂN</h2>
        </div>
        <div style="display: flex; gap: 30px; align-items: flex-start;">
            
            <div style="background: rgb(0, 0, 0); padding: 30px; border-radius: 16px; width: 350px; text-align: center; border: 1px solid rgb(51, 65, 85);">
                <div style="width: 100px; height: 100px; background: rgb(0, 110, 255); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold; color: rgb(255,255,255); margin: 0 auto 20px;" id="profile-avatar">U</div>
                <h3 style="color: rgb(255, 255, 255); font-size: 24px; margin-bottom: 5px;" id="profile-name">Đang tải...</h3>
                <p style="color: rgb(148, 163, 184); margin-bottom: 15px;" id="profile-email">Đang tải...</p>
                
                <div id="profile-vip-badge" style="display: none; margin-bottom: 20px;">
                    <span style="background: linear-gradient(135deg, rgb(251, 191, 36), rgb(245, 158, 11)); color: rgb(0, 0, 0); padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);"><i class="fa-solid fa-crown"></i> KHÁCH HÀNG VIP</span>
                </div>
                
                <div style="background: rgb(15, 23, 42); padding: 15px; border-radius: 8px; border: 1px solid rgb(255, 255, 255);">
                    <div style="color: rgb(148, 163, 184); font-size: 14px; margin-bottom: 5px;">Thời gian hoạt động</div>
                    <div style="color: rgb(34, 197, 94); font-size: 24px; font-weight: bold;" id="profile-active-days">0 ngày</div>
                </div>
            </div>

            <div style="flex: 1; background: rgb(30, 41, 59); padding: 30px; border-radius: 16px; border: 1px solid rgb(255, 255, 255);">
                <h3 style="color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 18px; border-bottom: 1px solid rgb(255, 255, 255); padding-bottom: 10px;">Cập nhật thông tin</h3>
                <div class="admin-form-group full-width">
                    <label>Tên đăng nhập (Nickname)</label>
                    <input type="text" id="editProfileName">
                </div>
                <div class="admin-form-group full-width">
                    <label>Địa chỉ Email</label>
                    <input type="email" id="editProfileEmail">
                </div>
                <div class="admin-form-group full-width">
                    <label>Mật khẩu mới (Bỏ trống nếu không muốn đổi)</label>
                    <input type="password" id="editProfilePassword" placeholder="Nhập mật khẩu mới...">
                </div>
                <div style="margin-top: 25px; text-align: right;">
                    <button class="tactical-btn" style="width: auto; padding: 12px 30px; background: rgb(0, 110, 255);" onclick="savePersonalInfo()">LƯU THAY ĐỔI</button>
                </div>
            </div>

        </div>
    `;
    mainContent.appendChild(view);
}
injectPersonalInfoView();

// CÁC HÀM XỬ LÝ LÕI
window.renderPersonalInfo = function() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(!currentUser) return;

    // Chốt mốc thời gian hoạt động cố định
    let needSave = false;
    if(!currentUser.joinDate) {
        // Lấy chính xác thời điểm hiện tại làm mốc ban đầu
        currentUser.joinDate = new Date().toISOString();
        needSave = true;
        
        // Đồng bộ mốc thời gian này vào kho dữ liệu tổng nếu là Khách hàng
        if(currentUser.role !== 'admin') {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            let uIndex = users.findIndex(u => u.email === currentUser.email);
            if(uIndex > -1) {
                users[uIndex].joinDate = currentUser.joinDate;
                localStorage.setItem('users', JSON.stringify(users));
            }
        }
    }
    
    if (needSave) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // Thuật toán đếm ngày: Mặc định là 1, cứ qua 24h thì cộng 1
    const joinTime = new Date(currentUser.joinDate).getTime();
    const nowTime = new Date().getTime();
    // Đảm bảo không bị âm thời gian
    const diffTime = Math.max(0, nowTime - joinTime); 
    const activeDays = 1 + Math.floor(diffTime / (1000 * 60 * 60 * 24));

    document.querySelector('[id="profile-avatar"]').innerText = currentUser.name.charAt(0).toUpperCase();
    document.querySelector('[id="profile-name"]').innerText = currentUser.name;
    document.querySelector('[id="profile-email"]').innerText = currentUser.email;
    document.querySelector('[id="profile-active-days"]').innerText = activeDays + ' ngày';

    // Rà soát danh hiệu VIP
    const vipBadge = document.querySelector('[id="profile-vip-badge"]');
    if(currentUser.role !== 'admin') {
        const threshold = parseInt(localStorage.getItem('vipThreshold')) || 10000;
        if(currentUser.spent >= threshold) {
            vipBadge.style.display = 'inline-block';
        } else {
            vipBadge.style.display = 'none';
        }
    } else {
        vipBadge.style.display = 'none';
    }

    // Đổ dữ liệu vào form cập nhật
    document.querySelector('[id="editProfileName"]').value = currentUser.name;
    document.querySelector('[id="editProfileEmail"]').value = currentUser.email;
    document.querySelector('[id="editProfilePassword"]').value = '';
};

window.savePersonalInfo = function() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(!currentUser) return;

    const newName = document.querySelector('[id="editProfileName"]').value.trim();
    const newEmail = document.querySelector('[id="editProfileEmail"]').value.trim();
    const newPass = document.querySelector('[id="editProfilePassword"]').value.trim();

    if(!newName || !newEmail) {
        showToast('Lỗi: Tên đăng nhập và Email không được để trống!');
        return;
    }

    // Luồng lưu cho Admin
    if(currentUser.role === 'admin') {
        currentUser.name = newName;
        currentUser.email = newEmail;
        if(newPass) currentUser.password = newPass; 
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showToast('Cập nhật hồ sơ Admin thành công!');
        renderSidebar();
        renderPersonalInfo();
        return;
    }

    // Luồng lưu cho Khách hàng
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Quét chặn trùng lặp thông tin với người khác
    const exist = users.find(u => (u.email === newEmail || u.name === newName) && u.email !== currentUser.email);
    if(exist) {
        showToast('Lỗi: Tên đăng nhập hoặc Email này đã có người sử dụng!');
        return;
    }

    let uIndex = users.findIndex(u => u.email === currentUser.email);
    if(uIndex > -1) {
        users[uIndex].name = newName;
        users[uIndex].email = newEmail;
        if(newPass) users[uIndex].password = newPass;
        
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser.name = newName;
        currentUser.email = newEmail;
        if(newPass) currentUser.password = newPass;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showToast('Đã lưu thay đổi hồ sơ cá nhân!');
        renderSidebar();
        renderPersonalInfo();
    }
};
