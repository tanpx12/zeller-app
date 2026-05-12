/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LiveReconciliationDto } from '../models/LiveReconciliationDto';
import type { LiveRiskEventsDto } from '../models/LiveRiskEventsDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LiveService {
    /**
     * `GET /api/v1/live/equity?since=<unix_ms>` — live equity time series.
     * Pulls one point per persisted snapshot. Unlike the report `/equity`
     * endpoint (Wave A2c), this one is sourced from the live state store
     * rather than `report.raw.equity`; downsampling is intentionally not
     * supported here because live snapshot frequency = bar frequency, and
     * the dashboard typically wants the verbatim sequence.
     * @returns any Live equity time series envelope
     * @throws ApiError
     */
    public static getEquity({
        since,
    }: {
        /**
         * Inclusive lower bound on snapshot timestamp (unix ms)
         */
        since?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/equity',
            query: {
                'since': since,
            },
            errors: {
                503: `No state store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/live/fills?since=<unix_ms>` — live fills since timestamp.
     * @returns any Live fills envelope
     * @throws ApiError
     */
    public static getFills({
        since,
    }: {
        /**
         * Inclusive lower bound on fill timestamp (unix ms)
         */
        since?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/fills',
            query: {
                'since': since,
            },
            errors: {
                503: `No state store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/live/reconciliation` — list recent live-vs-batch
     * reconciliation results from the live runner.
     * Returns 503 when no state store is attached.
     * @returns LiveReconciliationDto Recent reconciliation outcomes
     * @throws ApiError
     */
    public static getReconciliation({
        limit,
    }: {
        /**
         * Number of recent outcomes to return. Default 10, max 100.
         */
        limit?: number | null,
    }): CancelablePromise<LiveReconciliationDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/reconciliation',
            query: {
                'limit': limit,
            },
            errors: {
                503: `State store not attached`,
            },
        });
    }
    /**
     * `GET /api/v1/live/risk_events` — list recent risk-guard interventions
     * in the live runner. Returns newest first.
     * Returns 503 when no state store is attached (i.e. `serve` was started
     * without `--state-store`).
     * @returns LiveRiskEventsDto Most recent live risk events
     * @throws ApiError
     */
    public static getRiskEvents({
        since,
        limit,
    }: {
        /**
         * Filter to events with `timestamp_ms >= since`. When unset, returns
         * the most recent events regardless of age.
         */
        since?: number | null,
        /**
         * Cap on number of events returned. Default 100, max 500.
         */
        limit?: number | null,
    }): CancelablePromise<LiveRiskEventsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/risk_events',
            query: {
                'since': since,
                'limit': limit,
            },
            errors: {
                503: `State store not attached or live runner unavailable`,
            },
        });
    }
    /**
     * `GET /api/v1/live/status` — current equity, position, last forecast.
     * @returns any Live status snapshot
     * @throws ApiError
     */
    public static getStatus(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/status',
            errors: {
                503: `No state store attached, no snapshot recorded yet, or last write > 2 minutes ago`,
            },
        });
    }
    /**
     * @returns void
     * @throws ApiError
     */
    public static liveStream(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/stream',
            errors: {
                503: `No broadcaster attached, or simultaneous WebSocket client cap reached`,
            },
        });
    }
}
