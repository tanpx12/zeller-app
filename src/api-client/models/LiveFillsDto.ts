/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Fill } from './Fill';
/**
 * Wrapper response for `/live/fills` — keeps room for future paging /
 * summary fields without a breaking change.
 */
export type LiveFillsDto = {
    fills: Array<Fill>;
};

