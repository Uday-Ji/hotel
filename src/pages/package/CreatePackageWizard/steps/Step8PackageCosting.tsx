import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Divider,
  Alert,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MonetizationOn as MonetizationOnIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { packageService } from '@/services/package/package.service';
import FormModal from '@/components/common/FormModal/FormModal';
import type { PackageFormData } from '@/services/package/package.models';

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface Step8Props {
  formData: Partial<PackageFormData>;
  updateFormData: (data: Partial<PackageFormData>) => void;
  packageId: number;
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const PRICE_ROWS = [
  { label: 'Adult – Single Sharing', amountKey: 'sgl' as const, commentKey: 'sglComment' as const, statusKey: 'singleStatus' as const },
  { label: 'Adult – Twin Sharing',   amountKey: 'twin' as const, commentKey: 'twinComment' as const, statusKey: 'twinStatus' as const },
  { label: 'Adult – Triple Sharing', amountKey: 'triple' as const, commentKey: 'tripleComment' as const, statusKey: 'tripleStatus' as const },
  { label: 'Child with Bed',         amountKey: 'cwb' as const, commentKey: 'cwbComment' as const, statusKey: 'childwithbedStatus' as const },
  { label: 'Child without Bed',      amountKey: 'cnb' as const, commentKey: 'cnbComment' as const, statusKey: 'childwithoutbedStatus' as const },
  { label: 'Infant',                 amountKey: 'infant' as const, commentKey: 'infantComment' as const, statusKey: 'infantStatus' as const },
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];

// ── VALIDATION SCHEMA ─────────────────────────────────────────────────────────

const costingSchema = z.object({
  pkgCategoryId:        z.number().min(1, 'Package Category is required'),
  validFrom:            z.string().min(1, 'Validity From is required'),
  validTo:              z.string().min(1, 'Validity To is required'),
  minimumDeposit:       z.number().min(0),
  depositTypeInPercent: z.boolean(),
  currency:             z.string().min(1, 'Currency is required'),
  sgl:    z.number().min(0),
  twin:   z.number().min(0),
  triple: z.number().min(0),
  cwb:    z.number().min(0),
  cnb:    z.number().min(0),
  infant: z.number().min(0),
  sglComment:    z.string().optional().default(''),
  twinComment:   z.string().optional().default(''),
  tripleComment: z.string().optional().default(''),
  cwbComment:    z.string().optional().default(''),
  cnbComment:    z.string().optional().default(''),
  infantComment: z.string().optional().default(''),
  singleStatus:         z.boolean(),
  twinStatus:           z.boolean(),
  tripleStatus:         z.boolean(),
  childwithbedStatus:   z.boolean(),
  childwithoutbedStatus: z.boolean(),
  infantStatus:         z.boolean(),
});

type CostingFormData = z.infer<typeof costingSchema>;

const DEFAULT_VALUES: CostingFormData = {
  pkgCategoryId: 0,
  validFrom: '',
  validTo: '',
  minimumDeposit: 0,
  depositTypeInPercent: false,
  currency: 'INR',
  sgl: 0, twin: 0, triple: 0, cwb: 0, cnb: 0, infant: 0,
  sglComment: '', twinComment: '', tripleComment: '', cwbComment: '', cnbComment: '', infantComment: '',
  singleStatus: true, twinStatus: true, tripleStatus: true,
  childwithbedStatus: true, childwithoutbedStatus: true, infantStatus: true,
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

const toInputFormat = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

// ── COMPONENT ─────────────────────────────────────────────────────────────────

const Step8PackageCosting: React.FC<Step8Props> = ({ packageId }) => {
  const [costings, setCostings]                 = useState<any[]>([]);
  const [packageCategories, setPackageCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading]               = useState(true);
  const [isSaving, setIsSaving]                 = useState(false);
  const [modalOpen, setModalOpen]               = useState(false);
  const [editingItem, setEditingItem]           = useState<any | null>(null);
  const [error, setError]                       = useState<string | null>(null);
  const [success, setSuccess]                   = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CostingFormData>({
    resolver: zodResolver(costingSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // ── Load ───────────────────────────────────────────────────────────────────

  const loadCostings = useCallback(async () => {
    if (!packageId) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const data: any = await packageService.getPackageCosting(packageId);
      setCostings(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      setError('Failed to load costing records');
      setCostings([]);
    } finally {
      setIsLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    loadCostings();
    packageService.getPackageCategoryList().then((cats: any) => {
      const list = Array.isArray(cats) ? cats : (cats?.data ?? cats ?? []);
      setPackageCategories(list);
    });
  }, [loadCostings]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // ── Modal ──────────────────────────────────────────────────────────────────

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      reset({
        pkgCategoryId:        item.packageCategoryId || 0,
        validFrom:            toInputFormat(item.validFrom),
        validTo:              toInputFormat(item.validTo),
        minimumDeposit:       item.minimumDeposit ?? 0,
        depositTypeInPercent: !!item.depositTypeInPercent,
        currency:             item.currency || 'INR',
        sgl:    item.sgl    ?? 0,
        twin:   item.twin   ?? 0,
        triple: item.triple ?? 0,
        cwb:    item.cwb    ?? 0,
        cnb:    item.cnb    ?? 0,
        infant: item.infant ?? 0,
        sglComment:    item.sglComment    || '',
        twinComment:   item.twinComment   || '',
        tripleComment: item.tripleComment || '',
        cwbComment:    item.cwbComment    || '',
        cnbComment:    item.cnbComment    || '',
        infantComment: item.infantComment || '',
        singleStatus:          item.singlePriceStatus    ?? true,
        twinStatus:            item.twinPriceStatus      ?? true,
        tripleStatus:          item.triplePriceStatus    ?? true,
        childwithbedStatus:    item.chdwithbedPriceStatus   ?? true,
        childwithoutbedStatus: item.chdwithoutbedPriceStatus ?? true,
        infantStatus:          item.infantPriceStatus    ?? true,
      });
    } else {
      setEditingItem(null);
      reset(DEFAULT_VALUES);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    reset(DEFAULT_VALUES);
  };

  const handleSave = async (values: CostingFormData) => {
    setIsSaving(true);
    try {
      const payload = {
        priceId:              editingItem?.priceId || 0,
        packageId,
        validFrom:            new Date(values.validFrom).toISOString(),
        validTo:              new Date(values.validTo).toISOString(),
        pkgCategoryId:        values.pkgCategoryId,
        sgl:                  values.sgl,
        twin:                 values.twin,
        triple:               values.triple,
        cwb:                  values.cwb,
        cnb:                  values.cnb,
        infant:               values.infant,
        minimumDeposit:       values.minimumDeposit,
        depositTypeInPercent: values.depositTypeInPercent ? 1 : 0,
        currency:             values.currency,
        sglComment:           values.sglComment,
        twinComment:          values.twinComment,
        tripleComment:        values.tripleComment,
        cwbComment:           values.cwbComment,
        cnbComment:           values.cnbComment,
        infantComment:        values.infantComment,
        status:               1,
        userId:               1,
        singleStatus:          values.singleStatus          ? 1 : 0,
        twinStatus:            values.twinStatus            ? 1 : 0,
        tripleStatus:          values.tripleStatus          ? 1 : 0,
        childwithbedStatus:    values.childwithbedStatus    ? 1 : 0,
        childwithoutbedStatus: values.childwithoutbedStatus ? 1 : 0,
        infantStatus:          values.infantStatus          ? 1 : 0,
      };
      await packageService.postPackageCosting(payload);
      setSuccess(editingItem ? 'Costing record updated' : 'Costing record added');
      handleCloseModal();
      await loadCostings();
    } catch {
      setError('Failed to save costing record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (priceId: number) => {
    if (!window.confirm('Delete this costing record?')) return;
    try {
      await packageService.deletePackageCosting(priceId);
      setSuccess('Costing record deleted');
      await loadCostings();
    } catch {
      setError('Failed to delete costing record');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Package Costing ({costings.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #5a3a7d 100%)' },
              }}
            >
              Add Costing
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {error   && <Alert severity="error"   onClose={() => setError(null)}   sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

          {/* Grid */}
          {costings.length === 0 ? (
            <Alert severity="info">No costing records added yet. Click "Add Costing" to begin.</Alert>
          ) : (
<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1100 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Valid From</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Valid To</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Min. Dep.</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Currency</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>SGL</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Twin</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Triple</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>CWB</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>CNB</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Infant</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {costings.map((row: any, idx: number) => (
                    <TableRow key={row.priceId ?? idx} hover>
                      <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{row.pkgCategory || row.packageCatetory || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{row.validFrom || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{row.validTo   || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {row.minimumDeposit ?? 0}{row.depositTypeInPercent ? ' %' : ''}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem' }}>{row.currency || '—'}</TableCell>
                      {[
                        { amt: row.sgl,    status: row.singlePriceStatus,       comment: row.sglComment },
                        { amt: row.twin,   status: row.twinPriceStatus,         comment: row.twinComment },
                        { amt: row.triple, status: row.triplePriceStatus,       comment: row.tripleComment },
                        { amt: row.cwb,    status: row.chdwithbedPriceStatus,   comment: row.cwbComment },
                        { amt: row.cnb,    status: row.chdwithoutbedPriceStatus, comment: row.cnbComment },
                        { amt: row.infant, status: row.infantPriceStatus,       comment: row.infantComment },
                      ].map((cell, ci) => (
                        <TableCell key={ci} align="center" sx={{ fontSize: '0.8125rem' }}>
                          {cell.status ? (
                            <Tooltip title={cell.comment || ''} placement="top">
                              <span>{cell.amt != null ? cell.amt : '—'}</span>
                            </Tooltip>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Chip
                          label={row.currentStatus || (row.status ? 'Active' : 'Inactive')}
                          size="small"
                          color={row.currentStatus === 'Inactive' || row.status === false ? 'default' : 'success'}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={() => handleOpenModal(row)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(row.priceId)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* ── ADD / EDIT MODAL ─────────────────────────────────────────────────── */}
      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit(handleSave)}
        title={editingItem ? 'Edit Package Costing' : 'Add Package Costing'}
        isEditing={!!editingItem}
        isSubmitting={isSaving}
        icon={<MonetizationOnIcon />}
        maxWidth="lg"
      >
        <Grid container spacing={2}>

          {/* Row 1: Package Category | Validity From | Validity To | Min Deposit */}
          <Grid item xs={12} md={3}>
            <Controller
              name="pkgCategoryId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Package Category *"
                  error={!!errors.pkgCategoryId}
                  helperText={errors.pkgCategoryId?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value={0}>--Select Category--</MenuItem>
                  {packageCategories.map((cat: any, i: number) => (
                    <MenuItem key={cat.pkgCategoryId ?? i} value={cat.pkgCategoryId}>
                      {cat.pkgCategory || cat.packageCategoryName || cat.categoryName || cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Controller
              name="validFrom"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="datetime-local"
                  label="Validity From *"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.validFrom}
                  helperText={errors.validFrom?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Controller
              name="validTo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="datetime-local"
                  label="Validity To *"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.validTo}
                  helperText={errors.validTo?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Controller
              name="minimumDeposit"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Min. Deposit"
                  inputProps={{ min: 0 }}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
            <Controller
              name="depositTypeInPercent"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      size="small"
                    />
                  }
                  label="%"
                  sx={{ m: 0 }}
                />
              )}
            />
          </Grid>

          {/* Row 2: Currency */}
          <Grid item xs={12} md={3}>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Currency *"
                  error={!!errors.currency}
                  helperText={errors.currency?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  {CURRENCIES.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Price Details Table */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1.5 }}>
              Price Details
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 56 }}>Include</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Price Detail</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 140 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Comment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PRICE_ROWS.map((row) => (
                    <TableRow key={row.amountKey}>
                      <TableCell>
                        <Controller
                          name={row.statusKey}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              size="small"
                              sx={{ p: 0 }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                        {row.label}
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={row.amountKey}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              size="small"
                              inputProps={{ min: 0, style: { textAlign: 'right' } }}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={row.commentKey}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              placeholder="Optional"
                              fullWidth
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                            />
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </FormModal>
    </Box>
  );
};

export default Step8PackageCosting;
