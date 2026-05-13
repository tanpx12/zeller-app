/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Equal-width histogram with `edges.len() = counts.len() + 1`.
 */
export type Histogram = {
    /**
     * `n` bin counts.
     */
    counts: Array<number>;
    /**
     * `n + 1` bin edges (ascending). Entries may be `NaN` for the
     * empty-input branch.
     */
    edges: Array<number>;
};

