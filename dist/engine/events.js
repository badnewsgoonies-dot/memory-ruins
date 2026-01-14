"use strict";
// Minimal Event Bus implementation
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultEventBus = exports.EventBus = void 0;
class EventBus {
    constructor() {
        this.subscriptions = new Map();
    }
    subscribe(topic, handler) {
        if (!this.subscriptions.has(topic)) {
            this.subscriptions.set(topic, new Set());
        }
        this.subscriptions.get(topic).add(handler);
        return { topic, handler: handler };
    }
    unsubscribe(sub) {
        const set = this.subscriptions.get(sub.topic);
        if (!set)
            return;
        set.delete(sub.handler);
        if (set.size === 0)
            this.subscriptions.delete(sub.topic);
    }
    publish(topic, payload) {
        const set = this.subscriptions.get(topic);
        if (!set)
            return;
        // Synchronously invoke subscribers; copy to avoid mutation during iteration
        const handlers = Array.from(set);
        const event = { topic, payload };
        for (const h of handlers) {
            try {
                h(event);
            }
            catch (err) {
                // swallow errors to avoid breaking other listeners; consider logging
                // In production, route errors to an error handling system
            }
        }
    }
}
exports.EventBus = EventBus;
exports.defaultEventBus = new EventBus();
