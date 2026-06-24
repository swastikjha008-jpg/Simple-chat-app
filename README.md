```markdown
# Simple Chat App

![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=111827)
![Vite](https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-Realtime-22c55e?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)

A simple realtime room-based chat app built with React, Vite, Node.js, and WebSockets.

Create a room, share the room ID, and chat instantly with anyone who joins the same room.

## Live Flow

```text
Create room -> Copy room ID -> Friend joins room -> Send messages in realtime
```

## Features

- Random room ID generated on the start screen
- Join an existing room by entering a room ID
- Realtime chat using WebSockets
- Online users list per room
- Copy room ID button
- Leave room and join another room
- Responsive dark UI
- Production build served by the Node server
- Ready for Render deployment

## Tech Stack

| Part | Tech |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Backend | Node.js HTTP server |
| Realtime | WebSocket (`ws`) |
| Deploy | Render Web Service |

## Project Structure

```text
.
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server.js
├── vite.config.ts
├── index.html
├── package.json
├── tsconfig.json
├── render.yaml
└── README.md
```

## Run Locally

Install dependencies:

```bash
npm install
```

Build the frontend and start the chat server:

```bash
npm run start
```

Open the app:

```text
http://127.0.0.1:8080
```

## Development Mode

Start the backend:

```bash
npm run server
```

In another terminal, start Vite:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

The Vite dev server proxies `/ws` to the backend on port `8080`.

## How To Use

1. Enter your name.
2. Use the generated room ID or click **New** to generate another one.
3. Share the room ID with a friend.
4. Your friend enters the same room ID.
5. Start chatting in realtime.

## Deploy On Render

This app needs a Node server because WebSockets do not work on a plain static host like GitHub Pages.

Use **Render Web Service**, not Static Site.

Render settings:

```text
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm run server
```

The included `render.yaml` can also configure this automatically.

## Git Commands

```bash
git add package.json package-lock.json tsconfig.json index.html server.js vite.config.ts README.md render.yaml .gitignore src
git commit -m "Add realtime room chat app"
git push origin main
```

Do not commit:

```text
node_modules/
dist/
tsconfig.tsbuildinfo
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Runs Vite frontend dev server |
| `npm run build` | Builds the frontend |
| `npm run server` | Runs the Node WebSocket server |
| `npm run start` | Builds and starts the production server |

## Notes

- People must join the same room ID to chat together.
- The deployed app should be opened from the Render Web Service URL.
- If the app says disconnected, check that the Node server is running.
```
