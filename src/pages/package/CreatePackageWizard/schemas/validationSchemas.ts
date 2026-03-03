import { z } from 'zod';

// ── Step 1 ────────────────────────────────────────────────────────────────────
export const step1Schema = z.object({
  regionId:   z.number().min(1, 'Region is required'),
  countryIds: z.string().min(1, 'At least one country is required'),
});

// ── Step 2 ────────────────────────────────────────────────────────────────────
export const step2Schema = z.object({
  categoryId:     z.string().min(1, 'Holiday category is required'),
  holidayType:    z.string().min(1, 'At least one holiday type is required'),
  packageName:    z.string().min(3, 'Package name must be at least 3 characters'),
  packageCode:    z.string().min(1, 'Package code is required'),
  departCityList: z.string().min(1, 'At least one departure city is required'),
  componentType:  z.string().min(1, 'At least one component is required'),
  cityId:         z.string().min(1, 'At least one destination city is required'),
  languageCode:   z.string().min(1, 'Language is required'),
  supplierId:     z.string().optional(),
  remarks:        z.string().optional(),
  status:         z.number(),
});

// ── Step 3 ────────────────────────────────────────────────────────────────────
// ⚠️  NO .refine() here — refine() returns ZodEffects which cannot be .merge()d.
//     The "at least one day" check is done manually in validateCurrentTab().
export const step3Schema = z.object({
  tourType:     z.string().min(1, 'Tour type is required'),
  marketType:   z.string().optional(),
  days:         z.number().min(1, 'Duration must be at least 1 day'),
  validityFrom: z.string().min(1, 'Validity from is required'),
  validityTo:   z.string().min(1, 'Validity to is required'),
  bookingFrom:  z.string().min(1, 'Booking from is required'),
  bookingTo:    z.string().min(1, 'Booking to is required'),
  sunday:    z.boolean(), monday:    z.boolean(), tuesday:  z.boolean(),
  wednesday: z.boolean(), thursday:  z.boolean(), friday:   z.boolean(),
  saturday:  z.boolean(),
  bookingType:  z.string().min(1, 'Booking type is required'),
  ranking:      z.number().optional(),
  recommended:  z.boolean(),
  deals:        z.boolean(),
  freesell:     z.boolean(),
  shortDesc:    z.string().min(10, 'Brief description must be at least 10 characters').max(300),
  longDesc:     z.string().min(50, 'Full description must be at least 50 characters').max(8000),
});

/** Manual day-check used in validateCurrentTab after step3Schema.parse(). */
export const atLeastOneDay = (f: Pick<
  z.infer<typeof step3Schema>,
  'sunday'|'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'
>) => f.sunday||f.monday||f.tuesday||f.wednesday||f.thursday||f.friday||f.saturday;

// ── Combined: all three are plain ZodObjects so .merge() works ────────────────
export const tab0Schema = step1Schema.merge(step2Schema).merge(step3Schema);

// ── Steps 4–9 ─────────────────────────────────────────────────────────────────
export const step4Schema = z.object({
  imageAttribute: z.string().min(1, 'Image attribute is required'),
  imageFor:       z.string().min(1, 'Image for is required'),
  imageTag:       z.string().optional(),
});
export const step5Schema = z.object({
  itineraryDays: z.array(z.any()).optional(),
  inclusions:    z.string().optional(),
  exclusions:    z.string().optional(),
});
export const step6Schema = z.object({ destinations:      z.array(z.any()).optional() });
export const step7Schema = z.object({ hotels:            z.array(z.any()).optional() });
export const step8Schema = z.object({ costing:           z.any().optional() });
export const step9Schema = z.object({ cancellationRules: z.array(z.any()).optional() });