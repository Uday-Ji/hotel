import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  Menu,
  MenuItem as MenuItemMui,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewModule as CardViewIcon,
  ViewList as ListViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  LocalOffer as DealIcon,
  Star as RecommendedIcon,
  ShoppingCart as FreeSellIcon,
  CalendarMonth as CalendarIcon,
  Place as PlaceIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import PackageStatusModal from './components/PackageStatusModal';
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
  const [showFilters, setShowFilters] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [holidayCategories, setHolidayCategories] = useState<HolidayCategory[]>([]);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedPackageForStatus, setSelectedPackageForStatus] = useState<PackageListItem | null>(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageListItem | null>(null);

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
const handleOpenStatusModal = (pkg: PackageListItem) => {
  setSelectedPackageForStatus(pkg);
  setStatusModalOpen(true);
};

const handleStatusUpdateSuccess = () => {
  fetchPackages(); // Refresh the package list
};

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

  const handleFilterChange = (field: keyof PackageListRequest, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    if (field === 'regionId' && value > 0) {
      fetchCountries(value);
      setFilters((prev) => ({ ...prev, countryIds: '' }));
    }
  };

  const handleQuickSearch = (searchTerm: string) => {
    handleFilterChange('packageName', searchTerm);
    if (searchTerm) {
      const filtered = packages.filter(
        (pkg) =>
          pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.packageCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPackages(filtered);
    } else {
      setFilteredPackages(packages);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, pkg: PackageListItem) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPackage(pkg);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPackage(null);
  };


  const handleEdit = () => {
    if (selectedPackage) {
      navigate(`/package/edit/${selectedPackage.packageId}`);
    }
    handleMenuClose();
  };

  return (
    <Box className={styles.pageContainer}>
      {/* Professional Header */}
      <Box className={styles.headerSection}>
        <Box className={styles.headerMain}>
          <Box className={styles.titleArea}>
            <Typography variant="h5" className={styles.mainTitle}>
              Packages
            </Typography>
            <Chip label={`${filteredPackages.length} total`} size="small" className={styles.countChip} />
          </Box>
          <Box className={styles.headerActions}>
            <TextField
              size="small"
              placeholder="Search packages..."
              value={filters.packageName}
              onChange={(e) => handleQuickSearch(e.target.value)}
              className={styles.searchInput}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              size="small"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              className={styles.filterBtn}
            >
              Filters
            </Button>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
              className={styles.viewToggle}
            >
              <ToggleButton value="card">
                <Tooltip title="Card View">
                  <CardViewIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="list">
                <Tooltip title="List View">
                  <ListViewIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/package/create-package-wizard')}
              size="small"
              className={styles.createButton}
            >
              Create Package
            </Button>
          </Box>
        </Box>

        {/* Compact Filters */}
        <Collapse in={showFilters}>
          <Box className={styles.filterSection}>
            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={filters.regionId || 0}
                    onChange={(e) => handleFilterChange('regionId', Number(e.target.value))}
                    label="Region"
                  >
                    <MenuItem value={0}>All Regions</MenuItem>
                    {regions.map((r) => (
                      <MenuItem key={r.regionId} value={r.regionId}>
                        {r.regionName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!filters.regionId}>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={filters.countryIds || ''}
                    onChange={(e) => handleFilterChange('countryIds', e.target.value)}
                    label="Country"
                  >
                    <MenuItem value="">All Countries</MenuItem>
                    {countries.map((c) => (
                      <MenuItem key={c.countryCode} value={c.countryCode}>
                        {c.countryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.holidayCategoryCode || ''}
                    onChange={(e) => handleFilterChange('holidayCategoryCode', e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {holidayCategories.map((c) => (
                      <MenuItem key={c.categoryCode} value={c.categoryCode}>
                        {c.categoryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={1.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="1">Active</MenuItem>
                    <MenuItem value="0">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={1.75}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="From"
                  value={filters.validityFrom}
                  onChange={(e) => handleFilterChange('validityFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={1.75}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="To"
                  value={filters.validityTo}
                  onChange={(e) => handleFilterChange('validityTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={1}>
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="Search">
                    <IconButton size="small" onClick={handleSearch} color="primary">
                      <SearchIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset">
                    <IconButton size="small" onClick={handleReset}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Box>

      {/* Content */}
      <Box className={styles.content}>
        {isLoading ? (
          <Alert severity="info">Loading packages...</Alert>
        ) : filteredPackages.length === 0 ? (
          <Alert severity="warning">No packages found. Try adjusting your filters.</Alert>
        ) : viewMode === 'card' ? (
          <Grid container spacing={2}>
            {filteredPackages.map((pkg) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={pkg.packageId}>
                <Card className={styles.card}>
                  {/* Compact Header with 3-dot menu */}
                  <Box className={styles.cardHeader}>
                    <Box className={styles.cardHeaderContent}>
                      <Box className={styles.iconWrapper}>
                        <PlaceIcon />
                      </Box>
                      <Box className={styles.cardTitleSection}>
                        <Typography variant="subtitle2" className={styles.cardTitle} noWrap>
                          {pkg.packageName}
                        </Typography>
                        <Typography variant="caption" className={styles.cardCode}>
                          {pkg.packageCode}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        className={styles.menuButton}
                        onClick={(e) => handleMenuOpen(e, pkg)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Compact Card Body */}
                  <CardContent className={styles.cardContent}>
                    <Stack spacing={0.75}>
                      <Box className={styles.compactRow}>
                        <Typography variant="caption" className={styles.compactLabel}>
                          Type
                        </Typography>
                        <Typography variant="caption" fontWeight={600} className={styles.compactValue}>
                          {pkg.holidayType}
                        </Typography>
                      </Box>

                      <Box className={styles.compactRow}>
                        <Typography variant="caption" className={styles.compactLabel}>
                          Duration
                        </Typography>
                        <Typography variant="caption" fontWeight={600} className={styles.compactValue}>
                          {pkg.days} Days
                        </Typography>
                      </Box>

                      <Box className={styles.chipsRow}>
                        <Chip
                          label={pkg.priceStatus}
                          size="small"
                          className={pkg.priceStatus === 'Complete' ? styles.chipSuccess : styles.chipWarning}
                        />
                        <Chip
                          label={pkg.status}
                          size="small"
                          className={pkg.status === 'Active' ? styles.chipActive : styles.chipInactive}
                        />
                      </Box>

                      <Box className={styles.compactDateSection}>
                        <CalendarIcon fontSize="small" className={styles.calendarIcon} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" fontSize="0.7rem">
                            Validity Period
                          </Typography>
                          <Typography variant="caption" fontWeight={500} fontSize="0.7rem">
                            {pkg.validityFrom} - {pkg.validityTo}
                          </Typography>
                        </Box>
                      </Box>

                      {(pkg.deals || pkg.recommended || pkg.freeSell) && (
                        <Box className={styles.compactFeatureTags}>
                          {pkg.freeSell && (
                            <Box className={styles.compactFeatureTag}>
                              <FreeSellIcon fontSize="small" />
                              <Typography variant="caption">Free Sell</Typography>
                            </Box>
                          )}
                          {pkg.deals && (
                            <Box className={styles.compactFeatureTag}>
                              <DealIcon fontSize="small" />
                              <Typography variant="caption">Deals</Typography>
                            </Box>
                          )}
                          {pkg.recommended && (
                            <Box className={styles.compactFeatureTag}>
                              <RecommendedIcon fontSize="small" />
                              <Typography variant="caption">Top Pick</Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer component={Paper} className={styles.tableWrapper}>
            <Table size="small">
              <TableHead>
                <TableRow className={styles.tableHeader}>
                  <TableCell className={styles.tableHeaderCell}>Code</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Package Name</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Type</TableCell>
                  <TableCell className={styles.tableHeaderCell} align="center">
                    Days
                  </TableCell>
                  <TableCell className={styles.tableHeaderCell}>Validity</TableCell>
                  <TableCell className={styles.tableHeaderCell}>Price</TableCell>
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
                      <Typography variant="body2" className={styles.codeCell}>
                        {pkg.packageCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {pkg.packageName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className={styles.typeCell}>
                        {pkg.holidayType}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {pkg.days}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block" className={styles.dateText}>
                        {pkg.validityFrom}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {pkg.validityTo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pkg.priceStatus}
                        size="small"
                        className={pkg.priceStatus === 'Complete' ? styles.chipSuccess : styles.chipWarning}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pkg.status}
                        size="small"
                        className={pkg.status === 'Active' ? styles.chipActive : styles.chipInactive}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {pkg.deals && (
                          <Tooltip title="Deals">
                            <DealIcon fontSize="small" className={styles.featureIconDeal} />
                          </Tooltip>
                        )}
                        {pkg.recommended && (
                          <Tooltip title="Recommended">
                            <RecommendedIcon fontSize="small" className={styles.featureIconStar} />
                          </Tooltip>
                        )}
                        {pkg.freeSell && (
                          <Tooltip title="Free Sell">
                            <FreeSellIcon fontSize="small" className={styles.featureIconCart} />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                       <Tooltip title="Manage Status & Features">
      <IconButton
        size="small"
        className={styles.actionIcon}
        onClick={() => handleOpenStatusModal(pkg)}
      >
        <SettingsIcon fontSize="small" />
      </IconButton>
    </Tooltip>
                        <IconButton
                          size="small"
                          className={styles.actionIcon}
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

        <PackageStatusModal
  open={statusModalOpen}
  onClose={() => setStatusModalOpen(false)}
  package={selectedPackageForStatus}
  onSuccess={handleStatusUpdateSuccess}
/>
      </Box>

      {/* 3-Dot Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
         <MenuItemMui onClick={() => {
    if (selectedPackage) {
      handleOpenStatusModal(selectedPackage);
    }
    handleMenuClose();
  }}>
    <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
    Manage Status
  </MenuItemMui>
        <MenuItemMui onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Package
        </MenuItemMui>
      </Menu>
    </Box>
  );
};

export default PackageList;