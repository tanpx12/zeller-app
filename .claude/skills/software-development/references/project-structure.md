# Project Structure Reference

## Single-Chain Project

### EVM (Foundry)
```
my-protocol/
├── src/
│   ├── interfaces/        # All interfaces (IVault.sol, IOracle.sol)
│   ├── libraries/         # Pure/stateless libs (Math, SafeTransfer)
│   ├── abstract/          # Base contracts
│   └── *.sol              # Core contracts
├── test/
│   ├── unit/              # forge test, one file per contract
│   ├── integration/       # fork tests, multi-contract scenarios
│   ├── invariant/         # foundry invariant tests
│   └── helpers/           # base test contracts, mocks
├── script/
│   ├── Deploy.s.sol
│   └── interactions/
├── lib/                   # forge install dependencies
├── foundry.toml
├── .env.example           # never commit .env
└── README.md
```

### NEAR (Rust)
```
my-contract/
├── src/
│   ├── lib.rs             # contract entry, public interface
│   ├── types.rs           # structs, enums, serialization
│   ├── storage.rs         # StorageKey enum, collection init
│   ├── internal.rs        # private business logic
│   └── views.rs           # read-only methods
├── tests/
│   └── integration/
│       └── main.rs        # near-workspaces tests
├── Cargo.toml
├── build.sh               # cargo-near build command
└── README.md
```

### Stellar / Soroban (Rust)
```
my-contract/
├── src/
│   ├── lib.rs             # #[contract], public interface
│   ├── storage.rs         # DataKey enum, storage helpers
│   ├── types.rs           # structs with contracttype
│   └── error.rs           # ContractError enum
├── tests/
│   └── test.rs            # soroban testutils
├── Cargo.toml
└── README.md
```

---

## Multi-Chain Monorepo

For projects that span chains or combine contracts + frontend + indexer:

```
my-project/
├── contracts/
│   ├── evm/               # Foundry project (has own foundry.toml)
│   ├── near/              # Rust workspace member
│   └── stellar/           # Rust workspace member
├── sdk/                   # shared TypeScript SDK for all chains
│   ├── src/
│   │   ├── evm/
│   │   ├── near/
│   │   └── stellar/
│   └── package.json
├── indexer/               # subgraph / NEAR indexer / horizon queries
├── frontend/              # Next.js or similar
├── scripts/               # deployment, migration, admin scripts
│   ├── evm/
│   ├── near/
│   └── stellar/
├── docs/
│   ├── architecture.md
│   ├── deployment.md
│   └── audits/
├── .github/
│   └── workflows/
│       ├── evm-test.yml
│       ├── near-test.yml
│       └── stellar-test.yml
├── Cargo.toml             # Rust workspace (near + stellar as members)
├── package.json           # JS workspace root
└── README.md
```

### Rust workspace `Cargo.toml` (NEAR + Stellar together)
```toml
[workspace]
members = [
    "contracts/near",
    "contracts/stellar",
]
resolver = "2"

[profile.release]
codegen-units = 1
opt-level = "z"
lto = true
```

---

## Naming Conventions

### Files
- Solidity: `PascalCase.sol` matching the primary contract name
- Rust: `snake_case.rs`
- Test files: mirror the file they test (`Vault.sol` → `Vault.t.sol` or `vault_test.rs`)
- Scripts: verb-first (`Deploy.s.sol`, `MigrateV2.s.sol`)

### Contracts / Modules
- Interfaces: prefix `I` (`IVault`, `IOracle`)
- Abstract base: prefix `Abstract` or `Base` (`BaseVault`)
- Libraries: suffix `Lib` or `Utils` (`MathLib`, `SafeTransferLib`)
- NEAR: module per concern (`storage`, `internal`, `views`)

### Variables
- Solidity: `camelCase` for locals/params, `s_` prefix for storage, `i_` for immutables, `CAPS` for constants
- Rust: `snake_case` everywhere (clippy enforces this)

---

## What Goes Where

| Thing | Location |
|-------|----------|
| Shared types used by multiple contracts | `src/interfaces/` or `src/types.rs` |
| Math / pure computation | library / module, zero state |
| Business logic | internal functions, not public |
| Config / constants | top-level constants file |
| Test fixtures / mocks | `test/helpers/` |
| Deployment addresses | `deployments/<chain>/<network>.json` |
| ABI files | generated, never hand-edited, gitignored or in `out/` |

---

## Environment & Secrets

- `.env` is **never committed** — always `.gitignored`
- `.env.example` is committed with placeholder values
- Private keys: use hardware wallet or KMS in production; `$PRIVATE_KEY` env var for local only
- RPC URLs: use `$RPC_URL` env var; never hardcode
- Foundry: load via `vm.envAddress()` / `vm.envUint()` in scripts
- NEAR: CLI keystore (`~/.near-credentials/`)
- Stellar: stellar-cli identity store