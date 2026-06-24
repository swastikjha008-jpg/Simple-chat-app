# Simple Room Chat

A small React + WebSocket chat app with generated room IDs.

## Run locally

```bash
npm install
npm run start
```

Open:

```text
http://127.0.0.1:8080
```

## Development

Run the backend:

```bash
npm run server
```

Run the frontend dev server in another terminal:

```bash
npm run dev
```

The Vite dev server proxies `/ws` to the backend on port `8080`.

## Deploy

Use a Node host such as Render, Railway, Fly.io, or any VPS. GitHub Pages alone will not run the WebSocket server.

### Render

Push this folder to GitHub, then create a new Render Blueprint from the repo. The included `render.yaml` sets the build and start commands.

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm run server
```
