/**
 * Facts Type Master Page
 * Complete master management with add/edit/delete and validation
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
import { masterService } from '@/services/master/Master.service';

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const factsTypeSchema = z.object({
  factsType: z.string().min(2, 'Minimum 2 characters').max(100),
  language: z.string().min(1, 'Language is required'),
  status: z.boolean(),
});

type FactsTypeFormData = z.infer<typeof factsTypeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const FactsTypeMasterPage: React.FC = () => {
  // State Management
  const [factsTypes, setFactsTypes] = useState<any[]>([]);
  const [filteredFactsTypes, setFilteredFactsTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Inactive' | 'Both'>('Both');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<FactsTypeFormData>({
    factsType: '',
    language: 'English',
    status: true,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Fetch Facts Types
  const fetchFactsTypes = useCallback(async () => {
    setIsFetching(true);
    try {
      const data = await masterService.getFactsTypeList();
      setFactsTypes(data as any);
      setMessage(null);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to fetch facts types',
      });
      setFactsTypes([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Filter Facts Types
  const filterData = useCallback(() => {
    let filtered = [...factsTypes];
    if (statusFilter !== 'Both') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    setFilteredFactsTypes(filtered);
  }, [factsTypes, statusFilter]);

  useEffect(() => {
    fetchFactsTypes();
  }, [fetchFactsTypes]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  // Form Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    try {
      factsTypeSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (err: any) {
      const errors: { [key: string]: string } = {};
      if (err.errors) {
        err.errors.forEach((e: any) => { errors[e.path[0]] = e.message; });
      }
      setFormErrors(errors);
      return false;
    }
  };

  // Handlers
  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({ factsType: '', language: 'English', status: true });
    setFormErrors({});
    setError(null);
    setModalOpen(true);
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormData({
      factsType: item.factsType || '',
      language: item.language || 'English',
      status: item.status === 'Active' || item.status === true,
    });
    setFormErrors({});
    setError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({ factsType: '', language: 'English', status: true });
    setFormErrors({});
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        status: formData.status ? 'Active' : 'Inactive',
      };

      if (editingItem) {
        await masterService.updateFactsType(editingItem.factsTypeId, payload);
        setMessage({
          type: 'success',
          text: 'Facts type updated successfully',
        });
      } else {
        await masterService.createFactsType(payload);
        setMessage({
          type: 'success',
          text: 'Facts type added successfully',
        });
      }

      await fetchFactsTypes();
      handleCloseModal();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to save facts type';
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
    if (!window.confirm('Are you sure you want to delete this facts type?')) {
      return;
    }

    try {
      await masterService.deleteFactsType(id);
      setMessage({
        type: 'success',
        text: 'Facts type deleted successfully',
      });
      await fetchFactsTypes();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to delete facts type',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Facts Type Master
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
          Add Facts Type
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
            Total Records: {filteredFactsTypes.length}
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
        ) : filteredFactsTypes.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: '#64748b' }}>
            <Typography>No facts types found. Click "Add Facts Type" to create one.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Facts Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Language</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFactsTypes.map((item) => (
                <TableRow key={item.factsTypeId} hover>
                  <TableCell sx={{ color: '#1e293b', fontWeight: 500 }}>
                    {item.factsType}
                  </TableCell>
                  <TableCell sx={{ color: '#64748b' }}>{item.language}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      size="small"
                      color={item.status === 'Active' ? 'success' : 'default'}
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
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item.factsTypeId)}
                      disabled={isFetching}
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
        title="Facts Type"
        subtitle={editingItem ? 'Edit facts type details' : 'Add new facts type'}
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

        {/* Facts Type Name */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Facts Type Name *</Typography>
          <input
            type="text"
            value={formData.factsType}
            onChange={(e) => handleInputChange('factsType', e.target.value)}
            placeholder="Enter facts type name"
            style={{
              width: '100%', padding: '10px 12px',
              border: formErrors.factsType ? '1px solid #ef4444' : '1px solid #e5e7eb',
              borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
            }}
            maxLength={100}
          />
          {formErrors.factsType && (
            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 0.5 }}>
              {formErrors.factsType}
            </Typography>
          )}
        </Box>

        {/* Language */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Language *</Typography>
          <select
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            style={{
              width: '100%', padding: '10px 12px',
              border: formErrors.language ? '1px solid #ef4444' : '1px solid #e5e7eb',
              borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#fff',
            }}
          >
            <option value="">Select Language</option>
            <option value="English">English</option>
            <option value="Arabic">Arabic</option>
            <option value="French">French</option>
            <option value="Spanish">Spanish</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
          </select>
          {formErrors.language && (
            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 0.5 }}>
              {formErrors.language}
            </Typography>
          )}
        </Box>

        {/* Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <input
            type="checkbox"
            checked={formData.status}
            onChange={(e) => handleInputChange('status', e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>Active</Typography>
        </Box>
      </FormModal>
    </Box>
  );
};

export default FactsTypeMasterPage;