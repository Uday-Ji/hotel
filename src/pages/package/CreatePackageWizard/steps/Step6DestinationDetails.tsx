import React, { useState, useEffect } from 'react';
import BatchImageUploader, { ImageRow } from '@/components/common/BatchImageUploader/BatchImageUploader';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreatePackageRequest } from '@/services/package/package.models';
import RichTextEditor from '@/components/common/RichTextEditor';

interface Step6Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const destinationSchema = z.object({
  cityId: z.number().min(1, 'City is required'),
  factsTypeId: z.number().min(1, 'Facts type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageTag: z.string().optional(),
  isActive: z.boolean(),
});

type DestinationFormData = z.infer<typeof destinationSchema>;

const compactFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' },
};

const Step6DestinationDetails: React.FC<Step6Props> = ({ formData, updateFormData, onValidationChange }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<any | null>(null);
  const [uploaderKey, setUploaderKey] = useState(0);

  const cities = [
    { id: 1, name: 'Agartala' },
    { id: 2, name: 'Delhi' },
    { id: 3, name: 'Mumbai' },
  ];

  const factsTypes = [
    { id: 1, name: 'Fact' },
    { id: 2, name: 'History' },
    { id: 3, name: 'Culture' },
  ];

  const { control, reset, setValue, formState: { errors } } = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    defaultValues: { cityId: 0, factsTypeId: 0, description: '', imageTag: '', isActive: true },
  });

  useEffect(() => {
    onValidationChange?.(true);
  }, [formData.destinations, onValidationChange]);

  // Modal open for add/edit
  const openModal = (dest: any = null) => {
    setEditingDest(dest);
    setUploaderKey(prev => prev + 1);
    if (dest) {
      setValue('cityId', dest.cityId);
      setValue('factsTypeId', dest.factsTypeId);
      setValue('description', dest.description);
      setValue('imageTag', dest.imageTag || '');
      setValue('isActive', dest.isActive);
    } else {
      reset();
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDest(null);
    reset();
  };

  // Add/Edit handler
  const handleBatchUpload = async (row: ImageRow) => {
    // Only allow upload if both images are present (file or preview)
    const hasThumbnail = row.thumbnailFile || row.thumbnailPreview;
    const hasLarge = row.largeFile || row.largePreview;
    if (!hasThumbnail || !hasLarge) {
      throw new Error('Both images are required');
    }
    // Convert files to base64 or use previews
    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
      });
    };
    let thumbnailBase64 = null;
    let largeBase64 = null;
    if (row.thumbnailFile) {
      thumbnailBase64 = await fileToBase64(row.thumbnailFile);
    }
    if (row.largeFile) {
      largeBase64 = await fileToBase64(row.largeFile);
    }
    // Build new destination object
    const newDest: any = {
      id: editingDest ? editingDest.id : Date.now(),
      cityId: control._formValues.cityId,
      factsTypeId: control._formValues.factsTypeId,
      description: control._formValues.description,
      imageTag: control._formValues.imageTag,
      isActive: control._formValues.isActive,
      thumbnailImage: thumbnailBase64,
      bigImage: largeBase64,
    };
    const updatedDestinations = editingDest
      ? (formData.destinations || []).map((d: any) => d.id === editingDest.id ? newDest : d)
      : [...(formData.destinations || []), newDest];
    updateFormData({ destinations: updatedDestinations });
  };

  const handleBatchComplete = async () => {
    closeModal();
  };

  const handleDelete = (id: number) => {
    updateFormData({ destinations: (formData.destinations || []).filter((d: any) => d.id !== id) });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Destination Details
              </Typography>
              <Chip label="Optional" size="small" sx={{ ml: 1.5, bgcolor: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem' }} />
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openModal()}
              sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #5a3a7d 100%)' } }}
            >
              Add Destination
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {/* Grid Table */}
          {formData.destinations && formData.destinations.length > 0 && (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>City</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Facts Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Thumbnail</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Big Image</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Tag</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(formData.destinations as any[]).map((dest) => (
                    <TableRow key={dest.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ fontSize: '0.8125rem' }}>{cities.find((c) => c.id === dest.cityId)?.name || '--'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem' }}>{factsTypes.find((f) => f.id === dest.factsTypeId)?.name || '--'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem', maxWidth: 200 }}>
                        <Typography variant="body2" noWrap title={dest.description}>{dest.description}</Typography>
                      </TableCell>
                      <TableCell>
                        {dest.thumbnailImage && (
                          <img src={dest.thumbnailImage} alt="Thumbnail" style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 4 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {dest.bigImage && (
                          <img src={dest.bigImage} alt="Big Image" style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 4 }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem' }}>{dest.imageTag || '—'}</TableCell>
                      <TableCell>
                        <Chip label={dest.isActive ? 'Active' : 'Inactive'} size="small" color={dest.isActive ? 'success' : 'default'} variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => openModal(dest)} sx={{ mr: 0.5 }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(dest.id)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
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

      {/* Add/Edit Modal with Form Controls + BatchImageUploader */}
      <Card sx={{ display: modalOpen ? 'block' : 'none', position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 1300, maxWidth: 1100, width: '100%', boxShadow: 24, borderRadius: 3, border: '1px solid #e5e7eb' }}>
        <Box sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {editingDest ? 'Edit Destination' : 'Add Destination'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <form>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="cityId"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select fullWidth size="small" label="City *" sx={compactFieldSx} error={!!errors.cityId} helperText={errors.cityId?.message}>
                          <MenuItem value={0}>--Select City--</MenuItem>
                          {cities.map((city) => <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>)}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="factsTypeId"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select fullWidth size="small" label="Facts Type *" sx={compactFieldSx} error={!!errors.factsTypeId} helperText={errors.factsTypeId?.message}>
                          <MenuItem value={0}>--Select Facts Type--</MenuItem>
                          {factsTypes.map((f) => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {/* Removed tag control above image uploader */}
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <RichTextEditor
                          label="Description *"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter destination description..."
                          toolbarVariant="basic"
                          minHeight={120}
                          showCharCount
                          maxLength={2000}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </form>
            </Box>
            {/* Batch Image Uploader Section */}
            <BatchImageUploader
              key={uploaderKey}
              onUploadRow={handleBatchUpload}
              onUploadComplete={handleBatchComplete}
              tagSuggestions={['destination', 'fact', 'history', 'culture']}
              title=""
              subtitle=""
              initialRows={editingDest ? [{
                thumbnailFile: null,
                largeFile: null,
                tag: editingDest.imageTag || '',
                status: editingDest.isActive ? 'Active' : 'Inactive',
                thumbnailUrl: editingDest.thumbnailImage || '',
                largeImageUrl: editingDest.bigImage || '',
              }] : undefined}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="outlined" color="error" onClick={closeModal} startIcon={<CancelIcon />}>Cancel</Button>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
};

export default Step6DestinationDetails;