import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  MenuItem,
  FormHelperText,
  Alert,
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
  Tooltip,
  CircularProgress,
  Divider,
  Avatar,
  ListItemIcon,
  ListItemText,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Image as ImageIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Clear as ClearIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIconMui,
} from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreatePackageRequest } from '@/services/package/package.models';
import type { SavedPackageImage } from '@/services/package/packageTab.services';
import { packageService } from '@/services/package/package.service';
import ImageUploader, { UploadedImage } from '@/components/common/Modal/ImageUploader/ImageUploader';
import { EditIcon, StarIcon, AlertCircle } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────
// Types & Constants
// ──────────────────────────────────────────────────────────────────────────

interface Step4Props {
  packageId: number;
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

interface ImageState {
  thumbnail: UploadedImage | null;
  bigImage: UploadedImage | null;
  existingThumbnailUrl: string | null;
  existingBigImageUrl: string | null;
}

interface EditModeState {
  isActive: boolean;
  imageId: number | null;
  isLoading: boolean;
}

// Zod schema for form validation
const step4Schema = z.object({
  imageTag: z.string().optional(),
  imageAttribute: z.enum(['default', 'virtualTour'], {
    required_error: 'Image attribute is required',
  }),
  imageFor: z.enum(['package', 'destination', 'hotel'], {
    required_error: 'Image for is required',
  }),
});

type Step4FormData = z.infer<typeof step4Schema>;

// Constants for UI
const CONSTANTS = {
  IMAGE_FOR_LABELS: {
    package: 'Package',
    destination: 'Destination',
    hotel: 'Hotel',
  },
  RECOMMENDATIONS: {
    thumbnail: { width: 800, height: 600, maxSize: 5 },
    bigImage: { width: 1920, height: 1080, maxSize: 5 },
  },
  SUCCESS_MESSAGE_DURATION: 4000,
} as const;

// ──────────────────────────────────────────────────────────────────────────
// Helper Functions
// ──────────────────────────────────────────────────────────────────────────

/**
 * Normalize URL by replacing backslashes with forward slashes
 */
const normalizeUrl = (url: string | null): string | null => {
  return url ? url.replace(/\\/g, '/') : null;
};

/**
 * Convert File to Base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

/**
 * Create fake File object from existing image URL for preview
 */
const createFakeFileFromUrl = (name: string): File => {
  return new File([], name, { type: 'image/jpeg' });
};

/**
 * Check if file is a newly uploaded file (not a fake file from existing image)
 */
const isNewFileUpload = (file: File | undefined): boolean => {
  if (!file) return false;
  // Real files have size > 0, fake files from URL have size 0
  return !file.name.startsWith('existing-') && file.size > 0;
};

/**
 * Get image type label
 */
const getImageTypeLabel = (imageType: number): string => {
  return imageType === 0 ? 'Default' : 'Virtual Tour';
};

/**
 * Get image category label
 */
const getImageCategoryLabel = (imageType: number): string => {
  const categories = ['Package', 'Destination', 'Hotel'];
  return categories[imageType] || 'Unknown';
};

// ──────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────

const Step4UploadImages: React.FC<Step4Props> = ({
  packageId,
  formData,
  updateFormData,
  onValidationChange,
}) => {
  // ────────────────────────────────────────────────────────────────────────
  // State Management
  // ────────────────────────────────────────────────────────────────────────

  // Image states
  const [imageState, setImageState] = useState<ImageState>({
    thumbnail: null,
    bigImage: null,
    existingThumbnailUrl: null,
    existingBigImageUrl: null,
  });

  // Edit mode state
  const [editMode, setEditMode] = useState<EditModeState>({
    isActive: false,
    imageId: null,
    isLoading: false,
  });

  // UI states
  const [savedImages, setSavedImages] = useState<SavedPackageImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    imageId: number | null;
    action: string;
  }>({
    open: false,
    imageId: null,
    action: '',
  });

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState<SavedPackageImage | null>(null);

  const isMenuOpen = Boolean(anchorEl);

  // ────────────────────────────────────────────────────────────────────────
  // Form Setup (react-hook-form)
  // ────────────────────────────────────────────────────────────────────────

  const {
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    mode: 'onChange',
    defaultValues: {
      imageTag: formData.imageTag ?? '',
      imageAttribute: (formData.imageAttribute ?? 'default') as 'default' | 'virtualTour',
      imageFor: (formData.imageFor ?? 'package') as 'package' | 'destination' | 'hotel',
    },
  });

  const watchedValues = watch();

  // ────────────────────────────────────────────────────────────────────────
  // Effects
  // ────────────────────────────────────────────────────────────────────────

  // Load images on mount
  useEffect(() => {
    if (!packageId) return;
    loadSavedImages();
  }, [packageId]);

  // Sync form values to parent
  useEffect(() => {
    updateFormData({
      imageTag: watchedValues.imageTag,
      imageAttribute: watchedValues.imageAttribute,
      imageFor: watchedValues.imageFor,
    });
  }, [watchedValues, updateFormData]);

  // Validation callback
  useEffect(() => {
    onValidationChange?.(true);
  }, [onValidationChange]);

  // Auto-hide success message
  useEffect(() => {
    if (!saveSuccess) return;
    const timer = setTimeout(() => setSaveSuccess(false), CONSTANTS.SUCCESS_MESSAGE_DURATION);
    return () => clearTimeout(timer);
  }, [saveSuccess]);

  // ────────────────────────────────────────────────────────────────────────
  // Callback Functions
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Load saved images from API
   */
  const loadSavedImages = useCallback(async () => {
    if (!packageId) return;
    setIsLoadingList(true);
    try {
      const images = await packageService.getPackageImages(packageId);
      setSavedImages(images);
    } catch (error) {
      console.error('Failed to fetch images:', error);
      setSaveError('Failed to load images. Please try again.');
    } finally {
      setIsLoadingList(false);
    }
  }, [packageId]);

  /**
   * Handle edit button click
   */
  const handleEditClick = useCallback(async (image: SavedPackageImage) => {
    closeMenu();
    setEditMode({ isActive: true, imageId: image.imageId, isLoading: true });
    setSaveError(null);

    try {
      const normalizedThumbnail = normalizeUrl(image.thumbnail);
      const normalizedBigImage = normalizeUrl(image.bigImage);

      // Store existing URLs
      setImageState({
        thumbnail: normalizedThumbnail
          ? {
              preview: normalizedThumbnail,
              file: createFakeFileFromUrl('existing-thumbnail.jpg'),
            }
          : null,
        bigImage: normalizedBigImage
          ? {
              preview: normalizedBigImage,
              file: createFakeFileFromUrl('existing-big-image.jpg'),
            }
          : null,
        existingThumbnailUrl: normalizedThumbnail,
        existingBigImageUrl: normalizedBigImage,
      });

      // Populate form
      const imageAttribute = image.imageType === 0 ? 'default' : 'virtualTour';
      const imageFor =
        image.imageType === 0 ? 'package' : image.imageType === 1 ? 'destination' : 'hotel';

      reset({
        imageTag: image.imageTag || '',
        imageAttribute,
        imageFor,
      });

      console.log('✅ Edit mode loaded:', { imageId: image.imageId });
    } catch (error) {
      console.error('Failed to load image for editing:', error);
      setSaveError('Failed to load image for editing. Please try again.');
      setEditMode({ isActive: false, imageId: null, isLoading: false });
    } finally {
      setEditMode((prev) => ({ ...prev, isLoading: false }));
    }
  }, [reset]);

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = useCallback(() => {
    setEditMode({ isActive: false, imageId: null, isLoading: false });
    setImageState({
      thumbnail: null,
      bigImage: null,
      existingThumbnailUrl: null,
      existingBigImageUrl: null,
    });
    reset({
      imageTag: '',
      imageAttribute: 'default',
      imageFor: 'package',
    });
    setSaveError(null);
  }, [reset]);

  /**
   * Handle image upload/update
   * ✅ FIXED: Send null/empty string for unmodified images in edit mode
   */
  const handleSaveImages = useCallback(async () => {
    if (!packageId) {
      setSaveError('Package ID is required');
      return;
    }

    // In ADD mode: both images required
    if (!editMode.isActive && (!imageState.thumbnail || !imageState.bigImage)) {
      setSaveError('Both thumbnail and big image are required');
      return;
    }

    // In EDIT mode: at least one image (new or existing) is required
    if (editMode.isActive) {
      const hasThumbnail = imageState.thumbnail || imageState.existingThumbnailUrl;
      const hasBigImage = imageState.bigImage || imageState.existingBigImageUrl;

      if (!hasThumbnail || !hasBigImage) {
        setSaveError('Both images are required');
        return;
      }
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // ✅ FIX: Send null for unmodified images in edit mode
      let thumbnailBase64: string | null = null;
      let bigImageBase64: string | null = null;

      // Process thumbnail
      if (isNewFileUpload(imageState.thumbnail?.file)) {
        // User uploaded NEW file
        thumbnailBase64 = await fileToBase64(imageState.thumbnail!.file);
        console.log('📤 Thumbnail: NEW file uploaded');
      } else if (editMode.isActive && !imageState.thumbnail && imageState.existingThumbnailUrl) {
        // In EDIT mode, user didn't touch thumbnail - send null
        thumbnailBase64 = null;
        console.log('📤 Thumbnail: not modified (sending null)');
      } else if (!editMode.isActive && imageState.thumbnail?.file) {
        // ADD mode: convert file to base64
        thumbnailBase64 = await fileToBase64(imageState.thumbnail.file);
        console.log('📤 Thumbnail: ADD mode');
      }

      // Process big image
      if (isNewFileUpload(imageState.bigImage?.file)) {
        // User uploaded NEW file
        bigImageBase64 = await fileToBase64(imageState.bigImage!.file);
        console.log('📤 Big Image: NEW file uploaded');
      } else if (editMode.isActive && !imageState.bigImage && imageState.existingBigImageUrl) {
        // In EDIT mode, user didn't touch big image - send null
        bigImageBase64 = null;
        console.log('📤 Big Image: not modified (sending null)');
      } else if (!editMode.isActive && imageState.bigImage?.file) {
        // ADD mode: convert file to base64
        bigImageBase64 = await fileToBase64(imageState.bigImage.file);
        console.log('📤 Big Image: ADD mode');
      }

      // For ADD mode, both images are required
      if (!editMode.isActive && (!thumbnailBase64 || !bigImageBase64)) {
        setSaveError('Both images are required');
        return;
      }

      // Create payload
      const payload = {
        packageId,
        imageId: editMode.isActive ? editMode.imageId : 0,
        userId: 0,
        thumbnailImage: thumbnailBase64 || '', // null becomes empty string
        bigImage: bigImageBase64 || '', // null becomes empty string
        imageTag: watchedValues.imageTag || '',
        imageType: watchedValues.imageAttribute === 'default' ? 0 : 1,
        status: true,
        actionType: editMode.isActive ? 'Update' : 'Insert',
      };

      console.log('📤 Payload ready:', {
        ...payload,
        thumbnailImage: thumbnailBase64 ? `[${thumbnailBase64.substring(0, 50)}...]` : '[empty]',
        bigImage: bigImageBase64 ? `[${bigImageBase64.substring(0, 50)}...]` : '[empty]',
      });

      // Send to API
      await packageService.uploadImages(payload);

      setSaveSuccess(true);
      console.log('✅ Image saved successfully');

      // Reset form
      setImageState({
        thumbnail: null,
        bigImage: null,
        existingThumbnailUrl: null,
        existingBigImageUrl: null,
      });
      reset({
        imageTag: '',
        imageAttribute: 'default',
        imageFor: 'package',
      });

      // Exit edit mode
      if (editMode.isActive) {
        setEditMode({ isActive: false, imageId: null, isLoading: false });
      }

      // Reload images
      await loadSavedImages();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save images';
      setSaveError(message);
      console.error('❌ Upload error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [
    packageId,
    editMode.isActive,
    editMode.imageId,
    imageState,
    watchedValues,
    loadSavedImages,
    reset,
  ]);

  /**
   * Handle image operations (delete, change status, set default)
   */
  const handleImageOperation = useCallback(
    async (imageId: number, action: string) => {
      try {
        await packageService.changeImageFeature(imageId, action, packageId, 0);
        setSavedImages((prev) => prev.filter((img) => img.imageId !== imageId));
        console.log(`✅ Image ${imageId} ${action} successful`);
      } catch (error) {
        console.error(`Failed to ${action} image:`, error);
        setSaveError(`Failed to ${action} image`);
      }
    },
    [packageId],
  );

  /**
   * Menu handlers
   */
  const openMenu = useCallback((event: React.MouseEvent<HTMLElement>, image: SavedPackageImage) => {
    setAnchorEl(event.currentTarget);
    setSelectedImage(image);
  }, []);

  const closeMenu = useCallback(() => {
    setAnchorEl(null);
    setSelectedImage(null);
  }, []);

  /**
   * Delete confirmation handlers
   */
  const openDeleteConfirmation = useCallback((imageId: number, action: string) => {
    setDeleteConfirmation({ open: true, imageId, action });
    closeMenu();
  }, [closeMenu]);

  const closeDeleteConfirmation = useCallback(() => {
    setDeleteConfirmation({ open: false, imageId: null, action: '' });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteConfirmation.imageId && deleteConfirmation.action) {
      await handleImageOperation(deleteConfirmation.imageId, deleteConfirmation.action);
      closeDeleteConfirmation();
    }
  }, [deleteConfirmation, handleImageOperation, closeDeleteConfirmation]);

  // ────────────────────────────────────────────────────────────────────────
  // Memoized Values
  // ────────────────────────────────────────────────────────────────────────

  const isAddMode = useMemo(() => !editMode.isActive, [editMode.isActive]);

  const uploadButtonDisabled = useMemo(
    () =>
      isSaving ||
      !packageId ||
      (isAddMode && !imageState.thumbnail) ||
      (editMode.isActive && editMode.isLoading),
    [isSaving, packageId, isAddMode, editMode.isActive, editMode.isLoading, imageState.thumbnail],
  );

  const infoMessage = useMemo(
    () =>
      editMode.isActive
        ? `Editing image #${editMode.imageId}. Update any field or leave images empty to keep existing.`
        : 'Upload high-quality images for your package.',
    [editMode.isActive, editMode.imageId],
  );

  // ────────────────────────────────────────────────────────────────────────
  // Render Helpers
  // ────────────────────────────────────────────────────────────────────────

  const renderImagePreview = (image: SavedPackageImage) => {
    const src = image.thumbnail;

    if (!src) {
      return (
        <Box
          sx={{
            width: 52,
            height: 38,
            borderRadius: 1,
            bgcolor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ImageIcon sx={{ fontSize: 18, color: '#cbd5e1' }} />
        </Box>
      );
    }

    return (
      <Avatar
        src={src}
        variant="rounded"
        sx={{ width: 52, height: 38, borderRadius: 1 }}
      />
    );
  };

  // ────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Info Banner */}
      <Alert
        severity="info"
        icon={<CloudUploadIcon />}
        sx={{ mb: 2, '& .MuiAlert-message': { fontSize: '0.8125rem' } }}
      >
        <strong>{infoMessage}</strong>
        <br />
        <small>
          Thumbnail: {CONSTANTS.RECOMMENDATIONS.thumbnail.width}×{CONSTANTS.RECOMMENDATIONS.thumbnail.height}px, max{' '}
          {CONSTANTS.RECOMMENDATIONS.thumbnail.maxSize}MB | Big Image:{' '}
          {CONSTANTS.RECOMMENDATIONS.bigImage.width}×{CONSTANTS.RECOMMENDATIONS.bigImage.height}px, max{' '}
          {CONSTANTS.RECOMMENDATIONS.bigImage.maxSize}MB
        </small>
      </Alert>

      {!packageId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please create the package first before uploading images.
        </Alert>
      )}

      {/* Edit Mode Alert */}
      {editMode.isActive && (
        <Alert
          severity="warning"
          sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box>
            <strong>✏️ Edit Mode</strong> — Update any field. Leave images empty to keep existing ones.
          </Box>
          <Button
            size="small"
            onClick={handleCancelEdit}
            sx={{ color: 'inherit', textTransform: 'none' }}
            disabled={editMode.isLoading || isSaving}
          >
            <ClearIcon sx={{ mr: 0.5, fontSize: 18 }} /> Cancel
          </Button>
        </Alert>
      )}

      {/* Upload Form Card */}
      <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb', mb: 3 }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ImageIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 0 }}>
                {editMode.isActive ? 'Edit Image' : 'Upload Images'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {editMode.isActive ? 'Modify image data' : 'Add new images'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Upload Fields */}
          <Grid container spacing={3}>
            {/* Thumbnail Uploader */}
            <Grid item xs={12} md={6}>
              <ImageUploader
                label={editMode.isActive ? 'Thumbnail (Optional)' : 'Thumbnail Image *'}
                value={imageState.thumbnail}
                onChange={(img) =>
                  setImageState((prev) => ({ ...prev, thumbnail: img }))
                }
                maxSizeMB={CONSTANTS.RECOMMENDATIONS.thumbnail.maxSize}
                helperText={
                  editMode.isActive
                    ? 'Leave empty to keep current'
                    : `Recommended ${CONSTANTS.RECOMMENDATIONS.thumbnail.width}×${CONSTANTS.RECOMMENDATIONS.thumbnail.height}px`
                }
                disabled={!packageId || editMode.isLoading}
              />
            </Grid>

            {/* Big Image Uploader */}
            <Grid item xs={12} md={6}>
              <ImageUploader
                label={editMode.isActive ? 'Big Image (Optional)' : 'Big Image *'}
                value={imageState.bigImage}
                onChange={(img) =>
                  setImageState((prev) => ({ ...prev, bigImage: img }))
                }
                maxSizeMB={CONSTANTS.RECOMMENDATIONS.bigImage.maxSize}
                helperText={
                  editMode.isActive
                    ? 'Leave empty to keep current'
                    : `Recommended ${CONSTANTS.RECOMMENDATIONS.bigImage.width}×${CONSTANTS.RECOMMENDATIONS.bigImage.height}px`
                }
                disabled={!packageId || editMode.isLoading}
              />
            </Grid>

            {/* Image Tag */}
            <Grid item xs={12} md={4}>
              <Controller
                name="imageTag"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Image Tag"
                    placeholder="e.g., Main, Hero, Details"
                    helperText="Optional: Add keywords or tags"
                    disabled={!packageId || editMode.isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' },
                    }}
                  />
                )}
              />
            </Grid>

            {/* Attributes */}
            <Grid item xs={12} md={4}>
              <FormControl
                component="fieldset"
                error={!!errors.imageAttribute}
                size="small"
                disabled={!packageId || editMode.isLoading}
                fullWidth
              >
                <FormLabel sx={{ fontSize: '0.8125rem', fontWeight: 600, mb: 1 }}>
                  Attribute *
                </FormLabel>
                <Controller
                  name="imageAttribute"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
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
                  )}
                />
                {errors.imageAttribute && (
                  <FormHelperText>{errors.imageAttribute.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Category */}
            <Grid item xs={12} md={4}>
              <Controller
                name="imageFor"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    size="small"
                    label="Category *"
                    error={!!errors.imageFor}
                    helperText={errors.imageFor?.message}
                    disabled={!packageId || editMode.isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' },
                    }}
                  >
                    <MenuItem value="package">Package</MenuItem>
                    <MenuItem value="destination">Destination</MenuItem>
                    <MenuItem value="hotel">Hotel</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>

          {/* Alerts */}
          {saveError && (
            <Alert
              severity="error"
              icon={<ErrorOutlineIcon fontSize="small" />}
              sx={{ mt: 3, '& .MuiAlert-message': { fontSize: '0.8125rem' } }}
              onClose={() => setSaveError(null)}
              action={
                <IconButton size="small" color="inherit" onClick={() => setSaveError(null)}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              }
            >
              {saveError}
            </Alert>
          )}

          {saveSuccess && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon fontSize="small" />}
              sx={{ mt: 3, '& .MuiAlert-message': { fontSize: '0.8125rem' } }}
              onClose={() => setSaveSuccess(false)}
            >
              {editMode.isActive ? '✅ Image updated successfully!' : '✅ Images uploaded successfully!'}
            </Alert>
          )}

          <Divider sx={{ mt: 3, mb: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {editMode.isActive && (
              <Button
                variant="outlined"
                size="medium"
                onClick={handleCancelEdit}
                disabled={isSaving || editMode.isLoading}
                startIcon={<ClearIcon />}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              size="medium"
              startIcon={
                isSaving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : editMode.isActive ? (
                  <EditIconMui />
                ) : (
                  <AddIcon />
                )
              }
              onClick={handleSaveImages}
              disabled={uploadButtonDisabled}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #5a3a7d 100%)',
                },
                '&:disabled': {
                  background: '#cbd5e1',
                },
              }}
            >
              {isSaving
                ? editMode.isActive
                  ? 'Updating…'
                  : 'Uploading…'
                : editMode.isActive
                  ? 'Update Image'
                  : 'Upload Images'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Saved Images Section */}
      <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Saved Images
            </Typography>
            {savedImages.length > 0 && (
              <Chip
                label={savedImages.length}
                size="small"
                sx={{
                  ml: 2,
                  bgcolor: '#dbeafe',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Content */}
          {isLoadingList ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress size={30} />
            </Box>
          ) : savedImages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 5,
                border: '2px dashed #e2e8f0',
                borderRadius: 2,
                color: '#94a3b8',
              }}
            >
              <ImageIcon sx={{ fontSize: 44, mb: 1, opacity: 0.35 }} />
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                No images added yet. Upload images using the form above.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>
                      #
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>
                      Thumbnail
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>
                      Big Image
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>
                      Tag
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>
                      Category
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>
                      Status
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {savedImages.map((image, idx) => (
                    <TableRow key={image.imageId} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
                        {idx + 1}
                      </TableCell>
                      <TableCell>{renderImagePreview(image)}</TableCell>
                      <TableCell>
                        <Avatar
                          src={image.bigImage || ''}
                          variant="rounded"
                          sx={{ width: 52, height: 38, borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem', color: '#374151' }}>
                        {image.imageTag || (
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getImageTypeLabel(image.isDefaultImage ? 0 : 1)}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: image.isDefaultImage ? '#f0fdf4' : '#fef3c7',
                            color: image.isDefaultImage ? '#15803d' : '#b45309',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getImageCategoryLabel(image.imageType)}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: '#ede9fe',
                            color: '#6d28d9',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={image.status ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: image.status ? '#dcfce7' : '#fee2e2',
                            color: image.status ? '#16a34a' : '#dc2626',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="More options">
                          <IconButton
                            size="small"
                            onClick={(e) => openMenu(e, image)}
                            disabled={isSaving}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            selectedImage && handleEditClick(selectedImage);
          }}
        >
          <ListItemIcon>
            <EditIcon size={18} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            selectedImage && openDeleteConfirmation(selectedImage.imageId, 'DELETE');
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText sx={{ color: '#ef4444' }}>Delete</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            selectedImage && handleImageOperation(selectedImage.imageId, 'ChangeStatus');
            closeMenu();
          }}
        >
          <ListItemIcon>
            <SwapHorizIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Toggle Status</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            selectedImage && handleImageOperation(selectedImage.imageId, 'SetAsDefault');
            closeMenu();
          }}
        >
          <ListItemIcon>
            <StarIcon size={18} />
          </ListItemIcon>
          <ListItemText>Set as Default</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmation.open} onClose={closeDeleteConfirmation}>
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
          <Button onClick={closeDeleteConfirmation}>Cancel</Button>
          <Button
            onClick={confirmDelete}
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