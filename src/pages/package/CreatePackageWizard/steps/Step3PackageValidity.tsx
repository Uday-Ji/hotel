import React, { useEffect } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Checkbox,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreatePackageRequest } from '@/services/package/package.models';

interface Step3Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

const step3Schema = z.object({
  tourType: z.enum(['fixed', 'group'], { required_error: 'Tour type is required' }),
  marketId: z.number().optional(),
  validityFrom: z.string().min(1, 'Validity from date is required'),
  validityTo: z.string().min(1, 'Validity to date is required'),
  bookingFrom: z.string().min(1, 'Booking from date is required'),
  bookingTo: z.string().min(1, 'Booking to date is required'),
  validDays: z.array(z.string()).min(1, 'At least one valid day is required'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day'),
  isRecommended: z.boolean(),
  isDeals: z.boolean(),
  seqNo: z.number().optional(),
  bookingType: z.enum(['online', 'offline'], { required_error: 'Booking type is required' }),
  isFreeSell: z.boolean(),
  briefDescription: z
    .string()
    .min(10, 'Brief description must be at least 10 characters')
    .max(300, 'Brief description cannot exceed 300 characters'),
  fullDescription: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(8000, 'Description cannot exceed 8000 characters'),
});

type Step3FormData = z.infer<typeof step3Schema>;

const Step3PackageValidity: React.FC<Step3Props> = ({
  formData,
  updateFormData,
  onValidationChange,
}) => {
  const markets = [
    { id: 1, name: 'Market A' },
    { id: 2, name: 'Market B' },
  ];

  const weekDays = [
    { key: 'Mon', label: 'Mon' },
    { key: 'Tue', label: 'Tue' },
    { key: 'Wed', label: 'Wed' },
    { key: 'Thu', label: 'Thu' },
    { key: 'Fri', label: 'Fri' },
    { key: 'Sat', label: 'Sat' },
    { key: 'Sun', label: 'Sun' },
  ];

  const {
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    mode: 'onChange',
    defaultValues: {
      tourType: formData.tourType || 'fixed',
      marketId: formData.marketId || undefined,
      validityFrom: formData.validityFrom || '',
      validityTo: formData.validityTo || '',
      bookingFrom: formData.bookingFrom || '',
      bookingTo: formData.bookingTo || '',
      validDays: formData.validDays || [],
      durationDays: formData.durationDays || 1,
      isRecommended: formData.isRecommended || false,
      isDeals: formData.isDeals || false,
      seqNo: formData.seqNo || undefined,
      bookingType: formData.bookingType || 'offline',
      isFreeSell: formData.isFreeSell || false,
      briefDescription: formData.briefDescription || '',
      fullDescription: formData.fullDescription || '',
    },
  });

  const watchedValues = watch();
  const validDays = watch('validDays');

  useEffect(() => {
    updateFormData(watchedValues);
    onValidationChange(isValid);
  }, [watchedValues, isValid]);

  const handleDayToggle = (day: string) => {
    const currentDays = validDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    setValue('validDays', newDays, { shouldValidate: true });
  };

  const handleAllDaysToggle = (checked: boolean) => {
    if (checked) {
      setValue('validDays', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], {
        shouldValidate: true,
      });
    } else {
      setValue('validDays', [], { shouldValidate: true });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarIcon sx={{ mr: 1, color: '#f59e0b' }} />
              <Typography variant="h6">Package Validity</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset" error={!!errors.tourType}>
                  <FormLabel>Tour Type *</FormLabel>
                  <Controller
                    name="tourType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel
                          value="fixed"
                          control={<Radio />}
                          label="Fixed Itinerary Tours"
                        />
                        <FormControlLabel value="group" control={<Radio />} label="Group Tours" />
                      </RadioGroup>
                    )}
                  />
                  {errors.tourType && <FormHelperText>{errors.tourType.message}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="marketId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Market"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <MenuItem value="">--Select Market--</MenuItem>
                      {markets.map((market) => (
                        <MenuItem key={market.id} value={market.id}>
                          {market.name}
                        </MenuItem>
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
                      label="To *"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
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

              <Grid item xs={12} md={3}>
                <Controller
                  name="bookingFrom"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Booking From *"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.bookingFrom,
                          helperText: errors.bookingFrom?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="bookingTo"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="To *"
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.bookingTo,
                          helperText: errors.bookingTo?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset" error={!!errors.validDays}>
                  <FormLabel>Valid Days *</FormLabel>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    {weekDays.map((day) => (
                      <FormControlLabel
                        key={day.key}
                        control={
                          <Checkbox
                            checked={(validDays || []).includes(day.key)}
                            onChange={() => handleDayToggle(day.key)}
                          />
                        }
                        label={day.label}
                      />
                    ))}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={(validDays || []).length === 7}
                          onChange={(e) => handleAllDaysToggle(e.target.checked)}
                        />
                      }
                      label="All"
                    />
                  </Box>
                  {errors.validDays && <FormHelperText>{errors.validDays.message}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="durationDays"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Duration (Days) *"
                      error={!!errors.durationDays}
                      helperText={errors.durationDays?.message}
                      inputProps={{ min: 1 }}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={9}>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Controller
                    name="isRecommended"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Recommended"
                      />
                    )}
                  />
                  <Controller
                    name="isDeals"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Deals"
                      />
                    )}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="seqNo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Seq No"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="bookingType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Booking Type *"
                      error={!!errors.bookingType}
                      helperText={errors.bookingType?.message}
                    >
                      <MenuItem value="offline">Offline</MenuItem>
                      <MenuItem value="online">Online</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="isFreeSell"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Free Sell"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Package Description
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="briefDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Brief Description *"
                      error={!!errors.briefDescription}
                      helperText={
                        errors.briefDescription?.message ||
                        `${field.value.length} / 300 characters`
                      }
                      inputProps={{ maxLength: 300 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="fullDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={6}
                      label="Description *"
                      error={!!errors.fullDescription}
                      helperText={
                        errors.fullDescription?.message ||
                        `${field.value.length} / 8000 characters`
                      }
                      inputProps={{ maxLength: 8000 }}
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

export default Step3PackageValidity;