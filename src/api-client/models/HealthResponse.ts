/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response body for `GET /api/v1/health`. Fields:
 * - `version`: perps_model crate version (matches `cargo pkgid` output).
 * - `uptime_secs`: seconds since the api process started.
 * - `started_at_ms`: process start time as a unix epoch millisecond timestamp,
 * stable across the lifetime of the process so dashboards can detect
 * restarts without polling another endpoint.
 */
export type HealthResponse = {
    started_at_ms: number;
    uptime_secs: number;
    version: string;
};

