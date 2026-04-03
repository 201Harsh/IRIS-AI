## Summary

Describe the problem and fix in 2–5 bullets:

If this PR fixes a release blocker, title it `fix(<module>): release blocker - <summary>`. Contributors cannot label PRs, so the title is the PR-side signal for maintainers and automation.

- **Problem:** - **Why it matters:** - **What changed:** - **What did NOT change (scope boundary):** ## Change Type (select all)

- [ ] Bug fix
- [ ] Feature / New OS Tool
- [ ] Refactor required for the fix
- [ ] Docs
- [ ] Security hardening
- [ ] Chore/infra

## Scope (select all touched areas)

- [ ] Electron Main Process (Node.js)
- [ ] Context Bridge / IPC (`preload.ts`)
- [ ] React Frontend / UI
- [ ] OS Automation (`nut.js`, shell execution)
- [ ] Local RAG / Memory (`LanceDB`)
- [ ] Agentic Routing / LLM Prompts
- [ ] CI/CD / Build System (`electron-builder`)

## Linked Issue/PR

- Closes #
- Related #
- [ ] This PR fixes a bug or regression

## Root Cause / Regression History (if applicable)

For bug fixes or regressions, explain why this happened, not just what changed. Otherwise write `N/A`.

- **Root cause:** - **Missing detection / guardrail:** - **Why this regressed now:** ## Security Impact (Required 🚨)

Because IRIS executes local OS commands, security reviews are mandatory.

- New OS permissions or hardware capabilities accessed? (`Yes/No`)
- IPC channel payload validation changed? (`Yes/No`)
- Secrets/API keys handling changed? (`Yes/No`)
- Command/tool execution surface expanded? (`Yes/No`)
- Local file system access scope changed? (`Yes/No`)
- **If any `Yes`, explain risk + mitigation:** ## Diagram (if applicable)

For IPC data flows, UI changes, or non-trivial agent logic, include a small ASCII diagram reviewers can scan quickly. Otherwise write `N/A`.

```text
Before:
[React UI] -> [IPC invoke] -> [Old State]

After:
[React UI] -> [IPC invoke] -> [Validated Payload] -> [New State]
```

