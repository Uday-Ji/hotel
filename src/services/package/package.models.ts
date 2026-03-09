// ─────────────────────────────────────────────────────────────────────────────
// package.models.ts
//
// DESIGN RULE: PackageFormData field names = CreateAndUpdatePackage API fields.
// One mapping function (mapApiResponseToFormData) runs once on edit-load.
// After that, formData IS the API payload — no further mapping anywhere.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Utility ───────────────────────────────────────────────────────────────────

export const toISODate = (val: string | null | undefined): string => {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const ts = Date.parse(val);
  return isNaN(ts) ? '' : new Date(ts).toISOString().split('T')[0];
};

// ── Lookup / dropdown types ───────────────────────────────────────────────────

export interface HolidayCategory {
  categoryCode: string;
  categoryName: string;
  // Optional fields used by HolidayCategoryMaster admin page
  language?: string;
  status?:   string;
}

export interface HolidayType     { holidayTypeID: number; holidayTypeName: string; holidayTypeCode:string;  }
export interface Language        { languageCode: string;  languageName: string; }
export interface Market          { marketId: number;      marketName: string; }
export interface PackageSupplier { supplierId: number;    supplierName: string; }

// ── List / status ─────────────────────────────────────────────────────────────

export interface PackageListRequest {
  regionId?: number; countryIds?: string; holidayCategoryCode?: string;
  validityFrom?: string; validityTo?: string; packageName?: string;
  companyCode: string; status?: string;
}

export interface PackageListItem {
  packageId: number; holidayType: string; priceStatus: string;
  regionId: number; countryId: string; packageCode: string; packageName: string;
  days: number; validityFrom: string; validityTo: string; status: string;
  deals: boolean; recommended: boolean; menu: boolean; freeSell: boolean;
}

/** Used by packageSlice and package list pages. */
export interface Package {
  packageId: number; packageCode: string; packageName: string;
  holidayType: string; priceStatus: string; regionId: number; countryId: string;
  days: number; validityFrom: string; validityTo: string; status: string;
  deals: boolean; recommended: boolean; menu: boolean; freeSell: boolean;
}

export interface UpdatePackageStatusRequest {
  packageId: number; userId: number; companyCode: string;
  status: boolean; deals: boolean; recommended: boolean; menu: boolean;
}

export interface HolidayCategoryTypeMapping {
  categoryName: string; holidayTypeName: string; status: string;
}
export interface TabsType  { offerId: number; offerType: string; offerCode: string; status: string; id?: number; }
export interface FactsType { sNo: number; factsType: string; language: string; status: string; id?: number; }

// ── Sub-entity types ──────────────────────────────────────────────────────────

export interface PriceDetail {
  pricingType: string; isChecked: boolean;
  currency1: number; currency2: number; currency3: number; comment: string;
}
export interface PackageCosting {
  packageValidityId: number; packageCategoryId: number;
  validityFrom: string; validityTo: string;
  priceDetails: PriceDetail[]; minimumDeposit: number; isActive: boolean;
}
export interface PackageItineraryDay {
  day: number; cityId: string; briefDescription: string;
  fullDescription?: string; thumbnailImage?: File; bigImage?: File;
}
export interface PackageDestination {
  cityId: string; factsTypeId: number; description: string;
  thumbnailImage?: File; bigImage?: File; imageTag?: string; isActive: boolean;
}
export interface PackageHotelMapping {
  cityId: string; hotelCategoryId: number; hotelName: string; description: string;
  thumbnailImage?: File; bigImage?: File; imageTag?: string; isActive: boolean;
}
export interface CancellationRule {
  condition: 'before' | 'after'; daysFrom: number; amount: number;
  amountType: 'percentage' | 'fixed'; chargeType: 'perBooking' | 'perPerson'; isActive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PackageFormData — field names mirror the CreateAndUpdatePackage API payload.
// ─────────────────────────────────────────────────────────────────────────────

export interface PackageFormData {
  // Step 1
  regionId:       number;
  countryIds:     string;   // comma-separated country codes e.g. "IN,IQ"
  cityId:         string;   // destination city IDs, comma-sep e.g. "DEL,BOM"
  // Step 2
  categoryId:     string;
  holidayType:    string;   // holiday type IDs, comma-sep e.g. "4,7"
  packageCode:    string;
  packageName:    string;
  departCityList: string;   // departure city IDs, comma-sep
  componentType:  string;   // component names, comma-sep
  languageCode:   string;
  remarks:        string;
  supplierId:     string;
  status:         number;   // 1=active 0=inactive
  // Step 3
  tourType:       string;
  marketType:     string;
  days:           number;
  validityFrom:   string;
  validityTo:     string;
  bookingFrom:    string;
  bookingTo:      string;
  sunday:         boolean;
  monday:         boolean;
  tuesday:        boolean;
  wednesday:      boolean;
  thursday:       boolean;
  friday:         boolean;
  saturday:       boolean;
  bookingType:    string;
  ranking:        number;
  recommended:    boolean;
  deals:          boolean;
  freesell:       boolean;
  shortDesc:      string;
  longDesc:       string;
  // Step 4
  thumbnailImage?: File;
  bigImage?:       File;
  imageTag?:       string;
  imageAttribute:  string;
  imageFor:        string;
  // Steps 5-9
  itineraryDays:     PackageItineraryDay[];
  inclusions?:       string;
  exclusions?:       string;
  destinations:      PackageDestination[];
  hotels:            PackageHotelMapping[];
  costing?:          PackageCosting;
  cancellationRules: CancellationRule[];
  // API housekeeping (not shown in form, injected at submit)
  offerType?:             string;
  offerDesc?:             string;
  agentCommision?:        number;
  commisionTypeInPercent?: boolean;
  menu?:                  boolean;
}

/** @deprecated Alias so existing step imports (Steps 4-9) keep compiling. */
export type CreatePackageRequest = PackageFormData;

export const DEFAULT_FORM_DATA: PackageFormData = {
  regionId: 0, countryIds: '', cityId: '',
  categoryId: '', holidayType: '', packageCode: '', packageName: '',
  departCityList: '', componentType: '', languageCode: '', remarks: '',
  supplierId: '0', status: 1,
  tourType: 'FIT', marketType: '', days: 1,
  validityFrom: '', validityTo: '', bookingFrom: '', bookingTo: '',
  sunday: true, monday: true, tuesday: true, wednesday: true,
  thursday: true, friday: true, saturday: true,
  bookingType: '1', ranking: 0, recommended: false, deals: false, freesell: false,
  shortDesc: '', longDesc: '',
  imageAttribute: 'default', imageFor: 'package',
  itineraryDays: [], destinations: [], hotels: [], cancellationRules: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// THE ONLY MAPPING FUNCTION — called once when loading an existing package.
// Translates PackageDetails API response → PackageFormData.
// ─────────────────────────────────────────────────────────────────────────────

export const mapApiResponseToFormData = (raw: any): PackageFormData => ({
  regionId:       raw.regionId      ?? 0,
  countryIds:     raw.countryId     ?? '',   // API returns "countryId" (singular)
  cityId:         raw.cityId        ?? '',
  categoryId:     raw.categoryId    ?? '',
  holidayType:    raw.packageType   ?? raw.holidayType ?? '',
  packageCode:    raw.packageCode   ?? '',
  packageName:    raw.packageName   ?? '',
  departCityList: raw.cityId        ?? '',
  componentType:  raw.componentType ?? '',
  languageCode:   raw.languageCode  ?? '',
  remarks:        raw.remarks       ?? '',
  supplierId:     String(raw.supplierId ?? '0'),
  status:         raw.status === true ? 1 : 0,
  tourType:       raw.tourType      ?? 'FIT',
  marketType:     raw.marketType    ?? '',
  days:           raw.days          ?? 1,
  validityFrom:   toISODate(raw.validityFrom),
  validityTo:     toISODate(raw.validityTo),
  bookingFrom:    toISODate(raw.bookingFrom),
  bookingTo:      toISODate(raw.bookingTo),
  sunday:         raw.sunday        ?? false,
  monday:         raw.monday        ?? false,
  tuesday:        raw.tuesday       ?? false,
  wednesday:      raw.wednesday     ?? false,
  thursday:       raw.thursday      ?? false,
  friday:         raw.friday        ?? false,
  saturday:       raw.saturday      ?? false,
  bookingType:    raw.bookingType   ?? '1',
  ranking:        raw.ranking       ?? 0,
  recommended:    raw.recommended   ?? false,
  deals:          raw.deals         ?? false,
  freesell:       raw.freesell      ?? false,
  shortDesc:      raw.shortDesc     ?? '',
  longDesc:       raw.longDesc      ?? '',
  imageAttribute: raw.imageAttribute ?? 'default',
  imageFor:       raw.imageFor       ?? 'package',
  imageTag:       raw.imageTag,
  itineraryDays:     raw.itineraryDays     ?? [],
  inclusions:        raw.inclusions,
  exclusions:        raw.exclusions,
  destinations:      raw.destinations      ?? [],
  hotels:            raw.hotels            ?? [],
  costing:           raw.costing,
  cancellationRules: raw.cancellationRules ?? [],
  offerType:             raw.offerType              ?? '0',
  offerDesc:             raw.offerDesc              ?? '',
  agentCommision:        raw.agentCommision          ?? 0,
  commisionTypeInPercent:raw.commisionTypeInPercent  ?? true,
  menu:                  raw.menu                   ?? false,
});

// ── API contract ──────────────────────────────────────────────────────────────

export interface CreateAndUpdatePackageResponse {
  referenceId: number;
  packageCode?: string;
  message?: string;
}

export interface SavePackageImagePayload {
  imageTag?: string;
  imageAttribute: 'default' | 'virtualTour';
  imageFor: 'package' | 'destination' | 'hotel';
  thumbnailImage?: File;
  bigImages?: File[];
}

export interface SavedPackageImage {
  id: number;
  packageId: number;
  imageTag?: string;
  imageAttribute: 'default' | 'virtualTour';
  imageFor: 'package' | 'destination' | 'hotel';
  thumbnailUrl?: string;
  bigImageUrls?: string[];
  createdAt: string;
  status: 'active' | 'inactive';
}

// ── Package Inclusions & Exclusions ───────────────────────────────────────────

export interface PackageInclusion {
  id: number;
  packageId: number;
  description: string;
  tabType?: string;
  isActive: boolean;
  createdAt?: string;
}

// ── Zod Schemas for Inclusions ──────────────────────────────────────────

export const inclusionSchema = z.object({
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  tabType: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type InclusionFormData = z.infer<typeof inclusionSchema>;