/* LuxWatch - luxury product page */
function renderLuxuryProduct(product) {
    const inWishlist = getWishlist().includes(product.id);
    const discount = product.oldPrice
        ? Math.round((1 - product.price / product.oldPrice) * 100)
        : null;

    const specsHtml = Object.entries(product.specs).map(([k, v]) => `
        <div class="product-meta-row">
            <strong>${k.charAt(0).toUpperCase() + k.slice(1)}</strong>
            <span>${v}</span>
        </div>`).join('');

    const specsGridHtml = Object.entries(product.specs).map(([k, v]) => `
        <div class="spec-tile">
            <span>${k.charAt(0).toUpperCase() + k.slice(1)}</span>
            <strong>${v}</strong>
        </div>`).join('');

    document.getElementById('productDetail').innerHTML = `
        <div class="product-hero-gallery product-gallery-sticky">
            <div class="gallery-kicker">Piece certifiee</div>
            <div class="main-image">
                <img src="${product.images[0]}" alt="${product.name}" id="mainImg">
            </div>
            <div class="thumb-images" role="list">
                ${product.images.map((img, i) => `
                    <img src="${img}" alt="" class="${i === 0 ? 'active' : ''}" role="listitem" tabindex="0"
                         data-full="${img}" aria-label="Vue ${i + 1}">`).join('')}
            </div>
        </div>
        <div class="product-luxury-info product-detail-info">
            <span class="product-luxury-eyebrow">${product.brand}</span>
            <h1 class="product-luxury-title">${product.name}</h1>
            <div class="product-rating">
                ${getStarsHTML(product.rating)}
                <span class="text-muted">(${product.reviews} avis verifies)</span>
            </div>
            <div class="product-luxury-price-block">
                <div>
                    <span class="product-luxury-price">${formatPrice(product.price)}</span>
                    <span class="price-note">Reservation securisee, sans pression d'achat</span>
                </div>
                <div class="price-support">
                    ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                    ${discount ? `<span class="discount-pct">-${discount}%</span>` : ''}
                </div>
            </div>
            <p class="product-luxury-story">${product.description}</p>
            <p class="product-luxury-story text-muted">Piece selectionnee par nos maitres horlogers. Livree dans un ecrin signature, avec certificat d'authenticite et garantie internationale de 2 ans.</p>
            <div class="product-signature-grid" aria-label="Services inclus">
                <div><i class="fas fa-certificate"></i><strong>Authenticite</strong><span>Controle avant expedition</span></div>
                <div><i class="fas fa-handshake"></i><strong>Concierge</strong><span>Conseil personnalise</span></div>
                <div><i class="fas fa-box-open"></i><strong>Ecrin</strong><span>Presentation premium</span></div>
            </div>
            <div class="product-craft lux-card">
                <span class="lw-eyebrow">Savoir-faire</span>
                <p>Chaque detail, du boitier au bracelet, est controle pour offrir une experience digne des plus grandes maisons horlogeres. Reservation securisee, accompagnement personnalise, livraison premium au Maroc.</p>
            </div>
            <div class="spec-tile-grid" aria-label="Specifications principales">${specsGridHtml}</div>
            <div class="product-luxury-specs product-meta-list">${specsHtml}</div>
            <div class="reserve-path" aria-label="Processus de reservation">
                <div><span>01</span><strong>Reservation</strong><small>Votre montre est mise de cote.</small></div>
                <div><span>02</span><strong>Validation</strong><small>Un conseiller confirme les details.</small></div>
                <div><span>03</span><strong>Livraison</strong><small>Expedition premium 24-48h.</small></div>
            </div>
            <div class="stock-badge"><i class="fas fa-circle stock-badge__dot"></i> Disponible - Livraison 24-48h au Maroc</div>
            <div class="quantity-selector-detail">
                <span class="qty-label">Quantite</span>
                <button type="button" class="cart-qty-btn" id="qtyMinus" aria-label="Moins">-</button>
                <input type="number" class="qty-input" value="1" min="1" id="detailQty" aria-label="Quantite">
                <button type="button" class="cart-qty-btn" id="qtyPlus" aria-label="Plus">+</button>
            </div>
            <div class="product-luxury-actions detail-actions">
                <button type="button" class="btn btn-reserve btn-lg" id="reserveBtn">
                    <i class="fas fa-gem"></i> Reserver cette montre
                </button>
                <button type="button" class="btn btn-outline-gold btn-lg" id="wishlistBtn">
                    <i class="fas fa-heart"></i> ${inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </button>
                <button type="button" class="btn btn-ghost" onclick="addToCart(${product.id}, parseInt(document.getElementById('detailQty').value, 10));">
                    <i class="fas fa-shopping-bag"></i> Ajouter au panier
                </button>
            </div>
            <div class="detail-trust">
                <div class="trust-item"><i class="fas fa-truck"></i> Livraison premium</div>
                <div class="trust-item"><i class="fas fa-shield-alt"></i> Garantie 2 ans</div>
                <div class="trust-item"><i class="fas fa-undo"></i> Retour 14 jours</div>
                <div class="trust-item"><i class="fas fa-certificate"></i> Authenticite garantie</div>
            </div>
        </div>`;

    const bar = document.getElementById('productStickyBar');
    if (bar) {
        bar.innerHTML = `
            <span class="product-sticky-bar__price">${formatPrice(product.price)}</span>
            <button type="button" class="btn btn-reserve" id="reserveBtnSticky">
                Reserver
            </button>`;
    }

    document.querySelectorAll('.thumb-images img').forEach(thumb => {
        thumb.addEventListener('click', () => {
            document.getElementById('mainImg').src = thumb.dataset.full;
            document.querySelectorAll('.thumb-images img').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
        thumb.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                thumb.click();
            }
        });
    });

    const qtyInput = document.getElementById('detailQty');
    document.getElementById('qtyMinus')?.addEventListener('click', () => {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
    });
    document.getElementById('qtyPlus')?.addEventListener('click', () => {
        qtyInput.value = parseInt(qtyInput.value, 10) + 1;
    });

    function reserve() {
        const qty = parseInt(qtyInput.value, 10) || 1;
        addToCart(product.id, qty);
        window.location.href = 'checkout.html?flow=reserve';
    }

    document.getElementById('reserveBtn')?.addEventListener('click', reserve);
    document.getElementById('reserveBtnSticky')?.addEventListener('click', reserve);

    document.getElementById('wishlistBtn')?.addEventListener('click', function () {
        toggleWishlist(product.id);
        const on = getWishlist().includes(product.id);
        this.innerHTML = `<i class="fas fa-heart"></i> ${on ? 'Retirer des favoris' : 'Ajouter aux favoris'}`;
        this.classList.toggle('btn-primary', on);
        this.classList.toggle('btn-outline-gold', !on);
    });

    document.getElementById('tabDescription').innerHTML = `
        <p>${product.description}</p>
        <p class="text-muted">Chaque montre LuxWatch est controlee, certifiee et preparee avec soin avant expedition.</p>
        <div class="reserve-path reserve-path--inline">
            <div><span>01</span><strong>Selection</strong><small>Piece inspectee.</small></div>
            <div><span>02</span><strong>Reservation</strong><small>Conseiller dedie.</small></div>
            <div><span>03</span><strong>Remise</strong><small>Livraison soignee.</small></div>
        </div>`;

    document.getElementById('tabSpecs').innerHTML = `
        <table class="specs-table">
            ${Object.entries(product.specs).map(([k, v]) =>
                `<tr><td>${k.charAt(0).toUpperCase() + k.slice(1)}</td><td>${v}</td></tr>`
            ).join('')}
        </table>`;

    const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    document.getElementById('relatedProducts').innerHTML = related.length
        ? related.map(p => createProductCard(p)).join('')
        : '<p class="text-muted">Decouvrez d\'autres pieces dans notre boutique.</p>';
}

function initProductPage() {
    const grid = document.getElementById('productDetail');
    if (!grid) return;

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const id = parseInt(params.get('id'), 10);
    const product = PRODUCTS.find(p => p.id === id);

    if (!product) {
        grid.innerHTML = `
            <div class="lux-state" style="grid-column:1/-1">
                <div class="lux-state__icon"><i class="fas fa-clock"></i></div>
                <h3>Produit introuvable</h3>
                <p>Cette reference n'est plus disponible dans notre catalogue.</p>
                <a href="shop.html" class="btn btn-primary">Explorer la boutique</a>
            </div>`;
        return;
    }

    document.title = product.name + ' - LuxWatch Maroc';
    const titleEl = document.getElementById('productTitle');
    if (titleEl) titleEl.textContent = product.name;
    const crumb = document.getElementById('breadcrumbName');
    if (crumb) crumb.textContent = product.name;

    renderLuxuryProduct(product);
}

document.addEventListener('DOMContentLoaded', initProductPage);
