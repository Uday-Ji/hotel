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
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  LocationCity as LocationCityIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { packageService } from '@/services/package/package.service';
import BatchImageUploader from '@/components/common/BatchImageUploader/BatchImageUploader';
import FormModal from '@/components/common/FormModal/FormModal';
import type { PackageFormData } from '@/services/package/package.models';

// ── TYPES ──────────────────────────────────────────────────────────────────

interface DestinationImage {
  imageId: number;
  thumbnail?: string;
  bigImage?: string;
  imageTag?: string;
  isActive?: boolean;
}

interface Destination {
  destinationId: number;
  packageId: number;
  countryCode: string;
  countryName?: string;
  cityCode: string;
  cityName?: string;
  factsTypeId: number;
  factsTypeName?: string;
  description: string;
  status: boolean;
  images?: DestinationImage[];
}

interface Step6Props {
  formData: Partial<PackageFormData>;
  updateFormData: (data: Partial<PackageFormData>) => void;
  packageId: number;
  isEditMode?: boolean;
  loading?: boolean;
  countries: any[];
  cities: any[];
  factsTypes: any[];
  onValidationChange?: (isValid: boolean) => void;
}

// ── VALIDATION SCHEMA ──────────────────────────────────────────────────────

const destinationSchema = z.object({
  countryCode: z.string().min(1, 'Country is required'),
  cityCode: z.string().min(1, 'City is required'),
  factsTypeId: z.number().min(1, 'Facts Type is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  status: z.boolean(),
});

type DestinationFormData = z.infer<typeof destinationSchema>;

// ── COMPONENT ──────────────────────────────────────────────────────────────

const Step6DestinationDetails: React.FC<Step6Props> = ({
  formData,
  updateFormData,
  packageId,
  isEditMode = false,
  loading = false,
  countries,
  cities,
  factsTypes,
  onValidationChange,
}) => {
  // State
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(loading);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [editingImage, setEditingImage] = useState<DestinationImage | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [filteredCities, setFilteredCities] = useState<any[]>([]);
  const [expandedDestination, setExpandedDestination] = useState<number | null>(null);
  const [batchUploaderKey, setBatchUploaderKey] = useState(0);

  const { control, reset, formState: { errors }, watch, handleSubmit } = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      countryCode: '',
      cityCode: '',
      factsTypeId: 0,
      description: '',
      status: true,
    },
  });

  const watchedCountry = watch('countryCode');

  // Effects
  useEffect(() => {
    if (packageId) {
      loadDestinations();
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

  // Filter cities based on selected country
  useEffect(() => {
    if (watchedCountry && Array.isArray(cities) && cities.length > 0) {
      const filtered = cities.filter((c: any) => c.countryCode === watchedCountry);
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [watchedCountry, cities]);

  // Handlers
  const loadDestinations = async () => {
    setIsLoading(true);
    try {
      const data = await packageService.getPackageDestination(packageId);
      setDestinations(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      setError('Failed to load destinations');
      console.error(err);
      setDestinations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDestination = async (values: DestinationFormData) => {
    try {
      const payload = {
        destinationId: editingDestination?.destinationId || 0,
        packageId,
        countryCode: values.countryCode,
        cityCode: values.cityCode,
        factsTypeId: values.factsTypeId,
        description: values.description,
        status: true,
        userId: 1,
        companyCode: 'SMT',
      };

      await packageService.postPackageDestination(payload);
      setSuccess(editingDestination ? 'Destination updated' : 'Destination created');
      setModalOpen(false);
      reset();
      setEditingDestination(null);
      setSelectedCountry('');
      await loadDestinations();
    } catch (err) {
      setError('Failed to save destination');
      console.error(err);
    }
  };

  const handleDeleteDestination = async (id: number) => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await packageService.deletePackageDestination(id);
      setSuccess('Destination deleted');
      await loadDestinations();
    } catch (err) {
      setError('Failed to delete destination');
      console.error(err);
    }
  };

  const handleOpenModal = (destination?: Destination) => {
    if (destination) {
      setEditingDestination(destination);
      setSelectedCountry(destination.countryCode);
      reset({
        countryCode: destination.countryCode,
        cityCode: destination.cityCode,
        factsTypeId: destination.factsTypeId,
        description: destination.description,
        status: destination.status,
      });
    } else {
      setEditingDestination(null);
      setSelectedCountry('');
      reset({
        countryCode: '',
        cityCode: '',
        factsTypeId: 0,
        description: '',
        status: true,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingDestination(null);
    setSelectedCountry('');
    reset();
  };

  // Image handling
  const handleOpenImageGallery = (destination: Destination, imageToEdit?: DestinationImage) => {
    setSelectedDestination(destination);
    setEditingImage(imageToEdit || null);
    setImageGalleryOpen(true);
  };

  const handleUploadImages = async (rows: any) => {
    if (!selectedDestination) return;
    try {
      const rowsArray = Array.isArray(rows) ? rows : [rows];

      for (const row of rowsArray) {
        // For edit mode, use the existing image or convert file to base64
        let thumbnailData = row.thumbnailUrl || '';
        let largeImageData = row.largeImageUrl || '';

        // If files are provided (new/edited), convert to base64
        if (row.thumbnailFile) {
          thumbnailData = await fileToBase64(row.thumbnailFile);
        }
        if (row.largeFile) {
          largeImageData = await fileToBase64(row.largeFile);
        }

        const payload = {
          imageId: editingImage?.imageId || 0,
          destinationId: selectedDestination.destinationId,
          packageId: selectedDestination.packageId,
          userId: 1,
          thumbnailImage: thumbnailData,
          bigImage: largeImageData,
          imageTag: row.tag || '',
          status: row.status === 'Active',
          companyCode: 'SMT',
        };
        await packageService.postPackageDestinationImage(payload);
      }
      setSuccess('Images uploaded successfully!');
      setImageGalleryOpen(false);
      setEditingImage(null);
      setBatchUploaderKey(prev => prev + 1);
      await loadDestinations();
    } catch (err) {
      setError('Failed to upload images');
      console.error(err);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await packageService.deletePackageDestinationImage(imageId);
      setSuccess('Image deleted');
      await loadDestinations();
    } catch (err) {
      setError('Failed to delete image');
      console.error(err);
    }
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
                Destination Details ({destinations.length})
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
              Add Destination
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Alerts */}
          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

          {/* Destinations List */}
          {destinations.length === 0 ? (
            <Alert severity="info">No destinations added yet. Click "Add Destination" to begin.</Alert>
          ) : (
            destinations.map((destination) => (
              <Accordion
                key={destination.destinationId}
                expanded={expandedDestination === destination.destinationId}
                onChange={() =>
                  setExpandedDestination(
                    expandedDestination === destination.destinationId ? null : destination.destinationId
                  )
                }
                sx={{ mb: 1, '&:before': { display: 'none' } }}
              >
                {/* Accordion Header */}
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <LocationCityIcon sx={{ color: '#667eea', fontSize: 24 }} />
                    <Typography sx={{ fontWeight: 600 }}>{destination.cityName || destination.cityCode}</Typography>
                    <Typography sx={{ color: '#64748b', flex: 1 }} noWrap>
                      {destination.countryName || destination.countryCode}
                    </Typography>
                    <Chip
                      label={destination.status ? 'Active' : 'Inactive'}
                      size="small"
                      color={destination.status ? 'success' : 'default'}
                    />
                    <Box onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" color="primary" onClick={() => handleOpenModal(destination)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteDestination(destination.destinationId)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>

                {/* Accordion Details */}
                <AccordionDetails>
                  {/* Description */}
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
                    <Typography variant="body2">{destination.description}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Details Grid */}
                  <Grid container spacing={3} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                          Country
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {destination.countryName || destination.countryCode}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                          City
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {destination.cityName || destination.cityCode}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                          Facts Type
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {destination.factsTypeName || destination.factsTypeId}
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
                          sx={{ fontWeight: 500, mt: 0.5, color: destination.status ? '#10b981' : '#ef4444' }}
                        >
                          {destination.status ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Gallery Section */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        <ImageIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        Gallery ({destination.images?.length || 0})
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenImageGallery(destination)}
                      >
                        Add Images
                      </Button>
                    </Box>

                    {destination.images && destination.images.length > 0 && (
                      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mt: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>#</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Thumbnail</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Large Image</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Tag</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {destination.images.map((img: DestinationImage, idx: number) => (
                              <TableRow key={img.imageId} hover>
                                <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                                  {idx + 1}
                                </TableCell>
                                <TableCell>
                                  <img
                                    src={img.thumbnail || ''}
                                    alt={img.imageTag}
                                    style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 4 }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="52" height="38"%3E%3Crect fill="%23ddd" width="52" height="38"/%3E%3C/svg%3E';
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <img
                                    src={img.bigImage || ''}
                                    alt={img.imageTag}
                                    style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 4 }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="52" height="38"%3E%3Crect fill="%23ddd" width="52" height="38"/%3E%3C/svg%3E';
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.8125rem' }}>
                                  {img.imageTag || '—'}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={img.isActive ? 'Active' : 'Inactive'}
                                    size="small"
                                    color={img.isActive ? 'success' : 'default'}
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenImageGallery(destination, img)}
                                    sx={{ mr: 0.5 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteImage(img.imageId ?? 0)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>

      {/* Destination Modal */}
      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit(handleSaveDestination)}
        title={editingDestination ? 'Edit Destination' : 'Add Destination'}
        isEditing={!!editingDestination}
        icon={<LocationCityIcon />}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="countryCode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Country *"
                  error={!!errors.countryCode}
                  helperText={errors.countryCode?.message}
                  onChange={(e) => {
                    field.onChange(e);
                    setSelectedCountry(e.target.value);
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
                >
                  <MenuItem value="">Select Country</MenuItem>
                  {Array.isArray(countries) && countries.map((country: any, idx: number) => (
                    <MenuItem key={country.countryCode || idx} value={country.countryCode}>
                      {country.countryName || country.countryCode}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

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
                  disabled={!selectedCountry}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
                >
                  <MenuItem value="">Select City</MenuItem>
                  {Array.isArray(filteredCities) && filteredCities.map((city: any, idx: number) => (
                    <MenuItem key={city.cityCode || idx} value={city.cityCode}>
                      {city.cName || city.cityName || city.cityCode}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="factsTypeId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Facts Type *"
                  error={!!errors.factsTypeId}
                  helperText={errors.factsTypeId?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
                >
                  <MenuItem value={0}>Select Facts Type</MenuItem>
                  {Array.isArray(factsTypes) && factsTypes.map((type: any, idx: number) => (
                    <MenuItem key={type.factsTypeId || idx} value={type.factsTypeId || type.id}>
                      {type.factsType || type.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
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

          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  label="Description *"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
                />
              )}
            />
          </Grid>
        </Grid>
      </FormModal>

      {/* Image Gallery Modal */}
      <FormModal
        open={imageGalleryOpen}
        onClose={() => {
          setImageGalleryOpen(false);
          setEditingImage(null);
        }}
        onSubmit={() => {}}
        title={`Upload Images - ${selectedDestination?.cityName || 'Destination'}`}
        subtitle={editingImage ? 'Edit image details' : 'Add images for this destination'}
        icon={<ImageIcon />}
        hideActions
        maxWidth="lg"
      >
        <BatchImageUploader
          key={batchUploaderKey}
          onUploadRow={handleUploadImages}
          onUploadComplete={() => {
            setImageGalleryOpen(false);
            setEditingImage(null);
          }}
          tagSuggestions={['gallery', 'destination', 'landmark', 'monument']}
          title=""
          subtitle=""
          initialRows={
            editingImage
              ? [
                  {
                    thumbnailFile: null,
                    largeFile: null,
                    tag: editingImage.imageTag || '',
                    status: editingImage.isActive ? 'Active' : 'Inactive',
                    thumbnailUrl: editingImage.thumbnail || '',
                    largeImageUrl: editingImage.bigImage || '',
                  },
                ]
              : undefined
          }
        />
      </FormModal>
    </Box>
  );
};

export default Step6DestinationDetails;