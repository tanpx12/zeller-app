/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Counterfactual Sharpe block — what the strategy would have produced
 * under different cost regimes. Mirrors the API doc's
 * `attribution.counterfactuals` shape.
 */
export type CounterfactualsDto = {
    /**
     * Sharpe from the actual run (echoed from `headline.sharpe.value`
     * for one-shot comparison without a second fetch).
     */
    actual_sharpe: number;
    /**
     * Sharpe under `ZeroCosts` — the unrealistic upper bound where
     * trade fees + slippage don't accrue.
     */
    zero_costs_sharpe: number;
    /**
     * Sharpe with funding disabled. Useful when funding swings
     * dominate the PnL attribution.
     */
    zero_funding_sharpe: number;
};

