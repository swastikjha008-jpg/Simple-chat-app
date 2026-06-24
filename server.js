import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, WebSocket } from "ws";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const DIST = join(__dirname, "dist");

const clients = new Map();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

const server = createServer((req, res) => {
  let pathname = new URL(req.url || "/", `http://${req.headers.host}`).pathname;
  if (pathname === "/") pathname = "/index.html";

  const filePath = normalize(join(DIST, pathname));
  const safePath = filePath.startsWith(DIST) && existsSync(filePath) ? filePath : join(DIST, "index.html");

  if (!existsSync(safePath)) {
    res.writeHead(404);
    res.end("Build not found. Run npm run build first.");
    return;
  }

  res.writeHead(200, { "Content-Type": mime[extname(safePath)] || "application/octet-stream" });
  res.end(readFileSync(safePath));
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  socket.on("message", (raw) => {
    let data;

    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (data.type === "join") {
      const roomId = String(data.payload?.roomId || "GENERAL").toUpperCase();
      const username = String(data.payload?.username || "anon").slice(0, 32);
      clients.set(socket, { roomId, username });
      socket.send(JSON.stringify({ type: "joined", roomId }));
      broadcastUsers(roomId);
      return;
    }

    if (data.type === "chat") {
      const sender = clients.get(socket);
      const message = String(data.payload?.message || "").trim();
      if (!sender || !message) return;

      broadcast(sender.roomId, {
        type: "chat",
        username: sender.username,
        message: message.slice(0, 1000),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }
  });

  socket.on("close", () => {
    const sender = clients.get(socket);
    clients.delete(socket);
    if (sender) broadcastUsers(sender.roomId);
  });
});

function broadcast(roomId, payload) {
  const body = JSON.stringify(payload);

  for (const [socket, client] of clients) {
    if (client.roomId === roomId && socket.readyState === WebSocket.OPEN) {
      socket.send(body);
    }
  }
}

function broadcastUsers(roomId) {
  const users = [...clients.values()].filter((client) => client.roomId === roomId).map((client) => client.username);
  broadcast(roomId, { type: "roomUsers", users });
}

server.listen(PORT, () => {
  console.log(`Chat app running on http://127.0.0.1:${PORT}`);
});
