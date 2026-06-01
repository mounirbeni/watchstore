/* ============================================
   Cart & Wishlist Management
   ============================================ */

function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId, qty = 1) {
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ id: productId, qty: qty });
    }
    saveCart(cart);
    showToast('Montre ajoutee a votre reservation.');
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    if (typeof renderCart === 'function') renderCart();
}

function updateCartQty(productId, newQty) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.qty = Math.max(1, newQty);
    }
    saveCart(cart);
    if (typeof renderCart === 'function') renderCart();
}

function getCartTotal() {
    const cart = getCart();
    let total = 0;
    cart.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.id);
        if (product) total += product.price * item.qty;
    });
    return total;
}

function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartCount() {
    const count = getCartItemCount();
    document.querySelectorAll('#cartCount, #tabCartBadge').forEach(el => {
        if (!el) return;
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });
}

function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
}

function saveWishlist(list) {
    localStorage.setItem('wishlist', JSON.stringify(list));
    updateWishlistCount();
}

function toggleWishlist(productId) {
    let list = getWishlist();
    const idx = list.indexOf(productId);
    if (idx > -1) {
        list.splice(idx, 1);
        showToast('Retire des favoris');
    } else {
        list.push(productId);
        showToast('Ajoute aux favoris');
    }
    saveWishlist(list);

    document.querySelectorAll(`.product-card[data-id="${productId}"] .product-action-btn:first-child`).forEach(btn => {
        btn.classList.toggle('in-wishlist', list.includes(productId));
    });

    if (typeof renderWishlist === 'function') renderWishlist();
}

function updateWishlistCount() {
    const count = getWishlist().length;
    document.querySelectorAll('#wishlistCount').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function quickView(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('quickViewModal');
    const body = document.getElementById('quickViewBody');
    if (!modal || !body) return;

    body.innerHTML = `
        <div class="quick-view-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="quick-view-info">
            <span class="product-brand">${product.brand}</span>
            <h3>${product.name}</h3>
            <div class="product-rating">
                ${getStarsHTML(product.rating)}
                <span class="text-muted">(${product.reviews} avis)</span>
            </div>
            <div class="product-price">
                <span class="current-price">${formatPrice(product.price)}</span>
                ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
            </div>
            <p>${product.description}</p>
            <div class="quantity-selector-detail">
                <span class="qty-label">Quantite</span>
                <button type="button" class="cart-qty-btn" aria-label="Moins" onclick="var i=document.getElementById('qvQty');i.value=Math.max(1,parseInt(i.value,10)-1)">-</button>
                <input type="number" class="qty-input" value="1" min="1" id="qvQty" aria-label="Quantite">
                <button type="button" class="cart-qty-btn" aria-label="Plus" onclick="var i=document.getElementById('qvQty');i.value=parseInt(i.value,10)+1">+</button>
            </div>
            <div class="quick-view-buttons">
                <button type="button" class="btn btn-reserve" onclick="addToCart(${product.id}, parseInt(document.getElementById('qvQty').value,10)); document.getElementById('quickViewModal').classList.remove('active'); window.location.href='checkout.html';">
                    <i class="fas fa-gem"></i> Reserver
                </button>
                <a href="product.html#id=${product.id}" class="btn btn-ghost">Voir la fiche complete</a>
            </div>
        </div>
    `;

    modal.classList.add('active');
    if (typeof updatePageScrollLock === 'function') updatePageScrollLock();
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateWishlistCount();
});
