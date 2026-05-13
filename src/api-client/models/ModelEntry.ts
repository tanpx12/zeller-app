/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One row of the models catalog.
 *
 * A model is identified by **either** a specific `config_hash` (legacy /
 * fast-path — every run with that hash is "this model") **or** a
 * `config_template` (partial filter on `RunMetadata.config_snapshot` that
 * every matching run must satisfy). At least one of the two is required.
 *
 * `config_template` lets a single name span multiple `config_hash` values
 * — e.g. `euler = { "sizer": { "kind": "scaled" } }` matches every
 * scaled-sizer config regardless of leverage / stop-loss / fee tier;
 * query params on `/api/v1/models/{name}/trades` then narrow further.
 */
export type ModelEntry = {
    /**
     * Lowercase 64-character hex of the 32-byte `config_hash` the strategy
     * is identified by in the persisted report index. Optional — entries
     * can identify their runs via `config_template` instead (or both).
     */
    config_hash?: string | null;
    /**
     * Partial filter applied against each report's
     * `RunMetadata.config_snapshot`. A run matches when every field
     * present in the template appears (with the same value) in the
     * snapshot. Optional — when absent, identification falls back to
     * `config_hash`.
     */
    config_template?: any;
    /**
     * Free-form description shown by the dashboard.
     */
    description?: string;
    /**
     * Human-readable model identifier (`"euler"`). Used as the URL key in
     * `/api/v1/models/{name}/...`.
     */
    name: string;
};

