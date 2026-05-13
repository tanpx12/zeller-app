/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TimeSeries } from './TimeSeries';
/**
 * Drawdown-focused projection of [`crate::report::RiskSection`] —
 * drawdown / underwater curves and the headline drawdown statistics.
 * Excludes rolling-Sharpe series and the return-distribution histogram
 * because they belong to broader risk views the dashboard pulls from
 * `/reports/:run_id` directly when needed.
 */
export type DrawdownDto = {
    drawdown_curve: TimeSeries;
    max_dd_depth_pct: number;
    max_dd_duration_bars: number;
    max_dd_recovery_bars?: number | null;
    underwater_curve: TimeSeries;
};

