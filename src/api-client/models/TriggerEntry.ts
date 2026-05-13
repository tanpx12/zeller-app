/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TriggerOutcome } from './TriggerOutcome';
/**
 * One trigger's outcome alongside its stable name (so renderers can group
 * without `Debug`-printing the underlying impl).
 */
export type TriggerEntry = {
    /**
     * Stable trigger name as returned by `RetrainTrigger::name()`.
     */
    name: string;
    /**
     * The outcome — `NoFire` / `SoftFire` / `HardFire` with metric details.
     */
    outcome: TriggerOutcome;
};

