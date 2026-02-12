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

interface Step6Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

const destinationSchema = z.object({
  cityId: z.number().min(1, 'City is required'),
  factsTypeId: z.number().min(1, 'Facts type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageTag: z.string().optional(),
  isActive: z.boolean(),
});

type DestinationFormData = z.infer<typeof destinationSchema>;

const Step6DestinationDetails: React.FC<Step6Props> = ({ 
  formData, 
  updateFormData,
  onValidationChange 
}) => {
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

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      cityId: 0,
      factsTypeId: 0,
      description: '',
      imageTag: '',
      isActive: true,
    },
  });

  // ADD THIS useEffect for validation
  useEffect(() => {
    const isValid = (formData.destinations || []).length > 0;
    onValidationChange(isValid);
  }, [formData.destinations, onValidationChange]);

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

  const onSubmit = (data: DestinationFormData) => {
    const newDestination: any = {
      ...data,
      id: isEditing ? editingId : Date.now(),
      thumbnailImage: thumbnailPreview,
      bigImage: bigImagePreview,
    };

    let updatedDestinations;
    if (isEditing && editingId) {
      updatedDestinations = (formData.destinations || []).map((dest: any) =>
        dest.id === editingId ? newDestination : dest
      );
    } else {
      updatedDestinations = [...(formData.destinations || []), newDestination];
    }

    updateFormData({ destinations: updatedDestinations });
    handleCancel();
  };

  const handleEdit = (destination: any) => {
    setIsEditing(true);
    setEditingId(destination.id);
    setValue('cityId', destination.cityId);
    setValue('factsTypeId', destination.factsTypeId);
    setValue('description', destination.description);
    setValue('imageTag', destination.imageTag || '');
    setValue('isActive', destination.isActive);
    setThumbnailPreview(destination.thumbnailImage || null);
    setBigImagePreview(destination.bigImage || null);
  };

  const handleDelete = (id: number) => {
    const updatedDestinations = (formData.destinations || []).filter(
      (dest: any) => dest.id !== id
    );
    updateFormData({ destinations: updatedDestinations });
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
      key: 'factsTypeId',
      label: 'Facts Type',
      render: (item) => factsTypes.find((f) => f.id === item.factsTypeId)?.name || '--',
    },
    {
      key: 'description',
      label: 'Description',
      render: (item) => item.description.substring(0, 50) + '...',
    },
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
              Destination Detail
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
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
                    >
                      <MenuItem value={0}>--Select Facts Type--</MenuItem>
                      {factsTypes.map((fact) => (
                        <MenuItem key={fact.id} value={fact.id}>
                          {fact.name}
                        </MenuItem>
                      ))}
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
                    />
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
                      <Button
                        size="small"
                        onClick={() => setThumbnailPreview(null)}
                        sx={{ mt: 1 }}
                      >
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

      {formData.destinations && formData.destinations.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Update Record
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <DataGrid title="" data={formData.destinations as any} columns={columns} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Step6DestinationDetails;