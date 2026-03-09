import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// ── Types ─────────────────────────────────────────────────────────────────

export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  isSubmitting?: boolean;
  isEditing?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
  disableSubmit?: boolean;
  hideActions?: boolean;
  icon?: ReactNode;
  primaryColor?: string;
}

// ── Component ─────────────────────────────────────────────────────────────

const FormModal: React.FC<FormModalProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  isSubmitting = false,
  isEditing = false,
  maxWidth = 'md',
  fullWidth = true,
  submitButtonText,
  cancelButtonText = 'Cancel',
  disableSubmit = false,
  hideActions = false,
  icon,
  primaryColor = '#667eea',
}) => {
  const defaultSubmitText = isEditing ? 'Update' : 'Add';
  const finalSubmitText = submitButtonText || defaultSubmitText;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Content */}
      <DialogContent
        sx={{
          p: 3,
          bgcolor: '#f9fafb',
          minHeight: 200,
        }}
      >
        {children}
      </DialogContent>

      {/* Actions */}
      {!hideActions && (
        <>
          <Divider />
          <DialogActions
            sx={{
              p: 2.5,
              bgcolor: '#ffffff',
              gap: 1,
            }}
          >
            <Button
              onClick={onClose}
              disabled={isSubmitting}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                borderColor: '#e5e7eb',
                color: '#64748b',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  bgcolor: '#f8fafc',
                },
              }}
            >
              {cancelButtonText}
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting || disableSubmit}
              variant="contained"
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : isEditing ? (
                  <SaveIcon />
                ) : (
                  <AddIcon />
                )
              }
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${primaryColor}dd 0%, ${primaryColor}aa 100%)`,
                },
              }}
            >
              {isSubmitting ? 'Saving...' : finalSubmitText}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default FormModal;