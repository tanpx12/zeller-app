/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One row of `GET /api/v1/models`.
 */
export type ModelTypeEntry = {
    /**
     * Model architecture.
     */
    architecture: string;
    /**
     * Lowercase hex (64 chars) of the `BacktestConfig` hash used by
     * this model's canonical runs. `null` until a run has been persisted.
     */
    config_hash?: string | null;
    /**
     * Brief description of the model's character.
     */
    description: string;
    /**
     * Short stable identifier used as the URL key.
     */
    id: string;
    /**
     * Number of input features.
     */
    n_features: number;
    /**
     * Human-readable name.
     */
    name: string;
    /**
     * LightGBM num_leaves.
     */
    num_leaves: number;
    /**
     * Optimal stop loss (fraction) from holdout sweep.
     */
    stop_loss_pct: number;
    /**
     * Optimal signal threshold from holdout sweep.
     */
    threshold: number;
};

