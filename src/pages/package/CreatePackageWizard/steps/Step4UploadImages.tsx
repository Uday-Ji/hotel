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
    thumbnailImage: thumbnailFile || undefined,  // Changed: null to undefined
    bigImage: bigImageFile || undefined,         // Changed: null to undefined
  });
  onValidationChange(isValid);
}, [watchedValues, isValid, thumbnailFile, bigImageFile]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBigImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setBigImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBigImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null);
    setThumbnailFile(null);
  };

  const handleRemoveBigImage = () => {
    setBigImagePreview(null);
    setBigImageFile(null);
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Upload high-quality images for your package. <br />
        <strong>Thumbnail:</strong> Recommended size 800x600, max 5MB <br />
        <strong>Big Image:</strong> Recommended size 1920x1080, max 10MB
      </Alert>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ImageIcon sx={{ mr: 1, color: '#f59e0b' }} />
            <Typography variant="h6">Upload Images</Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box className={styles.uploadSection}>
                <Typography variant="subtitle1" gutterBottom>
                  Thumbnail
                </Typography>
                {thumbnailPreview ? (
                  <Box className={styles.imagePreview}>
                    <img src={thumbnailPreview} alt="Thumbnail Preview" />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        {thumbnailFile?.name} ({(thumbnailFile?.size || 0 / 1024).toFixed(2)} KB)
                      </Typography>
                      <Button size="small" variant="outlined" onClick={handleRemoveThumbnail}>
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
                    sx={{ height: 150, borderStyle: 'dashed' }}
                  >
                    Choose Thumbnail
                    <input type="file" hidden accept="image/*" onChange={handleThumbnailChange} />
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box className={styles.uploadSection}>
                <Typography variant="subtitle1" gutterBottom>
                  Big Image
                </Typography>
                {bigImagePreview ? (
                  <Box className={styles.imagePreview}>
                    <img src={bigImagePreview} alt="Big Image Preview" />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        {bigImageFile?.name} ({((bigImageFile?.size || 0) / 1024).toFixed(2)} KB)
                      </Typography>
                      <Button size="small" variant="outlined" onClick={handleRemoveBigImage}>
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
                    sx={{ height: 150, borderStyle: 'dashed' }}
                  >
                    Choose Big Image
                    <input type="file" hidden accept="image/*" onChange={handleBigImageChange} />
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="imageTag"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Image Tag"
                    error={!!errors.imageTag}
                    helperText={errors.imageTag?.message || 'Optional: Add keywords or tags'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset" error={!!errors.imageAttribute}>
                <FormLabel>Attributes *</FormLabel>
                <Controller
                  name="imageAttribute"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel value="default" control={<Radio />} label="Default" />
                      <FormControlLabel
                        value="virtualTour"
                        control={<Radio />}
                        label="Virtual Tour"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.imageAttribute && (
                  <FormHelperText>{errors.imageAttribute.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="imageFor"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Image For *"
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