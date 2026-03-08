import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import DomainIcon from '@mui/icons-material/Domain';
import { CrudTable, FormDialog, ConfirmDeleteDialog } from './_paramHelpers';
import { dgiColors } from './_dgiColors';
import BrigadeService, { type BrigadeItem } from '../../services/brigade.service';

const BrigadesPage: React.FC = () => {
  const [brigades, setBrigades]       = useState<BrigadeItem[]>([]);
  const [loading, setLoading]         = useState(false);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);

  const [dialog, setDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; item?: BrigadeItem }>({
    open: false, mode: 'add',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]     = useState<string | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item?: BrigadeItem }>({ open: false });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBrigades = async () => {
    setLoading(true); setFetchError(null);
    try {
      const res = await BrigadeService.getAll();
      setBrigades(res.data);
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : 'Erreur chargement brigades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrigades(); }, []);

  const autoHide = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSubmit = async (libelle: string) => {
    setFormLoading(true); setFormError(null);
    try {
      if (dialog.mode === 'add') {
        await BrigadeService.create(libelle);
        autoHide('Brigade créée avec succès.');
      } else if (dialog.item) {
        await BrigadeService.update(dialog.item.id, libelle);
        autoHide('Brigade mise à jour.');
      }
      setDialog({ open: false, mode: 'add' });
      fetchBrigades();
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
      await BrigadeService.delete(deleteDialog.item.id);
      autoHide('Brigade supprimée.');
      setDeleteDialog({ open: false });
      fetchBrigades();
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
        <DomainIcon sx={{ color: dgiColors.primary.main, fontSize: 28 }} />
        <Box>
          <Typography variant="h5" fontWeight={700} color={dgiColors.primary.main}>Brigades</Typography>
          <Typography variant="body2" color="text.secondary">Gestion des brigades de contrôle fiscal</Typography>
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
          rows={brigades}
          loading={loading}
          fetchError={fetchError}
          successMsg={successMsg}
          label="brigade"
          onAdd={() => setDialog({ open: true, mode: 'add' })}
          onEdit={(item) => setDialog({ open: true, mode: 'edit', item })}
          onDelete={(item) => setDeleteDialog({ open: true, item })}
        />
      </Box>

      {/* Dialog ajout/édition */}
      <FormDialog
        key={`brigade-${dialog.mode}-${dialog.item?.id ?? 'new'}`}
        open={dialog.open}
        title={dialog.mode === 'add' ? 'Ajouter une brigade' : 'Modifier la brigade'}
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

export default BrigadesPage;
