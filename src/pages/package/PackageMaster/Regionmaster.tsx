/**
 * Region Master
 * Production-ready master management component
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { z } from 'zod';
import FormModal from '@/components/common/FormModal';
import { packageService } from '@/services/package/package.service';

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const regionSchema = z.object({
  regionCode: z.string().min(1, 'Region Code is required').max(10),
  regionName: z.string().min(2, 'Minimum 2 characters').max(100),
  associatedCountries: z.string().min(1, 'Associated Countries is required').max(500),
  status: z.boolean(),
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const RegionMaster: React.FC = () => {
  // ─── State Management ───────────────────────────────────────────────────────
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Inactive' | 'Both'>('Both');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Modal State ────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // ─── Form State (for modal content) ─────────────────────────────────────────
  const [formData, setFormData] = useState({
    regionCode: '',
    regionName: '',
    associatedCountries: '',
    status: true,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // ─────────────────────────────────────────────────────────────────────────────
  // FETCH DATA
  // ─────────────────────────────────────────────────────────────────────────────

  const fetchItems = useCallback(async () => {
    setIsFetching(true);
    try {
      const data = await packageService.getRegionList();
      setItems(data || []);
      setMessage(null);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to fetch regions',
      });
      setItems([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  // ─── Filter Items ──────────────────────────────────────────────────────────

  const filterItems = useCallback(() => {
    let filtered = [...items];
    if (statusFilter !== 'Both') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    setFilteredItems(filtered);
  }, [items, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  // ─────────────────────────────────────────────────────────────────────────────
  // FORM HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      regionSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (err: any) {
      const errors: { [key: string]: string } = {};
      if (err.errors) {
        err.errors.forEach((error: any) => {
          errors[error.path[0]] = error.message;
        });
      }
      setFormErrors(errors);
      return false;
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({
      regionCode: '',
      regionName: '',
      associatedCountries: '',
      status: true,
    });
    setFormErrors({});
    setError(null);
    setModalOpen(true);
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormData({
      regionCode: item.regionCode || '',
      regionName: item.regionName || '',
      associatedCountries: item.associatedCountries || '',
      status: item.status === 'Active' || item.status === true,
    });
    setFormErrors({});
    setError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({
      regionCode: '',
      regionName: '',
      associatedCountries: '',
      status: true,
    });
    setFormErrors({});
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        status: formData.status ? 'Active' : 'Inactive',
      };

      if (editingItem) {
        // Update existing
        const id = editingItem.regionId || editingItem.id;
        await packageService.updateRegion(id, payload);
        setMessage({
          type: 'success',
          text: 'Region updated successfully',
        });
      } else {
        // Create new
        await packageService.createRegion(payload);
        setMessage({
          type: 'success',
          text: 'Region added successfully',
        });
      }

      await fetchItems();
      handleCloseModal();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to save region';
      setError(errorMessage);
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this region?')) {
      return;
    }

    try {
      await packageService.deleteRegion(id);
      setMessage({
        type: 'success',
        text: 'Region deleted successfully',
      });
      await fetchItems();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to delete region',
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Region Master
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #5a3a7d 100%)',
            },
          }}
        >
          Add Region
        </Button>
      </Box>

      {/* Messages */}
      {message && (
        <Alert
          severity={message.type}
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
            Total Records: {filteredItems.length}
          </Typography>
          <RadioGroup
            row
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <FormControlLabel value="Active" control={<Radio size="small" />} label="Active" />
            <FormControlLabel
              value="Inactive"
              control={<Radio size="small" />}
              label="Inactive"
            />
            <FormControlLabel value="Both" control={<Radio size="small" />} label="Both" />
          </RadioGroup>
        </Box>
      </Card>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        {isFetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredItems.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: '#64748b' }}>
            <Typography>
              No regions found. Click "Add Region" to create one.
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Associated Countries</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.regionId || item.id} hover>
                  <TableCell sx={{ color: '#1e293b', fontWeight: 500 }}>
                    {item.regionCode}
                  </TableCell>
                  <TableCell sx={{ color: '#1e293b', fontWeight: 500 }}>
                    {item.regionName}
                  </TableCell>
                  <TableCell sx={{ color: '#64748b' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.associatedCountries}
                    >
                      {item.associatedCountries}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status === 'Active' || item.status === true ? 'Active' : 'Inactive'}
                      size="small"
                      color={
                        item.status === 'Active' || item.status === true ? 'success' : 'default'
                      }
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditClick(item)}
                      disabled={isFetching}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item.regionId || item.id)}
                      disabled={isFetching}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Modal */}
      <FormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title="Region"
        subtitle={editingItem ? 'Edit region details' : 'Add new region'}
        isSubmitting={isLoading}
        isEditing={!!editingItem}
        submitButtonText={editingItem ? 'Update' : 'Add'}
        disableSubmit={Object.keys(formErrors).length > 0 || isLoading}
        primaryColor="#667eea"
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Region Code Field */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Region Code *
          </Typography>
          <input
            type="text"
            value={formData.regionCode}
            onChange={(e) => handleInputChange('regionCode', e.target.value)}
            placeholder="e.g., ASIA"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: formErrors.regionCode ? '1px solid #ef4444' : '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
            maxLength={10}
          />
          {formErrors.regionCode && (
            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 0.5 }}>
              {formErrors.regionCode}
            </Typography>
          )}
        </Box>

        {/* Region Name Field */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Region Name *
          </Typography>
          <input
            type="text"
            value={formData.regionName}
            onChange={(e) => handleInputChange('regionName', e.target.value)}
            placeholder="e.g., Asia Pacific"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: formErrors.regionName ? '1px solid #ef4444' : '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
            maxLength={100}
          />
          {formErrors.regionName && (
            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 0.5 }}>
              {formErrors.regionName}
            </Typography>
          )}
        </Box>

        {/* Associated Countries Field */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Associated Countries *
          </Typography>
          <textarea
            value={formData.associatedCountries}
            onChange={(e) => handleInputChange('associatedCountries', e.target.value)}
            placeholder="e.g., IN, JP, SG, MY (comma-separated country codes)"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: formErrors.associatedCountries ? '1px solid #ef4444' : '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              minHeight: '100px',
              resize: 'vertical',
            }}
            maxLength={500}
          />
          {formErrors.associatedCountries && (
            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 0.5 }}>
              {formErrors.associatedCountries}
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
            Enter country codes separated by commas
          </Typography>
        </Box>

        {/* Status Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <input
            type="checkbox"
            checked={formData.status}
            onChange={(e) => handleInputChange('status', e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Active
          </Typography>
        </Box>
      </FormModal>
    </Box>
  );
};

export default RegionMaster;