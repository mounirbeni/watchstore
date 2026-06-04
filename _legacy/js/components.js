/* Shared header, footer, mobile tab bar, and language switcher. */
(function () {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const allowedLangs = ['fr', 'en'];
    const savedLang = localStorage.getItem('lwLang');
    const currentLang = allowedLangs.includes(savedLang) ? savedLang : 'fr';

    const I18N = {
        fr: {
            freeShipping: 'Livraison gratuite a partir de 500 MAD',
            warranty: 'Garantie 2 ans sur toutes nos montres',
            returns: 'Retour gratuit sous 14 jours',
            home: 'Accueil',
            shop: 'Boutique',
            collections: 'Collections',
            men: 'Homme',
            women: 'Femme',
            sport: 'Sport',
            classic: 'Classique',
            smart: 'Smart Watch',
            about: 'A Propos',
            contact: 'Contact',
            search: 'Chercher',
            account: 'Compte',
            wishlist: 'Favoris',
            cart: 'Panier',
            close: 'Fermer',
            menu: 'Menu',
            searchHint: 'Tapez pour rechercher une montre...',
            searchPlaceholder: 'Ex: Chronographe, Sport, Femme...',
            follow: 'Suivez-nous',
            footerCopy: 'Votre destination montres de luxe au Maroc. Qualite, elegance et service irreprochable depuis 2018.',
            navigation: 'Navigation',
            help: 'Contact & Aide',
            faq: 'FAQ',
            mensWatches: 'Montres Homme',
            womensWatches: 'Montres Femme',
            sportWatches: 'Montres Sport',
            hours: 'Lun - Sam : 9h - 20h',
            location: 'Casablanca, Maroc',
            allRights: 'Tous droits reserves.',
            privacy: 'Confidentialite',
            terms: 'CGV',
            returnsLink: 'Retours',
            payment: 'Paiement :',
            cash: 'Cash livraison',
            card: 'Carte',
            transfer: 'Virement',
            reserve: 'Reserver',
            quickView: 'Apercu rapide',
            addWishlist: 'Ajouter aux favoris',
            removeWishlist: 'Retirer des favoris',
            newBadge: 'Nouveau',
            saleBadge: 'Promo',
            hotBadge: 'Populaire'
        },
        en: {
            freeShipping: 'Free delivery from 500 MAD',
            warranty: '2-year warranty on every watch',
            returns: 'Free returns within 14 days',
            home: 'Home',
            shop: 'Shop',
            collections: 'Collections',
            men: 'Men',
            women: 'Women',
            sport: 'Sport',
            classic: 'Classic',
            smart: 'Smart Watch',
            about: 'About',
            contact: 'Contact',
            search: 'Search',
            account: 'Account',
            wishlist: 'Wishlist',
            cart: 'Cart',
            close: 'Close',
            menu: 'Menu',
            searchHint: 'Type to search for a watch...',
            searchPlaceholder: 'Ex: Chronograph, Sport, Women...',
            follow: 'Follow us',
            footerCopy: 'Your luxury watch destination in Morocco. Quality, elegance and impeccable service since 2018.',
            navigation: 'Navigation',
            help: 'Contact & Help',
            faq: 'FAQ',
            mensWatches: "Men's Watches",
            womensWatches: "Women's Watches",
            sportWatches: 'Sport Watches',
            hours: 'Mon - Sat: 9am - 8pm',
            location: 'Casablanca, Morocco',
            allRights: 'All rights reserved.',
            privacy: 'Privacy',
            terms: 'Terms',
            returnsLink: 'Returns',
            payment: 'Payment:',
            cash: 'Cash on delivery',
            card: 'Card',
            transfer: 'Bank transfer',
            reserve: 'Reserve',
            quickView: 'Quick view',
            addWishlist: 'Add to wishlist',
            removeWishlist: 'Remove from wishlist',
            newBadge: 'New',
            saleBadge: 'Sale',
            hotBadge: 'Popular'
        }
    };

    const t = key => I18N[currentLang][key] || I18N.fr[key] || key;
    window.LW_LANG = currentLang;
    window.LW_T = t;
    document.documentElement.lang = currentLang;

    function isActive(page) {
        if (page === 'index.html' && (path === '' || path === 'index.html')) return 'active';
        if (page !== 'index.html' && path === page) return 'active';
        return '';
    }

    function isTabActive(section) {
        const groups = {
            home: ['index.html', ''],
            shop: ['shop.html', 'product.html'],
            cart: ['cart.html', 'checkout.html', 'order-tracking.html'],
            account: ['account.html', 'login.html', 'register.html', 'wishlist.html']
        };
        return groups[section]?.includes(path) ? 'active' : '';
    }

    const socialLinksHTML = (theme = 'dark') => `
    <div class="social-block social-block--${theme}">
        <span class="social-block__label">${t('follow')}</span>
        <div class="social-links" role="list">
            <a href="https://www.instagram.com/luxwatchmaroc" class="social-link social-link--instagram" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="Instagram - @luxwatchmaroc">
                <i class="fab fa-instagram" aria-hidden="true"></i>
            </a>
            <a href="https://www.facebook.com/luxwatchmaroc" class="social-link social-link--facebook" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="Facebook - LuxWatch Maroc">
                <i class="fab fa-facebook-f" aria-hidden="true"></i>
            </a>
            <a href="https://www.tiktok.com/@luxwatchmaroc" class="social-link social-link--tiktok" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="TikTok - @luxwatchmaroc">
                <i class="fab fa-tiktok" aria-hidden="true"></i>
            </a>
            <a href="https://wa.me/212600000000" class="social-link social-link--whatsapp" target="_blank" rel="noopener noreferrer" role="listitem" aria-label="WhatsApp - +212 600 000 000">
                <i class="fab fa-whatsapp" aria-hidden="true"></i>
            </a>
        </div>
    </div>`;

    const headerHTML = `
    <div class="top-bar">
        <div class="container">
            <div class="top-bar-content">
                <span><i class="fas fa-truck"></i>&nbsp; ${t('freeShipping')}</span>
                <span><i class="fas fa-shield-alt"></i>&nbsp; ${t('warranty')}</span>
                <span><i class="fas fa-undo"></i>&nbsp; ${t('returns')}</span>
            </div>
        </div>
    </div>

    <header class="header" id="header">
        <div class="container">
            <div class="header-inner">
                <a href="index.html" class="logo" aria-label="LuxWatch Maroc - ${t('home')}">
                    <span class="logo-wordmark">
                        <span class="logo-wordmark__lux">LUX</span><span class="logo-wordmark__watch">WATCH</span>
                    </span>
                    <span class="logo-wordmark__mark" aria-hidden="true">MAROC</span>
                </a>

                <nav class="nav" id="nav">
                    <a href="index.html" class="${isActive('index.html')}">${t('home')}</a>
                    <a href="shop.html" class="${isActive('shop.html')}">${t('shop')}</a>
                    <div class="nav-dropdown">
                        <a href="#">${t('collections')} <i class="fas fa-chevron-down"></i></a>
                        <div class="dropdown-menu">
                            <a href="shop.html?cat=homme"><i class="fas fa-male"></i> ${t('men')}</a>
                            <a href="shop.html?cat=femme"><i class="fas fa-female"></i> ${t('women')}</a>
                            <a href="shop.html?cat=sport"><i class="fas fa-running"></i> ${t('sport')}</a>
                            <a href="shop.html?cat=classique"><i class="fas fa-clock"></i> ${t('classic')}</a>
                            <a href="shop.html?cat=smart"><i class="fas fa-mobile-alt"></i> ${t('smart')}</a>
                        </div>
                    </div>
                    <a href="about.html" class="${isActive('about.html')}">${t('about')}</a>
                    <a href="contact.html" class="${isActive('contact.html')}">${t('contact')}</a>
                </nav>

                <div class="header-actions">
                    <div class="language-switch" role="group" aria-label="Language">
                        <button type="button" class="${currentLang === 'fr' ? 'active' : ''}" data-lang="fr">FR</button>
                        <button type="button" class="${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
                    </div>
                    <button class="header-icon-btn search-btn" id="searchBtn" aria-label="${t('search')}">
                        <i class="fas fa-search"></i>
                    </button>
                    <a href="account.html" class="header-icon-btn header-icon-btn--account" aria-label="${t('account')}">
                        <i class="fas fa-user"></i>
                    </a>
                    <a href="wishlist.html" class="header-icon-btn" aria-label="${t('wishlist')}">
                        <i class="fas fa-heart"></i>
                        <span class="badge" id="wishlistCount">0</span>
                    </a>
                    <a href="cart.html" class="header-icon-btn" aria-label="${t('cart')}">
                        <i class="fas fa-shopping-bag"></i>
                        <span class="badge" id="cartCount">0</span>
                    </a>
                    <button class="menu-toggle" id="menuToggle" aria-label="${t('menu')}">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <div class="search-overlay" id="searchOverlay">
        <div class="search-overlay-content">
            <button class="search-close" id="searchClose" aria-label="${t('close')}"><i class="fas fa-times"></i></button>
            <p class="search-hint">${t('searchHint')}</p>
            <div class="search-input-wrap">
                <input type="text" placeholder="${t('searchPlaceholder')}" id="searchInput" autocomplete="off">
                <button aria-label="${t('search')}"><i class="fas fa-search"></i></button>
            </div>
        </div>
    </div>`;

    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col footer-brand">
                    <a href="index.html" class="footer-logo" aria-label="LuxWatch Maroc - ${t('home')}">
                        <span class="logo-wordmark logo-wordmark--footer">
                            <span class="logo-wordmark__lux">LUX</span><span class="logo-wordmark__watch">WATCH</span>
                        </span>
                        <span class="logo-wordmark__mark" aria-hidden="true">MAROC</span>
                    </a>
                    <p>${t('footerCopy')}</p>
                    ${socialLinksHTML('dark')}
                </div>

                <div class="footer-col">
                    <h4>${t('navigation')}</h4>
                    <a href="index.html">${t('home')}</a>
                    <a href="shop.html">${t('shop')}</a>
                    <a href="about.html">${t('about')}</a>
                    <a href="contact.html">${t('contact')}</a>
                    <a href="faq.html">${t('faq')}</a>
                </div>

                <div class="footer-col">
                    <h4>${t('collections')}</h4>
                    <a href="shop.html?cat=homme">${t('mensWatches')}</a>
                    <a href="shop.html?cat=femme">${t('womensWatches')}</a>
                    <a href="shop.html?cat=sport">${t('sportWatches')}</a>
                    <a href="shop.html?cat=classique">${t('classic')}</a>
                    <a href="shop.html?cat=smart">${t('smart')}</a>
                </div>

                <div class="footer-col">
                    <h4>${t('help')}</h4>
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
                            <span>${t('hours')}</span>
                        </div>
                        <div class="footer-contact-link">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${t('location')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2026 LuxWatch Maroc. ${t('allRights')}</p>
                <div class="footer-legal">
                    <a href="privacy.html">${t('privacy')}</a>
                    <a href="terms.html">${t('terms')}</a>
                    <a href="returns.html">${t('returnsLink')}</a>
                </div>
                <div class="footer-payments">
                    <span>${t('payment')}</span>
                    <span class="payment-chip"><i class="fas fa-money-bill-wave"></i> ${t('cash')}</span>
                    <span class="payment-chip"><i class="fas fa-credit-card"></i> ${t('card')}</span>
                    <span class="payment-chip"><i class="fas fa-university"></i> ${t('transfer')}</span>
                </div>
            </div>
        </div>
    </footer>

    <a href="https://wa.me/212600000000" class="whatsapp-float" target="_blank" rel="noopener" aria-label="WhatsApp">
        <i class="fab fa-whatsapp"></i>
    </a>

    <button class="back-to-top" id="backToTop" aria-label="Top">
        <i class="fas fa-chevron-up"></i>
    </button>`;

    const sharedUI = `
    <div class="modal sheet-modal" id="quickViewModal" role="dialog" aria-modal="true">
        <div class="modal-content">
            <button class="modal-close" id="modalClose" aria-label="${t('close')}"><i class="fas fa-times"></i></button>
            <div class="quick-view-body" id="quickViewBody"></div>
        </div>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite">
        <i class="fas fa-check-circle"></i>
        <span id="toastMessage"></span>
    </div>
    <div class="nav-overlay" id="navOverlay"></div>

    <nav class="tab-bar" id="tabBar" aria-label="Navigation">
        <div class="tab-bar-inner">
            <a href="index.html" class="tab-item ${isTabActive('home')}" aria-label="${t('home')}">
                <i class="fas fa-home"></i>
                <span>${t('home')}</span>
            </a>
            <a href="shop.html" class="tab-item ${isTabActive('shop')}" aria-label="${t('shop')}">
                <i class="fas fa-store"></i>
                <span>${t('shop')}</span>
            </a>
            <button class="tab-item tab-search-trigger" id="tabSearchBtn" aria-label="${t('search')}">
                <i class="fas fa-search"></i>
                <span>${t('search')}</span>
            </button>
            <a href="cart.html" class="tab-item ${isTabActive('cart')}" aria-label="${t('cart')}">
                <i class="fas fa-shopping-bag"></i>
                <span class="tab-badge" id="tabCartBadge" style="display:none">0</span>
                <span>${t('cart')}</span>
            </a>
            <a href="account.html" class="tab-item ${isTabActive('account')}" aria-label="${t('account')}">
                <i class="fas fa-user"></i>
                <span>${t('account')}</span>
            </a>
        </div>
    </nav>`;

    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');
    const uiEl = document.getElementById('site-ui');

    if (headerEl) headerEl.innerHTML = headerHTML;
    if (footerEl) footerEl.innerHTML = footerHTML;
    if (uiEl) uiEl.innerHTML = sharedUI;

    const contactSocial = document.getElementById('contact-social');
    if (contactSocial) contactSocial.innerHTML = socialLinksHTML('light');

    function normalizeCopy(value) {
        return value
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9%]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function translateStaticPage() {
        if (currentLang !== 'en') return;

        const copy = {
            'nouvelle collection 2026': 'New Collection 2026',
            'l elegance a votre poignet': 'Elegance on Your Wrist',
            'decouvrez notre selection exclusive de montres de luxe livrees partout au maroc en 24 48h': 'Discover our exclusive selection of luxury watches, delivered across Morocco in 24-48h.',
            'decouvrir': 'Discover',
            'nouveautes': 'New arrivals',
            'collection homme': "Men's Collection",
            'le style masculin': 'Masculine Style',
            'des montres qui refletent votre personnalite et votre elegance au quotidien': 'Watches that reflect your personality and everyday elegance.',
            'voir la collection': 'View Collection',
            'collection femme': "Women's Collection",
            'brillez de mille feux': 'Shine with Distinction',
            'une collection raffinee pour la femme moderne elegante et libre': 'A refined collection for the modern, elegant and independent woman.',
            'explorer': 'Explore',
            'livraison rapide': 'Fast Delivery',
            'partout au maroc en 24 48h': 'Across Morocco in 24-48h',
            'paiement a la livraison': 'Cash on Delivery',
            'payez en cash a la reception': 'Pay in cash when you receive your order',
            'garantie 2 ans': '2-Year Warranty',
            'sur toutes nos montres': 'On every watch',
            'retour gratuit': 'Free Returns',
            'sous 14 jours sans questions': 'Within 14 days, no questions asked',
            'collections': 'Collections',
            'nos categories': 'Our Categories',
            'trouvez la montre qui correspond a votre style de vie': 'Find the watch that matches your lifestyle',
            'homme': 'Men',
            'femme': 'Women',
            'classique': 'Classic',
            'selection': 'Selection',
            'produits populaires': 'Popular Watches',
            'les montres les plus appreciees par nos clients au maroc': 'The watches most loved by our clients in Morocco',
            'tous': 'All',
            'voir toute la boutique': 'View the Store',
            'offre speciale': 'Special Offer',
            'jusqu a 40% sur les montres sport': 'Up to 40% Off Sport Watches',
            'profitez de nos reductions exceptionnelles offre valable jusqu au 31 decembre 2026': 'Enjoy exceptional reductions. Offer valid until December 31, 2026.',
            'jours': 'Days',
            'heures': 'Hours',
            'minutes': 'Minutes',
            'secondes': 'Seconds',
            'profiter de l offre': 'Shop the Offer',
            'fraichement arrivees': 'Fresh Arrivals',
            'les dernieres montres ajoutees a notre collection': 'The latest watches added to our collection',
            'marques': 'Brands',
            'nos marques partenaires': 'Partner Brands',
            'les maisons horlogeres les plus prestigieuses disponibles chez luxwatch maroc': 'Prestigious watch houses available at LuxWatch Maroc',
            'notre boutique': 'Our Store',
            'affichage de 65 produits': 'Showing 65 products',
            'filtrer trier': 'Filter & Sort',
            'trier par defaut': 'Default sorting',
            'prix croissant': 'Price: low to high',
            'prix decroissant': 'Price: high to low',
            'nom a z': 'Name A-Z',
            'meilleures notes': 'Top rated',
            'nouveautes d abord': 'Newest first',
            'categories': 'Categories',
            'prix mad': 'Price (MAD)',
            'marque': 'Brand',
            'statut': 'Status',
            'en promotion': 'On sale',
            'connexion': 'Sign In',
            'espace client': 'Client Area',
            'accedez a vos reservations et suivis de commande': 'Access your reservations and delivery tracking.',
            'email': 'Email',
            'mot de passe': 'Password',
            'se souvenir de moi': 'Remember me',
            'se connecter': 'Sign in',
            'pas encore de compte': 'No account yet',
            'creer un compte': 'Create account',
            'contactez nous': 'Contact Us',
            'envoyez nous un message': 'Send us a Message',
            'nous vous repondrons dans les plus brefs delais generalement sous 2h': 'We usually reply within 2 hours.',
            'prenom': 'First name',
            'nom': 'Last name',
            'sujet': 'Subject',
            'message': 'Message',
            'envoyer le message': 'Send Message',
            'vous avez des questions': 'Have questions?',
            'consultez notre faq pour trouver rapidement des reponses': 'Check our FAQ for quick answers',
            'voir la faq': 'View FAQ',
            'mon panier': 'My Cart',
            'resume': 'Summary',
            'sous total': 'Subtotal',
            'livraison': 'Delivery',
            'total': 'Total',
            'reserver maintenant': 'Reserve Now',
            'code promo': 'Promo code',
            'appliquer': 'Apply'
        };

        const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME']);
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!parent || skipTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
                return normalizeCopy(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(node => {
            const key = normalizeCopy(node.nodeValue);
            if (!copy[key]) return;
            const leading = node.nodeValue.match(/^\s*/)?.[0] || '';
            const trailing = node.nodeValue.match(/\s*$/)?.[0] || '';
            node.nodeValue = `${leading}${copy[key]}${trailing}`;
        });

        document.querySelectorAll('[placeholder], option').forEach(el => {
            const attr = el.hasAttribute('placeholder') ? 'placeholder' : null;
            const value = attr ? el.getAttribute(attr) : el.textContent;
            const key = normalizeCopy(value || '');
            if (!copy[key]) return;
            if (attr) el.setAttribute(attr, copy[key]);
            else el.textContent = copy[key];
        });
    }

    translateStaticPage();

    document.querySelectorAll('.language-switch [data-lang]').forEach(button => {
        button.addEventListener('click', () => {
            const next = button.dataset.lang;
            if (!allowedLangs.includes(next) || next === currentLang) return;
            localStorage.setItem('lwLang', next);
            window.location.reload();
        });
    });
})();
