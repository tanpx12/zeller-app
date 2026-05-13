/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ComparisonVerdict } from './ComparisonVerdict';
import type { DmTestResult } from './DmTestResult';
import type { MetadataDiff } from './MetadataDiff';
import type { MetricDiff } from './MetricDiff';
import type { TimeSeries } from './TimeSeries';
/**
 * Pairwise diff of two [`PerformanceReport`]s.
 *
 * See module docs for the field semantics, the identity invariant, and
 * the period-overlap warning convention.
 */
export type ComparisonReport = {
    /**
     * Equity curves keyed `"a"` / `"b"`. Values are [`TimeSeries`] built
     * from `raw.equity` paired with `raw.timestamps_ms` (or bar indices
     * when timestamps are absent).
     */
    equity_overlay: Record<string, TimeSeries>;
    /**
     * One row per headline metric (`(name, a, b, delta, pct_change)`),
     * in a stable order documented on [`headline_metric_diffs`].
     */
    headline_diff: Array<MetricDiff>;
    /**
     * Side-by-side metadata snapshot.
     */
    meta_diff: MetadataDiff;
    /**
     * Bar-timestamp overlap as a percentage of the longer period.
     * `100.0` for two identical-period reports, `0.0` for fully disjoint
     * runs. Used by the markdown renderer's warning blockquote.
     */
    period_overlap_pct: number;
    significance?: (null | DmTestResult);
    /**
     * One-sentence verdict — the headline takeaway for git review.
     */
    verdict: ComparisonVerdict;
};

