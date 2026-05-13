/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Histogram } from './Histogram';
import type { MetricWithCi } from './MetricWithCi';
import type { SignAccuracyBucketDto } from './SignAccuracyBucketDto';
import type { TimeSeries } from './TimeSeries';
/**
 * `GET /api/v1/reports/:run_id/forecast` response shape — adds the
 * API-doc-style `sign_accuracy_by_magnitude` bucket records (named
 * fields + `n`) without rewriting the persisted [`ForecastSection`].
 */
export type ForecastDto = {
    /**
     * OLS intercept.
     */
    calibration_intercept: number;
    /**
     * `(forecast_decile_mean, realized_decile_mean)` pairs.
     */
    calibration_pairs: Array<any[]>;
    /**
     * OLS slope of realized on forecast.
     */
    calibration_slope: number;
    /**
     * Histogram of raw forecast values.
     */
    forecast_distribution: Histogram;
    /**
     * Spearman IC over the full run with bootstrap CI.
     */
    ic_overall: MetricWithCi;
    /**
     * Rolling 30-day Spearman IC.
     */
    ic_rolling_30d: TimeSeries;
    /**
     * Sign-accuracy buckets in the API-doc shape (named fields + `n`).
     */
    sign_accuracy_by_magnitude: Array<SignAccuracyBucketDto>;
};

