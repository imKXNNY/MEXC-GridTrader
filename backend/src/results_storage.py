# /src/results_storage.py
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
    final_value: float,
    candle_data: Optional[pd.DataFrame] = None
) -> str:

    initial_capital = params.get("initial_capital", 10000)
    metrics = calculate_advanced_metrics(orders, initial_capital, final_value)

    result = {
        "timestamp": int(time.time()),
        "params": params,
        "orders": orders,
        "final_value": final_value,
        "metrics": metrics
    }

    # Convert candle_data to JSON
    if candle_data is not None and not candle_data.empty:
        if "time" in candle_data.columns:
            if pd.api.types.is_datetime64_any_dtype(candle_data["time"]):
                candle_data["time"] = candle_data["time"].dt.strftime("%Y-%m-%d %H:%M:%S")
        result["candles"] = candle_data.to_dict(orient="records")

    # Store initial and final equity values
    result["equity"] = {
        "initial": initial_capital,
        "final": final_value
    }


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

def delete_simulation_result(timestamp: str) -> bool:
    """
    Delete a simulation result by its timestamp.

    :param timestamp: The timestamp string of the result to delete.
    :return: True if deletion was successful, False if file didn't exist.
    """
    filepath = os.path.join(RESULTS_DIR, f"simulation_{timestamp}.json")
    if os.path.exists(filepath):
        os.remove(filepath)
        logger.info(f"Deleted simulation result: {filepath}")
        return True
    return False

def delete_all_simulation_results() -> int:
    """
    Delete all simulation results in the results directory.

    :return: Number of files deleted.
    """
    count = 0
    for filename in os.listdir(RESULTS_DIR):
        if filename.endswith(".json"):
            filepath = os.path.join(RESULTS_DIR, filename)
            os.remove(filepath)
            count += 1
            logger.info(f"Deleted simulation result: {filepath}")
    return count

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
