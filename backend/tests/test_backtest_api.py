import pytest
import json
import os
from unittest.mock import patch, MagicMock
from app import app
from src.results_storage import (
    save_simulation_result,
    get_simulation_result_by_timestamp,
    update_simulation_result,
    archive_simulation_result,
    delete_simulation_result
)

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_backtest_result():
    return {
        "timestamp": 1617235200,
        "params": {
            "symbol": "BTCUSDT",
            "interval": "1h",
            "initial_capital": 10000,
            "risk_percent": 1.0,
            "strategy_type": "momentum",
            "box_params": {
                "rsi_length": 14,
                "macd_fast": 12,
                "macd_slow": 26,
                "macd_signal": 9
            }
        },
        "orders": [
            {
                "time": "2023-01-01T02:00:00.000Z",
                "type": "buy",
                "price": 51000,
                "size": 0.5,
                "profit": 0
            },
            {
                "time": "2023-01-01T05:00:00.000Z",
                "type": "sell",
                "price": 52800,
                "size": 0.5,
                "profit": 900
            }
        ],
        "final_value": 10900,
        "name": "Test Backtest",
        "notes": "This is a test backtest",
        "archived": False
    }

@patch('app.get_simulation_results_paginated')
def test_get_backtests(mock_get_paginated, client):
    # Mock the paginated results
    mock_get_paginated.return_value = ([{
        "timestamp": 1617235200,
        "name": "Test Backtest",
        "params": {"symbol": "BTCUSDT", "interval": "1h"},
        "final_value": 10900,
        "archived": False
    }], 1)

    # Test the API endpoint
    response = client.get('/api/backtests?page=1&per_page=10')
    data = json.loads(response.data)

    # Print response for debugging
    print(f"Response: {data}")

    # Check if the response has the expected structure
    assert response.status_code == 200
    assert data['status'] == 'success'

    # Check if the results list exists
    assert 'data' in data
    assert 'results' in data['data']

    # Check if the pagination info exists
    assert 'pagination' in data['data']
    assert 'total_count' in data['data']['pagination']

@patch('app.get_simulation_result_by_timestamp')
def test_get_backtest(mock_get_result, client, mock_backtest_result):
    # Mock the result
    mock_get_result.return_value = mock_backtest_result

    # Test the API endpoint
    response = client.get('/api/backtests/1617235200')
    data = json.loads(response.data)

    # Print response for debugging
    print(f"Get backtest response: {data}")

    assert response.status_code == 200
    assert data['status'] == 'success'
    assert 'data' in data
    assert data['data']['timestamp'] == 1617235200
    assert data['data']['name'] == "Test Backtest"

@patch('app.get_simulation_result_by_timestamp')
def test_get_backtest_not_found(mock_get_result, client):
    # Mock the result not found
    mock_get_result.return_value = None

    # Test the API endpoint
    response = client.get('/api/backtests/1234567890')
    data = json.loads(response.data)

    # Print response for debugging
    print(f"Get backtest not found response: {data}")

    assert response.status_code == 404
    assert data['status'] == 'error'

@patch('app.update_simulation_result')
def test_update_backtest(mock_update, client):
    # Mock the update function
    mock_update.return_value = True

    # Test the API endpoint
    response = client.patch(
        '/api/backtests/1617235200',
        json={"name": "Updated Name", "notes": "Updated notes"}
    )
    data = json.loads(response.data)

    # Print response for debugging
    print(f"Update backtest response: {data}")

    assert response.status_code == 200
    assert data['status'] == 'success'
    mock_update.assert_called_once_with('1617235200', 'Updated Name', 'Updated notes')

@patch('app.update_simulation_result')
def test_update_backtest_not_found(mock_update, client):
    # Mock the update function returning False (not found)
    mock_update.return_value = False

    # Test the API endpoint
    response = client.patch(
        '/api/backtests/1234567890',
        json={"name": "Updated Name"}
    )
    data = json.loads(response.data)

    # Print response for debugging
    print(f"Update backtest not found response: {data}")

    assert response.status_code == 404
    assert data['status'] == 'error'

@patch('app.archive_simulation_result')
def test_archive_backtest(mock_archive, client):
    # Mock the archive function
    mock_archive.return_value = True

    # Test the API endpoint
    response = client.post('/api/backtests/1617235200/archive')
    data = json.loads(response.data)

    # Print response for debugging
    print(f"Archive backtest response: {data}")

    assert response.status_code == 200
    assert data['status'] == 'success'
    mock_archive.assert_called_once_with('1617235200')

@patch('app.unarchive_simulation_result')
def test_unarchive_backtest(mock_unarchive, client):
    # Mock the unarchive function
    mock_unarchive.return_value = True

    # Test the API endpoint
    response = client.post('/api/backtests/1617235200/unarchive')
    data = json.loads(response.data)

    # Print response for debugging
    print(f"Unarchive backtest response: {data}")

    assert response.status_code == 200
    assert data['status'] == 'success'
    mock_unarchive.assert_called_once_with('1617235200')

@patch('app.delete_simulation_result')
def test_delete_backtest(mock_delete, client):
    # Mock the delete function
    mock_delete.return_value = True

    # Test the API endpoint
    response = client.delete('/api/backtests/1617235200')
    data = json.loads(response.data)

    # Print response for debugging
    print(f"Delete backtest response: {data}")

    assert response.status_code == 200
    assert data['status'] == 'success'
    mock_delete.assert_called_once_with('1617235200')
