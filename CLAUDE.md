# 👁️ IRIS: The Neural OS - Project Context

## Project Identity

IRIS is a high-performance, local-first Agentic Operating System (OS). It is not a standard web app. It is an immersive desktop environment featuring a real-time conversational WebRTC audio pipeline, biometric security (Face ID), and full file-system/hardware control.

## Tech Stack

- **Framework:** Electron (Main) + React (Renderer) + Vite.
- **Language:** TypeScript (Strict typing is mandatory).
- **Styling:** Tailwind CSS (No raw CSS).
- **Animations:** Framer Motion (UI orchestration) & GSAP (Complex loops).
- **3D Engine:** Three.js / React Three Fiber (Heavily optimized).
- **AI Core:** Gemini 2.5 Flash (`BidiGenerateContent` WebRTC streaming).

## Core Commands

- `npm run dev` - Starts the Electron/React development environment.
- `npm run build` - Compiles the production executable.
- `npm run lint` - Runs ESLint checks.

## Global Engineering Rules

1. **The IPC Bridge:** NEVER import `fs`, `path`, or native Node modules in the React (`src/renderer`) layer. All hardware and OS-level tasks must be routed through `window.electron.ipcRenderer`.
2. **Premium OS Aesthetic:** IRIS uses a dark-mode, glassmorphic UI. Standard panels use `bg-black/40 backdrop-blur-xl border border-white/5`. Never use default, flat web-app styling.
3. **Audio Latency:** WebRTC audio must be buffered (min 4096 frames) before sending over WebSocket to prevent flooding. Active audio nodes must be instantly cancelled if an `interrupted` flag is detected.
4. **Cinematic Error Handling:** A premium OS never shows a raw JS crash. Catch all promises and display cinematic, themed error HUDs.
