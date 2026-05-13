/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MetricWithCi } from './MetricWithCi';
/**
 * At-a-glance backtest summary. Populated by
 * [`super::ReportBuilder::from_run`] from the headline metrics in
 * [`crate::metrics::backtest`].
 */
export type HeadlineSection = {
    /**
     * Annualised return as a fraction; see
     * [`crate::metrics::backtest::annual_return`].
     */
    annualized_return_pct: number;
    /**
     * Calmar ratio (annual return / max drawdown); see
     * [`crate::metrics::backtest::calmar`].
     */
    calmar: number;
    /**
     * Initial equity (USD). Mirrors [`crate::backtest::PortfolioConfig::initial_equity_usd`].
     */
    initial_equity: number;
    /**
     * Maximum drawdown as a fraction; see
     * [`crate::metrics::backtest::max_drawdown`].
     */
    max_drawdown_pct: number;
    /**
     * Number of round-trip trades extracted from `RunRecorder.fills` by
     * [`super::trades::extract_trades`].
     */
    n_trades: number;
    /**
     * Profit factor on per-bar returns; see
     * [`crate::metrics::backtest::profit_factor`].
     */
    profit_factor: number;
    /**
     * Annualised Sharpe with 95 % bootstrap CI; the point value comes from
     * [`crate::metrics::backtest::sharpe`] and the CI from
     * [`crate::metrics::bootstrap::bootstrap_sharpe_ci`].
     */
    sharpe: MetricWithCi;
    /**
     * Sortino (downside-deviation Sharpe variant). The point value is
     * computed inline by the builder; the CI is currently
     * [`MetricWithCi::point`] (CI = `(NaN, NaN)`) — Sortino bootstrap is a
     * future enhancement.
     */
    sortino: MetricWithCi;
    /**
     * Final equity (USD); see [`crate::metrics::backtest::terminal_equity`].
     */
    terminal_equity: number;
    /**
     * Fraction of bars with non-zero notional; see
     * [`crate::metrics::backtest::time_in_market`].
     */
    time_in_market_pct: number;
    /**
     * Total return as a fraction (e.g. `0.10` = 10 %): `terminal/initial - 1`.
     */
    total_return_pct: number;
    /**
     * Fraction of trades with `pnl_usd > 0`. `f64::NAN` when there are no
     * trades.
     */
    win_rate: number;
};

