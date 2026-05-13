/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Result of the Diebold-Mariano test.
 *
 * Any of `dm_stat` or `p_value` may be `NaN` when the test cannot be computed
 * (length mismatch, `n < 2`, zero/negative long-run variance). See the
 * individual function docs for details.
 *
 * `serde::{Serialize, Deserialize}` are derived so the Step 19 report layer
 * can embed `DmTestResult` inside `report::BaselineComparison` (the
 * model-vs-momentum DM test field is rendered to JSON as part of the
 * canonical `PerformanceReport`).
 */
export type DmTestResult = {
    /**
     * Newey-West Bartlett-window bandwidth `q` used for the long-run variance.
     */
    bandwidth: number;
    /**
     * The DM statistic. `NaN` when the test cannot be computed.
     */
    dm_stat: number;
    /**
     * Sample mean of the loss differential `d[t] = e1[t]^2 - e2[t]^2`. `NaN` if
     * inputs had mismatched lengths or `n == 0`.
     */
    mean_loss_differential: number;
    /**
     * Number of paired observations used. `0` if the inputs had mismatched lengths.
     */
    'n': number;
    /**
     * Two-sided p-value under the asymptotic standard-normal null. `NaN` when
     * `dm_stat` is `NaN`.
     */
    p_value: number;
};

