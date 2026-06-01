/* LuxWatch — Multi-step checkout / reservation */
const CHECKOUT_STEPS = [
    { id: 'review', label: 'Réservation' },
    { id: 'info', label: 'Coordonnées' },
    { id: 'payment', label: 'Paiement' },
    { id: 'confirm', label: 'Confirmation' }
];

let checkoutStep = 0;
let orderRef = '';

function renderCheckoutProgress() {
    const el = document.getElementById('checkoutProgress');
    if (!el) return;
    el.innerHTML = CHECKOUT_STEPS.map((step, i) => `
        <div class="checkout-progress__step ${i < checkoutStep ? 'is-done' : ''} ${i === checkoutStep ? 'is-active' : ''}" data-step="${i}">
            <span class="checkout-progress__dot">${i < checkoutStep ? '<i class="fas fa-check"></i>' : i + 1}</span>
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
        nextBtn.innerHTML = index === CHECKOUT_STEPS.length - 2
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
        window.location.href = 'cart.html';
        return;
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
                <div class="order-item-info"><h4>${p.name}</h4><span>Qté ${item.qty}</span></div>
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
            <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>`;
    }

    const reviewEl = document.getElementById('stepReviewItems');
    if (reviewEl) reviewEl.innerHTML = rows;
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
    if (!form) return;

    renderOrderSummary();
    renderCheckoutProgress();
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
            showToast('Veuillez compléter les champs requis.');
            return;
        }
        if (checkoutStep === CHECKOUT_STEPS.length - 2) {
            submitOrder();
            return;
        }
        showStep(checkoutStep + 1);
    });

    form.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', () => {
            field.closest('.lux-field')?.classList.remove('is-error');
        });
    });
}

document.addEventListener('DOMContentLoaded', initCheckoutFlow);
