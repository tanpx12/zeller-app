/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * The four-way verdict the evaluator produces. Spec line 1050-1063.
 */
export type Verdict = ('NoRetrainNeeded' | {
    /**
     * Single soft fire and model is recent — likely noise but watch.
     */
    Monitor: {
        /**
         * Why monitor — e.g. "single soft signal — may be noise".
         */
        reason: string;
    };
} | {
    /**
     * 2+ soft fires, OR 1 soft + age > 60 days. Retrain recommended.
     */
    Recommend: {
        /**
         * Why retrain — e.g. "multiple decay signals".
         */
        reason: string;
    };
} | {
    /**
     * Any hard fire. Stop the strategy until retrained.
     */
    StronglyRecommend: {
        /**
         * Why retrain strongly — e.g. "hard triggers fired".
         */
        reason: string;
    };
});

