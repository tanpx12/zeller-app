/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One row of the search response.
 *
 * `label` is server-composed (`"{first_tag_or_asset} · {mode} · {duration}"`)
 * so the dashboard can render hits directly. `tags` is shipped for the
 * spec's symmetry but is always `[]` until the tag-plumbing wave lands.
 */
export type ReportSearchHit = {
    asset: string;
    label: string;
    mode: string;
    period_end: number;
    period_start: number;
    run_id: string;
    sharpe?: number | null;
    tags: Array<string>;
};

