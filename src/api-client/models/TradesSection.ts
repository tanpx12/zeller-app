/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Histogram } from './Histogram';
import type { TradeRecord } from './TradeRecord';
/**
 * Trade-level analysis computed by the report builder.
 */
export type TradesSection = {
    /**
     * Mean `hold_bars` across trades. `f64::NAN` when no trades exist.
     */
    avg_hold_bars: number;
    /**
     * Mean PnL of trades with `pnl_usd < 0`. `f64::NAN` when no losing
     * trades exist; reported as a **negative** number.
     */
    avg_loss_usd: number;
    /**
     * Mean PnL of trades with `pnl_usd > 0`. `f64::NAN` when no winning
     * trades exist.
     */
    avg_win_usd: number;
    /**
     * Histogram of `hold_bars` across trades.
     */
    hold_distribution: Histogram;
    largest_loss?: (null | TradeRecord);
    largest_win?: (null | TradeRecord);
    /**
     * Histogram of `pnl_usd` across trades.
     */
    pnl_distribution: Histogram;
    /**
     * Every reconstructed round-trip trade. See [`extract_trades`] for
     * boundary semantics.
     */
    trades: Array<TradeRecord>;
};

