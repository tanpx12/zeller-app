/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Per-trade response shape — the spec-compliant version of
 * [`crate::report::TradeRecord`] enriched with the spec-required
 * `forecast`, `signal`, `trade_cost_usd`, and `funding_cost_usd`
 * fields. Built by [`enrich_trade`] from the persisted `TradeRecord`
 * plus the `report.raw.{forecasts, signals, trade_costs, holding_costs}`
 * arrays.
 *
 * Field names mirror the API doc (`docs/...apilist.md` §"Reports → trades"):
 * `entry_ts` / `exit_ts` (not `entry_timestamp`); `side` as a string
 * (`"long"` / `"short"`); `notional_usd` as an *unsigned* USD amount
 * (sign is carried by `side`).
 */
export type TradeDto = {
    /**
     * Fill price at entry.
     */
    entry_price: number;
    /**
     * Entry timestamp (ms since epoch).
     */
    entry_ts: number;
    /**
     * Fill price at exit.
     */
    exit_price: number;
    /**
     * Exit timestamp (ms since epoch).
     */
    exit_ts: number;
    /**
     * Raw model forecast at the entry bar.
     */
    forecast: number;
    /**
     * Sum of `holding_costs` over the same range — the funding
     * payment / receipt over the trade's lifetime (signed).
     */
    funding_cost_usd: number;
    /**
     * Number of bars between entry and exit (inclusive).
     */
    hold_bars: number;
    /**
     * Unsigned notional in USD (sign carried by `side`).
     */
    notional_usd: number;
    /**
     * `pnl_usd / notional_usd` as a unit fraction. `NaN` when notional is 0.
     */
    pnl_pct: number;
    /**
     * Realised PnL in USD (sign-aware — winning short is positive).
     */
    pnl_usd: number;
    /**
     * `"long"` when the entry fill had positive notional, `"short"` otherwise.
     */
    side: string;
    /**
     * `Signal` inner value at the entry bar.
     */
    signal: number;
    /**
     * Sum of `trade_costs` over the bars `[entry_idx ..= exit_idx]` —
     * the total transaction-cost charge attributed to this trade.
     */
    trade_cost_usd: number;
    /**
     * Stable per-trade identifier: `{run_id}-T{idx:04}`.
     */
    trade_id: string;
};

