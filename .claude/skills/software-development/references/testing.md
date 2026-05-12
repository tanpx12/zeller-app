# Testing Strategy

## The Testing Pyramid for Smart Contracts

```
         /\
        /  \   E2E / Mainnet fork
       /----\  Integration (multi-contract, workspaces)
      /------\ Unit (single contract/function)
     /--------\ Static analysis (Slither, Clippy)
```

Write more unit tests than integration, more integration than E2E.
Static analysis is free — always run it.

---

## Coverage Targets

| Type | Target |
|------|--------|
| Unit test line coverage | ≥ 90% |
| Branch coverage | ≥ 80% |
| Every public/external function | must have at least one test |
| Every revert path | must have at least one test |
| Every event emission | must be asserted |

Coverage alone is not safety. A test that calls a function but asserts nothing provides 0 safety value.

---

## EVM Testing (Foundry)

### Unit test structure
```solidity
// test/unit/Vault.t.sol
contract VaultTest is Test {
    Vault vault;
    address alice = makeAddr("alice");

    function setUp() public {
        vault = new Vault();
        vm.deal(alice, 100 ether);
    }

    // Naming: test_<function>_<scenario>_<expectedOutcome>
    function test_deposit_normalAmount_updatesBalance() public { ... }
    function test_deposit_zeroAmount_reverts() public { ... }
    function test_withdraw_exceedsBalance_reverts() public { ... }
    function test_withdraw_success_emitsEvent() public { ... }
}
```

### Test categories
```solidity
// Revert tests
function test_foo_badInput_reverts() public {
    vm.expectRevert(MyError.selector);
    vault.foo(badInput);
}

// Event tests
function test_foo_success_emitsEvent() public {
    vm.expectEmit(true, true, false, true);
    emit Deposited(alice, 1 ether);
    vault.deposit{value: 1 ether}();
}

// Fork tests (real state)
function test_integrate_withRealUSDC() public {
    vm.createSelectFork(vm.envString("ETH_RPC_URL"), 21_000_000);
    IERC20 usdc = IERC20(0xA0b8...); // real address
    ...
}

// Fuzz tests
function testFuzz_deposit_anyAmount(uint96 amount) public {
    vm.assume(amount > 0 && amount <= 100 ether);
    vault.deposit{value: amount}();
    assertEq(vault.balanceOf(alice), amount);
}

// Invariant tests
function invariant_totalSupplyMatchesSumOfBalances() public {
    assertEq(vault.totalSupply(), sumAllBalances());
}
```

### Foundry test flags
```bash
forge test -vvvv                    # verbose: show traces
forge test --match-test test_vault  # run specific tests
forge test --fork-url $RPC_URL      # fork mainnet
forge test --gas-report             # gas per function
forge coverage                      # coverage report
forge snapshot                      # save gas snapshot
forge snapshot --check              # fail if gas changed
```

---

## NEAR Testing (Rust)

### Unit tests (in-contract)
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    fn get_context(predecessor: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder.predecessor_account_id(predecessor);
        builder
    }

    #[test]
    fn test_deposit_updates_balance() {
        let context = get_context(accounts(0));
        testing_env!(context.attached_deposit(NearToken::from_near(1)).build());
        let mut contract = MyContract::new();
        contract.deposit();
        assert_eq!(contract.balance_of(accounts(0)), NearToken::from_near(1));
    }

    #[test]
    #[should_panic(expected = "Insufficient balance")]
    fn test_withdraw_insufficient_panics() {
        let context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = MyContract::new();
        contract.withdraw(NearToken::from_near(1));
    }
}
```

### Integration tests (near-workspaces)
```rust
// tests/integration/main.rs
#[tokio::test]
async fn test_full_deposit_withdraw_flow() -> anyhow::Result<()> {
    let worker = near_workspaces::sandbox().await?;
    let wasm = near_workspaces::compile_project("./").await?;
    let contract = worker.dev_deploy(&wasm).await?;

    let alice = worker.dev_create_account().await?;

    let result = alice
        .call(contract.id(), "deposit")
        .deposit(NearToken::from_near(1))
        .transact()
        .await?;
    assert!(result.is_success());

    let balance: NearToken = contract
        .view("balance_of")
        .args_json(json!({ "account_id": alice.id() }))
        .await?
        .json()?;
    assert_eq!(balance, NearToken::from_near(1));
    Ok(())
}
```

### Cross-contract call testing
Always test the failure path of cross-contract calls — what happens when the callee panics or the promise fails. This is the most common source of bugs in NEAR contracts.

---

## Stellar / Soroban Testing

```rust
// src/test.rs
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_deposit() {
        let env = Env::default();
        env.mock_all_auths();   // bypass auth checks in unit tests

        let contract_id = env.register_contract(None, MyContract);
        let client = MyContractClient::new(&env, &contract_id);

        let user = Address::generate(&env);
        client.deposit(&user, &1000i128);
        assert_eq!(client.balance(&user), 1000i128);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #1)")]
    fn test_deposit_zero_panics() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, MyContract);
        let client = MyContractClient::new(&env, &contract_id);
        let user = Address::generate(&env);
        client.deposit(&user, &0i128);
    }
}
```

**Soroban auth testing**: always test that functions requiring auth actually check it — call without `mock_all_auths()` and verify it panics.

---

## What to Always Test

Regardless of chain, every contract needs tests for:

1. **Happy path** — the normal expected flow works
2. **All revert/panic conditions** — every `require`, `assert`, `panic!` has a failing test
3. **Access control** — unauthorized callers are rejected
4. **Edge values** — zero, max, boundary values
5. **Event/log emission** — every significant state change emits the right event
6. **State consistency** — after any operation, invariants hold

## What NOT to Test

- Solidity compiler behavior (e.g., don't test that `uint256` overflows)
- Third-party library internals (OpenZeppelin, near-sdk)
- Things you can't meaningfully assert on

---

## Running All Tests Locally

```bash
# EVM
forge test -vvv

# NEAR
cargo test                          # unit tests
cargo test --test integration       # workspaces tests

# Stellar
cargo test

# All Rust in monorepo
cargo test --workspace
```