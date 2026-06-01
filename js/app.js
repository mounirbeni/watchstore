/* ============================================
   Main Application JS
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
});

// Header scroll effect
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// Hero Slider
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');
    if (!slides.length) return;

    let current = 0;
    let interval;

    function goTo(index) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function startAuto() {
        interval = setInterval(() => goTo(current + 1), 5000);
    }

    function stopAuto() {
        clearInterval(interval);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            stopAuto();
            goTo(parseInt(dot.dataset.slide));
            startAuto();
        });
    });

    startAuto();
}

// Featured Products
function initFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    const tabBtns = document.querySelectorAll('.tab-btn');

    function renderProducts(category = 'all') {
        const filtered = category === 'all'
            ? PRODUCTS.slice(0, 8)
            : PRODUCTS.filter(p => p.category === category).slice(0, 8);

        container.innerHTML = filtered.map(p => createProductCard(p)).join('');
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(btn.dataset.tab);
        });
    });

    renderProducts();
}

// New Arrivals
function initNewArrivals() {
    const container = document.getElementById('newArrivals');
    if (!container) return;

    const newProducts = PRODUCTS.filter(p => p.isNew).slice(0, 4);
    container.innerHTML = newProducts.map(p => createProductCard(p)).join('');
}

// Countdown Timer
function initCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    if (!daysEl) return;

    const endDate = new Date('2026-06-30T23:59:59');

    function update() {
        const now = new Date();
        const diff = endDate - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

// Search
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');

    if (!searchBtn || !searchOverlay) return;

    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput && searchInput.focus(), 300);
    });

    if (searchClose) {
        searchClose.addEventListener('click', () => searchOverlay.classList.remove('active'));
    }

    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) searchOverlay.classList.remove('active');
    });

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }
}

// Modal
function initModal() {
    const modal = document.getElementById('quickViewModal');
    const closeBtn = document.getElementById('modalClose');
    if (!modal) return;

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.classList.remove('active');
    });
}

// Back to Top
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Newsletter
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Merci pour votre inscription !');
        form.reset();
    });
}

// Mobile Navigation
function initMobileNav() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    overlay.addEventListener('click', () => {
        nav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Mobile dropdowns
    document.querySelectorAll('.nav-dropdown > a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                link.parentElement.classList.toggle('open');
            }
        });
    });
}

// FAQ
function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const wasActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!wasActive) item.classList.add('active');
        });
    });
}

// Product Tabs (detail page)
function initProductTabs() {
    document.querySelectorAll('.product-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.product-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.product-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const content = document.getElementById(tab);
            if (content) content.classList.add('active');
        });
    });
}
