/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Uniform envelope returned by every time-series endpoint.
 *
 * `points` are `(timestamp_ms, value)` tuples — `serde_json` serializes
 * them as JSON 2-arrays per spec line 1607-1610. `next_cursor` exists
 * for future paginated time series — it is currently always `null`,
 * since the spec (line 1595) prefers `since` / `until` filters for time
 * series over cursor pagination.
 */
export type TimeSeriesEnvelope = {
    /**
     * Asset symbol (`"BTC"`); echoed from the producing report's metadata.
     */
    asset: string;
    /**
     * Echo of the requested downsampling mode (`"none"` / `"hourly"` /
     * `"daily"`), so the dashboard can label the chart correctly.
     */
    downsample: string;
    /**
     * Bar interval (`"1h"`); echoed from the producing report's metadata.
     */
    interval: string;
    /**
     * Currently always `null`. Reserved for future cursor paging if a
     * 1m-bar history grows large enough to need it.
     */
    next_cursor?: string | null;
    /**
     * Time-ascending list of `[ts_ms, value]` pairs.
     */
    points: Array<any[]>;
    /**
     * Stable identifier for the series (`"equity_usd"`, `"drawdown_pct"`, …).
     */
    series_name: string;
};

