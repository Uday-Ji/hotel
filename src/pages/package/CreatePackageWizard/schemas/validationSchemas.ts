import { z } from 'zod';

// ── STEP 1: Region Selection ────────────────────────────────────────────────

export const step1Schema = z.object({
  regionId: z.number().min(1, 'Region is required'),
  countryIds: z.string().min(1, 'At least one country is required'),
});

// ── STEP 2: Package Details ────────────────────────────────────────────────

export const step2Schema = z.object({
  categoryId: z.string().min(1, 'Holiday category is required'),
  holidayType: z.string().min(1, 'At least one holiday type is required'),
  packageName: z.string()
    .min(3, 'Package name must be at least 3 characters')
    .max(200, 'Package name cannot exceed 200 characters'),
  packageCode: z.string()
    .min(1, 'Package code is required')
    .max(50, 'Package code cannot exceed 50 characters'),
  departCityList: z.string().min(1, 'At least one departure city is required'),
  componentType: z.string().min(1, 'At least one component is required'),
  cityId: z.string().min(1, 'At least one destination city is required'),
  languageCode: z.string().min(1, 'Language is required'),
  supplierId: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  status: z.number().min(0, 'Status is required'),
});

// ── STEP 3: Package Validity & Details ──────────────────────────────────────

export const step3Schema = z.object({
  tourType: z.string().min(1, 'Tour type is required'),
  marketType: z.string().optional().nullable(),
  days: z.number().min(1, 'Duration must be at least 1 day').max(365, 'Duration cannot exceed 365 days'),
  validityFrom: z.string().min(1, 'Validity from is required'),
  validityTo: z.string().min(1, 'Validity to is required'),
  bookingFrom: z.string().min(1, 'Booking from is required'),
  bookingTo: z.string().min(1, 'Booking to is required'),
  sunday: z.boolean().default(false),
  monday: z.boolean().default(false),
  tuesday: z.boolean().default(false),
  wednesday: z.boolean().default(false),
  thursday: z.boolean().default(false),
  friday: z.boolean().default(false),
  saturday: z.boolean().default(false),
  bookingType: z.string().min(1, 'Booking type is required'),
  ranking: z.number().optional().nullable(),
  recommended: z.boolean().default(false),
  deals: z.boolean().default(false),
  freesell: z.boolean().default(false),
  shortDesc: z.string()
    .min(10, 'Brief description must be at least 10 characters')
    .max(300, 'Brief description cannot exceed 300 characters'),
  longDesc: z.string()
    .min(50, 'Full description must be at least 50 characters')
    .max(8000, 'Full description cannot exceed 8000 characters'),
});

/**
 * Manual validation: At least one day must be selected
 * Use this AFTER step3Schema.parse() in validateCurrentTab()
 */
export const atLeastOneDay = (f: Pick<
  z.infer<typeof step3Schema>,
  'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
>): boolean => {
  return f.sunday || f.monday || f.tuesday || f.wednesday || f.thursday || f.friday || f.saturday;
};

/**
 * Combined schema for all three package detail steps
 * Used for validation in validateCurrentTab()
 */
export const tab0Schema = step1Schema.merge(step2Schema).merge(step3Schema);

// ── STEP 4: Upload Images ──────────────────────────────────────────────────

export const step4Schema = z.object({
  imageAttribute: z.string().min(1, 'Image attribute is required'),
  imageFor: z.string().min(1, 'Image for is required'),
  imageTag: z.string().optional().nullable(),
});

// ── STEP 5: Itinerary Management ───────────────────────────────────────────

export const step5Schema = z.object({
  itineraryDays: z.array(z.any()).optional().default([]),
  inclusions: z.string().optional().nullable(),
  exclusions: z.string().optional().nullable(),
}).passthrough();

// ── STEP 6: Destination Details ────────────────────────────────────────────

export const destinationItemSchema = z.object({
  destinationId: z.number().optional(),
  packageId: z.number(),
  countryCode: z.string().min(1, 'Country code is required'),
  cityCode: z.string().min(1, 'City code is required'),
  factsTypeId: z.number().min(1, 'Facts type is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  status: z.boolean().default(true),
});

export const step6Schema = z.object({
  destinations: z.array(destinationItemSchema).optional().default([]),
});

// ── STEP 7: Hotel Mapping ──────────────────────────────────────────────────

export const hotelMappingSchema = z.object({
  packageId: z.number(),
  hotelId: z.number().min(1, 'Hotel is required'),
  nightNumber: z.number().min(1, 'Night number is required'),
  roomType: z.string().optional().nullable(),
  mealType: z.string().optional().nullable(),
});

export const step7Schema = z.object({
  hotels: z.array(hotelMappingSchema).optional().default([]),
});

// ── STEP 8: Package Costing ────────────────────────────────────────────────

export const costingSchema = z.object({
  packageId: z.number(),
  perPerson: z.number().min(0, 'Cost must be non-negative'),
  perRoom: z.number().min(0, 'Cost must be non-negative'),
  singleSupplement: z.number().min(0, 'Cost must be non-negative'),
  childDiscount: z.number().min(0, 'Discount must be non-negative'),
  childWithBedDiscount: z.number().min(0, 'Discount must be non-negative'),
  validity: z.string().optional().nullable(),
});

export const step8Schema = z.object({
  costing: costingSchema.optional(),
});

// ── STEP 9: Cancellation Rules ─────────────────────────────────────────────

export const cancellationRuleSchema = z.object({
  daysBeforeDeparture: z.number().min(0, 'Days must be non-negative'),
  cancellationPercentage: z.number().min(0, 'Percentage must be non-negative').max(100, 'Percentage cannot exceed 100'),
  ruleOrder: z.number().optional(),
});

export const step9Schema = z.object({
  cancellationRules: z.array(cancellationRuleSchema).optional().default([]),
});

// ── Type Exports ───────────────────────────────────────────────────────────

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type Step7Data = z.infer<typeof step7Schema>;
export type Step8Data = z.infer<typeof step8Schema>;
export type Step9Data = z.infer<typeof step9Schema>;
export type Tab0Data = z.infer<typeof tab0Schema>;

// ── Utility Functions ──────────────────────────────────────────────────────

/**
 * Validate a specific step and return validation result
 */
export const validateStep = (
  stepNumber: number,
  data: any
): { valid: boolean; errors: string[] } => {
  try {
    switch (stepNumber) {
      case 0:
        step1Schema.parse({ regionId: data.regionId, countryIds: data.countryIds });
        step2Schema.parse({
          categoryId: data.categoryId,
          holidayType: data.holidayType,
          packageName: data.packageName,
          packageCode: data.packageCode,
          departCityList: data.departCityList,
          componentType: data.componentType,
          cityId: data.cityId,
          languageCode: data.languageCode,
          supplierId: data.supplierId,
          remarks: data.remarks,
          status: data.status,
        });
        step3Schema.parse({
          tourType: data.tourType,
          marketType: data.marketType,
          days: data.days,
          validityFrom: data.validityFrom,
          validityTo: data.validityTo,
          bookingFrom: data.bookingFrom,
          bookingTo: data.bookingTo,
          sunday: data.sunday,
          monday: data.monday,
          tuesday: data.tuesday,
          wednesday: data.wednesday,
          thursday: data.thursday,
          friday: data.friday,
          saturday: data.saturday,
          bookingType: data.bookingType,
          ranking: data.ranking,
          recommended: data.recommended,
          deals: data.deals,
          freesell: data.freesell,
          shortDesc: data.shortDesc,
          longDesc: data.longDesc,
        });
        if (!atLeastOneDay(data)) {
          return { valid: false, errors: ['At least one day must be selected'] };
        }
        return { valid: true, errors: [] };

      case 1:
        step4Schema.parse({ imageAttribute: data.imageAttribute, imageFor: data.imageFor, imageTag: data.imageTag });
        return { valid: true, errors: [] };

      case 2:
        step5Schema.parse({ itineraryDays: data.itineraryDays, inclusions: data.inclusions, exclusions: data.exclusions });
        return { valid: true, errors: [] };

      case 3:
        step6Schema.parse({ destinations: data.destinations });
        return { valid: true, errors: [] };

      case 4:
        step7Schema.parse({ hotels: data.hotels });
        return { valid: true, errors: [] };

      case 5:
        step8Schema.parse({ costing: data.costing });
        return { valid: true, errors: [] };

      case 6:
        step9Schema.parse({ cancellationRules: data.cancellationRules });
        return { valid: true, errors: [] };

      default:
        return { valid: false, errors: ['Invalid step number'] };
    }
  } catch (err: any) {
    if (err.errors) {
      return {
        valid: false,
        errors: err.errors.map((e: any) => e.message),
      };
    }
    return {
      valid: false,
      errors: [err.message || 'Validation failed'],
    };
  }
};