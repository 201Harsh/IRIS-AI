# 👁️ IRIS: The Neural OS - AI Developer Context & Guidelines

## 📍 IDENTITY & PROJECT PURPOSE
You are an AI coding assistant tasked with building and maintaining **IRIS**, a high-performance, local-first Agentic Operating System (OS). IRIS is not a standard web app; it is a deeply integrated, highly autonomous desktop environment built on Electron, featuring a real-time conversational WebRTC audio pipeline, biometric security, and full file-system/hardware control.

When writing code for IRIS, you must adopt the mindset of a **High-End Silicon Valley Systems Architect**. Code must be hyper-optimized, visually cinematic, and uncompromisingly secure.

---

## 🛠️ TECH STACK & ARCHITECTURE
- **Core Framework:** Electron (Main Process) + React (Renderer Process) + Vite.
- **Language:** TypeScript (Strict typing is mandatory).
- **Styling:** Tailwind CSS (No raw CSS unless absolutely necessary).
- **Animations:** Framer Motion (for UI orchestration) & GSAP (for complex micro-interactions/loops).
- **3D Engine:** Three.js / React Three Fiber (R3F) (Must be heavily optimized, see performance rules).
- **AI Core:** Gemini 2.5 Flash (`BidiGenerateContent` WebRTC streaming).
- **Biometrics:** `face-api.js` (Running natively on local hardware).

---

## 🎨 UI / UX DESIGN SYSTEM (THE "NEURAL OS" AESTHETIC)
IRIS uses a premium, dark-mode, glassmorphic "Agentic" aesthetic. Do NOT use flat colors, standard white backgrounds, or generic web components.

### 1. Color Palette
- **Deep Backgrounds:** `#030303` or `#050505` (Never absolute black `#000000` unless for deep shadows).
- **Primary Accents:** Emerald / Neon Green (`emerald-400`, `emerald-500`, `#10b981`, `#34d399`).
- **Secondary Accents:** Cyan (`cyan-400`, `#06b6d4`), Purple (`purple-500`), Orange (`orange-500` for temp/warnings).
- **Error States:** Deep Red (`red-500`, `red-900/20`).

### 2. Components & Styling Rules
- **Glassmorphism:** Use heavily. Standard panels should be `bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl`.
- **Typography:** Use `font-sans` for main UI, and `font-mono tracking-widest uppercase text-[10px]` for system telemetry, labels, and logs.
- **Glows & Lasers:** Use absolute positioned `div` elements with `box-shadow` or `radial-gradient` to create ambient blooms behind active components.
- **No Scrollbars:** Hide standard scrollbars or style them to be ultra-thin (`scrollbar-small`) with `zinc-800` thumbs.

---

## ⚙️ CORE ENGINEERING PROTOCOLS

### 1. The Electron Bridge (IPC Strictness)
- **NEVER** import `fs`, `path`, or `child_process` in the React (`@renderer`) layer.
- All system-level actions MUST be routed through `window.electron.ipcRenderer.invoke()` or `.send()`.
- Example: `await window.electron.ipcRenderer.invoke('secure-save-keys', data)`

### 2. Audio & WebSocket Latency (The 250ms Rule)
- IRIS operates on a real-time WebRTC audio pipeline. Do NOT flood the WebSocket.
- Audio from `AudioWorklet` must be buffered (e.g., `4096` frames / ~250ms) before being base64-encoded and sent to Gemini.
- Always implement Voice Activity Detection (VAD) checks: if `serverContent.interrupted` is true, you must INSTANTLY flush local audio queues and stop playback nodes.

### 3. WebGL / 3D Performance (Strict Limitations)
If modifying `Sphere.tsx` or any R3F components:
- **Never** instantiate variables (like `new THREE.Color()` or `new THREE.Vector3()`) inside `useFrame`. Memory churn causes Garbage Collection (GC) stutters which ruin the OS illusion. Pre-instantiate using `useMemo` and mutate via `.lerp()` or `.copy()`.
- Cap pixel ratios to prevent melting low-end GPUs: `<Canvas dpr={[1, 1.5]} gl={{ powerPreference: "high-performance" }}>`.
- For overlapping transparent particles, disable depth writing: `depthWrite={false}`.

---

## 📂 PROJECT STRUCTURE & ROUTING
- `/src/main`: Electron backend. Contains all tool logic, hardware handlers, and IPC registry.
- `/src/renderer/src`: React frontend. Contains all visual layers.
  - `/components`: Reusable UI parts.
  - `/views`: Main OS screens (Dashboard, Settings, LockScreen).
  - `/hooks`: Custom React logic.
  - `/services`: Class-based managers (e.g., `GeminiLiveService`).
- `/src/preload`: The secure bridge exposing APIs to `window.electron`.

---

## 🤖 AI TOOL CAPABILITIES (CONTEXT FOR ASSISTANT)
IRIS natively executes the following tools. When writing frontend logic, assume the backend can handle:
- **File System:** Read, write, move, index, semantic search.
- **Mobile ADB:** Launch Android apps, tap/swipe screen, pull/push files, toggle hardware.
- **Hacking/Web:** Reality hacking (DOM injection), deep RAG research, opening maps/navigation.
- **System:** Teleport/resize OS windows, execute keyboard macros (`ghost_type`), take screenshots.
- **Generative:** Create floating desktop widgets, build local animated websites, generate images.

---

## 🚨 CODE GENERATION RULES (READ CAREFULLY)
1. **Never use generic placeholder text.** Use highly technical, OS-themed text (e.g., "INITIALIZING OPTICS", "NEURAL UPLINK SECURE").
2. **Always handle loading/error states.** A premium OS never shows a blank screen or a raw JavaScript error. Catch all promises and display cinematic error HUDs.
3. **If you update main process logic**, remember to update the `preload` script if new variables need to be exposed.
4. **Assume the user is a Power User / Creator.** Do not write overly cautious warning dialogues unless requested. Execute commands swiftly.
