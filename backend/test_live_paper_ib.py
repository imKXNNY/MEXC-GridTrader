# test_live_paper_ib.py
from src.live_paper_trading import LivePaperTrading
from src.patched_strategy import PatchedIBPriceActionStrategy
from queue import Queue
import threading
import time

# Parameters for the Inside Bar Strategy
symbol = 'BTCUSDT'
interval = '1h'

# Inside Bar specific parameters
ib_params = {
    'risk_percent': 1.0,
    'minInsideBarSize': 0.5,
    'useTrendFilter': True,
    'useVolumeFilter': True,
    'volMultiplier': 1.1,
    'useATRTP': True,
    'atrLength': 14,
    'atrMult': 1.5,
    'rr_ratio': 2.5
}

# Create queues for live data and strategy events
live_data_queue = Queue()
strategy_events_queue = Queue()

# Create a subclass of PatchedIBPriceActionStrategy with the parameters
class ConfiguredIBStrategy(PatchedIBPriceActionStrategy):
    params = ib_params

    def __init__(self, strategy_events=None):
        super().__init__()
        self.strategy_events = strategy_events

# Create paper trader with IB strategy
print(f"Setting up live paper trading for {symbol} with Inside Bar strategy...")
paper_trader = LivePaperTrading(
    symbols=[symbol],
    live_data_queue=live_data_queue,
    strategy_events_queue=strategy_events_queue,
    strategy=ConfiguredIBStrategy
)

# Start in background thread
print("Starting live paper trading...")
thread = threading.Thread(target=paper_trader.run, daemon=True)
thread.start()

# Monitor for events
print("Monitoring for strategy events...")
try:
    while True:
        # Check for strategy events
        if not strategy_events_queue.empty():
            event = strategy_events_queue.get()
            print(f"Strategy event: {event}")

        # Check for live data
        if not live_data_queue.empty():
            data = live_data_queue.get()
            print(f"Live data: {data}")

        time.sleep(1)
except KeyboardInterrupt:
    print("Stopping live paper trading...")
    paper_trader.stop()
    print("Live paper trading stopped.")
