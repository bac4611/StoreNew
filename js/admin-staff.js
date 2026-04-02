/**
 * Module: admin-staff.js
 * Purpose: Staff management table and modal add/edit/delete flows.
 * Main entry points: renderAdminStaff(), openAddStaffForm(), saveStaff().
 */
const mockStaffSeedVersion = 'dngear-staff-seed-v1';

// Muc dich:
// Tao danh sach nhan su mau de khoi tao du lieu ban dau cho module quan ly nhan vien.
// Du lieu nay duoc dung lam "seed" khi he thong chua co staffData hop le trong localStorage.
function buildMockStaff() {
    return [
        { id: 'NV01', name: 'Triệu Anh Khôi', gender: 'Nam', phone: '0987654321', email: 'hai@jewerly.com', role: 'Quản lý kho', salary: '15.000.000 đ' },
        { id: 'NV02', name: 'Trần Thị Lan', gender: 'Nữ', phone: '0912345678', email: 'lan@jewerly.com', role: 'Bán hàng', salary: '12.500.000 đ' },
        { id: 'NV03', name: 'Lê Minh Khoa', gender: 'Nam', phone: '0999888777', email: 'khoajewerly.com', role: 'Kế toán', salary: '13.000.000 đ' },
        { id: 'NV04', name: 'Vũ việt vũ', gender: 'Nam', phone: '0933222111', email: 'duy@jewerly.com', role: 'Bảo vệ', salary: '8.800.000 đ' }
    ];
}

// Muc dich:
// Khoi tao staffData trong localStorage theo co che seed version.
// Ham xu ly 3 truong hop:
// - Chua co du lieu: nap toan bo staff mau.
// - Du lieu cu chi gom nhan su legacy: thay bang bo seed moi.
// - Nang cap seed version: loai ban ghi legacy va bo sung nhan su moi neu thieu.
function initMockStaff() {
    let staff = JSON.parse(localStorage.getItem('staffData')) || [];
    if (!Array.isArray(staff)) staff = [];

    const seedStaff = buildMockStaff();
    const legacyNames = ['Sarah Connor', 'Marcus Fenix', 'Lara Croft'];
    const hasOnlyLegacyStaff = staff.length > 0 && staff.every(member => legacyNames.includes(member.name));

    if (staff.length === 0 || hasOnlyLegacyStaff) {
        staff = seedStaff;
    } else if (localStorage.getItem('staffSeedVersion') !== mockStaffSeedVersion) {
        staff = staff.filter(member => !legacyNames.includes(member.name));
        const existingIds = new Set(staff.map(member => member.id));
        seedStaff.forEach(member => {
            if (!existingIds.has(member.id)) {
                staff.push(member);
            }
        });
    }

    localStorage.setItem('staffSeedVersion', mockStaffSeedVersion);
    localStorage.setItem('staffData', JSON.stringify(staff));
}
initMockStaff();

// Muc dich:
// Chen modal them/sua nhan su vao DOM mot lan duy nhat.
// Ham tao toan bo form nhap lieu va cac nut thao tac (dong, huy, luu) de su dung lai trong module.
function injectStaffModal() {
    if(document.getElementById('adminStaffFormModal')) return;
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="modal-overlay hide-menu" id="adminStaffFormModal">
            <div class="modal-content" style="width: 700px;">
                <div class="modal-header">
                    <h2 class="modal-title" id="adminStaffFormTitle">THÊM NHÂN SỰ MỚI</h2>
                    <span class="close-btn" onclick="closeStaffForm()">✕</span>
                </div>
                <div class="modal-body" style="display: block;">
                    <input type="hidden" id="formStaffSaveMode" value="add">
                    <div class="admin-form-grid">
                        <div class="admin-form-group">
                            <label>Mã Nhân Viên</label>
                            <input type="text" id="formStaffId" placeholder="VD: NV04...">
                        </div>
                        <div class="admin-form-group">
                            <label>Họ Tên</label>
                            <input type="text" id="formStaffName" placeholder="Nhập họ tên...">
                        </div>
                        <div class="admin-form-group">
                            <label>Giới Tính</label>
                            <select id="formStaffGender">
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </select>
                        </div>
                        <div class="admin-form-group">
                            <label>Số Điện Thoại</label>
                            <input type="text" id="formStaffPhone" placeholder="VD: 09...">
                        </div>
                        <div class="admin-form-group full-width">
                            <label>Email Liên Hệ</label>
                            <input type="email" id="formStaffEmail" placeholder="VD: email@gunstore.com...">
                        </div>
                        <div class="admin-form-group">
                            <label>Chức Vụ</label>
                            <select id="formStaffRole">
                                <option value="Bán hàng">Bán hàng</option>
                                <option value="Quản lý kho">Quản lý kho</option>
                                <option value="Bảo vệ">Bảo vệ</option>
                                <option value="Kế toán">Kế toán</option>
                            </select>
                        </div>
                        <div class="admin-form-group">
                            <label>Mức Lương</label>
                            <input type="text" id="formStaffSalary" placeholder="VD: 10.000.000 đ">
                        </div>
                    </div>
                    <div class="admin-form-actions">
                        <button class="tactical-btn" style="background: transparent; color: rgb(239, 68, 68); border: 1px solid rgb(239, 68, 68); width: auto; padding: 10px 30px;" onclick="closeStaffForm()">HỦY BỎ</button>
                        <button class="tactical-btn" style="width: auto; padding: 10px 30px; background: rgb(0, 110, 255);" onclick="saveStaff()">XÁC NHẬN LƯU</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(container.children[0]);
}
injectStaffModal();

// Muc dich:
// Render bang danh sach nhan vien tu localStorage ra giao dien quan tri.
// Ham ho tro loc theo tu khoa (ten, SDT, email, ma nhan vien), hien trang thai rong khi khong co ket qua,
// va gan cac hanh dong Sua/Xoa tren tung dong du lieu.
window.renderAdminStaff = function(keyword = '') {
    const staff = JSON.parse(localStorage.getItem('staffData')) || [];

    const tbody = document.querySelector('[id="staffTableBody"]');
    if(!tbody) return;
    tbody.innerHTML = '';

    const lowerKey = keyword.toLowerCase();
    const filtered = staff.filter(s => 
        s.name.toLowerCase().includes(lowerKey) || 
        s.phone.includes(lowerKey) || 
        s.email.toLowerCase().includes(lowerKey) ||
        s.id.toLowerCase().includes(lowerKey)
    );

    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 30px; color: rgb(100, 116, 139);">Không tìm thấy dữ liệu nhân viên.</td></tr>';
        return;
    }

    filtered.forEach(s => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in-row-anim';
        
        tr.innerHTML = `
            <td style="font-weight: bold; color: rgb(255, 255, 255);">${s.id}</td>
            <td style="color: rgb(255, 255, 255); font-weight: bold;">${s.name}</td>
            <td style="color: rgb(255, 255, 255);">${s.gender}</td>
            <td style="color: rgb(255, 255, 255);">${s.phone}</td>
            <td style="color: rgb(255, 255, 255);">${s.email}</td>
            <td><span class="role-badge">${s.role}</span></td>
            <td style="color: rgb(34, 197, 94); font-weight: bold;">${s.salary}</td>
            <td>
                <button class="action-icon-btn edit-btn" onclick="editStaff('${s.id}')" title="Sửa"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="action-icon-btn delete-btn" onclick="deleteStaff('${s.id}', this)" title="Sa thải"><i class="fa-solid fa-user-minus"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// Muc dich:
// Ham wrapper cho o tim kiem nhan vien.
// Nhan keyword va goi lai renderAdminStaff de cap nhat bang theo bo loc hien tai.
window.searchAdminStaff = function(keyword) {
    renderAdminStaff(keyword);
};

// Muc dich:
// Xu ly xoa (sa thai) mot nhan vien khoi staffData.
// Ham hien hop xac nhan, cho hieu ung dong bang, cap nhat localStorage, thong bao ket qua va render lai danh sach.
window.deleteStaff = function(id, btnElement) {
    const confirmDelete = confirm('CẢNH BÁO: Xác nhận chấm dứt hợp đồng và xóa dữ liệu của nhân sự này?');
    if(confirmDelete) {
        const row = btnElement.closest('tr');
        if(row) row.classList.add('fade-out-row');
        
        setTimeout(() => {
            let staff = JSON.parse(localStorage.getItem('staffData')) || [];
            const index = staff.findIndex(s => s.id === id);
            if(index > -1) {
                staff.splice(index, 1);
                localStorage.setItem('staffData', JSON.stringify(staff));
                showToast('Đã sa thải nhân sự thành công!');
                
                const searchInput = document.querySelector('[id="adminStaffSearchInput"]');
                renderAdminStaff(searchInput ? searchInput.value : '');
            }
        }, 300);
    }
};

// Muc dich:
// Mo form o che do "them moi" nhan su.
// Ham reset toan bo truong nhap ve mac dinh, mo khoa truong ma nhan vien va hien modal.
window.openAddStaffForm = function() {
    document.getElementById('adminStaffFormTitle').innerText = 'THÊM NHÂN SỰ MỚI';
    document.getElementById('formStaffSaveMode').value = 'add';
    
    document.getElementById('formStaffId').value = '';
    document.getElementById('formStaffId').disabled = false;
    document.getElementById('formStaffName').value = '';
    document.getElementById('formStaffGender').value = 'Nam';
    document.getElementById('formStaffPhone').value = '';
    document.getElementById('formStaffEmail').value = '';
    document.getElementById('formStaffRole').value = 'Bán hàng';
    document.getElementById('formStaffSalary').value = '';

    const modal = document.getElementById('adminStaffFormModal');
    if(modal) modal.classList.remove('hide-menu');
};

// Muc dich:
// Mo form o che do "chinh sua" cho mot nhan vien cu the theo id.
// Ham nap du lieu hien tai vao form, khoa truong ma nhan vien de tranh doi khoa chinh, roi hien modal.
window.editStaff = function(id) {
    let staff = JSON.parse(localStorage.getItem('staffData')) || [];
    const p = staff.find(item => item.id === id);
    if(!p) return;

    document.getElementById('adminStaffFormTitle').innerText = 'CHỈNH SỬA: ' + p.name;
    document.getElementById('formStaffSaveMode').value = 'edit';
    
    document.getElementById('formStaffId').value = p.id;
    document.getElementById('formStaffId').disabled = true; 
    document.getElementById('formStaffName').value = p.name;
    document.getElementById('formStaffGender').value = p.gender;
    document.getElementById('formStaffPhone').value = p.phone;
    document.getElementById('formStaffEmail').value = p.email;
    document.getElementById('formStaffRole').value = p.role;
    document.getElementById('formStaffSalary').value = p.salary;

    const modal = document.getElementById('adminStaffFormModal');
    if(modal) modal.classList.remove('hide-menu');
};

// Muc dich:
// Dong modal them/sua nhan su bang cach them class an.
// Ham khong thay doi du lieu, chi tac dong trang thai hien thi cua UI.
window.closeStaffForm = function() {
    const modal = document.getElementById('adminStaffFormModal');
    if(modal) modal.classList.add('hide-menu');
};

// Muc dich:
// Luu du lieu tu form nhan su vao localStorage cho ca 2 che do: them moi va chinh sua.
// Ham validate cac truong bat buoc, kiem tra trung ma khi them moi, cap nhat danh sach,
// dong modal va render lai bang theo tu khoa tim kiem hien tai.

window.saveStaff = function() {
    const mode = document.getElementById('formStaffSaveMode').value;
    const id = document.getElementById('formStaffId').value.trim();
    const name = document.getElementById('formStaffName').value.trim();
    const gender = document.getElementById('formStaffGender').value;
    const phone = document.getElementById('formStaffPhone').value.trim();
    const email = document.getElementById('formStaffEmail').value.trim();
    const role = document.getElementById('formStaffRole').value;
    const salary = document.getElementById('formStaffSalary').value.trim();

    if(!id || !name || !phone || !salary) {
        showToast('Lỗi: Cần điền đầy đủ Mã, Họ tên, SĐT và Lương!');
        return;
    }

    let staff = JSON.parse(localStorage.getItem('staffData')) || [];

    if(mode === 'add') {
        const exist = staff.find(s => s.id === id);
        if(exist) {
            showToast('Lỗi: Mã nhân viên này đã tồn tại!');
            return;
        }
        staff.push({ id, name, gender, phone, email, role, salary });
        showToast('Đã thêm nhân sự mới thành công!');
    } else {
        const index = staff.findIndex(s => s.id === id);
        if(index > -1) {
            staff[index] = { id, name, gender, phone, email, role, salary };
            showToast('Đã cập nhật thông tin nhân sự!');
        }
    }

    localStorage.setItem('staffData', JSON.stringify(staff));
    closeStaffForm();
    
    const searchInput = document.getElementById('adminStaffSearchInput');
    renderAdminStaff(searchInput ? searchInput.value : '');
};
