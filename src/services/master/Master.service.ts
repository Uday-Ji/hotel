import { apiClient } from '@/services/api/axios.instance';
import { envConfig } from '@/config';

class MasterService {
  private get cc() {
    return envConfig.tenant.companyCode;
  }

  // ─── Holiday Type ──────────────────────────────────────────────────────────

  async getHolidayTypeList(): Promise<any[]> {
    try {
      const res = await apiClient.post('/Package/HolidayTypeList', {
        companyCode: this.cc,
        holidayCategoryCode: '',
      });
      return res?.data?.data ?? res?.data ?? [];
    } catch {
      return [];
    }
  }

  async createHolidayType(payload: any): Promise<any> {
    const res = await apiClient.post('/Package/CreateHolidayType', {
      ...payload,
      companyCode: this.cc,
    });
    return res?.data;
  }

  async updateHolidayType(id: number | string, payload: any): Promise<any> {
    const res = await apiClient.post('/Package/UpdateHolidayType', {
      ...payload,
      companyCode: this.cc,
      holidayTypeId: id,
    });
    return res?.data;
  }

  async deleteHolidayType(id: number | string): Promise<void> {
    await apiClient.post('/Package/DeleteHolidayType', {
      companyCode: this.cc,
      holidayTypeId: id,
    });
  }

  // ─── Facts Type ────────────────────────────────────────────────────────────

  async getFactsTypeList(): Promise<any[]> {
    try {
      const res = await apiClient.post('/Package/GetFactsTypeList', {
        companyCode: this.cc,
      });
      return res?.data?.data ?? res?.data ?? [];
    } catch {
      return [];
    }
  }

  async createFactsType(payload: any): Promise<any> {
    const res = await apiClient.post('/Package/CreateFactsType', {
      ...payload,
      companyCode: this.cc,
    });
    return res?.data;
  }

  async updateFactsType(id: number | string, payload: any): Promise<any> {
    const res = await apiClient.post('/Package/UpdateFactsType', {
      ...payload,
      companyCode: this.cc,
      factsTypeId: id,
    });
    return res?.data;
  }

  async deleteFactsType(id: number | string): Promise<void> {
    await apiClient.post('/Package/DeleteFactsType', {
      companyCode: this.cc,
      factsTypeId: id,
    });
  }
}

export const masterService = new MasterService();
