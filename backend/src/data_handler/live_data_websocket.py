# src/data_handler/live_data_websocket.py
import websocket
import time
import json
import threading
from config import logger
from .base_data_handler import BaseDataHandler
import PushDataV3ApiWrapper_pb2

class LiveDataWebSocketHandler:
    """
    A class to handle live data from cryptocurrency exchange WebSocket APIs.
    Currently configured for MEXC, but can be extended for other exchanges.
    """

    def __init__(self, symbols, on_message_callback=None):
        self.symbols = symbols
        self.data_handler = BaseDataHandler()
        self.ws = None
        self.on_message_callback = on_message_callback
        self.keep_running = True  # We'll use this to stop the ping thread gracefully if needed

    def on_message(self, ws, raw):
        if isinstance(raw, bytes):
            # Protobuf decode
            wrapper = PushDataV3ApiWrapper_pb2.PushDataV3ApiWrapper()
            wrapper.ParseFromString(raw)
            # Check for kline field
            if wrapper.HasField("publicSpotKline"):
                kline = wrapper.publicSpotKline
                # # For each Kline in the repeated field
                # logger.info(
                #     "Got Kline: start=%s open=%s high=%s low=%s close=%s vol=%s",
                #     kline.windowStart,
                #     kline.openingPrice,
                #     kline.highestPrice,
                #     kline.lowestPrice,
                #     kline.closingPrice,
                #     kline.volume
                # ) # For debugging purposes
                # Call the on_message_callback function if it exists
                if self.on_message_callback:
                    self.on_message_callback(kline)
            else:
                logger.debug("Kline field not present in this message: channel=%s symbol=%s",
                            wrapper.channel, wrapper.symbol)
        else:
            # Possibly JSON text or an ack from SUBSCRIPTION
            logger.info("Received text: %s", raw)


    def on_error(self, ws, error):
        logger.error("WebSocket error: %s", error)

    def on_close(self, ws, *args, **kwargs):
        logger.info("WebSocket closed")

    def on_open(self, ws):
        logger.info("WebSocket connection opened")

        for symbol in self.symbols:
            symbol_no_slash = symbol.replace("/", "").upper()  # e.g. BTC/USDT -> BTCUSDT
            channel_str = f"spot@public.kline.v3.api.pb@{symbol_no_slash}@Min15"
            subscribe_message = {
                "method": "SUBSCRIPTION",
                "params": [channel_str],
                "id": 1
            }
            ws.send(json.dumps(subscribe_message))
            logger.info("Sent subscribe: %s", subscribe_message)

    def keep_alive_ping(self, ws):
        while self.keep_running:
            time.sleep(30)
            ping_msg = {"method": "PING"}
            try:
                ws.send(json.dumps(ping_msg))
                logger.debug("Sent PING")
            except Exception as e:
                logger.error("Ping failed: %s", e)
                break

    def run(self):
        """
        Start the WebSocket connection.
        """
        # Currently hardcoded for MEXC, but could be made configurable based on exchange
        # TODO: Make this configurable based on the selected exchange
        from config import EXCHANGE_NAME
        ws_url = "wss://wbs-api.mexc.com/ws"  # Default for MEXC
        self.ws = websocket.WebSocketApp(
            ws_url,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close
        )
        self.ws.on_open = self.on_open
        self.ws.run_forever()

    def stop(self):
        """
        Stop the WebSocket connection and terminate ping thread.
        """
        self.keep_running = False
        if self.ws:
            self.ws.close()
            logger.info("WebSocket connection stopped")

