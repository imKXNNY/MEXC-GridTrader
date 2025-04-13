// Mock candle data for testing
export const mockCandleData = [
  {
    time: '2023-01-01T00:00:00.000Z',
    open: 50000,
    high: 51000,
    low: 49500,
    close: 50500,
    volume: 100
  },
  {
    time: '2023-01-01T01:00:00.000Z',
    open: 50500,
    high: 51500,
    low: 50200,
    close: 51000,
    volume: 120
  },
  {
    time: '2023-01-01T02:00:00.000Z',
    open: 51000,
    high: 51800,
    low: 50800,
    close: 51500,
    volume: 150
  },
  {
    time: '2023-01-01T03:00:00.000Z',
    open: 51500,
    high: 52000,
    low: 51200,
    close: 51800,
    volume: 180
  },
  {
    time: '2023-01-01T04:00:00.000Z',
    open: 51800,
    high: 52500,
    low: 51500,
    close: 52200,
    volume: 200
  },
  {
    time: '2023-01-01T05:00:00.000Z',
    open: 52200,
    high: 53000,
    low: 52000,
    close: 52800,
    volume: 220
  },
  {
    time: '2023-01-01T06:00:00.000Z',
    open: 52800,
    high: 53500,
    low: 52500,
    close: 53200,
    volume: 250
  },
  {
    time: '2023-01-01T07:00:00.000Z',
    open: 53200,
    high: 54000,
    low: 53000,
    close: 53800,
    volume: 280
  },
  {
    time: '2023-01-01T08:00:00.000Z',
    open: 53800,
    high: 54500,
    low: 53500,
    close: 54200,
    volume: 300
  },
  {
    time: '2023-01-01T09:00:00.000Z',
    open: 54200,
    high: 55000,
    low: 54000,
    close: 54800,
    volume: 320
  }
];

// Mock trade orders for testing
export const mockOrders = [
  {
    time: '2023-01-01T02:00:00.000Z',
    type: 'buy',
    price: 51000,
    size: 0.5,
    profit: 0
  },
  {
    time: '2023-01-01T05:00:00.000Z',
    type: 'sell',
    price: 52800,
    size: 0.5,
    profit: 900
  },
  {
    time: '2023-01-01T07:00:00.000Z',
    type: 'buy',
    price: 53200,
    size: 0.6,
    profit: 0
  },
  {
    time: '2023-01-01T09:00:00.000Z',
    type: 'sell',
    price: 54800,
    size: 0.6,
    profit: 960
  }
];
