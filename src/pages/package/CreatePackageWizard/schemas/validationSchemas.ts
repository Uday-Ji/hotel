import { z } from 'zod';

// Step 1: Region & Country
export const step1Schema = z.object({
  regionId: z.number().min(1, 'Region is required'),
  countryIds: z.array(z.string()).min(1, 'At least one country is required'),
});

// Step 2: Package Details
export const step2Schema = z.object({
  languageCode: z.string().min(1, 'Language is required'),
  holidayCategoryCode: z.string().min(1, 'Holiday category is required'),
  holidayTypeIds: z.array(z.number()).min(1, 'At least one holiday type is required'),
  packageName: z.string().min(3, 'Package name must be at least 3 characters'),
  departureCityIds: z.array(z.number()).min(1, 'At least one departure city is required'),
  packageCode: z.string().min(1, 'Package code is required'),
  packageComponents: z.array(z.string()).min(1, 'At least one component is required'),
  destinationCityIds: z.array(z.number()).min(1, 'At least one destination is required'),
  supplierName: z.string().optional(),
  remarks: z.string().optional(),
  isActive: z.boolean(),
});

// Step 3: Package Validity
export const step3Schema = z.object({
  tourType: z.enum(['fixed', 'group']),
  marketId: z.number().optional(),
  validityFrom: z.string().min(1, 'Validity from date is required'),
  validityTo: z.string().min(1, 'Validity to date is required'),
  bookingFrom: z.string().min(1, 'Booking from date is required'),
  bookingTo: z.string().min(1, 'Booking to date is required'),
  validDays: z.array(z.string()).min(1, 'At least one valid day is required'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day'),
  isRecommended: z.boolean(),
  isDeals: z.boolean(),
  seqNo: z.number().optional(),
  bookingType: z.enum(['online', 'offline']),
  isFreeSell: z.boolean(),
  briefDescription: z.string().min(10, 'Brief description must be at least 10 characters').max(300),
  fullDescription: z.string().min(50, 'Description must be at least 50 characters').max(8000),
});

// Step 4: Upload Images
export const step4Schema = z.object({
  thumbnailImage: z.any().optional(),
  bigImage: z.any().optional(),
  imageTag: z.string().optional(),
  imageAttribute: z.enum(['default', 'virtualTour']),
  imageFor: z.enum(['package', 'destination', 'hotel']),
});

// Step 5: Itinerary
export const step5Schema = z.object({
  itineraryDays: z.array(z.object({
    day: z.number().min(1),
    cityId: z.number().min(1, 'City is required'),
    briefDescription: z.string().min(5, 'Brief description is required'),
    fullDescription: z.string().optional(),
    thumbnailImage: z.any().optional(),
    bigImage: z.any().optional(),
  })).min(1, 'At least one itinerary day is required'),
  inclusions: z.string().optional(),
  exclusions: z.string().optional(),
});

// Step 6: Destination Details
export const step6Schema = z.object({
  destinations: z.array(z.object({
    cityId: z.number().min(1, 'City is required'),
    factsTypeId: z.number().min(1, 'Facts type is required'),
    description: z.string().min(10, 'Description is required'),
    thumbnailImage: z.any().optional(),
    bigImage: z.any().optional(),
    imageTag: z.string().optional(),
    isActive: z.boolean(),
  })).min(1, 'At least one destination is required'),
});

// Step 7: Hotel Mapping
export const step7Schema = z.object({
  hotels: z.array(z.object({
    cityId: z.number().min(1, 'City is required'),
    hotelCategoryId: z.number().min(1, 'Hotel category is required'),
    hotelName: z.string().min(1, 'Hotel name is required'),
    description: z.string().optional(),
    thumbnailImage: z.any().optional(),
    bigImage: z.any().optional(),
    imageTag: z.string().optional(),
    isActive: z.boolean(),
  })).min(1, 'At least one hotel is required'),
});

// Step 8: Package Costing
export const step8Schema = z.object({
  costing: z.object({
    packageValidityId: z.number().optional(),
    packageCategoryId: z.number().min(1, 'Package category is required'),
    validityFrom: z.string().min(1, 'Validity from is required'),
    validityTo: z.string().min(1, 'Validity to is required'),
    priceDetails: z.array(z.object({
      pricingType: z.string(),
      isChecked: z.boolean(),
      currency1: z.number().min(0),
      currency2: z.number().min(0),
      currency3: z.number().min(0),
      comment: z.string().optional(),
    })),
    minimumDeposit: z.number().min(0, 'Minimum deposit must be positive'),
    isActive: z.boolean(),
  }),
});

// Step 9: Cancellation Rules
export const step9Schema = z.object({
  cancellationRules: z.array(z.object({
    condition: z.enum(['before', 'after']),
    daysFrom: z.number().min(0, 'Days must be positive'),
    amount: z.number().min(0, 'Amount must be positive'),
    amountType: z.enum(['percentage', 'fixed']),
    chargeType: z.enum(['perBooking', 'perPerson']),
    isActive: z.boolean(),
  })).optional(),
});

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type Step4FormData = z.infer<typeof step4Schema>;
export type Step5FormData = z.infer<typeof step5Schema>;
export type Step6FormData = z.infer<typeof step6Schema>;
export type Step7FormData = z.infer<typeof step7Schema>;
export type Step8FormData = z.infer<typeof step8Schema>;
export type Step9FormData = z.infer<typeof step9Schema>;