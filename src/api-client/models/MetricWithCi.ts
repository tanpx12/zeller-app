/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A point estimate plus a 95 % confidence interval.
 *
 * Constructed via [`MetricWithCi::point`] (CI = `(NaN, NaN)` — used when
 * bootstrap is unavailable) or [`MetricWithCi::from_bootstrap`]
 * (populates both bounds).
 */
export type MetricWithCi = {
    /**
     * Lower CI bound (inclusive). `NaN` when no bootstrap is available;
     * round-trips through JSON as `null`.
     */
    ci_lower: number;
    /**
     * Upper CI bound (inclusive). `NaN` when no bootstrap is available;
     * round-trips through JSON as `null`.
     */
    ci_upper: number;
    /**
     * Point estimate.
     */
    value: number;
};

