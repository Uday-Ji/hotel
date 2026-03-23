import React, { useState, useEffect } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Hotel as HotelIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { packageService } from '@/services/package/package.service';
import FormModal from '@/components/common/FormModal/FormModal';

// ── TYPES ──────────────────────────────────────────────────────────────────

interface HotelMapping {
  hotelMappingId: number;
  packageId: number;
  cityCode: string;
  cityName?: string;
  hotelCategoryId: number;
  hotelCategoryName?: string;
  hotelName: string;
  description?: string;
  thumbnailImage?: string;
  bigImage?: string;
  imageTag?: string;
  status: boolean;
}

interface Step7Props {
  packageId: number;
  loading?: boolean;
  cities: any[];
  onValidationChange?: (isValid: boolean) => void;
}

// ── VALIDATION SCHEMA ──────────────────────────────────────────────────────

const hotelSchema = z.object({
  cityCode: z.string().min(1, 'City is required'),
  hotelCategoryId: z.number().min(1, 'Hotel Category is required'),
  hotelName: z.string().min(1, 'Hotel name is required'),
  description: z.string().optional(),
  status: z.boolean(),
});

type HotelFormData = z.infer<typeof hotelSchema>;

// ── COMPONENT ──────────────────────────────────────────────────────────────

const Step7HotelMapping: React.FC<Step7Props> = ({
  packageId,
  loading = false,
  cities,
  onValidationChange,
}) => {
  // State
  const [hotels, setHotels] = useState<HotelMapping[]>([]);
  const [isLoading, setIsLoading] = useState(loading);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelMapping | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedHotel, setExpandedHotel] = useState<number | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bigImagePreview, setBigImagePreview] = useState<string | null>(null);
  const [hotelCategories, setHotelCategories] = useState<any[]>([]);

  const { control, reset, formState: { errors }, handleSubmit } = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      cityCode: '',
      hotelCategoryId: 0,
      hotelName: '',
      description: '',
      status: true,
    },
  });

  // Effects
  useEffect(() => {
    if (packageId) {
      loadHotels();
      loadCategories();
    }
  }, [packageId]);

  useEffect(() => {
    onValidationChange?.(true);
  }, [onValidationChange]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Handlers
  const loadHotels = async () => {
    setIsLoading(true);
    try {
      const data = await packageService.getPackageHotelMappings(packageId);
      setHotels(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError('Failed to load hotels');
      console.error(err);
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const mockCategories = [
        { id: 1, name: '3 Star' },
        { id: 2, name: '4 Star' },
        { id: 3, name: '5 Star' },
        { id: 4, name: 'Boutique' },
        { id: 5, name: 'Resort' },
      ];
      setHotelCategories(mockCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBigImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBigImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHotel = async (values: HotelFormData) => {
    try {
      const payload = {
        hotelMappingId: editingHotel?.hotelMappingId || 0,
        packageId,
        cityCode: values.cityCode,
        hotelCategoryId: values.hotelCategoryId,
        hotelName: values.hotelName,
        description: values.description || '',
        status: values.status,
        userId: 1,
        companyCode: 'SMT',
      };

      await packageService.postPackageHotelMapping(payload);
      setSuccess(editingHotel ? 'Hotel updated' : 'Hotel created');
      setModalOpen(false);
      reset();
      setEditingHotel(null);
      await loadHotels();
    } catch (err) {
      setError('Failed to save hotel');
      console.error(err);
    }
  };

  const handleSaveImages = async () => {
    if (!editingHotel) return;
    try {
      const payload = {
        hotelMappingId: editingHotel.hotelMappingId,
        packageId,
        thumbnailImage: thumbnailPreview || '',
        bigImage: bigImagePreview || '',
        userId: 1,
        companyCode: 'SMT',
      };

      await packageService.updatePackageHotelMappingImages(payload);
      setSuccess('Images saved successfully');
      setImageModalOpen(false);
      setThumbnailPreview(null);
      setBigImagePreview(null);
      await loadHotels();
    } catch (err) {
      setError('Failed to save images');
      console.error(err);
    }
  };

  const handleDeleteHotel = async (id: number) => {
    if (!window.confirm('Delete this hotel mapping?')) return;
    try {
      await packageService.deletePackageHotelMapping(id);
      setSuccess('Hotel deleted');
      await loadHotels();
    } catch (err) {
      setError('Failed to delete hotel');
      console.error(err);
    }
  };

  const handleOpenModal = (hotel?: HotelMapping) => {
    if (hotel) {
      setEditingHotel(hotel);
      reset({
        cityCode: hotel.cityCode,
        hotelCategoryId: hotel.hotelCategoryId,
        hotelName: hotel.hotelName,
        description: hotel.description || '',
        status: hotel.status,
      });
    } else {
      setEditingHotel(null);
      reset({
        cityCode: '',
        hotelCategoryId: 0,
        hotelName: '',
        description: '',
        status: true,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingHotel(null);
    reset();
  };

  const handleOpenImageModal = (hotel: HotelMapping) => {
    setEditingHotel(hotel);
    setThumbnailPreview(hotel.thumbnailImage || null);
    setBigImagePreview(hotel.bigImage || null);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setEditingHotel(null);
    setThumbnailPreview(null);
    setBigImagePreview(null);
  };

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
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Hotel Mapping ({hotels.length})
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #5a3a7d 100%)',
                },
              }}
            >
              Add Hotel
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Alerts */}
          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

          {/* Hotels List */}
          {hotels.length === 0 ? (
            <Alert severity="info">No hotels added yet. Click "Add Hotel" to begin.</Alert>
          ) : (
            hotels.map((hotel) => (
              <Accordion
                key={hotel.hotelMappingId}
                expanded={expandedHotel === hotel.hotelMappingId}
                onChange={() =>
                  setExpandedHotel(
                    expandedHotel === hotel.hotelMappingId ? null : hotel.hotelMappingId
                  )
                }
                sx={{ mb: 1, '&:before': { display: 'none' } }}
              >
                {/* Accordion Header */}
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <HotelIcon sx={{ color: '#667eea', fontSize: 24 }} />
                    <Typography sx={{ fontWeight: 600 }}>{hotel.hotelName}</Typography>
                    <Typography sx={{ color: '#64748b', flex: 1 }} noWrap>
                      {hotel.cityName || hotel.cityCode}
                    </Typography>
                    <Chip
                      label={hotel.status ? 'Active' : 'Inactive'}
                      size="small"
                      color={hotel.status ? 'success' : 'default'}
                    />
                    <Box onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" color="primary" onClick={() => handleOpenModal(hotel)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteHotel(hotel.hotelMappingId)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>

                {/* Accordion Details */}
                <AccordionDetails>
                  {/* Description */}
                  {hotel.description && (
                    <Box
                      sx={{
                        color: '#64748b',
                        mb: 2,
                        '& p': { margin: '0.5em 0' },
                        '& ul, & ol': { paddingLeft: '1.5em' },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                        Description
                      </Typography>
                      <Typography variant="body2">{hotel.description}</Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Details Grid */}
                  <Grid container spacing={3} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                          City
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {hotel.cityName || hotel.cityCode}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                          Category
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {hotel.hotelCategoryName || hotel.hotelCategoryId}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                          Image Tag
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {hotel.imageTag || '—'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                          Status
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mt: 0.5, color: hotel.status ? '#10b981' : '#ef4444' }}
                        >
                          {hotel.status ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Hotel Images */}
                  {(hotel.thumbnailImage || hotel.bigImage) && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        {hotel.thumbnailImage && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                              Thumbnail
                            </Typography>
                            <img
                              src={hotel.thumbnailImage}
                              alt={hotel.hotelName}
                              style={{
                                width: '100%',
                                maxHeight: 150,
                                objectFit: 'cover',
                                borderRadius: 8,
                                marginTop: 8,
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </Grid>
                        )}
                        {hotel.bigImage && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                              Large Image
                            </Typography>
                            <img
                              src={hotel.bigImage}
                              alt={hotel.hotelName}
                              style={{
                                width: '100%',
                                maxHeight: 150,
                                objectFit: 'cover',
                                borderRadius: 8,
                                marginTop: 8,
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </Grid>
                        )}
                      </Grid>
                    </>
                  )}

                  {/* Add Images Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      size="small"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => handleOpenImageModal(hotel)}
                      sx={{ color: '#667eea' }}
                    >
                      Add Images
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>

      {/* Hotel Modal */}
      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit(handleSaveHotel)}
        title={editingHotel ? 'Edit Hotel Mapping' : 'Add Hotel Mapping'}
        isEditing={!!editingHotel}
        icon={<HotelIcon />}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="cityCode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="City *"
                  error={!!errors.cityCode}
                  helperText={errors.cityCode?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
                >
                  <MenuItem value="">Select City</MenuItem>
                  {Array.isArray(cities) && cities.map((city: any, idx: number) => (
                    <MenuItem key={city.cityCode || idx} value={city.cityCode || city.id}>
                      {city.cName || city.cityName || city.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="hotelCategoryId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Hotel Category *"
                  error={!!errors.hotelCategoryId}
                  helperText={errors.hotelCategoryId?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
                >
                  <MenuItem value={0}>Select Category</MenuItem>
                  {hotelCategories.map((cat: any) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="hotelName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Hotel Name *"
                  error={!!errors.hotelName}
                  helperText={errors.hotelName?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
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
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Status"
                  value={field.value ? 'active' : 'inactive'}
                  onChange={(e) => field.onChange(e.target.value === 'active')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              )}
            />
          </Grid>
        </Grid>
      </FormModal>

      {/* Image Upload Modal */}
      <FormModal
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        onSubmit={handleSaveImages}
        title={`Upload Images - ${editingHotel?.hotelName || 'Hotel'}`}
        subtitle="Add hotel images"
        icon={<CloudUploadIcon />}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              Thumbnail Image
            </Typography>
            {thumbnailPreview ? (
              <Box>
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }}
                />
                <Button size="small" onClick={() => setThumbnailPreview(null)} sx={{ mt: 1 }}>
                  Remove
                </Button>
              </Box>
            ) : (
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
                fullWidth
                sx={{ borderStyle: 'dashed', borderRadius: 2 }}
              >
                Choose Thumbnail
                <input type="file" hidden accept="image/*" onChange={handleThumbnailChange} />
              </Button>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              Large Image
            </Typography>
            {bigImagePreview ? (
              <Box>
                <img
                  src={bigImagePreview}
                  alt="Large Image"
                  style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }}
                />
                <Button size="small" onClick={() => setBigImagePreview(null)} sx={{ mt: 1 }}>
                  Remove
                </Button>
              </Box>
            ) : (
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
                fullWidth
                sx={{ borderStyle: 'dashed', borderRadius: 2 }}
              >
                Choose Large Image
                <input type="file" hidden accept="image/*" onChange={handleBigImageChange} />
              </Button>
            )}
          </Grid>
        </Grid>
      </FormModal>
    </Box>
  );
};

export default Step7HotelMapping;
