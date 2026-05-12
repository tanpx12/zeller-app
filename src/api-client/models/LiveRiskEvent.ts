/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One persisted live-mode risk-guard intervention.
 *
 * Append-only log of every `RiskDecision` the policy chain returned that
 * was not `Allow`. The fields capture enough context to render the
 * monitoring UI's risk-event table without re-running the engine.
 */
export type LiveRiskEvent = {
    /**
     * Decision kind: `"clip"`, `"reject"`, `"force_flat"`.
     */
    action: string;
    /**
     * Notional after the guard clipped (signed USD); `None` for
     * `reject` / `force_flat` actions where the result is just zero.
     */
    clipped_notional?: number | null;
    /**
     * Human-readable reason from the guard (e.g. the `ForceFlat.reason`
     * string, or `"clip on equity X"` for a `LeverageCap` event).
     */
    context: string;
    /**
     * Guard name (e.g. `"LeverageCap"`, `"StopLossGuard"`,
     * `"LiquidationModel"`, `"DrawdownStop"`).
     */
    guard: string;
    /**
     * Notional the sizer wanted (signed USD); `None` if the action
     * originated outside an explicit sizing intent.
     */
    original_notional?: number | null;
    /**
     * Bar timestamp (ms) at which the guard fired.
     */
    timestamp_ms: number;
};

