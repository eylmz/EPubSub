# EPubSub React

React hooks for EPubSub - a lightweight publish-subscribe library for React applications.

## Features

- 🎯 Custom hooks for React components
- 🔄 Automatic cleanup on component unmount
- 💪 TypeScript support
- ⚡ Efficient state updates
- 🎨 Easy integration with React components

## Installation

```bash
npm install epubsub-react
# or
yarn add epubsub-react
# or
pnpm add epubsub-react
```

## Usage

### Basic Usage

```tsx
import { usePublish, useSubscribe } from 'epubsub-react';

// Publisher Component
function MessageSender() {
  const publish = usePublish<string>('chat');

  const sendMessage = () => {
    publish('Hello from React!');
  };

  return <button onClick={sendMessage}>Send Message</button>;
}

// Subscriber Component
function MessageReceiver() {
  const { events } = useSubscribe<string>('chat');

  return (
    <div>
      {events.map((event, index) => (
        <p key={index}>{event.data}</p>
      ))}
    </div>
  );
}
```

### Advanced Usage with TypeScript

```tsx
interface UserEvent {
  id: number;
  name: string;
  status: 'online' | 'offline';
}

// Component that needs the latest user status
function UserStatus() {
  const event = useSingleSubscribe<UserEvent>('userStatus');

  if (!event) return <div>Loading...</div>;

  return (
    <div>
      User {event.data.name} is {event.data.status}
    </div>
  );
}

// Component that updates user status
function StatusUpdater() {
  const publish = usePublish<UserEvent>('userStatus');

  const updateStatus = (status: 'online' | 'offline') => {
    publish({
      id: 1,
      name: 'John',
      status,
    });
  };

  return (
    <div>
      <button onClick={() => updateStatus('online')}>Set Online</button>
      <button onClick={() => updateStatus('offline')}>Set Offline</button>
    </div>
  );
}
```

## Available Hooks

### `usePubSub<T>`

Creates or retrieves a singleton instance of EPubSub for a given namespace.

```typescript
const pubsub = usePubSub<T>(namespace: string)
```

### `usePublish<T>`

Returns a function to publish events to a specific namespace.

```typescript
const publish = usePublish<T>(namespace: string)
```

### `useSubscribe<T>`

Subscribes to events in a namespace and returns an array of received events.

```typescript
const { events } = useSubscribe<T>(
  namespace: string,
  options?: {
    collectLastEvent?: boolean;
    collectPreviousEvents?: boolean;
    once?: boolean;
  }
)
```

### `useSingleSubscribe<T>`

Subscribes to a namespace and returns only the latest event. Automatically unsubscribes after receiving the first event.

```typescript
const event = useSingleSubscribe<T>(namespace: string)
```

## Examples

### Real-time Form Synchronization

```tsx
// Form A - Updates form data
function FormA() {
  const publish = usePublish<FormData>('form-sync');

  const handleChange = (e) => {
    publish({
      field: e.target.name,
      value: e.target.value,
    });
  };

  return <input name="username" onChange={handleChange} />;
}

// Form B - Receives updates
function FormB() {
  const { events } = useSubscribe<FormData>('form-sync');
  const lastEvent = events[events.length - 1];

  return (
    <div>
      Last update: {lastEvent?.data.field} = {lastEvent?.data.value}
    </div>
  );
}
```

### Global Notifications

```tsx
// Notification Publisher
function NotificationSender() {
  const publish = usePublish<string>('notifications');

  return (
    <button onClick={() => publish('New notification!')}>
      Send Notification
    </button>
  );
}

// Notification Display
function NotificationDisplay() {
  const { events } = useSubscribe<string>('notifications', {
    collectLastEvent: true,
  });

  return (
    <div className="notifications">
      {events.map((event, index) => (
        <div key={index} className="notification">
          {event.data}
          <small>{event.timestamp.toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
```
