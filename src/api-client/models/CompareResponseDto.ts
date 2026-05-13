/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ComparisonReport } from './ComparisonReport';
import type { ReturnDistributionOverlayDto } from './ReturnDistributionOverlayDto';
/**
 * `/api/v1/compare` response envelope. Spec line 213-226 calls for a
 * `return_distribution_overlay` field alongside the existing
 * `ComparisonReport`; rather than widen `ComparisonReport` (which is
 * shared by the CLI's `report compare` command), we wrap it here so the
 * engine type stays focused on the diff itself.
 */
export type CompareResponseDto = (ComparisonReport & {
    return_distribution_overlay: ReturnDistributionOverlayDto;
});

