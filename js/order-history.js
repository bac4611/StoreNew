/**
 * Module: order-history.js
 * Purpose: Customer order history query/render + reorder action.
 * Main entry points: renderOrderHistory(), reorderFromHistory(), openStoreCatalogFromHistory().
 */
// Muc dich:
// Lay danh sach don hang cua nguoi dung dang dang nhap (chi ap dung cho role customer).
// Ham loc theo email/ten khach hang, sau do sap xep don moi nhat len truoc de hien thi lich su.
function getCurrentUserOrders() {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!currentUser || currentUser.role !== 'customer') return [];

    const orders = typeof getTransactionData === 'function'
        ? getTransactionData()
        : (JSON.parse(localStorage.getItem('transactionData')) || []);

    return orders
        .filter(order => {
            const sameEmail = currentUser.email && order.customerEmail === currentUser.email;
            const sameName = order.customerName === currentUser.name;
            return sameEmail || sameName;
        })
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

// Muc dich:
// Chuan hoa cach hien thi thoi gian tao don hang.
// Neu he thong da co helper formatDateTime thi uu tien dung lai; neu khong thi fallback ve toLocaleString.
function formatOrderDate(value) {
    if (typeof formatDateTime === 'function') {
        return formatDateTime(value);
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Chưa rõ thời gian' : date.toLocaleString('vi-VN');
}

// Muc dich:
// Tao chuoi tom tat cac san pham trong mot don hang theo dang "Ten xSoLuong".
// Ket qua duoc dung de hien thi nhanh noi dung don tren card lich su.
function buildOrderItemSummary(order) {
    return (order.items || [])
        .map(item => `${item.name} x${item.quantity}`)
        .join(', ');
}

// Muc dich:
// Tao HTML cho 1 card lich su don hang, gom: ma don, thoi gian, trang thai, danh sach mon, tong tien va ghi chu.
// Card cung gan nut "Mua lai san pham" de goi ham dat lai tu don cu.
function buildOrderHistoryCard(order) {
    const isPending = order.status === 'Chờ duyệt';

    return `
        <article class="order-history-card">
            <div class="order-history-topline">
                <div>
                    <small>${order.id}</small>
                    <strong style="color: rgb(15, 23, 42);">${formatOrderDate(order.createdAt)}</strong>
                </div>
                <span class="order-status-pill ${isPending ? 'pending' : 'done'}">${order.status}</span>
            </div>
            <p class="order-history-items" style="color: rgb(71, 85, 105);">${buildOrderItemSummary(order)}</p>
            <div class="order-history-bottomline">
                <div>
                    <span class="order-history-total">${typeof formatMoney === 'function' ? formatMoney(order.total) : `${order.total}$`}</span>
                    <span class="order-history-note" style="color: rgb(100, 116, 139);">${order.note || 'Đơn hàng được lưu từ giỏ hàng.'}</span>
                </div>
                <button class="tactical-btn tactical-btn-secondary compact" onclick="reorderFromHistory('${order.id}')">Mua lại sản phẩm</button>
            </div>
        </article>
    `;
}

// Muc dich:
// Dieu huong nguoi dung tu khu vuc lich su don hang ve lai trang danh muc mua sam.
// Ham vua chuyen view "Home", vua cuon den section catalog de nguoi dung bat dau mua ngay.
window.openStoreCatalogFromHistory = function() {
    const homeNav = document.querySelector('.customer-only .nav-item');
    if (homeNav) {
        switchMenu(homeNav, 'view-home');
    }

    if (typeof scrollStoreSection === 'function') {
        scrollStoreSection('storeProductCatalog');
    }
};

// Muc dich:
// Ho tro mua lai: lay don cu theo orderId va thu them tung san pham vao gio hang hien tai.
// Ham dem so mon them thanh cong/that bai, cap nhat lai gio hang + thong ke cua cua hang va hien toast ket qua.
window.reorderFromHistory = function(orderId) {
    const orders = getCurrentUserOrders();
    const order = orders.find(item => item.id === orderId);
    if (!order) return;

    let addedCount = 0;
    let skippedCount = 0;

    (order.items || []).forEach(item => {
        const success = typeof addProductToCart === 'function'
            ? addProductToCart(item.productId, item.quantity)
            : false;

        if (success) {
            addedCount += item.quantity;
        } else {
            skippedCount += item.quantity;
        }
    });

    if (typeof renderCart === 'function') {
        renderCart();
    }

    if (typeof renderStoreInsights === 'function') {
        renderStoreInsights();
    }

    if (addedCount > 0) {
        showToast(`Đã đưa ${addedCount} món từ đơn cũ vào giỏ hàng.`);
        return;
    }

    showToast(skippedCount > 0 ? 'Không thể mua lại vì một số sản phẩm đã hết hàng hoặc đã bị gỡ.' : 'Không tìm thấy món hàng để mua lại.');
};

// Muc dich:
// Render toan bo khu vuc lich su don hang cua khach hang:
// - Tinh va cap nhat cac chi so tong quan (tong don, da hoan tat, cho duyet, tong chi tieu).
// - Hien empty state neu chua co don.
// - Hien danh sach card don hang neu du lieu ton tai.
window.renderOrderHistory = function() {
    const summaryTotalEl = document.getElementById('orderHistoryTotalCount');
    const summaryDoneEl = document.getElementById('orderHistoryDoneCount');
    const summaryPendingEl = document.getElementById('orderHistoryPendingCount');
    const summarySpentEl = document.getElementById('orderHistorySpentValue');
    const listEl = document.getElementById('orderHistoryList');

    if (!listEl) return;

    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!currentUser || currentUser.role !== 'customer') {
        listEl.innerHTML = '';
        return;
    }

    const orders = getCurrentUserOrders();
    const completedOrders = orders.filter(order => order.status === 'Hoàn tất');
    const pendingOrders = orders.filter(order => order.status === 'Chờ duyệt');
    const totalSpent = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    if (summaryTotalEl) summaryTotalEl.innerText = orders.length;
    if (summaryDoneEl) summaryDoneEl.innerText = completedOrders.length;
    if (summaryPendingEl) summaryPendingEl.innerText = pendingOrders.length;
    if (summarySpentEl) summarySpentEl.innerText = typeof formatMoney === 'function' ? formatMoney(totalSpent) : `${totalSpent}$`;

    if (orders.length === 0) {
        listEl.innerHTML = `
            <div class="shop-empty-state order-empty-state">
                <strong style="color: rgb(15, 23, 42);">Bạn chưa có đơn hàng nào</strong>
                <p class="shop-empty-copy" style="color: rgb(71, 85, 105);">Lịch sử sẽ tự động lưu lại sau mỗi lần gửi yêu cầu mua hàng từ hệ thống.</p>
                <div class="shop-empty-actions">
                    <button class="tactical-btn shop-primary-btn compact" onclick="openStoreCatalogFromHistory()">Bắt đầu mua sắm</button>
                </div>
            </div>
        `;
        return;
    }

    listEl.innerHTML = orders.map(buildOrderHistoryCard).join('');
};
