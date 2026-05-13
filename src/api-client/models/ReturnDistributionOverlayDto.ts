/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * v1.1 addition — return-distribution histogram overlay for the Compare
 * tab's distribution chart. Bins are shared between A and B (computed from
 * the union of both return series, then both are binned identically), so
 * `a.len() == b.len() == bin_edges.len() - 1`.
 */
export type ReturnDistributionOverlayDto = {
    'a': Array<number>;
    'b': Array<number>;
    bin_edges: Array<number>;
};

