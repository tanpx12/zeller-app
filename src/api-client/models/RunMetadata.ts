/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RunMode } from './RunMode';
/**
 * Identity of "what produced this report" — a [`config_hash`,
 * `model_hash`, `git_sha`] triple plus the run period.
 *
 * Two reports with matching `(config_hash, model_hash, git_sha)` should
 * produce identical metrics — the reproducibility invariant from Phase 5.
 *
 * `run_id` is a stable identifier (in production, a ULID); we ship it as
 * a `String` here and document that callers supply the ID. The Step-20
 * report store will introduce ULID generation; we deliberately don't
 * take a ULID dependency yet.
 *
 * [`config_hash`]: RunMetadata::config_hash
 * [`model_hash`]: RunMetadata::model_hash
 * [`git_sha`]: RunMetadata::git_sha
 */
export type RunMetadata = {
    /**
     * Asset symbol (e.g. `"BTC"`).
     */
    asset: string;
    /**
     * Hash of the [`crate::backtest::BacktestConfig`] that produced this
     * run.
     */
    config_hash: Array<number>;
    /**
     * Wall-clock time the report was generated.
     */
    generated_at: string;
    /**
     * Git SHA of the code that produced the run, when available.
     */
    git_sha?: string | null;
    /**
     * Bar interval (e.g. `"1h"`).
     */
    interval: string;
    /**
     * Run mode (batch / holdout / live / reconciliation).
     */
    mode: RunMode;
    /**
     * Hash of the model artifact (LightGBM booster bytes, weights, …).
     */
    model_hash: Array<number>;
    /**
     * `(start, end)` UTC timestamps of the first and last bar covered by
     * the run.
     */
    period: Array<string>;
    /**
     * Stable identifier for the run. Format is caller-defined; the Step
     * 20 report store will generate ULIDs.
     */
    run_id: string;
};

