/* ============================================
   LuxWatch Maroc – Shared Header & Footer
   Inject these into every page for consistency.
   ============================================ */

(function () {
    // ── detect active page ──────────────────────────────────────────────
    const path = window.location.pathname.split('/').pop() || 'index.html';

    function isActive(page) {
        if (page === 'index.html' && (path === '' || path === 'index.html')) return 'active';
        if (page !== 'index.html' && path === page) return 'active';
        return '';
    }

    const socialLinksHTML = (theme = 'dark') => `
    <div class="social-block social-block--${theme}">
        <span class="social-block__label">Suivez-nous</span>
        <div class="social-links" role="list">
            <a href="https://www.instagram.com/luxwatchmaroc" class="social-link social-link--instagram" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="Instagram — @luxwatchmaroc">
                <i class="fab fa-instagram" aria-hidden="true"></i>
            </a>
            <a href="https://www.facebook.com/luxwatchmaroc" class="social-link social-link--facebook" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="Facebook — LuxWatch Maroc">
                <i class="fab fa-facebook-f" aria-hidden="true"></i>
            </a>
            <a href="https://www.tiktok.com/@luxwatchmaroc" class="social-link social-link--tiktok" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="TikTok — @luxwatchmaroc">
                <i class="fab fa-tiktok" aria-hidden="true"></i>
            </a>
            <a href="https://wa.me/212600000000" class="social-link social-link--whatsapp" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="WhatsApp — +212 600 000 000">
                <i class="fab fa-whatsapp" aria-hidden="true"></i>
            </a>
        </div>
    </div>`;

    // ── header HTML ─────────────────────────────────────────────────────
    const headerHTML = `
    <div class="top-bar">
        <div class="container">
            <div class="top-bar-content">
                <span><i class="fas fa-truck"></i>&nbsp; Livraison gratuite à partir de 500 MAD</span>
                <span><i class="fas fa-shield-alt"></i>&nbsp; Garantie 2 ans sur toutes nos montres</span>
                <span><i class="fas fa-undo"></i>&nbsp; Retour gratuit sous 14 jours</span>
            </div>
        </div>
    </div>

    <header class="header" id="header">
        <div class="container">
            <div class="header-inner">
                <a href="index.html" class="logo">
                    <i class="fas fa-clock"></i>
                    <span>Lux<strong>Watch</strong></span>
                </a>

                <nav class="nav" id="nav">
                    <a href="index.html" class="${isActive('index.html')}">Accueil</a>
                    <a href="shop.html" class="${isActive('shop.html')}">Boutique</a>
                    <div class="nav-dropdown">
                        <a href="#">Collections <i class="fas fa-chevron-down"></i></a>
                        <div class="dropdown-menu">
                            <a href="shop.html?cat=homme"><i class="fas fa-male"></i> Homme</a>
                            <a href="shop.html?cat=femme"><i class="fas fa-female"></i> Femme</a>
                            <a href="shop.html?cat=sport"><i class="fas fa-running"></i> Sport</a>
                            <a href="shop.html?cat=classique"><i class="fas fa-clock"></i> Classique</a>
                            <a href="shop.html?cat=smart"><i class="fas fa-mobile-alt"></i> Smart Watch</a>
                        </div>
                    </div>
                    <a href="about.html" class="${isActive('about.html')}">À Propos</a>
                    <a href="contact.html" class="${isActive('contact.html')}">Contact</a>
                </nav>

                <div class="header-actions">
                    <button class="header-icon-btn search-btn" id="searchBtn" aria-label="Rechercher">
                        <i class="fas fa-search"></i>
                    </button>
                    <a href="wishlist.html" class="header-icon-btn" aria-label="Favoris">
                        <i class="fas fa-heart"></i>
                        <span class="badge" id="wishlistCount">0</span>
                    </a>
                    <a href="cart.html" class="header-icon-btn" aria-label="Panier">
                        <i class="fas fa-shopping-bag"></i>
                        <span class="badge" id="cartCount">0</span>
                    </a>
                    <button class="menu-toggle" id="menuToggle" aria-label="Menu">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <div class="search-overlay" id="searchOverlay">
        <div class="search-overlay-content">
            <button class="search-close" id="searchClose" aria-label="Fermer"><i class="fas fa-times"></i></button>
            <p class="search-hint">Tapez pour rechercher une montre…</p>
            <div class="search-input-wrap">
                <input type="text" placeholder="Ex: Chronographe, Sport, Femme…" id="searchInput" autocomplete="off">
                <button aria-label="Rechercher"><i class="fas fa-search"></i></button>
            </div>
        </div>
    </div>`;

    // ── footer HTML ─────────────────────────────────────────────────────
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col footer-brand">
                    <a href="index.html" class="footer-logo">
                        <i class="fas fa-clock"></i>
                        <span>Lux<strong>Watch</strong></span>
                    </a>
                    <p>Votre destination montres de luxe au Maroc. Qualité, élégance et service irréprochable depuis 2018.</p>
                    ${socialLinksHTML('dark')}
                </div>

                <div class="footer-col">
                    <h4>Navigation</h4>
                    <a href="index.html">Accueil</a>
                    <a href="shop.html">Boutique</a>
                    <a href="about.html">À Propos</a>
                    <a href="contact.html">Contact</a>
                    <a href="faq.html">FAQ</a>
                </div>

                <div class="footer-col">
                    <h4>Collections</h4>
                    <a href="shop.html?cat=homme">Montres Homme</a>
                    <a href="shop.html?cat=femme">Montres Femme</a>
                    <a href="shop.html?cat=sport">Montres Sport</a>
                    <a href="shop.html?cat=classique">Classique</a>
                    <a href="shop.html?cat=smart">Smart Watch</a>
                </div>

                <div class="footer-col">
                    <h4>Contact &amp; Aide</h4>
                    <div class="footer-contact-items">
                        <a href="https://wa.me/212600000000" target="_blank" rel="noopener" class="footer-contact-link">
                            <i class="fab fa-whatsapp"></i>
                            <span>WhatsApp</span>
                        </a>
                        <a href="mailto:contact@luxwatchmaroc.ma" class="footer-contact-link">
                            <i class="fas fa-envelope"></i>
                            <span>contact@luxwatchmaroc.ma</span>
                        </a>
                        <div class="footer-contact-link">
                            <i class="fas fa-clock"></i>
                            <span>Lun – Sam : 9h – 20h</span>
                        </div>
                        <div class="footer-contact-link">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Casablanca, Maroc</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2026 LuxWatch Maroc. Tous droits réservés.</p>
                <div class="footer-legal">
                    <a href="privacy.html">Confidentialité</a>
                    <a href="terms.html">CGV</a>
                    <a href="returns.html">Retours</a>
                </div>
                <div class="footer-payments">
                    <span>Paiement :</span>
                    <span class="payment-chip"><i class="fas fa-money-bill-wave"></i> Cash livraison</span>
                    <span class="payment-chip"><i class="fas fa-credit-card"></i> Carte</span>
                    <span class="payment-chip"><i class="fas fa-university"></i> Virement</span>
                </div>
            </div>
        </div>
    </footer>

    <a href="https://wa.me/212600000000" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Contactez-nous sur WhatsApp">
        <i class="fab fa-whatsapp"></i>
    </a>

    <button class="back-to-top" id="backToTop" aria-label="Haut de page">
        <i class="fas fa-chevron-up"></i>
    </button>`;

    // ── quick-view modal + toast (shared UI) ────────────────────────────
    const sharedUI = `
    <div class="modal" id="quickViewModal" role="dialog" aria-modal="true">
        <div class="modal-content">
            <button class="modal-close" id="modalClose" aria-label="Fermer"><i class="fas fa-times"></i></button>
            <div class="quick-view-body" id="quickViewBody"></div>
        </div>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite">
        <i class="fas fa-check-circle"></i>
        <span id="toastMessage"></span>
    </div>
    <div class="nav-overlay" id="navOverlay"></div>

    <nav class="tab-bar" id="tabBar" aria-label="Navigation principale">
        <div class="tab-bar-inner">
            <a href="index.html" class="tab-item ${isActive('index.html')}" aria-label="Accueil">
                <i class="fas fa-home"></i>
                <span>Accueil</span>
            </a>
            <a href="shop.html" class="tab-item ${isActive('shop.html')}" aria-label="Boutique">
                <i class="fas fa-store"></i>
                <span>Boutique</span>
            </a>
            <button class="tab-item tab-search-trigger" id="tabSearchBtn" aria-label="Rechercher">
                <i class="fas fa-search"></i>
                <span>Rechercher</span>
            </button>
            <a href="cart.html" class="tab-item ${isActive('cart.html')}" aria-label="Panier">
                <i class="fas fa-shopping-bag"></i>
                <span class="tab-badge" id="tabCartBadge" style="display:none">0</span>
                <span>Panier</span>
            </a>
            <a href="account.html" class="tab-item ${isActive('account.html')}" aria-label="Compte">
                <i class="fas fa-user"></i>
                <span>Compte</span>
            </a>
        </div>
    </nav>`;

    // ── inject ───────────────────────────────────────────────────────────
    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');
    const uiEl = document.getElementById('site-ui');

    if (headerEl) headerEl.innerHTML = headerHTML;
    if (footerEl) footerEl.innerHTML = footerHTML;
    if (uiEl) uiEl.innerHTML = sharedUI;

    const contactSocial = document.getElementById('contact-social');
    if (contactSocial) contactSocial.innerHTML = socialLinksHTML('light');
})();
