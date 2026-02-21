import { apiClient } from '@/services/api/axios.instance';
import type {
  Package,
  PackageListRequest,
  HolidayCategory,
  HolidayCategoryTypeMapping,
  TabsType,
  FactsType,
  CreatePackageRequest,
  PackageListItem,
  UpdatePackageStatusRequest,
  CreateAndUpdatePackageRequest,
  CreateAndUpdatePackageResponse,
  HolidayType,
  Language,
  City,
  PackageSupplier,
} from './package.models';
import { envConfig } from '@/config';
import { ApiResponse } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: convert a plain object to application/x-www-form-urlencoded string.
// Arrays  → key[0]=val&key[1]=val
// Objects → key[nestedKey]=val
// Booleans → "true" / "false"
// null/undefined → empty string
// ─────────────────────────────────────────────────────────────────────────────
function toFormUrlEncoded(obj: Record<string, unknown>): string {
  const pairs: string[] = [];

  function encode(key: string, value: unknown): void {
    if (value === null || value === undefined) {
      pairs.push(`${encodeURIComponent(key)}=`);
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => encode(`${key}[${i}]`, item));
    } else if (typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([k, v]) =>
        encode(`${key}[${k}]`, v)
      );
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  Object.entries(obj).forEach(([k, v]) => encode(k, v));
  return pairs.join('&');
}

// ─────────────────────────────────────────────────────────────────────────────

class PackageService {
  // ── Package List ────────────────────────────────────────────────────────────
  async getPackageList(params: PackageListRequest): Promise<PackageListItem[]> {
    const today = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(today.getFullYear() + 1);

    const payload = {
      regionId: params.regionId || 0,
      countryIds: params.countryIds || '',
      holidayCategoryCode: params.holidayCategoryCode || '',
      validityFrom: params.validityFrom || today.toISOString().split('T')[0],
      validityTo: params.validityTo || oneYearLater.toISOString().split('T')[0],
      packageName: params.packageName || '',
      companyCode: params.companyCode || 'SMT',
      status: params.status || '',
    };

    const response = await apiClient.post<ApiResponse<PackageListItem[]>>(
      '/Package/PackageList',
      payload
    );
    return response.data.data;
  }

  // ── Holiday Categories ──────────────────────────────────────────────────────
  async getHolidayCategoryList(): Promise<HolidayCategory[]> {
    const response = await apiClient.post<ApiResponse<HolidayCategory[]>>(
      '/Common/HolidayCategoryList',
      { companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  async getLanguageList(): Promise<Language[]> {
    const response = await apiClient.post<ApiResponse<Language[]>>(
      '/Common/LanguageList',
      { companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  async createHolidayCategory(data: Partial<HolidayCategory>): Promise<HolidayCategory> {
    const response = await apiClient.post<ApiResponse<HolidayCategory>>(
      '/Package/CreateHolidayCategory',
      { ...data, companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  async updateHolidayCategory(id: number, data: Partial<HolidayCategory>): Promise<HolidayCategory> {
    const response = await apiClient.post<ApiResponse<HolidayCategory>>(
      '/Package/UpdateHolidayCategory',
      { ...data, id, companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  async deleteHolidayCategory(id: number): Promise<void> {
    await apiClient.post('/Package/DeleteHolidayCategory', {
      id,
      companyCode: envConfig.tenant.companyCode,
    });
  }

  // ── Holiday Category Type Mapping ───────────────────────────────────────────
  async getHolidayCategoryTypeMappingList(): Promise<HolidayCategoryTypeMapping[]> {
    const response = await apiClient.post<ApiResponse<HolidayCategoryTypeMapping[]>>(
      '/Package/HolidayCategoryTypeMappingList',
      { companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  // ── Tabs Type ───────────────────────────────────────────────────────────────
  async getTabsTypeList(): Promise<TabsType[]> {
    const response = await apiClient.post<ApiResponse<TabsType[]>>(
      '/Package/TabsTypeList',
      { companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  async createTabsType(data: Partial<TabsType>): Promise<TabsType> {
    const response = await apiClient.post<ApiResponse<TabsType>>(
      '/Package/CreateTabsType',
      { ...data, companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  async updateTabsType(id: number, data: Partial<TabsType>): Promise<TabsType> {
    const response = await apiClient.post<ApiResponse<TabsType>>(
      '/Package/UpdateTabsType',
      { ...data, offerId: id, companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  async deleteTabsType(id: number): Promise<void> {
    await apiClient.post('/Package/DeleteTabsType', {
      offerId: id,
      companyCode: envConfig.tenant.companyCode,
    });
  }

  // ── Facts Type ──────────────────────────────────────────────────────────────
  async getFactsTypeList(): Promise<FactsType[]> {
    const response = await apiClient.post<ApiResponse<FactsType[]>>(
      '/Package/FactsTypeList',
      { companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  async createFactsType(data: Partial<FactsType>): Promise<FactsType> {
    const response = await apiClient.post<ApiResponse<FactsType>>(
      '/Package/CreateFactsType',
      { ...data, companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  async updateFactsType(id: number, data: Partial<FactsType>): Promise<FactsType> {
    const response = await apiClient.post<ApiResponse<FactsType>>(
      '/Package/UpdateFactsType',
      { ...data, sNo: id, companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  async deleteFactsType(id: number): Promise<void> {
    await apiClient.post('/Package/DeleteFactsType', {
      sNo: id,
      companyCode: envConfig.tenant.companyCode,
    });
  }

  // ── Package Status & Features ───────────────────────────────────────────────
  async updatePackageStatusAndFeatures(data: UpdatePackageStatusRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/Package/UpdateStatusAndTags',
      data
    );
    return response.data.data;
  }

  // ── Holiday Types ───────────────────────────────────────────────────────────
  async getHolidayTypeList(holidayCategoryCode: string): Promise<HolidayType[]> {
    const response = await apiClient.post<ApiResponse<HolidayType[]>>(
      '/Package/HolidayTypeList',
      { companyCode: envConfig.tenant.companyCode, holidayCategoryCode }
    );
    return response.data.data;
  }

  // ── Cities ──────────────────────────────────────────────────────────────────
  async getCitiesList(): Promise<City[]> {
    const response = await apiClient.post<ApiResponse<City[]>>(
      '/Package/DepartureCitiesList',
      { companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  // ── Suppliers ───────────────────────────────────────────────────────────────
  async PackageSuppliersList(): Promise<PackageSupplier[]> {
    const response = await apiClient.post<ApiResponse<PackageSupplier[]>>(
      '/Package/PackageSuppliersList',
      { companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  // ── Create & Update Package ─────────────────────────────────────────────────
  // The API returns 415 for JSON and multipart/form-data.
  // It requires application/x-www-form-urlencoded.
  // ───────────────────────────────────────────────────────────────────────────
  async createAndUpdatePackage(
    data: CreateAndUpdatePackageRequest
  ): Promise<CreateAndUpdatePackageResponse> {
    const response = await apiClient.post<ApiResponse<CreateAndUpdatePackageResponse>>(
      '/Package/CreateAndUpdatePackage',
      data
    );
    return response.data.data;
  }

  // ── createPackage (wizard wrapper) ─────────────────────────────────────────
  // Builds the flat CreateAndUpdatePackageRequest from the multi-step
  // CreatePackageRequest form data, then delegates to createAndUpdatePackage.
  // ───────────────────────────────────────────────────────────────────────────
  async createPackage(
    data: CreatePackageRequest,
    pkgId: number = 0,
    userId: number = 0,
    companyCode: string = envConfig.tenant.companyCode
  ): Promise<CreateAndUpdatePackageResponse> {
    // Map day strings → boolean flags
    const validDays: string[] = (data.validDays as string[]) ?? [];
    const dayFlags = {
      sunday: validDays.includes('Sun'),
      monday: validDays.includes('Mon'),
      tuesday: validDays.includes('Tue'),
      wednesday: validDays.includes('Wed'),
      thursday: validDays.includes('Thu'),
      friday: validDays.includes('Fri'),
      saturday: validDays.includes('Sat'),
    };

    const joinArr = (arr: unknown): string => {
      if (!arr) return '';
      if (Array.isArray(arr)) return arr.join(',');
      return String(arr);
    };

    const payload: CreateAndUpdatePackageRequest = {
      // Region / geo
      regionId: data.regionId ?? 0,
      countryIds: joinArr(data.countryIds),
      cityId: joinArr(data.destinationCityIds),

      // Package identity
      categoryId: data.holidayCategoryCode ?? '',
      holidayType: joinArr(data.holidayTypeIds),
      packageCode: data.packageCode ?? '',
      packageName: data.packageName ?? '',
      departCityList: joinArr(data.departureCityIds),
      supplierId: String(data.supplierId ?? '0'),
      componentType: joinArr(data.packageComponents),
      languageCode: data.languageCode ?? '',
      remarks: data.remarks ?? '',

      // Validity
      tourType: data.tourType ?? 'FIT',
      marketType: data.marketType ?? '',
      days: data.durationDays ?? 1,
      validityFrom: data.validityFrom ?? '',
      validityTo: data.validityTo ?? '',
      bookingFrom: data.bookingFrom ?? '',
      bookingTo: data.bookingTo ?? '',
      ...dayFlags,

      // Booking settings
      bookingType: data.bookingType ?? '1',
      ranking: data.seqNo ?? 0,
      recommended: data.isRecommended ?? false,
      deals: data.isDeals ?? false,
      freesell: data.isFreeSell ?? false,
      menu: false,

      // Descriptions
      shortDesc: data.briefDescription ?? '',
      longDesc: data.fullDescription ?? '',

      // Offer defaults
      offerType: '0',
      offerDesc: '',
      agentCommision: 0,
      commisionTypeInPercent: true,

      // Meta
      status: data.isActive !== false ? 1 : 0,
      actionType: pkgId > 0 ? 'UPDATE' : 'INSERT',
      pkgId: pkgId > 0 ? pkgId : 0,
      userId,
      companyCode,
    };

    return this.createAndUpdatePackage(payload);
  }
}

export const packageService = new PackageService();
export default packageService;