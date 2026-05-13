/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One risk-guard intervention. Populated by the engine when the recorder
 * records guard provenance — currently always empty in
 * [`PerformanceReport::risk_events`] because the
 * [`crate::backtest::context::RunRecorder`] only stores the dollar gap.
 */
export type RiskEvent = {
    /**
     * The decision the guard returned.
     */
    action: any;
    /**
     * Free-form context string (e.g. `"DD = 18%, threshold = 15%"`).
     */
    context: string;
    /**
     * Guard name (`"LeverageCap"`, `"DrawdownStop"`, `"LiquidationModel"`,
     * …).
     */
    guard: string;
    /**
     * Bar timestamp at which the guard fired (UTC).
     */
    timestamp: string;
};

