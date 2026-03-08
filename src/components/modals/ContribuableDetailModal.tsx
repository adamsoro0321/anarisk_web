
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import StatService, {
  type ContribuableData,
} from "../../services/stat.service";
import { useCallback, useEffect, useState, useRef } from 'react';
import ContribuableService, { type ProgrammeResponse, type CreateProgrammeResponse } from '../../services/Contribuable.service';
import cytoscape from 'cytoscape';
import DgdComponent, { type DGDData } from '../dgdComponent';
import IndicateurRiskView, { type InfoDataItem } from '../IndicateurRiskView';
import BrigadeService, { type BrigadeItem } from '../../services/brigade.service';
import QuantumeService, { type QuantumeItem } from '../../services/quantume.service';
interface ContribuableDetailModalProps {
    open: boolean;
    onClose: () => void;
    numIFU: string;
}

const ContribuableDetailModal: React.FC<ContribuableDetailModalProps> = ({ open, onClose, numIFU }) => {
    const [contribuable, setContribuable] = useState<ContribuableData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [douaneData, setDouaneData] = useState<DGDData[]>([]);
    const [douaneLoading, setDouaneLoading] = useState(false);
    const [douaneError, setDouaneError] = useState<string | null>(null);
    const [contribuableProgramme, setcontribuableProgramme] = useState<ProgrammeResponse | null>(null);
    const [programmeLoading, setProgrammeLoading] = useState(false);
    const [programmeError, setProgrammeError] = useState<string | null>(null);

    // Form creation programme
    const [brigadesList, setBrigadesList] = useState<BrigadeItem[]>([]);
    const [quantumesList, setQuantumesList] = useState<QuantumeItem[]>([]);
    const [formBrigade, setFormBrigade] = useState('');
    const [formQuantume, setFormQuantume] = useState('');
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    // Ref pour le conteneur du graphe Cytoscape
    const cyClientRef = useRef<HTMLDivElement>(null);
    const cyFournisseurRef = useRef<HTMLDivElement>(null);
    const cyClientInstance = useRef<cytoscape.Core | null>(null);
    const cyFournisseurInstance = useRef<cytoscape.Core | null>(null);

    // Gestion du changement d'onglet
    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

  // Charger les données du contribuable
  const loadContribuable = useCallback(async (ifuToLoad: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await StatService.getContribuableIndicators(ifuToLoad);

      if (response.success) {
        setContribuable(response.contribuable);
      } else {
        setError("Contribuable non trouvé");
      }
    } catch (err: unknown) {
      console.error("Erreur:", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  // Charger les programmes du contribuable
  const loadContribuableProgramme = useCallback(async (ifuToLoad: string) => {
    try {
      setProgrammeLoading(true);
      setProgrammeError(null);
      const response = await ContribuableService.getContribuableProgramme(ifuToLoad);
      setcontribuableProgramme(response);
    } catch (err: unknown) {
      console.error('Erreur chargement programmes:', err);
      setProgrammeError(err instanceof Error ? err.message : 'Erreur lors du chargement des programmes');
    } finally {
      setProgrammeLoading(false);
    }
  }, []);

  // Soumettre le formulaire de création de programme
  const handleCreateProgramme = async () => {
    if (!formBrigade || !formQuantume) {
      setFormError('Veuillez sélectionner une brigade et un quantum.');
      return;
    }
    try {
      setFormSubmitting(true);
      setFormError(null);
      setFormSuccess(null);
      const res: CreateProgrammeResponse = await ContribuableService.createProgramme(numIFU, formBrigade, formQuantume);
      if (res.success) {
        setFormSuccess('Programme créé avec succès.');
        setFormBrigade('');
        setFormQuantume('');
        // Recharger la liste
        await loadContribuableProgramme(numIFU);
      } else {
        setFormError(res.message || 'Erreur lors de la création.');
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la création du programme.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Charger au montage si IFU présent
  useEffect(() => {
    if (numIFU && open) {
      loadContribuable(numIFU);
      loadContribuableProgramme(numIFU);
    }

    // Charger brigades et quantumes à l'ouverture
    if (open) {
      BrigadeService.getAll().then(res => { if (res.success) setBrigadesList(res.data); }).catch(console.error);
      QuantumeService.getAll().then(res => { if (res.success) setQuantumesList(res.data); }).catch(console.error);
    }
 
    // Cleanup des graphes quand le modal se ferme
    if (!open) {
      if (cyClientInstance.current) {
        cyClientInstance.current.destroy();
        cyClientInstance.current = null;
      }
      if (cyFournisseurInstance.current) {
        cyFournisseurInstance.current.destroy();
        cyFournisseurInstance.current = null;
      }
    }
  }, [numIFU, open, loadContribuable, loadContribuableProgramme]);


  // Initialiser le graphe de réseau client
  useEffect(() => {
    if (currentTab === 3 && cyClientRef.current && !cyClientInstance.current && open) {
      // Données fictives pour le réseau client
      const clientData = {
        nodes: [
          // Noeud central (le contribuable)
          { data: { id: numIFU, label: contribuable?.info?.NOM_MINEFID || numIFU, type: 'main' } },
          // Clients (données fictives)
          { data: { id: 'client1', label: 'Client A - Commerce SARL', type: 'client', amount: 15000000 } },
          { data: { id: 'client2', label: 'Client B - Distribution SA', type: 'client', amount: 8500000 } },
          { data: { id: 'client3', label: 'Client C - Services SUARL', type: 'client', amount: 12000000 } },
          { data: { id: 'client4', label: 'Client D - Import-Export', type: 'client', amount: 20000000 } },
          { data: { id: 'client5', label: 'Client E - Société Générale', type: 'client', amount: 5500000 } },
          { data: { id: 'client6', label: 'Client F - Trading Ltd', type: 'client', amount: 9800000 } },
        ],
        edges: [
          // Relations entre le contribuable et ses clients
          { data: { source: numIFU, target: 'client1', label: '15M FCFA' } },
          { data: { source: numIFU, target: 'client2', label: '8.5M FCFA' } },
          { data: { source: numIFU, target: 'client3', label: '12M FCFA' } },
          { data: { source: numIFU, target: 'client4', label: '20M FCFA' } },
          { data: { source: numIFU, target: 'client5', label: '5.5M FCFA' } },
          { data: { source: numIFU, target: 'client6', label: '9.8M FCFA' } },
        ]
      };

      // Initialiser Cytoscape
      cyClientInstance.current = cytoscape({
        container: cyClientRef.current,
        elements: [...clientData.nodes, ...clientData.edges],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#0ea5e9',
              'label': 'data(label)',
              'color': '#fff',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px',
              'width': '60px',
              'height': '60px',
              'text-wrap': 'wrap',
              'text-max-width': '80px'
            }
          },
          {
            selector: 'node[type="main"]',
            style: {
              'background-color': '#16a34a',
              'width': '80px',
              'height': '80px',
              'font-size': '12px',
              'font-weight': 'bold'
            }
          },
          {
            selector: 'node[type="client"]',
            style: {
              'background-color': '#0ea5e9'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#94a3b8',
              'target-arrow-color': '#94a3b8',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '8px',
              'color': '#475569',
              'text-background-color': '#fff',
              'text-background-opacity': 0.8,
              'text-background-padding': '2px'
            }
          }
        ],
        layout: {
          name: 'circle',
          radius: 200,
          avoidOverlap: true
        }
      });
    }
  }, [currentTab, numIFU, contribuable, open]);

  // Initialiser le graphe de réseau fournisseur
  useEffect(() => {
    if (currentTab === 4 && cyFournisseurRef.current && !cyFournisseurInstance.current && open) {
      // Données fictives pour le réseau fournisseur
      const fournisseurData = {
        nodes: [
          // Noeud central (le contribuable)
          { data: { id: numIFU, label: contribuable?.info?.NOM_MINEFID || numIFU, type: 'main' } },
          // Fournisseurs (données fictives)
          { data: { id: 'fournisseur1', label: 'Fournisseur X - Matières Premières', type: 'fournisseur', amount: 25000000 } },
          { data: { id: 'fournisseur2', label: 'Fournisseur Y - Équipements', type: 'fournisseur', amount: 18000000 } },
          { data: { id: 'fournisseur3', label: 'Fournisseur Z - Services', type: 'fournisseur', amount: 7500000 } },
          { data: { id: 'fournisseur4', label: 'Fournisseur W - Transport', type: 'fournisseur', amount: 10000000 } },
          { data: { id: 'fournisseur5', label: 'Fournisseur V - Maintenance', type: 'fournisseur', amount: 6200000 } },
        ],
        edges: [
          // Relations entre les fournisseurs et le contribuable
          { data: { source: 'fournisseur1', target: numIFU, label: '25M FCFA' } },
          { data: { source: 'fournisseur2', target: numIFU, label: '18M FCFA' } },
          { data: { source: 'fournisseur3', target: numIFU, label: '7.5M FCFA' } },
          { data: { source: 'fournisseur4', target: numIFU, label: '10M FCFA' } },
          { data: { source: 'fournisseur5', target: numIFU, label: '6.2M FCFA' } },
        ]
      };

      // Initialiser Cytoscape
      cyFournisseurInstance.current = cytoscape({
        container: cyFournisseurRef.current,
        elements: [...fournisseurData.nodes, ...fournisseurData.edges],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#f97316',
              'label': 'data(label)',
              'color': '#fff',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px',
              'width': '60px',
              'height': '60px',
              'text-wrap': 'wrap',
              'text-max-width': '80px'
            }
          },
          {
            selector: 'node[type="main"]',
            style: {
              'background-color': '#16a34a',
              'width': '80px',
              'height': '80px',
              'font-size': '12px',
              'font-weight': 'bold'
            }
          },
          {
            selector: 'node[type="fournisseur"]',
            style: {
              'background-color': '#f97316'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#94a3b8',
              'target-arrow-color': '#94a3b8',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '8px',
              'color': '#475569',
              'text-background-color': '#fff',
              'text-background-opacity': 0.8,
              'text-background-padding': '2px'
            }
          }
        ],
        layout: {
          name: 'circle',
          radius: 200,
          avoidOverlap: true
        }
      });
    }
  }, [currentTab, numIFU, contribuable, open]);

  // Charger les données douanières
  useEffect(() => {
    const loadDouaneData = async () => {
      if (currentTab === 2 && numIFU ) {
        try {
          setDouaneLoading(true);
          setDouaneError(null);
          const response = await ContribuableService.getDouaneData(numIFU);
          const data =  response?.data
         
          console.log("douanne  1",data)
          setDouaneData(data);
        } catch (err: unknown) {
          setDouaneError(err instanceof Error ? err.message : 'Erreur lors du chargement des données douanières');
        } finally {
          setDouaneLoading(false);
        }
      }
    };
    loadDouaneData();
  }, [currentTab, numIFU]);

// Composant pour les panneaux d'onglets
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};



//console.log("contribuable data" , contribuable);
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                    <Typography variant="h6" component="div">
                        Détails du Contribuable
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        N° IFU: {numIFU}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange} 
                    aria-label="Onglets détails contribuable"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab icon={<PersonIcon />} iconPosition="start" label="Fiche Contribuable" />
                    <Tab icon={<AssessmentIcon />} iconPosition="start" label="Analyse Risque" />
                    <Tab icon={<LocalShippingIcon />} iconPosition="start" label="Données Douanes" />
                    <Tab icon={<PeopleIcon />} iconPosition="start" label="Réseau Client" />
                    <Tab icon={<BusinessIcon />} iconPosition="start" label="Réseau Fournisseur" />
                </Tabs>
            </Box>

            <DialogContent dividers sx={{ minHeight: 400 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                        <Typography className='success'>Chargement des détails...</Typography>
                    </Box>
                )}
                {error && (
                    <Box sx={{ p: 3 }}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                )}
                {!loading && !error && (
                    <>
                {/* Onglet 1: Fiche contribuable  presentation du contribuable*/}
                        <TabPanel value={currentTab} index={0}>
                            {contribuable ? (() => {
                                const info = contribuable.info;

                                const formatDate = (dateString?: string): string => {
                                    if (!dateString) return 'N/A';
                                    try { return new Date(dateString).toLocaleDateString('fr-FR'); }
                                    catch { return 'N/A'; }
                                };

                                const fields: { label: string; value: string | undefined; icon?: string }[] = [
                                    { label: 'Raison Sociale', value: info?.NOM_MINEFID },
                                    { label: 'Numéro IFU', value: info?.NUM_IFU },
                                    { label: 'État', value: info?.ETAT },
                                    { label: 'Structure', value: info?.STRUCTURES },
                                    { label: 'Régime Fiscal', value: info?.CODE_REG_FISC },
                                    { label: 'Secteur d\'Activité', value: info?.CODE_SECT_ACT },
                                    { label: 'Date Dernier Avis', value: formatDate(info?.DATE_DERNIERE_AVIS) },
                                    { label: 'Date Dernière VG', value: formatDate(info?.DATE_DERNIERE_VG) },
                                    { label: 'Date Dernière VP', value: formatDate(info?.DATE_DERNIERE_VP) },
                                ];

                                return (
                                    <Box>
                                        {/* En-tête compact */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1, bgcolor: '#f0fdf4', borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
                                            <PersonIcon sx={{ color: '#16a34a', fontSize: 28 }} />
                                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" color="#15803d" noWrap>
                                                    {info?.NOM_MINEFID || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    IFU : {info?.NUM_IFU || numIFU}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                px: 1.5, py: 0.25, borderRadius: 999,
                                                bgcolor: info?.ETAT === 'ACTIF' ? '#dcfce7' : '#fee2e2',
                                                color: info?.ETAT === 'ACTIF' ? '#16a34a' : '#dc2626',
                                                fontWeight: 'bold', fontSize: 11, whiteSpace: 'nowrap'
                                            }}>
                                                {info?.ETAT || 'N/A'}
                                            </Box>
                                        </Box>

                                        {/* Grille dense 3 colonnes */}
                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 0.5 }}>
                                            {fields.map(({ label, value }) => (
                                                <Box key={label} sx={{ display: 'flex', flexDirection: 'column', px: 1, py: 0.75, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontSize: '0.6rem', lineHeight: 1.2 }}>
                                                        {label}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                                                        {value || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                        {/* Programmes de contrôle */}
                                        {contribuableProgramme && contribuableProgramme.count > 0 && (
                                            <Box sx={{ mt: 1.5 }}>
                                                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748b', fontSize: '0.65rem' }}>
                                                    Programmes de contrôle ({contribuableProgramme.count})
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                                    {contribuableProgramme.data.map((prog) => (
                                                        <Box key={prog.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75, bgcolor: prog.actif ? '#f0fdf4' : '#fafafa', borderRadius: 1, border: `1px solid ${prog.actif ? '#bbf7d0' : '#e2e8f0'}` }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: prog.actif ? '#16a34a' : '#94a3b8', flexShrink: 0 }} />
                                                            <Box sx={{ flexGrow: 1, minWidth: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.5 }}>
                                                                <Box>
                                                                    <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', lineHeight: 1.2 }}>Brigade</Typography>
                                                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3 }}>{prog.brigade || 'N/A'}</Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', lineHeight: 1.2 }}>Quantum</Typography>
                                                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3 }}>{prog.quantume || 'N/A'}</Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', lineHeight: 1.2 }}>Date</Typography>
                                                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3 }}>
                                                                        {prog.date_creation ? new Date(prog.date_creation).toLocaleDateString('fr-FR') : 'N/A'}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                            <Box sx={{ px: 0.75, py: 0.2, borderRadius: 999, bgcolor: prog.actif ? '#dcfce7' : '#f1f5f9', color: prog.actif ? '#16a34a' : '#64748b', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                                                                {prog.actif ? 'ACTIF' : 'INACTIF'}
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                        {programmeLoading && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Chargement des programmes...</Typography>
                                        )}
                                        {programmeError && (
                                            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>{programmeError}</Typography>
                                        )}

                                        {/* Formulaire de création de programme */}
                                        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                                            <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748b', fontSize: '0.65rem', display: 'block', mb: 1 }}>
                                                Ajouter au programme
                                            </Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 1, alignItems: 'flex-end' }}>
                                                <FormControl size="small" fullWidth>
                                                    <InputLabel sx={{ fontSize: '0.75rem' }}>Brigade</InputLabel>
                                                    <Select
                                                        value={formBrigade}
                                                        label="Brigade"
                                                        onChange={(e) => { setFormBrigade(e.target.value); setFormError(null); setFormSuccess(null); }}
                                                        sx={{ fontSize: '0.78rem' }}
                                                    >
                                                        {brigadesList.map((b) => (
                                                            <MenuItem key={b.id} value={b.libelle} sx={{ fontSize: '0.78rem' }}>{b.libelle}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                <FormControl size="small" fullWidth>
                                                    <InputLabel sx={{ fontSize: '0.75rem' }}>Quantum</InputLabel>
                                                    <Select
                                                        value={formQuantume}
                                                        label="Quantum"
                                                        onChange={(e) => { setFormQuantume(e.target.value); setFormError(null); setFormSuccess(null); }}
                                                        sx={{ fontSize: '0.78rem' }}
                                                    >
                                                        {quantumesList.map((q) => (
                                                            <MenuItem key={q.id} value={q.libelle} sx={{ fontSize: '0.78rem' }}>{q.libelle}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={handleCreateProgramme}
                                                    disabled={formSubmitting || !formBrigade || !formQuantume}
                                                    sx={{ height: 40, fontSize: '0.72rem', bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, whiteSpace: 'nowrap' }}
                                                >
                                                    {formSubmitting ? <CircularProgress size={16} color="inherit" /> : 'Créer'}
                                                </Button>
                                            </Box>
                                            {formError && <Alert severity="error" sx={{ mt: 1, py: 0.25, fontSize: '0.72rem' }}>{formError}</Alert>}
                                            {formSuccess && <Alert severity="success" sx={{ mt: 1, py: 0.25, fontSize: '0.72rem' }}>{formSuccess}</Alert>}
                                        </Box>

                                    </Box>
                                );
                            })() : (
                                <Typography>Aucune donnée disponible</Typography>
                            )}
                        </TabPanel>

                        {/* Onglet 1: Fiche Contribuable */}
                        <TabPanel value={currentTab} index={1}>
                            {contribuable ? (() => {
                                // Fonction utilitaire pour formater les dates
                                const formatDate = (dateString?: string): string => {
                                    if (!dateString) return 'N/A';
                                    try {
                                        return new Date(dateString).toLocaleDateString('fr-FR');
                                    } catch {
                                        return 'N/A';
                                    }
                                };

                                // Préparation des données d'informations générales
                                const infoData: InfoDataItem[] = [
                                    { label: 'Raison Sociale', value: contribuable?.info?.NOM_MINEFID || 'N/A' },
                                    { label: 'Numéro IFU', value: numIFU || 'N/A' },
                                    { label: 'Régime Fiscal', value: contribuable?.info?.CODE_REG_FISC || 'N/A' },
                                    { label: 'Secteur d\'Activité', value: contribuable?.info?.CODE_SECT_ACT || 'N/A' },
                                    { label: 'État', value: contribuable?.info?.ETAT || 'N/A' },
                                    { label: 'Structure', value: contribuable?.info?.STRUCTURES || 'N/A' },
                                    { label: 'Date Dernier Avis', value: formatDate(contribuable?.info?.DATE_DERNIERE_AVIS) },
                                    { label: 'Date Dernière VG', value: formatDate(contribuable?.info?.DATE_DERNIERE_VG) },
                                    { label: 'Date Dernière VP', value: formatDate(contribuable?.info?.DATE_DERNIERE_VP) },
                                ];

                                return (
                                    <IndicateurRiskView 
                                        numIFU={numIFU}
                                        infoData={infoData} 
                                    />
                                );
                            })() : (
                                <Typography>Aucune donnée disponible</Typography>
                            )}
                        </TabPanel>


                        {/* Onglet 3: Données Douanes */}
                        <TabPanel value={currentTab} index={2}>
                            <Typography variant="h6" gutterBottom color="primary" >
                                Données Douanières
                            </Typography>
                            {douaneLoading && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                                    <Typography>Chargement des données douanières...</Typography>
                                </Box>
                            )}
                            {douaneError && (
                                <Box sx={{ p: 2, bgcolor: '#fee', borderRadius: 1 }}>
                                    <Typography color="error">{douaneError}</Typography>
                                </Box>
                            )}
                            {!douaneLoading && !douaneError && douaneData && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {/* Statut */}
                                    {!douaneData || douaneData.length === 0 ? (
                                        <Box sx={{ p: 2, bgcolor: '#fff3cd', borderRadius: 1 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                Aucune donnée douanière trouvée pour ce contribuable (IFU: {numIFU})
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <DgdComponent data={douaneData} />
                                    )}
                                </Box>
                            )}
                        </TabPanel>

                        {/* Onglet 4: Réseau Client */}
                        <TabPanel value={currentTab} index={3}>
                            <Box>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Réseau de Clients
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Visualisation du réseau des clients du contribuable {contribuable?.info?.NOM_MINEFID || numIFU}
                                </Typography>
                                <Box 
                                    ref={cyClientRef} 
                                    sx={{ 
                                        width: '100%', 
                                        height: '500px', 
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 2,
                                        backgroundColor: '#f8fafc'
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    * Données fictives - à remplacer par les données réelles de l'API
                                </Typography>
                            </Box>
                        </TabPanel>

                        {/* Onglet 5: Réseau Fournisseur */}
                        <TabPanel value={currentTab} index={4}>
                            <Box>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Réseau de Fournisseurs
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Visualisation du réseau des fournisseurs du contribuable {contribuable?.info?.NOM_MINEFID || numIFU}
                                </Typography>
                                <Box 
                                    ref={cyFournisseurRef} 
                                    sx={{ 
                                        width: '100%', 
                                        height: '500px', 
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 2,
                                        backgroundColor: '#f8fafc'
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    * Données fictives - à remplacer par les données réelles de l'API
                                </Typography>
                            </Box>
                        </TabPanel>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" color='success'>
                    Fermer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ContribuableDetailModal;