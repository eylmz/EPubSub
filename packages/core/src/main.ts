import {
  PubSubEvent,
  PubSubEvents,
  PubSubObserverOptions,
  PubSubObservers,
} from './types/main.types.ts';

export * from './types/main.types.ts';

export const SHARED = '__epubsub__';
export const EVENTS = '__events__';
export const OBSERVERS = '__observers__';

export class EPubSub<T = any> {
  private readonly namespace: string;

  static init() {
    if (!window[SHARED]) {
      window[SHARED] = {
        [EVENTS]: {},
        [OBSERVERS]: {},
      };
    }

    if (!window[SHARED][EVENTS]) {
      window[SHARED][EVENTS] = {};
    }

    if (!window[SHARED][OBSERVERS]) {
      window[SHARED][OBSERVERS] = {};
    }
  }

  constructor(namespace: string) {
    EPubSub.init();

    this.namespace = namespace;
    if (!this.events) this.events = [];
    if (!this.observers) this.observers = [];
  }

  private get events(): PubSubEvents<T> {
    return window[SHARED][EVENTS][this.namespace];
  }

  private set events(newEvents: PubSubEvents<T>) {
    window[SHARED][EVENTS][this.namespace] = newEvents;
  }

  private get observers(): PubSubObservers<T> {
    return window[SHARED][OBSERVERS][this.namespace];
  }

  private set observers(newObservers: PubSubObservers<T>) {
    window[SHARED][OBSERVERS][this.namespace] = newObservers;
  }

  subscribe(
    callback: (event: PubSubEvent<T>) => void,
    options: PubSubObserverOptions = {},
  ): void {
    this.observers.push({ callback, options });

    let published = false;
    if (options.collectPreviousEvents) {
      this.events.forEach((event) => callback(event));
      if (this.events.length > 0) published = true;
    }

    if (options.collectLastEvent) {
      const lastEvent = this.events[this.events.length - 1];
      if (lastEvent) {
        callback(lastEvent);
        published = true;
      }
    }

    if (options.once && published) {
      this.unsubscribe(callback);
    }
  }

  unsubscribe(callback: (event: PubSubEvent<T>) => void): void {
    this.observers = this.observers.filter(
      (observer) => observer.callback !== callback,
    );
  }

  publish(data: T): void {
    const event = { data, timestamp: new Date() };

    this.observers.forEach((observer) => {
      observer.callback(event);

      if (observer.options.once) {
        this.unsubscribe(observer.callback);
      }
    });

    this.events.push(event);
  }
}
