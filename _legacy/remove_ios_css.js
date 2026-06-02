const fs = require('fs');

const path = 'c:/Users/mouni/Desktop/watchstore/css/style.css';
let content = fs.readFileSync(path, 'utf8');

const iosCssIndex = content.indexOf('/* ============================================');
const iosCssIndex2 = content.indexOf('iOS Bottom Navigation Bar');

if (iosCssIndex2 !== -1) {
    const startIndex = content.lastIndexOf('/* ============================================', iosCssIndex2);
    content = content.substring(0, startIndex);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Removed iOS Bottom Nav CSS from style.css');
}
