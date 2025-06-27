import backtrader as bt
from typing import List, Dict, Any
from config import logger

"""
####################################################
####################################################
###                                              ###
###         Intraday Momentum Strategy           ###
###                                              ###
####################################################
####################################################
"""
class IntradayMomentumStrategy(bt.Strategy):
    import datetime
    params = dict(
        strategy_events=None,

        # --- Timeframe filter ---
        use_tf_filter=True,
        allowed_timeframes=[1, 5, 15, 30, 60],  # in minutes
        # For multi-data setups, you’d typically add each feed with your chosen timeframe.

        # --- Session filter ---
        use_session_filter=True,
        session_start=datetime.time(9, 30),
        session_end=datetime.time(16, 0),

        # --- EMA settings ---
        ema_short_length=21,
        ema_long_length=55,

        # --- RSI settings ---
        rsi_length=14,
        rsi_overbought=70,
        rsi_oversold=30,

        # --- Stochastic settings ---
        stoch_length=14,
        stoch_k_smooth=3,
        stoch_d_smooth=3,
        stoch_overbought=80,
        stoch_oversold=20,

        # --- ADX settings ---
        adx_length=14,
        adx_threshold=20,

        # --- Risk management ---
        stop_loss_perc=0.5,     # 0.5% => 0.5
        take_profit_perc=1.5,   # 1.5% => 1.5
        trailing_stop=True,
        trailing_percent=0.3,   # 0.3% => 0.3

        # --- Trades per day ---
        max_trades_per_day=5,

        # --- For ATR-based dynamic SL/TP ---
        atr_period=14,
        atr_factor_sl=1.5,  # multiply ATR% by 1.5 if bigger than base stop_loss_perc
        atr_factor_tp=3.0,  # multiply ATR% by 3.0 if bigger than base take_profit_perc
    )

    def __init__(self):
        self.strategy_events_queue = self.p.strategy_events


        # --- Track daily trades ---
        self.trades_today = 0
        self.current_day = None

        # --- Indicators ---
        self.dmi = bt.indicators.DirectionalMovement(self.data, period=self.p.adx_length)
        self.di_plus  = self.dmi.plusDI
        self.di_minus = self.dmi.minusDI

        self.ema_short = bt.indicators.EMA(self.data.close, period=self.p.ema_short_length)
        self.ema_long  = bt.indicators.EMA(self.data.close, period=self.p.ema_long_length)

        self.rsi = bt.indicators.RSI(self.data.close, period=self.p.rsi_length)

        # Stochastic
        lowest_low = bt.indicators.Lowest(self.data.low, period=self.p.stoch_length)
        highest_high = bt.indicators.Highest(self.data.high, period=self.p.stoch_length)
        stoch_k_raw = (self.data.close - lowest_low) / (highest_high - lowest_low + 1e-9) * 100
        self.stoch_k = bt.indicators.SMA(stoch_k_raw, period=self.p.stoch_k_smooth)
        self.stoch_d = bt.indicators.SMA(self.stoch_k, period=self.p.stoch_d_smooth)

        # ADX
        # If you want DI+ and DI- separately, you can use a DMI indicator
        self.adx = bt.indicators.AverageDirectionalMovementIndex(self.data, period=self.p.adx_length)

        # ATR for dynamic risk mgmt
        self.atr = bt.indicators.ATR(self.data, period=self.p.atr_period)

    def next(self):
        # --- Check if we have a new day to reset trades ---
        current_dt = self.data.datetime.datetime()
        if self.current_day != current_dt.date():
            self.current_day = current_dt.date()
            self.trades_today = 0

        # --- Timeframe filter (basic approach if you feed one data only) ---
        # If you feed multiple data objects with different timeframes, 
        # you can just run your logic on the data with the timeframe you prefer.
        if self.p.use_tf_filter:
            # Convert Backtrader's bar size to minutes if you pass that info in your data feed
            # or you could skip if your feed isn't the allowed timeframe. 
            # For simplicity, this example won't force-check the timeframe. Adjust as needed.
            pass

        # --- Session filter ---
        if self.p.use_session_filter:
            if not (self.p.session_start <= current_dt.time() <= self.p.session_end):
                return  # skip trading outside session

        # --- Indicator readiness check ---
        min_bars = max(self.p.ema_long_length, self.p.stoch_length, self.p.rsi_length)
        if len(self.data) < min_bars:
            return

        # === Calculate dynamic ATR-based % if needed ===
        # Example: atr_percent = (ATR / close) * 100
        atr_percent = (self.atr[0] / self.data.close[0]) * 100 if self.data.close[0] else 0
        dynamic_sl = max(self.p.stop_loss_perc, atr_percent * self.p.atr_factor_sl)
        dynamic_tp = max(self.p.take_profit_perc, atr_percent * self.p.atr_factor_tp)

        # === Conditions from Pine Script ===
        # Trend checks
        bullish_trend = (self.ema_short[0] > self.ema_long[0])
        bearish_trend = (self.ema_short[0] < self.ema_long[0])

        # RSI-based momentum (note how in Pine you also used stoch checks for bullish_momentum)
        # This is a bit simpler approach. Adjust as needed.
        bullish_momentum = (self.rsi[0] > self.p.rsi_oversold and self.rsi[0] < self.p.rsi_overbought)
        bearish_momentum = bullish_momentum  # Pine used the same condition for both sides

        # Stochastic
        # We'll replicate the cross logic from Pine:
        stoch_cross_up = (self.stoch_k[-1] < self.stoch_d[-1]) and (self.stoch_k[0] > self.stoch_d[0])
        stoch_cross_down = (self.stoch_k[-1] > self.stoch_d[-1]) and (self.stoch_k[0] < self.stoch_d[0])

        # For “< 50” or “> 50” checks, adjust as needed. Pine used stoch_k < 50 for long, etc.
        stoch_k_below_50 = self.stoch_k[0] < 50
        stoch_k_above_50 = self.stoch_k[0] > 50

        # ADX for strong trend
        strong_trend = (self.adx[0] > self.p.adx_threshold)

        # === Final entry signals (similar to Pine) ===
        # Long
        long_entry = (bullish_trend and
                      bullish_momentum and
                      stoch_cross_up and
                      stoch_k_below_50 and
                      strong_trend and
                      self.di_plus[0] > self.di_minus[0])

        # Short
        short_entry = (bearish_trend and
                       bearish_momentum and
                       stoch_cross_down and
                       stoch_k_above_50 and
                       strong_trend and
                       self.di_minus[0] > self.di_plus[0])

        # === Additional exit signals ===
        long_exit_signal = ((self.rsi[0] > self.p.rsi_overbought and self.stoch_k[0] > self.p.stoch_overbought)
                            or (self.ema_short[0] < self.ema_long[0]))
        short_exit_signal = ((self.rsi[0] < self.p.rsi_oversold and self.stoch_k[0] < self.p.stoch_oversold)
                             or (self.ema_short[0] > self.ema_long[0]))

        # --- Check how many trades taken today ---
        can_trade = (self.trades_today < self.p.max_trades_per_day)

        # === LONG ENTRY ===
        if not self.position and long_entry and can_trade:
            self.trades_today += 1
            # We’ll simulate dynamic SL/TP. 
            # In Backtrader, we can do it with bracket orders or manually.
            self.buy_bracket(
                size=1,  # or your custom sizing logic
                limitprice=self.data.close[0] * (1.0 + dynamic_tp / 100.0),
                stopprice=self.data.close[0] * (1.0 - dynamic_sl / 100.0),
                # For trailing, we can’t just pass trailing as with Pine.
                # We either do separate code or a next() check to move stop.
            )

        # === SHORT ENTRY ===
        if not self.position and short_entry and can_trade:
            self.trades_today += 1
            self.sell_bracket(
                size=1,
                limitprice=self.data.close[0] * (1.0 - dynamic_tp / 100.0),
                stopprice=self.data.close[0] * (1.0 + dynamic_sl / 100.0),
            )

        # === MANUAL EXIT CONDITIONS (on existing position) ===
        if self.position:
            # If we are long and see a long_exit signal, exit
            if self.position.size > 0 and long_exit_signal:
                self.close()

            # If we are short and see a short_exit signal, exit
            if self.position.size < 0 and short_exit_signal:
                self.close()

    def notify_order(self, order):
        # Track order statuses
        if order.status in [order.Completed, order.Canceled, order.Rejected]:
            self.strategy_events_queue.put({'type': 'order', 'order': order})
            if order.isbuy():
                print(f"[{self.data.datetime.datetime()}] BUY {order.status}: "
                      f"Size={order.executed.size}, Price={order.executed.price}")
            else:
                print(f"[{self.data.datetime.datetime()}] SELL {order.status}: "
                      f"Size={order.executed.size}, Price={order.executed.price}")

    def notify_trade(self, trade):
        if trade.isclosed:
            print(f"[{self.data.datetime.datetime()}] TRADE CLOSED: "
                  f"Profit={trade.pnl:.2f}, Net={trade.pnlcomm:.2f}")



"""
####################################################
####################################################
###                                              ###
###         Range-Box MACD-RSI Strategy          ###
###                                              ###
####################################################
####################################################
"""
class BoxMacdRsiStrategy(bt.Strategy):

    params = (
        ('commission', 0.001),  # Commission per trade (0.1%)
        ('slippage', 0.005),    # Slippage per trade (0.5%)
        ('risk_percent', 1.0),  # Default risk percentage per trade
        ('rsi_length', 14),
        ('volatility_period', 20),  # Period for volatility calculation
        ('volatility_threshold', 0.02),  # Minimum volatility threshold
        ('adaptive_pivot_period', 50),  # Period for adaptive pivot calculation

        ('rsi_threshold', 50), 
        ('use_stricter_rsi', False),

        ('macd_fast', 14),
        ('macd_slow', 28),
        ('macd_signal', 9),
        ('macd_above_signal', True),
        ('use_atr_stops', True),
        ('atr_period', 14),
        ('atr_multiplier', 2.0),
        ('partial_exit', True),
        ('partial_pct', 10.0),
        ('partial_atr_mult', 1.0),
        ('final_atr_mult', 2.0),
        ('margin_long', 1.0),
        ('box_lookback', 31),
        ('use_cooldown', False),
        ('cooldown_bars', 1),
        ('bars_back', 500),
        ('use_next_bar_confirm', False)
    )

    def __init__(self):
        # Set commission and slippage
        self.broker.setcommission(
            commission=self.p.commission,
        )
        self.broker.set_slippage_perc(self.p.slippage, True, True, True, False)
        
        # Initialize indicators
        self.rsi = bt.indicators.RSI(self.data.close, period=self.p.rsi_length)
        self.macd = bt.indicators.MACD(
            self.data.close,
            period_me1=self.p.macd_fast,
            period_me2=self.p.macd_slow,
            period_signal=self.p.macd_signal
        )
        self.atr = bt.indicators.ATR(self.data, period=self.p.atr_period)
        # Volatility and adaptive pivot indicators
        self.volatility = bt.indicators.StdDev(
            self.data.close, period=self.p.volatility_period
        )
        self.adaptive_pivot = bt.indicators.SMA(
            self.data.close, period=self.p.adaptive_pivot_period
        )
        
        # Initialize state variables
        self.orders = []
        self.last_entry_bar = None
        self.position_size = 0
        self.position_cost = 0
        self.position_stop = 0
        self.position_partial_limit = 0
        self.position_final_limit = 0

    def next(self):
        try:
            # Skip if indicators are not ready
            if len(self.data) < self.p.box_lookback:
                return

            # Validate indicator values exist
            if not all([
                hasattr(self, 'rsi'),
                hasattr(self, 'macd'),
                hasattr(self, 'atr'),
                hasattr(self, 'volatility'),
                hasattr(self, 'adaptive_pivot')
            ]):
                return

            # Check array bounds before accessing
            if len(self.data.close) == 0 or len(self.rsi) == 0 or len(self.macd.macd) == 0:
                return
        except Exception as e:
            logger.error(f"Error in BoxMacdRsiStrategy.next(): {str(e)}")
            return

        # Get current price data
        c_open = self.data.open[0]
        c_high = self.data.high[0]
        c_low = self.data.low[0]
        c_close = self.data.close[0]

        # Calculate adaptive box boundaries using pivot
        pivot_level = self.adaptive_pivot[0]
        box_low = min(
            pivot_level * 0.98,
            min(self.data.low.get(size=self.p.box_lookback))
        )
        box_high = max(
            pivot_level * 1.02,
            max(self.data.high.get(size=self.p.box_lookback))
        )

        # Candle patterns
        rolling_lowest5 = min(self.data.low.get(size=5))
        is_hammer = (
            c_close > c_open and
            abs(c_low - rolling_lowest5) < 1e-12 and
            (c_high - c_close) > 2*(c_close - c_open)
        )
        candle_range = c_high - c_low
        is_doji = abs(c_close - c_open) < candle_range*0.1

        # Support check
        near_support_now = (c_close > box_low*0.98) and (c_close < box_low*1.02)

        # RSI + MACD checks
        rsi_ok = (self.rsi[0] > 50) if self.p.use_stricter_rsi else (self.rsi[0] > self.p.rsi_threshold)
        if self.p.macd_above_signal:
            macd_ok = (self.macd.macd[0] > self.macd.signal[0])
        else:
            macd_ok = (self.macd.macd[0] > 0)

        entry_signal = (
            near_support_now and
            (is_hammer or is_doji) and
            rsi_ok and
            macd_ok
        )

        # Position management logic
        if not self.position:
            if entry_signal:
                self.enter_position(c_close)
        else:
            self.manage_position(c_close, c_low, c_high)

    def enter_position(self, price):
        # Dynamic grid spacing based on volatility
        volatility_factor = max(
            self.volatility[0] / self.data.close[0],
            self.p.volatility_threshold
        )
        atr_multiplier = self.p.atr_multiplier * (1 + volatility_factor)
        
        stop_price = price - self.atr[0] * atr_multiplier
        position_size = self.calculate_position_size(price, stop_price)

        # Place buy order
        self.buy(size=position_size)
        
        # Set position parameters
        self.position_size = position_size
        self.position_cost = position_size * price
        self.position_stop = stop_price
        self.position_partial_limit = price + self.atr[0] * self.p.partial_atr_mult
        self.position_final_limit = price + self.atr[0] * self.p.final_atr_mult

    def manage_position(self, price, low, high):
        # Check for stop loss
        if low <= self.position_stop:
            self.close()
            return

        # Check for partial exit
        if self.p.partial_exit and high >= self.position_partial_limit:
            partial_size = self.position_size * (self.p.partial_pct / 100.0)
            self.sell(size=partial_size)
            self.position_size -= partial_size

        # Check for final exit
        if high >= self.position_final_limit:
            self.close()

    def calculate_position_size(self, price, stop_price):
        # Calculate position size based on risk management
        risk_amount = self.broker.getvalue() * (self.p.risk_percent / 100.0)
        position_size = risk_amount / max((price - stop_price), 1e-6)
        return position_size

    def notify_trade(self, trade):
        # Called when a trade is closed
        if trade.isclosed:
            self.orders.append({
                "type": "sell" if trade.size < 0 else "buy",
                "time": str(self.data.datetime.datetime()),
                "price": trade.price,
                "size": abs(trade.size),
                "profit": trade.pnl
            })


"""
####################################################
####################################################
###                                              ###
###     Stochastic Mean Reversion Strategy       ###
###                                              ###
####################################################
####################################################
"""
class StochasticMeanReversion(bt.Strategy):
    params = (
        ('kLength', 6),
        ('kSmoothing', 6),
        ('dSmoothing', 6),
        ('oversold', 30),
        ('overbought', 70),
        ('maLength', 21),
        ('atrPeriod', 14),
        ('atrMultiplierSL', 1.0),
        ('atrMultiplierTP', 3.5),
    )

    def __init__(self, strategy_events=None):
        # Store the queue reference
        self.strategy_events_queue = strategy_events

        # Use the primary data for most calculations
        self.data0 = self.datas[0]
        self.dataHTF = self.datas[1] if len(self.datas) > 1 else self.data0

        # ATR indicator
        self.atr = bt.indicators.ATR(self.data0, period=self.p.atrPeriod)

        # ---- Stochastic Oscillator ----
        self.lowest_low = bt.indicators.Lowest(self.data0.low, period=self.p.kLength)
        self.highest_high = bt.indicators.Highest(self.data0.high, period=self.p.kLength)
        self.rawK = 100 * (self.data0.close - self.lowest_low) / (self.highest_high - self.lowest_low + 1e-9)
        self.stochK = bt.indicators.SMA(self.rawK, period=self.p.kSmoothing)
        self.stochD = bt.indicators.SMA(self.stochK, period=self.p.dSmoothing)
        self.stochCrossover = bt.indicators.CrossOver(self.stochK, self.stochD)

        # ---- Moving Averages ----
        self.ma = bt.indicators.SMA(self.data0.close, period=self.p.maLength)
        upper_length = int(self.p.maLength * 1.5)
        self.upper_ma = bt.indicators.SMA(self.data0.close, period=upper_length)
        self.maHTF = bt.indicators.SMA(self.dataHTF.close, period=self.p.maLength)

        self.main_order = None

    def next(self):
        dynamicDeviation = self.atr[0] / self.data0.close[0]

        longTrendFilter = self.data0.close[0] > self.maHTF[0]
        shortTrendFilter = self.data0.close[0] < self.maHTF[0]

        stoch_crossover = (self.stochCrossover[0] == 1)
        stoch_crossunder = (self.stochCrossover[0] == -1)

        # Entry conditions
        longSignal = (
            self.stochK[0] < self.p.oversold 
            and stoch_crossover
            and (self.data0.close[0] < self.ma[0] * (1 - dynamicDeviation))
            and longTrendFilter
        )
        shortSignal = (
            self.stochK[0] > self.p.overbought
            and stoch_crossunder
            and (self.data0.close[0] > self.ma[0] * (1 + dynamicDeviation))
            and shortTrendFilter
        )

        if not self.position and self.main_order is None:
            if longSignal:
                entry_price = self.data0.close[0]
                stop_price = entry_price - self.atr[0] * self.p.atrMultiplierSL
                limit_price = entry_price + self.atr[0] * self.p.atrMultiplierTP
                self.main_order = self.buy_bracket(
                    size=1,
                    stopprice=stop_price,
                    limitprice=limit_price
                )
            elif shortSignal:
                entry_price = self.data0.close[0]
                stop_price = entry_price + self.atr[0] * self.p.atrMultiplierSL
                limit_price = entry_price - self.atr[0] * self.p.atrMultiplierTP
                self.main_order = self.sell_bracket(
                    size=1,
                    stopprice=stop_price,
                    limitprice=limit_price
                )
        else:
            # Additional Exit: Mean Reversion
            if self.position:
                if self.position.size > 0 and self.data0.close[0] >= self.ma[0]:
                    self.close()
                    self.main_order = None
                elif self.position.size < 0 and self.data0.close[0] <= self.ma[0]:
                    self.close()
                    self.main_order = None

    def notify_order(self, order):
        # If you want to push order events, do something like:
        if order.status in [order.Completed, order.Canceled, order.Rejected]:
            if self.strategy_events_queue:
                event = {
                    "type": "order",
                    "time": str(self.data.datetime.datetime()),
                    "status": str(order.getstatusname()),
                    "isbuy": order.isbuy(),
                    "size": order.executed.size,
                    "price": order.executed.price,
                }
                self.strategy_events_queue.put(event)

            self.main_order = None

    def notify_trade(self, trade):
        if trade.isclosed:
            self.log(f"Trade closed, PnL: {trade.pnl:.2f}")

            if self.strategy_events_queue:
                event = {
                    "type": "trade",
                    "time": str(self.data.datetime.datetime()),
                    "size": abs(trade.size),
                    "price": trade.price,
                    "profit": trade.pnl
                }
                self.strategy_events_queue.put(event)

    def log(self, txt, dt=None):
        dt = dt or self.data0.datetime.date(0)
        print(f'{dt.isoformat()} {txt}')




"""
####################################################
####################################################
###                                              ###
###          IB Price Action Strategy            ###
###                                              ###
####################################################
####################################################
"""
class IBPriceActionStrategy(bt.Strategy):
    """ Replicates the logic of PineScript IB PriceAction v3 – Pro Edition. """

    # ----- Strategy Params -----
    params = dict(
        risk_percent=10.0,         # default 10% of equity to risk per trade
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
        """Initialize indicators & placeholders."""
        # 1) EMA(50) for trend
        self.ema = bt.indicators.ExponentialMovingAverage(self.data.close, period=50)
        
        # 2) Volume SMA(20)
        self.volSMA = bt.indicators.SimpleMovingAverage(self.data.volume, period=20)
        
        # 3) ATR
        self.atr = bt.indicators.ATR(self.data, period=self.p.atrLength)
        
        # Track open orders so we can cancel/replace if needed
        self.longEntryOrder = None
        self.shortEntryOrder = None
        
    def next(self):
        # ----------------------------------------------------------------
        #  We refer to:
        #    current bar   -> index 0
        #    previous bar  -> index -1
        #    bar before that -> index -2
        #  same in Pine: high[1], high[2], etc.
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
                self.shortEntryOrder = self.sell(
                    exectype=bt.Order.Stop,
                    price=shortEntry,
                    size=sizeShort
                )
                # similarly store bracket logic in notify_order

    def notify_order(self, order):
        """
        This is called whenever an order's status changes.
        We can create the bracket SL/TP once the entry is accepted or executed.
        """
        if order.status in [order.Accepted]:
            # Accepted = we know the price is valid and will trigger if reached
            pass

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

    def notify_trade(self, trade):
        """Optional: track your trade results or debug here."""
        if trade.isclosed:
            pnl = trade.pnl
            # You can print or log your PnL
            # e.g. print(f"[TRADE] PnL: {pnl: .2f}")
            pass
