import './App.css'

import {MessageSender} from "./MessageSender.tsx";
import {MessageReceiver} from "./MessageReceiver.tsx";

function App() {
  return (
    <>
      <MessageSender />

      <MessageReceiver />
    </>
  )
}

export default App
