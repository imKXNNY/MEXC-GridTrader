import { API_BASE_URL } from '../utils/constants';
import { BacktestParams, BacktestResult } from '../types';

export interface PaginationParams {
  page: number;
  per_page: number;
  include_archived: boolean;
  sort_by: string;
  sort_order: string;
}

export interface PaginatedResponse {
  results: BacktestResult[];
  pagination: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

class BacktestService {
  /**
   * Run a backtest simulation
   */
  async runBacktest(params: BacktestParams): Promise<BacktestResult> {
    // Determine the endpoint based on the strategy type
    const endpoint = params.strategy_type === 'ib_price_action'
      ? `${API_BASE_URL}/api/backtest/ib_strategy`
      : `${API_BASE_URL}/api/simulate`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to run backtest');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get paginated backtest results
   */
  async getBacktests(params: Partial<PaginationParams> = {}): Promise<PaginatedResponse> {
    const {
      page = 1,
      per_page = 10,
      include_archived = false,
      sort_by = 'timestamp',
      sort_order = 'desc'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
      include_archived: include_archived.toString(),
      sort_by,
      sort_order
    });

    const response = await fetch(`${API_BASE_URL}/api/backtests?${queryParams}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch backtests');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get a specific backtest by timestamp
   */
  async getBacktest(timestamp: string): Promise<BacktestResult> {
    const response = await fetch(`${API_BASE_URL}/api/backtests/${timestamp}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch backtest');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Update a backtest's name and/or notes
   */
  async updateBacktest(timestamp: string, updates: { name?: string; notes?: string }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/backtests/${timestamp}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update backtest');
    }
  }

  /**
   * Archive a backtest
   */
  async archiveBacktest(timestamp: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/backtests/${timestamp}/archive`, {
      method: 'POST'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to archive backtest');
    }
  }

  /**
   * Unarchive a backtest
   */
  async unarchiveBacktest(timestamp: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/backtests/${timestamp}/unarchive`, {
      method: 'POST'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to unarchive backtest');
    }
  }

  /**
   * Delete a backtest
   */
  async deleteBacktest(timestamp: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/backtests/${timestamp}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete backtest');
    }
  }
}

export default new BacktestService();
