import { usePublish } from "epubsub-react"
import { useState } from 'react'

export const MessageSender = () => {
  const publish = usePublish("example-namespace")
  const [message, setMessage] = useState("")

  const sendMessage = () => {
    publish(message)
    setMessage("")
  }

  return (
    <div className="message-sender">
      <h2>Message Sender</h2>
      <input type="text" value={message} onChange={e => setMessage(e.target.value)}/>
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}