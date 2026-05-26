/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ModelListResponse } from '../models/ModelListResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ModelsService {
    /**
     * List every trained model known to the system.
     * @returns ModelListResponse Trained model inventory
     * @throws ApiError
     */
    public static listModels(): CancelablePromise<ModelListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/models',
        });
    }
}
