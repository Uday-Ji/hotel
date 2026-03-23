/**
 * Master Management Modal Component
 * Reusable modal for add/edit master data with form validation
 */

import React, { useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Typography,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { Close as CloseIcon } from '@mui/icons-material';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
}

export interface MasterManagementModalProps {
  open: boolean;
  title: string;
  isEditMode: boolean;
  isLoading: boolean;
  fields: FormField[];
  initialData?: Record<string, any>;
  validationSchema: ZodSchema;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  error?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const MasterManagementModal: React.FC<MasterManagementModalProps> = ({
  open,
  title,
  isEditMode,
  isLoading,
  fields,
  initialData,
  validationSchema,
  onClose,
  onSubmit,
  error,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(validationSchema),
    mode: 'onChange',
    defaultValues: useMemo(() => {
      if (initialData) {
        return initialData;
      }
      // Set default values based on field types
      const defaults: Record<string, any> = {};
      fields.forEach((field) => {
        switch (field.type) {
          case 'checkbox':
            defaults[field.name] = false;
            break;
          case 'number':
            defaults[field.name] = 0;
            break;
          case 'select':
            defaults[field.name] = '';
            break;
          default:
            defaults[field.name] = '';
        }
      });
      return defaults;
    }, [initialData, fields]),
  });

  useEffect(() => {
    if (open && initialData) {
      reset(initialData);
    } else if (open) {
      reset();
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err) {
      // Error is handled in parent component
      console.error('Form submission error:', err);
    }
  };

  const isSubmitDisabled = !isValid || isLoading || (!isDirty && isEditMode);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEditMode ? `Edit ${title}` : `Add ${title}`}
        </Typography>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{
            minWidth: 'auto',
            padding: 0.5,
          }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ minHeight: '300px', pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={2.5}>
            {fields.map((field) => (
              <Grid item xs={12} key={field.name}>
                {field.type === 'checkbox' ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: fieldProps }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...fieldProps}
                            checked={fieldProps.value || false}
                            disabled={isLoading || field.disabled}
                          />
                        }
                        label={field.label}
                      />
                    )}
                  />
                ) : field.type === 'select' ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: fieldProps }) => (
                      <TextField
                        {...fieldProps}
                        select
                        fullWidth
                        label={field.label}
                        required={field.required}
                        error={!!errors[field.name]}
                        helperText={errors[field.name]?.message?.toString()}
                        disabled={isLoading || field.disabled}
                        onChange={(e) => fieldProps.onChange(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Select {field.label}</em>
                        </MenuItem>
                        {field.options?.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                ) : (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: fieldProps }) => (
                      <TextField
                        {...fieldProps}
                        fullWidth
                        type={field.type}
                        label={field.label}
                        placeholder={field.placeholder}
                        required={field.required}
                        multiline={field.multiline}
                        rows={field.rows}
                        error={!!errors[field.name]}
                        helperText={errors[field.name]?.message?.toString()}
                        disabled={isLoading || field.disabled}
                        onChange={(e) => {
                          const value = field.type === 'number' ? e.target.value : e.target.value;
                          fieldProps.onChange(value);
                        }}
                      />
                    )}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          {/* Hidden submit button to enable form submission on Enter key */}
          <button type="submit" style={{ display: 'none' }} />
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isSubmitDisabled}
          sx={{
            minWidth: 120,
            background: isSubmitDisabled ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              {isEditMode ? 'Updating...' : 'Adding...'}
            </Box>
          ) : isEditMode ? (
            'Update'
          ) : (
            'Add'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MasterManagementModal;