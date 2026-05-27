/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Wire-shape for one row of [`Paginated::data`]. Mirrors
 * [`IndexedReport`] with two adjustments aimed at frontend consumption:
 *
 * 1. `sharpe: Option<f64>` — `None` (JSON `null`) for the NaN/empty-run case.
 * `f64::NAN` is forbidden in JSON; `Option` makes the absence explicit
 * instead of relying on serde_json's NaN handling (which has shifted
 * across versions).
 * 2. `config_hash` / `model_hash` are hex strings, not byte arrays. JSON
 * arrays of integers are unfriendly for diffing in dashboards; hex is
 * the standard serialization for these throughout the project.
 */
export type IndexedReportDto = {
    asset: string;
    /**
     * Lowercase hex (64 chars).
     */
    config_hash: string;
    generated_at_ms: number;
    git_sha?: string | null;
    /**
     * Starting equity (USD). Project default `10_000.0` unless a
     * caller overrode it at `BacktestConfig.portfolio.initial_equity_usd`.
     * Surfaced here so dashboards can compute return % without
     * loading the full headline section.
     */
    initial_equity: number;
    interval: string;
    max_drawdown_pct: number;
    /**
     * Lowercase mode string: `batch` / `holdout` / `live` / `reconciliation`.
     */
    mode: string;
    /**
     * Lowercase hex (64 chars).
     */
    model_hash: string;
    /**
     * Human-readable model name (`"euler"`, `"gauss"`, `"laplace"`).
     * `null` for reports written before this field landed.
     */
    model_name?: string | null;
    period_end_ms: number;
    period_start_ms: number;
    run_id: string;
    /**
     * `null` when the headline Sharpe is NaN (empty run / all-zero returns).
     */
    sharpe?: number | null;
    terminal_equity: number;
};

