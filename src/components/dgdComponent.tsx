import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Tabs,
  Tab
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PublicIcon from '@mui/icons-material/Public';
import ReceiptIcon from '@mui/icons-material/Receipt';

// Interface pour les données DGD (Douanes)
export interface DGDData {
  acompte: number | null;
  annee_exo: string | null;
  annulee: number | null;
  bureau_frontiere: string | null;
  caf: number | null;
  code_bureau: string | null;
  code_pays_destination1: string | null;
  code_pays_destination_finale: string | null;
  code_pays_origine: string | null;
  compte: string | null;
  cpv: number | null;
  cse: string | null;
  date_charge: string | null;
  date_enregistrement: string | null;
  date_liquidation: string | null;
  dd: number | null;
  declarant: string | null;
  entreprise: string | null;
  etat: string | null;
  flux: string | null;
  fob: number | null;
  idr: string | null;
  ifu: string | null;
  ifu_declarant: string | null;
  instanceid: number | null;
  lib_bureau: string | null;
  lib_declarant: string | null;
  libelle: string | null;
  libelle_bureau_frontiere: string | null;
  libelle_mode_transport: string | null;
  mode_transport: string | null;
  mt_liquid: number | null;
  nomenclature10: string | null;
  nomenclature8: string | null;
  num_article: number | null;
  num_declaration: string | null;
  num_liquidation: string | null;
  numero_exo: string | null;
  pays_destination1: string | null;
  pays_destination_finale: string | null;
  pays_origine: string | null;
  pc: number | null;
  pcs: number | null;
  pds_brt: number | null;
  pds_net: number | null;
  peage: number | null;
  quantite: number | null;
  ref_base_legale: string | null;
  regime: string | null;
  ri: number | null;
  rs: number | null;
  rsp: string | null;
  sid_dgdid: number | null;
  tep: number | null;
  tic: number | null;
  tpc: number | null;
  tpp: number | null;
  tsb: number | null;
  tsc: number | null;
  tst: number | null;
  tva: number | null;
  tvt: number | null;
  type_declaration: string | null;
}

interface DgdComponentProps {
  data: DGDData[];
}

const DgdComponent: React.FC<DgdComponentProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<number>(0);
  const itemsPerPage = 5;

  // Formater les montants en FCFA
  const formatAmount = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Formater les dates
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Obtenir la couleur selon le flux (Import/Export)
  const getFluxColor = (flux: string | null): 'primary' | 'success' => {
    return flux === 'I' ? 'primary' : 'success';
  };

  const getFluxLabel = (flux: string | null): string => {
    return flux === 'I' ? 'Import' : flux === 'E' ? 'Export' : 'N/A';
  };

  // Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleViewModeChange = (_event: React.SyntheticEvent, newValue: number) => {
    setViewMode(newValue);
  };

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Aucune donnée douanière disponible
        </Typography>
      </Box>
    );
  }

  // Vue en cartes
  const renderCardsView = () => (
    <Stack spacing={2}>
      {currentData.map((item, index) => (
        <Accordion key={index} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
              <Chip
                icon={<LocalShippingIcon />}
                label={getFluxLabel(item.flux)}
                color={getFluxColor(item.flux)}
                size="small"
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {item.num_declaration || 'N/A'}
              </Typography>
              <Chip
                label={item.type_declaration || 'N/A'}
                size="small"
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                {formatDate(item.date_enregistrement)}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {/* Section Entreprise */}
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  <ReceiptIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Informations Entreprise
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Typography variant="body2">
                    <strong>Entreprise:</strong> {item.entreprise || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>IFU:</strong> {item.ifu || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Déclarant:</strong> {item.lib_declarant || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>IFU Déclarant:</strong> {item.ifu_declarant || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Section Montants */}
              <Box sx={{ bgcolor: '#e8f5e9', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" color="success.main" gutterBottom>
                  <AttachMoneyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Valeurs Financières
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">CAF</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatAmount(item.caf)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">FOB</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatAmount(item.fob)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">TVA</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatAmount(item.tva)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Mt. Liquidation</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatAmount(item.mt_liquid)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Acompte</Typography>
                    <Typography variant="body1">{formatAmount(item.acompte)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">PC</Typography>
                    <Typography variant="body1">{formatAmount(item.pc)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">PCS</Typography>
                    <Typography variant="body1">{formatAmount(item.pcs)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">RS</Typography>
                    <Typography variant="body1">{formatAmount(item.rs)}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Section Géographique */}
              <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" color="info.main" gutterBottom>
                  <PublicIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Informations Géographiques
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  <Typography variant="body2">
                    <strong>Pays Origine:</strong> {item.pays_origine || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Pays Destination:</strong> {item.pays_destination_finale || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Bureau:</strong> {item.lib_bureau || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Bureau Frontière:</strong> {item.libelle_bureau_frontiere || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                    <strong>Mode Transport:</strong> {item.libelle_mode_transport || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Section Marchandise */}
              <Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Détails Marchandise
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Libellé:</strong> {item.libelle || 'N/A'}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  <Typography variant="body2">
                    <strong>Nomenclature 10:</strong> {item.nomenclature10 || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Quantité:</strong> {item.quantite || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Poids Net:</strong> {item.pds_net ? `${item.pds_net} kg` : 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Poids Brut:</strong> {item.pds_brt ? `${item.pds_brt} kg` : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Section Références */}
              <Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  <Typography variant="body2">
                    <strong>N° Liquidation:</strong> {item.num_liquidation || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Régime:</strong> {item.regime || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date Liquidation:</strong> {formatDate(item.date_liquidation)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Instance ID:</strong> {item.instanceid || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );

  // Vue en tableau
  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
          <TableRow>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>N° Déclaration</strong></TableCell>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Flux</strong></TableCell>
            <TableCell><strong>Entreprise</strong></TableCell>
            <TableCell align="right"><strong>CAF</strong></TableCell>
            <TableCell align="right"><strong>FOB</strong></TableCell>
            <TableCell align="right"><strong>TVA</strong></TableCell>
            <TableCell><strong>Pays Origine</strong></TableCell>
            <TableCell><strong>Bureau</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentData.map((item, index) => (
            <TableRow key={index} hover>
              <TableCell>{formatDate(item.date_enregistrement)}</TableCell>
              <TableCell>{item.num_declaration || 'N/A'}</TableCell>
              <TableCell>
                <Chip label={item.type_declaration || 'N/A'} size="small" variant="outlined" />
              </TableCell>
              <TableCell>
                <Chip
                  label={getFluxLabel(item.flux)}
                  color={getFluxColor(item.flux)}
                  size="small"
                />
              </TableCell>
              <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.entreprise || 'N/A'}
              </TableCell>
              <TableCell align="right">{formatAmount(item.caf)}</TableCell>
              <TableCell align="right">{formatAmount(item.fob)}</TableCell>
              <TableCell align="right">{formatAmount(item.tva)}</TableCell>
              <TableCell>{item.pays_origine || 'N/A'}</TableCell>
              <TableCell>{item.lib_bureau || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* En-tête avec statistiques */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' }, gap: 2, alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" color="success">
                📦 Données Douanières
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.length} enregistrement(s)
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Total CAF</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatAmount(data.reduce((sum, item) => sum + (item.caf || 0), 0))}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total FOB</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatAmount(data.reduce((sum, item) => sum + (item.fob || 0), 0))}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total TVA</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatAmount(data.reduce((sum, item) => sum + (item.tva || 0), 0))}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.success">Total Liquidation</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatAmount(data.reduce((sum, item) => sum + (item.mt_liquid || 0), 0))}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Sélecteur de vue */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={viewMode} onChange={handleViewModeChange}>
          <Tab label="Vue Détaillée (Cartes)" />
          <Tab label="Vue Tableau" />
        </Tabs>
      </Box>

      {/* Contenu selon le mode de vue */}
      {viewMode === 0 ? renderCardsView() : renderTableView()}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default DgdComponent;