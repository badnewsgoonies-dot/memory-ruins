"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Core game loop with explicit state machine and fixed timestep
const audioManager_js_1 = require("./audioManager.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let audio = null;
const TARGET_FPS = 60;
const FIXED_TIMESTEP_MS = Math.round(1000 / TARGET_FPS);
// Named durations (in ticks) to avoid magic numbers
const MENU_DURATION_TICKS = TARGET_FPS * 1; // 1 second
const PLAY_DURATION_TICKS = TARGET_FPS * 60; // 60 seconds
const PAUSE_DURATION_TICKS = TARGET_FPS * 1; // 1 second
const GAMEOVER_DURATION_TICKS = TARGET_FPS * 1; // 1 second
// Gameplay timing constants
const PLAYER_HEALTH_DECAY_TICKS = TARGET_FPS * 5; // player loses 1 HP every 5 seconds (slower decay for pacing)
const FEEDBACK_DURATION_TICKS = Math.round(TARGET_FPS * 0.5); // feedback visible ~0.5s
// Inventory constants
const INVENTORY_MAX_SLOTS = 10;
// Currency and shop constants
const STARTING_COINS = 20;
const MEDKIT_PRICE = 5;
const AMMO_PRICE = 3;
const SELL_MULTIPLIER = 0.5;
var GamePhase;
(function (GamePhase) {
    GamePhase["MENU"] = "MENU";
    GamePhase["PLAYING"] = "PLAYING";
    GamePhase["PAUSED"] = "PAUSED";
    GamePhase["GAME_OVER"] = "GAME_OVER";
})(GamePhase || (GamePhase = {}));
const INITIAL_STATE = {
    phase: GamePhase.MENU,
    tick: 0,
    phaseTick: 0,
    running: true,
    player: { health: 10, maxHealth: 10, score: 0, ammo: 0, gold: 50, inventory: [] },
    feedback: { text: null, ticksLeft: 0 },
};
function transitionTo(state, phase) {
    return { ...state, phase, phaseTick: 0 };
}
function addItemToInventory(state, item) {
    const it = { id: item.id, name: item.name, count: item.count ?? 1 };
    const playerInv = [...state.player.inventory];
    const idx = playerInv.findIndex(i => i.id === it.id);
    if (idx >= 0) {
        playerInv[idx] = { ...playerInv[idx], count: playerInv[idx].count + it.count };
    }
    else {
        if (playerInv.length < INVENTORY_MAX_SLOTS)
            playerInv.push(it);
        else
            return { ...state, feedback: { text: 'Inventory Full', ticksLeft: FEEDBACK_DURATION_TICKS } };
    }
    return { ...state, player: { ...state.player, inventory: playerInv }, feedback: { text: `Picked up ${it.name}`, ticksLeft: FEEDBACK_DURATION_TICKS } };
}
function useItemFromInventory(state, itemId) {
    const playerInv = [...state.player.inventory];
    const idx = playerInv.findIndex(i => i.id === itemId);
    if (idx < 0)
        return { ...state, feedback: { text: 'No such item', ticksLeft: FEEDBACK_DURATION_TICKS } };
    const item = playerInv[idx];
    let updatedPlayer = { ...state.player };
    if (item.id === 'medkit') {
        updatedPlayer = { ...updatedPlayer, health: Math.min(updatedPlayer.maxHealth, updatedPlayer.health + 2) };
    }
    else if (item.id === 'ammo') {
        updatedPlayer = { ...updatedPlayer, ammo: updatedPlayer.ammo + 5 };
    }
    else {
        updatedPlayer = { ...updatedPlayer, score: updatedPlayer.score + 10 };
    }
    if (item.count > 1)
        playerInv[idx] = { ...item, count: item.count - 1 };
    else
        playerInv.splice(idx, 1);
    updatedPlayer = { ...updatedPlayer, inventory: playerInv };
    return { ...state, player: updatedPlayer, feedback: { text: `Used ${item.name}`, ticksLeft: FEEDBACK_DURATION_TICKS } };
}
let SHOP_ITEMS = [
    { id: 'medkit', name: 'Medkit', price: 10 },
    { id: 'ammo', name: 'Ammo', price: 5 },
];
// Attempt to load shop items from assets/ui/shop.json (synchronous in Node, fetch fallback in browser)
try {
    // Node.js environment
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    const data = fs.readFileSync(path.join(__dirname, '..', 'assets', 'ui', 'shop.json'), 'utf8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed))
        SHOP_ITEMS = parsed;
    else if (parsed && parsed.shop)
        SHOP_ITEMS = parsed.shop;
}
catch (e) {
    // Browser/webpack fallback
    if (typeof fetch !== 'undefined') {
        fetch('/assets/ui/shop.json').then(r => r.json()).then(j => { if (Array.isArray(j))
            SHOP_ITEMS = j;
        else if (j && j.shop)
            SHOP_ITEMS = j.shop; }).catch(() => { });
    }
}
function buyItemFromShop(state, itemId) {
    const item = SHOP_ITEMS.find(s => s.id === itemId);
    if (!item)
        return { ...state, feedback: { text: 'No such shop item', ticksLeft: FEEDBACK_DURATION_TICKS } };
    if (state.player.gold < item.price)
        return { ...state, feedback: { text: 'Not enough gold', ticksLeft: FEEDBACK_DURATION_TICKS } };
    if (state.player.inventory.length >= INVENTORY_MAX_SLOTS)
        return { ...state, feedback: { text: 'Inventory Full', ticksLeft: FEEDBACK_DURATION_TICKS } };
    let newState = { ...state, player: { ...state.player, gold: state.player.gold - item.price } };
    newState = addItemToInventory(newState, { id: item.id, name: item.name });
    return { ...newState, feedback: { text: `Bought ${item.name} for ${item.price}g`, ticksLeft: FEEDBACK_DURATION_TICKS } };
}
function sellFirstInventoryItem(state) {
    if (state.player.inventory.length === 0)
        return { ...state, feedback: { text: 'Inventory empty', ticksLeft: FEEDBACK_DURATION_TICKS } };
    const item = state.player.inventory[0];
    const shopEntry = SHOP_ITEMS.find(s => s.id === item.id);
    const price = shopEntry ? Math.floor(shopEntry.price / 2) : 1;
    let updatedInv = [...state.player.inventory];
    if (item.count > 1)
        updatedInv[0] = { ...item, count: item.count - 1 };
    else
        updatedInv.splice(0, 1);
    const updatedPlayer = { ...state.player, inventory: updatedInv, gold: state.player.gold + price };
    return { ...state, player: updatedPlayer, feedback: { text: `Sold ${item.name} for ${price}g`, ticksLeft: FEEDBACK_DURATION_TICKS } };
}
function update(state) {
    const next = { ...state, tick: state.tick + 1, phaseTick: state.phaseTick + 1 };
    switch (state.phase) {
        case GamePhase.MENU:
            if (state.phaseTick >= MENU_DURATION_TICKS) {
                return transitionTo(next, GamePhase.PLAYING);
            }
            return next;
        case GamePhase.PLAYING:
            // Demo gameplay: periodic damage to showcase HUD and feedback cues
            const DAMAGE_INTERVAL_TICKS = PLAYER_HEALTH_DECAY_TICKS;
            let updated = { ...next };
            if (state.phaseTick >= PLAY_DURATION_TICKS) {
                return transitionTo(updated, GamePhase.GAME_OVER);
            }
            // Apply periodic damage for demo purposes
            if (state.tick > 0 && state.tick % DAMAGE_INTERVAL_TICKS === 0) {
                updated = {
                    ...updated,
                    player: { ...state.player, health: Math.max(0, state.player.health - 1) },
                    feedback: { text: 'Hit! -1 HP', ticksLeft: FEEDBACK_DURATION_TICKS },
                };
                if (audio)
                    audio.playSFX('hit');
            }
            else {
                // decay feedback timer
                const ticksLeft = Math.max(0, state.feedback.ticksLeft - 1);
                updated = { ...updated, feedback: { text: ticksLeft > 0 ? state.feedback.text : null, ticksLeft } };
            }
            // If player died, go to GAME_OVER
            if (updated.player.health <= 0) {
                return transitionTo({ ...updated, running: true }, GamePhase.GAME_OVER);
            }
            return updated;
        case GamePhase.PAUSED:
            if (state.phaseTick >= PAUSE_DURATION_TICKS) {
                return transitionTo(next, GamePhase.PLAYING);
            }
            return next;
        case GamePhase.GAME_OVER:
            if (state.phaseTick >= GAMEOVER_DURATION_TICKS) {
                return { ...next, running: false };
            }
            return next;
        default:
            return next;
    }
}
function render(state) {
    // Minimal textual render for headless environments; real renderers subscribe to state
    console.log(`PHASE=${state.phase} TICK=${state.tick} PHASE_TICK=${state.phaseTick}`);
}
function setupInputHandlers(handleKey) {
    // Basic CLI input: passes raw key sequences to handler for menu and pause navigation.
    if (typeof process === 'undefined' || !process.stdin || !process.stdin.setRawMode)
        return;
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (chunk) => {
        const key = String(chunk);
        handleKey(key);
        if (key === '\u0003') { // ctrl-c
            process.exit(0);
        }
    });
}
function main() {
    let state = { ...INITIAL_STATE };
    // Menu definitions loaded from assets/ui/menu.json to avoid hardcoded arrays
    function loadMenuDefs() {
        try {
            const p = path_1.default.join(process.cwd(), 'assets', 'ui', 'menu.json');
            const raw = fs_1.default.readFileSync(p, 'utf8');
            const json = JSON.parse(raw);
            return {
                mainMenu: Array.isArray(json.mainMenu) ? json.mainMenu : ['Start Game', 'Options', 'Exit'],
                pauseMenu: Array.isArray(json.pauseMenu) ? json.pauseMenu : ['Resume', 'Restart', 'Exit to Menu']
            };
        }
        catch (e) {
            return { mainMenu: ['Start Game', 'Options', 'Exit'], pauseMenu: ['Resume', 'Restart', 'Exit to Menu'] };
        }
    }
    const { mainMenu: mainMenuOptions, pauseMenu: pauseMenuOptions } = loadMenuDefs();
    let mainMenuIndex = 0;
    let pauseMenuIndex = 0;
    function handleKey(key) {
        // Toggle pause with 'p'
        if (key === 'p') {
            if (state.phase === GamePhase.PLAYING) {
                state = transitionTo(state, GamePhase.PAUSED);
            }
            else if (state.phase === GamePhase.PAUSED) {
                state = transitionTo(state, GamePhase.PLAYING);
            }
            return;
        }
        // Inventory shortcuts: 'c' to collect demo medkit, 'u' to use first item
        if (key === 'c') {
            state = addItemToInventory(state, { id: 'medkit', name: 'Medkit' });
            return;
        }
        if (key === 'u') {
            if (state.player.inventory.length > 0) {
                state = useItemFromInventory(state, state.player.inventory[0].id);
            }
            else {
                state = { ...state, feedback: { text: 'Inventory empty', ticksLeft: FEEDBACK_DURATION_TICKS } };
            }
            return;
        }
        // Menu navigation (arrow up/down sequences or w/s)
        if (state.phase === GamePhase.MENU) {
            if (key === '\u001b[A' || key === '\x1b[A' || key === 'w') {
                mainMenuIndex = (mainMenuIndex - 1 + mainMenuOptions.length) % mainMenuOptions.length;
            }
            else if (key === '\u001b[B' || key === '\x1b[B' || key === 's') {
                mainMenuIndex = (mainMenuIndex + 1) % mainMenuOptions.length;
            }
            else if (key === '\r' || key === '\n') {
                const sel = mainMenuOptions[mainMenuIndex];
                if (sel === 'Start Game') {
                    state = transitionTo(state, GamePhase.PLAYING);
                    if (!audio)
                        audio = (0, audioManager_js_1.createAudioManager)();
                    if (audio)
                        audio.playMusic('music_theme');
                }
                else if (sel === 'Exit')
                    state = { ...state, running: false };
            }
            return;
        }
        if (state.phase === GamePhase.PLAYING) {
            // Gameplay keys: 'g' or 'c' to collect demo item, 'u' to use first item
            if (key === 'g' || key === 'c') {
                const itemId = (state.tick % 2 === 0) ? 'medkit' : 'ammo';
                const itemName = itemId === 'medkit' ? 'Medkit' : 'Ammo';
                state = addItemToInventory(state, { id: itemId, name: itemName });
            }
            else if (key === 'u') {
                if (state.player.inventory.length > 0) {
                    state = useItemFromInventory(state, state.player.inventory[0].id);
                }
                else {
                    state = { ...state, feedback: { text: 'Inventory empty', ticksLeft: FEEDBACK_DURATION_TICKS } };
                }
            }
            else if (key === 'b') {
                // buy medkit
                state = buyItemFromShop(state, 'medkit');
            }
            else if (key === 'n') {
                // buy ammo
                state = buyItemFromShop(state, 'ammo');
            }
            else if (key === 'S') {
                // sell first item
                state = sellFirstInventoryItem(state);
            }
            return;
        }
        if (state.phase === GamePhase.PAUSED) {
            if (key === '\u001b[A' || key === '\x1b[A' || key === 'w') {
                pauseMenuIndex = (pauseMenuIndex - 1 + pauseMenuOptions.length) % pauseMenuOptions.length;
            }
            else if (key === '\u001b[B' || key === '\x1b[B' || key === 's') {
                pauseMenuIndex = (pauseMenuIndex + 1) % pauseMenuOptions.length;
            }
            else if (key === '\r' || key === '\n') {
                const sel = pauseMenuOptions[pauseMenuIndex];
                if (sel === 'Resume')
                    state = transitionTo(state, GamePhase.PLAYING);
                else if (sel === 'Restart')
                    state = transitionTo({ ...INITIAL_STATE, tick: state.tick }, GamePhase.PLAYING);
                else if (sel === 'Exit to Menu')
                    state = transitionTo({ ...INITIAL_STATE, running: true }, GamePhase.MENU);
            }
            return;
        }
    }
    setupInputHandlers(handleKey);
    function renderUI() {
        if (state.phase === GamePhase.MENU) {
            console.clear();
            console.log('=== MAIN MENU ===');
            mainMenuOptions.forEach((opt, i) => {
                console.log((i === mainMenuIndex ? '> ' : '  ') + opt);
            });
        }
        else if (state.phase === GamePhase.PAUSED) {
            console.log('=== PAUSED ===');
            pauseMenuOptions.forEach((opt, i) => {
                console.log((i === pauseMenuIndex ? '> ' : '  ') + opt);
            });
        }
        else if (state.phase === GamePhase.PLAYING) {
            // HUD display
            const p = state.player;
            const filled = Math.max(0, Math.min(p.maxHealth, p.health));
            const healthBar = '[' + '#'.repeat(filled) + '-'.repeat(Math.max(0, p.maxHealth - filled)) + ']';
            console.log(`HUD: Health ${healthBar} (${p.health}/${p.maxHealth}) Score: ${p.score} Ammo: ${p.ammo} Gold: ${p.gold}`);
            if (state.feedback.text) {
                console.log(`>> ${state.feedback.text}`);
            }
            // Inventory UI
            if (p.inventory && p.inventory.length > 0) {
                console.log('Inventory:');
                p.inventory.forEach((it, i) => console.log(`  ${i + 1}. ${it.name} x${it.count}`));
            }
            else {
                console.log('Inventory: (empty)');
            }
        }
    }
    const interval = setInterval(() => {
        state = update(state);
        render(state);
        renderUI();
        if (!state.running) {
            clearInterval(interval);
            console.log('Game loop finished: exiting');
            process.exit(0);
        }
    }, FIXED_TIMESTEP_MS);
}
main();
