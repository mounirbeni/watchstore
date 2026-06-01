/* ============================================
   LuxWatch Maroc – App Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initHeroSlider();
    initFeaturedProducts();
    initNewArrivals();
    initCountdown();
    initSearch();
    initModal();
    initBackToTop();
    initNewsletter();
    initMobileNav();
    initFAQ();
    initProductTabs();
    initTabBar();
});

/* ── Header scroll ─────────────────────────── */
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── Hero Slider ───────────────────────────── */
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots   = document.querySelectorAll('.dot');
    if (!slides.length) return;

    let current = 0;
    let timer;

    function goTo(idx) {
        slides[current].classList.remove('active');
        if (dots[current]) dots[current].classList.remove('active');
        current = (idx + slides.length) % slides.length;
        slides[current].classList.add('active');
        if (dots[current]) dots[current].classList.add('active');
    }

    const start = () => { timer = setInterval(() => goTo(current + 1), 5500); };
    const stop  = () => clearInterval(timer);

    document.querySelector('.hero-prev')?.addEventListener('click', () => { stop(); goTo(current - 1); start(); });
    document.querySelector('.hero-next')?.addEventListener('click', () => { stop(); goTo(current + 1); start(); });
    dots.forEach(d => d.addEventListener('click', () => { stop(); goTo(+d.dataset.slide); start(); }));

    start();
}

/* ── Featured Products ─────────────────────── */
function initFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    const tabs = document.querySelectorAll('.section-featured .tab-btn');

    function setActiveTab(activeBtn) {
        tabs.forEach(b => {
            const on = b === activeBtn;
            b.classList.toggle('active', on);
            b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
    }

    function render(cat = 'all') {
        const list = cat === 'all'
            ? PRODUCTS.slice(0, 8)
            : PRODUCTS.filter(p => p.category === cat).slice(0, 8);
        container.innerHTML = list.length
            ? list.map(p => createProductCard(p)).join('')
            : '<div class="empty-state"><i class="fas fa-clock"></i><p>Aucun produit dans cette catégorie.</p></div>';
    }

    function switchTab(btn) {
        if (btn.classList.contains('active')) return;
        setActiveTab(btn);
        container.classList.add('is-updating');
        window.setTimeout(() => {
            render(btn.dataset.tab);
            container.classList.remove('is-updating');
        }, 160);
    }

    tabs.forEach(btn => btn.addEventListener('click', () => switchTab(btn)));

    render();
}

/* ── New Arrivals ──────────────────────────── */
function initNewArrivals() {
    const container = document.getElementById('newArrivals');
    if (!container) return;
    const newOnes = PRODUCTS.filter(p => p.isNew).slice(0, 4);
    container.innerHTML = newOnes.map(p => createProductCard(p)).join('');
}

/* ── Countdown ─────────────────────────────── */
function initCountdown() {
    const banner = document.getElementById('promoBanner');
    const daysEl    = document.getElementById('days');
    const hoursEl   = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    if (!daysEl) return;

    // Offer valid until Dec 31 2026
    const endDate = new Date('2026-12-31T23:59:59');

    function tick() {
        const diff = endDate - Date.now();

        if (diff <= 0) {
            // Hide countdown, show expired message instead
            const cd = document.getElementById('countdown');
            if (cd) {
                cd.innerHTML = '<p class="promo-expired">Cette offre est terminée. Consultez nos promotions actuelles.</p>';
            }
            return;
        }

        const d = Math.floor(diff / 864e5);
        const h = Math.floor((diff % 864e5) / 36e5);
        const m = Math.floor((diff % 36e5) / 6e4);
        const s = Math.floor((diff % 6e4) / 1e3);

        daysEl.textContent    = String(d).padStart(2, '0');
        hoursEl.textContent   = String(h).padStart(2, '0');
        minutesEl.textContent = String(m).padStart(2, '0');
        secondsEl.textContent = String(s).padStart(2, '0');
    }

    tick();
    setInterval(tick, 1000);
}

/* ── Search ────────────────────────────────── */
function initSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input   = document.getElementById('searchInput');
    if (!overlay) return;

    document.getElementById('searchBtn')?.addEventListener('click', () => {
        overlay.classList.add('active');
        setTimeout(() => input?.focus(), 200);
    });

    document.getElementById('searchClose')?.addEventListener('click', closeSearch);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

    input?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const q = input.value.trim();
            if (q) window.location.href = `shop.html#search=${encodeURIComponent(q)}`;
        }
    });

    function closeSearch() { overlay.classList.remove('active'); }
}

/* ── Modal / Quick View ────────────────────── */
function initModal() {
    const modal = document.getElementById('quickViewModal');
    if (!modal) return;
    document.getElementById('modalClose')?.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('active'); });
}

/* ── Back to Top ───────────────────────────── */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Newsletter ────────────────────────────── */
function initNewsletter() {
    document.getElementById('newsletterForm')?.addEventListener('submit', e => {
        e.preventDefault();
        showToast('Merci pour votre inscription !');
        e.target.reset();
    });
}

/* ── Mobile Nav ────────────────────────────── */
function initMobileNav() {
    const toggle  = document.getElementById('menuToggle');
    const nav     = document.getElementById('nav');
    const overlay = document.getElementById('navOverlay');
    if (!toggle || !nav) return;

    function open() {
        nav.classList.add('active');
        toggle.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function close() {
        nav.classList.remove('active');
        toggle.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => nav.classList.contains('active') ? close() : open());
    overlay?.addEventListener('click', close);

    nav.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768 && !link.parentElement?.classList.contains('nav-dropdown')) {
                close();
            }
        });
    });

    // Mobile dropdowns
    document.querySelectorAll('.nav-dropdown > a').forEach(link => {
        link.addEventListener('click', e => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                link.parentElement.classList.toggle('open');
            }
        });
    });
}

/* ── FAQ ───────────────────────────────────── */
function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.closest('.faq-item');
            const wasOpen = item.classList.contains('active');
            document.querySelectorAll('.faq-item.active').forEach(i => i.classList.remove('active'));
            if (!wasOpen) item.classList.add('active');
        });
    });
}

/* ── Product Page Tabs ─────────────────────── */
function initProductTabs() {
    document.querySelectorAll('.product-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.product-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.product-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tab)?.classList.add('active');
        });
    });
}

/* ── iOS Tab Bar ───────────────────────────── */
function initTabBar() {
    // Sync cart badge to tab bar badge
    function syncTabBadge() {
        const tabBadge = document.getElementById('tabCartBadge');
        if (!tabBadge) return;
        const count = parseInt(document.getElementById('cartCount')?.textContent || '0', 10);
        tabBadge.textContent = count;
        tabBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    // Observe cart count changes
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        new MutationObserver(syncTabBadge).observe(cartCount, { childList: true, subtree: true, characterData: true });
    }
    syncTabBadge();

    // Tab bar search button — open the same search overlay
    document.getElementById('tabSearchBtn')?.addEventListener('click', () => {
        document.getElementById('searchBtn')?.click();
    });
}
