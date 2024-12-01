import { useSubscribe } from "epubsub-react"

export const MessageReceiver = () => {
  const { events } = useSubscribe("example-namespace")

  return (
    <div className="message-receiver">
      <h2>Message Receiver</h2>
      <ol>
        {events.map((event, index) => (
          <li key={index}>{event.data}</li>
        ))}
      </ol>
    </div>
  )
}