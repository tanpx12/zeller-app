/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdapterReport } from './AdapterReport';
import type { AttributionSection } from './AttributionSection';
import type { BaselineComparison } from './BaselineComparison';
import type { ForecastSection } from './ForecastSection';
import type { HeadlineSection } from './HeadlineSection';
import type { RawSeries } from './RawSeries';
import type { RiskEvent } from './RiskEvent';
import type { RiskSection } from './RiskSection';
import type { RunMetadata } from './RunMetadata';
import type { TimeAnalysisSection } from './TimeAnalysisSection';
import type { TradesSection } from './TradesSection';
/**
 * Top-level report. One canonical structure for every run mode; each
 * renderer is a presentation specialisation.
 */
export type PerformanceReport = {
    adapter?: (null | AdapterReport);
    /**
     * PnL attribution + counterfactual Sharpe with costs / funding zeroed.
     */
    attribution: AttributionSection;
    /**
     * Baseline comparison; populated by Step 11+ once baselines exist.
     * Currently always [`BaselineComparison::empty`] from the builder.
     */
    baselines: BaselineComparison;
    /**
     * Forecast quality — model quality, not strategy quality.
     */
    forecast: ForecastSection;
    /**
     * Headline summary — the at-a-glance "did it work?" view.
     */
    headline: HeadlineSection;
    /**
     * Identity of the run that produced the report.
     */
    meta: RunMetadata;
    /**
     * Raw parallel vectors mirroring the recorder, for renderers that
     * want to draw charts directly from the raw lanes.
     */
    raw: RawSeries;
    /**
     * Risk-officer view — drawdown profile, rolling Sharpe, distribution.
     */
    risk: RiskSection;
    /**
     * Every time a `RiskGuard` intervened. Populated when the engine
     * records guard provenance — currently always empty (the recorder
     * stores the dollar gap but not the guard reason; see
     * [`crate::backtest::context::RunRecorder::risk_adjustments`]).
     */
    risk_events: Array<RiskEvent>;
    /**
     * Time-of-day / day-of-week pattern analysis.
     */
    time_analysis: TimeAnalysisSection;
    /**
     * Trade-level analysis — round-trip trades, PnL distribution.
     */
    trades: TradesSection;
};

