import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Chip, alpha, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { dgiColors } from './_dgiColors';

// ===================== FORM DIALOG =====================
export interface FormDialogProps {
  open: boolean;
  title: string;
  initialValue?: string;
  onClose: () => void;
  onSubmit: (libelle: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open, title, initialValue = '', onClose, onSubmit, loading, error,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    await onSubmit(value.trim());
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: dgiColors.primary.main }}>{title}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          fullWidth
          label="Libellé"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          size="small"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Annuler</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          sx={{ bgcolor: dgiColors.primary.main, '&:hover': { bgcolor: dgiColors.primary.dark } }}
        >
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ===================== CONFIRM DELETE DIALOG =====================
export interface ConfirmDeleteDialogProps {
  open: boolean;
  label: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open, label, onClose, onConfirm, loading,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 700, color: '#dc2626' }}>Confirmer la suppression</DialogTitle>
    <DialogContent>
      <Typography>
        Supprimer <strong>{label}</strong> ? Cette action est irréversible.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={loading}>Annuler</Button>
      <Button variant="contained" color="error" onClick={onConfirm} disabled={loading}>
        {loading ? <CircularProgress size={18} color="inherit" /> : 'Supprimer'}
      </Button>
    </DialogActions>
  </Dialog>
);

// ===================== GENERIC CRUD TABLE =====================
export interface CrudRow {
  id: number;
  libelle: string;
  date_creation: string | null;
}

export interface CrudTableProps<T extends CrudRow> {
  rows: T[];
  loading: boolean;
  fetchError: string | null;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  successMsg: string | null;
  label: string;
}

export function CrudTable<T extends CrudRow>({
  rows, loading, fetchError, onAdd, onEdit, onDelete, successMsg, label,
}: CrudTableProps<T>) {
  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Chargement...' : `${rows.length} ${label}(s)`}
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ bgcolor: dgiColors.primary.main, '&:hover': { bgcolor: dgiColors.primary.dark }, textTransform: 'none' }}
        >
          Ajouter
        </Button>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 1.5, py: 0.5 }}>{successMsg}</Alert>}
      {fetchError  && <Alert severity="error"   sx={{ mb: 1.5, py: 0.5 }}>{fetchError}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: dgiColors.primary.main }} />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: dgiColors.neutral[200] }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: dgiColors.primary.main }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700, width: 60 }}>#</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Libellé</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Date création</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700, width: 100 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: dgiColors.neutral[700] }}>
                    Aucun enregistrement
                  </TableCell>
                </TableRow>
              ) : rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:hover': { bgcolor: alpha(dgiColors.primary.main, 0.04) },
                    bgcolor: idx % 2 === 0 ? '#fff' : dgiColors.neutral[50],
                  }}
                >
                  <TableCell sx={{ color: dgiColors.neutral[700], fontSize: '0.8rem' }}>{row.id}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.libelle}
                      size="small"
                      sx={{
                        bgcolor: alpha(dgiColors.primary.main, 0.1),
                        color: dgiColors.primary.dark,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: dgiColors.neutral[700] }}>
                    {formatDate(row.date_creation)}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => onEdit(row)} sx={{ color: dgiColors.accent.main }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" onClick={() => onDelete(row)} sx={{ color: '#dc2626' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
