/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * PnL attribution + counterfactual Sharpe ratios.
 */
export type AttributionSection = {
    /**
     * `|trade_costs_usd + funding_pnl_usd_loss| / gross_pnl_usd` when
     * `gross_pnl_usd > 0`. `f64::NAN` when gross PnL is non-positive
     * (the ratio is undefined / non-monotonic).
     */
    costs_pct_of_gross: number;
    /**
     * Counterfactual annualised Sharpe with `trade_costs == 0`.
     * Reconstructed as `equity_curve + cumulative trade_costs` then re-run
     * through [`crate::metrics::backtest::sharpe`].
     */
    counterfactual_zero_costs_sharpe: number;
    /**
     * Counterfactual annualised Sharpe with `holding_costs == 0`.
     * Reconstructed as `equity_curve + cumulative holding_costs` then
     * re-run through [`crate::metrics::backtest::sharpe`].
     */
    counterfactual_zero_funding_sharpe: number;
    /**
     * Sum of `recorder.holding_costs`; signed per the engine convention
     * (longs paying funding is positive ⇒ the field is positive when
     * strategy was net paying funding, negative when net receiving).
     */
    funding_pnl_usd: number;
    /**
     * Sum of `prev_fill.notional * (fill.price/prev_fill.price - 1)` over
     * all bars before costs are subtracted. The builder reconstructs this
     * from `equity_change + trade_costs + holding_costs`.
     */
    gross_pnl_usd: number;
    /**
     * Sum of per-bar equity changes; equals `terminal_equity -
     * initial_equity`.
     */
    net_pnl_usd: number;
    /**
     * Slippage estimate. The current cost model bundles slippage into the
     * trade cost so this field is `0.0` until the cost layer separates
     * the two — documented and emitted explicitly so renderers don't
     * drift.
     */
    slippage_usd: number;
    /**
     * Sum of `recorder.trade_costs`; reported as a **negative** number for
     * renderer consistency (a cost reduces equity).
     */
    trade_costs_usd: number;
};

