/* ============================================================
   LuxWatch — Shared Header, Footer & UI Components
   ============================================================ */

(function () {
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
            <a href="https://www.instagram.com/luxwatchmaroc" class="social-link" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="Instagram">
                <i class="fab fa-instagram" aria-hidden="true"></i>
            </a>
            <a href="https://www.facebook.com/luxwatchmaroc" class="social-link" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="Facebook">
                <i class="fab fa-facebook-f" aria-hidden="true"></i>
            </a>
            <a href="https://www.tiktok.com/@luxwatchmaroc" class="social-link" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="TikTok">
                <i class="fab fa-tiktok" aria-hidden="true"></i>
            </a>
            <a href="https://wa.me/212600000000" class="social-link" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="WhatsApp">
                <i class="fab fa-whatsapp" aria-hidden="true"></i>
            </a>
        </div>
    </div>`;

    // ── Header ──────────────────────────────────────────────────
    const headerHTML = `
    <div class="top-bar">
        <div class="container">
            <div class="top-bar-content">
                <span><i class="fas fa-truck"></i> Livraison gratuite dès 500 MAD</span>
                <span><i class="fas fa-shield-alt"></i> Garantie 2 ans incluse</span>
                <span><i class="fas fa-undo"></i> Retour sous 14 jours</span>
            </div>
        </div>
    </div>

    <header class="header" id="header">
        <div class="container">
            <div class="header-inner">

                <a href="index.html" class="logo" aria-label="LuxWatch Maroc — Accueil">
                    <div class="logo-icon">
                        <i class="fas fa-clock" aria-hidden="true"></i>
                    </div>
                    <span class="logo-text">Lux<em>Watch</em></span>
                </a>

                <nav class="nav" id="nav" aria-label="Navigation principale">
                    <a href="index.html" class="${isActive('index.html')}">Accueil</a>
                    <a href="shop.html" class="${isActive('shop.html')}">Boutique</a>
                    <div class="nav-dropdown">
                        <a href="#" aria-haspopup="true" aria-expanded="false">Collections <i class="fas fa-chevron-down" aria-hidden="true"></i></a>
                        <div class="dropdown-menu" role="menu">
                            <a href="shop.html?cat=homme" role="menuitem"><i class="fas fa-male" aria-hidden="true"></i> Homme</a>
                            <a href="shop.html?cat=femme" role="menuitem"><i class="fas fa-female" aria-hidden="true"></i> Femme</a>
                            <a href="shop.html?cat=sport" role="menuitem"><i class="fas fa-running" aria-hidden="true"></i> Sport</a>
                            <a href="shop.html?cat=classique" role="menuitem"><i class="fas fa-clock" aria-hidden="true"></i> Classique</a>
                            <a href="shop.html?cat=smart" role="menuitem"><i class="fas fa-mobile-alt" aria-hidden="true"></i> Smart Watch</a>
                        </div>
                    </div>
                    <a href="about.html" class="${isActive('about.html')}">À Propos</a>
                    <a href="contact.html" class="${isActive('contact.html')}">Contact</a>
                </nav>

                <div class="header-actions">
                    <button class="header-icon-btn search-btn" id="searchBtn" aria-label="Rechercher" type="button">
                        <i class="fas fa-search" aria-hidden="true"></i>
                    </button>
                    <a href="wishlist.html" class="header-icon-btn" aria-label="Mes favoris">
                        <i class="fas fa-heart" aria-hidden="true"></i>
                        <span class="badge" id="wishlistCount" aria-label="0 articles en favoris">0</span>
                    </a>
                    <a href="cart.html" class="header-icon-btn" aria-label="Mon panier">
                        <i class="fas fa-shopping-bag" aria-hidden="true"></i>
                        <span class="badge" id="cartCount" aria-label="0 articles dans le panier">0</span>
                    </a>
                    <button class="menu-toggle" id="menuToggle" aria-label="Ouvrir le menu" aria-expanded="false" type="button">
                        <span></span><span></span><span></span>
                    </button>
                </div>

            </div>
        </div>
    </header>

    <div class="search-overlay" id="searchOverlay" role="dialog" aria-modal="true" aria-label="Recherche">
        <div class="search-overlay-content">
            <button class="search-close" id="searchClose" aria-label="Fermer la recherche" type="button">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
            <p class="search-hint">Rechercher une montre, une marque, une collection…</p>
            <div class="search-input-wrap">
                <input type="text" placeholder="Ex : Chronographe, Royal, Sport…" id="searchInput" autocomplete="off" aria-label="Terme de recherche">
                <button type="button" aria-label="Lancer la recherche">
                    <i class="fas fa-search" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    </div>`;

    // ── Footer ──────────────────────────────────────────────────
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col footer-brand">
                    <a href="index.html" class="footer-logo" aria-label="LuxWatch Maroc">
                        <div class="footer-logo-icon">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                        </div>
                        <span class="footer-logo-text">Lux<em>Watch</em></span>
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
                    <h4>Contact</h4>
                    <div class="footer-contact-items">
                        <a href="https://wa.me/212600000000" target="_blank" rel="noopener" class="footer-contact-link">
                            <i class="fab fa-whatsapp" aria-hidden="true"></i>
                            <span>WhatsApp</span>
                        </a>
                        <a href="mailto:contact@luxwatchmaroc.ma" class="footer-contact-link">
                            <i class="fas fa-envelope" aria-hidden="true"></i>
                            <span>contact@luxwatchmaroc.ma</span>
                        </a>
                        <div class="footer-contact-link">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            <span>Lun – Sam : 9h – 20h</span>
                        </div>
                        <div class="footer-contact-link">
                            <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                            <span>Casablanca, Maroc</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>© 2026 LuxWatch Maroc. Tous droits réservés.</p>
                <div class="footer-legal">
                    <a href="privacy.html">Confidentialité</a>
                    <a href="terms.html">CGV</a>
                    <a href="returns.html">Retours</a>
                </div>
                <div class="footer-payments">
                    <span>Paiement :</span>
                    <span class="payment-chip"><i class="fas fa-money-bill-wave" aria-hidden="true"></i> Cash</span>
                    <span class="payment-chip"><i class="fas fa-credit-card" aria-hidden="true"></i> Carte</span>
                    <span class="payment-chip"><i class="fas fa-university" aria-hidden="true"></i> Virement</span>
                </div>
            </div>
        </div>
    </footer>

    <a href="https://wa.me/212600000000" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Contactez-nous sur WhatsApp">
        <i class="fab fa-whatsapp" aria-hidden="true"></i>
    </a>

    <button class="back-to-top" id="backToTop" type="button" aria-label="Retour en haut de page">
        <i class="fas fa-chevron-up" aria-hidden="true"></i>
    </button>`;

    // ── Shared UI (modals, toast, tab bar) ──────────────────────
    const sharedUI = `
    <div class="modal sheet-modal" id="quickViewModal" role="dialog" aria-modal="true" aria-label="Aperçu rapide">
        <div class="modal-content">
            <button class="modal-close" id="modalClose" aria-label="Fermer" type="button">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
            <div class="quick-view-body" id="quickViewBody"></div>
        </div>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite">
        <i class="fas fa-check-circle" aria-hidden="true"></i>
        <span id="toastMessage"></span>
    </div>

    <div class="nav-overlay" id="navOverlay"></div>

    <nav class="tab-bar" id="tabBar" aria-label="Navigation principale">
        <div class="tab-bar-inner">
            <a href="index.html" class="tab-item ${isActive('index.html')}" aria-label="Accueil">
                <i class="fas fa-home" aria-hidden="true"></i>
                <span>Accueil</span>
            </a>
            <a href="shop.html" class="tab-item ${isActive('shop.html')}" aria-label="Boutique">
                <i class="fas fa-store" aria-hidden="true"></i>
                <span>Boutique</span>
            </a>
            <button class="tab-item tab-search-trigger" id="tabSearchBtn" aria-label="Rechercher" type="button">
                <i class="fas fa-search" aria-hidden="true"></i>
                <span>Chercher</span>
            </button>
            <a href="cart.html" class="tab-item ${isActive('cart.html')}" aria-label="Panier">
                <i class="fas fa-shopping-bag" aria-hidden="true"></i>
                <span class="tab-badge" id="tabCartBadge" style="display:none" aria-hidden="true">0</span>
                <span>Panier</span>
            </a>
            <a href="account.html" class="tab-item ${isActive('account.html')}" aria-label="Mon compte">
                <i class="fas fa-user" aria-hidden="true"></i>
                <span>Compte</span>
            </a>
        </div>
    </nav>`;

    // ── Inject ───────────────────────────────────────────────────
    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');
    const uiEl     = document.getElementById('site-ui');

    if (headerEl) headerEl.innerHTML = headerHTML;
    if (footerEl) footerEl.innerHTML = footerHTML;
    if (uiEl)     uiEl.innerHTML     = sharedUI;

    const contactSocial = document.getElementById('contact-social');
    if (contactSocial) contactSocial.innerHTML = socialLinksHTML('light');
})();
