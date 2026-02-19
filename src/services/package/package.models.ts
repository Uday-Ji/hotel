export interface Package {
  packageId: number;
  packageCode: string;
  packageName: string;
  holidayType: string;
  priceStatus: string;
  regionId: number;
  countryId: string;
  days: number;
  validityFrom: string;
  validityTo: string;
  status: string;
  deals: boolean;
  recommended: boolean;
  menu: boolean;
  freeSell: boolean;
}

export interface PackageListRequest {
  regionId?: number;
  countryIds?: string;
  holidayCategoryCode?: string;
  validityFrom?: string;
  validityTo?: string;
  packageName?: string;
  companyCode: string;
  status?: string;
}

export interface HolidayCategory {
  categoryCode: string;
  categoryName: string;
  language?: string;
  status?: string;
}

export interface HolidayCategoryTypeMapping {
  categoryName: string;
  holidayTypeName: string;
  status: string;
}

export interface TabsType {
  offerId: number;
  offerType: string;
  offerCode: string;
  status: string;
  id?: number;
}

export interface FactsType {
  sNo: number;
  factsType: string;
  language: string;
  status: string;
  id?: number;
}

export interface CreatePackageStep1 {
  regionId: number;
  countryIds: string[];
}

// Add these to existing package.models.ts

export interface PackageCreationStep {
  step: number;
  label: string;
  completed: boolean;
  valid: boolean;
}

export interface CreatePackageRequest {
  // Step 1: Region & Country
  regionId: number;
  countryIds: string[];
  
  // Step 2: Package Details
  languageCode: string;
  holidayCategoryCode: string;
  holidayTypeIds: number[];
  packageName: string;
  departureCityIds: number[];
  packageCode: string;
  supplierName?: string;
  packageComponents: string[];
  destinationCityIds: number[];
  remarks?: string;
  isActive: boolean;
  
  // Step 3: Package Validity
  tourType: 'fixed' | 'group';
  marketId?: number;
  validityFrom: string;
  validityTo: string;
  bookingFrom: string;
  bookingTo: string;
  validDays: string[];
  durationDays: number;
  isRecommended: boolean;
  isDeals: boolean;
  seqNo?: number;
  bookingType: 'online' | 'offline';
  isFreeSell: boolean;
  briefDescription: string;
  fullDescription: string;
  
  // Step 4: Images
  thumbnailImage?: File;
  bigImage?: File;
  imageTag?: string;
  imageAttribute: 'default' | 'virtualTour';
  imageFor: 'package' | 'destination' | 'hotel';
  
  // Step 5: Itinerary
  itineraryDays: PackageItineraryDay[];
  inclusions: string;
  exclusions: string;
  
  // Step 6: Destination Details
  destinations: PackageDestination[];
  
  // Step 7: Hotel Mapping
  hotels: PackageHotelMapping[];
  
  // Step 8: Package Costing
  costing: PackageCosting;
  
  // Step 9: Cancellation Rules
  cancellationRules: CancellationRule[];
}

export interface PackageItineraryDay {
  day: number;
  cityId: number;
  briefDescription: string;
  fullDescription?: string;
  thumbnailImage?: File;
  bigImage?: File;
}

export interface PackageDestination {
  cityId: number;
  factsTypeId: number;
  description: string;
  thumbnailImage?: File;
  bigImage?: File;
  imageTag?: string;
  isActive: boolean;
}

export interface PackageHotelMapping {
  cityId: number;
  hotelCategoryId: number;
  hotelName: string;
  description: string;
  thumbnailImage?: File;
  bigImage?: File;
  imageTag?: string;
  isActive: boolean;
}

export interface PackageCosting {
  packageValidityId: number;
  packageCategoryId: number;
  validityFrom: string;
  validityTo: string;
  priceDetails: PriceDetail[];
  minimumDeposit: number;
  isActive: boolean;
}

export interface PriceDetail {
  pricingType: string;
  isChecked: boolean;
  currency1: number;
  currency2: number;
  currency3: number;
  comment: string;
}

export interface CancellationRule {
  condition: 'before' | 'after';
  daysFrom: number;
  amount: number;
  amountType: 'percentage' | 'fixed';
  chargeType: 'perBooking' | 'perPerson';
  isActive: boolean;
}


// Add to existing file
export interface PackageListRequest {
  regionId?: number;
  countryIds?: string;
  holidayCategoryCode?: string;
  validityFrom?: string;
  validityTo?: string;
  packageName?: string;
  companyCode: string;
  status?: string;
}

export interface PackageListItem {
  packageId: number;
  holidayType: string;
  priceStatus: string;
  regionId: number;
  countryId: string;
  packageCode: string;
  packageName: string;
  days: number;
  validityFrom: string;
  validityTo: string;
  status: string;
  deals: boolean;
  recommended: boolean;
  menu: boolean;
  freeSell: boolean;
}

export interface UpdatePackageStatusRequest {
  packageId: number;
  userId: number;
  companyCode: string;
  status: boolean;
  deals: boolean;
  recommended: boolean;
  menu: boolean;
}


export interface CreateAndUpdatePackageRequest {
  categoryId: string;
  holidayType: string;
  packageCode: string;
  departCityList: string;
  packageName: string;
  supplierId: string;
  offerType: string;
  offerDesc: string;
  tourType: string;
  marketType: string;
  days: number;
  validityFrom: string;
  validityTo: string;
  bookingFrom: string;
  bookingTo: string;
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  componentType: string;
  regionId: number;
  countryIds: string;
  cityId: string;
  agentCommision: number;
  commisionTypeInPercent: boolean;
  recommended: boolean;
  deals: boolean;
  menu: boolean;
  freesell: boolean;
  remarks: string;
  status: number;
  actionType: 'INSERT' | 'UPDATE';
  bookingType: string;
  ranking: number;
  userId: number;
  companyCode: string;
  pkgId: number;
  shortDesc: string;
  longDesc: string;
  languageCode: string;
}

export interface CreateAndUpdatePackageResponse {
  packageId: number;
  packageCode: string;
  message: string;
}

export interface HolidayType {
  holidayTypeID: number;
  holidayTypeName: string;
  categoryCode?: string;
  isActive: boolean;
}

export interface Language {
  languageName: string;
  languageCode: string;
}

export interface City{
  cityCode: string;
  countryCode: string;
  cName: string;
  cityName: string;
  cityId: string;
  isMaster: boolean;
}

export interface PackageSupplier {
  supplierId: number;
  supplierName: string;
}