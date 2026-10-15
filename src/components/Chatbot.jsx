import { useState, useRef, useEffect } from "react";
import api from "../api/api.js";

const SUGGESTIONS = [
  "What are today's specials?",
  "Any vegetarian options?",
  "What do you recommend?",
  "Gluten-free options?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about specials, dietary options, or what to order." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  async function sendMessage(text) {
    const message = text ?? input;
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: message }]);
    setInput("");
    setSending(true);

    try {
      const { data } = await api.post("/chatbot", { message });
      setMessages((prev) => [...prev, { from: "bot", text: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, I couldn't reach the kitchen right now. Try again shortly." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div className="chat-window" role="dialog" aria-label="Restaurant assistant">
          <div className="chat-header">
            <span>Ask the Assistant</span>
            <button className="btn-ghost" onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>
          <div className="chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>
                {m.text}
              </div>
            ))}
            {sending && <div className="chat-msg bot">Typing…</div>}
          </div>
          <div className="chat-suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
          <form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a question…"
              aria-label="Chat message"
            />
            <button type="submit" disabled={sending}>
              Send
            </button>
          </form>
        </div>
      )}
      <button className="chat-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle chat assistant">
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}