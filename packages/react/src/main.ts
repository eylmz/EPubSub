import { EPubSub, PubSubEvent, PubSubObserverOptions } from 'epubsub';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Initializes and returns a singleton instance of an EPubSub object within the specified namespace.
 * The instance is created only upon the first invocation of the method and is reused on subsequent calls.
 *
 * @param namespace The namespace within which the EPubSub instance will operate.
 * @return A singleton instance of EPubSub operating under the specified namespace.
 */
export function usePubSub<T = any>(namespace: string) {
  const pubsubRef = useRef<EPubSub<T>>();

  if (!pubsubRef.current) {
    pubsubRef.current = new EPubSub<T>(namespace);
  }

  return pubsubRef.current;
}

/**
 * Custom hook that sets up a publish function for a given namespace.
 * It utilizes a publish-subscribe mechanism to publish data of type T.
 *
 * @param {string} namespace - The namespace under which the publish function will operate.
 * @return {Function} A callback function that publishes data to the specified namespace.
 */
export function usePublish<T>(namespace: string) {
  const pubsub = usePubSub<T>(namespace);

  return useCallback((data: T) => pubsub.publish(data), [pubsub]);
}

/**
 * Subscribes to a namespace and listens for events, collecting them into an array.
 *
 * @param {string} namespace - The namespace to subscribe to for receiving events.
 * @param {PubSubObserverOptions} [options={}] - Optional configuration for subscribing, including settings like collecting the last event or previous events, and subscribing only once.
 * @return {Object} An object containing the array of events received from the pub/sub system.
 */
export function useSubscribe<T>(
  namespace: string,
  options: PubSubObserverOptions = {},
) {
  const pubsub = usePubSub<T>(namespace);
  const [events, setEvents] = useState<PubSubEvent<T>[]>([]);

  useEffect(() => {
    const handleEvent = (event: PubSubEvent<T>) =>
      setEvents((events) => [...events, event]);

    pubsub.subscribe(handleEvent, options);

    return () => pubsub.unsubscribe(handleEvent);
  }, [
    namespace,
    options.collectLastEvent,
    options.collectPreviousEvents,
    options.once,
  ]);

  return { events };
}

/**
 * A custom hook that sets up a single-use subscription to a pub/sub system.
 * It subscribes to events within a specified namespace and updates the state with the last published event.
 * This subscription automatically unsubscribes after receiving the first event.
 *
 * @param namespace The namespace to subscribe to for events. This string determines the channel within the pub/sub system from which to receive events.
 * @return The latest event published within the specified namespace, or undefined if no events have been captured.
 */
export function useSingleSubscribe<T>(namespace: string) {
  const [event, setEvent] = useState<PubSubEvent<T>>();
  const pubsub = usePubSub<T>(namespace);

  useEffect(() => {
    const handleEvent = (event: PubSubEvent<T>) => setEvent(event);

    pubsub.subscribe(handleEvent, { once: true, collectLastEvent: true });

    return () => pubsub.unsubscribe(handleEvent);
  }, [namespace, pubsub]);

  return event;
}
