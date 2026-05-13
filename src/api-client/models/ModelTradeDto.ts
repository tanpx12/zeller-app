/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TradeDto } from './TradeDto';
/**
 * One trade enriched with `run_id` + `mode` so a flat dashboard table
 * can show which run a trade came from. Wraps [`TradeDto`] (the
 * persisted-run trade shape) with the two extra context fields.
 */
export type ModelTradeDto = (TradeDto & {
    /**
     * Lowercase mode string (`"batch"` / `"holdout"` / …).
     */
    mode: string;
    /**
     * `run_id` of the report the trade was extracted from.
     */
    run_id: string;
});

