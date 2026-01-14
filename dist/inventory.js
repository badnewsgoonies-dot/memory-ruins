"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventory = createInventory;
function createInventory() {
    const items = [];
    // Inventory sizing constant to avoid magic numbers
    const INVENTORY_DEFAULT_SLOTS = 10;
    const maxSlots = INVENTORY_DEFAULT_SLOTS;
    function addItem(name, quantity = 1) {
        const existing = items.find(i => i.name === name);
        if (existing) {
            existing.quantity += quantity;
        }
        else {
            items.push({ name, quantity });
        }
        return true;
    }
    function removeItem(name, quantity = 1) {
        const idx = items.findIndex(i => i.name === name);
        if (idx === -1)
            return false;
        items[idx].quantity -= quantity;
        if (items[idx].quantity <= 0)
            items.splice(idx, 1);
        return true;
    }
    function getItem(name) {
        return items.find(i => i.name === name);
    }
    function getCount(name) {
        const item = getItem(name);
        return item ? item.quantity : 0;
    }
    function isFull() {
        return items.length >= maxSlots;
    }
    function getItems() {
        return items.slice();
    }
    function clear() {
        items.length = 0;
    }
    return { addItem, removeItem, getItem, getCount, isFull, getItems, clear };
}
