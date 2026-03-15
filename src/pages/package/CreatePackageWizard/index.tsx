import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, Paper, Button, Typography } from '@mui/material';
import { CircularProgress } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import StepPackageDetail from './steps/StepPackageDetail';
import Step4UploadImages from './steps/Step4UploadImages';
import Step5ItineraryManage from './steps/Step5ItineraryManage';
import Step6DestinationDetails from './steps/Step6DestinationDetails';
import Step7HotelMapping from './steps/Step7HotelMapping';
import Step8PackageCosting from './steps/Step8PackageCosting';
import Step9CancellationRules from './steps/Step9CancellationRules';
import { packageService } from '@/services/package/package.service';
import {
  DEFAULT_FORM_DATA,
  type PackageFormData,
  type HolidayCategory,
  type HolidayType,
  type Language,
  type Market,
  type PackageSupplier,
} from '@/services/package/package.models';
import {
  step1Schema, step2Schema, step3Schema, atLeastOneDay,
  step4Schema, step5Schema, step6Schema, step7Schema, step8Schema, step9Schema,
} from './schemas/validationSchemas';
import styles from './CreatePackageWizard.module.css';

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = [
  'Package Detail',     // Steps 1+2+3 merged into StepPackageDetail
  'Upload Images',
  'Itinerary',
  'Destination',
  'Hotel Mapping',
  'Package Costing',
  'Cancellation Rules',
];

const DEFAULT_COMPONENTS = [
  { id: 1, name: 'Hotel' },
  { id: 2, name: 'Meals' },
  { id: 3, name: 'Tour Guide' },
  { id: 4, name: 'Transport' },
  { id: 5, name: 'Sightseeing' },
];

interface DropdownState {
  regions: any[];
  countries: any[];
  holidayCategories: HolidayCategory[];
  holidayTypes: HolidayType[];
  languages: Language[];
  markets: Market[];
  cities: any[];
  suppliers: PackageSupplier[];
  packageComponents: { id: number; name: string }[];
  factsTypes: any[];
}

// ── Component ─────────────────────────────────────────────────────────────────

const CreatePackageWizard: React.FC = () => {
  const navigate = useNavigate();
  const { id: routePackageId } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState(0);
  // Track validity and dirty state for Package Detail tab
  const [packageDetailValid, setPackageDetailValid] = useState(false);
  const [packageDetailDirty, setPackageDetailDirty] = useState(false);
  const [destinationDetailValid, setDestinationDetailValid] = useState(false);
  const [hotelMappingValid, setHotelMappingValid] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);
  const [editReady, setEditReady] = useState(!routePackageId);
  const [packageId, setPackageId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(!!routePackageId);
  const [formData, setFormData] = useState<PackageFormData>(DEFAULT_FORM_DATA);

  const [dropdowns, setDropdowns] = useState<DropdownState>({
    regions: [],
    countries: [],
    holidayCategories: [],
    holidayTypes: [],
    languages: [],
    markets: [],
    cities: [],
    suppliers: [],
    packageComponents: DEFAULT_COMPONENTS,
    factsTypes: [],
  });

  // ── 1. Bootstrap ──────────────────────────────────────────────────────────

  useEffect(() => {
    setDropdownsLoading(true);
    Promise.all([
      packageService.getRegionList(),
      packageService.getHolidayCategoryList(),
      packageService.getLanguageList(),
      packageService.getMarketList(),
      packageService.getCitiesList(),
      packageService.PackageSuppliersList(),
      packageService.getFactsTypeList(),
    ])
      .then(async ([regions, holidayCategories, languages, markets, cities, suppliers, factsTypes]) => {
        setDropdowns((p) => ({ ...p, regions, holidayCategories, languages, markets, cities, suppliers, factsTypes }));

        if (routePackageId) {
          setIsLoading(true);
          try {
            const data = await packageService.getPackageById(Number(routePackageId));
            const [countries, holidayTypes] = await Promise.all([
              data.regionId ? packageService.getCountryByRegion(data.regionId) : Promise.resolve([]),
              data.categoryId ? packageService.getHolidayTypeList(data.categoryId) : Promise.resolve([]),
            ]);
            setDropdowns((p) => ({ ...p, countries, holidayTypes }));
            setFormData(data);
            setPackageId(Number(routePackageId));
            setEditReady(true);
          } catch {
            toast.error('Failed to load package data');
          } finally {
            setIsLoading(false);
          }
        }
      })
      .catch(() => toast.error('Failed to load dropdown data'))
      .finally(() => setDropdownsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Cascade: countries on region change (create mode only) ─────────────

  useEffect(() => {
    if (!formData.regionId || isEditMode) return;
    packageService.getCountryByRegion(formData.regionId)
      .then((countries) => setDropdowns((p) => ({ ...p, countries })))
      .catch(() => setDropdowns((p) => ({ ...p, countries: [] })));
  }, [formData.regionId, isEditMode]);

  // ── 3. Cascade: holiday types on category change (create mode only) ───────

  useEffect(() => {
    if (!formData.categoryId || isEditMode) return;
    packageService.getHolidayTypeList(formData.categoryId)
      .then((holidayTypes) => setDropdowns((p) => ({ ...p, holidayTypes })))
      .catch(() => setDropdowns((p) => ({ ...p, holidayTypes: [] })));
  }, [formData.categoryId, isEditMode]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const updateFormData = (data: Partial<PackageFormData>) =>
    setFormData((prev) => ({ ...prev, ...data }));

  // ── Validation — exact field names, no aliasing ───────────────────────────

  const validateCurrentTab = (): boolean => {
    try {
      switch (activeTab) {
        case 0:
          step1Schema.parse({ regionId: formData.regionId, countryIds: formData.countryIds });
          step2Schema.parse({
            categoryId: formData.categoryId, holidayType: formData.holidayType,
            packageName: formData.packageName, packageCode: formData.packageCode,
            departCityList: formData.departCityList, componentType: formData.componentType,
            cityId: formData.cityId, languageCode: formData.languageCode,
            supplierId: formData.supplierId, remarks: formData.remarks, status: formData.status,
          });
          step3Schema.parse({
            tourType: formData.tourType, marketType: formData.marketType, days: formData.days,
            validityFrom: formData.validityFrom, validityTo: formData.validityTo,
            bookingFrom: formData.bookingFrom, bookingTo: formData.bookingTo,
            sunday: formData.sunday, monday: formData.monday, tuesday: formData.tuesday,
            wednesday: formData.wednesday, thursday: formData.thursday,
            friday: formData.friday, saturday: formData.saturday,
            bookingType: formData.bookingType, ranking: formData.ranking,
            recommended: formData.recommended, deals: formData.deals, freesell: formData.freesell,
            shortDesc: formData.shortDesc, longDesc: formData.longDesc,
          });
          if (!atLeastOneDay(formData)) {
            toast.error('At least one valid day is required', { position: 'top-right', autoClose: 3000 });
            return false;
          }
          break;
        case 1: step4Schema.parse({ imageAttribute: formData.imageAttribute, imageFor: formData.imageFor, imageTag: formData.imageTag }); break;
        case 2: step5Schema.parse({ itineraryDays: formData.itineraryDays, inclusions: formData.inclusions, exclusions: formData.exclusions }); break;
        case 3: step6Schema.parse({ destinations: formData.destinations }); break;
        case 4: step7Schema.parse({ hotels: formData.hotels }); break;
        case 5: step8Schema.parse({ costing: formData.costing }); break;
        case 6: step9Schema.parse({ cancellationRules: formData.cancellationRules }); break;
      }
      return true;
    } catch (err: any) {
      toast.error(
        err.errors?.length
          ? err.errors.map((e: any) => e.message).join(', ')
          : 'Please fill all required fields correctly',
        { position: 'top-right', autoClose: 3000 },
      );
      return false;
    }
  };

  // ── Submit — savePackage receives formData directly, zero mapping ──────────

  const handleCreatePackage = async () => {
    if (!validateCurrentTab()) return;
    setIsLoading(true);
    try {
      const res = await packageService.savePackage(formData, 0);
      const newId = res.referenceId;
      setPackageId(newId);
      setIsEditMode(true);
      toast.success('Package created successfully!', { position: 'top-right', autoClose: 3000 });
      if (newId) navigate(`/package/edit/${newId}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create package', { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!validateCurrentTab()) return;
    setIsLoading(true);
    try {
      await packageService.savePackage(formData, packageId ?? 0);
      toast.success('Package saved successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save package', { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Tab renderer ──────────────────────────────────────────────────────────

  const renderTabContent = () => {
    if (!editReady || isLoading || dropdownsLoading) {
      return null;
    }

    const common = { formData, updateFormData };
    switch (activeTab) {
      case 0: return (
        <StepPackageDetail
          {...common}
          isEditMode={isEditMode}
          loading={dropdownsLoading}
          regions={dropdowns.regions}
          countries={dropdowns.countries}
          holidayCategories={dropdowns.holidayCategories}
          holidayTypes={dropdowns.holidayTypes}
          languages={dropdowns.languages}
          markets={dropdowns.markets}
          cities={dropdowns.cities}
          suppliers={dropdowns.suppliers}
          packageComponents={dropdowns.packageComponents}
          onValidationChange={setPackageDetailValid}
          onDirtyChange={setPackageDetailDirty}
        />
      );
      case 1: return <Step4UploadImages packageId={packageId || 0} {...common} />;
      case 2: return <Step5ItineraryManage packageId={packageId || 0} {...common} />;
      case 3: return (
        <Step6DestinationDetails
          formData={formData}
          updateFormData={updateFormData}
          packageId={packageId || 0}
          isEditMode={isEditMode}
          loading={dropdownsLoading}
          countries={dropdowns.countries}
          cities={dropdowns.cities}
          factsTypes={dropdowns.factsTypes}
          onValidationChange={setDestinationDetailValid}
        />
      );
      case 4: return <Step7HotelMapping
            formData={formData}
            updateFormData={updateFormData}
            packageId={packageId || 0}
            isEditMode={isEditMode}
            loading={dropdownsLoading}
            cities={dropdowns.cities}
            onValidationChange={setHotelMappingValid}
          />;
      case 5: return <Step8PackageCosting {...common} />;
      case 6: return <Step9CancellationRules {...common} />;
      default: return null;
    }
  };

  const isCreateTab = !isEditMode && activeTab === 0 && !packageId;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box className={styles.container}>
      <Paper className={styles.paper} elevation={0}>
        <Box className={styles.header}>
          <Typography className={styles.title} variant="h5">
            {isEditMode ? 'Update Package' : 'Create New Package'}
          </Typography>
          {activeTab === 0 && (
            <Box className={styles.actions}>
              <Button
                variant="contained"
                onClick={isCreateTab ? handleCreatePackage : handleSaveChanges}
                disabled={
                  isLoading || !editReady || !packageDetailValid || !packageDetailDirty
                }
                size="large"
                startIcon={<CheckCircle />}
                sx={{ minWidth: 160, borderRadius: 2, fontWeight: 600 }}
              >
                {isCreateTab
                  ? (isLoading ? 'Creating...' : 'Create Package')
                  : (isLoading ? 'Saving...' : 'Save Changes')}
              </Button>
            </Box>
          )}
        </Box>

        <Box className={styles.tabsRow}>
          {TABS.map((label, i) => {
            const disabled = !isEditMode && !packageId && i > 0;
            const active = activeTab === i;
            return (
              <Button key={label}
                onClick={() => { if (!disabled) setActiveTab(i); }}
                disabled={disabled}
                disableRipple={disabled}
                sx={{
                  fontWeight: active ? 700 : 400,
                  color: active ? '#1976d2' : '#6b7280',
                  borderBottom: active ? '2px solid #1976d2' : '2px solid transparent',
                  borderRadius: 0, minWidth: 'max-content', px: 2, py: 1.25, fontSize: 14,
                  opacity: disabled ? 0.45 : 1, transition: 'all 0.15s ease',
                  '&:hover:not(:disabled)': { color: '#1976d2', background: 'rgba(25,118,210,0.04)' },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>

        {(isLoading || dropdownsLoading) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        <Box className={styles.scrollBody}>
          <ToastContainer position="top-right" autoClose={3000} newestOnTop
            closeOnClick pauseOnFocusLoss draggable pauseOnHover />
          <Box className={styles.stepContent}>
            {renderTabContent()}
          </Box>
        </Box>

      </Paper>
    </Box>
  );
};

export default CreatePackageWizard;