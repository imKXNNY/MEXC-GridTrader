import backtrader as bt
from typing import List, Dict, Any
from config import logger

class MomentumTrendStrategy(bt.Strategy):
    params = (
        ('ema_short', 50),
        ('ema_long', 200),
        ('rsi_length', 14),
        ('stoch_length', 14),      # Used for the RSI period inside Stoch RSI
        ('k_period', 3),           # Smoothing for the %K line
        ('d_period', 3),           # Smoothing for the %D line
        ('di_len', 14),
        ('adx_smoothing', 14),
        ('stop_loss_perc', 1.0),
        ('take_profit_perc', 3.0),
    )

    def __init__(self):
        # ---------- EMAs ----------
        self.ema_short = bt.indicators.EMA(self.data.close, period=self.p.ema_short)
        self.ema_long = bt.indicators.EMA(self.data.close, period=self.p.ema_long)

        # ---------- RSI ----------
        self.rsi = bt.indicators.RSI(self.data.close, period=self.p.rsi_length)
        
        # ---------- Standard Stoch ----------
        # ---------- Highest/Lowest of H/L over stoch_length ----------
        self.lowest_low = bt.ind.Lowest(self.data.low, period=self.p.stoch_length)
        self.highest_high = bt.ind.Highest(self.data.high, period=self.p.stoch_length)

        # ---------- %K and %D ----------
        stoch_k_raw = (self.data.close - self.lowest_low) / \
                      (self.highest_high - self.lowest_low + 1e-9) * 100

        self.stoch_k = bt.indicators.SMA(stoch_k_raw, period=self.p.k_period)
        self.stoch_d = bt.indicators.SMA(self.stoch_k,   period=self.p.d_period)
        
        # ---------- ADX ----------
        self.adx = bt.indicators.AverageDirectionalMovementIndex(
            period=self.p.di_len,
            movav=bt.indicators.SMA
        )

        # Initialize state
        self.orders = []
        self.position_size = 0
        self.position_cost = 0

    def next(self):
        try:
            # Skip if indicators aren't ready
            min_bars_required = max(self.p.ema_long, self.p.stoch_length, self.p.rsi_length)
            if len(self.data) < min_bars_required:
                logger.debug(f"Skipping - Need {min_bars_required} bars, have {len(self.data)}")
                return

            if not all([
                len(self.ema_short) > 0,
                len(self.ema_long) > 0,
                len(self.stoch_k) > 0,
                len(self.stoch_d) > 0,
                len(self.adx) > 0,
                len(self.rsi) > 0
            ]):
                logger.debug("Skipping - Missing indicator data")
                return
        except Exception as e:
            logger.error(f"Error in MomentumTrendStrategy.next(): {str(e)}")
            return

        # ---------- Calculate Conditions ----------
        # Trend check
        bullish_trend = (self.ema_short[0] > self.ema_long[0]) and (self.data.close[0] > self.ema_long[0])
        
        # RSI filter
        rsi_ok = 40 < self.rsi[0] < 70
        
        # Stoch RSI cross-up: %K > %D and %K < 20
        stoch_cross_up = (self.stoch_k[0] > self.stoch_d[0])
        stoch_ok = (self.stoch_k[0] < 20)
        
        # ADX check
        adx_ok = (self.adx[0] > 17)

        # ---------- Entry Condition ----------
        if not self.position and bullish_trend and rsi_ok and stoch_cross_up and stoch_ok and adx_ok:
            self.enter_position()

        # ---------- Exit Condition ----------
        if self.position:
            # Example: exit if RSI > 80 or short EMA < long EMA
            if self.rsi[0] > 80 or self.ema_short[0] < self.ema_long[0]:
                self.close()

    def enter_position(self):
        """
        Buy a position sized so that if price hits stop_loss, you lose ~`stop_loss_perc`% of your account.
        """
        # Calculate position size
        risk_amount = self.broker.getvalue() * (self.p.stop_loss_perc / 100.0)
        stop_price = self.data.close[0] * (1 - self.p.stop_loss_perc / 100.0)
        position_size = risk_amount / max((self.data.close[0] - stop_price), 1e-9)
        
        # Place buy order
        self.buy(size=position_size)
        
        # Store position details
        self.position_size = position_size
        self.position_cost = position_size * self.data.close[0]

    def notify_trade(self, trade):
        if trade.isclosed:
            self.orders.append({
                "type": "sell" if trade.size < 0 else "buy",
                "time": str(self.data.datetime.datetime()),
                "price": trade.price,
                "size": abs(trade.size),
                "profit": trade.pnl
            })

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
