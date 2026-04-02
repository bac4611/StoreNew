/**
 * Module: admin-products.js
 * Purpose: Admin CRUD UI for product catalog (render, add/edit, delete).
 * Main entry points: renderAdminProductTable(), openAddProductForm(), saveProduct().
 */
// Ham renderAdminProductTable: hien thi logic tuong ung.
/*Lấy table → clear → filter theo keyword → render từng row → update header */
window.renderAdminProductTable = function(keyword = '', highlightId = '') {
    const tbody = document.getElementById('adminTableBody');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    
    const lowerKey = keyword.toLowerCase();
    const filtered = dbProducts.filter(p => p.name.toLowerCase().includes(lowerKey) || p.id.toLowerCase().includes(lowerKey));

    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 30px; color: var(--text-muted);">Không tìm thấy dữ liệu khớp lệnh.</td></tr>';
        return;
    }

    filtered.forEach(p => {
        const tr = document.createElement('tr');
        if (p.id === highlightId) {
            tr.className = 'highlight-row';
        } else {
            tr.className = 'fade-in-row-anim';
        }
        
        tr.innerHTML = `
            <td><img src="${p.img}" class="table-img" alt="Ảnh" onerror="this.onerror=null;this.src='${window.productFallbackImage || '../product-fallback.svg'}';"></td>
            <td style="font-weight: bold;">${p.id}</td>
            <td>${p.name}</td>
            <td style="color: rgb(239, 68, 68); font-weight: bold;">${p.price}$</td>
            <td>${p.stock}</td>
            <td>
                <button class="action-icon-btn edit-btn" onclick="editWeapon('${p.id}')" title="Sửa"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="action-icon-btn delete-btn" onclick="deleteWeapon('${p.id}', this)" title="Xóa"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    const headers = document.querySelectorAll('[id="view-admin-products"] .tactical-table th');
    if(headers.length >= 5) {
        headers[4].innerText = 'SỐ HÀNG';
    }
};

// Ham searchAdminTable: tim kiem logic tuong ung.
window.searchAdminTable = function(keyword) {
    renderAdminProductTable(keyword);
};

// Ham deletePrduct: xoa sản phẩm trong admin(UI + data + render lại bảng) 
window.deleteWeapon = function(id, btnElement) {
    const confirmDelete = confirm('Cảnh báo: Xác nhận xóa toàn bộ sản phẩm khỏi danh mục? ');
    if(confirmDelete) {
        const row = btnElement.closest('tr');
        if(row) {
            row.classList.add('fade-out-row');
        }

        setTimeout(() => {
            const index = dbProducts.findIndex(p => p.id === id);
            if(index > -1) {
                dbProducts.splice(index, 1);
                if (typeof persistProducts === 'function') persistProducts();
                if (typeof hydrateCartFromStorage === 'function') hydrateCartFromStorage();
                showToast('Đã xóa dữ liệu thành công!');
                
                const adminSearchInput = document.getElementById('adminSearchInput');
                const keyword = adminSearchInput ? adminSearchInput.value : '';
                renderAdminProductTable(keyword);
                
                renderProducts(typeof currentStoreCategory === 'string' ? currentStoreCategory : 'all'); 
                renderTopSelling();
                if (typeof renderSaleProducts === 'function') renderSaleProducts();
                if (typeof renderOrderHistory === 'function') renderOrderHistory();
                renderSidebar(); 

                if (typeof renderAdminSuppliers === 'function') {
                    const supSearch = document.getElementById('adminSupplierSearchInput');
                    renderAdminSuppliers(supSearch ? supSearch.value : '');
                }
            }
        }, 300);
    }
};

// Ham toggleAdminFields: bat/tat logic tuong ung.
window.toggleAdminFields = function() {
    const cat = document.getElementById('formCategory').value;

    const materialGroup = document.getElementById('groupFormMaterial');
    const sizeGroup = document.getElementById('groupFormSize');
    const detailGroup = document.getElementById('groupFormDetail');

    const detailLabel = document.getElementById('lblFormDetail');
    const detailInput = document.getElementById('formDetail');

    // Ẩn hết trước
    if(materialGroup) materialGroup.style.display = 'none';
    if(sizeGroup) sizeGroup.style.display = 'none';
    if(detailGroup) detailGroup.style.display = 'none';

    //  NHẪN (nhan*)
    if (cat.startsWith('nhan')) {
        if(materialGroup) materialGroup.style.display = 'flex';
        if(sizeGroup) sizeGroup.style.display = 'flex';
        if(detailGroup) detailGroup.style.display = 'flex';

        if(detailLabel) detailLabel.innerText = 'ĐÁ / KIỂU THIẾT KẾ';
        if(detailInput) detailInput.placeholder = 'VD: Moissanite, kim cương, kiểu halo...';
    }

    //  DÂY CHUYỀN / MẶT DÂY
    else if (cat.startsWith('daychuyen') || cat === 'matday') {
        if(materialGroup) materialGroup.style.display = 'flex';
        if(detailGroup) detailGroup.style.display = 'flex';

        if(detailLabel) detailLabel.innerText = 'CHIỀU DÀI / MẶT DÂY';
        if(detailInput) detailInput.placeholder = 'VD: 45cm, mặt trái tim, chữ cái...';
    }

    //  BÔNG TAI
    else if (cat.startsWith('bongtai')) {
        if(materialGroup) materialGroup.style.display = 'flex';
        if(detailGroup) detailGroup.style.display = 'flex';

        if(detailLabel) detailLabel.innerText = 'KIỂU BÔNG TAI';
        if(detailInput) detailInput.placeholder = 'VD: Đính đá, ngọc trai, tối giản...';
    }

    //  LẮC TAY / VÒNG TAY
    else if (cat === 'lactay' || cat === 'vongtay' || cat === 'lactaynam') {
        if(materialGroup) materialGroup.style.display = 'flex';
        if(sizeGroup) sizeGroup.style.display = 'flex';
        if(detailGroup) detailGroup.style.display = 'flex';

        if(detailLabel) detailLabel.innerText = 'KIỂU DÁNG';
        if(detailInput) detailInput.placeholder = 'VD: Charm, trơn, đính đá...';
    }

    //  TRANG SỨC NAM
    else if (cat.includes('nam')) {
        if(materialGroup) materialGroup.style.display = 'flex';
        if(sizeGroup) sizeGroup.style.display = 'flex';
        if(detailGroup) detailGroup.style.display = 'flex';

        if(detailLabel) detailLabel.innerText = 'PHONG CÁCH';
        if(detailInput) detailInput.placeholder = 'VD: Mạnh mẽ, tối giản, luxury...';
    }

    //  CƯỚI / QUÀ TẶNG
    else if (cat === 'nhancuoi' || cat === 'nhancapdoi' || cat === 'quatang') {
        if(materialGroup) materialGroup.style.display = 'flex';
        if(detailGroup) detailGroup.style.display = 'flex';

        if(detailLabel) detailLabel.innerText = 'Ý NGHĨA / THÔNG ĐIỆP';
        if(detailInput) detailInput.placeholder = 'VD: Khắc tên, ngày kỷ niệm...';
    }

    //  PHỤ KIỆN
    else if (cat === 'hoptrangsuc' || cat === 'khanlau' || cat === 'phukien') {
        if(detailGroup) detailGroup.style.display = 'flex';

        if(detailLabel) detailLabel.innerText = 'MÔ TẢ PHỤ KIỆN';
        if(detailInput) detailInput.placeholder = 'VD: Hộp nhung cao cấp, khăn lau bạc...';
    }

    //  DEFAULT
    else {
        if(materialGroup) materialGroup.style.display = 'flex';
        if(detailGroup) detailGroup.style.display = 'flex';

        if(detailLabel) detailLabel.innerText = 'THÔNG TIN SẢN PHẨM';
        if(detailInput) detailInput.placeholder = 'Nhập thông tin...';
    }
};

// Ham openAddProductForm: mo logic tuong ung.
window.openAddProductForm = function() {
    document.getElementById('adminFormTitle').innerText = 'THÊM SẢN PHẨM MỚI';
    document.getElementById('formSaveMode').value = 'add';
    
    //  default category (jewelry)
    document.getElementById('formCategory').value = 'nhanbac';

    //  ID
    document.getElementById('formId').value = '';
    document.getElementById('formId').disabled = false;

    //  thông tin cơ bản
    document.getElementById('formName').value = '';
    document.getElementById('formPrice').value = '';
    document.getElementById('formStock').value = '';

    //  field jewelry (đổi từ ammo/mag/acc)
    document.getElementById('formMaterial').value = '';   // chất liệu
    document.getElementById('formSize').value = '';       // size (ni)
    document.getElementById('formDetail').value = '';     // mô tả / đá

    //  ảnh
    document.getElementById('formImg').value = '';

    //  supplier
    const supplierSelect = document.getElementById('formSupplier');
    if(supplierSelect) {
        const suppliers = JSON.parse(localStorage.getItem('supplierData')) || [];
        supplierSelect.innerHTML = '<option value="">-- Không có / Tự nhập --</option>' + 
            suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        supplierSelect.value = '';
    }

    //  cập nhật field theo category
    toggleAdminFields();

    //  mở modal
    const modal = document.getElementById('adminFormModal');
    if(modal) modal.classList.remove('hide-menu');
};

// Ham editWeapon: chinh sua logic tuong ung.
window.editWeapon = function(id) {
    const p = dbProducts.find(item => item.id === id);
    if(!p) return;

    document.getElementById('adminFormTitle').innerText = 'CHỈNH SỬA THÔNG SỐ: ' + p.name;
    document.getElementById('formSaveMode').value = 'edit';
    
    document.getElementById('formCategory').value = p.subcategory || p.category;
    document.getElementById('formId').value = p.id;
    document.getElementById('formId').disabled = true; 
    document.getElementById('formName').value = p.name;
    document.getElementById('formPrice').value = p.price;
    document.getElementById('formStock').value = p.stock;
    document.getElementById('formAmmo').value = p.ammo || '';
    document.getElementById('formMag').value = p.mag || '';
    document.getElementById('formAcc').value = p.acc || '';
    document.getElementById('formImg').value = p.img;

    const supplierSelect = document.getElementById('formSupplier');
    if(supplierSelect) {
        const suppliers = JSON.parse(localStorage.getItem('supplierData')) || [];
        supplierSelect.innerHTML = '<option value="">-- Không có / Tự nhập --</option>' + 
            suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        supplierSelect.value = p.supplierId || '';
    }

    toggleAdminFields();

    const modal = document.getElementById('adminFormModal');
    if(modal) modal.classList.remove('hide-menu');
};

// Ham closeAdminForm: dong logic tuong ung.
window.closeAdminForm = function() {
    const modal = document.getElementById('adminFormModal');
    if(modal) modal.classList.add('hide-menu');
};

// Ham saveProduct: luu logic tuong ung.
window.saveProduct = function() {
    const mode = document.getElementById('formSaveMode').value;
    const subcategory = document.getElementById('formCategory').value;

    let category = subcategory;
    if (['nhanbac', 'nhanvang', 'nhanmoissanite', 'nhandaquy'].includes(subcategory)) {
        category = 'nhan';
    } else if (['daychuyenbac', 'daychuyenvang', 'matday'].includes(subcategory)) {
        category = 'daychuyen';
    } else if (['lactay', 'vongtay'].includes(subcategory)) {
        category = 'lactay';
    } else if (subcategory.startsWith('bongtai')) {
        category = 'bongtai';
    } else if (['nhannam', 'daychuyennam', 'lactaynam'].includes(subcategory)) {
        category = 'trangsucnam';
    } else if (['nhancuoi', 'nhancapdoi', 'quatang'].includes(subcategory)) {
        category = 'trangsuccuoi';
    } else if (['hoptrangsuc', 'khanlau', 'phukien'].includes(subcategory)) {
        category = 'phukien';
    }

    const id = document.getElementById('formId').value.trim();
    const name = document.getElementById('formName').value.trim();
    const price = parseInt(document.getElementById('formPrice').value, 10);
    const stock = parseInt(document.getElementById('formStock').value, 10);

    // đổi key cho match jewelry
    const material = document.getElementById('formMaterial').value.trim();
    const size = document.getElementById('formSize').value.trim();
    const detail = document.getElementById('formDetail').value.trim();

    const img = document.getElementById('formImg').value.trim();
    const supplierId = document.getElementById('formSupplier')
        ? document.getElementById('formSupplier').value
        : '';

    if (!id || !name || isNaN(price) || isNaN(stock)) {
        showToast('Lỗi: Cần điền đầy đủ Mã SP, Tên, Giá và Số hàng!');
        return;
    }

    if (price < 0 || stock < 0) {
        showToast('Lỗi: Giá bán và số lượng không được âm!');
        return;
    }

    const normalizedId = id.toUpperCase();
    const resolvedImg = img || (window.productFallbackImage || '../product-fallback.svg');

    if (mode === 'add') {
        const exist = dbProducts.find(p => p.id === normalizedId);
        if (exist) {
            showToast('Lỗi: Mã sản phẩm này đã tồn tại trong kho!');
            return;
        }

        dbProducts.push({
            id: normalizedId,
            name,
            category,
            subcategory,
            price,
            stock,

            // giữ lại key cũ để không vỡ code cũ nếu chỗ khác vẫn đang đọc
            ammo: material,
            mag: size,
            acc: detail,

            // thêm key mới cho đúng nghĩa jewelry
            material,
            size,
            detail,

            supplierId,
            img: resolvedImg,
            collection: 'Mới thêm',
            tagline: 'Sản phẩm vừa được admin cập nhật vào catalog storefront.',
            salePercent: 0,
            featured: false,
            createdAt: new Date().toISOString()
        });

        showToast('Đã nhập kho sản phẩm mới thành công!');
    } else {
        const index = dbProducts.findIndex(p => p.id === normalizedId);
        if (index > -1) {
            dbProducts[index] = {
                ...dbProducts[index],
                id: normalizedId,
                name,
                category,
                subcategory,
                price,
                stock,

                ammo: material,
                mag: size,
                acc: detail,

                material,
                size,
                detail,

                supplierId,
                img: resolvedImg
            };

            showToast('Đã cập nhật thông tin sản phẩm thành công!');
        }
    }

    if (typeof persistProducts === 'function') persistProducts();
    if (typeof hydrateCartFromStorage === 'function') hydrateCartFromStorage();

    closeAdminForm();

    const adminSearchInput = document.getElementById('adminSearchInput');
    const keyword = adminSearchInput ? adminSearchInput.value : '';
    renderAdminProductTable(keyword, normalizedId);

    renderProducts(typeof currentStoreCategory === 'string' ? currentStoreCategory : 'all');
    renderTopSelling();
    if (typeof renderSaleProducts === 'function') renderSaleProducts();
    if (typeof renderOrderHistory === 'function') renderOrderHistory();
    renderSidebar();

    if (typeof renderAdminSuppliers === 'function') {
        const supSearch = document.getElementById('adminSupplierSearchInput');
        renderAdminSuppliers(supSearch ? supSearch.value : '');
    }
};

// Ham deleteWeapon: xoa logic tuong ung.
window.deleteWeapon = function(id, btnElement) {
    const confirmDelete = confirm('Xac nhan xoa san pham nay khoi danh muc?');
    if (!confirmDelete) return;

    const row = btnElement.closest('tr');
    if (row) {
        row.classList.add('fade-out-row');
    }

    setTimeout(() => {
        const index = dbProducts.findIndex(p => p.id === id);
        if (index > -1) {
            dbProducts.splice(index, 1);
            if (typeof persistProducts === 'function') persistProducts();
            if (typeof hydrateCartFromStorage === 'function') hydrateCartFromStorage();
            showToast('Da xoa san pham thanh cong!');

            const adminSearchInput = document.getElementById('adminSearchInput');
            const keyword = adminSearchInput ? adminSearchInput.value : '';
            renderAdminProductTable(keyword);

            renderProducts(typeof currentStoreCategory === 'string' ? currentStoreCategory : 'all');
            renderTopSelling();
            if (typeof renderSaleProducts === 'function') renderSaleProducts();
            if (typeof renderOrderHistory === 'function') renderOrderHistory();
            renderSidebar();

            if (typeof renderAdminSuppliers === 'function') {
                const supSearch = document.getElementById('adminSupplierSearchInput');
                renderAdminSuppliers(supSearch ? supSearch.value : '');
            }
        }
    }, 300);
};

// Ham toggleAdminFields: bat/tat logic tuong ung.
window.toggleAdminFields = function() {
    const cat = document.getElementById('formCategory').value;
    const ammoGroup = document.getElementById('groupFormAmmo');
    const magGroup = document.getElementById('groupFormMag');
    const accGroup = document.getElementById('groupFormAcc');
    const ammoLabel = ammoGroup ? ammoGroup.querySelector('label') : null;
    const magLabel = magGroup ? magGroup.querySelector('label') : null;
    const accLabel = document.getElementById('lblFormAcc');
    const ammoInput = document.getElementById('formAmmo');
    const magInput = document.getElementById('formMag');
    const accInput = document.getElementById('formAcc');

    if (ammoGroup) ammoGroup.style.display = 'flex';
    if (magGroup) magGroup.style.display = 'flex';
    if (accGroup) accGroup.style.display = 'flex';

    if (magLabel) magLabel.innerText = 'KICH CO / SIZE';
    if (ammoLabel) ammoLabel.innerText = 'CHAT LIEU';
    if (magInput) magInput.placeholder = 'VD: Ni 7, 45cm, Free size...';
    if (ammoInput) ammoInput.placeholder = 'VD: Bac 925, Vang 18K...';

    if (['phukien', 'hoptrangsuc', 'khanlau'].includes(cat)) {
        if (accLabel) accLabel.innerText = 'MO TA / CONG DUNG';
        if (accInput) accInput.placeholder = 'VD: Lot nhung mem, lam sach be mat, bao quan trang suc...';
        return;
    }

    if (accLabel) accLabel.innerText = 'DAC DIEM NOI BAT';
    if (accInput) accInput.placeholder = 'VD: Dinh da CZ, khac ten, charm trai tim...';
};

// Ham openAddProductForm: mo logic tuong ung.
window.openAddProductForm = function() {
    document.getElementById('adminFormTitle').innerText = 'THEM SAN PHAM MOI';
    document.getElementById('formSaveMode').value = 'add';

    document.getElementById('formCategory').value = 'nhanbac';
    document.getElementById('formId').value = '';
    document.getElementById('formId').disabled = false;
    document.getElementById('formName').value = '';
    document.getElementById('formPrice').value = '';
    document.getElementById('formStock').value = '';
    document.getElementById('formAmmo').value = '';
    document.getElementById('formMag').value = '';
    document.getElementById('formAcc').value = '';
    document.getElementById('formImg').value = '';

    const supplierSelect = document.getElementById('formSupplier');
    if (supplierSelect) {
        const suppliers = JSON.parse(localStorage.getItem('supplierData')) || [];
        supplierSelect.innerHTML = '<option value="">-- Khong co / Tu nhap --</option>' +
            suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        supplierSelect.value = '';
    }

    window.toggleAdminFields();

    const modal = document.getElementById('adminFormModal');
    if (modal) modal.classList.remove('hide-menu');
};

// Ham saveProduct: luu logic tuong ung.
window.saveProduct = function() {
    const mode = document.getElementById('formSaveMode').value;
    const subcategory = document.getElementById('formCategory').value;

    let category = subcategory;
    if (['nhanbac', 'nhanvang', 'nhanmoissanite', 'nhandaquy'].includes(subcategory)) category = 'nhan';
    else if (['daychuyenbac', 'daychuyenvang', 'matday'].includes(subcategory)) category = 'daychuyen';
    else if (['lactay', 'vongtay'].includes(subcategory)) category = 'lactay';
    else if (subcategory.startsWith('bongtai')) category = 'bongtai';
    else if (['nhannam', 'daychuyennam', 'lactaynam'].includes(subcategory)) category = 'trangsucnam';
    else if (['nhancuoi', 'nhancapdoi', 'quatang'].includes(subcategory)) category = 'trangsuccuoi';
    else if (['phukien', 'hoptrangsuc', 'khanlau'].includes(subcategory)) category = 'phukien';

    const id = document.getElementById('formId').value.trim();
    const name = document.getElementById('formName').value.trim();
    const price = parseInt(document.getElementById('formPrice').value);
    const stock = parseInt(document.getElementById('formStock').value);
    const ammo = document.getElementById('formAmmo').value.trim();
    const mag = document.getElementById('formMag').value.trim();
    const acc = document.getElementById('formAcc').value.trim();
    const img = document.getElementById('formImg').value.trim();
    const supplierId = document.getElementById('formSupplier') ? document.getElementById('formSupplier').value : '';

    if (!id || !name || isNaN(price) || isNaN(stock)) {
        showToast('Loi: Can dien day du Ma SP, Ten, Gia va So hang!');
        return;
    }

    if (price < 0 || stock < 0) {
        showToast('Loi: Gia ban va so luong khong duoc am!');
        return;
    }

    const normalizedId = id.toUpperCase();
    const resolvedImg = img || (window.productFallbackImage || '../product-fallback.svg');

    if (mode === 'add') {
        const exist = dbProducts.find(p => p.id === normalizedId);
        if (exist) {
            showToast('Loi: Ma san pham nay da ton tai trong kho!');
            return;
        }

        dbProducts.push({
            id: normalizedId,
            name,
            category,
            subcategory,
            price,
            stock,
            ammo,
            mag,
            acc,
            supplierId,
            img: resolvedImg,
            collection: 'Moi them',
            tagline: 'San pham vua duoc admin cap nhat vao catalog storefront.',
            salePercent: 0,
            featured: false,
            createdAt: new Date().toISOString()
        });
        showToast('Da nhap kho san pham moi thanh cong!');
    } else {
        const index = dbProducts.findIndex(p => p.id === normalizedId);
        if (index > -1) {
            dbProducts[index] = {
                ...dbProducts[index],
                id: normalizedId,
                name,
                category,
                subcategory,
                price,
                stock,
                ammo,
                mag,
                acc,
                supplierId,
                img: resolvedImg
            };
            showToast('Da cap nhat thong tin san pham thanh cong!');
        }
    }

    if (typeof persistProducts === 'function') persistProducts();
    if (typeof hydrateCartFromStorage === 'function') hydrateCartFromStorage();

    closeAdminForm();

    const adminSearchInput = document.getElementById('adminSearchInput');
    const keyword = adminSearchInput ? adminSearchInput.value : '';
    renderAdminProductTable(keyword, normalizedId);

    renderProducts(typeof currentStoreCategory === 'string' ? currentStoreCategory : 'all');
    renderTopSelling();
    if (typeof renderSaleProducts === 'function') renderSaleProducts();
    if (typeof renderOrderHistory === 'function') renderOrderHistory();
    renderSidebar();

    if (typeof renderAdminSuppliers === 'function') {
        const supSearch = document.getElementById('adminSupplierSearchInput');
        renderAdminSuppliers(supSearch ? supSearch.value : '');
    }
};
