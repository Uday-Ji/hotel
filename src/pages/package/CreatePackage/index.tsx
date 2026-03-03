import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { Place as PlaceIcon } from '@mui/icons-material';
//import { regionService } from '@/services/common/region.service';
import type { Country } from '@/services/master/country.models';
import styles from './CreatePackage.module.css';
import { Region } from '@/services/common/region.models';
import { regionService } from '@/services/common/region.service';

const CreatePackage: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<number>(0);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    if (selectedRegion > 0) {
      fetchCountries(selectedRegion);
    }
  }, [selectedRegion]);

  const fetchRegions = async () => {
    try {
      const data = await regionService.getRegionList();
      setRegions(data);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    }
  };

  const fetchCountries = async (regionId: number) => {
    setIsLoading(true);
    try {
      const data = await regionService.getCountryByRegion(regionId);
      setCountries(data as any);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    console.log('Selected Region:', selectedRegion);
    console.log('Selected Countries:', selectedCountries);
    // Navigate to next step
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        Create New Package
      </Typography>

      <Paper className={styles.paper}>
        <Box className={styles.formHeader}>
          <PlaceIcon sx={{ fontSize: 64, color: '#64748b' }} />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(Number(e.target.value))}
                label="Region"
              >
                <MenuItem value={0}>--Please Select Region--</MenuItem>
                {regions.map((region) => (
                  <MenuItem key={region.regionId} value={region.regionId}>
                    {region.regionName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!selectedRegion || isLoading}>
              <InputLabel>Country</InputLabel>
              <Select
                multiple
                value={selectedCountries}
                onChange={(e) => setSelectedCountries(e.target.value as string[])}
                input={<OutlinedInput label="Country" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const country = countries.find((c) => c.countryCode === value);
                      return <Chip key={value} label={country?.countryName || value} size="small" />;
                    })}
                  </Box>
                )}
              >
                {countries.map((country) => (
                  <MenuItem key={country.countryCode} value={country.countryCode}>
                    {country.countryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedRegion || selectedCountries.length === 0}
              >
                Next
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CreatePackage;