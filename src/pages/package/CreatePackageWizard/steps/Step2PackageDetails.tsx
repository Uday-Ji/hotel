// import React, { useEffect } from 'react';
// import {
//   Grid, TextField, FormControl, InputLabel, Select, MenuItem,
//   Card, CardContent, Typography, Chip, Box, OutlinedInput,
//   FormControlLabel, Checkbox, Divider, FormHelperText, Paper, CircularProgress,
// } from '@mui/material';
// import { Description as DescriptionIcon } from '@mui/icons-material';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { step2Schema } from '../schemas/validationSchemas';
// import type { PackageFormData, HolidayCategory, HolidayType, Language, City, PackageSupplier } from '@/services/package/package.models';

// // ── Prop types ────────────────────────────────────────────────────────────────

// interface ComponentOption { id: number; name: string; }

// interface Step2Props {
//   formData:         Partial<PackageFormData>;
//   updateFormData:   (data: Partial<PackageFormData>) => void;
//   onValidationChange?: (isValid: boolean) => void;
//   // dropdowns — all owned and fetched by the wizard
//   holidayCategories: HolidayCategory[];
//   holidayTypes:      HolidayType[];
//   languages:         Language[];
//   cities:            City[];          // same list for departure + destination
//   suppliers:         PackageSupplier[];
//   packageComponents: ComponentOption[];
//   loadingDropdowns?: boolean;
// }

// type Step2FormData = z.infer<typeof step2Schema>;

// const sx = { '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } };

// // ── Helpers: CSV ↔ array ──────────────────────────────────────────────────────

// const toArr   = (csv: string | undefined): string[]  => csv ? csv.split(',').filter(Boolean) : [];
// const toCsv   = (arr: string[]): string => arr.join(',');

// // ── Component ─────────────────────────────────────────────────────────────────

// const Step2PackageDetails: React.FC<Step2Props> = ({
//   formData,
//   updateFormData,
//   onValidationChange = () => {},
//   holidayCategories,
//   holidayTypes,
//   languages,
//   cities,
//   suppliers,
//   packageComponents,
//   loadingDropdowns = false,
// }) => {
//   const {
//     control,
//     watch,
//     reset,
//     formState: { errors, isValid },
//   } = useForm<Step2FormData>({
//     resolver: zodResolver(step2Schema),
//     mode: 'onChange',
//     defaultValues: {
//       categoryId:     formData.categoryId     ?? '',
//       holidayType:    formData.holidayType    ?? '',
//       packageName:    formData.packageName    ?? '',
//       packageCode:    formData.packageCode    ?? '',
//       departCityList: formData.departCityList ?? '',
//       componentType:  formData.componentType  ?? '',
//       cityId:         formData.cityId         ?? '',
//       languageCode:   formData.languageCode   ?? '',
//       supplierId:     formData.supplierId     ?? '0',
//       remarks:        formData.remarks        ?? '',
//       status:         formData.status         ?? 1,
//     },
//   });

//   const watchedValues = watch();
//   const selectedCategory = watch('categoryId');

//   // Re-populate when edit-mode data arrives (sentinel: packageCode)
//   useEffect(() => {
//     reset({
//       categoryId:     formData.categoryId     ?? '',
//       holidayType:    formData.holidayType    ?? '',
//       packageName:    formData.packageName    ?? '',
//       packageCode:    formData.packageCode    ?? '',
//       departCityList: formData.departCityList ?? '',
//       componentType:  formData.componentType  ?? '',
//       cityId:         formData.cityId         ?? '',
//       languageCode:   formData.languageCode   ?? '',
//       supplierId:     formData.supplierId     ?? '0',
//       remarks:        formData.remarks        ?? '',
//       status:         formData.status         ?? 1,
//     });
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [formData.packageCode]);

//   // Sync up to wizard
//   useEffect(() => {
//     updateFormData(watchedValues);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [JSON.stringify(watchedValues)]);

//   useEffect(() => { onValidationChange(isValid); }, [isValid, onValidationChange]);

//   if (loadingDropdowns) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
//         <CircularProgress size={28} />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
//       <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
//         <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
//           <CardContent>
//             <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//               <DescriptionIcon sx={{ mr: 1, color: '#f59e0b', fontSize: 28 }} />
//               <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>Basic Information</Typography>
//             </Box>
//             <Divider sx={{ mb: 3 }} />

//             <Grid container spacing={2.5}>

//               {/* Language */}
//               <Grid item xs={12} md={6}>
//                 <Controller name="languageCode" control={control} render={({ field }) => (
//                   <TextField {...field} select size="small" fullWidth label="Language *" sx={sx}
//                     error={!!errors.languageCode} helperText={errors.languageCode?.message}>
//                     <MenuItem value="">--Select Language--</MenuItem>
//                     {languages.map((l) => (
//                       <MenuItem key={l.languageCode} value={l.languageCode}>{l.languageName}</MenuItem>
//                     ))}
//                   </TextField>
//                 )} />
//               </Grid>

//               {/* Holiday Category — stores categoryCode directly */}
//               <Grid item xs={12} md={6}>
//                 <Controller name="categoryId" control={control} render={({ field }) => (
//                   <TextField {...field} select size="small" fullWidth label="Holiday Category *" sx={sx}
//                     error={!!errors.categoryId} helperText={errors.categoryId?.message}>
//                     <MenuItem value="">--Select Category--</MenuItem>
//                     {holidayCategories.map((c) => (
//                       <MenuItem key={c.categoryCode} value={c.categoryCode}>{c.categoryName}</MenuItem>
//                     ))}
//                   </TextField>
//                 )} />
//               </Grid>

//               {/* Holiday Type — stored as CSV of holidayTypeIDs */}
//               <Grid item xs={12} md={6}>
//                 <Controller name="holidayType" control={control} render={({ field }) => {
//                   const selected = toArr(field.value);
//                   return (
//                     <FormControl fullWidth size="small" error={!!errors.holidayType} disabled={!selectedCategory}>
//                       <InputLabel>Holiday Type *</InputLabel>
//                       <Select
//                         multiple
//                         value={selected}
//                         onChange={(e) => field.onChange(toCsv(e.target.value as string[]))}
//                         input={<OutlinedInput label="Holiday Type *" />}
//                         sx={sx}
//                         renderValue={(sel) => (
//                           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                             {(sel as string[]).map((id) => {
//                               const t = holidayTypes.find((h) => String(h.holidayTypeID) === id);
//                               return t ? <Chip key={id} label={t.holidayTypeName} size="small" /> : null;
//                             })}
//                           </Box>
//                         )}
//                       >
//                         {holidayTypes.length === 0
//                           ? <MenuItem disabled>{selectedCategory ? 'No types available' : 'Select a category first'}</MenuItem>
//                           : holidayTypes.map((t) => (
//                             <MenuItem key={t.holidayTypeID} value={String(t.holidayTypeID)}>
//                               <Checkbox checked={selected.includes(String(t.holidayTypeID))} size="small" />
//                               {t.holidayTypeName}
//                             </MenuItem>
//                           ))
//                         }
//                       </Select>
//                       {errors.holidayType && <FormHelperText>{errors.holidayType.message}</FormHelperText>}
//                       {!selectedCategory && <FormHelperText>Please select a holiday category first</FormHelperText>}
//                     </FormControl>
//                   );
//                 }} />
//               </Grid>

//               {/* Package Name */}
//               <Grid item xs={12} md={6}>
//                 <Controller name="packageName" control={control} render={({ field }) => (
//                   <TextField {...field} size="small" fullWidth label="Package Name *" sx={sx}
//                     error={!!errors.packageName} helperText={errors.packageName?.message}
//                     placeholder="Enter package name" />
//                 )} />
//               </Grid>

//               {/* Departure Cities — stored as CSV of cityId strings */}
//               <Grid item xs={12} md={6}>
//                 <Controller name="departCityList" control={control} render={({ field }) => {
//                   const selected = toArr(field.value);
//                   return (
//                     <FormControl fullWidth size="small" error={!!errors.departCityList}>
//                       <InputLabel>Departure City *</InputLabel>
//                       <Select
//                         multiple
//                         value={selected}
//                         onChange={(e) => field.onChange(toCsv(e.target.value as string[]))}
//                         input={<OutlinedInput label="Departure City *" />}
//                         sx={sx}
//                         renderValue={(sel) => (
//                           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                             {(sel as string[]).map((id) => {
//                               const c = cities.find((ci) => ci.cityId === id);
//                               return <Chip key={id} label={c?.cityName ?? id} size="small" />;
//                             })}
//                           </Box>
//                         )}
//                       >
//                         {cities.map((c) => (
//                           <MenuItem key={c.cityId} value={c.cityId}>
//                             <Checkbox checked={selected.includes(c.cityId)} size="small" />
//                             {c.cityName}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                       {errors.departCityList && <FormHelperText>{errors.departCityList.message}</FormHelperText>}
//                     </FormControl>
//                   );
//                 }} />
//               </Grid>

//               {/* Package Code */}
//               <Grid item xs={12} md={6}>
//                 <Controller name="packageCode" control={control} render={({ field }) => (
//                   <TextField {...field} size="small" fullWidth label="Package Code *" sx={sx}
//                     error={!!errors.packageCode}
//                     helperText={errors.packageCode?.message ?? 'Auto-generated if left empty'}
//                     placeholder="PK000000" />
//                 )} />
//               </Grid>

//               {/* Package Components — stored as CSV of component names */}
//               <Grid item xs={12} md={6}>
//                 <Controller name="componentType" control={control} render={({ field }) => {
//                   const selected = toArr(field.value);
//                   return (
//                     <FormControl fullWidth size="small" error={!!errors.componentType}>
//                       <InputLabel>Package Component *</InputLabel>
//                       <Select
//                         multiple
//                         value={selected}
//                         onChange={(e) => field.onChange(toCsv(e.target.value as string[]))}
//                         input={<OutlinedInput label="Package Component *" />}
//                         sx={sx}
//                         renderValue={(sel) => (
//                           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                             {(sel as string[]).map((v) => <Chip key={v} label={v} size="small" />)}
//                           </Box>
//                         )}
//                       >
//                         {packageComponents.map((comp) => (
//                           <MenuItem key={comp.id} value={comp.name}>
//                             <Checkbox checked={selected.includes(comp.name)} size="small" />
//                             {comp.name}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                       {errors.componentType && <FormHelperText>{errors.componentType.message}</FormHelperText>}
//                     </FormControl>
//                   );
//                 }} />
//               </Grid>

//               {/* Supplier — stores supplierId string */}
//               <Grid item xs={12} md={6}>
//                 <Controller name="supplierId" control={control} render={({ field }) => (
//                   <TextField {...field} select size="small" fullWidth label="Supplier Name" sx={sx}>
//                     <MenuItem value="0">--Select Supplier--</MenuItem>
//                     {suppliers.map((s) => (
//                       <MenuItem key={s.supplierId} value={String(s.supplierId)}>{s.supplierName}</MenuItem>
//                     ))}
//                   </TextField>
//                 )} />
//               </Grid>

//               {/* Destination Cities — stored as CSV of cityId strings */}
//               <Grid item xs={12} md={6}>
//                 <Controller name="cityId" control={control} render={({ field }) => {
//                   const selected = toArr(field.value);
//                   return (
//                     <FormControl fullWidth size="small" error={!!errors.cityId}>
//                       <InputLabel>Destination / Cities *</InputLabel>
//                       <Select
//                         multiple
//                         value={selected}
//                         onChange={(e) => field.onChange(toCsv(e.target.value as string[]))}
//                         input={<OutlinedInput label="Destination / Cities *" />}
//                         sx={sx}
//                         renderValue={(sel) => (
//                           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                             {(sel as string[]).map((id) => {
//                               const c = cities.find((ci) => ci.cityId === id);
//                               return <Chip key={id} label={c?.cityName ?? id} size="small" />;
//                             })}
//                           </Box>
//                         )}
//                       >
//                         {cities.map((c) => (
//                           <MenuItem key={c.cityId} value={c.cityId}>
//                             <Checkbox checked={selected.includes(c.cityId)} size="small" />
//                             {c.cityName}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                       {errors.cityId && <FormHelperText>{errors.cityId.message}</FormHelperText>}
//                     </FormControl>
//                   );
//                 }} />
//               </Grid>

//               {/* Remarks */}
//               <Grid item xs={12} md={6}>
//                 <Controller name="remarks" control={control} render={({ field }) => (
//                   <TextField {...field} size="small" fullWidth multiline rows={3} label="Remarks" sx={sx}
//                     placeholder="Additional notes" inputProps={{ maxLength: 300 }}
//                     helperText={`${(field.value ?? '').length}/300 characters`} />
//                 )} />
//               </Grid>

//               {/* Active */}
//               <Grid item xs={12}>
//                 <Controller name="status" control={control} render={({ field }) => (
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={field.value === 1}
//                         onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
//                         size="small"
//                       />
//                     }
//                     label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Active</Typography>}
//                   />
//                 )} />
//               </Grid>

//             </Grid>
//           </CardContent>
//         </Card>
//       </Paper>
//     </Box>
//   );
// };

// export default Step2PackageDetails;