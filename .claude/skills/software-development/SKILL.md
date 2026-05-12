---
name: software-development
description: >
  General software development best practices for a smart contract engineer working across EVM,
  NEAR, and Stellar. Use this skill for project setup, code architecture, git workflows, testing
  strategy, debugging, code review, documentation, and cross-cutting engineering decisions that
  apply regardless of the specific chain or language. Trigger on: "how should I structure this",
  "best practices for", "how do I set up", "code review", "refactor", "debugging", "CI/CD",
  "git workflow", "documentation", "testing strategy", "project layout", "monorepo", "dev
  environment", or any general software engineering question not specific to a single chain.
  Also trigger when the user is starting a new project and needs architectural guidance.
---

# Software Development Skill

For a smart contract engineer working across **EVM (Solidity)**, **NEAR (Rust)**, and **Stellar (Soroban/Rust)**.

---

## Quick Reference Index

| Topic | File |
|-------|------|
| Project structure & monorepo layout | `references/project-structure.md` |
| Git workflow, commits & code review | `references/git-workflow.md` |
| Testing strategy (all chains) | `references/testing.md` |
| Debugging techniques | `references/debugging.md` |
| Documentation standards | `references/documentation.md` |

**Read the relevant reference file before answering specialized queries.**

---

## Core Engineering Principles

### 1. Correctness before optimization
In smart contract work, a bug is often irreversible. Prioritize:
1. Correct behavior (provably so via tests)
2. Security (see chain-specific audit skills)
3. Readability (future auditors will thank you)
4. Gas / compute efficiency (only after the above)

### 2. Explicit over implicit
- Name things precisely — `withdrawUserCollateral()` not `withdraw()`
- Avoid magic numbers — use named constants
- State assumptions in comments where they can't be expressed in types

### 3. Fail loudly and early
- Validate inputs at every trust boundary
- Prefer panics/reverts over silent failure
- In Rust (NEAR/Soroban): use `expect("context message")` during dev, typed errors in production

### 4. Minimize surface area
- Fewer public functions = smaller attack surface
- Prefer internal helpers; expose only what external callers need
- Each contract/module should do one thing well

---

## Language Quick-Reference by Chain

### EVM — Solidity
```
Language:   Solidity 0.8.x
Toolchain:  Foundry (primary), Hardhat (JS integration tests)
Linter:     solhint
Formatter:  forge fmt
Skills:     solidity-dev, solidity-audit
```

### NEAR — Rust
```
Language:   Rust (stable)
SDK:        near-sdk-rs 5.x
Toolchain:  cargo, cargo-near
Test:       near-workspaces-rs (integration), #[test] (unit)
Skills:     near-contract-dev, near-blockchain
```

### Stellar — Soroban/Rust
```
Language:   Rust (stable)
SDK:        soroban-sdk
Toolchain:  stellar-cli, cargo
Test:       soroban-sdk testutils, stellar-cli sandbox
```

---

## Project Setup Checklist

When starting any new smart contract project:

- [ ] Read `references/project-structure.md` for layout decisions
- [ ] Initialize git with `.gitignore` appropriate for the toolchain
- [ ] Set up pre-commit hooks (formatter + linter)
- [ ] Configure CI from day one (see `references/git-workflow.md`)
- [ ] Write a `README.md` with: purpose, architecture overview, local setup, test command
- [ ] Define the invariants the system must always maintain (document them)
- [ ] Set up chain-specific skill: `solidity-dev`, `near-contract-dev`, or Soroban patterns

---

## Code Review Mindset

When reviewing any code (your own or others'):

### First pass — intent
- Does the code do what the author intended?
- Are the invariants preserved?
- Is the happy path correct?

### Second pass — edge cases
- What happens at zero, max values, empty inputs?
- What if called in unexpected order?
- What if the caller is malicious?

### Third pass — maintainability
- Will the next engineer understand this in 6 months?
- Are names accurate?
- Is complexity justified?

### Chain-specific review hooks
- **EVM**: always check CEI pattern, access control, reentrancy — use `solidity-audit` skill
- **NEAR**: always check cross-contract call failure handling, storage deposit management
- **Stellar**: always check auth patterns, XLM balance handling, Wasm size budget

---

## Debugging Approach

Read `references/debugging.md` for detailed techniques. Quick decision tree:

```
Something is wrong
├── Is it a compilation error?     → fix types/syntax first, trust the compiler
├── Is it a test failure?
│   ├── Unit test               → isolate the function, check inputs/outputs
│   └── Integration test        → check state setup, event logs, call sequence
├── Is it a runtime revert?
│   ├── EVM                     → forge test -vvvv, check revert reason
│   ├── NEAR                    → check panic message, inspect logs
│   └── Stellar                 → stellar-cli logs, check invoke output
└── Is it unexpected behavior (no error)?
    → Add assertions/invariant checks, bisect with minimal repro
```

---

## When to Use Which Reference File

- **"How should I structure my monorepo / new project?"** → `references/project-structure.md`
- **"What's my git branching strategy / PR process?"** → `references/git-workflow.md`
- **"How do I test this / what test types do I need?"** → `references/testing.md`
- **"This test is failing and I don't know why"** → `references/debugging.md`
- **"How should I document this contract / function?"** → `references/documentation.md`