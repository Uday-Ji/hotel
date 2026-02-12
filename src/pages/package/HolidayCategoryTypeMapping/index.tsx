import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  FormControl,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DataGrid } from '@/components/common/DataGrid';
import type { Column } from '@/components/common/DataGrid';
import { packageService } from '@/services/package/package.service';
import type { HolidayCategoryTypeMapping } from '@/services/package/package.models';
import styles from './HolidayCategoryTypeMapping.module.css';

const HolidayCategoryTypeMappingPage: React.FC = () => {
  const [mappings, setMappings] = useState<(HolidayCategoryTypeMapping & { id: number })[]>([]);
  const [filteredMappings, setFilteredMappings] = useState<(HolidayCategoryTypeMapping & { id: number })[]>([]);
  const [statusFilter, setStatusFilter] = useState('Active');
  const [isLoading, setIsLoading] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState<number>(1);

  useEffect(() => {
    fetchMappings();
  }, []);

  useEffect(() => {
    filterMappings();
  }, [mappings, statusFilter]);

  const fetchMappings = async () => {
    setIsLoading(true);
    try {
      const data = await packageService.getHolidayCategoryTypeMappingList();
      setMappings(data.map((item, index) => ({ ...item, id: index + 1 })) as any);
    } catch (error) {
      console.error('Failed to fetch mappings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMappings = () => {
    let filtered = [...mappings];
    if (statusFilter !== 'Both') {
      filtered = filtered.filter((m: any) => m.status === statusFilter);
    }
    setFilteredMappings(filtered);
  };

  const columns: Column<HolidayCategoryTypeMapping>[] = [
  { key: 'categoryCode', label: 'Category Code', sortable: true },
  { key: 'categoryName', label: 'Category Name', sortable: true },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (item) => (  // Keep 'item' since we're using it
      <span style={{ color: item.status === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>
        {item.status}
      </span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    render: () => (  // Change (item) to () since we're not using it
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton size="small" color="primary">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    ),
  },
];

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        Holiday Type Category Mapping Master
      </Typography>

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
          <Typography>Add/Edit Form will be here</Typography>
        </AccordionDetails>
      </Accordion>

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
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Total Records: {filteredMappings.length}
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <FormControlLabel value="Active" control={<Radio />} label="Active" />
                <FormControlLabel value="In-Active" control={<Radio />} label="In-Active" />
                <FormControlLabel value="Both" control={<Radio />} label="Both" />
              </RadioGroup>
            </FormControl>
          </Box>

          <DataGrid
            title=""
            data={filteredMappings}
            columns={columns}
            isLoading={isLoading}
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default HolidayCategoryTypeMappingPage;