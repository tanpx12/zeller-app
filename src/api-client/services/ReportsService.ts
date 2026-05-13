/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttributionDto } from '../models/AttributionDto';
import type { DrawdownDto } from '../models/DrawdownDto';
import type { ForecastDto } from '../models/ForecastDto';
import type { HeadlineSection } from '../models/HeadlineSection';
import type { ListReportsResponse } from '../models/ListReportsResponse';
import type { PerformanceReport } from '../models/PerformanceReport';
import type { ReportSearchResponse } from '../models/ReportSearchResponse';
import type { RiskEventsDto } from '../models/RiskEventsDto';
import type { TimeAnalysisSection } from '../models/TimeAnalysisSection';
import type { TimeSeriesEnvelope } from '../models/TimeSeriesEnvelope';
import type { TradesPageDto } from '../models/TradesPageDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportsService {
    /**
     * @returns ListReportsResponse Paginated list of indexed reports
     * @throws ApiError
     */
    public static listReports({
        mode,
        asset,
        since,
        until,
        minSharpe,
        maxDrawdownPct,
        limit,
        cursor,
    }: {
        /**
         * batch | holdout | live | reconciliation
         */
        mode?: string,
        /**
         * Exact-match asset symbol (e.g. BTC)
         */
        asset?: string,
        /**
         * Inclusive lower bound on period_start (YYYY-MM-DD UTC or unix ms)
         */
        since?: string,
        /**
         * Inclusive upper bound on period_start (YYYY-MM-DD UTC or unix ms)
         */
        until?: string,
        /**
         * Inclusive lower bound on headline Sharpe (excludes NaN rows)
         */
        minSharpe?: number,
        /**
         * Inclusive upper bound on max drawdown (fraction)
         */
        maxDrawdownPct?: number,
        /**
         * Page size — default 50, capped at 500
         */
        limit?: number,
        /**
         * Opaque cursor from a prior response
         */
        cursor?: string,
    }): CancelablePromise<ListReportsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports',
            query: {
                'mode': mode,
                'asset': asset,
                'since': since,
                'until': until,
                'min_sharpe': minSharpe,
                'max_drawdown_pct': maxDrawdownPct,
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                400: `Malformed query parameter`,
                503: `Server started without --reports-root; no store attached`,
            },
        });
    }
    /**
     * @returns ReportSearchResponse Lightweight hits with server-composed label
     * @throws ApiError
     */
    public static searchReports({
        q,
        mode,
        limit,
    }: {
        /**
         * Free-text query — matches run_id prefix, asset, mode
         */
        q?: string,
        /**
         * batch | holdout | live | reconciliation
         */
        mode?: string,
        /**
         * 1-50, default 10
         */
        limit?: number,
    }): CancelablePromise<ReportSearchResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/search',
            query: {
                'q': q,
                'mode': mode,
                'limit': limit,
            },
            errors: {
                400: `Malformed mode filter`,
                503: `Server started without --reports-root; no store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/reports/:run_id` — full canonical PerformanceReport JSON.
     * @returns PerformanceReport Canonical PerformanceReport
     * @throws ApiError
     */
    public static getReport({
        runId,
    }: {
        /**
         * Stable run identifier
         */
        runId: string,
    }): CancelablePromise<PerformanceReport> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/{run_id}',
            path: {
                'run_id': runId,
            },
            errors: {
                304: `Not Modified — If-None-Match matched the current ETag`,
                404: `No report indexed for this run_id`,
                503: `Server started without --reports-root`,
            },
        });
    }
    /**
     * `GET /api/v1/reports/:run_id/attribution` — PnL decomposition + counterfactuals.
     * @returns AttributionDto Attribution section
     * @throws ApiError
     */
    public static getAttribution({
        runId,
    }: {
        /**
         * Stable run identifier
         */
        runId: string,
    }): CancelablePromise<AttributionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/{run_id}/attribution',
            path: {
                'run_id': runId,
            },
            errors: {
                304: `Not Modified`,
                404: `Unknown run_id`,
                503: `No report store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/reports/:run_id/drawdown` — drawdown / underwater series + summary.
     * @returns DrawdownDto Drawdown projection
     * @throws ApiError
     */
    public static getDrawdown({
        runId,
    }: {
        /**
         * Stable run identifier
         */
        runId: string,
    }): CancelablePromise<DrawdownDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/{run_id}/drawdown',
            path: {
                'run_id': runId,
            },
            errors: {
                304: `Not Modified`,
                404: `Unknown run_id`,
                503: `No report store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/reports/:run_id/equity` — equity time series.
     * Source: `report.raw.equity[1..]` aligned with `report.raw.timestamps_ms`
     * (the initial pre-trading equity at `equity[0]` is excluded — the
     * dashboard can pull it from `headline.initial_equity` if it cares about
     * the t=0 anchor). Filtering applies before downsampling so the bucket
     * boundaries are computed against the visible window.
     * @returns TimeSeriesEnvelope Equity time series envelope
     * @throws ApiError
     */
    public static getEquity({
        runId,
        downsample,
        since,
        until,
    }: {
        /**
         * Stable run identifier
         */
        runId: string,
        /**
         * none | hourly | daily (default none)
         */
        downsample?: string,
        /**
         * Inclusive lower bound on bar timestamp (unix ms)
         */
        since?: number,
        /**
         * Inclusive upper bound on bar timestamp (unix ms)
         */
        until?: number,
    }): CancelablePromise<TimeSeriesEnvelope> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/{run_id}/equity',
            path: {
                'run_id': runId,
            },
            query: {
                'downsample': downsample,
                'since': since,
                'until': until,
            },
            errors: {
                304: `Not Modified`,
                400: `Unknown downsample value`,
                404: `Unknown run_id`,
                503: `No report store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/reports/:run_id/forecast` — model-quality view (IC / calibration).
     * @returns ForecastDto Forecast section
     * @throws ApiError
     */
    public static getForecast({
        runId,
    }: {
        /**
         * Stable run identifier
         */
        runId: string,
    }): CancelablePromise<ForecastDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/{run_id}/forecast',
            path: {
                'run_id': runId,
            },
            errors: {
                304: `Not Modified`,
                404: `Unknown run_id`,
                503: `No report store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/reports/:run_id/headline` — at-a-glance summary only.
     * @returns HeadlineSection Headline section
     * @throws ApiError
     */
    public static getHeadline({
        runId,
    }: {
        /**
         * Stable run identifier
         */
        runId: string,
    }): CancelablePromise<HeadlineSection> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/{run_id}/headline',
            path: {
                'run_id': runId,
            },
            errors: {
                304: `Not Modified`,
                404: `Unknown run_id`,
                503: `No report store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/reports/:run_id/risk_events` — every `RiskGuard` intervention.
     * @returns RiskEventsDto Risk-event list
     * @throws ApiError
     */
    public static getRiskEvents({
        runId,
    }: {
        /**
         * Stable run identifier
         */
        runId: string,
    }): CancelablePromise<RiskEventsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/{run_id}/risk_events',
            path: {
                'run_id': runId,
            },
            errors: {
                304: `Not Modified`,
                404: `Unknown run_id`,
                503: `No report store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/reports/:run_id/time_analysis` — hour-of-day / day-of-week patterns.
     * @returns TimeAnalysisSection Time-of-day / day-of-week analysis section
     * @throws ApiError
     */
    public static getTimeAnalysis({
        runId,
    }: {
        /**
         * Stable run identifier
         */
        runId: string,
    }): CancelablePromise<TimeAnalysisSection> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/{run_id}/time_analysis',
            path: {
                'run_id': runId,
            },
            errors: {
                304: `Not Modified`,
                404: `Unknown run_id`,
                503: `No report store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/reports/:run_id/trades` — paginated round-trip trade list.
     * Source: `report.trades.trades` (already chronological per
     * [`crate::report::trades::extract_trades`]). Pagination uses the trade
     * index within the report as a stable cursor — each page returns the
     * next `limit` trades after the cursor index.
     *
     * Unlike the per-report projection endpoints (`/headline`, `/equity`, …),
     * this endpoint does *not* emit ETag / Cache-Control: a paginated
     * response varies by `?cursor=` and would need a per-page ETag to be
     * cacheable correctly. Match the precedent set by `list_reports`.
     * @returns TradesPageDto Paginated trade list
     * @throws ApiError
     */
    public static getTrades({
        runId,
        limit,
        cursor,
    }: {
        /**
         * Stable run identifier
         */
        runId: string,
        /**
         * Page size — default 50, capped at 500
         */
        limit?: number,
        /**
         * Opaque cursor from a prior response
         */
        cursor?: string,
    }): CancelablePromise<TradesPageDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/{run_id}/trades',
            path: {
                'run_id': runId,
            },
            query: {
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                400: `Malformed cursor`,
                404: `Unknown run_id`,
                503: `No report store attached`,
            },
        });
    }
}
