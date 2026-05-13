/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Side-by-side performance summary (live last-window vs holdout) used in
 * the report's "Performance summary" table.
 */
export type PerformanceSummary = {
    /**
     * Holdout sign-accuracy at the time of the last train.
     */
    holdout_hit_rate: number;
    /**
     * Holdout forward IC at the time of the last train.
     */
    holdout_ic: number;
    /**
     * Holdout annualised Sharpe at the time of the last train.
     */
    holdout_sharpe: number;
    /**
     * Live drawdown from peak as a fraction (0.05 = 5%).
     */
    live_drawdown_pct: number;
    /**
     * Live sign-accuracy (hit rate) over the analysed window.
     */
    live_hit_rate: number;
    /**
     * Live forward IC over the analysed window (Spearman ρ).
     */
    live_ic: number;
    /**
     * Live annualised Sharpe over the analysed window.
     */
    live_sharpe: number;
};

