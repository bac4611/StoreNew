/**
Giỏ hàng (cart)
- thêm sản phẩm
- update số lượng
- áp mã giảm giá
- render UI
- checkout
 */
// xác định key lưu cart trong db
let currentCart = []; //ds sp trong giỏ
window.currentCart = currentCart; 
let appliedVoucher = null; //mã giảm giá đang dùng
window.appliedVoucher = appliedVoucher;

// Ham getCartStorageKey: lay logic tuong ung.
function getCartStorageKey() {
    return typeof getCurrentUserCartKey === 'function' ? getCurrentUserCartKey() : 'cart:guest';
}

/*- đảm bảo product tồn tại
- quantity hợp lệ
- không vượt stock */
// Ham normalizeCartItems: chuan hoa logic tuong ung.
function normalizeCartItems(items) {
    return (Array.isArray(items) ? items : []) // nếu items là mảng thì ok còn ko trả về mảng rỗng tránh bị lỗi
        .map(item => {
            const productId = item.productId || (item.product && item.product.id);
            const product = typeof findProductById === 'function' ? findProductById(productId) : null; /*gọi hàm tìm sp, kco thì trả null
                                                                                                        đồng bộ cart vs product tránh product bị xóa mà vẫn còn
                                                                                                        trong cart */
            const quantity = Number(item.quantity || 0); //ép về số

            if (!product || quantity <= 0) return null;

            return {
                product,
                quantity: Math.min(quantity, product.stock || quantity) // giới hạn theo stock user mua 10sp sẽ sửa tự động thành 5
            };
        })
        .filter(Boolean)
        .filter(item => item.quantity > 0); //lọc null và các sp có sl = 0
}

// Save cart for current user and optionally refresh UI widgets.
// Ham persistCartState: luu ben vung logic tuong ung.
function persistCartState(shouldRender = true) {
    const serialized = currentCart.map(item => ({
        productId: item.product.id, //chỉ lấy sl sp và ID
        quantity: item.quantity
    }));

    localStorage.setItem(getCartStorageKey(), JSON.stringify(serialized)); //biến mảng object thành chuỗi JSON

    if (shouldRender) {
        renderCart();
    }

    if (typeof renderStoreInsights === 'function') {
        renderStoreInsights();
    }
}

// Pull cart from storage when page loads or cart panel opens.
// Ham hydrateCartFromStorage: nap lai logic tuong ung.
function hydrateCartFromStorage() {
    const stored = JSON.parse(localStorage.getItem(getCartStorageKey())) || [];
    const normalizedItems = normalizeCartItems(stored);

    currentCart.splice(0, currentCart.length, ...normalizedItems);
    persistCartState(false);

    if (typeof renderStoreInsights === 'function') {
        renderStoreInsights();
    }

    return currentCart;
}

// Ham addCartItem: them logic tuong ung.
function addCartItem(product, quantity) {
    if (!product || quantity <= 0) return false;

    const existingItem = currentCart.find(item => item.product.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const nextQty = currentQty + quantity;

    if (nextQty > product.stock) {
        showToast(`Chi con ${product.stock} san pham trong kho!`);
        return false;
    }

    if (existingItem) {
        existingItem.quantity = nextQty;
    } else {
        currentCart.push({ product, quantity });
    }

    persistCartState(false);
    return true;
}

// Ham updateCartSummary: cap nhat logic tuong ung.
function updateCartSummary(totalItems, totalValue) {
    const totalEl = document.getElementById('cartTotalSum');
    const itemsEl = document.getElementById('cartTotalItems');
    const metaEl = document.getElementById('cartMetaCopy');

    let discount = 0;
    if (appliedVoucher && totalItems > 0) {
        if (appliedVoucher.rankUnit === '%') {
            discount = totalValue * (appliedVoucher.rankValue / 100);
        } else if (appliedVoucher.rankUnit === '$') {
            discount = appliedVoucher.rankValue;
        } else if (appliedVoucher.rankUnit === 'combo') {
            discount = 0;
        }
        discount = Math.min(discount, totalValue);
    }

    const finalTotal = totalValue - discount;

    if (totalEl) totalEl.innerText = typeof formatStorePrice === 'function' ? formatStorePrice(totalValue) : `${totalValue}$`;
    if (itemsEl) itemsEl.innerText = `${totalItems} mon`;
    if (metaEl) {
        metaEl.innerText = totalItems > 0
            ? 'Sẵn sàng gửi yêu cầu mua hàng cho admin xác nhận.'
            : 'Thêm sản phẩm để nhận tư vấn nhanh hơn.';
    }

    const discountRow = document.getElementById('cartDiscountRow');
    const discountVal = document.getElementById('cartDiscountValue');
    const discountLbl = document.getElementById('cartDiscountLabel');
    const finalRow = document.getElementById('cartFinalTotalRow'); //dòng tổng tiền sau giảm
    const finalSum = document.getElementById('cartFinalTotalSum'); //số tiền cuối

    if (discountRow && finalRow && appliedVoucher && totalItems > 0) {
        discountRow.classList.remove('hide-menu');
        finalRow.classList.remove('hide-menu');
        if (discountLbl) discountLbl.innerText = appliedVoucher.code;
        if (discountVal) discountVal.innerText = `-${typeof formatStorePrice === 'function' ? formatStorePrice(discount) : discount + '$'}`;
        if (finalSum) finalSum.innerText = typeof formatStorePrice === 'function' ? formatStorePrice(finalTotal) : `${finalTotal}$`;
    } else {
        if (discountRow) discountRow.classList.add('hide-menu');
        if (finalRow) finalRow.classList.add('hide-menu');
    }
}

// Ham applyVoucher: ap dung logic tuong ung.
window.applyVoucher = function() {
    const codeInput = document.getElementById('voucherInput');
    const msgEl = document.getElementById('voucherMessage');
    if (!codeInput || !msgEl) return;

    const code = codeInput.value.trim().toUpperCase();
    if (!code) {
        msgEl.innerText = 'Vui lòng nhập mã giảm giá!';
        msgEl.style.color = 'rgb(239, 68, 68)';
        return;
    }

    const promotions = JSON.parse(localStorage.getItem('promotionData')) || [];
    const validPromo = promotions.find(p => p.code === code && p.status === 'Đang áp dụng');

    if (!validPromo) {
        msgEl.innerText = 'Mã giảm giá không hợp lệ hoặc đã hết hạn!';
        msgEl.style.color = 'rgb(239, 68, 68)';
        appliedVoucher = null;
        renderCart();
        return;
    }

    if (validPromo.usageLimit && validPromo.usageLimit > 0 && validPromo.uses >= validPromo.usageLimit) {
        msgEl.innerText = 'Mã giảm giá đã hết lượt, không thể sử dụng!';
        msgEl.style.color = 'rgb(239, 68, 68)';
        appliedVoucher = null;
        renderCart();
        return;
    }

    msgEl.innerText = `Đã áp dụng: ${validPromo.title}`;
    msgEl.style.color = 'rgb(34, 197, 94)';
    appliedVoucher = validPromo;
    renderCart();
};

// Ham buildCartItemMarkup: tao logic tuong ung.
function buildCartItemMarkup(item) {
    return `
        <article class="cart-item-card">
            <img src="${item.product.img}" alt="${item.product.name}" onerror="this.onerror=null;this.src='${window.productFallbackImage || '../product-fallback.svg'}';">
            <div class="cart-item-copy">
                <h4>${item.product.name}</h4>
                <p>${item.product.collection || 'San pham dang co san'} · ${typeof formatStorePrice === 'function' ? formatStorePrice(item.product.price) : `${item.product.price}$`}</p>
                <div class="cart-item-subline">${item.product.tagline || 'SẢN PHẨM SẴN SÀNG ĐỂ CHỐT ĐƠN.'}</div>
            </div>
            <div class="cart-item-side">
                <div class="cart-item-qty">
                    <button type="button" onclick="updateCartQuantity('${item.product.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" onclick="updateCartQuantity('${item.product.id}', 1)">+</button>
                </div>
                <button type="button" class="cart-remove-btn" onclick="removeFromCart('${item.product.id}')">Bỏ khỏi giỏ hàng</button>
            </div>
        </article>
    `;
}

// Ham addToCart: them logic tuong ung.
function addToCart() {
    if (!currentSelectedProduct) return;

    const qtyInput = document.getElementById('buyQty');
    const quantity = qtyInput ? Math.max(1, Number(qtyInput.value) || 1) : 1;

    if (!addCartItem(currentSelectedProduct, quantity)) {
        return;
    }

    showToast(`Đã thêm ${quantity} x ${currentSelectedProduct.name} vào giỏ hàng!`);
    closeModal();
    renderCart();
}

window.addToCart = addToCart;

// Ham quickAddToCart: xu ly logic tuong ung.
window.quickAddToCart = function(productId) {
    const product = typeof findProductById === 'function' ? findProductById(productId) : null;
    if (!product) {
        showToast('Không tìm thấy sản phẩm.');
        return;
    }

    if (product.stock <= 0) {
        showToast('Sản phẩm này đã hết hàng.');
        return;
    }

    if (!addCartItem(product, 1)) {
        return;
    }

    showToast(`Đã thêm nhanh ${product.name} vào giỏ hàng.`);
    renderCart();
};

// Ham addProductToCart: them logic tuong ung.
window.addProductToCart = function(productId, quantity = 1) {
    const product = typeof findProductById === 'function' ? findProductById(productId) : null;
    if (!product) return false;
    return addCartItem(product, quantity);
};

// Ham openCart: mo logic tuong ung.
function openCart() {
    hydrateCartFromStorage();
    renderCart();

    const cartModal = document.getElementById('cartModal');
    if (cartModal) cartModal.classList.remove('hide-menu');
}

window.openCart = openCart;

// Ham closeCart: dong logic tuong ung.
function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) cartModal.classList.add('hide-menu');
}

window.closeCart = closeCart;

// Render all cart items + totals and sync badge counters.
// Ham renderCart: hien thi logic tuong ung.
function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;

    hydrateCartFromStorage();

    if (currentCart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-state">
                <strong>Giỏ hàng đang trống</strong>
                <p>Thử thêm vài mẫu sale để bắt đầu tạo đơn.</p>
            </div>
        `;
        updateCartSummary(0, 0);
        return;
    }

    const totalValue = currentCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);

    container.innerHTML = currentCart.map(buildCartItemMarkup).join('');
    updateCartSummary(totalItems, totalValue);
}

window.renderCart = renderCart;

// Ham updateCartQuantity: cap nhat logic tuong ung.
window.updateCartQuantity = function(productId, delta) {
    const item = currentCart.find(cartItem => cartItem.product.id === productId);
    if (!item) return;

    const nextQuantity = item.quantity + delta;
    if (nextQuantity <= 0) {
        currentCart.splice(currentCart.indexOf(item), 1);
        persistCartState();
        return;
    }

    if (nextQuantity > item.product.stock) {
        showToast(`Kho chi con ${item.product.stock} san pham.`);
        return;
    }

    item.quantity = nextQuantity;
    persistCartState();
};

// Ham removeFromCart: loai bo logic tuong ung.
window.removeFromCart = function(productId) {
    const nextCart = currentCart.filter(item => item.product.id !== productId);
    currentCart.splice(0, currentCart.length, ...nextCart);
    persistCartState();
    showToast('Đã bỏ sản phẩm khỏi giỏ hàng.');
};

// Checkout delegates order creation to reports module and then clears cart.
// Ham checkout: xu ly logic tuong ung.
function checkout() {
    if (currentCart.length === 0) {
        showToast('Giỏ hàng đang trống!');
        return;
    }

    showToast('Đang gửi yêu cầu đến admin...');

    window.setTimeout(() => {
        const order = typeof window.recordCheckoutOrder === 'function'
            ? window.recordCheckoutOrder(currentCart)
            : null;

        if (!order) {
            showToast('Khong tao duoc yeu cau mua hang. Thu lai sau.');
            return;
        }

        if (appliedVoucher) {
            const promotions = JSON.parse(localStorage.getItem('promotionData')) || [];
            const promoIndex = promotions.findIndex(p => p.id === appliedVoucher.id);
            if (promoIndex !== -1) {
                promotions[promoIndex].uses = (promotions[promoIndex].uses || 0) + 1;
                localStorage.setItem('promotionData', JSON.stringify(promotions));
                if (typeof renderAdminPromotions === 'function') {
                    const searchInput = document.getElementById('adminPromotionSearchInput');
                    renderAdminPromotions(searchInput ? searchInput.value : '');
                }
            }
            appliedVoucher = null;
            const codeInput = document.getElementById('voucherInput');
            if (codeInput) codeInput.value = '';
            const msgEl = document.getElementById('voucherMessage');
            if (msgEl) msgEl.innerText = '';
        }

        currentCart.splice(0, currentCart.length);
        persistCartState(false);
        closeCart();
        renderCart();

        if (typeof renderOrderHistory === 'function') {
            renderOrderHistory();
        }

        if (typeof renderSidebar === 'function') {
            renderSidebar();
        }

        if (typeof renderStoreInsights === 'function') {
            renderStoreInsights();
        }

        showToast(`Đã gửi yêu cầu mua hàng  ${order.id} thanh cong!`);
    }, 800);
}

window.checkout = checkout;
window.hydrateCartFromStorage = hydrateCartFromStorage;

hydrateCartFromStorage();
