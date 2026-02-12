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
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DataGrid } from '@/components/common/DataGrid';
import type { Column } from '@/components/common/DataGrid';
import { packageService } from '@/services/package/package.service';
import type { FactsType } from '@/services/package/package.models';
import styles from './FactsType.module.css';

const FactsTypePage: React.FC = () => {
  const [factsTypes, setFactsTypes] = useState<(FactsType & { id: number })[]>([]);
  const [filteredFactsTypes, setFilteredFactsTypes] = useState<(FactsType & { id: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState('Active');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    sNo: 0,
    factsType: '',
    language: 'English',
    status: true,
  });
  const [isEditMode, setIsEditMode] = useState(false);

  const languages = [
    { value: 'English', label: 'English' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'French', label: 'French' },
    { value: 'Spanish', label: 'Spanish' },
  ];

  useEffect(() => {
    fetchFactsTypes();
  }, []);

  useEffect(() => {
    filterFactsTypes();
  }, [factsTypes, statusFilter]);

  // In the fetchFactsTypes function, add id field
const fetchFactsTypes = async () => {
  setIsLoading(true);
  try {
    const data = await packageService.getFactsTypeList();
    // ADD id field for DataGrid compatibility
    setFactsTypes(data.map((item, index) => ({ ...item, id: item.sNo || index + 1 })));
  } catch (error: any) {
    setMessage({ type: 'error', text: error.message || 'Failed to fetch facts types' });
  } finally {
    setIsLoading(false);
  }
};

  const filterFactsTypes = () => {
    let filtered = [...factsTypes];
    if (statusFilter !== 'Both') {
      filtered = filtered.filter((f) => f.status === statusFilter);
    }
    setFilteredFactsTypes(filtered);
  };

  const handleEdit = (item: FactsType) => {
    setFormData({
      sNo: item.sNo,
      factsType: item.factsType,
      language: item.language,
      status: item.status === 'Active',
    });
    setIsEditMode(true);
    setAccordionExpanded(0);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this facts type?')) {
      return;
    }

    try {
      await packageService.deleteFactsType(id);
      setMessage({ type: 'success', text: 'Facts type deleted successfully' });
      fetchFactsTypes();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete facts type' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        factsType: formData.factsType,
        language: formData.language,
        status: formData.status ? 'Active' : 'Inactive',
      };

      if (isEditMode) {
        await packageService.updateFactsType(formData.sNo, payload);
        setMessage({ type: 'success', text: 'Facts type updated successfully' });
      } else {
        await packageService.createFactsType(payload);
        setMessage({ type: 'success', text: 'Facts type added successfully' });
      }

      resetForm();
      fetchFactsTypes();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save facts type' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sNo: 0,
      factsType: '',
      language: 'English',
      status: true,
    });
    setIsEditMode(false);
    setAccordionExpanded(1);
  };

  const columns: Column<FactsType>[] = [
    { key: 'sNo', label: 'S.No.', sortable: true },
    { key: 'factsType', label: 'Facts Type', sortable: true },
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(item.sNo)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        Facts Type
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Paper className={styles.paper}>
        <Accordion
          expanded={accordionExpanded === 0}
          onChange={() => setAccordionExpanded(accordionExpanded === 0 ? 1 : 0)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ background: 'linear-gradient(90deg, #f59e0b 0%, #fb923c 100%)', color: 'white' }}
          >
            <Typography fontWeight={600}>Add/Update Record &gt;&gt;</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Facts Type"
                    value={formData.factsType}
                    onChange={(e) => setFormData({ ...formData, factsType: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={4}>
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

                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Checkbox
                      checked={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    />
                    <Typography>Active</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={isEditMode ? <EditIcon /> : <AddIcon />}
                      disabled={isLoading}
                    >
                      {isEditMode ? 'Update' : 'Add'}
                    </Button>
                    {isEditMode && (
                      <Button variant="outlined" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </form>
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 2 }}>
              * Mandatory fields
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Total Number of Records: {filteredFactsTypes.length}
          </Typography>
          <RadioGroup row value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <FormControlLabel value="Active" control={<Radio />} label="Active" />
            <FormControlLabel value="In-Active" control={<Radio />} label="In-Active" />
            <FormControlLabel value="Both" control={<Radio />} label="Both" />
          </RadioGroup>
        </Box>

        <DataGrid
          title=""
          data={filteredFactsTypes}
          columns={columns}
          isLoading={isLoading}
          onViewMore={handleEdit}
        />
      </Paper>
    </Box>
  );
};

export default FactsTypePage;