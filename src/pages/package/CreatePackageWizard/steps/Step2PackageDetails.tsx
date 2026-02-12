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
} from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { packageService } from '@/services/package/package.service';
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

  const languages = [
    { value: 'English', label: 'English' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'French', label: 'French' },
  ];

  const {
    control,
    watch,
    formState: { errors, isValid },
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      languageCode: formData.languageCode || 'English',
      holidayCategoryCode: formData.holidayCategoryCode || '',
      holidayTypeIds: formData.holidayTypeIds || [],
      packageName: formData.packageName || '',
      departureCityIds: formData.departureCityIds || [],
      packageCode: formData.packageCode || '',
      packageComponents: formData.packageComponents || [],
      destinationCityIds: formData.destinationCityIds || [],
      supplierName: formData.supplierName || '',
      remarks: formData.remarks || '',
      isActive: formData.isActive ?? true,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    updateFormData(watchedValues);
    onValidationChange(isValid);
  }, [watchedValues, isValid]);

  const fetchDropdownData = async () => {
    try {
      const categories = await packageService.getHolidayCategoryList();
      setHolidayCategories(categories);

      // Mock data - replace with actual API calls
      setHolidayTypes([
        { id: 1, name: 'Adventures Trip' },
        { id: 2, name: 'Religious Tour' },
        { id: 3, name: 'Beach Holiday' },
      ]);

      setDepartureCities([
        { id: 1, name: 'Delhi(India)' },
        { id: 2, name: 'Rishikesh(India)' },
        { id: 3, name: 'Mumbai(India)' },
      ]);

      setSuppliers([
        { id: 1, name: 'Supplier A' },
        { id: 2, name: 'Supplier B' },
      ]);

      setPackageComponents([
        { id: 1, name: 'Hotel' },
        { id: 2, name: 'Meals' },
        { id: 3, name: 'Tour Guide' },
      ]);

      setDestinationCities([
        { id: 1, name: 'Agartala' },
        { id: 2, name: 'Agatti Island' },
        { id: 3, name: 'Ahmedabad' },
      ]);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DescriptionIcon sx={{ mr: 1, color: '#f59e0b' }} />
            <Typography variant="h6">Basic Information</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="languageCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Language *"
                    error={!!errors.languageCode}
                    helperText={errors.languageCode?.message}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="holidayCategoryCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Holiday Category *"
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

            <Grid item xs={12}>
              <Controller
                name="holidayTypeIds"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.holidayTypeIds}>
                    <InputLabel>Holiday Type *</InputLabel>
                    <Select
                      {...field}
                      multiple
                      input={<OutlinedInput label="Holiday Type *" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const type = holidayTypes.find((t) => t.id === value);
                            return <Chip key={value} label={type?.name} size="small" />;
                          })}
                        </Box>
                      )}
                    >
                      {holidayTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          <Checkbox checked={field.value.includes(type.id)} />
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.holidayTypeIds && (
                      <FormHelperText>{errors.holidayTypeIds.message}</FormHelperText>
                    )}
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                      (Press Ctrl for multiple selection)
                    </Typography>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="packageName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Package Name *"
                    error={!!errors.packageName}
                    helperText={errors.packageName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="departureCityIds"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.departureCityIds}>
                    <InputLabel>Departure City *</InputLabel>
                    <Select
                      {...field}
                      multiple
                      input={<OutlinedInput label="Departure City *" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const city = departureCities.find((c) => c.id === value);
                            return <Chip key={value} label={city?.name} size="small" />;
                          })}
                        </Box>
                      )}
                    >
                      {departureCities.map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                          <Checkbox checked={field.value.includes(city.id)} />
                          {city.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.departureCityIds && (
                      <FormHelperText>{errors.departureCityIds.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="packageCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Package Code *"
                    error={!!errors.packageCode}
                    helperText={errors.packageCode?.message || 'Auto-generated if left empty'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="supplierName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Supplier Name"
                    error={!!errors.supplierName}
                    helperText={errors.supplierName?.message}
                  >
                    <MenuItem value="">--Select Supplier--</MenuItem>
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="packageComponents"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.packageComponents}>
                    <InputLabel>Package Component *</InputLabel>
                    <Select
                      {...field}
                      multiple
                      input={<OutlinedInput label="Package Component *" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const comp = packageComponents.find((c) => c.name === value);
                            return <Chip key={value} label={comp?.name} size="small" />;
                          })}
                        </Box>
                      )}
                    >
                      {packageComponents.map((comp) => (
                        <MenuItem key={comp.id} value={comp.name}>
                          <Checkbox checked={field.value.includes(comp.name)} />
                          {comp.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.packageComponents && (
                      <FormHelperText>{errors.packageComponents.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="destinationCityIds"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.destinationCityIds}>
                    <InputLabel>Destination / Cities *</InputLabel>
                    <Select
                      {...field}
                      multiple
                      input={<OutlinedInput label="Destination / Cities *" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const city = destinationCities.find((c) => c.id === value);
                            return <Chip key={value} label={city?.name} size="small" />;
                          })}
                        </Box>
                      )}
                    >
                      {destinationCities.map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                          <Checkbox checked={field.value.includes(city.id)} />
                          {city.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.destinationCityIds && (
                      <FormHelperText>{errors.destinationCityIds.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth multiline rows={3} label="Remarks" />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Active"
                  />
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Step2PackageDetails;