/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A timestamped numeric series, used for chart inputs.
 *
 * `timestamps[i]` is the unix-epoch-millisecond timestamp of `values[i]`.
 * The two slices are always the same length.
 */
export type TimeSeries = {
    /**
     * Per-point bar timestamps (ms since epoch).
     */
    timestamps: Array<number>;
    /**
     * Per-point values. Individual entries may be `NaN` (rolling-window
     * metrics emit `NaN` for the warm-up bars before the window fills);
     * on the wire those become JSON `null` and round-trip back through
     * [`crate::report::nan_safe::vec_f64_nan_safe`].
     */
    values: Array<number>;
};

