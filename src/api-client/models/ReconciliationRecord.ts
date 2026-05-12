/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One persisted reconciliation outcome — what the live runner computed
 * at a single reconciliation tick. Stored append-only so the API can
 * surface the last N results for the monitoring view.
 *
 * The numeric fields mirror [`crate::runner::ReconciliationOutcome`] plus
 * the wall-clock timestamp and the tolerance that was in effect when the
 * check ran (the runner can change tolerance via
 * [`crate::runner::LiveRunner::with_reconciliation`]; persisting the
 * effective tolerance avoids ambiguity on re-read).
 */
export type ReconciliationRecord = {
    /**
     * Batch-replay terminal equity over the same N bars.
     */
    batch_terminal_equity: number;
    /**
     * `true` when `divergence_pct > tolerance`.
     */
    diverged: boolean;
    /**
     * `|live - batch| / |live|` (or `f64::INFINITY` when live == 0).
     */
    divergence_pct: number;
    /**
     * Live runner's terminal equity at the check moment.
     */
    live_terminal_equity: number;
    /**
     * Number of bars replayed (matches `ReconciliationOutcome::n_bars`).
     */
    n_bars: number;
    /**
     * Wall-clock unix timestamp (ms) at the moment of reconciliation.
     */
    timestamp_ms: number;
    /**
     * Tolerance that was in effect (e.g. `0.05` for 5%).
     */
    tolerance: number;
};

