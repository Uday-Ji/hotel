import { apiClient } from '@/services/api/axios.instance';
//import type { ApiResponse } from '@/types/api.types';
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

class PackageService {
  // Package List
    async getPackageList(params: PackageListRequest): Promise<PackageListItem[]> {
    // Set default dates if not provided
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

  // Holiday Categories
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

  async updateHolidayCategory(
    id: number,
    data: Partial<HolidayCategory>
  ): Promise<HolidayCategory> {
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

  // Holiday Category Type Mapping
  async getHolidayCategoryTypeMappingList(): Promise<HolidayCategoryTypeMapping[]> {
    const response = await apiClient.post<ApiResponse<HolidayCategoryTypeMapping[]>>(
      '/Package/HolidayCategoryTypeMappingList',
      { companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

  // Tabs Type
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

  // Facts Type
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

  async updatePackageStatusAndFeatures(data: UpdatePackageStatusRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/Package/UpdateStatusAndTags',
      data
    );
    return response.data.data;
  };
  async deleteFactsType(id: number): Promise<void> {
    await apiClient.post('/Package/DeleteFactsType', {
      sNo: id,
      companyCode: envConfig.tenant.companyCode,
    });
  }

  async createAndUpdatePackage(
    data: CreateAndUpdatePackageRequest
  ): Promise<CreateAndUpdatePackageResponse> {
    const response = await apiClient.post<ApiResponse<CreateAndUpdatePackageResponse>>(
      '/Package/CreateAndUpdatePackage',
      data
    );
    return response.data.data;
  }
  
  async getHolidayTypeList(holidayCategoryCode:string): Promise<HolidayType[]> {
    const response = await apiClient.post<ApiResponse<HolidayType[]>>(
      '/Package/HolidayTypeList',
      { companyCode: envConfig.tenant.companyCode, holidayCategoryCode }
    );
    return response.data.data;
  }

  async getCitiesList(): Promise<City[]> {
    const response = await apiClient.post<ApiResponse<City[]>>(
      '/Package/DepartureCitiesList',
      { companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }

    async PackageSuppliersList(): Promise<PackageSupplier[]> {
    const response = await apiClient.post<ApiResponse<PackageSupplier[]>>(
      '/Package/PackageSuppliersList',
      { companyCode: envConfig.tenant.companyCode }
    );
    return response.data.data;
  }
  
  async createPackage(data: CreatePackageRequest): Promise<Package> {
  const formData = new FormData();
  
  // Append all fields
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  const response = await apiClient.post<ApiResponse<Package>>(
    '/Package/CreatePackage',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data.data;
}
}

export const packageService = new PackageService();
export default packageService;