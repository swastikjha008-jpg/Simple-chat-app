# 💬 Simple Chat App

<p align="center">
  <h3 align="center">A minimal real-time room-based chat application built with React, Vite, Node.js and WebSockets.</h3>

  <p align="center">
    Create a room, share the Room ID, and chat instantly with anyone connected to the same room.
  </p>
</p>

---

## 🛠️ Tech Stack

<p align="center">

<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/WebSockets-010101?style=for-the-badge&logo=socketdotio&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=node.js&logoColor=white"/>

</p>

---

# ✨ Features

- 🚀 Real-time messaging using WebSockets
- 🏠 Create private chat rooms
- 🔑 Join existing rooms using a Room ID
- 👥 Online users counter
- 📋 Copy Room ID
- 💬 Instant message broadcasting
- 🌙 Modern dark interface
- 📱 Responsive layout
- ⚡ Fast Vite frontend
- 🔄 Leave and join different rooms
- 🌐 Production-ready Node.js server

---

# 📂 Project Structure

```text
.
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── server.js
├── vite.config.ts
├── package.json
├── tsconfig.json
├── index.html
├── render.yaml
└── README.md
```

---

# 🚀 Getting Started

## Install

```bash
npm install
```

---

## Development

Start the backend

```bash
npm run server
```

Open another terminal

```bash
npm run dev
```

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:8080
```

---

## Production

Build and start

```bash
npm run start
```

Open

```
http://localhost:8080
```

---

# 💬 How It Works

```text
Create Room
      │
      ▼
Share Room ID
      │
      ▼
Friend Joins Same Room
      │
      ▼
Realtime Chat Begins
```

---

# 📦 Scripts

| Command | Description |
|----------|-------------|
| npm run dev | Starts Vite development server |
| npm run build | Builds the frontend |
| npm run server | Starts WebSocket backend |
| npm run start | Runs production build |

---

# 🚀 Deploy

This application requires a Node.js server because WebSockets cannot run on a static hosting service.

Recommended hosting:

- Render
- Railway
- Fly.io

### Render Configuration

Build Command

```bash
npm install && npm run build
```

Start Command

```bash
npm run server
```

The included **render.yaml** can also be used for automatic deployment.

---

# ⚙️ Tech Overview

| Layer | Technology |
|--------|------------|
| Frontend | React |
| Language | TypeScript |
| Bundler | Vite |
| Backend | Node.js |
| Realtime | Native WebSockets (`ws`) |

---

# 📸 Main Features

- Create Room
- Join Room
- Share Room ID
- Realtime Messaging
- Online Users
- Responsive Design
- Dark Theme
- Production Build

---

# 📝 Notes

- Both users must join the same Room ID.
- The backend server must be running for WebSocket communication.
- GitHub Pages cannot host this application because it requires a Node.js server.
- Deploy the project as a Web Service instead of a Static Site.

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

---

<p align="center">

Made with ❤️ using React, TypeScript, Vite, Node.js and WebSockets.

</p>
