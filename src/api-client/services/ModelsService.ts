/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ModelListResponse } from '../models/ModelListResponse';
import type { ModelTradesResponse } from '../models/ModelTradesResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ModelsService {
    /**
     * @returns ModelListResponse Catalog of named models with run counts
     * @throws ApiError
     */
    public static listModels(): CancelablePromise<ModelListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/models',
            errors: {
                503: `No report store attached`,
            },
        });
    }
    /**
     * @returns ModelTradesResponse Aggregated trades across runs matching the resolved filter
     * @throws ApiError
     */
    public static getModelTrades({
        name,
        mode,
        sizer,
        leverage,
        sl,
        limit,
        cursor,
    }: {
        /**
         * Catalog model name (e.g. "euler")
         */
        name: string,
        /**
         * batch | holdout | live | reconciliation
         */
        mode?: string,
        /**
         * Filter by config_snapshot.sizer.kind (scaled, fixed, ...)
         */
        sizer?: string,
        /**
         * Filter by leverage — matches any of max/target/base
         */
        leverage?: number,
        /**
         * Filter by config_snapshot.risk.stop_loss_pct (fraction)
         */
        sl?: number,
        /**
         * Page size — default 200, max 1000
         */
        limit?: number,
        /**
         * Opaque cursor from a prior response
         */
        cursor?: string,
    }): CancelablePromise<ModelTradesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/models/{name}/trades',
            path: {
                'name': name,
            },
            query: {
                'mode': mode,
                'sizer': sizer,
                'leverage': leverage,
                'sl': sl,
                'limit': limit,
                'cursor': cursor,
            },
            errors: {
                400: `Malformed mode filter or cursor`,
                404: `Unknown model name`,
                503: `No report store attached`,
            },
        });
    }
}
