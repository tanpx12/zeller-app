/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IndexedReportDto } from './IndexedReportDto';
import type { ReportFacetsDto } from './ReportFacetsDto';
/**
 * `/api/v1/reports` response envelope — `Paginated` plus a `facets` field.
 *
 * Field shape matches v1's `Paginated<IndexedReportDto>` so v1 clients
 * continue to deserialize correctly; `facets` is the only addition (v1.1).
 */
export type ListReportsResponse = {
    data: Array<IndexedReportDto>;
    facets: ReportFacetsDto;
    next_cursor?: string | null;
    total_count_estimate: number;
};

