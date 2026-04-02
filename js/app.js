/**
 * Module: app.js
 * Purpose: Global UI helpers (toast, sidebar, view switch, inbox widget).
 * Main entry points: renderSidebar(), switchMenu(), openInbox(), closeInbox().
 */
function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerText = message;
    container.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add('toast-msg-out');
        window.setTimeout(() => toast.remove(), 260);
    }, 2600);
}

// Core view router: switch visible section and optionally call a renderer.
function switchMenu(element, viewId, renderFuncName) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');

    document.querySelectorAll('[id^="view-"]').forEach(view => {
        view.classList.add('hide-menu');
        view.classList.remove('view-section');
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hide-menu');
        void targetView.offsetWidth;
        targetView.classList.add('view-section');
    }

    if (renderFuncName && typeof window[renderFuncName] === 'function') {
        window[renderFuncName]();
    }
}

// Render sidebar menu by current role, then sync quick counters.
function renderSidebar() {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!currentUser) {
        window.location.href = 'home.html';
        return;
    }

    const nameCharEl = document.querySelector('.user-avatar-char');
    const nameDisplayEl = document.querySelector('.user-display-name');
    const roleLabel = document.querySelector('.user-role-label');
    const adminElements = document.querySelectorAll('.admin-only');
    const customerElements = document.querySelectorAll('.customer-only');

    if (nameCharEl) {
        nameCharEl.innerText = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
    }

    if (nameDisplayEl) {
        nameDisplayEl.innerText = `Xin chao, ${currentUser.name || 'Nguoi dung'}`;
    }

    adminElements.forEach(element => element.classList.add('hide-menu'));
    customerElements.forEach(element => element.classList.add('hide-menu'));

    if (currentUser.role === 'admin') {
        if (roleLabel) roleLabel.innerText = 'Quan tri vien';
        adminElements.forEach(element => element.classList.remove('hide-menu'));

        const statProducts = document.getElementById('admin-total-products');
        const statPending = document.getElementById('admin-pending-orders');
        const statLowStock = document.getElementById('admin-low-stock');
        const statValue = document.getElementById('admin-inventory-value');

        if (statProducts) statProducts.innerText = dbProducts.length;
        if (statPending) {
            const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
            statPending.innerText = pendingOrders.length;
        }
        if (statLowStock) {
            statLowStock.innerText = dbProducts.filter(product => product.stock < 5).length;
        }
        if (statValue) {
            const totalValue = dbProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);
            statValue.innerText = `${totalValue.toLocaleString('vi-VN')}$`;
        }
    } else {
        if (roleLabel) roleLabel.innerText = 'Khach hang';
        customerElements.forEach(element => element.classList.remove('hide-menu'));
    }

    if (typeof hydrateCartFromStorage === 'function') {
        hydrateCartFromStorage();
    }
    if (typeof renderStorePromoStrip === 'function') {
        renderStorePromoStrip();
    }
    if (typeof renderStoreInsights === 'function') {
        renderStoreInsights();
    }
    if (typeof renderOrderHistory === 'function') {
        renderOrderHistory();
    }
}

function updateInboxCounter() {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!currentUser) return;
    const notifications = JSON.parse(localStorage.getItem('notificationData')) || [];
    const myUnread = notifications.filter(n => n.email === currentUser.email && !n.isRead);
    
    const countEl = document.getElementById('inboxNavCount');
    if (countEl) {
        if (myUnread.length > 0) {
            countEl.innerText = myUnread.length > 99 ? '99+' : myUnread.length;
            countEl.classList.remove('hide-menu');
        } else {
            countEl.classList.add('hide-menu');
        }
    }
}

function openInbox() {
    renderInbox();
    const modal = document.getElementById('inboxModal');
    if (modal) modal.classList.remove('hide-menu');
}

function closeInbox() {
    const modal = document.getElementById('inboxModal');
    if (modal) modal.classList.add('hide-menu');
}

// Build inbox items from localStorage and paint unread badges.
function renderInbox() {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!currentUser) return;
    const container = document.getElementById('inboxItemsContainer');
    if (!container) return;

    const notifications = JSON.parse(localStorage.getItem('notificationData')) || [];
    let myNotifs = notifications.filter(n => n.email === currentUser.email);
    
    myNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (myNotifs.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-state">
                <strong>Hòm thư trống</strong>
                <p>Bạn chưa có thông báo nào từ hệ thống.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = myNotifs.map(n => `
        <div style="background: rgb(0, 0, 0); border: 1px solid rgb(212, 175, 55); border-radius: 8px; padding: 15px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s;" onclick="markAsRead('${n.id}')">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong style="color: ${n.isRead ? 'rgb(100, 116, 139)' : 'rgb(0, 110, 255)'}">${n.title} ${n.isRead ? '' : '<span style="color: red; font-size: 11px; margin-left: 5px;">(Mới)</span>'}</strong>
                <small style="color: var(--text-muted);">${new Date(n.createdAt).toLocaleDateString('vi-VN')}</small>
            </div>
            <p style="color: ${n.isRead ? 'var(--text-muted)' : 'var(--text)'}; font-size: 14px; margin-bottom: 10px; line-height: 1.4;">${n.message}</p>
            ${n.voucherCode ? `
            <div style="display: flex; gap: 8px;">
                <input type="text" value="${n.voucherCode}" readonly style="flex: 1; padding: 8px; border: 1px dashed rgb(0, 110, 255); background: rgba(0, 110, 255, 0.05); color: rgb(0, 110, 255); font-weight: bold; border-radius: 4px; text-align: center;">
                <button type="button" class="tactical-btn" style="width: auto; padding: 8px 15px; font-size: 13px;" onclick="event.stopPropagation(); navigator.clipboard.writeText('${n.voucherCode}'); showToast('Đã copy mã: ${n.voucherCode}')">Copy</button>
            </div>
            ` : ''}
        </div>
    `).join('');
    
    updateInboxCounter();
}

function markAsRead(id) {
    let notifications = JSON.parse(localStorage.getItem('notificationData')) || [];
    const idx = notifications.findIndex(n => n.id === id);
    if (idx > -1 && !notifications[idx].isRead) {
        notifications[idx].isRead = true;
        localStorage.setItem('notificationData', JSON.stringify(notifications));
        renderInbox();
    }
}

window.openInbox = openInbox;
window.closeInbox = closeInbox;
window.renderInbox = renderInbox;
window.markAsRead = markAsRead;
window.updateInboxCounter = updateInboxCounter;

function openPersonalInfo() {}
