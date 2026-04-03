# Security Policy

If you believe you've found a legitimate security vulnerability in the IRIS OS Agent, please report it privately. Do not open public GitHub issues for critical zero-days or remote code execution (RCE) flaws.

## Reporting

Report vulnerabilities directly via email to the Lead Architect:

- **[Insert Your Email Here]**

Please allow up to 48 hours for an initial response. IRIS is currently a solo-developed project, but all severe reports are triaged with the highest priority.

### Required in Reports

To ensure rapid triage, please include:

1. **Title & Severity Assessment** (Low/Medium/High/Critical)
2. **Affected Component** (e.g., Main Process IPC, React UI, LanceDB Oracle, Mobile ADB Bridge)
3. **Technical Reproduction** (Exact steps to trigger the flaw)
4. **Demonstrated Impact** (What does this allow an attacker to do?)
5. **Environment** (OS Version, IRIS Version)
6. **Remediation Advice** (Suggested fix, if applicable)

Reports without clear reproduction steps or demonstrated impact will be deprioritized.

---

## 🛡️ IRIS Trust & Threat Model (CRITICAL)

IRIS is **not** a cloud-based web app. It is a local, kernel-level Operating System extension built on Electron. Because of this, the security model operates under the **"Trusted Operator"** paradigm.

### 1. The Trusted Operator Assumption

IRIS assumes that anyone who has unlocked the host machine and launched the application is the **Trusted Operator**.

- IRIS is designed to execute commands, read files, click the screen, and modify the OS on behalf of the user.
- **If a user explicitly asks IRIS to delete a file, and IRIS deletes it, that is a feature, not a vulnerability.** * Vulnerabilities are defined as actions taken *without* the user's consent, or malicious escalation *bypassing\* the IPC bridge.

### 2. Single-User Boundary

IRIS does **not** model one installation as a multi-tenant, adversarial boundary.

- It is designed for one user per machine/OS profile.
- If multiple mutually untrusted users share the same OS login profile, the security boundary is already broken at the OS level, not by IRIS.

### 3. 100% BYOK (Bring Your Own Key) Architecture

Privacy is absolute. IRIS operates on a strict zero-trust architecture regarding external servers.

- **Your API keys (Gemini, Groq, Tavily, Notion) NEVER touch our servers.**
- Credentials are encrypted locally using your Operating System's native secure keychain:
  - **Windows:** `DPAPI` via Electron `safeStorage`
  - **macOS:** Apple Keychain
  - **Linux:** Secret Service API
- The keys are stored in a local, encrypted `iris_secure_vault.json` file.
- **Out of Scope:** Reports demonstrating that a malicious actor who already has root access to your machine can decrypt this file are out of scope. If an attacker has root, the machine is already compromised.

---

## ❌ Out of Scope

The following scenarios are considered expected behavior under the IRIS threat model and will be closed as `invalid` or `no-action`:

1. **Prompt Injection (Without Boundary Bypass):** "Tricking" the LLM via text injection is out of scope _unless_ it results in an unauthorized bypass of the Electron IPC bridge or executes a restricted OS command without user confirmation.
2. **Local Physical Access:** Any attack that requires the attacker to physically sit at the unlocked host machine.
3. **Malicious Workspace Files:** "An attacker writes a malicious payload into `notes.txt`, and the RAG Oracle reads it." Reading files is the Oracle's job. Unless you can prove the RAG pipeline executes the text as arbitrary code, this is out of scope.
4. **Expected OS Execution:** Reports treating explicit operator-control surfaces (like the `run_terminal` or `click_on_screen` tools) as vulnerabilities. These are intentional, trusted-operator features.
5. **Missing Network Headers:** Missing HSTS or similar web-centric headers on local Electron `file://` or `localhost` protocols.

---

## ✅ In Scope (High Priority)

We are highly interested in reports regarding:

1. **IPC Bridge Escapes:** Any method where the untrusted React Renderer process can execute arbitrary Node.js code in the Main Process without using the predefined `ipcMain.handle` channels.
2. **Remote Code Execution (RCE):** Any method where an external, remote attacker can force the IRIS engine to execute code without the local Trusted Operator's consent.
3. **Vault Key Leakage:** Flaws in how `safeStorage` encrypts/decrypts the BYOK credentials, leading to keys being logged in plaintext, exposed to the Renderer process unnecessarily, or leaked over the network.
4. **Path Traversal:** Flaws in the `read_file` or `manage_file` tools that allow the AI to bypass intended directory restrictions (if configured).

---

## Bug Bounties

IRIS is a labor of love and an open-source initiative. There is currently no bug bounty program and no budget for paid reports. Please still disclose responsibly so we can secure the engine for the community. The best way to help the project right now is by responsibly disclosing and submitting PRs.
