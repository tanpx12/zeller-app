/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Promotion chain for a run — links a paper-trade or real-live run
 * back to the backtest it descended from, plus the decision that
 * approved each promotion.
 *
 * Spec: dashboard three-mode-lifecycle addendum §4.2. The audit trail
 * — `promoted_via_decision_id` — is what lets you trace, six months
 * later, exactly which decision verdict approved a real-live run.
 */
export type Lineage = {
    /**
     * Root of the promotion chain. Always a backtest. For a
     * backtest run this matches its own `run_id`; for a paper run
     * it points at the parent backtest; for a real-live run it
     * points at the original backtest (transitively the same as
     * the parent's `origin_run_id`).
     */
    origin_run_id?: string | null;
    /**
     * Immediate predecessor: the run this one was promoted from.
     * `None` for backtest runs (root of the chain) or runs that
     * weren't produced through a promotion workflow.
     */
    parent_run_id?: string | null;
    /**
     * Wall-clock millisecond timestamp when this promotion was
     * approved by an operator (acting on a `DecisionReport`).
     */
    promoted_at_ms?: number | null;
    /**
     * `DecisionReport` identifier (date string `YYYY-MM-DD`) that
     * the operator was acting on when they approved this promotion.
     * The dashboard renders this as a clickable link to the
     * `/decisions/{date}` route.
     */
    promoted_via_decision_id?: string | null;
};

