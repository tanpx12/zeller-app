/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TradeDto } from './TradeDto';
import type { TradesSummaryDto } from './TradesSummaryDto';
/**
 * Response wrapper for `GET /api/v1/reports/:run_id/trades` — the
 * page-wide `summary` block sits alongside `data` and the cursor.
 */
export type TradesPageDto = {
    /**
     * One page of enriched trades.
     */
    data: Array<TradeDto>;
    /**
     * Cursor to fetch the next page; `None` on the final page.
     */
    next_cursor?: string | null;
    /**
     * Run-wide trades summary (same on every page — useful for KPIs).
     */
    summary: TradesSummaryDto;
    /**
     * Approximate total trade count for the report.
     */
    total_count_estimate: number;
};

