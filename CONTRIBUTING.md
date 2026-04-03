# Contributing to IRIS

Welcome to the Neural Forge. 👁️⚡

IRIS is an ambitious, kernel-level OS agent, and building the future of human-computer interaction is a massive undertaking. Right now, this is a solo-developed project, which means your contributions are incredibly valuable—but my time to review them is limited.

Please read this guide to ensure your Pull Requests (PRs) merge smoothly and keep the codebase pristine.

## 🔗 Quick Links

- **GitHub:** https://github.com/201Harsh/IRIS-AI
- **Instagram:** [@irisx.ai](https://www.instagram.com/irisx.ai/)

## 👑 Maintainers

- **Harsh Pandey** - Creator & Lead Architect
  - GitHub: [201Harsh](https://github.com/201Harsh)
  - Instagram: [201harshs](https://www.instagram.com/201harshs/)

---

## 🛠 How to Contribute

1. **Bugs & small fixes** → Open a PR!
2. **New features / architecture** → Start a [GitHub Discussion](https://github.com/yourusername/iris/discussions) or open an Issue first. Please don't spend 20 hours building a massive feature without checking if it aligns with the project roadmap.
3. **Refactor-only PRs** → **Do not open a PR.** I am not accepting purely cosmetic refactors (e.g., changing linting rules, reorganizing folders) unless requested as part of a specific bug fix.
4. **Questions** → Open a Discussion on GitHub.

## 🛑 Before You PR

- Test locally with your own API keys in the vault.
- Ensure both the **Main Process (Node.js)** and **Renderer Process (React)** compile without errors:
  - `npm run build`
- **Mind the Bridge:** IRIS operates on a strict split-architecture. Frontend React code cannot use Node.js modules (like `fs` or `child_process`). All system-level execution MUST be handled in the backend and triggered via the `window.electron.ipcRenderer.invoke` bridge.
- Keep PRs focused. One feature/fix per PR. Do not mix unrelated concerns.
- **Include screenshots/videos:** If you change the UI (Tailwind/GSAP/Framer Motion), you _must_ include a before/after screenshot or a screen recording of the animation in your PR description.
- **Strict Commit Formatting:** Keep your commit messages clean, descriptive, and easy to understand. Clearly state what the commit accomplishes and always include the relevant Issue ID so we can track the changes.

✅ `git commit -m "feat: integrated new desktop widget (#45)"`
✅ `git commit -m "fix: resolved IPC memory leak in Oracle module (#12)"`
❌ `git commit -m "Integrated desktop widget"`
❌ `git commit -m "resolved IPC memory leak in Oracle module"`

---


## 🤖 AI/Vibe-Coded PRs Welcome!

Built this with Gemini, Claude, or Cursor? **Awesome—just mark it!**

Since IRIS is an AI-first operating system, AI-assisted code is treated as a first-class citizen. I just want transparency so I know how to review it.

Please include in your PR description:

- [ ] Mark as AI-assisted in the PR title or description.
- [ ] Note the degree of testing (untested / lightly tested / fully tested locally).
- [ ] Confirm you actually understand what the generated code does (especially regarding Electron IPC and memory management).
- [ ] Resolve any automated review bot comments before asking for a human review.

## 🧭 Current Focus & Roadmap

As a solo dev, I am currently prioritizing:

- **Engine Stability:** Hardening the `BidiGenerateContent` WebSocket connection for the multimodal live agent.
- **BYOK Security:** Ensuring no edge cases leak keys from the local OS vault.
- **Agentic Tools:** Expanding the RAG Oracle and Mobile Telekinesis (ADB) toolsets.
- **Cross-Platform:** Preparing the build pipeline for macOS and Linux deployment.

Check the GitHub Issues for labels like `good first issue` or `help wanted`.

## 🤝 Becoming a Core Contributor

IRIS is growing, and I am selectively looking to expand the maintainer team. If you are an elite developer who understands Electron, React, or local LLM execution, I'd love to have you on board.

Being a maintainer is about consistent involvement—triaging issues, reviewing PRs, and driving the architecture forward.

If you've successfully merged a few PRs and want to step up, reach out via Instagram DM or open an issue titled `[Maintainer Application]`. We are looking for people skilled in:

- Electron Security & IPC
- Native OS Integration (Windows/macOS/Linux APIs)
- Vector Databases (LanceDB) & RAG pipelines
- UI/UX Animation (GSAP, WebGL, Framer Motion)

## 🛡️ Report a Vulnerability

Because IRIS handles direct OS-level execution and local vault decryption, security is the highest priority.

If you find a vulnerability that allows for Remote Code Execution (RCE), key leakage, or IPC bridge bypassing, **DO NOT open a public issue.** Please report it directly via email to: **[Insert Your Email Here]**

### Required in Security Reports:

1. **Severity Assessment** (Low/Medium/High/Critical)
2. **Affected Component** (e.g., Main Process, React UI, RAG Oracle)
3. **Technical Reproduction Steps**
4. **Demonstrated Impact**
5. **Remediation Advice** (if you have a suggested fix)
