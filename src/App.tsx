import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

interface Message {
  id: string;
  sender: "me" | "other" | "system";
  username: string;
  text: string;
  time: string;
}

interface InboundChat {
  type: "chat";
  username: string;
  message: string;
  time: string;
}

interface InboundRoomUsers {
  type: "roomUsers";
  users: string[];
}

interface InboundJoined {
  type: "joined";
  roomId: string;
}

type InboundMessage = InboundChat | InboundRoomUsers | InboundJoined;

const WS_URL =
  import.meta.env.VITE_WS_URL ??
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}${
    import.meta.env.DEV ? "/ws" : ""
  }`;

function makeRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function initials(name: string) {
  return (name.trim() || "??").slice(0, 2).toUpperCase();
}

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        ...styles.avatar,
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.36),
      }}
    >
      {initials(name)}
    </div>
  );
}

export default function App() {
  const startingRoom = useMemo(makeRoomId, []);
  const [username, setUsername] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [currentRoom, setCurrentRoom] = useState(startingRoom);
  const [enteredChat, setEnteredChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const usernameRef = useRef(username);
  const currentRoomRef = useRef(currentRoom);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!enteredChat) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(
        JSON.stringify({
          type: "join",
          payload: { roomId: currentRoomRef.current, username: usernameRef.current },
        }),
      );
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      let data: InboundMessage;

      try {
        data = JSON.parse(event.data) as InboundMessage;
      } catch {
        return;
      }

      if (data.type === "roomUsers") {
        setOnlineUsers(data.users);
        return;
      }

      if (data.type === "joined") {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: "system",
            username: "system",
            text: `Joined room ${data.roomId}`,
            time: formatTime(),
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: data.username === usernameRef.current ? "me" : "other",
          username: data.username,
          text: data.message,
          time: data.time,
        },
      ]);
    };

    ws.onclose = () => {
      setConnected(false);
      setOnlineUsers([]);
      if (wsRef.current === ws) wsRef.current = null;
    };

    ws.onerror = () => {
      setConnected(false);
    };

    return () => ws.close();
  }, [enteredChat]);

  const canEnter = username.trim().length > 0;
  const canSend = input.trim().length > 0;

  const joinRoom = () => {
    if (!canEnter) return;

    const nextRoom = (roomInput.trim() || currentRoom).toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setCurrentRoom(nextRoom);
    setMessages([]);
    setEnteredChat(true);
  };

  const createNewRoom = () => {
    const room = makeRoomId();
    setCurrentRoom(room);
    setRoomInput("");
  };

  const copyRoom = async () => {
    await navigator.clipboard?.writeText(currentRoom);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "chat", payload: { message: text } }));
      setInput("");
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "system",
        username: "system",
        text: "Connect the backend server to send real room messages.",
        time: formatTime(),
      },
    ]);
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  if (!enteredChat) {
    return (
      <main style={styles.scene}>
        <section style={styles.startPanel}>
          <div>
            <h1 style={styles.title}>Simple Chat</h1>
            <p style={styles.subtitle}>Create a room code or enter a friend's code to join.</p>
          </div>

          <div style={styles.roomCard}>
            <span style={styles.label}>Your room id</span>
            <div style={styles.roomCodeRow}>
              <strong style={styles.roomCode}>{currentRoom}</strong>
              <button type="button" onClick={copyRoom} style={styles.smallButton}>
                Copy
              </button>
              <button type="button" onClick={createNewRoom} style={styles.smallButton}>
                New
              </button>
            </div>
          </div>

          <label style={styles.field}>
            <span style={styles.label}>Your name</span>
            <input
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") joinRoom();
              }}
              placeholder="Alex"
              style={styles.textInput}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Join room id</span>
            <input
              value={roomInput}
              onChange={(event) => setRoomInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") joinRoom();
              }}
              placeholder={currentRoom}
              style={styles.textInput}
            />
          </label>

          <button type="button" onClick={joinRoom} disabled={!canEnter} style={styles.primaryButton}>
            Enter chat
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.scene}>
      <aside style={styles.sidebar}>
        <section style={styles.panel}>
          <span style={styles.label}>Room</span>
          <div style={styles.activeRoom}>{currentRoom}</div>
          <button type="button" onClick={copyRoom} style={styles.fullButton}>
            Copy room id
          </button>
        </section>

        <section style={{ ...styles.panel, flex: 1 }}>
          <div style={styles.sideHeader}>
            <span style={styles.label}>Online</span>
            <span style={styles.count}>{onlineUsers.length}</span>
          </div>
          {onlineUsers.length === 0 && <p style={styles.muted}>Waiting for server...</p>}
          {onlineUsers.map((user) => (
            <div key={user} style={styles.userRow}>
              <Avatar name={user} size={24} />
              <span style={styles.userName}>{user === username ? "you" : user}</span>
            </div>
          ))}
        </section>
      </aside>

      <section style={styles.chat}>
        <header style={styles.topbar}>
          <div>
            <div style={styles.roomTitle}>Room {currentRoom}</div>
            <div style={styles.status}>{connected ? "Connected" : "Disconnected"}</div>
          </div>
          <button type="button" onClick={() => setEnteredChat(false)} style={styles.smallButton}>
            Leave
          </button>
        </header>

        <section style={styles.messages}>
          {messages.length === 0 && <div style={styles.empty}>No messages yet. Say hello.</div>}
          {messages.map((message) =>
            message.sender === "system" ? (
              <div key={message.id} style={styles.systemMessage}>
                {message.text}
              </div>
            ) : (
              <article
                key={message.id}
                style={{
                  ...styles.messageRow,
                  flexDirection: message.sender === "me" ? "row-reverse" : "row",
                }}
              >
                <Avatar name={message.username} />
                <div style={message.sender === "me" ? styles.myMessageBody : styles.messageBody}>
                  {message.sender !== "me" && <div style={styles.author}>{message.username}</div>}
                  <div style={message.sender === "me" ? styles.myBubble : styles.bubble}>{message.text}</div>
                  <div style={styles.time}>{message.time}</div>
                </div>
              </article>
            ),
          )}
          <div ref={bottomRef} />
        </section>

        <footer style={styles.inputBar}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKey}
            placeholder={`Message ${currentRoom}`}
            style={{ ...styles.textInput, flex: 1 }}
          />
          <button type="button" onClick={sendMessage} disabled={!canSend} style={styles.sendButton}>
            Send
          </button>
        </footer>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  scene: {
    minHeight: "100vh",
    display: "flex",
    gap: 14,
    padding: 20,
    background: "radial-gradient(circle at 20% 0%, rgba(99, 102, 241, 0.25), transparent 34%), #101827",
    color: "rgba(255, 255, 255, 0.92)",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    boxSizing: "border-box",
  },
  startPanel: {
    width: 380,
    maxWidth: "calc(100vw - 40px)",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 22,
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.13)",
    boxShadow: "0 18px 60px rgba(0, 0, 0, 0.25)",
  },
  title: {
    margin: 0,
    fontSize: 28,
    letterSpacing: 0,
  },
  subtitle: {
    margin: "6px 0 0",
    color: "rgba(255, 255, 255, 0.58)",
    fontSize: 14,
    lineHeight: 1.45,
  },
  roomCard: {
    padding: 14,
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
  },
  roomCodeRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  roomCode: {
    flex: 1,
    fontSize: 26,
    letterSpacing: 2,
    color: "#bfdbfe",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.48)",
  },
  textInput: {
    width: "100%",
    height: 40,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid rgba(255, 255, 255, 0.14)",
    background: "rgba(255, 255, 255, 0.08)",
    color: "rgba(255, 255, 255, 0.94)",
    outline: "none",
    boxSizing: "border-box",
    fontSize: 14,
  },
  primaryButton: {
    height: 42,
    borderRadius: 8,
    border: "1px solid rgba(129, 140, 248, 0.55)",
    background: "rgba(79, 70, 229, 0.88)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },
  smallButton: {
    height: 32,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid rgba(255, 255, 255, 0.14)",
    background: "rgba(255, 255, 255, 0.08)",
    color: "rgba(255, 255, 255, 0.86)",
    fontWeight: 700,
    cursor: "pointer",
  },
  fullButton: {
    width: "100%",
    height: 34,
    marginTop: 12,
    borderRadius: 8,
    border: "1px solid rgba(255, 255, 255, 0.14)",
    background: "rgba(255, 255, 255, 0.08)",
    color: "rgba(255, 255, 255, 0.86)",
    fontWeight: 700,
    cursor: "pointer",
  },
  sidebar: {
    width: 190,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    flexShrink: 0,
  },
  panel: {
    padding: 14,
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.13)",
    minHeight: 0,
  },
  activeRoom: {
    marginTop: 7,
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: 2,
    color: "#bfdbfe",
  },
  sideHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  count: {
    minWidth: 24,
    textAlign: "center",
    borderRadius: 999,
    background: "rgba(74, 222, 128, 0.16)",
    color: "#86efac",
    fontSize: 12,
    fontWeight: 800,
  },
  muted: {
    margin: 0,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.36)",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    marginBottom: 10,
  },
  userName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 13,
  },
  avatar: {
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: "rgba(96, 165, 250, 0.18)",
    border: "1px solid rgba(147, 197, 253, 0.24)",
    color: "#bfdbfe",
    fontWeight: 900,
  },
  chat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minWidth: 0,
  },
  topbar: {
    height: 62,
    padding: "0 16px",
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.13)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roomTitle: {
    fontSize: 17,
    fontWeight: 900,
  },
  status: {
    marginTop: 3,
    color: "rgba(255, 255, 255, 0.52)",
    fontSize: 12,
  },
  messages: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: 16,
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.13)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  empty: {
    margin: "auto",
    color: "rgba(255, 255, 255, 0.34)",
    fontSize: 14,
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 9,
  },
  messageBody: {
    maxWidth: "min(520px, 72vw)",
  },
  myMessageBody: {
    maxWidth: "min(520px, 72vw)",
    textAlign: "right",
  },
  author: {
    margin: "0 0 3px 3px",
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.48)",
  },
  bubble: {
    padding: "9px 12px",
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    lineHeight: 1.45,
    wordBreak: "break-word",
  },
  myBubble: {
    padding: "9px 12px",
    borderRadius: 8,
    background: "rgba(79, 70, 229, 0.58)",
    border: "1px solid rgba(129, 140, 248, 0.4)",
    lineHeight: 1.45,
    wordBreak: "break-word",
  },
  time: {
    marginTop: 3,
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.34)",
  },
  systemMessage: {
    alignSelf: "center",
    maxWidth: "90%",
    padding: "5px 10px",
    borderRadius: 999,
    background: "rgba(255, 255, 255, 0.08)",
    color: "rgba(255, 255, 255, 0.52)",
    fontSize: 12,
  },
  inputBar: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: 10,
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.13)",
  },
  sendButton: {
    width: 78,
    height: 40,
    borderRadius: 8,
    border: "1px solid rgba(129, 140, 248, 0.55)",
    background: "rgba(79, 70, 229, 0.88)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
};
