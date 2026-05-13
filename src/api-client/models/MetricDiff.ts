/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One row of a headline-metric diff.
 *
 * `pct_change` convention: when `a == 0.0` the value is [`f64::NAN`]
 * (avoids the misleading `+inf` that Rust's `f64` division yields for
 * `non_zero / 0.0`). When both `a` and `b` are zero the delta is zero
 * and the percent change is also [`f64::NAN`] — the value is undefined
 * and renderers print "NaN%". Callers should treat NaN as "no
 * percent-change is meaningful here" rather than as a numerical value.
 */
export type MetricDiff = {
    /**
     * Value from report `a`.
     */
    'a': number;
    /**
     * Value from report `b`.
     */
    'b': number;
    /**
     * `b - a`.
     */
    delta: number;
    /**
     * Metric name (matches the headline-section field name when applicable).
     */
    name: string;
    /**
     * `(b - a) / |a| * 100`. [`f64::NAN`] when `a == 0.0` (see above).
     */
    pct_change: number;
};

