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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
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
import type { CreatePackageRequest } from '@/services/package/package.models';

interface Step5Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

const itineraryDaySchema = z.object({
  day: z.number().min(1, 'Day must be at least 1'),
  cityId: z.number().min(1, 'City is required'),
  briefDescription: z.string().min(5, 'Brief description must be at least 5 characters'),
  fullDescription: z.string().optional(),
});

type ItineraryDayFormData = z.infer<typeof itineraryDaySchema>;

const compactFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: '#fff',
  },
};

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

  const {
    control: dayControl,
    handleSubmit: handleDaySubmit,
    reset: resetDayForm,
    setValue: setDayValue,
    formState: { errors: dayErrors },
  } = useForm<ItineraryDayFormData>({
    resolver: zodResolver(itineraryDaySchema),
    defaultValues: { day: 1, cityId: 0, briefDescription: '', fullDescription: '' },
  });

  useEffect(() => {
    const isValid = itineraryDays.length > 0;
    updateFormData({ itineraryDays, inclusions, exclusions });
    onValidationChange(isValid);
  }, [itineraryDays, inclusions, exclusions]);

  const onSubmitDay = (data: ItineraryDayFormData) => {
    const newDay: any = { ...data, id: isEditing ? editingId : Date.now(), fullDescription: data.fullDescription || '' };
    const updatedDays = isEditing && editingId
      ? itineraryDays.map((d: any) => (d.id === editingId ? newDay : d))
      : [...itineraryDays, newDay];
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

  const handleDelete = (id: number) => setItineraryDays(itineraryDays.filter((d: any) => d.id !== id));

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    resetDayForm({ day: itineraryDays.length + 1, cityId: 0, briefDescription: '', fullDescription: '' });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
        {itineraryDays.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please add at least one itinerary day to proceed.
          </Alert>
        )}

        <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarIcon sx={{ mr: 1, color: '#f59e0b', fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Itinerary Management
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Table */}
            {itineraryDays.length > 0 && (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', width: 60 }}>Day</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', width: 140 }}>City</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>Brief Description</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', width: 100, textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itineraryDays.map((day: any, index) => (
                      <TableRow key={day.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Chip label={`Day ${day.day}`} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem' }}>
                          {cities.find((c) => c.id === day.cityId)?.name || '--'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', color: '#374151' }}>
                          {day.briefDescription}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton size="small" color="primary" onClick={() => handleEdit(day)} sx={{ mr: 0.5 }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(day.id)}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Add / Edit Form */}
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px dashed #e2e8f0' }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: '#374151' }}>
                {isEditing ? '✏️ Edit Day' : '➕ Add New Day'}
              </Typography>
              <form onSubmit={handleDaySubmit(onSubmitDay)}>
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={6} md={2}>
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

                  <Grid item xs={6} md={3}>
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
                            <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
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
                        startIcon={isEditing ? <SaveIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          height: '40px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontSize: '0.8125rem',
                          '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #5a3a7d 100%)' },
                        }}
                      >
                        {isEditing ? 'Update' : 'Add'}
                      </Button>
                      {isEditing && (
                        <IconButton color="error" onClick={handleCancel} size="small" sx={{ height: '40px', width: '40px', border: '1px solid #ef4444' }}>
                          <CancelIcon sx={{ fontSize: 16 }} />
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
                          rows={2}
                          label="Full Description (Optional)"
                          sx={compactFieldSx}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </form>
            </Box>
          </CardContent>
        </Card>

        {/* Inclusions & Exclusions */}
        <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
              Inclusions &amp; Exclusions
            </Typography>
            <Divider sx={{ mb: 2 }} />

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