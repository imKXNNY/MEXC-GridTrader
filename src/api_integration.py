import ccxt
import logging
from typing import Optional, Dict, Any

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
            })
            logger.info("Using ccxt for API integration.")

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

        :param symbol: Trading pair (e.g., 'BTC/USDT').
        :param order_type: 'limit' or 'market'.
        :param side: 'BUY' or 'SELL'.
        :param amount: Order amount (in quote or base currency depending on the order type).
        :param price: Price for limit orders.
        :param test: If True, uses the test order endpoint (if available).
        :return: The created order or None if an error occurred.
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

        :param order_id: The ID of the order to cancel.
        :param symbol: The trading pair symbol.
        :return: The cancellation result or None if an error occurred.
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

        :param symbol: The trading pair symbol.
        :return: A list of open orders, or an empty list on error.
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

        :param symbol: The trading pair symbol.
        :return: The ticker data or None if an error occurred.
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
