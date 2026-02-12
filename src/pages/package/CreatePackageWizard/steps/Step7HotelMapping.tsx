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
import { DataGrid } from '@/components/common/DataGrid';
import type { Column } from '@/components/common/DataGrid';
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

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      cityId: 0,
      hotelCategoryId: 0,
      hotelName: '',
      description: '',
      imageTag: '',
      isActive: true,
    },
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

 useEffect(() => {
  const isValid = (formData.hotels || []).length > 0;
  onValidationChange(isValid);
}, [formData.hotels, onValidationChange]);


  const handleBigImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBigImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: HotelFormData) => {
    const newHotel: any = {
      ...data,
      id: isEditing ? editingId : Date.now(),
      thumbnailImage: thumbnailPreview,
      bigImage: bigImagePreview,
    };

    let updatedHotels;
    if (isEditing && editingId) {
      updatedHotels = (formData.hotels || []).map((hotel: any) =>
        hotel.id === editingId ? newHotel : hotel
      );
    } else {
      updatedHotels = [...(formData.hotels || []), newHotel];
    }

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
    const updatedHotels = (formData.hotels || []).filter((hotel: any) => hotel.id !== id);
    updateFormData({ hotels: updatedHotels });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    reset();
    setThumbnailPreview(null);
    setBigImagePreview(null);
  };

  const columns: Column<any>[] = [
    {
      key: 'cityId',
      label: 'City',
      render: (item) => cities.find((c) => c.id === item.cityId)?.name || '--',
    },
    {
      key: 'hotelCategoryId',
      label: 'Category',
      render: (item) => categories.find((c) => c.id === item.hotelCategoryId)?.name || '--',
    },
    { key: 'hotelName', label: 'Hotel Name', sortable: true },
    {
      key: 'isActive',
      label: 'Status',
      render: (item) => (
        <span style={{ color: item.isActive ? 'green' : 'red', fontWeight: 'bold' }}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <Box>
          <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#f59e0b' }}>
              Hotel Detail
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Controller
                  name="cityId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="City *"
                      error={!!errors.cityId}
                      helperText={errors.cityId?.message}
                    >
                      <MenuItem value={0}>--Select City--</MenuItem>
                      {cities.map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="hotelCategoryId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Category *"
                      error={!!errors.hotelCategoryId}
                      helperText={errors.hotelCategoryId?.message}
                    >
                      <MenuItem value={0}>--Select Category--</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
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
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth multiline rows={3} label="Description" />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Thumbnail
                  </Typography>
                  {thumbnailPreview ? (
                    <Box>
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail"
                        style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <Button size="small" onClick={() => setThumbnailPreview(null)} sx={{ mt: 1 }}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      fullWidth
                    >
                      Choose File
                      <input type="file" hidden accept="image/*" onChange={handleThumbnailChange} />
                    </Button>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Big Image
                  </Typography>
                  {bigImagePreview ? (
                    <Box>
                      <img
                        src={bigImagePreview}
                        alt="Big Image"
                        style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <Button size="small" onClick={() => setBigImagePreview(null)} sx={{ mt: 1 }}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      fullWidth
                    >
                      Choose File
                      <input type="file" hidden accept="image/*" onChange={handleBigImageChange} />
                    </Button>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="imageTag"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Image Tag" />}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Active"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                  >
                    {isEditing ? 'Update' : 'Add'}
                  </Button>
                  {isEditing && (
                    <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {formData.hotels && formData.hotels.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Update Record
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <DataGrid title="" data={formData.hotels as any} columns={columns} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Step7HotelMapping;

