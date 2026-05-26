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

