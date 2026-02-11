import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchHotelById,
  createHotel,
  updateHotel,
  clearCurrentHotel,
} from '@/store/slices/hotelSlice';
import { fetchCountries, fetchCitiesByCountry } from '@/store/slices/masterSlice';
import styles from './AddEditHotel.module.css';

const hotelSchema = z.object({
  hotelCode: z.string().min(1, 'Hotel code is required'),
  hotelName: z.string().min(1, 'Hotel name is required'),
  address: z.string().min(1, 'Address is required'),
  countryId: z.number().min(1, 'Country is required'),
  cityId: z.number().min(1, 'City is required'),
  starRating: z.number().min(1).max(5, 'Star rating must be between 1 and 5'),
  hotelCategoryId: z.number().min(1, 'Category is required'),
  currencyId: z.number().min(1, 'Currency is required'),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
});

type HotelFormData = z.infer<typeof hotelSchema>;

const AddEditHotel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('view') === 'true';
  const isEditMode = !!id && !isViewMode;

  const { currentHotel, isLoading } = useAppSelector((state) => state.hotel);
  const { countries, cities } = useAppSelector((state) => state.master);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    //setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      hotelCode: '',
      hotelName: '',
      address: '',
      countryId: 0,
      cityId: 0,
      starRating: 3,
      hotelCategoryId: 1,
      currencyId: 1,
    },
  });

  const selectedCountryId = watch('countryId');

  useEffect(() => {
    dispatch(fetchCountries());
    if (id) {
      dispatch(fetchHotelById(parseInt(id)));
    }
    return () => {
      dispatch(clearCurrentHotel());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedCountryId && selectedCountryId > 0) {
      dispatch(fetchCitiesByCountry(selectedCountryId));
    }
  }, [selectedCountryId, dispatch]);

  useEffect(() => {
    if (currentHotel && id) {
      reset(currentHotel as any);
    }
  }, [currentHotel, id, reset]);

  const onSubmit = async (data: HotelFormData) => {
    setError(null);
    try {
      if (isEditMode && id) {
        await dispatch(updateHotel({ id: parseInt(id), data: data as any }));
      } else {
        await dispatch(createHotel(data as any));
      }
      navigate('/hotel/hotel-master');
    } catch (err: any) {
      setError(err.message || 'Failed to save hotel');
    }
  };

  const handleBack = () => {
    navigate('/hotel/hotel-master');
  };

  return (
    <Box className={styles.container}>
      <Paper className={styles.paper}>
        <Box className={styles.header}>
          <Typography variant="h5" component="h1">
            {isViewMode ? 'View Hotel' : isEditMode ? 'Edit Hotel' : 'Add New Hotel'}
          </Typography>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={handleBack}>
            Back to List
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="hotelCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Hotel Code"
                    fullWidth
                    required
                    disabled={isViewMode}
                    error={!!errors.hotelCode}
                    helperText={errors.hotelCode?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="hotelName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Hotel Name"
                    fullWidth
                    required
                    disabled={isViewMode}
                    error={!!errors.hotelName}
                    helperText={errors.hotelName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    required
                    multiline
                    rows={2}
                    disabled={isViewMode}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="countryId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Country"
                    fullWidth
                    required
                    disabled={isViewMode}
                    error={!!errors.countryId}
                    helperText={errors.countryId?.message}
                  >
                    <MenuItem value={0}>Select Country</MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {country.countryName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="cityId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="City"
                    fullWidth
                    required
                    disabled={isViewMode || !selectedCountryId}
                    error={!!errors.cityId}
                    helperText={errors.cityId?.message}
                  >
                    <MenuItem value={0}>Select City</MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.cityName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="starRating"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Star Rating"
                    fullWidth
                    required
                    disabled={isViewMode}
                    error={!!errors.starRating}
                    helperText={errors.starRating?.message}
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating} Star{rating > 1 ? 's' : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="contactPerson"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Person"
                    fullWidth
                    disabled={isViewMode}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="contactEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Email"
                    fullWidth
                    disabled={isViewMode}
                    error={!!errors.contactEmail}
                    helperText={errors.contactEmail?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    disabled={isViewMode}
                  />
                )}
              />
            </Grid>
          </Grid>

          {!isViewMode && (
            <Box className={styles.actions}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : isEditMode ? 'Update Hotel' : 'Create Hotel'}
              </Button>
              <Button variant="outlined" onClick={handleBack}>
                Cancel
              </Button>
            </Box>
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default AddEditHotel;