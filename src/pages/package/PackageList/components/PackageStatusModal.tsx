import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  IconButton,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import type { PackageListItem } from '@/services/package/package.models';
import { packageService } from '@/services/package/package.service';
import styles from './PackageStatusModal.module.css';

interface PackageStatusModalProps {
  open: boolean;
  onClose: () => void;
  package: PackageListItem | null;
  onSuccess: () => void;
}

interface StatusFeatures {
  packageId: number;
  userId: number;
  companyCode: string;
  status: boolean;
  deals: boolean;
  recommended: boolean;
  menu: boolean;
  freeSell: boolean;
}

const PackageStatusModal: React.FC<PackageStatusModalProps> = ({
  open,
  onClose,
  package: pkg,
  onSuccess,
}) => {
  const [features, setFeatures] = useState<StatusFeatures>({
    packageId: 0,
    userId: 2,
    companyCode: 'SMT',
    status: true,
    deals: false,
    recommended: false,
    menu: false,
    freeSell: false,
  });

  const [initialFeatures, setInitialFeatures] = useState<StatusFeatures | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pkg && open) {
      const initial: StatusFeatures = {
        packageId: pkg.packageId,
        userId: 2,
        companyCode: 'SMT',
        status: pkg.status === 'Active',
        deals: pkg.deals,
        recommended: pkg.recommended,
        menu: pkg.menu,
        freeSell: pkg.freeSell,
      };
      setFeatures(initial);
      setInitialFeatures(initial);
      setError(null);
    }
  }, [pkg, open]);

  const hasChanges = () => {
    if (!initialFeatures) return false;
    return (
      features.status !== initialFeatures.status ||
      features.deals !== initialFeatures.deals ||
      features.recommended !== initialFeatures.recommended ||
      features.menu !== initialFeatures.menu ||
      features.freeSell !== initialFeatures.freeSell
    );
  };

  const handleToggle = (field: keyof StatusFeatures) => {
    setFeatures((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Call API to update status and features
      await packageService.updatePackageStatusAndFeatures({
        packageId: features.packageId,
        userId: features.userId,
        companyCode: features.companyCode,
        status: features.status,
        deals: features.deals,
        recommended: features.recommended,
        menu: features.menu,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update package. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (!pkg) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      className={styles.dialog}
      PaperProps={{
        className: styles.dialogPaper,
      }}
    >
      <DialogTitle className={styles.dialogTitle}>
        <Box className={styles.titleContent}>
          <Box className={styles.titleLeft}>
            <SettingsIcon className={styles.titleIcon} />
            <Box>
              <Typography variant="h6" className={styles.title}>
                Manage Package
              </Typography>
              <Typography variant="caption" className={styles.subtitle}>
                {pkg.packageName} ({pkg.packageCode})
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" disabled={isSaving}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent className={styles.dialogContent}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack spacing={2.5}>
          {/* Package Status */}
          <Box className={styles.section}>
            <Typography variant="subtitle2" className={styles.sectionTitle}>
              Package Status
            </Typography>
            <Box className={styles.toggleRow}>
              <Box>
                <Typography variant="body2" className={styles.toggleLabel}>
                  Active Status
                </Typography>
                <Typography variant="caption" className={styles.toggleDesc}>
                  Enable or disable this package
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={features.status}
                    onChange={() => handleToggle('status')}
                    color="success"
                  />
                }
                label=""
                className={styles.switchControl}
              />
            </Box>
          </Box>

          <Divider />

          {/* Features */}
          <Box className={styles.section}>
            <Typography variant="subtitle2" className={styles.sectionTitle}>
              Package Features
            </Typography>

            <Stack spacing={1.5}>
              {/* Deals */}
              <Box className={styles.toggleRow}>
                <Box>
                  <Typography variant="body2" className={styles.toggleLabel}>
                    Deals
                  </Typography>
                  <Typography variant="caption" className={styles.toggleDesc}>
                    Show special deals badge
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={features.deals}
                      onChange={() => handleToggle('deals')}
                      color="secondary"
                    />
                  }
                  label=""
                  className={styles.switchControl}
                />
              </Box>

              {/* Recommended */}
              <Box className={styles.toggleRow}>
                <Box>
                  <Typography variant="body2" className={styles.toggleLabel}>
                    Recommended
                  </Typography>
                  <Typography variant="caption" className={styles.toggleDesc}>
                    Mark as recommended package
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={features.recommended}
                      onChange={() => handleToggle('recommended')}
                      color="warning"
                    />
                  }
                  label=""
                  className={styles.switchControl}
                />
              </Box>

              {/* Menu */}
              <Box className={styles.toggleRow}>
                <Box>
                  <Typography variant="body2" className={styles.toggleLabel}>
                    Show in Menu
                  </Typography>
                  <Typography variant="caption" className={styles.toggleDesc}>
                    Display in main navigation menu
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={features.menu}
                      onChange={() => handleToggle('menu')}
                      color="primary"
                    />
                  }
                  label=""
                  className={styles.switchControl}
                />
              </Box>

              {/* Free Sell */}
              <Box className={styles.toggleRow}>
                <Box>
                  <Typography variant="body2" className={styles.toggleLabel}>
                    Free Sell
                  </Typography>
                  <Typography variant="caption" className={styles.toggleDesc}>
                    Enable free sell for this package
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={features.freeSell}
                      onChange={() => handleToggle('freeSell')}
                      color="success"
                    />
                  }
                  label=""
                  className={styles.switchControl}
                />
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions className={styles.dialogActions}>
        <Button onClick={handleClose} disabled={isSaving} className={styles.cancelButton}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!hasChanges() || isSaving}
          startIcon={isSaving ? undefined : <CheckIcon />}
          className={styles.saveButton}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PackageStatusModal;