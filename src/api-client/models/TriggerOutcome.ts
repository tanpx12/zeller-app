/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One trigger's outcome. Either it didn't fire, fired softly, or fired hard.
 *
 * `metric` is the human-readable name of the metric that was checked
 * (e.g. `"forward_ic_ci_low"`); `value` is its numeric value at evaluation
 * time. `threshold` is the value the metric was compared against; `evidence`
 * is a one-line string for the report's bullet point.
 */
export type TriggerOutcome = ({
    /**
     * Metric was within tolerance (or could not be computed; `value` is
     * `NaN` in that case).
     */
    NoFire: {
        /**
         * Name of the metric the trigger inspected.
         */
        metric: string;
        /**
         * Numeric value of the metric (NaN if not computable).
         */
        value: number;
    };
} | {
    /**
     * Soft signal — degradation visible but not catastrophic. Two soft
     * fires (or one + age > 60d) yields a `Recommend` verdict.
     */
    SoftFire: {
        /**
         * Short evidence string for the report.
         */
        evidence: string;
        /**
         * Name of the metric.
         */
        metric: string;
        /**
         * The threshold the metric crossed.
         */
        threshold: number;
        /**
         * Numeric value.
         */
        value: number;
    };
} | {
    /**
     * Hard signal — unambiguous failure. Any single hard fire yields a
     * `StronglyRecommend` verdict.
     */
    HardFire: {
        /**
         * Short evidence string for the report.
         */
        evidence: string;
        /**
         * Name of the metric.
         */
        metric: string;
        /**
         * The threshold the metric crossed.
         */
        threshold: number;
        /**
         * Numeric value.
         */
        value: number;
    };
});

