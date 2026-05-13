/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Side-by-side snapshot of two runs' [`crate::report::RunMetadata`].
 */
export type MetadataDiff = {
    /**
     * `(a.asset, b.asset)`.
     */
    assets: any[];
    /**
     * `true` when `a.config_hash == b.config_hash`.
     */
    config_hashes_match: boolean;
    /**
     * `(a.git_sha, b.git_sha)`.
     */
    git_shas: any[];
    /**
     * `(a.interval, b.interval)`.
     */
    intervals: any[];
    /**
     * `true` when `a.model_hash == b.model_hash`.
     */
    model_hashes_match: boolean;
    /**
     * `(a.mode, b.mode)`.
     */
    modes: any[];
    /**
     * `(a.period, b.period)` (UTC start/end timestamps).
     */
    periods: Array<Array<string>>;
    /**
     * `(a.run_id, b.run_id)`.
     */
    run_ids: any[];
};

