import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Divider,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { AlertCircle } from 'lucide-react';
import { packageService } from '@/services/package/package.service';
import FormModal from '@/components/common/FormModal/FormModal';
import BatchImageUploader, { ImageRow } from '@/components/common/BatchImageUploader/BatchImageUploader';

// ── Types ─────────────────────────────────────────────────────────────────

interface Step4Props {
  packageId: number;
  formData: any;
  updateFormData: (data: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

// ── Helper Functions ──────────────────────────────────────────────────────

const normalizeUrl = (url: string | null): string | null => {
  return url ? url.replace(/\\/g, '/') : null;
};

// Utility: Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper: Get image type label
const getImageTypeLabel = (type: number) => {
  return type === 0 ? 'Default' : 'Virtual Tour';
};

// Helper: Get image category label
const getImageCategoryLabel = (type: number) => {
  if (type === 0) return 'Package';
  if (type === 1) return 'Destination';
  if (type === 2) return 'Hotel';
  return 'Unknown';
};

// Define SavedPackageImage type inline above component if not found:
type SavedPackageImage = {
  imageId: number;
  isDefaultImage: boolean;
  imageType: number;
  thumbnailUrl?: string;
  largeImageUrl?: string;
  tag?: string;
  status?: string;
};

// ── Main Component ────────────────────────────────────────────────────────

const Step4UploadImages: React.FC<Step4Props> = ({
  packageId,
  onValidationChange,
}) => {
    // State
    const [savedImages, setSavedImages] = useState<SavedPackageImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
      open: boolean;
      imageId: number | null;
    }>({ open: false, imageId: null });

    // Form fields (applied to all rows)
    const [imageType, setImageType] = useState<'default' | 'virtualTour'>('default');
    const [imageCategory, setImageCategory] = useState<string>('package');

    // Key to force BatchImageUploader re-mount with initial row
    const [uploaderKey, setUploaderKey] = useState(0);

    // Edit state
    const [editingImage, setEditingImage] = useState<SavedPackageImage | null>(null);

  // Effects
  useEffect(() => {
    if (!packageId) return;
    loadSavedImages();
  }, [packageId]);

  useEffect(() => {
    onValidationChange?.(true);
  }, [onValidationChange]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Load Images
  const loadSavedImages = async () => {
    if (!packageId) return;
    setIsLoading(true);
    try {
      const images = await packageService.getPackageImages(packageId);
      setSavedImages(images);
    } catch (err: any) {
      setError('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  // Open Modal
  const openModal = () => {
    setEditingImage(null);
    setImageType('default');
    setImageCategory('package');
    setUploaderKey(prev => prev + 1);
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (image: SavedPackageImage) => {
    setEditingImage(image);
    setImageType(image.isDefaultImage ? 'default' : 'virtualTour');
    setImageCategory(
      image.imageType === 0 ? 'package' :
      image.imageType === 1 ? 'destination' : 'hotel'
    );
    setUploaderKey(prev => prev + 1);
    setModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setModalOpen(false);
    setImageType('default');
    setImageCategory('package');
    setEditingImage(null);
  };

  // Batch Upload Handler
  const handleBatchUpload = async (row: ImageRow) => {
    // In edit mode, allow either a file or a URL for each image
    const isEdit = !!editingImage;
    const hasThumbnail = row.thumbnailFile || row.thumbnailUrl;
    const hasLarge = row.largeFile || row.largeImageUrl;
    if (!isEdit && (!hasThumbnail || !hasLarge)) {
      throw new Error('Both images are required');
    }

    const thumbnailBase64 = row.thumbnailFile ? await fileToBase64(row.thumbnailFile) : '';
    const largeBase64 = row.largeFile ? await fileToBase64(row.largeFile) : '';

    const payload = {
      packageId,
      imageId: editingImage ? editingImage.imageId : 0,
      userId: 0,
      thumbnailImage: thumbnailBase64,
      bigImage: largeBase64,
      imageTag: row.tag,
      imageType: imageType === 'default' ? 0 : 1, // Use form field
      status: row.status === 'Active',
      actionType: editingImage ? 'Update' : 'Insert',
    };

    await packageService.uploadImages(payload);
  };

  const handleBatchComplete = async (rows: ImageRow[]) => {
    // Only show success if all rows are valid and uploaded
    try {
      await loadSavedImages();
      setSuccess(`Successfully uploaded ${rows.length} images!`);
      closeModal();
    } catch (err) {
      setError('Some images failed to upload. Please check and try again.');
    }
  };

  // Delete Handler
  const handleDelete = async (imageId: number) => {
    try {
      await packageService.changeImageFeature(imageId, 'DELETE', packageId, 0);
      setSuccess('Image deleted successfully!');
      await loadSavedImages();
      setDeleteConfirmation({ open: false, imageId: null });
    } catch (err: any) {
      setError('Failed to delete image');
    }
  };

  // Render
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      {/* Main Grid */}
      <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ImageIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Package Images
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {savedImages.length} image{savedImages.length !== 1 ? 's' : ''} uploaded
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openModal}
              disabled={!packageId}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #5a3a7d 100%)',
                },
              }}
            >
              Add Images
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {savedImages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 8,
                border: '2px dashed #e2e8f0',
                borderRadius: 2,
                color: '#94a3b8',
              }}
            >
              <ImageIcon sx={{ fontSize: 64, mb: 2, opacity: 0.35 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No images uploaded yet
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Click "Add Images" to upload package images
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openModal}
                disabled={!packageId}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Add Images
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Thumbnail</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Large Image</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Tag</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedImages.map((image, idx) => (
                    <TableRow key={image.imageId} hover>
                      <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <Avatar
                          src={normalizeUrl(image.thumbnailUrl ?? null) || ''}
                          variant="rounded"
                          sx={{ width: 52, height: 38 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Avatar
                          src={normalizeUrl(image.largeImageUrl ?? null) || ''}
                          variant="rounded"
                          sx={{ width: 52, height: 38 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem' }}>
                        {image.tag || '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getImageTypeLabel(image.isDefaultImage ? 0 : 1)}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            bgcolor: image.isDefaultImage ? '#f0fdf4' : '#fef3c7',
                            color: image.isDefaultImage ? '#15803d' : '#b45309',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getImageCategoryLabel(image.imageType)}
                          size="small"
                          sx={{ fontSize: '0.75rem', bgcolor: '#ede9fe', color: '#6d28d9' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={image.status ? 'Active' : 'Inactive'}
                          size="small"
                          color={image.status ? 'success' : 'default'}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openEditModal(image)}
                          sx={{ mr: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setDeleteConfirmation({ open: true, imageId: image.imageId })
                          }
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
        </CardContent>
      </Card>

      {/* Add Images Modal with Form Controls + BatchImageUploader */}
      <FormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={() => {}}
        title="Upload Package Images"
        subtitle="Set image type and category, then upload multiple images"
        icon={<ImageIcon />}
        primaryColor="#667eea"
        hideActions
        maxWidth="lg"
      >
        {/* Form Controls Section */}
        <Card sx={{ mb: 1, bgcolor: '#f8fafc', border: '1px solid #e5e7eb' }}>
          <CardContent>
             <Grid container spacing={3}>
              {/* Type Selection */}
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset" fullWidth>
                  {/* <FormLabel sx={{ fontSize: '0.8125rem', fontWeight: 600, mb: 1, color: '#374151' }}>
                    Type *
                  </FormLabel> */}
                  <RadioGroup
                    row
                    value={imageType}
                    onChange={(e) => setImageType(e.target.value as 'default' | 'virtualTour')}
                  >
                    <FormControlLabel
                      value="default"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2">Default</Typography>}
                    />
                    <FormControlLabel
                      value="virtualTour"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2">Virtual Tour</Typography>}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Category Selection */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Category *"
                  value={imageCategory}
                  onChange={(e) => setImageCategory(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#fff',
                    },
                  }}
                >
                  <MenuItem value="package">Package</MenuItem>
                  <MenuItem value="destination">Destination</MenuItem>
                  <MenuItem value="hotel">Hotel</MenuItem>
                </TextField>
              </Grid>
            </Grid>            
          </CardContent>
        </Card>

        {/* Batch Image Uploader Section */}
        <Box>
          <BatchImageUploader
            key={uploaderKey}
            onUploadRow={handleBatchUpload}
            onUploadComplete={handleBatchComplete}
            tagSuggestions={['hero-banner', 'gallery', 'thumbnail', 'cover', 'package-detail']}
            title=""
            subtitle=""
            initialRows={editingImage ? [{
              thumbnailFile: null,
              largeFile: null,
              tag: editingImage.tag || '',
              status: editingImage.status ? 'Active' : 'Inactive',
              thumbnailUrl: editingImage.thumbnailUrl || '',
              largeImageUrl: editingImage.largeImageUrl || '',
            }] : undefined}
          />
        </Box>
      </FormModal>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, imageId: null })}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertCircle size={24} color="#ef4444" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Are you sure you want to delete this image? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmation({ open: false, imageId: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteConfirmation.imageId && handleDelete(deleteConfirmation.imageId)}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Step4UploadImages;