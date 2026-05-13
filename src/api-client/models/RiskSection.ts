/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Histogram } from './Histogram';
import type { TimeSeries } from './TimeSeries';
/**
 * Risk-officer view of the run — drawdown profile, rolling Sharpe, return
 * distribution, tail risk, leverage.
 */
export type RiskSection = {
    /**
     * Conditional 5 % VaR (tail loss). Mean of returns at or below the
     * 5 % percentile, sign-flipped to a positive loss.
     */
    cvar_5pct: number;
    /**
     * Per-bar `(peak - current) / peak` drawdown. Length matches the
     * returns vector (= `equity_curve.len() - 1`); each entry is a
     * non-negative fraction.
     */
    drawdown_curve: TimeSeries;
    /**
     * Maximum drawdown observed during the run, as a fraction.
     */
    max_dd_depth_pct: number;
    /**
     * Number of bars from the running peak to the trough of the deepest
     * drawdown (inclusive of the trough).
     */
    max_dd_duration_bars: number;
    /**
     * Bars from the trough back to a new high. `None` if the drawdown was
     * not yet recovered at the end of the run.
     */
    max_dd_recovery_bars?: number | null;
    /**
     * Maximum leverage observed during the run; see
     * [`crate::metrics::backtest::max_leverage_used`].
     */
    max_leverage_used: number;
    /**
     * Histogram of per-bar simple returns; bin count chosen by the
     * builder.
     */
    return_distribution: Histogram;
    /**
     * Rolling annualised Sharpe over a 30-day window (720 hourly bars).
     * Empty when `bars.len() < ROLLING_SHARPE_30D_BARS`.
     */
    rolling_sharpe_30d: TimeSeries;
    /**
     * Rolling annualised Sharpe over a 90-day window (2160 hourly bars).
     * Empty when `bars.len() < ROLLING_SHARPE_90D_BARS`.
     */
    rolling_sharpe_90d: TimeSeries;
    /**
     * Per-bar drawdown depth — duplicates `drawdown_curve` for renderers
     * that want a separate "underwater area" chart. Both share the same
     * timestamps and values; ship a single source of truth and let the
     * renderers plot it twice if they want.
     */
    underwater_curve: TimeSeries;
    /**
     * Historical 5 % Value-at-Risk on per-bar returns, reported as a
     * **positive loss**: `-percentile(returns, 0.05)`.
     */
    var_5pct: number;
};

