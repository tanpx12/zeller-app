/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Histogram } from './Histogram';
import type { MetricWithCi } from './MetricWithCi';
import type { TimeSeries } from './TimeSeries';
/**
 * Forecast-quality view of the run.
 */
export type ForecastSection = {
    /**
     * Closed-form OLS intercept. Spec target ≈ 0.
     */
    calibration_intercept: number;
    /**
     * Decile calibration: `(mean(forecast in decile_k), mean(realized in
     * decile_k))` for `k = 0..10`. The ideal locus is the line `y = x`.
     */
    calibration_pairs: Array<any[]>;
    /**
     * Closed-form OLS slope of realized on forecast. Spec target ≈ 1.
     */
    calibration_slope: number;
    /**
     * Histogram of the raw `forecasts` vector.
     */
    forecast_distribution: Histogram;
    /**
     * Spearman IC across the full run with bootstrap CI.
     */
    ic_overall: MetricWithCi;
    /**
     * Rolling 30-day Spearman IC. Each entry is computed over a window
     * of [`super::risk::ROLLING_SHARPE_30D_BARS`] aligned bars. Empty
     * when fewer bars than the window are available.
     */
    ic_rolling_30d: TimeSeries;
    /**
     * `(magnitude_bucket_mean_abs_forecast, sign-accuracy hit rate within
     * bucket)` over 10 equal-population buckets ranked by `|forecast|`.
     * Spec target: hit rate rises with magnitude (confidence helps).
     */
    sign_accuracy_by_magnitude: Array<any[]>;
};

