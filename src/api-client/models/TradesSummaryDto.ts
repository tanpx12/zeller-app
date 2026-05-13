/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TradeRecord } from './TradeRecord';
/**
 * Per-page trades summary block — the spec's `summary` field on the
 * `/trades` response. Mirrors the existing fields on
 * [`crate::report::TradesSection`] minus the trade list itself.
 */
export type TradesSummaryDto = {
    /**
     * Mean `hold_bars` across trades.
     */
    avg_hold_bars: number;
    /**
     * Mean PnL of losing trades (negative). `NaN` when no losses.
     */
    avg_loss_usd: number;
    /**
     * Mean PnL of winning trades. `NaN` when no wins.
     */
    avg_win_usd: number;
    largest_loss?: (null | TradeRecord);
    largest_win?: (null | TradeRecord);
};

