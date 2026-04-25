---
paths: ['src/renderer/**/*.tsx', 'src/renderer/**/*.ts']
---

# UI / UX Standards (The "Neural OS" Aesthetic)

You are modifying the visual layer of IRIS. Act as a high-end Silicon Valley UX Engineer.

## Color Palette

- **Deep Backgrounds:** `#030303` or `#050505` (Never absolute black unless for deep shadows).
- **Primary Accents:** Emerald / Neon Green (`emerald-400`, `emerald-500`, `#10b981`).
- **Secondary Accents:** Cyan (`cyan-400`), Purple (`purple-500`).
- **Error States:** Deep Red (`red-500`, `red-900/20`).

## Component Rules

- **Typography:** Use `font-sans` for main UI, and `font-mono tracking-widest uppercase text-[10px]` for system telemetry, labels, and logs.
- **Glows & Lasers:** Use absolute positioned `div` elements with gradients to create ambient blooms behind active components.
- **Web APIs:** You have access to `navigator.mediaDevices` for camera/mic.

## 3D Engine (Three.js / R3F) Rules

If touching `Sphere.tsx` or related WebGL files:

- **No Memory Leaks:** NEVER instantiate variables (like `new THREE.Color()`) inside a `useFrame` loop. Pre-instantiate using `useMemo` and mutate them.
- **Low-End Scaling:** Always cap pixel ratios to prevent melting low-end GPUs: `<Canvas dpr={[1, 1.5]} gl={{ powerPreference: "high-performance" }}>`.
- Disable depth writing for overlapping transparent particles (`depthWrite={false}`).

