
import logging
import os
import threading
import markdown2
from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
from queue import Queue
import json
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("Starting the Flask app...")

import plotly
import plotly.graph_objs as go
import pandas as pd

from config import logger
from src.grid_backtester import GridBacktester
from src.results_storage import (
    save_simulation_result,
    get_all_simulation_results,
    get_simulation_result_by_timestamp,
    delete_simulation_result,
    delete_all_simulation_results,
    update_simulation_result,
    archive_simulation_result,
    unarchive_simulation_result,
    get_simulation_results_paginated
)

from src.api_integration import ExchangeAPI

app = Flask(__name__, static_folder='assets')
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

APP_VERSION = "1.0.0"

# Initialize a queue to hold live data
live_data_queue = Queue()
strategy_events_queue = Queue()
trading_client = None

@app.route('/sse')
def sse():
    def generate():
        global trading_client

        # 1) If we have a trading_client, push historical data first (unchanged)
        if trading_client is not None:
            while not trading_client.historical_data_queue.empty():
                historical_chunk = trading_client.historical_data_queue.get()
                payload = {"historical": historical_chunk}
                yield f"data: {json.dumps(payload)}\n\n"

        # 2) Next, continuously poll both live_data_queue (candles)
        #    and strategy_events_queue (orders, trades).
        while True:
            # 2a) Candle updates
            if not live_data_queue.empty():
                new_candle = live_data_queue.get()
                yield f"data: {json.dumps(new_candle)}\n\n"

            # 2b) Strategy events
            if not strategy_events_queue.empty():
                new_event = strategy_events_queue.get()
                # We can prefix an attribute like "strategy" to differentiate from candle data
                payload = {"strategy": new_event}
                yield f"data: {json.dumps(payload)}\n\n"

            time.sleep(1)

    return Response(generate(), mimetype='text/event-stream')

@app.route('/stop_stream', methods=['POST'])
def stop_stream():
    if trading_client != None:
        trading_client.stop()
        logger.info("Stopping the live trading stream.")
        # Implement any necessary cleanup here
        return jsonify({"status": "success", "message": "Stream stopped."})
    else:
        return jsonify({"status": "error", "message": "No live trading stream running."}), 400

# ================================= #
# Helper Functions                  #
# ================================= #
def create_orders_chart(orders, df_price):
    fig = go.Figure()
    if not df_price.empty:
        # 1) Candlestick trace
        fig.add_trace(go.Candlestick(
            x=df_price['time'],
            open=df_price['open'],
            high=df_price['high'],
            low=df_price['low'],
            close=df_price['close'],
            name='OHLC'
        ))

    # 2) Buy/Sell markers
    buy_x, buy_y = [], []
    sell_x, sell_y = [], []
    for order in orders:
        if order['type'].startswith('buy'):
            buy_x.append(order['time'])
            buy_y.append(order['price'])
        elif order['type'].startswith('sell'):
            sell_x.append(order['time'])
            sell_y.append(order['price'])

    if buy_x:
        fig.add_trace(go.Scatter(
            x=buy_x,
            y=buy_y,
            mode='markers',
            marker=dict(color='green', symbol='triangle-up', size=10),
            name='Buys'
        ))
    if sell_x:
        fig.add_trace(go.Scatter(
            x=sell_x,
            y=sell_y,
            mode='markers',
            marker=dict(color='red', symbol='triangle-down', size=10),
            name='Sells'
        ))

    fig.update_layout(
        title="Price & Trade Orders",
        xaxis_title="Time",
        yaxis_title="Price",
        hovermode='x',
        xaxis_rangeslider_visible=False
    )
    return plotly.offline.plot(fig, output_type="div")

# =================================================== #
# Web routes (FOR FLASK FRONTEND / STATIC TEMPLATE)   #
# =================================================== #
@app.route('/', methods=['GET', 'POST'])
def dashboard():
    if request.method == 'POST':
        try:
            symbol          = request.form['symbol']
            interval        = request.form['interval']
            initial_capital = float(request.form['initial_capital'])
            risk_percent    = float(request.form['risk_percent'])

            # Additional fields from the 'Box Strategy' approach
            rsi_length      = int(request.form.get('rsi_length', 14))
            rsi_threshold   = int(request.form.get('rsi_threshold', 50))
            use_stricter_rsi= ('use_stricter_rsi' in request.form)

            macd_fast       = int(request.form.get('macd_fast', 14))
            macd_slow       = int(request.form.get('macd_slow', 28))
            macd_signal     = int(request.form.get('macd_signal', 9))
            macd_above      = ('macd_above_signal' in request.form)

            use_atr_stops   = ('use_atr_stops' in request.form)
            atr_period      = int(request.form.get('atr_period', 14))
            atr_multiplier  = float(request.form.get('atr_multiplier', 2.0))

            partial_exits   = ('use_partial_exits' in request.form)
            partial_pct     = float(request.form.get('partial_pct', 10.0))
            partial_atr_mult= float(request.form.get('partial_atr_mult', 10.0))
            final_atr_mult  = float(request.form.get('final_atr_mult', 15.0))

            # Example of including cooldown or bars_back (if you want them):
            use_cooldown       = ('use_cooldown' in request.form)
            cooldown_bars      = int(request.form.get('cooldown_bars', 1))
            use_next_bar_conf  = ('use_next_bar_confirm' in request.form)
            bars_back_val      = int(request.form.get('bars_back', 500))

        except (KeyError, ValueError) as e:
            logger.error("Invalid form input: %s", e)
            return "Invalid input. Please go back and check your form data.", 400

        box_params = {
            'rsi_length': rsi_length,
            'rsi_threshold': rsi_threshold,
            'use_stricter_rsi': use_stricter_rsi,
            'macd_fast': macd_fast,
            'macd_slow': macd_slow,
            'macd_signal': macd_signal,
            'macd_above_signal': macd_above,
            'use_atr_stops': use_atr_stops,
            'atr_period': atr_period,
            'atr_multiplier': atr_multiplier,
            'partial_exit': partial_exits,
            'partial_pct': partial_pct,
            'partial_atr_mult': partial_atr_mult,
            'final_atr_mult': final_atr_mult,
            'use_cooldown': use_cooldown,
            'cooldown_bars': cooldown_bars,
            'use_next_bar_confirm': use_next_bar_conf,
            'bars_back': bars_back_val
        }

        backtester = GridBacktester(
            symbol=symbol,
            interval=interval,
            # percent_range=0.01,  # Removed this line
            initial_capital=initial_capital,
            risk_percent=risk_percent,
            # Removed this line
            box_params=box_params
        )

        backtester.fetch_and_store_data()
        orders, final_value = backtester.simulate()


        df_candles = backtester.get_stored_data(symbol)


        # If “time” is the index, move it back to a column
        if df_candles.index.name == 'time':
            df_candles.reset_index(inplace=True)

        params = {
            "symbol": symbol,
            "interval": interval,
            "initial_capital": initial_capital,
            "risk_percent": risk_percent
        }
        filename = save_simulation_result(params, orders, final_value, df_candles)


        logger.info("Backtest done, result: %s", filename)

    all_results = get_all_simulation_results()
    return render_template('pages/dashboard.html', results=all_results, app_version=APP_VERSION)

@app.route('/view/<int:timestamp>')
def view_result(timestamp):
    result = get_simulation_result_by_timestamp(str(timestamp))
    if not result:
        return f"No results found for timestamp {timestamp}.", 404

    orders = result.get("orders", [])
    metrics = result.get("metrics", {})

    candle_list = result.get("candles", [])

    df_price = pd.DataFrame(candle_list)
    df_price = pd.DataFrame(candle_list)

    if not df_price.empty and 'time' in df_price.columns:
        df_price['time'] = pd.to_datetime(df_price['time'], errors='coerce')

    # Ensure required columns exist
    if not df_price.empty:
        # Rename columns if needed
        if 'timestamp' in df_price.columns and 'time' not in df_price.columns:
            df_price.rename(columns={'timestamp': 'time'}, inplace=True)

        # Create time column if missing
        if 'time' not in df_price.columns:
            df_price['time'] = pd.to_datetime(df_price.index, errors='coerce')

        # Convert time column to datetime
        df_price['time'] = df_price['time'].apply(
            lambda x: x if isinstance(x, pd.Timestamp) else pd.to_datetime(str(x), errors='coerce')
        )

    orders_chart_html = create_orders_chart(orders, df_price)

    return render_template(
        "pages/result_detail.html",
        result=result,
        metrics=metrics,
        orders_chart_html=orders_chart_html
    )

@app.route('/docs')
def docs_index():
    """Show index of available documentation"""
    docs_dir = 'docs'
    doc_files = [f for f in os.listdir(docs_dir) if f.endswith('.md')]

    # Define document metadata
    docs = [
        {'name': 'CHANGELOG', 'title': 'Changelog', 'description': 'Version history and release notes'},
        {'name': 'ROADMAP', 'title': 'Roadmap', 'description': 'Future development plans'},
        {'name': 'STRATEGY', 'title': 'Strategy', 'description': 'Trading strategy documentation'},
        {'name': 'TODO', 'title': 'Todo', 'description': 'Pending tasks and enhancements'}
    ]

    # Filter to only show docs that exist
    existing_docs = [doc for doc in docs if f"{doc['name']}.md" in doc_files]

    return render_template('pages/docs_viewer.html',
                           doc_name='Documentation Index',
                           doc_content=render_template('partials/_docs_index.html',
                                                        docs=existing_docs))

@app.route('/docs/<doc_name>')
def view_doc(doc_name):
    """Render a markdown documentation file"""
    doc_path = os.path.join('docs', f'{doc_name}.md')
    if not os.path.exists(doc_path):
        return f"Document {doc_name} not found", 404

    with open(doc_path, 'r') as f:
        markdown_content = f.read()

    html_content = markdown2.markdown(markdown_content)
    return render_template('pages/docs_viewer.html',
                           doc_name=doc_name,
                           doc_content=html_content)

@app.route('/delete_result/<timestamp>', methods=['DELETE'])
def delete_result(timestamp):
    """Delete a specific simulation result by timestamp"""
    success = delete_simulation_result(timestamp)
    if success:
        return jsonify({"status": "success", "message": f"Deleted result {timestamp}"})
    return jsonify({"status": "error", "message": f"Result {timestamp} not found"}), 404

@app.route('/delete_all_results', methods=['DELETE'])
def delete_all_results():
    """Delete all simulation results"""
    count = delete_all_simulation_results()
    return jsonify({"status": "success", "message": f"Deleted {count} results"})

@app.route('/account_info')
def account_info():
    try:
        api = ExchangeAPI()
        return jsonify(api.get_account_info())
    except Exception as e:
        logger.error("Account info error: %s", e)
        return jsonify({"error": "Failed to fetch account info"}), 500

@app.route('/live_paper_trade')
def live_paper_trade():
    from src.live_paper_trading import LivePaperTrading
    from src.trading_strategy import StochasticMeanReversion
    import threading

    # Grab symbol from GET param; default to BTC/USDT if not provided
    symbol = request.args.get('symbol', 'BTCUSDT')

    # Create the paper trader with your MomentumTrendStrategy
    paper_trader = LivePaperTrading([symbol], live_data_queue=live_data_queue, strategy_events_queue=strategy_events_queue, strategy=StochasticMeanReversion)
    global trading_client
    trading_client = paper_trader

    # Start it in a background thread so it doesn't block Flask
    threading.Thread(target=paper_trader.run, daemon=True).start()

    return render_template('pages/paper_trading.html')

@app.route('/live_paper_trade/ib_strategy')
def live_paper_trade_ib():
    from src.live_paper_trading import LivePaperTrading
    from src.patched_strategy import PatchedIBPriceActionStrategy
    import threading

    # Get parameters from query string
    symbol = request.args.get('symbol', 'BTCUSDT')
    risk_percent = float(request.args.get('risk_percent', 1.0))

    # IB strategy specific parameters
    ib_params = {
        'risk_percent': risk_percent,
        'minInsideBarSize': float(request.args.get('minInsideBarSize', 0.5)),
        'useTrendFilter': request.args.get('useTrendFilter', 'true').lower() == 'true',
        'useVolumeFilter': request.args.get('useVolumeFilter', 'true').lower() == 'true',
        'volMultiplier': float(request.args.get('volMultiplier', 1.1)),
        'useATRTP': request.args.get('useATRTP', 'true').lower() == 'true',
        'atrLength': int(request.args.get('atrLength', 14)),
        'atrMult': float(request.args.get('atrMult', 1.5)),
        'rr_ratio': float(request.args.get('rr_ratio', 2.5))
    }

    # Create paper trader with patched IB strategy
    paper_trader = LivePaperTrading(
        [symbol],
        live_data_queue=live_data_queue,
        strategy_events_queue=strategy_events_queue,
        strategy=PatchedIBPriceActionStrategy,
        strategy_params=ib_params
    )

    global trading_client
    trading_client = paper_trader

    # Start in background thread
    threading.Thread(target=paper_trader.run, daemon=True).start()

    return render_template('pages/paper_trading.html')

# ================================= #
# API routes (FOR REACT FRONTEND)   #
# ================================= #

@app.route('/api/backtests', methods=['GET'])
def api_get_backtests():
    """Get paginated backtest results with sorting options"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        include_archived = request.args.get('include_archived', 'false').lower() == 'true'
        sort_by = request.args.get('sort_by', 'timestamp')
        sort_order = request.args.get('sort_order', 'desc')

        # Get paginated results
        results, total_count = get_simulation_results_paginated(
            page=page,
            per_page=per_page,
            include_archived=include_archived,
            sort_by=sort_by,
            sort_order=sort_order
        )

        return jsonify({
            'status': 'success',
            'data': {
                'results': results,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total_count': total_count,
                    'total_pages': (total_count + per_page - 1) // per_page
                }
            }
        })
    except Exception as e:
        logger.error(f"Error getting backtests: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/backtests/<timestamp>', methods=['GET'])
def api_get_backtest(timestamp):
    """Get a specific backtest result"""
    try:
        result = get_simulation_result_by_timestamp(timestamp)
        if result:
            return jsonify({
                'status': 'success',
                'data': result
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f"Backtest with timestamp {timestamp} not found"
            }), 404
    except Exception as e:
        logger.error(f"Error getting backtest {timestamp}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/backtests/<timestamp>', methods=['PATCH'])
def api_update_backtest(timestamp):
    """Update a backtest's name and/or notes"""
    try:
        data = request.json
        name = data.get('name')
        notes = data.get('notes')

        if not name and not notes:
            return jsonify({
                'status': 'error',
                'message': "At least one of 'name' or 'notes' must be provided"
            }), 400

        success = update_simulation_result(timestamp, name, notes)
        if success:
            return jsonify({
                'status': 'success',
                'message': f"Backtest {timestamp} updated successfully"
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f"Backtest with timestamp {timestamp} not found"
            }), 404
    except Exception as e:
        logger.error(f"Error updating backtest {timestamp}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/backtests/<timestamp>/archive', methods=['POST'])
def api_archive_backtest(timestamp):
    """Archive a backtest"""
    try:
        success = archive_simulation_result(timestamp)
        if success:
            return jsonify({
                'status': 'success',
                'message': f"Backtest {timestamp} archived successfully"
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f"Backtest with timestamp {timestamp} not found"
            }), 404
    except Exception as e:
        logger.error(f"Error archiving backtest {timestamp}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/backtests/<timestamp>/unarchive', methods=['POST'])
def api_unarchive_backtest(timestamp):
    """Unarchive a backtest"""
    try:
        success = unarchive_simulation_result(timestamp)
        if success:
            return jsonify({
                'status': 'success',
                'message': f"Backtest {timestamp} unarchived successfully"
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f"Backtest with timestamp {timestamp} not found"
            }), 404
    except Exception as e:
        logger.error(f"Error unarchiving backtest {timestamp}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/backtests/<timestamp>', methods=['DELETE'])
def api_delete_backtest(timestamp):
    """Delete a backtest"""
    try:
        success = delete_simulation_result(timestamp)
        if success:
            return jsonify({
                'status': 'success',
                'message': f"Backtest {timestamp} deleted successfully"
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f"Backtest with timestamp {timestamp} not found"
            }), 404
    except Exception as e:
        logger.error(f"Error deleting backtest {timestamp}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
@app.route('/api/simulate', methods=['POST'])
def api_simulate():
    try:
        data = request.json
        symbol = data.get('symbol')
        interval = data.get('interval')
        initial_capital = float(data.get('initial_capital'))
        risk_percent = float(data.get('risk_percent'))
        rsi_length = int(data.get('rsi_length', 14))
        macd_fast = int(data.get('macd_fast', 12))
        macd_slow = int(data.get('macd_slow', 26))
        macd_signal = int(data.get('macd_signal', 9))

        backtester = GridBacktester(
            symbol=symbol,
            interval=interval,
            initial_capital=initial_capital,
            risk_percent=risk_percent,
            strategy_type='momentum',
            box_params={
                'rsi_length': rsi_length,
                'macd_fast': macd_fast,
                'macd_slow': macd_slow,
                'macd_signal': macd_signal
            }
        )

        backtester.fetch_and_store_data()
        orders, final_value, trade_analysis, drawdown_analysis, sharpe_analysis = backtester.simulate()

        # Get optional name and notes
        name = data.get('name')
        notes = data.get('notes')

        # Save the simulation result
        df_candles = backtester.get_stored_data(symbol)
        filename = save_simulation_result(
            params={
                'symbol': symbol,
                'interval': interval,
                'initial_capital': initial_capital,
                'risk_percent': risk_percent,
                'strategy_type': 'momentum',
                'box_params': {
                    'rsi_length': rsi_length,
                    'macd_fast': macd_fast,
                    'macd_slow': macd_slow,
                    'macd_signal': macd_signal
                }
            },
            orders=orders,
            final_value=final_value,
            candle_data=df_candles,
            name=name,
            notes=notes
        )

        # Get the timestamp from the filename
        timestamp = os.path.basename(filename).replace('simulation_', '').replace('.json', '')

        return jsonify({
            'status': 'success',
            'timestamp': timestamp,
            'final_value': final_value,
            'orders': orders,
            'trade_analysis': trade_analysis,
            'drawdown_analysis': drawdown_analysis,
            'sharpe_analysis': sharpe_analysis,
        })
    except Exception as e:
        logger.error(f"API simulation error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/backtest/ib_strategy', methods=['POST'])
def backtest_ib_strategy():
    try:
        # Get parameters from request
        data = request.get_json() or request.form
        symbol = data.get('symbol', 'BTCUSDT')
        interval = data.get('interval', '1h')  # IB strategy typically works better on higher timeframes
        initial_capital = float(data.get('initial_capital', 10000))
        risk_percent = float(data.get('risk_percent', 1.0))

        # IB strategy specific parameters
        ib_params = {
            'minInsideBarSize': float(data.get('minInsideBarSize', 0.5)),
            'useTrendFilter': bool(data.get('useTrendFilter', True)),
            'useVolumeFilter': bool(data.get('useVolumeFilter', True)),
            'volMultiplier': float(data.get('volMultiplier', 1.1)),
            'useATRTP': bool(data.get('useATRTP', True)),
            'atrLength': int(data.get('atrLength', 14)),
            'atrMult': float(data.get('atrMult', 1.5)),
            'rr_ratio': float(data.get('rr_ratio', 2.5))
        }

        backtester = GridBacktester(
            symbol=symbol,
            interval=interval,
            initial_capital=initial_capital,
            risk_percent=risk_percent,
            strategy_type='ib_price_action',  # New strategy type
            box_params=ib_params  # Pass IB specific params
        )

        backtester.fetch_and_store_data()
        orders, final_value, trade_analysis, drawdown_analysis, sharpe_analysis = backtester.simulate()

        # Get optional name and notes
        name = data.get('name')
        notes = data.get('notes')

        # Save the simulation result
        df_candles = backtester.get_stored_data(symbol)
        filename = save_simulation_result(
            params={
                'symbol': symbol,
                'interval': interval,
                'initial_capital': initial_capital,
                'risk_percent': risk_percent,
                'strategy_type': 'ib_price_action',
                'box_params': ib_params
            },
            orders=orders,
            final_value=final_value,
            candle_data=df_candles,
            name=name,
            notes=notes
        )

        # Get the timestamp from the filename
        timestamp = os.path.basename(filename).replace('simulation_', '').replace('.json', '')

        return jsonify({
            'status': 'success',
            'timestamp': timestamp,
            'final_value': final_value,
            'orders': orders,
            'trade_analysis': trade_analysis,
            'drawdown_analysis': drawdown_analysis,
            'sharpe_analysis': sharpe_analysis,
        })
    except Exception as e:
        logger.error(f"IB Strategy backtest error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
