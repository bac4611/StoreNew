/**
 * Module: admin-reports.js
 * Purpose: Transaction lifecycle + revenue analytics data pipeline and charts.
 * Main entry points: renderAdminTransactionsReport(), approveTransaction(), renderAdminRevenueReport().
 */
const productCategoryLabels = {
    sungngan: 'Súng ngắn',
    shotgun: 'Shotgun',
    sungtruong: 'Súng trường',
    smg: 'Súng tiểu liên',
    danduoc: 'Đạn dược',
    phongve: 'Đồ tự vệ',
    phukien: 'Phụ kiện'
};

Object.assign(productCategoryLabels, {
    nhan: 'Nhan',
    daychuyen: 'Day chuyen',
    lactay: 'Lac tay',
    bongtai: 'Bong tai',
    matday: 'Mat day',
    trangsucnam: 'Trang suc nam',
    trangsuccuoi: 'Trang suc cuoi',
    phukien: 'Phu kien'
});

const reportChartPalette = [
    ['rgb(0, 0, 0)', 'rgb(145, 150, 51)'],
    ['rgb(34, 197, 94)', 'rgb(16, 185, 129)'],
    ['rgb(245, 158, 11)', 'rgb(249, 115, 22)'],
    ['rgb(239, 68, 68)', 'rgb(244, 114, 182)'],
    ['rgb(139, 92, 246)', 'rgb(99, 102, 241)'],
    ['rgb(20, 184, 166)', 'rgb(45, 212, 191)']
];

let currentRevenueRange = '90d';
const mockTransactionSeedVersion = 'dngear-transaction-seed-v1';

// Ham createOrderItem: tao logic tuong ung.
function createOrderItem(productId, quantity) {
    const product = dbProducts.find(item => item.id === productId);
    if (!product) return null;

    return {
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: quantity
    };
}

// Ham calculateOrderTotal: tinh toan logic tuong ung.
function calculateOrderTotal(items) {
    return items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
}

// Ham buildSeedOrder: tao logic tuong ung.
function buildSeedOrder(order) {
    const items = (order.items || []).map(item => createOrderItem(item.productId, item.quantity)).filter(Boolean);
    if (items.length === 0) return null;

    return {
        ...order,
        items,
        total: calculateOrderTotal(items)
    };
}

// Ham buildMockTransactions: tao logic tuong ung.
function buildMockTransactions() {
    return [
        {
            id: 'HD250418',
            customerName: 'Nguyễn Hoàng Nam',
            customerEmail: 'nam@tacticalmail.vn',
            createdAt: '2025-04-18T10:20:00',
            status: 'Hoàn tất',
            paymentStatus: 'Đã thanh toán',
            note: 'Đơn carbine đầu mùa, đã giao cùng combo optic và gel ball.',
            items: [
                { productId: 'RFL2', quantity: 1 },
                { productId: 'ACC3', quantity: 1 },
                { productId: 'AMO1', quantity: 4 }
            ]
        },
        {
            id: 'HD250603',
            customerName: 'Trần Minh Khôi',
            customerEmail: 'khoi.blaster@gmail.com',
            createdAt: '2025-06-03T15:05:00',
            status: 'Hoàn tất',
            paymentStatus: 'Đã thanh toán',
            note: 'Khách mua shotgun để chơi nhóm, chốt thêm shell dự phòng.',
            items: [
                { productId: 'SHT1', quantity: 1 },
                { productId: 'AMO3', quantity: 2 },
                { productId: 'DEF1', quantity: 1 }
            ]
        },
        {
            id: 'HD250720',
            customerName: 'Lê Quốc Bảo',
            customerEmail: 'bao.qb@storemail.vn',
            createdAt: '2025-07-20T20:10:00',
            status: 'Hoàn tất',
            paymentStatus: 'Đã thanh toán',
            note: 'Khách đặt online sau khi xem livestream review SMG.',
            items: [
                { productId: 'SMG1', quantity: 1 },
                { productId: 'ACC2', quantity: 1 },
                { productId: 'AMO1', quantity: 6 }
            ]
        },
        {
            id: 'HD250902',
            customerName: 'Võ Thu Hà',
            customerEmail: 'ha.vo@buyer.vn',
            createdAt: '2025-09-02T08:50:00',
            status: 'Hoàn tất',
            paymentStatus: 'Đã thanh toán',
            note: 'Đơn súng lazer và stock độ để chụp ảnh sản phẩm.',
            items: [
                { productId: 'PST2', quantity: 1 },
                { productId: 'ACC4', quantity: 1 }
            ]
        },
        {
            id: 'HD251011',
            customerName: 'Phạm Nhật Long',
            customerEmail: 'long.modder@gmail.com',
            createdAt: '2025-10-11T13:35:00',
            status: 'Hoàn tất',
            paymentStatus: 'Đã thanh toán',
            note: 'Combo AK chơi gel và pin dự phòng cho nhóm đi field.',
            items: [
                { productId: 'RFL4', quantity: 1 },
                { productId: 'ACC2', quantity: 1 },
                { productId: 'ACC3', quantity: 1 },
                { productId: 'AMO1', quantity: 5 }
            ]
        },
        {
            id: 'HD251219',
            customerName: 'Đỗ Minh Quân',
            customerEmail: 'quan.foam@gmail.com',
            createdAt: '2025-12-19T18:40:00',
            status: 'Hoàn tất',
            paymentStatus: 'Đã thanh toán',
            note: 'Khách chốt SCAR-L xốp và lấy thêm đạn bắn team building.',
            items: [
                { productId: 'RFL3', quantity: 1 },
                { productId: 'AMO2', quantity: 6 },
                { productId: 'ACC1', quantity: 1 }
            ]
        },
        {
            id: 'HD260108',
            customerName: 'Nguyễn Gia Linh',
            customerEmail: 'linh.nguyen@order.vn',
            createdAt: '2026-01-08T09:55:00',
            status: 'Hoàn tất',
            paymentStatus: 'Đã thanh toán',
            note: 'Đã xác nhận giao kính bảo hộ theo số lượng câu lạc bộ.',
            items: [
                { productId: 'SMG3', quantity: 1 },
                { productId: 'DEF1', quantity: 2 }
            ]
        },
        {
            id: 'HD260214',
            customerName: 'Trần Anh Dũng',
            customerEmail: 'dung.field@buyer.vn',
            createdAt: '2026-02-14T16:20:00',
            status: 'Hoàn tất',
            paymentStatus: 'Đã thanh toán',
            note: 'Khách cũ mua thêm shotgun foam và shell để nâng trải nghiệm.',
            items: [
                { productId: 'SHT2', quantity: 1 },
                { productId: 'AMO3', quantity: 3 },
                { productId: 'ACC2', quantity: 1 }
            ]
        },
        {
            id: 'HD260305',
            customerName: 'Khách VIP 1',
            customerEmail: '',
            createdAt: '2026-03-05T19:30:00',
            status: 'Chờ duyệt',
            paymentStatus: 'Chờ xác nhận',
            note: 'Khách cần admin gọi lại để xác thực deal súng ngắn và ammo.',
            items: [
                { productId: 'PST1', quantity: 1 },
                { productId: 'AMO2', quantity: 4 }
            ]
        },
        {
            id: 'HD260310',
            customerName: 'Phan Khánh Vân',
            customerEmail: 'vankhanh@shopmail.vn',
            createdAt: '2026-03-10T11:45:00',
            status: 'Hoàn tất',
            paymentStatus: 'Đã thanh toán',
            note: 'Đơn hàng nổi bật trong tuần, giao cùng phụ kiện gắn rail.',
            items: [
                { productId: 'RFL1', quantity: 1 },
                { productId: 'ACC1', quantity: 1 },
                { productId: 'AMO1', quantity: 5 }
            ]
        },
        {
            id: 'HD260311',
            customerName: 'Võ Thanh Vy',
            customerEmail: 'vy.vo@community.vn',
            createdAt: '2026-03-11T08:20:00',
            status: 'Chờ duyệt',
            paymentStatus: 'Chờ xác nhận',
            note: 'Đơn mua phụ kiện và đồ phòng vệ, chờ xác nhận màu sắc thực tế.',
            items: [
                { productId: 'ACC3', quantity: 1 },
                { productId: 'DEF2', quantity: 1 }
            ]
        }
    ].map(buildSeedOrder).filter(Boolean);
}

// Ham normalizeStoredOrderItem: chuan hoa logic tuong ung.
function normalizeStoredOrderItem(item) {
    if (!item) return null;

    const quantity = Number(item.quantity || 0);
    if (quantity <= 0) return null;

    const product = dbProducts.find(candidate => candidate.id === item.productId)
        || dbProducts.find(candidate => candidate.name === item.name);

    if (!product) {
        const fallbackPrice = Number(item.price || 0);
        return {
            productId: item.productId || `ARCHIVED-${Date.now()}`,
            name: item.name || 'San pham da go khoi catalog',
            category: item.category || 'Khac',
            price: Number.isFinite(fallbackPrice) ? fallbackPrice : 0,
            quantity
        };
    }

    return {
        productId: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.price || item.price || 0),
        quantity
    };
}

// Normalize order payloads so data from old versions does not break reports.
// Ham normalizeStoredOrder: chuan hoa logic tuong ung.
function normalizeStoredOrder(order) {
    if (!order) return null;

    const normalizedItems = (order.items || []).map(normalizeStoredOrderItem).filter(Boolean);
    if (normalizedItems.length === 0) return null;

    return {
        id: order.id || `HD${Date.now()}`,
        customerName: order.customerName || 'Khách lẻ',
        customerEmail: order.customerEmail || '',
        createdAt: order.createdAt || new Date().toISOString(),
        status: order.status || 'Chờ duyệt',
        paymentStatus: order.paymentStatus || 'Chờ xác nhận',
        note: order.note || '',
        items: normalizedItems,
        total: calculateOrderTotal(normalizedItems)
    };
}

// Ham normalizeTransactionCollection: chuan hoa logic tuong ung.
function normalizeTransactionCollection(orders) {
    return (Array.isArray(orders) ? orders : [])
        .map(normalizeStoredOrder)
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Ham initMockReports: khoi tao logic tuong ung.
function initMockReports() {
    let transactions = normalizeTransactionCollection(JSON.parse(localStorage.getItem('transactionData')) || []);
    const seedOrders = buildMockTransactions();
    const hasSeededCurrentVersion = localStorage.getItem('transactionSeedVersion') === mockTransactionSeedVersion;

    if (!hasSeededCurrentVersion || transactions.length === 0) {
        const existingOrderIds = new Set(transactions.map(order => order.id));
        seedOrders.forEach(order => {
            if (!existingOrderIds.has(order.id)) {
                transactions.push(order);
            }
        });

        transactions = normalizeTransactionCollection(transactions);
        localStorage.setItem('transactionSeedVersion', mockTransactionSeedVersion);
    }

    saveTransactionData(transactions);
}
initMockReports();

// Ham getTransactionData: lay logic tuong ung.
function getTransactionData() {
    return normalizeTransactionCollection(JSON.parse(localStorage.getItem('transactionData')) || []);
}

// Ham syncPendingOrders: dong bo logic tuong ung.
function syncPendingOrders(orders) {
    const pendingOrders = orders.filter(order => order.status === 'Chờ duyệt');
    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
}

// Ham saveTransactionData: luu logic tuong ung.
function saveTransactionData(orders) {
    const normalizedOrders = normalizeTransactionCollection(orders);
    localStorage.setItem('transactionData', JSON.stringify(normalizedOrders));
    syncPendingOrders(normalizedOrders);

    if (typeof renderSidebar === 'function') {
        renderSidebar();
    }
    if (typeof renderOrderHistory === 'function') {
        renderOrderHistory();
    }
    if (typeof renderStoreInsights === 'function') {
        renderStoreInsights();
    }
}

// Utility formatters shared across transaction list + revenue charts.
// Ham formatMoney: dinh dang logic tuong ung.
function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')}$`;
}

// Ham formatDateTime: dinh dang logic tuong ung.
function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Chưa rõ thời gian';
    return date.toLocaleString('vi-VN');
}

// Ham countOrderUnits: dem logic tuong ung.
function countOrderUnits(order) {
    return (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
}

// Ham collectOrderKeywords: thu thap logic tuong ung.
function collectOrderKeywords(order) {
    const itemNames = (order.items || []).map(item => item.name).join(' ');
    return [
        order.id,
        order.customerName,
        order.customerEmail,
        order.status,
        order.paymentStatus,
        order.note,
        itemNames
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

// Ham increaseCustomerSpent: tang logic tuong ung.
function increaseCustomerSpent(order) {
    if (!order || order.status !== 'Hoàn tất') return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user =>
        (order.customerEmail && user.email === order.customerEmail)
        || (!order.customerEmail && user.name === order.customerName)
    );

    if (userIndex === -1) return;

    users[userIndex] = {
        ...users[userIndex],
        spent: Number(users[userIndex].spent || 0) + Number(order.total || 0)
    };

    localStorage.setItem('users', JSON.stringify(users));

    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (currentUser && ((order.customerEmail && currentUser.email === order.customerEmail) || currentUser.name === order.customerName)) {
        const nextCurrentUser = {
            ...currentUser,
            spent: users[userIndex].spent
        };
        if (typeof saveCurrentUser === 'function') {
            saveCurrentUser(nextCurrentUser);
        } else {
            localStorage.setItem('currentUser', JSON.stringify(nextCurrentUser));
        }
    }
}

// Ham reserveInventoryForOrder: danh truoc logic tuong ung.
function reserveInventoryForOrder(order) {
    const missingItems = [];

    (order.items || []).forEach(item => {
        const product = dbProducts.find(candidate => candidate.id === item.productId);
        if (!product) {
            missingItems.push(item.name || item.productId || 'San pham khong ro');
            return;
        }

        if (product.stock < item.quantity) {
            missingItems.push(`${product.name} (chi con ${product.stock})`);
        }
    });

    if (missingItems.length > 0) {
        return {
            ok: false,
            message: `Khong du ton kho de duyet don: ${missingItems.join(', ')}`
        };
    }

    (order.items || []).forEach(item => {
        const product = dbProducts.find(candidate => candidate.id === item.productId);
        if (product) {
            product.stock = Math.max(0, product.stock - item.quantity);
        }
    });

    if (typeof persistProducts === 'function') {
        persistProducts();
    }

    return { ok: true };
}

// Ham getCompletedTransactions: lay logic tuong ung.
function getCompletedTransactions() {
    return getTransactionData().filter(order => order.status === 'Hoàn tất');
}

// Ham getRevenueRangeLabel: lay logic tuong ung.
function getRevenueRangeLabel(range) {
    const map = {
        '7d': '7 ngày gần nhất',
        '30d': '30 ngày gần nhất',
        '90d': '90 ngày gần nhất',
        '12m': '12 tháng gần nhất',
        all: 'toàn bộ dữ liệu'
    };

    return map[range] || map['90d'];
}

// Ham getRevenueRangeTrendTitle: lay logic tuong ung.
function getRevenueRangeTrendTitle(range) {
    if (range === '7d' || range === '30d') return 'Biểu đồ doanh thu theo ngày';
    return 'Biểu đồ doanh thu theo tháng';
}

// Ham filterOrdersByRevenueRange: xu ly logic tuong ung.
function filterOrdersByRevenueRange(orders, range) {
    if (range === 'all') return orders;

    const now = new Date();
    let startDate = new Date(now);

    if (range === '7d') {
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 6);
    } else if (range === '30d') {
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 29);
    } else if (range === '90d') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (range === '12m') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    }

    return orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return !Number.isNaN(orderDate.getTime()) && orderDate >= startDate && orderDate <= now;
    });
}

// Ham buildCategoryRevenue: tao logic tuong ung.
function buildCategoryRevenue(orders) {
    const totals = {};

    orders.forEach(order => {
        (order.items || []).forEach(item => {
            const label = productCategoryLabels[item.category] || 'Khác';
            totals[label] = (totals[label] || 0) + ((item.price || 0) * (item.quantity || 0));
        });
    });

    return Object.entries(totals)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
}

// Ham buildCustomerRevenue: tao logic tuong ung.
function buildCustomerRevenue(orders) {
    const totals = {};

    orders.forEach(order => {
        const key = order.customerEmail || order.customerName || 'Khách lẻ';
        if (!totals[key]) {
            totals[key] = {
                name: order.customerName || 'Khách lẻ',
                email: order.customerEmail || 'Chưa cập nhật',
                value: 0,
                orders: 0
            };
        }

        totals[key].value += order.total || 0;
        totals[key].orders += 1;
    });

    return Object.values(totals).sort((a, b) => b.value - a.value);
}

// Ham buildMonthlyRevenue: tao logic tuong ung.
function buildMonthlyRevenue(orders, monthCount = null) {
    const totals = {};

    orders.forEach(order => {
        const date = new Date(order.createdAt);
        if (Number.isNaN(date.getTime())) return;

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        totals[monthKey] = (totals[monthKey] || 0) + (order.total || 0);
    });

    if (monthCount) {
        const now = new Date();
        const months = [];

        for (let i = monthCount - 1; i >= 0; i -= 1) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.push({
                label: `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`,
                value: totals[key] || 0
            });
        }

        return months;
    }

    return Object.entries(totals)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => {
            const [year, month] = key.split('-');
            return {
                label: `${month}/${year}`,
                value
            };
        });
}

// Ham buildDailyRevenue: tao logic tuong ung.
function buildDailyRevenue(orders, dayCount) {
    const totals = {};

    orders.forEach(order => {
        const date = new Date(order.createdAt);
        if (Number.isNaN(date.getTime())) return;

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        totals[key] = (totals[key] || 0) + (order.total || 0);
    });

    const now = new Date();
    const points = [];

    for (let i = dayCount - 1; i >= 0; i -= 1) {
        const date = new Date(now);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - i);

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        points.push({
            label: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
            value: totals[key] || 0
        });
    }

    return points;
}

// Ham buildRevenueTrendData: tao logic tuong ung.
function buildRevenueTrendData(orders, range) {
    if (range === '7d') return buildDailyRevenue(orders, 7);
    if (range === '30d') return buildDailyRevenue(orders, 30);
    if (range === '90d') return buildMonthlyRevenue(orders, 3);
    if (range === '12m') return buildMonthlyRevenue(orders, 12);
    return buildMonthlyRevenue(orders);
}

// Ham getChartGradient: lay logic tuong ung.
function getChartGradient(index) {
    return reportChartPalette[index % reportChartPalette.length];
}

// Ham renderBarList: hien thi logic tuong ung.
function renderBarList(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = '<div class="report-empty">Chưa có dữ liệu để thống kê.</div>';
        return;
    }

    const maxValue = Math.max(...items.map(item => item.value), 1);
    container.innerHTML = items
        .map(item => `
            <div class="report-bar-item">
                <div class="report-bar-label">${item.label}</div>
                <div class="report-bar-track">
                    <div class="report-bar-fill" style="width: ${(item.value / maxValue) * 100}%;"></div>
                </div>
                <div class="report-bar-value">${formatMoney(item.value)}</div>
            </div>
        `)
        .join('');
}

// Ham renderCustomerList: hien thi logic tuong ung.
function renderCustomerList(containerId, customers) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (customers.length === 0) {
        container.innerHTML = '<div class="report-empty">Chưa có khách hàng phát sinh giao dịch.</div>';
        return;
    }

    container.innerHTML = customers
        .slice(0, 5)
        .map(customer => `
            <div class="report-rank-item">
                <div>
                    <strong>${customer.name}</strong>
                    <span>${customer.email} · ${customer.orders} đơn</span>
                </div>
                <div class="report-rank-value">${formatMoney(customer.value)}</div>
            </div>
        `)
        .join('');
}

// Ham renderRevenueTrendChart: hien thi logic tuong ung.
function renderRevenueTrendChart(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items.length === 0 || items.every(item => item.value === 0)) {
        container.innerHTML = '<div class="revenue-chart-empty">Chưa có giao dịch hoàn tất để vẽ biểu đồ doanh thu.</div>';
        return;
    }

    const maxValue = Math.max(...items.map(item => item.value), 1);
    container.innerHTML = `
        <div class="revenue-trend-grid" style="--point-count: ${items.length};">
            ${items.map((item, index) => {
                const height = Math.max((item.value / maxValue) * 100, 10);
                const [startColor, endColor] = getChartGradient(index);

                return `
                    <div class="revenue-trend-col">
                        <div class="revenue-trend-value">${formatMoney(item.value)}</div>
                        <div class="revenue-trend-bar-area">
                            <div class="revenue-trend-bar" style="height: ${height}%; background: linear-gradient(180deg, ${startColor}, ${endColor});"></div>
                        </div>
                        <div class="revenue-trend-label">${item.label}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Ham renderRevenueCategoryChart: hien thi logic tuong ung.
function renderRevenueCategoryChart(containerId, items, totalRevenue) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = '<div class="revenue-chart-empty">Chưa có dữ liệu danh mục để hiển thị biểu đồ tròn.</div>';
        return;
    }

    const visibleItems = items.slice(0, 4);
    if (items.length > 4) {
        const otherValue = items.slice(4).reduce((sum, item) => sum + item.value, 0);
        visibleItems.push({
            label: 'Nhóm khác',
            value: otherValue
        });
    }

    const totalVisible = visibleItems.reduce((sum, item) => sum + item.value, 0) || 1;
    let currentStop = 0;
    const gradientSegments = visibleItems.map((item, index) => {
        const [startColor] = getChartGradient(index);
        const slice = (item.value / totalVisible) * 100;
        const from = currentStop;
        currentStop += slice;
        return `${startColor} ${from}% ${currentStop}%`;
    }).join(', ');

    container.innerHTML = `
        <div class="revenue-category-wrap">
            <div class="revenue-donut-visual" style="background: conic-gradient(${gradientSegments});">
                <div class="revenue-donut-core">
                    <span>Tổng doanh thu</span>
                    <strong>${formatMoney(totalRevenue)}</strong>
                </div>
            </div>
            <div class="revenue-donut-legend">
                ${visibleItems.map((item, index) => {
                    const [startColor] = getChartGradient(index);
                    const percent = Math.round((item.value / totalVisible) * 100);
                    return `
                        <div class="revenue-donut-legend-item">
                            <div class="revenue-donut-swatch" style="background: ${startColor};"></div>
                            <div>
                                <div class="revenue-donut-name">${item.label}</div>
                                <div class="revenue-donut-meta">Chiếm ${percent}% tổng doanh thu</div>
                            </div>
                            <div class="revenue-donut-value">${formatMoney(item.value)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Ham renderRevenueCustomerChart: hien thi logic tuong ung.
function renderRevenueCustomerChart(containerId, customers) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (customers.length === 0) {
        container.innerHTML = '<div class="revenue-chart-empty">Chưa có khách hàng phát sinh đơn hoàn tất để dựng biểu đồ.</div>';
        return;
    }

    const visibleCustomers = customers.slice(0, 5);
    const maxValue = Math.max(...visibleCustomers.map(customer => customer.value), 1);

    container.innerHTML = visibleCustomers.map((customer, index) => {
        const width = Math.max((customer.value / maxValue) * 100, 8);
        const [startColor, endColor] = getChartGradient(index);

        return `
            <div class="revenue-customer-item">
                <div class="revenue-customer-copy">
                    <strong>${customer.name}</strong>
                    <span>${customer.orders} đơn hoàn tất</span>
                </div>
                <div class="revenue-customer-track">
                    <div class="revenue-customer-fill" style="width: ${width}%; background: linear-gradient(90deg, ${startColor}, ${endColor});"></div>
                </div>
                <div class="revenue-customer-value">${formatMoney(customer.value)}</div>
            </div>
        `;
    }).join('');
}

// Ham changeRevenueRange: thay doi logic tuong ung.
window.changeRevenueRange = function(range) {
    currentRevenueRange = range;
    renderAdminRevenueReport();
};

// Admin transaction table renderer (approval workflow starts here).
// Ham renderAdminTransactionsReport: hien thi logic tuong ung.
window.renderAdminTransactionsReport = function(keyword = '') {
    const orders = getTransactionData();
    const tbody = document.getElementById('transactionTableBody');
    if (!tbody) return;

    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'Hoàn tất').length;
    const pendingOrders = orders.filter(order => order.status === 'Chờ duyệt').length;
    const totalRevenue = orders
        .filter(order => order.status === 'Hoàn tất')
        .reduce((sum, order) => sum + (order.total || 0), 0);

    const totalEl = document.getElementById('reportTransactionCount');
    const completedEl = document.getElementById('reportCompletedCount');
    const pendingEl = document.getElementById('reportPendingCount');
    const revenueEl = document.getElementById('reportTransactionRevenue');

    if (totalEl) totalEl.innerText = totalOrders;
    if (completedEl) completedEl.innerText = completedOrders;
    if (pendingEl) pendingEl.innerText = pendingOrders;
    if (revenueEl) revenueEl.innerText = formatMoney(totalRevenue);

    const lowerKey = keyword.trim().toLowerCase();
    const filtered = orders.filter(order => collectOrderKeywords(order).includes(lowerKey));

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px; color: rgb(100, 116, 139);">Không tìm thấy hoá đơn phù hợp.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    filtered
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach(order => {
            const tr = document.createElement('tr');
            tr.className = 'fade-in-row-anim';
            const isPending = order.status === 'Chờ duyệt';

            tr.innerHTML = `
                <td>
                    <div class="report-order-id">${order.id}</div>
                    <div class="report-muted-text">${order.paymentStatus || 'Chưa cập nhật'}</div>
                </td>
                <td>
                    <div style="font-weight: 700; color: var(--text-dark);">${order.customerName || 'Khách lẻ'}</div>
                    <div class="report-muted-text">${order.customerEmail || 'Chưa cập nhật email'}</div>
                </td>
                <td class="report-muted-text">${formatDateTime(order.createdAt)}</td>
                <td>
                    <div style="font-weight: 700; color: var(--text-dark);">${countOrderUnits(order)} món</div>
                    <div class="report-muted-text">${(order.items || []).map(item => item.name).join(', ')}</div>
                </td>
                <td style="font-weight: 700; color: rgb(34, 197, 94);">${formatMoney(order.total)}</td>
                <td>
                    <span class="report-status-pill ${isPending ? 'pending' : 'done'}">${order.status}</span>
                </td>
                <td>
                    ${isPending
                        ? `<button class="report-action-btn" onclick="approveTransaction('${order.id}')">Duyệt đơn</button>`
                        : '<button class="report-action-btn secondary" type="button" disabled>Đã xử lý</button>'}
                </td>
            `;
            tbody.appendChild(tr);
        });
};

// Ham searchAdminTransactions: tim kiem logic tuong ung.
window.searchAdminTransactions = function(keyword) {
    renderAdminTransactionsReport(keyword);
};

// Ham approveTransaction: phe duyet logic tuong ung.
window.approveTransaction = function(orderId) {
    const orders = getTransactionData();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return;

    const inventoryResult = reserveInventoryForOrder(orders[orderIndex]);
    if (!inventoryResult.ok) {
        showToast(inventoryResult.message);
        return;
    }

    orders[orderIndex] = {
        ...orders[orderIndex],
        status: 'Hoàn tất',
        paymentStatus: 'Đã thanh toán',
        note: 'Đã được admin xác nhận và chuyển sang hoàn tất.'
    };

    increaseCustomerSpent(orders[orderIndex]);

    saveTransactionData(orders);
    showToast('Đã duyệt hoá đơn thành công!');

    const searchInput = document.getElementById('adminTransactionSearchInput');
    renderAdminTransactionsReport(searchInput ? searchInput.value : '');
    renderAdminRevenueReport();
    if (typeof renderAdminProductTable === 'function') {
        const productSearchInput = document.getElementById('adminSearchInput');
        renderAdminProductTable(productSearchInput ? productSearchInput.value : '');
    }
};

// Admin revenue dashboard renderer (KPIs + charts).
// Ham renderAdminRevenueReport: hien thi logic tuong ung.
window.renderAdminRevenueReport = function() {
    const completedOrders = getCompletedTransactions();
    const filteredOrders = filterOrdersByRevenueRange(completedOrders, currentRevenueRange);
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const filteredRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalUnits = filteredOrders.reduce((sum, order) => sum + countOrderUnits(order), 0);
    const averageOrderValue = filteredOrders.length ? Math.round(filteredRevenue / filteredOrders.length) : 0;
    const trendRevenue = buildRevenueTrendData(filteredOrders, currentRevenueRange);
    const categoryRevenue = buildCategoryRevenue(filteredOrders);
    const customerRevenue = buildCustomerRevenue(filteredOrders);
    const rangeLabel = getRevenueRangeLabel(currentRevenueRange);

    const totalValueEl = document.getElementById('revenueTotalValue');
    const currentMonthEl = document.getElementById('revenueCurrentMonthValue');
    const averageEl = document.getElementById('revenueAverageOrderValue');
    const unitsEl = document.getElementById('revenueUnitsSold');
    const rangeNoteEl = document.getElementById('revenueRangeNote');
    const rangeSummaryTextEl = document.getElementById('revenueRangeSummaryText');
    const trendTitleEl = document.getElementById('revenueTrendTitle');
    const trendCaptionEl = document.getElementById('revenueTrendCaption');
    const rangeSelectEl = document.getElementById('revenueRangeSelect');

    if (totalValueEl) totalValueEl.innerText = formatMoney(totalRevenue);
    if (currentMonthEl) currentMonthEl.innerText = formatMoney(filteredRevenue);
    if (averageEl) averageEl.innerText = formatMoney(averageOrderValue);
    if (unitsEl) unitsEl.innerText = totalUnits;
    if (rangeNoteEl) rangeNoteEl.innerText = `Đang xem: ${rangeLabel} · ${filteredOrders.length} giao dịch hoàn tất`;
    if (rangeSummaryTextEl) rangeSummaryTextEl.innerText = `Doanh thu trong ${rangeLabel}`;
    if (trendTitleEl) trendTitleEl.innerText = getRevenueRangeTrendTitle(currentRevenueRange);
    if (trendCaptionEl) trendCaptionEl.innerText = `Dữ liệu hiển thị theo ${rangeLabel}`;
    if (rangeSelectEl && rangeSelectEl.value !== currentRevenueRange) rangeSelectEl.value = currentRevenueRange;

    renderRevenueTrendChart('revenueTrendChart', trendRevenue);
    renderRevenueCategoryChart('revenueCategoryChart', categoryRevenue, filteredRevenue);
    renderRevenueCustomerChart('revenueCustomerChart', customerRevenue);
};

// Checkout bridge called by cart.js to append pending order into report storage.
// Ham recordCheckoutOrder: ghi nhan logic tuong ung.
window.recordCheckoutOrder = function(cartItems) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return null;

    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const orders = getTransactionData();
    const timestamp = Date.now();
    const normalizedItems = cartItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        quantity: item.quantity
    }));

    const total = normalizedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const order = {
        id: `HD${String(timestamp).slice(-8)}`,
        customerName: currentUser.name || 'Khách lẻ',
        customerEmail: currentUser.email || '',
        createdAt: new Date(timestamp).toISOString(),
        status: 'Chờ duyệt',
        paymentStatus: 'Chờ xác nhận',
        note: 'Yêu cầu mới tạo từ giỏ hàng khách hàng.',
        items: normalizedItems,
        total: total
    };

    orders.unshift(order);
    saveTransactionData(orders);

    if (typeof renderOrderHistory === 'function') {
        renderOrderHistory();
    }
    if (typeof renderStoreInsights === 'function') {
        renderStoreInsights();
    }

    return order;
};
