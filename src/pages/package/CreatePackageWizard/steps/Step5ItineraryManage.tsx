import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Divider,
  Alert,
  Paper,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { packageService } from '@/services/package/package.service';
import BatchImageUploader, { ImageRow } from '@/components/common/BatchImageUploader/BatchImageUploader';
import RichTextEditor from '@/components/common/RichTextEditor/RichTextEditor';
import FormModal from '@/components/common/FormModal/FormModal';

// Define types inline
export interface PackageItinerary {
  packageItineraryId: number;
  day: number;
  title: string;
  description: string;
  images: PackageImage[];
  days?: any;
  cityId?: string | number;
  briefDesc?: string;
  isActive?: boolean;
  cityName?: string;
  currentStatus?: string;
  imageId?: number;
  thumbnail?: string;
  imageTag?: string;
  bigImage?: string;
}

interface PackageImage {
  imageId?: number;
  url?: string;
  thumbnail?: string;
  imageTag?: string;
  bigImage?: string;
  isActive?: boolean;
}

export interface PackageTab {
  tabId: number;
  tabName: string;
}

export interface PackageInclusion {
  id: number;
  inclusionId?: number;
  description: string;
  sequenceNo?: number;
  specType?: number;
  status?: boolean;
  tabName?: string;
}

export interface HolidayType {
  holidayTypeID: number;
  holidayTypeCode: string;
  name?: string;
  description?: string;
}

// Update Step5Props definition:
interface Step5Props {
  packageId: number;
  formData: any;
  onValidationChange?: (isValid: boolean) => void;
}

// ── Schemas ───────────────────────────────────────────────────────────────

const itineraryDaySchema = z.object({
  days: z.number().min(1, 'Day must be at least 1'),
  cityId: z.string().min(1, 'City is required'),
  briefDesc: z.string().min(5, 'Brief description must be at least 5 characters'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

const inclusionSchema = z.object({
  description: z.string().min(5, 'Description must be at least 5 characters'),
  specType: z.string().optional(),
  sequenceNo: z.number().min(0, 'Sequence must be 0 or greater'),
  isActive: z.boolean(),
});

type ItineraryDayFormData = z.infer<typeof itineraryDaySchema>;
type InclusionFormData = z.infer<typeof inclusionSchema>;

// ── Component ─────────────────────────────────────────────────────────────

const Step5ItineraryManage: React.FC<Step5Props> = ({
  packageId,
  formData,
  onValidationChange,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Modal states
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [inclusionModalOpen, setInclusionModalOpen] = useState(false);
  // Batch uploader modal state for itinerary images
  const [batchUploaderOpen, setBatchUploaderOpen] = useState(false);
  const [batchUploaderKey, setBatchUploaderKey] = useState(0);
  // Editing states
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [editingInclusionId, setEditingInclusionId] = useState<number | null>(null);
  // Data states
  const [itineraries, setItineraries] = useState<PackageItinerary[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [packageTabs, setPackageTabs] = useState<PackageTab[]>([]);
  const [inclusions, setInclusions] = useState<PackageInclusion[]>([]);
  const [holidayTypeList, setHolidayTypeList] = useState<HolidayType[]>([]);
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  // Batch uploader states
  const [selectedItinerary, setSelectedItinerary] = useState<PackageItinerary | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [editingImage, setEditingImage] = useState<any | null>(null);

  // ── Forms ─────────────────────────────────────────────────────────────
  const {
    control: dayControl,
    handleSubmit: handleDaySubmit,
    reset: resetDayForm,
    watch: watchDay,
    formState: { errors: dayErrors },
  } = useForm<ItineraryDayFormData>({
    resolver: zodResolver(itineraryDaySchema),
    defaultValues: {
      days: 1,
      cityId: '',
      briefDesc: '',
      description: '',
      isActive: true,
    },
  });

  // Watch itinerary description for form control
  const itineraryDescription = watchDay('description');

  const {
    control: inclusionControl,
    handleSubmit: handleInclusionSubmit,
    reset: resetInclusionForm,
    setValue: setInclusionValue,
    watch: watchInclusion,
    formState: { errors: inclusionErrors },
  } = useForm<InclusionFormData>({
    resolver: zodResolver(inclusionSchema),
    defaultValues: {
      description: '',
      specType: '',
      sequenceNo: 1,
      isActive: true,
    },
  });

  // Watch inclusion description for form control
  const inclusionDescription = watchInclusion('description');

  // ── Load data ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!packageId) return;
    loadAllData();
  }, [packageId]);

  useEffect(() => {
    const isValid = itineraries.length > 0;
    onValidationChange?.(isValid);
  }, [itineraries, onValidationChange]);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-calculate sequence number for new inclusions
  useEffect(() => {
    if (!editingInclusionId && inclusions.length > 0) {
      const maxSeq = Math.max(...inclusions.map(inc => inc.sequenceNo ?? 0));
      setInclusionValue('sequenceNo', maxSeq + 1);
    }
  }, [inclusions, editingInclusionId, setInclusionValue]);

  const getHolidayTypeCodes = async (
    holidayTypeIds: number[] | string
  ): Promise<string> => {
    try {
      if (typeof holidayTypeIds === 'string' && holidayTypeIds.includes(',')) {
        return holidayTypeIds;
      }

      const idsArray = Array.isArray(holidayTypeIds)
        ? holidayTypeIds
        : [holidayTypeIds];

      if (idsArray.length === 0) {
        return '';
      }

      let holidayTypes = holidayTypeList;
      if (holidayTypes.length === 0) {
        const categoryCode = formData.categoryId || '';
        const response = await packageService.getHolidayTypeList(categoryCode);
        holidayTypes = response || [];
        setHolidayTypeList(holidayTypes);
      }

      const codes = idsArray
        .map(id => {
          const holidayType = holidayTypes.find(
            ht => ht.holidayTypeID === Number(id)
          );
          return holidayType ? holidayType.holidayTypeCode : null;
        })
        .filter(code => code !== null);

      return codes.join(',');
    } catch (err) {
      console.error('Error mapping holiday type codes:', err);
      return '';
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const holidayTypeCodes = await getHolidayTypeCodes(formData.holidayType);

      const [
        itinerariesData,
        citiesData,
        packageTabsData,
        inclusionsData,
      ] = await Promise.all([
        packageService.getPackageItineraries(packageId, 'SMT'),
        packageService.getCitiesList(),
        packageService.getPackageTabList(holidayTypeCodes, 'SMT'),
        packageService.getPackageInclusions(packageId, 'SMT'),
      ]);

      setPackageTabs(packageTabsData.data || []);
      setInclusions(inclusionsData.data || []);
      setItineraries(itinerariesData.data || []);
      setCities(
        citiesData.map((city: any) => ({
          id: city.cityId || city.cityCode,
          name: city.cityName || city.cName,
        }))
      );
    } catch (err: any) {
      console.error('Load data error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Itinerary Day Handlers ────────────────────────────────────────────

  const openDayModal = (itinerary?: PackageItinerary) => {
    if (itinerary) {
      setEditingDayId(itinerary.packageItineraryId);
      resetDayForm({
        days: itinerary.days,
        cityId: String(itinerary.cityId ?? ''),
        briefDesc: itinerary.briefDesc,
        description: itinerary.description || '',
        isActive: itinerary.isActive,
      });
    } else {
      setEditingDayId(null);
      resetDayForm({
        days: itineraries.length + 1,
        cityId: '',
        briefDesc: '',
        description: '',
        isActive: true,
      });
    }
    setDayModalOpen(true);
  };

  const closeDayModal = () => {
    setDayModalOpen(false);
    setEditingDayId(null);
    resetDayForm({
      days: 1,
      cityId: '',
      briefDesc: '',
      description: '',
      isActive: true,
    });
  };

  const onSubmitDay = async (data: ItineraryDayFormData) => {
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        packageItineraryId: editingDayId || 0,
        packageId: packageId,
        days: data.days,
        cityCode: data.cityId,
        userId: 2,
        briefDescription: data.briefDesc,
        description: data.description || '',
        status: data.isActive ? 1 : 0,
      };

      const response = await packageService.createPackageItinerary(payload);

      if (response.status.success) {
        setSuccess(
          editingDayId
            ? 'Day updated successfully!'
            : 'Day added successfully!'
        );
        await loadAllData();
        closeDayModal();
      } else {
        setError(response.status.message || 'Failed to save day');
      }
    } catch (err: any) {
      console.error('Submit itinerary error:', err);
      setError(err.message || 'Failed to save itinerary');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDay = async (id: number) => {
    if (!confirm('Are you sure you want to delete this day?')) return;

    setIsSaving(true);
    try {
      const response = await packageService.deletePackageItinerary(id);
      if (response.status.success || response.status === true) {
        setSuccess('Day deleted successfully!');
        await loadAllData();
      } else {
        setError(response.status?.message || 'Failed to delete day');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete day');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Batch Image Uploader for Itinerary Images ─────────────────────────
  const openImageGallery = (itinerary: PackageItinerary, imageToEdit: any = null) => {
    setSelectedItinerary(itinerary);
    setEditingImage(imageToEdit);
    setBatchUploaderKey(prev => prev + 1);
    setBatchUploaderOpen(true);
  };

  const handleBatchUpload = async (row: ImageRow) => {
    if (!selectedItinerary)
      throw new Error('No itinerary selected');

    // Only allow upload if both images are present (file or preview)
    const hasThumbnail = row.thumbnailFile || row.thumbnailPreview;
    const hasLarge = row.largeFile || row.largePreview;

    if (!hasThumbnail || !hasLarge) {
      throw new Error('Both images are required');
    }

    // Convert files to base64 or use previews
    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
      });
    };

    let thumbnailBase64 = '';
    let largeBase64 = '';

    // In edit mode, if user does not change the image, keep as null
    if (row.thumbnailFile) {
      thumbnailBase64 = await fileToBase64(row.thumbnailFile);
    }

    if (row.largeFile) {
      largeBase64 = await fileToBase64(row.largeFile);
    }

    // Build payload for itinerary image upload
    const payload = {
      imageId: editingImage?.imageId || 0,
      packageItineraryId: selectedItinerary.packageItineraryId,
      userId: 2,
      thumbnailImage: thumbnailBase64,
      bigImage: largeBase64,
      imageTag: row.tag,
      status: row.status === 'Active',
      companyCode: 'SMT',
    };

    await packageService.uploadItineraryImage(payload);
  };

  const handleBatchComplete = async (rows: ImageRow[]) => {
    setUploadingImages(true);
    try {
      await loadAllData();
      setSuccess(`Successfully uploaded ${rows.length} image(s)!`);
      setBatchUploaderOpen(false);
      setEditingImage(null);
      setSelectedItinerary(null);
    } catch (err) {
      setError('Some images failed to upload. Please check and try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await packageService.deleteItineraryImage(imageId);
      if (response.status.success || response.status === true) {
        setSuccess('Image deleted successfully!');
        await loadAllData();
      } else {
        setError(response.status?.message || 'Failed to delete image');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    }
  };

  // ── Inclusions ────────────────────────────────────────────────────────

  const openInclusionModal = (inclusion?: PackageInclusion) => {
    if (inclusion) {
      setEditingInclusionId(inclusion.inclusionId ?? null);
      resetInclusionForm({
        description: inclusion.description,
        specType: String(inclusion.specType || ''),
        sequenceNo: inclusion.sequenceNo ?? 1,
        isActive: inclusion.status ?? true,
      });
    } else {
      setEditingInclusionId(null);
      const nextSeq =
        inclusions.length > 0
          ? Math.max(...inclusions.map(inc => inc.sequenceNo ?? 0)) + 1
          : 1;
      resetInclusionForm({
        description: '',
        specType: '',
        sequenceNo: nextSeq,
        isActive: true,
      });
    }
    setInclusionModalOpen(true);
  };

  const closeInclusionModal = () => {
    setInclusionModalOpen(false);
    setEditingInclusionId(null);
    resetInclusionForm({
      description: '',
      specType: '',
      sequenceNo: 1,
      isActive: true,
    });
  };

  const onSubmitInclusion = async (data: InclusionFormData) => {
    setIsSaving(true);
    setError(null);

    try {
      // Validate that description is not empty
      if (!data.description || data.description.trim().length === 0) {
        setError('Description is required');
        setIsSaving(false);
        return;
      }

      const payload = {
        packageInclusionId: editingInclusionId || 0,
        packageId,
        specType: data.specType ? parseInt(data.specType, 10) : 0,
        userId: 2,
        description: data.description,
        sequenceNo: data.sequenceNo,
        status: data.isActive ? 1 : 0,
      };

      const response = await packageService.createPackageInclusion(payload);

      if (response.status.success) {
        setSuccess(
          editingInclusionId ? 'Inclusion updated!' : 'Inclusion added!'
        );
        await loadAllData();
        closeInclusionModal();
      } else {
        setError(response.status.message || 'Failed to save inclusion');
      }
    } catch (err: any) {
      console.error('Submit inclusion error:', err);
      setError(err.message || 'Failed to save inclusion');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInclusion = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inclusion?')) return;

    try {
      const response = await packageService.deleteInclusion(id);
      if (response.status.success || response.status === true) {
        setSuccess('Inclusion deleted successfully!');
        await loadAllData();
      } else {
        setError(response.status?.message || 'Failed to delete inclusion');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete inclusion');
    }
  };

  // ── Helper Functions ──────────────────────────────────────────────────

  const compactFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: '#fff',
    },
  };

  // ── Render ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 3 }}
        >
          <Tab label="Itinerary Days" />
          <Tab label="Inclusions" />
        </Tabs>

        {/* Tab 0: Itinerary Days Grid */}
        {activeTab === 0 && (
          <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#1e293b' }}
                >
                  Itinerary Days ({itineraries.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openDayModal()}
                  disabled={!packageId}
                  sx={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, #5568d3 0%, #5a3a7d 100%)',
                    },
                  }}
                >
                  Add Day
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {itineraries.length === 0 ? (
                <Alert severity="info">
                  No days added yet. Click "Add Day" to begin.
                </Alert>
              ) : (
                itineraries.map((itinerary: PackageItinerary) => (
                  <Accordion
                    key={itinerary.packageItineraryId}
                    expanded={
                      expandedDay === itinerary.packageItineraryId
                    }
                    onChange={() =>
                      setExpandedDay(
                        expandedDay === itinerary.packageItineraryId
                          ? null
                          : itinerary.packageItineraryId
                      )
                    }
                    sx={{ mb: 1, '&:before': { display: 'none' } }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          width: '100%',
                        }}
                      >
                        <Chip
                          label={`Day ${itinerary.days}`}
                          color="primary"
                          size="small"
                        />
                        <Typography sx={{ fontWeight: 600 }}>
                          {itinerary.cityName}
                        </Typography>
                        <Typography
                          sx={{ color: '#64748b', flex: 1 }}
                          noWrap
                        >
                          {itinerary.briefDesc}
                        </Typography>
                        <Chip
                          label={itinerary.currentStatus}
                          size="small"
                          color={itinerary.isActive ? 'success' : 'default'}
                        />
                        <Box onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openDayModal(itinerary)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeleteDay(
                                itinerary.packageItineraryId
                              )
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Box
                        sx={{
                          color: '#64748b',
                          mb: 2,
                          '& p': { margin: '0.5em 0' },
                          '& ul, & ol': { paddingLeft: '1.5em' },
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            itinerary.description || 'No description',
                        }}
                      />

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          <ImageIcon
                            fontSize="small"
                            sx={{ mr: 0.5, verticalAlign: 'middle' }}
                          />
                          Gallery ({itinerary.images?.length || 0})
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => openImageGallery(itinerary)}
                        >
                          Add Images
                        </Button>
                      </Box>

                      {itinerary.images?.length > 0 && (
                        <TableContainer
                          component={Paper}
                          variant="outlined"
                          sx={{ borderRadius: 2, mt: 1 }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  #
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Thumbnail
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Large Image
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Tag
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Status
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Actions
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {itinerary.images.map(
                                (img: PackageImage, idx: number) => (
                                  <TableRow
                                    key={img.imageId}
                                    hover
                                  >
                                    <TableCell
                                      sx={{
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                      }}
                                    >
                                      {idx + 1}
                                    </TableCell>
                                    <TableCell>
                                      <img
                                        src={img.thumbnail || ''}
                                        alt={img.imageTag}
                                        style={{
                                          width: 52,
                                          height: 38,
                                          objectFit: 'cover',
                                          borderRadius: 4,
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <img
                                        src={img.bigImage || ''}
                                        alt={img.imageTag}
                                        style={{
                                          width: 52,
                                          height: 38,
                                          objectFit: 'cover',
                                          borderRadius: 4,
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell
                                      sx={{ fontSize: '0.8125rem' }}
                                    >
                                      {img.imageTag || '—'}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={
                                          img.isActive
                                            ? 'Active'
                                            : 'Inactive'
                                        }
                                        size="small"
                                        color={
                                          img.isActive
                                            ? 'success'
                                            : 'default'
                                        }
                                        sx={{ fontSize: '0.75rem' }}
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() =>
                                          openImageGallery(
                                            itinerary,
                                            img
                                          )
                                        }
                                        sx={{ mr: 0.5 }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() =>
                                          handleDeleteImage(
                                            img.imageId ?? 0
                                          )
                                        }
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 1: Inclusions Grid */}
        {activeTab === 1 && (
          <Card sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: '#d1fae5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleIcon
                      sx={{ color: '#10b981', fontSize: 28 }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#1e293b' }}
                    >
                      Inclusions
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#64748b' }}
                    >
                      What's included in the package price.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openInclusionModal()}
                  disabled={!packageId}
                  sx={{
                    bgcolor: '#10b981',
                    '&:hover': { bgcolor: '#059669' },
                  }}
                >
                  Add Inclusion
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {inclusions.length === 0 ? (
                <Alert severity="info">
                  No inclusions added yet.
                </Alert>
              ) : (
                <TableContainer
                  sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f9fafb' }}>
                        <TableCell sx={{ fontWeight: 700, width: '50%' }}>
                          Description
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Category
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Seq</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inclusions
                        .sort(
                          (a, b) =>
                            (a.sequenceNo ?? 0) - (b.sequenceNo ?? 0)
                        )
                        .map((inclusion) => (
                          <TableRow
                            key={inclusion.inclusionId}
                            hover
                          >
                            <TableCell>
                              <Box
                                sx={{
                                  '& p': { margin: '0.25em 0' },
                                  '& ul, & ol': { paddingLeft: '1em' },
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: inclusion.description,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {inclusion.tabName ? (
                                <Chip
                                  label={inclusion.tabName}
                                  size="small"
                                />
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={inclusion.sequenceNo}
                                size="small"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: inclusion.status
                                    ? '#10b981'
                                    : '#94a3b8',
                                  display: 'inline-block',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  openInclusionModal(inclusion)
                                }
                                sx={{
                                  color: '#64748b',
                                  mr: 0.5,
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDeleteInclusion(
                                    inclusion.inclusionId ?? 0
                                  )
                                }
                                sx={{ color: '#64748b' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Itinerary Day Modal */}
        <FormModal
          open={dayModalOpen}
          onClose={closeDayModal}
          onSubmit={handleDaySubmit(onSubmitDay)}
          title={
            editingDayId
              ? 'Edit Itinerary Day'
              : 'Add Itinerary Day'
          }
          subtitle="Enter day details and description"
          isSubmitting={isSaving}
          isEditing={!!editingDayId}
          icon={<CalendarIcon />}
          primaryColor="#667eea"
        >
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={3}>
              <Controller
                name="days"
                control={dayControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Day *"
                    type="number"
                    error={!!dayErrors.days}
                    helperText={dayErrors.days?.message}
                    inputProps={{ min: 1 }}
                    onChange={(e) =>
                      field.onChange(
                        parseInt(e.target.value, 10) || 1
                      )
                    }
                    sx={compactFieldSx}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <Controller
                name="cityId"
                control={dayControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="City *"
                    error={!!dayErrors.cityId}
                    helperText={dayErrors.cityId?.message}
                    sx={compactFieldSx}
                  >
                    <MenuItem value="">Select City</MenuItem>
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="isActive"
                control={dayControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Status"
                    value={field.value ? 'active' : 'inactive'}
                    onChange={(e) =>
                      field.onChange(e.target.value === 'active')
                    }
                    sx={compactFieldSx}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">
                      Inactive
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="briefDesc"
                control={dayControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Brief Description *"
                    error={!!dayErrors.briefDesc}
                    helperText={
                      dayErrors.briefDesc?.message
                    }
                    placeholder="e.g., Explore the city highlights"
                    sx={compactFieldSx}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={dayControl}
                render={({ field }) => (
                  <Box>
                    <RichTextEditor
                      label="Full Description"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add detailed description..."
                      toolbarVariant="basic"
                      minHeight={150}
                      showCharCount
                      maxLength={8000}
                    />
                  </Box>
                )}
              />
            </Grid>
          </Grid>
        </FormModal>

        {/* Inclusion Modal */}
        <FormModal
          open={inclusionModalOpen}
          onClose={closeInclusionModal}
          onSubmit={handleInclusionSubmit(onSubmitInclusion)}
          title={
            editingInclusionId
              ? 'Edit Inclusion'
              : 'Add Inclusion'
          }
          subtitle="What's included in the package"
          isSubmitting={isSaving}
          isEditing={!!editingInclusionId}
          icon={<CheckCircleIcon />}
          primaryColor="#10b981"
        >
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={inclusionControl}
                rules={{
                  required: 'Description is required',
                  minLength: {
                    value: 5,
                    message:
                      'Description must be at least 5 characters',
                  },
                  validate: (value) =>
                    !value || value.trim().length >= 5 ||
                    'Description cannot be empty',
                }}
                render={({ field }) => (
                  <Box>
                    <RichTextEditor
                      label="Description *"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="e.g., Daily Buffet Breakfast"
                      toolbarVariant="minimal"
                      minHeight={100}
                      showCharCount
                      maxLength={500}
                    />
                    {inclusionErrors.description && (
                      <Typography
                        color="error"
                        variant="caption"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {inclusionErrors.description.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="specType"
                control={inclusionControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Category"
                    sx={compactFieldSx}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {packageTabs.map((tab) => (
                      <MenuItem
                        key={tab.tabId}
                        value={String(tab.tabId)}
                      >
                        {tab.tabName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name="sequenceNo"
                control={inclusionControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Sequence"
                    type="number"
                    error={!!inclusionErrors.sequenceNo}
                    helperText={
                      inclusionErrors.sequenceNo?.message
                    }
                    inputProps={{ min: 0 }}
                    onChange={(e) =>
                      field.onChange(
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    sx={compactFieldSx}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name="isActive"
                control={inclusionControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Status"
                    value={field.value ? 'active' : 'inactive'}
                    onChange={(e) =>
                      field.onChange(e.target.value === 'active')
                    }
                    sx={compactFieldSx}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">
                      Inactive
                    </MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </FormModal>

        {/* Batch Image Uploader Modal for Itinerary Images */}
        <FormModal
          open={batchUploaderOpen}
          onClose={() => {
            setBatchUploaderOpen(false);
            setEditingImage(null);
          }}
          onSubmit={() => {}}
          title={`Upload Images - Day ${selectedItinerary?.days}`}
          subtitle={
            editingImage
              ? 'Edit image details'
              : 'Add images for this itinerary day'
          }
          isSubmitting={uploadingImages}
          icon={<ImageIcon />}
          primaryColor="#f59e0b"
          hideActions
          maxWidth="lg"
        >
          <BatchImageUploader
            key={batchUploaderKey}
            onUploadRow={handleBatchUpload}
            onUploadComplete={handleBatchComplete}
            tagSuggestions={[
              'gallery',
              'itinerary',
              'sight',
              'activity',
            ]}
            title=""
            subtitle=""
            initialRows={
              editingImage
                ? [
                    {
                      thumbnailFile: null,
                      largeFile: null,
                      tag: editingImage.imageTag || '',
                      status: editingImage.isActive
                        ? 'Active'
                        : 'Inactive',
                      thumbnailUrl:
                        editingImage.thumbnail || '',
                      largeImageUrl: editingImage.bigImage || '',
                    },
                  ]
                : undefined
            }
          />
        </FormModal>
      </Paper>
    </Box>
  );
};

export default Step5ItineraryManage;