/**
 * Holiday Category Master Page
 * Production-ready implementation with validation and modal
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
// LANGUAGE OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'French', label: 'French' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'German', label: 'German' },
  { value: 'Chinese', label: 'Chinese' },
];

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMA  (status as boolean for checkbox, converted on submit)
// ─────────────────────────────────────────────────────────────────────────────

const holidayCategorySchema = z.object({
  categoryCode: z
    .string()
    .min(1, 'Category code is required')
    .max(10, 'Category code must be 10 characters or less'),
  categoryName: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be 100 characters or less'),
  language: z.string().min(1, 'Language is required'),
  status: z.boolean(),
});

type HolidayCategoryFormData = z.infer<typeof holidayCategorySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const HolidayCategoryMasterPage: React.FC = () => {
  // State Management
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Inactive' | 'Both'>('Both');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<HolidayCategoryFormData>({
    categoryCode: '',
    categoryName: '',
    language: 'English',
    status: true,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Fetch Holiday Categories
  const fetchCategories = useCallback(async () => {
    setIsFetching(true);
    try {
      const data = await packageService.getHolidayCategoryList();
      setCategories(data as any);
      setMessage(null);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to fetch holiday categories',
      });
      setCategories([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Filter Categories
  const filterData = useCallback(() => {
    let filtered = [...categories];
    if (statusFilter !== 'Both') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    setFilteredCategories(filtered);
  }, [categories, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      holidayCategorySchema.parse(formData);
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
    setEditingCategory(null);
    setFormData({ categoryCode: '', categoryName: '', language: 'English', status: true });
    setFormErrors({});
    setError(null);
    setModalOpen(true);
  };

  const handleEditClick = (item: any) => {
    setEditingCategory(item);
    setFormData({
      categoryCode: item.categoryCode || '',
      categoryName: item.categoryName || '',
      language: item.language || 'English',
      status: item.status === 'Active' || item.status === true,
    });
    setFormErrors({});
    setError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormData({ categoryCode: '', categoryName: '', language: 'English', status: true });
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

      if (editingCategory) {
        await packageService.updateHolidayCategory(editingCategory.holidayCategoryId, payload);
        setMessage({
          type: 'success',
          text: 'Holiday category updated successfully',
        });
      } else {
        await packageService.createHolidayCategory(payload);
        setMessage({
          type: 'success',
          text: 'Holiday category added successfully',
        });
      }

      await fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to save holiday category';
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
    if (!window.confirm('Are you sure you want to delete this holiday category?')) {
      return;
    }

    try {
      await packageService.deleteHolidayCategory(id);
      setMessage({
        type: 'success',
        text: 'Holiday category deleted successfully',
      });
      await fetchCategories();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to delete holiday category',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Holiday Category Master
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
          Add Category
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
            Total Records: {filteredCategories.length}
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
        ) : filteredCategories.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: '#64748b' }}>
            <Typography>No holiday categories found. Click "Add Category" to create one.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                  Category Code
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                  Category Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Language</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.map((item) => (
                <TableRow key={item.holidayCategoryId} hover>
                  <TableCell sx={{ color: '#1e293b', fontWeight: 500 }}>
                    {item.categoryCode}
                  </TableCell>
                  <TableCell sx={{ color: '#1e293b', fontWeight: 500 }}>
                    {item.categoryName}
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
                      onClick={() => handleDelete(item.holidayCategoryId)}
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
        title="Holiday Category"
        subtitle={editingCategory ? 'Edit holiday category details' : 'Add new holiday category'}
        isSubmitting={isLoading}
        isEditing={!!editingCategory}
        submitButtonText={editingCategory ? 'Update' : 'Add'}
        disableSubmit={Object.keys(formErrors).length > 0 || isLoading}
        primaryColor="#667eea"
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Category Code */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Category Code *</Typography>
          <input
            type="text"
            value={formData.categoryCode}
            onChange={(e) => handleInputChange('categoryCode', e.target.value)}
            placeholder="e.g., HC001"
            style={{
              width: '100%', padding: '10px 12px',
              border: formErrors.categoryCode ? '1px solid #ef4444' : '1px solid #e5e7eb',
              borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
            }}
            maxLength={10}
          />
          {formErrors.categoryCode && (
            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 0.5 }}>
              {formErrors.categoryCode}
            </Typography>
          )}
        </Box>

        {/* Category Name */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Category Name *</Typography>
          <input
            type="text"
            value={formData.categoryName}
            onChange={(e) => handleInputChange('categoryName', e.target.value)}
            placeholder="Enter holiday category name"
            style={{
              width: '100%', padding: '10px 12px',
              border: formErrors.categoryName ? '1px solid #ef4444' : '1px solid #e5e7eb',
              borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
            }}
            maxLength={100}
          />
          {formErrors.categoryName && (
            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 0.5 }}>
              {formErrors.categoryName}
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
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
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

export default HolidayCategoryMasterPage;