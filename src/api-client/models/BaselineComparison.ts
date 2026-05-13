/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaselineMetrics } from './BaselineMetrics';
import type { DmTestResult } from './DmTestResult';
import type { TimeSeries } from './TimeSeries';
/**
 * Comparison block — populated by Step 11+ once baselines are wired in.
 *
 * The current builder always emits [`BaselineComparison::empty`]: a
 * "model" baseline copy plus an unpopulated `dm_test_vs_momentum`. The
 * renderers must tolerate empty / NaN baselines without crashing.
 */
export type BaselineComparison = {
    /**
     * Buy-and-hold baseline metrics.
     */
    buy_and_hold: BaselineMetrics;
    /**
     * Diebold-Mariano test of model vs momentum. `(NaN, NaN, 0, NaN, 0)`
     * when the comparison hasn't been run yet.
     */
    dm_test_vs_momentum: DmTestResult;
    /**
     * Equity curves for the overlay chart, keyed by baseline name.
     */
    equity_curves: Record<string, TimeSeries>;
    /**
     * Model run metrics (a redundant copy of the headline figures, but
     * in [`BaselineMetrics`] shape so renderers can iterate uniformly).
     */
    model: BaselineMetrics;
    /**
     * Momentum baseline metrics.
     */
    momentum: BaselineMetrics;
};

