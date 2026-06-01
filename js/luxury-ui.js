/* ============================================================
   LuxWatch — Luxury UI: Shell, Transitions, Micro-Interactions
   ============================================================ */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const body = document.body;

        // ── Page enter animation ───────────────────────────────────
        body.style.opacity = '0';
        requestAnimationFrame(() => {
            body.style.transition = 'opacity 0.32s ease';
            body.style.opacity = '1';
        });

        // ── Make all modals sheet-modals on mobile ─────────────────
        if (window.matchMedia('(max-width: 768px)').matches) {
            document.querySelectorAll('.modal').forEach(modal => {
                if (!modal.classList.contains('sheet-modal')) {
                    modal.classList.add('sheet-modal');
                }
            });
        }

        // ── Smooth page transitions ────────────────────────────────
        document.querySelectorAll('a[href]').forEach(function (link) {
            const href = link.getAttribute('href');
            if (!href) return;
            if (href.startsWith('#') || href.startsWith('http') ||
                href.startsWith('mailto') || href.startsWith('tel') ||
                href.startsWith('javascript') || link.target === '_blank') return;
            if (href.endsWith('.html') || href.includes('.html?')) {
                link.addEventListener('click', function (e) {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    const dest = link.href;
                    body.style.transition = 'opacity 0.20s ease';
                    body.style.opacity = '0';
                    setTimeout(function () {
                        window.location.href = dest;
                    }, 185);
                });
            }
        });

        // ── Touch press feedback on product cards ──────────────────
        if ('ontouchstart' in window) {
            document.querySelectorAll('.product-card, .category-card, .brand-card').forEach(function (el) {
                el.setAttribute('data-pressable', '');
            });
        }

        // ── Lazy image fade-in ─────────────────────────────────────
        if ('IntersectionObserver' in window) {
            const imgObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.transition = 'opacity 0.4s ease';
                        entry.target.style.opacity = '1';
                        imgObserver.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '50px' });

            document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
                img.style.opacity = '0';
                imgObserver.observe(img);
                img.addEventListener('load', function () {
                    img.style.opacity = '1';
                });
            });
        }
    });
})();
