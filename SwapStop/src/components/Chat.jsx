import { useState, useRef, useEffect } from "react";
import "../App.css";
import "./Chat.css";


export default function Chat() {
  const [messages, setMessages] = useState([
    { user: "System", text: "Welcome to SwapStop Chat!", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() && !image) return;
    setMessages((msgs) => [
      ...msgs,
      {
        user: "You",
        text: input.trim(),
        image: image || null,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setImage(null);
  }

  return (
    <section className="card chat-card">
      <h2>Chat</h2>
      <div className="chat-messages">
        {messages.map((msg, i) => {
          const isUser = msg.user === "You";
          const isSystem = msg.user === "System";
          // Format timestamp as HH:MM
          let time = "";
          if (msg.timestamp) {
            const d = new Date(msg.timestamp);
            const h = d.getHours().toString().padStart(2, "0");
            const m = d.getMinutes().toString().padStart(2, "0");
            time = `${h}:${m}`;
          }
          return (
            <div
              key={i}
              className={`chat-message ${isUser ? "user" : "other"}`}
            >
              <span className={`chat-user ${isUser ? "user" : "other"}`}>
                {isSystem ? "System" : msg.user}
                {time && <span className="chat-time">{time}</span>}
              </span>
              <div
                className={`chat-bubble${isSystem ? " system" : isUser ? " user" : " other"}`}
                style={{ marginBottom: msg.image ? 6 : 0 }}
              >
                {msg.text}
                {msg.image && (
                  <div style={{ marginTop: msg.text ? 8 : 0, display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                    <img
                      src={msg.image}
                      alt="chat upload"
                      className="chat-image"
                      onClick={() => setExpandedImage(msg.image)}
                      title="Click to expand"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-form">
        <input
          className="input"
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <label className="chat-file-label">
          <span
            className={`chat-file-icon ${image ? "active" : "inactive"}`}
            style={{
              marginRight: 4,
              border: image ? "1px solid #22c55e" : "1px solid #1e293b",
            }}
          >
            📷
          </span>
        </label>
        <button className="btn" type="submit">
          Send
        </button>
      </form>
      {image && (
        <div className="chat-image-preview">
          <span className="chat-image-preview-label">Image preview:</span>
          <button
            type="button"
            onClick={() => setImage(null)}
            className="chat-remove-image"
            aria-label="Remove image"
          >
            ×
          </button>
          <img
            src={image}
            alt="preview"
            className="chat-image-preview-img"
          />
        </div>
      )}
    </section>
  );
}
