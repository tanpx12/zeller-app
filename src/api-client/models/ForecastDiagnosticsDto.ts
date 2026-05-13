/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Forecast-quality diagnostics (v1.1 `forecast_diagnostics` block).
 *
 * The numeric values that depend ONLY on live state (`forward_ic_7d`,
 * `forward_ic_7d_ci`, `hit_rate_7d`) require a per-bar history of
 * `(forecast, realized_return)` pairs that the current
 * `state_snapshots` table does not store — it persists only the
 * scalar `last_forecast`. Until that history is wired, this DTO
 * emits the whole block as `null`s so the dashboard can render
 * "diagnostics unavailable" rather than fabricate values.
 *
 * `holdout_ic` + `ic_within_tolerance` additionally need the
 * reference IC loaded at server startup (same blocker as
 * `/triggers/current`).
 */
export type ForecastDiagnosticsDto = {
    /**
     * Spearman IC over the last 7 days of live bars.
     */
    forward_ic_7d?: number | null;
    /**
     * Bootstrap 95% CI for `forward_ic_7d`.
     */
    forward_ic_7d_ci?: any[] | null;
    /**
     * Fraction of live bars in the trailing 7 days where
     * `sign(forecast) == sign(realized_return)`. `None` when the
     * pair history isn't recorded yet.
     */
    hit_rate_7d?: number | null;
    /**
     * Reference IC from the holdout window the model was validated on.
     */
    holdout_ic?: number | null;
    /**
     * `true` when `forward_ic_7d_ci` lower bound is above the
     * holdout-driven floor. `None` when either value is missing.
     */
    ic_within_tolerance?: boolean | null;
};

