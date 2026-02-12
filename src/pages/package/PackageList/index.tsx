import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  InputAdornment,
  Tooltip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewModule as CardViewIcon,
  ViewList as ListViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  LocalOffer as DealIcon,
  Star as RecommendedIcon,
  ShoppingCart as FreeSellIcon,
  CalendarMonth as CalendarIcon,
  Place as PlaceIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { packageService } from '@/services/package/package.service';
import { regionService } from '@/services/common/region.service';
import type { PackageListItem, PackageListRequest } from '@/services/package/package.models';
import type { Region, Country, HolidayCategory } from '@/services/common/region.models';
import styles from './PackageList.module.css';

type ViewMode = 'card' | 'list';

const PackageList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [packages, setPackages] = useState<PackageListItem[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<PackageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [holidayCategories, setHolidayCategories] = useState<HolidayCategory[]>([]);

  // Filter states
  const [filters, setFilters] = useState<PackageListRequest>({
    regionId: 0,
    countryIds: '',
    holidayCategoryCode: '',
    validityFrom: new Date().toISOString().split('T')[0],
    validityTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    packageName: '',
    companyCode: 'SMT',
    status: '',
  });

  useEffect(() => {
    fetchDropdownData();
    fetchPackages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [packages, filters.packageName, filters.status]);

  const fetchDropdownData = async () => {
    try {
      const [regionsData, categoriesData] = await Promise.all([
        regionService.getRegionList('SMT'),
        regionService.getHolidayCategoryList('SMT'),
      ]);
      setRegions(regionsData);
      setHolidayCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  const fetchCountries = async (regionId: number) => {
    try {
      const data = await regionService.getCountryByRegion(regionId, 'SMT');
      setCountries(data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const data = await packageService.getPackageList(filters);
      setPackages(data);
      setFilteredPackages(data);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...packages];

    // Search filter
    if (filters.packageName) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.packageName.toLowerCase().includes(filters.packageName!.toLowerCase()) ||
          pkg.packageCode.toLowerCase().includes(filters.packageName!.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      const statusText = filters.status === '1' ? 'Active' : 'Inactive';
      filtered = filtered.filter((pkg) => pkg.status === statusText);
    }

    setFilteredPackages(filtered);
  };

  const handleFilterChange = (field: keyof PackageListRequest, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));

    if (field === 'regionId' && value > 0) {
      fetchCountries(value);
      setFilters((prev) => ({ ...prev, countryIds: '' }));
    }
  };

  const handleSearch = () => {
    fetchPackages();
  };

  const handleReset = () => {
    setFilters({
      regionId: 0,
      countryIds: '',
      holidayCategoryCode: '',
      validityFrom: new Date().toISOString().split('T')[0],
      validityTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      packageName: '',
      companyCode: 'SMT',
      status: '',
    });
    setCountries([]);
    fetchPackages();
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'success' : 'error';
  };

  const getPriceStatusColor = (priceStatus: string) => {
    switch (priceStatus) {
      case 'Complete':
        return 'success';
      case 'Incomplete':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box className={styles.pageWrapper}>
      {/* Header Section */}
      <Paper className={styles.headerPaper} elevation={0}>
        <Box className={styles.headerContent}>
          <Box>
            <Typography variant="h4" className={styles.pageTitle}>
              Package Management
            </Typography>
            <Typography variant="body2" className={styles.pageSubtitle}>
              Manage and view all travel packages
            </Typography>
          </Box>
          <Box className={styles.headerActions}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
              className={styles.viewToggle}
            >
              <ToggleButton value="card" aria-label="card view">
                <Tooltip title="Card View">
                  <CardViewIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <Tooltip title="List View">
                  <ListViewIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/package/create-package-wizard')}
              className={styles.createButton}
              size="large"
            >
              Create Package
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Filters Section */}
      <Paper className={styles.filterSection} elevation={1}>
        <Box className={styles.filterHeader} onClick={() => setShowFilters(!showFilters)}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon className={styles.filterIcon} />
            <Typography variant="h6" className={styles.filterTitle}>
              Search Filters
            </Typography>
          </Box>
          <IconButton size="small">
            {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {showFilters && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box className={styles.filterContent}>
              <Grid container spacing={2.5}>
                {/* Search Input */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Package"
                    placeholder="Search by name or code..."
                    value={filters.packageName}
                    onChange={(e) => handleFilterChange('packageName', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Region Dropdown */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Region</InputLabel>
                    <Select
                      value={filters.regionId || 0}
                      onChange={(e) => handleFilterChange('regionId', Number(e.target.value))}
                      label="Region"
                    >
                      <MenuItem value={0}>All Regions</MenuItem>
                      {regions.map((region) => (
                        <MenuItem key={region.regionId} value={region.regionId}>
                          {region.regionName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Country Dropdown */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small" disabled={!filters.regionId}>
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={filters.countryIds || ''}
                      onChange={(e) => handleFilterChange('countryIds', e.target.value)}
                      label="Country"
                    >
                      <MenuItem value="">All Countries</MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country.countryCode} value={country.countryCode}>
                          {country.countryName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Holiday Category */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Holiday Category</InputLabel>
                    <Select
                      value={filters.holidayCategoryCode || ''}
                      onChange={(e) => handleFilterChange('holidayCategoryCode', e.target.value)}
                      label="Holiday Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {holidayCategories.map((cat) => (
                        <MenuItem key={cat.categoryCode} value={cat.categoryCode}>
                          {cat.categoryName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Status */}
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="1">Active</MenuItem>
                      <MenuItem value="0">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Validity From */}
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Validity From"
                    value={filters.validityFrom}
                    onChange={(e) => handleFilterChange('validityFrom', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Validity To */}
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Validity To"
                    value={filters.validityTo}
                    onChange={(e) => handleFilterChange('validityTo', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleReset}
                      className={styles.resetButton}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SearchIcon />}
                      onClick={handleSearch}
                      className={styles.searchButton}
                      disabled={isLoading}
                    >
                      Search
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Paper>

      {/* Results Summary */}
      <Box className={styles.resultsSummary}>
        <Typography variant="body2" className={styles.resultsText}>
          Showing <strong>{filteredPackages.length}</strong> of <strong>{packages.length}</strong>{' '}
          packages
        </Typography>
      </Box>

      {/* Content Area */}
      <Box className={styles.contentArea}>
        {isLoading ? (
          <Paper className={styles.emptyState}>
            <Typography variant="h6" color="textSecondary">
              Loading packages...
            </Typography>
          </Paper>
        ) : filteredPackages.length === 0 ? (
          <Paper className={styles.emptyState}>
            <Alert severity="warning" sx={{ maxWidth: 600 }}>
              No packages found. Try adjusting your filters.
            </Alert>
          </Paper>
        ) : viewMode === 'card' ? (
          <Grid container spacing={3}>
            {filteredPackages.map((pkg) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={pkg.packageId}>
                <Card className={styles.packageCard} elevation={2}>
                  <Box className={styles.cardHeader}>
                    <Avatar className={styles.packageAvatar}>
                      <PlaceIcon />
                    </Avatar>
                    <Box className={styles.cardTitleBox}>
                      <Typography variant="subtitle1" className={styles.packageTitle}>
                        {pkg.packageName}
                      </Typography>
                      <Typography variant="caption" className={styles.packageCode}>
                        {pkg.packageCode}
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent className={styles.cardBody}>
                    <Stack spacing={1.5}>
                      <Box className={styles.infoRow}>
                        <Typography variant="body2" color="textSecondary">
                          Holiday Type
                        </Typography>
                        <Chip
                          label={pkg.holidayType}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      <Box className={styles.infoRow}>
                        <Typography variant="body2" color="textSecondary">
                          Duration
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {pkg.days} Days
                        </Typography>
                      </Box>

                      <Box className={styles.infoRow}>
                        <Typography variant="body2" color="textSecondary">
                          Price Status
                        </Typography>
                        <Chip
                          label={pkg.priceStatus}
                          size="small"
                          color={getPriceStatusColor(pkg.priceStatus)}
                        />
                      </Box>

                      <Divider />

                      <Box className={styles.dateInfo}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="textSecondary">
                          {pkg.validityFrom} - {pkg.validityTo}
                        </Typography>
                      </Box>

                      <Box className={styles.badges}>
                        {pkg.deals && (
                          <Chip
                            icon={<DealIcon />}
                            label="Deals"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                        {pkg.recommended && (
                          <Chip
                            icon={<RecommendedIcon />}
                            label="Recommended"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                        {pkg.freeSell && (
                          <Chip
                            icon={<FreeSellIcon />}
                            label="Free Sell"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Stack>
                  </CardContent>

                  <CardActions className={styles.cardFooter}>
                    <Chip label={pkg.status} size="small" color={getStatusColor(pkg.status)} />
                    <Box sx={{ flex: 1 }} />
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/package/view/${pkg.packageId}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/package/edit/${pkg.packageId}`)}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.tableHeaderCell}>Package Code</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Package Name</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Holiday Type</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Duration</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Validity Period</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Price Status</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Status</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Features</TableCell>
                  <TableCell className={styles.tableHeaderCell} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPackages.map((pkg) => (
                  <TableRow key={pkg.packageId} hover className={styles.tableRow}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {pkg.packageCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{pkg.packageName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pkg.holidayType}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{pkg.days} Days</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {pkg.validityFrom}
                        <br />
                        {pkg.validityTo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pkg.priceStatus}
                        size="small"
                        color={getPriceStatusColor(pkg.priceStatus)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pkg.status}
                        size="small"
                        color={getStatusColor(pkg.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {pkg.deals && (
                          <Tooltip title="Deals">
                            <DealIcon fontSize="small" color="secondary" />
                          </Tooltip>
                        )}
                        {pkg.recommended && (
                          <Tooltip title="Recommended">
                            <RecommendedIcon fontSize="small" color="warning" />
                          </Tooltip>
                        )}
                        {pkg.freeSell && (
                          <Tooltip title="Free Sell">
                            <FreeSellIcon fontSize="small" color="success" />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/package/view/${pkg.packageId}`)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/package/edit/${pkg.packageId}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default PackageList;