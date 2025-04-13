import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import SaveIcon from '@mui/icons-material/Save';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';

interface BacktestManagementProps {
  onSave: (name: string, notes: string) => void;
  onArchive: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

const BacktestManagement: React.FC<BacktestManagementProps> = ({
  onSave,
  onArchive,
  onDelete,
  disabled = false
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [backtestName, setBacktestName] = useState('');
  const [backtestNotes, setBacktestNotes] = useState('');

  const handleSaveClick = () => {
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = () => {
    onSave(backtestName, backtestNotes);
    setSaveDialogOpen(false);
    // Reset form
    setBacktestName('');
    setBacktestNotes('');
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Box className="flex gap-2">
        <Tooltip title="Save backtest with name and notes">
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveClick}
            disabled={disabled}
            sx={{
              borderColor: 'var(--color-success)',
              color: 'var(--color-success)',
              '&:hover': {
                borderColor: 'var(--color-success)',
                backgroundColor: 'rgba(var(--color-success-rgb), 0.1)'
              }
            }}
          >
            Save
          </Button>
        </Tooltip>
        <Tooltip title="Archive backtest for later reference">
          <Button
            variant="outlined"
            startIcon={<ArchiveIcon />}
            onClick={onArchive}
            disabled={disabled}
            sx={{
              borderColor: 'var(--color-warning)',
              color: 'var(--color-warning)',
              '&:hover': {
                borderColor: 'var(--color-warning)',
                backgroundColor: 'rgba(var(--color-warning-rgb), 0.1)'
              }
            }}
          >
            Archive
          </Button>
        </Tooltip>
        <Tooltip title="Delete backtest permanently">
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            disabled={disabled}
            sx={{
              borderColor: 'var(--color-error)',
              color: 'var(--color-error)',
              '&:hover': {
                borderColor: 'var(--color-error)',
                backgroundColor: 'rgba(var(--color-error-rgb), 0.1)'
              }
            }}
          >
            Delete
          </Button>
        </Tooltip>
      </Box>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle sx={{ color: 'var(--color-text)' }}>Save Backtest</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'var(--color-text-secondary)', mb: 2 }}>
            Enter a name and optional notes for this backtest to save it for future reference.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Backtest Name"
            type="text"
            fullWidth
            variant="outlined"
            value={backtestName}
            onChange={(e) => setBacktestName(e.target.value)}
            required
            InputLabelProps={{ style: { color: 'var(--color-text)' } }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'var(--color-secondary)' },
                color: 'var(--color-text)'
              }
            }}
          />
          <TextField
            margin="dense"
            label="Notes"
            type="text"
            fullWidth
            variant="outlined"
            value={backtestNotes}
            onChange={(e) => setBacktestNotes(e.target.value)}
            multiline
            rows={4}
            InputLabelProps={{ style: { color: 'var(--color-text)' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'var(--color-secondary)' },
                color: 'var(--color-text)'
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} sx={{ color: 'var(--color-text-secondary)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveConfirm}
            disabled={!backtestName.trim()}
            sx={{
              color: 'var(--color-success)',
              '&.Mui-disabled': {
                color: 'var(--color-text-disabled)'
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'var(--color-error)' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'var(--color-text)' }}>
            Are you sure you want to delete this backtest? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'var(--color-text-secondary)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={{ color: 'var(--color-error)' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BacktestManagement;
