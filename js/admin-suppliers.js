/**
 * Module: admin-suppliers.js
 * Purpose: Supplier management, supplier modal, and linked product lookup.
 * Main entry points: renderAdminSuppliers(), openAddSupplierForm(), saveSupplier().
 */
const mockSupplierSeedVersion = 'dngear-supplier-seed-v2';

function buildMockSuppliers() {
    return [
        { id: 'NCC01', name: 'BACDUNG JWERELY', contact: 'Đàm Xuân Bắc', phone: '0916295600', email: 'bac@jewerly', status: 'Hoạt động' },
        { id: 'NCC02', name: 'Foam Arena Supply', contact: 'Trần Minh Phúc', phone: '0911222333', email: 'phuc@foamarena.vn', status: 'Hoạt động' },
        { id: 'NCC03', name: 'Gel Core Workshop', contact: 'Lê Quốc Hưng', phone: '0933444555', email: 'hung@gelcore.vn', status: 'Hoạt động' },
        { id: 'NCC04', name: 'Retro Mod Parts', contact: 'Phạm Nhật An', phone: '0977666555', email: 'an@retromod.vn', status: 'Ngừng cung cấp' }
    ];
}

function initMockSuppliers() {
    let suppliers = JSON.parse(localStorage.getItem('supplierData')) || [];
    if (!Array.isArray(suppliers)) suppliers = [];

    const seedSuppliers = buildMockSuppliers();
    const legacyNames = ['Stark Industries', 'Wayne Enterprises', 'LexCorp'];
    const hasOnlyLegacySuppliers = suppliers.length > 0 && suppliers.every(supplier => legacyNames.includes(supplier.name));

    if (suppliers.length === 0 || hasOnlyLegacySuppliers) {
        suppliers = seedSuppliers;
    } else if (localStorage.getItem('supplierSeedVersion') !== mockSupplierSeedVersion) {
        suppliers = suppliers.filter(supplier => !legacyNames.includes(supplier.name));
        const existingIds = new Set(suppliers.map(supplier => supplier.id));
        seedSuppliers.forEach(supplier => {
            if (!existingIds.has(supplier.id)) {
                suppliers.push(supplier);
            }
        });
    }

    localStorage.setItem('supplierSeedVersion', mockSupplierSeedVersion);
    localStorage.setItem('supplierData', JSON.stringify(suppliers));
}
initMockSuppliers();

function injectSupplierModal() {
    if(!document.getElementById('adminSupplierFormModal')) {
        const container1 = document.createElement('div');
        container1.innerHTML = `
            <div class="modal-overlay hide-menu" id="adminSupplierFormModal">
                <div class="modal-content" style="width: 700px;">
                    <div class="modal-header">
                        <h2 class="modal-title" id="adminSupplierFormTitle">THÊM NHÀ CUNG CẤP</h2>
                        <span class="close-btn" onclick="closeSupplierForm()">✕</span>
                    </div>
                    <div class="modal-body" style="display: block;">
                        <input type="hidden" id="formSupplierSaveMode" value="add">
                        <div class="admin-form-grid">
                            <div class="admin-form-group">
                                <label>Mã Nhà Cung Cấp</label>
                                <input type="text" id="formSupplierId" placeholder="VD: NCC04...">
                            </div>
                            <div class="admin-form-group">
                                <label>Tên Công Ty/Tổ Chức</label>
                                <input type="text" id="formSupplierName" placeholder="Nhập tên tổ chức...">
                            </div>
                            <div class="admin-form-group">
                                <label>Người Liên Hệ</label>
                                <input type="text" id="formSupplierContact" placeholder="Nhập tên đại diện...">
                            </div>
                            <div class="admin-form-group">
                                <label>Số Điện Thoại</label>
                                <input type="text" id="formSupplierPhone" placeholder="VD: 09...">
                            </div>
                            <div class="admin-form-group full-width">
                                <label>Email Liên Hệ</label>
                                <input type="email" id="formSupplierEmail" placeholder="VD: contact@company.com...">
                            </div>
                            <div class="admin-form-group">
                                <label>Trạng Thái</label>
                                <select id="formSupplierStatus">
                                    <option value="Hoạt động">Hoạt động</option>
                                    <option value="Ngừng cung cấp">Ngừng cung cấp</option>
                                </select>
                            </div>
                        </div>
                        <div class="admin-form-actions">
                            <button class="tactical-btn" style="background: transparent; color: rgb(239, 68, 68); border: 1px solid rgb(239, 68, 68); width: auto; padding: 10px 30px;" onclick="closeSupplierForm()">HỦY BỎ</button>
                            <button class="tactical-btn" style="width: auto; padding: 10px 30px; background: rgb(0, 110, 255);" onclick="saveSupplier()">XÁC NHẬN LƯU</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container1.children[0]);
    }

    if(!document.getElementById('supplierProductModal')) {
        const container2 = document.createElement('div');
        container2.innerHTML = `
            <div class="modal-overlay hide-menu" id="supplierProductModal">
                <div class="modal-content" style="width: 800px; max-height: 85vh; overflow-y: auto;">
                    <div class="modal-header">
                        <div>
                            <p class="shop-eyebrow" style="margin-bottom: 5px;">LỊCH SỬ CUNG ỨNG</p>
                            <h2 class="modal-title" id="supplierProductModalTitle" style="color: rgb(0, 110, 255); font-weight: bold;">SẢN PHẨM TỪ: ...</h2>
                        </div>
                        <span class="close-btn" onclick="closeSupplierProductModal()">✕</span>
                    </div>
                    <div class="modal-body" style="display: block;">
                        <div class="admin-table-container" style="min-height: auto; box-shadow: none; padding: 0; border: 1px solid var(--border);">
                            <table class="tactical-table">
                                <thead>
                                    <tr>
                                        <th>Hình Ảnh</th>
                                        <th>Mã SP</th>
                                        <th>Tên Sản Phẩm</th>
                                        <th>Số Lượng</th>
                                        <th>Đơn Giá</th>
                                    </tr>
                                </thead>
                                <tbody id="supplierProductTableBody">
                                    </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container2.children[0]);
    }
}
injectSupplierModal();

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        const modal = document.getElementById('supplierProductModal');
        if (modal && !modal.classList.contains('hide-menu')) closeSupplierProductModal();
    }
});

window.renderAdminSuppliers = function(keyword = '') {
    const suppliers = JSON.parse(localStorage.getItem('supplierData')) || [];
    const tbody = document.getElementById('supplierTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    const lowerKey = keyword.toLowerCase();
    const filtered = suppliers.filter(s => 
        s.name.toLowerCase().includes(lowerKey) || 
        s.phone.includes(lowerKey) || 
        s.email.toLowerCase().includes(lowerKey) ||
        s.id.toLowerCase().includes(lowerKey) ||
        s.contact.toLowerCase().includes(lowerKey)
    );

    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 30px; color: rgb(100, 116, 139);">Không tìm thấy dữ liệu nhà cung cấp.</td></tr>';
        return;
    }

    const headers = document.querySelectorAll('#view-admin-suppliers .tactical-table th');
    if(headers.length === 7) {
        const trHead = document.querySelector('#view-admin-suppliers .tactical-table thead tr');
        const spTh = document.createElement('th');
        spTh.innerText = "SỐ SP CUNG CẤP";
        trHead.insertBefore(spTh, trHead.children[5]);
    }

    const allProducts = typeof dbProducts !== 'undefined' ? dbProducts : [];

    filtered.forEach(s => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in-row-anim';
        
        const statusColor = s.status === 'Hoạt động' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
        const statusBg = s.status === 'Hoạt động' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';

        const totalItems = allProducts.filter(p => p.supplierId === s.id).length;

        tr.innerHTML = `
            <td style="font-weight: bold; color: rgb(255, 255, 255);">${s.id}</td>
            <td style="color: rgb(255, 255, 255); font-weight: bold;">${s.name}</td>
            <td style="color: rgb(255, 255, 255);">${s.contact}</td>
            <td style="color: rgb(255, 255, 255);">${s.phone}</td>
            <td style="color: rgb(255, 255, 255);">${s.email}</td>
            <td style="font-weight: bold; color: rgb(0, 110, 255);">${totalItems} Mặt Hàng</td>
            <td><span style="padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; background: ${statusBg}; color: ${statusColor};">${s.status}</span></td>
            <td>
                <button class="action-icon-btn view-btn" style="color: rgb(59, 130, 246);" onclick="viewSupplierProducts('${s.id}', '${s.name}')" title="Xem danh sách mặt hàng cung cấp"><i class="fa-solid fa-box-open"></i></button>
                <button class="action-icon-btn edit-btn" onclick="editSupplier('${s.id}')" title="Sửa thông tin liên hệ"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="action-icon-btn delete-btn" onclick="deleteSupplier('${s.id}', this)" title="Ngừng hợp tác & Xóa"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.searchAdminSuppliers = function(keyword) {
    renderAdminSuppliers(keyword);
};

window.deleteSupplier = function(id, btnElement) {
    const confirmDelete = confirm('CẢNH BÁO: Xác nhận xóa dữ liệu nhà cung cấp này khỏi hệ thống?');
    if(confirmDelete) {
        const row = btnElement.closest('tr');
        if(row) row.classList.add('fade-out-row');
        
        setTimeout(() => {
            let suppliers = JSON.parse(localStorage.getItem('supplierData')) || [];
            const index = suppliers.findIndex(s => s.id === id);
            if(index > -1) {
                suppliers.splice(index, 1);
                localStorage.setItem('supplierData', JSON.stringify(suppliers));
                showToast('Đã xóa dữ liệu nhà cung cấp!');
                
                const searchInput = document.getElementById('adminSupplierSearchInput');
                renderAdminSuppliers(searchInput ? searchInput.value : '');
            }
        }, 300);
    }
};

window.openAddSupplierForm = function() {
    document.getElementById('adminSupplierFormTitle').innerText = 'THÊM NHÀ CUNG CẤP';
    document.getElementById('formSupplierSaveMode').value = 'add';
    
    document.getElementById('formSupplierId').value = '';
    document.getElementById('formSupplierId').disabled = false;
    document.getElementById('formSupplierName').value = '';
    document.getElementById('formSupplierContact').value = '';
    document.getElementById('formSupplierPhone').value = '';
    document.getElementById('formSupplierEmail').value = '';
    document.getElementById('formSupplierStatus').value = 'Hoạt động';

    const modal = document.getElementById('adminSupplierFormModal');
    if(modal) modal.classList.remove('hide-menu');
};

window.editSupplier = function(id) {
    let suppliers = JSON.parse(localStorage.getItem('supplierData')) || [];
    const p = suppliers.find(item => item.id === id);
    if(!p) return;

    document.getElementById('adminSupplierFormTitle').innerText = 'CHỈNH SỬA: ' + p.name;
    document.getElementById('formSupplierSaveMode').value = 'edit';
    
    document.getElementById('formSupplierId').value = p.id;
    document.getElementById('formSupplierId').disabled = true; 
    document.getElementById('formSupplierName').value = p.name;
    document.getElementById('formSupplierContact').value = p.contact;
    document.getElementById('formSupplierPhone').value = p.phone;
    document.getElementById('formSupplierEmail').value = p.email;
    document.getElementById('formSupplierStatus').value = p.status;

    const modal = document.getElementById('adminSupplierFormModal');
    if(modal) modal.classList.remove('hide-menu');
};

window.closeSupplierForm = function() {
    const modal = document.getElementById('adminSupplierFormModal');
    if(modal) modal.classList.add('hide-menu');
};

window.viewSupplierProducts = function(supplierId, supplierName) {
    const allProducts = typeof dbProducts !== 'undefined' ? dbProducts : [];
    
    const providedProducts = allProducts.filter(p => p.supplierId === supplierId);

    document.getElementById('supplierProductModalTitle').innerText = supplierName.toUpperCase();
    const tbody = document.getElementById('supplierProductTableBody');
    tbody.innerHTML = '';

    if(providedProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px; color: var(--text-muted);">Nhà cung cấp này hiện chưa có mặt hàng nào trong kho.</td></tr>';
    } else {
        providedProducts.forEach(p => {
            const displayPrice = p.salePercent > 0 ? Math.round(p.price * (100 - p.salePercent) / 100) : p.price;
            
            tbody.innerHTML += `
                <tr class="fade-in-row-anim">
                    <td><img src="${p.img}" style="width: 45px; height: 45px; object-fit: contain; border-radius: 8px; background: var(--bg-panel); padding: 4px;" onerror="this.src='${window.productFallbackImage || '../product-fallback.svg'}'"></td>
                    <td style="font-weight: bold; color: var(--text-dark);">${p.id}</td>
                    <td style="font-weight: bold;">${p.name}</td>
                    <td style="color: rgb(34, 197, 94); font-weight: bold; font-size: 16px;">${p.stock}</td>
                    <td style="color: rgb(239, 68, 68); font-weight: bold; font-size: 16px;">${displayPrice}$</td>
                </tr>
            `;
        });
    }

    const modal = document.getElementById('supplierProductModal');
    if(modal) modal.classList.remove('hide-menu');
};

window.closeSupplierProductModal = function() {
    const modal = document.getElementById('supplierProductModal');
    if(modal) modal.classList.add('hide-menu');
};

window.saveSupplier = function() {
    const mode = document.getElementById('formSupplierSaveMode').value;
    const id = document.getElementById('formSupplierId').value.trim();
    const name = document.getElementById('formSupplierName').value.trim();
    const contact = document.getElementById('formSupplierContact').value.trim();
    const phone = document.getElementById('formSupplierPhone').value.trim();
    const email = document.getElementById('formSupplierEmail').value.trim();
    const status = document.getElementById('formSupplierStatus').value;

    if(!id || !name || !phone) {
        showToast('Lỗi: Cần điền đầy đủ Mã, Tên tổ chức và SĐT!');
        return;
    }

    let suppliers = JSON.parse(localStorage.getItem('supplierData')) || [];

    if(mode === 'add') {
        const exist = suppliers.find(s => s.id === id);
        if(exist) {
            showToast('Lỗi: Mã nhà cung cấp này đã tồn tại!');
            return;
        }
        suppliers.push({ id, name, contact, phone, email, status });
        showToast('Đã thêm nhà cung cấp mới thành công!');
    } else {
        const index = suppliers.findIndex(s => s.id === id);
        if(index > -1) {
            suppliers[index] = { id, name, contact, phone, email, status };
            showToast('Đã cập nhật thông tin nhà cung cấp!');
        }
    }

    localStorage.setItem('supplierData', JSON.stringify(suppliers));
    closeSupplierForm();
    
    const searchInput = document.getElementById('adminSupplierSearchInput');
    renderAdminSuppliers(searchInput ? searchInput.value : '');
};
