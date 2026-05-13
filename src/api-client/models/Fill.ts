/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A realized fill produced by [`crate::backtest::Execution::fill`].
 *
 * `notional` is **signed**: positive = long, negative = short. A flatten is a
 * fill whose `notional` brings the running position back to zero.
 *
 * `serde::{Serialize, Deserialize}` are derived so the Phase 8 (Step 24)
 * live module can persist fills via `StateStore::append_fill` and embed
 * them inside `EngineState::fills` snapshots.
 */
export type Fill = {
    /**
     * Signed USD notional filled. Positive = long, negative = short.
     */
    notional: number;
    /**
     * Fill price (currency units per unit of underlying).
     */
    price: number;
    /**
     * Timestamp of the bar on which the fill occurred (ms since epoch).
     */
    timestamp: number;
};

