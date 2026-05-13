/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A reconstructed round-trip trade: open → close.
 *
 * Derived from `RunRecorder.fills` by [`extract_trades`]. Field semantics
 * match the spec's "every trade with entry, exit, PnL, hold" sketch.
 */
export type TradeRecord = {
    /**
     * Price at which the trade was opened.
     */
    entry_price: number;
    /**
     * Bar timestamp (ms since epoch) of the opening fill.
     */
    entry_timestamp: number;
    /**
     * Price at which the trade was closed.
     */
    exit_price: number;
    /**
     * Bar timestamp (ms since epoch) of the closing fill.
     */
    exit_timestamp: number;
    /**
     * Number of bars held: `(exit_timestamp - entry_timestamp) /
     * bar_duration_ms`. We don't have the bar duration here, so the
     * builder records the count of fills between open and close +1
     * instead. See [`extract_trades`].
     */
    hold_bars: number;
    /**
     * Signed notional at entry (positive long, negative short).
     */
    notional: number;
    /**
     * Realised PnL in USD: `notional * (exit_price / entry_price - 1)`.
     * Sign-aware — a winning short returns a positive number.
     */
    pnl_usd: number;
};

