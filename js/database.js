/**
 * Module: database.js
 * Purpose: Seed data + localStorage persistence for products/accounts/current user.
 * Main entry points: initApp(), persistProducts(), findProductById(), getCurrentUser().
 */
const initAccounts = [
    { username: 'admin123', password: '12', role: 'admin', name: 'Admin', email: 'admin@gunstore.com', phone: '0999999999', status: 'active' },
    { username: 'khach123', password: '12', role: 'customer', name: 'Khách VIP 1', email: 'khach123@gmail.com', phone: '0888888888', spent: 2150, status: 'active' }
];

const productStorageKey = 'productCatalog';
const productSeedVersionKey = 'productSeedVersion';
// Đổi version sang v3 để hệ thống tự động xóa data cũ và nạp data mới có dấu
const productSeedVersion = 'dngear-product-seed-v2';
const productFallbackImage = '../product-fallback.svg';
const forcedProductImageOverrides = {
    RING01: '../images/nhanbacdinhdamoiss.jpg',
    RING02: '../images/nhan-nam-bac-xi-ma-vang-18k-nna0066xv.jpg',
    RING03: '../images/nhanmoissanitedinhdacaocap.jpg',
    RING04: '../images/nhandaquyruby.jpg',
    BRC01: '../images/lactaybaccharmtraitim.jpg',
    BRC02: '../images/lactayvangmanhthanhlich.png',
    NEC01: '../images/daychuyenbacnu.jpg',
    MEN01: '../images/nhannambanlon.jpg',
    MEN02: '../images/daychuyennamminimal.jpg',
    MEN03: '../images/lactaynamdayxich.jpg',
    WED01: '../images/nhancuoivangtrang.jpg',
    WED02: '../images/nhancapdoibac.jpg',
    WED03: '../images/setquatrangsuccaocapnhat.jpg',
    WED04: '../images/setnhancuoivangtrang.jpg',
    PEN01: '../images/Day-Chuyen-Bach-Kim-Platinum-DC5-.jpg',
    EAR01: '../images/bongtaidinhdacz.jpg',
    EAR02: '../images/bongtaingoctrai.jpg',
    ACC01: '../images/hoptrangsucnew.jpg',
    ACC02: '../images/khanlautrangsuc.png'
};

// BỘ DỮ LIỆU MỚI: Đầy đủ dấu, chuẩn thông tin, bao quát mọi chỉ mục
const defaultProductSeed = [
    // --- NHẪN VÀNG ---
    {
        id: 'RING01', name: 'Nhẫn bạc đính đá Moissanite', category: 'nhan', subcategory: 'nhanbac',
        price: 1250000, stock: 15, ammo: 'Bạc 925', mag: 'Ni 7', acc: 'Đá Moissanite 6.5mm',
        img: '../images/nhanbacdinhdamoiss.jpg',
        collection: 'Thanh lịch', tagline: 'Thiết kế tinh xảo, phù hợp đeo hằng ngày.', salePercent: 0, featured: true, searchTags: ['nhẫn bạc', 'moissanite', 'đính đá']
    },
    {
        id: 'RING02', name: 'Nhẫn vàng 18K sang trọng', category: 'nhan', subcategory: 'nhanvang',
        price: 2480000, stock: 20, ammo: 'Vàng 18K', mag: 'Ni 8', acc: 'Đính đá CZ cao cấp',
        img: '../images/nhan-nam-bac-xi-ma-vang-18k-nna0066xv.jpg',
        collection: 'Bán chạy', tagline: 'Kiểu dáng hiện đại, nổi bật và dễ phối đồ.', salePercent: 10, featured: true, searchTags: ['nhẫn vàng', '18k', 'cao cấp']
    },
    {
        id: 'RING03', name: 'Nhẫn Moissanite đính đá cao cấp', category: 'nhan', subcategory: 'nhanmoissanite',
        price: 2890000, stock: 12, ammo: 'Bạc 925 mạ vàng trắng', mag: 'Ni 6', acc: 'Moissanite trung tâm 8mm',
        img: '../images/nhanmoissanitedinhdacaocap.jpg',
        collection: 'Cao cấp', tagline: 'Ánh sáng rực rỡ, phù hợp cho phong cách sang trọng.', salePercent: 0, featured: false, searchTags: ['moissanite', 'nhẫn cao cấp', 'đính đá']
    },
    {
        id: 'RING04', name: 'Nhẫn đá quý Ruby Premium', category: 'nhan', subcategory: 'nhandaquy',
        price: 3650000, stock: 8, ammo: 'Vàng trắng 14K', mag: 'Ni 7', acc: 'Đá Ruby thiên nhiên',
        img: '../images/nhandaquyruby.jpg',
        collection: 'Premium', tagline: 'Thiết kế nổi bật, tôn lên vẻ quý phái và đẳng cấp.', salePercent: 15, featured: true, searchTags: ['ruby', 'đá quý', 'premium']
    },

    // --- NHÓM LẮC TAY & MẶT DÂY ---
    {
        id: 'BRC01', name: 'Lắc tay bạc charm trái tim', category: 'lactay', subcategory: 'lactay',
        price: 1680000, stock: 10, ammo: 'Bạc 925', mag: '17cm', acc: 'Charm trái tim đính đá',
        img: '../images/lactaybaccharmtraitim.jpg',
        collection: 'Nữ tính', tagline: 'Thiết kế nhẹ nhàng, phù hợp làm quà tặng ý nghĩa.', salePercent: 0, featured: false, searchTags: ['lắc tay', 'bạc', 'charm']
    },
    {
        id: 'BRC02', name: 'Lắc tay vàng mảnh thanh lịch', category: 'lactay', subcategory: 'vongtay',
        price: 2190000, stock: 14, ammo: 'Vàng 14K', mag: '18cm', acc: 'Thiết kế tối giản cao cấp',
        img: '../images/lactayvangmanhthanhlich.png',
        collection: 'Hiện đại', tagline: 'Phong cách thanh lịch, phù hợp nhiều dịp sử dụng.', salePercent: 12, featured: true, searchTags: ['lắc tay vàng', 'vòng tay', 'thanh lịch']
    },
    {
        id: 'PEN01', name: 'Mặt dây chuyền kim cương mini', category: 'daychuyen', subcategory: 'matday',
        price: 2950000, stock: 5, ammo: 'Vàng trắng 14K', mag: 'Mặt 12mm', acc: 'Đính đá CZ/Kim cương nhân tạo',
        img: '../images/Day-Chuyen-Bach-Kim-Platinum-DC5-.jpg',
        collection: 'Đính đá', tagline: 'Điểm nhấn nhỏ gọn nhưng sang trọng cho dây chuyền.', salePercent: 20, featured: true, searchTags: ['mặt dây', 'kim cương', 'dây chuyền']
    },

    // --- NHÓM DÂY CHUYỀN ---
    {
        id: 'NEC01', name: 'Dây chuyền bạc nữ cao cấp', category: 'daychuyen', subcategory: 'daychuyenbac',
        price: 1980000, stock: 9, ammo: 'Bạc 925', mag: '45cm', acc: 'Thiết kế thanh mảnh, khóa chắc chắn',
        img: '../images/daychuyenbacnu.jpg',
        collection: 'Thanh lịch', tagline: 'Mẫu dây chuyền tinh tế, dễ phối cùng nhiều phong cách.', salePercent: 0, featured: true, searchTags: ['dây chuyền bạc', 'nữ', 'cao cấp']
    },
    {
        id: 'EAR01', name: 'Bông tai bạc đính đá CZ', category: 'bongtai', subcategory: 'bongtai-dinhda',
        price: 950000, stock: 11, ammo: 'Bạc 925', mag: 'Free size', acc: 'Đá CZ cao cấp',
        img: '../images/bongtaidinhdacz.jpg',
        collection: 'Thanh lịch', tagline: 'Thiết kế nhỏ gọn, phù hợp đeo hằng ngày.', salePercent: 0, featured: false, searchTags: ['bông tai', 'cz', 'đính đá']
    },
    {
        id: 'EAR02', name: 'Bông tai ngọc trai cao cấp', category: 'bongtai', subcategory: 'bongtai-ngoctrai',
        price: 1350000, stock: 7, ammo: 'Bạc 925', mag: 'Free size', acc: 'Ngọc trai tự nhiên',
        img: '../images/bongtaingoctrai.jpg',
        collection: 'Cổ điển', tagline: 'Vẻ đẹp tinh tế và sang trọng vượt thời gian.', salePercent: 15, featured: true, searchTags: ['ngọc trai', 'bông tai', 'cao cấp']
    },

    // --- NHÓM TRANG SỨC NAM ---
    {
        id: 'MEN01', name: 'Nhẫn nam bản lớn', category: 'trangsucnam', subcategory: 'nhannam',
        price: 1850000, stock: 4, ammo: 'Bạc 925', mag: 'Ni 9', acc: 'Thiết kế bản to, mạnh mẽ',
        img: '../images/nhannambanlon.jpg',
        collection: 'Nam tính', tagline: 'Phong cách mạnh mẽ, phù hợp quý ông hiện đại.', salePercent: 0, featured: false, searchTags: ['nhẫn nam', 'trang sức nam']
    },
    {
        id: 'MEN02', name: 'Dây chuyền nam phong cách minimal', category: 'trangsucnam', subcategory: 'daychuyennam',
        price: 2100000, stock: 3, ammo: 'Thép không gỉ cao cấp', mag: '50cm', acc: 'Thiết kế tối giản',
        img: '../images/daychuyennamminimal.jpg',
        collection: 'Hiện đại', tagline: 'Tối giản nhưng vẫn cực kỳ thu hút.', salePercent: 0, featured: false, searchTags: ['dây chuyền nam', 'minimal']
    },
    {
        id: 'MEN03', name: 'Lắc tay nam dây xích', category: 'trangsucnam', subcategory: 'lactaynam',
        price: 1650000, stock: 2, ammo: 'Thép titan', mag: '20cm', acc: 'Dây xích bản lớn',
        img: '../images/lactaynamdayxich.jpg',
        collection: 'Cá tính', tagline: 'Phong cách streetwear mạnh mẽ.', salePercent: 5, featured: true, searchTags: ['lắc tay nam', 'dây xích']
    },

    // --- NHÓM TRANG SỨC CƯỚI ---
    {
        id: 'WED01', name: 'Nhẫn cưới vàng trắng', category: 'trangsuccuoi', subcategory: 'nhancuoi',
        price: 5200000, stock: 5, ammo: 'Vàng trắng 14K', mag: 'Ni 7 / Ni 9', acc: 'Khắc tên theo yêu cầu',
        img: '../images/nhancuoivangtrang.jpg',
        collection: 'Wedding', tagline: 'Biểu tượng cho tình yêu bền lâu.', salePercent: 0, featured: true, searchTags: ['nhẫn cưới']
    },
    {
        id: 'WED02', name: 'Nhẫn cặp đôi bạc', category: 'trangsuccuoi', subcategory: 'nhancapdoi',
        price: 2890000, stock: 6, ammo: 'Bạc 925', mag: 'Cặp size', acc: 'Khắc chữ miễn phí',
        img: '../images/nhancapdoibac.jpg',
        collection: 'Couple', tagline: 'Món quà ý nghĩa cho cặp đôi.', salePercent: 0, featured: false, searchTags: ['cặp đôi']
    },
    {
        id: 'WED03', name: 'Set quà trang sức cao cấp', category: 'trangsuccuoi', subcategory: 'quatang',
        price: 3500000, stock: 1, ammo: 'Vàng + đá CZ', mag: 'Full set', acc: 'Hộp quà cao cấp',
        img: '../images/setquatrangsuccaocapnhat.jpg',
        collection: 'Quà tặng', tagline: 'Phù hợp làm quà cho dịp đặc biệt.', salePercent: 0, featured: false, searchTags: ['quà tặng']
    },

    // --- NHÓM PHỤ KIỆN & TRANG SỨC CƯỚI ---
    {
        id: 'ACC01', name: 'Hộp trang sức cao cấp', category: 'phukien', subcategory: 'hoptrangsuc',
        price: 120000, stock: 150, ammo: 'Da PU cao cấp', mag: '-', acc: 'Lót nhung mềm, 1 ngăn lớn',
        img: '../images/hoptrangsucnew.jpg',
        collection: 'Phụ kiện', tagline: 'Giữ trang sức an toàn và sang trọng khi trưng bày.', salePercent: 5, featured: false, searchTags: ['hộp trang sức', 'hộp quà', 'bảo quản']
    },
    {
        id: 'WED04', name: 'Set nhẫn cưới vàng trắng', category: 'trangsuccuoi', subcategory: 'nhancuoi',
        price: 6250000, stock: 35, ammo: 'Vàng trắng 14K', mag: 'Ni 6 / Ni 8', acc: 'Khắc tên miễn phí',
        img: '../images/setnhancuoivangtrang.jpg',
        collection: 'Cưới hỏi', tagline: 'Biểu tượng trọn đời cho tình yêu và sự gắn kết.', salePercent: 0, featured: false, searchTags: ['nhẫn cưới', 'set cưới', 'vàng trắng']
    },
    {
        id: 'ACC02', name: 'Khăn lau trang sức chuyên dụng', category: 'phukien', subcategory: 'khanlau',
        price: 80000, stock: 40, ammo: 'Vải microfiber', mag: '-', acc: 'Làm sạch bề mặt bạc, vàng và đá',
        img: '../images/khanlautrangsuc.png',
        collection: 'Chăm sóc', tagline: 'Giúp trang sức luôn sáng bóng và sạch đẹp.', salePercent: 10, featured: false, searchTags: ['khăn lau', 'vệ sinh trang sức', 'phụ kiện']
    }
];

let currentSelectedProduct = null;
let dbProducts = [];

// Keep search tags in a stable lowercase array format for filtering.
function normalizeSearchTags(value) {
    if (Array.isArray(value)) {
        return value.map(item => String(item || '').trim().toLowerCase()).filter(Boolean);
    }
    if (typeof value === 'string') {
        return value.split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
    }
    return [];
}

// Normalize every product before render/save so downstream modules can trust the schema.
function normalizeProduct(product, fallback = {}) {
    const merged = { ...fallback, ...product };
    const price = Number(merged.price);
    const stock = Number(merged.stock);
    const salePercent = Number(merged.salePercent);

    return {
        id: String(merged.id || '').trim().toUpperCase(),
        name: String(merged.name || 'Sản phẩm mới').trim(),
        category: String(merged.category || 'phukien').trim().toLowerCase(),
        subcategory: String(merged.subcategory || merged.category || 'phukien').trim().toLowerCase(),
        price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
        stock: Number.isFinite(stock) ? Math.max(0, Math.round(stock)) : 0,
        ammo: String(merged.ammo || '').trim(),
        mag: String(merged.mag || '').trim(),
        acc: String(merged.acc || '').trim(),
        img: String(merged.img || productFallbackImage).trim() || productFallbackImage,
        collection: String(merged.collection || 'Hàng mới về').trim(),
        tagline: String(merged.tagline || 'Sản phẩm đang được cập nhật thông tin.').trim(),
        salePercent: Number.isFinite(salePercent) ? Math.max(0, Math.min(95, Math.round(salePercent))) : 0,
        featured: Boolean(merged.featured),
        searchTags: normalizeSearchTags(merged.searchTags),
        createdAt: merged.createdAt || new Date().toISOString()
    };
}

function sanitizeStoredProducts(products) {
    return (Array.isArray(products) ? products : [])
        .map(item => normalizeProduct(item))
        .filter(item => item.id);
}

// Hydrate from localStorage, apply seed version strategy, and expose dbProducts in-memory.
function hydrateProductCatalog() {
    let storedProducts = sanitizeStoredProducts(JSON.parse(localStorage.getItem(productStorageKey)) || []);
    const seededProducts = defaultProductSeed.map(item => normalizeProduct(item, item));

    // Thuật toán "Xóa đi làm lại": Nếu rỗng hoặc khác version, ta ép lấy thẳng bộ Seed mới để làm sạch rác
    if (storedProducts.length === 0 || localStorage.getItem(productSeedVersionKey) !== productSeedVersion) {
        storedProducts = seededProducts;
        localStorage.setItem(productSeedVersionKey, productSeedVersion);
    }

    storedProducts = storedProducts.map(product => {
        const forcedImage = forcedProductImageOverrides[product.id];
        if (!forcedImage) return product;
        return {
            ...product,
            img: forcedImage
        };
    });

    // Sắp xếp ưu tiên hàng nổi bật lên đầu, sau đó theo tên A-Z
    const nextProducts = storedProducts.sort((left, right) => {
        const featuredDelta = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
        if (featuredDelta !== 0) return featuredDelta;
        return left.name.localeCompare(right.name, 'vi');
    });

    dbProducts.splice(0, dbProducts.length, ...nextProducts);
    localStorage.setItem(productStorageKey, JSON.stringify(dbProducts));
}

// Single save gateway for catalog writes.
function persistProducts(nextProducts = dbProducts) {
    const normalizedProducts = sanitizeStoredProducts(nextProducts);
    dbProducts.splice(0, dbProducts.length, ...normalizedProducts);
    localStorage.setItem(productStorageKey, JSON.stringify(dbProducts));
    return dbProducts;
}

// Shared auth state helpers used across app/cart/orders/profile.
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    } catch (error) {
        return null;
    }
}

function saveCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUserCartKey() {
    const currentUser = getCurrentUser();
    if (!currentUser) return 'cart:guest';
    return `cart:${currentUser.email || currentUser.username || currentUser.name || 'guest'}`;
}

function initAccountsData() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (!Array.isArray(users) || users.length === 0) {
        users = [...initAccounts];
    } else {
        initAccounts.forEach(seedAccount => {
            const existingIndex = users.findIndex(user => user.username === seedAccount.username || user.email === seedAccount.email);
            if (existingIndex > -1) {
                users[existingIndex] = {
                    ...users[existingIndex],
                    ...seedAccount
                };
            } else {
                users.push(seedAccount);
            }
        });
    }
    localStorage.setItem('users', JSON.stringify(users));
}

function initApp() {
    initAccountsData();
    hydrateProductCatalog();
}

window.persistProducts = persistProducts;
window.getCurrentUser = getCurrentUser;
window.saveCurrentUser = saveCurrentUser;
window.getCurrentUserCartKey = getCurrentUserCartKey;
window.productFallbackImage = productFallbackImage;
window.findProductById = function (id) {
    return dbProducts.find(product => product.id === id) || null;
};

initApp();

function normalizeProduct(product, fallback = {}) {
    const merged = { ...fallback, ...product };
    const price = Number(merged.price);
    const stock = Number(merged.stock);
    const salePercent = Number(merged.salePercent);

    return {
        id: String(merged.id || '').trim().toUpperCase(),
        name: String(merged.name || 'Sản phẩm mới').trim(),
        category: String(merged.category || 'phukien').trim().toLowerCase(),
        subcategory: String(merged.subcategory || merged.category || 'phukien').trim().toLowerCase(),
        price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
        stock: Number.isFinite(stock) ? Math.max(0, Math.round(stock)) : 0,
        ammo: String(merged.ammo || '').trim(),
        mag: String(merged.mag || '').trim(),
        acc: String(merged.acc || '').trim(),
        img: String(merged.img || productFallbackImage).trim() || productFallbackImage,
        collection: String(merged.collection || 'Hàng mới về').trim(),
        tagline: String(merged.tagline || 'Sản phẩm đang được cập nhật thông tin.').trim(),
        salePercent: Number.isFinite(salePercent) ? Math.max(0, Math.min(95, Math.round(salePercent))) : 0,
        featured: Boolean(merged.featured),
        supplierId: String(merged.supplierId || '').trim(), // ĐÃ BỔ SUNG TRƯỜNG NÀY ĐỂ KHÔNG BỊ MẤT DỮ LIỆU
        searchTags: normalizeSearchTags(merged.searchTags),
        createdAt: merged.createdAt || new Date().toISOString()
    };
}
