import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import BacktestService, { PaginationParams } from '../services/BacktestService';
import { BacktestResult } from '../types';
import { DEFAULT_PAGE_SIZE, DEFAULT_SORT_BY, DEFAULT_SORT_ORDER } from '../utils/constants';
import BacktestManagement from './BacktestManagement';

interface BacktestListProps {
  onViewBacktest?: (backtest: BacktestResult) => void;
  showActions?: boolean;
}

type SortDirection = 'asc' | 'desc';

const BacktestList: React.FC<BacktestListProps> = ({
  onViewBacktest,
  showActions = true
}) => {
  // State
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<string>(DEFAULT_SORT_BY);
  const [sortOrder, setSortOrder] = useState<SortDirection>(DEFAULT_SORT_ORDER as SortDirection);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedBacktest, setSelectedBacktest] = useState<BacktestResult | null>(null);

  // Fetch backtests
  const fetchBacktests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: PaginationParams = {
        page: page + 1, // API uses 1-indexed pages
        per_page: rowsPerPage,
        include_archived: includeArchived,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      const response = await BacktestService.getBacktests(params);
      setBacktests(response.results);
      setTotalCount(response.pagination.total_count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch backtests');
    } finally {
      setLoading(false);
    }
  };

  // Load backtests on mount and when pagination/sorting changes
  useEffect(() => {
    fetchBacktests();
  }, [page, rowsPerPage, sortBy, sortOrder, includeArchived]);

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sort request
  const handleRequestSort = (property: string) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  // Handle archive/unarchive
  const handleArchiveToggle = async (backtest: BacktestResult) => {
    try {
      if (backtest.archived) {
        await BacktestService.unarchiveBacktest(backtest.timestamp);
      } else {
        await BacktestService.archiveBacktest(backtest.timestamp);
      }
      fetchBacktests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive/unarchive backtest');
    }
  };

  // Handle delete
  const handleDelete = async (backtest: BacktestResult) => {
    try {
      await BacktestService.deleteBacktest(backtest.timestamp);
      fetchBacktests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete backtest');
    }
  };

  // Handle view
  const handleView = (backtest: BacktestResult) => {
    if (onViewBacktest) {
      onViewBacktest(backtest);
    }
    setSelectedBacktest(backtest);
  };

  // Handle save (rename/add notes)
  const handleSave = async (name: string, notes: string) => {
    if (!selectedBacktest) return;

    try {
      await BacktestService.updateBacktest(selectedBacktest.timestamp, { name, notes });
      fetchBacktests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update backtest');
    }
  };

  // Render loading state
  if (loading && backtests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error && backtests.length === 0) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Backtest Results
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              color="primary"
            />
          }
          label="Include Archived"
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'timestamp'}
                  direction={sortBy === 'timestamp' ? sortOrder : 'desc'}
                  onClick={() => handleRequestSort('timestamp')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={sortBy === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'symbol'}
                  direction={sortBy === 'symbol' ? sortOrder : 'asc'}
                  onClick={() => handleRequestSort('symbol')}
                >
                  Symbol
                </TableSortLabel>
              </TableCell>
              <TableCell>Strategy</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'profit'}
                  direction={sortBy === 'profit' ? sortOrder : 'desc'}
                  onClick={() => handleRequestSort('profit')}
                >
                  Profit
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              {showActions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {backtests.map((backtest) => {
              const initialCapital = backtest.equity?.initial || 0;
              const finalCapital = backtest.equity?.final || 0;
              const profit = finalCapital - initialCapital;
              const profitPercent = initialCapital > 0 ? (profit / initialCapital) * 100 : 0;
              const isProfitable = profit > 0;

              return (
                <TableRow key={backtest.timestamp}>
                  <TableCell>
                    {new Date(parseInt(backtest.timestamp) * 1000).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Link to={`/results/${backtest.timestamp}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {backtest.name || `${backtest.params.symbol} - ${backtest.params.interval}`}
                    </Link>
                  </TableCell>
                  <TableCell>{backtest.params.symbol}</TableCell>
                  <TableCell>
                    <Chip
                      label={backtest.params.strategy_type}
                      size="small"
                      color={
                        backtest.params.strategy_type === 'momentum' ? 'primary' :
                        backtest.params.strategy_type === 'ib_price_action' ? 'secondary' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ color: isProfitable ? 'success.main' : 'error.main' }}>
                    {profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
                  </TableCell>
                  <TableCell>
                    {backtest.archived ? (
                      <Chip label="Archived" size="small" color="default" />
                    ) : (
                      <Chip label="Active" size="small" color="success" />
                    )}
                  </TableCell>
                  {showActions && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleView(backtest)}
                            component={Link}
                            to={`/results/${backtest.timestamp}`}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={backtest.archived ? "Unarchive" : "Archive"}>
                          <IconButton
                            size="small"
                            onClick={() => handleArchiveToggle(backtest)}
                          >
                            {backtest.archived ? (
                              <UnarchiveIcon fontSize="small" />
                            ) : (
                              <ArchiveIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(backtest)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {backtests.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={showActions ? 7 : 6} align="center">
                  No backtests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {selectedBacktest && (
        <BacktestManagement
          onSave={handleSave}
          onArchive={() => handleArchiveToggle(selectedBacktest)}
          onDelete={() => handleDelete(selectedBacktest)}
        />
      )}
    </Box>
  );
};

export default BacktestList;
