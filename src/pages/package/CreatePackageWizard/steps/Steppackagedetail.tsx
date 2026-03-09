import React, { useEffect } from 'react';
import {
  Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, Typography, Chip, Box, OutlinedInput,
  FormControlLabel, Checkbox, Divider, FormHelperText,
  RadioGroup, Radio, FormLabel,
} from '@mui/material';
import { Place as PlaceIcon, Description as DescIcon, CalendarMonth as CalIcon } from '@mui/icons-material';
import { DatePicker }          from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns }      from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver }         from '@hookform/resolvers/zod';
import { z }                   from 'zod';
import { tab0Schema, atLeastOneDay } from '../schemas/validationSchemas';
import type {
  PackageFormData, HolidayCategory, HolidayType,
  Language, Market, PackageSupplier,
} from '@/services/package/package.models';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CityRaw       { cityId: string; cityName: string; }
interface ComponentOpt  { id: number; name: string; }

interface StepPackageDetailProps {
  formData:           Partial<PackageFormData>;
  updateFormData:     (data: Partial<PackageFormData>) => void;
  onValidationChange?:(isValid: boolean) => void;
  onDirtyChange?:     (isDirty: boolean) => void;
  isEditMode?:        boolean;
  loading?:           boolean;
  // Region / Country come as raw API shapes to avoid region.models conflict
  regions:            any[];
  countries:          any[];
  // Package dropdowns
  holidayCategories:  HolidayCategory[];
  holidayTypes:       HolidayType[];
  languages:          Language[];
  markets:            Market[];
  cities:             CityRaw[];
  suppliers:          PackageSupplier[];
  packageComponents:  ComponentOpt[];
}

type FormValues = z.infer<typeof tab0Schema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const sx = { '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } };

const toArr = (csv: string | undefined) => csv ? csv.split(',').filter(Boolean) : [];
const toCsv = (arr: string[]) => arr.join(',');

const DAYS = [
  { key: 'monday'    as const, label: 'Mon' },
  { key: 'tuesday'   as const, label: 'Tue' },
  { key: 'wednesday' as const, label: 'Wed' },
  { key: 'thursday'  as const, label: 'Thu' },
  { key: 'friday'    as const, label: 'Fri' },
  { key: 'saturday'  as const, label: 'Sat' },
  { key: 'sunday'    as const, label: 'Sun' },
];

// ── Component ─────────────────────────────────────────────────────────────────

const StepPackageDetail: React.FC<StepPackageDetailProps> = ({
  formData, updateFormData, onValidationChange,
  onDirtyChange = () => {}, // Default to no-op
  isEditMode = false,
  regions, countries,
  holidayCategories, holidayTypes, languages, markets, cities, suppliers, packageComponents,
}) => {
  const { control, watch, reset, setValue, formState: { errors, isValid, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(tab0Schema),
    mode: 'onChange',
    defaultValues: {
      regionId: formData.regionId ?? 0,
      countryIds: formData.countryIds ?? '',
      cityId: formData.cityId ?? '',
      categoryId: formData.categoryId ?? '',
      holidayType: formData.holidayType ?? '',
      packageCode: formData.packageCode ?? '',
      packageName: formData.packageName ?? '',
      departCityList: formData.departCityList ?? '',
      componentType: formData.componentType ?? '',
      languageCode: formData.languageCode ?? '',
      remarks: formData.remarks ?? '',
      supplierId: formData.supplierId ?? '0',
      status: formData.status ?? 1,
      tourType: formData.tourType ?? 'FIT',
      marketType: formData.marketType ?? '',
      days: formData.days ?? 1,
      validityFrom: formData.validityFrom ?? '',
      validityTo: formData.validityTo ?? '',
      bookingFrom: formData.bookingFrom ?? '',
      bookingTo: formData.bookingTo ?? '',
      sunday: formData.sunday ?? true,
      monday: formData.monday ?? true,
      tuesday: formData.tuesday ?? true,
      wednesday: formData.wednesday ?? true,
      thursday: formData.thursday ?? true,
      friday: formData.friday ?? true,
      saturday: formData.saturday ?? true,
      bookingType: formData.bookingType ?? '1',
      ranking: formData.ranking ?? 0,
      recommended: formData.recommended ?? false,
      deals: formData.deals ?? false,
      freesell: formData.freesell ?? false,
      shortDesc: formData.shortDesc ?? '',
      longDesc: formData.longDesc ?? '',
    },
  });

  const watched = watch();

  // Re-populate on edit-mode load (sentinel: packageCode)
  useEffect(() => {
    if (!formData.packageCode) return;
    reset({
      regionId: formData.regionId ?? 0,
      countryIds: formData.countryIds ?? '',
      cityId: formData.cityId ?? '',
      categoryId: formData.categoryId ?? '',
      holidayType: formData.holidayType ?? '',
      packageCode: formData.packageCode ?? '',
      packageName: formData.packageName ?? '',
      departCityList: formData.departCityList ?? '',
      componentType: formData.componentType ?? '',
      languageCode: formData.languageCode ?? '',
      remarks: formData.remarks ?? '',
      supplierId: formData.supplierId ?? '0',
      status: formData.status ?? 1,
      tourType: formData.tourType ?? 'FIT',
      marketType: formData.marketType ?? '',
      days: formData.days ?? 1,
      validityFrom: formData.validityFrom ?? '',
      validityTo: formData.validityTo ?? '',
      bookingFrom: formData.bookingFrom ?? '',
      bookingTo: formData.bookingTo ?? '',
      sunday: formData.sunday ?? true,
      monday: formData.monday ?? true,
      tuesday: formData.tuesday ?? true,
      wednesday: formData.wednesday ?? true,
      thursday: formData.thursday ?? true,
      friday: formData.friday ?? true,
      saturday: formData.saturday ?? true,
      bookingType: formData.bookingType ?? '1',
      ranking: formData.ranking ?? 0,
      recommended: formData.recommended ?? false,
      deals: formData.deals ?? false,
      freesell: formData.freesell ?? false,
      shortDesc: formData.shortDesc ?? '',
      longDesc: formData.longDesc ?? '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.packageCode]);

  // Sync to wizard
  useEffect(() => {
    updateFormData(watched as Partial<PackageFormData>);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watched)]);

  // Report validity (including the day check)
  useEffect(() => {
    onValidationChange?.(isValid && atLeastOneDay(watched));
  }, [isValid, watched.sunday, watched.monday, watched.tuesday, watched.wednesday,
      watched.thursday, watched.friday, watched.saturday, onValidationChange]);

  // Report dirty state to wizard
  useEffect(() => {
    if (typeof onDirtyChange === 'function') {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  const noDaySelected = !atLeastOneDay(watched);
  const allDays       = DAYS.every((d) => watched[d.key]);

  // Remove loader: let wizard handle loading state

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* ── SECTION 1: Region & Country ── */}
        <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PlaceIcon sx={{ mr: 1, color: '#f59e0b', fontSize: 26 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Region &amp; Countries</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>

              <Grid item xs={12} md={6}>
                <Controller name="regionId" control={control} render={({ field }) => {
                  // Ensure the selected value exists in the regions list, otherwise default to 0
                  const validValue = regions.some(r => r.regionId === field.value) ? field.value : 0;
                  return (
                    <FormControl fullWidth size="small" error={!!errors.regionId} disabled={isEditMode}>
                      <InputLabel>Region *</InputLabel>
                      <Select {...field} value={validValue} label="Region *" sx={sx} disabled={isEditMode}>
                        <MenuItem value={0}>--Select Region--</MenuItem>
                        {regions.map((r) => (
                          <MenuItem key={r.regionId} value={r.regionId}>{r.regionName}</MenuItem>
                        ))}
                      </Select>
                      {errors.regionId && <FormHelperText>{errors.regionId.message}</FormHelperText>}
                      {isEditMode && <FormHelperText>Region cannot be changed in edit mode</FormHelperText>}
                    </FormControl>
                  );
                }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller name="countryIds" control={control} render={({ field }) => {
                  const sel = toArr(field.value);
                  return (
                    <FormControl fullWidth size="small" error={!!errors.countryIds}
                      disabled={!watched.regionId}>
                      <InputLabel>Countries *</InputLabel>
                      <Select multiple value={sel}
                        onChange={(e) => field.onChange(toCsv(e.target.value as string[]))}
                        input={<OutlinedInput label="Countries *" />} sx={sx}
                        renderValue={(s) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(s as string[]).map((code) => {
                              const c = countries.find((x: any) => x.countryCode === code);
                              return <Chip key={code} label={c?.countryName ?? code} size="small" />;
                            })}
                          </Box>
                        )}>
                        {countries.map((c: any) => (
                          <MenuItem key={c.countryCode} value={c.countryCode}>
                            <Checkbox checked={sel.includes(c.countryCode)} size="small" />
                            {c.countryName}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.countryIds && <FormHelperText>{errors.countryIds.message}</FormHelperText>}
                      {!watched.regionId && <FormHelperText>Select a region first</FormHelperText>}
                    </FormControl>
                  );
                }} />
              </Grid>

            </Grid>
          </CardContent>
        </Card>

        {/* ── SECTION 2: Package Details ── */}
        <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DescIcon sx={{ mr: 1, color: '#f59e0b', fontSize: 26 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Package Details</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>

              {/* Language */}
              <Grid item xs={12} md={6}>
                <Controller name="languageCode" control={control} render={({ field }) => (
                  <TextField {...field} select size="small" fullWidth label="Language *" sx={sx}
                    error={!!errors.languageCode} helperText={errors.languageCode?.message}>
                    <MenuItem value="">--Select--</MenuItem>
                    {languages.map((l) => (
                      <MenuItem key={l.languageCode} value={l.languageCode}>{l.languageName}</MenuItem>
                    ))}
                  </TextField>
                )} />
              </Grid>

              {/* Holiday Category */}
              <Grid item xs={12} md={6}>
                <Controller name="categoryId" control={control} render={({ field }) => (
                  <TextField {...field} select size="small" fullWidth label="Holiday Category *" sx={sx}
                    error={!!errors.categoryId} helperText={errors.categoryId?.message}>
                    <MenuItem value="">--Select--</MenuItem>
                    {holidayCategories.map((c) => (
                      <MenuItem key={c.categoryCode} value={c.categoryCode}>{c.categoryName}</MenuItem>
                    ))}
                  </TextField>
                )} />
              </Grid>

              {/* Holiday Type (multi-select, stored as CSV of IDs) */}
              <Grid item xs={12} md={6}>
                <Controller name="holidayType" control={control} render={({ field }) => {
                  const sel = toArr(field.value);
                  return (
                    <FormControl fullWidth size="small" error={!!errors.holidayType}
                      disabled={!watched.categoryId}>
                      <InputLabel>Holiday Type *</InputLabel>
                      <Select multiple value={sel}
                        onChange={(e) => field.onChange(toCsv(e.target.value as string[]))}
                        input={<OutlinedInput label="Holiday Type *" />} sx={sx}
                        renderValue={(s) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(s as string[]).map((id) => {
                              const t = holidayTypes.find((h) => String(h.holidayTypeID) === id);
                              return <Chip key={id} label={t?.holidayTypeName ?? id} size="small" />;
                            })}
                          </Box>
                        )}>
                        {holidayTypes.length === 0
                          ? <MenuItem disabled>{watched.categoryId ? 'No types available' : 'Select a category first'}</MenuItem>
                          : holidayTypes.map((t) => (
                            <MenuItem key={t.holidayTypeID} value={String(t.holidayTypeID)}>
                              <Checkbox checked={sel.includes(String(t.holidayTypeID))} size="small" />
                              {t.holidayTypeName}
                            </MenuItem>
                          ))
                        }
                      </Select>
                      {errors.holidayType && <FormHelperText>{errors.holidayType.message}</FormHelperText>}
                    </FormControl>
                  );
                }} />
              </Grid>

              {/* Package Name */}
              <Grid item xs={12} md={6}>
                <Controller name="packageName" control={control} render={({ field }) => (
                  <TextField {...field} size="small" fullWidth label="Package Name *" sx={sx}
                    error={!!errors.packageName} helperText={errors.packageName?.message} />
                )} />
              </Grid>

              {/* Departure Cities (CSV of cityId) */}
              <Grid item xs={12} md={6}>
                <Controller name="departCityList" control={control} render={({ field }) => {
                  const sel = toArr(field.value);
                  return (
                    <FormControl fullWidth size="small" error={!!errors.departCityList}>
                      <InputLabel>Departure City *</InputLabel>
                      <Select multiple value={sel}
                        onChange={(e) => field.onChange(toCsv(e.target.value as string[]))}
                        input={<OutlinedInput label="Departure City *" />} sx={sx}
                        renderValue={(s) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(s as string[]).map((id) => {
                              const c = cities.find((ci) => ci.cityId === id);
                              return <Chip key={id} label={c?.cityName ?? id} size="small" />;
                            })}
                          </Box>
                        )}>
                        {cities.map((c) => (
                          <MenuItem key={c.cityId} value={c.cityId}>
                            <Checkbox checked={sel.includes(c.cityId)} size="small" />
                            {c.cityName}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.departCityList && <FormHelperText>{errors.departCityList.message}</FormHelperText>}
                    </FormControl>
                  );
                }} />
              </Grid>

              {/* Package Code */}
              <Grid item xs={12} md={6}>
                <Controller name="packageCode" control={control} render={({ field }) => (
                  <TextField {...field} size="small" fullWidth label="Package Code *" sx={sx}
                    error={!!errors.packageCode}
                    helperText={errors.packageCode?.message ?? 'Auto-generated if left empty'}
                    placeholder="PK000000" />
                )} />
              </Grid>

              {/* Package Components (CSV of names) */}
              <Grid item xs={12} md={6}>
                <Controller name="componentType" control={control} render={({ field }) => {
                  const sel = toArr(field.value);
                  return (
                    <FormControl fullWidth size="small" error={!!errors.componentType}>
                      <InputLabel>Package Component *</InputLabel>
                      <Select multiple value={sel}
                        onChange={(e) => field.onChange(toCsv(e.target.value as string[]))}
                        input={<OutlinedInput label="Package Component *" />} sx={sx}
                        renderValue={(s) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(s as string[]).map((v) => <Chip key={v} label={v} size="small" />)}
                          </Box>
                        )}>
                        {packageComponents.map((c) => (
                          <MenuItem key={c.id} value={c.name}>
                            <Checkbox checked={sel.includes(c.name)} size="small" />
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.componentType && <FormHelperText>{errors.componentType.message}</FormHelperText>}
                    </FormControl>
                  );
                }} />
              </Grid>

              {/* Supplier */}
              <Grid item xs={12} md={6}>
                <Controller name="supplierId" control={control} render={({ field }) => {
                  // Ensure the selected value exists in the suppliers list, otherwise default to "0"
                  const validValue = suppliers.some(s => String(s.supplierId) === String(field.value)) ? String(field.value) : '0';
                  return (
                    <TextField {...field} value={validValue} select size="small" fullWidth label="Supplier" sx={sx}>
                      <MenuItem value="0">--Select Supplier--</MenuItem>
                      {suppliers.map((s) => (
                        <MenuItem key={s.supplierId} value={String(s.supplierId)}>{s.supplierName}</MenuItem>
                      ))}
                    </TextField>
                  );
                }} />
              </Grid>

              {/* Destination Cities (CSV of cityId) */}
              <Grid item xs={12} md={6}>
                <Controller name="cityId" control={control} render={({ field }) => {
                  const sel = toArr(field.value);
                  return (
                    <FormControl fullWidth size="small" error={!!errors.cityId}>
                      <InputLabel>Destination / Cities *</InputLabel>
                      <Select multiple value={sel}
                        onChange={(e) => field.onChange(toCsv(e.target.value as string[]))}
                        input={<OutlinedInput label="Destination / Cities *" />} sx={sx}
                        renderValue={(s) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(s as string[]).map((id) => {
                              const c = cities.find((ci) => ci.cityId === id);
                              return <Chip key={id} label={c?.cityName ?? id} size="small" />;
                            })}
                          </Box>
                        )}>
                        {cities.map((c) => (
                          <MenuItem key={c.cityId} value={c.cityId}>
                            <Checkbox checked={sel.includes(c.cityId)} size="small" />
                            {c.cityName}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.cityId && <FormHelperText>{errors.cityId.message}</FormHelperText>}
                    </FormControl>
                  );
                }} />
              </Grid>

              {/* Remarks */}
              <Grid item xs={12} md={6}>
                <Controller name="remarks" control={control} render={({ field }) => (
                  <TextField {...field} size="small" fullWidth multiline rows={3} label="Remarks" sx={sx}
                    inputProps={{ maxLength: 300 }}
                    helperText={`${(field.value ?? '').length}/300`} />
                )} />
              </Grid>

              {/* Active */}
              <Grid item xs={12}>
                <Controller name="status" control={control} render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox checked={field.value === 1}
                        onChange={(e) => field.onChange(e.target.checked ? 1 : 0)} size="small" />
                    }
                    label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Active</Typography>}
                  />
                )} />
              </Grid>

            </Grid>
          </CardContent>
        </Card>

        {/* ── SECTION 3: Validity ── */}
        <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalIcon sx={{ mr: 1, color: '#f59e0b', fontSize: 26 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Package Validity</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>

              {/* Tour Type */}
              <Grid item xs={12}>
                <FormControl component="fieldset" error={!!errors.tourType}>
                  <FormLabel>Tour Type *</FormLabel>
                  <Controller name="tourType" control={control} render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel value="FIT" control={<Radio />} label="Fixed Itinerary Tours" />
                      <FormControlLabel value="GIT" control={<Radio />} label="Group Tours" />
                    </RadioGroup>
                  )} />
                  {errors.tourType && <FormHelperText>{errors.tourType.message}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Market */}
              <Grid item xs={12} md={6}>
                <Controller name="marketType" control={control} render={({ field }) => (
                  <TextField {...field} select fullWidth label="Market" sx={sx} size="small"
                    value={field.value ?? ''}>
                    <MenuItem value="">--Select Market--</MenuItem>
                    {markets.map((m) => (
                      <MenuItem key={m.marketId} value={String(m.marketId)}>{m.marketName}</MenuItem>
                    ))}
                  </TextField>
                )} />
              </Grid>

              {/* Duration */}
              <Grid item xs={12} md={6}>
                <Controller name="days" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth type="number" label="Duration (Days) *"
                    sx={sx} size="small" error={!!errors.days} helperText={errors.days?.message}
                    inputProps={{ min: 1 }}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                )} />
              </Grid>

              {/* Validity From / To */}
              <Grid item xs={12} md={6}>
                <Controller name="validityFrom" control={control} render={({ field }) => (
                  <DatePicker label="Validity From *" sx={sx}
                    value={field.value ? new Date(field.value) : null}
                    onChange={(d) => field.onChange(d?.toISOString().split('T')[0] ?? '')}
                    slotProps={{ textField: { fullWidth: true, size: 'small',
                      error: !!errors.validityFrom, helperText: errors.validityFrom?.message } }} />
                )} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller name="validityTo" control={control} render={({ field }) => (
                  <DatePicker label="Validity To *" sx={sx}
                    value={field.value ? new Date(field.value) : null}
                    onChange={(d) => field.onChange(d?.toISOString().split('T')[0] ?? '')}
                    slotProps={{ textField: { fullWidth: true, size: 'small',
                      error: !!errors.validityTo, helperText: errors.validityTo?.message } }} />
                )} />
              </Grid>

              {/* Booking From / To */}
              <Grid item xs={12} md={6}>
                <Controller name="bookingFrom" control={control} render={({ field }) => (
                  <DatePicker label="Booking From *" sx={sx}
                    value={field.value ? new Date(field.value) : null}
                    onChange={(d) => field.onChange(d?.toISOString().split('T')[0] ?? '')}
                    slotProps={{ textField: { fullWidth: true, size: 'small',
                      error: !!errors.bookingFrom, helperText: errors.bookingFrom?.message } }} />
                )} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller name="bookingTo" control={control} render={({ field }) => (
                  <DatePicker label="Booking To *" sx={sx}
                    value={field.value ? new Date(field.value) : null}
                    onChange={(d) => field.onChange(d?.toISOString().split('T')[0] ?? '')}
                    slotProps={{ textField: { fullWidth: true, size: 'small',
                      error: !!errors.bookingTo, helperText: errors.bookingTo?.message } }} />
                )} />
              </Grid>

              {/* Valid Days */}
              <Grid item xs={12}>
                <FormControl component="fieldset" error={noDaySelected}>
                  <FormLabel>Valid Days *</FormLabel>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    {DAYS.map((d) => (
                      <FormControlLabel key={d.key}
                        control={
                          <Checkbox checked={!!watched[d.key]}
                            onChange={() => setValue(d.key, !watched[d.key], { shouldValidate: true })} />
                        }
                        label={d.label}
                      />
                    ))}
                    <FormControlLabel
                      control={
                        <Checkbox checked={allDays}
                          onChange={(e) =>
                            DAYS.forEach((d) => setValue(d.key, e.target.checked, { shouldValidate: true }))
                          } />
                      }
                      label="All"
                    />
                  </Box>
                  {noDaySelected && <FormHelperText>At least one valid day is required</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Flags */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {(['recommended', 'deals', 'freesell'] as const).map((key) => (
                    <Controller key={key} name={key} control={control} render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={key === 'freesell' ? 'Free Sell' : key.charAt(0).toUpperCase() + key.slice(1)}
                      />
                    )} />
                  ))}
                </Box>
              </Grid>

              {/* Seq No + Booking Type */}
              <Grid item xs={12} md={6}>
                <Controller name="ranking" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth type="number" label="Seq No" sx={sx} size="small"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                )} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller name="bookingType" control={control} render={({ field }) => {
                  // Ensure booking type is either "1" or "2", otherwise default to "1"
                  const validValue = ['1', '2'].includes(String(field.value)) ? String(field.value) : '1';
                  return (
                    <TextField {...field} value={validValue} select fullWidth label="Booking Type *"
                      error={!!errors.bookingType} helperText={errors.bookingType?.message}
                      sx={sx} size="small">
                      <MenuItem value="1">Offline</MenuItem>
                      <MenuItem value="2">Online</MenuItem>
                    </TextField>
                  );
                }} />
              </Grid>

            </Grid>
          </CardContent>
        </Card>

        {/* ── SECTION 4: Descriptions ── */}
        <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Package Description</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Controller name="shortDesc" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth multiline rows={4} label="Brief Description *"
                    error={!!errors.shortDesc}
                    helperText={errors.shortDesc?.message ?? `${(field.value ?? '').length}/300`}
                    inputProps={{ maxLength: 300 }} />
                )} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller name="longDesc" control={control} render={({ field }) => (
                  <TextField {...field} fullWidth multiline rows={6} label="Full Description *"
                    error={!!errors.longDesc}
                    helperText={errors.longDesc?.message ?? `${(field.value ?? '').length}/8000`}
                    inputProps={{ maxLength: 8000 }} />
                )} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

      </Box>
    </LocalizationProvider>
  );
};

export default StepPackageDetail;