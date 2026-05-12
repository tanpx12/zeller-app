/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LiveRiskEvent } from './LiveRiskEvent';
/**
 * Response wrapper for [`get_risk_events`].
 */
export type LiveRiskEventsDto = {
    /**
     * Live risk-guard interventions, newest first.
     */
    data: Array<LiveRiskEvent>;
};

