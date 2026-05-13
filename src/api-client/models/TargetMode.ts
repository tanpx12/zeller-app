/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Run kind a `DecisionReport` was evaluated against — three-mode
 * lifecycle vocabulary. Only `paper_trade` is achievable today;
 * `real_live_trade` is gated on the future `live_trading` crate but
 * already a valid wire value so dashboards can prepare for it.
 *
 * Serializes as snake_case (`"paper_trade"` / `"real_live_trade"`).
 */
export type TargetMode = 'paper_trade' | 'real_live_trade';
