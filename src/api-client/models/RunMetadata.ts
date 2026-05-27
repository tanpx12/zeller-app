/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Lineage } from './Lineage';
import type { WireMode } from './WireMode';
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
     * Self-describing snapshot of the `BacktestConfig` that produced
     * this run. Captured at write time by `train` / `backtest` /
     * `paper_trade` so dashboards can render the real parameter values
     * (sizer kind, leverage cap, stop-loss pct, fee tier, …) instead of
     * just the opaque `config_hash`.
     *
     * Stored as `serde_json::Value` rather than a typed
     * `BacktestConfig` so the schema can evolve without touching every
     * historical archive: tomorrow's binary can add fields, today's
     * reader still parses old reports as long as they're valid JSON.
     *
     * `None` for historical reports written before this field landed.
     * Defaults to `None` on deserialise so older archives parse cleanly.
     */
    config_snapshot?: any;
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
    lineage?: (null | Lineage);
    /**
     * Run mode. The internal Rust enum has four variants (`Batch`,
     * `Holdout`, `Live`, `Reconciliation`), but the API surface
     * emits the three-mode lifecycle vocabulary
     * (`backtest`/`paper_trade`/`reconciliation`) via
     * [`crate::api::wire_mode::WireMode`]. Persisted archives keep
     * the PascalCase Rust serialization; the API rewrites it on
     * the way out.
     */
    mode: WireMode;
    /**
     * Hash of the model artifact (LightGBM booster bytes, weights, …).
     */
    model_hash: Array<number>;
    /**
     * Human-readable model name (`"euler"`, `"gauss"`, `"laplace"`).
     *
     * `None` for reports written before this field landed.
     */
    model_name?: string | null;
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

