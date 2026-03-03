// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Card,
//   CardContent,
//   Typography,
//   Grid,
//   FormHelperText,
//   Chip,
//   OutlinedInput,
//   Checkbox,
//   CircularProgress,
//   Alert,
// } from '@mui/material';
// import { Place as PlaceIcon } from '@mui/icons-material';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// // import { regionService } from '@/services/common/region.service';
// import type { Region, Country } from '@/services/common/region.models';
// import type { CreatePackageRequest } from '@/services/package/package.models';

// interface Step1Props {
//   formData: Partial<CreatePackageRequest>;
//   updateFormData: (data: Partial<CreatePackageRequest>) => void;
//   onValidationChange?: (isValid: boolean) => void;
//   isEditMode?: boolean;
//   regions: Region[];
//   countries: Country[];
//   loadingRegions?: boolean;
//   loadingCountries?: boolean;
// }

// const step1Schema = z.object({
//   regionId: z.number().min(1, 'Region is required'),
//   countryIds: z.array(z.string()).min(1, 'At least one country is required'),
// });

// type Step1FormData = z.infer<typeof step1Schema>;

// const Step1SelectRegion: React.FC<Step1Props> = (props) => {
//   const {
//     formData,
//     updateFormData,
//     onValidationChange,
//     isEditMode = false,
//     regions,
//     countries,
//     loadingRegions,
//     loadingCountries,
//   } = props;
//   const [error, setError] = useState<string | null>(null);

//   const {
//     control,
//     watch,
//     // setValue,
//     formState: { errors, isValid },
//   } = useForm<Step1FormData>({
//     resolver: zodResolver(step1Schema),
//     mode: 'onChange',
//     defaultValues: {
//       regionId: formData.regionId || 0,
//       countryIds: Array.isArray(formData.countryIds)
//         ? formData.countryIds.map(String)
//         : [],
//     },
//   });

//   const watchedValues = watch();
//   const selectedRegionId = watch('regionId');

//   // No fetching here; handled by wizard

//   // Update parent form data
//   useEffect(() => {
//     updateFormData({
//       regionId: watchedValues.regionId,
//       countryIds: watchedValues.countryIds,
//     });
//   }, [watchedValues]);

//   // Update validation state
//   useEffect(() => {
//     onValidationChange?.(isValid);
//   }, [isValid, onValidationChange]);

//   // No fetching here; handled by wizard

//   const compactFieldSx = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 2,
//       backgroundColor: '#fff',
//     },
//   };

//   return (
//     <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
//       <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
//         <CardContent>
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//             <PlaceIcon sx={{ mr: 1, color: '#f59e0b', fontSize: 28 }} />
//             <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
//               Select Region & Countries
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//             Choose the region and countries for your travel package
//           </Typography>

//           {error && (
//             <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
//               {error}
//             </Alert>
//           )}

//           <Grid container spacing={2.5}>
//             {/* Region Select */}
//             <Grid item xs={12} md={6}>
//               <Controller
//                 name="regionId"
//                 control={control}
//                 render={({ field }) => (
//                   <FormControl fullWidth size="small" error={!!errors.regionId} disabled={isEditMode}>
//                     <InputLabel>Region *</InputLabel>
//                     <Select
//                       {...field}
//                       label="Region *"
//                       sx={compactFieldSx}
//                       disabled={loadingRegions || isEditMode}
//                       endAdornment={
//                         loadingRegions ? (
//                           <CircularProgress size={20} sx={{ mr: 2 }} />
//                         ) : null
//                       }
//                     >
//                       <MenuItem value={0}>--Select Region--</MenuItem>
//                       {regions.map((region: any) => (
//                         <MenuItem key={region.regionId} value={region.regionId}>
//                           {region.regionName}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                     {errors.regionId && (
//                       <FormHelperText>{errors.regionId.message}</FormHelperText>
//                     )}
//                     {isEditMode && (
//                       <FormHelperText>
//                         Region cannot be changed in edit mode
//                       </FormHelperText>
//                     )}
//                   </FormControl>
//                 )}
//               />
//             </Grid>

//             {/* Countries Multi-Select */}
//             <Grid item xs={12} md={6}>
//               <Controller
//                 name="countryIds"
//                 control={control}
//                 render={({ field }) => (
//                   <FormControl
//                     fullWidth
//                     size="small"
//                     error={!!errors.countryIds}
//                     disabled={!selectedRegionId || loadingCountries}
//                   >
//                     <InputLabel>Countries *</InputLabel>
//                     <Select
//                       {...field}
//                       multiple
//                       input={<OutlinedInput label="Countries *" />}
//                       sx={compactFieldSx}
//                       disabled={!selectedRegionId || loadingCountries}
//                       endAdornment={
//                           loadingCountries ? (
//                             <CircularProgress size={20} sx={{ mr: 2 }} />
//                           ) : null
//                         }
//                       renderValue={(selected) => (
//                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                           {selected.map((countryCode: any) => {
//                             const country = countries.find(
//                               (c: any) => c.countryCode === countryCode
//                             );
//                             return (
//                               <Chip
//                                 key={countryCode}
//                                 label={country?.countryName || countryCode}
//                                 size="small"
//                               />
//                             );
//                           })}
//                         </Box>
//                       )}
//                     >
//                       {countries.length === 0 && selectedRegionId > 0 && !loadingCountries && (
//                         <MenuItem disabled>No countries available</MenuItem>
//                       )}
//                       {countries.map((country: any) => (
//                         <MenuItem key={country.countryCode} value={country.countryCode}>
//                           <Checkbox
//                             checked={field.value.includes(country.countryCode)}
//                             size="small"
//                           />
//                           {country.countryName}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                     {errors.countryIds && (
//                       <FormHelperText>{errors.countryIds.message}</FormHelperText>
//                     )}
//                     {!selectedRegionId && (
//                       <FormHelperText>Please select a region first</FormHelperText>
//                     )}
//                   </FormControl>
//                 )}
//               />
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default Step1SelectRegion;