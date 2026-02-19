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
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
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

// Schema for adding/editing a single day
const itineraryDaySchema = z.object({
  day: z.number().min(1, 'Day must be at least 1'),
  cityId: z.number().min(1, 'City is required'),
  briefDescription: z.string().min(5, 'Brief description must be at least 5 characters'),
  fullDescription: z.string().optional(),
});

type ItineraryDayFormData = z.infer<typeof itineraryDaySchema>;

const Step5ItineraryManage: React.FC<Step5Props> = ({
  formData,
  updateFormData,
  onValidationChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [itineraryDays, setItineraryDays] = useState<any[]>(formData.itineraryDays || []);
  const [inclusions, setInclusions] = useState(formData.inclusions || '');
  const [exclusions, setExclusions] = useState(formData.exclusions || '');

  const cities = [
    { id: 1, name: 'Agartala' },
    { id: 2, name: 'Delhi' },
    { id: 3, name: 'Mumbai' },
  ];

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
      day: 1,
      cityId: 0,
      briefDescription: '',
      fullDescription: '',
    },
  });

  // Update parent and validation whenever itinerary days change
  useEffect(() => {
    const isValid = itineraryDays.length > 0;
    updateFormData({
      itineraryDays: itineraryDays,
      inclusions: inclusions,
      exclusions: exclusions,
    });
    onValidationChange(isValid);
  }, [itineraryDays, inclusions, exclusions]);

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

    setItineraryDays(updatedDays);
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
    setItineraryDays(updatedDays);
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
    { key: 'day', label: 'Day', sortable: true, width: '80px' },
    {
      key: 'cityId',
      label: 'City',
      width: '150px',
      render: (item) => cities.find((c) => c.id === item.cityId)?.name || '--',
    },
    { key: 'briefDescription', label: 'Brief Description', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      render: (item) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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

  const compactFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: '#fff',
    },
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
        {itineraryDays.length === 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Please add at least one itinerary day to proceed to the next step.
          </Alert>
        )}

        <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarIcon sx={{ mr: 1, color: '#f59e0b', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Itinerary Management
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {itineraryDays.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <DataGrid title="" data={itineraryDays as any} columns={columns} />
              </Box>
            )}

            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                {isEditing ? 'Edit Day' : 'Add New Day'}
              </Typography>
              <form onSubmit={handleDaySubmit(onSubmitDay)}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={2}>
                    <Controller
                      name="day"
                      control={dayControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Day *"
                          type="number"
                          sx={compactFieldSx}
                          error={!!dayErrors.day}
                          helperText={dayErrors.day?.message}
                          inputProps={{ min: 1 }}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
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
                          size="small"
                          label="City *"
                          sx={compactFieldSx}
                          error={!!dayErrors.cityId}
                          helperText={dayErrors.cityId?.message}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
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
                          size="small"
                          label="Brief Description *"
                          sx={compactFieldSx}
                          error={!!dayErrors.briefDescription}
                          helperText={dayErrors.briefDescription?.message}
                          placeholder="Enter brief description"
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
                        size="small"
                        startIcon={isEditing ? <SaveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                        sx={{ 
                          height: '40px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #5a3a7d 100%)',
                          }
                        }}
                      >
                        {isEditing ? 'Update' : 'Add'}
                      </Button>
                      {isEditing && (
                        <IconButton 
                          color="error" 
                          onClick={handleCancel}
                          size="small"
                          sx={{ 
                            height: '40px',
                            width: '40px',
                            border: '1px solid #ef4444',
                          }}
                        >
                          <CancelIcon fontSize="small" />
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
                          size="small"
                          multiline
                          rows={3}
                          label="Full Description"
                          sx={compactFieldSx}
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

        <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Inclusions & Exclusions
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  label="Inclusions"
                  sx={compactFieldSx}
                  value={inclusions}
                  onChange={(e) => setInclusions(e.target.value)}
                  placeholder="E.g., Hotel accommodation, Daily breakfast, Airport transfers..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  label="Exclusions"
                  sx={compactFieldSx}
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  placeholder="E.g., International flights, Travel insurance, Personal expenses..."
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
};

export default Step5ItineraryManage;
