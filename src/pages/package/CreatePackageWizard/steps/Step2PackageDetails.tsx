import React, { useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  OutlinedInput,
  FormControlLabel,
  Checkbox,
  Divider,
  FormHelperText,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { packageService } from '@/services/package/package.service';
import { regionService } from '@/services/common/region.service';
import type { CreatePackageRequest } from '@/services/package/package.models';
import type { HolidayCategory } from '@/services/package/package.models';

interface Step2Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

const step2Schema = z.object({
  languageCode: z.string().min(1, 'Language is required'),
  holidayCategoryCode: z.string().min(1, 'Holiday category is required'),
  holidayTypeIds: z.array(z.number()).min(1, 'At least one holiday type is required'),
  packageName: z.string().min(3, 'Package name must be at least 3 characters'),
  departureCityIds: z.array(z.number()).min(1, 'At least one departure city is required'),
  packageCode: z.string().min(1, 'Package code is required'),
  packageComponents: z.array(z.string()).min(1, 'At least one component is required'),
  destinationCityIds: z.array(z.number()).min(1, 'At least one destination is required'),
  supplierName: z.string().optional(),
  remarks: z.string().optional(),
  isActive: z.boolean(),
});

type Step2FormData = z.infer<typeof step2Schema>;

const Step2PackageDetails: React.FC<Step2Props> = ({ formData, updateFormData, onValidationChange }) => {
  const [holidayCategories, setHolidayCategories] = useState<HolidayCategory[]>([]);
  const [holidayTypes, setHolidayTypes] = useState<any[]>([]);
  const [departureCities, setDepartureCities] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [packageComponents, setPackageComponents] = useState<any[]>([]);
  const [destinationCities, setDestinationCities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [languages, setLanguages] = useState<any[]>([]);

  const {
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      languageCode: formData.languageCode || '',
      holidayCategoryCode: formData.holidayCategoryCode || '',
      holidayTypeIds: [],
      packageName: formData.packageName || '',
      departureCityIds: [],
      packageCode: formData.packageCode || '',
      packageComponents: [],
      destinationCityIds: [],
      supplierName: formData.supplierName || '',
      remarks: formData.remarks || '',
      isActive: formData.isActive ?? true,
    },
  });

  const watchedValues = watch();
  const selectedHolidayCategoryCode = watch('holidayCategoryCode');

  // Fetch dropdown data on mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Update form data when values change
  useEffect(() => {
    updateFormData(watchedValues);
  }, [watchedValues, updateFormData]);

  // Update validation state when form validity changes
  useEffect(() => {
    onValidationChange(isValid);
  }, [isValid, onValidationChange]);

  // Fetch holiday types when category changes
  useEffect(() => {
    if (selectedHolidayCategoryCode) {
      packageService.getHolidayTypeList(selectedHolidayCategoryCode).then((data) => {
        const types = data.map((type: any) => ({
          id: Number(type.holidayTypeID || type.id),
          name: String(type.holidayTypeName || type.name),
        }));
        setHolidayTypes(types);
      }).catch(err => {
        console.error('Error loading holiday types:', err);
        setHolidayTypes([]);
      });
      setValue('holidayTypeIds', []);
    } else {
      setHolidayTypes([]);
      setValue('holidayTypeIds', []);
    }
  }, [selectedHolidayCategoryCode, setValue]);

  const fetchDropdownData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [categoriesData, citiesData, suppliersData, languagesData] = await Promise.all([
        regionService.getHolidayCategoryList('SMT'),
        packageService.getCitiesList(),
        packageService.PackageSuppliersList(),
        packageService.getLanguageList(),
      ]);

      setHolidayCategories(categoriesData);
      setLanguages(languagesData);

      // Process cities - use INDEX as numeric id, store original cityId for submission
      const processedCities = citiesData.map((city: any, index: number) => ({
        id: index, // Use numeric index as id
        cityId: String(city.cityId || city.cityCode), // Store original cityId for API
        name: String(city.cityName || city.cName),
      }));

      setDepartureCities(processedCities);
      setDestinationCities(processedCities);

      setSuppliers(
        suppliersData.map((supplier: any, index: number) => ({
          id: Number(supplier.supplierId || supplier.id || index),
          name: String(supplier.supplierName || supplier.name || 'Unknown'),
        }))
      );

      setPackageComponents([
        { id: 1, name: 'Hotel' },
        { id: 2, name: 'Meals' },
        { id: 3, name: 'Tour Guide' },
        { id: 4, name: 'Transport' },
        { id: 5, name: 'Sightseeing' },
      ]);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
      setError('Failed to load form data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const compactFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: '#fff',
    },
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DescriptionIcon sx={{ mr: 1, color: '#f59e0b', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Basic Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2.5}>
              {/* Language */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="languageCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      fullWidth
                      label="Language *"
                      sx={compactFieldSx}
                      error={!!errors.languageCode}
                      helperText={errors.languageCode?.message}
                    >
                      <MenuItem value="">--Select Language--</MenuItem>
                      {languages.map((lang) => (
                        <MenuItem key={lang.languageCode} value={lang.languageCode}>
                          {lang.languageName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Holiday Category */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="holidayCategoryCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      fullWidth
                      label="Holiday Category *"
                      sx={compactFieldSx}
                      error={!!errors.holidayCategoryCode}
                      helperText={errors.holidayCategoryCode?.message}
                    >
                      <MenuItem value="">--Select Category--</MenuItem>
                      {holidayCategories.map((cat) => (
                        <MenuItem key={cat.categoryCode} value={cat.categoryCode}>
                          {cat.categoryName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Holiday Type */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="holidayTypeIds"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.holidayTypeIds} disabled={!selectedHolidayCategoryCode}>
                      <InputLabel>Holiday Type *</InputLabel>
                      <Select
                        multiple
                        value={field.value || []}
                        onChange={field.onChange}
                        input={<OutlinedInput label="Holiday Type *" />}
                        sx={compactFieldSx}
                        renderValue={(selected) => {
                          if (!Array.isArray(selected) || selected.length === 0) return '';
                          const chips = selected
                            .map((value) => {
                              const type = holidayTypes.find((t) => Number(t.id) === Number(value));
                              return type ? <Chip key={`ht-${value}`} label={type.name} size="small" /> : null;
                            })
                            .filter(Boolean);
                          if (chips.length === 0) return '';
                          return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{chips}</Box>;
                        }}
                      >
                        {holidayTypes.length === 0 ? (
                          <MenuItem disabled value="">
                            {selectedHolidayCategoryCode ? 'Loading...' : 'Select a category first'}
                          </MenuItem>
                        ) : (
                          holidayTypes.map((type) => (
                            <MenuItem key={`ht-item-${type.id}`} value={type.id}>
                              <Checkbox 
                                checked={Array.isArray(field.value) && field.value.some(v => Number(v) === Number(type.id))} 
                                size="small" 
                              />
                              {type.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {errors.holidayTypeIds && <FormHelperText>{String(errors.holidayTypeIds.message)}</FormHelperText>}
                      {!selectedHolidayCategoryCode && <FormHelperText>Please select a holiday category first</FormHelperText>}
                      {selectedHolidayCategoryCode && holidayTypes.length > 0 && (
                        <FormHelperText>(Press Ctrl for multiple selection)</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Package Name */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="packageName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      label="Package Name *"
                      sx={compactFieldSx}
                      error={!!errors.packageName}
                      helperText={errors.packageName?.message}
                      placeholder="Enter package name"
                    />
                  )}
                />
              </Grid>

              {/* Departure City - NOW USING STRING IDs */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="departureCityIds"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.departureCityIds}>
                      <InputLabel>Departure City *</InputLabel>
                      <Select
                        multiple
                        value={field.value || []}
                        onChange={field.onChange}
                        input={<OutlinedInput label="Departure City *" />}
                        sx={compactFieldSx}
                        renderValue={(selected) => {
                          if (!Array.isArray(selected) || selected.length === 0) return '';
                          const chips = selected
                            .map((value) => {
                              // Numeric comparison with index
                              const city = departureCities.find((c) => c.id === value);
                              return city ? <Chip key={`dep-${value}`} label={city.name} size="small" /> : null;
                            })
                            .filter(Boolean);
                          if (chips.length === 0) return '';
                          return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{chips}</Box>;
                        }}
                      >
                        {departureCities.map((city) => (
                          <MenuItem key={`dep-item-${city.id}`} value={city.id}>
                            <Checkbox 
                              checked={Array.isArray(field.value) && field.value.includes(city.id)} 
                              size="small" 
                            />
                            {city.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.departureCityIds && <FormHelperText>{String(errors.departureCityIds.message)}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Package Code */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="packageCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      label="Package Code *"
                      sx={compactFieldSx}
                      error={!!errors.packageCode}
                      helperText={errors.packageCode?.message || 'Auto-generated if left empty'}
                      placeholder="PK000000"
                    />
                  )}
                />
              </Grid>

              {/* Package Components */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="packageComponents"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.packageComponents}>
                      <InputLabel>Package Component *</InputLabel>
                      <Select
                        multiple
                        value={field.value || []}
                        onChange={field.onChange}
                        input={<OutlinedInput label="Package Component *" />}
                        sx={compactFieldSx}
                        renderValue={(selected) => {
                          if (!Array.isArray(selected) || selected.length === 0) return '';
                          const chips = selected
                            .map((value) => <Chip key={`comp-${value}`} label={value} size="small" />)
                            .filter(Boolean);
                          if (chips.length === 0) return '';
                          return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{chips}</Box>;
                        }}
                      >
                        {packageComponents.map((comp) => (
                          <MenuItem key={`comp-item-${comp.id}`} value={comp.name}>
                            <Checkbox 
                              checked={Array.isArray(field.value) && field.value.includes(comp.name)} 
                              size="small" 
                            />
                            {comp.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.packageComponents && <FormHelperText>{errors.packageComponents.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Supplier Name */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="supplierName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      fullWidth
                      label="Supplier Name"
                      sx={compactFieldSx}
                      error={!!errors.supplierName}
                      helperText={errors.supplierName?.message}
                    >
                      <MenuItem value="">--Select Supplier--</MenuItem>
                      {suppliers.map((supplier) => (
                        <MenuItem key={`sup-${supplier.id}`} value={supplier.name}>
                          {supplier.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Destination Cities - NOW USING STRING IDs */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="destinationCityIds"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.destinationCityIds}>
                      <InputLabel>Destination / Cities *</InputLabel>
                      <Select
                        multiple
                        value={field.value || []}
                        onChange={field.onChange}
                        input={<OutlinedInput label="Destination / Cities *" />}
                        sx={compactFieldSx}
                        renderValue={(selected) => {
                          if (!Array.isArray(selected) || selected.length === 0) return '';
                          const chips = selected
                            .map((value) => {
                              // Numeric comparison with index
                              const city = destinationCities.find((c) => c.id === value);
                              return city ? <Chip key={`dest-${value}`} label={city.name} size="small" /> : null;
                            })
                            .filter(Boolean);
                          if (chips.length === 0) return '';
                          return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{chips}</Box>;
                        }}
                      >
                        {destinationCities.map((city) => (
                          <MenuItem key={`dest-item-${city.id}`} value={city.id}>
                            <Checkbox 
                              checked={Array.isArray(field.value) && field.value.includes(city.id)} 
                              size="small" 
                            />
                            {city.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.destinationCityIds && <FormHelperText>{String(errors.destinationCityIds.message)}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Remarks */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      label="Remarks"
                      sx={compactFieldSx}
                      placeholder="Enter any additional notes or remarks"
                      inputProps={{ maxLength: 300 }}
                      helperText={`${(field.value || '').length}/300 characters`}
                    />
                  )}
                />
              </Grid>

              {/* Active Checkbox */}
              <Grid item xs={12}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} size="small" />}
                      label={<Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Active</Typography>}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
};

export default Step2PackageDetails;
