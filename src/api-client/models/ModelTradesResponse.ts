/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ModelTradeDto } from './ModelTradeDto';
export type ModelTradesResponse = {
    /**
     * One page of aggregated trades, newest run first, chronological
     * within each run.
     */
    data: Array<ModelTradeDto>;
    /**
     * Cursor for the next page. `None` on the final page.
     */
    next_cursor?: string | null;
    /**
     * Approximate total number of trades across every matching run.
     */
    total_count_estimate: number;
};

