/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReconciliationRecord } from './ReconciliationRecord';
/**
 * Response wrapper for [`get_reconciliation`].
 */
export type LiveReconciliationDto = {
    /**
     * Most recent reconciliation outcomes, newest first.
     */
    results: Array<ReconciliationRecord>;
};

