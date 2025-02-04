import pytest
import ccxt
from src.api_integration import MEXCExchange

# Using pytest fixtures for cleaner test setup.
@pytest.fixture
def mexc_instance(mocker):
    api_key = "test_key"
    api_secret = "test_secret"
    # Patch the ccxt.mexc class to return a mock object.
    exchange_mock = mocker.patch('ccxt.mexc')
    instance = MEXCExchange(api_key, api_secret)
    return instance, exchange_mock.return_value

def test_fetch_ticker(mexc_instance):
    mexc, exchange_instance = mexc_instance
    ticker_data = {'last': 50000}
    exchange_instance.fetch_ticker.return_value = ticker_data
    symbol = 'BTC/USDT'
    
    ticker = mexc.fetch_ticker(symbol)
    
    exchange_instance.fetch_ticker.assert_called_once_with(symbol)
    assert ticker is not None
    assert 'last' in ticker

def test_create_valid_limit_order(mexc_instance):
    mexc, exchange_instance = mexc_instance
    test_order = {"id": "123", "status": "open"}
    exchange_instance.create_limit_order.return_value = test_order

    result = mexc.create_order("BTC/USDT", "limit", "buy", 0.1, 50000.0)
    
    exchange_instance.create_limit_order.assert_called_once_with("BTC/USDT", "buy", 0.1, 50000.0)
    assert result == test_order

def test_create_valid_market_order(mexc_instance):
    mexc, exchange_instance = mexc_instance
    test_order = {"id": "456", "status": "closed"}
    exchange_instance.create_market_order.return_value = test_order

    result = mexc.create_order("ETH/USDT", "market", "sell", 1.0)
    
    exchange_instance.create_market_order.assert_called_once_with("ETH/USDT", "sell", 1.0)
    assert result == test_order

def test_create_order_invalid_type(mexc_instance):
    mexc, exchange_instance = mexc_instance
    # Force an exception when attempting to create a limit order (simulate invalid type).
    exchange_instance.create_limit_order.side_effect = Exception("Invalid order type")

    result = mexc.create_order("BTC/USDT", "invalid_type", "buy", 0.1, 50000.0)
    assert result is None

def test_create_order_with_none_values(mexc_instance):
    mexc, _ = mexc_instance
    result = mexc.create_order(None, None, None, None, None)
    assert result is None

def test_get_open_orders_success(mexc_instance):
    mexc, exchange_instance = mexc_instance
    mock_orders = [
        {'id': '1', 'symbol': 'BTC/USDT', 'side': 'buy'},
        {'id': '2', 'symbol': 'BTC/USDT', 'side': 'sell'}
    ]
    exchange_instance.fetch_open_orders.return_value = mock_orders
    
    result = mexc.get_open_orders('BTC/USDT')
    
    exchange_instance.fetch_open_orders.assert_called_once_with('BTC/USDT')
    assert result == mock_orders

def test_get_open_orders_invalid_symbol(mexc_instance):
    mexc, exchange_instance = mexc_instance
    # Simulate a BadSymbol exception when using an invalid symbol.
    exchange_instance.fetch_open_orders.side_effect = ccxt.BadSymbol("Invalid symbol")
    
    result = mexc.get_open_orders('INVALID/PAIR')
    
    exchange_instance.fetch_open_orders.assert_called_once_with('INVALID/PAIR')
    assert result == []

def test_cancel_order_success(mexc_instance):
    mexc, exchange_instance = mexc_instance
    exchange_instance.cancel_order.return_value = {'id': '123456', 'status': 'canceled'}
    
    result = mexc.cancel_order('123456', 'BTC/USDT')
    
    exchange_instance.cancel_order.assert_called_once_with('123456', 'BTC/USDT')
    assert result['id'] == '123456'
    assert result['status'] == 'canceled'

def test_cancel_nonexistent_order(mexc_instance):
    mexc, exchange_instance = mexc_instance
    # Simulate an OrderNotFound exception for a non-existent order.
    exchange_instance.cancel_order.side_effect = ccxt.OrderNotFound("Order not found")
    
    result = mexc.cancel_order('invalid_id', 'BTC/USDT')
    
    exchange_instance.cancel_order.assert_called_once_with('invalid_id', 'BTC/USDT')
    assert result is None
