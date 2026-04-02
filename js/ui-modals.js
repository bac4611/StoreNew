/**
 * Module: ui-modals.js
 * Purpose: Inject common modal markup (detail/cart/admin) and close behavior.
 * Main entry points: injectModals(), registerModalDismiss().
 */
function injectModals() {
    if (document.getElementById('detailModal')) return;

    const container = document.createElement('div');
    container.innerHTML = `
        <div class="modal-overlay hide-menu" id="detailModal">
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h2 class="modal-title" id="mdlName">Tên sản phẩm</h2>
                        <p class="modal-subtitle" id="mdlTagline">Mô tả ngắn sẽ hiển thị ở đây.</p>
                    </div>
                    <span class="close-btn" onclick="closeModal()">✕</span>
                </div>
                <div class="modal-body">
                    <div class="modal-img-container">
                        <img id="mdlImg" src="${window.productFallbackImage || '../product-fallback.svg'}" alt="Hình ảnh sản phẩm">
                    </div>
                    <div class="modal-info">
                        <div class="modal-price" id="mdlPrice">
                            <span style="color: rgb(30, 41, 59); font-size: 20px; font-weight: bold; margin-right: 8px;">Giá:</span><span style="color: rgb(239, 68, 68);">0$</span>
                        </div>
                        <div class="info-row"><span class="info-label">Số hàng:</span><span class="info-value" id="mdlStock">0</span></div>
                        <div class="info-row" id="rowMdlMag"><span class="info-label">Băng đạn:</span><span class="info-value" id="mdlMag">-</span></div>
                        <div class="info-row" id="rowMdlAmmo"><span class="info-label">Loại đạn:</span><span class="info-value" id="mdlAmmo">-</span></div>
                        <div class="info-row" id="rowMdlAcc"><span class="info-label" id="lblMdlAcc">Thông số:</span><span class="info-value" id="mdlAcc">-</span></div>
                        <div class="info-row"><span class="info-label">Tư vấn nhanh:</span><span class="info-value">Hotline, Zalo và Facebook sẽ phản hồi ngay khi có yêu cầu.</span></div>

                        <div class="customer-actions hide-menu" id="mdlCustomerActions">
                            <div class="qty-control">
                                <span class="qty-control-label">Số lượng:</span>
                                <button type="button" onclick="changeQty(-1)">-</button>
                                <input type="number" id="buyQty" value="1" readonly>
                                <button type="button" onclick="changeQty(1)">+</button>
                            </div>
                            <div class="action-btns">
                                <button class="tactical-btn add-cart-btn" onclick="addToCart()">Thêm vào giỏ</button>
                            </div>
                        </div>

                        <div style="margin-top: -5px; color: rgb(0, 110, 255); font-weight: bold; font-size: 17px; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-location-dot"></i> Xem và mua trực tiếp tại: Khách sạn The Continental
                        </div>

                        <div class="admin-actions hide-menu" id="mdlAdminActions">
                            <button class="tactical-btn admin-top-btn" id="btnToggleTopSelling" onclick="toggleTopSellingCurrent()">Đang tải...</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="cart-overlay hide-menu" id="cartModal">
            <div class="cart-panel">
                <div class="cart-header">
                    <div>
                        <h2 class="cart-title">Giỏ hàng của bạn</h2>
                        <p class="cart-subtitle" id="cartMetaCopy">Thêm sản phẩm để tạo yêu cầu mua hàng mới.</p>
                    </div>
                    <span class="close-btn" onclick="closeCart()">✕</span>
                </div>
                <div class="cart-body" id="cartItemsContainer">
                    <div class="cart-empty-state">
                        <strong>Giỏ hàng trống</strong>
                        <p>Hãy thêm sản phẩm từ storefront để bắt đầu tạo đơn.</p>
                    </div>
                </div>
                <div class="cart-footer">
                    <div class="voucher-section" style="display: flex; gap: 8px; margin-bottom: 10px;">
                        <input type="text" id="voucherInput" placeholder="Nhập mã giảm giá..." style="flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 4px; font-family: inherit;">
                        <button class="tactical-btn" style="width: auto; padding: 10px 15px;" onclick="applyVoucher()">Áp dụng</button>
                    </div>
                    <div id="voucherMessage" style="font-size: 13px; margin-top: -5px; margin-bottom: 10px;"></div>
                    <div class="cart-total">
                        <span>Tạm tính</span>
                        <span id="cartTotalSum">0$</span>
                    </div>
                    <div class="cart-discount hide-menu" id="cartDiscountRow" style="justify-content: space-between; font-weight: bold; margin-bottom: 5px; color: rgb(239, 68, 68);">
                        <span>Giảm giá (<span id="cartDiscountLabel"></span>)</span>
                        <span id="cartDiscountValue">-0$</span>
                    </div>
                    <div class="cart-final-total hide-menu" id="cartFinalTotalRow" style="justify-content: space-between; font-size: 1.25rem; font-weight: 800; margin-bottom: 15px;">
                        <span>Tổng cộng</span>
                        <span id="cartFinalTotalSum">0$</span>
                    </div>
                    <div class="cart-total-meta" id="cartTotalItems">0 món</div>
                    <button class="tactical-btn cart-submit-btn" onclick="checkout()">Gửi yêu cầu mua hàng</button>
                </div>
            </div>
        </div>

        <div class="cart-overlay hide-menu" id="inboxModal">
            <div class="cart-panel" style="width: 450px;">
                <div class="cart-header">
                    <div>
                        <h2 class="cart-title">Hòm thư của bạn</h2>
                        <p class="cart-subtitle">Các thông báo và mã giảm giá từ hệ thống.</p>
                    </div>
                    <span class="close-btn" onclick="closeInbox()">✕</span>
                </div>
                <div class="cart-body" id="inboxItemsContainer" style="padding: 15px; background: #000000;">
                </div>
            </div>
        </div>

        <div class="modal-overlay hide-menu" id="adminFormModal">
            <div class="modal-content" style="width: 700px;">
                <div class="modal-header">
                    <h2 class="modal-title" id="adminFormTitle">Thêm sản phẩm mới</h2>
                    <span class="close-btn" onclick="closeAdminForm()">✕</span>
                </div>
                <div class="modal-body" style="display: block;">
                    <input type="hidden" id="formSaveMode" value="add">

                    <div class="admin-form-grid">
                        <div class="admin-form-group">
                            <label>Danh mục</label>
                            <select id="formCategory" onchange="toggleAdminFields()">
                                <optgroup label="Súng ngắn">
                                    <option value="sungngan-xoay">Súng ngắn ổ xoay</option>
                                    <option value="sungngan-banauto">Súng ngắn bán tự động</option>
                                    <option value="sungngan-auto">Súng ngắn tự động</option>
                                    <option value="sungngan-magnum">Súng ngắn Magnum</option>
                                </optgroup>
                                <optgroup label="Súng trường & Bắn tỉa">
                                    <option value="sungtruong-banauto">Súng trường bán tự động</option>
                                    <option value="sungtruong-auto">Súng trường tự động</option>
                                    <option value="sungbantia">Súng bắn tỉa</option>
                                </optgroup>
                                <optgroup label="Shotgun & Tiểu liên">
                                    <option value="shotgun">Súng Shotgun</option>
                                    <option value="smg-banauto">Tiểu liên bán tự động</option>
                                    <option value="smg-auto">Tiểu liên tự động</option>
                                </optgroup>
                                <optgroup label="Vũ khí hạng nặng">
                                    <option value="sungmay-nhe">Súng máy hạng nhẹ</option>
                                    <option value="sungmay-trung">Súng máy hạng trung</option>
                                    <option value="sungmay-nang">Súng máy hạng nặng</option>
                                    <option value="sungmay-danang">Súng máy đa chức năng</option>
                                    <option value="phunlua">Súng phun lửa</option>
                                    <option value="khonggiat">Súng không giật</option>
                                    <option value="phongtenlua">Hệ thống phóng tên lửa</option>
                                    <option value="phongluu">Súng phóng lựu</option>
                                    <option value="phao">Pháo</option>
                                </optgroup>
                                <optgroup label="Trang bị">
                                    <option value="danduoc">Đạn dược</option>
                                    <option value="phongve">Đồ tự vệ</option>
                                    <option value="phukien">Phụ kiện</option>
                                </optgroup>
                            </select>
                        </div>
                        <div class="admin-form-group">
                            <label>Mã sản phẩm</label>
                            <input type="text" id="formId" placeholder="VD: G17, M4A1...">
                        </div>
                        <div class="admin-form-group">
                            <label>Tên sản phẩm</label>
                            <input type="text" id="formName" placeholder="Nhập tên...">
                        </div>
                        <div class="admin-form-group">
                            <label>Giá bán ($)</label>
                            <input type="number" id="formPrice" placeholder="0">
                        </div>
                        <div class="admin-form-group">
                            <label>Nhà cung cấp</label>
                            <select id="formSupplier">
                                </select>
                        </div>
                        <div class="admin-form-group">
                            <label>Số hàng</label>
                            <input type="number" id="formStock" placeholder="0">
                        </div>
                        <div class="admin-form-group" id="groupFormMag">
                            <label>Băng đạn</label>
                            <input type="text" id="formMag" placeholder="VD: 30 viên...">
                        </div>
                        <div class="admin-form-group" id="groupFormAmmo">
                            <label>Loại đạn</label>
                            <input type="text" id="formAmmo" placeholder="VD: 9mm...">
                        </div>
                        <div class="admin-form-group full-width" id="groupFormAcc">
                            <label id="lblFormAcc">Phụ kiện đi kèm</label>
                            <input type="text" id="formAcc" placeholder="Để trống nếu không có...">
                        </div>
                        <div class="admin-form-group full-width">
                            <label>Đường dẫn hình ảnh (có thể bỏ trống)</label>
                            <input type="text" id="formImg" placeholder="Link ảnh trực tuyến...">
                        </div>
                    </div>

                    <div class="admin-form-actions">
                        <button class="tactical-btn" style="background: transparent; color: var(--danger); border: 1px solid var(--danger); width: auto; padding: 10px 30px;" onclick="closeAdminForm()">Hủy bỏ</button>
                        <button class="tactical-btn" style="width: auto; padding: 10px 30px; background: rgb(34, 197, 94);" onclick="saveProduct()">Xác nhận lưu</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="toast-container"></div>
    `;

    while (container.children.length > 0) {
        document.body.appendChild(container.children[0]);
    }
}

function registerModalDismiss() {
    document.addEventListener('click', event => {
        const detailModal = document.getElementById('detailModal');
        const cartModal = document.getElementById('cartModal');
        const inboxModal = document.getElementById('inboxModal');

        if (detailModal && !detailModal.classList.contains('hide-menu') && event.target === detailModal) {
            closeModal();
        }

        if (cartModal && !cartModal.classList.contains('hide-menu') && event.target === cartModal) {
            closeCart();
        }

        if (inboxModal && !inboxModal.classList.contains('hide-menu') && event.target === inboxModal) {
            closeInbox();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;

        const detailModal = document.getElementById('detailModal');
        const cartModal = document.getElementById('cartModal');
        const inboxModal = document.getElementById('inboxModal');
        const promotionModal = document.getElementById('adminPromotionFormModal');
        const adminProductModal = document.getElementById('adminFormModal');
        const staffModal = document.getElementById('adminStaffFormModal');
        const supplierModal = document.getElementById('adminSupplierFormModal');

        if (detailModal && !detailModal.classList.contains('hide-menu')) closeModal();
        if (cartModal && !cartModal.classList.contains('hide-menu')) closeCart();
        if (inboxModal && !inboxModal.classList.contains('hide-menu') && typeof closeInbox === 'function') closeInbox();
        if (promotionModal && !promotionModal.classList.contains('hide-menu') && typeof closePromotionForm === 'function') closePromotionForm();
        if (adminProductModal && !adminProductModal.classList.contains('hide-menu') && typeof closeAdminForm === 'function') closeAdminForm();
        if (staffModal && !staffModal.classList.contains('hide-menu') && typeof closeStaffForm === 'function') closeStaffForm();
        if (supplierModal && !supplierModal.classList.contains('hide-menu') && typeof closeSupplierForm === 'function') closeSupplierForm();
    });
}

injectModals();
registerModalDismiss();

function applyJewelryCategoryLabels() {
    const magLabel = document.querySelector('#rowMdlMag .info-label');
    const ammoLabel = document.querySelector('#rowMdlAmmo .info-label');
    const accLabel = document.getElementById('lblMdlAcc');
    const categorySelect = document.getElementById('formCategory');
    const formId = document.getElementById('formId');
    const formMagLabel = document.querySelector('#groupFormMag label');
    const formAmmoLabel = document.querySelector('#groupFormAmmo label');
    const formAccLabel = document.getElementById('lblFormAcc');
    const formMag = document.getElementById('formMag');
    const formAmmo = document.getElementById('formAmmo');
    const formAcc = document.getElementById('formAcc');
    if (magLabel) magLabel.innerText = 'Kich co:';
    if (ammoLabel) ammoLabel.innerText = 'Chat lieu:';
    if (accLabel) accLabel.innerText = 'Dac diem:';

    if (categorySelect) {
        categorySelect.innerHTML = `
            <optgroup label="Nhan">
                <option value="nhanbac">Nhan bac</option>
                <option value="nhanvang">Nhan vang</option>
                <option value="nhanmoissanite">Nhan moissanite</option>
                <option value="nhandaquy">Nhan da quy</option>
            </optgroup>
            <optgroup label="Day chuyen">
                <option value="daychuyenbac">Day chuyen bac</option>
                <option value="daychuyenvang">Day chuyen vang</option>
                <option value="matday">Mat day chuyen</option>
            </optgroup>
            <optgroup label="Lac tay">
                <option value="lactay">Lac tay</option>
                <option value="vongtay">Vong tay</option>
            </optgroup>
            <optgroup label="Bong tai">
                <option value="bongtai-dinhda">Bong tai dinh da</option>
                <option value="bongtai-ngoctrai">Bong tai ngoc trai</option>
                <option value="bongtai-toigian">Bong tai toi gian</option>
            </optgroup>
            <optgroup label="Trang suc nam">
                <option value="nhannam">Nhan nam</option>
                <option value="daychuyennam">Day chuyen nam</option>
                <option value="lactaynam">Lac tay nam</option>
            </optgroup>
            <optgroup label="Trang suc cuoi">
                <option value="nhancuoi">Nhan cuoi</option>
                <option value="nhancapdoi">Nhan cap doi</option>
                <option value="quatang">Qua tang ky niem</option>
            </optgroup>
            <optgroup label="Phu kien">
                <option value="hoptrangsuc">Hop trang suc</option>
                <option value="khanlau">Khan lau trang suc</option>
                <option value="phukien">Phu kien chung</option>
            </optgroup>
        `;
    }

    if (formId) formId.placeholder = 'VD: RING05, NEC02...';
    if (formMagLabel) formMagLabel.innerText = 'Kich co / size';
    if (formAmmoLabel) formAmmoLabel.innerText = 'Chat lieu';
    if (formAccLabel) formAccLabel.innerText = 'Dac diem noi bat';
    if (formMag) formMag.placeholder = 'VD: Ni 7, 45cm, Free size...';
    if (formAmmo) formAmmo.placeholder = 'VD: Bac 925, Vang 18K...';
    if (formAcc) formAcc.placeholder = 'VD: Dinh da CZ, khac ten, charm trai tim...';
}
applyJewelryCategoryLabels();
