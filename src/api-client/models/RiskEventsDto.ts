/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RiskEvent } from './RiskEvent';
/**
 * Wrapper response for the risk-events endpoint.
 *
 * Wrapping the array in `{ events: [...] }` rather than emitting a bare
 * JSON array gives the dashboard room to evolve the shape (paging,
 * summary counts) without a breaking change.
 */
export type RiskEventsDto = {
    events: Array<RiskEvent>;
};

