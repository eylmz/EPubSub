export interface PubSubEvent<T = any> {
  data: T;
  timestamp: Date;
}

export type PubSubEvents<T = any> = PubSubEvent<T>[];

export interface PubSubObserver<T = any> {
  callback: (event: PubSubEvent<T>) => void;
  options: PubSubObserverOptions;
}

export interface PubSubObserverOptions {
  collectPreviousEvents?: boolean;
  collectLastEvent?: boolean;
  once?: boolean;
}

export type PubSubObservers<T = any> = PubSubObserver<T>[];
