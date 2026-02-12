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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,  
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataGrid } from '@/components/common/DataGrid';
import type { Column } from '@/components/common/DataGrid';
import type { CreatePackageRequest } from '@/services/package/package.models';

interface Step5Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

// Schema for the overall step (must have at least one itinerary day)
const step5Schema = z.object({
  itineraryDays: z
    .array(
      z.object({
        day: z.number().min(1),
        cityId: z.number(),
        briefDescription: z.string(),
        fullDescription: z.string().optional(),
      })
    )
    .min(1, 'At least one itinerary day is required'),
  inclusions: z.string().optional(),
  exclusions: z.string().optional(),
});

// Schema for adding/editing a single day
const itineraryDaySchema = z.object({
  day: z.number().min(1, 'Day must be at least 1'),
  cityId: z.number().min(1, 'City is required'),
  briefDescription: z.string().min(5, 'Brief description must be at least 5 characters'),
  fullDescription: z.string().min(1).optional().or(z.literal('')),
});

type Step5FormData = z.infer<typeof step5Schema>;
type ItineraryDayFormData = z.infer<typeof itineraryDaySchema>;

const Step5ItineraryManage: React.FC<Step5Props> = ({
  formData,
  updateFormData,
  onValidationChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const cities = [
    { id: 1, name: 'Agartala' },
    { id: 2, name: 'Delhi' },
    { id: 3, name: 'Mumbai' },
  ];

  // Form for the whole step (inclusions/exclusions)
  const {
    control: stepControl,
    watch: stepWatch,
    formState: { isValid: isStepValid },
  } = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    mode: 'onChange',
    defaultValues: {
      itineraryDays: formData.itineraryDays || [],
      inclusions: formData.inclusions || '',
      exclusions: formData.exclusions || '',
    },
  });

  // Form for adding/editing individual days
  const {
    control: dayControl,
    handleSubmit: handleDaySubmit,
    reset: resetDayForm,
    setValue: setDayValue,
    formState: { errors: dayErrors },
  } = useForm<ItineraryDayFormData>({
    resolver: zodResolver(itineraryDaySchema),
    defaultValues: {
      day: (formData.itineraryDays?.length || 0) + 1,
      cityId: 0,
      briefDescription: '',
      fullDescription: '',
    },
  });

  const watchedStepValues = stepWatch();
  const itineraryDays = watchedStepValues.itineraryDays || [];

  useEffect(() => {
    updateFormData({
      itineraryDays: itineraryDays as any,
      inclusions: watchedStepValues.inclusions,
      exclusions: watchedStepValues.exclusions,
    });
    onValidationChange(isStepValid);
  }, [watchedStepValues, isStepValid]);

  const onSubmitDay = (data: ItineraryDayFormData) => {
    const newDay: any = {
      ...data,
      id: isEditing ? editingId : Date.now(),
      fullDescription: data.fullDescription || '',
    };

    let updatedDays;
    if (isEditing && editingId) {
      updatedDays = itineraryDays.map((day: any) => (day.id === editingId ? newDay : day));
    } else {
      updatedDays = [...itineraryDays, newDay];
    }

    updateFormData({ itineraryDays: updatedDays });
    handleCancel();
  };

  const handleEdit = (day: any) => {
    setIsEditing(true);
    setEditingId(day.id);
    setDayValue('day', day.day);
    setDayValue('cityId', day.cityId);
    setDayValue('briefDescription', day.briefDescription);
    setDayValue('fullDescription', day.fullDescription || '');
  };

  const handleDelete = (id: number) => {
    const updatedDays = itineraryDays.filter((day: any) => day.id !== id);
    updateFormData({ itineraryDays: updatedDays });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    resetDayForm({
      day: itineraryDays.length + 1,
      cityId: 0,
      briefDescription: '',
      fullDescription: '',
    });
  };

  const columns: Column<any>[] = [
    { key: 'day', label: 'Day', sortable: true },
    {
      key: 'cityId',
      label: 'City',
      render: (item) => cities.find((c) => c.id === item.cityId)?.name || '--',
    },
    { key: 'briefDescription', label: 'Brief Description', sortable: true },
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
      {itineraryDays.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please add at least one itinerary day to proceed to the next step.
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#f59e0b' }}>
            Itinerary Management
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {itineraryDays.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <DataGrid title="" data={itineraryDays as any} columns={columns} />
            </Box>
          )}

          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              {isEditing ? 'Edit Day' : 'Add New Day'}
            </Typography>
            <form onSubmit={handleDaySubmit(onSubmitDay)}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2}>
                  <Controller
                    name="day"
                    control={dayControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Day *"
                        type="number"
                        error={!!dayErrors.day}
                        helperText={dayErrors.day?.message}
                        inputProps={{ min: 1 }}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Controller
                    name="cityId"
                    control={dayControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="City *"
                        error={!!dayErrors.cityId}
                        helperText={dayErrors.cityId?.message}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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

                <Grid item xs={12} md={5}>
                  <Controller
                    name="briefDescription"
                    control={dayControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Brief Description *"
                        error={!!dayErrors.briefDescription}
                        helperText={dayErrors.briefDescription?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                      sx={{ height: '56px' }}
                    >
                      {isEditing ? 'Update' : 'Add'}
                    </Button>
                    {isEditing && (
                      <IconButton color="error" onClick={handleCancel} sx={{ height: '56px' }}>
                        <CancelIcon />
                      </IconButton>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="fullDescription"
                    control={dayControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        label="Full Description"
                        placeholder="Optional: Add detailed description for this day"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </form>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Inclusions & Exclusions
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="inclusions"
                control={stepControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Inclusions"
                    placeholder="E.g., Hotel accommodation, Daily breakfast, Airport transfers..."
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="exclusions"
                control={stepControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Exclusions"
                    placeholder="E.g., International flights, Travel insurance, Personal expenses..."
                  />
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Step5ItineraryManage;