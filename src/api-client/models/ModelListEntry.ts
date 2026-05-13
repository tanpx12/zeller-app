/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One row of `GET /api/v1/models`. Combines a catalog entry with the
 * run-count it has in the persisted index.
 */
export type ModelListEntry = {
    /**
     * 64-char lowercase hex of the `config_hash` the strategy is keyed by.
     */
    config_hash: string;
    /**
     * Free-form description.
     */
    description: string;
    /**
     * Newest `period_start_ms` across the matching runs. `None` when
     * `n_runs == 0`.
     */
    latest_period_start_ms?: number | null;
    /**
     * Distinct modes seen across the matching runs, alphabetically
     * sorted. Empty when `n_runs == 0`.
     */
    modes: Array<string>;
    /**
     * Number of reports in the index whose `config_hash` matches.
     * `0` is valid — means the catalog references a config that has no
     * persisted runs yet.
     */
    n_runs: number;
    /**
     * Friendly name (`"euler"`).
     */
    name: string;
};

