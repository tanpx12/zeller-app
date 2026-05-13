/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Raw parallel vectors mirroring the recorder, for renderers that want
 * to draw charts directly from the raw lanes.
 *
 * All vectors are aligned to bar index. `equity` has length `n_bars + 1`
 * (initial equity prepended); the others have length `n_bars` (or zero
 * when the run was empty).
 */
export type RawSeries = {
    /**
     * Equity curve, prefixed with the initial equity.
     */
    equity: Array<number>;
    /**
     * Per-bar signed fill notional (USD); zero when no fill on that bar.
     */
    fill_notionals: Array<number>;
    /**
     * Per-bar raw forecast value.
     */
    forecasts: Array<number>;
    /**
     * Per-bar holding cost (USD; signed per the engine convention).
     */
    holding_costs: Array<number>;
    /**
     * Per-bar `Signal` inner value.
     */
    signals: Array<number>;
    /**
     * Per-bar bar-close timestamp (ms since epoch). Aligned to the
     * `equity[1..]` tail (i.e. one entry per processed bar).
     */
    timestamps_ms: Array<number>;
    /**
     * Per-bar trade cost (USD; non-negative).
     */
    trade_costs: Array<number>;
};

