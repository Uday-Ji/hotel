import React, { useState, useEffect } from 'react';
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
  Button,
  MenuItem,
  FormHelperText,
  Alert,
} from '@mui/material';
import { CloudUpload, Image as ImageIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreatePackageRequest } from '@/services/package/package.models';
import styles from './Step4UploadImages.module.css';

interface Step4Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

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

const compactFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: '#fff',
  },
};

const Step4UploadImages: React.FC<Step4Props> = ({
  formData,
  updateFormData,
  onValidationChange,
}) => {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bigImagePreview, setBigImagePreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bigImageFile, setBigImageFile] = useState<File | null>(null);

  const {
    control,
    watch,
    formState: { errors, isValid },
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    mode: 'onChange',
    defaultValues: {
      imageTag: formData.imageTag || '',
      imageAttribute: formData.imageAttribute || 'default',
      imageFor: formData.imageFor || 'package',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    updateFormData({
      ...watchedValues,
      thumbnailImage: thumbnailFile || undefined,
      bigImage: bigImageFile || undefined,
    });
    // Images are optional for initial creation; step is always valid
    onValidationChange(true);
  }, [watchedValues, isValid, thumbnailFile, bigImageFile]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
      if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); return; }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBigImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
      if (file.size > 10 * 1024 * 1024) { alert('File size must be less than 10MB'); return; }
      setBigImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBigImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Alert severity="info" sx={{ mb: 2, '& .MuiAlert-message': { fontSize: '0.8125rem' } }}>
        Upload high-quality images for your package. &nbsp;
        <strong>Thumbnail:</strong> Recommended 800×600, max 5MB &nbsp;|&nbsp;
        <strong>Big Image:</strong> Recommended 1920×1080, max 10MB
      </Alert>

      <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ImageIcon sx={{ mr: 1, color: '#f59e0b', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Upload Images
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {/* Thumbnail */}
            <Grid item xs={12} md={6}>
              <Box className={styles.uploadSection}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Thumbnail
                </Typography>
                {thumbnailPreview ? (
                  <Box className={styles.imagePreview}>
                    <img src={thumbnailPreview} alt="Thumbnail Preview" />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        {thumbnailFile?.name} ({((thumbnailFile?.size || 0) / 1024).toFixed(1)} KB)
                      </Typography>
                      <Button size="small" variant="outlined" color="error" onClick={() => { setThumbnailPreview(null); setThumbnailFile(null); }}>
                        Remove
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    fullWidth
                    size="small"
                    sx={{ height: 120, borderStyle: 'dashed', borderRadius: 2 }}
                  >
                    Choose Thumbnail
                    <input type="file" hidden accept="image/*" onChange={handleThumbnailChange} />
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Big Image */}
            <Grid item xs={12} md={6}>
              <Box className={styles.uploadSection}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Big Image
                </Typography>
                {bigImagePreview ? (
                  <Box className={styles.imagePreview}>
                    <img src={bigImagePreview} alt="Big Image Preview" />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        {bigImageFile?.name} ({((bigImageFile?.size || 0) / 1024).toFixed(1)} KB)
                      </Typography>
                      <Button size="small" variant="outlined" color="error" onClick={() => { setBigImagePreview(null); setBigImageFile(null); }}>
                        Remove
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    fullWidth
                    size="small"
                    sx={{ height: 120, borderStyle: 'dashed', borderRadius: 2 }}
                  >
                    Choose Big Image
                    <input type="file" hidden accept="image/*" onChange={handleBigImageChange} />
                  </Button>
                )}
              </Box>
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
                    sx={compactFieldSx}
                    helperText="Optional: Add keywords or tags"
                  />
                )}
              />
            </Grid>

            {/* Attributes */}
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset" error={!!errors.imageAttribute} size="small">
                <FormLabel sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>Attributes *</FormLabel>
                <Controller
                  name="imageAttribute"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel value="default" control={<Radio size="small" />} label={<Typography variant="body2">Default</Typography>} />
                      <FormControlLabel value="virtualTour" control={<Radio size="small" />} label={<Typography variant="body2">Virtual Tour</Typography>} />
                    </RadioGroup>
                  )}
                />
                {errors.imageAttribute && <FormHelperText>{errors.imageAttribute.message}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Image For */}
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
                    label="Image For *"
                    sx={compactFieldSx}
                    error={!!errors.imageFor}
                    helperText={errors.imageFor?.message}
                  >
                    <MenuItem value="package">Package</MenuItem>
                    <MenuItem value="destination">Destination</MenuItem>
                    <MenuItem value="hotel">Hotel</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Step4UploadImages;