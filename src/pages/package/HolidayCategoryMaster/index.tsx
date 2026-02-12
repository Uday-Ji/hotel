import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Checkbox,
  IconButton,
  Grid,
  Alert,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DataGrid } from '@/components/common/DataGrid';
import type { Column } from '@/components/common/DataGrid';
import { packageService } from '@/services/package/package.service';
import type { HolidayCategory } from '@/services/package/package.models';
import styles from './HolidayCategoryMaster.module.css';

const HolidayCategoryMasterPage: React.FC = () => {
  const [categories, setCategories] = useState<HolidayCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<HolidayCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState('Active');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    categoryCode: '',
    categoryName: '',
    language: 'English',
    status: true,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const languages = [
    { value: 'English', label: 'English' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'French', label: 'French' },
    { value: 'Spanish', label: 'Spanish' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, statusFilter]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await packageService.getHolidayCategoryList();
      setCategories(
        data.map((item, index) => ({
          ...item,
          id: index + 1,
          status: item.status || 'Active',
          language: item.language || 'English',
        })) as any
      );
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to fetch categories' });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];
    if (statusFilter !== 'Both') {
      filtered = filtered.filter((c: any) => c.status === statusFilter);
    }
    setFilteredCategories(filtered);
  };

  const handleEdit = (item: any) => {
    setFormData({
      categoryCode: item.categoryCode,
      categoryName: item.categoryName,
      language: item.language || 'English',
      status: item.status === 'Active',
    });
    setIsEditMode(true);
    setEditId(item.id);
    setAccordionExpanded(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        categoryCode: formData.categoryCode,
        categoryName: formData.categoryName,
        language: formData.language,
        status: formData.status ? 'Active' : 'Inactive',
      };

      if (isEditMode && editId) {
        await packageService.updateHolidayCategory(editId, payload);
        setMessage({ type: 'success', text: 'Category updated successfully' });
      } else {
        await packageService.createHolidayCategory(payload);
        setMessage({ type: 'success', text: 'Category added successfully' });
      }

      resetForm();
      fetchCategories();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save category' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      categoryCode: '',
      categoryName: '',
      language: 'English',
      status: true,
    });
    setIsEditMode(false);
    setEditId(null);
    setAccordionExpanded(1);
  };

  const columns: Column<any>[] = [
    { key: 'categoryCode', label: 'Category Code', sortable: true },
    { key: 'categoryName', label: 'Category Name', sortable: true },
    { key: 'language', label: 'Language', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => (
        <span style={{ color: item.status === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        Holiday Category Master
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Paper className={styles.paper}>
        <Accordion
          expanded={accordionExpanded === 1}
          onChange={() => setAccordionExpanded(accordionExpanded === 1 ? 0 : 1)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ background: 'linear-gradient(90deg, #f59e0b 0%, #fb923c 100%)', color: 'white' }}
          >
            <Typography fontWeight={600}>Display Existing Records &gt;&gt;</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="body2" color="textSecondary">
                Total Number of Records: {filteredCategories.length}
              </Typography>
              <RadioGroup row value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <FormControlLabel value="Active" control={<Radio />} label="Active" />
                <FormControlLabel value="In-Active" control={<Radio />} label="In-Active" />
                <FormControlLabel value="Both" control={<Radio />} label="Both" />
              </RadioGroup>
            </Box>

            <DataGrid
              title=""
              data={filteredCategories}
              columns={columns}
              isLoading={isLoading}
              onViewMore={handleEdit}
            />

            <Box sx={{ mt: 3 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Category Code"
                      value={formData.categoryCode}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryCode: e.target.value })
                      }
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Category Name"
                      value={formData.categoryName}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryName: e.target.value })
                      }
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      select
                      label="Language"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      required
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Checkbox
                        checked={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<AddIcon />}
                        disabled={isLoading}
                      >
                        Add
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};

export default HolidayCategoryMasterPage;