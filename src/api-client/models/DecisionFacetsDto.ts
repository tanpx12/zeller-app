/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * v1.1 addition — facet counts on `GET /api/v1/decisions`.
 *
 * Powers the Decisions tab's filter pills (`No-action 18`, `Monitor 3`, …).
 * `/decisions` has no query-string filters today, so each count is just
 * the total across the persisted decision dir, grouped by verdict label.
 */
export type DecisionFacetsDto = {
    /**
     * Counts keyed by [`crate::evaluator::Verdict::label`].
     */
    by_verdict: Record<string, number>;
};

