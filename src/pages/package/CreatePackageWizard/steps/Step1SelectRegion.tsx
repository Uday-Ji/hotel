import React, { useEffect, useState } from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput,
  Card,
  CardContent,
  Typography,
  Avatar,
  FormHelperText,
} from '@mui/material';
import { Place as PlaceIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
//import { regionService } from '@/services/common/region.service';
//import type { Region, Country } from '@/services/common/region.models';
import type { CreatePackageRequest } from '@/services/package/package.models';
import { Region } from '@/services/common/region.models';
import { regionService } from '@/services/common/region.service';
import { Country } from '@/services/master/country.models';

interface Step1Props {
  formData: Partial<CreatePackageRequest>;
  updateFormData: (data: Partial<CreatePackageRequest>) => void;
  onValidationChange: (isValid: boolean) => void;
}

const step1Schema = z.object({
  regionId: z.number().min(1, 'Region is required'),
  countryIds: z.array(z.string()).min(1, 'At least one country is required'),
});

type Step1FormData = z.infer<typeof step1Schema>;

const Step1SelectRegion: React.FC<Step1Props> = ({ formData, updateFormData, onValidationChange }) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    watch,
    formState: { errors, isValid },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    defaultValues: {
      regionId: formData.regionId || 0,
      countryIds: formData.countryIds || [],
    },
  });

  const watchedRegionId = watch('regionId');
  const watchedCountryIds = watch('countryIds');

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    if (watchedRegionId && watchedRegionId > 0) {
      fetchCountries(watchedRegionId);
    }
  }, [watchedRegionId]);

  useEffect(() => {
    updateFormData({
      regionId: watchedRegionId,
      countryIds: watchedCountryIds,
    });
    onValidationChange(isValid);
  }, [watchedRegionId, watchedCountryIds, isValid]);

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
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto',
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
            }}
          >
            <PlaceIcon sx={{ fontSize: 48, color: 'white' }} />
          </Avatar>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
            Select Region & Countries
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            Choose the region and countries for your travel package
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Controller
            name="regionId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.regionId}>
                <InputLabel>Region *</InputLabel>
                <Select
                  {...field}
                  label="Region *"
                  onChange={(e) => {
                    field.onChange(e);
                    updateFormData({ countryIds: [] });
                  }}
                >
                  <MenuItem value={0}>--Please Select Region--</MenuItem>
                  {regions.map((region) => (
                    <MenuItem key={region.regionId} value={region.regionId}>
                      {region.regionName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.regionId && <FormHelperText>{errors.regionId.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="countryIds"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.countryIds} disabled={!watchedRegionId || isLoading}>
                <InputLabel>Countries *</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="Countries *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const country = countries.find((c) => c.countryCode === value);
                        return (
                          <Chip
                            key={value}
                            label={country?.countryName || value}
                            size="small"
                            color="primary"
                          />
                        );
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
                {errors.countryIds && <FormHelperText>{errors.countryIds.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step1SelectRegion;