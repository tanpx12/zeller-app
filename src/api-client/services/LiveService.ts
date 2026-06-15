/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LiveFillsDto } from '../models/LiveFillsDto';
import type { LiveModelsDto } from '../models/LiveModelsDto';
import type { LiveReconciliationDto } from '../models/LiveReconciliationDto';
import type { LiveRiskEventsDto } from '../models/LiveRiskEventsDto';
import type { LiveStatusDto } from '../models/LiveStatusDto';
import type { TimeSeriesEnvelope } from '../models/TimeSeriesEnvelope';
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
     * @returns TimeSeriesEnvelope Live equity time series envelope
     * @throws ApiError
     */
    public static getEquity({
        since,
    }: {
        /**
         * Inclusive lower bound on snapshot timestamp (unix ms)
         */
        since?: number,
    }): CancelablePromise<TimeSeriesEnvelope> {
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
     * @returns LiveFillsDto Live fills envelope
     * @throws ApiError
     */
    public static getFills({
        since,
    }: {
        /**
         * Inclusive lower bound on fill timestamp (unix ms)
         */
        since?: number,
    }): CancelablePromise<LiveFillsDto> {
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
     * `GET /api/v1/live/models` — list the configured per-model stores.
     * @returns LiveModelsDto Configured live model names
     * @throws ApiError
     */
    public static getLiveModels(): CancelablePromise<LiveModelsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/models',
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
     * @returns LiveStatusDto Live status snapshot
     * @throws ApiError
     */
    public static getStatus(): CancelablePromise<LiveStatusDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/status',
            errors: {
                503: `No state store attached or no snapshot recorded yet. A stale snapshot returns 200 with is_stale=true, not 503.`,
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
    /**
     * `GET /api/v1/live/{model}/equity` — per-model live equity series.
     * @returns TimeSeriesEnvelope Live equity time series envelope
     * @throws ApiError
     */
    public static getModelEquity({
        model,
        since,
    }: {
        /**
         * Configured model name
         */
        model: string,
        /**
         * Inclusive lower bound on snapshot timestamp (unix ms)
         */
        since?: number,
    }): CancelablePromise<TimeSeriesEnvelope> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/{model}/equity',
            path: {
                'model': model,
            },
            query: {
                'since': since,
            },
            errors: {
                404: `Unknown model name`,
            },
        });
    }
    /**
     * `GET /api/v1/live/{model}/fills` — per-model live fills.
     * @returns LiveFillsDto Live fills envelope
     * @throws ApiError
     */
    public static getModelFills({
        model,
        since,
    }: {
        /**
         * Configured model name
         */
        model: string,
        /**
         * Inclusive lower bound on fill timestamp (unix ms)
         */
        since?: number,
    }): CancelablePromise<LiveFillsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/{model}/fills',
            path: {
                'model': model,
            },
            query: {
                'since': since,
            },
            errors: {
                404: `Unknown model name`,
            },
        });
    }
    /**
     * `GET /api/v1/live/{model}/reconciliation` — per-model reconciliation.
     * @returns LiveReconciliationDto Recent reconciliation outcomes
     * @throws ApiError
     */
    public static getModelReconciliation({
        model,
        limit,
    }: {
        /**
         * Configured model name
         */
        model: string,
        /**
         * Number of recent outcomes to return. Default 10, max 100.
         */
        limit?: number | null,
    }): CancelablePromise<LiveReconciliationDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/{model}/reconciliation',
            path: {
                'model': model,
            },
            query: {
                'limit': limit,
            },
            errors: {
                404: `Unknown model name`,
            },
        });
    }
    /**
     * `GET /api/v1/live/{model}/risk_events` — per-model risk events.
     * @returns LiveRiskEventsDto Most recent live risk events
     * @throws ApiError
     */
    public static getModelRiskEvents({
        model,
        since,
        limit,
    }: {
        /**
         * Configured model name
         */
        model: string,
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
            url: '/api/v1/live/{model}/risk_events',
            path: {
                'model': model,
            },
            query: {
                'since': since,
                'limit': limit,
            },
            errors: {
                404: `Unknown model name`,
            },
        });
    }
    /**
     * `GET /api/v1/live/{model}/status` — per-model live status.
     * @returns LiveStatusDto Live status snapshot
     * @throws ApiError
     */
    public static getModelStatus({
        model,
    }: {
        /**
         * Configured model name (see /live/models)
         */
        model: string,
    }): CancelablePromise<LiveStatusDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/live/{model}/status',
            path: {
                'model': model,
            },
            errors: {
                404: `Unknown model name`,
                503: `No snapshot recorded yet. A stale snapshot returns 200 with is_stale=true, not 503.`,
            },
        });
    }
}
