"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_js_1 = require("./renderer.js");
const input_js_1 = require("../input/input.js");
const inventory_js_1 = require("../inventory.js");
const audioManager_js_1 = require("../audioManager.js");
const physics_js_1 = require("../engine/physics.js");
const canvas = document.getElementById('game-canvas');
if (!canvas)
    throw new Error('Canvas not found');
// Ensure canvas has correct typing in browsers
/** @type {HTMLCanvasElement} */
const gameCanvas = canvas;
// Constants
const PLAYER_SIZE = 40;
const PLAYER_SPEED = 240; // pixels per second
// Currency & shop constants
const STARTING_COINS = 20;
const MEDKIT_PRICE = 5;
const AMMO_PRICE = 3;
const SELL_MULTIPLIER = 0.5;
const renderer = (0, renderer_js_1.createRenderer)(gameCanvas);
const input = (0, input_js_1.createInput)();
const inventory = (0, inventory_js_1.createInventory)();
let audio = null; // will be assigned in main() when environment is ready
const player = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    color: '#e91e63',
    // stats
    hp: 100,
    maxHp: 100,
    score: 0,
    feedback: null,
    feedbackExpire: 0,
    inventory,
    gold: 100,
    isGrounded: false
};
// Visual polish constants (no magic numbers)
const VISUAL = {
    SHADOW_OFFSET: 6,
    SHADOW_BLUR: 8, // tuned in renderer
    VIGNETTE_INTENSITY: 0.45,
    PARTICLE_COUNT: 24,
    PARTICLE_LIFETIME: 800 // ms
};
// Reusable timing and limits
const FEEDBACK_MS = 1500;
const FEEDBACK_LONG_MS = 2000;
const FEEDBACK_SHORT_MS = 1200;
const SETTINGS_FEEDBACK_MS = 900;
const MAX_PARTICLES = 200;
// Simple particle shimmer system (kept lightweight)
const particles = [];
function emitParticle(px, py) {
    particles.push({
        x: px + (Math.random() - 0.5) * 20,
        y: py + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 20,
        r: Math.random() * 2 + 1,
        life: VISUAL.PARTICLE_LIFETIME,
        born: performance.now()
    });
    if (particles.length > MAX_PARTICLES)
        particles.splice(0, particles.length - MAX_PARTICLES);
}
const hudEl = document.createElement('div');
Object.assign(hudEl.style, { position: 'fixed', right: '12px', top: '12px', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '8px 10px', borderRadius: '6px', fontFamily: 'sans-serif', zIndex: '1100' });
// create persistent HUD child nodes to avoid recreating DOM every frame (reduces GC & layout thrash)
const hudHP = document.createElement('div');
hudHP.style.fontWeight = '600';
const hudScore = document.createElement('div');
const hudGold = document.createElement('div');
const hudInv = document.createElement('div');
hudInv.style.color = '#61dafb';
hudInv.style.marginTop = '6px';
const hudFeedback = document.createElement('div');
hudFeedback.style.color = '#ffeb3b';
hudFeedback.style.marginTop = '6px';
hudEl.appendChild(hudHP);
hudEl.appendChild(hudScore);
hudEl.appendChild(hudGold);
hudEl.appendChild(hudInv);
hudEl.appendChild(hudFeedback);
document.body.appendChild(hudEl);
// Shop data and helpers
let SHOP_ITEMS = [
    { name: 'Health Potion', price: 25 },
    { name: 'Sword', price: 60 },
    { name: 'Shield', price: 50 }
];
// Load shop items dynamically from assets to avoid hardcoded lists
(function loadShop() {
    if (typeof fetch !== 'undefined') {
        fetch('/assets/ui/shop.json').then(r => r.json()).then(j => {
            if (Array.isArray(j))
                SHOP_ITEMS = j;
            else if (j && j.shop)
                SHOP_ITEMS = j.shop;
        }).catch(() => { });
    }
})();
function openShop() {
    const shopItems = SHOP_ITEMS.map(i => i.name + ' — ' + i.price + 'g');
    const shop = createMenu('shop-overlay', 'Shop - Buy Items', shopItems, (idx) => {
        const it = SHOP_ITEMS[idx];
        if (player.gold < it.price) {
            player.feedback = 'Not enough gold';
            player.feedbackExpire = performance.now() + FEEDBACK_MS;
            return;
        }
        if (player.inventory.isFull()) {
            player.feedback = 'Inventory full';
            player.feedbackExpire = performance.now() + FEEDBACK_MS;
            return;
        }
        player.gold -= it.price;
        player.inventory.addItem(it.name, 1);
        player.feedback = 'Bought ' + it.name;
        player.feedbackExpire = performance.now() + FEEDBACK_MS;
        shop.overlay.style.display = 'none';
    });
}
function getPriceFor(name) {
    const it = SHOP_ITEMS.find(x => x.name === name);
    return it ? it.price : 10;
}
function openSellMenu() {
    const inv = player.inventory.getItems();
    if (inv.length === 0) {
        player.feedback = 'Nothing to sell';
        player.feedbackExpire = performance.now() + FEEDBACK_SHORT_MS;
        return;
    }
    const sellItems = inv.map(i => i.name + ' x' + i.quantity + ' — ' + Math.floor((getPriceFor(i.name) || 10) / 2) + 'g');
    const sell = createMenu('sell-overlay', 'Sell Items', sellItems, (idx) => {
        const item = inv[idx];
        const sellPrice = Math.floor((getPriceFor(item.name) || 10) / 2);
        player.inventory.removeItem(item.name, 1);
        player.gold += sellPrice;
        player.feedback = 'Sold ' + item.name + ' for ' + sellPrice + 'g';
        player.feedbackExpire = performance.now() + FEEDBACK_MS;
        sell.overlay.style.display = 'none';
    });
}
// Add shop controls to HUD
const shopBtn = document.createElement('button');
shopBtn.innerText = 'Shop';
Object.assign(shopBtn.style, { marginLeft: '8px' });
shopBtn.addEventListener('click', openShop);
const sellBtn = document.createElement('button');
sellBtn.innerText = 'Sell';
Object.assign(sellBtn.style, { marginLeft: '8px' });
sellBtn.addEventListener('click', openSellMenu);
const settingsBtn = document.createElement('button');
settingsBtn.innerText = 'Settings';
Object.assign(settingsBtn.style, { marginLeft: '8px' });
settingsBtn.addEventListener('click', openSettings);
hudEl.appendChild(shopBtn);
hudEl.appendChild(sellBtn);
hudEl.appendChild(settingsBtn);
let lastTime = performance.now();
// UI state
let menuVisible = true;
let pauseVisible = false;
function setSelected(listEl, idx) {
    for (let i = 0; i < listEl.children.length; i++) {
        const li = listEl.children[i];
        li.style.background = (i === idx) ? '#444' : 'transparent';
    }
}
function createMenu(id, titleText, items, onSelect) {
    const overlay = document.createElement('div');
    overlay.id = id;
    Object.assign(overlay.style, {
        position: 'fixed', left: '0', top: '0', width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: '1000'
    });
    const box = document.createElement('div');
    Object.assign(box.style, { background: '#222', padding: '20px', borderRadius: '8px', minWidth: '240px', textAlign: 'center', color: '#fff' });
    overlay.appendChild(box);
    const title = document.createElement('h2');
    title.innerText = titleText;
    box.appendChild(title);
    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    list.style.margin = '16px 0';
    items.forEach((it, i) => {
        const li = document.createElement('li');
        li.innerText = it;
        li.dataset.index = String(i);
        li.style.padding = '8px 12px';
        li.style.cursor = 'pointer';
        li.style.borderRadius = '4px';
        li.addEventListener('click', () => onSelect(i));
        list.appendChild(li);
    });
    box.appendChild(list);
    document.body.appendChild(overlay);
    return { overlay, list };
}
// Settings menu with audio and display controls
function openSettings() {
    if (!audio && typeof audioManager_js_1.createAudioManager === 'function')
        audio = (0, audioManager_js_1.createAudioManager)();
    const overlay = document.createElement('div');
    Object.assign(overlay.style, { position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: '1200' });
    const box = document.createElement('div');
    Object.assign(box.style, { background: '#111', color: '#fff', padding: '18px', borderRadius: '8px', minWidth: '320px' });
    const title = document.createElement('h2');
    title.innerText = 'Settings';
    box.appendChild(title);
    // Music volume
    const musicLabel = document.createElement('div');
    musicLabel.innerText = 'Music Volume';
    const musicInput = document.createElement('input');
    musicInput.type = 'range';
    musicInput.min = 0;
    musicInput.max = 1;
    musicInput.step = 0.01;
    musicInput.value = (audio && audio.getMusicVolume) ? audio.getMusicVolume() : 0.6;
    musicInput.addEventListener('input', (e) => { if (audio && audio.setMusicVolume)
        audio.setMusicVolume(e.target.value); });
    box.appendChild(musicLabel);
    box.appendChild(musicInput);
    // SFX volume
    const sfxLabel = document.createElement('div');
    sfxLabel.innerText = 'SFX Volume';
    const sfxInput = document.createElement('input');
    sfxInput.type = 'range';
    sfxInput.min = 0;
    sfxInput.max = 1;
    sfxInput.step = 0.01;
    sfxInput.value = (audio && audio.getSFXVolume) ? audio.getSFXVolume() : 1.0;
    sfxInput.addEventListener('input', (e) => { if (audio && audio.setSFXVolume)
        audio.setSFXVolume(e.target.value); });
    box.appendChild(sfxLabel);
    box.appendChild(sfxInput);
    // Render scale
    const scaleLabel = document.createElement('div');
    scaleLabel.innerText = 'Render Scale (0.25 - 4.0)';
    const scaleInput = document.createElement('input');
    scaleInput.type = 'range';
    scaleInput.min = 0.25;
    scaleInput.max = 2;
    scaleInput.step = 0.01;
    scaleInput.value = 1;
    scaleInput.addEventListener('input', (e) => { if (renderer && renderer.setScale)
        renderer.setScale(e.target.value); });
    box.appendChild(scaleLabel);
    box.appendChild(scaleInput);
    // Close button
    const close = document.createElement('button');
    close.innerText = 'Close';
    Object.assign(close.style, { marginTop: '12px' });
    close.addEventListener('click', () => { overlay.style.display = 'none'; document.body.removeChild(overlay); });
    box.appendChild(close);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}
// Settings overlay with audio and display controls
function createSettingsMenu() {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', left: '0', top: '0', width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: '1001'
    });
    const box = document.createElement('div');
    Object.assign(box.style, { background: '#222', padding: '18px', borderRadius: '8px', minWidth: '320px', color: '#fff', textAlign: 'left' });
    overlay.appendChild(box);
    const title = document.createElement('h2');
    title.innerText = 'Settings';
    box.appendChild(title);
    // Audio controls
    const audioSection = document.createElement('div');
    audioSection.style.marginBottom = '12px';
    const musicLabel = document.createElement('label');
    musicLabel.innerText = 'Music Volume: ';
    const musicInput = document.createElement('input');
    musicInput.type = 'range';
    musicInput.min = 0;
    musicInput.max = 1;
    musicInput.step = 0.01;
    musicInput.value = (audio && audio.getMusicVolume) ? String(audio.getMusicVolume()) : '0.6';
    musicLabel.appendChild(musicInput);
    audioSection.appendChild(musicLabel);
    const sfxLabel = document.createElement('label');
    sfxLabel.innerText = ' SFX Volume: ';
    const sfxInput = document.createElement('input');
    sfxInput.type = 'range';
    sfxInput.min = 0;
    sfxInput.max = 1;
    sfxInput.step = 0.01;
    sfxInput.value = (audio && audio.getSFXVolume) ? String(audio.getSFXVolume()) : '1.0';
    sfxLabel.appendChild(sfxInput);
    audioSection.appendChild(sfxLabel);
    box.appendChild(audioSection);
    // Display controls
    const displaySection = document.createElement('div');
    displaySection.style.marginBottom = '12px';
    const scaleLabel = document.createElement('label');
    scaleLabel.innerText = 'Render Scale: ';
    const scaleSelect = document.createElement('select');
    ['1', '1.5', '2'].forEach(v => { const o = document.createElement('option'); o.value = v; o.innerText = v + 'x'; scaleSelect.appendChild(o); });
    // pre-select current renderer scale if available
    try {
        if (renderer && renderer.getScale) {
            const cur = String(renderer.getScale());
            Array.from(scaleSelect.options).forEach(opt => { if (opt.value === cur)
                opt.selected = true; });
        }
    }
    catch (e) { }
    scaleLabel.appendChild(scaleSelect);
    displaySection.appendChild(scaleLabel);
    const fsLabel = document.createElement('label');
    fsLabel.style.display = 'block';
    fsLabel.style.marginTop = '8px';
    const fsCheckbox = document.createElement('input');
    fsCheckbox.type = 'checkbox';
    fsLabel.appendChild(fsCheckbox);
    fsLabel.appendChild(document.createTextNode(' Fullscreen'));
    displaySection.appendChild(fsLabel);
    box.appendChild(displaySection);
    // Action buttons
    const actions = document.createElement('div');
    actions.style.textAlign = 'right';
    const saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save';
    saveBtn.style.marginRight = '8px';
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    box.appendChild(actions);
    saveBtn.addEventListener('click', () => {
        // Apply audio settings
        try {
            const mv = parseFloat(musicInput.value);
            const sv = parseFloat(sfxInput.value);
            if (audio && typeof audio.setMusicVolume === 'function')
                audio.setMusicVolume(mv);
            if (audio && typeof audio.setSFXVolume === 'function')
                audio.setSFXVolume(sv);
        }
        catch (e) {
            console.warn('Failed to apply audio settings', e);
        }
        // Apply renderer scale
        try {
            const s = parseFloat(scaleSelect.value);
            if (renderer && typeof renderer.setScale === 'function')
                renderer.setScale(s);
        }
        catch (e) { }
        // Fullscreen toggle
        try {
            if (fsCheckbox.checked) {
                if (document.documentElement.requestFullscreen)
                    document.documentElement.requestFullscreen();
            }
            else if (document.fullscreenElement) {
                if (document.exitFullscreen)
                    document.exitFullscreen();
            }
        }
        catch (e) { }
        // Simple feedback and hide
        const info = document.createElement('div');
        info.style.color = '#9ccc65';
        info.innerText = 'Settings saved';
        box.appendChild(info);
        setTimeout(() => { overlay.style.display = 'none'; info.remove(); }, SETTINGS_FEEDBACK_MS);
    });
    cancelBtn.addEventListener('click', () => { overlay.style.display = 'none'; });
    document.body.appendChild(overlay);
    return overlay;
}
function loadMenuSync() {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/assets/ui/menu.json', false); // synchronous load to ensure menus are available before UI boot
        xhr.send(null);
        if (xhr.status === 200) {
            const json = JSON.parse(xhr.responseText);
            return { mainMenu: Array.isArray(json.mainMenu) ? json.mainMenu : ['Start Game', 'Options', 'Quit'], pauseMenu: Array.isArray(json.pauseMenu) ? json.pauseMenu : ['Resume', 'Restart', 'Quit to Menu'] };
        }
    }
    catch (e) { }
    return { mainMenu: ['Start Game', 'Options', 'Quit'], pauseMenu: ['Resume', 'Restart', 'Quit to Menu'] };
}
const menus = loadMenuSync();
const mainMenuItems = menus.mainMenu;
const pauseMenuItems = menus.pauseMenu;
const mainMenu = createMenu('main-menu-overlay', 'Main Menu', mainMenuItems, (i) => {
    if (i === 0) {
        menuVisible = false;
        mainMenu.overlay.style.display = 'none';
        if (!audio && typeof audioManager_js_1.createAudioManager === 'function')
            audio = (0, audioManager_js_1.createAudioManager)();
        if (audio)
            audio.playMusic('music_theme');
    }
    else if (i === 1) {
        // Open settings/options
        openSettings();
    }
    else if (i === 2) {
        // Best-effort quit
        if (typeof window !== 'undefined' && window.close)
            window.close();
    }
});
const pauseMenu = createMenu('pause-menu-overlay', 'Paused', pauseMenuItems, (i) => {
    if (i === 0) {
        pauseVisible = false;
        pauseMenu.overlay.style.display = 'none';
    }
    else if (i === 2) {
        pauseVisible = false;
        pauseMenu.overlay.style.display = 'none';
        menuVisible = true;
        mainMenu.overlay.style.display = 'flex';
    }
});
pauseMenu.overlay.style.display = 'none';
// Keyboard navigation for menus and pause toggle
let mainSelected = 0;
let pauseSelected = 0;
setSelected(mainMenu.list, mainSelected);
setSelected(pauseMenu.list, pauseSelected);
document.addEventListener('keydown', (e) => {
    if (menuVisible) {
        if (e.key === 'ArrowDown') {
            mainSelected = (mainSelected + 1) % mainMenu.list.children.length;
            setSelected(mainMenu.list, mainSelected);
        }
        if (e.key === 'ArrowUp') {
            mainSelected = (mainSelected - 1 + mainMenu.list.children.length) % mainMenu.list.children.length;
            setSelected(mainMenu.list, mainSelected);
        }
        if (e.key === 'Enter') {
            mainMenu.list.children[mainSelected].click();
        }
        return;
    }
    if (pauseVisible) {
        if (e.key === 'ArrowDown') {
            pauseSelected = (pauseSelected + 1) % pauseMenu.list.children.length;
            setSelected(pauseMenu.list, pauseSelected);
        }
        if (e.key === 'ArrowUp') {
            pauseSelected = (pauseSelected - 1 + pauseMenu.list.children.length) % pauseMenu.list.children.length;
            setSelected(pauseMenu.list, pauseSelected);
        }
        if (e.key === 'Enter') {
            pauseMenu.list.children[pauseSelected].click();
        }
        if (e.key === 'p') {
            pauseVisible = false;
            pauseMenu.overlay.style.display = 'none';
        }
        return;
    }
    if (e.key === 'p') {
        pauseVisible = !pauseVisible;
        pauseMenu.overlay.style.display = pauseVisible ? 'flex' : 'none';
    }
    // Shop keys when not in menus
    if (!menuVisible && !pauseVisible) {
        if (e.key === 'b') {
            const price = MEDKIT_PRICE; // medkit
            if (player.gold < price) {
                player.feedback = 'Not enough gold';
                player.feedbackExpire = performance.now() + FEEDBACK_LONG_MS;
            }
            else if (player.inventory.isFull()) {
                player.feedback = 'Inventory full';
                player.feedbackExpire = performance.now() + FEEDBACK_LONG_MS;
            }
            else {
                player.inventory.addItem('Medkit', 1);
                player.gold -= price;
                player.feedback = `Bought Medkit for ${price}g`;
                player.feedbackExpire = performance.now() + FEEDBACK_LONG_MS;
            }
        }
        if (e.key === 'n') {
            const price = AMMO_PRICE; // ammo
            if (player.gold < price) {
                player.feedback = 'Not enough gold';
                player.feedbackExpire = performance.now() + FEEDBACK_LONG_MS;
            }
            else if (player.inventory.isFull()) {
                player.feedback = 'Inventory full';
                player.feedbackExpire = performance.now() + FEEDBACK_LONG_MS;
            }
            else {
                player.inventory.addItem('Ammo', 1);
                player.gold -= price;
                player.feedback = `Bought Ammo for ${price}g`;
                player.feedbackExpire = performance.now() + FEEDBACK_LONG_MS;
            }
        }
        if (e.key === 's' || e.key === 'S') {
            const items = player.inventory.getItems();
            if (items.length === 0) {
                player.feedback = 'Inventory empty';
                player.feedbackExpire = performance.now() + FEEDBACK_LONG_MS;
            }
            else {
                const it = items[0];
                player.inventory.removeItem(it.name, 1);
                const price = (it.name === 'Medkit') ? Math.floor(MEDKIT_PRICE / 2) : (it.name === 'Ammo' ? Math.floor(AMMO_PRICE / 2) : 1);
                player.gold += price;
                player.feedback = `Sold ${it.name} for ${price}g`;
                player.feedbackExpire = performance.now() + FEEDBACK_LONG_MS;
            }
        }
    }
});
function update(dt) {
    if (menuVisible || pauseVisible)
        return; // pause game updates while menus are visible
    // Input-driven velocity (no magic numbers buried)
    const speed = PLAYER_SPEED;
    player.vx = (input.keys.left ? -1 : 0) + (input.keys.right ? 1 : 0);
    player.vy = (input.keys.up ? -1 : 0) + (input.keys.down ? 1 : 0);
    // Normalize diagonal speed
    if (player.vx !== 0 && player.vy !== 0) {
        const inv = 1 / Math.sqrt(2);
        player.vx *= inv;
        player.vy *= inv;
    }
    player.x += player.vx * speed * dt;
    player.y += player.vy * speed * dt;
    // Clamp to canvas bounds
    player.x = Math.max(0, Math.min(renderer.width - player.width, player.x));
    player.y = Math.max(0, Math.min(renderer.height - player.height, player.y));
}
function frame(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05); // cap delta for stability
    lastTime = now;
    update(dt);
    renderer.clear();
    // Draw glow and soft shadow for player
    if (renderer.drawGlow)
        renderer.drawGlow(player.x, player.y, player.width, player.height, player.color, 0.28);
    renderer.drawRect(player.x, player.y, player.width, player.height, player.color, { shadow: true, shadowOffsetY: VISUAL.SHADOW_OFFSET });
    // Particle shimmer: emit and render
    if (!menuVisible && !pauseVisible && Math.random() < 0.18)
        emitParticle(player.x + player.width / 2, player.y + player.height / 2);
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const age = now - p.born;
        if (age >= p.life) {
            particles.splice(i, 1);
            continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt + 8 * dt;
        const t = age / p.life;
        const alpha = Math.max(0, 1 - t);
        renderer.drawRect(p.x, p.y, p.r, p.r, `rgba(255,255,255,${alpha})`);
    }
    // Subtle vignette to focus center
    if (renderer.drawVignette)
        renderer.drawVignette();
    // Clear expired feedback
    if (player.feedback && player.feedbackExpire && now > player.feedbackExpire) {
        player.feedback = null;
        player.feedbackExpire = 0;
    }
    // Update HUD DOM
    if (typeof hudEl !== 'undefined' && hudEl) {
        const invItems = player.inventory.getItems().map(i => i.name + ' x' + i.quantity).join(', ');
        // Update pre-created HUD nodes instead of replacing innerHTML each frame
        hudHP.textContent = 'HP: ' + Math.max(0, Math.round(player.hp)) + ' / ' + Math.round(player.maxHp);
        hudScore.textContent = 'Score: ' + player.score;
        hudGold.textContent = 'Gold: ' + player.gold;
        hudInv.textContent = invItems ? ('Inv: ' + invItems) : '';
        hudInv.style.display = invItems ? '' : 'none';
        hudFeedback.textContent = player.feedback ? player.feedback : '';
        hudFeedback.style.display = player.feedback ? '' : 'none';
    }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// Mouse click teleports player to click position
gameCanvas.addEventListener('click', (ev) => {
    const rect = gameCanvas.getBoundingClientRect();
    player.x = ev.clientX - rect.left - player.width / 2;
    player.y = ev.clientY - rect.top - player.height / 2;
});
