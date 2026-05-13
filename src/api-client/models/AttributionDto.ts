/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CounterfactualsDto } from './CounterfactualsDto';
/**
 * `GET /api/v1/reports/:run_id/attribution` response shape — the
 * per-component PnL decomposition with `counterfactuals` nested as
 * per the API doc.
 */
export type AttributionDto = {
    /**
     * Cost ratio vs gross PnL when gross > 0; `NaN` otherwise.
     */
    costs_pct_of_gross: number;
    /**
     * Counterfactual Sharpe block (see [`CounterfactualsDto`]).
     */
    counterfactuals: CounterfactualsDto;
    /**
     * Sum of `holding_costs` — funding paid (positive) or received
     * (negative).
     */
    funding_pnl_usd: number;
    /**
     * Sum of price-only PnL across all bars (before any costs).
     */
    gross_pnl_usd: number;
    /**
     * Net PnL = gross − trade_costs − funding.
     */
    net_pnl_usd: number;
    /**
     * Slippage. Currently bundled into `trade_costs_usd`; emitted
     * explicitly as `0.0` so renderers don't drift.
     */
    slippage_usd: number;
    /**
     * Sum of `trade_costs`. Reported as a **negative** number
     * (consistent with the convention that costs reduce equity).
     */
    trade_costs_usd: number;
};

