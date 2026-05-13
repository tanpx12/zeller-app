/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Recent PnL roll-up (v1.1 `recent_pnl` block). All four windows are
 * computed by reading the equity curve back from the state store and
 * subtracting `equity[N-window]` from `equity[N-1]`. Trade count is
 * derived from the fill log. The whole block is `None` when the live
 * runner has fewer than 1h of history (so the dashboard renders an
 * empty KPI row rather than `+$0.00`).
 */
export type RecentPnlDto = {
    /**
     * Account PnL over the trailing 1 hour, USD.
     */
    pnl_1h_usd: number;
    /**
     * Trailing 24 hours.
     */
    pnl_24h_usd: number;
    /**
     * Trailing 7 days.
     */
    pnl_7d_usd: number;
    /**
     * Number of fills the runner logged in the trailing 24 hours.
     */
    trades_24h: number;
};

