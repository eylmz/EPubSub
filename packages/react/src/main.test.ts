// hooks.test.tsx
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import {
  usePubSub,
  usePublish,
  useSingleSubscribe,
  useSubscribe,
} from './main';

describe('usePubSub', () => {
  test('should create singleton instance', () => {
    const { result: result1 } = renderHook(() => usePubSub('test'));
    const { result: result2 } = renderHook(() => usePubSub('test'));

    expect(result1.current).toBeDefined();
    expect(result1.current).toEqual(result2.current);
  });

  test('should create different instances for different namespaces', () => {
    const { result: result1 } = renderHook(() => usePubSub('test1'));
    const { result: result2 } = renderHook(() => usePubSub('test2'));

    expect(result1.current).not.toBe(result2.current);
  });
});

describe('usePublish', () => {
  test('should return publish function', () => {
    const { result } = renderHook(() => usePublish('test'));
    expect(typeof result.current).toBe('function');
  });

  test('should publish data to subscribers', () => {
    const testData = 'test message';
    const { result: publishResult } = renderHook(() =>
      usePublish<string>('test'),
    );
    const { result: subscribeResult } = renderHook(() =>
      useSubscribe<string>('test'),
    );

    act(() => {
      publishResult.current(testData);
    });

    expect(subscribeResult.current.events).toHaveLength(1);
    expect(subscribeResult.current.events[0].data).toBe(testData);
  });
});

describe('useSubscribe', () => {
  beforeEach(() => {
    // Reset window.__epubsub__ before each test
    window.__epubsub__ = undefined;
  });

  test('should receive published events', () => {
    const { result: subscribeResult } = renderHook(() =>
      useSubscribe<string>('test'),
    );
    const { result: publishResult } = renderHook(() =>
      usePublish<string>('test'),
    );

    act(() => {
      publishResult.current('message 1');
      publishResult.current('message 2');
    });

    expect(subscribeResult.current.events).toHaveLength(2);
    expect(subscribeResult.current.events[0].data).toBe('message 1');
    expect(subscribeResult.current.events[1].data).toBe('message 2');
  });

  test('should collect previous events when option is enabled', () => {
    const { result: publishResult } = renderHook(() =>
      usePublish<string>('test'),
    );

    act(() => {
      publishResult.current('previous message');
    });

    const { result: subscribeResult } = renderHook(() =>
      useSubscribe<string>('test', { collectPreviousEvents: true }),
    );

    expect(subscribeResult.current.events).toHaveLength(1);
    expect(subscribeResult.current.events[0].data).toBe('previous message');
  });

  test('should unsubscribe on unmount', () => {
    const { result: publishResult } = renderHook(() =>
      usePublish<string>('test'),
    );
    const { result: subscribeResult, unmount } = renderHook(() =>
      useSubscribe<string>('test'),
    );

    act(() => {
      publishResult.current('message 1');
    });

    unmount();

    act(() => {
      publishResult.current('message 2');
    });

    expect(subscribeResult.current.events).toHaveLength(1);
  });
});

describe('useSingleSubscribe', () => {
  beforeEach(() => {
    window.__epubsub__ = undefined;
  });

  test('should receive only one event', () => {
    const { result: singleSubResult } = renderHook(() =>
      useSingleSubscribe<string>('test'),
    );
    const { result: publishResult } = renderHook(() =>
      usePublish<string>('test'),
    );

    act(() => {
      publishResult.current('message 1');
      publishResult.current('message 2');
    });

    expect(singleSubResult.current?.data).toBe('message 1');
  });

  test('should collect last event if available', () => {
    const { result: publishResult } = renderHook(() =>
      usePublish<string>('test'),
    );

    act(() => {
      publishResult.current('previous message');
    });

    const { result: singleSubResult } = renderHook(() =>
      useSingleSubscribe<string>('test'),
    );

    expect(singleSubResult.current?.data).toBe('previous message');
  });

  test('should unsubscribe after receiving first event', () => {
    const { result: singleSubResult } = renderHook(() =>
      useSingleSubscribe<string>('test'),
    );
    const { result: publishResult } = renderHook(() =>
      usePublish<string>('test'),
    );

    act(() => {
      publishResult.current('message 1');
    });

    const firstEvent = singleSubResult.current;

    act(() => {
      publishResult.current('message 2');
    });

    expect(singleSubResult.current).toBe(firstEvent);
    expect(singleSubResult.current?.data).toBe('message 1');
  });

  test('should unsubscribe on unmount', () => {
    const { result: singleSubResult, unmount } = renderHook(() =>
      useSingleSubscribe<string>('test'),
    );
    const { result: publishResult } = renderHook(() =>
      usePublish<string>('test'),
    );

    unmount();

    act(() => {
      publishResult.current('message');
    });

    expect(singleSubResult.current).toBeUndefined();
  });
});
