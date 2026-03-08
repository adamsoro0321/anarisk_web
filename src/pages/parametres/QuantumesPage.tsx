import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import { CrudTable, FormDialog, ConfirmDeleteDialog } from './_paramHelpers';
import { dgiColors } from './_dgiColors';
import QuantumeService, { type QuantumeItem } from '../../services/quantume.service';

const QuantumesPage: React.FC = () => {
  const [quantumes, setQuantumes]     = useState<QuantumeItem[]>([]);
  const [loading, setLoading]         = useState(false);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);

  const [dialog, setDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; item?: QuantumeItem }>({
    open: false, mode: 'add',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]     = useState<string | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item?: QuantumeItem }>({ open: false });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchQuantumes = async () => {
    setLoading(true); setFetchError(null);
    try {
      const res = await QuantumeService.getAll();
      setQuantumes(res.data);
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : 'Erreur chargement quantumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuantumes(); }, []);

  const autoHide = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSubmit = async (libelle: string) => {
    setFormLoading(true); setFormError(null);
    try {
      if (dialog.mode === 'add') {
        await QuantumeService.create(libelle);
        autoHide('Quantum créé avec succès.');
      } else if (dialog.item) {
        await QuantumeService.update(dialog.item.id, libelle);
        autoHide('Quantum mis à jour.');
      }
      setDialog({ open: false, mode: 'add' });
      fetchQuantumes();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleteLoading(true);
    try {
      await QuantumeService.delete(deleteDialog.item.id);
      autoHide('Quantum supprimé.');
      setDeleteDialog({ open: false });
      fetchQuantumes();
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : 'Erreur suppression');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
      {/* En-tête */}
      <Box
        sx={{
          mb: 3, p: 2.5, bgcolor: '#fff', borderRadius: 2,
          border: '1px solid', borderColor: dgiColors.neutral[200],
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}
      >
        <CalendarViewWeekIcon sx={{ color: dgiColors.primary.main, fontSize: 28 }} />
        <Box>
          <Typography variant="h5" fontWeight={700} color={dgiColors.primary.main}>Quantumes</Typography>
          <Typography variant="body2" color="text.secondary">Gestion des périodes de programmation (quantumes)</Typography>
        </Box>
      </Box>

      {/* Tableau CRUD */}
      <Box
        sx={{
          bgcolor: '#fff', borderRadius: 2, p: 2.5,
          border: '1px solid', borderColor: dgiColors.neutral[200],
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <CrudTable
          rows={quantumes}
          loading={loading}
          fetchError={fetchError}
          successMsg={successMsg}
          label="quantum"
          onAdd={() => setDialog({ open: true, mode: 'add' })}
          onEdit={(item) => setDialog({ open: true, mode: 'edit', item })}
          onDelete={(item) => setDeleteDialog({ open: true, item })}
        />
      </Box>

      {/* Dialog ajout/édition */}
      <FormDialog
        key={`quantume-${dialog.mode}-${dialog.item?.id ?? 'new'}`}
        open={dialog.open}
        title={dialog.mode === 'add' ? 'Ajouter un quantum' : 'Modifier le quantum'}
        initialValue={dialog.item?.libelle ?? ''}
        onClose={() => { setDialog({ open: false, mode: 'add' }); setFormError(null); }}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />

      {/* Dialog suppression */}
      <ConfirmDeleteDialog
        open={deleteDialog.open}
        label={deleteDialog.item?.libelle ?? ''}
        onClose={() => setDeleteDialog({ open: false })}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </Box>
  );
};

export default QuantumesPage;
