# EPubSub

A lightweight, framework-agnostic JavaScript/TypeScript publish-subscribe library that enables efficient event-driven communication between different parts of your application.

## What is Publish-Subscribe Pattern?

The Publish-Subscribe (Pub/Sub) pattern is a messaging pattern where publishers emit events to a central event bus without knowing who will receive them, and subscribers listen for specific events without knowing who published them. This creates loose coupling between components and is particularly useful for:

- Decoupling components in large applications
- Cross-component communication
- Event-driven architectures
- Implementing real-time features
- State management

## Features

- 🌐 Framework agnostic - works with any JavaScript/TypeScript application
- 🔍 TypeScript support with full type definitions
- 🎯 Namespace-based event isolation
- ⚡ Lightweight with zero dependencies
- 🔄 Support for event history and replay
- 📦 Easy to set up and use

## Installation

```bash
npm install epubsub
# or
yarn add epubsub
# or
pnpm add epubsub
```

## Usage

### Basic Usage

```typescript
import { EPubSub } from 'epubsub';

// Create a new pubsub instance with a namespace
const messagePubSub = new EPubSub<string>('messages');

// Subscribe to events
messagePubSub.subscribe((event) => {
  console.log('Received message:', event.data);
});

// Publish an event
messagePubSub.publish('Hello World!');
```

### Advanced Usage

```typescript
// Type-safe events
interface UserEvent {
  id: number;
  name: string;
  action: 'login' | 'logout';
}

const userPubSub = new EPubSub<UserEvent>('users');

// Subscribe with options
userPubSub.subscribe(
  (event) => {
    console.log('User action:', event.data);
  },
  {
    collectLastEvent: true, // Get the last event immediately
    collectPreviousEvents: true, // Get all previous events
    once: true, // Unsubscribe after first event
  },
);

// Publish typed events
userPubSub.publish({
  id: 1,
  name: 'John',
  action: 'login',
});

// Unsubscribe when needed
const callback = (event) => console.log(event);
userPubSub.subscribe(callback);
userPubSub.unsubscribe(callback);
```

## API Reference

### `EPubSub<T>`

#### Constructor

```typescript
constructor(namespace: string)
```

#### Methods

##### `subscribe(callback, options?)`

```typescript
subscribe(
  callback: (event: PubSubEvent<T>) => void,
  options?: PubSubObserverOptions
): void
```

Options:

- `collectLastEvent`: Receive the last published event immediately
- `collectPreviousEvents`: Receive all previously published events
- `once`: Automatically unsubscribe after receiving first event

##### `unsubscribe(callback)`

```typescript
unsubscribe(callback: (event: PubSubEvent<T>) => void): void
```

##### `publish(data)`

```typescript
publish(data: T): void
```

### Types

```typescript
interface PubSubEvent<T> {
  data: T;
  timestamp: Date;
}

interface PubSubObserverOptions {
  collectLastEvent?: boolean;
  collectPreviousEvents?: boolean;
  once?: boolean;
}
```
