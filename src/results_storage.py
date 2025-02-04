import os
import json
import time
from typing import Dict, Any, List, Optional
import pandas as pd

from src.metrics import calculate_advanced_metrics
from config import logger, RESULTS_DIR

if not os.path.exists(RESULTS_DIR):
    os.makedirs(RESULTS_DIR)

def save_simulation_result(
    params: Dict[str, Any],
    orders: List[Dict[str, Any]],
    equity_curve: List[float],
    candle_data: Optional[pd.DataFrame] = None   # <-- new
) -> str:
    """
    Save simulation results and computed metrics to a JSON file.
    """
    metrics = calculate_advanced_metrics(orders, equity_curve, params.get("initial_capital", 10000))
    logger.info("Calculated metrics for simulation result.")

    result = {
        "timestamp": int(time.time()),
        "params": params,
        "orders": orders,
        "equity_curve": equity_curve,
        "metrics": metrics
    }

    if candle_data is not None and not candle_data.empty:
        # Convert the entire DF to a list-of-dicts for JSON
        result["candles"] = candle_data.to_dict(orient="records")

    filename = os.path.join(RESULTS_DIR, f"simulation_{result['timestamp']}.json")
    with open(filename, 'w') as f:
        json.dump(result, f, indent=4, default=str)

    logger.info("Saved simulation result to: %s", filename)
    return filename

def get_all_simulation_results() -> List[Dict[str, Any]]:
    """
    Retrieve all simulation results stored in JSON files.
    Returns a list of simulation results sorted by timestamp (descending).
    """
    results = []
    for filename in os.listdir(RESULTS_DIR):
        if filename.endswith(".json"):
            filepath = os.path.join(RESULTS_DIR, filename)
            with open(filepath, 'r') as f:
                try:
                    result = json.load(f)
                    results.append(result)
                except json.JSONDecodeError:
                    logger.error("Error decoding JSON in file: %s", filename)

    results.sort(key=lambda x: x["timestamp"], reverse=True)
    return results

def get_simulation_result_by_timestamp(ts: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a single simulation result by its timestamp.

    :param ts: The timestamp string.
    :return: The simulation result dict, or None if not found.
    """
    filepath = os.path.join(RESULTS_DIR, f"simulation_{ts}.json")
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return None
