/* LuxWatch - multi-step checkout / reservation */
const CHECKOUT_STEPS = [
    { id: 'discover', label: 'Discover', completed: true },
    { id: 'details', label: 'Details', completed: true },
    { id: 'review', label: 'Reservation' },
    { id: 'info', label: 'Information' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirm', label: 'Confirmation' },
    { id: 'tracking', label: 'Tracking', upcoming: true }
];

let checkoutStep = 0;
let orderRef = '';

function renderCheckoutProgress() {
    const el = document.getElementById('checkoutProgress');
    if (!el) return;
    const journeyIndex = checkoutStep + 2;
    el.innerHTML = CHECKOUT_STEPS.map((step, i) => `
        <div class="checkout-progress__step ${i < journeyIndex || step.completed ? 'is-done' : ''} ${i === journeyIndex ? 'is-active' : ''} ${step.upcoming ? 'is-upcoming' : ''}" data-step="${i}">
            <span class="checkout-progress__dot">${i < journeyIndex || step.completed ? '<i class="fas fa-check"></i>' : i + 1}</span>
            <span class="checkout-progress__label">${step.label}</span>
        </div>`).join('');
}

function showStep(index) {
    checkoutStep = index;
    renderCheckoutProgress();
    document.querySelectorAll('.checkout-step-panel').forEach((panel, i) => {
        panel.classList.toggle('is-active', i === index);
    });
    const backBtn = document.getElementById('checkoutBack');
    const nextBtn = document.getElementById('checkoutNext');
    if (backBtn) backBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    if (nextBtn) {
        nextBtn.innerHTML = index === 2
            ? '<i class="fas fa-lock"></i> Confirmer'
            : 'Continuer <i class="fas fa-arrow-right"></i>';
    }
    hideCheckoutNavOnSuccess(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(index) {
    const form = document.getElementById('checkoutForm');
    if (!form) return true;
    let valid = true;

    if (index === 1) {
        form.querySelectorAll('[data-required-step="1"]').forEach(field => {
            const wrap = field.closest('.lux-field');
            const empty = !field.value.trim();
            wrap?.classList.toggle('is-error', empty);
            if (empty) valid = false;
        });
        const phone = form.querySelector('[name="phone"]');
        if (phone && phone.value.trim().length < 9) {
            phone.closest('.lux-field')?.classList.add('is-error');
            valid = false;
        }
    }

    if (index === 2) {
        form.querySelectorAll('[data-required-step="2"]').forEach(field => {
            const wrap = field.closest('.lux-field');
            const empty = !field.value.trim();
            wrap?.classList.toggle('is-error', empty);
            if (empty) valid = false;
        });
        const city = form.querySelector('[name="city"]');
        if (city && !city.value) {
            city.closest('.lux-field')?.classList.add('is-error');
            valid = false;
        }
    }

    return valid;
}

function hideCheckoutNavOnSuccess(index) {
    const nav = document.getElementById('checkoutNav');
    const aside = document.querySelector('.checkout-summary-sticky');
    if (nav) nav.style.display = index === 3 ? 'none' : 'flex';
    if (aside) aside.style.display = index === 3 ? 'none' : '';
}

function renderOrderSummary() {
    const items = getCart();
    if (!items.length) {
        const formWrap = document.getElementById('checkoutFormWrap');
        if (formWrap) {
            formWrap.innerHTML = `
                <div class="lux-state lux-card" style="grid-column:1/-1">
                    <div class="lux-state__icon"><i class="fas fa-shopping-bag"></i></div>
                    <h3>Aucune montre reservee</h3>
                    <p>Explorez la collection et choisissez une piece avant de demarrer la reservation.</p>
                    <a href="shop.html" class="btn btn-primary">Decouvrir les montres</a>
                </div>`;
        }
        return false;
    }

    let subtotal = 0;
    let rows = '';
    items.forEach(item => {
        const p = PRODUCTS.find(x => x.id === item.id);
        if (!p) return;
        const line = p.price * item.qty;
        subtotal += line;
        rows += `
            <div class="order-item">
                <img src="${p.image}" alt="${p.name}">
                <div class="order-item-info"><h4>${p.name}</h4><span>Qte ${item.qty}</span></div>
                <span class="order-item-price">${formatPrice(line)}</span>
            </div>`;
    });

    const shipping = subtotal >= 500 ? 0 : 30;
    const total = subtotal + shipping;
    const freeLabel = shipping === 0 ? '<strong class="text-gold">Gratuite</strong>' : formatPrice(shipping);

    const itemsEl = document.getElementById('orderItems');
    const totalsEl = document.getElementById('orderTotals');
    if (itemsEl) itemsEl.innerHTML = rows;
    if (totalsEl) {
        totalsEl.innerHTML = `
            <div class="summary-row" style="margin-top:16px;"><span>Sous-total</span><span>${formatPrice(subtotal)}</span></div>
            <div class="summary-row"><span>Livraison</span><span>${freeLabel}</span></div>
            <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
            <div class="summary-assurance"><i class="fas fa-shield-alt"></i> Paiement protege. Confirmation par conseiller avant expedition.</div>`;
    }

    const reviewEl = document.getElementById('stepReviewItems');
    if (reviewEl) reviewEl.innerHTML = rows;
    return true;
}

function submitOrder() {
    const loading = document.getElementById('checkoutLoading');
    const formWrap = document.getElementById('checkoutFormWrap');
    loading?.classList.add('is-visible');
    formWrap?.setAttribute('aria-busy', 'true');

    setTimeout(() => {
        orderRef = 'LW-' + Date.now().toString().slice(-8);
        localStorage.setItem('lastOrderRef', orderRef);
        localStorage.removeItem('cart');
        updateCartCount();
        loading?.classList.remove('is-visible');
        formWrap?.removeAttribute('aria-busy');

        document.getElementById('orderRefDisplay').textContent = orderRef;
        showStep(3);

        const trackLink = document.getElementById('trackingLink');
        if (trackLink) trackLink.href = 'order-tracking.html?ref=' + encodeURIComponent(orderRef);
    }, 1200);
}

function selectPayment(el) {
    document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
}

function initCheckoutFlow() {
    const form = document.getElementById('checkoutForm');
    renderCheckoutProgress();
    if (!form) return;

    const hasItems = renderOrderSummary();
    if (!hasItems) return;
    showStep(0);

    const sel = document.getElementById('citySelect');
    if (sel && typeof MOROCCAN_CITIES !== 'undefined') {
        MOROCCAN_CITIES.forEach(c => {
            const o = document.createElement('option');
            o.value = o.textContent = c;
            sel.appendChild(o);
        });
    }

    document.getElementById('checkoutBack')?.addEventListener('click', () => {
        if (checkoutStep > 0) showStep(checkoutStep - 1);
    });

    document.getElementById('checkoutNext')?.addEventListener('click', () => {
        if (!validateStep(checkoutStep)) {
            showToast('Veuillez completer les champs requis.');
            return;
        }
        if (checkoutStep === 2) {
            submitOrder();
            return;
        }
        showStep(checkoutStep + 1);
    });

    form.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', () => {
            field.closest('.lux-field')?.classList.remove('is-error');
        });
        field.addEventListener('change', () => {
            field.closest('.lux-field')?.classList.remove('is-error');
        });
    });
}

document.addEventListener('DOMContentLoaded', initCheckoutFlow);
