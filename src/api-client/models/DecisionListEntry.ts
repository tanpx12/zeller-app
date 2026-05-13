/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One row of `GET /api/v1/decisions`. Carries enough metadata for the
 * dashboard's "decisions sidebar" without forcing it to download the
 * full report; the dashboard fetches the body lazily via
 * `/decisions/:date`.
 */
export type DecisionListEntry = {
    /**
     * `YYYY-MM-DD` of the report's `generated_at`.
     */
    date: string;
    /**
     * Number of triggers whose `outcome` was `HardFire` or `SoftFire`.
     * `NoFire`s are not counted.
     */
    n_triggers_fired: number;
    /**
     * Human-readable verdict label (`"NoRetrainNeeded"`,
     * `"Recommend"`, …) — matches [`crate::evaluator::Verdict::label`].
     */
    verdict_label: string;
};

