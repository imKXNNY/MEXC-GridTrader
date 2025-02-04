from flask import Flask, render_template, request, redirect, url_for
import plotly
import plotly.graph_objs as go
import pandas as pd

from config import logger
from src.grid_backtester import GridBacktester
from src.results_storage import save_simulation_result, get_all_simulation_results, get_simulation_result_by_timestamp

app = Flask(__name__)

def create_equity_chart(equity_curve):
    """
    Generates an interactive Plotly line chart for the equity curve.
    """
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=list(range(len(equity_curve))),
            y=equity_curve,
            mode='lines',
            name='Equity'
        )
    )
    fig.update_layout(
        title="Equity Curve",
        xaxis_title="Time Step",
        yaxis_title="Equity"
    )
    return plotly.offline.plot(fig, output_type="div")

def create_orders_chart(orders, df_price):
    """
    Create a Plotly line chart of 'close' over time, plus buy/sell markers.
    """
    fig = go.Figure()

    # 1) Price line trace
    if not df_price.empty:
        fig.add_trace(go.Scatter(
            x=df_price['time'],
            y=df_price['close'],
            mode='lines',
            line=dict(color='blue'),
            name='Price'
        ))

    # 2) Build lists for buy/sell
    buy_x, buy_y = [], []
    sell_x, sell_y = [], []
    for order in orders:
        if order['type'] == 'buy':
            buy_x.append(order['time'])
            buy_y.append(order['price'])
        elif order['type'] == 'sell':
            sell_x.append(order['time'])
            sell_y.append(order['price'])

    # 3) Add buy/sell markers
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
        hovermode='x'
    )
    return plotly.offline.plot(fig, output_type="div")

@app.route('/')
def index():
    """
    Renders the main page where the user inputs backtest parameters.
    """
    return render_template('index.html')


@app.route('/backtest', methods=['POST'])
def backtest():
    """
    Handles form submission for running a backtest. Saves the simulation result
    and redirects to the result detail page.
    """
    try:
        symbol = request.form['symbol']
        interval = request.form['interval']
        grid_levels = int(request.form['grid_levels'])
        percent_range = float(request.form['percent_range'])
        initial_capital = float(request.form['initial_capital'])
        order_size = float(request.form['order_size'])
    except (KeyError, ValueError) as e:
        logger.error("Invalid form input: %s", e)
        return "Invalid input. Please go back and check your form data.", 400

    # Initialize backtester and run simulation
    backtester = GridBacktester(
        symbol=symbol,
        interval=interval,
        grid_levels=grid_levels,
        percent_range=percent_range,
        initial_capital=initial_capital,
        order_size=order_size
    )
    backtester.fetch_and_store_data()  # Fetch historical data

    orders, equity_curve = backtester.simulate()  # Run simulation
    df_candles = backtester.get_stored_data(backtester.symbol)  # Get stored data
    # Save results to JSON so they show up in /results
    params = {
        "symbol": symbol,
        "interval": interval,
        "grid_levels": grid_levels,
        "percent_range": percent_range,
        "initial_capital": initial_capital,
        "order_size": order_size
    }
    filename = save_simulation_result(params, orders, equity_curve, df_candles)

    # Extract timestamp from filename => simulation_1693510833.json
    try:
        ts = filename.split("_")[-1].split(".")[0]
    except Exception:
        logger.error("Could not parse timestamp from filename: %s", filename)
        ts = "unknown"

    return redirect(url_for('result_detail', timestamp=ts))


@app.route('/results', methods=['GET'])
def results():
    """
    Lists all stored simulation results in descending order by timestamp.
    """
    all_results = get_all_simulation_results()
    return render_template('results.html', results=all_results)


@app.route('/results/<int:timestamp>', methods=['GET'])
def result_detail(timestamp):
    result = get_simulation_result_by_timestamp(str(timestamp))
    if not result:
        return f"No results found for timestamp {timestamp}.", 404

    equity_curve = result.get("equity_curve", [])
    orders = result.get("orders", [])
    metrics = result.get("metrics", {})

    # Retrieve candle data from the JSON if present
    candle_list = result.get("candles", [])
    df_price = pd.DataFrame(candle_list)

    if not df_price.empty and 'time' in df_price.columns:
        # Convert 'time' back into a datetime
        df_price['time'] = pd.to_datetime(df_price['time'], errors='coerce')

    equity_chart_html = create_equity_chart(equity_curve)
    # We'll modify 'create_orders_chart' to plot the price line + buy/sell markers
    orders_chart_html = create_orders_chart(orders, df_price)

    return render_template(
        "result_detail.html",
        metrics=metrics,
        equity_chart_html=equity_chart_html,
        orders_chart_html=orders_chart_html
    )


if __name__ == '__main__':
    # Debug mode can be controlled via FLASK_DEBUG or config.py
    app.run(debug=True)
