import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EPubSub } from './main';

// Mock window object
declare global {
  interface Window {
    __epubsub__: any;
  }
}

describe('EPubSub', () => {
  beforeEach(() => {
    // Reset window.__epubsub__ before each test
    window.__epubsub__ = undefined;
  });

  describe('Initialization', () => {
    test('should initialize with namespace', () => {
      new EPubSub('test');

      expect(window.__epubsub__).toBeDefined();
      expect(window.__epubsub__.__events__).toBeDefined();
      expect(window.__epubsub__.__observers__).toBeDefined();
    });

    test('should initialize multiple instances with different namespaces', () => {
      window.__epubsub__ = {};

      new EPubSub('test1');
      new EPubSub('test2');

      expect(window.__epubsub__.__events__.test1).toBeDefined();
      expect(window.__epubsub__.__events__.test2).toBeDefined();
      expect(window.__epubsub__.__observers__.test2).toBeDefined();
      expect(window.__epubsub__.__observers__.test2).toBeDefined();
    });

    test('should initialize with namespace when it has been initialized', () => {
      window.__epubsub__ = {
        __events__: {
          test: [],
        },
        __observers__: {
          test: [],
        },
      };

      new EPubSub('test');

      expect(window.__epubsub__).toBeDefined();
      expect(window.__epubsub__.__events__).toBeDefined();
      expect(window.__epubsub__.__observers__).toBeDefined();
    });
  });

  describe('Publishing', () => {
    test('should publish event to subscribers', () => {
      const pubsub = new EPubSub<string>('test');
      const mockCallback = vi.fn();

      pubsub.subscribe(mockCallback);
      pubsub.publish('test message');

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'test message',
          timestamp: expect.any(Date),
        }),
      );
    });
  });

  describe('Subscription', () => {
    test('should allow multiple subscribers', () => {
      const pubsub = new EPubSub<string>('test');
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();

      pubsub.subscribe(mockCallback1);
      pubsub.subscribe(mockCallback2);
      pubsub.publish('test message');

      expect(mockCallback1).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });

    test('should handle one-time subscribers', () => {
      const pubsub = new EPubSub<string>('test');
      const mockCallback = vi.fn();

      pubsub.subscribe(mockCallback, { once: true });
      pubsub.publish('first message');
      pubsub.publish('second message');

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'first message',
        }),
      );
      expect(mockCallback).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'second message',
        }),
      );
    });
  });

  describe('Previous Events', () => {
    test('should collect previous events when option is enabled', () => {
      const pubsub = new EPubSub<string>('test');
      const mockCallback = vi.fn();

      pubsub.publish('first message');
      pubsub.publish('second message');
      pubsub.subscribe(mockCallback, { collectPreviousEvents: true });

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: 'first message',
        }),
      );
      expect(mockCallback).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: 'second message',
        }),
      );
    });

    test('should collect only last event when collectLastEvent is enabled', () => {
      const pubsub = new EPubSub<string>('test');
      const mockCallback = vi.fn();

      pubsub.publish('first message');
      pubsub.publish('second message');
      pubsub.subscribe(mockCallback, { collectLastEvent: true });

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'second message',
        }),
      );
    });

    test('should not collect events when no events are published yet', () => {
      const pubsub = new EPubSub<string>('test');
      const mockCallback = vi.fn();

      pubsub.subscribe(mockCallback, {
        collectLastEvent: true,
        collectPreviousEvents: true,
      });

      expect(mockCallback).toHaveBeenCalledTimes(0);
    });
  });

  describe('Once', () => {
    test('should collect events only once when once is enabled', () => {
      const pubsub = new EPubSub<string>('test');
      const mockCallback = vi.fn();

      pubsub.subscribe(mockCallback, { once: true });

      pubsub.publish('first message');
      pubsub.publish('second message');

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: 'first message',
        }),
      );
      expect(mockCallback).not.toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: 'second message',
        }),
      );
    });

    test('should collect previous events only once when once and collectPreviousEvents enabled', () => {
      const pubsub = new EPubSub<string>('test');
      const mockCallback = vi.fn();

      pubsub.publish('first message');
      pubsub.publish('second message');

      pubsub.subscribe(mockCallback, {
        once: true,
        collectPreviousEvents: true,
      });

      pubsub.publish('third message');

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: 'first message',
        }),
      );
      expect(mockCallback).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: 'second message',
        }),
      );
      expect(mockCallback).not.toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          data: 'third message',
        }),
      );
    });

    test('should collect last event only once when once and collectLastEvent enabled', () => {
      const pubsub = new EPubSub<string>('test');
      const mockCallback = vi.fn();

      pubsub.publish('first message');
      pubsub.publish('second message');

      pubsub.subscribe(mockCallback, { once: true, collectLastEvent: true });

      pubsub.publish('third message');

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'first message',
        }),
      );
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'second message',
        }),
      );
      expect(mockCallback).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'third message',
        }),
      );
    });
  });

  describe('Unsubscription', () => {
    test('should remove subscriber', () => {
      const pubsub = new EPubSub<string>('test');
      const mockCallback = vi.fn();

      pubsub.subscribe(mockCallback);
      pubsub.unsubscribe(mockCallback);
      pubsub.publish('test message');

      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('should only remove specified subscriber', () => {
      const pubsub = new EPubSub<string>('test');
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();

      pubsub.subscribe(mockCallback1);
      pubsub.subscribe(mockCallback2);
      pubsub.unsubscribe(mockCallback1);
      pubsub.publish('test message');

      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });
  });
});
