import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  LinearProgress,
} from '@mui/material';
import { ArrowBack, ArrowForward, Save, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Step1SelectRegion from './steps/Step1SelectRegion';
import Step2PackageDetails from './steps/Step2PackageDetails';
import Step3PackageValidity from './steps/Step3PackageValidity';
import Step4UploadImages from './steps/Step4UploadImages';
import Step5ItineraryManage from './steps/Step5ItineraryManage';
import Step6DestinationDetails from './steps/Step6DestinationDetails';
import Step7HotelMapping from './steps/Step7HotelMapping';
import Step8PackageCosting from './steps/Step8PackageCosting';
import Step9CancellationRules from './steps/Step9CancellationRules';
import { packageService } from '@/services/package/package.service';
import type { CreatePackageRequest } from '@/services/package/package.models';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
  step9Schema,
} from './schemas/validationSchemas';
import styles from './CreatePackageWizard.module.css';

const steps = [
  'Region & Country',
  'Package Details',
  'Package Validity',
  'Upload Images',
  'Itinerary',
  'Destination',
  'Hotel Mapping',
  'Package Costing',
  'Cancellation Rules',
];

const CreatePackageWizard: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stepValidations, setStepValidations] = useState<boolean[]>(new Array(9).fill(false));

  const [formData, setFormData] = useState<Partial<CreatePackageRequest>>({
    regionId: 0,
    countryIds: [],
    languageCode: '',
    holidayCategoryCode: '',
    holidayTypeIds: [],
    packageName: '',
    departureCityIds: [],
    packageCode: '',
    packageComponents: [],
    destinationCityIds: [],
    isActive: true,
    tourType: 'fixed',
    validDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    durationDays: 1,
    isRecommended: false,
    isDeals: false,
    bookingType: 'offline',
    isFreeSell: false,
    imageAttribute: 'default',
    imageFor: 'package',
    itineraryDays: [],
    destinations: [],
    hotels: [],
    cancellationRules: [],
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('packageDraft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  const handleStepValidationChange = (stepIndex: number, isValid: boolean) => {
    setStepValidations((prev) => {
      const updated = [...prev];
      updated[stepIndex] = isValid;
      return updated;
    });
  };

  const updateFormData = (data: Partial<CreatePackageRequest>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateCurrentStep = (): boolean => {
    try {
      switch (activeStep) {
        case 0:
          step1Schema.parse({
            regionId: formData.regionId,
            countryIds: formData.countryIds,
          });
          break;
        case 1:
          step2Schema.parse({
            languageCode: formData.languageCode,
            holidayCategoryCode: formData.holidayCategoryCode,
            holidayTypeIds: formData.holidayTypeIds,
            packageName: formData.packageName,
            departureCityIds: formData.departureCityIds,
            packageCode: formData.packageCode,
            packageComponents: formData.packageComponents,
            destinationCityIds: formData.destinationCityIds,
            supplierName: formData.supplierName,
            remarks: formData.remarks,
            isActive: formData.isActive,
          });
          break;
        case 2:
          step3Schema.parse({
            tourType: formData.tourType,
            marketId: formData.marketId,
            validityFrom: formData.validityFrom,
            validityTo: formData.validityTo,
            bookingFrom: formData.bookingFrom,
            bookingTo: formData.bookingTo,
            validDays: formData.validDays,
            durationDays: formData.durationDays,
            isRecommended: formData.isRecommended,
            isDeals: formData.isDeals,
            seqNo: formData.seqNo,
            bookingType: formData.bookingType,
            isFreeSell: formData.isFreeSell,
            briefDescription: formData.briefDescription,
            fullDescription: formData.fullDescription,
          });
          break;
        case 3:
          step4Schema.parse({
            thumbnailImage: formData.thumbnailImage,
            bigImage: formData.bigImage,
            imageTag: formData.imageTag,
            imageAttribute: formData.imageAttribute,
            imageFor: formData.imageFor,
          });
          break;
        case 4:
          step5Schema.parse({
            itineraryDays: formData.itineraryDays,
            inclusions: formData.inclusions,
            exclusions: formData.exclusions,
          });
          break;
        case 5:
          step6Schema.parse({
            destinations: formData.destinations,
          });
          break;
        case 6:
          step7Schema.parse({
            hotels: formData.hotels,
          });
          break;
        case 7:
          step8Schema.parse({
            costing: formData.costing,
          });
          break;
        case 8:
          step9Schema.parse({
            cancellationRules: formData.cancellationRules,
          });
          break;
      }
      setMessage(null);
      return true;
    } catch (error: any) {
      if (error.errors && error.errors.length > 0) {
        const errorMessages = error.errors.map((err: any) => err.message).join(', ');
        setMessage({ type: 'error', text: errorMessages });
      } else {
        setMessage({ type: 'error', text: 'Please fill all required fields correctly' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      //localStorage.setItem('packageDraft', JSON.stringify(formData));
      localStorage.clear();
      setMessage({ type: 'success', text: 'Draft saved successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save draft' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    try {
      await packageService.createPackage(formData as CreatePackageRequest);
      setMessage({ type: 'success', text: 'Package created successfully!' });
      localStorage.removeItem('packageDraft');
      setTimeout(() => navigate('/package/package-list'), 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create package' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    const commonProps = {
      formData,
      updateFormData,
    };

    switch (activeStep) {
      case 0:
        return (
          <Step1SelectRegion
            {...commonProps}
            onValidationChange={(isValid) => handleStepValidationChange(0, isValid)}
          />
        );
      case 1:
        return (
          <Step2PackageDetails
            {...commonProps}
            onValidationChange={(isValid) => handleStepValidationChange(1, isValid)}
          />
        );
      case 2:
        return (
          <Step3PackageValidity
            {...commonProps}
            onValidationChange={(isValid) => handleStepValidationChange(2, isValid)}
          />
        );
      case 3:
        return (
          <Step4UploadImages
            {...commonProps}
            onValidationChange={(isValid) => handleStepValidationChange(3, isValid)}
          />
        );
      case 4:
        return (
          <Step5ItineraryManage
            {...commonProps}
            onValidationChange={(isValid) => handleStepValidationChange(4, isValid)}
          />
        );
      case 5:
        return (
          <Step6DestinationDetails
            {...commonProps}
            onValidationChange={(isValid) => handleStepValidationChange(5, isValid)}
          />
        );
      case 6:
        return (
          <Step7HotelMapping
            {...commonProps}
            onValidationChange={(isValid) => handleStepValidationChange(6, isValid)}
          />
        );
      case 7:
        return (
          <Step8PackageCosting
            {...commonProps}
            onValidationChange={(isValid) => handleStepValidationChange(7, isValid)}
          />
        );
      case 8:
        return (
          <Step9CancellationRules
            {...commonProps}
            onValidationChange={(isValid) => handleStepValidationChange(8, isValid)}
          />
        );
      default:
        return null;
    }
  };

  const completedSteps = stepValidations.filter(Boolean).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <Box className={styles.container}>
      <Paper className={styles.paper}>
        <Box className={styles.header}>
          <Box>
            <Typography variant="h5" className={styles.title}>
              Create New Package
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Save />}
            onClick={handleSaveDraft}
            disabled={isLoading}
            size="small"
          >
            Save Draft
          </Button>
        </Box>

        {/* <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={progressPercentage} sx={{ height: 8, borderRadius: 4 }} />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
            {completedSteps} of {steps.length} steps completed
          </Typography>
        </Box> */}

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={stepValidations[index]}>
              <StepLabel
                StepIconProps={{
                  icon: stepValidations[index] ? <CheckCircle /> : index + 1,
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        <Box className={styles.stepContent}>{renderStepContent()}</Box>

        <Box className={styles.actions}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
            disabled={activeStep === 0 || isLoading}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading}
              size="large"
              startIcon={<CheckCircle />}
            >
              {isLoading ? 'Creating Package...' : 'Create Package'}
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={handleNext}
              disabled={isLoading}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CreatePackageWizard;