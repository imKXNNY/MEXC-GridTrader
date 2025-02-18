import logging
import os
import sys
import markdown2
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("Starting the Flask app...")

import plotly
import plotly.graph_objs as go
import pandas as pd

from config import logger
from src.grid_backtester import GridBacktester
from src.metrics import calculate_advanced_metrics
from src.results_storage import (
    save_simulation_result, 
    get_all_simulation_results, 
    get_simulation_result_by_timestamp,
    delete_simulation_result,
    delete_all_simulation_results
)

from src.api_integration import MEXCExchange

app = Flask(__name__, static_folder='assets')
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

APP_VERSION = "0.3.0"

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
        api = MEXCExchange()
        return jsonify(api.get_account_info())
    except Exception as e:
        logger.error("Account info error: %s", e)
        return jsonify({"error": "Failed to fetch account info"}), 500

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
        
        return jsonify({
            'status': 'success',
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

if __name__ == '__main__':

    app.run(debug=True)
