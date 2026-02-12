import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Divider,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Checkbox,
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

interface Step9Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

const cancellationSchema = z.object({
  condition: z.enum(['before', 'after']),
  daysFrom: z.number().min(0, 'Days must be positive'),
  amount: z.number().min(0, 'Amount must be positive').max(100, 'Percentage cannot exceed 100'),
  amountType: z.enum(['percentage', 'fixed']),
  chargeType: z.enum(['perBooking', 'perPerson']),
  isActive: z.boolean(),
});

type CancellationFormData = z.infer<typeof cancellationSchema>;

const Step9CancellationRules: React.FC<Step9Props> = ({ formData, updateFormData, onValidationChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CancellationFormData>({
    resolver: zodResolver(cancellationSchema),
    defaultValues: {
      condition: 'before',
      daysFrom: 0,
      amount: 0,
      amountType: 'percentage',
      chargeType: 'perBooking',
      isActive: true,
    },
  });

  const amountType = watch('amountType');
  
useEffect(() => {
  // Cancellation rules are optional, so always valid
  onValidationChange(true);
}, [onValidationChange]);

  const onSubmit = (data: CancellationFormData) => {
    const newRule: any = {
      ...data,
      id: isEditing ? editingId : Date.now(),
    };

    let updatedRules;
    if (isEditing && editingId) {
      updatedRules = (formData.cancellationRules || []).map((rule: any) =>
        rule.id === editingId ? newRule : rule
      );
    } else {
      updatedRules = [...(formData.cancellationRules || []), newRule];
    }

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
    const updatedRules = (formData.cancellationRules || []).filter((rule: any) => rule.id !== id);
    updateFormData({ cancellationRules: updatedRules });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    reset();
  };

  const columns: Column<any>[] = [
    {
      key: 'condition',
      label: 'Condition',
      render: (item) => item.condition.charAt(0).toUpperCase() + item.condition.slice(1),
    },
    {
      key: 'daysFrom',
      label: 'Days From',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (item) => `${item.amount}${item.amountType === 'percentage' ? '%' : ''}`,
    },
    {
      key: 'amountType',
      label: 'Amount Type',
      render: (item) => (item.amountType === 'percentage' ? 'Percentage' : 'Fixed'),
    },
    {
      key: 'chargeType',
      label: 'Charge Type',
      render: (item) => (item.chargeType === 'perBooking' ? 'Per Booking' : 'Per Person'),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item) => (
        <Checkbox checked={item.isActive} disabled size="small" />
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
      <Alert severity="info" sx={{ mb: 3 }}>
        Define cancellation policies for your package. You can add multiple rules based on different time periods.
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#f59e0b' }}>
            Policy Detail
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Condition *"
                      error={!!errors.condition}
                      helperText={errors.condition?.message}
                    >
                      <MenuItem value="before">Before</MenuItem>
                      <MenuItem value="after">After</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="daysFrom"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Days From *"
                      error={!!errors.daysFrom}
                      helperText={errors.daysFrom?.message}
                      inputProps={{ min: 0 }}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Amount *"
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                      inputProps={{
                        min: 0,
                        max: amountType === 'percentage' ? 100 : undefined,
                        step: amountType === 'percentage' ? 1 : 0.01,
                      }}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl component="fieldset">
                  <FormLabel>Amount Type *</FormLabel>
                  <Controller
                    name="amountType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel
                          value="percentage"
                          control={<Radio size="small" />}
                          label="%"
                        />
                        <FormControlLabel
                          value="fixed"
                          control={<Radio size="small" />}
                          label="Fixed"
                        />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel>Charge Type *</FormLabel>
                  <Controller
                    name="chargeType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel
                          value="perBooking"
                          control={<Radio size="small" />}
                          label="Per Booking"
                        />
                        <FormControlLabel
                          value="perPerson"
                          control={<Radio size="small" />}
                          label="Per Person"
                        />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
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
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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

      {formData.cancellationRules && formData.cancellationRules.length > 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cancellation Rules
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <DataGrid title="" data={formData.cancellationRules as any} columns={columns} />
          </CardContent>
        </Card>
      ) : (
        <Alert severity="warning">
          No cancellation rules added yet. Add at least one rule to proceed.
        </Alert>
      )}
    </Box>
  );
};

export default Step9CancellationRules;