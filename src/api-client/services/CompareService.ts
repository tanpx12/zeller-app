/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompareResponseDto } from '../models/CompareResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CompareService {
    /**
     * @returns CompareResponseDto ComparisonReport JSON
     * @throws ApiError
     */
    public static compareHandler({
        a,
        b,
    }: {
        /**
         * Baseline run_id
         */
        a: string,
        /**
         * Candidate run_id
         */
        b: string,
    }): CancelablePromise<CompareResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/compare',
            query: {
                'a': a,
                'b': b,
            },
            errors: {
                304: `Not Modified`,
                400: `Missing or empty a / b parameter`,
                404: `Either run_id is absent from the index`,
                409: `Periods do not overlap meaningfully (0%)`,
                503: `No report store attached`,
            },
        });
    }
}
