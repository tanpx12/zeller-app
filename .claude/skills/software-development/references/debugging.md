# Debugging Reference

## General Debugging Mindset

1. **Reproduce first** — write a failing test before touching code
2. **Bisect** — find the smallest possible input that triggers the bug
3. **State before behavior** — check what the state *is* before debugging what it *does*
4. **Don't guess** — use logs, traces, assertions

---

## EVM / Foundry Debugging

### Verbose traces
```bash
forge test --match-test test_myFailing -vvvv
# -v    show failing tests
# -vv   show logs
# -vvv  show traces for failing tests
# -vvvv show traces for all tests
```

### Reading a trace
```
[FAIL] test_withdraw()
├─ [1234] Vault::withdraw(100)
│   ├─ [500] ERC20::transfer(alice, 100)
│   │   └─ ← false                    ← transfer returned false
│   └─ ← revert: TransferFailed()     ← contract reverted here
```
Read bottom-up from the innermost revert.

### Common revert reasons
| Symptom | Likely cause |
|---------|-------------|
| `EvmError: Revert` with no message | custom error, use `--vvvv` |
| `arithmetic over/underflow` | subtraction going negative |
| `Out of gas` | infinite loop, unbounded array, too much SSTORE |
| `Invalid opcode` | calling address(0) or non-contract |

### Debugging with `console.log`
```solidity
import "forge-std/console.sol";

function problematic() external {
    console.log("balance:", balances[msg.sender]);
    console.log("amount:", amount);
}
```
Remove before audit/deployment.

### Fork debugging (reproduce mainnet issue)
```bash
forge test --match-test test_reproduce \
  --fork-url $ETH_RPC_URL \
  --fork-block-number 21000000 \
  -vvvv
```

### Cast for quick state inspection
```bash
cast call $CONTRACT "balanceOf(address)" $ALICE --rpc-url $RPC_URL
cast storage $CONTRACT 0 --rpc-url $RPC_URL    # slot 0
cast tx $TX_HASH --rpc-url $RPC_URL             # decode a tx
cast run $TX_HASH --rpc-url $RPC_URL            # replay a tx with traces
```

### Slither for static issues
```bash
slither . --print human-summary
slither . --detect reentrancy-eth,uninitialized-storage
```

---

## NEAR / Rust Debugging

### Reading panic messages
A NEAR panic looks like:
```
panicked at 'Insufficient balance: have 0, need 100', src/lib.rs:42
```
The string after `panicked at` is your `expect()` or `panic!()` message — make them descriptive.

### Verbose logging in contracts
```rust
use near_sdk::log;

pub fn withdraw(&mut self, amount: NearToken) {
    let balance = self.balances.get(&env::predecessor_account_id())
        .unwrap_or(NearToken::from_yoctonear(0));
    log!("withdraw: caller={} balance={} amount={}",
        env::predecessor_account_id(), balance, amount);
    ...
}
```
Logs appear in `near-workspaces` test output and NEAR Explorer.

### near-workspaces test output
```rust
let result = alice.call(contract.id(), "withdraw")
    .args_json(json!({ "amount": "1000000000000000000000000" }))
    .transact()
    .await?;

// Always check receipts for cross-contract failures
println!("{:#?}", result.receipt_outcomes());

// Get logs
for log in result.logs() {
    println!("LOG: {}", log);
}
```

### Cross-contract call debugging
The most subtle NEAR bugs: a cross-contract call fails but the callback doesn't handle it:
```rust
// WRONG: silently ignores failure
#[private]
pub fn on_transfer_complete(&mut self, #[callback_result] result: Result<(), PromiseError>) {
    // no check!
}

// RIGHT: always check the callback result
#[private]
pub fn on_transfer_complete(&mut self, #[callback_result] result: Result<(), PromiseError>) {
    if result.is_err() {
        // rollback state
        log!("Cross-contract transfer failed, rolling back");
        self.rollback_state();
    }
}
```

### Checking NEAR state
```bash
near view $CONTRACT balance_of '{"account_id": "alice.near"}' --networkId mainnet
near state $CONTRACT --networkId mainnet
```

---

## Stellar / Soroban Debugging

### Test environment inspection
```rust
#[test]
fn debug_failing_test() {
    let env = Env::default();
    env.mock_all_auths();

    // Print events after a call
    let result = client.some_function(&arg);
    println!("Events: {:?}", env.events().all());
    println!("Auths: {:?}", env.auths());
}
```

### stellar-cli invocation debugging
```bash
# Invoke with verbose output
stellar contract invoke \
  --id $CONTRACT_ID \
  --source alice \
  --network testnet \
  -- \
  deposit --amount 1000

# Simulate (no state change)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source alice \
  --network testnet \
  --send no \
  -- \
  deposit --amount 1000
```

### Common Soroban errors
| Error | Meaning |
|-------|---------|
| `Error(Contract, #N)` | Your `ContractError` variant N |
| `Error(Auth, ...)` | Auth check failed — wrong signer |
| `Error(Storage, ...)` | Key not found in storage |
| `Error(Wasm, ...)` | Wasm budget exceeded |

### Wasm budget exceeded
If you hit budget limits:
- Profile which operations are expensive (`env.cost_estimate()` in tests)
- Reduce loops, nested data structures
- Batch operations where possible
- Check if you're re-reading storage unnecessarily (cache in local vars)

---

## Universal Debugging Checklist

When stuck:

- [ ] Reproduce in an isolated test (not the full integration flow)
- [ ] Add logging/events before and after the suspect operation
- [ ] Check what the actual state is (not what you think it is)
- [ ] Read the error message carefully — it's usually right
- [ ] Check if the issue is an off-by-one (zero-indexing, inclusive/exclusive bounds)
- [ ] Check if the issue is a type mismatch (u128 vs u64, yoctoNEAR vs NEAR)
- [ ] Check ordering — was the state set up correctly before the call?
- [ ] Check authorization — is the right account calling?
- [ ] Search the chain-specific SDK issues/Discord for similar errors