# Documentation Standards

## What to Document

| Thing | Document it? |
|-------|-------------|
| Every public/external function | Yes — always |
| Every event | Yes — params and when emitted |
| Every error/panic | Yes — when it triggers |
| Storage layout (EVM) | Yes — especially for upgradeable contracts |
| Internal helpers | Only if non-obvious |
| Self-explanatory code | No — don't over-comment |

---

## EVM — NatSpec

Use NatSpec for all public interfaces. Solidity tooling, Etherscan, and auditors all parse it.

```solidity
/// @title Vault
/// @notice Accepts ETH deposits and allows withdrawals with a fee
/// @dev Implements ERC-4626 with a 0.1% withdrawal fee
contract Vault {

    /// @notice Emitted when a user deposits ETH
    /// @param user The depositing address
    /// @param amount The amount deposited in wei
    event Deposited(address indexed user, uint256 amount);

    /// @notice Emitted when a withdrawal fails due to insufficient balance
    /// @param user The withdrawing address
    /// @param requested Amount requested
    /// @param available Amount available
    error InsufficientBalance(address user, uint256 requested, uint256 available);

    /// @notice Deposit ETH into the vault
    /// @dev Updates balance before external call (CEI pattern)
    /// @return shares Number of vault shares minted
    function deposit() external payable returns (uint256 shares) { ... }

    /// @notice Withdraw ETH from the vault
    /// @param amount Amount in wei to withdraw
    /// @dev Applies a 0.1% fee; fee goes to treasury
    /// @custom:security Non-reentrant via _status lock
    function withdraw(uint256 amount) external { ... }
}
```

---

## Rust (NEAR / Soroban) — Doc Comments

Use `///` for public items, `//` for inline, `//!` for module-level.

```rust
//! # Vault Contract
//! 
//! Accepts NEAR deposits and allows withdrawals.
//! Implements basic bookkeeping with per-account balances.

/// Deposit NEAR into the vault.
/// 
/// # Panics
/// - If `attached_deposit` is zero
/// 
/// # Example
/// ```
/// vault.deposit();  // call with attached NEAR
/// ```
#[payable]
pub fn deposit(&mut self) {
    let amount = env::attached_deposit();
    require!(amount > NearToken::from_yoctonear(0), "Deposit must be > 0");
    ...
}

/// Returns the NEAR balance for `account_id`.
/// Returns 0 if the account has never deposited.
pub fn balance_of(&self, account_id: AccountId) -> NearToken { ... }
```

---

## README Structure

Every project needs a `README.md`. Use this structure:

```markdown
# Protocol Name

One-sentence description of what this does.

## Overview

2-3 paragraphs: what problem does it solve, how does it work at a high level,
what chains/environments does it target.

## Architecture

Brief description of the contract structure. Link to detailed docs if needed.

```
Vault.sol        ← main entry point
├── VaultLib.sol ← math helpers
└── IOracle.sol  ← price feed interface
```

## Getting Started

### Prerequisites
- Foundry / cargo / stellar-cli (version)
- Node.js (version, if needed)

### Install
```bash
git clone ...
forge install        # or cargo build
```

### Test
```bash
forge test           # or cargo test
```

### Deploy
```bash
forge script script/Deploy.s.sol --broadcast --rpc-url $RPC_URL
```

## Security

- Audit status: [Unaudited / Audited by X on date]
- Known limitations: ...
- Bug bounty: ...

## License
MIT / BSL-1.1 / etc.
```

---

## Architecture Decision Records (ADRs)

For any significant design decision, write an ADR in `docs/adr/`:

```markdown
# ADR-001: Use pull-over-push for payments

## Status
Accepted

## Context
We need to distribute rewards to many users. Push payments (iterating and 
sending to each) risk DoS if any recipient reverts.

## Decision
Use pull pattern: accumulate rewards in a mapping, let users claim themselves.

## Consequences
- Positive: resistant to DoS, gas cost borne by recipient
- Negative: users must actively claim; risk of unclaimed funds if user loses access
- Negative: slightly more complex UX
```

Filename: `docs/adr/001-pull-payments.md`

---

## Changelog

Maintain a `CHANGELOG.md` using [Keep a Changelog](https://keepachangelog.com) format:

```markdown
# Changelog

## [Unreleased]

## [1.1.0] - 2025-03-25
### Added
- Emergency pause mechanism (owner-only)
### Fixed
- Reentrancy in `withdraw()` function
### Security
- Addressed finding #3 from Trail of Bits audit

## [1.0.0] - 2025-01-10
### Added
- Initial deployment
```

---

## Comments — What to Write (and Not Write)

**Write**: *why*, not *what*
```solidity
// WRONG: tells us what (the code already does)
// Subtract amount from balance
balances[msg.sender] -= amount;

// RIGHT: tells us why this order matters
// State update before external call to prevent reentrancy (CEI pattern)
balances[msg.sender] -= amount;
(bool ok,) = msg.sender.call{value: amount}("");
```

**Write**: non-obvious constraints
```rust
// Storage deposit is pre-paid by the contract owner during init.
// If users could trigger unbounded storage growth, this would fail.
// Current max: 1000 entries (see storage_cost calculation in deploy script).
```

**Write**: references to specs / EIPs / NEPs
```solidity
// Implements EIP-4626 Section 4.1: preview functions must not revert
// See: https://eips.ethereum.org/EIPS/eip-4626
```

**Don't write**: noise
```solidity
// i++ means increment i by 1
i++;
```