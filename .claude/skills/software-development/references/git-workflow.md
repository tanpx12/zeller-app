# Git Workflow & Code Review

## Branching Strategy

Use **trunk-based development** with short-lived feature branches:

```
main                  ← always deployable, protected
├── feat/vault-v2     ← feature branches (< 3 days ideally)
├── fix/reentrancy    ← bug fixes
├── chore/update-deps
└── audit/trail       ← audit-specific branches (never merge back untouched)
```

- `main` is protected: require PR + review + CI green to merge
- No direct pushes to `main` (even solo projects — discipline matters)
- Delete branches after merge
- For audit fixes: create `audit/<auditor>-fixes` branch, address findings, get re-review

### Tag releases
```bash
git tag -a v1.0.0 -m "Initial mainnet deployment"
git push origin v1.0.0
```
Tag every deployment. Include the deployed address in the tag message or release notes.

---

## When to Commit (Checkpointing)

A commit is a checkpoint — a named point you can return to, diff against, bisect through,
or cherry-pick from. The question to ask before committing: **"Is this a meaningful unit
of work I might want to reference, revert, or isolate later?"**

### Commit early, commit often — but commit coherently

Prefer **small, focused commits** over large batches. Each commit should do one thing.
Not one file, not one hour of work — one *logical change*.

**Commit when:**

- A test goes from failing to passing — commit the fix that made it pass
- A refactor is complete and tests still pass — commit before adding new behavior on top
- An interface or type is defined — commit it before implementing it
- A function or module is extractable and self-contained — commit it alone
- You're about to make a risky or experimental change — commit the clean state first so you have a fallback
- You've completed one logical step in a multi-step feature — commit the step
- A bug is reproduced by a test — commit the failing test before the fix (`test: reproduce X` then `fix: resolve X`)

**Do not wait until:**

- The whole feature is done (that's one giant commit, not a history)
- "Everything works" — intermediate working states are valuable checkpoints
- End of day — time is the wrong trigger; logical completeness is the right one

### The checkpoint mindset for smart contract work

In smart contract development, commits serve an extra purpose: they are the record an
auditor reads to understand *how* the code evolved. A well-structured commit history
tells a story. A single "implement vault" commit tells nothing.

**Commit at each of these natural boundaries:**

```
1. Interfaces defined        → feat(vault): define IVault interface
2. Storage layout set        → feat(vault): define storage layout and events
3. Core logic implemented    → feat(vault): implement deposit and withdraw
4. Access control added      → feat(vault): add owner-only pause mechanism
5. Tests written             → test(vault): add unit tests for deposit/withdraw
6. Edge cases covered        → test(vault): add fuzz and invariant tests
7. NatSpec added             → docs(vault): add NatSpec to all external functions
8. Gas optimized             → perf(vault): cache totalSupply to reduce SLOADs
```

That's eight legible commits instead of one opaque blob. An auditor can read commit 3
in isolation and verify the core logic without noise from access control or docs.

### Commit before dangerous operations

Always commit clean state before:
- Running a migration or deployment script
- Upgrading a proxy contract
- Changing storage layout
- Merging a large upstream dependency update
- Starting a refactor that touches many files

If something goes wrong, you have a clean `git stash` or `git reset --hard HEAD` target.

### The pre-commit question

Before every commit, ask:
1. **Does this compile and pass tests?** Never commit broken state to a shared branch.
   On a personal branch, a `wip:` commit is acceptable if you need to save progress.
2. **Is this one logical change?** If `git diff --stat` shows 8 files across 3 concerns,
   split it with `git add -p`.
3. **Would I be able to `git revert` this commit safely?** If reverting it would be
   entangled with other changes, it's not atomic enough.

### Splitting changes with `git add -p`

When you've made multiple logical changes in one session, stage them separately:

```bash
git add -p          # interactively stage hunks
git diff --cached   # review what's staged
git commit          # commit only what's staged
# repeat for the next logical unit
```

This is the most important git habit for keeping a clean history.

### WIP commits on personal branches

On a personal feature branch, `wip:` commits are acceptable as a save point:

```
wip: partial vault implementation — storage done, logic incomplete
```

Before opening a PR, squash or rebase them into clean logical commits:

```bash
git rebase -i origin/main   # squash wip commits into meaningful ones
```

Never merge `wip:` commits into `main`.

---

## Commit Messages

Follow **Conventional Commits 1.0.0** (https://www.conventionalcommits.org/en/v1.0.0/).

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

All three sections are separated by a **single blank line**.

### Types

| Type | When to use | SemVer |
|------|-------------|--------|
| `feat` | Adds a new feature | MINOR |
| `fix` | Patches a bug | PATCH |
| `security` | Security fix (widely used in Web3) | PATCH |
| `refactor` | Code change, no bug fix or feature | — |
| `perf` | Performance improvement | — |
| `test` | Adding or correcting tests | — |
| `docs` | Documentation only | — |
| `build` | Build system or external dependencies | — |
| `ci` | CI/CD configuration | — |
| `chore` | Other changes that don't modify src or test | — |
| `style` | Formatting, whitespace (no logic change) | — |
| `revert` | Reverts a previous commit | — |

### Scope

Optional noun in parentheses describing the section changed. Good scopes for this stack:

- Contract name: `vault`, `oracle`, `staking`, `bridge`
- Chain: `evm`, `near`, `stellar`
- Layer: `sdk`, `indexer`, `frontend`, `scripts`
- Config: `ci`, `deps`, `foundry`, `cargo`

### Description rules

- Immediately follows `type[(scope)]: `
- **Imperative mood** — "add", "fix", "remove" not "added", "fixes", "removed"
- No capital letter at start
- No period at end
- Full first line ≤ 72 characters

```
✓  feat(vault): add withdrawal fee calculation
✓  fix(oracle): handle stale price feed revert
✓  security(bridge): validate merkle proof before releasing funds

✗  feat(vault): Added withdrawal fee.    ← past tense + period
✗  fix: Fixed the bug                    ← vague
```

### Body

Use when the *why* isn't obvious. One blank line after the description, wrap at 72 chars.

```
fix(oracle): revert on stale price feed older than 1 hour

Chainlink feeds can return stale data during network congestion.
Previously the contract accepted prices up to 24h old, allowing
attackers to use stale prices to drain the vault.

Now reverts with StalePrice() if updatedAt < block.timestamp - 3600.
```

### Breaking changes

Two valid forms — pick one:

```
feat(vault)!: replace withdraw(uint) with withdraw(uint,address)
```

```
feat(vault): replace withdraw(uint) with withdraw(uint,address)

BREAKING CHANGE: all callers must now provide an explicit recipient.
Previously the recipient was always msg.sender.
```

`BREAKING CHANGE` in a footer → MAJOR SemVer bump regardless of type.
`!` after type/scope → also signals MAJOR, `BREAKING CHANGE` footer is then optional.

### Other footers

```
fix: prevent reentrancy in claim()

Reviewed-by: Alice
Refs: #142
Co-authored-by: Bob <bob@example.com>
```

Footer token rules: use `-` instead of spaces (`Reviewed-by`, not `Reviewed by`).
Exception: `BREAKING CHANGE` (uppercase, space allowed). `BREAKING-CHANGE` is a synonym.

### SemVer mapping

| Commit | SemVer bump |
|--------|-------------|
| Any commit with `BREAKING CHANGE` footer or `!` | MAJOR |
| `feat` | MINOR |
| `fix`, `security` | PATCH |
| Everything else | no bump |

### Generating a commit message — process

1. **Identify the primary intent** → determines type (`feat`, `fix`, `refactor`, etc.)
2. **Identify the scope** → contract name, chain, or layer; omit if cross-cutting
3. **Write the description** → imperative, concise, specific
4. **Decide if a body is needed** → add it only if the *why* isn't obvious
5. **Check for breaking changes** → signature change, storage layout change, removed function, changed event → add `!` or `BREAKING CHANGE` footer
6. **Add footers** → issue refs, reviewers, co-authors if applicable

### Smart contract examples

```
feat(vault): add emergency pause with timelock
feat(near): implement storage deposit refund on account deletion
fix(evm): apply CEI pattern to prevent reentrancy in withdraw()
fix(oracle): revert on stale price feed older than 1 hour
security(bridge): validate merkle proof before releasing funds
refactor(staking): extract reward calculation into RewardLib
perf(evm): cache totalSupply in memory to reduce SLOAD count
test(near): add workspaces test for cross-contract call failure
test(evm): add invariant test for vault solvency
docs(vault): add NatSpec to all external functions
chore(deps): update foundry to nightly-2025-03-20
ci: add slither static analysis to PR workflow
feat(vault)!: replace withdraw(uint) with withdraw(uint,address)
```

### If the diff has multiple unrelated changes

Prefer splitting into multiple commits. If that's not possible, use the most significant
change as the type and mention others in the body:

```
feat(vault): add withdrawal fee + fix reentrancy in claim()

Primary: introduce configurable withdrawal fee (basis points).

Also fixes a reentrancy vulnerability in claim() by applying the CEI
pattern, caught during fee implementation review.
```

### Revert commits

```
revert: feat(vault): add withdrawal fee calculation

Refs: a1b2c3d
```

### Reviewing a commit message — checklist

- [ ] Correct type for the change?
- [ ] Scope matches the section actually changed?
- [ ] Imperative mood, no capital, no period?
- [ ] First line ≤ 72 chars?
- [ ] Body present if *why* is non-obvious?
- [ ] Breaking changes flagged with `!` or `BREAKING CHANGE` footer?
- [ ] Footer tokens hyphenated (`Reviewed-by`, not `Reviewed by`)?

**Never**: "fix bug", "wip", "asdf", "changes", past tense, vague descriptions.

---

## PR Process

### Before opening a PR
- [ ] `forge fmt` / `cargo fmt` run
- [ ] `forge test` / `cargo test` all passing
- [ ] `solhint` / `cargo clippy -- -D warnings` clean
- [ ] Self-review: read your own diff as if you're the reviewer
- [ ] Write a clear PR description (see template below)

### PR Description Template
```markdown
## What
Brief description of what this PR does.

## Why
Context: why is this change needed?

## How
Key implementation decisions. Link to spec/issue.

## Testing
What tests were added/modified? How to verify locally?

## Checklist
- [ ] Tests pass
- [ ] No new compiler warnings
- [ ] Docs updated if public API changed
- [ ] Security implications considered
```

### Review turnaround
- Respond to review comments within 1 business day
- Mark resolved threads as resolved
- Request re-review after addressing all comments, not piecemeal

---

## CI/CD Pipeline

### Minimum CI for any smart contract project

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  # EVM
  evm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { submodules: recursive }
      - uses: foundry-rs/foundry-toolchain@v1
      - run: forge fmt --check
      - run: forge build --sizes
      - run: forge test -vvv
      - run: |
          pip install slither-analyzer --break-system-packages
          slither . --config-file slither.config.json

  # NEAR
  near:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with: { targets: wasm32-unknown-unknown }
      - run: cargo fmt --check
      - run: cargo clippy -- -D warnings
      - run: cargo test
      - run: cargo near build

  # Stellar
  stellar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with: { targets: wasm32-unknown-unknown }
      - run: cargo fmt --check
      - run: cargo clippy -- -D warnings
      - run: cargo test
```

### Additional checks worth adding
- **Forge coverage**: `forge coverage --report lcov` → upload to Codecov
- **Gas snapshot diff**: `forge snapshot --check` to catch unexpected gas changes
- **Slither**: static analysis, run on every PR
- **cargo-audit**: `cargo audit` for known Rust vulnerabilities
- **Size check**: `forge build --sizes` — fail if contract > 24KB

---

## Git Hooks (local)

Set up pre-commit hooks so CI failures are caught locally first:

```bash
# .git/hooks/pre-commit  (chmod +x)
#!/bin/bash
set -e

# EVM
if [ -f foundry.toml ]; then
  forge fmt --check || { echo "Run: forge fmt"; exit 1; }
fi

# Rust
if [ -f Cargo.toml ]; then
  cargo fmt --check || { echo "Run: cargo fmt"; exit 1; }
  cargo clippy -- -D warnings
fi
```

Or use `husky` / `lefthook` for JS-managed hooks in monorepos.

---

## Deployment Record Keeping

Every deployment should be recorded:

```json
// deployments/evm/mainnet.json
{
  "network": "mainnet",
  "chainId": 1,
  "deployedAt": "2025-03-25T10:00:00Z",
  "deployer": "0xABCD...",
  "commit": "a1b2c3d",
  "contracts": {
    "Vault": {
      "address": "0x1234...",
      "txHash": "0xabcd...",
      "blockNumber": 21000000
    }
  }
}
```

Commit this file. It is your audit trail.