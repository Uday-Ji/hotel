import { apiClient } from '@/services/api/axios.instance';
import type {
  PackageFormData, PackageListRequest, PackageListItem,
  UpdatePackageStatusRequest, CreateAndUpdatePackageResponse,
  HolidayCategory, HolidayType, Language, Market, PackageSupplier,
} from './package.models';
import { mapApiResponseToFormData } from './package.models';
import { envConfig } from '@/config';
import { ApiResponse } from '@/types';

class PackageService {
  private get cc() { return envConfig.tenant.companyCode; }

  // ── READ ──────────────────────────────────────────────────────────────────

  async getPackageById(packageId: number): Promise<PackageFormData> {
    const res = await apiClient.post<ApiResponse<any>>(
      '/Package/PackageDetails', { packageId, companyCode: this.cc },
    );
    return mapApiResponseToFormData(res.data.data);
  }

  async getPackageList(params: PackageListRequest): Promise<PackageListItem[]> {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString().split('T')[0];
    const res = await apiClient.post<ApiResponse<PackageListItem[]>>('/Package/PackageList', {
      regionId: params.regionId ?? 0,
      countryIds: params.countryIds ?? '',
      holidayCategoryCode: params.holidayCategoryCode ?? '',
      validityFrom: params.validityFrom ?? today,
      validityTo: params.validityTo ?? nextYear,
      packageName: params.packageName ?? '',
      companyCode: params.companyCode ?? this.cc,
      status: params.status ?? '',
    });
    return res.data.data;
  }

  // ── WRITE — zero field aliasing, formData keys = API keys ────────────────

  async savePackage(
    formData: PackageFormData,
    pkgId: number = 0,
    userId: number = 0,
  ): Promise<CreateAndUpdatePackageResponse> {
    const res = await apiClient.post<ApiResponse<CreateAndUpdatePackageResponse>>(
      '/Package/CreateAndUpdatePackage',
      {
        categoryId: formData.categoryId, holidayType: formData.holidayType,
        packageCode: formData.packageCode, packageName: formData.packageName,
        departCityList: formData.departCityList, componentType: formData.componentType,
        languageCode: formData.languageCode, remarks: formData.remarks,
        supplierId: formData.supplierId, tourType: formData.tourType,
        marketType: formData.marketType, days: formData.days,
        validityFrom: formData.validityFrom, validityTo: formData.validityTo,
        bookingFrom: formData.bookingFrom, bookingTo: formData.bookingTo,
        sunday: formData.sunday, monday: formData.monday, tuesday: formData.tuesday,
        wednesday: formData.wednesday, thursday: formData.thursday,
        friday: formData.friday, saturday: formData.saturday,
        bookingType: formData.bookingType, ranking: formData.ranking,
        recommended: formData.recommended, deals: formData.deals,
        freesell: formData.freesell, shortDesc: formData.shortDesc,
        longDesc: formData.longDesc, regionId: formData.regionId,
        countryIds: formData.countryIds, cityId: formData.cityId,
        status: formData.status,
        offerType: formData.offerType ?? '0',
        offerDesc: formData.offerDesc ?? '',
        agentCommision: formData.agentCommision ?? 0,
        commisionTypeInPercent: formData.commisionTypeInPercent ?? true,
        menu: formData.menu ?? false,
        // Meta — injected at submit only
        pkgId, userId, companyCode: this.cc,
        actionType: pkgId > 0 ? 'UPDATE' : 'INSERT',
      },
    );
    return res.data.data;
  }

  async updatePackageStatusAndFeatures(data: UpdatePackageStatusRequest): Promise<void> {
    await apiClient.post('/Package/UpdateStatusAndTags', data);
  }

  // ── DROPDOWNS ─────────────────────────────────────────────────────────────

  async getRegionList(): Promise<any[]> {
    const res = await apiClient.post<ApiResponse<any[]>>(
      '/Common/RegionList', { companyCode: this.cc, status: 1 },
    );
    return res.data.data;
  }

  async getCountryByRegion(regionId: number): Promise<any[]> {
    const res = await apiClient.post<ApiResponse<any[]>>(
      '/Common/CountryByRegionList', { regionId, companyCode: this.cc },
    );
    return res.data.data;
  }

  async getHolidayCategoryList(): Promise<HolidayCategory[]> {
    const res = await apiClient.post<ApiResponse<HolidayCategory[]>>(
      '/Common/HolidayCategoryList', { companyCode: this.cc, status: 1 },
    );
    return res.data.data;
  }

  async getHolidayTypeList(holidayCategoryCode: string): Promise<HolidayType[]> {
    const res = await apiClient.post<ApiResponse<HolidayType[]>>(
      '/Package/HolidayTypeList', { companyCode: this.cc, holidayCategoryCode },
    );
    return res.data.data;
  }

  async getLanguageList(): Promise<Language[]> {
    const res = await apiClient.post<ApiResponse<Language[]>>(
      '/Common/LanguageList', { companyCode: this.cc },
    );
    return res.data.data;
  }

  async getMarketList(): Promise<Market[]> {
    const res = await apiClient.post<ApiResponse<Market[]>>(
      '/Common/MarketList', { companyCode: this.cc },
    );
    return res.data.data;
  }

  async getCitiesList(): Promise<any[]> {
    const res = await apiClient.post<ApiResponse<any[]>>(
      '/Package/DepartureCitiesList', { companyCode: this.cc },
    );
    return res.data.data;
  }

  async PackageSuppliersList(): Promise<PackageSupplier[]> {
    const res = await apiClient.post<ApiResponse<PackageSupplier[]>>(
      '/Package/PackageSuppliersList', { companyCode: this.cc },
    );
    return res.data.data;
  }

  // ── Additional Dropdowns (for Step6 Destination Details) ────────────────

  /**
   * Get list of countries
   */
  async getCountriesList(): Promise<any[]> {
    const res = await apiClient.post<ApiResponse<any[]>>(
      '/Common/CountryList', { companyCode: this.cc, status: 1 },
    );
    return res.data.data;
  }

  /**
   * Get list of cities by country
   */
  async getCitiesByCountry(countryCode: string): Promise<any[]> {
    const res = await apiClient.post<ApiResponse<any[]>>(
      '/Common/CityListByCountry', { countryCode, companyCode: this.cc },
    );
    return res.data.data;
  }

  // ── CRUD for admin pages (HolidayCategoryMaster, TabsType, FactsType) ────

  async getHolidayCategoryTypeMappingList(): Promise<any[]> {
    const res = await apiClient.post<ApiResponse<any[]>>(
      '/Package/HolidayCategoryTypeMappingList', { companyCode: this.cc },
    );
    return res.data.data;
  }

  async createHolidayCategory(data: Partial<HolidayCategory>): Promise<HolidayCategory> {
    const res = await apiClient.post<ApiResponse<HolidayCategory>>(
      '/Package/CreateHolidayCategory', { ...data, companyCode: this.cc },
    );
    return res.data.data;
  }

  async updateHolidayCategory(id: number, data: Partial<HolidayCategory>): Promise<HolidayCategory> {
    const res = await apiClient.post<ApiResponse<HolidayCategory>>(
      '/Package/UpdateHolidayCategory', { ...data, id, companyCode: this.cc },
    );
    return res.data.data;
  }

  async deleteHolidayCategory(id: number): Promise<void> {
    await apiClient.post('/Package/DeleteHolidayCategory', { id, companyCode: this.cc });
  }

  async getTabsTypeList(): Promise<any[]> {
    try {
      const res = await apiClient.post<ApiResponse<any[]>>(
        '/Package/TabsTypeList', { companyCode: this.cc },
      );
      return res.data?.data || [];
    } catch (error) {
      console.warn('Failed to fetch TabsTypeList, returning empty array:', error);
      return [];
    }
  }

  async createTabsType(data: any): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(
      '/Package/CreateTabsType', { ...data, companyCode: this.cc },
    );
    return res.data.data;
  }

  async updateTabsType(id: number, data: any): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(
      '/Package/UpdateTabsType', { ...data, offerId: id, companyCode: this.cc },
    );
    return res.data.data;
  }

  async deleteTabsType(id: number): Promise<void> {
    await apiClient.post('/Package/DeleteTabsType', { offerId: id, companyCode: this.cc });
  }

  async getFactsTypeList(): Promise<any[]> {
    const res = await apiClient.post<ApiResponse<any[]>>(
      '/Package/DestinationFactList', { companyCode: this.cc },
    );
    return res.data.data;
  }

  async createFactsType(data: any): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(
      '/Package/CreateFactsType', { ...data, companyCode: this.cc },
    );
    return res.data.data;
  }

  async updateFactsType(id: number, data: any): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(
      '/Package/UpdateFactsType', { ...data, sNo: id, companyCode: this.cc },
    );
    return res.data.data;
  }

  async deleteFactsType(id: number): Promise<void> {
    await apiClient.post('/Package/DeleteFactsType', { sNo: id, companyCode: this.cc });
  }


  async changeImageFeature(id: number, actionType: string, packageId: number, userId: number): Promise<void> {
    const payload = {
      "packageId": packageId,
      "imageId": id,
      "userId": userId,
      "companyCode": this.cc,
      "actionType": actionType //DELETE/SetAsDefault/ChageStatus
    }

    await apiClient.post('/Package/ChangePackageImageFeature', payload);
  }


  async getPackageImages(id: number): Promise<any[]> {
    const res = await apiClient.post('/Package/GetPackageImages', { packageId: id, companyCode: this.cc });
    return res.data.data;
  }

  async uploadImages(payload: any): Promise<any> {
    console.log('Uploading images with payload:', payload);
    payload.companyCode = this.cc;

    for (const pair of Object.entries(payload)) {

      console.log(pair[0], pair[1]);
    }

    const res = await apiClient.post(
      "/Package/PostPackageImages",
      payload
    );

    return res.data;
  }

  async getPackageItineraries(packageId: number, companyCode: string=this.cc) {
  const response = await apiClient.post('/Package/GetPackageItineraries', {
    packageId,
    companyCode,
  });
  return response.data;
}

/**
 * Get package inclusions
 */
async getPackageInclusions(packageId: number, companyCode: string= this.cc) {
  const response = await apiClient.post('/Package/GetPackageInclusions', {
    packageId,
    companyCode,
  });
  return response.data;
}

/**
 * Create new itinerary day
 */
async createPackageItinerary(data: any) {
  data.companyCode = this.cc;
  const response = await apiClient.post('/Package/PostPackageItinary', data);
  return response.data;
}

/**
 * Update existing itinerary day
 */
async updatePackageItinerary(data: any) {
  data.companyCode = this.cc;
  const response = await apiClient.post('/Package/PostPackageItinary', data);
  return response.data;
}

/**
 * Delete itinerary day
 */
async deletePackageItinerary(packageItineraryId: number) {
  const response = await apiClient.post('/Package/DeleteItinerary', {
    packageItineraryId,
  });
  return response.data;
}

/**
 * Upload images for itinerary day
 */
async uploadItineraryImages(formData: FormData) {
  const response = await apiClient.post('/Package/UploadItineraryImages', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Delete itinerary image
 */
async deleteItineraryImage(imageId: number) {
  const response = await apiClient.post('/Package/DeleteItineraryImage', {
    imageId,
  });
  return response.data;
}

/**
 * Add package inclusion
 */
async createPackageInclusion(data: {
  packageInclusionId: number;
  packageId: number;
  specType: number;
  userId: number;
  description: string;
  sequenceNo: number;
  status: number;
}) {
  const response = await apiClient.post('/Package/PostPackageInclusion', data);
  return response.data;
}

/**
 * Get package inclusions
 */
async getPackageInclusionsList(packageId: number) {
  const response = await apiClient.post('/Package/GetPackageInclusions', {
    packageId,
    companyCode: this.cc,
  });
  return response.data?.data || [];
}

async uploadItineraryImage(data: {
  imageId: number;
  packageItineraryId: number;
  userId: number;
  thumbnailImage: string;
  bigImage: string;
  imageTag: string;
  status: boolean;
  companyCode: string;
}) {
  const response = await apiClient.post('/Package/PostPackageItineraryImage', data);
  return response.data;
}

/**
 * Update inclusion
 */
async updateInclusion(data: {
  id: number;
  description: string;
  isActive: boolean;
  companyCode: string;
}) {
  const response = await apiClient.post('/Package/UpdateInclusion', data);
  return response.data;
}

/**
 * Update exclusion
 */
async updateExclusion(data: {
  id: number;
  description: string;
  isActive: boolean;
  companyCode: string;
}) {
  const response = await apiClient.post('/Package/UpdateExclusion', data);
  return response.data;
}

/**
 * Delete inclusion
 */
async deleteInclusion(id: number) {
  const response = await apiClient.post('/Package/DeleteInclusion', { id });
  return response.data;
}

/**
 * Delete exclusion
 */
async deleteExclusion(id: number) {
  const response = await apiClient.post('/Package/DeleteExclusion', { id });
  return response.data;
}

async getPackageTabList(holidayTypeCodes: string, companyCode: string = this.cc) {
  const response = await apiClient.post('/Package/PackageTabList', {
    holidayTypeCodes,
    companyCode,
  });
  return response.data;
}

/**
 * Get package destinations with images
 * Endpoint: {api/Package/PackageDestination}
 */
async getPackageDestination(packageId: string | number, companyCode: string = this.cc) {
  const response = await apiClient.post('/Package/PackageDestination', {
    packageId,
    companyCode,
  });
  return response.data;
}

/**
 * Create or update package destination
 * Endpoint: {api/Package/PostPackageDestination}
 */
async postPackageDestination(data: {
  destinationId: number;
  packageId: number;
  countryCode: string;
  cityCode: string;
  userId: number;
  factsTypeId: number;
  description: string;
  status: boolean;
  companyCode?: string;
}) {
  const payload = {
    ...data,
    companyCode: data.companyCode || this.cc,
  };
  const response = await apiClient.post('/Package/PostPackageDestination', payload);
  return response.data;
}

/**
 * Delete package destination
 */
async deletePackageDestination(destinationId: number) {
  const response = await apiClient.post('/Package/DeletePackageDestination', {
    destinationId,
    companyCode: this.cc,
  });
  return response.data;
}

/**
 * Upload destination image
 * Endpoint: {api/Package/PostPackageDestinationImage}
 */
async postPackageDestinationImage(data: {
  imageId: number;
  destinationId: number;
  packageId: number;
  userId: number;
  thumbnailImage: string;
  bigImage: string;
  imageTag: string;
  status: boolean;
  companyCode?: string;
}) {
  const payload = {
    ...data,
    companyCode: data.companyCode || this.cc,
  };
  const response = await apiClient.post('/Package/PostPackageDestinationImage', payload);
  return response.data;
}

/**
 * Delete destination image
 */
async deletePackageDestinationImage(imageId: number) {
  const response = await apiClient.post('/Package/DeletePackageDestinationImage', {
    imageId,
    companyCode: this.cc,
  });
  return response.data;
}

// Hotel Mappings
async getPackageHotelMappings(packageId: number): Promise<any> {
  const response = await apiClient.get(
    `/package/${packageId}/hotel-mappings`,
    {
      params: { userId: 1, companyCode: 'SMT' }
    }
  );
  return response.data;
}

async postPackageHotelMapping(payload: any): Promise<any> {
  const response = await apiClient.post('/package/hotel-mapping', payload);
  return response.data;
}

async updatePackageHotelMappingImages(payload: any): Promise<any> {
  const response = await apiClient.post('/package/hotel-mapping/images', payload);
  return response.data;
}

async deletePackageHotelMapping(id: number): Promise<any> {
  const response = await apiClient.delete(`/package/hotel-mapping/${id}`, {
    params: { userId: 1, companyCode: 'SMT' }
  });
  return response.data;
}

}

export const packageService = new PackageService();
export default packageService;