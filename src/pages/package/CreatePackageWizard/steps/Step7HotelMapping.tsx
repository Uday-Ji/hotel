import React, { useEffect, useState } from 'react';
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

interface Step7Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

const hotelSchema = z.object({
  cityId: z.number().min(1, 'City is required'),
  hotelCategoryId: z.number().min(1, 'Hotel category is required'),
  hotelName: z.string().min(1, 'Hotel name is required'),
  description: z.string().optional(),
  imageTag: z.string().optional(),
  isActive: z.boolean(),
});

type HotelFormData = z.infer<typeof hotelSchema>;

const compactFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' },
};

const Step7HotelMapping: React.FC<Step7Props> = ({ formData, updateFormData, onValidationChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bigImagePreview, setBigImagePreview] = useState<string | null>(null);

  const cities = [
    { id: 1, name: 'Delhi' },
    { id: 2, name: 'Mumbai' },
    { id: 3, name: 'Bangalore' },
  ];

  const categories = [
    { id: 1, name: '3 Star' },
    { id: 2, name: '4 Star' },
    { id: 3, name: '5 Star' },
  ];

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: { cityId: 0, hotelCategoryId: 0, hotelName: '', description: '', imageTag: '', isActive: true },
  });

  useEffect(() => {
    // Hotel mapping is optional
    onValidationChange(true);
  }, [formData.hotels, onValidationChange]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setThumbnailPreview(r.result as string); r.readAsDataURL(file); }
  };

  const handleBigImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onloadend = () => setBigImagePreview(r.result as string); r.readAsDataURL(file); }
  };

  const onSubmit = (data: HotelFormData) => {
    const newHotel: any = { ...data, id: isEditing ? editingId : Date.now(), thumbnailImage: thumbnailPreview, bigImage: bigImagePreview };
    const updatedHotels = isEditing && editingId
      ? (formData.hotels || []).map((h: any) => h.id === editingId ? newHotel : h)
      : [...(formData.hotels || []), newHotel];
    updateFormData({ hotels: updatedHotels });
    handleCancel();
  };

  const handleEdit = (hotel: any) => {
    setIsEditing(true);
    setEditingId(hotel.id);
    setValue('cityId', hotel.cityId);
    setValue('hotelCategoryId', hotel.hotelCategoryId);
    setValue('hotelName', hotel.hotelName);
    setValue('description', hotel.description || '');
    setValue('imageTag', hotel.imageTag || '');
    setValue('isActive', hotel.isActive);
    setThumbnailPreview(hotel.thumbnailImage || null);
    setBigImagePreview(hotel.bigImage || null);
  };

  const handleDelete = (id: number) => {
    updateFormData({ hotels: (formData.hotels || []).filter((h: any) => h.id !== id) });
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
              Hotel Details
            </Typography>
            <Chip label="Optional" size="small" sx={{ ml: 1.5, bgcolor: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem' }} />
          </Box>
          <Divider sx={{ mb: 2 }} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={3}>
                <Controller
                  name="cityId"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth size="small" label="City *" sx={compactFieldSx} error={!!errors.cityId} helperText={errors.cityId?.message}>
                      <MenuItem value={0}>--Select City--</MenuItem>
                      {cities.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="hotelCategoryId"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth size="small" label="Category *" sx={compactFieldSx} error={!!errors.hotelCategoryId} helperText={errors.hotelCategoryId?.message}>
                      <MenuItem value={0}>--Select Category--</MenuItem>
                      {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="hotelName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth size="small" label="Hotel Name *" sx={compactFieldSx} error={!!errors.hotelName} helperText={errors.hotelName?.message} />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
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
                    <TextField {...field} fullWidth size="small" multiline rows={2} label="Description" sx={compactFieldSx} />
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
                    {isEditing ? 'Update' : 'Add Hotel'}
                  </Button>
                  {isEditing && (
                    <Button variant="outlined" size="small" color="error" startIcon={<CancelIcon sx={{ fontSize: 16 }} />} onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Hotels Table */}
      {formData.hotels && formData.hotels.length > 0 && (
        <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} color="#1e293b" gutterBottom>
              Added Hotels
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['City', 'Category', 'Hotel Name', 'Status', 'Actions'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(formData.hotels as any[]).map((hotel) => (
                    <TableRow key={hotel.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ fontSize: '0.8125rem' }}>{cities.find((c) => c.id === hotel.cityId)?.name || '--'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem' }}>{categories.find((c) => c.id === hotel.hotelCategoryId)?.name || '--'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{hotel.hotelName}</TableCell>
                      <TableCell>
                        <Chip label={hotel.isActive ? 'Active' : 'Inactive'} size="small" color={hotel.isActive ? 'success' : 'default'} variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(hotel)} sx={{ mr: 0.5 }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(hotel.id)}>
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

export default Step7HotelMapping;