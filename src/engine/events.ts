// Minimal Event Bus implementation

export type EventTopic = string;

export interface Event<T = any> {
  readonly topic: EventTopic;
  readonly payload: T;
}

export type EventHandler<T = any> = (event: Event<T>) => void;

export interface Subscription {
  readonly topic: EventTopic;
  readonly handler: EventHandler<any>;
}

export class EventBus {
  private subscriptions: Map<EventTopic, Set<EventHandler<any>>> = new Map();

  subscribe<T = any>(topic: EventTopic, handler: EventHandler<T>): Subscription {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(handler as EventHandler<any>);
    return { topic, handler: handler as EventHandler<any> };
  }

  unsubscribe(sub: Subscription): void {
    const set = this.subscriptions.get(sub.topic);
    if (!set) return;
    set.delete(sub.handler);
    if (set.size === 0) this.subscriptions.delete(sub.topic);
  }

  publish<T = any>(topic: EventTopic, payload: T): void {
    const set = this.subscriptions.get(topic);
    if (!set) return;
    // Synchronously invoke subscribers; copy to avoid mutation during iteration
    const handlers = Array.from(set);
    const event: Event<T> = { topic, payload };
    for (const h of handlers) {
      try {
        h(event);
      } catch (err) {
        // swallow errors to avoid breaking other listeners; consider logging
        // In production, route errors to an error handling system
      }
    }
  }
}

export const defaultEventBus = new EventBus();
