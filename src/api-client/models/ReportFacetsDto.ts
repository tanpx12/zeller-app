/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * v1.1 addition — facet counts that accompany the paginated list.
 *
 * Each map is `key → count`, where the count applies every active filter on
 * the request *except* the dimension being faceted. That asymmetry is what
 * lets the dashboard render filter pills (`Batch 182`, `Holdout 14`, …) that
 * still show non-zero counts for the unselected options.
 */
export type ReportFacetsDto = {
    /**
     * Counts keyed by asset symbol (`BTC`, `ETH`, …).
     */
    by_asset: Record<string, number>;
    /**
     * Counts keyed by run mode (`batch` / `holdout` / `live` / `reconciliation`).
     */
    by_mode: Record<string, number>;
};

