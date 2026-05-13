/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DecisionListResponse } from '../models/DecisionListResponse';
import type { DecisionReport } from '../models/DecisionReport';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DecisionsService {
    /**
     * `GET /api/v1/decisions` — every persisted decision report,
     * newest-first.
     * @returns DecisionListResponse Decision report summaries
     * @throws ApiError
     */
    public static listDecisions(): CancelablePromise<DecisionListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/decisions',
            errors: {
                503: `No report store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/decisions/:date` — full `DecisionReport` JSON. `date`
     * must be `YYYY-MM-DD` (UTC); other formats yield 400.
     * @returns DecisionReport Full DecisionReport
     * @throws ApiError
     */
    public static getDecision({
        date,
    }: {
        /**
         * YYYY-MM-DD
         */
        date: string,
    }): CancelablePromise<DecisionReport> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/decisions/{date}',
            path: {
                'date': date,
            },
            errors: {
                400: `Malformed date`,
                404: `No decision report for this date`,
                503: `No report store attached`,
            },
        });
    }
    /**
     * `GET /api/v1/triggers/current` — trigger evaluation as-of the latest
     * live data.
     * **Deferred wiring**: producing this response requires inputs the api
     * process does not yet load — training feature distributions (which
     * live alongside the model artifact) and the holdout reference metrics
     * (`holdout_ic` / `_n` / `_sharpe` / `_hit_rate`) that
     * [`crate::evaluator::RetrainEvaluator::standard`] needs. Wiring those
     * through is a Phase 9 follow-on (the `evaluate` binary is still a
     * stub today). Until then this endpoint always returns 503 with a
     * pointer to the unblocked path; clients should poll `/decisions` for
     * snapshot-time triggers and use `/triggers/current` only once the
     * evaluator binary lands.
     * @returns void
     * @throws ApiError
     */
    public static currentTriggers(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/triggers/current',
            errors: {
                503: `Evaluator wiring deferred — see body for details`,
            },
        });
    }
}
