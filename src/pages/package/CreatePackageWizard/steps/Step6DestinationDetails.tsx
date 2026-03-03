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
  Checkbox,
  FormControlLabel,
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
  CloudUpload,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreatePackageRequest } from '@/services/package/package.models';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bigImagePreview, setBigImagePreview] = useState<string | null>(null);

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

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    defaultValues: { cityId: 0, factsTypeId: 0, description: '', imageTag: '', isActive: true },
  });

  useEffect(() => {
    // Destination details are optional
    onValidationChange?.(true);
  }, [formData.destinations, onValidationChange]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setThumbnailPreview(r.result as string); r.readAsDataURL(file); }
  };

  const handleBigImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setBigImagePreview(r.result as string); r.readAsDataURL(file); }
  };

  const onSubmit = (data: DestinationFormData) => {
    const newDest: any = { ...data, id: isEditing ? editingId : Date.now(), thumbnailImage: thumbnailPreview, bigImage: bigImagePreview };
    const updatedDestinations = isEditing && editingId
      ? (formData.destinations || []).map((d: any) => d.id === editingId ? newDest : d)
      : [...(formData.destinations || []), newDest];
    updateFormData({ destinations: updatedDestinations });
    handleCancel();
  };

  const handleEdit = (dest: any) => {
    setIsEditing(true);
    setEditingId(dest.id);
    setValue('cityId', dest.cityId);
    setValue('factsTypeId', dest.factsTypeId);
    setValue('description', dest.description);
    setValue('imageTag', dest.imageTag || '');
    setValue('isActive', dest.isActive);
    setThumbnailPreview(dest.thumbnailImage || null);
    setBigImagePreview(dest.bigImage || null);
  };

  const handleDelete = (id: number) => {
    updateFormData({ destinations: (formData.destinations || []).filter((d: any) => d.id !== id) });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    reset();
    setThumbnailPreview(null);
    setBigImagePreview(null);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Destination Details
            </Typography>
            <Chip label="Optional" size="small" sx={{ ml: 1.5, bgcolor: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem' }} />
          </Box>
          <Divider sx={{ mb: 2 }} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
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

              <Grid item xs={12} md={4}>
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

              <Grid item xs={12} md={4}>
                <Controller
                  name="imageTag"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth size="small" label="Image Tag" sx={compactFieldSx} />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth size="small" multiline rows={3} label="Description *" sx={compactFieldSx} error={!!errors.description} helperText={errors.description?.message} />
                  )}
                />
              </Grid>

              {/* Images */}
              <Grid item xs={12} md={5}>
                <Typography variant="caption" fontWeight={600} display="block" gutterBottom>Thumbnail</Typography>
                {thumbnailPreview ? (
                  <Box>
                    <img src={thumbnailPreview} alt="Thumbnail" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />
                    <Button size="small" onClick={() => setThumbnailPreview(null)} sx={{ mt: 0.5 }}>Remove</Button>
                  </Box>
                ) : (
                  <Button component="label" variant="outlined" startIcon={<CloudUpload sx={{ fontSize: 16 }} />} size="small" fullWidth sx={{ borderStyle: 'dashed', borderRadius: 2 }}>
                    Choose Thumbnail
                    <input type="file" hidden accept="image/*" onChange={handleThumbnailChange} />
                  </Button>
                )}
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography variant="caption" fontWeight={600} display="block" gutterBottom>Big Image</Typography>
                {bigImagePreview ? (
                  <Box>
                    <img src={bigImagePreview} alt="Big Image" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />
                    <Button size="small" onClick={() => setBigImagePreview(null)} sx={{ mt: 0.5 }}>Remove</Button>
                  </Box>
                ) : (
                  <Button component="label" variant="outlined" startIcon={<CloudUpload sx={{ fontSize: 16 }} />} size="small" fullWidth sx={{ borderStyle: 'dashed', borderRadius: 2 }}>
                    Choose Big Image
                    <input type="file" hidden accept="image/*" onChange={handleBigImageChange} />
                  </Button>
                )}
              </Grid>

              <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Checkbox {...field} checked={field.value} size="small" />} label={<Typography variant="body2">Active</Typography>} />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button type="submit" variant="contained" size="small" startIcon={isEditing ? <SaveIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />}
                    sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #5a3a7d 100%)' } }}>
                    {isEditing ? 'Update' : 'Add Destination'}
                  </Button>
                  {isEditing && (
                    <Button variant="outlined" size="small" startIcon={<CancelIcon sx={{ fontSize: 16 }} />} onClick={handleCancel} color="error">
                      Cancel
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      {formData.destinations && formData.destinations.length > 0 && (
        <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} color="#1e293b" gutterBottom>
              Added Destinations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['City', 'Facts Type', 'Description', 'Status', 'Actions'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>{h}</TableCell>
                    ))}
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
                        <Chip label={dest.isActive ? 'Active' : 'Inactive'} size="small" color={dest.isActive ? 'success' : 'default'} variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(dest)} sx={{ mr: 0.5 }}>
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
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Step6DestinationDetails;