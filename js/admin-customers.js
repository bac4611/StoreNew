/**
 * Module: admin-customers.js
 * Purpose: Customer list, VIP segmentation, quick voucher/status actions.
 * Main entry points: renderAdminCustomers(), updateVipThreshold(), toggleUserStatus().
 */
const mockCustomerSeedVersion = 'dngear-customer-seed-v2';

// Ham buildMockCustomers: tao logic tuong ung.
function buildMockCustomers() {
    return [
        // Giữ lại tài khoản Test cho cậu nếu cần
        { username: 'khach123', name: 'Khách VIP 1 (Test)', email: 'khach123@gmail.com', password: '12', role: 'customer', spent: 2150, status: 'active' },
        
        // 4 Khách vip
        { username: 'ĐÀM XUÂN BẮC', name: 'Đàm Xuân Bắc', email: 'bac@jewerly.com', password: '123', role: 'customer', spent: 35000, status: 'active' },
        { username: 'leon', name: 'Leon S. Kennedy', email: 'leon.kennedy@dso.gov', password: '123', role: 'customer', spent: 18500, status: 'active' },
        { username: 'paul', name: 'Paul Atreides', email: 'muaddib@arrakis.com', password: '123', role: 'customer', spent: 15400, status: 'active' },
        { username: 'geralt', name: 'Geralt of Rivia', email: 'whitewolf@kaermorhen.com', password: '123', role: 'customer', spent: 12500, status: 'active' },
        
        // 6 Khách Hàng Tiềm Năng
        { username: 'frank', name: 'Frank Castle', email: 'punisher@marvel.com', password: '123', role: 'customer', spent: 9800, status: 'active' },
        { username: 'max', name: 'Max Payne', email: 'max.payne@nypd.gov', password: '123', role: 'customer', spent: 8500, status: 'active' },
        { username: 'arthur', name: 'Arthur Morgan', email: 'arthur@vanderlinde.com', password: '123', role: 'customer', spent: 6200, status: 'active' },
        { username: 'chris', name: 'Chris Redfield', email: 'chris.bsaa@bsaa.org', password: '123', role: 'customer', spent: 4500, status: 'active' },
        { username: 'joel', name: 'Joel Miller', email: 'joel@jackson.wy', password: '123', role: 'customer', spent: 3200, status: 'active' },
        { username: 'ethan', name: 'Ethan Hunt', email: 'ethan.hunt@imf.gov', password: '123', role: 'customer', spent: 2100, status: 'active' }
    ];
}
//tạo dữ liệu khách hàng mẫu
//lưu vào db
//chạy khi mà version thay đổi
// Ham initMockCustomers: khoi tao logic tuong ung.
function initMockCustomers() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (!Array.isArray(users)) users = [];

    // Ép reset data khách hàng nếu khác version
    if (localStorage.getItem('customerSeedVersion') !== mockCustomerSeedVersion) {
        // Giữ lại các tài khoản admin
        users = users.filter(user => user.role !== 'customer');
        
        // Nạp bộ khách hàng mới vào
        const seedCustomers = buildMockCustomers();
        users = [...users, ...seedCustomers];
        
        localStorage.setItem('customerSeedVersion', mockCustomerSeedVersion);
        localStorage.setItem('users', JSON.stringify(users));
    }
}
initMockCustomers();

// Ham getVipThreshold: lay logic tuong ung.
function getVipThreshold() {
    return parseInt(localStorage.getItem('vipThreshold')) || 10000; // lấy giá trị vip từ db, ko có thì mặc định là 10000
}

// Ham updateVipThreshold: cap nhat logic tuong ung.
window.updateVipThreshold = function() {
    const input = document.getElementById('vipThresholdInput');
    if(input) {
        const val = parseInt(input.value);
        if(!isNaN(val) && val >= 0) {
            localStorage.setItem('vipThreshold', val);
            showToast('Đã thiết lập Hạn mức VIP mới: ' + val + '$');
            renderAdminCustomers(); //render toàn bộ khách ra ui 
        } else {
            showToast('Lỗi: Hạn mức phải là một con số hợp lệ!');
        }
    }
};

// Ham renderAdminCustomers: hien thi logic tuong ung.
window.renderAdminCustomers = function(keyword = '') {
    const users = JSON.parse(localStorage.getItem('users')) || []; //lấy user từ hệ thống & ngưỡng vip
    const threshold = getVipThreshold();
    
    let customers = users.filter(u => u.role === 'customer').map(c => ({
        ...c,
        name: c.name || 'Khách Vô Danh',
        email: c.email || 'Chưa cập nhật',
        spent: c.spent || 0
    }));

    customers.sort((a, b) => b.spent - a.spent); //sort theo tiền

    const vipContainer = document.getElementById('vip-customers-grid');
    if(vipContainer) {
        vipContainer.innerHTML = '';
        // ĐÃ CHỈNH LẠI: Lấy 4 VIP thay vì 3
        const vips = customers.filter(c => c.spent >= threshold).slice(0, 4);
        
        if (vips.length === 0) {
            vipContainer.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); padding: 20px;">Hiện chưa có khách hàng nào đạt chuẩn VIP theo hạn mức quy định.</div>';
        } else {
            vips.forEach(v => {
                vipContainer.innerHTML += `
                    <div class="vip-card">
                        <div class="vip-avatar">${v.name.charAt(0).toUpperCase()}</div>
                        <div class="vip-info">
                            <h4 class="vip-name">${v.name}</h4>
                            <div class="vip-spent">Đã chốt đơn: ${v.spent}$</div>
                            <button class="tactical-btn" style="margin-top: 10px; padding: 6px; font-size: 12px; background: rgba(245, 158, 11, 0.2); color: rgb(245, 158, 11); border: 1px solid rgb(245, 158, 11);" onclick="sendVoucher('${v.email}', '${v.name}')">TẶNG VOUCHER VIP</button>
                        </div>
                    </div>
                `;
            });
        }
    }

    const tbody = document.getElementById('customerTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    const lowerKey = keyword.toLowerCase();
    const filtered = customers.filter(c => c.name.toLowerCase().includes(lowerKey) || c.email.toLowerCase().includes(lowerKey));

    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 30px; color: var(--text-muted);">Không tìm thấy hồ sơ nào khớp với lệnh tìm kiếm.</td></tr>';
        return;
    }

    filtered.forEach(c => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in-row-anim';
        const statusBadge = c.status === 'locked' ? '<span class="badge badge-locked">Đã Khóa</span>' : '<span class="badge badge-active">Hoạt Động</span>';
        
        const lockAction = c.status === 'locked' 
            ? `<button class="action-icon-btn lock-btn" onclick="toggleUserStatus('${c.email}', '${c.name}')" title="Tài khoản đang bị khóa (Bấm để ân xá)"><i class="fa-solid fa-lock"></i></button>`
            : `<button class="action-icon-btn unlock-btn" onclick="toggleUserStatus('${c.email}', '${c.name}')" title="Tài khoản đang hoạt động (Bấm để khóa)"><i class="fa-solid fa-lock-open"></i></button>`;

        const isVip = c.spent >= threshold;
        const nameColor = isVip ? 'rgb(245, 158, 11)' : 'rgb(255, 255, 255)';
        const vipIcon = isVip ? ' <i class="fa-solid fa-crown" style="font-size: 12px; margin-left: 5px;"></i>' : '';

        tr.innerHTML = `
            <td>
                <div class="table-img" style="border-radius:50%; display:flex; justify-content:center; align-items:center; background:rgba(0,110,255,0.1); color:var(--primary); font-weight:bold; font-size: 20px;">
                    ${c.name.charAt(0).toUpperCase()}
                </div>
            </td>
            <td style="font-weight: bold; color: ${nameColor};">${c.name}${vipIcon}</td>
            <td style="color: rgb(255, 255, 255);">${c.email}</td>
            <td style="color: rgb(34, 197, 94); font-weight: bold; font-size: 16px;">${c.spent}$</td>
            <td>${statusBadge}</td>
            <td>
                <button class="action-icon-btn gift-btn" onclick="sendVoucher('${c.email}', '${c.name}')" title="Tặng quà/Mã giảm giá"><i class="fa-solid fa-gift"></i></button>
                ${lockAction}
            </td>
        `;
        tbody.appendChild(tr);
    });

    const input = document.getElementById('vipThresholdInput');
    if(input && !input.value) {
        input.value = threshold;
    }
};

// Ham searchAdminCustomers: tim kiem logic tuong ung.
window.searchAdminCustomers = function(keyword) {
    renderAdminCustomers(keyword);
};

// Ham sendVoucher: xu ly logic tuong ung.
window.sendVoucher = function(email, name) {
    if(!email || email === 'undefined' || email === 'Chưa cập nhật') {
        showToast('Thất bại: Khách hàng ' + name + ' chưa có Email hợp lệ để nhận mã!');
        return;
    }

    const activePromotions = typeof getPromotionData === 'function'
        ? getPromotionData().filter(promotion => promotion.status === 'Đang áp dụng' || promotion.status === 'Đang áp dụng')
        : [];
    const basePromotion = activePromotions[0] || {
        code: 'VIP10',
        title: 'Voucher VIP cá nhân',
        valueLabel: 'Giảm 10%',
        condition: 'Áp dụng cho đơn tiếp theo từ 300$'
    };
    const vouchers = JSON.parse(localStorage.getItem('issuedVoucherData')) || [];
    const voucherCode = `${basePromotion.code}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    vouchers.unshift({
        id: `VC${Date.now()}`,
        email,
        name,
        title: basePromotion.title,
        valueLabel: basePromotion.valueLabel,
        condition: basePromotion.condition,
        code: voucherCode,
        issuedAt: new Date().toISOString()
    });

    localStorage.setItem('issuedVoucherData', JSON.stringify(vouchers));

    const notifications = JSON.parse(localStorage.getItem('notificationData')) || [];
    notifications.unshift({
        id: `NOTIF${Date.now()}`,
        email,
        title: '🎁 Quà tặng VIP từ hệ thống',
        message: `Admin vừa gửi tặng bạn suất ưu đãi đặc quyền: ${basePromotion.title}. Trị giá: ${basePromotion.valueLabel}. Điều kiện: ${basePromotion.condition}. Bạn có thể copy mã và dùng ngay ở Giỏ hàng.`,
        type: 'voucher',
        voucherCode: voucherCode,
        isRead: false,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('notificationData', JSON.stringify(notifications));

    if (typeof renderStorePromoStrip === 'function') {
        renderStorePromoStrip();
    }

    showToast(`Đã gửi voucher ${voucherCode} cho ${name}.`);
};

// Ham toggleUserStatus: bat/tat logic tuong ung.
window.toggleUserStatus = function(email, name) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    const index = users.findIndex(u => (u.email === email && email !== 'undefined' && email !== 'Chưa cập nhật') || u.name === name);
    
    if(index > -1) {
        if(users[index].status === 'locked') {
            users[index].status = 'active';
            showToast('Đã mở khóa, khôi phục quyền truy cập cho: ' + users[index].name);
        } else {
            const confirmLock = confirm('Báo động: Xác nhận khóa và khóa vĩnh viễn tài khoản của ' + users[index].name + ' khỏi hệ thống?');
            if(!confirmLock) return;
            users[index].status = 'locked';
            showToast('Đã tước quyền truy cập của: ' + users[index].name);
        }
        localStorage.setItem('users', JSON.stringify(users));
        
        const searchInput = document.getElementById('adminCustomerSearchInput');
        const keyword = searchInput ? searchInput.value : '';
        renderAdminCustomers(keyword);
    } else {
        showToast('Lỗi hệ thống: Không thể định vị được dữ liệu của khách hàng này!');
    }
};
