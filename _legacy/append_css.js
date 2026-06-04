const fs = require('fs');

const css = `
/* ============================================
   iOS Bottom Navigation Bar
   ============================================ */
.ios-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-top: 1px solid rgba(0,0,0,0.1);
    z-index: 2000;
    padding-bottom: env(safe-area-inset-bottom, 20px);
    padding-top: 10px;
    padding-left: 10px;
    padding-right: 10px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.ios-bottom-nav .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8e8e93; /* iOS unselected gray */
    font-size: 0.7rem;
    font-weight: 500;
    gap: 4px;
    position: relative;
    width: 25%;
}

.ios-bottom-nav .nav-item i {
    font-size: 1.4rem;
    margin-bottom: 2px;
}

.ios-bottom-nav .nav-item:hover, 
.ios-bottom-nav .nav-item:active {
    color: var(--primary);
}

.ios-bottom-nav .nav-item .badge {
    position: absolute;
    top: -5px;
    right: 20%;
    background: #ff3b30; /* iOS red badge */
    color: white;
    font-size: 0.7rem;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}
`;

fs.appendFileSync('c:/Users/mouni/Desktop/watchstore/css/style.css', css, 'utf8');
console.log('Appended iOS styles to style.css');
