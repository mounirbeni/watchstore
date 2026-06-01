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
    showToast('Produit ajouté au panier !');
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
    const countEls = document.querySelectorAll('#cartCount, #bottomCartCount');
    const count = getCartItemCount();
    countEls.forEach(el => el.textContent = count);
}

// Wishlist
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
        showToast('Retiré des favoris');
    } else {
        list.push(productId);
        showToast('Ajouté aux favoris !');
    }
    saveWishlist(list);

    document.querySelectorAll(`.product-card[data-id="${productId}"] .product-action-btn:first-child`).forEach(btn => {
        btn.classList.toggle('in-wishlist', list.includes(productId));
    });

    if (typeof renderWishlist === 'function') renderWishlist();
}

function updateWishlistCount() {
    const countEls = document.querySelectorAll('#wishlistCount');
    const count = getWishlist().length;
    countEls.forEach(el => el.textContent = count);
}

// Toast
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Quick View
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
            <span class="product-category">${product.brand}</span>
            <h3>${product.name}</h3>
            <div class="product-rating">
                ${getStarsHTML(product.rating)}
                <span>(${product.reviews} avis)</span>
            </div>
            <div class="product-price">
                <span class="current-price">${formatPrice(product.price)}</span>
                ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
            </div>
            <p>${product.description}</p>
            <div class="quantity-selector">
                <button class="qty-btn" onclick="this.nextElementSibling.value = Math.max(1, parseInt(this.nextElementSibling.value) - 1)">-</button>
                <input type="number" class="qty-input" value="1" min="1" id="qvQty">
                <button class="qty-btn" onclick="this.previousElementSibling.value = parseInt(this.previousElementSibling.value) + 1">+</button>
            </div>
            <div class="quick-view-buttons">
                <button class="btn btn-primary" onclick="addToCart(${product.id}, parseInt(document.getElementById('qvQty').value)); document.getElementById('quickViewModal').classList.remove('active');">
                    <i class="fas fa-shopping-bag"></i> Ajouter au panier
                </button>
                <a href="product.html#id=${product.id}" class="btn btn-dark">Voir les détails</a>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Init counts
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateWishlistCount();
});
