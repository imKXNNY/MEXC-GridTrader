import ccxt
import logging
from typing import Optional, Dict, Any
import datetime

# Attempt to import the official MEXC SDK.
try:
    from mexc_sdk import Spot  # Official SDK uses Spot class
except ImportError:
    Spot = None

from config import API_KEY, API_SECRET, USE_SDK, logger

class MEXCExchange:
    """
    A wrapper for the MEXC API, allowing order creation, cancellation,
    and retrieval of account/trading data via either ccxt or the official SDK.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_secret: Optional[str] = None,
        use_sdk: bool = USE_SDK
    ):
        """
        Initialize the API integration.

        :param api_key: Your MEXC API key (defaults to env var if not provided).
        :param api_secret: Your MEXC API secret (defaults to env var if not provided).
        :param use_sdk: If True and the official MEXC SDK is available, use it; else use ccxt.
        """
        self.api_key = api_key or API_KEY
        self.api_secret = api_secret or API_SECRET
        self.use_sdk = use_sdk and (Spot is not None)

        if self.use_sdk:
            self.client = Spot(api_key=self.api_key, api_secret=self.api_secret)
            logger.info("Using the official MEXC SDK for API integration.")
        else:
            self.client = ccxt.mexc({
                'apiKey': self.api_key,
                'secret': self.api_secret,
                'enableRateLimit': True,
                'options': {
                    'adjustForTimeDifference': True,
                },
            })
            logger.info(f"Using ccxt for API integration")

    def create_order(
        self,
        symbol: str,
        order_type: str,
        side: str,
        amount: float,
        price: Optional[float] = None,
        test: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Create an order (limit or market) for the given symbol.
        """
        if not symbol or not order_type or not side or not amount:
            logger.error("Missing required parameters for order creation: symbol=%s, order_type=%s, side=%s, amount=%s",
                         symbol, order_type, side, amount)
            return None

        try:
            order_type_lower = order_type.lower()
            side_upper = side.upper()

            if self.use_sdk:
                # Using official MEXC SDK
                if order_type_lower == 'limit':
                    if price is None:
                        raise ValueError("Price must be provided for limit orders.")
                    options = {"quantity": amount, "price": price}
                elif order_type_lower == 'market':
                    options = {"quantity": amount}
                else:
                    raise ValueError(f"Unsupported order type: {order_type}")

                if test:
                    order = self.client.new_order_test(symbol, side_upper, order_type.upper(), options)
                else:
                    order = self.client.new_order(symbol, side_upper, order_type.upper(), options)

            else:
                # Using ccxt
                side_lower = side.lower()
                if order_type_lower == 'limit':
                    if price is None:
                        raise ValueError("Price must be provided for limit orders.")
                    order = self.client.create_limit_order(symbol, side_lower, amount, price)
                elif order_type_lower == 'market':
                    order = self.client.create_market_order(symbol, side_lower, amount)
                else:
                    raise ValueError(f"Unsupported order type: {order_type}")

            return order
        except Exception as e:
            logger.error("Error creating %s %s order at %s: %s", order_type, side, price, e)
            return None

    def cancel_order(self, order_id: str, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Cancel an order by its ID.
        """
        if not order_id or not symbol:
            logger.error("Missing required parameters for order cancellation.")
            return None
        try:
            if self.use_sdk:
                options = {"orderId": order_id}
                result = self.client.cancelOrder(symbol, options)
            else:
                result = self.client.cancel_order(order_id, symbol)
            return result
        except Exception as e:
            logger.error("Error canceling order %s: %s", order_id, e)
            return None

    def get_open_orders(self, symbol: str) -> list:
        """
        Retrieve all open orders for a given trading symbol.
        """
        if not symbol:
            logger.error("Missing symbol for fetching open orders.")
            return []
        try:
            if self.use_sdk:
                orders = self.client.openOrders(symbol)
            else:
                orders = self.client.fetch_open_orders(symbol)
            return orders
        except Exception as e:
            logger.error("Error fetching open orders: %s", e)
            return []

    def fetch_ticker(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Fetch the latest ticker data for a given symbol.
        """
        if not symbol:
            logger.error("Missing symbol for fetching ticker.")
            return None
        try:
            if self.use_sdk:
                ticker = self.client.tickerPrice(symbol)
            else:
                ticker = self.client.fetch_ticker(symbol)
            return ticker
        except Exception as e:
            logger.error("Error fetching ticker: %s", e)
            return None

    def get_account_info(self) -> Dict[str, Any]:
        """Get formatted account information with enhanced error handling"""
        try:
            if self.use_sdk:
                # Assuming the SDK provides an 'account_info' method.
                account = self.client.accountInfo()
                if not account or 'USDT' not in account:
                    raise ValueError("USDT balance not found in account data (SDK response).")
                usdt_info = account['USDT']
                free = usdt_info.get('free', 0)
                used = usdt_info.get('used', 0)
                total = usdt_info.get('total', 0)
            else:
                account = self.client.fetchBalance()
                print(account)
                # ccxt returns a dict with keys 'free', 'used', and 'total'
                if not account or 'free' not in account or 'USDT' not in account['free']:
                    raise ValueError("USDT balance not found in account data (ccxt response).")
                free = account['free']['USDT']
                used = account['used']['USDT']
                total = account['total']['USDT']

            return {
                "balances": {
                    "USDT": {
                        "free": float(free),
                        "used": float(used),
                        "total": float(total)
                    }
                },
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        except ccxt.NetworkError as e:
            logger.error("Network error: %s", e)
            raise
        except ccxt.ExchangeError as e:
            logger.error("Exchange error: %s", e)
            raise
        except Exception as e:
            logger.error("Unexpected error: %s", e)
            raise
