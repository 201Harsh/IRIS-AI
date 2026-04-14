================================================================================
IRIS
The Autonomous Neural OS Agent
A local-first neural execution system that turns intent into real OS actions.

TABLE OF CONTENTS
Overview

Core Features & System Capabilities

Architecture

Security

Installation & Setup

Project Structure

Development Philosophy

Contributing

Extending IRIS

Roadmap

Disclaimer

Architect

License

OVERVIEW


IRIS is not a chatbot.

It is a local-first AI Operating System layer that executes real-world actions
across your system, applications, and devices.

"Speak your command. IRIS executes it."

CORE FEATURES & SYSTEM CAPABILITIES

[ System & File Management ]

Open App: Native application lifecycle control.

Close App: Instant process termination commands.

Read Directory: Local folder scanning & indexing.

Create Folder: Instant directory structure generation.

Read File: Deep text & code extraction.

Write File: Autonomous disk write access.

Manage File: Copy, move, and delete control.

Open File: Native OS application launcher.

Smart Drop Zones: Viral, autonomous folder sorting.

[ Vector Search & Local Knowledge ]

Index Folder: Semantic LanceDB directory ingestion.

Smart File Search: Vector-based local file retrieval.

Read Gallery: Local image cache scanning.

Analyze Photo: Direct multimodal vision processing.

[ Developer & Terminal Tools ]

Run Terminal: Native shell & CLI execution.

Open Project: Instant IDE workspace loading.

Activate Protocol: Context-aware coding mode switch.

Build File: Writing code directly to disk.

Execute Sequence: JSON-based macro automation runs.

Execute Macro: Named workflow sequence triggering.

Deploy Wormhole: Expose localhost to public internet.

Close Wormhole: Terminate public localhost tunnels.

[ Desktop UI, Vision & Automation ]

Teleport Windows: Dynamic desktop window management.

Create Widget: Spawn live floating desktop components.

Close Widgets: Clear active floating overlays.

Click on Screen: AI-driven exact coordinate targeting.

Scroll Screen: Autonomous up/down page navigation.

Press Shortcut: Global keyboard hotkey injection.

Phantom Typer: Global inline clipboard injection.

Screen Peeler (OCR): Instant UI-to-code visual extraction.

Ghost Coder: Inline IDE generation (Ctrl+Alt+Space).

Set Volume: Master audio level control.

Take Screenshot: Instant visual context capture.

[ Memory & Information ]

Save Core Memory: Deep persistent identity tracking.

Retrieve Memory: Instant past context recall.

Save Note: Local markdown note generation.

Read Notes: Instant saved plan retrieval.

Read Emails: Gmail inbox scraping & summarization.

[ Web, Media & Financials ]

Google Search: Live internet data retrieval.

Get Weather: Real-time atmospheric condition checks.

Open Map: Interactive dark-mode map loading.

Get Navigation: Real-time routing and directions.

Play Spotify: Instant music & playlist execution.

Stock Price: Real-time financial ticker tracking.

Compare Stocks: Dual-ticker fundamental market analysis.

Hack Live Website: Viral visual DOM manipulation.

Build Animated Web: Agentic Tailwind & GSAP generation.

Generate Image: High-fidelity multimodal media generation.

[ Communications ]

Send WhatsApp: Instant automated message dispatch.

Schedule WhatsApp: Cron-based delayed message automation.

Draft Email: Autonomous message composition.

Send Email: Action-oriented direct dispatch.

[ Mobile Telekinesis (Deep Android Link) ]

Mobile Notifications: Read texts from connected phone.

Mobile Info: Battery & hardware telemetry tracking.

Push File to Mobile: Seamless PC-to-phone transfers.

Pull File from Mobile: Instant phone-to-PC fetching.

Open Mobile App: Remote Android application launching.

Close Mobile App: Remote Android process killing.

Tap Mobile Screen: Remote coordinate touch execution.

Swipe Mobile Screen: Remote directional scrolling control.

Toggle Hardware: Remote Wi-Fi/Bluetooth/Flashlight switching.

[ Autonomous Research & Deep RAG ]

Deep Research: Autonomous Llama 3 web crawling.

Read Notion Reports: Deep sync with Notion databases.

Ingest Codebase: Deep local project Vector embedding.

Consult Oracle: Deep local codebase RAG queries.

[ Security & OS Vault ]

Lock System Vault: Standard PIN OS lockdown protocol.

Biometric Encryption: Multi-face recognition OS lockdown.

ARCHITECTURE

Frontend:

React + Tailwind + Framer Motion

Handles UI, commands, voice

Backend:

Electron (Node.js)

Full system access (files, automation, sockets)

IPC Bridge:
window.electron.ipcRenderer.invoke("tool-name", payload);

SECURITY

100% BYOK (Bring Your Own Key)

Local encryption (OS keychain)

Zero-trust architecture

No external key storage

INSTALLATION & SETUP

Step 1. Clone Repo
git clone https://github.com/201Harsh/IRIS-AI.git
cd IRIS-AI

Step 2. Environment Setup
cp .env.example .env
(Add your API keys to the file)

Step 3. Install Dependencies
npm install

Step 4. Run Dev Server
npm run dev

Step 5. Initialize Vault

Open app

Go to Command Center (Settings)

Add API keys securely

PROJECT STRUCTURE

iris/
|-- build/                   # OS-specific build artifacts
|-- out/                     # Compiled output ready for packaging
|-- resources/               # Static assets (icons, trained data, etc.)
|-- src/                     # Core application source code
|   |-- main/                # Electron Main Process (Node.js & OS execution)
|   |-- preload/             # Context Isolation Scripts (IPC secure bridge)
|   |-- renderer/            # React Frontend (UI, widgets, animations)
|-- .env.example             # Template for API keys and env variables
|-- electron-builder.yml     # Configuration for packaging the .exe/.app
|-- electron.vite.config.ts  # Vite configuration for split architecture
|-- eng.traineddata          # Tesseract OCR language data file
|-- package.json             # Project dependencies and scripts

DEVELOPMENT PHILOSOPHY

Execution > Conversation

Local-first intelligence

Modular system design

Real-world usability

CONTRIBUTING

IRIS is built for the community. If you want to expand the neural forge,
submit a PR.

Quick Start:

Fork the repository.

Branch off 'main'.

Match existing patterns (Tailwind for UI, strict IPC typing for backend).

Test thoroughly (ensure tools do not block the main Electron thread).

Submit a PR with a clear explanation and visual evidence if altering the UI.

Read the full CONTRIBUTING.md file before submitting.

Commit Rules:
Keep your commit messages clean, descriptive, and easy to understand. Clearly
state what the commit accomplishes and always include the relevant Issue ID.
Example: git commit -m "feat: integrated new desktop widget (#45)"

EXTENDING IRIS

You can:

Add new IPC tools

Integrate APIs

Build automation modules

Extend UI widgets

ROADMAP

[ ] Voice-first system
[ ] Plugin marketplace
[ ] Memory graph
[ ] Multi-agent system
[ ] Desktop + Cloud hybrid

DISCLAIMER

IRIS has deep system-level execution capabilities.
Use responsibly. The maintainers are not liable for misuse.

ARCHITECT

Harsh Pandey
AI Systems Engineer

Instagram: @201Harshs (https://www.instagram.com/201harshs/)
GitHub: @201Harsh (https://github.com/201Harsh)

LICENSE

MIT License - see LICENSE file.

================================================================================
FINAL NOTE
IRIS is not a chatbot. It is a neural extension of your operating system.

"System Online."

Made with ❤️ by Harsh Pandey
