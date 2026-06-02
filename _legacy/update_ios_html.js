const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/mouni/Desktop/watchstore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const metaTags = `    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="theme-color" content="#ffffff">\n`;

const bottomNav = `    <!-- iOS Bottom Navigation -->
    <div class="ios-bottom-nav">
        <a href="index.html" class="nav-item"><i class="fas fa-home"></i><span>Accueil</span></a>
        <a href="shop.html" class="nav-item"><i class="fas fa-search"></i><span>Boutique</span></a>
        <a href="cart.html" class="nav-item"><i class="fas fa-shopping-bag"></i><span class="badge" id="bottomCartCount">0</span><span>Panier</span></a>
        <a href="account.html" class="nav-item"><i class="fas fa-user"></i><span>Compte</span></a>
    </div>\n`;

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let changed = false;

    // Inject meta tags
    if (!content.includes('apple-mobile-web-app-capable')) {
        content = content.replace('</head>', metaTags + '</head>');
        changed = true;
    }

    // Inject bottom nav
    if (!content.includes('ios-bottom-nav')) {
        content = content.replace('</body>', bottomNav + '</body>');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated HTML structure in ${file}`);
    }
}
