const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/mouni/Desktop/watchstore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const skipFiles = ['login.html', 'register.html', 'account.html', '404.html'];

for (const file of files) {
    if (skipFiles.includes(file)) continue;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add user button before wishlist button
    // Most files: <div class="header-actions"><button class="search-btn" id="searchBtn"><i class="fas fa-search"></i></button><a href="wishlist.html"
    const searchTarget1 = '<button class="search-btn" id="searchBtn"><i class="fas fa-search"></i></button><a href="wishlist.html"';
    const replace1 = '<button class="search-btn" id="searchBtn"><i class="fas fa-search"></i></button><a href="login.html" class="user-btn"><i class="fas fa-user"></i></a><a href="wishlist.html"';

    // Checkout file: <div class="header-actions"><a href="cart.html"
    const searchTarget2 = '<div class="header-actions"><a href="cart.html" class="cart-btn">';
    const replace2 = '<div class="header-actions"><a href="login.html" class="user-btn"><i class="fas fa-user"></i></a><a href="cart.html" class="cart-btn">';

    let changed = false;
    if (content.includes(searchTarget1)) {
        content = content.replace(searchTarget1, replace1);
        changed = true;
    } else if (content.includes(searchTarget2)) {
        content = content.replace(searchTarget2, replace2);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`Could not find target in ${file}`);
    }
}
