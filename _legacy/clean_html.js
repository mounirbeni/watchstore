const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/mouni/Desktop/watchstore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Remove top-bar (contains dummy contacts and AR button)
    const topBarRegex = /<div class="top-bar">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
    if (content.match(topBarRegex)) {
        content = content.replace(topBarRegex, '');
        changed = true;
    }

    // 2. Remove iOS bottom nav
    const iosNavRegex = /<!-- iOS Bottom Navigation -->[\s\S]*?<div class="ios-bottom-nav">[\s\S]*?<\/div>/g;
    if (content.match(iosNavRegex)) {
        content = content.replace(iosNavRegex, '');
        changed = true;
    }

    // 3. Clean up Footer contacts and social links
    // The footer has <div class="social-links">...</div>
    const socialRegex = /<div class="social-links">[\s\S]*?<\/div>/g;
    if (content.match(socialRegex)) {
        content = content.replace(socialRegex, '');
        changed = true;
    }

    // Footer contact info: <p><i class="fas fa-phone"></i> +212 6 00 00 00 00</p><p><i class="fas fa-envelope"></i> contact@luxwatch.ma</p>
    const contactRegex = /<p><i class="fas fa-phone"><\/i> \+212 6 00 00 00 00<\/p>\s*<p><i class="fas fa-envelope"><\/i> contact@luxwatch\.ma<\/p>/g;
    if (content.match(contactRegex)) {
        content = content.replace(contactRegex, '');
        changed = true;
    }
    const contactRegex2 = /<p><i class="fas fa-phone"><\/i> \+212 6 00 00 00 00<\/p>/g;
    if (content.match(contactRegex2)) {
        content = content.replace(contactRegex2, '');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned HTML in ${file}`);
    }
}
