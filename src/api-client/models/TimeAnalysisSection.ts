/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Time-of-day / day-of-week aggregations over per-bar returns.
 */
export type TimeAnalysisSection = {
    /**
     * Mean per-bar return (fraction) bucketed by UTC hour.
     */
    avg_return_by_hour: Array<number>;
    /**
     * Sum of per-bar PnL (USD) bucketed by UTC day of week (Monday = 0,
     * Sunday = 6).
     */
    pnl_by_day_of_week: Array<number>;
    /**
     * Sum of per-bar PnL (USD) bucketed by UTC hour. Index `h` is hour
     * `h ∈ 0..=23`. The PnL for a bar is the equity change over that bar
     * (per-bar `Δequity`).
     */
    pnl_by_hour_utc: Array<number>;
    /**
     * Number of bars in each UTC-hour bucket. Used by renderers to
     * compute averages.
     */
    trade_count_by_hour: Array<number>;
};

