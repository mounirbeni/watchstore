/* LuxWatch — App shell, transitions, sheet modals */
(function () {
    const html = document.documentElement;
    html.classList.add('lw-app');

    document.addEventListener('DOMContentLoaded', () => {
        const body = document.body;
        body.classList.add('app-shell', 'page-enter');
        if (document.getElementById('tabBar') && window.matchMedia('(max-width: 768px)').matches) {
            body.classList.add('has-tab-bar');
        }

        document.querySelectorAll('.modal').forEach(modal => {
            if (!modal.classList.contains('sheet-modal')) modal.classList.add('sheet-modal');
        });

        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('javascript') || link.target === '_blank') return;
            if (href.endsWith('.html') || href.includes('.html?')) {
                link.addEventListener('click', e => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    body.classList.add('is-transitioning');
                    body.style.opacity = '0';
                    body.style.transition = 'opacity 0.22s ease';
                    setTimeout(() => { window.location.href = link.href; }, 200);
                });
            }
        });
    });
})();
