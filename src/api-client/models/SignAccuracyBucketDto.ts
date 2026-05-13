/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One bucket of the `sign_accuracy_by_magnitude` analysis with the
 * API-doc field names (`abs_y_bucket_mean`, `hit_rate`, `n`). The
 * persisted [`ForecastSection`] stores `(mean_abs_forecast, hit_rate)`
 * as raw tuples; this DTO names them and reconstructs `n` from the
 * builder's equal-population deciling (`n = total / n_buckets`, last
 * bucket absorbs any remainder).
 */
export type SignAccuracyBucketDto = {
    /**
     * Mean `|forecast|` within the bucket.
     */
    abs_y_bucket_mean: number;
    /**
     * Fraction of bars in the bucket where `sign(forecast) == sign(realized)`.
     */
    hit_rate: number;
    /**
     * Number of forecast/realized pairs in the bucket.
     */
    'n': number;
};

