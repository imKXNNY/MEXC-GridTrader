import backtrader as bt
import datetime
import numpy as np
from typing import List, Dict, Any

class PatchedIBPriceActionStrategy(bt.Strategy):
    """
    Inside Bar Price Action Strategy with datetime compatibility fix
    """
    # ----- Strategy Params -----
    params = dict(
        risk_percent=1.0,         # default 1% of equity to risk per trade
        rr_ratio=2.5,             # default 2.5:1
        minInsideBarSize=0.5,     # percent-based minimum size
        useTrendFilter=True,
        useVolumeFilter=True,
        volMultiplier=1.1,        # volume must be > SMA(20)*1.1
        useATRTP=True,
        atrLength=14,
        atrMult=1.5,
    )

    def __init__(self):
        # Initialize orders
        self.orders = []
        self.longEntryOrder = None
        self.shortEntryOrder = None

        # Initialize indicators
        self.ema = bt.indicators.EMA(self.data.close, period=200)
        self.atr = bt.indicators.ATR(self.data, period=self.p.atrLength)
        self.volSMA = bt.indicators.SMA(self.data.volume, period=20)

        # Patch for datetime issue
        self._datetime = None

    def next(self):
        # Update datetime patch
        self._datetime = self.data.datetime.date(0)

        # ----------------------------------------------------------------
        #  We refer to:
        #    current bar   -> index 0
        #    previous bar  -> index -1
        #    bar before that -> index -2
        # ----------------------------------------------------------------

        # 1) Inside Bar detection (based on previous 2 bars)
        #    * high[-1] < high[-2]
        #    * low[-1]  > low[-2]
        if len(self.data) < 3:
            return  # not enough bars to compute

        high_m1 = self.data.high[-1]   # previous bar
        high_m2 = self.data.high[-2]   # bar before previous
        low_m1  = self.data.low[-1]
        low_m2  = self.data.low[-2]

        insideBar = (high_m1 < high_m2) and (low_m1 > low_m2)
        insideBarRange = high_m1 - low_m1
        #   Percentage relative to previous close
        close_m1 = self.data.close[-1]
        insideBarPerc = (insideBarRange / close_m1 * 100) if close_m1 != 0 else 0.0

        # 2) Trend & Volume filters
        #    TrendLong = close > EMA, TrendShort = close < EMA
        trendLong  = (self.data.close[0] > self.ema[0])
        trendShort = (self.data.close[0] < self.ema[0])

        #    Volume filter
        volOk = (self.data.volume[0] > self.volSMA[0] * self.p.volMultiplier)

        # 3) Entry conditions from Pine:
        #    longBreak = current high > previous bar's high
        #    shortBreak = current low < previous bar's low
        longBreak  = (self.data.high[0] > high_m1)
        shortBreak = (self.data.low[0] < low_m1)

        #    Combine conditions
        longCond = insideBar and (insideBarPerc >= self.p.minInsideBarSize) and longBreak
        shortCond = insideBar and (insideBarPerc >= self.p.minInsideBarSize) and shortBreak

        if self.p.useTrendFilter:
            longCond  = longCond  and trendLong
            shortCond = shortCond and trendShort

        if self.p.useVolumeFilter:
            longCond  = longCond  and volOk
            shortCond = shortCond and volOk

        # 4) If we already have an open position, skip new signals
        #    Or if we have pending orders
        if self.position or self.longEntryOrder or self.shortEntryOrder:
            return

        # 5) Compute stop/TP from Pine
        longEntry = high_m1
        longSL    = low_m1
        # either ATR-based or RRR-based
        if self.p.useATRTP:
            longTP = longEntry + (self.atr[0] * self.p.atrMult)
        else:
            longTP = longEntry + ( (longEntry - longSL) * self.p.rr_ratio )

        shortEntry = low_m1
        shortSL    = high_m1
        if self.p.useATRTP:
            shortTP = shortEntry - (self.atr[0] * self.p.atrMult)
        else:
            shortTP = shortEntry - ( (shortSL - shortEntry) * self.p.rr_ratio )

        # 6) Position sizing: we risk 'risk_percent' of broker value
        #    risk = difference between entry and SL
        #    size = (broker_value * risk_percent/100 ) / abs(entry - SL)
        broker_val = self.broker.getvalue()

        #    Long scenario
        if longCond and (longEntry > longSL):
            risk_perc_value = broker_val * (self.p.risk_percent / 100.0)
            stop_dist = abs(longEntry - longSL)
            if stop_dist > 0:
                sizeLong = risk_perc_value / stop_dist
                # Place bracket-like: (1) STOP entry, (2) STOP-Loss, (3) Limit exit
                self.longEntryOrder = self.buy(
                    exectype=bt.Order.Stop,
                    price=longEntry,
                    size=sizeLong
                )
                # We'll store the SL / TP as 'bracket' after the entry is confirmed in notify_order

        #    Short scenario
        if shortCond and (shortSL > shortEntry):
            risk_perc_value = broker_val * (self.p.risk_percent / 100.0)
            stop_dist = abs(shortSL - shortEntry)
            if stop_dist > 0:
                sizeShort = risk_perc_value / stop_dist
                # Place bracket-like: (1) STOP entry, (2) STOP-Loss, (3) Limit exit
                self.shortEntryOrder = self.sell(
                    exectype=bt.Order.Stop,
                    price=shortEntry,
                    size=sizeShort
                )
                # We'll store the SL / TP as 'bracket' after the entry is confirmed in notify_order

    def notify_order(self, order):
        # Record the order
        self.orders.append({
            'datetime': self.data.datetime.date(0).isoformat(),
            'type': 'buy' if order.isbuy() else 'sell',
            'price': order.executed.price if order.status == order.Completed else order.created.price,
            'size': order.executed.size if order.status == order.Completed else order.created.size,
            'status': order.getstatusname()
        })

        if order.status in [order.Submitted, order.Accepted]:
            # Order submitted/accepted - no action required
            return

        if order.status in [order.Completed]:
            # Once we have an actual executed entry, we can place TP/SL
            if order.isbuy():
                # Long entry was filled
                fillprice = order.executed.price
                # find the logic again for SL/TP
                longSL = self.data.low[-1]
                longTP = (fillprice + self.atr[0]*self.p.atrMult) if self.p.useATRTP else (fillprice + (fillprice - longSL)*self.p.rr_ratio)
                size = order.executed.size

                # place bracket exit orders
                # 1) stop-loss
                self.sell(
                    exectype=bt.Order.Stop,
                    price=longSL,
                    size=size
                )
                # 2) take-profit
                self.sell(
                    exectype=bt.Order.Limit,
                    price=longTP,
                    size=size
                )

            else:
                # Short entry was filled
                fillprice = order.executed.price
                shortSL = self.data.high[-1]
                shortTP = (fillprice - self.atr[0]*self.p.atrMult) if self.p.useATRTP else (fillprice - (shortSL - fillprice)*self.p.rr_ratio)
                size = abs(order.executed.size)  # short size is negative, so take absolute

                # bracket exit orders
                self.buy(
                    exectype=bt.Order.Stop,
                    price=shortSL,
                    size=size
                )
                self.buy(
                    exectype=bt.Order.Limit,
                    price=shortTP,
                    size=size
                )

        # If the order is canceled/margin/whatever, reset references
        if order.status in [order.Canceled, order.Margin, order.Rejected, order.Expired]:
            if order == self.longEntryOrder:
                self.longEntryOrder = None
            if order == self.shortEntryOrder:
                self.shortEntryOrder = None

    # Patch for datetime issue
    @property
    def datetime(self):
        """Patch for the datetime property to fix the compatibility issue"""
        class DatetimeProxy:
            def __init__(self, strategy):
                self.strategy = strategy

            def datetime(self):
                if self.strategy._datetime is None:
                    # Return a default datetime if _datetime is not set yet
                    return datetime.datetime.now()
                return self.strategy._datetime

        return DatetimeProxy(self)
