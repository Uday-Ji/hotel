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
import type { TabsType } from '@/services/package/package.models';
import styles from './TabsType.module.css';

const TabsTypePage: React.FC = () => {
  const [tabsTypes, setTabsTypes] = useState<(TabsType & { id: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    offerId: 0,
    offerType: '',
    offerCode: '',
    status: true,
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchTabsTypes();
  }, []);

 // In the fetchTabsTypes function, add id field
const fetchTabsTypes = async () => {
  setIsLoading(true);
  try {
    const data = await packageService.getTabsTypeList();
    // ADD id field for DataGrid compatibility
    setTabsTypes(data.map((item) => ({ ...item, id: item.offerId })));
  } catch (error: any) {
    setMessage({ type: 'error', text: error.message || 'Failed to fetch tabs types' });
  } finally {
    setIsLoading(false);
  }
};

  const handleEdit = (item: TabsType) => {
    setFormData({
      offerId: item.offerId,
      offerType: item.offerType,
      offerCode: item.offerCode,
      status: item.status === 'Active',
    });
    setIsEditMode(true);
    setAccordionExpanded(0);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tabs type?')) {
      return;
    }

    try {
      await packageService.deleteTabsType(id);
      setMessage({ type: 'success', text: 'Tabs type deleted successfully' });
      fetchTabsTypes();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete tabs type' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        offerType: formData.offerType,
        offerCode: formData.offerCode,
        status: formData.status ? 'Active' : 'Inactive',
      };

      if (isEditMode) {
        await packageService.updateTabsType(formData.offerId, payload);
        setMessage({ type: 'success', text: 'Tabs type updated successfully' });
      } else {
        await packageService.createTabsType(payload);
        setMessage({ type: 'success', text: 'Tabs type added successfully' });
      }

      resetForm();
      fetchTabsTypes();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save tabs type' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      offerId: 0,
      offerType: '',
      offerCode: '',
      status: true,
    });
    setIsEditMode(false);
    setAccordionExpanded(1);
  };

  const columns: Column<TabsType>[] = [
    { key: 'offerId', label: 'Offer ID', sortable: true },
    { key: 'offerType', label: 'Offer Type', sortable: true },
    { key: 'offerCode', label: 'Offer Code', sortable: true },
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
          <IconButton size="small" color="error" onClick={() => handleDelete(item.offerId)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        Tabs Type
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
                {isEditMode && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Editing Offer ID: {formData.offerId}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Offer Type"
                    value={formData.offerType}
                    onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Offer Code"
                    value={formData.offerCode}
                    onChange={(e) => setFormData({ ...formData, offerCode: e.target.value })}
                    required
                  />
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
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 3 }}>
          <DataGrid
            title=""
            data={tabsTypes}
            columns={columns}
            isLoading={isLoading}
            onViewMore={handleEdit}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default TabsTypePage;