/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Adapter diagnostics attached to a performance report when the
 * online signal adapter is active.
 */
export type AdapterReport = {
    /**
     * Per-bar α trajectory (intercept).
     */
    alpha_trajectory: Array<number>;
    /**
     * Which adapter instance was authoritative for this run.
     */
    authoritative_id: string;
    /**
     * Per-bar β trajectory (slope / signal trust).
     */
    beta_trajectory: Array<number>;
    /**
     * Number of stale predictions dropped (data-gap indicator).
     */
    dropped_stale: number;
    /**
     * Per-bar EWMA IC trajectory (L0 health metric).
     */
    ewma_ic_trajectory: Array<number>;
    /**
     * Final α at end of run.
     */
    final_alpha: number;
    /**
     * Final β at end of run.
     */
    final_beta: number;
    /**
     * Final β posterior stdev (regime-transition indicator).
     */
    final_beta_stdev: number;
    /**
     * Final adaptive observation noise estimate.
     */
    final_r_hat: number;
};

