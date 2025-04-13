# src/data_handler/exchange_live_feed.py
import backtrader as bt
import datetime

class ExchangeLiveData(bt.feed.DataBase):
    """
    A minimal live feed that expects messages shaped like:
      {
        "time": "2025-02-25T10:00:00",
        "open": 12345.6,
        "high": 12350.0,
        "low": 12300.2,
        "close": 12320.1,
        "volume": 12.345
      }
    and sets 'new_data = True' each time we get a new bar.
    """

    def __init__(self):
        super().__init__()
        self.new_bar = None
        self.new_data = False

    def start(self):
        super().start()
        self.new_bar = None
        self.new_data = False

    def _load(self):
        """
        Called repeatedly by Backtrader to see if there's a new bar available.
        Return True if a new bar is loaded, False otherwise.
        """
        if not self.new_data or not self.new_bar:
            return False

        bar = self.new_bar
        self.new_data = False

        # Convert the bar's time
        # If bar["time"] is a normal string, e.g. '2025-02-25T10:00:00'
        dt = datetime.datetime.fromisoformat(bar["time"])
        self.lines.datetime[0] = bt.date2num(dt)

        self.lines.open[0]   = float(bar["open"])
        self.lines.high[0]   = float(bar["high"])
        self.lines.low[0]    = float(bar["low"])
        self.lines.close[0]  = float(bar["close"])
        self.lines.volume[0] = float(bar["volume"])
        self.lines.openinterest[0] = 0.0

        return True

    def update_bar(self, bar_data: dict):
        """
        Called by the WebSocket handler to supply a new bar.
        """
        self.new_bar = bar_data
        self.new_data = True
