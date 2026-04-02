/**
 * Module: products.js
 * Purpose: Storefront catalog filtering/search/sort + product detail modal data fill.
 * Main entry points: renderProducts(), focusStoreCategory(), searchProducts(), showDetail().
 */
let currentStoreCategory = 'all';
let currentStoreSort = 'featured';
let currentStoreSearch = '';

const storeCategoryMeta = {
    all: { label: 'Tất cả danh mục', desc: 'Khám phá toàn bộ bộ sưu tập trang sức cao cấp.' },

    nhan: { label: 'Nhẫn', desc: 'Những thiết kế nhẫn tinh xảo cho mọi phong cách.' },
    daychuyen: { label: 'Dây chuyền', desc: 'Tôn lên vẻ thanh lịch và sang trọng.' },
    lactay: { label: 'Lắc tay', desc: 'Nhẹ nhàng, nữ tính và dễ phối đồ.' },
    bongtai: { label: 'Bông tai', desc: 'Đa dạng kiểu dáng hiện đại và cuốn hút.' },
    matday: { label: 'Mặt dây', desc: 'Điểm nhấn tinh tế cho dây chuyền của bạn.' },
    trangsucnam: { label: 'Trang sức nam', desc: 'Thiết kế mạnh mẽ, tối giản và sang trọng.' },
    trangsuccuoi: { label: 'Trang sức cưới', desc: 'Biểu tượng cho khoảnh khắc trọn đời.' },
    phukien: { label: 'Phụ kiện', desc: 'Hộp quà, khăn lau và phụ kiện bảo quản.' },

    'nhan-tron': { label: 'Nhẫn trơn', desc: 'Phong cách tối giản, thanh lịch.' },
    'nhan-dinhda': { label: 'Nhẫn đính đá', desc: 'Tinh xảo và nổi bật với chi tiết đính đá.' },
    'nhan-moissanite': { label: 'Nhẫn moissanite', desc: 'Ánh sáng rực rỡ, sang trọng hiện đại.' },
    'nhan-cao-cap': { label: 'Nhẫn cao cấp', desc: 'Dòng premium dành cho bộ sưu tập đặc biệt.' },

    'lactay-mem': { label: 'Lắc tay mềm', desc: 'Uyển chuyển và thanh lịch.' },
    'lactay-cung': { label: 'Lắc tay cứng', desc: 'Kiểu dáng hiện đại, cá tính.' },
    'lactay-daquy': { label: 'Lắc tay đá quý', desc: 'Điểm nhấn nổi bật với đá tự nhiên.' },

    'bongtai-nho': { label: 'Bông tai nhỏ', desc: 'Dễ đeo hằng ngày, tinh tế.' },
    'bongtai-cao-cap': { label: 'Bông tai cao cấp', desc: 'Nổi bật và cuốn hút cho dịp đặc biệt.' },

    'matday-vang': { label: 'Mặt dây vàng', desc: 'Tỏa sáng với sắc vàng sang trọng.' },
    'matday-bac': { label: 'Mặt dây bạc', desc: 'Thanh lịch, hiện đại và dễ phối.' },
    'matday-kimcuong': { label: 'Mặt dây kim cương', desc: 'Cao cấp và đẳng cấp.' },
    'matday-daquy': { label: 'Mặt dây đá quý', desc: 'Mang giá trị thẩm mỹ và phong thủy.' },
    'matday-do': { label: 'Mặt dây đá đỏ', desc: 'Ấn tượng và nổi bật.' },
    'matday-toi-gian': { label: 'Mặt dây tối giản', desc: 'Nhẹ nhàng, tinh gọn và hiện đại.' },
    'matday-phong-thuy': { label: 'Mặt dây phong thủy', desc: 'Mang ý nghĩa may mắn và tài lộc.' },
    'matday-nghe-thuat': { label: 'Mặt dây nghệ thuật', desc: 'Thiết kế sáng tạo và độc đáo.' },
    'matday-doc-ban': { label: 'Mặt dây độc bản', desc: 'Phiên bản giới hạn dành riêng cho bạn.' }
};;

const storeCategoryGroups = {
    all: ['all'],

    nhan: ['nhan', 'nhan-tron', 'nhan-dinhda', 'nhan-moissanite', 'nhan-cao-cap'],
    daychuyen: ['daychuyen'],
    lactay: ['lactay', 'lactay-mem', 'lactay-cung', 'lactay-daquy'],
    bongtai: ['bongtai', 'bongtai-nho', 'bongtai-cao-cap'],
    matday: [
        'matday',
        'matday-vang',
        'matday-bac',
        'matday-kimcuong',
        'matday-daquy',
        'matday-do',
        'matday-toi-gian',
        'matday-phong-thuy',
        'matday-nghe-thuat',
        'matday-doc-ban'
    ],
    trangsucnam: ['trangsucnam'],
    trangsuccuoi: ['trangsuccuoi'],
    phukien: ['phukien']
};

Object.assign(storeCategoryMeta, {
    nhanbac: { label: 'Nhan bac', desc: 'Thanh lich, nhe nhang va de deo hang ngay.' },
    nhanvang: { label: 'Nhan vang', desc: 'Sang trong, noi bat va ben dep.' },
    nhanmoissanite: { label: 'Nhan moissanite', desc: 'Lap lanh hien dai, phu hop cho dip dac biet.' },
    nhandaquy: { label: 'Nhan da quy', desc: 'Ton len ve quy phai va ca tinh rieng.' },
    daychuyenbac: { label: 'Day chuyen bac', desc: 'Tinh te, hien dai va de phoi do.' },
    daychuyenvang: { label: 'Day chuyen vang', desc: 'Sac vang noi bat cho phong cach sang trong.' },
    vongtay: { label: 'Vong tay', desc: 'Thiet ke thanh lich cho nhieu dip su dung.' },
    'bongtai-dinhda': { label: 'Bong tai dinh da', desc: 'Lap lanh va noi bat trong tung chi tiet.' },
    'bongtai-ngoctrai': { label: 'Bong tai ngoc trai', desc: 'Tinh te, co dien va sang trong.' },
    'bongtai-toigian': { label: 'Bong tai toi gian', desc: 'Nhe nhang, tinh gon va de deo moi ngay.' },
    nhannam: { label: 'Nhan nam', desc: 'Kieu dang nam tinh, ban linh va hien dai.' },
    daychuyennam: { label: 'Day chuyen nam', desc: 'Toi gian nhung van noi bat.' },
    lactaynam: { label: 'Lac tay nam', desc: 'Ca tinh, khoe khoan va de phoi phong cach.' },
    nhancuoi: { label: 'Nhan cuoi', desc: 'Thiet ke y nghia cho hanh trinh gan ket ben lau.' },
    nhancapdoi: { label: 'Nhan cap doi', desc: 'Mon qua ngot ngao cho hai nguoi.' },
    quatang: { label: 'Qua tang ky niem', desc: 'Trao gui tinh cam qua nhung mon qua tinh te.' },
    hoptrangsuc: { label: 'Hop trang suc', desc: 'Bao quan san pham gon gang va sang trong.' },
    khanlau: { label: 'Khan lau trang suc', desc: 'Giup trang suc luon sang bong va sach dep.' }
});

storeCategoryGroups.nhan = ['nhan', 'nhanbac', 'nhanvang', 'nhanmoissanite', 'nhandaquy'];
storeCategoryGroups.daychuyen = ['daychuyen', 'daychuyenbac', 'daychuyenvang', 'matday'];
storeCategoryGroups.lactay = ['lactay', 'vongtay'];
storeCategoryGroups.bongtai = ['bongtai', 'bongtai-dinhda', 'bongtai-ngoctrai', 'bongtai-toigian'];
storeCategoryGroups.matday = ['matday'];
storeCategoryGroups.trangsucnam = ['trangsucnam', 'nhannam', 'daychuyennam', 'lactaynam'];
storeCategoryGroups.trangsuccuoi = ['trangsuccuoi', 'nhancuoi', 'nhancapdoi', 'quatang'];
storeCategoryGroups.phukien = ['phukien', 'hoptrangsuc', 'khanlau'];

// Ham getStoreCategoryMeta: lay logic tuong ung.
function getStoreCategoryMeta(category) {
    return storeCategoryMeta[category] || storeCategoryMeta.all;
}

// Ham getCurrentUserRole: lay logic tuong ung.
function getCurrentUserRole() {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    return currentUser ? currentUser.role : 'guest';
}

// Ham formatStorePrice: dinh dang logic tuong ung.
function formatStorePrice(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')}$`;
}

// Ham getStockPresentation: lay logic tuong ung.
function getStockPresentation(stock) {
    if (stock <= 0) return { label: 'Het hang', className: 'out' };
    if (stock < 5) return { label: `Con ${stock}`, className: 'low' };
    return { label: 'San kho', className: 'ready' };
}

// Ham getCategoryKeys: lay logic tuong ung.
function getCategoryKeys(category) {
    if (storeCategoryGroups[category]) return storeCategoryGroups[category];
    return [category];
}

// Ham matchesStoreCategory: kiem tra khop logic tuong ung.
function matchesStoreCategory(product, category) {
    if (category === 'all') return true;

    const categoryKeys = getCategoryKeys(category);
    return categoryKeys.includes(product.category) || categoryKeys.includes(product.subcategory);
}

// Ham buildProductSearchText: tao logic tuong ung.
function buildProductSearchText(product) {
    const categoryMeta = getStoreCategoryMeta(product.subcategory || product.category);
    return [
        product.id,
        product.name,
        product.collection,
        product.tagline,
        product.ammo,
        product.mag,
        product.acc,
        categoryMeta.label,
        ...(product.searchTags || [])
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

// Ham matchesStoreSearch: kiem tra khop logic tuong ung.
function matchesStoreSearch(product, keyword) {
    if (!keyword) return true;
    return buildProductSearchText(product).includes(keyword);
}

// Ham sortStoreProducts: sap xep logic tuong ung.
function sortStoreProducts(products) {
    const sorted = [...products];

    if (currentStoreSort === 'price-asc') {
        return sorted.sort((left, right) => left.price - right.price || left.name.localeCompare(right.name, 'vi'));
    }

    if (currentStoreSort === 'price-desc') {
        return sorted.sort((left, right) => right.price - left.price || left.name.localeCompare(right.name, 'vi'));
    }

    if (currentStoreSort === 'sale') {
        return sorted.sort((left, right) => (right.salePercent || 0) - (left.salePercent || 0) || right.price - left.price);
    }

    if (currentStoreSort === 'stock') {
        return sorted.sort((left, right) => right.stock - left.stock || left.name.localeCompare(right.name, 'vi'));
    }

    return sorted.sort((left, right) => {
        const featuredDelta = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
        if (featuredDelta !== 0) return featuredDelta;

        const saleDelta = (right.salePercent || 0) - (left.salePercent || 0);
        if (saleDelta !== 0) return saleDelta;

        return left.name.localeCompare(right.name, 'vi');
    });
}

// Ham syncDropdownSelectedText: dong bo logic tuong ung.
function syncDropdownSelectedText() {
    const textEl = document.getElementById('dropdownSelectedText');
    if (!textEl) return;

    textEl.innerText = getStoreCategoryMeta(currentStoreCategory).label;
}

// Ham updateCatalogResultCopy: cap nhat logic tuong ung.
function updateCatalogResultCopy(totalItems) {
    const countEl = document.getElementById('storeCatalogResultCount');
    if (!countEl) return;

    const categoryMeta = getStoreCategoryMeta(currentStoreCategory);
    const prefix = currentStoreSearch ? `Tìm thấy ${totalItems}` : `Đang hiển thị ${totalItems}`;
    countEl.innerText = `${prefix} sản phẩm trong nhóm ${categoryMeta.label.toLowerCase()}.`;
}

// Ham buildCatalogEmptyState: tao logic tuong ung.
function buildCatalogEmptyState() {
    const categoryMeta = getStoreCategoryMeta(currentStoreCategory);
    const searchNote = currentStoreSearch
        ? `<p class="shop-empty-copy">Không có kết quả cho từ khóa "${currentStoreSearch}" trong nhóm ${categoryMeta.label.toLowerCase()}.</p>`
        : `<p class="shop-empty-copy">Nhóm ${categoryMeta.label.toLowerCase()} chưa có sản phẩm sẵn sàng lên kệ.</p>`;

    return `
        <div class="shop-empty-state">
            <strong>Kho chưa có kết quả phù hợp</strong>
            ${searchNote}
            <div class="shop-empty-actions">
                <button class="tactical-btn shop-primary-btn compact" onclick="focusStoreCategory('all')">Xem toàn bộ catalog</button>
                <button class="tactical-btn tactical-btn-secondary compact" onclick="searchProducts('')">Xóa tìm kiếm</button>
            </div>
        </div>
    `;
}

// Ham buildStoreProductCard: tao logic tuong ung.
function buildStoreProductCard(product, options = {}) {
    const salePercent = Number(options.salePercent ?? product.salePercent ?? 0) || 0;
    const displayPrice = salePercent > 0 ? Math.round(product.price * (100 - salePercent) / 100) : product.price;

    return `
        <article class="store-product-card product-card fade-in-tactical">
            <div class="store-product-media" style="margin-top: 10px;">
                <img src="${product.img}" alt="${product.name}" onerror="this.onerror=null;this.src='${window.productFallbackImage || '../product-fallback.svg'}';">
            </div>
            <h3 class="store-product-title">${product.name}</h3>
            
            <div class="store-price-row">
                <span class="store-price-current">
                    <span style="color: rgb(30, 41, 59); font-size: 16px; font-weight: bold; margin-right: 4px;">Giá:</span><span style="color: rgb(239, 68, 68);">${formatStorePrice(displayPrice)}</span>
                </span>
            </div>
            
            <div class="store-card-actions">
                <button class="tactical-btn" style="background: rgb(0, 0, 0); color: rgb(193, 206, 50); width: 100%; border-radius: 12px; font-size: 14px; font-weight: bold; letter-spacing: 1px;" onclick="showDetail('${product.id}')">CHI TIẾT</button>
            </div>
        </article>
    `;
}

window.createStoreProductCard = buildStoreProductCard;

// Category shortcut buttons on home call this to jump + re-render catalog.
// Ham focusStoreCategory: tap trung logic tuong ung.
window.focusStoreCategory = function(category) {
    currentStoreCategory = category || 'all';
    syncDropdownSelectedText();
    renderProducts(currentStoreCategory);

    const section = document.getElementById('storeProductCatalog');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Ham scrollStoreSection: cuon logic tuong ung.
window.scrollStoreSection = function(id) {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Home section: sale cards.
// Ham renderSaleProducts: hien thi logic tuong ung.
window.renderSaleProducts = function() {
    const container = document.getElementById('saleProductsGrid');
    if (!container) return;

    const saleProducts = [...dbProducts]
        .filter(product => (product.salePercent || 0) > 0)
        .sort((left, right) => (right.salePercent || 0) - (left.salePercent || 0) || right.price - left.price)
        .slice(0, 4);

    const displayProducts = saleProducts.length > 0
        ? saleProducts
        : [...dbProducts].sort((left, right) => right.price - left.price).slice(0, 4);

    if (displayProducts.length === 0) {
        container.innerHTML = '<div class="shop-empty-state compact"><strong>Chưa có deal để hiển thị.</strong></div>';
        return;
    }

    container.innerHTML = displayProducts.map(product => buildStoreProductCard(product, { salePercent: product.salePercent || 10 })).join('');
};

// Home section: promotion strip cards.
// Ham renderStorePromoStrip: hien thi logic tuong ung.
window.renderStorePromoStrip = function() {
    const container = document.getElementById('storePromoStrip');
    if (!container) return;

    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const issuedVouchers = (JSON.parse(localStorage.getItem('issuedVoucherData')) || [])
        .filter(voucher => currentUser && voucher.email === currentUser.email)
        .slice(0, 1)
        .map(voucher => ({
            code: voucher.code,
            valueLabel: voucher.valueLabel,
            condition: `${voucher.title} · ${voucher.condition}`
        }));
    const promotions = (JSON.parse(localStorage.getItem('promotionData')) || [])
        .filter(promotion => promotion.status === 'Đang áp dụng' || promotion.status === 'Đang áp dụng')
        .slice(0, Math.max(0, 3 - issuedVouchers.length));
    const displayPromotions = [...issuedVouchers, ...promotions];

    if (displayPromotions.length === 0) {
        container.innerHTML = `
            <div class="shop-promo-card">
                <small>ưu đãi sẵn có</small>
                <strong>Catalog đã sẵn sàng</strong>
                <span>Admin có thể bật thêm các mã khuyến mãi để đẩy tỷ lệ chốt đơn trong giờ cao điểm.</span>
            </div>
        `;
        return;
    }

    container.innerHTML = displayPromotions.map(promotion => `
        <article class="shop-promo-card">
            <small>${promotion.code}</small>
            <strong>${promotion.valueLabel}</strong>
            <span>${promotion.condition}</span>
        </article>
    `).join('');
};

// Home section: KPI counters for customer storefront.
// Ham renderStoreInsights: hien thi logic tuong ung.
window.renderStoreInsights = function() {
    const totalEl = document.getElementById('storeTotalCatalogCount');
    const dealEl = document.getElementById('storeHotDealCount');
    const cartEl = document.getElementById('storeCartCount');
    const pendingEl = document.getElementById('storePendingOrderCount');
    const cartNavEl = document.getElementById('cartNavCount');
    const cartHeaderEl = document.getElementById('storeHeaderCartCount');
    const pendingNavEl = document.getElementById('orderPendingCount');

    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const cartItems = Array.isArray(window.currentCart) ? window.currentCart : [];
    const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const dealCount = dbProducts.filter(product => (product.salePercent || 0) > 0).length;
    let pendingCount = 0;

    if (currentUser) {
        const transactionSource = typeof getTransactionData === 'function'
            ? getTransactionData()
            : (JSON.parse(localStorage.getItem('transactionData')) || []);

        pendingCount = transactionSource.filter(order => {
            const sameEmail = currentUser.email && order.customerEmail === currentUser.email;
            const sameName = order.customerName === currentUser.name;
            return (sameEmail || sameName) && order.status === 'Chờ duyệt';
        }).length;
    }

    if (totalEl) totalEl.innerText = dbProducts.length;
    if (dealEl) dealEl.innerText = dealCount;
    if (cartEl) cartEl.innerText = cartCount;
    if (pendingEl) pendingEl.innerText = pendingCount;
    if (cartNavEl) cartNavEl.innerText = cartCount;
    if (cartHeaderEl) cartHeaderEl.innerText = cartCount;
    if (pendingNavEl) pendingNavEl.innerText = pendingCount;
}

// Ham searchProducts: tim kiem logic tuong ung.
function searchProducts(keyword) {
    currentStoreSearch = String(keyword || '').trim().toLowerCase();
    const input = document.getElementById('storeSearchInput');
    const headerInput = document.getElementById('storeHeaderSearchInput');
    if (input && input.value !== String(keyword || '')) {
        input.value = String(keyword || '');
    }
    if (headerInput && headerInput.value !== String(keyword || '')) {
        headerInput.value = String(keyword || '');
    }
    renderProducts(currentStoreCategory);
}

window.searchProducts = searchProducts;

// Main catalog renderer: filters by category + keyword, then paints product cards.
// Ham renderProducts: hien thi logic tuong ung.
function renderProducts(category = currentStoreCategory) {
    currentStoreCategory = category || 'all';

    const container = document.querySelector('.display-products');
    if (!container) return;

    syncDropdownSelectedText();

    const keyword = currentStoreSearch.trim().toLowerCase();
    const filteredProducts = sortStoreProducts(
        dbProducts.filter(product => matchesStoreCategory(product, currentStoreCategory) && matchesStoreSearch(product, keyword))
    );

    updateCatalogResultCopy(filteredProducts.length);

    if (filteredProducts.length === 0) {
        container.innerHTML = buildCatalogEmptyState();
        return;
    }

    container.innerHTML = filteredProducts.map(product => buildStoreProductCard(product)).join('');
}

window.renderProducts = renderProducts;

// Product detail modal state fill + media fallback handling.
// Ham showDetail: hien thi logic tuong ung.
function showDetail(id) {
    const product = dbProducts.find(item => item.id === id);
    if (!product) return;

    currentSelectedProduct = product;

    const modalName = document.getElementById('mdlName');
    const modalTagline = document.getElementById('mdlTagline');
    const modalImg = document.getElementById('mdlImg');
    const modalPrice = document.getElementById('mdlPrice');

    if (modalName) modalName.innerText = product.name;
    if (modalTagline) modalTagline.innerText = product.tagline || getStoreCategoryMeta(product.category).desc;
    if (modalImg) {
        modalImg.src = product.img;
        modalImg.onerror = function() {
            this.onerror = null;
            this.src = window.productFallbackImage || '../product-fallback.svg';
        };
    }
    
    // CẬP NHẬT CHỮ GIÁ MÀU ĐEN - TIỀN MÀU ĐỎ
    if (modalPrice) {
        const salePercent = product.salePercent || 0;
        const finalPrice = salePercent > 0 ? Math.round(product.price * (100 - salePercent) / 100) : product.price;
        
        const priceMarkup = salePercent > 0
            ? `<span style="color: rgb(132, 140, 45); font-size: 20px; font-weight: bold; margin-right: 8px;">Giá:</span><span style="color: rgb(239, 68, 68);">${formatStorePrice(finalPrice)}</span> <span class="store-modal-old-price">${formatStorePrice(product.price)}</span>`
            : `<span style="color: rgb(30, 41, 59); font-size: 20px; font-weight: bold; margin-right: 8px;">Giá:</span><span style="color: rgb(239, 68, 68);">${formatStorePrice(finalPrice)}</span>`;
        modalPrice.innerHTML = priceMarkup;
    }

    const stockEl = document.getElementById('mdlStock');
    if (stockEl) {
        stockEl.innerText = product.stock > 0 ? `${product.stock} sản phẩm` : 'Hết hàng';
        stockEl.style.color = product.stock > 0 ? 'var(--text-dark)' : 'var(--danger)';
    }

    const rowMag = document.getElementById('rowMdlMag');
    const rowAmmo = document.getElementById('rowMdlAmmo');
    const rowAcc = document.getElementById('rowMdlAcc');
    const lblAcc = document.getElementById('lblMdlAcc');
    const valMag = document.getElementById('mdlMag');
    const valAmmo = document.getElementById('mdlAmmo');
    const valAcc = document.getElementById('mdlAcc');

    if (rowMag) rowMag.style.display = 'none';
    if (rowAmmo) rowAmmo.style.display = 'none';
    if (rowAcc) rowAcc.style.display = 'none';

    if (['sungngan', 'shotgun', 'sungtruong', 'smg', 'hangnang'].includes(product.category)) {
        if (rowMag) rowMag.style.display = 'flex';
        if (rowAmmo) rowAmmo.style.display = 'flex';
        if (rowAcc) rowAcc.style.display = 'flex';
        if (lblAcc) lblAcc.innerText = 'Phụ kiện:';
        if (valMag) valMag.innerText = product.mag || '-';
        if (valAmmo) valAmmo.innerText = product.ammo || '-';
        if (valAcc) valAcc.innerText = product.acc || 'Không có';
    } else if (product.category === 'danduoc') {
        if (rowAmmo) rowAmmo.style.display = 'flex';
        if (valAmmo) valAmmo.innerText = product.ammo || '-';
    } else if (product.category === 'phukien') {
        if (rowAcc) rowAcc.style.display = 'flex';
        if (lblAcc) lblAcc.innerText = 'Tương thích với:';
        if (valAcc) valAcc.innerText = product.acc || 'Gắn được nhiều dòng';
    } else {
        if (rowAcc) rowAcc.style.display = 'flex';
        if (lblAcc) lblAcc.innerText = 'Thông số:';
        if (valAcc) valAcc.innerText = product.acc || '-';
    }

    if (rowMag) rowMag.style.display = product.mag ? 'flex' : 'none';
    if (rowAmmo) rowAmmo.style.display = product.ammo ? 'flex' : 'none';
    if (rowAcc) rowAcc.style.display = product.acc ? 'flex' : 'none';
    if (lblAcc) lblAcc.innerText = 'Dac diem:';
    if (valMag) valMag.innerText = product.mag || '-';
    if (valAmmo) valAmmo.innerText = product.ammo || '-';
    if (valAcc) valAcc.innerText = product.acc || '-';

    const qtyInput = document.getElementById('buyQty');
    if (qtyInput) qtyInput.value = 1;

    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const customerActions = document.getElementById('mdlCustomerActions');
    const adminActions = document.getElementById('mdlAdminActions');

    if (currentUser && currentUser.role === 'customer') {
        if (customerActions) customerActions.classList.remove('hide-menu');
        if (adminActions) adminActions.classList.add('hide-menu');
    } else {
        if (customerActions) customerActions.classList.add('hide-menu');
        if (adminActions) {
            adminActions.classList.remove('hide-menu');
            if (typeof updateTopSellingButtonUI === 'function') {
                updateTopSellingButtonUI(product.id);
            }
        }
    }

    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('hide-menu');
}

window.showDetail = showDetail;

// Ham closeModal: dong logic tuong ung.
function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.add('hide-menu');
    currentSelectedProduct = null;
}

window.closeModal = closeModal;

// Ham changeQty: thay doi logic tuong ung.
function changeQty(amount) {
    const qtyInput = document.getElementById('buyQty');
    if (!qtyInput || !currentSelectedProduct) return;

    const currentQty = Number(qtyInput.value) || 1;
    const nextQty = Math.min(Math.max(currentQty + amount, 1), currentSelectedProduct.stock || 1);

    if (nextQty === currentQty && amount > 0) {
        showToast('Đã đạt giới hạn tồn kho của sản phẩm này!');
        return;
    }

    qtyInput.value = nextQty;
}

window.changeQty = changeQty;

// Ham toggleDropdown: bat/tat logic tuong ung.
function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    if (menu) menu.classList.toggle('show');
}

window.toggleDropdown = toggleDropdown;

window.addEventListener('click', event => {
    const dropdown = document.getElementById('customCategoryDropdown');
    const menu = document.getElementById('dropdownMenu');
    if (dropdown && !dropdown.contains(event.target) && menu) {
        menu.classList.remove('show');
    }
});

// Ham selectCategory: chon logic tuong ung.
function selectCategory(categoryValue, displayText, event) {
    if (event) {
        event.stopPropagation();
    }

    currentStoreCategory = categoryValue;
    const textEl = document.getElementById('dropdownSelectedText');
    if (textEl) {
        textEl.innerText = displayText;
    }

    const menu = document.getElementById('dropdownMenu');
    if (menu) {
        menu.classList.remove('show');
    }

    renderProducts(currentStoreCategory);
}

window.selectCategory = selectCategory;
