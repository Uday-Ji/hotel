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
  RadioGroup,
  FormControl,
  FormLabel,
  Radio,
  Alert,
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
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreatePackageRequest } from '@/services/package/package.models';

interface Step9Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

const cancellationSchema = z.object({
  condition: z.enum(['before', 'after']),
  daysFrom: z.number().min(0),
  amount: z.number().min(0).max(100),
  amountType: z.enum(['percentage', 'fixed']),
  chargeType: z.enum(['perBooking', 'perPerson']),
  isActive: z.boolean(),
});

type CancellationFormData = z.infer<typeof cancellationSchema>;

const compactFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' },
};

const Step9CancellationRules: React.FC<Step9Props> = ({ formData, updateFormData, onValidationChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CancellationFormData>({
    resolver: zodResolver(cancellationSchema),
    defaultValues: { condition: 'before', daysFrom: 0, amount: 0, amountType: 'percentage', chargeType: 'perBooking', isActive: true },
  });

  const amountType = watch('amountType');

  useEffect(() => {
    onValidationChange(true); // cancellation rules are optional
  }, [onValidationChange]);

  const onSubmit = (data: CancellationFormData) => {
    const newRule: any = { ...data, id: isEditing ? editingId : Date.now() };
    const updatedRules = isEditing && editingId
      ? (formData.cancellationRules || []).map((r: any) => r.id === editingId ? newRule : r)
      : [...(formData.cancellationRules || []), newRule];
    updateFormData({ cancellationRules: updatedRules });
    handleCancel();
  };

  const handleEdit = (rule: any) => {
    setIsEditing(true);
    setEditingId(rule.id);
    setValue('condition', rule.condition);
    setValue('daysFrom', rule.daysFrom);
    setValue('amount', rule.amount);
    setValue('amountType', rule.amountType);
    setValue('chargeType', rule.chargeType);
    setValue('isActive', rule.isActive);
  };

  const handleDelete = (id: number) => {
    updateFormData({ cancellationRules: (formData.cancellationRules || []).filter((r: any) => r.id !== id) });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    reset();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Alert severity="info" sx={{ mb: 2, '& .MuiAlert-message': { fontSize: '0.8125rem' } }}>
        Cancellation rules are optional. Define policies based on days before/after the tour date.
      </Alert>

      <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Policy Detail
            </Typography>
            <Chip label="Optional" size="small" sx={{ ml: 1.5, bgcolor: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem' }} />
          </Box>
          <Divider sx={{ mb: 2 }} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2.5}>
              <Grid item xs={6} md={2}>
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth size="small" label="Condition *" sx={compactFieldSx}>
                      <MenuItem value="before">Before</MenuItem>
                      <MenuItem value="after">After</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <Controller
                  name="daysFrom"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      type="number"
                      label="Days *"
                      sx={compactFieldSx}
                      error={!!errors.daysFrom}
                      helperText={errors.daysFrom?.message}
                      inputProps={{ min: 0 }}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      type="number"
                      label="Amount *"
                      sx={compactFieldSx}
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                      inputProps={{ min: 0, max: amountType === 'percentage' ? 100 : undefined, step: amountType === 'percentage' ? 1 : 0.01 }}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <FormControl size="small">
                  <FormLabel sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Amount Type *</FormLabel>
                  <Controller
                    name="amountType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel value="percentage" control={<Radio size="small" />} label={<Typography variant="body2">%</Typography>} />
                        <FormControlLabel value="fixed" control={<Radio size="small" />} label={<Typography variant="body2">Fixed</Typography>} />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={6} md={3}>
                <FormControl size="small">
                  <FormLabel sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Charge Type *</FormLabel>
                  <Controller
                    name="chargeType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel value="perBooking" control={<Radio size="small" />} label={<Typography variant="body2">Per Booking</Typography>} />
                        <FormControlLabel value="perPerson" control={<Radio size="small" />} label={<Typography variant="body2">Per Person</Typography>} />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} size="small" />}
                        label={<Typography variant="body2">Active</Typography>}
                      />
                    )}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    startIcon={isEditing ? <SaveIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />}
                    sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #5a3a7d 100%)' } }}
                  >
                    {isEditing ? 'Update Rule' : 'Add Rule'}
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

      {/* Cancellation Rules Table */}
      {formData.cancellationRules && formData.cancellationRules.length > 0 && (
        <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} color="#1e293b" gutterBottom>
              Cancellation Rules
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['Condition', 'Days', 'Amount', 'Type', 'Charge Per', 'Active', 'Actions'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(formData.cancellationRules as any[]).map((rule) => (
                    <TableRow key={rule.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Chip
                          label={rule.condition.charAt(0).toUpperCase() + rule.condition.slice(1)}
                          size="small"
                          color={rule.condition === 'before' ? 'warning' : 'info'}
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem' }}>{rule.daysFrom} days</TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {rule.amountType === 'percentage' ? `${rule.amount}%` : `${rule.amount}`}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem' }}>
                        {rule.amountType === 'percentage' ? 'Percentage' : 'Fixed'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem' }}>
                        {rule.chargeType === 'perBooking' ? 'Per Booking' : 'Per Person'}
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={rule.isActive} disabled size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(rule)} sx={{ mr: 0.5 }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(rule.id)}>
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

export default Step9CancellationRules;