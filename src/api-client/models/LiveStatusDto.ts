/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdapterStatus } from './AdapterStatus';
import type { ForecastDiagnosticsDto } from './ForecastDiagnosticsDto';
import type { RecentPnlDto } from './RecentPnlDto';
/**
 * Wire shape for `GET /api/v1/live/status`.
 *
 * Strips out the heavyweight `feature_buffer` field that
 * [`crate::state::EngineState`] carries (rolling history of feature
 * columns; the dashboard never needs it) and the `fills` history (a
 * dedicated `/live/fills` endpoint serves that with `since=` filtering).
 * `config_hash` is also intentionally omitted — it is a debugging
 * detail, not user-facing.
 *
 * v1.1 additions: `sigma_hat`, `recent_pnl`, `forecast_diagnostics`.
 */
export type LiveStatusDto = {
    adapter?: (null | AdapterStatus);
    /**
     * `now - written_at_ms` in seconds; clamped to `0` when the clock
     * is non-monotonic.
     */
    age_seconds: number;
    /**
     * Signed position in USD notional. Positive = long, negative =
     * short, zero = flat.
     */
    current_position: number;
    /**
     * Account equity in USD at the latest snapshot.
     */
    equity: number;
    /**
     * Forecast-quality diagnostics. v1.1 addition. Fields default to
     * `None` until the state store persists per-bar `(forecast,
     * realized_return)` pairs.
     */
    forecast_diagnostics: ForecastDiagnosticsDto;
    /**
     * `true` when `age_seconds > stale_threshold_secs` — the
     * authoritative "runner is stale / likely down" signal. Clients
     * should drive their offline indicator from this flag, NOT from a
     * hardcoded `age_seconds` comparison. A stale snapshot is still
     * returned (HTTP 200) so the dashboard can show last-known values
     * behind an offline badge.
     */
    is_stale: boolean;
    /**
     * Most recent forecast emitted by the live model.
     */
    last_forecast: number;
    /**
     * Number of fills the runner has logged on this state row.
     */
    n_fills: number;
    recent_pnl?: (null | RecentPnlDto);
    /**
     * Model volatility estimate at the latest bar (rolling realised
     * std). `None` until the state store persists the per-bar
     * `RollingStats::realized_vol_20`. Added for the dashboard's
     * Forecast KPI card (`σ̂` shown beneath `ŷ`). v1.1 addition.
     */
    sigma_hat?: number | null;
    /**
     * The server's freshness ceiling in seconds (`serve
     * --live-stale-threshold-secs`, default two bar intervals). Exposed
     * so clients compute staleness against the server's cadence instead
     * of hardcoding a value — the runner persists once per bar close,
     * so `age_seconds` legitimately ranges up to one bar interval in
     * perfect health.
     */
    stale_threshold_secs: number;
    /**
     * Bar timestamp (ms since epoch) of the latest snapshot.
     */
    timestamp: number;
    /**
     * Wall-clock instant the runner persisted this snapshot
     * (`state_snapshots.created_at_ms`).
     */
    written_at_ms: number;
};

