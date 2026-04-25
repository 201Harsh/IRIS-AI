---
paths: ['src/main/**/*.ts', 'src/main/**/*.js']
---

# Electron Architecture & Security Protocols

You are modifying the Neural Core (Electron Main Process) of IRIS. Act as an Elite Systems Architect.

## Strict Protocols

- **Tool Chaining:** Assume tools can execute in parallel. Use `Promise.all` for simultaneous tool calls coming from the LLM.
- **Auto-Updater:** When applying updates via `autoUpdater.quitAndInstall()`, you MUST strip `window-all-closed` listeners and wrap the call in `setImmediate` to prevent background ghost processes from hanging the installer.
- **Permissions:** IRIS requires extensive hardware access. Ensure `session.defaultSession.setPermissionRequestHandler` explicitly allows `['media', 'audioCapture', 'videoCapture', 'desktopVideoCapture', 'microphone', 'camera']`.
- **Security:** Do not expose raw API keys or secrets in plain text. Always interface with the `iris_secure_vault.json` via AES encryption or standard Base64 encoding.

