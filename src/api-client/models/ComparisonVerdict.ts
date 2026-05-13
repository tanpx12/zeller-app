/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * One-sentence verdict for a comparison.
 *
 * Consumers (markdown renderer, JSON wire format) use the variant tag
 * directly so the verdict survives serde round-trips. See the
 * module-level "Verdict heuristic" section for how the variants are
 * chosen.
 */
export type ComparisonVerdict = ({
    /**
     * `b` strictly improves on `a` and the DM test rejected the null.
     */
    BImproves: {
        /**
         * DM p-value (always populated for this variant — `< 0.05`).
         */
        dm_p_value?: number | null;
        /**
         * `b.headline.sharpe.value - a.headline.sharpe.value`.
         */
        sharpe_delta: number;
    };
} | {
    /**
     * `b` is strictly worse than `a` and the DM test rejected the null.
     */
    BWorse: {
        /**
         * DM p-value (always populated for this variant — `< 0.05`).
         */
        dm_p_value?: number | null;
        /**
         * `b.headline.sharpe.value - a.headline.sharpe.value`.
         */
        sharpe_delta: number;
    };
} | {
    /**
     * Either the inputs are identical, the DM test wasn't computable
     * (no overlap / no forecasts / aligned series too short), or the
     * test failed to reject the null.
     */
    Inconclusive: {
        /**
         * Human-readable explanation (`"identical reports"`,
         * `"no aligned forecasts"`, `"DM test not significant (p = …)"`,
         * `"period overlap …% < 80%"`).
         */
        reason: string;
    };
});

