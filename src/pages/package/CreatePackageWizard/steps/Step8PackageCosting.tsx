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
  minimumDeposit: z.number().min(0, 'Minimum deposit must be positive'),
});

type CostingFormData = z.infer<typeof costingSchema>;

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
    { key: 'singleSharing', label: 'Adult on single sharing basis' },
    { key: 'twinSharing', label: 'Adult on Twin Sharing basis' },
    { key: 'tripleSharing', label: 'Adult on triple sharing basis' },
    { key: 'childWithBed', label: 'Child with bed' },
    { key: 'childWithoutBed', label: 'Child without bed' },
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

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<CostingFormData>({
    resolver: zodResolver(costingSchema),
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

  // Validation check
  const isValid =
    watchedValues.packageCategoryId > 0 &&
    watchedValues.validityFrom !== '' &&
    watchedValues.validityTo !== '' &&
    watchedValues.minimumDeposit >= 0;
  onValidationChange(isValid);
}, [watchedValues, priceDetails]); // Removed onValidationChange and updateFormData from deps
  const handlePriceChange = (
    index: number,
    field: keyof PriceDetail,
    value: string | number | boolean
  ) => {
    const updated = [...priceDetails];
    updated[index] = { ...updated[index], [field]: value };
    setPriceDetails(updated);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          Note: Mark checkbox checked if you want to add departure cost in the package costing otherwise remain it unchecked
        </Alert>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#f59e0b' }}>
              Package Costing
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Package Validity"
                  value="Package Validity"
                  disabled
                  helperText="Auto-filled from package details"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="packageCategoryId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Package Category *"
                      error={!!errors.packageCategoryId}
                      helperText={errors.packageCategoryId?.message}
                    >
                      <MenuItem value={0}>--Select Category--</MenuItem>
                      {packageCategories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Controller
                  name="validityFrom"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="From *"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.validityFrom,
                          helperText: errors.validityFrom?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Controller
                  name="validityTo"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="To *"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.validityTo,
                          helperText: errors.validityTo?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Price Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Price Detail</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {currencies[0].code}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {currencies[1].code}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {currencies[2].code}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pricingTypes.map((type, index) => (
                    <TableRow key={type.key} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Checkbox
                            checked={priceDetails[index]?.isChecked || false}
                            onChange={(e) =>
                              handlePriceChange(index, 'isChecked', e.target.checked)
                            }
                            size="small"
                          />
                          <Typography variant="body2">{type.label}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={priceDetails[index]?.currency1 || 0}
                          onChange={(e) =>
                            handlePriceChange(index, 'currency1', parseFloat(e.target.value) || 0)
                          }
                          disabled={!priceDetails[index]?.isChecked}
                          inputProps={{ min: 0, step: 0.01 }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={priceDetails[index]?.currency2 || 0}
                          onChange={(e) =>
                            handlePriceChange(index, 'currency2', parseFloat(e.target.value) || 0)
                          }
                          disabled={!priceDetails[index]?.isChecked}
                          inputProps={{ min: 0, step: 0.01 }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={priceDetails[index]?.currency3 || 0}
                          onChange={(e) =>
                            handlePriceChange(index, 'currency3', parseFloat(e.target.value) || 0)
                          }
                          disabled={!priceDetails[index]?.isChecked}
                          inputProps={{ min: 0, step: 0.01 }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={priceDetails[index]?.comment || ''}
                          onChange={(e) => handlePriceChange(index, 'comment', e.target.value)}
                          disabled={!priceDetails[index]?.isChecked}
                          fullWidth
                          placeholder="Optional"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="minimumDeposit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Minimum Deposit"
                      error={!!errors.minimumDeposit}
                      helperText={errors.minimumDeposit?.message}
                      inputProps={{ min: 0, step: 0.01 }}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default Step8PackageCosting;