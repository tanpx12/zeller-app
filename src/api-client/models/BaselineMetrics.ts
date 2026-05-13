/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Metrics for a single baseline run, used by [`BaselineComparison`].
 *
 * Mostly the same shape as [`crate::metrics::backtest::BacktestSummary`].
 */
export type BaselineMetrics = {
    /**
     * Annualised return as a fraction.
     */
    annual_return: number;
    /**
     * Maximum drawdown as a fraction.
     */
    max_dd: number;
    /**
     * Human-readable baseline label (e.g. `"buy_and_hold"`).
     */
    name: string;
    /**
     * Annualised Sharpe.
     */
    sharpe: number;
    /**
     * Final equity (USD) of the baseline.
     */
    terminal_equity: number;
};

