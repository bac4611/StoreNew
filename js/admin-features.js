/**
 * Module: admin-features.js
 * Purpose: Top-selling picks and promotion center management.
 * Main entry points: renderTopSelling(), renderAdminPromotions(), savePromotion().
 */
const mockPromotionSeedVersion = 'dngear-promotion-seed-v1';

// Khởi tạo danh sách bán chạy mặc định (Chỉ chạy 1 lần duy nhất khi bộ nhớ trống)
// Ham initTopSelling: khoi tao logic tuong ung.
function initTopSelling() {
    let stored = localStorage.getItem('topSellingIds');
    if (!stored) {
        let defaults = dbProducts.filter(p => p.featured).map(p => p.id).slice(0, 6);
        if (defaults.length === 0) defaults = dbProducts.slice(0, 6).map(p => p.id);
        localStorage.setItem('topSellingIds', JSON.stringify(defaults));
    }
}
initTopSelling();

// Lấy danh sách đang được ghim
// Ham getTopSellingIds: lay logic tuong ung.
function getTopSellingIds() {
    let ids = [];
    try { ids = JSON.parse(localStorage.getItem('topSellingIds')) || []; } catch (e) { }

    // Quét loại bỏ những súng đã bị admin xóa vĩnh viễn khỏi kho
    const validIds = ids.filter(id => dbProducts.some(p => p.id === id));
    if (validIds.length !== ids.length) {
        localStorage.setItem('topSellingIds', JSON.stringify(validIds));
    }
    return validIds;
}

// Xử lý nút bấm Gỡ / Đưa vào banner
// Ham toggleTopSellingCurrent: bat/tat logic tuong ung.
function toggleTopSellingCurrent() {
    if (!currentSelectedProduct) return;
    const id = currentSelectedProduct.id;
    let ids = getTopSellingIds();

    if (ids.includes(id)) {
        // Lệnh gỡ: Xóa id khỏi mảng
        ids = ids.filter(i => i !== id);
        showToast('Đã gỡ sản phẩm khỏi banner Nổi bật!');
    } else {
        // Lệnh thêm
        if (ids.length >= 6) {
            showToast('Không thể thêm! Đã đạt giới hạn tối đa 6 mặt hàng.');
            return;
        }
        ids.push(id);
        showToast('Đã đưa sản phẩm lên banner Nổi bật!');
    }

    localStorage.setItem('topSellingIds', JSON.stringify(ids));
    updateTopSellingButtonUI(id);
    renderTopSelling();
}

// Ham updateTopSellingButtonUI: cap nhat logic tuong ung.
function updateTopSellingButtonUI(id) {
    const btn = document.getElementById('btnToggleTopSelling');
    if (!btn) return;

    const ids = getTopSellingIds();
    if (ids.includes(id)) {
        btn.innerText = '❌ GỠ KHỎI BANNER NỔI BẬT';
        btn.classList.add('remove-mode');
    } else {
        btn.innerText = '🌟 ĐƯA VÀO BANNER NỔI BẬT';
        btn.classList.remove('remove-mode');
    }
}
// Hàm này thay thế hoàn toàn hàm cũ trong app.js
// Ham renderTopSelling: hien thi logic tuong ung.
window.renderTopSelling = function () {
    const container = document.querySelector('.top-selling-grid');
    if (!container) return;
    container.innerHTML = '';

    const ids = getTopSellingIds();
    const topGuns = ids.map(id => dbProducts.find(product => product.id === id)).filter(Boolean);

    if (topGuns.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); width: 100%; text-align: center; grid-column: span 3; padding: 20px 0;">Chưa có mặt hàng nào được chọn.</p>';
        return;
    }

    topGuns.forEach(p => {
        if (typeof window.createStoreProductCard === 'function') {
            container.innerHTML += window.createStoreProductCard(p, {
                badgeLabel: p.collection || 'Hàng nổi bật',
                metaText: p.tagline || 'Mẫu đang được ghim lên khu bán chạy để tạo cảm giác storefront nhiều chuyển động.',
                secondaryText: 'CHI TIẾT',
                forceSingleAction: true
            });
            return;
        }

        const card = document.createElement('div');
        card.className = 'product-card fade-in-tactical';
        card.innerHTML = `
            <img src="${p.img}" alt="Hình ảnh sản phẩm">
            <h3 style="font-size: 18px; margin-bottom: 8px;">${p.name}</h3>
            <p style="color: rgb(239, 68, 68); font-size: 18px; font-weight: bold; margin-bottom: 18px;">
                <span style="font-size: 16px; font-weight: normal; color: rgb(100, 116, 139);">Giá: </span>${p.price}$
            </p>
            <button class="tactical-btn" style="padding: 10px; margin-top: 0; box-shadow: none; animation: none;" onclick="showDetail('${p.id}')">CHI TIẾT</button>
        `;
        container.appendChild(card);
    });
};
// khởi tạo, làm sách & cập nhật danh sách khuyến mãi trong db
// Ham initMockPromotions: khoi tao logic tuong ung.
function initMockPromotions() {
    let promotions = JSON.parse(localStorage.getItem('promotionData')) || [];
    const legacyCodes = ['NEWBIE50', 'VIPAMMO', 'FLASH20', 'FREESHIP'];
    if (promotions.length === 0) {
        promotions = buildMockPromotions();
    }

    const hasOnlyLegacyPromotions = promotions.length > 0
        && promotions.every(promotion => legacyCodes.includes(promotion.code));

    if (hasOnlyLegacyPromotions) {
        promotions = buildMockPromotions();
    } else if (localStorage.getItem('promotionSeedVersion') !== mockPromotionSeedVersion) {
        promotions = promotions.filter(promotion => !legacyCodes.includes(promotion.code));
        const existingCodes = new Set(promotions.map(promotion => promotion.code));
        buildMockPromotions().forEach(promotion => {
            if (!existingCodes.has(promotion.code)) {
                promotions.push(promotion);
            }
        });
    }

    localStorage.setItem('promotionSeedVersion', mockPromotionSeedVersion);
    localStorage.setItem('promotionData', JSON.stringify(promotions));
}
initMockPromotions();

// Ham buildMockPromotions: tao logic tuong ung.
function buildMockPromotions() {
    return [
        {
            id: 'KM11',
            code: 'WELCOME10',
            title: 'Ưu đãi khách hàng mới',
            valueLabel: 'Giảm 25%',
            condition: 'Áp dụng cho đơn hàng trang sức đầu tiên',
            uses: 216,
            usageLimit: 500,
            status: 'Đang áp dụng',
            rankValue: 10,
            rankUnit: '%'
        },
        {
            id: 'KM12',
            code: 'GIFTBOX',
            title: 'Tặng hộp quà cao cấp',
            valueLabel: 'Free Gift',
            condition: 'Áp dụng cho đơn hàng từ 2.000.000đ',
            uses: 74,
            usageLimit: 100,
            status: 'Đang áp dụng',
            rankValue: 1,
            rankUnit: 'combo'
        },
        {
            id: 'KM13',
            code: 'LUX15',
            title: 'Ưu đãi bộ sưu tập cao cấp',
            valueLabel: 'Giảm 15%',
            condition: 'Áp dụng cho trang sức cao cấp',
            uses: 189,
            usageLimit: 200,
            status: 'Đang áp dụng',
            rankValue: 15,
            rankUnit: '%'
        },
        {
            id: 'KM14',
            code: 'GIFTBOX',
            title: 'Tặng hộp quà cao cấp & thiệp',
            valueLabel: 'Free Gift',
            condition: 'Áp dụng cho đơn trang sức từ 2.000.000đ',
            uses: 92,
            usageLimit: 0,
            status: 'Đang áp dụng',
            rankValue: 0,
            rankUnit: ''
        },
        {
            id: 'KM15',
            code: 'FREESHIP',
            title: 'Giao hàng miễn phí VIP',
            valueLabel: 'Freeship',
            condition: 'Áp dụng cho đơn hàng từ 1.500.000đ',
            uses: 141,
            usageLimit: 999,
            status: 'Đang áp dụng',
            rankValue: 0,
            rankUnit: ''
        }
    ];
}

// Ham getPromotionData: lay logic tuong ung.
function getPromotionData() {
    return JSON.parse(localStorage.getItem('promotionData')) || [];
}

// Ham getNextPromotionId: lay logic tuong ung.
function getNextPromotionId() {
    const promotions = getPromotionData();
    const maxIndex = promotions.reduce((max, promotion) => {
        const currentIndex = parseInt(String(promotion.id || '').replace(/\D/g, ''), 10);
        return Number.isNaN(currentIndex) ? max : Math.max(max, currentIndex);
    }, 0);

    return `KM${String(maxIndex + 1).padStart(2, '0')}`;
}

// Ham formatPromotionRankValue: dinh dang logic tuong ung.
function formatPromotionRankValue(value, unit) {
    const numericValue = Number(value) || 0;

    if (unit === '%') return `${numericValue}%`;
    if (unit === '$') return `${numericValue}$`;
    if (unit === 'combo') return `${numericValue} combo`;

    return `${numericValue}`;
}

// Tạo HTML của form khuyến mãi và gắn vào trang (DOM)
function injectPromotionModal() {
    if (document.getElementById('adminPromotionFormModal')) return;

    const container = document.createElement('div');
    container.innerHTML = `
        <div class="modal-overlay promotion-modal-overlay hide-menu" id="adminPromotionFormModal">
            <div class="modal-content promotion-modal-content">
                <div class="modal-header">
                    <h2 class="modal-title" id="adminPromotionFormTitle">THÊM KHUYẾN MÃI</h2>
                    <span class="close-btn" onclick="closePromotionForm()">✕</span>
                </div>
                <div class="modal-body promotion-modal-body">
                    <input type="hidden" id="formPromotionSaveMode" value="add">
                    <div class="admin-form-grid promotion-form-grid">
                        <div class="admin-form-group">
                            <label>Mã khuyến mãi nội bộ</label>
                            <input type="text" id="formPromotionId" placeholder="VD: KM05">
                        </div>
                        <div class="admin-form-group">
                            <label>Mã áp dụng</label>
                            <input type="text" id="formPromotionCode" placeholder="VD: SPRING20">
                        </div>
                        <div class="admin-form-group full-width">
                            <label>Tên chương trình</label>
                            <input type="text" id="formPromotionTitle" placeholder="Nhập tên chương trình khuyến mãi...">
                        </div>
                        <div class="admin-form-group">
                            <label>Mức ưu đãi hiển thị</label>
                            <input type="text" id="formPromotionValueLabel" placeholder="VD: Giảm 20% hoặc Freeship toàn quốc">
                        </div>
                        <div class="admin-form-group">
                            <label>Lượt dùng khởi tạo</label>
                            <input type="number" id="formPromotionUses" min="0" value="0" placeholder="0">
                        </div>
                        <div class="admin-form-group">
                            <label>Giới hạn sử dụng</label>
                            <input type="number" id="formPromotionLimit" min="0" value="0" placeholder="0 (không giới hạn)">
                        </div>
                        <div class="admin-form-group">
                            <label>Giá trị ưu đãi</label>
                            <input type="number" id="formPromotionRankValue" min="0" value="0" placeholder="VD: 20">
                        </div>
                        <div class="admin-form-group">
                            <label>Đơn vị ưu đãi</label>
                            <select id="formPromotionRankUnit">
                                <option value="%">Phần trăm (%)</option>
                                <option value="$">Tiền mặt ($)</option>
                                <option value="combo">Combo / quà tặng</option>
                                <option value="">Khác</option>
                            </select>
                        </div>
                        <div class="admin-form-group">
                            <label>Trạng thái</label>
                            <select id="formPromotionStatus">
                                <option value="Đang áp dụng">Đang áp dụng</option>
                                <option value="Tạm dừng">Tạm dừng</option>
                            </select>
                        </div>
                        <div class="admin-form-group full-width">
                            <label>Điều kiện áp dụng</label>
                            <textarea id="formPromotionCondition" placeholder="Ví dụ: Áp dụng cho đơn từ 300$, riêng nhóm phụ kiện hoặc khách hàng mới..."></textarea>
                        </div>
                    </div>
                    <div class="admin-form-actions promotion-form-actions">
                        <button class="tactical-btn" style="background: transparent; color: rgb(239, 68, 68); border: 1px solid rgb(239, 68, 68); width: auto; padding: 10px 30px;" onclick="closePromotionForm()">HỦY BỎ</button>
                        <button class="tactical-btn" style="width: auto; padding: 10px 30px; background: rgb(34, 197, 94);" onclick="savePromotion()">LƯU KHUYẾN MÃI</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(container.children[0]);
}
injectPromotionModal();

/*Click "Thêm khuyến mãi"
→ set mode = add
→ reset toàn bộ input
→ generate ID mới
→ mở modal*/ 
window.openAddPromotionForm = function () {
    document.getElementById('adminPromotionFormTitle').innerText = 'THÊM KHUYẾN MÃI';
    document.getElementById('formPromotionSaveMode').value = 'add';
    document.getElementById('formPromotionId').value = getNextPromotionId(); //tạo id mới vd: km1 km2
    document.getElementById('formPromotionId').disabled = false;
    document.getElementById('formPromotionCode').value = '';
    document.getElementById('formPromotionTitle').value = '';
    document.getElementById('formPromotionValueLabel').value = '';
    document.getElementById('formPromotionUses').value = '0';
    document.getElementById('formPromotionLimit').value = '0';
    document.getElementById('formPromotionRankValue').value = '0';
    document.getElementById('formPromotionRankUnit').value = '%';
    document.getElementById('formPromotionStatus').value = 'Đang áp dụng';
    document.getElementById('formPromotionCondition').value = '';

    const modal = document.getElementById('adminPromotionFormModal');
    if (modal) modal.classList.remove('hide-menu');
};

// Ham closePromotionForm: dong logic tuong ung.
window.closePromotionForm = function () {
    const modal = document.getElementById('adminPromotionFormModal');
    if (modal) modal.classList.add('hide-menu');
};

// Ham savePromotion: luu logic tuong ung.
window.savePromotion = function () {
    const mode = document.getElementById('formPromotionSaveMode').value;
    const id = document.getElementById('formPromotionId').value.trim().toUpperCase();
    const code = document.getElementById('formPromotionCode').value.trim().toUpperCase();
    const title = document.getElementById('formPromotionTitle').value.trim();
    const valueLabel = document.getElementById('formPromotionValueLabel').value.trim();
    const condition = document.getElementById('formPromotionCondition').value.trim();
    const uses = parseInt(document.getElementById('formPromotionUses').value, 10);
    const usageLimit = parseInt(document.getElementById('formPromotionLimit').value, 10) || 0;
    const rankValue = Number(document.getElementById('formPromotionRankValue').value);
    const rankUnit = document.getElementById('formPromotionRankUnit').value;
    const status = document.getElementById('formPromotionStatus').value;

    if (!id || !code || !title || !valueLabel || !condition) {
        showToast('Lỗi: Cần điền đủ mã, code, tên, mức ưu đãi và điều kiện áp dụng!');
        return;
    }

    if (Number.isNaN(uses) || uses < 0 || Number.isNaN(rankValue) || rankValue < 0) {
        showToast('Lỗi: Lượt dùng và giá trị ưu đãi phải là số hợp lệ!');
        return;
    }

    const promotions = getPromotionData();

    if (mode === 'add') {
        const duplicatedId = promotions.find(p => p.id === id);
        const duplicatedCode = promotions.find(p => p.code === code);

        if (duplicatedId) {
            showToast('Lỗi: Mã khuyến mãi nội bộ đã tồn tại!');
            return;
        }

        if (duplicatedCode) {
            showToast('Lỗi: Mã áp dụng này đã được sử dụng!');
            return;
        }

        promotions.push({
            id,
            code,
            title,
            valueLabel,
            condition,
            uses,
            usageLimit,
            status,
            rankValue,
            rankUnit
        });

        localStorage.setItem('promotionData', JSON.stringify(promotions));
        showToast('Đã thêm chương trình khuyến mãi mới!');
    }

    closePromotionForm();

    const searchInput = document.getElementById('adminPromotionSearchInput');
    if (searchInput) searchInput.value = '';
    renderAdminPromotions('', id);
};
/* truyền vào promotions (mảng các chương trình khuyến mãi), hàm sẽ tính ra:

có bao nhiêu mã đang áp dụng
có bao nhiêu mã tạm dừng
tổng số lượt dùng
mã có giá trị ưu đãi lớn nhất
có bao nhiêu sản phẩm đang được ghim ở khu nổi bật/banner */
// Ham updatePromotionStats: cap nhat logic tuong ung.
function updatePromotionStats(promotions) {
    const activeCount = promotions.filter(p => p.status === 'Đang áp dụng').length;
    const pausedCount = promotions.filter(p => p.status !== 'Đang áp dụng').length;
    const totalUses = promotions.reduce((sum, p) => sum + (p.uses || 0), 0);
    const bestPromotion = promotions.reduce((best, current) => {
        if (!best || (current.rankValue || 0) > (best.rankValue || 0)) return current;
        return best;
    }, null);
    const bannerCount = typeof getTopSellingIds === 'function' ? getTopSellingIds().length : 0;

    const activeEl = document.getElementById('promotionActiveCount');
    const pausedEl = document.getElementById('promotionPausedCount');
    const usesEl = document.getElementById('promotionUsageCount');
    const bestEl = document.getElementById('promotionBestValue');
    const bannerEl = document.getElementById('promotionTopSellingCount');

    if (activeEl) activeEl.innerText = activeCount;
    if (pausedEl) pausedEl.innerText = pausedCount;
    if (usesEl) usesEl.innerText = totalUses;
    if (bestEl) {
        bestEl.innerText = bestPromotion ? formatPromotionRankValue(bestPromotion.rankValue, bestPromotion.rankUnit) : '0';
    }
    if (bannerEl) bannerEl.innerText = bannerCount;
}

// Ham renderAdminPromotions: Hiển thị danh sách promotion + search + highlight + update dashboard
/*Hiển thị danh sách promotion + search + highlight + update dashboard*/
window.renderAdminPromotions = function (keyword = '', highlightId = '') {
    const promotions = getPromotionData();
    const tbody = document.getElementById('promotionTableBody');
    if (!tbody) return;

    updatePromotionStats(promotions);
    tbody.innerHTML = '';

    const lowerKey = keyword.trim().toLowerCase();
    const filtered = promotions.filter(p =>
        p.id.toLowerCase().includes(lowerKey) ||
        p.code.toLowerCase().includes(lowerKey) ||
        p.title.toLowerCase().includes(lowerKey) ||
        p.condition.toLowerCase().includes(lowerKey) ||
        p.valueLabel.toLowerCase().includes(lowerKey)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px; color: rgb(100, 116, 139);">Không tìm thấy chương trình khuyến mãi phù hợp.</td></tr>';
        return;
    }

    filtered.forEach(promotion => {
        const tr = document.createElement('tr');
        tr.className = promotion.id === highlightId ? 'highlight-row' : 'fade-in-row-anim';
        const isActive = promotion.status === 'Đang áp dụng';

        tr.innerHTML = `
            <td>
                <div class="promotion-code">${promotion.code}</div>
                <div class="promotion-muted">${promotion.id}</div>
            </td>
            <td>
                <div class="promotion-title-cell">${promotion.title}</div>
                <div class="promotion-muted">Ưu tiên hiển thị cho nhóm khách phù hợp</div>
            </td>
            <td style="font-weight: bold; color: rgb(0, 110, 255);">${promotion.valueLabel}</td>
            <td class="promotion-muted">${promotion.condition}</td>
            <td style="font-weight: bold; color: rgb(255, 255, 255);">${promotion.uses} ${promotion.usageLimit > 0 ? '/ ' + promotion.usageLimit : ''}</td>
            <td>
                <span class="promotion-status-pill ${isActive ? 'active' : 'paused'}">${promotion.status}</span>
            </td>
            <td>
                <button class="promotion-action-btn ${isActive ? '' : 'resume-mode'}" onclick="togglePromotionStatus('${promotion.id}')">
                    ${isActive ? 'Tạm dừng' : 'Kích hoạt'}
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// Ham searchAdminPromotions: tim kiem logic tuong ung.
window.searchAdminPromotions = function (keyword) {
    renderAdminPromotions(keyword);
};

// Ham togglePromotionStatus: bat/tat khuyen mai logic tuong ung.
window.togglePromotionStatus = function (id) {
    const promotions = getPromotionData();
    const promotionIndex = promotions.findIndex(p => p.id === id); //tìm vị trí promotion trong mảng
    if (promotionIndex === -1) return; //ko tìm thấy thì dừng tránh bị lỗi 

    const promotion = promotions[promotionIndex]; //lấy promotion hienj tại 
    const nextStatus = promotion.status === 'Đang áp dụng' ? 'Tạm dừng' : 'Đang áp dụng';
    promotions[promotionIndex] = {
        ...promotion,       //update lại các thuộc tính của object cũ , chỉ cập nhật lại status
        status: nextStatus
    };

    localStorage.setItem('promotionData', JSON.stringify(promotions)); //cập nhật vào hệ thống 
    showToast(nextStatus === 'Đang áp dụng' ? 'Đã kích hoạt lại mã khuyến mãi!' : 'Đã tạm dừng mã khuyến mãi!');

    const searchInput = document.getElementById('adminPromotionSearchInput'); //render lại
    renderAdminPromotions(searchInput ? searchInput.value : '');
};
