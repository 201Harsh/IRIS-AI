<div align="center">

# 👁️ IRIS  
## The Autonomous Neural OS Agent

![GitHub stars](https://img.shields.io/github/stars/yourusername/iris?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/yourusername/iris?style=for-the-badge)
![Contributors](https://img.shields.io/github/contributors/yourusername/iris?style=for-the-badge)
![Downloads](https://img.shields.io/github/downloads/yourusername/iris/total?style=for-the-badge)

**A local-first neural execution system that turns intent into real OS actions.**

</div>

---

## ⚡ Overview

IRIS is not a chatbot.

It is a **local-first AI Operating System layer** that executes real-world actions across your system, applications, and devices.

> Speak your command. IRIS executes it.

---

## ✨ Core Features

- 🧠 Local RAG Oracle (codebase understanding via LanceDB)
- 🖼️ Screen OCR → UI to Code (Gemini Vision)
- 👻 Phantom Typing (global AI injection)
- 📱 Android Control via ADB
- 🌐 Real-time Web Generation (Tailwind + GSAP)
- ⚡ System-level execution engine

---

## 🏗️ Architecture

### Frontend
- React + Tailwind + Framer Motion
- Handles UI, commands, voice

### Backend
- Electron (Node.js)
- Full system access (files, automation, sockets)

### IPC Bridge
```js
window.electron.ipcRenderer.invoke('tool-name', payload)
```

---

## 🔐 Security

- 100% BYOK (Bring Your Own Key)
- Local encryption (OS keychain)
- Zero-trust architecture
- No external key storage

---

## 🚀 Installation & Setup

### 1. Clone Repo
```bash
git clone https://github.com/yourusername/iris.git
cd iris
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Add your API keys.

---

### 3. Install Dependencies
```bash
npm install
```

---

### 4. Run Dev Server
```bash
npm run dev
```

---

### 5. Initialize Vault
- Open app
- Go to Command Center (Settings)
- Add API keys securely

---

## 📁 Project Structure

```
iris/
├── frontend/
├── electron/
├── ipc/
├── modules/
├── assets/
└── config/
```

---

## 🧠 Development Philosophy

- Execution > Conversation
- Local-first intelligence
- Modular system design
- Real-world usability

---

## 🤝 Contributing

IRIS is built for the community.

### How to Contribute

1. Fork the repository  
2. Create your branch from main  
3. Follow existing patterns (Tailwind + IPC typing)  
4. Test thoroughly (no blocking main thread)  
5. Submit PR with clear explanation  

---

### Commit Rules

```bash
✅ git commit -m 'feat: add new module'
❌ git commit -m "feat: add new module"
```

---

## 🧩 Extending IRIS

You can:
- Add new IPC tools
- Integrate APIs
- Build automation modules
- Extend UI widgets

---

## 🧠 Roadmap

- [ ] Voice-first system
- [ ] Plugin marketplace
- [ ] Memory graph
- [ ] Multi-agent system
- [ ] Desktop + Cloud hybrid

---

## ⚠️ Disclaimer

IRIS has deep system-level execution capabilities.  
Use responsibly. The maintainers are not liable for misuse.

---

## 👨‍💻 Architect

**Harsh Pandey**  
AI Systems Engineer  

Instagram: @irisx.ai

---

## 📜 License

MIT License — see LICENSE file.

---

<div align="center">

**IRIS is not just AI. It's execution.**

</div>
