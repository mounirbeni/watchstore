/* LuxWatch — App shell, transitions, sheet modals, micro-interactions */
(function () {
    document.documentElement.classList.add('lw-app');

    document.addEventListener('DOMContentLoaded', () => {
        const body = document.body;
        body.classList.add('app-shell', 'page-enter');

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (document.getElementById('tabBar') && isMobile) {
            body.classList.add('has-tab-bar');
        }

        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('sheet-modal');
        });

        document.querySelectorAll('[data-pressable], .btn, .product-card, .tab-item, .brand-card, .account-nav__item').forEach(el => {
            el.addEventListener('touchstart', () => el.classList.add('is-pressed'), { passive: true });
            el.addEventListener('touchend', () => el.classList.remove('is-pressed'), { passive: true });
            el.addEventListener('touchcancel', () => el.classList.remove('is-pressed'), { passive: true });
        });

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReduced) {
            document.querySelectorAll('a[href]').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') ||
                    href.startsWith('tel') || href.startsWith('javascript') || link.target === '_blank') return;
                if (!href.includes('.html')) return;
                link.addEventListener('click', e => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    body.classList.add('is-transitioning');
                    body.style.opacity = '0';
                    body.style.transition = 'opacity 0.2s ease';
                    setTimeout(() => { window.location.href = link.href; }, 180);
                });
            });
        }

        document.querySelectorAll('.horizontal-scroll, .categories-scroll, .thumb-images').forEach(el => {
            el.style.webkitOverflowScrolling = 'touch';
        });
    });
})();
