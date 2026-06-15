/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Adapter status snapshot for dashboard consumption.
 *
 * Persisted inside [`crate::state::EngineState`] each bar and surfaced on
 * `GET /api/v1/live/status` as the `adapter` field, so the dashboard's
 * adapter card reads real config instead of an empty-state fallback.
 */
export type AdapterStatus = {
    /**
     * Which adapter instance is authoritative.
     */
    authoritative_id: string;
    /**
     * Whether the adapter set is actively calibrating signals.
     */
    enabled: boolean;
    /**
     * Total number of adapter instances.
     */
    instance_count: number;
};

