# /src/results_storage.py
import os
import json
import time
import shutil
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd


from config import logger, RESULTS_DIR

# Define archive directory
ARCHIVE_DIR = os.path.join(os.path.dirname(RESULTS_DIR), 'archived_results')

# Create archive directory if it doesn't exist
if not os.path.exists(ARCHIVE_DIR):
    os.makedirs(ARCHIVE_DIR)

if not os.path.exists(RESULTS_DIR):
    os.makedirs(RESULTS_DIR)

def save_simulation_result(
    params: Dict[str, Any],
    orders: List[Dict[str, Any]],
    final_value: float,
    candle_data: Optional[pd.DataFrame] = None,
    name: Optional[str] = None,
    notes: Optional[str] = None
) -> str:

    result = {
        "timestamp": int(time.time()),
        "params": params,
        "orders": orders,
        "final_value": final_value,
        "metrics": params.get("metrics", {}),
        "name": name or f"{params.get('symbol', 'Unknown')} - {params.get('interval', '1h')}",
        "notes": notes or "",
        "archived": False
    }


    # Convert candle_data to JSON
    if candle_data is not None and not candle_data.empty:
        if "time" in candle_data.columns:
            if pd.api.types.is_datetime64_any_dtype(candle_data["time"]):
                candle_data["time"] = candle_data["time"].dt.strftime("%Y-%m-%d %H:%M:%S")
        result["candles"] = candle_data.to_dict(orient="records")

    # Store initial and final equity values
    result["equity"] = {
        "initial": params.get("initial_capital", 10000),
        "final": final_value
    }



    filename = os.path.join(RESULTS_DIR, f"simulation_{result['timestamp']}.json")
    with open(filename, 'w') as f:
        json.dump(result, f, indent=4, default=str)

    logger.info("Saved simulation result to: %s", filename)
    return filename

def get_all_simulation_results(include_archived: bool = False) -> List[Dict[str, Any]]:
    """
    Retrieve all simulation results stored in JSON files.
    Returns a list of simulation results sorted by timestamp (descending).

    :param include_archived: Whether to include archived results
    :return: List of simulation results
    """
    results = []

    # Get results from main directory
    for filename in os.listdir(RESULTS_DIR):
        if filename.endswith(".json"):
            filepath = os.path.join(RESULTS_DIR, filename)
            with open(filepath, 'r') as f:
                try:
                    result = json.load(f)
                    result["archived"] = False  # Ensure this flag is set
                    results.append(result)
                except json.JSONDecodeError:
                    logger.error("Error decoding JSON in file: %s", filename)

    # Get archived results if requested
    if include_archived and os.path.exists(ARCHIVE_DIR):
        for filename in os.listdir(ARCHIVE_DIR):
            if filename.endswith(".json"):
                filepath = os.path.join(ARCHIVE_DIR, filename)
                with open(filepath, 'r') as f:
                    try:
                        result = json.load(f)
                        result["archived"] = True  # Ensure this flag is set
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
    # Check main directory first
    filepath = os.path.join(RESULTS_DIR, f"simulation_{ts}.json")
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            result = json.load(f)
            result["archived"] = False
            return result

    # Check archive directory
    archive_filepath = os.path.join(ARCHIVE_DIR, f"simulation_{ts}.json")
    if os.path.exists(archive_filepath):
        with open(archive_filepath, 'r') as f:
            result = json.load(f)
            result["archived"] = True
            return result

    return None

def update_simulation_result(ts: str, name: Optional[str] = None, notes: Optional[str] = None) -> bool:
    """
    Update a simulation result's name and/or notes.

    :param ts: The timestamp string of the result to update.
    :param name: New name for the backtest (optional).
    :param notes: New notes for the backtest (optional).
    :return: True if update was successful, False if file didn't exist.
    """
    # Determine if the result is in the main or archive directory
    filepath = os.path.join(RESULTS_DIR, f"simulation_{ts}.json")
    is_archived = False

    if not os.path.exists(filepath):
        filepath = os.path.join(ARCHIVE_DIR, f"simulation_{ts}.json")
        is_archived = True
        if not os.path.exists(filepath):
            return False

    # Load the result
    with open(filepath, 'r') as f:
        result = json.load(f)

    # Update fields
    if name is not None:
        result["name"] = name
    if notes is not None:
        result["notes"] = notes

    # Save the updated result
    with open(filepath, 'w') as f:
        json.dump(result, f, indent=4, default=str)

    logger.info(f"Updated simulation result: {filepath}")
    return True

def archive_simulation_result(ts: str) -> bool:
    """
    Archive a simulation result by moving it to the archive directory.

    :param ts: The timestamp string of the result to archive.
    :return: True if archiving was successful, False if file didn't exist.
    """
    source_path = os.path.join(RESULTS_DIR, f"simulation_{ts}.json")
    if not os.path.exists(source_path):
        return False

    # Load the result to update the archived flag
    with open(source_path, 'r') as f:
        result = json.load(f)

    result["archived"] = True

    # Save to archive directory
    dest_path = os.path.join(ARCHIVE_DIR, f"simulation_{ts}.json")
    with open(dest_path, 'w') as f:
        json.dump(result, f, indent=4, default=str)

    # Remove from main directory
    os.remove(source_path)

    logger.info(f"Archived simulation result: {source_path} -> {dest_path}")
    return True

def unarchive_simulation_result(ts: str) -> bool:
    """
    Unarchive a simulation result by moving it back to the main directory.

    :param ts: The timestamp string of the result to unarchive.
    :return: True if unarchiving was successful, False if file didn't exist.
    """
    source_path = os.path.join(ARCHIVE_DIR, f"simulation_{ts}.json")
    if not os.path.exists(source_path):
        return False

    # Load the result to update the archived flag
    with open(source_path, 'r') as f:
        result = json.load(f)

    result["archived"] = False

    # Save to main directory
    dest_path = os.path.join(RESULTS_DIR, f"simulation_{ts}.json")
    with open(dest_path, 'w') as f:
        json.dump(result, f, indent=4, default=str)

    # Remove from archive directory
    os.remove(source_path)

    logger.info(f"Unarchived simulation result: {source_path} -> {dest_path}")
    return True

def get_simulation_results_paginated(page: int = 1, per_page: int = 10, include_archived: bool = False,
                                    sort_by: str = "timestamp", sort_order: str = "desc") -> Tuple[List[Dict[str, Any]], int]:
    """
    Get paginated simulation results with sorting options.

    :param page: Page number (1-indexed)
    :param per_page: Number of results per page
    :param include_archived: Whether to include archived results
    :param sort_by: Field to sort by (timestamp, name, symbol, profit)
    :param sort_order: Sort order (asc or desc)
    :return: Tuple of (list of results for the page, total count of results)
    """
    # Get all results
    all_results = get_all_simulation_results(include_archived)
    total_count = len(all_results)

    # Define sort key function
    def get_sort_key(result):
        if sort_by == "timestamp":
            return result.get("timestamp", 0)
        elif sort_by == "name":
            return result.get("name", "")
        elif sort_by == "symbol":
            return result.get("params", {}).get("symbol", "")
        elif sort_by == "profit":
            initial = result.get("equity", {}).get("initial", 0)
            final = result.get("equity", {}).get("final", 0)
            return (final - initial) / initial if initial else 0
        else:
            return result.get("timestamp", 0)

    # Sort results
    reverse = sort_order.lower() == "desc"
    sorted_results = sorted(all_results, key=get_sort_key, reverse=reverse)

    # Paginate
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_results = sorted_results[start_idx:end_idx]

    return paginated_results, total_count
