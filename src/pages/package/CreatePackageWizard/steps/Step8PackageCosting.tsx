import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreatePackageRequest, PriceDetail } from '@/services/package/package.models';

interface Step8Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

const costingSchema = z.object({
  packageCategoryId: z.number().min(1, 'Package category is required'),
  validityFrom: z.string().min(1, 'Validity from is required'),
  validityTo: z.string().min(1, 'Validity to is required'),
  minimumDeposit: z.number().min(0),
});

type CostingFormData = z.infer<typeof costingSchema>;

const compactFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' },
};

const Step8PackageCosting: React.FC<Step8Props> = ({ formData, updateFormData, onValidationChange }) => {
  const packageCategories = [
    { id: 1, name: 'Budget' },
    { id: 2, name: 'Standard' },
    { id: 3, name: 'Premium' },
    { id: 4, name: 'Luxury' },
  ];

  const currencies = [
    { id: 1, code: 'USD', symbol: '$' },
    { id: 2, code: 'EUR', symbol: '€' },
    { id: 3, code: 'INR', symbol: '₹' },
  ];

  const pricingTypes = [
    { key: 'singleSharing', label: 'Adult – Single Sharing' },
    { key: 'twinSharing', label: 'Adult – Twin Sharing' },
    { key: 'tripleSharing', label: 'Adult – Triple Sharing' },
    { key: 'childWithBed', label: 'Child with Bed' },
    { key: 'childWithoutBed', label: 'Child without Bed' },
    { key: 'infant', label: 'Infant' },
  ];

  const [priceDetails, setPriceDetails] = useState<PriceDetail[]>(
    pricingTypes.map((type) => ({
      pricingType: type.key,
      isChecked: true,
      currency1: 0,
      currency2: 0,
      currency3: 0,
      comment: '',
    }))
  );

  const { control, watch, formState: { errors } } = useForm<CostingFormData>({
    resolver: zodResolver(costingSchema),
    mode: 'onChange',
    defaultValues: {
      packageCategoryId: formData.costing?.packageCategoryId || 0,
      validityFrom: formData.costing?.validityFrom || '',
      validityTo: formData.costing?.validityTo || '',
      minimumDeposit: formData.costing?.minimumDeposit || 0,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    updateFormData({
      costing: {
        packageValidityId: 0,
        packageCategoryId: watchedValues.packageCategoryId,
        validityFrom: watchedValues.validityFrom,
        validityTo: watchedValues.validityTo,
        priceDetails,
        minimumDeposit: watchedValues.minimumDeposit,
        isActive: true,
      },
    });
    const isValid =
      watchedValues.packageCategoryId > 0 &&
      !!watchedValues.validityFrom &&
      !!watchedValues.validityTo;
    onValidationChange(isValid);
  }, [watchedValues, priceDetails]);

  const handlePriceChange = (index: number, field: keyof PriceDetail, value: string | number | boolean) => {
    const updated = [...priceDetails];
    updated[index] = { ...updated[index], [field]: value };
    setPriceDetails(updated);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="info" sx={{ mb: 2, '& .MuiAlert-message': { fontSize: '0.8125rem' } }}>
          Check the rows you wish to include in package costing. Unchecked rows will be excluded.
        </Alert>

        {/* Costing Header */}
        <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
              Package Costing
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <Controller
                  name="packageCategoryId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      size="small"
                      label="Package Category *"
                      sx={compactFieldSx}
                      error={!!errors.packageCategoryId}
                      helperText={errors.packageCategoryId?.message}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      <MenuItem value={0}>--Select Category--</MenuItem>
                      {packageCategories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="validityFrom"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Validity From *"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          sx: compactFieldSx,
                          error: !!errors.validityFrom,
                          helperText: errors.validityFrom?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="validityTo"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Validity To *"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          sx: compactFieldSx,
                          error: !!errors.validityTo,
                          helperText: errors.validityTo?.message,
                        },
                      }}
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
                      size="small"
                      type="number"
                      label="Min. Deposit"
                      sx={compactFieldSx}
                      inputProps={{ min: 0, step: 0.01 }}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Price Details Table */}
        <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
              Price Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', minWidth: 200 }}>
                      Price Detail
                    </TableCell>
                    {currencies.map((c) => (
                      <TableCell key={c.id} align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', minWidth: 110 }}>
                        {c.code} ({c.symbol})
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', minWidth: 140 }}>
                      Comment
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pricingTypes.map((type, index) => {
                    const isChecked = priceDetails[index]?.isChecked;
                    return (
                      <TableRow
                        key={type.key}
                        hover
                        sx={{
                          '&:last-child td': { border: 0 },
                          opacity: isChecked ? 1 : 0.5,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Checkbox
                              checked={isChecked || false}
                              onChange={(e) => handlePriceChange(index, 'isChecked', e.target.checked)}
                              size="small"
                            />
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#374151' }}>
                              {type.label}
                            </Typography>
                          </Box>
                        </TableCell>
                        {['currency1', 'currency2', 'currency3'].map((cur) => (
                          <TableCell key={cur} align="center" sx={{ px: 1 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={priceDetails[index]?.[cur as keyof PriceDetail] || 0}
                              onChange={(e) => handlePriceChange(index, cur as keyof PriceDetail, parseFloat(e.target.value) || 0)}
                              disabled={!isChecked}
                              inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right', fontSize: '0.8125rem', padding: '4px 8px' } }}
                              sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': { borderRadius: 1, backgroundColor: isChecked ? '#fff' : '#f9fafb' },
                              }}
                            />
                          </TableCell>
                        ))}
                        <TableCell sx={{ px: 1 }}>
                          <TextField
                            size="small"
                            value={priceDetails[index]?.comment || ''}
                            onChange={(e) => handlePriceChange(index, 'comment', e.target.value)}
                            disabled={!isChecked}
                            fullWidth
                            placeholder="Optional"
                            inputProps={{ style: { fontSize: '0.8125rem', padding: '4px 8px' } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, backgroundColor: isChecked ? '#fff' : '#f9fafb' } }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default Step8PackageCosting;